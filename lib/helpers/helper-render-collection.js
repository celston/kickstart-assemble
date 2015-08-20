'use strict';

var async = require('async');
var chalk = require('chalk');


module.exports = collectionHelper;

/**
 * collectionHelper helper
 *
 * @param {string}   name    The name of the collection to render
 * @param {object}   options
 * @param {Function} done
 *
 * @return {string} the rendered file(s) results
 */
function collectionHelper(name, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  var ctx = this.context;
  var collection = this.app.views[name];

  if (collection === undefined || Object.keys(collection).length == 0) {
    console.log(chalk.red('No items were found for the collection ' + name));
    return done(null);
  }

  try {
    var keys = Object.keys(collection);

    async.map(keys, function(key, next) {
      collection[key].render(ctx, function(err, content) {
        if (err) {
          return next(err);
        }

        next(null, content);
      });
    }, function(err, res) {
      if (err) {
        console.log(chalk.red('There was a problem rendering the collection: ' + name));
        return done(err);
      }

      done(null, res.join('\n'));
    });
  } catch (err) {
    console.log(chalk.red('There was a problem rendering the collection: ' + name));
    return done(err);
  }
};
