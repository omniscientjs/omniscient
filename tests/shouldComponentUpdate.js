var chai = require('chai');
chai.should();

var Immutable = require('immutable');

var shouldComponentUpdate = require('../').shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  describe('should update', function () {
    it('if cursors are different', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      shouldUpdate(data.cursor(['foo']), null, data.cursor(['bar']), null);
    });

    it('if one of multiple cursors have changed', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldUpdate(
        [data.cursor(['foo']), data2.cursor()], null,
        [
          data.cursor(['foo']).update(function (x) { return 1; }),
          data2.cursor()
        ], null
      );
    });

    it('if state has changed', function () {
      shouldUpdate(null, { foo: 'hello' }, null, { foo: 'bar' });
    });

    it('if deep state has changed', function () {
      shouldUpdate(null, { foo: { bar : 'hello' } }, null, { foo: { bar : 'bye' } });
    });

  });

  describe('should not update', function () {

    it('if no data is passed to component', function () {
      shouldNotUpdate(null, null, null, null);
    });

    it('if deep state is same', function () {
      shouldNotUpdate(null, { foo: { bar : 'hello' } }, null, { foo: { bar : 'hello' } });
    });


    it('component if passing same cursors', function () {
      var data = Immutable.fromJS({ foo: 'bar' });

      shouldNotUpdate(data.cursor(), null, data.cursor(), null);
    });

    it('if multiple cursors point to the same data', function () {
      var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
      var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

      shouldNotUpdate(
        [data.cursor(['foo']), data2.cursor()], null,
        [data.cursor(['foo']), data2.cursor()], null
      );
    });

  })

});

function shouldNotUpdate (cursor, state, nextCursor, nextState) {
  callShouldUpdate(cursor, state, nextCursor, nextState).should.equal(false);
}

function shouldUpdate (cursor, state, nextCursor, nextState) {
  callShouldUpdate(cursor, state, nextCursor, nextState).should.equal(true);
}

function callShouldUpdate (cursor, state, nextCursor, nextState) {
  var props     = { cursor: cursor };
  var nextProps = { cursor: nextCursor };
  return shouldComponentUpdate.call({
    props: props,
    state: state
  }, nextProps, nextState);
}
