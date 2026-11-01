# CHETAN & SHIWANGI — integrated wedding invitation

This package contains the existing website with the royal interactive additions merged into the live page files.

## Included
- Opening invitation envelope
- Couple photo gallery and lightbox
- RSVP form connected to the separate `wedding_rsvps` Supabase table
- Add-to-Google-Calendar links on the existing event cards
- Optional music player (requires your own licensed MP3)
- Native sharing on supported devices and WhatsApp fallback
- Existing guestbook, family details, dates, venue text, map links, and responsive styles retained

## Deploy to GitHub
1. Extract this ZIP.
2. Open your `shiwangichetan/invitation` repository.
3. Upload the files from inside the `invitation-main` folder to the repository root.
4. Choose **Commit changes** and replace the existing `index.html`, `style.css`, and `interactive.js` when GitHub asks.
5. Keep the existing Supabase credentials in `script.js`. Do not replace them with a secret/service-role key.
6. Wait for your Cloudflare deployment to finish, then hard-refresh the website (Ctrl+Shift+R / Cmd+Shift+R).

## Enable RSVP storage (one-time)
1. Open Supabase Dashboard → SQL Editor.
2. Run `supabase-rsvp.sql` once.
3. Test the RSVP form on the deployed site.
4. View responses in Supabase → Table Editor → `wedding_rsvps`.

RSVP rows are private: visitors can submit, but the public site cannot read or modify RSVP records. No email notifications are configured.

## Guestbook moderation
The existing guestbook is unchanged. New wishes are stored with `approved = false` and are not shown publicly until approved. In Supabase → Table Editor → `guestbook_messages`, change `approved` to `true` for a message you want to publish. No approval email is configured.

## Optional music
Add a music file you own or are licensed to use, named `wedding-music.mp3`, to the repository root. The player is user-initiated; it does not autoplay.

## Important
The venue labels and map URLs in the original website have been preserved as supplied in that repository. Review them before sharing the invitation publicly.
