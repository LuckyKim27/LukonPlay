const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');
const path = require('path');
const fs = require('fs');

const parser = new Parser();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Kredensial SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let CHANNELS = [
    { name: 'Muse Indonesia', rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAnA8H4A8yR4deGvhEtr2Bw' },
    { name: 'Ani-One Asia', rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0wNSTMWIL3qaorLx0jie6A' }
];

const channelsPath = path.join(__dirname, '../data/channels.json');
if (fs.existsSync(channelsPath)) {
    try {
        CHANNELS = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
    } catch (e) {
        console.warn("Gagal membaca data/channels.json, menggunakan fallback.");
    }
}

async function syncYouTubeToSupabase() {
    console.log("Memulai sinkronisasi otomatis YouTube -> Supabase...");

    for (const channel of CHANNELS) {
        try {
            const feed = await parser.parseURL(channel.rssUrl);

            for (const item of feed.items) {
                const videoId = item.id.replace('yt:video:', '');
                const title = item.title;
                const description = item.contentSnippet || `Nonton anime resmi ${title} di ${channel.name}.`;

                const { data: existing } = await supabase
                    .from('anime')
                    .select('youtube_id')
                    .eq('youtube_id', videoId)
                    .maybeSingle();

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
