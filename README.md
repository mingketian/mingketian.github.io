# Mingke Tian — personal website

Plain HTML and CSS for GitHub Pages. No build step: the files in this folder are the whole site.

Live site: **https://mingketian.github.io/** (GitHub Pages, branch `main`, folder `/ (root)`). Pushing to `main` republishes it in about a minute.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: name, links, photo, introduction, Recent News, What I'm Doing |
| `cv.html` | CV page (the PDF `cv.pdf` is intentionally not published) |
| `research.html` | Publications and manuscripts |
| `research-*.html` | Detailed page for each paper |
| `experience.html` | Education, internships, technical skills, projects |
| `project-*.html` | Detailed page for each project |
| `activities.html` | Leadership & Services |
| `trading.html` | Trading Portfolio (data in `assets/pm-data.js`, normalized, no dollar amounts) |

Styles: `assets/style.css`; small behaviors: `assets/site.js`; math: KaTeX in `assets/vendor/`. Every page links the CSS and JS as `...?v=<version>`; after editing either file, change that version string on all pages so browsers fetch the new file.

## Still to add

| Put this file | It appears |
|---|---|
| `papers/<paper>.pdf` | The PDF buttons on the Research pages (currently hidden with HTML comments) |
| `videos/<paper>-pitch.mp4` | The pitch-video slot at the top of each research page (currently commented out) |
