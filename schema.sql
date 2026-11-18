-- Run this entire file in Supabase SQL Editor for your NEW project.
-- Each account can only access its own earnings and expenses.

create extension if not exists pgcrypto;

create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount > 0),
  received numeric(12,2) not null default 0 check (received >= 0 and received <= amount),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount > 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.earnings enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "Users manage own earnings" on public.earnings;
create policy "Users manage own earnings"
on public.earnings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own expenses" on public.expenses;
create policy "Users manage own expenses"
on public.expenses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists earnings_user_created_idx on public.earnings(user_id, created_at desc);
create index if not exists expenses_user_created_idx on public.expenses(user_id, created_at desc);

-- Important: Expenses are private to the account owner through Row Level Security.
-- Do not expose the Supabase service_role key in this website.
