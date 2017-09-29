var React = require('react');
var assert = require('assert');
var ReactDOM = require('react-dom');

var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var component = require('../');
var shouldComponentUpdate = require('../shouldupdate');
var isCursor = shouldComponentUpdate.isCursor;

describe('debug', () => {
  let testContext;
  let root;

  beforeEach(() => {
    testContext = {};
  });

  describe('api', () => {
    test('should expose debug function on component', () => {
      expect(component).toHaveProperty('debug');
      expect(component.withDefaults()).toHaveProperty('debug');
    });

    test('should expose debug function on shouldupdate', () => {
      expect(typeof shouldComponentUpdate.debug).toBe('function');
      expect(typeof shouldComponentUpdate.withDefaults().debug).toBe(
        'function'
      );
    });

    test('should expose debug function on shouldupdate from component', () => {
      expect(typeof component.shouldComponentUpdate.debug).toBe('function');
      expect(typeof component.withDefaults().shouldComponentUpdate.debug).toBe(
        'function'
      );
      expect(typeof component.withDefaults().shouldComponentUpdate.debug).toBe(
        'function'
      );
    });
  });

  describe('debugger', () => {
    beforeEach(() => {
      testContext.debug = console.debug;
      testContext.info = console.info;
    });

    afterEach(() => {
      console.debug = testContext.debug;
      console.info = testContext.info;
    });

    test('should use debug when available', done => {
      console.debug = function() {
        done();
      };
      console.info = function() {
        assert.fail('Should not trigger');
        done();
      };
      var localComp = component.withDefaults();
      localComp.debug();

      var Component = localComp('DisplayName', function() {
        return textNode('hello');
      });
      render(Component());
    });

    test('should use console.info if debug not available', done => {
      console.debug = void 0;
      console.info = function() {
        done();
      };
      var localComp = component.withDefaults();
      localComp.debug();

      var Component = localComp('DisplayName', function() {
        return textNode('hello');
      });
      render(Component());
    });

    test('should log on render when debug with displayname', done => {
      var localComp = component.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('DisplayName');
        expect(message).toContain('render');
        done();
      });

      var Component = localComp('DisplayName', function() {
        return textNode('hello');
      });
      render(Component());
    });

    test('should log on render when debug with key', done => {
      var localComp = component.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('foobar');
        expect(message).toContain('render');
        mount = undefined;
        done();
      });

      var Component = localComp(function({ children }) {
        return textNode('Hello');
      });
      const root = document.createElement('div');
      ReactDOM.render(Component('foobar'), root);
    });

    test('should only log components matching regex passed as parameter', done => {
      var localComp = component.withDefaults();
      localComp.debug(/My/, function logger(message) {
        expect(message).not.toContain('AnotherComponent');
        expect(message).toContain('MyComponent');
        done();
      });

      var AnotherComponent = localComp(function AnotherComponent() {
        return textNode('hello');
      });
      render(AnotherComponent());

      var Component = localComp(function MyComponent() {
        return textNode('hello');
      });
      render(Component());
    });

    test('should match on key', done => {
      var mount1 = global.document.createElement('div');
      var mount2 = global.document.createElement('div');

      var localComp = component.withDefaults();
      localComp.debug(/My/i, function logger(message) {
        expect(message).not.toContain('anotherKey');
        expect(message).toContain('myKey');
        mount1 = undefined;
        mount2 = undefined;
        done();
      });

      var AnotherComponent = localComp(function() {
        return textNode('hello');
      });
      ReactDOM.render(AnotherComponent({ key: 'anotherKey' }), mount1);

      var Component = localComp(function() {
        return textNode('hello');
      });
      ReactDOM.render(Component({ key: 'myKey' }), mount2);
    });

    test('should log with unknown on render', done => {
      var localComp = component.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('Unknown');
        expect(message).toContain('render');
        done();
      });

      var Component = localComp(function() {
        return textNode('hello');
      });
      render(Component());
    });

    test('should log on number of cursors differ', done => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('true (props have changed)');
        done();
      });

      shouldUpdate(
        {
          cursor: {
            one: one
          },
          nextCursor: {
            one: one,
            two: two
          }
        },
        localComp
      );
    });

    test('should log on cursors have different keys', done => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('true (props have changed)');
        done();
      });

      shouldUpdate(
        {
          cursor: {
            one: one
          },
          nextCursor: {
            two: two
          }
        },
        localComp
      );
    });

    test('should log on cursors have changed', done => {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('true (props have changed)');
        done();
      });

      shouldUpdate(
        {
          cursor: one,
          nextCursor: two
        },
        localComp
      );
    });

    test('should log on state has changed', done => {
      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('true (state has changed)');
        done();
      });

      shouldUpdate(
        {
          state: { foo: 1 },
          nextState: { foo: 2 }
        },
        localComp
      );
    });

    test('should log on properties have changed', done => {
      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('true (props have changed)');
        done();
      });

      shouldUpdate(
        {
          cursor: { foo: 1 },
          nextCursor: { foo: 2 }
        },
        localComp
      );
    });

    test('should log on unchanged', done => {
      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger(message) {
        expect(message).toContain('shouldComponentUpdate => false');
        done();
      });

      shouldNotUpdate(
        {
          cursor: { foo: 1 },
          nextCursor: { foo: 1 }
        },
        localComp
      );
    });
  });

  beforeEach(() => {
    global.navigator = { userAgent: 'node.js' };
    root = document.createElement('div');
  });

  function render(component) {
    return ReactDOM.render(component, root);
  }
});

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

function shouldNotUpdate(opts, fn) {
  expect(callShouldUpdate(opts, fn)).toBe(false);
}

function shouldUpdate(opts, fn) {
  expect(callShouldUpdate(opts, fn)).toBe(true);
}

function callShouldUpdate(opts, fn) {
  fn = fn || shouldComponentUpdate;

  var props = isCursor(opts.cursor) ? { cursor: opts.cursor } : opts.cursor;
  var nextProps = isCursor(opts.nextCursor)
    ? { cursor: opts.nextCursor }
    : opts.nextCursor;

  props = props || {};
  nextProps = nextProps || {};

  if (opts.statics || opts.nextStatics) {
    props.statics = opts.statics;
    nextProps.statics = opts.nextStatics;
  }

  if (opts.children || opts.nextChildren) {
    props.children = opts.children;
    nextProps.children = opts.nextChildren;
  }

  return fn.call(
    {
      props: props,
      state: opts.state
    },
    nextProps,
    opts.nextState
  );
}
