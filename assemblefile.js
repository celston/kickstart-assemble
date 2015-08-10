var assemble = require('assemble');
var defaults = require('object.defaults');
var extname = require('gulp-extname');
var path = require('path');
var _ = require('lodash');
var Handlebars = require('handlebars');
var config = require('./config');

module.exports = function(opts, done) {
  opts = opts || {};

  // ===================
  // Merge User Settings
  // ===================
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

  var categories = Object.keys(opts.patterns);
  categories.forEach(function(cat) {
    assemble.helper(cat, function(pattern, context, options) {
      options = _.extend(context, options);
      var hash = options.hash || {};
      options = _.extend({glob: {}, sep: '\n'}, options, opts.compose, hash);

      var ctx = _.extend(assemble.data, opts, this);

      var partial = assemble.findPartial(pattern);
      var template = partial.render(options);
      return new Handlebars.SafeString(template);
    });
  });

  assemble.option('production', isProduction);
  assemble.option('assets', assets);
  assemble.option('layout', layout);
  assemble.option('patterns', opts.patterns);

  // register engine for .html files
  assemble.engine('html', require('engine-handlebars'));

  // register layouts and partials
  assemble.layouts(layouts);
  assemble.partials(partials);


  // ===================
  // Styleguide Task
  // ===================
  assemble.task('styleguide', function() {
    assemble.partials(patterns);

    return assemble.src(pages)
      .pipe(extname())
      .pipe(assemble.dest(dest));
  });

  // run the tasks, then execute the callback
  assemble.run('styleguide', done);

}
