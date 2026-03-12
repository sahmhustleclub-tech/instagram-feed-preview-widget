const grid = document.getElementById("grid");
const refreshBtn = document.getElementById("refreshBtn");
const planBtn = document.getElementById("planBtn");

let sortable = null;
let planMode = false;

refreshBtn.onclick = loadFeed;
planBtn.onclick = togglePlan;

async function loadFeed() {
  grid.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/feed");
    const data = await res.json();

    if (!res.ok) {
      grid.innerHTML = "Error loading feed";
      return;
    }

    grid.innerHTML = "";

    data.items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "card";
      div.dataset.id = item.id;

      div.innerHTML = item.feedImage
        ? `<img src="${item.feedImage}" alt="">`
        : `<div style="padding:10px;font-size:12px;">No image</div>`;

      grid.appendChild(div);
    });

    initSortable();
  } catch (error) {
    grid.innerHTML = "Error loading feed";
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
    onStart: (evt) => {
      evt.item.classList.add("dragging");
    },
    onEnd: async (evt) => {
      evt.item.classList.remove("dragging");
      await updateOrder();
    }
  });
}

async function updateOrder() {
  const ids = [...grid.children].map((card) => card.dataset.id);

  try {
    const res = await fetch("/api/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to sync order");
      return;
    }

    await loadFeed();
  } catch (error) {
    alert("Failed to sync order");
  }
}

loadFeed();