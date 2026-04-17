-- ============================================================
-- Migration: 001_initial_schema
-- Sistema de Atendimento Comercial + Secretaria
-- Data: 2026-04-17
-- ============================================================

-- =====================
-- 1. TIPOS ENUMERADOS
-- =====================

CREATE TYPE user_role AS ENUM (
  'admin',
  'gestor_comercial',
  'vendedor',
  'coordenador',
  'atendente_secretaria'
);

CREATE TYPE contact_source AS ENUM (
  'chatwoot',
  'manual',
  'formulario',
  'indicacao',
  'site',
  'outro'
);

CREATE TYPE interaction_type AS ENUM (
  'ligacao',
  'whatsapp',
  'email',
  'reuniao',
  'visita',
  'outro'
);

CREATE TYPE request_type AS ENUM (
  'info_curso',
  'matricula',
  'financeiro',
  'documentacao',
  'outro'
);

CREATE TYPE request_status AS ENUM (
  'aberto',
  'em_andamento',
  'aguardando_cliente',
  'resolvido',
  'cancelado'
);

CREATE TYPE request_priority AS ENUM (
  'baixa',
  'normal',
  'alta',
  'urgente'
);

-- =====================
-- 2. TABELAS
-- =====================

-- Perfis de usuários (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'vendedor',
  team TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Cursos
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  modality TEXT,
  duration_hours INTEGER,
  price DECIMAL(10, 2),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contatos / Leads
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  company TEXT,
  source contact_source NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_whatsapp ON contacts(whatsapp);
CREATE INDEX idx_contacts_source ON contacts(source);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);

-- Estágios do Pipeline
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_won BOOLEAN NOT NULL DEFAULT false,
  is_lost BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_pipeline_stages_position ON pipeline_stages(position) WHERE active = true;

-- Deals (Oportunidades)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(12, 2),
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  assigned_to UUID REFERENCES profiles(id),
  course_interest UUID REFERENCES courses(id),
  expected_close_date DATE,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);

-- Interações
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  type interaction_type NOT NULL,
  notes TEXT,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  chatwoot_conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_deal_id ON interactions(deal_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_next_action_date ON interactions(next_action_date) WHERE next_action_date IS NOT NULL;

-- Solicitações da Secretaria
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  type request_type NOT NULL DEFAULT 'outro',
  course_id UUID REFERENCES courses(id),
  status request_status NOT NULL DEFAULT 'aberto',
  priority request_priority NOT NULL DEFAULT 'normal',
  notes TEXT,
  internal_notes TEXT,
  chatwoot_conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_priority ON requests(priority);

-- Conversas do Chatwoot (vínculo)
CREATE TABLE chatwoot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatwoot_id TEXT NOT NULL UNIQUE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id),
  inbox_id TEXT,
  status TEXT DEFAULT 'open',
  labels JSONB DEFAULT '[]'::jsonb,
  conversation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chatwoot_conv_chatwoot_id ON chatwoot_conversations(chatwoot_id);
CREATE INDEX idx_chatwoot_conv_contact_id ON chatwoot_conversations(contact_id);

-- Templates de resposta rápida
CREATE TABLE response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL, -- 'new_lead', 'new_request', 'follow_up', 'assigned'
  reference_type TEXT, -- 'deal', 'request', 'contact'
  reference_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = false;

-- =====================
-- 3. FUNÇÕES HELPER
-- =====================

-- Obter role do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE user_id = p_user_id LIMIT 1;
$$;

-- Verificar se o usuário tem uma das roles especificadas
CREATE OR REPLACE FUNCTION has_role(p_user_id UUID, p_roles user_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = p_user_id AND role = ANY(p_roles) AND active = true
  );
$$;

-- Obter profile_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_profile_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM profiles WHERE user_id = p_user_id LIMIT 1;
$$;

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger a tabelas que precisam
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON chatwoot_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON response_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para criar profile ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Try to get role from metadata, default to 'vendedor'
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor');
  
  -- Only set default if not valid
  IF v_role NOT IN ('admin', 'gestor_comercial', 'vendedor', 'coordenador', 'atendente_secretaria') THEN
    v_role := 'vendedor';
  END IF;
  
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role::user_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================
-- 4. RLS POLICIES
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatwoot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- === PROFILES ===
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles FOR ALL TO authenticated
  USING (has_role(auth.uid(), ARRAY['admin']::user_role[]));

-- === CONTACTS ===
CREATE POLICY "contacts_select" ON contacts FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'coordenador']::user_role[])
    OR created_by = get_profile_id(auth.uid())
    OR id IN (SELECT contact_id FROM deals WHERE assigned_to = get_profile_id(auth.uid()))
    OR id IN (SELECT contact_id FROM requests WHERE assigned_to = get_profile_id(auth.uid()))
  );

CREATE POLICY "contacts_insert" ON contacts FOR INSERT TO authenticated
  WITH CHECK (true); -- qualquer autenticado pode criar contato

CREATE POLICY "contacts_update" ON contacts FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'coordenador']::user_role[])
    OR created_by = get_profile_id(auth.uid())
  );

-- === DEALS ===
CREATE POLICY "deals_select" ON deals FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'coordenador']::user_role[])
    OR assigned_to = get_profile_id(auth.uid())
  );

CREATE POLICY "deals_insert" ON deals FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'vendedor']::user_role[])
  );

CREATE POLICY "deals_update" ON deals FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial']::user_role[])
    OR assigned_to = get_profile_id(auth.uid())
  );

-- === INTERACTIONS ===
CREATE POLICY "interactions_select" ON interactions FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'coordenador']::user_role[])
    OR user_id = get_profile_id(auth.uid())
    OR contact_id IN (SELECT contact_id FROM deals WHERE assigned_to = get_profile_id(auth.uid()))
  );

CREATE POLICY "interactions_insert" ON interactions FOR INSERT TO authenticated
  WITH CHECK (true); -- qualquer autenticado pode registrar interação

-- === REQUESTS ===
CREATE POLICY "requests_select" ON requests FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'coordenador']::user_role[])
    OR assigned_to = get_profile_id(auth.uid())
  );

CREATE POLICY "requests_insert" ON requests FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), ARRAY['admin', 'coordenador', 'atendente_secretaria']::user_role[])
  );

CREATE POLICY "requests_update" ON requests FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'coordenador']::user_role[])
    OR assigned_to = get_profile_id(auth.uid())
  );

-- === COURSES ===
CREATE POLICY "courses_select" ON courses FOR SELECT TO authenticated
  USING (true); -- todos podem ver cursos

CREATE POLICY "courses_manage" ON courses FOR ALL TO authenticated
  USING (has_role(auth.uid(), ARRAY['admin', 'coordenador']::user_role[]));

-- === PIPELINE STAGES ===
CREATE POLICY "stages_select" ON pipeline_stages FOR SELECT TO authenticated
  USING (true); -- todos podem ver stages

CREATE POLICY "stages_manage" ON pipeline_stages FOR ALL TO authenticated
  USING (has_role(auth.uid(), ARRAY['admin']::user_role[]));

-- === CHATWOOT CONVERSATIONS ===
CREATE POLICY "chatwoot_select" ON chatwoot_conversations FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), ARRAY['admin', 'gestor_comercial', 'coordenador']::user_role[])
    OR assigned_to = get_profile_id(auth.uid())
    OR contact_id IN (SELECT contact_id FROM deals WHERE assigned_to = get_profile_id(auth.uid()))
    OR contact_id IN (SELECT contact_id FROM requests WHERE assigned_to = get_profile_id(auth.uid()))
  );

-- === RESPONSE TEMPLATES ===
CREATE POLICY "templates_select" ON response_templates FOR SELECT TO authenticated
  USING (is_global = true OR created_by = get_profile_id(auth.uid()));

CREATE POLICY "templates_manage_own" ON response_templates FOR ALL TO authenticated
  USING (created_by = get_profile_id(auth.uid()));

CREATE POLICY "templates_manage_global" ON response_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), ARRAY['admin']::user_role[]) AND is_global = true);

-- === NOTIFICATIONS ===
CREATE POLICY "notifications_own" ON notifications FOR ALL TO authenticated
  USING (user_id = get_profile_id(auth.uid()));

-- =====================
-- 5. REALTIME
-- =====================

ALTER PUBLICATION supabase_realtime ADD TABLE deals;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chatwoot_conversations;
