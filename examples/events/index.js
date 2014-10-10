var EventEmitter = require("events").EventEmitter,
    React = require('react'),
    component = require('omniscient');

module.exports = function (el) {

  var Heading = require('./heading');

  var events = new EventEmitter();
  events.on('event', function (data) {
    console.log('Event!', data);
  });

  var h = Heading({ text: 'Click me, I fire events.' }, { events: events });
  React.renderComponent(h, el);
};
