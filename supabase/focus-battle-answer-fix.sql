-- Focus Battle · correcció del registre de respostes (2026-08-21)
-- No crea ni utilitza battle_answers.
-- battle_question_answers continua privada i NO s'afegeix a Realtime.

begin;

-- Índex de l'última pregunta contestada per impedir dobles respostes sense una
-- taula pública d'intents. El valor -1 significa que encara no n'ha contestat cap.
alter table public.battle_players
  add column if not exists answered_question_index integer not null default -1;

comment on column public.battle_players.answered_question_index is
  'Darrera pregunta registrada pel servidor; evita respostes duplicades a Focus Battle.';

-- Normalització compartida per respostes textuals i numèriques senzilles.
create or replace function public.normalize_battle_answer(p_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select lower(regexp_replace(replace(trim(coalesce(p_value, '')), ',', '.'), '\s+', '', 'g'));
$$;

revoke all on function public.normalize_battle_answer(text) from public, anon, authenticated;

-- Elimina tant la signatura definitiva com l'antiga variant que rebia el
-- temps calculat pel navegador. El servidor és l'única font de temps.
drop function if exists public.submit_battle_answer(uuid, uuid, integer, text);
drop function if exists public.submit_battle_answer(uuid, uuid, integer, text, integer);

create function public.submit_battle_answer(
  p_room_id uuid,
  p_player_token uuid,
  p_question_index integer,
  p_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.battle_rooms%rowtype;
  v_player public.battle_players%rowtype;
  v_private_row jsonb;
  v_expected text;
  v_correct boolean;
  v_limit_seconds integer;
  v_elapsed_ms integer;
  v_speed_bonus integer;
  v_points integer;
  v_score_before integer;
  v_score_after integer;
  v_correct_count integer;
  v_wrong_count integer;
begin
  select * into v_room
  from public.battle_rooms
  where id = p_room_id
  for update;

  if not found or v_room.status <> 'playing' then
    raise exception 'La partida no està activa';
  end if;

  select * into v_player
  from public.battle_players
  where room_id = p_room_id
    and player_token_hash = digest(p_player_token::text, 'sha256')
  for update;

  if not found then
    raise exception 'Jugador o token no vàlid';
  end if;

  if p_question_index <> v_room.current_question then
    raise exception 'Resposta fora de torn';
  end if;

  if v_player.answered_question_index >= p_question_index then
    raise exception 'Aquesta pregunta ja ha estat resposta';
  end if;

  -- La consulta usa to_jsonb perquè és compatible amb els noms habituals
  -- room_id/battle_room_id, question_index/index i answer/correct_answer.
  select to_jsonb(private_answer)
  into v_private_row
  from public.battle_question_answers private_answer
  where coalesce(
      to_jsonb(private_answer)->>'room_id',
      to_jsonb(private_answer)->>'battle_room_id'
    ) = p_room_id::text
    and coalesce(
      to_jsonb(private_answer)->>'question_index',
      to_jsonb(private_answer)->>'index'
    )::integer = p_question_index
  limit 1;

  if v_private_row is null then
    raise exception 'No s’ha trobat la resposta privada de la pregunta %', p_question_index + 1;
  end if;

  v_expected := coalesce(
    v_private_row->>'correct_answer',
    v_private_row->>'answer',
    v_private_row->>'expected_answer'
  );

  if v_expected is null then
    raise exception 'La resposta privada no té un valor corregible';
  end if;

  v_correct := public.normalize_battle_answer(p_answer)
    = public.normalize_battle_answer(v_expected);
  v_limit_seconds := greatest(1, coalesce(
    (v_room.config->>'timePerQuestion')::integer,
    (v_room.config->>'time_per_question')::integer,
    30
  ));
  v_elapsed_ms := greatest(0, floor(extract(epoch from (clock_timestamp() - v_room.question_started_at)) * 1000)::integer);
  v_speed_bonus := case when v_correct then greatest(0, least(50,
    floor(50 * (1 - least(v_elapsed_ms, v_limit_seconds * 1000)::numeric / (v_limit_seconds * 1000)))::integer
  )) else 0 end;
  v_points := case when v_correct then 100 + v_speed_bonus else 0 end;
  v_score_before := v_player.score;

  update public.battle_players
  set score = score + v_points,
      correct_count = correct_count + case when v_correct then 1 else 0 end,
      wrong_count = wrong_count + case when v_correct then 0 else 1 end,
      answered_question_index = p_question_index,
      last_seen = now()
  where id = v_player.id
  returning score, correct_count, wrong_count
  into v_score_after, v_correct_count, v_wrong_count;

  return jsonb_build_object(
    'accepted', true,
    'correct', v_correct,
    'points', v_points,
    'speed_bonus', v_speed_bonus,
    'score_before', v_score_before,
    'score_after', v_score_after,
    'correct_count', v_correct_count,
    'wrong_count', v_wrong_count,
    'question_index', p_question_index
  );
end;
$$;

drop function if exists public.advance_battle_room(uuid, uuid);

create function public.advance_battle_room(
  p_room_id uuid,
  p_player_token uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.battle_rooms%rowtype;
  v_player_count integer;
  v_answered_count integer;
  v_total_questions integer;
  v_limit_seconds integer;
  v_timed_out boolean;
begin
  if not exists (
    select 1 from public.battle_players
    where room_id = p_room_id
      and player_token_hash = digest(p_player_token::text, 'sha256')
  ) then
    raise exception 'Jugador o token no vàlid';
  end if;

  select * into v_room
  from public.battle_rooms
  where id = p_room_id and status = 'playing'
  for update;

  if not found then return; end if;

  select count(*), count(*) filter (where answered_question_index >= v_room.current_question)
  into v_player_count, v_answered_count
  from public.battle_players
  where room_id = p_room_id;

  v_limit_seconds := greatest(1, coalesce(
    (v_room.config->>'timePerQuestion')::integer,
    (v_room.config->>'time_per_question')::integer,
    30
  ));
  v_timed_out := clock_timestamp() >= v_room.question_started_at + make_interval(secs => v_limit_seconds);

  if v_answered_count < v_player_count and not v_timed_out then return; end if;

  if v_timed_out then
    update public.battle_players
    set wrong_count = wrong_count + 1,
        answered_question_index = v_room.current_question
    where room_id = p_room_id
      and answered_question_index < v_room.current_question;
  end if;

  v_total_questions := coalesce(
    (v_room.config->>'count')::integer,
    jsonb_array_length(v_room.questions)
  );

  if v_room.current_question + 1 >= v_total_questions then
    update public.battle_rooms
    set status = 'finished', updated_at = now()
    where id = p_room_id;
  else
    update public.battle_rooms
    set current_question = current_question + 1,
        question_started_at = now(),
        updated_at = now()
    where id = p_room_id;
  end if;
end;
$$;

drop function if exists public.rematch_battle_room(uuid, uuid);

create function public.rematch_battle_room(
  p_room_id uuid,
  p_player_token uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.battle_rooms room
    join public.battle_players player on player.id = room.creator_player_id
    where room.id = p_room_id
      and room.status = 'finished'
      and player.player_token_hash = digest(p_player_token::text, 'sha256')
  ) then
    raise exception 'Només el creador pot iniciar la revenja';
  end if;

  update public.battle_players
  set score = 0,
      correct_count = 0,
      wrong_count = 0,
      answered_question_index = -1,
      last_seen = now()
  where room_id = p_room_id;

  update public.battle_rooms
  set status = 'playing',
      current_question = 0,
      question_started_at = now(),
      updated_at = now()
  where id = p_room_id;
end;
$$;

revoke all on function public.submit_battle_answer(uuid, uuid, integer, text) from public;
revoke all on function public.advance_battle_room(uuid, uuid) from public;
revoke all on function public.rematch_battle_room(uuid, uuid) from public;
grant execute on function public.submit_battle_answer(uuid, uuid, integer, text) to anon, authenticated;
grant execute on function public.advance_battle_room(uuid, uuid) to anon, authenticated;
grant execute on function public.rematch_battle_room(uuid, uuid) to anon, authenticated;

-- Només s'exposa la nova columna pública de progrés. No es concedeix cap accés
-- a battle_question_answers.
grant select (answered_question_index) on public.battle_players to anon, authenticated;

notify pgrst, 'reload schema';

commit;
