import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MODULES, CATEGORY_LABELS } from './modules-data.js';
import {
  getDefaultModuleOptions,
  getModuleOptionDefinition,
  normalizeModuleOptions,
  summarizeModuleOptions,
  validateModuleOptions,
  cloneModuleOptions,
} from './module-config.js';
import { resolveSupabaseConfig } from './supabase-config.js';

let cachedConfig = resolveSupabaseConfig();
const STATUS_LABELS = {
  submitted: 'Enviada',
  completed: 'Completada',
  reviewed: 'Revisada',
};

const ASSIGNMENT_STATUS_LABELS = {
  open: 'Oberta',
  closed: 'Tancada',
  scheduled: 'Programada',
};

const state = {
  supabase: null,
  session: null,
  profile: null,
  profileError: null,
  activeTab: 'classes',
  classes: [],
  assignments: [],
  submissions: [],
  activeSubmissionId: null,
  focusedResultAssignmentId: null,
  assignmentDraft: {
    moduleId: '',
    options: {},
    questionSet: [],
    notice: '',
    previewToken: '',
  },
  live: {
    quizzes: [],
    games: [],
    quizDraft: {
      classId: '',
      title: '',
      moduleId: '',
      defaultTimeLimit: 20,
      defaultPoints: 100,
      speedBonus: 5,
      questions: [],
    },
    questionDraft: null,
    gameDraft: {
      classId: '',
      quizId: '',
      timeLimit: 20,
      points: 100,
      speedBonus: 5,
    },
  },
};

const elements = {
  configWarning: document.getElementById('configWarning'),
  authPanel: document.getElementById('authPanel'),
  loginForm: document.getElementById('loginForm'),
  authError: document.getElementById('authError'),
  registerPanel: document.getElementById('registerPanel'),
  signupForm: document.getElementById('signupForm'),
  signupSuccess: document.getElementById('signupSuccess'),
  signupError: document.getElementById('signupError'),
  sessionPanel: document.getElementById('sessionPanel'),
  sessionName: document.getElementById('sessionName'),
  sessionEmail: document.getElementById('sessionEmail'),
  logoutBtn: document.getElementById('logoutBtn'),
  sessionWarning: document.getElementById('sessionWarning'),
  tabs: document.getElementById('portalTabs'),
  tabButtons: Array.from(document.querySelectorAll('[data-tab]')),
  tabPanels: Array.from(document.querySelectorAll('[data-tab-panel]')),
  classForm: document.getElementById('classCreateForm'),
  classFeedback: document.getElementById('classCreateFeedback'),
  classList: document.getElementById('classList'),
  classEmpty: document.getElementById('classEmptyState'),
  refreshClasses: document.getElementById('refreshClasses'),
  assignmentForm: document.getElementById('assignmentCreateForm'),
  assignmentFeedback: document.getElementById('assignmentFeedback'),
  assignmentClassSelect: document.getElementById('assignmentClass'),
  assignmentModuleSelect: document.getElementById('assignmentModule'),
  assignmentLevelField: document.getElementById('assignmentLevelField'),
  assignmentLevelInput: document.getElementById('assignmentLevelInput'),
  previewModule: document.getElementById('previewModule'),
  moduleConfig: document.getElementById('moduleConfig'),
  moduleConfigCard: document.getElementById('moduleConfigCard'),
  moduleConfigTitle: document.getElementById('moduleConfigTitle'),
  moduleConfigKicker: document.getElementById('moduleConfigKicker'),
  moduleConfigBody: document.getElementById('moduleConfigBody'),
  moduleConfigSummary: document.getElementById('moduleConfigSummary'),
  moduleConfigError: document.getElementById('moduleConfigError'),
  moduleConfigNotice: document.getElementById('moduleConfigNotice'),
  resetModuleConfig: document.getElementById('resetModuleConfig'),
  assignmentList: document.getElementById('assignmentList'),
  assignmentEmpty: document.getElementById('assignmentEmptyState'),
  refreshAssignments: document.getElementById('refreshAssignments'),
  resultsList: document.getElementById('resultsList'),
  resultsEmpty: document.getElementById('resultsEmptyState'),
  resultsDetail: document.getElementById('resultsDetail'),
  refreshResults: document.getElementById('refreshResults'),
  resultsClassFilter: document.getElementById('resultsClassFilter'),
  resultsAssignmentFilter: document.getElementById('resultsAssignmentFilter'),
  liveQuizForm: document.getElementById('liveQuizForm'),
  liveQuizClass: document.getElementById('liveQuizClass'),
  liveQuizTitle: document.getElementById('liveQuizTitle'),
  liveQuizModule: document.getElementById('liveQuizModule'),
  liveQuizTime: document.getElementById('liveQuizTime'),
  liveQuizSpeedBonus: document.getElementById('liveQuizSpeedBonus'),
  liveQuestionPrompt: document.getElementById('liveQuestionPrompt'),
  liveQuestionOptionA: document.getElementById('liveQuestionOptionA'),
  liveQuestionOptionB: document.getElementById('liveQuestionOptionB'),
  liveQuestionOptionC: document.getElementById('liveQuestionOptionC'),
  liveQuestionOptionD: document.getElementById('liveQuestionOptionD'),
  liveQuestionCorrect: document.getElementById('liveQuestionCorrect'),
  liveQuestionTime: document.getElementById('liveQuestionTime'),
  liveQuestionPoints: document.getElementById('liveQuestionPoints'),
  liveQuestionSpeed: document.getElementById('liveQuestionSpeed'),
  liveQuestionError: document.getElementById('liveQuestionError'),
  liveQuestionSummary: document.getElementById('liveQuestionSummary'),
  liveQuestionAdd: document.getElementById('liveQuestionAdd'),
  liveQuestionReset: document.getElementById('liveQuestionReset'),
  liveQuestionsList: document.getElementById('liveQuestionsList'),
  liveQuestionsEmpty: document.getElementById('liveQuestionsEmptyState'),
  liveQuizFeedback: document.getElementById('liveQuizFeedback'),
  liveQuizSave: document.getElementById('liveQuizSave'),
  liveQuizReset: document.getElementById('liveQuizReset'),
  liveQuizList: document.getElementById('liveQuizList'),
  liveQuizEmpty: document.getElementById('liveQuizEmptyState'),
  liveRefresh: document.getElementById('liveRefresh'),
  liveGameForm: document.getElementById('liveGameForm'),
  liveGameClass: document.getElementById('liveGameClass'),
  liveGameQuiz: document.getElementById('liveGameQuiz'),
  liveGameTime: document.getElementById('liveGameTime'),
  liveGamePoints: document.getElementById('liveGamePoints'),
  liveGameBonus: document.getElementById('liveGameBonus'),
  liveGameFeedback: document.getElementById('liveGameFeedback'),
  liveGameCreate: document.getElementById('liveGameCreate'),
  liveGameList: document.getElementById('liveGameList'),
  liveGameEmpty: document.getElementById('liveGameEmptyState'),
  liveGameRefresh: document.getElementById('liveGameRefresh'),
};

let previewChannel = null;

ensureLiveDrafts();

function getNested(source, keys, fallback) {
  let current = source;
  for (let index = 0; index < keys.length; index += 1) {
    if (current === null || current === undefined) {
      return fallback;
    }
    current = current[keys[index]];
  }
  return current === undefined ? fallback : current;
}

function coalesce(value, fallback) {
  return value === null || value === undefined ? fallback : value;
}

function readFormValue(formData, key) {
  if (!formData || typeof formData.get !== 'function') return '';
  const raw = formData.get(key);
  return raw === null || raw === undefined ? '' : String(raw);
}

function createLocalId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureLiveDrafts() {
  if (!state.live) {
    state.live = {
      quizzes: [],
      games: [],
      quizDraft: {
        classId: '',
        title: '',
        moduleId: '',
        defaultTimeLimit: 20,
        defaultPoints: 100,
        speedBonus: 5,
        questions: [],
      },
      questionDraft: null,
      gameDraft: {
        classId: '',
        quizId: '',
        timeLimit: 20,
        points: 100,
        speedBonus: 5,
      },
    };
  }
  if (!state.live.quizDraft) {
    state.live.quizDraft = {
      classId: '',
      title: '',
      moduleId: '',
      defaultTimeLimit: 20,
      defaultPoints: 100,
      speedBonus: 5,
      questions: [],
    };
  }
  if (!state.live.gameDraft) {
    state.live.gameDraft = {
      classId: '',
      quizId: '',
      timeLimit: 20,
      points: 100,
      speedBonus: 5,
    };
  }
  if (!state.live.questionDraft) {
    state.live.questionDraft = createLiveQuestionDraft();
  }
}

function ensureLiveQuestionDraft() {
  if (!state.live) state.live = {};
  if (!state.live.quizDraft) {
    state.live.quizDraft = {
      classId: '',
      title: '',
      moduleId: '',
      defaultTimeLimit: 20,
      defaultPoints: 100,
      speedBonus: 5,
      questions: [],
    };
  }
  if (!state.live.questionDraft) {
    state.live.questionDraft = createLiveQuestionDraft();
  }
}


function createLiveQuestionDraft() {
  const quizDraft = state.live ? state.live.quizDraft : null;
  const defaultTime = quizDraft && Number.isFinite(quizDraft.defaultTimeLimit)
    ? quizDraft.defaultTimeLimit
    : 20;
  const defaultPoints = quizDraft && Number.isFinite(quizDraft.defaultPoints)
    ? quizDraft.defaultPoints
    : 100;
  const defaultBonus = quizDraft && Number.isFinite(quizDraft.speedBonus)
    ? quizDraft.speedBonus
    : 0;
  return {
    id: createLocalId('liveq'),
    prompt: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
    correctOption: 'A',
    timeLimit: defaultTime,
    points: defaultPoints,
    speedBonus: defaultBonus,
  };
}

function setNestedState(path, value) {
  if (!path) return;
  const keys = path.split('.');
  let current = state;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (!Object.prototype.hasOwnProperty.call(current, key) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function getNestedState(path, fallback = '') {
  if (!path) return fallback;
  const keys = path.split('.');
  let current = state;
  for (let index = 0; index < keys.length; index += 1) {
    if (current === null || current === undefined) return fallback;
    current = current[keys[index]];
  }
  return current === undefined ? fallback : current;
}

function safeCssEscape(value) {
  if (typeof value !== 'string') return value;
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["]|\\/g, '\\$&');
}

function getActiveSupabaseConfig() {
  const resolved = resolveSupabaseConfig();
  if (!resolved.configured) {
    return null;
  }
  if (
    !cachedConfig ||
    cachedConfig.url !== resolved.url ||
    cachedConfig.anonKey !== resolved.anonKey
  ) {
    cachedConfig = resolved;
    if (state.supabase) {
      const authApi = state.supabase && state.supabase.auth ? state.supabase.auth : null;
      if (authApi && typeof authApi.signOut === 'function') {
        try {
          Promise.resolve(authApi.signOut({ scope: 'local' }));
        } catch (error) {
          console.warn('No s\'ha pogut reinicialitzar el client Supabase existent.', error);
        }
      }
      state.supabase = null;
    }
  }
  return cachedConfig;
}

function createSupabaseClient() {
  const config = getActiveSupabaseConfig();
  if (!config) return null;
  if (state.supabase) return state.supabase;
  try {
    state.supabase = createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return state.supabase;
  } catch (error) {
    console.error('No s\'ha pogut inicialitzar Supabase.', error);
    state.supabase = null;
    return null;
  }
}

function setVisibility(node, visible) {
  if (!node) return;
  node.classList.toggle('hidden', !visible);
}

function showError(node, message) {
  if (!node) return;
  node.textContent = message || '';
  node.classList.toggle('hidden', !message);
}

function resetAuthMessages() {
  showError(elements.authError, '');
  showError(elements.signupError, '');
  if (elements.signupSuccess) {
    elements.signupSuccess.textContent = '';
    elements.signupSuccess.classList.add('hidden');
  }
}

async function loadSession() {
  const client = createSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) {
    console.error('Error en recuperar la sessió', error);
    return null;
  }
  state.session = data.session || null;
  return state.session;
}

async function loadProfile() {
  const client = createSupabaseClient();
  if (!client) return null;
  const user = state.session && state.session.user ? state.session.user : null;
  const userId = user ? user.id : null;
  if (!userId) return null;
  state.profileError = null;
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('No s\'ha pogut recuperar el perfil', error);
    state.profile = null;
    state.profileError = error;
    return null;
  }
  if (!data) {
    const email = user && user.email ? user.email : '';
    const { error: insertError } = await client.from('profiles').insert({
      id: userId,
      full_name:
        (user && user.user_metadata && user.user_metadata.full_name)
          || email.split('@')[0]
          || 'Docent',
      email,
    });
    if (insertError) {
      console.error('No s\'ha pogut crear el perfil', insertError);
      state.profile = null;
      state.profileError = normalizeProfileInsertError(insertError);
      return null;
    }
    return loadProfile();
  }
  state.profile = data;
  state.profileError = null;
  return state.profile;
}

function supabaseErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  try {
    return JSON.stringify(error);
  } catch (serializationError) {
    console.warn('No s\'ha pogut serialitzar l\'error de Supabase', serializationError);
    return '';
  }
}

function normalizeProfileInsertError(error) {
  if (!error) return error;
  const message = typeof error.message === 'string' ? error.message : '';
  if (error.code === '23505') {
    return {
      ...error,
      message:
        "Ja existeix un altre perfil amb el mateix correu electrònic. Verifica que la fila de la taula `profiles` utilitzi el mateix `uuid` que l'usuari docent de Supabase Auth i elimina possibles duplicats abans de tornar-ho a provar.",
    };
  }
  if (message.includes('syntax error at or near "{"') || message.includes("import { createClient")) {
    return {
      ...error,
      message:
        "Supabase ha rebut codi JavaScript (`import { createClient } ...`) com si fos SQL. Torna a obrir `supabase/setup.sql` (botó **Raw**) i enganxa només aquest script al SQL Editor; no passis arxius `.js` al motor SQL abans de repetir l'operació.",
    };
  }
  return error;
}

function renderProfileWarning() {
  if (!elements.authError) return;
  if (state.session && !state.profile) {
    const detail = supabaseErrorMessage(state.profileError);
    const troubleshooting =
      "Sessió iniciada però no s'ha pogut carregar el perfil docent. Torna a preparar la base de dades de Supabase amb aquest itinerari SQL (tots els scripts són a la carpeta `supabase/` del projecte):\n" +
      "1. SQL Editor → botó **Raw** de `supabase/setup.sql`, enganxa'l sencer i prem **Run**. Si uses partides en viu, repeteix amb `supabase/live-mode.sql`.\n" +
      "2. Verifica que RLS estigui actiu amb `select n.nspname, c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname in ('profiles','classes','assignments','submissions','quizzes','quiz_questions','games','players','answers') order by c.relname;`.\n" +
      "3. Si alguna taula surt amb `relrowsecurity = f`, executa `alter table public.<taula> enable row level security;` (substitueix `<taula>` per cada nom que falti) i torna a llançar el bloc de polítiques de `supabase/setup.sql`.\n" +
      "4. Revisa que les polítiques existeixin amb `select pol.polname, tab.relname from pg_policy pol join pg_class tab on pol.polrelid = tab.oid join pg_namespace nsp on nsp.oid = tab.relnamespace where nsp.nspname = 'public' and tab.relname in ('profiles','classes','assignments','submissions','quizzes','quiz_questions','games','players','answers') order by tab.relname, pol.polname;`.\n" +
      "5. Comprova la fila del docent: `select id, full_name, email, role from public.profiles order by created_at desc;` i confirma que el teu `uuid` hi apareix amb `role = 'teacher'`.\n" +
      "6. Si falta o és incorrecta, recrea-la amb `insert into public.profiles (id, full_name, email) values ('<uuid>', '<Nom i cognoms>', '<correu@example.com>') on conflict (id) do update set full_name = excluded.full_name, email = excluded.email;`.\n" +
      "7. Verifica que el compte d'Auth estigui confirmat: `update auth.users set email_confirmed_at = now() where email = '<correu@example.com>' and email_confirmed_at is null;`.";
    const message = detail ? `${troubleshooting} Detall Supabase: ${detail}` : troubleshooting;
    showError(elements.authError, message);
    return;
  }
  showError(elements.authError, '');
}

function updateAuthUI() {
  const loggedIn = Boolean(state.session && state.profile);
  setVisibility(elements.authPanel, !loggedIn);
  setVisibility(elements.registerPanel, !loggedIn);
  setVisibility(elements.sessionPanel, loggedIn);
  setVisibility(elements.tabs, loggedIn);
  elements.tabPanels.forEach((panel) => setVisibility(panel, loggedIn && panel.dataset.tabPanel === state.activeTab));
  if (loggedIn) {
    elements.sessionName.textContent = state.profile.full_name || 'Docent';
    elements.sessionEmail.textContent = state.profile.email || '';
    switchTab(state.activeTab || 'classes');
  } else {
    state.activeTab = 'classes';
    switchTab(state.activeTab);
  }
}

function switchTab(tab) {
  state.activeTab = tab;
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle('portal-tab--active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  elements.tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === tab;
    panel.classList.toggle('hidden', !isActive);
    if (isActive) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', 'true');
    }
  });
}

function sanitizeListInput(value) {
  return (value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function generateJoinCode(existingCodes = new Set()) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 20; i += 1) {
    let code = '';
    for (let j = 0; j < 6; j += 1) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    if (!existingCodes.has(code)) return code;
  }
  return `FQ${Date.now().toString(36).toUpperCase()}`;
}

function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return `${value}`;
  const rounded = Math.round(numeric * 10) / 10;
  const output = Number.isInteger(rounded) ? Math.round(rounded) : rounded.toFixed(1);
  return `${output}%`;
}

function formatGradeForCell(value) {
  const percent = formatPercent(value);
  if (percent === '—') return '—';
  return percent.endsWith('%') ? percent.slice(0, -1) : percent;
}

function statusLabel(value) {
  if (!value) return '—';
  return STATUS_LABELS[value] || value;
}

function assignmentStatusLabel(value) {
  if (!value) return '—';
  return ASSIGNMENT_STATUS_LABELS[value] || value;
}

function formatDateTime(value, options = { dateStyle: 'short', timeStyle: 'short' }) {
  if (!value) return '';
  try {
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ca-ES', options).format(date);
  } catch (error) {
    console.warn('No s\'ha pogut formatejar la data', value, error);
    return '';
  }
}

function renderClassOptions() {
  const selects = [
    { node: elements.assignmentClassSelect, stateAccessor: null },
    { node: elements.liveQuizClass, stateAccessor: 'live.quizDraft.classId' },
    { node: elements.liveGameClass, stateAccessor: 'live.gameDraft.classId' },
  ];

  const options = state.classes.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name} · ${cls.join_code}`,
  }));

  selects.forEach((entry) => {
    const { node, stateAccessor } = entry;
    if (!node) return;
    node.innerHTML = '';
    if (!options.length) {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Cap classe disponible';
      node.appendChild(placeholder);
      if (stateAccessor) {
        setNestedState(stateAccessor, '');
      }
      return;
    }
    options.forEach((option) => {
      const element = document.createElement('option');
      element.value = option.value;
      element.textContent = option.label;
      node.appendChild(element);
    });
    if (stateAccessor) {
      const currentValue = getNestedState(stateAccessor);
      const hasValue = options.some((option) => option.value === currentValue);
      const desired = hasValue ? currentValue : options[0].value;
      setNestedState(stateAccessor, desired);
      node.value = desired;
    }
  });
}

function renderModuleOptions() {
  if (!elements.assignmentModuleSelect) return;
  elements.assignmentModuleSelect.innerHTML = '';
  const sorted = [...MODULES].sort((a, b) => a.category.localeCompare(b.category, 'ca') || a.name.localeCompare(b.name, 'ca'));
  let currentGroup = null;
  sorted.forEach((module) => {
    if (module.category !== currentGroup) {
      currentGroup = module.category;
      const optGroup = document.createElement('optgroup');
      optGroup.label = CATEGORY_LABELS[module.category] || module.category;
      elements.assignmentModuleSelect.appendChild(optGroup);
    }
    const option = document.createElement('option');
    option.value = module.id;
    option.textContent = module.name;
    elements.assignmentModuleSelect.appendChild(option);
  });
  const previousModule = state.assignmentDraft.moduleId;
  const desiredModule = sorted.some((module) => module.id === previousModule)
    ? previousModule
    : sorted.length > 0 && sorted[0] && sorted[0].id ? sorted[0].id : '';
  if (desiredModule) {
    elements.assignmentModuleSelect.value = desiredModule;
    syncAssignmentModuleFromSelect({ preserveQuestions: desiredModule === previousModule });
  } else {
    setCurrentModule('', { preserveQuestions: false });
  }

  if (elements.liveQuizModule) {
    const liveSelect = elements.liveQuizModule;
    const currentModule = state.live && state.live.quizDraft ? state.live.quizDraft.moduleId : '';
    liveSelect.innerHTML = '';
    const manualOption = document.createElement('option');
    manualOption.value = '';
    manualOption.textContent = '— Quiz manual —';
    liveSelect.appendChild(manualOption);
    let groupLabel = null;
    sorted.forEach((module) => {
      if (module.category !== groupLabel) {
        groupLabel = module.category;
        const optGroup = document.createElement('optgroup');
        optGroup.label = CATEGORY_LABELS[module.category] || module.category;
        liveSelect.appendChild(optGroup);
      }
      const option = document.createElement('option');
      option.value = module.id;
      option.textContent = module.name;
      const parentGroup = liveSelect.lastElementChild;
      if (parentGroup && parentGroup.tagName.toLowerCase() === 'optgroup') {
        parentGroup.appendChild(option);
      } else {
        liveSelect.appendChild(option);
      }
    });
    if (currentModule && liveSelect.querySelector(`option[value="${safeCssEscape(currentModule)}"]`)) {
      liveSelect.value = currentModule;
    } else {
      liveSelect.value = '';
      if (state.live && state.live.quizDraft) {
        state.live.quizDraft.moduleId = '';
      }
    }
  }
}

function syncLiveQuizFormInputs() {
  ensureLiveDrafts();
  const draft = state.live.quizDraft;
  if (elements.liveQuizClass) {
    const options = Array.from(elements.liveQuizClass.options || []);
    const hasValue = options.some((option) => option.value === draft.classId);
    if (hasValue) {
      elements.liveQuizClass.value = draft.classId;
    } else if (options.length > 0) {
      draft.classId = options[0].value;
      elements.liveQuizClass.value = draft.classId;
    }
  }
  if (elements.liveQuizTitle) {
    elements.liveQuizTitle.value = draft.title || '';
  }
  if (elements.liveQuizModule) {
    const moduleOption = elements.liveQuizModule.querySelector(`option[value="${safeCssEscape(draft.moduleId || '')}"]`);
    elements.liveQuizModule.value = moduleOption ? draft.moduleId : '';
    if (!moduleOption) {
      draft.moduleId = '';
    }
  }
  if (elements.liveQuizTime) {
    elements.liveQuizTime.value = Number.isFinite(draft.defaultTimeLimit) ? draft.defaultTimeLimit : 20;
  }
  if (elements.liveQuizSpeedBonus) {
    elements.liveQuizSpeedBonus.value = Number.isFinite(draft.speedBonus) ? draft.speedBonus : 0;
  }
  ensureLiveQuestionDraft();
  renderLiveQuestionDraft();
  renderLiveQuestions();
  renderLiveQuizSelectors();
}

function renderLiveQuestionDraft() {
  ensureLiveDrafts();
  const draft = state.live.questionDraft || createLiveQuestionDraft();
  state.live.questionDraft = draft;
  if (elements.liveQuestionPrompt) {
    elements.liveQuestionPrompt.value = draft.prompt || '';
  }
  const optionInputs = [
    elements.liveQuestionOptionA,
    elements.liveQuestionOptionB,
    elements.liveQuestionOptionC,
    elements.liveQuestionOptionD,
  ];
  optionInputs.forEach((input, index) => {
    if (!input) return;
    const option = draft.options[index];
    input.value = option && option.text ? option.text : '';
  });
  if (elements.liveQuestionCorrect) {
    elements.liveQuestionCorrect.value = draft.correctOption || 'A';
  }
  if (elements.liveQuestionTime) {
    elements.liveQuestionTime.value = Number.isFinite(draft.timeLimit) ? draft.timeLimit : 20;
  }
  if (elements.liveQuestionPoints) {
    elements.liveQuestionPoints.value = Number.isFinite(draft.points) ? draft.points : 100;
  }
  if (elements.liveQuestionSpeed) {
    elements.liveQuestionSpeed.value = Number.isFinite(draft.speedBonus) ? draft.speedBonus : 0;
  }
}

function resetLiveQuestionForm() {
  ensureLiveDrafts();
  state.live.questionDraft = createLiveQuestionDraft();
  if (elements.liveQuestionError) {
    elements.liveQuestionError.textContent = '';
    elements.liveQuestionError.classList.add('hidden');
  }
  renderLiveQuestionDraft();
}

function resetLiveQuizDraft({ preserveClass = true } = {}) {
  ensureLiveDrafts();
  const fallbackClass = preserveClass ? state.live.quizDraft.classId : '';
  const defaultClass = fallbackClass || (state.classes[0] ? state.classes[0].id : '');
  state.live.quizDraft = {
    classId: defaultClass,
    title: '',
    moduleId: '',
    defaultTimeLimit: 20,
    defaultPoints: 100,
    speedBonus: 5,
    questions: [],
  };
  state.live.questionDraft = createLiveQuestionDraft();
  syncLiveQuizFormInputs();
  renderLiveQuestions();
}

function renderLiveQuestions() {
  ensureLiveDrafts();
  const questions = Array.isArray(state.live.quizDraft.questions) ? state.live.quizDraft.questions : [];
  const list = elements.liveQuestionsList;
  const emptyState = elements.liveQuestionsEmpty;
  const summary = elements.liveQuestionSummary;
  if (!list || !emptyState || !summary) return;
  list.innerHTML = '';
  if (!questions.length) {
    emptyState.classList.remove('hidden');
    summary.textContent = 'Encara no hi ha preguntes afegides.';
    return;
  }
  emptyState.classList.add('hidden');
  summary.textContent = `${questions.length} preguntes manuals guardades.`;
  questions.forEach((question, index) => {
    const item = document.createElement('li');
    item.className = 'portal-live-question';
    item.dataset.questionId = question.id;

    const header = document.createElement('header');
    const title = document.createElement('h4');
    title.className = 'portal-live-question-title';
    title.textContent = `${index + 1}. ${question.prompt}`;
    header.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'portal-live-question-meta';
    const timePart = Number.isFinite(question.timeLimit) ? `${question.timeLimit}s` : '—';
    const pointsPart = Number.isFinite(question.points) ? `${question.points} punts` : '—';
    const bonusPart = Number.isFinite(question.speedBonus) && question.speedBonus > 0 ? `+${question.speedBonus}/s` : 'sense bonus';
    meta.textContent = `Temps: ${timePart} · Puntuació: ${pointsPart} · ${bonusPart}`;
    header.appendChild(meta);

    item.appendChild(header);

    const optionsList = document.createElement('ul');
    optionsList.className = 'portal-live-options';
    (question.options || []).forEach((option) => {
      if (!option || !option.text) return;
      const row = document.createElement('li');
      const badge = document.createElement('strong');
      badge.textContent = option.key || '';
      row.appendChild(badge);
      const span = document.createElement('span');
      span.textContent = option.text;
      if (option.key === question.correctOption) {
        span.style.fontWeight = '700';
      }
      row.appendChild(span);
      optionsList.appendChild(row);
    });
    item.appendChild(optionsList);

    const actions = document.createElement('div');
    actions.className = 'portal-live-question-actions';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn-ghost';
    removeButton.dataset.removeQuestionId = question.id;
    removeButton.textContent = 'Elimina';
    actions.appendChild(removeButton);
    item.appendChild(actions);

    list.appendChild(item);
  });
}

function renderLiveQuizSelectors() {
  ensureLiveDrafts();
  if (!elements.liveGameQuiz) return;
  const select = elements.liveGameQuiz;
  const quizzes = state.live.quizzes || [];
  const previousValue = state.live.gameDraft ? state.live.gameDraft.quizId : '';
  select.innerHTML = '';
  if (!quizzes.length) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Cap quiz disponible';
    select.appendChild(placeholder);
    setNestedState('live.gameDraft.quizId', '');
    return;
  }
  quizzes.forEach((quiz) => {
    const option = document.createElement('option');
    option.value = quiz.id;
    option.textContent = quiz.title;
    select.appendChild(option);
  });
  const hasPrevious = quizzes.some((quiz) => quiz.id === previousValue);
  const desired = hasPrevious ? previousValue : quizzes[0].id;
  setNestedState('live.gameDraft.quizId', desired);
  select.value = desired;
}

function syncLiveGameForm() {
  ensureLiveDrafts();
  const draft = state.live.gameDraft;
  if (elements.liveGameClass) {
    const options = Array.from(elements.liveGameClass.options || []);
    const hasValue = options.some((option) => option.value === draft.classId);
    if (hasValue) {
      elements.liveGameClass.value = draft.classId;
    } else if (options.length > 0) {
      draft.classId = options[0].value;
      elements.liveGameClass.value = draft.classId;
    }
  }
  if (elements.liveGameQuiz) {
    const options = Array.from(elements.liveGameQuiz.options || []);
    const hasValue = options.some((option) => option.value === draft.quizId);
    if (hasValue) {
      elements.liveGameQuiz.value = draft.quizId;
    } else if (options.length > 0) {
      draft.quizId = options[0].value;
      elements.liveGameQuiz.value = draft.quizId;
    }
  }
  if (elements.liveGameTime) {
    elements.liveGameTime.value = Number.isFinite(draft.timeLimit) ? draft.timeLimit : 20;
  }
  if (elements.liveGamePoints) {
    elements.liveGamePoints.value = Number.isFinite(draft.points) ? draft.points : 100;
  }
  if (elements.liveGameBonus) {
    elements.liveGameBonus.value = Number.isFinite(draft.speedBonus) ? draft.speedBonus : 0;
  }
}

function renderLiveQuizzes() {
  ensureLiveDrafts();
  const container = elements.liveQuizList;
  const emptyState = elements.liveQuizEmpty;
  if (!container || !emptyState) return;
  const quizzes = state.live.quizzes || [];
  container.innerHTML = '';
  if (!quizzes.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  quizzes.forEach((quiz) => {
    const card = document.createElement('article');
    card.className = 'portal-live-quiz-card';
    card.dataset.quizId = quiz.id;

    const title = document.createElement('h3');
    title.textContent = quiz.title;
    card.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'portal-muted';
    const classInfo = state.classes.find((cls) => cls.id === quiz.class_id);
    const moduleInfo = MODULES.find((mod) => mod.id === quiz.module_id);
    const parts = [];
    if (classInfo) {
      parts.push(`${classInfo.class_name} · ${classInfo.join_code}`);
    }
    if (moduleInfo) {
      parts.push(`Mòdul ${moduleInfo.name}`);
    } else if (quiz.module_id) {
      parts.push(`Mòdul ${quiz.module_id}`);
    }
    parts.push(`${quiz.questions.length} preguntes manuals`);
    meta.textContent = parts.join(' · ');
    card.appendChild(meta);

    const controls = document.createElement('div');
    controls.className = 'portal-live-question-actions';
    const useButton = document.createElement('button');
    useButton.type = 'button';
    useButton.className = 'btn-secondary';
    useButton.dataset.quizId = quiz.id;
    useButton.dataset.quizAction = 'focus';
    useButton.textContent = 'Utilitza al Live';
    controls.appendChild(useButton);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn-ghost';
    deleteButton.dataset.quizId = quiz.id;
    deleteButton.dataset.quizAction = 'delete';
    deleteButton.textContent = 'Elimina';
    controls.appendChild(deleteButton);

    card.appendChild(controls);
    container.appendChild(card);
  });
}

function renderLiveGames() {
  ensureLiveDrafts();
  const container = elements.liveGameList;
  const emptyState = elements.liveGameEmpty;
  if (!container || !emptyState) return;
  const games = state.live.games || [];
  container.innerHTML = '';
  if (!games.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  games.forEach((game) => {
    const card = document.createElement('article');
    card.className = 'portal-live-game-card';
    card.dataset.gameId = game.id;

    const header = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = game.quiz_title || 'Quiz Live';
    header.appendChild(title);

    const code = document.createElement('span');
    code.className = 'portal-live-game-code';
    code.textContent = game.join_code || '';
    header.appendChild(code);
    card.appendChild(header);

    const meta = document.createElement('p');
    meta.className = 'portal-live-game-meta';
    const classInfo = state.classes.find((cls) => cls.id === game.class_id);
    const statusLabel = game.status ? game.status.charAt(0).toUpperCase() + game.status.slice(1) : 'En preparació';
    const playerCount = Number.isFinite(game.player_count) ? `${game.player_count} alumnes` : 'Sense participants';
    const className = classInfo ? classInfo.class_name : game.class_name;
    const joinCode = classInfo ? classInfo.join_code : game.class_join_code;
    const classText = className ? (joinCode ? `${className} · ${joinCode}` : className) : '';
    const details = [classText, statusLabel, playerCount].filter(Boolean).join(' · ');
    meta.textContent = details;
    card.appendChild(meta);

    const link = document.createElement('p');
    link.className = 'portal-muted';
    const playUrl = new URL('../play/', window.location.href);
    const joinUrl = `${playUrl.origin}${playUrl.pathname}?code=${encodeURIComponent(game.join_code || '')}`;
    link.textContent = `Enllaç per als alumnes: ${joinUrl}`;
    card.appendChild(link);

    const actions = document.createElement('div');
    actions.className = 'portal-live-game-actions';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'btn-secondary';
    copyButton.dataset.gameId = game.id;
    copyButton.dataset.gameAction = 'copy';
    copyButton.textContent = 'Copia el codi';
    actions.appendChild(copyButton);

    const endButton = document.createElement('button');
    endButton.type = 'button';
    endButton.className = 'btn-ghost';
    endButton.dataset.gameId = game.id;
    endButton.dataset.gameAction = game.status === 'completed' ? 'archive' : 'close';
    endButton.textContent = game.status === 'completed' ? 'Arxiva' : 'Tanca partida';
    actions.appendChild(endButton);

    card.appendChild(actions);
    container.appendChild(card);
  });
}

function handleLiveQuestionAdd() {
  ensureLiveDrafts();
  const promptInput = elements.liveQuestionPrompt;
  const prompt = (promptInput && typeof promptInput.value === 'string' ? promptInput.value : '').trim();
  if (!prompt) {
    if (elements.liveQuestionError) {
      elements.liveQuestionError.textContent = 'Introdueix l\'enunciat de la pregunta.';
      elements.liveQuestionError.classList.remove('hidden');
    }
    return;
  }
  const optionInputs = [
    { node: elements.liveQuestionOptionA, key: 'A' },
    { node: elements.liveQuestionOptionB, key: 'B' },
    { node: elements.liveQuestionOptionC, key: 'C' },
    { node: elements.liveQuestionOptionD, key: 'D' },
  ];
  const options = optionInputs.map(({ node, key }) => ({
    key,
    text: (node && typeof node.value === 'string' ? node.value : '').trim(),
  }));
  const filled = options.filter((option) => option.text.length > 0);
  if (filled.length < 2) {
    if (elements.liveQuestionError) {
      elements.liveQuestionError.textContent = 'Calen almenys dues opcions amb text.';
      elements.liveQuestionError.classList.remove('hidden');
    }
    return;
  }
  const correctSelect = elements.liveQuestionCorrect;
  const desiredCorrect = correctSelect ? correctSelect.value : 'A';
  const hasCorrect = filled.some((option) => option.key === desiredCorrect);
  if (!hasCorrect) {
    if (elements.liveQuestionError) {
      elements.liveQuestionError.textContent = 'La resposta correcta ha de tenir text.';
      elements.liveQuestionError.classList.remove('hidden');
    }
    return;
  }
  const timeInput = elements.liveQuestionTime;
  const pointsInput = elements.liveQuestionPoints;
  const bonusInput = elements.liveQuestionSpeed;
  const rawTime = timeInput ? Number.parseInt(timeInput.value, 10) : NaN;
  const rawPoints = pointsInput ? Number.parseInt(pointsInput.value, 10) : NaN;
  const rawBonus = bonusInput ? Number.parseFloat(bonusInput.value) : NaN;
  const timeLimit = Number.isFinite(rawTime) ? Math.min(Math.max(rawTime, 5), 600) : state.live.quizDraft.defaultTimeLimit;
  const points = Number.isFinite(rawPoints) ? Math.min(Math.max(rawPoints, 0), 1000) : state.live.quizDraft.defaultPoints;
  const speedBonus = Number.isFinite(rawBonus) ? Math.min(Math.max(rawBonus, 0), 1000) : state.live.quizDraft.speedBonus;
  const question = {
    id: createLocalId('liveq'),
    prompt,
    options: options.map((option) => ({ key: option.key, text: option.text })),
    correctOption: desiredCorrect,
    timeLimit,
    points,
    speedBonus,
  };
  state.live.quizDraft.questions = [...state.live.quizDraft.questions, question];
  if (elements.liveQuestionError) {
    elements.liveQuestionError.textContent = '';
    elements.liveQuestionError.classList.add('hidden');
  }
  resetLiveQuestionForm();
  renderLiveQuestions();
}

function handleLiveQuestionRemove(questionId) {
  ensureLiveDrafts();
  if (!questionId) return;
  state.live.quizDraft.questions = state.live.quizDraft.questions.filter((question) => question.id !== questionId);
  renderLiveQuestions();
}

function handleLiveQuizFieldChange(event) {
  ensureLiveDrafts();
  const target = event ? event.target : null;
  if (!target) return;
  const value = target.value;
  switch (target.id) {
    case 'liveQuizClass':
      state.live.quizDraft.classId = value;
      state.live.gameDraft.classId = value;
      break;
    case 'liveQuizTitle':
      state.live.quizDraft.title = value;
      break;
    case 'liveQuizModule':
      state.live.quizDraft.moduleId = value || '';
      break;
    case 'liveQuizTime': {
      const numeric = Number.parseInt(value, 10);
      const sanitized = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 5), 600) : state.live.quizDraft.defaultTimeLimit;
      state.live.quizDraft.defaultTimeLimit = sanitized;
      if (state.live.questionDraft) {
        state.live.questionDraft.timeLimit = sanitized;
        renderLiveQuestionDraft();
      }
      break;
    }
    case 'liveQuizSpeedBonus': {
      const numeric = Number.parseFloat(value);
      const sanitized = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 1000) : state.live.quizDraft.speedBonus;
      state.live.quizDraft.speedBonus = sanitized;
      if (state.live.questionDraft) {
        state.live.questionDraft.speedBonus = sanitized;
        renderLiveQuestionDraft();
      }
      break;
    }
    default:
      break;
  }
}

function handleLiveQuestionFieldChange(event) {
  ensureLiveDrafts();
  const target = event ? event.target : null;
  if (!target) return;
  const draft = state.live.questionDraft;
  if (!draft) return;
  const value = target.value;
  switch (target.id) {
    case 'liveQuestionPrompt':
      draft.prompt = value;
      break;
    case 'liveQuestionOptionA':
      draft.options[0].text = value;
      break;
    case 'liveQuestionOptionB':
      draft.options[1].text = value;
      break;
    case 'liveQuestionOptionC':
      draft.options[2].text = value;
      break;
    case 'liveQuestionOptionD':
      draft.options[3].text = value;
      break;
    case 'liveQuestionCorrect':
      draft.correctOption = value || 'A';
      break;
    case 'liveQuestionTime': {
      const numeric = Number.parseInt(value, 10);
      draft.timeLimit = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 5), 600) : draft.timeLimit;
      break;
    }
    case 'liveQuestionPoints': {
      const numeric = Number.parseInt(value, 10);
      draft.points = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 1000) : draft.points;
      break;
    }
    case 'liveQuestionSpeed': {
      const numeric = Number.parseFloat(value);
      draft.speedBonus = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 1000) : draft.speedBonus;
      break;
    }
    default:
      break;
  }
}

function handleLiveGameFieldChange(event) {
  ensureLiveDrafts();
  const target = event ? event.target : null;
  if (!target) return;
  const value = target.value;
  switch (target.id) {
    case 'liveGameClass':
      state.live.gameDraft.classId = value;
      break;
    case 'liveGameTime': {
      const numeric = Number.parseInt(value, 10);
      state.live.gameDraft.timeLimit = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 5), 600) : state.live.gameDraft.timeLimit;
      break;
    }
    case 'liveGamePoints': {
      const numeric = Number.parseInt(value, 10);
      state.live.gameDraft.points = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 1000) : state.live.gameDraft.points;
      break;
    }
    case 'liveGameBonus': {
      const numeric = Number.parseFloat(value);
      state.live.gameDraft.speedBonus = Number.isFinite(numeric) ? Math.min(Math.max(numeric, 0), 1000) : state.live.gameDraft.speedBonus;
      break;
    }
    default:
      break;
  }
}

function handleLiveGameQuizChange(event) {
  ensureLiveDrafts();
  const target = event ? event.target : null;
  if (!target) return;
  const quizId = target.value;
  state.live.gameDraft.quizId = quizId;
  const quiz = state.live.quizzes.find((item) => item.id === quizId);
  if (quiz) {
    if (quiz.class_id) {
      state.live.gameDraft.classId = quiz.class_id;
      if (elements.liveGameClass) {
        elements.liveGameClass.value = quiz.class_id;
      }
      state.live.quizDraft.classId = quiz.class_id;
    }
    if (Number.isFinite(quiz.default_time_limit)) {
      state.live.gameDraft.timeLimit = quiz.default_time_limit;
      if (elements.liveGameTime) elements.liveGameTime.value = quiz.default_time_limit;
    }
    if (Number.isFinite(quiz.default_points)) {
      state.live.gameDraft.points = quiz.default_points;
      if (elements.liveGamePoints) elements.liveGamePoints.value = quiz.default_points;
    }
    if (Number.isFinite(quiz.speed_bonus)) {
      state.live.gameDraft.speedBonus = quiz.speed_bonus;
      if (elements.liveGameBonus) elements.liveGameBonus.value = quiz.speed_bonus;
    }
  }
}

function resolveModuleInfo(moduleOrId) {
  if (!moduleOrId) return null;
  if (typeof moduleOrId === 'string') {
    return MODULES.find((mod) => mod.id === moduleOrId) || null;
  }
  if (typeof moduleOrId === 'object' && moduleOrId !== null) {
    return moduleOrId;
  }
  return null;
}

function moduleSupportsLevels(moduleOrId) {
  const moduleInfo = resolveModuleInfo(moduleOrId);
  if (!moduleInfo) return true;
  return moduleInfo.usesLevels !== false;
}

function moduleFreeLevelLabel(moduleOrId) {
  const moduleInfo = resolveModuleInfo(moduleOrId);
  if (!moduleInfo) return 'Mode lliure';
  return moduleInfo.levelLabel || 'Mode lliure';
}

function updateAssignmentLevelField(moduleId = state.assignmentDraft.moduleId) {
  const moduleInfo = resolveModuleInfo(moduleId);
  const usesLevels = moduleSupportsLevels(moduleInfo);
  const field = elements.assignmentLevelField;
  const input = elements.assignmentLevelInput;
  if (field) {
    field.classList.toggle('hidden', !usesLevels);
    field.hidden = !usesLevels;
  }
  if (input) {
    input.disabled = !usesLevels;
    if (!usesLevels) {
      input.value = '4';
    } else if (!input.value) {
      input.value = '1';
    }
  }
}

function setCurrentModule(moduleId, { preserveQuestions = false, presetOptions = null } = {}) {
  state.assignmentDraft.moduleId = moduleId || '';
  let normalizedOptions = {};
  if (moduleId) {
    const baseOptions = presetOptions || getDefaultModuleOptions(moduleId) || {};
    normalizedOptions = normalizeModuleOptions(moduleId, cloneModuleOptions(baseOptions));
  }
  state.assignmentDraft.options = normalizedOptions;
  if (!preserveQuestions) {
    state.assignmentDraft.questionSet = [];
    state.assignmentDraft.notice = '';
    if (state.assignmentDraft.previewToken) {
      state.assignmentDraft.previewToken = '';
      closePreviewChannel();
    }
  }
  renderModuleConfigUI(moduleId);
  updateAssignmentLevelField(moduleId);
}

function syncAssignmentModuleFromSelect({ preserveQuestions = false } = {}) {
  if (!elements.assignmentModuleSelect) {
    setCurrentModule('', { preserveQuestions: false });
    return;
  }
  const moduleId = elements.assignmentModuleSelect.value || '';
  setCurrentModule(moduleId, { preserveQuestions });
}

function renderModuleConfigUI(moduleId) {
  const container = elements.moduleConfig;
  const body = elements.moduleConfigBody;
  if (!container || !body) return;
  body.innerHTML = '';
  if (!moduleId) {
    container.classList.add('hidden');
    updateModuleSummary();
    return;
  }
  const definition = getModuleOptionDefinition(moduleId);
  if (!definition) {
    container.classList.add('hidden');
    updateModuleSummary();
    return;
  }
  const moduleInfo = MODULES.find((mod) => mod.id === moduleId);
  if (elements.moduleConfigTitle) {
    elements.moduleConfigTitle.textContent = moduleInfo ? `Opcions per a ${moduleInfo.name}` : 'Opcions específiques';
  }
  if (elements.moduleConfigKicker) {
    const categoryLabel =
      moduleInfo && moduleInfo.category
        ? CATEGORY_LABELS[moduleInfo.category] || moduleInfo.category
        : null;
    elements.moduleConfigKicker.textContent = categoryLabel ? `Categoria ${categoryLabel}` : 'Personalitza el mòdul';
  }
  const optionsClone = cloneModuleOptions(state.assignmentDraft.options || {});
  const node = definition.render(optionsClone) || document.createElement('div');
  body.appendChild(node);
  container.classList.remove('hidden');
  const inputs = body.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.addEventListener('change', () => handleModuleConfigChanged({ fromUser: true }));
    input.addEventListener('input', () => handleModuleConfigChanged({ fromUser: true }));
  });
  handleModuleConfigChanged({ fromUser: false });
}

function invalidateQuestionSet(noticeText) {
  const hadCustomQuestions = Array.isArray(state.assignmentDraft.questionSet)
    && state.assignmentDraft.questionSet.length > 0;
  const hadPreviewToken = Boolean(state.assignmentDraft.previewToken);
  if (!hadCustomQuestions && !hadPreviewToken) {
    return false;
  }
  if (hadCustomQuestions) {
    state.assignmentDraft.questionSet = [];
  }
  if (hadPreviewToken) {
    state.assignmentDraft.previewToken = '';
    closePreviewChannel();
  }
  state.assignmentDraft.notice = noticeText || '';
  updateModuleSummary();
  return true;
}

function handleModuleConfigChanged({ fromUser = false } = {}) {
  const moduleId = state.assignmentDraft.moduleId;
  if (!moduleId) {
    updateModuleSummary();
    return;
  }
  const definition = getModuleOptionDefinition(moduleId);
  if (!definition || !elements.moduleConfigCard) {
    updateModuleSummary();
    return;
  }
  const raw = definition.collect(elements.moduleConfigCard) || {};
  const normalized = normalizeModuleOptions(moduleId, raw);
  const previous = JSON.stringify(state.assignmentDraft.options || {});
  const next = JSON.stringify(normalized || {});
  const changed = previous !== next;
  state.assignmentDraft.options = normalized;
  if (fromUser && changed) {
    const cleared = invalidateQuestionSet(
      'Has canviat les opcions. Previsualitza de nou per regenerar les preguntes.'
    );
    if (!cleared) {
      state.assignmentDraft.notice = 'Has canviat les opcions. Previsualitza de nou per regenerar les preguntes.';
      updateModuleSummary();
    }
    return;
  }
  if (!fromUser && !state.assignmentDraft.questionSet.length) {
    state.assignmentDraft.notice = '';
  }
  updateModuleSummary();
}

function handleBaseQuizConfigChanged(reason) {
  const hasCustomSet = Array.isArray(state.assignmentDraft.questionSet)
    && state.assignmentDraft.questionSet.length > 0;
  const hasPreviewToken = Boolean(state.assignmentDraft.previewToken);
  if (!hasCustomSet && !hasPreviewToken) return;

  let notice = 'Has actualitzat la configuració de la prova. Previsualitza de nou per regenerar les preguntes.';
  if (reason === 'count') {
    notice = 'Has canviat el nombre de preguntes. Previsualitza de nou per regenerar-les.';
  } else if (reason === 'level') {
    notice = 'Has canviat el nivell. Previsualitza de nou per regenerar les preguntes.';
  }

  invalidateQuestionSet(notice);
}

function updateModuleSummary() {
  const summaryNode = elements.moduleConfigSummary;
  const errorNode = elements.moduleConfigError;
  const noticeNode = elements.moduleConfigNotice;
  if (summaryNode) {
    const moduleId = state.assignmentDraft.moduleId;
    const options = state.assignmentDraft.options || {};
    const parts = [];
    const summary = moduleId ? summarizeModuleOptions(moduleId, options) : '';
    if (summary) parts.push(summary);
    if (state.assignmentDraft.questionSet.length) {
      parts.push(`Preguntes personalitzades (${state.assignmentDraft.questionSet.length})`);
    }
    const summaryText = parts.join(' · ');
    summaryNode.textContent = summaryText;
    summaryNode.classList.toggle('hidden', !summaryText);
    if (errorNode) {
      const errorText = moduleId ? validateModuleOptions(moduleId, options) : '';
      if (errorText) {
        errorNode.textContent = errorText;
        errorNode.classList.remove('hidden');
      } else {
        errorNode.textContent = '';
        errorNode.classList.add('hidden');
      }
    }
    if (noticeNode) {
      const noticeText = state.assignmentDraft.notice || '';
      noticeNode.textContent = noticeText;
      noticeNode.classList.toggle('hidden', !noticeText);
    }
  }
}

function collectModuleOptions() {
  const moduleId = state.assignmentDraft.moduleId;
  if (!moduleId) return {};
  const definition = getModuleOptionDefinition(moduleId);
  if (!definition || !elements.moduleConfigCard) return {};
  const raw = definition.collect(elements.moduleConfigCard) || {};
  const normalized = normalizeModuleOptions(moduleId, raw);
  state.assignmentDraft.options = normalized;
  return normalized;
}

function encodeQuizOptions(options) {
  if (!options || typeof options !== 'object') return '';
  try {
    const json = JSON.stringify(options);
    if (!json) return '';
    let binary = '';
    if (typeof TextEncoder !== 'undefined') {
      const bytes = new TextEncoder().encode(json);
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
    } else {
      binary = unescape(encodeURIComponent(json));
    }
    if (typeof btoa === 'function') {
      return btoa(binary).replace(/=+$/, '');
    }
  } catch (error) {
    console.error('No s\'ha pogut codificar la configuració de la prova', error);
  }
  return '';
}

function getPreviewChannelName(token) {
  return token ? `focusquiz-preview:${token}` : 'focusquiz-preview';
}

function closePreviewChannel() {
  if (previewChannel && typeof previewChannel.removeEventListener === 'function') {
    previewChannel.removeEventListener('message', handlePreviewChannelMessage);
  }
  if (previewChannel && typeof previewChannel.close === 'function') {
    previewChannel.close();
  }
  previewChannel = null;
}

function openPreviewChannel(token) {
  if (typeof BroadcastChannel === 'undefined') return;
  closePreviewChannel();
  try {
    previewChannel = new BroadcastChannel(getPreviewChannelName(token));
    previewChannel.addEventListener('message', handlePreviewChannelMessage);
  } catch (error) {
    previewChannel = null;
    console.warn('No s\'ha pogut obrir el canal de previsualització', error);
  }
}

function handlePreviewChannelMessage(event) {
  if (!event || !event.data || typeof event.data !== 'object') return;
  handlePreviewPayload(event.data);
}

function handlePreviewMessage(event) {
  if (!event || !event.data || typeof event.data !== 'object') return;
  const { origin, data } = event;
  const sameOrigin = !origin || origin === 'null' || origin === window.location.origin;
  if (!sameOrigin) return;
  handlePreviewPayload(data);
}

function handlePreviewStorageMessage(event) {
  if (!event || !event.key || !event.newValue) return;
  if (!event.key.startsWith('focusquiz-preview')) return;
  try {
    const data = JSON.parse(event.newValue);
    handlePreviewPayload(data);
  } catch (error) {
    console.warn('No s\'ha pogut llegir el missatge de previsualització des de l\'emmagatzematge', error);
  }
}

function handlePreviewPayload(data) {
  if (!data || data.type !== 'focusquiz-preview') return;
  if (!data.moduleId) return;
  const expectedToken = state.assignmentDraft.previewToken || '';
  if (expectedToken && data.previewToken && data.previewToken !== expectedToken) return;
  if (data.moduleId !== state.assignmentDraft.moduleId) return;
  if (data.options && typeof data.options === 'object') {
    const normalizedOptions = normalizeModuleOptions(
      data.moduleId,
      cloneModuleOptions(data.options || {})
    );
    state.assignmentDraft.options = normalizedOptions;
    renderModuleConfigUI(data.moduleId);
  }
  const questions = Array.isArray(data.questions)
    ? data.questions.map((question) => {
        try {
          return JSON.parse(JSON.stringify(question));
        } catch (_error) {
          return question;
        }
      })
    : [];
  state.assignmentDraft.questionSet = questions;
  state.assignmentDraft.notice = questions.length
    ? `Preguntes personalitzades guardades (${questions.length}).`
    : '';
  state.assignmentDraft.previewToken = data.previewToken || expectedToken;
  updateModuleSummary();
  if (elements.assignmentFeedback) {
    elements.assignmentFeedback.textContent = 'Previsualització guardada';
    setTimeout(() => {
      if (elements.assignmentFeedback.textContent === 'Previsualització guardada') {
        elements.assignmentFeedback.textContent = '';
      }
    }, 2500);
  }
}

function renderClasses() {
  const list = elements.classList;
  const empty = elements.classEmpty;
  if (!list || !empty) return;
  list.innerHTML = '';
  if (!state.classes.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  const template = document.getElementById('classCardTemplate');
  state.classes.forEach((cls) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = cls.id;
    node.querySelector('.portal-class-name').textContent = cls.class_name;
    const metaList = node.querySelector('.portal-class-meta');
    const addMeta = (label, value) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      metaList.appendChild(dt);
      metaList.appendChild(dd);
    };
    addMeta('Codi', cls.join_code);
    addMeta('Alumnes', cls.students.length);
    if (cls.created_at) {
      addMeta('Creada', new Date(cls.created_at).toLocaleString('ca-ES'));
    }
    const rosterDetails = node.querySelector('.portal-class-roster');
    const rosterForm = node.querySelector('.portal-class-roster-form');
    const textarea = rosterForm ? rosterForm.querySelector('textarea') : null;
    const focusRosterTextarea = () => {
      if (!textarea) return;
      textarea.focus({ preventScroll: false });
      const end = textarea.value.length;
      try {
        textarea.setSelectionRange(end, end);
      } catch (_error) {
        textarea.selectionStart = end;
        textarea.selectionEnd = end;
      }
    };
    if (textarea) {
      textarea.value = (cls.students || []).join('\n');
    }
    if (rosterForm) {
      rosterForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await updateRoster(cls.id, textarea ? textarea.value : '', node.querySelector('.portal-class-feedback'));
      });
    }
    if (rosterDetails) {
      rosterDetails.addEventListener('toggle', () => {
        if (rosterDetails.open) {
          focusRosterTextarea();
        }
      });
    }
    const editBtn = node.querySelector('.portal-class-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (rosterDetails && !rosterDetails.open) {
          rosterDetails.open = true;
        }
        focusRosterTextarea();
      });
    }
    const copyBtn = node.querySelector('.portal-class-copy');
    copyBtn.addEventListener('click', () => copyClassLink(cls, copyBtn));
    node.querySelector('.portal-class-delete').addEventListener('click', () => deleteClass(cls));
    list.appendChild(node);
  });
}

function renderAssignments() {
  const list = elements.assignmentList;
  const empty = elements.assignmentEmpty;
  if (!list || !empty) return;
  list.innerHTML = '';
  if (!state.assignments.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  const template = document.getElementById('assignmentCardTemplate');
  state.assignments.forEach((assignment) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = assignment.id;
    node.querySelector('.assignment-class').textContent = `${assignment.class.class_name} · ${assignment.class.join_code}`;
    const quizConfig = assignment.quiz_config || {};
    node.querySelector('.assignment-title').textContent = quizConfig.label || assignment.module_title;
    const meta = node.querySelector('.assignment-meta');
    const addMeta = (label, value) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      meta.appendChild(dt);
      meta.appendChild(dd);
    };
    addMeta('Mòdul', assignment.module_title);
    addMeta('Estat', assignmentStatusLabel(assignment.status));
    addMeta('Preguntes', coalesce(quizConfig.count, '—'));
    addMeta('Temps', quizConfig.time ? `${quizConfig.time} min` : 'Sense límit');
    const moduleInfo = resolveModuleInfo(assignment.module_id);
    const usesLevels = moduleSupportsLevels(moduleInfo);
    let levelText;
    if (usesLevels) {
      levelText = Number.isFinite(quizConfig.level) && quizConfig.level > 0 ? `Nivell ${quizConfig.level}` : '—';
    } else {
      levelText = quizConfig.levelLabel || moduleFreeLevelLabel(moduleInfo);
    }
    addMeta('Nivell', levelText);
    if (quizConfig.summary) {
      addMeta('Configuració', quizConfig.summary);
    }
    addMeta('Publicada', formatDateTime(assignment.date_assigned));
    if (assignment.due_at) {
      addMeta('Data límit', formatDateTime(assignment.due_at));
    }
    const assignmentCopyBtn = node.querySelector('.assignment-copy');
    assignmentCopyBtn.addEventListener('click', () => copyAssignmentLink(assignment, assignmentCopyBtn));
    const closeBtn = node.querySelector('.assignment-close');
    if (assignment.status === 'closed') {
      closeBtn.textContent = 'Prova tancada';
      closeBtn.disabled = true;
    } else {
      closeBtn.addEventListener('click', () => closeAssignment(assignment));
    }
    const deleteBtn = node.querySelector('.assignment-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteAssignment(assignment));
    }
    list.appendChild(node);
  });
}

function buildResultsFilters() {
  if (!elements.resultsClassFilter || !elements.resultsAssignmentFilter) return;
  elements.resultsClassFilter.innerHTML = '';
  const allClassesOption = document.createElement('option');
  allClassesOption.value = 'all';
  allClassesOption.textContent = 'Totes les classes';
  elements.resultsClassFilter.appendChild(allClassesOption);
  state.classes.forEach((cls) => {
    const option = document.createElement('option');
    option.value = cls.id;
    option.textContent = `${cls.class_name} · ${cls.join_code}`;
    elements.resultsClassFilter.appendChild(option);
  });

  elements.resultsAssignmentFilter.innerHTML = '';
  const allAssignmentsOption = document.createElement('option');
  allAssignmentsOption.value = 'all';
  allAssignmentsOption.textContent = 'Totes les proves';
  elements.resultsAssignmentFilter.appendChild(allAssignmentsOption);
  state.assignments.forEach((assignment) => {
    const option = document.createElement('option');
    option.value = assignment.id;
    const label = assignment.quiz_config && assignment.quiz_config.label ? assignment.quiz_config.label : assignment.module_title;
    option.textContent = label;
    elements.resultsAssignmentFilter.appendChild(option);
  });
}

function stringifyValue(value) {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.map((item) => stringifyValue(item)).join(', ');
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (typeof value.prompt === 'string') return value.prompt;
    if ('value' in value) return stringifyValue(value.value);
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('No s\'ha pogut convertir el valor', value, error);
      return String(value);
    }
  }
  return String(value);
}

function extractPrompt(wrong) {
  if (!wrong) return 'Pregunta desconeguda';
  if (typeof wrong === 'string') return wrong;
  const fields = ['question', 'prompt', 'text', 'statement', 'title', 'wording'];
  for (const field of fields) {
    if (wrong[field]) return stringifyValue(wrong[field]);
  }
  return 'Pregunta sense text';
}

function extractAnswer(wrong) {
  if (!wrong) return '—';
  const fields = ['answer', 'solution', 'correct', 'expected'];
  for (const field of fields) {
    if (wrong[field] !== undefined) return stringifyValue(wrong[field]);
  }
  return '—';
}

function extractUserAnswer(wrong) {
  if (!wrong) return '—';
  const fields = ['user', 'response', 'given', 'choice', 'selected'];
  for (const field of fields) {
    if (wrong[field] !== undefined) return stringifyValue(wrong[field]);
  }
  return '—';
}

function buildWrongDetails(submission) {
  const wrongs = getNested(submission, ['details', 'entry', 'wrongs'], null);
  if (!Array.isArray(wrongs) || wrongs.length === 0) return null;
  const wrapper = document.createElement('details');
  wrapper.className = 'portal-assignee-details';
  const summary = document.createElement('summary');
  summary.textContent = `Preguntes fallades (${wrongs.length})`;
  wrapper.appendChild(summary);
  const body = document.createElement('div');
  body.className = 'portal-assignee-details-body';
  wrongs.forEach((wrong, index) => {
    const item = document.createElement('div');
    item.className = 'portal-assignee-details-item';
    const title = document.createElement('strong');
    title.textContent = `#${index + 1}`;
    const prompt = document.createElement('p');
    prompt.className = 'portal-assignee-details-question';
    prompt.textContent = extractPrompt(wrong);
    const expected = document.createElement('p');
    expected.className = 'portal-assignee-details-expected';
    expected.textContent = `Resposta correcta: ${extractAnswer(wrong)}`;
    const user = document.createElement('p');
    user.className = 'portal-assignee-details-given';
    user.textContent = `Resposta alumne: ${extractUserAnswer(wrong)}`;
    item.appendChild(title);
    item.appendChild(prompt);
    item.appendChild(expected);
    item.appendChild(user);
    body.appendChild(item);
  });
  wrapper.appendChild(body);
  return wrapper;
}

function highlightActiveResultButton() {
  if (!elements.resultsList) return;
  const buttons = elements.resultsList.querySelectorAll('.results-grade');
  let activeAssignmentId = null;
  buttons.forEach((button) => {
    const isActive = button.dataset.submissionId === state.activeSubmissionId;
    button.classList.toggle('is-active', isActive);
    if (isActive && button.dataset.assignmentId) {
      activeAssignmentId = button.dataset.assignmentId;
    }
  });
  if (!activeAssignmentId && state.focusedResultAssignmentId) {
    activeAssignmentId = state.focusedResultAssignmentId;
  }
  const headers = elements.resultsList.querySelectorAll('.portal-results-table th[data-assignment-id]');
  headers.forEach((header) => {
    header.classList.toggle('is-active', !!activeAssignmentId && header.dataset.assignmentId === activeAssignmentId);
  });
  const cells = elements.resultsList.querySelectorAll('.portal-results-table td[data-assignment-id]');
  cells.forEach((cell) => {
    cell.classList.toggle('is-active', !!activeAssignmentId && cell.dataset.assignmentId === activeAssignmentId);
  });
  const navButtons = elements.resultsList.querySelectorAll('.portal-results-column-chip');
  navButtons.forEach((chip) => {
    const isActive = !!activeAssignmentId && chip.dataset.assignmentId === activeAssignmentId;
    chip.classList.toggle('is-active', isActive);
    chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function renderResultDetail(submission) {
  const container = elements.resultsDetail;
  if (!container) return;
  container.innerHTML = '';
  if (!submission) {
    container.classList.add('hidden');
    return;
  }
  const template = document.getElementById('resultDetailTemplate');
  if (!template) return;
  const node = template.content.firstElementChild.cloneNode(true);
  const studentName = submission.student_name || 'Alumne';
  const assignmentInfo = submission.assignment || {};
  const assignmentConfig = assignmentInfo.quiz_config || {};
  const assignmentTitle = assignmentConfig.label || assignmentInfo.module_title || 'Prova';
  const classLabel = submission.class_code
    ? `${submission.class_name} · ${submission.class_code}`
    : submission.class_name || '';
  const submittedAt = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleString('ca-ES')
    : null;

  const classNode = node.querySelector('.result-detail-class');
  if (classNode) {
    if (classLabel) {
      classNode.textContent = classLabel;
      classNode.classList.remove('hidden');
    } else {
      classNode.classList.add('hidden');
    }
  }

  const assignmentNode = node.querySelector('.result-detail-assignment');
  if (assignmentNode) {
    assignmentNode.textContent = assignmentTitle;
  }

  const metaNode = node.querySelector('.result-detail-meta');
  if (metaNode) {
    const metaParts = [];
    if (submittedAt) metaParts.push(`Enviada el ${submittedAt}`);
    if (submission.status) metaParts.push(statusLabel(submission.status));
    metaNode.textContent = metaParts.join(' · ');
  }

  const studentNode = node.querySelector('.result-student');
  if (studentNode) {
    studentNode.textContent = studentName;
  }

  const gradeNode = node.querySelector('.result-detail-grade');
  if (gradeNode) {
    const grade = formatPercent(submission.score);
    gradeNode.textContent = grade;
    gradeNode.setAttribute('title', grade);
  }

  const details = node.querySelector('.result-details');
  if (details) {
    details.innerHTML = '';
    const addMeta = (label, value) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      details.appendChild(dt);
      details.appendChild(dd);
    };
    addMeta('Classe', classLabel || '—');
    addMeta('Nota', formatPercent(submission.score));
    const countLabel = coalesce(submission.count, '?');
    addMeta('Encerts', submission.correct !== null ? `${submission.correct}/${countLabel}` : '—');
    addMeta('Temps', submission.time_spent ? `${Math.round(submission.time_spent / 60)} min` : '—');
    if (assignmentConfig.summary) {
      addMeta('Configuració', assignmentConfig.summary);
    }
    addMeta('Estat', statusLabel(submission.status));
  }

  const extra = node.querySelector('.result-extra');
  if (extra) {
    extra.innerHTML = '';
    const wrongDetails = buildWrongDetails(submission);
    if (wrongDetails) {
      extra.appendChild(wrongDetails);
      extra.classList.remove('hidden');
    } else {
      extra.classList.add('hidden');
    }
  }

  const editButton = node.querySelector('.result-edit');
  if (editButton) {
    editButton.addEventListener('click', () => editSubmissionScore(submission));
  }

  const resetButton = node.querySelector('.result-reset');
  if (resetButton) {
    resetButton.addEventListener('click', () => resetSubmission(submission));
  }

  container.appendChild(node);
  container.classList.remove('hidden');
}

function setActiveSubmission(submission) {
  state.activeSubmissionId = submission ? submission.id : null;
  if (submission) {
    const assignmentId =
      submission.assignment_id || getNested(submission, ['assignment', 'id'], null);
    if (assignmentId) {
      state.focusedResultAssignmentId = assignmentId;
    }
  }
  renderResultDetail(submission || null);
  highlightActiveResultButton();
}

function renderResults() {
  const list = elements.resultsList;
  const empty = elements.resultsEmpty;
  if (!list || !empty) return;
  list.innerHTML = '';
  const classFilterSelect = elements.resultsClassFilter;
  const classFilter = classFilterSelect && classFilterSelect.value ? classFilterSelect.value : 'all';
  const assignmentFilterSelect = elements.resultsAssignmentFilter;
  const assignmentFilter =
    assignmentFilterSelect && assignmentFilterSelect.value
      ? assignmentFilterSelect.value
      : 'all';
  const filtered = state.submissions.filter((submission) => {
    const classMatch = classFilter === 'all' || submission.class_id === classFilter;
    const assignmentMatch = assignmentFilter === 'all' || submission.assignment_id === assignmentFilter;
    return classMatch && assignmentMatch;
  });
  if (!filtered.length) {
    empty.classList.remove('hidden');
    state.activeSubmissionId = null;
    state.focusedResultAssignmentId = null;
    renderResultDetail(null);
    highlightActiveResultButton();
    return;
  }
  empty.classList.add('hidden');

  const assignmentMap = new Map();
  const studentMap = new Map();

  filtered.forEach((submission) => {
    const assignmentId = submission.assignment_id || getNested(submission, ['assignment', 'id'], null);
    if (!assignmentId) return;
    if (!assignmentMap.has(assignmentId)) {
      const assignmentInfo = submission.assignment || {};
      const assignmentConfig = assignmentInfo.quiz_config || {};
      const assignmentTitle = assignmentConfig.label || assignmentInfo.module_title || 'Prova';
      const classLabel =
        submission.class_name ||
        getNested(submission, ['class', 'class_name'], '') ||
        getNested(assignmentInfo, ['class', 'class_name'], '');
      const joinCode =
        submission.class_join_code ||
        getNested(submission, ['class', 'join_code'], '') ||
        getNested(assignmentInfo, ['class', 'join_code'], '');
      const dueAt = assignmentInfo.due_at || assignmentConfig.due_at || null;
      const status = assignmentInfo.status || submission.assignment_status || null;
      assignmentMap.set(assignmentId, {
        id: assignmentId,
        title: assignmentTitle,
        classLabel,
        joinCode,
        dueAt,
        dueLabel: formatDateTime(dueAt, { dateStyle: 'short', timeStyle: 'short' }),
        status,
        statusLabel: assignmentStatusLabel(status),
      });
    }
    const studentKey =
      submission.student_id ||
      submission.student_email ||
      `${submission.student_name || 'Sense nom'}::${submission.class_id || ''}`;
    if (!studentMap.has(studentKey)) {
      studentMap.set(studentKey, {
        key: studentKey,
        name: submission.student_name || 'Sense nom',
        submissions: new Map(),
      });
    }
    studentMap.get(studentKey).submissions.set(assignmentId, submission);
  });

  let assignments = Array.from(assignmentMap.values());
  if (assignmentFilter !== 'all') {
    assignments = assignments.filter((assignment) => assignment.id === assignmentFilter);
  }
  assignments.sort((a, b) => a.title.localeCompare(b.title, 'ca', { sensitivity: 'base', numeric: true }));

  const students = Array.from(studentMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ca', { sensitivity: 'base' })
  );

  if (!assignments.length || !students.length) {
    empty.classList.remove('hidden');
    state.activeSubmissionId = null;
    state.focusedResultAssignmentId = null;
    renderResultDetail(null);
    highlightActiveResultButton();
    return;
  }

  if (
    state.focusedResultAssignmentId &&
    !assignments.some((assignment) => assignment.id === state.focusedResultAssignmentId)
  ) {
    state.focusedResultAssignmentId = null;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'portal-results-table-wrapper';

  const columnNav = document.createElement('div');
  columnNav.className = 'portal-results-column-nav';
  columnNav.setAttribute('role', 'group');
  columnNav.setAttribute('aria-label', 'Navega per proves assignades');
  wrapper.appendChild(columnNav);

  const scrollArea = document.createElement('div');
  scrollArea.className = 'portal-results-table-scroll';
  wrapper.appendChild(scrollArea);

  const table = document.createElement('table');
  table.className = 'portal-results-table';
  const caption = document.createElement('caption');
  caption.className = 'portal-visually-hidden';
  caption.textContent = 'Taula de resultats per alumne i prova assignada';
  table.appendChild(caption);
  scrollArea.appendChild(table);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const nameHeader = document.createElement('th');
  nameHeader.scope = 'col';
  nameHeader.className = 'results-table-name';
  nameHeader.textContent = 'Alumne';
  headerRow.appendChild(nameHeader);

  assignments.forEach((assignment, index) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.dataset.assignmentId = assignment.id;
    th.dataset.columnIndex = String(index);
    const headerBlock = document.createElement('div');
    headerBlock.className = 'results-assignment-label';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'results-assignment-title';
    titleSpan.textContent = assignment.title;
    headerBlock.appendChild(titleSpan);
    const metaParts = [];
    if (assignment.classLabel) {
      metaParts.push(assignment.joinCode ? `${assignment.classLabel} · ${assignment.joinCode}` : assignment.classLabel);
    } else if (assignment.joinCode) {
      metaParts.push(`Codi ${assignment.joinCode}`);
    }
    if (assignment.statusLabel && assignment.statusLabel !== '—') {
      metaParts.push(assignment.statusLabel);
    }
    if (assignment.dueLabel) {
      metaParts.push(`Límit ${assignment.dueLabel}`);
    }
    if (metaParts.length) {
      const meta = document.createElement('span');
      meta.className = 'results-assignment-meta';
      meta.textContent = metaParts.join(' · ');
      headerBlock.appendChild(meta);
    }
    th.appendChild(headerBlock);
    headerRow.appendChild(th);

    const navButton = document.createElement('button');
    navButton.type = 'button';
    navButton.className = 'portal-results-column-chip';
    navButton.dataset.assignmentId = assignment.id;
    navButton.dataset.columnIndex = String(index);
    navButton.textContent = assignment.title;
    const navMeta = [assignment.classLabel, assignment.statusLabel, assignment.dueLabel]
      .filter((item) => item && item !== '—')
      .join(' · ');
    if (navMeta) {
      navButton.title = `${assignment.title} · ${navMeta}`;
      navButton.setAttribute('aria-label', `${assignment.title}. ${navMeta}`);
    } else {
      navButton.setAttribute('aria-label', assignment.title);
    }
    navButton.addEventListener('click', () => {
      state.activeSubmissionId = null;
      state.focusedResultAssignmentId = navButton.dataset.assignmentId || null;
      renderResultDetail(null);
      highlightActiveResultButton();
      const target = scrollArea.querySelector(`th[data-column-index="${navButton.dataset.columnIndex}"]`);
      if (target) {
        const desired = Math.max(0, target.offsetLeft - 120);
        scrollArea.scrollTo({
          left: desired,
          behavior: 'smooth',
        });
      }
    });
    columnNav.appendChild(navButton);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  students.forEach((student) => {
    const row = document.createElement('tr');
    const studentCell = document.createElement('th');
    studentCell.scope = 'row';
    studentCell.textContent = student.name;
    row.appendChild(studentCell);
    assignments.forEach((assignment, index) => {
      const cell = document.createElement('td');
      cell.dataset.assignmentId = assignment.id;
      cell.dataset.columnIndex = String(index);
      const submission = student.submissions.get(assignment.id);
      if (submission) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'results-grade';
        button.dataset.submissionId = submission.id;
        button.dataset.assignmentId = assignment.id;
        button.dataset.columnIndex = String(index);
        const percentText = formatPercent(submission.score);
        button.textContent = formatGradeForCell(submission.score);
        button.title = `${student.name} · ${assignment.title}: ${percentText}`;
        button.setAttribute('aria-label', `${student.name} · ${assignment.title}: ${percentText}`);
        button.addEventListener('click', () => {
          state.focusedResultAssignmentId = button.dataset.assignmentId || null;
          if (state.activeSubmissionId === submission.id) {
            setActiveSubmission(null);
          } else {
            setActiveSubmission(submission);
          }
        });
        cell.appendChild(button);
      } else {
        cell.classList.add('results-missing');
        cell.textContent = '—';
      }
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  list.appendChild(wrapper);

  const activeSubmission = filtered.find((submission) => submission.id === state.activeSubmissionId) || null;
  if (activeSubmission) {
    renderResultDetail(activeSubmission);
  } else {
    state.activeSubmissionId = null;
    renderResultDetail(null);
  }
  highlightActiveResultButton();
}

async function updateRoster(classId, rawValue, feedbackNode) {
  const names = sanitizeListInput(rawValue);
  const existing = state.classes.find((cls) => cls.id === classId);
  if (!existing) return;
  const client = createSupabaseClient();
  if (!client) return;
  feedbackNode.textContent = 'Guardant...';
  const desiredList = Array.from(new Set(names));
  try {
    const { error } = await client
      .from('classes')
      .update({ students: desiredList, updated_at: new Date().toISOString() })
      .eq('id', classId);
    if (error) throw error;
    feedbackNode.textContent = 'Llista actualitzada';
    await loadClasses();
    renderClasses();
  } catch (error) {
    console.error('No s\'ha pogut actualitzar la llista d\'alumnes', error);
    feedbackNode.textContent = 'Error en actualitzar la llista.';
  }
  setTimeout(() => {
    feedbackNode.textContent = '';
  }, 2500);
}

async function copyClassLink(cls, button) {
  try {
    const url = new URL('../class.html', window.location.href);
    url.searchParams.set('code', cls.join_code);
    await navigator.clipboard.writeText(url.toString());
    if (button) {
      const original = button.textContent;
      button.textContent = 'Copiat!';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = original;
        button.disabled = false;
      }, 2200);
    }
  } catch (error) {
    console.error('No s\'ha pogut copiar l\'enllaç', error);
  }
}

async function copyAssignmentLink(assignment, button) {
  try {
    const url = new URL('../class.html', window.location.href);
    url.searchParams.set('code', assignment.class.join_code);
    await navigator.clipboard.writeText(url.toString());
    if (button) {
      const original = button.textContent;
      button.textContent = 'Copiat!';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = original;
        button.disabled = false;
      }, 2200);
    }
  } catch (error) {
    console.error('No s\'ha pogut copiar l\'enllaç', error);
  }
}

async function deleteClass(cls) {
  if (!window.confirm(`Segur que vols eliminar la classe ${cls.class_name}? Aquesta acció esborrarà també les proves vinculades.`)) {
    return;
  }
  const client = createSupabaseClient();
  if (!client) return;
  const { error } = await client.from('classes').delete().eq('id', cls.id);
  if (error) {
    console.error('No s\'ha pogut eliminar la classe', error);
    return;
  }
  await Promise.all([loadClasses(), loadAssignments(), loadSubmissions()]);
  renderAll();
}

async function closeAssignment(assignment) {
  const client = createSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('assignments')
    .update({ status: 'closed' })
    .eq('id', assignment.id);
  if (error) {
    console.error('No s\'ha pogut tancar la prova', error);
    return;
  }
  await Promise.all([loadAssignments(), loadSubmissions()]);
  renderAssignments();
  buildResultsFilters();
  renderResults();
}

async function deleteAssignment(assignment) {
  const label = getNested(assignment, ['quiz_config', 'label'], '') || assignment.module_title || 'aquesta prova';
  if (!window.confirm(`Segur que vols eliminar ${label}? Aquesta acció esborrarà les notes vinculades.`)) {
    return;
  }
  const client = createSupabaseClient();
  if (!client) return;
  const { error } = await client.from('assignments').delete().eq('id', assignment.id);
  if (error) {
    console.error('No s\'ha pogut eliminar la prova', error);
    return;
  }
  await Promise.all([loadAssignments(), loadSubmissions()]);
  renderAssignments();
  buildResultsFilters();
  renderResults();
}

async function resetSubmission(submission) {
  const client = createSupabaseClient();
  if (!client) return;
  if (!window.confirm(`Permetre un nou intent a ${submission.student_name}?`)) {
    return;
  }
  const { error } = await client.from('submissions').delete().eq('id', submission.id);
  if (error) {
    console.error('No s\'ha pogut eliminar la submissió', error);
    return;
  }
  await loadSubmissions();
  renderResults();
}

async function editSubmissionScore(submission) {
  const client = createSupabaseClient();
  if (!client) return;
  const current = submission.score !== null && submission.score !== undefined ? String(submission.score) : '';
  const input = window.prompt(`Nova nota per a ${submission.student_name} (0-100)`, current);
  if (input === null) return;
  const sanitized = input.replace(',', '.').trim();
  if (!sanitized) {
    window.alert('Introdueix una nota numèrica.');
    return;
  }
  const numeric = Number.parseFloat(sanitized);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
    window.alert('La nota ha d\'estar entre 0 i 100.');
    return;
  }
  try {
    const { error } = await client
      .from('submissions')
      .update({ score: numeric, status: 'reviewed', updated_at: new Date().toISOString() })
      .eq('id', submission.id);
    if (error) throw error;
    await loadSubmissions();
    renderResults();
  } catch (error) {
    console.error('No s\'ha pogut actualitzar la nota', error);
    window.alert('No s\'ha pogut guardar la nota. Torna-ho a provar.');
  }
}

async function createClass(formData) {
  const client = createSupabaseClient();
  if (!client) return;
  const className = readFormValue(formData, 'class_name').trim();
  const studentNames = sanitizeListInput(readFormValue(formData, 'student_list'));
  if (!className) {
    elements.classFeedback.textContent = 'Introdueix un nom de classe.';
    return;
  }
  const existingCodes = new Set(state.classes.map((cls) => cls.join_code));
  const joinCode = generateJoinCode(existingCodes);
  elements.classFeedback.textContent = 'Creant classe...';
  try {
    const payload = {
      class_name: className,
      teacher_id: state.profile.id,
      join_code: joinCode,
      students: studentNames,
    };
    const { error } = await client.from('classes').insert(payload);
    if (error) throw error;
    elements.classFeedback.textContent = 'Classe creada correctament';
    elements.classForm.reset();
    await loadClasses();
    renderAll();
  } catch (error) {
    console.error('No s\'ha pogut crear la classe', error);
    elements.classFeedback.textContent = 'Error en crear la classe.';
  }
  setTimeout(() => {
    elements.classFeedback.textContent = '';
  }, 2500);
}

async function createAssignment(formData) {
  const client = createSupabaseClient();
  if (!client) return;
  const classId = formData.get('class_id');
  const moduleId = formData.get('module_id');
  if (!classId || !moduleId) {
    elements.assignmentFeedback.textContent = 'Selecciona una classe i un mòdul.';
    return;
  }
  const selectedClass = state.classes.find((cls) => cls.id === classId);
  const module = MODULES.find((mod) => mod.id === moduleId);
  const labelRaw = readFormValue(formData, 'assignment_label').trim();
  const selectedClassName = selectedClass ? selectedClass.class_name : '';
  const moduleName = module ? module.name : '';
  const label = labelRaw || `${selectedClassName || ''} · ${moduleName || 'Prova'}`;
  const countRaw = Number.parseInt(formData.get('count'), 10);
  const timeRaw = Number.parseInt(formData.get('time'), 10);
  const usesLevels = moduleSupportsLevels(module);
  const levelRaw = Number.parseInt(formData.get('level'), 10);
  const count = Number.isFinite(countRaw) ? Math.min(Math.max(countRaw, 1), 200) : null;
  const time = Number.isFinite(timeRaw) ? Math.min(Math.max(timeRaw, 0), 180) : null;
  const level = usesLevels
    ? (Number.isFinite(levelRaw) ? Math.min(Math.max(levelRaw, 1), 4) : 1)
    : 4;
  const storedLevel = usesLevels ? level : 0;
  const levelLabel = usesLevels ? null : moduleFreeLevelLabel(module);
  const dueAtRaw = readFormValue(formData, 'due_at').trim();
  const notesValue = readFormValue(formData, 'notes').trim();
  const notes = notesValue ? notesValue : null;
  const moduleOptions = collectModuleOptions();
  const questionSet = Array.isArray(state.assignmentDraft.questionSet)
    ? state.assignmentDraft.questionSet.map((question) => {
        try {
          return JSON.parse(JSON.stringify(question));
        } catch (_error) {
          return question;
        }
      })
    : [];
  const quizConfig = {
    label,
    count: Number.isFinite(count) ? count : null,
    time: Number.isFinite(time) ? time : 0,
    level: storedLevel,
  };
  if (levelLabel) {
    quizConfig.levelLabel = levelLabel;
  }
  const summaryParts = [];
  const optionsSummary = summarizeModuleOptions(moduleId, moduleOptions);
  if (optionsSummary) summaryParts.push(optionsSummary);
  if (questionSet.length) summaryParts.push(`Preguntes personalitzades (${questionSet.length})`);
  if (summaryParts.length) {
    quizConfig.summary = summaryParts.join(' · ');
  }
  const hasModuleOptions = moduleOptions && Object.keys(moduleOptions).length > 0;
  if (hasModuleOptions || questionSet.length) {
    const optionsPayload = cloneModuleOptions(moduleOptions) || {};
    if (questionSet.length) {
      optionsPayload.questions = questionSet;
    }
    quizConfig.options = optionsPayload;
  }
  elements.assignmentFeedback.textContent = 'Publicant la prova...';
  try {
    const payload = {
      class_id: classId,
      module_id: moduleId,
      module_title: moduleName || moduleId,
      quiz_config: quizConfig,
      status: 'published',
      due_at: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
      notes,
    };
    const { error } = await client.from('assignments').insert(payload);
    if (error) throw error;
    elements.assignmentFeedback.textContent = 'Prova publicada';
    elements.assignmentForm.reset();
    state.assignmentDraft.questionSet = [];
    state.assignmentDraft.notice = '';
    syncAssignmentModuleFromSelect();
    await Promise.all([loadAssignments(), loadSubmissions()]);
    renderAll();
  } catch (error) {
    console.error('No s\'ha pogut crear la prova', error);
    elements.assignmentFeedback.textContent = 'Error en publicar la prova.';
  }
  setTimeout(() => {
    elements.assignmentFeedback.textContent = '';
  }, 2500);
}

async function previewSelectedModule() {
  const moduleSelect = elements.assignmentModuleSelect;
  const moduleId = moduleSelect && moduleSelect.value ? moduleSelect.value : '';
  if (!moduleId) return;
  const formData = elements.assignmentForm ? new FormData(elements.assignmentForm) : new FormData();
  const module = MODULES.find((mod) => mod.id === moduleId);
  const classId = formData.get('class_id');
  const selectedClass = state.classes.find((cls) => cls.id === classId);
  const rawLabel = readFormValue(formData, 'assignment_label');
  const trimmedLabel = rawLabel.trim();
  const selectedClassName = selectedClass ? selectedClass.class_name : '';
  const moduleName = module ? module.name : '';
  const label = trimmedLabel
    ? trimmedLabel
    : `${selectedClassName || 'Classe'} · ${moduleName || 'Prova'}`;
  const countRaw = Number.parseInt(formData.get('count'), 10);
  const timeRaw = Number.parseInt(formData.get('time'), 10);
  const usesLevels = moduleSupportsLevels(module);
  const levelRaw = Number.parseInt(formData.get('level'), 10);
  const count = Number.isFinite(countRaw) ? Math.min(Math.max(countRaw, 1), 200) : 0;
  const time = Number.isFinite(timeRaw) ? Math.min(Math.max(timeRaw, 0), 180) : 0;
  const level = usesLevels
    ? (Number.isFinite(levelRaw) ? Math.min(Math.max(levelRaw, 1), 4) : 1)
    : 4;
  const moduleOptions = collectModuleOptions();
  const validationError = validateModuleOptions(moduleId, moduleOptions);
  if (validationError) {
    updateModuleSummary();
    if (elements.assignmentFeedback) {
      elements.assignmentFeedback.textContent = 'Revisa les opcions del mòdul abans de previsualitzar.';
      setTimeout(() => {
        if (elements.assignmentFeedback.textContent === 'Revisa les opcions del mòdul abans de previsualitzar.') {
          elements.assignmentFeedback.textContent = '';
        }
      }, 2500);
    }
    return;
  }
  const previewOptions = cloneModuleOptions(moduleOptions) || {};
  if (state.assignmentDraft.questionSet.length) {
    previewOptions.questions = state.assignmentDraft.questionSet.map((question) => {
      try {
        return JSON.parse(JSON.stringify(question));
      } catch (_error) {
        return question;
      }
    });
  }
  const encodedOptions = encodeQuizOptions(previewOptions);
  const previewToken = `fq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  state.assignmentDraft.previewToken = previewToken;
  openPreviewChannel(previewToken);
  const url = new URL('../index.html', window.location.href);
  url.searchParams.set('module', moduleId);
  if (label) url.searchParams.set('label', label);
  if (moduleName) url.searchParams.set('title', moduleName);
  if (Number.isFinite(count) && count > 0) url.searchParams.set('count', String(Math.min(Math.max(count, 1), 200)));
  if (Number.isFinite(time) && time > 0) url.searchParams.set('time', String(Math.min(Math.max(time, 0), 180)));
  if (usesLevels && Number.isFinite(level)) {
    url.searchParams.set('level', String(Math.min(Math.max(level, 1), 4)));
  }
  if (encodedOptions) url.searchParams.set('opts', encodedOptions);
  url.searchParams.set('preview', '1');
  url.searchParams.set('autostart', '1');
  url.searchParams.set('previewToken', previewToken);
  window.open(url.toString(), '_blank', 'noopener');
}

async function loadClasses() {
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  const { data, error } = await client
    .from('classes')
    .select('id, class_name, join_code, students, created_at, updated_at')
    .eq('teacher_id', state.profile.id)
    .order('class_name', { ascending: true });
  if (error) {
    console.error('No s\'han pogut recuperar les classes', error);
    return;
  }
  state.classes = (data || []).map((cls) => ({
    ...cls,
    students: Array.isArray(cls.students)
      ? cls.students.map((name) => name.trim()).filter((name) => name.length > 0)
      : [],
  }));
  renderClassOptions();
}

async function loadAssignments() {
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  const classIds = state.classes.map((cls) => cls.id);
  if (!classIds.length) {
    state.assignments = [];
    return;
  }
  let assignmentQuery = client
    .from('assignments')
    .select('id, class_id, module_id, module_title, quiz_config, status, date_assigned, due_at, notes, classes(id, class_name, join_code)')
    .order('date_assigned', { ascending: false });
  if (classIds.length) {
    assignmentQuery = assignmentQuery.in('class_id', classIds);
  }
  const { data, error } = await assignmentQuery;
  if (error) {
    console.error('No s\'han pogut recuperar les assignacions', error);
    return;
  }
  state.assignments = (data || []).filter((item) => {
    if (!item.classes) return false;
    return state.classes.some((cls) => cls.id === item.classes.id);
  }).map((item) => ({
    id: item.id,
    class_id: item.class_id,
    module_id: item.module_id,
    module_title: item.module_title,
    quiz_config: item.quiz_config || {},
    status: item.status,
    date_assigned: item.date_assigned,
    due_at: item.due_at,
    notes: item.notes,
    class: item.classes,
  }));
}

async function loadSubmissions() {
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  const classIds = state.classes.map((cls) => cls.id);
  if (!classIds.length) {
    state.submissions = [];
    return;
  }
  let submissionQuery = client
    .from('submissions')
    .select(
      'id, assignment_id, class_id, class_code, student_name, score, correct, count, time_spent, status, submitted_at, updated_at, assignments(id, module_title, quiz_config, class_id, classes(class_name, join_code))'
    )
    .order('submitted_at', { ascending: false });
  if (classIds.length) {
    submissionQuery = submissionQuery.in('class_id', classIds);
  }
  const { data, error } = await submissionQuery;
  if (error) {
    console.error('No s\'han pogut recuperar les entregues', error);
    return;
  }
  state.submissions = (data || []).map((submission) => ({
    ...submission,
    assignment: submission.assignments
      ? {
          id: submission.assignments.id,
          module_title: submission.assignments.module_title,
          quiz_config: submission.assignments.quiz_config,
        }
      : null,
    class_name:
      submission.assignments && submission.assignments.classes && submission.assignments.classes.class_name
        ? submission.assignments.classes.class_name
        : '',
    class_code:
      submission.assignments && submission.assignments.classes && submission.assignments.classes.join_code
        ? submission.assignments.classes.join_code
        : submission.class_code || '',
  }));
}

async function loadLiveQuizzes() {
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  try {
    const { data, error } = await client
      .from('quizzes')
      .select(
        'id, title, module_id, class_id, default_time_limit, default_points, speed_bonus, created_at, updated_at, quiz_questions(id, question_index, prompt, options, correct_option, time_limit, points, speed_bonus)'
      )
      .eq('teacher_id', state.profile.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const quizzes = Array.isArray(data) ? data : [];
    state.live.quizzes = quizzes.map((quiz) => {
      const questionList = Array.isArray(quiz.quiz_questions)
        ? quiz.quiz_questions
            .slice()
            .sort((a, b) => (a.question_index || 0) - (b.question_index || 0))
            .map((question) => ({
              id: question.id,
              index: question.question_index,
              prompt: question.prompt,
              options: Array.isArray(question.options)
                ? question.options.map((option) => ({
                    key: option.key || option.letter || option.label || '',
                    text: option.text || option.value || option.label || '',
                  }))
                : [],
              correctOption: question.correct_option,
              timeLimit: question.time_limit,
              points: question.points,
              speedBonus: Number.isFinite(Number.parseFloat(question.speed_bonus))
                ? Number.parseFloat(question.speed_bonus)
                : 0,
            }))
        : [];
      return {
        id: quiz.id,
        title: quiz.title,
        module_id: quiz.module_id,
        class_id: quiz.class_id,
        default_time_limit: quiz.default_time_limit,
        default_points: quiz.default_points,
        speed_bonus: Number.isFinite(Number.parseFloat(quiz.speed_bonus))
          ? Number.parseFloat(quiz.speed_bonus)
          : 0,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
        questions: questionList,
      };
    });
  } catch (error) {
    console.error('No s\'han pogut carregar els quizzes Live', error);
    state.live.quizzes = [];
  }
  renderLiveQuizzes();
  renderLiveQuizSelectors();
  syncLiveGameForm();
}

async function loadLiveGames() {
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  try {
    const { data, error } = await client
      .from('games')
      .select(
        'id, quiz_id, class_id, join_code, status, current_question, question_time_limit, question_points, speed_bonus, created_at, updated_at, ended_at, quiz:quizzes(title, class_id, default_time_limit, default_points, speed_bonus), class:classes(class_name, join_code), players:players(id)'
      )
      .eq('teacher_id', state.profile.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const games = Array.isArray(data) ? data : [];
    state.live.games = games.map((game) => ({
      id: game.id,
      quiz_id: game.quiz_id,
      class_id: game.class_id,
      join_code: game.join_code,
      status: game.status,
      current_question: game.current_question,
      question_time_limit: game.question_time_limit,
      question_points: game.question_points,
      speed_bonus: Number.isFinite(Number.parseFloat(game.speed_bonus))
        ? Number.parseFloat(game.speed_bonus)
        : 0,
      created_at: game.created_at,
      updated_at: game.updated_at,
      ended_at: game.ended_at,
      quiz_title: game.quiz ? game.quiz.title : null,
      player_count: Array.isArray(game.players) ? game.players.length : 0,
      class_name: game.class ? game.class.class_name : null,
      class_join_code: game.class ? game.class.join_code : null,
    }));
  } catch (error) {
    console.error('No s\'han pogut carregar les partides Live', error);
    state.live.games = [];
  }
  renderLiveGames();
}

function renderAll() {
  renderClasses();
  renderAssignments();
  buildResultsFilters();
  renderResults();
  renderLiveQuizzes();
  renderLiveGames();
}

async function createLiveQuiz() {
  ensureLiveDrafts();
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  const draft = state.live.quizDraft;
  const classId = draft.classId;
  const title = (draft.title || '').trim();
  const moduleId = draft.moduleId ? draft.moduleId : null;
  const defaultTime = Number.isFinite(draft.defaultTimeLimit)
    ? Math.min(Math.max(draft.defaultTimeLimit, 5), 600)
    : 20;
  const defaultPoints = Number.isFinite(draft.defaultPoints)
    ? Math.min(Math.max(draft.defaultPoints, 0), 1000)
    : 100;
  const speedBonus = Number.isFinite(draft.speedBonus)
    ? Math.min(Math.max(draft.speedBonus, 0), 1000)
    : 0;
  const manualQuestions = Array.isArray(draft.questions) ? draft.questions : [];

  if (!classId) {
    if (elements.liveQuizFeedback) {
      elements.liveQuizFeedback.textContent = 'Selecciona una classe per al quiz.';
    }
    return;
  }
  if (!title) {
    if (elements.liveQuizFeedback) {
      elements.liveQuizFeedback.textContent = 'Introdueix un títol per al quiz Live.';
    }
    return;
  }
  if (!moduleId && manualQuestions.length === 0) {
    if (elements.liveQuizFeedback) {
      elements.liveQuizFeedback.textContent = 'Afegeix almenys una pregunta o selecciona un mòdul FocusQuiz.';
    }
    return;
  }

  if (elements.liveQuizFeedback) {
    elements.liveQuizFeedback.textContent = 'Guardant quiz Live...';
  }

  try {
    const { data, error } = await client
      .from('quizzes')
      .insert({
        teacher_id: state.profile.id,
        class_id: classId,
        title,
        module_id: moduleId,
        default_time_limit: defaultTime,
        default_points: defaultPoints,
        speed_bonus: speedBonus,
      })
      .select('id')
      .single();
    if (error) throw error;
    const quizId = data ? data.id : null;
    if (quizId && manualQuestions.length) {
      const rows = manualQuestions.map((question, index) => ({
        quiz_id: quizId,
        question_index: index + 1,
        prompt: question.prompt,
        options: question.options,
        correct_option: question.correctOption,
        time_limit: Number.isFinite(question.timeLimit)
          ? Math.min(Math.max(question.timeLimit, 5), 600)
          : defaultTime,
        points: Number.isFinite(question.points)
          ? Math.min(Math.max(question.points, 0), 1000)
          : defaultPoints,
        speed_bonus: Number.isFinite(question.speedBonus)
          ? Math.min(Math.max(question.speedBonus, 0), 1000)
          : speedBonus,
      }));
      const { error: questionError } = await client.from('quiz_questions').insert(rows);
      if (questionError) throw questionError;
    }
    if (elements.liveQuizFeedback) {
      elements.liveQuizFeedback.textContent = 'Quiz Live guardat correctament.';
    }
    resetLiveQuizDraft({ preserveClass: true });
    await loadLiveQuizzes();
  } catch (error) {
    console.error('No s\'ha pogut guardar el quiz Live', error);
    if (elements.liveQuizFeedback) {
      elements.liveQuizFeedback.textContent = 'No s\'ha pogut guardar el quiz Live. Torna-ho a provar.';
    }
  }
  if (elements.liveQuizFeedback) {
    setTimeout(() => {
      if (elements.liveQuizFeedback) {
        elements.liveQuizFeedback.textContent = '';
      }
    }, 3000);
  }
}

async function deleteLiveQuiz(quizId) {
  if (!quizId) return;
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  try {
    const { error } = await client.from('quizzes').delete().eq('id', quizId).eq('teacher_id', state.profile.id);
    if (error) throw error;
    await loadLiveQuizzes();
  } catch (error) {
    console.error('No s\'ha pogut eliminar el quiz Live', error);
    window.alert('No s\'ha pogut eliminar el quiz Live. Revisa la connexió i torna-ho a provar.');
  }
}

function focusLiveQuiz(quizId) {
  ensureLiveDrafts();
  const quiz = state.live.quizzes.find((item) => item.id === quizId);
  if (!quiz) return;
  state.live.gameDraft.quizId = quiz.id;
  state.live.gameDraft.classId = quiz.class_id || state.live.gameDraft.classId;
  state.live.gameDraft.timeLimit = Number.isFinite(quiz.default_time_limit) ? quiz.default_time_limit : state.live.gameDraft.timeLimit;
  state.live.gameDraft.points = Number.isFinite(quiz.default_points) ? quiz.default_points : state.live.gameDraft.points;
  state.live.gameDraft.speedBonus = Number.isFinite(quiz.speed_bonus) ? quiz.speed_bonus : state.live.gameDraft.speedBonus;
  if (state.live.quizDraft) {
    state.live.quizDraft.classId = quiz.class_id || state.live.quizDraft.classId;
    state.live.quizDraft.moduleId = quiz.module_id || '';
    if (Number.isFinite(quiz.default_time_limit)) {
      state.live.quizDraft.defaultTimeLimit = quiz.default_time_limit;
    }
    if (Number.isFinite(quiz.default_points)) {
      state.live.quizDraft.defaultPoints = quiz.default_points;
    }
    if (Number.isFinite(quiz.speed_bonus)) {
      state.live.quizDraft.speedBonus = quiz.speed_bonus;
    }
  }
  syncLiveQuizFormInputs();
  syncLiveGameForm();
}

async function createLiveGame() {
  ensureLiveDrafts();
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  const draft = state.live.gameDraft;
  const classId = elements.liveGameClass ? elements.liveGameClass.value : draft.classId;
  const quizId = elements.liveGameQuiz ? elements.liveGameQuiz.value : draft.quizId;
  const rawTime = elements.liveGameTime ? Number.parseInt(elements.liveGameTime.value, 10) : draft.timeLimit;
  const rawPoints = elements.liveGamePoints ? Number.parseInt(elements.liveGamePoints.value, 10) : draft.points;
  const rawBonus = elements.liveGameBonus ? Number.parseFloat(elements.liveGameBonus.value) : draft.speedBonus;
  const timeLimit = Number.isFinite(rawTime) ? Math.min(Math.max(rawTime, 5), 600) : 20;
  const points = Number.isFinite(rawPoints) ? Math.min(Math.max(rawPoints, 0), 1000) : 100;
  const speedBonus = Number.isFinite(rawBonus) ? Math.min(Math.max(rawBonus, 0), 1000) : 0;

  if (!classId || !quizId) {
    if (elements.liveGameFeedback) {
      elements.liveGameFeedback.textContent = 'Selecciona una classe i un quiz Live.';
    }
    return;
  }

  if (elements.liveGameFeedback) {
    elements.liveGameFeedback.textContent = 'Creant partida Live...';
  }

  try {
    const { data, error } = await client
      .from('games')
      .insert({
        class_id: classId,
        quiz_id: quizId,
        teacher_id: state.profile.id,
        question_time_limit: timeLimit,
        question_points: points,
        speed_bonus: speedBonus,
      })
      .select('id, join_code')
      .single();
    if (error) throw error;
    state.live.gameDraft = {
      classId,
      quizId,
      timeLimit,
      points,
      speedBonus,
    };
    if (elements.liveGameFeedback) {
      const joinCode = data && data.join_code ? data.join_code : '';
      elements.liveGameFeedback.textContent = joinCode
        ? `Partida creada. Comparteix el codi ${joinCode} amb l'alumnat.`
        : 'Partida creada.';
    }
    await loadLiveGames();
  } catch (error) {
    console.error('No s\'ha pogut crear la partida Live', error);
    if (elements.liveGameFeedback) {
      elements.liveGameFeedback.textContent = 'No s\'ha pogut crear la partida. Torna-ho a provar.';
    }
  }
  if (elements.liveGameFeedback) {
    setTimeout(() => {
      if (elements.liveGameFeedback && elements.liveGameFeedback.textContent.startsWith('Partida')) {
        elements.liveGameFeedback.textContent = '';
      }
    }, 4000);
  }
}

async function updateLiveGameStatus(gameId, status) {
  if (!gameId || !status) return;
  const client = createSupabaseClient();
  if (!client || !state.profile) return;
  try {
    const updates = { status };
    if (status === 'completed' || status === 'cancelled') {
      updates.ended_at = new Date().toISOString();
    }
    const { error } = await client.from('games').update(updates).eq('id', gameId).eq('teacher_id', state.profile.id);
    if (error) throw error;
    await loadLiveGames();
  } catch (error) {
    console.error('No s\'ha pogut actualitzar l\'estat de la partida', error);
    window.alert('No s\'ha pogut actualitzar la partida. Torna-ho a provar.');
  }
}

async function copyLiveGameCode(game) {
  if (!game || !game.join_code) return;
  const joinCode = game.join_code;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(joinCode);
      if (elements.liveGameFeedback) {
        elements.liveGameFeedback.textContent = `Codi ${joinCode} copiat al porta-retalls.`;
        setTimeout(() => {
          if (elements.liveGameFeedback && elements.liveGameFeedback.textContent.includes(joinCode)) {
            elements.liveGameFeedback.textContent = '';
          }
        }, 2500);
      }
      return;
    }
  } catch (error) {
    console.warn('No s\'ha pogut copiar el codi amb l\'API Clipboard', error);
  }
  window.prompt('Copia el codi de partida i comparteix-lo amb l\'alumnat:', joinCode);
}

async function handleLogin(event) {
  event.preventDefault();
  resetAuthMessages();
  const client = createSupabaseClient();
  if (!client) return;
  const formData = new FormData(elements.loginForm);
  const email = formData.get('email');
  const password = formData.get('password');
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    showError(elements.authError, error.message);
    return;
  }
  await refreshData();
}

async function handleSignup(event) {
  event.preventDefault();
  resetAuthMessages();
  const client = createSupabaseClient();
  if (!client) return;
  const formData = new FormData(elements.signupForm);
  const email = formData.get('signup_email');
  const password = formData.get('signup_password');
  const fullName = formData.get('full_name');
  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) {
    showError(elements.signupError, error.message);
    return;
  }
  elements.signupSuccess.textContent = 'Compte creat! Revisa la safata d\'entrada per confirmar el correu.';
  elements.signupSuccess.classList.remove('hidden');
  elements.signupForm.reset();
}

async function handleLogout() {
  const client = createSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
  state.session = null;
  state.profile = null;
  state.profileError = null;
  state.classes = [];
  state.assignments = [];
  state.submissions = [];
  state.live = {
    quizzes: [],
    games: [],
    quizDraft: {
      classId: '',
      title: '',
      moduleId: '',
      defaultTimeLimit: 20,
      defaultPoints: 100,
      speedBonus: 5,
      questions: [],
    },
    questionDraft: null,
    gameDraft: {
      classId: '',
      quizId: '',
      timeLimit: 20,
      points: 100,
      speedBonus: 5,
    },
  };
  ensureLiveDrafts();
  renderLiveQuizzes();
  renderLiveGames();
  setCurrentModule('', { preserveQuestions: false });
  updateAuthUI();
  renderProfileWarning();
}

async function refreshData() {
  await loadSession();
  await loadProfile();
  if (state.profile) {
    await loadClasses();
    await loadAssignments();
    await loadSubmissions();
    await loadLiveQuizzes();
    await loadLiveGames();
  }
  renderModuleOptions();
  renderClassOptions();
  renderAll();
  syncLiveQuizFormInputs();
  syncLiveGameForm();
  updateAuthUI();
  renderProfileWarning();
}

function setupEventListeners() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', handleLogin);
  }
  if (elements.signupForm) {
    elements.signupForm.addEventListener('submit', handleSignup);
  }
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', handleLogout);
  }
  if (elements.classForm) {
    elements.classForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(elements.classForm);
      createClass(formData);
    });
  }
  if (elements.refreshClasses) {
    elements.refreshClasses.addEventListener('click', async () => {
      await loadClasses();
      renderClasses();
    });
  }
  if (elements.assignmentForm) {
    elements.assignmentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(elements.assignmentForm);
      createAssignment(formData);
    });
    const countInput = elements.assignmentForm.querySelector('input[name="count"]');
    if (countInput) {
      const handleCountChanged = () => handleBaseQuizConfigChanged('count');
      countInput.addEventListener('input', handleCountChanged);
      countInput.addEventListener('change', handleCountChanged);
    }
  }
  if (elements.assignmentModuleSelect) {
    elements.assignmentModuleSelect.addEventListener('change', () => {
      syncAssignmentModuleFromSelect();
    });
  }
  if (elements.assignmentLevelInput) {
    const handleLevelChanged = () => handleBaseQuizConfigChanged('level');
    elements.assignmentLevelInput.addEventListener('input', handleLevelChanged);
    elements.assignmentLevelInput.addEventListener('change', handleLevelChanged);
  }
  if (elements.previewModule) {
    elements.previewModule.addEventListener('click', previewSelectedModule);
  }
  if (elements.resetModuleConfig) {
    elements.resetModuleConfig.addEventListener('click', () => {
      if (!state.assignmentDraft.moduleId) return;
      setCurrentModule(state.assignmentDraft.moduleId, { preserveQuestions: false });
      state.assignmentDraft.notice = 'Opcions restablertes. Previsualitza per generar noves preguntes.';
      updateModuleSummary();
    });
  }
  if (elements.refreshAssignments) {
    elements.refreshAssignments.addEventListener('click', async () => {
      await loadAssignments();
      renderAssignments();
      buildResultsFilters();
    });
  }
  if (elements.refreshResults) {
    elements.refreshResults.addEventListener('click', async () => {
      await loadSubmissions();
      renderResults();
    });
  }
  if (elements.resultsClassFilter) {
    elements.resultsClassFilter.addEventListener('change', renderResults);
  }
  if (elements.resultsAssignmentFilter) {
    elements.resultsAssignmentFilter.addEventListener('change', renderResults);
  }
  window.addEventListener('message', handlePreviewMessage);
  window.addEventListener('storage', handlePreviewStorageMessage);
  window.addEventListener('beforeunload', closePreviewChannel);

  if (elements.liveQuizClass) {
    elements.liveQuizClass.addEventListener('change', handleLiveQuizFieldChange);
  }
  if (elements.liveQuizTitle) {
    elements.liveQuizTitle.addEventListener('input', handleLiveQuizFieldChange);
  }
  if (elements.liveQuizModule) {
    elements.liveQuizModule.addEventListener('change', handleLiveQuizFieldChange);
  }
  if (elements.liveQuizTime) {
    const handler = handleLiveQuizFieldChange;
    elements.liveQuizTime.addEventListener('input', handler);
    elements.liveQuizTime.addEventListener('change', handler);
  }
  if (elements.liveQuizSpeedBonus) {
    const handler = handleLiveQuizFieldChange;
    elements.liveQuizSpeedBonus.addEventListener('input', handler);
    elements.liveQuizSpeedBonus.addEventListener('change', handler);
  }
  if (elements.liveQuizSave) {
    elements.liveQuizSave.addEventListener('click', createLiveQuiz);
  }
  if (elements.liveQuizReset) {
    elements.liveQuizReset.addEventListener('click', () => resetLiveQuizDraft({ preserveClass: true }));
  }
  if (elements.liveQuestionAdd) {
    elements.liveQuestionAdd.addEventListener('click', handleLiveQuestionAdd);
  }
  if (elements.liveQuestionReset) {
    elements.liveQuestionReset.addEventListener('click', resetLiveQuestionForm);
  }
  const liveQuestionInputs = [
    elements.liveQuestionPrompt,
    elements.liveQuestionOptionA,
    elements.liveQuestionOptionB,
    elements.liveQuestionOptionC,
    elements.liveQuestionOptionD,
    elements.liveQuestionCorrect,
    elements.liveQuestionTime,
    elements.liveQuestionPoints,
    elements.liveQuestionSpeed,
  ];
  liveQuestionInputs.forEach((input) => {
    if (!input) return;
    const handler = handleLiveQuestionFieldChange;
    const eventName = input.tagName && input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
    input.addEventListener(eventName, handler);
  });
  if (elements.liveQuestionsList) {
    elements.liveQuestionsList.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-remove-question-id]') : null;
      if (!target) return;
      const questionId = target.getAttribute('data-remove-question-id');
      if (questionId) {
        handleLiveQuestionRemove(questionId);
      }
    });
  }
  if (elements.liveRefresh) {
    elements.liveRefresh.addEventListener('click', async () => {
      await loadLiveQuizzes();
      await loadLiveGames();
    });
  }
  if (elements.liveGameClass) {
    elements.liveGameClass.addEventListener('change', handleLiveGameFieldChange);
  }
  if (elements.liveGameTime) {
    const handler = handleLiveGameFieldChange;
    elements.liveGameTime.addEventListener('input', handler);
    elements.liveGameTime.addEventListener('change', handler);
  }
  if (elements.liveGamePoints) {
    const handler = handleLiveGameFieldChange;
    elements.liveGamePoints.addEventListener('input', handler);
    elements.liveGamePoints.addEventListener('change', handler);
  }
  if (elements.liveGameBonus) {
    const handler = handleLiveGameFieldChange;
    elements.liveGameBonus.addEventListener('input', handler);
    elements.liveGameBonus.addEventListener('change', handler);
  }
  if (elements.liveGameQuiz) {
    elements.liveGameQuiz.addEventListener('change', (event) => {
      handleLiveGameQuizChange(event);
    });
  }
  if (elements.liveGameCreate) {
    elements.liveGameCreate.addEventListener('click', createLiveGame);
  }
  if (elements.liveGameRefresh) {
    elements.liveGameRefresh.addEventListener('click', async () => {
      await loadLiveGames();
    });
  }
  if (elements.liveQuizList) {
    elements.liveQuizList.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('button[data-quiz-action]') : null;
      if (!button) return;
      const quizId = button.getAttribute('data-quiz-id');
      const action = button.getAttribute('data-quiz-action');
      if (!quizId || !action) return;
      if (action === 'delete') {
        deleteLiveQuiz(quizId);
      } else if (action === 'focus') {
        focusLiveQuiz(quizId);
        switchTab('live');
      }
    });
  }
  if (elements.liveGameList) {
    elements.liveGameList.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('button[data-game-action]') : null;
      if (!button) return;
      const gameId = button.getAttribute('data-game-id');
      const action = button.getAttribute('data-game-action');
      if (!gameId || !action) return;
      const game = state.live.games.find((item) => item.id === gameId);
      if (!game) return;
      if (action === 'copy') {
        copyLiveGameCode(game);
      } else if (action === 'close') {
        updateLiveGameStatus(gameId, 'completed');
      } else if (action === 'archive') {
        updateLiveGameStatus(gameId, 'cancelled');
      }
    });
  }
}

async function init() {
  const config = getActiveSupabaseConfig();
  if (!config) {
    setVisibility(elements.configWarning, true);
    return;
  }
  setVisibility(elements.configWarning, false);
  setupEventListeners();
  await refreshData();
}

document.addEventListener('DOMContentLoaded', init);
