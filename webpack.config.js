const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    context: path.resolve(__dirname, './src'),
        entry: {
          app: ['./stylesheet/styles.js', './javascript/index.js'],
        },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'javascript/bundle.js',
        publicPath: '/',
    },
    devServer: {
        contentBase: path.resolve(__dirname, './src'),
    },
    module: {
        rules: [
          {
              test: /\.js$/,
              exclude: [/node_modules/],
              use: [{
                  loader: 'babel-loader',
                  options: { presets: ['es2015'] }
              }],
          },
          {
              test: /\.scss$/,
              use: ExtractTextPlugin
                .extract({
                    fallbackLoader: 'style-loader',
                    loader: [
                        { loader: 'css-loader', query: { modules: false, sourceMaps: true } },
                        { loader: 'sass-loader'},
                    ]
                })
          },
          {
                test: /\.frag$/,
                use: 'raw-loader'
          },
          {
                test: /\.vert$/,
                use: 'raw-loader'
          }
          // Loaders for other file types can go here
        ],
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'stylesheet/main.css',
            allChunks: true,
        }),
    ],
}
