var jsdom = require('jsdom');

var assert = require('assert');
var chai = require('chai');
chai.should();

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var component = require('../');
var shouldComponentUpdate = require('../shouldupdate');
var isCursor = shouldComponentUpdate.isCursor;

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
      this.debug = console.debug;
      this.info = console.info;
    });

    afterEach(function () {
      console.debug = this.debug;
      console.info = this.info;
    });

    it('should use debug when availeble', function (done) {
      console.debug = function () {
        done();
      };
      console.info = function () {
        assert.fail('Should not trigger');
        done();
      };
      var localComp = component.withDefaults();
      localComp.debug();

      var Component = localComp('DisplayName', function () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

    it('should use console.info if debug not available', function (done) {
      console.debug = void 0;
      console.info = function () {
        done();
      };
      var localComp = component.withDefaults();
      localComp.debug();

      var Component = localComp('DisplayName', function () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

    it('should log on render when debug with displayname', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('DisplayName');
        message.should.contain('render');
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
        message.should.contain('render');
        done();
      });

      var Component = localComp(function () {
        return React.DOM.text('hello');
      });
      render(Component({ key: 'foobar' }));
    });

    it('should log when debug with key for React 0.13 beta', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('foobar');
        message.should.contain('render');
        done();
      });

      var Component = localComp({
        componentWillMount: function () {
          this._reactInternalInstance = {
            _currentElement: {
              key: 'foobar'
            }
          };
        }
      }, function () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

    it('should only log components matching regex passed as parameter', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(/My/, function logger (message) {
        message.should.not.contain('AnotherComponent');
        message.should.contain('MyComponent');
        done();
      });

      var AnotherComponent = localComp(function AnotherComponent () {
        return React.DOM.text('hello');
      });
      render(AnotherComponent());

      var Component = localComp(function MyComponent () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

    it('should match on key', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(/My/i, function logger (message) {
        message.should.not.contain('anotherKey');
        message.should.contain('myKey');
        done();
      });

      var AnotherComponent = localComp(function () {
        return React.DOM.text('hello');
      });
      render(AnotherComponent({ key: 'anotherKey' }));

      var Component = localComp(function () {
        return React.DOM.text('hello');
      });
      render(Component({ key: 'myKey' }));
    });

    it('should log with unknown on render', function (done) {
      var localComp = component.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('Unknown');
        message.should.contain('render');
        done();
      });

      var Component = localComp(function () {
        return React.DOM.text('hello');
      });
      render(Component());
    });

    it('should log on number of cursors differ', function (done) {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('true (props have changed)');
        done();
      });

      shouldUpdate({
        cursor: {
          one: one,
        },
        nextCursor: {
          one: one,
          two: two
        }
      }, localComp);
    });

    it('should log on cursors have different keys', function (done) {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('true (props have changed)');
        done();
      });

      shouldUpdate({
        cursor: {
          one: one
        },
        nextCursor: {
          two: two
        }
      }, localComp);
    });

    it('should log on cursors have changed', function (done) {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var one = Cursor.from(data, ['foo']);
      var two = Cursor.from(data, ['bar']);

      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('true (props have changed)');
        done();
      });

      shouldUpdate({
        cursor: one,
        nextCursor: two
      }, localComp);
    });

    it('should log on state has changed', function (done) {
      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('true (state has changed)');
        done();
      });

      shouldUpdate({
        state: { foo: 1 },
        nextState: { foo: 2 }
      }, localComp);
    });

    it('should log on properties have changed', function (done) {
      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('true (props have changed)');
        done();
      });

      shouldUpdate({
        cursor: { foo: 1 },
        nextCursor: { foo: 2 }
      }, localComp);
    });

    it('should log on unchanged', function (done) {
      var localComp = shouldComponentUpdate.withDefaults();
      localComp.debug(function logger (message) {
        message.should.contain('shouldComponentUpdate => false');
        done();
      });

      shouldNotUpdate({
        cursor: { foo: 1 },
        nextCursor: { foo: 1 }
      }, localComp);
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

function shouldNotUpdate (opts, fn) {
  callShouldUpdate(opts, fn).should.equal(false);
}

function shouldUpdate (opts, fn) {
  callShouldUpdate(opts, fn).should.equal(true);
}

function callShouldUpdate (opts, fn) {
  fn = fn || shouldComponentUpdate;

  var props     = isCursor(opts.cursor) ? { cursor: opts.cursor } : opts.cursor;
  var nextProps = isCursor(opts.nextCursor) ? { cursor: opts.nextCursor } : opts.nextCursor;

  props = props || {};
  nextProps = nextProps || {};

  if (opts.statics || opts.nextStatics) {
    props.statics     = opts.statics;
    nextProps.statics = opts.nextStatics;
  }

  if (opts.children || opts.nextChildren) {
    props.children     = opts.children;
    nextProps.children = opts.nextChildren;
  }

  return fn.call({
    props: props,
    state: opts.state
  }, nextProps, opts.nextState);
}
