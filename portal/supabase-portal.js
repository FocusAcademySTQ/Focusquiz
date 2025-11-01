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

const state = {
  supabase: null,
  session: null,
  profile: null,
  activeTab: 'classes',
  classes: [],
  assignments: [],
  submissions: [],
  assignmentDraft: {
    moduleId: '',
    options: {},
    questionSet: [],
    notice: '',
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
  refreshResults: document.getElementById('refreshResults'),
  resultsClassFilter: document.getElementById('resultsClassFilter'),
  resultsAssignmentFilter: document.getElementById('resultsAssignmentFilter'),
};

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
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('No s\'ha pogut recuperar el perfil', error);
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
      return null;
    }
    return loadProfile();
  }
  state.profile = data;
  return state.profile;
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

function statusLabel(value) {
  if (!value) return '—';
  return STATUS_LABELS[value] || value;
}

function renderClassOptions() {
  if (!elements.assignmentClassSelect) return;
  elements.assignmentClassSelect.innerHTML = '';
  if (!state.classes.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Cap classe disponible';
    elements.assignmentClassSelect.appendChild(option);
    return;
  }
  state.classes.forEach((cls) => {
    const option = document.createElement('option');
    option.value = cls.id;
    option.textContent = `${cls.class_name} · ${cls.join_code}`;
    elements.assignmentClassSelect.appendChild(option);
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
  }
  renderModuleConfigUI(moduleId);
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
    if (state.assignmentDraft.questionSet.length) {
      state.assignmentDraft.questionSet = [];
    }
    state.assignmentDraft.notice = 'Has canviat les opcions. Previsualitza de nou per regenerar les preguntes.';
  } else if (!fromUser && !state.assignmentDraft.questionSet.length) {
    state.assignmentDraft.notice = '';
  }
  updateModuleSummary();
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

function handlePreviewMessage(event) {
  if (!event || !event.data || typeof event.data !== 'object') return;
  const { origin, data } = event;
  if (data.type !== 'focusquiz-preview') return;
  const sameOrigin = !origin || origin === 'null' || origin === window.location.origin;
  if (!sameOrigin) return;
  if (!data.moduleId || data.moduleId !== state.assignmentDraft.moduleId) return;
  if (data.options && typeof data.options === 'object') {
    state.assignmentDraft.options = normalizeModuleOptions(data.moduleId, data.options);
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
    const rosterForm = node.querySelector('.portal-class-roster-form');
    const textarea = rosterForm.querySelector('textarea');
    textarea.value = (cls.students || []).join('\n');
    rosterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await updateRoster(cls.id, textarea.value, node.querySelector('.portal-class-feedback'));
    });
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
    addMeta('Estat', assignment.status);
    addMeta('Preguntes', coalesce(quizConfig.count, '—'));
    addMeta('Temps', quizConfig.time ? `${quizConfig.time} min` : 'Sense límit');
    addMeta('Nivell', coalesce(quizConfig.level, '—'));
    if (quizConfig.summary) {
      addMeta('Configuració', quizConfig.summary);
    }
    addMeta('Publicada', new Date(assignment.date_assigned).toLocaleString('ca-ES'));
    if (assignment.due_at) {
      addMeta('Data límit', new Date(assignment.due_at).toLocaleString('ca-ES'));
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
    return;
  }
  empty.classList.add('hidden');
  const template = document.getElementById('resultRowTemplate');
  filtered.forEach((submission) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = submission.id;
    node.querySelector('.result-student').textContent = submission.student_name;
    const classLabel = submission.class_code
      ? `${submission.class_name} · ${submission.class_code}`
      : submission.class_name;
    const assignmentInfo = submission.assignment || {};
    const assignmentConfig = assignmentInfo.quiz_config || {};
    const subtitle = `${assignmentConfig.label || assignmentInfo.module_title || 'Prova'} · ${classLabel}`;
    node.querySelector('.result-meta').textContent = `${subtitle} · ${new Date(submission.submitted_at).toLocaleString('ca-ES')}`;
    const details = node.querySelector('.result-details');
    const addMeta = (label, value) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      details.appendChild(dt);
      details.appendChild(dd);
    };
    addMeta('Nota', formatPercent(submission.score));
    const countLabel = coalesce(submission.count, '?');
    addMeta('Encerts', submission.correct !== null ? `${submission.correct}/${countLabel}` : '—');
    addMeta('Temps', submission.time_spent ? `${Math.round(submission.time_spent / 60)} min` : '—');
    if (assignmentConfig.summary) {
      addMeta('Configuració', assignmentConfig.summary);
    }
    addMeta('Estat', statusLabel(submission.status));
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
    list.appendChild(node);
  });
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
  await loadAssignments();
  renderAssignments();
  buildResultsFilters();
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
  const count = Number.parseInt(formData.get('count'), 10) || null;
  const time = Number.parseInt(formData.get('time'), 10) || null;
  const level = Number.parseInt(formData.get('level'), 10) || null;
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
    level: Number.isFinite(level) ? level : 1,
  };
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
  const count = Number.parseInt(formData.get('count'), 10);
  const time = Number.parseInt(formData.get('time'), 10);
  const level = Number.parseInt(formData.get('level'), 10);
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
  const url = new URL('../index.html', window.location.href);
  url.searchParams.set('module', moduleId);
  if (label) url.searchParams.set('label', label);
  if (moduleName) url.searchParams.set('title', moduleName);
  if (Number.isFinite(count) && count > 0) url.searchParams.set('count', String(Math.min(Math.max(count, 1), 200)));
  if (Number.isFinite(time) && time > 0) url.searchParams.set('time', String(Math.min(Math.max(time, 0), 180)));
  if (Number.isFinite(level)) url.searchParams.set('level', String(Math.min(Math.max(level, 1), 4)));
  if (encodedOptions) url.searchParams.set('opts', encodedOptions);
  url.searchParams.set('preview', '1');
  url.searchParams.set('autostart', '1');
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

function renderAll() {
  renderClasses();
  renderAssignments();
  buildResultsFilters();
  renderResults();
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
  state.classes = [];
  state.assignments = [];
  state.submissions = [];
  setCurrentModule('', { preserveQuestions: false });
  updateAuthUI();
}

async function refreshData() {
  await loadSession();
  await loadProfile();
  if (state.profile) {
    await loadClasses();
    await loadAssignments();
    await loadSubmissions();
  }
  renderModuleOptions();
  renderClassOptions();
  renderAll();
  updateAuthUI();
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
  }
  if (elements.assignmentModuleSelect) {
    elements.assignmentModuleSelect.addEventListener('change', () => {
      syncAssignmentModuleFromSelect();
    });
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
