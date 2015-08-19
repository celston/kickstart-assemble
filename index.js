// node modules
var path = require('path');

// node_modules modules
var _ = require('lodash');
var fse = require('fs-extra');
var assemble = require('assemble');
var defaults = require('object.defaults');
var extname = require('gulp-extname');
var tap = require('gulp-tap');

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
function compileTemplates(options, done) {
  var app = assemble.init();
  var opts = options || {};
  var cwd = process.cwd();
  var isProduction = opts.production || false;
  var assets = opts.assets || '';
  var helpers = opts.helpers || [];
  var layout = opts.layout || null;
  var layouts = opts.layouts || [];
  var partials = opts.partials || [];
  var pages = opts.pages || [];
  var dest = opts.dest || cwd;
  var data = opts.data || {};

  app.data(data);
  app.option('production', isProduction);
  app.option('assets', assets);
  app.option('layout', layout);
  app.engine('html', require('engine-handlebars'));
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
  var app = assemble.init();
  opts = opts || {};

  var cwd = process.cwd();
  var isProduction = opts.production || config.production;

  // the kickstart-assemble pages used to display the styleguide patterns
  var src = opts.src ? path.resolve(cwd, opts.src) : config.src;
  // this is the destination of the compiled styleguide
  var dest = opts.dest ? path.resolve(cwd, opts.dest) : config.dest;

  // set the assets path if provided and make it relative to the dest just
  // to be safe
  var assets = opts.assetPath || '';

  // we're only doing this in the case that the user is choosing to override
  // the defaults for the styleguide generation
  var helpers = opts.helpers || config.helpers;
  // these really should be the styleguide layouts unless the user has
  // passsed in their own layouts for the styleguide
  var layout = opts.layout || config.layout;
  var layouts = opts.layouts || config.layouts;
  // these are the partials used by the styleguide
  var includes = config.includes;

  // these are the user partials referenced in the user pages
  var partials = opts.partials || opts.patterns || opts.materials || null;
  // these are the user pages that should be displayed within the styleguide
  var pages = opts.pages ? path.resolve(cwd, opts.pages) : {};
  // this is the user data that is referrenced with the user layouts, pages
  // and partials
  var data = opts.data ? opts.data : {};

  app.data(data);
  app.option('production', isProduction);
  app.option('assets', assets);
  app.option('layout', layout);

  // register engine for .html files
  app.engine('html', require('engine-handlebars'));

  // register layouts and partials
  app.layouts(layouts);
  app.partials(includes);
  app.pages(pages);

  app.helper('toc', require('helper-toc'));

  // create assemble templates based on passed-in pattern categories
  // or just use the source files that were passed in if there are no patterns
  // passed in
  if (_.isObject(partials)) {
    for(var key in partials) {
      var singular = singularize(key);
      var plural = pluralize(key);

      app.create(plural, singular, {renderType: 'partial'});
      app[plural](partials[key]);
    }
  } else {
    app.partials(partials);
  }

  app.asyncHelper('rendercollection', require('lib/helpers/helper-render-collection.js'));
  app.asyncHelper('rendercollections', require('lib/helpers/helper-render-collections.js'));

  // assemble task
  app.task('compile:styleguide', function() {
    // console.log('app: ', app);
    return app.src(src)
      .pipe(tap(function(file, t) {
        console.log('file name: ', file.path);
      }))
      .pipe(extname())
      .pipe(app.dest(dest));
  });

  // copy assets (css, js, etc.) task
  app.task('copy:assets', function(done) {
    return fse.copy(__base + '/dist/assets', dest + '/public', done);
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
