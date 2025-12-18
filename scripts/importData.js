// scripts/importData.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Import the service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

// 3. Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 4. Helper function to convert JSON timestamps to Firestore Timestamp
function convertToFirestoreTimestamp(item) {
  if (item.createdAt) {
    if (item.createdAt._seconds !== undefined) {
      item.createdAt = new admin.firestore.Timestamp(
        item.createdAt._seconds,
        item.createdAt._nanoseconds || 0
      );
    }
  }
  
  if (item.updatedAt) {
    if (item.updatedAt._seconds !== undefined) {
      item.updatedAt = new admin.firestore.Timestamp(
        item.updatedAt._seconds,
        item.updatedAt._nanoseconds || 0
      );
    }
  }
  
  return item;
}

// 5. Import a single collection
async function importCollection(collectionName) {
  const dataDir = path.join(__dirname, '..', 'data');
  const filePath = path.join(dataDir, `${collectionName}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return 0;
  }
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`📁 Importing ${data.length} documents to ${collectionName}...`);
    
    let importedCount = 0;
    const BATCH_LIMIT = 500; // Firestore batch limit
    
    // Process in batches
    for (let i = 0; i < data.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      const chunk = data.slice(i, i + BATCH_LIMIT);
      
      chunk.forEach(item => {
        // Preserve document ID if exists
        const docRef = item.id 
          ? db.collection(collectionName).doc(item.id)
          : db.collection(collectionName).doc();
        
        // Convert timestamps if needed
        const itemToImport = convertToFirestoreTimestamp({...item});
        
        // Remove id from data as it's already in document reference
        delete itemToImport.id;
        
        batch.set(docRef, itemToImport);
      });
      
      await batch.commit();
      importedCount += chunk.length;
      
      // Show progress
      const percent = Math.round((importedCount / data.length) * 100);
      console.log(`  ↳ Progress: ${importedCount}/${data.length} (${percent}%)`);
    }
    
    console.log(`✅ Successfully imported ${importedCount} documents to ${collectionName}\n`);
    return importedCount;
    
  } catch (error) {
    console.error(`❌ Error importing ${collectionName}:`, error.message);
    
    // More detailed error info
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    return 0;
  }
}

// 6. Import all collections
async function importAllData() {
  console.log('🚀 Starting Firestore Import...\n');
  
  // Define your collections
  const collections = ['products', 'users', 'orders']; // Add your collection names here
  
  let totalImported = 0;
  const dataDir = path.join(__dirname, '..', 'data');
  
  // Check if data directory exists
  if (!fs.existsSync(dataDir)) {
    console.log('❌ Data directory not found. Please export data first.');
    console.log('   Run: npm run export-data');
    return;
  }
  
  for (const collection of collections) {
    const count = await importCollection(collection);
    totalImported += count;
  }
  
  console.log(`🎉 Import completed! Total documents imported: ${totalImported}`);
  
  // Optional: Close Firebase connection
  await admin.app().delete();
}

// 7. Run the import
importAllData().catch(error => {
  console.error('Fatal error during import:', error);
  process.exit(1);
});