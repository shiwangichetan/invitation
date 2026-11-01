/* Supabase public project settings. Never put a service_role/secret key here. */
const SUPABASE_URL = "https://xjtehcygcozgzhajecvl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rMd1m4pm3NGw7PzOLszzHQ_ABz3kk4_";

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

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (messageInput && characterCount) {
  messageInput.addEventListener("input", () => {
    characterCount.textContent = `${messageInput.value.length} / 500`;
  });
}

function renderMessage(row) {
  const card = document.createElement("article");
  card.className = "message-card";
  const message = document.createElement("p");
  message.textContent = `“${row.message}”`;
  const author = document.createElement("strong");
  author.textContent = row.guest_name;
  const date = document.createElement("time");
  date.textContent = new Date(row.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
  card.append(message, author, date);
  return card;
}

async function loadLatestWishes() {
  if (!supabaseClient || !messagesList) return;
  const { data, error } = await supabaseClient.rpc("get_public_guestbook_top5");

  if (error) {
    messagesList.innerHTML = '<p class="empty-state">Guest wishes will be available shortly.</p>';
    console.error("Could not load guestbook wishes:", error.message);
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
  data.forEach(row => messagesList.append(renderMessage(row)));
}

if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!supabaseClient) {
      statusEl.textContent = "Guestbook is temporarily unavailable. Please try again later.";
      return;
    }

    const guestName = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (guestName.length < 2 || guestName.length > 60) {
      statusEl.textContent = "Please enter a name between 2 and 60 characters.";
      nameInput.focus();
      return;
    }
    if (message.length < 2 || message.length > 500) {
      statusEl.textContent = "Please enter a message between 2 and 500 characters.";
      messageInput.focus();
      return;
    }

    submitButton.disabled = true;
    statusEl.textContent = "Publishing your wish…";
    const { error } = await supabaseClient.rpc("publish_guestbook_wish", {
      p_guest_name: guestName,
      p_message: message
    });
    submitButton.disabled = false;

    if (error) {
      statusEl.textContent = "Your wish could not be published. Please try again.";
      console.error("Guestbook submission failed:", error.message);
      return;
    }

    form.reset();
    if (characterCount) characterCount.textContent = "0 / 500";
    statusEl.textContent = "Your wish has been published. Thank you!";
    await loadLatestWishes();
  });
}

if (!supabaseClient) {
  if (submitButton) submitButton.disabled = true;
  if (statusEl) statusEl.textContent = "Guestbook is temporarily unavailable.";
} else {
  loadLatestWishes();
}
