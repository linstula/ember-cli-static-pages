/* globals require, QUnit, process */

var Compiler = require('../compiler');
var Handlebars = require('handlebars');
var path = require('path');

var module = QUnit.module;
var test = QUnit.test;

var templatesDirPath = '/fixtures/templates/';
var helpersDirPath = '/fixtures/helpers/';
var partialsDirPath = '/fixtures/partials/';

var helperFixtureFiles = ['nested/nested-helper.js', 'other-helper.js', 'title-helper.js'];
var partialFixtureFiles = ['footer.hbs', 'nested/nested-partial.hbs', 'other-partial.hbs'];
var templateFixtureFiles = ['nested/nested-template.hbs', 'other-template.hbs', 'template-with-partials.hbs', 'template.hbs'];

var helperFixtureNames = ['nested/nested-helper', 'other-helper', 'title-helper'];
var partialFixtureNames = ['footer', 'nested/nested-partial', 'other-partial'];

var appRoot;

function cleanupHandlebarsRegistries() {
  Handlebars.helpers = {};
  Handlebars.partials = {};
}

module('compiler', {
  beforeEach: function() {
    cleanupHandlebarsRegistries();
    appRoot = process.cwd() + '/tests/dummy/';
  }
});

test('saves root from constructor param', function(assert) {
  assert.expect(1);

  var compiler = new Compiler('some-path/');

  assert.equal(compiler.rootPath, 'some-path/');
});

test('registerHelper registers a helper with Handlebars', function(assert) {
  assert.expect(1);

  var compiler = new Compiler(appRoot);

  compiler.registerHelper(helpersDirPath, 'title-helper.js');

  assert.equal(typeof Handlebars.helpers['title-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelper registers the correct name for a nested helper', function(assert) {
  assert.expect(1);

  var compiler = new Compiler(appRoot);

  compiler.registerHelper(helpersDirPath, 'nested/nested-helper.js');

  assert.equal(typeof Handlebars.helpers['nested/nested-helper'], 'function', 'registers the helper with Handlebars');
});

test('registerHelpers registers helpers with Handlebars', function(assert) {
  assert.expect(helperFixtureNames.length);

  var compiler = new Compiler(appRoot);

  compiler.registerHelpers(helpersDirPath);

  var helpers = Object.keys(Handlebars.helpers);
  helpers.forEach(function(helper) {
    assert.equal(typeof Handlebars.helpers[helper], 'function', 'registers the helper with Handlebars');
  });
});

test('registerPartial registers a partial with Handlebars', function(assert) {
  assert.expect(1);

  var compiler = new Compiler(appRoot);

  compiler.registerPartial(partialsDirPath, 'footer.hbs');

  assert.equal(typeof Handlebars.partials['footer'], 'string', 'registers the partial with Handlebars');
});

test('registerPartial registers the correct name for a nested partial', function(assert) {
  assert.expect(1);

  var compiler = new Compiler(appRoot);

  compiler.registerPartial(partialsDirPath, 'nested/nested-partial.hbs');

  assert.equal(typeof Handlebars.partials['nested/nested-partial'], 'string', 'registers the partial with Handlebars');
});

test('registerPartials registers partials with Handlebars', function(assert) {
  assert.expect(partialFixtureNames.length);

  var compiler = new Compiler(appRoot);

  compiler.registerPartials(partialsDirPath);

  var partials = Object.keys(Handlebars.partials);
  partials.forEach(function(partial) {
    assert.equal(typeof Handlebars.partials[partial], 'string', 'registers the partial with Handlebars');
  });
});


test('collectInputFilePaths returns an array of filePaths for the given type', function(assert) {
  assert.expect(3);

  var compiler = new Compiler(appRoot);

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
