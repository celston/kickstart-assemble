'use strict'
// node modules
var path = require('path');
// npm modules
var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var file = require('fs-utils');
var pluralize = require('../utils/strings.js').pluralize;

module.exports = navigationHelper;

function navigationHelper(options, done) {
  if (typeof options === 'function') {
    done = options;
  }

  if (this && this.app && this.options) {
    options = _.merge({}, this.options, options);
  }

  // cache object properties
  var app = this.app;
  var views = app.views;
  var coll = app.collection;
  var categories = app.get('patternCategories');

  // get the collection name from assemble to lookup the associated views
  // var collections = _.map(patterns, function(pattern) {
  //   // console.log('pattern: ', pattern);
  //   return coll[pattern];
  // });

  if (views.pages) {
    categories.push('pages');
  }

  var retval = '';

  try {
    async.forEachOf(categories, function(collection, idx, callback) {
      if (!collection) {
        return callback(null);
      }

      var opts = options || {};
      var collViews = views[collection];
      var keys;

      if(!collViews) {
        return callback(null);
      }

      keys = Object.keys(collViews);

      if (keys.length === 0) {
        return callback(null);
      }

      async.map(keys, function(key, next) {
        next(null, renderItem(collViews[key], opts));
      }, function(err, res) {
        if (err) {
          console.log(chalk.red('ERROR: Navigation\r\n' + err.message));
          return callback(err);
        }

        retval = retval + renderSection(collection, res.join('\n'));
        callback(null);
      });

    }, function(err) {
      if (err) {
        console.log(chalk.red('ERROR:\r\n' + err.message));
        done(err);
      }

      retval = '<ol class="ks-nav-group">' + retval + '</ol>';

      done(null, retval);
    });
  } catch (err) {
    if (err) {
      console.log(chalk.red('ERROR: Navigation\r\n' + err.message));
      return done(err);
    }
  }
}

function renderSection(name, items) {
  name = pluralize(name);
  return '<li class="ks-nav-group__title"><a href=#' + name + '>' + name + '</a><ol class="ks-nav-group__items">' + items + '</ol></li>';
}

function renderItem(item, opts) {
  opts = opts || {};
  var data = item.data;
  var name = data.title || data.src.name || '[unknown item]';
  var href = getItemHref(item, opts);

  return '<li class="ks-nav__item"><a class="ks-nav__link" href="' + href + '">' + name + '</a></li>';
}

function getItemHref(item, opts) {
  var dest = item.data.dest;
  var dirname = dest.dirname;
  var basename = dest.basename;
  // get the last part of the dirname path
  var collection = dirname.split('/').pop();

  return collection + '/' + basename;
}
