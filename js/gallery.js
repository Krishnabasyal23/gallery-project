// ─────────────────────────────────────────
// js/gallery.js
//
// This file builds and renders all the
// visual gallery content:
//
//  - The 4 archway room cards (Screen 4)
//  - The album grid inside a room (Screen 5)
//  - The framed photos/videos on the wall (Screen 6)
//
// Think of this as the "painter" — it reads
// the data and draws the HTML elements.
// ─────────────────────────────────────────

// ── SCREEN 4: Render the 4 Room Archways ──
// Reads all categories from data.json and
// builds the archway card HTML for each one.
function renderRooms(onRoomClick) {
  const grid = document.getElementById('rooms-grid');
  grid.innerHTML = ''; // Clear any previous content

  GALLERY_DATA.categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'arch-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');      // Keyboard accessible
    card.setAttribute('aria-label', `Room ${category.romanNumeral}: ${category.title}`);

    card.innerHTML = `
      <div class="arch-card__numeral">${category.romanNumeral}</div>
      <div class="arch-card__icon">${category.icon}</div>
      <div class="arch-card__title">${category.title}</div>
      <div class="arch-card__subtitle">${category.subtitle}</div>
    `;

    // Click to enter the room
    card.addEventListener('click', () => onRoomClick(category));

    // Also allow keyboard Enter/Space to activate
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRoomClick(category);
      }
    });

    grid.appendChild(card);
  });
}


// ── SCREEN 5: Render Albums inside a Room ─
// Receives a category object and renders all
// its albums as framed cards on the wall.
function renderAlbums(category, onAlbumClick) {
  const grid      = document.getElementById('albums-grid');
  const emptyMsg  = document.getElementById('albums-empty');
  const search    = document.getElementById('album-search');

  // Update the room header text
  document.getElementById('room-detail-label').textContent =
    `Room ${category.romanNumeral}`;
  document.getElementById('room-detail-title').textContent =
    category.title;
  document.getElementById('room-detail-subtitle').textContent =
    category.subtitle;

  // Clear old content
  grid.innerHTML = '';
  search.value = '';
  emptyMsg.hidden = true;

  // If this room has no albums at all, show empty state
  if (!category.albums || category.albums.length === 0) {
    emptyMsg.hidden = false;
    emptyMsg.textContent = 'No albums in this room yet.';
    return;
  }

  // Build all album frames
  buildAlbumFrames(category.albums, grid, onAlbumClick);

  // ── Search/filter functionality ──
  // When she types in the search box, filter the album frames
  search.addEventListener('input', () => {
    const query = search.value.toLowerCase().trim();
    const frames = grid.querySelectorAll('.album-frame');
    let visibleCount = 0;

    frames.forEach(frame => {
      const title = frame.dataset.title.toLowerCase();
      const matches = title.includes(query);
      frame.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    emptyMsg.hidden = visibleCount > 0;
    if (visibleCount === 0) {
      emptyMsg.textContent = `No albums match "${search.value}".`;
    }
  });
}

// Builds the album frame cards and appends to grid
function buildAlbumFrames(albums, grid, onAlbumClick) {
  albums.forEach((album, index) => {
    const frame = document.createElement('div');
    frame.className = 'album-frame';
    frame.setAttribute('role', 'listitem');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('aria-label', `Album: ${album.title}, ${album.date}`);
    frame.dataset.title = album.title; // Used for search filtering

    const itemCount = formatItemCount(album);

    frame.innerHTML = `
      <div class="album-frame__border">
        <div class="album-frame__mat">
          <img
            class="album-frame__img"
            src="${album.thumbnail}"
            alt="${album.title}"
            loading="lazy"
          />
        </div>
      </div>
      <div class="album-placard">
        <div class="album-placard__title">${album.title}</div>
        <div class="album-placard__date">${album.date}</div>
        <div class="album-placard__count">${itemCount}</div>
      </div>
    `;

    // Stagger the entrance animation delay based on position
    frame.style.animationDelay = `${index * 0.1}s`;

    frame.addEventListener('click', () => onAlbumClick(album));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onAlbumClick(album);
      }
    });

    grid.appendChild(frame);
  });
}


// ── SCREEN 6: Render the Exhibition Room ──
// Renders all photos and videos in an album
// as framed pieces hung on the wall.
function renderGallery(album, onPhotoClick, onVideoClick) {
  const masonry = document.getElementById('gallery-masonry');

  // Update the header placard
  document.getElementById('gallery-album-title').textContent = album.title;
  document.getElementById('gallery-album-date').textContent = album.date;

  // Clear old content
  masonry.innerHTML = '';

  album.items.forEach((item, index) => {
    const isVideo = item.type === 'video';

    // Pick a small random tilt: either slightly left or slightly right.
    // Math.random() gives a number 0–1.
    // Multiplying by 4 gives 0–4.
    // Subtracting 2 gives -2 to +2.
    // toFixed(1) keeps one decimal place.
    const tilt = (Math.random() * 4 - 2).toFixed(1);

    const itemEl = document.createElement('div');
    itemEl.className = `gallery-item${isVideo ? ' gallery-item--video' : ''}`;
    itemEl.setAttribute('role', 'listitem');
    itemEl.setAttribute('tabindex', '0');
    itemEl.setAttribute('aria-label', `${isVideo ? 'Video' : 'Photo'}: ${item.caption}`);
    itemEl.style.setProperty('--frame-tilt', `${tilt}deg`);
    itemEl.style.animationDelay = `${index * 0.12}s`;

    const romanIndex = toRoman(index + 1);
    const mediaLabel = isVideo ? 'Moving Image' : 'Photography';

    // For videos, we use a poster (thumbnail) image from picsum
    // In a real project, this would be your Cloudinary video thumbnail URL
    const thumbSrc = isVideo
      ? `https://picsum.photos/seed/video${index}/800/500`
      : item.url;

    itemEl.innerHTML = `
      <div class="gallery-item__frame">
        <div class="gallery-item__mat">
          <img
            class="gallery-item__img"
            src="${thumbSrc}"
            alt="${item.caption}"
            loading="lazy"
          />
          ${isVideo ? `
            <div class="gallery-item__play" aria-hidden="true">
              <div class="gallery-item__play-icon">&#9654;</div>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="gallery-placard">
        <div class="gallery-placard__caption">${item.caption}</div>
        <div class="gallery-placard__meta">${mediaLabel}</div>
        <div class="gallery-placard__number">${romanIndex}</div>
      </div>
    `;

    // Wire up click events
    if (isVideo) {
      itemEl.addEventListener('click', () => onVideoClick(item, index));
      itemEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') onVideoClick(item, index);
      });
    } else {
      itemEl.addEventListener('click', () => onPhotoClick(album.items, index));
      itemEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') onPhotoClick(album.items, index);
      });
    }

    masonry.appendChild(itemEl);
  });
}
