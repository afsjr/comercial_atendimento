# Epics & Stories — Sistema de Atendimento Comercial

> **Versão:** 1.0  
> **Autor:** PM Agent (BMAD-Method)  
> **Data:** 2026-04-17  
> **Referência:** PRD v1.0 + Arquitetura v1.0

---

## Sprint 1 — Fundação (Semana 1-2)

### Epic E1: Autenticação e Controle de Acesso

```
E1-US01: Setup do Projeto e Infraestrutura
  Como: Desenvolvedor
  Quero: Projeto Next.js 15 configurado com Supabase, Tailwind e TypeScript
  Para: Ter a base técnica pronta para desenvolvimento
  AC:
    [ ] Next.js 15 com App Router inicializado
    [ ] Supabase client configurado (client-side + server-side)
    [ ] Tailwind CSS v4 com design tokens customizados
    [ ] Zustand + TanStack Query configurados
    [ ] ESLint + Prettier configurados
    [ ] Variáveis de ambiente documentadas em .env.example
  Story Points: 3

E1-US02: Migration Inicial do Banco de Dados
  Como: Desenvolvedor
  Quero: Schema SQL completo criado no Supabase
  Para: Ter a estrutura de dados pronta para uso
  AC:
    [ ] Todas as tabelas criadas conforme diagrama ER
    [ ] Enums criados (user_role, contact_source, etc.)
    [ ] Índices para buscas frequentes
    [ ] Função helper get_user_role() criada
    [ ] Seed data: pipeline_stages padrão + admin user
  Story Points: 5

E1-US03: Tela de Login
  Como: Usuário
  Quero: Fazer login com e-mail e senha
  Para: Acessar o sistema com meu perfil
  AC:
    [ ] Formulário de login com validação
    [ ] Integração com Supabase Auth
    [ ] Mensagens de erro claras (credenciais inválidas, etc.)
    [ ] Redirect para dashboard após login
    [ ] Design premium com gradientes e animações sutis
  Story Points: 3

E1-US04: Middleware de Autenticação e Roles
  Como: Sistema
  Quero: Proteger rotas por autenticação e role
  Para: Garantir que cada usuário acesse apenas o que deve
  AC:
    [ ] Middleware Next.js que verifica sessão
    [ ] Redirect para /login se não autenticado
    [ ] Hook useAuth() com role do usuário
    [ ] Guard de role por rota (conforme tabela de rotas)
    [ ] RLS policies ativas no Supabase
  Story Points: 5

E1-US05: Layout Principal (Sidebar + Header)
  Como: Usuário
  Quero: Navegar entre módulos com sidebar e header
  Para: Acessar rapidamente qualquer funcionalidade
  AC:
    [ ] Sidebar com ícones e labels
    [ ] Items do menu filtrados por role
    [ ] Header com nome do usuário, avatar e logout
    [ ] Indicador de página ativa
    [ ] Responsivo (sidebar colapsável em tablet)
    [ ] Toggle dark/light mode
  Story Points: 5
```

---

### Epic E2: Gestão de Contatos/Leads

```
E2-US01: Lista de Contatos
  Como: Vendedor
  Quero: Ver todos os meus contatos em uma lista organizada
  Para: Encontrar rapidamente quem preciso contatar
  AC:
    [ ] Tabela com colunas: Nome, Telefone, E-mail, Origem, Último contato
    [ ] Busca por nome/telefone/e-mail
    [ ] Filtros: origem, período de criação
    [ ] Ordenação por colunas
    [ ] Paginação (20 por página)
    [ ] Badge com contagem de deals ativos
  Story Points: 5

E2-US02: Cadastro e Edição de Contato
  Como: Vendedor
  Quero: Cadastrar ou editar um contato
  Para: Manter as informações dos leads atualizadas
  AC:
    [ ] Modal ou página de formulário
    [ ] Campos: nome*, e-mail, telefone*, WhatsApp, empresa, origem
    [ ] Validação de e-mail e telefone
    [ ] Verificação de duplicidade antes de salvar
    [ ] Feedback visual de sucesso/erro
  Story Points: 3

E2-US03: Perfil do Contato com Timeline
  Como: Vendedor
  Quero: Ver o histórico completo de interações de um contato
  Para: Saber tudo que já foi conversado antes de fazer contato
  AC:
    [ ] Cabeçalho com dados do contato + botão editar
    [ ] Cards de deals vinculados (com stage)
    [ ] Timeline de interações (cronológica, mais recente primeiro)
    [ ] Conversas do Chatwoot vinculadas (link para abrir)
    [ ] Solicitações da secretaria vinculadas (se houver)
    [ ] Botão para registrar nova interação
  Story Points: 5
```

---

## Sprint 2 — Core CRM (Semana 3-4)

### Epic E3: Pipeline de Vendas (Kanban)

```
E3-US01: Quadro Kanban
  Como: Vendedor
  Quero: Ver meus deals em um quadro visual por estágio
  Para: Acompanhar a evolução de cada oportunidade
  AC:
    [ ] Colunas dinâmicas baseadas em pipeline_stages
    [ ] Cards com: nome do contato, título do deal, valor, responsável
    [ ] Contagem de deals e valor total por coluna
    [ ] Drag-and-drop entre colunas (@dnd-kit)
    [ ] Ao mover para "ganho" ou "perdido": modal de confirmação
    [ ] Filtros: responsável, período, faixa de valor
  Story Points: 8

E3-US02: Criar e Editar Deal
  Como: Vendedor
  Quero: Criar um novo deal vinculado a um contato
  Para: Registrar uma oportunidade de venda
  AC:
    [ ] Modal com campos: título*, contato* (autocomplete), valor estimado, 
        curso de interesse, data prevista de fechamento
    [ ] Stage inicial: "novo"
    [ ] Atribuição automática ao vendedor que criou
    [ ] Edição inline ou via modal
  Story Points: 3

E3-US03: Detalhes do Deal
  Como: Vendedor
  Quero: Ver os detalhes completos de um deal
  Para: Ter contexto antes de fazer o próximo contato
  AC:
    [ ] Slide-over ou modal com dados completos
    [ ] Timeline de interações vinculadas
    [ ] Dados do contato resumidos
    [ ] Conversas Chatwoot vinculadas
    [ ] Botões: registrar interação, mover stage, editar
  Story Points: 5
```

### Epic E4: Registro de Interações

```
E4-US01: Registrar Interação
  Como: Vendedor
  Quero: Registrar uma interação com um contato/deal
  Para: Manter o histórico atualizado para toda a equipe
  AC:
    [ ] Modal com campos: tipo*, notas, próxima ação, data próxima ação
    [ ] Tipo: select com ícones (Ligação 📞, WhatsApp 💬, etc.)
    [ ] Vínculo automático com deal ativo (se acessado via deal)
    [ ] Data/hora automáticos
    [ ] Notificação visual de sucesso
  Story Points: 3

E4-US02: Timeline de Interações
  Como: Vendedor
  Quero: Ver o histórico de interações em formato timeline
  Para: Entender rapidamente a evolução do relacionamento
  AC:
    [ ] Lista cronológica com ícones por tipo
    [ ] Card com: tipo, notas (truncadas), data, autor
    [ ] Expandir/colapsar notas longas
    [ ] Indicador de próxima ação agendada
    [ ] Alerta visual se follow-up está atrasado
  Story Points: 3
```

### Epic E5: Integração Chatwoot

```
E5-US01: Webhook Receiver
  Como: Sistema
  Quero: Receber e processar webhooks do Chatwoot
  Para: Criar leads e vincular conversas automaticamente
  AC:
    [ ] API Route POST /api/chatwoot/webhook
    [ ] Validação de signature (HMAC)
    [ ] Parsing de eventos: conversation_created, message_created
    [ ] Busca ou criação de contato por phone/email
    [ ] Classificação: comercial vs secretaria
    [ ] Criação de deal ou request conforme classificação
    [ ] Criação de chatwoot_conversations para vínculo
    [ ] Log de erros sem quebrar o fluxo
  Story Points: 8

E5-US02: Visualização de Conversas Vinculadas
  Como: Vendedor/Atendente
  Quero: Ver as conversas do Chatwoot vinculadas a um contato
  Para: Acessar o histórico de mensagens rapidamente
  AC:
    [ ] Lista de conversas no perfil do contato
    [ ] Info: inbox, status, data, labels
    [ ] Link "Abrir no Chatwoot" → nova aba
    [ ] Indicador de conversa ativa vs. resolvida
  Story Points: 3
```

---

## Sprint 3 — Secretaria (Semana 5-6)

### Epic E6: Módulo de Solicitações da Secretaria

```
E6-US01: Fila de Solicitações
  Como: Atendente da Secretaria
  Quero: Ver todas as solicitações abertas em uma fila organizada
  Para: Priorizar meu atendimento de forma eficiente
  AC:
    [ ] Tabela/cards com: contato, tipo, prioridade, status, atribuído, data
    [ ] Filtros: status, tipo, prioridade, atribuído a mim
    [ ] Ordenação: prioridade + data (mais antigo primeiro)
    [ ] Badge de contagem por status
    [ ] Ação rápida: assumir solicitação
  Story Points: 5

E6-US02: Criar Solicitação
  Como: Atendente da Secretaria
  Quero: Criar uma nova solicitação de atendimento
  Para: Registrar uma demanda que chegou por qualquer canal
  AC:
    [ ] Modal com: contato* (autocomplete), tipo*, curso (se aplicável),
        prioridade, notas
    [ ] Atribuição a si mesmo por padrão
    [ ] Status inicial: "aberto"
  Story Points: 3

E6-US03: Gerenciar Solicitação
  Como: Atendente da Secretaria
  Quero: Atualizar o status e adicionar notas a uma solicitação
  Para: Registrar o progresso do atendimento
  AC:
    [ ] Alterar status via select ou botões
    [ ] Adicionar notas internas (não visíveis ao contato)
    [ ] Adicionar notas de atendimento
    [ ] Ao resolver: campo de resolução obrigatório
    [ ] Reatribuir a outro atendente
    [ ] Histórico de alterações de status
  Story Points: 5

E6-US04: Catálogo de Cursos (Referência)
  Como: Atendente da Secretaria
  Quero: Consultar os cursos disponíveis durante o atendimento
  Para: Informar corretamente o cliente sobre opções
  AC:
    [ ] Lista de cursos com: nome, modalidade, duração, valor
    [ ] Busca por nome
    [ ] Filtro: ativos/inativos
    [ ] Somente visualização para secretaria
    [ ] CRUD completo para admin/coordenador
  Story Points: 3
```

---

## Sprint 4 — Inteligência (Semana 7-8)

### Epic E7: Dashboard e KPIs

```
E7-US01: Dashboard Principal
  Como: Gestor Comercial
  Quero: Ver KPIs da equipe em tempo real
  Para: Tomar decisões baseadas em dados
  AC:
    [ ] KPI Cards: leads novos (mês), deals em negociação, taxa de conversão,
        ticket médio, solicitações abertas
    [ ] Gráfico de funil de conversão (barras horizontais)
    [ ] Gráfico de leads por origem (pizza)
    [ ] Ranking de vendedores (tabela com barras de progresso)
    [ ] Filtro por período (7d, 30d, 90d, custom)
    [ ] Dados atualizados via realtime
  Story Points: 8

E7-US02: Dashboard do Vendedor
  Como: Vendedor
  Quero: Ver meus próprios números
  Para: Acompanhar minha performance e pendências
  AC:
    [ ] Meus deals por stage (mini kanban ou contagem)
    [ ] Follow-ups atrasados (lista com alert)
    [ ] Interações esta semana (contagem)
    [ ] Deals ganhos/perdidos (mês)
  Story Points: 5
```

### Epic E8: Notificações Realtime

```
E8-US01: Notificações In-App
  Como: Usuário
  Quero: Ser notificado quando algo relevante acontece
  Para: Reagir rapidamente a novos leads e solicitações
  AC:
    [ ] Supabase Realtime subscription
    [ ] Eventos: novo lead atribuído, nova solicitação, follow-up vencendo
    [ ] Badge de contagem no sino do header
    [ ] Dropdown com lista de notificações
    [ ] Marcar como lida
    [ ] Toast notification para eventos críticos
  Story Points: 5
```

### Epic E9: Templates de Resposta

```
E9-US01: CRUD de Templates
  Como: Vendedor/Atendente
  Quero: Criar e gerenciar templates de resposta rápida
  Para: Responder perguntas frequentes com agilidade
  AC:
    [ ] CRUD: título, categoria, conteúdo, variáveis
    [ ] Variáveis: {nome}, {curso}, {valor}, {data}
    [ ] Preview com variáveis preenchidas
    [ ] Templates globais (admin) + pessoais
    [ ] Botão "Copiar" para usar no Chatwoot
  Story Points: 5
```

---

## Sprint 5 — Polish (Semana 9-10)

### Epic E10: Relatórios e Exportação

```
E10-US01: Relatório de Performance
  Como: Gestor
  Quero: Gerar relatório mensal de performance da equipe
  Para: Apresentar resultados em reuniões
  AC:
    [ ] Seleção de período
    [ ] Métricas: conversão, ticket médio, tempo de fechamento, por vendedor
    [ ] Exportar PDF e Excel
  Story Points: 8
```

### Epic E11: Testes e Deploy

```
E11-US01: Testes E2E
  Como: Desenvolvedor
  Quero: Suite de testes E2E cobrindo fluxos críticos
  Para: Garantir estabilidade em deploys futuros
  AC:
    [ ] Playwright configurado
    [ ] Cenários: login, criar lead, mover deal, criar solicitação
    [ ] CI configurado (GitHub Actions)
  Story Points: 8

E11-US02: Deploy Produção
  Como: Admin
  Quero: Sistema publicado e acessível
  Para: A equipe começar a usar
  AC:
    [ ] Vercel deploy com domínio customizado
    [ ] Variáveis de ambiente configuradas
    [ ] Supabase em projeto production
    [ ] HTTPS ativo
    [ ] Monitoramento básico (Vercel Analytics)
  Story Points: 3
```

---

## Resumo de Estimativa

| Sprint | Epics | Story Points | Duração |
|--------|-------|-------------|---------|
| Sprint 1 | E1 + E2 | 34 SP | 2 semanas |
| Sprint 2 | E3 + E4 + E5 | 33 SP | 2 semanas |
| Sprint 3 | E6 | 16 SP | 2 semanas |
| Sprint 4 | E7 + E8 + E9 | 23 SP | 2 semanas |
| Sprint 5 | E10 + E11 | 19 SP | 2 semanas |
| **Total** | **11 Epics** | **125 SP** | **~10 semanas** |

---

## Definição de Done (DoD)

Para cada story ser considerada "Done":

- [ ] Código implementado e funcional
- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] RLS policies testadas (usuário A não vê dados de B)
- [ ] UI responsiva (desktop + tablet)
- [ ] Dark mode funcionando
- [ ] Sem erros no console
- [ ] Code review feito
