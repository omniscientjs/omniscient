"use strict";

var React     = require('react'),
    assign    = require('lodash.assign');

var shouldComponentUpdate = require('./shouldupdate');

/**
 * Create componets for functional views.
 *
 * The API of Omniscient is pretty simple, you create a component
 * with a render function, and mixins if you need them. When using
 * the created component, you can pass a cursor or an object as data
 * to the component. If you simply pass a cursor, the cursor will be
 * accessible on the props.cursor accessor. This data will be accessible
 * in the render function of the component (as props). In the passed data
 * object, if it’s within the statics property, the changes won’t get
 * tracker (see below).
 *
 * @param {String} [displayName] Component display name. Used in debug and by React
 * @param {Array|Object} [mixins] Mixins. Object literals with function, or array of object literals.
 * @param {Function} render Properties that do not trigger update when changed. Can be cursors, object and immutable structures
 *
 * @property {Function} shouldComponentUpdate Get default shouldComponentUpdate

 * @module omniscient
 * @returns {Component}
 * @api public
 */
module.exports = factory();

/**
 * Create a “local” instance of the Omniscient component creator by using the `.withDefaults` method.
 * This also allows you to override any defaults that Omniscient uses to check equality of objects,
 * unwrap cursors, etc. See below on section about defaults for what to override.
 *
 * ### Options
 * ```js
 * {
 *   // Goes directly to component
 *   shouldComponentUpdate: function(nextProps, nextState), // check update
 *   jsx: false, // whether or not to default to jsx components
 *   cursorField: '__singleCursor', // cursor property name to "unwrap" before passing in to render (see note)
 *
 *   // Is passed on to `shouldComponentUpdate`
 *   isCursor: function(cursor), // check if is props
 *   isEqualCursor: function (oneCursor, otherCursor), // check cursor
 *   isEqualState: function (currentState, nextState), // check state
 *   isImmutable: function (currentState, nextState), // check if object is immutable
 *   isEqualProps: function (currentProps, nextProps), // check props
 *   unCursor: function (cursor) // convert from cursor to object
 * }
 * ```
 *
 * ### Examples
 * #### Always use JSX
 * ```js
 * var component = require('omniscient');
 * var jsxComponent = component.withDefaults({
 *   jsx: true
 * });
 *
 * var MyComponent = jsxComponent(function () {
 *   return <h1>Hello!</h1>
 * });
 * React.render(<MyComponent />, document.body);
 * ```
 *
 * #### Un-wrapping curors
 * ```jsx
 * var localComponent = component.withDefaults({
 *   cursorField: 'foobar'
 * });
 *
 * var Component = component(function(myPassedCursor) {
 *   // Now you have myPassedCursor instead of having to do props.foobar
 * });
 *
 * React.render(<Component foobar={myCursor} />, document.body);
 * ```
 *
 * @param {Object} [Options] Options with defaults to override
 *
 * @property {Function} shouldComponentUpdate Get default shouldComponentUpdate

 * @module omniscient.withDefaults
 * @returns {Component}
 * @api public
 */
module.exports.withDefaults = factory;

function factory (options) {
  var debug;
  options = options || {};
  var _shouldComponentUpdate = options.shouldComponentUpdate;
  var _isCursor = options.isCursor || shouldComponentUpdate.isCursor;
  var _isImmutable = options.isImmutable || shouldComponentUpdate.isImmutable;
  var _isJsx = !!options.jsx;
  var _hiddenCursorField = options.cursorField || '__singleCursor';
  var _isNode = options.isNode || isNode;

  if (!_shouldComponentUpdate) {
    _shouldComponentUpdate = shouldComponentUpdate.withDefaults(options);
  }

  /**
   * Activate debugging for components. Will log when components renders, and
   * outcome of `shouldComponentUpdate` (and why).
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
   * @param {RegExp} [pattern] Filter pattern. Do only show messages matching pattern
   *
   * @property {Object} jsx Get component for use in JSX
   *
   * @module omniscient.debug
   * @returns {Immstruct}
   * @api public
   */
  ComponentCreator.debug = debugFn;
  ComponentCreator.shouldComponentUpdate = _shouldComponentUpdate;
  return ComponentCreator;

  function ComponentCreator (displayName, mixins, render) {
    var options = createDefaultArguments(displayName, mixins, render);
    var methodStatics = pickStaticMixins(options.mixins);

    var componentObject = {
      displayName: options.displayName || options.render.name,
      mixins: options.mixins,
      render: function render () {
        if (debug) debug.call(this, 'render');
        // If `props[cursor]` is defined than it's just boxed cursor
        // in which case we unbox it.
        var input = this.props[_hiddenCursorField] || this.props;
        return options.render.call(this, input, this.props.statics);
      }
    };

    if (methodStatics) {
      componentObject.statics = methodStatics;
      removeOldStaticMethods(options.mixins);
    }

    var Component = React.createClass(componentObject);
    if (_isJsx) {
      return Component;
    }

    /**
     * Invoke component (rendering it)
     *
     * @param {String} [displayName] Component display name. Used in debug and by React
     * @param {Object} [props] Properties that **do** trigger update when changed. Can be cursors, object and immutable structures
     * @param {Object} [statics] Properties that do not trigger update when changed. Can be cursors, object and immutable structures
     * @param {Object} [..rest] Children of components (React elements, scalar values)
     *
     * @property {Object} jsx Get component for use in JSX

     * @module Component
     * @returns {ReactElement}
     * @api public
     */
    var create = function (key, props, statics) {
      var _props;
      var inputCursor;
      var children;

      if (typeof key === 'object') {
        statics = props;
        props = key;
        key   = void 0;
      }

      children = flatten(sliceFrom(arguments, statics).filter(_isNode));

      // If passed props is just a cursor we box it by making
      // props with `props[_hiddenCursorField]` set to given `props` so that
      // render will know how to unbox it. Note that __singleCursor proprety
      // name is used to make sure that render won't unbox props in case user
      // passed on with conflicting proprety name.
      if (_isCursor(props) || _isImmutable(props)) {
        inputCursor = props;
        _props = {};
        _props[_hiddenCursorField] = inputCursor;
      } else {
        _props = assign({}, props);
      }

      if (!!statics && !props.statics) {
        _props.statics = statics;
      }

      if (key) {
        _props.key = key;
      }

      if (!!children.length) {
        _props.children = children;
      }

      return React.createElement(Component, _props);
    };

    create.jsx = Component;

    if (methodStatics) {
      create = assign(create, methodStatics);
    }

    return create;
  }

  function debugFn (pattern, logFn) {
    debug = shouldComponentUpdate.withDefaults().debug(pattern, logFn);
  }

  function createDefaultArguments (displayName, mixins, render) {

    // (render)
    if (typeof displayName === 'function') {
      render      = displayName;
      mixins      = [];
      displayName = void 0;
    }

    // (mixins, render)
    if (typeof displayName === 'object' && typeof mixins === 'function') {
      render      = mixins;
      mixins      = displayName;
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
      mixins = [{
        shouldComponentUpdate: _shouldComponentUpdate
      }].concat(mixins);
    }

    return {
      displayName: displayName,
      mixins: mixins,
      render: render
    };
  }
}

function pickStaticMixins (mixins) {
  var filtered = mixins.filter(function (obj) {
    return !!obj.statics;
  });

  if (!filtered.length) {
    return void 0;
  }

  var statics = {};
  filtered.forEach(function (obj) {
    statics = assign(statics, obj.statics);
  });

  return statics;
}

function removeOldStaticMethods (mixins) {
  mixins.filter(function (obj) {
    return !!obj.statics;
  }).forEach(function (obj) {
    delete obj.statics;
  });
}

function hasShouldComponentUpdate (mixins) {
  return mixins.some(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  });
}

function toArray (args) {
  return Array.prototype.slice.call(args);
}

function sliceFrom (args, value) {
  var array = toArray(args);
  var index = Math.max(array.indexOf(value), 0);
  return array.slice(index);
}

// Just a shallow flatten
function flatten (array) {
  return Array.prototype.concat.apply([], array);
}

/**
 * Predicate showing whether or not argument value is a valid React Node
 * or not. Can be numbers, strings, bools, and React Elements.
 *
 * React's isNode check from ReactPropTypes validator
 *
 * @param {String} propValue Property value to check if is valid React Node
 *
 * @returns {Boolean}
 * @api private
 */
function isNode(propValue) {
  switch(typeof propValue) {
    case 'number':
    case 'string':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (React.isValidElement(propValue)) {
        return true;
      }
      for (var k in propValue) {
        if (!isNode(propValue[k])) {
          return false;
        }
      }
      return false;
    default:
      return false;
  }
}
