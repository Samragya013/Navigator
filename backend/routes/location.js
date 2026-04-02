/**
 * Location Routes
 * Handles POST /api/location and GET /api/result endpoints
 */

import express from 'express';
import { validateLocationInput, sanitizeCoordinates } from '../middleware/validation.js';
import { locationLimiter } from '../middleware/rateLimit.js';
import { calculateTimeEstimation } from '../services/distanceCalculator.js';
import { storeLocationRequest } from '../database/firebasConfig.js';

const router = express.Router();

/**
 * POST /api/location
 * Accept latitude and longitude, calculate time estimation
 * Returns structured JSON response in English
 */
router.post(
    '/location',
    locationLimiter,
    validateLocationInput,
    sanitizeCoordinates,
    async (req, res) => {
        try {
            const { latitude, longitude } = req.body;
            const clientIp = req.ip || req.connection.remoteAddress;

            console.log(`📍 Location request received: [${latitude}, ${longitude}] from ${clientIp}`);

            // Calculate time estimation
            const estimation = await calculateTimeEstimation(latitude, longitude);

            // Try to store in database (optional)
            let storedData = null;
            try {
                storedData = await storeLocationRequest(
                    latitude,
                    longitude,
                    estimation.timeFormatted,
                    'success'
                );
            } catch (firebaseErr) {
                console.warn('⚠️  Firebase storage unavailable, continuing without persistence:', firebaseErr.message);
                // Firestore is optional - proceed without it
            }

            // Format response (ALWAYS IN ENGLISH)
            const response = {
                status: 'success',
                message: 'Estimated travel time calculated successfully.',
                estimated_time: estimation.timeFormatted,
                estimated_time_minutes: estimation.timeMinutes,
                distance: `${estimation.distanceKm} kilometers`,
                traffic_factor: estimation.trafficFactor || '1.0',
                location: {
                    latitude,
                    longitude
                },
                timestamp: new Date().toISOString(),
                requestId: storedData?.id || 'local-' + Date.now(),
                provider: estimation.provider
            };

            console.log('✓ Location processed successfully');
            res.status(200).json(response);

        } catch (error) {
            console.error('✗ Error processing location:', error);

            // Determine error status
            let statusCode = 500;
            let message = 'Failed to calculate time estimation.';

            if (error.message.includes('coordinates')) {
                statusCode = 400;
                message = 'Invalid coordinates provided.';
            } else if (error.message.includes('API')) {
                statusCode = 503;
                message = 'Distance calculation service temporarily unavailable. Please try again later.';
            }

            // Error response (ALWAYS IN ENGLISH)
            res.status(statusCode).json({
                status: 'error',
                message: message,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * GET /api/result/:requestId
 * Retrieve stored location result by request ID
 */
router.get('/result/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || requestId.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Request ID is required.'
            });
        }

        // Retrieve from database
        const result = await getLocationRequest(requestId);

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Request not found.'
            });
        }

        // Format response
        const response = {
            status: 'success',
            message: 'Result retrieved successfully.',
            data: result,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('✗ Error retrieving result:', error);

        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve result.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'Location API is running.',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * POST /api/validate
 * Validate coordinates without storing
 */
router.post('/validate', sanitizeCoordinates, (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        // Validate
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid coordinate format.'
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                status: 'error',
                message: 'Coordinates out of valid range.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Coordinates are valid.',
            coordinates: { latitude, longitude }
        });

    } catch (error) {
        console.error('✗ Validation error:', error);
        res.status(400).json({
            status: 'error',
            message: 'Validation failed.'
        });
    }
});

export default router;
