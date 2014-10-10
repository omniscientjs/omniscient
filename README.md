Omniescent
=========

A library providing an abstraction for React components similar to that of Quiescent for clojurescript. Except, sometimes you need state! Omniescent pairs the simplicity of Quiescent with the cursors of Om, for js, using Immutable.js.

```js
var component = require('omniescent'),
    React     = require('react');

var Heading = component(function (value) {
  return React.DOM.text({}, value.text);
});

$ = document.querySelector.bind(document);
React.renderComponent(
  Heading({ text: 'some text' }),
  $('.app'));
```

### Reuse mixins

Omniescent encourages reuse of your existing react mixins.

```js
var SelectOnRender = {
  componentDidMount: function () {
    this.getDOMNode().select();
  }
};

var FocusingInput = component(SelectOnRender, function (cursor, statics) {
  var onChange = statics.onChange || function () {};
  return d.input({ value: cursor.get('text'), onChange: onChange });
});
```

