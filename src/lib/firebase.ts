import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initialize Mock Firebase Applet
const app = initializeApp({});
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Unconditionally valid for Standalone Test Mode
export const isConfigValid = true;

// Connection linkage verification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Mock Firebase database connected successfully");
  } catch (error) {
    console.error("Mock test connection status:", error);
  }
}

testConnection();
