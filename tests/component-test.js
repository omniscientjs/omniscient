var chai = require('chai');
var jsdom = require('jsdom');
var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var React = require('react');
var ReactDOM = require('react-dom');

var DOM = React.DOM;
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

        return DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should set displayName from render function name', function (done) {
      var mixins = [{ componentDidMount: done }];
      var Component = component(mixins, function MyComponentName () {
        this.constructor.should.have.property('displayName');
        this.constructor.displayName.should.equal('MyComponentName');

        return DOM.text(null, 'hello');
      });

      render(Component());
    });

  });

  describe('decorator', function () {

    it('should attach decorator', function () {
      var hasBeenCalled = false;
      var decorator = function (SomeClass) {
        hasBeenCalled = true;
        return SomeClass;
      };
      var decoratedComponent = component.withDefaults({
        classDecorator: decorator
      });
      var Component = decoratedComponent(function MyComponentName () {
        return DOM.text(null, 'hello');
      });

      render(Component());
      hasBeenCalled.should.equal(true);
    });

    it('should allow to extend class as decorator', function () {
      var decorator = function (ComposedComponent) {
        ComposedComponent.displayName.should.equal('MyComponentName');
        ComposedComponent.displayName = 'Foobar';
        return ComposedComponent;
      };
      var decoratedComponent = component.withDefaults({
        classDecorator: decorator
      });
      var Component = decoratedComponent(function MyComponentName () {
        this.constructor.displayName.should.equal('Foobar');
        return DOM.text(null, 'hello');
      });

      render(Component());
    });

  });

  describe('statics', function () {

    it('should take static methods', function () {
      var mixins = [{ statics: { foo: noop, bar: noop } }];

      var Component = component(mixins, function () {
        return DOM.text(null, 'hello');
      });

      Component.foo.should.be.a('function');
      Component.bar.should.be.a('function');
    });

    it('should take static methods from several mixins', function () {
      var mixins = [{ statics: { foo: noop } }, { statics: { bar: noop } }];

      var Component = component(mixins, function () {
        return DOM.text(null, 'hello');
      });

      Component.foo.should.be.a('function');
      Component.bar.should.be.a('function');
    });

  });

  describe('mixins', function () {

    it('should take mixins', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];

      var Component = component(mixins, function () {
        this.should.have.property('myMixin');
        return DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should take single object as mixin', function (done) {
      var mixins = { componentDidMount: done, myMixin: noop };

      var Component = component(mixins, function () {
        this.should.have.property('myMixin');
        return DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should have overridable shouldComponentUpdate in mixin', function (done) {
      var shouldUpdate = function (nextProps) { return true; };
      var mixins = [{ componentDidMount: done, shouldComponentUpdate: shouldUpdate }];

      var Component = component(mixins, function () {
        this.shouldComponentUpdate.should.equal(shouldUpdate);
        return DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });

    it('should have overridable shouldComponentUpdate in nested mixin', function (done) {
      var shouldUpdate = function (nextProps) { return true; };
      var mixins = {
        componentDidMount: done,
        mixins: [{
          mixins: [{ shouldComponentUpdate: shouldUpdate }]
        }]
      };

      var Component = component(mixins, function () {
        this.shouldComponentUpdate.should.equal(shouldUpdate);
        return DOM.text(null, 'hello');
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
          return DOM.text(null, 'hello');
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
        return DOM.text(null, 'hello');
      });

      render(Component());
    });

    it('should pass single cursor', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var cursor1 = { cursor: {} };

      var Component = component(mixins, function (cursor) {
        cursor.should.eql(cursor1);
        return DOM.text(null, 'hello');
      });

      render(Component(cursor1));
    });

    it('should pass objected cursor', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var cursor1 = { cursor: {} };

      var Component = component(mixins, function (props) {
        props.cursor.should.eql(cursor1);
        return DOM.text(null, 'hello');
      });

      render(Component({ cursor: cursor1 }));
    });

    it('should pass and expose single immutable cursor', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        cursor.should.equal(cursorInput);
        return DOM.text(null, 'hello');
      });
      render(Component(cursorInput));
    });

    it('should pass and expose single immutable cursor on this.props', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        this.cursor.should.equal(cursor);
        this.cursor.should.equal(cursorInput);
        return DOM.text(null, 'hello');
      });
      render(Component(cursorInput));
    });

    it('should pass and expose single immutable cursor on this.props and re-render', function () {
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');
      var i = 0;
      var Component = component(function (cursor) {
        i++;
        return DOM.text(null, 'hello');
      });

      render(Component(cursorInput));
      render(Component(cursorInput));
      render(Component(cursorInput.update(function () { return 'bar'; })));

      i.should.equal(2);
    });

    it('should pass single cursor', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var input = { cursor: 'foo' };
      var Component = component(mixins, function (cursor) {
        cursor.should.eql(input);
        return DOM.text(null, 'hello');
      });

      render(Component(input));
    });

    it('should pass single immutable structure', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var imm = Immutable.List.of(1);

      var Component = component(mixins, function (immutableStructure) {
        immutableStructure.should.eql(imm);
        return DOM.text(null, 'hello');
      });

      render(Component(imm));
    });

    it('should set React key', function (done) {
      var mixins = [{ componentDidMount: done }];

      var Component = component(mixins, function () {
        hasKey(this, 'myKey');
        return DOM.text(null, 'hello');
      });

      render(Component('myKey'));
    });

    it('should get passed key and cursor-objects', function (done) {
      var mixins = [{ componentDidMount: done }];

      var Component = component(mixins, function (data) {
        hasKey(this, 'myKey');

        data.should.have.property('foo');
        data.foo.should.equal('hello');
        return DOM.text(null, 'hello');
      });

      render(Component('myKey', { foo: 'hello' }));
    });

    it('should not mutate the props passed', function (done) {
      var mixins = [{ componentDidMount: done }];

      var props = { foo: 'hello' };

      var Component = component(mixins, function (data) {
        data.should.have.property('foo');
        data.foo.should.equal('hello');
        return DOM.text(null, 'hello');
      });

      render(Component(props));
    });

    it('should get passed key and immutable cursor-objects', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        hasKey(this, 'myKey');

        cursor.should.equal(cursorInput);
        return DOM.text(null, 'hello');
      });
      render(Component('myKey', cursorInput));
    });

    it('should get passed key, cursor-objects and statics', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { cursor: 'hello' };

      var Component = component(mixins, function (props) {
        hasKey(this, 'myKey');

        props.cursor.should.equal(outerCursor.cursor);

        return DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor));
    });

    it('should get passed cursor-object and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var c1 = DOM.text(null, 'hello');
      var c2 = DOM.text(null, 'bar');

      var Component = component(mixins, function (cursor) {
        cursor.foo.should.equal(cursor.foo);
        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1);
        this.props.children[1].should.equal(c2);

        return DOM.text(null, 'hello');
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

        return DOM.text(null, 'hello');
      });

      render(Component('myKey', outerCursor, DOM.text(null, 'hello')));
    });

    it('should get passed cursor-object and children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var Component = component(mixins, function (cursor, statics) {
        cursor.foo.should.equal(outerCursor.foo);
        this.props.children.should.have.length(1);

        return DOM.text(null, 'hello');
      });

      render(Component(outerCursor, DOM.text(null, 'hello')));
    });

    it('should pass multiple cursors', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};

      var Component = component(mixins, function (cursor, staticarg) {
        cursor.one.should.equal(cursor1);
        cursor.two.should.equal(cursor2);
        return DOM.text(null, 'hello');
      });
      render(Component({ one: cursor1, two: cursor2 }));
    });

    it('can take strings as children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var c1 = 'hello';
      var c2 = 'world';

      var Component = component(mixins, function (cursor) {
        cursor.foo.should.equal(cursor.foo);
        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1);
        this.props.children[1].should.equal(c2);

        return DOM.text(null, this.props.children);
      });

      render(Component(outerCursor, c1, c2));
    });

    it('can take arrays as children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerCursor = { foo: 'hello' };

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function (cursor) {
        cursor.foo.should.equal(cursor.foo);
        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1[0]);
        this.props.children[1].should.equal(c1[1]);

        return DOM.text(null, this.props.children);
      });

      render(Component(outerCursor, c1));
    });

    it('can take props & children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function (cursor) {
        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1[0]);
        this.props.children[1].should.equal(c1[1]);

        return DOM.text(null, this.props.children);
      });

      render(Component({}, c1));
    });

    it('can take key, props & children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function (cursor) {
        hasKey(this, 'myKey');

        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1[0]);
        this.props.children[1].should.equal(c1[1]);

        return DOM.text(null, this.props.children);
      });

      render(Component('myKey', {}, c1));
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
        return DOM.text(null, 'hello');
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
        return DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });

    it('should have overridable isImmutable', function (done) {
      var isImmutable = function () { return done(); };
      var localComponent = component.withDefaults({
        isImmutable: isImmutable
      });

      localComponent.shouldComponentUpdate.isImmutable.should.equal(isImmutable);
      var Component = localComponent(function () {
        return DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });

    it('should have overridable cursorField', function () {
      var localComponent = component.withDefaults({
        cursorField: 'cursor'
      });

      var cursor1 = {};

      var Component = localComponent(function (cursor) {
        cursor.should.equal(cursor1);
        return DOM.text(null, 'hello');
      });

      render(React.createElement(Component, { cursor: cursor1 }));
    });

  });

  describe('exposes arguments as props', function () {

    it('should expose single cursor', function (done) {
      var mixins = [{ componentDidMount: done }];
      var props = { cursor: 'cursor' };

      var Component = component(mixins, function () {
        this.props.cursor.should.equal(props.cursor);
        return DOM.text(null, 'hello');
      });
      render(Component(props));
    });

    it('should expose multiple cursors', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursor1 = {};
      var cursor2 = {};

      var Component = component(mixins, function () {
        this.props.one.should.equal(cursor1);
        this.props.two.should.equal(cursor2);
        return DOM.text(null, 'hello');
      });

      render(Component({ one: cursor1, two: cursor2 }));
    });
  });

  describe('should not re-render', function () {
    it('should not rerender on equivalent input', function () {
      var rendered = 0;
      var Component = component(function (input) {
        rendered = rendered + 1;
        return DOM.text(null, 'Rendered ' + rendered + ' times');
      });

      render(Component({}));

      rendered.should.equal(1);

      render(Component({}));

      rendered.should.equal(1);
    });
  });

  it('passing componentWillReceiveProps as mixin', function (done) {
    var willReceivePropsCalled = 0;
    var renderCalled = 0;
    var mixin = {
      componentWillReceiveProps: function (props) {
        willReceivePropsCalled = willReceivePropsCalled + 1;
      }
    };

    var Component = component([mixin], function (input, output) {
      renderCalled = renderCalled + 1;
      return DOM.text(null, 'hello');
    });
    var onChange = function () { return 1; };
    render(Component({}, {onChange: onChange }));
    renderCalled.should.equal(1);

    render(Component({}, {onChange: onChange }));
    renderCalled.should.equal(1);
    willReceivePropsCalled.should.equal(1);

    render(Component({}, {onChange: onChange }));
    renderCalled.should.equal(1);
    willReceivePropsCalled.should.equal(2);

    render(Component({a: 1}, {onChange: function () { return 4; } }));
    renderCalled.should.equal(2);
    willReceivePropsCalled.should.equal(3);

    done();
  });

  it('passing componentWillMount as mixin', function (done) {
    var willMountCalled = 0;
    var renderCalled = 0;
    var mixin = {
      componentWillMount: function () {
        willMountCalled = willMountCalled + 1;
      }
    };

    var Component = component([mixin], function (input, output) {
      renderCalled = renderCalled + 1;
      return DOM.text(null, 'hello');
    });

    var onChange = function () { return 1; };
    render(Component({}, {onChange: onChange }));
    renderCalled.should.equal(1);
    willMountCalled.should.equal(1);


    render(Component({}, {onChange: onChange }));
    renderCalled.should.equal(1);
    willMountCalled.should.equal(1);

    onChange = function () { return 3; };
    render(Component({a: 1}, {onChange: onChange }));
    renderCalled.should.equal(2);
    willMountCalled.should.equal(1);

    render(Component({a: 1}, {onChange: onChange }));
    renderCalled.should.equal(2);
    willMountCalled.should.equal(1);

    done();
  });

  beforeEach(function () {
    global.document = jsdom.jsdom('<html><body><div id="app"></div></body></html>');
    global.window = global.document.defaultView;
  });

  afterEach(function () {
    delete global.document;
    delete global.window;
  });
});

function noop () {}

function render (component) {
  ReactDOM.render(component, global.document.querySelector('#app'));
}

function hasKey(component, key) {
  var element = component._currentElement;
  if (component._reactInternalInstance && component._reactInternalInstance._currentElement) {
    element = component._reactInternalInstance._currentElement;
  }
  element.key.should.equal(key);
}
