// ─────────────────────────────────────────
// js/auth.js
//
// This file handles everything related to
// the password screen:
//
//  1. Checking if she's already logged in
//     (saved in the browser's localStorage)
//  2. Validating the password she types
//  3. Saving her session so she never has
//     to type it again
//  4. Tracking whether the welcome card
//     has been shown before
//
// localStorage is like a tiny notepad built
// into every browser. Data saved there stays
// even after closing the tab.
// ─────────────────────────────────────────

// The keys we use to store things in localStorage.
// Using constants prevents typos from breaking things.
const STORAGE_KEYS = {
  authenticated: 'gallery_authenticated', // 'true' if already logged in
  welcomeSeen:   'gallery_welcome_seen',  // 'true' if welcome card was shown
};

// ── Check if already logged in ───────────
// Returns true if she's been here before and
// already typed the correct password.
function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEYS.authenticated) === 'true';
}

// ── Save that she is now logged in ───────
function saveAuthentication() {
  localStorage.setItem(STORAGE_KEYS.authenticated, 'true');
}

// ── Check if welcome card was shown ──────
function hasSeenWelcome() {
  return localStorage.getItem(STORAGE_KEYS.welcomeSeen) === 'true';
}

// ── Save that welcome card was shown ─────
function markWelcomeSeen() {
  localStorage.setItem(STORAGE_KEYS.welcomeSeen, 'true');
}

// ── Validate the typed password ──────────
// Returns true if the input matches the
// password set in config.js
function checkPassword(input) {
  return input === CONFIG.password;
}

// ── Set up the password form ─────────────
// This function attaches all the event
// listeners to the password screen's elements.
function initAuth(onSuccess) {
  const form        = document.getElementById('password-form');
  const input       = document.getElementById('password-input');
  const errorMsg    = document.getElementById('password-error');
  const enterBtn    = document.getElementById('enter-btn');

  // Handle the form submit (Enter key or button click)
  function handleSubmit() {
    const typed = input.value.trim();

    if (checkPassword(typed)) {
      // ✓ Correct password
      saveAuthentication();
      onSuccess(); // Tell app.js to advance to the next screen

    } else {
      // ✗ Wrong password — shake the input and show the error
      showPasswordError(input, errorMsg);
    }
  }

  // Listen for "submit" on the form (Enter key triggers this)
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop any browser default behaviour
    handleSubmit();
  });

  // Also listen for a click on the button directly
  enterBtn.addEventListener('click', handleSubmit);

  // Clear the error as soon as she starts typing again
  input.addEventListener('input', () => {
    input.classList.remove('error');
    errorMsg.classList.remove('visible');
  });

  // Auto-focus the input so she can start typing immediately
  // Small delay so the screen fade-in finishes first
  setTimeout(() => input.focus(), 600);
}

// ── Show the shake animation + error text ─
function showPasswordError(input, errorMsg) {
  // Remove then re-add the class so the animation replays
  // even if she submits wrong multiple times in a row
  input.classList.remove('error');

  // A tiny delay before re-adding forces the browser to
  // "reset" the animation. Without this, it won't replay.
  void input.offsetWidth; // Trick: reading offsetWidth forces a layout recalculate

  input.classList.add('error');
  errorMsg.classList.add('visible');

  // Clear the typed text after shaking
  setTimeout(() => {
    input.value = '';
    input.classList.remove('error');
  }, 600);
}
