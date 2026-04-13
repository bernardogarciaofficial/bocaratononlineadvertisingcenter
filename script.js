 // --- Settings ---
const EMAIL = "bernardogarciagarcia441@gmail.com";

// Your GitHub Pages URL (QR points here)
const PAGE_URL = "https://bernardogarciaofficial.github.io/boca-raton-online-advertising-center/";

// --- Build the mailto link ---
const subject = encodeURIComponent("Boca Raton Online Ad Submission (Free)");
const body = encodeURIComponent(
`Business Name:
Phone:
Website (optional):

Attach your VIDEO (MP4/MOV) or IMAGE (JPG/PNG) to this email.
Recommended video length: 10–15 seconds (max 20).`
);

const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

// --- 100 starter slots (landscape 16:9) ---
// Put your files in /media/ like: ad001.mp4, ad002.mp4 ...
// OPTIONAL poster images: ad001.jpg, ad002.jpg ...
//
// If you want an IMAGE ad for a slot later, replace video+poster with image.
const ADS = Array.from({ length: 100 }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    business: `Boca Business #${n}`,
    desc: "Email your ad to be posted (Free).",
    video: `media/ad${n}.mp4`,
    poster: `media/ad${n}.jpg`,
    // image: `media/ad${n}.jpg`, // (use this instead of video/poster for image-only ads)
    phone: "",
    website: ""
  };
});

// --- DOM ---
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("emailBtn").href = mailto;
document.getElementById("emailText").textContent = EMAIL;

const grid = document.getElementById("grid");
const countPill = document.getElementById("countPill");

// --- Modal elements ---
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalFoot = document.getElementById("modalFoot");
document.getElementById("closeBtn").onclick = closeModal;
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// --- Render cards ---
countPill.textContent = `${ADS.length} ads`;

ADS.forEach(ad => {
  const card = document.createElement("div");
  card.className = "card";

  // Video thumbnail
  let media;
  if (ad.video) {
    media = document.createElement("video");
    media.className = "thumb";
    media.src = ad.video;
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    media.preload = "metadata";
    if (ad.poster) media.poster = ad.poster;

    // Desktop hover play (mobile ignores hover; click opens modal)
    card.addEventListener("mouseenter", () => media.play().catch(() => {}));
    card.addEventListener("mouseleave", () => { media.pause(); media.currentTime = 0; });
  } else {
    // Image thumbnail
    media = document.createElement("img");
    media.className = "thumb";
    media.src = ad.image;
    media.alt = ad.business;
    media.loading = "lazy";
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
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
