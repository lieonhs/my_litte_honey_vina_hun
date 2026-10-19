/* =====================================================================
   BERSAMA: anggota, stiker, foto terenkripsi + 📷 Feed (ala Instagram) khusus pasangan.
   Chat ada di chat.js, telepon di call.js, pusat notifikasi di notif.js.
   Helper dibagikan lewat window.RS.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const ok=()=>typeof sb!=="undefined"&&sb;
const S={me:null,members:{},friends:{},ready:null,setupErr:"",posts:[],comments:{},sub:false};
const cap1=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const name=u=>cap1(S.members[u]?.name)||(u===S.me?L("Kamu","You"):L("Anggota","Member"));
const isPartner=u=>!!S.members[u]?.partner;
const partners=()=>Object.keys(S.members).filter(isPartner);
/* ---------- pertemanan: chat & feed hanya dengan teman (pasangan otomatis berteman) ---------- */
const isFriend=u=>u===S.me||(isPartner(S.me)&&isPartner(u))||S.friends[u]?.status==="accepted";
const friendState=u=>u===S.me?"self":isFriend(u)?"friend":S.friends[u]?(S.friends[u].by===S.me?"out":"in"):"none";
const friends=()=>Object.keys(S.members).filter(u=>u!==S.me&&isFriend(u));
async function loadFriends(){const {data,error}=await sb.from("couple_friends").select("*");if(error)throw error;const f={};
  (data||[]).forEach(r=>{const o=r.user_a===S.me?r.user_b:r.user_a;f[o]={status:r.status,by:r.requested_by}});S.friends=f;document.dispatchEvent(new CustomEvent("ravi-friends"))}
async function friendAct(u,act){const {data,error}=await sb.rpc("ravi_friend",{other:u,act});if(error)throw error;await loadFriends();
  if(window.RAVI_NOTIFY&&(act==="request"||act==="accept"))window.RAVI_NOTIFY("act",{to:[u],title:name(S.me),body:data==="accepted"?"🤝 "+L("Menerima permintaan pertemananmu","Accepted your friend request"):"👋 "+L("Ingin berteman denganmu","Wants to be your friend"),url:"./?go=notif"});
  if(data==="accepted"&&S.ready)loadPosts().then(refresh).catch(()=>{});return data}
const hhmm=t=>new Date(t).toLocaleTimeString(EN()?"en-GB":"id-ID",{hour:"2-digit",minute:"2-digit"});
const ago=t=>{const s=(Date.now()-new Date(t))/1000;if(s<60)return L("baru saja","just now");if(s<3600)return Math.floor(s/60)+L(" mnt"," min");if(s<86400)return Math.floor(s/3600)+L(" jam"," h");if(s<7*86400)return Math.floor(s/86400)+L(" hr"," d");return new Date(t).toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short"})};

/* ---------- koneksi ---------- */
async function loadMembers(){const {data:mem,error}=await sb.from("couple_members").select("user_id,name,partner,role,last_seen,avatar,bio,photo,song");if(error)throw error;
  if(!mem||!mem.some(m=>m.user_id===S.me))throw new Error("notmember");S.members={};mem.forEach(m=>S.members[m.user_id]=m)}
async function init(){
  if(S.ready)return S.ready;
  S.ready=(async()=>{
    if(!ok())throw new Error("offline");
    const {data:ses}=await sb.auth.getSession();S.me=ses?.session?.user?.id||null;if(!S.me)throw new Error("login");
    await loadMembers();
    const who=(window.TOOLS||{}).me,want=who==="vina"?"Vina":who==="rafi"?"Rafi":null;
    if(want&&isPartner(S.me)&&S.members[S.me].name!==want){S.members[S.me].name=want;sb.from("couple_members").update({name:want}).eq("user_id",S.me).then(()=>{},()=>{})}
    await loadFriends().catch(()=>{});await loadPosts().catch(()=>{});subscribe();applyGate()
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
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_friends"},()=>{loadFriends().then(()=>loadPosts()).then(refresh).catch(()=>{})})
   .subscribe();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&S.me&&route==="feed")loadPosts().then(refresh).catch(()=>{})})}
function refresh(){if(route==="feed"){const v=document.getElementById("view");if(v)drawFeed(v)}}
document.addEventListener("ravi-e2e",()=>{if(route==="feed")refresh()});

/* ---------- avatar ---------- */
const memo=new Map();
function pipiM(mood,size,ch){if(!window.pipi)return "";const k=mood+"|"+size+"|"+ch;if(!memo.has(k)){if(memo.size>400)memo.clear();memo.set(k,window.pipi(mood,size,ch))}return memo.get(k)}
/* karakter (Rafi/Vina/dll.) hanya untuk pasangan; anggota lain pakai foto atau inisial */
const charOf=u=>{if(!isPartner(u))return null;const a=S.members[u]?.avatar;if(a)return a;const n=(S.members[u]?.name||"").toLowerCase();return /^vina/.test(n)?"vcap":/^(rafi|el)\b/.test(n)?"erusa":null};
const hue=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h};
/* foto profil (tersimpan biasa, tidak dienkripsi — terlihat oleh semua anggota RaVi) */
const AVU={},AVP={};
function avURL(path){if(AVU[path])return AVU[path];if(!AVP[path])AVP[path]=sb.storage.from("couple").createSignedUrl(path,6*3600).then(({data})=>{if(data&&data.signedUrl){AVU[path]=data.signedUrl;
    document.querySelectorAll('img[data-avp="'+CSS.escape(path)+'"]').forEach(i=>i.src=data.signedUrl)}}).catch(()=>{}).finally(()=>{setTimeout(()=>delete AVP[path],5000)});return ""}
function avatar(u,size,mood){const ph=S.members[u]?.photo,s=size||40;
  if(ph){const src=avURL(ph);return `<span class="rv-av ph" style="width:${s}px;height:${s}px"><img data-avp="${esc(ph)}" ${src?`src="${esc(src)}"`:""} alt="" style="width:100%;height:100%;object-fit:cover"></span>`}
  const c=charOf(u);
  if(c&&window.pipi)return `<span class="rv-av" style="width:${s}px;height:${s}px">${pipiM(mood||"happy",Math.round(s*1.05),c)}</span>`;
  const n=name(u);return `<span class="rv-av txt" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.42)}px;background:hsl(${hue(u)} 60% 55%)">${esc((n||"?").charAt(0).toUpperCase())}</span>`}
function groupAvatar(emoji,size,seed){const s=size||40;return `<span class="rv-av txt grp" style="width:${s}px;height:${s}px;font-size:${Math.round(s*.5)}px;background:linear-gradient(135deg,hsl(${hue(seed||"g")} 65% 60%),hsl(${(hue(seed||"g")+50)%360} 65% 52%))">${esc(emoji||"👥")}</span>`}

/* ---------- stiker & emote buatan sendiri (karakter aplikasi) ---------- */
const MOODS5=["happy","party","worried","think","sleep"];
const KATA=[["vnel","party","Sayang kamu!"],["vcap","happy","Selamat pagi ☀️"],["erusa","party","Semangat!"],["vorange","worried","Kangen 🥺"],["ebuku","think","Kerja dulu ya"],["vkrl","sleep","Good night 🌙"],
 ["erenang","happy","Otw!"],["vsantai","party","Makasih ❤️"],["ekaget","worried","Maaf yaa 🙏"],["vkantor","think","Makan apa?"],["cpkencan","happy","Date yuk!"],["cpcocok","party","Saldo aman 💸"],
 ["pipi","party","Gajian!!"],["moci","sleep","Mager…"],["bubu","happy","Laper 🍜"],["erusa","sleep","Ngantuk"],["vcap","party","Yeay!"],["ekaget","think","Hah, serius?"],["vnel","happy","Kita hebat!"],["kiki","worried","Telat dikit…"]];
/* karakter Rafi & Vina (dan pasangan) + tema lucu + achievement: khusus pasangan */
const coupleChar=k=>{const c=String(k||"").startsWith("k:")?(KATA[+String(k).slice(2)]||[""])[0]:String(k||"").split(":")[0];return /^(v[a-z]|e[a-z]|cp)/.test(c)};
const meNP=()=>!!(S.me&&S.members[S.me]&&!isPartner(S.me));
const STABS=()=>meNP()?STABS0().filter(t=>t[0]==="hewan"||t[0]==="emoji"||t[0]==="kata").map(t=>t[2]?[t[0],t[1],t[2].filter(k=>!coupleChar(k))]:t):STABS0();
const STABS0=()=>[["kata","💬 "+L("Kata","Words"),KATA.map((_,i)=>"k:"+i)],
 ["couple","💑 Couple",[...MOODS5.map(m=>"vnel:"+m),"cpkencan:happy","cpselfie:happy","cptutup:happy","cpkrl:happy","cpcocok:happy"]],
 ["vina","👩 Vina",["vcap","vkantor","vorange","vsantai","vkrl"].flatMap(c=>MOODS5.map(m=>c+":"+m))],
 ["el","👓 El",["erusa","ebuku","erenang","ekaget"].flatMap(c=>MOODS5.map(m=>c+":"+m))],
 ["hewan","🐾 "+L("Hewan","Animals"),["pipi","moci","kodi","cimi","mumu","bubu","pandi","kiki","popo","rubi"].flatMap(c=>["happy","party","worried"].map(m=>c+":"+m))],
 ["emoji","😀 Emoji",null]];
const EMOTES0=["vnel:party","vcap:happy","erusa:party","vorange:worried","ekaget:worried","vkrl:sleep","cpkencan:happy","pipi:party","bubu:happy","vsantai:party"];
const UNI=["❤️","🥰","😘","😂","🥺","👍","🙏","😴","😭","😡","🤔","🎉","🍜","☕","💸","🏠","🚆","🐄","✨","🔥","😎","🤗","🙈","💯"];
const EMOTES_=()=>meNP()?EMOTES0.filter(k=>!coupleChar(k)).concat(["moci:happy","kodi:party","kiki:happy","popo:party"]):EMOTES0;
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
function parse(shown){if(typeof shown==="string"&&shown.startsWith("j1:")){try{const o=JSON.parse(shown.slice(3));return {t:o.t||"",r:o.r||null,f:o.f||null,fwd:!!o.fwd,ik:o.ik||null,vo:+o.vo||0,sg:o.sg||null,loc:o.loc||null}}catch(e){}}return {t:shown||"",r:null,f:null,fwd:false,ik:null,vo:0,sg:null,loc:null}}
function pack(o){if(!o.r&&!o.f&&!o.fwd&&!o.ik&&!o.vo&&!o.sg&&!o.loc)return o.t||"";return "j1:"+JSON.stringify({t:o.t||undefined,r:o.r||undefined,f:o.f||undefined,fwd:o.fwd||undefined,ik:o.ik||undefined,vo:o.vo||undefined,sg:o.sg||undefined,loc:o.loc||undefined})}
/* ---------- lagu (Spotify / YouTube) ---------- */
function songEmbed(u){u=String(u||"");let m=u.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|artist)\/([A-Za-z0-9]{10,40})/);
  if(m)return {k:"spotify",src:"https://open.spotify.com/embed/"+m[1]+"/"+m[2],h:m[1]==="track"||m[1]==="episode"?152:352};
  m=u.match(/^https:\/\/(?:www\.|music\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)([\w-]{11})/)||u.match(/^https:\/\/youtu\.be\/([\w-]{11})/);
  if(m)return {k:"youtube",src:"https://www.youtube-nocookie.com/embed/"+m[1],id:m[1],h:0};
  if(/^https:\/\/spotify\.link\//.test(u))return {k:"spotify",src:null};return null}
const songOK=u=>!u||/^https:\/\/(open\.spotify\.com|spotify\.link|(www\.|music\.|m\.)?youtube\.com|youtu\.be)\//i.test(u);
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

const cmUrls={};async function cmImg(f){if(cmUrls[f.p])return cmUrls[f.p];const u=await fileURL(f);cmUrls[f.p]=u;return u}
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
.fd-add{display:flex;gap:4px;align-items:center;padding:8px 10px 12px}.fd-add input[data-cin]{flex:1;min-width:0;border-radius:99px}
.fd-ic{all:unset;cursor:pointer;width:36px;height:36px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;font-size:19px;flex:none;transition:background .15s,transform .15s}
.fd-ic:hover,.fd-ic:focus-visible{background:var(--th)}.fd-ic:active{transform:scale(.9)}.fd-ic.on{background:var(--accS)}
.fd-stk{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:4px;padding:6px 10px 10px;max-height:220px;overflow-y:auto;border-top:1px dashed var(--line);animation:fdS .18s ease-out}
.fd-stk button{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:64px;border-radius:12px}.fd-stk button:hover{background:var(--th)}.fd-stk .pipi{animation:none!important}
.fd-emo{display:flex;gap:2px;overflow-x:auto;padding:6px 10px 0;border-top:1px dashed var(--line);scrollbar-width:none}.fd-emo button{all:unset;cursor:pointer;font-size:22px;padding:4px 6px;border-radius:10px;flex:none}.fd-emo button:hover{background:var(--th)}
.fd-emo+.fd-stk{border-top:0}
@keyframes fdS{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.fd-cm .cmx{margin:4px 0 2px 0}.fd-cm .cmx:empty{display:none}.fd-cm .cmx img{display:block;max-width:220px;max-height:260px;border-radius:12px;object-fit:cover;background:var(--th);cursor:zoom-in}
.fd-cm .cmx .stk-w{display:inline-block}.fd-cm .rp{font-size:11.5px;margin-left:6px}
.fd-cm.new{animation:fdS .25s ease-out}
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
/* penonton postingan = yang dipilih saat posting (teman, atau pasangan saja) */
const audOf=p=>[...new Set([...(p&&p.aud||partners()),p?p.author:S.me])];
const sealCap=(t,aud)=>sealFor(t,aud);
function drawFeed(v){
  if(!friends().length){v.innerHTML=page(L("Berdua","Together"),"📷 Feed")+`<div class="region"><div class="rb" style="text-align:center;padding:28px 16px"><div style="font-size:46px">🔒</div><b style="display:block;font-size:17px;margin:6px 0">${L("Feed terbuka setelah kamu punya teman","Feed opens once you have friends")}</b><div class="crumb" style="max-width:360px;margin:0 auto 12px;line-height:1.5">${L("Kirim permintaan pertemanan ke orang di RaVi. Setelah dia menerima, kalian bisa saling lihat postingan, like, dan komentar.","Send a friend request to someone on RaVi. Once they accept, you can see each other's posts, likes and comments.")}</div><button class="pri" id="fdFr">👋 ${L("Cari teman","Find friends")}</button></div></div>`;
    document.getElementById("fdFr").onclick=()=>window.RAVI_FRIENDS&&window.RAVI_FRIENDS();return}
  const posts=S.posts,y=window.scrollY;
  v.innerHTML=page(L("Berdua","Together"),"📷 Feed",`<button class="pri" id="fdNew">＋ ${L("Posting","Post")}</button><input type="file" id="fdFile" accept="image/*" hidden>`)+
   (posts.length?`<div class="tl-tabs"><button class="sm${fdMode==="list"?" pri":""}" data-fm="list">▤ ${L("Linimasa","Timeline")}</button><button class="sm${fdMode==="grid"?" pri":""}" data-fm="grid">▦ Grid</button><span class="crumb" style="align-self:center">${posts.length} ${L("postingan","posts")} · ❤️ ${posts.reduce((s,p)=>s+(p.likes||[]).length,0)}</span></div>`:"")+
   (fdMode==="grid"&&posts.length?`<div class="fd-grid">${posts.map(p=>`<button data-go="${p.id}" aria-label="${L("Buka postingan","Open post")}"><img data-img="${esc(p.img)}" alt=""></button>`).join("")}</div>`
   :posts.length?posts.map(p=>{const liked=(p.likes||[]).includes(S.me),cm=S.comments[p.id]||[];
     return `<article class="fd-post" id="post${p.id}" data-p="${p.id}"><div class="fd-top">${avatar(p.author,36)}<div style="flex:1;min-width:0"><b class="au"></b><span class="crumb">${ago(p.created_at)} · ${(p.aud||[]).length<=2&&(p.aud||[]).every(isPartner)?"💑 "+L("Berdua","Just us"):"👥 "+L("Teman","Friends")}</span></div>${p.author===S.me?`<button class="sm" data-pdel="${p.id}" aria-label="${L("Hapus postingan","Delete post")}">⋯</button>`:""}</div>
      <div style="position:relative"><img class="fd-img" data-img="${esc(p.img)}" data-dbl="${p.id}" alt="" loading="lazy"></div>
      <div class="fd-act"><button data-like="${p.id}" aria-pressed="${liked}" aria-label="${L("Suka","Like")}">${liked?"❤️":"🤍"}</button><button data-cfocus="${p.id}" aria-label="${L("Komentar","Comment")}">💬</button></div>
      <div class="fd-likes">${(p.likes||[]).length?(esc((p.likes||[]).map(name).join(" & "))+L(" menyukai ini"," liked this")):L("Belum ada yang suka","No likes yet")}</div>
      ${p.caption&&parse(pt(p.caption)).t?`<div class="fd-cap"><b class="au"></b> <span class="cp"></span></div>`:""}
      ${cm.map(c=>`<div class="fd-cm" data-c="${c.id}"><b></b><span class="ct"></span><div class="cmx"></div><button class="lnk rp" data-crp="${p.id}" data-who="${esc(name(c.author))}">${L("Balas","Reply")}</button>${c.author===S.me?` <button class="lnk rp" data-cdel="${c.id}">${L("hapus","delete")}</button>`:""}</div>`).join("")}
      <div class="fd-add"><button class="fd-ic" data-cstk="${p.id}" aria-label="${L("Stiker","Sticker")}" title="${L("Stiker","Sticker")}">🧸</button><label class="fd-ic" title="${L("Foto","Photo")}" aria-label="${L("Balas dengan foto","Reply with a photo")}">📷<input type="file" accept="image/*" data-cimg="${p.id}" hidden></label>
       <input data-cin="${p.id}" placeholder="${L("Tambah komentar…","Add a comment…")}" maxlength="300"><button class="sm" data-csend="${p.id}">${L("Kirim","Send")}</button></div><div data-cstkp="${p.id}"></div></article>`}).join("")
   :`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0">${window.pipi?window.pipi("party",64,"vnel"):""}<div class="bubble"><b>${L("Belum ada postingan","No posts yet")}</b><div>${L("Posting foto momen sehari-hari. Yang bisa lihat, like, dan komentar hanya teman-temanmu di RaVi.","Post everyday moments. Only your friends on RaVi can see, like and comment.")}${friends().length?"":`<br><button class="sm pri" id="fdFr" style="margin-top:8px">👋 ${L("Cari teman","Find friends")}</button>`}</div></div></div></div></div>`);
  window.scrollTo({top:y});
  fillCaps(v);
  v.querySelectorAll(".fd-post").forEach(el=>{const p=posts.find(x=>x.id==el.dataset.p);el.querySelectorAll(".au").forEach(a=>a.textContent=name(p.author));const cp=el.querySelector(".cp");if(cp)cp.textContent=parse(pt(p.caption)).t;
    (S.comments[p.id]||[]).forEach(c=>{const r=el.querySelector(`[data-c="${c.id}"]`);r.querySelector("b").textContent=name(c.author);const o=parse(pt(c.body)),x=r.querySelector(".cmx");
      if(isStk(o.t)){r.querySelector(".ct").textContent="";x.innerHTML=`<span class="stk-w" data-stk="${stkKey(o.t)}">${stkSVG(stkKey(o.t),88)}</span>`;fillCaps(x)}
      else{r.querySelector(".ct").textContent=o.t;if(o.f&&/^image\//.test(o.f.m)){x.innerHTML=`<img alt="${L("Foto","Photo")}">`;const im=x.querySelector("img");cmImg(o.f).then(u=>{if(u)im.src=u}).catch(()=>{});
        im.onclick=()=>{const bg=modal(L("Foto","Photo"),`<img alt="" style="width:100%;border-radius:12px">`,()=>true,"OK");bg.querySelector("img").src=im.src;const cc=bg.querySelector(".c");if(cc)cc.style.display="none"}}}})});
  const ik={};posts.forEach(p=>ik[p.img]=ikOf(p.img,p.caption));fillImgs(v,p=>ik[p]);
  v.querySelectorAll("[data-fm]").forEach(b=>b.onclick=()=>{fdMode=b.dataset.fm;drawFeed(v)});
  v.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{fdMode="list";drawFeed(v);document.getElementById("post"+b.dataset.go)?.scrollIntoView({block:"start"})});
  const like=async id=>{const p=S.posts.find(x=>x.id===id);const has=(p.likes||[]).includes(S.me);p.likes=has?p.likes.filter(x=>x!==S.me):[...(p.likes||[]),S.me];drawFeed(v);
    const {data}=await sb.from("couple_posts").select("likes").eq("id",id).single();const cur=new Set(data?.likes||[]);has?cur.delete(S.me):cur.add(S.me);await sb.from("couple_posts").update({likes:[...cur]}).eq("id",id);
    if(has)unActivity("like",id);else activity(p.author,"like",id)};
  v.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>like(+b.dataset.like));
  v.querySelectorAll("[data-dbl]").forEach(img=>{let last=0;img.addEventListener("click",()=>{const n=Date.now();if(n-last<350){const id=+img.dataset.dbl;const h=document.createElement("div");h.className="fd-heart";h.textContent="❤️";img.parentElement.appendChild(h);setTimeout(()=>h.remove(),900);if(!(S.posts.find(x=>x.id===id).likes||[]).includes(S.me))like(id)}last=n})});
  v.querySelectorAll("[data-cfocus]").forEach(b=>b.onclick=()=>v.querySelector(`[data-cin="${b.dataset.cfocus}"]`)?.focus());
  const sendC=async(id,extra)=>{const inp=v.querySelector(`[data-cin="${id}"]`),body=inp.value.trim();if(!body&&!extra)return;
    const o=extra&&extra.stk?{t:extra.stk}:{t:extra&&extra.stk?"":body,f:extra&&extra.f};if(!(extra&&extra.stk))inp.value="";inp.blur();
    const post0=S.posts.find(x=>x.id===id);let sealed;try{sealed=await sealCap(pack(o),audOf(post0))}catch(e){inp.value=body;status(e.message,"warn");return}const {data,error}=await sb.from("couple_comments").insert({post_id:id,body:sealed}).select().single();if(error){status(error.message,"err");return}
    S.lastNewC=data.id;
    const a=S.comments[id]=S.comments[id]||[];if(!a.some(c=>c.id===data.id))a.push(data);drawFeed(v);
    const post=S.posts.find(x=>x.id===id);if(post)activity(post.author,"comment",data.id,{p:id});
    if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("post",{to:audOf(post).filter(u=>u!==S.me),body:"💬 "+L("Komentar baru","New comment")})};
  v.querySelectorAll("[data-csend]").forEach(b=>b.onclick=()=>sendC(+b.dataset.csend));
  if(S.lastNewC){const n=v.querySelector(`[data-c="${S.lastNewC}"]`);if(n)n.classList.add("new");S.lastNewC=null}
  v.querySelectorAll("[data-crp]").forEach(b=>b.onclick=()=>{const i=v.querySelector(`[data-cin="${b.dataset.crp}"]`);i.value="@"+b.dataset.who+" ";i.focus()});
  v.querySelectorAll("[data-cstk]").forEach(b=>b.onclick=()=>{const id=b.dataset.cstk,box=v.querySelector(`[data-cstkp="${id}"]`);if(box.innerHTML){box.innerHTML="";b.classList.remove("on");return}
    v.querySelectorAll("[data-cstkp]").forEach(x=>x.innerHTML="");v.querySelectorAll("[data-cstk]").forEach(x=>x.classList.remove("on"));b.classList.add("on");
    const keys=[...EMOTES_(),...KATA.map((_,i)=>"k:"+i).slice(0,12),...MOODS5.map(m=>"vnel:"+m),"cpkencan:happy","cpselfie:happy","cpcocok:happy",...["pipi","moci","kodi","kiki"].map(c=>c+":party")].filter(k=>!meNP()||!coupleChar(k));
    box.innerHTML=`<div class="fd-emo">${UNI.map(e=>`<button data-em="${e}">${e}</button>`).join("")}</div><div class="fd-stk">${[...new Set(keys)].map(k=>`<button data-sk="${k}" data-stk="${k}" aria-label="${L("Kirim stiker","Send sticker")}">${stkSVG(k,58)}</button>`).join("")}</div>`;fillCaps(box);
    box.querySelectorAll("[data-em]").forEach(x=>x.onclick=()=>{const i=v.querySelector(`[data-cin="${id}"]`);i.value+=x.dataset.em;i.focus()});
    box.querySelectorAll("[data-sk]").forEach(x=>x.onclick=()=>{box.innerHTML="";b.classList.remove("on");sendC(+id,{stk:"[stk:"+x.dataset.sk+"]"})})});
  v.querySelectorAll("[data-cimg]").forEach(fi=>fi.onchange=async()=>{const f=fi.files[0],id=+fi.dataset.cimg;fi.value="";if(!f)return;
    status(L("Mengunggah foto…","Uploading photo…"),"");try{const path=await upPhoto(f,1280);await sendC(id,{f:{p:path,n:"foto.jpg",s:f.size,m:"image/jpeg",e:/\.enc$/.test(path),k:PK[path]||undefined}});status("")}catch(e){status(L("Gagal mengunggah: ","Upload failed: ")+(e.message||e),"err")}});
  v.querySelectorAll("[data-cin]").forEach(i=>i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();sendC(+i.dataset.cin)}});
  v.querySelectorAll("[data-cdel]").forEach(b=>b.onclick=async()=>{const id=+b.dataset.cdel;await sb.from("couple_comments").delete().eq("id",id);unActivity("comment",id);for(const k in S.comments)S.comments[k]=S.comments[k].filter(c=>c.id!==id);drawFeed(v)});
  v.querySelectorAll("[data-pdel]").forEach(b=>b.onclick=()=>{const p=S.posts.find(x=>x.id===+b.dataset.pdel);modal(L("Hapus postingan?","Delete post?"),`<div class="crumb">${L("Foto, like, dan komentarnya ikut terhapus.","The photo, likes and comments are deleted too.")}</div>`,async()=>{
    const {error}=await sb.from("couple_posts").delete().eq("id",p.id);if(error){alert(error.message);return false}sb.storage.from("couple").remove([p.img]).catch(()=>{});unActivity("post",p.id);S.posts=S.posts.filter(x=>x.id!==p.id);drawFeed(v)},L("Hapus","Delete"))});
  $("fdNew").onclick=()=>$("fdFile").click();
  const fr=document.getElementById("fdFr");if(fr)fr.onclick=()=>window.RAVI_FRIENDS&&window.RAVI_FRIENDS();
  const fi=$("fdFile");fi.onchange=()=>{const f=fi.files[0];fi.value="";if(!f)return;const prev=URL.createObjectURL(f);
    const canCouple=isPartner(S.me),fl=friends();
    const bg=modal(L("Postingan baru","New post"),`<img alt="" style="width:100%;max-height:50vh;object-fit:contain;border-radius:12px;background:var(--th)"><div style="height:10px"></div><label>${L("Keterangan","Caption")}</label><textarea id="fdCap" rows="3" maxlength="500" placeholder="${L("Tulis sesuatu…","Write something…")}"></textarea>
      <label style="margin-top:10px">${L("Siapa yang bisa lihat","Who can see this")}</label><div class="tl-row" id="fdAud" style="gap:6px;flex-wrap:wrap"><button class="sm pri" data-aud="fr">👥 ${L("Semua teman","All friends")} (${fl.length})</button>${canCouple?`<button class="sm" data-aud="cp">💑 ${L("Berdua saja","Just us two")}</button>`:""}</div>`,
      async g=>{const btn=g.querySelector(".ok");btn.disabled=true;btn.textContent=L("Mengunggah…","Uploading…");
        const audSel=g.querySelector("#fdAud .pri")?.dataset.aud||"fr",aud=[...new Set([S.me,...(audSel==="cp"?partners():friends())])];
        try{const path=await upPhoto(f,1600);const capT=g.querySelector("#fdCap").value.trim();const capO={t:capT,ik:PK[path]};const {data,error}=await sb.from("couple_posts").insert({img:path,aud,caption:(capT||capO.ik)?await sealCap(pack(capO),aud):null}).select().single();if(error)throw error;
          if(!S.posts.some(x=>x.id===data.id))S.posts.unshift(data);URL.revokeObjectURL(prev);
          aud.filter(u=>u!==S.me).forEach(u=>activity(u,"post",data.id));
          if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("post",{to:aud.filter(u=>u!==S.me),body:"📷 "+L("Postingan baru","New post")});fdMode="list";drawFeed($("view"))}
        catch(e){btn.disabled=false;btn.textContent=L("Posting","Post");alert(L("Gagal posting: ","Couldn't post: ")+(e.message||e));return false}},L("Posting","Post"));
    bg.querySelector("img").src=prev;bg.querySelectorAll("[data-aud]").forEach(b=>b.onclick=()=>bg.querySelectorAll("[data-aud]").forEach(x=>x.classList.toggle("pri",x===b)))}}

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

/* ---------- email teman (hanya diri sendiri & teman yang bisa melihat) ---------- */
S.emails={};async function loadEmails(){try{const {data}=await sb.rpc("ravi_friend_emails");S.emails={};(data||[]).forEach(r=>S.emails[r.user_id]=r.email)}catch(e){}return S.emails}
document.addEventListener("ravi-friends",()=>loadEmails());
const songTxt=sg=>sg&&sg.t?("🎵 "+sg.t+(sg.a?" — "+sg.a:"")):"";
/* ---------- edit profil ---------- */
function profileSheet(){if(!S.me)return init().then(profileSheet);const m=S.members[S.me]||{},sg=m.song||{};let newPhoto=null,dropPhoto=false;
  const chars=isPartner(S.me)?["vcap","vkantor","vorange","vsantai","vkrl","erusa","ebuku","erenang","ekaget","vnel"]:[];
  const bg=modal("✏️ "+L("Edit profil","Edit profile"),`<div class="pf-top"><span class="pf-av" id="pfAv">${avatar(S.me,96)}</span><div class="pf-btns"><label class="sm pri" style="cursor:pointer">📷 ${L("Ganti foto","Change photo")}<input type="file" id="pfF" accept="image/*" hidden></label>${m.photo?`<button class="sm" id="pfDel">${L("Hapus foto","Remove photo")}</button>`:""}</div></div>
    ${chars.length?`<label>${L("Atau pakai karakter","Or use a character")}</label><div class="pf-ch">${chars.map(c=>`<button data-ch="${c}" class="${m.avatar===c&&!m.photo?"on":""}">${pipiM("happy",48,c)}</button>`).join("")}</div>`:""}
    <label>${L("Nama","Name")}</label><input id="pfN" maxlength="40">
    <label style="margin-top:8px">Bio</label><textarea id="pfB" rows="2" maxlength="160" placeholder="${L("Tulis sesuatu tentang kamu…","Say something about you…")}"></textarea>
    <label style="margin-top:8px">🎵 ${L("Lagi dengerin","Listening to")}</label><div class="tl-row" style="gap:6px"><input id="pfS" maxlength="80" placeholder="${L("Judul lagu","Song title")}" style="flex:1"><input id="pfA" maxlength="60" placeholder="${L("Penyanyi","Artist")}" style="flex:1"></div>
    <input id="pfL" maxlength="300" placeholder="${L("Link Spotify / YouTube (opsional)","Spotify / YouTube link (optional)")}" style="margin-top:6px">
    <div class="msg err hide" id="pfM" style="margin-top:8px"></div>`,
    async g=>{const btn=g.querySelector(".ok"),mm=g.querySelector("#pfM");const fail=t=>{mm.textContent=t;mm.classList.remove("hide");btn.disabled=false;btn.textContent=L("Simpan","Save");return false};
      const name_=g.querySelector("#pfN").value.trim();if(!name_)return fail(L("Nama wajib diisi.","Name is required."));
      const lk=g.querySelector("#pfL").value.trim();if(lk&&!/^https:\/\/(open\.spotify\.com|spotify\.link|(www\.|music\.)?youtube\.com|youtu\.be)\//i.test(lk))return fail(L("Link harus dari Spotify atau YouTube.","The link must be from Spotify or YouTube."));
      const t=g.querySelector("#pfS").value.trim(),a=g.querySelector("#pfA").value.trim();
      const up={name:name_,bio:g.querySelector("#pfB").value.trim()||null,song:t?{t,a:a||undefined,u:lk||undefined,at:new Date().toISOString()}:null};
      btn.disabled=true;btn.textContent=L("Menyimpan…","Saving…");
      try{if(newPhoto){const c=await resizeSq(newPhoto,512),path=S.me+"/avatar_"+Date.now().toString(36)+".jpg";const {error}=await sb.storage.from("couple").upload(path,c,{contentType:"image/jpeg"});if(error)throw error;
          if(m.photo)sb.storage.from("couple").remove([m.photo]).catch(()=>{});up.photo=path}
        else if(dropPhoto){if(m.photo)sb.storage.from("couple").remove([m.photo]).catch(()=>{});up.photo=null}
        if(g.dataset.ch)up.avatar=g.dataset.ch;
        const {error}=await sb.from("couple_members").update(up).eq("user_id",S.me);if(error)throw error;Object.assign(S.members[S.me],up);
        status(L("Profil disimpan ✓","Profile saved ✓"),"ok");document.dispatchEvent(new CustomEvent("ravi-profile"));if(typeof render==="function")render()}
      catch(e){return fail(e.message||String(e))}},L("Simpan","Save"));
  bg.querySelector("#pfN").value=m.name||"";bg.querySelector("#pfB").value=m.bio||"";bg.querySelector("#pfS").value=sg.t||"";bg.querySelector("#pfA").value=sg.a||"";bg.querySelector("#pfL").value=sg.u||"";
  const box=bg.querySelector("#pfAv");
  bg.querySelector("#pfF").onchange=e=>{const f=e.target.files[0];if(!f)return;newPhoto=f;dropPhoto=false;box.innerHTML=`<span class="rv-av" style="width:96px;height:96px"><img alt="" style="width:100%;height:100%;object-fit:cover"></span>`;box.querySelector("img").src=URL.createObjectURL(f)};
  const d=bg.querySelector("#pfDel");if(d)d.onclick=()=>{dropPhoto=true;newPhoto=null;const n=m.name||"?";box.innerHTML=`<span class="rv-av txt" style="width:96px;height:96px;font-size:40px;background:var(--acc)">${esc(n.charAt(0).toUpperCase())}</span>`};
  bg.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{bg.dataset.ch=b.dataset.ch;dropPhoto=true;newPhoto=null;bg.querySelectorAll("[data-ch]").forEach(x=>x.classList.toggle("on",x===b));box.innerHTML=`<span class="rv-av" style="width:96px;height:96px">${pipiM("happy",100,b.dataset.ch)}</span>`});
}
async function resizeSq(file,max){const img=await loadImg(file),side=Math.min(img.naturalWidth,img.naturalHeight),c=document.createElement("canvas");c.width=c.height=Math.min(max,side);
  c.getContext("2d").drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(r,"image/jpeg",.85))}
const pfCss=document.createElement("style");pfCss.textContent=`.pf-top{display:flex;gap:14px;align-items:center;margin-bottom:12px}.pf-btns{display:flex;flex-direction:column;gap:6px}
.pf-ch{display:flex;gap:6px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none}.pf-ch button{all:unset;cursor:pointer;border-radius:14px;padding:2px;border:2px solid transparent;flex:none}.pf-ch button.on{border-color:var(--acc);background:var(--accS)}
.rv-av.ph{background:var(--th)}.rv-av.ph img,.pf-av .rv-av img{position:absolute;inset:0;display:block;width:100%!important;height:100%!important;object-fit:cover;margin:0;max-width:none;border-radius:0}`;document.head.appendChild(pfCss);
window.RAVI_PROFILE=profileSheet;
/* anggota non-pasangan: tanpa tema lucu & karakter Rafi/Vina, tanpa achievement & album stiker */
const gateCss=document.createElement("style");gateCss.textContent=`html.np #themeBtn,html.np #questBtn,html.np aside a[data-r="quest"],html.np aside a[data-r="album"],html.np #menuSheet [data-go="quest"],html.np #menuSheet [data-go="album"],html.np .pipi-card .pipi,html.np .qt-card .pipi{display:none!important}`;document.head.appendChild(gateCss);
function applyGate(){const np=meNP(),h=document.documentElement,was=h.classList.contains("np");h.classList.toggle("np",np);
  if(np){h.classList.remove("fun");try{localStorage.setItem("bbp_theme","pro")}catch(e){}if(!was&&typeof render==="function")render()}}
if(typeof go==="function"){const _g=go;go=function(r){if((r==="quest"||r==="album")&&meNP()){status(L("Misi, achievement & album stiker khusus pasangan pemilik RaVi.","Missions, achievements & the sticker album are for the RaVi couple only."),"warn");r="dash"}return _g.call(this,r)}}
window.RS={songEmbed,songOK,S,init,loadMembers,loadEmails,songTxt,profileSheet,name,isPartner,partners,isFriend,friendState,friends,loadFriends,friendAct,hhmm,ago,avatar,groupAvatar,pipiM,charOf,
  KATA,STABS,get EMOTES(){return EMOTES_()},UNI,coupleChar,meNP,isStk,stkKey,stkSVG,fillCaps,rxHTML,pt,isEnc,sealFor,parse,pack,PK,ikOf,
  urlsFor,upPhoto,uploadFile,fileURL,isPhoto,fIcon,fmtSize,MAXF,fillImgs,dl,activity,unActivity,setupCard,withInit,L};
})();
