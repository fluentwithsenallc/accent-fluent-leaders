alter table public.admin_settings
  add column if not exists application_accept_subject text,
  add column if not exists application_accept_body text,
  add column if not exists application_reject_subject text,
  add column if not exists application_reject_body text;
