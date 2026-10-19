/* =====================================================================
   🔔 PUSAT NOTIFIKASI (ala Instagram) + 📞 LOG PANGGILAN (ala WhatsApp)
   Sumber: tabel couple_activity (siapa, apa, kapan — tanpa isi pesan).
   Ikon lonceng + badge di header; halaman "notif".
   ===================================================================== */
(function(){
const R=window.RS;if(!R)return;
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const N={me:null,list:[],ready:null,sub:false,tab:"act"};
const unreadCount=()=>N.list.filter(a=>a.target===N.me&&!a.read_at&&a.kind!=="call"||a.target===N.me&&!a.read_at&&a.kind==="call"&&(a.meta||{}).r!=="done").length;
window.RAVI_NOTIF_COUNT=unreadCount;
async function init(){if(N.ready)return N.ready;N.ready=(async()=>{await R.init();N.me=R.S.me;await load();subscribe();return true})();N.ready.catch(()=>{N.ready=null});return N.ready}
async function load(){const {data,error}=await sb.from("couple_activity").select("*").order("id",{ascending:false}).limit(150);if(error)throw error;N.list=data||[];emit()}
function emit(){paintBell();document.dispatchEvent(new CustomEvent("ravi-notif"))}
function subscribe(){if(N.sub)return;N.sub=true;
  sb.channel("ravi-activity").on("postgres_changes",{event:"*",schema:"public",table:"couple_activity"},p=>{
    if(p.eventType==="INSERT"){if(!N.list.some(a=>a.id===p.new.id))N.list.unshift(p.new);if(p.new.target===N.me)toast(p.new)}
    else if(p.eventType==="UPDATE"){const i=N.list.findIndex(a=>a.id===p.new.id);if(i>=0)N.list[i]=p.new}
    else if(p.eventType==="DELETE")N.list=N.list.filter(a=>a.id!==p.old.id);
    emit();if(route==="notif")draw($("view"))}).subscribe();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&N.me)load().catch(()=>{})})}

/* ---------- teks tiap aktivitas ---------- */
function describe(a){const who=R.name(a.actor),m=a.meta||{};
  switch(a.kind){
    case "like":return [who,L(" menyukai postinganmu."," liked your post."),"❤️"];
    case "comment":{const c=findComment(a.ref),o=c?R.parse(R.pt(c.body)):null;const t=!o?"":R.isStk(o.t)?"🧸 "+L("stiker","sticker"):o.f?"📷 "+L("foto","photo")+(o.t?" · "+o.t:""):o.t;return [who,L(" mengomentari: "," commented: ")+(t?"“"+t.slice(0,80)+"”":""),"💬"]}
    case "post":return [who,L(" memposting foto baru."," posted a new photo."),"📷"];
    case "react":{const s=window.RAVI_CHAT&&findMsg(a.ref);return [who,L(" bereaksi "," reacted ")+(m.e||"❤️")+L(" ke pesanmu"," to your message")+(s?": “"+window.RAVI_CHAT.snip(s).slice(0,60)+"”":"."),m.e||"❤️"]}
    case "group":{const t=window.RAVI_CHAT?window.RAVI_CHAT.title(a.ref):"";return [who,L(" menambahkanmu ke grup "," added you to the group ")+(t?"“"+t+"”":"")+".","👥"]}
    case "friend":return [who,R.friendState&&R.friendState(a.actor)==="friend"?L(" sekarang berteman denganmu."," is now your friend."):L(" ingin berteman denganmu."," wants to be your friend."),"👋"];
    case "friend_ok":return [who,L(" menerima permintaan pertemananmu. Sekarang kalian bisa chat."," accepted your friend request. You can chat now."),"🤝"];
    case "join":return [m.n||who,L(" ingin bergabung ke RaVi — ketuk untuk menyetujui"," wants to join RaVi — tap to review"),"🛡️"];
    case "call":return [who,m.r==="done"?(m.v?L(" video call denganmu"," video-called you"):L(" meneleponmu"," called you"))+" · "+fmt(m.d||0):m.r==="declined"?L(" — panggilan ditolak"," — call declined"):L(" — panggilan tak terjawab"," — missed call"),m.v?"🎥":"📞"];
    default:return [who,"",  "🔔"]}}
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function findComment(id){for(const k in R.S.comments){const c=R.S.comments[k].find(x=>String(x.id)===String(id));if(c)return c}return null}
function findMsg(id){const st=window.RAVI_CHAT&&window.RAVI_CHAT.state;if(!st)return null;for(const [,s] of st.msgs){const m=s.list.find(x=>String(x.id)===String(id));if(m)return m}return null}
function postOf(a){const id=a.kind==="comment"?(a.meta||{}).p:a.ref;return R.S.posts.find(p=>String(p.id)===String(id))||null}

/* ---------- tampilan ---------- */
const css=document.createElement("style");css.textContent=`
.nf-tabs{display:flex;gap:6px;margin:0 0 10px}.nf-tabs button{all:unset;cursor:pointer;padding:8px 14px;border-radius:99px;background:var(--th);font-weight:800;font-size:13.5px;color:var(--mute);position:relative}
.nf-tabs button.on{background:var(--acc);color:#fff}.nf-tabs .b{margin-left:6px;background:#ff4d6d;color:#fff;border-radius:99px;padding:0 6px;font-size:11px}
.nf-sec{font-size:13px;font-weight:900;margin:14px 2px 6px}
.nf-it{display:flex;gap:12px;align-items:center;padding:10px;border-radius:14px;cursor:pointer;position:relative;transition:background .15s}
.nf-it:hover{background:var(--th)}.nf-it.new{background:var(--accS)}
.nf-it .avw{position:relative;flex:none;display:inline-flex}.nf-it .em{position:absolute;right:-4px;bottom:-4px;font-size:15px;background:var(--card);border-radius:99px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.nf-it .tx{flex:1;min-width:0;font-size:14px;line-height:1.4}.nf-it .tx b{font-weight:800}.nf-it .tx .tm{color:var(--mute);font-size:12.5px;margin-left:4px}
.nf-it img{width:46px;height:46px;border-radius:8px;object-fit:cover;flex:none;background:var(--th)}
.nf-it .cb{all:unset;cursor:pointer;width:40px;height:40px;border-radius:99px;display:flex;align-items:center;justify-content:center;color:var(--acc);font-size:18px;flex:none}.nf-it .cb:hover{background:var(--accS)}
.nf-call .dir{font-size:12.5px;color:var(--mute)}.nf-call.miss .dir{color:#e5484d;font-weight:700}
.nf-empty{text-align:center;color:var(--mute);padding:36px 10px}
.nf-fb{display:flex;gap:6px;margin-top:6px}.hdr-bell{position:relative}.hdr-bell .bdg[hidden],.cx-ib .bdg[hidden]{display:none!important}.hdr-bell .bdg{position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:#ff4d6d;color:#fff;font-size:10.5px;font-weight:800;display:flex;align-items:center;justify-content:center}`;document.head.appendChild(css);
const group=t=>{const d=(Date.now()-new Date(t))/864e5,n=new Date(),x=new Date(t);if(x.toDateString()===n.toDateString())return L("Hari ini","Today");if(d<7)return L("7 hari terakhir","Last 7 days");if(d<30)return L("30 hari terakhir","Last 30 days");return L("Sebelumnya","Earlier")};
function draw(v){if(!v)return;
  const acts=N.list.filter(a=>a.target===N.me&&a.kind!=="call"),calls=N.list.filter(a=>a.kind==="call");
  const tab=window.RAVI_NOTIF_TAB||N.tab;window.RAVI_NOTIF_TAB=null;N.tab=tab;window.RAVI_NOTIF_TAB_CUR=tab;
  const missed=calls.filter(a=>a.target===N.me&&!a.read_at&&(a.meta||{}).r!=="done").length;
  const newActs=acts.filter(a=>!a.read_at).length;
  let body="";
  if(tab==="act"){if(!acts.length)body=`<div class="nf-empty">${window.pipi?R.pipiM("happy",80,"vnel"):""}<p>${L("Belum ada aktivitas. Like, komentar, reaksi pesan, dan undangan grup akan muncul di sini.","No activity yet. Likes, comments, message reactions and group invites show up here.")}</p></div>`;
    else{let last="";for(const a of acts){const g=group(a.created_at);if(g!==last){body+=`<div class="nf-sec">${g}</div>`;last=g}
      const p=(a.kind==="like"||a.kind==="comment"||a.kind==="post")?postOf(a):null;
      body+=`<div class="nf-it${a.read_at?"":" new"}" data-a="${a.id}" role="button" tabindex="0"><span class="avw">${a.kind==="join"?`<span class="rv-av txt" style="width:46px;height:46px;font-size:19px;background:#7c5cff">${esc(((a.meta||{}).n||"?").charAt(0).toUpperCase())}</span>`:R.avatar(a.actor,46)}<span class="em"></span></span><div class="tx"><b></b><span class="d"></span><span class="tm">${R.ago(a.created_at)}</span>${a.kind==="friend"&&R.friendState&&R.friendState(a.actor)==="in"?`<span class="nf-fb"><button class="sm pri" data-fr="accept" data-u="${a.actor}">${L("Terima","Accept")}</button><button class="sm" data-fr="decline" data-u="${a.actor}">${L("Tolak","Decline")}</button></span>`:""}</div>${p?`<img data-img="${esc(p.img)}" alt="">`:""}</div>`}}}
  else{if(!calls.length)body=`<div class="nf-empty">📞<p>${L("Belum ada panggilan. Telepon atau video call dari Chat.","No calls yet. Start a voice or video call from Chat.")}</p></div>`;
    else{let last="";for(const a of calls){const g=group(a.created_at);if(g!==last){body+=`<div class="nf-sec">${g}</div>`;last=g}
      const m=a.meta||{},out=a.actor===N.me,other=out?a.target:a.actor,miss=!out&&m.r!=="done";
      body+=`<div class="nf-it nf-call${miss?" miss":""}${!out&&!a.read_at&&miss?" new":""}" data-c="${a.id}"><span class="avw">${R.avatar(other,46)}</span><div class="tx"><b></b><div class="dir">${out?"↗ ":"↙ "}${m.r==="done"?(out?L("Keluar","Outgoing"):L("Masuk","Incoming"))+" · "+fmt(m.d||0):m.r==="declined"?L("Ditolak","Declined"):out?L("Tidak dijawab","No answer"):L("Tak terjawab","Missed")} · ${new Date(a.created_at).toLocaleString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div></div>
        <button class="cb" data-cb="${other}" data-v="${m.v?1:0}" aria-label="${L("Telepon balik","Call back")}">${m.v?"🎥":"📞"}</button></div>`}}}
  v.innerHTML=page(L("Berdua","Together"),"🔔 "+L("Notifikasi","Notifications"))+
    `<div class="nf-tabs" role="tablist"><button data-t="act" class="${tab==="act"?"on":""}">${L("Aktivitas","Activity")}${newActs?`<span class="b">${newActs}</span>`:""}</button><button data-t="calls" class="${tab==="calls"?"on":""}">📞 ${L("Panggilan","Calls")}${missed?`<span class="b">${missed}</span>`:""}</button></div>
     <div class="region"><div class="rb">${body}</div></div>`;
  v.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{N.tab=b.dataset.t;draw(v);document.dispatchEvent(new CustomEvent("ravi-notif"))});
  v.querySelectorAll("[data-a]").forEach(el=>{const a=N.list.find(x=>x.id==el.dataset.a),[w,d,e]=describe(a);el.querySelector(".tx b").textContent=w;el.querySelector(".tx .d").textContent=d;el.querySelector(".em").textContent=e;
    el.onclick=e=>{if(e.target.closest("[data-fr]"))return;openAct(a)};el.onkeydown=ev=>{if(ev.key==="Enter")openAct(a)}});
  v.querySelectorAll("[data-fr]").forEach(b=>b.onclick=async e=>{e.stopPropagation();b.disabled=true;try{const r=await R.friendAct(b.dataset.u,b.dataset.fr);status(r==="accepted"?L("Sekarang kalian berteman 🤝","You're now friends 🤝"):L("Permintaan ditolak","Request declined"),"ok")}catch(err){status(err.message||String(err),"err")}draw(v)});
  v.querySelectorAll("[data-c]").forEach(el=>{const a=N.list.find(x=>x.id==el.dataset.c),o=a.actor===N.me?a.target:a.actor;el.querySelector(".tx b").textContent=R.name(o);
    el.onclick=e=>{if(e.target.closest("[data-cb]"))return;if(window.RAVI_CHAT)window.RAVI_CHAT.dmWith(o).then(c=>{go("chat");window.RAVI_CHAT.open(c)})}});
  v.querySelectorAll("[data-cb]").forEach(b=>b.onclick=async()=>{const u=b.dataset.cb;let cid=null;try{cid=window.RAVI_CHAT?await window.RAVI_CHAT.dmWith(u):null}catch(e){}window.RAVI_CALL&&window.RAVI_CALL.start(u,b.dataset.v==="1",cid)});
  const ik={};R.S.posts.forEach(p=>ik[p.img]=R.ikOf(p.img,p.caption));R.fillImgs(v,p=>ik[p]);
  markSeen(tab)}
async function markSeen(tab){const ids=N.list.filter(a=>a.target===N.me&&!a.read_at&&(tab==="calls"?a.kind==="call":a.kind!=="call")).map(a=>a.id);if(!ids.length)return;
  const ts=new Date().toISOString();setTimeout(()=>{N.list.forEach(a=>{if(ids.includes(a.id))a.read_at=ts});emit()},1200);
  try{await sb.from("couple_activity").update({read_at:ts}).in("id",ids)}catch(e){}}
function openAct(a){if(a.kind==="join"){go("admin");return}
  if((a.kind==="friend"||a.kind==="friend_ok")&&window.RAVI_CHAT){if(R.friendState&&R.friendState(a.actor)==="friend")window.RAVI_CHAT.dmWith(a.actor).then(c=>{go("chat");window.RAVI_CHAT.open(c)}).catch(()=>{});else window.RAVI_FRIENDS&&window.RAVI_FRIENDS();return}if(a.kind==="like"||a.kind==="post"||a.kind==="comment"){const p=postOf(a);go("feed");if(p)setTimeout(()=>document.getElementById("post"+p.id)?.scrollIntoView({block:"start",behavior:"smooth"}),350);return}
  if(a.kind==="react"&&window.RAVI_CHAT){const c=(a.meta||{}).c;if(c){go("chat");window.RAVI_CHAT.jump(c,+a.ref)}return}
  if(a.kind==="group"&&window.RAVI_CHAT){go("chat");window.RAVI_CHAT.open(a.ref)}}
function toast(a){if(route==="notif")return;const [w,d,e]=describe(a);
  if(a.kind==="call"&&(a.meta||{}).r==="done")return;
  if(window.doPeek&&route!=="chat")window.doPeek(true,{t:e+" "+w,d:d.trim(),r:a.kind==="call"?"notif":"notif",m:"party",w:6})}

/* ---------- lonceng di header ---------- */
function bell(){const h=document.querySelector("header");if(!h||h.querySelector(".hdr-bell"))return;const b=document.createElement("button");b.className="sm hdr-bell ms-hbtn";b.style.cssText="background:none;color:var(--hdrInk);border-color:rgba(255,255,255,.35)";
  b.setAttribute("aria-label",L("Notifikasi","Notifications"));b.innerHTML=`🔔<span class="bdg" hidden></span>`;b.onclick=()=>go("notif");
  const ref=h.querySelector(".ms-hbtn")||h.querySelector("#questBtn")||h.querySelector("#logout");ref?ref.before(b):h.appendChild(b);paintBell()}
function paintBell(){const n=unreadCount();document.querySelectorAll(".hdr-bell .bdg").forEach(x=>{x.hidden=!n;x.textContent=n>9?"9+":String(n)});
  const a=document.querySelector('aside a[data-r="notif"]');if(a){let b=a.querySelector(".qbadge");if(n&&!b){b=document.createElement("span");b.className="qbadge";a.appendChild(b)}if(b){if(n)b.textContent=n;else b.remove()}}}
const css2=document.createElement("style");css2.textContent="@media (max-width:860px){header .hdr-bell{display:inline-flex!important}}";document.head.appendChild(css2);

window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{notif:v=>{R.withInit(v,"🔔 "+L("Notifikasi","Notifications"),x=>{init().then(()=>draw(x)).catch(e=>{x.innerHTML='<div class="msg err">'+esc(e.message||String(e))+'</div>'})})}});
if(window.TOOL_ROUTES)window.TOOL_ROUTES.add("notif");
const grp=NAV.find(([g])=>g==="Berdua");if(grp)grp[1].push(["notif","🔔 Notifikasi"]);
if(window.RAVI_ICON)window.RAVI_ICON.notif="🔔";
if(typeof renderNav==="function"){const _rn=renderNav;renderNav=function(){const o=_rn.apply(this,arguments);try{bell();paintBell()}catch(e){}return o}}
addEventListener("load",()=>{bell();const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);init().catch(()=>{})}},1000);setTimeout(()=>clearInterval(t),60000)});
document.addEventListener("ravi-friends",()=>{if(typeof route!=="undefined"&&route==="notif"){const v=document.getElementById("view");if(v&&v.querySelector(".nf-it,.nf-empty"))try{draw(v)}catch(e){}}});
})();
