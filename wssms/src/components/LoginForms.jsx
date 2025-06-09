import React, { useState } from 'react';
import axios from 'axios';
import TablesList from './TablesList';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      console.log('Tentative de connexion avec les identifiants:', credentials);
      const response = await axios.post('http://localhost:3001/api/connect', credentials);
      if (response.data.success) {
        alert('Connexion réussie !');
        console.log('Réponse du serveur:', response.data);
        setIsLoggedIn(true);
      } else {
        setErrorMsg(response.data.message || 'Erreur de connexion.');
      }
    } catch (err) {
      setErrorMsg('Erreur serveur : impossible de se connecter.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return <TablesList />;
  }

  return (
    <div className="login-container" style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Connexion à WSSMS</h2>
        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={credentials.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={credentials.password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1e1e2f',
    color: '#fff',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#2a2a40',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  input: {
    marginBottom: '1rem',
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#1e1e2f',
    color: '#fff',
  },
  button: {
    padding: '0.6rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default Login;