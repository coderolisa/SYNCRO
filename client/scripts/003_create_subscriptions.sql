-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_account_id uuid references public.email_accounts(id) on delete set null,
  name text not null,
  provider text not null,
  price numeric(10, 2) not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'quarterly')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'paused', 'trial')),
  next_billing_date date,
  category text,
  logo_url text,
  website_url text,
  notes text,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_email_account_id_idx on public.subscriptions(email_account_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
