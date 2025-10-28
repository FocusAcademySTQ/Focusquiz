import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../portal/supabase-config.js';

const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const state = {
  client: null,
  initPromise: null,
  profile: null,
  profilePromise: null,
};

function buildClient() {
  if (!CONFIGURED) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error('FocusSupabase: no s\'ha pogut crear el client de Supabase.', error);
    return null;
  }
}

async function init() {
  if (state.client) return state.client;
  if (!CONFIGURED) {
    return null;
  }
  if (state.initPromise) return state.initPromise;
  state.initPromise = (async () => {
    const client = buildClient();
    if (!client) {
      state.client = null;
      return null;
    }
    state.client = client;
    return state.client;
  })();
  try {
    return await state.initPromise;
  } finally {
    state.initPromise = null;
  }
}

async function getProfile() {
  const client = await init();
  if (!client) return null;
  if (state.profile) return state.profile;
  if (state.profilePromise) return state.profilePromise;

  state.profilePromise = (async () => {
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = sessionData?.session?.user?.id;
      if (!userId) return null;
      if (state.profile && state.profile.id === userId) {
        return state.profile;
      }

      const { data, error } = await client
        .from('profiles')
        .select('id, full_name, role, email')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      state.profile = data || null;
      return state.profile;
    } catch (error) {
      console.warn('FocusSupabase: no s\'ha pogut obtenir el perfil.', error);
      return null;
    } finally {
      state.profilePromise = null;
    }
  })();

  return state.profilePromise;
}

async function submitResult(entry, session = {}) {
  if (!session || !session.assignmentId) {
    return { ok: false, reason: 'missing-assignment' };
  }
  const client = await init();
  if (!client) {
    return { ok: false, reason: 'disabled' };
  }

  const profile = await getProfile();
  if (!profile) {
    return { ok: false, reason: 'no-profile' };
  }

  const status = entry && entry.count && entry.correct >= entry.count ? 'completed' : 'submitted';
  const payloadMeta = {
    assignmentId: session.assignmentId,
    assignmentLabel: session.assignmentLabel || null,
    assignmentTitle: session.assignmentTitle || null,
    module: session.module || session.moduleName || entry?.module || null,
    tags: Array.isArray(session.assignmentTags) ? session.assignmentTags : [],
  };

  let content = null;
  try {
    content = JSON.stringify({ entry, meta: payloadMeta });
  } catch (error) {
    console.warn('FocusSupabase: no s\'ha pogut serialitzar el resultat, s\'enviarà buit.', error);
  }

  try {
    const { error: upsertError } = await client
      .from('submissions')
      .upsert(
        {
          assignment_id: session.assignmentId,
          profile_id: profile.id,
          submitted_at: new Date().toISOString(),
          content,
        },
        { onConflict: 'assignment_id,profile_id' }
      );

    if (upsertError) throw upsertError;

    const { error: statusError } = await client
      .from('assignment_assignees')
      .update({ status })
      .eq('assignment_id', session.assignmentId)
      .eq('profile_id', profile.id);

    if (statusError) throw statusError;

    return { ok: true };
  } catch (error) {
    console.error('FocusSupabase: error en sincronitzar el resultat.', error);
    return { ok: false, error };
  }
}

const FocusSupabase = {
  init,
  getProfile,
  submitResult,
};

if (typeof window !== 'undefined') {
  window.FocusSupabase = FocusSupabase;
  if (!CONFIGURED) {
    console.info('FocusSupabase: Supabase no està configurat. La sincronització quedarà desactivada.');
  }
}

export default FocusSupabase;
