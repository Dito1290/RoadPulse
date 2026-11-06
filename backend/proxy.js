const http = require('http');

// Proxy publik (LAN) di 8000 -> Django lokal di 8001. Bisa diubah lewat env.
const TARGET_HOST = process.env.DJANGO_HOST || '127.0.0.1';
const TARGET_PORT = Number(process.env.DJANGO_PORT || 8001);
const LISTEN_PORT = Number(process.env.PROXY_PORT || 8000);

const server = http.createServer((req, res) => {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    // Host asli dipertahankan agar cek CSRF Django Admin cocok dengan Origin browser (KI-01).
    // X-Forwarded-For dipakai DRF untuk membatasi percobaan login/daftar per IP client.
    headers: {
      ...req.headers,
      'x-forwarded-for': req.socket.remoteAddress,
      'x-forwarded-proto': 'http',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server backend tidak tersedia. Pastikan Django berjalan.', details: err.message }));
  });

  req.on('aborted', () => proxyReq.destroy());
  req.pipe(proxyReq, { end: true });
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`RoadPulse API Proxy listening on 0.0.0.0:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
