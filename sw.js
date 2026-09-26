/* Frick 3D 維修工具：離線快取（Service Worker） */
const VER='frick3d-20260926c';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js',
 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js',
 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap'];
self.addEventListener('install',e=>{ e.waitUntil((async()=>{ const c=await caches.open(VER);
  await Promise.all(CORE.map(async u=>{ try{ const r=await fetch(u,{mode:/^https?:/.test(u)&&!u.startsWith(self.location.origin)?'cors':'same-origin',cache:'reload'}); if(r.ok) await c.put(u,r); }catch(_){} }));
  self.skipWaiting(); })()); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==VER) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('fetch',e=>{ const req=e.request; if(req.method!=='GET') return; const u=new URL(req.url);
  // 主頁：先連網取最新版，失敗用快取
  if(req.mode==='navigate'||(u.origin===self.location.origin&&/\/(index\.html)?$/.test(u.pathname))){
    e.respondWith((async()=>{ const c=await caches.open(VER); try{ const r=await fetch(req); if(r.ok) c.put('./index.html',r.clone()); return r; }catch(_){ return (await c.match('./index.html'))||(await c.match('./'))||Response.error(); } })()); return; }
  // 3D 引擎、字型、圖示：先用快取，沒有才連網並存起來
  if(u.origin===self.location.origin||/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith((async()=>{ const c=await caches.open(VER); const hit=await c.match(req,{ignoreVary:true}); if(hit) return hit;
      try{ const r=await fetch(req); if(r.ok||r.type==='opaque') c.put(req,r.clone()); return r; }catch(_){ return Response.error(); } })()); } });
self.addEventListener('message',e=>{ if(e.data==='status') caches.open(VER).then(async c=>{ const ks=await c.keys(); e.source&&e.source.postMessage({type:'sw-status',n:ks.length,three:ks.some(k=>/three\.module/.test(k.url))}); }); });
