var React = require('react');
var immstruct = require('immstruct');
var component = require('omniscient');
var EventEmitter = require('events').EventEmitter;

var data = JSON.parse(require('fs').readFileSync(__dirname + '/../sourceData.json', 'utf-8'));
var structure = immstruct('reactions', data);

var PhotoBooth = require('./components/photobooth');
var setPropsMixin = require('immstruct/mixins/setProps');

var members = {
  handleSubmit: function (e) {
    e.preventDefault();
    this.setProps({ isInAddMode: true });
  },

  handleClose: function () {
    this.setProps({ isInAddMode: false });
  }
};

var mixins = [members, setPropsMixin];
var ReactionBox = component(mixins, function (cursor) {
  var hiddenClass = cursor.get('isInAddMode') ? 'hidden' : '';

  var events = new EventEmitter();
  events.on('close', this.handleClose);

  var statics = {
    shared: { isInAddMode: cursor.get('isInAddMode') },
    events: events
  };

  return (
    React.DOM.div({ className: 'container' },
      React.DOM.h1(null, 'Reactions'),
      PhotoBooth(cursor.get('pb'), statics),
      React.DOM.button({ onClick: this.handleSubmit, className: 'btn-start ' + hiddenClass }, 'Try Your Reaction')
    )
  );
});

var body = document.querySelector('body');
function render () {
  console.log('Render');
  React.renderComponent(ReactionBox(structure.cursor(['app'])), body);
}

render();
structure.on('render', render);
