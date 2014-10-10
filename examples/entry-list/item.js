var React = require('react'),
    component = require('omniscient');

var d = React.DOM;

module.exports = component(function (cursor, statics) {
  function deleteItem (e) {
    e.preventDefault();
    statics.events.emit('delete', cursor);
  }

  return d.article({ key: cursor.get('id') },
    d.span(null, cursor.get('title')),
    " ",
    d.span(null, cursor.get('text')),
    " ",
    d.button({ onClick: deleteItem }, 'Delete')
  );
});
