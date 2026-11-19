// Service worker ของแอป "สแกนซับจากวิดีโอ → .srt"
// กลยุทธ์: เอาจากเครือข่ายก่อนเสมอ (ได้เวอร์ชันล่าสุดทุกครั้งที่ออนไลน์) ถ้าออฟไลน์ค่อยใช้ของที่แคชไว้
// ไม่ยุ่งกับคำขอไปยังโดเมนอื่น (CDN ของ OCR/Whisper, API ของ AI) ปล่อยให้เบราว์เซอร์จัดการเอง
const CACHE = 'video-to-srt-shell';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'manifest.webmanifest'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./')))
  );
});
