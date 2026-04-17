-- ============================================================
-- Migration: 005_fix_course_interest
-- Alterar course_interest para texto livre
-- Data: 2026-04-17
-- ============================================================

-- Remover constraint de foreign key existente
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_course_interest_fkey;

-- Alterar coluna para texto
ALTER TABLE deals ALTER COLUMN course_interest TYPE TEXT;

-- Permitir valores nulos
ALTER TABLE deals ALTER COLUMN course_interest DROP NOT NULL;