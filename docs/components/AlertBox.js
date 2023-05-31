import { natives, nodes, css, pathSetter } from "../libs/jquire/jquire.min.js"

const { div, img, h4, p } = natives
const { attr, text, fragment } = nodes

const assets = pathSetter("./assets/")

export default (heading = '', content = '') => {
	const style = {
		boxSizing: "border-box",
		borderLeft: "0.3rem solid var(--greenish-fountain-blue)",
		padding: "0.85rem 1.75rem",
		borderRadius: "0.2rem",
		backgroundColor: "var(--mirage)"
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