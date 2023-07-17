'use strict'
const { VueLoaderPlugin } = require('vue-loader')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')

module.exports = {
  mode: 'development',
  entry: [
    './src/app.js'
  ],
  output: {
    path: path.resolve(__dirname, 'public')
  },
  //transpileDependencies: ['vuetify'],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.pug$/,
        use: ['pug-plain-loader']
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              data: "@import '@/styles/variables.scss'",
              indentedSyntax: true,
              implementation: require('sass'),
              fiber: require('fibers')
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: "@import '@/styles/variables.scss';"
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
    new Dotenv({
      path: './.env.dev'
    })
  ],
  devServer: {
    port: 9000,
    host: '0.0.0.0',
    disableHostCheck: true,
    contentBase: path.join(__dirname, 'public'),
    compress: true,
  }
} 