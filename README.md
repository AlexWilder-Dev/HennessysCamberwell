# Hennessy’s, Camberwell: website concept

A static, single-page concept site for Hennessy’s, the Victorian corner pub at 225 Camberwell New Road, London SE5 0TH.

This is a demo. There is no CMS, database, payment system or form handling. Everything on the page runs in the browser from static data. The page shows the pub's 4.2 Google rating with a link to its reviews on Google.

## Structure

```
index.html          the page
css/styles.css      styles
js/main.js          open-now status, navigation, what's on, sunset line, menu, timeline, photos
data/menu.json      sample menu (placeholder, see below)
fonts/              Libre Caslon Display and Libre Caslon Text (SIL Open Font License)
photos/             venue photography (see below)
share.jpg           link preview image (1200 × 630)
favicon.svg
.github/workflows/  GitHub Pages deployment
```

## Photos

The photos and the crest come from the pub's Instagram (@hennessyscamberwell). If a file is missing, that photo isn't shown.

| File | Where |
| --- | --- |
| `photos/lyric-wall.jpg` | Hero background, and the lyric band under "On the walls" |
| `photos/crest.png` | Hero and footer, cropped from the October what's-on poster |
| `photos/postcards.jpg` | On the walls: the Connemara postcards |
| `photos/outside.jpg` | Outside: the tables out front |
| `photos/frontage.jpg` | The corner since 1839: the red frontage, cropped from the same poster |

No pint, bar or food photo has been posted, so those sections have none.

## Content

- **Words.** The hero line, the postcards story, the lyric wall lines and the What's on notes are taken from the pub's own Instagram captions.
- **What's on** follows the pub's latest Instagram post: quiz night every Monday from 7pm, live music every Friday from 7:30pm. The Friday line-up is in `index.html` under `data-lineup`, one line per date. Past dates drop off by themselves and the line-up disappears once they've all passed, so add the next month's acts there. On Mondays and Fridays the bill marks that night as "Tonight".
- **Menu.** No menu was found, so `data/menu.json` holds five sample pub classics, marked as placeholder in the file. Replace them with the kitchen's dishes.
- **Visit ping.** The script before `</body>` posts to `https://ntfy.sh/YOUR-NTFY-TOPIC`. Replace `YOUR-NTFY-TOPIC` with your topic. Add `?v=name` to a link to tag who opened it. Open the page once with `#me` on your own devices to stop pinging yourself.
- **Link preview.** `og:url` and `og:image` point at `https://alexwilder-dev.github.io/HennessysCamberwell/` (the capitals matter: the all-lowercase address is a 404). Instagram and other apps cache preview images by address, so if the image changes, give the file a new name and update the tags.
- Other facts used: address, the pub's names since c.1839, open 12pm–midnight seven days, Guinness at £6 a pint, sport on TV, darts and pool, sun-trap outdoor seating, buses 36, 185, 436 and N136, Google rating 4.2. There is no phone number or website, so none is shown.
- "Open now" and "Tonight" use London time. The sunset line is calculated for Camberwell; it's daylight, not the weather.
- The page is marked `noindex` so the concept doesn't turn up in search results.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Use a local server rather than opening the file directly, because the menu is loaded from `data/menu.json`.

## Deploy to GitHub Pages

Pages is set to deploy from **GitHub Actions**. Every push to `main` runs `.github/workflows/pages.yml`, which copies the site files into an artifact and publishes it. There is no build step. It can also be run by hand from the Actions tab.

All paths are relative, so the site works from `https://<user>.github.io/<repo>/`.
