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
  server: 'localhost', 
  database: 'master',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};


app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

app.get('/api/test-connection', async (req, res) => {
    try {
      await sql.connect(dbConfig);
      res.json({ success: true, message: 'Connexion à la base de données réussie!' });
    } catch (error) {
      res.json({ success: false, message: 'Échec de la connexion à la base de données.', error: error.message });
    } finally {
      sql.close();
    }
  });
  

app.get('/api/data', async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query`SELECT * FROM Users`; // Remplacez 'Users' par le nom de votre table
      res.json({ success: true, data: result.recordset });
    } catch (error) {
      res.json({ success: false, message: 'Erreur lors de la récupération des données.', error: error.message });
    } finally {
      sql.close();
    }
  });
  