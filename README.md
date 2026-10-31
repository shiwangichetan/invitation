# CHETAN & SHIWANGI wedding invitation

A static wedding invitation with a Supabase-powered guestbook.

## Files
- `index.html` — page structure and invitation content
- `style.css` — responsive styling
- `script.js` — countdown and guestbook integration
- `supabase-setup.sql` — database table and security policies
- `favicon.svg` — browser icon

## 1. Create the guestbook database
1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase-setup.sql`.
4. Open Project Settings / API Keys.
5. Copy the Project URL and the publishable key (or legacy anon key).

## 2. Configure the website
Open `script.js` and replace:
- `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`
- `PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE`

Use only the publishable/anon key. Never use a service_role or secret key in browser code.

## 3. Upload to GitHub
Upload all files in this folder to the root of your GitHub repository and commit the changes.

## 4. Deploy with Cloudflare Pages
1. In Cloudflare Dashboard, open Workers & Pages.
2. Create application > Pages > Connect to Git.
3. Select your GitHub repository.
4. Framework preset: None.
5. Build command: leave blank.
6. Build output directory: `/`.
7. Deploy.

After every GitHub commit, Cloudflare Pages will deploy the updated site.

## 5. Moderate guest wishes
Open Supabase Dashboard > Table Editor > guestbook_messages.
Review new rows and set `approved` to `true` to publish a wish. Leave it `false` to keep it hidden.

## Notes
- The countdown targets midnight at the start of 2 December 2026, India time.
- The Deoghar and other venue links currently search the venue names. Replace them with exact Google Maps share links when you have the precise pins.
- The guestbook is not a spam-proof public messaging system. Before sharing widely, consider adding CAPTCHA/Turnstile and server-side rate limiting. The SQL length checks and RLS policies protect basic data access, not abuse volume.
- Supabase Free projects may pause after a period of inactivity. Check the project status periodically.
