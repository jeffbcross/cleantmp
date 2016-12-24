const CopyToDisk = require('./webpack-plugin');

module.exports = {
  entry: './main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  plugins: [
    new CopyToDisk()
  ]
};
