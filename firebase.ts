import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBvsXf4DcWsVZvD5N9eoBfp5qRGaOfDt28",
  authDomain: "rostrodorado.com",
  projectId: "rostrodorado-80279",
  storageBucket: "rostrodorado-80279.firebasestorage.app",
  messagingSenderId: "350987427158",
  appId: "1:350987427158:web:c0a0bca7fe34f421aa8af7",
  measurementId: "G-P12QC27KQL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };

