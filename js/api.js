let databaseAnime = [];

async function loadAnimeData() {
    const container = document.getElementById("container");

    container.innerHTML = "<p>Memuat anime...</p>";

    const channelId = "UCxxnxya_32jcKj4yN1_kD7A"; // Ganti dengan Channel ID Muse Indonesia
    const api = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
        const res = await fetch(api);
        const json = await res.json();

        if (json.status !== "ok") {
            throw new Error("API gagal");
        }

        databaseAnime = json.items.map(item => {
            const videoId = item.link.split("v=")[1];

            return {
                id: videoId,
                judul: item.title,
                genre: "Anime",
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                banner: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                rating: "5.0",
                sinopsis: item.description,
                episodes: [{
                    id: 1,
                    judul: item.title,
                    videoUrl: `https://www.youtube.com/embed/${videoId}`
                }]
            };
        });

        localStorage.setItem("lukon_db", JSON.stringify(databaseAnime));

        renderAnime(databaseAnime);

    } catch (e) {
        console.error(e);

        container.innerHTML = `
        <center>
            <h3>Gagal memuat anime</h3>
            <button onclick="loadAnimeData()">Coba Lagi</button>
        </center>`;
    }
}

document.addEventListener("DOMContentLoaded", loadAnimeData);