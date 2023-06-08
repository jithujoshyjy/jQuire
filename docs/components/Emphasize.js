import { natives, nodes } from "https://raw.github.com/jithujoshyjy/jQuire/main/build/bundle.min.js"

const { em } = natives
const { attr } = nodes

export default (...props) => {
	const style = `color: var(--font-color); font-style: normal; background-color: var(--background-color-tertiary); padding: 0.1rem 0.45rem; border-radius: 0.2rem; margin: 0rem 0.3rem; font-family: monospace;`
	return em(
		...props,
		attr.style(style)
	)
}