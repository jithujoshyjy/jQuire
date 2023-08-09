/**
 * @type {TestContext}
 */
let testContext
/**
 * @type {DescriptContext}
 */
let descriptContext = { tests: [], __isDefault: true }

/**
 * @param {string} description
 * @param {JqAssert[]} assertInstances
 * @returns {TestContext}
 */
function createTestContext(description, assertInstances = []) {
	return { description, assertInstances, succeeded: false }
}

/**
 * @param {string} description
 * @param {TestContext[]} tests
 * @returns {DescriptContext}
 */
function createDescriptContext(description, tests = []) {
	return { description, tests, __isDefault: false }
}

class JqAssert {
	succeeded = true
	description = ''
	/**
	 * @type {SingletonAssert[]}
	 */
	assertions = []
	/**
	 * @type {any}
	 */
	value
	/**
	 * @param {any} value
	 */
	constructor(value) {
		this.value = value
	}

	/**
	 * @param {any} value
	 * @returns {string} 
	 */
	static stringify = (value, indent = 0) => {
		const valueType = typeof value, space = ' '.repeat(Math.max(indent, 4))
		if (valueType === "bigint") return value.toString()
		if (valueType === "function") return `[Function${!value.name ? ' (anonymous)' : ': ' + value.name}()]`
		if (valueType === "symbol") return value.toString()
		if (Array.isArray(value)) return '[\n' +
			value.map(x => space + stringify(value, indent + 1)).join(', ') +
			'\n]'
		if (value !== null && valueType === "object") return '{\n' +
			Object.keys(value).map(key => space + "key: " + stringify(value[key], indent + 1)).join(', ') +
			'\n}'
		return String(value)
	}

	static modifiers = (/**@type {JqAssert}*/ assertInstance) => ({
		__negativeAssertion: false,
		get not() {
			this.__negativeAssertion = !this.__negativeAssertion
			return this
		},
		/**
		 * @param {any} value
		 */
		toBe(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBe(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value,
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBe ${stringify(value)}`
			return this
		},
		toHaveBeenCalled() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveBeenCalled(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveBeenCalled`
			return this
		},
		/**
		 * @param {number} times
		 */
		toHaveBeenCalledTimes(times) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveBeenCalledTimes(times, assertInstance.value)),
				expectation: times,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveBeenCalledTimes ${stringify(times)}`
			return this
		},
		/**
		 * @param  {...any} args
		 */
		toHaveBeenCalledWith(...args) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveBeenCalledWith(args, assertInstance.value)),
				expectation: args,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveBeenCalledWith ${stringify(args)}`
			return this
		},
		/**
		 * @param  {...any} args
		 */
		toHaveBeenLastCalledWith(...args) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveBeenLastCalledWith(args, assertInstance.value)),
				expectation: args,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveBeenLastCalledWith ${stringify(args)}`
			return this
		},
		/**
		 * @param {number} nth
		 * @param  {...any} args
		 */
		toHaveBeenNthCalledWith(nth, ...args) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveBeenNthCalledWith(args, assertInstance.value, nth)),
				expectation: args,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveBeenNthCalledWith ${stringify(nth)}th ${stringify(args)}`
			return this
		},
		toHaveReturned() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveReturned(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveReturned`
			return this
		},
		/**
		 * @param {number} times
		 */
		toHaveReturnedTimes(times) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveReturnedTimes(times, assertInstance.value)),
				expectation: times,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveReturnedTimes ${stringify(times)}`
			return this
		},
		/**
		 * @param {any} value
		 */
		toHaveReturnedWith(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveReturnedWith(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveReturnedWith ${stringify(times)}`
			return this
		},
		/**
		 * @param {any} value
		 */
		toHaveLastReturnedWith(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveLastReturnedWith(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveLastReturnedWith ${stringify(value)}`
			return this
		},
		/**
		 * @param {number} nth
		 * @param  {any} value
		 */
		toHaveNthReturnedWith(nth, value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveNthReturnedWith(value, assertInstance.value, nth)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveNthReturnedWith ${stringify(nth)}th ${stringify(value)}`
			return this
		},
		/**
		 * @param {number} number
		 */
		toHaveLength(number) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveLength(number, assertInstance.value)),
				expectation: number,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveLength ${stringify(number)}`
			return this
		},
		/**
		 * @param {number} key
		 * @param {undefined} [value]
		 */
		toHaveProperty(key, value = undefined) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toHaveProperty([key, value], assertInstance.value)),
				expectation: [key, value],
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toHaveProperty (${stringify(key)}: ${stringify(value)})`
			return this
		},
		/**
		 * @param {number} number
		 */
		toBeCloseTo(number, precision = 0) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeCloseTo(number, assertInstance.value, precision)),
				expectation: number,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeCloseTo (${precision}) ${stringify(number)}`
			return this
		},
		toBeDefined() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeDefined(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeDefined`
			return this
		},
		toBeFalsy() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeFalsy(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeFalsy`
			return this
		},
		/**
		 * @param {number} number
		 */
		toBeGreaterThan(number) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeGreaterThan(number, assertInstance.value)),
				expectation: number,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeGreaterThan`
			return this
		},
		/**
		 * @param {number} number
		 */
		toBeGreaterThanOrEqual(number) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeGreaterThanOrEqual(number, assertInstance.value)),
				expectation: number,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeGreaterThanOrEqual`
			return this
		},
		/**
		 * @param {number} number
		 */
		toBeLessThan(number) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeLessThan(number, assertInstance.value)),
				expectation: number,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeLessThan`
			return this
		},
		/**
		 * @param {number} number
		 */
		toBeLessThanOrEqual(number) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeLessThanOrEqual(number, assertInstance.value)),
				expectation: number,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeLessThan`
			return this
		},
		/**
		 * @param {any} constructor
		 */
		toBeInstanceOf(constructor) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeInstanceOf(constructor, assertInstance.value)),
				expectation: constructor,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeInstanceOf ${stringify(constructor)}`
			return this
		},
		toBeNull() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeNull(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeNull`
			return this
		},
		toBeTruthy() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeTruthy(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeTruthy`
			return this
		},
		toBeUndefined() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeUndefined(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeUndefined`
			return this
		},
		toBeNaN() {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toBeNaN(null, assertInstance.value)),
				expectation: null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toBeNaN`
			return this
		},
		/**
		 * @param {any} value
		 */
		toContain(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toContain(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toContain ${stringify(value)}`
			return this
		},
		/**
		 * @param {any} value
		 */
		toContainEqual(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toContainEqual(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toContainEqual ${stringify(value)}`
			return this
		},
		/**
		 * @param {any} value
		 */
		toEqual(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toEqual(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toEqual ${stringify(value)}`
			return this
		},
		/**
		 * @param {string | RegExp} pattern
		 */
		toMatch(pattern) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toMatch(pattern, assertInstance.value)),
				expectation: pattern,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toMatch ${stringify(pattern)}`
			return this
		},
		/**
		 * @param {any} value
		 */
		toMatchObject(value) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toMatchObject(value, assertInstance.value)),
				expectation: value,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toMatchObject ${stringify(value)}`
			return this
		},
		/**
		 * @param {any} [value]
		 */
		toThrow(value = undefined) {
			const { matchers, stringify } = JqAssert
			/**
			 * @type {SingletonAssert}
			 */
			const assertion = {
				validity: matchers.boolify(this.__negativeAssertion, matchers.toThrow(value, assertInstance.value)),
				expectation: value ?? null,
				reality: assertInstance.value
			}

			assertInstance.succeeded &&= assertion.validity
			assertInstance.assertions.push(assertion)

			assertInstance.description += `Assert ${stringify(assertInstance.value)} toThrow ${stringify(value ?? '')}`
			return this
		}
	})

	static matchers = {
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		boolify(expectation, reality) {
			return expectation ? !Boolean(reality) : reality
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toBe(expectation, reality) {
			return Object.is(expectation, reality)
		},
		/**
		 * @param {any} expectation
		 * @param {any} reality
		 */
		toHaveBeenCalled(expectation, reality) {
			return reality.callCount > 0
		},
		/**
		 * @param {number} expectation
		 * @param {any} reality
		 */
		toHaveBeenCalledTimes(expectation, reality) {
			return reality.callCount === expectation
		},
		/**
		 * @param  {any[]} expectation
		 * @param {any[]} reality
		 */
		toHaveBeenCalledWith(expectation, reality) {
			return reality.arguments.every(argList => argList.every((arg, i) => Object.is(arg, expectation[i])))
		},
		/**
		 * @param  {any[]} expectation
		 * @param {any[]} reality
		 */
		toHaveBeenLastCalledWith(expectation, reality) {
			return this.toHaveBeenNthCalledWith(expectation, reality, realityreality.arguments.length - 1)
		},
		/**
		 * @param  {any[]} expectation
		 * @param {any[]} reality
		 * @param {number} n 
		 */
		toHaveBeenNthCalledWith(expectation, reality, n) {
			const args = reality.arguments
			return Boolean(args[n]?.every((arg, i) => Object.is(arg, expectation[i])))
		},
		/**
		 * @param {any} expectation
		 * @param {any} reality
		 */
		toHaveReturned(expectation, reality) {
			return reality.callCount > 0 && reality.throwCount == 0
		},
		/**
		 * @param {number} expectation
		 * @param {any} reality
		 */
		toHaveReturnedTimes(expectation, reality) {
			return reality.callCount - reality.throwCount == expectation
		},
		/**
		 * @param  {any} expectation
		 * @param {any[]} reality 
		 */
		toHaveReturnedWith(expectation, reality) {
			return reality.returnValues.every(value => Object.is(value, expectation))
		},
		/**
		 * @param  {any} expectation
		 * @param {any[]} reality 
		 */
		toHaveLastReturnedWith(expectation, reality) {
			return this.toHaveNthReturnedWith(expectation, reality, reality.returnValues.length - 1)
		},
		/** 
		 * @param  {any} expectation
		 * @param {any[]} reality
		 * @param {number} n 
		 */
		toHaveNthReturnedWith(expectation, reality, n) {
			return Boolean(Object.is(reality.returnValues[n], expectation))
		},
		/**
		 * @param {number} expectation
		 * @param {any} reality
		 */
		toHaveLength(expectation, reality) {
			return "length" in reality && reality.length === expectation
		},
		/**
		 * @param {[string, any]} expectation
		 * @param {any} reality
		 */
		toHaveProperty([expectedPropertyName, expectedPropertyValue = undefined], reality) {
			return expectedPropertyName in reality &&
				expectedPropertyValue !== undefined &&
				Object.is(reality[expectedPropertyName], expectedPropertyValue)
		},
		/**
		 * @param {number} expectation
		 * @param {number} reality
		 * @param {number} precision
		 */
		toBeCloseTo(expectation, reality, precision) {
			const absoluteError = Math.abs(reality - expectation)
			const relativeError = absoluteError / expectation

			return relativeError <= precision
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toBeDefined(expectation, reality) {
			return typeof reality != "undefined"
		},
		/**
		 * @param {any} expectation
		 * @param {any} reality
		 */
		toBeFalsy(expectation, reality) {
			return !this.toBeTruthy(expectation, reality)
		},
		/**
		 * @param {number} expectation
		 * @param {number} reality
		 */
		toBeGreaterThan(expectation, reality) {
			return reality > expectation
		},
		/**
		 * @param {number} expectation
		 * @param {number} reality
		 */
		toBeGreaterThanOrEqual(expectation, reality) {
			return this.toBe(expectation, reality) || this.toBeGreaterThan(expectation, reality)
		},
		/**
		 * @param {number} expectation
		 * @param {number} reality
		 */
		toBeLessThan(expectation, reality) {
			return !this.toBeGreaterThanOrEqual(expectation, reality)
		},
		/**
		 * @param {number} expectation
		 * @param {number} reality
		 */
		toBeLessThanOrEqual(expectation, reality) {
			return this.toBe(expectation, reality) || this.toBeLessThan(expectation, reality)
		},
		/**
		 * @param {any} expectation
		 * @param {any} reality
		 */
		toBeInstanceOf(expectation, reality) {
			return reality instanceof expectation
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toBeNull(expectation, reality) {
			return reality === null
		},
		/**
		 * @param {any} expectation
		 * @param {any} reality
		 */
		toBeTruthy(expectation, reality) {
			return Boolean(reality)
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toBeUndefined(expectation, reality) {
			return !this.toBeDefined(expectation, reality)
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toBeNaN(expectation, reality) {
			return this.toBe(NaN, reality)
		},
		/**
		 * @param {any} expectation 
		 * @param {any[] | string} reality 
		 */
		toContain(expectation, reality) {
			return reality.includes(expectation)
		},
		/**
		 * @param {any} expectation 
		 * @param {any[]} reality 
		 */
		toContainEqual(expectation, reality) {
			return reality.every(x => this.toEqual(expectation, x))
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toEqual(expectation, reality) {
			const ok = Object.keys, tExp = typeof expectation, tRea = typeof reality
			return expectation && reality && tExp === 'object' && tExp === tRea
				?
				ok(expectation).length === ok(reality).length &&
				ok(expectation).every(key => this.toEqual(expectation[key], reality[key]))
				:
				this.toBe(expectation, reality)
		},
		/**
		 * @param {RegExp | string} expectation 
		 * @param {string} reality 
		 */
		toMatch(expectation, reality) {
			const regex = typeof expectation === "string"
				? new RegExp('^' + test.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&") + '$')
				: expectation

			return regex.test(reality)
		},
		/**
		 * @param {any} expectation 
		 * @param {any} reality 
		 */
		toMatchObject(expectation, reality) {
			const ok = Object.keys, tExp = typeof expectation, tRea = typeof reality
			return expectation && reality && tExp === 'object' && tExp === tRea
				? ok(expectation).every(key => this.toEqual(expectation[key], reality[key]))
				: this.toBe(expectation, reality)
		},
		/**
		 * @param {any} expectation
		 * @param {any} reality
		 */
		toThrow(expectation, reality) {
			return expectation &&
				reality.thrownValues.every(value => this.toBe(expectation, value)) ||
				reality.throwCount > 0
		},
	}
}

/**
 * @param {TestContext} test
 */
const getTestDescription = (test) => {
	const status = test.succeeded ? '✅' : '❌'
	const description = test.description

	let text = `${status} ${description}`
	for (const assertInstance of test.assertInstances) {
		text += '\n    🧪 ' + assertInstance.description
	}
	return text
}

/**
 * @param {string} description
 * @param {() => any} fn
 */
export function describe(description, fn) {
	const prevDescriptContext = descriptContext
	descriptContext = createDescriptContext(description)

	const result = fn()
	const totalTestCount = descriptContext.tests.length

	let succeededTestCount = 0, failedTestCount = 0
	let succeededTestsText = '', failedTestsText = ''

	for (const test of descriptContext.tests) {
		if (test.succeeded) {
			succeededTestCount++
			succeededTestsText += '\n\n' + getTestDescription(test)
			continue
		}

		failedTestsText += '\n\n' + getTestDescription(test)
		failedTestCount++
	}

	succeededTestsText = `Tests [SUCCEEDED]: ${succeededTestCount}/${totalTestCount}` + succeededTestsText
	failedTestsText = `\nTests [FAILED]: ${failedTestCount}/${totalTestCount}` + failedTestsText + '\n'

	const descriptionText = `"""\n\nDESCRIPTION: ${description}\n\n"""\n\n` + succeededTestsText + '\n' + failedTestsText
	console.log(descriptionText)

	descriptContext = prevDescriptContext
	return result
}

/**
 * @param {string} description
 * @param {() => any} fn
 */
export function test(description, fn) {
	const prevTestContext = testContext
	testContext = createTestContext(description)

	descriptContext.tests.push(testContext)
	const result = fn()

	testContext.succeeded = !testContext.assertInstances
		.some(assertInstance => !assertInstance.succeeded)

	if (descriptContext.__isDefault) {
		testContext.description = getTestDescription(testContext)
		console.log(testContext.description)
	}

	testContext = prevTestContext
	return result
}

/**
 * @param {any} value 
 */
export function expect(value) {
	const jqAssert = new JqAssert(value)
	testContext.assertInstances.push(jqAssert)
	return JqAssert.modifiers(jqAssert)
}

export const fn = (f = new Function()) => {
	const g = (...args) => {
		let result
		try {
			result = f(...args)
			g.returnValues.push(result)
		} catch (e) {
			g.thrownValues.push(e)
			g.throwCount++
			console.error(e)
		}

		g.arguments.push(args)
		g.callCount++
		return result
	}

	/**
	 * @type {FnProps}
	 */
	const properties = {
		arguments: [],
		callCount: 0,
		throwCount: 0,
		returnValues: [],
		thrownValues: []
	}

	return Object.assign(g, properties)
}

/**
 * @typedef {{
 *    validity: boolean,
 *    expectation: any,
 *    reality: any,
 *    failureDescription: string,
 *    successDescription: string
 * }} SingletonAssert
 * 
 * @typedef {{
 *    succeeded: boolean,
 *    description: string,
 *    assertInstances: JqAssert[],
 * }} TestContext
 * 
 * @typedef {{ tests: TestContext[], __isDefault: boolean, description: string }} DescriptContext
 * 
 * @typedef {{
 *    arguments: any[],
 *    callCount: number,
 *    throwCount: number,
 *    returnValues: any[],
 *    thrownValues: any[]
 * }} FnProps
 */