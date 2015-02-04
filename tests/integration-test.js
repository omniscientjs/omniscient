var chai = require('chai');
var should = chai.should();
var jsdom = require('jsdom');

var Immutable = require('immutable');
var immstruct = require('immstruct');

var React, d;

var component;

describe('component render test', function () {

  beforeEach(function () {
    // React needs a dom before being required
    // https://github.com/facebook/react/blob/master/src/vendor/core/ExecutionEnvironment.js#L39
    global.document = jsdom.jsdom('<html><body></body></html>');
    global.window = global.document.parentWindow;
    global.navigator = global.window.navigator;

    // React creates a dummy dom node that uses the current document.
    // As require calls are cached, this does not get recreated,
    // so flush the cache, so it does
    // https://groups.google.com/forum/#!topic/reactjs/5UlF-mBsG2o
    for (var i in require.cache) delete require.cache[i];

    // require React each time, as we have get a new jsdom
    React = require('react');
    d = React.DOM;

    // component also uses React, so needs to happen after flush
    component = require('../');
    // component.debug();
  });

  it('should only re-render components that depend on changed data, but call shouldComponentUpdate for all', function (done) {
    var FIRST = 0, SECOND = 1;
    var structure = immstruct({ items: [ { id: FIRST }, { id: SECOND } ] });

    var calls = { render: {}, shouldComponentUpdate: {} };
    calls.render[FIRST] = 0;
    calls.render[SECOND] = 0;
    calls.shouldComponentUpdate[FIRST] = 0;
    calls.shouldComponentUpdate[SECOND] = 0;

    var mixins = [{
      // 5
      shouldComponentUpdate: function () {
        var id = this.props[component.cursor].get('id');
        calls.shouldComponentUpdate[id]++;

        return component.shouldComponentUpdate.apply(this, arguments);
      },
      // 7
      componentDidUpdate: function () {
        calls.shouldComponentUpdate[FIRST].should.equal(1);
        calls.shouldComponentUpdate[SECOND].should.equal(1);
        calls.render[FIRST].should.equal(2);
        calls.render[SECOND].should.equal(1);
        done();
      }
    }];

    var Item = component('Item', mixins, function (cursor) {
      // 2
      // 6
      calls.render[cursor.toJS().id]++;
      return d.li({}, '');
    });

    var List = component('List', function (cursor) {
      return d.ul({}, cursor.toArray().map(function (item, i) {
        return Item('component-' + i, item);
      }));
    });

    var div = document.createElement('div');
    React.render(List(structure.cursor('items')), div); // 1

    structure.on('swap', function () {
      React.render(List(structure.cursor('items')), div); // 4
    });

    structure.cursor().update('items', function (items) {
      return items.set(FIRST, Immutable.Map({ id: FIRST, changed: true })); // 3
    });
  });
});
