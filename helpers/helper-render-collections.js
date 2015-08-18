'use strict';

var async = require('async');
var chalk = require('chalk');

/**
 * rendercollection helper
 *
 * @param {string}   name    The name of the collection to render
 * @param {object}   options
 * @param {Function} done
 *
 * @return {string} the rendered file(s) results
 */
module.exports = function renderCollections(options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
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

  try {
    collections.forEach(function(collection) {
      var keys = Object.keys(views[collection]);

      if (keys.length === 0) {
        return true;
      }

      async.map(keys, function(key, next) {
        console.log(key + ': ', views[collection][key]);
        // I think right here I need to find the relevant info in the ctx
        // object and combine that info with the actual content
        // and pass that merged content into the render function so that I
        // can put the collection title above all of the content in the collection
        // But what do I do about the information for each collection item
        // like buttons, lists, etc? How do I get that information into the content?
        var context = ctx[key];
        views[collection][key].render(context, function(err, content) {
          // content is the actual HTML content of the item in the collection
          //  Maybe right here is where I need to add the information about the
          //  item in the collection e.g., any button information would be
          //  prepended to the content here before next is called
          //  ex: content = notes information + content
          if (err) {
            console.log(chalk.red('There was a problem rendering the collection: ' + collection));
            return next(err);
          }

          var notes = views[collection][key].data.notes || '';

          next(null, wrapContent(addSectionTitle(addNotes(content, notes), key), key));
        });
      }, function(err, res) {
        if (err) {
          console.log(chalk.red('There was a problem rendering the collection: ' + collection));
          return done(err);
        }

        done(null, addCollectionTitle(res.join('\n'), collection));
      });
    });

  } catch (err) {
    console.log(chalk.red('There was a problem rendering one or more of the collections'));
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


