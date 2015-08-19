'use strict';

var path = require('path');

module.exports = {
  production: false,
  helpers: path.resolve(__base, 'lib/helpers/helper-data.js'),
  layouts: path.resolve(__base, 'lib/templates/layouts/*.hbs'),
  layout: 'default-layout',
  includes: path.resolve(__base, 'lib/templates/includes/**/*.hbs'),
  src: path.resolve(__base, 'lib/templates/pages/**/*.hbs'),
  dest: path.resolve(process.cwd(), 'styleguide')
};
