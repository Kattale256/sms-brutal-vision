// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oogxlltjiojlatwrnnwk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ3hsbHRqaW9qbGF0d3JubndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTE5NzIsImV4cCI6MjA2NDAyNzk3Mn0.3zkEwpnVGYZs9BmW7Q4dArgh66AafMkbEgMJVT2cI80";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);