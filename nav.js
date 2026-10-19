/* =====================================================================
   NAVIGASI BARU: tab bar bawah (HP) + layar "Semua menu" dengan pencarian
   - HP (≤ 860px): menu samping disembunyikan, diganti 5 tab di bawah
   - Laptop: menu samping tetap, plus tombol ▦ Menu di header
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const ICON=Object.assign({dash:"🏠",tools:"🧰",guide:"📖",look:"🎨",security:"🔒",quest:"🏆",album:"🌟"},window.RAVI_ICON||{});
const TABS=()=>[["home","dash","🏠",L("Beranda","Home")],["chat","chat","💬","Chat"],["add","input","＋",L("Catat","Add")],["tools","tools","🧰",L("Alat","Tools")],["menu",null,"▦","Menu"]];
const tabOf=r=>r==="dash"?"home":(r==="chat"||r==="feed")?"chat":r==="input"?"add":(r==="tools"||/^t_/.test(r||""))?"tools":"menu";
const strip=s=>String(s||"").replace(/^[^\p{L}\p{N}]+/u,"").trim();

const css=document.createElement("style");css.textContent=`
#tabbar{display:none}
@media (max-width:860px){
 html.has-tabbar header .ham,html.has-tabbar .ms-hbtn{display:none}
 html.has-tabbar aside#nav{display:none!important}
 html.has-tabbar main{padding-bottom:calc(92px + env(safe-area-inset-bottom,0px))!important}
 html.has-tabbar #tabbar{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:49;
  padding:6px max(8px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));
  background:color-mix(in srgb,var(--card) 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);box-shadow:0 -4px 18px rgba(0,0,0,.06)}
 html.has-tabbar .peek.b{bottom:calc(64px + env(safe-area-inset-bottom,0px))}
 html.has-tabbar .ch-wrap{height:calc(100dvh - var(--hdrH,96px) - 190px - env(safe-area-inset-bottom,0px))!important}
}
#tabbar button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:52px;border-radius:14px;
 font-size:11px;font-weight:800;color:var(--mute);position:relative;-webkit-tap-highlight-color:transparent}
#tabbar button .i{font-size:22px;line-height:1;transition:transform .15s}
#tabbar button.on{color:var(--acc)}#tabbar button.on .i{transform:translateY(-2px) scale(1.08)}
#tabbar button.on::after{content:"";position:absolute;top:2px;width:22px;height:3px;border-radius:99px;background:var(--acc)}
#tabbar button.add .i{width:46px;height:46px;border-radius:16px;background:linear-gradient(135deg,var(--g1,var(--acc)),var(--g2,var(--acc)));color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;margin-top:-18px;box-shadow:0 6px 16px color-mix(in srgb,var(--acc) 45%,transparent)}
#tabbar button.add.on::after{display:none}
#tabbar button:focus-visible{outline:3px solid var(--acc);outline-offset:-3px}
#tabbar .bdg{position:absolute;top:4px;left:calc(50% + 6px);min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:#ff4d6d;color:#fff;font-size:10.5px;display:flex;align-items:center;justify-content:center}
#menuSheet{position:fixed;inset:0;z-index:48;background:var(--bg);display:flex;flex-direction:column;animation:msIn .2s ease-out}
@keyframes msIn{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
#menuSheet .ms-top{display:flex;gap:10px;align-items:center;padding:calc(12px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 10px max(16px,env(safe-area-inset-left,0px));border-bottom:1px solid var(--line);background:var(--card)}
#menuSheet .ms-top input{flex:1;min-width:0;border-radius:99px;padding:10px 16px;font-size:15px}
#menuSheet .ms-x{all:unset;cursor:pointer;width:40px;height:40px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:20px;background:var(--th)}
#menuSheet .ms-body{flex:1;overflow-y:auto;padding:12px max(16px,env(safe-area-inset-right,0px)) calc(96px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));overscroll-behavior:contain}
#menuSheet h3{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--acc);margin:16px 0 8px}
#menuSheet .ms-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}
#menuSheet .ms-it{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:84px;padding:8px 4px;border-radius:16px;
 background:var(--card);border:1.5px solid var(--line);text-align:center;font-size:12px;font-weight:700;line-height:1.25;color:var(--ink)}
#menuSheet .ms-it .i{font-size:26px;line-height:1}#menuSheet .ms-it.on{border-color:var(--acc);background:var(--accS)}
#menuSheet .ms-it:focus-visible{outline:3px solid var(--acc)}
#menuSheet .ms-empty{color:var(--mute);text-align:center;margin-top:30px}
.ms-hbtn{background:none;color:var(--hdrInk);border-color:rgba(255,255,255,.35)}
@media (prefers-reduced-motion:reduce){#menuSheet{animation:none}#tabbar button .i{transition:none}}
/* HP: lebih ringan — tanpa blur mahal, karakter hanya bergerak di kartu utama */
@media (max-width:860px),(pointer:coarse){
 html.has-tabbar #tabbar{backdrop-filter:none;-webkit-backdrop-filter:none;background:var(--card)}
 .pipi{animation:none!important}.pipi-card .pipi,.qt-card .pipi,#callUI .pipi{animation:pipiBob 2.6s ease-in-out infinite!important}
}`;document.head.appendChild(css);
document.documentElement.classList.add("has-tabbar");

/* ---------- tab bar ---------- */
function drawTabs(){let bar=document.getElementById("tabbar");
  if(!bar){bar=document.createElement("nav");bar.id="tabbar";bar.setAttribute("aria-label",L("Navigasi utama","Main navigation"));document.body.appendChild(bar)}
  const cur=document.getElementById("menuSheet")?"menu":tabOf(typeof route!=="undefined"?route:"dash");
  const unread=document.querySelector('aside a[data-r="chat"] .qbadge')?.textContent||"";
  bar.innerHTML=TABS().map(([k,r,i,n])=>`<button class="${k===cur?"on ":""}${k==="add"?"add":""}" data-tab="${k}" aria-current="${k===cur?"page":"false"}" aria-label="${n}"><span class="i">${i}</span>${n}${k==="chat"&&unread?`<span class="bdg">${unread}</span>`:""}</button>`).join("");
  bar.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{const t=TABS().find(x=>x[0]===b.dataset.tab);if(t[0]==="menu"){document.getElementById("menuSheet")?closeMenu():openMenu();return}closeMenu();go(t[1]);window.scrollTo({top:0})})}

/* ---------- layar semua menu ---------- */
function items(){const seen=new Set(),groups=[];for(const [g,list] of NAV){const xs=list.filter(([k,n])=>k&&n&&!(g!=="⭐ Sering dipakai"&&seen.has(k)));if(g!=="⭐ Sering dipakai")xs.forEach(([k])=>seen.add(k));if(xs.length)groups.push([g,xs])}return groups}
function openMenu(){closeMenu(true);const el=document.createElement("div");el.id="menuSheet";el.setAttribute("role","dialog");el.setAttribute("aria-label",L("Semua menu","All menus"));
  el.innerHTML=`<div class="ms-top"><input id="msQ" type="search" placeholder="${L("Cari fitur… (kurs, chat, anggaran)","Search… (rates, chat, budget)")}" aria-label="${L("Cari fitur","Search features")}" autocomplete="off"><button class="ms-x" id="msX" aria-label="${L("Tutup","Close")}">✕</button></div><div class="ms-body" id="msB"></div>`;
  document.body.appendChild(el);
  const body=el.querySelector("#msB"),q=el.querySelector("#msQ");
  const paint=()=>{const term=q.value.trim().toLowerCase(),out=[];let html="";
    const hit=(g,k,n)=>!term||strip(n).toLowerCase().includes(term)||k.toLowerCase().includes(term)||strip(g).toLowerCase().includes(term);
    for(const [g,xs] of items()){if(term&&g==="⭐ Sering dipakai")continue;const list=xs.filter(([k,n])=>hit(g,k,n));if(!list.length)continue;
      html+=`<h3>${esc(g)}</h3><div class="ms-grid">${list.map(([k,n])=>{out.push(strip(n));return `<button class="ms-it${k===route?" on":""}" data-go="${esc(k)}"><span class="i">${ICON[k]||(String(n).match(/^\p{Extended_Pictographic}/u)||["•"])[0]}</span><span class="nm"></span></button>`}).join("")}</div>`}
    body.innerHTML=html||`<div class="ms-empty">${L("Tidak ada fitur yang cocok.","No matching feature.")}</div>`;
    body.querySelectorAll(".ms-it .nm").forEach((b,i)=>b.textContent=out[i]);
    body.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{closeMenu();go(b.dataset.go);window.scrollTo({top:0})})};
  paint();q.oninput=paint;q.onkeydown=e=>{if(e.key==="Enter"){const f=body.querySelector("[data-go]");if(f)f.click()}if(e.key==="Escape")closeMenu()};
  el.querySelector("#msX").onclick=()=>closeMenu();
  if(matchMedia("(min-width:861px)").matches)setTimeout(()=>q.focus(),30);
  drawTabs()}
function closeMenu(silent){const m=document.getElementById("menuSheet");if(m){m.remove();if(!silent)drawTabs()}}
addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("menuSheet"))closeMenu()});

/* tombol Menu di header (laptop) */
function headerBtn(){const h=document.querySelector("header");if(!h||h.querySelector(".ms-hbtn"))return;const b=document.createElement("button");b.className="sm ms-hbtn";b.textContent="▦ Menu";b.setAttribute("aria-label",L("Semua menu","All menus"));
  b.onclick=()=>document.getElementById("menuSheet")?closeMenu():openMenu();const ref=h.querySelector("#questBtn")||h.querySelector("#logout");ref?ref.before(b):h.appendChild(b)}

/* ikut menggambar ulang saat halaman berganti */
const _rn=renderNav;renderNav=function(){const o=_rn.apply(this,arguments);try{drawTabs();headerBtn()}catch(e){}return o};
const _go=go;go=function(r){closeMenu(true);return _go.apply(this,arguments)};
new MutationObserver(()=>drawTabs()).observe(document.getElementById("nav")||document.body,{childList:true,subtree:true});
addEventListener("load",()=>{drawTabs();headerBtn()});
window.RAVI_MENU={open:openMenu,close:closeMenu};

/* =====================================================================
   MODE "BERDUA" DI LAPTOP: Chat, Feed & Notifikasi memakai bingkai yang sama
   (rel ikon di kiri ala WhatsApp Web / Instagram) supaya pindah halaman tidak melompat.
   ===================================================================== */
const SX=new Set(["chat","feed","notif","security","admin"]);
const sxCss=document.createElement("style");sxCss.textContent=`
#sxRail{display:none}
@media (min-width:861px){
 html.sx{--railW:68px}
 html.sx header,html.sx aside#nav,html.sx .ms-hbtn,html.sx #tabbar{display:none!important}
 html.sx #sxRail{display:flex;position:fixed;left:0;top:0;bottom:0;width:var(--railW);z-index:45;flex-direction:column;align-items:center;gap:6px;padding:14px 0;background:var(--card);border-right:1px solid var(--line);animation:railIn .22s ease-out}
 html.sx main{margin-left:var(--railW)!important;padding-top:18px!important;max-width:none!important}
 html.sx #view{max-width:680px;margin:0 auto}
 html.sx #view .region{border-radius:18px}
 html.sx #status:not(.hide){position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:60;max-width:min(560px,90vw);box-shadow:0 6px 20px rgba(0,0,0,.18)}
 #sxRail .rl{all:unset;cursor:pointer;width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--mute);position:relative;font-size:21px;transition:background .18s,color .18s,transform .18s}
 #sxRail .rl:hover,#sxRail .rl:focus-visible{background:var(--th);color:var(--ink)}#sxRail .rl:active{transform:scale(.92)}
 #sxRail .rl.on{background:var(--accS);color:var(--acc)}
 #sxRail .rl.on::before{content:"";position:absolute;left:-11px;top:10px;bottom:10px;width:4px;border-radius:0 4px 4px 0;background:var(--acc)}
 #sxRail .rl .rb{position:absolute;top:3px;right:3px;min-width:16px;height:16px;border-radius:99px;background:#ff4d6d;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 3px}#sxRail .rl .rb[hidden]{display:none}
 #sxRail .lg{width:40px;height:40px;border-radius:12px;margin-bottom:8px;display:block}
 #sxRail .rl.me .rv-av{width:36px;height:36px}
 #sxRail .tip{position:absolute;left:58px;white-space:nowrap;background:var(--ink);color:var(--bg);font-size:12px;font-weight:700;padding:4px 8px;border-radius:8px;opacity:0;pointer-events:none;transform:translateX(-4px);transition:opacity .15s,transform .15s}
 #sxRail .rl:hover .tip{opacity:1;transform:none}
}
@keyframes railIn{from{transform:translateX(-100%)}to{transform:none}}
@keyframes sxIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* pergantian halaman yang halus di semua halaman */
#view.vt{animation:viewIn .2s ease-out}
@keyframes viewIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
body.mode-swap main{animation:viewIn .24s ease-out}
@media (prefers-reduced-motion:reduce){#view.vt,body.mode-swap main,html.sx #sxRail,html.cx-desk .cx{animation:none!important}}`;document.head.appendChild(sxCss);
const ic=(d)=>`<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const RI={chat:ic('<path d="M4 5h16v11H8l-4 4z"/>'),calls:ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  notif:ic('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),feed:ic('<rect x="7" y="3" width="14" height="14" rx="2.5"/><path d="M3 7v11.5A2.5 2.5 0 0 0 5.5 21H17"/><path d="M14 13.6s-3.2-2-3.2-3.9a1.6 1.6 0 0 1 3.2-.3 1.6 1.6 0 0 1 3.2.3c0 1.9-3.2 3.9-3.2 3.9z"/>'),
  dash:ic('<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>'),admin:ic('<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>')};
function drawRail(){let r=document.getElementById("sxRail");const on=document.documentElement.classList.contains("sx");if(!on){if(r)r.remove();return}
  const cur=typeof route!=="undefined"?route:"",tab=window.RAVI_NOTIF_TAB_CUR||"act";
  const partner=!window.RS||!RS.S.me||RS.isPartner(RS.S.me);
  const adm=window.RAVI_ADMIN&&window.RAVI_ADMIN.isAdmin();
  const items=[["chat",L("Chat","Chat")],["calls",L("Panggilan","Calls")],["notif",L("Notifikasi","Notifications")],...(partner?[["feed","Feed"]]:[]),...(adm?[["admin",L("Panel Admin","Admin Panel")]]:[])];
  const ap=window.RAVI_ADMIN_PENDING?window.RAVI_ADMIN_PENDING():0;
  const isOn=k=>k==="calls"?cur==="notif"&&tab==="calls":k==="notif"?cur==="notif"&&tab!=="calls":k===cur;
  if(!r){r=document.createElement("nav");r.id="sxRail";r.setAttribute("aria-label",L("Navigasi Berdua","Together navigation"));document.body.appendChild(r)}
  const un=+(document.querySelector('aside a[data-r="chat"] .qbadge')?.textContent||0)||0,nf=window.RAVI_NOTIF_COUNT?window.RAVI_NOTIF_COUNT():0;
  r.innerHTML=`<img class="lg" src="icon-192.png" alt="RaVi">`+items.map(([k,n])=>`<button class="rl${isOn(k)?" on":""}" data-rl="${k}" aria-label="${n}"${isOn(k)?' aria-current="page"':""}>${RI[k]}<span class="tip">${n}</span>${k==="chat"?`<span class="rb" id="rlUn"${un?"":" hidden"}>${un||""}</span>`:k==="notif"?`<span class="rb" id="rlNf"${nf?"":" hidden"}>${nf||""}</span>`:k==="admin"&&ap?`<span class="rb">${ap}</span>`:""}</button>`).join("")+
    `<span style="flex:1"></span><button class="rl" data-rl="dash" aria-label="${L("Kembali ke RaVi","Back to RaVi")}">${RI.dash}<span class="tip">${L("Kembali ke RaVi","Back to RaVi")}</span></button>
     <button class="rl me${cur==="security"?" on":""}" data-rl="security" aria-label="${L("Akun & keamanan","Account & security")}">${window.RS&&RS.S.me?RS.avatar(RS.S.me,36):"👤"}<span class="tip">${L("Akun & keamanan","Account & security")}</span></button>`;
  r.querySelectorAll("[data-rl]").forEach(b=>b.onclick=()=>{const k=b.dataset.rl;if(k==="calls"){window.RAVI_NOTIF_TAB="calls";go("notif");return}if(k==="notif"){window.RAVI_NOTIF_TAB="act"}go(k)})}
function applyMode(r){const h=document.documentElement,was=h.classList.contains("sx"),on=SX.has(r);
  h.classList.toggle("sx",on);if(was!==on&&matchMedia("(min-width:861px)").matches){document.body.classList.remove("mode-swap");void document.body.offsetWidth;document.body.classList.add("mode-swap");setTimeout(()=>document.body.classList.remove("mode-swap"),300)}
  drawRail()}
const _go3=go;go=function(r){const prev=typeof route!=="undefined"?route:null;applyMode(r);const o=_go3.apply(this,arguments);
  const v=document.getElementById("view");if(v&&prev!==r){v.classList.remove("vt");void v.offsetWidth;v.classList.add("vt");setTimeout(()=>v.classList.remove("vt"),260)}
  setTimeout(drawRail,0);return o};
document.addEventListener("ravi-notif",drawRail);document.addEventListener("ravi-admin",drawRail);document.addEventListener("ravi-unread",()=>{const b=document.getElementById("rlUn");if(b){const n=+(document.querySelector('aside a[data-r="chat"] .qbadge')?.textContent||0)||0;b.hidden=!n;b.textContent=n||""}});
addEventListener("load",()=>{applyMode(typeof route!=="undefined"?route:"");setTimeout(drawRail,2500)});
})();
