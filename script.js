//====New=========
const STORAGE_KEY = "zuhause_listings";

const SAMPLE_LISTINGS = [
  {
    id: 1,
    title: "2 bedroom near Kibaki",
    location: "Likoni, Mombasa",
    price: 15000,
    rooms: 2,
    description: "Spacious 2 bedroom apartment, 5 minutes from Konambaya. Water and security included.",
    contact: "+254769792179",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    status: "available"
  },
  {
    id: 2,
    title: "2 bedroom near kombani",
    location: "Maganya, Kombani",
    price: 12000,
    rooms: 2,
    description: "Spacious 2 bedroom apartment, Mekaeia weber, water and security included.",
    contact: "+254769792179",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    status: "available"
  },
  {
    id: 3,
    title: "Bedsitter with parking",
    location: "Likoni, Mombasa",
    price: 8500,
    rooms: 1,
    description: "Bedsitter with dedicated working space and 24hr Water supply and security included.",
    contact: "+254769792179",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    status: "available"
  }
];

function formatPrice(amount) {
  return "ksh " + Number(amount).toLocaleString();
}

function getListings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    saveListings(SAMPLE_LISTINGS);
    return SAMPLE_LISTINGS;
  }
  return JSON.parse(raw);
}

function saveListings(listings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

/* ==================== HOMEPAGE ==================== */
function renderHomepage() {
  const container = document.getElementById("listings-container");
  if (!container) return;

  const listings = getListings();
  const search = (document.getElementById("search")?.value || "").toLowerCase();
  const maxPrice = Number(document.getElementById("max-price")?.value) || Infinity;
  const roomsFilter = document.getElementById("rooms-filter")?.value || "";
  const hideTaken = document.getElementById("hide-taken")?.checked || false;

  let filtered = listings.filter(listing => {
    const matchSearch =
      listing.title.toLowerCase().includes(search) ||
      listing.location.toLowerCase().includes(search);

    const matchPrice = listing.price <= maxPrice;
    const matchRooms = roomsFilter === "" || listing.rooms === Number(roomsFilter);
    const matchStatus = !hideTaken || listing.status !== "taken";

    return matchSearch && matchPrice && matchRooms && matchStatus;
  });

  // Available first, then Taken
  filtered.sort((a, b) => {
    if (a.status === "available" && b.status === "taken") return -1;
    if (a.status === "taken" && b.status === "available") return 1;
    return 0;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No vacancies match your search.</p>
        <p style="margin-top: 12px">
          <a href="post.html" class="btn btn-primary">Post a vacancy</a>
        </p>`;
        return;
  }

  container.innerHTML = `
    <div class="listings-grid">
      ${filtered.map(listing => `
        <a href="listing.html?id=${listing.id}" 
           class="listing-card ${listing.status === 'taken' ? 'taken' : ''}">
          
          <div class="card-image">
            ${listing.image
              ? `<img src="${listing.image}" alt="${listing.title}" loading="lazy">`
              : `<div class="no-image">🏠</div>`}
            
            ${listing.status === 'taken'
              ? `<div class="taken-badge">TAKEN</div>`
              : ''}
          </div>

          <div class="card-body">
           
          <div class="card-price">
              ${formatPrice(listing.price)}<span>/month</span>
            </div>
            <h3 class="card-title">${listing.title}</h3>
            <p class="card-location">📍 ${listing.location}</p>
            <p class="card-rooms">🛏 ${listing.rooms} room(s)</p>

            ${listing.status === 'taken' ? '' : `
            <button type="button" class="contact-btn"
            data-phone="${normalizePhone(listing.phone || listing.contact)}"
            data-msg="${encodeURIComponent(`Hi, I'm interested in "${listing.title}" 
            (${formatPrice(listing.price)}/month) that I saw on Kalyx. Is it still available?`)}">
            <i class="fa-brands fa-whatsapp"></i> Contact landlord
            </button>`}

          </div>
        </a>
      `).join('')}
    </div>`;
}

/* ==================== DETAIL PAGE ==================== */
function renderListingDetail() {
  const container = document.getElementById("listing-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = Number(params.get("id"));
  const listings = getListings();
  const listing = listings.find(item => item.id === requestedId);

  if (!listing) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Listing not found. It may have been removed.</p>
        <a href="index.html" class="btn btn-secondary" style="margin-top:16px">
          ← Back to all listings
        </a>
      </div>`;
    return;
  }

  const isTaken = listing.status === "taken";

  container.innerHTML = `
    <a href="index.html" class="back-link">← Back to all listings</a>

    ${listing.image ? `
      <div class="detail-image">
        <img src="\( {listing.image}" alt=" \){listing.title}">
        ${isTaken ? `<div class="taken-badge large">TAKEN</div>` : ''}
      </div>` : ''}

    <div class="detail-price">
      ${formatPrice(listing.price)}
      <span style="font-size:17px; font-weight:500; color:#7f8c8d"> / month</span>
    </div>

    <h1 class="detail-title">${listing.title}</h1>

    <div class="detail-meta">
      <span>📍 ${listing.location}</span>
      <span>🛏 ${listing.rooms} room(s)</span>
      <span class="status-tag ${isTaken ? 'taken' : 'available'}">
        ${isTaken ? '🔴 Taken' : '🟢 Available'}
      </span>
    </div>

    <div class="detail-description">
      ${listing.description || "No description provided."}
    </div>

    <div class="detail-actions">
      ${!isTaken ? `
        <a href="tel:${listing.contact}" class="btn btn-contact">
          📞 Call ${listing.contact}
        </a>
        <button onclick="markAsTaken(${listing.id})" class="btn btn-danger">
          Mark as Taken
        </button>
      ` : `
        <button onclick="markAsAvailable(${listing.id})" class="btn btn-primary">
          Mark as Available again
        </button>
      `}

      <button onclick="deleteListing(${listing.id})" class="btn btn-secondary">
        🗑 Delete listing
      </button>
    </div>
  `;
}

function markAsTaken(id) {
  if (!confirm("Mark this listing as TAKEN?\nIt will show a red badge and move to the bottom.")) return;

  const listings = getListings();
  const listing = listings.find(l => l.id === id);
  if (listing) {
    listing.status = "taken";
    saveListings(listings);
    showToast("Marked as Taken ✓");
    renderListingDetail();
  }
}

function markAsAvailable(id) {
  if (!confirm("Mark this listing as Available again?")) return;

  const listings = getListings();
  const listing = listings.find(l => l.id === id);
  if (listing) {
    listing.status = "available";
    saveListings(listings);
    showToast("Marked as Available again ✓");
    renderListingDetail();
  }
}

function deleteListing(id) {
  if (!confirm("Are you sure you want to permanently delete this listing?")) return;

  const listings = getListings().filter(l => l.id !== id);
  saveListings(listings);
  window.location.href = "index.html";
}

/* ==================== POST FORM ==================== */
function setupPostForm() {
  const form = document.getElementById("post-form");
  if (!form) return;

  const imageUrlInput = document.getElementById("image-url");
  const imageFileInput = document.getElementById("image-file");
  const preview = document.getElementById("image-preview");
  const previewImg = preview?.querySelector("img");

  // Live preview for image URL
  if (imageUrlInput && previewImg) {
    imageUrlInput.addEventListener("input", () => {
      const url = imageUrlInput.value.trim();
      if (url) {
        previewImg.src = url;
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
      }
    });
  }

  // File upload → Base64
  if (imageFileInput && previewImg) {
    imageFileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      if (file.size > 1.5 * 1024 * 1024) {
        alert("Image is too large. Please choose a photo under 1.5 MB.");
        this.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        preview.style.display = "block";
        imageUrlInput.value = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.title.value.trim() || !form.price.value || !form.location.value.trim()) {
      alert("Please fill in Title, Price and Location.");
      return;
    }

    const listings = getListings();
    const newId = listings.length > 0
      ? Math.max(...listings.map(item => item.id)) + 1
      : 1;

    const newListing = {
      id: newId,
      title: form.title.value.trim(),
      location: form.location.value.trim(),
      price: Number(form.price.value),
      rooms: Number(form.rooms.value) || 1,
      description: form.description.value.trim(),
      contact: form.contact.value.trim(),
      image: form.imageUrl?.value.trim() || null,
      status: "available"
    };

    listings.push(newListing);
    saveListings(listings);

    showToast("Vacancy posted successfully! 🎉");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  });
}

/* ==================== TOAST ==================== */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "success-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ==================== INIT ==================== */
document.addEventListener("DOMContentLoaded", () => {
  // Homepage
  if (document.getElementById("listings-container")) {
    renderHomepage();

    ["search", "max-price", "rooms-filter"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", renderHomepage);
    });

    const hideTaken = document.getElementById("hide-taken");
    if (hideTaken) {
      hideTaken.addEventListener("change", renderHomepage);
    }
  }

  // Detail page
  if (document.getElementById("listing-detail")) {
    renderListingDetail();
  }

  // Post form
  if (document.getElementById("post-form")) {
    setupPostForm();
  }
});

//Dark mode
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  if (themeIcon) {
    themeIcon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
}

let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
applyTheme(saved === 'dark');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'));
  });
}


// More information menu
const menuBtn = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');

if (menuBtn && menuPanel) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPanel.hidden = !menuPanel.hidden;
    menuBtn.setAttribute('aria-expanded', String(!menuPanel.hidden));
  });

  document.addEventListener('click', (e) => {
    if (!menuPanel.contains(e.target)) menuPanel.hidden = true;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menuPanel.hidden = true;
  });
}


// Contact landlord
function normalizePhone(p) {
  let n = String(p || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '254' + n.slice(1);
  return n || '254769792179'; // falls back to the Kalyx number
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.contact-btn');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  window.open(`https://wa.me/${btn.dataset.phone}?text=${btn.dataset.msg}`, '_blank', 'noopener');
});

