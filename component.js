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
      return render.apply(this, this.props.cursors.concat(this.props.statics));
    }
  });

  return function (key, cursor, statics) {
    if (typeof key === 'object') {
      statics = cursor;
      cursor  = key;
      key     = void 0;
    }

    var hasMultipleCursors = Array.isArray(cursor);

    var firstCursor;
    if (hasMultipleCursors) {
      firstCursor = cursor[0];
    }
    else {
      firstCursor = cursor;
    }

    var props = { cursor: firstCursor, statics: statics };

    if (key) {
      props.key = key;
    }

    if (hasMultipleCursors) {
      props.cursors = cursor;
    }
    else {
      props.cursors = [firstCursor];
    }

    return Component(props);
  };
};

module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualCursor = shallowEqualImmutable;
module.exports.isEqualState = deepEqual;

function shouldComponentUpdate (nextProps, nextState) {

  var isEqualState  = module.exports.isEqualState;

  var nextCursors    = guaranteeArray(nextProps.cursor),
      currentCursors = guaranteeArray(this.props.cursor);

  if (nextCursors.length !== nextCursors.length) {
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


function guaranteeArray (prop) {
  if (!prop) {
    return [];
  }

  if (!Array.isArray(prop)) {
    return [prop];
  }

  return prop;
}

function not (fn) {
  return function () {
    return !fn.apply(fn, arguments);
  };
}

function isCursor (potential) {
  return potential && !!potential.deref;
}

function hasChangedCursors (current, next) {
  var isEqualCursor = module.exports.isEqualCursor;

  current = current.filter(isCursor);
  next    = next.filter(isCursor);

  return !current.every(cursorIsEqual);

  function cursorIsEqual (curr, i) {
    if (!next[i]) {
      return false;
    }
    return isEqualCursor(curr.deref(), next[i].deref());
  }
}

function hasChangedProperties (current, next) {
  current = current.filter(not(isCursor));
  next    = next.filter(not(isCursor));

  return !current.every(propertyIsEqual);

  function propertyIsEqual (curr, i) {
    if (!next[i]) {
      return false;
    }
    return deepEqual(curr, next[i]);
  }
}

function hasShouldComponentUpdate (mixins) {
  return !!mixins.filter(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  }).length;
}
