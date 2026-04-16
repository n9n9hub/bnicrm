import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes("請在這裡填入")) {
  console.error("請檢查您的 .env.local 檔案是否已經正確設定 Supabase URL 與 Anon Key！");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
