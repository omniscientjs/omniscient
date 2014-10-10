Omniscient [![NPM version][npm-image]][npm-url] [![Dependency Status][depstat-image]][depstat-url]
=========

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
var ShouldComponentUpdateMixin = {
  shouldComponentUpdate: function () {
    return true;
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
  return true;
};

var AlwaysRenderingText = component(ShouldComponentUpdateMixin, function (cursor) {
  return React.DOM.text(cursor.get('text'));
});
```


[npm-url]: https://npmjs.org/package/omniscient
[npm-image]: http://img.shields.io/npm/v/omniscient.svg?style=flat

[depstat-url]: https://gemnasium.com/torgeir/omniscient
[depstat-image]: http://img.shields.io/gemnasium/torgeir/omniscient.svg?style=flat
