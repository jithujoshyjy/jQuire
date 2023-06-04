import {
	natives, nodes, showIf,
	on, ref, pathSetter,
	getNodes, animate, css
} from "../libs/jquire/jquire.min.js"

/* import {
	natives, nodes, showIf,
	on, ref, pathSetter,
	getNodes, animate, css
} from "../../dist/jquire.js" */

import highlight from "../libs/highlight/es/core.js"
import javascript from "../libs/highlight/es/languages/javascript.min.js"
import bash from "../libs/highlight/es/languages/bash.min.js"
import xml from "../libs/highlight/es/languages/xml.min.js"

import AlertBox from "../components/AlertBox.js"
import CodeBox from "../components/CodeBox.js"
import Link from "../components/Link.js"
import Emphasize from "../components/Emphasize.js"

highlight.registerLanguage("xml", xml)
highlight.registerLanguage("bash", bash)
highlight.registerLanguage("javascript", javascript)

natives.globalize()
const { attr } = nodes

const assets = pathSetter("./assets/")

const sectionStyle = {
	marginBottom: "2.5rem"
}

const sectionHeadingStyle = {
	display: "inline-block",
	marginTop: "1.5rem"
}

const Navbar = () => {
	const JqIcon = () => {
		const style = {
			fontWeight: "600",
		}

		const jQPartStyle = {
			backgroundColor: "var(--font-color)",
			width: "1.5rem",
			height: "1.5rem",
			display: "flex",
			fontSize: "1rem",
			fontWeight: "900",
			alignItems: "center",
			boxSizing: "border-box",
			paddingRight: "0.15rem",
			justifyContent: "flex-end",
			color: "var(--background-color-primary)",
			borderRadius: "0.4rem",
			marginRight: "0.1rem",
		}

		const jQIconLinkStyle = {
			color: "inherit",
			textDecoration: "none",
			display: "flex",
			alignItems: "baseline",
			transition: "transform 200ms"
		}

		const jQIconLinkActiveStyle = {
			transform: "scale(0.9)"
		}

		return div(
			css(style),
			css("a.jq-home-link")(jQIconLinkStyle),
			css("a.jq-home-link:active")(jQIconLinkActiveStyle),
			css("span.jq-part")(jQPartStyle),
			a(
				attr.aria_label("jQuire"),
				attr.class("jq-home-link"),
				attr.href("#"),
				span(
					attr.class("jq-part"),
					"jQ"
				),
				"uire"
			)
		)
	}

	const MenuIcon = (sidebarRef) => {
		const handleMenuBtnClick = (evt) => {
			evt.stopPropagation()
			sidebarRef.clicked = !sidebarRef.clicked
		}

		return button(
			attr.class("menu-btn"),
			attr.aria_label("menu"),
			on.click(handleMenuBtnClick)
		)
	}

	const Sidebar = (sidebarRef) => {
		const style = {
			position: "absolute",
			top: "3rem",
			right: "-1rem",
			width: "12.5rem",
			height: "80vh",
			zIndex: "10",
			boxSizing: "border-box",
			padding: "1rem",
			borderRadius: "0.25rem",
			border: "0.075rem solid var(--background-color-tertiary)",
			backgroundColor: "var(--background-color-secondary)",
			boxShadow: "var(--shadow-large)"
		}

		const searchFieldStyle = {
			width: "100%",
			backgroundColor: "var(--background-color-primary)",
			border: "none",
			outline: "none",
			color: "var(--font-color)",
			fontSize: "0.6rem",
			borderRadius: "0.15rem",
			padding: "0.35rem 0.65rem",
			border: "0.075rem solid var(--background-color-tertiary)"
		}

		const searchFieldFocusStyle = {
			borderColor: "var(--greenish-fountain-blue)"
		}

		const sectionListStyle = {
			height: "90%",
			overflow: "auto",
			listStyleType: "none",
			padding: "0rem",
			fontSize: "0.65rem",
		}

		const sectionListItemStyle = {
			padding: "0.5rem 1rem",
			borderRadius: "0.15rem"
		}

		const sectionListItemHoverStyle = {
			backgroundColor: "var(--background-color-tertiary)"
		}

		const sectionListScrollbarStyle = {
			height: "0.75rem",
			borderRadius: "0.25rem",
			backgroundColor: "var(--background-color-tertiary)",
		}

		const sectionListScrollbarThumbStyle = {
			backgroundColor: "var(--background-color-secondary)",
			borderRadius: "0.25rem",
			border: "0.1rem solid var(--background-color-tertiary)"
		}

		const goToSectionLinkStyle = {
			color: "inherit",
			textDecoration: "none",
		}

		const goToSectionLinkHoverStyle = {
			textDecoration: "underline"
		}

		const onUpdateCallback = () => {
			sidebarRef.deref().style.setProperty("display", sidebarRef.clicked ? "initial" : "none")
		}

		let headings = [
			{ id: "what-n-why-section", text: "What and Why?" },
			{ id: "installation-n-imports-section", text: "Installation and Imports" },
			{ id: "using-npm-section", text: "Using npm" },
			{ id: "using-cdn-section", text: "Using cdn" },
			{ id: "imports-after-installation-section", text: "Imports after installation" },
			{ id: "components-section", text: "Components" },
			{ id: "nesting-section", text: "Nesting" },
			{ id: "component-attributes-n-children-section", text: "Component attributes and children" },
			{ id: "rendering-content-section", text: "Rendering Content" },
			{ id: "specifying-attributes-section", text: "Specifying Attributes" },
			{ id: "styling-elements-section", text: "Styling Elements" },
			{ id: "css-properties-section", text: "CSS Properties" },
			{ id: "specifying-styles-for-child-elements-section", text: "Specifying Styles for Child Elements" },
			{ id: "pseudo-classes-pseudo-elements-n-css-rules-section", text: "Pseudo Classes, Pseudo Elements and CSS Rules" },
			{ id: "animating-elements-section", text: "Animating Elements" },
			{ id: "handling-events-section", text: "Handling Events" },
			{ id: "creating-elements-from-an-iterable-section", text: "Creating elements from an Iterable" },
			{ id: "reactive-data-n-element-reference-section", text: "Reactive Data and Element Reference" },
			{ id: "conditional-rendering-section", text: "Conditional Rendering" },
		]

		const hasHeadingListRefreshed = false
		const headingRefreshRef = ref({ hasHeadingListRefreshed })

		const originalHeadings = [...headings]
		const handleInput = (evt) => {
			headings = originalHeadings.filter(x =>
				x.text.toLowerCase().includes(evt.target.value.trim().toLowerCase()))
			return headingRefreshRef.hasHeadingListRefreshed = true
		}

		return aside(
			sidebarRef,
			css(style),
			onUpdateCallback,
			css("input.search-field")(searchFieldStyle),
			css("input.search-field:focus")(searchFieldFocusStyle),
			css("ul.section-list")(sectionListStyle),
			css(`ul.section-list::-webkit-scrollbar`)(sectionListScrollbarStyle),
			css(`ul.section-list::-webkit-scrollbar-thumb`)(sectionListScrollbarThumbStyle),
			css("ul.section-list > li")(sectionListItemStyle),
			css("ul.section-list > li:hover")(sectionListItemHoverStyle),
			css("a.go-to-section-link")(goToSectionLinkStyle),
			css("a.go-to-section-link:hover")(goToSectionLinkHoverStyle),
			input(
				on.input(handleInput),
				attr.class("search-field"),
				attr.type("search"),
				attr.placeholder("Filter Headings")
			),
			ul(
				headingRefreshRef,
				attr.class("section-list"),
				() => headings.map(h =>
					li(
						a(
							attr.class("go-to-section-link"),
							attr.href('#' + h.id),
							h.text
						)
					)
				)
			)
		)
	}

	const style = {
		backgroundColor: "var(--background-color-secondary)",
		width: "100%",
		height: "3rem",
		display: "flex",
		padding: "0rem 1rem",
		boxSizing: "border-box",
		alignItems: "center",
		borderRadius: "0.25rem",
		width: "calc(100% - 3.5rem)",
		border: "0.075rem solid var(--background-color-tertiary)",
	}

	const menuBtnStyle = {
		width: "1.6rem",
		height: "1.6rem",
		padding: "0.1rem",
		border: "none",
		cursor: "pointer",
		backgroundSize: "contain",
		backgroundColor: "transparent",
		transition: "transform 200ms",
		backgroundImage: `url('${assets("icon - menu_book-light.svg")}')`
	}

	const menuBtnActiveStyle = {
		transform: "scale(0.9)"
	}

	const menuContainerStyle = {
		marginLeft: "auto",
		position: "relative"
	}

	const clicked = false
	const sidebarRef = ref({ clicked })

	return nav(
		css(style),
		JqIcon(),
		div(
			css(menuContainerStyle),
			css("button.menu-btn")(menuBtnStyle),
			css("button.menu-btn:active")(menuBtnActiveStyle),
			css("@media (prefers-color-scheme: light)")(
				css("button.menu-btn")({
					backgroundImage: `url('${assets("icon - menu_book-dark.svg")}')`
				})
			),
			MenuIcon(sidebarRef),
			Sidebar(sidebarRef)
		)
	)
}

const Header = () => {
	const style = {
		marginBottom: "5rem",
		position: "relative"
	}

	const navWrapperStyle = {
		width: "100%",
		paddingTop: "1rem",
		backgroundColor: "var(--background-color-primary)",
		position: "fixed",
		zIndex: "10",
		top: "0rem"
	}

	const calloutDivStyle = {
		width: "100%",
		height: "80vh",
		position: "relative",
		backgroundRepeat: "no-repeat",
		backgroundSize: "7rem 7rem",
		backgroundPosition: "100% 100%",
		display: "inline-grid",
		gridTemplate: "1fr / 1fr 0.85fr",
		alignItems: "center",
		marginTop: "3rem",
		backgroundImage: `url('${assets("border-pattern-1-lg.svg")}')`
	}

	const calloutDivMaxWidth500pxStyle = {
		gridTemplate: "0.5fr 0.2fr / 1fr",
		justifyContent: "center",
		justifyItems: "center"
	}

	const jQuireLogoStyle = {
		width: "11rem",
		height: "11rem",
		marginLeft: "7rem",
	}

	const jQuireLogoMaxWidth500pxStyle = {
		marginLeft: "0rem !important",
	}

	const calloutInnerDivStyle = {
		width: "100%",
		display: "flex",
		flexDirection: "column",
	}

	const calloutInnerDivMaxWidth500pxStyle = {
		alignItems: "center",
		marginLeft: "0rem",
	}

	const calloutBtnGroupStyle = {
		display: "flex",
		alignItems: "center"
	}

	const exploreLinkStyle = {
		fontVariant: "small-caps",
		padding: "0.2rem 1rem",
		borderRadius: "0.25rem",
		display: "inline-block",
		border: "none",
		color: "white",
		cursor: "pointer",
		fontSize: "0.75rem",
		fontWeight: "bold",
		marginRight: "0.5rem",
		textDecoration: "none",
		transition: "transform 200ms",
		backgroundImage: "linear-gradient(103.21deg, #D59D7D 0%, #BF570B 67.82%)"
	}

	const githubLinkStyle = {
		width: "1.65rem",
		height: "1.65rem",
		border: "none",
		display: "inline-block",
		backgroundRepeat: "no-repeat",
		backgroundSize: "contain",
		backgroundColor: "transparent",
		transition: "transform 200ms",
		backgroundImage: `url('${assets("icon - github-light.svg")}')`
	}

	const linkActiveStyle = {
		transform: "scale(0.9)"
	}

	const ButtonGroup = () => div(
		css(calloutBtnGroupStyle),
		css("a.explore-btn")(exploreLinkStyle),
		css("a.github-btn")(githubLinkStyle),
		css("a.explore-btn:active")(linkActiveStyle),
		css("a.github-btn:active")(linkActiveStyle),
		css("@media (prefers-color-scheme: light)")(
			css("a.github-btn")({
				backgroundImage: `url('${assets("icon - github-dark.svg")}')`
			})
		),
		a(
			attr.href("#installation-n-imports-section"),
			attr.aria_label("lets explore"),
			attr.class("explore-btn"),
			"lets explore"
		),
		a(
			attr.href("https://github.com/jithujoshyjy/jQuire"),
			attr.aria_label("go to github"),
			attr.class("github-btn")
		)
	)

	return header(
		css(style),
		div(
			css(navWrapperStyle),
			Navbar()
		),
		div(
			css(calloutDivStyle),
			css("@media", "screen", "and", "(max-width: 500px)")(
				css(":host")(calloutDivMaxWidth500pxStyle),
				css("img.jquire-logo")(jQuireLogoMaxWidth500pxStyle),
			),
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
				css("@media", "screen", "and", "(max-width: 500px)")(
					css(":host")(calloutInnerDivMaxWidth500pxStyle)
				),
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

	return section(
		css(style),
		css("h3.what-n-why-heading")(sectionHeadingStyle),
		attr.id("what-n-why-section"),
		h3(
			attr.class("what-n-why-heading"),
			"What and Why?"
		),
		p(
			css(paragraphStyle),
			css.marginBottom("2rem"),
			`jQuire as you might catch from the name is heavily inspired by the JavaScript's good old library `,
			Link("jQuery", attr.href("https://jquery.com/")),
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
			attr.id("using-npm-section"),
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
			attr.id("using-cdn-section"),
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
			attr.id("imports-after-installation-section"),
			h4(
				css(ImportsAfterInstallationHeadingStyle),
				"Imports after installation"
			),
			CodeBox("javascript", code1, highlight),
			p(
				`After you specify all the required imports you can either destructure each html element creator function from`,
				Emphasize("natives"),
				`proxy object.`
			),
			CodeBox("javascript", code2, highlight),
			p(
				`Or, you can populate all the valid html element creators into the`,
				Emphasize("globalThis"),
				`object and make them available in the global scope.`
			),
			CodeBox("javascript", code3, highlight),
		)
	}

	return section(
		css(style),
		attr.id("installation-n-imports-section"),
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
			attr.id("nesting-section"),
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
			attr.id("component-attributes-n-children-section"),
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
		attr.id("components-section"),
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
		attr.id("rendering-content-section"),
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
		attr.id("specifying-attributes-section"),
		h3(
			attr.class("specifying-attributes-heading"),
			"Specifying Attributes"
		),
		CodeBox("javascript", code1, highlight),
	)
}

const StylingElementsSection = () => {
	const style = {
		...sectionStyle,
		minHeight: "100vh",
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const stylingElementsStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const headingStyle = {
		marginTop: "3rem",
	}

	const CSSProperties = () => {
		const style = {
			...headingStyle,
		}

		const code1 = `div(
    css.height("50px"),
    css({ backgroundColor: "lightblue" })
)`

		return section(
			attr.id("css-properties-section"),
			h4(
				css(style),
				"CSS Properties",
			),
			CodeBox("javascript", code1, highlight)
		)
	}

	const SpecifyingStylesForChildElements = () => {
		const styles = {
			...headingStyle
		}

		const code1 = `div(
    css("button.abc")({
        backgroundColor: "violet",
        borderRadius: "5px",
        border: "none",
        padding: "5px 15px",
        fontVariant: "small-caps"
    }),
    button(
        attr.class("abc"),
        "click me!"
    )
)`

		return section(
			attr.id("specifying-styles-for-child-elements-section"),
			h4(
				css(styles),
				"Specifying Styles for Child Elements"
			),
			CodeBox("javascript", code1, highlight)
		)
	}

	const PseudoClassesPseudoElementsNCSSRules = () => {
		const PseudoClassesPseudoElementsNCSSRulesHeadingStyle = {
			...headingStyle
		}

		const code1 = `button(
    "click me!",
    css(":hover")({
        backgroundColor: "teal"
    }),
    css("::before")({
        content: "",
        border: "1px solid fuchsia",
        display: "inline-block",
        width: "25px",
        height: "25px"
    }),
    css("@keyframes", "press")({
        "100%": {
            transform: "scale(1.15)"
        }
    }),
	css("@media screen and (max-width: 500px)")(
		css(":host")({
			backgroundColor: "tomato",
			margin: "1rem"
		}),
		css("div.card")({
			borderRadius: "0.25rem",
			border: "1px solid #ECECEC"
		})
	)
)`

		return section(
			attr.id("pseudo-classes-pseudo-elements-n-css-rules-section"),
			h4(
				css(PseudoClassesPseudoElementsNCSSRulesHeadingStyle),
				"Pseudo Classes, Pseudo Elements and CSS Rules"
			),
			CodeBox("javascript", code1, highlight),
		)
	}

	return section(
		css(style),
		css("h3.styling-elements-heading")(stylingElementsStyle),
		attr.id("styling-elements-section"),
		h3(
			attr.class("styling-elements-heading"),
			"Styling Elements"
		),
		p(
			`All styles on block elements are scoped by default using the `,
			Link(
				"Shadow DOM.",
				attr.href("https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM")
			),
			` You can even specify css rules in them.`
		),
		CSSProperties(),
		SpecifyingStylesForChildElements(),
		PseudoClassesPseudoElementsNCSSRules()
	)
}

const AnimatingElementsSection = () => {
	const style = {
		...sectionStyle,
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const animatingElementsHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `div(
    animate({ height: "500px" })
)`

	return section(
		css(style),
		css("h3.animating-elements-heading")(animatingElementsHeadingStyle),
		attr.id("animating-elements-section"),
		h3(
			attr.class("animating-elements-heading"),
			"Animating Elements"
		),
		CodeBox("javascript", code1, highlight),
	)
}

const HandlingEventsSection = () => {
	const style = {
		...sectionStyle,
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const handlingEventsHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `button(
    "click me!",
    on.click(_ => console.log("clicked!"))
)`

	return section(
		css(style),
		css("h3.handling-events-heading")(handlingEventsHeadingStyle),
		attr.id("handling-events-section"),
		h3(
			attr.class("handling-events-heading"),
			"Handling Events"
		),
		CodeBox("javascript", code1, highlight),
	)
}

const CreatingElementsFromAnIterableSection = () => {
	const style = {
		...sectionStyle,
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const creatingElementsFromAnIterableHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `const fruits = ["apple", "orange", "banana"]
const fruitEmojis = ['🍎', '🍊', '🍌']

ul(
    fruits.map((fruit, i) =>
        \`\${fruit} - \${fruitEmojis[i]}\`)
)`

	return section(
		css(style),
		css("h3.creating-elements-from-an-iterable-heading")(creatingElementsFromAnIterableHeadingStyle),
		attr.id("creating-elements-from-an-iterable-section"),
		h3(
			attr.class("creating-elements-from-an-iterable-heading"),
			"Creating elements from an Iterable"
		),
		CodeBox("javascript", code1, highlight),
	)
}

const ReactiveDataNElementReferenceSection = () => {
	const style = {
		...sectionStyle,
		minHeight: "100vh",
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const reactiveDataNElementReferenceHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `const person = {
    name: "John",
    age: 26,
    profession: "Artist"
}

const personRef = ref({ person })
div(
    personRef,
    ({ person }) => \`John is \${person.age} years old!\`,
    // will be refreshed for every state change
    button(
        "increment age",
        on.click(_ => personRef.person.age++)
    )
)

console.log(personRef.deref()) // HTMLDivElement`

	const code2 = `button(
    "increment age",
    on.click(_ => personRef.refresh(() => person.age++))
)`

	return section(
		css(style),
		css("h3.reactive-data-n-element-reference-heading")(reactiveDataNElementReferenceHeadingStyle),
		attr.id("reactive-data-n-element-reference-section"),
		h3(
			attr.class("reactive-data-n-element-reference-heading"),
			"Reactive Data and Element Reference"
		),
		p(
			`You can use the`,
			Emphasize("ref()"),
			`function to store reactive objects and reference to html elements.`,
			br(),
			`The`, Emphasize("deref()"),
			`method of the JqReference object will give back the reference to the html elements. `
		),
		CodeBox("javascript", code1, highlight),
		p(
			`You can also use the`,
			Emphasize("JqReference.refresh()"),
			`function to batch together updates for more efficiency. It can especially be handy if you're push or popping elements from an array.`
		),
		CodeBox("javascript", code2, highlight),
	)
}

const ConditionalRenderingSection = () => {
	const style = {
		...sectionStyle,
		minHeight: "80vh",
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const conditionalRenderingHeadingStyle = {
		...sectionHeadingStyle,
		marginBottom: "1rem"
	}

	const code1 = `const age = 50
div(
    showIf(age > 200) &&
        span("Invalid age: It cannot be greater than 200.")
)`

	return section(
		css(style),
		css("h3.conditional-rendering-heading")(conditionalRenderingHeadingStyle),
		attr.id("conditional-rendering-section"),
		h3(
			attr.class("conditional-rendering-heading"),
			"Conditional Rendering"
		),
		p(
			`You can choose to render or not to render certain elements based on a condition using`,
			Emphasize("showIf()"),
			`function.`,
		),
		CodeBox("javascript", code1, highlight),
	)
}

const Footer = () => {
	const style = {
		boxSizing: "border-box",
		paddingLeft: "3.5rem",
		paddingRight: "3.5rem",
	}

	const dividerLineStyle = {
		borderWidth: "0.025rem",
		borderColor: "var(--background-color-tertiary)",
		backgroundColor: "var(--background-color-tertiary)"
	}

	const footerTextStyle = {
		display: "block",
		textAlign: "center",
		margin: "2rem 0rem",
		fontSize: "0.75rem",
	}

	return footer(
		css(style),
		css("hr.divider")(dividerLineStyle),
		css("small.footer-text")(footerTextStyle),
		hr(attr.class("divider")),
		small(
			attr.class("footer-text"),
			`Made with 🧡 using jQuire`
		)
	)
}

const _main = main(
	Header(),
	WhatNWhySection(),
	InstallationNImportsSection(),
	ComponentsSection(),
	RenderingContentSection(),
	SpecifyingAttributesSection(),
	StylingElementsSection(),
	AnimatingElementsSection(),
	HandlingEventsSection(),
	CreatingElementsFromAnIterableSection(),
	ReactiveDataNElementReferenceSection(),
	ConditionalRenderingSection(),
	Footer()
)

_main.attachTo(document.body)