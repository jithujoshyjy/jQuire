import { natives, css } from "https://cdn.jsdelivr.net/npm/jquire@1.5.2/src/jquire.min.js"
// import { natives, css } from "../../src/jquire.min.js"

const { a } = natives

export default (...props) => {
	return a(css.color("var(--greenish-fountain-blue)"), ...props)
}