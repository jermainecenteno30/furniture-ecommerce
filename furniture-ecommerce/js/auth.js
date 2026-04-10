// ============================================================
// js/auth.js — Login / Signup Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in (for login/signup pages only)
  const path = window.location.pathname;
  const isAuthPage = path.includes('login.html') || path.includes('signup.html');

  if (isAuthPage && Storage.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // ── Login Form ────────────────────────────────────────────
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('authError');

      const user = Storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        errorEl.textContent = 'Invalid email or password.';
        errorEl.style.display = 'block';
        return;
      }

      // Save session (don't store password)
      const { password: _, ...sessionData } = user;
      Storage.setSession(sessionData);

      showToast('Welcome back, ' + user.name.split(' ')[0] + '!');
      setTimeout(() => {
        window.location.href = user.role === 'admin' ? 'admin/dashboard.html' : 'index.html';
      }, 600);
    });
  }

  // ── Signup Form ───────────────────────────────────────────
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirmPassword').value;
      const errorEl = document.getElementById('authError');

      if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.style.display = 'block';
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters.';
        errorEl.style.display = 'block';
        return;
      }
      if (Storage.getUserByEmail(email)) {
        errorEl.textContent = 'An account with this email already exists.';
        errorEl.style.display = 'block';
        return;
      }

      const newUser = Storage.addUser({ name, email, password });
      const { password: _, ...sessionData } = newUser;
      Storage.setSession(sessionData);

      showToast('Account created! Welcome, ' + name.split(' ')[0] + '!');
      setTimeout(() => { window.location.href = 'index.html'; }, 600);
    });
  }
});
