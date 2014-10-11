var chai = require('chai');
chai.should();

var Immutable = require('immutable');

var shouldComponentUpdate = require('../').shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  describe('should update', function () {

    it('when cursors are different', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      shouldUpdate(data.cursor(['foo']), null,
                   data.cursor(['bar']), null);
    });

    it('when one of multiple cursors have changed', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldUpdate(
        [data.cursor(['foo']), data2.cursor()], null,
        [data.cursor(['foo']).update(function (x) { return 1; }), data2.cursor()], null);
    });

    it('when object literal has changed even if the cursor is the same', function () {
      var data = Immutable.fromJS({ foo: 'bar' });
      shouldUpdate([data.cursor(), { foo: 'hello' }], null,
                   [data.cursor(), { bar: 'good bye' }], null);
    });

    it('when state has changed', function () {
      shouldUpdate(null, { foo: 'hello' },
                   null, { foo: 'bar' });
    });

    it('when deep state has changed', function () {
      shouldUpdate(null, { foo: { bar : 'hello' } },
                   null, { foo: { bar : 'bye' } });
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

    it('when only static has changed', function () {
      var data = Immutable.fromJS({ foo: 'bar' });
      shouldNotUpdate(null, null,
                      null, null,
                      { foo: 'hello' }, { bar: 'bye' });
    });


    it('when passing same cursors', function () {
      var data = Immutable.fromJS({ foo: 'bar' });
      shouldNotUpdate(data.cursor(), null,
                      data.cursor(), null);
    });

    it('when passing same cursors and same data for multiple values', function () {
      var data = Immutable.fromJS({ foo: 'bar' });
      shouldNotUpdate([data.cursor(), { foo: 'hello' }], null,
                      [data.cursor(), { foo: 'hello' }], null);
    });

    it('when multiple cursors point to the same data', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldNotUpdate(
        [data.cursor(['foo']), data2.cursor()], null,
        [data.cursor(['foo']), data2.cursor()], null);
    });
  });
});

function shouldNotUpdate (cursor, state, nextCursor, nextState, currentStatic, nextStatic) {
  callShouldUpdate(cursor, state, nextCursor, nextState, currentStatic, nextStatic).should.equal(false);
}

function shouldUpdate (cursor, state, nextCursor, nextState, currentStatic, nextStatic) {
  callShouldUpdate(cursor, state, nextCursor, nextState, currentStatic, nextStatic).should.equal(true);
}

function callShouldUpdate (cursor, state, nextCursor, nextState, currentStatic, nextStatic) {
  var props     = { cursor: cursor };
  var nextProps = { cursor: nextCursor };

  if (currentStatic || nextStatic) {
    props.static     = currentStatic;
    nextProps.static = nextStatic;
  }

  return shouldComponentUpdate.call({
    props: props,
    state: state
  }, nextProps, nextState);
}
