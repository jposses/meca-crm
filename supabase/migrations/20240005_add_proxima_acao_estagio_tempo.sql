-- Campos de próxima ação obrigatória
alter table oficinas
  add column if not exists proxima_acao_tipo  text,
  add column if not exists proxima_acao_data  date,
  add column if not exists proxima_acao_obs   text;

-- Tempo em cada etapa
alter table oficinas
  add column if not exists estagio_entrou_em  timestamptz default now();

-- Contatos adicionais
alter table oficinas
  add column if not exists instagram  text;

-- Retroativo: usa atualizado_em como aproximação para registros existentes
update oficinas
  set estagio_entrou_em = atualizado_em
  where estagio_entrou_em is null;
