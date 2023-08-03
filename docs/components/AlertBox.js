import { natives, nodes, css, pathSetter } from "https://cdn.jsdelivr.net/npm/jquire@1.3.19/src/jquire.min.js"

const { div, img, h4, p } = natives
const { attr, text, fragment } = nodes

const assets = pathSetter("./assets/")

export default (heading = '', content = '') => {
	const style = {
		boxSizing: "border-box",
		padding: "0.85rem 1.75rem",
		borderRadius: "0.2rem",
		color: "var(--font-color)",
		backgroundColor: "var(--background-color-secondary)",
		border: "0.075rem solid var(--background-color-tertiary)",
		borderLeft: "0.3rem solid var(--greenish-fountain-blue)",
	}

	const alertHeadingStyle = {
		display: "inline-block",
		margin: "0rem",
		marginLeft: "1rem",
	}

	const alertHeadlineStyle = {
		display: "flex",
		alignItems: "center",
	}

	const alertIconStyle = {
		width: "1.35rem",
		height: "1.35rem"
	}

	return div(
		css(style),
		div(
			css(alertHeadlineStyle),
			css("img.alert-icon")(alertIconStyle),
			img(
				attr.class("alert-icon"),
				attr.src(assets("icon - warning.svg")),
				attr.alt("alert icon"),
				attr.width("30"),
				attr.height("30")
			),
			h4(
				css(alertHeadingStyle),
				heading
			)
		),
		p(
			css.marginBottom("0rem"),
			content
		)
	)
}