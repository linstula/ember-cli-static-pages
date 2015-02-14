var Handlebars = require('handlebars');
var walkSync = require('walk-sync');
var fs = require('fs');
var path = require('path');

function Compiler(rootPath) {
  this.rootPath = rootPath;
}

Compiler.prototype.collectInputFilePaths = function(dirPath, type) {
  var inputPath = path.join(this.rootPath, dirPath);
  var filePaths = walkSync(inputPath).filter(function(filePath) {
    return filePath.substr(filePath.length - type.length) === type;
  });

  return filePaths;
};

Compiler.prototype.registerHelper = function(dirPath, filePath) {
  var inputPath = path.join(this.rootPath, dirPath, filePath);
  var name = filePath.substring(0, filePath.length - 3) // remove extension from path

  var helperFunction = require(inputPath);
  Handlebars.registerHelper(name, helperFunction);
};

Compiler.prototype.registerPartial = function(dirPath, filePath) {
  var inputPath = path.join(this.rootPath, dirPath, filePath);
  var name = filePath.substring(0, filePath.length - 4) // remove extension from path

  var partialString = fs.readFileSync(inputPath, 'utf8');
  Handlebars.registerPartial(name, partialString);
};

Compiler.prototype.registerHelpers = function(helpersDirPath) {
  var helperFiles = this.collectInputFilePaths(helpersDirPath, '.js');

  for (var i = 0; i < helperFiles.length; i++) {
    this.registerHelper(helpersDirPath, helperFiles[i]);
  }
};

Compiler.prototype.registerPartials = function(partialsDirPath) {
  var partialFiles = this.collectInputFilePaths(partialsDirPath, '.hbs');

  for (var i = 0; i < partialFiles.length; i++) {
    this.registerPartial(partialsDirPath, partialFiles[i]);
  }
};

module.exports = Compiler;
