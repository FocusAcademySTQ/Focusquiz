-- Supabase Live Mode schema extension for Focusquiz
-- Run this after the base setup (`supabase/setup.sql`) to add the live quiz
-- functionality without dropping existing assignment data.
-- Tip: copy the script from the **Raw** view to avoid `@@` markers.

begin;

-- Live quiz templates authored by teachers
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
  code_exists boolean := false;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet)), 1);
    end loop;

    if not games_ready then
      exit;
    end if;

    execute
      'select exists (select 1 from public.games where join_code = $1)'
      into code_exists
      using code;

    exit when not code_exists;
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

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

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

drop trigger if exists trg_live_answer_calculations on public.answers;
drop trigger if exists trg_live_player_totals on public.answers;
drop function if exists public.refresh_live_player_totals();
drop function if exists public.update_live_player_totals(uuid);
drop function if exists public.calculate_live_answer_details();

create or replace function public.calculate_live_answer_details()
returns trigger
language plpgsql
as $$
declare
  game_record record;
  question_record record;
  default_points numeric(10, 2);
  default_time_limit integer;
  default_speed_bonus numeric(10, 2);
  effective_points numeric(10, 2);
  effective_time_limit integer;
  effective_speed_bonus numeric(10, 2);
  normalized_choice text;
  normalized_correct text;
  elapsed numeric(8, 3);
  remaining numeric(10, 3);
  bonus numeric(12, 4);
  awarded numeric(12, 4);
begin
  if new.game_id is null or new.player_id is null then
    new.is_correct := null;
    new.points_awarded := 0;
    return new;
  end if;

  select
    g.quiz_id,
    g.question_points,
    g.question_time_limit,
    g.speed_bonus
  into game_record
  from public.games g
  where g.id = new.game_id;

  if not found then
    new.is_correct := null;
    new.points_awarded := 0;
    return new;
  end if;

  default_points := coalesce(game_record.question_points, 100);
  default_time_limit := coalesce(game_record.question_time_limit, 20);
  default_speed_bonus := coalesce(game_record.speed_bonus, 0);

  if new.quiz_question_id is not null then
    select
      q.correct_option,
      q.points,
      q.time_limit,
      q.speed_bonus
    into question_record
    from public.quiz_questions q
    where q.id = new.quiz_question_id;
  end if;

  if question_record.correct_option is null then
    select
      q.correct_option,
      q.points,
      q.time_limit,
      q.speed_bonus
    into question_record
    from public.quiz_questions q
    where q.quiz_id = game_record.quiz_id
      and q.question_index = new.question_index
    limit 1;
  end if;

  normalized_correct := upper(trim(coalesce(question_record.correct_option, '')));
  normalized_choice := upper(trim(coalesce(new.choice::text, '')));
  new.choice := normalized_choice;

  effective_points := coalesce(question_record.points, default_points, 0);
  if effective_points < 0 then
    effective_points := 0;
  end if;

  effective_time_limit := coalesce(question_record.time_limit, default_time_limit);
  if effective_time_limit is not null and effective_time_limit < 0 then
    effective_time_limit := null;
  end if;

  effective_speed_bonus := coalesce(question_record.speed_bonus, default_speed_bonus, 0);
  if effective_speed_bonus < 0 then
    effective_speed_bonus := 0;
  end if;

  new.is_correct := normalized_correct <> '' and normalized_choice <> '' and normalized_choice = normalized_correct;

  elapsed := new.time_spent;
  if elapsed is null and effective_time_limit is not null then
    elapsed := effective_time_limit;
  end if;
  if elapsed is not null then
    if elapsed < 0 then
      elapsed := 0;
    end if;
    if effective_time_limit is not null then
      elapsed := least(elapsed, effective_time_limit);
    end if;
  end if;

  remaining := 0;
  if effective_time_limit is not null and elapsed is not null then
    remaining := greatest(0, effective_time_limit - elapsed);
  end if;

  bonus := 0;
  if new.is_correct and effective_speed_bonus > 0 and remaining > 0 then
    bonus := remaining * effective_speed_bonus;
  end if;

  if new.is_correct then
    awarded := effective_points + bonus;
  else
    awarded := 0;
  end if;

  new.points_awarded := round(coalesce(awarded, 0)::numeric, 2);

  return new;
end;
$$;

create or replace function public.update_live_player_totals(player_uuid uuid)
returns void
language plpgsql
as $$
declare
  totals record;
begin
  if player_uuid is null then
    return;
  end if;

  select
    coalesce(sum(a.points_awarded), 0) as total_score,
    coalesce(sum(case when a.is_correct then 1 else 0 end), 0) as total_correct,
    count(a.id) as total_answers,
    max(a.created_at) as last_answered
  into totals
  from public.answers a
  where a.player_id = player_uuid;

  update public.players p
  set
    score = round(coalesce(totals.total_score, 0)::numeric, 2),
    correct_answers = coalesce(totals.total_correct, 0),
    answer_count = coalesce(totals.total_answers, 0),
    last_answered_at = totals.last_answered
  where p.id = player_uuid;
end;
$$;

create or replace function public.refresh_live_player_totals()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.update_live_player_totals(old.player_id);
  elsif tg_op = 'UPDATE' then
    if new.player_id is distinct from old.player_id then
      perform public.update_live_player_totals(old.player_id);
    end if;
    perform public.update_live_player_totals(new.player_id);
  else
    perform public.update_live_player_totals(new.player_id);
  end if;
  return null;
end;
$$;

create trigger trg_live_answer_calculations
before insert or update on public.answers
for each row
execute function public.calculate_live_answer_details();

create trigger trg_live_player_totals
after insert or update or delete on public.answers
for each row
execute function public.refresh_live_player_totals();

commit;
