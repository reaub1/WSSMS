import React, { useState } from 'react';
import axios from 'axios';

const AddUserForm = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/sql-users', {
        username,
        password,
      });

      if (response.data.success) {
        setMessage('Utilisateur SQL ajouté avec succès.');
        setUsername('');
        setPassword('');
      } else {
        setMessage(response.data.message || 'Erreur lors de l\'ajout de l\'utilisateur SQL.');
      }
    } catch (err) {
      setMessage('Erreur serveur : impossible d\'ajouter l\'utilisateur SQL.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ajouter un Utilisateur SQL</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.button}>
            Ajouter
          </button>
          <button type="button" onClick={onClose} style={styles.cancelButton}>
            Annuler
          </button>
        </div>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#1e1e2f',
    color: '#fff',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    width: '400px',
    margin: '1rem auto',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginBottom: '1rem',
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#1e1e2f',
    color: '#fff',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  message: {
    marginTop: '1rem',
    textAlign: 'center',
    color: '#fff',
  },
};

export default AddUserForm;