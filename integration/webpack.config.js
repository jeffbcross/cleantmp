require('ts-node/register');
const CopyToDisk = require('./webpack-plugin.ts');
const path = require('path');

console.log('output', path.resolve(__dirname + '/dist'));

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new CopyToDisk()
  ]
};
