'use strict';

var fs = require('fs');
var file = require('fs-utils');
var path = require('path');
var extend = require('extend-shallow');
var Handlebars = require('Handlebars');

// module.exports.register = function(Handlebars, options, params) {
//     opts = extend({cwd: process.cwd()}, opts);
//     extend(opts, opts.hash);


// }

module.exports = function component(name, opts) {
  opts = extend({cwd: process.cwd()}, opts);
  extend(opts, opts.hash);

  if (this && this.app && this.app.views) {
    try {
      var template = this.app.findPartial(name);
      var str = template.render(opts);
      return new Handlebars.SafeString(str, opts);
    } catch (err) {
      return err;
    }
  } else {
    extend(opts, opts.data && opts.data.root);
    try {
      return read(name, opts, opts.render);
    } catch (err) {
      return err;
    }
  }

  return '';
};

function read(fp, opts, fn) {
  var str = fs.readFileSync(fp, 'utf8');
  if (typeof fn === 'function') {
    str = fn(str)(opts);
  }
  return str;
}
