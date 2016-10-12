
var defaults      = require('../defaults'),
    throttleModel = require('../models/throttle'),
    Throttle;

/**
 * Create and register throttler middleware
 *
 * @access public
 * @param {object} config
 * @param {function} limited will be called upon limit reached
 */
module.exports = function create_throttler(config, limited) {
    if (typeof config == 'function') {
        return create_throttler(null, config);
    }
    if (typeof limited != 'function') {
        limited = false;
    }

    config                  = config                  || defaults;
    config.rateLimit        = config.rateLimit        || defaults.rateLimit;
    config.rateLimit.ttl    = config.rateLimit.ttl    || defaults.rateLimit.ttl;
    config.rateLimit.max    = config.rateLimit.max    || defaults.rateLimit.max;
    config.response         = config.response         || defaults.response;
    config.response.code    = config.response.code    || defaults.response.code;
    config.response.message = config.response.message || defaults.response.message;

    Throttle = throttleModel(config);
    return throttle_middleware;

/**
 * Check for request limit on the requesting IP
 *
 * @access public
 * @param {object} request Express-style request
 * @param {object} response Express-style response
 * @param {function} next Express-style next callback
 */
function throttle_middleware(request, response, next) {
    'use strict';
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

    ip = (ip || '').split(',')[0];
    Throttle
        .findOneAndUpdate({ip: ip}, { $inc: { hits: 1 } }, { upsert: false })
        .exec(function(error, throttle) {
            if (error) {
                response.statusCode = 500;
                return next(error);
            }
            if (!throttle) {
                throttle = new Throttle({
                    createdAt: new Date(),
                    ip: ip
                });
                throttle.save(function(error, throttle) {
                    if (error) {
                        response.statusCode = 500;
                        return next(error);
                    }
                    if (!throttle) {
                        response.statusCode = 500;
                        return next(new Error('Error checking rate limit.'));
                    }

                    respondWithThrottle(request, response, next, throttle);
                });
            } else {
                respondWithThrottle(request, response, next, throttle);
            }
        });

    function respondWithThrottle(request, response, next, throttle) {
        var timeUntilReset = (defaults.rateLimit.ttl * 1000) -
                    (new Date().getTime() - throttle.createdAt.getTime()),
            remaining =  Math.max(0, (defaults.rateLimit.max - throttle.hits));

        response.set('X-Rate-Limit-Limit', defaults.rateLimit.max);
        response.set('X-Rate-Limit-Remaining', remaining);
        response.set('X-Rate-Limit-Reset', timeUntilReset);
        if (throttle.hits < defaults.rateLimit.max) {
            return next();
        }
        response.statusCode = defaults.response.code;
        if (limited) {
            return limited(request, response, throttle.hits, timeUntilReset);
        }
        return response.send(defaults.response.message);
    }
}
};
