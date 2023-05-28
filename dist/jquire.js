import { JqEvent, getNodes, escapeHTMLEntities, stringify, isNullish, JqAnimation, isPrimitive, JqReference, JqElement, JqCSSProperty, JqFragment, JqText, JqCSSRule, JqAttribute, StateReference, JqNodeReference, validHTMLElements } from "./utility.js";
const scopedStyleSheets = new WeakMap();
/**
 * @typedef {import("./utility.js").JqAnimation} JqAnimation
 * @typedef {import("./utility.js").JqCallback} JqCallback
 * @typedef {import("./utility.js").JqCSS} JqCSS
 * @typedef {import("./utility.js").JqEvent} JqEvent
 * @typedef {import("./utility.js").JqRef} JqRef
 * @typedef {null | undefined | number | string | symbol | bigint} Primitive
 */
/**
 * @type {{[native: string]: (...a: JqAnimation | JqCallback | JqCSS | JqEvent | JqReference | Primitive | Array<HTMLElement>) => HTMLElement}}
 */
export const natives = new Proxy({}, {
    get(target, prop) {
        if (typeof prop == "symbol")
            return target[prop];
        if (prop == "globalize")
            return globalize;
        return (...nodes) => {
            const { childNodes, attributes, inlineStyles, blockStyles, animations, events, references, callbacks } = getNodes(nodes);
            return new JqElement(prop, childNodes, attributes, events, animations, references, inlineStyles, blockStyles, callbacks);
        };
        function globalize(_globalThis) {
            validHTMLElements
                .forEach(element => (_globalThis ?? globalThis)[element] = natives[element]);
        }
    }
});
/**
 * @type {(strs: string[] | string, ...values: unknown[]) => Text}
 */
const text = new Proxy(_text, {});
/**
 * @type {(strs: string[], ...values: unknown[]) => Attr}
 */
const attr = new Proxy(_attr, {
    get(target, prop) {
        if (typeof prop == "symbol")
            return target[prop];
        return (value) => createAttribute(prop, value);
    }
});
/**
 * @type {{[x: string]: (e?: Event) => JqEvent}}
 */
export const on = new Proxy({}, {
    get(target, prop) {
        if (typeof prop == "symbol")
            return target[prop];
        return (handler) => new JqEvent(prop, handler);
    }
});
/**
 * @type {(a0: string | {[x: string]: Primitive}, ...a1: string[]) => JqCSS}
 */
export const css = new Proxy(_css, {
    get(target, prop) {
        if (typeof prop == "symbol")
            return target[prop];
        return (value) => {
            const jqCSSProperty = new JqCSSProperty(prop, value);
            return jqCSSProperty;
        };
    }
});
function createAttribute(name, value) {
    const _value = isPrimitive(value) ? String(value) : stringify(value);
    return new JqAttribute(name, _value);
}
function _attr(strs, ...values) {
    if (!Array.isArray(strs)) {
        const attrList = JqAttribute.objectToJqAttributes(strs);
        return attrList;
    }
    const attrRegex = /^(?<attrName>\p{L}[\d\p{L}]*)(?:\s*(?<eq>=)(?:\s*(?<attrValue>.*)))?\s*$/u;
    const attrMatch = strs.join("").trim().match(attrRegex);
    if (attrMatch == null || values.length > 1) {
        throw new Error(`JqError - Invalid attribute syntax`);
    }
    const { attrName, eq, attrValue: _attrValue } = attrMatch.groups;
    const bothPresent = _attrValue !== '' && !isNullish(_attrValue) && !isNullish(values[0]);
    const neitherPresent = eq && (_attrValue === '' || isNullish(_attrValue)) && isNullish(values[0]);
    if (!attrName || bothPresent || neitherPresent) {
        throw new Error(`JqError - Invalid attribute syntax`);
    }
    const attrValue = (_attrValue === '' ? null : _attrValue) ?? values[0] ?? attrName;
    return createAttribute(attrName, attrValue);
}
function createTextNode(value) {
    const text = isPrimitive(value) ? String(value) : stringify(value);
    return new JqText(text);
}
function _text(strs, ...values) {
    let _strs = strs;
    if (Array.isArray(strs))
        _strs = escapeHTMLEntities(strs.reduce((acc, curr, i) => "" + acc + (curr ?? "") + (stringify(values[i]) ?? ""), ""));
    else if (typeof _strs == "string")
        _strs = escapeHTMLEntities(_strs);
    return createTextNode(_strs);
}
/**
 * @param {Array<Text | HTMLElement>} childNodes
 * @returns {Array<Text | HTMLElement>}
 */
function fragment(..._childNodes) {
    const { childNodes } = getNodes(_childNodes);
    return new JqFragment(childNodes);
}
/**
 * @type {(styles: AnimationStyles, ...options: [speed?: number | "fast" | "slow" | undefined, easing?: string | undefined, callback?: ((..._: unknown[]) => unknown) | undefined] | [option: AnimationOptions])) => JqAnimation}
 */
export function animate(...parameters) {
    return new JqAnimation(...parameters);
}
function _css(...args) {
    const [ruleName, ...ruleArgs] = args;
    if (args.length == 1 && !isPrimitive(ruleName)) {
        const rule = new JqCSSRule([":host", ...ruleArgs], ruleName);
        return rule;
    }
    return (...styleNodes) => {
        const rule = new JqCSSRule([ruleName, ...ruleArgs], ...styleNodes);
        return rule;
    };
}
/**
 *
 * @returns {JqReference}
 */
export function ref(state) {
    const refObj = new JqReference(state ?? {});
    const refProxy = new Proxy(refObj, {
        get(target, prop) {
            if (prop == JqNodeReference)
                return target;
            if (typeof prop == "symbol")
                return target[prop];
            else if (prop == "deref")
                return target.deref;
            else if (prop == "refresh")
                return target.refresh;
            else if (prop == "attachTo")
                return target.attachTo;
            else {
                return target[StateReference][prop];
            }
        },
        set(target, prop, value) {
            if (typeof prop == "symbol")
                return target[prop] = value;
            target.jqParent?.setStateRefValue(prop, value);
            return true;
        }
    });
    return refProxy;
}
export const nodes = { attr, text, fragment };
export { pathSetter, showIf, getNodes } from "./utility.js";
