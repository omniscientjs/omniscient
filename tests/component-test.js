var chai = require('chai');
var jsdom = require('jsdom');

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var should = chai.should();

var component = require('../');

describe('component', function () {

  describe('arguments', function () {

    it('should take displayName', function (done) {
      var mixins = [{ componentDidMount: done }];
      var Component = component('myComponent', mixins, function () {
        this.constructor.should.have.property('displayName');
        this.constructor.displayName.should.equal('myComponent');

        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

  });

  describe('mixins', function () {

    it('should take mixins', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];

      var Component = component(mixins, function () {
        this.should.have.property('myMixin');
        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should have overridable shouldComponentUpdate in mixin', function (done) {
      var shouldUpdate = function (nextProps) { return true; };
      var mixins = [{ componentDidMount: done, shouldComponentUpdate: shouldUpdate }];

      var Component = component(mixins, function () {
        this.shouldComponentUpdate.should.equal(shouldUpdate);
        return React.DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });
  });

  describe('render function arguments', function () {

    it('should handle no arguments', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var Component = component(mixins, function (cursor, statics) {
        should.not.exist(cursor);
        should.not.exist(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should pass single cursor and statics', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var cursor1 = {};
      var statics = {};

      var Component = component(mixins, function (cursor, staticsarg) {
        cursor.should.equal(cursor1);
        staticsarg.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component(cursor1, statics));
    });

    it('should set React key', function (done) {
      var mixins = [{ componentDidMount: done }];

      var Component = component(mixins, function () {
        this._currentElement.key.should.equal('myKey');
        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey'));
    });

    it('should get passed key and cursor-objects', function (done) {
      var mixins = [{ componentDidMount: done }];

      var Component = component(mixins, function (data) {
        this._currentElement.key.should.equal('myKey');

        data.should.have.property('foo');
        data.foo.should.equal('hello');
        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', { foo: 'hello' }));
    });

    it('should get passed key, cursor-objects and statics', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };
      var outerStatics = { myStatic: 'foo' };

      var Component = component(mixins, function (cursor, statics) {
        this._currentElement.key.should.equal('myKey');

        cursor.should.equal(outerCursor);
        statics.should.equal(outerStatics);

        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor, outerStatics));
    });

    it('should get passed cursor-object and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var c1 = React.DOM.text(null, 'hello');
      var c2 = React.DOM.text(null, 'bar');

      var Component = component(mixins, function (cursor) {
        cursor.should.equal(outerCursor);
        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1);
        this.props.children[1].should.equal(c2);

        return React.DOM.text(null, 'hello');
      });

      render(Component(outerCursor, c1, c2));
    });

    it('should get passed key, cursor-object and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var Component = component(mixins, function (cursor) {
        this._currentElement.key.should.equal('myKey');

        cursor.should.equal(outerCursor);
        this.props.children.should.have.length(1);
        this.props.children[0]._store.props.children.should.equal('hello');

        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor, React.DOM.text(null, 'hello')));
    });

    it('should get passed key, cursor-object, statics and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };
      var outerStatics = { myStatic: 'foo' };

      var Component = component(mixins, function (cursor, statics) {
        this._currentElement.key.should.equal('myKey');

        cursor.should.equal(outerCursor);
        this.props.children.should.have.length(1);
        this.props.children[0]._store.props.children.should.equal('hello');

        statics.should.equal(outerStatics);

        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor, outerStatics, React.DOM.text(null, 'hello')));
    });

    it('should get passed cursor-object, statics and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };
      var outerStatics = { myStatic: 'foo' };

      var Component = component(mixins, function (cursor, statics) {
        cursor.should.equal(outerCursor);
        this.props.children.should.have.length(1);
        this.props.children[0]._store.props.children.should.equal('hello');

        statics.should.equal(outerStatics);

        return React.DOM.text(null, 'hello');
      });

      render(Component(outerCursor, outerStatics, React.DOM.text(null, 'hello')));
    });

    it('should pass multiple cursors and statics', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};
      var statics = {};

      var Component = component(mixins, function (cursor, staticarg) {
        cursor.one.should.equal(cursor1);
        cursor.two.should.equal(cursor2);
        staticarg.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });
      render(Component({ one: cursor1, two: cursor2 }, statics));
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
        this.props.cursor.one.should.equal(cursor1);
        this.props.cursor.two.should.equal(cursor2);
        this.props.statics.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component({ one: cursor1, two: cursor2 }, statics));
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

function noop () {}

function render (component) {
  ReactTestUtils.renderIntoDocument(component);
}
