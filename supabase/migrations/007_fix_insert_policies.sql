-- ============================================================
-- Migration: 007_fix_insert_policies
-- Atualiza políticas de INSERT em deals e requests para permitir
-- que o usuário crie registros associados a si mesmo.
-- Data: 2026-04-17
-- ============================================================

-- 1. Corrigir policy de deals (Permitir inserção se for o dono ou tiver role)
DROP POLICY IF EXISTS "deals_insert" ON deals;

CREATE POLICY "deals_insert" ON deals FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'vendedor']::user_role[])
    OR assigned_to = auth.uid()
  );

-- 2. Corrigir policy de requests (Permitir inserção se for o dono ou tiver role)
DROP POLICY IF EXISTS "requests_insert" ON requests;

CREATE POLICY "requests_insert" ON requests FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), ARRAY['admin', 'coordenador', 'atendente_secretaria']::user_role[])
    OR assigned_to = auth.uid()
  );

SELECT 'Políticas de INSERT corrigidas!' as resultado;
