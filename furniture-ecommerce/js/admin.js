// ============================================================
// js/admin.js — Admin Dashboard Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── Guard: admin pages require admin session ──────────────
  const path = window.location.pathname;
  const isAdminLogin = path.includes('admin-login.html');

  if (!isAdminLogin) {
    if (!Storage.isAdmin()) {
      window.location.href = 'admin-login.html';
      return;
    }
  } else {
    if (Storage.isAdmin()) {
      window.location.href = 'dashboard.html';
      return;
    }
  }

  // ── Admin Login ───────────────────────────────────────────
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;
      const errorEl = document.getElementById('adminError');

      const user = Storage.getUserByEmail(email);
      if (!user || user.password !== password || user.role !== 'admin') {
        errorEl.textContent = 'Invalid admin credentials.';
        errorEl.style.display = 'block';
        return;
      }

      const { password: _, ...sessionData } = user;
      Storage.setSession(sessionData);
      window.location.href = 'dashboard.html';
    });
  }

  // ── Dashboard ─────────────────────────────────────────────
  if (path.includes('dashboard.html')) renderDashboard();

  // ── Products Management ───────────────────────────────────
  if (path.includes('add-product.html')) setupAddProduct();
  if (path.includes('edit-product.html')) setupEditProduct();

  // ── Orders ────────────────────────────────────────────────
  if (path.includes('orders.html')) renderOrders();

  // ── Users ─────────────────────────────────────────────────
  if (path.includes('users.html')) renderUsers();

  // ── Admin Navbar highlight ────────────────────────────────
  highlightAdminNav();
});

// ── Dashboard ─────────────────────────────────────────────
function renderDashboard() {
  const products = Storage.getProducts();
  const orders = Storage.getOrders();
  const users = Storage.getUsers();
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  // Stats
  setEl('statProducts', products.length);
  setEl('statOrders', orders.length);
  setEl('statUsers', users.length);
  setEl('statRevenue', formatPrice(totalRevenue));

  // Recent orders table
  renderOrdersTable(orders.slice(0, 5), 'recentOrdersBody');

  // Products table
  renderAdminProducts();
}

function renderAdminProducts() {
  const tbody = document.getElementById('adminProductsBody');
  if (!tbody) return;
  const products = Storage.getProducts();

  tbody.innerHTML = products.map(p => `
  <tr>
    <td><img src="${p.image}" alt="${p.name}" class="admin-product-thumb"></td>
    <td>${p.name}</td>
    <td>${p.category}</td>
    <td>${formatPrice(p.price)}</td>
    <td><span class="stock-badge ${p.stock < 5 ? 'low' : ''}">${p.stock}</span></td>
    <td>${p.featured ? '<span class="tag-featured">Yes</span>' : '—'}</td>
    <td class="table-actions">
      <a href="edit-product.html?id=${p.id}" class="btn-edit">Edit</a>
      <button onclick="deleteProduct(${p.id})" class="btn-delete">Delete</button>
    </td>
  </tr>`).join('');
}

function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  Storage.deleteProduct(id);
  renderAdminProducts();
  showToast('Product deleted.');
}

// ── Add Product ───────────────────────────────────────────
function setupAddProduct() {
  const form = document.getElementById('productForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = getProductFormData();
    Storage.addProduct(product);
    showToast('Product added successfully!');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });
}

// ── Edit Product ──────────────────────────────────────────
function setupEditProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = Storage.getProductById(id);
  const form = document.getElementById('productForm');
  if (!product || !form) return;

  // Pre-fill form
  document.getElementById('pName').value = product.name;
  document.getElementById('pPrice').value = product.price;
  document.getElementById('pCategory').value = product.category;
  document.getElementById('pStock').value = product.stock;
  document.getElementById('pImage').value = product.image;
  document.getElementById('pDescription').value = product.description;
  if (document.getElementById('pFeatured')) document.getElementById('pFeatured').checked = product.featured;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getProductFormData();
    Storage.updateProduct(id, data);
    showToast('Product updated!');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });
}

function getProductFormData() {
  return {
    name: document.getElementById('pName').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    category: document.getElementById('pCategory').value,
    stock: parseInt(document.getElementById('pStock').value) || 10,
    image: document.getElementById('pImage').value.trim(),
    description: document.getElementById('pDescription').value.trim(),
    featured: document.getElementById('pFeatured') ? document.getElementById('pFeatured').checked : false,
  };
}

// ── Orders ────────────────────────────────────────────────
function renderOrders() {
  const orders = Storage.getOrders();
  renderOrdersTable(orders, 'ordersBody');
  setEl('orderCount', orders.length + ' orders');
}

function renderOrdersTable(orders, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = orders.map(o => `
  <tr>
    <td><strong>${o.id}</strong></td>
    <td>${o.customerName}</td>
    <td>${o.date}</td>
    <td>${o.items.length} item${o.items.length > 1 ? 's' : ''}</td>
    <td>${formatPrice(o.total)}</td>
    <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
    <td>${o.address || '—'}</td>
  </tr>`).join('');
}

// ── Users ─────────────────────────────────────────────────
function renderUsers() {
  const users = Storage.getUsers();
  const tbody = document.getElementById('usersBody');
  if (!tbody) return;
  setEl('userCount', users.length + ' users');

  tbody.innerHTML = users.map(u => `
  <tr>
    <td>${u.id}</td>
    <td>${u.name}</td>
    <td>${u.email}</td>
    <td><span class="role-badge role-${u.role}">${u.role}</span></td>
    <td>${new Date(u.createdAt).toLocaleDateString('en-PH')}</td>
    <td>
      ${u.role !== 'admin' ? `<button onclick="toggleRole(${u.id})" class="btn-edit">Make Admin</button>` : '<em>Admin</em>'}
    </td>
  </tr>`).join('');
}

function toggleRole(id) {
  const users = Storage.getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return;
  user.role = user.role === 'admin' ? 'user' : 'admin';
  Storage.saveUsers(users);
  renderUsers();
  showToast('User role updated.');
}

// ── Helpers ───────────────────────────────────────────────
function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function highlightAdminNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    if (link.href && path.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });
}

function adminLogout() {
  Storage.clearSession();
  window.location.href = 'admin-login.html';
}
