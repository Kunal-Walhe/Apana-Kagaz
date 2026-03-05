import { createClient } from '@supabase/supabase-js';

// Add these to your .env file in a Vite app, typically prefixed with VITE_.
// We fall back to the strings directly if env variables are not found so that it works out-of-the-box.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://omrffkrozwqerphhisvq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcmZma3JvendxZXJwaGhpc3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzI3MDMsImV4cCI6MjA4ODMwODcwM30._OZP_JgbSCXonakplQfPdqo97VRRb7-8qH7MBbXWHQI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
