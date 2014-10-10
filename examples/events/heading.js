var React = require('react'),
    component = require('omniscient');

module.exports = component(function (data, statics) {
  function onClick () {
    statics.events.emit('event', new Date());
  }
  return React.DOM.text({ onClick: onClick }, data.text);
});
