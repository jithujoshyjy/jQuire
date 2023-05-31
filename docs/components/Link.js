import { natives, nodes } from "../libs/jquire/jquire.min.js"

const { a } = natives
const { attr } = nodes

export default (...props) => {
	const style = `color: var(--greenish-fountain-blue)`
	return a(
		...props,
		attr.style(style)
	)
}