import {
	animate, css, custom, each, getNodes,
	attach, natives, nodes, on, pathSetter,
	state, detach, wait, watch, when
} from "../../src/jquire.js"

import { describe, test, expect, fn } from "../lib.js"

describe("test functions from jquire.js file", () => {
	test("test animate() function", () => {
		const _animate = fn(animate)
	})

	test("test css() function", () => {
		const _css = fn(css)
	})

	test("test custom() function", () => {
		const _custom = fn(custom)
	})

	test("test each() function", () => {
		const _each = fn(each)
	})

	test("test getNodes() function", () => {
		const _getNodes = fn(getNodes)
	})

	test("test mount() function", () => {
		const _attach = fn(attach)
	})

	test("test natives() function", () => {
		const _natives = fn(natives)
	})

	test("test nodes() function", () => {
		const _nodes = fn(nodes)
	})

	test("test on() function", () => {
		const _on = fn(on)
	})

	test("test pathSetter() function", () => {
		const _pathSetter = fn(pathSetter)
	})

	test("test state() function", () => {
		const _state = fn(state)
	})

	test("test unmount() function", () => {
		const _detach = fn(detach)
	})

	test("test wait() function", () => {
		const _wait = fn(wait)
	})

	test("test watch() function", () => {
		const _watch = fn(watch)
	})

	test("test when() function", () => {
		const _when = fn(when)
	})
})