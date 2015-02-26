"use strict";

var filter  = require('lodash.pick'),
    isEqual = require('lodash.isequal');

/**
 * Directly fetch `shouldComponentUpdate` mixin to use outside of Omniscient.
 * You can do this if you don't want to use Omniscients syntactic sugar.
 *
 * @param {Object} nextProps Next props. Can be objects of cursors, values or immutable structures
 * @param {Object} nextState Next state. Can be objects of values or immutable structures
 *
 * @property {Function} isCursor Get default isCursor
 * @property {Function} isEqualState Get default isEqualState
 * @property {Function} isEqualProps Get default isEqualProps
 * @property {Function} isEqualCursor Get default isEqualCursor
 * @property {Function} isImmutable Get default isImmutable
 * @property {Function} debug Get default debug
 *
 * @module shouldComponentUpdate
 * @returns {Component}
 * @api public
 */
module.exports = factory();

/**
 * Create a “local” instance of the shouldComponentUpdate with overriden defaults.
 *
 * ### Options
 * ```js
 * {
 *   isCursor: function(cursor), // check if is props
 *   isEqualCursor: function (oneCursor, otherCursor), // check cursor
 *   isEqualState: function (currentState, nextState), // check state
 *   isImmutable: function (currentState, nextState), // check if object is immutable
 *   isEqualProps: function (currentProps, nextProps), // check props
 *   unCursor: function (cursor) // convert from cursor to object
 * }
 * ```
 *
 * @param {Object} [Options] Options with defaults to override
 *
 * @module shouldComponentUpdate.withDefaults
 * @returns {Function} shouldComponentUpdate with overriden defaults
 * @api public
 */
module.exports.withDefaults = factory;

function factory (methods) {
  var debug;
  methods = methods || {};

  var _isCursor      = methods.isCursor || isCursor,
      _isEqualCursor = methods.isEqualCursor || isEqualCursor,
      _isEqualState  = methods.isEqualState || isEqualState,
      _isEqualProps  = methods.isEqualProps || isEqualProps,
      _isImmutable   = methods.isImmutable || isImmutable,
      _unCursor      = methods.unCursor || unCursor;

  shouldComponentUpdate.isCursor = _isCursor;
  shouldComponentUpdate.isEqualState = _isEqualState;
  shouldComponentUpdate.isEqualProps = _isEqualProps;
  shouldComponentUpdate.isEqualCursor = _isEqualCursor;
  shouldComponentUpdate.isImmutable = _isImmutable;
  shouldComponentUpdate.debug = debugFn;

  return shouldComponentUpdate;

  function shouldComponentUpdate (nextProps, nextState) {
    var isNotIgnorable = not(or(isStatics, isChildren));

    var nextCursors    = filter(nextProps, isNotIgnorable),
        currentCursors = filter(this.props, isNotIgnorable);

    var nextCursorsKeys    = Object.keys(nextCursors),
        currentCursorsKeys = Object.keys(currentCursors);

    if (currentCursorsKeys.length !== nextCursorsKeys.length) {
      if (debug) debug.call(this, 'shouldComponentUpdate => true (number of cursors differ)');
      return true;
    }

    if (hasDifferentKeys(currentCursorsKeys, currentCursors, nextCursors)) {
      if (debug) debug.call(this, 'shouldComponentUpdate => true (cursors have different keys)');
      return true;
    }

    if (hasChangedCursors(currentCursors, nextCursors)) {
      if (debug) debug.call(this, 'shouldComponentUpdate => true (cursors have changed)');
      return true;
    }

    if (!_isEqualState(this.state, nextState)) {
      if (debug) debug.call(this, 'shouldComponentUpdate => true (state has changed)');
      return true;
    }

    if (hasChangedProperties(currentCursors, nextCursors)) {
      if (debug) debug.call(this, 'shouldComponentUpdate => true (properties have changed)');
      return true;
    }

    if (debug) debug.call(this, 'shouldComponentUpdate => false');

    return false;
  }

  function hasChangedCursors (current, next) {
    current = filter(current, _isCursor);
    next = filter(next, _isCursor);

    var nextKeys    = Object.keys(current),
        currentKeys = Object.keys(next);

    var nextLength = nextKeys.length;

    if (nextLength !== currentKeys.length) {
      return true;
    }

    for (var i = 0; i < nextLength; i++) {
      if (!_isEqualCursor(current[nextKeys[i]], next[currentKeys[i]])) {
        return true;
      }
    }
    return false;
  }

  function hasChangedProperties (current, next) {
    current = filter(current, not(_isCursor));
    next    = filter(next, not(_isCursor));

    for (var key in current) {
      if (!_isEqualProps(current[key], next[key])) {
        return true;
      }
    }
    return false;
  }


  /**
   * Predicate to check if state is equal. Checks in the tree for immutable structures
   * and if it is, check by reference. Does not support cursors.
   *
   * Override through `shouldComponentUpdate.withDefaults`.
   *
   * @param {Object} value
   * @param {Object} other
   *
   * @module shouldComponentUpdate.isEqualState
   * @returns {Boolean}
   * @api public
   */
  function isEqualState (value, other) {
    return isEqual(value, other, function (current, next) {
      if (_isImmutable(current) && _isImmutable(next)) {
        return current === next;
      }
      if (_isImmutable(current) || _isImmutable(next)) {
        return false;
      }
      return void 0;
    });
  }

  /**
   * Predicate to check if props are equal. Checks in the tree for cursors and immutable structures
   * and if it is, check by reference.
   *
   * Override through `shouldComponentUpdate.withDefaults`.
   *
   * @param {Object} value
   * @param {Object} other
   *
   * @module shouldComponentUpdate.isEqualProps
   * @returns {Boolean}
   * @api public
   */
  function isEqualProps (value, other) {
    return isEqual(value, other, function (current, next) {
      if (_isCursor(current) && _isCursor(next)) {
        return _isEqualCursor(current, next);
      }
      if (_isCursor(current) || _isCursor(next)) {
        return false;
      }
      if (_isImmutable(current) && _isImmutable(next)) {
        return current === next;
      }
      if (_isImmutable(current) || _isImmutable(next)) {
        return false;
      }
      return void 0;
    });
  }

  /**
   * Predicate to check if cursors are equal through reference checks. Uses `unCursor`.
   * Override through `shouldComponentUpdate.withDefaults` to support different cursor
   * implementations.
   *
   * @param {Cursor} a
   * @param {Cursor} b
   *
   * @module shouldComponentUpdate.isEqualCursor
   * @returns {Boolean}
   * @api public
   */
  function isEqualCursor (a, b) {
    return _unCursor(a) === _unCursor(b);
  }

  function debugFn (pattern, logFn) {
    if (typeof pattern === 'function') {
      logFn   = pattern;
      pattern = void 0;
    }

    var logger = logFn;
    if (!logger && console.debug) {
      logger = console.debug.bind(console);
    }
    if (!logger && console.info) {
      logger = console.info.bind(console);
    }

    var regex = new RegExp(pattern || '.*');
    debug = function (str) {
      var element = this._currentElement;
      if (this._reactInternalInstance && this._reactInternalInstance._currentElement) {
        element = this._reactInternalInstance._currentElement;
      }
      var key = element && element.key ? ' key=' + element.key : '';
      var name = this.constructor.displayName;
      if (!key && !name) {
        name = 'Unknown';
      }
      var tag = name + key;
      if (regex.test(tag)) logger('<' + tag + '>: ' + str);
    };
    return debug;
  }
}


/**
 * Predicate to check if a potential is an immutable structure or not.
 * Override through `shouldComponentUpdate.withDefaults` to support different cursor
 * implementations.
 *
 * @param {maybeImmutable} value to check if it is immutable.
 *
 * @module shouldComponentUpdate.isImmutable
 * @returns {Object|Number|String|Boolean}
 * @api public
 */
var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
function isImmutable(maybeImmutable) {
  return !!(maybeImmutable && maybeImmutable[IS_ITERABLE_SENTINEL]);
}

/**
 * Transforming function to take in cursor and return a non-cursor.
 * Override through `shouldComponentUpdate.withDefaults` to support different cursor
 * implementations.
 *
 * @param {cursor} cursor to transform
 *
 * @module shouldComponentUpdate.unCursor
 * @returns {Object|Number|String|Boolean}
 * @api public
 */
function unCursor(cursor) {
  if (!cursor || !cursor.deref) return cursor;
  return cursor.deref();
}


/**
 * Predicate to check if `potential` is Immutable cursor or not (defaults to duck testing
 * Immutable.js cursors). Can override through `.withDefaults()`.
 *
 * @param {potential} potential to check if is cursor
 *
 * @module shouldComponentUpdate.isCursor
 * @returns {Boolean}
 * @api public
 */
function isCursor (potential) {
  return potential && typeof potential.deref === 'function';
}

function hasDifferentKeys (currentCursorsKeys, currentCursors, nextCursors) {
  return !currentCursorsKeys.every(function existsInBoth (key) {
    return typeof currentCursors[key] !== 'undefined' && typeof nextCursors[key] !== 'undefined';
  });
}

function not (fn) {
  return function () {
    return !fn.apply(fn, arguments);
  };
}

function isStatics (_, key) {
  return key === 'statics';
}

function isChildren (_, key) {
  return key === 'children';
}

function or (fn1, fn2) {
  return function () {
    return fn1.apply(null, arguments) || fn2.apply(null, arguments);
  };
}
