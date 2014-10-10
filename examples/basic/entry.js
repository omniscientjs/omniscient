var EventEmitter = require("events").EventEmitter;
var React = require('react');

var component = require('../../component');

var Heading = component(function (data, statics) {
  function onClick () {
    statics.events.emit('something', 'someone clicked me');
  }

  var deleteButton = React.DOM.text({ onClick: onClick }, 'x');
  return React.DOM.text({},
                        data.text,
                        " ",
                        deleteButton);
});

var headingEvents = new EventEmitter();
var h = Heading({ text: 'some text' }, { events: headingEvents });
headingEvents.on('something', function () {
  console.log('got something', h);
});

$ = document.querySelector.bind(document);
React.renderComponent(h, $('.app'));
