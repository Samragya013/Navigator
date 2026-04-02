/**
 * Distance Calculator Service
 * Uses OSRM (Open Source Routing Machine) for free distance and time calculations
 * Returns time estimation in clean English format with realistic traffic factors
 */

import axios from 'axios';

const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Calculate time estimation using OSRM
 */
export const calculateTimeEstimation = async (latitude, longitude) => {
    try {
        return await calculateWithOSRM(latitude, longitude);
    } catch (error) {
        console.error('✗ Error in calculateTimeEstimation:', error);
        throw error;
    }
};

/**
 * Calculate using OSRM (completely free, no API key required)
 */
async function calculateWithOSRM(latitude, longitude) {
    try {
        // Default starting point (center point for distance calculation)
        const startLat = 40.7128;
        const startLng = -74.0060;

        // Make API request to OSRM
        // OSRM expects coordinates in [longitude, latitude] order
        const url = `${OSRM_API_URL}/${startLng},${startLat};${longitude},${latitude}`;
        
        const response = await axios.get(url, {
            params: {
                overview: 'full',
                steps: true,
                geometries: 'geojson',
                annotations: 'duration,distance'
            },
            timeout: 10000
        });

        if (!response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found between coordinates');
        }

        const route = response.data.routes[0];

        // OSRM returns distance in meters and duration in seconds
        const distanceMeters = route.distance || 0;
        const durationSeconds = route.duration || 0;

        if (distanceMeters <= 0 || durationSeconds <= 0) {
            throw new Error('Invalid route: distance or duration is zero');
        }

        // Convert distance
        const distanceKm = distanceMeters / 1000;

        // Calculate base time from OSRM
        const baseTimeMinutes = Math.ceil(durationSeconds / 60);

        // Calculate realistic time with traffic factors
        const { timeMinutes, trafficFactor } = calculateRealisticTime(distanceKm);

        // Format time nicely
        const hours = Math.floor(timeMinutes / 60);
        const minutes = timeMinutes % 60;
        const timeFormatted = hours > 0 
            ? `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minutes`
            : `${timeMinutes} minutes`;

        console.log(`📊 Distance: ${distanceKm.toFixed(1)} km | Base Speed: ${(distanceKm / (baseTimeMinutes / 60)).toFixed(1)} km/h | Traffic Factor: ${trafficFactor.toFixed(2)}x | Estimated Time: ${timeFormatted}`);

        return {
            distanceKm: distanceKm.toFixed(2),
            timeMinutes: timeMinutes,
            trafficFactor: trafficFactor.toFixed(2),
            timeFormatted: timeFormatted,
            provider: 'OSRM with Traffic Estimation'
        };
    } catch (error) {
        console.error('✗ OSRM Error:', error.message);
        throw new Error(`Distance calculation failed: ${error.message}`);
    }
}

/**
 * Calculate realistic time based on traffic patterns
 * Returns time in minutes with traffic factor applied
 */
function calculateRealisticTime(distanceKm) {
    // Base speed assumptions (km/h)
    const baseSpeed = 50; // Conservative average speed
    
    // Calculate base time without traffic
    const baseTimeMinutes = (distanceKm / baseSpeed) * 60;

    // Get current time for traffic multiplier
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6 (0=Sunday, 6=Saturday)
    const hour = now.getHours(); // 0-23
    const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;

    // Traffic multiplier based on time of day
    let trafficMultiplier = 1.0;

    if (isWeekday) {
        // Morning rush (6:00-9:00) - slower
        if (hour >= 6 && hour < 9) {
            trafficMultiplier = 1.8;  // 80% slower
            console.log(`🚗 Traffic Calculation: Morning Rush (6am-9am) - Multiplier 1.8x`);
        }
        // Evening rush (16:00-19:00 / 4pm-7pm) - slowest
        else if (hour >= 16 && hour < 19) {
            trafficMultiplier = 2.2;  // 120% slower
            console.log(`🚗 Traffic Calculation: Evening Rush (4pm-7pm) - Multiplier 2.2x`);
        }
        // Mid-day (10:00-15:00)
        else if (hour >= 10 && hour < 16) {
            trafficMultiplier = 1.3;  // 30% slower
            console.log(`🚗 Traffic Calculation: Mid-day (10am-4pm) - Multiplier 1.3x`);
        }
        // Night (19:00-6:00 / 7pm-6am) - faster
        else {
            trafficMultiplier = 0.75; // 25% faster
            console.log(`🚗 Traffic Calculation: Night (7pm-6am) - Multiplier 0.75x`);
        }
    } else {
        // Weekend
        if (hour >= 10 && hour < 20) {
            trafficMultiplier = 1.25; // Slightly slower mid-day
            console.log(`🚗 Traffic Calculation: Weekend mid-day (10am-8pm) - Multiplier 1.25x`);
        } else {
            trafficMultiplier = 0.85; // Faster at other times
            console.log(`🚗 Traffic Calculation: Weekend off-peak - Multiplier 0.85x`);
        }
    }

    // Apply distance-based adjustment
    // Longer distances tend to have better average speeds
    if (distanceKm > 50) {
        trafficMultiplier *= 0.95; // Slightly reduce multiplier for long distances (better highways)
    } else if (distanceKm < 10) {
        trafficMultiplier *= 1.1;  // Increase for short distances (more urban)
    }

    // Add 10% safety buffer for unpredictable delays
    trafficMultiplier *= 1.1;

    // Calculate final time
    const finalTimeMinutes = Math.ceil(baseTimeMinutes * trafficMultiplier);

    return {
        timeMinutes: finalTimeMinutes,
        trafficFactor: trafficMultiplier
    };
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
