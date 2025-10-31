-- Supabase schema for Focus Academy class-based assessments
-- Run these statements in the Supabase SQL editor

create extension if not exists "uuid-ossp";

drop view if exists public.assignment_summary;
drop view if exists public.assignment_overview;
drop table if exists public.assignment_assignees cascade;
drop table if exists public.submissions cascade;
drop table if exists public.assignments cascade;
drop table if exists public.class_students cascade;
drop table if exists public.classes cascade;

-- Teacher profiles are backed by Supabase Auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  email text unique,
  role text not null default 'teacher' check (role = 'teacher'),
  created_at timestamptz not null default now()
);

-- Classes created by a teacher with a shareable join code
create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  class_name text not null,
  join_code text not null unique,
  students text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_classes_teacher on public.classes (teacher_id);
create index if not exists idx_classes_join_code on public.classes (join_code);

-- Assignments published for a class using an existing FocusQuiz module
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.classes (id) on delete cascade,
  module_id text not null,
  module_title text not null,
  quiz_config jsonb,
  status text not null default 'published' check (status in ('draft', 'published', 'closed')),
  date_assigned timestamptz not null default now(),
  due_at timestamptz,
  notes text
);

create index if not exists idx_assignments_class on public.assignments (class_id);
create index if not exists idx_assignments_status on public.assignments (status);

-- Submissions that arrive from anonymous student attempts
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  class_code text not null,
  student_name text not null,
  score numeric(5, 2),
  correct integer,
  count integer,
  time_spent integer,
  status text not null default 'submitted' check (status in ('submitted', 'completed', 'reviewed')),
  details jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_name)
);

create index if not exists idx_submissions_assignment on public.submissions (assignment_id);
create index if not exists idx_submissions_class on public.submissions (class_id);
create index if not exists idx_submissions_student on public.submissions (student_name);

-- Helper view to show assignments with class metadata
create or replace view public.assignment_overview as
  select
    a.id,
    a.class_id,
    c.class_name,
    c.join_code,
    a.module_id,
    a.module_title,
    a.quiz_config,
    a.status,
    a.date_assigned,
    a.due_at,
    a.notes
  from public.assignments a
  join public.classes c on c.id = a.class_id;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;

-- Profiles policies
create policy if not exists "Own profile" on public.profiles
  for select using (auth.uid() = id);

create policy if not exists "Insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy if not exists "Update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Classes policies
create policy if not exists "Teachers manage classes" on public.classes
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

create policy if not exists "Public can read classes" on public.classes
  for select using (true);

-- Assignments policies
create policy if not exists "Teachers manage assignments" on public.assignments
  for all using (
    exists (
      select 1
      from public.classes c
      where c.id = assignments.class_id
        and c.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.classes c
      where c.id = assignments.class_id
        and c.teacher_id = auth.uid()
    )
  );

create policy if not exists "Public read published assignments" on public.assignments
  for select using (status = 'published');

-- Submissions policies
create policy if not exists "Teachers review submissions" on public.submissions
  for select using (
    exists (
      select 1
      from public.classes c
      where c.id = submissions.class_id
        and c.teacher_id = auth.uid()
    )
  );

create policy if not exists "Teachers update submissions" on public.submissions
  for update using (
    exists (
      select 1
      from public.classes c
      where c.id = submissions.class_id
        and c.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.classes c
      where c.id = submissions.class_id
        and c.teacher_id = auth.uid()
    )
  );

create policy if not exists "Public submit results" on public.submissions
  for insert with check (
    exists (
      select 1
      from public.assignments a
      join public.classes c on c.id = a.class_id
      where a.id = submissions.assignment_id
        and c.id = submissions.class_id
        and c.join_code = submissions.class_code
        and a.status = 'published'
    )
  );

create policy if not exists "Public read own submission" on public.submissions
  for select using (
    exists (
      select 1
      from public.classes c
      where c.id = submissions.class_id
    )
  );
