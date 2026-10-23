// ─────────────────────────────────────────
// config.js
//
// This is the settings file for the whole site.
// Change the password here before gifting.
// This file is loaded FIRST so every other
// script can read these values.
// ─────────────────────────────────────────

const CONFIG = {
  // The password she types on the first screen.
  // Change this to anything you like before gifting.
  password: "gallery2024",

  // Show the personal welcome card only on the very first
  // visit. After that, it goes straight to the gallery.
  showWelcomeOnce: true,

  // Automatically move from the intro title screen to the
  // gallery rooms after 3 seconds (set false to disable).
  autoSkipIntro: true,

  // How long (in milliseconds) to show the intro before
  // auto-advancing. 3000 = 3 seconds.
  introDelay: 3000,

  // Set to true later if you want to add ambient music.
  enableAmbientMusic: false,

  // Paste a Cloudinary URL to an audio file here if adding music.
  musicUrl: "",

  // Your Cloudinary base URL. You'll fill this in after
  // setting up your free Cloudinary account.
  // Example: "https://res.cloudinary.com/your-cloud-name/image/upload"
  cloudinaryBase: "",
};
