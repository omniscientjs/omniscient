var React = require('react'),
    component = require('omniscient');

var List = require('./list');

module.exports = component(function (cursor, statics) {
  return React.DOM.div({ key: cursor.get('id') },
    React.DOM.p(null, cursor.get('title')),
    List(cursor.get('items'))
  );
});
