-- Create email_accounts table for multi-email support
create table if not exists public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email varchar(255) not null,
  provider varchar(50) not null default 'gmail',
  is_primary boolean default false,
  connected_at timestamp with time zone default now(),
  last_scanned timestamp with time zone,
  access_token text,
  refresh_token text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, email)
);

-- Enable RLS
alter table public.email_accounts enable row level security;

-- RLS Policies for email_accounts
create policy "email_accounts_select_own"
  on public.email_accounts for select
  using (auth.uid() = user_id);

create policy "email_accounts_insert_own"
  on public.email_accounts for insert
  with check (auth.uid() = user_id);

create policy "email_accounts_update_own"
  on public.email_accounts for update
  using (auth.uid() = user_id);

create policy "email_accounts_delete_own"
  on public.email_accounts for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists email_accounts_user_id_idx on public.email_accounts(user_id);
create index if not exists email_accounts_email_idx on public.email_accounts(email);
