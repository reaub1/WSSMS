import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TablesList from './TablesList';
import AddUserForm from './AddUserForm';

const DatabaseManager = () => {
  const [databases, setDatabases] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [creationError, setCreationError] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

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

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/sql-users');
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          setError(response.data.message || 'Erreur lors de la récupération des utilisateurs SQL.');
        }
      } catch (err) {
        setError('Erreur serveur : impossible de récupérer les utilisateurs SQL.');
      }
    };

    fetchDatabases();
    fetchUsers();
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

  const handleDeleteUser = async (username) => {
    try {
      await axios.delete(`http://localhost:3001/api/sql-users/${username}`);
      setUsers(users.filter((user) => user.name !== username));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur SQL:', err);
      alert('Erreur lors de la suppression de l\'utilisateur SQL.');
    }
  };

  if (selectedDatabase) {
    return <TablesList database={selectedDatabase} />;
  }

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={styles.container}>
      {/* Section Bases de Données */}
      <div style={styles.section}>
        <h2 style={styles.title}>Bases de Données</h2>
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

      {/* Section Utilisateurs SQL */}
      <div style={styles.section}>
        <h2 style={styles.title}>Utilisateurs SQL</h2>
        <button
          style={styles.addUserButton}
          onClick={() => setShowAddUserForm(true)}
        >
          Ajouter un Utilisateur SQL
        </button>
        <ul style={styles.list}>
          {users.map((user, index) => (
            <li key={index} style={styles.listItem}>
              {user.name}
              <button
                style={styles.deleteButton}
                onClick={() => handleDeleteUser(user.name)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
        {showAddUserForm && <AddUserForm onClose={() => setShowAddUserForm(false)} />}
      </div>
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
    width: '600px',
    margin: '2rem auto',
  },
  section: {
    marginBottom: '2rem',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  creationSection: {
    marginBottom: '1rem',
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
  deleteButton: {
    padding: '0.3rem 0.6rem',
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  addUserButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
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
};

export default DatabaseManager;