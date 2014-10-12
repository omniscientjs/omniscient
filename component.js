var React = require('react');
var deepEqual = require('deep-equal');

module.exports = component;
module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualCursor = function (a, b) { return a === b; };
module.exports.isEqualState = deepEqual;

var debug = function () {};
module.exports.debug = function () {
  debug = console.log.bind(console);
};

var ShouldComponentUpdate = {
  shouldComponentUpdate: module.exports.shouldComponentUpdate
};

function component (name, mixins, render) {
  // signature: render
  if (typeof name === 'function') {
    render = name;
    mixins = [];
  }
  // signature: name, render
  if (typeof name === 'string' && typeof mixins === 'function') {
    render = mixins;
    mixins = [];
  }
  // signature: mixins, render
  if (Array.isArray(name) && typeof mixins === 'function') {
    render = mixins;
    mixins = name;
  }

  if (!Array.isArray(mixins)) {
    mixins = [mixins];
  }

  if (!hasShouldComponentUpdate(mixins)) {
    mixins = [ShouldComponentUpdate].concat(mixins);
  }

  var proto = {
    mixins: mixins,
    render: function () {
      debug('render():', this.name, this.props.key ? "key:"+this.props.key : "");
      return render.call(this, this.props.cursor, this.props.statics);
    }
  };

  if (name) {
    proto.name = name;
  }

  var Component = React.createClass(proto);

  return function (key, cursor, statics) {
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

    return Component(props);
  };
}

function shouldComponentUpdate (nextProps, nextState) {
    debug('shouldComponentUpdate():', this.name, this.props.key ? "key:"+this.props.key : "");

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
    if (!isEqualCursor(current[key].deref(), next[key].deref()))
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
  return potential && typeof potential.deref === 'function';
}

function filterKeyValue (object, predicate) {
  var key, filtered = {};
  for (key in object)
    if (predicate(object[key]))
      filtered[key] = object[key];
  return filtered;
}
