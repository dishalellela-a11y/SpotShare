import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCP8F7PYkF7GVCwZX--zfuvv0lqgeyFk0",
  authDomain: "spotshare-d838f.firebaseapp.com",
  projectId: "spotshare-d838f",
  storageBucket: "spotshare-d838f.firebasestorage.app",
  messagingSenderId: "560744978893",
  appId: "1:560744978893:web:0ecdebabcb275525088c84",
  measurementId: "G-D790TWBKZ0"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;