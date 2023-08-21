import { natives, nodes, css, attach } from "https://cdn.jsdelivr.net/npm/jquire@1.5.2/src/jquire.min.js"
// import { natives, nodes, css, attach } from "../../src/jquire.min.js"

const { pre, code } = natives
const { attr } = nodes

export default (language = '', sourceCode = '', highlighter) => {
	const style = {
		minHeight: "3rem",
		fontSize: "0.8rem",
		display: "flex",
		alignItems: "center",
		borderRadius: "0.2rem",
		boxSizing: "border-box",
		padding: "0rem 1.5rem",
		overflow: "auto",
		color: "var(--font-color)",
		backgroundColor: "var(--background-color-secondary)",
		border: "0.075rem solid var(--background-color-tertiary)",
	}

	const codeStyle = {
		backgroundColor: "transparent !important",
		padding: "0rem !important",
		tabSize: "2rem"
	}

	const codeBoxScrollbarStyle = {
		height: "0.75rem",
		borderRadius: "0.25rem",
		backgroundColor: "var(--background-color-tertiary)",
	}

	const codeBoxScrollbarThumbStyle = {
		backgroundColor: "var(--background-color-secondary)",
		borderRadius: "0.25rem",
		border: "0.1rem solid var(--background-color-tertiary)"
	}

	return div(
		css(style),
		css(`code.language-${language}`)(codeStyle),
		css(`::-webkit-scrollbar`)(codeBoxScrollbarStyle),
		css(`::-webkit-scrollbar-thumb`)(codeBoxScrollbarThumbStyle),
		pre(
			code(
				attr.class(`language-${language}`),
				sourceCode,
				(elm = attach()) => highlighter.highlightElement(elm.domNode)
			)
		)
	)
}