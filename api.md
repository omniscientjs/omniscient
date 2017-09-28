
### `omniscient(displayName, mixins, render)`

Create components for functional views.

The API of Omniscient is pretty simple, you create a Stateless React Component
but memoized with a smart implemented `shouldComponentUpdate`.

The provided `shouldComponentUpdate` handles immutable data and cursors by default.
It also falls back to a deep value check if passed props isn't immutable structures.

You can use an Omniscient component in the same way you'd use a React Stateless Function,
or you can use some of the additional features, such as string defined display name and
pass in life cycle methods. These are features normally not accessible for vanilla
Stateless React Components.

If you simply pass one cursor, the cursor will be accessible on the
`props.cursor` accessor.

### Parameters

| param         | type         | description                                                                               |
| ------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `displayName` | String       | Component's display name. Used when debug()'ing and by React                              |
| `mixins`      | Array,Object | React mixins. Object literals with functions, or array of object literals with functions. |
| `render`      | Function     | Stateless component to add memoization on.                                                |


### Properties

| property                | type     | description                       |
| ----------------------- | -------- | --------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate |



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
  cursorField: '__singleCursor', // cursor property name to "unwrap" before passing in to render
  isNode: function(propValue), // determines if propValue is a valid React node
  classDecorator: function(Component), // Allows for decorating created class

  // Passed on to `shouldComponentUpdate`
  isCursor: function (cursor), // check if is props
  isEqualCursor: function (oneCursor, otherCursor), // check cursor
  isEqualImmutable: function (oneImmutableStructure, otherImmutableStructure), // check immutable structures
  isEqualState: function (currentState, nextState), // check state
  isImmutable: function (currentState, nextState), // check if object is immutable
  isEqualProps: function (currentProps, nextProps), // check props
  isIgnorable: function (propertyValue, propertyKey), // check if property item is ignorable
  unCursor: function (cursor) // convert from cursor to object
}
```

### Examples

#### Un-wrapping curors
```jsx
var localComponent = component.withDefaults({
  cursorField: 'foobar'
});

var Component = localComponent(function (myCursor) {
  // Now you have myCursor directly instead of having to do props.foobar
});

React.render(, mountingPoint);
```

#### Decorating class components
```jsx
// Some third party libraries requires you to decorate the
// React class, not the created component. You can do that
// by creating a decorated component factory
var decoratedComponent = component.withDefaults({
  classDecorator: compose(Radium, function (Component) {
    var DecoratedComponent = doSomething(Component);
    return DecoratedComponent;
  })
});

var Component = decoratedComponent(function (props) {
  // ... some implementation
});

React.render(, mountingPoint);
```

### Parameters

| param     | type   | description                       |
| --------- | ------ | --------------------------------- |
| `Options` | Object | Options with defaults to override |


### Properties

| property                | type     | description                       |
| ----------------------- | -------- | --------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate |



**Returns** `Component`, 


### `omniscient(classDecorator, [displayName], [mixins], [render])`

Create components for functional views, with an attached local class decorator.
Omniscient uses a `createClass()` internally to create an higher order
component to attach performance boost and add some syntactic sugar to your
components. Sometimes third party apps need to be added as decorator to this
internal class. For instance Redux or Radium.
This create factory behaves the same as normal Omniscient.js component
creation, but with the additional first parameter for class decorator.

The API of Omniscient is pretty simple, you create a Stateless React Component
but memoized with a smart implemented `shouldComponentUpdate`.

The provided `shouldComponentUpdate` handles immutable data and cursors by default.
It also falls back to a deep value check if passed props isn't immutable structures.

You can use an Omniscient component in the same way you'd use a React Stateless Function,
or you can use some of the additional features, such as string defined display name and
pass in life cycle methods. These are features normally not accessible for vanilla
Stateless React Components.

If you simply pass one cursor, the cursor will be accessible on the
`props.cursor` accessor.

#### Decorating class components
```jsx
// Some third party libraries requires you to decorate the
// React class, not the created component. You can do that
// by creating a decorated component factory
var someDecorator = compose(Radium, function (Component) {
  var DecoratedComponent = doSomething(Component);
  return DecoratedComponent;
});
var Component = component.classDecorator(someDecorator, function (props) {
  // ... some implementation
});

React.render(, mountingPoint);
```

Also works by creating a component factory:

```jsx
var someDecorator = compose(Radium, function (Component) {
  var DecoratedComponent = doSomething(Component);
  return DecoratedComponent;
});
var newFactory = component.classDecorator(someDecorator);
var Component = newFactory(function (props) {
  // ... some implementation
});

React.render(, mountingPoint);
```

### Parameters

| param            | type         | description                                                                                           |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `classDecorator` | Function     | Decorator to use for internal class (e.g. Redux connect, Radium)                                      |
| `[displayName]`  | String       | _optional:_ Component's display name. Used when debug()'ing and by React                              |
| `[mixins]`       | Array,Object | _optional:_ React mixins. Object literals with functions, or array of object literals with functions. |
| `[render]`       | Function     | _optional:_ Stateless component to add memoization on.                                                |


### Properties

| property                | type     | description                       |
| ----------------------- | -------- | --------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate |



**Returns** `Component,Function`, 


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

| param     | type   | description                                         |
| --------- | ------ | --------------------------------------------------- |
| `pattern` | RegExp | Filter pattern. Only show messages matching pattern |


### Example

```js
omniscient.debug(/Search/i);
```


**Returns** `Immstruct`, 


### `Component(displayName, props, ...rest)`

Invoke component (rendering it)

### Parameters

| param         | type   | description                                                                                |
| ------------- | ------ | ------------------------------------------------------------------------------------------ |
| `displayName` | String | Component display name. Used in debug and by React                                         |
| `props`       | Object | Properties (triggers update when changed). Can be cursors, object and immutable structures |
| `...rest`     | Object | Child components (React elements, scalar values)                                           |



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

| property           | type     | description                  |
| ------------------ | -------- | ---------------------------- |
| `isCursor`         | Function | Get default isCursor         |
| `isEqualState`     | Function | Get default isEqualState     |
| `isEqualProps`     | Function | Get default isEqualProps     |
| `isEqualCursor`    | Function | Get default isEqualCursor    |
| `isEqualImmutable` | Function | Get default isEqualImmutable |
| `isImmutable`      | Function | Get default isImmutable      |
| `isIgnorable`      | Function | Get default isIgnorable      |
| `debug`            | Function | Get default debug            |



**Returns** `Component`, 


### `shouldComponentUpdate.withDefaults([Options])`

Create a “local” instance of the shouldComponentUpdate with overriden defaults.

### Options
```js
{
  isCursor: function (cursor), // check if is props
  isEqualCursor: function (oneCursor, otherCursor), // check cursor
  isEqualImmutable: function (oneImmutableStructure, otherImmutableStructure), // check immutable structures
  isEqualState: function (currentState, nextState), // check state
  isImmutable: function (currentState, nextState), // check if object is immutable
  isEqualProps: function (currentProps, nextProps), // check props
  isIgnorable: function (propertyValue, propertyKey), // check if property item is ignorable
  unCursor: function (cursor) // convert from cursor to object
}
```

### Parameters

| param       | type   | description                                   |
| ----------- | ------ | --------------------------------------------- |
| `[Options]` | Object | _optional:_ Options with defaults to override |



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


### `shouldComponentUpdate.isEqualImmutable(a, b)`

Predicate to check if immutable structures are equal through reference checks.
Override through `shouldComponentUpdate.withDefaults` to customize behaviour.

### Parameters

| param | type      | description |
| ----- | --------- | ----------- |
| `a`   | Immutable |             |
| `b`   | Immutable |             |



**Returns** `Boolean`, 


### `shouldComponentUpdate.isImmutable(value)`

Predicate to check if a potential is an immutable structure or not.
Override through `shouldComponentUpdate.withDefaults` to support different cursor
implementations.

### Parameters

| param   | type           | description                  |
| ------- | -------------- | ---------------------------- |
| `value` | maybeImmutable | to check if it is immutable. |



**Returns** `Boolean`, 


### `shouldComponentUpdate.unCursor(cursor)`

Transforming function to take in cursor and return a non-cursor.
Override through `shouldComponentUpdate.withDefaults` to support different cursor
implementations.

### Parameters

| param    | type   | description  |
| -------- | ------ | ------------ |
| `cursor` | cursor | to transform |



**Returns** `Object,Number,String,Boolean`, 


### `shouldComponentUpdate.isCursor(potential)`

Predicate to check if `potential` is Immutable cursor or not (defaults to duck testing
Immutable.js cursors). Can override through `.withDefaults()`.

### Parameters

| param       | type      | description           |
| ----------- | --------- | --------------------- |
| `potential` | potential | to check if is cursor |



**Returns** `Boolean`, 


### `shouldComponentUpdate.isIgnorable(value, key)`

Predicate to check if a property on props should be ignored or not.
For now this defaults to ignore if property key is `statics`, but that
is deprecated behaviour, and will be removed by the next major release.

Override through `shouldComponentUpdate.withDefaults`.

### Parameters

| param   | type   | description |
| ------- | ------ | ----------- |
| `value` | Object |             |
| `key`   | String |             |



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

| param      | type     | description              |
| ---------- | -------- | ------------------------ |
| `Function` | Function | that does a computation. |



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

| param       | type   | description                                   |
| ----------- | ------ | --------------------------------------------- |
| `[Options]` | Object | _optional:_ Options with defaults to override |



**Returns** `Function`, cached with overriden defaults

## Private members 


### `isNode(propValue)`

Predicate showing whether or not the argument is a valid React Node
or not. Can be numbers, strings, bools, and React Elements.

React's isNode check from ReactPropTypes validator
but adjusted to not accept objects to avoid collision with props.

### Parameters

| param       | type   | description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `propValue` | String | Property value to check if is valid React Node |



**Returns** `Boolean`, 


