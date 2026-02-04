// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState({
    prenom: "",
    nom: "",
    email: "",
    photoURL: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, userData);
      alert("Profil mis à jour !");
      navigate("/home");
    } catch (err) {
      console.error("Erreur mise à jour :", err);
      alert("Erreur lors de la mise à jour du profil.");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Chargement...</p>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mon Profil</h2>

        {/* Affichage photo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {userData.photoURL ? (
            <img
              src={userData.photoURL}
              alt="Profil"
              style={styles.profileImage}
            />
          ) : (
            <div style={styles.placeholderImage}>
              {userData.prenom.charAt(0).toUpperCase()}{userData.nom.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Prénom</label>
          <input
            name="prenom"
            value={userData.prenom}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nom</label>
          <input
            name="nom"
            value={userData.nom}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            value={userData.email}
            disabled
            style={{ ...styles.input, backgroundColor: "#f0f0f0" }}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Photo URL</label>
          <input
            name="photoURL"
            value={userData.photoURL}
            onChange={handleChange}
            placeholder="Ex: https://..."
            style={styles.input}
          />
        </div>

        <button onClick={handleSave} style={styles.button}>Enregistrer</button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f4f8,#d9e2ec)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "1rem"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%"
  },
  title: {
    fontWeight: 600,
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#2b2d42"
  },
  formGroup: { marginBottom: "1rem" },
  label: { display: "block", marginBottom: ".5rem", fontWeight: 500 },
  input: {
    width: "100%",
    padding: ".75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    transition: "all 0.3s"
  },
  button: {
    width: "100%",
    padding: ".75rem",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "1rem",
    transition: "background-color 0.3s"
  },
  profileImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #007bff"
  },
  placeholderImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto"
  }
};

export default Profile;
