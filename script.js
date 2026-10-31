/* Add your Supabase Project URL and publishable/anon key below.
   Never paste a service_role or secret key into this file. */
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE";

const countdownTarget = new Date("2026-12-02T00:00:00+05:30").getTime();

function updateCountdown() {
  const remaining = countdownTarget - Date.now();
  const values = {
    days: Math.max(0, Math.floor(remaining / 86400000)),
    hours: Math.max(0, Math.floor((remaining % 86400000) / 3600000)),
    minutes: Math.max(0, Math.floor((remaining % 3600000) / 60000)),
    seconds: Math.max(0, Math.floor((remaining % 60000) / 1000))
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const form = document.getElementById("guestbook-form");
const nameInput = document.getElementById("guest-name");
const messageInput = document.getElementById("guest-message");
const statusEl = document.getElementById("form-status");
const submitButton = document.getElementById("submit-button");
const messagesList = document.getElementById("messages-list");
const characterCount = document.getElementById("character-count");

messageInput.addEventListener("input", () => {
  characterCount.textContent = `${messageInput.value.length} / 500`;
});

let supabaseClient = null;
const configIsReady =
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_") &&
  window.supabase;

if (configIsReady) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  statusEl.textContent = "Guestbook setup is in progress. Please check back soon.";
  form.querySelector("button").disabled = true;
}

function showMessage(text, author, date) {
  const card = document.createElement("article");
  card.className = "message-card";
  const message = document.createElement("p");
  message.textContent = `“${text}”`;
  const name = document.createElement("strong");
  name.textContent = author;
  const time = document.createElement("time");
  time.textContent = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
  card.append(message, name, time);
  return card;
}

async function loadApprovedMessages() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("guestbook_messages")
    .select("guest_name, message, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    messagesList.innerHTML = '<p class="empty-state">Guest wishes will be available shortly.</p>';
    console.error("Could not load guestbook messages:", error.message);
    return;
  }

  messagesList.replaceChildren();
  if (!data || data.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "The first wishes will appear here soon.";
    messagesList.append(empty);
    return;
  }

  data.forEach(row => {
    messagesList.append(showMessage(row.message, row.guest_name, row.created_at));
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) return;

  const guestName = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (guestName.length < 2 || guestName.length > 60) {
    statusEl.textContent = "Please enter a name between 2 and 60 characters.";
    return;
  }
  if (message.length < 2 || message.length > 500) {
    statusEl.textContent = "Please enter a message between 2 and 500 characters.";
    return;
  }

  submitButton.disabled = true;
  statusEl.textContent = "Sending your wishes…";

  const { error } = await supabaseClient
    .from("guestbook_messages")
    .insert([{ guest_name: guestName, message, approved: false }]);

  submitButton.disabled = false;

  if (error) {
    statusEl.textContent = "Your message could not be sent. Please try again later.";
    console.error("Guestbook submission failed:", error.message);
    return;
  }

  form.reset();
  characterCount.textContent = "0 / 500";
  statusEl.textContent = "Thank you for being part of our story. Your wish will appear after approval.";
});

loadApprovedMessages();
