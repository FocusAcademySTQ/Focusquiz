-- Supabase schema for Focus Academy assignments
-- Run in SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  email text unique,
  role text not null check (role in ('teacher', 'student')),
  created_at timestamptz not null default now()
);

-- Assignments created by teachers
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  module_id text,
  due_date date,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table if exists public.assignments
  add column if not exists module_id text;

-- Relation between assignments and students
create table if not exists public.assignment_assignees (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'submitted', 'completed')),
  assigned_at timestamptz not null default now(),
  unique (assignment_id, profile_id)
);

-- Submissions from the students
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  content text,
  grade numeric(5,2),
  feedback text,
  unique (assignment_id, profile_id)
);

-- Helper view for quickly checking assignments with assignees
create or replace view public.assignment_summary as
  select
    a.id,
    a.title,
    a.module_id,
    a.due_date,
    a.created_at,
    a.created_by,
    json_agg(json_build_object(
      'profile_id', aa.profile_id,
      'status', aa.status,
      'submitted_at', s.submitted_at,
      'grade', s.grade
    ) order by aa.assigned_at) filter (where aa.id is not null) as assignees
  from public.assignments a
  left join public.assignment_assignees aa on aa.assignment_id = a.id
  left join public.submissions s on s.assignment_id = aa.assignment_id and s.profile_id = aa.profile_id
  group by a.id;

-- RLS -------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_assignees enable row level security;
alter table public.submissions enable row level security;

-- Profile policies
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Teachers can view all profiles" on public.profiles
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  ));

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Assignment policies
create policy "Teachers read assignments" on public.assignments
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  ));

create policy "Teachers insert assignments" on public.assignments
  for insert with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  ) and auth.uid() = created_by);

create policy "Teachers update their assignments" on public.assignments
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'teacher'
        and created_by = auth.uid()
    )
  ) with check (created_by = auth.uid());

create policy "Teachers delete their assignments" on public.assignments
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'teacher'
        and created_by = auth.uid()
    )
  );

create policy "Students can see assigned work" on public.assignments
  for select using (exists (
    select 1 from public.assignment_assignees aa
    where aa.assignment_id = assignments.id
      and aa.profile_id = auth.uid()
  ));

-- Assignment assignees policies
create policy "Teachers manage assignees" on public.assignment_assignees
  for all using (
    exists (
      select 1
      from public.assignments a
      join public.profiles p on p.id = auth.uid()
      where a.id = assignment_assignees.assignment_id
        and p.role = 'teacher'
        and a.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.assignments a
      join public.profiles p on p.id = auth.uid()
      where a.id = assignment_assignees.assignment_id
        and p.role = 'teacher'
        and a.created_by = auth.uid()
    )
  );

create policy "Students read their assignments" on public.assignment_assignees
  for select using (profile_id = auth.uid());

create policy "Students update their assignment status" on public.assignment_assignees
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Submissions policies
create policy "Students manage own submissions" on public.submissions
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "Teachers view submissions for their assignments" on public.submissions
  for select using (
    exists (
      select 1
      from public.assignments a
      join public.profiles p on p.id = auth.uid()
      where a.id = submissions.assignment_id
        and p.role = 'teacher'
        and a.created_by = auth.uid()
    )
  );
