import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ydhvbuoslztdnornlawv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaHZidW9zbHp0ZG5vcm5sYXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTAxMjIsImV4cCI6MjA3ODk2NjEyMn0.SiM3HyN7FCLfvRZckU9-3fvA3n8QXEefjj50QjoJods";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});