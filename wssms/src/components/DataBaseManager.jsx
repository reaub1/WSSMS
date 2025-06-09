import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabaseManager = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/databases');
        if (response.data.success) {
          setDatabases(response.data.databases);
        } else {
          setError(response.data.message || 'Erreur lors de la récupération des bases de données.');
        }
      } catch (err) {
        setError('Erreur serveur : impossible de récupérer les bases de données.');
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  if (loading) {
    return <p>Chargement des bases de données...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bases de Données Disponibles</h2>
      <ul style={styles.list}>
        {databases.map((db, index) => (
          <li key={index} style={styles.listItem}>
            {db.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#1e1e2f',
    color: '#fff',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    width: '400px',
    margin: '2rem auto',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '0.5rem',
    borderBottom: '1px solid #444',
    color: '#fff',
  },
};

export default DatabaseManager;