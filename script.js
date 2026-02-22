// LIST YOUR ADS HERE
const ADS = [
  "media/patrocinadores_teleunionlatina_02.mp4",
];

// ELEMENTS
const grid = document.getElementById("adsGrid");
const modal = document.getElementById("adModal");
const modalVideo = document.getElementById("adModalVideo");
const modalTitle = document.getElementById("adModalTitle");
const modalClose = document.getElementById("adModalClose");
const modalBackdrop = document.getElementById("adModalBackdrop");

// BUILD GRID
function buildGrid() {
  grid.innerHTML = "";

  ADS.forEach((src) => {

    const tile = document.createElement("div");
    tile.className = "ad-tile";

    const vid = document.createElement("video");
    vid.className = "ad-thumb";
    vid.src = src;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = "metadata";

    vid.addEventListener("loadedmetadata", () => {
      vid.currentTime = 0.1;
    });

    const caption = document.createElement("div");
    caption.className = "ad-caption";
    caption.textContent = src.split("/").pop().replace(".mp4", "").replace(/_/g," ");

    tile.appendChild(vid);
    tile.appendChild(caption);

    tile.addEventListener("click", () => openModal(src, caption.textContent));

    grid.appendChild(tile);
  });
}

buildGrid();

// MODAL
function openModal(src, title) {
  modal.classList.remove("hidden");
  modalTitle.textContent = title;
  modalVideo.src = src;
  modalVideo.muted = false;
  modalVideo.play().catch(()=>{});
}

function closeModal() {
  modal.classList.add("hidden");
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
