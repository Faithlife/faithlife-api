/*!
 * AccountsApiClient is reponsible for proxying all Accounts API methods.
 *
 * See `https://developer.faithlife.com/#accounts-api-types` for more
 * details on the content of a User or Group.
 */
var ProxyClient = require('proxy-client');

/**
 * Creates a new instance of AccountsApiClient with the provided `options`.
 *
 * See `ProxyClient` for available options.
 */
function AccountsApiClient(options) {
  if (!(this instanceof AccountsApiClient)) {
    return new AccountsApiClient(options);
  }

  options = options || {};

  this.rootUrl = options.rootUrl || 'https://accountsapi.logos.com';

  ProxyClient.call(this, options);
}
ProxyClient.inherit(AccountsApiClient);

/**
 * Gets the currently logged-in User, returning a promise to be fulfilled with
 * the User or rejected with an appropriate error.
 */
AccountsApiClient.prototype.getLoggedInUser = function getLoggedInUser() {
  var self = this;

  return self.get('/v1/users/me')
    .end()
    .then(function (response) {
      if (response.status === 404) {
        return null;
      }

      if (response.status !== 200) {
        return self.rejectResponse(response);
      }

      if (response.body.id === -1) {
        return null;
      }

      return response.body;
    });
};

/**
 * Gets the specified User by `userId`, returning a promise to be fulfilled
 * with the User or rejected with an appropriate error.
 */
AccountsApiClient.prototype.getUser = function getUser(userId) {
  var self = this;

  return self.get('/v1/users/' + userId)
    .end()
    .then(function (response) {
      if (response.status === 404) {
        return null;
      }

      if (response.status !== 200) {
        return self.rejectResponse(response);
      }

      return response.body;
    });
};

/**
 * Creates a new Group based on `group`, returning a promise to be fulfilled
 * with the User or rejected with an appropriate error.
 */
AccountsApiClient.prototype.createGroup = function createGroup(group) {
  var self = this;

  return self.post('/v1/groups')
    .send(group)
    .end({
      name: group.name,
      privacy: group.privacy
    })
    .then(function (response) {
      if (response.status !== 200) {
        return self.rejectResponse(response);
      }

      return response.body;
    });
};

/**
 * Gets the specified Group by either Group ID or Group "token", returning a
 * promise to be fulfilled with the Group or rejected with an appropriate error.
 */
AccountsApiClient.prototype.getGroup = function getGroup(groupIdOrToken) {
  var self = this;

  return self.get('/v1/groups/' + groupIdOrToken)
    .end()
    .then(function (response) {
      if (response.status === 404) {
        return null;
      }

      if (response.status !== 200) {
        return self.rejectResponse(response);
      }

      return response.body;
    });
};

/**
 * Gets all the groups the specified User is a part of, returning a
 * promise to be fulfilled with the User's Groups or rejected with an
 * appropriate error.
 */
AccountsApiClient.prototype.getGroupsForUser = function getGroupsForUser(userId) {
  var self = this;

  return self.get('/v1/users/' + userId + '/groups')
    .end()
    .then(function (response) {
      if (response.status !== 200) {
        return self.rejectResponse(response);
      }

      return response.body.groups;
    });
};

/*!
 * Export `AccountsApiClient`.
 */
module.exports = AccountsApiClient;
