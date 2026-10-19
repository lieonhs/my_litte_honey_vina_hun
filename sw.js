// Service worker RaVi: notifikasi pengingat + notifikasi push (pesan & telepon) saat aplikasi tertutup.
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));

self.addEventListener("push",e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:"RaVi",body:e.data&&e.data.text()}}
  const call=d.kind==="call";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{
    // pesan biasa: kalau RaVi sedang terbuka & terlihat, tidak perlu notifikasi
    if(!call&&ws.some(w=>w.visibilityState==="visible"))return;
    return self.registration.showNotification(d.title||"RaVi",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||d.kind||"ravi",
      renotify:true,requireInteraction:call,vibrate:call?[500,250,500,250,500,250,500]:[120,60,120],data:{url:d.url||"./?go=chat"}})}))});

self.addEventListener("notificationclick",e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||"./";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if("focus" in w){w.postMessage({ravi:"go",url});return w.focus()}}
    return self.clients.openWindow(url)}))});
