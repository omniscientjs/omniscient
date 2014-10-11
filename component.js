var React = require('react');
var shallowEqualImmutable = require('react-immutable-render-mixin/shallowEqualImmutable');

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
    var props = { cursor: cursor, statics: statics };
    if (key) {
      props.key = key;
    }
    return Component(props);
  };
};

module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualCursor = shallowEqualImmutable;
module.exports.isEqualState = shallowEqualImmutable;

function shouldComponentUpdate (nextProps, nextState) {
  var isEqualState  = module.exports.isEqualState;

  var nextCursors    = guaranteeArray(nextProps.cursor),
      currentCursors = guaranteeArray(this.props.cursor);

  // Easiest check.
  if (nextCursor.length !== currentCursor.length) {
    return true;
  }

  if (hasCursorsChanged(currentCursors, nextCursors)) {
    return true;
  }

  if (!isEqualState(this.state, nextState)) {
    return true;
  }

  if (hasPropertiesChanged(currentCursors, nextCursors)) {
    return true;
  }

  return false;
}


function guaranteeArray (prop) {
  if (!Array.isArray(prop)) {
    prop = [prop];
  }
  return prop;
}

function not (fn) {
  return function () {
    return !fn.apply(fn, arguments);
  };
}

function isCursor (potential) {
  return !!potential.deref;
}

function deepEqual (current, next) {
  return true;
}

function hasCursorsChanged (current, next) {
  var isEqualCursor = module.exports.isEqualCursor;

  current = current.filter(isCursor);
  next    = next.filter(isCursor);

  return !current.filter(isCursor).every(function (curr, i) {
    if (!next[i]) {
      return false;
    }

    return !isEqualCursor(curr.deref(), next[i].deref());
  });
}

function hasPropertiesChanged (current, next) {
  current = current.filter(not(isCursor));
  next    = next.filter(not(isCursor));

  return !current.filter(isCursor).every(function (curr, i) {
    if (!next[i]) {
      return false;
    }

    return !isDeepEqual(curr, next[i]);
  });
}

function hasShouldComponentUpdate (mixins) {
  return !!mixins.filter(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  }).length;
}
