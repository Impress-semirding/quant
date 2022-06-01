const path = require('path');

const entry = {
  app: path.resolve(__dirname, '../src/index.js'),
};

const output = {
  filename: 'js/[name].bundle.js',
  path: path.resolve(__dirname, '../dist/'),
  publicPath: '/',
};

const target = 'web';

module.exports = {
  entry,
  output,
  target,
};
