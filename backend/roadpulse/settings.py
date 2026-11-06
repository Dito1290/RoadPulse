"""
Django settings for roadpulse project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-roadpulse-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'


def _env_list(name, default=''):
    return [v.strip() for v in os.getenv(name, default).split(',') if v.strip()]


# Produksi wajib memakai SECRET_KEY sendiri (python -c "import secrets; print(secrets.token_urlsafe(50))").
if not DEBUG and (SECRET_KEY.startswith('django-insecure') or len(SECRET_KEY) < 50):
    raise ImproperlyConfigured('DEBUG=False: isi SECRET_KEY acak minimal 50 karakter di .env')

# Allowed Hosts configuration
ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]


def _lan_ips():
    """IP LAN komputer saat ini (berubah tiap ganti Wi-Fi/hotspot)."""
    import socket
    ips = set()
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('10.255.255.255', 1))  # tidak mengirim paket; hanya memilih interface
            ips.add(s.getsockname()[0])
    except OSError:
        pass
    try:
        ips.update(socket.gethostbyname_ex(socket.gethostname())[2])
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith('127.'))


# Mode development: HP & browser lain di LAN memanggil lewat proxy dengan Host = IP LAN komputer.
# Proxy meneruskan Host asli agar CSRF Django Admin cocok, jadi IP LAN perlu diizinkan.
# IP dibaca ulang tiap request, bukan sekali saat start, supaya pindah Wi-Fi/hotspot tidak butuh restart.
class _HostsWithLan(list):
    def __iter__(self):
        yield from list.__iter__(self)
        yield from _lan_ips()


if DEBUG and '*' not in ALLOWED_HOSTS and os.getenv('ALLOW_LAN_HOSTS', 'True') == 'True':
    ALLOWED_HOSTS = _HostsWithLan(ALLOWED_HOSTS)


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework.authtoken',
    'rest_framework',
    'drf_spectacular',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS: bebas saat development; di produksi hanya domain di CORS_ALLOWED_ORIGINS.
# Dashboard yang dilayani dari domain yang sama dengan API (deploy/Caddyfile) dan aplikasi
# mobile tidak membutuhkan CORS, jadi daftar ini boleh kosong.
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = _env_list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = False  # API memakai header Authorization: Token, bukan cookie

# Asal (https://domain) yang boleh mengirim form ke Django Admin di belakang reverse proxy.
CSRF_TRUSTED_ORIGINS = _env_list('CSRF_TRUSTED_ORIGINS')

ROOT_URLCONF = 'roadpulse.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'roadpulse.wsgi.application'


# Database Configuration (PostgreSQL with .env fallback)
# DB_ENGINE=sqlite memakai SQLite lokal (SQLITE_PATH, default backend/db.sqlite3).
DB_ENGINE = os.getenv('DB_ENGINE', 'postgresql').lower()

if DB_ENGINE in ('sqlite', 'sqlite3'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.getenv('SQLITE_PATH', str(BASE_DIR / 'db.sqlite3')),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'roadpulse_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', '127.0.0.1'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Jakarta'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = Path(os.getenv('STATIC_ROOT', BASE_DIR / 'staticfiles'))

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = Path(os.getenv('MEDIA_ROOT', BASE_DIR / 'media'))

# Batas unggahan: foto maksimal 10 MB (divalidasi di api/preprocessor), sisanya untuk field form.
DATA_UPLOAD_MAX_MEMORY_SIZE = 12 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ] + (['rest_framework.renderers.BrowsableAPIRenderer'] if DEBUG else []),
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    # Token dulu agar client mobile/frontend menerima 401 + WWW-Authenticate,
    # Session tetap untuk Browsable API & admin.
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    # Data inspeksi hanya untuk pengguna yang sudah login; login/daftar diberi AllowAny di view-nya.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # Batas percobaan: login/daftar per IP, unggah foto per akun (lihat throttle_scope di views).
    # NUM_PROXIES=1: IP client dibaca dari X-Forwarded-For yang diisi backend/proxy.js (dev) atau Caddy (produksi).
    'DEFAULT_THROTTLE_RATES': {
        'login': os.getenv('THROTTLE_LOGIN', '10/min'),
        'register': os.getenv('THROTTLE_REGISTER', '5/hour'),
        'classify': os.getenv('THROTTLE_CLASSIFY', '120/hour'),
    },
    'NUM_PROXIES': int(os.getenv('NUM_PROXIES', '1')),
    # Semua error API (termasuk error tak terduga) dikembalikan sebagai JSON.
    'EXCEPTION_HANDLER': 'api.exceptions.json_exception_handler',
}

# Ditampilkan di halaman /privacy/ (Kebijakan Privasi).
PRIVACY_CONTACT_EMAIL = os.getenv('PRIVACY_CONTACT_EMAIL', '')
PRIVACY_EFFECTIVE_DATE = os.getenv('PRIVACY_EFFECTIVE_DATE', '6 November 2026')

SPECTACULAR_SETTINGS = {
    'TITLE': 'RoadPulse API',
    'DESCRIPTION': 'API untuk autentikasi, klasifikasi kondisi jalan, dashboard, riwayat inspeksi, dan data peta.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ── Keamanan produksi (DEBUG=False, di belakang reverse proxy HTTPS) ──
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
    SECURE_REDIRECT_EXEMPT = [r'^healthz/$']  # health check internal Docker lewat HTTP
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '2592000'))  # 30 hari
    SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'False') == 'True'
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'same-origin'
    X_FRAME_OPTIONS = 'DENY'
    # Sengaja tidak diaktifkan default: preload sulit dibatalkan, dan includeSubDomains
    # bisa memutus subdomain lain milik pemilik domain yang belum HTTPS.
    SILENCED_SYSTEM_CHECKS = ['security.W021'] + ([] if SECURE_HSTS_INCLUDE_SUBDOMAINS else ['security.W005'])

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': os.getenv('LOG_LEVEL', 'INFO')},
    'loggers': {'django.security.DisallowedHost': {'handlers': ['console'], 'level': 'ERROR', 'propagate': False}},
}
