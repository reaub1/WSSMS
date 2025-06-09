const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

let dynamicDbConfig = null;

app.post('/api/connect', async (req, res) => {
  const { username, password } = req.body;

  console.log('Tentative de connexion avec les identifiants:', { username, password });

  const config = {
    user: username,
    password: password,
    server: 'sqlserver',
    database: 'master',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };

  try {
    await sql.connect(config);
    console.log('Connexion réussie à la base de données SQL Server');

    dynamicDbConfig = config;

    res.json({ success: true, message: 'Connecté à la base de données SQL Server' });

    sql.close();

  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err);

    res.status(500).json({ success: false, message: 'Erreur de connexion à la base de données.' });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.post('/api/disconnect', (req, res) => {
  console.log('Déconnexion de l\'utilisateur.');

  console.log('Configuration de la base de données:', dynamicDbConfig);

  dynamicDbConfig = null;

  console.log('Configuration après déco : ', dynamicDbConfig);

  res.json({ success: true, message: 'Déconnecté avec succès.' });
});

app.get('/api/tables', async (req, res) => {
  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    console.log('Configuration de la base de données:', dynamicDbConfig);
    await sql.connect(dynamicDbConfig);
    const result = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
    res.json({ success: true, tables: result.recordset });
    sql.close();
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

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }


  try {
    console.log('Configuration de la base de données:', dynamicDbConfig);
    await sql.connect(dynamicDbConfig);
    const result = await sql.query(query);
    res.json({ success: true, data: result.recordset });
    sql.close();
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

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    console.log('Configuration de la base de données:', dynamicDbConfig);
    await sql.connect(dynamicDbConfig);
    await sql.query`INSERT INTO SavedQueries (query) VALUES (${query})`;
    res.json({ success: true, message: 'Requête sauvegardée avec succès.' });
    sql.close();
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
  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    console.log('Configuration de la base de données:', dynamicDbConfig);
    await sql.connect(dynamicDbConfig);
    const result = await sql.query`SELECT TOP 5 id, query, created_at FROM SavedQueries ORDER BY created_at DESC`;
    res.json({ success: true, queries: result.recordset });
    sql.close();
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

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    console.log('Configuration de la base de données:', dynamicDbConfig);
    await sql.connect(dynamicDbConfig);
    await sql.query`DELETE FROM SavedQueries WHERE id = ${id}`;
    res.json({ success: true, message: 'Requête supprimée avec succès.' });
    sql.close();
  } catch (error) {
    console.error('Erreur lors de la suppression de la requête:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la requête.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.post('/api/sql-users', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Nom d\'utilisateur et mot de passe requis.' });
  }

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    console.log('Configuration de la base de données:', dynamicDbConfig);
    await sql.connect(dynamicDbConfig);

    const createLoginQuery = `CREATE LOGIN [${username}] WITH PASSWORD = '${password}'`;
    const createUserQuery = `CREATE USER [${username}] FOR LOGIN [${username}]`;

    await sql.query(createLoginQuery);
    await sql.query(createUserQuery);

    res.json({ success: true, message: 'Utilisateur SQL ajouté avec succès.' });
    sql.close();
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'utilisateur SQL.',
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré : http://localhost:${port}`);
});