// js/detail.js

async function loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    let anime = null;
    if (typeof AnimeAPI !== 'undefined') {
        anime = await AnimeAPI.getAnimeById(id);
    }

    if (!anime) {
        const localDb = JSON.parse(localStorage.getItem('lukon_db') || '[]');
        anime = localDb.find(a => (a.youtube_id || a.id) == id);
    }

    if (anime) {
        const targetId = anime.youtube_id || anime.id;
        const posterEl = document.getElementById('poster');
        const judulEl = document.getElementById('judul');
        const descEl = document.getElementById('deskripsi');
        const playBtn = document.getElementById('btnPlay');
        const epList = document.getElementById('episodeList');

        const cleanJudul = typeof cleanTitle === 'function' ? cleanTitle(anime.judul) : anime.judul;

        if (posterEl) posterEl.src = anime.thumbnail || `https://img.youtube.com/vi/${targetId}/hqdefault.jpg`;
        if (judulEl) judulEl.innerText = cleanJudul;
        if (descEl) descEl.innerText = anime.deskripsi || "Tidak ada deskripsi tersedia untuk anime ini.";

        // Cek Episode Terakhir
        const lastEp = localStorage.getItem(`last_ep_${targetId}`) || 1;
        if (playBtn) {
            playBtn.innerText = `▶ Lanjutkan Episode ${lastEp}`;
            playBtn.href = `watch.html?id=${targetId}&ep=${lastEp}`;
        }

        // Render Daftar Episode Vertikal (Episode 1 - 12)
        if (epList) {
            let epHTML = '';
            for (let i = 1; i <= 12; i++) {
                const isWatched = (i == lastEp);
                epHTML += `
                    <a href="watch.html?id=${targetId}&ep=${i}" class="ep-item ${isWatched ? 'watched' : ''}">
                        <span>Episode ${i}</span>
                        <span>${isWatched ? 'Ditonton' : '▶'}</span>
                    </a>
                `;
            }
            epList.innerHTML = epHTML;
        }

        // Simpan ke Riwayat secara otomatis
        saveToHistory(anime);
    }
}

function saveToHistory(anime) {
    let history = JSON.parse(localStorage.getItem('lukon_history') || '[]');
    const targetId = anime.youtube_id || anime.id;
    history = history.filter(item => (item.youtube_id || item.id) != targetId);
    history.unshift(anime);
    localStorage.setItem('lukon_history', JSON.stringify(history.slice(0, 20)));
}

function toggleSave() {
    const btnSave = document.getElementById('btnSave');
    if (btnSave) {
        if (btnSave.innerText.includes('Tersimpan')) {
            btnSave.innerText = '+ Simpan';
            btnSave.style.background = 'rgba(255,255,255,0.1)';
        } else {
            btnSave.innerText = '✓ Tersimpan';
            btnSave.style.background = 'var(--accent)';
        }
    }
}

document.addEventListener("DOMContentLoaded", loadDetail);