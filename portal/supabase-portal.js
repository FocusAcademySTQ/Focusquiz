import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MODULES, CATEGORY_LABELS } from './modules-data.js';

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
  profile: null,
  students: [],
  modules: sortedModules,
  moduleIndex: new Map(sortedModules.map((module) => [module.id, module])),
  selectedModules: new Set(),
  moduleFilter: 'all',
  moduleSearch: '',
};

const el = {
  configWarning: document.getElementById('configWarning'),
  authPanel: document.getElementById('authPanel'),
  loginForm: document.getElementById('loginForm'),
  authError: document.getElementById('authError'),
  sessionPanel: document.getElementById('sessionPanel'),
  sessionName: document.getElementById('sessionName'),
  sessionRole: document.getElementById('sessionRole'),
  logoutBtn: document.getElementById('logoutBtn'),
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
  studentChecklist: document.getElementById('studentChecklist'),
  assignmentList: document.getElementById('assignmentList'),
  reloadAssignments: document.getElementById('reloadAssignments'),
  studentView: document.getElementById('studentView'),
  studentAssignmentList: document.getElementById('studentAssignmentList'),
};

const statusLabels = {
  pending: 'Pendent',
  in_progress: 'En curs',
  submitted: 'Entregada',
  completed: 'Completada',
};

function toggle(element, show) {
  if (!element) return;
  element.classList.toggle('hidden', !show);
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

function updateSelectedModulesInfo() {
  if (!el.moduleSelectedInfo) return;
  const count = state.selectedModules.size;
  let text = 'Cap mòdul seleccionat';
  if (count === 1) {
    text = '1 mòdul seleccionat';
  } else if (count > 1) {
    text = `${count} mòduls seleccionats`;
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
  state.moduleFilter = 'all';
  state.moduleSearch = '';
  if (el.moduleFilter) el.moduleFilter.value = 'all';
  if (el.moduleSearch) el.moduleSearch.value = '';
  renderModulePicker();
  updateSelectedModulesInfo();
}

function handleModuleClick(event) {
  const button = event.target.closest('.portal-module-card');
  if (!button) return;
  const moduleId = button.dataset.moduleId;
  if (!moduleId) return;

  const willSelect = !state.selectedModules.has(moduleId);
  if (willSelect) {
    state.selectedModules.add(moduleId);
  } else {
    state.selectedModules.delete(moduleId);
  }

  button.classList.toggle('is-selected', willSelect);
  button.setAttribute('aria-selected', willSelect ? 'true' : 'false');
  updateSelectedModulesInfo();
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

function renderTeacherAssignments(assignments) {
  if (!el.assignmentList) return;
  el.assignmentList.innerHTML = '';

  if (!assignments.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Encara no has creat cap tasca.';
    el.assignmentList.appendChild(empty);
    return;
  }

  assignments.forEach((assignment) => {
    const item = document.createElement('article');
    item.className = 'list-item';

    const dueDate = assignment.due_date
      ? new Date(assignment.due_date + 'T00:00:00').toLocaleDateString('ca-ES')
      : 'Sense data límit';

    const assignmentId = escapeHTML(assignment.id);
    const module = assignment.module_id ? state.moduleIndex.get(assignment.module_id) : null;
    const moduleName = escapeHTML(module?.name || assignment.title || 'Tasca');
    const descriptionSource = assignment.description || module?.desc || 'Sense descripció';
    const descriptionHTML = formatDescription(descriptionSource);
    const moduleTag = module ? `<span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>` : '';
    const moduleLink = module
      ? `../index.html?module=${encodeURIComponent(module.id)}`
      : '';

    const assignees = (assignment.assignment_assignees || []).map((row) => {
      const student = state.students.find((s) => s.id === row.profile_id);
      const name = escapeHTML(student?.full_name || 'Alumne');
      return `
        <li>
          ${name}
          <span class="portal-status-chip" data-status="${row.status}">${escapeHTML(statusLabels[row.status] || row.status)}</span>
        </li>
      `;
    });

    const actions = [];
    if (moduleLink) {
      actions.push(`<a class="btn-secondary" href="${moduleLink}" target="_blank" rel="noopener">Obre el mòdul</a>`);
    }
    actions.push(`<button class="btn-ghost portal-delete-assignment" type="button" data-assignment-delete="${assignmentId}">🗑️ Elimina</button>`);

    item.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:0.5rem;">
        <h4 style="margin:0;">${moduleName}</h4>
        ${moduleTag}
      </div>
      <p class="portal-muted" style="margin-top:0.35rem">${descriptionHTML}</p>
      <p class="portal-muted" style="margin-top:0.35rem">Data límit: <strong>${escapeHTML(dueDate)}</strong></p>
      <div>
        <p class="portal-muted" style="margin-bottom:0.35rem">Alumnes assignats:</p>
        <ul class="portal-meta-list portal-muted">
          ${assignees.join('') || '<li>Sense alumnes assignats</li>'}
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
    empty.textContent = 'No tens tasques assignades.';
    el.studentAssignmentList.appendChild(empty);
    return;
  }

  rows.forEach((row) => {
    const assignment = row.assignment;
    if (!assignment) return;

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
    const moduleName = escapeHTML(module?.name || assignment.title || 'Tasca');
    const moduleTag = module ? `<span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>` : '';
    const moduleLink = module
      ? `../index.html?module=${encodeURIComponent(module.id)}`
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
        <h4 style="margin:0;">${moduleName}</h4>
        ${moduleTag}
      </div>
      <p class="portal-muted" style="margin-top:0.35rem">${descriptionHTML}</p>
      <p class="portal-muted" style="margin-top:0.35rem">Data límit: <strong>${escapeHTML(dueDate)}</strong></p>
      ${moduleLink ? `<div class="portal-assignment-actions"><a class="btn-primary" href="${moduleLink}" target="_blank" rel="noopener">Comença el mòdul</a></div>` : ''}
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

async function ensureProfile(user) {
  const { data, error } = await state.supabase
    .from('profiles')
    .select('id, full_name, role, email')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('No s\'ha trobat el perfil a la taula profiles.');
  }

  state.profile = data;
  return data;
}

function updateSessionUI() {
  const loggedIn = Boolean(state.session && state.profile);
  toggle(el.authPanel, !loggedIn);
  toggle(el.sessionPanel, loggedIn);

  if (!loggedIn) {
    toggle(el.teacherView, false);
    toggle(el.teacherAssignments, false);
    toggle(el.studentView, false);
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

  const isTeacher = state.profile.role === 'teacher';
  toggle(el.teacherView, isTeacher);
  toggle(el.teacherAssignments, isTeacher);
  toggle(el.studentView, !isTeacher);
}

async function loadStudents() {
  if (!state.supabase) return;
  const { data, error } = await state.supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  if (error) {
    showError(el.assignmentError, error.message);
    return;
  }

  state.students = data || [];
  renderStudents();
}

async function loadTeacherAssignments() {
  if (!state.supabase) return;
  const { data, error } = await state.supabase
    .from('assignments')
    .select(`
      id,
      title,
      description,
      module_id,
      due_date,
      created_at,
      assignment_assignees (
        id,
        profile_id,
        status
      )
    `)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    showError(el.assignmentError, error.message);
    return;
  }

  renderTeacherAssignments(data || []);
}

async function loadStudentAssignments() {
  if (!state.supabase || !state.profile) return;
  const { data, error } = await state.supabase
    .from('assignment_assignees')
    .select(`
      id,
      status,
      assignment:assignments (
        id,
        title,
        description,
        module_id,
        due_date,
        created_at
      ),
      submission:submissions (
        id,
        content,
        submitted_at,
        grade,
        feedback
      )
    `)
    .eq('profile_id', state.profile.id)
    .order('assigned_at', { ascending: false });

  if (error) {
    showError(el.assignmentError, error.message);
    return;
  }

  renderStudentAssignments(data || []);
}

async function handleLogin(event) {
  event.preventDefault();
  if (!state.supabase) return;

  const formData = new FormData(event.currentTarget);
  const email = formData.get('email');
  const password = formData.get('password');

  toggle(el.authError, false);

  const { error } = await state.supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showError(el.authError, error.message);
  }
}

async function handleLogout() {
  if (!state.supabase) return;
  await state.supabase.auth.signOut();
}

async function handleAssignmentSubmit(event) {
  event.preventDefault();
  if (!state.supabase || !state.profile) return;

  resetAlerts();

  const formData = new FormData(event.currentTarget);
  const dueDate = formData.get('due_date') || null;
  const note = (formData.get('note') || '').toString().trim();
  const selectedModuleIds = Array.from(state.selectedModules);

  const selectedStudents = formData.getAll('students').filter((value) => Boolean(value));

  if (!selectedModuleIds.length) {
    showError(el.assignmentError, 'Selecciona com a mínim un mòdul per crear les tasques.');
    return;
  }

  if (!selectedStudents.length) {
    showError(el.assignmentError, 'Selecciona com a mínim un alumne per assignar els mòduls.');
    return;
  }

  const modulesToAssign = selectedModuleIds
    .map((moduleId) => state.moduleIndex.get(moduleId))
    .filter(Boolean);

  if (!modulesToAssign.length) {
    showError(el.assignmentError, 'Cap dels mòduls seleccionats és vàlid.');
    return;
  }

  const inserts = modulesToAssign.map((module) => {
    const baseDescription = module.desc || 'Sense descripció';
    const description = note
      ? `${baseDescription}\n\n— Nota del docent —\n${note}`
      : baseDescription;
    return {
      title: module.name,
      description,
      due_date: dueDate,
      created_by: state.profile.id,
      module_id: module.id,
    };
  });

  const { data: insertedAssignments, error } = await state.supabase
    .from('assignments')
    .insert(inserts)
    .select('id');

  if (error) {
    showError(el.assignmentError, error.message);
    return;
  }

  const assignmentRows = Array.isArray(insertedAssignments) ? insertedAssignments : [];

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
  const moduleLabel = moduleCount === 1 ? '1 mòdul' : `${moduleCount} mòduls`;
  const studentLabel = studentCount === 1 ? '1 alumne' : `${studentCount} alumnes`;
  showSuccess(el.assignmentFeedback, `${moduleLabel} assignat(s) a ${studentLabel}.`);

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
  if (!event.target.matches('.submission-form')) return;
  event.preventDefault();
  if (!state.supabase || !state.profile) return;

  const formData = new FormData(event.target);
  const content = formData.get('content');
  const assignmentId = event.target.dataset.assignment;

  const { error } = await state.supabase
    .from('submissions')
    .upsert({
      assignment_id: assignmentId,
      profile_id: state.profile.id,
      content,
    }, {
      onConflict: 'assignment_id,profile_id',
    });

  if (error) {
    alert('Error en desar la resposta: ' + error.message);
    return;
  }

  alert('Resposta desada correctament.');
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
  document.addEventListener('change', handleStatusChange);
  document.addEventListener('submit', handleSubmission, true);
}

function disableUI() {
  toggle(el.authPanel, false);
  toggle(el.sessionPanel, false);
  toggle(el.teacherView, false);
  toggle(el.teacherAssignments, false);
  toggle(el.studentView, false);
}

async function init() {
  populateModuleFilter();
  renderModulePicker();
  updateSelectedModulesInfo();

  const config = await import('./supabase-config.js').catch(() => null);

  if (!config || !config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('your-project')) {
    toggle(el.configWarning, true);
    disableUI();
    return;
  }

  state.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  wireEvents();

  const { data: initialSession } = await state.supabase.auth.getSession();
  state.session = initialSession?.session ?? null;
  if (state.session?.user) {
    await ensureProfile(state.session.user);
    updateSessionUI();
    if (state.profile.role === 'teacher') {
      await Promise.all([loadStudents(), loadTeacherAssignments()]);
    } else {
      await loadStudentAssignments();
    }
  } else {
    updateSessionUI();
  }

  state.supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
    if (session?.user) {
      try {
        await ensureProfile(session.user);
      } catch (error) {
        showError(el.authError, error.message);
        await state.supabase.auth.signOut();
        return;
      }

      updateSessionUI();
      if (state.profile.role === 'teacher') {
        await Promise.all([loadStudents(), loadTeacherAssignments()]);
      } else {
        await loadStudentAssignments();
      }
    } else {
      state.profile = null;
      updateSessionUI();
    }
  });
}

init();
