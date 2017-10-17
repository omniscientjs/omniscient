var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');
var createClass = require('create-react-class');

var React = require('react');
var ReactDOM = require('react-dom');

var component = require('../');
var shouldUpdateMixin = require('../shouldupdate');

describe('component', () => {
  describe('arguments', () => {
    test('should take displayName', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var Component = component('myComponent', mixins, function() {
        expect(this.constructor).toHaveProperty('displayName');
        expect(this.constructor.displayName).toBe('myComponent');

        return textNode('hello');
      });

      render(Component());
    });

    test('should set displayName from render function name', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var Component = component(mixins, function MyComponentName() {
        expect(this.constructor).toHaveProperty('displayName');
        expect(this.constructor.displayName).toBe('MyComponentName');

        return textNode('hello');
      });

      render(Component());
    });
  });

  describe('decorator', () => {
    test('should attach decorator', () => {
      var hasBeenCalled = false;
      var decorator = function(SomeClass) {
        hasBeenCalled = true;
        return SomeClass;
      };
      var decoratedComponent = component.withDefaults({
        classDecorator: decorator
      });

      var Component = decoratedComponent(function MyComponentName() {
        return textNode('hello');
      });

      render(Component());
      expect(hasBeenCalled).toBe(true);
    });

    test('should attach inline decorator', () => {
      var hasBeenCalled = false;
      var decorator = function(SomeClass) {
        hasBeenCalled = true;
        return SomeClass;
      };

      var Component = component.classDecorator(
        decorator,
        function MyComponentName() {
          return textNode('hello');
        }
      );

      render(Component());
      expect(hasBeenCalled).toBe(true);
    });

    test('should allow for creating a partially applied classDecorator factory', () => {
      var hasBeenCalled = false;
      var decorator = function(SomeClass) {
        hasBeenCalled = true;
        return SomeClass;
      };

      var Component = component.classDecorator(decorator)(
        { foo: function() {} },
        function MyComponentName() {
          expect(typeof this.foo).toBe('function');
          return textNode('hello');
        }
      );

      render(Component());
      expect(hasBeenCalled).toBe(true);
    });

    test('should allow to extend class as decorator', () => {
      var decorator = function(ComposedComponent) {
        expect(ComposedComponent.displayName).toBe('MyComponentName');
        ComposedComponent.displayName = 'Foobar';
        return ComposedComponent;
      };
      var decoratedComponent = component.withDefaults({
        classDecorator: decorator
      });

      var Component = decoratedComponent(function MyComponentName() {
        expect(this.constructor.displayName).toBe('Foobar');
        return textNode('hello');
      });

      render(Component());
    });
  });

  describe('statics', () => {
    test('should take static methods', () => {
      var mixins = [{ statics: { foo: noop, bar: noop } }];

      var Component = component(mixins, function() {
        return textNode('hello');
      });

      expect(typeof Component.foo).toBe('function');
      expect(typeof Component.bar).toBe('function');
    });

    test('should take static methods from several mixins', () => {
      var mixins = [{ statics: { foo: noop } }, { statics: { bar: noop } }];

      var Component = component(mixins, function() {
        return textNode('hello');
      });

      expect(typeof Component.foo).toBe('function');
      expect(typeof Component.bar).toBe('function');
    });
  });

  describe('mixins', () => {
    test('should take mixins', done => {
      var mixins = [{ componentDidMount: () => done(), myMixin: noop }];

      var Component = component(mixins, function() {
        expect(this).toHaveProperty('myMixin');
        return textNode('hello');
      });

      render(Component());
    });

    test('should take single object as mixin', done => {
      var mixins = { componentDidMount: () => done(), myMixin: noop };

      var Component = component(mixins, function() {
        expect(this).toHaveProperty('myMixin');
        return textNode('hello');
      });

      render(Component());
    });

    test('should have overridable shouldComponentUpdate in mixin', done => {
      var shouldUpdate = function(nextProps) {
        return true;
      };
      var mixins = [
        { componentDidMount: () => done(), shouldComponentUpdate: shouldUpdate }
      ];

      var Component = component(mixins, function() {
        expect(this.shouldComponentUpdate).toBe(shouldUpdate);
        return textNode('hello');
      });

      render(Component({ foo: 'hello' }));
    });

    test('should have overridable shouldComponentUpdate in nested mixin', done => {
      var shouldUpdate = function(nextProps) {
        return true;
      };
      var mixins = {
        componentDidMount: () => done(),
        mixins: [
          {
            mixins: [{ shouldComponentUpdate: shouldUpdate }]
          }
        ]
      };

      var Component = component(mixins, function() {
        expect(this.shouldComponentUpdate).toBe(shouldUpdate);
        return textNode('hello');
      });

      render(Component({ foo: 'hello' }));
    });

    test('should allow shouldComponentUpdate as mixin to vanilla React', done => {
      var mixins = [
        {
          shouldComponentUpdate: shouldUpdateMixin
        }
      ];

      var Component = createClass({
        mixins: mixins,
        render: function() {
          expect(this.shouldComponentUpdate).toBe(shouldUpdateMixin);
          done();
          return textNode('hello');
        }
      });

      render(React.createElement(Component, { foo: 'hello' }));
    });
  });

  describe('render function arguments', () => {
    test('should handle no arguments', done => {
      var mixins = [{ componentDidMount: () => done(), myMixin: noop }];
      var Component = component(mixins, function(cursor, statics) {
        expect(cursor).toEqual({});
        expect(statics).toBeFalsy();
        return textNode('hello');
      });

      render(Component());
    });

    test('should pass single cursor', done => {
      var mixins = [{ componentDidMount: () => done(), myMixin: noop }];
      var cursor1 = { cursor: {} };

      var Component = component(mixins, function(cursor) {
        expect(cursor).toEqual(cursor1);
        return textNode('hello');
      });

      render(Component(cursor1));
    });

    test('should pass objected cursor', done => {
      var mixins = [{ componentDidMount: () => done(), myMixin: noop }];
      var cursor1 = { cursor: {} };

      var Component = component(mixins, function(props) {
        expect(props.cursor).toEqual(cursor1);
        return textNode('hello');
      });

      render(Component({ cursor: cursor1 }));
    });

    test('should pass and expose single immutable cursor', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function(cursor) {
        expect(cursor).toBe(cursorInput);
        return textNode('hello');
      });
      render(Component(cursorInput));
    });

    test('should pass and expose single immutable cursor on this.props', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function(cursor) {
        expect(this.cursor).toBe(cursor);
        expect(this.cursor).toBe(cursorInput);
        return textNode('hello');
      });
      render(Component(cursorInput));
    });

    test('should pass and expose single immutable cursor on this.props and re-render', () => {
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');
      var i = 0;
      var Component = component(function(cursor) {
        i++;
        return textNode('hello');
      });

      render(Component(cursorInput));
      render(Component(cursorInput));
      render(
        Component(
          cursorInput.update(function() {
            return 'bar';
          })
        )
      );

      expect(i).toBe(2);
    });

    test('should pass single cursor', done => {
      var mixins = [{ componentDidMount: () => done(), myMixin: noop }];
      var input = { cursor: 'foo' };
      var Component = component(mixins, function(cursor) {
        expect(cursor).toEqual(input);
        return textNode('hello');
      });

      render(Component(input));
    });

    test('should pass single immutable structure', done => {
      var mixins = [{ componentDidMount: () => done(), myMixin: noop }];
      var imm = Immutable.List.of(1);

      var Component = component(mixins, function(immutableStructure) {
        expect(immutableStructure).toEqual(imm);
        return textNode('hello');
      });

      render(Component(imm));
    });

    test('should set React key', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var Component = component(mixins, function() {
        hasKey(this, 'myKey');
        return textNode('hello');
      });

      render(Component('myKey'));
    });

    test('should get passed key and cursor-objects', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var Component = component(mixins, function(data) {
        hasKey(this, 'myKey');

        expect(data).toHaveProperty('foo');
        expect(data.foo).toBe('hello');
        return textNode('hello');
      });

      render(Component('myKey', { foo: 'hello' }));
    });

    test('should not mutate the props passed', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var props = { foo: 'hello' };

      var Component = component(mixins, function(data) {
        expect(data).toHaveProperty('foo');
        expect(data.foo).toBe('hello');
        return textNode('hello');
      });

      render(Component(props));
    });

    test('should get passed key and immutable cursor-objects', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var cursorInput = Cursor.from(Immutable.fromJS({ foo: 'hello' }), 'foo');

      var Component = component(mixins, function(cursor) {
        hasKey(this, 'myKey');

        expect(cursor).toBe(cursorInput);
        return textNode('hello');
      });
      render(Component('myKey', cursorInput));
    });

    test('should get passed key, cursor-objects and statics', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var outerCursor = { cursor: 'hello' };

      var Component = component(mixins, function(props) {
        hasKey(this, 'myKey');

        expect(props.cursor).toBe(outerCursor.cursor);

        return textNode('hello');
      });

      render(Component('myKey', outerCursor));
    });

    test('should get passed cursor-object and children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var outerCursor = { foo: 'hello' };

      var c1 = textNode('hello');
      var c2 = textNode('bar');

      var Component = component(mixins, function(cursor) {
        expect(cursor.foo).toBe(cursor.foo);
        expect(this.props.children).toHaveLength(2);

        expect(this.props.children[0]).toBe(c1);
        expect(this.props.children[1]).toBe(c2);

        return textNode('hello');
      });

      render(Component(outerCursor, c1, c2));
    });

    test('should get passed key, cursor-object and children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var outerCursor = { foo: 'hello' };

      var Component = component(mixins, function(cursor) {
        hasKey(this, 'myKey');

        expect(cursor.foo).toBe(outerCursor.foo);
        expect(this.props.children).toHaveLength(1);

        return textNode('hello');
      });

      render(Component('myKey', outerCursor, textNode('hello')));
    });

    test('should get passed cursor-object and children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var outerCursor = { foo: 'hello' };

      var Component = component(mixins, function(cursor, statics) {
        expect(cursor.foo).toBe(outerCursor.foo);
        expect(this.props.children).toHaveLength(1);

        return textNode('hello');
      });

      render(Component(outerCursor, textNode('hello')));
    });

    test('should pass multiple cursors', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var cursor1 = {};
      var cursor2 = {};

      var Component = component(mixins, function(cursor, staticarg) {
        expect(cursor.one).toBe(cursor1);
        expect(cursor.two).toBe(cursor2);
        return textNode('hello');
      });
      render(Component({ one: cursor1, two: cursor2 }));
    });

    test('can take strings as children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var outerCursor = { foo: 'hello' };

      var c1 = 'hello';
      var c2 = 'world';

      var Component = component(mixins, function(cursor) {
        expect(cursor.foo).toBe(cursor.foo);
        expect(this.props.children).toHaveLength(2);

        expect(this.props.children[0]).toBe(c1);
        expect(this.props.children[1]).toBe(c2);

        return textNode(this.props.children);
      });

      render(Component(outerCursor, c1, c2));
    });

    test('can take arrays as children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var outerCursor = { foo: 'hello' };

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function(cursor) {
        expect(cursor.foo).toBe(cursor.foo);
        expect(this.props.children).toHaveLength(2);

        expect(this.props.children[0]).toBe(c1[0]);
        expect(this.props.children[1]).toBe(c1[1]);

        return textNode(this.props.children);
      });

      render(Component(outerCursor, c1));
    });

    test('can take props & children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function(cursor) {
        expect(this.props.children).toHaveLength(2);

        expect(this.props.children[0]).toBe(c1[0]);
        expect(this.props.children[1]).toBe(c1[1]);

        return textNode(this.props.children);
      });

      render(Component({}, c1));
    });

    test('can take key, props & children', done => {
      var mixins = [{ componentDidMount: () => done() }];

      var c1 = ['hello', 'world'];

      var Component = component(mixins, function(cursor) {
        hasKey(this, 'myKey');

        expect(this.props.children).toHaveLength(2);

        expect(this.props.children[0]).toBe(c1[0]);
        expect(this.props.children[1]).toBe(c1[1]);

        return textNode(this.props.children);
      });

      render(Component('myKey', {}, c1));
    });
  });

  describe('overridables', () => {
    test('should have overridable shouldComponentUpdate', done => {
      var shouldUpdate = function() {
        return true;
      };
      var localComponent = component.withDefaults({
        shouldComponentUpdate: shouldUpdate
      });

      expect(localComponent.shouldComponentUpdate).toBe(shouldUpdate);
      expect(localComponent.name).toBe('ComponentCreator');

      var Component = localComponent(function() {
        expect(this.shouldComponentUpdate).toBe(shouldUpdate);
        done();
        return textNode('hello');
      });

      render(Component({ foo: 'hello' }));
    });

    test('should have debug on product of withDefaults', () => {
      var shouldUpdate = function() {
        return true;
      };
      var localComponent = component.withDefaults({
        shouldComponentUpdate: shouldUpdate
      });

      expect(typeof localComponent.debug).toBe('function');
    });

    test('should have overridable isCursor', done => {
      var isCursor = function() {
        return done();
      };
      var localComponent = component.withDefaults({
        isCursor: isCursor
      });

      expect(localComponent.shouldComponentUpdate.isCursor).toBe(isCursor);
      var Component = localComponent(function() {
        return textNode('hello');
      });

      render(Component({ foo: 'hello' }));
    });

    test('should have overridable isImmutable', done => {
      var isImmutable = function() {
        return done();
      };
      var localComponent = component.withDefaults({
        isImmutable: isImmutable
      });

      expect(localComponent.shouldComponentUpdate.isImmutable).toBe(
        isImmutable
      );
      var Component = localComponent(function() {
        return textNode('hello');
      });

      render(Component({ foo: 'hello' }));
    });

    test('should have overridable cursorField', () => {
      var localComponent = component.withDefaults({
        cursorField: 'cursor'
      });

      var cursor1 = {};

      var Component = localComponent(function(cursor) {
        expect(cursor).toBe(cursor1);
        return textNode('hello');
      });

      render(React.createElement(Component, { cursor: cursor1 }));
    });
  });

  describe('exposes arguments as props', () => {
    test('should expose single cursor', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var props = { cursor: 'cursor' };

      var Component = component(mixins, function() {
        expect(this.props.cursor).toBe(props.cursor);
        return textNode('hello');
      });
      render(Component(props));
    });

    test('should expose multiple cursors', done => {
      var mixins = [{ componentDidMount: () => done() }];
      var cursor1 = {};
      var cursor2 = {};

      var Component = component(mixins, function() {
        expect(this.props.one).toBe(cursor1);
        expect(this.props.two).toBe(cursor2);
        return textNode('hello');
      });

      render(Component({ one: cursor1, two: cursor2 }));
    });
  });

  describe('creator disguises as a react class', () => {
    test('contains `isReactComponent` in its prototype chain', function() {
      var Component = component(function() {
        return React.createElement('div');
      });

      expect(Component.prototype.isReactComponent).not.toBeFalsy();
    });

    test('creates react class instance, not an element, when passed `publicProps`, `publicContext`, and `ReactUpdateQueue`', () => {
      var Component = component(function() {
        return React.createElement('div');
      });
      expect(React.isValidElement(Component())).toBe(true);
      expect(React.isValidElement(new Component({}, {}))).toBe(false);
    });

    test('exposes `type` on itself', () => {
      var Type;
      var comp = component.classDecorator(Class => (Type = Class));

      var Creator = comp(function() {
        return React.createElement('div');
      });

      expect(Creator.type).toBe(Type);
    });

    test('will pass default props', () => {
      var expectedPropValue = 'default-prop-value';

      var lifecycleMethods = {
        getDefaultProps: function() {
          return { direction: expectedPropValue };
        }
      };
      var Component = component(lifecycleMethods, function(props) {
        expect(props.direction).toBe(expectedPropValue);
        expect(this.props.direction).toBe(expectedPropValue);
        return React.createElement('div');
      });

      render(Component());
      render(React.createElement(Component)); // jsx
    });
  });

  describe('should not re-render', () => {
    test('should not rerender on equivalent input', () => {
      var rendered = 0;
      var Component = component(function(input) {
        rendered = rendered + 1;
        return textNode('Rendered ' + rendered + ' times');
      });

      render(Component({}));

      expect(rendered).toBe(1);

      render(Component({}));

      expect(rendered).toBe(1);
    });
  });

  test('passing componentWillReceiveProps as mixin', done => {
    var willReceivePropsCalled = 0;
    var renderCalled = 0;
    var mixin = {
      componentWillReceiveProps: function(props) {
        willReceivePropsCalled = willReceivePropsCalled + 1;
      }
    };

    var Component = component([mixin], function(input, output) {
      renderCalled = renderCalled + 1;
      return textNode('hello');
    });
    var onChange = function() {
      return 1;
    };
    render(Component({}, { onChange: onChange }));
    expect(renderCalled).toBe(1);

    render(Component({}, { onChange: onChange }));
    expect(renderCalled).toBe(1);
    expect(willReceivePropsCalled).toBe(1);

    render(Component({}, { onChange: onChange }));
    expect(renderCalled).toBe(1);
    expect(willReceivePropsCalled).toBe(2);

    render(
      Component(
        { a: 1 },
        {
          onChange: function() {
            return 4;
          }
        }
      )
    );
    expect(renderCalled).toBe(2);
    expect(willReceivePropsCalled).toBe(3);

    done();
  });

  test('passing componentWillMount as mixin', done => {
    var willMountCalled = 0;
    var renderCalled = 0;
    var mixin = {
      componentWillMount: function() {
        willMountCalled = willMountCalled + 1;
      }
    };

    var Component = component([mixin], function(input, output) {
      renderCalled = renderCalled + 1;
      return textNode('hello');
    });

    var onChange = function() {
      return 1;
    };
    render(Component({}, { onChange: onChange }));
    expect(renderCalled).toBe(1);
    expect(willMountCalled).toBe(1);

    render(Component({}, { onChange: onChange }));
    expect(renderCalled).toBe(1);
    expect(willMountCalled).toBe(1);

    onChange = function() {
      return 3;
    };
    render(Component({ a: 1 }, { onChange: onChange }));
    expect(renderCalled).toBe(2);
    expect(willMountCalled).toBe(1);

    render(Component({ a: 1 }, { onChange: onChange }));
    expect(renderCalled).toBe(2);
    expect(willMountCalled).toBe(1);

    done();
  });

  var root;
  beforeEach(() => {
    root = document.createElement('div');
  });

  function render(component) {
    ReactDOM.render(component, root);
  }
});

function noop() {}

/**
 * Interop between React 16.x (can return strings directly in a component's `render` method)
 * and React <16 (must return a `text` element from a component's `render` method)
 * @param {string} textContent
 */
function textNode(textContent) {
  return React.DOM && React.DOM.text
    ? React.createElement('text', { children: textContent })
    : textContent;
}
function hasKey(component, key) {
  var element = component._currentElement;
  if (component._reactInternalFiber) {
    element = component._reactInternalFiber;
  } else if (
    component._reactInternalInstance &&
    component._reactInternalInstance._currentElement
  ) {
    element = component._reactInternalInstance._currentElement;
  }
  expect(element.key).toBe(key);
}
