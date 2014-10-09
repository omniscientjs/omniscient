var React = require('react');

module.exports = function component (fn) {
  var Component = React.createClass({

    render: function () {
      return fn.call(this, this.props.cursor, this.props.statics);
    },

    shouldComponentUpdate: function (nextProps) {
      return this.props.cursor != nextProps.cursor;
    }
  });

  return function (cursor, statics) {
    return Component({ cursor: cursor, statics: statics });
  };
};
