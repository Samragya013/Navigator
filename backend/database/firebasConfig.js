/**
 * Firebase Configuration and Database Module
 * Handles Firestore connection and operations
 * SECURITY: All credentials loaded from environment variables
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let db = null;

/**
 * Validate Firebase configuration
 * Ensures all required credentials are present
 */
function validateFirebaseConfig() {
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];

    const missing = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
        throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
    }

    console.log('✓ Firebase configuration validated');
}

/**
 * Initialize Firebase with secure configuration
 * Uses environment variables for all sensitive data
 * Firebase is OPTIONAL - app works without it using just OSRM routing
 */
export const initializeFirebase = () => {
    try {
        // Check if Firebase is configured
        if (!process.env.FIREBASE_PROJECT_ID) {
            console.warn('⚠️  Firebase not configured - Storage features disabled');
            console.log('ℹ️  App will use OSRM routing (no Firebase needed)');
            return null;
        }

        // Parse service account from environment variable
        let serviceAccount = null;
        
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                // If JSON string is provided, parse it
                serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT_KEY === 'string'
                    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
                    : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            } catch (parseError) {
                console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
            }
        }

        // Fallback to individual env variables (for development)
        if (!serviceAccount) {
            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            };
        }

        // Validate we have required service account fields
        if (!serviceAccount || !serviceAccount.projectId) {
            console.warn('⚠️ Firebase service account incomplete - continuing without storage');
            return null;
        }

        // Initialize Firebase Admin SDK if not already initialized
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        // Get Firestore instance
        db = admin.firestore();

        // Enable offline persistence (optional, for better reliability)
        db.settings({
            ignoreUndefinedProperties: true
        });

        console.log('✓ Firebase initialized successfully');
        console.log(`✓ Project: ${process.env.FIREBASE_PROJECT_ID}`);
        console.log('✓ Firestore connected and ready');
        
        return db;
    } catch (error) {
        console.warn('⚠️ Firebase initialization warning:', error.message);
        console.log('ℹ️  Continuing without Firebase - OSRM routing will work');
        return null;
    }
};

/**
 * Get Firestore instance
 * Returns null if Firebase not initialized (graceful fallback)
 */
export const getFirestore = () => {
    if (!db) {
        return null;
    }
    return db;
};

/**
 * Safely close Firebase connection (for graceful shutdown)
 */
export const closeFirebase = async () => {
    try {
        if (db) {
            await db.terminate();
            db = null;
            console.log('✓ Firebase connection closed');
        }
    } catch (error) {
        console.error('✗ Error closing Firebase:', error);
        throw error;
    }
};

/**
 * Store location request in Firestore
 */
export const storeLocationRequest = async (latitude, longitude, estimatedTime, status) => {
    try {
        const db = getFirestore();
        const timestamp = new Date();

        const locationData = {
            latitude,
            longitude,
            estimatedTime,
            status,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userAgent: 'web-app',
            ipAddress: null // Will be set by API route
        };

        const docRef = await db.collection('location_requests').add(locationData);

        console.log('✓ Location request stored:', docRef.id);
        return {
            id: docRef.id,
            ...locationData,
            createdAt: timestamp
        };
    } catch (error) {
        console.error('✗ Error storing location request:', error);
        throw error;
    }
};

/**
 * Retrieve location request by ID
 */
export const getLocationRequest = async (requestId) => {
    try {
        const db = getFirestore();
        const doc = await db.collection('location_requests').doc(requestId).get();

        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('✗ Error retrieving location request:', error);
        throw error;
    }
};

/**
 * Update location request
 */
export const updateLocationRequest = async (requestId, updates) => {
    try {
        const db = getFirestore();
        await db.collection('location_requests').doc(requestId).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✓ Location request updated:', requestId);
    } catch (error) {
        console.error('✗ Error updating location request:', error);
        throw error;
    }
};

/**
 * Get recent location requests
 */
export const getRecentLocationRequests = async (limit = 10) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('location_requests')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('✗ Error retrieving recent requests:', error);
        throw error;
    }
};

/**
 * Delete old location requests (cleanup)
 */
export const deleteOldLocationRequests = async (daysOld = 30) => {
    try {
        const db = getFirestore();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const snapshot = await db.collection('location_requests')
            .where('createdAt', '<', cutoffDate)
            .get();

        let deleted = 0;
        const batch = db.batch();

        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            deleted++;
        });

        if (deleted > 0) {
            await batch.commit();
            console.log(`✓ Deleted ${deleted} old location requests`);
        }

        return deleted;
    } catch (error) {
        console.error('✗ Error deleting old requests:', error);
        throw error;
    }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('location_requests').get();

        const stats = {
            totalRequests: snapshot.size,
            collectionName: 'location_requests',
            lastUpdated: new Date()
        };

        return stats;
    } catch (error) {
        console.error('✗ Error getting database stats:', error);
        throw error;
    }
};
