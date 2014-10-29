/**
 * @jsx React.DOM
 */

var React = require('react');
    immstruct = require('immstruct');

var component = require('../');

var Clock = component(function (cursors) {
  var now = cursors.clock.get('now').toString();
  return <p>Today is {now}</p>;
});

var structure = immstruct({ clock: { now: new Date() } });

setInterval(function () {
  structure.cursor('clock').update('now', function () {
    return new Date();
  });
}, 1000);

$ = document.querySelector.bind(document);

render();
structure.on('swap', render);

function render () {
  React.renderComponent(
    <Clock clock={structure.cursor('clock')} />,
    $('.example-jsx'));
}
