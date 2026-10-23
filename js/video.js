// ─────────────────────────────────────────
// js/video.js
//
// Handles the fullscreen video player modal.
// When she clicks a video frame, this opens
// a dark overlay with an HTML5 video player
// and a museum-style caption below it.
// ─────────────────────────────────────────

// Grab the video modal elements
const videoModal    = document.getElementById('video-modal');
const videoPlayer   = document.getElementById('video-player');
const videoCaption  = document.getElementById('video-caption');
const videoCloseBtn = document.getElementById('video-modal-close');

// ── Open the video modal ──────────────────
// item: the video object from data.json
//       { type: "video", url: "...", caption: "..." }
function openVideo(item) {
  // Set the video source — the browser will start loading it
  videoPlayer.src = item.url;
  videoCaption.textContent = item.caption;

  // Make the modal visible
  videoModal.hidden = false;
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Start playing automatically
  // .catch() handles browsers that block autoplay
  videoPlayer.play().catch(() => {
    // If autoplay is blocked, just let her press play manually
    console.log('Autoplay blocked — waiting for user interaction.');
  });
}

// ── Close the video modal ─────────────────
function closeVideo() {
  // Pause first to stop the audio
  videoPlayer.pause();

  // Clearing the src stops the browser from buffering
  videoPlayer.src = '';

  videoModal.hidden = true;
  document.body.style.overflow = ''; // Restore background scrolling
}

// ── Button click ──────────────────────────
videoCloseBtn.addEventListener('click', closeVideo);

// ── Escape key ───────────────────────────
document.addEventListener('keydown', (e) => {
  if (!videoModal.hidden && e.key === 'Escape') {
    closeVideo();
  }
});

// ── Click dark background to close ───────
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) closeVideo();
});
