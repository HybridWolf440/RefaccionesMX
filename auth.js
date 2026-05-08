const SESSION_KEY = 'autoparts_user';
const API_BASE = 'backend';

function gaEvent(name, params = {}) {
  if (typeof gtag !== 'undefined') gtag('event', name, params);
}

function showMessage(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `auth-message ${type}`;
  el.style.display = 'block';
}

function hideMessage(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  el.textContent = '';
}

async function parseJsonSafely(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {
      success: false,
      message: 'La respuesta del servidor no es JSON válido.',
      raw: text
    };
  }
}

async function handleLogin() {
  hideMessage('login-error');
  hideMessage('login-success');

  const login = document.getElementById('login-email')?.value.trim() || '';
  const password = document.getElementById('login-password')?.value || '';

  if (!login || !password) {
    showMessage('login-error', 'Completa el correo/usuario y la contraseña.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });

    const data = await parseJsonSafely(res);

    if (!res.ok || !data.success) {
      showMessage('login-error', data.message || 'No se pudo iniciar sesión.');
      gaEvent('login_failed');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    showMessage('login-success', 'Inicio de sesión correcto. Redirigiendo…', 'success');
    gaEvent('login', { method: 'credentials', login });

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 700);
  } catch (error) {
    showMessage('login-error', 'Error de conexión con el servidor.');
  }
}

async function handleRegister() {
  hideMessage('register-error');
  hideMessage('register-success');

  const nombre = document.getElementById('register-name')?.value.trim() || '';
  const username = document.getElementById('register-user')?.value.trim() || '';
  const email = document.getElementById('register-email')?.value.trim() || '';
  const password = document.getElementById('register-password')?.value || '';
  const confirmPassword = document.getElementById('register-password-confirm')?.value || '';

  if (!nombre || !username || !email || !password || !confirmPassword) {
    showMessage('register-error', 'Completa todos los campos del registro.');
    return;
  }

  if (password.length < 8) {
    showMessage('register-error', 'La contraseña debe tener al menos 8 caracteres.');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('register-error', 'Las contraseñas no coinciden.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, username, email, password, confirmPassword })
    });

    const data = await parseJsonSafely(res);

    if (!res.ok || !data.success) {
      showMessage('register-error', data.message || 'No se pudo crear la cuenta.');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    showMessage('register-success', 'Cuenta creada correctamente. Redirigiendo…', 'success');
    gaEvent('sign_up', { method: 'credentials', email });

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 700);
  } catch (error) {
    showMessage('register-error', 'Error de conexión con el servidor.');
  }
}

async function fetchSessionFromServer() {
  try {
    const res = await fetch(`${API_BASE}/session.php`, { cache: 'no-store' });
    const data = await parseJsonSafely(res);

    if (data.authenticated && data.user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      return data.user;
    }
  } catch (error) {}

  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

async function updateNavbarAuthUI() {
  const authBtn = document.getElementById('navAuthBtn');
  const userBtn = document.getElementById('navUserBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');

  if (!authBtn || !userBtn || !logoutBtn) return;

  let user = getStoredUser();
  if (!user) user = await fetchSessionFromServer();

  if (user) {
    authBtn.style.display = 'none';
    userBtn.style.display = 'inline-flex';
    logoutBtn.style.display = 'inline-flex';
    userBtn.textContent = user.nombre || user.username || user.email || 'Usuario';
  } else {
    authBtn.style.display = 'inline-flex';
    userBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  logoutBtn.onclick = handleLogout;
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/logout.php`, { method: 'POST' });
  } catch (error) {}

  sessionStorage.removeItem(SESSION_KEY);
  gaEvent('logout');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuthUI();
});