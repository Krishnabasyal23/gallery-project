// ─────────────────────────────────────────
// js/lightbox.js
//
// The lightbox is the full-screen photo viewer
// that appears when she clicks a photo.
//
// Features:
//  - Opens with a smooth fade
//  - Left/right arrows to navigate
//  - Keyboard: arrow keys + Escape to close
//  - Mobile: swipe left/right to navigate
//  - Shows a museum-style caption below
// ─────────────────────────────────────────

// We keep track of these across functions
// using module-level variables
let lightboxItems  = [];   // All photos in the current album
let lightboxIndex  = 0;    // Which photo is currently showing

// Grab all the lightbox DOM elements once
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxMeta  = document.getElementById('lightbox-meta');
const closeBtn      = document.getElementById('lightbox-close');
const prevBtn       = document.getElementById('lightbox-prev');
const nextBtn       = document.getElementById('lightbox-next');

// ── Open the lightbox ─────────────────────
// items: array of all items in the album
// startIndex: which one was clicked
function openLightbox(items, startIndex) {
  // Filter to photos only (videos don't use the lightbox)
  lightboxItems = items.filter(item => item.type === 'photo');

  // Find the correct index within photo-only list.
  // The clicked item might have been item #3 overall,
  // but only photo #2 if there was a video before it.
  const clickedItem = items[startIndex];
  
  // Find the index by comparing object reference
  lightboxIndex = lightboxItems.findIndex(i => i === clickedItem);

  // If for some reason not found, default to 0
  if (lightboxIndex === -1) {
    lightboxIndex = 0;
  }

  showLightboxImage(lightboxIndex);

  // Make visible
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// ── Show a specific photo by index ────────
function showLightboxImage(index) {
  const item = lightboxItems[index];
  if (!item) return;

  // Fade out, swap image, fade back in
  lightboxImg.style.opacity = '0';

  setTimeout(() => {
    lightboxImg.src = item.url;
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = item.caption;
    lightboxMeta.textContent = `Photography`;

    lightboxImg.style.opacity = '1';
    lightboxImg.style.transition = 'opacity 0.3s ease';
  }, 200);

  // Show/hide navigation arrows at the ends
  // At first photo, dim prev button. At last photo, dim next button.
  prevBtn.style.opacity = index === 0 ? '0.2' : '1';
  nextBtn.style.opacity = index === lightboxItems.length - 1 ? '0.2' : '1';
}

// ── Navigate forward / backward ───────────
function lightboxNext() {
  if (lightboxIndex < lightboxItems.length - 1) {
    lightboxIndex++;
    showLightboxImage(lightboxIndex);
  }
}

function lightboxPrev() {
  if (lightboxIndex > 0) {
    lightboxIndex--;
    showLightboxImage(lightboxIndex);
  }
}

// ── Close the lightbox ────────────────────
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = ''; // Free memory
  document.body.style.overflow = ''; // Restore background scrolling
}

// ── Button click listeners ─────────────────
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', lightboxPrev);
nextBtn.addEventListener('click', lightboxNext);

// ── Keyboard navigation ───────────────────
document.addEventListener('keydown', (e) => {
  // Only respond if the lightbox is visible
  if (lightbox.hidden) return;

  if (e.key === 'ArrowRight') lightboxNext();
  if (e.key === 'ArrowLeft')  lightboxPrev();
  if (e.key === 'Escape')     closeLightbox();
});

// ── Click outside (on the dark background) to close ──
lightbox.addEventListener('click', (e) => {
  // Only close if the click was on the background itself,
  // not on the image or controls
  if (e.target === lightbox) closeLightbox();
});

// ── Touch/Swipe support for mobile ────────
// We track where the finger started (touchStartX)
// and where it ended (touchEndX).
// A big enough difference = a swipe.
let touchStartX = 0;
let touchEndX   = 0;
const SWIPE_THRESHOLD = 50; // Minimum pixels to count as a swipe

lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true }); // passive: true = better scroll performance

lightbox.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) < SWIPE_THRESHOLD) return; // Too small to be a swipe

  if (diff > 0) {
    // Swiped left → show next
    lightboxNext();
  } else {
    // Swiped right → show previous
    lightboxPrev();
  }
}
