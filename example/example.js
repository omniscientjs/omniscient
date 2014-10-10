var React     = require('react'),
    component = require('omniscient'),
    immstruct = require('immstruct'),
    Immutable = require('immutable');

var d = React.DOM;

var data = immstruct({ numbers: {} });

var Bucket = component(function (cursor, statics) {
  var numbers = cursor.toArray();
  return d.li({},
              numbers.reduce(function (acc, n) {
                return acc + 1;
              }, 0),
              ": ",
              numbers.map(function (number, key) {
                return number;
              }));
});

var Buckets = component(function (cursor) {
  return d.ul({},
              cursor.toArray().map(function (number, i) {
                return Bucket("bucket-" + i, number);
              }));
});

function render () {
  React.renderComponent(
    Buckets(data.cursor('numbers')),
    document.querySelector('.example'));
}

render();
data.on('swap', render);

setInterval(function () {
  var bucket = parseInt(Math.random() * 5);
  var number = parseInt(Math.random() * 10);
  console.log('bucket', bucket, 'number', number);

  data.cursor(['numbers', bucket]).update(function (state) {
    if (!state) {
      return Immutable.Vector(number);
    }
    return state.unshift(number);
  });
}, 50);
