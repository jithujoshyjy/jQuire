import {
	JqAnimation, JqAttribute, JqCSSProperty, JqCSSRule,
	JqCondition, JqEach, JqElement, JqEvent, JqFragment,
	JqLifecycle, JqList, JqPromise, JqPromiseState, JqState,
	JqText, JqWatch, adjustColor, camelToKebab, canHaveShadow,
	convertToJqNode, createPropertyListFromStyleObject,
	escapeHTMLEntities, observeElement, stringify,
} from "../../src/utility.js"

import { describe, test, expect, fn } from "../lib.js"

describe("test functions from utility.js file", () => {
	describe("test JqAnimation class", () => {
		const constructor = () => new JqAnimation()

		test("test JqAnimation.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqAnimation.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqAnimation.prototype.animate() function", () => {
			const animate = fn(constructor().animate)
		})

		test("test JqAnimation.setInitialStyles() function", () => {
			const setInitialStyles = fn(JqAnimation.setInitialStyles)
		})
	})

	describe("test JqAttribute class", () => {
		const constructor = () => new JqAttribute()

		test("test JqAttribute.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqAttribute.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqAttribute.prototype.initial.createNode() function", () => {
			const createNode = fn(constructor().initial.createNode)
		})

		test("test JqAttribute.prototype.update.updateAttribute() function", () => {
			const updateAttribute = fn(constructor().update.updateAttribute)
		})

		test("test JqAttribute.prototype.update.setAttribute() function", () => {
			const setAttribute = fn(constructor().update.setAttribute)
		})

		test("test JqAttribute.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})

		test("test JqAttribute.objectToJqAttributes() function", () => {
			const objectToJqAttributes = fn(JqAttribute.objectToJqAttributes)
		})
	})

	describe("test JqCSSProperty class", () => {
		const constructor = () => new JqCSSProperty()

		test("test JqCSSProperty.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqCSSProperty.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqCSSProperty.prototype.toString() function", () => {
			const toString = fn(constructor().toString)
		})
	})

	describe("test JqCSSRule class", () => {
		const constructor = () => new JqCSSRule()

		test("test JqCSSRule.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqCSSRule.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqCSSRule.prototype.toString() function", () => {
			const toString = fn(constructor().toString)
		})
	})

	describe("test JqCondition class", () => {
		const constructor = () => new JqCondition()

		test("test JqCondition.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqCondition.prototype.invoke() function", () => {
			const invoke = fn(constructor().invoke)
		})

		test("test JqCondition.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqEach class", () => {
		const constructor = () => new JqEach()

		test("test JqEach.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqEach.prototype.invoke() function", () => {
			const invoke = fn(constructor().invoke)
		})

		test("test JqEach.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqEvent class", () => {
		const constructor = () => new JqEvent()

		test("test JqEvent.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})
		
		test("test JqEvent.prototype.attachHandler() function", () => {
			const attachHandler = fn(constructor().attachHandler)
		})

		test("test JqEvent.prototype.detachHandler() function", () => {
			const detachHandler = fn(constructor().detachHandler)
		})

		test("test JqEvent.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqEvent.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqFragment class", () => {
		const constructor = () => new JqFragment()

		test("test JqFragment.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqFragment.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqFragment.prototype.toString() function", () => {
			const toString = fn(constructor().toString)
		})

		test("test JqFragment.prototype.initial.createNode() function", () => {
			const createNode = fn(constructor().initial.createNode)
		})

		test("test JqFragment.prototype.initial.attachChildren() function", () => {
			const attachChildren = fn(constructor().initial.attachChildren)
		})

		test("test JqFragment.prototype.update.replaceChild() function", () => {
			const replaceChild = fn(constructor().update.replaceChild)
		})

		test("test JqFragment.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqElement class", () => {
		const constructor = () => new JqElement()

		test("test JqElement.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqElement.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqElement.prototype.toString() function", () => {
			const toString = fn(constructor().toString)
		})

		test("test JqElement.prototype.initial.createNode() function", () => {
			const createNode = fn(constructor().initial.createNode)
		})

		test("test JqElement.prototype.initial.attachAttributes() function", () => {
			const attachAttributes = fn(constructor().initial.attachAttributes)
		})

		test("test JqElement.prototype.initial.attachChildren() function", () => {
			const attachChildren = fn(constructor().initial.attachChildren)
		})

		test("test JqElement.prototype.initial.attachEventListeners() function", () => {
			const attachEventListeners = fn(constructor().initial.attachEventListeners)
		})

		test("test JqElement.prototype.initial.attachAnimations() function", () => {
			const attachAnimations = fn(constructor().initial.attachAnimations)
		})

		test("test JqElement.prototype.initial.attachStyles() function", () => {
			const attachStyles = fn(constructor().initial.attachStyles)
		})

		test("test JqElement.prototype.update.replaceChild() function", () => {
			const replaceChild = fn(constructor().update.replaceChild)
		})

		test("test JqElement.prototype.delete.removeAttribute() function", () => {
			const removeAttribute = fn(constructor().delete.removeAttribute)
		})

		test("test JqElement.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqText class", () => {
		const constructor = () => new JqText()

		test("test JqText.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqText.prototype.attachTo() function", () => {
			const attachTo = fn(constructor().attachTo)
		})

		test("test JqText.prototype.toString() function", () => {
			const toString = fn(constructor().toString)
		})

		test("test JqText.prototype.initial.createNode() function", () => {
			const createNode = fn(constructor().initial.createNode)
		})

		test("test JqText.prototype.update.setText() function", () => {
			const setText = fn(constructor().update.setText)
		})

		test("test JqText.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqLifecycle class", () => {
		const constructor = () => new JqLifecycle()

		test("test JqLifecycle.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqLifecycle.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().delete.deleteSelf)
		})
	})

	describe("test JqList class", () => {
		const constructor = () => new JqList()

		test("test JqList.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqList.prototype.push() function", () => {
			const push = fn(constructor().push)
		})

		test("test JqList.prototype.pop() function", () => {
			const pop = fn(constructor().pop)
		})

		test("test JqList.prototype.[Symbol.iterator]() function", () => {
			for(const item of constructor()) {

			}
		})
	})

	describe("test JqPromise class", () => {
		const constructor = () => new JqPromise()

		test("test JqPromise.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqPromise.prototype.invoke() function", () => {
			const invoke = fn(constructor().invoke)
		})

		test("test JqPromise.prototype.subscribe() function", () => {
			const subscribe = fn(constructor().subscribe)
		})
	})

	describe("test JqPromiseState class", () => {
		const constructor = () => new JqPromiseState()

		test("test JqPromiseState.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})
	})

	describe("test JqState class", () => {
		const constructor = () => new JqState()

		test("test JqState.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqState.prototype.removeWatcher() function", () => {
			const removeWatcher = fn(constructor().removeWatcher)
		})
	})

	describe("test JqWatch class", () => {
		const constructor = () => new JqWatch()

		test("test JqWatch.prototype.constructor() function", () => {
			const _constructor = fn(constructor)
		})

		test("test JqWatch.prototype.invoke() function", () => {
			const invoke = fn(constructor().invoke)
		})

		test("test JqWatch.prototype.reconcile() function", () => {
			const reconcile = fn(constructor().reconcile)
		})
		
		test("test JqWatch.prototype.delete.deleteSelf() function", () => {
			const deleteSelf = fn(constructor().deleteSelf)
		})

		test("test JqWatch.reconcile() function", () => {
			const reconcile = fn(JqWatch.reconcile)
		})

		test("test JqWatch.updateAttribute() function", () => {
			const updateAttribute = fn(JqWatch.updateAttribute)
		})

		test("test JqWatch.updateText() function", () => {
			const updateText = fn(JqWatch.updateText)
		})

		test("test JqWatch.updateElement() function", () => {
			const updateElement = fn(JqWatch.updateElement)
		})

		test("test JqWatch.createElement() function", () => {
			const createElement = fn(JqWatch.createElement)
		})

		test("test JqWatch.createFragment() function", () => {
			const createFragment = fn(JqWatch.createFragment)
		})

		test("test JqWatch.deleteJqFragmentChild() function", () => {
			const deleteJqFragmentChild = fn(JqWatch.deleteJqFragmentChild)
		})

		test("test JqWatch.deleteJqElementChild() function", () => {
			const deleteJqElementChild = fn(JqWatch.deleteJqElementChild)
		})
	})

	test("test adjustColor function", () => {
		const _adjustColor = fn(adjustColor)
	})

	test("test camelToKebab function", () => {
		const _camelToKebab = fn(camelToKebab)
	})

	test("test canHaveShadow function", () => {
		const _canHaveShadow = fn(canHaveShadow)
	})

	test("test convertToJqNode function", () => {
		const _convertToJqNode = fn(convertToJqNode)
	})

	test("test createPropertyListFromStyleObject function", () => {
		const _createPropertyListFromStyleObject = fn(createPropertyListFromStyleObject)
	})

	test("test escapeHTMLEntities function", () => {
		const _escapeHTMLEntities = fn(escapeHTMLEntities)
	})

	test("test observeElement function", () => {
		const _observeElement = fn(observeElement)
	})

	test("test stringify function", () => {
		const _stringify = fn(stringify)
	})
})