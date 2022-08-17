# jQuire
jQuery UI Reciter

> This is not a serious project. It's just me fooling around with JavaScript.
> Do not recommend using this for any kind of work.

### Imports
```javascript
import { $, _, _self, _parent, _parents } from "./index.js"
```

### Create a component
```javascript
// define your component
const HelloWorld = $.new[
    _.world = "World", // attribute of your component works kind of like props in react
    $.slot[_.name="main"],
    $.text["Hello " + _self.world]
]

$.add({ HelloWorld }) // register this as a new component
```

### Rendering Content
```javascript
$.render[
    _.tag = document.body, // the tag in which to render contents; JQuery also works!! $("body").get(0)
    $.div[
        _.Mark = 120, // props are case insensitive for now :(
        $.HelloWorld[
            _.world = "earth",
            $.div[
                _.slot = "main", // slots don't work yet
                _.onclick = evt => console.log(_parents(this).mark),
                $.text["🎉"+_parents(this).mark] // this creates an HTML TextNode
            ]
        ]
    ],
    $.form[
        _.name = "my-form",
        _.onsubmit = evt => {
            evt.preventDefault()
            console.log("submitted")
        },
        $.input[_.type = "text"],
        $.button[
            _.type = "submit",
            $.text["submit"]
        ]
    ]
]
```

### HTML Attributes vs Data Attributes
```javascript
_.type = "text" // regular html attributes are lowercase
_.Type = "text" // this is the same as data-type="text" in html and is called a data attribute
_.sayGreetings = "hi" // this is also a data attribute; in html markup it would be data-say-greetings
```
> All the attributes inside of a component are treated as data attributes regardless of the case.

### Data Accessors
There are three types of data access proxy objects:

1. _self - access a data attribute on the current element
2. _parent - access a data attribute on the immediate parent element
3. _parents - access a data attribute on any one of the parent elements, including itself

```javascript
$.div[
    _.grandParentName = "Janice Doe"
    $.div[
        _.parentName = "Jane Doe"
        $.span[
            _.Name = "John Doe",
            $.text["Hi" + _self.name], // same as this.name
            _.onclick = evt => console.log(_self(this).name) // _self ond other data access proxies need a context when called inside of a function.
        ],
        $.br[_], // if an element has no attributes or children just put an underscore, otherwise it causes a JavaScript syntax error :(
        $.span[
            $.text["Your parent is " + _parent.parentName], $.br[_]
            $.text["Your grandparent is " + _parents.grandParentName]
        ]
    ]
]
```
