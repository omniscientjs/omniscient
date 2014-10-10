var React = require('react');
var component = require('omniescent');
var setPropsMixin = require('immstruct/mixins/setProps');


var ImageComponent = require('./image');
var preload = require('../../lib/preloadImage');
var camera = require('../../lib/camera');
var randomImage = require('../../lib/randomImage');

var captureTime = 3;

var StartIndicator = component(function (cursor){
  var message = cursor.get('isRunning') ? 'Camera Recording' : '';
  return React.DOM.h3(null, message);
});

var Reaction = component(function (cursor){
  var src = cursor.get('gif');
  var className = src ? '' : 'hidden';

  return React.DOM.div({ className: 'gif-container'},
    React.DOM.img({ src: src, className: className })
  );
});

var members = {
  componentDidMount: function () {
    camera.on('start', this.handleStart);
    camera.on('image', this.handleImage);
  },

  handleStart: function () {
    this.setProps({ isRunning: true });
    setTimeout(this.showImage, 1000);
  },

  setImage: function (obj) {
    this.props.cursor.get('ic').update(function (state) {
      return state.merge(obj);
    });
  },

  showImage: function () {
    this.setImage({ 'showImage': true });
  },

  handleImage: function (gif) {
    this.setProps({
      gif: gif,
      isRunning: false
    });
  },

  close: function (e) {
    e.preventDefault();
    this.props.statics.events.emit('close');
  },

  handleSubmit: function(e) {
    e.preventDefault();
    preload(randomImage())
      .then(function (image) {
        this.setImage({
          showImage: false,
          image: image.src
        });
        camera.capture(this.captureTime);
      }.bind(this));
  }
};

var mixins = [members, setPropsMixin];
module.exports = component(mixins, function (cursor, statics) {
  var hiddenClass = statics.shared.isInAddMode ? '' : 'hidden';

  return (
    React.DOM.div({ className: 'photobooth'},
      React.DOM.button({ onClick: this.close, className: 'btn-close ' + hiddenClass }, 'Close'),

      ImageComponent(cursor.get('ic')),
      Reaction(cursor),

      React.DOM.button({ onClick: this.handleSubmit, className: 'btn-record ' + hiddenClass }, 'Start'),

      StartIndicator(cursor)
    )
  );
});
