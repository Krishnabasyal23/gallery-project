// ─────────────────────────────────────────
// js/data.js
//
// This file is responsible for ONE thing:
// loading data.json and making its contents
// available to the rest of the app.
//
// It uses the browser's built-in "fetch" API
// to read the JSON file, just like how Python
// uses open() to read a file.
//
// Because fetching takes a moment, we use
// "async/await" — meaning: "wait for this
// to finish before moving on."
// ─────────────────────────────────────────

// This will hold the loaded data once ready.
// Other scripts can read from this variable.
let GALLERY_DATA = null;

// loadData() fetches data.json and stores it.
// It returns a Promise — a way of saying
// "this might take a moment, wait for me."
async function loadData() {
  try {
    // fetch() asks the browser to go get a file.
    const response = await fetch('data.json');

    // If the file wasn't found or there was a server error:
    if (!response.ok) {
      throw new Error(`Could not load data.json — status: ${response.status}`);
    }

    // .json() reads the file and converts the text into
    // a real JavaScript object we can work with.
    GALLERY_DATA = await response.json();

    return GALLERY_DATA;

  } catch (error) {
    // If something went wrong, log it clearly so you can debug.
    console.error('Failed to load gallery data:', error);
    throw error; // Re-throw so app.js knows something failed
  }
}

// ── Helper functions ──────────────────────
// These are small utility functions that other
// scripts use to find specific pieces of data.

// Find a category by its id string (e.g. "trips")
function getCategoryById(id) {
  if (!GALLERY_DATA) return null;
  return GALLERY_DATA.categories.find(cat => cat.id === id) || null;
}

// Find an album by its id, searching across all categories
function getAlbumById(albumId) {
  if (!GALLERY_DATA) return null;
  for (const category of GALLERY_DATA.categories) {
    const album = category.albums.find(a => a.id === albumId);
    if (album) return album;
  }
  return null;
}

// Count photos in an album
function countPhotos(album) {
  return album.items.filter(item => item.type === 'photo').length;
}

// Count videos in an album
function countVideos(album) {
  return album.items.filter(item => item.type === 'video').length;
}

// Build a human-readable item count string like:
// "3 Photographs · 1 Moving Image"
function formatItemCount(album) {
  const photos = countPhotos(album);
  const videos = countVideos(album);

  const parts = [];

  if (photos > 0) {
    parts.push(`${photos} Photograph${photos !== 1 ? 's' : ''}`);
  }

  if (videos > 0) {
    parts.push(`${videos} Moving Image${videos !== 1 ? 's' : ''}`);
  }

  return parts.join(' · ') || 'Empty';
}

// Convert an integer index into a roman numeral (for placards)
// Works for 1–20, which is plenty for a gallery.
function toRoman(num) {
  const map = [
    [10, 'X'], [9, 'IX'], [8, 'VIII'], [7, 'VII'], [6, 'VI'],
    [5, 'V'],  [4, 'IV'], [3, 'III'],  [2, 'II'],  [1, 'I']
  ];
  let result = '';
  for (const [value, numeral] of map) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}
