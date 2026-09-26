/* 離線功能已取消：這個檔案只負責把手機上舊的離線快取清掉並自我移除 */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister(); const cs=await self.clients.matchAll({type:'window'}); cs.forEach(c=>c.navigate(c.url)); })()); });
