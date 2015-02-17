/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');

var cleanBaseURL = require('./utils/clean-base-url');

function notRequestToBaseURL(baseURL, requestPath) {
  var baseURLRegexp = new RegExp('^' + baseURL);
  return !(baseURLRegexp.test(requestPath) || requestPath === baseURL.substring(0, baseURL.length - 1));
}

module.exports = {
  name: 'ember-cli-static-pages',

  serverMiddleware: function(config) {
    var app = config.app;
    var options = config.options;

    app.use(function(req, res, next) {
      var baseURL = cleanBaseURL(options.baseURL);

      if (notRequestToBaseURL(baseURL, req.path)) {
        var filePath = path.join(config.options.project.root, config.options.outputPath, req.url)
        if (fs.existsSync(filePath)) {
          res.send(fs.readFileSync(filePath, 'utf8'));
        }
      }

      next();
    })
  }
};
