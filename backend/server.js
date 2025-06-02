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
    sql.close();
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

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré : http://localhost:${port}`);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Identifiants incorrects.' });
  }
});
