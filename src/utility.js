const CREATED = Symbol("created")
const UPDATED = Symbol("updated")
const DELETED = Symbol("deleted")
const UNCHANGED = Symbol("unchanged")

/**
 * 
 * @param {string} rootPath 
 * @returns {(relativePath: string) => string}
 */
export function pathSetter(rootPath) {
	return function (relativePath) {
		return rootPath.replace(/\/\s*$/, '') + '/' +
			relativePath.replace(/^(?:\s*\.)?\s*\//, '')
	}
}

/**
 * @param {unknown} test
 */
export const isPrimitive = (test) => test !== Object(test)

/**
 * @param  {any[]} xs
 */
export const isJqElement = (...xs) => xs.every(x => x instanceof JqElement)

/**
 * @param  {any[]} xs
 */
export const isJqAttribute = (...xs) => xs.every(x => x instanceof JqAttribute)

/**
 * @param  {any[]} xs
 */
export const isJqFragment = (...xs) => xs.every(x => x instanceof JqFragment)

/**
 * @param  {any[]} xs
 */
export const isJqText = (...xs) => xs.every(x => x instanceof JqText)

const getJqNodeConstructors = () => [
	JqElement, JqAttribute, JqCSSProperty,
	JqCSSRule, JqAnimation, JqEvent,
	JqState, JqFragment, JqText
]

/**
 * @param {string} e 
 */
export const throwError = (e, errorClass = Error) => { throw new errorClass(e) }
export const JqNodeReference = Symbol("JqNodeReference")

/**
 * 
 * @param {Array<JqNode | Primitive>} nodes 
 * @returns {{
 *		childNodes: Array<JqElement | JqFragment | JqText>,
 *		attributes: JqAttribute[],
 *		events: JqEvent[], animations: JqAnimation[], 
 *		inlineStyles: JqCSSProperty[],
 *		blockStyles: JqCSSRule[], callbacks: JqCallback[]
 * }}
 */
export function getNodes(nodes) {
	/**
	 * @type {Array<JqElement | JqFragment | JqText>}
	 */
	const childNodes = []

	/**
	 * @type {JqAttribute[]}
	 */
	const attributes = []

	/**
	 * @type {JqEvent[]}
	 */
	const events = []

	/**
	 * @type {JqAnimation[]}
	 */
	const animations = []

	/**
	 * @type {JqCallback[]}
	 */
	const callbacks = []

	/**
	 * @type {JqCSSProperty[]}
	 */
	const inlineStyles = []

	/**
	 * @type {JqCSSRule[]}
	 */
	const blockStyles = []
	const childNodeClasses = [JqElement, JqFragment, JqText]

	for (const [i, node] of nodes.entries()) {
		if (childNodeClasses.some(childNodeClass => node instanceof childNodeClass)) {
			const _node = /**@type {JqElement | JqFragment | JqText}*/ (node)
			_node.nodePosition = i
			childNodes.push(_node)
		}
		else if (node instanceof JqAttribute) {
			node.nodePosition = i
			attributes.push(node)
		}
		else if (node instanceof JqList && node.nodeClass === JqAttribute) {
			node.nodes.forEach((/**@type {JqAttribute}*/ attribute) => {
				attribute.nodePosition = i
				attributes.push(attribute)
			})
		}
		else if (node instanceof JqEvent) {
			node.nodePosition = i
			events.push(node)
		}
		else if (node instanceof JqAnimation) {
			node.nodePosition = i
			animations.push(node)
		}
		else if (node instanceof JqCSSProperty) {
			node.nodePosition = i
			inlineStyles.push(node)
		}
		else if (node instanceof JqCSSRule) {
			node.nodePosition = i
			blockStyles.push(node)
		}
		else if (Array.isArray(node)) {
			const _node = /**@type {JqFragment}*/ (convertToJqNode(node, null))
			_node.nodePosition = i
			childNodes.push(_node)
		}
		else if (typeof node == "function") {
			const _node = /**@type {JqCallback}*/ (convertToJqNode(node, null))
			_node.nodePosition = i
			callbacks.push(_node)
		}
		else if (isPrimitive(node)) {
			const _node = /**@type {JqText}*/ (convertToJqNode(node, null))
			_node.nodePosition = i
			childNodes.push(_node)
		}
	}

	return /**@type {const}*/ ({
		childNodes, attributes,
		events, animations, inlineStyles,
		blockStyles, callbacks
	})
}

/**
 * @param {any} value 
 * @param {JqFragment | JqElement | null} jqParent 
 * @returns {JqText | JqFragment | JqCallback}
 */
export function convertToJqNode(value, jqParent) {
	/**
	 * @param {Primitive | Primitive[]} value
	 */
	const convertToJqText = (value) => {
		const jqText = new JqText(/**@type {Primitive}*/(value) ?? '')
		jqText.jqParent = jqParent
		return jqText
	}

	/**
	 * @param {(...a: any[]) => any} value
	 */
	const convertToJqCallback = (value) => {
		const jqCallback = new JqCallback(value)
		jqCallback.jqParent = /**@type {any}*/ (jqParent)
		return jqCallback
	}

	/**
	 * @param {Primitive[]} value
	 */
	const convertToJqFragment = (value) => {
		const childNodes = value.map(x => /**@type {JqFragment | JqText}*/(convertToJqNode(x, null)))
		const jqFragment = new JqFragment(childNodes)

		childNodes.forEach((childNode, i) => {
			childNode.jqParent = jqFragment
			childNode.nodePosition = i
		})

		jqFragment.jqParent = jqParent
		return jqFragment
	}

	if (Array.isArray(value))
		return convertToJqFragment(value)
	if (isPrimitive(value))
		return convertToJqText(value)
	if (typeof value == "function")
		return convertToJqCallback(value)
	if(value instanceof JqState)
		return convertToJqNode(value[JqNodeReference][StateReference], jqParent)

	if (getJqNodeConstructors().some(ctor => value instanceof ctor))
		return /**@type {JqText | JqFragment | JqCallback}*/ (value)

	return throwError(`JqError - Unexpected value found in place of a JqNode`)
}

/**
 * @param {{[x: string | symbol | number]: unknown}} object 
 * @param {string[]} props 
 * @returns {Primitive | { [x: string | symbol]: any }}
 */
const getPropertyValue = (object, props) => {
	let result = object
	for (let i = 0; i < props.length; i++) {
		result = /**@type {any}*/ (result?.[props[i]])
		if (isNullish(result)) return result
	}
	return result
}

/**
 * @param {string} text
 * @returns {string}
 */
export function escapeHTMLEntities(text) {
	const entityRegex1 = /(&#x[0-9A-F]{2,6};)/gi
	const entityRegex2 = /(&[a-z0-9]+;)/gi

	/**
	 * @param {string} t 
	 * @param {string} e 
	 * @returns 
	 */
	const replacer = (t, e) =>
		new DOMParser().parseFromString(e, "text/html").documentElement.textContent ?? ''

	const _text = text.replace(entityRegex1, replacer)
		.replace(entityRegex2, replacer)

	return _text
}

/**
 * @param {unknown} value
 */
export function stringify(value) {
	return isPrimitive(value) ? String(value ?? '') : JSON.stringify(value)
}

/**
 * @param  {unknown[]} values
 */
export function isNullish(...values) {
	return values.every(x => x === null || x === undefined)
}

export const ElementReference = Symbol("ElementReference")
export const StateReference = Symbol("StateReference")

export class JqEvent {
	nodePosition = -1
	/**
	 * @type {string}
	 */
	event

	/**
	 * @param {Event} [_]
	 * @param {unknown[]} a
	 * @returns {void}
	 */
	handler = (_, ...a) => { }

	/**
	 * @type {JqElement | null}
	 */
	jqParent = null

	/**
	 * @param {string} event
	 * @param {(event?: Event, ...a: unknown[]) => void} handler 
	 */
	constructor(event, handler) {
		this.event = event
		this.handler = handler
	}

	/**
	 * @param {HTMLElement} element 
	 */
	attachHandler(element) {
		element.addEventListener(this.event, this.handler)
	}

	/**
	 * @param {HTMLElement} element 
	 */
	detachHandler(element) {
		element.removeEventListener(this.event, this.handler)
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		if (node instanceof HTMLElement) {
			this.attachHandler(node)
		}
		else if (node instanceof JqElement) {
			this.attachHandler(/**@type {HTMLElement}*/(node.htmlNode))
		}
		else {
			throw new Error(`JqError - Cannot attach JqEvent '${this.event}' to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}
}

export class JqState {
	/**
	 * @type {any}
	 */
	[JqNodeReference];
	/**
	 * @type {{ [x: string | symbol]: unknown }}
	 */
	[StateReference];

	/**
	 * @type {Array<JqCallback>}
	 */
	jqCallbacks = []

	/**
	 * @param {{ [x: string | symbol]: unknown }} state 
	 */
	constructor(state = {}) {
		this[StateReference] = state
	}
}

export class JqCallback {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqFragment | JqText | null}
	 */
	returned = null
	/**
	 * @param {CallbackArg} [_] 
	 * @returns {JqNode | Primitive}
	 */
	callback = (_) => null
	/**
	 * @type {JqEvent | JqList<JqState, typeof JqState>}
	*/
	callbackArg

	/**
	 * @param {(a?: CallbackArg) => JqNode | Primitive} callback 
	 */
	constructor(callback) {
		this.callback = callback
	}

	invoke() {
		if (this.callbackArg instanceof JqList && this.callbackArg.nodeClass == JqState) {
			let result = this.callback(this.callbackArg)

			if (isPrimitive(result) || Array.isArray(result) || result instanceof JqState)
				result = convertToJqNode(result, this.jqParent)

			return /**@type {DiffableJqNode}*/ (result)
		}

		throw new TypeError(`JqError - Cannot invoke JqCallback without arguments of type JqList<JqState, typeof JqState> | JqEvent`)
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		if (node instanceof HTMLElement) {
			const childNode = /**@type {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqFragment | JqText}*/ (this.invoke())
			childNode.attachTo(node)
		}
		else if (node instanceof JqElement || node instanceof JqFragment) {
			this.jqParent = node
			this.callbackArg = JqCallback.getCallbackArg(this)

			const childNode = this.returned = /**@type {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqFragment | JqText}*/ (this.invoke())

			childNode.jqParent = node
			childNode.nodePosition = this.nodePosition
			childNode.attachTo(node)

			let retNodeInsertPos = node.childNodes
				.findIndex(childNode => this.nodePosition == childNode.nodePosition)

			retNodeInsertPos = retNodeInsertPos == -1 ? (node.childNodes.length || 1) - 1 : retNodeInsertPos
			node.childNodes.splice(retNodeInsertPos, 0, /**@type {JqElement | JqFragment | JqText}*/(this.returned))
		}
		else {
			throw new Error(`JqError - Cannot attach JqCallback to a node not of instance JqElement or JqText or JqFragment or HTMLElement`)
		}
		return this
	}

	/**
	 * @returns {string}
	 */
	toString(indent = 0) {
		return this.returned?.toString(indent) ?? ''
	}

	update = {
		context: this,
		updateCallback() {
			const jqCallback = this.context
			if (jqCallback.returned === null) return this

			const oldNode = jqCallback.returned
			const newNode = jqCallback.invoke()
			const rootNode = oldNode, parentNode = oldNode

			reconcile(rootNode, parentNode, oldNode, newNode)
			return this

			/**
			 * @param {JqNode} rootNode 
			 * @param {JqNode} parentNode 
			 * @param {JqNode} oldNode 
			 * @param {JqNode} newNode 
			 */
			function reconcile(rootNode, parentNode, oldNode, newNode) {
				const _diff = diff(oldNode, newNode)

				const node1 = _diff.node1
				const node2 = _diff.node2

				const updatedChanges = _diff[UPDATED]
				const createdChanges = _diff[CREATED]
				const deletedChanges = _diff[DELETED]

				for (const [firstProp, ...nestedProps] of updatedChanges) {
					if (isJqText(node1, node2)) {
						if (firstProp == "text")
							updateText(_diff, [firstProp, ...nestedProps])
					}
					else if (isJqAttribute(node1, node2)) {
						if (firstProp == "value")
							updateAttribute(_diff, [firstProp, ...nestedProps])
					}
					else if (!isNullish(node1) && !isNullish(node2)) {
						updateElement(_diff, [firstProp, ...nestedProps])
						jqCallback.returned = /**@type {DiffableJqNode}*/ (node2)
					}
				}

				for (const [firstProp, ...nestedProps] of createdChanges) {
					if (isJqText(node1, node2)) {

					}
					else if (isJqAttribute(node1, node2)) {

					}
					else if (isJqFragment(node1, node2)) {
						if (firstProp == "childNodes")
							createFragment(_diff, [firstProp, ...nestedProps])
					}
					else if (isJqElement(node1, node2)) {
						if (firstProp == "childNodes")
							createElement(_diff, [firstProp, ...nestedProps])
					}
				}

				for (const [firstProp, ...nestedProps] of deletedChanges) {
					if (isJqFragment(node1, node2)) {
						deleteJqFragmentChild(_diff, [firstProp, ...nestedProps])
					}
					else if (isJqElement(node1, node2)) {
						deleteJqElementChild(_diff, [firstProp, ...nestedProps])
					}
					else {
						/**@type {DiffableJqNode}*/(node1).delete.deleteSelf()
					}
				}

				for (const childDiff of _diff.childDiffs)
					reconcile(rootNode, _diff.node1, childDiff.node1, childDiff.node2)
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} props
			 */
			function updateAttribute(diff, props) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqAttribute))
					return this
				const _node1 = /**@type {JqAttribute}*/ (diff.node1)
				const _node2 = /**@type {JqAttribute}*/ (diff.node2)
				return _node1.update.setAttribute(_node2.value)
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} props
			 */
			function updateText(diff, props) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqText))
					return this
				const _node1 = /**@type {JqText}*/ (diff.node1)
				const _node2 = /**@type {JqText}*/ (diff.node2)
				_node1.update.setText(_node2.text)
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} props 
			 */
			function updateElement(diff, props) {
				const _node1 = /**@type {JqElement | JqFragment | JqText}*/ (diff.node1)
				const _node2 = /**@type {JqElement | JqFragment | JqText}*/ (diff.node2)
				const _node1Parent = /**@type {JqElement | JqFragment}*/ (_node1.jqParent)

				_node2 instanceof JqText ? _node2.initial.createNode() : _node2.attachTo(null)
				_node1Parent.update.replaceChild(_node1, _node2)
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} param2
			 */
			function createElement(diff, [firstProp, _childNode]) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqElement))
					return this

				const _node1 = /**@type {JqElement}*/ (diff.node1)
				const _node2 = /**@type {JqElement}*/ (diff.node2)
				const childNode = /**@type {JqElement | JqFragment | JqText}*/ (_childNode)

				childNode.jqParent = _node1.jqParent
				childNode.nodePosition = _node1.childNodes.length

				_node1.childNodes.splice(_node1.childNodes.length, 0, childNode)
				childNode.attachTo(_node1)

				return this
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} param2
			 */
			function createFragment(diff, [firstProp, _childNode]) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqFragment))
					return this

				const _node1 = /**@type {JqFragment}*/ (diff.node1)
				const _node2 = /**@type {JqFragment}*/ (diff.node2)
				const childNode = /**@type {JqElement | JqFragment | JqText}*/ (_childNode)

				childNode.jqParent = _node1.jqParent
				childNode.nodePosition = _node1.childNodes.length

				_node1.childNodes.splice(_node1.childNodes.length, 0, childNode)
				childNode.attachTo(_node1)

				return this
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} param2 
			 */
			function deleteJqFragmentChild(diff, [firstProp, _childNode]) {
				const _node1 = /**@type {JqFragment}*/(diff.node1)
				const _node2 = /**@type {JqFragment}*/ (diff.node2)

				const childNode = /**@type {JqElement | JqFragment | JqText}*/(_childNode)
				childNode.delete.deleteSelf()
			}

			/**
			 * @param {Diff} diff 
			 * @param {[string, ...Array<string | JqNode>]} param2 
			 */
			function deleteJqElementChild(diff, [firstProp, _childNode]) {
				const _node1 = /**@type {JqElement}*/ (diff.node1)
				const _node2 = /**@type {JqElement}*/ (diff.node2)

				const childNode = /**@type {JqElement | JqFragment | JqText}*/ (_childNode)
				childNode.delete.deleteSelf()
			}
		}
	}

	/**
	 * @param {JqCallback} context
	 */
	static getCallbackArg(context) {
		try {
			context.callback()
		}
		catch (e) {
			if (e instanceof JqList && e.nodeClass == JqState) {
				const stateList = /**@type {JqList<JqState, typeof JqState>}*/ (e)

				for (const jqState of stateList.nodes) {
					jqState[JqNodeReference].jqCallbacks.push(context)
				}

				return stateList
			}

			if (e instanceof JqEvent) {
				return e
			}

			throw e
		}

		throw new TypeError(`JqError - Expected a JqCallback<"state" | "event" | "condition" | "each" | "mount" | "unmount"> but instead found a 'function'`)
	}
}

export class JqAnimation {
	/**
	 * @type {Animation | null}
	 */
	domAnimation = null
	nodePosition = -1
	/**
	 * @type {Parameters<AnimateFn>}
	 */
	parameters
	/**
	 * @type {JqElement | null}
	 */
	jqParent = null

	/**
	 * 
	 * @param  {Parameters<AnimateFn>} parameters 
	 */
	constructor(...parameters) {
		this.parameters = parameters
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		if (node instanceof HTMLElement) {
			this.animate(node)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			this.animate(/**@type {HTMLElement}*/(node.htmlNode))
		}
		else {
			throw new Error(`JqError - Cannot attach JqAnimation to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	/**
	 * @param {HTMLElement} element 
	 * @returns {ReturnType<AnimateFn>}
	 */
	animate(element) {

		const [_styles, _options, ..._moreOptions] = this.parameters

		/**
		 * @type {((..._: unknown[]) => unknown) | null}
		 */
		let callback = null
		let options = /**@type {Parameters<Element["animate"]>[1]}*/ (isPrimitive(_options) ? null : _options)

		const [speed, easing, _callback] = [_options, ..._moreOptions]
		if (_callback) callback = _callback
		const option = {
			duration: speed ?? 400,
			easing: easing ?? "linear",
			fill: "forwards"
		}

		options ??= /**@type {Parameters<Element["animate"]>[1]}*/ (option)

		const __styles = (Array.isArray(_styles)
			? _styles.map(x => x instanceof Map ? Object.fromEntries(x) : x)
			: _styles instanceof Map ? Object.fromEntries(_styles) : _styles)

		const styles = /**@type {Parameters<Element["animate"]>[0]}*/ (Array.isArray(__styles)
			? __styles.map(x => JqAnimation.setInitialStyles(element, x))
			: JqAnimation.setInitialStyles(element, __styles))

		this.domAnimation = element.animate(styles, options)
		callback && this.domAnimation.addEventListener("finish", callback)

		return this.domAnimation
	}

	/**
	 * @param {HTMLElement} element 
	 * @param {{ [styleName: string]: Primitive | Primitive[] }} styles 
	 * @param  {unknown[]} _ 
	 * @returns 
	 */
	static setInitialStyles = (element, styles, ..._) => {
		const styleNames = Object.keys(styles).filter(styleName => !Array.isArray(styles[styleName]))
		const _styles = styleNames.map(styleName => {
			const finalStyleValue = /**@type {Primitive}*/ (styles[styleName])
			const initialStyleValue = getComputedStyle(element).getPropertyValue(styleName)

			return [styleName, [initialStyleValue, finalStyleValue]]
		})

		return { ...styles, ...Object.fromEntries(_styles) }
	}
}

export class JqCSSProperty {
	/**
	 * @type {string}
	 */
	name
	/**
	 * @type {string}
	 */
	value
	nodePosition = -1
	/**
	 * @type {JqElement | null}
	 */
	jqParent = null

	/**
	 * @param {string} name 
	 * @param {unknown} value 
	 */
	constructor(name, value) {
		this.name = camelToKebab(name).replace(/_/g, '-')
		this.value = String(value)
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		if (node instanceof HTMLElement) {
			node.style.setProperty(this.name, this.value)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
		}
		else {
			throw new Error(`JqError - Cannot attach JqCSS.Property to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	/**
	 * @returns {string}
	 */
	toString(indent = 1) {
		return `${this.name}: ${this.value};`
	}
}

export class JqCSSRule {
	nodePosition = -1
	/**
	 * @type {[string, ...string[]]}
	 */
	head
	/**
	 * @type {Array<JqCSSProperty | JqCSSRule>}
	 */
	body = []
	/**
	 * @type {JqElement | null}
	 */
	jqParent = null

	/**
	 * @param {[string, ...string[]]} param0 
	 * @param  {(Array<JqCSSProperty | JqCSSRule> | { [x: string]: Primitive }[])} styleNodes 
	 */
	constructor([ruleName, ...ruleArgs], ...styleNodes) {

		this.head = [ruleName, ...ruleArgs]

		const errorMessage = `JqError - Invalid argument passed to ${this.head.join(' ').trim()}(...)`
		this.body = styleNodes.flatMap(styleNode =>
			styleNode instanceof JqCSSProperty || styleNode instanceof JqCSSRule
				? styleNode
				: createPropertyListFromStyleObject(errorMessage, styleNode).nodes
		)
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		if (node instanceof HTMLElement) {
			// node.style.setProperty(this.name, this.value)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
		}
		else {
			throw new Error(`JqError - Cannot attach JqCSS.Rule to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	/**
	 * @returns {string}
	 */
	toString(indent = 1) {
		const space = '\t'.repeat(indent)
		let head = this.head.join(' ').trim()
		return `${head} {\n${space}${this.body.map(styleNode => styleNode.toString(indent + 1)).join('\n' + space)}\n${'\t'.repeat(indent - 1)}}`
	}
}

/**
 * @template {JqNode} U
 * @template {{ new(...x: any[]): U }} T
 */
export class JqList {
	/**
	 * @type {U[]}
	 */
	nodes = []
	/**
	 * @type {T}
	 */
	nodeClass

	/**
	 * @param {T} nodeClass 
	 * @param {U[]} nodes 
	 */
	constructor(nodeClass, nodes) {
		this.nodeClass = nodeClass
		this.nodes = nodes
	}

	/**
	 * @param {U} node 
	 */
	push(node) {
		if (!(node instanceof this.nodeClass))
			throw new TypeError(`JqError - Cannot push node not of instance '${this.nodeClass.name}' into JqList<${this.nodeClass.name}>`)
		this.nodes.push(node)
	}

	pop() {
		return this.nodes.pop()
	}
}

export class JqAttribute {
	/**
	 * @type {string}
	 */
	_name = ''
	/**
	 * @type {string}
	 */
	_value = ''
	nodePosition = -1
	/**
	 * @type {Attr | null}
	 */
	attrNode = null
	/**
	 * @type {JqElement | null}
	 */
	jqParent = null

	/**
	 * @param {string} name 
	 * @param {string} value 
	 */
	constructor(name, value) {
		this.name = camelToKebab(name).replace(/_/g, '-')
		this.value = value
	}

	get name() {
		return this._name
	}
	/**
	 * @param {string} attrName
	 */
	set name(attrName) {
		this._name = attrName
	}
	get value() {
		return this._value
	}
	/**
	 * @param {string} attrValue
	 */
	set value(attrValue) {
		this._value = attrValue
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		this.initial.createNode()
		if (node instanceof HTMLElement) {
			node.setAttributeNode(/**@type {Attr}*/(this.attrNode))
		}
		else if (node instanceof JqElement) {
			this.jqParent = node;
			/**@type {HTMLElement}*/ (node.htmlNode).setAttributeNode(/**@type {Attr}*/(this.attrNode))
		}
		else {
			throw new TypeError(`JqError - Cannot attach JqAttribute '${this.name}' to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	initial = {
		context: this,
		createNode() {
			const jqAttribute = this.context
			jqAttribute.attrNode = document.createAttribute(jqAttribute.name)
			jqAttribute.attrNode.value = jqAttribute.value
			return this
		}
	}

	update = {
		context: this,
		updateAttribute() {
			const jqAttribute = this.context;
			/**@type {Attr}*/ (jqAttribute.attrNode).value = jqAttribute.value
			return this
		},
		/**
		 * @param {string} value
		 */
		setAttribute(value) {
			const jqAttribute = this.context
			if (value === jqAttribute.value) return this

			jqAttribute.value = value;
			/**@type {Attr}*/ (jqAttribute.attrNode).value = value
			return this
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqAttribute = this.context
			const jqElement = jqAttribute.jqParent

			if (!jqElement) return this
			jqElement.delete.removeAttribute(jqAttribute)

			jqAttribute.attrNode = null
			return this
		}
	}

	/**
	 * @param {{ [x: string]: Primitive }} attrObj
	 */
	static objectToJqAttributes(attrObj) {

		if (attrObj === null || typeof attrObj !== "object")
			throw new TypeError(`JqError - Invalid argument passed to attr(...)`)

		const attrList = Object.entries(attrObj)
			.map(([key, value]) => {
				const _name = camelToKebab(key).replace(/_/g, '-')
				const _value = String(value)

				const attribute = new JqAttribute(_name, _value)
				return attribute
			})

		return new JqList(JqAttribute, attrList)
	}
}

export class JqText {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {Text | null}
	 */
	htmlNode = null
	text = ''

	/**
	 * @param  {Array<Primitive>} primitives
	 */
	constructor(...primitives) {
		this.text = primitives.map(primitive => String(primitive ?? '')).join('')
	}

	/**
	 * @param {Node | JqElement | JqFragment | null} node 
	 * @returns 
	 */
	attachTo(node) {

		if (node === null) {
			return this.toString()
		}

		this.initial.createNode()
		if (node instanceof HTMLElement) {
			node.appendChild(/**@type {Text}*/(this.htmlNode))
			return this.toString()
		}
		else if (node instanceof JqElement) {
			this.jqParent = node;
			(node.shadowRoot ?? /**@type {HTMLElement}*/ (node.htmlNode))
				.appendChild(/**@type {Text}*/(this.htmlNode))
		}
		else if (node instanceof JqFragment) {
			this.jqParent = node;
			/**@type {Node}*/ (node.htmlNode).appendChild(/**@type {Node}*/(this.htmlNode))
			node.update.attachChild(this)
		}
		else {
			throw new TypeError(`JqError - Cannot attach JqText to a node not of instance JqElement or JqFragment or HTMLElement`)
		}

		return this.toString()
	}

	toString(indent = 0) {
		return /**@type {Text}*/ (this.htmlNode).nodeValue ?? ''
	}

	initial = {
		context: this,
		createNode() {
			const jqElement = this.context
			jqElement.htmlNode = document.createTextNode(jqElement.text)
			return this
		}
	}

	update = {
		context: this,
		updateNode() {
			return this
		},
		/**
		 * @param {string} text 
		 */
		setText(text) {
			const jqText = this.context;
			/**@type {Text}*/ (jqText.htmlNode).nodeValue = jqText.text = text
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqText = this.context
			const jqParent = /**@type {JqElement | JqFragment}*/ (jqText.jqParent)

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqText))

			jqParent.childNodes.splice(delChildIdx, 1);
			/**@type {Text}*/ (jqText.htmlNode).remove()
			return this
		}
	}
}

export class JqFragment {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {Node | null}
	 */
	htmlNode = null
	/**
	 * @type {Array<JqElement | JqFragment | JqText>}
	 */
	childNodes = []

	/**
	 * @param {Array<JqElement | JqFragment | JqText>} childNodes 
	 */
	constructor(childNodes) {
		this.childNodes = childNodes
	}

	/**
	 * @param {Node | JqElement | JqFragment | null} node
	 */
	attachTo(node) {
		const attachNode = () => this.initial
			.createNode()
			.attachChildren()

		if (node === null) {
			attachNode()
		}
		else if (node instanceof HTMLElement) {
			attachNode()
			node.appendChild(/**@type {Node}*/(this.htmlNode))
		}
		else if (node instanceof JqElement) {
			this.jqParent = node, attachNode()
			const domNode = node.shadowRoot ?? /**@type {Node}*/ (node.htmlNode)
			domNode.appendChild(/**@type {Node}*/(this.htmlNode))
		}
		else if (node instanceof JqFragment) {
			this.jqParent = node, attachNode();
			/**@type {Node}*/ (node.htmlNode).appendChild(/**@type {Node}*/(this.htmlNode))
		}
		else {
			throw new Error(`JqError - Cannot attach JqFragment to a node not of instance JqElement or JqFragment or HTMLElement`)
		}

		return this.toString()
	}

	/**
	 * @returns {string}
	 */
	toString(indent = 0) {
		return this.childNodes.map(x => x.toString(indent)).join('\n' + '\t'.repeat(indent))
	}

	initial = {
		context: this,
		createNode() {
			const jqFragment = this.context
			jqFragment.htmlNode = document.createDocumentFragment().cloneNode()
			return this
		},
		attachChildren() {
			const jqFragment = this.context
			for (const childNode of jqFragment.childNodes) {
				childNode.attachTo(jqFragment)
			}
			return this
		}
	}

	update = {
		context: this,
		/**
		 * @param {JqElement | JqFragment | JqText} childNode
		 */
		attachChild(childNode) {
			const jqFragment = this.context

			if (jqFragment.jqParent instanceof JqFragment) {
				jqFragment.jqParent.update.attachChild(childNode)
				return this
			}

			if (jqFragment.jqParent instanceof JqElement) {
				const node = jqFragment.jqParent.shadowRoot ?? /**@type {HTMLElement}*/ (jqFragment.jqParent.htmlNode);
				node.appendChild(/**@type {HTMLElement}*/(childNode.htmlNode))
				return this
			}

			return this
		},

		/**
		 * @param {JqElement | JqFragment | JqText} oldChildNode 
		 * @param {JqElement | JqFragment | JqText} newChildNode
		 */
		replaceChild(oldChildNode, newChildNode) {
			const jqFragment = this.context
			const delChildIdx = jqFragment.childNodes.findIndex(childNode => Object.is(childNode, oldChildNode))

			if (delChildIdx == -1)
				throwError("JqInternalError - childNode not found in jqFragment.childNodes")

			jqFragment.childNodes.splice(delChildIdx, 1, newChildNode)

			if (!(oldChildNode instanceof JqText))
				oldChildNode.childNodes.forEach(childNode => childNode.delete.deleteSelf());


			const jqParent = /**@type {JqFragment | JqElement}*/ (oldChildNode.jqParent)
			const htmlNode = /**@type {Node | HTMLElement}*/ (jqParent?.htmlNode)
			htmlNode.replaceChild(
				/**@type {Node | HTMLElement}*/(newChildNode.htmlNode),
				/**@type {Node | HTMLElement}*/(oldChildNode.htmlNode)
			)
			return this
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqFragment = this.context
			const jqParent = /**@type {JqFragment | JqElement}*/ (jqFragment.jqParent)

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqFragment))
			if (delChildIdx == -1)
				throwError("JqInternalError - JqFragment not found in its jqParent.childNodes")

			jqParent.childNodes.splice(delChildIdx, 1)
			jqFragment.childNodes.forEach(childNode => childNode.delete.deleteSelf())

			return this
		}
	}
}

export class JqElement {
	/**
	 * @type {string}
	 */
	name
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {ShadowRoot | null}
	 */
	shadowRoot = null
	/**
	 * @type {HTMLElement | null}
	 */
	htmlNode = null
	/**
	 * @type {Array<JqElement | JqFragment | JqText>}
	 */
	childNodes = []
	/**
	 * @type {JqAttribute[]}
	 */
	attributes = []
	/**
	 * @type {JqEvent[]}
	 */
	events = []
	/**
	 * @type {JqAnimation[]}
	 */
	animations = []
	/**
	 * @type {Array<JqCSSProperty>}
	 */
	inlineStyles = []
	/**
	 * @type {Array<JqCSSRule>}
	 */
	blockStyles = []
	/**
	 * @type {JqCallback[]}
	 */
	callbacks = []
	/**
	 * @type {HTMLStyleElement | null}
	 */
	scopedStyleSheet = null
	nodePosition = -1

	/**
	 * @param {string} name 
	 * @param {JqElementParameters} props 
	 */
	constructor(name, props) {
		this.name = name
		Object.assign(this, props)
	}

	/**
	 * @param {Node | JqElement | JqFragment | null} node
	 */
	attachTo(node) {
		const attachNode = () => this.initial
			.createNode(isNullish(this.htmlNode))
			.attachStyles()
			.attachAttributes()
			.attachChildren()
			.attachEventListeners()
			.attachAnimations()

		if (node === null) {
			attachNode()
		}
		else if (node instanceof HTMLElement) {
			attachNode()
			node.appendChild(/**@type {HTMLElement}*/(this.htmlNode))
		}
		else if (node instanceof JqElement) {
			this.jqParent = node, attachNode();
			(node.shadowRoot ?? /**@type {HTMLElement}*/ (node.htmlNode))
				.appendChild(/**@type {HTMLElement}*/(this.htmlNode))
		}
		else if (node instanceof JqFragment) {
			this.jqParent = node, attachNode();
			/**@type {Node}*/ (node.htmlNode).appendChild(/**@type {HTMLElement}*/(this.htmlNode))
			node.update.attachChild(this)
		}
		else {
			throw new Error(`JqError - Cannot attach JqElement '${this.name}' to a node not of instance JqElement or JqFragment or HTMLElement`)
		}

		// return this.toString()
	}

	/**
	 * @returns {string}
	 */
	toString(indent = 0) {
		const emptyTags = [
			"area", "base", "br",
			"col", "embed", "hr",
			"img", "input", "link",
			"meta", "param", "source",
			"track", "wbr"
		]

		/**
		 * @param {number} length
		 */
		const hasElmStartIndent = (length) => length > 0 ? '\n' + '\t'.repeat(indent + 1) : ''

		/**
		 * @param {number} length
		 */
		const hasElmEndIndent = (length) => length > 0 ? '\n' + '\t'.repeat(indent) : ''
		const emptyTagSelfClosure = emptyTags.includes(this.name) ? '/' : ''

		const childMarkup = this.childNodes.map(x => x.toString(indent + 1)).join('\n' + '\t'.repeat(indent + 1))
		const selfAttrs = this.attributes.map(x => `${x.name} = "${stringify(x.value)}"`).join(" ")
		const selfCallbacks = this.callbacks.map(x => x.toString(indent + 1)).join('\n' + '\t'.repeat(indent))

		const selfMarkupHead = `<${this.name}${selfAttrs.length ? ' ' : ''}${selfAttrs}${emptyTagSelfClosure}>`
		const selfMarkupTail = `${hasElmStartIndent(childMarkup.length || selfCallbacks.length) +
			childMarkup +
			(selfCallbacks.length ? hasElmStartIndent(childMarkup.length) + selfCallbacks : '') +
			hasElmEndIndent(childMarkup.length || selfCallbacks.length)}</${this.name}>`
		const selfMarkup = `${selfMarkupHead}${!emptyTagSelfClosure ? selfMarkupTail : ''}`

		return selfMarkup
	}

	initial = {
		context: this,
		createNode(recreate = true) {
			const jqElement = this.context
			if (recreate)
				jqElement.htmlNode = document.createElement(jqElement.name)
			return this
		},
		attachAttributes() {
			const jqElement = this.context
			for (const attribute of jqElement.attributes) {
				attribute.attachTo(jqElement)
			}
			return this
		},
		attachChildren() {
			const jqElement = this.context
			const callbackPosNodePairs = jqElement.callbacks.map(callback =>
				/**@type {const}*/([callback.nodePosition, callback]))

			for (const childNode of jqElement.childNodes) {
				callbackPosNodePairs.forEach(([pos, callback], idx) =>
					attachCallback(idx, childNode.nodePosition, pos, callback))

				childNode.attachTo(jqElement)
			}

			callbackPosNodePairs.forEach(([pos, callback], idx) =>
				attachCallback(idx, -1, pos, callback, true))

			return this

			/**
			 * @param {number} idx 
			 * @param {number} childNodePos 
			 * @param {number} callbackPos 
			 * @param {JqCallback} callback 
			 * @param {boolean} ignorePos
			 */
			function attachCallback(idx, childNodePos, callbackPos, callback, ignorePos = false) {
				if (!ignorePos && callbackPos >= childNodePos) return
				callback.attachTo(jqElement)
				callbackPosNodePairs.splice(idx, 1)
			}
		},
		attachEventListeners() {
			const jqElement = this.context
			for (const jqEvent of jqElement.events) {
				jqEvent.attachTo(jqElement)
			}
			return this
		},
		attachAnimations() {
			const jqElement = this.context
			if (jqElement.animations.length == 0) return this

			observeElement(/**@type {HTMLElement}*/(jqElement.htmlNode), ([entry, observer]) => {
				if (entry.isIntersecting) {
					for (const animation of jqElement.animations) {
						animation.attachTo(jqElement)
					}
					observer.disconnect()
				}
			})

			return this
		},
		attachStyles() {
			const jqElement = this.context
			if (jqElement.inlineStyles.length == 0 && jqElement.blockStyles.length == 0) return this
			if (canHaveShadow(/**@type {HTMLElement}*/(jqElement.htmlNode))) {
				jqElement.shadowRoot = /**@type {HTMLElement}*/ (jqElement.htmlNode).attachShadow({ mode: "open" })
				const styleSheet = document.createElement("style")
				styleSheet.textContent = ''

				jqElement.scopedStyleSheet = styleSheet
				jqElement.shadowRoot.appendChild(styleSheet)

				/**
				 * @type {JqCSSProperty[]}
				 */
				const styleProperties = []
				for (const style of jqElement.inlineStyles) {
					style.attachTo(jqElement)
					styleProperties.push(style)
				}

				for (const style of jqElement.blockStyles) {
					style.attachTo(jqElement)
					styleSheet.textContent += '\n' + style.toString()
				}

				const stylePropertiesStr = styleProperties.join("\n\t")
				if (stylePropertiesStr.length > 0)
					styleSheet.textContent += `\n:host {\n\t${stylePropertiesStr}\n}`

				return this
			}

			throw new Error(`JqError - scoped styles are not supported for '${jqElement.name}' element.`)
		},
		attachCallbacks() {
			const jqElement = this.context
			for (const callback of jqElement.callbacks) {
				callback.attachTo(jqElement)
			}
			return this
		}
	}

	update = {
		context: this,
		/**
		 * @param {JqElement | JqFragment | JqText} oldChildNode 
		 * @param {JqElement | JqFragment | JqText} newChildNode
		 */
		replaceChild(oldChildNode, newChildNode) {
			const jqElement = this.context
			const delChildIdx = jqElement.childNodes.findIndex(childNode => Object.is(childNode, oldChildNode))
			if (delChildIdx == -1)
				throwError("JqInternalError - childNode not found in jqElement.childNodes")

			jqElement.childNodes.splice(delChildIdx, 1, newChildNode)

			if (!(oldChildNode instanceof JqText))
				oldChildNode.childNodes.forEach(childNode => childNode.delete.deleteSelf())

			const jqParent = /**@type {JqElement | JqFragment}*/ (oldChildNode.jqParent)
			const htmlNode = /**@type {Node | HTMLElement}*/ (jqParent.htmlNode)
			htmlNode.replaceChild(
				/**@type {Node | HTMLElement | Text}*/(newChildNode.htmlNode),
				/**@type {Node | HTMLElement | Text}*/(oldChildNode.htmlNode)
			)
			return this
		}
	}

	delete = {
		context: this,
		/**
		 * @param {JqAttribute} jqAttribute
		 */
		removeAttribute(jqAttribute) {
			const jqElement = this.context
			const indexOfAttr = jqElement.attributes.indexOf(jqAttribute)

			if (indexOfAttr != -1)
				jqElement.attributes.splice(indexOfAttr, 1);

			/**@type {HTMLElement}*/ (jqElement.htmlNode).removeAttribute(jqAttribute.name)
			return this
		},
		deleteSelf() {
			const jqElement = this.context
			const jqParent = /**@type {JqElement | JqFragment}*/ (jqElement.jqParent)

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqElement))

			if (delChildIdx == -1)
				throwError("JqInternalError - JqElement not found in its jqParent.childNodes")

			jqParent.childNodes.splice(delChildIdx, 1)
			jqElement.childNodes.forEach(childNode => childNode.delete.deleteSelf());
			/**@type {HTMLElement}*/ (jqElement.htmlNode).remove()
			return this
		}
	}

	/**
	 * @param {HTMLElement} context 
	 * @param {string} name 
	 * @param {JqElementParameters} nodes
	 */
	static custom = (context, name, nodes) => {
		return new JqElement(name, { ...nodes, htmlNode: context })
	}
}

/**
 * @param {HTMLElement} element 
 * @param {ResolveFn} callback
 */
export function observeElement(element, callback) {

	/**
	 * 
	 * @param {ResolveFn} callback 
	 * @returns {IntersectionObserverCallback}
	 */
	const observerCallback =
		callback => (entries, observer) =>
			entries.forEach(entry => callback([entry, observer]))

	return new IntersectionObserver(observerCallback(callback)).observe(element)
}

/**
 * @param {HTMLElement} element
 */
export function canHaveShadow(element) {
	try {
		return Boolean(/**@type {HTMLElement}*/(element.cloneNode()).attachShadow({ mode: "open" }))
	} catch {
		return false
	}
}

/**
 * @param {string} str
 */
export const camelToKebab = (str) =>
	str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())

/**
 * @param {string} errorMessage 
 * @param {{ [x: string]: Primitive }} styleObject
 */
export function createPropertyListFromStyleObject(errorMessage, styleObject) {
	/**
	 * @param {any} value
	 */
	const isObject = (value) => value !== null && typeof value == "object"
	if (!isObject(styleObject))
		throw new Error(errorMessage)

	/**
	 * @type {JqCSSProperty[]}
	 */
	const styleProperties = Object.entries(styleObject)
		.map(([key, value]) => new JqCSSProperty(key, value))

	return new JqList(JqCSSProperty, styleProperties)
}

/**
 * @template {string} T
 * @param {HexColor<T>} col
 * @param {number} amt
 */
export function adjustColor(col, amt) {

	let usePound = false

	if (col[0] == "#") {
		col = /**@type {HexColor<T>}*/ (/**@type {string}*/ (col).slice(1))
		usePound = true
	}

	const num = parseInt(col, 16)

	let r = (num >> 16) + amt

	if (r > 255) r = 255
	else if (r < 0) r = 0

	let b = ((num >> 8) & 0x00FF) + amt

	if (b > 255) b = 255
	else if (b < 0) b = 0

	let g = (num & 0x0000FF) + amt

	if (g > 255) g = 255
	else if (g < 0) g = 0

	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16)
}

/**
 * @param {JqNode} node1 
 * @param {JqNode} node2
 */
function diff(node1, node2) {
	const nodeComparison = compareJqNodes(node1, node2)
	return nodeComparison

	/**
	 * @typedef {{ object: JqNode, props: string[][] }} CompareProps
	 */

	/**
	 * @param {CompareProps} affected1 
	 * @param {CompareProps} affected2
	 */
	function compareProps(affected1, affected2) {
		/**
		 * @type {Diff}
		 */
		const diff = {
			type: Object.getPrototypeOf(affected1.object).constructor,
			node1: affected1.object,
			node2: affected2.object,
			[CREATED]: [],
			[UPDATED]: [],
			[DELETED]: [],
			[UNCHANGED]: [],
			childDiffs: [],
		}

		const deletedProps = affected1.props.filter(prop =>
			isNullish(getPropertyValue(/**@type {any}*/(affected2.object), prop)))

		diff[DELETED] = /**@type {any}*/ (deletedProps)

		const createdProps = affected2.props.filter(prop =>
			isNullish(getPropertyValue(/**@type {any}*/(affected1.object), prop)))

		diff[CREATED] = /**@type {any}*/ (createdProps)

		const updatedProps = affected1.props.filter(prop =>
			getPropertyValue(/**@type {any}*/(affected2.object), prop) !==
			getPropertyValue(/**@type {any}*/(affected1.object), prop))

		diff[UPDATED] = /**@type {any}*/ (updatedProps)

		const unchangedProps = affected1.props.filter(prop =>
			getPropertyValue(/**@type {any}*/(affected2.object), prop) ===
			getPropertyValue(/**@type {any}*/(affected1.object), prop))

		diff[UNCHANGED] = /**@type {any}*/ (unchangedProps)

		return diff
	}

	/**
	 * @param {JqText} node1 
	 * @param {JqText} node2
	 */
	function compareJqTexts(node1, node2) {
		const affected1 = {
			object: node1,
			props: [["text"]]
		}

		const affected2 = {
			object: node2,
			props: [["text"]]
		}

		const diff = compareProps(affected1, affected2)
		return diff
	}

	/**
	 * @param {JqAttribute} jqAttribute1 
	 * @param {JqAttribute} jqAttribute2
	 */
	function compareJqAttributes(jqAttribute1, jqAttribute2) {
		const affected1 = {
			object: jqAttribute1,
			props: [["name"], ["value"]]
		}

		const affected2 = {
			object: jqAttribute2,
			props: [["name"], ["value"]]
		}

		const diff = compareProps(affected1, affected2)
		return diff
	}

	/**
	 * @param {JqFragment} node1 
	 * @param {JqFragment} node2
	 */
	function compareJqFragments(node1, node2) {
		const firstFragChildren = node1.childNodes
		const secondFragChildren = node2.childNodes

		/**
		 * @type {Diff}
		 */
		const _diff = {
			type: Object.getPrototypeOf(node1).constructor,
			node1: node1,
			node2: node2,
			[CREATED]: [],
			[UPDATED]: [],
			[DELETED]: [],
			[UNCHANGED]: [],
			childDiffs: [],
		}

		for (let i = 0; i < Math.max(firstFragChildren.length, secondFragChildren.length); i++) {
			const firstFragChild = firstFragChildren[i]
			const secondFragChild = secondFragChildren[i]

			if (firstFragChild === undefined)
				_diff[CREATED].push(["childNodes", secondFragChild])
			else if (secondFragChild === undefined)
				_diff[DELETED].push(["childNodes", firstFragChild])
			else
				_diff.childDiffs.push(diff(firstFragChild, secondFragChild))
		}

		return _diff
	}

	/**
	 * @param {JqElement} node1 
	 * @param {JqElement} node2
	 */
	function compareJqElements(node1, node2) {
		const firstElemChildren = node1.childNodes
		const secondElemChildren = node2.childNodes

		const firstElemAttributes = node1.attributes
		const secondElemAttributes = node2.attributes

		/**
		 * @type {Diff}
		 */
		const _diff = {
			type: Object.getPrototypeOf(node1).constructor,
			node1: node1,
			node2: node2,
			[CREATED]: [],
			[UPDATED]: [],
			[DELETED]: [],
			[UNCHANGED]: [],
			childDiffs: [],
		}

		for (let i = 0; i < Math.max(firstElemChildren.length, secondElemChildren.length); i++) {
			const firstElemChild = firstElemChildren[i]
			const secondElemChild = secondElemChildren[i]

			if (firstElemChild === undefined)
				_diff[CREATED].push(["childNodes", i + ""])
			else if (secondElemChild === undefined)
				_diff[DELETED].push(["childNodes", i + ""])
			else
				_diff.childDiffs.push(diff(firstElemChild, secondElemChild))
		}

		for (let i = 0; i < Math.max(firstElemAttributes.length, secondElemAttributes.length); i++) {
			const firstElemAttribute = firstElemAttributes[i]
			const secondElemAttribute = secondElemAttributes[i]

			if (firstElemAttribute === undefined)
				_diff[CREATED].push(["attributes", i + ''])
			else if (secondElemAttribute === undefined)
				_diff[DELETED].push(["attributes", i + ''])
			else
				_diff.childDiffs.push(diff(firstElemAttribute, secondElemAttribute))
		}

		return _diff
	}

	/**
	 * @param {JqNode} node1 
	 * @param {JqNode} node2
	 */
	function compareJqNodes(node1, node2) {
		if (isJqElement(node1) && isJqElement(node2))
			return compareJqElements(/**@type {JqElement}*/(node1), /**@type {JqElement}*/(node2))
		if (isJqFragment(node1) && isJqFragment(node2))
			return compareJqFragments(/**@type {JqFragment}*/(node1), /**@type {JqFragment}*/(node2))
		if (isJqAttribute(node1) && isJqAttribute(node2))
			return compareJqAttributes(/**@type {JqAttribute}*/(node1), /**@type {JqAttribute}*/(node2))
		if (isJqText(node1) && isJqText(node2))
			return compareJqTexts(/**@type {JqText}*/(node1), /**@type {JqText}*/(node2))

		return compareJqGenericNodes(node1, node2)
	}

	/**
	 * @param {JqNode} [node1] 
	 * @param {JqNode} [node2]
	 */
	function compareJqGenericNodes(node1, node2) {
		/**
		 * @type {Diff}
		 */
		const _diff = {
			type: Object.getPrototypeOf(node1).constructor,
			node1: /**@type {JqNode}*/ (node1),
			node2: /**@type {JqNode}*/ (node2),
			[CREATED]: [],
			[UPDATED]: [],
			[DELETED]: [],
			[UNCHANGED]: [],
			childDiffs: [],
		}

		const [isNode1, isNode2] = [isNullish(node1), isNullish(node2)]

		if (isNode1)
			_diff[CREATED].push(["self"])
		if (isNode2)
			_diff[DELETED].push(["self"])

		if (isNode1 || isNode2) return _diff

		const jqParent = /**@type {JqElement | JqFragment}*/ (/**@type {JqElement | JqFragment}*/(node1).jqParent)
		_diff[UPDATED].push(["childNodes", /**@type {JqNode}*/ (node2)])

		return _diff
	}
}

export const validHTMLElements = /**@type {const}*/ ([
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
])

/**
 * @typedef {null | undefined | number | string | symbol | bigint} Primitive
 * 
 * @typedef {{ [styleName: string]: Primitive | Primitive[] }
 * | Map<string, Primitive>
 * | Array<{ [styleName: string]: Primitive | Primitive[] } | Map<string, Primitive>>} AnimationStyles
 * 
 * @typedef {{
 *    duration?: string | number,
 *    easing?: string,
 *    complete?: (..._: unknown[]) => unknown,
 *    step?: (..._: unknown[]) => unknown,
 *    progress?: (..._: unknown[]) => unknown,
 *    specialEasing?: AnimationStyles,
 *    start?: (..._: unknown[]) => unknown,
 *    done?: (..._: unknown[]) => unknown,
 *    fail?: (..._: unknown[]) => unknown,
 *    always?: (..._: unknown[]) => unknown
 * }} AnimationOptions
 * 
 * @typedef {(styles: AnimationStyles, ...options: ([speed?: number | "fast" | "slow", easing?: string, callback?: (..._: unknown[]) => unknown]) | [option: AnimationOptions]) => Animation} AnimateFn
 * 
 * @typedef {(arg0: [IntersectionObserverEntry, IntersectionObserver]) => unknown} ResolveFn
 * 
 * @typedef {(reason?: unknown) => unknown} RejectFn
 * 
 * @typedef {{
 *    type: new (...a: any) => JqNode,
 *    node1: JqNode,
 *    node2: JqNode,
 *    [UPDATED]: [string, ...Array<string | JqNode>][],
 *    [DELETED]: [string, ...Array<string | JqNode>][],
 *    [CREATED]: [string, ...Array<string | JqNode>][],
 *    [UNCHANGED]: [string, ...Array<string | JqNode>][],
 *    childDiffs: Diff[]
 * }} Diff
 * 
 * @typedef {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqEvent | JqState | JqFragment | JqText | JqCallback} JqNode
 * 
 * @typedef {'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'} HexDigit
 * 
 * @typedef {{
 *    childNodes: Array<JqElement | JqFragment | JqText>,
 *    attributes: JqAttribute[], events: JqEvent[],
 *    animations: JqAnimation[], inlineStyles: Array<JqCSSProperty>, blockStyles: Array<JqCSSRule>,
 *    callbacks: JqCallback[], htmlNode?: HTMLElement
 * }} JqElementParameters
 * 
 * @typedef {JqText | JqAttribute | JqElement | JqFragment} DiffableJqNode
 * 
 * @typedef {JqList<JqState, typeof JqState> | JqEvent} CallbackArg
 */

/**
 * @template {string} T
 * @typedef { T extends `#${HexDigit}${HexDigit}${HexDigit}${infer Rest1}`
 *    ? (
 *       Rest1 extends ``
 *          ? T
 *          : (
 *             Rest1 extends `${HexDigit}${HexDigit}${HexDigit}`
 *                ? T
 *                : never
 *           )
 *      )
 *    : never
 * } HexColor
 */