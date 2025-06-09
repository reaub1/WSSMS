const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  user: 'sa',
  password: 'YourStrong!Passw0rd',
  server: 'sqlserver', 
  database: 'master', 
  options: {
    encrypt: false, 
    trustServerCertificate: true,
  }
};

app.get('/api/test-connection', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    res.json({ success: true, message: '✅ Connexion à la base de données réussie !' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Échec de la connexion à la base de données.',
      error: error.message
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.get('/api/data', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM Users`;
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Erreur lors de la récupération des données.',
      error: error.message
    });
  } finally {
    sql.close();
  }
});

app.post('/api/connect', async (req, res) => {
  const { username, password } = req.body;

  console.log('Tentative de connexion avec les identifiants:', { username, password });

  const config = {
    user: username,
    password: password,
    server: dbConfig.server,
    database: dbConfig.database,
    options: {
      encrypt: true,
      trustServerCertificate: true 
    }
  };

  try {
    await sql.connect(config);
    console.log('Connexion réussie à la base de données SQL Server');
    res.json({ success: true, message: 'Connecté à la base de données SQL Server' });
  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err);
    res.status(500).json({ success: false, message: 'Erreur de connexion à la base de données.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré : http://localhost:${port}`);
});

app.get('/api/tables', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
    res.json({ success: true, tables: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
    res.status(500).json({
      success: false,
      message: '❌ Erreur lors de la récupération des tables.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exécution de la requête.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.post('/api/save-query', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: 'La requête est vide.' });
  }

  try {
    await sql.connect(dbConfig);
    await sql.query`INSERT INTO SavedQueries (query) VALUES (${query})`;
    res.json({ success: true, message: 'Requête sauvegardée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la requête:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde de la requête.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.get('/api/saved-queries', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT TOP 5 id, query, created_at FROM SavedQueries ORDER BY created_at DESC`;
    res.json({ success: true, queries: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération des requêtes sauvegardées:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des requêtes sauvegardées.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.delete('/api/saved-queries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await sql.connect(dbConfig);
    await sql.query`DELETE FROM SavedQueries WHERE id = ${id}`;
    res.json({ success: true, message: 'Requête supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la requête:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la requête.',
      error: error.message,
    });
  }
});

app.post('/api/sql-users', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Nom d\'utilisateur et mot de passe requis.' });
  }

  try {
    await sql.connect(dbConfig);

    const createLoginQuery = `CREATE LOGIN [${username}] WITH PASSWORD = '${password}'`;
    const createUserQuery = `CREATE USER [${username}] FOR LOGIN [${username}]`;

    await sql.query(createLoginQuery);
    await sql.query(createUserQuery);

    res.json({ success: true, message: 'Utilisateur SQL ajouté avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'utilisateur SQL.',
      error: error.message,
    });
  }
});