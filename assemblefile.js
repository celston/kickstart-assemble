// node modules
var path = require('path');

// node_modules modules
var _ = require('lodash');
var fse = require('fs-extra');
var assemble = require('assemble');
var defaults = require('object.defaults');
var extname = require('gulp-extname');
var Handlebars = require('handlebars');
var tap = require('gulp-tap');

// local modules
var config = require('./config');

module.exports.templates = compileTemplates;
module.exports.styleguide = compileStyleguide;

// compile templates
function compileTemplates(options, done) {
  var app = assemble.init();
  var opts = options || {};
  var cwd = process.cwd();
  var isProduction = opts.production || false;
  var assets = opts.assets || 'assets';
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

// compile styleguide
function compileStyleguide(opts, done) {
  var app = assemble.init();
  opts = opts || {};

  var cwd = process.cwd();
  var isProduction = opts.production || config.production;
  var assets = opts.assets || config.assets;
  var helpers = opts.helpers || config.helpers;
  var layout = opts.layout || config.layout;
  var layouts = opts.layouts || config.layouts;
  var partials = opts.partials ? path.resolve(cwd, opts.partials) : config.partials;
  var patterns = opts.src ? path.resolve(cwd, opts.src) : {};
  var pages = opts.pages ? path.resolve(cwd, opts.pages) : config.pages;
  var dest = opts.dest ? path.resolve(cwd, opts.dest) : config.dest;
  var data = opts.data ? opts.data : {};

  app.data(data);
  app.option('production', isProduction);
  app.option('assets', assets);
  app.option('layout', layout);

  // register engine for .html files
  app.engine('html', require('engine-handlebars'));

  // register layouts and partials
  app.layouts(layouts);
  app.partials(partials);

  app.helper('toc', require('helper-toc'));

  // create assemble templates based on passed-in pattern categories
  // or just use the source files that were passed in if there are no patterns
  // passed in
  if (_.isObject(opts.patterns)) {
    var patternPartials = opts.patterns;

    for(var key in patternPartials) {
      var singular = singularize(key);
      var plural = pluralize(key);

      app.create(plural, singular, {renderType: 'partial'});
      app[plural](patternPartials[key]);
    }
  } else {
    app.partials(patterns);
  }

  app.asyncHelper('rendercollection', require('./helpers/helper-render-collection.js'));
  app.asyncHelper('rendercollections', require('./helpers/helper-render-collections.js'));

  // assemble task
  app.task('compile:styleguide', function() {
    console.log('app: ', app);
    return app.src(pages)
      .pipe(tap(function(file, t) {
        console.log('file name: ', file.path);
      }))
      .pipe(extname())
      .pipe(app.dest(dest));
  });

  // copy assets (css, js, etc.) task
  app.task('copy:assets', function(done) {
    return fse.copy(__dirname + '/public/assets', dest + '/assets', done);
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

function isPlural(str) {
  return endsWith(str, 's');
}

function pluralize(str) {
  if (isPlural(str)) {
    return str;
  }

  return str + 's';
}

function singularize(str) {
  if (isPlural(str)) {
    return str.substring(0, str.length - 1);
  }

  return str;
}
