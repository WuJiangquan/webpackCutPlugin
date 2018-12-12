const webpack = require('webpack')
var path = require('path')
var config = require('./config')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const isProd = process.env.NODE_ENV === 'production';
const WebviewPreloadListPlugin = require('../sdkOptimize/preload-assets-plugin');
const webpackcpplugin = require("webpackcpplugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const envConfig = config.getEnvConfig();
const webpackConfig = merge(base, {
  // target: isProd?'web':'node',
    entry: {
      app: ["./src/ssr/client-main.js"]
    },
    resolve: {
      alias: {
        'create-api': './create-api-client.js'
      }
    },
    optimization: isProd?{
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    }:{},
    plugins: [
      // strip dev-only code in Vue source
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.VUE_ENV': '"client"'
      }),
      new VueSSRClientPlugin(),
      new webpackcpplugin({
        assetsRoot :  path.resolve(__dirname, envConfig.assetsRoot),
        to : path.resolve(__dirname, "../vueServerBundle/") ,
        test : /\.json$/,
      })
    ]
  })
  
  if (process.env.NODE_ENV === 'production') {
    webpackConfig.plugins.push(
      // auto generate service worker
      new SWPrecachePlugin({
        cacheId: 'vue-hn',
        filename: 'service-worker.js',
        minify: true,
        dontCacheBustUrlsMatching: /./,
        staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
        runtimeCaching: [
          {
            urlPattern: '/',
            handler: 'networkFirst'
          },
          {
            urlPattern: /\/(top|new|show|ask|jobs)/,
            handler: 'networkFirst'
          },
          {
            urlPattern: '/item/:id',
            handler: 'networkFirst'
          },
          {
            urlPattern: '/user/:id',
            handler: 'networkFirst'
          }
        ]
      }),
      new WebviewPreloadListPlugin({
        "projectId":"4",// 项目ID 
        "author":"peter",//开发者
        "domain":"eventsapi.37games.com",// 保存资源列表的域名
        "email":"peter@gm99.com",// 开发这的企业邮箱
        "assetsPublicPath": "https://gbares.37games.com/",//线上访问的域名（线上根目录）
        "assetsJson" : "",// 打包出来的列表保存到本地那个目录
        "hashFunction" : "md5",// 计算文件哈希的算法，默认使用webpack的默认哈希算法，目前知道的是md4
        "defaultPath" : "/dist",
        "params": {// 上传资源列表到boss 后台时，使用上传的参数。
          appid: "",
          publishPath: ""
        },
        storePath : ""
      })
    )
  }
  
  module.exports = webpackConfig