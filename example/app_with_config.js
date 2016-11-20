var express = require('express')
var app = express()
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mongothrottle')

var throttler = require('../lib/throttler')
app.use(throttler({rateLimit: {max: 10}, mongoose: {uri: 'mongodb://localhost/mongothrottle'}}))

// REMOVE PRIOR DOCUMENTS
var Throttle = mongoose.model('Throttle')
Throttle.find({}).remove().exec()
app.get('/', function (req, res, next) {
  res.status(200).send('Mongo-Throttle')
})
app.listen(3000, function () {
  console.log('Server is on port 3000 - localhost:3000/')
})
