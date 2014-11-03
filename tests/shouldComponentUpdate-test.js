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

      shouldUpdate(Cursor.from(data, ['foo']), null,
                   Cursor.from(data, ['bar']), null);
    });


    it('when there\'s suddenly a cursor', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate(null, null,
                   Cursor.from(data, ['bar']), null);
    });

    it('when there\'s no longer a cursor', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate(Cursor.from(data, ['bar']), null,
                   null, null);
    });

    it('when one of multiple cursors have changed', function () {
      var data  = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldUpdate(
        { one: Cursor.from(data, ['foo']), two: Cursor.from(data2) }, null,
        { one: Cursor.from(data, ['foo']).update(function (x) { return 1; }), two: Cursor.from(data2) }, null);
    });


    it('when object literal has changed even if the cursor is the same', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldUpdate({ one: Cursor.from(data), two: { foo: 'hello'    }}, null,
                   { one: Cursor.from(data), two: { bar: 'good bye' }}, null);
    });

    it('when same cursors change keys', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });

      shouldUpdate({ one:     Cursor.from(data, ['foo']) }, null,
                   { changed: Cursor.from(data, ['foo']) }, null);
    });

    it('when state has changed', function () {
      shouldUpdate(null, { foo: 'hello' },
                   null, { foo: 'bar'   });
    });

    it('when deep state has changed', function () {
      shouldUpdate(null, { foo: { bar : 'hello' } },
                   null, { foo: { bar : 'bye'   } });
    });

  });


  describe('should not update', function () {

    it('when no data is passed to component', function () {
      shouldNotUpdate(null, null, null, null);
    });

    it('when deep state is same', function () {
      shouldNotUpdate(null, { foo: { bar : 'hello' } },
                      null, { foo: { bar : 'hello' } });
    });

    it('when only statics has changed', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate(null, null,
                      null, null,
                      { foo: 'hello' }, { bar: 'bye' });
    });

    it('when passing same cursors', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate(Cursor.from(data), null,
                      Cursor.from(data), null);
    });

    it('when passing same cursors and same data for multiple values', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate({ one: Cursor.from(data), two: { foo: 'hello' } }, null,
                      { one: Cursor.from(data), two: { foo: 'hello' } }, null);
    });

    it('when multiple cursors point to the same data', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldNotUpdate(
        { one: Cursor.from(data, ['foo']), two: Cursor.from(data2) }, null,
        { one: Cursor.from(data, ['foo']), two: Cursor.from(data2) }, null);
    });
  });
});

function shouldNotUpdate (cursor, state, nextCursor, nextState, currentStatics, nextStatics) {
  callShouldUpdate(cursor, state, nextCursor, nextState, currentStatics, nextStatics).should.equal(false);
}

function shouldUpdate (cursor, state, nextCursor, nextState, currentStatics, nextStatics) {
  callShouldUpdate(cursor, state, nextCursor, nextState, currentStatics, nextStatics).should.equal(true);
}

function callShouldUpdate (cursor, state, nextCursor, nextState, currentStatics, nextStatics) {
  var props     = isCursor(cursor) ? { cursor: cursor } : cursor;
  var nextProps = isCursor(nextCursor) ? { cursor: nextCursor } : nextCursor;

  props = props || {};
  nextProps = nextProps || {};

  if (currentStatics || nextStatics) {
    props.statics     = currentStatics;
    nextProps.statics = nextStatics;
  }

  return shouldComponentUpdate.call({
    props: props,
    state: state
  }, nextProps, nextState);
}