/* =====================================================================
   NOTIFIKASI PUSH + STATUS ONLINE PASANGAN
   - Berlangganan Web Push (kunci dari Edge Function "ravi")
   - Status online pasangan (Realtime presence, channel privat)
   - window.RAVI_NOTIFY(kind, {...}) dipanggil chat/feed/telepon
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const P={me:null,other:null,name:"",ch:null,peer:null,ready:null,lastMsgPush:0,fnOk:null};
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const supported=()=>"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
const b64=s=>{const p="=".repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};

async function fn(body){const {data,error}=await sb.functions.invoke("ravi",{body});if(error)throw error;if(data&&data.error)throw new Error(data.error);return data}
window.RAVI_FN=fn;

async function ready(){if(P.ready)return P.ready;P.ready=(async()=>{
  const {data:s}=await sb.auth.getSession();P.me=s?.session?.user?.id;if(!P.me)throw new Error("login");
  const {data,error}=await sb.from("couple_members").select("user_id,name");if(error)throw error;
  const o=(data||[]).find(m=>m.user_id!==P.me);if(!o)throw new Error("nopartner");P.other=o.user_id;P.name=o.name||"";
  const key=[P.me,P.other].sort().join("").replace(/-/g,"").slice(0,40);
  P.ch=sb.channel("ravi-presence-"+key,{config:{private:true,presence:{key:P.me}}});P.key=key;
  P.ch.on("presence",{event:"sync"},()=>{const st=P.ch.presenceState()[P.other];P.peer=st&&st.length?st[st.length-1]:null;
    document.dispatchEvent(new CustomEvent("ravi-presence",{detail:P.peer}))});
  const onSync=()=>{const st=P.ch.presenceState()[P.other];P.peer=st&&st.length?st[st.length-1]:null;document.dispatchEvent(new CustomEvent("ravi-presence",{detail:P.peer}))};
  P.ch.subscribe(st=>{if(st==="SUBSCRIBED")track();else if((st==="CHANNEL_ERROR"||st==="TIMED_OUT")&&!P.pub){P.pub=true;try{sb.removeChannel(P.ch)}catch(e){}
    P.ch=sb.channel("ravi-presence-"+key,{config:{presence:{key:P.me}}});P.ch.on("presence",{event:"sync"},onSync);P.ch.subscribe(s2=>{if(s2==="SUBSCRIBED")track()})}});
  document.addEventListener("visibilitychange",track);
  return true})();P.ready.catch(()=>{P.ready=null});return P.ready}
function track(){try{P.ch&&P.ch.track({vis:!document.hidden,route:typeof route!=="undefined"?route:"",t:Date.now()})}catch(e){}}
window.RAVI_PEER=()=>P.peer;

/* kirim notifikasi ke pasangan bila perlu */
window.RAVI_NOTIFY=async function(kind,o){
  try{await ready()}catch(e){return}
  const peer=P.peer;
  if(kind==="msg"){if(peer&&peer.vis&&peer.route==="chat")return;if(Date.now()-P.lastMsgPush<8000)return;P.lastMsgPush=Date.now()}
  if(kind==="post"&&peer&&peer.vis)return;
  try{await fn({action:"push",kind,title:o.title,body:o.body,url:o.url||"./?go="+(kind==="post"?"feed":"chat"),tag:kind})}catch(e){}};

/* berlangganan */
async function subscribe(){
  if(!supported())throw new Error(isIOS&&!standalone?L("Di iPhone, tambahkan RaVi ke Home Screen dulu (Safari → Bagikan → Tambah ke Layar Utama), lalu buka dari ikon itu.","On iPhone, add RaVi to the Home Screen first (Safari → Share → Add to Home Screen), then open it from that icon."):L("Browser ini tidak mendukung notifikasi push.","This browser doesn't support push notifications."));
  const perm=await Notification.requestPermission();if(perm!=="granted")throw new Error(L("Izin notifikasi ditolak. Izinkan lewat ikon gembok di address bar → Notifikasi.","Notification permission denied. Allow it via the lock icon → Notifications."));
  const {publicKey}=await fn({action:"vapid"});
  const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(sub){const cur=sub.options&&sub.options.applicationServerKey;if(cur&&btoa(String.fromCharCode(...new Uint8Array(cur))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")!==publicKey){await sub.unsubscribe();sub=null}}
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(publicKey)});
  const j=sub.toJSON();const {error}=await sb.from("push_subs").upsert({endpoint:j.endpoint,sub:j});if(error)throw error;
  try{localStorage.setItem("bbp_push_ok","1")}catch(e){}return true}
async function pushState(){if(!supported())return "unsupported";if(Notification.permission==="denied")return "denied";
  try{const reg=await navigator.serviceWorker.getRegistration();const s=reg&&await reg.pushManager.getSubscription();return s&&Notification.permission==="granted"?"on":"off"}catch(e){return "off"}}

/* banner di Chat */
const css=document.createElement("style");css.textContent=`.pn-bar{display:flex;gap:8px;align-items:center;padding:8px 12px;background:var(--ambS);border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.4}
.pn-bar b{display:block}.pn-bar .pri{flex:none}.pn-dot{display:inline-block;width:8px;height:8px;border-radius:99px;background:var(--mute);margin-right:4px;vertical-align:middle}.pn-dot.on{background:#2fa463}`;document.head.appendChild(css);
async function decorate(){if(typeof route==="undefined"||route!=="chat")return;const wrap=document.querySelector("#view .ch-wrap");if(!wrap)return;
  const head=wrap.querySelector(".ch-head .crumb");if(head&&!head.dataset.pn){head.dataset.pn="1";const p=P.peer;head.innerHTML=`<span class="pn-dot${p&&p.vis?" on":""}"></span>${p&&p.vis?L("Online","Online"):L("Offline","Offline")}`}
  if(wrap.querySelector(".pn-bar"))return;const st=await pushState();if(st==="on"||st==="unsupported"&&!isIOS)return;if(wrap.querySelector(".pn-bar"))return;
  const bar=document.createElement("div");bar.className="pn-bar";
  bar.innerHTML=st==="denied"?`<span>🔕</span><div style="flex:1"><b>${L("Notifikasi diblokir","Notifications blocked")}</b>${L("Izinkan lewat ikon gembok di address bar → Notifikasi, supaya telepon & pesan masuk walau RaVi tertutup.","Allow them via the lock icon → Notifications so calls and messages arrive while RaVi is closed.")}</div>`
   :`<span>🔔</span><div style="flex:1"><b>${L("Aktifkan notifikasi","Turn on notifications")}</b>${isIOS&&!standalone?L("Di iPhone: tambahkan RaVi ke Home Screen dulu, lalu buka dari ikonnya.","On iPhone: add RaVi to the Home Screen first, then open it from the icon."):L("Supaya telepon & pesan tetap masuk walau RaVi tertutup.","So calls and messages arrive even when RaVi is closed.")}</div><button class="sm pri" id="pnOn">${L("Aktifkan","Turn on")}</button>`;
  wrap.querySelector(".ch-head").after(bar);
  const b=bar.querySelector("#pnOn");if(b)b.onclick=async()=>{b.disabled=true;b.textContent="…";try{await subscribe();bar.remove();status(L("Notifikasi aktif di perangkat ini 🔔","Notifications on for this device 🔔"),"ok")}catch(e){b.disabled=false;b.textContent=L("Aktifkan","Turn on");status(e.message||String(e),"warn")}}}
new MutationObserver(()=>{decorate().catch(()=>{})}).observe(document.getElementById("view")||document.body,{childList:true});
document.addEventListener("ravi-presence",()=>{const h=document.querySelector("#view .ch-head .crumb");if(h){delete h.dataset.pn;decorate()}});
window.RAVI_PUSH_SUBSCRIBE=subscribe;

/* lacak halaman aktif untuk status online */
const _go=go;go=function(r){const o=_go.apply(this,arguments);setTimeout(track,0);return o};

/* buka dari notifikasi: ?go=chat atau pesan dari service worker */
function goFromUrl(u){try{const g=new URL(u,location.href).searchParams.get("go");if(g&&window.EXTRA_VIEWS&&window.EXTRA_VIEWS[g])go(g)}catch(e){}}
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.ravi==="go")goFromUrl(e.data.url)});
addEventListener("load",()=>{const g=new URLSearchParams(location.search).get("go");
  const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);ready().catch(()=>{});
    if(g){goFromUrl(location.href);history.replaceState(null,"",location.pathname)}
    if(localStorage.getItem("bbp_push_ok")==="1"&&Notification&&Notification.permission==="granted")subscribe().catch(()=>{})}},800);setTimeout(()=>clearInterval(t),60000)});
})();
