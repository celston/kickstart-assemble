'use strict'

var path = require('path');
var async = require('async');
var chalk = require('chalk');
var file = require('fs-utils');
var merge = require('lodash').merge;
var _ = require('lodash');

module.exports = navigationHelper;

function navigationHelper(options, done) {
  if (typeof options === 'function') {
    done = options;
  }

  if (this && this.app && this.options) {
    options = merge({}, this.options, options);
  }

  // cache object properties
  var patterns = options.patterns;
  var app = this.app;
  var views = app.views;
  var coll = app.collection;

  // get the collection name from assemble to lookup the associated views
  var collections = _.map(patterns, function(pattern) {
    return coll[pattern];
  });

  try {
    collections.forEach(function(collection) {
      if (!collection) {
        return true;
      }

      var opts = options || {};
      var collViews = views[collection];
      var keys;

      if(!collViews) {
        return true;
      }

      keys = Object.keys(collViews);

      if (keys.length === 0) {
        return true;
      }

      async.map(keys, function(key, next) {
        next(null, renderItem(collViews[key], opts));
      }, function(err, res) {
        if (err) {
          console.log(chalk.red('ERROR: Navigation\r\n', err.message));
          return done(err);
        }

        done(null, renderSection(collection, res.join('\n')));
      });
    });
  } catch (err) {
    if (err) {
      console.log(chalk.red('ERROR: Navigation\r\n', err.message));
      return done(err);
    }
  }
}

function renderSection(name, items) {
  return '<ol><li>' + name + '<ol>' + items + '</ol></li></ol>';
}

function renderItem(item, opts) {
  opts = opts || {};
  var data = item.data;
  var name = data.title || data.src.name || '[unknown item]';
  var href = getItemHref(item, opts);

  return '<li><a href="' + href + '">' + name + '</a></li>';
}

function getItemHref(item, opts) {
  return '#';
}
