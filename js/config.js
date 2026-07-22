// js/config.js

// Konfigurasi Supabase Lukon Play
const SUPABASE_URL = "https://vecatfociqytqeilggfb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_a9Lguh5-hL1KthRZGE492Q_yyVh6C9z";

// Inisialisasi Client Supabase SDK
if (typeof window.supabase !== 'undefined') {
    const { createClient } = window.supabase;
    window.dbSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase SDK belum dimuat di HTML!");
}
