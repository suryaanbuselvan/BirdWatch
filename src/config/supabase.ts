import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://hkmdpenjokfyrhbskvei.supabase.co';
const supabaseAnonKey = 'sb_publishable_Dy8pTPiwDQOc7dEe2V1YLw_cNnYVIY7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
