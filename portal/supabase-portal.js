import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MODULES, CATEGORY_LABELS } from './modules-data.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
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
  assignmentList: document.getElementById('assignmentList'),
  assignmentEmpty: document.getElementById('assignmentEmptyState'),
  refreshAssignments: document.getElementById('refreshAssignments'),
  resultsList: document.getElementById('resultsList'),
  resultsEmpty: document.getElementById('resultsEmptyState'),
  refreshResults: document.getElementById('refreshResults'),
  resultsClassFilter: document.getElementById('resultsClassFilter'),
  resultsAssignmentFilter: document.getElementById('resultsAssignmentFilter'),
};

function createSupabaseClient() {
  if (!CONFIGURED) return null;
  if (state.supabase) return state.supabase;
  try {
    state.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return state.supabase;
  } catch (error) {
    console.error('No s\'ha pogut inicialitzar Supabase.', error);
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
  const userId = state.session?.user?.id;
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
    const email = state.session.user.email || '';
    const { error: insertError } = await client.from('profiles').insert({
      id: userId,
      full_name: state.session.user.user_metadata?.full_name || email.split('@')[0] || 'Docent',
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
    node.querySelector('.assignment-title').textContent = assignment.quiz_config?.label || assignment.module_title;
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
    addMeta('Preguntes', assignment.quiz_config?.count ?? '—');
    addMeta('Temps', assignment.quiz_config?.time ? `${assignment.quiz_config.time} min` : 'Sense límit');
    addMeta('Nivell', assignment.quiz_config?.level ?? '—');
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
    option.textContent = `${assignment.quiz_config?.label || assignment.module_title}`;
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
  const wrongs = submission?.details?.entry?.wrongs;
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
  const classFilter = elements.resultsClassFilter?.value || 'all';
  const assignmentFilter = elements.resultsAssignmentFilter?.value || 'all';
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
    const subtitle = `${submission.assignment?.quiz_config?.label || submission.assignment?.module_title || 'Prova'} · ${classLabel}`;
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
    addMeta('Encerts', submission.correct !== null ? `${submission.correct}/${submission.count ?? '?'}` : '—');
    addMeta('Temps', submission.time_spent ? `${Math.round(submission.time_spent / 60)} min` : '—');
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
    node.querySelector('.result-edit')?.addEventListener('click', () => editSubmissionScore(submission));
    node.querySelector('.result-reset')?.addEventListener('click', () => resetSubmission(submission));
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
  const className = formData.get('class_name')?.toString().trim();
  const studentNames = sanitizeListInput(formData.get('student_list'));
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
  const label = formData.get('assignment_label')?.toString().trim() || `${selectedClass?.class_name || ''} · ${module?.name || 'Prova'}`;
  const count = Number.parseInt(formData.get('count'), 10) || null;
  const time = Number.parseInt(formData.get('time'), 10) || null;
  const level = Number.parseInt(formData.get('level'), 10) || null;
  const dueAtRaw = formData.get('due_at')?.toString().trim();
  const notes = formData.get('notes')?.toString().trim() || null;
  const quizConfig = {
    label,
    count: Number.isFinite(count) ? count : null,
    time: Number.isFinite(time) ? time : 0,
    level: Number.isFinite(level) ? level : 1,
  };
  elements.assignmentFeedback.textContent = 'Publicant la prova...';
  try {
    const payload = {
      class_id: classId,
      module_id: moduleId,
      module_title: module?.name || moduleId,
      quiz_config: quizConfig,
      status: 'published',
      due_at: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
      notes,
    };
    const { error } = await client.from('assignments').insert(payload);
    if (error) throw error;
    elements.assignmentFeedback.textContent = 'Prova publicada';
    elements.assignmentForm.reset();
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
  const moduleId = elements.assignmentModuleSelect?.value;
  if (!moduleId) return;
  const params = new URLSearchParams({ module: moduleId });
  window.open(`../index.html?${params.toString()}`, '_blank', 'noopener');
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
    class_name: submission.assignments?.classes?.class_name || '',
    class_code: submission.assignments?.classes?.join_code || submission.class_code || '',
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
  if (elements.previewModule) {
    elements.previewModule.addEventListener('click', previewSelectedModule);
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
}

async function init() {
  if (!CONFIGURED) {
    setVisibility(elements.configWarning, true);
    return;
  }
  setVisibility(elements.configWarning, false);
  setupEventListeners();
  await refreshData();
}

document.addEventListener('DOMContentLoaded', init);
