'use strict';

var async = require('async');
var chalk = require('chalk');
var merge = require('lodash').merge;


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
  var views = this.app.views;
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
    collections.forEach(function(collection) {
      var keys = Object.keys(views[collection]);

      if (keys.length === 0) {
        return true;
      }

      async.map(keys, function(key, next) {
        var context = ctx[key];
        var item = views[collection][key];

        item.render(context, function(err, content) {
          if (err) {
            console.log(chalk.red('ERROR: ' + collection + '\r\n' + err.message));
            return next(err);
          }

          var notes = item.data.notes || '';
          content = wrapContent(addSectionTitle(addNotes(content, notes), key), key);
          next(null, content);
        });
      }, function(err, res) {
        if (err) {
          console.log(chalk.red('ERROR: ' + collection + '\r\n' + err.message));
          return done(err);
        }

        res = addCollectionTitle(res.join('\n'), collection);
        done(null, res);
      });
    });

  } catch (err) {
    console.log(chalk.red('ERROR:\r\n' + err.message));
    return done(err);
  }
};

function wrapContent(content, name) {
  name = (name !== undefined && name.length > 0) ? ' --' + name : '';

  return '<div class="ks-section' + name + '">' + content + '</div>';
}

function addCollectionTitle(content, title) {
  title = title || '';

  return '<div class="ks-collection">' +
            '<h2 class="ks-collection__title">' +
              title +
            '</h2>' +
            content +
          '</div>';
}

function addSectionTitle(content, title) {
  title = title || '';

  return '<h3 class="ks-section__title">' + title + '</h3>' + content;
}

function addNotes(content, notes) {
  return '<div class="ks-section__notes">' + notes + '</div>' + content;
}


