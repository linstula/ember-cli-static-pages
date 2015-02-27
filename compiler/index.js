var Handlebars = require('handlebars');
var walkSync = require('walk-sync');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

function Compiler(appRoot, staticPagesRoot) {
  this.appRoot = path.resolve(appRoot);
  this.staticPagesRoot = path.join(this.appRoot, staticPagesRoot);
}

Compiler.prototype.collectInputFilePaths = function(dirPath, type) {
  var inputPath = path.join(this.staticPagesRoot, dirPath);

  if (!fs.existsSync(inputPath)) {
    console.log('No directory found at: ' + inputPath);
    return [];
  }

  var filePaths = walkSync(inputPath).filter(function(filePath) {
    return filePath.substr(filePath.length - type.length) === type;
  });

  return filePaths;
};

Compiler.prototype.registerHelper = function(dirPath, filePath) {
  var inputPath = path.join(this.staticPagesRoot, dirPath, filePath);
  var name = filePath.substring(0, filePath.length - 3) // remove extension from path

  var helperFunction = require(inputPath);
  Handlebars.registerHelper(name, helperFunction);
};

Compiler.prototype.registerPartial = function(dirPath, filePath) {
  var inputPath = path.join(this.staticPagesRoot, dirPath, filePath);
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

Compiler.prototype.compileHTMLFromTemplate = function(filePath) {
  var templatePath = path.join(this.staticPagesRoot, filePath);
  var templateString = fs.readFileSync(templatePath, 'utf8');

  var template = Handlebars.compile(templateString);

  return template();
};

Compiler.prototype.compileTemplates = function(templatesDirPath, outputDir) {
  debugger
  var outputBasePath = path.join(this.staticPagesRoot, outputDir);
  var templateFiles = this.collectInputFilePaths(templatesDirPath, '.hbs');

  if (!fs.existsSync(outputBasePath)) {
    fs.mkdirSync(outputBasePath);
  }

  for (var i = 0; i < templateFiles.length; i++) {
    var htmlString = this.compileHTMLFromTemplate(path.join(templatesDirPath, templateFiles[i]));
    var htmlFilePath = templateFiles[i].replace('.hbs', '.html');

    fs.writeFileSync(path.join(outputBasePath, htmlFilePath), htmlString);
  }
};

Compiler.prototype.cleanup = function(outputDir) {
  var outputBasePath = path.join(this.staticPagesRoot, outputDir);

  rimraf.sync(outputBasePath);
};

module.exports = Compiler;
