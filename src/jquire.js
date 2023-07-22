import {
	JqEvent, JqEach, getNodes, escapeHTMLEntities,
	stringify, JqAnimation, isPrimitive, JqState, JqElement,
	JqCSSProperty, JqFragment, JqText, JqCSSRule, JqList,
	JqAttribute, StateReference, JqNodeReference, validHTMLElements,
	camelToKebab, JqCondition,
} from "./utility.js"

/**
 * @type {WeakMap<HTMLElement, HTMLStyleElement>}
 */
const scopedStyleSheets = new WeakMap()
const CustomElements = Symbol("CustomElements")

/**
 * @type {Natives}
 */
export const natives = new Proxy(/** @type {Natives & {[k: string | symbol]: any}} */({}), {
	/**
	 * @param {string | symbol} prop
	 * @returns {unknown | typeof globalize | ((...nodes: JqNode[]) => JqElement)}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[prop]

		if (prop == "globalize")
			return globalize

		return (/** @type {import("./utility.js").JqNode[]} */...nodes) => new JqElement(prop, getNodes(nodes))
	}
})

/**
 * @param {{[k: string | symbol]: any}} [_globalThis] 
 */
function globalize(_globalThis) {
	validHTMLElements
		// @ts-ignore
		.forEach(element => (_globalThis ?? globalThis)[element] = natives[element])
}

/**
 * @type {(strs: string[] | string, ...values: unknown[]) => JqText}
 */
const text = new Proxy(_text, {})

const attr = /**@type {AttrFn & AttrProps}*/ (new Proxy(_attr, {
	/**
	 * @param {string | symbol} prop 
	 * @returns {(value: unknown) => JqAttribute}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[/**@type {keyof typeof target}*/ (prop)]

		return (value) => createAttribute(prop, value)
	}
}))

/**
 * @param {boolean} condition
 */
export const when = (condition) => {
	throw new JqCondition(condition)
}

/**
 * @param {string} eventName
 * @returns {JqEvent}
 */
const _on = (eventName) => {
	throw new JqEvent(eventName)
}

export const on = /**@type {OnFn & OnProps}*/ (new Proxy(_on, {
	/**
	 * @param {string | symbol} prop 
	 * @returns {(handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[/**@type {keyof typeof target}*/ (prop)]

		return (handler) =>
			new JqEvent(prop, handler)
	}
}))

export const css = /**@type {CSSFn & CSSProps}*/ (new Proxy(_css, {
	/**
	 * @param {string | symbol} prop 
	 * @returns {(value: import("./utility.js").Primitive) => JqCSSProperty}
	 */
	get(target, prop) {
		if (typeof prop == "symbol")
			return target[/**@type {keyof typeof target}*/ (prop)]

		return (value) => {
			const jqCSSProperty = new JqCSSProperty(prop, value)
			return jqCSSProperty
		}
	}
}))

/**
 * @param {string} name 
 * @param {typeof HTMLElement} parent
 * @returns {(...nodes: import("./utility.js").JqNode[]) => JqElement}
 */
const customizer = (name, parent = HTMLElement) => {
	if (customElements.get(name))
		throw new TypeError(`JqError - custom element '${name}' was already defined`);

	_custom[CustomElements].push(name)
	const _JqElement = Symbol("_JqElement")

	const node = class extends parent {
		/**
		 * @type {JqElement | null}
		 */
		static [_JqElement] = null
		/**
		 * @param {string} name 
		 * @param {import("./utility.js").JqNode[]} nodes 
		 */
		constructor(name, nodes) {
			super()
			node[_JqElement] = JqElement.custom(this, name, getNodes(nodes))
		}
	}

	customElements.define(name, node)
	return (...nodes) => /**@type {JqElement}*/(new node(name, nodes), node[_JqElement])
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
			return target[/**@type {keyof typeof target}*/ (prop)]

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
 * @param {{ [x: string]: import("./utility.js").Primitive }} attrObj 
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
 * @param  {[string | { [x: string]: import("./utility.js").Primitive }, ...string[]]} args
 */
function _css(...args) {

	const [ruleName, ...ruleArgs] = args

	if (args.length == 1 && !isPrimitive(ruleName)) {
		const rule = new JqCSSRule([":host", ...ruleArgs],
			/**@type {{ [x: string]: import("./utility.js").Primitive }}*/(ruleName))
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
 * @param {{ [x: string | symbol]: unknown }} initialState
 * @returns {JqState}
 */
export function state(initialState) {
	if (isPrimitive(initialState))
		throw new TypeError("JqError - Expected an object as a value to state(...)")

	const stateObj = new JqState(initialState ?? {})
	const stateProxy = new Proxy(stateObj, {
		get(target, prop) {
			if (prop == JqNodeReference)
				return target

			return target[StateReference][prop]
		},
		set(target, prop, value) {
			target[StateReference][prop] = value
			target.jqCallbacks.map(jqCallback => jqCallback.update.updateCallback())
			return true
		},
		has(target, prop) {
			return Reflect.has(target[StateReference], prop)
		},
	})

	return stateProxy
}

/**
 * @param {JqState[]} _states
 * @returns {JqList<JqState, typeof JqState>}
 */
export function watch(..._states) {
	throw new JqList(JqState, _states)
}

/**
 * @template T
 * @param {{[Symbol.iterator]: () => IterableIterator<T>, [x: string | symbol | number]: any}} iterable 
 */
export function each(iterable) {
	throw new JqEach(iterable)
}

export const nodes = { attr, text, fragment }
export { pathSetter, getNodes } from "./utility.js"

/**
 * @typedef {{ [name: string]: (...nodes: Array<import("./utility.js").JqNode>) => JqElement }} NativeConstructor
 * 
 * @typedef {{ globalize: (_globalThis?: {}) => void }} Globalizer
 * 
 * @typedef {NativeConstructor & Globalizer} Natives
 * 
 * @typedef {(name: string, parent?: typeof HTMLElement) => (...nodes: import("./utility.js").JqNode[]) => JqElement} CustomConstructor
 * 
 * @typedef {{[CustomElements]: string[]}} Customizer
 * 
 * @typedef {CustomConstructor & Customizer} Customs
 * 
 * @typedef {(attrObj: { [x: string]: import("./utility.js").Primitive }) => JqList<JqAttribute, typeof JqAttribute>} AttrFn
 * 
 * @typedef {{ [x: string]: JqAttribute }} AttrProps
 * 
 * @typedef {(styleObj: { [x: string]: import("./utility.js").Primitive }) => JqCSSRule} CSSFn
 * 
 * @typedef {{ [x: string]: JqCSSProperty }} CSSProps
 * 
 * @typedef {(eventName: string) => JqEvent} OnFn
 * 
 * @typedef {{ [eventName: string | symbol]: (handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent }} OnProps
 */