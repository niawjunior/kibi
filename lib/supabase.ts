import { createServerClient } from "@supabase/ssr";

// These are mock values - in a real application, use environment variables
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://your-supabase-url.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || "your-supabase-service-role-key";

export const supabase = createServerClient(supabaseUrl, supabaseKey, {
  cookies: {
    getAll() {
      return [];
    },
    setAll() {
      // Service client doesn't need cookies
    },
  },
});

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
  badge_url?: string;
}
