/**
 * Request is a quick shim for making HTTP requests in a more Mach-like manner.
 * Eventually, this will be integrated into Mach proper:
 * https://github.com/mjackson/mach/issues/12
 */
var superagent = require('superagent');
var when = require('when');

function request(options) {
  options = options || {};

  var req = superagent(options.method || 'GET', options.url);

  req.send(options.content || options.params);

  Object.keys(options.headers || {}).forEach(function (key) {
    req.set(key, options.headers[key]);
  });

  return when.promise(function (resolve, reject) {
    req.on('error', reject);
    req.end(resolve);
  })
    .then(function (response) {
      return {
        status: response.status,
        headers: response.header,
        content: response.body || response.text
      };
    });
}

module.exports = request;
