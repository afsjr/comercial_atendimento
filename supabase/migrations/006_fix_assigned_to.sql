-- ============================================================
-- Migration: 006_fix_assigned_to  
-- Corrigir referências de assigned_to para auth.users
-- Data: 2026-04-17
-- ============================================================

-- DEALS - assigned_to
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_assigned_to_fkey;
ALTER TABLE deals ADD CONSTRAINT deals_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- REQUESTS - assigned_to
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_assigned_to_fkey;
ALTER TABLE requests ADD CONSTRAINT requests_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- INTERACTIONS - user_id
ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_user_id_fkey;
ALTER TABLE interactions ADD CONSTRAINT interactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;