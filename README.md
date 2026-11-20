# giordanomancini-bio.github.io

Personal academic website of Giordano Mancini – plain Jekyll, built automatically by GitHub Pages.

## Updating content (no HTML needed)

| What | File |
|---|---|
| New paper / preprint | `_data/publications.yml` (add at the top; `featured: true` shows it on the homepage) |
| News item | `_data/news.yml` (newest first; images in `assets/img/`) |
| Datasets, code, tools | `_data/datacode.yml` |
| Collaboration map | `_data/collaborators.yml` (institution, lat/lon, people + number of joint papers) |
| Links (ORCID, Scholar, LinkedIn…) & menu | `_config.yml` – empty `url` hides a link |
| CV | replace `assets/files/Giordano_Mancini_CV.pdf` |
| Text of Home / Research | `index.html`, `research.html` |
| Style | `assets/css/style.css` |

Keep images below ~300 KB (resize to ≤1920 px wide).

## Local preview (optional)
```
bundle install
bundle exec jekyll serve
```
