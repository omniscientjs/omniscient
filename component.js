var React = require('react');
var Immutable = require('immutable');
var shallowEqualImmutable = require('react-immutable-render-mixin/shallowEqualImmutable');

var ShouldComponentUpdate = {
  shouldComponentUpdate: module.exports.shouldComponentUpdate
};

module.exports = function component (mixins, render) {
  if (typeof mixins === 'function') {
    render = mixins;
    mixins = [];
  }

  var Component = React.createClass({
    mixins: [ShouldComponentUpdate].concat(mixins),

    getInitialState: function () { return {}; },

    render: function () {
      return render.call(this, this.props.cursor, this.props.statics);
    }
  });

  return function (cursor, statics) {
    return Component({ cursor: cursor, statics: statics });
  };
};

module.exports.shouldComponentUpdate = shouldComponentUpdate;
module.exports.isEqualCursor = shallowEqualImmutable;
module.exports.isEqualState = shallowEqualImmutable;

function shouldComponentUpdate (nextProps, nextState) {
  var shouldUpdate = !module.exports.isEqualCursor(this.props.cursor.deref(), nextProps.cursor.deref()) ||
                     !module.exports.isEqualState(this.state, nextState);
  return shouldUpdate;
}
