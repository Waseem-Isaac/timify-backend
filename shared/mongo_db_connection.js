var MongoClient = require('mongodb').MongoClient
var config = require('./config');

var state = {
  db: null,
}

const connectionString = config.dbConnectionString;

exports.connect = function(connectionString, done) {
  if (state.db) return done()

  MongoClient.connect(connectionString, function(err, client) {
    if (err) return done(err)
    state.db = client.db('test');
    
    done()
  })
}

exports.get = function() {
  return state.db
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}