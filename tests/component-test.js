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

  describe('default jsx', function () {

    it('should return jsx element if jsx set as default', function (done) {
      var localComponent = component.withDefaults({
        jsx: true
      });
      var mixins = [{ componentDidMount: done, myMixin: noop }];

      var Element = localComponent(mixins, function (props) {
        this.should.have.property('myMixin');
        props.name.should.equal('The Doctor');
        return React.DOM.text(null, 'hello');
      });

      render(React.createElement(Element, { name: 'The Doctor' }));
    });

    it('should return created element per default', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];

      var Component = component(mixins, function (props) {
        this.should.have.property('myMixin');
        props.name.should.equal('The Doctor');
        return React.DOM.text(null, 'hello');
      });

      render(Component({ name: 'The Doctor' }));
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

      var Component = component(mixins, function (cursor) {
        cursor.should.eql(cursor1);
        return React.DOM.text(null, 'hello');
      });

      render(Component(cursor1));
    });

    it('should pass objected cursor', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var cursor1 = { cursor: {} };

      var Component = component(mixins, function (props) {
        props.cursor.should.eql(cursor1);
        return React.DOM.text(null, 'hello');
      });

      render(Component({ cursor: cursor1 }));
    });

    it('should pass and expose single immutable cursor', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        cursor.should.equal(cursorInput);
        return React.DOM.text(null, 'hello');
      });
      render(Component(cursorInput));
    });

    it('should pass and expose single immutable cursor on this.props', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        this.cursor.should.equal(cursor);
        this.cursor.should.equal(cursorInput);
        return React.DOM.text(null, 'hello');
      });
      render(Component(cursorInput));
    });

    it('should pass and expose single immutable cursor on this.props and re-render', function () {
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');
      var i = 0;
      var Component = component(function (cursor) {
        i++;
        return React.DOM.text(null, 'hello');
      });

      render(Component(cursorInput));
      render(Component(cursorInput));
      render(Component(cursorInput.update(function () { return 'bar'; })));

      i.should.equal(2);
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

    it('should pass single immutable structure', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var imm = Immutable.List.of(1);

      var Component = component(mixins, function (immutableStructure) {
        immutableStructure.should.eql(imm);
        return React.DOM.text(null, 'hello');
      });

      render(Component(imm));
    });

    it('should pass cursor and with statics as second argument', function (done) {
      var mixins = [{ componentDidMount: done, myMixin: noop }];
      var input = { cursor: 'foo', statics: 'Hello' };
      var Component = component(mixins, function (props, staticsarg) {
        props.cursor.should.equal(input.cursor);
        staticsarg.value.should.equal(input.statics);
        return React.DOM.text(null, 'hello');
      });

      render(Component({cursor: 'foo'}, { value: 'Hello' }));
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

    it('should not mutate the props passed', function (done) {
      var mixins = [{ componentDidMount: done }];

      var props = { foo: 'hello' };
      var statics = { bar: 'world' };

      var Component = component(mixins, function (data) {
        data.should.have.property('foo');
        data.foo.should.equal('hello');
        props.should.not.have.property('statics');
        return React.DOM.text(null, 'hello');
      });

      render(Component(props, statics));
    });

    it('should get passed key and immutable cursor-objects', function (done) {
      var mixins = [{ componentDidMount: done }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function (cursor) {
        hasKey(this, 'myKey');

        cursor.should.equal(cursorInput);
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

        return React.DOM.text(null, this.props.children);
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

        return React.DOM.text(null, this.props.children);
      });

      render(Component(outerCursor, c1));
    });

    it('can take props, statics & children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var statics = { foo: 'bar' };

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function (cursor) {
        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1[0]);
        this.props.children[1].should.equal(c1[1]);

        return React.DOM.text(null, this.props.children);
      });

      render(Component({}, statics, c1));
    });

    it('can take key, props, statics & children', function (done) {
      var mixins = [{ componentDidMount: done }];

      var outerStatics = { foo: 'bar' };

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function (cursor, statics) {
        hasKey(this, 'myKey');

        statics.should.deep.equal(outerStatics);

        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1[0]);
        this.props.children[1].should.equal(c1[1]);

        return React.DOM.text(null, this.props.children);
      });

      render(Component('myKey', {}, outerStatics, c1));
    });

    it('does not attach a node as props.statics', function (done) {
      var mixins = [{ componentDidMount: done }];

      var statics = { foo: 'bar' };

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function (cursor) {
        this.props.should.not.have.property('statics');

        this.props.children.should.have.length(2);

        this.props.children[0].should.equal(c1[0]);
        this.props.children[1].should.equal(c1[1]);

        return React.DOM.text(null, this.props.children);
      });

      render(Component({}, c1));
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

    it('should have overridable isImmutable', function (done) {
      var isImmutable = function () { return done(); };
      var localComponent = component.withDefaults({
        isImmutable: isImmutable
      });

      localComponent.shouldComponentUpdate.isImmutable.should.equal(isImmutable);
      var Component = localComponent(function () {
        return React.DOM.text(null, 'hello');
      });

      render(Component({ foo: 'hello' }));
    });

    it('should have overridable cursorField', function () {
      var localComponent = component.withDefaults({
        jsx: true,
        cursorField: 'cursor'
      });

      var cursor1 = {};

      var Component = localComponent(function (cursor) {
        cursor.should.equal(cursor1);
        return React.DOM.text(null, 'hello');
      });

      render(React.createElement(Component, { cursor: cursor1 }));
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

  describe('should not re-render', function () {
    it('should not rerender on equivalent input', function () {
      var rendered = 0;
      var Component = component(function (input) {
        rendered = rendered + 1;
        return React.DOM.text(null, 'Rendered ' + rendered + ' times');
      });

      render(Component({}));

      rendered.should.equal(1);

      render(Component({}));

      rendered.should.equal(1);
    });
  });

  describe('hot swapping statics', function () {
    it('statics handlers get updated', function (done) {
      var renders = 0;
      var onChange = null;
      var statics = statics;
      var Component = component(function (input, output) {
        onChange = output.onChange;
        statics = output;
        renders = renders + 1;
        return React.DOM.text(null, 'hello');
      });

      render(Component({}, {
        onChange: function () {
          return 1;
        }
      }));

      renders.should.equal(1);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);

      var original = onChange;

      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({}, {
        onChange: function () {
          return 2;
        }
      }));

      renders.should.equal(1);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(2);
      statics.onChange().should.equal(2);

      var onChange2 = onChange;

      render(Component({a: 1}, {
        onChange: function () {
          return 3;
        }
      }));

      renders.should.equal(2);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(3);
      statics.onChange().should.equal(3);

      render(Component({a: 1}, {
        onChange: function () {
          return 4;
        }
      }));

      renders.should.equal(2);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(4);
      statics.onChange().should.equal(4);

      done();
    });

    it('statics do not hot swap unless updated', function (done) {
      var renders = 0;
      var onChange = null;
      var statics = statics;
      var Component = component(function (input, output) {
        onChange = output.onChange;
        statics = output;
        renders = renders + 1;
        return React.DOM.text(null, 'hello');
      });

      var changeHandler = function() { return 1 }
      var handlers = {onChange: changeHandler };

      render(Component({}, handlers));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({}, handlers));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      var onChange2 = onChange;

      render(Component({a: 1}, handlers));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      done();
    });

    it('should never delegate to delegee', function (done) {
      var renders = 0;
      var onChange = null;
      var statics = statics;
      var Component = component(function (input, output) {
        onChange = output.onChange;
        statics = output;
        renders = renders + 1;
        return React.DOM.text(null, 'hello');
      });

      var changeHandler = function() { return 1 }

      render(Component({}, {onChange: changeHandler}));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({}, {onChange: changeHandler}));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      var onChange2 = onChange;

      render(Component({a: 1}, {onChange: changeHandler}));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1}, {onChange: onChange}));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 2}, {onChange: onChange}));

      renders.should.equal(3);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      done();
    });

    it('delegates should not nest', function (done) {
      var renders = [];
      var handlers = {};

      var A = component('a', function (input, output) {
        renders.push("A");
        handlers.a = output.onChange;
        return React.DOM.div({key: 'a'}, [
          B('b', input.b, output),
          C('c', input.c, {onChange: output.onChange})
        ]);
      });

      var B = component('b', function (input, output) {
        renders.push("B");
        handlers.b = output.onChange;
        return React.DOM.span({ key: 'b'}, [input.text ]);
      });

      var C = component('c', function (input, output) {
        renders.push("C");
        handlers.c = output.onChange;
        return React.DOM.div({ key: 'c'}, [D('d', input.d, {onChange: output.onChange})]);
      });

      var D = component('d', function (input, output) {
        renders.push("D");
        handlers.d = output.onChange;
        return React.DOM.span({ key: 'd'}, input.d);
      });

      var changeHandler = function() { return 1 }

      render(A({b: {text: 1}, c: {d: [2]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('A->B->C->D');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 1}, c: {d: [2]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 11}, c: {d: [2]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('A->B');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 11}, c: {d: [22]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('A->C->D');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      var onChange = function() { return 2 };
      render(A({b: {text: 11}, c: {d: [22]}}, {onChange: onChange}));

      renders.splice(0).join('->').should.equal('');
      handlers.a.delegee.should.equal(onChange);
      handlers.b.delegee.should.equal(onChange);
      handlers.c.delegee.should.equal(onChange);
      handlers.d.delegee.should.equal(onChange);

      done();
    });

    it('update no handler to handler', function (done) {
      var renders = [];
      var handlers = null;

      var Component = component(function (input, output) {
        renders.push(1);
        handlers = output;
        return React.DOM.text('');
      });

      var onChange = function() {}
      render(Component({}, {}));


      renders.length.should.equal(1);
      (handlers.onChange === void 0).should.be.true();

      render(Component({a: 1}, {onChange: onChange}));

      renders.length.should.equal(2);
      handlers.onChange.delegee.should.equal(onChange);

      var onUpdate = function() {}
      render(Component({a: 1}, {onChange: onUpdate}));

      renders.length.should.equal(2);
      handlers.onChange.delegee.should.equal(onUpdate);

      done();
    });
  });

  it('passing componentWillReceiveProps as mixin', function (done) {
    var onChange = null;
    var willReceivePropsCalled = 0;
    var renderCalled = 0;
    var mixin = {
      componentWillReceiveProps: function (props) {
        props.statics.onChange.should.equal(this.props.statics.onChange);
        onChange.should.equal(this.props.statics.onChange);
        willReceivePropsCalled = willReceivePropsCalled + 1;
      }
    };

    var Component = component([mixin], function (input, output) {
      renderCalled = renderCalled + 1;
      onChange = output.onChange;
      return React.DOM.text(null, 'hello');
    });

    render(Component({}, {onChange: function() { return 1 } }));
    renderCalled.should.equal(1);
    onChange().should.equal(1);

    render(Component({}, {onChange: function() { return 2 } }));
    renderCalled.should.equal(1);
    onChange().should.equal(2);
    willReceivePropsCalled.should.equal(1);

    render(Component({}, {onChange: function() { return 3 } }));
    renderCalled.should.equal(1);
    onChange().should.equal(3);
    willReceivePropsCalled.should.equal(2);

    render(Component({a: 1}, {onChange: function() { return 4 } }));
    renderCalled.should.equal(2);
    onChange().should.equal(4);
    willReceivePropsCalled.should.equal(3);

    done();
  });

  it('passing componentWillMount as mixin', function (done) {
    var onChange = null;
    var willMountCalled = 0;
    var renderCalled = 0;
    var mixin = {
      componentWillMount: function () {
        onChange = this.props.statics.onChange;
        willMountCalled = willMountCalled + 1;
      }
    };

    var Component = component([mixin], function (input, output) {
      renderCalled = renderCalled + 1;
      onChange.should.equal(output.onChange);
      return React.DOM.text(null, 'hello');
    });

    render(Component({}, {onChange: function() { return 1 } }));
    renderCalled.should.equal(1);
    willMountCalled.should.equal(1);
    onChange().should.equal(1);


    render(Component({}, {onChange: function() { return 2 } }));
    renderCalled.should.equal(1);
    willMountCalled.should.equal(1);
    onChange().should.equal(2);

    render(Component({a: 1}, {onChange: function() { return 3 } }));
    renderCalled.should.equal(2);
    willMountCalled.should.equal(1);
    onChange().should.equal(3);

    render(Component({a: 1}, {onChange: function() { return 4 } }));
    renderCalled.should.equal(2);
    willMountCalled.should.equal(1);
    onChange().should.equal(4);

    done();
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
  React.render(component, global.document.body);
}

function hasKey(component, key) {
  var element = component._currentElement;
  if (component._reactInternalInstance && component._reactInternalInstance._currentElement) {
    element = component._reactInternalInstance._currentElement;
  }
  element.key.should.equal(key);
}
