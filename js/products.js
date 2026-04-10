// ============================================================
// js/products.js — Product Listing & Detail Page Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Product Listing Page ──────────────────────────────────
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    renderProductListing();
    setupFilters();
  }

  // ── Product Detail Page ───────────────────────────────────
  const detailContainer = document.getElementById('productDetail');
  if (detailContainer) {
    renderProductDetail();
  }
});

// ── Render product cards ──────────────────────────────────
function renderProductListing(filter = '', search = '', sort = 'default') {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('productCount');
  let products = Storage.getProducts();

  // Filter by category
  if (filter && filter !== 'All') {
    products = products.filter(p => p.category === filter);
  }
  // Search
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  // Sort
  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);

  if (countEl) countEl.textContent = `${products.length} item${products.length !== 1 ? 's' : ''} found`;

  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🪑</div><h3>No products found</h3><p>Try adjusting your filters or search term.</p></div>`;
    return;
  }

  grid.innerHTML = products.map(p => createProductCard(p)).join('');

  // Animate in
  setTimeout(() => {
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 60);
    });
  }, 10);
}

function createProductCard(p) {
  return `
  <div class="product-card" onclick="window.location='product-details.html?id=${p.id}'">
    <div class="card-image">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      ${p.featured ? '<span class="badge-featured">Featured</span>' : ''}
      ${p.stock < 5 ? `<span class="badge-low">Low Stock</span>` : ''}
    </div>
    <div class="card-body">
      <span class="card-category">${p.category}</span>
      <h3 class="card-title">${p.name}</h3>
      <div class="card-rating">${renderStars(p.rating)} <span>${p.rating}</span></div>
      <div class="card-footer">
        <span class="card-price">${formatPrice(p.price)}</span>
        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCartFromListing(${p.id})" aria-label="Add to cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  </div>`;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) stars += '★';
    else if (i === full && half) stars += '½';
    else stars += '☆';
  }
  return `<span class="stars">${stars}</span>`;
}

function addToCartFromListing(id) {
  const product = Storage.getProductById(id);
  if (!product) return;
  Storage.addToCart(product, 1);
  updateCartBadge();
  showToast(`${product.name} added to cart!`);
}

// ── Filters & Search ──────────────────────────────────────
function setupFilters() {
  const params = new URLSearchParams(window.location.search);
  const preCategory = params.get('category') || 'All';

  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let currentFilter = preCategory;
  let currentSearch = '';
  let currentSort = 'default';

  // Pre-select category from URL
  filterBtns.forEach(btn => {
    if (btn.dataset.category === preCategory) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      renderProductListing(currentFilter, currentSearch, currentSort);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentSearch = searchInput.value.trim();
      renderProductListing(currentFilter, currentSearch, currentSort);
    }, 300));
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderProductListing(currentFilter, currentSearch, currentSort);
    });
  }

  renderProductListing(currentFilter, currentSearch, currentSort);
}

// ── Product Detail Page ───────────────────────────────────
function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = Storage.getProductById(id);
  const container = document.getElementById('productDetail');

  if (!product) {
    container.innerHTML = `<div class="empty-state" style="padding:4rem;text-align:center"><h2>Product not found</h2><a href="products.html" class="btn-primary">Back to Shop</a></div>`;
    return;
  }

  document.title = product.name + ' — FURNI';

  container.innerHTML = `
  <div class="detail-grid">
    <div class="detail-image-wrap">
      <img src="${product.image}" alt="${product.name}" class="detail-img">
      ${product.featured ? '<span class="badge-featured">Featured</span>' : ''}
    </div>
    <div class="detail-info">
      <span class="detail-category">${product.category}</span>
      <h1 class="detail-title">${product.name}</h1>
      <div class="detail-rating">${renderStars(product.rating)} <span>${product.rating} out of 5</span></div>
      <div class="detail-price">${formatPrice(product.price)}</div>
      <p class="detail-description">${product.description}</p>
      <div class="detail-stock ${product.stock < 5 ? 'low' : ''}">
        ${product.stock < 5 ? '⚠ Only ' + product.stock + ' left in stock' : '✓ In Stock (' + product.stock + ' available)'}
      </div>
      <div class="detail-qty">
        <label>Quantity</label>
        <div class="qty-controls">
          <button onclick="changeQty(-1)">−</button>
          <input type="number" id="qtyInput" value="1" min="1" max="${product.stock}">
          <button onclick="changeQty(1)">+</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn-primary btn-large" onclick="addDetailToCart(${product.id})">
          Add to Cart
        </button>
        <button class="btn-secondary btn-large" onclick="window.location='cart.html'">
          View Cart
        </button>
      </div>
      <div class="detail-meta">
        <span>🚚 Free delivery within Metro Manila</span>
        <span>🔄 30-day returns</span>
        <span>🛡️ 1-year warranty</span>
      </div>
    </div>
  </div>
  `;

  renderRelatedProducts(product);
}

function changeQty(delta) {
  const input = document.getElementById('qtyInput');
  if (!input) return;
  const val = parseInt(input.value) + delta;
  const max = parseInt(input.max);
  input.value = Math.max(1, Math.min(max, val));
}

function addDetailToCart(id) {
  const product = Storage.getProductById(id);
  const qty = parseInt(document.getElementById('qtyInput').value) || 1;
  if (!product) return;
  Storage.addToCart(product, qty);
  updateCartBadge();
  showToast(`${product.name} × ${qty} added to cart!`);
}

function renderRelatedProducts(current) {
  const related = Storage.getProducts()
    .filter(p => p.category === current.category && p.id !== current.id)
    .slice(0, 4);

  const section = document.getElementById('relatedProducts');
  if (!section || related.length === 0) return;

  section.innerHTML = `
  <h2 class="section-title">You Might Also Like</h2>
  <div class="product-grid">
    ${related.map(p => createProductCard(p)).join('')}
  </div>`;

  setTimeout(() => {
    section.querySelectorAll('.product-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  }, 100);
}

// ── Debounce utility ──────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
