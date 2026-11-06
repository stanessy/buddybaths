# buddybaths.com

Customer-facing site for **Buddy Baths**, a registered trade name of Buddy Built LLC.
Cloned from the Buddy Fence site (`~/buddyfence`, itself cloned from `~/buddytile`): same
zero-dependency generator, same brand system, one-day shower content.

The manufacturer is deliberately NOT named anywhere on the site (Stan, 2026-11-05).
We are a dealer/installer and may use their product photography and material claims.
Everything in `assets/img/*.jpg` and `assets/img/swatches/` came from their dealer site on 2026-11-04.

## How it works

- `src/data.js` holds ALL copy: services, cities, promise, steps, testimonials, design catalog,
  legal line. Edit there, never in `docs/`.
- `node build.js` renders `docs/` (Coolify serves it through nginx, see `Dockerfile`).
  Pages: home, 7 services, 6 cities (`/shower-remodel/{city}/`), 42 service-in-city pages,
  `/design-options/`, about, pay, privacy, plus sitemap/robots/CNAME.
- Lead form posts to `buddybuilt.com/api/public/leads`. The division id is resolved at
  runtime from `GET /api/public/divisions` by slug `baths` (set `window.BT_DIVISION_ID` to
  pin it, or `window.BT_API_BASE` to point at another API).
- `npm run preview` builds and serves on :4302. `npm run refresh` pulls portfolio
  projects (`?division=baths`), Google reviews, and blog posts from the platform, then rebuilds.

## Two paths (2026-11-05)

The home page is a split hero: one-day showers (ocean blue) vs custom bathrooms (sage, the
Buddy Tile look). Each path is a real page (`/one-day-showers/`, `/custom-bathrooms/`) built
from `PATHS` in `src/data.js`; `<html data-path>` switches the accent tokens in `styles.css`.
Services carry `path: 'one-day' | 'custom'`. The visitor's last path is remembered in
localStorage and pre-expanded on the home page.

## Before launch

- Platform: the `baths` division must exist in prod. `server/scripts/seed.js` in buddybuilt
  has it (slug `baths`, prefix `BBA`); run the seed in prod after deploying the platform.
- Service FAQ price range is $9,000-$17,000 installed (set by Stan 2026-11-04).
- Swap the placeholder testimonials in `src/data.js` for real reviews.
- Confirm `info@buddybaths.com` mailbox and point DNS (A/AAAA @ + www) at the Coolify server.
- Coolify app: Build strategy **Dockerfile**, port **80**, domains buddybaths.com + www.

## Online booking (2026-11-05)

Every lead form carries a collapsed "Pick your visit time" block (`bookingBlock()` in build.js) and `/book/` is the
same calendar as a page. Open times come from the platform (`GET /api/public/availability?divisionId=`), a picked
time posts the form to `POST /api/public/book` (lead + estimate visit + team alerts + homeowner confirmation in one
call); without a time the form posts to `/api/public/leads` as before. Site constants live in `BT_BOOK` at the top of
the lead-submit code in `src/main.js`; the widget JS and CSS are shared verbatim with buddytile and buddyfence.
Days, hours, blocked dates and bookable estimators are set in the platform: Settings → Estimates & visits → Online booking.
