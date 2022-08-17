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
const HelloWorld = $.new[
    _.world = "World",
    $.slot[_.name="main"],
    $.text["Hello " + _self.world]
]

$.add({ HelloWorld })
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
                $.text["🎉"+_parents(this).mark]
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

