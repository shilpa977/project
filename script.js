// Simple Movie Recommendation App JS
document.addEventListener('DOMContentLoaded', () => {
  // Sample movie data
  let movies = [
    { id: 1, title: "The Midnight Heist", year: 2021, genre: "Action", rating: 8.1, poster: "https://via.placeholder.com/300x420?text=Action+Poster" },
    { id: 2, title: "Love in Chennai", year: 2019, genre: "Romance", rating: 7.2, poster: "https://via.placeholder.com/300x420?text=Romance+Poster" },
    { id: 3, title: "Parallel Minds", year: 2023, genre: "Sci-Fi", rating: 8.7, poster: "https://via.placeholder.com/300x420?text=Sci-Fi+Poster" },
    { id: 4, title: "The Last Melody", year: 2018, genre: "Drama", rating: 7.9, poster: "https://via.placeholder.com/300x420?text=Drama+Poster" },
    { id: 5, title: "Comedy Nights", year: 2020, genre: "Comedy", rating: 6.8, poster: "https://via.placeholder.com/300x420?text=Comedy+Poster" },
    { id: 6, title: "Horizon Runner", year: 2024, genre: "Action", rating: 9.0, poster: "https://via.placeholder.com/300x420?text=Action+Poster+2" },
    { id: 7, title: "Small Town Mystery", year: 2022, genre: "Thriller", rating: 8.0, poster: "https://via.placeholder.com/300x420?text=Thriller+Poster" }
  ];

  // DOM refs
  const moviesGrid = document.getElementById('moviesGrid');
  const searchInput = document.getElementById('searchInput');
  const genreSelect = document.getElementById('genreSelect');
  const recommendTopBtn = document.getElementById('recommendTopBtn');
  const recommendRandomBtn = document.getElementById('recommendRandomBtn');
  const favoritesList = document.getElementById('favoritesList');
  const detailsModal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const addMovieForm = document.getElementById('addMovieForm');

  // State
  let favorites = JSON.parse(localStorage.getItem('movie_favs') || '[]');

  function saveFavs(){
    localStorage.setItem('movie_favs', JSON.stringify(favorites));
  }

  // Build genre options
  function populateGenres(){
    const genres = new Set(movies.map(m => m.genre));
    // clear existing except 'all'
    genreSelect.querySelectorAll('option[data-gen]').forEach(n => n.remove());
    Array.from(genres).sort().forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      opt.setAttribute('data-gen','true');
      genreSelect.appendChild(opt);
    });
  }

  // Render movies (with filters)
  function renderMovies(list){
    moviesGrid.innerHTML = '';
    if (!list.length) {
      moviesGrid.innerHTML = `<div class="no-results">No movies found.</div>`;
      return;
    }
    list.forEach(m => {
      const card = document.createElement('article');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="poster" role="img" aria-label="${m.title} poster" style="background-image:url('${m.poster}')">
        </div>
        <div>
          <h3 class="title">${escapeHtml(m.title)}</h3>
          <div class="meta"><span class="genre-badge">${escapeHtml(m.genre)}</span><small>${m.year} • ⭐ ${m.rating.toFixed(1)}</small></div>
          <p style="margin:8px 0 0;font-size:0.9rem;color:rgba(255,255,255,0.7)">Short synopsis placeholder — click Details for more.</p>
        </div>
        <div class="card-actions">
          <button class="btn details-btn" data-id="${m.id}">Details</button>
          <button class="btn favorite ${isFav(m.id) ? 'favorite' : ''}" data-id="${m.id}">${isFav(m.id) ? 'Unfav' : 'Fav'}</button>
        </div>
      `;
      moviesGrid.appendChild(card);
    });
  }

  // Helpers
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function isFav(id){ return favorites.includes(id); }

  // Render favorites sidebar
  function renderFavorites(){
    favoritesList.innerHTML = '';
    if(!favorites.length){
      favoritesList.innerHTML = `<li style="opacity:0.8">No favorites yet — click Fav on a movie.</li>`;
      return;
    }
    favorites.forEach(id => {
      const m = movies.find(x => x.id === id);
      if(!m) return;
      const li = document.createElement('li');
      li.className = 'fav-item';
      li.innerHTML = `<div>${escapeHtml(m.title)} <small style="opacity:.7">• ${m.genre}</small></div>
                      <div><button data-id="${m.id}" class="btn remove-fav">Remove</button></div>`;
      favoritesList.appendChild(li);
    });
  }

  // Toggle favorite
  function toggleFavorite(id){
    id = Number(id);
    if (isFav(id)) {
      favorites = favorites.filter(x => x !== id);
    } else {
      favorites.push(id);
    }
    saveFavs();
    renderFavorites();
    applyFilters(); // update cards
  }

  // Show details modal
  function showDetails(id){
    const m = movies.find(x => x.id === Number(id));
    if(!m) return;
    detailsModal.setAttribute('aria-hidden', 'false');
    modalBody.innerHTML = `
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div style="min-width:160px;border-radius:8px;overflow:hidden"><img src="${m.poster}" alt="${m.title}" style="width:160px;display:block"/></div>
        <div>
          <h2 style="margin:0 0 6px">${escapeHtml(m.title)} <small style="opacity:.7">(${m.year})</small></h2>
          <p style="margin:6px 0"><strong>Genre:</strong> ${escapeHtml(m.genre)}</p>
          <p style="margin:6px 0"><strong>Rating:</strong> ⭐ ${m.rating.toFixed(1)}</p>
          <p style="margin-top:10px;color:rgba(255,255,255,0.85)">This is a demo synopsis. Replace with real descriptions fetched from an API for production apps.</p>
          <div style="margin-top:14px;display:flex;gap:8px">
            <button class="btn favorite" data-id="${m.id}">${isFav(m.id)?'Unfav':'Fav'}</button>
            <button class="btn secondary" id="modalCloseAction">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // Close modal
  function closeModal(){
    detailsModal.setAttribute('aria-hidden','true');
    modalBody.innerHTML = '';
  }

  // Recommenders
  function recommendTop(n = 5){
    // sort by rating desc
    const top = [...movies].sort((a,b) => b.rating - a.rating).slice(0,n);
    renderMovies(top);
  }

  function recommendRandom(n = 5){
    const shuffled = [...movies].sort(() => Math.random() - 0.5).slice(0,n);
    renderMovies(shuffled);
  }

  // Filters: search + genre
  function applyFilters(){
    const q = searchInput.value.trim().toLowerCase();
    const genre = genreSelect.value;
    let filtered = movies.filter(m => {
      const matchesQ = !q || m.title.toLowerCase().includes(q);
      const matchesGenre = genre === 'all' || m.genre === genre;
      return matchesQ && matchesGenre;
    });
    renderMovies(filtered);
  }

  // Add movie (sample)
  addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(addMovieForm);
    const title = fd.get('title').trim();
    const year = Number(fd.get('year')) || new Date().getFullYear();
    const genre = fd.get('genre').trim();
    const rating = parseFloat(fd.get('rating')) || 6.5;
    const id = movies.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    movies.push({id, title, year, genre, rating, poster: `https://via.placeholder.com/300x420?text=${encodeURIComponent(title)}`});
    addMovieForm.reset();
    populateGenres();
    applyFilters();
  });

  // Event delegation for movie card buttons
  moviesGrid.addEventListener('click', (e) => {
    const det = e.target.closest('.details-btn');
    const fav = e.target.closest('.favorite');
    if(det){
      showDetails(det.dataset.id);
      return;
    }
    if(fav){
      toggleFavorite(fav.dataset.id);
      return;
    }
  });

  // favorites sidebar actions
  favoritesList.addEventListener('click', (e) => {
    const remove = e.target.closest('.remove-fav');
    if(remove){
      toggleFavorite(remove.dataset.id);
    }
  });

  // modal close
  modalCloseBtn.addEventListener('click', closeModal);
  detailsModal.addEventListener('click', (e) => {
    if(e.target === detailsModal) closeModal();
  });
  // close button inside modal content (Close)
  detailsModal.addEventListener('click', (e) => {
    if(e.target && e.target.id === 'modalCloseAction') closeModal();
    if(e.target && e.target.classList.contains('favorite') && e.target.dataset.id){
      toggleFavorite(e.target.dataset.id);
      // update the button text in modal
      const btn = modalBody.querySelector('.favorite');
      if(btn) btn.textContent = isFav(Number(btn.dataset.id)) ? 'Unfav' : 'Fav';
    }
  });

  // UI events
  searchInput.addEventListener('input', debounce(applyFilters, 220));
  genreSelect.addEventListener('change', applyFilters);
  recommendTopBtn.addEventListener('click', () => recommendTop(6));
  recommendRandomBtn.addEventListener('click', () => recommendRandom(6));

  // Initial render
  populateGenres();
  renderFavorites();
  applyFilters();

  // Utility: debounce
  function debounce(fn, wait){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
});
