import { natives, css } from "https://cdn.jsdelivr.net/npm/jquire@1.5.0/src/jquire.min.js"

const { em } = natives

export default (...props) => {
	const style = {
		color: "var(--font-color)",
		fontStyle: "normal",
		backgroundColor: "var(--background-color-tertiary)",
		padding: "0.1rem 0.45rem",
		borderRadius: "0.2rem",
		margin: "0rem 0.3rem",
		fontFamily: "monospace",
	}

	return em(css(style), ...props)
}