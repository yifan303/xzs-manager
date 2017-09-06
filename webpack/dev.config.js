var loaders = require('./common/loaders.js')

var {postcss,entry,lib,resolve,htmlConfig} = require('./common/config.js')

var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  devtool:'inline-source-map',
  entry:Object.assign({},entry,lib),
  module:{
    loaders
  },
  postcss,
  resolve,
  output:{
    filename: "[name]-[hash].js"
  },
  plugins:[
    new ExtractTextPlugin("[name]-[chunkhash].css"),
    new webpack.optimize.CommonsChunkPlugin({
       names: ['lib', 'manifest']
    }),
    new webpack.HotModuleReplacementPlugin(),
    htmlConfig,
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      }
    })
  ]
};
