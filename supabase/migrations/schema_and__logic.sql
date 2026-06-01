-- ============================================================
--  FLUENT WITH SENA — Complete Supabase Schema
--  Covers: Auth, Students, Programs, Sessions (Zoom),
--          Check-ins, Journals, Milestones, Courses,
--          Content Library, Objectives, Applications,
--          Notifications, Settings
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 0. ROLES & AUTH PROFILES
-- ============================================================

-- Extends Supabase auth.users
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('admin','student')) default 'student',
  first_name    text,
  last_name     text,
  email         text unique not null,
  whatsapp      text,
  phone         text,
  avatar_url    text,
  timezone      text default 'America/New_York',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 1. PROGRAM TIERS
-- ============================================================

create table public.program_tiers (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,          -- 'Launch', 'Build', 'Lead'
  duration_weeks  int  not null,          -- 12, 16, 20
  sessions_per_week int not null default 4,
  description     text,
  price_usd       numeric(10,2),
  created_at      timestamptz default now()
);

insert into public.program_tiers (name, duration_weeks, sessions_per_week, price_usd) values
  ('Launch', 12, 4, 500),
  ('Build',  16, 4, 650),
  ('Lead',   20, 4, 800);

-- ============================================================
-- 2. APPLICATIONS (landing page form)
-- ============================================================

create table public.applications (
  id                   uuid primary key default uuid_generate_v4(),
  full_name            text not null,
  email                text not null,
  linkedin_url         text,
  "current_role"       text,
  industry             text,
  english_level        text check (english_level in ('beginner','intermediate','advanced')),
  primary_goal         text,
  motivation           text,
  preferred_start      text check (preferred_start in ('within_30_days','1_3_months','3_plus_months','not_sure')),
  weekly_hours         text check (weekly_hours in ('3_4','4_5','5_plus')),
  referral_source      text,
  additional_notes     text,
  status               text not null default 'pending'
                         check (status in ('pending','reviewed','accepted','rejected')),
  reviewed_by          uuid references public.profiles(id),
  reviewed_at          timestamptz,
  created_at           timestamptz default now()
);

-- ============================================================
-- 3. STUDENTS (enrolled clients)
-- ============================================================

create table public.students (
  id              uuid primary key references public.profiles(id) on delete cascade,
  tier_id         uuid references public.program_tiers(id),
  industry        text,
  current_week    int not null default 1,
  start_date      date,
  end_date        date,
  status          text not null default 'active'
                    check (status in ('active','paused','completed','cancelled')),
  confidence_score numeric(3,1),          -- 0.0–10.0, latest check-in value
  application_id  uuid references public.applications(id),
  notes           text,                   -- admin internal notes
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- 4. ZOOM INTEGRATION
-- ============================================================

-- Store per-user Zoom OAuth tokens (encrypted at rest via Supabase Vault
--  or managed via Supabase secrets; store tokens here post-OAuth)
create table public.zoom_credentials (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  access_token    text not null,
  refresh_token   text not null,
  token_type      text default 'Bearer',
  expires_at      timestamptz not null,
  zoom_user_id    text,
  zoom_email      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(profile_id)
);

-- ============================================================
-- 5. LIVE SESSIONS
-- ============================================================

create table public.live_sessions (
  id                uuid primary key default uuid_generate_v4(),
  student_id        uuid not null references public.students(id) on delete cascade,
  week_number       int not null,
  session_number    int not null,         -- 1-4 within the week
  scheduled_at      timestamptz not null,
  duration_minutes  int not null default 60,
  focus_topic       text,
  status            text not null default 'scheduled'
                      check (status in ('scheduled','live','completed','cancelled','no_show')),
  -- Zoom fields
  zoom_meeting_id   text,
  zoom_join_url     text,
  zoom_start_url    text,
  zoom_password     text,
  zoom_uuid         text,                 -- populated after meeting ends
  -- Recording (if Zoom cloud recording enabled)
  recording_url     text,
  recording_expires_at timestamptz,
  -- Session notes (admin fills after session)
  session_notes     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index on public.live_sessions(student_id);
create index on public.live_sessions(scheduled_at);
create index on public.live_sessions(status);

-- ============================================================
-- 6. RECORDINGS (standalone recording history view)
-- ============================================================

-- live_sessions.recording_url covers Zoom cloud recordings.
-- This table stores any additional uploaded recordings / replays.
create table public.recordings (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid references public.live_sessions(id) on delete set null,
  student_id      uuid not null references public.students(id) on delete cascade,
  title           text not null,
  recorded_at     timestamptz,
  duration_seconds int,
  video_url       text,
  transcript_text text,
  created_at      timestamptz default now()
);

create index on public.recordings(student_id);

-- ============================================================
-- 7. CHECK-INS (weekly student submissions)
-- ============================================================

create table public.check_ins (
  id                  uuid primary key default uuid_generate_v4(),
  student_id          uuid not null references public.students(id) on delete cascade,
  week_number         int not null,
  submitted_at        timestamptz default now(),
  mood                text,               -- 'on_fire','lit_up','meh','struggling', etc.
  mood_emoji          text,               -- emoji stored as text
  confidence_score    numeric(3,1) check (confidence_score between 0 and 10),
  win_of_week         text,
  biggest_struggle    text,
  first_this_week     text,              -- "a first" field
  note_for_next       text,             -- note for next session
  -- Admin response
  admin_note          text,
  reviewed_by         uuid references public.profiles(id),
  reviewed_at         timestamptz,
  status              text not null default 'pending'
                        check (status in ('pending','reviewed')),
  created_at          timestamptz default now()
);

create index on public.check_ins(student_id);
create index on public.check_ins(status);
create index on public.check_ins(submitted_at desc);

-- ============================================================
-- 8. STUDENT JOURNALS (Phrase Bank, Questions, Session Notes)
-- ============================================================

create table public.journal_entries (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.students(id) on delete cascade,
  entry_type      text not null check (entry_type in ('phrase_bank','question','session_note')),
  week_number     int,
  topic           text,                  -- e.g. 'Negotiation', 'Negatives'
  content         text not null,         -- the phrase, question, or note
  context_note    text,                  -- e.g. "Agreeing without sounding weak"
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index on public.journal_entries(student_id, entry_type);

-- ============================================================
-- 9. MILESTONES
-- ============================================================

create table public.milestones (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.students(id) on delete cascade,
  title           text not null,
  description     text,
  target_week     int,
  target_date     date,
  completed       boolean not null default false,
  completed_at    timestamptz,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index on public.milestones(student_id);

-- Overall fluency goal (the "finish line" card)
create table public.student_goals (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.students(id) on delete cascade unique,
  fluency_goal    text not null,          -- "Speak Spanish with confidence..."
  day_one_question text,                 -- recorded at intake
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- 10. OBJECTIVES (weekly, assigned by admin)
-- ============================================================

create table public.objectives (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.students(id) on delete cascade,
  week_number     int not null,
  week_label      text,                  -- e.g. "Week 5 (May 26 – Jun 1)"
  focus_area      int not null default 1 check (focus_area between 1 and 5),
  focus_title     text not null,
  context_for_student text,
  check_in_context text,                 -- admin context pulled from last check-in
  completed       boolean not null default false,
  completed_at    timestamptz,
  sent_at         timestamptz,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.objective_items (
  id              uuid primary key default uuid_generate_v4(),
  objective_id    uuid not null references public.objectives(id) on delete cascade,
  item_text       text not null,
  completed       boolean not null default false,
  completed_at    timestamptz,
  sort_order      int default 0
);

create index on public.objectives(student_id, week_number);

-- ============================================================
-- 11. COURSES & LESSONS (Course Library)
-- ============================================================

create table public.courses (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  category        text,                  -- 'Workplace Communication','Speaking Confidence', etc.
  description     text,
  thumbnail_url   text,
  avg_lesson_minutes int,
  status          text not null default 'draft'
                    check (status in ('published','draft')),
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.units (
  id              uuid primary key default uuid_generate_v4(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  title           text not null,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

create table public.lessons (
  id              uuid primary key default uuid_generate_v4(),
  unit_id         uuid not null references public.units(id) on delete cascade,
  title           text not null,
  description     text,
  video_url       text,
  duration_seconds int,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Student progress through lessons
create table public.student_lesson_progress (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.students(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  status          text not null default 'not_started'
                    check (status in ('not_started','in_progress','completed')),
  progress_pct    int default 0 check (progress_pct between 0 and 100),
  last_watched_at timestamptz,
  completed_at    timestamptz,
  unique(student_id, lesson_id)
);

create index on public.student_lesson_progress(student_id);

-- ============================================================
-- 12. CONTENT LIBRARY (Immersion Library)
-- ============================================================

create type public.content_media_type as enum
  ('show','movie','music','podcast','book','reading_source','playlist');

create type public.cefr_level as enum
  ('A1','A2','B1','B2','C1','C2','A2_B1','B1_B2');

create table public.content_items (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  author_or_host  text,
  media_type      public.content_media_type not null,
  cefr_level      public.cefr_level,
  external_url    text,
  description     text,
  duration_label  text,                  -- e.g. '25 MIN', '1 hr'
  genre_tag       text,                  -- e.g. 'News','Business','ESL'
  playlist_tag    text,                  -- e.g. 'commute','career','unwind'
  thumbnail_url   text,
  is_active       boolean not null default true,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

create index on public.content_items(media_type);
create index on public.content_items(cefr_level);

-- Seed core content library
insert into public.content_items (title, author_or_host, media_type, cefr_level, external_url, genre_tag) values
  ('Friends',               null,               'show',    'A2_B1', 'https://www.netflix.com/title/70153404',      'TV Show'),
  ('The Office',            null,               'show',    'B1_B2', 'https://www.peacocktv.com/stream-tv/the-office', 'TV Show'),
  ('Modern Family',         null,               'show',    'B1_B2', 'https://www.hulu.com/series/modern-family',   'TV Show'),
  ('Ted Lasso',             null,               'show',    'B2',    'https://tv.apple.com/us/show/ted-lasso',       'TV Show'),
  ('Brooklyn Nine-Nine',    null,               'show',    'B1_B2', 'https://www.peacocktv.com/stream-tv/brooklyn-nine-nine', 'TV Show'),
  ('The Daily',             'NYT',              'podcast', 'B2',    'https://open.spotify.com/show/3IM0lmZxpFAY7CwMuv9H4g', 'News'),
  ('How I Built This',      'NPR',              'podcast', 'B2',    'https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun', 'Business'),
  ('TED Talks Daily',       'TED',              'podcast', 'B1_B2', 'https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti', 'Ideas'),
  ('All Ears English',      null,               'podcast', 'B1',    'https://open.spotify.com/show/0VBEKEVFtXCl5HtXJXbcRd', 'ESL'),
  ('Atomic Habits',         'James Clear',      'book',    'B2',    'https://www.amazon.com/dp/0735211299',         'Self-help'),
  ('The Alchemist',         'Paulo Coelho',     'book',    'B1',    'https://www.amazon.com/dp/0061122416',         'Fiction');

-- ============================================================
-- 13. STUDENT DASHBOARD STATS (computed / cached)
-- ============================================================

-- Materialized view for quick dashboard stats per student
create or replace view public.student_dashboard_stats as
select
  s.id                                                     as student_id,
  s.current_week,
  s.confidence_score,
  s.status,
  pt.name                                                  as tier_name,
  pt.duration_weeks,
  pt.sessions_per_week,
  pt.duration_weeks * pt.sessions_per_week                 as total_sessions,
  -- Sessions completed
  (select count(*) from public.live_sessions ls
   where ls.student_id = s.id and ls.status = 'completed') as sessions_completed,
  -- Lessons completed
  (select count(*) from public.student_lesson_progress slp
   where slp.student_id = s.id and slp.status = 'completed') as lessons_completed,
  -- Hours learned (sessions × 60 min)
  (select coalesce(sum(ls.duration_minutes),0) / 60.0
   from public.live_sessions ls
   where ls.student_id = s.id and ls.status = 'completed') as hours_learned,
  -- Next upcoming session
  (select ls.scheduled_at
   from public.live_sessions ls
   where ls.student_id = s.id and ls.status = 'scheduled' and ls.scheduled_at > now()
   order by ls.scheduled_at asc limit 1)                  as next_session_at,
  -- Pending check-in
  (select count(*) from public.check_ins ci
   where ci.student_id = s.id and ci.status = 'pending') as pending_checkins
from public.students s
join public.program_tiers pt on pt.id = s.tier_id;

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  recipient_id    uuid not null references public.profiles(id) on delete cascade,
  type            text not null,          -- 'checkin_submitted','session_reminder', etc.
  title           text not null,
  body            text,
  related_table   text,                  -- e.g. 'check_ins'
  related_id      uuid,
  read            boolean not null default false,
  sent_at         timestamptz default now()
);

create index on public.notifications(recipient_id, read);

-- ============================================================
-- 15. ADMIN SETTINGS
-- ============================================================

create table public.admin_settings (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references public.profiles(id) on delete cascade unique,
  -- Program defaults (overrides program_tiers table defaults per admin)
  launch_weeks    int default 12,
  build_weeks     int default 16,
  lead_weeks      int default 20,
  checkin_day     text default 'Friday',
  checkin_frequency text default 'weekly',
  -- Notification preferences
  notify_new_checkin        boolean default true,
  notify_checkin_overdue_hours int default 48,
  notify_session_reminder_min  int default 30,
  updated_at      timestamptz default now()
);

-- ============================================================
-- 16. ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles                  enable row level security;
alter table public.program_tiers             enable row level security;
alter table public.students                  enable row level security;
alter table public.live_sessions             enable row level security;
alter table public.recordings                enable row level security;
alter table public.check_ins                 enable row level security;
alter table public.journal_entries           enable row level security;
alter table public.milestones                enable row level security;
alter table public.student_goals             enable row level security;
alter table public.objectives                enable row level security;
alter table public.objective_items           enable row level security;
alter table public.student_lesson_progress   enable row level security;
alter table public.notifications             enable row level security;
alter table public.applications              enable row level security;
alter table public.zoom_credentials          enable row level security;
alter table public.admin_settings            enable row level security;
alter table public.content_items             enable row level security;
alter table public.courses                   enable row level security;
alter table public.units                     enable row level security;
alter table public.lessons                   enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
create policy "Users can read own profile"
  on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "Admins can update profiles"
  on public.profiles for update using (public.is_admin());
create policy "Admins can insert profiles"
  on public.profiles for insert with check (public.is_admin());

-- PROGRAM TIERS
create policy "Authenticated users read program tiers"
  on public.program_tiers for select using (auth.role() = 'authenticated');
create policy "Admin manages program tiers"
  on public.program_tiers for all using (public.is_admin()) with check (public.is_admin());

-- STUDENTS: students see own row; admin sees all
create policy "Student sees own record"
  on public.students for select using (id = auth.uid() or public.is_admin());
create policy "Admin manages students"
  on public.students for all using (public.is_admin()) with check (public.is_admin());

-- LIVE SESSIONS
create policy "Student sees own sessions"
  on public.live_sessions for select using (
    student_id = auth.uid() or public.is_admin()
  );
create policy "Admin manages sessions"
  on public.live_sessions for all using (public.is_admin()) with check (public.is_admin());

-- RECORDINGS
create policy "Student sees own recordings"
  on public.recordings for select using (
    student_id = auth.uid() or public.is_admin()
  );
create policy "Admin manages recordings"
  on public.recordings for all using (public.is_admin()) with check (public.is_admin());

-- CHECK-INS
create policy "Student manages own check-ins"
  on public.check_ins for all using (
    student_id = auth.uid() or public.is_admin()
  ) with check (student_id = auth.uid() or public.is_admin());

-- JOURNALS
create policy "Student sees own journals"
  on public.journal_entries for all using (
    student_id = auth.uid() or public.is_admin()
  ) with check (student_id = auth.uid() or public.is_admin());

-- MILESTONES
create policy "Student sees own milestones"
  on public.milestones for select using (
    student_id = auth.uid() or public.is_admin()
  );
create policy "Admin manages milestones"
  on public.milestones for all using (public.is_admin()) with check (public.is_admin());

-- STUDENT GOALS
create policy "Student sees own goal"
  on public.student_goals for select using (
    student_id = auth.uid() or public.is_admin()
  );
create policy "Admin manages goals"
  on public.student_goals for all using (public.is_admin()) with check (public.is_admin());

-- OBJECTIVES
create policy "Student reads own objectives"
  on public.objectives for select using (
    student_id = auth.uid() or public.is_admin()
  );
create policy "Admin manages objectives"
  on public.objectives for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin manages objective items"
  on public.objective_items for all using (public.is_admin()) with check (public.is_admin());
create policy "Student reads objective items"
  on public.objective_items for select using (
    exists (
      select 1 from public.objectives o
      where o.id = objective_id
        and (o.student_id = auth.uid() or public.is_admin())
    )
  );

-- LESSON PROGRESS
create policy "Student manages own progress"
  on public.student_lesson_progress for all using (
    student_id = auth.uid() or public.is_admin()
  ) with check (student_id = auth.uid() or public.is_admin());

-- NOTIFICATIONS
create policy "User reads own notifications"
  on public.notifications for select using (recipient_id = auth.uid());
create policy "Admin inserts notifications"
  on public.notifications for insert with check (public.is_admin() or recipient_id = auth.uid());
create policy "User marks own notifications read"
  on public.notifications for update using (recipient_id = auth.uid());

-- APPLICATIONS: public insert, admin reads
create policy "Anyone can submit application"
  on public.applications for insert with check (true);
create policy "Admin reads applications"
  on public.applications for select using (public.is_admin());
create policy "Admin updates applications"
  on public.applications for update using (public.is_admin());

-- ZOOM CREDENTIALS: own row only
create policy "User manages own Zoom creds"
  on public.zoom_credentials for all using (
    profile_id = auth.uid() or public.is_admin()
  ) with check (profile_id = auth.uid() or public.is_admin());

-- ADMIN SETTINGS
create policy "Admin manages own settings"
  on public.admin_settings for all using (
    profile_id = auth.uid() and public.is_admin()
  ) with check (profile_id = auth.uid() and public.is_admin());

-- CONTENT (public read for authenticated students)
create policy "Authenticated users read content"
  on public.content_items for select using (auth.role() = 'authenticated');
create policy "Admin manages content"
  on public.content_items for all using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated users read courses"
  on public.courses for select using (auth.role() = 'authenticated');
create policy "Admin manages courses"
  on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated users read units"
  on public.units for select using (auth.role() = 'authenticated');
create policy "Admin manages units"
  on public.units for all using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated users read lessons"
  on public.lessons for select using (auth.role() = 'authenticated');
create policy "Admin manages lessons"
  on public.lessons for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 17. TRIGGERS — updated_at timestamps
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.students
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.live_sessions
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.journal_entries
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.milestones
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.student_goals
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.objectives
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.courses
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.lessons
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.zoom_credentials
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.admin_settings
  for each row execute procedure public.set_updated_at();

-- Auto-update student confidence_score when a check-in is submitted
create or replace function public.sync_student_confidence()
returns trigger language plpgsql security definer as $$
begin
  update public.students
  set confidence_score = new.confidence_score,
      updated_at = now()
  where id = new.student_id
    and new.confidence_score is not null;
  return new;
end;
$$;

create trigger sync_confidence_on_checkin
  after insert or update on public.check_ins
  for each row execute procedure public.sync_student_confidence();

-- ============================================================
-- 18. SEED DATA — Sample courses matching the UI
-- ============================================================

insert into public.courses (title, category, description, avg_lesson_minutes, status, sort_order)
values
  ('Business Email Writing',         'Workplace Communication', 'Master professional email communication for the workplace.', 45, 'published', 1),
  ('Leading Meetings in English',    'Speaking Confidence',     'Lead and participate in meetings with authority.',            60, 'published', 2),
  ('Negotiation Language',           'Vocabulary',              'Tactical phrases and frameworks for professional negotiation.', 30, 'published', 3),
  ('Fast Speech Comprehension',      'Fluency Training',        'Train your ear for native-speed English in real contexts.',   20, 'published', 4),
  ('Accent Reduction Fundamentals',  'Pronunciation',           'Clarity and confidence in how you sound.',                   40, 'published', 5),
  ('Phone Calls & Conference Calls', 'Real-World Practice',     'Handle every call without freezing.',                        35, 'published', 6),
  ('Presentations & Public Speaking','Speaking Confidence',     null,                                                          null,'draft',   7),
  ('Small Talk & Networking',        'Social English',          null,                                                          null,'draft',   8);

-- Unit + lessons for Business Email Writing
with c as (select id from public.courses where title = 'Business Email Writing' limit 1),
     u as (insert into public.units (course_id, title, sort_order)
           select c.id, 'Unit 1', 1 from c
           returning id)
insert into public.lessons (unit_id, title, sort_order)
select u.id, t.title, t.ord from u,
  (values
    ('Introduction to Formal Tone', 1),
    ('Structuring Your Email',      2),
    ('Common Mistakes',             3)
  ) as t(title, ord);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
