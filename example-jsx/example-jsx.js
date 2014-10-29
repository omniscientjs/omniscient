/**
 * @jsx React.DOM
 */

var React = require('react');
    immstruct = require('immstruct');

var component = require('../');

var Clock = component(function (props) {
  var now = props.clock.get('now').toString();
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
  React.render(
    <Clock.jsx clock={structure.cursor('clock')} />,
    $('.example-jsx'));
}
