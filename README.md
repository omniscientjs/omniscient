quiescent-for-js
================

A library providing an abstraction to React components similar to that of quiescent for clojurescript.

```js
var component = require('quiescent-for-js'),
    React = require('react');
    
var Heading = component(function (value) {
  return React.DOM.text({}, value.text);
});

$ = document.querySelector.bind(document);
React.renderComponent(
  Heading({ text: 'some text' }),
  $('.app'));
```
