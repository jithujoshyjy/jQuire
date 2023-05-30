
/**
 * 
 * @param {string} rootPath 
 * @returns {(relativePath: string) => string}
 */
export function pathSetter(rootPath: string) {
	return function (relativePath: string) {
		return rootPath.replace(/\/\s*$/, '') + '/' +
			relativePath.replace(/^(?:\s*\.)?\s*\//, '');
	};
}

export function isPrimitive(test: unknown) {
	return test !== Object(test);
}

const isJqElement = (...xs: any[]) => xs.every(x => x instanceof JqElement)
const isJqAttribute = (...xs: any[]) => xs.every(x => x instanceof JqAttribute)
const isJqFragment = (...xs: any[]) => xs.every(x => x instanceof JqFragment)
const isJqText = (...xs: any[]) => xs.every(x => x instanceof JqText)

const CREATED = Symbol("created")
const UPDATED = Symbol("updated")
const DELETED = Symbol("deleted")
const UNCHANGED = Symbol("unchanged")

export const throwError = (e: string) => { throw new Error(e) }
export const JqNodeReference = Symbol("JqNodeReference")
/**
 * 
 * @param {unknown[]} nodes 
 * @returns {{readonly domNodes: [number, HTMLElement | Text | (HTMLElement | Text)[] | JqCallback][]; readonly attributes: [number, Attr][]; readonly events: [...][]; readonly references: [...][]; readonly animations: [...][];readonly styles: [...][];}}
 */
export function getNodes(nodes: Array<JqElement | JqFragment | JqText | JqAttribute | JqEvent | JqReference | JqAnimation | JqCSSProperty | JqCSSRule | Primitive>) {
	const childNodes: Array<JqElement | JqFragment | JqText> = []
	const attributes: JqAttribute[] = []
	const events: JqEvent[] = []
	const references: JqReference[] = []
	const animations: JqAnimation[] = []
	const callbacks: JqCallback[] = []
	const inlineStyles: JqCSSProperty[] = []
	const blockStyles: JqCSSRule[] = []
	const childNodeClasses = [JqElement, JqFragment, JqText]

	for (const [i, node] of nodes.entries()) {
		if (childNodeClasses.some(childNodeClass => node instanceof childNodeClass)) {
			const _node = node as JqElement | JqFragment | JqText
			_node.nodePosition = i
			childNodes.push(_node)
		}
		else if (node instanceof JqAttribute) {
			node.nodePosition = i
			attributes.push(node)
		}
		else if (node instanceof JqList && node.nodeClass === JqAttribute) {
			node.nodes.forEach((attribute: JqAttribute) => {
				attribute.nodePosition = i
				attributes.push(attribute)
			})
		}
		else if (node instanceof JqEvent) {
			node.nodePosition = i
			events.push(node)
		}
		else if (node instanceof JqReference) {
			const _node = node[JqNodeReference]
			_node.nodePosition = i
			references.push(_node)
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
			const _node = convertToJqNode(node) as JqFragment
			_node.nodePosition = i
			childNodes.push(_node)
		}
		else if (typeof node == "function") {
			const _node = convertToJqNode(node) as JqCallback
			_node.nodePosition = i
			callbacks.push(_node)
		}
		else if (isPrimitive(node)) {
			const _node = convertToJqNode(node) as JqText
			_node.nodePosition = i
			childNodes.push(_node)
		}
	}

	return {
		childNodes, attributes,
		events, references,
		animations, inlineStyles,
		blockStyles, callbacks
	} as const
}

export function convertToJqNode(value: any): JqText | JqFragment | JqCallback {
	const convertToJqText = (value: Primitive | Primitive[]) =>
		new JqText(value as Primitive ?? '')

	const convertToJqFragment = (value: Primitive[]) =>
		new JqFragment(value.map(x => convertToJqNode(x) as JqFragment | JqText))

	if (Array.isArray(value))
		return convertToJqFragment(value)

	if (isPrimitive(value))
		return convertToJqText(value)

	if (typeof value == "function")
		return new JqCallback(value)

	return throwError(`JqError - Unexpected value found in place of a JqNode`)
}

const getPropertyValue = (object: object, props: string[]):
	Primitive | { [x: string | symbol]: any } => {
	let result = object
	for (let i = 0; i < props.length; i++) {
		result = result?.[props[i] as keyof typeof result]
		if (isNullish(result)) return result
	}
	return result
}

export function escapeHTMLEntities(text: string) {
	const entityRegex1 = /(&#x[0-9A-F]{2,6};)/gi
	const entityRegex2 = /(&[a-z0-9]+;)/gi

	const replacer = (t: string, e: string) =>
		new DOMParser().parseFromString(e, "text/html").documentElement.textContent ?? ''

	const _text = text.replace(entityRegex1, replacer)
		.replace(entityRegex2, replacer)

	return _text
}

export function stringify(value: unknown) {
	return isPrimitive(value) ? String(value ?? '') : JSON.stringify(value)
}

export function isNullish(value: unknown) {
	return value === null || value === undefined
}

type DiffableJqNode = JqText | JqAttribute | JqElement | JqFragment

export class JqCallback {
	nodePosition = -1
	jqParent: JqElement | null = null
	returned: JqNode | null = null
	callback: (a: { [x: string | symbol]: unknown }) => JqNode | Primitive = (_) => null

	refProxy = new Proxy({ context: this }, {
		get(target, prop) {
			return target.context.jqParent?.getStateRefValue(prop)
		},
		set(target, prop, value) {
			target.context.jqParent?.setStateRefValue(prop, value)
			return true
		}
	})

	constructor(callback: (a: { [x: string | symbol]: unknown }) => JqNode | Primitive) {
		this.callback = callback
	}

	invoke() {
		const returned = this.callback(this.refProxy)
		const node = Array.isArray(returned) || isPrimitive(returned)
			? convertToJqNode(returned) as JqNode
			: returned as JqNode

		return node
	}

	attachTo(node: Node | JqElement) {
		if (node instanceof HTMLElement) {
			const childNode = this.invoke()
			childNode.attachTo(node)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			this.returned = this.invoke()
			this.returned.attachTo(node)
		}
		else {
			throw new Error(`JqError - Cannot attach JqCallback to a node not of instance JqElement or JqText or JqFragment or HTMLElement`)
		}
		return this
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

			function reconcile(rootNode: JqNode, parentNode: JqNode, oldNode: JqNode, newNode: JqNode): void {
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
						(node1 as DiffableJqNode).delete.deleteSelf()
					}
				}

				for (const childDiff of _diff.childDiffs)
					reconcile(rootNode, _diff.node1, childDiff.node1, childDiff.node2)
			}

			function updateAttribute(this: any, diff: Diff, props: string[]) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqAttribute))
					return this
				const _node1 = diff.node1 as JqAttribute
				const _node2 = diff.node2 as JqAttribute
				return _node1.update.setAttribute(_node2.value)
			}

			function updateText(this: any, diff: Diff, props: string[]) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqText))
					return this
				const _node1 = diff.node1 as JqText
				const _node2 = diff.node2 as JqText
				_node1.update.setText(_node2.text)
			}

			function createElement(this: any, diff: Diff, props: string[]) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqElement))
					return this

				const _node1 = diff.node1 as JqElement
				const _node2 = diff.node2 as JqElement
				const childNode = getPropertyValue(_node2, props) as JqNode

				const lastElemIdx = Number(diff[CREATED][diff[CREATED].length - 1])
				_node1.childNodes.splice(lastElemIdx, 0, childNode as any)

				const node1LastChild = _node1.childNodes[_node1.childNodes.length - 1] as JqText | JqElement
				const node1LastChildNextSibling = node1LastChild.htmlNode!.nextSibling

				childNode.jqParent = _node1
				if (childNode instanceof JqElement || childNode instanceof JqText) {
					childNode.initial.createNode();
					(_node1.shadowRoot || _node1.htmlNode)!.insertBefore(childNode.htmlNode!, node1LastChildNextSibling)
				}
			}

			function createFragment(this: any, diff: Diff, props: string[]) {
				if (![diff.node1, diff.node2].every(node => node instanceof JqFragment))
					return this

				const _node1 = diff.node1 as JqFragment
				const _node2 = diff.node2 as JqFragment

				const jqElement = _node1.jqParent!
				const childNode = getPropertyValue(_node2, props) as JqNode
				const insertionIdx = Number(props[props.length - 1]) - 1

				const nodeAtInsIdx = _node1.childNodes[insertionIdx] as JqText | JqElement
				const nodeAtInsIdxNextSibling = nodeAtInsIdx.htmlNode!.nextSibling

				_node1.childNodes.splice(insertionIdx + 1, 0, childNode as any)

				let jqElementAdjacentChildIdx = jqElement.childNodes
					.findIndex(childNode => Object.is(childNode, nodeAtInsIdx))

				jqElementAdjacentChildIdx = jqElementAdjacentChildIdx == -1
					? jqElement.childNodes.length - 1
					: jqElementAdjacentChildIdx

				jqElement.childNodes.splice(jqElementAdjacentChildIdx, 0, childNode as any)

				childNode.jqParent = _node1
				if (childNode instanceof JqElement || childNode instanceof JqText) {
					childNode.initial.createNode()
					const mountPoint = jqElement.shadowRoot ?? jqElement.htmlNode
					mountPoint!.insertBefore(childNode.htmlNode!, nodeAtInsIdxNextSibling)
				}
			}

			function deleteJqFragmentChild(this: any, diff: Diff, props: string[]) {
				const _node1 = diff.node1 as JqFragment
				const _node2 = diff.node2 as JqFragment

				const toBeDelNode = getPropertyValue(_node1, props) as JqFragment | JqElement | JqText
				toBeDelNode.delete.deleteSelf()
			}

			function deleteJqElementChild(this: any, diff: Diff, props: string[]) {
				const _node1 = diff.node1 as JqElement
				const _node2 = diff.node2 as JqElement

				const toBeDelNode = getPropertyValue(_node1, props) as JqFragment | JqElement | JqText
				toBeDelNode.delete.deleteSelf()
			}
		}
	}
}

export class JqEvent {
	nodePosition = -1
	event: string
	handler: (...a: unknown[]) => unknown = (_) => { }
	jqParent: JqElement | null = null

	constructor(event: string, handler: (...a: unknown[]) => unknown) {
		this.event = event
		this.handler = handler
	}

	attachHandler(element: HTMLElement) {
		element.addEventListener(this.event, this.handler)
	}

	detachHandler(element: HTMLElement) {
		element.removeEventListener(this.event, this.handler)
	}

	attachTo(node: Node | JqElement) {
		if (node instanceof HTMLElement) {
			this.attachHandler(node)
		}
		else if (node instanceof JqElement) {
			this.attachHandler(node.htmlNode!)
		}
		else {
			throw new Error(`JqError - Cannot attach JqEvent '${this.event}' to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}
}

export const ElementReference = Symbol("ElementReference")
export const StateReference = Symbol("StateReference")

export class JqReference {
	[JqNodeReference]: any
	[StateReference]: { [x: string | symbol]: unknown }
	[ElementReference]: HTMLElement | null = null;

	nodePosition = -1
	jqParent: JqElement | null = null

	constructor(state: { [x: string | symbol]: unknown } = {}) {
		this[StateReference] = state
	}

	attachTo = (node: Node | JqElement) => {
		if (node instanceof HTMLElement) {
			this[ElementReference] = node
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			this[ElementReference] = node.htmlNode!
		}
		else {
			throw new Error(`JqError - Cannot attach JqReference to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	deref = (): HTMLElement | null => {
		return this[ElementReference]
	}

	refresh = async (callback: (x: { [x: string | symbol]: unknown }, ...a: any[]) => any) => {
		const result = await callback(this[StateReference])
		this.jqParent!.update.updateNode()
		return result
	}
}

export class JqAnimation {
	domAnimation: Animation | null = null
	nodePosition = -1
	#parameters: Parameters<AnimateFn>
	jqParent: JqElement | null = null

	constructor(...parameters: Parameters<AnimateFn>) {
		this.#parameters = parameters
	}

	attachTo(node: Node | JqElement) {
		if (node instanceof HTMLElement) {
			this.animate(node)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			this.animate(node.htmlNode!)
		}
		else {
			throw new Error(`JqError - Cannot attach JqAnimation to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	animate(element: HTMLElement): ReturnType<AnimateFn> {

		const [_styles, _options, ..._moreOptions] = this.#parameters

		const setStartStyles = (styles: { [styleName: string]: Primitive | Primitive[] }, ..._: unknown[]) => {
			const styleNames = Object.keys(styles).filter(styleName => !Array.isArray(styles[styleName]))
			const _styles = styleNames.map(styleName => {
				const finalStyleValue = styles[styleName] as Primitive
				const initialStyleValue = getComputedStyle(element).getPropertyValue(styleName)

				return [styleName, [initialStyleValue, finalStyleValue]]
			})

			const x = { ...styles, ...Object.fromEntries(_styles) }
			return x
		}

		let callback: ((..._: unknown[]) => unknown) | null = null
		let options = (isPrimitive(_options) ? null : _options) as Parameters<Element["animate"]>[1]

		options ??= (() => {
			const [speed, easing, _callback] = [_options, ..._moreOptions]
			if (_callback) callback = _callback
			const option = {
				duration: speed ?? 400,
				easing: easing ?? "linear",
				fill: "forwards"
			}
			return option as Parameters<Element["animate"]>[1]
		})()

		const __styles = (Array.isArray(_styles)
			? _styles.map(x => x instanceof Map ? Object.fromEntries(x) : x)
			: _styles instanceof Map ? Object.fromEntries(_styles) : _styles)

		const styles = (Array.isArray(__styles)
			? __styles.map(setStartStyles)
			: setStartStyles(__styles)) as unknown as Parameters<Element["animate"]>[0]

		this.domAnimation = element.animate(styles, options)
		callback && this.domAnimation.addEventListener("finish", callback)

		return this.domAnimation
	}
}

export class JqCSSProperty {
	name: string
	value: string
	nodePosition = -1
	jqParent: JqElement | null = null

	constructor(name: string, value: unknown) {
		this.name = camelToKebab(name).replace(/_/g, '-')
		this.value = String(value)
	}

	attachTo(node: Node | JqElement) {
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

	toString(indent = 1): string {
		return `${this.name}: ${this.value};`
	}
}

export class JqCSSRule {
	nodePosition = -1
	head: [string, ...string[]]
	body: Array<JqCSSProperty | JqCSSRule> = []
	jqParent: JqElement | null = null

	constructor([ruleName, ...ruleArgs]: [string, ...string[]],
		...styleNodes: (Array<JqCSSProperty | JqCSSRule> | { [x: string]: Primitive }[])) {

		this.head = [ruleName, ...ruleArgs]

		const errorMessage = `JqError - Invalid argument passed to ${this.head.join(' ').trim()}(...)`
		this.body = styleNodes.flatMap(styleNode =>
			styleNode instanceof JqCSSProperty || styleNode instanceof JqCSSRule
				? styleNode
				: createPropertyListFromStyleObject(errorMessage, styleNode).nodes
		)
	}

	attachTo(node: Node | JqElement) {
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

	toString(indent = 1): string {
		const space = '\t'.repeat(indent)
		let head = this.head.join(' ').trim()
		return `${head} {\n${space}${this.body.map(styleNode => styleNode.toString(indent + 1)).join('\n' + space)}\n${'\t'.repeat(indent - 1)}}`
	}
}

export class JqAttribute {
	#name: string = ''
	#value: string = ''
	nodePosition = -1
	attrNode: Attr | null = null
	jqParent: JqElement | null = null

	constructor(name: string, value: string) {
		this.name = camelToKebab(name).replace(/_/g, '-')
		this.value = value
	}

	get name() {
		return this.#name
	}
	set name(attrName: string) {
		this.#name = attrName
	}
	get value() {
		return this.#value
	}
	set value(attrValue: string) {
		this.#value = attrValue
	}

	attachTo(node: Node | JqElement) {
		this.initial.createNode()
		if (node instanceof HTMLElement) {
			node.setAttributeNode(this.attrNode!)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			node.htmlNode!.setAttributeNode(this.attrNode!)
		}
		else {
			throw new Error(`JqError - Cannot attach JqAttribute '${this.name}' to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	static objectToJqAttributes(attrObject: { [x: string]: Primitive }) {
		const errorMessage = `JqError - Invalid argument passed to attr(...)`

		if (attrObject === null || typeof attrObject !== "object")
			throw new Error(errorMessage)

		const attrList = Object.entries(attrObject)
			.map(([key, value]) => {
				const _name = camelToKebab(key).replace(/_/g, '-')
				const _value = String(value)

				const attribute = new JqAttribute(_name, _value)
				return attribute
			})

		return new JqList(JqAttribute, attrList)
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
			const jqAttribute = this.context
			jqAttribute.attrNode!.value = jqAttribute.value
			return this
		},
		setAttribute(value: string) {
			const jqAttribute = this.context
			if (value === jqAttribute.value) return this

			jqAttribute.value = value
			jqAttribute.attrNode!.value = value
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

	static List = {
		from(attrObject: { [x: string]: Primitive }) {

			if (attrObject === null || typeof attrObject !== "object")
				throw new Error(`JqError - Invalid argument passed to attr(...); expected an object.`)


			const attributes = Object.entries(attrObject)
				.map(([key, value]) => {
					const _name = camelToKebab(key).replace(/_/g, '-')
					const _value = String(value)

					const attribute = new JqAttribute(_name, _value)
					return attribute
				})

			return new JqList(JqAttribute, attributes)
		}
	}
}

export class JqFragment {
	nodePosition = -1
	jqParent: JqElement | null = null
	childNodes: Array<JqElement | JqFragment | JqText> = []

	constructor(childNodes: Array<JqElement | JqFragment | JqText>) {
		this.childNodes = childNodes
	}

	attachTo(node: Node | JqElement) {
		if (node instanceof HTMLElement) {
			this.childNodes.forEach(childNode => childNode.attachTo(node))
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			this.initial.attachChildren()
		}
		else {
			throw new Error(`JqError - Cannot attach JqFragment to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
	}

	initial = {
		context: this,
		attachChildren() {
			const jqElement = this.context
			for (const childNode of jqElement.childNodes) {
				childNode.attachTo(jqElement.jqParent!)
			}
			return this
		}
	}

	update = {
		context: this,
		updateNode() {
			this
				.updateChildren()
			return this
		},
		updateChildren() {
			const jqElement = this.context
			for (const childNode of jqElement.childNodes) {
				childNode.update.updateNode()
			}
			return this
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqFragment = this.context
			const jqParent = jqFragment.jqParent!

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqFragment))

			jqParent.childNodes.splice(delChildIdx, 1)
			jqFragment.childNodes.forEach(childNode => childNode.delete.deleteSelf())
			return this
		}
	}
}

export class JqText {
	nodePosition = -1
	jqParent: JqElement | JqFragment | null = null
	htmlNode: Text | null = null
	text: string = ''

	constructor(...primitives: Array<Primitive>) {
		this.text = primitives.map(primitive => String(primitive ?? '')).join('')
	}

	attachTo(node: Node | JqElement) {
		this.initial.createNode()
		if (node instanceof HTMLElement) {
			node.appendChild(this.htmlNode!)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node;
			(node.shadowRoot ?? node.htmlNode!).appendChild(this.htmlNode!)
		}
		else if (node instanceof JqFragment) {
			this.jqParent = node
			const parent = node.jqParent!;
			(parent.shadowRoot ?? parent.htmlNode!).appendChild(this.htmlNode!)
		}
		else {
			throw new Error(`JqError - Cannot attach JqText to a node not of instance JqElement or JqFragment or HTMLElement`)
		}
		return this
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
		setText(text: string) {
			const jqText = this.context
			jqText.htmlNode!.nodeValue = jqText.text = text
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqText = this.context
			const jqParent = jqText.jqParent!

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqText))

			jqParent.childNodes.splice(delChildIdx, 1)
			jqText.htmlNode!.remove()
			return this
		}
	}
}

export class JqList<U extends JqNode, T extends { new(...x: any[]): U }> {
	nodes: U[] = []
	nodeClass: T

	constructor(nodeClass: T, nodes: U[]) {
		this.nodeClass = nodeClass
		this.nodes = nodes
	}

	push(node: U) {
		if (!(node instanceof this.nodeClass))
			throw new Error(`JqError - Cannot push node not of instance '${this.nodeClass.name}' into JqList<${this.nodeClass.name}>`)
		this.nodes.push(node)
	}

	pop() {
		return this.nodes.pop()
	}
}

export class JqElement {
	name: string
	jqParent: JqElement | null = null
	shadowRoot: ShadowRoot | null = null
	htmlNode: HTMLElement | null = null
	childNodes: Array<JqElement | JqFragment | JqText> = []
	attributes: JqAttribute[] = []
	events: JqEvent[] = []
	animations: JqAnimation[] = []
	references: JqReference[] = []
	inlineStyles: Array<JqCSSProperty> = []
	blockStyles: Array<JqCSSRule> = []
	callbacks: JqCallback[] = []
	scopedStyleSheet: HTMLStyleElement | null = null
	nodePosition = -1

	constructor(name: string, childNodes: Array<JqElement | JqFragment | JqText>, attributes: JqAttribute[], events: JqEvent[], animations: JqAnimation[], references: JqReference[], inlineStyles: Array<JqCSSProperty>, blockStyles: Array<JqCSSRule>, callbacks: JqCallback[], scopedStyleSheet: HTMLStyleElement | null = null) {
		this.name = name
		this.childNodes = childNodes
		this.attributes = attributes
		this.events = events
		this.animations = animations
		this.references = references
		this.inlineStyles = inlineStyles
		this.blockStyles = blockStyles
		this.callbacks = callbacks
		this.scopedStyleSheet = scopedStyleSheet
	}

	attachTo(node: Node | JqElement) {
		const attachNode = () => this.initial
			.createNode()
			.attachReferences()
			.attachStyles()
			.attachAttributes()
			.attachChildren()
			.attachEventListeners()
			.attachAnimations()

		if (node instanceof HTMLElement) {
			attachNode()
			node.appendChild(this.htmlNode!)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node, attachNode();
			(node.shadowRoot ?? node.htmlNode!).appendChild(this.htmlNode!)
		}
		else {
			throw new Error(`JqError - Cannot attach JqElement '${this.name}' to a node not of instance JqElement or JqFragment or HTMLElement`)
		}

		return this
	}

	getStateRefValue(prop: string | symbol): any {
		const reference = this.references?.find(reference => prop in reference[StateReference])
		return reference?.[StateReference][prop] ?? this.jqParent?.getStateRefValue(prop)
	}

	setStateRefValue(prop: string | symbol, value: unknown): any {
		const reference = this.references?.find(reference => prop in reference[StateReference])
		if (reference) {
			reference[StateReference][prop] = value
			this.update.updateNode()
			return value
		}

		const _value = this.jqParent?.setStateRefValue(prop, value)
		return _value
	}

	initial = {
		context: this,
		createNode() {
			const jqElement = this.context
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
				[callback.nodePosition, callback] as const)

			for (const childNode of jqElement.childNodes) {
				callbackPosNodePairs.forEach(([pos, callback], idx) =>
					attachCallback(idx, childNode.nodePosition, pos, callback))

				childNode.attachTo(jqElement)
			}

			callbackPosNodePairs.forEach(([pos, callback], idx) =>
				attachCallback(idx, -1, pos, callback, true))

			return this

			function attachCallback(idx: number, childNodePos: number, callbackPos: number, callback: JqCallback, ignorePos = false) {
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

			observeElement(jqElement.htmlNode!, ([entry, observer]) => {
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
			if (canHaveShadow(jqElement.htmlNode!)) {
				jqElement.shadowRoot = jqElement.htmlNode!.attachShadow({ mode: "open" })
				const styleSheet = document.createElement("style")
				styleSheet.textContent = ''

				jqElement.scopedStyleSheet = styleSheet
				jqElement.shadowRoot.appendChild(styleSheet)

				const styleProperties: JqCSSProperty[] = []
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
		attachReferences() {
			const jqElement = this.context
			for (const reference of jqElement.references) {
				reference.attachTo(jqElement)
			}
			return this
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
		updateNode() {
			this
				.updateAttributes()
				.updateChildren()
				.updateCallbacks()
			return this
		},
		updateAttributes() {
			const jqElement = this.context
			for (const attribute of jqElement.attributes) {
				attribute.update.setAttribute(attribute.value)
			}
			return this
		},
		updateChildren() {
			const jqElement = this.context
			for (const childNode of jqElement.childNodes) {
				childNode.update.updateNode()
			}
			return this
		},
		updateStyles() {
			const jqElement = this.context
			for (const style of jqElement.inlineStyles) {
				// style.update.updateNode()
			}
			return this
		},
		updateCallbacks() {
			const jqElement = this.context
			for (const callback of jqElement.callbacks) {
				callback.update.updateCallback()
			}
			return this
		}
	}

	delete = {
		context: this,
		removeAttribute(jqAttribute: JqAttribute) {
			const jqElement = this.context
			const indexOfAttr = jqElement.attributes.indexOf(jqAttribute)

			if (indexOfAttr != -1)
				jqElement.attributes.splice(indexOfAttr, 1)

			jqElement.htmlNode!.removeAttribute(jqAttribute.name)
			return this
		},
		deleteSelf() {
			const jqElement = this.context
			const jqParent = jqElement.jqParent!

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqElement))

			jqParent.childNodes.splice(delChildIdx, 1)
			jqElement.childNodes.forEach(childNode => childNode.delete.deleteSelf())
			return this
		}
	}
}

/**
 * 
 * @param {boolean} condition 
 * @returns {true | null}
 */
export function showIf(condition: boolean) {
	return condition || null
}

export type Primitive = null | undefined | number | string | symbol | bigint

export type AnimationStyles = { [styleName: string]: Primitive | Primitive[] } | Map<string, Primitive>
	| Array<{ [styleName: string]: Primitive | Primitive[] } | Map<string, Primitive>>
export type AnimationOptions = {
	duration?: string | number,
	easing?: string,
	complete?: (..._: unknown[]) => unknown,
	step?: (..._: unknown[]) => unknown,
	progress?: (..._: unknown[]) => unknown,
	specialEasing?: AnimationStyles,
	start?: (..._: unknown[]) => unknown,
	done?: (..._: unknown[]) => unknown,
	fail?: (..._: unknown[]) => unknown,
	always?: (..._: unknown[]) => unknown
}

export type AnimateFn = (styles: AnimationStyles, ...options: ([speed?: number | "fast" | "slow", easing?: string, callback?: (..._: unknown[]) => unknown]) | [option: AnimationOptions]) => Animation

type ResolveFn = (arg0: [IntersectionObserverEntry, IntersectionObserver]) => unknown
type RejectFn = (reason?: unknown) => unknown

export function observeElement(element: HTMLElement, callback: ResolveFn) {

	const observerCallback: (callback: ResolveFn) => IntersectionObserverCallback =
		callback => (entries, observer) =>
			entries.forEach(entry => callback([entry, observer]))

	return new IntersectionObserver(observerCallback(callback)).observe(element)
}

export function canHaveShadow(element: HTMLElement) {
	try {
		return Boolean((element.cloneNode() as HTMLElement).attachShadow({ mode: "open" }))
	} catch {
		return false
	}
}

export const camelToKebab = (str: string) =>
	str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())

export function createPropertyListFromStyleObject(errorMessage: string, styleObject: { [x: string]: Primitive }) {
	if (styleObject === null || typeof styleObject !== "object")
		throw new Error(errorMessage)

	const styleProperties: JqCSSProperty[] = Object.entries(styleObject)
		.map(([key, value]) => new JqCSSProperty(key, value))

	return new JqList(JqCSSProperty, styleProperties)
}

export type JqNode = JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqEvent | JqReference | JqFragment | JqText

type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

type HexColor<T extends string> =
	T extends `#${HexDigit}${HexDigit}${HexDigit}${infer Rest1}`
	? (Rest1 extends ``
		? T // three-digit hex color
		: (
			Rest1 extends `${HexDigit}${HexDigit}${HexDigit}`
			? T  // six-digit hex color
			: never
		)
	)
	: never

export function adjustColor<T extends string>(col: HexColor<T>, amt: number) {

	let usePound = false

	if (col[0] == "#") {
		col = (col as string).slice(1) as HexColor<T>
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

type Diff = {
	type: new (...a: any) => JqNode,
	node1: JqNode,
	node2: JqNode,
	[UPDATED]: string[][],
	[DELETED]: string[][],
	[CREATED]: string[][],
	[UNCHANGED]: string[][],
	childDiffs: Diff[]
}

function diff(node1: JqNode, node2: JqNode) {

	return compareJqNodes(node1, node2)

	type CompareProps = { object: JqNode, props: string[][] }

	function compareProps(affected1: CompareProps, affected2: CompareProps) {
		const diff: Diff = {
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
			isNullish(getPropertyValue(affected2.object, prop)))

		diff[DELETED] = deletedProps

		const createdProps = affected2.props.filter(prop =>
			isNullish(getPropertyValue(affected1.object, prop)))

		diff[CREATED] = createdProps

		const updatedProps = affected1.props.filter(prop =>
			getPropertyValue(affected2.object, prop) !== getPropertyValue(affected1.object, prop))

		diff[UPDATED] = updatedProps

		const unchangedProps = affected1.props.filter(prop =>
			getPropertyValue(affected2.object, prop) === getPropertyValue(affected1.object, prop))

		diff[UNCHANGED] = unchangedProps

		return diff
	}

	function compareJqTexts(node1: JqText, node2: JqText) {
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

	function compareJqAttributes(jqAttribute1: JqAttribute, jqAttribute2: JqAttribute) {
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

	function compareJqFragments(node1: JqFragment, node2: JqFragment) {
		const firstFragChildren = node1.childNodes
		const secondFragChildren = node2.childNodes

		const _diff: Diff = {
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
				_diff[CREATED].push(["childNodes", i + ""])
			else if (secondFragChild === undefined)
				_diff[DELETED].push(["childNodes", i + ""])
			else
				_diff.childDiffs.push(diff(firstFragChild, secondFragChild))
		}

		return _diff
	}

	function compareJqElements(node1: JqElement, node2: JqElement) {
		const firstElemChildren = node1.childNodes
		const secondElemChildren = node2.childNodes

		const firstElemAttributes = node1.attributes
		const secondElemAttributes = node2.attributes

		const _diff: Diff = {
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
			const firstFragChild = firstElemChildren[i]
			const secondFragChild = secondElemChildren[i]

			if (firstFragChild === undefined)
				_diff[CREATED].push(["childNodes", i + ""])
			else if (secondFragChild === undefined)
				_diff[DELETED].push(["childNodes", i + ""])
			else
				_diff.childDiffs.push(diff(firstFragChild, secondFragChild))
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

	function compareJqNodes(node1: JqNode, node2: JqNode) {
		if (isJqElement(node1) && isJqElement(node2))
			return compareJqElements(node1 as JqElement, node2 as JqElement)
		if (isJqFragment(node1) && isJqFragment(node2))
			return compareJqFragments(node1 as JqFragment, node2 as JqFragment)
		if (isJqAttribute(node1) && isJqAttribute(node2))
			return compareJqAttributes(node1 as JqAttribute, node2 as JqAttribute)
		if (isJqText(node1) && isJqText(node2))
			return compareJqTexts(node1 as JqText, node2 as JqText)

		return compareJqGenericNodes(node1, node2)
	}

	function compareJqGenericNodes(node1: JqNode | undefined, node2: JqNode | undefined) {
		const _diff: Diff = {
			type: Object.getPrototypeOf(node1).constructor,
			node1: node1!,
			node2: node2!,
			[CREATED]: [],
			[UPDATED]: [],
			[DELETED]: [],
			[UNCHANGED]: [],
			childDiffs: [],
		}

		const [isNode1, isNode2] = [isNullish(node1), isNullish(node2)]

		if (isNode1)
			_diff[CREATED].push(["this"])
		if (isNode2)
			_diff[DELETED].push(["this"])

		if (isNode1 || isNode2)
			return _diff

		const indexOfNode1 = node1!.jqParent!.childNodes.findIndex(x => Object.is(node1, x))
		_diff[UPDATED].push(["childNodes", indexOfNode1 + ''])

		return _diff
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
	"wbr"
] as const