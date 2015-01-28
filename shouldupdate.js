var filter  = require('lodash.pick'),
    isEqual = require('lodash.isequal');

var debug;

module.exports = factory();
module.exports.withDefaults = factory;
module.exports.isCursor = isCursor;
var debugFn = module.exports.debug = function (pattern) {
  var regex = new RegExp(pattern || '.*');
  debug = function (str) {
    var key = this._currentElement && this._currentElement.key ? ' key=' + this._currentElement.key : '';
    var name = this.constructor.displayName;
    var tag = name + key;
    if ((key || name) && regex.test(tag)) console.debug('<' + tag + '>: ' + str);
  };
  return debug;
};

function factory (methods) {
  methods = methods || {};

  var _isCursor      = methods.isCursor || isCursor,
      _isEqualCursor = methods.isEqualCursor || isEqualCursor,
      _isEqualState  = methods.isEqualState || isEqualState,
      _unCursor      = methods.unCursor || unCursor;

  shouldComponentUpdate.isCursor = _isCursor;
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
    var isCursor = _isCursor;
    var isEqualCursor = _isEqualCursor;

    current = filter(current, isCursor);
    next = filter(next, isCursor);

    for (var key in current) {
      if (!isEqualCursor(current[key], next[key])) {
        return true;
      }
    }
    return false;
  }

  function hasChangedProperties (current, next) {
    current = filter(current, not(_isCursor));
    next    = filter(next, not(_isCursor));

    for (var key in current) {
      if (!isEqual(current[key], next[key])) {
        return true;
      }
    }
    return false;
  }

  function isEqualState () {
    return isEqual.apply(Object.create(null), arguments);
  }

  function isEqualCursor (a, b) {
    return unCursor(a) === unCursor(b);
  }

}

function unCursor(cursor) {
  if (!isCursor(cursor)) {
    return cursor;
  }
  return cursor.deref();
}


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

function isStatics (val, key) {
  return key === 'statics';
}

function isChildren (val, key) {
  return key === 'children';
}

function or (fn1, fn2) {
  return function () {
    return fn1.apply(null, arguments) || fn2.apply(null, arguments);
  };
}
