// scripts/seed-mock-data.ts
// Run this script with: npx ts-node scripts/seed-mock-data.ts
import admin from "firebase-admin";
import { mockProducts, mockCategories } from "../lib/firebase/mock-data";
import path from "path";
import fs from "fs";

// Load service account key from environment variable or file
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve(__dirname,  "../lib/firebase/serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    serviceAccountPath + " Service account key file not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or place serviceAccountKey.json in the project root."
  );
}
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function seedCollection(collectionName: string, data: any[]) {
  const batch = db.batch();
  const collectionRef = db.collection(collectionName);

  for (const item of data) {
    const docId = item.productId || item.categoryId;
    if (!docId) {
      console.warn(`Skipping item in ${collectionName} due to missing ID:`, item);
      continue;
    }
    const docRef = collectionRef.doc(docId);
    // Use set with merge: true to create or update
    batch.set(docRef, item, { merge: true });
  }

  await batch.commit();
  console.log(`Processed ${data.length} documents for ${collectionName}.`);
}

async function main() {
  await seedCollection("products", mockProducts);
  await seedCollection("categories", mockCategories);
  console.log("Firestore seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
