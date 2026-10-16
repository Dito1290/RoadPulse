const API_BASE_URL = 'http://localhost:8000/api/v1';

// Kalau sudah login, langsung ke dashboard
if (localStorage.getItem('rp_token')) {
    window.location.href = 'index.html';
}

const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const passwordInput = document.getElementById('password');

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
}

document.getElementById('togglePassword').addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showError('Username dan kata sandi wajib diisi.');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Memproses...';

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('rp_token', data.token);
            window.location.href = 'index.html';
        } else {
            showError(data.error || 'Login gagal. Coba lagi.');
        }
    } catch (err) {
        showError('Tidak bisa terhubung ke server. Pastikan backend sudah berjalan.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Masuk';
    }
});