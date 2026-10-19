/* =====================================================================
   BERSAMA: anggota, stiker, foto terenkripsi + 📷 Feed (ala Instagram) khusus pasangan.
   Chat ada di chat.js, telepon di call.js, pusat notifikasi di notif.js.
   Helper dibagikan lewat window.RS.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const ok=()=>typeof sb!=="undefined"&&sb;
const S={me:null,members:{},ready:null,setupErr:"",posts:[],comments:{},sub:false};
const cap1=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const name=u=>cap1(S.members[u]?.name)||(u===S.me?L("Kamu","You"):L("Anggota","Member"));
const isPartner=u=>!!S.members[u]?.partner;
const partners=()=>Object.keys(S.members).filter(isPartner);
const hhmm=t=>new Date(t).toLocaleTimeString(EN()?"en-GB":"id-ID",{hour:"2-digit",minute:"2-digit"});
const ago=t=>{const s=(Date.now()-new Date(t))/1000;if(s<60)return L("baru saja","just now");if(s<3600)return Math.floor(s/60)+L(" mnt"," min");if(s<86400)return Math.floor(s/3600)+L(" jam"," h");if(s<7*86400)return Math.floor(s/86400)+L(" hr"," d");return new Date(t).toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short"})};

/* ---------- koneksi ---------- */
async function loadMembers(){const {data:mem,error}=await sb.from("couple_members").select("user_id,name,partner,role,last_seen,avatar");if(error)throw error;
  if(!mem||!mem.some(m=>m.user_id===S.me))throw new Error("notmember");S.members={};mem.forEach(m=>S.members[m.user_id]=m)}
async function init(){
  if(S.ready)return S.ready;
  S.ready=(async()=>{
    if(!ok())throw new Error("offline");
    const {data:ses}=await sb.auth.getSession();S.me=ses?.session?.user?.id||null;if(!S.me)throw new Error("login");
    await loadMembers();
    const who=(window.TOOLS||{}).me,want=who==="vina"?"Vina":who==="rafi"?"Rafi":null;
    if(want&&isPartner(S.me)&&S.members[S.me].name!==want){S.members[S.me].name=want;sb.from("couple_members").update({name:want}).eq("user_id",S.me).then(()=>{},()=>{})}
    if(isPartner(S.me)){await loadPosts().catch(()=>{});subscribe()}
    return true})();
  S.ready.catch(e=>{S.setupErr=String(e&&(e.message||e.code)||e);S.ready=null});
  return S.ready}
async function loadPosts(){const {data,error}=await sb.from("couple_posts").select("*").order("id",{ascending:false}).limit(60);if(error)throw error;S.posts=data||[];
  if(S.posts.length){const {data:c}=await sb.from("couple_comments").select("*").in("post_id",S.posts.map(p=>p.id)).order("id",{ascending:true});S.comments={};(c||[]).forEach(x=>(S.comments[x.post_id]=S.comments[x.post_id]||[]).push(x))}}
function subscribe(){if(S.sub)return;S.sub=true;
  sb.channel("couple-feed")
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_posts"},p=>{
     if(p.eventType==="INSERT"){if(!S.posts.some(x=>x.id===p.new.id))S.posts.unshift(p.new)}
     else if(p.eventType==="UPDATE"){const i=S.posts.findIndex(x=>x.id===p.new.id);if(i>=0)S.posts[i]=p.new}
     else if(p.eventType==="DELETE")S.posts=S.posts.filter(x=>x.id!==p.old.id);
     refresh()})
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_comments"},p=>{
     if(p.eventType==="INSERT"){const a=S.comments[p.new.post_id]=S.comments[p.new.post_id]||[];if(!a.some(c=>c.id===p.new.id))a.push(p.new)}
     else if(p.eventType==="DELETE")for(const k in S.comments)S.comments[k]=S.comments[k].filter(c=>c.id!==p.old.id);
     refresh()})
   .subscribe();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&S.me&&route==="feed")loadPosts().then(refresh).catch(()=>{})})}
function refresh(){if(route==="feed"){const v=document.getElementById("view");if(v)drawFeed(v)}}
document.addEventListener("ravi-e2e",()=>{if(route==="feed")refresh()});

/* ---------- avatar ---------- */
const memo=new Map();
function pipiM(mood,size,ch){if(!window.pipi)return "";const k=mood+"|"+size+"|"+ch;if(!memo.has(k)){if(memo.size>400)memo.clear();memo.set(k,window.pipi(mood,size,ch))}return memo.get(k)}
const charOf=u=>{const a=S.members[u]?.avatar;if(a)return a;const n=(S.members[u]?.name||"").toLowerCase();return /^vina/.test(n)?"vcap":/^(rafi|el)\b/.test(n)?"erusa":null};
const hue=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h};
function avatar(u,size,mood){const c=charOf(u),s=size||40;
  if(c&&window.pipi)return `<span class="rv-av" style="width:${s}px;height:${s}px">${pipiM(mood||"happy",Math.round(s*1.05),c)}</span>`;
  const n=name(u);return `<span class="rv-av txt" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.42)}px;background:hsl(${hue(u)} 60% 55%)">${esc((n||"?").charAt(0).toUpperCase())}</span>`}
function groupAvatar(emoji,size,seed){const s=size||40;return `<span class="rv-av txt grp" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.5)}px;background:linear-gradient(135deg,hsl(${hue(seed||"g")} 65% 60%),hsl(${(hue(seed||"g")+50)%360} 65% 52%))">${esc(emoji||"👥")}</span>`}

/* ---------- stiker & emote buatan sendiri (karakter aplikasi) ---------- */
const MOODS5=["happy","party","worried","think","sleep"];
const KATA=[["vnel","party","Sayang kamu!"],["vcap","happy","Selamat pagi ☀️"],["erusa","party","Semangat!"],["vorange","worried","Kangen 🥺"],["ebuku","think","Kerja dulu ya"],["vkrl","sleep","Good night 🌙"],
 ["erenang","happy","Otw!"],["vsantai","party","Makasih ❤️"],["ekaget","worried","Maaf yaa 🙏"],["vkantor","think","Makan apa?"],["cpkencan","happy","Date yuk!"],["cpcocok","party","Saldo aman 💸"],
 ["pipi","party","Gajian!!"],["moci","sleep","Mager…"],["bubu","happy","Laper 🍜"],["erusa","sleep","Ngantuk"],["vcap","party","Yeay!"],["ekaget","think","Hah, serius?"],["vnel","happy","Kita hebat!"],["kiki","worried","Telat dikit…"]];
const STABS=()=>[["kata","💬 "+L("Kata","Words"),KATA.map((_,i)=>"k:"+i)],
 ["couple","💑 Couple",[...MOODS5.map(m=>"vnel:"+m),"cpkencan:happy","cpselfie:happy","cptutup:happy","cpkrl:happy","cpcocok:happy"]],
 ["vina","👩 Vina",["vcap","vkantor","vorange","vsantai","vkrl"].flatMap(c=>MOODS5.map(m=>c+":"+m))],
 ["el","👓 El",["erusa","ebuku","erenang","ekaget"].flatMap(c=>MOODS5.map(m=>c+":"+m))],
 ["hewan","🐾 "+L("Hewan","Animals"),["pipi","moci","kodi","cimi","mumu","bubu","pandi","kiki","popo","rubi"].flatMap(c=>["happy","party","worried"].map(m=>c+":"+m))],
 ["emoji","😀 Emoji",null]];
const EMOTES=["vnel:party","vcap:happy","erusa:party","vorange:worried","ekaget:worried","vkrl:sleep","cpkencan:happy","pipi:party","bubu:happy","vsantai:party"];
const UNI=["❤️","🥰","😘","😂","🥺","👍","🙏","😴","😭","😡","🤔","🎉","🍜","☕","💸","🏠","🚆","🐄","✨","🔥","😎","🤗","🙈","💯"];
const isStk=b=>/^\[stk:[a-z]+:[a-z0-9]+\]$/.test(b||"");
const stkKey=b=>b.slice(5,-1);
function stkSVG(k,size){if(!window.pipi)return "";const [a,b]=k.split(":");
  if(a==="k"){const x=KATA[+b];if(!x)return "";return `<span class="stk-k">${pipiM(x[1],size,x[0])}<span class="stk-cap"></span></span>`}
  return pipiM(b,size,a)}
function fillCaps(root){root.querySelectorAll("[data-stk]").forEach(el=>{const k=el.dataset.stk;if(k.startsWith("k:")){const c=el.querySelector(".stk-cap");if(c)c.textContent=KATA[+k.slice(2)]?.[2]||""}})}
const rxHTML=v=>String(v).startsWith("stk:")?`<span class="rx-s">${stkSVG(v.slice(4),18)}</span>`:esc(v);

/* ---------- enkripsi (e2ee.js) ---------- */
const E2=()=>window.RAVI_E2E;
const pt=b=>E2()?E2().show(b):b;
const isEnc=b=>typeof b==="string"&&/^enc[123]:/.test(b);
async function sealFor(t,uids){if(!t||!E2())return t;return E2().sealFor(t,uids)}
/* format pesan: teks biasa, atau "j1:{...}" untuk balasan / file / diteruskan / kunci foto (ikut terenkripsi) */
function parse(shown){if(typeof shown==="string"&&shown.startsWith("j1:")){try{const o=JSON.parse(shown.slice(3));return {t:o.t||"",r:o.r||null,f:o.f||null,fwd:!!o.fwd,ik:o.ik||null}}catch(e){}}return {t:shown||"",r:null,f:null,fwd:false,ik:null}}
function pack(o){if(!o.r&&!o.f&&!o.fwd&&!o.ik)return o.t||"";return "j1:"+JSON.stringify({t:o.t||undefined,r:o.r||undefined,f:o.f||undefined,fwd:o.fwd||undefined,ik:o.ik||undefined})}
const PK={};   /* kunci acak foto yang baru diunggah: path → kunci */
const ikOf=(path,body)=>PK[path]||parse(pt(body)).ik;

/* ---------- foto & file ---------- */
const urls={};
async function urlsFor(paths){paths=[...new Set(paths.filter(Boolean))];const need=paths.filter(p=>!urls[p]||urls[p].exp<Date.now());
  if(need.length){const {data}=await sb.storage.from("couple").createSignedUrls(need,3600);(data||[]).forEach(d=>{if(d.signedUrl)urls[d.path]={u:d.signedUrl,exp:Date.now()+50*60e3}})}
  return p=>urls[p]?.u||""}
function loadImg(f){return new Promise((y,n)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{y(i);setTimeout(()=>URL.revokeObjectURL(u),1000)};i.onerror=()=>n(new Error(L("Format foto tidak didukung.","Unsupported photo format.")));i.src=u})}
async function upPhoto(file,max){const img=await loadImg(file),s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement("canvas");
  c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  let blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.82)),ext=".jpg",fk=null;
  if(E2()){const r=await E2().encBlob(blob);blob=r.blob;ext=r.ext;fk=r.k}
  const path=S.me+"/"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+ext;if(fk)PK[path]=fk;
  const {error}=await sb.storage.from("couple").upload(path,blob,{contentType:ext===".enc"?"application/octet-stream":"image/jpeg"});if(error)throw error;return path}
const MAXF=50*1024*1024;
const fmtSize=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(0)+" KB":(n/1048576).toFixed(1).replace(".",",")+" MB";
const fIcon=m=>/^video\//.test(m)?"🎬":/^audio\//.test(m)?"🎵":/pdf/.test(m)?"📕":/sheet|excel|csv/.test(m)?"📊":/word|document/.test(m)?"📄":/presentation|powerpoint/.test(m)?"📽️":/zip|rar|7z|compressed/.test(m)?"🗜️":/^image\//.test(m)?"🖼️":"📎";
async function uploadFile(file){if(file.size>MAXF)throw new Error(L("Ukuran maksimal 50 MB: ","Max size is 50 MB: ")+file.name);
  let blob=file,ext=(/\.([a-z0-9]{1,6})$/i.exec(file.name||"")||[,"bin"])[1].toLowerCase(),ct=file.type||"application/octet-stream",enc=false,fk=null;
  if(E2()){const r=await E2().encBlob(file);if(r.ext===".enc"){blob=r.blob;ext="enc";ct="application/octet-stream";enc=true;fk=r.k}}
  const path=S.me+"/f_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+"."+ext;
  const {error}=await sb.storage.from("couple").upload(path,blob,{contentType:ct});if(error)throw error;
  return {p:path,n:(file.name||"file").slice(0,120),s:file.size,m:file.type||"application/octet-stream",e:enc,k:fk||undefined}}
async function fileURL(f){const u=(await urlsFor([f.p]))(f.p);if(!f.e)return u;
  const r=await fetch(u);if(!r.ok)throw new Error("HTTP "+r.status);const buf=await r.arrayBuffer();
  const plain=await window.RAVI_E2E_DEC(buf,f.k);return URL.createObjectURL(new Blob([plain],{type:f.m}))}
const isPhoto=f=>/^image\/(jpeg|png|webp|heic|heif|gif)$/i.test(f.type||"");
/* isi <img data-img> dengan foto (didekripsi bila perlu) */
async function fillImgs(root,ikFn){const imgs=[...root.querySelectorAll("img[data-img]")].filter(i=>!i.dataset.done);if(!imgs.length)return;
  const u=await urlsFor(imgs.map(i=>i.dataset.img));
  imgs.forEach(i=>{const p=i.dataset.img,s=E2()?E2().imgSrc(p,u(p),ikFn?ikFn(p):PK[p]):u(p);if(s){i.src=s;i.dataset.done="1"}})}
function dl(url,nm){const a=document.createElement("a");a.href=url;a.download=nm||"file";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}

/* aktivitas untuk pusat notifikasi (tanpa isi pesan) */
async function activity(target,kind,ref,meta){if(!target||target===S.me)return;try{await sb.from("couple_activity").insert({target,kind,ref:ref!=null?String(ref):null,meta:meta||{}})}catch(e){}}
async function unActivity(kind,ref){try{await sb.from("couple_activity").delete().eq("actor",S.me).eq("kind",kind).eq("ref",String(ref))}catch(e){}}

const css=document.createElement("style");css.textContent=`
.rv-av{flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:99px;overflow:hidden;background:var(--accS);position:relative}
.rv-av .pipi{animation:none!important;margin-top:8%}.rv-av.txt{color:#fff;font-weight:900;line-height:1}
.stk-w{display:block}.stk-w .pipi{display:block;animation:none!important}
.stk-k{display:inline-flex;flex-direction:column;align-items:center;gap:0}.stk-cap{font-weight:900;font-size:13px;line-height:1.1;color:#fff;background:var(--acc);border:2px solid #fff;border-radius:10px;padding:3px 8px;margin-top:-12px;box-shadow:0 2px 6px rgba(0,0,0,.15);white-space:nowrap;position:relative}
.stk-grid .stk-cap{font-size:9px;padding:1px 5px;margin-top:-8px;border-width:1.5px}
.rx-s{display:inline-flex;vertical-align:middle}.rx-s .pipi{animation:none!important}
.fd-post{border:1px solid var(--line);border-radius:18px;background:var(--card);overflow:hidden;margin-bottom:14px;content-visibility:auto;contain-intrinsic-size:auto 640px}
.fd-top{display:flex;gap:10px;align-items:center;padding:10px 12px}.fd-top b{display:block;font-size:14px}.fd-top .crumb{font-size:12px}
.fd-img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:var(--th);cursor:pointer}
.fd-act{display:flex;gap:4px;align-items:center;padding:6px 8px 0}.fd-act button{all:unset;cursor:pointer;font-size:24px;padding:4px 6px;line-height:1;transition:transform .15s}
.fd-act button:active{transform:scale(.85)}.fd-act button:focus-visible{outline:3px solid var(--acc);border-radius:8px}
.fd-likes{font-weight:800;font-size:13.5px;padding:2px 14px}.fd-cap{padding:2px 14px 6px;font-size:14px;line-height:1.45;overflow-wrap:anywhere}
.fd-cm{padding:0 14px;font-size:13.5px;line-height:1.5;overflow-wrap:anywhere}.fd-cm b{margin-right:4px}
.fd-add{display:flex;gap:6px;padding:8px 10px 12px}.fd-add input{flex:1;min-width:0;border-radius:99px}
.fd-heart{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:90px;pointer-events:none;animation:fdh .8s ease-out forwards}
@keyframes fdh{0%{transform:scale(.3);opacity:0}30%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:0}}
.fd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:12px}.fd-grid button{all:unset;cursor:pointer;aspect-ratio:1;background:var(--th);overflow:hidden}.fd-grid img{width:100%;height:100%;object-fit:cover;display:block}
@media (prefers-reduced-motion:reduce){.fd-heart{animation:none;opacity:0}}`;document.head.appendChild(css);

/* ---------- layar setup / bukan pasangan ---------- */
function setupCard(v,title){
  const notMember=S.setupErr==="notmember";
  v.innerHTML=page(L("Berdua","Together"),title)+`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0 0 12px">${window.pipi?window.pipi("think",64,"vnel"):""}<div class="bubble"><b>${notMember?L("Akun ini belum terdaftar sebagai anggota RaVi","This account isn't a RaVi member yet"):L("Belum bisa tersambung","Can't connect yet")}</b>
   <div>${notMember?L("Minta admin RaVi menambahkan akunmu (Chat → ＋ → Tambah anggota).","Ask the RaVi admin to add your account (Chat → ＋ → Add member)."):L("Periksa koneksi internet, lalu coba lagi.","Check your internet connection, then try again.")}</div></div></div>
   <div class="tl-row"><button class="pri" id="soRetry">↻ ${L("Coba lagi","Try again")}</button></div>
   <p class="crumb" style="margin:10px 0 0">${L("Detail teknis: ","Technical detail: ")}${esc(S.setupErr)}</p></div></div>`;
  $("soRetry").onclick=()=>{S.ready=null;S.setupErr="";render()}}
function withInit(v,title,draw){
  if(S.me&&!S.setupErr&&S.ready){draw(v);return}
  v.innerHTML=page(L("Berdua","Together"),title)+`<div class="region"><div class="rb crumb">${L("Menyambungkan…","Connecting…")}</div></div>`;
  init().then(()=>{if(v.isConnected)draw(v)}).catch(()=>{if(v.isConnected)setupCard(v,title)})}

/* =====================================================================
   FEED (khusus pasangan)
   ===================================================================== */
let fdMode="list";
const sealCap=t=>sealFor(t,partners());
function drawFeed(v){
  if(!isPartner(S.me)){v.innerHTML=page(L("Berdua","Together"),"📷 Feed")+`<div class="region"><div class="rb crumb">${L("Feed ini khusus pasangan pemilik RaVi.","This feed is only for the RaVi couple.")}</div></div>`;return}
  const posts=S.posts,y=window.scrollY;
  v.innerHTML=page(L("Berdua","Together"),"📷 Feed",`<button class="pri" id="fdNew">＋ ${L("Posting","Post")}</button><input type="file" id="fdFile" accept="image/*" hidden>`)+
   (posts.length?`<div class="tl-tabs"><button class="sm${fdMode==="list"?" pri":""}" data-fm="list">▤ ${L("Linimasa","Timeline")}</button><button class="sm${fdMode==="grid"?" pri":""}" data-fm="grid">▦ Grid</button><span class="crumb" style="align-self:center">${posts.length} ${L("postingan","posts")} · ❤️ ${posts.reduce((s,p)=>s+(p.likes||[]).length,0)}</span></div>`:"")+
   (fdMode==="grid"&&posts.length?`<div class="fd-grid">${posts.map(p=>`<button data-go="${p.id}" aria-label="${L("Buka postingan","Open post")}"><img data-img="${esc(p.img)}" alt=""></button>`).join("")}</div>`
   :posts.length?posts.map(p=>{const liked=(p.likes||[]).includes(S.me),cm=S.comments[p.id]||[];
     return `<article class="fd-post" id="post${p.id}" data-p="${p.id}"><div class="fd-top">${avatar(p.author,36)}<div style="flex:1;min-width:0"><b class="au"></b><span class="crumb">${ago(p.created_at)}</span></div>${p.author===S.me?`<button class="sm" data-pdel="${p.id}" aria-label="${L("Hapus postingan","Delete post")}">⋯</button>`:""}</div>
      <div style="position:relative"><img class="fd-img" data-img="${esc(p.img)}" data-dbl="${p.id}" alt="" loading="lazy"></div>
      <div class="fd-act"><button data-like="${p.id}" aria-pressed="${liked}" aria-label="${L("Suka","Like")}">${liked?"❤️":"🤍"}</button><button data-cfocus="${p.id}" aria-label="${L("Komentar","Comment")}">💬</button></div>
      <div class="fd-likes">${(p.likes||[]).length?(esc((p.likes||[]).map(name).join(" & "))+L(" menyukai ini"," liked this")):L("Belum ada yang suka","No likes yet")}</div>
      ${p.caption&&parse(pt(p.caption)).t?`<div class="fd-cap"><b class="au"></b> <span class="cp"></span></div>`:""}
      ${cm.map(c=>`<div class="fd-cm" data-c="${c.id}"><b></b><span></span>${c.author===S.me?` <button class="lnk" data-cdel="${c.id}" style="font-size:11px">${L("hapus","delete")}</button>`:""}</div>`).join("")}
      <div class="fd-add"><input data-cin="${p.id}" placeholder="${L("Tambah komentar…","Add a comment…")}" maxlength="300"><button class="sm" data-csend="${p.id}">${L("Kirim","Send")}</button></div></article>`}).join("")
   :`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0">${window.pipi?window.pipi("party",64,"vnel"):""}<div class="bubble"><b>${L("Feed khusus kalian berdua","A feed just for you two")}</b><div>${L("Posting foto momen sehari-hari. Yang bisa lihat, like, dan komentar cuma kalian berdua.","Post everyday moments. Only the two of you can see, like and comment.")}</div></div></div></div></div>`);
  window.scrollTo({top:y});
  fillCaps(v);
  v.querySelectorAll(".fd-post").forEach(el=>{const p=posts.find(x=>x.id==el.dataset.p);el.querySelectorAll(".au").forEach(a=>a.textContent=name(p.author));const cp=el.querySelector(".cp");if(cp)cp.textContent=parse(pt(p.caption)).t;
    (S.comments[p.id]||[]).forEach(c=>{const r=el.querySelector(`[data-c="${c.id}"]`);r.querySelector("b").textContent=name(c.author);r.querySelector("span").textContent=pt(c.body)})});
  const ik={};posts.forEach(p=>ik[p.img]=ikOf(p.img,p.caption));fillImgs(v,p=>ik[p]);
  v.querySelectorAll("[data-fm]").forEach(b=>b.onclick=()=>{fdMode=b.dataset.fm;drawFeed(v)});
  v.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{fdMode="list";drawFeed(v);document.getElementById("post"+b.dataset.go)?.scrollIntoView({block:"start"})});
  const like=async id=>{const p=S.posts.find(x=>x.id===id);const has=(p.likes||[]).includes(S.me);p.likes=has?p.likes.filter(x=>x!==S.me):[...(p.likes||[]),S.me];drawFeed(v);
    const {data}=await sb.from("couple_posts").select("likes").eq("id",id).single();const cur=new Set(data?.likes||[]);has?cur.delete(S.me):cur.add(S.me);await sb.from("couple_posts").update({likes:[...cur]}).eq("id",id);
    if(has)unActivity("like",id);else activity(p.author,"like",id)};
  v.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>like(+b.dataset.like));
  v.querySelectorAll("[data-dbl]").forEach(img=>{let last=0;img.addEventListener("click",()=>{const n=Date.now();if(n-last<350){const id=+img.dataset.dbl;const h=document.createElement("div");h.className="fd-heart";h.textContent="❤️";img.parentElement.appendChild(h);setTimeout(()=>h.remove(),900);if(!(S.posts.find(x=>x.id===id).likes||[]).includes(S.me))like(id)}last=n})});
  v.querySelectorAll("[data-cfocus]").forEach(b=>b.onclick=()=>v.querySelector(`[data-cin="${b.dataset.cfocus}"]`)?.focus());
  const sendC=async id=>{const inp=v.querySelector(`[data-cin="${id}"]`),body=inp.value.trim();if(!body)return;inp.value="";inp.blur();
    let sealed;try{sealed=await sealCap(body)}catch(e){inp.value=body;status(e.message,"warn");return}const {data,error}=await sb.from("couple_comments").insert({post_id:id,body:sealed}).select().single();if(error){status(error.message,"err");return}
    const a=S.comments[id]=S.comments[id]||[];if(!a.some(c=>c.id===data.id))a.push(data);drawFeed(v);
    const post=S.posts.find(x=>x.id===id);if(post)activity(post.author,"comment",data.id,{p:id});
    if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("post",{to:partners().filter(u=>u!==S.me),body:"💬 "+L("Komentar baru","New comment")})};
  v.querySelectorAll("[data-csend]").forEach(b=>b.onclick=()=>sendC(+b.dataset.csend));
  v.querySelectorAll("[data-cin]").forEach(i=>i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();sendC(+i.dataset.cin)}});
  v.querySelectorAll("[data-cdel]").forEach(b=>b.onclick=async()=>{const id=+b.dataset.cdel;await sb.from("couple_comments").delete().eq("id",id);unActivity("comment",id);for(const k in S.comments)S.comments[k]=S.comments[k].filter(c=>c.id!==id);drawFeed(v)});
  v.querySelectorAll("[data-pdel]").forEach(b=>b.onclick=()=>{const p=S.posts.find(x=>x.id===+b.dataset.pdel);modal(L("Hapus postingan?","Delete post?"),`<div class="crumb">${L("Foto, like, dan komentarnya ikut terhapus.","The photo, likes and comments are deleted too.")}</div>`,async()=>{
    const {error}=await sb.from("couple_posts").delete().eq("id",p.id);if(error){alert(error.message);return false}sb.storage.from("couple").remove([p.img]).catch(()=>{});unActivity("post",p.id);S.posts=S.posts.filter(x=>x.id!==p.id);drawFeed(v)},L("Hapus","Delete"))});
  $("fdNew").onclick=()=>$("fdFile").click();
  const fi=$("fdFile");fi.onchange=()=>{const f=fi.files[0];fi.value="";if(!f)return;const prev=URL.createObjectURL(f);
    const bg=modal(L("Postingan baru","New post"),`<img alt="" style="width:100%;max-height:50vh;object-fit:contain;border-radius:12px;background:var(--th)"><div style="height:10px"></div><label>${L("Keterangan","Caption")}</label><textarea id="fdCap" rows="3" maxlength="500" placeholder="${L("Tulis sesuatu…","Write something…")}"></textarea>`,
      async g=>{const btn=g.querySelector(".ok");btn.disabled=true;btn.textContent=L("Mengunggah…","Uploading…");
        try{const path=await upPhoto(f,1600);const capT=g.querySelector("#fdCap").value.trim();const capO={t:capT,ik:PK[path]};const {data,error}=await sb.from("couple_posts").insert({img:path,caption:(capT||capO.ik)?await sealCap(pack(capO)):null}).select().single();if(error)throw error;
          if(!S.posts.some(x=>x.id===data.id))S.posts.unshift(data);URL.revokeObjectURL(prev);
          partners().forEach(u=>activity(u,"post",data.id));
          if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("post",{to:partners().filter(u=>u!==S.me),body:"📷 "+L("Postingan baru","New post")});fdMode="list";drawFeed($("view"))}
        catch(e){btn.disabled=false;btn.textContent=L("Posting","Post");alert(L("Gagal posting: ","Couldn't post: ")+(e.message||e));return false}},L("Posting","Post"));
    bg.querySelector("img").src=prev}}

/* =====================================================================
   PASANG
   ===================================================================== */
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{
  feed:v=>{try{withInit(v,"📷 Feed",drawFeed)}catch(e){v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}}});
if(window.TOOL_ROUTES)window.TOOL_ROUTES.add("feed");
NAV.splice(1,0,["Berdua",[["chat","💬 Chat"],["feed","📷 Feed"]]]);
if(typeof render==="function"){const _r=render;render=function(){if(route==="feed"&&S.ready&&document.getElementById("view")?.querySelector(".fd-post,.pipi-card")&&!render._nav){renderNav();return}return _r.apply(this,arguments)}}
const _go=go;go=function(r){render._nav=true;try{return _go(r)}finally{render._nav=false}};
if(window.doPeek){const _pk=window.doPeek;window.doPeek=function(){if(route==="chat"||route==="feed")return;return _pk.apply(this,arguments)}}
const pkCss=document.createElement("style");pkCss.textContent="html.on-chat .peek{display:none!important}";document.head.appendChild(pkCss);
const markRoute=r=>document.documentElement.classList.toggle("on-chat",r==="chat"||r==="feed");
const _go2=go;go=function(r){markRoute(r);return _go2.apply(this,arguments)};
addEventListener("load",()=>markRoute(route));

window.RS={S,init,loadMembers,name,isPartner,partners,hhmm,ago,avatar,groupAvatar,pipiM,charOf,
  KATA,STABS,EMOTES,UNI,isStk,stkKey,stkSVG,fillCaps,rxHTML,pt,isEnc,sealFor,parse,pack,PK,ikOf,
  urlsFor,upPhoto,uploadFile,fileURL,isPhoto,fIcon,fmtSize,MAXF,fillImgs,dl,activity,unActivity,setupCard,withInit,L};
})();
