/*!
 * AccountsApiClient is reponsible for proxying all Accounts API methods.
 *
 * See `https://developer.faithlife.com/#accounts-api-types` for more
 * details on the content of a User or Group.
 */
var BaseApiClient = require('./base');

/**
 * Creates a new instance of AccountsApiClient with the provided `options`.
 *
 * See `BaseApiClient` for available options.
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
 * Gets the currently logged-in User, returning a promise to be fulfilled with
 * the Response or rejected with an HTTP error.
 */
AccountsApiClient.prototype.getLoggedInUser = function getLoggedInUser() {
  return this.get('/v2/users/me');
};

/*!
 * Export `AccountsApiClient`.
 */
module.exports = AccountsApiClient;
