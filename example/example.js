var React     = require('react'),
    component = require('../'),
    immstruct = require('immstruct'),
    Immutable = require('immutable');

component.debug();

var d = React.DOM;

var data = immstruct({ numbers: {} });

var Bucket = component("Bucket", function (cursor, statics) {
  var numbers = cursor.toArray();
  return d.li({},
              d.b({}, "Bucket #", statics.label, " "),
              d.span({}, "(", numbers.reduce(function (acc, n) {
                return acc + 1;
              }, 0), ")"),
              ": ",
              numbers.map(function (number, key) {
                return number;
              }));
});

var Buckets = component("Buckets", function (cursor) {
  var labels = Object.keys(cursor.toJS());
  return d.ul({},
              cursor.toArray().map(function (number, i) {
                return Bucket("bucket-" + i, number, { label: labels[i] });
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
  var bucket = parseInt(Math.random() * 30);
  var number = parseInt(Math.random() * 10);

  data.cursor(['numbers', bucket]).update(function (state) {
    if (!state) {
      return Immutable.Vector(number);
    }
    return state.unshift(number);
  });
}, 1000);
