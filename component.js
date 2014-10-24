var React     = require('react'),
    deepEqual = require('deep-equal');

module.exports = component;
module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualState  = function isEqualState () { return deepEqual.apply(this, arguments); };
module.exports.isEqualCursor = function isEqualCursor (a, b) { return unCursor(a) === unCursor(b); };
module.exports.isCursor = isCursor;

var debug;
module.exports.debug = function (pattern) {
  var regex = new RegExp(pattern || '.*');
  debug = function (str) {
    var key = this.props && this.props.key ? ' key=' + this.props.key : '';
    var name = this.constructor.displayName;
    var tag = name + key;
    if ((key || name) && regex.test(tag)) console.debug('<' + tag + '>: ' + str);
  };
}

function component (displayName, mixins, render) {
  var options = createDefaultArguments(displayName, mixins, render);

  var Component = React.createClass({
    displayName: options.displayName,
    mixins: options.mixins,
    render: function render () {
      if (debug) debug.call(this, 'render');
      return options.render.call(this, this.props.cursor, this.props.statics);
    }
  });

  return function (key, cursor, statics) {
    var children = toArray(arguments).filter(React.isValidComponent);

    if (typeof key === 'object') {
      statics = cursor;
      cursor  = key;
      key     = void 0;
    }

    var props = {
      cursor: cursor,
      statics: statics
    };

    if (key) {
      props.key = key;
    }

    if (!!children.length) {
      props.children = children;
    }

    return Component(props);
  };
};

function shouldComponentUpdate (nextProps, nextState) {
  var isEqualState  = module.exports.isEqualState;

  var nextCursors    = guaranteeObject(nextProps.cursor),
      currentCursors = guaranteeObject(this.props.cursor);

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

function guaranteeObject (prop) {
  if (!prop) {
    return {};
  }

  if (isCursor(prop)) {
    return { _dummy_key: prop };
  }

  return prop;
}

function hasDifferentKeys (currentCursorsKeys, currentCursors, nextCursors) {
  return !currentCursorsKeys.every(function existsInBoth (key) {
    return currentCursors[key] && nextCursors[key];
  });
}

function hasChangedCursors (current, next) {
  current = filterKeyValue(current, isCursor);
  next    = filterKeyValue(next, isCursor);

  var isEqualCursor = module.exports.isEqualCursor;

  for (var key in current)
    if (!isEqualCursor(current[key], next[key]))
      return true;
  return false;
}

function hasChangedProperties (current, next) {
  current = filterKeyValue(current, not(isCursor));
  next    = filterKeyValue(next, not(isCursor));

  for (var key in current)
    if (!deepEqual(current[key], next[key]))
      return true;
  return false;
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
    var ShouldComponentUpdate = {
      shouldComponentUpdate: module.exports.shouldComponentUpdate
    };
    mixins = [ShouldComponentUpdate].concat(mixins);
  }

  return {
    displayName: displayName,
    mixins: mixins,
    render: render
  };
}

function hasShouldComponentUpdate (mixins) {
  return !!mixins.filter(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  }).length;
}

function isCursor (potential) {
  return potential &&
    ((typeof potential.deref === 'function') || (typeof potential.__deref === 'function'));
}

function unCursor(cursor) {
  if (!isCursor(cursor)) {
    return cursor;
  }

  if (typeof cursor.deref === 'function') {
    return cursor.deref();
  }

  return cursor.__deref();
}

function filterKeyValue (object, predicate) {
  var key, filtered = {};
  for (key in object)
    if (predicate(object[key]))
      filtered[key] = object[key];
  return filtered;
}

function not (fn) {
  return function () {
    return !fn.apply(fn, arguments);
  };
}

function toArray (args) {
  return Array.prototype.slice.call(args);
}
