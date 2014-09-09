/*!
 * BaseApiClient provides the basis for generating similar API clients for
 * Faithlife APIs.
 */
var mach = require('mach');
var mi = require('mi');
var makeRequest = require('./request');

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
 * Make a `method` request to `path` with the `body` entity as the body,
 * returning a promise to be fulfilled with the Response or rejected with
 * and HTTP error.
 *
 * NOTE: A successfully-made request may not have been responded to with a
 * successful (200-ish) status code. Please check the status code in an
 * application-specific way after receiving the Response.
 */
BaseApiClient.prototype.request = function request(method, path, body) {
  path = this.getUrl(path);

  console.log('%s %s', method, path);

  return makeRequest({
    method: method,
    url: path,
    headers: {
      Authorization: this._authorization
    },
    content: body
  })
    .then(null, function (err) {
      console.error('Error in %s %s: %s', method, path, err);
      throw err;
    });
};

/**
 * Make a GET request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.get = function get(path, body) {
  return this.request('GET', path, body);
};

/**
 * Make a POST request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.post = function post(path, body) {
  return this.request('POST', path, body);
};

/**
 * Make a PUT request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.put = function put(path, body) {
  return this.request('PUT', path, body);
};

/**
 * Make a DELETE request, returning a promise to be fulfilled with the Response
 * or rejected with an HTTP error. See `request` for more details.
 */
BaseApiClient.prototype.del = function del(path, body) {
  return this.request('DELETE', path, body);
};

/**
 * Generates a Mach-compatible sub-application that proxies requests from
 * browser clients.
 */
BaseApiClient.prototype.generateSubapp = function generateSubapp(location) {
  var self = this;

  function subapp(app) {
    var keys = Object.keys(self.constructor.prototype);

    app.use(mach.params);

    app.use(function (app) {
      return function (request) {
        var child = self.getChild({
          auth: request.authorization
        });

        var url = request.url;
        url = url.slice(url.indexOf(location) + location.length);

        return child.request(request.method, url, request.params)
          .then(function (response) {
            var content = response.content;

            response.headers['Content-Length'] = response.headers['content-length'];
            delete response.headers['content-length'];

            if (typeof content !== 'string') {
              content = JSON.stringify(content);
            }

            return {
              status: response.status,
              headers: response.headers,
              content: content
            };
          });
      };
    });
  }

  return subapp;
};

/**
 * Mounts a subapp on `app` at the specified `location` that proxies requests
 * from browser clients.
 */
BaseApiClient.prototype.mountProxy = function mountProxy(app, location) {
  return app.map(location, this.generateSubapp(location));
};

/*!
 * Export `BaseApiClient`.
 */
module.exports = BaseApiClient;
