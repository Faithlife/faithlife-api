var assert = require('assert');
var lib = require('../lib');

/**
 * The Client
 */
var client = lib.Accounts.createClient();

/**
 * getLoggedInUser
 */
client.getLoggedInUser()
  .then(function (user) {
    assert.equal(user, null, 'Did not assert.');
  })
  .done();
