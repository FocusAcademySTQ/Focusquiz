import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveSupabaseConfig } from '../portal/supabase-config.js';

let cachedConfig = resolveSupabaseConfig();
const state = {
  client: null,
};

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
    if (state.client) {
      state.client = null;
    }
  }
  return cachedConfig;
}

function getClient() {
  const config = getActiveSupabaseConfig();
  if (!config) return null;
  if (state.client) return state.client;
  try {
    state.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return state.client;
  } catch (error) {
    console.error('FocusSupabase: no s\'ha pogut crear el client.', error);
    state.client = null;
    return null;
  }
}

function normalizeNumber(value) {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function safeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

async function submitResult(entry, session = {}) {
  if (!getActiveSupabaseConfig()) {
    return { ok: false, reason: 'disabled' };
  }
  const client = getClient();
  if (!client) {
    return { ok: false, reason: 'client-error' };
  }

  const assignmentId = safeString(session.assignmentId);
  const classId = safeString(session.classId);
  const classCode = safeString(session.classCode);
  const studentName = safeString(session.studentName || entry?.name);

  if (!assignmentId || !classId || !classCode || !studentName) {
    return { ok: false, reason: 'missing-context' };
  }

  const score = normalizeNumber(entry?.score);
  const correct = normalizeNumber(entry?.correct);
  const count = normalizeNumber(entry?.count);
  const timeSpent = normalizeNumber(entry?.time_spent);

  let details = null;
  try {
    details = {
      entry,
      meta: {
        module: session.module || entry?.module || null,
        moduleTitle: session.moduleTitle || null,
        assignmentLabel: session.assignmentLabel || null,
      },
    };
  } catch (error) {
    console.warn('FocusSupabase: no s\'ha pogut preparar el detall del resultat.', error);
  }

  const status = correct !== null && count !== null && correct >= count ? 'completed' : 'submitted';

  const payload = {
    assignment_id: assignmentId,
    class_id: classId,
    class_code: classCode,
    student_name: studentName,
    score,
    correct,
    count,
    time_spent: timeSpent,
    status,
    details,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await client
      .from('submissions')
      .upsert(payload, { onConflict: 'assignment_id,student_name' });

    if (error) throw error;

    return { ok: true };
  } catch (error) {
    console.error('FocusSupabase: error en enviar el resultat.', error);
    return { ok: false, error };
  }
}

const FocusSupabase = {
  submitResult,
};

if (typeof window !== 'undefined') {
  window.FocusSupabase = FocusSupabase;
  if (!getActiveSupabaseConfig()) {
    console.info('FocusSupabase: Supabase no està configurat. La sincronització quedarà desactivada.');
  }
}

export default FocusSupabase;
