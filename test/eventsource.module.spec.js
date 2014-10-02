'use strict';

var assert = require('assert');

describe('Module: EventSource', function(){
  var store, pubsub, sut;

  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./eventsourcedb',
      backupPath:'./backups'
    });
    pubsub = require('../lib/pubsub.module.js').init({pollInterval: 1});
    sut = require('../lib/eventsource.module.js').init(store, pubsub);
    store.upsert('demo1','a',{});
    store.upsert('demo2','d',{});
    store.upsert('demo1','b',{});
    store.upsert('demo2','b',{});
    store.upsert('demo2','a',{});
    store.upsert('demo2','c',{});
    store.upsert('demo3','a',{});
    setTimeout(done, 1000);
  });
  after(function(done){
    store.destroy(done);
  });
  
  describe('on eventsource', function(){

    it('should be run a projection', function(done){
      sut
      .fromStreams(['demo1','demo2', 'demo5'])
      .run({ 
        $init: function(state){
          if(!state.count) state.count = 0;
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        demo1: function(state, message){
          state.count += 1;
          return state;
        },
        demo2: function(state, message){
          state.count += 1;
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
        assert.equal(data.count, 6);
        done();
      });
    });
    it('should be a live projection', function(done){
      //sample messages
      setTimeout(function(){
        store.upsert('demo1','g',{});
      }, 5);
      setTimeout(function(){
        store.upsert('demo2','t',{});
      }, 5);
      setTimeout(function(){
        store.upsert('demo5','t',{});
      }, 5);
      setTimeout(function(){
        store.upsert('demo15','t',{});
      }, 5);

      sut
      .fromStreams(['demo1','demo2','demo5'])
      .on({ 
        $init: function(state){
          if(!state.count) state.count = 0;
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        demo1: function(state, message){
          state.count += 1;
          return state;
        },
        demo2: function(state, message){
          state.count += 1;
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
      });
      
      setTimeout(done, 500);
    });
    it('should be a incremental live projection', function(done){
      //sample messages
      setTimeout(function(){
        store.upsert('demo1','g',{});
      }, 100);
      setTimeout(function(){
        store.upsert('demo2','t',{});
      }, 200);
      setTimeout(function(){
        store.upsert('demo5','t',{});
      }, 300);
      setTimeout(function(){
        store.upsert('demo15','t',{});
      }, 400);

      sut
      .fromStreams(['myNewProjection'])
      .on({ 
        $init: function(state){
          if(!state.reducedCount) state.reducedCount = 0;
          if(!state.events) state.events = [];
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        myNewProjection: function(state, message){
          state.reducedCount += 1;
          state.events.push(message);
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
        // console.log(data);
      });
      
      sut
      .fromStreams(['demo1','demo2','demo5'])
      .on({ 
        $init: function(state){
          if(!state.count) state.count = 0;
          if(!state.events) state.events = [];
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        demo1: function(state, message){
          state.count += 1;
          state.events.push(message);
          return state;
        },
        demo2: function(state, message){
          state.count += 1;
          state.events.push(message);
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
        // console.log(data);
        pubsub.publish('myNewProjection', data.count, data);
      });
      
      setTimeout(done, 500);

    });



  });
});