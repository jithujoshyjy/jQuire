import {
	type AnimateFn, JqEvent, getNodes, escapeHTMLEntities,
	stringify, isNullish, JqAnimation, type Primitive,
	isPrimitive, JqReference, JqElement, JqNode,
	JqCSSProperty, JqFragment, JqText, JqCSSRule,
	JqAttribute, StateReference, JqNodeReference, validHTMLElements, JqElementParameters
} from "./utility.js"

const scopedStyleSheets: WeakMap<HTMLElement, HTMLStyleElement> = new WeakMap()
const CustomElements = Symbol("CustomElements")

/**
 * @typedef {import("./utility.js").JqElement} JqElement
 * @typedef {import("./utility.js").JqAttribute} JqAttribute
 * @typedef {import("./utility.js").JqCSSProperty} JqCSSProperty
 * @typedef {import("./utility.js").JqCSSRule} JqCSSRule
 * @typedef {import("./utility.js").JqReference} JqReference
 * @typedef {import("./utility.js").JqFragment} JqFragment
 * @typedef {import("./utility.js").JqAnimation} JqAnimation
 * @typedef {import("./utility.js").JqCallback} JqCallback
 * @typedef {import("./utility.js").JqEvent} JqEvent
 * @typedef {import("./utility.js").JqText} JqText
 * @typedef {import("./utility.js").JqList} JqList
 * @typedef {null | undefined | number | string | symbol | bigint} Primitive
 * @typedef {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqEvent | JqReference | JqFragment | JqText | JqCallback} JqNode
 * @typedef {{
 *		globalize: (_globalThis?: object) => void,
 *		[name: string]: (...nodes: Array<JqNode>) => JqElement
 *	}} Natives
 * @typedef {
 *	((name: string, parent?: typeof HTMLElement) => (...nodes: JqNode[]) => JqElement) &
 *	{[CustomElements]: string[]}
 * } Customs
 */

/**
 * @type {Natives}
 */
export const natives = new Proxy({} as { [k: string | symbol]: any }, {
	get(target, prop: string | symbol) {
		if (typeof prop == "symbol")
			return target[prop]

		if (prop == "globalize")
			return globalize

		return (...nodes: JqNode[]) => new JqElement(prop, getNodes(nodes))
	}
})

function globalize(_globalThis?: object) {
	validHTMLElements
		.forEach(element => ((_globalThis ?? globalThis) as any)[element] = (natives as any)[element])
}

/**
 * @type {(text: Primitive) => JqText}
 */
const text = new Proxy(_text, {})

/**
 * @type {
 * ((attrObj: { [x: string]: Primitive }) => JqList<JqAttribute, typeof JqAttribute>) & {
 *		[x: string]: JqAttribute
 * }}
 */
const attr = new Proxy(_attr, {
	get(target, prop: string | symbol) {
		if (typeof prop == "symbol")
			return target[prop as keyof {}]

		return (value: unknown) => createAttribute(prop, value)
	}
})

/**
 * @type {
 * ((event?: Event, ...a: unknown[]) => JqEvent) & {
 * 		[eventName: string]: (handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent
 * }}
 */
export const on = new Proxy({} as
	{ [eventName: string | symbol]: (handler: (event?: Event, ...a: unknown[]) => unknown) => JqEvent }, {
	get(target, prop: string | symbol) {
		if (typeof prop == "symbol")
			return target[prop]

		return (handler: (event?: Event, ...a: unknown[]) => unknown) =>
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
	get(target, prop: string | symbol) {
		if (typeof prop == "symbol")
			return target[prop as keyof {}]

		return (value: Primitive) => {
			const jqCSSProperty = new JqCSSProperty(prop, value)
			return jqCSSProperty
		}
	}
})

const _custom = Object.assign(((name: string, parent: typeof HTMLElement = HTMLElement) => {
	if (customElements.get(name))
		throw new Error(`JqError - custom element '${name}' was already defined`);

	_custom[CustomElements].push(name)
	const _JqElement = Symbol("_JqElement")

	const node = class extends parent {
		static [_JqElement]: JqElement | null = null
		constructor(name: string, nodes: JqNode[]) {
			super()
			node[_JqElement] = JqElement.custom(this, name, getNodes(nodes))!
		}
	}

	customElements.define(name, node)
	return (...nodes: JqNode[]) => (new node(name, nodes), node[_JqElement]!)
}), { [CustomElements]: [] as string[] })

/**
 * @type {Customs} custom
*/
export const custom = new Proxy(_custom, {
	get(target, prop: string | symbol) {
		if (typeof prop == "symbol")
			return target[prop as keyof typeof _custom]

		return (name: string, parent: typeof HTMLElement = HTMLElement) => {
			return target(name, parent)
		}
	}
})

function createAttribute(name: string, value: unknown) {
	const _value = isPrimitive(value) ? String(value) : stringify(value)
	return new JqAttribute(name, _value)
}

function _attr(attrObj: { [x: string]: Primitive }) {
	const attrList = JqAttribute.objectToJqAttributes(attrObj)
	return attrList
}

function createTextNode(value: unknown) {
	const text = isPrimitive(value) ? String(value) : stringify(value)
	return new JqText(text)
}

function _text(strs: string[] | string, ...values: unknown[]) {
	let _strs = strs

	if (Array.isArray(strs))
		_strs = escapeHTMLEntities(strs.reduce((acc, curr, i) =>
			"" + acc + (curr ?? "") + (stringify(values[i]) ?? ""), ""))
	else if (typeof _strs == "string")
		_strs = escapeHTMLEntities(_strs)

	return createTextNode(_strs)
}

/**
 * @param {Array<Primitive | JqElement | JqText | JqFragment>} childNodes 
 * @returns {JqFragment}
 */
function fragment(..._childNodes: Array<JqElement | JqFragment | JqText>) {
	const { childNodes } = getNodes(_childNodes)
	return new JqFragment(childNodes)
}

/**
 * @type {(styles: AnimationStyles, ...options: [speed?: number | "fast" | "slow" | undefined, easing?: string | undefined, callback?: ((..._: unknown[]) => unknown) | undefined] | [option: AnimationOptions])) => JqAnimation}
 */
export function animate(...parameters: Parameters<AnimateFn>): JqAnimation {
	return new JqAnimation(...parameters)
}

function _css(...args: [string | { [x: string]: Primitive }, ...string[]]) {

	const [ruleName, ...ruleArgs] = args

	if (args.length == 1 && !isPrimitive(ruleName)) {
		const rule = new JqCSSRule([":host", ...ruleArgs], ruleName as { [x: string]: Primitive })
		return rule
	}

	return (...styleNodes: JqCSSRule[]) => {
		const rule = new JqCSSRule([ruleName as string, ...ruleArgs], ...styleNodes)
		return rule
	}
}

/**
 * @param {{ [x: string | symbol]: unknown } | undefined} state
 * @returns {JqReference}
 */
export function ref(state?: { [x: string | symbol]: unknown }) {
	const refObj = new JqReference(state ?? {})

	const refProxy = new Proxy(refObj, {
		get(target, prop) {
			if (prop == JqNodeReference)
				return target
			if (typeof prop == "symbol")
				return target[prop as keyof typeof target]
			else if (prop == "deref")
				return target.deref
			else if (prop == "refresh")
				return target.refresh
			else if (prop == "attachTo")
				return target.attachTo
			else {
				return target[StateReference][prop as any]
			}
		},
		set(target, prop, value) {
			if (typeof prop == "symbol")
				return (target as any)[prop] = value

			target.jqParent?.setStateRefValue(prop, value)
			return true
		}
	})

	return refProxy
}

export const nodes = { attr, text, fragment }
export { pathSetter, showIf, getNodes } from "./utility.js"