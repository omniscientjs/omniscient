Omniscient [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![Gitter][gitter-image]][gitter-url]
=========

<img src="https://raw.githubusercontent.com/torgeir/omniscient/master/omniscient_logo.png" align="right" width="150px">
> A library providing an abstraction for React components that allows for fast top-down rendering embracing immutable data. Using cursors into immutable data structures, components can easily swap their own piece of data inside the larger immutable data structure. As data is immutable, re-rendering can be fast.

> Omniscient pairs the simplicity of [Quiescent](https://github.com/levand/quiescent) with
the cursors of [Om](https://github.com/swannodette/om), for js, using
[Immutable.js](https://github.com/facebook/immutable-js).

### Overview

- top-down rendering of components (one way data flow)
- favors immutable data (with Immutable.js)
- encourages small, composable components, and shared functionality through mixins
- components only deal with their own piece of data
- components can change their data, via cursors (without knowing where their data resides in the outer immutable data structure)
- easily listen for changes across your data structure and trigger re-render
- immutable data can give even faster re-renders than with pure React, as React can be prevented from even considering to re-render component trees with unchanged data
- efficient, centrally defined `shouldComponentUpdate`


A more detailed description of Omniscient's rationale can be found in the [documentation](http://omniscientjs.github.io/documentation). An introductory article can be found in the [wiki](https://github.com/omniscientjs/omniscient/wiki/Simpler-UI-Reasoning-with-Unidirectional-Dataflow-and-Immutable-Data).

**Note:** Omniscient pre `v2.0.0` is for React pre `v0.12.0`. React `v0.12.0` had [breaking changes](https://github.com/facebook/react/blob/master/CHANGELOG.md#breaking-changes), and the API of Omniscient
had to change accordingly. See the [v1.3.1 tag](https://github.com/omniscientjs/omniscient/tree/v1.3.1) for Omniscient with React `v0.11.0` support.

### Cursors

With cursors, components can have the outer immutable structure swapped when a component's data is changed. A re-render can be triggered, but only component trees referencing data affected by the change will actually be re-rendered. This means that if you don't pass any data (cursor or non-cursor property) to a component, this component won't be re-rendered. This could affect shallow parent components. Such a component could have a [`shouldComponentUpdate` that always return true](https://github.com/omniscientjs/omniscient#overriding-iscursor-and-isequalcursor). This will make the component always re-render.

If you pass in a single cursor, this is added to the `props.cursor` property, where `props` is what you get passed to your component.

```js
var React     = require('react'),
    immstruct = require('immstruct'),
    component = require('omniscient');

var NameInput = component(function (props) {
  var onChange = function (e) {
    props.cursor.update('name', function (name) {
      return e.currentTarget.value;
    });
  };
  return React.DOM.input({ value: props.cursor.get('name'), onChange: onChange });
});

var Welcome = component(function (props) {
  var guest = props.cursor.get('guest');
  var name = guest.get('name') ? ", " + guest.get('name') : "";
  return React.DOM.p({}, props.cursor.get('greeting'), name, "!",
                         NameInput(guest));
});

var structure = immstruct({ greeting: 'Welcome', guest: { name: '' } });

function render () {
  React.render(
    Welcome(structure.cursor()),
    document.querySelector('.app'));
}

render();
structure.on('swap', render);
```
*See [the running demo](http://omniscientjs.github.io/examples/#intro) on the examples page*

[`immstruct`](https://github.com/omniscientjs/immstruct) is a simple wrapper for [`Immutable.js`](https://github.com/facebook/immutable-js) that ease triggering re-renders with Omniscient when the immutable data structure is replaced. `immstruct` is not a requirement for Omniscient, but makes a great fit.

If you are running the distributed file, not browserify, you have to use `omniscient` instead of `component` in all examples.

### Reuseable mixins

Omniscient is fully compatible with exising react components, and encourages reuse of your existing mixins.

```js
var SelectOnRender = {
  componentDidMount: function () {
    this.getDOMNode().select();
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

### Statics

When you need to provide other data for your component than what its rendering is based off of, you pass statics. By default, changing a static's value does not result in a re-rendering of a component.

Statics have a special place in your passed properties. To give a component statics, you need to pass an object literal with the `statics` property defined.

```js
var log = console.log.bind(console);

var FocusingInput = component(SelectOnRender, function (props, statics) {
  var onChange = statics.onChange || function () {};
  return React.DOM.input({ value: props.cursor.get('text'), onChange: onChange });
});

var SomeForm = component(function (props.cursor) {
  return React.DOM.form({},
                        FocusingInput({ cursor: props.cursor, statics: { onChange: log } }));
});
```

#### Talking back from child to parent

Communicating information back to the parent component from a child component can be done by making an event emitter available as a static for your child component.

```js
var Item = component(function (props, statics) {
  var onClick = function () {
    statics.channel.emit('data', props.cursor);
  };
  return React.DOM.li({ onClick: onClick },
                      React.DOM.text({}, props.cursor.get('text')));
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

var List = component(function (props) {
  return React.DOM.ul({},
                      props.cursor.toArray().map(function (item) {
                        return Item({ cursor: item, statics: { channel: events } });
                      });
});
```

### Local State

Omniscient allows for component local state. That is, all the usual react component methods are available on `this` for use through mixins. You are free to `this.setState({ .. })` for component local view state.

### Omniscient and JSX

Due to the way React works with elements, and the way JSX is compiled, the use of Omniscient with JSX slightly differs from the normal use case. Instead of referencing a component directly, you will have to reference its `jsx` property, that exposes the component's underlying React class:


```js
var React     = require('react'),
    component = require('omniscient');

var Welcome = component(function (props, statics) {
  console.log(statics.foo); //=> 'bar'

  return (
    <h1>Hello, {props.cursor.deref()}</h1>
  );
});

var structure = immstruct({ name: 'Doc' });

function render () {
  var someStatics = { foo: 'bar' };

  // Note the `.jsx` extension
  React.render(
    <Welcome.jsx name={structure.cursor('name')} statics={someStatics} />
    document.body);
}

render();
structure.on('swap', render);

structure.cursor('name').update(function () {
  return 'Doctor';
});
```

You can also do `.jsx` on a component level:

```js
var Welcome = component(function (props, statics) {
  /* same implementation */
}).jsx;
```

Or, when requiring the component:

```js
var Welcome = require('./welcome').jsx;
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

### Efficient shouldComponentUpdate

Omniscient provides an [efficient default](https://github.com/omniscientjs/omniscient/blob/master/component.js) `shouldComponentUpdate` that works well with the immutable data structures of Immutable.js.

#### Overriding shouldCompontentUpdate

However, an individual component's `shouldComponentUpdate` can easily be changed through the use of mixins:

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

If you want to override `shouldCompontentUpdate` across your entire project, you can do this by setting the `shouldCompontentUpdate` method from Omniscient.

```js
component.shouldComponentUpdate = function (newProps, newState) {
  // your custom implementation
  return true; // don't do do this
};

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
var component = require('omniscient');

component.isCursor = function (potentialCursor) {
  return potentialCursor instanceof MyCustomCursor;
};
```

`isEqualCursor` should return true if two provided cursors are equal.

```js
var component = require('omniscient');

component.isEqualCursor = function (oldCursor, newCursor) {
  return oldCursor.unwrap() === newCursor.unwrap();
};
```

### Immstruct

Immstruct is not a requirement for Omniscient, and you are free to choose any other cursor implementation, or you can use Immutable.js directly.

If you are using something other than the cursors from Immutable.js, however, make sure to provide a custom implementation of `shouldComponentUpdate` for efficient rendering.

See [how to use immstruct](https://github.com/omniscientjs/immstruct/blob/master/README.md) for more information.

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

- [TodoMVC - Omniscient](https://github.com/jcranendonk/todomvc-omniscient/) by [jeroencranendonk-wf](https://github.com/jeroencranendonk-wf)

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
