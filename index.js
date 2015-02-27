/* jshint node: true */
'use strict';

var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var Compiler = require('./compiler');
var express = require('express');

function StaticPageCompiler(appRoot, staticPagesRoot) {
  this.inputTree = path.join(appRoot, staticPagesRoot);
  this.compiler = new Compiler(appRoot, staticPagesRoot);

  this.helpersDir = 'helpers';
  this.partialsDir = 'partials';
  this.templatesDir = 'templates';
  this.fakeOutputPath = 'tmp/compiled-pages-fake';
}

StaticPageCompiler.prototype.read = function(readTree, destDir) {
  return readTree(this.inputTree)
    .then(function(inputPath) {
      rimraf.sync(this.fakeOutputPath);
      fs.mkdirSync(this.fakeOutputPath);

      this.compiler.registerHelpers(this.helpersDir);
      this.compiler.registerPartials(this.partialsDir);
      // this.compiler.cleanup('../compiled-pages');
      this.compiler.compileTemplates(this.templatesDir, '../compiled-pages');

      return this.fakeOutputPath;
    }.bind(this));
};
StaticPageCompiler.prototype.cleanup = function() { };

module.exports = {
  name: 'static-compiler',

  treeForPublic: function() {
    return new StaticPageCompiler(this.project.root, '/static-pages');
  },

  serverMiddleware: function(config) {
    var app = config.app;

    app.use(express.static('compiled-pages'));
  }
};
