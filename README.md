![Omniscient Logo](./omniscient-logo.png)

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url] [![Gitter][gitter-image]][gitter-url] [![Known Vulnerabilities](https://snyk.io/test/github/omniscientjs/omniscient/badge.svg)](https://snyk.io/test/github/omniscientjs/omniscient)

> Do fast top-down rendering embracing immutable data and functional programming.

> Omniscient pairs the simplicity of [Quiescent](https://github.com/levand/quiescent) with
the cursors of [Om](https://github.com/swannodette/om), for js, using
[Immutable.js](https://github.com/facebook/immutable-js).

### Rationale

 - Functional programming for UIs
 - Works as memoization for stateless React components
 - top-down rendering of components (unidirectional data flow)
 - favors immutable data (with Immutable.js)
 - encourages small, composable components, and shared functionality through mixins
 - natural separation of concern. Components only deal with their own piece of data
 - efficient, centrally defined shouldComponentUpdate

Omniscient is all about making composable UIs in a functional manner. Having pure, referentially transparent components that gives a simpler static mental model, much like the static HTML - but bringing the views in a more powerful context in a programming language. Views will still be declarative and expressive, but without having to work with clunky and weird DSLs or template engines.

Omniscient can work pretty much the same way as vanilla stateless function components in React (post 0.14), but with added optimizations through a smart predefined `shouldComponentUpdate`. This will work much the same way as memoization would for a Fibonacci function, allowing you to think functional programming in UI programming, but be able to do it with high speed and optimized re-rendering.

See more about Omniscient on it's [website](http://omniscientjs.github.io/), where you can also play around with it on the [playground](http://omniscientjs.github.io/playground/). If you find all of these concepts foreign, you can read this introductory article explaining many of the constructs: [Simpler UI Reasoning with Unidirectional Dataflow and Immutable Data](http://omniscientjs.github.io/guides/01-simpler-ui-reasoning-with-unidirectional/).

## Example Usage

Below you can see the same examples as shown on the [React homepage](http://facebook.github.io/react/), but using a more functional style programming. As with React examples, JSX is entirely optional, and the code reads almost just as good without it.

The examples below use syntax from the latest iteration of the Javascript language specification, ES2015. If you are unsure, you can see an overview in this blogpost: [ES2015 (ES6) Features Commonly Used with Functional Style React](http://open.bekk.no/es2015-es6-features-commonly-used-with-functional-style-react).

```js
var React = require('react');
var ReactDOM = require('react-dom');
var component = require('omniscient');

var HelloMessage = component(({name}) => <div>Hello {name}</div>);

ReactDOM.render(<HelloMessage name="John" />, document.querySelector('#app'));
```

In contrast, without JSX it would look something like:

```js
var {div} = React.DOM; // Extract the div convenience function from React

var HelloMessage = component(({name}) => div({}, `Hello ${name}`));
// Omniscient components are interoperable with JSX and non-JSX
ReactDOM.render(HelloMessage({ name: 'John' }), document.querySelector('#app'));
```

### Updating Output

Following the next React example of a "Stateful component", the below example is how you could do it to avoid having state, but instead pass the state as an input of the application.

```js
var stop;
var Timer = component({
  // Attaching life cycle methods
  componentDidMount: () => stop = createTicker(),
  componentWillUnmount: () => stop()
}, ({time}) => <div>Seconds Elapsed: {time}</div>);

function render (appState = { seconds: 0 }) {
  ReactDOM.render(<Timer time={appState.seconds} />, document.querySelector('#app'));
}
render();

function createTicker () {
  var seconds = 0;
  var interval = setInterval(() => render({ seconds: ++seconds }), 1000);
  return function stop() {
    clearInterval(interval);
  };
}
```

_See more on using life cycle methods below in the section ["Passing Life Cycle Methods or other Methods"](#passing-life-cycle-methods-or-other-methods)._

Following the Todo example on the [React homepage](http://facebook.github.io/react/), one approach, also stateless and functional, with Omniscient.js and immutable data could be as follows:

```js
// ...
var immutable = require('immutable');

// List of todo items as a stateless function
var TodoList = component(({items}) =>
  <ul>
    {items.map((itemText, i) =>
      <li key={i + itemText}>{itemText}</li>
    )}
  </ul>
);

// Todo App as a stateless function. Just a render function.
var TodoApp = component(({state}) => (
  <div>
    <h3>TODO</h3>
    <TodoList items={state.get('items')} />
    <form onSubmit={addItem}>
      <input onChange={changeText} value={state.get('text')} />
      <button>{'Add #' + (state.get('items').size + 1)}</button>
    </form>
  </div>
));

// Render and re-render loop
var mountNode = document.querySelector('#app');
function render (state) {
  ReactDOM.render(<TodoApp state={state} />, mountNode);
}

// Default initial structure as immutable data.
var structure = immutable.Map({
  items: immutable.List(),
  text: ''
});
// Render out initial application
render(structure);

// Actions. Ways to update the current state and trigger a re-render

function changeText (e) {
  structure = structure.set('text', e.target.value);

  // Re-render entire app
  render(structure);
}

function addItem (e) {
  e.preventDefault();
  structure = structure.update('items',
    (items) => items.concat(structure.get('text')));
  structure = structure.set('text', '');

  // Re-render entire app
  render(structure);
}
```

Note, in the examples above, we have to manually do re-rendering. This can be a tedious and usually not something you'd do. You can read more about automating this in the section ["Immutable Structure and Re-render Loop"](#immutable-structure-and-re-render-loop).

### Passing Life Cycle Methods or other Methods

In contrast to vanilla React stateless functions, Omniscient components can get passed life cycle methods when that is necessary. For instance, when you want to do some operations when the component is mounted.

```js
var FocusingInput = component({
  componentDidMount: function () {
    var input = this.refs.myInput;
    var inputValue = input.value;
    var inputRect = input.getBoundingClientRect();
    // ...
  }
}, function (props) {
  return React.DOM.input({ value: props.cursor.get('text'), ref: 'myInput' });
});
```

#### Talking back from child to parent

Some times you would like to talk back to parents by passing down some sort of helper function or helper constructions like EventEmitters. In these cases you don't want to trigger a re-render if any of the internal changes. You can wrap the provided `shouldComponentUpdate` and extend it to ignore given fields. The helper library [Omnipotent](https://github.com/omniscientjs/omnipotent) has an implementation of this: the `ignore` decorator:

```js
var Title = component('View', ({input, ignoreThis}) =>
  <h1>{input.deref()} vs. {ignoreThis.deref()}</h1>);

var IgnoredTitle = ignore('ignoreThis', Title);
```

### Providing component keys

For correct merging of states and components between render cycles, React needs a `key` as part of the props of a component. With Omniscient, such a key can be passed as the first argument to the `component` function.

```js
var Item = component(function (props) {
  return React.DOM.li({}, React.DOM.text(props.cursor.get('text')));
});

var List = component(function (props) {
  return React.DOM.ul({},
                      props.cursor.toArray().map(function (item, key) {
                        return Item(key, item);
                      });
});
```

#### Overriding shouldCompontentUpdate

You can also provide your own `shouldComponentUpdate` to Omniscient components. For instance
if you'd like to always re-render a component, no matter what the input is.

```js
var ShouldComponentUpdateMixin = {
  shouldComponentUpdate: function (newProps, newState) {
    // your custom implementation
    return true; // don't do this
  };
};

var InefficientAlwaysRenderingText = component(ShouldComponentUpdateMixin, function (props) {
  return React.DOM.text(props.cursor.get('text'));
});
```

##### Overriding globally

If you want to override `shouldCompontentUpdate` across multiple components, you can do this by creating a local component factory with setting the `shouldCompontentUpdate` defaults.

```js

var omniscient = require('omniscient');
var component = omniscient.withDefaults({
  shouldComponentUpdate: function (newProps, newState) {
    // your custom implementation
    return true; // don't do do this
  }
});

var InefficientAlwaysRenderingText = component(function (props) {
  return React.DOM.text(props.cursor.get('text'));
});
```

## Immutable Structure and Re-render Loop

Rendering a component tree is well and fine, but how to update? You can do this in several ways: either by using something like the very popular [Redux](https://github.com/rackt/redux) with immutable data using [Immutable.js](https://github.com/facebook/immutable-js), or you could use [Immstruct and cursors](https://github.com/omniscientjs/immstruct).

Cursors (similar to functional lenses) are shallow wrappers on top of immutable structures that allow you to listen for when an underlying structure is swapped out. That's it. A mechanism that allows you to subscribe for structural changes in your state. The power of cursors is that they are immutable them self. This means, checking if they point to a new value is very easy and very cheap. This shines when using it with the Omniscient.js default `shouldComponentUpdate`.

### Example using Cursors

```js
var React = require('react');
var ReactDOM = require('react-dom');
var component = require('omniscient');
var immstruct = require('immstruct');

// List of todo items as a stateless function
var TodoList = component(({items}) =>
  <ul>
    {items.map((itemText, i) =>
      <li key={i + itemText}>{itemText}</li>
    )}
  </ul>
);

// Todo App as a stateless function. Just a render function.
var TodoApp = component(({state}) => (
  <div>
    <h3>TODO</h3>
    <TodoList items={state.get('items')} />
    <form onSubmit={(e) => addItem(state, e)}>
      <input onChange={(e) => changeText(state, e)} value={state.get('text')} />
      <button>{'Add #' + (state.get('items').size + 1)}</button>
    </form>
  </div>
));

// Default initial structure as immutable data.
var structure = immstruct({
  items: [],
  text: ''
});

// Render and re-render loop
var mountNode = document.querySelector('#app');
function render (state) {
  // Passing a cursor to the state instead of the actual state it self
  ReactDOM.render(<TodoApp state={structure.cursor()} />, mountNode);
}


// Render out initial application
render();

// Listen for changes and rerender (render loop)
structure.on('swap', render);

// Actions. Ways to update the current state and trigger a re-render

function changeText (cursor, e) {
  cursor.set('text', e.target.value);
}

function addItem (stateCursor, e) {
  e.preventDefault();
  stateCursor.update(function (current) {
    current = current.update('items', (items) => items.concat(current.get('text')));
    return current.set('text', '');
  })
}
```

*See [more demos in the playground](http://omniscientjs.github.io/playground/) on the homepage*

### Immstruct

Immstruct is not a requirement for Omniscient, and you are free to choose any other cursor or state management implementation, or you can use Immutable.js directly.

If you are using something other than the cursors from Immutable.js, however, make sure to provide a custom implementation of `shouldComponentUpdate` for efficient rendering.

See [how to use immstruct](https://github.com/omniscientjs/immstruct/blob/master/README.md) for more information. Or the [API Reference](http://omniscientjs.github.io/api/02-immstruct-api-reference/).

### Debugging

For debugging purposes, Omniscient supports calling `component.debug([regexPattern])`. This enables logging on calls to `render` and `shouldComponentUpdate`.

When debugging, you should give your component names. This way the output will be better traceable,
and you can filter on components using regex.

```js
var MyComponent = component('MyComponent', function () {
  return React.DOM.text({}, 'I output logging information on .shouldComponentUpdate() and .render()');
});

React.render(MyComponent('my-key'), document.body);
```

#### Filtering Debugging

The `component.debug` method takes an optional argument: `pattern`. This should be a regex
used for matching a component name or key. This allows you to filter on both component and
instance of component:


```js
component.debug(/mycomponent/i);

// or by key:
component.debug(/my-key/);
```

Setting debug is a global change. If you want to be able to filter on multiple things and dig down
for finding errors, you can also use filtering in your browser inspector.

---

## Authors

- [Mikael Brevik](https://github.com/mikaelbr) ([@mikaelbrevik](https://twitter.com/mikaelbrevik))
- [Torgeir Thoresen](https://github.com/torgeir) ([@torgeir](https://twitter.com/torgeir))

## Examples

The [OmniscientJS github organization](https://github.com/omniscientjs) has a lot of example repos to get you started with different pieces of technology along with omniscient

- https://github.com/omniscientjs/omniscient-starter-pack
- https://github.com/omniscientjs/omniscient-react-native
- https://github.com/omniscientjs/omniscient-redux
- https://github.com/omniscientjs/omniscient-react-router
- https://github.com/omniscientjs/omniscient-immstruct-reference

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/omniscient
[npm-image]: http://img.shields.io/npm/v/omniscient.svg?style=flat-square

[travis-url]: http://travis-ci.org/omniscientjs/omniscient
[travis-image]: http://img.shields.io/travis/omniscientjs/omniscient.svg?style=flat-square

[coverage-url]: https://codecov.io/gh/omniscientjs/omniscient
[coverage-image]: https://img.shields.io/codecov/c/github/omniscientjs/omniscient.svg?style=flat-square

[gitter-url]: https://gitter.im/omniscientjs/omniscient?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square

*Logo created by the creative people at [Know Associates](http://knowassociates.com/)*
