import * as jquery from "./node_modules/jquery/dist/jquery.min.js"

/**
 * @typedef {{ type: "html", name: string, body: DocumentFragment, data: object, parent: JQElement }} JQHTMLElement
 */
/**
 * @typedef {{ type: "custom", name: string, body: DocumentFragment, data: object, parent: JQElement, slots?: JQHTMLElement[] }} JQCustomElement
 */
/**
 * @typedef {{ type: "partial", name: string, parent: null, create: (childElement: JQCustomElement) => JQCustomElement }} JQPartialElement
 */

/**
 * @typedef {(...args: any[]) => JQueryStatic} QueryFunction
 */

/**
 * @typedef {JQHTMLElement | JQCustomElement | JQPartialElement} JQElement
 */

/**
 * @type {JQPartialElement[]}}
 */
const newElements = new Array()

/**
 * @type {JQElement[]}
 */
const elementStack = new Array()

/**
 * @type {JQElement?}
 */
let currentElement = null
/**
 * @type {JQElement | Text | null}
 */
let currentNode = null

const jquire = {
    /**
     * @param {Object<string, JQPartialElement>} partialElmConstructors An object containing custom elements
     * @returns {void}
     * @description Adds all the elements from first argument to newElements array.
     */
    add(partialElmConstructors) {
        for (let partialElmName of Object.keys(partialElmConstructors)) {

            /**
             * @type {JQPartialElement}
             */
            const newPartialElement = Object.create(null)

            newPartialElement.name = partialElmName
            newPartialElement.type = "partial"
            newPartialElement.parent = null

            newPartialElement.create = function (childElement = null) {
                const fragment = document.createDocumentFragment()

                /**
                 * @type {JQCustomElement}
                 */
                const elm = {
                    type: "custom", name: partialElmName, body: fragment, data: childElement.data, parent: childElement.parent
                }

                /**
                 * @type {() => JQPartialElement}
                 */
                const newElmConstructor = arrowFnToRegularFn(partialElmConstructors[partialElmName]).bind(elm)

                if (typeof newElmConstructor != "function")
                    throw new TypeError(`InvalidComponentConstructor: Expected a function instead got ${typeof newElmConstructor}`)

                elementStack.push(elm)
                currentElement = currentNode = elm

                newElmConstructor()
                const slots = elm.slots || []
                for (let slot of slots) {
                    const slotName = slot.body.getAttribute("name")
                    if (slotName) {
                        const slotNodes = []
                        for (let child of childElement.body.childNodes) {
                            if (child.getAttribute?.("slot") === slotName) {
                                slotNodes.push(child.cloneNode(true))
                                child.remove()
                            }
                        }
                        if (slotNodes.length) {
                            const fragment = document.createDocumentFragment()
                            fragment.append(...slotNodes)
                            slot.parent?.body.replaceChild(fragment, slot.body)
                        }
                    } else {
                        const slotNodes = []
                        for (let child of childElement.body.childNodes) {
                            if (!child.getAttribute?.("slot")) {
                                slotNodes.push(child.cloneNode(true))
                                child.remove()
                            }
                        }
                        if (slotNodes.length) {
                            const fragment = document.createDocumentFragment()
                            fragment.append(...slotNodes)
                            slot.parent?.body.replaceChild(fragment, slot.body)
                        }
                    }
                }

                childElement && elm.body.appendChild(childElement.body)

                return elementStack.pop()
            }
            newElements.push(newPartialElement)
        }
    },

    /**
     * @returns {ProxyConstructor new<(strings?: string | null, ...values: string[]) => Text>}
     */
    text() {
        const parentElm = elementStack.slice(-1)?.[0]

        /**
         * @param {string?} strings 
         * @param  {...string} values 
         * @returns {Text}
         */
        const createTextNodeFromArgs = (strings = null, ...values) => {
            const result = [strings[0]]
            values.forEach((value, i) =>
                result.push(value, strings[i + 1]))

            const textNode = document.createTextNode(result.join(''))
            currentNode = textNode
            parentElm && parentElm.body.append(textNode)
            return textNode
        }

        return new Proxy(createTextNodeFromArgs, {
            get(target, prop, reciever) {
                const textNode = document.createTextNode(prop)
                parentElm && parentElm.body.append(textNode)
                currentNode = textNode
                return textNode
            }
        })
    },
    /**
     * 
     * @returns {ProxyConstructor new<JQCustomElement>(target: JQCustomElement, handler: ProxyHandler<JQCustomElement>) => JQCustomElement}
     */
    render() {
        const fragment = document.createDocumentFragment()
        /**
         * @type {JQCustomElement}
         */
        const elm = { type: "custom", name: "render", body: fragment, data: {}, parent: null }

        const _currentElement = currentElement
        currentElement = currentNode = elm
        elementStack.push(elm)

        return new Proxy(elm, {
            get(target, prop, reciever) {
                if (prop in target)
                    return target[prop]

                currentElement = currentNode = _currentElement ?? null

                if (!("tag" in target.data))
                    throw new Error(`NoRenderTarget: The required 'tag' attribute is missing.`)

                if (!(target.data.tag instanceof HTMLElement))
                    throw new TypeError(`InvalidRenderTarget: Expected an HTML element as the value of the 'tag' attribute, instead got '${typeof target.data.tag}'.`)

                elementStack.pop()
                target.data.tag.append(target.body)
                return target.body
            }
        })
    }
}

/**
 * @description Returns a property on the current element
 * @type {ProxyConstructor}
 */
const _self = new Proxy(function (ctx = this) {
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
const _parent = new Proxy(function (ctx = this) {
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
const _parents = new Proxy(function (ctx = this) {
    const getCurrentElm = () => ctx

    return new Proxy(getCurrentElm(), {
        get(target, prop, reciever) {
            /**
             * @param {JQElement} elm 
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
         * @param {JQElement} elm 
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

_.prototype[Symbol.toPrimitive] = function (hint) {
    return ""
}

/**
 * @param {string} elmName 
 * @returns {ProxyConstructor new<JQElement>}
 * @throws Will throw an error if the first argument is not a valid HTML element or a custom element
 * @description Creates an HTML element based on the case of the element name; if the element name is in lower case, create an HTML element else create a custom element.
 */
function createElement(elmName) {
    if (/^[a-z]/.test(elmName))
        return createJQHTMLElement(elmName)
    else if (/^[A-Z]/.test(elmName))
        return createJQCustomElement(elmName)
    else
        throw new Error(`InvalidElement: '${elmName}' - is not a valid HTML Element or a custom element.`)
}

/**
 * @param {string} elmName 
 * @returns {ProxyConstructor new<JQHTMLElement>}
 * @throws Will thow an error if the first argument is not a valid HTML element.
 */
function createJQHTMLElement(elmName) {
    const parentElm = elementStack.slice(-1)?.[0]
    /**
     * @type {JQHTMLElement}
     */
    const elm = {
        type: "html",
        name: elmName,
        body: document.createElement(elmName),
        data: {},
        parent: parentElm ?? null
    }

    if (elm.body instanceof HTMLUnknownElement)
        throw new Error(`InvalidHTMLElement: '${elmName}' is not a valid HTML element.`)

    elementStack.push(elm)
    currentElement = currentNode = elm

    return new Proxy(elm, {
        get(target, prop, reciever) {
            if (prop in target)
                return target[prop]

            const hasOnlyStringBody = elm.body.childNodes?.length == 0 &&
                Object.keys(elm.data).length == 0 &&
                elm.body.attributes.length == 0

            if (hasOnlyStringBody)
                elm.body.append(prop)

            parentElm && parentElm.body.append(elm.body)
            currentElement = currentNode = parentElm ?? null

            if (parentElm && parentElm.type == "custom" && elmName == "slot")
                parentElm.slots = [...(parentElm.slots || []), elm]

            elm.data = createDataAttrProxy(elm)
            return elementStack.pop()
        }
    })
}

/**
 * @param {string} elmName
 * @returns {ProxyConstructor new<JQCustomElement>}
 * @throws Will throw an error if the custom element is not defined.
 */
function createJQCustomElement(elmName) {
    const newElementConstructor = newElements.find(x => x.name == elmName)

    if (!newElementConstructor)
        throw new Error(`NotDefined: Custom element - '${elmName}' is not defined.`)

    const parentElm = elementStack.slice(-1)?.[0]

    /**
     * @type {JQCustomElement}
     */
    let newElement = {
        type: "custom",
        name: elmName,
        body: new DocumentFragment(),
        data: {},
        parent: parentElm ?? null
    }

    elementStack.push(newElement)
    currentElement = currentNode = newElement

    return new Proxy(newElement, {
        get(target, prop, reciever) {
            if (prop in target)
                return target[prop]

            newElement = newElementConstructor.create(newElement)

            const hasOnlyStringBody = newElement.body.childNodes?.length == 0 &&
                Object.keys(newElement.data).length == 0

            if (hasOnlyStringBody)
                newElement.body.append(prop)

            parentElm && parentElm.body.append(newElement.body)
            currentElement = currentNode = parentElm ?? null

            newElement.data = createDataAttrProxy(newElement)
            return elementStack.pop()
        }
    })
}

/**
 * @param {string} attr
 * @param {JQElement} elm
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
 * @param {{attrName: string, attrObj: Attr}}
 * @param {JQHTMLElement} elm
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
 * @param {JQElement} elm
 * @param {any} defVal
 * @returns {object}
 * @throws Will throw an error if the attribute is not a valid html attribute.
 */
function createDataAttribute(attr, elm, defVal = null) {
    const attrCamelCase = toCamelCase(attr)
    if (elm.type == "html") {
        const isPrimitive = typeof ["string", "boolean", "number", "bigint"].includes(defVal)
        const isNullish = [undefined, null].includes(defVal)
        if (isNullish || isPrimitive)
            elm.body.dataset[attrCamelCase] = defVal.toString()
        elm.data[attrCamelCase] = typeof defVal == "function" ?
            arrowFnToRegularFn(defVal).bind(elm) : defVal
    }
    else if (["custom", "partial"].includes(elm.type)) {
        elm.data[attrCamelCase] = typeof defVal == "function" ?
            arrowFnToRegularFn(defVal).bind(elm) : defVal
    }
    return elm.data
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
        const hasBlockFnBody = fnBody[0].trim().startsWith("{")
        _callback = eval("(function" + (!isParamsInParantheses ? "(" : "") +
            fnParams + (!isParamsInParantheses ? ")" : "") +
            (!hasBlockFnBody ? "{ return" : "") + fnBody.join("=>") +
            (!hasBlockFnBody ? "}" : "") + ")")
    }
    return _callback
}

/**
 * @param {QueryFunction} target 
 * @param {string} prop 
 * @param {QueryFunction} reciever 
 * @returns {JQHTMLElement | function | ProxyConstructor}
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
 * @param {object} target 
 * @param {string} prop
 * @param {object} reciever
 * @returns {void}
 * @throws Throws an error when accessing an attribute ourtside of an element.
 */

function handleAttrProxyPropAccess(target, prop, reciever) {
    if (prop == "prototype")
        return Object.getPrototypeOf(target)
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
 * @param {JQElement} elm 
 * @returns {ProxyConstructor new<object>}
 */
function createDataAttrProxy(elm) {
    return new Proxy(elm.data, {
        set(target, prop, value) {
            if (!prop in target)
                throw new ReferenceError(`Data attribute '${prop}' not defined on the element '${elm.name}'`)

            { // same as createDataAttribute(attr, elm, defVal = null)
                const attrCamelCase = toCamelCase(prop)
                if (elm.type == "html") {
                    const isPrimitive = typeof ["string", "boolean", "number", "bigint"].includes(value)
                    const isNullish = [undefined, null].includes(value)
                    if (isNullish || isPrimitive)
                        elm.body.dataset[attrCamelCase] = value.toString()
                    target[attrCamelCase] = typeof value == "function" ?
                        arrowFnToRegularFn(value).bind(elm) : value
                }
                else if (["custom", "partial"].includes(elm.type)) {
                    target[attrCamelCase] = typeof value == "function" ?
                        arrowFnToRegularFn(value).bind(elm) : value
                }
                return elm.data
            }
        }
    })
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
