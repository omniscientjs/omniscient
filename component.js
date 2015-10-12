"use strict";

var React = require('react');
var assign = require('lodash.assign');

var shouldComponentUpdate = require('./shouldupdate');
var cached = require('./cached');

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
 *
 *   // Passed on to `shouldComponentUpdate`
 *   isCursor: function(cursor), // check if prop is cursor
 *   unCursor: function (cursor), // convert cursor to object
 *   isEqualCursor: function (oneCursor, otherCursor), // compares cursor
 *   isEqualState: function (currentState, nextState), // compares state
 *   isEqualProps: function (currentProps, nextProps), // compares props
 *   isImmutable: function (maybeImmutable) // check if object is immutable
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
 * React.render(<Component foobar={myCursor} />, document.body);
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

function factory (options) {
  var debug;
  options = options || {};
  var _shouldComponentUpdate = options.shouldComponentUpdate ||
        shouldComponentUpdate.withDefaults(options);
  var _isCursor = options.isCursor || shouldComponentUpdate.isCursor;
  var _isImmutable = options.isImmutable || shouldComponentUpdate.isImmutable;
  var _hiddenCursorField = options.cursorField || '__singleCursor';
  var _isNode = options.isNode || isNode;
  var _cached = cached.withDefaults(_shouldComponentUpdate);
  var _decorate = options.decorate;
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

  function ComponentCreator (displayName, mixins, render, decorate) {
    var options = createDefaultArguments(displayName, mixins, render, decorate);
    var methodStatics = pickStaticMixins(options.mixins);

    var componentObject = {
      displayName: options.displayName || options.render.name,
      mixins: options.mixins,
      render: function render () {
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

    var Component = React.createClass(componentObject);
    
    // If there is a globally or locally set decorator, apply it to the class
    var decorator = options.decorate || _decorate;
    if (decorator) {
      Component = decorator(Component);
    }

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
    var create = function (key, props) {
      var _props;
      var inputCursor;
      var children;

      if (typeof key === 'object') {
        props = key;
        key   = void 0;
      }

      children = flatten(sliceFrom(arguments, props).filter(_isNode));

      // If passed props is a signle cursor we move it to `props[_hiddenCursorField]`
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

      if (!!children.length) {
        _props.children = children;
      }

      return React.createElement(Component, _props);
    };

    if (methodStatics) {
      create = assign(create, methodStatics);
    }

    return create;
  }

  function debugFn (pattern, logFn) {
    if (_shouldComponentUpdate.debug) {
      debug = _shouldComponentUpdate.debug(pattern, logFn);
    }
  }
  
  var NO_RENDER = "Component definition requires `render` function as its argument"

  // [displayName], [mixins = []], render, [decorate]
  function createDefaultArguments (/* args */) {
    var args = Array.prototype.slice.call(arguments);
    var currArg = 0, argCount = args.length;;
    
    var displayName, mixins = [], render, decorate;
    
    if (currArg == argCount) throw NO_RENDER;
    if (typeof args[currArg] === 'string' || args[currArg] instanceof String) {
      displayName = args[currArg++];
    }
    
    if (currArg == argCount) throw NO_RENDER;
    if (Array.isArray(args[currArg])) {
      mixins = [args[currArg++]];
    } else if (typeof args[currArg] === 'object') {
      mixins = args[currArg++];
    }
    
    if (currArg == argCount) throw NO_RENDER;
    if (typeof args[currArg] === 'function') {
      render = args[currArg++];
    }
    
    if (currArg != argCount && typeof args[currArg] === 'function') {
      decorate = args[currArg++];
    }

    if (!hasShouldComponentUpdate(mixins)) {
      mixins.unshift({
        shouldComponentUpdate: _shouldComponentUpdate
      });
    }

    return {
      displayName: displayName,
      mixins: mixins,
      render: render,
      decorate: decorate
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
function isNode (propValue) {
  switch (typeof propValue) {
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
    return false;
  default:
    return false;
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
    if (mixin.shouldComponentUpdate) return true;
    if (!Array.isArray(mixin.mixins)) return false;
    return hasShouldComponentUpdate(mixin.mixins);
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
