<p align="center"><img src="./assets/logo.png" alt="jQuire Logo" width="200"/></p>

# jQuire
#### jQuery UI Reciter

This project began as an experiment, stretching what's possible with JavaScript.
After a great deal of trouble, refactoring and a lot of sleepless nights, I think I've come up with something that I can be proud of!<br/>
I wouldn't advise it to be used in real applications but you're welcome to experiment with it and provide constructive criticism.

> **❗Important**
> The cdn and npm repository haven't been updated after the overhaul of the library.

### Installation and Imports

```bash
npm install jquire
```

you can also use a cdn if you like

```html
<!-- JQuery goes here if you're want to use it as well -->
<script type="module" src="https://cdn.jsdelivr.net/gh/jithujoshyjy/jQuire/jquire.min.js"></script>
```

after installation 👇

```javascript
import {
    natives, nodes, showIf,
    on, ref, pathSetter,
    getNodes, animate, css
} from "./node_modules/jquire/jquire.min.js"
```

After you specify all the required imports you can either destructure each html element creator function from `natives` proxy object.

```javascript
const {
    div, input, button,
    form, dialog, img,
    main, nav, a, br, h1,
    footer, template, span
} = natives
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
    HelloWorld()
    "Again ", HelloWorld()
)

// component with props and children
const Foo = (...props) => {
    const { childNodes, attributes } = getNodes(props)
    return div(
        "====START====",
        ...attributes,
        ...childNodes
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
    })
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
    on.click(_ => console.log("clicked!"))
)
```

### Creating elements from an Iterable

```javascript
const fruits = ["apple", "orange", "banana"]
const fruitEmojis = ['🍎', '🍊', '🍌']

ul(
    fruits.map((fruit, i) => `${fruit} - ${fruitEmojis[i]}`)
)
```

### Reactive Data and Element Reference

You can use the `ref` function to store reactive objects and reference to html elements.
The `deref()` method of the JqReference object will give back the reference to the html elements.

```javascript
const person = {
    name: "John",
    age: 26,
    profession: "Artist"
}

const personRef = ref({ person })
div(
    personRef,
    ({ person }) => `John is ${person.age} years old!` // will be refreshed for every state change
    button(
        "increment age",
        on.click(_ => personRef.person.age++)
    )
)

console.log(personRef.deref()) // HTMLDivElement
```

You can also use the `JqReference.refresh` function to batch together updates for more efficiency.
It can especially be handy if you're push or popping elements from an array.

```javascript
button(
    "increment age",
    on.click(_ => personRef.refresh(() => person.age++))
)
```

### Conditional Rendering

You can choose to render or not to render certain elements based on a condition using `showIf` function.

```javascript
const age = 50

div(
    showIf(age > 200) && span("Invalid age: It cannot be greater than 200.")
)
```

> More ideas on the horizon...<br/>
> stay tuned for more
