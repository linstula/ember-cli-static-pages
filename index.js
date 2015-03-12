/* jshint node: true */
'use strict';

var fs = require('fs-extra');
var path = require('path');
var Compiler = require('./compiler');
var express = require('express');

function StaticPageCompiler(appRoot, staticPagesRoot, outputPath) {
  this.inputTree = path.join(appRoot, staticPagesRoot);
  this.compiler = new Compiler({
    appRoot: appRoot,
    staticPagesRoot: staticPagesRoot,
    outputPath: outputPath
  });

  this.helpersDir = 'helpers';
  this.partialsDir = 'partials';
  this.templatesDir = 'templates';
  this.fakeOutputPath = 'tmp/compiled-pages-fake';
}

StaticPageCompiler.prototype.read = function(readTree, destDir) {
  return readTree(this.inputTree)
    .then(function(inputPath) {
      fs.removeSync(this.fakeOutputPath);
      fs.mkdirSync(this.fakeOutputPath);

      this.compiler.cleanup();
      this.compiler.compileTemplates(this.templatesDir);

      return this.fakeOutputPath;
    }.bind(this));
};
StaticPageCompiler.prototype.cleanup = function() { };

module.exports = {
  name: 'static-compiler',

  treeForPublic: function() {
    return new StaticPageCompiler(this.project.root, 'static-pages', 'compiled-pages');
  },

  serverMiddleware: function(config) {
    var app = config.app;

    app.use(express.static('compiled-pages'));
  }
};
