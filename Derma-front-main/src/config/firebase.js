import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ استبدل القيم دي بالـ Config بتاعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC69VcQyknqQlFszAR9LeIRrX4iRkCniWQ",
  authDomain: "dermavision-ai-86177.firebaseapp.com",
  projectId: "dermavision-ai-86177",
  storageBucket: "dermavision-ai-86177.firebasestorage.app",
  messagingSenderId: "228750186549",
  appId: "1:228750186549:web:219c780add6bf1b9b6b97c",
  measurementId: "G-7QVRQXH037"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;