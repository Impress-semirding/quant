const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const configs = require('./config');

module.exports = () => ({
  ...configs,
  mode: 'development',
  devServer: {
    open: true,
    port: 8080,
    hot: true,
    contentBase: path.join(__dirname, '../dist'),
    publicPath: '/',
    compress: true,
    disableHostCheck: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        // target: 'http://8.218.54.54:9876',
        target: 'http://127.0.0.1:9876',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
    extensions: ['.js', 'jsx'],
  },
  externals: {},
  module: {
    rules: [{
      test: /\.(js|jsx|ts|tsx)$/,
      // exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
      }],
    },
    {
      test: /\.(css|less)$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
        },
        // {
        //   loader: 'postcss-loader',
        //   options: {
        //     postcssOptions: {
        //       plugins: [
        //         [
        //           'postcss-preset-env',
        //         ],
        //       ],
        //     },
        //   },
        // },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            }
          },
        },
      ],
    },
    {
      test: /\.(ttf|eot|svg|png|jpg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          loader: 'file-loader'
        }
      ]
    },
    {
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'file-loader'
        }
      ]
    }
    ],
  },
  plugins: [
    // new webpack.ProgressPlugin(handler),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
      DEBUG: false,
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[name].css',
    }),
    new CopyPlugin({
      // Use copy plugin to copy *.wasm to output folder.
      patterns: [{
        // from: 'node_modules/onnxruntime-web/dist/*.wasm', to: 'js/[name][ext]'
        from: 'node_modules/monaco-editor/min/vs',
        to: 'vs',
      }],
    }),
    new HtmlWebpackPlugin({
      title: '量化策略平台',
      template: path.resolve(__dirname, '../src/index.ejs'),
      // filename: `${page}.html`,
      // chunks: [page],
    })
  ]
});
