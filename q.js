var React = require('react');

module.exports = function component (fn) {
  var Component = React.createClass({

    render: function () {
      return fn.call(this, this.props.value, this.props.statics);
    },

    shouldComponentUpdate: function (nextProps) {
      return this.props.value != nextProps.value;
    }
  });
  return function (value, statics) {
    return Component({ value: value, statics: statics });
  };
};
