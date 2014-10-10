var React = require('react');
var component = require('omniscient');

module.exports = component(function (cursor, statics) {
  var src = cursor.get('image');
  var hidden = !cursor.get('showImage') ? 'hidden' : '';

  return  React.DOM.div({ className: 'image-container' },
    React.DOM.img({ src: src, className: hidden})
  );
});
