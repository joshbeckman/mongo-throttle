'use strict'

var ipRegex = require('ip-regex')
var defaultsDeep = require('lodash.defaultsdeep')
var defaults = require('../defaults')
var throttleModel = require('../models/throttle')

/**
 * Create and register throttler middleware
 *
 * @access public
 * @param {object} config
 * @param {function} limited will be called upon limit reached
 */
module.exports = function createThrottler (config, limited) {
  // createThrottler()
  if (!config) {
    config = {}
  }

  // createThrottler(fn)
  if (typeof config === 'function') {
    limited = config
    config = null
  }

  // createThrottler(config, false)
  if (typeof limited !== 'function') {
    limited = null
  }
  defaultsDeep(config, defaults)

  var Throttle = throttleModel(config)
  return throttleMiddleware

  function errHandler (res, next, error) {
    // DO WE WANT TO BREAK THE APP AND CAUSE A ISSUE OR DO WE WANT TO SILENTLY INTO THE NIGHT AND JUST LOG OUR ERRORS
    if (error) {
      res.statusCode = 500
      next(error)
      return true
    }
  }

  function respondWithThrottle (request, response, next, throttle) {
    var timeUntilReset = (config.rateLimit.ttl * 1000) - (new Date().getTime() - throttle.createdAt.getTime())
    var remaining = Math.max(0, (config.rateLimit.max - throttle.hits))

    response.set({
      'X-Rate-Limit-Limit': config.rateLimit.max,
      'X-Rate-Limit-Remaining': remaining,
      'X-Rate-Limit-Reset': timeUntilReset
    })

    if (throttle.hits < config.rateLimit.max) {
      return next()
    }

    response.statusCode = config.response.code
    if (limited) {
      return limited(request, response, throttle.hits, timeUntilReset)
    }

    return response.send(config.response.message)
  }
  /**
   * Check for request limit on the requesting IP
   *
   * @access public
   * @param {object} request Express-style request
   * @param {object} response Express-style response
   * @param {function} next Express-style next callback
   */

  function throttleMiddleware (request, response, next) {
    var ip = request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress || ''

    ip = ip.split(',')[0]
    if (!ipRegex().test(ip) || ip.substr(0, 7) === '::ffff:' || ip === '::1') {
      ip = '127.0.0.1'
    } else {
      ip = ip.match(ipRegex())[0]
    }

    Throttle
      .findOneAndUpdate({ip: ip}, { $inc: { hits: 1 } }, { upsert: false })
      .exec(function (error, throttle) {
        if (errHandler(response, next, error)) { return }
        if (!throttle) {
          throttle = new Throttle({
            createdAt: new Date(),
            ip: ip
          })
          throttle.save(function (error, throttle) {
            // THERE'S NO ERROR, BUT THROTTLE WAS NOT SAVE
            if (!throttle && !error) {
              error = new Error('Error checking rate limit.')
            }

            if (errHandler(response, next, error)) { return }

            respondWithThrottle(request, response, next, throttle)
          })
        } else {
          respondWithThrottle(request, response, next, throttle)
        }
      })
  }
}
