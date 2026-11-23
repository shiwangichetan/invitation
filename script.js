
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

// Guestbook elements
const form = document.getElementById("guestbook-form");
const nameInput = document.getElementById("guest-name");
const messageInput = document.getElementById("guest-message");
const statusEl = document.getElementById("form-status");
const submitButton = document.getElementById("submit-button");
const messagesList = document.getElementById("messages-list");
const characterCount = document.getElementById("character-count");
const loadMoreButton = document.getElementById("load-more-wishes");

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Pagination settings
const WISHES_PAGE_SIZE = 5;
let wishesOffset = 0;
let wishesExhausted = false;
let wishesLoading = false;

if (messageInput && characterCount) {
  messageInput.addEventListener("input", () => {
    characterCount.textContent = `${messageInput.value.length} / 500`;
  });
}

// Render an individual wish
function renderMessage(row) {
  const card = document.createElement("article");
  card.className = "message-card";

  const message = document.createElement("p");
  message.textContent = `“${row.message}”`;

  const author = document.createElement("strong");
  author.textContent = row.guest_name;

  const date = document.createElement("time");
  date.textContent = new Date(row.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  card.append(message, author, date);
  return card;
}

// Load wishes in batches of five
async function loadWishes({ reset = false } = {}) {
  if (!supabaseClient || !messagesList || wishesLoading) return;
  if (wishesExhausted && !reset) return;

  if (reset) {
    wishesOffset = 0;
    wishesExhausted = false;
    messagesList.replaceChildren();
  }

  wishesLoading = true;

  if (loadMoreButton) {
    loadMoreButton.hidden = false;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading…";
  }

  try {
    const { data, error } = await supabaseClient.rpc(
      "get_public_guestbook_page",
      {
        p_offset: wishesOffset,
        p_limit: WISHES_PAGE_SIZE
      }
    );

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];

    if (wishesOffset === 0 && rows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "The first wishes will appear here soon.";
      messagesList.replaceChildren(empty);

      wishesExhausted = true;
      return;
    }

    // Append older wishes without removing existing ones.
    rows.forEach(row => {
      messagesList.append(renderMessage(row));
    });

    wishesOffset += rows.length;

    // Fewer than five records means there are no more pages.
    wishesExhausted = rows.length < WISHES_PAGE_SIZE;

  } catch (error) {
    console.error("Could not load guestbook wishes:", error.message || error);

    if (wishesOffset === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Guest wishes will be available shortly.";
      messagesList.replaceChildren(empty);
    } else if (statusEl) {
      statusEl.textContent = "Could not load older wishes. Please try again.";
    }

  } finally {
    wishesLoading = false;

    if (loadMoreButton) {
      loadMoreButton.hidden = wishesExhausted;
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = "Load more wishes";
    }
  }
}

// Load latest wishes from the beginning
async function loadLatestWishes() {
  await loadWishes({ reset: true });
}

// Load the next five wishes when clicked
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    loadWishes();
  });
}

// Submit a new guestbook wish
if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!supabaseClient) {
      if (statusEl) {
        statusEl.textContent =
          "Guestbook is temporarily unavailable. Please try again later.";
      }
      return;
    }

    const guestName = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (guestName.length < 2 || guestName.length > 60) {
      statusEl.textContent =
        "Please enter a name between 2 and 60 characters.";
      nameInput.focus();
      return;
    }

    if (message.length < 2 || message.length > 500) {
      statusEl.textContent =
        "Please enter a message between 2 and 500 characters.";
      messageInput.focus();
      return;
    }

    submitButton.disabled = true;
    statusEl.textContent = "Publishing your wish…";

    try {
      const { error } = await supabaseClient.rpc(
        "publish_guestbook_wish",
        {
          p_guest_name: guestName,
          p_message: message
        }
      );

      if (error) throw error;

      form.reset();

      if (characterCount) {
        characterCount.textContent = "0 / 500";
      }

      statusEl.textContent =
        "Your wish has been submitted. It will appear after approval.";

      // Refresh the first page after submission.
      await loadLatestWishes();

    } catch (error) {
      statusEl.textContent =
        "Your wish could not be submitted. Please try again.";

      console.error("Guestbook submission failed:", error.message || error);

    } finally {
      submitButton.disabled = false;
    }
  });
}

// Initialize guestbook
if (!supabaseClient) {
  if (submitButton) submitButton.disabled = true;

  if (statusEl) {
    statusEl.textContent = "Guestbook is temporarily unavailable.";
  }

  if (loadMoreButton) {
    loadMoreButton.hidden = true;
  }

} else {
  if (loadMoreButton) {
    loadMoreButton.hidden = true;
  }

  loadLatestWishes();
}
