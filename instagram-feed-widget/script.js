const grid = document.getElementById("grid");
const refreshBtn = document.getElementById("refreshBtn");
const planBtn = document.getElementById("planBtn");

let sortable;
let planMode = false;
let currentItems = [];
let currentCarouselIndex = 0;
let currentCarouselImages = [];

refreshBtn.onclick = loadFeed;
planBtn.onclick = togglePlan;

async function loadFeed() {
  grid.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/feed");
    const data = await res.json();

    if (!res.ok) {
      grid.innerHTML = `Error: ${data.error || "Failed to load feed"}`;
      return;
    }

    currentItems = data.items || [];
    grid.innerHTML = "";

    currentItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.dataset.id = item.id;

      const formattedDate = formatDate(item.publishDate);

      div.innerHTML = `
        ${item.feedImage ? `<img src="${item.feedImage}" alt="${escapeHtml(item.title)}">` : `<div class="empty-card">No image</div>`}
        ${formattedDate ? `<div class="date-badge">${formattedDate}</div>` : ""}
        ${item.isCarousel ? `<div class="carousel-badge">▣</div>` : ""}
      `;

      div.addEventListener("click", () => {
        if (item.isCarousel) {
          openCarousel(item);
        }
      });

      grid.appendChild(div);
    });

    initSortable();
  } catch (error) {
    grid.innerHTML = `Error: ${error.message}`;
  }
}

function togglePlan() {
  planMode = !planMode;
  planBtn.innerText = planMode ? "Plan Grid ON" : "Plan Grid OFF";

  if (sortable) {
    sortable.option("disabled", !planMode);
  }
}

function initSortable() {
  if (sortable) sortable.destroy();

  sortable = new Sortable(grid, {
    animation: 150,
    disabled: !planMode,
    onEnd: updateOrder
  });
}

async function updateOrder() {
  const ids = [...grid.children].map(c => c.dataset.id);

  await fetch("/api/reorder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ids })
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function openCarousel(item) {
  currentCarouselImages = item.attachmentUrls || [];
  currentCarouselIndex = 0;

  if (!currentCarouselImages.length) return;

  let modal = document.getElementById("carouselModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "carouselModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <button class="modal-close">×</button>
        <button class="modal-prev">‹</button>
        <img class="modal-image" src="" alt="">
        <button class="modal-next">›</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".modal-backdrop").addEventListener("click", closeCarousel);
    modal.querySelector(".modal-close").addEventListener("click", closeCarousel);
    modal.querySelector(".modal-prev").addEventListener("click", prevCarouselImage);
    modal.querySelector(".modal-next").addEventListener("click", nextCarouselImage);
  }

  updateCarouselImage();
  modal.classList.add("open");
}

function closeCarousel() {
  const modal = document.getElementById("carouselModal");
  if (modal) modal.classList.remove("open");
}

function updateCarouselImage() {
  const modal = document.getElementById("carouselModal");
  if (!modal) return;

  const img = modal.querySelector(".modal-image");
  img.src = currentCarouselImages[currentCarouselIndex] || "";
}

function prevCarouselImage() {
  if (!currentCarouselImages.length) return;
  currentCarouselIndex = (currentCarouselIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length;
  updateCarouselImage();
}

function nextCarouselImage() {
  if (!currentCarouselImages.length) return;
  currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselImages.length;
  updateCarouselImage();
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadFeed();