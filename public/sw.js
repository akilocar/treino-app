// Guarda a tela do app para abrir mesmo sem internet. Os dados (/api) e os vídeos nunca são guardados aqui.
const CACHE = 'treino-20261119-2151';
const ARQUIVOS = ['/', '/manifest.webmanifest', '/icone.svg', '/icone-192.png', '/icone-512.png', '/icone-180.png'].concat(
  ['entrada', 'corpo', 'pernas', 'gluteo', 'costas', 'peito', 'ombros', 'bracos', 'abdomen', 'aparelhos', 'evolucao'].flatMap((n) => ['/fundos/' + n + '.webp', '/fundos/m-' + n + '.webp']));
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  // rede primeiro (sempre a versão mais nova); sem internet, usa a cópia guardada
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok && (url.pathname === "/" || ARQUIVOS.includes(url.pathname))) {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(url.pathname === '/index.html' ? '/' : e.request, copia));
      }
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match('/')))
  );
});
