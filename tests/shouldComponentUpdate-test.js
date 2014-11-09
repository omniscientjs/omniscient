var chai = require('chai');
chai.should();

var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var omniscient = require('../');
var isCursor = omniscient.isCursor;
var shouldComponentUpdate = omniscient.shouldComponentUpdate;

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
});

function shouldNotUpdate (opts) {
  callShouldUpdate(
    opts.cursor, opts.state,
    opts.nextCursor, opts.nextState,
    opts.statics, opts.nextStatics,
    opts.children, opts.nextChildren
  ).should.equal(false);
}

function shouldUpdate (opts) {
  callShouldUpdate(
    opts.cursor, opts.state,
    opts.nextCursor, opts.nextState,
    opts.statics, opts.nextStatics,
    opts.children, opts.nextChildren
  ).should.equal(true);
}

function callShouldUpdate (
  cursor, state,
  nextCursor, nextState,
  statics, nextStatics,
  children, nextChildren
) {
  var props     = isCursor(cursor) ? { cursor: cursor } : cursor;
  var nextProps = isCursor(nextCursor) ? { cursor: nextCursor } : nextCursor;

  props = props || {};
  nextProps = nextProps || {};

  if (statics || nextStatics) {
    props.statics     = statics;
    nextProps.statics = nextStatics;
  }

  if (children || nextChildren) {
    props.children     = children;
    nextProps.children = nextChildren;
  }

  return shouldComponentUpdate.call({
    props: props,
    state: state
  }, nextProps, nextState);
}