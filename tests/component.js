var chai = require('chai');
var jsdom = require('jsdom');
var React  = require("react/addons"),
    ReactTestUtils = React.addons.TestUtils;

chai.should();

var component = require('../');


describe('component', function () {

  describe('mixins', function () {

    it('should take mixins', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];

      var Component = component(mixins, function () {
        this.should.have.property('myMixin');
        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should set React key', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];

      var Component = component(mixins, function () {
        this.props.should.have.property('key');
        this.props.key.should.equal('myKey');
        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey'));
    });

    it('should have overridable shouldComponentUpdate in mixin', function (done) {
      var shouldUpdate = function (nextProps) { return true; };
      var mixins = [{ componentDidMount: done, shouldComponentUpdate: shouldUpdate }];

      var Component = component(mixins, function () {
        this.shouldComponentUpdate.should.equal(shouldUpdate);
        return React.DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });
  });

  describe("render function arguments", function () {

    it('should handle no arguments', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var Component = component(mixins, function () {
        arguments.length.should.equal(0);
        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should pass single cursor and statics', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var cursor = {};
      var statics = {};

      var Component = component(mixins, function (cursorarg, staticsarg) {
        cursorarg.should.equal(cursor);
        staticsarg.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component(cursor, statics));
    });

    it('should pass multiple cursors and statics', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};
      var statics = {};

      var Component = component(mixins, function (cursor1arg, cursor2arg, staticarg) {
        cursor1arg.should.equal(cursor1);
        cursor2arg.should.equal(cursor2);
        staticarg.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });
      render(Component([cursor1, cursor2], statics));
    });
  });

  describe('exposes arguments as props', function () {

    it('should expose single cursor and statics', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor = {};
      var statics = {};

      var Component = component(mixins, function () {
        this.props.cursor.should.equal(cursor);
        this.props.statics.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });
      render(Component(cursor, statics));
    });

    it('should expose multiple cursors', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};
      var statics = {};

      var Component = component(mixins, function () {
        this.props.cursors[0].should.equal(cursor1);
        this.props.cursors[1].should.equal(cursor2);
        this.props.statics.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component([cursor1, cursor2], statics));
    });
  });

  beforeEach(function() {
    global.document = jsdom.jsdom('<html><body></body></html>');
    global.window = global.document.parentWindow;
  });

  afterEach(function() {
    delete global.document;
    delete global.window;
  });
});

function noop () {}

function render (component) {
  ReactTestUtils.renderIntoDocument(component);
}
