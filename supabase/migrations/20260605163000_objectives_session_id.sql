alter table public.objectives
  add column if not exists session_id uuid references public.live_sessions(id) on delete set null;

create index if not exists objectives_student_week_session_idx
  on public.objectives(student_id, week_number, session_id);
