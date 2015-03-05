"use strict";

var shouldupdate = require('./shouldupdate');

/**
 * Directly fetch `cache` to use outside of Omniscient.
 * You can do this if you want to define functions that caches computed
 * result to avoid recomputing if invoked with equal arguments as last time.
 *
 * Returns optimized version of given `f` function for repeated
 * calls with an equal inputs. Returned function caches last input
 * and a result of the computation for it, which is handy for
 * optimizing `render` when computations are run on unchanged parts
 * of state. Although note that only last result is cached so it is
 * not practical to call it mulitple times with in the same `render`
 * call.
 *
 * @param {Function} Function that does a computation.
 *
 * @module cached
 * @returns {Function} Optimized function
 * @api public
 */
module.exports = factory();

/**
 * Create a “local” instance of the `cache` with overriden defaults.
 *
 * ### Options
 * ```js
 * {
 *   isEqualProps: function (currentProps, nextProps), // check props
 * }
 * ```
 *
 * @param {Object} [Options] Options with defaults to override
 *
 * @module cached.withDefaults
 * @returns {Function} cached with overriden defaults
 * @api public
 */
module.exports.withDefaults = factory;

function factory (methods) {
  var isEqual = (methods && methods.isEqualProps) || shouldupdate.isEqualProps;

  return function cached (f) {
    var input,
        output;

    return function () {
      if (!isEqual(arguments, input)) {
        output = f.apply(this, arguments);
      }
      // Update input either way to allow GC reclaim it unless
      // anything else is referring to it.
      input = arguments;
      return output
    }
  };
}
