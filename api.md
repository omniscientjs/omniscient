
### `omniscient(displayName, mixins, render)`

Create components for functional views.

The API of Omniscient is pretty simple, you create a component
with a render function and the mixins you need. 

When using the created component, you can pass a cursor or an object
as data to it. This data will be the render function's first argument,
and it will also be available on `this.props`.

If you simply pass one cursor, the cursor will be accessible on the 
`props.cursor` accessor. Data placed on the property `statics` of the
component's arguments will not be tracked for changes.


### Parameters

| parameter     | type         | description                                                                                          |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `displayName` | String       | Component's display name. Used when debug()'ing and by React                                         |
| `mixins`      | Array,Object | React mixins. Object literals with functions, or array of object literals with functions.            |
| `render`      | Function     | Properties that do not trigger update when changed. Can be cursors, object and immutable structures  |



**Returns** `Component`, 


### `omniscient.withDefaults(Options)`

Create a “local” instance of the Omniscient component creator by using the `.withDefaults` method.
This also allows you to override any defaults that Omniscient use to check equality of objects,
unwrap cursors, etc.

### Options
```js
{
  // Goes directly to component
  shouldComponentUpdate: function(nextProps, nextState), // check update
  jsx: false, // whether or not to default to jsx components
  cursorField: '__singleCursor', // cursor property name to "unwrap" before passing in to render

  // Passed on to `shouldComponentUpdate`
  isCursor: function(cursor), // check if prop is cursor
  unCursor: function (cursor), // convert cursor to object
  isEqualCursor: function (oneCursor, otherCursor), // compares cursor
  isEqualState: function (currentState, nextState), // compares state
  isEqualProps: function (currentProps, nextProps), // compares props
  isImmutable: function (maybeImmutable) // check if object is immutable
}
```

### Examples
#### Always use JSX
```js
var component = require('omniscient');
var jsxComponent = component.withDefaults({
  jsx: true
});

var Greeting = jsxComponent(function () {
  return Hello!
});
React.render(, document.body);
```

#### Un-wrapping curors
```jsx
var localComponent = component.withDefaults({
  cursorField: 'foobar'
});

var Component = localComponent(function (myCursor) {
  // Now you have myCursor directly instead of having to do props.foobar
});

React.render(, document.body);
```


### Parameters

| parameter | type   | description                        |
| --------- | ------ | ---------------------------------- |
| `Options` | Object | Options with defaults to override  |



**Returns** `Component`, 


### `omniscient.debug(pattern)`

Activate debugging for components. Will log when a component renders, 
the outcome of `shouldComponentUpdate`, and why the component re-renders.

### Example
```js
Search>: shouldComponentUpdate => true (cursors have changed)
Search>: render
SearchBox>: shouldComponentUpdate => true (cursors have changed)
SearchBox>: render
```


### Parameters

| parameter | type   | description                                          |
| --------- | ------ | ---------------------------------------------------- |
| `pattern` | RegExp | Filter pattern. Only show messages matching pattern  |


### Example

```js
omniscient.debug(/Search/i); 
```


**Returns** `Immstruct`, 


### `Component(displayName, props, statics, ..rest)`

Invoke component (rendering it)


### Parameters

| parameter     | type   | description                                                                                          |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `displayName` | String | Component display name. Used in debug and by React                                                   |
| `props`       | Object | Properties that **do** trigger update when changed. Can be cursors, object and immutable structures  |
| `statics`     | Object | Properties that do not trigger update when changed. Can be cursors, object and immutable structuress |
| `..rest`      | Object | Child components (React elements, scalar values)                                                     |



**Returns** `ReactElement`, 


### `isNode(propValue)`

Predicate showing whether or not the argument is a valid React Node
or not. Can be numbers, strings, bools, and React Elements.

React's isNode check from ReactPropTypes validator


### Parameters

| parameter   | type   | description                                     |
| ----------- | ------ | ----------------------------------------------- |
| `propValue` | String | Property value to check if is valid React Node  |



**Returns** `Boolean`, 


### `shouldComponentUpdate(nextProps, nextState)`

Directly fetch `shouldComponentUpdate` mixin to use outside of Omniscient.
You can do this if you don't want to use Omniscients syntactic sugar.


### Parameters

| parameter   | type   | description                                                           |
| ----------- | ------ | --------------------------------------------------------------------- |
| `nextProps` | Object | Next props. Can be objects of cursors, values or immutable structures |
| `nextState` | Object | Next state. Can be objects of values or immutable structures          |



**Returns** `Component`, 


