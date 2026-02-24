// ================== SETTINGS ==================
const EMAIL = "bernardogarciagarcia441@gmail.com"; // <-- change if needed

// How many thumbnails/slots you want on the wall:
const SLOT_COUNT = 100;

// File naming convention for each slot:
//   media/slot001.mp4   (or .mov)
//   media/slot001.jpg   (or .png)  optional poster/thumbnail
const MEDIA_DIR = "media";
const SLOT_PREFIX = "slot"; // slot001, slot002, ...

// Optional: default text shown for empty slots
const EMPTY_TITLE = "Available Slot";
const EMPTY_DESC = "Upload your commercial spot to claim this spot.";

// ================== BUSINESS NAMES ==================
// Add names here. Key is the slot number (1..100).
// Example: 1: "Bernardo’s Roofing"
const BUSINESS_BY_SLOT = {
  1: "Skin Wizard",
  // 2: "Another Business",
  // 3: "Another Business",
};

// Optional: short taglines (shows as the small gray description line)
const TAGLINE_BY_SLOT = {
  1: "Tap to watch",
  // 2: "Tap to watch",
};

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

function pad3(n) {
  return String(n).padStart(3, "0");
}

function slotName(i) {
  return `${SLOT_PREFIX}${pad3(i)}`; // slot001
}

function slotPath(i, ext) {
  return `${MEDIA_DIR}/${slotName(i)}.${ext}`;
}

function businessNameForSlot(i) {
  return BUSINESS_BY_SLOT[i] || `${EMPTY_TITLE} #${pad3(i)}`;
}

function taglineForSlot(i, isFilled) {
  if (TAGLINE_BY_SLOT[i]) return TAGLINE_BY_SLOT[i];
  return isFilled ? "Tap to open" : EMPTY_DESC;
}

// Check if a file exists using GET (more reliable than HEAD on some hosts/CDNs).
async function exists(url) {
  try {
    const r = await fetch(url, { method: "GET", cache: "no-store" });
    return r.ok;
  } catch (_) {
    return false;
  }
}

// Try multiple possible files for a slot (mp4/mov + poster jpg/png)
async function resolveSlotMedia(i) {
  const mp4 = slotPath(i, "mp4");
  const mov = slotPath(i, "mov");
  const jpg = slotPath(i, "jpg");
  const png = slotPath(i, "png");

  if (await exists(mp4)) {
    return { kind: "video", src: mp4, poster: (await exists(jpg)) ? jpg : ((await exists(png)) ? png : "") };
  }
  if (await exists(mov)) {
    return { kind: "video", src: mov, poster: (await exists(jpg)) ? jpg : ((await exists(png)) ? png : "") };
  }
  if (await exists(jpg)) {
    return { kind: "image", src: jpg };
  }
  if (await exists(png)) {
    return { kind: "image", src: png };
  }

  return { kind: "empty" };
}

// ================== RENDER ==================
(async function init() {
  countPill.textContent = `${SLOT_COUNT} slots`;
  grid.innerHTML = "";

  for (let i = 1; i <= SLOT_COUNT; i++) {
    const ad = {
      slot: i,
      business: businessNameForSlot(i),
      desc: taglineForSlot(i, false),
      phone: "",
      website: "",
      _media: { kind: "empty" }
    };

    const card = makeCard(ad);
    grid.appendChild(card);

    resolveSlotMedia(i).then((media) => {
      ad._media = media;

      // If slot is filled, keep business name but update the description to be "Tap to ..."
      const filled = media.kind !== "empty";
      ad.business = businessNameForSlot(i);
      ad.desc = taglineForSlot(i, filled);

      updateCardMedia(card, ad);
      updateCardText(card, ad);
    });
  }
})();

function makeCard(ad) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.slot = String(ad.slot);

  // a small "slot #" badge
  const tag = document.createElement("div");
  tag.className = "slotTag";
  tag.textContent = `#${pad3(ad.slot)}`;

  const placeholder = document.createElement("div");
  placeholder.className = "thumb empty";
  placeholder.textContent = `EMPTY #${pad3(ad.slot)}`;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <p class="biz">${escapeHtml(ad.business)}</p>
    <p class="desc">${escapeHtml(ad.desc || "")}</p>
  `;

  card.appendChild(tag);
  card.appendChild(placeholder);
  card.appendChild(meta);

  card.addEventListener("click", () => openModal(ad));
  return card;
}

function updateCardText(card, ad) {
  const biz = card.querySelector(".biz");
  const desc = card.querySelector(".desc");
  if (biz) biz.textContent = ad.business || "";
  if (desc) desc.textContent = ad.desc || "";
}

function updateCardMedia(card, ad) {
  // Media element is the 2nd child because 1st child is the slotTag now.
  // Children: [slotTag, media, meta]
  const oldMedia = card.children[1];
  let mediaEl;

  const m = ad._media;

  if (m.kind === "video") {
    const v = document.createElement("video");
    v.className = "thumb";
    v.src = m.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "metadata";
    if (m.poster) v.poster = m.poster;

    v.addEventListener("loadedmetadata", () => {
      try { v.currentTime = 0.1; } catch {}
    });

    if (isDesktopHover()) {
      card.addEventListener("mouseenter", () => v.play().catch(()=>{}));
      card.addEventListener("mouseleave", () => { v.pause(); try { v.currentTime = 0.1; } catch {} });
    }

    mediaEl = v;
  } else if (m.kind === "image") {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = m.src;
    img.alt = `Ad slot ${pad3(ad.slot)}`;
    img.loading = "lazy";

    mediaEl = img;
  } else {
    if (oldMedia && oldMedia.nodeType === 1) {
      oldMedia.textContent = `EMPTY #${pad3(ad.slot)}`;
    }
    return;
  }

  card.replaceChild(mediaEl, oldMedia);
}

// ================== MODAL ==================
function openModal(ad) {
  modalTitle.textContent = `${ad.business} (Slot #${pad3(ad.slot)})`;
  modalBody.innerHTML = "";
  modalFoot.innerHTML = "";

  const m = ad._media || { kind: "empty" };

  if (m.kind === "video") {
    const v = document.createElement("video");
    v.controls = true;
    v.playsInline = true;
    v.src = m.src;
    v.preload = "auto";
    if (m.poster) v.poster = m.poster;
    modalBody.appendChild(v);
    v.play().catch(()=>{});
    modalFoot.textContent = `File: ${m.src}`;
  } else if (m.kind === "image") {
    const img = document.createElement("img");
    img.src = m.src;
    img.alt = `Ad slot ${pad3(ad.slot)}`;
    modalBody.appendChild(img);
    modalFoot.textContent = `File: ${m.src}`;
  } else {
    const p = document.createElement("div");
    p.style.padding = "14px";
    p.style.color = "rgba(234,240,255,.75)";
    p.style.lineHeight = "1.55";
    p.innerHTML = `
      <b>This slot is empty.</b><br/>
      Upload one of these files to fill it:<br/>
      <code>${slotPath(ad.slot, "mp4")}</code> or <code>${slotPath(ad.slot, "mov")}</code><br/>
      Optional poster: <code>${slotPath(ad.slot, "jpg")}</code> or <code>${slotPath(ad.slot, "png")}</code>
    `;
    modalBody.appendChild(p);
    modalFoot.textContent = "Tip: Use consistent filenames and it will auto-appear.";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
}
