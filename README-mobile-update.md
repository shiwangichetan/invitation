# CHETAN & SHIWANGI — Mobile-friendly update

This package includes the latest wedding invitation design with an additional mobile layout pass.

## Files to publish
- `index.html`
- `style.css`

The two couple portraits are embedded directly in `index.html`, so they do not rely on an `assets` folder or image path.

## Important
Keep your existing `script.js` unchanged. It contains the Supabase guestbook configuration and behavior. This ZIP does not include or replace it.

## Publish
Replace `index.html` and `style.css` in the root of the GitHub repository and commit the changes. Cloudflare should redeploy from GitHub. After deployment, refresh the site on your phone; if an older version remains cached, clear the browser cache or open the site in a private tab.

## Mobile improvements
- Header navigation wraps cleanly and remains readable on narrow screens.
- Portraits use a consistent responsive crop and side-by-side layout.
- Hero title, date range, and Ganesha watermark scale down without horizontal overflow.
- Event cards and family details become single-column layouts.
- Celebration tabs, map links, and guestbook controls have larger touch targets.
- Guestbook form and submit area stack vertically on phones.
- Extra narrow-screen rules cover devices around 320–380px wide.
- Reduced-motion preferences are respected by the existing stylesheet.
