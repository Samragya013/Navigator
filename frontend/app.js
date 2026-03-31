/**
 * App Module - Main application initialization and global utilities
 */

// ============================================
// APPLICATION INITIALIZATION
// ============================================

/**
 * Initialize application
 */
function initializeApp() {
    console.log('🚀 Initializing application...');
    
    // Set application metadata
    document.title = 'Interactive Map - Time Estimation';
    
    // Add meta tags for better SEO and mobile support
    addMetaTags();
    
    // Initialize app state
    window.appState = {
        isProcessing: false,
        selectedLocation: null,
        lastRequest: null,
        apiTimeout: 30000
    };
    
    console.log('✓ Application initialized');
}

// ============================================
// META TAGS
// ============================================

/**
 * Add meta tags to document head
 */
function addMetaTags() {
    const head = document.head;

    // Create meta tags
    const metaTags = [
        {
            name: 'description',
            content: 'Interactive map-based time estimation system. Select a location and get estimated travel time.'
        },
        {
            name: 'theme-color',
            content: '#1a1a1a'
        },
        {
            name: 'apple-mobile-web-app-capable',
            content: 'yes'
        },
        {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black-translucent'
        }
    ];

    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        Object.entries(tag).forEach(([key, value]) => {
            meta.setAttribute(key, value);
        });
        head.appendChild(meta);
    });
}

// ============================================
// GLOBAL ERROR HANDLING
// ============================================

/**
 * Handle global errors
 */
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Log performance metrics
 */
function logPerformanceMetrics() {
    if (typeof window.performance === 'undefined') {
        console.log('Performance API not available');
        return;
    }

    window.addEventListener('load', () => {
        // Get performance timing
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        console.log('⏱️ Performance Metrics:');
        console.log('  DOM Load Time: ' + (perfData.domContentLoadedEventEnd - perfData.navigationStart) + 'ms');
        console.log('  Page Load Time: ' + pageLoadTime + 'ms');

        // Log resource timings
        const resources = window.performance.getEntriesByType('resource');
        console.log('  Resources Loaded: ' + resources.length);
    });
}

// ============================================
// LOCAL STORAGE UTILITIES
// ============================================

/**
 * Get item from local storage
 */
function getStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return defaultValue;
    }
}

/**
 * Set item in local storage
 */
function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error writing to storage:', error);
        return false;
    }
}

/**
 * Clear specific item from storage
 */
function clearStorageItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
}

// ============================================
// API UTILITIES
// ============================================

/**
 * Make API request with timeout
 */
async function makeAPIRequest(url, options = {}) {
    const timeout = options.timeout || window.appState.apiTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch {
        return 'Invalid date';
    }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format distance value
 */
function formatDistance(kilometers) {
    if (kilometers < 1) {
        return Math.round(kilometers * 1000) + ' m';
    }
    return kilometers.toFixed(2) + ' km';
}

/**
 * Format time value
 */
function formatTime(minutes) {
    if (minutes < 60) {
        return Math.round(minutes) + ' minutes';
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours + ' h ' + mins + ' m';
}

/**
 * Get query parameter from URL
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
function setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
}

// ============================================
// LOGGER UTILITY
// ============================================

/**
 * Logging utility with levels
 */
const Logger = {
    info: (message, data) => {
        console.log(`ℹ️ [INFO] ${message}`, data || '');
    },
    warn: (message, data) => {
        console.warn(`⚠️ [WARN] ${message}`, data || '');
    },
    error: (message, data) => {
        console.error(`❌ [ERROR] ${message}`, data || '');
    },
    success: (message, data) => {
        console.log(`✅ [SUCCESS] ${message}`, data || '');
    },
    debug: (message, data) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`🐛 [DEBUG] ${message}`, data || '');
        }
    }
};

// ============================================
// SERVICE WORKER (PWA SUPPORT)
// ============================================

/**
 * Register service worker for offline support (optional)
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✓ Service Worker registered');
            })
            .catch((error) => {
                console.log('Service Worker registration not available:', error);
            });
    }
}

// ============================================
// APP STARTUP
// ============================================

// Initialize app on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        logPerformanceMetrics();
    });
} else {
    initializeApp();
    logPerformanceMetrics();
}

// Global utilities
window.Logger = Logger;
window.Utils = {
    formatTimestamp,
    debounce,
    throttle,
    formatDistance,
    formatTime,
    getQueryParam,
    setQueryParam,
    getStorageItem,
    setStorageItem,
    clearStorageItem,
    makeAPIRequest
};

// Application ready
console.log('💡 Application utilities loaded');
