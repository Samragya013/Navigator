/**
 * DEPRECATED: Google Maps Service
 * 
 * This service has been removed and replaced with:
 * - OpenRouteService (for directions and routing)
 * - Nominatim (for geocoding)
 * 
 * Both are free, open-source services with no API key requirement.
 * 
 * See: services/navigationService.js for the current implementation
 */

export async function getDirections() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}

export async function geocodeAddress() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}

export async function reverseGeocodeCoordinates() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}

export function calculateETA() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}

export function formatDuration() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}

export function formatDistance() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}

export function getVehiclePosition() {
    throw new Error('Google Maps Service is deprecated. Use navigationService.js instead.');
}
