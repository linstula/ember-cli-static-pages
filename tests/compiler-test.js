/* globals require, QUnit */

var Compiler = require('../compiler');
var Handlebars = require('handlebars');
var fs = require('fs-extra');
var path = require('path');

var module = QUnit.module;
var test = QUnit.test;

var appRoot = 'tests/dummy/';
var staticPagesRoot = '/static-pages';
var outputPath = '/compiled-templates/';

var templatesDirPath = '/templates/';
var helpersDirPath = '/helpers/';
var partialsDirPath = '/partials/';

var helperFixtureFiles = ['nested/moar-nested/nested-helper.js', 'nested/nested-helper.js', 'other-helper.js', 'title-helper.js'];
var partialFixtureFiles = ['footer.hbs', 'nested/moar-nested/nested-partial.hbs', 'nested/nested-partial.hbs', 'other-partial.hbs'];
var templateFixtureFiles = ['other-template.hbs', 'template-with-helper-and-partial.hbs', 'template.hbs'];

var helperFixtureNames = ['nested/moar-nested/nested-helper', 'nested/nested-helper', 'other-helper', 'title-helper'];
var partialFixtureNames = ['footer', 'nested/moar-nested/nested-partial', 'nested/nested-partial', 'other-partial'];

var compiler, defaultCompiler;

function cleanupHandlebarsRegistries() {
  Handlebars.helpers = {};
  Handlebars.partials = {};
}

module('compiler', {
  beforeEach: function() {
    cleanupHandlebarsRegistries();

    defaultCompiler = {
      appRoot: appRoot,
      staticPagesRoot: staticPagesRoot,
      outputPath: outputPath
    };

    compiler = new Compiler(defaultCompiler);
  },

  afterEach: function() {
    compiler.cleanup();
  }
});

test('is initialized with the correct properties', function(assert) {
  assert.expect(3);

  assert.ok(compiler.appRoot, 'appRoot is set');
  assert.ok(compiler.staticPagesRoot, 'staticPagesRoot is set');
  assert.ok(compiler.outputPath, 'outputPath is set');
});

test('`cleanup` cleans up the output directory relative to the appRoot', function(assert) {
  assert.expect(2);

  defaultCompiler.outputPath = 'outputPath';
  compiler = new Compiler(defaultCompiler);

  var root = path.resolve(appRoot);
  var outputDirName = 'outputPath';
  var outputDirectory = path.join(root, outputDirName);

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  assert.ok(fs.existsSync(outputDirectory), 'precondition - output directory exists');

  compiler.cleanup();

  assert.ok(!fs.existsSync(outputDirectory), 'output directory does not exist');
});

test('`compileTemplates` calls compileHTMLFromTemplate for each .hbs file in the passed in directory', function(assert) {
  assert.expect(1);

  var count = 0;

  compiler.compileHTMLFromTemplate = function(templatePath) {
    count++;
    return '';
  };

  compiler.compileTemplates(templatesDirPath);

  assert.equal(count, templateFixtureFiles.length, 'compileHTMLFromTemplate was called once for each .hbs file in the passed in directory');
});

test('`compileTemplates` calls registerHelpers and registerPartials with the correct arguments', function(assert) {
  assert.expect(2);

  var count = 0;

  compiler.compileHTMLFromTemplate = function(templatePath) { return ''; };

  compiler.registerPartials = function(partialsDirPath) {
    return assert.equal(partialsDirPath, path.join(compiler.staticPagesRoot, 'partials'));
  };

  compiler.registerHelpers = function(helpersDirPath) {
    return assert.equal(helpersDirPath, path.join(compiler.staticPagesRoot, 'helpers'));
  };

  compiler.compileTemplates(templatesDirPath);
});

test('`compileTemplates` writes compiled templates to the outputPath relative to the appRoot', function(assert) {
  assert.expect(4);

  assert.ok(!fs.existsSync(compiler.outputPath), 'precondition - outputPath does not exist');

  compiler.compileTemplates(templatesDirPath);

  for (var i = 0; i < templateFixtureFiles.length; i++) {
    var templatePath = path.join(compiler.outputPath, templateFixtureFiles[i]).replace('.hbs', '.html');
    assert.ok(fs.existsSync(templatePath), templatePath + ' exists');
  }
});

test('`compileTemplates` correctly handles nested templates', function(assert) {
  assert.expect(2);

  var nestedTemplatePath = path.join(compiler.staticPagesRoot, 'templates/nested/nested-test.hbs');
  var nestedTemplateOutputPath = path.join(compiler.outputPath, 'nested/nested-test.html');

  if (!fs.existsSync(nestedTemplateOutputPath)) {
    fs.mkdirsSync(path.join(compiler.staticPagesRoot, 'templates/nested'));
    fs.writeFileSync(nestedTemplatePath, 'html string');
  }

  assert.ok(!fs.existsSync(nestedTemplateOutputPath), 'precondition - nestedTemplateOutputPath does not exist');

  compiler.compileTemplates(templatesDirPath);

  assert.ok(fs.existsSync(nestedTemplateOutputPath), 'handles nested templates');

  fs.removeSync(nestedTemplatePath);
});

test('`compileTemplates` correctly handles deeply nested templates', function(assert) {
  assert.expect(2);

  var deeplyNestedTemapltePath = path.join(compiler.staticPagesRoot, 'templates/nested/moar-nested/nested-test.hbs');
  var deeplyNestedTemplateOutputPath = path.join(compiler.outputPath, 'nested/moar-nested/nested-test.html');

  if (!fs.existsSync(deeplyNestedTemplateOutputPath)) {
    fs.mkdirsSync(path.join(compiler.staticPagesRoot, 'templates/nested/moar-nested'));
    fs.writeFileSync(deeplyNestedTemapltePath, 'html string');
  }

  assert.ok(!fs.existsSync(deeplyNestedTemplateOutputPath), 'precondition - deeplyNestedTemplateOutputPath does not exist');

  compiler.compileTemplates(templatesDirPath);

  assert.ok(fs.existsSync(deeplyNestedTemplateOutputPath), 'handles nested templates');

  fs.removeSync(deeplyNestedTemapltePath);
});

test('registerHelper registers a helper with Handlebars', function(assert) {
  assert.expect(1);

  compiler.registerHelper(path.join(compiler.staticPagesRoot, helpersDirPath), 'title-helper.js');

  assert.equal(typeof Handlebars.helpers['title-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelper registers the correct name for a nested helper', function(assert) {
  assert.expect(1);

  compiler.registerHelper(path.join(compiler.staticPagesRoot, helpersDirPath), 'nested/nested-helper.js');

  assert.equal(typeof Handlebars.helpers['nested/nested-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelper registers the correct name for a deeply nested helper', function(assert) {
  assert.expect(1);

  compiler.registerHelper(path.join(compiler.staticPagesRoot, helpersDirPath), 'nested/moar-nested/nested-helper.js');

  assert.equal(typeof Handlebars.helpers['nested/moar-nested/nested-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelpers calls registerHelper for each helper with the correct arguments', function(assert) {
  assert.expect(helperFixtureNames.length * 2);

  compiler.registerHelper = function(dir, file) {
    assert.equal(dir, path.join(compiler.staticPagesRoot, helpersDirPath), 'path is correct');

    var fixtureFileExists = helperFixtureFiles.indexOf(file) !== -1;
    assert.ok(fixtureFileExists, 'file path is correct');
  };

  compiler.registerHelpers(path.join(compiler.staticPagesRoot, helpersDirPath));
});

test('registerPartial registers a partial with Handlebars', function(assert) {
  assert.expect(1);

  compiler.registerPartial(path.join(compiler.staticPagesRoot, partialsDirPath), 'footer.hbs');

  assert.equal(typeof Handlebars.partials['footer'], 'string', 'registers the partial with Handlebars');
});

test('registerPartial registers the correct name for a nested partial', function(assert) {
  assert.expect(1);

  compiler.registerPartial(path.join(compiler.staticPagesRoot, partialsDirPath), 'nested/nested-partial.hbs');

  assert.equal(typeof Handlebars.partials['nested/nested-partial'], 'string', 'registers the partial with Handlebars');
});

test('registerPartial registers the correct name for a deeply nested partial', function(assert) {
  assert.expect(1);

  compiler.registerPartial(path.join(compiler.staticPagesRoot, partialsDirPath), 'nested/moar-nested/nested-partial.hbs');

  assert.equal(typeof Handlebars.partials['nested/moar-nested/nested-partial'], 'string', 'registers the partial with Handlebars');
});

test('registerPartials calls registerPartial for each partial with the correct arguments', function(assert) {
  assert.expect(partialFixtureNames.length * 2);

  compiler.registerPartial = function(dir, file) {
    assert.equal(dir, path.join(compiler.staticPagesRoot, partialsDirPath), 'path is correct');

    var fixtureFileExists = partialFixtureFiles.indexOf(file) !== -1;
    assert.ok(fixtureFileExists, 'file path is correct');
  };

  compiler.registerPartials(path.join(compiler.staticPagesRoot, partialsDirPath));
});

test('compileHTMLFromTemplate returns the static HTML for a Handlebars template with no helpers or partials', function(assert) {
  assert.expect(1);

  var expected = '<h1>This is a basic template</h1>\n<p>it has no helpers</p>\n<p>or partials</p>\n';
  var actual = compiler.compileHTMLFromTemplate(templatesDirPath + 'template.hbs');

  assert.equal(actual, expected, 'compileHTMLFromTemplate returns static HTML');
});

test('compileHTMLFromTemplate returns the static HTML for a Handlebars template with partials and helpers', function(assert) {
  assert.expect(1);

  compiler.registerPartials(path.join(compiler.staticPagesRoot, partialsDirPath));
  compiler.registerHelpers(path.join(compiler.staticPagesRoot, helpersDirPath));

  var expected = '<h1>This template has a helper and a partial.</h1>\n<h1>Hi, I am a helper.</h1>\n<p>This is my foot.</p>\n';
  var actual = compiler.compileHTMLFromTemplate(templatesDirPath + 'template-with-helper-and-partial.hbs');

  assert.equal(actual, expected, 'compileHTMLFromTemplate returns static HTML from template with partials');
});
