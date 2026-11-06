// API_BASE_URL berasal dari js/config.js

// Kalau sudah login, langsung ke dashboard
if (localStorage.getItem('rp_token')) {
    window.location.href = 'index.html';
}

const USERNAME_RE = /^[A-Za-z0-9_.]+$/;
const COPY = {
    login: {
        ey: 'MASUK', title: 'Selamat datang kembali', sub: 'Masuk ke dashboard RoadPulse untuk melanjutkan inspeksi.',
        cta: 'Masuk', busy: 'Memproses...', foot: 'Belum punya akun? ', link: 'Daftar sekarang',
    },
    register: {
        ey: 'DAFTAR', title: 'Buat akun baru', sub: 'Gratis untuk petugas & warga yang ingin melaporkan jalan rusak.',
        cta: 'Daftar & masuk', busy: 'Membuat akun...', foot: 'Sudah punya akun? ', link: 'Masuk di sini',
    },
};

const $ = (id) => document.getElementById(id);
const form = $('loginForm');
const errorBox = $('loginError');
const loginBtn = $('loginBtn');
const usernameInput = $('username');
const passwordInput = $('password');
const confirmInput = $('passwordConfirm');
const helps = { username: $('usernameHelp'), password: $('passwordHelp'), password_confirm: $('confirmHelp') };
let mode = 'login';

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
}

function setHelp(key, text, kind = '') {
    const el = helps[key];
    el.textContent = text || '';
    el.className = `help${kind ? ` ${kind}` : ''}`;
    el.closest('.field').classList.toggle('invalid', kind === 'err');
}

function resetHelps() {
    setHelp('username', mode === 'register' ? '3–30 karakter: huruf, angka, titik, atau garis bawah.' : '');
    setHelp('password', mode === 'register' ? 'Minimal 8 karakter; gabungkan huruf besar, kecil, dan angka.' : '');
    setHelp('password_confirm', '');
}

function setMode(next) {
    mode = next;
    const c = COPY[mode];
    const isReg = mode === 'register';
    $('formEyebrow').textContent = c.ey;
    $('formTitle').textContent = c.title;
    $('formSub').textContent = c.sub;
    loginBtn.textContent = c.cta;
    $('formFoot').firstChild.textContent = c.foot;
    $('switchMode').textContent = c.link;
    $('confirmField').hidden = !isReg;
    $('tabLogin').classList.toggle('active', !isReg);
    $('tabRegister').classList.toggle('active', isReg);
    $('tabLogin').setAttribute('aria-selected', String(!isReg));
    $('tabRegister').setAttribute('aria-selected', String(isReg));
    passwordInput.autocomplete = isReg ? 'new-password' : 'current-password';
    document.title = `${isReg ? 'Daftar' : 'Masuk'} - RoadPulse`;
    errorBox.hidden = true;
    confirmInput.value = '';
    resetHelps();
}

$('tabLogin').addEventListener('click', () => setMode('login'));
$('tabRegister').addEventListener('click', () => setMode('register'));
$('switchMode').addEventListener('click', (e) => {
    e.preventDefault();
    setMode(mode === 'login' ? 'register' : 'login');
});
if (location.hash === '#daftar') setMode('register');
window.addEventListener('hashchange', () => setMode(location.hash === '#daftar' ? 'register' : 'login'));

$('togglePassword').addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    confirmInput.type = passwordInput.type;
    $('togglePassword').setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
});

confirmInput.addEventListener('input', () => {
    if (confirmInput.value && confirmInput.value === passwordInput.value) setHelp('password_confirm', '✓ Kata sandi cocok', 'ok');
    else setHelp('password_confirm', '');
});

function validateLocal(username, password, confirm) {
    const errs = {};
    if (!username) errs.username = 'Username wajib diisi.';
    if (!password) errs.password = 'Kata sandi wajib diisi.';
    if (mode === 'register') {
        if (username && (username.length < 3 || username.length > 30)) errs.username = 'Username 3–30 karakter.';
        else if (username && !USERNAME_RE.test(username)) errs.username = 'Hanya huruf, angka, titik, dan garis bawah.';
        if (password && password.length < 8) errs.password = 'Minimal 8 karakter.';
        if (!confirm) errs.password_confirm = 'Ulangi kata sandi.';
        else if (password !== confirm) errs.password_confirm = 'Kata sandi tidak sama.';
    }
    return errs;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    resetHelps();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    const errs = validateLocal(username, password, confirm);
    if (Object.keys(errs).length) {
        Object.entries(errs).forEach(([k, v]) => setHelp(k, v, 'err'));
        return;
    }

    const c = COPY[mode];
    loginBtn.disabled = true;
    loginBtn.textContent = c.busy;

    try {
        const isReg = mode === 'register';
        const res = await fetch(`${API_BASE_URL}/auth/${isReg ? 'register' : 'login'}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(isReg ? { username, password, password_confirm: confirm } : { username, password }),
        });
        let data = {};
        try { data = await res.json(); } catch (_) { /* respons bukan JSON */ }

        if (res.ok && data.token) {
            localStorage.setItem('rp_token', data.token);
            localStorage.setItem('rp_username', data.username || username);
            window.location.href = 'index.html';
            return;
        }
        const fields = data.fields || {};
        Object.entries(fields).forEach(([k, v]) => helps[k] && setHelp(k, Array.isArray(v) ? v[0] : String(v), 'err'));
        if (!Object.keys(fields).length) showError(data.error || `Permintaan gagal (HTTP ${res.status}). Coba lagi.`);
    } catch (err) {
        showError('Tidak bisa terhubung ke server. Pastikan backend sudah berjalan (./start.sh).');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = c.cta;
    }
});
