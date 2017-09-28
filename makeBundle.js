const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const inputFile = './component.js';
const outputFile = './dist/omniscient.js';
const outputMinifiedFile = './dist/omniscient.min.js';

function output(filename) {
  return {
    library: 'omniscient',
    filename: filename,
    libraryTarget: 'umd',
    umdNamedDefine: true
  };
}

function config(filename, plugins = []) {
  return {
    entry: inputFile,
    output: output(filename),
    externals: {
      react: 'React'
    },
    plugins
  };
}

webpack(
  [config(outputFile), config(outputMinifiedFile, [new UglifyJSPlugin()])],
  (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(
      stats.toString({
        chunks: false,
        colors: true
      })
    );
  }
);
