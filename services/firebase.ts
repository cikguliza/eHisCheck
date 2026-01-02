import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAajkm7vicqAa6_4f3yvpnFqBVDPqAwUTU",
  authDomain: "e-hischecker.firebaseapp.com",
  projectId: "e-hischecker",
  storageBucket: "e-hischecker.firebasestorage.app",
  messagingSenderId: "197637883730",
  appId: "1:197637883730:web:3f1b9dc22301eac9ccdc8b",
  measurementId: "G-T0KQ12D3TL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);