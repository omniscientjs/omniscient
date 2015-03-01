Omniscient [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![Gitter][gitter-image]][gitter-url]
=========

> Do fast top-down rendering embracing immutable data and functional programming. With cursors into immutable data structures, components can easily swap their own piece of data inside the larger immutable data structure and only to render components that have changed their data layer.

> Omniscient pairs the simplicity of [Quiescent](https://github.com/levand/quiescent) with
the cursors of [Om](https://github.com/swannodette/om), for js, using
[Immutable.js](https://github.com/facebook/immutable-js).

### Rationale

 - Functional programming for UIs
 - top-down rendering of components (unidirectional data flow)
 - favours immutable data (with Immutable.js)
 - encourages small, composable components, and shared functionality through mixins
 - Seperation of concern. Components only deal with their own piece of data
 - components can only change their own data, via cursors (without knowing where their data resides in the outer immutable data structure)
 - easily listen for changes across your data structure and trigger re-render
 - immutable data can give even faster re-renders than with pure React, as React can be prevented from even considering to re-render component trees with unchanged data
 - efficient, centrally defined shouldComponentUpdate

Omniscient is all about making composable UIs in a functional manner. Having pure, referentially transparent components that gives a simpler static mental model, much like the static HTML - but bringing the views in a more powerful context in a programming language. Views will still be declarative and expressive, but without having to work with clunky and weird DSLs/template engines.

See more about Omniscient on it's [website](http://omniscientjs.github.io/), where you can also play around with it on the [playground](http://omniscientjs.github.io/playground/). If you find all of these concepts foreign, you can read this introductory article explaining many of the constructs: [Simpler UI Reasoning with Unidirectional Dataflow and Immutable Data](http://omniscientjs.github.io/guides/01-simpler-ui-reasoning-with-unidirectional/)


### Cursors

With cursors, components can have the outer immutable structure swapped when a component's data is changed. A re-render can be triggered, but only component trees referencing data affected by the change will actually be re-rendered. This means that if you don't pass any data (cursor or non-cursor property) to a component, this component won't be re-rendered. This could affect shallow parent components. Such a component could have a [`shouldComponentUpdate` that always return true](http://omniscientjs.github.io/api/01-omniscient-api-reference/#shouldcomponentupdatewithdefaultsoptions). This will make the component always re-render.


The example below is using non-JSX.
If you pass in a single cursor, this is added to the `props.cursor` property, where `props` is what you get passed to your component.

```js
var React     = require('react'),
    immstruct = require('immstruct'),
    component = require('omniscient');

var structure = immstruct({ guest: { name: 'omniscent' } });

// Composable component, gets passed a cursor
var Greet = component(function (guestCursor){
  return React.DOM.div({}, 'Hello from ' + guestCursor.get('name'));
});

function render () {
  // Render Greet component and pass on cursor.
  React.render(
    Greet(structure.cursor('guest')), document.body);
}

// Render on initial load
render();

// Will trigger when cursor on structure updates
structure.on('swap', render);

// Update cursor to correct typo
setTimeout(function () {
  structure.cursor('guest').set('name', 'Omniscient');
}, 1000);

```

*See [more demos in the playground](http://omniscientjs.github.io/playground/) on the homepage*

[`immstruct`](https://github.com/omniscientjs/immstruct) is a simple wrapper for [`Immutable.js`](https://github.com/facebook/immutable-js) that ease triggering re-renders with Omniscient when the immutable data structure is replaced. `immstruct` is not a requirement for Omniscient, but makes a great fit.

If you are running the distributed file, not browserify, you have to use `omniscient` instead of `component` in all examples.

#### Example with JSX
Omniscient also works with JSX, and really shines with latest ES2015 features. Here's the example
from before, with JSX and ES2015 features.

```jsx
// Same structure as before
var structure = immstruct({ guest: { name: 'omniscent' } });

// Now, as we pass in guestCursor as a property on props from
// JSX, we'll have to use destructuring to get cursor
var GreetComponent = component(({guestCursor}) =>
  <div>Hello from {guestCursor.get('name')}</div>);

// As we get a component not element from component, we need to get
// element to use with react. Access the element through `.jsx`
var Greet = GreetComponent.jsx;

function render () {
  // Render Greet component and pass on cursor.
  // Note: Now we pass on cursor on the property `guestCursor`
  React.render(
    <Greet guestCursor={structure.cursor('guest')} />,
    document.body);
  }
}

render();
// Will trigger when cursor on structure updates
structure.on('swap', render);

// Update cursor to correct typo
setTimeout(function () {
  structure.cursor('guest').set('name', 'Omniscient');
}, 1000);

```

Note: The `.jsx` will get an element which you can use with JSX. If you
use JSX all the way, you can make Omniscient always return JSX-elements:

```js
var component = require('omniscient').withDefaults({
  jsx: true
});

// Now, as we pass in guestCursor as a property on props from
// JSX, we'll have to use destructuring to get cursor
var Greet = component(({name}) => <div>Hello from {name}</div>);

React.render(<Greet name="Omniscient" />, document.body);
```

See more on overriding defaults in the [API Reference](http://omniscientjs.github.io/api/01-omniscient-api-reference/#omniscientwithdefaultsoptions)

### Reuseable mixins

Omniscient is fully compatible with existing react components, and encourages re-use of your existing mixins.

```js
var SelectOnRender = {
  componentDidMount: function () {
    React.findDOMNode(this).select();
  }
};

var FocusingInput = component(SelectOnRender, function (props) {
  return React.DOM.input({ value: props.cursor.get('text') });
});
```

You can also share other commonly used functions through mixins.

```js
var Props = {
  swapProps: function (props) {
    this.props.cursor.update(function (state) {
      return state.mergeDeep(props);
    };
  }
};

var SaveOnEdit = {
  onEdit: function (e) {
    this.swapProps({ text: e.currentTarget.value });
  }
};

var SavingFocusingInput = component([Props, SaveOnEdit, SelectOnRender],
  function (props) {
    return React.DOM.input({ value: props.cursor.get('text'), onChange: this.onEdit });
  });
```

#### Talking back from child to parent

Communicating information back to the parent component from a child component can be done by
passing down constructs as EventEmitters or simply event handler functions. These can
be passed down as a part of a field called statics. **Statics won't trigger a re-render**,
so you cannot pass data or functions that will alter the output. This will break the
component transparency and is thought of as an anti-pattern.

You can also pass more advanced constructs as CSP channels or FRP streams as a part
of statics.

```js
var Item = component(function (cursor, statics) {
  var onClick = function () {
    statics.channel.emit('data', cursor);
  };
  return React.DOM.li({ onClick: onClick },
                      React.DOM.text({}, cursor.get('text')));
});


// In some other file
var events = new EventEmitter();
var mixins = {
  componentDidMount: function () {
    events.on('data', function (item) {
      console.log('Hello from', item);
      // use self.props.cursor if needed (self = bound this)
    });
  }
}

var List = component(function (cursor) {
  return React.DOM.ul({},
                      cursor.map(function (item) {
                        // pass on item cursor and statics as second arg
                        return Item(item, { channel: events });
                      }).toArray();
});
```

### Local State

Omniscient allows for component local state. That is, all the usual react component methods are available on `this` for use through mixins. You are free to `this.setState({ .. })` for component local view state, but it is highly encouraged to avoid using local state where this is possible. Local state breaks component transparency and predictability.


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

### Efficient `shouldComponentUpdate`

Omniscient works by implementing a `shouldComponentUpdate` mixin optimized for usage with immutable cursors and immutable structures. You can also use `shouldComponentUpdate` without the syntactic sugar that Omniscient brings.

```js
var shouldComponentUpdateMixin = {
  shouldComponentUpdate: require('omniscient/shouldupdate')
};

var ReactComponent = React.createClass({
  mixins: [shouldComponentUpdateMixin],
  render: function () {
    // Normal react usage
  }
})
```

This way you'd get to do smart top-down, unidirectional dataflow, with vanilla React as well.

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

#### Overriding the default shouldCompontentUpdate globally

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

### Using Different Cursors than Immutable.js

[Immutable.js](https://github.com/facebook/immutable-js) is used as an optional dependency per default
as the cursor-check used in the provided `shouldCompontentUpdate` takes for granted that the cursors
are Immutable.js cursors. You can easily override this by overriding two methods provided
by Omniscient; `isCursor` and `isEqualCursor`.

#### Overriding `isCursor` and `isEqualCursor`

`isCursor` should return true if provided object is of cursor type.

```js
var omniscient = require('omniscient');
var component = omniscient.withDefaults({
  isCursor: function (potentialCursor) {
    return potentialCursor instanceof MyCustomCursor;
  },
  isEqualCursor: function (oldCursor, newCursor) {
    return oldCursor.unwrap() === newCursor.unwrap();
  }
});
```

`isEqualCursor` should return true if two provided cursors are equal.
`isCursor` should return true if provided potential is a cursor.

See more on overriding defaults in the [API Reference](http://omniscientjs.github.io/api/01-omniscient-api-reference/#omniscientwithdefaultsoptions)

### Immstruct

Immstruct is not a requirement for Omniscient, and you are free to choose any other cursor implementation, or you can use Immutable.js directly.

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

## Omniscient in the wild

- [TodoMVC - Omniscient](https://github.com/jcranendonk/todomvc-omniscient/) by [jcranendonk](https://github.com/jcranendonk)

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/omniscient
[npm-image]: http://img.shields.io/npm/v/omniscient.svg?style=flat

[travis-url]: http://travis-ci.org/omniscientjs/omniscient
[travis-image]: http://img.shields.io/travis/omniscientjs/omniscient.svg?style=flat

[depstat-url]: https://gemnasium.com/omniscientjs/omniscient
[depstat-image]: http://img.shields.io/gemnasium/omniscientjs/omniscient.svg?style=flat

[gitter-url]: https://gitter.im/omniscientjs/omniscient?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg

*Logo is composed by icons from [Iconmoon](http://www.icomoon.io)
and [Picol](http://picol.org). Licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)*
