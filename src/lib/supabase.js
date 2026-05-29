import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vheycesadeqmyarslxmk.supabase.co'
const supabaseKey = 'sb_publishable_VT5fzPqDySN0zvrykuQYmw_NwE4vmFz'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)