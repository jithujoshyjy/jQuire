import { natives, nodes } from "https://raw.github.com/jithujoshyjy/jQuire/main/build/bundle.min.js"

const { a } = natives
const { attr } = nodes

export default (...props) => {
	const style = `color: var(--greenish-fountain-blue)`
	return a(
		...props,
		attr.style(style)
	)
}