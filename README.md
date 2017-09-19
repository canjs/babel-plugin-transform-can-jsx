# babel-plugin-transform-can-jsx

[![Build Status](https://travis-ci.org/canjs/babel-plugin-transform-can-jsx.svg?branch=master)](https://travis-ci.org/canjs/babel-plugin-transform-can-jsx)

Turns JSX into CanJS-observable hyperscript function calls

Proof-of-concept for tranpsiling JSX into CanJS-compatible Hyperscript

## on:event={ handler }

JSX like this

```html
<div on:click={ handler }>
```

will need to be transpiled to... something. In order to prove this can be done, transpile to

```html
<div onClick={ handler }>
```

for now.

## render({ foo, bar })

Depending on how arguments are passed to functions using JSX, different transpiling will need to happen.

If arguments are destructured, like

```js
render: function({ count }) {
    return <div>{count}</div>;
}
```

this will need to be transpiled to something potentially like

```js
render: (function() {
    var rend = function({ count }) {
        return h('div', null count);
    };

    return function() {
        return new Observation(() => {
            return rend.apply(this, arguments);
        });
    };
}())
```

which could be simplified to something like
```js
render: makeObservable(function({ count }) {
    return h('div', null, count);
})
```

so, to prove this is possible, transpile any functions using JSX and destructured arguments to be wrapped in a function call.

## <div>{count}</div>

Another alternative for making JSXExpressions like this to work is to wrap individual JSXExpressions with arrow functions (or regular function expressions). This way our hyperscript implementation can wrap them in observations before generating live.text.

This code:

```
const render = function({ count }) {
    return <div>{count}</div>;
};
```

could be transpiled to

```
return canJsx.h(
	"div",
	null,
	() => count
);
```
