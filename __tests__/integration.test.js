const Immutable = require('immutable');
const immstruct = require('immstruct');

const ReactDOM = require('react-dom');
const component = require('../');
const React = require('react');

describe('component render test', () => {
  test('should only re-render components that depend on changed data, but call shouldComponentUpdate for all', done => {
    var FIRST = 0,
      SECOND = 1;
    var structure = immstruct({ items: [{ id: FIRST }, { id: SECOND }] });

    var calls = { render: {}, shouldComponentUpdate: {} };
    calls.render[FIRST] = 0;
    calls.render[SECOND] = 0;
    calls.shouldComponentUpdate[FIRST] = 0;
    calls.shouldComponentUpdate[SECOND] = 0;

    var mixins = [
      {
        // 5
        shouldComponentUpdate: function() {
          var id = this.props.cursor.get('id');
          calls.shouldComponentUpdate[id]++;

          return component.shouldComponentUpdate.apply(this, arguments);
        },
        // 7
        componentDidUpdate: function() {
          expect(calls.shouldComponentUpdate[FIRST]).toBe(1);
          expect(calls.shouldComponentUpdate[SECOND]).toBe(1);
          expect(calls.render[FIRST]).toBe(2);
          expect(calls.render[SECOND]).toBe(1);
          done();
        }
      }
    ];

    var Item = component('Item', mixins, function(props) {
      // 2
      // 6
      calls.render[props.cursor.toJS().id]++;
      return React.createElement('li', {}, '');
    });

    var List = component('List', function(props) {
      return React.createElement(
        'ul',
        {},
        props.cursor.toArray().map(function(item, i) {
          return Item('component-' + i, { cursor: item });
        })
      );
    });

    var div = document.createElement('div');
    ReactDOM.render(List({ cursor: structure.cursor('items') }), div); // 1

    structure.on('swap', function() {
      ReactDOM.render(List({ cursor: structure.cursor('items') }), div); // 4
    });

    structure.cursor().update('items', function(items) {
      return items.set(FIRST, Immutable.Map({ id: FIRST, changed: true })); // 3
    });
  });

  test('should handle updates that mutate owners state', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    var click = function(node) {
      var event = new window.Event('click', {
        bubbles: true,
        cancelable: false
      });
      node.dispatchEvent(event);
    };

    var structure = immstruct({
      items: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
    });

    var List = component('List', function(props) {
      var onRemove = function(item) {
        props.items.remove(props.items.indexOf(item));
      };

      return React.createElement(
        'ul',
        {},
        props.items.toArray().map(function(item) {
          return Item({
            item: item,
            key: 'item-' + item.get('id'),
            statics: { onRemove: onRemove }
          });
        })
      );
    });

    var Item = component('Item', function(props) {
      return React.createElement(
        'li',
        {
          className: props.item.get('isSelected') ? 'selected' : ''
        },
        React.createElement(
          'button',
          {
            id: 'item-' + props.item.get('id'),
            onClick: function() {
              props.statics.onRemove(props.item);
            }
          },
          props.item.get('id')
        )
      );
    });

    var render = function() {
      ReactDOM.render(List({ items: structure.cursor('items') }), root);
    };

    structure.on('swap', render);
    render();
    click(root.querySelector('button#item-1'));

    expect(root.querySelectorAll('li').length).toBe(3);
    expect(root.querySelectorAll('#item-1').length).toBe(0);

    click(root.querySelector('button#item-0'));

    expect(root.querySelectorAll('li').length).toBe(2);
    expect(root.querySelectorAll('button#item-1').length).toBe(0);
    expect(root.querySelectorAll('button#item-0').length).toBe(0);
  });
});
