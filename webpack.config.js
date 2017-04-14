const reactExternal = {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react',
};

const reactDOMExternal = {
    root: 'ReactDOM',
    commonjs2: 'react-dom',
    commonjs: 'react-dom',
    amd: 'react-dom',
};

module.exports = {
    devtool: 'eval',
    entry: './lib/Graph/index.js',
    externals: {
        react: reactExternal,
        'react-dom': reactDOMExternal,
    },
    output: {
        library: 'Graph',
        libraryTarget: 'umd',
        path: __dirname,
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
