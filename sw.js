const CACHE='studyhub-v2';
const ASSETS=['/','index.html'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  // Skip non-GET requests (POST/PUT/DELETE to Supabase, etc.)
  if(e.request.method!=='GET') return;
  // Skip Supabase and external API calls
  var url=e.request.url;
  if(url.includes('supabase.co')||url.includes('googleapis.com')||url.includes('groq.com')) return;

  e.respondWith(
    fetch(e.request).then(r=>{
      if(r.ok){
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
      }
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
