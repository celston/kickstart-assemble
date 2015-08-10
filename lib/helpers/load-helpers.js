'use strict';

var merge = require('lodash.merge');

module.exports = function(assemble, names, options) {

  names = Array.isArray(names) ? names : [names];
  var opts = merge(assemble.options, options || {}, assemble.options.data || {});

  names.forEach(function(name) {
    var inflection = name.lastIndexOf('s') === name.length ? name : name + 's';

    assemble.helper(name, function(partial, context) {
      context = merge(this, context || {});
      var template = assemble.findPartial(partial);
      // var fn = Handlebars.compile(template);
      // return new Handlebars.safeString(fn(context));
      return template.render(context);
    });
  });
}
