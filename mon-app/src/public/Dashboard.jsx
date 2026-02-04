// src/public/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import "./Dashboard.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

const Dashboard = () => {
  // Données globales
  const [users, setUsers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalEvaluations: 0,
    averageScore: 0,
  });

  // Données patient spécifique
  const [searchId, setSearchId] = useState("");
  const [patientData, setPatientData] = useState([]);
  const [patientStats, setPatientStats] = useState({
    totalEvaluations: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(false);

  // Charger données globales
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);

        const evalQuery = query(
          collection(db, "evaluations"),
          orderBy("date", "asc"),
          limit(100)
        );
        const evalSnapshot = await getDocs(evalQuery);
        const evalList = evalSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvaluations(evalList);

        const totalUsers = usersList.length;
        const totalEvaluations = evalSnapshot.size;
        const averageScore =
          evalList.reduce((sum, e) => sum + (e.score || 0), 0) /
          (evalList.length || 1);

        setGlobalStats({
          totalUsers,
          totalEvaluations,
          averageScore: averageScore.toFixed(2),
        });
      } catch (error) {
        console.error("Erreur chargement global :", error);
      }
    };
    fetchGlobalData();
  }, []);

  // Charger données patient spécifique
  const fetchPatientData = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      // On cherche dans la collection "users" si c'est un email ou un ID
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userFound = usersSnapshot.docs.find(doc => {
        const data = doc.data();
        return (
          doc.id.toLowerCase() === searchId.toLowerCase() ||
          (data.email && data.email.toLowerCase() === searchId.toLowerCase())
        );
      });

      if (!userFound) {
        setPatientData([]);
        setLoading(false);
        return;
      }

      const patientId = userFound.id;

      const evalQuery = query(
        collection(db, "evaluations"),
        where("userId", "==", patientId),
        orderBy("date", "asc"),
        limit(50)
      );
      const evalSnapshot = await getDocs(evalQuery);
      const evalList = evalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatientData(evalList);

      const totalEvaluations = evalList.length;
      const averageScore =
        evalList.reduce((sum, e) => sum + (e.score || 0), 0) /
        (evalList.length || 1);

      setPatientStats({
        totalEvaluations,
        averageScore: averageScore.toFixed(2),
      });
    } catch (error) {
      console.error("Erreur chargement patient :", error);
    }
    setLoading(false);
  };

  // Données pour graphiques globaux
  const globalScoresData = evaluations.map(e => ({
    date: e.date?.seconds
      ? new Date(e.date.seconds * 1000).toLocaleDateString()
      : "-",
    score: e.score || 0,
  }));

  const pieData = Object.values(
    evaluations.reduce((acc, e) => {
      const user = e.userId || "Inconnu";
      if (!acc[user]) acc[user] = { name: user, value: 0 };
      acc[user].value += 1;
      return acc;
    }, {})
  );

  return (
    <div className="dashboard-container">
      {/* ===== GLOBAL ===== */}
      <h1>Tableau de Bord Global</h1>
      <div className="stats-grid">
        <div className="stat-card"><h3>Utilisateurs</h3><p>{globalStats.totalUsers}</p></div>
        <div className="stat-card"><h3>Évaluations</h3><p>{globalStats.totalEvaluations}</p></div>
        <div className="stat-card"><h3>Score Moyen</h3><p>{globalStats.averageScore}</p></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Évolution des Scores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={globalScoresData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#007bff" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Répartition des Scores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={globalScoresData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Évaluations par Utilisateur</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Analyse Radar (Scores)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={globalScoresData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="date" />
              <PolarRadiusAxis />
              <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== PATIENT ===== */}
      <h1>Suivi d’un Patient</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Email ou ID du patient..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button onClick={fetchPatientData}>Rechercher</button>
      </div>

      {loading && <p>Chargement...</p>}
      {searchId && !loading && patientData.length === 0 && <p style={{ color: "red" }}>Aucune donnée trouvée.</p>}

      {patientData.length > 0 && (
        <>
          <div className="stats-grid">
            <div className="stat-card"><h3>Évaluations</h3><p>{patientStats.totalEvaluations}</p></div>
            <div className="stat-card"><h3>Score Moyen</h3><p>{patientStats.averageScore}</p></div>
          </div>

          <div className="chart-card">
            <h2>Évolution des Scores (Patient)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" tickFormatter={(date) => date?.seconds ? new Date(date.seconds * 1000).toLocaleDateString() : "-"} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#ff4d4f" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
