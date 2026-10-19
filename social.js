/* =====================================================================
   BERDUA: 💬 Chat (ala WhatsApp) + 📷 Feed (ala Instagram) untuk Rafi & Vina
   Tabel bersama: couple_members, couple_msgs, couple_posts, couple_comments
   Foto: bucket privat "couple". Setup sekali: supabase/couple-social.sql
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const ok=()=>typeof sb!=="undefined"&&sb;
const S={me:null,members:{},ready:null,setupErr:"",msgs:[],posts:[],comments:{},sub:false,draft:"",sending:false,lastSeen:0};
const cap1=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const name=u=>cap1(S.members[u])||(u===S.me?L("Kamu","You"):L("Dia","Them"));
const hhmm=t=>new Date(t).toLocaleTimeString(EN()?"en-GB":"id-ID",{hour:"2-digit",minute:"2-digit"});
const dayLbl=t=>{const d=new Date(t),n=new Date(),y=new Date();y.setDate(n.getDate()-1);
  if(d.toDateString()===n.toDateString())return L("Hari ini","Today");if(d.toDateString()===y.toDateString())return L("Kemarin","Yesterday");
  return d.toLocaleDateString(EN()?"en-GB":"id-ID",{weekday:"long",day:"numeric",month:"long"})};
const ago=t=>{const s=(Date.now()-new Date(t))/1000;if(s<60)return L("baru saja","just now");if(s<3600)return Math.floor(s/60)+L(" mnt"," min");if(s<86400)return Math.floor(s/3600)+L(" jam"," h");return Math.floor(s/86400)+L(" hr"," d")};

/* ---------- koneksi & setup ---------- */
async function init(){
  if(S.ready)return S.ready;
  S.ready=(async()=>{
    if(!ok())throw new Error("offline");
    const {data:ses}=await sb.auth.getSession();S.me=ses?.session?.user?.id||null;if(!S.me)throw new Error("login");
    const {data:mem,error}=await sb.from("couple_members").select("user_id,name");
    if(error)throw error;
    if(!mem||!mem.some(m=>m.user_id===S.me))throw new Error("notmember");
    mem.forEach(m=>S.members[m.user_id]=m.name||"");
    const who=(window.TOOLS||{}).me,want=who==="vina"?"Vina":who==="rafi"?"Rafi":null;
    if(want&&S.members[S.me]!==want){S.members[S.me]=want;sb.from("couple_members").update({name:want}).eq("user_id",S.me).then(()=>{},()=>{})}
    await Promise.all([loadMsgs(),loadPosts()]);subscribe();return true})();
  S.ready.catch(e=>{S.setupErr=String(e&&(e.message||e.code)||e);S.ready=null});
  return S.ready}
async function loadMsgs(){const {data,error}=await sb.from("couple_msgs").select("*").order("id",{ascending:false}).limit(300);if(error)throw error;S.msgs=(data||[]).reverse()}
async function loadPosts(){const {data,error}=await sb.from("couple_posts").select("*").order("id",{ascending:false}).limit(60);if(error)throw error;S.posts=data||[];
  if(S.posts.length){const {data:c}=await sb.from("couple_comments").select("*").in("post_id",S.posts.map(p=>p.id)).order("id",{ascending:true});S.comments={};(c||[]).forEach(x=>(S.comments[x.post_id]=S.comments[x.post_id]||[]).push(x))}}
function subscribe(){if(S.sub)return;S.sub=true;
  sb.channel("couple-live")
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_msgs"},p=>{
     if(p.eventType==="INSERT"){if(!S.msgs.some(m=>m.id===p.new.id))S.msgs.push(p.new);if(p.new.sender!==S.me)notifyMsg(p.new)}
     else if(p.eventType==="UPDATE"){const i=S.msgs.findIndex(m=>m.id===p.new.id);if(i>=0)S.msgs[i]=p.new}
     else if(p.eventType==="DELETE"){S.msgs=S.msgs.filter(m=>m.id!==p.old.id)}
     refresh("chat")})
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_posts"},p=>{
     if(p.eventType==="INSERT"){if(!S.posts.some(x=>x.id===p.new.id))S.posts.unshift(p.new);if(p.new.author!==S.me&&window.doPeek&&route!=="feed")window.doPeek(true,{t:"📷 "+name(p.new.author)+L(" posting foto baru"," posted a new photo"),d:isEnc(p.new.caption)?"":(p.new.caption||""),r:"feed",m:"party",w:7})}
     else if(p.eventType==="UPDATE"){const i=S.posts.findIndex(x=>x.id===p.new.id);if(i>=0)S.posts[i]=p.new}
     else if(p.eventType==="DELETE")S.posts=S.posts.filter(x=>x.id!==p.old.id);
     refresh("feed")})
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_comments"},p=>{
     if(p.eventType==="INSERT"){const a=S.comments[p.new.post_id]=S.comments[p.new.post_id]||[];if(!a.some(c=>c.id===p.new.id))a.push(p.new)}
     else if(p.eventType==="DELETE")for(const k in S.comments)S.comments[k]=S.comments[k].filter(c=>c.id!==p.old.id);
     refresh("feed")})
   .subscribe();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&S.me)Promise.all([loadMsgs(),loadPosts()]).then(()=>{refresh("chat");refresh("feed")}).catch(()=>{})})}
window.RAVI_SOCIAL_REFRESH=()=>{if(route==="chat"||route==="feed")refresh(route)};
function refresh(r){badge();if(route===r){const v=document.getElementById("view");if(!v)return;if(r==="chat")drawChat(v,true);else drawFeed(v)}}
const unread=()=>S.msgs.filter(m=>m.sender!==S.me&&!m.read_at).length;
function badge(){const a=document.querySelector('aside a[data-r="chat"]');if(a){let b=a.querySelector(".qbadge");const n=unread();if(n&&!b){b=document.createElement("span");b.className="qbadge";a.appendChild(b)}if(b){if(n)b.textContent=n;else b.remove()}}}
function notifyMsg(m){if(route==="chat"&&!document.hidden)return;const pb=pt(m.body);const txt=/^\[call:/.test(pb||"")?"📞 "+L("Panggilan","Call"):isStk(pb)?"🧸 "+L("Stiker","Sticker"):isEnc(m.body)&&(pb==="…"||/^🔒/.test(pb))?"💬 "+L("Pesan baru","New message"):(pb||(m.img?"📷 "+L("Foto","Photo"):""));
  if(window.doPeek)window.doPeek(true,{t:"💬 "+name(m.sender),d:txt.slice(0,80),r:"chat",m:"happy",w:8});
  try{if(document.hidden&&window.Notification&&Notification.permission==="granted")new Notification(name(m.sender),{body:txt.slice(0,120),icon:"icon-192.png",tag:"chat"})}catch(e){}}


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
  if(a==="k"){const x=KATA[+b];if(!x)return "";return `<span class="stk-k">${window.pipi(x[1],size,x[0])}<span class="stk-cap"></span></span>`}
  return window.pipi(b,size,a)}
function fillCaps(root){root.querySelectorAll("[data-stk]").forEach(el=>{const k=el.dataset.stk;if(k.startsWith("k:")){const c=el.querySelector(".stk-cap");if(c)c.textContent=KATA[+k.slice(2)]?.[2]||""}})}
const rxHTML=v=>v.startsWith("stk:")?`<span class="rx-s">${stkSVG(v.slice(4),18)}</span>`:v;
let stkTab="kata",stkOpen=false;
/* ---------- enkripsi (e2ee.js) ---------- */
const E2=()=>window.RAVI_E2E;
const pt=b=>E2()?E2().show(b):b;                      // teks yang ditampilkan
async function seal(t){if(!t||!E2())return t;await E2().load();if(E2().enabled()&&!E2().unlocked()){E2().dialog();throw new Error(L("Chat terkunci. Masukkan kata sandi chat dulu.","Chat is locked. Enter the chat password first."))}return E2().encText(t)}
const isEnc=b=>typeof b==="string"&&b.startsWith("enc1:");
const pushText=(plain,fallback)=>E2()&&E2().enabled()?fallback:plain;   // jangan bocorkan isi lewat notifikasi
/* ---------- foto ---------- */
const urls={};
async function urlsFor(paths){paths=paths.filter(Boolean);const need=paths.filter(p=>!urls[p]||urls[p].exp<Date.now());
  if(need.length){const {data}=await sb.storage.from("couple").createSignedUrls(need,3600);(data||[]).forEach(d=>{if(d.signedUrl)urls[d.path]={u:d.signedUrl,exp:Date.now()+50*60e3}})}
  return p=>urls[p]?.u||""}
function loadImg(f){return new Promise((y,n)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{y(i);setTimeout(()=>URL.revokeObjectURL(u),1000)};i.onerror=()=>n(new Error(L("Format foto tidak didukung.","Unsupported photo format.")));i.src=u})}
async function upPhoto(file,max){const img=await loadImg(file),s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement("canvas");
  c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  let blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.82)),ext=".jpg";
  if(E2()){await E2().load();if(E2().enabled()){if(!E2().unlocked()){E2().dialog();throw new Error(L("Chat terkunci. Masukkan kata sandi chat dulu.","Chat is locked. Enter the chat password first."))}const r=await E2().encBlob(blob);blob=r.blob;ext=r.ext}}
  const path=S.me+"/"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+ext;
  const {error}=await sb.storage.from("couple").upload(path,blob,{contentType:"image/jpeg"});if(error)throw error;return path}

const css=document.createElement("style");css.textContent=`
.ch-wrap{display:flex;flex-direction:column;height:calc(100dvh - var(--hdrH,96px) - 120px);min-height:360px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--card)}
.ch-head{display:flex;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line);background:linear-gradient(90deg,var(--accS),var(--card))}
.ch-head b{display:block}.ch-head .crumb{font-size:12px}
.ch-list{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:4px;background:var(--bg);overscroll-behavior:contain}
.ch-day{align-self:center;font-size:11.5px;font-weight:700;color:var(--mute);background:var(--card);border-radius:99px;padding:3px 10px;margin:8px 0;border:1px solid var(--line)}
.ch-b{max-width:78%;padding:7px 10px 5px;border-radius:16px;position:relative;line-height:1.45;font-size:14.5px;overflow-wrap:anywhere;white-space:pre-wrap;user-select:text}
.ch-b.me{align-self:flex-end;background:var(--acc);color:#fff;border-bottom-right-radius:5px}
.ch-b.them{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:5px}
.ch-b .t{display:block;text-align:right;font-size:10.5px;opacity:.75;margin-top:2px;white-space:nowrap}
.ch-b img{display:block;max-width:100%;width:240px;border-radius:12px;margin:-2px -4px 4px;cursor:zoom-in;background:var(--th);min-height:80px}
.ch-b .rx{position:absolute;bottom:-10px;font-size:13px;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:0 5px;line-height:18px}
.ch-b.me .rx{left:-6px}.ch-b.them .rx{right:-6px}.ch-b.hasrx{margin-bottom:10px}
.ch-in{display:flex;gap:6px;align-items:flex-end;padding:8px;border-top:1px solid var(--line);background:var(--card)}
.ch-in textarea{flex:1;min-width:0;resize:none;min-height:40px!important;height:40px;max-height:120px;border-radius:20px;padding:9px 14px;line-height:1.35;font:inherit}
.ch-ic{all:unset;cursor:pointer;flex:none;width:40px;height:40px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:18px;background:var(--th)}
.ch-ic.send{background:var(--acc);color:#fff}.ch-ic:focus-visible{outline:3px solid var(--acc)}.ch-ic[disabled]{opacity:.5}
.ch-quick{display:flex;gap:4px;padding:0 8px 6px;background:var(--card);overflow-x:auto}.ch-quick button{all:unset;cursor:pointer;font-size:20px;padding:2px 4px}
.ch-b.stk{background:none!important;border:0!important;padding:0;max-width:none}.ch-b.stk .t{color:var(--mute);opacity:1;background:var(--card);border-radius:99px;padding:0 6px;display:inline-block;float:right}
.stk-w{display:block}.stk-w .pipi{display:block;animation:none!important}
.stk-k{display:inline-flex;flex-direction:column;align-items:center;gap:0}.stk-cap{font-weight:900;font-size:13px;line-height:1.1;color:#fff;background:var(--acc);border:2px solid #fff;border-radius:10px;padding:3px 8px;margin-top:-12px;box-shadow:0 2px 6px rgba(0,0,0,.15);white-space:nowrap;position:relative}
.stk-grid .stk-cap{font-size:9px;padding:1px 5px;margin-top:-8px;border-width:1.5px}
.ch-quick button{display:flex;align-items:center}.ch-quick .pipi{animation:none!important}
.ch-ic.on{background:var(--accS);outline:2px solid var(--acc)}
.stk-panel{border-top:1px solid var(--line);background:var(--card)}
.stk-tabs{display:flex;gap:4px;overflow-x:auto;padding:6px 8px 0}.stk-tabs button{all:unset;cursor:pointer;white-space:nowrap;font-size:12.5px;font-weight:800;padding:6px 10px;border-radius:99px;color:var(--mute)}.stk-tabs button.on{background:var(--accS);color:var(--acc)}
.stk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:4px;padding:8px;max-height:210px;overflow-y:auto}
.stk-grid button{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:12px;padding:2px;min-height:72px}.stk-grid button:hover,.stk-grid button:focus-visible{background:var(--th)}
.stk-grid .pipi{animation:none!important}.stk-grid.uni{grid-template-columns:repeat(auto-fill,minmax(44px,1fr))}.stk-grid.uni button{font-size:26px;min-height:44px}
.rx-s{display:inline-flex;vertical-align:middle}.rx-s .pipi{animation:none!important}
.ch-empty{margin:auto;text-align:center;color:var(--mute);font-size:13.5px;max-width:28ch}
.fd-post{border:1px solid var(--line);border-radius:18px;background:var(--card);overflow:hidden;margin-bottom:14px}
.fd-top{display:flex;gap:10px;align-items:center;padding:10px 12px}.fd-top b{display:block;font-size:14px}.fd-top .crumb{font-size:12px}
.fd-av{width:36px;height:36px;border-radius:99px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--accS);overflow:hidden}
.fd-img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:var(--th);cursor:pointer}
.fd-act{display:flex;gap:4px;align-items:center;padding:6px 8px 0}.fd-act button{all:unset;cursor:pointer;font-size:24px;padding:4px 6px;line-height:1}
.fd-act button:focus-visible{outline:3px solid var(--acc);border-radius:8px}
.fd-likes{font-weight:800;font-size:13.5px;padding:2px 14px}.fd-cap{padding:2px 14px 6px;font-size:14px;line-height:1.45;overflow-wrap:anywhere}
.fd-cm{padding:0 14px;font-size:13.5px;line-height:1.5;overflow-wrap:anywhere}.fd-cm b{margin-right:4px}
.fd-add{display:flex;gap:6px;padding:8px 10px 12px}.fd-add input{flex:1;min-width:0;border-radius:99px}
.fd-heart{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:90px;pointer-events:none;animation:fdh .8s ease-out forwards}
@keyframes fdh{0%{transform:scale(.3);opacity:0}30%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:0}}
.fd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:12px}.fd-grid button{all:unset;cursor:pointer;aspect-ratio:1;background:var(--th);overflow:hidden}.fd-grid img{width:100%;height:100%;object-fit:cover;display:block}
@media (prefers-reduced-motion:reduce){.fd-heart{animation:none;opacity:0}}
`;document.head.appendChild(css);

/* ---------- layar setup ---------- */
function setupCard(v,title){
  const notMember=S.setupErr==="notmember";
  v.innerHTML=page(L("Berdua","Together"),title)+`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0 0 12px">${window.pipi?window.pipi("think",64,"vnel"):""}<div class="bubble"><b>${notMember?L("Akun ini belum terdaftar sebagai pasangan","This account isn't registered as a couple member"):L("Satu langkah lagi: aktifkan Chat & Feed berdua","One more step: turn on Chat & Feed")}</b>
   <div>${notMember?L("Jalankan ulang skrip couple-social.sql di Supabase setelah akun ini dibuat.","Re-run couple-social.sql in Supabase after this account was created."):L("Data akunmu dan akun Vina terkunci terpisah. Chat butuh tabel bersama yang hanya bisa dibuka kalian berdua.","Your data and Vina's are locked separately. Chat needs a shared table only you two can open.")}</div></div></div>
   <ol style="margin:0;padding-left:1.2em;line-height:1.7"><li>${L("Buka","Open")} <b>supabase.com</b> → project → <b>SQL Editor</b> → <b>New query</b>.</li><li>${L("Salin isi file","Copy the file")} <code>supabase/couple-social.sql</code> ${L("dari repo GitHub, tempel, lalu","from the GitHub repo, paste, then")} <b>Run</b>.</li><li>${L("Kembali ke sini dan ketuk Coba lagi.","Come back here and tap Try again.")}</li></ol>
   <div class="tl-row" style="margin-top:12px"><button class="pri" id="soRetry">↻ ${L("Coba lagi","Try again")}</button><a class="sm" href="https://github.com/lieonhs/my_litte_honey_vina_hun/blob/main/supabase/couple-social.sql" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--line);border-radius:10px;color:var(--ink);text-decoration:none">📄 ${L("Buka file SQL","Open SQL file")}</a></div>
   <p class="crumb" style="margin:10px 0 0">${L("Detail teknis: ","Technical detail: ")}${esc(S.setupErr)}</p></div></div>`;
  $("soRetry").onclick=()=>{S.ready=null;S.setupErr="";render()}}
function withInit(v,title,draw){
  if(S.me&&!S.setupErr&&S.ready){draw(v);return}
  v.innerHTML=page(L("Berdua","Together"),title)+`<div class="region"><div class="rb crumb">${L("Menyambungkan…","Connecting…")}</div></div>`;
  init().then(()=>{if(document.getElementById("view")===v||v.isConnected)draw(v)}).catch(()=>{if(v.isConnected)setupCard(v,title)})}

/* =====================================================================
   CHAT
   ===================================================================== */
let lastCount=-1;
function drawChat(v,live){
  const other=Object.keys(S.members).find(u=>u!==S.me),oName=other?name(other):L("Pasangan","Partner");
  const list=v.querySelector(".ch-list"),atBottom=list?list.scrollHeight-list.scrollTop-list.clientHeight<80:true,prevTop=list?list.scrollTop:0;
  const ta=v.querySelector("#chTxt");if(ta)S.draft=ta.value;const hadFocus=ta&&document.activeElement===ta;
  let html="",lastDay="";
  for(const m of S.msgs){const dl=dayLbl(m.created_at);if(dl!==lastDay){html+=`<div class="ch-day">${dl}</div>`;lastDay=dl}
    const mine=m.sender===S.me,rx=Object.values(m.reacts||{});
    const shown=pt(m.body),stk=isStk(shown);
    html+=`<div class="ch-b ${mine?"me":"them"}${stk?" stk":""}${rx.length?" hasrx":""}" data-m="${m.id}">${m.img?`<img data-img="${esc(m.img)}" alt="${L("Foto","Photo")}">`:""}${stk?`<span class="stk-w" data-stk="${stkKey(shown)}">${stkSVG(stkKey(shown),124)}</span>`:`<span class="bd"></span>`}<span class="t">${hhmm(m.created_at)}${mine?" "+(m.read_at?"✓✓":"✓"):""}</span>${rx.length?`<span class="rx">${[...new Set(rx)].map(rxHTML).join("")}</span>`:""}</div>`}
  v.innerHTML=page(L("Berdua","Together"),"💬 Chat")+
   `<div class="ch-wrap"><div class="ch-head">${window.pipi?window.pipi("happy",40,other&&/^vina/i.test(S.members[other]||"")?"vcap":other&&/^(rafi|el)/i.test(S.members[other]||"")?"erusa":"vnel"):""}<div><b></b><span class="crumb">${L("Ketuk 2× untuk ❤️ · tahan pesannya untuk reaksi · tahan pesanmu untuk hapus","Double-tap to ❤️ · long-press theirs to react · long-press yours to delete")}</span></div></div>
    <div class="ch-list" role="log" aria-live="polite">${html||`<div class="ch-empty">${L("Belum ada pesan. Sapa duluan! 👋","No messages yet. Say hi first! 👋")}</div>`}</div>
    <div class="ch-in"><label class="ch-ic" for="chFile" aria-label="${L("Kirim foto","Send photo")}" title="${L("Kirim foto","Send photo")}">📷</label><input type="file" id="chFile" accept="image/*" hidden><button class="ch-ic${stkOpen?" on":""}" id="chStk" aria-label="${L("Stiker","Stickers")}" aria-expanded="${stkOpen}" title="${L("Stiker","Stickers")}">🧸</button>
     <textarea id="chTxt" rows="1" placeholder="${L("Tulis pesan…","Type a message…")}" aria-label="${L("Pesan","Message")}"></textarea><button class="ch-ic send" id="chSend" aria-label="${L("Kirim","Send")}"${S.sending?" disabled":""}>➤</button></div>
    ${stkOpen?`<div class="stk-panel"><div class="stk-tabs" role="tablist">${STABS().map(([k,n])=>`<button role="tab" aria-selected="${k===stkTab}" class="${k===stkTab?"on":""}" data-st="${k}">${n}</button>`).join("")}</div>
      <div class="stk-grid${stkTab==="emoji"?" uni":""}">${stkTab==="emoji"?UNI.map(e=>`<button data-q="${e}" aria-label="${e}">${e}</button>`).join(""):STABS().find(x=>x[0]===stkTab)[2].map(k=>`<button data-send="${k}" data-stk="${k}" aria-label="${L("Kirim stiker","Send sticker")}">${stkSVG(k,64)}</button>`).join("")}</div></div>`
     :`<div class="ch-quick">${EMOTES.map(k=>`<button data-send="${k}" aria-label="${L("Kirim emote","Send emote")}">${stkSVG(k,34)}</button>`).join("")}</div>`}</div>`;
  v.querySelector(".ch-head b").textContent=oName;
  v.querySelectorAll(".ch-b").forEach(b=>{const m=S.msgs.find(x=>x.id==b.dataset.m),bd=b.querySelector(".bd");if(bd)bd.textContent=pt(m.body)||""});fillCaps(v);
  const nl=v.querySelector(".ch-list");
  const grow=()=>{const t=$("chTxt");t.style.height="auto";t.style.height=Math.min(120,t.scrollHeight)+"px"};
  const t=$("chTxt");t.value=S.draft;grow();if(hadFocus||(!live&&matchMedia("(min-width:861px)").matches))t.focus();
  if(atBottom||!live||S.msgs.length!==lastCount&&S.msgs[S.msgs.length-1]?.sender===S.me)nl.scrollTop=nl.scrollHeight;else nl.scrollTop=prevTop;lastCount=S.msgs.length;
  urlsFor(S.msgs.map(m=>m.img)).then(u=>v.querySelectorAll("[data-img]").forEach(i=>{const s=E2()?E2().imgSrc(i.dataset.img,u(i.dataset.img)):u(i.dataset.img);if(s)i.src=s;i.onload=()=>{if(atBottom||!live)nl.scrollTop=nl.scrollHeight}}));
  t.oninput=()=>{S.draft=t.value;grow()};
  t.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey&&matchMedia("(hover:hover)").matches){e.preventDefault();send()}};
  $("chSend").onclick=send;
  v.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{t.value+=b.dataset.q;S.draft=t.value;t.focus()});
  $("chStk").onclick=()=>{stkOpen=!stkOpen;drawChat(v,true)};
  v.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{stkTab=b.dataset.st;drawChat(v,true)});
  v.querySelectorAll("[data-send]").forEach(b=>b.onclick=()=>sendBody("[stk:"+b.dataset.send+"]"));
  $("chFile").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;S.sending=true;status(L("Mengirim foto…","Sending photo…"),"");
    try{const p=await upPhoto(f,1280);const {error}=await sb.from("couple_msgs").insert({body:S.draft.trim()?await seal(S.draft.trim()):null,img:p});if(error)throw error;S.draft="";status("");if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("msg",{body:"📷 "+L("Foto","Photo")})}catch(err){status(L("Gagal kirim foto: ","Couldn't send photo: ")+(err.message||err),"err")}
    S.sending=false;await loadMsgs().catch(()=>{});drawChat(v,false)};
  v.querySelectorAll(".ch-b").forEach(b=>{const id=+b.dataset.m,m=S.msgs.find(x=>x.id===id);let last=0,hold=0;
    b.addEventListener("click",async e=>{if(e.target.matches("img")){const bg=modal(L("Foto","Photo"),`<img alt="" style="width:100%;border-radius:12px">`,()=>true,"OK");bg.querySelector("img").src=e.target.src;const c=bg.querySelector(".c");if(c)c.style.display="none";return}
      const now=Date.now();if(now-last<350){const r={...(m.reacts||{})};if(r[S.me])delete r[S.me];else r[S.me]="❤️";m.reacts=r;drawChat(v,true);await sb.from("couple_msgs").update({reacts:r}).eq("id",id)}last=now});
    if(m.sender!==S.me){const start=()=>{hold=setTimeout(()=>reactPick(m,v),500)},stop=()=>clearTimeout(hold);
      b.addEventListener("touchstart",start,{passive:true});b.addEventListener("touchend",stop);b.addEventListener("touchmove",stop);
      b.addEventListener("contextmenu",e=>{e.preventDefault();reactPick(m,v)})}
    if(m.sender===S.me){const start=()=>{hold=setTimeout(()=>delMsg(m,v),550)},stop=()=>clearTimeout(hold);
      b.addEventListener("touchstart",start,{passive:true});b.addEventListener("touchend",stop);b.addEventListener("touchmove",stop);
      b.addEventListener("contextmenu",e=>{e.preventDefault();delMsg(m,v)})}});
  markRead();badge();
  async function send(){const body=t.value.trim();if(!body||S.sending)return;t.value="";S.draft="";grow();return sendBody(body,true)}
  async function sendBody(body,fromText){if(S.sending)return;S.sending=true;
    const tmp={id:-Date.now(),sender:S.me,body,created_at:new Date().toISOString(),reacts:{}};S.msgs.push(tmp);drawChat(v,false);
    let sealed;try{sealed=await seal(body)}catch(e){S.sending=false;S.msgs=S.msgs.filter(x=>x.id!==tmp.id);if(fromText)S.draft=body;status(e.message,"warn");drawChat(v,false);return}
    const {data,error}=await sb.from("couple_msgs").insert({body:sealed}).select().single();S.sending=false;
    S.msgs=S.msgs.filter(x=>x.id!==tmp.id);if(error){if(fromText)S.draft=body;status(L("Pesan gagal terkirim: ","Message not sent: ")+error.message,"err")}else{if(data&&!S.msgs.some(x=>x.id===data.id))S.msgs.push(data);if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("msg",{body:pushText(isStk(body)?"🧸 "+L("Stiker","Sticker"):body,"💬 "+L("Pesan baru (terenkripsi)","New message (encrypted)"))})}
    drawChat(v,false)}}
function reactPick(m,v){const opts=["❤️","stk:vnel:party","stk:vcap:happy","stk:erusa:party","stk:vorange:worried","stk:ekaget:worried","stk:pipi:party","😂"];
  const bg=modal(L("Beri reaksi","React"),`<div class="stk-grid">${opts.map((o,i)=>`<button data-rp="${i}" aria-label="${L("Reaksi","Reaction")}">${o.startsWith("stk:")?stkSVG(o.slice(4),48):`<span style="font-size:34px">${o}</span>`}</button>`).join("")}</div>${(m.reacts||{})[S.me]?`<button class="sm" id="rpX" style="margin-top:10px">${L("Hapus reaksiku","Remove my reaction")}</button>`:""}`,()=>true,"OK");
  const c=bg.querySelector(".c");if(c)c.style.display="none";
  const set=async val=>{const r={...(m.reacts||{})};if(val)r[S.me]=val;else delete r[S.me];m.reacts=r;bg.remove();drawChat(v,true);await sb.from("couple_msgs").update({reacts:r}).eq("id",m.id)};
  bg.querySelectorAll("[data-rp]").forEach(b=>b.onclick=()=>set(opts[+b.dataset.rp]));const x=bg.querySelector("#rpX");if(x)x.onclick=()=>set(null)}
function delMsg(m,v){const bg=modal(L("Hapus pesan?","Delete message?"),`<div class="crumb">${L("Pesan akan hilang untuk kalian berdua.","The message disappears for both of you.")}</div>`,async()=>{
  const {error}=await sb.from("couple_msgs").delete().eq("id",m.id);if(error){alert(error.message);return false}S.msgs=S.msgs.filter(x=>x.id!==m.id);if(m.img)sb.storage.from("couple").remove([m.img]).catch(()=>{});drawChat(v,true)},L("Hapus","Delete"))}
let readBusy=false;
async function markRead(){if(readBusy||document.hidden||route!=="chat")return;const ids=S.msgs.filter(m=>m.sender!==S.me&&!m.read_at&&m.id>0).map(m=>m.id);if(!ids.length)return;readBusy=true;
  const ts=new Date().toISOString();S.msgs.forEach(m=>{if(ids.includes(m.id))m.read_at=ts});
  try{await sb.from("couple_msgs").update({read_at:ts}).in("id",ids)}catch(e){}readBusy=false;badge()}

/* =====================================================================
   FEED
   ===================================================================== */
let fdMode="list";
function drawFeed(v){
  const posts=S.posts;
  v.innerHTML=page(L("Berdua","Together"),"📷 Feed",`<button class="pri" id="fdNew">＋ ${L("Posting","Post")}</button><input type="file" id="fdFile" accept="image/*" hidden>`)+
   (posts.length?`<div class="tl-tabs"><button class="sm${fdMode==="list"?" pri":""}" data-fm="list">▤ ${L("Linimasa","Timeline")}</button><button class="sm${fdMode==="grid"?" pri":""}" data-fm="grid">▦ Grid</button><span class="crumb" style="align-self:center">${posts.length} ${L("postingan","posts")} · ❤️ ${posts.reduce((s,p)=>s+(p.likes||[]).length,0)}</span></div>`:"")+
   (fdMode==="grid"&&posts.length?`<div class="fd-grid">${posts.map(p=>`<button data-go="${p.id}" aria-label="${L("Buka postingan","Open post")}"><img data-img="${esc(p.img)}" alt=""></button>`).join("")}</div>`
   :posts.length?posts.map(p=>{const liked=(p.likes||[]).includes(S.me),cm=S.comments[p.id]||[],who=name(p.author);
     return `<article class="fd-post" id="post${p.id}" data-p="${p.id}"><div class="fd-top"><span class="fd-av">${window.pipi?window.pipi("happy",34,/^vina/i.test(who)?"vcap":/^(rafi|el)$/i.test(who)?"erusa":"vnel"):""}</span><div style="flex:1;min-width:0"><b class="au"></b><span class="crumb">${ago(p.created_at)}</span></div>${p.author===S.me?`<button class="sm" data-pdel="${p.id}" aria-label="${L("Hapus postingan","Delete post")}">⋯</button>`:""}</div>
      <div style="position:relative"><img class="fd-img" data-img="${esc(p.img)}" data-dbl="${p.id}" alt=""></div>
      <div class="fd-act"><button data-like="${p.id}" aria-pressed="${liked}" aria-label="${L("Suka","Like")}">${liked?"❤️":"🤍"}</button><button data-cfocus="${p.id}" aria-label="${L("Komentar","Comment")}">💬</button></div>
      <div class="fd-likes">${(p.likes||[]).length?(esc((p.likes||[]).map(name).join(" & "))+L(" menyukai ini"," liked this")):L("Belum ada yang suka","No likes yet")}</div>
      ${p.caption?`<div class="fd-cap"><b class="au"></b> <span class="cp"></span></div>`:""}
      ${cm.map(c=>`<div class="fd-cm" data-c="${c.id}"><b></b><span></span>${c.author===S.me?` <button class="lnk" data-cdel="${c.id}" style="font-size:11px">${L("hapus","delete")}</button>`:""}</div>`).join("")}
      <div class="fd-add"><input data-cin="${p.id}" placeholder="${L("Tambah komentar…","Add a comment…")}" maxlength="300"><button class="sm" data-csend="${p.id}">${L("Kirim","Send")}</button></div></article>`}).join("")
   :`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0">${window.pipi?window.pipi("party",64,"vnel"):""}<div class="bubble"><b>${L("Feed khusus kalian berdua","A feed just for you two")}</b><div>${L("Posting foto momen sehari-hari. Yang bisa lihat, like, dan komentar cuma kamu dan Vina.","Post everyday moments. Only you and Vina can see, like and comment.")}</div></div></div></div></div>`);
  v.querySelectorAll(".fd-post").forEach(el=>{const p=posts.find(x=>x.id==el.dataset.p);el.querySelectorAll(".au").forEach(a=>a.textContent=name(p.author));const cp=el.querySelector(".cp");if(cp)cp.textContent=pt(p.caption);
    (S.comments[p.id]||[]).forEach(c=>{const r=el.querySelector(`[data-c="${c.id}"]`);r.querySelector("b").textContent=name(c.author);r.querySelector("span").textContent=pt(c.body)})});
  urlsFor(posts.map(p=>p.img)).then(u=>v.querySelectorAll("[data-img]").forEach(i=>{const s=E2()?E2().imgSrc(i.dataset.img,u(i.dataset.img)):u(i.dataset.img);if(s)i.src=s}));
  v.querySelectorAll("[data-fm]").forEach(b=>b.onclick=()=>{fdMode=b.dataset.fm;drawFeed(v)});
  v.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{fdMode="list";drawFeed(v);document.getElementById("post"+b.dataset.go)?.scrollIntoView({block:"start"})});
  const like=async id=>{const p=S.posts.find(x=>x.id===id);const has=(p.likes||[]).includes(S.me);p.likes=has?p.likes.filter(x=>x!==S.me):[...(p.likes||[]),S.me];drawFeed(v);
    const {data}=await sb.from("couple_posts").select("likes").eq("id",id).single();const cur=new Set(data?.likes||[]);has?cur.delete(S.me):cur.add(S.me);await sb.from("couple_posts").update({likes:[...cur]}).eq("id",id)};
  v.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>like(+b.dataset.like));
  v.querySelectorAll("[data-dbl]").forEach(img=>{let last=0;img.addEventListener("click",()=>{const n=Date.now();if(n-last<350){const id=+img.dataset.dbl;const h=document.createElement("div");h.className="fd-heart";h.textContent="❤️";img.parentElement.appendChild(h);setTimeout(()=>h.remove(),900);if(!(S.posts.find(x=>x.id===id).likes||[]).includes(S.me))like(id)}last=n})});
  v.querySelectorAll("[data-cfocus]").forEach(b=>b.onclick=()=>v.querySelector(`[data-cin="${b.dataset.cfocus}"]`)?.focus());
  const sendC=async id=>{const inp=v.querySelector(`[data-cin="${id}"]`),body=inp.value.trim();if(!body)return;inp.value="";inp.blur();
    let sealed;try{sealed=await seal(body)}catch(e){inp.value=body;status(e.message,"warn");return}const {data,error}=await sb.from("couple_comments").insert({post_id:id,body:sealed}).select().single();if(error){status(error.message,"err");return}
    const a=S.comments[id]=S.comments[id]||[];if(!a.some(c=>c.id===data.id))a.push(data);drawFeed(v);if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("post",{body:pushText("💬 "+body,"💬 "+L("Komentar baru","New comment"))})};
  v.querySelectorAll("[data-csend]").forEach(b=>b.onclick=()=>sendC(+b.dataset.csend));
  v.querySelectorAll("[data-cin]").forEach(i=>i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();sendC(+i.dataset.cin)}});
  v.querySelectorAll("[data-cdel]").forEach(b=>b.onclick=async()=>{const id=+b.dataset.cdel;await sb.from("couple_comments").delete().eq("id",id);for(const k in S.comments)S.comments[k]=S.comments[k].filter(c=>c.id!==id);drawFeed(v)});
  v.querySelectorAll("[data-pdel]").forEach(b=>b.onclick=()=>{const p=S.posts.find(x=>x.id===+b.dataset.pdel);modal(L("Hapus postingan?","Delete post?"),`<div class="crumb">${L("Foto, like, dan komentarnya ikut terhapus.","The photo, likes and comments are deleted too.")}</div>`,async()=>{
    const {error}=await sb.from("couple_posts").delete().eq("id",p.id);if(error){alert(error.message);return false}sb.storage.from("couple").remove([p.img]).catch(()=>{});S.posts=S.posts.filter(x=>x.id!==p.id);drawFeed(v)},L("Hapus","Delete"))});
  $("fdNew").onclick=()=>$("fdFile").click();
  const fi=$("fdFile");fi.onchange=()=>{const f=fi.files[0];fi.value="";if(!f)return;const prev=URL.createObjectURL(f);
    const bg=modal(L("Postingan baru","New post"),`<img alt="" style="width:100%;max-height:50vh;object-fit:contain;border-radius:12px;background:var(--th)"><div style="height:10px"></div><label>${L("Keterangan","Caption")}</label><textarea id="fdCap" rows="3" maxlength="500" placeholder="${L("Tulis sesuatu…","Write something…")}"></textarea>`,
      async g=>{const btn=g.querySelector(".ok");btn.disabled=true;btn.textContent=L("Mengunggah…","Uploading…");
        try{const path=await upPhoto(f,1600);const capT=g.querySelector("#fdCap").value.trim();const {data,error}=await sb.from("couple_posts").insert({img:path,caption:capT?await seal(capT):null}).select().single();if(error)throw error;
          if(!S.posts.some(x=>x.id===data.id))S.posts.unshift(data);URL.revokeObjectURL(prev);if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("post",{body:pushText("📷 "+(capT||L("Postingan baru","New post")),"📷 "+L("Postingan baru","New post"))});fdMode="list";drawFeed($("view"))}
        catch(e){btn.disabled=false;btn.textContent=L("Posting","Post");alert(L("Gagal posting: ","Couldn't post: ")+(e.message||e));return false}},L("Posting","Post"));
    bg.querySelector("img").src=prev}}

/* =====================================================================
   PASANG
   ===================================================================== */
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{
  chat:v=>{try{withInit(v,"💬 Chat",x=>drawChat(x,false))}catch(e){v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}},
  feed:v=>{try{withInit(v,"📷 Feed",drawFeed)}catch(e){v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}}});
if(window.TOOL_ROUTES){window.TOOL_ROUTES.add("chat");window.TOOL_ROUTES.add("feed")}
NAV.splice(1,0,["Berdua",[["chat","💬 Chat"],["feed","📷 Feed"]]]);
/* jangan render ulang halaman chat/feed karena data keuangan berubah; datanya punya realtime sendiri */
if(typeof render==="function"){const _r=render;render=function(){if((route==="chat"||route==="feed")&&S.ready&&document.getElementById("view")?.querySelector(route==="chat"?".ch-wrap":".fd-post,.pipi-card")&&!render._nav){renderNav();badge();return}return _r.apply(this,arguments)}}
const _go=go;go=function(r){render._nav=true;try{return _go(r)}finally{render._nav=false}};
/* sambungkan di latar belakang setelah login supaya notifikasi pesan baru tetap masuk */
addEventListener("load",()=>{const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);init().then(()=>badge()).catch(()=>{})}},2000);setTimeout(()=>clearInterval(t),60000)});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&route==="chat")markRead()});
/* jangan ada popup pengingat yang menutupi kolom ketik saat chat/feed dibuka */
if(window.doPeek){const _pk=window.doPeek;window.doPeek=function(){if(route==="chat"||route==="feed")return;return _pk.apply(this,arguments)}}
const pkCss=document.createElement("style");pkCss.textContent="html.on-chat .peek{display:none!important}";document.head.appendChild(pkCss);
const markRoute=r=>document.documentElement.classList.toggle("on-chat",r==="chat"||r==="feed");
const _go2=go;go=function(r){markRoute(r);return _go2.apply(this,arguments)};
addEventListener("load",()=>markRoute(route));
})();
