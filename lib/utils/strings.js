'use strict';

var _ = require('lodash');

/**
 * [isPlural description]
 *
 * @param {[type]} str [description]
 *
 * @return {Boolean}
 */
function isPlural (str) {
  return _.endsWith(str, 's');
}

/**
 * [escape description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
module.exports.escape = function (str) {
  return _.escape(str);
};

/**
 * [escapeRegExp description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
module.exports.escapeRegExp = function (str) {
  return _.escapeRegExp(str);
}

/**
 * [arrayify description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
module.exports.arrayify = function (str) {
  return Array.isArray(str) ? str : [str];
};

/**
 * [pluralize description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
module.exports.pluralize = function (str) {
  if (!str || str.length === 0) {
    return str;
  }

  if (isPlural(str)) {
    return str.replace(/[^\w\s]|(.)(?=\1)/g, '');
  }

  return str + 's';
};

/**
 * [singularize description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
module.exports.singularize = function(str) {
  if (isPlural(str)) {
    return str.substring(0, str.length - 1);
  }

  return str;
};
