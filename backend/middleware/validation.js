/**
 * Input Validation Middleware
 * Validates and sanitizes incoming requests
 */

import { body, validationResult } from 'express-validator';

/**
 * Validate location coordinates
 */
export const validateLocationInput = [
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid coordinates',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate request body format
 */
export const validateRequestBody = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request body'
        });
    }
    next();
};

/**
 * Sanitize numeric inputs
 */
export const sanitizeCoordinates = (req, res, next) => {
    if (req.body.latitude) {
        req.body.latitude = parseFloat(req.body.latitude);
    }
    if (req.body.longitude) {
        req.body.longitude = parseFloat(req.body.longitude);
    }
    next();
};
