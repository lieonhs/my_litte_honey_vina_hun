// Service worker kecil: hanya untuk menampilkan notifikasi pengingat & membuka aplikasi saat diketuk.
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick",e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{for(const w of ws){if("focus" in w)return w.focus()}return self.clients.openWindow("./")}))});
