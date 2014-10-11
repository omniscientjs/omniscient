var chai = require('chai');
chai.should();

var assert = require('assert');
var Immutable = require('immutable');

var shouldComponentUpdate = require('../').shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  it('should not update component if passing same cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar' });

    shouldNotUpdate(data.cursor(), null, data.cursor(), null);
  });

  it('should update if cursors are different', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var props = current(data.cursor(['foo']));
    var nextProps = next(data.cursor(['bar']));

    assert(shouldComponentUpdate.call(props, nextProps));
  });


  it('should be able to take multiple cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

    var props = current([data.cursor(['foo']), data2.cursor()]);
    var nextProps = next([data.cursor(['foo']), data2.cursor()]);

    assert(shouldComponentUpdate.call(props, nextProps) === false);
  });


  it('should update if one of multiple cursors has changed', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

    var props = current([data.cursor(['foo']), data2.cursor()]);
    var nextProps = next([
        data.cursor(['foo']).update(function (x) { return 1; }),
        data2.cursor()
    ]);

    assert(shouldComponentUpdate.call(props, nextProps));
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
