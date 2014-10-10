var Promise = require('promise');

module.exports = function (url) {
  return new Promise(function (resolve, reject) {
    var image = new Image();

    image.addEventListener('error', function (err) {
      reject(err);
    }, false);

    image.addEventListener('load', function () {
      resolve(image);
    }, false);
    
    image.src = url;
  });
};
