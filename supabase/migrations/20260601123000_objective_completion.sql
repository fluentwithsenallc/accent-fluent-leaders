alter table public.objectives
  add column if not exists completed boolean not null default false,
  add column if not exists completed_at timestamptz;
