var component = require('omniscient'),
    React = require('react'),
    RRouter = require('rrouter');

var Link = RRouter.Link,
    d = React.DOM;

module.exports = component(function () {
  return d.ul({},
              d.li({}, Link({ to: "/main"  }, "Main")),
              d.li({}, Link({ to: "/about" }, "About")));
});

