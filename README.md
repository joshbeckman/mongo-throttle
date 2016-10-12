# Mongo Throttle

> Basic IP rate-limiting middleware for Express stored in mongoDB. Use to throttle or limit incoming request rate.

background details relevant to understanding what this module does

## Usage
~~~js
var throttler = require('mongo-throttle');

// In Express-style app:
app.use(throttle());

// Optionally configure limits:
app.use(throttle({ rateLimit: { ttl: 600, max: 5 } }));

// Optionally configure a custom limit handler:
app.use(throttle(function(req, res, hits, remaining) {
    var until = new Date((new Date()).getTime() + remaining);
    res.statusCode = 420;
    res.send('You shall not pass ' + hits + ' until ' + until + '!');
}));
~~~

## API

### Headers
~~~sh
# Header fields set:
X-Rate-Limit-Limit      # Maximum requests within TTL
X-Rate-Limit-Remaining  # Requests remaining for IP
X-Rate-Limit-Reset      # msec until limit reset for IP
~~~

### Configuration
~~~js
// Configuration options/defaults:
{
    "rateLimit": {
        "ttl": 600,
        "max": 600
    },
    "response": {
        "code":    429,
        "message": "Rate Limit reached. Please wait and try again."
    }
}

// When using a custom limit handler:
/**
 * Custom Limit-reached handler
 *
 * @param {object} req          Express request
 * @param {object} res          Express response
 * @param {number} hits         Total hits for this IP within TTL
 * @param {number} remaining    msec reminaing before this IP resets TTL window
 */
function custom_limit(req, res, hits, remaining) {
    // handler response here
}
~~~

### Models
~~~js
// Upon registration, this middleware will create
// a Mongoose model collection with schema:
Throttle = {
    createdAt:   Date,
    ip:          String,
    hits:        Number
}
~~~

## Install

~~~sh
npm install mongo-throttle [--save]
~~~

## Acknowledgments

## See Also
- [Initial blog post][0]

## License

MIT

[0]: http://www.andjosh.com/2016/03/13/rate-limit-node-mongodb/
