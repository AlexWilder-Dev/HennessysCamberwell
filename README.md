# Hennessy’s, Camberwell: website concept

A static, single-page concept site for Hennessy’s, the Victorian corner pub at 225 Camberwell New Road, London SE5 0TH.

This is a demo. There is no CMS, database, payment system or form handling. The menu, the week view, the Friday line-up and the sunset panel all run in the browser from static data.

## Structure

```
index.html          the page
css/styles.css      styles
js/main.js          open-now status, navigation, rolling week view, line-up, sunset panel, menu, timeline, photos
data/menu.json      sample menu (placeholder, see below)
fonts/              Libre Caslon Display and Libre Caslon Text (SIL Open Font License)
photos/             venue photography (see below)
og.png              link preview image (1200 × 630)
favicon.svg
.github/workflows/  GitHub Pages deployment
```

## Photos

The page is laid out for five images from the pub's Instagram (@hennessyscamberwell). Each one appears once its file is in `photos/`. If a file is missing, that spot isn't shown at all and the section closes up around the text, so there are no empty frames.

| File | Where | Instagram post |
| --- | --- | --- |
| `photos/frontage.jpg` (728 wide), `frontage-480.jpg` | Hero, beside the sign board | The red frontage, cropped from the October what's-on poster |
| `photos/crest.png` (312 × 312, transparent) | On the sign board, above the name | The crest roundel from the same poster |
| `photos/lyric-wall.jpg` (1080), `lyric-wall-640.jpg` | What's on | The lyric wall |
| `photos/outside.jpg` (1080 × 1440), `outside-640.jpg` | Outside | Black-and-white shot of the tables out front |
| `photos/postcards.jpg` (1080 × 1440), `postcards-640.jpg` | The corner since 1839 | The Connemara postcards |

No pint, bar or food photo has been posted, so those sections are designed without one.

The palette follows the frontage: the red paintwork and gold lettering, on stout black and cream, with Caslon for the lettering.

## Content

- **What's on** comes from the pub's latest Instagram post: quiz night every Monday from 7pm, live music every Friday from 7:30pm. The Friday line-up is in `index.html` under `data-lineup`, one line per date. Past dates drop off by themselves and the card disappears once they've all passed, so add the next month's acts there.
- **Menu.** No menu was found, so `data/menu.json` holds five sample pub classics, marked as placeholder in the file. Replace them with the kitchen's dishes.
- **Reviews.** No reviews of Hennessy's could be found to quote, so the page shows only the 4.2 Google rating with a link to the reviews on Google.
- **Visit ping.** The script before `</body>` posts to `https://ntfy.sh/YOUR-NTFY-TOPIC`. Replace `YOUR-NTFY-TOPIC` with your topic. Add `?v=name` to a link to tag who opened it. Open the page once with `#me` on your own devices to stop pinging yourself.
- **Link preview.** `og:url` and `og:image` point at `https://alexwilder-dev.github.io/HennessysCamberwell/`.
- Other facts used: address, the pub's names since c.1839, open 12pm–midnight seven days, Guinness at £6 a pint, sport on TV, darts and pool, sun-trap outdoor seating, buses 36, 185, 436 and N136, Google rating 4.2. There is no phone number or website, so none is shown.
- "Open now" and the week view use London time. The sunset panel calculates today's sunrise and sunset for Camberwell; it shows daylight, not the weather.
- The page is marked `noindex` so the concept doesn't turn up in search results.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Use a local server rather than opening the file directly, because the menu is loaded from `data/menu.json`.

## Deploy to GitHub Pages

Pages is set to deploy from **GitHub Actions**. Every push to `main` runs `.github/workflows/pages.yml`, which copies the site files into an artifact and publishes it. There is no build step. It can also be run by hand from the Actions tab.

All paths are relative, so the site works from `https://<user>.github.io/<repo>/`.
