# Community Carbonates website

Static single-page site: `index.html`, `styles.css`, `main.js`. No build step, no backend.

## Preview locally

```bash
cd community-carbonates && python3 -m http.server 8000
```

Then open http://localhost:8000.

## Placeholders to fill

Search `index.html` for `PLACEHOLDER` and `Photo placeholder`.

| What | Where | How |
|---|---|---|
| Logo | Header and footer | Done: `assets/logo.png`. A vector (SVG) version would be sharper if you have one |
| Hero photo (flowstone with carbonate growth) | `.hero-figure .photo` | Replace the `div.photo` with an `<img>` that keeps the `photo photo--tall` classes |
| Governors Island, cement cylinder, 3D-printed pieces | Pilots section | Same as above |
| SolarOne pilot photo | Pilots section | Same as above |
| Team photos | `.avatar` initials | Replace each `<span class="avatar">` with `<img class="avatar" src="..." alt="">` |
| Partner logos | `.partners` list | Text only until logo permissions are confirmed |
| Press links | Updates section, `.press-ph` | Replace with `<a class="press-item" href="URL"><span>Outlet</span>Headline</a>` |
| Social share image URL | `og:image` in `<head>` | Make it an absolute URL once the domain is known |

Put image files in the `assets/` folder. It already holds the logo (`logo.png`, transparent; `logo-original.webp` is the file as supplied), `favicon-64.png`, `apple-touch-icon.png` and `og-image.png` (the LinkedIn/social preview, 1200×630; source in `og-image.svg`).

## Deploy

- **GitHub Pages:** push this folder to a repo, then Settings → Pages → deploy from the `main` branch root.
- **Netlify:** drag this folder onto app.netlify.com/drop.
- **Vercel:** `vercel` from inside the folder, framework preset "Other".

## Content rules (from the brief)

Describe what flowstones do, never how they work. Say "ambient air" and "carbonate". No cost figures, feedstock names or chemistry. Any CO₂-captured figure must be labeled "estimated" or "projected". Co-benefits are "potential co-benefits" only.
