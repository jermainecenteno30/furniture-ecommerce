// ============================================================
// js/main.js — Global Scripts: Navbar, Footer, Utilities
// ============================================================

// ── Format peso currency ──────────────────────────────────
function formatPrice(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Determine base path (admin pages are one level deep) ──
function getBasePath() {
  return window.location.pathname.includes('/admin/') ? '../' : '';
}

// ── Render Navbar ─────────────────────────────────────────
function renderNavbar() {
  const base = getBasePath();
  const session = Storage.getSession();
  const cartCount = Storage.getCartCount();
  const isAdmin = Storage.isAdmin();

  let userMenu = '';
  if (session) {
    if (isAdmin) {
      userMenu = `<a href="${base}admin/dashboard.html" class="nav-link">Dashboard</a>
      <a href="#" class="nav-link" onclick="logout()">Logout</a>`;
    } else {
      userMenu = `<span class="nav-greeting">Hi, ${session.name.split(' ')[0]}</span>
      <a href="#" class="nav-link" onclick="logout()">Logout</a>`;
    }
  } else {
    userMenu = `<a href="${base}login.html" class="nav-link">Login</a>
    <a href="${base}signup.html" class="nav-btn">Sign Up</a>`;
  }

  const navbar = `
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="${base}index.html" class="nav-logo">
        <span class="logo-icon">◈</span> FURNI
      </a>
      <button class="nav-hamburger" id="hamburger" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks">
        <a href="${base}index.html" class="nav-link">Home</a>
        <a href="${base}products.html" class="nav-link">Shop</a>
        <a href="${base}cart.html" class="nav-link cart-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Cart
          ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : '<span class="cart-badge" id="cartBadge" style="display:none">0</span>'}
        </a>
        <div class="nav-user">${userMenu}</div>
      </div>
    </div>
  </nav>`;

  const container = document.getElementById('navbar-container');
  if (container) container.innerHTML = navbar;

  // Hamburger toggle
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (ham && links) {
    ham.addEventListener('click', () => {
      links.classList.toggle('open');
      ham.classList.toggle('active');
    });
  }

  // Scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── Render Footer ─────────────────────────────────────────
function renderFooter() {
  const base = getBasePath();
  const footer = `
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="footer-logo"><span class="logo-icon">◈</span> FURNI</div>
        <p>Crafting beautiful spaces for Filipino homes. Every piece tells a story of quality and timeless design.</p>
        <div class="footer-social">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">in</a>
          <a href="#" aria-label="Pinterest">P</a>
        </div>
      </div>
      <div class="footer-links">
        <h4>Shop</h4>
        <a href="${base}products.html?category=Chairs">Chairs</a>
        <a href="${base}products.html?category=Sofas">Sofas</a>
        <a href="${base}products.html?category=Tables">Tables</a>
        <a href="${base}products.html?category=Beds">Beds</a>
        <a href="${base}products.html?category=Storage">Storage</a>
      </div>
      <div class="footer-links">
        <h4>Help</h4>
        <a href="#">FAQ</a>
        <a href="#">Shipping Info</a>
        <a href="#">Returns</a>
        <a href="#">Track Order</a>
      </div>
      <div class="footer-contact">
        <h4>Contact</h4>
        <p>📍 Makati City, Metro Manila, Philippines</p>
        <p>📞 +63 917 123 4567</p>
        <p>✉️ hello@furni.ph</p>
        <p>Mon–Sat: 9AM – 6PM</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 FURNI. All rights reserved. | Philippines</p>
    </div>
  </footer>`;

  const container = document.getElementById('footer-container');
  if (container) container.innerHTML = footer;
}

// ── Logout ────────────────────────────────────────────────
function logout() {
  Storage.clearSession();
  const base = getBasePath();
  window.location.href = base + 'index.html';
}

// ── Toast Notification ────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Update cart badge dynamically ────────────────────────
function updateCartBadge() {
  const count = Storage.getCartCount();
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ── Init on DOM ready ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  updateCartBadge();
});
