// ==========================================
// BOCA RATON ONLINE ADVERTISING CENTER
// Video Thumbnail Grid + Click-to-Expand Modal
// ==========================================


// ====== 1) LIST YOUR VIDEO FILES HERE ======
const ADS = [
  "media/patrocinadores_teleunionlatina_02.mp4",
  // Add more like:
  // "media/ad_002.mp4",
  // "media/ad_003.mp4",
];


// ====== 2) BUILD THE THUMBNAIL GRID ======
const grid = document.getElementById("adsGrid");

function fileNamePretty(path) {
  const name = path.split("/").pop() || path;
  return name
    .replace(".mp4", "")
    .replace(/_/g, " ");
}

function buildGrid() {
  if (!grid) return;

  grid.innerHTML = "";

  ADS.forEach((src) => {

    const tile = document.createElement("div");
    tile.className = "ad-tile";

    // Thumbnail video (muted loop preview)
    const vid = document.createElement("video");
    vid.className = "ad-thumb";
    vid.src = src;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.preload = "metadata";

    // Hover preview (desktop)
    tile.addEventListener("mouseenter", () => {
      vid.play().catch(()=>{});
    });

    tile.addEventListener("mouseleave", () => {
      vid.pause();
      vid.currentTime = 0;
    });

    const caption = document.createElement("div");
    caption.className = "ad-caption";
    caption.textContent = fileNamePretty(src);

    tile.appendChild(vid);
    tile.appendChild(caption);

    tile.addEventListener("click", () => {
      openModal(src, caption.textContent);
    });

    grid.appendChild(tile);
  });
}

buildGrid();


// ====== 3) MODAL (BIG VIDEO VIEWER) ======
const modal = document.getElementById("adModal");
const modalVideo = document.getElementById("adModalVideo");
const modalTitle = document.getElementById("adModalTitle");
const modalClose = document.getElementById("adModalClose");
const modalBackdrop = document.getElementById("adModalBackdrop");

function openModal(src, title) {
  if (!modal) return;

  modal.classList.remove("hidden");
  modalTitle.textContent = title;

  modalVideo.src = src;
  modalVideo.currentTime = 0;
  modalVideo.muted = false;
  modalVideo.volume = 1;

  modalVideo.play().catch(()=>{});
}

function closeModal() {
  if (!modal) return;

  modal.classList.add("hidden");

  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
}

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeModal);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
