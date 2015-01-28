var jsdom = require('jsdom');

var chai = require('chai');
chai.should();

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var component = require('../');
var shouldComponentUpdate = require('../shouldupdate');

describe('debug', function () {
  describe('api', function () {
    it('should expose debug function on component', function () {
      component.should.have.property('debug');
      component.withDefaults().should.have.property('debug');
    });

    it('should expose debug function on shouldupdate', function () {
      shouldComponentUpdate.debug.should.be.a('function');
      shouldComponentUpdate.withDefaults().debug.should.be.a('function');
    });

    it('should expose debug function on shouldupdate from component', function () {
      component.shouldComponentUpdate.debug.should.be.a('function');
      component.withDefaults().shouldComponentUpdate.debug.should.be.a('function');
      component.withDefaults().shouldComponentUpdate.debug.should.be.a('function');
    });
  });

  describe('debugger', function () {

    beforeEach(function () {
      this.original = console.debug;
    });

    afterEach(function () {
      console.debug = this.original;
    });

    it('should log on render when debug with displayname', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('DisplayName');
        done();
      });

      var Component = localComp('DisplayName', function () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

    it('should log on render when debug with key', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('foobar');
        done();
      });

      var Component = localComp(function () {
        return React.DOM.text('hello');
      });
      render(Component({ key: 'foobar' }));
    });

    it('should not log on render no display name or key', function () {
      var localComp = component.withDefaults();
      localComp.debug(function logger () {
        "foo".should.equal("bar");
      });

      var Component = localComp(function () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

  });

  beforeEach(function () {
    global.document = jsdom.jsdom('<html><body></body></html>');
    global.window = global.document.parentWindow;
  });

  afterEach(function () {
    delete global.document;
    delete global.window;
  });
});

function render (component) {
  ReactTestUtils.renderIntoDocument(component);
}
