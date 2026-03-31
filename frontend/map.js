/**
 * Map Module - Handles Leaflet map initialization and interactions
 * Backend URL Configuration: Update API_BASE_URL to match your backend server
 */

// ============================================
// CONFIGURATION
// ============================================

// Dynamically detect API URL based on environment
const API_BASE_URL = (() => {
    // If window location is on Render domain
    if (window.location.hostname && window.location.hostname.includes('render.com')) {
        // Extract backend URL from window or use default
        return window.BACKEND_API_URL || `${window.location.protocol}//navigator-backend.onrender.com`;
    }
    
    // Production environment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 80)}/api`;
    }
    
    // Local development
    return 'http://localhost:5000';
})();

const MAP_CONFIG = {
    defaultCenter: [40.7128, -74.0060], // New York City
    defaultZoom: 13,
    minZoom: 3,
    maxZoom: 18,
    tileLayer: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    }
};

// ============================================
// MAP STATE
// ============================================

let map = null;
let selectedMarker = null;
let userMarker = null;
const selectedLocation = {
    latitude: null,
    longitude: null
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the map on page load
 */
function initializeMap() {
    try {
        // Create map instance
        map = L.map('map', {
            center: MAP_CONFIG.defaultCenter,
            zoom: MAP_CONFIG.defaultZoom,
            minZoom: MAP_CONFIG.minZoom,
            maxZoom: MAP_CONFIG.maxZoom,
            zoomControl: true,
            preferCanvas: true
        });

        // Add tile layer
        L.tileLayer(MAP_CONFIG.tileLayer.url, {
            attribution: MAP_CONFIG.tileLayer.attribution,
            maxZoom: MAP_CONFIG.tileLayer.maxZoom,
            detectRetina: true
        }).addTo(map);

        // Get user location and center map
        getUserLocation();

        // Add click event listener
        map.on('click', handleMapClick);

        console.log('✓ Map initialized successfully');
    } catch (error) {
        console.error('✗ Error initializing map:', error);
        showError('Failed to initialize map. Please refresh the page.');
    }
}

// ============================================
// USER LOCATION
// ============================================

/**
 * Get user's current location and update map
 */
function getUserLocation() {
    if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default location');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Update map center
            map.setView([latitude, longitude], 15);

            // Add user location marker
            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([latitude, longitude], {
                icon: createUserIcon()
            })
                .bindPopup('📍 Your Current Location')
                .addTo(map);

            console.log('✓ User location detected:', latitude, longitude);
        },
        (error) => {
            console.warn('Could not get user location:', error.message);
        },
        {
            timeout: 10000,
            enableHighAccuracy: false
        }
    );
}

// ============================================
// MAP INTERACTION
// ============================================

/**
 * Handle map click event
 */
function handleMapClick(event) {
    const { lat, lng } = event.latlng;

    // Update selected location
    selectedLocation.latitude = lat;
    selectedLocation.longitude = lng;

    // Remove previous marker if exists
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
    }

    // Add new marker
    selectedMarker = L.marker([lat, lng], {
        icon: createSelectedIcon(),
        draggable: false
    })
        .bindPopup(`<strong>Selected Location</strong><br/>Latitude: ${lat.toFixed(6)}<br/>Longitude: ${lng.toFixed(6)}`)
        .openPopup()
        .addTo(map);

    console.log('✓ Location selected:', lat, lng);

    // Send location to backend for processing
    processLocation(lat, lng);
}

// ============================================
// LOCATION PROCESSING
// ============================================

/**
 * Send location to backend for time estimation
 */
async function processLocation(latitude, longitude) {
    try {
        updateLoadingState(true);
        updateStatusText('Processing request...');

        // Validate coordinates
        if (!isValidCoordinate(latitude, longitude)) {
            throw new Error('Invalid coordinates');
        }

        const payload = {
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6))
        };

        console.log('📤 Sending location to backend:', payload);

        // Make API request
        const response = await fetch(`${API_BASE_URL}/api/location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            timeout: 30000
        });

        // Handle response
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const result = await response.json();

        console.log('📥 Backend response:', result);

        // Display result
        displayResult(result, payload);
        updateStatusText('✓ Request completed successfully');

    } catch (error) {
        console.error('✗ Error processing location:', error);
        showError(`Failed to process location: ${error.message}`);
        updateStatusText('✗ Request failed');
    } finally {
        updateLoadingState(false);
    }
}

// ============================================
// RESULT DISPLAY
// ============================================

/**
 * Display result card with API response
 */
function displayResult(result, request) {
    const resultCard = document.getElementById('resultCard');
    const resultLocation = document.getElementById('resultLocation');
    const resultTime = document.getElementById('resultTime');
    const resultStatus = document.getElementById('resultStatus');
    const resultMessage = document.getElementById('resultMessage');

    // Format location
    resultLocation.textContent = `${request.latitude.toFixed(4)}°, ${request.longitude.toFixed(4)}°`;

    // Extract estimated time
    const estimatedTime = result.estimated_time || 'N/A';
    resultTime.textContent = estimatedTime;

    // Extract status
    const status = result.status || 'unknown';
    resultStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);

    // Extract message
    const message = result.message || 'No additional information available.';
    resultMessage.textContent = message;

    // Show result card
    resultCard.classList.remove('hidden');
    resultCard.classList.add('visible');

    // Scroll to result
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Update loading state
 */
function updateLoadingState(isLoading) {
    const loadingElement = document.getElementById('loading');

    if (isLoading) {
        loadingElement.classList.remove('hidden');
        loadingElement.classList.add('visible');
    } else {
        loadingElement.classList.add('hidden');
        loadingElement.classList.remove('visible');
    }
}

/**
 * Update status text
 */
function updateStatusText(text) {
    const statusText = document.getElementById('statusText');
    statusText.textContent = text;

    // Update status class
    if (text.startsWith('✓')) {
        statusText.className = 'status-text ready';
    } else if (text.startsWith('Processing')) {
        statusText.className = 'status-text loading';
    } else if (text.startsWith('✗')) {
        statusText.className = 'status-text error';
    } else {
        statusText.className = 'status-text';
    }
}

/**
 * Show error message
 */
function showError(errorText) {
    const errorMessage = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');

    errorTextElement.textContent = errorText;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('visible');
}

/**
 * Hide error message
 */
function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.add('hidden');
    errorMessage.classList.remove('visible');
}

/**
 * Hide result card
 */
function hideResult() {
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.add('hidden');
    resultCard.classList.remove('visible');
}

// ============================================
// MARKER ICONS
// ============================================

/**
 * Create custom icon for user location
 */
function createUserIcon() {
    return L.divIcon({
        html: `
            <div style="
                background-color: #00d4ff;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            "></div>
        `,
        iconSize: [24, 24],
        className: 'custom-marker'
    });
}

/**
 * Create custom icon for selected location
 */
function createSelectedIcon() {
    return L.divIcon({
        html: `
            <div style="
                background-color: #51cf66;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 12px rgba(81, 207, 102, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            ">📍</div>
        `,
        iconSize: [32, 32],
        className: 'custom-marker-selected'
    });
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate coordinates
 */
function isValidCoordinate(lat, lng) {
    return typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;
}

// ============================================
// EVENT LISTENERS
// ============================================

// Close result card
document.getElementById('closeResult')?.addEventListener('click', hideResult);

// Close error message
document.getElementById('closeError')?.addEventListener('click', hideError);

// Initialize map when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMap);
} else {
    initializeMap();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        map.invalidateSize();
    }
});

// Debug info
console.log('🗺️ Map module loaded');
console.log('📜 API Base URL:', API_BASE_URL);
console.log('🔍 Map Config:', MAP_CONFIG);
