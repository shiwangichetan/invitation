
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

// Supabase connection
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Pagination configuration
const WISHES_PAGE_SIZE = 5;
let wishesOffset = 0;
let wishesExhausted = false;
let wishesLoading = false;

// Character counter
if (messageInput && characterCount) {
  messageInput.addEventListener("input", () => {
    characterCount.textContent =
      `${messageInput.value.length} / 500`;
  });
}

// Render one wish
function renderMessage(row) {
  const card = document.createElement("article");
  card.className = "message-card";

  const message = document.createElement("p");
  message.textContent = `“${row.message}”`;

  const author = document.createElement("strong");
  author.textContent = row.guest_name;

  const date = document.createElement("time");
  date.dateTime = row.created_at;
  date.textContent = new Date(row.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

  card.append(message, author, date);
  return card;
}

// Update Load More button
function updateLoadMoreButton({
  visible,
  disabled = false,
  label = "Load more wishes"
}) {
  if (!loadMoreButton) return;

  loadMoreButton.hidden = !visible;
  loadMoreButton.disabled = disabled;
  loadMoreButton.textContent = label;
}

// Load wishes in batches of five
async function loadWishes({ reset = false } = {}) {
  if (!supabaseClient || !messagesList || wishesLoading) return;

  if (wishesExhausted && !reset) return;

  if (reset) {
    wishesOffset = 0;
    wishesExhausted = false;
    messagesList.replaceChildren();
    updateLoadMoreButton({ visible: false });
  }

  wishesLoading = true;

  updateLoadMoreButton({
    visible: wishesOffset > 0,
    disabled: true,
    label: "Loading…"
  });

  try {
    // Fetch one extra record to determine whether another page exists.
    const { data, error } = await supabaseClient.rpc(
      "get_public_guestbook_page",
      {
        p_offset: wishesOffset,
        p_limit: WISHES_PAGE_SIZE + 1
      }
    );

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];

    if (rows.length === 0 && wishesOffset === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "The first wishes will appear here soon.";

      messagesList.replaceChildren(empty);
      wishesExhausted = true;
      updateLoadMoreButton({ visible: false });
      return;
    }

    // Display only five records, even though we fetch six.
    const visibleRows = rows.slice(0, WISHES_PAGE_SIZE);

    // Append instead of replacing existing wishes.
    visibleRows.forEach(row => {
      messagesList.append(renderMessage(row));
    });

    // Advance by the number of displayed records.
    wishesOffset += visibleRows.length;

    // The extra record tells us whether more wishes exist.
    wishesExhausted = rows.length <= WISHES_PAGE_SIZE;

    updateLoadMoreButton({
      visible: !wishesExhausted
    });

  } catch (error) {
    console.error("Guestbook loading failed:", error);

    if (wishesOffset === 0) {
      const errorMessage = document.createElement("p");
      errorMessage.className = "empty-state";
      errorMessage.textContent =
        "Guest wishes are temporarily unavailable.";

      messagesList.replaceChildren(errorMessage);
    }

    updateLoadMoreButton({
      visible: wishesOffset > 0,
      label: "Try again"
    });

  } finally {
    wishesLoading = false;

    if (loadMoreButton && !loadMoreButton.hidden) {
      loadMoreButton.disabled = false;
      if (loadMoreButton.textContent === "Loading…") {
        loadMoreButton.textContent = "Load more wishes";
      }
    }
  }
}

// Always start with the latest five wishes
async function loadLatestWishes() {
  await loadWishes({ reset: true });
}

// Load next five on click
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    loadWishes();
  });
}

// Submit a new wish
if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!supabaseClient) {
      if (statusEl) {
        statusEl.textContent =
          "Guestbook is temporarily unavailable.";
      }
      return;
    }

    if (!nameInput || !messageInput || !submitButton) return;

    const guestName = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (guestName.length < 2 || guestName.length > 60) {
      if (statusEl) {
        statusEl.textContent =
          "Please enter a name between 2 and 60 characters.";
      }
      nameInput.focus();
      return;
    }

    if (message.length < 2 || message.length > 500) {
      if (statusEl) {
        statusEl.textContent =
          "Please enter a message between 2 and 500 characters.";
      }
      messageInput.focus();
      return;
    }

    submitButton.disabled = true;

    if (statusEl) {
      statusEl.textContent = "Publishing your wish…";
    }

    try {
      const { error } = await supabaseClient.rpc(
        "publish_guestbook_wish",
        {
          p_guest_name: guestName,
          p_message: message
        }
      );

      if (error) throw error;

      // Reset form and character counter.
      form.reset();

      if (characterCount) {
        characterCount.textContent = "0 / 500";
      }

      // No approval or success message.
      if (statusEl) {
        statusEl.textContent = "";
      }

      // Refresh latest five so the new wish appears at the top.
      await loadLatestWishes();

    } catch (error) {
      console.error("Guestbook submission failed:", error);

      if (statusEl) {
        statusEl.textContent =
          "Your wish could not be submitted. Please try again.";
      }

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

  updateLoadMoreButton({ visible: false });

} else {
  updateLoadMoreButton({ visible: false });
  loadLatestWishes();
}

async function showLessWishes() {
  if (!messagesList || wishesLoading) return;

  const cards = messagesList.querySelectorAll(".message-card");

  cards.forEach((card, index) => {
    if (index >= WISHES_PAGE_SIZE) {
      card.remove();
    }
  });

  wishesOffset = Math.min(
    WISHES_PAGE_SIZE,
    messagesList.querySelectorAll(".message-card").length
  );

  wishesExhausted = false;

  updateLoadMoreButton({ visible: true });

  document.getElementById("wishes")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
