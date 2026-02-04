// exportFirestore.cjs
const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");

// 🔹 Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2mkLUO2WLBE2a37J1Qz99ZMmIGXFfQJc",
  authDomain: "cbt-chat-b4012-da6fa.firebaseapp.com",
  projectId: "cbt-chat-b4012-da6fa",
  storageBucket: "cbt-chat-b4012-da6fa.firebasestorage.app",
  messagingSenderId: "800256137436",
  appId: "1:800256137436:web:527be3152036cf8c73fc19",
  measurementId: "G-2LDD34S2RZ"
};

// 🔹 Initialisation Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Fonction pour exporter une collection Firestore en JSON
async function exportCollection(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    let data = {};
    snapshot.forEach(doc => {
      data[doc.id] = doc.data();
    });

    fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
    console.log(`Export de la collection "${collectionName}" terminé !`);
  } catch (error) {
    console.error("Erreur lors de l'export :", error);
  }
}

// 🔹 Exemple : exporter la collection "users"
exportCollection("users");
