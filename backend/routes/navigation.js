/**
 * Navigation Routes
 * Handles route calculations, geocoding, and trip storage
 * Uses OpenRouteService + Nominatim (free services)
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { calculateRoute, reverseGeocode, forwardGeocode, pinCodeGeocode } from '../services/navigationService.js';
import { getFirestore } from '../database/firebasConfig.js';
import locationRoutes from './location.js';

const router = express.Router();

/**
 * POST /api/route
 * Calculate route between origin and destination
 * Stores trip data in Firestore
 */
router.post(
    '/route',
    [
        body('origin').notEmpty().withMessage('Origin is required'),
        body('destination').notEmpty().withMessage('Destination is required'),
        body('latitude').optional().isFloat(),
        body('longitude').optional().isFloat()
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { origin, destination, latitude, longitude } = req.body;

            console.log(`🗺️  Route Calculation: ${origin} → ${destination}`);

            // Parse coordinates
            const originCoords = parseCoordinates(origin);
            const destCoords = parseCoordinates(destination);

            if (!originCoords || !destCoords) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid coordinates. Use format: "lat,lng"'
                });
            }

            // Calculate route using navigation service
            let routeData;
            try {
                const result = await calculateRoute(originCoords, destCoords);
                routeData = result.data;
            } catch (err) {
                console.error('Route calculation error:', err.message);
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }

            // Get address information
            let originAddress = `${originCoords.lat.toFixed(4)}, ${originCoords.lng.toFixed(4)}`;
            let destAddress = `${destCoords.lat.toFixed(4)}, ${destCoords.lng.toFixed(4)}`;

            try {
                const originGeo = await reverseGeocode(originCoords);
                if (originGeo.success && originGeo.data) {
                    originAddress = originGeo.data.address;
                }
            } catch (err) {
                console.warn('Could not reverse geocode origin');
            }

            try {
                const destGeo = await reverseGeocode(destCoords);
                if (destGeo.success && destGeo.data) {
                    destAddress = destGeo.data.address;
                }
            } catch (err) {
                console.warn('Could not reverse geocode destination');
            }

            // Prepare trip data for response
            const tripData = {
                origin: {
                    address: originAddress,
                    coordinates: originCoords
                },
                destination: {
                    address: destAddress,
                    coordinates: destCoords
                },
                distance: routeData.distance,
                duration: routeData.duration,
                eta: routeData.eta,
                coordinates: routeData.coordinates,
                polyline: routeData.polyline,
                steps: routeData.instructions || [],
                user_location: latitude && longitude ? {
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude)
                } : null,
                timestamp: new Date().toISOString()
            };

            // Store in Firestore (optional)
            const db = getFirestore();
            if (db) {
                try {
                    await db.collection('trips').add({
                        origin_lat: originCoords.lat,
                        origin_lng: originCoords.lng,
                        origin_address: originAddress,
                        destination_lat: destCoords.lat,
                        destination_lng: destCoords.lng,
                        destination_address: destAddress,
                        distance_meters: routeData.distance.value || 0,
                        duration_minutes: routeData.duration.value || 0,
                        timestamp: new Date(),
                        ip_address: req.ip
                    });
                    console.log('✓ Trip stored in Firestore');
                } catch (firebaseErr) {
                    console.warn('⚠️  Could not store trip in Firestore:', firebaseErr.message);
                    // Continue - Firestore not required
                }
            }

            res.status(200).json({
                success: true,
                message: 'Route calculated successfully',
                data: tripData
            });

        } catch (error) {
            console.error('Route calculation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to calculate route',
                message: error.message
            });
        }
    }
);

/**
 * POST /api/geocode
 * Convert address to coordinates (forward geocoding)
 */
router.post(
    '/geocode',
    [body('address').notEmpty().withMessage('Address is required')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { address } = req.body;

            try {
                const result = await forwardGeocode(address);
                if (!result.success) {
                    return res.status(400).json(result);
                }

                res.status(200).json(result);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }

        } catch (error) {
            console.error('Geocoding error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to geocode address'
            });
        }
    }
);

/**
 * POST /api/geocode/reverse
 * Convert coordinates to address (reverse geocoding)
 */
router.post(
    '/geocode/reverse',
    [
        body('latitude').optional().isFloat(),
        body('longitude').optional().isFloat(),
        body('lat').optional().isFloat(),
        body('lng').optional().isFloat()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const lat = req.body.latitude || req.body.lat;
            const lng = req.body.longitude || req.body.lng;

            if (!lat || !lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Latitude and longitude are required'
                });
            }

            try {
                const result = await reverseGeocode({ lat, lng });
                if (!result.success) {
                    return res.status(400).json(result);
                }

                res.status(200).json(result);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }

        } catch (error) {
            console.error('Reverse geocoding error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to reverse geocode coordinates'
            });
        }
    }
);

/**
 * POST /api/pincode
 * Convert pincode to coordinates
 */
router.post(
    '/pincode',
    [body('pincode').notEmpty().withMessage('Pincode is required')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { pincode } = req.body;

            console.log(`📮 Pincode Lookup: ${pincode}`);

            try {
                const result = await pinCodeGeocode(pincode);
                if (!result.success) {
                    return res.status(400).json(result);
                }

                res.status(200).json(result);
            } catch (err) {
                return res.status(404).json({
                    success: false,
                    error: err.message
                });
            }

        } catch (error) {
            console.error('Pincode lookup error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to lookup pincode'
            });
        }
    }
);

/**
 * POST /api/address
 * Convert address to coordinates
 */
router.post(
    '/address',
    [body('address').notEmpty().withMessage('Address is required')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { address } = req.body;

            console.log(`🏢 Address Lookup: ${address}`);

            try {
                const result = await forwardGeocode(address);
                if (!result.success) {
                    return res.status(400).json(result);
                }

                res.status(200).json(result);
            } catch (err) {
                return res.status(404).json({
                    success: false,
                    error: err.message
                });
            }

        } catch (error) {
            console.error('Address lookup error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to lookup address'
            });
        }
    }
);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/trips
 * Get all stored trips (for analytics dashboard)
 */
router.get('/trips', async (req, res) => {
    try {
        const db = getFirestore();
        if (!db) {
            return res.status(503).json({
                success: false,
                error: 'Database unavailable'
            });
        }

        const snapshot = await db.collection('trips')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const trips = [];
        snapshot.forEach(doc => {
            trips.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({
            success: true,
            data: trips,
            count: trips.length
        });

    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trips'
        });
    }
});

/**
 * GET /api/trips/stats
 * Get trip statistics and analytics
 */
router.get('/trips/stats', async (req, res) => {
    try {
        const db = getFirestore();
        if (!db) {
            return res.status(503).json({
                success: false,
                error: 'Database unavailable'
            });
        }

        const snapshot = await db.collection('trips').get();

        let totalDistance = 0;
        let totalDuration = 0;
        let tripCount = 0;

        snapshot.forEach(doc => {
            const trip = doc.data();
            totalDistance += trip.distance_meters || 0;
            totalDuration += trip.duration_minutes || 0;
            tripCount++;
        });

        res.status(200).json({
            success: true,
            data: {
                total_trips: tripCount,
                total_distance_km: (totalDistance / 1000).toFixed(2),
                total_duration_hours: (totalDuration / 60).toFixed(2),
                average_distance_km: tripCount > 0 ? (totalDistance / 1000 / tripCount).toFixed(2) : 0,
                average_duration_minutes: tripCount > 0 ? Math.ceil(totalDuration / tripCount) : 0
            }
        });

    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate statistics'
        });
    }
});

/**
 * Helper function: Parse coordinates from "lat,lng" string
 */
function parseCoordinates(coordString) {
    if (!coordString || typeof coordString !== 'string') return null;

    const parts = coordString.trim().split(',').map(s => parseFloat(s.trim()));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const lat = parts[0];
        const lng = parts[1];

        // Validate coordinate ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
        }
    }

    return null;
}

// Include location routes
router.use('/', locationRoutes);

export default router;
