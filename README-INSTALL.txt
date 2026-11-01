INSTANT-PUBLICATION GUESTBOOK UPDATE

This removes email sign-in and guest editing. Guests submit a name and wish; the wish is published immediately. The public website reads only the five latest approved wishes. You can view and delete all messages in Supabase Dashboard.

INSTALLATION
1. Supabase Dashboard -> SQL Editor.
2. Paste and run supabase-guestbook-instant-publish.sql.
3. Replace the repository's existing script.js with the supplied script.js.
4. In index.html, replace:
   Messages are reviewed before they appear on this page.
   with:
   Your wish will appear on the website as soon as you send it.
5. Commit the changes and redeploy if your host does not deploy automatically.

The SQL assumes public.guestbook_messages already has id, guest_name, message,
approved, and created_at columns. Existing rows remain. Only rows with approved=true
appear publicly, and the public read function returns at most five rows.
Never put a Supabase service_role/secret key in frontend JavaScript.
