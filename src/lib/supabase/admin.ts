import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for connecting to main repo database
 * Uses the same Supabase instance as cetech-academy
 */
export function createMainRepoAdminClient() {
  // Read main repo's Supabase URL and service role from environment
  const mainRepoUrl = process.env.NEXT_PUBLIC_MAIN_REPO_SUPABASE_URL;
  const mainRepoServiceKey = process.env.MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!mainRepoUrl || !mainRepoServiceKey) {
    throw new Error('Main repo Supabase configuration is missing. ' +
      'Set NEXT_PUBLIC_MAIN_REPO_SUPABASE_URL and MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(mainRepoUrl, mainRepoServiceKey, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  });
}