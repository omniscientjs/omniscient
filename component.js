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
  var isEqualState  = module.exports.isEqualState,
      isEqualCursor = module.exports.isEqualCursor;

  var sharedState     = this.props.statics.shared,
      sharedNextState = nextProps.statics.shared;

  var hasSharedState = (sharedState || sharedNextState);
  var shouldUpdateShared = hasSharedState && (!isEqualState(sharedState, sharedNextState));

  var shouldUpdate = !isEqualCursor(this.props.cursor.deref(), nextProps.cursor.deref()) ||
                     !isEqualState(this.state, nextState);

  return shouldUpdate || shouldUpdateShared;
}
