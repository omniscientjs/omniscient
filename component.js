var React = require('react');

module.exports = function component (mixins, render) {
  if (typeof mixins === 'function') {
    render = mixins;
    mixins = [];
  }

  if (!Array.isArray(mixins)) {
    mixins = [mixins];
  }

  var Component = React.createClass({
    mixins: mixins,

    render: function () {
      return render.call(this, this.props.cursor, this.props.statics);
    },

    shouldComponentUpdate: function (nextProps) {
      return this.props.cursor != nextProps.cursor;
    }
  });

  return function (cursor, statics) {
    return Component({ cursor: cursor, statics: statics });
  };
};
