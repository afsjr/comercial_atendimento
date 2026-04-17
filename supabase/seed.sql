-- ============================================================
-- Seed Data: Pipeline Stages + Cursos exemplo
-- Sistema de Atendimento Comercial + Secretaria
-- ============================================================

-- Pipeline Stages padrão
INSERT INTO pipeline_stages (name, position, color, is_won, is_lost) VALUES
  ('Novo',        1, '#8b5cf6', false, false),  -- Violet
  ('Qualificado', 2, '#3b82f6', false, false),  -- Blue
  ('Proposta',    3, '#f59e0b', false, false),  -- Amber
  ('Negociação',  4, '#f97316', false, false),  -- Orange
  ('Ganho',       5, '#22c55e', true,  false),  -- Green
  ('Perdido',     6, '#ef4444', false, true);   -- Red

-- Cursos exemplo (substituir pelos reais)
INSERT INTO courses (name, modality, duration_hours, price, description, active) VALUES
  ('Administração', 'Presencial', 2400, 899.00, 'Curso de Bacharelado em Administração', true),
  ('Pedagogia', 'EAD', 3200, 499.00, 'Licenciatura em Pedagogia - modalidade EAD', true),
  ('Enfermagem', 'Presencial', 4000, 1299.00, 'Bacharelado em Enfermagem', true),
  ('Análise e Desenvolvimento de Sistemas', 'EAD', 2000, 399.00, 'Tecnólogo em ADS', true),
  ('Direito', 'Presencial', 3700, 1499.00, 'Bacharelado em Direito', true),
  ('Psicologia', 'Presencial', 4000, 1199.00, 'Bacharelado em Psicologia', true),
  ('Gestão de Recursos Humanos', 'EAD', 1600, 299.00, 'Tecnólogo em RH', true),
  ('Contabilidade', 'Semipresencial', 2400, 599.00, 'Bacharelado em Ciências Contábeis', true);

-- Template de respostas padrão
INSERT INTO response_templates (title, category, content, variables, is_global) VALUES
  (
    'Boas-vindas - Primeiro Contato',
    'comercial',
    'Olá, {nome}! 👋 Seja bem-vindo(a)! Vi que você tem interesse em nossos cursos. Posso ajudá-lo(a) com informações sobre {curso}?',
    '["nome", "curso"]'::jsonb,
    true
  ),
  (
    'Informações sobre Curso',
    'secretaria',
    'Olá, {nome}! O curso de {curso} tem duração de {duracao} horas, na modalidade {modalidade}, com mensalidade de R$ {valor}. Gostaria de saber mais detalhes ou agendar uma visita?',
    '["nome", "curso", "duracao", "modalidade", "valor"]'::jsonb,
    true
  ),
  (
    'Follow-up - Sem Resposta',
    'comercial',
    'Olá, {nome}! Tudo bem? 😊 Estou entrando em contato novamente sobre o curso de {curso}. Tem alguma dúvida que eu possa esclarecer?',
    '["nome", "curso"]'::jsonb,
    true
  ),
  (
    'Processo de Matrícula',
    'secretaria',
    'Olá, {nome}! Para realizar sua matrícula no curso de {curso}, você precisará dos seguintes documentos:\n\n📄 RG e CPF\n📄 Comprovante de residência\n📄 Histórico escolar\n📄 Foto 3x4\n\nGostaria de agendar a entrega dos documentos?',
    '["nome", "curso"]'::jsonb,
    true
  );
