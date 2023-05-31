// import { natives, nodes } from "../libs/jquire/jquire.min.js"
import { natives, nodes } from "../../dist/jquire.js"

const { a } = natives
const { attr } = nodes

export default (...props) => {
	const style = `color: var(--greenish-fountain-blue)`
	return a(
		...props,
		attr.style(style)
	)
}