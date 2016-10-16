var assert = require('chai').assert
var request = require('supertest')
var async = require('async')
require('../example/app_with_config.js')

describe('Mongo-Throttle', function () {
  // app.use('/api/', throttle())
  describe('With custom configs,', function () {
    it('should set headers, with respect to config', function (done) {
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          assert.ok(res.headers['x-rate-limit-limit'])
          assert.ok(res.headers['x-rate-limit-remaining'] === '9')
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
    it('should set configured limit', function (done) {
      this.timeout(1000000)
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          assert.ok(res.headers['x-rate-limit-limit'])
          assert.ok(parseInt(res.headers['x-rate-limit-limit'], 10) === 10)
          done()
        })
    })
  })
})
