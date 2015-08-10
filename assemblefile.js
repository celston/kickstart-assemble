// node modules
var path = require('path');

// node_modules modules
var _ = require('lodash');
var assemble = require('assemble');
var defaults = require('object.defaults');
var extname = require('gulp-extname');
var Handlebars = require('handlebars');

// local modules
var config = require('./config');

// compile templates
exports.templates = function compileTemplate(options, done) {
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
  app.partials(partials);

  // assemble task
  app.task('compile:templates', function() {
    return app.src(pages)
      .pipe(extname())
      .pipe(app.dest(dest));
  });

  // run the tasks, then execute the callback
  app.run('compile:templates');
  done && done();
}

// compile styleguide
exports.styleguide = function compileStyleguide(opts, done) {
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

  // create assemble templates based on passed-in pattern categories
  var categories = Object.keys(opts.patterns);
  categories.forEach(function(cat) {
    app.create(cat, {renderType: 'partial'});
    app[cat](opts.patterns[cat]);
  });

  // assemble task
  app.task('compile:styleguide', function() {
    app.partials(patterns);

    return app.src(pages)
      .pipe(extname())
      .pipe(app.dest(dest));
  });

  // run the tasks, then execute the callback
  app.run('compile:styleguide');
  done && done();

}
