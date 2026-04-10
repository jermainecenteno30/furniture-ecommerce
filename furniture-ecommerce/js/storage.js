// ============================================================
// js/storage.js — localStorage Helper Functions
// ============================================================

const Storage = {
  // ── Generic ──────────────────────────────────────────────
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch { return null; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },

  // ── Products ─────────────────────────────────────────────
  getProducts() {
    const p = this.get('furni_products');
    if (!p || p.length === 0) {
      this.set('furni_products', SAMPLE_PRODUCTS);
      return SAMPLE_PRODUCTS;
    }
    return p;
  },
  saveProducts(products) {
    this.set('furni_products', products);
  },
  addProduct(product) {
    const products = this.getProducts();
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { ...product, id: newId, rating: 4.5, stock: parseInt(product.stock) || 10 };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },
  updateProduct(id, data) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) { products[idx] = { ...products[idx], ...data }; this.saveProducts(products); }
  },
  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },
  getProductById(id) {
    return this.getProducts().find(p => p.id === id) || null;
  },

  // ── Users ────────────────────────────────────────────────
  getUsers() {
    const u = this.get('furni_users');
    if (!u) {
      const defaults = [
        { id: 1, name: 'Admin User', email: 'admin@furni.com', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() },
        { id: 2, name: 'Juan dela Cruz', email: 'juan@email.com', password: 'user123', role: 'user', createdAt: new Date().toISOString() }
      ];
      this.set('furni_users', defaults);
      return defaults;
    }
    return u;
  },
  saveUsers(users) { this.set('furni_users', users); },
  addUser(user) {
    const users = this.getUsers();
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { ...user, id: newId, role: 'user', createdAt: new Date().toISOString() };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },
  getUserByEmail(email) {
    return this.getUsers().find(u => u.email === email) || null;
  },

  // ── Session ──────────────────────────────────────────────
  getSession() { return this.get('furni_session'); },
  setSession(user) { this.set('furni_session', user); },
  clearSession() { this.remove('furni_session'); },
  isLoggedIn() { return !!this.getSession(); },
  isAdmin() { const s = this.getSession(); return s && s.role === 'admin'; },

  // ── Cart ─────────────────────────────────────────────────
  getCart() { return this.get('furni_cart') || []; },
  saveCart(cart) { this.set('furni_cart', cart); },
  addToCart(product, qty = 1) {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx !== -1) {
      cart[idx].quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }
    this.saveCart(cart);
  },
  removeFromCart(id) {
    this.saveCart(this.getCart().filter(i => i.id !== id));
  },
  updateCartQty(id, qty) {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx !== -1) {
      if (qty <= 0) cart.splice(idx, 1);
      else cart[idx].quantity = qty;
      this.saveCart(cart);
    }
  },
  clearCart() { this.saveCart([]); },
  getCartTotal() {
    return this.getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
  getCartCount() {
    return this.getCart().reduce((sum, i) => sum + i.quantity, 0);
  },

  // ── Orders ───────────────────────────────────────────────
  getOrders() {
    const o = this.get('furni_orders');
    if (!o) {
      const mock = [
        { id: 'ORD-001', userId: 2, customerName: 'Juan dela Cruz', email: 'juan@email.com', items: [{ name: 'Nordic Wooden Chair', quantity: 2, price: 6800 }], total: 13600, status: 'Delivered', date: '2025-03-10', address: 'Quezon City, Metro Manila' },
        { id: 'ORD-002', userId: 2, customerName: 'Maria Santos', email: 'maria@email.com', items: [{ name: 'Velvet Lounge Sofa', quantity: 1, price: 28500 }], total: 28500, status: 'Processing', date: '2025-03-18', address: 'Makati City, Metro Manila' },
        { id: 'ORD-003', userId: 3, customerName: 'Jose Reyes', email: 'jose@email.com', items: [{ name: 'Platform Bed Frame', quantity: 1, price: 22000 }, { name: 'Marble Coffee Table', quantity: 1, price: 15800 }], total: 37800, status: 'Shipped', date: '2025-03-22', address: 'Cebu City, Cebu' }
      ];
      this.set('furni_orders', mock);
      return mock;
    }
    return o;
  },
  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this.set('furni_orders', orders);
  }
};
