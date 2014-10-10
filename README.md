Omniscient [![NPM version][npm-image]][npm-url] [![Dependency Status][depstat-image]][depstat-url]
=========

<img src="./omniscient_logo.svg" style="float: left; width: 70px; margin: 17px 10px;">
> A library providing an abstraction for React components similar to that of Quiescent for clojurescript. Except, sometimes you need state! Omniscient pairs the simplicity of Quiescent with the cursors of Om, for js, using Immutable.js.

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

// Render and render on new immutable structure
render();
structure.on('render', render);
```

[`immstruct`](https://github.com/mikaelbr/immstruct) is a simple
wrapper [`Immutable.js`](https://github.com/facebook/immutable-js)
for handling re-render when a immutable data structure is changed.
`immstruct` is not a requirement for Omniscient, but it makes
the usage much easier (see [how to use immstruct](https://github.com/mikaelbr/immstruct/blob/master/README.md)).
You can use any other cursors or you can use `Immutable.js` directly.


**Note:** If you are using something other than cursors from Immutable.js,
you should look into [implementing your own shouldComponentUpdate](#efficient-shouldcomponentupdate-easily-overridable).

### Reuseable Mixins

Omniscient encourages reuse of your existing react mixins.

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

var FocusingInput = component([Props, SaveOnEdit], function (cursor, statics) {
  return React.DOM.input({ value: cursor.get('text'), onChange: onEdit });
});
```

### Back-Talk from Child to Parent Through Statics

There are some use cases where you want to deligate responsibility to some
one else higher up (ancestors). This should be done by passing something
called `statics`. Statics are passed as second argument to a component.

Per default (except special-case `shared` static - see below), changing
a static value won't result in component updating (causing shouldCompontentUpdate
to return `true`).

By providing an event bus or event emitter as a static, you can provide
a way for children to talk to parents. See [example below](#shared-state-between-parent-and-child).

```js
var Item = component(function (cursor, statics) {
  var onClick = function () {
    statics.events.emit('data', cursor);
  };
  return React.DOM.li({ onClick: onClick }, React.DOM.text(cursor.get('text')));
});

var events = new EventEmitter();
events.on('data', function (itemCursor) {
  console.log('Hello from', itemCursor);
});

var List = component(function (cursor) {
  return React.DOM.ul({}, cursor.toArray().map(function (itemCursor) {
    return Item(itemCursor, { events: events });
  });
});
```

### Shared State Between Parent and Child

Some times you need to share a state from parent to child. This can be something
like toggling between editing-modes in a blog-post or simply a boolean flag.
There is a special kind of [`static`](#back-talk-from-child-to-parent-through-statics)
 called `shared`, that can hold this sort if information.

*Unlike [all other statics](#back-talk-from-child-to-parent-through-statics),
changing a shared static will cause the view to re-render*.

```js
var Item = component(function (cursor, statics) {
  // Will not re-render if statics.arbitraryData changes
  console.log(statics.arbitraryData); //=> "someData

  // Will re-render if `statics.shared.fromParent` changes
  if (statics.shared.fromParent) {
    return React.DOM.text(cursor.get('text'));
  }
  return React.DOM.li({ onClick: onClick }, React.DOM.text(cursor.get('text')));
});

var List = component(function (cursor) {
  return React.DOM.ul({}, cursor.toArray().map(function (itemCursor) {
    return Item(itemCursor, {
      shared: { fromParent: cursor.get('valueFromParent') },
      arbitraryData: 'someData'
    });
  });
});
```

### Providing Component Keys

For correct merging of states and components between render cycles, React needs a key as part of the props of a component. With Omniscient, such a key can be passed as the first argument to `component`.

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

### Efficient shouldComponentUpdate, easily overridable

Omniscient provides an efficient default `shouldComponentUpdate` that works well with immutable data structures, but can easily be changed through the use of mixins.

```js

// Override the default Omniscient shouldComponentUpdate
// by using a mixin.
var ShouldComponentUpdateMixin = {
  shouldComponentUpdate: function (newProps, newState) {
    // Your implementation here.

    return true; // Don't do this. It will re-render components every time
  };
};

var AlwaysRenderingText = component(ShouldComponentUpdateMixin, function (cursor) {
  return React.DOM.text(cursor.get('text'));
});
```

#### Override shouldCompontentUpdate globally

If you want to override `shouldCompontentUpdate` across your entire
project, you can do this by setting the `shouldCompontentUpdate` method
from Omniscient.

```js
component.shouldComponentUpdate = function (newProps, newState) {
  // Your implementation here.

  return true; // Don't do this. It will re-render components every time
};

var AlwaysRenderingText = component(ShouldComponentUpdateMixin, function (cursor) {
  return React.DOM.text(cursor.get('text'));
});
```


[npm-url]: https://npmjs.org/package/omniscient
[npm-image]: http://img.shields.io/npm/v/omniscient.svg?style=flat

[depstat-url]: https://gemnasium.com/torgeir/omniscient
[depstat-image]: http://img.shields.io/gemnasium/torgeir/omniscient.svg?style=flat


---

*Logo is composed by icons from [Iconmoon](http://www.icomoon.io)
and [Picol](http://picol.org). Licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)*
