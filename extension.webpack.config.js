const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const ManifestWebpackPlugin = require('./manifest.plugin')

require('dotenv').config({ path: '.env' })
const production = process.env.NODE_ENV === 'production' || false
const outputDir = path.resolve(__dirname, 'dist')

const defineEnv = {}
Object.keys(process.env)
  .filter((k) => k.indexOf('REACT_AP') > -1)
  .map((k) => (defineEnv[`process.env.${k}`] = JSON.stringify(process.env[k])))

module.exports = {
  entry: {
    background: path.join(__dirname, 'extension', 'background.js')
  },
  module: {
    rules: []
  },
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'extension/external', to: 'external' }]
    }),
    new webpack.DefinePlugin(defineEnv),
    new ManifestWebpackPlugin({
      production: production,
      packageJsonPath: path.join(__dirname, 'package.json'),
      manifestPath: path.join(__dirname, 'extension', 'manifest.json'),
      outputDir: outputDir
    })
  ],
  mode: 'production',
  output: {
    filename: '[name].js',
    path: outputDir,
    globalObject: 'this'
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
}
