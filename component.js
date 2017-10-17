'use strict';

var createClass = require('create-react-class');
var assign = require('object-assign');
var React = require('react');

var shouldComponentUpdate = require('./shouldupdate');
var cached = require('./cached');

/**
 * When present on the prototype of a component constructor in React 16,
 * indicates that a component can be instantiated
 */
var isComponentSigil = {
  isReactComponent: {}
};

/**
 * Create components for functional views.
 *
 * The API of Omniscient is pretty simple, you create a Stateless React Component
 * but memoized with a smart implemented `shouldComponentUpdate`.
 *
 * The provided `shouldComponentUpdate` handles immutable data and cursors by default.
 * It also falls back to a deep value check if passed props isn't immutable structures.
 *
 * You can use an Omniscient component in the same way you'd use a React Stateless Function,
 * or you can use some of the additional features, such as string defined display name and
 * pass in life cycle methods. These are features normally not accessible for vanilla
 * Stateless React Components.
 *
 * If you simply pass one cursor, the cursor will be accessible on the
 * `props.cursor` accessor.
 *
 * @param {String} displayName Component's display name. Used when debug()'ing and by React
 * @param {Array|Object} mixins React mixins. Object literals with functions, or array of object literals with functions.
 * @param {Function} render Stateless component to add memoization on.
 *
 * @property {Function} shouldComponentUpdate Get default shouldComponentUpdate
 * @module omniscient
 * @returns {Component}
 * @api public
 */

module.exports = factory();

/**
 * Create a “local” instance of the Omniscient component creator by using the `.withDefaults` method.
 * This also allows you to override any defaults that Omniscient use to check equality of objects,
 * unwrap cursors, etc.
 *
 * ### Options
 * ```js
 * {
 *   // Goes directly to component
 *   shouldComponentUpdate: function(nextProps, nextState), // check update
 *   cursorField: '__singleCursor', // cursor property name to "unwrap" before passing in to render
 *   isNode: function(propValue), // determines if propValue is a valid React node
 *   classDecorator: function(Component), // Allows for decorating created class
 *
 *   // Passed on to `shouldComponentUpdate`
 *   isCursor: function (cursor), // check if is props
 *   isEqualCursor: function (oneCursor, otherCursor), // check cursor
 *   isEqualImmutable: function (oneImmutableStructure, otherImmutableStructure), // check immutable structures
 *   isEqualState: function (currentState, nextState), // check state
 *   isImmutable: function (currentState, nextState), // check if object is immutable
 *   isEqualProps: function (currentProps, nextProps), // check props
 *   isIgnorable: function (propertyValue, propertyKey), // check if property item is ignorable
 *   unCursor: function (cursor) // convert from cursor to object
 * }
 * ```
 *
 * ### Examples
 *
 * #### Un-wrapping curors
 * ```jsx
 * var localComponent = component.withDefaults({
 *   cursorField: 'foobar'
 * });
 *
 * var Component = localComponent(function (myCursor) {
 *   // Now you have myCursor directly instead of having to do props.foobar
 * });
 *
 * React.render(<Component foobar={myCursor} />, mountingPoint);
 * ```
 *
 * #### Decorating class components
 * ```jsx
 * // Some third party libraries requires you to decorate the
 * // React class, not the created component. You can do that
 * // by creating a decorated component factory
 * var decoratedComponent = component.withDefaults({
 *   classDecorator: compose(Radium, function (Component) {
 *     var DecoratedComponent = doSomething(Component);
 *     return DecoratedComponent;
 *   })
 * });
 *
 * var Component = decoratedComponent(function (props) {
 *   // ... some implementation
 * });
 *
 * React.render(<Component  />, mountingPoint);
 * ```
 *
 * @param {Object} Options Options with defaults to override
 *
 * @property {Function} shouldComponentUpdate Get default shouldComponentUpdate
 *
 * @module omniscient.withDefaults
 * @returns {Component}
 * @api public
 */
module.exports.withDefaults = factory;

function factory(initialOptions) {
  var debug;
  initialOptions = initialOptions || {};

  var _shouldComponentUpdate =
    initialOptions.shouldComponentUpdate ||
    shouldComponentUpdate.withDefaults(initialOptions);
  var _isCursor = initialOptions.isCursor || shouldComponentUpdate.isCursor;
  var _isImmutable =
    initialOptions.isImmutable || shouldComponentUpdate.isImmutable;
  var _hiddenCursorField = initialOptions.cursorField || '__singleCursor';
  var _isNode = initialOptions.isNode || isNode;
  var _classDecorator = initialOptions.classDecorator || identity;
  var _cached = cached.withDefaults(_shouldComponentUpdate);

  var CreatedComponent = ComponentCreatorFactory(_classDecorator);

  /**
   * Create components for functional views, with an attached local class decorator.
   * Omniscient uses a `createClass()` internally to create an higher order
   * component to attach performance boost and add some syntactic sugar to your
   * components. Sometimes third party apps need to be added as decorator to this
   * internal class. For instance Redux or Radium.
   * This create factory behaves the same as normal Omniscient.js component
   * creation, but with the additional first parameter for class decorator.
   *
   * The API of Omniscient is pretty simple, you create a Stateless React Component
   * but memoized with a smart implemented `shouldComponentUpdate`.
   *
   * The provided `shouldComponentUpdate` handles immutable data and cursors by default.
   * It also falls back to a deep value check if passed props isn't immutable structures.
   *
   * You can use an Omniscient component in the same way you'd use a React Stateless Function,
   * or you can use some of the additional features, such as string defined display name and
   * pass in life cycle methods. These are features normally not accessible for vanilla
   * Stateless React Components.
   *
   * If you simply pass one cursor, the cursor will be accessible on the
   * `props.cursor` accessor.
   *
   * #### Decorating class components
   * ```jsx
   * // Some third party libraries requires you to decorate the
   * // React class, not the created component. You can do that
   * // by creating a decorated component factory
   * var someDecorator = compose(Radium, function (Component) {
   *   var DecoratedComponent = doSomething(Component);
   *   return DecoratedComponent;
   * });
   * var Component = component.classDecorator(someDecorator, function (props) {
   *   // ... some implementation
   * });
   *
   * React.render(<Component />, mountingPoint);
   * ```
   *
   * Also works by creating a component factory:
   *
   * ```jsx
   * var someDecorator = compose(Radium, function (Component) {
   *   var DecoratedComponent = doSomething(Component);
   *   return DecoratedComponent;
   * });
   * var newFactory = component.classDecorator(someDecorator);
   * var Component = newFactory(function (props) {
   *   // ... some implementation
   * });
   *
   * React.render(<Component />, mountingPoint);
   * ```
   *
   * @param {Function} classDecorator Decorator to use for internal class (e.g. Redux connect, Radium)
   * @param {String} [displayName] Component's display name. Used when debug()'ing and by React
   * @param {Array|Object} [mixins] React mixins. Object literals with functions, or array of object literals with functions.
   * @param {Function} [render] Stateless component to add memoization on.
   *
   * @property {Function} shouldComponentUpdate Get default shouldComponentUpdate
   * @module omniscient
   * @returns {Component|Function}
   * @api public
   */
  CreatedComponent.classDecorator = function(classDecorator) {
    var shouldPartiallyApply = arguments.length === 1;
    if (shouldPartiallyApply) {
      return ComponentCreatorFactory(classDecorator);
    }
    return ComponentCreatorFactory(classDecorator).apply(
      null,
      toArray(arguments).slice(1)
    );
  };
  return CreatedComponent;

  function ComponentCreatorFactory(passedClassDecorator) {
    /**
     * Activate debugging for components. Will log when a component renders,
     * the outcome of `shouldComponentUpdate`, and why the component re-renders.
     *
     * ### Example
     * ```js
     * Search>: shouldComponentUpdate => true (cursors have changed)
     * Search>: render
     * SearchBox>: shouldComponentUpdate => true (cursors have changed)
     * SearchBox>: render
     * ```
     *
     * @example omniscient.debug(/Search/i);
     *
     * @param {RegExp} pattern Filter pattern. Only show messages matching pattern
     *
     * @module omniscient.debug
     * @returns {Immstruct}
     * @api public
     */
    ComponentCreator.debug = debugFn;
    ComponentCreator.cached = _cached;
    ComponentCreator.shouldComponentUpdate = _shouldComponentUpdate;

    return ComponentCreator;

    function ComponentCreator(displayName, mixins, render) {
      var options = createDefaultArguments(displayName, mixins, render);
      var methodStatics = pickStaticMixins(options.mixins);

      var componentObject = {
        displayName: options.displayName || options.render.name,
        mixins: options.mixins,
        render: function render() {
          if (debug) debug.call(this, 'render');
          // If `props['__singleCursor']` is set a single cursor was passed
          // to the component, pick it out and pass it.
          var input = this.props[_hiddenCursorField] || this.props;
          this.cursor = this.props[_hiddenCursorField];
          return options.render.call(this, input);
        }
      };

      if (methodStatics) {
        componentObject.statics = methodStatics;
        removeOldStaticMethods(options.mixins);
      }

      var Component = passedClassDecorator(createClass(componentObject));

      /**
       * Invoke component (rendering it)
       *
       * @param {String} displayName Component display name. Used in debug and by React
       * @param {Object} props Properties (triggers update when changed). Can be cursors, object and immutable structures
       * @param {Object} ...rest Child components (React elements, scalar values)
       *
       * @module Component
       * @returns {ReactElement}
       * @api public
       */
      function create(keyOrProps, propsOrPublicContext, updater) {
        // `create` must handle two scenarios (given a component like `var MyComponent = component(() => <div />)`)
        //
        // 1. direct calls: `MyComponent();`
        //    direct calls should return a new ReactElement
        // 2. instantiation via React renderer: ReactDOM.render(<MyComponent />);
        //    instantiation should create a new instance of the underlying ReactClass
        //
        // To know which scenario we're in, we have to understand whether the current call
        // was made with the `new` keyword (via a React renderer). If not, assume the function
        // was called directly from userland
        if (this && this.constructor === create) {
          var publicProps = keyOrProps,
            publicContext = propsOrPublicContext;
          return new Component(publicProps, publicContext, updater);
        }

        var key = keyOrProps,
          props = propsOrPublicContext;

        if (typeof key === 'object') {
          props = key;
          key = void 0;
        }

        var isFirstLevel = true;
        var children = flatten(
          sliceFrom(arguments, props).filter(function(item, i) {
            return _isNode(item, i, isFirstLevel);
          })
        );
        var _props, inputCursor;

        // If passed props is a single cursor we move it to `props[_hiddenCursorField]`
        // to simplify should component update. The render function will move it back.
        // The name '__singleCursor' is used to not clash with names of user passed properties
        if (_isCursor(props) || _isImmutable(props)) {
          inputCursor = props;
          _props = {};
          _props[_hiddenCursorField] = inputCursor;
        } else {
          _props = assign({}, props);
        }

        if (key) {
          _props.key = key;
        }

        if (children.length) {
          _props.children = children;
        }
        return React.createElement(Component, _props);
      }

      if (methodStatics) {
        create = assign(create, methodStatics);
      }

      assign(create.prototype, isComponentSigil);
      return assign(create, Component, { type: Component });
    }
  }

  function debugFn(pattern, logFn) {
    if (_shouldComponentUpdate.debug) {
      debug = _shouldComponentUpdate.debug(pattern, logFn);
    }
  }

  function createDefaultArguments(displayName, mixins, render) {
    // (render)
    if (typeof displayName === 'function') {
      render = displayName;
      mixins = [];
      displayName = void 0;
    }

    // (mixins, render)
    if (typeof displayName === 'object' && typeof mixins === 'function') {
      render = mixins;
      mixins = displayName;
      displayName = void 0;
    }

    // (displayName, render)
    if (typeof displayName === 'string' && typeof mixins === 'function') {
      render = mixins;
      mixins = [];
    }

    // Else (displayName, mixins, render)

    if (!Array.isArray(mixins)) {
      mixins = [mixins];
    }

    if (!hasShouldComponentUpdate(mixins)) {
      mixins.unshift({
        shouldComponentUpdate: _shouldComponentUpdate
      });
    }

    return {
      displayName: displayName,
      mixins: mixins,
      render: render
    };
  }
}

/**
 * Predicate showing whether or not the argument is a valid React Node
 * or not. Can be numbers, strings, bools, and React Elements.
 *
 * React's isNode check from ReactPropTypes validator
 * but adjusted to not accept objects to avoid collision with props.
 *
 * @param {String} propValue Property value to check if is valid React Node
 *
 * @returns {Boolean}
 * @api private
 */
function isNode(propValue, i, firstLevel) {
  switch (typeof propValue) {
    case 'number':
      return true;
    case 'string':
      return i !== 0 || !firstLevel;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(function(item, n) {
          return isNode(item, n, false);
        });
      }
      if (React.isValidElement(propValue)) {
        return true;
      }
      return false;
    default:
      return false;
  }
}

function pickStaticMixins(mixins) {
  var filtered = mixins.filter(function(obj) {
    return !!obj.statics;
  });

  if (!filtered.length) {
    return void 0;
  }

  var statics = {};
  filtered.forEach(function(obj) {
    statics = assign(statics, obj.statics);
  });

  return statics;
}

function removeOldStaticMethods(mixins) {
  mixins
    .filter(function(obj) {
      return !!obj.statics;
    })
    .forEach(function(obj) {
      delete obj.statics;
    });
}

function hasShouldComponentUpdate(mixins) {
  return mixins.some(function(mixin) {
    if (mixin.shouldComponentUpdate) return true;
    if (!Array.isArray(mixin.mixins)) return false;
    return hasShouldComponentUpdate(mixin.mixins);
  });
}

function identity(fn) {
  return fn;
}

function toArray(args) {
  return Array.prototype.slice.call(args);
}

function sliceFrom(args, value) {
  var array = toArray(args);
  var index = Math.max(array.indexOf(value), 0);
  return array.slice(index);
}

// Just a shallow flatten
function flatten(array) {
  return Array.prototype.concat.apply([], array);
}
