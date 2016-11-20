# Mongo Throttle

> Basic IP rate-limiting middleware for Express stored in MongoDB. Use to throttle or limit incoming request rate.

Let MongoDB do the heavy lifting and synchronization of throttling/rate-limiting requestors. This [Express][1] middleware registers and maintains a rate limit for each requesting IP address. It uses MongoDB's built-in expiration index to automatically sweep out expired `Throttle` records.

This rate-limiting implementation will scale across multiple servers with the same implementation.

## Usage
~~~js
var throttler = require('mongo-throttle');

// In Express-style app:
app.use(throttle());

// Optionally only rate-limit requests that begin with /api/
app.use('/api/', throttle());

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
        "ttl": 600      // TTL window for each IP limit
        "max": 600      // Max hits for IP within window
    },
    "response": {
        "code":    429, // Response code when limit is reached
        "message": "Rate Limit reached. Please wait and try again."
    },
    "mongoose":{
	"uri": false    // Optional Mongo URI connection string
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

## Acknowledgments/Notes
Mongo has a useful feature called [a TTL index][2].

> TTL collections make it possible to store data in MongoDB and have the mongod automatically remove data after a specified number of seconds or at a specific clock time.

You can tell Mongo to remove data for you! We will use this to remove expired request counts from our rate-limiting check. There are a couple important things to note about this feature:

- As an index, it is set upon collection creation. If you want to change it, you'll have to do so manually.
- The index-specific field, `expireAfterSeconds`, is _in seconds_. Unlike most other timestamps in your JavaScript code, _don't_ divide this by 1000.

## See Also
- [Initial blog post][0]

## License

MIT

[0]: http://www.andjosh.com/2016/03/13/rate-limit-node-mongodb/
[1]: https://expressjs.com
[2]: https://docs.mongodb.org/manual/tutorial/expire-data/
