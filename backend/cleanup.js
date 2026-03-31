#!/usr/bin/env node

/**
 * Cleanup Utility
 * Removes old location requests from Firestore
 * Run with: node cleanup.js
 */

import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase
try {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();

    /**
     * Delete old requests
     */
    async function cleanupOldRequests(daysOld = 30) {
        try {
            console.log(`🧹 Starting cleanup (removing records older than ${daysOld} days)...`);

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const snapshot = await db.collection('location_requests')
                .where('createdAt', '<', cutoffDate)
                .get();

            console.log(`📊 Found ${snapshot.size} records to delete`);

            let deleted = 0;
            const batchSize = 100;
            let batch = db.batch();

            snapshot.docs.forEach((doc, index) => {
                batch.delete(doc.ref);
                deleted++;

                if (deleted % batchSize === 0) {
                    batch.commit()
                        .then(() => console.log(`✓ Batch committed (${deleted} records)`))
                        .catch(err => console.error('Error committing batch:', err));
                    batch = db.batch();
                }
            });

            if (deleted % batchSize !== 0) {
                await batch.commit();
            }

            console.log(`✓ Cleanup complete! Deleted ${deleted} records`);
            return deleted;

        } catch (error) {
            console.error('✗ Cleanup failed:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async function getDatabaseStats() {
        try {
            console.log('\n📈 Database Statistics:');

            const snapshot = await db.collection('location_requests').get();
            console.log(`   Total Records: ${snapshot.size}`);

            // Calculate average
            let totalTime = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    totalTime += data.createdAt.toDate().getTime();
                }
            });

            if (snapshot.size > 0) {
                const avgDate = new Date(totalTime / snapshot.size);
                console.log(`   Average Date: ${avgDate.toLocaleDateString()}`);
            }

            console.log(`   Timestamp: ${new Date().toLocaleString()}`);

        } catch (error) {
            console.error('✗ Error getting stats:', error);
        }
    }

    // Run cleanup
    await cleanupOldRequests(30); // Delete records older than 30 days
    await getDatabaseStats();

    process.exit(0);

} catch (error) {
    console.error('✗ Fatal error:', error);
    process.exit(1);
}
