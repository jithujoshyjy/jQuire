import * as jquery from "./node_modules/jquery/dist/jquery.min.js"

/**
 * @typedef {{ name: string, create: () => { type: "custom", name: string, body: DocumentFragment, data: object } }} CustomElement
 */

/**
 * @typedef {(...args: any[]) => JQueryStatic} QueryFunction
 */

/**
 * @typedef {{ type: "html" | "custom" | "custom-constructor" | "partial", body: HTMLElement | CustomElement | DocumentFragment, data: object, name?: string, parent: JqElement | null}} JqElement
 */

/**
 * @type {Array<{ name: string, create: () => ProxyConstructor>}}
 */
const newElements = new Array()

/**
 * @type {Array<JqElement>}
 */
const elementStack = new Array()

/**
 * @type {JqElement?}
 */
let currentElement = null

const jquire = {
    /**
     * @param {Object<string, { type: "partial", body: DocumentFragment, data: object }>} newElmsObj An object containing custom elements
     * @returns {void}
     * @description Adds all the elements from first argument to newElements array.
     */
    add(newElmsObj) {
        for (let key of Object.keys(newElmsObj)) {

            const _newElmObj = Object.create(null)
            _newElmObj.name = key
            _newElmObj.type = "custom-constructor"
            _newElmObj.parent = null
            _newElmObj.create = function () {
                const fragment = newElmsObj[key].body
                const defaultData = newElmsObj[key].data
                const parentElm = elementStack.slice(-1)?.[0]
                const elm = {
                    type: "custom", name: key, body: fragment, data: { ...defaultData }, parent: parentElm ?? null
                }
                currentElement = elm

                return elm
            }
            newElements.push(_newElmObj)
        }
    },
    /**
     * @returns {ProxyConstructor} A proxy that'll intercept all property access
     * @description Creates a new custom element
     */
    new() {
        const fragment = document.createDocumentFragment()
        const elm = { type: "partial", body: fragment, data: {}, parent: null }

        elementStack.push(elm)
        const _currentElement = currentElement
        currentElement = elm

        return new Proxy(elm, {
            get(target, prop, reciever) {
                if (prop in target)
                    return target[prop]

                currentElement = _currentElement ?? null
                return elementStack.pop()
            }
        })
    },
    text() {
        const parentElm = elementStack.slice(-1)?.[0]

        return new Proxy({}, {
            get(target, prop, reciever) {
                const textNode = document.createTextNode(prop)
                parentElm.body.append(textNode)
                return textNode
            }
        })
    },
    render() {
        const fragment = document.createDocumentFragment()
        const elm = { type: "custom", name: "render", body: fragment, data: {}, parent: null }
        const _currentElement = currentElement
        currentElement = elm
        elementStack.push(elm)

        return new Proxy(elm, {
            get(target, prop, reciever) {
                if (prop in target)
                    return target[prop]

                currentElement = _currentElement ?? null

                if (!("tag" in target.data))
                    throw new Error(`NoRenderTarget: The required 'tag' attribute is missing.`)

                if (!(target.data.tag instanceof HTMLElement))
                    throw new TypeError(`InvalidRenderTarget: Expected an HTML element as the value of the 'tag' attribute, instead got '${typeof target.data.tag}'.`)

                elementStack.pop()
                target.data.tag.append(target.body)
                return target.body
            }
        })
    },
}

/**
 * @description Returns a property on the current element
 * @type {ProxyConstructor}
 */
const _self = new Proxy(function (ctx=this) {
    return ctx.data
}, {
    get(target, prop, reciever) {
        return currentElement.data[prop]
    }
})

/**
 * @description returns a property on the immediate parent elements
 * @type {ProxyConstructor}
 */
const _parent = new Proxy(function (ctx=this) {
    return ctx.parent?.data ?? {}
}, {
    get(target, prop, reciever) {
        return currentElement.parent?.data?.[prop]
    }
})

/**
 * @description returns a property on any of the parent elements
 * @type {ProxyConstructor}
 */
const _parents = new Proxy(function (ctx=this) {
    const getCurrentElm = () => ctx
    
    return new Proxy(getCurrentElm(), {
        get(target, prop, reciever) {
            /**
             * @param {JqElement} elm 
             * @param {string} prop 
             * @returns 
             */
            const getProp = (elm, prop) => elm.data[prop] !== undefined ?
                elm.data[prop] : (elm.parent !== null ? getProp(elm.parent, prop) : undefined)
            return getProp(target, prop)
        }
    })
}, {
    get(target, prop, reciever) {
        /**
         * @param {JqElement} elm 
         * @param {string} prop 
         * @returns 
         */
        const getProp = (elm, prop) => elm.data[prop] !== undefined ?
            elm.data[prop] : (elm.parent !== null ? getProp(elm.parent, prop) : undefined)
        return getProp(currentElement, prop)
    }
})

/**
 * @type {QueryFunction}
 */
const query = (...args) => jquery(...args)

const $ = new Proxy(query, {
    get: handleElmProxyPropAccess
})

const _ = new Proxy({}, {
    set: handleAttrProxyPropAssign,
    get: handleAttrProxyPropAccess
})

/**
 * @param {string} elmName 
 * @returns {JqElement}
 * @throws Will throw an error if the first argument is not a valid HTML element or a custom element
 * @description Creates an HTML element based on the case of the element name; if the element name is in lower case, create an HTML element else create a custom element.
 */
function createElement(elmName) {
    if (/^[a-z]/.test(elmName))
        return createHTMLElement(elmName)
    else if (/^[A-Z]/.test(elmName))
        return createCustomElement(elmName)
    else
        throw new Error(`InvalidElement: '${elmName}' - is not a valid HTML Element or a custom element.`)
}

/**
 * @param {string} elmName 
 * @returns {ProxyConstructor}
 * @throws Will thow an error if the first argument is not a valid HTML element.
 */
function createHTMLElement(elmName) {
    const elm = { type: "html", body: document.createElement(elmName), data: {} }
    if (elm.body instanceof HTMLUnknownElement)
        throw new Error(`InvalidHTMLElement: '${elmName}' is not a valid HTML element.`)

    const parentElm = elementStack.slice(-1)?.[0]
    elm.parent = parentElm ?? null
    elementStack.push(elm)
    currentElement = elm

    return new Proxy(elm, {
        get(target, prop, reciever) {
            if (prop in target)
                return target[prop]

            parentElm && parentElm.body.append(elm.body)
            currentElement = parentElm ?? null

            if (elementStack.length > 1)
                return elementStack.pop()
            return target
        }
    })
}

/**
 * @param {string} elmName
 * @returns {{ type: "custom", body: ProxyConstructor }}
 * @throws Will throw an error if the custom element is not defined.
 */
function createCustomElement(elmName) {
    const newElementConstructor = newElements.find(x => x.name == elmName)

    if (!newElementConstructor)
        throw new Error(`NotDefined: Custom element - '${elmName}' is not defined.`)

    const newElement = newElementConstructor.create()
    const parentElm = elementStack.slice(-1)?.[0]
    newElement.parent = parentElm ?? null

    elementStack.push(newElement)
    currentElement = newElement

    return new Proxy(newElement, {
        get(target, prop, reciever) {
            if (prop in target)
                return target[prop]

            parentElm && parentElm.body.append(newElement.body)
            currentElement = parentElm ?? null

            if (elementStack.length > 1)
                return elementStack.pop()

            return target
        }
    })
}

/**
 * @param {string} attr
 * @param {JqElement} elm
 * @param {any} defVal
 * @returns {void}
 * @throws Will throw an error if the attribute name contains invalid characters.
 */
function createAttribute(attr, elm, defVal = null) {
    const attrObj = document.createAttribute(attr) // this might throw an error
    if (elm.type == "html") {
        if (attr.startsWith("on"))
            return createEventHandler(attr, elm, defVal)
        return createHTMLAttribute({ attrName: attr, attrObj }, elm, defVal ?? "")
    }
    if (["custom", "partial"].includes(elm.type)) {
        return createDataAttribute(attr, elm, defVal)
    }
}

/**
 * @param {Attr} attr
 * @param {HTMLElement} elm
 * @param {any} defVal
 * @returns {void}
 * @throws Will throw an error if the attribute is not a valid html attribute.
 */
function createHTMLAttribute({ attrName, attrObj }, elm, defVal = "") {
    if (/[^a-z]/g.test(attrName)) {
        if (/[A-Z\-\_]/g.test(attrName))
            return createDataAttribute(attrName, elm, defVal)
        throw new Error(`InvalidAttribute: The attribute '${attrName}' is not a valid html attribute.`)
    }
    elm.body.setAttributeNode(attrObj)
    elm.body.setAttribute(attrName, defVal)
}

/**
 * @param {string} attr
 * @param {JqElement} elm
 * @param {any} defVal
 * @returns {void}
 * @throws Will throw an error if the attribute is not a valid html attribute.
 */
function createDataAttribute(attr, elm, defVal = null) {
    const attrKebabCase = toKebabCase(attr)
    const attrCamelCase = toCamelCase(attrKebabCase)
    if (elm.type == "html") {
        elm.body.dataset[attrCamelCase] = defVal.toString()
        elm.data[attrCamelCase] = typeof defVal == "function" ?
            arrowFnToRegularFn(defVal).bind(elm) : defVal
    }
    else if (["custom", "partial"].includes(elm.type)) {
        elm.data[attrCamelCase] = typeof defVal == "function" ?
            arrowFnToRegularFn(defVal).bind(elm) : defVal
    }
}

/**
 * @param {string} attr
 * @param {HTMLElement} elm
 * @param {(x: Event) => void} callback
 * @returns {void}
 * @throws Will throw an error if the attribute is not a valid html attribute.
 */
function createEventHandler(attr, elm, callback) {
    const event = attr.slice(2)
    if (typeof callback != "function")
        throw new TypeError(`Expeted a function as event handler callback but got '${typeof callback}' instead.`)

    let _callback = arrowFnToRegularFn(callback).bind(elm)
    elm.body.addEventListener(event, _callback)
}

/**
 * @param {function} callback 
 * @returns {function}
 */
function arrowFnToRegularFn(callback) {
    let _callback = callback
    const stringifiedCallback = callback.toString()
    const isArrowFn = !stringifiedCallback.trim().startsWith("function")
    if (isArrowFn) {
        const isParamsInParantheses = stringifiedCallback.trim().startsWith("(")
        const [fnParams, ...fnBody] = stringifiedCallback.split("=>")
        _callback = eval("(function" + (!isParamsInParantheses ? "(" : "") + fnParams + (!isParamsInParantheses ? ")" : "") + "{" + fnBody.join("=>") + "})")
    }
    return _callback
}

/**
 * @param {QueryFunction} target 
 * @param {string} prop 
 * @param {QueryFunction} reciever 
 * @returns {HTMLElement | function | ProxyConstructor}
 */

function handleElmProxyPropAccess(target, prop, reciever) {
    if (!(prop in jquire))
        return createElement(prop)
    if (prop == "new")
        return jquire.new()
    if (prop == "text")
        return jquire.text()
    if (prop == "render")
        return jquire.render()
    if (typeof jquire[prop] == "function")
        return jquire[prop]
}

/**
 * @param {Object} target 
 * @param {string} prop
 * @param {Object} reciever
 * @returns {void}
 * @throws Throws an error when accessing an attribute ourtside of an element.
 */

function handleAttrProxyPropAccess(target, prop, reciever) {
    if (!currentElement)
        throw new Error(`OutOfScopeAttribute: Attribute '${prop}' cannot be accessed outside an element`)
    return currentElement.data[prop]
}

/**
 * @param {object} target 
 * @param {string} prop
 * @param {string} value
 * @returns {void}
 */

function handleAttrProxyPropAssign(target, prop, value) {
    if (!currentElement)
        throw new Error(`OutOfScopeAttribute: Attribute '${prop}' cannot be accessed outside an element`)
    return createAttribute(prop, currentElement, value) || true
}

/**
 * @param {string} str 
 * @returns {string}
 */

function toKebabCase(str) {
    let _str = str
    if (str.includes("_") && !str.includes("-")) // handle snake_case
        _str = str.replace(/_/g, "-")
    else if (!str.includes("-") && !/[A-Z]/g.test(str)) // handle camelCase and other similar cases
        _str = str.replace(/^./, x => x.toLowerCase())
            .replace(/[A-Z]/g, x => "-" + x.toLowerCase())
    return _str.toLowerCase()
}

/**
 * @param {string} str 
 * @returns {string}
 */

function toCamelCase(str) {
    let _str = str
    if (/[A-Z]/g.test(str))
        _str = str.toLowerCase()
    else if (str.includes("-")) // handle kebab-case
        _str = str.split("-").map(x => x.toLowerCase()
            .replace(/^./, x => x.toUpperCase())).join("")
            .replace(/^./, x => x.toLowerCase())
    else if (str.includes("_")) // handle snake_case
        _str = str.split("_").map(x => x.toLowerCase()
            .replace(/^./, x => x.toUpperCase())).join("")
            .replace(/^./, x => x.toLowerCase())
    return _str
}

export { $, _, _self, _parent, _parents }
