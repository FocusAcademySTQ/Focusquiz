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

const ASSIGNMENT_STORAGE_PREFIX = 'focusquiz.assignment.';

const state = {
  supabase: null,
  session: null,
  profile: null,
  students: [],
  modules: sortedModules,
  moduleIndex: new Map(sortedModules.map((module) => [module.id, module])),
  selectedModuleId: null,
  moduleConfigBundle: null,
  moduleFilter: 'all',
  moduleSearch: '',
  studentAssignments: [],
  teacherAssignments: [],
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
  moduleSelectedChip: document.getElementById('moduleSelectedChip'),
  selectedModuleTitle: document.getElementById('selectedModuleTitle'),
  selectedModuleDescription: document.getElementById('selectedModuleDescription'),
  moduleSummaryBadges: document.getElementById('moduleSummaryBadges'),
  moduleSummaryDetails: document.getElementById('moduleSummaryDetails'),
  configureModuleBtn: document.getElementById('configureModuleBtn'),
  clearModuleBtn: document.getElementById('clearModuleBtn'),
  moduleConfigOverlay: document.getElementById('moduleConfigOverlay'),
  moduleConfigFrame: document.getElementById('moduleConfigFrame'),
  moduleConfigTitle: document.getElementById('moduleConfigTitle'),
  closeConfigOverlay: document.getElementById('closeConfigOverlay'),
  studentChecklist: document.getElementById('studentChecklist'),
  assignmentList: document.getElementById('assignmentList'),
  reloadAssignments: document.getElementById('reloadAssignments'),
  studentView: document.getElementById('studentView'),
  studentAssignmentList: document.getElementById('studentAssignmentList'),
  assignmentLaunchOverlay: document.getElementById('assignmentLaunchOverlay'),
  assignmentLaunchFrame: document.getElementById('assignmentLaunchFrame'),
  assignmentLaunchTitle: document.getElementById('assignmentLaunchTitle'),
  closeLaunchOverlay: document.getElementById('closeLaunchOverlay'),
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

function normalizeSummary(summary, module) {
  const safe = summary && typeof summary === 'object' ? summary : {};
  const headline = typeof safe.headline === 'string' ? safe.headline.trim() : '';
  const badges = Array.isArray(safe.badges) ? safe.badges.filter(Boolean) : [];
  const details = Array.isArray(safe.details) ? safe.details.filter(Boolean) : [];
  const fallback = module?.desc || '';
  return { headline, badges, details, fallback };
}

function summaryBadgesHTML(normalized) {
  if (!normalized.badges.length) return '';
  return normalized.badges
    .map((badge) => `<span class="portal-chip">${escapeHTML(badge)}</span>`)
    .join('');
}

function summaryDetailsHTML(normalized) {
  if (!normalized.details.length) return '';
  return normalized.details.map((detail) => `<li>${escapeHTML(detail)}</li>`).join('');
}

function buildAssignmentTitle(module, summary) {
  const normalized = normalizeSummary(summary, module);
  const moduleName = module?.name || 'Prova FocusQuiz';
  if (normalized.headline) {
    return `${moduleName} · ${normalized.headline}`;
  }
  return moduleName;
}

function buildAssignmentDescription(module, summary, note) {
  const normalized = normalizeSummary(summary, module);
  const lines = [];
  if (normalized.headline) {
    lines.push(normalized.headline);
  } else if (normalized.fallback) {
    lines.push(normalized.fallback);
  }
  if (normalized.badges.length) {
    lines.push(normalized.badges.join(' · '));
  }
  normalized.details.forEach((detail) => {
    lines.push(`• ${detail}`);
  });
  if (note) {
    if (lines.length) lines.push('');
    lines.push('— Nota del docent —');
    lines.push(note);
  }
  if (!lines.length) {
    lines.push('Prova configurada al portal FocusQuiz.');
  }
  return lines.join('\n');
}

function updateModuleSelectionUI() {
  const module = state.selectedModuleId ? state.moduleIndex.get(state.selectedModuleId) : null;
  const bundle = state.moduleConfigBundle;

  if (el.moduleSelectedChip) {
    el.moduleSelectedChip.textContent = module ? `Mòdul: ${module.name}` : 'Cap mòdul seleccionat';
    el.moduleSelectedChip.classList.toggle('portal-chip--muted', !module);
    el.moduleSelectedChip.classList.toggle('portal-chip--positive', Boolean(module));
  }

  if (el.configureModuleBtn) {
    el.configureModuleBtn.disabled = !module;
    el.configureModuleBtn.textContent = bundle ? 'Torna a configurar' : 'Obre el configurador';
  }
  if (el.clearModuleBtn) {
    el.clearModuleBtn.disabled = !module;
  }

  if (!module) {
    if (el.selectedModuleTitle) el.selectedModuleTitle.textContent = 'Cap prova seleccionada';
    if (el.selectedModuleDescription) {
      el.selectedModuleDescription.textContent = 'Selecciona un mòdul per preparar una prova personalitzada per a l\'alumnat.';
    }
    if (el.moduleSummaryBadges) el.moduleSummaryBadges.innerHTML = '';
    if (el.moduleSummaryDetails) el.moduleSummaryDetails.innerHTML = '';
    return;
  }

  if (el.selectedModuleTitle) {
    el.selectedModuleTitle.textContent = module.name;
  }

  if (bundle) {
    const normalized = normalizeSummary(bundle.summary, module);
    if (el.selectedModuleDescription) {
      const description = normalized.headline || normalized.fallback || 'Prova configurada a mida.';
      el.selectedModuleDescription.textContent = description;
    }
    if (el.moduleSummaryBadges) {
      el.moduleSummaryBadges.innerHTML = summaryBadgesHTML(normalized);
    }
    if (el.moduleSummaryDetails) {
      const detailHTML = summaryDetailsHTML(normalized);
      if (detailHTML) {
        el.moduleSummaryDetails.innerHTML = detailHTML;
      } else if (normalized.fallback) {
        el.moduleSummaryDetails.innerHTML = `<li>${escapeHTML(normalized.fallback)}</li>`;
      } else {
        el.moduleSummaryDetails.innerHTML = '';
      }
    }
  } else {
    if (el.selectedModuleDescription) {
      el.selectedModuleDescription.textContent = 'Obre el configurador FocusQuiz per escollir el subtema i els paràmetres exactes de la prova.';
    }
    if (el.moduleSummaryBadges) {
      el.moduleSummaryBadges.innerHTML = '';
    }
    if (el.moduleSummaryDetails) {
      el.moduleSummaryDetails.innerHTML = module.desc ? `<li>${escapeHTML(module.desc)}</li>` : '';
    }
  }
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
    const isSelected = state.selectedModuleId === module.id;
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

  updateModuleSelectionUI();
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

function resetModulePicker(event) {
  if (event) event.preventDefault();
  closeModuleConfigurator();
  state.selectedModuleId = null;
  state.moduleConfigBundle = null;
  state.moduleFilter = 'all';
  state.moduleSearch = '';
  if (el.moduleFilter) el.moduleFilter.value = 'all';
  if (el.moduleSearch) el.moduleSearch.value = '';
  renderModulePicker();
  updateModuleSelectionUI();
}

function handleModuleClick(event) {
  const button = event.target.closest('.portal-module-card');
  if (!button) return;
  const moduleId = button.dataset.moduleId;
  if (!moduleId) return;

  const changed = state.selectedModuleId !== moduleId;
  state.selectedModuleId = moduleId;
  if (changed) {
    state.moduleConfigBundle = null;
  }

  renderModulePicker();
  triggerModuleConfigurator(true);
}

function handleModuleFilterChange(event) {
  state.moduleFilter = event.target.value || 'all';
  renderModulePicker();
}

function handleModuleSearch(event) {
  state.moduleSearch = event.target.value || '';
  renderModulePicker();
}

function handleConfiguratorEscape(event) {
  if (event.key === 'Escape') {
    closeModuleConfigurator();
  }
}

function handleConfiguratorBackdrop(event) {
  if (event.target === el.moduleConfigOverlay) {
    closeModuleConfigurator();
  }
}

function triggerModuleConfigurator(auto = false) {
  if (!state.selectedModuleId) {
    if (!auto) {
      showError(el.assignmentError, 'Selecciona un mòdul abans de configurar la prova.');
    }
    return;
  }

  const module = state.moduleIndex.get(state.selectedModuleId);
  if (!module || !el.moduleConfigOverlay || !el.moduleConfigFrame) return;

  const query = new URLSearchParams({ module: state.selectedModuleId, assign: '1' });
  const frameUrl = `../index.html?${query.toString()}`;
  el.moduleConfigFrame.src = frameUrl;
  if (el.moduleConfigTitle) {
    el.moduleConfigTitle.textContent = `Configura: ${module.name}`;
  }

  el.moduleConfigOverlay.classList.remove('hidden');
  document.addEventListener('keydown', handleConfiguratorEscape);
  el.moduleConfigOverlay.addEventListener('click', handleConfiguratorBackdrop);
  setTimeout(() => {
    if (el.closeConfigOverlay) {
      el.closeConfigOverlay.focus?.();
    }
  }, 150);
}

function openModuleConfigurator(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  triggerModuleConfigurator(false);
}

function closeModuleConfigurator() {
  if (!el.moduleConfigOverlay) return;
  el.moduleConfigOverlay.classList.add('hidden');
  document.removeEventListener('keydown', handleConfiguratorEscape);
  el.moduleConfigOverlay.removeEventListener('click', handleConfiguratorBackdrop);
  if (el.moduleConfigFrame) {
    el.moduleConfigFrame.src = 'about:blank';
  }
}

function handleLaunchEscape(event) {
  if (event.key === 'Escape') {
    closeAssignmentLaunchOverlay();
  }
}

function handleLaunchBackdrop(event) {
  if (event.target === el.assignmentLaunchOverlay) {
    closeAssignmentLaunchOverlay();
  }
}

function openAssignmentLaunchOverlay(assignmentId, moduleName) {
  if (!el.assignmentLaunchOverlay || !el.assignmentLaunchFrame) {
    window.location.href = `../index.html?assignment=${encodeURIComponent(assignmentId)}`;
    return;
  }

  const query = new URLSearchParams({ assignment: assignmentId });
  el.assignmentLaunchFrame.src = `../index.html?${query.toString()}`;
  if (el.assignmentLaunchTitle) {
    el.assignmentLaunchTitle.textContent = moduleName || 'Prova FocusQuiz';
  }

  el.assignmentLaunchOverlay.classList.remove('hidden');
  document.addEventListener('keydown', handleLaunchEscape);
  setTimeout(() => {
    if (el.closeLaunchOverlay) {
      el.closeLaunchOverlay.focus?.();
    }
  }, 150);
}

function closeAssignmentLaunchOverlay() {
  if (!el.assignmentLaunchOverlay) return;
  el.assignmentLaunchOverlay.classList.add('hidden');
  document.removeEventListener('keydown', handleLaunchEscape);
  if (el.assignmentLaunchFrame) {
    el.assignmentLaunchFrame.src = 'about:blank';
  }
}

function handleConfiguratorMessage(event) {
  if (!event || !event.data || typeof event.data !== 'object') return;
  if (event.data.type !== 'focusquiz:assignment-config') return;

  const sameOrigin = !event.origin || event.origin === 'null' || event.origin === window.location.origin;
  if (!sameOrigin) return;

  const moduleId = event.data.moduleId;
  const config = event.data.config;
  if (!moduleId || !config) return;

  const summary = event.data.summary || null;
  const module = state.moduleIndex.get(moduleId);

  state.selectedModuleId = moduleId;
  state.moduleConfigBundle = {
    moduleId,
    moduleName: event.data.moduleName || module?.name || moduleId,
    config: JSON.parse(JSON.stringify(config)),
    summary: summary ? JSON.parse(JSON.stringify(summary)) : null,
  };

  renderModulePicker();
  updateModuleSelectionUI();
  closeModuleConfigurator();

  resetAlerts();
  showSuccess(el.assignmentFeedback, 'Prova configurada. Revisa els alumnes i prem «Assigna la prova».');
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
      <input type="checkbox" value="${student.id}" />
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
    const moduleTag = module ? `<span class="portal-module-tag">${escapeHTML(getCategoryLabel(module.category))}</span>` : '';
    const moduleLink = module ? `../index.html?module=${encodeURIComponent(module.id)}` : '';
    const moduleConfig = assignment.module_config || {};
    const summaryNormalized = normalizeSummary(moduleConfig.summary, module);
    const summaryHeadline = summaryNormalized.headline
      ? `<p class="portal-muted" style="margin-top:0.35rem">${escapeHTML(summaryNormalized.headline)}</p>`
      : '';
    const summaryBadges = summaryBadgesHTML(summaryNormalized);
    const summaryBadgesHtml = summaryBadges ? `<div class="portal-summary-badges">${summaryBadges}</div>` : '';
    const summaryDetails = summaryDetailsHTML(summaryNormalized);
    const summaryDetailsHtml = summaryDetails
      ? `<ul class="portal-meta-list portal-muted">${summaryDetails}</ul>`
      : '';
    const fallbackDescriptionHtml = `<p class="portal-muted" style="margin-top:0.35rem">${formatDescription(assignment.description || module?.desc || 'Sense descripció')}</p>`;
    const summaryBlock = summaryHeadline || summaryBadgesHtml || summaryDetailsHtml
      ? `${summaryHeadline}${summaryBadgesHtml}${summaryDetailsHtml}`
      : fallbackDescriptionHtml;
    const noteHtml = moduleConfig.note
      ? `<p class="portal-muted" style="margin-top:0.35rem"><strong>Nota per a l'alumnat:</strong> ${escapeHTML(moduleConfig.note)}</p>`
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
    if (moduleConfig.config) {
      actions.push(`
        <button class="btn-primary portal-launch-assignment" type="button" data-assignment="${assignmentId}" data-launch-origin="teacher">
          Previsualitza la prova
        </button>
      `);
    }
    if (moduleLink) {
      actions.push(`<a class="btn-secondary" href="${moduleLink}" target="_blank" rel="noopener">Obre el mòdul</a>`);
    }
    actions.push(`<button class="btn-ghost portal-delete-assignment" type="button" data-assignment-delete="${assignmentId}">🗑️ Elimina</button>`);

    item.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:0.5rem;">
        <h4 style="margin:0;">${moduleName}</h4>
        ${moduleTag}
      </div>
      ${summaryBlock}
      ${noteHtml}
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
    const moduleConfig = assignment.module_config || {};
    const summaryNormalized = normalizeSummary(moduleConfig.summary, module);
    const summaryHeadline = summaryNormalized.headline
      ? `<p class="portal-muted" style="margin-top:0.35rem">${escapeHTML(summaryNormalized.headline)}</p>`
      : '';
    const summaryBadges = summaryBadgesHTML(summaryNormalized);
    const summaryBadgesHtml = summaryBadges ? `<div class="portal-summary-badges">${summaryBadges}</div>` : '';
    const summaryDetails = summaryDetailsHTML(summaryNormalized);
    const summaryDetailsHtml = summaryDetails
      ? `<ul class="portal-meta-list portal-muted">${summaryDetails}</ul>`
      : '';
    const fallbackDescriptionHtml = `<p class="portal-muted" style="margin-top:0.35rem">${formatDescription(assignment.description || module?.desc || 'Sense descripció')}</p>`;
    const summaryBlock = summaryHeadline || summaryBadgesHtml || summaryDetailsHtml
      ? `${summaryHeadline}${summaryBadgesHtml}${summaryDetailsHtml}`
      : fallbackDescriptionHtml;
    const noteHtml = moduleConfig.note
      ? `<p class="portal-muted" style="margin-top:0.35rem"><strong>Nota del docent:</strong> ${escapeHTML(moduleConfig.note)}</p>`
      : '';
    const canLaunch = moduleConfig.config
      ? `<button class="btn-primary portal-launch-assignment" type="button" data-assignment="${assignmentId}" data-launch-origin="student">Fer l'examen ara</button>`
      : '';
    const launchActions = canLaunch ? `<div class="portal-assignment-actions">${canLaunch}</div>` : '';
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
      ${summaryBlock}
      ${noteHtml}
      <p class="portal-muted" style="margin-top:0.35rem">Data límit: <strong>${escapeHTML(dueDate)}</strong></p>
      ${launchActions}
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
      module_config,
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

  state.teacherAssignments = Array.isArray(data) ? data : [];
  renderTeacherAssignments(state.teacherAssignments);
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
        module_config,
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

  state.studentAssignments = Array.isArray(data) ? data : [];
  renderStudentAssignments(state.studentAssignments);
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
  const moduleId = state.selectedModuleId;
  const configBundle = state.moduleConfigBundle;

  const selectedStudents = Array.from(el.studentChecklist?.querySelectorAll('input[type="checkbox"]:checked') || [])
    .map((input) => input.value);

  if (!moduleId) {
    showError(el.assignmentError, 'Selecciona un mòdul per crear la tasca.');
    return;
  }

  if (!configBundle || !configBundle.config) {
    showError(el.assignmentError, 'Configura la prova abans d\'assignar-la.');
    return;
  }

  if (!selectedStudents.length) {
    showError(el.assignmentError, 'Selecciona com a mínim un alumne per assignar la prova.');
    return;
  }

  const module = state.moduleIndex.get(moduleId);
  if (!module) {
    showError(el.assignmentError, 'El mòdul seleccionat no és vàlid.');
    return;
  }

  const summary = configBundle.summary || null;
  const title = buildAssignmentTitle(module, summary);
  const description = buildAssignmentDescription(module, summary, note);
  const moduleConfig = {
    version: 1,
    module: moduleId,
    config: JSON.parse(JSON.stringify(configBundle.config)),
    summary: summary ? JSON.parse(JSON.stringify(summary)) : null,
    note: note || null,
  };

  const { data: insertedAssignments, error } = await state.supabase
    .from('assignments')
    .insert({
      title,
      description,
      due_date: dueDate,
      created_by: state.profile.id,
      module_id: moduleId,
      module_config: moduleConfig,
    })
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

  const studentCount = selectedStudents.length;
  const studentLabel = studentCount === 1 ? '1 alumne' : `${studentCount} alumnes`;
  const moduleLabel = module?.name || 'Prova FocusQuiz';
  showSuccess(el.assignmentFeedback, `Prova «${moduleLabel}» assignada a ${studentLabel}.`);

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
  const launch = event.target.closest('.portal-launch-assignment');
  if (launch) {
    await handleAssignmentLaunch(event);
    return;
  }

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

async function handleAssignmentLaunch(event) {
  const button = event.target.closest('.portal-launch-assignment');
  if (!button) return;
  event.preventDefault();

  const assignmentId = button.dataset.assignment;
  if (!assignmentId) return;

  const origin = button.dataset.launchOrigin || 'student';

  let moduleConfig = null;
  let moduleId = null;
  let moduleName = null;
  let assigneeRow = null;

  if (origin === 'teacher') {
    const assignments = Array.isArray(state.teacherAssignments) ? state.teacherAssignments : [];
    const assignment = assignments.find((row) => row.id === assignmentId);
    if (!assignment) {
      alert('No s\'ha trobat la configuració d\'aquesta tasca.');
      return;
    }
    moduleConfig = assignment.module_config || {};
    moduleId = moduleConfig.module || assignment.module_id;
    const module = moduleId ? state.moduleIndex.get(moduleId) : null;
    moduleName = module?.name || assignment.title || 'Prova FocusQuiz';
  } else {
    const rows = Array.isArray(state.studentAssignments) ? state.studentAssignments : [];
    const entry = rows.find((row) => row.assignment?.id === assignmentId);
    if (!entry || !entry.assignment) {
      alert('No s\'ha trobat la configuració d\'aquesta tasca.');
      return;
    }
    moduleConfig = entry.assignment.module_config || {};
    moduleId = moduleConfig.module || entry.assignment.module_id;
    const module = moduleId ? state.moduleIndex.get(moduleId) : null;
    moduleName = module?.name || entry.assignment.title || 'Prova FocusQuiz';
    assigneeRow = entry;
  }

  const config = moduleConfig?.config;
  if (!moduleId || !config) {
    alert('La prova seleccionada no té configuració disponible.');
    return;
  }

  const payload = {
    module: moduleId,
    config,
    summary: moduleConfig.summary || null,
  };
  if (moduleConfig.note) {
    payload.note = moduleConfig.note;
  }

  const serialized = JSON.stringify(payload);
  const storageKey = `${ASSIGNMENT_STORAGE_PREFIX}${assignmentId}`;
  try {
    sessionStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.warn('No s\'ha pogut preparar la prova assignada', error);
    alert('No s\'ha pogut preparar la prova. Revisa la configuració del navegador.');
    return;
  }

  try {
    localStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.warn('No s\'ha pogut emmagatzemar la configuració a localStorage', error);
  }

  button.blur?.();

  if (origin !== 'teacher' && state.supabase && assigneeRow?.id) {
    try {
      await state.supabase
        .from('assignment_assignees')
        .update({ status: 'in_progress' })
        .eq('id', assigneeRow.id);
      await loadStudentAssignments();
    } catch (error) {
      console.warn('No s\'ha pogut actualitzar l\'estat de la tasca', error);
    }
  }

  openAssignmentLaunchOverlay(assignmentId, moduleName);
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
  if (el.configureModuleBtn) el.configureModuleBtn.addEventListener('click', openModuleConfigurator);
  if (el.clearModuleBtn) el.clearModuleBtn.addEventListener('click', resetModulePicker);
  if (el.closeConfigOverlay) el.closeConfigOverlay.addEventListener('click', closeModuleConfigurator);
  if (el.studentAssignmentList) el.studentAssignmentList.addEventListener('click', handleAssignmentLaunch);
  if (el.assignmentLaunchOverlay) el.assignmentLaunchOverlay.addEventListener('click', handleLaunchBackdrop);
  if (el.closeLaunchOverlay) el.closeLaunchOverlay.addEventListener('click', closeAssignmentLaunchOverlay);
  document.addEventListener('change', handleStatusChange);
  document.addEventListener('submit', handleSubmission, true);
  window.addEventListener('message', handleConfiguratorMessage);
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
  updateModuleSelectionUI();

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
