
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

| param         | type         | description                                                                                          |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `displayName` | String       | Component's display name. Used when debug()'ing and by React                                         |
| `mixins`      | Array,Object | React mixins. Object literals with functions, or array of object literals with functions.            |
| `render`      | Function     | Properties that do not trigger update when changed. Can be cursors, object and immutable structures  |


### Properties

| property                | type     | description                        |
| ----------------------- | -------- | ---------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate  |



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
  isNode: function(propValue), // determines if propValue is a valid React node

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

| param     | type   | description                        |
| --------- | ------ | ---------------------------------- |
| `Options` | Object | Options with defaults to override  |


### Properties

| property                | type     | description                        |
| ----------------------- | -------- | ---------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate  |



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

| param     | type   | description                                          |
| --------- | ------ | ---------------------------------------------------- |
| `pattern` | RegExp | Filter pattern. Only show messages matching pattern  |


### Properties

| property | type   | description                   |
| -------- | ------ | ----------------------------- |
| `jsx`    | Object | Get component for use in JSX  |


### Example

```js
omniscient.debug(/Search/i); 
```


**Returns** `Immstruct`, 


### `Component(displayName, props, statics, ..rest)`

Invoke component (rendering it)


### Parameters

| param         | type   | description                                                                                          |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `displayName` | String | Component display name. Used in debug and by React                                                   |
| `props`       | Object | Properties that **do** trigger update when changed. Can be cursors, object and immutable structures  |
| `statics`     | Object | Properties that do not trigger update when changed. Can be cursors, object and immutable structuress |
| `..rest`      | Object | Child components (React elements, scalar values)                                                     |


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


### `shouldComponentUpdate.withDefaults([Options])`

Create a “local” instance of the shouldComponentUpdate with overriden defaults.

### Options
```js
{
  isCursor: function(cursor), // check if is props
  isEqualCursor: function (oneCursor, otherCursor), // check cursor
  isEqualState: function (currentState, nextState), // check state
  isImmutable: function (currentState, nextState), // check if object is immutable
  isEqualProps: function (currentProps, nextProps), // check props
  unCursor: function (cursor) // convert from cursor to object
}
```


### Parameters

| param       | type   | description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `[Options]` | Object | _optional:_ Options with defaults to override  |



**Returns** `Function`, shouldComponentUpdate with overriden defaults


### `shouldComponentUpdate.isEqualState(value, other)`

Predicate to check if state is equal. Checks in the tree for immutable structures
and if it is, check by reference. Does not support cursors.

Override through `shouldComponentUpdate.withDefaults`.


### Parameters

| param   | type   | description |
| ------- | ------ | ----------- |
| `value` | Object |             |
| `other` | Object |             |



**Returns** `Boolean`, 


### `shouldComponentUpdate.isEqualProps(value, other)`

Predicate to check if props are equal. Checks in the tree for cursors and immutable structures
and if it is, check by reference.

Override through `shouldComponentUpdate.withDefaults`.


### Parameters

| param   | type   | description |
| ------- | ------ | ----------- |
| `value` | Object |             |
| `other` | Object |             |



**Returns** `Boolean`, 


### `shouldComponentUpdate.isEqualCursor(a, b)`

Predicate to check if cursors are equal through reference checks. Uses `unCursor`.
Override through `shouldComponentUpdate.withDefaults` to support different cursor
implementations.


### Parameters

| param | type   | description |
| ----- | ------ | ----------- |
| `a`   | Cursor |             |
| `b`   | Cursor |             |



**Returns** `Boolean`, 


### `shouldComponentUpdate.isImmutable(value)`

Predicate to check if a potential is an immutable structure or not.
Override through `shouldComponentUpdate.withDefaults` to support different cursor
implementations.


### Parameters

| param   | type           | description                   |
| ------- | -------------- | ----------------------------- |
| `value` | maybeImmutable | to check if it is immutable.  |



**Returns** `Boolean`, 


### `shouldComponentUpdate.unCursor(cursor)`

Transforming function to take in cursor and return a non-cursor.
Override through `shouldComponentUpdate.withDefaults` to support different cursor
implementations.


### Parameters

| param    | type   | description   |
| -------- | ------ | ------------- |
| `cursor` | cursor | to transform  |



**Returns** `Object,Number,String,Boolean`, 


### `shouldComponentUpdate.isCursor(potential)`

Predicate to check if `potential` is Immutable cursor or not (defaults to duck testing
Immutable.js cursors). Can override through `.withDefaults()`.


### Parameters

| param       | type      | description            |
| ----------- | --------- | ---------------------- |
| `potential` | potential | to check if is cursor  |



**Returns** `Boolean`, 


### `cached(Function)`

Directly fetch `cache` to use outside of Omniscient.
You can do this if you want to define functions that caches computed
result to avoid recomputing if invoked with equal arguments as last time.

Returns optimized version of given `f` function for repeated
calls with an equal inputs. Returned function caches last input
and a result of the computation for it, which is handy for
optimizing `render` when computations are run on unchanged parts
of state. Although note that only last result is cached so it is
not practical to call it mulitple times with in the same `render`
call.


### Parameters

| param      | type     | description               |
| ---------- | -------- | ------------------------- |
| `Function` | Function | that does a computation.  |



**Returns** `Function`, Optimized function


### `cached.withDefaults([Options])`

Create a “local” instance of the `cache` with overriden defaults.

### Options
```js
{
  isEqualProps: function (currentProps, nextProps), // check props
}
```


### Parameters

| param       | type   | description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `[Options]` | Object | _optional:_ Options with defaults to override  |



**Returns** `Function`, cached with overriden defaults

## Private members 


### `isNode(propValue)`

Predicate showing whether or not the argument is a valid React Node
or not. Can be numbers, strings, bools, and React Elements.

React's isNode check from ReactPropTypes validator
but adjusted to not accept objects to avoid collision with props & statics.


### Parameters

| param       | type   | description                                     |
| ----------- | ------ | ----------------------------------------------- |
| `propValue` | String | Property value to check if is valid React Node  |



**Returns** `Boolean`, 


