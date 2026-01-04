import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA45vZfu6DhsJeN877MAcQ37OOBc0uOQo0",
  authDomain: "rostro-dorado-clinic.firebaseapp.com",
  projectId: "rostro-dorado-clinic",
  storageBucket: "rostro-dorado-clinic.firebasestorage.app",
  messagingSenderId: "787986103208",
  appId: "1:787986103208:web:6a49a69ccbd1e9c5fcbb9d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };

