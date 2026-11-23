
/* =========================================================
   SUPABASE CONFIGURATION
   Never expose a service_role or secret key in frontend code.
========================================================= */

const SUPABASE_URL =
  "https://xjtehcygcozgzhajecvl.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_rMd1m4pm3NGw7PzOLszzHQ_ABz3kk4_";


/* =========================================================
   COUNTDOWN
========================================================= */

const countdownTarget =
  new Date("2026-12-02T00:00:00+05:30").getTime();

function updateCountdown() {
  const remaining = countdownTarget - Date.now();

  const values = {
    days: Math.max(0, Math.floor(remaining / 86400000)),
    hours: Math.max(
      0,
      Math.floor((remaining % 86400000) / 3600000)
    ),
    minutes: Math.max(
      0,
      Math.floor((remaining % 3600000) / 60000)
    ),
    seconds: Math.max(
      0,
      Math.floor((remaining % 60000) / 1000)
    )
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = String(value).padStart(2, "0");
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* =========================================================
   GUESTBOOK ELEMENTS
========================================================= */

const form = document.getElementById("guestbook-form");
const nameInput = document.getElementById("guest-name");
const messageInput = document.getElementById("guest-message");
const statusEl = document.getElementById("form-status");
const submitButton = document.getElementById("submit-button");

const messagesList = document.getElementById("messages-list");
const characterCount = document.getElementById("character-count");

const loadMoreButton =
  document.getElementById("load-more-wishes");

const seeLessButton =
  document.getElementById("see-less-wishes");


/* =========================================================
   SUPABASE CONNECTION
========================================================= */

const supabaseClient = window.supabase
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  : null;


/* =========================================================
   PAGINATION CONFIGURATION
========================================================= */

const WISHES_PAGE_SIZE = 5;

let wishesOffset = 0;
let wishesExhausted = false;
let wishesLoading = false;


/* =========================================================
   CHARACTER COUNTER
========================================================= */

if (messageInput && characterCount) {
  messageInput.addEventListener("input", () => {
    characterCount.textContent =
      `${messageInput.value.length} / 500`;
  });
}


/* =========================================================
   RENDER ONE WISH
========================================================= */

function renderMessage(row) {
  const card = document.createElement("article");
  card.className = "message-card";

  const message = document.createElement("p");
  message.textContent = `“${row.message}”`;

  const author = document.createElement("strong");
  author.textContent = row.guest_name;

  const date = document.createElement("time");
  date.dateTime = row.created_at;

  date.textContent = new Date(
    row.created_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  card.append(message, author, date);

  return card;
}


/* =========================================================
   LOAD MORE BUTTON CONTROL
========================================================= */

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


/* =========================================================
   SEE LESS BUTTON CONTROL
========================================================= */

function updateSeeLessButton() {
  if (!seeLessButton || !messagesList) return;

  const totalCards =
    messagesList.querySelectorAll(".message-card").length;

  seeLessButton.hidden =
    totalCards <= WISHES_PAGE_SIZE;
}


/* =========================================================
   LOAD WISHES IN BATCHES OF FIVE
========================================================= */

async function loadWishes({ reset = false } = {}) {
  if (!supabaseClient || !messagesList || wishesLoading) {
    return;
  }

  if (wishesExhausted && !reset) {
    return;
  }

  if (reset) {
    wishesOffset = 0;
    wishesExhausted = false;

    messagesList.replaceChildren();

    updateLoadMoreButton({ visible: false });

    if (seeLessButton) {
      seeLessButton.hidden = true;
    }
  }

  wishesLoading = true;

  updateLoadMoreButton({
    visible: wishesOffset > 0,
    disabled: true,
    label: "Loading…"
  });

  try {
    /*
      Fetch six records:
      - Display five.
      - Use the sixth to check whether older wishes exist.
    */

    const { data, error } = await supabaseClient.rpc(
      "get_public_guestbook_page",
      {
        p_offset: wishesOffset,
        p_limit: WISHES_PAGE_SIZE + 1
      }
    );

    if (error) {
      throw error;
    }

    const rows = Array.isArray(data) ? data : [];

    /* No wishes available */

    if (rows.length === 0 && wishesOffset === 0) {
      const empty = document.createElement("p");

      empty.className = "empty-state";
      empty.textContent =
        "The first wishes will appear here soon.";

      messagesList.replaceChildren(empty);

      wishesExhausted = true;

      updateLoadMoreButton({ visible: false });

      if (seeLessButton) {
        seeLessButton.hidden = true;
      }

      return;
    }

    /* Display only five records */

    const visibleRows =
      rows.slice(0, WISHES_PAGE_SIZE);

    visibleRows.forEach(row => {
      messagesList.append(renderMessage(row));
    });

    /* Update pagination offset */

    wishesOffset += visibleRows.length;

    /* Determine whether older wishes exist */

    wishesExhausted =
      rows.length <= WISHES_PAGE_SIZE;

    updateLoadMoreButton({
      visible: !wishesExhausted
    });

    updateSeeLessButton();

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


/* =========================================================
   LOAD LATEST FIVE WISHES
========================================================= */

async function loadLatestWishes() {
  await loadWishes({ reset: true });
}


/* =========================================================
   LOAD MORE BUTTON CLICK
========================================================= */

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    loadWishes();
  });
}


/* =========================================================
   SEE LESS BUTTON CLICK
========================================================= */

function showLessWishes() {
  if (!messagesList || wishesLoading) return;

  const cards =
    messagesList.querySelectorAll(".message-card");

  const hadMoreThanFive = cards.length > WISHES_PAGE_SIZE;
  const hadUnloadedOlderWishes = !wishesExhausted;

  /* Remove everything after the latest five */

  cards.forEach((card, index) => {
    if (index >= WISHES_PAGE_SIZE) {
      card.remove();
    }
  });

  /* Reset offset to continue from the sixth record */

  wishesOffset = Math.min(
    WISHES_PAGE_SIZE,
    cards.length
  );

  /*
    Older wishes can be fetched again if:
    - More than five had already been displayed, OR
    - More older wishes were still available.
  */

  wishesExhausted =
    !(hadMoreThanFive || hadUnloadedOlderWishes);

  updateLoadMoreButton({
    visible: !wishesExhausted
  });

  updateSeeLessButton();

  /* Scroll back to guestbook */

  document.getElementById("wishes")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

if (seeLessButton) {
  seeLessButton.addEventListener(
    "click",
    showLessWishes
  );
}


/* =========================================================
   SUBMIT A NEW WISH
========================================================= */

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

    if (!nameInput || !messageInput || !submitButton) {
      return;
    }

    const guestName = nameInput.value.trim();
    const message = messageInput.value.trim();

    /* Validate guest name */

    if (guestName.length < 2 || guestName.length > 60) {
      if (statusEl) {
        statusEl.textContent =
          "Please enter a name between 2 and 60 characters.";
      }

      nameInput.focus();
      return;
    }

    /* Validate message */

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

      if (error) {
        throw error;
      }

      /* Reset form silently */

      form.reset();

      if (characterCount) {
        characterCount.textContent = "0 / 500";
      }

      if (statusEl) {
        statusEl.textContent = "";
      }

      /*
        Refresh latest five.
        The new wish should appear at the top
        if the database publishing function succeeds.
      */

      await loadLatestWishes();

    } catch (error) {
      console.error(
        "Guestbook submission failed:",
        error
      );

      if (statusEl) {
        statusEl.textContent =
          "Your wish could not be submitted. Please try again.";
      }

    } finally {
      submitButton.disabled = false;
    }
  });
}


/* =========================================================
   INITIALIZE GUESTBOOK
========================================================= */

if (!supabaseClient) {
  if (submitButton) {
    submitButton.disabled = true;
  }

  if (statusEl) {
    statusEl.textContent =
      "Guestbook is temporarily unavailable.";
  }

  updateLoadMoreButton({ visible: false });

  if (seeLessButton) {
    seeLessButton.hidden = true;
  }

} else {
  updateLoadMoreButton({ visible: false });

  if (seeLessButton) {
    seeLessButton.hidden = true;
  }

  loadLatestWishes();
}
