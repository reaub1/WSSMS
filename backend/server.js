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
    database: 'tets',
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

app.get('/api/databases', async (req, res) => {
  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    await sql.connect(dynamicDbConfig);
    const result = await sql.query`SELECT name FROM sys.databases WHERE name NOT IN ('tempdb', 'model', 'msdb')`;
    res.json({ success: true, databases: result.recordset });
    sql.close();
  } catch (error) {
    console.error('Erreur lors de la récupération des bases de données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des bases de données.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.post('/api/create-databases', async (req, res) => {
  const { databaseName } = req.body;

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  if (!databaseName || databaseName.trim() === '') {
    return res.status(400).json({ success: false, message: 'Le nom de la base de données est requis.' });
  }

  try {
    await sql.connect(dynamicDbConfig);

    const dbExists = await sql.query`SELECT name FROM sys.databases WHERE name = ${databaseName}`;
    if (dbExists.recordset.length > 0) {
      return res.status(400).json({ success: false, message: `La base de données '${databaseName}' existe déjà.` });
    }

    const query = `CREATE DATABASE [${databaseName}]`;
    await sql.query(query);

    res.json({ success: true, message: `Base de données '${databaseName}' créée avec succès.` });
  } catch (error) {
    console.error('Erreur lors de la création de la base de données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la base de données.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.delete('/api/databases/:databaseName', async (req, res) => {
  const { databaseName } = req.params;

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    await sql.connect(dynamicDbConfig);

    const dbExists = await sql.query`SELECT name FROM sys.databases WHERE name = ${databaseName}`;
    if (dbExists.recordset.length === 0) {
      return res.status(404).json({ success: false, message: `La base de données '${databaseName}' n'existe pas.` });
    }

    await sql.query`DROP DATABASE [${databaseName}]`;
    res.json({ success: true, message: `Base de données '${databaseName}' supprimée avec succès.` });
  } catch (error) {
    console.error('Erreur lors de la suppression de la base de données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la base de données.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.get('/api/tables', async (req, res) => {
  const { database } = req.query;

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  if (!database) {
    return res.status(400).json({ success: false, message: 'Le nom de la base de données est requis.' });
  }

  try {
    dynamicDbConfig.database = database;
    console.log('Configuration mise à jour pour la base de données :', dynamicDbConfig);

    if (sql.connected) {
      console.log('Fermeture de la connexion existante...');
      await sql.close();
    }

    await sql.connect(dynamicDbConfig);

    const result = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
    res.json({ success: true, tables: result.recordset });
    console.log('Tables récupérées avec succès:', result.recordset);
    sql.close();
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tables.',
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
    await sql.connect(dynamicDbConfig);

    const loginExists = await sql.query`SELECT name FROM sys.sql_logins WHERE name = ${username}`;
    if (loginExists.recordset.length > 0) {
      return res.status(400).json({ success: false, message: `Le login '${username}' existe déjà.` });
    }

    const userExists = await sql.query`SELECT name FROM sys.database_principals WHERE name = ${username}`;
    if (userExists.recordset.length > 0) {
      return res.status(400).json({ success: false, message: `L'utilisateur '${username}' existe déjà dans la base de données.` });
    }

    const createLoginQuery = `CREATE LOGIN [${username}] WITH PASSWORD = '${password}'`;
    await sql.query(createLoginQuery);
    
    const createUserQuery = `CREATE USER [${username}] FOR LOGIN [${username}]`;
    await sql.query(createUserQuery);

    res.json({ success: true, message: `Utilisateur SQL '${username}' créé avec succès.` });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'utilisateur SQL.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});
app.get('/api/sql-users', async (req, res) => {
  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    await sql.connect(dynamicDbConfig);
    const result = await sql.query`SELECT name FROM sys.sql_logins WHERE is_disabled = 0`;
    res.json({ success: true, users: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs SQL.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.delete('/api/sql-users/:username', async (req, res) => {
  const { username } = req.params;

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    await sql.connect(dynamicDbConfig);

    const result = await sql.query`SELECT name FROM sys.sql_logins WHERE name = ${username}`;
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: `Le login '${username}' n'existe pas.` });
    }

    const dropLoginQuery = `DROP LOGIN [${username}]`;
    await sql.query(dropLoginQuery);

    res.json({ success: true, message: `Utilisateur SQL '${username}' supprimé avec succès.` });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur SQL.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.get('/api/save-database/:databaseName', async (req, res) => {
  const { databaseName } = req.params;

  if (!dynamicDbConfig) {
    return res.status(401).json({ success: false, message: 'Non connecté à la base de données.' });
  }

  try {
    const dbConfigWithDatabase = { ...dynamicDbConfig, database: databaseName };
    await sql.connect(dbConfigWithDatabase);

    const tables = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;

    let sqlDump = `-- Sauvegarde de la base de données '${databaseName}'\n\n`;

    for (const table of tables.recordset) {
      const tableName = table.TABLE_NAME;

      const data = await sql.query(`SELECT * FROM ${tableName}`);
      sqlDump += `-- Données de la table '${tableName}'\n`;
      sqlDump += `INSERT INTO ${tableName} VALUES\n`;

      data.recordset.forEach((row, index) => {
        const values = Object.values(row)
          .map((value) => (typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value))
          .join(', ');
        sqlDump += `(${values})${index === data.recordset.length - 1 ? ';' : ','}\n`;
      });

      sqlDump += `\n`;
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${databaseName}.sql`);
    res.send(sqlDump);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la base de données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde de la base de données.',
      error: error.message,
    });
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré : http://localhost:${port}`);
});