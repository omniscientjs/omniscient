Changelog
====

Changelog with fixes and additions between each release.

## Version `v4.2.0`

Thanks to [@dpoindexter](https://github.com/dpoindexter) for helping out with this release.

### Minor changes
1. Adds compatability with React v16 ([#136](https://github.com/omniscientjs/omniscient/pull/136), thanks to [@dpoindexter](https://github.com/dpoindexter))
2. Changes to use `createClass` package instead of `React.createClass` in lue with React 15.5 ([#134](https://github.com/omniscientjs/omniscient/issues/134))
3. Adds ability to override default behavior of isEqalImmutable (see [#133](https://github.com/omniscientjs/omniscient/pull/))
4. Make component instantiation more general in order to support React 16 (see [#137](https://github.com/omniscientjs/omniscient/pull/137))

### Internal Changes

1. Changes build system to Webpack
2. Changes from lodash.assign to object-assign as this is what react-create-class uses. (deduping)
3. Removes lodash.pickBy, using own implementation instead. Reducing size.
4. Setup vscode settings with recommended prettier plugin.
5. Adds prettier precommit step.
6. Changes from mocha to Jest
7. Adds codecov integration.
8. Bumps internal dependencies

## Version `v4.1.1`

Fixes issue with create factory not mimicking correctly React classes after React 0.14. See [#126](https://github.com/omniscientjs/omniscient/issues/126) for more information.

## Version `v4.1.0`

### Additions

1. Adds ability to add local decorator to component through `component.withDecorator()`:
```js
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
React.render(<Component />, mountingPoint);
```

This can also be used as a partially applied function:

```js
var decoratedComponent = component.classDecorator(someDecorator);
var Component = decoratedComponent(function (props) {
  // ... some implementation
});
```

### Bugfixes

1. Fixes Omniscient component factory input to handle being new-ed up from within React. Fixes some test issues and potential bugs with contexts. See [#123](https://github.com/omniscientjs/omniscient/issues/123) for more info.
2. Fixes as Omniscient component factory disguises as a React class. This works around the fact that many third party libraries uses custom ways to use classes. For instance hot reloading. See [#125](https://github.com/omniscientjs/omniscient/pull/125) for more information.

## Version `v4.0.0` - Breaking changes

`React 0.14.0` introduced some very nice features such as stateless components, and we saw that it hit very close the the usage as we've seen in Omniscient.js for the last year. With this change we made some simplifications to our components to be even more similar to vanilla React. Now you can use Omniscient.js as you would with vanilla React, just with added optimizations. Much like memoization for normal functions.

There are still some features only available through Omniscient.js components, though. Such as syntactic sugar for component keys, string-defined display names, easier access to immutable data or cursors (wrapping/unwrapping as single argument), and the ability to add life cycle methods if that's something you need.

### Deletions
1. There is no longer a magic `statics` property. Instead this is made explicit through a overridable option on the provided `shouldComponentUpdate` called `isIgnorable`. This function can be used to signal what property on the `props` that should be ignored. Nothing is ignored by default. You don't have to use `isIgnorable` manually, but you can use the `ignore` component provided as syntactic sugar in a helper library called [omnipotent](https://github.com/omniscientjs/omnipotent#ignorefields--stringarraystring-component--component). See an example of this in the migration steps below.
2. As there is no longer a default `statics` property, `statics` are no longer passed as second props argument to the function. This means you only get props as a single parameter to your stateless components (Cursors/Immutable structures are still wrapped/unwrapped). See examples in migration steps below.
3. Now only supports `React 0.14.0`.
4. No more `.JSX` extension. This was a workaround to get interoperability with JSX and non-JSX code. With React 0.14, this is no longer needed!

### Additions
1. Adds support for React Class level decorators. See [relevant discussion and prompted need in issue #117](https://github.com/omniscientjs/omniscient/issues/117).
  Example usage with decorator:

  ```js
  var decoratedComponent = component.withDefaults({
    classDecorator: compose(Radium, function (Component) {
      var DecoratedComponent = doSomething(Component);
      return DecoratedComponent;
    })
  });
  *
  var Component = decoratedComponent(function (props) {
    // ... some implementation
  });
  ```

### Internal Changes
1. Now only builds on node 4.0.0 due to the latest jsdom.

### Migration Steps

There are three things you need to change to get it working in the latest version. If you haven't used `statics`, there is nothing to change. The example before and after code below contains all the information you need to migrate.

#### Before

```js
var MyComponent = component(function (props, statics) {
  var onClick = statics.clickHandler;
  return DOM.button({ onClick }, 'Click me!');
});

var App = component(function (props) {
  return MyComponent({
    text: 'Click me!'
  }, {
    // statics
    clickHandler: function () {
      console.log('Clicked the button!');
    }
  })
});
```

#### After

```js
var shouldUpdate = require('omniscient/shouldupdate').withDefaults({
  isIgnorable: function (value, key) {
    // ignore properties with key `statics`
    return key === 'statics';
  }
});

var StaticsIgnoredComponent = component({
  shouldComponentUpdate: shouldUpdate
}, function (props) {
  var onClick = props.statics.clickHandler;
  return DOM.button({ onClick }, 'Click me!');
});

var App = component(function (props) {
  return StaticsIgnoredComponent({
    text: 'Click me!'
    statics: {
      clickHandler: function () {
        console.log('Clicked the button!');
      }
    }
  })
});
```

Or using the [omnipotent helper](https://github.com/omniscientjs/omnipotent#ignorefields--stringarraystring-component--component):

```js
var ignore = require('omnipotent/decorator/ignore');

var MyComponent = component(function (props) {
  var onClick = props.statics.clickHandler;
  return DOM.button({ onClick }, 'Click me!');
});

// Create a new component that has statics ignored
var StaticsIgnoredComponent = ignore('statics', MyComponent);

var App = component(function (props) {
  return StaticsIgnoredComponent({
    text: 'Click me!'
    statics: {
      clickHandler: function () {
        console.log('Clicked the button!');
      }
    }
  })
});
```

### Migration Steps JSX removal

`.jsx` has been removed, but the migration is real simple. Remove all instances of `.jsx` and `component.withDefaults({ jsx: true })` from your codebase.


#### Before

```jsx
var MyComponent = component((props) => (
  <h1>Hello {props.text}</h1>
)).jsx; // note the `.jsx`

var App = component(() => (
  <div>
    <MyComponent text="Hello!" />
  </div>
)).jsx;
```


#### After

```jsx
var MyComponent = component((props) => (
  <h1>Hello {props.text}</h1>
));

var App = component(() => (
  <div>
    <MyComponent text="Hello!" />
  </div>
));
```

As an added bonus you now have complete interoperability between jsx and non-jsx:

```jsx
var MyComponent = component((props) => (
  <h1>Hello {props.text}</h1>
));

var App = component(() => (
  React.DOM.div({},
    MyComponent({ text: 'Hello!' })
  )
));
```

## Version `v3.3.0`

_Temporary solution to roll out native support_

## Additions

Adds support for React-Native, by doing

```js
var component = require('omniscient/native');
```

Requires `react-native` installed.

## Version `v3.2.0`

Minor release adding some features. Most notably the transition for new API for ignorable fields. Currently all properties under the `statics` property name is ignored, but this is a poor and weak API. We'll transition to a more explicit API through decorator helpers. This release is obviously non-breaking, so the `statics` property behaviour isn't removed yet, but will be with the next major release.

## Additions

1. Allow for nested mixins for `shouldComponentUpdate`. See [#99](https://github.com/omniscientjs/omniscient/pull/99)
2. Changes isStatics to be isIgnorable and overridable. See [a28d59](https://github.com/omniscientjs/omniscient/commit/a28d595433dce99dda193fba1be6178dcbe0b5f7)

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
