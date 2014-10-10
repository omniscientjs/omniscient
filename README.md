Omniscient
=========

A library providing an abstraction for React components similar to that of Quiescent for clojurescript. Except, sometimes you need state! Omniscient pairs the simplicity of Quiescent with the cursors of Om, for js, using Immutable.js.

```js
var component = require('omniscient'),
    React     = require('react'),
    immstruct = require('immstruct');

var Heading = component(function (cursor) {
  return React.DOM.text({}, cursor.get('text'));
});

var data = immstruct({ text: 'some text' });

$ = document.querySelector.bind(document);
React.renderComponent(
  Heading(data.cursor()), $('.app'));
```

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





