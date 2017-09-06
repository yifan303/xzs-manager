var loaders = require('./common/loaders.js')

var {postcss,entry,lib,resolve,htmlConfig} = require('./common/config.js')

var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry:Object.assign({},entry,lib),
  module:{
    loaders
  },
  postcss,
  output:{
    filename: "[name]-[chunkHash].js",
    path: path.resolve(__dirname,'../dist'),
  },
  resolve,
  plugins:[
    new webpack.optimize.CommonsChunkPlugin({
       names: ['lib', 'manifest']
    }),
    htmlConfig,
    new ExtractTextPlugin("[name]-[chunkhash].css"),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      },
      output: {
        comments: false,  // remove all comments
      },
      //exclude:[/^react$/,/ant/]
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("qa")
      }
    })
  ]
};
