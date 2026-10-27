# Mingke Tian — personal website

Plain HTML and CSS for GitHub Pages. No build step: the files in this folder are the whole site.

Live address once Pages is turned on: **https://mingketian.github.io/**

## Put it online

1. Create a repository named exactly `mingketian.github.io`.
2. Upload everything in this folder to the root of the repository (so `index.html` sits at the top level) and commit.
3. In the repository, open **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute or two, the site is live at https://mingketian.github.io/.

Note: with a free GitHub account, Pages only publishes from **public** repositories. A private repository can publish with GitHub Pro (or Team/Enterprise), and the published site is still visible to anyone who has the link.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: name, links, photo, introduction, Recent News, What I'm Doing |
| `cv.pdf` | CV (the CV menu item opens this PDF in a new tab) |
| `research.html` | Publications and manuscripts |
| `experience.html` | Education, internships, projects |
| `activities.html` | Leadership & Services |

Styles: `assets/style.css` (colors, type, and spacing are defined once at the top). Small behaviors (navigation shadow, fade-in on scroll): `assets/site.js`.

Prediction markets chart (Interests page): `assets/pm-dashboard.js` draws it, `assets/pm-dashboard.css` styles it, and `assets/pm-data.js` holds the data. The data is currently **illustrative**. To show real results, replace the points in `pm-data.js` with an approved public portfolio index (one aggregate value per week or day, no trades or method details) and set `illustrative: false`.

## Images and files still to add

| Put this file | It appears |
|---|---|
| `images/profile.jpg` | Home page photo (portrait, 3:4). Until then your GitHub avatar shows. |
| `papers/constrainer.pdf`, `atsolver.pdf`, `mobilityworld.pdf`, `staybert.pdf`, `magi.pdf` | The [PDF] links on the Research page |
| `images/arts/art-1.jpg` to `art-4.jpg` | Arts gallery on the Interests page (square) |

Text placeholders in `[square brackets]` with a light-blue highlight still need your content. Search the HTML files for `todo` to find them.

`cv.pdf` currently includes a phone number; replace the file if you do not want it public.

## Technical Skills icons (Experience page)

Each tool in the scrolling row shows `images/tech/<name>.svg` when that file exists, and a two-letter tile otherwise. File names: python, cplusplus, java, sql, bash, pytorch, tensorflow, scikitlearn, huggingface, langchain, langgraph, faiss, chroma, docker, aws, fastapi, git, linux, nvidia (all `.svg`). Official icons are available from each project's brand page or from open icon sets such as Simple Icons (simpleicons.org) or Devicon (devicon.dev); check each brand's usage guidelines.
