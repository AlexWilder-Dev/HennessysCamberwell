# Hennessy’s, Camberwell: website concept

A static, single-page concept site for Hennessy’s, the Victorian corner pub at 225 Camberwell New Road, London SE5 0TH.

This is a demo. There is no CMS, database, payment system or form handling. The menu, the week view and the sunset panel all run in the browser from static data.

## Structure

```
index.html          the page
css/styles.css      styles
js/main.js          open-now status, navigation, rolling week view, sunset panel, menu, timeline, photo slots
data/menu.json      sample menu (placeholder, see below)
fonts/              Libre Caslon Display and Libre Caslon Text (SIL Open Font License)
photos/             venue photography goes here (see below)
og.png              link preview image (1200 × 630)
favicon.svg
```

## Photos

Every photo on the page is a labelled slot. Put a JPEG in `photos/` with the matching name and it appears in place of the slot without any code changes. Missing files leave the slot as it is.

| File | Section | Shape | Minimum size |
| --- | --- | --- | --- |
| `photos/frontage.jpg` | Hero: the corner building and sign | Landscape 4:3 | 2000 × 1500 |
| `photos/pint.jpg` | The pint: a settled Guinness on the bar | Portrait 4:5 | 1200 × 1500 |
| `photos/bar.jpg` | What’s on: the room, darts board or pool table | Landscape 3:2 | 1800 × 1200 |
| `photos/outside.jpg` | Outside: the sun-trap seating | Landscape 3:2 | 1800 × 1200 |
| `photos/food.jpg` | Food: a plate from the kitchen | Landscape 4:3 | 1600 × 1200 |

Photos are cropped to fill their slot, so keep the subject near the middle. Aim for 200–400 KB per file.

The colours and lettering are stout black and cream with a Caslon serif. Once real photos of the signage are in, the palette in `css/styles.css` (`:root`) can be matched to it.

## Placeholders

- **Menu.** No menu was found, so `data/menu.json` holds five sample pub classics, marked as placeholder. Replace the items with the kitchen’s dishes. The page also labels it “Sample menu”: remove the `.sample-tag` line in `index.html` once it’s real.
- **Reviews.** Three empty slots under the 4.2 Google rating in `index.html`. For each one, paste the review text into the `<p>`, the reviewer’s name and date into `<figcaption>`, then remove the `review--empty` class.
- **Visit ping.** The script before `</body>` posts to `https://ntfy.sh/YOUR-NTFY-TOPIC`. Replace `YOUR-NTFY-TOPIC` with your topic. Add `?v=name` to a link to tag who opened it. Open the page once with `#me` on your own devices to stop pinging yourself.
- **Link preview.** `og:url` and `og:image` assume the site is served at `https://alexwilder-dev.github.io/HennessysCamberwell/`. Update both if the address is different.

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

In the repository, go to **Settings → Pages**, set **Source** to **Deploy from a branch**, and choose `main` and `/ (root)`. There is no build step. All paths are relative, so the site works from `https://<user>.github.io/<repo>/`.
