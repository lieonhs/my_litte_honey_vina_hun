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
})();
