if (isLoggedIn()) window.location.href = 'blog.html';

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msg = document.getElementById('registerMessage');
    const btn = document.getElementById('regSubmitBtn');

    if (!name || !email || !password) return showMsg(msg, 'Please fill in all fields.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg(msg, 'Please enter a valid email.', 'error');
    if (password.length < 6) return showMsg(msg, 'Password must be ≥ 6 characters.', 'error');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating…';
    hideMsg(msg);

    try {
      await AuthAPI.register(name, email, password);
      showMsg(msg, '✓ Account created! Redirecting to login…', 'success');
      registerForm.reset();
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch (err) {
      showMsg(msg, err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Register';
    }
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMessage');
    const btn = document.getElementById('loginSubmitBtn');

    if (!email || !password) return showMsg(msg, 'Please enter email and password.', 'error');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in…';
    hideMsg(msg);

    try {
      const data = await AuthAPI.login(email, password);
      setSession({ id: data.user.id, name: data.user.name, email: data.user.email });
      showMsg(msg, '✓ Login successful! Loading…', 'success');
      setTimeout(() => { window.location.href = 'blog.html'; }, 700);
    } catch (err) {
      showMsg(msg, err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Login';
    }
  });
}
