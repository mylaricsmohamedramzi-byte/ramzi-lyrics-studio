import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder-project.supabase.co') {
  console.warn('Supabase URL or Key is missing. Check your .env file. Using placeholder for local dev.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
