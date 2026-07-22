// js/app.js

window.databaseAnime = [];
window.currentUser = null;

function cleanTitle(title) {
    if (!title) return "Anime Episode";
    let clean = title.replace(/《.*?》/g, '').replace(/【.*?】/g, '').trim();
    if (clean.includes('|')) {
        const parts = clean.split('|');
        const latin = parts.find(p => /[a-zA-Z]/.test(p));
        if (latin) clean = latin.trim();
    }
    clean = clean.replace(/[^\x00-\x7F]/g, "").trim();
    return clean || "Anime Title";
}

async function initApp() {
    if (typeof AnimeAPI !== 'undefined') {
        window.databaseAnime = await AnimeAPI.getAllAnime();
    }

    if (!window.databaseAnime || window.databaseAnime.length === 0) {
        window.databaseAnime = JSON.parse(localStorage.getItem('lukon_db') || '[]');
    } else {
        localStorage.setItem('lukon_db', JSON.stringify(window.databaseAnime));
    }

    await checkUserSession();
    renderHome();
}

function renderHome() {
    if (!window.databaseAnime.length) return;

    // Render Hero Banner
    const hero = window.databaseAnime[0];
    if (hero) {
        const heroBanner = document.getElementById('heroBanner');
        const heroTitle = document.getElementById('heroTitle');
        const heroPlayBtn = document.getElementById('heroPlayBtn');
        const targetId = hero.youtube_id || hero.id;

        if (heroBanner) heroBanner.style.backgroundImage = `linear-gradient(180deg, rgba(14,16,21,0.2) 0%, rgba(14,16,21,1) 100%), url('https://img.youtube.com/vi/${targetId}/hqdefault.jpg')`;
        if (heroTitle) heroTitle.innerText = cleanTitle(hero.judul);
        if (heroPlayBtn) heroPlayBtn.href = `detail.html?id=${targetId}`;
    }

    // Render Trending
    const trendContainer = document.getElementById('trendingContainer');
    if (trendContainer) {
        const trendingData = window.databaseAnime.slice(0, 8);
        trendContainer.innerHTML = trendingData.map(anime => createCardHTML(anime)).join('');
    }

    // Render Grid
    renderAnimeGrid(window.databaseAnime, 'recommendationContainer');
}

function createCardHTML(anime) {
    const targetId = anime.youtube_id || anime.id;
    const thumb = anime.thumbnail || `https://img.youtube.com/vi/${targetId}/hqdefault.jpg`;
    const judul = cleanTitle(anime.judul);
    return `
        <a href="detail.html?id=${targetId}" class="card">
            <div class="thumb-box">
                <img src="${thumb}" alt="${judul}" loading="lazy">
                <span class="rate-badge">★ ${anime.rating || '4.8'}</span>
            </div>
            <div class="card-title">${judul}</div>
        </a>
    `;
}

function renderAnimeGrid(dataList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!dataList || dataList.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-s); padding:40px 0;">Tidak ada anime dalam kategori ini.</p>`;
        return;
    }

    container.innerHTML = dataList.map(anime => createCardHTML(anime)).join('');
}

// Fungsi Pindah Genre Aktif
function filterGenre(genreKey, element) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

    if (genreKey === 'all') {
        renderAnimeGrid(window.databaseAnime, 'recommendationContainer');
        return;
    }

    const filtered = window.databaseAnime.filter(anime => {
        const genreStr = (anime.genre || '').toLowerCase();
        const titleStr = (anime.judul || '').toLowerCase();
        const key = genreKey.toLowerCase();
        return genreStr.includes(key) || titleStr.includes(key);
    });

    renderAnimeGrid(filtered, 'recommendationContainer');
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = window.databaseAnime.filter(a => 
        cleanTitle(a.judul).toLowerCase().includes(query)
    );
    renderAnimeGrid(filtered, 'recommendationContainer');
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    const searchWrapper = document.getElementById('searchWrapper');
    const homeArea = document.getElementById('homeTabArea');
    const listArea = document.getElementById('listTabArea');
    const profileArea = document.getElementById('profileTabArea');
    const listTitle = document.getElementById('listTabTitle');

    if (tabName === 'home') {
        if (searchWrapper) searchWrapper.style.display = 'block';
        if (homeArea) homeArea.style.display = 'block';
        if (listArea) listArea.style.display = 'none';
        if (profileArea) profileArea.style.display = 'none';
    } else {
        if (searchWrapper) searchWrapper.style.display = 'none';
        if (homeArea) homeArea.style.display = 'none';

        if (tabName === 'mylist') {
            if (listArea) listArea.style.display = 'block';
            if (profileArea) profileArea.style.display = 'none';
            if (listTitle) listTitle.innerText = 'Daftar Favorit Saya';
            const favorites = JSON.parse(localStorage.getItem('lukon_favorites') || '[]');
            renderAnimeGrid(favorites, 'listTabContainer');
        } else if (tabName === 'history') {
            if (listArea) listArea.style.display = 'block';
            if (profileArea) profileArea.style.display = 'none';
            if (listTitle) listTitle.innerText = 'Riwayat Menonton';
            const history = JSON.parse(localStorage.getItem('lukon_history') || '[]');
            renderAnimeGrid(history, 'listTabContainer');
        } else if (tabName === 'profile') {
            if (listArea) listArea.style.display = 'none';
            if (profileArea) profileArea.style.display = 'block';
            renderProfile();
        }
    }
}

/* Supabase Auth Session & Login Google */
async function checkUserSession() {
    if (window.dbSupabase) {
        const { data: { session } } = await window.dbSupabase.auth.getSession();
        window.currentUser = session ? session.user : null;

        window.dbSupabase.auth.onAuthStateChange((_event, session) => {
            window.currentUser = session ? session.user : null;
            if (document.getElementById('profileTabArea')?.style.display !== 'none') {
                renderProfile();
            }
        });
    }
}

async function loginWithGoogle() {
    if (!window.dbSupabase) {
        alert("Client Supabase belum terinisialisasi!");
        return;
    }

    const redirectUrl = window.location.origin + window.location.pathname;

    const { error } = await window.dbSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl
        }
    });

    if (error) {
        alert("Gagal Login Google: " + error.message);
        console.error("Supabase OAuth Error:", error);
    }
}

async function logoutUser() {
    if (window.dbSupabase) {
        await window.dbSupabase.auth.signOut();
        window.currentUser = null;
        renderProfile();
    }
}

function renderProfile() {
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) return;

    if (window.currentUser) {
        const meta = window.currentUser.user_metadata || {};
        const avatar = meta.avatar_url || 'https://via.placeholder.com/85';
        const name = meta.full_name || meta.name || 'Pengguna Lukon Play';
        const email = window.currentUser.email || '';

        profileContent.innerHTML = `
            <img src="${avatar}" alt="Avatar" class="profile-avatar">
            <h3 style="font-size:1.1rem; color:var(--text-p);">${name}</h3>
            <p style="font-size:0.8rem; color:var(--text-s); margin-top:3px;">${email}</p>
            <button onclick="logoutUser()" class="btn-logout">Keluar (Logout)</button>
        `;
    } else {
        profileContent.innerHTML = `
            <div style="font-size:3.2rem; margin-bottom:10px;">👤</div>
            <h3 style="font-size:1.05rem; color:var(--text-p);">Masuk ke Akun</h3>
            <p style="font-size:0.8rem; color:var(--text-s); margin-top:4px;">Simpan favorit dan riwayat tontonanmu di cloud.</p>
            <button onclick="loginWithGoogle()" class="btn-google-login">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                <span>Login dengan Google</span>
            </button>
        `;
    }
}

document.addEventListener("DOMContentLoaded", initApp);
