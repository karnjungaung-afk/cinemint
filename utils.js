// js/utils.js — CineMint Shared Utilities
// โหลดไฟล์นี้ก่อน JS อื่นๆ ในทุกหน้า

// -------------------------------------------------------
// handleImgError — เรียกจาก onerror ของ <img> ทุกตัว
// เมื่อ TMDB CDN โหลดไม่สำเร็จ จะแสดง placeholder
// ที่มีชื่อหนังและปีแทน (ดีกว่ากรอบว่างเปล่า)
// -------------------------------------------------------
window.handleImgError = function(img) {
    if (img.dataset.errHandled) return;
    img.dataset.errHandled = "1";

    const frame = img.closest('.poster-frame, .detail-poster-frame');
    if (!frame) { img.style.opacity = '0'; return; }

    img.style.display = 'none';
    if (frame.querySelector('.poster-placeholder')) return;

    const title = frame.dataset.title || '';
    const year  = frame.dataset.year  || '';
    const ph = document.createElement('div');
    ph.className = 'poster-placeholder';
    ph.innerHTML = `
        <div class="poster-ph-icon">🎬</div>
        ${title ? `<div class="poster-ph-title">${title}</div>` : ''}
        ${year  ? `<div class="poster-ph-year">${year}</div>`   : ''}
    `;
    frame.appendChild(ph);
};

// -------------------------------------------------------
// embedToWatch — แปลง YouTube embed URL → watch URL
// เช่น https://www.youtube.com/embed/ABC123 → https://www.youtube.com/watch?v=ABC123
// -------------------------------------------------------
window.embedToWatch = function(embedUrl) {
    const m = (embedUrl || '').match(/embed\/([^?&/]+)/);
    return m ? `https://www.youtube.com/watch?v=${m[1]}` : embedUrl;
};

// -------------------------------------------------------
// posterImgTag — สร้าง <img> สำหรับโปสเตอร์ ใช้ร่วมกันทุกหน้า
// -------------------------------------------------------
window.posterImgTag = function(movie) {
    const title = (movie.title || '').replace(/"/g, '&quot;');
    const year  = movie.year || '';
    return `<img class="js-tmdb-poster"
                 data-tmdb-id="${movie.tmdbId}"
                 src="${movie.poster}"
                 alt="${title}"
                 loading="lazy"
                 onerror="handleImgError(this)">`;
};
