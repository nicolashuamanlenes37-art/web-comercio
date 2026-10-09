import { createClient } from '@supabase/supabase-js';
import { SUPABASE } from '../config.js';

/** Cliente de Supabase, o null si la página aún no está conectada. */
export const supabase =
  SUPABASE.url && SUPABASE.key ? createClient(SUPABASE.url, SUPABASE.key) : null;

export const isConnected = Boolean(supabase);
