# Hennessy’s, Camberwell: website concept

A static, single-page concept site for Hennessy’s, the Victorian corner pub at 225 Camberwell New Road, London SE5 0TH.

This is a demo. There is no CMS, database, payment system or form handling. The menu, the week view and the sunset panel all run in the browser from static data. The page shows the pub's 4.2 Google rating with a link to its reviews on Google.

## Structure

```
index.html          the page
css/styles.css      styles
js/main.js          open-now status, navigation, rolling week view, sunset panel, menu, timeline, photos
data/menu.json      sample menu (placeholder, see below)
fonts/              Libre Caslon Display and Libre Caslon Text (SIL Open Font License)
photos/             venue photography (see below)
og.png              link preview image (1200 × 630)
favicon.svg
.github/workflows/  GitHub Pages deployment
```

## Photos

The photos come from the pub's Instagram (@hennessyscamberwell). If a file is missing, that photo isn't shown.

| File | Section |
| --- | --- |
| `photos/frontage.jpg` | Hero: the red frontage, cropped from the October what's-on poster |
| `photos/postcards.jpg` | The pint: the Connemara postcards on the wall |
| `photos/lyric-wall.jpg` | What's on: the lyric wall |
| `photos/outside.jpg` | Outside: the tables out front |

No pint, bar or food photo has been posted. The food section has no photo.

## Placeholders

- **Menu.** No menu was found, so `data/menu.json` holds five sample pub classics, marked as placeholder in the file. Replace them with the kitchen's dishes.
- **Visit ping.** The script before `</body>` posts to `https://ntfy.sh/YOUR-NTFY-TOPIC`. Replace `YOUR-NTFY-TOPIC` with your topic. Add `?v=name` to a link to tag who opened it. Open the page once with `#me` on your own devices to stop pinging yourself.
- **Link preview.** `og:url` and `og:image` point at `https://alexwilder-dev.github.io/HennessysCamberwell/`.

## Content notes

- Facts used: name and address, the pub’s names since c.1839, open 12pm–midnight seven days, Guinness at £6 a pint, live music on Saturdays, sport on TV, darts and pool, sun-trap outdoor seating, buses 36, 185, 436 and N136, Instagram @hennessyscamberwell, Google rating 4.2. Nothing else about the pub is stated.
- There is no phone number or website, so none is shown.
- “Open now” and the week view use London time.
- The sunset panel calculates today’s sunrise and sunset for Camberwell. It shows daylight, not the weather.
- The page is marked `noindex` so the concept doesn’t turn up in search results.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Use a local server rather than opening the file directly, because the menu is loaded from `data/menu.json`.

## Deploy to GitHub Pages

Pages is set to deploy from **GitHub Actions**. Every push to `main` runs `.github/workflows/pages.yml`, which copies the site files into an artifact and publishes it. There is no build step. It can also be run by hand from the Actions tab.

All paths are relative, so the site works from `https://<user>.github.io/<repo>/`.
