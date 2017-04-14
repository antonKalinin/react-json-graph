const path = require('path');

module.exports = {
    devtool: 'eval',
    entry: {
        Graph: './lib/Graph/graph.css',
        Node: './lib/Node/node.css',
        Edge: './lib/Edge/edge.css',
    },
    output: {
        library: 'styles',
        libraryTarget: 'umd',
        path: path.join(__dirname, 'lib'),
        filename: '[name]/styles.js',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[name]__[local]_[hash:base64:3]',
                        },
                    },
                ],
            },
        ],
    },
};
