const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './index.js',
    target: 'node',
    output: {
        path: path.join(__dirname, ''),
        filename: 'series.js'
    },
    externals: [nodeExternals()]
};
