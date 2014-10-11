var assert = require('assert');
var Immutable = require('immutable');

var shouldComponentUpdate = require('../').shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  function next (cursor) {
    return {
      cursor: cursor
    };
  }

  function current (cursor) {
    return {
      props: {
        cursor: cursor
      }
    };
  }

  it('should not update component if passing same cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar' });
    var props = current(data.cursor());
    var nextProps = next(data.cursor());

    assert(shouldComponentUpdate.call(props, nextProps) === false);
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
