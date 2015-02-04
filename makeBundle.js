#!/usr/bin/env node
var derequire = require('derequire');
var browserify = require('browserify');
var shim = require('browserify-shim');

var fs = require('fs');
var UglifyJS = require('uglify-js');
var pack = require('./package.json');

var inputFile = './component.js';
var outputFile = './dist/omniscient.js';
var outputMinifiedFile = './dist/omniscient.min.js';

var header = generateHeader();

var b = browserify({
  standalone: 'omniscient'
});
b.add(inputFile);
b.transform(shim);
b.bundle(function(err, buf){
  var code = buf.toString();
  code = header + derequire(code);
  fs.writeFileSync(outputFile, code);

  var minfied = UglifyJS.minify(outputFile);
  fs.writeFileSync(outputMinifiedFile, header + minfied.code);
});

function generateHeader() {
  var header = '';

  header = '/**\n';
  header += '* Omniscient.js v' + pack.version + '\n';
  header += '* Authors: ' + pack.author + '\n';
  header += '***************************************/\n';

  return header;
}
