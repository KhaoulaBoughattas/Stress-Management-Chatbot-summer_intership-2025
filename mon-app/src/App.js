import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './public/Login';
import SignUp from './public/SignUp';
import Home from './public/Home';
import Chat from './public/Chat';
import Hopital from './public/Hopital';
import Form from './public/Form';
import HistoryPage from './public/HistoryPage';
import MedecinPage from './public/MedecinPage';
import Dashboard from './public/Dashboard';
import Profile from './public/Profile';   // ✅ Ajouter le profil
import Help from './public/Help';         // ✅ Ajouter la page d'aide

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/medecin" element={<MedecinPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/chat" element={<Chat />} />
        <Route path="/hopital" element={<Hopital />} />
        <Route path="/eval" element={<Form />} />
        <Route path="/historique" element={<HistoryPage />} />

        {/* ✅ Nouvelles routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Router>
  );
};

export default App;
