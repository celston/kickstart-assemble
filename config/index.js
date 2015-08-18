'use strict';

var path = require('path');

module.exports = {
  production: false,
  assets: path.resolve(process.cwd(), 'styleguide/assets'),
  helpers: path.resolve(__dirname, '../helpers/helper-data.js'),
  layouts: path.resolve(__dirname, '../templates/layouts/*.hbs'),
  layout: 'default-layout',
  includes: path.resolve(__dirname, '../templates/includes/**/*.hbs'),
  src: path.resolve(__dirname, '../templates/pages/**/*.hbs'),
  dest: path.resolve(process.cwd(), 'styleguide')
};
