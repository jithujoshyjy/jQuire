import { natives, nodes, css, pathSetter, ref } from "../../dist/jquire.min.js"

const { pre, code, link } = natives
const { attr, fragment } = nodes

export default (language = '', sourceCode = '', highlighter) => {
	const style = {
		minHeight: "3rem",
		minWidth: "100%",
		fontSize: "0.8rem",
		display: "flex",
		alignItems: "center",
		borderRadius: "0.2rem",
		boxSizing: "borderBox",
		padding: "0rem 1.5rem",
		overflow: "auto",
		backgroundColor: "var(--mirage)"
	}

	const codeStyle = {
		backgroundColor: "transparent !important",
		padding: "0rem !important",
		tabSize: "2rem"
	}

	const codeBoxScrollbarStyle = {
		display: "none"
	}

	const codeBlock = ref()
	return div(
		css(style),
		css(`code.language-${language}`)(codeStyle),
		css(`code.language-${language}::-webkit-scrollbar`)(codeBoxScrollbarStyle),
		link(
			attr.rel("stylesheet"),
			attr.href("./libs/highlight/styles/github-dark.min.css")
		),
		pre(
			code(
				codeBlock,
				attr.class(`language-${language}`),
				sourceCode,
				() => highlighter.highlightElement(codeBlock.deref())
			)
		)
	)
}