'use strict';

// node modules
var path = require('path');
// npm modules
var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var glob = require('glob');
var matter = require('gray-matter');
// local modules
// var loader = require('lib/loaders/load-patterns.js');
var escapeRegExp = require('lib/utils/strings.js').escapeRegExp;
var singularize = require('lib/utils/strings.js').singularize;
var pluralize = require('lib/utils/strings.js').pluralize;
var arrayify = require('lib/utils/strings.js').arrayify;

var Collection = function(app) {
  this.app = app;
  this.views = app.views;
};

/**
 * [create description]
 *
 * @param {[type]} name  [description]
 * @param {[type]} paths [description]
 *
 * @return {[type]}
 */
Collection.prototype.create = function (name, files, options) {
  var opts = options || {};
  var app = this.app;
  var plural = pluralize(name);

  files = arrayify(files);

  app.create(plural, singularize(name), opts);

  files.forEach(function(file) {
    app[plural](file);
  });
};

Collection.prototype.getPatterns = function (name) {
  var views = this.views;

  return views[name] || views[singularize(name)];
};

/**
 * [groupBy description]
 *
 * @param {Array|string} paths
 * @param {string} prop
 *
 * @return {Object}
 */
Collection.prototype.groupBy = function (paths, prop) {
  var app = this.app;
  var cwd = app.options.cwd;

  var files = glob.sync(paths);
  var grouped = _.groupBy(files.map(function(file) {
    var parsed = matter.read(path.resolve(cwd, file));
    return { type: parsed.data[prop] || '', path: file };
  }), 'type');

  var keys = Object.keys(grouped);
  var res = {};
  keys.forEach(function(key) {
    if (key === '') {
      return;
    }
    res[pluralize(key)] = _.pluck(grouped[key], 'path');
  });

  return res;
};

Collection.prototype.addToPages = function (name) {
  var app = this.app;
  var views = this.views;
  var collectionViews = views[singularize(name)] || views[pluralize(name)];

  for (var key in collectionViews) {
    // console.log('view key: ', collectionViews[key]);
  }
};

Collection.prototype.writeFiles = function (name) {
  var app = this.app;
  var views = this.views;
  var collectionViews = views[singularize(name)];

  for(var key in collectionViews) {
    collectionViews[key].render(function(err, res) {
      // console.log('result: ', res);
    });
  }
  // console.log('app views: ', app.views);

  // files.forEach(function(file) {
  //   if (glob.hasMagic(file)) {
  //     var globPath = files.splice(file, 1).pop();
  //     files = files.concat(glob.sync(globPath));
  //   }
  // });

  // files.forEach(function(file) {
  //   console.log('app engine: ', app.engine('.hbs'));
  //   //console.log('write file:\r\n', file);
  //   app.postRender(escapeRegExp(path.resolve(cwd, file)), function(file, next) {
  //     //console.log('file data: ', file.data.src.name);
  //     //next();
  //   });
  // });
}

module.exports = function (app) {
  return new Collection(app);
};

