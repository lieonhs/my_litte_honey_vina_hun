/* =====================================================================
   NOTIFIKASI PUSH + STATUS ONLINE / TERAKHIR DILIHAT
   - Web Push (kunci dari Edge Function "ravi")
   - Status online semua anggota lewat Realtime presence (channel privat "ravi-presence").
     "Online" = aplikasi sedang terbuka & terlihat di salah satu perangkatnya.
   - window.RAVI_NOTIFY(kind,{conv,to,body}) dipanggil chat/feed/telepon
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const P={me:null,ch:null,ready:null,state:{},lastPush:{},conv:null,seenT:0};
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const supported=()=>"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
const b64=s=>{const p="=".repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};

async function fn(body){const {data,error}=await sb.functions.invoke("ravi",{body});if(error)throw error;if(data&&data.error)throw new Error(data.error);return data}
window.RAVI_FN=fn;

/* ---------- presence ---------- */
function emit(){document.dispatchEvent(new CustomEvent("ravi-presence"))}
function sync(){const st=P.ch?P.ch.presenceState():{};const out={};
  for(const [k,metas] of Object.entries(st))out[k]=(metas||[]).filter(m=>m&&m.vis);P.state=out;emit()}
async function ready(){if(P.ready)return P.ready;P.ready=(async()=>{
  const {data:s}=await sb.auth.getSession();P.me=s?.session?.user?.id;if(!P.me)throw new Error("login");
  P.ch=sb.channel("ravi-presence",{config:{private:true,presence:{key:P.me}}});
  P.ch.on("presence",{event:"sync"},sync).on("presence",{event:"leave"},({key})=>{if(key&&window.RS&&RS.S.members[key]&&!(P.state[key]||[]).length)RS.S.members[key].last_seen=new Date().toISOString();sync()});
  P.ch.subscribe(st=>{if(st==="SUBSCRIBED")track()});
  document.addEventListener("visibilitychange",()=>{track();seen(true)});
  addEventListener("pagehide",()=>{seen(true)});
  setInterval(()=>{if(!document.hidden)seen()},60000);seen(true);
  return true})();P.ready.catch(()=>{P.ready=null});return P.ready}
function track(){try{if(!P.ch)return;if(document.hidden)P.ch.untrack();else P.ch.track({vis:true,conv:P.conv||null,t:Date.now()})}catch(e){}}
function seen(force){if(!force&&Date.now()-P.seenT<50000)return;P.seenT=Date.now();try{sb.rpc("ravi_seen").then(()=>{},()=>{})}catch(e){}}
window.RAVI_PRESENCE={
  online:u=>!!(P.state[u]&&P.state[u].length),
  inConv:(u,c)=>!!(P.state[u]||[]).some(m=>m.conv===c),
  setConv:c=>{P.conv=c||null;track()},
  ready};

/* ---------- kirim notifikasi ---------- */
window.RAVI_NOTIFY=async function(kind,o){o=o||{};
  try{await ready()}catch(e){return}
  let to=o.to||null;const conv=o.conv||null;
  /* yang sedang membuka chat itu tidak perlu dikirimi notifikasi */
  const skip=[];if(kind==="msg"&&conv){const k=conv;if(Date.now()-(P.lastPush[k]||0)<6000)return;P.lastPush[k]=Date.now()}
  for(const u of Object.keys(P.state))if(u!==P.me&&(kind==="msg"?window.RAVI_PRESENCE.inConv(u,conv):kind==="post"?window.RAVI_PRESENCE.online(u):false))skip.push(u);
  if(to)to=to.filter(u=>!skip.includes(u));if(to&&!to.length)return;
  try{await fn({action:"push",kind,conv,to,skip,title:o.title,body:o.body,url:o.url||"./?go="+(kind==="post"?"feed":kind==="act"?"notif":"chat")+(conv?"&c="+conv:""),tag:(kind==="msg"&&conv?"m"+conv.slice(0,8):kind)})}catch(e){}};

/* ---------- berlangganan push ---------- */
async function subscribe(){
  if(!supported())throw new Error(isIOS&&!standalone?L("Di iPhone, tambahkan RaVi ke Home Screen dulu (Safari → Bagikan → Tambah ke Layar Utama), lalu buka dari ikon itu.","On iPhone, add RaVi to the Home Screen first (Safari → Share → Add to Home Screen), then open it from that icon."):L("Browser ini tidak mendukung notifikasi push.","This browser doesn't support push notifications."));
  const perm=await Notification.requestPermission();if(perm!=="granted")throw new Error(L("Izin notifikasi ditolak. Izinkan lewat ikon gembok di address bar → Notifikasi.","Notification permission denied. Allow it via the lock icon → Notifications."));
  const {publicKey}=await fn({action:"vapid"});
  const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(sub){const cur=sub.options&&sub.options.applicationServerKey;if(cur&&btoa(String.fromCharCode(...new Uint8Array(cur))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")!==publicKey){await sub.unsubscribe();sub=null}}
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(publicKey)});
  const j=sub.toJSON();const {error}=await sb.from("push_subs").upsert({endpoint:j.endpoint,sub:j});if(error)throw error;
  try{localStorage.setItem("bbp_push_ok","1")}catch(e){}return true}
async function pushState(){if(!supported())return isIOS&&!standalone?"ios":"unsupported";if(Notification.permission==="denied")return "denied";
  try{const reg=await navigator.serviceWorker.getRegistration();const s=reg&&await reg.pushManager.getSubscription();return s&&Notification.permission==="granted"?"on":"off"}catch(e){return "off"}}
/* banner kecil (dipakai daftar chat) */
async function banner(host){if(!host||host.querySelector(".pn-bar"))return;try{if(+localStorage.getItem("bbp_pn_later")>Date.now())return}catch(e){}
  const st=await pushState();if(st==="on"||st==="unsupported")return;if(host.querySelector(".pn-bar"))return;
  const bar=document.createElement("div");bar.className="pn-bar";
  bar.innerHTML=st==="denied"?`<span>🔕</span><div style="flex:1"><b>${L("Notifikasi diblokir","Notifications blocked")}</b>${L("Izinkan lewat ikon gembok di address bar → Notifikasi.","Allow them via the lock icon → Notifications.")}</div>`
   :`<span>🔔</span><div style="flex:1"><b>${L("Aktifkan notifikasi","Turn on notifications")}</b>${st==="ios"?L("Di iPhone: tambahkan RaVi ke Home Screen dulu, lalu buka dari ikonnya.","On iPhone: add RaVi to the Home Screen first, then open it from the icon."):L("Supaya telepon & pesan tetap masuk walau RaVi tertutup.","So calls and messages arrive even when RaVi is closed.")}</div>${st==="ios"?"":`<button class="sm pri" id="pnOn">${L("Aktifkan","Turn on")}</button>`}`;
  const later=document.createElement("button");later.className="sm";later.textContent=L("Nanti","Later");later.onclick=()=>{try{localStorage.setItem("bbp_pn_later",String(Date.now()+3*864e5))}catch(e){}bar.remove()};bar.appendChild(later);
  host.prepend(bar);
  const b=bar.querySelector("#pnOn");if(b)b.onclick=async()=>{b.disabled=true;b.textContent="…";try{await subscribe();bar.remove();status(L("Notifikasi aktif di perangkat ini 🔔","Notifications on for this device 🔔"),"ok")}catch(e){b.disabled=false;b.textContent=L("Aktifkan","Turn on");status(e.message||String(e),"warn")}}}
const css=document.createElement("style");css.textContent=`.pn-bar{display:flex;gap:8px;align-items:center;padding:8px 12px;background:var(--ambS);border:1px solid var(--line);border-radius:14px;margin:0 0 8px;font-size:12.5px;line-height:1.4}
.pn-bar b{display:block}.pn-bar .pri{flex:none}`;document.head.appendChild(css);
window.RAVI_PUSH_SUBSCRIBE=subscribe;window.RAVI_PUSH_STATE=pushState;window.RAVI_PUSH_BANNER=banner;

/* ---------- buka dari notifikasi: ?go=chat&c=<id> ---------- */
function goFromUrl(u){try{const q=new URL(u,location.href).searchParams,g=q.get("go"),c=q.get("c");
  if(q.get("ans")==="1"&&window.RAVI_CALL)window.RAVI_CALL.autoAnswer();
  if(g==="chat"&&c&&window.RAVI_CHAT){go("chat");window.RAVI_CHAT.open(c);return}
  if(g&&window.EXTRA_VIEWS&&window.EXTRA_VIEWS[g])go(g)}catch(e){}}
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.ravi==="go")goFromUrl(e.data.url);if(e.data&&e.data.ravi==="decline"&&window.RAVI_CALL)window.RAVI_CALL.decline()});
addEventListener("load",()=>{const href=location.href,has=new URLSearchParams(location.search).get("go")||new URLSearchParams(location.search).get("ans");
  if(new URLSearchParams(location.search).get("ans")==="1"){const w=setInterval(()=>{if(window.RAVI_CALL){clearInterval(w);window.RAVI_CALL.autoAnswer()}},100);setTimeout(()=>clearInterval(w),5000)}
  const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);ready().catch(()=>{});
    if(has){setTimeout(()=>goFromUrl(href),300);history.replaceState(null,"",location.pathname)}
    if(localStorage.getItem("bbp_push_ok")==="1"&&window.Notification&&Notification.permission==="granted")subscribe().catch(()=>{})}},500);setTimeout(()=>clearInterval(t),60000)});
})();
