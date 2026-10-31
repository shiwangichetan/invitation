# Chetan & Shiwangi — Interactive Upgrade

This package adds the requested interactive features while keeping the existing `script.js` (including its Supabase project URL, publishable key, countdown, and moderated guestbook) unchanged.

## Files
- `interactive.js` — opening animation, gallery lightbox, calendar links, RSVP submission, optional music control, and sharing.
- `index-additions.html` — HTML blocks and exact insertion points.
- `style-additions.css` — append to the end of the existing `style.css`.
- `supabase-rsvp.sql` — create the private RSVP table and insert-only policy.

## Apply to the current GitHub repository

1. Upload `interactive.js` to the repository root (same level as `index.html`).
2. In `index.html`, add the blocks from `index-additions.html` at the labeled positions. Do not remove the existing content or existing inline family selector.
3. Add this script include immediately after the existing `script.js` include:
   `<script defer src="interactive.js"></script>`
4. Append `style-additions.css` to the bottom of the existing `style.css`.
5. Run `supabase-rsvp.sql` once in Supabase Dashboard → SQL Editor → New query → Run.
6. Keep `script.js` and `supabase-setup.sql` unchanged. The existing guestbook and its credentials are not replaced.
7. Commit and wait for Cloudflare to deploy.

## Existing photo files
The gallery uses the two files already in your repository root:
- `shiwangi.webp`
- `chetan.webp`

Do not move them into an `assets` folder unless you also update the two `src` and `data-full` paths in the HTML.

## Optional music
The player is ready, but a music track has not been supplied. Upload a track you own or have permission to use as `wedding-music.mp3` in the repository root. The player does not autoplay.

## RSVP privacy
The SQL creates `public.wedding_rsvps`, enables row-level security, and grants anonymous visitors insert-only access. RSVP records are not publicly readable. Review them in Supabase Dashboard → Table Editor → wedding_rsvps.

## Features included
- Royal envelope opening overlay with skip option.
- Bride and groom gallery with full-screen lightbox.
- RSVP: name, attendance, guest count, and selected ceremonies.
- Add-to-Google-Calendar link generated for each existing event card.
- Existing bride/groom ceremony selector remains interactive.
- Optional click-to-play MP3 player.
- Native device sharing on supported phones, with WhatsApp fallback.
- Existing moderated guestbook behavior remains in the current `script.js`.

## Performance
No animation library is added. Gallery images use the existing compressed WebP files and lazy loading. Music is not downloaded until a guest presses Play.
