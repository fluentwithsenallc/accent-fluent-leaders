alter table public.applications
  add column if not exists trial_week_interest text
    check (trial_week_interest in ('yes_trial', 'ready_now', 'discuss_on_call'));
