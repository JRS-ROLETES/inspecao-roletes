// Service worker da Inspeção de Rolos: guarda os arquivos do app para abrir sem internet.
// Os dados NÃO passam por aqui: ficam no celular e no servidor.
const C = 'inspecao-roletes-v11';
const SHELL = ['./', 'index.html', 'painel.html', 'manifest.webmanifest', 'cavalete.jpg', 'cavalete-legenda.jpg', 'dosadora.jpg', 'dosadora-legenda.jpg', 'autoalinhador.jpg', 'autoalinhador-legenda.jpg', 'partes.jpg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      // apaga só versões antigas DESTE app; não mexe nos caches dos outros apps
      .then(ks => Promise.all(ks.filter(k => k !== C && k.indexOf('inspecao-roletes-') === 0).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.url.indexOf('http') !== 0) return;
  if (new URL(r.url).origin !== self.location.origin) return;   // o servidor nunca é guardado
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res && res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
        return res;
      })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html')))
  );
});
