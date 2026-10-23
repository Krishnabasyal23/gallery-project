"""
generate_data.py
════════════════════════════════════════════════════════════════

This script scans a local /media folder and automatically
builds a data.json file for your gallery.

HOW TO RUN:
  1. Open your terminal (on Mac: Terminal app, on Windows: Command Prompt)
  2. Navigate to your project folder:
       cd path/to/gallery-project
  3. Run this script:
       python generate_data.py

IT EXPECTS THIS FOLDER STRUCTURE:
  /media
  ├── journeys/
  │   ├── greece-2024/
  │   │   ├── photo1.jpg
  │   │   ├── photo2.jpg
  │   │   └── video1.mp4
  │   └── weekend-trip/
  │       └── photo1.jpg
  ├── ordinary-days/
  └── celebrations/

IT OUTPUTS:
  A freshly generated data.json in this project folder.
  Open it, fill in the Cloudinary URLs, and you're done.

USES ONLY BUILT-IN PYTHON MODULES — no pip install needed.
"""

# ── Imports ───────────────────────────────────────────────────
import os       # For checking file paths and walking folders
import json     # For converting Python data to JSON format
from pathlib import Path  # A nicer way to work with file paths


# ════════════════════════════════════════════════════════════════
# SETTINGS — Edit these to match your setup
# ════════════════════════════════════════════════════════════════

# Where your media folder is, relative to this script.
# If your /media folder is in the same folder as this script,
# leave it as "media".
MEDIA_FOLDER = "media"

# Your Cloudinary base URL. You'll get this after signing up.
# Example: "https://res.cloudinary.com/my-cloud-name/image/upload"
# Leave blank for now — the script will use a placeholder.
CLOUDINARY_BASE = "[YOUR_CLOUDINARY_BASE_URL]"

# The output file location. Leave this as "data.json".
OUTPUT_FILE = "data.json"

# These are the file extensions we recognise as photos or videos.
# You can add more if needed (e.g. ".tiff" or ".mov").
PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff", ".heic"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}

# ════════════════════════════════════════════════════════════════
# THE CATEGORY MAP
#
# The top-level folders inside /media become your gallery "rooms".
# Here you define what roman numeral, title, subtitle, and icon
# each folder maps to.
#
# The KEY is the folder name (lowercase, use hyphens not spaces).
# If a folder isn't listed here, it will still be processed but
# will get placeholder values.
# ════════════════════════════════════════════════════════════════

CATEGORY_MAP = {
    "journeys": {
        "romanNumeral": "I",
        "title": "Journeys",
        "subtitle": "Everywhere the road took us",
        "icon": "✦"
    },
    "ordinary-days": {
        "romanNumeral": "II",
        "title": "Ordinary Days",
        "subtitle": "The ones that felt like nothing at the time",
        "icon": "◦"
    },
    "celebrations": {
        "romanNumeral": "III",
        "title": "Celebrations",
        "subtitle": "The nights worth remembering",
        "icon": "✧"
    },
    "favourites": {
        "romanNumeral": "IV",
        "title": "The Favourites",
        "subtitle": "If this was all we had, it would be enough",
        "icon": "♡"
    },
}


# ════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ════════════════════════════════════════════════════════════════

def get_file_type(filename):
    """
    Given a filename like "photo1.jpg", returns "photo" or "video".
    Returns None if the file isn't a recognised media type.
    
    In Python, a "function" is like a recipe: you give it an 
    ingredient (filename) and it gives you back a result.
    """
    # Path(filename).suffix gives us the extension e.g. ".jpg"
    # .lower() makes it lowercase so ".JPG" == ".jpg"
    extension = Path(filename).suffix.lower()
    
    if extension in PHOTO_EXTENSIONS:
        return "photo"
    elif extension in VIDEO_EXTENSIONS:
        return "video"
    else:
        # File type we don't recognise — skip it
        return None


def make_cloudinary_url(category_folder, album_folder, filename, cloudinary_base):
    """
    Builds a placeholder Cloudinary URL for a file.
    
    Example output:
    "[YOUR_CLOUDINARY_BASE_URL]/journeys/greece-2024/photo1.jpg"
    
    You'll replace the base URL after setting up Cloudinary.
    """
    return f"{cloudinary_base}/{category_folder}/{album_folder}/{filename}"


def folder_to_title(folder_name):
    """
    Converts a folder name into a readable title.
    "greece-2024" → "Greece 2024"
    "my-weekend-trip" → "My Weekend Trip"
    """
    # Split by hyphens, capitalise each word, join with spaces
    return " ".join(word.capitalize() for word in folder_name.split("-"))


def scan_media_folder(media_path, cloudinary_base):
    """
    Walks through the /media folder tree and builds the full
    categories data structure that data.json expects.
    
    Returns: a list of category dictionaries, a summary dict.
    """
    
    # These counters track how many of each we find
    summary = {
        "categories": 0,
        "albums": 0,
        "photos": 0,
        "videos": 0,
        "skipped_files": 0,
    }
    
    categories = []
    
    # Get a sorted list of category folders (top-level folders in /media)
    # sorted() puts them in alphabetical order for consistency
    try:
        category_folders = sorted([
            f for f in os.listdir(media_path)
            # Only include actual directories, not files
            if os.path.isdir(os.path.join(media_path, f))
            # Skip hidden folders (like .DS_Store on Mac)
            and not f.startswith(".")
        ])
    except FileNotFoundError:
        print(f"\n❌  ERROR: Could not find the folder '{media_path}'.")
        print("    Please create a /media folder in the same directory as this script.")
        print("    See the folder structure at the top of this file for guidance.\n")
        return [], summary
    
    if not category_folders:
        print(f"\n⚠️  The '{media_path}' folder exists but is empty.")
        print("    Add your category folders (e.g. /media/journeys/) and try again.\n")
        return [], summary
    
    # ── Loop through each category folder ──
    for cat_folder in category_folders:
        summary["categories"] += 1
        
        # Look up this folder's metadata from CATEGORY_MAP.
        # If it's not in the map, create sensible placeholder values.
        cat_meta = CATEGORY_MAP.get(cat_folder, {
            "romanNumeral": str(summary["categories"]),
            "title": folder_to_title(cat_folder),
            "subtitle": f"A collection from {folder_to_title(cat_folder)}",
            "icon": "✦"
        })
        
        cat_path = os.path.join(media_path, cat_folder)
        albums = []
        
        # ── Loop through each album folder inside this category ──
        album_folders = sorted([
            f for f in os.listdir(cat_path)
            if os.path.isdir(os.path.join(cat_path, f))
            and not f.startswith(".")
        ])
        
        for album_folder in album_folders:
            summary["albums"] += 1
            
            album_path = os.path.join(cat_path, album_folder)
            items = []
            thumbnail_url = ""
            first_item_found = False
            
            # ── Scan files inside this album ──
            # sorted() ensures consistent ordering
            media_files = sorted([
                f for f in os.listdir(album_path)
                if os.path.isfile(os.path.join(album_path, f))
                and not f.startswith(".")
            ])
            
            for filename in media_files:
                file_type = get_file_type(filename)
                
                if file_type is None:
                    # Not a photo or video — skip it
                    summary["skipped_files"] += 1
                    continue
                
                # Build the Cloudinary URL for this file
                url = make_cloudinary_url(
                    cat_folder, album_folder, filename, cloudinary_base
                )
                
                # The first file in the album becomes the thumbnail
                if not first_item_found:
                    thumbnail_url = url
                    first_item_found = True
                
                # The default caption is the filename without the extension.
                # e.g. "photo1.jpg" → "photo1" — you'll edit these manually.
                caption = Path(filename).stem.replace("-", " ").replace("_", " ")
                
                # Build the item entry
                item = {
                    "type": file_type,
                    "url": url,
                    "caption": caption
                }
                
                items.append(item)
                
                # Count it in our summary
                if file_type == "photo":
                    summary["photos"] += 1
                else:
                    summary["videos"] += 1
            
            # Build the album entry
            album = {
                "id": album_folder,
                "title": folder_to_title(album_folder),
                "date": "2024",   # You'll fill in the real date
                "thumbnail": thumbnail_url,
                "items": items
            }
            
            albums.append(album)
        
        # Build the category entry
        category = {
            "id": cat_folder,
            "romanNumeral": cat_meta["romanNumeral"],
            "title": cat_meta["title"],
            "subtitle": cat_meta["subtitle"],
            "icon": cat_meta["icon"],
            "albums": albums
        }
        
        categories.append(category)
    
    return categories, summary


# ════════════════════════════════════════════════════════════════
# MAIN — This runs when you execute the script
# ════════════════════════════════════════════════════════════════

def main():
    print("\n" + "═" * 55)
    print("  🖼  PRIVATE GALLERY — Data Generator")
    print("═" * 55)
    print(f"\n  Scanning: {MEDIA_FOLDER}/\n")
    
    # Scan the media folder
    categories, summary = scan_media_folder(MEDIA_FOLDER, CLOUDINARY_BASE)
    
    if not categories:
        # Something went wrong — error already printed inside scan_media_folder
        return
    
    # Build the full data structure that matches data.json's schema exactly
    data = {
        "siteTitle": "A Year in Frames",
        "recipientName": "Sofia",          # ← Edit this
        "welcomeMessage": "Every moment we kept, now yours to revisit.",  # ← Edit this
        "curatorName": "Your Name",        # ← Edit this
        "year": "2024",
        "categories": categories
    }
    
    # Write to data.json
    # indent=2 makes it nicely formatted (not one big line)
    # ensure_ascii=False allows special characters like ✦ ♡ etc.
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Print the summary
    print("  ✓  Done! Here's what was found:\n")
    print(f"     Categories (rooms):  {summary['categories']}")
    print(f"     Albums:              {summary['albums']}")
    print(f"     Photos:              {summary['photos']}")
    print(f"     Videos:              {summary['videos']}")
    
    if summary["skipped_files"] > 0:
        print(f"     Skipped files:       {summary['skipped_files']}  (not a recognised media type)")
    
    print(f"\n  📄  Output written to: {OUTPUT_FILE}")
    print("\n  NEXT STEPS:")
    print("  1. Open data.json and replace all placeholder URLs")
    print("     with your real Cloudinary URLs.")
    print("  2. Edit 'recipientName', 'welcomeMessage', 'curatorName'")
    print("     at the top of data.json.")
    print("  3. Update the 'date' fields for each album.")
    print("  4. Edit captions — they currently use the filename.")
    print("\n" + "═" * 55 + "\n")


# This line means: "only run main() if this file is executed
# directly — not if it's imported by another script."
if __name__ == "__main__":
    main()
