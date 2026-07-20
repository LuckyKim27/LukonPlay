const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const epId = parseInt(params.get('ep'));
const db = JSON.parse(localStorage.getItem('lukon_db')) || [];
const anime = db.find(a => a.id === id);

if(document.getElementById('backLink')) {
    document.getElementById('backLink').href = `detail.html?id=${id}`;
}

if(anime) {
    const ep = anime.episodes.find(e => e.id === epId);
    if(ep) {
        if(document.getElementById('animeTitle')) document.getElementById('animeTitle').innerText = anime.judul;
        if(document.getElementById('epTitle')) document.getElementById('epTitle').innerText = ep.judul;
        if(document.getElementById('player')) document.getElementById('player').src = ep.videoUrl;

        let hist = JSON.parse(localStorage.getItem('lukon_hist')) || [];
        hist = hist.filter(i => i !== id);
        hist.unshift(id);
        localStorage.setItem('lukon_hist', JSON.stringify(hist));
    }

    const hList = document.getElementById('horizontalEpList');
    if(hList) {
        anime.episodes.forEach(e => {
            const activeClass = e.id === epId ? 'active' : '';
            hList.innerHTML += `<a href="watch.html?id=${id}&ep=${e.id}" class="ep-box-item ${activeClass}">${e.id}</a>`;
        });
    }
}

let userVote = localStorage.getItem(`uvote_${id}`) || 'none';

function renderVotes() {
    let l = parseInt(localStorage.getItem(`l_${id}`)) || 0;
    let d = parseInt(localStorage.getItem(`d_${id}`)) || 0;
    if(document.getElementById('likeCount')) document.getElementById('likeCount').innerText = l;
    if(document.getElementById('dislikeCount')) document.getElementById('dislikeCount').innerText = d;
}

function vote(type) {
    let l = parseInt(localStorage.getItem(`l_${id}`)) || 0;
    let d = parseInt(localStorage.getItem(`d_${id}`)) || 0;

    if(userVote === type) {
        if(type === 'like') l--; else d--;
        userVote = 'none';
    } else {
        if(userVote === 'like') l--;
        if(userVote === 'dislike') d--;
        if(type === 'like') l++; else d++;
        userVote = type;
    }

    localStorage.setItem(`l_${id}`, l);
    localStorage.setItem(`d_${id}`, d);
    localStorage.setItem(`uvote_${id}`, userVote);
    renderVotes();
}

function loadKomen() {
    const list = document.getElementById('comments');
    if(!list) return;
    list.innerHTML = "";
    const saved = JSON.parse(localStorage.getItem(`c_${id}_${epId}`)) || [];
    if (saved.length === 0) {
        list.innerHTML = `<p style="font-size:0.75rem; color:var(--text-s); padding: 5px 0;">Belum ada komentar.</p>`;
        return;
    }
    saved.forEach(c => {
        list.innerHTML += `
            <div class="c-item">
                <img src="${c.userPhoto}" class="c-avatar" alt="">
                <div class="c-body">
                    <strong>${c.userName}</strong>
                    <div class="c-text">${c.text}</div>
                </div>
            </div>`;
    });
}

function kirimKomen() {
    const txt = document.getElementById('cText');
    if(!txt || !txt.value.trim()) return;
    const googleUser = JSON.parse(localStorage.getItem('google_user'));
    const saved = JSON.parse(localStorage.getItem(`c_${id}_${epId}`)) || [];
    
    saved.unshift({ userName: googleUser.name, userPhoto: googleUser.photo, text: txt.value });
    localStorage.setItem(`c_${id}_${epId}`, JSON.stringify(saved));
    txt.value = "";
    loadKomen();
}
