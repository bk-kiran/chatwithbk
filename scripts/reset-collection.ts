import {DataAPIClient} from '@datastax/astra-db-ts';
import "dotenv/config";

const {ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN} = process.env;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE});

async function resetCollection() {
    try {
        // Delete existing collection if it exists
        console.log('Attempting to delete existing collection...');
        try {
            await db.dropCollection(ASTRA_DB_COLLECTION);
            console.log('✓ Collection deleted');
        } catch (e) {
            console.log('Collection does not exist or already deleted');
        }

        // Create new collection with proper vector configuration
        console.log('Creating new collection with vector support...');
        const collection = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: "cosine"  // Try cosine instead of dot_product
            }
        });

        console.log('✅ Collection created successfully:', collection);
        console.log('\nNow run: npm run load-db');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

resetCollection();