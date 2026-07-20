let databaseAnime = [];

async function loadAnimeFromSupabase() {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-s); padding: 40px 0;">
                <p style="font-size: 0.9rem;">Memuat koleksi anime...</p>
            </div>`;
    }

    try {
        const { data, error } = await dbSupabase
            .from('anime')
            .select('*');

        if (error) throw error;

        databaseAnime = data || [];
        localStorage.setItem('lukon_db', JSON.stringify(databaseAnime));

        renderAnime(databaseAnime);
    } catch (err) {
        console.error("Gagal memuat data dari Supabase:", err);
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #ff5555; padding: 30px 0;">
                    <p style="font-size: 0.85rem;">Gagal memuat data (${err.message}).</p>
                    <button onclick="loadAnimeFromSupabase()" style="margin-top: 10px; background: var(--accent); color: #fff; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.8rem;">Coba Lagi</button>
                </div>`;
        }
    }
}

function renderAnime(list) {
    const container = document.getElementById('container');
    if (!container) return;
    
    if (!list || list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-s); padding: 30px 0;">
                <p style="font-size: 0.85rem;">Tidak ada anime yang ditemukan.</p>
            </div>`;
        return;
    }

    container.innerHTML = "";
    list.forEach(a => {
        const animeId = a.youtube_id || a.id; 
        
        container.innerHTML += `
            <div class="card" onclick="bukaDetail('${animeId}')">
                <div class="thumb-box">
                    <img src="${a.thumbnail}" alt="${a.judul}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400?text=No+Cover'">
                    <span class="rate">★ ${a.rating || '4.8'}</span>
                </div>
                <p class="card-title" title="${a.judul}">${a.judul}</p>
            </div>`;
    });
}

function filterSemua() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    const keyword = searchInput.value.toLowerCase().trim();
    const hasil = databaseAnime.filter(a => a.judul && a.judul.toLowerCase().includes(keyword));
    renderAnime(hasil);
}

function gantiGenre(genre, btn) {
    document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    if (genre === 'all') {
        renderAnime(databaseAnime);
    } else {
        renderAnime(databaseAnime.filter(a => (a.genre || '').toLowerCase().includes(genre.toLowerCase())));
    }
}

function bukaDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadAnimeFromSupabase);
