import { natives, nodes } from "../../dist/jquire.min.js"

const { em } = natives
const { attr } = nodes

export default (...props) => {
	const style = `font-style: normal; background-color: var(--mirage-lite); padding: 0.1rem 0.45rem; border-radius: 0.2rem; margin: 0rem 0.3rem; font-family: monospace;`
	return em(
		...props,
		attr.style(style)
	)
}