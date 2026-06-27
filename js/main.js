// js/main.js — หน้าแรก (index.html)
document.addEventListener("DOMContentLoaded", () => {

    /* Hero Banner ------------------------------------------------- */
    function getFeaturedMovie() {
        const pool = movieDatabase.filter(m => m.rating >= 88);
        const src  = pool.length ? pool : movieDatabase;
        const day  = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return src[day % src.length];
    }

    const featured     = getFeaturedMovie();
    const heroSection  = document.getElementById("hero-section");
    const heroContent  = document.getElementById("hero-content");

    if (heroSection && heroContent) {
        heroSection.classList.add("js-tmdb-backdrop");
        heroSection.dataset.tmdbId = featured.tmdbId;
        heroSection.style.backgroundImage = `url('${featured.backdrop}')`;

        heroContent.innerHTML = `
            <span class="hero-eyebrow">🍃 แนะนำโดย AI ประจำวันนี้</span>
            <h1>${featured.title}</h1>
            <div class="hero-meta">
                <div class="rating-leaf lg"><span>${featured.rating}</span></div>
                <span>${featured.year} • ${featured.duration} • กำกับโดย ${featured.director}</span>
            </div>
            <div class="hero-genres">
                ${featured.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>
            <p class="synopsis">${featured.synopsis}</p>
            <div class="hero-actions">
                <a href="movie-detail.html?id=${featured.id}" class="btn-mint">
                    <i class="fa-solid fa-play"></i> ดูรีวิว AI
                </a>
                <a href="now-showing.html" class="btn-outline">
                    <i class="fa-solid fa-film"></i> สำรวจหนังทั้งหมด
                </a>
            </div>
        `;
    }

    /* Movie card factory ------------------------------------------ */
    function createCard(movie) {
        const card = document.createElement("a");
        card.href = `movie-detail.html?id=${movie.id}`;
        card.className = "movie-card";
        card.innerHTML = `
            <div class="poster-frame"
                 data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                 data-year="${movie.year}">
                ${posterImgTag(movie)}
            </div>
            <div class="movie-card-info">
                <div class="movie-card-title-row">
                    <strong>${movie.title}</strong>
                    <div class="rating-leaf sm"><span>${movie.rating}</span></div>
                </div>
                <span class="movie-card-sub">${movie.year} • ${movie.genres[0]}</span>
            </div>
        `;
        return card;
    }

    function renderRow(id, movies) {
        const grid = document.getElementById(id);
        if (!grid) return;
        grid.innerHTML = "";
        movies.forEach(m => grid.appendChild(createCard(m)));
    }

    /* New Releases — หนังล่าสุด 8 เรื่อง เรียงตามคะแนน */
    const latestYear  = Math.max(...movieDatabase.map(m => m.year));
    const newReleases = movieDatabase
        .filter(m => m.year === latestYear)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
    renderRow("new-releases-grid", newReleases.length ? newReleases : movieDatabase.slice(0, 8));

    /* AI Top Picks — คะแนนสูงสุด 8 เรื่อง */
    const topPicks = [...movieDatabase].sort((a, b) => b.rating - a.rating).slice(0, 8);
    renderRow("top-picks-grid", topPicks);

    /* TMDB image hydration */
    if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(document);
});
