'use strict';

var path = require('path');

module.exports = {
  production: false,
  assets: path.resolve(__dirname, '../assets'),
  helpers: path.resolve(__dirname, '../helpers/helper-patterns.js'),
  layouts: path.resolve(__dirname, '../templates/layouts/*.hbs'),
  layout: path.resolve(__dirname, '../templates/layouts/default-layout.hbs'),
  partials: path.resolve(__dirname, '../templates/includes/**/*.hbs'),
  pages: path.resolve(__dirname, '../templates/pages/**/*.hbs'),
  dest: path.resolve(process.cwd(), 'styleguide')
};
