# Mingke Tian — personal website

Plain HTML and CSS for GitHub Pages. No build step: the files in this folder are the whole site.

Live site: **https://mingketian.github.io/** (GitHub Pages, branch `main`, folder `/ (root)`). Pushing to `main` republishes it in about a minute.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: name, links, photo, introduction, Recent News, What I'm Doing |
| `research.html` | Publications and manuscripts |
| `experience.html` | Education, internships, projects |
| `activities.html` | Leadership & Services |
| `cv.html` | CV page; shows `cv.pdf` (replace that file to update the CV) |

Styles: `assets/style.css` (every page links it as `style.css?v=...`; after editing the CSS or `site.js`, change that version string on all pages so browsers fetch the new file) (colors, type, and spacing are defined once at the top). Small behaviors (navigation shadow, fade-in on scroll): `assets/site.js`.

## Kept offline

The Interests page and its files (prediction-markets chart scripts and images) are kept outside this repository, in `../held/`, until they are published again. To restore it, move `held/interests.html` and its `assets/` and `images/` files back here and add `<li><a href="interests.html">Interests</a></li>` to the menu on every page.

## Still to add

| Put this file | It appears |
|---|---|
| `papers/constrainer.pdf`, `atsolver.pdf`, `mobilityworld.pdf`, `staybert.pdf`, `magi.pdf` | The PDF buttons on the Research pages (currently hidden with HTML comments) |

## Updating the CV

Replace `cv.pdf` with the new file (same name). The CV page and its Open PDF / Download buttons pick it up automatically.

## Technical Skills icons (Experience page)

Each tool in the scrolling row shows a two-letter tile. To use a real icon, add `images/tech/<name>.svg` and put `<img src="images/tech/<name>.svg" alt="">` inside that tool's `tech-icon` span (both copies of the row). File names: python, cplusplus, java, sql, bash, pytorch, tensorflow, scikitlearn, huggingface, langchain, langgraph, faiss, chroma, docker, aws, fastapi, git, linux, nvidia (all `.svg`). Official icons are available from each project's brand page or from open icon sets such as Simple Icons (simpleicons.org) or Devicon (devicon.dev); check each brand's usage guidelines.
