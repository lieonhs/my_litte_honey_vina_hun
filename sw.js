// Service worker RaVi: notifikasi pengingat + notifikasi push (pesan & telepon) saat aplikasi tertutup.
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));

self.addEventListener("push",e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:"RaVi",body:e.data&&e.data.text()}}
  const call=d.kind==="call";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{
    // pesan biasa: kalau RaVi sedang terbuka & terlihat, tidak perlu notifikasi
    if(ws.some(w=>w.visibilityState==="visible"))return; /* aplikasi terbuka: dering & layar panggilan sudah tampil di dalam aplikasi */
    return self.registration.showNotification(d.title||"RaVi",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||d.kind||"ravi",
      renotify:true,silent:false,requireInteraction:call,vibrate:call?[800,300,800,300,800,300,800]:[120,60,120],data:{url:d.url||"./?go=chat",call},
      actions:call?[{action:"answer",title:"📞 Angkat"},{action:"decline",title:"✖ Tolak"}]:/[?&]c=/.test(d.url||"")?[{action:"reply",title:"↩ Balas",type:"text",placeholder:"Ketik balasan…"},{action:"open",title:"Buka"}]:[]})}))});

self.addEventListener("notificationclick",e=>{e.notification.close();const dt=e.notification.data||{};
  if(dt.call&&e.action==="decline"){e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>ws.forEach(w=>w.postMessage({ravi:"decline"}))));return}
  let url=dt.url||"./";if(dt.call&&e.action!=="decline")url+=(url.includes("?")?"&":"?")+"ans=1";
  /* balas langsung dari jendela notifikasi (Chrome Android/desktop yang mendukung balasan teks) */
  if(e.action==="reply"){const txt=(e.reply||"").trim();
    if(!txt){url+=(url.includes("?")?"&":"?")+"rf=1"}
    else{e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{
      if(ws.length){ws[0].postMessage({ravi:"reply",url,text:txt});return}
      return self.clients.openWindow(url+(url.includes("?")?"&":"?")+"reply="+encodeURIComponent(txt.slice(0,2000)))}));return}}
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if("focus" in w){w.postMessage({ravi:"go",url});return w.focus()}}
    return self.clients.openWindow(url)}))});
