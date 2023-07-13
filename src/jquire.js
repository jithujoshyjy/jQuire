import {
	JqEvent, getNodes, escapeHTMLEntities,
	stringify, JqAnimation, JqCallback,
	isPrimitive, JqReference, JqElement,
	JqCSSProperty, JqFragment, JqText, JqCSSRule, JqList,
	JqAttribute, StateReference, JqNodeReference, validHTMLElements, camelToKebab
} from "./utility.js"

/**
 * @type {WeakMap<HTMLElement, HTMLStyleElement>}
 */
const scopedStyleSheets = new WeakMap()
const CustomElements = Symbol("CustomElements")

/**
 * @typedef {null | undefined | number | string | symbol | bigint} Primitive
 * 
 * @typedef {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqEvent | JqReference | JqFragment | JqText | JqCallback} JqNode
 * 
 * @typedef {{ [name: string]: (...nodes: Array<JqNode>) => JqElement }} NativeConstructor
 * 
 * @typedef {{ globalize: (_globalThis?: {}) => void }} Globalizer
 * 
 * @typedef {NativeConstructor & Globalizer} Natives
 * 
 * @typedef {(name: string, parent?: typeof HTMLElement) => (...nodes: JqNode[]) => JqElement} CustomConstructor
 * 
 * @typedef {{[CustomElements]: string[]}} Customizer
 * 
 * @typedef {CustomConstructor & Customizer} Customs
 */

/**
 * @type {Natives}
 */
export const natives = new Proxy(/** @type {Natives & {[k: string | symbol]: any}} */ ({}), {
	/**
	 * @param {string | symbol} prop
	 * @returns {unknown | typeof globalize | ((...nodes: JqNode[]) => JqElement)}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[prop]

		if (prop == "globalize")
			return globalize

		return (...nodes) => new JqElement(prop, getNodes(nodes))
	}
})

/**
 * @param {{[k: string | symbol]: any}} [_globalThis] 
 */
function globalize(_globalThis) {
	validHTMLElements
		.forEach(element => (_globalThis ?? globalThis)[element] = natives[element])
}

/**
 * @type {(strs: string[] | string, ...values: unknown[]) => JqText}
 */
const text = new Proxy(_text, {})

/**
 * @type {
 * ((attrObj: { [x: string]: Primitive }) => JqList<JqAttribute, typeof JqAttribute>) & {
 *		[x: string]: JqAttribute
 * }}
 */
const attr = new Proxy(_attr, {
	/**
	 * @param {string | symbol} prop 
	 * @returns {(value: unknown) => JqAttribute}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[prop]

		return (value) => createAttribute(prop, value)
	}
})

/**
 * @type {{ [eventName: string | symbol]: (handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent }}
 */
const onObject = {}

/**
 * @type {
 * ((event?: Event, ...a: unknown[]) => JqEvent) & {
 * 		[eventName: string]: (handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent
 * }}
 */
export const on = new Proxy(onObject, {
	/**
	 * @param {string | symbol} prop 
	 * @returns {(handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[prop]

		return (handler) =>
			new JqEvent(prop, handler)
	}
})

/**
 * @type {
 * ((styleObj: { [x: string]: Primitive }) => JqCSSRule) & {
*		[x: string]: JqCSSProperty
* }}
 */
export const css = new Proxy(_css, {
	/**
	 * @param {string | symbol} prop 
	 * @returns {(value: Primitive) => JqCSSProperty}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[prop]

		return (value) => {
			const jqCSSProperty = new JqCSSProperty(prop, value)
			return jqCSSProperty
		}
	}
})

/**
 * @param {string} name 
 * @param {typeof HTMLElement} parent
 * @returns {(...nodes: JqNode[]) => JqElement}
 */
const customizer = (name, parent = HTMLElement) => {
	if (customElements.get(name))
		throw new Error(`JqError - custom element '${name}' was already defined`);

	_custom[CustomElements].push(name)
	const _JqElement = Symbol("_JqElement")

	const node = class extends parent {
		/**
		 * @type {JqElement | null}
		 */
		static [_JqElement] = null
		/**
		 * @param {string} name 
		 * @param {JqNode[]} nodes 
		 */
		constructor(name, nodes) {
			super()
			node[_JqElement] = JqElement.custom(this, name, getNodes(nodes))
		}
	}

	customElements.define(name, node)
	return (...nodes) => /**@type {JqElement}*/ (new node(name, nodes), node[_JqElement])
}

const _custom = Object.assign(customizer, { [CustomElements]: /** @type {string[]} */ ([]) })

/**
 * @type {Customs} custom
*/
export const custom = new Proxy(_custom, {
	/**
	 * @param {string | symbol} prop
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[prop]

		return target(camelToKebab(prop))
	}
})

/**
 * @param {string} name 
 * @param {unknown} value 
 * @returns {JqAttribute}
 */
function createAttribute(name, value) {
	const _value = isPrimitive(value) ? String(value) : stringify(value)
	return new JqAttribute(name, _value)
}

/**
 * @param {{ [x: string]: Primitive }} attrObj 
 * @returns {JqList<JqAttribute, typeof JqAttribute>}
 */
function _attr(attrObj) {
	const attrList = JqAttribute.objectToJqAttributes(attrObj)
	return attrList
}

/**
 * @param {unknown} value 
 * @returns {JqText}
 */
function createTextNode(value) {
	const text = isPrimitive(value) ? String(value) : stringify(value)
	return new JqText(text)
}

/**
 * @param {string[] | string} strs 
 * @param  {unknown[]} values
 */
function _text(strs, ...values) {
	let _strs = strs

	if (Array.isArray(strs))
		_strs = escapeHTMLEntities(strs.reduce((acc, curr, i) =>
			"" + acc + (curr ?? "") + (stringify(values[i]) ?? ""), ""))
	else if (typeof _strs == "string")
		_strs = escapeHTMLEntities(_strs)

	return createTextNode(_strs)
}

/**
 * @param {Array<JqElement | JqFragment | JqText>} _childNodes 
 * @returns {JqFragment}
 */
function fragment(..._childNodes) {
	const { childNodes } = getNodes(_childNodes)
	return new JqFragment(childNodes)
}

/**
 * @param  {Parameters<import("./utility.js").AnimateFn>} parameters 
 * @returns {JqAnimation}
 */
export function animate(...parameters) {
	return new JqAnimation(...parameters)
}

/**
 * @param  {[string | { [x: string]: Primitive }, ...string[]]} args
 */
function _css(...args) {

	const [ruleName, ...ruleArgs] = args

	if (args.length == 1 && !isPrimitive(ruleName)) {
		const rule = new JqCSSRule([":host", ...ruleArgs], /**@type {{ [x: string]: Primitive }}*/ (ruleName))
		return rule
	}

	/**
	 * @type {(...styleNodes: JqCSSRule[]) => JqCSSRule}
	 */
	return (...styleNodes) => {
		const rule = new JqCSSRule([/** @type {string} */ (ruleName), ...ruleArgs], ...styleNodes)
		return rule
	}
}

/**
 * @param {{ [x: string | symbol]: unknown }} state
 * @returns {JqReference}
 */
export function ref(state) {
	const refObj = new JqReference(state ?? {})

	const refProxy = new Proxy(refObj, {
		get(target, prop) {
			if (prop == JqNodeReference)
				return target
			if (typeof prop == "symbol")
				return target[prop]
			else if (prop == "deref")
				return target.deref
			else if (prop == "refresh")
				return target.refresh
			else if (prop == "attachTo")
				return target.attachTo
			else {
				return target[StateReference][prop]
			}
		},
		set(target, prop, value) {
			if (typeof prop == "symbol")
				return target[prop] = value

			target.jqParent?.setStateRefValue(prop, value)
			return true
		}
	})

	return refProxy
}

export const nodes = { attr, text, fragment }
export { pathSetter, showIf, getNodes } from "./utility.js"
