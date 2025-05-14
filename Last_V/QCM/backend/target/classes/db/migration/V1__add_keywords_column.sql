-- Ajouter la colonne keywords à la table answers si elle n'existe pas déjà
ALTER TABLE answers ADD COLUMN IF NOT EXISTS keywords VARCHAR(255) DEFAULT NULL;
