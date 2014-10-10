
var EventEmitter = require('events').EventEmitter;
var cameraEvent = module.exports = new EventEmitter();
var gifshot = require('gifshot');

var cameraStream = void 0;

module.exports.capture = function (seconds) {
  seconds = seconds || 5, isStarted = false;
  var frames = seconds * 10;

  gifshot.createGIF({
    gifWidth: 400,
    gifHeight: 400,

    keepCameraOn: true,
    cameraStream: cameraStream,
    numFrames: frames,

    progressCallback: function () {
      if (!isStarted) {
        cameraEvent.emit('start');
      }
      isStarted = true;
    }
  }, function(obj) {
    if (obj.error) return cameraEvent.emit('error', obj.error);

    cameraStream = obj.cameraStream;
    cameraEvent.emit('image', obj.image);
  });
};
