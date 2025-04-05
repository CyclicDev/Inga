import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get your Supabase URL and anon key from .env file or Constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 