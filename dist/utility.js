var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _JqAnimation_parameters, _JqAttribute_name, _JqAttribute_value;
/**
 *
 * @param {string} rootPath
 * @returns {(relativePath: string) => string}
 */
export function pathSetter(rootPath) {
    return function (relativePath) {
        return rootPath.replace(/\/\s*$/, '') + '/' +
            relativePath.replace(/^(?:\s*\.)?\s*\//, '');
    };
}
export function isPrimitive(test) {
    return test !== Object(test);
}
const isJqElement = (...xs) => xs.every(x => x instanceof JqElement);
const isJqAttribute = (...xs) => xs.every(x => x instanceof JqAttribute);
const isJqFragment = (...xs) => xs.every(x => x instanceof JqFragment);
const isJqText = (...xs) => xs.every(x => x instanceof JqText);
const CREATED = Symbol("created");
const UPDATED = Symbol("updated");
const DELETED = Symbol("deleted");
const UNCHANGED = Symbol("unchanged");
const getJqNodeConstructors = () => [JqElement, JqAttribute, JqCSSProperty, JqCSSRule, JqAnimation, JqEvent, JqReference, JqFragment, JqText];
export const throwError = (e) => { throw new Error(e); };
export const JqNodeReference = Symbol("JqNodeReference");
/**
 *
 * @param {Array<JqNode | Primitive>} nodes
 * @returns {{
 *		childNodes: Array<JqElement | JqFragment | JqText>,
 *		attributes: JqAttribute[],
 *		events: JqEvent[], references: JqReference[],
 *		animations: JqAnimation[], inlineStyles: JqCSSProperty[],
 *		blockStyles: JqCSSRule[], callbacks: JqCallback[]
 * }}
 */
export function getNodes(nodes) {
    const childNodes = [];
    const attributes = [];
    const events = [];
    const references = [];
    const animations = [];
    const callbacks = [];
    const inlineStyles = [];
    const blockStyles = [];
    const childNodeClasses = [JqElement, JqFragment, JqText];
    for (const [i, node] of nodes.entries()) {
        if (childNodeClasses.some(childNodeClass => node instanceof childNodeClass)) {
            const _node = node;
            _node.nodePosition = i;
            childNodes.push(_node);
        }
        else if (node instanceof JqAttribute) {
            node.nodePosition = i;
            attributes.push(node);
        }
        else if (node instanceof JqList && node.nodeClass === JqAttribute) {
            node.nodes.forEach((attribute) => {
                attribute.nodePosition = i;
                attributes.push(attribute);
            });
        }
        else if (node instanceof JqEvent) {
            node.nodePosition = i;
            events.push(node);
        }
        else if (node instanceof JqReference) {
            const _node = node[JqNodeReference];
            _node.nodePosition = i;
            references.push(_node);
        }
        else if (node instanceof JqAnimation) {
            node.nodePosition = i;
            animations.push(node);
        }
        else if (node instanceof JqCSSProperty) {
            node.nodePosition = i;
            inlineStyles.push(node);
        }
        else if (node instanceof JqCSSRule) {
            node.nodePosition = i;
            blockStyles.push(node);
        }
        else if (Array.isArray(node)) {
            const _node = convertToJqNode(node, null);
            _node.nodePosition = i;
            childNodes.push(_node);
        }
        else if (typeof node == "function") {
            const _node = convertToJqNode(node, null);
            _node.nodePosition = i;
            callbacks.push(_node);
        }
        else if (isPrimitive(node)) {
            const _node = convertToJqNode(node, null);
            _node.nodePosition = i;
            childNodes.push(_node);
        }
    }
    return {
        childNodes, attributes,
        events, references,
        animations, inlineStyles,
        blockStyles, callbacks
    };
}
export function convertToJqNode(value, jqNode) {
    const convertToJqText = (value) => {
        const jqText = new JqText(value ?? '');
        jqText.jqParent = jqNode;
        return jqText;
    };
    const convertToJqCallback = (value) => {
        const jqCallback = new JqCallback(value);
        jqCallback.jqParent = jqNode;
        return jqCallback;
    };
    const convertToJqFragment = (value) => {
        const childNodes = value.map(x => convertToJqNode(x, null));
        const jqFragment = new JqFragment(childNodes);
        childNodes.forEach((childNode, i) => {
            childNode.jqParent = jqFragment;
            childNode.nodePosition = i;
        });
        jqFragment.jqParent = jqNode;
        return jqFragment;
    };
    if (Array.isArray(value))
        return convertToJqFragment(value);
    if (isPrimitive(value))
        return convertToJqText(value);
    if (typeof value == "function")
        return convertToJqCallback(value);
    if (getJqNodeConstructors().some(ctor => value instanceof ctor))
        return value;
    return throwError(`JqError - Unexpected value found in place of a JqNode`);
}
const getPropertyValue = (object, props) => {
    let result = object;
    for (let i = 0; i < props.length; i++) {
        result = result?.[props[i]];
        if (isNullish(result))
            return result;
    }
    return result;
};
/**
 * @param {string} text
 * @returns {string}
 */
export function escapeHTMLEntities(text) {
    const entityRegex1 = /(&#x[0-9A-F]{2,6};)/gi;
    const entityRegex2 = /(&[a-z0-9]+;)/gi;
    const replacer = (t, e) => new DOMParser().parseFromString(e, "text/html").documentElement.textContent ?? '';
    const _text = text.replace(entityRegex1, replacer)
        .replace(entityRegex2, replacer);
    return _text;
}
export function stringify(value) {
    return isPrimitive(value) ? String(value ?? '') : JSON.stringify(value);
}
export function isNullish(value) {
    return value === null || value === undefined;
}
export class JqCallback {
    constructor(callback) {
        this.nodePosition = -1;
        this.jqParent = null;
        this.returned = null;
        this.callback = (_) => null;
        this.refProxy = new Proxy({ context: this }, {
            get(target, prop) {
                return target.context.jqParent?.getStateRefValue(prop);
            },
            set(target, prop, value) {
                target.context.jqParent?.setStateRefValue(prop, value);
                return true;
            }
        });
        this.update = {
            context: this,
            updateCallback() {
                const jqCallback = this.context;
                if (jqCallback.returned === null)
                    return this;
                const oldNode = jqCallback.returned;
                const newNode = jqCallback.invoke();
                const rootNode = oldNode, parentNode = oldNode;
                reconcile(rootNode, parentNode, oldNode, newNode);
                return this;
                function reconcile(rootNode, parentNode, oldNode, newNode) {
                    const _diff = diff(oldNode, newNode);
                    const node1 = _diff.node1;
                    const node2 = _diff.node2;
                    const updatedChanges = _diff[UPDATED];
                    const createdChanges = _diff[CREATED];
                    const deletedChanges = _diff[DELETED];
                    for (const [firstProp, ...nestedProps] of updatedChanges) {
                        if (isJqText(node1, node2)) {
                            if (firstProp == "text")
                                updateText(_diff, [firstProp, ...nestedProps]);
                        }
                        else if (isJqAttribute(node1, node2)) {
                            if (firstProp == "value")
                                updateAttribute(_diff, [firstProp, ...nestedProps]);
                        }
                        else if (isJqFragment(node1, node2)) {
                        }
                        else if (isJqElement(node1, node2)) {
                        }
                    }
                    for (const [firstProp, ...nestedProps] of createdChanges) {
                        if (isJqText(node1, node2)) {
                        }
                        else if (isJqAttribute(node1, node2)) {
                        }
                        else if (isJqFragment(node1, node2)) {
                            if (firstProp == "childNodes")
                                createFragment(_diff, [firstProp, ...nestedProps]);
                        }
                        else if (isJqElement(node1, node2)) {
                            if (firstProp == "childNodes")
                                createElement(_diff, [firstProp, ...nestedProps]);
                        }
                    }
                    for (const [firstProp, ...nestedProps] of deletedChanges) {
                        if (isJqFragment(node1, node2)) {
                            deleteJqFragmentChild(_diff, [firstProp, ...nestedProps]);
                        }
                        else if (isJqElement(node1, node2)) {
                            deleteJqElementChild(_diff, [firstProp, ...nestedProps]);
                        }
                        else {
                            node1.delete.deleteSelf();
                        }
                    }
                    // if ([updatedChanges.length, createdChanges.length, deletedChanges.length].every(x => x == 0)) {
                    for (const childDiff of _diff.childDiffs)
                        reconcile(rootNode, _diff.node1, childDiff.node1, childDiff.node2);
                    // }
                }
                function updateAttribute(diff, props) {
                    if (![diff.node1, diff.node2].every(node => node instanceof JqAttribute))
                        return this;
                    const _node1 = diff.node1;
                    const _node2 = diff.node2;
                    return _node1.update.setAttribute(_node2.value);
                }
                function updateText(diff, props) {
                    if (![diff.node1, diff.node2].every(node => node instanceof JqText))
                        return this;
                    const _node1 = diff.node1;
                    const _node2 = diff.node2;
                    _node1.update.setText(_node2.text);
                }
                function createElement(diff, [firstProp, _childNode]) {
                    if (![diff.node1, diff.node2].every(node => node instanceof JqElement))
                        return this;
                    const _node1 = diff.node1;
                    const _node2 = diff.node2;
                    const childNode = _childNode;
                    childNode.jqParent = _node1.jqParent;
                    childNode.nodePosition = _node1.childNodes.length;
                    _node1.childNodes.splice(_node1.childNodes.length, 0, childNode);
                    childNode.attachTo(_node1);
                    return this;
                }
                function createFragment(diff, [firstProp, _childNode]) {
                    if (![diff.node1, diff.node2].every(node => node instanceof JqFragment))
                        return this;
                    const _node1 = diff.node1;
                    const _node2 = diff.node2;
                    const childNode = _childNode;
                    childNode.jqParent = _node1.jqParent;
                    childNode.nodePosition = _node1.childNodes.length;
                    _node1.childNodes.splice(_node1.childNodes.length, 0, childNode);
                    childNode.attachTo(_node1);
                    return this;
                }
                function deleteJqFragmentChild(diff, [firstProp, _childNode]) {
                    const _node1 = diff.node1;
                    const _node2 = diff.node2;
                    const childNode = _childNode;
                    childNode.delete.deleteSelf();
                }
                function deleteJqElementChild(diff, [firstProp, _childNode]) {
                    const _node1 = diff.node1;
                    const _node2 = diff.node2;
                    const childNode = _childNode;
                    childNode.delete.deleteSelf();
                }
            }
        };
        this.callback = callback;
    }
    invoke() {
        const returned = this.callback(this.refProxy);
        const node = Array.isArray(returned) || isPrimitive(returned)
            ? convertToJqNode(returned, this.jqParent)
            : returned;
        node.nodePosition = this.nodePosition;
        node.jqParent = this.jqParent;
        return node;
    }
    attachTo(node) {
        if (node instanceof HTMLElement) {
            const childNode = this.invoke();
            childNode.attachTo(node);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node;
            this.returned = this.invoke();
            this.returned.attachTo(node);
        }
        else {
            throw new Error(`JqError - Cannot attach JqCallback to a node not of instance JqElement or JqText or JqFragment or HTMLElement`);
        }
        return this;
    }
}
export class JqEvent {
    constructor(event, handler) {
        this.nodePosition = -1;
        this.handler = (_) => { };
        this.jqParent = null;
        this.event = event;
        this.handler = handler;
    }
    attachHandler(element) {
        element.addEventListener(this.event, this.handler);
    }
    detachHandler(element) {
        element.removeEventListener(this.event, this.handler);
    }
    attachTo(node) {
        if (node instanceof HTMLElement) {
            this.attachHandler(node);
        }
        else if (node instanceof JqElement) {
            this.attachHandler(node.htmlNode);
        }
        else {
            throw new Error(`JqError - Cannot attach JqEvent '${this.event}' to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
}
export const ElementReference = Symbol("ElementReference");
export const StateReference = Symbol("StateReference");
export class JqReference {
    constructor(state = {}) {
        this[_a] = null;
        this.nodePosition = -1;
        this.jqParent = null;
        this.attachTo = (node) => {
            if (node instanceof HTMLElement) {
                this[ElementReference] = node;
            }
            else if (node instanceof JqElement) {
                this.jqParent = node;
                this[ElementReference] = node.htmlNode;
            }
            else {
                throw new Error(`JqError - Cannot attach JqReference to a node not of instance JqElement or JqFragment or HTMLElement`);
            }
            return this;
        };
        this.deref = () => {
            return this[ElementReference];
        };
        this.refresh = async (callback) => {
            const result = await callback(this[StateReference]);
            this.jqParent.update.updateNode();
            return result;
        };
        this[StateReference] = state;
    }
}
_a = ElementReference;
export class JqAnimation {
    constructor(...parameters) {
        this.domAnimation = null;
        this.nodePosition = -1;
        _JqAnimation_parameters.set(this, void 0);
        this.jqParent = null;
        __classPrivateFieldSet(this, _JqAnimation_parameters, parameters, "f");
    }
    attachTo(node) {
        if (node instanceof HTMLElement) {
            this.animate(node);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node;
            this.animate(node.htmlNode);
        }
        else {
            throw new Error(`JqError - Cannot attach JqAnimation to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
    animate(element) {
        const [_styles, _options, ..._moreOptions] = __classPrivateFieldGet(this, _JqAnimation_parameters, "f");
        const setStartStyles = (styles, ..._) => {
            const styleNames = Object.keys(styles).filter(styleName => !Array.isArray(styles[styleName]));
            const _styles = styleNames.map(styleName => {
                const finalStyleValue = styles[styleName];
                const initialStyleValue = getComputedStyle(element).getPropertyValue(styleName);
                return [styleName, [initialStyleValue, finalStyleValue]];
            });
            const x = { ...styles, ...Object.fromEntries(_styles) };
            return x;
        };
        let callback = null;
        let options = (isPrimitive(_options) ? null : _options);
        options ?? (options = (() => {
            const [speed, easing, _callback] = [_options, ..._moreOptions];
            if (_callback)
                callback = _callback;
            const option = {
                duration: speed ?? 400,
                easing: easing ?? "linear",
                fill: "forwards"
            };
            return option;
        })());
        const __styles = (Array.isArray(_styles)
            ? _styles.map(x => x instanceof Map ? Object.fromEntries(x) : x)
            : _styles instanceof Map ? Object.fromEntries(_styles) : _styles);
        const styles = (Array.isArray(__styles)
            ? __styles.map(setStartStyles)
            : setStartStyles(__styles));
        this.domAnimation = element.animate(styles, options);
        callback && this.domAnimation.addEventListener("finish", callback);
        return this.domAnimation;
    }
}
_JqAnimation_parameters = new WeakMap();
export class JqCSSProperty {
    constructor(name, value) {
        this.nodePosition = -1;
        this.jqParent = null;
        this.name = camelToKebab(name).replace(/_/g, '-');
        this.value = String(value);
    }
    attachTo(node) {
        if (node instanceof HTMLElement) {
            node.style.setProperty(this.name, this.value);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node;
        }
        else {
            throw new Error(`JqError - Cannot attach JqCSS.Property to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
    toString(indent = 1) {
        return `${this.name}: ${this.value};`;
    }
}
export class JqCSSRule {
    constructor([ruleName, ...ruleArgs], ...styleNodes) {
        this.nodePosition = -1;
        this.body = [];
        this.jqParent = null;
        this.head = [ruleName, ...ruleArgs];
        const errorMessage = `JqError - Invalid argument passed to ${this.head.join(' ').trim()}(...)`;
        this.body = styleNodes.flatMap(styleNode => styleNode instanceof JqCSSProperty || styleNode instanceof JqCSSRule
            ? styleNode
            : createPropertyListFromStyleObject(errorMessage, styleNode).nodes);
    }
    attachTo(node) {
        if (node instanceof HTMLElement) {
            // node.style.setProperty(this.name, this.value)
        }
        else if (node instanceof JqElement) {
            this.jqParent = node;
        }
        else {
            throw new Error(`JqError - Cannot attach JqCSS.Rule to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
    toString(indent = 1) {
        const space = '\t'.repeat(indent);
        let head = this.head.join(' ').trim();
        return `${head} {\n${space}${this.body.map(styleNode => styleNode.toString(indent + 1)).join('\n' + space)}\n${'\t'.repeat(indent - 1)}}`;
    }
}
class JqAttribute {
    constructor(name, value) {
        _JqAttribute_name.set(this, '');
        _JqAttribute_value.set(this, '');
        this.nodePosition = -1;
        this.attrNode = null;
        this.jqParent = null;
        this.initial = {
            context: this,
            createNode() {
                const jqAttribute = this.context;
                jqAttribute.attrNode = document.createAttribute(jqAttribute.name);
                jqAttribute.attrNode.value = jqAttribute.value;
                return this;
            }
        };
        this.update = {
            context: this,
            updateAttribute() {
                const jqAttribute = this.context;
                jqAttribute.attrNode.value = jqAttribute.value;
                return this;
            },
            setAttribute(value) {
                const jqAttribute = this.context;
                if (value === jqAttribute.value)
                    return this;
                jqAttribute.value = value;
                jqAttribute.attrNode.value = value;
                return this;
            }
        };
        this.delete = {
            context: this,
            deleteSelf() {
                const jqAttribute = this.context;
                const jqElement = jqAttribute.jqParent;
                if (!jqElement)
                    return this;
                jqElement.delete.removeAttribute(jqAttribute);
                jqAttribute.attrNode = null;
                return this;
            }
        };
        this.name = camelToKebab(name).replace(/_/g, '-');
        this.value = value;
    }
    get name() {
        return __classPrivateFieldGet(this, _JqAttribute_name, "f");
    }
    set name(attrName) {
        __classPrivateFieldSet(this, _JqAttribute_name, attrName, "f");
    }
    get value() {
        return __classPrivateFieldGet(this, _JqAttribute_value, "f");
    }
    set value(attrValue) {
        __classPrivateFieldSet(this, _JqAttribute_value, attrValue, "f");
    }
    attachTo(node) {
        this.initial.createNode();
        if (node instanceof HTMLElement) {
            node.setAttributeNode(this.attrNode);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node;
            node.htmlNode.setAttributeNode(this.attrNode);
        }
        else {
            throw new Error(`JqError - Cannot attach JqAttribute '${this.name}' to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
    static objectToJqAttributes(attrObj) {
        const errorMessage = `JqError - Invalid argument passed to attr(...)`;
        if (attrObj === null || typeof attrObj !== "object")
            throw new Error(errorMessage);
        const attrList = Object.entries(attrObj)
            .map(([key, value]) => {
            const _name = camelToKebab(key).replace(/_/g, '-');
            const _value = String(value);
            const attribute = new JqAttribute(_name, _value);
            return attribute;
        });
        return new JqList(JqAttribute, attrList);
    }
}
_JqAttribute_name = new WeakMap(), _JqAttribute_value = new WeakMap();
JqAttribute.List = {
    from(attrObject) {
        if (attrObject === null || typeof attrObject !== "object")
            throw new Error(`JqError - Invalid argument passed to attr(...); expected an object.`);
        const attributes = Object.entries(attrObject)
            .map(([key, value]) => {
            const _name = camelToKebab(key).replace(/_/g, '-');
            const _value = String(value);
            const attribute = new JqAttribute(_name, _value);
            return attribute;
        });
        return new JqList(JqAttribute, attributes);
    }
};
export { JqAttribute };
export class JqFragment {
    constructor(childNodes) {
        this.nodePosition = -1;
        this.jqParent = null;
        this.htmlNode = null;
        this.childNodes = [];
        this.initial = {
            context: this,
            createNode() {
                const jqFragment = this.context;
                jqFragment.htmlNode = document.createDocumentFragment().cloneNode();
                return this;
            },
            attachChildren() {
                const jqFragment = this.context;
                for (const childNode of jqFragment.childNodes) {
                    childNode.attachTo(jqFragment);
                }
                return this;
            }
        };
        this.update = {
            context: this,
            updateNode() {
                this.updateChildren();
                return this;
            },
            updateChildren() {
                const jqFragment = this.context;
                for (const childNode of jqFragment.childNodes) {
                    childNode.update.updateNode();
                }
                return this;
            },
            attachChild(childNode) {
                const jqFragment = this.context;
                if (jqFragment.jqParent instanceof JqFragment) {
                    jqFragment.jqParent.update.attachChild(childNode);
                    return this;
                }
                if (jqFragment.jqParent instanceof JqElement) {
                    const node = jqFragment.jqParent.shadowRoot ?? jqFragment.jqParent.htmlNode;
                    node.appendChild(childNode.htmlNode);
                    return this;
                }
                return this;
            }
        };
        this.delete = {
            context: this,
            deleteSelf() {
                const jqFragment = this.context;
                const jqParent = jqFragment.jqParent;
                const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqFragment));
                if (delChildIdx == -1)
                    throwError("JqInternalError - JqFragment not found in its jqParent.childNodes");
                jqParent.childNodes.splice(delChildIdx, 1);
                jqFragment.childNodes.forEach(childNode => childNode.delete.deleteSelf());
                return this;
            }
        };
        this.childNodes = childNodes;
    }
    attachTo(node) {
        const attachNode = () => this.initial
            .createNode()
            .attachChildren();
        if (node instanceof HTMLElement) {
            attachNode();
            node.appendChild(this.htmlNode);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node, attachNode();
            (node.shadowRoot ?? node.htmlNode).appendChild(this.htmlNode);
        }
        else if (node instanceof JqFragment) {
            this.jqParent = node, attachNode();
            node.htmlNode.appendChild(this.htmlNode);
        }
        else {
            throw new Error(`JqError - Cannot attach JqFragment to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
    getStateRefValue(prop) {
        return this.jqParent?.getStateRefValue(prop);
    }
    setStateRefValue(prop, value) {
        return this.jqParent?.setStateRefValue(prop, value);
    }
}
export class JqText {
    constructor(...primitives) {
        this.nodePosition = -1;
        this.jqParent = null;
        this.htmlNode = null;
        this.text = '';
        this.initial = {
            context: this,
            createNode() {
                const jqElement = this.context;
                jqElement.htmlNode = document.createTextNode(jqElement.text);
                return this;
            }
        };
        this.update = {
            context: this,
            updateNode() {
                return this;
            },
            setText(text) {
                const jqText = this.context;
                jqText.htmlNode.nodeValue = jqText.text = text;
            }
        };
        this.delete = {
            context: this,
            deleteSelf() {
                const jqText = this.context;
                const jqParent = jqText.jqParent;
                const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqText));
                jqParent.childNodes.splice(delChildIdx, 1);
                jqText.htmlNode.remove();
                return this;
            }
        };
        this.text = primitives.map(primitive => String(primitive ?? '')).join('');
    }
    attachTo(node) {
        this.initial.createNode();
        if (node instanceof HTMLElement) {
            node.appendChild(this.htmlNode);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node;
            (node.shadowRoot ?? node.htmlNode).appendChild(this.htmlNode);
        }
        else if (node instanceof JqFragment) {
            this.jqParent = node;
            node.htmlNode.appendChild(this.htmlNode);
        }
        else {
            throw new Error(`JqError - Cannot attach JqText to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
}
export class JqList {
    constructor(nodeClass, nodes) {
        this.nodes = [];
        this.nodeClass = nodeClass;
        this.nodes = nodes;
    }
    push(node) {
        if (!(node instanceof this.nodeClass))
            throw new Error(`JqError - Cannot push node not of instance '${this.nodeClass.name}' into JqList<${this.nodeClass.name}>`);
        this.nodes.push(node);
    }
    pop() {
        return this.nodes.pop();
    }
}
export class JqElement {
    constructor(name, props) {
        this.jqParent = null;
        this.shadowRoot = null;
        this.htmlNode = null;
        this.childNodes = [];
        this.attributes = [];
        this.events = [];
        this.animations = [];
        this.references = [];
        this.inlineStyles = [];
        this.blockStyles = [];
        this.callbacks = [];
        this.scopedStyleSheet = null;
        this.nodePosition = -1;
        this.initial = {
            context: this,
            createNode() {
                const jqElement = this.context;
                jqElement.htmlNode = document.createElement(jqElement.name);
                return this;
            },
            attachAttributes() {
                const jqElement = this.context;
                for (const attribute of jqElement.attributes) {
                    attribute.attachTo(jqElement);
                }
                return this;
            },
            attachChildren() {
                const jqElement = this.context;
                const callbackPosNodePairs = jqElement.callbacks.map(callback => [callback.nodePosition, callback]);
                for (const childNode of jqElement.childNodes) {
                    callbackPosNodePairs.forEach(([pos, callback], idx) => attachCallback(idx, childNode.nodePosition, pos, callback));
                    childNode.attachTo(jqElement);
                }
                callbackPosNodePairs.forEach(([pos, callback], idx) => attachCallback(idx, -1, pos, callback, true));
                return this;
                function attachCallback(idx, childNodePos, callbackPos, callback, ignorePos = false) {
                    if (!ignorePos && callbackPos >= childNodePos)
                        return;
                    callback.attachTo(jqElement);
                    callbackPosNodePairs.splice(idx, 1);
                }
            },
            attachEventListeners() {
                const jqElement = this.context;
                for (const jqEvent of jqElement.events) {
                    jqEvent.attachTo(jqElement);
                }
                return this;
            },
            attachAnimations() {
                const jqElement = this.context;
                if (jqElement.animations.length == 0)
                    return this;
                observeElement(jqElement.htmlNode, ([entry, observer]) => {
                    if (entry.isIntersecting) {
                        for (const animation of jqElement.animations) {
                            animation.attachTo(jqElement);
                        }
                        observer.disconnect();
                    }
                });
                return this;
            },
            attachStyles() {
                const jqElement = this.context;
                if (jqElement.inlineStyles.length == 0 && jqElement.blockStyles.length == 0)
                    return this;
                if (canHaveShadow(jqElement.htmlNode)) {
                    jqElement.shadowRoot = jqElement.htmlNode.attachShadow({ mode: "open" });
                    const styleSheet = document.createElement("style");
                    styleSheet.textContent = '';
                    jqElement.scopedStyleSheet = styleSheet;
                    jqElement.shadowRoot.appendChild(styleSheet);
                    const styleProperties = [];
                    for (const style of jqElement.inlineStyles) {
                        style.attachTo(jqElement);
                        styleProperties.push(style);
                    }
                    for (const style of jqElement.blockStyles) {
                        style.attachTo(jqElement);
                        styleSheet.textContent += '\n' + style.toString();
                    }
                    const stylePropertiesStr = styleProperties.join("\n\t");
                    if (stylePropertiesStr.length > 0)
                        styleSheet.textContent += `\n:host {\n\t${stylePropertiesStr}\n}`;
                    return this;
                }
                throw new Error(`JqError - scoped styles are not supported for '${jqElement.name}' element.`);
            },
            attachReferences() {
                const jqElement = this.context;
                for (const reference of jqElement.references) {
                    reference.attachTo(jqElement);
                }
                return this;
            },
            attachCallbacks() {
                const jqElement = this.context;
                for (const callback of jqElement.callbacks) {
                    callback.attachTo(jqElement);
                }
                return this;
            }
        };
        this.update = {
            context: this,
            updateNode() {
                this
                    .updateAttributes()
                    .updateChildren()
                    .updateCallbacks();
                return this;
            },
            updateAttributes() {
                const jqElement = this.context;
                for (const attribute of jqElement.attributes) {
                    attribute.update.setAttribute(attribute.value);
                }
                return this;
            },
            updateChildren() {
                const jqElement = this.context;
                for (const childNode of jqElement.childNodes) {
                    childNode.update.updateNode();
                }
                return this;
            },
            updateStyles() {
                const jqElement = this.context;
                for (const style of jqElement.inlineStyles) {
                    // style.update.updateNode()
                }
                return this;
            },
            updateCallbacks() {
                const jqElement = this.context;
                for (const callback of jqElement.callbacks) {
                    callback.update.updateCallback();
                }
                return this;
            }
        };
        this.delete = {
            context: this,
            removeAttribute(jqAttribute) {
                const jqElement = this.context;
                const indexOfAttr = jqElement.attributes.indexOf(jqAttribute);
                if (indexOfAttr != -1)
                    jqElement.attributes.splice(indexOfAttr, 1);
                jqElement.htmlNode.removeAttribute(jqAttribute.name);
                return this;
            },
            deleteSelf() {
                const jqElement = this.context;
                const jqParent = jqElement.jqParent;
                const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqElement));
                if (delChildIdx == -1)
                    throwError("JqInternalError - JqElement not found in its jqParent.childNodes");
                jqParent.childNodes.splice(delChildIdx, 1);
                jqElement.childNodes.forEach(childNode => childNode.delete.deleteSelf());
                jqElement.htmlNode.remove();
                return this;
            }
        };
        this.name = name;
        Object.assign(this, props);
    }
    attachTo(node) {
        const attachNode = () => this.initial
            .createNode()
            .attachReferences()
            .attachStyles()
            .attachAttributes()
            .attachChildren()
            .attachEventListeners()
            .attachAnimations();
        if (node instanceof HTMLElement) {
            attachNode();
            node.appendChild(this.htmlNode);
        }
        else if (node instanceof JqElement) {
            this.jqParent = node, attachNode();
            (node.shadowRoot ?? node.htmlNode).appendChild(this.htmlNode);
        }
        else if (node instanceof JqFragment) {
            this.jqParent = node, attachNode();
            node.htmlNode.appendChild(this.htmlNode);
            node.update.attachChild(this);
        }
        else {
            throw new Error(`JqError - Cannot attach JqElement '${this.name}' to a node not of instance JqElement or JqFragment or HTMLElement`);
        }
        return this;
    }
    getStateRefValue(prop) {
        const reference = this.references?.find(reference => prop in reference[StateReference]);
        return reference?.[StateReference][prop] ?? this.jqParent?.getStateRefValue(prop);
    }
    setStateRefValue(prop, value) {
        const reference = this.references?.find(reference => prop in reference[StateReference]);
        if (reference) {
            reference[StateReference][prop] = value;
            this.update.updateNode();
            return value;
        }
        const _value = this.jqParent?.setStateRefValue(prop, value);
        return _value;
    }
}
/**
 *
 * @param {boolean} condition
 * @returns {true | null}
 */
export function showIf(condition) {
    return condition || null;
}
export function observeElement(element, callback) {
    const observerCallback = callback => (entries, observer) => entries.forEach(entry => callback([entry, observer]));
    return new IntersectionObserver(observerCallback(callback)).observe(element);
}
export function canHaveShadow(element) {
    try {
        return Boolean(element.cloneNode().attachShadow({ mode: "open" }));
    }
    catch {
        return false;
    }
}
export const camelToKebab = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
export function createPropertyListFromStyleObject(errorMessage, styleObject) {
    const isObject = (value) => value !== null && typeof value == "object";
    if (!isObject(styleObject))
        throw new Error(errorMessage);
    const styleProperties = Object.entries(styleObject)
        .map(([key, value]) => new JqCSSProperty(key, value));
    return new JqList(JqCSSProperty, styleProperties);
}
export function adjustColor(col, amt) {
    let usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255)
        r = 255;
    else if (r < 0)
        r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255)
        b = 255;
    else if (b < 0)
        b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255)
        g = 255;
    else if (g < 0)
        g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
function diff(node1, node2) {
    const nodeComparison = compareJqNodes(node1, node2);
    return nodeComparison;
    function compareProps(affected1, affected2) {
        const diff = {
            type: Object.getPrototypeOf(affected1.object).constructor,
            node1: affected1.object,
            node2: affected2.object,
            [CREATED]: [],
            [UPDATED]: [],
            [DELETED]: [],
            [UNCHANGED]: [],
            childDiffs: [],
        };
        const deletedProps = affected1.props.filter(prop => isNullish(getPropertyValue(affected2.object, prop)));
        diff[DELETED] = deletedProps;
        const createdProps = affected2.props.filter(prop => isNullish(getPropertyValue(affected1.object, prop)));
        diff[CREATED] = createdProps;
        const updatedProps = affected1.props.filter(prop => getPropertyValue(affected2.object, prop) !== getPropertyValue(affected1.object, prop));
        diff[UPDATED] = updatedProps;
        const unchangedProps = affected1.props.filter(prop => getPropertyValue(affected2.object, prop) === getPropertyValue(affected1.object, prop));
        diff[UNCHANGED] = unchangedProps;
        return diff;
    }
    function compareJqTexts(node1, node2) {
        const affected1 = {
            object: node1,
            props: [["text"]]
        };
        const affected2 = {
            object: node2,
            props: [["text"]]
        };
        const diff = compareProps(affected1, affected2);
        return diff;
    }
    function compareJqAttributes(jqAttribute1, jqAttribute2) {
        const affected1 = {
            object: jqAttribute1,
            props: [["name"], ["value"]]
        };
        const affected2 = {
            object: jqAttribute2,
            props: [["name"], ["value"]]
        };
        const diff = compareProps(affected1, affected2);
        return diff;
    }
    function compareJqFragments(node1, node2) {
        const firstFragChildren = node1.childNodes;
        const secondFragChildren = node2.childNodes;
        const _diff = {
            type: Object.getPrototypeOf(node1).constructor,
            node1: node1,
            node2: node2,
            [CREATED]: [],
            [UPDATED]: [],
            [DELETED]: [],
            [UNCHANGED]: [],
            childDiffs: [],
        };
        for (let i = 0; i < Math.max(firstFragChildren.length, secondFragChildren.length); i++) {
            const firstFragChild = firstFragChildren[i];
            const secondFragChild = secondFragChildren[i];
            if (firstFragChild === undefined)
                _diff[CREATED].push(["childNodes", secondFragChild]);
            else if (secondFragChild === undefined)
                _diff[DELETED].push(["childNodes", firstFragChild]);
            else
                _diff.childDiffs.push(diff(firstFragChild, secondFragChild));
        }
        return _diff;
    }
    function compareJqElements(node1, node2) {
        const firstElemChildren = node1.childNodes;
        const secondElemChildren = node2.childNodes;
        const firstElemAttributes = node1.attributes;
        const secondElemAttributes = node2.attributes;
        const _diff = {
            type: Object.getPrototypeOf(node1).constructor,
            node1: node1,
            node2: node2,
            [CREATED]: [],
            [UPDATED]: [],
            [DELETED]: [],
            [UNCHANGED]: [],
            childDiffs: [],
        };
        for (let i = 0; i < Math.max(firstElemChildren.length, secondElemChildren.length); i++) {
            const firstElemChild = firstElemChildren[i];
            const secondElemChild = secondElemChildren[i];
            if (firstElemChild === undefined)
                _diff[CREATED].push(["childNodes", i + ""]);
            else if (secondElemChild === undefined)
                _diff[DELETED].push(["childNodes", i + ""]);
            else
                _diff.childDiffs.push(diff(firstElemChild, secondElemChild));
        }
        for (let i = 0; i < Math.max(firstElemAttributes.length, secondElemAttributes.length); i++) {
            const firstElemAttribute = firstElemAttributes[i];
            const secondElemAttribute = secondElemAttributes[i];
            if (firstElemAttribute === undefined)
                _diff[CREATED].push(["attributes", i + '']);
            else if (secondElemAttribute === undefined)
                _diff[DELETED].push(["attributes", i + '']);
            else
                _diff.childDiffs.push(diff(firstElemAttribute, secondElemAttribute));
        }
        return _diff;
    }
    function compareJqNodes(node1, node2) {
        if (isJqElement(node1) && isJqElement(node2))
            return compareJqElements(node1, node2);
        if (isJqFragment(node1) && isJqFragment(node2))
            return compareJqFragments(node1, node2);
        if (isJqAttribute(node1) && isJqAttribute(node2))
            return compareJqAttributes(node1, node2);
        if (isJqText(node1) && isJqText(node2))
            return compareJqTexts(node1, node2);
        return compareJqGenericNodes(node1, node2);
    }
    function compareJqGenericNodes(node1, node2) {
        const _diff = {
            type: Object.getPrototypeOf(node1).constructor,
            node1: node1,
            node2: node2,
            [CREATED]: [],
            [UPDATED]: [],
            [DELETED]: [],
            [UNCHANGED]: [],
            childDiffs: [],
        };
        const [isNode1, isNode2] = [isNullish(node1), isNullish(node2)];
        if (isNode1)
            _diff[CREATED].push(["self"]);
        if (isNode2)
            _diff[DELETED].push(["self"]);
        if (isNode1 || isNode2)
            return _diff;
        const indexOfNode1 = node1.jqParent.childNodes.findIndex(x => Object.is(node1, x));
        _diff[UPDATED].push(["childNodes", indexOfNode1 + '']);
        return _diff;
    }
}
export const validHTMLElements = [
    "a",
    "address",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdo",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "command",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figure",
    "figcaption",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "math",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "pre",
    "progress",
    "portal",
    "q",
    "ruby",
    "s",
    "section",
    "small",
    "span",
    "strike",
    "tt",
    "u",
    "var",
    "video",
    "wbr",
    "abbr",
    "area",
    "bdi",
    "blockquote",
    "body",
    "iframe",
    "menu",
    "meta",
    "picture",
    "rb",
    "rp",
    "rt",
    "rtc",
    "samp",
    "script",
    "select",
    "slot",
    "source",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "ul",
];
