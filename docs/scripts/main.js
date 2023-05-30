import {
	natives, nodes, showIf,
	on, ref, pathSetter,
	getNodes, animate, css
} from "../../dist/jquire.min.js"

import highlight from "../libs/highlight/es/core.js"
import javascript from "../libs/highlight/es/languages/javascript.min.js"
import bash from "../libs/highlight/es/languages/bash.min.js"
import xml from "../libs/highlight/es/languages/xml.min.js"

import AlertBox from "../components/AlertBox.js"
import CodeBox from "../components/CodeBox.js"

highlight.registerLanguage("xml", xml)
highlight.registerLanguage("bash", bash)
highlight.registerLanguage("javascript", javascript)

natives.globalize()
const { attr, text, fragment } = nodes

const assets = pathSetter("../../assets/")

const sectionStyle = {
	marginBottom: "2.5rem"
}

const sectionHeadingStyle = {
	display: "inline-block",
	marginTop: "1.5rem"
}

const JqIcon = () => {
	const style = {
		display: "flex",
		alignItems: "baseline",
		fontWeight: "600",
	}

	const jQDivStyle = {
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

	return div(
		css(style),
		div(
			css(jQDivStyle),
			"jQ"
		),
		"uire"
	)
}

const MenuIcon = () => button(
	attr.class("menu-btn"),
)

const Navbar = () => {
	const style = {
		backgroundColor: "var(--mirage)",
		width: "100%",
		height: "3rem",
		display: "flex",
		padding: "0rem 1rem",
		boxSizing: "border-box",
		alignItems: "center",
		borderRadius: "0.25rem"
	}

	const menuBtnStyle = {
		width: "1.5rem",
		height: "1.5rem",
		padding: "0.1rem",
		marginLeft: "auto",
		border: "none",
		backgroundSize: "contain",
		backgroundColor: "transparent",
		backgroundImage: `url('${assets("icon - menu_book.svg")}')`
	}

	return nav(
		css(style),
		css("button.menu-btn")(menuBtnStyle),
		JqIcon(),
		MenuIcon()
	)
}

const Header = () => {
	const style = {
		marginBottom: "5rem"
	}

	const calloutDivStyle = {
		height: "80vh",
		backgroundRepeat: "no-repeat",
		backgroundSize: "7rem 7rem",
		backgroundPosition: "100% 100%",
		display: "flex",
		alignItems: "center",
		backgroundImage: `url('${assets("border-pattern-1-lg.svg")}')`
	}

	const jQuireLogoStyle = {
		width: "11rem",
		height: "11rem",
		marginLeft: "7rem",
	}

	const calloutInnerDivStyle = {
		display: "flex",
		flexDirection: "column",
		marginLeft: "10rem",
	}

	const calloutBtnGroupStyle = {
		display: "flex",
		alignItems: "center"
	}

	const exploreBtnStyle = {
		fontVariant: "small-caps",
		padding: "0.45rem 1rem",
		borderRadius: "0.25rem",
		border: "none",
		color: "white",
		fontSize: "0.65rem",
		fontWeight: "bold",
		marginRight: "0.5rem",
		backgroundImage: "linear-gradient(103.21deg, #D59D7D 0%, #BF570B 67.82%)"
	}

	const githubBtnStyle = {
		width: "1.65rem",
		height: "1.65rem",
		border: "none",
		backgroundRepeat: "no-repeat",
		backgroundSize: "contain",
		backgroundColor: "transparent",
		backgroundImage: `url('${assets("icon - github.svg")}')`
	}

	const btnHoverStyle = {
		transform: "scale(0.98)"
	}

	const ButtonGroup = () => div(
		css(calloutBtnGroupStyle),
		css("button.explore-btn")(exploreBtnStyle),
		css("button.github-btn")(githubBtnStyle),
		css("button.explore-btn:active")(btnHoverStyle),
		css("button.github-btn:active")(btnHoverStyle),
		button(
			attr.class("explore-btn"),
			"lets explore"
		),
		button(
			attr.class("github-btn")
		)
	)

	return header(
		css(style),
		Navbar(),
		div(
			css(calloutDivStyle),
			css("img.jquire-logo")(jQuireLogoStyle),
			img(
				attr.class("jquire-logo"),
				attr.width("250"),
				attr.height("250"),
				attr.alt("jquire logo"),
				attr.src(assets("site-logo.png"))
			),
			div(
				css(calloutInnerDivStyle),
				div(
					css.display("inline-block"),
					h1(
						css.marginTop("0rem"),
						css.marginBottom("0rem"),
						"jQuery UI Reciter"
					),
					p(
						css.width("60%"),
						css.marginBottom("1rem"),
						css.marginRight("0rem"),
						"A library that embraces JavaScript and let's you build amazing things."
					),
					ButtonGroup()
				)
			)
		)
	)
}

const WhatNWhySection = () => {
	const style = {
		...sectionStyle,
		height: "100vh",
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
		backgroundRepeat: "no-repeat",
		backgroundImage: `url('${assets("border-pattern-1-sm.svg")}'), url('${assets("border-pattern-1-lg.svg")}')`,
		backgroundSize: "2rem, 7rem 7rem",
		backgroundPosition: "0% 0%, 100% 100%",
	}

	const paragraphStyle = {
		marginTop: "1rem",
	}

	const jQueryLinkStyle = {
		color: "var(--greenish-fountain-blue)",
	}

	return section(
		css(style),
		css("h3.what-n-why-heading")(sectionHeadingStyle),
		h3(
			attr.class("what-n-why-heading"),
			"What and Why?"
		),
		p(
			css(paragraphStyle),
			css.marginBottom("2rem"),
			css("a.jquery-link")(jQueryLinkStyle),
			`jQuire as you might catch from the name is heavily inspired by the JavaScript's good old library `,
			a(
				"jQuery",
				attr.class("jquery-link"),
				attr.href("https://jquery.com/")
			),
			` In its glory days, jQuery eased a lot of the pain points with DOM manipulation and cross-browser support. Where it lost was when it came to big or moderate projects getting increasingly difficult to maintain and debug due to the complexity of the code bubbling out of control.`
		),
		p(
			css(paragraphStyle),
			`Lessons learnt, this library tries to piece together the good parts of jQuery and then some from other frameworks. Like jQuery, it aims to “do more with less” . It tries to improve the developer experience of working with native browser apis. It doesn’t have any dependencies and also doesn't require build steps and configurations.`
		)
	)
}

const InstallationNImportsSection = () => {
	const style = {
		...sectionStyle,
		minHeight: "100vh",
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const installationHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "3rem"
	}

	const headingStyle = {
		marginTop: "3rem",
	}

	const UsingNPM = () => {
		const usingNPMHeadingStyle = {
			...headingStyle
		}

		const _code = `npm install jquire`

		return section(
			h4(
				css(usingNPMHeadingStyle),
				"Using npm",
			),
			CodeBox("bash", _code, highlight)
		)
	}

	const UsingCDN = () => {
		const usingCDNHeadingStyle = {
			...headingStyle
		}

		const _code = `<script type="module" src="https://cdn.jsdelivr.net/gh/jithujoshyjy/jQuire/jquire.min.js"></script>`

		return section(
			h4(
				css(usingCDNHeadingStyle),
				"Using cdn"
			),
			CodeBox("xml", _code, highlight)
		)
	}

	const ImportsAfterInstallation = () => {
		const ImportsAfterInstallationHeadingStyle = {
			...headingStyle
		}

		const emphasizedStyle = {
			fontStyle: "normal",
			backgroundColor: "var(--mirage-lite)",
			padding: "0.1rem 0.45rem",
			borderRadius: "0.2rem",
			margin: "0rem 0.3rem"
		}

		const code1 = `import
{
	natives, nodes, showIf,
	on, ref, pathSetter,
	getNodes, animate, css
}
from "./node_modules/jquire/jquire.min.js"`

		const code2 = `const {
	div, input, button,
	form, dialog, img,
	main, nav, a, br, h1,
	footer, template, span
} = natives

const { attr, text, fragment } = nodes`

		const code3 = `natives.globalize()`

		return section(
			h4(
				css(ImportsAfterInstallationHeadingStyle),
				"Imports after installation"
			),
			CodeBox("javascript", code1, highlight),
			p(
				css("em.emphasized")(emphasizedStyle),
				`After you specify all the required imports you can either destructure each html element creator function from`,
				em(attr.class("emphasized"), "natives"),
				`proxy object.`
			),
			CodeBox("javascript", code2, highlight),
			p(
				css("em.emphasized")(emphasizedStyle),
				`Or, you can populate all the valid html element creators into the`,
				em(attr.class("emphasized"), "globalThis"),
				`object and make them available in the global scope.`
			),
			CodeBox("javascript", code3, highlight),
		)
	}

	return section(
		css(style),
		css("h3.installation-n-imports-heading")(installationHeadingStyle),
		h3(
			attr.class("installation-n-imports-heading"),
			"Installation and Imports"
		),
		AlertBox("Important", `The cdn and npm repository haven't been updated after the overhaul of the library.`),
		UsingNPM(),
		UsingCDN(),
		ImportsAfterInstallation()
	)
}

const ComponentsSection = () => {
	const style = {
		...sectionStyle,
		minHeight: "100vh",
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const componentsHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const headingStyle = {
		marginTop: "3rem",
	}

	const code1 = `const HelloWorld = () => h1("Hello, World!")`

	const Nesting = () => {
		const style = {
			...headingStyle
		}

		const code1 = `const app = div(
    HelloWorld(),
    "Again ", HelloWorld()
)`

		return section(
			h4(
				css(style),
				"Nesting",
			),
			CodeBox("javascript", code1, highlight)
		)
	}

	const ComponentAttributesNChildren = () => {
		const style = {
			...headingStyle
		}

		const code1 = `const Foo = (...props) => {
    const { childNodes, attributes } = getNodes(props)
    return div(
        "====START====",
        ...attributes,
        ...childNodes,
        "=====END====="
    )
}`

		return section(
			h4(
				css(style),
				"Component attributes and children",
			),
			CodeBox("javascript", code1, highlight)
		)
	}

	return section(
		css(style),
		css("h3.components-heading")(componentsHeadingStyle),
		h3(
			attr.class("components-heading"),
			"Components"
		),
		p("Defining a component is as simple as:"),
		CodeBox("javascript", code1, highlight),
		Nesting(),
		ComponentAttributesNChildren()
	)
}

const RenderingContentSection = () => {
	const style = {
		...sectionStyle,
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const renderingContentHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `app.attachTo(document.body)`

	return section(
		css(style),
		css("h3.rendering-content-heading")(renderingContentHeadingStyle),
		h3(
			attr.class("rendering-content-heading"),
			"Rendering Content"
		),
		CodeBox("javascript", code1, highlight),
	)
}

const SpecifyingAttributesSection = () => {
	const style = {
		...sectionStyle,
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const specifyingAttributesHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `input(
    attr.type("number"), // set a single attribute
    attr({ value: 0, max:  100 }), // multiple attributes
    attr.required() // defaults to required = "required"
)`

	return section(
		css(style),
		css("h3.specifying-attributes-heading")(specifyingAttributesHeadingStyle),
		h3(
			attr.class("specifying-attributes-heading"),
			"Specifying Attributes"
		),
		CodeBox("javascript", code1, highlight),
	)
}

const _main = main(
	Header(),
	WhatNWhySection(),
	InstallationNImportsSection(),
	ComponentsSection(),
	RenderingContentSection(),
	SpecifyingAttributesSection()
)

_main.attachTo(document.body)