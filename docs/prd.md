# PRD — Sistema de Atendimento Comercial + Secretaria

> **Versão:** 1.0  
> **Autor:** BA Agent (BMAD-Method)  
> **Data:** 2026-04-17  
> **Status:** Aprovado para desenvolvimento

---

## 1. Visão Geral

### 1.1 Problema

A equipe comercial e a secretaria/coordenação de cursos operam com processos desconectados. Os leads comerciais vindos do Chatwoot não são rastreados de forma estruturada, não há visibilidade do pipeline de vendas, e as solicitações de secretaria (informações sobre cursos, matrículas) se perdem em canais informais. Não há métricas de performance nem histórico consolidado de interações.

### 1.2 Solução

Sistema web unificado que integra CRM de vendas e gestão de atendimento da secretaria, conectado ao Chatwoot como canal de entrada, com pipeline visual, histórico de contatos e dashboards de performance.

### 1.3 Objetivos de Negócio

| Objetivo | Métrica de Sucesso | Meta |
|----------|--------------------|------|
| Aumentar conversão de leads | Taxa de conversão do funil | +20% em 3 meses |
| Reduzir tempo de resposta | Tempo médio de primeiro contato | < 2 horas |
| Centralizar informações | % de atendimentos registrados | 100% |
| Visibilidade gerencial | Dashboards disponíveis | Tempo real |

---

## 2. Personas

### 2.1 Vendedor (Primária)
- **Perfil:** Atendente comercial, 20-40 anos, conforto básico com tecnologia
- **Dores:** Perde leads, não sabe o que já foi conversado, não tem visão do pipeline
- **Necessidades:** Kanban visual, registro rápido de interações, alertas de follow-up
- **Frequência de uso:** Diário, 4-8h

### 2.2 Atendente da Secretaria (Primária)
- **Perfil:** Funcionário administrativo, atende dúvidas sobre cursos e matrículas
- **Dores:** Solicitações chegam por vários canais, difícil rastrear status
- **Necessidades:** Fila de solicitações, templates de resposta, catálogo de cursos
- **Frequência de uso:** Diário, 6-8h

### 2.3 Coordenador de Cursos (Secundária)
- **Perfil:** Gestor acadêmico, precisa de visão geral de demanda por curso
- **Dores:** Não sabe quais cursos têm mais procura, matrícula é manual
- **Necessidades:** Relatórios de demanda, aprovação de matrículas, funil por curso
- **Frequência de uso:** Diário, 2-4h

### 2.4 Gestor Comercial (Secundária)
- **Perfil:** Líder da equipe de vendas, define metas
- **Dores:** Sem visibilidade de performance individual, sem métricas de funil
- **Necessidades:** Dashboard de KPIs, performance por vendedor, metas
- **Frequência de uso:** Diário, 1-2h

### 2.5 Admin (Suporte)
- **Perfil:** TI ou gestor operacional
- **Necessidades:** Gestão de usuários, configuração de stages, integrações
- **Frequência de uso:** Semanal

---

## 3. Funcionalidades

### 3.1 Must Have (MVP)

#### F01 — Autenticação e Controle de Acesso
- Login com e-mail + senha via Supabase Auth
- 5 roles: admin, gestor_comercial, vendedor, coordenador, atendente_secretaria
- RLS (Row Level Security) no PostgreSQL
- Redirecionamento por role após login

#### F02 — Gestão de Contatos/Leads
- CRUD completo de contatos
- Campos: nome, e-mail, telefone, WhatsApp, empresa, origem
- Busca e filtros avançados (nome, origem, período)
- Deduplicação por e-mail/telefone
- Vínculo automático com conversas do Chatwoot

#### F03 — Pipeline de Vendas (Kanban)
- Quadro visual com colunas configuráveis
- Stages padrão: Novo → Qualificado → Proposta → Negociação → Ganho/Perdido
- Drag-and-drop entre colunas
- Card com: nome do contato, valor estimado, responsável, última interação
- Filtros por responsável, período, valor
- Atribuição de leads a vendedores

#### F04 — Registro de Interações
- Tipos: Ligação, WhatsApp, E-mail, Reunião, Visita, Outro
- Campos: notas livres, próxima ação, data da próxima ação
- Timeline cronológica no perfil do contato
- Vínculo com conversa do Chatwoot (se houver)

#### F05 — Inbox Integrado com Chatwoot
- Webhook receiver para capturar eventos do Chatwoot
- Classificação automática: Lead Comercial vs. Solicitação Secretaria
- Visualização de conversas vinculadas ao contato
- Link direto para abrir conversa no Chatwoot
- Criação automática de lead ao receber nova conversa

#### F06 — Módulo de Solicitações da Secretaria
- Tipos: info_curso, matrícula, financeiro, documentação, outro
- Status: aberto → em_andamento → aguardando_cliente → resolvido
- Fila de atendimento com prioridade
- Atribuição por atendente
- Notas internas

#### F07 — Layout e Navegação
- Sidebar responsiva com navegação por módulo
- Header com info do usuário e notificações
- Menu adaptativo por role (cada role vê apenas o que pode acessar)
- Tema escuro/claro

### 3.2 Should Have (Pós-MVP)

#### F08 — Dashboard e KPIs
- Cards: leads novos, em negociação, fechados (mês)
- Gráfico de funil de conversão
- Ranking de vendedores por conversão
- Tempo médio de fechamento
- Leads por origem (gráfico pizza)
- Filtro por período

#### F09 — Atribuição Automática
- Round-robin: distribui leads novos igualmente entre vendedores ativos
- Regras configuráveis por admin
- Fila de atendimento round-robin para secretaria

#### F10 — Templates de Resposta Rápida
- CRUD de templates por categoria
- Variáveis dinâmicas: {nome}, {curso}, {valor}
- Compartilhados por equipe ou individuais

### 3.3 Could Have (Futuro)

#### F11 — Relatórios Exportáveis
- Export PDF e Excel
- Relatório de performance mensal
- Relatório de demanda por curso

#### F12 — Notificações em Tempo Real
- Push notifications no browser
- E-mail de resumo diário
- Alertas de follow-up atrasado

#### F13 — Catálogo de Cursos Público
- Página pública com cursos disponíveis
- Formulário de interesse que gera lead automaticamente

---

## 4. Requisitos Não-Funcionais

| Categoria | Requisito | Meta |
|-----------|-----------|------|
| **Performance** | Tempo de carregamento de página | < 2s |
| **Performance** | Resposta de API | < 500ms |
| **Escalabilidade** | Usuários simultâneos | 20 |
| **Segurança** | Autenticação | Supabase Auth (JWT) |
| **Segurança** | Autorização | RLS por role no PostgreSQL |
| **Segurança** | HTTPS | Obrigatório |
| **Disponibilidade** | Uptime | 99.5% |
| **Acessibilidade** | Responsivo | Desktop + Tablet |
| **Integração** | Chatwoot | API v1 + Webhooks |
| **Dados** | Backup | Automático (Supabase managed) |

---

## 5. Fora de Escopo (v1)

- ❌ App mobile nativo
- ❌ Integração com WhatsApp Business API direta (usa Chatwoot como proxy)
- ❌ IA/ML para lead scoring
- ❌ Telefonia VoIP integrada
- ❌ ERP/Financeiro
- ❌ Gateway de pagamento

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Chatwoot fora do ar | Baixa | Alto | Registro manual como fallback |
| Resistência da equipe | Média | Alto | Treinamento + UI intuitiva |
| Dados duplicados de leads | Média | Médio | Deduplicação por e-mail/phone |
| Exceder free tier Supabase | Baixa | Médio | Monitorar uso, migrar se necessário |

---

## 7. Critérios de Aceite do MVP

- [ ] Usuário pode fazer login e ver apenas funcionalidades do seu role
- [ ] Vendedor pode gerenciar leads em kanban com drag-and-drop
- [ ] Interações são registradas com timeline no perfil do contato
- [ ] Webhook do Chatwoot cria leads e vincula conversas automaticamente
- [ ] Atendente da secretaria pode gerenciar solicitações em fila
- [ ] Coordenador pode visualizar pipeline e solicitações
- [ ] Dados persistem e são isolados por regras RLS
