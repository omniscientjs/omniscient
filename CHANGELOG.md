Changelog
====

Changelog with fixes and additions between each release.

## Version `v3.1.0`

Changes for the new up-comming release of Omniscient (`v3.1.0`), to allow users to track comming changes.

### Additions
1. Now allows for automatic "unwrapping" of single cursors (and define what field to unwrap) #60. Example:
```jsx
var localComponent = component.withDefaults({
  cursorField: 'foobar'
});

var Component = localComponent(function(myPassedCursor) {
  // Now you have myPassedCursor instead of having to do props.foobar
});

React.render(<Component foobar={myCursor} />, document.body)
```
2. Added "hot swapping" of functions passed in statics. This is to swap out event handlers passed with a cursor reference. See #68
3. As Omniscient encourages more work in the render function, you might have to do additional work even though some of your data is unchanged. We added `omniscient.cached` to allow for cached functions, dependent on input. Example:

```js
var called = 0;
var point = function (point) {
  return point.get('x') + ':' + point.get('y');
};
var line = component.cached(function (from, to) {
  called = called + 1;
  return point(from) + '-' + point(to)
});


var a = Cursor.from(Immutable.fromJS({x:0, y:0}));
var b = Cursor.from(Immutable.fromJS({x: 1, y:7}));

line(a, b).should.equal("0:0-1:7");
called.should.equal(1);

line(a, b).should.equal("0:0-1:7");
called.should.equal(1);
```

### Bugfixes
1. Fixes a bug where children were being attached as statics (#66)
2. Fixes bug when overriding isEqualCursor (419046b9)
3. Fixes accessible cursor across mixins when unwrapping cursors. (#86)

### Internal changes
1. Now uses `lodash.assign` internally, for potential de-duping. #61
2. Makes sure the `props` object is not mutated (#62)
3. Uses isNode from React to test for valid elements (#63)
4. Improves performance and simplifies internals of `shouldComponentUpdate` mixin (#78, #79)

## Version `v3.0.1`

Obligatory mess-up patch. Updates `dist` files to latest version
of Omniscient.

## Version `v3.0.0`

### Addition
* `shouldComponentUpdate` is now accessible on its own. This means that you
can include the mixin into your code base without including unused code from
the Omniscient core. #33

```js
var shouldupdate = require('omniscient/shouldupdate');

var mixins = [{ shouldComponentUpdate: shouldupdate }];
var MyComponent = React.createClass({
  mixins: mixins,

  render: function () { /* ...* / }
});
```

* Following 2. from Changes (changes to use `lodash.isEqual`), cursors can now be anywhere in the props three. See #39
```js
React.render(MyComponent({ some: { path: { to: cursor }}}), document.body);
```

* You can now have immutable structures as a part of your props/state #55
```js
React.render(MyComponent({ obj: Immutable.List.of(1, 2, 3) }), document.body);
```

* You can now pass on cursors directly to non-JSX components #43
```js
var MyComponent = component(function (cursor) {
  // do something with cursor
});

React.render(MyComponent(myCursor), document.body);
```

* You can now pass on immutable structure as single argument (as with cursor) #58
```js
React.render(MyComponent(Immutable.List.of(1, 2, 3)), document.body);
```

* You can now define component name through named render function 22bdf8804f84da77f2baa997d287f3d75f2cfb42
```jsx
var Component = component(function DisplayName() {
  return <div>Hello!</div>;
});
```

in addition to previous syntax:

```jsx
var Component = component('DisplayName', function () {
  return <div>Hello!</div>;
});
```

* You can now set to always use JSX component (see Breaking Changes) 53e5318617628697e65e912b44e42cf6ec72fd6f
```jsx
var component = require('omniscient');

var localComponent = component.withDefaults({
  jsx: true
});

var Component = localComponent(function MyJsxComponent() {
  /* ... */
});

// Component is JSX component. No need for Component.jsx
React.render(<Component />, document.body);
```

* You can now pass on statics as argument to non-JSX a523e595a0b34807ce6b0d068287362267bfc476
```js
var MyComponent = component(function (cursor, statics) {
  // do something with statics
});

React.render(MyComponent(myCursor, myStatic), document.body);
```


### Breaking Changes
* Can't longer override helper functions directly. Now you can create local component factories
which doesn't alter global state. #36

Overview of all overridables:

```js
var component = require('omniscient');

var localComponent = component.withDefaults({
  // Goes directly to component
  shouldComponentUpdate: function(nextProps, nextState), // check update
  jsx: false, // whether or not to default to jsx components

  // Is passed on to `shouldComponentUpdate`
  isCursor: function(cursor), // check if is props
  isEqualCursor: function (oneCursor, otherCursor), // check cursor
  isEqualState: function (currentState, nextState), // check state
  isImmutable: function (currentState, nextState), // check if object is immutable
  isEqualProps: function (currentProps, nextProps), // check props
  unCursor: function (cursor) // convert from cursor to object
});
```

You can also override directly on `shouldComponentUpdate`

```js
var shouldUpdate = require('omniscient/shouldUpdate');

var localShouldUpdate = shouldUpdate.withDefaults({
  isCursor: function(cursor), // check if is props
  isEqualCursor: function (oneCursor, otherCursor), // check cursor
  isEqualState: function (currentState, nextState), // check state
  isImmutable: function (currentState, nextState), // check if object is immutable
  isEqualProps: function (currentProps, nextProps), // check props
  unCursor: function (cursor) // convert from cursor to object
});
```

## Version `v2.1.0`

Additions:
1. Adds support for React static methods.
2. Adds dist files (`./dist/omniscient.js` and `./dist/omniscient.min.js`) and build script.

E.g.

```js
var mixins = [{ statics: { foo: noop } }, { statics: { bar: noop } }];

var Component = component(mixins, function () {
  return React.DOM.text(null, 'hello');
});

Component.foo.should.be.a('function');
Component.jsx.foo.should.be.a('function');
Component.bar.should.be.a('function');
Component.jsx.bar.should.be.a('function');
```

## Version `v2.0.1`

Fixes:
1. Tests and examples use Immutable.js 3.0.0 and Immstruct 1.0.0.
2. Fixed bug with `shouldComponentUpdate` and children (#19).

## Version `v2.0.0`

As of `v2.0.0`, Omniscient is dependent of React `v0.12.0`. This React version introduces some changes, and no longer allows components, but elements. With this some changes, not too big but breaks the previous API.


### Statics as properties

The most notable change is that the `statics` are moved to be a part of the properties.
Statics still doesn't effect whether or not the component should update.

Before you could do:

```js
OmniscientComponent('someKey', cursor, statics);
```

But now you have to do:

```js
OmniscientComponent('someKey', { cursor: cursor, statics: statics });
```

As a result of this, you now always get passed props to your render function.

Before you could do:

```js
var OmniscientComponent = component(function (cursor) {
  return React.DOM.text({}, cursor.deref());
});
```

Now you have to do:

```js
var OmniscientComponent = component(function (props) {
  return React.DOM.text({}, props.cursor.deref());
});
```


This:

```js
OmniscientComponent(cursor);
```

Is translated to:
```js
OmniscientComponent({ cursor: cursor });
```

You could also name your cursor:

```js
var OmniscientComponent = component(function (props) {
  return React.DOM.text({}, props.name.deref());
});

// Usage
OmniscientComponent({ name: cursor });
```

### With JSX

Also, with the way React now requires elements instead of components, there have to be a change in how we use Omniscient with JSX.

Before you could do:

```js
<OmniscientComponent cursor={someCursor} />
```

But now you have to do:

```js
<OmniscientComponent.jsx cursor={someCursor} />

// or
OmniscientComponent = OmniscientComponent.jsx;
<OmniscientComponent cursor={someCursor} />

// or
var OmniscientComponent = require('someComponent').jsx;
<OmniscientComponent cursor={someCursor} />
```

*Notice the `.jsx` after `OmniscientComponent`*

## Version `v1.3.1`

### Fixes
1. Locks React dependency to pre 0.12.0.
2. Fixes usage of statics with JSX.

## Version `v1.3.0`

### Additions
1. Custom Omniscient Components can now have children:
```js
var Comp = component(function (cursor) {
   // this.props.children[0] === h1 element
});

var App = component(function (cursor) {
   return Comp(cursor.get('item'), React.DOM.h1(null, 'Hello'));
});
```
2. Adds regex filters for debugging
3. Adds better print out for debug statements.
4. Updates Immutable.js dependency to latest.


## Version `v1.2.0`
### Additions
1. Adds possibility for overriding `component.isCursor`
1. Adds possibility for overriding `component.isEqualCursor`

## Version `v1.1.0`
### Fixes
1. Fixed bug with shouldComponentUpdate mixin, where the method couldn't be overridden.
2. Removed duplicated dependencies from `package.json`.

### Additions
1. Added component name support for debugging
```js
var Component = component(debugName, function () {});
```
2. Adds debug method for printing out valuable debug-information for shouldComponentRender and render.

## Version `v1.0.0`

Initial release with stable API.
