var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports=[
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel',
    query: {
      presets: ['es2015','react', 'stage-0'],
      plugins:['transform-decorators-legacy']
    }
  },
  {
    test: /\.less$/,
    exclude: /node_modules/,
    loader: ExtractTextPlugin.extract('style-loader','css-loader?modules&localIdentName=[path]-[name]-[hash:base64:5]')
  },
  {
    test: /\.css$/,
    include: /node_modules/,
    loader: ExtractTextPlugin.extract('style-loader','css-loader')
  },
  {
    test: /\.json$/,
    exclude: /node_modules/,
    loader: 'json-loader',
  },
  {
    test: /\.(png|jpg)$/,
    exclude: /node_modules/,
    loader: 'url-loader?limit=8192&name=[name]_[hash].[ext]'
  }
];
