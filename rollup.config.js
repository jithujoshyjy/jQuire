import terser from '@rollup/plugin-terser'

export default {
    input: "./dist/jquire.js",
    output: {
        file: "./dist/jquire.min.js",
        format: "es"
    },
	context: "this",
	plugins: [terser()]
}