// --- Settings ---
// (Email removed)

// Your GitHub Pages URL (QR points here)
// NOTE: repo is "bocaratononlineadvertisingcenter" (no hyphens)
const PAGE_URL =
  "https://bernardogarciaofficial.github.io/bocaratononlineadvertisingcenter/";

// Base path for assets.
// - On GitHub Pages project sites: "/<repo-name>/"
// - Locally (or custom domain root): "/"
const REPO_NAME = "bocaratononlineadvertisingcenter";
const BASE_PATH = location.hostname.endsWith("github.io")
  ? `/${REPO_NAME}/`
  : "/";

// Helper to build URLs that work reliably on GitHub Pages
function assetUrl(relativePath) {
  // relativePath example: "media/slot001.mp4"
  return `${BASE_PATH}${relativePath}`.replace(/\/{2,}/g, "/");
}

// --- 100 starter slots (landscape 16:9) ---
// Put your files in /media/ like: slot001.mp4, slot002.mp4 ...
// OPTIONAL poster images: slot001.jpg, slot002.jpg ...
const ADS = Array.from({ length: 100 }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    business: `Boca Business #${n}`,
    desc: ",
    video: assetUrl(`media/slot${n}.mp4`),
    poster: assetUrl(`media/slot${n}.jpg`),
    // image: assetUrl(`media/slot${n}.jpg`), // use this instead for image-only ads
    phone: "",
    website: ""
  };
});

// --- DOM ---
document.getElementById("year").textContent = new Date().getFullYear();

// Hide the top-right email button (since email/mailto was removed)
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

  // Video thumbnail or image
  let media;

  if (ad.video) {
    media = document.createElement("video");
    media.className = "thumb";

    // Use stable absolute URL (already built by assetUrl)
    media.src = ad.video;

    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    media.preload = "metadata";
    if (ad.poster) media.poster = ad.poster;

    // If the mp4 fails to load, keep something visible:
    // - show the poster (already set)
    // - and add a CSS class you can style if you want
    media.addEventListener("error", () => {
      card.classList.add("mediaError");
      // keep poster visible; don't remove the element
      media.pause();
    });

    // Desktop hover play (mobile ignores hover; click opens modal)
    card.addEventListener("mouseenter", () => media.play().catch(() => {}));
    card.addEventListener("mouseleave", () => {
      media.pause();
      media.currentTime = 0;
    });
  } else if (ad.image) {
    media = document.createElement("img");
    media.className = "thumb";
    media.src = ad.image;
    media.alt = ad.business;
    media.loading = "lazy";
  } else {
    media = document.createElement("div");
    media.className = "thumb";
    media.textContent = "No media yet";
    media.style.display = "grid";
    media.style.placeItems = "center";
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
  <p class="biz">${escapeHtml(ad.business)}</p>
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
    v.preload = "metadata";
    v.src = ad.video;
    if (ad.poster) v.poster = ad.poster;

    // Helpful: if the video errors, show a message instead of "blank"
    v.addEventListener("error", () => {
      const msg = document.createElement("div");
      msg.style.padding = "16px";
      msg.textContent =
        "This video could not be loaded. Please confirm the file exists at: " +
        ad.video;
      modalBody.innerHTML = "";
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
    "'": "&#039;"
  }[m]));
}
