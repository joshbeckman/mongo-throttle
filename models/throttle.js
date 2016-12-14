/**
 * A rate-limiting Throttle model, by IP address
 *
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise
/**
 * Register the Throttle model
 *
 * @access public
 * @param {object} defaults
 * @return {object} Mongoose Model
 */
module.exports = function createThrottle (defaults) {
  if (defaults.mongoose.uri) {
    mongoose.createConnection(defaults.mongoose.uri)
  }
  if (!mongoose.connection.readyState) {
    console.warn('MongoDB connection not set. Skipping. Fix this by specifying the mongoose:uri option.')
  }
  var Throttle = new Schema({
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: defaults.rateLimit.ttl
    },
    ip: {
      type: String,
      required: true,
      trim: true
    },
    hits: {
      type: Number,
      default: 1,
      required: true,
      max: defaults.rateLimit.max,
      min: 0
    }
  })

  Throttle.index(
    { createdAt: 1 },
    { expireAfterSeconds: defaults.rateLimit.ttl }
  )

  return mongoose.model('Throttle', Throttle)
}
