import { createClient } from '@supabase/supabase-js';
import { SUPABASE, hasSupabase } from '../config.js';

/** Cliente de Supabase para el panel, o null si la página aún no está conectada. */
export const supabase = hasSupabase ? createClient(SUPABASE.url, SUPABASE.key) : null;
