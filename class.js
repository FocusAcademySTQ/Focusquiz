import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveSupabaseConfig } from './portal/supabase-config.js';

let cachedConfig = resolveSupabaseConfig();
const state = {
  supabase: null,
  classCode: '',
  classInfo: null,
  students: [],
  assignments: [],
  submissions: new Map(),
  selectedStudent: '',
};

const STATUS_LABELS = {
  submitted: 'Enviada',
  completed: 'Completada',
  reviewed: 'Revisada',
};

const elements = {
  main: document.getElementById('classMain'),
  error: document.getElementById('classError'),
  errorMessage: document.getElementById('classErrorMessage'),
  className: document.getElementById('className'),
  classSubtitle: document.getElementById('classSubtitle'),
  classCodeBadge: document.getElementById('classCodeBadge'),
  rosterBody: document.getElementById('rosterBody'),
  assignmentList: document.getElementById('assignmentList'),
  assignmentStatus: document.getElementById('assignmentStatus'),
  clearStudent: document.getElementById('clearStudent'),
  copyLink: document.getElementById('copyClassLink'),
  studentTemplate: document.getElementById('studentButtonTemplate'),
  assignmentTemplate: document.getElementById('assignmentCardTemplate'),
};

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

function showError(message) {
  if (elements.error) {
    elements.error.hidden = false;
    elements.errorMessage.textContent = message;
  }
  if (elements.main) {
    elements.main.hidden = true;
  }
}

function showMain() {
  if (elements.main) elements.main.hidden = false;
  if (elements.error) elements.error.hidden = true;
}

function parseCodeFromLocation() {
  const params = new URLSearchParams(window.location.search);
  let code = params.get('code');
  if (!code && window.location.hash) {
    code = window.location.hash.replace(/^#/, '');
  }
  if (!code) return '';
  return code.trim().toUpperCase();
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
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return state.supabase;
  } catch (error) {
    console.error('No s\'ha pogut inicialitzar Supabase.', error);
    state.supabase = null;
    return null;
  }
}

function renderRoster() {
  const container = elements.rosterBody;
  if (!container) return;
  container.innerHTML = '';
  if (!state.students.length) {
    container.innerHTML = '<p class="portal-muted">Encara no hi ha alumnes assignats.</p>';
    return;
  }

  if (state.selectedStudent && !state.students.includes(state.selectedStudent)) {
    state.selectedStudent = '';
  }

  const list = document.createElement('div');
  list.className = 'class-student-grid';
  state.students.forEach((studentName) => {
    const node = elements.studentTemplate.content.firstElementChild.cloneNode(true);
    node.textContent = studentName;
    node.dataset.student = studentName;
    if (state.selectedStudent === studentName) {
      node.classList.add('is-active');
    }
    node.addEventListener('click', () => {
      state.selectedStudent = studentName;
      renderRoster();
      renderAssignments();
    });
    list.appendChild(node);
  });
  container.appendChild(list);
}

function renderAssignments() {
  const container = elements.assignmentList;
  if (!container) return;
  container.innerHTML = '';

  if (!state.selectedStudent) {
    elements.assignmentStatus.textContent = 'Tria el teu nom per veure les proves disponibles.';
    return;
  }

  if (!state.assignments.length) {
    elements.assignmentStatus.textContent = 'No hi ha proves actives per a aquesta classe.';
    return;
  }

  const studentKey = state.selectedStudent.toLowerCase();
  const submissions = state.submissions.get(studentKey) || new Map();
  let hasVisible = false;

  state.assignments.forEach((assignment) => {
    const existing = submissions.get(assignment.id);
    const card = elements.assignmentTemplate.content.firstElementChild.cloneNode(true);
    const moduleLabel = card.querySelector('.assignment-module');
    const title = card.querySelector('.assignment-title');
    const metaList = card.querySelector('.assignment-meta');
    const startBtn = card.querySelector('.assignment-start');

    moduleLabel.textContent = assignment.module_title;
    title.textContent = assignment.quiz_config?.label || assignment.module_title || 'Prova FocusQuiz';

    const created = new Date(assignment.date_assigned);
    const due = assignment.due_at ? new Date(assignment.due_at) : null;

    metaList.innerHTML = '';
    const addMeta = (label, value) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const def = document.createElement('dd');
      def.textContent = value;
      metaList.appendChild(term);
      metaList.appendChild(def);
    };

    addMeta('Publicada', created.toLocaleString('ca-ES'));
    if (due) {
      addMeta('Data límit', due.toLocaleString('ca-ES'));
    }
    if (assignment.quiz_config?.count) {
      addMeta('Preguntes', assignment.quiz_config.count);
    }
    if (assignment.quiz_config?.time) {
      addMeta('Temps', `${assignment.quiz_config.time} min`);
    } else {
      addMeta('Temps', 'Sense límit');
    }
    if (assignment.quiz_config?.level) {
      addMeta('Nivell', assignment.quiz_config.level);
    }
    if (assignment.quiz_config?.summary) {
      addMeta('Configuració', assignment.quiz_config.summary);
    }

    if (existing) {
      startBtn.textContent = 'Torna a veure la nota';
      startBtn.classList.add('is-secondary');
      addMeta('Estat', statusLabel(existing.status));
      if (existing.score !== null && existing.score !== undefined) {
        addMeta('Nota', formatPercent(existing.score));
      }
      if (existing.submitted_at) {
        const submitted = new Date(existing.submitted_at);
        addMeta('Enviada', submitted.toLocaleString('ca-ES'));
      }
    }

    startBtn.addEventListener('click', () => launchAssignment(assignment));
    container.appendChild(card);
    hasVisible = true;
  });

  if (!hasVisible) {
    elements.assignmentStatus.textContent = 'Cap prova disponible per al teu usuari.';
  } else {
    elements.assignmentStatus.textContent = `Sessió iniciada com ${state.selectedStudent}.`;
  }
}

function launchAssignment(assignment) {
  if (!state.classInfo) return;
  const moduleId = assignment.module_id;
  const baseUrl = new URL('index.html', window.location.href);
  const params = new URLSearchParams();
  params.set('module', moduleId);
  params.set('assignment', assignment.id);
  params.set('class', state.classCode);
  params.set('classId', state.classInfo.id);
  params.set('student', state.selectedStudent);
  params.set('autostart', '1');
  if (assignment.quiz_config?.label) params.set('label', assignment.quiz_config.label);
  if (assignment.quiz_config?.count) params.set('count', assignment.quiz_config.count);
  if (assignment.quiz_config?.time) params.set('time', assignment.quiz_config.time);
  if (assignment.quiz_config?.level) params.set('level', assignment.quiz_config.level);
  if (assignment.module_title) params.set('title', assignment.module_title);
  if (assignment.quiz_config?.options) {
    const encodedOptions = encodeQuizOptions(assignment.quiz_config.options);
    if (encodedOptions) {
      params.set('opts', encodedOptions);
    }
  }
  baseUrl.search = params.toString();
  baseUrl.hash = '';
  window.location.href = baseUrl.toString();
}

function buildSubmissionsMap(raw = []) {
  const map = new Map();
  raw.forEach((submission) => {
    const nameKey = (submission.student_name || '').toLowerCase();
    if (!nameKey) return;
    if (!map.has(nameKey)) {
      map.set(nameKey, new Map());
    }
    const inner = map.get(nameKey);
    inner.set(submission.assignment_id, submission);
  });
  return map;
}

async function loadData() {
  const supabase = ensureClient();
  if (!supabase) {
    showError('Cal configurar Supabase per utilitzar aquest espai.');
    return;
  }

  state.classCode = parseCodeFromLocation();
  if (!state.classCode) {
    showError('Introdueix un codi de classe vàlid.');
    return;
  }

  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id, class_name, join_code, students')
    .eq('join_code', state.classCode)
    .maybeSingle();

  if (classError || !classData) {
    console.error('No s\'ha trobat la classe', classError);
    showError('No hem trobat cap classe amb aquest codi.');
    return;
  }

  state.classInfo = classData;
  elements.className.textContent = classData.class_name;
  elements.classCodeBadge.textContent = `Codi ${classData.join_code}`;
  elements.classSubtitle.textContent = 'Classe activa';
  if (elements.copyLink) {
    elements.copyLink.disabled = false;
  }

  const roster = Array.isArray(classData.students)
    ? classData.students
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
        .sort((a, b) => a.localeCompare(b, 'ca', { sensitivity: 'base' }))
    : [];

  let assignments = [];
  let submissions = [];
  try {
    const results = await Promise.all([
      supabase
        .from('assignments')
        .select('id, module_id, module_title, quiz_config, date_assigned, due_at, status')
        .eq('class_id', classData.id)
        .eq('status', 'published')
        .order('date_assigned', { ascending: false }),
      supabase
        .from('submissions')
        .select('assignment_id, student_name, score, status, submitted_at, details')
        .eq('class_id', classData.id)
        .eq('class_code', state.classCode),
    ]);
    assignments = results[0]?.data || [];
    submissions = results[1]?.data || [];
  } catch (error) {
    console.error('No s\'han pogut carregar les dades de la classe', error);
  }

  state.students = roster;
  state.assignments = Array.isArray(assignments) ? assignments : [];
  state.submissions = buildSubmissionsMap(Array.isArray(submissions) ? submissions : []);

  renderRoster();
  renderAssignments();
  showMain();
}

document.addEventListener('DOMContentLoaded', () => {
  const config = getActiveSupabaseConfig();
  if (!config) {
    showError('Configura Supabase abans de compartir les classes.');
    return;
  }

  if (elements.copyLink) {
    elements.copyLink.disabled = true;
  }

  if (elements.copyLink) {
    elements.copyLink.addEventListener('click', async () => {
      if (!state.classInfo) return;
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('code', state.classCode);
        await navigator.clipboard.writeText(url.toString());
        elements.copyLink.textContent = 'Copiat!';
        setTimeout(() => {
          elements.copyLink.textContent = 'Copia l\'enllaç';
        }, 2500);
      } catch (error) {
        console.warn('No s\'ha pogut copiar l\'enllaç', error);
      }
    });
  }

  if (elements.clearStudent) {
    elements.clearStudent.addEventListener('click', () => {
      state.selectedStudent = '';
      renderRoster();
      renderAssignments();
    });
  }

  loadData();
});
