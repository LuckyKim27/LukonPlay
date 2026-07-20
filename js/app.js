let databaseAnime = [];

async function loadAnimeFromSupabase() {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = `<p style="grid-column:span 3;text-align:center;color:var(--text-s);font-size:0.85rem;padding:20px 0;">Memuat anime dari Supabase...</p>`;
    }

    try {
        // Ambil data dari tabel 'anime'
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
            container.innerHTML = `<p style="grid-column:span 3;text-align:center;color:var(--text-s);font-size:0.85rem;padding:20px 0;">Gagal memuat data (${err.message}).</p>`;
        }
    }
}

function renderAnime(list) {
    const container = document.getElementById('container');
    if (!container) return;
    
    container.innerHTML = list.length ? "" : `<p style="grid-column:span 3;text-align:center;color:var(--text-s);font-size:0.85rem;padding:20px 0;">Belum ada anime tersedia.</p>`;
    
    list.forEach(a => {
        // Menggunakan youtube_id sebagai identifier pengganti id
        const animeId = a.youtube_id || a.id; 
        
        container.innerHTML += `
            <div class="card" onclick="bukaDetail('${animeId}')">
                <div class="thumb-box">
                    <img src="${a.thumbnail}" alt="${a.judul}">
                    <span class="rate">★ ${a.rating || '4.8'}</span>
                </div>
                <p class="card-title">${a.judul}</p>
            </div>`;
    });
}

function filterSemua() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    const keyword = searchInput.value.toLowerCase();
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
    // Membuka halaman detail dengan query parameter id (youtube_id)
    window.location.href = `detail.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadAnimeFromSupabase);
