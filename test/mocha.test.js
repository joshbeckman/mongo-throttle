var assert = require('chai').assert
var request = require('supertest')
require('../example/app.js')

describe('Mongo-Throttle', function () {
  // app.use('/api/', throttle())
  describe('No Configs', function () {
    it('Test', function (done) {
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          console.log(res.headers['x-rate-limit-limit'])
          console.log(res.headers['x-rate-limit-remaining'])
          console.log(res.headers['x-rate-limit-reset'])
          assert.equal(true, true)
          done()
        })
    })
    it('Test2', function (done) {
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          console.log(res.headers['x-rate-limit-limit'])
          console.log(res.headers['x-rate-limit-remaining'])
          console.log(res.headers['x-rate-limit-reset'])
          assert.equal(true, true)
          done()
        })
    })
    it('Test3', function (done) {
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          console.log(res.headers['x-rate-limit-limit'])
          console.log(res.headers['x-rate-limit-remaining'])
          console.log(res.headers['x-rate-limit-reset'])
          assert.equal(true, true)
          done()
        })
    })
    it('Test4', function (done) {
      this.timeout(1000000)
      request('localhost:3000')
        .get('/')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(err, null)
          console.log(res.headers['x-rate-limit-limit'])
          console.log(res.headers['x-rate-limit-remaining'])
          console.log(res.headers['x-rate-limit-reset'])
          assert.equal(true, true)
          done()
        })
    })
  })
  // app.use(throttle({ rateLimit: { ttl: 600, max: 5 } }))
  describe('Configire Limit', function () {})
  // app.use(throttle(function (req, res, hits, remaining) {
  //   var until = new Date((new Date()).getTime() + remaining)
  //   res.statusCode = 420
  //   res.send('You shall not pass ' + hits + ' until ' + until + '!')
  // }))
  describe('Configire Custom Limit Header', function () {})
})
