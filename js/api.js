// js/api.js

const AnimeAPI = {
    // 1. Ambil semua daftar anime dari Supabase
    async getAllAnime() {
        try {
            if (!window.dbSupabase) return [];
            const { data, error } = await window.dbSupabase
                .from('anime')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Gagal mengambil data anime dari Supabase:", err.message);
            return [];
        }
    },

    // 2. Ambil detail anime berdasarkan ID / YouTube ID
    async getAnimeById(id) {
        if (!id) return null;
        try {
            if (!window.dbSupabase) return null;
            const { data, error } = await window.dbSupabase
                .from('anime')
                .select('*')
                .or(`youtube_id.eq.${id},id.eq.${id}`)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error(`Gagal mengambil detail anime ID (${id}):`, err.message);
            return null;
        }
    }
};
