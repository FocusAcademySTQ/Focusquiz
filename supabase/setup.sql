-- Supabase schema for Focus Academy class-based assessments
-- Run these statements in the Supabase SQL editor

create extension if not exists "uuid-ossp";

drop view if exists public.assignment_summary;
drop view if exists public.assignment_overview;
drop table if exists public.answers cascade;
drop table if exists public.players cascade;
drop table if exists public.games cascade;
drop table if exists public.quiz_questions cascade;
drop table if exists public.quizzes cascade;
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

-- Live quizzes managed inside the teacher portal
create table if not exists public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null,
  description text,
  module_id text,
  default_time_limit integer not null default 20 check (default_time_limit between 5 and 600),
  default_points integer not null default 100 check (default_points >= 0),
  speed_bonus numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quizzes_teacher on public.quizzes (teacher_id);
create index if not exists idx_quizzes_class on public.quizzes (class_id);

create table if not exists public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_index integer not null,
  prompt text not null,
  options jsonb not null,
  correct_option text not null,
  time_limit integer not null default 20 check (time_limit between 5 and 600),
  points integer not null default 100 check (points >= 0),
  speed_bonus numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quiz_id, question_index)
);

create index if not exists idx_quiz_questions_quiz on public.quiz_questions (quiz_id);

drop function if exists public.generate_live_join_code();
create or replace function public.generate_live_join_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  games_ready boolean := to_regclass('public.games') is not null;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet)), 1);
    end loop;
    exit when not games_ready;
    exit when not exists (select 1 from public.games where join_code = code);
  end loop;
  return code;
end;
$$;

create table if not exists public.games (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  join_code text not null unique default public.generate_live_join_code(),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'paused', 'completed', 'cancelled')),
  current_question integer,
  question_started_at timestamptz,
  question_time_limit integer,
  question_points integer default 100 check (question_points >= 0),
  speed_bonus numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists idx_games_teacher on public.games (teacher_id);
create index if not exists idx_games_class on public.games (class_id);
create index if not exists idx_games_status on public.games (status);

create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references public.games (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  join_code text not null,
  name text not null,
  score numeric(10, 2) not null default 0,
  correct_answers integer not null default 0,
  answer_count integer not null default 0,
  last_answered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (game_id, name)
);

create index if not exists idx_players_game on public.players (game_id);
create index if not exists idx_players_join_code on public.players (join_code);

create table if not exists public.answers (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  quiz_question_id uuid references public.quiz_questions (id) on delete set null,
  question_index integer not null,
  choice text not null,
  is_correct boolean,
  time_spent numeric(8, 3),
  points_awarded numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (game_id, player_id, question_index)
);

create index if not exists idx_answers_game on public.answers (game_id);
create index if not exists idx_answers_player on public.answers (player_id);

drop function if exists public.set_current_timestamp();
create or replace function public.set_current_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_timestamp on public.quizzes;
create trigger set_timestamp
before update on public.quizzes
for each row
execute function public.set_current_timestamp();

drop trigger if exists set_timestamp on public.quiz_questions;
create trigger set_timestamp
before update on public.quiz_questions
for each row
execute function public.set_current_timestamp();

drop trigger if exists set_timestamp on public.games;
create trigger set_timestamp
before update on public.games
for each row
execute function public.set_current_timestamp();

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
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

-- Profiles policies
drop policy if exists "Own profile" on public.profiles;
create policy "Own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Classes policies
drop policy if exists "Teachers manage classes" on public.classes;
create policy "Teachers manage classes" on public.classes
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

drop policy if exists "Public can read classes" on public.classes;
create policy "Public can read classes" on public.classes
  for select using (true);

-- Assignments policies
drop policy if exists "Teachers manage assignments" on public.assignments;
create policy "Teachers manage assignments" on public.assignments
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

drop policy if exists "Public read published assignments" on public.assignments;
create policy "Public read published assignments" on public.assignments
  for select using (status = 'published');

-- Submissions policies
drop policy if exists "Teachers review submissions" on public.submissions;
create policy "Teachers review submissions" on public.submissions
  for select using (
    exists (
      select 1
      from public.classes c
      where c.id = submissions.class_id
        and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers update submissions" on public.submissions;
create policy "Teachers update submissions" on public.submissions
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

drop policy if exists "Public submit results" on public.submissions;
create policy "Public submit results" on public.submissions
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

drop policy if exists "Public read own submission" on public.submissions;
create policy "Public read own submission" on public.submissions
  for select using (
    exists (
      select 1
      from public.classes c
      where c.id = submissions.class_id
    )
  );

-- Live quizzes policies
drop policy if exists "Teachers manage live quizzes" on public.quizzes;
create policy "Teachers manage live quizzes" on public.quizzes
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

drop policy if exists "Public read active live quizzes" on public.quizzes;
create policy "Public read active live quizzes" on public.quizzes
  for select using (
    exists (
      select 1
      from public.games g
      where g.quiz_id = quizzes.id
        and g.status in ('waiting', 'active', 'paused')
    )
  );

drop policy if exists "Teachers manage quiz questions" on public.quiz_questions;
create policy "Teachers manage quiz questions" on public.quiz_questions
  for all using (
    exists (
      select 1
      from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and q.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and q.teacher_id = auth.uid()
    )
  );

drop policy if exists "Public read active quiz questions" on public.quiz_questions;
create policy "Public read active quiz questions" on public.quiz_questions
  for select using (
    exists (
      select 1
      from public.games g
      where g.quiz_id = quiz_questions.quiz_id
        and g.status in ('waiting', 'active', 'paused')
    )
  );

drop policy if exists "Teachers manage games" on public.games;
create policy "Teachers manage games" on public.games
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

drop policy if exists "Public read live games" on public.games;
create policy "Public read live games" on public.games
  for select using (status in ('waiting', 'active', 'paused'));

drop policy if exists "Teachers manage players" on public.players;
create policy "Teachers manage players" on public.players
  for all using (
    exists (
      select 1
      from public.games g
      where g.id = players.game_id
        and g.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.games g
      where g.id = players.game_id
        and g.teacher_id = auth.uid()
    )
  );

drop policy if exists "Public join live games" on public.players;
create policy "Public join live games" on public.players
  for insert with check (
    exists (
      select 1
      from public.games g
      where g.id = players.game_id
        and g.join_code = players.join_code
        and g.status in ('waiting', 'active')
    )
  );

drop policy if exists "Public read live players" on public.players;
create policy "Public read live players" on public.players
  for select using (
    exists (
      select 1
      from public.games g
      where g.id = players.game_id
        and g.status in ('waiting', 'active', 'paused')
    )
  );

drop policy if exists "Teachers review live answers" on public.answers;
create policy "Teachers review live answers" on public.answers
  for select using (
    exists (
      select 1
      from public.games g
      where g.id = answers.game_id
        and g.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers update live answers" on public.answers;
create policy "Teachers update live answers" on public.answers
  for update using (
    exists (
      select 1
      from public.games g
      where g.id = answers.game_id
        and g.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.games g
      where g.id = answers.game_id
        and g.teacher_id = auth.uid()
    )
  );

drop policy if exists "Players submit live answers" on public.answers;
create policy "Players submit live answers" on public.answers
  for insert with check (
    exists (
      select 1
      from public.players p
      join public.games g on g.id = p.game_id
      where p.id = answers.player_id
        and g.id = answers.game_id
        and g.status in ('waiting', 'active')
    )
  );
