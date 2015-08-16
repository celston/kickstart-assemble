'use strict';

var path = require('path');

module.exports = {
  production: false,
  assets: path.resolve(__dirname, '../assets'),
  helpers: path.resolve(__dirname, '../helpers/helper-data.js'),
  layouts: path.resolve(__dirname, '../templates/layouts/*.hbs'),
  layout: 'default-layout',
  partials: path.resolve(__dirname, '../templates/includes/**/*.hbs'),
  pages: path.resolve(__dirname, '../templates/pages/**/*.hbs'),
  dest: path.resolve(process.cwd(), 'styleguide')
};
