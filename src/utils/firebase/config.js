import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA67n4WQjCeNBXdZ1nUnbltW-Zd-crcLDQ",
  authDomain: "avrcrafts-b5ab3.firebaseapp.com",
  projectId: "avrcrafts-b5ab3",
  storageBucket: "avrcrafts-b5ab3.firebasestorage.app",
  messagingSenderId: "646327032228",
  appId: "1:646327032228:web:cc48f0f6c319e209114931",
  measurementId: "G-6D2VKQ4HQZ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

export default app