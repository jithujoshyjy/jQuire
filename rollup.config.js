import terser from '@rollup/plugin-terser'

export default {
	input: "./src/jquire.js",
	output: {
		file: "./src/jquire.min.js",
		format: "es",
		sourcemap: true,
	},
	context: "this",
	plugins: [
		terser({
			keep_classnames: true
		})
	]
}