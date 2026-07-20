// Konfigurasi Supabase Lukon Play
const SUPABASE_URL = "https://vecatfociqytqeilggfb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_a9Lguh5-hL1KthRZGE492Q_yyVh6C9z";

// Inisialisasi Supabase Client
const { createClient } = supabase;
const dbSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
