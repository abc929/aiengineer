# START HERE

## The fastest way to fix a broken deploy

If GitHub Pages is showing your README instead of the game, Pages could not find
an `index.html` at the folder it publishes from. Usually the files got uploaded
one level too deep, inside a folder.

**The no-fuss fix: use the single file.**

1. Take `ai-engineer-level-up-SINGLE-FILE.html`
2. Rename it to exactly `index.html`
3. Upload it to the **root** of your repo (not inside any folder)
4. If an old `index.html` is there, this replaces it — that is fine
5. Wait about a minute, then hard-refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

That one file contains the entire game — all the HTML, styling and code.
There are no other files to upload and nothing that can get separated or lost.

## How to tell which problem you have

Look at your repository's file list:

- Do you see a **folder** named `ai-engineer-level-up`? → Your files are too deep.
  Either use the single file above, or click into the folder, and move the four
  files to the root.
- Do you see `index.html` sitting at the top level? → Then check
  **Settings → Pages** and confirm Source is `Deploy from a branch`,
  Branch `main`, folder `/ (root)`.

## Quick local test, before uploading anything

Double-click `ai-engineer-level-up-SINGLE-FILE.html` on your own computer.
It should open and play in your browser with no internet connection.
If it works there, the game is fine and any remaining problem is purely
about where the file sits in GitHub.

## The multi-file version

`index.html` + `questions.js` + `avatar.js` + `game.js` is the same game, split
into readable files. Use it if you want students editing the question bank or
the character art. All four must live in the same folder.

The single file is generated from those four, so edit them, not the single file.
