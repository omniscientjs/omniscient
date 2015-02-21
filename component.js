"use strict";

var React     = require('react'),
    assign    = require('lodash.assign');

var shouldComponentUpdate = require('./shouldupdate');

module.exports = factory();
module.exports.withDefaults = factory;
function factory (options) {
  var debug;
  options = options || {};
  var _shouldComponentUpdate = options.shouldComponentUpdate;
  var _isCursor = options.isCursor || shouldComponentUpdate.isCursor;
  var _isImmutable = options.isImmutable || shouldComponentUpdate.isImmutable;
  var _isJsx = !!options.jsx;
  var _hiddenCursorField = options.cursorField || '__singleCursor';
  var _isNode = options.isNode || isNode;

  if (!_shouldComponentUpdate) {
    _shouldComponentUpdate = shouldComponentUpdate.withDefaults(options);
  }

  ComponentCreator.debug = debugFn;
  ComponentCreator.shouldComponentUpdate = _shouldComponentUpdate;
  return ComponentCreator;

  function ComponentCreator (displayName, mixins, render) {
    var options = createDefaultArguments(displayName, mixins, render);
    var methodStatics = pickStaticMixins(options.mixins);

    var componentObject = {
      displayName: options.displayName || options.render.name,
      mixins: options.mixins,
      render: function render () {
        if (debug) debug.call(this, 'render');
        // If `props[cursor]` is defined than it's just boxed cursor
        // in which case we unbox it.
        var input = this.props[_hiddenCursorField] || this.props;
        return options.render.call(this, input, this.props.statics);
      }
    };

    if (methodStatics) {
      componentObject.statics = methodStatics;
      removeOldStaticMethods(options.mixins);
    }

    var Component = React.createClass(componentObject);
    if (_isJsx) {
      return Component;
    }

    var create = function (key, props, statics) {
      var _props;
      var inputCursor;
      var children;

      if (typeof key === 'object') {
        statics = props;
        props = key;
        key   = void 0;
      }

      children = flatten(sliceFrom(arguments, statics).filter(_isNode));

      // If passed props is just a cursor we box it by making
      // props with `props[_hiddenCursorField]` set to given `props` so that
      // render will know how to unbox it. Note that __singleCursor proprety
      // name is used to make sure that render won't unbox props in case user
      // passed on with conflicting proprety name.
      if (_isCursor(props) || _isImmutable(props)) {
        inputCursor = props;
        _props = {};
        _props[_hiddenCursorField] = inputCursor;
      } else {
        _props = assign({}, props);
      }

      if (!!statics && !props.statics) {
        _props.statics = statics;
      }

      if (key) {
        _props.key = key;
      }

      if (!!children.length) {
        _props.children = children;
      }

      return React.createElement(Component, _props);
    };

    create.jsx = Component;

    if (methodStatics) {
      create = assign(create, methodStatics);
    }

    return create;
  }

  function debugFn (pattern, logFn) {
    debug = shouldComponentUpdate.withDefaults().debug(pattern, logFn);
  }

  function createDefaultArguments (displayName, mixins, render) {

    // (render)
    if (typeof displayName === 'function') {
      render      = displayName;
      mixins      = [];
      displayName = void 0;
    }

    // (mixins, render)
    if (typeof displayName === 'object' && typeof mixins === 'function') {
      render      = mixins;
      mixins      = displayName;
      displayName = void 0;
    }

    // (displayName, render)
    if (typeof displayName === 'string' && typeof mixins === 'function') {
      render = mixins;
      mixins = [];
    }

    // Else (displayName, mixins, render)

    if (!Array.isArray(mixins)) {
      mixins = [mixins];
    }

    if (!hasShouldComponentUpdate(mixins)) {
      mixins = [{
        shouldComponentUpdate: _shouldComponentUpdate
      }].concat(mixins);
    }

    return {
      displayName: displayName,
      mixins: mixins,
      render: render
    };
  }
}

function pickStaticMixins (mixins) {
  var filtered = mixins.filter(function (obj) {
    return !!obj.statics;
  });

  if (!filtered.length) {
    return void 0;
  }

  var statics = {};
  filtered.forEach(function (obj) {
    statics = assign(statics, obj.statics);
  });

  return statics;
}

function removeOldStaticMethods (mixins) {
  mixins.filter(function (obj) {
    return !!obj.statics;
  }).forEach(function (obj) {
    delete obj.statics;
  });
}

function hasShouldComponentUpdate (mixins) {
  return mixins.some(function (mixin) {
    return !!mixin.shouldComponentUpdate;
  });
}

function toArray (args) {
  return Array.prototype.slice.call(args);
}

function sliceFrom (args, value) {
  var array = toArray(args);
  var index = Math.max(array.indexOf(value), 0);
  return array.slice(index);
}

// Just a shallow flatten
function flatten (array) {
  return Array.prototype.concat.apply([], array);
}

// React's isNode check from ReactPropTypes validator
function isNode(propValue) {
  switch(typeof propValue) {
    case 'number':
    case 'string':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isNode);
      }
      if (React.isValidElement(propValue)) {
        return true;
      }
      for (var k in propValue) {
        if (!isNode(propValue[k])) {
          return false;
        }
      }
      return false;
    default:
      return false;
  }
}
