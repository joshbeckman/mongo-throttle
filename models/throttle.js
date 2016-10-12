
/**
 * A rate-limiting Throttle model, by IP address
 *
 */
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Register the Throttle model
 *
 * @access public
 * @param {object} defaults
 * @return {object} Mongoose Model
 */
module.exports = function create_throttle(defaults) {
    var Throttle = new Schema({
        createdAt: {
            type:       Date,
            required:   true,
            default:    Date.now,
            expires:    defaults.rateLimit.ttl
        },
        ip: {
            type:       String,
            required:   true,
            trim:       true,
            match:      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        },
        hits: {
            type:       Number,
            default:    1,
            required:   true,
            max:        defaults.rateLimit.max,
            min:        0
        }
    });

    Throttle.index(
        { createdAt: 1 },
        { expireAfterSeconds: defaults.rateLimit.ttl }
    );   

    return mongoose.model('Throttle', Throttle);
};
