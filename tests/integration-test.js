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
        var id = this.props.cursor.get('id');
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

    var Item = component('Item', mixins, function (props) {
      // 2
      // 6
      calls.render[props.cursor.toJS().id]++;
      return d.li({}, '');
    });

    var List = component('List', function (props) {
      return d.ul({}, props.cursor.toArray().map(function (item, i) {
        return Item('component-' + i, { cursor: item });
      }));
    });

    var div = document.createElement('div');
    React.render(List({ cursor: structure.cursor('items') }), div); // 1

    structure.on('swap', function () {
      React.render(List({ cursor: structure.cursor('items') }), div); // 4
    });

    structure.cursor().update('items', function (items) {
      return items.set(FIRST, Immutable.Map({ id: FIRST, changed: true })); // 3
    });
  });

  it('should handle updates that mutate owners state', function (done) {
    var click = function(node) {
      var event = document.createEvent('click');
      event.initEvent('click', true, false);
      node.dispatchEvent(event);
    };

    var structure = immstruct({
      items: [{ id: 0}, { id: 1},
              { id: 2}, { id: 3}]
    });

    var List = component('List', function (props) {
      var onRemove = function(item) {
        props.items.remove(props.items.indexOf(item));
      };

      return d.ul({}, props.items.toArray().map(function (item) {
        return Item({item: item,
                     key: 'item-' + item.get('id'),
                     statics: {onRemove: onRemove}});
      }));
    });

    var Item = component('Item', function (props) {
      return d.li({
        id: 'item-' + props.item.get('id'),
        className: props.item.get('isSelected') ? 'selected' : '',
        onClick: function() {
          props.statics.onRemove(props.item);
        }
      }, props.item.get('id'));
    });

    var render = function() {
      React.render(List({ items: structure.cursor('items') }), document.body);
    };

    structure.on('swap', render);
    render();

    var ul = document.body.firstChild;

    should.equal(ul.children.length, 4,
                 'should contain 4 list items');

    click(document.getElementById('item-1'));

    should.equal(ul.children.length, 3,
                 'item should have being removed');
    should.equal(document.getElementById('item-1'), null,
                 'item was removed');

    click(document.getElementById('item-0'));

    should.equal(ul.children.length, 2,
                 'item should have being removed');
    should.equal(document.getElementById('item-1'), null,
                 'item-1 is still removed');
    should.equal(document.getElementById('item-0'), null,
                 'item-0 was removed');

    done();
  });
});
