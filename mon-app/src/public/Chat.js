// src/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import './../Chat.css';
import { db } from './../firebaseConfig';
import {
  collection, addDoc, query, where, serverTimestamp, orderBy,
  onSnapshot, updateDoc, doc, getDocs, getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const logo = '/images/Logo.png';
const DAILY_LIMIT_MINUTES = 30; // Limite quotidienne en minutes

function Chat() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemma3:1b');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [micStatus, setMicStatus] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [localSessions, setLocalSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [usedToday, setUsedToday] = useState(0); // compteur du temps utilisé
  const mountedRef = useRef(true);

  const navigate = useNavigate();

  const translations = {
    fr: { newChat: '+ Nouvelle discussion', chatTitle: 'PsyBot', placeholder: 'Envoyer un message...', send: 'Envoyer', micReady: 'Parlez maintenant 🎤', loadingModel: 'Chargement...', errorNoResponse: 'Erreur : aucune réponse.', errorConnection: 'Erreur de connexion.', model: 'Modèle', language: 'Langue', theme: 'Thème', history: 'Conversations', sources: 'Sources', dailyLimitReached: 'Limite quotidienne atteinte !' },
    en: { newChat: '+ New Chat', chatTitle: 'PsyBot', placeholder: 'Send a message...', send: 'Send', micReady: 'Speak now 🎤', loadingModel: 'Loading...', errorNoResponse: 'Error: No response.', errorConnection: 'Connection error.', model: 'Model', language: 'Language', theme: 'Theme', history: 'Conversations', sources: 'Sources', dailyLimitReached: 'Daily limit reached!' },
    ar: { newChat: '+ محادثة جديدة', chatTitle: 'PsyBot', placeholder: 'أرسل رسالة...', send: 'إرسال', micReady: 'تحدث الآن 🎤', loadingModel: 'يتم التحميل...', errorNoResponse: 'خطأ: لا يوجد رد.', errorConnection: 'خطأ في الاتصال.', model: 'النموذج', language: 'اللغة', theme: 'المظهر', history: 'المحادثات', sources: 'المصادر', dailyLimitReached: 'تم الوصول للحد اليومي!' },
  };
  const t = translations[selectedLanguage];

  // -------------------- Auth state --------------------
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setEmail(currentUser?.email || '');
      if (!currentUser) navigate('/login');
      setAuthChecked(true);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---------- localStorage boot (user-scoped) ----------
  useEffect(() => {
    if (!email) return;
    const userKey = `localSessions_${email}`;
    try {
      const saved = JSON.parse(localStorage.getItem(userKey) || '[]');
      setLocalSessions(saved);

      const savedSessionId = localStorage.getItem(`currentSessionId_${email}`);
      if (savedSessionId) {
        setCurrentSessionId(savedSessionId);
        const found = saved.find(s => s.id === savedSessionId);
        if (found) setChatHistory(found.history || []);
      }
    } catch (e) {
      console.error('localStorage load error', e);
    }
  }, [email]);

  const persistLocalSessions = (arr) => {
    setLocalSessions(arr);
    if (!email) return;
    localStorage.setItem(`localSessions_${email}`, JSON.stringify(arr));
  };

  const saveLocalHistory = (sessionId, history) => {
    if (!email) return;
    const userKey = `localSessions_${email}`;
    let arr = JSON.parse(localStorage.getItem(userKey) || '[]');
    const idx = arr.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      arr[idx].history = history;
      const firstUserMsg = (history.find(h => h.sender === 'user')?.message) || '';
      if ((!arr[idx].title || arr[idx].title === '') && firstUserMsg) {
        arr[idx].title = firstUserMsg.slice(0, 40) + (firstUserMsg.length > 40 ? '...' : '');
      }
    } else {
      const firstUserMsg = (history.find(h => h.sender === 'user')?.message) || '';
      const title = firstUserMsg ? firstUserMsg.slice(0, 40) + (firstUserMsg.length > 40 ? '...' : '') : '';
      arr.unshift({ id: sessionId, title, history });
    }
    persistLocalSessions(arr);
  };

  // ---------- Check daily limit ----------
  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    let totalTime = 0;

    localSessions.forEach(s => {
      if (!s.startTime) return;
      if (s.startTime >= startOfDay) {
        const duration = s.history ? s.history.length : 0; // approx 1 min par message
        totalTime += duration;
      }
    });

    setUsedToday(totalTime);
  }, [localSessions]);

  const canStartNewSession = () => usedToday < DAILY_LIMIT_MINUTES;

  // ---------- Create new session ----------
  const startNewSession = async () => {
    if (!canStartNewSession()) {
      alert(t.dailyLimitReached);
      return null;
    }

    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        email,
        createdAt: serverTimestamp(),
        title: ''
      });
      const sid = docRef.id;
      localStorage.setItem(`currentSessionId_${email}`, sid);
      setCurrentSessionId(sid);
      setChatHistory([]);
      saveLocalHistory(sid, []);
      return sid;
    } catch (err) {
      console.error('startNewSession error', err);
      throw err;
    }
  };

  // ---------- Send message ----------
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    const text = userMessage.trim();
    setUserMessage('');

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await startNewSession();
    }

    const updatedHistory = [...chatHistory, { message: text, sender: 'user' }];
    setChatHistory(updatedHistory);
    saveLocalHistory(sessionId, updatedHistory);

    let messageDocRefId = null;
    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        email,
        question: text,
        reponse: '',
        citations: [],
        sessionId,
        timestamp: serverTimestamp()
      });
      messageDocRefId = docRef.id;

      const sessionRef = doc(db, 'sessions', sessionId);
      const snap = await getDoc(sessionRef);
      if (snap.exists()) {
        const data = snap.data();
        const firstMsg = updatedHistory.find(h => h.sender === 'user')?.message || '';
        if ((!data.title || data.title === '') && firstMsg) {
          const short = firstMsg.slice(0, 40) + (firstMsg.length > 40 ? '...' : '');
          await updateDoc(sessionRef, { title: short, lastUpdated: serverTimestamp() });

          let local = JSON.parse(localStorage.getItem(`localSessions_${email}`) || '[]');
          const idx = local.findIndex(s => s.id === sessionId);
          if (idx >= 0) { local[idx].title = short; persistLocalSessions(local); }
        }
      }
    } catch (err) {
      console.error('save user message to firestore failed', err);
    }

    try {
      const provider = (selectedModel === 'hmrag') ? 'hmrag' : 'other';
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model: selectedModel,
          message: text,
          history: updatedHistory.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.message })),
          params: { language: selectedLanguage }
        })
      });

      const data = await res.json();
      const reply = data.reply || t.errorNoResponse;
      const citations = Array.isArray(data.citations) ? data.citations : [];

      const newHistory = [...updatedHistory, { message: reply, sender: 'bot', citations }];
      setChatHistory(newHistory);
      saveLocalHistory(sessionId, newHistory);

      if (messageDocRefId) {
        try { await updateDoc(doc(db, 'messages', messageDocRefId), { reponse: reply, citations }); } 
        catch (e) { console.warn('update message doc with reply failed', e); }
      }
    } catch (err) {
      const newHistory = [...updatedHistory, { message: t.errorConnection, sender: 'bot' }];
      setChatHistory(newHistory);
      saveLocalHistory(sessionId, newHistory);
      console.error('call backend failed', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startListening = async () => {
    setMicStatus(t.loadingModel);
    try {
      const response = await fetch(`${BACKEND_URL}/speech-to-text`, { method: 'POST' });
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.trim().split('\n').forEach((line) => {
          try {
            const data = JSON.parse(line);
            if (data.status === 'ready') setMicStatus(t.micReady);
            if (data.text) setUserMessage(prev => (prev ? `${prev} ${data.text}` : data.text));
          } catch { }
        });
      }
    } catch { setMicStatus(''); }
  };

  return (
    <div id="app-container" data-theme={darkMode ? 'dark' : 'light'}>
      <div id="sidebar">
        <div className="top-controls">
          <FiSettings className="settings-icon" onClick={() => setShowSettings(!showSettings)} size={24} />
          <button
            className="action-button"
            onClick={startNewSession}
            disabled={!canStartNewSession()}
            title={!canStartNewSession() ? t.dailyLimitReached : ''}
          >
            {t.newChat}
          </button>
        </div>

        {/* ---------- Daily limit counter ---------- */}
        <div className="daily-limit-status">
          {usedToday >= DAILY_LIMIT_MINUTES
            ? `✅ ${t.dailyLimitReached} (${DAILY_LIMIT_MINUTES} min)`
            : `Temps utilisé aujourd'hui: ${usedToday} / ${DAILY_LIMIT_MINUTES} min`}
        </div>

        <div className="history-list">
          <h4>{t.history}</h4>
          {localSessions.map((ls) => (
            <button key={ls.id} className={`history-button ${ls.id === currentSessionId ? 'active' : ''}`} onClick={() => {
              setCurrentSessionId(ls.id);
              localStorage.setItem(`currentSessionId_${email}`, ls.id);
              setChatHistory(ls.history || []);
            }}>{ls.title || 'Conversation'}</button>
          ))}
          {sessions.map((s) => {
            const existsLocal = localSessions.some(ls => ls.id === s.id);
            if (existsLocal) return null;
            return (
              <button key={s.id} className={`history-button ${s.id === currentSessionId ? 'active' : ''}`} onClick={() => {
                setCurrentSessionId(s.id);
                localStorage.setItem(`currentSessionId_${email}`, s.id);
              }}>{s.title || 'Conversation'}</button>
            );
          })}
        </div>

        {showSettings && (
          <div className="settings-panel">
            <label>{t.model}</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              <option value="hmrag">HM-RAG</option>
              <option value="gemma3:1b">Gemma 3:1b</option>
              <option value="llama3.1:latest">LLaMA 3.1</option>
              <option value="qwen2.5:latest">Qwen 2.5</option>
              <option value="deepseek-r1:7b">DeepSeek R1</option>
              <option value="mistral:latest">Mistral</option>
            </select>

            <label>{t.language}</label>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">عربي</option>
            </select>

            <label>{t.theme}</label>
            <select value={darkMode ? 'dark' : 'light'} onChange={(e) => setDarkMode(e.target.value === 'dark')}>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
        )}
      </div>

      <div id="chat-container">
        {chatHistory.length === 0 ? (
          <div className="empty-chat">
            <img src={logo} alt="Site Logo" className="logo-center" />
            <h1>{t.chatTitle}</h1>
          </div>
        ) : (
          <div id="chatbox">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`chat-message ${chat.sender}-message`}>
                <div className="message-text">{chat.message}</div>
                {chat.sender === 'bot' && Array.isArray(chat.citations) && chat.citations.length > 0 && (
                  <div className="citations">
                    <div className="citations-title">{t.sources}:</div>
                    {chat.citations.map((c, i) => (
                      <div key={i} className="citation-item">
                        <small>[{i + 1}] {typeof c.score === 'number' ? c.score.toFixed(3) : c.score} – {c.snippet}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mic-status">{micStatus}</div>

        <div className="input-row">
          <input type="text" value={userMessage} placeholder={t.placeholder} onChange={(e) => setUserMessage(e.target.value)} onKeyDown={handleKeyDown} aria-label="Message input"/>
          <button onClick={sendMessage} className="round-button" title={t.send}>📤</button>
          <button onClick={startListening} className="round-button">🎤</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
