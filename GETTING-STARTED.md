# Getting Started — Your Private Art Gallery

Welcome. This guide assumes you've never done any of this before.
Follow each section in order.

---

## 1. How to Open the Site Locally

You cannot simply double-click `index.html` to open it. Here's why:
the gallery uses `fetch()` to load `data.json`, and browsers block
that when opening files directly from your computer (for security
reasons). You need a tiny local server instead.

**The easiest option — VS Code (recommended):**

1. Download and install [VS Code](https://code.visualstudio.com/) if
   you don't have it.
2. Open VS Code. Go to Extensions (the four-squares icon on the left
   sidebar).
3. Search for **"Live Server"** by Ritwick Dey. Install it.
4. Open your `gallery-project` folder in VS Code:
   `File → Open Folder → select gallery-project`.
5. Right-click on `index.html` in the file list on the left.
6. Click **"Open with Live Server"**.
7. Your browser opens automatically. The gallery runs.

**Alternative — Python (if you have Python installed):**

1. Open Terminal (Mac) or Command Prompt (Windows).
2. Navigate to your project folder:
   ```
   cd path/to/gallery-project
   ```
3. Run this command:
   ```
   python -m http.server 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

The password to enter the gallery is: **`gallery2024`**
(You'll change this before gifting — see Section 5.)

---

## 2. How to Set Up Cloudinary (Free)

Cloudinary is where your real photos and videos will be stored online.
It's free for personal use. Here's how to set it up:

1. Go to [cloudinary.com](https://cloudinary.com) and click **Sign Up Free**.
2. Fill in your name, email, password. On the "What will you use
   Cloudinary for?" screen — choose "Developer".
3. After signing in, you're on the **Dashboard**. You'll see your
   **Cloud Name** (something like `dxyz123abc`). Write this down.
4. Click **Media Library** in the top navigation.
5. To upload a photo, click the **Upload** button (top right).
   Select your file. It uploads in a few seconds.
6. Once uploaded, click on the image to open it. You'll see a
   **URL** at the bottom. It looks like this:
   ```
   https://res.cloudinary.com/your-cloud-name/image/upload/v1234567/photo1.jpg
   ```
   That's the URL you paste into `data.json`.

**To organise your media:**
Before uploading, click **New Folder** and create folders matching
your gallery rooms (e.g. "journeys", "ordinary-days"). Upload each
album's photos into its own subfolder. This keeps things tidy.

---

## 3. How to Add a Real Photo to data.json

Open `data.json` in VS Code (or any text editor).

Find the album you want to add a photo to. It looks like this:

```json
{
  "id": "greece-2024",
  "title": "Somewhere Warm",
  "date": "June 2024",
  "thumbnail": "https://picsum.photos/seed/greece/600/400",
  "items": [
    {
      "type": "photo",
      "url": "https://picsum.photos/seed/greece1/1200/900",
      "caption": "The light there was different"
    }
  ]
}
```

**To replace the placeholder photo with a real one:**

1. Upload your photo to Cloudinary (see Section 2).
2. Copy the Cloudinary URL of that photo.
3. Replace the `"url"` value:
   ```json
   "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/greece1.jpg"
   ```
4. Change the `"caption"` to whatever you want shown on the placard.
5. To also update the **thumbnail** (the preview image on the album card),
   replace the `"thumbnail"` URL at the album level with the same or
   a different Cloudinary URL.
6. Save the file. Refresh the browser. Done.

**To add a new photo to an existing album:**

Copy an existing item block (the `{ "type": "photo", ... }` part)
and paste it as a new entry in the `"items"` array, separated by a
comma:

```json
"items": [
  {
    "type": "photo",
    "url": "https://...",
    "caption": "First photo"
  },
  {
    "type": "photo",
    "url": "https://...",
    "caption": "Second photo"
  }
]
```

---

## 4. How to Run the Python Script

The Python script (`generate_data.py`) automates building `data.json`
when you have lots of photos. Instead of typing every URL by hand, you
organise your local files into folders, run the script, then just swap
in the real Cloudinary URLs.

**Step-by-step:**

1. Create a folder called `media` inside `gallery-project`.
2. Inside `media`, create subfolders named exactly:
   `journeys`, `ordinary-days`, `celebrations`, `favourites`
3. Inside each of those, create album subfolders. Example:
   ```
   media/
   └── journeys/
       └── greece-2024/
           ├── photo1.jpg
           ├── photo2.jpg
           └── video1.mp4
   ```
4. Open Terminal, navigate to `gallery-project`:
   ```
   cd path/to/gallery-project
   ```
5. Run the script:
   ```
   python generate_data.py
   ```
6. It prints a summary and writes a new `data.json`.
7. Open `data.json`. Every photo has a placeholder URL like:
   ```
   [YOUR_CLOUDINARY_BASE_URL]/journeys/greece-2024/photo1.jpg
   ```
8. Upload the photos to Cloudinary, then replace each placeholder
   URL with the real Cloudinary URL. You can use Find & Replace in
   VS Code to swap the base URL quickly.

---

## 5. How to Change the Password Before Gifting

Open `config.js`. The very first line inside the `CONFIG` object is:

```javascript
password: "gallery2024",
```

Change `"gallery2024"` to whatever password you choose. Example:

```javascript
password: "somewhereWarm",
```

Save the file. That's it. The next time someone opens the gallery,
they'll need to type the new password.

**Important:** After you change the password, clear the browser's
saved session by opening the browser console:
- Chrome/Edge: Press `F12` → click "Console" tab.
- Type: `localStorage.clear()` → press Enter.
- Refresh the page.

This ensures you're testing the correct new password and not
accidentally using the old saved session.

---

## 6. How to Deploy to Netlify (Make It Live Online)

Netlify is a free hosting service. You literally drag a folder
onto a webpage and your site is live with a shareable link.
No technical knowledge needed.

**What "deploy" means:** Right now the gallery only runs on your
computer. "Deploying" means putting it on the internet so Sofia
can open a link from anywhere.

**Steps:**

1. Go to [netlify.com](https://netlify.com) and sign up for a free
   account (you can use your GitHub or Google account).
2. After signing in, you land on the **Sites** page. You'll see a big
   drag-and-drop area that says:
   **"Drag and drop your site output folder here"**
3. Drag your entire `gallery-project` folder directly into that area.
4. Netlify uploads all the files (takes about 10–30 seconds).
5. When it's done, it gives you a URL like:
   `https://graceful-curie-abc123.netlify.app`
6. Open that URL. Your gallery is live.

**To give it a nicer URL:**
In Netlify, go to `Site settings → Site details → Change site name`.
You can set something like `sofia-gallery`, making the URL:
`https://sofia-gallery.netlify.app`

**To update the site later** (when you add more photos):
Go to the Netlify dashboard → your site → **Deploys** tab →
drag your updated folder there again. It replaces the old version.

---

## 7. How to Add a 5th Gallery Room

**Step 1 — Add the category to `data.json`:**

Open `data.json`. Find the `"categories"` array (the list of rooms).
After the last room, add a comma, then paste this:

```json
{
  "id": "new-room",
  "romanNumeral": "V",
  "title": "Your Room Title",
  "subtitle": "A short poetic line",
  "icon": "◈",
  "albums": []
}
```

Change `"title"`, `"subtitle"`, and `"icon"` to whatever you like.
Add albums to it the same way the other rooms have albums.

**Step 2 — Update the CSS grid:**

Open `css/responsive.css`. Find this section:

```css
.rooms-grid {
  grid-template-columns: repeat(4, 1fr);
}
```

Change `repeat(4, 1fr)` to `repeat(5, 1fr)` (in `screens.css`).

Alternatively, for 5 rooms you might want a different layout —
perhaps 3 on top, 2 on the bottom. You can do that with:

```css
.rooms-grid {
  grid-template-columns: repeat(3, 1fr);
}
```

and it will automatically wrap the 4th and 5th onto a second row.

That's all there is to it.

---

## Quick Reference Card

| Task | File to edit |
|------|-------------|
| Change password | `config.js` |
| Add/edit photos | `data.json` |
| Change recipient's name | `data.json` → `recipientName` |
| Change welcome message | `data.json` → `welcomeMessage` |
| Change your name (curator) | `data.json` → `curatorName` |
| Change site title | `data.json` → `siteTitle` |
| Change colors | `css/variables.css` |
| Change intro delay | `config.js` → `introDelay` |
| Add a new room | `data.json` → add to `categories` |

---

*Built with plain HTML, CSS, and JavaScript. No frameworks, no fuss.*
