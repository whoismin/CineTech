import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnjXZYS-rS5JqVDlzDX-ShuoxNjjgps2s",
  authDomain: "cinema-23856.firebaseapp.com",
  projectId: "cinema-23856",
  storageBucket: "cinema-23856.firebasestorage.app",
  messagingSenderId: "238678248112",
  appId: "1:238678248112:web:318ce854c2f75887d44975"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que você usará
export const auth = getAuth(app);
export const db = getFirestore(app);