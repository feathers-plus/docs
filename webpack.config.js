
const path = require('path');
const webpack = require('webpack');
// const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
  entry: './client-bundle/index.js',
  output: {
    path: path.resolve(__dirname, 'themes', 'tech-docs', 'source', 'js'),
    filename: 'client-bundle.js'
  },
  /*
  plugins: [
    new BabiliPlugin(),
  ],
  */
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'] //, 'babili']
        }
      }
    ]
  },
  stats: {
    colors: true
  }
};
