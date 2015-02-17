/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var cleanBaseURL = require('./utils/clean-base-url');
var Compiler = require('./compiler');

function notRequestToBaseURL(baseURL, requestPath) {
  var baseURLRegexp = new RegExp('^' + baseURL);
  return !(baseURLRegexp.test(requestPath) || requestPath === baseURL.substring(0, baseURL.length - 1));
}

module.exports = {
  name: 'ember-cli-static-pages',

  included: function(app) {
    var root = app.project.root;

    var compiler = new Compiler(root);
    var helpersDirPath = 'pages/helpers';
    var partialsDirPath = 'pages/partials';
    var templatesDirPath = 'pages/templates';

    compiler.registerHelpers(helpersDirPath);
    compiler.registerPartials(partialsDirPath);
    compiler.compileTemplates(templatesDirPath);
  },

  serverMiddleware: function(config) {
    var app = config.app;
    var options = config.options;

    app.use(function(req, res, next) {
      var baseURL = cleanBaseURL(options.baseURL);

      if (notRequestToBaseURL(baseURL, req.path)) {
        var filePath = path.join(config.options.project.root, config.options.outputPath, req.url)
        if (filePath[filePath.length - 1] !== '/' && fs.existsSync(filePath)) {
          res.send(fs.readFileSync(filePath, 'utf8'));
        }
      }

      next();
    })
  }
};
