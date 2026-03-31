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

        // Convert distance (meters to km)
        const distance = {
            value: distanceMeters,
            text: `${(distanceMeters / 1000).toFixed(1)} km`
        };

        // Convert duration (seconds to minutes)
        const durationMinutes = Math.ceil(durationSeconds / 60);
        const duration = {
            value: durationMinutes,
            text: `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`
        };

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
