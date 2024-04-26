const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'ui', 'typescript', 'Main.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.join(__dirname, 'public', 'dist'), 
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join('template', 'index.html'),
      filename: path.join('..', 'index.html'), 
      inject: 'body', 
    }),
  ],
};