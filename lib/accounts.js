/*!
 * TODO: Description.
 */
var BaseApiClient = require('./base');

/**
 * Creates a new instance of AccountsApiClient with the provided `options`.
 *
 * @param {Object} options
 */
function AccountsApiClient(options) {
  if (!(this instanceof AccountsApiClient)) {
    return new AccountsApiClient(options);
  }

  options = options || {};

  this.rootUrl = options.rootUrl || 'https://accountsapi.logos.com';

  BaseApiClient.call(this, options);
}
BaseApiClient.inherit(AccountsApiClient);

/**
 * TODO: Description.
 */
AccountsApiClient.prototype.getLoggedInUser = function getLoggedInUser() {
  return this.get('/v2/users/me');
};

/*!
 * Export `AccountsApiClient`.
 */
module.exports = AccountsApiClient;
