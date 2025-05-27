import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        // Use the rate limiter to check if the request is allowed based on something like userId or ip address
        // For example, you can use req.ip or req.userId if you have user authentication
        const {success} = await ratelimit.limit("my-rate-limit");

        if (!success) {
            return res.status(429).json({ message: "Too many requests, please try again later." });
        }
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Rate limiter error:', error);
        next(error);
    }
}

export default rateLimiter;
// This middleware can be used in your server.js or wherever you define your routes