create table tarefas (
  id          uuid primary key default gen_random_uuid(),
  oficina_id  uuid references oficinas(id) on delete cascade,
  descricao   text not null,
  prazo       date,
  feita       boolean default false,
  responsavel uuid references profiles(id),
  criado_em   timestamptz default now()
);

alter table tarefas enable row level security;

-- Todos os autenticados podem ler
create policy "tarefas_select" on tarefas
  for select using (auth.role() = 'authenticated');

-- Apenas founder e sócio podem escrever
create policy "tarefas_insert" on tarefas
  for insert with check (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );

create policy "tarefas_update" on tarefas
  for update using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );

create policy "tarefas_delete" on tarefas
  for delete using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('founder', 'socio')
    )
  );
