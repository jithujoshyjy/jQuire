import { natives } from "https://cdn.jsdelivr.net/npm/jquire@1.5.0/src/jquire.min.js"

const { a } = natives

export default (...props) => {
	const style = { color: "var(--greenish-fountain-blue)" }
	return a(css(style), ...props)
}