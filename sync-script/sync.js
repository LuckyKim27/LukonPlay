const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');
const parser = new Parser();

// Kredensial Supabase dari GitHub Secrets
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ID Channel YouTube Resmi
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
                const description = item.contentSnippet || `Nonton anime resmi ${title} di ${channel.name}.`;

                // Cek apakah video sudah ada di tabel 'anime'
                const { data: existing } = await supabase
                    .from('anime')
                    .select('youtube_id')
                    .eq('youtube_id', videoId)
                    .maybeSingle();

                // Jika belum ada, masukkan ke tabel 'anime'
                if (!existing) {
                    console.log(`[Baru Ditemukan] Menyimpan: ${title}`);
                    const { error } = await supabase.from('anime').insert([
                        {
                            youtube_id: videoId,
                            judul: title,
                            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                            banner: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                            deskripsi: description,
                            youtube: `https://www.youtube.com/watch?v=${videoId}`,
                            genre: 'Action',
                            rating: '4.8'
                        }
                    ]);

                    if (error) {
                        console.error(`Gagal insert ke Supabase:`, error.message);
                    }
                } else {
                    console.log(`[Sudah Ada] Dilewati: ${title}`);
                }
            }
        } catch (err) {
            console.error(`Gagal mengambil data dari ${channel.name}:`, err.message);
        }
    }
    console.log("Sinkronisasi otomatis selesai!");
}

syncYouTubeToSupabase();
