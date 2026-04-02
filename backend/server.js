/**
 * Main Express Server
 * Entry point for the backend API
 * Now serves both backend API and frontend static files (Full-stack)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRateLimiter } from './middleware/rateLimit.js';
import { initializeFirebase } from './database/firebasConfig.js';
import navigationRoutes from './routes/navigation.js';

// Get directory path for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet helps secure Express apps by setting HTTP response headers
// Configure helmet with proper CSP to allow frontend CDN resources
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://router.project-osrm.org", "https://nominatim.openstreetmap.org", "https://*.basemaps.cartocdn.com"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// CORS configuration - Accept multiple origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

// Add support for Render.com deployment
const isRenderDeployment = process.env.RENDER === 'true';

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests without origin (same-origin requests)
        if (!origin) {
            callback(null, true);
            return;
        }
        
        // Check specific origins
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        
        // For Render.com deployments, allow render.com domains
        if (isRenderDeployment && origin && origin.includes('render.com')) {
            callback(null, true);
            return;
        }
        
        // For production, allow the frontend URL
        if (process.env.NODE_ENV === 'production' && origin === process.env.FRONTEND_URL) {
            callback(null, true);
            return;
        }
        
        // Deny other origins in production
        if (process.env.NODE_ENV === 'production') {
            callback(new Error('Not allowed by CORS'));
            return;
        }
        
        // Allow all in development
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-ID'],
    maxAge: 3600
};

app.use(cors(corsOptions));

// Rate limiting
const globalLimiter = createRateLimiter(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);
app.use(globalLimiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logSymbol = res.statusCode >= 400 ? '✗' : '✓';
        console.log(
            `${logSymbol} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
    });

    next();
});

// ============================================
// SERVE STATIC FRONTEND FILES
// ============================================

const frontendPath = path.join(__dirname, '../frontend');

// Serve frontend static files (CSS, JS, images, etc.)
app.use(express.static(frontendPath));

// ============================================
// ROUTES
// ============================================

// API Routes
app.use('/api', navigationRoutes);

/**
 * Root endpoint - serve index.html for SPA
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

/**
 * Catch-all route - serve index.html for browser routing
 */
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).json({
                error: 'Page not found',
                path: req.path
            });
        }
    });
});

/**
 * Root path with documentation
 */
app.get('/docs', (req, res) => {
    res.status(200).json({
        title: 'Interactive Map Time Estimation API',
        description: 'REST API for calculating time estimations based on map coordinates',
        version: '1.0.0',
        endpoints: [
            {
                method: 'POST',
                path: '/api/location',
                description: 'Submit coordinates and get time estimation',
                body: {
                    latitude: 'number (required)',
                    longitude: 'number (required)'
                },
                example_response: {
                    status: 'success',
                    message: 'Estimated travel time calculated successfully.',
                    estimated_time: '25 minutes',
                    distance: '20.50 kilometers',
                    location: { latitude: 40.7128, longitude: -74.006 },
                    timestamp: '2026-03-31T12:00:00.000Z',
                    requestId: 'doc123'
                }
            },
            {
                method: 'GET',
                path: '/api/result/:requestId',
                description: 'Retrieve stored result by request ID',
                params: {
                    requestId: 'string (required)'
                }
            },
            {
                method: 'POST',
                path: '/api/validate',
                description: 'Validate coordinates without storing',
                body: {
                    latitude: 'number',
                    longitude: 'number'
                }
            },
            {
                method: 'GET',
                path: '/api/health',
                description: 'Health check endpoint'
            }
        ]
    });
});

// ============================================
// 404 HANDLER
// ============================================

app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found.',
        path: req.originalUrl,
        method: req.method
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error('✗ Unhandled error:', err);

    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred processing your request.'
            : err.message,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// SERVER STARTUP
// ============================================

/**
 * Start server and initialize services
 */
const startServer = async () => {
    try {
        // Initialize Firebase if configured
        if (process.env.FIREBASE_PROJECT_ID) {
            console.log('📦 Initializing Firebase Firestore...');
            try {
                initializeFirebase();
                console.log('✓ Firebase connection established and verified');
            } catch (firebaseError) {
                console.error('✗ Firebase initialization failed:', firebaseError.message);
                console.error('⚠️  Continuing without database - some features may not work');
            }
        } else {
            console.warn('⚠️  Firebase not configured in .env');
            console.warn('    Location data will not be persisted');
            console.warn('    See .env.example for configuration instructions');
        }

        // Start Express server
        const server = app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════');
            console.log('🚀 Interactive Map Backend Server');
            console.log('═══════════════════════════════════════════════');
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'not configured'}`);
            console.log(`✓ API Docs: http://localhost:${PORT}/docs`);
            console.log('✓ Database: Firebase Firestore');
            console.log('═══════════════════════════════════════════════');
            console.log('');
        });

        // Store server reference for graceful shutdown
        global.server = server;

    } catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle process termination with graceful shutdown
process.on('SIGINT', () => {
    console.log('\n✓ Received SIGINT - shutting down gracefully...');
    gracefulShutdown();
});

process.on('SIGTERM', () => {
    console.log('\n✓ Received SIGTERM - terminating...');
    gracefulShutdown();
});

// Graceful shutdown function
async function gracefulShutdown() {
    try {
        // Close HTTP server
        if (global.server) {
            await new Promise((resolve) => {
                global.server.close(() => {
                    console.log('✓ HTTP server closed');
                    resolve();
                });
            });
        }

        // Close Firebase connection
        const { closeFirebase } = await import('./database/firebasConfig.js');
        await closeFirebase();

        console.log('✓ Graceful shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error during shutdown:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

export default app;
