/**
 * Distance Calculator Service
 * Uses OpenRouteService API for distance and time calculations
 * Returns time estimation in clean English format
 */

import axios from 'axios';

const OPENROUTE_API_URL = 'https://api.openrouteservice.org/v2/matrix/driving';

/**
 * Calculate time estimation using OpenRouteService
 */
export const calculateTimeEstimation = async (latitude, longitude) => {
    try {
        // Use OpenRouteService (free, no key required)
        return await calculateWithOpenRouteService(latitude, longitude);
    } catch (error) {
        console.error('✗ Error in calculateTimeEstimation:', error);
        throw error;
    }
};

/**
 * Calculate using OpenRouteService
 */
async function calculateWithOpenRouteService(latitude, longitude) {
    try {
        // Default starting point (center point for distance calculation)
        const startLat = 40.7128;
        const startLng = -74.0060;

        // Make API request
        const response = await axios.post(
            OPENROUTE_API_URL,
            {
                locations: [
                    [startLng, startLat],
                    [longitude, latitude]
                ]
            },
            {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );

        // Extract distance and calculate time
        const distanceMeters = response.data.distances[0][1];
        const timeMinutes = Math.round(distanceMeters / 1000 / 50 * 60); // Approximate: 50 km/h average

        return {
            distanceKm: (distanceMeters / 1000).toFixed(2),
            timeMinutes,
            timeFormatted: formatTimeInEnglish(timeMinutes),
            provider: 'OpenRouteService'
        };
    } catch (error) {
        console.error('✗ OpenRouteService error:', error.message);
        throw error;
    }
}

/**
 * Format time in clean English (CRITICAL: Always English)
 */
export function formatTimeInEnglish(minutes) {
    if (minutes < 1) {
        return 'Less than a minute';
    }

    if (minutes < 60) {
        return `${Math.round(minutes)} minute${Math.round(minutes) !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} and ${Math.round(remainingMinutes)} minute${Math.round(remainingMinutes) !== 1 ? 's' : ''}`;
}

/**
 * Validate coordinates before API call
 */
export function isValidCoordinate(latitude, longitude) {
    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

/**
 * Get distance between two points (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Get health status of distance calculator
 */
export async function getDistanceCalculatorHealth() {
    return {
        status: 'healthy',
        provider: 'OpenRouteService',
        timestamp: new Date()
    };
}
