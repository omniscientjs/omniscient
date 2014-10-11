var chai = require('chai');
var jsdom = require('jsdom');
var React  = require("react/addons"),
    ReactTestUtils = React.addons.TestUtils;

chai.should();

var component = require('../');


describe('component', function () {

  describe('mixins', function () {

    beforeEach(function() {
      global.document = jsdom.jsdom('<html><body></body></html>');
      global.window = global.document.parentWindow;
    });

    afterEach(function() {
      delete global.document;
      delete global.window;
    });

    it('should be able to take mixins', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var Component = component(mixins, function () {
        this.should.have.property('myMixin');
        return React.DOM.text(null, 'hello');
      });

      ReactTestUtils.renderIntoDocument(Component());
    });

    it('should be able to set a React key', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var Component = component(mixins, function () {
        this.props.should.have.property('key');
        this.props.key.should.equal('myKey');
        return React.DOM.text(null, 'hello');
      });

      ReactTestUtils.renderIntoDocument(Component('myKey'));
    });

    it('should be able to set a statics', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var Component = component(mixins, function (cursor, statics) {
        statics.should.have.property('foo');
        statics.foo.should.equal('hello');
        return React.DOM.text(null, 'hello');
      });

      ReactTestUtils.renderIntoDocument(Component({ }, { foo: 'hello' }));
    });

    it('should be able to override shouldComponentUpdate', function (done) {
      var shouldUpdate = function (nextProps) {  };
      var mixins = [{
        componentDidMount: done,
        shouldComponentUpdate: shouldUpdate
      }];
      var Component = component(mixins, function () {
        this.shouldComponentUpdate.should.equal(shouldUpdate);
        return React.DOM.text(null, 'hello');
      });

      ReactTestUtils.renderIntoDocument(Component({ foo: 'hello' }));
    });

  });
});

function noop () {}
