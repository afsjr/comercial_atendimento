-- Migration 003: Corrigir RLS para permitir acesso básico
-- Executar no SQL Editor do Supabase

-- 1. Corrigr policy de contacts - permitir todos os autenticados verem
DROP POLICY IF EXISTS "contacts_select" ON contacts;

CREATE POLICY "contacts_select" ON contacts FOR SELECT TO authenticated
  USING (true);

-- 2. Corrigir policy de deals
DROP POLICY IF EXISTS "deals_select" ON deals;

CREATE POLICY "deals_select" ON deals FOR SELECT TO authenticated
  USING (true);

-- 3. Corrigir policy de profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (true);

-- 4. Corrigir policy de pipeline_stages
DROP POLICY IF EXISTS "stages_select" ON pipeline_stages;

CREATE POLICY "stages_select" ON pipeline_stages FOR SELECT TO authenticated
  USING (true);

-- 5. Corrigir policy de requests
DROP POLICY IF EXISTS "requests_select" ON requests;

CREATE POLICY "requests_select" ON requests FOR SELECT TO authenticated
  USING (true);

-- 6. Corrigir policy de courses
DROP POLICY IF EXISTS "courses_select" ON courses;

CREATE POLICY "courses_select" ON courses FOR SELECT TO authenticated
  USING (true);

SELECT 'RLS corregido!' as resultado;