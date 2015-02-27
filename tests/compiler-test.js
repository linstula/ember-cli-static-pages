/* globals require, QUnit */

var Compiler = require('../compiler');
var Handlebars = require('handlebars');
var path = require('path');

var module = QUnit.module;
var test = QUnit.test;

var templatesDirPath = '/templates/';
var helpersDirPath = '/helpers/';
var partialsDirPath = '/partials/';

var helperFixtureFiles = ['nested/nested-helper.js', 'other-helper.js', 'title-helper.js'];
var partialFixtureFiles = ['footer.hbs', 'nested/nested-partial.hbs', 'other-partial.hbs'];
var templateFixtureFiles = ['other-template.hbs', 'template-with-helper-and-partial.hbs', 'template.hbs'];

var helperFixtureNames = ['nested/nested-helper', 'other-helper', 'title-helper'];
var partialFixtureNames = ['footer', 'nested/nested-partial', 'other-partial'];

var compiler;

function cleanupHandlebarsRegistries() {
  Handlebars.helpers = {};
  Handlebars.partials = {};
}

module('compiler', {
  beforeEach: function() {
    cleanupHandlebarsRegistries();

    var appRoot = 'tests/dummy/';
    var staticPagesRoot = '/static-pages';

    compiler = new Compiler(appRoot, staticPagesRoot);
  }
});

test('registerHelper registers a helper with Handlebars', function(assert) {
  assert.expect(1);

  compiler.registerHelper(helpersDirPath, 'title-helper.js');

  assert.equal(typeof Handlebars.helpers['title-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelper registers the correct name for a nested helper', function(assert) {
  assert.expect(1);

  compiler.registerHelper(helpersDirPath, 'nested/nested-helper.js');

  assert.equal(typeof Handlebars.helpers['nested/nested-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelpers registers helpers with Handlebars', function(assert) {
  assert.expect(helperFixtureNames.length);

  compiler.registerHelpers(helpersDirPath);

  var helpers = Object.keys(Handlebars.helpers);
  helpers.forEach(function(helper) {
    assert.equal(typeof Handlebars.helpers[helper], 'function', 'registers the helper with Handlebars');
  });
});

test('registerPartial registers a partial with Handlebars', function(assert) {
  assert.expect(1);

  compiler.registerPartial(partialsDirPath, 'footer.hbs');

  assert.equal(typeof Handlebars.partials['footer'], 'string', 'registers the partial with Handlebars');
});

test('registerPartial registers the correct name for a nested partial', function(assert) {
  assert.expect(1);

  compiler.registerPartial(partialsDirPath, 'nested/nested-partial.hbs');

  assert.equal(typeof Handlebars.partials['nested/nested-partial'], 'string', 'registers the partial with Handlebars');
});

test('registerPartials registers partials with Handlebars', function(assert) {
  assert.expect(partialFixtureNames.length);

  compiler.registerPartials(partialsDirPath);

  var partials = Object.keys(Handlebars.partials);
  partials.forEach(function(partial) {
    assert.equal(typeof Handlebars.partials[partial], 'string', 'registers the partial with Handlebars');
  });
});


test('collectInputFilePaths returns an array of filePaths for the given type', function(assert) {
  assert.expect(3);

  var expected = templateFixtureFiles;
  var actual = compiler.collectInputFilePaths(templatesDirPath, '.hbs');

  assert.deepEqual(actual, expected, 'returns files with the extention .hbs');

  expected = helperFixtureFiles;
  actual = compiler.collectInputFilePaths(helpersDirPath, '.js');

  assert.deepEqual(actual, expected, 'returns files with the extention .js');

  expected = partialFixtureFiles;
  actual = compiler.collectInputFilePaths(partialsDirPath, '.hbs');

  assert.deepEqual(actual, expected, 'returns files with the extention .hbs');
});

test('compileHTMLFromTemplate returns the static HTML for a Handlebars template with no helpers or partials', function(assert) {
  assert.expect(1);

  var expected = '<h1>This is a basic template</h1>\n<p>it has no helpers</p>\n<p>or partials</p>\n';
  var actual = compiler.compileHTMLFromTemplate(templatesDirPath + 'template.hbs');

  assert.equal(actual, expected, 'compileHTMLFromTemplate returns static HTML');
});

test('compileHTMLFromTemplate returns the static HTML for a Handlebars template with partials and helpers', function(assert) {
  assert.expect(1);

  compiler.registerPartials(partialsDirPath);
  compiler.registerHelpers(helpersDirPath);

  var expected = '<h1>This template has a helper and a partial.</h1>\n<h1>Hi, I am a helper.</h1>\n<p>This is my foot.</p>\n';
  var actual = compiler.compileHTMLFromTemplate(templatesDirPath + 'template-with-helper-and-partial.hbs');

  assert.equal(actual, expected, 'compileHTMLFromTemplate returns static HTML from template with partials');
});
