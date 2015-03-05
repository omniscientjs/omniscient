
var Immutable = require('immutable');
var immstruct = require('immstruct');
var Cursor = require('immutable/contrib/cursor');


var component = omniscient;
var shouldComponentUpdate = component.shouldComponentUpdate;

describe('shouldComponentUpdate', function () {

  // it('on no input', function () {
  //   shouldComponentUpdate.call({ }, { })
  // });

  // var obj = { };
  // it('on same input', function () {
  //   shouldComponentUpdate.call(obj, obj)
  // });


  // var outside = Immutable.Map({ foo: 'bar', bar: Immutable.List.of(1, 2, 3) });

  // it('when immutables are same', function () {
  //   shouldComponentUpdate.call({
  //     props: { d: outside},
  //   }, { d: outside})
  // });

  // it('when many immutables are passed as the same reference', function () {
  //   var structures = {};
  //   for(var i = 0; i < 100; i++) {
  //     structures['data' + i] = Immutable.Map({ foo: 'bar', bar: Immutable.List.of(1, 2, 3) });
  //   }

  //   shouldComponentUpdate.call({
  //     props: { d: structures},
  //   }, { d: structures})
  // });

  // it('when large object is passed', function () {
  //   var objects = {};
  //   for(var i = 0; i < 100; i++) {
  //     objects['data' + i] = { foo: 'bar', bar: [1, 2, 3] };
  //   }

  //   shouldComponentUpdate.call({
  //     props: { d: objects},
  //   }, { d: objects })
  // });

  var objects = {};
  for(var i = 0; i < 100; i++) {
    objects['data' + i] = { foo: 'bar', bar: [1, 2, 3] };
  }

  var objects2 = {};
  for(var i = 0; i < 90; i++) {
    objects2['data' + i] = { foo: 'bar', bar: [1, 2, 3] };
  }

  it('when two large object with different length is passed', function () {

    shouldComponentUpdate.call({
      props: { d: objects},
    }, { d: objects2 })
  });

  // it('when two large object is passed but as same input', function () {
  //   var objects = {};
  //   for(var i = 0; i < 100; i++) {
  //     objects['data' + i] = { foo: 'bar', bar: [1, 2, 3] };
  //   }

  //   shouldComponentUpdate.call({
  //     props: objects,
  //   }, objects)
  // });

  // it('when immutables are different', function () {
  //   var data = Immutable.Map({ foo: 'bar', bar: Immutable.List.of(1, 2, 3) });
  //   var data2 = Immutable.Map({ foo: 'bar', bar: Immutable.List.of(1, 2, 3) });

  //   shouldComponentUpdate.call({
  //     props: { d: data},
  //   }, { d: data2 })
  // });

  // it('when long arrays (1000 elements) are the same', function () {
  //   var data = Immutable.Range(0, 1000).toJS();
  //   var data2 = Immutable.Range(0, 1000).toJS();

  //   shouldComponentUpdate.call({
  //     props: { d: data},
  //   }, { d: data2 })
  // });

  // it('when long arrays (1000 elements) are the same reference', function () {
  //   var data = Immutable.Range(0, 1000).toJS();

  //   shouldComponentUpdate.call({
  //     props: { d: data},
  //   }, { d: data })
  // });

  // it('when same input is passed (long array, 1000 items)', function () {
  //   var input = { d : Immutable.Range(0, 1000).toJS() };

  //   shouldComponentUpdate.call({
  //     props: input,
  //   }, input)
  // });

});