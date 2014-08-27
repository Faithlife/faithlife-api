var assert = require('assert');
var faithlifeOAuth = require('faithlife-oauth');
var mach = require('mach');
var lib = require('../lib');
var TOKEN = '491D486DD7C22BAEC44A06E802272139E6A10D62';
var SECRET = '839A6F206D70619D45F204FD2CF7E35E6AEEFFDD';
var consumer = faithlifeOAuth.createConsumer({
  token: TOKEN,
  secret: SECRET
});

/**
 * The Client
 */
var client = lib.Accounts.createClient();

/**
 * getLoggedInUser
 */
client.getLoggedInUser()
  .then(function (response) {
    // 1. Should respond with a 200.
    assert.equal(response.status, 200, 'Non-success status code.');

    // 2. Should respond with JSON.
    assert.ok(response.content && typeof response.content === 'object', 'Missing anonymous response body.');

    // 3. Should respond with a -1 ID if no user is logged-in.
    assert.deepEqual(
      response.content,
      { id: -1 },
      'Invalid anonymous response body.'
    );
  })
  .done();

// TODO(schoon) - Automate the sign-in form submission and test while
// authenticated.

/*
 * The Proxy
 */
var app = mach.stack();
app.use(mach.session, {
  secret: 'test',
  store: mach.session.MemoryStore()
});
consumer.mount(app, '/oauth');
app.map('/api', function (subapp) {
  subapp.use(consumer.generateMiddleware());

  client.mount(subapp, '/accounts');
});
var server = mach.serve(app, process.env.PORT || 22222);

/**
 * getLoggedInUser
 */
var proxy = lib.Accounts.createClient({ rootUrl: 'http://127.0.0.1:22222/api/accounts' });

proxy.getLoggedInUser()
  .then(function (response) {
    // 1. Should respond with a 200.
    assert.equal(response.status, 200, 'Non-success status code.');

    // 2. Should respond with JSON.
    assert.ok(response.content && typeof response.content === 'object', 'Missing anonymous response body.');

    // 3. Should respond with a -1 ID if no user is logged-in.
    assert.deepEqual(
      response.content,
      { id: -1 },
      'Invalid anonymous response body.'
    );
  })
  .then(function () {
    server.close();
  })
  .done();
