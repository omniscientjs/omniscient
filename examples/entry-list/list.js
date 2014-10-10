var EventEmitter = require("events").EventEmitter,
    React = require('react'),
    component = require('omniscient');

var Item = require('./item');

module.exports = component(function (cursor, statics) {
  var events = new EventEmitter();

  events.on('delete', function (item) {
    cursor.update(function (state) {
      return state.splice(state.indexOf(item), 1);
    });
  });

  var items = cursor.toArray().map(function (item, key) {
    return Item("item-" + key, item, { events: events });
  });

  return React.DOM.section({},
                           items.length ? items
                                        : React.DOM.span({}, "No more posts."));
});

