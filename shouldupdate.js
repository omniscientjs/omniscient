var filterKeyValue = require('object-filter'),
    deepEqual      = require('deep-equal');

module.exports = shouldComponentUpdate;
module.exports.isEqualState  = function isEqualState () { return deepEqual.apply(this, arguments); };
module.exports.isEqualCursor = function isEqualCursor (a, b) { return unCursor(a) === unCursor(b); };
module.exports.isCursor = isCursor;

var debug;
module.exports.debug = function (pattern) {
  var regex = new RegExp(pattern || '.*');
  debug = function (str) {
    var key = this._currentElement && this._currentElement.key ? ' key=' + this._currentElement.key : '';
    var name = this.constructor.displayName;
    var tag = name + key;
    if ((key || name) && regex.test(tag)) console.debug('<' + tag + '>: ' + str);
  };
  return debug;
};

function shouldComponentUpdate (nextProps, nextState) {
  var isEqualState  = module.exports.isEqualState;

  var isNotIgnorable = not(or(isStatics, isChildren));

  var nextCursors    = filterKeyValue(nextProps, isNotIgnorable),
  currentCursors = filterKeyValue(this.props, isNotIgnorable);

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

  if (!isEqualState(this.state, nextState)) {
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

function isCursor (potential) {
  return potential && typeof potential.deref === 'function';
}

function unCursor(cursor) {
  if (!module.exports.isCursor(cursor)) {
    return cursor;
  }
  return cursor.deref();
}

function hasDifferentKeys (currentCursorsKeys, currentCursors, nextCursors) {
  return !currentCursorsKeys.every(function existsInBoth (key) {
    return typeof currentCursors[key] !== 'undefined' && typeof nextCursors[key] !== 'undefined';
  });
}

function hasChangedCursors (current, next) {
  var isCursor = module.exports.isCursor;
  var isEqualCursor = module.exports.isEqualCursor;

  current = filterKeyValue(current, isCursor);
  next = filterKeyValue(next, isCursor);

  for (var key in current) {
    if (!isEqualCursor(current[key], next[key])) {
      return true;
    }
  }
  return false;
}

function hasChangedProperties (current, next) {
  var isCursor = module.exports.isCursor;

  current = filterKeyValue(current, not(isCursor));
  next    = filterKeyValue(next, not(isCursor));

  for (var key in current) {
    if (!deepEqual(current[key], next[key])) {
      return true;
    }
  }
  return false;
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
