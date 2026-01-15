
import { createClient } from '@supabase/supabase-js';
import type { Release } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getReleases = async (): Promise<Release[]> => {
  const { data, error } = await supabase.from('releases').select('*');
  if (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
  return data as Release[];
};
