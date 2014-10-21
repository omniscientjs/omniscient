var React = require('react');
var deepEqual = require('deep-equal');

module.exports = component;
module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualState = deepEqual;
module.exports.isEqualCursor = function (a, b) { return unCursor(a) === unCursor(b); };
module.exports.isCursor = isCursor;

var debug = function () {};
module.exports.debug = function () {
  debug = console.log.bind(console);
};

function component (displayName, mixins, render) {
  var options = createDefaultArguments(displayName, mixins, render);

  var Component = React.createClass({
    displayName: options.displayName,
    mixins: options.mixins,
    render: function () {
      var statics = mergeStatics(this.props.statics, this.props);
      debug('render():', this.constructor.displayName, this.props.key ? "key:" + this.props.key : "");
      return options.render.call(this, this.props.cursor, statics);
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
}

function toArray (args) {
  return Array.prototype.slice.call(args);
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

function shouldComponentUpdate (nextProps, nextState) {
  debug('shouldComponentUpdate():', this.constructor.displayName, this.props.key ? "key:"+this.props.key : "");

  var isEqualState  = module.exports.isEqualState;

  var nextCursors    = guaranteeObject(nextProps.cursor),
      currentCursors = guaranteeObject(this.props.cursor);

  var nextCursorsKeys    = Object.keys(nextCursors),
      currentCursorsKeys = Object.keys(currentCursors);

  if (currentCursorsKeys.length !== nextCursorsKeys.length) {
    return true;
  }

  function existsInBoth (key) {
    return currentCursors[key] && nextCursors[key];
  }

  var hasDifferentKeys = !currentCursorsKeys.every(existsInBoth);
  if (hasDifferentKeys) {
    return true;
  }

  if (hasChangedCursors(currentCursors, nextCursors)) {
    return true;
  }

  if (!isEqualState(this.state, nextState)) {
    return true;
  }

  if (hasChangedProperties(currentCursors, nextCursors)) {
    return true;
  }

  return false;
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

function guaranteeObject (prop) {
  if (!prop) {
    return {};
  }

  if (isCursor(prop)) {
    return { _dummy_key: prop };
  }

  return prop;
}

function hasShouldComponentUpdate (mixins) {
  return !!mixins.filter(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  }).length;
}

function not (fn) {
  return function () {
    return !fn.apply(fn, arguments);
  };
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

function mergeStatics (statics, props) {
  var key, newStatics = new Object(statics);
  for (key in props)
    if (props.hasOwnProperty(key) &&
      key !== 'statics' &&
      key !== 'cursor')
      newStatics[key] = props[key];
  return newStatics;
}