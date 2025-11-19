// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key


const supabaseUrl ='https://xtaldzoqfslsopwnvywv.supabase.co';
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YWxkem9xZnNsc29wd252eXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjUzODksImV4cCI6MjA3ODgwMTM4OX0.fYk9G81USVQ7EWAH6yIa-LvNuROboFNeJzO4rhzroxY';

// FIX: Removed the check for placeholder credentials as it was causing a static analysis error.
// The check compared constants, and since the credentials are now filled in, it was always false and thus obsolete.

export const supabase = createClient(supabaseUrl, supabaseKey);