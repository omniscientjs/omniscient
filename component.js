"use strict";

var React     = require('react'),
    extend    = require('extend-object');

var shouldComponentUpdate = require('./shouldupdate');
var cursor = "{{private:cursor@omniscient}}";

module.exports = factory();
module.exports.withDefaults = factory;
module.exports.cursor = cursor;
function factory (methods) {
  var debug;
  methods = methods || {};
  var _shouldComponentUpdate = methods.shouldComponentUpdate;
  var _isCursor = methods.isCursor || shouldComponentUpdate.isCursor;

  if (!_shouldComponentUpdate) {
    _shouldComponentUpdate = shouldComponentUpdate.withDefaults(methods);
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
        var input = this.props[cursor] || this.props;
        return options.render.call(this, input, this.props.statics);
      }
    };

    if (methodStatics) {
      componentObject.statics = methodStatics;
      removeOldStaticMethods(options.mixins);
    }

    var Component = React.createClass(componentObject);

    var create = function (key, props) {
      var children = toArray(arguments).filter(React.isValidElement);

      if (typeof key === 'object') {
        props = key;
        key   = void 0;
      }

      if (!props) {
        props = { };
      }

      // If passed props is just a cursor we box it by making
      // props with `props[cursor]` set to given `props` so that
      // render will know how to unbox it. Note that non trivial
      // "{{private:cursor@omniscient}}" proprety name is used
      // to make sure that render won't unbox props in case user
      // passed on with conflicting proprety name.
      if (_isCursor(props)) {
        var input = props;
        props = {};
        props[cursor] = input;
      }

      if (key) {
        props.key = key;
      }

      if (!!children.length) {
        props.children = children;
      }

      return React.createElement(Component, props);
    };

    create.jsx = Component;

    if (methodStatics) {
      create = extend(create, methodStatics);
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
    statics = extend(statics, obj.statics);
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
