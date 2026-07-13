// --- Settings ---
// (Email removed)

// Your GitHub Pages URL (QR points here)
const PAGE_URL = "https://bernardogarciaofficial.github.io/bocaratononlineadvertisingcenter/";

// --- 100 starter slots (landscape 16:9) ---
// Put your files in /media/ like: slot001.mp4, slot002.mp4 ...
// OPTIONAL poster images: slot001.jpg, slot002.jpg ...
//
// For an IMAGE ad, remove video/poster for that slot and add:
// image: "media/slot001.jpg"
const ADS = Array.from({ length: 100 }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");

  return {
    business: `Boca Business #${n}`,
    desc: " ",
    video: `media/slot${n}.mp4`,
    poster: `media/slot${n}.jpg`,
    phone: "",
    website: ""
  };
});

// --- DOM ---
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Hide the top-right email button.
const emailBtn = document.getElementById("emailBtn");
if (emailBtn) {
  emailBtn.removeAttribute("href");
  emailBtn.style.display = "none";
}

const grid = document.getElementById("grid");
const countPill = document.getElementById("countPill");

// --- Modal elements ---
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalFoot = document.getElementById("modalFoot");
const closeBtn = document.getElementById("closeBtn");

if (closeBtn) {
  closeBtn.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Play only videos that are visible on the screen.
// This makes the commercials start automatically when the page opens
// without forcing all 100 videos to play at the same time.
const videoObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Some browsers may delay autoplay until the page is active.
            });
          } else {
            video.pause();
          }
        });
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "150px 0px"
      }
    )
  : null;

// --- Render cards ---
if (countPill) {
  countPill.textContent = `${ADS.length} ads`;
}

if (grid) {
  ADS.forEach((ad) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${ad.business}`);

    let media;

    if (ad.video) {
      media = document.createElement("video");
      media.className = "thumb";
      media.src = ad.video;
      media.muted = true;
      media.defaultMuted = true;
      media.loop = true;
      media.autoplay = true;
      media.playsInline = true;
      media.preload = "auto";
      media.setAttribute("muted", "");
      media.setAttribute("autoplay", "");
      media.setAttribute("playsinline", "");

      if (ad.poster) {
        media.poster = ad.poster;
      }

      // If the poster image is missing, the video can still display.
      media.addEventListener("error", () => {
        console.warn(`Could not load video: ${ad.video}`);
      });

      if (videoObserver) {
        videoObserver.observe(media);
      } else {
        media.play().catch(() => {});
      }
    } else if (ad.image) {
      media = document.createElement("img");
      media.className = "thumb";
      media.src = ad.image;
      media.alt = ad.business;
      media.loading = "lazy";
    } else {
      media = document.createElement("div");
      media.className = "thumb";
      media.textContent = "Commercial spot available";
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <p class="biz">${escapeHtml(ad.business)}</p>
      <p class="desc">${escapeHtml(ad.desc || "")}</p>
    `;

    card.appendChild(media);
    card.appendChild(meta);
    grid.appendChild(card);

    // Clicking a commercial still opens the larger modal player.
    card.addEventListener("click", () => openModal(ad));

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(ad);
      }
    });
  });
}

// Try once more after the page has completely loaded.
window.addEventListener("load", () => {
  document.querySelectorAll("video.thumb").forEach((video) => {
    const rect = video.getBoundingClientRect();
    const isVisible =
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;

    if (isVisible) {
      video.play().catch(() => {});
    }
  });
});

// --- Modal functions ---
function openModal(ad) {
  if (!modal || !modalTitle || !modalBody || !modalFoot) {
    return;
  }

  modalTitle.textContent = ad.business;
  modalBody.innerHTML = "";
  modalFoot.innerHTML = "";

  if (ad.video) {
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.src = ad.video;

    if (ad.poster) {
      video.poster = ad.poster;
    }

    modalBody.appendChild(video);
    video.play().catch(() => {});
  } else if (ad.image) {
    const image = document.createElement("img");
    image.src = ad.image;
    image.alt = ad.business;
    modalBody.appendChild(image);
  } else {
    const message = document.createElement("div");
    message.style.padding = "16px";
    message.textContent = "Media file not set yet for this slot.";
    modalBody.appendChild(message);
  }

  const details = [];

  if (ad.phone) {
    details.push(`Phone: ${ad.phone}`);
  }

  if (ad.website) {
    details.push(`Website: ${ad.website}`);
  }

  modalFoot.textContent = details.join(" â¢ ");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!modal || !modalBody) {
    return;
  }

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  // Removing the modal video stops its sound and playback.
  modalBody.innerHTML = "";
}

// Basic escaping for safety.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}
