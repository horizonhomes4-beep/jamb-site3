const CACHE_NAME="mathcloud-jamb-v3";
const CORE=[
  "./index.html","./student.html","./demo.html","./offline.html",
  "./assets/style.css","./assets/app.js","./assets/firebase-config.js","./assets/logo.png"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match("./offline.html"))));
  }else if(req.destination==="script" || req.destination==="style" || req.destination==="font"){
    event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)).catch(()=>{}); return res;
    })));
  }
});
