import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xtaldzoqfslsopwnvywv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YWxkem9xZnNsc29wd252eXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjUzODksImV4cCI6MjA3ODgwMTM4OX0.fYk9G81USVQ7EWAH6yIa-LvNuROboFNeJzO4rhzroxY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
