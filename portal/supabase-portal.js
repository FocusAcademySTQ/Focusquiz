import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MODULES, CATEGORY_LABELS } from './modules-data.js';
import {
  getModuleOptionDefinition,
  getDefaultModuleOptions,
  summarizeModuleOptions,
  validateModuleOptions,
  cloneModuleOptions,
} from './module-config.js';

const sortedModules = [...MODULES].sort((a, b) => {
  const catA = a.category || '';
  const catB = b.category || '';
  if (catA === catB) {
    return a.name.localeCompare(b.name, 'ca', { sensitivity: 'base' });
  }
  return catA.localeCompare(catB, 'ca', { sensitivity: 'base' });
});

const state = {
  supabase: null,
  session: null,
  user: null,
  profile: null,
  students: [],
  modules: sortedModules,
  moduleIndex: new Map(sortedModules.map((module) => [module.id, module])),
  selectedModules: new Set(),
  moduleConfigs: new Map(),
  moduleFilter: 'all',
  moduleSearch: '',
  supportsQuizConfigColumn: true,
  activeTab: null,
  profileSupportsEmail: true,
  sessionWarning: '',
};

const el = {
  configWarning: document.getElementById('configWarning'),
  authPanel: document.getElementById('authPanel'),
  loginForm: document.getElementById('loginForm'),
  authError: document.getElementById('authError'),
  registerPanel: document.getElementById('registerPanel'),
  signupForm: document.getElementById('signupForm'),
  signupError: document.getElementById('signupError'),
  signupSuccess: document.getElementById('signupSuccess'),
  signupTeacherFields: Array.from(document.querySelectorAll('[data-signup-role="teacher"]')),
  sessionPanel: document.getElementById('sessionPanel'),
  sessionName: document.getElementById('sessionName'),
  sessionRole: document.getElementById('sessionRole'),
  logoutBtn: document.getElementById('logoutBtn'),
  sessionWarning: document.getElementById('sessionWarning'),
  tabList: document.getElementById('portalTabs'),
  tabButtons: Array.from(document.querySelectorAll('[data-tab]')),
  teacherPanel: document.getElementById('teacherPanel'),
  teacherView: document.getElementById('teacherView'),
  teacherAssignments: document.getElementById('teacherAssignments'),
  assignmentForm: document.getElementById('assignmentForm'),
  refreshStudents: document.getElementById('refreshStudents'),
  assignmentFeedback: document.getElementById('assignmentFeedback'),
  assignmentError: document.getElementById('assignmentError'),
  modulePicker: document.getElementById('modulePicker'),
  moduleEmptyState: document.getElementById('moduleEmptyState'),
  moduleFilter: document.getElementById('moduleFilter'),
  moduleSearch: document.getElementById('moduleSearch'),
  moduleSelectedInfo: document.getElementById('moduleSelectedInfo'),
  moduleConfigPanel: document.getElementById('moduleConfigPanel'),
  moduleConfigList: document.getElementById('moduleConfigList'),
  studentChecklist: document.getElementById('studentChecklist'),
  assignmentList: document.getElementById('assignmentList'),
  reloadAssignments: document.getElementById('reloadAssignments'),
  studentPanel: document.getElementById('studentPanel'),
  studentView: document.getElementById('studentView'),
  studentAssignmentList: document.getElementById('studentAssignmentList'),
};

const statusLabels = {
  pending: 'Pendent',
  in_progress: 'En curs',
  submitted: 'Entregada',
  completed: 'Completada',
};

const gradeFormatter = new Intl.NumberFormat('ca-ES', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function parseGradeValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric;
}

function formatGradeValue(value) {
  const grade = parseGradeValue(value);
  if (grade === null) return null;
  return gradeFormatter.format(grade);
}

const QUIZ_DEFAULTS = Object.freeze({
  count: 10,
  time: 0,
  level: 1,
});

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function normalizeQuizConfig(raw = {}) {
  const normalized = {
    count: QUIZ_DEFAULTS.count,
    time: QUIZ_DEFAULTS.time,
    level: QUIZ_DEFAULTS.level,
    options: {},
  };

  const parsedCount = Number.parseInt(raw.count, 10);
  if (Number.isFinite(parsedCount)) {
    normalized.count = clampNumber(parsedCount, 1, 200);
  }

  const parsedTime = Number.parseInt(raw.time, 10);
  if (Number.isFinite(parsedTime)) {
    normalized.time = clampNumber(parsedTime, 0, 180);
  }

  const parsedLevel = Number.parseInt(raw.level, 10);
  if (Number.isFinite(parsedLevel)) {
    normalized.level = clampNumber(parsedLevel, 1, 4);
  }

  if (raw.options && typeof raw.options === 'object' && !Array.isArray(raw.options)) {
    normalized.options = raw.options;
  }

  if (raw.label && typeof raw.label === 'string') {
    normalized.label = raw.label;
  }

  if (raw.title && typeof raw.title === 'string') {
    normalized.title = raw.title;
  }

  return normalized;
}

function formatQuizConfig(config) {
  if (!config || typeof config !== 'object') return '';
  const normalized = normalizeQuizConfig(config);
  const parts = [];

  if (normalized.count === 1) {
    parts.push('1 pregunta');
  } else if (normalized.count > 1) {
    parts.push(`${normalized.count} preguntes`);
  }

  if (normalized.time > 0) {
    parts.push(`${normalized.time} min`);
  } else {
    parts.push('Sense límit de temps');
  }

  if (normalized.level > 0) {
    parts.push(`Nivell ${normalized.level}`);
  }

  return parts.join(' · ');
}

const QUIZ_CONFIG_MARKER = '[[FocusQuiz::QuizConfig]]';

function embedQuizConfigInDescription(description, quizConfig) {
  const base = extractEmbeddedQuizConfig(description).description;
  if (!quizConfig) {
    return base;
  }

  const normalizedConfig = normalizeQuizConfig(quizConfig);
  const payload = JSON.stringify(normalizedConfig);
  const trimmed = base.trimEnd();
  const prefix = trimmed ? `${trimmed}\n\n` : '';
  return `${prefix}${QUIZ_CONFIG_MARKER}\n${payload}`;
}

function extractEmbeddedQuizConfig(description) {
  if (!description) {
    return { description: '', quizConfig: null };
  }

  const markerIndex = description.lastIndexOf(QUIZ_CONFIG_MARKER);
  if (markerIndex === -1) {
    return { description: description.trimEnd(), quizConfig: null };
  }

  const payload = description.slice(markerIndex + QUIZ_CONFIG_MARKER.length).trim();
  const cleaned = description.slice(0, markerIndex).trimEnd();
  if (!payload) {
    return { description: cleaned, quizConfig: null };
  }

  try {
    const parsed = JSON.parse(payload);
    return { description: cleaned, quizConfig: normalizeQuizConfig(parsed) };
  } catch (error) {
    console.warn('No s\'ha pogut recuperar la configuració embeguda de la prova.', error);
    return { description: cleaned, quizConfig: null };
  }
}

function prepareAssignmentForDisplay(assignment) {
  if (!assignment || typeof assignment !== 'object') {
    return assignment;
  }

  const processed = { ...assignment };
  const { description, quizConfig } = extractEmbeddedQuizConfig(assignment.description || '');
  processed.description = description;
  if (!processed.quiz_config && quizConfig) {
    processed.quiz_config = quizConfig;
  }
  return processed;
}

function buildAssignmentSelect(includeAssignees = false) {
  const fields = [
    'id',
    'title',
    'description',
    'module_id',
    'due_date',
    'created_at',
  ];
  if (state.supportsQuizConfigColumn) {
    fields.splice(4, 0, 'quiz_config');
  }
  let select = fields.join(', ');
  if (includeAssignees) {
    select += ', assignment_assignees ( id, profile_id, status )';
  }
  return select;
}

function isMissingProfileEmailColumn(error) {
  if (!error) return false;
  if (error.code === '42703') return true;
  const haystack = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return haystack.includes('profiles') && haystack.includes('email') && haystack.includes('column');
}

function normalizeProfileRow(row, user) {
  if (!row && !user) return null;
  const normalized = { ...row };
  if (!('id' in normalized) || !normalized.id) {
    normalized.id = user?.id || null;
  }
  if (!('full_name' in normalized) || !normalized.full_name) {
    normalized.full_name = deriveProfileName(user);
  }
  if (!('email' in normalized)) {
    normalized.email = typeof user?.email === 'string' ? user.email : null;
  } else if (normalized.email === undefined) {
    normalized.email = null;
  }
  const role = normalized.role;
  if (role !== 'teacher' && role !== 'student') {
    normalized.role = deriveProfileRole(user);
  }
  return normalized;
}

function isQuizConfigSchemaError(error) {
  if (!error) return false;
  if (error.code === '42703') return true;
  const message = (error.message || '').toLowerCase();
  if (!message.includes('quiz_config')) return false;
  return message.includes('schema cache') || message.includes('does not exist') || message.includes('column');
}

function encodeQuizOptions(options) {
  if (!options || typeof options !== 'object') return '';
  try {
    const json = JSON.stringify(options);
    if (!json) return '';
    let encoded = '';
    if (typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(json);
      let binary = '';
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      encoded = typeof btoa === 'function' ? btoa(binary) : '';
    } else {
      encoded = typeof btoa === 'function'
        ? btoa(unescape(encodeURIComponent(json)))
        : '';
    }
    return encoded.replace(/=+$/, '');
  } catch (error) {
    console.warn('No s\'ha pogut codificar les opcions de la prova', error);
    return '';
  }
}

function buildQuizLink(moduleId, config, meta = {}) {
  if (!moduleId) return '';
  const params = new URLSearchParams();
  params.set('module', moduleId);

  const normalized = normalizeQuizConfig(config);
  params.set('count', String(normalized.count));
  params.set('time', String(normalized.time));
  params.set('level', String(normalized.level));

  if (normalized.options && Object.keys(normalized.options).length) {
    const encodedOptions = encodeQuizOptions(normalized.options);
    if (encodedOptions) {
      params.set('opts', encodedOptions);
    }
  }

  const label = typeof meta.label === 'string' ? meta.label.trim() : '';
  if (label) {
    params.set('label', label);
  }

  const assignmentId = typeof meta.assignmentId === 'string' ? meta.assignmentId.trim() : '';
  if (assignmentId) {
    params.set('assignment', assignmentId);
  }

  params.set('autostart', '1');
  return `../index.html?${params.toString()}`;
}

function toggle(element, show) {
  if (!element) return;
  element.classList.toggle('hidden', !show);
  if (typeof show === 'boolean') {
    element.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
}

function resetTabs() {
  state.activeTab = null;
  if (Array.isArray(el.tabButtons)) {
    el.tabButtons.forEach((button) => {
      if (!button) return;
      button.hidden = false;
      button.disabled = false;
      button.setAttribute('aria-selected', 'false');
      button.setAttribute('aria-disabled', 'false');
      button.classList.remove('portal-tab--active');
      button.tabIndex = -1;
    });
  }
  toggle(el.teacherPanel, false);
  toggle(el.studentPanel, false);
}

function setActiveTab(tabId, options = {}) {
  if (!Array.isArray(el.tabButtons) || !el.tabButtons.length) return;
  if (!tabId) {
    state.activeTab = null;
    toggle(el.teacherPanel, false);
    toggle(el.studentPanel, false);
    el.tabButtons.forEach((button) => {
      if (!button) return;
      button.setAttribute('aria-selected', 'false');
      button.classList.remove('portal-tab--active');
      if (!button.hidden && !button.disabled) {
        button.tabIndex = 0;
      } else {
        button.tabIndex = -1;
      }
    });
    return;
  }

  const targetButton = el.tabButtons.find(
    (button) => button && !button.hidden && !button.disabled && button.dataset.tab === tabId
  );
  if (!targetButton) return;

  state.activeTab = tabId;
  el.tabButtons.forEach((button) => {
    if (!button) return;
    const isActive = button === targetButton;
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.classList.toggle('portal-tab--active', isActive);
    if (button.hidden || button.disabled) {
      button.tabIndex = -1;
      button.setAttribute('aria-disabled', 'true');
    } else {
      button.tabIndex = isActive ? 0 : -1;
      button.setAttribute('aria-disabled', 'false');
    }
  });

  toggle(el.teacherPanel, tabId === 'teacher');
  toggle(el.studentPanel, tabId === 'student');

  if (options.focus) {
    targetButton.focus();
  }
}

function configureTabsForRole(role) {
  if (!Array.isArray(el.tabButtons) || !el.tabButtons.length) return;
  const isTeacher = role === 'teacher';
  el.tabButtons.forEach((button) => {
    if (!button) return;
    const tabId = button.dataset.tab;
    const allowed = tabId === 'teacher' ? isTeacher : tabId === 'student' ? !isTeacher : false;
    button.hidden = !allowed;
    button.disabled = !allowed;
    button.setAttribute('aria-disabled', allowed ? 'false' : 'true');
    if (!allowed) {
      button.setAttribute('aria-selected', 'false');
      button.classList.remove('portal-tab--active');
      button.tabIndex = -1;
    }
  });

  const defaultTab = isTeacher ? 'teacher' : 'student';
  setActiveTab(defaultTab);
}

function clearSignupMessages() {
  if (el.signupError) el.signupError.classList.add('hidden');
  if (el.signupSuccess) el.signupSuccess.classList.add('hidden');
}

function updateSignupRoleFields() {
  if (!el.signupForm) return;
  const selected = el.signupForm.querySelector('input[name="signup_role"]:checked');
  const role = selected ? selected.value : 'student';
  const showTeacherFields = role === 'teacher';

  if (Array.isArray(el.signupTeacherFields)) {
    el.signupTeacherFields.forEach((field) => {
      if (!field) return;
      toggle(field, showTeacherFields);
    });
  }
}

function resetAlerts() {
  if (el.assignmentFeedback) el.assignmentFeedback.classList.add('hidden');
  if (el.assignmentError) el.assignmentError.classList.add('hidden');
}

function showError(container, message) {
  if (!container) return;
  container.textContent = message;
  container.classList.remove('hidden');
}

function showSuccess(container, message) {
  if (!container) return;
  container.textContent = message;
  container.classList.remove('hidden');
}

function escapeHTML(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#39;';
      default:
        return char;
    }
  });
}

function formatDescription(value) {
  const safe = escapeHTML(value || '');
  return safe.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || 'Mòdul FocusQuiz';
}

function formatGradeValue(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
}

function buildSubmissionKey(assignmentId, profileId) {
  if (!assignmentId || !profileId) return '';
  return `${assignmentId}::${profileId}`;
}

function cssEscape(value) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function ensureModuleOptionState(moduleId) {
  if (state.moduleConfigs.has(moduleId)) {
    return state.moduleConfigs.get(moduleId);
  }
  const defaults = getDefaultModuleOptions(moduleId);
  state.moduleConfigs.set(moduleId, defaults);
  return defaults;
}

function applyModuleCardState(card, module, definition, options) {
  if (!card) return;
  const summaryEl = card.querySelector('.portal-module-config-summary');
  const errorEl = card.querySelector('.portal-error-text');
  let normalized = options || {};
  let summaryText = '';
  let errorText = '';

  if (definition) {
    normalized = typeof definition.normalize === 'function' ? definition.normalize(options) : (options || {});
    state.moduleConfigs.set(module.id, normalized);
    if (typeof definition.summarize === 'function') {
      summaryText = definition.summarize(normalized, module) || '';
    }
    if (typeof definition.validate === 'function') {
      errorText = definition.validate(normalized, module) || '';
    }
    if (!summaryText) {
      summaryText = 'Sense opcions addicionals.';
    }
  } else {
    normalized = {};
    state.moduleConfigs.set(module.id, normalized);
    summaryText = 'Aquest mòdul utilitza només la configuració general.';
  }

  if (summaryEl) {
    summaryEl.textContent = summaryText;
  }

  if (errorEl) {
    if (errorText) {
      errorEl.textContent = errorText;
      errorEl.classList.remove('hidden');
      card.classList.add('portal-module-config-card--error');
    } else {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      card.classList.remove('portal-module-config-card--error');
    }
  }
}

function renderModuleConfigCards() {
  if (!el.moduleConfigList) return;
  const selectedIds = Array.from(state.selectedModules);
  toggle(el.moduleConfigPanel, selectedIds.length > 0);
  el.moduleConfigList.innerHTML = '';

  selectedIds.forEach((moduleId) => {
    const module = state.moduleIndex.get(moduleId);
    if (!module) return;
    const definition = getModuleOptionDefinition(moduleId);
    const card = document.createElement('section');
    card.className = 'portal-module-config-card';
    card.dataset.moduleConfigCard = moduleId;

    const header = document.createElement('div');
    header.className = 'portal-module-config-header';
    header.innerHTML = `
      <div>
        <h3>${escapeHTML(module.name)}</h3>
        <p class="portal-muted" style="margin:0;">${escapeHTML(module.desc || '')}</p>
      </div>
      <span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>
    `;
    card.appendChild(header);

    const summary = document.createElement('p');
    summary.className = 'portal-module-config-summary';
    card.appendChild(summary);

    let body = null;
    if (definition && typeof definition.render === 'function') {
      const current = ensureModuleOptionState(moduleId);
      body = definition.render(current, module) || null;
      if (body) {
        card.appendChild(body);
      }
    } else {
      ensureModuleOptionState(moduleId);
      const info = document.createElement('p');
      info.className = 'portal-muted';
      info.style.margin = '0';
      info.textContent = 'No hi ha subopcions addicionals per aquest mòdul. S\'utilitzarà la configuració general de preguntes, temps i nivell.';
      card.appendChild(info);
    }

    const error = document.createElement('p');
    error.className = 'portal-error-text hidden';
    card.appendChild(error);

    const applyState = () => {
      const collected = definition && typeof definition.collect === 'function'
        ? definition.collect(card, module)
        : state.moduleConfigs.get(moduleId);
      applyModuleCardState(card, module, definition, collected);
    };

    applyState();

    if (definition && (body || definition.collect)) {
      card.addEventListener('change', applyState);
      card.addEventListener('input', applyState);
    }

    el.moduleConfigList.appendChild(card);
  });
}

function gatherModuleOptions(modules) {
  const optionsMap = new Map();
  const summaries = new Map();
  const errors = [];

  modules.forEach((module) => {
    const moduleId = module.id;
    const definition = getModuleOptionDefinition(moduleId);
    const card = el.moduleConfigList?.querySelector(`[data-module-config-card="${cssEscape(moduleId)}"]`);
    if (definition) {
      const collected = definition.collect
        ? definition.collect(card, module)
        : state.moduleConfigs.get(moduleId) || ensureModuleOptionState(moduleId);
      applyModuleCardState(card, module, definition, collected);
      const normalized = state.moduleConfigs.get(moduleId) || ensureModuleOptionState(moduleId);
      const validationMessage = validateModuleOptions(moduleId, normalized);
      if (validationMessage) {
        errors.push({ module, message: validationMessage });
      }
      optionsMap.set(moduleId, cloneModuleOptions(normalized));
      summaries.set(moduleId, summarizeModuleOptions(moduleId, normalized));
    } else {
      applyModuleCardState(card, module, null, {});
      optionsMap.set(moduleId, {});
      summaries.set(moduleId, '');
    }
  });

  return { optionsMap, summaries, errors };
}

function updateSelectedModulesInfo() {
  if (!el.moduleSelectedInfo) return;
  const count = state.selectedModules.size;
  let text = 'Cap prova seleccionada';
  if (count === 1) {
    text = '1 prova seleccionada';
  } else if (count > 1) {
    text = `${count} proves seleccionades`;
  }
  el.moduleSelectedInfo.textContent = text;
  el.moduleSelectedInfo.classList.toggle('portal-chip--muted', count === 0);
  el.moduleSelectedInfo.classList.toggle('portal-chip--positive', count > 0);
}

function getFilteredModules() {
  const search = state.moduleSearch.trim().toLowerCase();
  return state.modules.filter((module) => {
    const matchesCategory = state.moduleFilter === 'all' || module.category === state.moduleFilter;
    if (!matchesCategory) return false;
    if (!search) return true;
    const haystack = `${module.name} ${module.desc} ${module.id}`.toLowerCase();
    return haystack.includes(search);
  });
}

function renderModulePicker() {
  if (!el.modulePicker) return;
  const modules = getFilteredModules();
  el.modulePicker.innerHTML = '';
  toggle(el.moduleEmptyState, modules.length === 0);

  modules.forEach((module) => {
    const isSelected = state.selectedModules.has(module.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `portal-module-card${isSelected ? ' is-selected' : ''}`;
    button.dataset.moduleId = module.id;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    button.innerHTML = `
      <span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>
      <h3>${escapeHTML(module.name)}</h3>
      <p>${escapeHTML(module.desc)}</p>
    `;
    el.modulePicker.appendChild(button);
  });
}

function populateModuleFilter() {
  if (!el.moduleFilter) return;
  const categories = Array.from(
    new Set(state.modules.map((module) => module.category).filter(Boolean))
  );
  const options = ['<option value="all">Tots els mòduls</option>']
    .concat(
      categories.map((category) => `
        <option value="${category}">${escapeHTML(getCategoryLabel(category))}</option>
      `)
    )
    .join('');
  el.moduleFilter.innerHTML = options;
  const hasCurrent = categories.includes(state.moduleFilter);
  el.moduleFilter.value = hasCurrent ? state.moduleFilter : 'all';
  if (!hasCurrent) {
    state.moduleFilter = 'all';
  }
}

function resetModulePicker() {
  state.selectedModules.clear();
  state.moduleConfigs.clear();
  state.moduleFilter = 'all';
  state.moduleSearch = '';
  if (el.moduleFilter) el.moduleFilter.value = 'all';
  if (el.moduleSearch) el.moduleSearch.value = '';
  renderModulePicker();
  updateSelectedModulesInfo();
  renderModuleConfigCards();
}

function handleModuleClick(event) {
  const button = event.target.closest('.portal-module-card');
  if (!button) return;
  const moduleId = button.dataset.moduleId;
  if (!moduleId) return;

  const willSelect = !state.selectedModules.has(moduleId);
  if (willSelect) {
    state.selectedModules.add(moduleId);
    ensureModuleOptionState(moduleId);
  } else {
    state.selectedModules.delete(moduleId);
    state.moduleConfigs.delete(moduleId);
  }

  button.classList.toggle('is-selected', willSelect);
  button.setAttribute('aria-selected', willSelect ? 'true' : 'false');
  updateSelectedModulesInfo();
  renderModuleConfigCards();
}

function handleModuleFilterChange(event) {
  state.moduleFilter = event.target.value || 'all';
  renderModulePicker();
}

function handleModuleSearch(event) {
  state.moduleSearch = event.target.value || '';
  renderModulePicker();
}

function renderStudents() {
  if (!el.studentChecklist) return;
  el.studentChecklist.innerHTML = '';
  if (!state.students.length) {
    const span = document.createElement('span');
    span.className = 'muted';
    span.textContent = 'Encara no hi ha alumnes amb perfil.';
    el.studentChecklist.appendChild(span);
    return;
  }

  state.students.forEach((student) => {
    const label = document.createElement('label');
    const fullName = escapeHTML(student.full_name || 'Alumne sense nom');
    const email = student.email ? ` · ${escapeHTML(student.email)}` : '';
    label.innerHTML = `
      <input type="checkbox" name="students" value="${student.id}" />
      <span>${fullName}${email}</span>
    `;
    el.studentChecklist.appendChild(label);
  });
}

function renderTeacherAssignments(assignments, submissionMap = new Map()) {
  if (!el.assignmentList) return;
  el.assignmentList.innerHTML = '';

  if (!assignments.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Encara no has creat cap prova.';
    el.assignmentList.appendChild(empty);
    return;
  }

  const normalizedAssignments = assignments.map(prepareAssignmentForDisplay);

  normalizedAssignments.forEach((assignment) => {
    const item = document.createElement('article');
    item.className = 'list-item portal-assignment-card';

    const dueDate = assignment.due_date
      ? new Date(assignment.due_date + 'T00:00:00').toLocaleDateString('ca-ES')
      : 'Sense data límit';

    const assignmentId = escapeHTML(assignment.id);
    const module = assignment.module_id ? state.moduleIndex.get(assignment.module_id) : null;
    const title = escapeHTML(assignment.title || module?.name || 'Prova assignada');
    const moduleTag = module ? `<span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>` : '';
    const quizConfig = assignment.quiz_config || null;
    const quizSummary = quizConfig ? formatQuizConfig(quizConfig) : '';
    const moduleSummary = module && quizConfig?.options
      ? summarizeModuleOptions(module.id, quizConfig.options)
      : '';

    const summaryChips = [];
    if (quizSummary) {
      summaryChips.push(`<span class="portal-chip portal-chip--muted" title="Configuració">${escapeHTML(quizSummary)}</span>`);
    }
    if (moduleSummary) {
      summaryChips.push(`<span class="portal-chip portal-chip--muted" title="Subtemes">${escapeHTML(moduleSummary)}</span>`);
    }
    const dueLabel = assignment.due_date ? `Límit: ${dueDate}` : 'Sense data límit';
    summaryChips.push(`<span class="portal-chip portal-chip--muted">${escapeHTML(dueLabel)}</span>`);
    const assigneeCount = Array.isArray(assignment.assignment_assignees) ? assignment.assignment_assignees.length : 0;
    const assigneeLabel = assigneeCount === 0
      ? 'Sense alumnes'
      : assigneeCount === 1
        ? '1 alumne'
        : `${assigneeCount} alumnes`;
    summaryChips.push(`<span class="portal-chip portal-chip--muted">${escapeHTML(assigneeLabel)}</span>`);
    const summaryRow = summaryChips.length
      ? `<div class="portal-assignment-summary">${summaryChips.join('')}</div>`
      : '';
    const quizLink = module && quizConfig
      ? buildQuizLink(module.id, quizConfig, {
          label: assignment.title || module?.name,
          assignmentId: assignment.id,
        })
      : '';

    const assigneeRows = Array.isArray(assignment.assignment_assignees)
      ? assignment.assignment_assignees
      : [];

    const gradeNumbers = assigneeRows
      .map((row) => parseGradeValue(row?.submission?.grade))
      .filter((value) => value !== null);
    const averageGrade = gradeNumbers.length
      ? gradeFormatter.format(
          gradeNumbers.reduce((total, value) => total + value, 0) / gradeNumbers.length
        )
      : null;
    const deliveredCount = assigneeRows.filter((row) => Boolean(row?.submission)).length;

    const summaryChips = [];
    if (assigneeRows.length) {
      summaryChips.push(
        `<span class="portal-chip portal-chip--muted">Lliuraments: ${escapeHTML(
          `${deliveredCount}/${assigneeRows.length}`
        )}</span>`
      );
    }
    if (averageGrade !== null) {
      summaryChips.push(
        `<span class="portal-chip portal-chip--positive">Mitjana ${escapeHTML(averageGrade)}</span>`
      );
    }

    const summaryBlock = summaryChips.length
      ? `<div class="portal-assignment-summary">${summaryChips.join('')}</div>`
      : '';

    const assignees = assigneeRows.map((row) => {
      const student = state.students.find((s) => s.id === row.profile_id);
      const name = escapeHTML(student?.full_name || 'Alumne');
      const statusValue = escapeHTML(row.status);
      const statusLabel = escapeHTML(statusLabels[row.status] || row.status);
      const gradeValue = formatGradeValue(row?.submission?.grade);
      const submittedAt = row?.submission?.submitted_at
        ? new Date(row.submission.submitted_at).toLocaleString('ca-ES')
        : '';
      const feedback = row?.submission?.feedback ? escapeHTML(row.submission.feedback) : '';
      const detailParts = [];
      detailParts.push(
        gradeValue !== null
          ? `Nota: <strong>${escapeHTML(gradeValue)}</strong>`
          : 'Sense nota'
      );
      if (submittedAt) {
        detailParts.push(`Entrega: ${escapeHTML(submittedAt)}`);
      }
      if (feedback) {
        detailParts.push(`Feedback: ${feedback}`);
      }
      const detailHTML = detailParts.join(' · ');
      return `
        <li>
          <div class="portal-assignee-line">
            <span>${name}</span>
            <span class="portal-status-chip" data-status="${statusValue}">${statusLabel}</span>
          </div>
          <p class="portal-assignee-details">${detailHTML}</p>
        </li>
      `;
    });

    const quizLink = module && quizConfig
      ? buildQuizLink(module.id, quizConfig, {
          label: assignment.title || module?.name,
          assignmentId: assignment.id,
        })
      : '';
    const moduleLink = module
      ? (() => {
          const params = new URLSearchParams();
          params.set('module', module.id);
          if (assignment.id) params.set('assignment', assignment.id);
          return `../index.html?${params.toString()}`;
        })()
      : '';

    const actions = [];
    if (quizLink) {
      actions.push(`<a class="btn-primary" href="${quizLink}" target="_blank" rel="noopener">Obre la prova</a>`);
    }
    if (moduleLink) {
      actions.push(`<a class="btn-secondary" href="${moduleLink}" target="_blank" rel="noopener">Obre el mòdul</a>`);
    }
    actions.push(`<button class="btn-ghost portal-delete-assignment" type="button" data-assignment-delete="${assignmentId}">🗑️ Elimina</button>`);

    item.innerHTML = `
      <div class="portal-assignment-header">
        <div class="portal-assignment-title">
          <h4 class="portal-assignment-heading">${title}</h4>
          ${moduleTag}
        </div>
        ${summaryRow}
      </div>
      <p class="portal-muted" style="margin-top:0.35rem">${descriptionHTML}</p>
      ${configBlock}
      ${summaryBlock}
      <p class="portal-muted" style="margin-top:0.35rem">Data límit: <strong>${escapeHTML(dueDate)}</strong></p>
      <div>
        <p class="portal-assignees-title">Alumnes assignats</p>
        <ul class="portal-meta-list portal-assignee-list">
          ${assignees.join('') || '<li class="portal-assignee-empty">Sense alumnes assignats</li>'}
        </ul>
      </div>
      <div class="portal-assignment-actions">
        ${actions.join('')}
      </div>
    `;

    el.assignmentList.appendChild(item);
  });
}

function renderStudentAssignments(rows) {
  if (!el.studentAssignmentList) return;
  el.studentAssignmentList.innerHTML = '';

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No tens proves assignades.';
    el.studentAssignmentList.appendChild(empty);
    return;
  }

  rows.forEach((row) => {
    const assignmentData = prepareAssignmentForDisplay(row.assignment);
    const assignment = assignmentData || {
      id: row.assignment_id,
      title: 'Prova assignada',
      description: '',
      module_id: null,
      due_date: null,
    };

    const dueDate = assignment.due_date
      ? new Date(assignment.due_date + 'T00:00:00').toLocaleDateString('ca-ES')
      : 'Sense data límit';

    const submission = row.submission;
    const submittedAt = submission?.submitted_at
      ? new Date(submission.submitted_at).toLocaleString('ca-ES')
      : null;

    const rowId = escapeHTML(row.id);
    const assignmentId = escapeHTML(assignment.id);
    const module = assignment.module_id ? state.moduleIndex.get(assignment.module_id) : null;
    const assignmentUuid = assignment.id || row.assignment_id || null;
    const assignmentTitle = escapeHTML(assignment.title || module?.name || 'Prova');
    const moduleTag = module ? `<span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>` : '';
    const quizConfig = assignment.quiz_config || null;
    const quizSummary = quizConfig ? formatQuizConfig(quizConfig) : '';
    const moduleSummary = module && quizConfig?.options
      ? summarizeModuleOptions(module.id, quizConfig.options)
      : '';
    const configDetails = [];
    if (quizSummary) configDetails.push(`<strong>${escapeHTML(quizSummary)}</strong>`);
    if (moduleSummary) configDetails.push(escapeHTML(moduleSummary));
    const configBlock = configDetails.length
      ? `<p class="portal-muted" style="margin-top:0.35rem">Configuració: ${configDetails.join('<br>')}</p>`
      : '';
    const quizLink = module && quizConfig
      ? buildQuizLink(module.id, quizConfig, {
          label: assignment.title || module?.name,
          assignmentId: assignment.id,
        })
      : '';
    const fallbackModuleLink = !quizLink && module
      ? (() => {
          const params = new URLSearchParams();
          params.set('module', module.id);
          if (assignmentUuid) params.set('assignment', assignmentUuid);
          return `../index.html?${params.toString()}`;
        })()
      : '';
    const descriptionSource = assignment.description || module?.desc || 'Sense descripció';
    const descriptionHTML = formatDescription(descriptionSource);
    const safeStatus = escapeHTML(row.status);
    const statusChip = `<span class="portal-status-chip" data-status="${safeStatus}">${escapeHTML(statusLabels[row.status] || row.status)}</span>`;
    const statusOptions = Object.entries(statusLabels)
      .map(([value, label]) => `<option value="${escapeHTML(value)}" ${value === row.status ? 'selected' : ''}>${escapeHTML(label)}</option>`)
      .join('');
    const submissionContent = escapeHTML(submission?.content || '');

    const item = document.createElement('article');
    item.className = 'list-item';
    item.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:0.5rem;">
        <h4 style="margin:0;">${assignmentTitle}</h4>
        ${moduleTag}
      </div>
      <p class="portal-muted" style="margin-top:0.35rem">${descriptionHTML}</p>
      ${configBlock}
      <p class="portal-muted" style="margin-top:0.35rem">Data límit: <strong>${escapeHTML(dueDate)}</strong></p>
      ${quizLink
        ? `<div class="portal-assignment-actions"><a class="btn-primary" href="${quizLink}" target="_blank" rel="noopener">Comença la prova</a></div>`
        : fallbackModuleLink
          ? `<div class="portal-assignment-actions"><a class="btn-primary" href="${fallbackModuleLink}" target="_blank" rel="noopener">Obre el mòdul</a></div>`
          : ''}
      <p style="margin-top:0.35rem;">
        Estat actual: ${statusChip}
      </p>
      <label style="margin-top:0.75rem; display:block;">
        <span style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.25rem;">Canvia l'estat</span>
        <select class="input status-select" data-row="${rowId}">
          ${statusOptions}
        </select>
      </label>
      <form class="submission-form" data-assignment="${assignmentId}" data-row="${rowId}" style="margin-top:1rem; display:grid; gap:0.5rem;">
        <label>
          <span style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.25rem;">Enllaç o comentaris</span>
          <textarea class="input" name="content" placeholder="Afegeix informació de l'entrega">${submissionContent}</textarea>
        </label>
        <div class="portal-actions">
          <button class="btn-primary" type="submit">Envia resposta</button>
        </div>
      </form>
      ${submittedAt ? `<p class="portal-muted">Darrera entrega: ${escapeHTML(submittedAt)}</p>` : ''}
      ${submission?.grade !== null && submission?.grade !== undefined
        ? `<p class="portal-muted">Nota: <strong>${escapeHTML(submission.grade)}</strong>${submission.feedback ? ` · ${escapeHTML(submission.feedback)}` : ''}</p>`
        : ''}
    `;
    el.studentAssignmentList.appendChild(item);
  });
}

function deriveProfileRole(user) {
  const metaRole = user?.user_metadata?.role;
  if (metaRole === 'teacher' || metaRole === 'student') {
    return metaRole;
  }

  const appRole = user?.app_metadata?.role;
  if (appRole === 'teacher' || appRole === 'student') {
    return appRole;
  }

  const claimRole = user?.app_metadata?.claims?.role;
  if (claimRole === 'teacher' || claimRole === 'student') {
    return claimRole;
  }

  return 'student';
}

function buildAuthProfileFallback(user) {
  if (!user) return null;
  return {
    id: user.id || null,
    full_name: deriveProfileName(user),
    email: typeof user.email === 'string' ? user.email : null,
    role: deriveProfileRole(user),
  };
}

async function syncAuthMetadataRole(user, role) {
  if (!state.supabase || !user || !role) return;
  const currentRole = user?.user_metadata?.role;
  if (currentRole === role) return;

  try {
    await state.supabase.auth.updateUser({ data: { role } });
  } catch (error) {
    console.warn('No s\'ha pogut sincronitzar el rol amb Supabase Auth', error);
  }
}

function deriveProfileName(user) {
  const metadata = user?.user_metadata || {};
  const candidates = [metadata.full_name, metadata.name, metadata.user_name, user?.email];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return 'Usuari FocusQuiz';
}

async function ensureProfile(user) {
  if (!user || !user.id) {
    state.profile = null;
    return null;
  }
  const selectColumns = state.profileSupportsEmail
    ? 'id, full_name, role, email'
    : 'id, full_name, role';

  const { data, error } = await state.supabase
    .from('profiles')
    .select(selectColumns)
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    if (state.profileSupportsEmail && isMissingProfileEmailColumn(error)) {
      state.profileSupportsEmail = false;
      return ensureProfile(user);
    }
    throw error;
  }

  if (data) {
    const normalized = normalizeProfileRow(data, user);
    state.profile = normalized;
    if (user) {
      await syncAuthMetadataRole(user, normalized.role);
    }
    return normalized;
  }

  const payload = {
    id: user.id,
    full_name: deriveProfileName(user),
    role: deriveProfileRole(user),
  };

  if (state.profileSupportsEmail) {
    payload.email = typeof user.email === 'string' ? user.email : null;
  }

  const { data: upserted, error: upsertError } = await state.supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select(selectColumns)
    .maybeSingle();

  if (upsertError) {
    if (state.profileSupportsEmail && isMissingProfileEmailColumn(upsertError)) {
      state.profileSupportsEmail = false;
      return ensureProfile(user);
    }
    throw upsertError;
  }

  if (!upserted) {
    throw new Error('No s\'ha pogut crear el perfil de l\'usuari.');
  }

  const normalized = normalizeProfileRow(upserted, user);
  state.profile = normalized;
  if (user) {
    await syncAuthMetadataRole(user, normalized.role);
  }
  return normalized;
}

async function applySession(session, fallbackUser = null) {
  state.session = session ?? null;

  if (!state.session) {
    state.user = null;
    state.profile = null;
    state.sessionWarning = '';
    updateSessionUI();
    return;
  }

  let activeUser = state.session?.user ?? null;

  if (!activeUser && fallbackUser) {
    activeUser = fallbackUser;
  }

  if (!activeUser) {
    activeUser = state.user ?? null;
  }

  if (!activeUser && state.supabase) {
    try {
      const { data, error } = await state.supabase.auth.getUser();
      if (error) {
        console.warn('No s\'ha pogut recuperar l\'usuari actiu de Supabase', error);
      } else if (data?.user) {
        activeUser = data.user;
      }
    } catch (error) {
      console.warn('Error inesperat recuperant l\'usuari actiu de Supabase', error);
    }
  }

  if (!activeUser) {
    state.user = null;
    state.profile = null;
    state.sessionWarning =
      'No s\'ha pogut obtenir l\'usuari actiu de Supabase. Revisa la configuració o intenta-ho més tard.';
    showError(el.authError, state.sessionWarning);
    updateSessionUI();
    return;
  }

  state.user = activeUser;

  try {
    await ensureProfile(activeUser);
    state.sessionWarning = '';
  } catch (error) {
    console.error('No s\'ha pogut sincronitzar el perfil de Supabase', error);
    state.profile = buildAuthProfileFallback(activeUser);
    state.sessionWarning =
      'Sessió iniciada sense sincronitzar el perfil de Supabase. S\'utilitzen les dades del compte d\'accés.';
    if (activeUser && state.profile?.role) {
      await syncAuthMetadataRole(activeUser, state.profile.role);
    }
  }

  updateSessionUI();

  if (!state.profile) {
    return;
  }

  if (state.profile.role === 'teacher') {
    await Promise.all([loadStudents(), loadTeacherAssignments()]);
  } else {
    await loadStudentAssignments();
  }
}

function updateSessionUI() {
  const loggedIn = Boolean(state.session && state.profile);
  toggle(el.authPanel, !loggedIn);
  toggle(el.registerPanel, !loggedIn);
  toggle(el.sessionPanel, loggedIn);
  toggle(el.tabList, loggedIn);

  if (!loggedIn) {
    state.sessionWarning = '';
    resetTabs();
    toggle(el.teacherPanel, false);
    toggle(el.studentPanel, false);
    toggle(el.teacherView, false);
    toggle(el.teacherAssignments, false);
    toggle(el.studentView, false);
    if (el.sessionWarning) {
      el.sessionWarning.textContent = '';
      el.sessionWarning.classList.add('hidden');
    }
    clearSignupMessages();
    updateSignupRoleFields();
    return;
  }

  if (el.sessionName) {
    el.sessionName.textContent = state.profile.full_name || 'Usuari sense nom';
  }
  if (el.sessionRole) {
    el.sessionRole.textContent = state.profile.role === 'teacher'
      ? 'Rol: Mestre/a'
      : 'Rol: Alumne/a';
  }
  if (el.sessionWarning) {
    if (state.sessionWarning) {
      el.sessionWarning.textContent = state.sessionWarning;
      el.sessionWarning.classList.remove('hidden');
    } else {
      el.sessionWarning.textContent = '';
      el.sessionWarning.classList.add('hidden');
    }
  }

  const isTeacher = state.profile.role === 'teacher';
  configureTabsForRole(isTeacher ? 'teacher' : 'student');
  toggle(el.teacherView, isTeacher);
  toggle(el.teacherAssignments, isTeacher);
  toggle(el.studentView, !isTeacher);
}

async function loadStudents() {
  if (!state.supabase) return;
  const selectColumns = state.profileSupportsEmail ? 'id, full_name, email' : 'id, full_name';
  const { data, error } = await state.supabase
    .from('profiles')
    .select(selectColumns)
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  if (error) {
    if (state.profileSupportsEmail && isMissingProfileEmailColumn(error)) {
      state.profileSupportsEmail = false;
      await loadStudents();
      return;
    }
    showError(el.assignmentError, error.message);
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  state.students = rows
    .map((row) => normalizeProfileRow(row, null))
    .filter(Boolean);
  renderStudents();
}

async function loadTeacherAssignments() {
  if (!state.supabase) return;
  if (el.assignmentError) {
    el.assignmentError.textContent = '';
    el.assignmentError.classList.add('hidden');
  }
  const assignmentSelect = buildAssignmentSelect(true);
  const { data, error } = await state.supabase
    .from('assignments')
    .select(assignmentSelect)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    if (isQuizConfigSchemaError(error) && state.supportsQuizConfigColumn) {
      state.supportsQuizConfigColumn = false;
      await loadTeacherAssignments();
      return;
    }
    showError(el.assignmentError, error.message);
    return;
  }

  const assignments = Array.isArray(data) ? data : [];

  if (!assignments.length) {
    renderTeacherAssignments([]);
    return;
  }

  const assignmentIds = assignments.map((assignment) => assignment.id).filter(Boolean);
  let submissions = [];

  if (assignmentIds.length) {
    const { data: submissionRows, error: submissionError } = await state.supabase
      .from('submissions')
      .select('assignment_id, profile_id, grade, feedback, submitted_at')
      .in('assignment_id', assignmentIds);

    if (submissionError) {
      showError(el.assignmentError, submissionError.message);
      return;
    }

    submissions = Array.isArray(submissionRows) ? submissionRows : [];
  }

  const submissionMap = new Map(
    submissions.map((submission) => [`${submission.assignment_id}:${submission.profile_id}`, submission])
  );

  const enrichedAssignments = assignments.map((assignment) => {
    const assignees = Array.isArray(assignment.assignment_assignees)
      ? assignment.assignment_assignees.map((assignee) => {
          const key = `${assignment.id}:${assignee.profile_id}`;
          return {
            ...assignee,
            submission: submissionMap.get(key) || null,
          };
        })
      : [];

    return {
      ...assignment,
      assignment_assignees: assignees,
    };
  });

  renderTeacherAssignments(enrichedAssignments);
}

async function loadStudentAssignments() {
  if (!state.supabase || !state.profile) return;
  const assignmentSelect = buildAssignmentSelect(false);
  const { data, error } = await state.supabase
    .from('assignment_assignees')
    .select(`
      id,
      status,
      assigned_at,
      assignment_id,
      assignment:assignments (${assignmentSelect})
    `)
    .eq('profile_id', state.profile.id)
    .order('assigned_at', { ascending: false });

  if (error) {
    if (isQuizConfigSchemaError(error) && state.supportsQuizConfigColumn) {
      state.supportsQuizConfigColumn = false;
      await loadStudentAssignments();
      return;
    }
    showError(el.assignmentError, error.message);
    return;
  }

  const rows = Array.isArray(data) ? data : [];

  const assignmentIds = rows
    .map((row) => row.assignment_id || row.assignment?.id)
    .filter(Boolean);

  if (assignmentIds.length) {
    const uniqueAssignmentIds = Array.from(new Set(assignmentIds));
    const { data: submissionRows, error: submissionError } = await state.supabase
      .from('submissions')
      .select('id, assignment_id, profile_id, content, submitted_at, grade, feedback')
      .eq('profile_id', state.profile.id)
      .in('assignment_id', uniqueAssignmentIds);

    if (submissionError) {
      showError(el.assignmentError, submissionError.message);
      return;
    }

    const submissionMap = new Map(
      (submissionRows || []).map((submission) => [submission.assignment_id, submission])
    );

    rows.forEach((row) => {
      const submission = submissionMap.get(row.assignment_id || row.assignment?.id);
      if (submission) {
        row.submission = submission;
      }
    });
  }

  const missingAssignments = rows
    .filter((row) => !row.assignment && row.assignment_id)
    .map((row) => row.assignment_id);

  if (missingAssignments.length) {
    const uniqueIds = Array.from(new Set(missingAssignments));
    const fallbackSelect = buildAssignmentSelect(false);
    const { data: fallbackAssignments, error: fallbackError } = await state.supabase
      .from('assignments')
      .select(fallbackSelect)
      .in('id', uniqueIds);

    if (fallbackError && isQuizConfigSchemaError(fallbackError) && state.supportsQuizConfigColumn) {
      state.supportsQuizConfigColumn = false;
      await loadStudentAssignments();
      return;
    }

    if (Array.isArray(fallbackAssignments) && fallbackAssignments.length) {
      const fallbackMap = new Map(fallbackAssignments.map((assignment) => [assignment.id, assignment]));
      rows.forEach((row) => {
        if (!row.assignment && row.assignment_id) {
          const assignment = prepareAssignmentForDisplay(fallbackMap.get(row.assignment_id));
          if (assignment) {
            row.assignment = assignment;
          }
        }
      });
    }
  }

  const normalizedRows = rows.map((row) => {
    if (!row.assignment) return row;
    return { ...row, assignment: prepareAssignmentForDisplay(row.assignment) };
  });

  renderStudentAssignments(normalizedRows);
}

function handleTabClick(event) {
  const button = event.target.closest('[data-tab]');
  if (!button || button.disabled || button.hidden) return;
  const tabId = button.dataset.tab;
  if (!tabId || tabId === state.activeTab) return;
  setActiveTab(tabId, { focus: false });
}

function handleSignupRoleChange(event) {
  if (!event.target.matches('input[name="signup_role"]')) return;
  clearSignupMessages();
  updateSignupRoleFields();
}

async function handleSignup(event) {
  event.preventDefault();
  if (!state.supabase) return;

  clearSignupMessages();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const fullName = (formData.get('full_name') || '').toString().trim();
  const email = (formData.get('signup_email') || '').toString().trim();
  const password = (formData.get('signup_password') || '').toString();
  const roleValue = (formData.get('signup_role') || '').toString();
  const role = roleValue === 'teacher' ? 'teacher' : 'student';

  if (!fullName) {
    showError(el.signupError, 'Introdueix el teu nom complet.');
    return;
  }
  if (!email) {
    showError(el.signupError, 'Cal un correu electrònic vàlid.');
    return;
  }
  if (!password || password.length < 6) {
    showError(el.signupError, 'La contrasenya ha de tenir com a mínim 6 caràcters.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton ? submitButton.textContent : '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Creant compte…';
  }

  try {
    const { data, error } = await state.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) throw error;

    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await state.supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: fullName,
            email,
            role,
          },
          { onConflict: 'id' }
        );

      if (profileError) throw profileError;
    }

    const successMessage = data?.session
      ? 'Compte creat correctament! Ja pots iniciar sessió.'
      : 'Compte creat! Revisa el correu electrònic per confirmar-lo abans d\'iniciar sessió.';

    showSuccess(el.signupSuccess, successMessage);
    form.reset();
    updateSignupRoleFields();
  } catch (error) {
    const message = error?.message || 'No s\'ha pogut completar el registre.';
    showError(el.signupError, message);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel || 'Crear compte';
    }
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!state.supabase) return;

  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();

  toggle(el.authError, false);

  if (!email || !password) {
    showError(el.authError, 'Introdueix el correu electrònic i la contrasenya.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Entrant…';
  }

  try {
    const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const session = data?.session ?? null;
    if (session) {
      await applySession(session, data?.user ?? null);
    } else {
      const { data: refreshed } = await state.supabase.auth.getSession();
      await applySession(refreshed?.session ?? null, data?.user ?? null);
    }
  } catch (error) {
    const message = error?.message || 'No s\'ha pogut iniciar sessió.';
    showError(el.authError, message);
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel || 'Entrar';
    }
    return;
  }

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel || 'Entrar';
  }
}

async function handleLogout() {
  if (!state.supabase) return;

  if (el.logoutBtn) {
    el.logoutBtn.disabled = true;
  }

  const { error } = await state.supabase.auth.signOut();

  if (error) {
    alert('No s\'ha pogut tancar la sessió: ' + error.message);
    if (el.logoutBtn) {
      el.logoutBtn.disabled = false;
    }
    return;
  }

  await applySession(null);

  if (el.logoutBtn) {
    el.logoutBtn.disabled = false;
  }
}

async function handleAssignmentSubmit(event) {
  event.preventDefault();
  if (!state.supabase || !state.profile) return;

  resetAlerts();

  const formData = new FormData(event.currentTarget);
  const dueDate = formData.get('due_date') || null;
  const note = (formData.get('note') || '').toString().trim();
  const titleInput = (formData.get('quiz_title') || '').toString().trim();
  const quizConfigInput = {
    count: formData.get('quiz_count'),
    time: formData.get('quiz_time'),
    level: formData.get('quiz_level'),
  };
  const baseQuizConfig = normalizeQuizConfig(quizConfigInput);
  const selectedModuleIds = Array.from(state.selectedModules);

  const selectedStudents = formData.getAll('students').filter((value) => Boolean(value));

  if (!selectedModuleIds.length) {
    showError(el.assignmentError, 'Selecciona com a mínim un mòdul per crear les proves.');
    return;
  }

  if (!selectedStudents.length) {
    showError(el.assignmentError, 'Selecciona com a mínim un alumne per assignar les proves.');
    return;
  }

  const modulesToAssign = selectedModuleIds
    .map((moduleId) => state.moduleIndex.get(moduleId))
    .filter(Boolean);

  if (!modulesToAssign.length) {
    showError(el.assignmentError, 'Cap dels mòduls seleccionats és vàlid.');
    return;
  }

  const { optionsMap, summaries: optionSummaries, errors: optionErrors } = gatherModuleOptions(modulesToAssign);

  if (optionErrors.length) {
    const errorText = optionErrors
      .map(({ module, message }) => `${module.name}: ${message}`)
      .join(' · ');
    showError(el.assignmentError, `Revisa la configuració dels subtemes: ${errorText}`);
    return;
  }

  const inserts = modulesToAssign.map((module) => {
    const finalTitle = titleInput
      ? (modulesToAssign.length > 1 ? `${titleInput} · ${module.name}` : titleInput)
      : module.name;
    const moduleOptions = optionsMap.get(module.id) || {};
    const quizConfig = { ...baseQuizConfig, label: finalTitle };
    quizConfig.options = cloneModuleOptions(moduleOptions);
    const baseDescription = module.desc || 'Sense descripció';
    const configSummary = formatQuizConfig(quizConfig);
    const moduleSummary = optionSummaries.get(module.id) || '';
    const descriptionParts = [baseDescription];
    if (configSummary) {
      descriptionParts.push(`\n— Configuració de la prova —\n${configSummary}`);
    }
    if (moduleSummary) {
      descriptionParts.push(`\n— Subtemes configurats —\n${moduleSummary}`);
    }
    if (note) {
      descriptionParts.push(`\n— Nota del docent —\n${note}`);
    }
    const description = descriptionParts.join('\n').replace(/\n{3,}/g, '\n\n');
    return {
      title: finalTitle,
      description,
      due_date: dueDate,
      created_by: state.profile.id,
      module_id: module.id,
      quiz_config: quizConfig,
    };
  });

  let insertedAssignments = [];
  let usedFallbackStorage = false;

  if (state.supportsQuizConfigColumn) {
    const { data: result, error } = await state.supabase
      .from('assignments')
      .insert(inserts)
      .select('id');

    if (error) {
      if (isQuizConfigSchemaError(error)) {
        state.supportsQuizConfigColumn = false;
      } else {
        showError(el.assignmentError, error.message);
        return;
      }
    } else {
      insertedAssignments = Array.isArray(result) ? result : [];
    }
  }

  if (!insertedAssignments.length) {
    const fallbackPayload = inserts.map((assignment) => {
      const { quiz_config, ...rest } = assignment;
      return {
        ...rest,
        description: embedQuizConfigInDescription(assignment.description, quiz_config),
      };
    });

    const { data: result, error } = await state.supabase
      .from('assignments')
      .insert(fallbackPayload)
      .select('id');

    if (error) {
      showError(el.assignmentError, error.message);
      return;
    }

    insertedAssignments = Array.isArray(result) ? result : [];
    usedFallbackStorage = true;
  }

  const assignmentRows = insertedAssignments;

  if (assignmentRows.length && selectedStudents.length) {
    const rows = [];
    assignmentRows.forEach((assignmentRow) => {
      selectedStudents.forEach((profileId) => {
        rows.push({
          assignment_id: assignmentRow.id,
          profile_id: profileId,
        });
      });
    });

    const { error: assignError } = await state.supabase
      .from('assignment_assignees')
      .insert(rows);
    if (assignError) {
      showError(el.assignmentError, assignError.message);
      loadTeacherAssignments();
      return;
    }
  }

  event.currentTarget.reset();
  resetModulePicker();
  renderStudents();

  const moduleCount = modulesToAssign.length;
  const studentCount = selectedStudents.length;
  const moduleLabel = moduleCount === 1 ? '1 prova' : `${moduleCount} proves`;
  const studentLabel = studentCount === 1 ? '1 alumne' : `${studentCount} alumnes`;
  const verb = moduleCount === 1 ? 'assignada' : 'assignades';
  const baseMessage = `${moduleLabel} ${verb} a ${studentLabel}.`;
  const feedbackMessage = usedFallbackStorage
    ? `${baseMessage} Actualitza l'esquema de Supabase executant l'script de setup per guardar la configuració automàtica de les proves.`
    : baseMessage;
  showSuccess(el.assignmentFeedback, feedbackMessage);

  loadTeacherAssignments();
}

async function handleStatusChange(event) {
  const select = event.target;
  if (!select.matches('.status-select')) return;
  if (!state.supabase) return;

  const rowId = select.dataset.row;
  const value = select.value;
  if (!rowId) return;

  const { error } = await state.supabase
    .from('assignment_assignees')
    .update({ status: value })
    .eq('id', rowId);

  if (error) {
    alert('No s\'ha pogut actualitzar l\'estat: ' + error.message);
    return;
  }

  loadStudentAssignments();
}

async function handleAssignmentListClick(event) {
  const button = event.target.closest('.portal-delete-assignment');
  if (!button) return;
  event.preventDefault();
  if (!state.supabase) return;

  const assignmentId = button.dataset.assignmentDelete;
  if (!assignmentId) return;

  const confirmed = window.confirm('Vols eliminar aquesta tasca? Aquesta acció no es pot desfer.');
  if (!confirmed) return;

  button.disabled = true;
  const { error } = await state.supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId);
  button.disabled = false;

  if (error) {
    alert('No s\'ha pogut eliminar la tasca: ' + error.message);
    return;
  }

  resetAlerts();
  showSuccess(el.assignmentFeedback, 'Tasca eliminada correctament.');
  loadTeacherAssignments();
}

async function handleSubmission(event) {
  const form = event.target;
  if (!form.matches('.submission-form')) return;
  event.preventDefault();
  if (!state.supabase || !state.profile) return;

  const formData = new FormData(form);
  const assignmentId = form.dataset.assignment;
  const rowId = form.dataset.row;
  const rawContent = formData.get('content');
  const content = rawContent ? rawContent.toString().trim() : '';

  if (!assignmentId) {
    alert('No s\'ha pogut identificar la tasca.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton ? submitButton.textContent : '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Guardant…';
  }

  const payload = {
    assignment_id: assignmentId,
    profile_id: state.profile.id,
    content: content || null,
    submitted_at: new Date().toISOString(),
  };

  const { error } = await state.supabase
    .from('submissions')
    .upsert(payload, {
      onConflict: 'assignment_id,profile_id',
    });

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel || 'Envia resposta';
  }

  if (error) {
    alert('Error en desar la resposta: ' + error.message);
    return;
  }

  if (rowId) {
    const { error: statusError } = await state.supabase
      .from('assignment_assignees')
      .update({ status: 'submitted' })
      .eq('id', rowId);

    if (statusError) {
      alert('La resposta s\'ha desat però no s\'ha pogut actualitzar l\'estat: ' + statusError.message);
    }
  }

  alert('Resposta desada correctament.');
  form.reset();
  loadStudentAssignments();
}

function wireEvents() {
  if (el.loginForm) el.loginForm.addEventListener('submit', handleLogin);
  if (el.logoutBtn) el.logoutBtn.addEventListener('click', handleLogout);
  if (el.assignmentForm) el.assignmentForm.addEventListener('submit', handleAssignmentSubmit);
  if (el.assignmentList) el.assignmentList.addEventListener('click', handleAssignmentListClick);
  if (el.refreshStudents) el.refreshStudents.addEventListener('click', loadStudents);
  if (el.reloadAssignments) el.reloadAssignments.addEventListener('click', loadTeacherAssignments);
  if (el.modulePicker) el.modulePicker.addEventListener('click', handleModuleClick);
  if (el.moduleFilter) el.moduleFilter.addEventListener('change', handleModuleFilterChange);
  if (el.moduleSearch) el.moduleSearch.addEventListener('input', handleModuleSearch);
  if (el.tabList) el.tabList.addEventListener('click', handleTabClick);
  if (el.signupForm) {
    el.signupForm.addEventListener('submit', handleSignup);
    el.signupForm.addEventListener('change', handleSignupRoleChange);
  }
  document.addEventListener('change', handleStatusChange);
  document.addEventListener('submit', handleSubmission, true);
}

function disableUI() {
  toggle(el.authPanel, false);
  toggle(el.registerPanel, false);
  toggle(el.sessionPanel, false);
  toggle(el.tabList, false);
  toggle(el.teacherPanel, false);
  toggle(el.studentPanel, false);
  toggle(el.teacherView, false);
  toggle(el.teacherAssignments, false);
  toggle(el.studentView, false);
  state.sessionWarning = '';
  if (el.sessionWarning) {
    el.sessionWarning.textContent = '';
    el.sessionWarning.classList.add('hidden');
  }
  resetTabs();
}

async function init() {
  populateModuleFilter();
  renderModulePicker();
  updateSelectedModulesInfo();
  renderModuleConfigCards();
  updateSignupRoleFields();

  const config = await import('./supabase-config.js').catch(() => null);

  if (!config || !config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('your-project')) {
    toggle(el.configWarning, true);
    disableUI();
    return;
  }

  state.teacherAccessCode = (config.SUPABASE_TEACHER_CODE || '').toString().trim();
  state.requireTeacherCode = Boolean(state.teacherAccessCode);
  updateSignupRoleFields();

  state.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  await detectQuizConfigSupport();
  wireEvents();

  const { data: initialSession } = await state.supabase.auth.getSession();
  await applySession(initialSession?.session ?? null, initialSession?.session?.user ?? null);

  state.supabase.auth.onAuthStateChange(async (_event, session) => {
    await applySession(session, session?.user ?? null);
  });
}

async function detectQuizConfigSupport() {
  if (!state.supabase) return false;
  state.supportsQuizConfigColumn = true;
  const { error } = await state.supabase
    .from('assignments')
    .select('id, quiz_config')
    .limit(1);

  if (error && isQuizConfigSchemaError(error)) {
    state.supportsQuizConfigColumn = false;
    return false;
  }

  return !error;
}

init();
