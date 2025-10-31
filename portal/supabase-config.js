const globalScope = typeof globalThis !== 'undefined' ? globalThis : {};
const env = typeof process !== 'undefined' && process?.env ? process.env : {};

// Edit these values if you prefer to codify the Supabase credentials here.
// They will be used when no runtime or environment configuration is provided.
const HARDCODED_SUPABASE_CONFIG = Object.freeze({
  url: 'https://aogfwqaewvkxcdgwomlo.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2Z3cWFld3ZreGNkZ3dvbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTA0NDgsImV4cCI6MjA3NjcyNjQ0OH0.sotcecah5AQeMOaji7eSIrLIFUKGbGIZI43xIiOBrFw',
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
    HARDCODED_SUPABASE_URL ||
    readEnvValue('SUPABASE_URL') ||
    '';

  const anonKey =
    readRuntimeValue('SUPABASE_ANON_KEY') ||
    HARDCODED_SUPABASE_ANON_KEY ||
    readEnvValue('SUPABASE_ANON_KEY') ||
    '';

  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

export const SUPABASE_URL = resolveSupabaseConfig().url;
export const SUPABASE_ANON_KEY = resolveSupabaseConfig().anonKey;
