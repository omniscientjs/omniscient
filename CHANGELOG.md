Changelog
====

Changelog with fixes and additions between each release.

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
