alter table public.students
  add column if not exists cefr_level public.cefr_level;
