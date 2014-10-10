module.exports = function (el) {

  var immstruct = require('immstruct');
      React     = require('react');

  var List = require('./list');

  var data = immstruct({
    items: [
      { text: 'one'   },
      { text: 'two'   },
      { text: 'three' }
    ]
  });

  data.on('swap', render);
  render();

  function render () {
    React.renderComponent(List(data.cursor('items')), el);
  }
};
