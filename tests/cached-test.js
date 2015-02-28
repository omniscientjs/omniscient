var chai = require('chai');
var jsdom = require('jsdom');
var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var should = chai.should();

var component = require('../');
var cached = require('../cached');

describe('cached', function () {

  it('should handle no arguments', function (done) {
    var called = 0;
    var f = component.cached(function () {
      called = called + 1;
      return arguments.length;
    });

    f().should.equal(0);
    called.should.equal(1);

    f().should.equal(0);
    called.should.equal(1);

    done();
  });

  it('should not recompute on equivalent structs', function (done) {
    var called = 0;
    var f = component.cached(function (input) {
      called = called + 1;
      return JSON.stringify(input);
    });

    f({a: 1, b: 2}).should.equal('{"a":1,"b":2}');
    called.should.equal(1);

    f({b: 2, a: 1}).should.equal('{"a":1,"b":2}');
    called.should.equal(1);

    f({a: 1, b: 2, c: 3}).should.equal('{"a":1,"b":2,"c":3}');
    called.should.equal(2);

    f({a: 1, b: 2, c: 3}).should.equal('{"a":1,"b":2,"c":3}');
    called.should.equal(2);

    f({a: 1, b: 2}).should.equal('{"a":1,"b":2}');
    called.should.equal(3);

    done();
  });

  it('should not recompute on equivalent args', function (done) {
    var called = 0;
    var f = component.cached(function (a, b) {
      called = called + 1;
      return a.value + b.value;
    });
    var v = function (x) {
      return {value:x}
    }

    f(v(0), v(1)).should.equal(1);
    called.should.equal(1);

    f(v(0), v(1)).should.equal(1);
    called.should.equal(1);

    f(v(1), v(0)).should.equal(1);
    called.should.equal(2);

    f(v(1), v(0)).should.equal(1);
    called.should.equal(2);

    f(v(1), v(0), v(3)).should.equal(1);
    called.should.equal(3);

    done();
  });

  it('should handle single cursor', function (done) {
    var called = 0;
    var f = component.cached(function (cursor) {
      called = called + 1;
      return cursor.get('x') + ':' + cursor.get('y');
    });

    var a = Cursor.from(Immutable.fromJS({x:0, y:0}));
    f(a).should.equal("0:0");
    called.should.equal(1);

    f(a).should.equal("0:0");
    called.should.equal(1);

    f(a.set('x', 2)).should.equal("2:0");
    called.should.equal(2);

    f(a.set("x", 17).set("y", 14)).should.equal("17:14");
    called.should.equal(3);

    done();
  });

  it('should handle multiple cursor', function (done) {
    var called = 0;
    var point = function (point) {
      return point.get('x') + ':' + point.get('y');
    };
    var line = component.cached(function (from, to) {
      called = called + 1;
      return point(from) + '-' + point(to)
    });

    var a = Cursor.from(Immutable.fromJS({x:0, y:0}));
    var b = Cursor.from(Immutable.fromJS({x: 1, y:7}));

    line(a, b).should.equal("0:0-1:7");
    called.should.equal(1);

    line(a, b).should.equal("0:0-1:7");
    called.should.equal(1);

    line(a, b, a).should.equal("0:0-1:7");
    called.should.equal(2);

    line(a, b).should.equal("0:0-1:7");
    called.should.equal(3);

    done();
  });

  it('should handle cursor with-in a structure', function (done) {
    var called = 0;
    var cursor = Cursor.from(Immutable.fromJS({x: 1}));

    var f = component.cached(function (input) {
      called = called + 1;
      return called;
    });

    f({ a: cursor }).should.equal(1);
    f({ a: cursor }).should.equal(1);

    f({ a: cursor, b: cursor }).should.equal(2);
    f({ a: cursor, b: cursor }).should.equal(2);

    f({ a: cursor }).should.equal(3);
    f({ a: cursor.set("x", 2) }).should.equal(4);

    f({ a: {b: {c: cursor} } }).should.equal(5);
    f({ a: {b: {c: cursor} } }).should.equal(5);

    f({ a: {b: {c: [cursor]} } }).should.equal(6);
    f({ a: {b: {c: [cursor]} } }).should.equal(6);

    done();
  });

  it('should differ between cursor and immutable map', function (done) {
    var called = 0;
    var cursor = Cursor.from(Immutable.fromJS({x: 1}));
    var map = Immutable.fromJS({x: 1});

    var f = component.cached(function (input) {
      called = called + 1;
      return called;
    });

    f(cursor).should.equal(1);
    f(cursor).should.equal(1);

    f(map).should.equal(2);
    f(map).should.equal(2);

    f(cursor).should.equal(3);

    f({ a: cursor }).should.equal(4);

    f({ a: map }).should.equal(5);

    f({ a: {b: {c: map} } }).should.equal(6);
    f({ a: {b: {c: cursor} } }).should.equal(7);

    f({ a: {b: {c: [cursor]} } }).should.equal(8);
    f({ a: {b: {c: [map]} } }).should.equal(9);

    done();
  });


  it('should work with primitives', function (done) {
    var called = 0;
    var f = component.cached(function (input) {
      called = called + 1;
      return called;
    });

    f().should.equal(1);
    f().should.equal(1);

    f(void 0).should.equal(2);
    f(void 0).should.equal(2);

    f(null).should.equal(3);
    f(null).should.equal(3);

    f(1).should.equal(4);
    f(1).should.equal(4);

    f(1, 3).should.equal(5);
    f(1, 3).should.equal(5);

    f(1, "3").should.equal(6);
    f(1, "3").should.equal(6);

    f(true).should.equal(7);
    f(true).should.equal(7);

    f(false).should.equal(8);
    f(false).should.equal(8);

    done();
  });

  it('should work with mixed args & structures', function (done) {
    var called = 0;
    var cursor = Cursor.from(Immutable.fromJS({x: 1}));
    var map = Immutable.fromJS({y: 1});

    var f = component.cached(function (input) {
      called = called + 1;
      return called;
    });

    f(cursor, 1, map, "foo").should.equal(1);
    f(cursor, 1, map, "foo").should.equal(1);

    f(cursor, 1, map, "bar").should.equal(2);
    f(cursor, 1, map, "bar").should.equal(2);

    f(cursor, 1, cursor, "bar").should.equal(3);
    f(cursor, 1, cursor, "bar").should.equal(3);

    f(cursor, 1, {y: 1}, "bar").should.equal(4);
    f(cursor, 1, {y: 1}, "bar").should.equal(4);

    f(cursor, 1, map, "bar").should.equal(5);

    f({x: 1}, 1, map, "bar").should.equal(6);

    f([{x: 1}, 1, map, "bar"], cursor).should.equal(7);
    f([{x: 1}, 1, map, "bar"], cursor).should.equal(7);

    f({x: {y: {cursor: cursor, maps: [map]}, z: "boom"}}).should.equal(8);
    f({x: {y: {cursor: cursor, maps: [map]}, z: "boom"}}).should.equal(8);

    done();
  });

  it('should be customizable', function (done) {
    var c = cached.withDefaults({
      isEqualProps: function (expected, actual) {
        return actual === expected ||
               actual && expected && actual[0] &&
               actual[0].equals && actual[0].equals(expected[0]);
      }
    });

    var called = 0;
    var a = Immutable.fromJS({x: 1});
    var b = Immutable.fromJS({x: 1});

    var f = c(function (input) {
      called = called + 1;
      return called;
    });

    f(a).should.equal(1);
    f(a).should.equal(1);
    f(b).should.equal(1);

    f({equals: function() { return true } }).should.equal(2);

    f(1).should.equal(2);
    f({whatever: 'you want'}).should.equal(3);

    done();
  });
});
