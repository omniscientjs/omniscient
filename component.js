var React     = require('react'),
    extend    = require('extend-object');

var shouldComponentUpdate = require('./shouldupdate');
var debug;

module.exports = factory();
module.exports.withDefaults = factory;
var debugFn = module.exports.debug = function (pattern) {
  debug = shouldComponentUpdate.debug(pattern);
};

function factory (methods) {
  methods = methods || {};
  var _isCursor = methods.isCursor || shouldComponentUpdate.isCursor;
  var _shouldComponentUpdate = methods.shouldComponentUpdate;

  if (!_shouldComponentUpdate) {
    _shouldComponentUpdate = shouldComponentUpdate.withDefaults(methods);
  }

  Component.shouldComponentUpdate = _shouldComponentUpdate;
  Component.debug = debugFn;
  return Component;

  function Component (displayName, mixins, render) {
    var options = createDefaultArguments(displayName, mixins, render);
    var methodStatics = pickStaticMixins(options.mixins);

    var componentObject = {
      displayName: options.displayName,
      mixins: options.mixins,
      render: function render () {
        if (debug) debug.call(this, 'render');
        return options.render.call(this, this.props, this.props.statics);
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

      if (_isCursor(props)) {
        props = { cursor: props };
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
