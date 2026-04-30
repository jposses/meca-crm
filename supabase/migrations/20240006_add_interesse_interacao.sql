alter table oficinas
  add column if not exists nivel_interesse  text check (nivel_interesse in ('alto', 'medio', 'baixo')),
  add column if not exists ultimo_contato_em timestamptz;
