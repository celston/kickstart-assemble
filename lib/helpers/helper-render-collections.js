'use strict';

var async = require('async');
var chalk = require('chalk');
var merge = require('lodash').merge;
var pluralize = require('../../utils/strings.js').pluralize;


module.exports = collectionsHelper;
/**
 * collectionsHelper helper
 *
 * @param {string}   name    The name of the collection to render
 * @param {object}   options
 * @param {Function} done
 *
 * @return {string} the rendered file(s) results
 */
function collectionsHelper(options, done) {
  if (typeof options === 'function') {
    done = options;
  }

  if (this && this.app && this.options) {
    options = merge({}, this.options, options);
  }

  var ctx = this.context;
  var app = this.app;
  var views = app.views;
  var defaultTypes = this.app.type.renderable;
  var collections = [];

  for(var view in views) {
    if (defaultTypes.indexOf(view) === -1) {
      collections.push(view);
    }
  }

  if (collections.length === 0) {
    return;
  }

  try {
    var retval = '';

    async.forEachOf(collections, function(collection, index, callback) {
      var keys = Object.keys(views[collection]);
      console.log('keys: ', keys);
      if (keys.length === 0) {
        return callback(null);
      }

      async.map(keys, function(key, next) {
        var context = ctx[key];
        var item = views[collection][key];
        var content = '';

        item.render(context, function(err, content) {
          if (err) {
            console.log(chalk.red('ERROR [RENDER]: ' + collection + '\r\n' + err.message));
            return next(err);
          }

          console.log('rendering collection item');

          var notes = item.data.notes || '';
          content = wrapContent(addSectionTitle(addNotes(content, notes), key), key);
          next(null, content);
        });
      }, function(err, res) {
        if (err) {
          console.log(chalk.red('ERROR: ' + collection + '\r\n' + err.message));
          return callback(err);
        }

        retval = retval + addCollectionTitle(res.join('\n'), collection);
        callback(null);
      });
    }, function (err) {
      if (err) {
        console.log(chalk.red('ERROR:\r\n' + err.message));
        done(err);
      }

      done(null, retval);
    });

  } catch (err) {
    console.log(chalk.red('ERROR:\r\n' + err.message));
    done(err);
  }
};

function wrapContent(content, name) {
  name = (name !== undefined && name.length > 0) ? ' --' + name : '';

  return '<div class="ks-section' + pluralize(name) + '">' + content + '</div>';
}

function addCollectionTitle(content, title) {
  title = title || '';

  return '<div class="ks-collection">' +
            '<h2 class="ks-h2 ks-collection__title" id="' + pluralize(title) + '">' +
              pluralize(title) +
            '</h2>' +
            content +
          '</div>';
}

function addSectionTitle(content, title) {
  title = title || '';

  return '<h3 class="ks-h3 ks-section__title" id="' + title + '">' + title + '</h3>' + content;
}

function addNotes(content, notes) {
  return '<div class="ks-section__notes">' + notes + '</div>' + content;
}


