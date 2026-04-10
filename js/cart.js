// ============================================================
// js/cart.js — Shopping Cart Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cartContainer');
  const checkoutContainer = document.getElementById('checkoutContainer');

  if (cartContainer) renderCart();
  if (checkoutContainer) renderCheckout();
});

// ── Render Cart Page ──────────────────────────────────────
function renderCart() {
  const cart = Storage.getCart();
  const container = document.getElementById('cartContainer');

  if (cart.length === 0) {
    container.innerHTML = `
    <div class="cart-empty">
      <div class="empty-icon" style="font-size:4rem">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything yet.</p>
      <a href="products.html" class="btn-primary">Start Shopping</a>
    </div>`;
    return;
  }

  container.innerHTML = `
  <div class="cart-layout">
    <div class="cart-items">
      <div class="cart-header">
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Subtotal</span>
        <span></span>
      </div>
      <div id="cartItemsList">${cart.map(renderCartItem).join('')}</div>
    </div>
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-rows" id="summaryRows"></div>
      <div class="summary-total" id="summaryTotal"></div>
      <a href="checkout.html" class="btn-primary btn-full">Proceed to Checkout</a>
      <a href="products.html" class="btn-outline btn-full" style="margin-top:.75rem">Continue Shopping</a>
    </div>
  </div>`;

  updateSummary();
}

function renderCartItem(item) {
  return `
  <div class="cart-item" id="item-${item.id}">
    <div class="cart-item-info">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div>
        <h4>${item.name}</h4>
        <span class="cart-item-cat">${item.category}</span>
      </div>
    </div>
    <div class="cart-item-price">${formatPrice(item.price)}</div>
    <div class="cart-item-qty">
      <button onclick="updateQty(${item.id}, ${item.quantity - 1})">−</button>
      <span>${item.quantity}</span>
      <button onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
    </div>
    <div class="cart-item-subtotal">${formatPrice(item.price * item.quantity)}</div>
    <button class="cart-item-remove" onclick="removeItem(${item.id})" aria-label="Remove">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
    </button>
  </div>`;
}

function updateQty(id, qty) {
  Storage.updateCartQty(id, qty);
  updateCartBadge();
  renderCart();
}

function removeItem(id) {
  Storage.removeFromCart(id);
  updateCartBadge();
  const el = document.getElementById(`item-${id}`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    setTimeout(() => renderCart(), 250);
  }
  showToast('Item removed from cart.');
}

function updateSummary() {
  const cart = Storage.getCart();
  const subtotal = Storage.getCartTotal();
  const shipping = subtotal > 20000 ? 0 : 299;
  const total = subtotal + shipping;

  const rows = document.getElementById('summaryRows');
  const totalEl = document.getElementById('summaryTotal');

  if (rows) {
    rows.innerHTML = `
    <div class="summary-row"><span>Subtotal (${cart.reduce((s,i)=>s+i.quantity,0)} items)</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<em>FREE</em>' : formatPrice(shipping)}</span></div>
    ${subtotal < 20000 ? `<div class="summary-note">Spend ${formatPrice(20000 - subtotal)} more for free shipping!</div>` : ''}`;
  }
  if (totalEl) {
    totalEl.innerHTML = `<span>Total</span><span>${formatPrice(total)}</span>`;
  }
}

// ── Render Checkout Page ──────────────────────────────────
function renderCheckout() {
  const cart = Storage.getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  const subtotal = Storage.getCartTotal();
  const shipping = subtotal > 20000 ? 0 : 299;
  const total = subtotal + shipping;
  const session = Storage.getSession();

  document.getElementById('checkoutContainer').innerHTML = `
  <div class="checkout-layout">
    <div class="checkout-form-col">
      <h2>Shipping Information</h2>
      <form id="checkoutForm" class="checkout-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label>First Name *</label>
            <input type="text" id="firstName" value="${session ? session.name.split(' ')[0] : ''}" required>
          </div>
          <div class="form-group">
            <label>Last Name *</label>
            <input type="text" id="lastName" value="${session ? session.name.split(' ')[1] || '' : ''}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Email Address *</label>
          <input type="email" id="checkEmail" value="${session ? session.email : ''}" required>
        </div>
        <div class="form-group">
          <label>Phone Number *</label>
          <input type="tel" id="phone" placeholder="+63 917 000 0000" required>
        </div>
        <div class="form-group">
          <label>Street Address *</label>
          <input type="text" id="street" placeholder="House/Unit No., Street Name" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>City / Municipality *</label>
            <input type="text" id="city" required>
          </div>
          <div class="form-group">
            <label>Province *</label>
            <input type="text" id="province" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Region</label>
            <select id="region">
              <option>Metro Manila (NCR)</option>
              <option>Region I – Ilocos</option>
              <option>Region II – Cagayan Valley</option>
              <option>Region III – Central Luzon</option>
              <option>Region IV-A – CALABARZON</option>
              <option>Region IV-B – MIMAROPA</option>
              <option>Region V – Bicol</option>
              <option>Region VI – Western Visayas</option>
              <option>Region VII – Central Visayas</option>
              <option>Region VIII – Eastern Visayas</option>
              <option>Region IX – Zamboanga Peninsula</option>
              <option>Region X – Northern Mindanao</option>
              <option>Region XI – Davao</option>
              <option>Region XII – SOCCSKSARGEN</option>
              <option>Region XIII – Caraga</option>
              <option>CAR – Cordillera</option>
              <option>BARMM</option>
            </select>
          </div>
          <div class="form-group">
            <label>ZIP Code *</label>
            <input type="text" id="zip" maxlength="4" placeholder="1234" required>
          </div>
        </div>

        <h2 style="margin-top:2rem">Payment Method</h2>
        <div class="payment-options">
          <label class="payment-option">
            <input type="radio" name="payment" value="cod" checked>
            <span>💵 Cash on Delivery</span>
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="gcash">
            <span>📱 GCash</span>
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="bank">
            <span>🏦 Bank Transfer</span>
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="card">
            <span>💳 Credit / Debit Card</span>
          </label>
        </div>

        <div class="form-error" id="checkoutError" style="display:none"></div>
        <button type="submit" class="btn-primary btn-full btn-large" style="margin-top:1.5rem">
          Place Order — ${formatPrice(total)}
        </button>
      </form>
    </div>

    <div class="checkout-summary-col">
      <h3>Your Order (${cart.reduce((s,i)=>s+i.quantity,0)} items)</h3>
      <div class="checkout-items">
        ${cart.map(i => `
        <div class="checkout-item">
          <img src="${i.image}" alt="${i.name}">
          <div class="checkout-item-info">
            <span class="checkout-item-name">${i.name}</span>
            <span class="checkout-item-qty">× ${i.quantity}</span>
          </div>
          <span class="checkout-item-price">${formatPrice(i.price * i.quantity)}</span>
        </div>`).join('')}
      </div>
      <div class="checkout-totals">
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
        <div class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
      </div>
    </div>
  </div>`;

  // Handle form submit
  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = ['firstName', 'lastName', 'checkEmail', 'phone', 'street', 'city', 'province', 'zip'];
    const errorEl = document.getElementById('checkoutError');
    let valid = true;

    fields.forEach(f => {
      const el = document.getElementById(f);
      if (!el.value.trim()) { el.style.borderColor = '#e74c3c'; valid = false; }
      else el.style.borderColor = '';
    });

    if (!valid) {
      errorEl.textContent = 'Please fill in all required fields.';
      errorEl.style.display = 'block';
      return;
    }

    const payment = document.querySelector('input[name="payment"]:checked').value;
    const session = Storage.getSession();
    const orderId = 'ORD-' + Date.now().toString().slice(-6);

    const order = {
      id: orderId,
      userId: session ? session.id : null,
      customerName: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
      email: document.getElementById('checkEmail').value,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      address: `${document.getElementById('street').value}, ${document.getElementById('city').value}, ${document.getElementById('province').value}`,
      payment
    };

    Storage.addOrder(order);
    Storage.clearCart();
    updateCartBadge();

    // Redirect to success page
    window.location.href = `index.html?order=${orderId}`;
  });
}
