const path = require('path');

module.exports = {
    devtool: 'eval',
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.css$/, 
                loader: 'style!css?modules&localIdentName=[name]__[local]_[hash:base64:3]'
            },
            {
                test: /\.js$/,
                loaders: ['babel'],
                exclude: /node_modules/,
                include: __dirname
            }
        ]
    }
};
