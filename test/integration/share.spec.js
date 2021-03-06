'use strict';

var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  rejectUnauthorized: false,
  url: 'https://127.0.0.1:8080',
  headers: {'x-auth-token':'66LOHAiB8Zeod1bAeLYW'}
});

describe('Integration: Share', function(){
  var server,
      context;

  before(function(done) {
    server = require('../../server.js');
    context = server.init().getContext();
    setTimeout(done, 500);
  });

  after(function(done){
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    setTimeout(done, 500);
  });

  describe('on shares', function(){
    it('should be get all identities', function(done){
      client.get('/manage/permissions/identities', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 200, 'Wrong HTTP status code.');
        assert.equal(actual.length, 0);
        done();
      });
    });
    it('should be get shares by identity `anonymous`', function(done){
      client.get('/manage/permissions/anonymous', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 200, 'Wrong HTTP status code.');
        assert.deepEqual(actual, {  '/': [ ],
                                    '/doc': [ ] }
        );
        done();
      });
    });

    it('should be get shares by identity `myIdent`', function(done){
      client.get('/manage/permissions/myIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 200, 'Wrong HTTP status code.');
        assert.deepEqual(actual, {  '/': [],
                                    '/doc': [] }
        );
        done();
      });
    });
  });

  describe('on share access', function(){
    
    it('should be add a `/demo1` share', function(done){
      client.post('/manage/permissions/demo1', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 201, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });

    it('should be grant read access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/grantread/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [ 'superIdent' ], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });
    it('should be revoke read access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/revokeread/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });

    it('should be grant insert access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/grantinsert/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: ['superIdent'], PUT: [], DELETE: [] });
        done();
      });
    });
    it('should be revoke insert access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/revokeinsert/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });


    it('should be grant update access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/grantupdate/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: ['superIdent'], DELETE: [] });
        done();
      });
    });
    it('should be revoke update access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/revokeupdate/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });

    it('should be grant delete access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/grantdelete/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: ['superIdent'] });
        done();
      });
    });
    it('should be revoke delete access to `/demo1` share for `superIdent` identity', function(done){
      client.put('/manage/permissions/demo1/revokedelete/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { GET: [], POST: [], PUT: [], DELETE: [] });
        done();
      });
    });
    
    it('should be revoke all access to all shares for `superIdent` identity', function(done){
      client.put('/manage/permissions/revoke/superIdent', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, { '/': [],
                                  '/doc': [],
                                  '/demo1': [] }
        );
        done();
      });
    });

    it('should be remove a `/demo1` share', function(done){
      client.del('/manage/permissions/demo1', function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(res.statusCode, 202, 'Wrong HTTP status code.');
        assert.deepEqual(actual, {message: 'delete accepted'});
        done();
      });
    });

  });
});

