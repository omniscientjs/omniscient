var React = require('react');
var immstruct = require('immstruct');
var component = require('../../');

var EventEmitter = require('events').EventEmitter;

var structure = immstruct({
  id: 'foo',
  title: 'Hello, World!',

  items: {
    '1': { id: '1', title: 'Post #1', text: 'Foo bar baz'},
    '2': { id: '2', title: 'Post #2', text: 'Foo bar baz'},
    '3': { id: '3', title: 'Post #3', text: 'Foo bar baz'},
    '4': { id: '4', title: 'Post #4', text: 'Foo bar baz'}
  }
});

var Item = component(function (cursor, statics) {
  function deleteItem (e) {
    e.preventDefault();
    statics.events.emit('delete', cursor.get('id'));
  }

  return React.DOM.article({ key: cursor.get('id') },
    React.DOM.h1(null, cursor.get('title')),
    React.DOM.p(null, cursor.get('text')),
    React.DOM.button({ onClick: deleteItem }, 'Delete')
  );
});

var List = component(function (cursor, statics) {
  var events = new EventEmitter();

  events.on('delete', function (itemId) {
    cursor.remove(itemId);
  });

  var items = cursor.toArray().map(function (item) {
    return Item(item, { events: events });
  });

  return React.DOM.section(null, items);
});

var App = component(function (cursor, statics) {
  return React.DOM.div({ key: cursor.get('id') },
    React.DOM.h1(null, cursor.get('title')),
    List(cursor.get('items'))
  );
});

var body = document.querySelector('body');
function render () {
  console.log('Render');
  React.renderComponent(App(structure.cursor()), body);
}

render();
structure.on('render', render);
