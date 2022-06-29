const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
require('dotenv').config({ path: '.env' })

const production = process.env.NODE_ENV === 'production' || false

module.exports = {
  entry: {
    main: path.join(__dirname, 'src', 'index.tsx'),
    initializer: path.join(__dirname, 'src', 'initializer.ts')
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/hands-up'),
    globalObject: 'this',
    library: 'HandsUp',
    libraryExport: 'default',
    publicPath: '/'
  },
  optimization: {
    minimize: production,
    minimizer: [new TerserPlugin({})]
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
}
