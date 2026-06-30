const globalScope = typeof globalThis !== 'undefined' ? globalThis : {};
const env =
  typeof process !== 'undefined' && process && process.env ? process.env : {};

// Edit these values if you prefer to codify the Supabase credentials here.
// They will be used only when no runtime or environment configuration is provided.
const HARDCODED_SUPABASE_CONFIG = Object.freeze({
  url: 'https://bafbekltahqmiitmtvtf.supabase.co',
  anonKey: 'sb_publishable_FdY3Hpx7F47RdT28lbW5kw_28k9orBP',
});

const HARDCODED_SUPABASE_URL = HARDCODED_SUPABASE_CONFIG.url;
const HARDCODED_SUPABASE_ANON_KEY = HARDCODED_SUPABASE_CONFIG.anonKey;

function readRuntimeValue(key) {
  if (typeof window !== 'undefined' && window && typeof window[key] === 'string') {
    return window[key];
  }

  if (globalScope && typeof globalScope[key] === 'string') {
    return globalScope[key];
  }

  return '';
}

function readEnvValue(key) {
  if (env && typeof env[key] === 'string') {
    return env[key];
  }

  return '';
}

export function resolveSupabaseConfig() {
  const url =
    readRuntimeValue('SUPABASE_URL') ||
    readEnvValue('SUPABASE_URL') ||
    HARDCODED_SUPABASE_URL ||
    '';

  const anonKey =
    readRuntimeValue('SUPABASE_ANON_KEY') ||
    readEnvValue('SUPABASE_ANON_KEY') ||
    HARDCODED_SUPABASE_ANON_KEY ||
    '';

  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

export const SUPABASE_URL = resolveSupabaseConfig().url;
export const SUPABASE_ANON_KEY = resolveSupabaseConfig().anonKey;
