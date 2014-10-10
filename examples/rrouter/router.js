var React   = require('react'),
    RRouter = require('rrouter'),
    Routes  = RRouter.Routes,
    Route   = RRouter.Route,
    Link    = RRouter.Link;

var d = React.DOM;

var immstruct = require('immstruct'),
    component = require('../../');

// data
var mainData = immstruct({ text: 'Welcome.' });
var aboutData = immstruct({ text: 'Omniscient is awesome.' });

// components
var MainPage = component(function (routeProps) {
  var cursor = routeProps.data.cursor();
  return d.div({},
               Menu(),
               d.text({}, "Main:", cursor.get('text')));
});

var AboutPage = component(function (routeProps) {
  var cursor = routeProps.data.cursor();
  return d.div({},
               Menu(),
               d.text({}, "About:", cursor.get('text')));
});

var Menu = component(function () {
  return d.ul({},
              d.li({}, Link({ to: "/main"  }, "Main")),
              d.li({}, Link({ to: "/about" }, "About")));
});

// routes
var routes = Routes({},
                    Route({ name: 'main', path: '/', view: MainPage, data: mainData }),
                    Route({ name: 'about', path: '/about', view: AboutPage, data: aboutData }));


$ = document.querySelector.bind(document);
var routing = RRouter.start(routes, function (view) {
  React.renderComponent(view, $('.app'));
});

// lister for change and redraw
aboutData.on('render', function () {
  routing.update();
});

// change the data
setTimeout(function () {
  aboutData.cursor().update(function (state) {
    return state.merge({ text: "Omniscient is awesome. No, really." });
  });
}, 2000);

