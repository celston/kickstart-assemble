// node modules
var path = require('path');

// node_modules modules
var _ = require('lodash');
var assemble = require('assemble');
var defaults = require('object.defaults');
var extname = require('gulp-extname');
var tap = require('gulp-tap');
var async = require('async');

// set __dirname as the base top simplify requiring local modules
require('app-module-path').addPath(__dirname);

// set a global variable to store root dir for path references
global.__base = global.__base || __dirname + '/';

// local modules
var config = require('lib/config');

// export the functions for use in other modules
module.exports.templates = compileTemplates;
module.exports.styleguide = compileStyleguide;

/**
 * [compileTemplates description]
 *
 * @param {[type]}   options [description]
 * @param {Function} done    [description]
 *
 * @return {[type]}
 */
function compileTemplates(opts, done) {
  var app = assemble.init();
  var cwd = process.cwd();

  opts = opts || {};

  var isProduction = opts.production || false;
  var assets = opts.assets || '';
  var helpers = opts.helpers || [];
  var layout = opts.layout || null;
  var layouts = opts.layouts || [];
  var partials = opts.partials || [];
  var pages = opts.pages || [];
  var dest = opts.dest || cwd;
  var data = opts.data || {};

  app.engine('html', require('engine-handlebars'));

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

  // assemble task
  app.task('compile:templates', function() {
    return app.src(pages)
      .pipe(extname())
      .pipe(app.dest(dest));
  });

  // run the tasks, then execute the callback
  app.run('compile:templates', done);
}

/**
 * [compileStyleguide description]
 *
 * @param {[type]}   opts [description]
 * @param {Function} done [description]
 *
 * @return {[type]}
 */
function compileStyleguide(opts, done) {
  opts = opts || {};

  var app = assemble.init();
  var cwd = process.cwd();

  // defaults
  var defaults = {
    production: false,
    assets: '',
    helpers: path.resolve(__base, 'lib/helpers/helper-data.js'),
    layouts: path.resolve(__base, 'lib/templates/layouts/*.hbs'),
    layout: 'default-layout',
    includes: path.resolve(__base, 'lib/templates/includes/**/*.hbs'),
    src: path.resolve(__base, 'lib/templates/pages/**/*.hbs'),
    dest: path.resolve(process.cwd(), 'styleguide')
  };

  // ensure paths are relative to running context
  opts.src ? path.resolve(cwd, opts.src) : null;
  opts.dest ? path.resolve(cwd, opts.dest) : null;
  opts.pages ? path.resolve(cwd, opts.pages) : null;

  // handle both assetsPath and assets
  opts.assets = opts.assetPath || opts.assets;
  // handle a range of property names for partials
  opts.partials =  opts.partials || opts.materials || null;

  // extend the default options with the user options
  opts = _.extend(defaults, opts);

  // create assemble templates based on passed-in pattern categories
  // or just use the source files that were passed in if there are no patterns
  // passed in
  if (_.isObject(opts.partials)) {
    var keys = Object.keys(opts.partials);

    if (!opts.patterns || opts.patterns.length === 0) {
      opts.patterns = keys;
    }

    keys.forEach(function(key) {
      var singular = singularize(key);
      var plural = pluralize(key);

      app.create(plural, singular, { renderType: 'partial' });
      app[plural](opts.partials[key]);
    });
  } else {
    app.partials(opts.partials);
  }

  // register engine for .html files
  app.engine('html', require('engine-handlebars'));

  app.data(opts.data);
  app.option('production', opts.production);
  app.option('assets', opts.assets);
  app.option('layout', opts.layout);
  app.option('patterns', opts.patterns);

  // register layouts and partials
  app.layouts(opts.layouts);
  app.partials(opts.includes);
  app.pages(opts.pages);

  app.asyncHelper('styleguide-collection', require('lib/helpers/helper-render-collection.js'));
  app.asyncHelper('styleguide-collections', require('lib/helpers/helper-render-collections.js'));
  app.asyncHelper('styleguide-navigation', require('lib/helpers/helper-render-navigation.js'));

  // assemble task
  app.task('compile:styleguide', function() {
    app.src(opts.src)
      // .pipe(tap(function(file, t) {
      //   console.log('file name: ', file.path);
      // }))
      .pipe(extname())
      .pipe(app.dest(opts.dest));
  });

  // copy assets task
  app.task('copy:assets', function() {
    assemble.copy(__base + '/dist/assets/**', opts.dest + '/public/');
  });

  // run the tasks, then execute the callback
  return app.run(['compile:styleguide', 'copy:assets'], done);

}

/**
 * Detects if a string ends with a suffix
 *
 * @param {string} str    the string to check
 * @param {string} suffix
 *
 * @return {boolean} returns 'true' if string ends with the suffix, 'false' if not
 */
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * [isPlural description]
 *
 * @param {[type]} str [description]
 *
 * @return {Boolean}
 */
function isPlural(str) {
  return endsWith(str, 's');
}

/**
 * [pluralize description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
function pluralize(str) {
  if (isPlural(str)) {
    return str;
  }

  return str + 's';
}

/**
 * [singularize description]
 *
 * @param {[type]} str [description]
 *
 * @return {[type]}
 */
function singularize(str) {
  if (isPlural(str)) {
    return str.substring(0, str.length - 1);
  }

  return str;
}
