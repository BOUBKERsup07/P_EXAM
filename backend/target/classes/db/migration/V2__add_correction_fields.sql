-- Ajout des champs de correction à la table student_answers
ALTER TABLE student_answers
    ADD COLUMN points DOUBLE PRECISION,
    ADD COLUMN feedback TEXT;

-- Ajout des champs de correction à la table student_exams
ALTER TABLE student_exams
    ADD COLUMN total_points DOUBLE PRECISION,
    ADD COLUMN is_corrected BOOLEAN NOT NULL DEFAULT FALSE; 