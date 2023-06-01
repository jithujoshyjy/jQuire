// import { natives, nodes, css, pathSetter, ref } from "../libs/jquire/jquire.min.js"
import { natives, nodes, css, pathSetter, ref } from "../../dist/jquire.js"

const { pre, code, link } = natives
const { attr, fragment } = nodes

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
		backgroundColor: "var(--mirage)",
		border: "0.075rem solid var(--mirage-lite)",
	}

	const codeStyle = {
		backgroundColor: "transparent !important",
		padding: "0rem !important",
		tabSize: "2rem"
	}

	const codeBoxScrollbarStyle = {
		height: "0.75rem",
		borderRadius: "0.25rem",
		backgroundColor: "var(--mirage-lite)",
	}

	const codeBoxScrollbarThumbStyle = {
		backgroundColor: "var(--mirage)",
		borderRadius: "0.25rem",
		border: "0.1rem solid var(--mirage-lite)"
	}

	const codeBlock = ref()
	return div(
		css(style),
		css(`code.language-${language}`)(codeStyle),
		css(`:host::-webkit-scrollbar`)(codeBoxScrollbarStyle),
		css(`:host::-webkit-scrollbar-thumb`)(codeBoxScrollbarThumbStyle),
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