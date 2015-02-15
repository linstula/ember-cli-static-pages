/* globals require, QUnit, test, process */

var Compiler = require('../compiler');
var handlebars = require('handlebars');
var path = require('path');

var module = QUnit.module;
var ok = QUnit.ok;
var equal = QUnit.equal;

var templatesDirPath = '/fixtures/templates/';
var helpersDirPath = '/fixtures/helpers/';
var partialsDirPath = '/fixtures/partials/';
var helperTitlePath = '/fixtures/helpers/title-helper.js';
var partialFooterPath = '/fixtures/partials/footer.hbs';
var basicTemplatePath = '/fixtures/templates/template.hbs';
var templateWithPartialPath = '/fixtures/templates/template-with-partials.hbs';
var nestedHelperPath = '/fixtures/helpers/nested/nested-helper.js';
var nestedTemplatePath = '/fixtures/templates/nested/nested-template.hbs';

var helperFixtureFiles = ['nested/nested-helper.js', 'other-helper.js', 'title-helper.js'];
var partialFixtureFiles = ['footer.hbs', 'nested/nested-partial.hbs', 'other-partial.hbs'];
var templateFixtureFiles = ['nested/nested-template.hbs', 'other-template.hbs', 'template-with-partials.hbs', 'template.hbs'];

var Handlebars, appRoot;

module('compiler', {
  beforeEach: function() {
    Handlebars = handlebars;
    appRoot = process.cwd() + '/tests/dummy/';
  }
});

test('saves root from constructor param', function(assert) {
  assert.expect(1);

  var compiler = new Compiler('some-path/');

  assert.equal(compiler.rootPath, 'some-path/');
});

test('registerHelper calls Handlebars.registerHelper with the correct arguements', function(assert) {
  assert.expect(2);

  var compiler = new Compiler(appRoot);

  Handlebars.registerHelper = function(helperName, helperFunction) {
    assert.equal(helperName, 'title-helper');
    assert.equal(typeof helperFunction, 'function');
  };

  compiler.registerHelper(helpersDirPath, 'title-helper.js');
});

test('registerHelper registers the correct name for a nested helper', function(assert) {
  assert.expect(2);

  var compiler = new Compiler(appRoot);

  Handlebars.registerHelper = function(helperName, helperFunction) {
    assert.equal(helperName, 'nested/nested-helper');
    assert.equal(typeof helperFunction, 'function');
  };

  compiler.registerHelper(helpersDirPath, 'nested/nested-helper.js');
});

test('registerHelpers registers helpers with Handlebars', function(assert) {
  assert.expect(7);

  var compiler = new Compiler(appRoot);
  var count = 0;

  Handlebars.registerHelper = function(helperName, helperFunction) {
    assert.ok(typeof helperName === 'string');
    assert.ok(typeof helperFunction === 'function');
    count++;
  };

  compiler.registerHelpers(helpersDirPath);
  assert.equal(count, helperFixtureFiles.length, 'registerHelper is called for each helper in the helpersDirPath');
});

test('registerPartial calls Handlebars.registerPartial with the correct arguements', function(assert) {
  assert.expect(2);

  var compiler = new Compiler(appRoot);

  Handlebars.registerPartial = function(partialName, partialString) {
    assert.equal(partialName, 'footer');
    assert.equal(partialString, '<p>This is my foot.</p>\n');
  };

  compiler.registerPartial(partialsDirPath, 'footer.hbs');
});

test('registerPartial registers the correct name for a nested partial', function(assert) {
  assert.expect(2);

  var compiler = new Compiler(appRoot);

  Handlebars.registerPartial = function(partialName, partialString) {
    assert.equal(partialName, 'nested/nested-partial');
    assert.equal(partialString, '<p>I am a nested partial.</p>\n');
  };

  compiler.registerPartial(partialsDirPath, 'nested/nested-partial.hbs');
});

test('registerPartials registers partials with Handlebars', function(assert) {
  assert.expect(7);

  var compiler = new Compiler(appRoot);
  var count = 0;

  Handlebars.registerPartial = function(partialName, partialString) {
    assert.ok(typeof partialName === 'string');
    assert.ok(typeof partialString === 'string');
    count++;
  };

  compiler.registerPartials(partialsDirPath);
  assert.equal(count, partialFixtureFiles.length, 'registerPartial is called for each partial in the partialsDirPath');
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
