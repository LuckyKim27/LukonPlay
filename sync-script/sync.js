const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');
const parser = new Parser();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CHANNELS = [
    { name: 'Muse Indonesia', id: 'UCAnA8H4A8yR4deGvhEtr2Bw' },
    { name: 'Ani-One Asia', id: 'UC0wNSTMWIL3qaorLx0jie6A' }
];

async function syncYouTubeToSupabase() {
    console.log("Memulai sinkronisasi otomatis YouTube -> Supabase...");

    for (const channel of CHANNELS) {
        try {
            const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
            const feed = await parser.parseURL(feedUrl);

            for (const item of feed.items) {
                const videoId = item.id.replace('yt:video:', '');
                const title = item.title;

                console.log(`[Menyimpan] ${title}`);
                
                // Kirim langsung ke tabel Anime
                const { data, error } = await supabase.from('Anime').insert([
                    {
                        judul: title,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    }
                ]);

                if (error) {
                    console.error(`Gagal Simpan ke Supabase: ${error.message}`);
                }
            }
        } catch (err) {
            console.error(`Gagal mengambil RSS dari ${channel.name}:`, err.message);
        }
    }
    console.log("Sinkronisasi otomatis selesai!");
}

syncYouTubeToSupabase();
