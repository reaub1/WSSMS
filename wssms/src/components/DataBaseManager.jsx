import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TablesList from './TablesList';

const DatabaseManager = () => {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [creationError, setCreationError] = useState('');

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

  const handleCreateDatabase = async () => {
    if (!newDatabaseName.trim()) {
      setCreationError('Le nom de la base de données est requis.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3001/api/create-databases', {
        databaseName: newDatabaseName,
      });
  
      if (response.data.success) {
        setDatabases([...databases, { name: newDatabaseName }]);
        setNewDatabaseName('');
        setCreationError('');
        alert('Base de données créée avec succès.');
      } else {
        setCreationError(response.data.message || 'Erreur lors de la création de la base de données.');
      }
    } catch (err) {
      setCreationError('Erreur serveur : impossible de créer la base de données.');
    }
  };

  if (selectedDatabase) {
    return <TablesList database={selectedDatabase} />;
  }

  if (loading) {
    return <p>Chargement des bases de données...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bases de Données Disponibles</h2>
      <div style={styles.creationSection}>
        <h3>Créer une nouvelle base de données</h3>
        <input
          type="text"
          placeholder="Nom de la base de données"
          value={newDatabaseName}
          onChange={(e) => setNewDatabaseName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreateDatabase} style={styles.button}>
          Créer
        </button>
        {creationError && <p style={{ color: 'red' }}>{creationError}</p>}
      </div>

      <ul style={styles.list}>
        {databases.map((db, index) => (
          <li key={index} style={styles.listItem}>
            {db.name}
            <button
              style={styles.button}
              onClick={() => setSelectedDatabase(db.name)}
            >
              Ouvrir
            </button>
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
  creationSection: {
    marginBottom: '2rem',
  },
  input: {
    marginBottom: '1rem',
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#1e1e2f',
    color: '#fff',
    width: '100%',
  },
  button: {
    padding: '0.3rem 0.6rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '0.5rem',
    borderBottom: '1px solid #444',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

export default DatabaseManager;