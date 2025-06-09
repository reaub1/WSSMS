import React, { useState } from 'react';
import axios from 'axios';

const QueryExecutor = ({ query: initialQuery, tableName, onBack }) => {
  const [query, setQuery] = useState(
    initialQuery || (tableName ? `SELECT * FROM ${tableName}` : '')
  );
  const [queryType, setQueryType] = useState('SELECT');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleQueryTypeChange = (type) => {
    setQueryType(type);
    switch (type) {
      case 'SELECT':
        setQuery(`SELECT * FROM ${tableName || 'table_name'}`);
        break;
      case 'UPDATE':
        setQuery(`UPDATE ${tableName || 'table_name'} SET column_name = value WHERE condition`);
        break;
      case 'INSERT':
        setQuery(`INSERT INTO ${tableName || 'table_name'} (column1, column2) VALUES (value1, value2)`);
        break;
      case 'DELETE':
        setQuery(`DELETE FROM ${tableName || 'table_name'} WHERE condition`);
        break;
      default:
        setQuery('');
    }
  };

  const handleExecute = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/query', { query });
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message || 'Erreur lors de l\'exécution de la requête.');
      }
    } catch (err) {
      setError('Erreur serveur : impossible d\'exécuter la requête.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveMessage('');
    try {
      const response = await axios.post('http://localhost:3001/api/save-query', { query });
      if (response.data.success) {
        setSaveMessage('Requête sauvegardée avec succès.');
      } else {
        setSaveMessage('Erreur lors de la sauvegarde de la requête.');
      }
    } catch (err) {
      setSaveMessage('Erreur serveur : impossible de sauvegarder la requête.');
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ⬅ Retour
      </button>
      <h2 style={styles.title}>
        {tableName ? `Exécuter une Requête sur ${tableName}` : 'Exécuter une Requête'}
      </h2>
      <div style={styles.queryTypeContainer}>
        <label htmlFor="queryType" style={styles.label}>Type de Requête :</label>
        <select
          id="queryType"
          value={queryType}
          onChange={(e) => handleQueryTypeChange(e.target.value)}
          style={styles.select}
        >
          <option value="SELECT">SELECT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="INSERT">INSERT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Écrivez votre requête SQL ici..."
        style={styles.textarea}
      />
      <div style={styles.buttonContainer}>
        <button onClick={handleSave} style={styles.saveButton}>
          Sauvegarder
        </button>
        <button onClick={handleExecute} style={styles.button} disabled={loading}>
          {loading ? 'Exécution...' : 'Exécuter'}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
      {results.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              {Object.keys(results[0]).map((key) => (
                <th key={key} style={styles.th}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i} style={styles.td}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
  backButton: {
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  queryTypeContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  label: {
    marginRight: '0.5rem',
    color: '#fff',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#1e1e2f',
    color: '#fff',
  },
  textarea: {
    width: '100%',
    height: '100px',
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
    padding: '0.6rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.6rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
    textAlign: 'center',
  },
  saveMessage: {
    color: 'green',
    marginTop: '1rem',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    marginTop: '1rem',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #444',
    padding: '0.5rem',
    textAlign: 'left',
    backgroundColor: '#2a2a40',
  },
  td: {
    border: '1px solid #444',
    padding: '0.5rem',
    textAlign: 'left',
  },
};

export default QueryExecutor;