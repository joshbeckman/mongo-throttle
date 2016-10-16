var assert = require('chai').assert
var request = require('supertest')
var async = require('async')
var defaults = require('../defaults')
require('../example/app.js')

describe('Mongo-Throttle', function () {
  // app.use('/api/', throttle())
  describe('With no configs,', function () {
    it('should set headers', function (done) {
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          assert.ok(res.headers['x-rate-limit-limit'])
          assert.ok(res.headers['x-rate-limit-remaining'])
          assert.ok(res.headers['x-rate-limit-reset'])
          done()
        })
    })
    it('should decrement headers/count', function (done) {
      var remaining = 0
      async.series([
        function (done) {
          request('localhost:3000')
            .get('/')
            .expect(200, function (err, res) {
              if (err) return done(err)
              assert.equal(err, null)
              assert.ok(res.headers['x-rate-limit-limit'])
              assert.ok(res.headers['x-rate-limit-remaining'])
              assert.ok(res.headers['x-rate-limit-reset'])
              remaining = parseInt(res.headers['x-rate-limit-remaining'], 10)
              done()
            })
        },
        function (done) {
          request('localhost:3000')
            .get('/')
            .expect(200, function (err, res) {
              if (err) return done(err)
              assert.equal(err, null)
              assert.ok(res.headers['x-rate-limit-remaining'])
              assert.ok((remaining - 1).toString() === res.headers['x-rate-limit-remaining'])
              done()
            })
        }
      ], done)
    })
    it('should decrement reset time', function (done) {
      var reset = 0
      async.series([
        function (done) {
          request('localhost:3000')
            .get('/')
            .expect(200, function (err, res) {
              if (err) return done(err)
              assert.equal(err, null)
              assert.ok(res.headers['x-rate-limit-limit'])
              assert.ok(res.headers['x-rate-limit-remaining'])
              assert.ok(res.headers['x-rate-limit-reset'])
              reset = parseInt(res.headers['x-rate-limit-reset'], 10)
              done()
            })
        },
        function (done) {
          request('localhost:3000')
            .get('/')
            .expect(200, function (err, res) {
              if (err) return done(err)
              assert.equal(err, null)
              assert.ok(res.headers['x-rate-limit-reset'])
              assert.ok(reset > parseInt(res.headers['x-rate-limit-reset'], 10))
              done()
            })
        }
      ], done)
    })
    it('should set default limit', function (done) {
      this.timeout(1000000)
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          assert.ok(res.headers['x-rate-limit-limit'])
          assert.ok(defaults.rateLimit.max.toString() === res.headers['x-rate-limit-limit'])
          done()
        })
    })
  })
  describe('Configire Custom Limit Handler', function () {})
})
