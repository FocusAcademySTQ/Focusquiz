import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const state = {
  supabase: null,
  session: null,
  profile: null,
  students: [],
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
    label.innerHTML = `
      <input type="checkbox" value="${student.id}" />
      <span>${student.full_name || 'Alumne sense nom'} · ${student.email || ''}</span>
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

    const assignees = (assignment.assignment_assignees || []).map((row) => {
      const student = state.students.find((s) => s.id === row.profile_id);
      const name = student?.full_name || 'Alumne';
      return `
        <li>
          ${name}
          <span class="status-chip" data-status="${row.status}">${statusLabels[row.status] || row.status}</span>
        </li>
      `;
    });

    item.innerHTML = `
      <h4>${assignment.title}</h4>
      <p class="muted" style="margin-top:0.35rem">${assignment.description || 'Sense descripció'}</p>
      <p class="muted" style="margin-top:0.35rem">Data límit: <strong>${dueDate}</strong></p>
      <div>
        <p class="muted" style="margin-bottom:0.35rem">Alumnes assignats:</p>
        <ul class="muted" style="display:grid; gap:0.35rem; padding-left:1.25rem;">
          ${assignees.join('') || '<li>Sense alumnes assignats</li>'}
        </ul>
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

    const item = document.createElement('article');
    item.className = 'list-item';
    item.innerHTML = `
      <h4>${assignment.title}</h4>
      <p class="muted" style="margin-top:0.35rem">${assignment.description || 'Sense descripció'}</p>
      <p class="muted" style="margin-top:0.35rem">Data límit: <strong>${dueDate}</strong></p>
      <p style="margin-top:0.35rem;">
        Estat actual: <span class="status-chip" data-status="${row.status}">${statusLabels[row.status] || row.status}</span>
      </p>
      <label style="margin-top:0.75rem; display:block;">
        <span style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.25rem;">Canvia l'estat</span>
        <select class="status-select" data-row="${row.id}">
          ${Object.entries(statusLabels)
            .map(([value, label]) => `<option value="${value}" ${value === row.status ? 'selected' : ''}>${label}</option>`)
            .join('')}
        </select>
      </label>
      <form class="submission-form" data-assignment="${assignment.id}" data-row="${row.id}" style="margin-top:1rem; display:grid; gap:0.5rem;">
        <label>
          <span style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.25rem;">Enllaç o comentaris</span>
          <textarea name="content" placeholder="Afegeix informació de l'entrega">${submission?.content || ''}</textarea>
        </label>
        <div class="actions">
          <button type="submit">Envia resposta</button>
        </div>
      </form>
      ${submittedAt ? `<p class="muted">Darrera entrega: ${submittedAt}</p>` : ''}
      ${submission?.grade !== null && submission?.grade !== undefined
        ? `<p class="muted">Nota: <strong>${submission.grade}</strong> · ${submission.feedback || ''}</p>`
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
  const title = formData.get('title');
  const description = formData.get('description');
  const dueDate = formData.get('due_date') || null;

  const selectedStudents = Array.from(el.studentChecklist?.querySelectorAll('input[type="checkbox"]:checked') || [])
    .map((input) => input.value);

  const { data, error } = await state.supabase
    .from('assignments')
    .insert({
      title,
      description,
      due_date: dueDate,
      created_by: state.profile.id,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    showError(el.assignmentError, error.message);
    return;
  }

  if (selectedStudents.length) {
    const rows = selectedStudents.map((profileId) => ({
      assignment_id: data.id,
      profile_id: profileId,
    }));
    const { error: assignError } = await state.supabase
      .from('assignment_assignees')
      .insert(rows);
    if (assignError) {
      showError(el.assignmentError, assignError.message);
    }
  }

  event.currentTarget.reset();
  renderStudents();
  showSuccess(el.assignmentFeedback, 'Tasca creada correctament.');
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
  if (el.refreshStudents) el.refreshStudents.addEventListener('click', loadStudents);
  if (el.reloadAssignments) el.reloadAssignments.addEventListener('click', loadTeacherAssignments);
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
