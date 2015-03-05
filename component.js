"use strict";

var React  = require('react'),
    assign = require('lodash.assign');

var shouldComponentUpdate = require('./shouldupdate');
var cached = require('./cached');

/**
 * Create components for functional views.
 *
 * The API of Omniscient is pretty simple, you create a component
 * with a render function and the mixins you need.
 *
 * When using the created component, you can pass a cursor or an object
 * as data to it. This data will be the render function's first argument,
 * and it will also be available on `this.props`.
 *
 * If you simply pass one cursor, the cursor will be accessible on the
 * `props.cursor` accessor. Data placed on the property `statics` of the
 * component's arguments will not be tracked for changes.
 *
 * @param {String} displayName Component's display name. Used when debug()'ing and by React
 * @param {Array|Object} mixins React mixins. Object literals with functions, or array of object literals with functions.
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
 * This also allows you to override any defaults that Omniscient use to check equality of objects,
 * unwrap cursors, etc.
 *
 * ### Options
 * ```js
 * {
 *   // Goes directly to component
 *   shouldComponentUpdate: function(nextProps, nextState), // check update
 *   jsx: false, // whether or not to default to jsx components
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
 * #### Always use JSX
 * ```js
 * var component = require('omniscient');
 * var jsxComponent = component.withDefaults({
 *   jsx: true
 * });
 *
 * var Greeting = jsxComponent(function () {
 *   return <h1>Hello!</h1>
 * });
 * React.render(<Greeting />, document.body);
 * ```
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
  var _isJsx = !!options.jsx;
  var _hiddenCursorField = options.cursorField || '__singleCursor';
  var _isNode = options.isNode || isNode;
  var _cached = cached.withDefaults(_shouldComponentUpdate);


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
   * @property {Object} jsx Get component for use in JSX
   *
   * @module omniscient.debug
   * @returns {Immstruct}
   * @api public
   */
  ComponentCreator.debug = debugFn;
  ComponentCreator.cached = _cached;
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
        // If `props['__singleCursor']` is set a single cursor was passed
        // to the component, pick it out and pass it.
        var input = this.props[_hiddenCursorField] || this.props;
        this.cursor = this.props[_hiddenCursorField];
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
     * @param {String} displayName Component display name. Used in debug and by React
     * @param {Object} props Properties that **do** trigger update when changed. Can be cursors, object and immutable structures
     * @param {Object} statics Properties that do not trigger update when changed. Can be cursors, object and immutable structuress
     * @param {Object} ..rest Child components (React elements, scalar values)
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

      // If statics is a node (due to it being optional)
      // don't attach the node to the statics prop
      if (!!statics && !props.statics && !_isNode(statics)) {
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
    if (_shouldComponentUpdate.debug) {
      debug = _shouldComponentUpdate.debug(pattern, logFn);
    }
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

    // Add built-in lifetime methods to keep `statics` up to date.
    mixins.unshift(componentWillMount.asMixin,
                   componentWillReceiveProps.asMixin);

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
 * Predicate showing whether or not the argument is a valid React Node
 * or not. Can be numbers, strings, bools, and React Elements.
 *
 * React's isNode check from ReactPropTypes validator
 * but adjusted to not accept objects to avoid collision with props & statics.
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

function delegate(delegee) {
  var delegate = function() {
    return delegate.delegee.apply(this, arguments);
  }
  delegate.delegee = delegee;
  delegate.isDelegate = true;
  return delegate;
}

function wrapWithDelegate (key) {
  var statics = this;
  var delegee = statics[key];
  if (typeof delegee === 'function') {
    statics[key] = isDelegate(delegee) ? delegee : delegate(delegee);
  }
}

function isDelegate (value) {
  return value && value.isDelegate;
}

function componentWillMount () {
  var statics = this.props.statics;
  if (statics && typeof statics === 'object') {
    Object.keys(statics).forEach(wrapWithDelegate, statics);
  }
}
// `asMixin` will let us reuse same objcet instead of re-creating
// it per each component.
componentWillMount.asMixin = {
  componentWillMount: componentWillMount
};

function componentWillReceiveProps (newProps) {
  var currentProps = this.props;
  var currentStatics = currentProps.statics;
  var newStatics = newProps.statics;
  var haveChangedStatics = newStatics !== currentStatics &&
                           newStatics &&
                           typeof newStatics === 'object';

  if (haveChangedStatics) {
    Object.keys(newStatics).forEach(function(key) {
      var newMember = newStatics[key];
      if (typeof(newMember) == 'function') {
        var currentMember = currentStatics && currentStatics[key];
        if (isDelegate(currentMember)) {
          var delegee = isDelegate(newMember) ? newMember.delegee : newMember;
          currentMember.delegee = delegee;
          newStatics[key] = currentMember;
        } else {
          newStatics[key] = delegate(newMember);
        }
      }
    });
  }
}
// `asMixin` will let us reuse same objcet instead of re-creating
// it per each component.
componentWillReceiveProps.asMixin = {
  componentWillReceiveProps: componentWillReceiveProps
};
