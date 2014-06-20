'use strict';

var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  rejectUnauthorized: false,
  url: 'https://127.0.0.1:8080',
  headers: {'x-auth-token':'6654edc5-82a3-4006-967f-97d5817d7fe2'}
});

describe('Integration: Share', function(){
  var server,
      context;

  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    setTimeout(done, 500);
  });

  after(function(done){
    context.Storage.close();
    context.Server.close();
    delete require.cache[server];
    setTimeout(done, 500);
  });

  describe('on shares', function(){
    it('should be get shares by identity `anonymous`', function(done){
      client.get('/shares/anonymous', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 200, 'Wrong HTTP status code.');
        assert.deepEqual(actual, {  '/': [ 'GET' ],
                                    '/libs': [ 'GET' ],
                                    '/css': [ 'GET' ],
                                    '/sdk': [ 'GET' ],
                                    '/js': [ 'GET' ],
                                    '/img': [ 'GET' ],
                                    '/doc': [ 'GET' ] }
        );
        done();
      });
    });

    it('should be get shares by identity `myIdent`', function(done){
      client.get('/shares/myIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 200, 'Wrong HTTP status code.');
        assert.deepEqual(actual, {  '/': [],
                                    '/libs': [],
                                    '/css': [],
                                    '/sdk': [],
                                    '/js': [],
                                    '/img': [],
                                    '/doc': [] }
        );
        done();
      });
    });
  });

  describe('on share access', function(){
    
    it('should be add a `/demo1` share', function(done){
      client.post('/shares/demo1', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 201, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });

    it('should be grant read access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/shares/demo1/actions/grantread/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [ 'superIdent' ], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });
    it('should be revoke read access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/shares/demo1/actions/revokeread/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });

    it('should be grant write access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/shares/demo1/actions/grantwrite/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: ['superIdent'], PUT: ['superIdent'], DELETE: [] });
        done();
      });
    });
    it('should be revoke write access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/shares/demo1/actions/revokewrite/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });

    it('should be grant delete access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/shares/demo1/actions/grantdelete/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: ['superIdent'] });
        done();
      });
    });
    it('should be revoke delete access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/shares/demo1/actions/revokedelete/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });
    
    it('should be revoke all access to all shares for `superIdent` identity', function(done){
      client.put('/shares/actions/revoke/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { '/': [],
                                  '/libs': [],
                                  '/css': [],
                                  '/sdk': [],
                                  '/js': [],
                                  '/img': [],
                                  '/doc': [],
                                  '/demo1': [] }
        );
        done();
      });
    });

    it('should be remove a `/demo1` share', function(done){
      client.del('/shares/demo1', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, {});
        done();
      });
    });

  });
});

