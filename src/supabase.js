import { createClient } from '@supabase/supabase-js'

// Sem vlož své URL ze Supabase (začíná na https://...)
const supabaseUrl = 'https://ouxbdlmtbeayzqhsanhg.supabase.co'

// Sem vlož svůj anon public klíč ze Supabase (ten dlouhý text)
const supabaseKey = 'sb_publishable_D4ozyTJrkV_XWh4A-BqcnA_i2HZOfyL'

export const supabase = createClient(supabaseUrl, supabaseKey)