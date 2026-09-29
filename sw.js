/* 離線資料包 Service Worker：已下載的檔案（首頁、圖檔資源包、背景音樂）離線時直接從本機讀取 */
const CACHE = "offline-pack-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(handle(req, url));
});

function withTimeout(p, ms){
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

async function lookup(req){
  const cache = await caches.open(CACHE);
  let hit = await cache.match(req.url, { ignoreSearch: true });
  if (!hit && req.mode === "navigate") hit = await cache.match(new URL("index.html", self.registration.scope).href);
  return hit;
}

// iOS/Safari 播放音訊一定要支援 Range 請求，這裡自己從快取切片回應
async function rangeResponse(req, res){
  const h = req.headers.get("range");
  if (!h) return res;
  const m = /bytes=(\d*)-(\d*)/.exec(h);
  if (!m) return res;
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  let start, end;
  if (m[1] === ""){ start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
    "Content-Range": "bytes " + start + "-" + end + "/" + size,
    "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes" } });
}

async function handle(req, url){
  const isAudio = /\.(mp3|ogg|m4a|wav)$/i.test(url.pathname) || req.headers.has("range");
  const cached = await lookup(req);
  if (isAudio && cached) return rangeResponse(req, cached);
  try{
    const net = cached ? await withTimeout(fetch(req), 4000) : await fetch(req);
    if (cached && net.ok && net.status === 200){
      const c = await caches.open(CACHE);
      c.put(url.origin + url.pathname, net.clone()).catch(() => {});   // 上線時順便更新本機副本
    }
    return net;
  }catch(err){
    if (cached) return cached;
    return Response.error();
  }
}
