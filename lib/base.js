/*!
 * BaseApiClient provides the basis for generating similar API clients for
 * Faithlife APIs.
 */
var https = require('https');
var url = require('url');
var util = require('util');
var express = require('express');
var mi = require('mi');
var superagent = require('superagent');
var superagentThen = require('superagent-then');

/**
 * Creates a new instance of BaseApiClient with the provided `options`. The
 * available options are:
 *
 *  - `rootUrl`: The URL to base all requests on. Defaults to the same
 *    origin (`/`).
 */
function BaseApiClient(options) {
  if (!(this instanceof BaseApiClient)) {
    return new BaseApiClient(options);
  }

  options = options || {};

  this.rootUrl = this.rootUrl || options.rootUrl || '/';

  this._authorization = null;
}
BaseApiClient.extend = mi.extend;
BaseApiClient.inherit = mi.inherit;

/**
 * Create a new instance of this Client type. See constructor for valid options.
 */
BaseApiClient.createClient = function createClient(options) {
  var cls = this;
  return cls(options);
};

/**
 * Gets a child Client with the same settings as this Client beyond any
 * additional `options` specified.
 */
BaseApiClient.prototype.getChild = function getChild(options) {
  var child = this.constructor.createClient(this);
  child._authorization = options.auth;
  return child;
};

/**
 * Gets a complete URL relative to the Client's `rootUrl`.
 */
BaseApiClient.prototype.getUrl = function getUrl(path) {
  return this.rootUrl + path;
};

/**
 * Creates a Promise-ready Superagent Request. For most requests:
 *
 * 1. `request.send()` should be used to provide a body.
 * 1. `request.then()` should be used (it's Promises/A+ compatible) to capture
 *   the response or error. Otherwise (if it's a fire-and-forget request),
 *   `request.end()` must be used to flush the socket and complete the request.
 *
 * See [https://github.com/visionmedia/superagent]() for more information on
 * the methods available to Requests.
 *
 * NOTE: A successfully-made request may not have been responded to with a
 * successful (200-ish) status code. Please check the status code in an
 * application-specific way after receiving the Response.
 */
BaseApiClient.prototype.request = function request(method, path) {
  var start = Date.now();
  var href = this.getUrl(path);

  return superagent(method, href)
    .set('Authorization', this._authorization)
    .use(superagentThen)
    .on('error', function (err) {
      console.error('Error in %s %s: %s', method, href, err);
    })
    .on('response', function (res) {
      var ms = Date.now() - start;

      console.log('%s %s %s %s ms', method, href, res.statusCode, ms.toFixed(3));
    });
};

/**
 * Make a GET request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.get = function get(path) {
  return this.request('GET', path);
};

/**
 * Make a POST request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.post = function post(path) {
  return this.request('POST', path);
};

/**
 * Make a PUT request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.put = function put(path) {
  return this.request('PUT', path);
};

/**
 * Make a DELETE request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.del = function del(path) {
  return this.request('DELETE', path);
};

/**
 * Generates a Express-compatible sub-application that proxies requests from
 * browser clients.
 */
BaseApiClient.prototype.subapp = function subapp() {
  var self = this;
  var app = express();

  app.use(function (request, response, next) {
    var start = Date.now();
    var href = self.getUrl(request.url);
    var parsedUrl = url.parse(href);
    var outgoing = https.request({
      method: request.method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      headers: util._extend(request.headers, {
        'Authorization': request.authorization,
        'Connection': 'Keep-Alive',
        'Host': parsedUrl.host
      })
    });

    outgoing.on('response', function (incoming) {
      var ms = Date.now() - start;

      console.log('%s %s %s %s ms', request.method, href, incoming.statusCode, ms.toFixed(3));

      response.status(incoming.statusCode);
      response.set(incoming.headers);
      incoming.pipe(response);
    });

    request.pipe(outgoing);
  });

  return app;
};

/*!
 * Export `BaseApiClient`.
 */
module.exports = BaseApiClient;
