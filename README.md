# WSSMS

WSSMS (Web SQL Server Management System) est une application web permettant de gérer une instance SQL Server via une interface utilisateur intuitive. Ce projet a été développé dans le cadre d'un projet scolaire.

## **Fonctionnalités principales**

- Gestion des bases de données :
  - Création, suppression et sauvegarde des bases de données.
- Gestion des tables :
  - Affichage des tables et exécution de requêtes SQL.
- Gestion des utilisateurs SQL :
  - Création, suppression et gestion des utilisateurs SQL.
- Sauvegarde des bases de données dans un fichier téléchargeable.

---

## **Prérequis**

Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre machine :

1. **Node.js** 
2. **SQL Server** 
3. **npm** 

---

## **Installation**

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/reaub1/WSSMS.git
   ```

2. Installez les dépendances :
    ```bash
    npm install
    ```

3. Démarrez les services avec Docker : 
    ```bash
    Docker compose up
    ```

4. Accèdez à l'application dans votre navigateur :
    ```
    http://localhost:3000
    ```

## **Utilisation**

### **1. Gestion des bases de données**
- **Créer une base de données :**
  - Entrez le nom de la base de données dans le champ prévu à cet effet et cliquez sur "Créer".
- **Supprimer une base de données :**
  - Cliquez sur le bouton "Supprimer" à côté de la base de données.
- **Sauvegarder une base de données :**
  - Cliquez sur le bouton "Sauvegarder" pour télécharger un fichier `.sql` contenant les données de la base.

### **2. Gestion des tables**
- **Afficher les tables :**
  - Cliquez sur "Ouvrir" à côté d'une base de données pour afficher ses tables.
- **Exécuter des requêtes SQL :**
  - Sélectionnez une table et exécutez des requêtes SQL personnalisées.

### **3. Gestion des utilisateurs SQL**
- **Ajouter un utilisateur :**
  - Cliquez sur "Ajouter un Utilisateur SQL", remplissez le formulaire avec un nom d'utilisateur et un mot de passe, puis cliquez sur "Ajouter".
- **Supprimer un utilisateur :**
  - Cliquez sur "Supprimer" à côté du nom de l'utilisateur.

---

## **API**

### **Routes principales**

1. **Bases de données**
   - `GET /api/databases` : Récupère la liste des bases de données.
   - `POST /api/create-databases` : Crée une nouvelle base de données.
   - `DELETE /api/databases/:databaseName` : Supprime une base de données.
   - `GET /api/save-database/:databaseName` : Sauvegarde une base de données dans un fichier SQL.

2. **Utilisateurs SQL**
   - `GET /api/sql-users` : Récupère la liste des utilisateurs SQL.
   - `POST /api/sql-users` : Ajoute un nouvel utilisateur SQL.
   - `DELETE /api/sql-users/:username` : Supprime un utilisateur SQL.

3. **Tables**
   - `GET /api/tables?database=:databaseName` : Récupère les tables d'une base de données.

---

## **Dépannage**

### **Problèmes courants**
1. **Erreur 401 : Non connecté à la base de données**
   - Vérifiez les informations de connexion dans `server.js`.
2. **Erreur 400 : Requête incorrecte**
   - Assurez-vous que tous les paramètres requis sont fournis dans les requêtes API.
3. **Erreur `Invalid object name 'SavedQueries'`**
   - Vérifiez que la table `SavedQueries` existe dans la base de données. Si elle n'existe pas, elle sera créée automatiquement lors de la première utilisation.

---

## **Contributeurs**

- **Sébastien Pichon**
- **Robin Bechlem**

---