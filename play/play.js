import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveSupabaseConfig } from '../portal/supabase-config.js';

let cachedConfig = resolveSupabaseConfig();

function createInitialAnswerState() {
  return {
    selectedOption: '',
    submittedOption: '',
    submitting: false,
    feedback: '',
    error: '',
  };
}

const state = {
  supabase: null,
  channel: null,
  code: '',
  game: null,
  player: null,
  players: [],
  storedPlayer: null,
  loading: false,
  refreshTimer: null,
  refreshing: false,
  question: null,
  questionLoading: false,
  questionError: '',
  questionRequestId: 0,
  answer: createInitialAnswerState(),
};

const STATUS_LABELS = {
  waiting: 'Esperant professorat',
  active: 'En joc',
  paused: 'En pausa',
  completed: 'Finalitzada',
  cancelled: 'Cancel·lada',
};

const elements = {
  main: document.getElementById('playMain'),
  error: document.getElementById('playError'),
  errorMessage: document.getElementById('playErrorMessage'),
  title: document.getElementById('playTitle'),
  subtitle: document.getElementById('playSubtitle'),
  description: document.getElementById('playDescription'),
  status: document.getElementById('playStatus'),
  code: document.getElementById('playCode'),
  className: document.getElementById('playClass'),
  joinForm: document.getElementById('joinForm'),
  nameInput: document.getElementById('playerName'),
  joinFeedback: document.getElementById('joinFeedback'),
  joinSuccess: document.getElementById('joinSuccess'),
  joinHint: document.getElementById('joinHint'),
  scoreList: document.getElementById('scoreList'),
  scoreEmpty: document.getElementById('scoreEmpty'),
  scoreMeta: document.getElementById('scoreMeta'),
  questionSection: document.getElementById('questionSection'),
  questionMeta: document.getElementById('questionMeta'),
  questionMessage: document.getElementById('questionMessage'),
  questionPrompt: document.getElementById('questionPrompt'),
  questionForm: document.getElementById('questionForm'),
  questionOptions: document.getElementById('questionOptions'),
  questionSubmit: document.getElementById('questionSubmit'),
  questionFeedback: document.getElementById('questionFeedback'),
};

function parseCodeFromLocation() {
  let code = '';
  try {
    const params = new URLSearchParams(window.location.search);
    code = params.get('code') || '';
    if (!code && window.location.hash) {
      code = window.location.hash.replace(/^#/, '');
    }
  } catch (error) {
    console.warn('No s\'ha pogut llegir el codi de la URL.', error);
  }
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
}

function showError(message) {
  if (elements.error) {
    elements.error.hidden = false;
    if (elements.errorMessage && message) {
      elements.errorMessage.textContent = message;
    }
  }
  if (elements.main) {
    elements.main.hidden = true;
  }
}

function showMain() {
  if (elements.main) elements.main.hidden = false;
  if (elements.error) elements.error.hidden = true;
}

function getActiveSupabaseConfig() {
  const resolved = resolveSupabaseConfig();
  if (!resolved.configured) {
    return null;
  }
  if (!cachedConfig || cachedConfig.url !== resolved.url || cachedConfig.anonKey !== resolved.anonKey) {
    cachedConfig = resolved;
    if (state.supabase) {
      state.supabase = null;
    }
  }
  return cachedConfig;
}

function ensureClient() {
  const config = getActiveSupabaseConfig();
  if (!config) return null;
  if (state.supabase) return state.supabase;
  try {
    state.supabase = createClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return state.supabase;
  } catch (error) {
    console.error('No s\'ha pogut inicialitzar Supabase.', error);
    state.supabase = null;
    return null;
  }
}

function formatStatus(value) {
  if (!value) return '—';
  return STATUS_LABELS[value] || value;
}

function formatScore(value) {
  if (value === null || value === undefined) return '0';
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return String(value);
  if (numeric % 1 === 0) return String(Math.trunc(numeric));
  return numeric.toFixed(1);
}

function formatTimestamp(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat('ca', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    return '';
  }
}

function loadStoredPlayer(code) {
  if (!code) return null;
  try {
    const raw = localStorage.getItem(`focusquizLivePlayer:${code}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    if (!data.id || !data.name) return null;
    return data;
  } catch (error) {
    console.warn('No s\'ha pogut recuperar el jugador guardat.', error);
    return null;
  }
}

function storePlayer(code, player) {
  if (!code) return;
  if (!player || !player.id || !player.name) {
    localStorage.removeItem(`focusquizLivePlayer:${code}`);
    return;
  }
  try {
    const payload = JSON.stringify({ id: player.id, name: player.name });
    localStorage.setItem(`focusquizLivePlayer:${code}`, payload);
  } catch (error) {
    console.warn('No s\'ha pogut guardar el jugador localment.', error);
  }
}

function clearJoinFeedback() {
  if (elements.joinFeedback) {
    elements.joinFeedback.textContent = '';
  }
}

function setJoinFeedback(message) {
  if (elements.joinFeedback) {
    elements.joinFeedback.textContent = message || '';
  }
}

function setJoinSuccess(message) {
  if (!elements.joinSuccess) return;
  if (message) {
    elements.joinSuccess.textContent = message;
    elements.joinSuccess.hidden = false;
  } else {
    elements.joinSuccess.textContent = '';
    elements.joinSuccess.hidden = true;
  }
}

function renderJoinSection() {
  const joined = Boolean(state.player && state.player.id);
  if (elements.joinForm) {
    elements.joinForm.hidden = joined;
  }
  if (elements.joinHint) {
    elements.joinHint.textContent = joined
      ? 'Si necessites canviar el nom, avisa el professorat perquè et torni a convidar.'
      : 'Introdueix el teu nom tal com el coneix el professorat.';
  }
  if (joined) {
    setJoinSuccess(`Has entrat com ${state.player.name}.`);
    if (elements.nameInput) {
      elements.nameInput.value = state.player.name;
    }
  } else {
    setJoinSuccess('');
    if (elements.nameInput && state.storedPlayer && state.storedPlayer.name) {
      elements.nameInput.value = state.storedPlayer.name;
    }
  }
}

function normalizeInteger(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFloat(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractGamePatch(data, includeRelations = false) {
  if (!data || typeof data !== 'object') return null;
  const patch = {};
  const assignIfPresent = (sourceKey, targetKey = sourceKey, transform) => {
    if (Object.prototype.hasOwnProperty.call(data, sourceKey)) {
      const raw = data[sourceKey];
      patch[targetKey] = typeof transform === 'function' ? transform(raw) : raw;
    }
  };

  assignIfPresent('id');
  assignIfPresent('quiz_id');
  assignIfPresent('class_id');
  assignIfPresent('join_code');
  assignIfPresent('status');
  assignIfPresent('created_at');
  assignIfPresent('updated_at');
  assignIfPresent('ended_at');
  assignIfPresent('current_question', 'current_question', normalizeInteger);
  assignIfPresent('question_time_limit', 'question_time_limit', normalizeInteger);
  assignIfPresent('question_points', 'question_points', normalizeFloat);
  assignIfPresent('speed_bonus', 'speed_bonus', normalizeFloat);
  assignIfPresent('question_started_at');

  if (includeRelations) {
    if (Object.prototype.hasOwnProperty.call(data, 'quiz')) {
      patch.quiz_title = data.quiz && typeof data.quiz === 'object' ? data.quiz.title || null : null;
      patch.quiz_description = data.quiz && typeof data.quiz === 'object' ? data.quiz.description || null : null;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'class')) {
      patch.class_name = data.class && typeof data.class === 'object' ? data.class.class_name || null : null;
    }
  } else {
    assignIfPresent('quiz_title');
    assignIfPresent('quiz_description');
    assignIfPresent('class_name');
  }

  return patch;
}

function applyGamePatch(patch) {
  if (!patch) return;
  const previousGame = state.game ? Object.assign({}, state.game) : null;
  state.game = state.game ? Object.assign({}, state.game, patch) : Object.assign({}, patch);
  renderGameInfo();
  renderJoinSection();
  handleGameChange(previousGame);
  ensureGameRefresh();
}

function renderGameInfo() {
  if (!state.game) return;
  if (elements.title) {
    elements.title.textContent = state.game.quiz_title || 'Partida FocusQuiz';
  }
  if (elements.description) {
    elements.description.textContent = state.game.quiz_description || '';
    elements.description.hidden = !state.game.quiz_description;
  }
  if (elements.subtitle) {
    elements.subtitle.textContent = state.game.class_name ? 'Classe' : 'Partida';
  }
  if (elements.className) {
    elements.className.textContent = state.game.class_name || '—';
  }
  if (elements.code) {
    elements.code.textContent = state.game.join_code || state.code || '—';
  }
  if (elements.status) {
    elements.status.textContent = formatStatus(state.game.status);
    elements.status.dataset.status = state.game.status || '';
  }
  if (elements.scoreMeta) {
    const parts = [];
    const status = state.game.status;
    if (status === 'waiting') {
      parts.push('Esperant que el professorat comenci la partida.');
    } else {
      if (Number.isInteger(state.game.current_question)) {
        parts.push(`Pregunta ${state.game.current_question}`);
      }
      if ((status === 'active' || status === 'paused') && Number.isFinite(state.game.question_time_limit)) {
        parts.push(`${state.game.question_time_limit}s per respondre`);
      }
      if (Number.isFinite(state.game.question_points)) {
        parts.push(`${state.game.question_points} punts base`);
      }
      if (Number.isFinite(state.game.speed_bonus) && state.game.speed_bonus > 0) {
        parts.push(`+${state.game.speed_bonus} pts/segon`);
      }
      if (status === 'paused') {
        parts.unshift('Partida en pausa');
      }
      if (status === 'completed' && state.game.ended_at) {
        const ended = formatTimestamp(state.game.ended_at);
        if (ended) parts.push(`Finalitzada a les ${ended}`);
      } else if (status === 'cancelled') {
        parts.push('Sessió cancel·lada pel professorat.');
      }
      if (!parts.length && status === 'active') {
        parts.push('Partida en progrés.');
      }
    }
    elements.scoreMeta.textContent = parts.join(' · ');
  }
}

function clearQuestionState(cancelPending = false) {
  if (cancelPending) {
    state.questionRequestId += 1;
  }
  state.question = null;
  state.questionLoading = false;
  state.questionError = '';
  state.answer = createInitialAnswerState();
}

function makeOptionKey(index) {
  if (Number.isInteger(index) && index >= 0 && index < 26) {
    return String.fromCharCode(65 + index);
  }
  return `${index + 1}`;
}

function normalizeQuestion(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const options = Array.isArray(raw.options) ? raw.options : [];
  const normalizedOptions = options.map((option, index) => {
    let key = '';
    let text = '';
    let valueCandidate = null;

    if (option && typeof option === 'object' && !Array.isArray(option)) {
      const rawKey = option.key || option.letter || option.label;
      if (typeof rawKey === 'string' && rawKey.trim()) {
        key = rawKey.trim();
      }
      const rawText = option.text || option.value || option.label;
      if (typeof rawText === 'string' && rawText.trim()) {
        text = rawText.trim();
      }
      if (option.value !== undefined && option.value !== null) {
        valueCandidate = option.value;
      } else if (typeof option.choice === 'string' && option.choice.trim()) {
        valueCandidate = option.choice.trim();
      } else if (key) {
        valueCandidate = key;
      }
    } else if (typeof option === 'string') {
      text = option.trim();
    } else if (option !== null && option !== undefined) {
      text = String(option);
    }

    const fallbackKey = key || makeOptionKey(index);
    let value = valueCandidate;
    if (typeof value === 'string') {
      value = value.trim() || fallbackKey;
    } else if (value !== null && value !== undefined) {
      value = String(value);
    } else {
      value = fallbackKey;
    }

    const labelText = text || `Opció ${fallbackKey}`;
    return {
      id: `${raw.id || 'question'}-${index}`,
      key: fallbackKey,
      text: labelText,
      value,
    };
  });

  return {
    id: raw.id || null,
    index: Number.isInteger(raw.question_index) ? raw.question_index : null,
    prompt: typeof raw.prompt === 'string' ? raw.prompt : '',
    options: normalizedOptions,
    timeLimit: Number.isFinite(Number.parseInt(raw.time_limit, 10))
      ? Number.parseInt(raw.time_limit, 10)
      : null,
    points: Number.isFinite(Number.parseFloat(raw.points)) ? Number.parseFloat(raw.points) : null,
    speedBonus: Number.isFinite(Number.parseFloat(raw.speed_bonus))
      ? Number.parseFloat(raw.speed_bonus)
      : null,
  };
}

const QUESTION_SELECT = 'id, question_index, prompt, options, time_limit, points, speed_bonus';

function coerceQuestionIndex(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchQuestionWithFallback(client, quizId, questionIndex) {
  const baseQuery = () =>
    client
      .from('quiz_questions')
      .select(QUESTION_SELECT)
      .eq('quiz_id', quizId);

  const { data, error } = await baseQuery()
    .eq('question_index', questionIndex)
    .maybeSingle();
  if (error) throw error;
  if (data) {
    return { row: data, displayIndex: questionIndex };
  }

  const { data: allRows, error: listError } = await baseQuery()
    .order('question_index', { ascending: true });
  if (listError) throw listError;
  if (!Array.isArray(allRows) || allRows.length === 0) {
    return null;
  }

  const normalizedRows = allRows.map((row) => {
    const clone = Object.assign({}, row);
    clone.question_index = coerceQuestionIndex(clone.question_index);
    return clone;
  });

  const exactMatch = normalizedRows.find((row) => row.question_index === questionIndex);
  if (exactMatch) {
    return { row: exactMatch, displayIndex: questionIndex };
  }

  const zeroBasedIndex = Number.isInteger(questionIndex) ? questionIndex - 1 : null;
  if (
    Number.isInteger(zeroBasedIndex) &&
    zeroBasedIndex >= 0 &&
    zeroBasedIndex < normalizedRows.length
  ) {
    return { row: normalizedRows[zeroBasedIndex], displayIndex: questionIndex };
  }

  const fallbackRow = normalizedRows[0];
  const fallbackIndex = coerceQuestionIndex(fallbackRow.question_index);
  let displayIndex = null;
  if (Number.isInteger(questionIndex) && questionIndex > 0) {
    displayIndex = questionIndex;
  } else if (Number.isInteger(fallbackIndex) && fallbackIndex > 0) {
    displayIndex = fallbackIndex;
  }
  return {
    row: fallbackRow,
    displayIndex,
  };
}

async function fetchQuestion(quizId, questionIndex) {
  if (!quizId || !Number.isInteger(questionIndex)) {
    clearQuestionState();
    renderQuestion();
    return;
  }
  const client = ensureClient();
  if (!client) {
    clearQuestionState();
    renderQuestion();
    return;
  }
  const requestId = ++state.questionRequestId;
  state.questionLoading = true;
  state.questionError = '';
  state.question = null;
  state.answer = createInitialAnswerState();
  renderQuestion();
  try {
    const result = await fetchQuestionWithFallback(client, quizId, questionIndex);
    if (requestId !== state.questionRequestId) {
      return;
    }
    if (!result) {
      state.questionLoading = false;
      state.questionError = 'No s\'ha trobat la pregunta actual.';
      state.question = null;
      renderQuestion();
      return;
    }
    const normalized = normalizeQuestion(result.row);
    if (normalized) {
      if (Number.isInteger(result.displayIndex)) {
        normalized.index = result.displayIndex;
      } else if (Number.isInteger(questionIndex) && questionIndex > 0) {
        normalized.index = questionIndex;
      }
    }
    state.question = normalized;
    if (!state.question) {
      state.questionError = 'No s\'ha pogut interpretar la pregunta.';
      state.questionLoading = false;
      renderQuestion();
      return;
    }
    state.questionLoading = false;
    state.questionError = '';
    renderQuestion();
  } catch (error) {
    if (requestId !== state.questionRequestId) {
      return;
    }
    console.error('No s\'ha pogut carregar la pregunta.', error);
    state.questionLoading = false;
    state.questionError = 'No s\'ha pogut carregar la pregunta. Torna-ho a provar en uns segons.';
    state.question = null;
    renderQuestion();
  }
}

function handleGameChange(previousGame) {
  const currentGame = state.game;
  if (!currentGame) {
    clearQuestionState(true);
    renderQuestion();
    return;
  }
  const currentIndex = Number.isInteger(currentGame.current_question) ? currentGame.current_question : null;
  const previousIndex = previousGame ? previousGame.current_question : null;
  const previousQuizId = previousGame ? previousGame.quiz_id : null;
  const previousStatus = previousGame ? previousGame.status : null;
  const status = currentGame.status || 'waiting';

  if (!currentGame.quiz_id || !currentIndex || currentIndex <= 0) {
    clearQuestionState(true);
    renderQuestion();
    return;
  }

  if (status === 'waiting') {
    clearQuestionState(true);
    renderQuestion();
    return;
  }

  if (status === 'completed' || status === 'cancelled') {
    clearQuestionState(true);
    renderQuestion();
    return;
  }

  const questionChanged = previousQuizId !== currentGame.quiz_id || previousIndex !== currentIndex;
  if (questionChanged) {
    fetchQuestion(currentGame.quiz_id, currentIndex);
    return;
  }

  if (!state.question && !state.questionLoading) {
    fetchQuestion(currentGame.quiz_id, currentIndex);
    return;
  }

  if (previousStatus !== status) {
    renderQuestion();
  }
}

function renderQuestion() {
  if (!elements.questionSection) return;
  const game = state.game;
  if (!game) {
    elements.questionSection.hidden = true;
    return;
  }
  elements.questionSection.hidden = false;

  const question = state.question;
  const status = game.status || 'waiting';
  const questionIndex = Number.isInteger(game.current_question) && game.current_question > 0 ? game.current_question : null;

  if (elements.questionMeta) {
    const metaParts = [];
    if (questionIndex) {
      metaParts.push(`Pregunta ${questionIndex}`);
    }
    const timeLimit = Number.isFinite(question && question.timeLimit)
      ? question.timeLimit
      : Number.isFinite(game.question_time_limit)
      ? game.question_time_limit
      : null;
    if (Number.isFinite(timeLimit) && timeLimit > 0) {
      metaParts.push(`${timeLimit}s per respondre`);
    }
    const points = Number.isFinite(question && question.points)
      ? question.points
      : Number.isFinite(game.question_points)
      ? game.question_points
      : null;
    if (Number.isFinite(points) && points > 0) {
      metaParts.push(`${points} punts base`);
    }
    const speedBonus = Number.isFinite(question && question.speedBonus)
      ? question.speedBonus
      : Number.isFinite(game.speed_bonus)
      ? game.speed_bonus
      : null;
    if (Number.isFinite(speedBonus) && speedBonus > 0) {
      metaParts.push(`+${speedBonus} pts/segon`);
    }
    elements.questionMeta.textContent = metaParts.join(' · ');
  }

  let message = '';
  if (!questionIndex) {
    message =
      status === 'waiting'
        ? 'Esperant que el professorat comenci la partida.'
        : 'Encara no hi ha cap pregunta activa.';
  }
  if (status === 'completed') {
    message = 'La partida ha finalitzat. Consulta el marcador per veure els resultats.';
  } else if (status === 'cancelled') {
    message = 'La partida s\'ha cancel·lat. Espera noves indicacions del professorat.';
  } else if (status === 'waiting') {
    message = 'Esperant que el professorat comenci la partida.';
  } else if (state.questionLoading) {
    message = 'Carregant la pregunta…';
  } else if (!question && !state.questionLoading && questionIndex) {
    message = state.questionError || 'El professorat està preparant la pregunta següent.';
  }

  if (!message && status === 'paused') {
    message = 'La partida està en pausa. Espera indicacions del professorat.';
  }
  if (!message && question && (!state.player || !state.player.id)) {
    message = 'Entra a la partida amb el teu nom per poder respondre.';
  }

  if (elements.questionMessage) {
    elements.questionMessage.textContent = message || '';
    elements.questionMessage.hidden = !message;
  }

  const showPrompt = Boolean(question && question.prompt && !state.questionLoading);
  if (elements.questionPrompt) {
    elements.questionPrompt.textContent = showPrompt ? question.prompt : '';
    elements.questionPrompt.hidden = !showPrompt;
  }

  const showForm = Boolean(question && !state.questionLoading);
  if (elements.questionForm) {
    elements.questionForm.hidden = !showForm;
  }

  if (elements.questionOptions) {
    elements.questionOptions.innerHTML = '';
  }

  if (showForm && elements.questionOptions) {
    const options = Array.isArray(question.options) ? question.options : [];
    const isAnswered = Boolean(state.answer.submittedOption);
    const canAnswer = Boolean(state.player && state.player.id && status === 'active');
    const disableOptions = isAnswered || state.answer.submitting || !canAnswer;
    options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'play-question-option';
      if (state.answer.selectedOption === option.value) {
        label.classList.add('is-selected');
      }
      if (state.answer.submittedOption === option.value) {
        label.classList.add('is-submitted');
      }
      if (disableOptions) {
        label.classList.add('is-disabled');
      }
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'choice';
      input.value = option.value;
      input.checked = state.answer.selectedOption === option.value;
      input.disabled = disableOptions;
      const keySpan = document.createElement('span');
      keySpan.className = 'play-question-option-key';
      keySpan.textContent = option.key || makeOptionKey(index);
      const textSpan = document.createElement('span');
      textSpan.className = 'play-question-option-text';
      textSpan.textContent = option.text || `Opció ${index + 1}`;
      label.appendChild(input);
      label.appendChild(keySpan);
      label.appendChild(textSpan);
      elements.questionOptions.appendChild(label);
    });
  }

  if (elements.questionSubmit) {
    const isAnswered = Boolean(state.answer.submittedOption);
    const canAnswer = Boolean(state.player && state.player.id && status === 'active');
    elements.questionSubmit.disabled =
      !showForm || isAnswered || state.answer.submitting || !state.answer.selectedOption || !canAnswer;
    elements.questionSubmit.textContent = isAnswered ? 'Resposta enviada' : 'Enviar resposta';
  }

  if (elements.questionFeedback) {
    const hasError = Boolean(state.answer.error);
    const hasSuccess = Boolean(state.answer.feedback) && !hasError;
    elements.questionFeedback.textContent = state.answer.error || state.answer.feedback || '';
    elements.questionFeedback.classList.toggle('is-success', hasSuccess);
    elements.questionFeedback.classList.toggle('is-muted', !hasError && !hasSuccess && Boolean(state.answer.submittedOption));
    if (!state.answer.error && !state.answer.feedback && !state.answer.submittedOption) {
      elements.questionFeedback.classList.remove('is-success');
      elements.questionFeedback.classList.remove('is-muted');
    }
  }
}

function renderPlayers() {
  if (!elements.scoreList || !elements.scoreEmpty) return;
  const players = Array.isArray(state.players) ? state.players.slice() : [];
  if (players.length === 0) {
    elements.scoreEmpty.hidden = false;
    elements.scoreList.innerHTML = '';
    return;
  }
  elements.scoreEmpty.hidden = true;
  players.sort((a, b) => {
    const scoreDiff = Number.parseFloat(b.score || 0) - Number.parseFloat(a.score || 0);
    if (Math.abs(scoreDiff) > 0.0001) return scoreDiff;
    const correctDiff = (b.correct_answers || 0) - (a.correct_answers || 0);
    if (correctDiff !== 0) return correctDiff;
    return a.name.localeCompare(b.name, 'ca', { sensitivity: 'base' });
  });
  const fragment = document.createDocumentFragment();
  players.forEach((player, index) => {
    const row = document.createElement('li');
    row.className = 'play-score-row';
    const position = document.createElement('span');
    position.className = 'play-score-position';
    position.textContent = `${index + 1}`;
    row.appendChild(position);

    const name = document.createElement('span');
    name.className = 'play-score-name';
    name.textContent = player.name || 'Sense nom';
    row.appendChild(name);

    const stats = document.createElement('span');
    stats.className = 'play-score-stats';
    const scoreLabel = formatScore(player.score);
    const correctLabel = Number.isFinite(player.correct_answers)
      ? `${player.correct_answers}/${player.answer_count || 0} encerts`
      : `${player.answer_count || 0} respostes`;
    stats.textContent = `${scoreLabel} pts · ${correctLabel}`;
    row.appendChild(stats);

    if (state.player && state.player.id === player.id) {
      row.classList.add('is-self');
    }

    fragment.appendChild(row);
  });
  elements.scoreList.innerHTML = '';
  elements.scoreList.appendChild(fragment);
}

function applyStoredPlayer() {
  if (!state.storedPlayer) return;
  const player = state.players.find((item) => item.id === state.storedPlayer.id);
  if (player) {
    state.player = player;
    storePlayer(state.code, player);
    state.storedPlayer = { id: player.id, name: player.name };
  } else if (state.players.length) {
    const fallback = state.players.find((item) =>
      item.name && state.storedPlayer && item.name.trim().toLowerCase() === state.storedPlayer.name.trim().toLowerCase()
    );
    if (fallback) {
      state.player = fallback;
      storePlayer(state.code, fallback);
      state.storedPlayer = { id: fallback.id, name: fallback.name };
    } else if (state.player && state.player.id === state.storedPlayer.id) {
      state.player = null;
      storePlayer(state.code, null);
      state.storedPlayer = null;
      state.answer = createInitialAnswerState();
    }
  }
  renderQuestion();
}

async function joinGame(name) {
  const client = ensureClient();
  if (!client || !state.game) {
    setJoinFeedback('No s\'ha pogut connectar amb la partida.');
    return;
  }
  const trimmed = name.trim();
  if (!trimmed) {
    setJoinFeedback('Introdueix un nom vàlid.');
    return;
  }
  setJoinFeedback('Afegint-te a la partida...');
  try {
    const { data, error } = await client
      .from('players')
      .insert({
        game_id: state.game.id,
        class_id: state.game.class_id,
        join_code: state.game.join_code,
        name: trimmed,
      })
      .select('id, name, score, correct_answers, answer_count, last_answered_at')
      .single();
    if (error) throw error;
    state.player = data;
    storePlayer(state.code, data);
    state.storedPlayer = { id: data.id, name: data.name };
    state.players = Array.isArray(state.players) ? [...state.players, data] : [data];
    renderPlayers();
    renderJoinSection();
    renderQuestion();
    clearJoinFeedback();
  } catch (error) {
    console.error('No s\'ha pogut afegir el jugador.', error);
    if (error && error.code === '23505') {
      setJoinFeedback('Ja hi ha un participant amb aquest nom. Demana al professorat que t\'alliberi o escull una variació.');
    } else {
      setJoinFeedback('No s\'ha pogut unir a la partida. Torna-ho a provar.');
    }
  }
}

async function submitAnswer() {
  if (!state.game) {
    state.answer.error = 'No s\'ha trobat la partida.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  if (!state.player || !state.player.id) {
    state.answer.error = 'Has d\'entrar a la partida per respondre.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  if (!state.question || !state.question.id) {
    state.answer.error = 'La pregunta encara no està disponible.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  if (state.answer.submitting) return;
  const status = state.game.status;
  if (status !== 'active') {
    state.answer.error =
      status === 'paused'
        ? 'La partida està en pausa. Espera que el professorat la reprengui.'
        : 'Ara mateix no es poden enviar respostes.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  if (state.answer.submittedOption) {
    state.answer.feedback = 'Ja has enviat la teva resposta per aquesta pregunta.';
    state.answer.error = '';
    renderQuestion();
    return;
  }
  if (!state.answer.selectedOption) {
    state.answer.error = 'Selecciona una opció per enviar la resposta.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  const questionIndex = Number.isInteger(state.question.index)
    ? state.question.index
    : Number.isInteger(state.game.current_question)
    ? state.game.current_question
    : null;
  if (!questionIndex) {
    state.answer.error = 'No s\'ha pogut identificar la pregunta actual.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  const client = ensureClient();
  if (!client) {
    state.answer.error = 'No s\'ha pogut connectar amb el servidor.';
    state.answer.feedback = '';
    renderQuestion();
    return;
  }
  const choice = state.answer.selectedOption;
  state.answer.submitting = true;
  state.answer.error = '';
  state.answer.feedback = '';
  renderQuestion();
  const payload = {
    game_id: state.game.id,
    player_id: state.player.id,
    quiz_question_id: state.question.id,
    question_index: questionIndex,
    choice,
  };
  if (state.game.question_started_at) {
    const started = Date.parse(state.game.question_started_at);
    if (Number.isFinite(started)) {
      const elapsedSeconds = (Date.now() - started) / 1000;
      if (Number.isFinite(elapsedSeconds) && elapsedSeconds >= 0) {
        payload.time_spent = Number(elapsedSeconds.toFixed(3));
      }
    }
  }
  try {
    const { error } = await client.from('answers').insert(payload);
    if (error) throw error;
    state.answer.submitting = false;
    state.answer.submittedOption = choice;
    state.answer.feedback = 'Resposta enviada! Espera la següent indicació.';
    state.answer.error = '';
    renderQuestion();
    await loadPlayers();
  } catch (error) {
    state.answer.submitting = false;
    if (error && error.code === '23505') {
      state.answer.submittedOption = choice;
      state.answer.feedback = 'Ja havies respost aquesta pregunta.';
      state.answer.error = '';
    } else {
      console.error('No s\'ha pogut enviar la resposta.', error);
      state.answer.error = 'No s\'ha pogut enviar la resposta. Torna-ho a provar.';
      state.answer.feedback = '';
    }
    renderQuestion();
  }
}

async function loadPlayers() {
  const client = ensureClient();
  if (!client || !state.game) return;
  try {
    const { data, error } = await client
      .from('players')
      .select('id, name, score, correct_answers, answer_count, last_answered_at')
      .eq('game_id', state.game.id);
    if (error) throw error;
    state.players = Array.isArray(data) ? data : [];
    applyStoredPlayer();
    renderPlayers();
    renderJoinSection();
    renderQuestion();
  } catch (error) {
    console.error('No s\'han pogut carregar els participants.', error);
  }
}

function subscribeToGame() {
  const client = ensureClient();
  if (!client || !state.game) return;
  if (state.channel) {
    client.removeChannel(state.channel);
    state.channel = null;
  }
  const channel = client
    .channel(`game-${state.game.id}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${state.game.id}` }, (payload) => {
      const patch = extractGamePatch(payload.new || {});
      applyGamePatch(patch);
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${state.game.id}` },
      async () => {
        await loadPlayers();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        loadPlayers();
      }
    });
  state.channel = channel;
}

async function loadGame() {
  const client = ensureClient();
  if (!client) {
    showError('Supabase no està configurat. Demana al professorat que verifiqui la instal·lació.');
    return;
  }
  if (!state.code) {
    showError('Cal un codi de partida per accedir-hi.');
    return;
  }
  try {
    const { data, error } = await client
      .from('games')
      .select(
        'id, quiz_id, class_id, join_code, status, current_question, question_time_limit, question_points, question_started_at, speed_bonus, created_at, updated_at, ended_at, quiz:quizzes(title, description), class:classes(class_name)'
      )
      .eq('join_code', state.code)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      showError('No s\'ha trobat cap partida amb aquest codi.');
      return;
    }
    const patch = extractGamePatch(data, true);
    applyGamePatch(patch);
    state.players = [];
    state.player = null;
    state.storedPlayer = loadStoredPlayer(state.code);
    showMain();
    subscribeToGame();
  } catch (error) {
    console.error('No s\'ha pogut carregar la partida.', error);
    if (error && error.code === 'PGRST116') {
      showError('La partida ha finalitzat o s\'ha esborrat.');
    } else {
      showError('No s\'ha pogut accedir a la partida. Torna-ho a provar.');
    }
  }
}

function shouldRefreshGame() {
  if (!state.game) return false;
  const status = state.game.status;
  return status === 'waiting' || status === 'active' || status === 'paused';
}

async function fetchLatestGame() {
  if (!shouldRefreshGame()) {
    clearGameRefresh();
    return;
  }
  if (state.refreshing) return;
  const client = ensureClient();
  if (!client || !state.game || !state.game.id) return;
  state.refreshing = true;
  try {
    const { data, error } = await client
      .from('games')
      .select(
        'id, quiz_id, class_id, join_code, status, current_question, question_time_limit, question_points, question_started_at, speed_bonus, created_at, updated_at, ended_at, quiz:quizzes(title, description), class:classes(class_name)'
      )
      .eq('id', state.game.id)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      const patch = extractGamePatch(data, true);
      applyGamePatch(patch);
    }
  } catch (error) {
    console.warn('No s\'ha pogut actualitzar l\'estat de la partida.', error);
  } finally {
    state.refreshing = false;
  }
}

function clearGameRefresh() {
  if (state.refreshTimer) {
    window.clearInterval(state.refreshTimer);
    state.refreshTimer = null;
  }
}

function ensureGameRefresh() {
  if (!shouldRefreshGame()) {
    clearGameRefresh();
    return;
  }
  if (!state.refreshTimer) {
    state.refreshTimer = window.setInterval(fetchLatestGame, 5000);
  }
}

function setupQuestionForm() {
  if (!elements.questionForm) return;
  elements.questionForm.addEventListener('change', (event) => {
    const target = event.target;
    if (!target || target.name !== 'choice') return;
    if (state.answer.submittedOption) {
      target.checked = target.value === state.answer.submittedOption;
      return;
    }
    const value = typeof target.value === 'string' ? target.value.trim() : `${target.value}`;
    state.answer.selectedOption = value;
    state.answer.error = '';
    state.answer.feedback = '';
    renderQuestion();
  });
  elements.questionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAnswer();
  });
}

function setupForm() {
  if (!elements.joinForm) return;
  elements.joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearJoinFeedback();
    if (!state.game) {
      setJoinFeedback('Encara s\'està carregant la partida.');
      return;
    }
    if (state.game.status === 'completed' || state.game.status === 'cancelled') {
      setJoinFeedback('La partida ja està tancada.');
      return;
    }
    const name = elements.nameInput ? elements.nameInput.value : '';
    if (!name || name.trim().length < 2) {
      setJoinFeedback('Introdueix un nom vàlid (mínim 2 caràcters).');
      if (elements.nameInput) elements.nameInput.focus();
      return;
    }
    joinGame(name);
  });
}

function cleanup() {
  clearGameRefresh();
  clearQuestionState(true);
  if (state.supabase && state.channel) {
    try {
      state.supabase.removeChannel(state.channel);
    } catch (error) {
      console.warn('No s\'ha pogut alliberar el canal Supabase.', error);
    }
    state.channel = null;
  }
}

function init() {
  state.code = parseCodeFromLocation();
  if (!state.code) {
    showError('Cal un codi de partida per accedir-hi.');
    return;
  }
  setupQuestionForm();
  setupForm();
  loadGame();
}

window.addEventListener('beforeunload', cleanup);
window.addEventListener('pagehide', cleanup);

document.addEventListener('DOMContentLoaded', init);
