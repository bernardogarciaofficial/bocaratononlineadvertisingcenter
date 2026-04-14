// --- Settings ---
// (Email removed)

// Your GitHub Pages URL (QR points here)
const PAGE_URL =
  "https://bernardogarciaofficial.github.io/boca-raton-online-advertising-center/";

// --- 100 starter slots (landscape 16:9) ---
// Put your files in /media/ like: slot001.mp4, slot002.mp4 ...
// OPTIONAL poster images: slot001.jpg, slot002.jpg ...
//
// If you want an IMAGE ad for a slot later, replace video+poster with image.
const ADS = Array.from({ length: 100 }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    business: `Boca Business #${n}`,
    desc: "Submit your ad to be posted (Free).",
    video: `media/slot${n}.mp4`,
    poster: `media/slot${n}.jpg`,
    // image: `media/slot${n}.jpg`, // (use this instead of video/poster for image-only ads)
    phone: "",
    website: "",
  };
});

// --- DOM ---
document.getElementById("year").textContent = new Date().getFullYear();

// Hide the top-right email button (since email/mailto was removed),
// but DO NOT clear the info text line in the page anymore.
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
document.getElementById("closeBtn").onclick = closeModal;
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// --- Render cards ---
countPill.textContent = `${ADS.length} ads`;

ADS.forEach((ad) => {
  const card = document.createElement("div");
  card.className = "card";

  let media;

  // Prefer video thumbnail if configured
  if (ad.video) {
    const v = document.createElement("video");
    v.className = "thumb";
    v.src = ad.video;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "metadata";
    if (ad.poster) v.poster = ad.poster;

    // If video fails to load (404, codec, etc.), fall back gracefully
    v.addEventListener("error", () => {
      // Replace the video element with an <img> poster (or text fallback)
      const fallback = document.createElement("img");
      fallback.className = "thumb";
      fallback.alt = ad.business;

      if (ad.poster) {
        fallback.src = ad.poster;
      } else {
        // no poster: show a simple placeholder style
        fallback.removeAttribute("src");
        fallback.style.background = "#111";
        fallback.style.display = "block";
      }

      v.replaceWith(fallback);
      media = fallback;
    });

    // Desktop hover play (mobile ignores hover; click opens modal)
    card.addEventListener("mouseenter", () => v.play().catch(() => {}));
    card.addEventListener("mouseleave", () => {
      v.pause();
      v.currentTime = 0;
    });

    media = v;
  } else if (ad.image) {
    // Image thumbnail
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = ad.image;
    img.alt = ad.business;
    img.loading = "lazy";
    media = img;
  } else {
    // No media configured
    const placeholder = document.createElement("div");
    placeholder.className = "thumb";
    placeholder.style.display = "grid";
    placeholder.style.placeItems = "center";
    placeholder.style.background = "#111";
    placeholder.style.color = "#fff";
    placeholder.style.fontSize = "14px";
    placeholder.textContent = "No media";
    media = placeholder;
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <p class="biz">${escapeHtml(ad.business)}</p>
    <p class="desc">${escapeHtml(ad.desc || "")}</p>
  `;

  card.appendChild(media);
  card.appendChild(meta);
  card.addEventListener("click", () => openModal(ad));
  grid.appendChild(card);
});

// --- Modal functions ---
function openModal(ad) {
  modalTitle.textContent = ad.business;
  modalBody.innerHTML = "";
  modalFoot.innerHTML = "";

  if (ad.video) {
    const v = document.createElement("video");
    v.controls = true;
    v.playsInline = true;
    v.src = ad.video;
    if (ad.poster) v.poster = ad.poster;

    // If the video can't load, show a friendly message instead
    v.addEventListener("error", () => {
      modalBody.innerHTML = "";
      const msg = document.createElement("div");
      msg.style.padding = "16px";
      msg.textContent = "Video unavailable for this slot.";
      modalBody.appendChild(msg);
    });

    modalBody.appendChild(v);
    v.play().catch(() => {});
  } else if (ad.image) {
    const img = document.createElement("img");
    img.src = ad.image;
    img.alt = ad.business;
    modalBody.appendChild(img);
  } else {
    const msg = document.createElement("div");
    msg.style.padding = "16px";
    msg.textContent = "Media file not set yet for this slot.";
    modalBody.appendChild(msg);
  }

  const bits = [];
  if (ad.phone) bits.push(`Phone: ${ad.phone}`);
  if (ad.website) bits.push(`Website: ${ad.website}`);
  modalFoot.textContent = bits.join(" • ");

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
}

// Basic escaping for safety
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[m]);
}
