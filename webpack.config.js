var webpack = require('webpack');
var path = require("path");

module.exports = {
    entry: [
        './src/js/ts/app.ts'
    ],
    output: {
        filename: './src/js/bundle.js',
        //path: path.join(__dirname, "dist"),
        //publicPath: "./src/",

        //chunkFilename: "[chunkhash].js"
    },
    plugins: [
        // new webpack.ProvidePlugin({
        //     'createjs': 'imports?this=>global!exports?preloadjs!preloadjs',
        // })
    ],
    // Turn on sourcemaps
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
        alias: {
            'createjs' : '../preload.js'
        }
    },
    //   // Add minification
    //   plugins: [
    //     new webpack.optimize.UglifyJsPlugin()
    //   ],
    module: {
        loaders: [
            //typescript loader
            { test: /\.ts$/, loader: 'ts' }
        ]
    }
}
