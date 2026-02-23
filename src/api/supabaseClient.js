import { createClient } from '@supabase/supabase-js';

// URL va Keyni loyihang turiga qarab (Vite yoki CRA) avtomatik aniqlaymiz
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://mrovfzwutdtqbrnntgjw.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || 'BU_YERGA_O_ZINGNI_ANON_KEYINGNI_QOY';

// 1. ASOSIY CLIENT: Jadvaldan ma'lumot o'qish, tahrirlash va o'chirish uchun
// Bu sening joriy login sessiyangni saqlaydi.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. ADMIN (BYPASS) CLIENT: Faqat yangi foydalanuvchi qo'shish uchun
// persistSession: false — bu eng muhim joyi! 
// Yangi odam qo'shilganda sening login sessiyangni ustidan yozib yubormaydi.
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});