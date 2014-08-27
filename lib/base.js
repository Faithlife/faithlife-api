/*!
 * TODO: Description.
 */
var mach = require('mach');
var mi = require('mi');
var makeRequest = require('./request');

/**
 * Creates a new instance of BaseApiClient with the provided `options`.
 *
 * @param {Object} options
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
 * TODO: Description.
 */
BaseApiClient.createClient = function createClient(options) {
  var cls = this;
  return cls(options);
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.getChild = function getChild(options) {
  var child = this.constructor.createClient(this);
  child._authorization = options.auth;
  return child;
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.getUrl = function getUrl(path) {
  return this.rootUrl + path;
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.request = function request(method, path, body) {
  return makeRequest({
    method: method,
    url: this.getUrl(path),
    headers: {
      Authorization: this._authorization
    },
    content: body
  });
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.get = function get(path, body) {
  return this.request('GET', path, body);
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.post = function post(path, body) {
  return this.request('POST', path, body);
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.put = function put(path, body) {
  return this.request('PUT', path, body);
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.del = function del(path, body) {
  return this.request('DELETE', path, body);
};

/**
 * TODO: Description.
 */
BaseApiClient.prototype.generateSubapp = function generateSubapp(location) {
  var self = this;

  function subapp(app) {
    var keys = Object.keys(self.constructor.prototype);

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

            if (content && typeof content !== 'string') {
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
 * TODO: Description.
 */
BaseApiClient.prototype.mountProxy = function mountProxy(app, location) {
  return app.map(location, this.generateSubapp(location));
};

/*!
 * Export `BaseApiClient`.
 */
module.exports = BaseApiClient;
