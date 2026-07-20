let databaseAnime = [];

async function loadAnimeFromSupabase() {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = `<p style="grid-column:span 3;text-align:center;color:var(--text-s);font-size:0.85rem;padding:20px 0;">Memuat anime dari Supabase...</p>`;
    }

    try {
        const { data, error } = await dbSupabase
            .from('anime')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        databaseAnime = data || [];
        localStorage.setItem('lukon_db', JSON.stringify(databaseAnime));

        renderAnime(databaseAnime);
    } catch (err) {
        console.error("Gagal memuat data dari Supabase:", err);
        if (container) {
            container.innerHTML = `<p style="grid-column:span 3;text-align:center;color:var(--text-s);font-size:0.85rem;padding:20px 0;">Belum ada anime/Gagal memuat data.</p>`;
        }
    }
}

function renderAnime(list) {
    const container = document.getElementById('container');
    if (!container) return;
    container.innerHTML = list.length ? "" : `<p style="grid-column:span 3;text-align:center;color:var(--text-s);font-size:0.85rem;padding:20px 0;">Belum ada anime tersedia.</p>`;
    
    list.forEach(a => {
        container.innerHTML += `
            <div class="card" onclick="bukaDetail('${a.id}')">
                <div class="thumb-box">
                    <img src="${a.thumbnail}" alt="${a.judul}">
                    <span class="rate">★ ${a.rating || '4.8'}</span>
                </div>
                <p class="card-title">${a.judul}</p>
            </div>`;
    });
}

function filterSemua() {
    const keyword = document.getElementById('search').value.toLowerCase();
    const hasil = databaseAnime.filter(a => a.judul.toLowerCase().includes(keyword));
    renderAnime(hasil);
}

function gantiGenre(genre, btn) {
    document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (genre === 'all') {
        renderAnime(databaseAnime);
    } else {
        renderAnime(databaseAnime.filter(a => (a.genre || '').toLowerCase() === genre));
    }
}

function bukaDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadAnimeFromSupabase);
