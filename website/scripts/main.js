import {
	natives, nodes, showIf,
	on, ref, pathSetter,
	getNodes, animate, css
} from "../../dist/jquire.min.js"

natives.globalize()
const { attr, text, fragment } = nodes

const assets = pathSetter("../../assets/")

const styles = {
	JqIcon: {
		self: {
			display: "flex",
			alignItems: "baseline",
			fontWeight: "600",
		},
		div0: {
			backgroundColor: "white",
			width: "1.5rem",
			height: "1.5rem",
			display: "flex",
			fontSize: "1rem",
			fontWeight: "900",
			alignItems: "center",
			boxSizing: "border-box",
			paddingRight: "0.15rem",
			justifyContent: "flex-end",
			color: "var(--cinder)",
			borderRadius: "0.4rem",
			marginRight: "0.1rem"
		}
	},
	Navbar: {
		self: {
			backgroundColor: "var(--mirage)",
			width: "100%",
			height: "3rem",
			display: "flex",
			padding: "0rem 1rem",
			boxSizing: "border-box",
			alignItems: "center",
			borderRadius: "0.25rem"
		},
		button0: {
			width: "1.5rem",
			height: "1.5rem",
			padding: "0.1rem",
			marginLeft: "auto",
			border: "none",
			backgroundSize: "contain",
			backgroundColor: "transparent",
			backgroundImage: `url('${assets("icon - menu_book.svg")}')`
		}
	},
	Header: {
		div0: {
			height: "80vh",
			backgroundRepeat: "no-repeat, no-repeat",
			backgroundSize: "11rem 11rem, 7rem 7rem",
			backgroundPosition: "10% 45%, 100% 100%",
			display: "flex",
			justifyContent: "flex-end",
			boxSizing: "border-box",
			backgroundImage: `url('${assets("site-logo.png")}'), url('${assets("border-pattern-1-lg.svg")}')`
		},
		div0_div0: {
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-end",
			boxSizing: "border-box",
			paddingTop: "7%",
		},
		div0_div0_div0: {
			display: "flex",
			alignItems: "center"
		},
		div0_div0_div0_button0: {
			fontVariant: "small-caps",
			padding: "0.45rem 1rem",
			borderRadius: "0.25rem",
			border: "none",
			color: "white",
			fontSize: "0.65rem",
			fontWeight: "bold",
			marginRight: "0.5rem",
			backgroundImage: "linear-gradient(103.21deg, #D59D7D 0%, #BF570B 67.82%)"
		},
		div0_div0_div0_button0_hover: {
			transform: "scale(0.98)"
		},
		div0_div0_div0_button1: {
			width: "1.65rem",
			height: "1.65rem",
			border: "none",
			backgroundRepeat: "no-repeat",
			backgroundSize: "contain",
			backgroundColor: "transparent",
			backgroundImage: `url('${assets("icon - github.svg")}')`
		},
		div0_div0_div0_button1_hover: {
			transform: "scale(0.98)"
		}
	}
}

const JqIcon = () => div(
	css(styles.JqIcon.self),
	div(
		css(styles.JqIcon.div0),
		"jQ"
	),
	"uire"
)

const MenuIcon = () => button(
	attr.class("menu-btn"),
)

const Navbar = () => nav(
	css(styles.Navbar.self),
	css("button.menu-btn")(styles.Navbar.button0),
	JqIcon(),
	MenuIcon()
)

const Header = () => header(
	Navbar(),
	div(
		css(styles.Header.div0),
		div(
			css(styles.Header.div0_div0),
			div(
				css.width("80%"),
				h1(
					css.marginBottom("0rem"),
					"jQuery UI Reciter"
				),
				p(
					css.width("60%"),
					css.marginBottom("1rem"),
					"A library that embraces JavaScript and let's you build amazing things."
				),
				div(
					css(styles.Header.div0_div0_div0),
					css("button.explore-btn")(styles.Header.div0_div0_div0_button0),
					css("button.github-btn")(styles.Header.div0_div0_div0_button1),
					css("button.explore-btn:active")(styles.Header.div0_div0_div0_button0_hover),
					css("button.github-btn:active")(styles.Header.div0_div0_div0_button1_hover),
					button(
						attr.class("explore-btn"),
						"lets explore"
					),
					button(
						attr.class("github-btn")
					)
				)
			)
		)
	)
)

const _main = main(
	Header(

	)
)

_main.attachTo(document.body)