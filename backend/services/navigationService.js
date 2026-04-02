/**
 * Navigation Service
 * Handles route calculation using OSRM (Open Source Routing Machine) + Nominatim
 * OSRM is completely free and requires no API key
 */

import axios from 'axios';

const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/driving';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

/**
 * Calculate route between two coordinates
 * @param {Object} origin - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @returns {Promise<Object>} - Route data with distance, duration, coordinates
 */
export async function calculateRoute(origin, destination) {
    try {
        // Validate coordinates
        if (!isValidCoordinates(origin) || !isValidCoordinates(destination)) {
            throw new Error('Invalid coordinates provided');
        }

        // Call OSRM Routing API (completely free, no API key required)
        const response = await axios.get(
            `${OSRM_API_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
            {
                params: {
                    overview: 'full',
                    steps: true,
                    geometries: 'geojson',
                    annotations: 'duration,distance'
                },
                timeout: 10000
            }
        );

        if (!response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = response.data.routes[0];

        // OSRM returns distance in meters and duration in seconds
        const distanceMeters = route.distance || 0;
        const durationSeconds = route.duration || 0;

        // Validate that result makes logical sense
        if (distanceMeters <= 0 || durationSeconds <= 0) {
            throw new Error('Invalid route: distance or duration is zero');
        }

        // Calculate distance in km (needed for traffic multiplier calculation)
        const distanceKm = distanceMeters / 1000;

        // Convert distance (meters to km) for response
        const distance = {
            value: distanceMeters,
            text: `${(distanceMeters / 1000).toFixed(1)} km`
        };

        // Convert duration (seconds to minutes)
        let durationMinutes = Math.ceil(durationSeconds / 60);
        
        // Apply realistic traffic multiplier to account for real-world conditions
        const { adjustedMinutes, trafficFactor } = applyTrafficMultiplier(durationMinutes, distanceKm);
        durationMinutes = adjustedMinutes;

        const duration = {
            value: durationMinutes,
            text: `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`
        };

        // Calculate average speed (km/h) and warn if unrealistic
        const durationHours = durationSeconds / 3600;
        const avgSpeed = distanceKm / durationHours;

        // Log speed for debugging
        console.log(`📊 Route Analysis: ${distanceKm.toFixed(1)}km in ${durationMinutes}min = ${avgSpeed.toFixed(1)}km/h`);

        // Warn if speed is unrealistic (> 200 km/h or < 5 km/h for distances > 10km)
        if (avgSpeed > 200) {
            console.warn(`⚠️  WARNING: Unrealistic speed ${avgSpeed.toFixed(1)} km/h - route may be incorrect`);
        }
        if (distanceKm > 10 && avgSpeed < 5) {
            console.warn(`⚠️  WARNING: Very slow speed ${avgSpeed.toFixed(1)} km/h - route may be incorrect`);
        }

        // Extract coordinates from GeoJSON geometry
        const coordinates = route.geometry.coordinates.map(coord => ({
            lat: coord[1],
            lng: coord[0]
        }));

        // Calculate ETA
        const eta = calculateETA(durationMinutes);

        return {
            success: true,
            data: {
                distance,
                duration,
                coordinates,
                eta,
                polyline: coordinates,
                instructions: []
            }
        };
    } catch (error) {
        console.error('OSRM Route Calculation Error:', error.message);
        throw new Error(`Route calculation failed: ${error.message}`);
    }
}

/**
 * Reverse geocode coordinates to address
 * @param {Object} location - { lat, lng }
 * @returns {Promise<Object>} - Address data
 */
export async function reverseGeocode(location) {
    try {
        const response = await axios.get(`${NOMINATIM_API_URL}/reverse`, {
            params: {
                lat: location.lat,
                lon: location.lng,
                format: 'json',
                zoom: 18,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'SmartNavigation/1.0'
            },
            timeout: 5000
        });

        if (response.data && response.data.address) {
            const addr = response.data.address;
            const address = [
                addr.road || addr.street,
                addr.city || addr.town || addr.village,
                addr.state,
                addr.country
            ].filter(Boolean).join(', ');

            return {
                success: true,
                data: {
                    address: address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                    name: response.data.name,
                    coordinates: location
                }
            };
        } else {
            return {
                success: true,
                data: {
                    address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                    coordinates: location
                }
            };
        }
    } catch (error) {
        console.error('Nominatim geocoding error:', error.message);
        return {
            success: true,
            data: {
                address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                coordinates: location
            }
        };
    }
}

/**
 * Forward geocode address to coordinates
 * @param {string} address - Address string
 * @returns {Promise<Object>} - Coordinates
 */
export async function forwardGeocode(address) {
    try {
        const response = await axios.get(`${NOMINATIM_API_URL}/search`, {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'SmartNavigation/1.0'
            },
            timeout: 5000
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                success: true,
                data: {
                    location: {
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon)
                    },
                    address: result.display_name
                }
            };
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        console.error('Forward geocoding error:', error.message);
        throw new Error(`Geocoding failed: ${error.message}`);
    }
}

/**
 * Geocode pincode to coordinates
 * @param {string} pincode - Pincode string
 * @returns {Promise<Object>} - Coordinates
 */
export async function pinCodeGeocode(pincode) {
    try {
        // Remove spaces from pincode
        const cleanPincode = pincode.trim().replace(/\s+/g, '');

        // Search using Nominatim in India with postal_code
        const response = await axios.get(`${NOMINATIM_API_URL}/search`, {
            params: {
                postalcode: cleanPincode,
                country: 'India',
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'SmartNavigation/1.0'
            },
            timeout: 5000
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                success: true,
                data: {
                    location: {
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon)
                    },
                    address: result.display_name,
                    pincode: cleanPincode
                }
            };
        } else {
            throw new Error(`Pincode ${cleanPincode} not found in India`);
        }
    } catch (error) {
        console.error('Pincode geocoding error:', error.message);
        throw new Error(`Pincode lookup failed: ${error.message}`);
    }
}

/**
 * Apply realistic traffic multiplier based on time of day and distance
 * Accounts for peak hours, weekends, and road conditions
 */
function applyTrafficMultiplier(baseMinutes, distanceKm) {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    let trafficMultiplier = 1.0;

    if (isWeekend) {
        // Weekend - lighter traffic
        if (hour >= 19 || hour < 7) {
            trafficMultiplier = 0.9; // Night: 10% faster
        } else if (hour >= 7 && hour < 12) {
            trafficMultiplier = 1.15; // Morning: 15% slower
        } else if (hour >= 12 && hour < 17) {
            trafficMultiplier = 1.0; // Afternoon: normal
        } else {
            trafficMultiplier = 1.25; // Evening: 25% slower
        }
    } else {
        // Weekday - more traffic
        if (hour >= 19 || hour < 6) {
            trafficMultiplier = 0.85; // Night: 15% faster
        } else if (hour >= 6 && hour < 9) {
            trafficMultiplier = 1.6; // Morning rush: 60% SLOWER
        } else if (hour >= 9 && hour < 16) {
            trafficMultiplier = 1.0; // Daytime: normal
        } else if (hour >= 16 && hour < 19) {
            trafficMultiplier = 1.8; // Evening rush: 80% SLOWER
        }
    }

    // Adjust for distance
    if (distanceKm > 25) {
        trafficMultiplier *= 0.85; // Long routes: slightly better (may include highways)
    } else if (distanceKm < 5) {
        trafficMultiplier *= 1.1; // Short routes: more city traffic
    }

    // Add buffer for real-world delays
    const adjustedMinutes = Math.ceil(baseMinutes * trafficMultiplier);

    console.log(`🚗 Route Time Adjustment: ${baseMinutes}min base × ${trafficMultiplier.toFixed(2)} traffic = ${adjustedMinutes}min`);

    return {
        adjustedMinutes,
        trafficFactor: trafficMultiplier
    };
}

/**
 * Validate coordinates
 */
function isValidCoordinates(location) {
    if (!location || typeof location !== 'object') return false;
    const lat = location.lat || location.latitude;
    const lng = location.lng || location.longitude;
    return (
        typeof lat === 'number' && typeof lng === 'number' &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
    );
}

/**
 * Calculate ETA (Estimated Time of Arrival)
 */
function calculateETA(minutes) {
    const now = new Date();
    const arrival = new Date(now.getTime() + minutes * 60000);
    return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
