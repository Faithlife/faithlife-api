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
  return this.get('/v1/users/me').then();
};

/**
 * Gets the specified User by `userId`, returning a promise to be fulfilled
 * with the Response or rejected with an HTTP error.
 */
AccountsApiClient.prototype.getUser = function getUser(userId) {
  return this.get('/v1/users/' + userId).then();
};

/**
 * Creates a new Group based on `group`, returning a promise to be fulfilled
 * with the Response or rejected with an HTTP error.
 */
AccountsApiClient.prototype.createGroup = function createGroup(group) {
  return this.post('/v1/groups').send(group).then();
};

/**
 * Gets the specified Group by either Group ID or Group "token", returning a
 * promise to be fulfilled with the Response or rejected with an HTTP error.
 */
AccountsApiClient.prototype.getGroup = function getGroup(groupIdOrToken) {
  return this.get('/v1/groups/' + groupIdOrToken).then();
};

/**
 * Gets all the groups the specified User is a part of, returning a
 * promise to be fulfilled with the Response or rejected with an HTTP error.
 */
AccountsApiClient.prototype.getGroupsForUser = function getGroupsForUser(userId, options) {
  return this.get('/v1/users/' + userId + '/groups').query(options).then();
};

/*!
 * Export `AccountsApiClient`.
 */
module.exports = AccountsApiClient;
