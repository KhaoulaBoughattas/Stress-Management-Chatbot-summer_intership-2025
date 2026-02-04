// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// ⚡ Firebase Admin (Node.js)
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Assure-toi que ce fichier est présent

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const PY_HMRAG_URL = process.env.PY_HMRAG_URL || "http://127.0.0.1:8001";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(bodyParser.json());

let sessions = {};

// ---------- CHAT route ----------
app.post('/chat', async (req, res) => {
  try {
    const { provider, message, model, language, userId, history, params } = req.body;
    const userKey = userId || 'default';
    const now = new Date();

    // Init session si elle n'existe pas
    if (!sessions[userKey]) {
      sessions[userKey] = { context: [], startTime: now, lastActivity: now };
    }
    const session = sessions[userKey];
    session.lastActivity = now;

    console.log(`🟢 Provider: ${provider} | Model: ${model} | Message: ${message}`);

    const safeModel = model || 'segma3b'; // Modèle par défaut Ollama
    const safeLanguage = language || 'fr';
    const safeMessage = message || '';
    const safeHistory = Array.isArray(history) ? history : [];
    const safeParams = params || {};

    // ---------- HM-RAG ----------
    if (provider === 'hmrag') {
      try {
        const { data } = await axios.post(
          `${PY_HMRAG_URL}/chat`,
          { message: safeMessage, history: safeHistory, params: safeParams },
          { timeout: 30000 }
        );

        const chatbotReply = data?.answer || "(aucune réponse HM-RAG)";
        session.context.push({ role: 'assistant', content: chatbotReply });

        // Sauvegarde dans Firebase
        await db.collection('chats').add({
          message: safeMessage,
          reply: chatbotReply,
          model: safeModel,
          language: safeLanguage,
          citations: data?.citations || [],
          timestamp: now
        });

        return res.json({ reply: chatbotReply, citations: data?.citations || [] });
      } catch (err) {
        console.error("❌ HM-RAG error:", err.message);
        return res.status(500).json({ error: "HM-RAG unreachable" });
      }
    }

    // ---------- OLLAMA ----------
    try {
      const systemMessageContent = {
        fr: '[Réponds UNIQUEMENT en français] Tu es un psychologue bienveillant...',
        en: '[Respond ONLY in English] You are a kind therapist...',
        ar: '[أجب باللغة العربية فقط] أنت أخصائي نفسي طيب...'
      }[safeLanguage] || '';

      // Recréer le contexte avec l'historique si nécessaire
      const messages = [{ role: "system", content: systemMessageContent }];
      if (safeHistory.length) {
        safeHistory.forEach(turn => messages.push({ role: turn.role, content: turn.content }));
      }
      messages.push({ role: "user", content: safeMessage });

      const response = await axios.post(
        `${OLLAMA_URL}/v1/chat/completions`,
        { model: safeModel, messages },
        { timeout: 30000 }
      );

      const chatbotReply = response.data?.choices?.[0]?.message?.content || "(aucune réponse Ollama)";
      session.context.push({ role: "assistant", content: chatbotReply });

      await db.collection('chats').add({
        message: safeMessage,
        reply: chatbotReply,
        model: safeModel,
        language: safeLanguage,
        timestamp: now
      });

      return res.json({ reply: chatbotReply });
    } catch (err) {
      console.error("❌ Ollama error:", err.message);
      return res.status(500).json({ error: "Ollama unreachable" });
    }

  } catch (error) {
    console.error("Erreur générale:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ---------- HISTORY route ----------
app.get('/history', async (req, res) => {
  try {
    const snapshot = await db.collection('chats').get();
    const chatHistory = snapshot.docs.map(doc => doc.data());
    res.json(chatHistory);
  } catch (error) {
    console.error("Erreur de récupération de l'historique:", error.message);
    res.status(500).json({ error: "Impossible de récupérer l'historique." });
  }
});

app.listen(port, () => {
  console.log(`🌐 Serveur en écoute sur http://localhost:${port}`);
});
