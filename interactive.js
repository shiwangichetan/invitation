/* Wedding invitation interactions. Load after script.js. */
document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("invite-gate");
  const audio = document.getElementById("wedding-audio");
  const musicButton = document.getElementById("music-toggle");
  const musicStatus = document.getElementById("music-status");

  const setMusicState = (playing) => {
    if (!musicButton) return;
    musicButton.textContent = playing ? "Ⅱ Pause music" : "♫ Play music";
    musicButton.setAttribute("aria-pressed", String(playing));
  };

  // Start music only after an intentional visitor click (browser autoplay policy).
  const openGate = () => {
    if (!gate) return;
    gate.classList.add("is-opening");

    if (audio) {
      audio.play()
        .then(() => {
          setMusicState(true);
          if (musicStatus) musicStatus.textContent = "";
        })
        .catch((error) => {
          setMusicState(false);
          if (musicStatus) {
            musicStatus.textContent = "Tap Play music if playback does not start.";
          }
          console.info("Music playback requires user interaction or a valid MP3.", error);
        });
    }

    window.setTimeout(() => gate.remove(), 850);
  };

  document.getElementById("open-invitation")?.addEventListener("click", openGate);
  document.getElementById("skip-invitation")?.addEventListener("click", openGate);

  // Music controls remain available after the opening screen.
  musicButton?.addEventListener("click", async () => {
    if (!audio) {
      if (musicStatus) musicStatus.textContent = "The audio player was not found.";
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setMusicState(true);
        if (musicStatus) musicStatus.textContent = "";
      } catch (error) {
        setMusicState(false);
        if (musicStatus) musicStatus.textContent = "Unable to play music. Check wedding-music.mp3.";
        console.error("Music playback failed:", error);
      }
    } else {
      audio.pause();
      setMusicState(false);
    }
  });

  audio?.addEventListener("ended", () => setMusicState(false));
  audio?.addEventListener("pause", () => setMusicState(false));
  audio?.addEventListener("play", () => setMusicState(true));

  // Photo gallery lightbox.
  const dialog = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");

  document.querySelectorAll(".gallery-photo").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.dataset.full;
      if (!dialog || !lightboxImage || !image) return;
      lightboxImage.src = image;
      lightboxImage.alt = button.querySelector("img")?.alt || "Couple portrait";
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });

  document.getElementById("close-lightbox")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Add Google Calendar links to event cards.
  const months = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12"
  };

  const toDate = (text) => {
    const match = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!match) return null;
    const month = months[match[2].toLowerCase()];
    return month ? `${match[3]}${month}${match[1].padStart(2, "0")}` : null;
  };

  document.querySelectorAll(".event-card").forEach((card) => {
    const title = card.querySelector("h4")?.textContent.trim();
    const date = toDate(card.querySelector(".event-date")?.textContent || "");
    if (!title || !date || card.querySelector(".calendar-link")) return;

    const venue = card.querySelector(".venue")?.innerText.replace(/\n/g, ", ") || "";
    const extra = card.querySelector(".dinner-time")?.textContent || "";
    const eventDay = new Date(Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(4, 6)) - 1,
      Number(date.slice(6, 8)) + 1
    ));
    const end = eventDay.toISOString().slice(0, 10).replaceAll("-", "");

    const link = document.createElement("a");
    link.className = "calendar-link";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "＋ Add to calendar";
    link.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
      encodeURIComponent(`${title} · Chetan & Shiwangi`) +
      `&dates=${date}/${end}` +
      `&details=${encodeURIComponent("Chetan & Shiwangi wedding celebration. " + extra)}` +
      `&location=${encodeURIComponent(venue)}`;
    card.append(link);
  });

  // Native share sheet, with WhatsApp fallback.
  const shareInvitation = async () => {
    const info = {
      title: "Chetan & Shiwangi — Wedding Invitation",
      text: "With the blessings of our families, join us for Chetan & Shiwangi's wedding celebrations, 29 November – 5 December 2026.",
      url: window.location.href.split("#")[0]
    };

    if (navigator.share) {
      try {
        await navigator.share(info);
      } catch (error) {
        if (error.name !== "AbortError") console.error("Sharing failed:", error);
      }
    } else {
      window.open(
        "https://wa.me/?text=" + encodeURIComponent(info.text + " " + info.url),
        "_blank",
        "noopener"
      );
    }
  };

  document.getElementById("share-invitation")?.addEventListener("click", shareInvitation);
  document.getElementById("whatsapp-share")?.addEventListener("click", (event) => {
    event.preventDefault();
    shareInvitation();
  });
});
