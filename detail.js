// js/detail.js — หน้ารายละเอียดหนัง (movie-detail.html)
document.addEventListener("DOMContentLoaded", () => {
    const params   = new URLSearchParams(window.location.search);
    const movieId  = params.get('id');
    const movie    = movieDatabase.find(m => m.id === movieId);
    const pageContainer = document.getElementById("detail-page-content");

    if (!movie) {
        pageContainer.innerHTML = `
            <div class="not-found">
                <div class="not-found-icon">🎬</div>
                <h2>ไม่พบข้อมูลภาพยนตร์</h2>
                <p style="color:var(--text-gray);margin-bottom:28px;">
                    รหัส "${movieId || ''}" ไม่มีอยู่ในฐานข้อมูล CineMint
                </p>
                <a href="index.html" class="btn-mint">← กลับหน้าหลัก</a>
            </div>`;
        return;
    }

    document.title = `${movie.title} — CineMint`;

    /* ---- YouTube helpers ---------------------------------------- */
    function watchUrl(embedUrl) {
        const m = (embedUrl || '').match(/embed\/([^?&/]+)/);
        return m ? `https://www.youtube.com/watch?v=${m[1]}` : embedUrl;
    }

    /* ---- Poster img tag with fallback ---------------------------- */
    function detailPosterTag(m) {
        return `<img class="js-tmdb-poster"
                     data-tmdb-id="${m.tmdbId}"
                     src="${m.poster}"
                     alt="${(m.title||'').replace(/"/g,'&quot;')}"
                     loading="lazy"
                     onerror="handleImgError(this)">`;
    }

    /* ---- Related movies (same genre, sorted by rating) ----------- */
    function buildRelated(current) {
        const related = movieDatabase
            .filter(m => m.id !== current.id)
            .map(m => ({ ...m, _match: m.genres.filter(g => current.genres.includes(g)).length }))
            .filter(m => m._match > 0)
            .sort((a, b) => b._match - a._match || b.rating - a.rating)
            .slice(0, 8);

        if (!related.length) return '';

        const cards = related.map(m => `
            <a href="movie-detail.html?id=${m.id}" class="movie-card">
                <div class="poster-frame"
                     data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                     data-year="${m.year}">
                    <img class="js-tmdb-poster"
                         data-tmdb-id="${m.tmdbId}"
                         src="${m.poster}"
                         alt="${m.title}"
                         loading="lazy"
                         onerror="handleImgError(this)">
                </div>
                <div class="movie-card-info">
                    <div class="movie-card-title-row">
                        <strong>${m.title}</strong>
                        <div class="rating-leaf sm"><span>${m.rating}</span></div>
                    </div>
                    <span class="movie-card-sub">${m.year} • ${m.genres[0]}</span>
                </div>
            </a>
        `).join('');

        return `
            <section class="related-section">
                <div class="movie-row-head" style="padding:0;margin-bottom:20px;">
                    <h3 style="margin:0;font-size:1.35rem;">ภาพยนตร์ที่คุณอาจชอบ</h3>
                    <a href="top-rated.html?genre=${encodeURIComponent(current.genres[0])}"
                       class="row-link">
                        ดูทั้งหมดแนว ${current.genres[0]}
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
                <div class="movie-grid" id="related-grid">
                    ${cards}
                </div>
            </section>
        `;
    }

    /* ---- Trailer section ---------------------------------------- */
    function buildTrailer(m) {
        if (!m.trailerEmbed) return '';
        return `
            <h3 style="margin-top:30px;">ตัวอย่างภาพยนตร์</h3>
            <div class="video-wrapper">
                <div class="video-container">
                    <iframe src="${m.trailerEmbed}"
                            title="${m.title} Official Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy"></iframe>
                </div>
                <div class="trailer-fallback">
                    <a href="${watchUrl(m.trailerEmbed)}"
                       target="_blank" rel="noopener noreferrer"
                       class="btn-outline btn-yt">
                        <i class="fa-brands fa-youtube"></i>
                        ดูตัวอย่างบน YouTube
                    </a>
                </div>
            </div>
        `;
    }

    /* ---- Main render --------------------------------------------- */
    pageContainer.innerHTML = `
        <div class="detail-hero js-tmdb-backdrop"
             data-tmdb-id="${movie.tmdbId}"
             style="background-image:url('${movie.backdrop}')">
            <div class="detail-hero-overlay"></div>
            <div class="grain-overlay"></div>
            <div class="detail-hero-inner">
                <div class="detail-poster-frame"
                     data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                     data-year="${movie.year}">
                    ${detailPosterTag(movie)}
                </div>
                <div class="detail-title-block">
                    <h1>${movie.title}</h1>
                    <p class="meta-row">
                        🗓️ ${movie.year} &nbsp;•&nbsp;
                        ⏱️ ${movie.duration} &nbsp;•&nbsp;
                        🎬 ${movie.director}
                    </p>
                    <div class="genre-row">
                        ${movie.genres.map(g =>
                            `<a href="top-rated.html?genre=${encodeURIComponent(g)}"
                               class="genre-tag genre-tag-link">${g}</a>`
                        ).join('')}
                    </div>
                    <div class="detail-rating-block">
                        <div class="rating-leaf lg"><span>${movie.rating}</span></div>
                        <div class="label">
                            <strong>MintBot AI</strong>
                            <span>วิเคราะห์โดย AI อย่างเป็นกลาง</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-grid">
            <div>
                <h3>เรื่องย่อ</h3>
                <p class="lede">${movie.synopsis}</p>

                ${buildTrailer(movie)}

                <div class="ai-review-box">
                    <h3>🤖 รีวิวโดย MintBot AI</h3>
                    <p>${movie.aiReview}</p>
                </div>

                <div class="pros-cons">
                    <div class="pros-box">
                        <h4>✔ จุดเด่น</h4>
                        <ul>${movie.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    <div class="cons-box">
                        <h4>✖ จุดด้อย</h4>
                        <ul>${movie.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>

            <aside class="side-panel">
                <h4>นักแสดงและทีมงาน</h4>
                <p class="info-block">
                    <strong>ผู้กำกับ:</strong><br>${movie.director}<br><br>
                    <strong>นักแสดงนำ:</strong><br>${movie.cast.join('<br>')}
                </p>
                <h4 style="margin-top:24px;">ข้อมูลหนัง</h4>
                <p class="spec-grid">
                    <span>วันฉาย:</span><span>${movie.releaseDate}</span>
                    <span>ความยาว:</span><span>${movie.duration}</span>
                    <span>แนวหนัง:</span><span>${movie.genres.join(', ')}</span>
                    <span>สถานะ:</span><span><span class="status-pill">${movie.status}</span></span>
                </p>
                <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border-soft);">
                    ${movie.trailerEmbed ? `
                    <a href="${watchUrl(movie.trailerEmbed)}"
                       target="_blank" rel="noopener"
                       class="btn-outline btn-yt" style="width:100%;justify-content:center;font-size:0.88rem;">
                        <i class="fa-brands fa-youtube"></i> ดูตัวอย่างบน YouTube
                    </a>` : ''}
                </div>
            </aside>
        </div>

        ${buildRelated(movie)}
    `;

    /* TMDB images */
    if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(pageContainer);

    /* hydrate related grid เพิ่มเติม */
    const relatedGrid = document.getElementById("related-grid");
    if (relatedGrid && typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(relatedGrid);
});
