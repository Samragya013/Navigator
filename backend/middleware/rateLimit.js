/**
 * Rate Limiting Middleware
 * Prevents abuse and ensures fair API usage
 */

import rateLimit from 'express-rate-limit';

/**
 * Create rate limiting middleware
 */
export const createRateLimiter = (windowMs = 900000, maxRequests = 100) => {
    return rateLimit({
        windowMs: windowMs, // 15 minutes
        max: maxRequests, // Limit each IP to 100 requests per windowMs
        message: {
            status: 'error',
            message: 'Too many requests. Please try again later.'
        },
        standardHeaders: true, // Return rate limit info in RateLimit-* headers
        legacyHeaders: false, // Disable X-RateLimit-* headers
        skip: (req) => {
            // Skip rate limiting for health checks
            return req.path === '/health';
        }
    });
};

/**
 * Strict rate limiter for location endpoint
 */
export const locationLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 30, // Limit each IP to 30 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many location requests. Please wait before trying again.'
    }
});

/**
 * Sliding window rate limiter (for production)
 * Implements token bucket algorithm
 */
const tokenBuckets = new Map();

export const slidingWindowLimiter = (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxTokens = 30;

    // Initialize bucket if needed
    if (!tokenBuckets.has(key)) {
        tokenBuckets.set(key, {
            tokens: maxTokens,
            lastRefill: now
        });
    }

    const bucket = tokenBuckets.get(key);

    // Calculate new tokens based on time elapsed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / windowMs) * maxTokens;
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request is allowed
    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        next();
    } else {
        return res.status(429).json({
            status: 'error',
            message: 'Rate limit exceeded. Too many requests.',
            retryAfter: Math.ceil((1 - bucket.tokens) / (maxTokens / windowMs))
        });
    }
};
