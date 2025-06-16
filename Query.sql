
-- Create table
CREATE TABLE master.dbo.USERS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Nom NVARCHAR(50) NOT NULL,
    Prénom NVARCHAR(50) NOT NULL
);

-- Insert
INSERT INTO master.dbo.USERS (Nom, Prénom) VALUES ('Dupont', 'Jean');
INSERT INTO master.dbo.USERS (Nom, Prénom) VALUES ('Martin', 'Marie');
INSERT INTO master.dbo.USERS (Nom, Prénom) VALUES ('Bernard', 'Pierre');
INSERT INTO master.dbo.USERS (Nom, Prénom) VALUES ('Durand', 'Sophie');
INSERT INTO master.dbo.USERS (Nom, Prénom) VALUES ('Leroy', 'Luc');

-- Update

UPDATE master.dbo.USERS SET Prénom = 'Jean-Claude' WHERE Nom = 'Dupont';
UPDATE master.dbo.USERS SET Prénom = 'Marie-Claire' WHERE Nom = 'Martin';
UPDATE master.dbo.USERS SET Prénom = 'Pierre-Louis' WHERE Nom = 'Bernard';
UPDATE master.dbo.USERS SET Prénom = 'Sophie-Anne' WHERE Nom = 'Durand';


-- Delete
DELETE FROM master.dbo.USERS WHERE Nom = 'Leroy';
DELETE FROM master.dbo.USERS WHERE Nom = 'Dupont';
DELETE FROM master.dbo.USERS WHERE Nom = 'Martin';

