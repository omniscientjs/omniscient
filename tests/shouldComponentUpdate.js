var assert = require('assert');
var Immutable = require('immutable');

var shouldComponentUpdate = require('../').shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  it('should not update component if passing same cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar' });
    var cursor = data.cursor([]);
    var props = {
      props: {
        cursor: cursor
      }
    };
    var nextProps = {
      cursor: cursor
    };

    assert(shouldComponentUpdate.call(props, nextProps) === false);
  });

  it('should update if cursors are different', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var props = {
      props: {
        cursor: data.cursor(['foo'])
      }
    };

    var nextProps = {
      cursor: data.cursor(['bar'])
    };

    assert(shouldComponentUpdate.call(props, nextProps));
  });


  it('should be able to take array of cursors', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

    var cursors = [data.cursor(['foo']), data2.cursor()];

    var props = {
      props: {
        cursor: [data.cursor(['foo']), data2.cursor()]
      }
    };

    var nextProps = {
      cursor: [data.cursor(['foo']), data2.cursor()]
    };

    assert(shouldComponentUpdate.call(props, nextProps) === false);
  });


  it('should update if one of multiple cursors has changed', function () {
    var data = Immutable.fromJS({ foo: 'bar', bar: [1, 2, 3] });
    var data2 = Immutable.fromJS({ baz: [1, 2, 3] });

    var props = {
      props: {
        cursor: [data.cursor(['foo']), data2.cursor()]
      }
    };

    var nextProps = {
      cursor: [data.cursor(['foo']).update(function (x) { return 1; }), data2.cursor()]
    };

    assert(shouldComponentUpdate.call(props, nextProps));
  });
});
