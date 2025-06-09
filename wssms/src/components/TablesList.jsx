import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QueryExecutor from './QueryExecutor';

const TablesList = ({ database, onBack }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryToExecute, setQueryToExecute] = useState(null);
  const [isSavedQuery, setIsSavedQuery] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      if (!database) {
        setError('Le nom de la base de données est requis.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/tables?database=${database}`);
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
  }, [database]);

  if (loading) {
    return <p>Chargement des données...</p>;
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Liste des Tables</h2>
        <button
          style={styles.backButton}
          onClick={onBack}
        >
          Retour
        </button>
      </div>
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
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default TablesList;