var React = require('react');
var component = require('omniscient');
var d = React.DOM;

var FocusingInput = require('./focusing-input');

var EditMixin = {

  getInitialState: function () {
    return {};
  },

  onEdit: function onEdit () {
    this.setState({ editing: true });
  },

  onSubmit: function onSubmit (e) {
    e.preventDefault();
    this.setState({ editing: false });
  },

  onChange: function onChange (e) {
    this.props.cursor.update(function (state) {
      return state.merge({ text: e.currentTarget.value });
    });
  }
};

module.exports = component(EditMixin, function (cursor) {
  if (this.state.editing) {
    return d.form({ onSubmit: this.onSubmit },
                  FocusingInput(cursor, { onChange: this.onChange }),
                  d.button({}, 'doit'));
  }
  return d.span({ onClick: this.onEdit }, cursor.get('text'));
});
