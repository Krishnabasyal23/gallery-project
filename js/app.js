// ─────────────────────────────────────────
// js/app.js
//
// This is the MAIN controller — the director.
// It loads the data, decides which screen to
// show first, and handles every screen transition.
//
// Think of it as the stage manager of a
// theatre production: it tells every other
// piece when to appear and disappear.
// ─────────────────────────────────────────

// ── Screen references ─────────────────────
// Grab all 6 screen elements once at startup.
const SCREENS = {
  password:   document.getElementById('screen-password'),
  welcome:    document.getElementById('screen-welcome'),
  intro:      document.getElementById('screen-intro'),
  rooms:      document.getElementById('screen-rooms'),
  roomDetail: document.getElementById('screen-room-detail'),
  gallery:    document.getElementById('screen-gallery'),
};

// ── Track where we are ────────────────────
// These remember context for the back buttons.
let currentCategory = null;  // Which room we're in
let currentAlbum    = null;  // Which album we're in

// ── Screen switcher ───────────────────────
// Shows one screen, hides all others.
// Accepts an id string like 'rooms' or 'welcome'.
function showScreen(id) {
  Object.entries(SCREENS).forEach(([key, el]) => {
    if (key === id) {
      el.classList.add('active');
      el.scrollTop = 0; // Scroll to top each time
    } else {
      el.classList.remove('active');
    }
  });
}

// ── Intro: animate the title letter by letter ──
function animateIntroTitle() {
  const titleEl = document.getElementById('intro-title');
  const yearEl  = document.getElementById('intro-year');
  const text    = GALLERY_DATA.siteTitle; // e.g. "A Year in Frames"

  // Wrap each character in a <span> so CSS can animate each one
  titleEl.innerHTML = text
    .split('')
    .map((char, i) => {
      // Spaces get a non-breaking space (&nbsp;) so they don't collapse
      const display = char === ' ' ? '&nbsp;' : char;
      // Each letter gets a slightly later delay, creating the reveal effect
      const delay = (i * 0.07).toFixed(2);
      return `<span class="letter" style="animation-delay: ${delay}s">${display}</span>`;
    })
    .join('');

  // Set the roman numeral year from data
  const year = GALLERY_DATA.year;
  const romanYear = yearToRoman(year);
  yearEl.textContent = romanYear;
}

// Convert a 4-digit year like "2024" to roman numerals "MMXXIV"
function yearToRoman(yearStr) {
  const map = {
    1000: 'M', 900: 'CM', 500: 'D', 400: 'CD',
    100: 'C',  90: 'XC',  50: 'L',  40: 'XL',
    10: 'X',   9: 'IX',   5: 'V',   4: 'IV',   1: 'I'
  };
  let num    = parseInt(yearStr, 10);
  let result = '';
  for (const [value, numeral] of Object.entries(map).sort((a,b) => b[0]-a[0])) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

// ── Intro: auto-advance or click-to-skip ──
function startIntro() {
  animateIntroTitle();
  showScreen('intro');

  // Clicking anywhere on the intro screen skips it
  const introEl = SCREENS.intro;
  const skip = () => {
    introEl.removeEventListener('click', skip);
    clearTimeout(autoTimer);
    showScreen('rooms');
  };

  introEl.addEventListener('click', skip);

  // Auto-advance after introDelay milliseconds (default 3000 = 3 seconds)
  const autoTimer = CONFIG.autoSkipIntro
    ? setTimeout(skip, CONFIG.introDelay)
    : null;
}

// ── Welcome card setup ────────────────────
function setupWelcomeCard() {
  // Fill in the data-driven fields from data.json
  document.getElementById('welcome-name').textContent    = GALLERY_DATA.recipientName;
  document.getElementById('welcome-quote').textContent   = GALLERY_DATA.welcomeMessage;
  document.getElementById('welcome-curator').textContent = GALLERY_DATA.curatorName;

  // "Enter the Gallery →" link click
  const enterLink = document.getElementById('enter-gallery-link');
  enterLink.addEventListener('click', (e) => {
    e.preventDefault();
    markWelcomeSeen();
    startIntro();
  });
}

// ── Rooms header ──────────────────────────
function setupRoomsScreen() {
  document.getElementById('rooms-title').textContent = GALLERY_DATA.siteTitle;

  // Render the 4 archways; pass onRoomClick as the callback
  renderRooms((category) => {
    currentCategory = category;
    renderAlbums(category, (album) => {
      currentAlbum = album;
      renderGallery(
        album,
        (items, index) => openLightbox(items, index),   // photo click
        (item) => openVideo(item)                        // video click
      );
      showScreen('gallery');
    });
    showScreen('roomDetail');
  });
}

// ── Back buttons ──────────────────────────
function setupBackButtons() {
  // "← " on the album list screen → go back to rooms
  document.getElementById('back-to-rooms').addEventListener('click', () => {
    showScreen('rooms');
  });

  // "← " on the gallery screen → go back to album list
  document.getElementById('back-to-room').addEventListener('click', () => {
    showScreen('roomDetail');
  });
}

// ── MAIN STARTUP ─────────────────────────
// This function runs as soon as the page loads.
// It loads the data then decides what to show first.
async function init() {
  try {
    // 1. Load data.json
    await loadData();

    // 2. Set up things that need data to be ready
    setupWelcomeCard();
    setupRoomsScreen();
    setupBackButtons();

    // 3. Decide the starting screen:

    if (!isAuthenticated()) {
      // She hasn't logged in before → show the password screen
      initAuth(() => {
        // Called when she enters the correct password
        if (CONFIG.showWelcomeOnce && !hasSeenWelcome()) {
          showScreen('welcome');
        } else {
          startIntro();
        }
      });
      showScreen('password');

    } else if (CONFIG.showWelcomeOnce && !hasSeenWelcome()) {
      // She's logged in before but never saw the welcome card
      // (This shouldn't normally happen, but handles edge cases)
      showScreen('welcome');

    } else {
      // She's been here before — skip straight to the gallery rooms
      showScreen('rooms');
    }

  } catch (error) {
    // If data.json failed to load, show a clear message
    console.error('Gallery failed to start:', error);
    document.body.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        height:100vh;
        font-family:Georgia,serif;
        color:#a89880;
        text-align:center;
        padding:2rem;
      ">
        <div>
          <p style="font-size:1.2rem;margin-bottom:1rem;">
            The gallery could not be opened.
          </p>
          <p style="font-size:0.8rem;opacity:0.6;">
            Please open index.html through a local server.<br>
            See the Getting Started guide for help.
          </p>
        </div>
      </div>
    `;
  }
}

// Start everything once the HTML is fully loaded
document.addEventListener('DOMContentLoaded', init);
