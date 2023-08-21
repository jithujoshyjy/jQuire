const CREATED = Symbol("created")
const UPDATED = Symbol("updated")
const DELETED = Symbol("deleted")
const UNCHANGED = Symbol("unchanged")

export const OnAttachCallback = Symbol("OnAttachCallback")
export const OnDetachCallback = Symbol("OnDetachCallback")

export const StateReference = Symbol("StateReference")

export const PromisePending = Symbol("PromisePending")
export const PromiseResolved = Symbol("PromiseResolved")
export const PromiseRejected = Symbol("PromiseRejected")

/**
 * @type {{[x: string | symbol | number]: string}}
 */
export const paths = Object.create(null)

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

/**
 * @param  {unknown[]} values
 */
export function isNullish(...values) {
	return values.every(x => x === null || x === undefined)
}

const createHash = (length = 5) => Math.random().toString(32).replace(/\d\./, '').slice(0, length)

const getJqNodeConstructors = () => [
	JqElement, JqAttribute, JqCSSProperty,
	JqCSSRule, JqAnimation, JqEvent,
	JqWatch, JqFragment, JqText,
	JqEach, JqEvent, JqCondition,
	JqLifecycle, JqList, JqPromise
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
 *		blockStyles: JqCSSRule[], watchers: JqWatch[],
 *		conditions: JqCondition[], iterators: JqEach<any>[],
 *		lifecycles: JqLifecycle[], promiseStates: JqPromiseState<any>[]
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
	 * @type {JqWatch[]}
	 */
	const watchers = []

	/**
	 * @type {JqCondition[]}
	 */
	const conditions = []

	/**
	 * @type {JqEach<any>[]}
	 */
	const iterators = []

	/**
	 * @type {JqLifecycle[]}
	 */
	const lifecycles = []

	/**
	 * @type {JqPromiseState<any>[]}
	 */
	const promiseStates = []

	/**
	 * @type {JqCSSProperty[]}
	 */
	const inlineStyles = []

	/**
	 * @type {JqCSSRule[]}
	 */
	const blockStyles = []

	let i = 0
	for (const node of nodes) {
		classifyNode(node, i)
		i++
	}

	return /**@type {const}*/ ({
		childNodes, attributes,
		events, animations, inlineStyles,
		blockStyles, watchers, conditions, iterators,
		lifecycles, promiseStates
	})

	/**
	 * @param {any} node
	 * @param {number} i
	 */
	function classifyNode(node, i) {
		if (node instanceof JqElement) {
			node.nodePosition = i
			childNodes.push(node)
		}
		else if (node instanceof JqFragment) {
			node.nodePosition = i
			childNodes.push(node)
		}
		else if (node instanceof JqText) {
			node.nodePosition = i
			childNodes.push(node)
		}
		else if (node instanceof JqAttribute) {
			node.nodePosition = i
			attributes.push(node)
		}
		else if (node instanceof JqList && node.nodeClass === JqAttribute) {
			for (const attribute of node) {
				attribute.nodePosition = i
				attributes.push(attribute)
			}
		}
		else if (node instanceof JqEvent) {
			node.nodePosition = i
			events.push(node)
		}
		else if (node instanceof JqWatch) {
			node.nodePosition = i
			watchers.push(node)
		}
		else if (node instanceof JqCondition) {
			node.nodePosition = i
			conditions.push(node)
		}
		else if (node instanceof JqEach) {
			node.nodePosition = i
			iterators.push(node)
		}
		else if (node instanceof JqLifecycle) {
			node.nodePosition = i
			lifecycles.push(node)
		}
		else if (node instanceof JqPromiseState) {
			node.nodePosition = i
			promiseStates.push(node)
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
			const _node = getCallbackArg(node)
			return classifyNode(_node, i)
		}
		else if (isPrimitive(node)) {
			const _node = /**@type {JqText}*/ (convertToJqNode(node, null))
			_node.nodePosition = i
			childNodes.push(_node)
		}
	}
}

/**
 * @param {(...a: any[]) => any} callback 
 * @returns {JqEffectNode}
 */
function getCallbackArg(callback) {
	try {
		callback()
	}
	catch (e) {
		const isJqEffectNode = () => e instanceof JqWatch
			|| e instanceof JqEvent
			|| e instanceof JqCondition
			|| e instanceof JqEach
			|| e instanceof JqLifecycle

		if (isJqEffectNode()) {
			e.callback = callback
			return /**@type {JqEffectNode}*/ (e)
		}

		throw e
	}

	throw new TypeError(`JqError - Expected a JqCallback<"watch" | "event" | "condition" | "each" | "mount" | "unmount"> but instead found a 'function'`)
}

/**
 * @param {any} value 
 * @param {JqFragment | JqElement | null} jqParent 
 * @returns {Exclude<JqNode, JqState | JqPromise<any>>}
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
	 * @param {Primitive[]} values
	 */
	const convertToJqFragment = (values) => {

		const jqNodes = getNodes(values)
		const childNodes = jqNodes.childNodes

		for (let i = 0; i < childNodes.length; i++) {
			const childNode = childNodes[i]
			childNode.nodePosition = i
		}

		const jqFragment = new JqFragment(childNodes)

		jqFragment.jqParent = jqParent
		jqFragment.conditions = jqNodes.conditions
		jqFragment.iterators = jqNodes.iterators
		jqFragment.lifecycles = jqNodes.lifecycles
		jqFragment.promisesStates = jqNodes.promiseStates
		jqFragment.watchers = jqNodes.watchers

		return jqFragment
	}

	/**
	 * @param {(..._: any[]) => any} value 
	 */
	const convertToJqEffectNode = (value) => {
		const jqEffectNode = getCallbackArg(value)
		jqEffectNode.jqParent = jqParent
		return jqEffectNode
	}

	if (Array.isArray(value))
		return convertToJqFragment(value)
	if (isPrimitive(value))
		return convertToJqText(value)
	if (typeof value == "function")
		return convertToJqEffectNode(value)
	if (getJqNodeConstructors().some(X => value instanceof X))
		return /**@type {Exclude<JqNode, JqState | JqPromise<any>>}*/(value)

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
 * @template T
 */
export class JqPromiseState {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {typeof PromisePending | typeof PromiseResolved | typeof PromiseRejected}
	 */
	state
	/**
	 * @type {JqPromise<T>}
	 */
	jqPromise
	/**
	 * @param {typeof PromisePending | typeof PromiseResolved | typeof PromiseRejected} state 
	 * @param {JqPromise<T>} jqPromise 
	 */
	constructor(state, jqPromise) {
		this.state = state
		this.jqPromise = jqPromise
	}
}

/**
 * @template T
 */
export class JqPromise {
	/**
	 * @type {typeof PromisePending | typeof PromiseResolved | typeof PromiseRejected}
	 */
	state = PromisePending
	/**
	 * @type {() => Promise<T>}
	 */
	callback
	/**
	 * @type {JqPromiseSubscription<T>}
	 */
	subscriptions = {
		pending: [],
		resolved: [],
		rejected: []
	}
	/**
	 * @type {Promise<T> | null}
	 */
	promise = null
	/**
	 * @param {() => Promise<T>} callback 
	 */
	constructor(callback) {
		this.callback = callback
	}

	invoke() {
		const promise = this.promise = this.callback()
		this.subscriptions["pending"].forEach(sub => sub.callback(promise))

		promise.then(x =>
			this.subscriptions["resolved"].forEach(sub =>
				(this.state = PromiseResolved, sub.callback(x))))
			.catch(x =>
				this.subscriptions["rejected"].forEach(sub =>
					(this.state = PromiseRejected, sub.callback(x))))

		return promise
	}
	/**
	 * @param {(JqPromiseSubscription<T>["pending"][0] | JqPromiseSubscription<T>["resolved"][0] | JqPromiseSubscription<T>["rejected"][0]) & {type: keyof JqPromiseSubscription<T>}} subscription 
	 */
	subscribe(subscription) {
		const { subscriber, callback, type } = subscription
		this.subscriptions[type].push({ subscriber, callback })
	}
	/**
	 * @return {Promise<T>}
	 */
	get pending() {
		throw new JqPromiseState(PromisePending, this)
	}
	/**
	 * @return {T}
	 */
	get then() {
		throw new JqPromiseState(PromiseResolved, this)
	}
	/**
	 * @return {any}
	 */
	get catch() {
		throw new JqPromiseState(PromiseRejected, this)
	}
}

export class JqLifecycle {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {OnAttachCallback | OnDetachCallback}
	 */
	type
	/**
	 * @type {(...x: any[]) => any}
	 */
	callback
	/**
	 * 
	 * @param {OnAttachCallback | OnDetachCallback} type 
	 */
	constructor(type) {
		this.type = type
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqLifecycle = this.context
			const jqParent = /**@type {JqElement | JqFragment}*/ (jqLifecycle.jqParent)

			const delNodeIdx = jqParent.lifecycles.findIndex(lifecycle => Object.is(lifecycle, jqLifecycle))
			if (delNodeIdx == -1)
				throwError("JqInternalError - JqLifecycle not found in its jqParent.lifecycles")

			jqParent.lifecycles.splice(delNodeIdx, 1)
			return this
		}
	}
}

/**
 * @template T
 */
export class JqEach {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {{[Symbol.iterator]: () => IterableIterator<T>, [x: string | symbol | number]: any}}
	 */
	iterable
	/**
	 * @type {(_: [T, number, typeof this.iterable]) => any}
	 */
	callback = (_) => ''
	/**
	 * @type {JqFragment | null}
	 */
	returned = null
	/**
	 * @param {{[Symbol.iterator]: () => IterableIterator<T>, [x: string | symbol | number]: any}} iterable 
	 */
	constructor(iterable) {
		this.iterable = iterable
	}

	/**
	 * @returns {JqFragment}
	 */
	invoke() {
		let i = 0
		const results = []

		for (const item of this.iterable) {
			const result = this.callback([item, i, this.iterable])
			results.push(result)
			i++
		}

		const result = /**@type {JqFragment}*/ (convertToJqNode(results, this.jqParent))
		result.nodePosition = this.nodePosition

		return result
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqEach = this.context
			JqEffectNode.delete.deleteSelf(jqEach)
			jqEach.returned = null
			return this
		}
	}

	/**
	 * @type {{[x: string]: (jqEach: JqEach<any>) => any}}
	 */
	static errors = {
		invalidParent: _ => "JqInternalError - JqEach not found in its jqParent.iterators"
	}

	/**
	 * @param {JqElement | JqFragment} jqParent
	 */
	static getInstancesFromParent(jqParent) {
		return jqParent.iterators
	}
}

export class JqCondition {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	condition = false
	/**
	 * @type {(_: boolean) => any}
	 */
	callback = (_) => ''
	/**
	 * @type {JqElement | JqFragment | JqText | null}
	 */
	returned = null
	/**
	 * @param {boolean} condition 
	 */
	constructor(condition) {
		this.condition = condition
	}

	/**
	 * @returns {JqNode}
	 */
	invoke() {
		const result = /**@type {JqCondition}*/ (getCallbackArg(this.callback))
		this.condition = result.condition

		const _result = this.condition ? result.callback(this.condition) : new JqText()
		return _result
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqCondition = this.context
			JqEffectNode.delete.deleteSelf(jqCondition)
			jqCondition.returned = null
			return this
		}
	}

	/**
	 * @type {{[x: string]: (jqCondition: JqCondition) => any}}
	 */
	static errors = {
		invalidParent: _ => "JqInternalError - JqCondition not found in its jqParent.conditions"
	}

	/**
	 * @param {JqElement | JqFragment} jqParent
	 */
	static getInstancesFromParent(jqParent) {
		return jqParent.conditions
	}
}

export class JqEvent {
	nodePosition = -1
	/**
	 * @type {string}
	 */
	event
	/**
	 * @param {Event} [_]
	 */
	callback
	/**
	 * @type {JqElement | null}
	 */
	jqParent = null

	/**
	 * @param {string} event
	 * @param {(event?: Event) => any} callback 
	 */
	constructor(event, callback = (_) => '') {
		this.event = event
		this.callback = callback
	}

	/**
	 * @param {HTMLElement} element 
	 */
	attachHandler(element) {
		element.addEventListener(this.event, this.callback)
	}

	/**
	 * @param {HTMLElement} element 
	 */
	detachHandler(element) {
		element.removeEventListener(this.event, this.callback)
	}

	/**
	 * @param {Node | JqElement} node
	 */
	attachTo(node) {
		if (node instanceof HTMLElement) {
			this.attachHandler(node)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			if (!node.events.includes(this)) node.events.push(this)
			this.attachHandler(/**@type {HTMLElement}*/(node.domNode))
		}
		else {
			throw new Error(JqEvent.errors.invalidAttachTo(this))
		}
		return this
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqEvent = this.context
			const jqParent = /**@type {JqElement}*/ (jqEvent.jqParent)
			JqEffectNode.delete.deleteSelf(jqEvent)

			const domNode = jqParent.domNode
			domNode && jqEvent.detachHandler(domNode)
			return this
		}
	}

	/**
	 * @type {{[x: string]: (jqEvent: JqEvent) => any}}
	 */
	static errors = {
		invalidAttachTo: jqEvent => `JqError - Cannot attach JqEvent '${jqEvent.event}' to a node not of instance JqElement or JqFragment or HTMLElement`,
		invalidParent: _ => "JqInternalError - JqEvent not found in its jqParent.events"
	}

	/**
	 * @param {JqElement | JqFragment} jqParent
	 */
	static getInstancesFromParent(jqParent) {
		return jqParent instanceof JqFragment ? [] : jqParent.events
	}
}

export class JqWatch {
	nodePosition = -1
	/**
	 * @type {JqElement | JqFragment | null}
	 */
	jqParent = null
	/**
	 * @type {JqState[]}
	 */
	jqStates = []
	/**
	 * @param {any[]} _
	 * @returns {any}
	 */
	callback = (_) => ''
	/**
	 * @type {JqElement | JqFragment | JqText | null}
	 */
	returned = null
	/**
	 * @param  {...JqState} jqStates
	 */
	constructor(...jqStates) {
		this.jqStates = jqStates
	}

	invoke() {
		return this.callback(this.jqStates.map(jqState => jqState[StateReference]))
	}

	reconcile() {
		const oldNode = /**@type {NonNullable<typeof this.returned>}*/ (this.returned)
		const newNode = JqEffectNode.extractEffectReturn(this, this.jqParent)
		newNode.attachTo(null, false)

		const _diff = diff(oldNode, newNode)
		JqWatch.reconcile(_diff)

		if (_diff[UPDATED].length) this.returned = newNode

		return this
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqWatcher = this.context
			JqEffectNode.delete.deleteSelf(jqWatcher)

			for (const _jqState of jqWatcher.jqStates) {
				const jqState = /**@type {JqState}*/ (_jqState[JqNodeReference])
				jqState.delete.removeWatcher(jqWatcher)
			}

			jqWatcher.returned = null
			return this
		}
	}

	/**
	 * @type {{[x: string]: (jqWatch: JqWatch) => any}}
	 */
	static errors = {
		invalidParent: _ => "JqInternalError - JqWatch not found in its jqParent.watchers"
	}

	/**
	 * @param {JqElement | JqFragment} jqParent
	 */
	static getInstancesFromParent(jqParent) {
		return jqParent.watchers
	}

	/**
	 * @param {Diff} _diff
	 */
	static reconcile(_diff) {

		const node1 = _diff.node1
		const node2 = _diff.node2

		const updatedChanges = _diff[UPDATED]
		const createdChanges = _diff[CREATED]
		const deletedChanges = _diff[DELETED]

		for (const [firstProp, ...nestedProps] of updatedChanges) {
			if (isJqText(node1, node2)) {
				if (firstProp == "text")
					JqWatch.updateText(_diff, [firstProp, ...nestedProps])
			}
			else if (isJqAttribute(node1, node2)) {
				if (firstProp == "value")
					JqWatch.updateAttribute(_diff, [firstProp, ...nestedProps])
			}
			else if (!isNullish(node1) && !isNullish(node2)) {
				JqWatch.updateElement(_diff, [firstProp, ...nestedProps])
			}
		}

		for (const [firstProp, ...nestedProps] of createdChanges) {
			if (isJqText(node1, node2)) {

			}
			else if (isJqAttribute(node1, node2)) {

			}
			else if (isJqFragment(node1, node2)) {
				if (firstProp == "childNodes")
					JqWatch.createFragment(_diff, [firstProp, ...nestedProps])
			}
			else if (isJqElement(node1, node2)) {
				if (firstProp == "childNodes")
					JqWatch.createElement(_diff, [firstProp, ...nestedProps])
			}
		}

		for (const [firstProp, ...nestedProps] of deletedChanges) {
			if (isJqFragment(node1, node2)) {
				JqWatch.deleteFragmentChild(_diff, [firstProp, ...nestedProps])
			}
			else if (isJqElement(node1, node2)) {
				JqWatch.deleteElementChild(_diff, [firstProp, ...nestedProps])
			}
			else {
					/**@type {DiffableJqNode}*/(node1).delete.deleteSelf()
			}
		}

		for (const diff of _diff.childDiffs) {
			JqWatch.reconcile(diff)
		}
	}

	/**
	 * @param {Diff} diff 
	 * @param {[string, ...Array<string | JqNode>]} props
	 */
	static updateAttribute(diff, props) {
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
	static updateText(diff, props) {
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
	static updateElement(diff, props) {
		const _node1 = /**@type {JqElement | JqFragment | JqText}*/ (diff.node1)
		const _node2 = /**@type {JqElement | JqFragment | JqText}*/ (diff.node2)
		const _node1Parent = /**@type {JqElement | JqFragment}*/ (_node1.jqParent)

		_node1Parent.update.replaceChild(_node1, _node2)
	}

	/**
	 * @param {Diff} diff 
	 * @param {[string, ...Array<string | JqNode>]} param2
	 */
	static createElement(diff, [firstProp, _childNode]) {
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
	static createFragment(diff, [firstProp, _childNode]) {
		if (![diff.node1, diff.node2].every(node => node instanceof JqFragment))
			return this

		const _node1 = /**@type {JqFragment}*/ (diff.node1)
		const _node2 = /**@type {JqFragment}*/ (diff.node2)
		const childNode = /**@type {JqElement | JqFragment | JqText}*/ (_childNode)

		childNode.jqParent = _node1.jqParent
		childNode.nodePosition = _node1.childNodes.length

		childNode.attachTo(_node1)

		return this
	}

	/**
	 * @param {Diff} diff 
	 * @param {[string, ...Array<string | JqNode>]} param2 
	 */
	static deleteFragmentChild(diff, [firstProp, _childNode]) {
		const _node1 = /**@type {JqFragment}*/(diff.node1)
		const _node2 = /**@type {JqFragment}*/ (diff.node2)

		const childNode = /**@type {JqElement | JqFragment | JqText}*/(_childNode)
		childNode.delete.deleteSelf()
	}

	/**
	 * @param {Diff} diff 
	 * @param {[string, ...Array<string | JqNode>]} param2 
	 */
	static deleteElementChild(diff, [firstProp, _childNode]) {
		const _node1 = /**@type {JqElement}*/ (diff.node1)
		const _node2 = /**@type {JqElement}*/ (diff.node2)

		const childNode = /**@type {JqElement | JqFragment | JqText}*/ (_childNode)
		childNode.delete.deleteSelf()
	}
}

export class JqState {
	/**
	 * @type {typeof this}
	 */
	[JqNodeReference];
	/**
	 * @type {{ [x: string | symbol]: unknown }}
	 */
	[StateReference];

	/**
	 * @type {JqWatch[]}
	 */
	watchers = []

	/**
	 * @param {{ [x: string | symbol]: unknown }} state 
	 */
	constructor(state) {
		this[StateReference] = state
		this[JqNodeReference] = this
	}

	delete = {
		context: this,
		/**
		 * @param {JqWatch} watcher
		 */
		removeWatcher(watcher) {
			const jqState = this.context
			const delNodeIdx = jqState.watchers.findIndex(_watcher => Object.is(_watcher, watcher))

			if (delNodeIdx == -1)
				throwError("JqInternalError - JqWatcher not found in one of its jqState.watchers")
			jqState.watchers.splice(delNodeIdx, 1)

			return this
		}
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
			this.animate(/**@type {HTMLElement}*/(node.domNode))
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
	static setInitialStyles(element, styles, ..._) {
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
			throw new Error(JqCSSProperty.errors.invalidAttachTo(this))
		}
		return this
	}

	/**
	 * @returns {string}
	 */
	toString(indent = 1) {
		return `${this.name}: ${this.value};`
	}

	/**
	 * @type {{[x: string]: (jqCSSProperty: JqCSSProperty) => string}}
	 */
	static errors = {
		invalidAttachTo: _ => `JqError - Cannot attach JqCSSProperty to a node not of instance JqElement or JqFragment or HTMLElement`
	}

	/**
	 * @param {JqCSSProperty} jqCSSProperty 
	 * @returns {JqFragment}
	 */
	static getStyleFragment(jqCSSProperty) {
		const nameNode = new JqText(jqCSSProperty.name)
		const valueNode = new JqText(jqCSSProperty.value)

		const childNodes = getNodes([
			nameNode, new JqText(': '), valueNode, new JqText(';')
		]).childNodes

		return new JqFragment(childNodes)
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

		const errorMessage = JqCSSRule.errors.invalidHeadArgument(this)
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
			const styleEl = document.createElement('style')
			styleEl.textContent = this.toString()
			node.appendChild(styleEl)
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
		}
		else {
			throw new Error(JqCSSRule.errors.invalidAttachTo(this))
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

	/**
	 * @type {{[x: string]: (jqCSSRule: JqCSSRule) => string}}
	 */
	static errors = {
		invalidAttachTo: _ => `JqError - Cannot attach JqCSSRule to a node not of instance JqElement or JqFragment or HTMLElement`,
		invalidHeadArgument: jqCSSRule => `JqError - Invalid argument passed to ${jqCSSRule.head.join(' ').trim()}(...)`
	}

	/**
	 * @param {JqCSSRule} jqCSSRule 
	 * @returns {JqFragment}
	 */
	static getStyleFragment(jqCSSRule) {
		const headFragment = new JqFragment(getNodes(jqCSSRule.head).childNodes)
		const styleFragments = jqCSSRule.body.map(x =>
			JqStyleNode.getStyleClass(x).getStyleFragment(/**@type {any}*/(x)))

		const childNodes = getNodes([
			headFragment, new JqText(' {\n'),
			...styleFragments, new JqText('\n}')
		]).childNodes

		return new JqFragment(childNodes)
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

	[Symbol.iterator] = () => this.nodes[Symbol.iterator]()
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
			/**@type {HTMLElement}*/ (node.domNode).setAttributeNode(/**@type {Attr}*/(this.attrNode))
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
	domNode = null
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
	attachTo(node, alterDomNode = true) {

		if (node === null) {
			return this.toString()
		}

		this.initial.createNode()
		if (node instanceof HTMLElement) {
			alterDomNode && node.appendChild(/**@type {Text}*/(this.domNode))
			return this.toString()
		}
		else if (node instanceof JqElement) {
			this.jqParent = node
			if (!node.childNodes.includes(this)) {
				node.childNodes.splice(this.nodePosition, 0, this)
			}
			alterDomNode && (node.shadowRoot ?? /**@type {HTMLElement}*/ (node.domNode))
				.appendChild(/**@type {Text}*/(this.domNode))
		}
		else if (node instanceof JqFragment) {
			this.jqParent = node
			if (!node.childNodes.includes(this)) {
				node.childNodes.splice(this.nodePosition, 0, this)
			}
			alterDomNode && /**@type {Node}*/ (node.domNode).appendChild(/**@type {Node}*/(this.domNode))
		}
		else {
			throw new TypeError(JqText.errors.invalidAttachTo(this))
		}

		return this.toString()
	}

	toString(indent = 0) {
		return this.text
	}

	initial = {
		context: this,
		createNode() {
			const jqElement = this.context
			jqElement.domNode = document.createTextNode(jqElement.text)
			return this
		}
	}

	update = {
		context: this,
		/**
		 * @param {string} text 
		 */
		setText(text) {
			const jqText = this.context;
			/**@type {Text}*/ (jqText.domNode).nodeValue = jqText.text = text
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqText = this.context
			const jqParent = /**@type {JqElement | JqFragment}*/ (jqText.jqParent)

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqText))

			jqParent.childNodes.splice(delChildIdx, 1);
			/**@type {Text}*/ (jqText.domNode).remove()
			return this
		}
	}

	/**
	 * @type {{[x: string]: (jqText: JqText) => any}}
	 */
	static errors = {
		invalidAttachTo: _ => `JqError - Cannot attach JqText to a node not of instance JqElement or JqFragment or HTMLElement`
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
	domNode = null
	/**
	 * @type {Array<JqElement | JqFragment | JqText>}
	 */
	childNodes = []
	/**
	 * @type {JqWatch[]}
	 */
	watchers = []
	/**
	 * @type {JqCondition[]}
	 */
	conditions = []
	/**
	 * @type {JqEach<any>[]}
	 */
	iterators = []
	/**
	 * @type {JqLifecycle[]}
	 */
	lifecycles = []
	/**
	 * @type {JqPromiseState<any>[]}
	 */
	promisesStates = []
	/**
	 * @type {JqElement | null}
	 */
	scopedStyleSheet = null

	/**
	 * @param {Array<JqElement | JqFragment | JqText>} childNodes 
	 */
	constructor(childNodes) {
		this.childNodes = childNodes
	}

	/**
	 * @param {Node | JqElement | JqFragment | null} node
	 */
	attachTo(node, alterDomNode = true) {
		return JqParentable.attachTo(this, node, JqFragment.attachNode, alterDomNode)
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
			jqFragment.domNode = document.createDocumentFragment()
			return this
		},
		attachChildren(alterDomNode = true) {
			const jqFragment = this.context
			JqParentable.initial.attachChildren(jqFragment, alterDomNode)
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
			const jqFragment = this.context
			JqParentable.update.replaceChild(jqFragment, oldChildNode, newChildNode)
			return this
		}
	}

	delete = {
		context: this,
		deleteSelf() {
			const jqFragment = this.context
			JqParentable.delete.deleteSelf(jqFragment)
			return this
		}
	}

	/**
	 * @type {{
	*    [x: string]: (jqFragment: JqFragment) => string
	* }}
	*/
	static errors = {
		invalidAttachTo: jqFragment => `JqError - Cannot attach JqFragment to a node not of instance JqElement or JqFragment or HTMLElement`,
		childNodeNotFound: _ => "JqInternalError - childNode not found in JqFragment.childNodes",
		invalidParent: _ => "JqInternalError - JqFragment not found in its jqParent.childNodes"
	}

	/**
	 * @param {JqFragment} node
	 * @param {JqElement | JqFragment | HTMLElement | null} parentNode
	 * @param {boolean} alterDomNode
	 */
	static attachNode(node, parentNode, alterDomNode) {
		if (alterDomNode) return node.initial
			.createNode()
			.attachChildren()
		return node.initial.attachChildren(alterDomNode)
	}

	/**
	 * @param {JqFragment} jqFragment 
	 * @param {JqEffectNode[]} jqEffectNodes 
	 */
	static collectDetachableEffectNodes(jqFragment, jqEffectNodes) { }
}

export class JqElement {
	/**
	 * @type {string}
	 */
	name
	nodePosition = -1
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
	domNode = null
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
	 * @type {JqWatch[]}
	 */
	watchers = []
	/**
	 * @type {JqCondition[]}
	 */
	conditions = []
	/**
	 * @type {JqEach<any>[]}
	 */
	iterators = []
	/**
	 * @type {JqLifecycle[]}
	 */
	lifecycles = []
	/**
	 * @type {JqPromiseState<any>[]}
	 */
	promisesStates = []
	/**
	 * @type {JqElement | null}
	 */
	scopedStyleSheet = null
	id = "jq" + createHash()

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
	attachTo(node, alterDomNode = true) {
		return JqParentable.attachTo(this, node, JqElement.attachNode, alterDomNode)
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
		const selfAttrs = this.attributes.map(x => `${x.name} = "${String(x.value ?? '')}"`).join(" ")
		const selfCallbacks = this.watchers.map(x => x.returned?.toString(indent + 1) ?? '').join('\n' + '\t'.repeat(indent))

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
		createNode() {
			const jqElement = this.context
			jqElement.domNode = document.createElement(jqElement.name)
			return this
		},
		attachAttributes() {
			const jqElement = this.context
			for (const attribute of jqElement.attributes) {
				attribute.attachTo(jqElement)
			}
			return this
		},
		attachChildren(alterDomNode = true) {
			const jqElement = this.context
			JqParentable.initial.attachChildren(jqElement, alterDomNode)
			return this
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

			observeElement(/**@type {HTMLElement}*/(jqElement.domNode), ([entry, observer]) => {
				if (entry.isIntersecting) {
					for (const animation of jqElement.animations) {
						animation.attachTo(jqElement)
					}
					observer.disconnect()
				}
			})

			return this
		},
		/**
		 * @param {JqElement | JqFragment | HTMLElement | null} parentNode
		 */
		attachStyles(parentNode) {
			const jqElement = this.context
			JqElement.attachStyles(jqElement, parentNode)
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
			JqParentable.update.replaceChild(jqElement, oldChildNode, newChildNode)
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

			/**@type {HTMLElement}*/ (jqElement.domNode).removeAttribute(jqAttribute.name)
			return this
		},
		deleteSelf() {
			const jqElement = this.context
			JqParentable.delete.deleteSelf(jqElement);
			/**@type {HTMLElement}*/ (jqElement.domNode).remove()
			return this
		}
	}

	/**
	 * @param {HTMLElement} context 
	 * @param {string} name 
	 * @param {JqElementParameters} nodes
	 */
	static custom = (context, name, nodes) => {
		return new JqElement(name, { ...nodes, domNode: context })
	}

	/**
	 * @type {{
	 *    [x: string]: (jqElement: JqElement) => string
	 * }}
	 */
	static errors = {
		invalidAttachTo: jqElement => `JqError - Cannot attach JqElement '${jqElement.name}' to a node not of instance JqElement or JqFragment or HTMLElement`,
		childNodeNotFound: _ => "JqInternalError - childNode not found in JqElement.childNodes",
		invalidParent: _ => "JqInternalError - JqElement not found in its jqParent.childNodes",
		unstylableElement: jqElement => `JqError - The HTML '${jqElement.name}' Element cannot be styled`
	}

	/**
	 * @param {JqElement} node
	 * @param {JqElement | JqFragment | HTMLElement | null} parentNode
	 * @param {boolean} alterDomNode
	 */
	static attachNode(node, parentNode, alterDomNode) {
		if (alterDomNode) return node.initial
			.createNode()
			.attachStyles(parentNode)
			.attachAttributes()
			.attachChildren()
			.attachEventListeners()
			.attachAnimations()
		return node.initial.attachChildren(alterDomNode)
	}

	/**
	 * @param {JqElement} jqElement
	 * @param {JqElement | JqFragment | HTMLElement | null} parentNode
	 */
	static attachStyles(jqElement, parentNode) {
		const {
			formatSelectorAndGetStyleFragment: resolvePseudoClsAndGetStyleFragment,
			maybeAttachStyleElementToHTMLParent,
			attachStylesToStylesheet,
		} = JqStyleNode

		const isNonStylable = /^(?:style|script|template|link|meta|br|head|wbr|title|track)$/i.test(jqElement.name)

		if (parentNode == null) return
		maybeAttachStyleElementToHTMLParent(jqElement, parentNode, isNonStylable)

		if (jqElement.blockStyles.length == 0 && jqElement.inlineStyles.length == 0) return
		if (isNonStylable) throwError(JqElement.errors.unstylableElement(jqElement))

		const domNode = /**@type {HTMLElement}*/ (jqElement.domNode)
		domNode.classList.add(jqElement.id)

		const blockStyle = new JqCSSRule(['.' + jqElement.id], ...jqElement.inlineStyles)
		const styleFragments = Array
			.from(jqElement.blockStyles, x => resolvePseudoClsAndGetStyleFragment(x, jqElement.id))

		styleFragments.push(JqCSSRule.getStyleFragment(blockStyle))
		attachStylesToStylesheet(jqElement, styleFragments)
	}

	/**
	 * @param {JqElement} jqElement 
	 * @param {JqEffectNode[]} jqEffectNodes 
	 */
	static collectDetachableEffectNodes(jqElement, jqEffectNodes) {
		jqEffectNodes.push(...jqElement.events)
		jqEffectNodes.push(...jqElement.lifecycles)
		return jqEffectNodes
	}
}

const JqParentable = {
	/**
	 * @param {JqElement | JqFragment} jqNode
	 * @param {Node | JqElement | JqFragment | null} parentNode
	 * @param {(typeof JqElement.attachNode) | (typeof JqFragment.attachNode)} attachNode
	 * @returns {string}
	 */
	attachTo(jqNode, parentNode, attachNode, alterDomNode = true) {
		if (parentNode === null) {
			attachNode(/**@type {any}*/(jqNode), parentNode, alterDomNode)
		}
		else if (parentNode instanceof HTMLElement) {
			attachNode(/**@type {any}*/(jqNode), parentNode, alterDomNode)
			alterDomNode && parentNode.appendChild(/**@type {HTMLElement}*/(jqNode.domNode))
		}
		else if (parentNode instanceof JqElement) {
			jqNode.jqParent = parentNode
			jqNode.scopedStyleSheet = parentNode.scopedStyleSheet
			attachNode(/**@type {any}*/(jqNode), parentNode, alterDomNode)

			if (!parentNode.childNodes.includes(jqNode)) {
				parentNode.childNodes.splice(jqNode.nodePosition, 0, jqNode)
			}

			const domNode = parentNode.shadowRoot ?? /**@type {Node}*/ (parentNode.domNode)
			alterDomNode && domNode.appendChild(/**@type {Node}*/(jqNode.domNode))
		}
		else if (parentNode instanceof JqFragment) {
			jqNode.jqParent = parentNode
			jqNode.scopedStyleSheet = parentNode.scopedStyleSheet
			attachNode(/**@type {any}*/(jqNode), parentNode, alterDomNode)

			if (!parentNode.childNodes.includes(jqNode)) {
				parentNode.childNodes.splice(jqNode.nodePosition, 0, jqNode)
			}

			if (alterDomNode) {
				/**@type {Node}*/ (parentNode.domNode).appendChild(/**@type {Node}*/(jqNode.domNode))
				let ancestor = parentNode.jqParent

				while (ancestor != null && isJqFragment(ancestor)) {
					ancestor = ancestor.jqParent
				}

				if (ancestor != null) {
					   /**@type {Node}*/ (ancestor.domNode).appendChild(/**@type {Node}*/(jqNode.domNode))
				}
			}
		}
		else {
			const errors = (jqNode instanceof JqElement ? JqElement : JqFragment).errors
			throw new Error(errors.invalidAttachTo(/**@type {any}*/(jqNode)))
		}

		if (alterDomNode) {
			for (let i = 0; i < jqNode.lifecycles.length; i++) {
				const lifecycle = jqNode.lifecycles[i]
				lifecycle.jqParent = jqNode

				if (lifecycle.type != OnAttachCallback) continue
				lifecycle.callback(jqNode)
			}
		}

		return jqNode.toString()
	},
	initial: {
		/**
		 * @param {JqElement | JqFragment} jqNode
		 */
		attachChildren(jqNode, alterDomNode = true) {
			const jqEffectNodes = JqEffectNode.getEffectNodes(jqNode)
			const childNodes = jqNode.childNodes, childCount = childNodes.length

			for (let i = 0; i < childCount; i++) {
				const childNode = childNodes[i]
				const precedingEffectNodes = JqEffectNode.getPrecedingEffectNodes(jqEffectNodes, childNode)
				JqEffectNode.attachEffectNodes(precedingEffectNodes, jqNode, alterDomNode)
				childNode.attachTo(jqNode, alterDomNode)
			}

			JqEffectNode.attachEffectNodes(jqEffectNodes, jqNode, alterDomNode)
		}
	},
	update: {
		/**
		 * @param {JqElement | JqFragment} jqNode
		 * @param {JqElement | JqFragment | JqText} oldChildNode 
		 * @param {JqElement | JqFragment | JqText} newChildNode
		 */
		replaceChild(jqNode, oldChildNode, newChildNode) {
			const delChildIdx = jqNode.childNodes.findIndex(childNode => Object.is(childNode, oldChildNode))

			if (delChildIdx == -1) {
				const errors = (jqNode instanceof JqElement ? JqElement : JqFragment).errors
				throwError(errors.childNodeNotFound(/**@type {any}*/(jqNode)))
			}

			newChildNode.nodePosition = oldChildNode.nodePosition
			newChildNode.attachTo(jqNode)
			oldChildNode.delete.deleteSelf()
		}
	},
	delete: {
		/**
		 * @param {JqElement | JqFragment} jqNode
		 */
		deleteSelf(jqNode) {
			const { errors, collectDetachableEffectNodes } = JqParentable.getParentableClass(jqNode)
			const jqParent = /**@type {JqElement | JqFragment}*/ (jqNode.jqParent)

			const delChildIdx = jqParent.childNodes.findIndex(childNode => Object.is(childNode, jqNode))
			if (delChildIdx == -1) throwError(errors.invalidParent(/**@type {any}*/(jqNode)))

			for (let i = 0; i < jqNode.lifecycles.length; i++) {
				const lifecycle = jqNode.lifecycles[i]
				if (lifecycle.type != OnDetachCallback) continue

				lifecycle.callback(jqNode)
			}

			jqParent.childNodes.splice(delChildIdx, 1)
			while (jqNode.childNodes.length) {
				const childNode = jqNode.childNodes[0]
				childNode.delete.deleteSelf()
			}

			/**
			 * @type {JqEffectNode[]}
			 */
			const jqEffectNodes = JqEffectNode.getEffectNodes(jqNode)
			collectDetachableEffectNodes(/**@type {any}*/(jqNode), jqEffectNodes)

			for (const jqEffectNode of jqEffectNodes) {
				jqEffectNode.delete.deleteSelf()
			}
		}
	},
	/**
	 * @param {JqElement | JqFragment} jqNode
	 */
	getParentableClass(jqNode) {
		if (jqNode instanceof JqElement) return JqElement
		if (jqNode instanceof JqFragment) return JqFragment

		throw new Error("JqInternalError - Expected an instance of JqElement | JqFragment as the first argument")
	}
}

const JqEffectNode = {
	delete: {
		/**
		 * @param {JqEffectNode} jqEffectNode
		 */
		deleteSelf(jqEffectNode) {
			const jqParent = /**@type {JqElement | JqFragment}*/ (jqEffectNode.jqParent)

			const { errors, getInstancesFromParent } = JqEffectNode.getEffectClass(jqEffectNode)
			const similarEffectInstances = getInstancesFromParent(jqParent)

			const delNodeIdx = similarEffectInstances.findIndex(instance => Object.is(instance, jqEffectNode))
			if (delNodeIdx == -1) throwError(errors.invalidParent(/**@type {any}*/(jqEffectNode)))

			similarEffectInstances.splice(delNodeIdx, 1)
		}
	},
	/**
	 * @param {JqEffectNode} effectNode
	 */
	getEffectClass(effectNode) {
		if (effectNode instanceof JqEach) return JqEach
		if (effectNode instanceof JqCondition) return JqCondition
		if (effectNode instanceof JqEvent) return JqEvent
		if (effectNode instanceof JqWatch) return JqWatch

		throw new Error("JqInternalError - Expected an instance of JqEffectNode as the first argument")
	},
	/**
	 * @param {JqNode} jqNode
	 */
	isInvokableEffectNode: (jqNode) => jqNode instanceof JqEach
		|| jqNode instanceof JqCondition
		|| jqNode instanceof JqWatch,

	/**
	* @param {Array<JqWatch | JqCondition | JqEach<any>>} effectNodes
	* @param {JqElement | JqFragment} jqNode
	* @param {boolean} alterDomNode
	*/
	attachEffectNodes(effectNodes, jqNode, alterDomNode) {
		for (const effectNode of effectNodes) {
			effectNode.jqParent = jqNode
			const returned = effectNode.returned

			if (effectNode.jqParent.childNodes.includes(/**@type {any}*/(returned))) continue
			const childNode = JqEffectNode.extractEffectReturn(effectNode, jqNode)
			effectNode.returned = childNode

			if (effectNode instanceof JqWatch) {
				for (const _jqState of effectNode.jqStates) {
					const jqState = /**@type {JqState}*/ (_jqState[JqNodeReference])
					const watcherIdx = jqState.watchers
						.findIndex(watcher => watcher.callback.toString() == effectNode.callback.toString())

					if (watcherIdx == -1) {
						jqState.watchers.push(effectNode)
						continue
					}

					jqState.watchers.splice(watcherIdx, 1, effectNode)
				}
			}

			childNode.attachTo(jqNode, alterDomNode)
		}
	},

	/**
	* @param {Exclude<JqEffectNode, JqEvent | JqLifecycle>[]} jqEffectNodes
	* @param {JqElement | JqFragment | JqText} jqNode
	*/
	getPrecedingEffectNodes(jqEffectNodes, jqNode) {
		/**
		 * @type {Exclude<JqEffectNode, JqEvent | JqLifecycle>[]}
		 */
		const precedingJqEffectNodes = []
		for (let i = 0; i < jqEffectNodes.length; i++) {
			const jqEffectNode = jqEffectNodes[i]
			const effectNodePos = jqEffectNode.nodePosition

			if (effectNodePos > jqNode.nodePosition) continue

			jqEffectNodes.splice(effectNodePos, 1)
			precedingJqEffectNodes.push(jqEffectNode)
		}
		return precedingJqEffectNodes
	},

	/**
	* @param {JqElement | JqFragment} jqNode
	*/
	getEffectNodes(jqNode) {
		/**
		 * @type {Exclude<JqEffectNode, JqEvent | JqLifecycle>[]}
		 */
		const jqEffectNodes = []
		const maxLength = Math.max(
			jqNode.watchers.length,
			jqNode.conditions.length,
			jqNode.iterators.length
		)

		for (let i = 0; i < maxLength; i++) {
			const _jqEffectNodes = [
				jqNode.watchers[i],
				jqNode.conditions[i],
				jqNode.iterators[i]
			].filter(Boolean)

			jqEffectNodes.push(..._jqEffectNodes)
		}

		return jqEffectNodes
	},

	/**
	* @param {Exclude<JqEffectNode, JqEvent | JqLifecycle>} effectNode 
	* @param {JqElement | JqFragment | null} jqParent 
	* @returns 
	*/
	extractEffectReturn(effectNode, jqParent) {
		let jqNode = effectNode.invoke()

		while (JqEffectNode.isInvokableEffectNode(jqNode) || typeof jqNode == "function") {
			jqNode = convertToJqNode(jqNode, jqParent)
			jqNode = /**@type {JqEach<any> | JqCondition | JqWatch}*/ (jqNode).invoke()
		}

		const childNode = /**@type {JqText | JqFragment | JqElement}*/ (convertToJqNode(jqNode, jqParent))
		childNode.nodePosition = effectNode.nodePosition

		return childNode
	}
}

const JqStyleNode = {
	/**
	 * @param {JqCSSProperty | JqCSSRule} styleNode
	 */
	getStyleClass(styleNode) {
		if (styleNode instanceof JqCSSProperty) return JqCSSProperty
		if (styleNode instanceof JqCSSRule) return JqCSSRule

		throw new Error("JqInternalError - Expected an instance of JqStyleNode as the first argument")
	},
	/**
	 * @param {JqElement} jqElement
	 * @param {JqFragment[]} styleFragments
	 */
	attachStylesToStylesheet(jqElement, styleFragments) {
		const jqStyleElement = jqElement.scopedStyleSheet

		styleFragments.forEach(x => x.attachTo(jqStyleElement))
		return jqStyleElement// 849, 71, -4414
	},
	/**
	 * @param {JqElement} jqElement
	 * @param {JqElement | JqFragment | HTMLElement | null} parentNode
	 * @param {boolean} isNonStylable 
	 */
	maybeAttachStyleElementToHTMLParent(jqElement, parentNode, isNonStylable) {
		if (!(parentNode instanceof HTMLElement) || isNonStylable) return
		const jqStyleElement = new JqElement("style", /**@type {any}*/({}))
		jqStyleElement.attachTo(parentNode)

		jqElement.scopedStyleSheet = jqStyleElement
	},
	/**
	 * @param {JqCSSRule} jqCSSRule
	 * @param {string} hash
	 */
	formatSelectorAndGetStyleFragment(jqCSSRule, hash) {
		jqCSSRule.head[0] = JqStyleNode.formatSelector(hash, jqCSSRule.head[0])
		return JqCSSRule.getStyleFragment(jqCSSRule)
	},
	/**
	 * @param {string} hash
	 * @param {string} selector
	 */
	formatSelector(hash, selector) {
		const hashCls = '.' + hash

		if (selector == ":JqCSSRule") return hashCls
		if (selector.startsWith('@')) return selector
		if(selector.includes("::")) return `${hashCls}${selector}`

		return `${hashCls} :where(${selector})`
	}
}

/**
 * @param {HTMLElement} element 
 * @param {ResolveFn} callback
 */
export function observeElement(element, callback) {

	/**
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
	if (!isObject(styleObject)) throwError(errorMessage)

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

	if (col[0] == '#') {
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

	return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}

/**
 * @param {JqNode} node1 
 * @param {JqNode} node2
 */
function diff(node1, node2) {
	const nodeComparison = compareJqNodes(node1, node2)
	return nodeComparison

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
				_diff[CREATED].push(["childNodes", secondElemChild])
			else if (secondElemChild === undefined)
				_diff[DELETED].push(["childNodes", firstElemChild])
			else
				_diff.childDiffs.push(diff(firstElemChild, secondElemChild))
		}

		for (let i = 0; i < Math.max(firstElemAttributes.length, secondElemAttributes.length); i++) {
			const firstElemAttribute = firstElemAttributes[i]
			const secondElemAttribute = secondElemAttributes[i]

			if (firstElemAttribute === undefined)
				_diff[CREATED].push(["attributes", secondElemAttribute])
			else if (secondElemAttribute === undefined)
				_diff[DELETED].push(["attributes", firstElemAttribute])
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
 * @typedef {null | undefined | boolean | number | string | symbol | bigint} Primitive
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
 * @typedef {JqElement | JqAttribute | JqCSSProperty | JqCSSRule | JqAnimation | JqEvent | JqState | JqFragment | JqText | JqWatch | JqCondition | JqEach<any> | JqLifecycle | JqPromise<any>} JqNode
 * 
 * @typedef {'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'} HexDigit
 * 
 * @typedef {{
 *    childNodes: Array<JqElement | JqFragment | JqText>,
 *    attributes: JqAttribute[], events: JqEvent[],
 *    animations: JqAnimation[], inlineStyles: Array<JqCSSProperty>, blockStyles: Array<JqCSSRule>,
 *    watchers: JqWatch[], conditions: JqCondition[], iterators: JqEach<any>[], domNode?: HTMLElement
 * }} JqElementParameters
 * 
 * @typedef {JqText | JqAttribute | JqElement | JqFragment} DiffableJqNode
 * 
 * @typedef {JqList<JqState, typeof JqState> | JqEach<any> | JqEvent | JqCondition | Event | boolean | [any, number, Iterable<any>]} CallbackArg
 * 
 * @typedef {{ object: JqNode, props: string[][] }} CompareProps
 * 
 * @typedef {JqWatch | JqEvent | JqCondition | JqEach<any> | JqLifecycle} JqEffectNode
 */

/**
 * @template T
 * @typedef {{
 *    pending: Array<{
 *       subscriber: JqElement | JqFragment,
 *       callback: (x: Promise<T>) => any,
 *    }>,
 *    resolved: Array<{
 *       subscriber: JqElement | JqFragment,
 *       callback: (x: T) => any,
 *    }>,
 *    rejected: Array<{
 *       subscriber: JqElement | JqFragment,
 *       callback: (x: any) => any,
 *    }>
 * }} JqPromiseSubscription
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