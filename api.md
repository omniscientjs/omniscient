
### `omniscient([displayName], [mixins], render)`

Create componets for functional views.

The API of Omniscient is pretty simple, you create a component
with a render function, and mixins if you need them. When using
the created component, you can pass a cursor or an object as data
to the component. If you simply pass a cursor, the cursor will be
accessible on the props.cursor accessor. This data will be accessible
in the render function of the component (as props). In the passed data
object, if it’s within the statics property, the changes won’t get
tracker (see below).


### Parameters

| param           | type         | description                                                                                          |
| --------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `[displayName]` | String       | _optional:_ Component display name. Used in debug and by React                                       |
| `[mixins]`      | Array,Object | _optional:_ Mixins. Object literals with function, or array of object literals.                      |
| `render`        | Function     | Properties that do not trigger update when changed. Can be cursors, object and immutable structures  |


### Properties

| property                | type     | description                        |
| ----------------------- | -------- | ---------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate  |



**Returns** `Component`, 


### `omniscient.withDefaults([Options])`

Create a “local” instance of the Omniscient component creator by using the `.withDefaults` method.
This also allows you to override any defaults that Omniscient uses to check equality of objects,
unwrap cursors, etc. See below on section about defaults for what to override.

### Options
```js
{
  // Goes directly to component
  shouldComponentUpdate: function(nextProps, nextState), // check update
  jsx: false, // whether or not to default to jsx components
  cursorField: '__singleCursor', // cursor property name to "unwrap" before passing in to render (see note)

  // Is passed on to `shouldComponentUpdate`
  isCursor: function(cursor), // check if is props
  isEqualCursor: function (oneCursor, otherCursor), // check cursor
  isEqualState: function (currentState, nextState), // check state
  isImmutable: function (currentState, nextState), // check if object is immutable
  isEqualProps: function (currentProps, nextProps), // check props
  unCursor: function (cursor) // convert from cursor to object
}
```

### Examples
#### Always use JSX
```js
var component = require('omniscient');
var jsxComponent = component.withDefaults({
  jsx: true
});

var MyComponent = jsxComponent(function () {
  return Hello!
});
React.render(, document.body);
```

#### Un-wrapping curors
```jsx
var localComponent = component.withDefaults({
  cursorField: 'foobar'
});

var Component = component(function(myPassedCursor) {
  // Now you have myPassedCursor instead of having to do props.foobar
});

React.render(, document.body);
```


### Parameters

| param       | type   | description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `[Options]` | Object | _optional:_ Options with defaults to override  |


### Properties

| property                | type     | description                        |
| ----------------------- | -------- | ---------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate  |



**Returns** `Component`, 


### `omniscient.debug([pattern])`

Activate debugging for components. Will log when components renders, and
outcome of `shouldComponentUpdate` (and why).

### Example
```js
Search>: shouldComponentUpdate => true (cursors have changed)
Search>: render
SearchBox>: shouldComponentUpdate => true (cursors have changed)
SearchBox>: render
```


### Parameters

| param       | type   | description                                                         |
| ----------- | ------ | ------------------------------------------------------------------- |
| `[pattern]` | RegExp | _optional:_ Filter pattern. Do only show messages matching pattern  |


### Properties

| property | type   | description                   |
| -------- | ------ | ----------------------------- |
| `jsx`    | Object | Get component for use in JSX  |


### Example

```js
omniscient.debug(/Search/i); 
```


**Returns** `Immstruct`, 


### `Component([displayName], [props], [statics], [..rest])`

Invoke component (rendering it)


### Parameters

| param           | type   | description                                                                                                     |
| --------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `[displayName]` | String | _optional:_ Component display name. Used in debug and by React                                                  |
| `[props]`       | Object | _optional:_ Properties that **do** trigger update when changed. Can be cursors, object and immutable structures |
| `[statics]`     | Object | _optional:_ Properties that do not trigger update when changed. Can be cursors, object and immutable structures |
| `[..rest]`      | Object | _optional:_ Children of components (React elements, scalar values)                                              |


### Properties

| property | type   | description                   |
| -------- | ------ | ----------------------------- |
| `jsx`    | Object | Get component for use in JSX  |



**Returns** `ReactElement`, 


### `shouldComponentUpdate(nextProps, nextState)`

Directly fetch `shouldComponentUpdate` mixin to use outside of Omniscient.
You can do this if you don't want to use Omniscients syntactic sugar.


### Parameters

| param       | type   | description                                                           |
| ----------- | ------ | --------------------------------------------------------------------- |
| `nextProps` | Object | Next props. Can be objects of cursors, values or immutable structures |
| `nextState` | Object | Next state. Can be objects of values or immutable structures          |


### Properties

| property        | type     | description               |
| --------------- | -------- | ------------------------- |
| `isCursor`      | Function | Get default isCursor      |
| `isEqualState`  | Function | Get default isEqualState  |
| `isEqualProps`  | Function | Get default isEqualProps  |
| `isEqualCursor` | Function | Get default isEqualCursor |
| `isImmutable`   | Function | Get default isImmutable   |
| `debug`         | Function | Get default debug         |



**Returns** `Component`, 

## Private members 


### `isNode(propValue)`

Predicate showing whether or not argument value is a valid React Node
or not. Can be numbers, strings, bools, and React Elements.

React's isNode check from ReactPropTypes validator


### Parameters

| param       | type   | description                                     |
| ----------- | ------ | ----------------------------------------------- |
| `propValue` | String | Property value to check if is valid React Node  |



**Returns** `Boolean`, 


