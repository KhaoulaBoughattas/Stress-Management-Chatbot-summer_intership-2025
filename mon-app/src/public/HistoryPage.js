// src/public/HistoryPage.js
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./history.css";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);

  // 🔹 Récupérer les scores
  const fetchScores = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "stai_scores"));
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(results);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des scores:", error);
    }
    setLoading(false);
  };

  // 🔹 Récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(results);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  useEffect(() => {
    fetchScores();
    fetchUsers();
  }, []);

  // 🔹 Fonction recherche
  const handleSearch = (email) => {
    const term = (email || searchTerm).trim().toLowerCase();
    if (term === "") {
      setFilteredHistory([]);
      return;
    }

    // 🔎 Filtrer sur l'email
    const results = history.filter((item) =>
      (item.email || "").toLowerCase().includes(term)
    );

    setFilteredHistory(results);
    setSearchTerm(email || searchTerm);
  };

  // 🔹 Choisir quelle data afficher
  const displayData =
    filteredHistory.length > 0 || searchTerm ? filteredHistory : history;

  return (
    <div className="history-page">
      <h1>📊 Historique des Scores STAI</h1>

      {/* 🔎 Barre de recherche */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher par email du patient"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={() => handleSearch()} className="search-button">
          Rechercher
        </button>
      </div>

      {/* 👥 Liste des utilisateurs */}
      <h2>👤 Liste des Patients</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr
              key={idx}
              style={{ cursor: "pointer" }}
              onClick={() => handleSearch(u.email)} // 🔹 clic → filtre scores
            >
              <td>{u.nom || "-"}</td>
              <td>{u.prenom || "-"}</td>
              <td>{u.email || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📌 Résultats des tests */}
      {loading ? (
        <p>⏳ Chargement...</p>
      ) : (
        <>
          {displayData.length === 0 && searchTerm !== "" ? (
            <p>❌ Aucun résultat trouvé pour "{searchTerm}"</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Avant / Après</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((scoreData, index) => (
                  <tr key={index}>
                    <td>
                      {scoreData.userFirstName || "-"}{" "}
                      {scoreData.userLastName || "-"}
                    </td>
                    <td>{scoreData.email || "-"}</td>
                    <td>{scoreData.score || "-"}</td>
                    <td>
                      {scoreData.avant_apres === "avant" ? "Avant" : "Après"}
                    </td>
                    <td>
                      {scoreData.timestamp
                        ? new Date(
                            scoreData.timestamp.seconds * 1000
                          ).toLocaleDateString("fr-FR")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <button
        className="back-button"
        onClick={() => (window.location.href = "/home")}
      >
        ⬅ Retour à l'Accueil
      </button>
    </div>
  );
}
