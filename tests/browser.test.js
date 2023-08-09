import {
	natives, nodes, watch, each,
	on, state, pathSetter, when,
	getNodes, animate, css, custom,
	mount, unmount
} from "../src/jquire.js"

const {
	div, input, button,
	form, dialog, img,
	main, nav, a, br, hr, ul, li,
	footer, template, span, aside
} = natives

const { attr, text, fragment } = nodes

const sidebarST = state({ clicked: false })
const numbersST = state(Array.from({ length: 2 }, (_, i) => i + 1))
const style = {
	lineHeight: "8px"
}

const app = div(
	div(
		button("⊞", (_ = on("click")) => sidebarST.clicked = !sidebarST.clicked),
		(_ = watch(sidebarST)) => (_ = when(sidebarST.clicked)) =>
			aside(
				(_ = mount()) => console.log("sidebar visible"),
				(_ = unmount()) => console.log("sidebar hidden")
			),
	)
)

/*
const data = state(['a', 'b', 'c', 'd'])
div(
	(changed = watch(data)) => null,    [✔]
	(condition = when(x == y)) => null, [✔]
	(event = on("click")) => null,      [✔]
	([item, idx] = each(data)) => null, [✔]
	(event = mount()) => null,			[✔]
	(event = unmount()) => null,		[✔]
	(promise = awaitable.pending) => null,
	(value = awaitable.then) => null,
	(error = awaitable.catch) => null
)
*/

app.attachTo(document.body)