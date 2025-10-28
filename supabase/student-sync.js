import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../portal/supabase-config.js';

const state = {
  client: null,
  session: null,
  profile: null,
  initializing: null,
};

const hasConfig = typeof SUPABASE_URL === 'string' && SUPABASE_URL && typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY;

function normalizeAssignmentId(value) {
  if (!value) return null;
  const str = String(value).trim();
  return str || null;
}

function formatDuration(seconds) {
  const raw = Number(seconds);
  if (!Number.isFinite(raw) || raw <= 0) return '';
  const total = Math.floor(raw);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes && secs) return `${minutes} min ${secs}s`;
  if (minutes) return `${minutes} min`;
  return `${secs}s`;
}

function buildAutomaticContent(entry = {}, quizSession = {}) {
  const moduleName = quizSession.assignmentTitle
    || quizSession.assignmentLabel
    || quizSession.moduleName
    || entry.module
    || '';

  const parts = [];
  const correct = Number(entry.correct);
  const total = Number(entry.count);
  if (Number.isFinite(correct) && Number.isFinite(total) && total > 0) {
    parts.push(`${correct}/${total} correctes`);
  }

  const rawScore = Number(entry.score);
  if (Number.isFinite(rawScore)) {
    const grade = Number.isInteger(rawScore) ? rawScore : Number(rawScore.toFixed(1));
    parts.push(`${grade}%`);
  }

  const duration = formatDuration(entry.time_spent);
  if (duration) {
    parts.push(`temps ${duration}`);
  }

  const header = moduleName ? `Entrega automàtica FocusQuiz — ${moduleName}.` : 'Entrega automàtica FocusQuiz.';
  const details = parts.length ? ` Resultat: ${parts.join(' · ')}.` : '';
  const levelLabel = quizSession.levelLabel || entry.levelLabel;
  const level = levelLabel ? ` Nivell: ${levelLabel}.` : '';
  return `${header}${details}${level}`.trim();
}

async function fetchProfile() {
  if (!state.client || !state.session?.user) return null;
  const { data, error } = await state.client
    .from('profiles')
    .select('id, full_name, role, email')
    .eq('id', state.session.user.id)
    .maybeSingle();

  if (error) throw error;
  state.profile = data || null;
  return state.profile;
}

async function ensureClient() {
  if (!hasConfig) return null;
  if (state.client) return state.client;
  if (state.initializing) return state.initializing;

  state.initializing = (async () => {
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      state.client = client;
      const { data } = await client.auth.getSession();
      state.session = data?.session || null;
      if (state.session) {
        try {
          await fetchProfile();
        } catch (error) {
          console.warn('No s\'ha pogut obtenir el perfil de Supabase.', error);
        }
      }
      client.auth.onAuthStateChange((_event, session) => {
        state.session = session;
        if (!session) {
          state.profile = null;
        } else {
          fetchProfile().catch((error) => {
            console.warn('No s\'ha pogut refrescar el perfil de Supabase.', error);
          });
        }
      });
      return client;
    } catch (error) {
      state.client = null;
      state.session = null;
      state.profile = null;
      throw error;
    } finally {
      state.initializing = null;
    }
  })();

  return state.initializing.catch((error) => {
    console.warn('No s\'ha pogut inicialitzar Supabase.', error);
    return null;
  });
}

const FocusSupabase = {
  async init() {
    return ensureClient();
  },
  getClient() {
    return state.client;
  },
  async getProfile() {
    await ensureClient();
    if (!state.client || !state.session?.user) return null;
    if (state.profile) return state.profile;
    try {
      return await fetchProfile();
    } catch (error) {
      console.warn('No s\'ha pogut carregar el perfil de Supabase.', error);
      return null;
    }
  },
  async submitResult(entry = {}, quizSession = {}) {
    try {
      const client = await ensureClient();
      if (!client) return { skipped: 'supabase-disabled' };

      const sessionUser = state.session?.user;
      if (!sessionUser) return { skipped: 'no-session' };

      const profile = await FocusSupabase.getProfile();
      if (!profile) return { skipped: 'no-profile' };

      const assignmentId = normalizeAssignmentId(quizSession.assignmentId || entry.assignmentId);
      if (!assignmentId) return { skipped: 'no-assignment' };

      const rawScore = Number(entry.score);
      const grade = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, rawScore)) : null;
      const timestamp = new Date().toISOString();
      const content = buildAutomaticContent(entry, quizSession);

      const { data: existing, error: existingError } = await client
        .from('submissions')
        .select('id, content')
        .eq('assignment_id', assignmentId)
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (existingError) {
        console.warn('No s\'ha pogut consultar la submissió automàtica.', existingError);
        return { error: existingError };
      }

      if (existing) {
        const updatePayload = { grade, submitted_at: timestamp };
        if (!existing.content && content) {
          updatePayload.content = content;
        }
        const { error: updateError } = await client
          .from('submissions')
          .update(updatePayload)
          .eq('id', existing.id);
        if (updateError) {
          console.warn('No s\'ha pogut actualitzar la submissió automàtica.', updateError);
          return { error: updateError };
        }
      } else {
        const insertPayload = {
          assignment_id: assignmentId,
          profile_id: profile.id,
          grade,
          submitted_at: timestamp,
        };
        if (content) insertPayload.content = content;
        const { error: insertError } = await client
          .from('submissions')
          .insert(insertPayload);
        if (insertError) {
          console.warn('No s\'ha pogut crear la submissió automàtica.', insertError);
          return { error: insertError };
        }
      }

      const { error: statusError } = await client
        .from('assignment_assignees')
        .update({ status: 'submitted' })
        .eq('assignment_id', assignmentId)
        .eq('profile_id', profile.id);

      if (statusError) {
        console.warn('No s\'ha pogut actualitzar l\'estat de l\'assignació.', statusError);
        return { error: statusError, partial: true };
      }

      return { success: true };
    } catch (error) {
      console.warn('Error inesperat sincronitzant amb Supabase.', error);
      return { error };
    }
  },
};

if (typeof window !== 'undefined') {
  window.FocusSupabase = FocusSupabase;

  const startInit = () => {
    FocusSupabase.init().catch((error) => {
      console.warn('No s\'ha pogut preparar la connexió amb Supabase.', error);
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startInit();
  } else {
    document.addEventListener('DOMContentLoaded', startInit, { once: true });
  }
}
