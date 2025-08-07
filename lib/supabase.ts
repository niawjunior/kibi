import { createClient } from '@supabase/supabase-js';

// These are mock values - in a real application, use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our user data
export interface User {
  id: string;
  ref: string;
  name: string;
  last_name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  event_id: string;
  registered: boolean;
  photo_url?: string;
}
