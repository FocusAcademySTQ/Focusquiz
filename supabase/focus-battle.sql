-- Focus Battle · esquema, seguretat, funcions RPC i Realtime
-- Executa tot aquest fitxer una sola vegada a Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.battle_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[0-9]{6}$'),
  status text not null default 'waiting' check (status in ('waiting','ready','playing','finished','cancelled')),
  creator_player_id uuid,
  config jsonb not null default '{}'::jsonb,
  questions jsonb not null check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) between 1 and 50),
  current_question integer not null default 0,
  question_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table if not exists public.battle_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  player_number smallint not null check (player_number in (1,2)),
  name text not null check (char_length(name) between 1 and 24),
  player_token_hash bytea not null unique,
  device_id uuid,
  score integer not null default 0 check (score >= 0),
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  connected boolean not null default true,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique(room_id, player_number)
);

alter table public.battle_rooms drop constraint if exists battle_rooms_creator_player_id_fkey;
alter table public.battle_rooms add constraint battle_rooms_creator_player_id_fkey foreign key (creator_player_id) references public.battle_players(id) on delete set null;

create table if not exists public.battle_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  player_id uuid not null references public.battle_players(id) on delete cascade,
  question_index integer not null check (question_index >= 0),
  answer text not null default '',
  correct boolean not null,
  response_ms integer not null check (response_ms >= 0),
  points integer not null check (points between 0 and 150),
  created_at timestamptz not null default now(),
  unique(room_id, player_id, question_index)
);

create index if not exists battle_players_room_idx on public.battle_players(room_id);
create index if not exists battle_answers_room_question_idx on public.battle_answers(room_id, question_index);
create index if not exists battle_rooms_code_active_idx on public.battle_rooms(code, status);

alter table public.battle_rooms enable row level security;
alter table public.battle_players enable row level security;
alter table public.battle_answers enable row level security;

-- Realtime necessita SELECT. El token mai no es desa en clar: només se'n conserva SHA-256.
revoke all on public.battle_rooms, public.battle_players, public.battle_answers from anon, authenticated;
grant select on public.battle_rooms to anon, authenticated;
grant select (id, room_id, player_number, name, score, correct_count, wrong_count, connected, joined_at, last_seen) on public.battle_players to anon, authenticated;
grant select (id, room_id, player_id, question_index, answer, correct, response_ms, points, created_at) on public.battle_answers to anon, authenticated;

drop policy if exists "Read active battle rooms" on public.battle_rooms;
create policy "Read active battle rooms" on public.battle_rooms for select to anon, authenticated using (expires_at > now());
drop policy if exists "Read battle players" on public.battle_players;
create policy "Read battle players" on public.battle_players for select to anon, authenticated using (exists (select 1 from public.battle_rooms r where r.id=room_id and r.expires_at>now()));
drop policy if exists "Read battle answers" on public.battle_answers;
create policy "Read battle answers" on public.battle_answers for select to anon, authenticated using (exists (select 1 from public.battle_rooms r where r.id=room_id and r.expires_at>now()));

create or replace function public.create_battle_room(p_name text, p_player_token uuid, p_device_id uuid, p_config jsonb, p_questions jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_room battle_rooms; v_player battle_players; v_code text; v_try int:=0;
begin
  if char_length(trim(p_name)) not between 1 and 24 or jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions) not between 1 and 50 then raise exception 'Configuració de partida no vàlida'; end if;
  loop v_try:=v_try+1; v_code:=lpad((floor(random()*1000000))::int::text,6,'0');
    begin insert into battle_rooms(code,config,questions) values(v_code,coalesce(p_config,'{}'),p_questions) returning * into v_room; exit;
    exception when unique_violation then if v_try>=10 then raise exception 'No s’ha pogut generar un codi'; end if; end;
  end loop;
  insert into battle_players(room_id,player_number,name,player_token_hash,device_id) values(v_room.id,1,trim(p_name),digest(p_player_token::text,'sha256'),p_device_id) returning * into v_player;
  update battle_rooms set creator_player_id=v_player.id where id=v_room.id;
  return jsonb_build_object('room_id',v_room.id,'code',v_code,'player_id',v_player.id,'player_number',1);
end $$;

create or replace function public.join_battle_room(p_code text, p_name text, p_player_token uuid, p_device_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_room battle_rooms; v_player battle_players;
begin
  select * into v_room from battle_rooms where code=trim(p_code) and status='waiting' and expires_at>now() for update;
  if not found then raise exception 'La sala no existeix, ha caducat o ja és plena'; end if;
  if char_length(trim(p_name)) not between 1 and 24 then raise exception 'Escriu un nom vàlid'; end if;
  insert into battle_players(room_id,player_number,name,player_token_hash,device_id) values(v_room.id,2,trim(p_name),digest(p_player_token::text,'sha256'),p_device_id) returning * into v_player;
  update battle_rooms set status='ready',updated_at=now() where id=v_room.id;
  return jsonb_build_object('room_id',v_room.id,'code',v_room.code,'player_id',v_player.id,'player_number',2);
exception when unique_violation then raise exception 'La sala ja té dos jugadors';
end $$;

create or replace function public.start_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from battle_rooms r join battle_players p on p.id=r.creator_player_id where r.id=p_room_id and p.player_token_hash=digest(p_player_token::text,'sha256') and r.status='ready') then raise exception 'Només el creador pot iniciar una sala preparada'; end if;
  update battle_rooms set status='playing',current_question=0,question_started_at=now(),updated_at=now() where id=p_room_id;
end $$;

create or replace function public.submit_battle_answer(p_room_id uuid,p_player_token uuid,p_question_index integer,p_answer text,p_response_ms integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_room battle_rooms; v_player battle_players; v_expected text; v_correct boolean; v_limit int; v_points int;
begin
  select * into v_room from battle_rooms where id=p_room_id and status='playing' for update;
  select * into v_player from battle_players where room_id=p_room_id and player_token_hash=digest(p_player_token::text,'sha256');
  if v_room.id is null or v_player.id is null or p_question_index<>v_room.current_question then raise exception 'Resposta fora de torn'; end if;
  v_limit:=coalesce((v_room.config->>'timePerQuestion')::int,30)*1000;
  if now()>v_room.question_started_at + make_interval(secs=>v_limit/1000.0) then raise exception 'S’ha acabat el temps'; end if;
  v_expected:=v_room.questions->p_question_index->>'answer';
  v_correct:=lower(regexp_replace(translate(coalesce(p_answer,''),', ','.'),'\s','','g'))=lower(regexp_replace(translate(coalesce(v_expected,''),', ','.'),'\s','','g'));
  v_points:=case when v_correct then 100 + greatest(0,least(50,floor(50*(1-least(p_response_ms,v_limit)::numeric/v_limit))::int)) else 0 end;
  insert into battle_answers(room_id,player_id,question_index,answer,correct,response_ms,points) values(p_room_id,v_player.id,p_question_index,left(p_answer,500),v_correct,greatest(0,p_response_ms),v_points);
  update battle_players set score=score+v_points,correct_count=correct_count+(v_correct::int),wrong_count=wrong_count+((not v_correct)::int),last_seen=now() where id=v_player.id;
  return jsonb_build_object('correct',v_correct,'points',v_points);
exception when unique_violation then raise exception 'Ja has respost aquesta pregunta';
end $$;

create or replace function public.advance_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_room battle_rooms; v_count int; v_limit int; v_answered int;
begin
  if not exists(select 1 from battle_players where room_id=p_room_id and player_token_hash=digest(p_player_token::text,'sha256')) then raise exception 'Jugador no vàlid'; end if;
  select * into v_room from battle_rooms where id=p_room_id and status='playing' for update; if not found then return; end if;
  v_limit:=coalesce((v_room.config->>'timePerQuestion')::int,30); select count(*) into v_answered from battle_answers where room_id=p_room_id and question_index=v_room.current_question;
  if v_answered<2 and now()<v_room.question_started_at+make_interval(secs=>v_limit) then return; end if;
  if v_room.current_question+1>=jsonb_array_length(v_room.questions) then update battle_rooms set status='finished',updated_at=now() where id=p_room_id;
  else update battle_rooms set current_question=current_question+1,question_started_at=now(),updated_at=now() where id=p_room_id; end if;
end $$;

create or replace function public.rematch_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from battle_rooms r join battle_players p on p.id=r.creator_player_id where r.id=p_room_id and p.player_token_hash=digest(p_player_token::text,'sha256') and r.status='finished') then raise exception 'Només el creador pot iniciar la revenja'; end if;
  delete from battle_answers where room_id=p_room_id; update battle_players set score=0,correct_count=0,wrong_count=0 where room_id=p_room_id;
  update battle_rooms set status='playing',current_question=0,question_started_at=now(),updated_at=now() where id=p_room_id;
end $$;

grant execute on function public.create_battle_room(text,uuid,uuid,jsonb,jsonb), public.join_battle_room(text,text,uuid,uuid), public.start_battle_room(uuid,uuid), public.submit_battle_answer(uuid,uuid,integer,text,integer), public.advance_battle_room(uuid,uuid), public.rematch_battle_room(uuid,uuid) to anon, authenticated;

do $$ begin alter publication supabase_realtime add table public.battle_rooms; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.battle_players; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.battle_answers; exception when duplicate_object then null; end $$;
