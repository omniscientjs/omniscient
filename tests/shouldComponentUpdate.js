var chai = require('chai');
chai.should();

var Immutable = require('immutable');

var shouldComponentUpdate = require('../').shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  it('should not update component if passing same cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar' });

    shouldNotUpdate(data.cursor(), null, data.cursor(), null);
  });

  it('should update if cursors are different', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    shouldUpdate(data.cursor(['foo']), null, data.cursor(['bar']), null);
  });


  it('should be able to take multiple cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

    shouldNotUpdate(
      [data.cursor(['foo']), data2.cursor()], null,
      [data.cursor(['foo']), data2.cursor()], null
    );
  });


  it('should update if one of multiple cursors have changed', function () {
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

function next (cursor) {
  return { cursor: cursor };
}

function current (cursor) {
  return {
    props: { cursor: cursor }
  };
}
