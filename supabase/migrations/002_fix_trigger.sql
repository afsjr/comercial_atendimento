-- ============================================================
-- Migration: 002_fix_trigger
-- Corrige trigger de criação de perfil
-- Data: 2026-04-17
-- ============================================================

-- 1. Verificar se funções existem
-- SELECT proname FROM pg_proc WHERE proname IN ('get_user_role', 'has_role', 'get_profile_id', 'update_updated_at', 'handle_new_user');

-- 2. Criar funções básicas (se não existirem)

-- Função updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Função get_profile_id
CREATE OR REPLACE FUNCTION get_profile_id(p_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM profiles WHERE user_id = p_user_id LIMIT 1;
$$;

-- Função has_role
CREATE OR REPLACE FUNCTION has_role(p_user_id UUID, p_roles TEXT[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = p_user_id AND role::TEXT = ANY(p_roles));
$$;

-- 3. Desabilitar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Criar trigger simplificado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'vendedor'::user_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Corrigir policy de INSERT para profiles
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);

SELECT 'Trigger corrigido com sucesso!' as resultado;