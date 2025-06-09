import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SavedQueries = ({ onExecute }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedQueries = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/saved-queries');
        if (response.data.success) {
          setQueries(response.data.queries);
        } else {
          setError(response.data.message || 'Erreur lors de la récupération des requêtes sauvegardées.');
        }
      } catch (err) {
        setError('Erreur serveur : impossible de récupérer les requêtes sauvegardées.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedQueries();
  }, []);

  const handleDelete = async (queryId) => {
    try {
      await axios.delete(`http://localhost:3001/api/saved-queries/${queryId}`);
      setQueries(queries.filter((query) => query.id !== queryId)); 
    } catch (err) {
      alert('Erreur lors de la suppression de la requête.');
    }
  };

  if (loading) {
    return <p>Chargement des requêtes sauvegardées...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Requêtes Sauvegardées</h2>
      <ul style={styles.list}>
        {queries.map((query, index) => (
          <li key={index} style={styles.listItem}>
            <span style={styles.query}>{query.query}</span>
            <button
              style={styles.button}
              onClick={() => onExecute(query.query)}
            >
              Exécuter
            </button>
            <button
              style={styles.deleteButton}
              onClick={() => handleDelete(query.id)}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
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
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '0.5rem',
    borderBottom: '1px solid #444',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  query: {
    flex: 1,
    marginRight: '1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  button: {
    padding: '0.3rem 0.6rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  deleteButton: {
    padding: '0.3rem 0.6rem',
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SavedQueries;