Omniscient [![NPM version][npm-image]][npm-url] [![Dependency Status][depstat-image]][depstat-url]
=========

<img src="https://raw.githubusercontent.com/torgeir/omniscient/master/omniscient_logo.png" align="right" width="150px">
> A library providing an abstraction for React components for passing the same
data structure through the entire component flow using cursors and immutable
data structures. Similar to that of [Quiescent](https://github.com/levand/quiescent) for clojurescript. Except, Omniscient allows for component local state.

> Omniscient pairs the simplicity of [Quiescent](https://github.com/levand/quiescent) with
the cursors of [Om](https://github.com/swannodette/om), for js, using
[Immutable.js](https://github.com/facebook/immutable-js).

```js
var component = require('omniscient'),
    React     = require('react'),
    immstruct = require('immstruct');

var Heading = component(function (cursor) {
  return React.DOM.text({}, cursor.get('text'));
});

var structure = immstruct({ text: 'some text' });

$ = document.querySelector.bind(document);
function render () {
  React.renderComponent(Heading(structure.cursor()), $('.app'));
}

// Render and re-render on new immutable structure
render();
structure.on('render', render);
```

[`immstruct`](https://github.com/mikaelbr/immstruct) is a simple wrapper for [`Immutable.js`](https://github.com/facebook/immutable-js) that ease handling re-render when an immutable data structure is replaced through the use of cursors. `immstruct` is not a requirement for Omniscient, but makes a great fit.

### Reuseable mixins

Omniscient is fully compatible with exising react components, and encourages reuse of your existing mixins.

```js
var SelectOnRender = {
  componentDidMount: function () {
    this.getDOMNode().select();
  }
};

var FocusingInput = component(SelectOnRender, function (cursor, statics) {
  var onChange = statics.onChange || function () {};
  return React.DOM.input({ value: cursor.get('text'), onChange: onChange });
});
```

You can also share other commonly used functions through mixins.

```js
var Props = {
  setProps: function (props) {
    this.props.cursor.update(function (state) {
      return state.mergeDeep(props);
    };
  }
};

var SaveOnEdit = {
  onEdit: function (e) {
    this.setProps({ text: e.currentTarget.value });
  }
};

var SavingFocusingInput = component([Props, SaveOnEdit, SelectOnRender], function (cursor, statics) {
  return React.DOM.input({ value: cursor.get('text'), onChange: onEdit });
});
```

### Statics

When you need to provide other data for your component that what its rendering is based off of, you pass statics, just like with Quiescent. By default, changing a static's value does not result in a re-rendering of a component.

Statics can be passed as second argument to your component.

#### Talking back from child to parent

As an example, communicating information back to the parent component from a child component can be done by making an event emitter available as a static for your child component.

```js
var Item = component(function (cursor, statics) {
  var onClick = function () {
    statics.events.emit('data', cursor);
  };
  return React.DOM.li({ onClick: onClick }, React.DOM.text({}, cursor.get('text')));
});

var events = new EventEmitter();
events.on('data', function (item) {
  console.log('Hello from', item);
});

var List = component(function (cursor) {
  return React.DOM.ul({}, cursor.toArray().map(function (item) {
    return Item(item, { events: events });
  });
});
```

### State

Unlike Quiescent, Omniscient allows for component local state. That is, all the usual react component methods are available on `this` for use through mixins. You are free to `this.setState({ .. })` for component local view state.

#### Sharing state between parent and child

Some times you need to share state between a parent and child component. A special kind of [`static`](#statics) called `shared` can hold this sort of information.

*Unlike all other statics, changing a `shared` static will cause the view to re-render*.

```js
var Item = component(function (cursor, statics) {
  // re-renders when `statics.shared.fromParent` changes
  if (statics.shared.fromParent) {
    return React.DOM.text({}, cursor.get('text'));
  }
  return React.DOM.li({ onClick: onClick }, React.DOM.text({}, cursor.get('text')));
});

var List = component(function (cursor) {
  return React.DOM.ul({}, cursor.toArray().map(function (itemCursor) {
    return Item(itemCursor, {
      shared: { fromParent: cursor.get('valueFromParent') }
    });
  });
});
```

### Providing component keys

For correct merging of states and components between render cycles, React needs a `key` as part of the props of a component. With Omniscient, such a key can be passed as the first argument to the `component` function.

```js
var Item = component(function (cursor) {
  return React.DOM.li({}, React.DOM.text(cursor.get('text')));
});

var List = component(function (cursor) {
  return React.DOM.ul({}, cursor.toArray().map(function (item, key) {
    return Item(key, item);
  });
});
```

### Efficient shouldComponentUpdate

Omniscient provides an [efficient default](https://github.com/torgeir/omniscient/blob/master/component.js#L47-L64) `shouldComponentUpdate` that works well with the immutable data structures of Immutable.js.

#### Overriding shouldCompontentUpdate

However, an individual component's `shouldComponentUpdate` can easily be changed through the use of mixins:

```js
var ShouldComponentUpdateMixin = {
  shouldComponentUpdate: function (newProps, newState) {
    // your custom implementation
    return true; // don't do this
  };
};

var InefficientAlwaysRenderingText = component(ShouldComponentUpdateMixin, function (cursor) {
  return React.DOM.text(cursor.get('text'));
});
```

#### Overriding the default shouldCompontentUpdate globally

If you want to override `shouldCompontentUpdate` across your entire project, you can do this by setting the `shouldCompontentUpdate` method from Omniscient.

```js
component.shouldComponentUpdate = function (newProps, newState) {
  // your custom implementation
  return true; // don't do do this
};

var AlwaysRenderingText = component(function (cursor) {
  return React.DOM.text(cursor.get('text'));
});
```

### Immstruct

Immstruct is not a requirement for Omniscient, and you are free to choose any other cursor implementation, or you can use Immutable.js directly.

If you are using something other than the cursors from Immutable.js, however, make sure to provide a custom implementation of `shouldComponentUpdate` for efficient rendering.

See [how to use immstruct](https://github.com/mikaelbr/immstruct/blob/master/README.md) for more information.

[npm-url]: https://npmjs.org/package/omniscient
[npm-image]: http://img.shields.io/npm/v/omniscient.svg?style=flat

[depstat-url]: https://gemnasium.com/torgeir/omniscient
[depstat-image]: http://img.shields.io/gemnasium/torgeir/omniscient.svg?style=flat

---

*Logo is composed by icons from [Iconmoon](http://www.icomoon.io)
and [Picol](http://picol.org). Licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)*
