create table contatos (
  id          uuid primary key default gen_random_uuid(),
  oficina_id  uuid references oficinas(id) on delete cascade,
  tipo        text,
  conteudo    text,
  autor       uuid references profiles(id),
  criado_em   timestamptz default now()
);

alter table contatos enable row level security;

-- Todos os autenticados podem ler
create policy "contatos_select" on contatos
  for select using (auth.role() = 'authenticated');

-- Apenas founder e sócio podem escrever
create policy "contatos_insert" on contatos
  for insert with check (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );

create policy "contatos_update" on contatos
  for update using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );

create policy "contatos_delete" on contatos
  for delete using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );
