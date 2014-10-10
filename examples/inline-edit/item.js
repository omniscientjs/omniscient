var component = require('omniscient');
var React = require('react');
var d = React.DOM;

var Editable = require('./editable');

module.exports = component(function (cursor) {
  return d.li({}, Editable(cursor));
});

