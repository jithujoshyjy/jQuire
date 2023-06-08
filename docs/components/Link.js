import { natives, nodes } from "https://cdn.jsdelivr.net/gh/jquire/build/jquery.min.js"

const { a } = natives
const { attr } = nodes

export default (...props) => {
	const style = `color: var(--greenish-fountain-blue)`
	return a(
		...props,
		attr.style(style)
	)
}