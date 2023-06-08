import { natives, nodes, css, ref } from "https://cdn.jsdelivr.net/npm/jquire@latest/build/jquire.min.js"
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

	const codeThemeLinkRef = decideCodeTheme()
	const codeBlock = ref()

	return div(
		css(style),
		css(`code.language-${language}`)(codeStyle),
		css(`:host::-webkit-scrollbar`)(codeBoxScrollbarStyle),
		css(`:host::-webkit-scrollbar-thumb`)(codeBoxScrollbarThumbStyle),
		link(
			codeThemeLinkRef,
			attr.rel("stylesheet"),
			({ codeThemeLink }) => attr.href(codeThemeLink)
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

	function decideCodeTheme() {
		const codeThemes = {
			dark: "./libs/highlight/styles/github-dark.min.css",
			light: "./libs/highlight/styles/github.min.css",
		}

		if (!window.matchMedia) return ref({ codeThemeLink: codeThemes.dark })

		const preferLightTheme = window.matchMedia("(prefers-color-scheme: light)").matches

		const codeThemeLink = preferLightTheme ? codeThemes.light : codeThemes.dark
		const codeThemeLinkRef = ref({ codeThemeLink })

		window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", event => {
			const codeThemeLink = event.matches ? codeThemes.light : codeThemes.dark
			codeThemeLinkRef.codeThemeLink = codeThemeLink
		})

		return codeThemeLinkRef
	}
}