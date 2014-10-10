var component = require('omniscient'),
    React = require('react');

var d = React.DOM;

var Menu = require('./menu');

module.exports = component(function (routeProps) {
  var cursor = routeProps.data.cursor();
  return d.div({},
               Menu(),
               d.text({}, "About: ", cursor.get('text')));
});

