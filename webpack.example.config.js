const path = require('path');

module.exports = {
    devtool: 'eval',
    entry: './example/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                include: __dirname,
            },
        ],
    },
};
