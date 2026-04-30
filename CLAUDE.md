# Meca CRM — Contexto do Projeto

## O que é o Meca

O Meca é um marketplace que conecta motoristas a oficinas mecânicas de confiança.
Funciona como um sistema operacional para oficinas + canal de aquisição de clientes.

### Proposta de valor

**Para motoristas:**
- Encontrar oficinas próximas e confiáveis
- Escolher diretamente a oficina antes de solicitar o serviço
- Solicitar serviços, receber orçamentos, agendar e pagar pelo app

**Para oficinas:**
- Receber clientes com intenção real de serviço (sem concorrência simultânea)
- Gerenciar agenda, orçamentos e execução em um único sistema
- Aumentar faturamento sem depender de marketing próprio

### Modelo de negócio

- Taxa de 12% sobre o valor líquido de cada serviço executado
- Pagamento processado via Asaas com split automático
- Comparáveis: Uber (demanda), iFood (gestão de pedidos), OpenTable (agendamento)

### Tom de comunicação do produto

Direto, prático, sem enrolação, focado em resultado, linguagem simples.

---

## O que é este projeto

CRM interno de prospecção de oficinas para o time do Meca.
Usado pelo founder, sócio e dev para gerir o pipeline de cadastro de novas oficinas.

---

## Stack

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript (strict)
- **Banco de dados**: Supabase (PostgreSQL + Auth + Realtime)
- **Estilo**: Tailwind CSS
- **Deploy**: Vercel
- **IA**: API do Claude (claude-sonnet-4-20250514) para assistente de prospecção

---

## Usuários do CRM

| Usuário | Role | Permissões |
|---------|------|------------|
| Founder | `founder` | Leitura e escrita total |
| Sócio | `socio` | Leitura e escrita total |
| Dev | `dev` | Somente leitura |

Autenticação via Supabase Auth com magic link (email).
Roles definidos na tabela `profiles` e aplicados via RLS policies no Supabase.

---

## Banco de dados

### Tabela: `oficinas`

```sql
id              uuid primary key default gen_random_uuid()
nome            text not null
bairro          text
cidade          text
contato         text              -- WhatsApp ou telefone
responsavel     text              -- Nome do dono/contato
estagio         text not null     -- ver estágios abaixo
obs             text              -- Notas livres
criado_por      uuid references profiles(id)
atualizado_por  uuid references profiles(id)
criado_em       timestamptz default now()
atualizado_em   timestamptz default now()
```

### Tabela: `contatos`

```sql
id          uuid primary key default gen_random_uuid()
oficina_id  uuid references oficinas(id) on delete cascade
tipo        text     -- 'whatsapp' | 'ligacao' | 'email' | 'presencial' | 'outro'
conteudo    text     -- resumo ou texto do contato
autor       uuid references profiles(id)
criado_em   timestamptz default now()
```

### Tabela: `tarefas`

```sql
id          uuid primary key default gen_random_uuid()
oficina_id  uuid references oficinas(id) on delete cascade
descricao   text not null
prazo       date
feita       boolean default false
responsavel uuid references profiles(id)
criado_em   timestamptz default now()
```

### Tabela: `profiles`

```sql
id      uuid primary key references auth.users(id)
nome    text
role    text not null default 'dev'   -- 'founder' | 'socio' | 'dev'
```

---

## Estágios do funil

Ordem: `prospectando` → `contato` → `negociando` → `cadastrado` → `perdido`

- **prospectando**: oficina identificada, ainda sem contato
- **contato**: primeiro contato realizado
- **negociando**: conversas avançadas, em negociação
- **cadastrado**: oficina cadastrada no Meca ✓
- **perdido**: não quis ou não respondeu

---

## Funcionalidades do CRM

### 1. Dashboard / Métricas
- Total de oficinas por estágio (contadores no topo)
- Funil de conversão com percentuais entre estágios
- Oficinas adicionadas nos últimos 7 dias
- Taxa de conversão geral (prospectando → cadastrado)

### 2. Kanban do funil
- Colunas: Prospectando / Contato / Negociando / Cadastrado / Perdido
- Cards arrastáveis entre colunas (drag and drop)
- Card exibe: nome, bairro, responsável, última atividade
- Ao clicar no card, abre o painel da oficina

### 3. Painel da oficina
- Dados cadastrais (editáveis por founder e sócio)
- Seletor de estágio
- Histórico de contatos (timeline cronológica)
- Tarefas vinculadas (com prazo e responsável)
- Seção do Agente IA

### 4. Histórico de contatos
- Registro de cada interação com a oficina
- Tipo do contato, conteúdo, autor e data
- Qualquer usuário com permissão de escrita pode adicionar

### 5. Tarefas
- Criar tarefas vinculadas a uma oficina
- Definir prazo e responsável
- Marcar como feita
- Listagem de tarefas pendentes no dashboard

### 6. Agente IA (assistente de prospecção)
- Chat embutido no painel de cada oficina
- Contexto automático: nome, bairro, estágio, histórico, obs
- Atalhos rápidos:
  - Gerar primeira abordagem (WhatsApp)
  - Gerar follow-up
  - Montar pitch de valor do Meca
  - Contornar objeções
  - Sugerir próximo passo
- Histórico de conversa mantido durante a sessão
- Usa `claude-sonnet-4-20250514` via API

---

## Estrutura de pastas esperada

```
/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (crm)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── funil/page.tsx
│   │   └── oficinas/[id]/page.tsx
│   └── api/
│       └── ai/route.ts          -- endpoint para o agente IA
├── components/
│   ├── kanban/
│   ├── oficina/
│   ├── contatos/
│   ├── tarefas/
│   └── agente/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── types.ts
├── supabase/
│   └── migrations/
└── CLAUDE.md
```

---

## Convenções de código

- Usar named exports, nunca default exports em componentes
- Preferir `interface` a `type` para objetos
- Todos os componentes devem ser funcionais (sem classes)
- Usar `async/await`, nunca `.then()` puro
- Nunca modificar arquivos em `supabase/migrations/` diretamente
- Manter componentes abaixo de 150 linhas; extrair se necessário
- Sempre tipar retornos de funções assíncronas
- Escrever comentários em português

---

## Agent Teams — Papéis e responsabilidades

Este projeto usa Agent Teams do Claude Code. Os papéis abaixo devem ser respeitados para evitar conflitos de arquivo.

### `architect`
**Responsabilidade:** Fundação do projeto.
- Scaffold inicial com `create-next-app`
- Configuração do Supabase (cliente, servidor, middleware)
- Criação das migrations SQL (todas as 4 tabelas + RLS policies)
- Configuração de auth com magic link
- Definição de tipos globais em `lib/types.ts`
- **NÃO toca em:** componentes de UI, queries de dados, integração IA

### `ui-builder`
**Responsabilidade:** Telas e componentes visuais.
- Aguarda o `architect` finalizar antes de começar
- Layout do CRM, sidebar de navegação
- Dashboard com métricas e contadores
- Kanban com drag and drop
- Painel da oficina (estrutura visual)
- Componentes de histórico e tarefas
- **NÃO toca em:** lógica de dados, chamadas ao Supabase, integração IA

### `data-layer`
**Responsabilidade:** Dados e lógica de negócio.
- Aguarda o `architect` finalizar antes de começar
- Todas as queries e mutations do Supabase
- Server actions para criar/editar/deletar oficinas, contatos e tarefas
- Hook de realtime para sincronização entre usuários
- Lógica de cálculo de métricas do funil
- **NÃO toca em:** componentes de UI, integração IA

### `ai-agent`
**Responsabilidade:** Assistente de prospecção com IA.
- Aguarda `architect` e `data-layer` finalizarem
- Endpoint `/api/ai/route.ts`
- Componente de chat embutido no painel da oficina
- Sistema de prompt com contexto da oficina injetado automaticamente
- Atalhos rápidos de prospecção
- **NÃO toca em:** outras partes do sistema

---

## Prompt de arranque para o lead

Use este prompt no Claude Code para iniciar o agent team:

```
Cria um agent team para construir o CRM do Meca conforme definido no CLAUDE.md.

Spawn 4 teammates com os seguintes papéis:
- "architect": scaffold Next.js, Supabase, auth e tipos globais
- "ui-builder": aguarda architect, constrói todas as telas e componentes
- "data-layer": aguarda architect, implementa queries, mutations e realtime
- "ai-agent": aguarda architect e data-layer, implementa assistente de prospecção

Require plan approval antes de cada teammate começar a implementar.
Cada teammate deve ler o CLAUDE.md antes de iniciar seu trabalho.
Evite conflitos de arquivo: cada agente é dono de sua área conforme definido no CLAUDE.md.
```