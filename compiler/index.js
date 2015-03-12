var Handlebars = require('handlebars');
var walkSync = require('walk-sync');
var fs = require('fs-extra');
var path = require('path');

function Compiler(options) {
  this.appRoot = path.resolve(options.appRoot);
  this.staticPagesRoot = path.join(this.appRoot, options.staticPagesRoot);
  this.outputPath = path.join(this.appRoot, options.outputPath);
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

Compiler.prototype.registerHelper = function(helperDir, filePath) {
  var helperPath = path.join(helperDir, filePath);
  var name = filePath.substring(0, filePath.length - 3) // remove extension from path

  var helperFunction = require(helperPath);
  Handlebars.registerHelper(name, helperFunction);
};

Compiler.prototype.registerPartial = function(partialDir, filePath) {
  var partialPath = path.join(partialDir, filePath);
  var name = filePath.substring(0, filePath.length - 4) // remove extension from path

  var partialString = fs.readFileSync(partialPath, 'utf8');
  Handlebars.registerPartial(name, partialString);
};

Compiler.prototype.registerHelpers = function(helpersDirPath) {
  var helperFiles = this.collectInputFilePaths('helpers', '.js');

  for (var i = 0; i < helperFiles.length; i++) {
    this.registerHelper(helpersDirPath, helperFiles[i]);
  }
};

Compiler.prototype.registerPartials = function(partialsDirPath) {
  var partialFiles = this.collectInputFilePaths('partials', '.hbs');

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

Compiler.prototype.compileTemplates = function(templatesDirPath) {
  this.registerHelpers(path.join(this.staticPagesRoot, 'helpers'));
  this.registerPartials(path.join(this.staticPagesRoot, 'partials'));

  var outputBasePath = path.join(this.outputPath);
  var templateFiles = this.collectInputFilePaths('templates', '.hbs');

  if (!fs.existsSync(outputBasePath)) {
    fs.mkdirSync(outputBasePath);
  }

  for (var i = 0; i < templateFiles.length; i++) {
    var htmlString = this.compileHTMLFromTemplate(path.join(templatesDirPath, templateFiles[i]));
    var htmlFilePath = templateFiles[i].replace('.hbs', '.html');

    var pathParts = htmlFilePath.split('/');

    if (pathParts.length === 1) {
      fs.writeFileSync(path.join(outputBasePath, pathParts[0]), htmlString);
    } else {
      var directories = pathParts.slice(0, (pathParts.length - 1)).join('/');
      var file = pathParts[pathParts.length - 1];

      fs.mkdirsSync(path.join(outputBasePath, directories));
      fs.writeFileSync(path.join(outputBasePath, directories, pathParts[pathParts.length - 1]), htmlString);
    }
  }
};

Compiler.prototype.cleanup = function() {
  fs.removeSync(this.outputPath);
};

module.exports = Compiler;
