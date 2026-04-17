-- ============================================================
-- Migration: 004_fix_foreign_keys
-- Corrigir referências de created_by/assigned_to para auth.users
-- Data: 2026-04-17
-- ============================================================

-- =====================
-- 1. CONTACTS - created_by
-- =====================

-- Remover constraint existente
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_created_by_fkey;

-- Adicionar nova constraint referenciando auth.users
ALTER TABLE contacts ADD CONSTRAINT contacts_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- =====================
-- 2. DEALS - assigned_to
-- =====================

ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_assigned_to_fkey;

ALTER TABLE deals ADD CONSTRAINT deals_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- =====================
-- 3. REQUESTS - assigned_to
-- =====================

ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_assigned_to_fkey;

ALTER TABLE requests ADD CONSTRAINT requests_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- =====================
-- 4. INTERACTIONS - created_by
-- =====================

ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_user_id_fkey;

ALTER TABLE interactions ADD CONSTRAINT interactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- Verificar se funcionou
-- ============================================================

SELECT 
  'contacts' as tabela,
  tc.constraint_name,
  tc.foreign_table_name as referencia
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'contacts' AND tc.constraint_type = 'FOREIGN KEY';

SELECT 
  'deals' as tabela,
  tc.constraint_name,
  tc.foreign_table_name as referencia
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'deals' AND tc.constraint_type = 'FOREIGN KEY';