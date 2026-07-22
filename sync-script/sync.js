const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Error: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diatur di environment variable!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fungsi Delay agar tidak terkena Rate Limit Jikan API (MyAnimeList)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndSyncAnime() {
    console.log("🚀 Memulai sinkronisasi & pembaruan otomatis dari MyAnimeList...");

    try {
        // Mengambil Top Anime dari MyAnimeList API (Jikan v4)
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=25');
        const result = await response.json();
        const animeList = result.data || [];

        let totalProcessed = 0;
        let totalError = 0;

        for (const anime of animeList) {
            const malId = anime.mal_id;
            const judul = anime.title_english || anime.title;
            const deskripsi = anime.synopsis || "Tidak ada deskripsi.";
            const thumbnail = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
            const rating = anime.score ? anime.score.toString() : "4.8";
            
            // Format Genre & Studio
            const genres = (anime.genres || []).map(g => g.name).join(', ') || 'Anime';
            const studio = (anime.studios && anime.studios[0]) ? anime.studios[0].name : 'Resmi';

            // Extract Trailer / Link YouTube
            const ytYoutubeId = anime.trailer?.youtube_id || "v9H2S82O8A4"; // Fallback default
            const ytUrl = anime.trailer?.url || `https://www.youtube.com/watch?v=${ytYoutubeId}`;
            const banner = anime.trailer?.images?.maximum_image_url || thumbnail;

            // Gunakan .upsert() agar otomatis MEMPERBARUI jika mal_id sudah ada,
            // atau MENAMBAH BARU jika mal_id belum ada.
            const { error } = await supabase
                .from('anime')
                .upsert([
                    {
                        mal_id: malId,
                        youtube_id: ytYoutubeId,
                        judul: judul,
                        deskripsi: deskripsi,
                        thumbnail: thumbnail,
                        banner: banner,
                        genre: genres,
                        studio: studio,
                        rating: rating,
                        youtube: ytUrl
                    }
                ], { onConflict: 'mal_id' });

            if (!error) {
                console.log(`✅ [Berhasil Sync/Update] ${judul}`);
                totalProcessed++;
            } else {
                console.error(`❌ Gagal update ${judul}:`, error.message);
                totalError++;
            }

            // Jeda 500ms antar request agar aman dari limit API
            await delay(500);
        }

        console.log(`\n🎉 Proses Selesai! Total Anime Terproses/Diperbarui: ${totalProcessed}, Error: ${totalError}`);

    } catch (err) {
        console.error("❌ Error utama saat sinkronisasi:", err.message);
    }
}

fetchAndSyncAnime();
