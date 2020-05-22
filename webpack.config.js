const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    output: {
        path: __dirname,
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts'],
        modules: [
            path.resolve(__dirname, 'src'),
            "node_modules",
        ],
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
};
