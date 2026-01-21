-- Create teams table for enterprise
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.teams enable row level security;

-- RLS Policies for teams
create policy "teams_select_member"
  on public.teams for select
  using (
    auth.uid() = owner_id or
    exists (
      select 1 from public.team_members
      where team_id = id and user_id = auth.uid()
    )
  );

create policy "teams_insert_own"
  on public.teams for insert
  with check (auth.uid() = owner_id);

create policy "teams_update_owner"
  on public.teams for update
  using (auth.uid() = owner_id);

create policy "teams_delete_owner"
  on public.teams for delete
  using (auth.uid() = owner_id);

-- Create team_members table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
  joined_at timestamp with time zone default now(),
  unique(team_id, user_id)
);

-- Enable RLS
alter table public.team_members enable row level security;

-- RLS Policies for team_members
create policy "team_members_select_member"
  on public.team_members for select
  using (
    exists (
      select 1 from public.teams
      where id = team_id and (owner_id = auth.uid() or user_id = auth.uid())
    )
  );

create policy "team_members_insert_admin"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.teams
      where id = team_id and owner_id = auth.uid()
    )
  );

create policy "team_members_delete_admin"
  on public.team_members for delete
  using (
    exists (
      select 1 from public.teams
      where id = team_id and owner_id = auth.uid()
    )
  );

-- Indexes
create index if not exists team_members_team_id_idx on public.team_members(team_id);
create index if not exists team_members_user_id_idx on public.team_members(user_id);
