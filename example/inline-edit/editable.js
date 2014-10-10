var React = require('react');
var component = require('../../component');
var d = React.DOM;

var EditMixin = {
  onEdit: function onEdit () {
    this.setState({ editing: true });
  },

  onChange: function onChange (e) {
    this.props.cursor.update(function (state) {
      return state.merge({ text: e.currentTarget.value });
    });
  },

  onSubmit: function onSubmit (e) {
    e.preventDefault();
    this.setState({ editing: false });
  }
};

var Editable = module.exports = component(EditMixin, function (cursor) {
  if (this.state.editing) {
    return d.li({},
                d.form({ onSubmit: this.onSubmit },
                  d.input({ value: cursor.get('text'), onChange: this.onChange }),
                  d.button({}, 'doit')));
  }
  return d.li({ onClick: this.onEdit }, cursor.get('text'));
});
