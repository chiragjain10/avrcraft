// scripts/exportData.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Import the service account key correctly
//    Your key file should be in the 'scripts' folder or update the path
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];
    
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Export to data folder (outside scripts)
    const exportDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const exportPath = path.join(exportDir, `${collectionName}.json`);
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    console.log(`✅ Exported ${data.length} documents to data/${collectionName}.json`);
    
    return data.length;
  } catch (error) {
    console.error(`❌ Error exporting ${collectionName}:`, error.message);
    return 0;
  }
}

async function exportAllData() {
  console.log('🚀 Starting Firestore Export...\n');
  
  // List your collections here
  const collections = ['products', 'users', 'orders', 'categories', 'newsletterSubscriptions'];
  
  let totalExported = 0;
  
  for (const collection of collections) {
    const count = await exportCollection(collection);
    totalExported += count;
  }
  
  console.log(`\n🎉 Export completed! Total documents exported: ${totalExported}`);
}

// Run the export
exportAllData().catch(console.error);