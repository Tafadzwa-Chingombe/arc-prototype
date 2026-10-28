# Adult Rape Clinic (ARC) website prototype

A clickable prototype of a redesigned website for the Adult Rape Clinic, Harare, Zimbabwe, prepared by **iContact Africa Solutions** to accompany a tender proposal.

> ⚠️ **Verify before any public use.** All phone numbers, addresses, opening hours, email addresses and statistics in this prototype must be confirmed with ARC first. Items marked `[Confirm with ARC]`, `[Figure]`, `[Name]` and `[Partner name]` are placeholders.

This is a **demonstration only**. It has no backend, collects no data, and the contact form and CMS send nothing anywhere.

---

## How to run

There's no build step and nothing to install.

- **Locally:** open `index.html` in any browser (double-click works, `file://` is fine).
- **On a server:** copy the whole `arc-prototype/` folder anywhere, for example `public/demos/arc/`, and link to `demos/arc/index.html`. All paths are relative, so it works under any subfolder.
- **Demo CMS:** open `admin/index.html`, or use "View site" / "Dashboard" to move between the public site and the CMS.

To start the demo over, use **Content → Reset demo data** in the CMS, or clear the site data in your browser.

---

## 3-minute demo script

1. **Phone-sized window (≈360px).** Open `index.html`. Point out the red **emergency bar** (free 24-hour line 08080472, Call and WhatsApp) and the **Quick exit** button at the bottom right. Both appear on every page.
2. **Tap "Get help now".** Scroll through the plain-language guide: "If you are in danger right now", what to do after an assault, **the 72-hour window** ("…you can still come for care and counselling"), what to expect at the clinic, and the FAQ.
3. **Open Locations.** Filter by city (for example Mutare), tap a phone number, then tap **Get directions** (opens Google Maps). Tap **Show map** to show that maps only load when asked for, which saves data.
4. **Press Esc twice quickly.** The site is replaced with a Google weather search. Press Back: you don't return to the ARC page.
5. **Open `/admin/` → Content → Hotlines.** Change the 24-Hour Toll-Free Line number and press **Save hotlines**. The toast reads "Saved. Updated on 15 pages." Click **View site**: the emergency bar and every call button now show the new number. (Reset demo data afterwards.)
6. **Admin → Posts → New post.** Add a title and body, choose an image, and leave **Alt text** empty. Press **Submit for review**. The **accessibility checker** blocks it ("Must fix: … has no alt text") and also warns about "click here" and ALL-CAPS headings. Add alt text and submit again. Then press **Approve & publish** in the table and open **News**: the post is now live. Show the **Activity log**.

---

## What's included

| Area | Files |
|---|---|
| Public pages (15) | `index`, `get-help`, `services`, `locations`, `about`, `resources`, `news`, `news-article`, `get-involved`, `partners`, `contact`, `safe-browsing`, `privacy`, `accessibility`, `404` |
| Demo CMS | `admin/index.html` (dashboard), `admin/content.html` (hotlines, locations, statistics), `admin/posts.html` (editorial workflow and accessibility checker), `admin/activity.html` |
| Content | `js/data.js`: the single source of truth for hotlines, locations, stats, services, posts and resources |
| Behaviour | `js/main.js` (public site), `js/admin.js` (CMS) |
| Styles | `css/style.css` (public site), `css/admin.css` (CMS) |
| Icons | `assets/icons.svg` (sprite of every icon used). Pages inline their icons because browsers block external SVG sprites on `file://` |

### How "update once, change everywhere" works

- Every page has the real numbers hard-coded in HTML, so the site works with JavaScript off.
- `main.js` then replaces anything marked `data-hl`, `data-hl-tel`, `data-wa` or `data-render` with values from `js/data.js`.
- Edits made in the CMS are saved to `localStorage` under `arc_demo_overrides` and merged over the defaults. They affect that browser only. The activity log uses `arc_demo_activity`. Every storage call is wrapped in try/catch, so the site falls back to the defaults if storage is blocked.
- For production, the same `data-*` hooks would be filled by the real CMS.

### Editorial workflow

Draft → **Submit for review** → **Approve & publish** (or **Return to draft**). Only published posts appear on `news.html` and the home page. If a publish date is in the future, an approved post shows as **Scheduled** and appears on the site from that time.

The accessibility checker runs on submit and on approval:

- **Blocks:** empty title; an image with no alt text.
- **Warns:** "click here" or "read more" link text; ALL-CAPS title or headings (body lines that start with `## `).

---

## Design system

All colours, type sizes and spacing are CSS custom properties on `:root` in `css/style.css`. To apply ARC's brand, swap the values in that one place.

- **Palette (placeholder):** primary `#4B2E83`, emergency `#B3261E`.
- **Contrast change:** the specified teal accent `#0E8C8C` is only 4.1:1 on white, below the 4.5:1 needed for text. It was darkened to `#0B7373` (5.7:1).
- **Light theme only:** the site always uses the light theme, to match the Figma designs, even when the device is in dark mode.
- **Type:** system font stack, 18px base, line height 1.6, line length capped at about 70 characters.
- **Breakpoints:** mobile first, with changes at 640px, 960px and 1200px. The main nav collapses into a menu below 1200px so all eight items fit without crowding.
- **Size:** touch targets are at least 44 × 44px. Focus is shown with a 3px outline plus a yellow halo. `prefers-reduced-motion` is respected.

---

## Accessibility and safety notes

- **Navigation:** a skip link, landmarks, one H1 per page, no skipped heading levels, descriptive link text, and `aria-current` on the current page.
- **Focus Not Obscured (WCAG 2.2):** `scroll-padding-top` and `scroll-padding-bottom` keep focused items clear of the sticky emergency bar and the mobile Quick exit button.
- **Mobile menu:** a real `<button aria-expanded aria-controls>`. Focus is trapped while the menu is open, Esc closes it, and focus returns to the button. Without JavaScript, a "Menu" link jumps to the footer site map instead, so there's no layout shift when scripts load.
- **Quick exit:** uses `window.location.replace()`, so the ARC page leaves the browser history. It is also a real link for no-JS users. Pressing Esc twice within one second triggers it; a single Esc still closes menus and hides the hint.
- **Forms:** visible labels, required fields marked in text, inline errors linked with `aria-describedby`, and `aria-live` status messages.
- **Content:** no stock photos, real logos, payment fields or survivor stories. The news posts are neutral and labelled "Sample content".
- **Privacy and performance:** no external fonts, CDNs or trackers. Maps load only on request. Pages use no inline scripts or `onclick` handlers, so they run under a strict `script-src 'self'` Content Security Policy. A few inline `style` attributes remain; add `style-src 'unsafe-inline'` or move them into the stylesheet if the host's policy also restricts styles.
- **Search engines:** every page has `<meta name="robots" content="noindex">` because it is a prototype. Remove this before launch.

---

## QA results

These checks ran automatically (Playwright + axe-core) on every page:

- [x] Every page opens from `file://`, and from a subfolder over HTTP with a strict CSP, with no console errors.
- [x] The 24-hour hotline is visible without scrolling on every page at 360px wide.
- [x] Quick exit works by click and by double-Esc, and Back does not return to the page.
- [x] Changing the primary hotline in the CMS updates the emergency bar on all 15 public pages.
- [x] A post only appears on news.html after it is approved and published.
- [x] The accessibility checker blocks a post with an image but no alt text.
- [x] axe-core (WCAG 2.0/2.1/2.2 A and AA, plus best practice) finds no violations on any page.
- [x] Keyboard: the mobile menu traps focus and returns it, the CMS tabs work with the arrow keys, and focused elements are never hidden.
- [x] Pages reflow at 320px, and at 200% text size, with no horizontal scrolling. Pinch-zoom is never disabled.
- [x] The home page is well under 300 KB (about 80 KB in total, HTML + CSS + JS).
- [x] The contact form shows "Prototype only: this message was not sent." and makes no network requests.
- [x] The site works with JavaScript disabled and with browser storage blocked.

**Still to do by hand:** run Lighthouse on a hosted copy to confirm a mobile performance score of 90 or more, and test with a screen reader (TalkBack and VoiceOver).
