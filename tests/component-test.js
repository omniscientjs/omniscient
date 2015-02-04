var chai = require('chai');
var jsdom = require('jsdom');
var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var should = chai.should();

var component = require('../');
var shouldUpdateMixin = require('../shouldupdate');

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

    it('should set displayName from render function name', function (done) {
      var mixins = [{ componentDidMount: done }];
      var Component = component(mixins, function MyComponentName () {
        this.constructor.should.have.property('displayName');
        this.constructor.displayName.should.equal('MyComponentName');

        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

  });

  describe('statics', function () {

    it('should take static methods', function () {
      var mixins = [{ statics: { foo: noop, bar: noop } }];

      var Component = component(mixins, function () {
        return React.DOM.text(null, 'hello');
      });

      Component.foo.should.be.a('function');
      Component.jsx.foo.should.be.a('function');
      Component.bar.should.be.a('function');
      Component.jsx.bar.should.be.a('function');
    });

    it('should take static methods from several mixins', function () {
      var mixins = [{ statics: { foo: noop } }, { statics: { bar: noop } }];

      var Component = component(mixins, function () {
        return React.DOM.text(null, 'hello');
      });

      Component.foo.should.be.a('function');
      Component.jsx.foo.should.be.a('function');
      Component.bar.should.be.a('function');
      Component.jsx.bar.should.be.a('function');
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

    it('should take single object as mixin', function (done) {
      var mixins = { componentDidMount: done, myMixin: noop };

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

    it('should allow shouldComponentUpdate as mixin to vanilla React', function (done) {
      var mixins = [{
        shouldComponentUpdate: shouldUpdateMixin
      }];

      var Component = React.createClass({
        mixins: mixins,
        render: function () {
          this.shouldComponentUpdate.should.equal(shouldUpdateMixin);
          done();
          return React.DOM.text(null, 'hello');
        }
      });

      render(React.createElement(Component, { foo: 'hello' }));
    });
  });

  describe('render function arguments', function () {

    it('should handle no arguments', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var Component = component(mixins, function (cursor, statics) {
        cursor.should.eql({});
        should.not.exist(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should pass single cursor', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var cursor1 = { cursor: {} };
      var statics = {};

      var Component = component(mixins, function (props) {
        props.should.eql(cursor1);
        return React.DOM.text(null, 'hello');
      });

      render(Component(cursor1));
    });

    it('should pass and expose single immutable cursor', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        cursor.should.equal(cursorInput);
        this.props[component.cursor].should.equal(cursorInput);
        return React.DOM.text(null, 'hello');
      });
      render(Component(cursorInput));
    });

    it('should pass single cursor and statics', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var input = { cursor: 'foo', statics: 'Hello' };
      var Component = component(mixins, function (cursor, staticsarg) {
        cursor.should.eql(input);
        staticsarg.should.equal(input.statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component(input));
    });

    it('should set React key', function (done) {
      var mixins = [{ componentDidMount: done }];

      var Component = component(mixins, function () {
        hasKey(this, 'myKey');
        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey'));
    });

    it('should get passed key and cursor-objects', function (done) {
      var mixins = [{ componentDidMount: done }];

      var Component = component(mixins, function (data) {
        hasKey(this, 'myKey');

        data.should.have.property('foo');
        data.foo.should.equal('hello');
        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', { foo: 'hello' }));
    });

    it('should get passed key and immutable cursor-objects', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        hasKey(this, 'myKey');

        cursor.should.equal(cursorInput);
        this.props[component.cursor].should.equal(cursorInput);
        return React.DOM.text(null, 'hello');
      });
      render(Component('myKey', cursorInput));
    });

    it('should get passed key, cursor-objects and statics', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { cursor: 'hello', statics: 'foo' };

      var Component = component(mixins, function (props, statics) {
        hasKey(this, 'myKey');

        props.cursor.should.equal(outerCursor.cursor);
        statics.should.equal(outerCursor.statics);

        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor));
    });

    it('should get passed cursor-object and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var c1 = React.DOM.text(null, 'hello');
      var c2 = React.DOM.text(null, 'bar');

      var Component = component(mixins, function (cursor) {
        cursor.foo.should.equal(cursor.foo);
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
        hasKey(this, 'myKey');

        cursor.foo.should.equal(outerCursor.foo);
        this.props.children.should.have.length(1);
        this.props.children[0]._store.props.children.should.equal('hello');

        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor, React.DOM.text(null, 'hello')));
    });

    it('should get passed key, cursor-object, statics and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello', statics: 'foo' };

      var Component = component(mixins, function (cursor, statics) {
        hasKey(this, 'myKey');

        cursor.foo.should.equal(outerCursor.foo);
        this.props.children.should.have.length(1);
        this.props.children[0]._store.props.children.should.equal('hello');

        statics.should.equal(outerCursor.statics);

        return React.DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor, React.DOM.text(null, 'hello')));
    });

    it('should get passed cursor-object, statics and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello', statics: 'foo' };

      var Component = component(mixins, function (cursor, statics) {
        cursor.foo.should.equal(outerCursor.foo);
        this.props.children.should.have.length(1);
        this.props.children[0]._store.props.children.should.equal('hello');

        statics.should.equal(outerCursor.statics);

        return React.DOM.text(null, 'hello');
      });

      render(Component(outerCursor, React.DOM.text(null, 'hello')));
    });

    it('should pass multiple cursors and statics', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};
      var statics = 'foo';

      var Component = component(mixins, function (cursor, staticarg) {
        cursor.one.should.equal(cursor1);
        cursor.two.should.equal(cursor2);
        staticarg.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });
      render(Component({ one: cursor1, two: cursor2, statics: statics }));
    });
  });

  describe('overridables', function () {

    it('should have overridable shouldComponentUpdate', function (done) {
      var shouldUpdate = function () { return true; };
      var localComponent = component.withDefaults({
        shouldComponentUpdate: shouldUpdate
      });

      localComponent.shouldComponentUpdate.should.equal(shouldUpdate);
      localComponent.name.should.equal('ComponentCreator');

      var Component = localComponent(function () {
        this.shouldComponentUpdate.should.equal(shouldUpdate);
        done();
        return React.DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });

    it('should have debug on product of withDefaults', function () {
      var shouldUpdate = function () { return true; };
      var localComponent = component.withDefaults({
        shouldComponentUpdate: shouldUpdate
      });

      localComponent.debug.should.be.a('function');
    });

    it('should have overridable isCursor', function (done) {
      var isCursor = function () { return done(); };
      var localComponent = component.withDefaults({
        isCursor: isCursor
      });

      localComponent.shouldComponentUpdate.isCursor.should.equal(isCursor);
      var Component = localComponent(function () {
        return React.DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });

  });

  describe('exposes arguments as props', function () {

    it('should expose single cursor and statics', function (done) {
      var mixins = [{ componentDidMount: done }];
      var props = { cursor: 'cursor', statics: 'foo' };

      var Component = component(mixins, function () {
        this.props.cursor.should.equal(props.cursor);
        this.props.statics.should.equal(props.statics);
        return React.DOM.text(null, 'hello');
      });
      render(Component(props));
    });

    it('should expose multiple cursors', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};
      var statics = 'foo';

      var Component = component(mixins, function () {
        this.props.one.should.equal(cursor1);
        this.props.two.should.equal(cursor2);
        this.props.statics.should.equal(statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component({ one: cursor1, two: cursor2, statics: statics }));
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

function hasKey(component, key) {
  var element = component._currentElement;
  if (component._reactInternalInstance && component._reactInternalInstance._currentElement) {
    element = component._reactInternalInstance._currentElement;
  }
  element.key.should.equal(key);
}
