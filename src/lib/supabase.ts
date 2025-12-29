import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxhgpvkkeyguovvyqsft.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGdwdmtrZXlndW92dnlxc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzM1OTUsImV4cCI6MjA4MjAwOTU5NX0.U2s9NxGHboptK6dUFAv9HXyaVk-WICTIiDKiV9TIS7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
