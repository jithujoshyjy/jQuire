<p align="center"><img src="./docs/assets/logo.png" alt="jQuire Logo" width="200"/></p>

# jQuire
#### jQuery UI Reciter

[![](https://data.jsdelivr.com/v1/package/npm/jquire/badge)](https://www.jsdelivr.com/package/npm/jquire) [![](https://img.shields.io/reddit/user-karma/combined/Plus-Weakness-2624?style=social)](https://www.reddit.com/user/Plus-Weakness-2624/)

This project began as an experiment, stretching what's possible with JavaScript.
After a great deal of trouble, refactoring and a lot of sleepless nights, I think I've come up with something that I can be proud of!<br/>
I wouldn't advise it to be used in real applications but you're welcome to experiment with it and provide constructive criticism.<br/>
[website](https://jithujoshyjy.github.io/jQuire/)

### Installation and Imports

```bash
npm install jquire
```

you can also use a cdn if you like

```html
<!-- JQuery goes here if you're want to use it as well -->
<script type="module" src="https://cdn.jsdelivr.net/npm/jquire@latest/dist/jquire.min.js"></script>
```

after installation 👇

```javascript
import {
    natives, nodes, showIf,
    on, state, watch, each, pathSetter,
    getNodes, animate, css
} from "./node_modules/jquire/dist/jquire.min.js"
```

After you specify all the required imports you can either destructure each html element creator function from `natives` proxy object.

```javascript
const {
    div, input, button,
    form, dialog, img,
    main, nav, a, br, h1,
    footer, template, span
} = natives

const { attr, text, fragment } = nodes
```

Or, you can populate all the valid html element creators into the `globalThis` object and make them available in the global scope.

```javascript
    natives.globalize() 
```

### Create a component

```javascript
// define your component
const HelloWorld = () => fragment(
    h1("Hello, World!")
)

const app = div(
    HelloWorld(),
    "Again ", HelloWorld()
)

// component with props and children
const Foo = (...props) => {
    const { childNodes, attributes } = getNodes(props)
    return div(
        "====START====",
        ...attributes,
        ...childNodes,
        "=====END====="
    )
}
```

### Rendering Content

```javascript
app.attachTo(document.body) // attaches `app` to document's body
```

### Specifying Attributes

```javascript
input(
    attr.type("number"), // set a single attribute
    attr({ value: 0, max:  100 }), // set multiple attributes
    attr.required() // single attributes without value will default to the name of the attribute
)
```

## Styling Elements

All styles on block elements are scoped by default using ShadowRoot. You can even specify css rules in them.

### CSS Properties

```javascript
div(
    css.height("50px"),
    css({ backgroundColor: "lightblue" })
)
```

### Specifying styles for child elements

```javascript
div(
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
)
```

### Pseudo Classes, Pseudo Elements and CSS Rules

```javascript
button(
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
            borderColor: "cyan"
        })
    )
)
```

### Animating Elements

```javascript
div(
    animate({ height: "500px" })
)
```

### Handling Events

```javascript
button(
    "click me!",
    on.click(event => console.log("clicked!")),
	// using effect function
	(event = on("click")) => console.log("effecive click!")
)
```

### Creating elements from an Iterable

```javascript
const fruits = ["apple", "orange", "banana"]
const fruitEmojis = ['🍎', '🍊', '🍌']

ul(
    fruits.map((fruit, i) => `${fruit} - ${fruitEmojis[i]}`),
	// using effect function
	([fruit, i] = each(fruits)) => `${fruit} - ${fruitEmojis[i]}`
)
```

### Reactive Data and Element Reference

You can use the `state()` function to store reactive objects.
Then using the `watch()` effect function, update the elements to be in sync with the state object.

```javascript
const person = {
    name: "John",
    age: 26,
    profession: "Artist"
}

const personST = state({ person })
div(
    ([person] = watch(personST)) =>
		`John is ${person.age} years old!`, // will be refreshed for every state change
    button(
        "increment age",
        (_ = on("click")) => personST.age++
    )
)
```

### Conditional Rendering

You can choose to render or not to render certain elements based on a condition using `when()` effect function.

```javascript
const age = 50

div(
    (_ = when(age > 200)) => span("Invalid age: Greater than 200.")
)
```

### Custom Elements
jQuire supports HTML5 Custom Elements out of the box.You can use them like any other component and they are brought into scope using the `custom()` function.

```javascript
const MyButton = (label = '', theme = "normal") => {
	const primary = theme == "normal"
		? "lightgrey"
		: "danger"
			? "palevioletred"
			: "info"
				? "cornflowerblue"
				: "coral" // warning
	
	const accent = theme == normal
		? "darkgrey"
		: "danger"
			? "red"
			: "info"
				? "royalblue"
				: "orangered" // warning
	
	const style = {
		padding: "3px 5px",
		border: `1px solid ${accent}`,
		backgroundColor: primary,
		borderRadius: "5px"
	}

	// custom(tagName: a string in kebab-case, _extends: an optional HTMLElement)
	return custom("my-btn", HTMLButtonElement)(
		css(style),
		label
	)
}
```

You can also create custom elements by specifying them as properties of `custom()` function.

```javascript
const { HelloWorld } = custom
HelloWorld("hello world!")
```

> More ideas on the horizon...<br/>
> stay tuned for more
