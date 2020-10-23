const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: ['babel-polyfill', './src/index.ts']
  },

  resolve: {
    extensions: ['.ts', '.js', '.json']
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js'
  },

  devtool: 'source-map',
  performance: { hints: false },

  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'src/'),
        loaders: ['babel-loader', 'ts-loader'],
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true)
    })
  ]
}