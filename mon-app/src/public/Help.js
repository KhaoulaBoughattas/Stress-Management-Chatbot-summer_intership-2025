// src/public/Help.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Comment puis-je modifier mon profil ?",
      answer: "Cliquez sur votre avatar en haut à droite puis sur 'Paramètres'."
    },
    {
      question: "Comment puis-je évaluer mon état ?",
      answer: "Cliquez sur 'Évaluer mon état' dans la barre de navigation après connexion."
    },
    {
      question: "Comment puis-je contacter un professionnel ?",
      answer: "Allez dans la section 'Hopital' pour trouver les contacts des médecins disponibles."
    },
    {
      question: "Comment changer la langue de l'application ?",
      answer: "Utilisez le sélecteur de langue dans la barre de navigation."
    }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Aide & FAQ</h2>

        {faqs.map((faq, index) => (
          <div key={index} style={styles.faqItem}>
            <h4 style={styles.question}>{faq.question}</h4>
            <p style={styles.answer}>{faq.answer}</p>
          </div>
        ))}

        <button style={styles.button} onClick={() => navigate("/home")}>
          Retour à l'accueil
        </button>
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
    maxWidth: "600px",
    width: "100%",
    overflowY: "auto",
    maxHeight: "90vh"
  },
  title: { fontWeight: 600, marginBottom: "1.5rem", textAlign: "center", color: "#2b2d42" },
  faqItem: { marginBottom: "1rem" },
  question: { fontWeight: 500, color: "#007bff" },
  answer: { marginLeft: "0.5rem", color: "#333" },
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
  }
};

export default Help;
