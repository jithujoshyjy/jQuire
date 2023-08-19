import {
	natives, nodes, watch, each,
	on, state, when,
	getNodes, animate, css, custom,
	attach, detach
} from "../src/jquire.js"

const {
	div, input, button,
	form, dialog, img,
	main, nav, a, br, hr, ul, li,
	footer, template, span, aside,
	header
} = natives

const { attr, text, fragment } = nodes

const sidebarST = state({ clicked: false })
const numbersST = state(Array.from({ length: 2 }, (_, i) => i + 1))

const app = div(
	div(
		a("Qwerty", css({ textDecoration: "none", color: "yellow" }), attr.href("#")),
		css.backgroundColor("purple"),
		css.alignItems("center"),
		/* css("::before")({
			backgroundColor: "black", display: "block", width: "100px", height: "100px", content: "''"
		}), */
		a("abcd", attr.href("#")),
		css("a:hover")({ color: "fuchsia" }),
		"abcd",
		div(
			span("anshbj"),
			div(
				a("abcd", attr.href("#"))
			)
		)
	),
	div(
		header(css.border("1px solid green")),
		a("efgh", attr.href("#")),
		(_ = watch(sidebarST)) => (_ = when(sidebarST.clicked)) =>
			aside(
				(_ = attach()) => console.log("sidebar visible"),
				(_ = detach()) => console.log("sidebar hidden")
			),
		button("⊞", (_ = on("click")) => sidebarST.clicked = !sidebarST.clicked),
	)
)

/*
const data = state(['a', 'b', 'c', 'd'])
div(
	(changed = watch(data)) => null,       [✔]
	(condition = when(x == y)) => null,    [✔]
	(event = on("click")) => null,         [✔]
	([item, idx] = each(data)) => null,    [✔]
	(event = attach()) => null,            [✔]
	(event = detach()) => null,            [✔]
	(promise = awaitable.pending) => null,
	(value = awaitable.then) => null,
	(error = awaitable.catch) => null
)
*/

app.attachTo(document.body)