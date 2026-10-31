/* Add this file after the existing script.js. It reuses the existing Supabase client and guestbook. */
document.addEventListener("DOMContentLoaded", () => {
  // Opening envelope
  const gate = document.getElementById("invite-gate");
  const openGate = () => {
    if (!gate) return;
    gate.classList.add("is-opening");
    window.setTimeout(() => gate.remove(), 850);
  };
  document.getElementById("open-invitation")?.addEventListener("click", openGate);
  document.getElementById("skip-invitation")?.addEventListener("click", openGate);

  // Photo gallery lightbox
  const dialog = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  document.querySelectorAll(".gallery-photo").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.dataset.full;
      if (!dialog || !lightboxImage || !image) return;
      lightboxImage.src = image;
      lightboxImage.alt = button.querySelector("img")?.alt || "Couple portrait";
      if (dialog.showModal) dialog.showModal();
    });
  });
  document.getElementById("close-lightbox")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Calendar links: date and venue are read from the event cards already on the page.
  const months = {january:"01",february:"02",march:"03",april:"04",may:"05",june:"06",july:"07",august:"08",september:"09",october:"10",november:"11",december:"12"};
  const toDate = (text) => {
    const m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    return m ? `${m[3]}${months[m[2].toLowerCase()]}${m[1].padStart(2,"0")}` : null;
  };
  document.querySelectorAll(".event-card").forEach((card) => {
    const title = card.querySelector("h4")?.textContent.trim();
    const date = toDate(card.querySelector(".event-date")?.textContent || "");
    if (!title || !date || card.querySelector(".calendar-link")) return;
    const venue = card.querySelector(".venue")?.innerText.replace(/\n/g, ", ") || "";
    const extra = card.querySelector(".dinner-time")?.textContent || "";
    const end = new Date(Date.UTC(+date.slice(0,4), +date.slice(4,6)-1, +date.slice(6,8)+1)).toISOString().slice(0,10).replaceAll("-","");
    const link = document.createElement("a");
    link.className = "calendar-link";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "＋ Add to calendar";
    link.href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
      encodeURIComponent(`${title} · Chetan & Shiwangi`) + `&dates=${date}/${end}` +
      `&details=${encodeURIComponent("Chetan & Shiwangi wedding celebration. " + extra)}` +
      `&location=${encodeURIComponent(venue)}`;
    card.append(link);
  });

  // RSVP uses the existing Supabase client created by script.js.
  const rsvp = document.getElementById("rsvp-form");
  const rsvpStatus = document.getElementById("rsvp-status");
  rsvp?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (typeof supabaseClient === "undefined" || !supabaseClient) {
      rsvpStatus.textContent = "RSVP is temporarily unavailable. Please contact the family directly.";
      return;
    }
    const data = new FormData(rsvp);
    const guestName = String(data.get("guest_name") || "").trim();
    const attendance = String(data.get("attendance") || "");
    const guestCount = Number(data.get("guest_count") || 1);
    const events = data.getAll("events").map(String);
    if (guestName.length < 2 || !["yes","no","maybe"].includes(attendance)) {
      rsvpStatus.textContent = "Please enter your name and select an attendance response.";
      return;
    }
    const submit = document.getElementById("rsvp-submit");
    submit.disabled = true;
    rsvpStatus.textContent = "Submitting your reply…";
    const { error } = await supabaseClient.from("wedding_rsvps").insert([{
      guest_name: guestName, attendance, guest_count: guestCount, events
    }]);
    submit.disabled = false;
    if (error) {
      console.error("RSVP submission failed:", error.message);
      rsvpStatus.textContent = "We couldn't save your RSVP. Please try again later or contact the family.";
      return;
    }
    rsvp.reset();
    rsvpStatus.textContent = "Thank you. Your RSVP has been received.";
  });

  // Optional music. Add your licensed/owned MP3 as wedding-music.mp3 in the repository root.
  const audio = document.getElementById("wedding-audio");
  const musicButton = document.getElementById("music-toggle");
  musicButton?.addEventListener("click", async () => {
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.textContent = "Ⅱ Pause music";
      } catch {
        const status = document.getElementById("music-status");
        if (status) status.textContent = "Add a licensed MP3 named wedding-music.mp3 to enable music.";
      }
    } else {
      audio.pause();
      musicButton.setAttribute("aria-pressed", "false");
      musicButton.textContent = "♫ Play music";
    }
  });

  // Native share on mobile; WhatsApp fallback on desktop.
  const share = () => {
    const info = {
      title: "Chetan & Shiwangi — Wedding Invitation",
      text: "With the blessings of our families, join us for Chetan & Shiwangi's wedding celebrations, 29 November – 5 December 2026.",
      url: window.location.href.split("#")[0]
    };
    if (navigator.share) {
      navigator.share(info).catch(() => {});
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(info.text + " " + info.url), "_blank", "noopener");
    }
  };
  document.getElementById("share-invitation")?.addEventListener("click", share);
  document.getElementById("whatsapp-share")?.addEventListener("click", (event) => {
    event.preventDefault();
    share();
  });
});
