import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebaseConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role;

        localStorage.setItem('user', JSON.stringify(userData));

        if (userRole === 'patient') {
          navigate('/chat');
        } else if (userRole === 'medecin') {
          navigate('/hopital');
        }
      } else {
        setError('Utilisateur non trouvé dans la base de données.');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez vérifier vos informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Se connecter</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={loading ? styles.buttonDisabled : styles.button} disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.linkText}>
          Pas encore de compte ? <Link to="/signup" style={styles.link}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

// Styles CSS-in-JS
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontWeight: 600,
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#2b2d42',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '.5rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '.75rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '.75rem',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonDisabled: {
    width: '100%',
    padding: '.75rem',
    borderRadius: '8px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
  linkText: {
    marginTop: '1rem',
    textAlign: 'center',
    fontSize: '0.95rem',
  },
  link: {
    color: '#007bff',
    fontWeight: '500',
    textDecoration: 'none',
  }
};

export default Login;
