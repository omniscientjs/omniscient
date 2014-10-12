var React = require('react');
var shallowEqualImmutable = require('react-immutable-render-mixin/shallowEqualImmutable');
var deepEqual = require('deep-equal');

var ShouldComponentUpdate = {
  shouldComponentUpdate: module.exports.shouldComponentUpdate
};

module.exports = function component (mixins, render) {
  if (typeof mixins === 'function') {
    render = mixins;
    mixins = [];
  }

  if (!Array.isArray(mixins)) {
    mixins = [mixins];
  }

  if (!hasShouldComponentUpdate(mixins)) {
    mixins = [ShouldComponentUpdate].concat(mixins);
  }

  var Component = React.createClass({
    mixins: mixins,
    render: function () {
      return render.call(this, this.props.cursor, this.props.statics);
    }
  });

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
};

module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualCursor = shallowEqualImmutable;
module.exports.isEqualState = deepEqual;

function shouldComponentUpdate (nextProps, nextState) {

  var isEqualState  = module.exports.isEqualState;

  var nextCursors    = guaranteeObject(nextProps.cursor),
      currentCursors = guaranteeObject(this.props.cursor);

  var nextCursorsKeys    = Object.keys(nextCursors);
  var currentCursorsKeys = Object.keys(currentCursors);

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


function guaranteeObject (prop) {
  if (!prop) {
    return {};
  }

  if (isCursor(prop)) {
    return { _dummy_key: prop };
  }

  return prop;
}

function not (fn) {
  return function () {
    return !fn.apply(fn, arguments);
  };
}

function isCursor (potential) {
  return potential && typeof potential.deref === 'function';
}

function hasChangedCursors (current, next) {
  current = filterKeyValue(current, isCursor);
  next    = filterKeyValue(next, isCursor);

  var isEqualCursor = module.exports.isEqualCursor;

  for (var key in current)
    if (!isEqualCursor(current[key].deref(), next[key].deref()))
      return true;
}

function hasChangedProperties (current, next) {
  current = filterKeyValue(current, not(isCursor));
  next    = filterKeyValue(next, not(isCursor));

  for (var key in current)
    if (!deepEqual(current[key], next[key]))
      return true;
}

function hasShouldComponentUpdate (mixins) {
  return !!mixins.filter(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  }).length;
}

function filterKeyValue (object, predicate) {
  var key, filtered = {};
  for (key in object)
    if (predicate(object[key]))
      filtered[key] = object[key];
  return filtered;
}
