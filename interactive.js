
document.addEventListener("DOMContentLoaded", () => {

  // Wedding music and opening envelope
  const gate = document.getElementById("invite-gate");
  const audio = document.getElementById("wedding-audio");
  const musicButton = document.getElementById("music-toggle");

  if (musicButton) {
    musicButton.textContent = "Ⅱ Pause music";
    musicButton.setAttribute("aria-pressed", "true");
  }

  const openGate = () => {
    if (!gate) return;

    gate.classList.add("is-opening");

    // Start music directly from the visitor's click.
    if (audio) {
      audio.play()
        .then(() => {
          if (musicButton) {
            musicButton.textContent = "Ⅱ Pause music";
            musicButton.setAttribute("aria-pressed", "true");
          }
        })
        .catch((error) => {
          console.error("Wedding music could not start:", error);
          const status = document.getElementById("music-status");
          if (status) {
            status.textContent = "Music could not start. Please check the audio file.";
          }
        });
    }

    window.setTimeout(() => gate.remove(), 850);
  };

  document.getElementById("open-invitation")
    ?.addEventListener("click", openGate);

  document.getElementById("skip-invitation")
    ?.addEventListener("click", openGate);


  // Pause and resume music
  musicButton?.addEventListener("click", async () => {
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        musicButton.textContent = "Ⅱ Pause music";
        musicButton.setAttribute("aria-pressed", "true");
      } catch (error) {
        console.error("Music playback failed:", error);
      }
    } else {
      audio.pause();
      musicButton.textContent = "♫ Resume music";
      musicButton.setAttribute("aria-pressed", "false");
    }
  });


  // Photo gallery lightbox
  const dialog = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");

  document.querySelectorAll(".gallery-photo").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.dataset.full;

      if (!dialog || !lightboxImage || !image) return;

      lightboxImage.src = image;
      lightboxImage.alt =
        button.querySelector("img")?.alt || "Couple portrait";

      if (dialog.showModal) dialog.showModal();
    });
  });

  document.getElementById("close-lightbox")
    ?.addEventListener("click", () => dialog?.close());

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });


  // Google Calendar links
  const months = {
    january: "01", february: "02", march: "03",
    april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09",
    october: "10", november: "11", december: "12"
  };

  const toDate = (text) => {
    const match = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);

    return match
      ? `${match[3]}${months[match[2].toLowerCase()]}${match[1].padStart(2, "0")}`
      : null;
  };

  document.querySelectorAll(".event-card").forEach((card) => {
    const title = card.querySelector("h4")?.textContent.trim();
    const date = toDate(
      card.querySelector(".event-date")?.textContent || ""
    );

    if (!title || !date || card.querySelector(".calendar-link")) return;

    const venue =
      card.querySelector(".venue")?.innerText.replace(/\n/g, ", ") || "";

    const extra =
      card.querySelector(".dinner-time")?.textContent || "";

    const end = new Date(
      Date.UTC(
        +date.slice(0, 4),
        +date.slice(4, 6) - 1,
        +date.slice(6, 8) + 1
      )
    ).toISOString().slice(0, 10).replaceAll("-", "");

    const link = document.createElement("a");
    link.className = "calendar-link";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "＋ Add to calendar";

    link.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
      encodeURIComponent(`${title} · Chetan & Shiwangi`) +
      `&dates=${date}/${end}` +
      `&details=${encodeURIComponent(
        "Chetan & Shiwangi wedding celebration. " + extra
      )}` +
      `&location=${encodeURIComponent(venue)}`;

    card.append(link);
  });


  // Invitation sharing
  const share = () => {
    const info = {
      title: "Chetan & Shiwangi — Wedding Invitation",
      text: "With the blessings of our families, join us for Chetan & Shiwangi's wedding celebrations, 29 November – 5 December 2026.",
      url: window.location.href.split("#")[0]
    };

    if (navigator.share) {
      navigator.share(info).catch(() => {});
    } else {
      window.open(
        "https://wa.me/?text=" +
        encodeURIComponent(info.text + " " + info.url),
        "_blank",
        "noopener"
      );
    }
  };

  document.getElementById("share-invitation")
    ?.addEventListener("click", share);

  document.getElementById("whatsapp-share")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      share();
    });

});
