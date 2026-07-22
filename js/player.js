// js/player.js

async function initPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const ep = urlParams.get('ep') || 1;

    const backLink = document.getElementById('backLink');
    if (backLink && id) {
        backLink.href = `detail.html?id=${id}`;
    }

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    // Simpan episode terakhir yang sedang ditonton
    localStorage.setItem(`last_ep_${id}`, ep);

    let anime = null;
    if (typeof AnimeAPI !== 'undefined') {
        anime = await AnimeAPI.getAnimeById(id);
    }

    if (!anime) {
        const localDb = JSON.parse(localStorage.getItem('lukon_db') || '[]');
        anime = localDb.find(a => (a.youtube_id || a.id) == id);
    }

    const targetVideoId = anime ? (anime.youtube_id || anime.id) : id;
    const playerElem = document.getElementById('player');
    const titleElem = document.getElementById('animeTitle');
    const epElem = document.getElementById('epTitle');

    if (playerElem) {
        playerElem.src = `https://www.youtube.com/embed/${targetVideoId}?autoplay=1`;
    }

    if (titleElem && anime) {
        titleElem.innerText = typeof cleanTitle === 'function' ? cleanTitle(anime.judul) : anime.judul;
    }

    if (epElem) {
        epElem.innerText = `Episode ${ep}`;
    }

    // Render Tombol Episode Horizontal
    const epContainer = document.getElementById('epHorizontal');
    if (epContainer) {
        let hHTML = '';
        for (let i = 1; i <= 12; i++) {
            const isActive = (i == ep);
            hHTML += `
                <button onclick="location.href='watch.html?id=${id}&ep=${i}'" 
                        class="pill-btn" 
                        style="${isActive ? 'background:var(--accent); font-weight:bold;' : ''}">
                    Ep ${i}
                </button>
            `;
        }
        epContainer.innerHTML = hHTML;
    }
}

function addLike() {
    const el = document.getElementById('likeCount');
    if (el) el.innerText = parseInt(el.innerText || 0) + 1;
}

function addUnlike() {
    const el = document.getElementById('unlikeCount');
    if (el) el.innerText = parseInt(el.innerText || 0) + 1;
}

document.addEventListener("DOMContentLoaded", initPlayer);
