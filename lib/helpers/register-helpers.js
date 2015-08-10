'use strict';

var path = require('path');
var file = require('fs-utils');
var glob = require('globule');
var _ = require('lodash');

module.exports.register = function (Handlebars, options, params) {
  var assemble = params.assemble;
  var opts = options || {};
  opts.compose = opts.compose || {};

  var cwd = path.join.bind(null, opts.cwd || '');

  // get an array of pattern categories based upon the assemble.options.patterns object keys
  var categories = Object.keys(opts.patterns);

  // right here I need to register the helpers
  // by calling helper.register but I don't know how

  categories.forEach(function(cat) {
    var inflection = cat.lastIndexOf('s') === (cat.length - 1) ? cat : cat + 's';
    //console.log('glob pattern: ', opts.patterns[inflection][0]);
    var files = glob.find(cwd(opts.patterns[inflection][0]));

    files.map(function(filepath) {
      //console.log('FILE OBJ: \r\n', file);
      var pattern = cat + '-' + path.basename(filepath);
      //console.log('PATTERN:\r\n', pattern);
      // console.log('FILE PATH: ', filepath);
      var template = file.readFileSync(filepath);
      // console.log('TEMPLATE:\r\n', template);
      Handlebars.registerPartial(pattern, template);
    });

    Handlebars.registerHelper(cat, function(pattern, context, options) {
      options = _.extend(context, options);
      var hash = options.hash || {};
      options = _.extend({glob: {}, sep: '\n'}, options, opts.compose, hash);

      var ctx = _.extend(assemble.opts.data, opts, this);

      var template = Handlebars.partials[cat + '-' + pattern];
      var fn = Handlebars.compile(template);
      return new Handlebars.safeString(fn(context));
    });
  });
};
