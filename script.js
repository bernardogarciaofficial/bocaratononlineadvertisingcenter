// ================== SETTINGS ==================
const EMAIL = "bernardogarciagarcia441@gmail.com"; // <-- change if needed

// ================== MAILTO ==================
const subject = encodeURIComponent("Boca Raton Online Ad Submission (Free)");
const body = encodeURIComponent(
`Business Name:
Phone:
Website (optional):

Attach your VIDEO (MP4/MOV) or IMAGE (JPG/PNG) to this email.
Recommended video length: 10–15 seconds (max 20).`
);
const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

// ================== AD LIST ==================
// Put files inside /media/
// Examples:
//   media/ad001.mp4
//   media/ad001.jpg  (optional poster)
// Image-only ad:
//   { business:"...", image:"media/img001.jpg" }

const ADS = [
  {
    business: "Patrocinadores Teleunionlatina",
    desc: "Commercial Spot",
    video: "media/patrocinadores_teleunionlatina_02.mp4",
    poster: "media/patrocinadores_teleunionlatina_02.jpg", // optional
    phone: "",
    website: ""
  },

  // Add more like:
  // { business:"Boca Business #002", desc:"Commercial Spot", video:"media/ad002.mp4", poster:"media/ad002.jpg" },
];

// OPTIONAL: If you want 100 slots but only show the ones that exist,
// leave ADS as your real ads list like above (best & fastest).

// ================== DOM ==================
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("emailBtn").href = mailto;
document.getElementById("emailText").textContent = EMAIL;

const grid = document.getElementById("grid");
const countPill = document.getElementById("countPill");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalFoot = document.getElementById("modalFoot");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ================== HELPERS ==================
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function isDesktopHover() {
  return window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// Check if a file exists (HEAD request). If GitHub blocks HEAD, we fallback to GET.
// This keeps the page clean (only show real ads).
async function exists(url) {
  try {
    const r = await fetch(url, { method: "HEAD", cache: "no-cache" });
    if (r.ok) return true;
  } catch (_) {}
  try {
    const r2 = await fetch(url, { method: "GET", cache: "no-cache" });
    return r2.ok;
  } catch (_) {
    return false;
  }
}

// ================== RENDER ==================
(async function init() {
  // Filter: show only ads that actually have a working video OR image
  const realAds = [];
  for (const ad of ADS) {
    if (ad.video && await exists(ad.video)) {
      realAds.push(ad);
      continue;
    }
    if (ad.image && await exists(ad.image)) {
      realAds.push(ad);
      continue;
    }
  }

  countPill.textContent = `${realAds.length} ads`;

  grid.innerHTML = "";
  realAds.forEach((ad) => grid.appendChild(makeCard(ad)));
})();

function makeCard(ad) {
  const card = document.createElement("div");
  card.className = "card";

  let mediaEl;

  if (ad.video) {
    const v = document.createElement("video");
    v.className = "thumb";
    v.src = ad.video;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "metadata";
    if (ad.poster) v.poster = ad.poster;

    // Smooth thumbnail (show a frame)
    v.addEventListener("loadedmetadata", () => {
      try { v.currentTime = 0.1; } catch {}
    });

    // Hover preview only for desktop
    if (isDesktopHover()) {
      card.addEventListener("mouseenter", () => v.play().catch(()=>{}));
      card.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0.1; });
    }

    mediaEl = v;
  } else {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = ad.image;
    img.alt = ad.business || "Ad";
    img.loading = "lazy";
    mediaEl = img;
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <p class="biz">${escapeHtml(ad.business || "Business")}</p>
    <p class="desc">${escapeHtml(ad.desc || "")}</p>
  `;

  card.appendChild(mediaEl);
  card.appendChild(meta);

  card.addEventListener("click", () => openModal(ad));

  return card;
}

// ================== MODAL ==================
function openModal(ad) {
  modalTitle.textContent = ad.business || "Ad";
  modalBody.innerHTML = "";
  modalFoot.innerHTML = "";

  if (ad.video) {
    const v = document.createElement("video");
    v.controls = true;
    v.playsInline = true;
    v.src = ad.video;
    v.preload = "auto";
    if (ad.poster) v.poster = ad.poster;
    modalBody.appendChild(v);
    v.play().catch(()=>{});
  } else if (ad.image) {
    const img = document.createElement("img");
    img.src = ad.image;
    img.alt = ad.business || "Ad";
    modalBody.appendChild(img);
  } else {
    modalBody.textContent = "Media not set.";
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
