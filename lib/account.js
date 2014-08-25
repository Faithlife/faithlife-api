/*!
 * TODO: Description.
 */
var BaseApiClient = require('./base');

/**
 * Creates a new instance of AccountApiClient with the provided `options`.
 *
 * @param {Object} options
 */
function AccountApiClient(options) {
  if (!(this instanceof AccountApiClient)) {
    return new AccountApiClient(options);
  }

  options = options || {};

  this.rootUrl = options.rootUrl || 'https://accountsapi.logos.com';

  BaseApiClient.call(this, options);
}
BaseApiClient.inherit(AccountApiClient);

/**
 * TODO: Description.
 */
AccountApiClient.prototype.getLoggedInUser = function getLoggedInUser() {
  return this.get('/v2/users/me');
};

/*!
 * Export `AccountApiClient`.
 */
module.exports = AccountApiClient;
