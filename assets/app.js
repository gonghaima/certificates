pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs";

const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const countEl = document.getElementById("count");

const categories = ["All", ...Array.from(new Set(CERTS.map((c) => c.category)))];
let active = "All";

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function render() {
  const items = CERTS.filter((c) => active === "All" || c.category === active).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  countEl.textContent = items.length;

  grid.innerHTML = "";
  for (const cert of items) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb" data-file="${cert.file}">
        <span class="placeholder">Loading…</span>
      </div>
      <div class="card-body">
        <span class="badge">${cert.issuer}</span>
        <h3>${cert.title}</h3>
        <div class="meta">
          <span>${fmtDate(cert.date)}</span>
          <span>${cert.recipient}</span>
        </div>
      </div>
      <div class="actions">
        <a class="primary" href="${cert.file}" target="_blank" rel="noopener">View PDF</a>
        ${cert.verify ? `<a href="${cert.verify}" target="_blank" rel="noopener">Verify</a>` : ""}
      </div>
    `;
    grid.appendChild(card);
  }

  observeThumbs();
}

function renderFilters() {
  filters.innerHTML = "";
  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat === active ? " active" : "");
    btn.textContent = cat === "All" ? `All (${CERTS.length})` : `${cat} (${CERTS.filter((c) => c.category === cat).length})`;
    btn.addEventListener("click", () => {
      active = cat;
      renderFilters();
      render();
    });
    filters.appendChild(btn);
  }
}

const thumbCache = new Map();

async function renderThumb(el) {
  const file = el.dataset.file;
  if (thumbCache.has(file)) {
    el.innerHTML = "";
    el.appendChild(thumbCache.get(file).cloneNode());
    return;
  }
  try {
    const pdf = await pdfjsLib.getDocument(file).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = 420 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

    thumbCache.set(file, canvas);
    el.innerHTML = "";
    el.appendChild(canvas);
  } catch (err) {
    el.innerHTML = '<span class="placeholder">PDF</span>';
  }
}

let observer;
function observeThumbs() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          renderThumb(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "200px" }
  );
  document.querySelectorAll(".thumb").forEach((el) => observer.observe(el));
}

renderFilters();
render();
