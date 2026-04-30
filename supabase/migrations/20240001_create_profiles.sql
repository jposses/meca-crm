create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'dev'
);

alter table profiles enable row level security;

-- Cada usuário lê apenas o próprio perfil
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

-- Founder e sócio podem atualizar qualquer perfil
create policy "profiles_update_admin" on profiles
  for update using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('founder', 'socio')
    )
  );

-- Criação automática de perfil ao cadastrar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nome, role)
  values (new.id, new.raw_user_meta_data->>'nome', 'dev');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
