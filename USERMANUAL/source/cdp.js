// Minimal Chrome DevTools Protocol client (Node 24: global WebSocket & fetch, tanpa dependency).
const { spawn } = require('child_process');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch(profileDir, port = 9333) {
  const proc = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required', '--lang=id-ID',
    '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
    'about:blank',
  ], { stdio: 'ignore' });
  let info;
  for (let i = 0; i < 60 && !info; i++) {
    try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(250); }
  }
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? reject(new Error(`${msg.error.message}`)) : resolve(msg.result);
    } else if (msg.method) listeners.forEach((fn) => fn(msg));
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const mid = ++id; pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const browser = {
    send, listeners, sleep,
    async close() { try { await send('Browser.close'); } catch {} proc.kill(); },
    async newContext() { return (await send('Target.createBrowserContext', { disposeOnDetach: true })).browserContextId; },
    async newPage(ctx, { width = 1440, height = 900, scale = 1.5, mobile = false } = {}) {
      const { targetId } = await send('Target.createTarget', { url: 'about:blank', ...(ctx ? { browserContextId: ctx } : {}) });
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
      const s = (m, p) => send(m, p, sessionId);
      await s('Page.enable'); await s('Runtime.enable'); await s('DOM.enable');
      await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });
      await s('Page.bringToFront');
      await s('Emulation.setFocusEmulationEnabled', { enabled: true });
      const page = {
        sessionId, send: s, dialogs: [],
        on(method, fn) { listeners.push((m) => m.sessionId === sessionId && m.method === method && fn(m.params)); },
        waitFor(method, timeout = 20000) {
          return new Promise((resolve) => {
            const t = setTimeout(() => resolve(null), timeout);
            listeners.push((m) => { if (m.sessionId === sessionId && m.method === method) { clearTimeout(t); resolve(m.params); } });
          });
        },
        async goto(url, wait = 1500) {
          const loaded = page.waitFor('Page.loadEventFired');
          await s('Page.navigate', { url }); await loaded; await sleep(wait);
        },
        async eval(expression) {
          const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
          if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
          return r.result.value;
        },
        async waitUntil(expression, timeout = 30000) {
          const end = Date.now() + timeout;
          while (Date.now() < end) { if (await page.eval(expression)) return true; await sleep(300); }
          throw new Error(`Timeout waiting for: ${expression}`);
        },
        async setFile(selector, file) {
          const { root } = await s('DOM.getDocument', { depth: -1 });
          const { nodeId } = await s('DOM.querySelector', { nodeId: root.nodeId, selector });
          await s('DOM.setFileInputFiles', { nodeId, files: [file] });
        },
        async type(selector, text) {
          await page.eval(`document.querySelector(${JSON.stringify(selector)}).focus()`);
          await s('Input.insertText', { text });
        },
        async shot(path, selector, pad = 0) {
          const fs = require('fs');
          let params = { format: 'png', captureBeyondViewport: !!selector };
          if (selector) {
            const r = await page.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)});
              e.scrollIntoView({block:'start'}); const b = e.getBoundingClientRect();
              return {x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height}; })()`);
            await sleep(600);
            params.clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + pad * 2, height: r.h + pad * 2, scale: 1 };
          }
          const { data } = await s('Page.captureScreenshot', params);
          fs.writeFileSync(path, Buffer.from(data, 'base64'));
        },
      };
      page.on('Page.javascriptDialogOpening', async (p) => {
        page.dialogs.push(p.message);
        await s('Page.handleJavaScriptDialog', { accept: true });
      });
      return page;
    },
  };
  return browser;
}
module.exports = { launch, sleep };
