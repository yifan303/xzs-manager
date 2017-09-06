var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path')
var node_modules = path.resolve(__dirname,'../../node_modules')

module.exports={
  // 入口
  entry:{
    index:[path.join(__dirname,'../../src/index.js')]
  },
  // lib
  lib:{
    lib:['react','react-dom','antd','react-router','jquery','moment']
  },
  // html插件
  htmlConfig:new HtmlWebpackPlugin({
    template:'./webpack/common/template.html'
  }),
  // postcss 支持css-module变量定义
  postcss:[require('postcss-modules-values')],
  resolve:{
    "alias":{
      "widget":path.resolve(__dirname,'../../src/widget')
    //   "ant":path.resolve(node_modules,'antd','dist/antd.min.js'),
    //   "react":path.resolve(node_modules,'react','dist/react.min.js'),
    //   'react-dom':path.resolve(node_modules,'react-dom','dist/react-dom.min.js')
    }
  }
};
