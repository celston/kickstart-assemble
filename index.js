'use strict';
// set a global variable to store root dir for path references
global.__base = global.__base || __dirname + '/';

// node modules
var path = require('path');

// node_modules modules
var _ = require('lodash');
var assemble = require('assemble');
var async = require('async');
var chalk = require('chalk');
var defaults = require('object.defaults');
var extname = require('gulp-extname');
var glob = require('glob');
var tap = require('gulp-tap');

/**
 * Compile Templates
 *
 * @param {object}   options
 * @param {Function} done
 *
 * @return {Function}
 */
function compileSite(options, done) {

  var opts = options || {};
  var app = assemble.init();
  var cwd = app.options.cwd || process.cwd();
  var isProduction = opts.production || false;
  var assets = opts.assets || '';
  var helpers = opts.helpers || [];
  var layout = opts.layout || null;
  var layouts = opts.layouts || [];
  var partials = opts.partials || opts.includes || [];
  var pages = opts.pages || [];
  var dest = opts.dest || cwd;
  var data = opts.data || {};

  app.engine('html', require('engine-assemble'));

  app.data(data);
  app.option('production', isProduction);
  app.option('assets', assets);
  app.option('layout', layout);
  app.layouts(layouts);

  if (_.isObject(partials)) {
    for(var key in partials) {
      app.create(key, {renderType: 'partial'});
      app[key](partials[key]);
    }
  } else {
    app.partials(partials);
  }

  /**
   * Compile Templates task
   *
   * @param {function}
   */
  app.task('compile:site', function() {
    var filter = require('gulp-filter')(function(file) {
      return /\.(markdown|md|mdown|mkd)$/.test(file.ext);
    }, { restore: true} );

    return app.src(pages)
      .pipe(filter)
      .pipe(require('gulp-markdown')())
      .pipe(filter.restore)
      .pipe(extname())
      .pipe(app.dest(dest));
  });

  // run the tasks, then execute the callback
  app.run('compile:site', done);
}

/**
 * Compile Styleguide
 *
 * @param {object}   opts
 * @param {Function} done
 *
 * @return {Function}
 */
function compileStyleguide(options, done) {
  var opts = options || {};
  var app = assemble.init();
  var cwd = app.options.cwd || process.cwd();

  var defaults = {
    production: false,
    assets: '',
    helpers: path.join(__base, 'lib/helpers/helper-data.js'),
    layouts: path.join(__base, 'lib/templates/layouts/*.{hbs,html}'),
    layout: 'default-layout',
    includes: path.join(__base, 'lib/templates/includes/**/*.{hbs,html}'),
    src: path.join(__base, 'lib/templates/pages/**/*.{hbs,html}'),
    dest: path.resolve(cwd, 'styleguide')
  };

  // handle both assetsPath and assets
  opts.assets = opts.assetPath || opts.assets;
  // handle a range of property names for partials
  opts.patterns =  opts.patterns || opts.partials || opts.materials;
  // set pattern group names if specified
  opts.patternCategories = opts.patternCategories || [];

  // extend the default options with the user options
  opts = _.extend(defaults, opts);

  // app.options['minimal config'] = true;
  // ======================
  // App Configuration
  // ======================
  // register engine for .html files
  app.engine('html', require('engine-assemble'));
  // json,yml data sources
  app.data(opts.data);
  app.option('production', opts.production);
  app.option('assets', opts.assets);
  app.option('layout', opts.layout);
   // register patterns
  app.option('patternCategories', opts.patternCategories);
  // register layouts and partials
  app.layouts(opts.layouts);
  app.partials(opts.includes);
  app.pages(opts.pages);

  // ======================
  // Handle Pattern Files
  // ======================
  var collections = require('./lib/loaders/pattern-collections.js')(app);

  // load the pattern partials
  // if the partials value is an object, the the keys are pattern categories
  // so we iterate the keys and create custom partials for each category
  // otherwise, we have a glob path to all partials and we need to group
  // by category specified in each files front-matter
  if (typeof opts.patterns === 'object') {
    var keys = Object.keys(opts.patterns || {});
    app.set('patternCategories', keys);
    keys.forEach(function(key) {
      collections.create(key, opts.patterns[key], { viewType: 'partial' });
      //collections.addToPages(key);
    });
  } else {
    var grouped = collections.groupBy(opts.patterns, 'category');
    var keys = Object.keys(grouped || {});
    app.set('patternCategories', keys);
    keys.forEach(function(key) {
      collections.create(key, grouped[key], { viewType: 'partial' });
      //collections.writeFiles(key);
    });
  }

  // ======================
  // Helpers
  // ======================
  app.asyncHelper('styleguide-collection', require('./lib/helpers/helper-render-collection.js'));
  app.asyncHelper('styleguide-collections', require('./lib/helpers/helper-render-collections.js'));
  app.asyncHelper('styleguide-navigation', require('./lib/helpers/helper-render-navigation.js'));

  /**
   * Compile Styleguide task
   *
   * @param {function}
   */
  app.task('compile:styleguide', function() {
    // pipe the source files though to dest
    return app.src(opts.src)
      .pipe(extname())
      .pipe(app.dest(opts.dest));
  });

  // copy styleguide assets over to styleguide dest folder
  app.task('copy:assets', function() {
    var dest = path.join(opts.dest, opts.assets);
    app.copy(__base + '/dist/assets/**', dest);
  });

  // run the tasks, then execute the callback
  return app.run(['compile:styleguide', 'copy:assets'], done);

}

// export the functions for use in other modules
module.exports = {
  templates: compileSite,
  styleguide: compileStyleguide
};
