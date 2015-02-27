var Handlebars = require('handlebars');

module.exports = function(title) {
  var output = '<h1>' + title + '</h1>'
  return new Handlebars.SafeString(output);
};
