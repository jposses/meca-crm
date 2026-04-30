create table oficinas (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  bairro          text,
  cidade          text,
  contato         text,
  responsavel     text,
  estagio         text not null default 'prospectando',
  obs             text,
  criado_por      uuid references profiles(id),
  atualizado_por  uuid references profiles(id),
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- Trigger para atualizar atualizado_em automaticamente
create or replace function update_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger oficinas_atualizado_em
  before update on oficinas
  for each row execute function update_atualizado_em();

alter table oficinas enable row level security;

-- Todos os autenticados podem ler
create policy "oficinas_select" on oficinas
  for select using (auth.role() = 'authenticated');

-- Apenas founder e sócio podem escrever
create policy "oficinas_insert" on oficinas
  for insert with check (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );

create policy "oficinas_update" on oficinas
  for update using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );

create policy "oficinas_delete" on oficinas
  for delete using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );
