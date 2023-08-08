import {
	animate, css, custom, each, getNodes,
	mount, natives, nodes, on, pathSetter,
	state, unmount, wait, watch, when
} from "../../src/jquire.js"

import {
	JqAnimation, JqAttribute, JqCSSProperty, JqCSSRule,
	JqCondition, JqEach, JqElement, JqEvent, JqFragment,
	JqLifecycle, JqList, JqPromise, JqPromiseState, JqState,
	JqText, JqWatch, adjustColor, camelToKebab, canHaveShadow,
	convertToJqNode, createPropertyListFromStyleObject,
	escapeHTMLEntities, observeElement, stringify,
} from "../../src/utility.js"

import { describe, test, expect, fn } from "../lib.js"

test("add 1 + 1", () => expect(1 + 1).toBe(2))

/* describe("test function from jquire.js file", () => {
	test("test animate() function", () => {

	})

	test("test css() function", () => {

	})

	test("test custom() function", () => {

	})

	test("test each() function", () => {

	})

	test("test getNodes() function", () => {

	})

	test("test mount() function", () => {

	})

	test("test natives() function", () => {

	})

	test("test nodes() function", () => {

	})

	test("test on() function", () => {

	})

	test("test pathSetter() function", () => {

	})

	test("test state() function", () => {

	})

	test("test unmount() function", () => {

	})

	test("test wait() function", () => {

	})

	test("test watch() function", () => {

	})

	test("test when() function", () => {

	})
})

describe("test function from utility.js file", () => {
	describe("test JqAnimation class", () => {
		test("test JqAnimation.prototype.animate() function", () => {

		})
	})

	describe("test JqAttribute class", () => {

	})

	describe("test JqCSSProperty class", () => {

	})

	describe("test JqCSSRule class", () => {

	})

	describe("test JqCondition class", () => {

	})

	describe("test JqEach class", () => {

	})

	describe("test JqEvent class", () => {

	})

	describe("test JqFragment class", () => {

	})

	describe("test JqLifecycle class", () => {

	})

	describe("test JqList class", () => {

	})

	describe("test JqPromise class", () => {

	})

	describe("test JqPromiseState class", () => {

	})

	describe("test JqState class", () => {

	})

	describe("test JqText class", () => {

	})

	describe("test JqWatch class", () => {

	})

	test("test adjustColor function", () => {

	})

	test("test camelToKebab function", () => {

	})

	test("test canHaveShadow function", () => {

	})

	test("test convertToJqNode function", () => {

	})

	test("test createPropertyListFromStyleObject function", () => {

	})

	test("test escapeHTMLEntities function", () => {

	})

	test("test observeElement function", () => {

	})
	
	test("test stringify function", () => {

	})
}) */