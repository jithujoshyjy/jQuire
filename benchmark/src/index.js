import { natives, nodes, css, when, state, on, watch, each } from "https://cdn.jsdelivr.net/npm/jquire@1.4.3/src/jquire.min.js"

natives.globalize()
const { attr } = nodes
const dataST = state({ data: [] })

const adjectives = [
	"pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"
]

const colors = [
	"red", "yellow", "blue", "green", "pink",
	"brown", "purple", "brown", "white", "black", "orange"
]

const nouns = [
	"table", "chair", "house", "bbq", "desk", "car",
	"pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"
]

let did = 1
let selected = -1

const add = () => {
	const perfStart = performance.now()
	dataST.data = dataST.data.concat(buildData(1000))
	const perfEnd = performance.now()
	console.log("add: ", perfEnd - perfStart)
}
const run = () => {
	const perfStart = performance.now()
	dataST.data = buildData(1000)
	const perfEnd = performance.now()
	console.log("run: ", perfEnd - perfStart)
}
const runLots = () => {
	const perfStart = performance.now()
	dataST.data = buildData(10000)
	const perfEnd = performance.now()
	console.log("runLots: ", perfEnd - perfStart)
}
const clear = () => {
	const perfStart = performance.now()
	dataST.data = []
	const perfEnd = performance.now()
	console.log("clear: ", perfEnd - perfStart)
}

const interact = e => {
	const td = e.target.closest("td")
	const interaction = td.getAttribute("data-interaction")
	const id = parseInt(td.parentNode.id)

	return interaction === "delete" ? del(id) : select(id)
}

const del = id => {
	const idx = dataST.data.findIndex(d => d.id === id)
	dataST.data.splice(idx, 1)
	const perfStart = performance.now()
	dataST.data = dataST.data
	const perfEnd = performance.now()
	console.log("del: ", perfEnd - perfStart)
}

const select = id => {
	if (selected > -1) {
		dataST.data[selected].selected = false
	}
	selected = dataST.data.findIndex(d => d.id === id)
	dataST.data[selected].selected = true
	const perfStart = performance.now()
	dataST.data = dataST.data
	const perfEnd = performance.now()
	console.log("select: ", perfEnd - perfStart)
}

const swapRows = () => {
	if (dataST.data.length > 998) {
		const tmp = dataST.data[1]
		dataST.data[1] = dataST.data[998]
		dataST.data[998] = tmp
	}
	const perfStart = performance.now()
	dataST.data = dataST.data
	const perfEnd = performance.now()
	console.log("swapRows: ", perfEnd - perfStart)
}

const update = () => {
	for (let i = 0; i < dataST.data.length; i += 10) {
		const item = dataST.data[i]
		dataST.data[i].label += " !!!"
	}
	const perfStart = performance.now()
	dataST.data = dataST.data
	const perfEnd = performance.now()
	console.log("update: ", perfEnd - perfStart)
}

const buildData = count => {
	const data = []
	for (let i = 0; i < count; i++) {
		data.push({
			id: did++,
			label: `${adjectives[_random(adjectives.length)]} ${colors[_random(colors.length)]} ${nouns[_random(nouns.length)]}`,
			selected: false,
		})
	}
	return data
}

const _random = max => {
	return Math.round(Math.random() * 1000) % max
}

const app = div(
	div(
		div(
			div(
				h1("jQuire - jQuery Ui Reciter")
			),
			div(
				attr.class("btn-group"),
				div(
					button(
						attr({ type: "button", id: "run" }),
						on.click(run),
						"Create 1,000 rows"
					)
				),
				div(
					button(
						attr({ type: "button", id: "runlots" }),
						on.click(runLots),
						"Create 10,000 rows"
					)
				),
				div(
					button(
						attr({ type: "button", id: "add" }),
						on.click(add),
						"Append 1,000 rows"
					)
				),
				div(
					button(
						attr({ type: "button", id: "update" }),
						on.click(update),
						"Update every 10th row"
					)
				),
				div(
					button(
						attr({ type: "button", id: "clear" }),
						on.click(clear),
						"Clear"
					)
				),
				div(
					button(
						attr({ type: "button", id: "swaprows" }),
						on.click(swapRows),
						"Swap Rows"
					)
				)
			)
		)
	),

	table(
		on.click(interact),
		attr.class("table table-hover table-striped test-data"),
		tbody(
			(_ = watch(dataST)) => ([item] = each(dataST.data)) =>
				tr(
					attr({ id: item.id, class: item.selected ? "selected" : "" }),
					td(
						attr.class("col-md-1"),
						item.id
					),
					td(
						attr.class("col-md-4"),
						a(item.label)
					),
					td(
						attr.data_interaction("delete"),
						attr.class("col-md-1"),
						a(
							attr.aria_hidden("true"),
							span("❌")
						)
					),
					td(attr.class("col-md-6"))
				)
		)
	),

	span(
		attr.class("preloadicon glyphicon glyphicon-remove"),
		attr.aria_hidden("true")
	)
)

app.attachTo(document.body)