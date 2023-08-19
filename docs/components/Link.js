import { natives, css } from "https://cdn.jsdelivr.net/npm/jquire@1.5.1/src/jquire.min.js"

const { a } = natives

export default (...props) => {
	return a(css.color("var(--greenish-fountain-blue)"), ...props)
}