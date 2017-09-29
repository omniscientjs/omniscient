var Immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');

var component = require('../');
var cached = require('../cached');

describe('cached', () => {
  test('should handle no arguments', done => {
    var called = 0;
    var f = component.cached(function() {
      called = called + 1;
      return arguments.length;
    });

    expect(f()).toBe(0);
    expect(called).toBe(1);

    expect(f()).toBe(0);
    expect(called).toBe(1);

    done();
  });

  test('should not recompute on equivalent structs', done => {
    var called = 0;
    var f = component.cached(function(input) {
      called = called + 1;
      return JSON.stringify(input);
    });

    expect(f({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    expect(called).toBe(1);

    expect(f({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(called).toBe(1);

    expect(f({ a: 1, b: 2, c: 3 })).toBe('{"a":1,"b":2,"c":3}');
    expect(called).toBe(2);

    expect(f({ a: 1, b: 2, c: 3 })).toBe('{"a":1,"b":2,"c":3}');
    expect(called).toBe(2);

    expect(f({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    expect(called).toBe(3);

    done();
  });

  test('should not recompute on equivalent args', done => {
    var called = 0;
    var f = component.cached(function(a, b) {
      called = called + 1;
      return a.value + b.value;
    });
    var v = function(x) {
      return { value: x };
    };

    expect(f(v(0), v(1))).toBe(1);
    expect(called).toBe(1);

    expect(f(v(0), v(1))).toBe(1);
    expect(called).toBe(1);

    expect(f(v(1), v(0))).toBe(1);
    expect(called).toBe(2);

    expect(f(v(1), v(0))).toBe(1);
    expect(called).toBe(2);

    expect(f(v(1), v(0), v(3))).toBe(1);
    expect(called).toBe(3);

    done();
  });

  test('should handle single cursor', done => {
    var called = 0;
    var f = component.cached(function(cursor) {
      called = called + 1;
      return cursor.get('x') + ':' + cursor.get('y');
    });

    var a = Cursor.from(Immutable.fromJS({ x: 0, y: 0 }));
    expect(f(a)).toBe('0:0');
    expect(called).toBe(1);

    expect(f(a)).toBe('0:0');
    expect(called).toBe(1);

    expect(f(a.set('x', 2))).toBe('2:0');
    expect(called).toBe(2);

    expect(f(a.set('x', 17).set('y', 14))).toBe('17:14');
    expect(called).toBe(3);

    done();
  });

  test('should handle multiple cursor', done => {
    var called = 0;
    var point = function(point) {
      return point.get('x') + ':' + point.get('y');
    };
    var line = component.cached(function(from, to) {
      called = called + 1;
      return point(from) + '-' + point(to);
    });

    var a = Cursor.from(Immutable.fromJS({ x: 0, y: 0 }));
    var b = Cursor.from(Immutable.fromJS({ x: 1, y: 7 }));

    expect(line(a, b)).toBe('0:0-1:7');
    expect(called).toBe(1);

    expect(line(a, b)).toBe('0:0-1:7');
    expect(called).toBe(1);

    expect(line(a, b, a)).toBe('0:0-1:7');
    expect(called).toBe(2);

    expect(line(a, b)).toBe('0:0-1:7');
    expect(called).toBe(3);

    done();
  });

  test('should handle cursor with-in a structure', done => {
    var called = 0;
    var cursor = Cursor.from(Immutable.fromJS({ x: 1 }));

    var f = component.cached(function(input) {
      called = called + 1;
      return called;
    });

    expect(f({ a: cursor })).toBe(1);
    expect(f({ a: cursor })).toBe(1);

    expect(f({ a: cursor, b: cursor })).toBe(2);
    expect(f({ a: cursor, b: cursor })).toBe(2);

    expect(f({ a: cursor })).toBe(3);
    expect(f({ a: cursor.set('x', 2) })).toBe(4);

    expect(f({ a: { b: { c: cursor } } })).toBe(5);
    expect(f({ a: { b: { c: cursor } } })).toBe(5);

    expect(f({ a: { b: { c: [cursor] } } })).toBe(6);
    expect(f({ a: { b: { c: [cursor] } } })).toBe(6);

    done();
  });

  test('should differ between cursor and immutable map', done => {
    var called = 0;
    var cursor = Cursor.from(Immutable.fromJS({ x: 1 }));
    var map = Immutable.fromJS({ x: 1 });

    var f = component.cached(function(input) {
      called = called + 1;
      return called;
    });

    expect(f(cursor)).toBe(1);
    expect(f(cursor)).toBe(1);

    expect(f(map)).toBe(2);
    expect(f(map)).toBe(2);

    expect(f(cursor)).toBe(3);

    expect(f({ a: cursor })).toBe(4);

    expect(f({ a: map })).toBe(5);

    expect(f({ a: { b: { c: map } } })).toBe(6);
    expect(f({ a: { b: { c: cursor } } })).toBe(7);

    expect(f({ a: { b: { c: [cursor] } } })).toBe(8);
    expect(f({ a: { b: { c: [map] } } })).toBe(9);

    done();
  });

  test('should work with primitives', done => {
    var called = 0;
    var f = component.cached(function(input) {
      called = called + 1;
      return called;
    });

    expect(f()).toBe(1);
    expect(f()).toBe(1);

    expect(f(void 0)).toBe(2);
    expect(f(void 0)).toBe(2);

    expect(f(null)).toBe(3);
    expect(f(null)).toBe(3);

    expect(f(1)).toBe(4);
    expect(f(1)).toBe(4);

    expect(f(1, 3)).toBe(5);
    expect(f(1, 3)).toBe(5);

    expect(f(1, '3')).toBe(6);
    expect(f(1, '3')).toBe(6);

    expect(f(true)).toBe(7);
    expect(f(true)).toBe(7);

    expect(f(false)).toBe(8);
    expect(f(false)).toBe(8);

    done();
  });

  test('should work with mixed args & structures', done => {
    var called = 0;
    var cursor = Cursor.from(Immutable.fromJS({ x: 1 }));
    var map = Immutable.fromJS({ y: 1 });

    var f = component.cached(function(input) {
      called = called + 1;
      return called;
    });

    expect(f(cursor, 1, map, 'foo')).toBe(1);
    expect(f(cursor, 1, map, 'foo')).toBe(1);

    expect(f(cursor, 1, map, 'bar')).toBe(2);
    expect(f(cursor, 1, map, 'bar')).toBe(2);

    expect(f(cursor, 1, cursor, 'bar')).toBe(3);
    expect(f(cursor, 1, cursor, 'bar')).toBe(3);

    expect(f(cursor, 1, { y: 1 }, 'bar')).toBe(4);
    expect(f(cursor, 1, { y: 1 }, 'bar')).toBe(4);

    expect(f(cursor, 1, map, 'bar')).toBe(5);

    expect(f({ x: 1 }, 1, map, 'bar')).toBe(6);

    expect(f([{ x: 1 }, 1, map, 'bar'], cursor)).toBe(7);
    expect(f([{ x: 1 }, 1, map, 'bar'], cursor)).toBe(7);

    expect(f({ x: { y: { cursor: cursor, maps: [map] }, z: 'boom' } })).toBe(8);
    expect(f({ x: { y: { cursor: cursor, maps: [map] }, z: 'boom' } })).toBe(8);

    done();
  });

  test('should be customizable', done => {
    var c = cached.withDefaults({
      isEqualProps: function(expected, actual) {
        return (
          actual === expected ||
          (actual &&
            expected &&
            actual[0] &&
            actual[0].equals &&
            actual[0].equals(expected[0]))
        );
      }
    });

    var called = 0;
    var a = Immutable.fromJS({ x: 1 });
    var b = Immutable.fromJS({ x: 1 });

    var f = c(function(input) {
      called = called + 1;
      return called;
    });

    expect(f(a)).toBe(1);
    expect(f(a)).toBe(1);
    expect(f(b)).toBe(1);

    expect(
      f({
        equals: function() {
          return true;
        }
      })
    ).toBe(2);

    expect(f(1)).toBe(2);
    expect(f({ whatever: 'you want' })).toBe(3);

    done();
  });
});
