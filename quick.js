/* =====================================================================
   SERING DIPAKAI: fitur yang paling sering dibuka otomatis naik ke atas
   - Grup "⭐ Sering dipakai" paling atas di menu ☰
   - Baris "⚡ Akses cepat" di Dashboard
   - Urutan kartu di halaman Alat mengikuti pemakaian
   Hitungan disimpan di perangkat ini saja (localStorage), per akun.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const key=()=>"bbp_use_"+((document.getElementById("who")?.textContent||"").split(" ")[0]||"x");
const SKIP=new Set(["dash","tools","look","guide"]);
const DEFAULTS=["input","chat","today","t_moment","games","t_wish"];
const ICON={input:"📸",journal:"📒",gl:"🔍",tb:"⚖️",recon:"🏦",budget:"🎯",fs:"📊",coa:"🗂️",period:"🔒",today:"☀️",sched:"📅",diary:"✍️",notes:"📝",quest:"🏆",album:"🌟",games:"🎮",
  chat:"💬",feed:"📷",t_moment:"💑",t_split:"🧮",t_wish:"🐷",t_habit:"✅",t_wheel:"🎡",t_calc:"🏦",t_learn:"🌏",t_quote:"💬",t_focus:"⏱️",t_mood:"😊",t_capsule:"💌",t_bucket:"🪣",t_cards:"🃏",t_fx:"💱"};
function load(){try{return JSON.parse(localStorage.getItem(key())||"{}")}catch(e){return {}}}
function save(u){try{localStorage.setItem(key(),JSON.stringify(u))}catch(e){}}
/* skor = jumlah buka, makin lama tidak dibuka makin turun (setengahnya tiap 14 hari) */
function score(r,u){const x=(u||load())[r];if(!x)return 0;const days=(Date.now()-x.t)/864e5;return x.n*Math.pow(.5,days/14)}
window.USAGE_SCORE=r=>score(r);
function labelOf(r){for(const [,items] of NAV)for(const [k,n] of items)if(k===r)return n;return null}
function top(n){const u=load(),all=new Set();NAV.forEach(([g,items])=>{if(g!==GRP)items.forEach(([k])=>all.add(k))});
  const used=[...all].filter(r=>!SKIP.has(r)&&score(r,u)>0).sort((a,b)=>score(b,u)-score(a,u));
  const list=used.slice(0,n);for(const d of DEFAULTS){if(list.length>=n)break;if(!list.includes(d)&&all.has(d))list.push(d)}return list}
const GRP="⭐ Sering dipakai";

/* hitung setiap kali halaman dibuka */
const _go=go;go=function(r){try{if(r&&!SKIP.has(r)){const u=load(),x=u[r]||{n:0,t:0};x.n=Math.min(x.n+1,500);x.t=Date.now();u[r]=x;save(u)}}catch(e){}return _go.apply(this,arguments)};

/* menu: grup favorit di paling atas */
NAV.unshift([GRP,[]]);
const _rn=renderNav;renderNav=function(){const g=NAV.find(x=>x[0]===GRP);if(g)g[1]=top(5).map(r=>[r,labelOf(r)||r]).filter(x=>x[1]);return _rn.apply(this,arguments)};

/* akses cepat di Dashboard */
const css=document.createElement("style");css.textContent=`
.qk-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;margin-bottom:12px}
.qk{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 6px;min-height:76px;border:2px solid var(--line);border-radius:16px;background:var(--card);text-align:center;font-size:12px;font-weight:700;line-height:1.25;transition:transform .15s,border-color .15s}
.qk span{font-size:24px;line-height:1}.qk:hover,.qk:focus-visible{border-color:var(--acc);transform:translateY(-2px)}
.qk-h{display:flex;justify-content:space-between;align-items:baseline;margin:2px 0 6px}.qk-h b{font-size:13px}.qk-h .crumb{font-size:11.5px}
@media (prefers-reduced-motion:reduce){.qk{transition:none}}`;document.head.appendChild(css);
function quickRow(){const list=top(6);const has=Object.keys(load()).length>0;
  const d=document.createElement("div");d.id="qkBox";
  d.innerHTML=`<div class="qk-h"><b>⚡ ${L("Akses cepat","Quick access")}</b><span class="crumb">${has?L("urut dari yang paling sering kamu buka","ordered by what you open most"):L("akan menyesuaikan dengan kebiasaanmu","adapts to how you use the app")}</span></div>
   <div class="qk-row">${list.map(r=>`<button class="qk" data-qk="${r}"><span>${ICON[r]||"⭐"}</span><b></b></button>`).join("")}</div>`;
  d.querySelectorAll("[data-qk]").forEach((b,i)=>{b.querySelector("b").textContent=(labelOf(list[i])||list[i]).replace(/^[^\p{L}\p{N}]+/u,"");b.onclick=()=>go(list[i])});
  return d}
const _r=render;render=function(){const out=_r.apply(this,arguments);
  try{if(route==="dash"){const v=document.getElementById("view");if(v&&!v.querySelector("#qkBox")){const anchor=v.querySelector(".qt-card")||v.querySelector(".ph");if(anchor)anchor.after(quickRow())}}}catch(e){}
  return out};
addEventListener("load",()=>{try{renderNav()}catch(e){}});
})();
