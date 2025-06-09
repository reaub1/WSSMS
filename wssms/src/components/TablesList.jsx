import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QueryExecutor from './QueryExecutor';
import SavedQueries from './SavedQueries';
import AddUserForm from './AddUserForm';
import Login from './LoginForms';

const TablesList = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryToExecute, setQueryToExecute] = useState(null);
  const [isSavedQuery, setIsSavedQuery] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tables');
        if (response.data.success) {
          setTables(response.data.tables);
        } else {
          setError(response.data.message || 'Erreur lors de la récupération des tables.');
        }
      } catch (err) {
        setError('Erreur serveur : impossible de récupérer les tables.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/disconnect');
      setIsLoggedIn(false);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      alert('Erreur lors de la déconnexion. Veuillez réessayer.');
    }
  };

  if (!isLoggedIn) {
    return <Login />;
  }

  if (loading) {
    return <p>Chargement des tables...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (queryToExecute) {
    return (
      <QueryExecutor
        tableName={isSavedQuery ? null : selectedTable}
        query={queryToExecute}
        onBack={() => {
          setQueryToExecute(null);
          setIsSavedQuery(false);
        }}
      />
    );
  }

  if (showAddUserForm) {
    return <AddUserForm onClose={() => setShowAddUserForm(false)} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Liste des Tables</h2>
        <button
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </div>
      <button
        style={styles.addUserButton}
        onClick={() => setShowAddUserForm(true)}
      >
        Ajouter un Utilisateur SQL
      </button>
      <ul style={styles.list}>
        {tables.map((table, index) => (
          <li key={index} style={styles.listItem}>
            {table.TABLE_NAME}
            <button
              style={styles.button}
              onClick={() => {
                setSelectedTable(table.TABLE_NAME);
                setQueryToExecute(`SELECT * FROM ${table.TABLE_NAME}`);
                setIsSavedQuery(false);
              }}
            >
              Exécuter des requêtes
            </button>
          </li>
        ))}
      </ul>
      <SavedQueries
        onExecute={(query) => {
          setQueryToExecute(query);
          setSelectedTable(null);
          setIsSavedQuery(true);
        }}
      />
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
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
  button: {
    padding: '0.3rem 0.6rem',
    backgroundColor: '#0078d4',
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
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default TablesList;