// import { createClient } from '@supabase/supabase-api'
import { createClient } from '@supabase/supabase-js'; // '-api' emas, '-js' bo'lishi shart
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// import { createClient } from '@supabase/supabase-js';

// // URL'ni konsoldagi xatodan oldim, Anon Keyni esa Supabase Dashboard-dan oling
// const supabaseUrl = 'https://mrovfzwutdtqbrnntgjw.supabase.co';
// const supabaseAnonKey = 'BU_YERGA_SUPABASE_DASHBOARD_DAGI_ANON_KEYNI_QOYING';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);