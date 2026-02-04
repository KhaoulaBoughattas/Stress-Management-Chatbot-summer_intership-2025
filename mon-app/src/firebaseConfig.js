// src/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2mkLUO2WLBE2a37J1Qz99ZMmIGXFfQJc",
  authDomain: "cbt-chat-b4012-da6fa.firebaseapp.com",
  projectId: "cbt-chat-b4012-da6fa",
  storageBucket: "cbt-chat-b4012-da6fa.firebasestorage.app",
  messagingSenderId: "800256137436",
  appId: "1:800256137436:web:527be3152036cf8c73fc19",
  measurementId: "G-2LDD34S2RZ"
};

// ⚡ Initialiser Firebase seulement si aucune app n'existe encore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialisation Auth et Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
