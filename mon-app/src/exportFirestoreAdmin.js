// exportFirestoreAdmin.js
const admin = require('firebase-admin');
const fs = require('fs');

// 🔹 Charge la clé de service
const serviceAccount = require('./serviceAccountKey.json'); 

// 🔹 Initialisation Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔹 Fonction pour exporter une collection Firestore en JSON
async function exportCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = {};
    snapshot.forEach(doc => {
      data[doc.id] = doc.data();
    });

    fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
    console.log(`Export de la collection "${collectionName}" terminé !`);
  } catch (error) {
    console.error(`Erreur lors de l'export de ${collectionName} :`, error);
  }
}

// 🔹 Export des collections
async function exportAll() {
  await exportCollection('users');
  await exportCollection('chats');
}

exportAll();
