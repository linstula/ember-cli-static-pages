/* globals require, QUnit, test */

var Compiler = require('../compiler');

var path = require('path');

var module = QUnit.module;
var ok = QUnit.ok;
var equal = QUnit.equal;


module('compiler');

test('saves root from constructor param', function() {
  var compiler = new Compiler('some-path/');

  equal(compiler.root, 'some-path/');
});
