import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { resolveSupabaseConfig } from './portal/supabase-config.js';

const app = document.querySelector('#battleApp');
const toast = document.querySelector('#battleToast');
const modules = (window._BATTLE_MODULES_ || []).filter(module => module?.id && typeof module.gen === 'function');
const categories = { math: 'Matemàtiques', cat: 'Català', esp: 'Castellà', sci: 'Ciències', geo: 'Geografia', ang: 'Anglès', rep: 'Repàs' };
const publicRoomColumns = 'id,code,status,creator_player_id,config,current_question,question_started_at,created_at,updated_at,expires_at';
const publicPlayerColumns = 'id,room_id,name,player_number,score,correct_count,wrong_count,connected,last_seen';
const supabaseConfig = resolveSupabaseConfig();
const supabase = supabaseConfig.configured ? createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;
const state = {
  room: null,
  player: null,
  players: [],
  question: null,
  questionIndex: null,
  submittedIndex: null,
  submissionResult: null,
  channel: null,
  timer: null,
  presence: {},
  loadingQuestion: null,
};

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const createToken = () => crypto.randomUUID();
const getIdentity = () => {
  let id = localStorage.getItem('focusbattle-device-id');
  if (!id) {
    id = createToken();
    localStorage.setItem('focusbattle-device-id', id);
  }
  return id;
};

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.handle);
  showToast.handle = setTimeout(() => { toast.hidden = true; }, 3500);
}

function errorMessage(error) {
  console.error(error);
  return error?.message || String(error || 'Error inesperat');
}

function connectionWarning() {
  return supabase ? '' : '<div class="setup-warning">No s’ha pogut carregar la connexió pública amb Supabase. Torna a carregar la pàgina.</div>';
}

function resetGameState() {
  state.room = null;
  state.player = null;
  state.players = [];
  state.question = null;
  state.questionIndex = null;
  state.submittedIndex = null;
  state.submissionResult = null;
  state.presence = {};
  state.loadingQuestion = null;
}

function home() {
  cleanup();
  resetGameState();
  history.replaceState(null, '', 'focus-battle.html');
  app.innerHTML = `<section class="battle-card"><p class="battle-eyebrow">Multijugador en directe</p><h1>FOCUS BATTLE</h1><p class="lead">Les mateixes preguntes, el mateix temps. Guanya qui respongui millor i més ràpid.</p>${connectionWarning()}<div class="mode-grid"><button class="mode-button" data-screen="create"><strong>CREAR PARTIDA</strong><span>Configura un mòdul i comparteix el codi.</span></button><button class="mode-button" data-screen="join"><strong>ENTRAR AMB CODI</strong><span>Uneix-te a la sala d’un altre jugador.</span></button></div></section>`;
}

function createScreen() {
  const groupedModules = Object.entries(categories).map(([category, label]) => {
    const options = modules
      .filter(module => module.category === category && module.id !== 'coord')
      .map(module => `<option value="${escapeHtml(module.id)}">${escapeHtml(module.name)}</option>`)
      .join('');
    return options ? `<optgroup label="${label}">${options}</optgroup>` : '';
  }).join('');

  app.innerHTML = `<section class="battle-card"><p class="battle-eyebrow">Focus Battle</p><h2>CREAR PARTIDA</h2><p class="lead">Les preguntes es generaran una sola vegada amb els mòduls actuals de FocusQuiz.</p>${connectionWarning()}<form id="createForm" class="form-grid"><label class="field field--wide">Nom del jugador<input name="name" maxlength="24" required autocomplete="nickname" value="${escapeHtml(localStorage.getItem('lastStudent') || '')}"></label><label class="field">Curs<select name="course"><option>Primària</option><option selected>ESO</option><option>Batxillerat</option></select></label><label class="field">Assignatura i mòdul<select name="module" required>${groupedModules}</select></label><label class="field">Nivell<select name="level"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="4">4</option></select></label><label class="field">Nombre de preguntes<select name="count"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label><label class="field">Temps per pregunta<select name="time"><option value="15">15 segons</option><option value="30" selected>30 segons</option><option value="45">45 segons</option><option value="60">60 segons</option></select></label><div class="field field--wide"><p class="error" id="formError"></p><div class="actions"><button class="primary" type="submit" ${supabase ? '' : 'disabled'}>CREAR PARTIDA</button><button class="secondary" type="button" data-screen="home">Enrere</button></div></div></form></section>`;
}

function joinScreen() {
  app.innerHTML = `<section class="battle-card"><p class="battle-eyebrow">Focus Battle</p><h2>ENTRAR AMB CODI</h2><p class="lead">Escriu el codi de sis xifres que t’ha compartit el creador.</p>${connectionWarning()}<form id="joinForm" class="form-grid"><label class="field field--wide">Nom del jugador<input name="name" maxlength="24" required autocomplete="nickname" value="${escapeHtml(localStorage.getItem('lastStudent') || '')}"></label><label class="field field--wide">Codi de partida<input class="code-input" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="482193" required autocomplete="off"></label><div class="field field--wide"><p class="error" id="formError"></p><div class="actions"><button class="primary" type="submit" ${supabase ? '' : 'disabled'}>ENTRAR</button><button class="secondary" type="button" data-screen="home">Enrere</button></div></div></form></section>`;
}

function serializeQuestion(question, index) {
  const serialized = JSON.parse(JSON.stringify(question, (_key, value) => typeof value === 'function' ? undefined : value));
  return { ...serialized, battleId: String(index + 1), text: serialized.text || `Pregunta ${index + 1}` };
}

async function createRoom(form) {
  const values = Object.fromEntries(new FormData(form));
  const module = modules.find(candidate => candidate.id === values.module);
  if (!module) throw new Error('No s’ha trobat el mòdul seleccionat.');

  const count = Number(values.count);
  const level = Number(values.level);
  const generatedQuestions = Array.from({ length: count }, (_, index) => serializeQuestion(module.gen(level, {}), index));
  const playerToken = createToken();
  const { data, error } = await supabase.rpc('create_battle_room', {
    p_name: values.name.trim(),
    p_player_token: playerToken,
    p_device_id: getIdentity(),
    p_config: { course: values.course, moduleId: module.id, moduleName: module.name, level, count, timePerQuestion: Number(values.time) },
    p_questions: generatedQuestions,
  });
  generatedQuestions.length = 0;
  if (error) throw error;

  rememberPlayer(data, playerToken, values.name.trim());
  await loadRoom(data.room_id);
  subscribe();
}

async function joinRoom(form) {
  const values = Object.fromEntries(new FormData(form));
  const playerToken = createToken();
  const { data, error } = await supabase.rpc('join_battle_room', {
    p_code: values.code.trim(),
    p_name: values.name.trim(),
    p_player_token: playerToken,
    p_device_id: getIdentity(),
  });
  if (error) throw error;

  rememberPlayer(data, playerToken, values.name.trim());
  await loadRoom(data.room_id);
  subscribe();
}

function rememberPlayer(data, playerToken, name) {
  state.player = {
    id: data.player_id,
    roomId: data.room_id,
    number: data.player_number,
    token: playerToken,
    code: data.code,
    name,
  };
  localStorage.setItem('lastStudent', name);
  localStorage.setItem(`focusbattle:${data.room_id}`, JSON.stringify(state.player));
  history.replaceState(null, '', `focus-battle.html?room=${data.room_id}`);
}

async function loadRoom(roomId) {
  const [roomResult, playersResult] = await Promise.all([
    supabase.from('battle_rooms').select(publicRoomColumns).eq('id', roomId).single(),
    supabase.from('battle_players').select(publicPlayerColumns).eq('room_id', roomId).order('player_number'),
  ]);
  if (roomResult.error) throw roomResult.error;
  if (playersResult.error) throw playersResult.error;

  const previousQuestionIndex = state.room?.current_question;
  state.room = roomResult.data;
  state.players = playersResult.data || [];
  if (previousQuestionIndex !== state.room.current_question) {
    state.question = null;
    state.questionIndex = null;
    state.submittedIndex = null;
    state.submissionResult = null;
  }
  await renderRoom();
}

async function fetchCurrentQuestion() {
  const index = state.room.current_question;
  if (state.question && state.questionIndex === index) return state.question;
  if (state.loadingQuestion) return state.loadingQuestion;

  state.loadingQuestion = (async () => {
    const { data, error } = await supabase.rpc('get_battle_question', {
      p_room_id: state.room.id,
      p_player_token: state.player.token,
    });
    if (error) throw error;
    const payload = Array.isArray(data) ? data[0] : data;
    const question = payload?.question && typeof payload.question === 'object' ? payload.question : payload;
    if (!question || typeof question !== 'object') throw new Error('No s’ha pogut obtenir la pregunta actual.');

    const publicQuestion = { ...question };
    delete publicQuestion.answer;
    delete publicQuestion.correct_answer;
    state.question = publicQuestion;
    state.questionIndex = index;
    if (payload?.answered || payload?.has_answered || payload?.already_answered) state.submittedIndex = index;
    return publicQuestion;
  })();

  try {
    return await state.loadingQuestion;
  } finally {
    state.loadingQuestion = null;
  }
}

function subscribe() {
  cleanup();
  if (!state.room) return;
  state.channel = supabase.channel(`battle:${state.room.id}`, { config: { presence: { key: state.player.id } } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'battle_rooms', filter: `id=eq.${state.room.id}` }, () => loadRoom(state.room.id).catch(error => showToast(errorMessage(error))))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'battle_players', filter: `room_id=eq.${state.room.id}` }, () => loadRoom(state.room.id).catch(error => showToast(errorMessage(error))))
    .on('presence', { event: 'sync' }, () => {
      state.presence = state.channel.presenceState();
      updateConnectionNotice();
    })
    .subscribe(async status => {
      if (status === 'SUBSCRIBED') await state.channel.track({ player_id: state.player.id, online_at: new Date().toISOString() });
    });
}

function cleanup() {
  clearInterval(state.timer);
  state.timer = null;
  if (state.channel && supabase) supabase.removeChannel(state.channel);
  state.channel = null;
}

function opponent() {
  return state.players.find(player => player.id !== state.player?.id);
}

function updateConnectionNotice() {
  const notice = document.querySelector('#connectionNotice');
  const rival = opponent();
  if (!notice || !rival) return;
  const online = Object.values(state.presence).flat().some(presence => presence.player_id === rival.id);
  notice.hidden = online;
  notice.textContent = 'El rival s’ha desconnectat. Esperant reconnexió…';
}

async function renderRoom() {
  if (!state.room || !state.player) return;
  if (state.room.status === 'waiting' || state.room.status === 'ready') renderLobby();
  else if (state.room.status === 'playing') {
    await fetchCurrentQuestion();
    renderQuestion();
  } else if (state.room.status === 'finished') renderResult();
}

function renderLobby() {
  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  const isCreator = state.player.number === 1;
  app.innerHTML = `<section class="battle-card waiting"><p class="battle-eyebrow">PARTIDA CREADA</p><h2>CODI</h2><h1 class="room-code">${escapeHtml(state.room.code)}</h1><p><span class="pulse"></span>${playerTwo ? 'Rival connectat' : 'Esperant rival…'}</p><div class="players"><div class="player">${escapeHtml(playerOne?.name || 'Jugador 1')}</div><div class="versus">VS</div><div class="player">${escapeHtml(playerTwo?.name || 'Esperant…')}</div></div><p id="connectionNotice" class="status-note" hidden></p><div class="actions" style="justify-content:center">${isCreator ? `<button class="primary" data-action="start" ${playerTwo ? '' : 'disabled'}>INICIAR PARTIDA</button>` : '<p class="lead">El creador iniciarà la partida.</p>'}<button class="secondary" data-action="copy">COPIAR CODI</button></div></section>`;
  updateConnectionNotice();
}

function mediaHtml(question) {
  if (question.svg) return question.svg;
  if (question.image) return `<img src="${escapeHtml(question.image)}" alt="Imatge de la pregunta">`;
  return '';
}

function renderQuestion() {
  const index = state.room.current_question;
  const question = state.question;
  if (!question) return;
  const submitted = state.submittedIndex === index;
  const timeLimit = Number(state.room.config?.timePerQuestion || 30);
  const startedAt = new Date(state.room.question_started_at).getTime();
  const me = state.players.find(player => player.id === state.player.id);
  const rival = opponent() || { name: 'Rival', score: 0 };
  const choices = Array.isArray(question.options) ? question.options : null;
  const choicesHtml = choices
    ? `<div class="answers">${choices.map(option => `<button class="answer-option" data-answer="${escapeHtml(option)}" ${submitted ? 'disabled' : ''}>${escapeHtml(option)}</button>`).join('')}</div>`
    : `<form class="answer-form" id="answerForm"><input name="answer" aria-label="Resposta" autocomplete="off" required ${submitted ? 'disabled' : ''}><button class="primary" ${submitted ? 'disabled' : ''}>RESPONDRE</button></form>`;
  const totalQuestions = Number(state.room.config?.count || question.total_questions || 0);
  const feedback = submitted
    ? `${state.submissionResult?.correct === true ? 'Correcte! ' : state.submissionResult?.correct === false ? 'Resposta enviada. ' : ''}Esperant el rival…`
    : '';

  app.innerHTML = `<section class="battle-card"><div class="scoreboard"><div><strong>${escapeHtml(me?.name)}</strong><span>${me?.score || 0} pts</span></div><b>—</b><div><strong>${escapeHtml(rival.name)}</strong><span>${rival.score || 0} pts</span></div></div><div class="question-meta"><span>Pregunta ${index + 1}${totalQuestions ? ` / ${totalQuestions}` : ''}</span><span id="timerText">${timeLimit}s</span></div><div class="timer-track"><div class="timer-bar" id="timerBar"></div></div><p id="connectionNotice" class="status-note" hidden></p><h2 class="question-text">${escapeHtml(question.text)}</h2><div class="question-media">${mediaHtml(question)}</div>${choicesHtml}<p class="locked">${feedback}</p></section>`;
  updateConnectionNotice();
  startCountdown(timeLimit, startedAt);
}

function startCountdown(seconds, startedAt) {
  clearInterval(state.timer);
  const tick = async () => {
    const remaining = Math.max(0, seconds - (Date.now() - startedAt) / 1000);
    const bar = document.querySelector('#timerBar');
    const label = document.querySelector('#timerText');
    if (bar) bar.style.width = `${remaining / seconds * 100}%`;
    if (label) label.textContent = `${Math.ceil(remaining)}s`;
    if (remaining <= 0) {
      clearInterval(state.timer);
      await advance();
    }
  };
  tick();
  state.timer = setInterval(tick, 200);
}

async function submitAnswer(answer) {
  const index = state.room.current_question;
  if (!answer || state.submittedIndex === index) return;
  state.submittedIndex = index;
  renderQuestion();

  const { data, error } = await supabase.rpc('submit_battle_answer', {
    p_room_id: state.room.id,
    p_player_token: state.player.token,
    p_question_index: index,
    p_answer: String(answer),
  });
  if (error) {
    state.submittedIndex = null;
    renderQuestion();
    throw error;
  }
  state.submissionResult = Array.isArray(data) ? data[0] : data;
  renderQuestion();
  await loadPlayers();
  await advance();
}

async function loadPlayers() {
  const { data, error } = await supabase.from('battle_players').select(publicPlayerColumns).eq('room_id', state.room.id).order('player_number');
  if (error) throw error;
  state.players = data || [];
  if (state.room?.status === 'playing') renderQuestion();
}

async function advance() {
  if (!state.room) return;
  const { error } = await supabase.rpc('advance_battle_room', {
    p_room_id: state.room.id,
    p_player_token: state.player.token,
  });
  if (error) console.warn('El servidor encara no ha avançat la pregunta:', error.message);
}

function renderResult() {
  clearInterval(state.timer);
  const sorted = [...state.players].sort((first, second) => second.score - first.score);
  const me = state.players.find(player => player.id === state.player.id);
  const rival = opponent();
  if (!me || !rival) return;
  const title = me.score === rival.score ? 'EMPAT' : me.score > rival.score ? 'VICTÒRIA' : 'DERROTA';
  const className = title === 'VICTÒRIA' ? 'win' : title === 'DERROTA' ? 'lose' : '';
  app.innerHTML = `<section class="battle-card"><p class="battle-eyebrow">Resultat final</p><h1 class="result-title ${className}">${title}</h1><div class="result-scores">${sorted.map(player => `<div class="result-player"><span>${escapeHtml(player.name)}</span><strong>${player.score}</strong><small>punts</small><div class="stats">✓ ${player.correct_count} correctes<br>✕ ${player.wrong_count} incorrectes</div></div>`).join('')}</div><div class="actions" style="justify-content:center">${state.player.number === 1 ? '<button class="primary" data-action="rematch">REVANXA</button>' : ''}<button class="secondary" data-screen="create">NOVA PARTIDA</button><a class="secondary" href="index.html" style="text-decoration:none;display:grid;place-items:center">TORNAR A FOCUSQUIZ</a></div></section>`;
}

async function startGame(rematch = false) {
  const functionName = rematch ? 'rematch_battle_room' : 'start_battle_room';
  const { error } = await supabase.rpc(functionName, {
    p_room_id: state.room.id,
    p_player_token: state.player.token,
  });
  if (error) throw error;
}

app.addEventListener('click', async event => {
  const screen = event.target.closest('[data-screen]')?.dataset.screen;
  if (screen) {
    ({ home, create: createScreen, join: joinScreen }[screen] || home)();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  try {
    if (action === 'leave') home();
    if (action === 'copy') {
      await navigator.clipboard.writeText(state.room.code);
      showToast('Codi copiat!');
    }
    if (action === 'start') await startGame();
    if (action === 'rematch') await startGame(true);
    const answer = event.target.closest('[data-answer]')?.dataset.answer;
    if (answer !== undefined) await submitAnswer(answer);
  } catch (error) {
    showToast(errorMessage(error));
  }
});

app.addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.target.querySelector('[type="submit"]');
  const errorNode = event.target.querySelector('#formError');
  button.disabled = true;
  if (errorNode) errorNode.textContent = '';
  try {
    if (event.target.id === 'createForm') await createRoom(event.target);
    if (event.target.id === 'joinForm') await joinRoom(event.target);
    if (event.target.id === 'answerForm') await submitAnswer(new FormData(event.target).get('answer'));
  } catch (error) {
    if (errorNode) errorNode.textContent = errorMessage(error);
    else showToast(errorMessage(error));
    button.disabled = false;
  }
});

async function restore() {
  if (!supabase) return home();
  const roomId = new URLSearchParams(location.search).get('room');
  if (!roomId) return home();
  try {
    state.player = JSON.parse(localStorage.getItem(`focusbattle:${roomId}`));
    if (!state.player?.token) return home();
    await loadRoom(roomId);
    subscribe();
  } catch (error) {
    console.warn(error);
    home();
  }
}

window.addEventListener('beforeunload', cleanup);
restore();
