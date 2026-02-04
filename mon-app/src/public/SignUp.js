import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', confirmPassword: '', role: 'patient',
    dateNaissance: '', sexe: '', telephone: '', ville: '', etatCivil: '', profession: '', education: '',
    motif: '', stress: '', objectifs: '', humeur: '',
    historiqueMedical: '', medicaments: '', activitePhysique: '', sommeil: '', alimentation: '', loisirs: '', habitudesNumeriques: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validatePassword = password => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleSignUp = async e => {
    e.preventDefault();
    setError('');

    if (!validatePassword(formData.password)) {
      setError("Mot de passe : min 8 caractères, majuscule, minuscule, chiffre.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const userData = { ...formData };
      delete userData.confirmPassword;
      Object.keys(userData).forEach(k => { if (!userData[k]) delete userData[k]; });

      await setDoc(doc(db, "users", user.uid), userData);
      alert('Compte créé avec succès !');
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  const requiredFields = [
    { label: 'Nom', name: 'nom', type: 'text', placeholder: 'Ex: Dupont' },
    { label: 'Prénom', name: 'prenom', type: 'text', placeholder: 'Ex: Jean' },
    { label: 'Date de naissance', name: 'dateNaissance', type: 'date' },
    { label: 'Sexe', name: 'sexe', type: 'select', options: ['Homme', 'Femme', 'Autre'] },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'Ex: email@exemple.com' },
    { label: 'Mot de passe', name: 'password', type: 'password', placeholder: '********' },
    { label: 'Confirmer mot de passe', name: 'confirmPassword', type: 'password', placeholder: '********' },
    { label: 'Téléphone', name: 'telephone', type: 'tel', placeholder: 'Ex: 12345678' },
    { label: 'Ville', name: 'ville', type: 'text', placeholder: 'Ex: Paris' },
    { label: 'État civil', name: 'etatCivil', type: 'select', options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'] },
    { label: 'Profession', name: 'profession', type: 'text', placeholder: 'Ex: Ingénieur' },
    { label: 'Niveau d’études', name: 'education', type: 'select', options: ['Primaire', 'Secondaire', 'Universitaire', 'Autre'] },
    { label: 'Motif de consultation', name: 'motif', type: 'textarea', placeholder: 'Ex: stress, anxiété...' },
    { label: 'Niveau de stress (1-10)', name: 'stress', type: 'number', placeholder: 'Ex: 5', min: 1, max: 10 },
    { label: 'Objectifs de la thérapie', name: 'objectifs', type: 'textarea', placeholder: 'Ex: apprendre à gérer mes émotions...' },
    { label: 'État émotionnel / Humeur', name: 'humeur', type: 'text', placeholder: 'Ex: stressé, joyeux...' },
  ];

  const optionalFields = [
    { label: 'Historique médical / psychologique', name: 'historiqueMedical', type: 'textarea', placeholder: 'Ex: antécédents médicaux...' },
    { label: 'Médicaments / suivi médical', name: 'medicaments', type: 'textarea', placeholder: 'Ex: nom, dosage...' },
    { label: 'Activité physique / sport', name: 'activitePhysique', type: 'text', placeholder: 'Ex: course, natation...' },
    { label: 'Sommeil', name: 'sommeil', type: 'text', placeholder: 'Ex: 7h, sommeil léger...' },
    { label: 'Alimentation / régime', name: 'alimentation', type: 'text', placeholder: 'Ex: équilibré, végétarien...' },
    { label: 'Loisirs', name: 'loisirs', type: 'text', placeholder: 'Ex: lecture, musique...' },
    { label: 'Habitudes numériques', name: 'habitudesNumeriques', type: 'text', placeholder: 'Ex: 3h/jour réseaux sociaux...' },
  ];

  const renderField = ({ label, name, type, placeholder, options, min, max }) => {
    if (type === 'select') {
      return (
        <div style={styles.formGroup} key={name}>
          <label style={styles.label}>{label}</label>
          <select name={name} value={formData[name]} onChange={handleChange} required style={styles.input}>
            <option value="">-- Choisir --</option>
            {options.map(opt => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
          </select>
        </div>
      );
    } else if (type === 'textarea') {
      return (
        <div style={styles.formGroup} key={name}>
          <label style={styles.label}>{label}</label>
          <textarea name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} required style={styles.textarea} />
        </div>
      );
    } else {
      return (
        <div style={styles.formGroup} key={name}>
          <label style={styles.label}>{label}</label>
          <input type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} min={min} max={max} required style={styles.input} />
        </div>
      );
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inscription Patient</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSignUp}>
          {requiredFields.map(renderField)}
          <h4 style={{ marginTop: '1rem', color: '#555' }}>Champs optionnels</h4>
          {optionalFields.map(renderField)}
          <button type="submit" style={styles.button}>S'inscrire</button>
        </form>

        <p style={styles.linkText}>
          Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4f8,#d9e2ec)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: '1rem' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%', overflowY: 'auto', maxHeight: '90vh' },
  title: { fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center', color: '#2b2d42' },
  error: { color: 'red', textAlign: 'center', marginBottom: '1rem' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '.5rem', fontWeight: 500 },
  input: { width: '100%', padding: '.75rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', transition: 'all 0.3s' },
  textarea: { width: '100%', padding: '.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', fontSize: '1rem' },
  button: { width: '100%', padding: '.75rem', borderRadius: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', transition: 'background-color 0.3s' },
  linkText: { marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem' },
  link: { color: '#007bff', fontWeight: 500, textDecoration: 'none' },
};

export default SignUp;
