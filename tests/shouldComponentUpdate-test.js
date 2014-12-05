var chai = require('chai');
chai.should();

var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var component = require('../');
var shouldComponentUpdate = require('../updateMixin');
var isCursor = shouldComponentUpdate.isCursor;

describe('shouldComponentUpdate', function () {

  describe('should update', function () {

    it('when cursors are different', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate({
        cursor: Cursor.from(data, ['foo']),
        nextCursor: Cursor.from(data, ['bar'])
      });
    });

    it('when there\'s suddenly a cursor', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate({ nextCursor: Cursor.from(data, ['bar']) });
    });

    it('when there\'s no longer a cursor', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate({ cursor: Cursor.from(data, ['bar']) });
    });

    it('when one of multiple cursors have changed', function () {
      var data  = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldUpdate({
        cursor: { one: Cursor.from(data, ['foo']), two: Cursor.from(data2) },
        nextCursor: { one: Cursor.from(data, ['foo']).update(function (x) { return 1; }), two: Cursor.from(data2) }
      });
    });


    it('when object literal has changed even if the cursor is the same', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldUpdate({
        cursor: { one: Cursor.from(data), two: { foo: 'hello' }},
        nextCursor: { one: Cursor.from(data), two: { bar: 'good bye' }}
      });
    });

    it('when same cursors change keys', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate({
        cursor: { one: Cursor.from(data, ['foo']) },
        nextCursor: { changed: Cursor.from(data, ['foo']) }
      });
    });

    it('when state has changed', function () {
      shouldUpdate({
        state: { foo: 'hello' },
        nextState: { foo: 'bar' }
      });
    });

    it('when deep state has changed', function () {
      shouldUpdate({
        state: { foo: { bar : 'hello' } },
        nextState: { foo: { bar : 'bye'   } }
      });
    });

  });


  describe('should not update', function () {

    it('when no data is passed to component', function () {
      shouldNotUpdate({});
    });

    it('when deep state is same', function () {
      shouldNotUpdate({
        state: { foo: { bar : 'hello' } },
        nextState: { foo: { bar : 'hello' } }
      });
    });

    it('when only statics has changed', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate({
        statics: { foo: 'hello' },
        nextStatics: { bar: 'bye' }
      });
    });

    it('when children has changed', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate({
        children: { foo: 'hello' },
        nextChildren: { bar: 'bye' }
      });
    });

    it('when statics and children has changed', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate({
        statics: { foo: 'hello' },
        nextStatics: { bar: 'bye' },
        children: { foo: 'hello' },
        nextChildren: { bar: 'bye' }
      });
    });

    it('when passing same cursors', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate({
        cursor: Cursor.from(data),
        nextCursor: Cursor.from(data)
      });
    });

    it('when passing same cursors and same data for multiple values', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate({
        cursor: { one: Cursor.from(data), two: { foo: 'hello' } },
        nextCursor: { one: Cursor.from(data), two: { foo: 'hello' } }
      });
    });

    it('when multiple cursors point to the same data', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldNotUpdate({
        cursor: { one: Cursor.from(data, ['foo']), two: Cursor.from(data2) },
        nextCursor: { one: Cursor.from(data, ['foo']), two: Cursor.from(data2) }
      });
    });
  });


  describe('overridables', function () {

    describe('through main component', function () {
      var isEqualState, isEqualCursor, isCursor;

      before(function () {
        isEqualState = component.isEqualState;
        isEqualCursor = component.isEqualCursor;
        isCursor = component.isCursor;
      });

      afterEach(function () {
        component.isEqualState = isEqualState;
        component.isEqualCursor = isEqualCursor;
        component.isCursor = isCursor;
      });

      it('should have overridable isCursor', function (done) {
        var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
        var called = 0;
        component.isCursor = function () { called++; return true; };

        shouldUpdate({
          cursor: Cursor.from(data, ['foo']),
          nextCursor: Cursor.from(data, ['bar'])
        });

        called.should.be.above(1);
        done();
      });

      it('should have overridable isEqualCursor', function (done) {
        var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
        component.isEqualCursor = function () { done() };

        shouldUpdate({
          cursor: Cursor.from(data, ['foo']),
          nextCursor: Cursor.from(data, ['bar'])
        });
      });

      it('should have overridable isEqualState', function (done) {
        component.isEqualState = function () { done() };
        shouldUpdate({
          state: { foo: 'hello' },
          nextState: { foo: 'bar' }
        });
      });
    });

    describe('internal', function () {
      var isEqualState, isEqualCursor, isCursor;

      before(function () {
        isEqualState = shouldComponentUpdate.isEqualState;
        isEqualCursor = shouldComponentUpdate.isEqualCursor;
        isCursor = shouldComponentUpdate.isCursor;
      });

      afterEach(function () {
        shouldComponentUpdate.isEqualState = isEqualState;
        shouldComponentUpdate.isEqualCursor = isEqualCursor;
        shouldComponentUpdate.isCursor = isCursor;
      });

      it('should have overridable isCursor', function (done) {
        var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
        var called = 0;
        shouldComponentUpdate.isCursor = function () { called++; return true; };

        shouldUpdate({
          cursor: Cursor.from(data, ['foo']),
          nextCursor: Cursor.from(data, ['bar'])
        });

        called.should.be.above(1);
        done();
      });

      it('should have overridable isEqualCursor', function (done) {
        var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
        shouldComponentUpdate.isEqualCursor = function () { done() };

        shouldUpdate({
          cursor: Cursor.from(data, ['foo']),
          nextCursor: Cursor.from(data, ['bar'])
        });
      });

      it('should have overridable isEqualState', function (done) {
        shouldComponentUpdate.isEqualState = function () { done() };
        shouldUpdate({
          state: { foo: 'hello' },
          nextState: { foo: 'bar' }
        });
      });

    });
  });
});

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
