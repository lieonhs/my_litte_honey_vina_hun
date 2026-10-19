/* =====================================================================
   💬 CHAT ala WhatsApp: daftar chat, DM & grup, balas/teruskan/sematkan/bintangi,
   reaksi, "sedang mengetik…", online/terakhir dilihat, centang ✓ ✓✓ biru,
   wallpaper, layar penuh di HP (tombol kembali seperti WA).
   Hanya pesan yang berubah yang digambar ulang → ringan di HP.
   Butuh: social.js (window.RS), e2ee.js, push.js (presence), call.js (telepon).
   ===================================================================== */
(function(){
const R=window.RS;if(!R)return;
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const E2=()=>window.RAVI_E2E,PR=()=>window.RAVI_PRESENCE;
const mobile=()=>matchMedia("(max-width:860px)").matches;
const CH={ready:null,me:null,convs:new Map(),msgs:new Map(),open:null,typing:new Map(),stars:new Set(),hidden:new Set(),drafts:new Map(),
  reply:null,tray:[],vo:0,views:new Map(),chans:new Map(),sub:false,stkOpen:false,stkTab:"fav",atBottom:true,below:0,tmp:0,pend:new Map(),q:"",markT:{},inboxT:0};
const $$=(s,r)=>(r||document).querySelector(s);
const hhmm=R.hhmm;
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()};
const dayLbl=t=>{const d=new Date(t),n=new Date(),y=new Date();y.setDate(n.getDate()-1);
  if(d.toDateString()===n.toDateString())return L("Hari ini","Today");if(d.toDateString()===y.toDateString())return L("Kemarin","Yesterday");
  if(n-d<6*864e5)return d.toLocaleDateString(EN()?"en-GB":"id-ID",{weekday:"long"});
  return d.toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"long",year:d.getFullYear()===n.getFullYear()?undefined:"numeric"})};
const shortTime=t=>{const d=new Date(t),n=new Date();if(d.toDateString()===n.toDateString())return hhmm(t);const y=new Date();y.setDate(n.getDate()-1);
  if(d.toDateString()===y.toDateString())return L("Kemarin","Yesterday");if(n-d<6*864e5)return d.toLocaleDateString(EN()?"en-GB":"id-ID",{weekday:"short"});
  return d.toLocaleDateString(EN()?"en-GB":"id-ID",{day:"2-digit",month:"2-digit",year:"2-digit"})};
const lastSeenTxt=t=>{if(!t)return L("offline","offline");const d=new Date(t),n=new Date(),s=(n-d)/1000;
  if(s<60)return L("terakhir dilihat baru saja","last seen just now");
  if(d.toDateString()===n.toDateString())return L("terakhir dilihat hari ini ","last seen today at ")+hhmm(t);
  const y=new Date();y.setDate(n.getDate()-1);if(d.toDateString()===y.toDateString())return L("terakhir dilihat kemarin ","last seen yesterday at ")+hhmm(t);
  return L("terakhir dilihat ","last seen ")+d.toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short"})+" "+hhmm(t)};
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const ICON={
 reply:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
 react:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8"/><path d="M9 9.5h.01M15 9.5h.01"/>',
 fwd:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0-5 5v6"/>',
 pin:'<path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>',
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
 del:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 back:'<path d="M15 19 8 12l7-7"/>',more:'<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
 phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
 video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
 clip:'<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
 send:'<path d="M4 12 20 4l-4 16-4-7z"/><path d="m12 13 8-9"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8"/><path d="M9 9.5h.01M15 9.5h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',down:'<path d="m6 9 6 6 6-6"/>',
 img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',file:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',
 wall:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',group:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'};
const ic=(n,s)=>`<svg class="ico" viewBox="0 0 24 24" width="${s||22}" height="${s||22}" aria-hidden="true">${ICON[n]||""}</svg>`;
const TICK=`<svg class="tk" viewBox="0 0 18 12" aria-hidden="true"><path class="c1" d="M1.2 6.6 4.4 9.8 11 3"/><path class="c2" d="M7.4 9.8 14 3"/><g class="ck"><circle cx="9" cy="6" r="4.6"/><path d="M9 3.6V6l1.6 1.2"/></g></svg>`;
const QUICK=["👍","❤️","😂","😮","😢","🙏"];
const RX_STK=["stk:vnel:party","stk:vcap:happy","stk:erusa:party","stk:vorange:worried","stk:ekaget:worried","stk:pipi:party","stk:bubu:happy","stk:vkrl:sleep"];

/* ---------- data ---------- */
const meName=()=>R.name(CH.me);
const active=c=>(c.members||[]).filter(x=>x.r!=="left");
const others=c=>active(c).filter(x=>x.u!==CH.me);
const peer=c=>c&&c.kind==="dm"?(others(c)[0]||{}).u:null;
const title=c=>!c?"":c.kind==="group"?(c.name||L("Grup","Group")):R.name(peer(c));
const convAv=(c,s)=>c.kind==="group"?R.groupAvatar(c.emoji,s,c.id):R.avatar(peer(c),s);
const myMem=c=>(c.members||[]).find(x=>x.u===CH.me)||{};
async function init(){if(CH.ready)return CH.ready;CH.ready=(async()=>{
    await R.init();CH.me=R.S.me;
    CH.hidden=new Set(lsGet("ravi_hid_"+CH.me,[]));
    await loadInbox();subscribe();
    sb.from("couple_stars").select("msg_id").then(({data})=>{(data||[]).forEach(x=>CH.stars.add(x.msg_id))},()=>{});
    try{sb.rpc("ravi_mark_all").then(()=>{},()=>{})}catch(e){}
    if(PR())PR().ready().catch(()=>{});
    return true})();
  CH.ready.catch(e=>{R.S.setupErr=R.S.setupErr||String(e&&(e.message||e.code)||e);CH.ready=null});return CH.ready}
async function loadInbox(){const {data,error}=await sb.rpc("ravi_inbox");if(error)throw error;const keep=new Set();
  for(const r of data||[]){keep.add(r.conv_id);const c=CH.convs.get(r.conv_id)||{id:r.conv_id};
    Object.assign(c,{kind:r.kind,name:r.name,emoji:r.emoji,pinned_msg:r.pinned_msg,members:r.members||[],unread:r.unread||0,
      last:r.last_id?{id:r.last_id,sender:r.last_sender,body:r.last_body,img:r.last_img,created_at:r.last_at}:null,at:r.last_at});
    CH.convs.set(c.id,c);typingChan(c.id)}
  for(const k of [...CH.convs.keys()])if(!keep.has(k))CH.convs.delete(k);
  if([...CH.convs.values()].some(c=>(c.members||[]).some(x=>!R.S.members[x.u])))await R.loadMembers().catch(()=>{});
  badge()}
function scheduleInbox(){clearTimeout(CH.inboxT);CH.inboxT=setTimeout(()=>loadInbox().then(()=>{paintInbox();paintHead()}).catch(()=>{}),400)}
async function loadMsgs(cid,before){const st=CH.msgs.get(cid)||{list:[],more:true,loading:false};CH.msgs.set(cid,st);if(st.loading)return st;st.loading=true;
  try{let q=sb.from("couple_msgs").select("*").eq("conv_id",cid);if(before)q=q.lt("id",before);
    const {data,error}=await q.order("id",{ascending:false}).limit(before?40:50);if(error)throw error;
    const got=(data||[]).reverse();st.more=(data||[]).length>=(before?40:50);
    const ids=new Set(st.list.map(m=>m.id));const add=got.filter(m=>!ids.has(m.id));
    st.list=before?[...add,...st.list]:[...st.list.filter(m=>m.id<0),...add].sort((a,b)=>(a.id<0?1e15:a.id)-(b.id<0?1e15:b.id));
    if(!before)st.loaded=true;return add}finally{st.loading=false}}
function storeMsg(m){const st=CH.msgs.get(m.conv_id);if(!st||!st.loaded)return false;const i=st.list.findIndex(x=>x.id===m.id);if(i>=0){st.list[i]=m;return "upd"}st.list.push(m);return "add"}
const unreadTotal=()=>[...CH.convs.values()].reduce((s,c)=>s+(c.unread||0),0);
function badge(){const n=unreadTotal();const rl=document.getElementById("rlUn");if(rl){rl.hidden=!n;rl.textContent=n>99?"99+":n}const a=document.querySelector('aside a[data-r="chat"]');if(a){let b=a.querySelector(".qbadge");if(n&&!b){b=document.createElement("span");b.className="qbadge";a.appendChild(b)}if(b){if(n)b.textContent=n>99?"99+":n;else b.remove()}}
  document.dispatchEvent(new CustomEvent("ravi-unread",{detail:n}))}

/* ---------- realtime ---------- */
function subscribe(){if(CH.sub)return;CH.sub=true;
  sb.channel("ravi-chat-db")
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_msgs"},p=>{try{onMsg(p)}catch(e){console.error(e)}})
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_conv_members"},p=>{try{onMember(p)}catch(e){console.error(e)}})
   .on("postgres_changes",{event:"*",schema:"public",table:"couple_msg_views"},p=>{const v=p.new;if(!v||!v.msg_id)return;const x=CH.views.get(v.msg_id)||{};x[v.user_id]=v.views;CH.views.set(v.msg_id,x);
     for(const [cid,st] of CH.msgs){const m=st.list.find(y=>y.id===v.msg_id);if(m){if(CH.open===cid)patchBubble(m);cleanupVO(m)}}})
   .on("postgres_changes",{event:"UPDATE",schema:"public",table:"couple_convs"},p=>{const c=CH.convs.get(p.new.id);if(!c)return;Object.assign(c,{name:p.new.name,emoji:p.new.emoji,pinned_msg:p.new.pinned_msg});paintInbox();if(CH.open===c.id){paintHead();paintPin()}})
   .subscribe();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&CH.me){scheduleInbox();if(CH.open){catchUp(CH.open);markRead(CH.open)}}});
  addEventListener("online",()=>{scheduleInbox();if(CH.open)catchUp(CH.open)})}
async function catchUp(cid){const st=CH.msgs.get(cid);if(!st||!st.loaded)return;const last=[...st.list].reverse().find(m=>m.id>0);
  let q=sb.from("couple_msgs").select("*").eq("conv_id",cid);if(last)q=q.gt("id",last.id);const {data}=await q.order("id",{ascending:true}).limit(100);
  (data||[]).forEach(m=>onMsg({eventType:"INSERT",new:m}))}
function onMsg(p){
  if(p.eventType==="DELETE"){const id=p.old&&p.old.id;for(const [cid,st] of CH.msgs){const i=st.list.findIndex(m=>m.id===id);if(i>=0){st.list.splice(i,1);if(CH.open===cid)removeBubble(id)}}
    for(const c of CH.convs.values())if(c.last&&c.last.id===id)scheduleInbox();return}
  const m=p.new;if(!m||!m.conv_id)return;const c=CH.convs.get(m.conv_id);if(!c){scheduleInbox();return}
  if(p.eventType==="INSERT"){
    /* pesanku sendiri yang baru dikonfirmasi */
    if(m.sender===CH.me&&CH.pend.has(m.body)){confirmTmp(CH.pend.get(m.body),m);return}
    if(!c.last||m.id>=c.last.id){c.last=m;c.at=m.created_at}
    const r=storeMsg(m);
    if(m.sender!==CH.me){const viewing=CH.open===m.conv_id&&!document.hidden;
      if(!viewing){c.unread=(c.unread||0)+1;notify(c,m)}
      mark(m.conv_id,viewing)}
    if(CH.open===m.conv_id&&r==="add")appendBubble(m,true);
    stopTyping(m.conv_id,m.sender);
    paintInbox();badge();return}
  if(p.eventType==="UPDATE"){storeMsg(m);if(CH.open===m.conv_id)patchBubble(m);if(c.last&&c.last.id===m.id){c.last=m;paintInbox()}}}
function onMember(p){const r=p.new&&p.new.conv_id?p.new:p.old;if(!r)return;const c=CH.convs.get(r.conv_id);
  if(!c||p.eventType==="INSERT"&&r.user_id===CH.me){scheduleInbox();return}
  if(p.eventType==="UPDATE"&&r.user_id===CH.me&&r.role==="left"){CH.convs.delete(c.id);if(CH.open===c.id)closeRoom();paintInbox();return}
  const i=c.members.findIndex(x=>x.u===r.user_id);const row={u:r.user_id,r:r.role,d:r.delivered_at,rd:r.read_at};
  if(p.eventType==="DELETE"){if(i>=0)c.members.splice(i,1)}else if(i>=0)c.members[i]=row;else c.members.push(row);
  if(CH.open===c.id){paintTicks();paintHead()}paintInbox()}
/* tandai terkirim / dibaca (jam server) */
function mark(cid,read){const k=cid+(read?"r":"d");if(CH.markT[k])return;CH.markT[k]=setTimeout(async()=>{delete CH.markT[k];
  try{const {data}=await sb.rpc("ravi_mark",{c:cid,p_read:!!read});const c=CH.convs.get(cid),me=c&&myMem(c);if(me&&data){me.d=data;if(read)me.rd=data}}catch(e){}},read?250:900)}
function markRead(cid){const c=CH.convs.get(cid);if(!c||document.hidden)return;if(c.unread){c.unread=0;badge();paintInbox()}mark(cid,true);
  /* versi lama masih memakai kolom read_at per pesan */
  const st=CH.msgs.get(cid);if(st){const ids=st.list.filter(m=>m.sender!==CH.me&&!m.read_at&&m.id>0).map(m=>m.id);if(ids.length){const ts=new Date().toISOString();st.list.forEach(m=>{if(ids.includes(m.id))m.read_at=ts});sb.from("couple_msgs").update({read_at:ts}).in("id",ids).then(()=>{},()=>{})}}}
function notify(c,m){const txt=snip(m);if(route!=="chat"||(CH.open&&CH.open!==c.id))qrShow(c,m); /* di daftar chat tidak perlu jendela */
  try{if(document.hidden&&window.Notification&&Notification.permission==="granted"&&localStorage.getItem("bbp_push_ok")!=="1")new Notification(c.kind==="group"?title(c):R.name(m.sender),{body:txt.slice(0,120),icon:"icon-192.png",tag:"c"+c.id})}catch(e){}}

/* ---------- jendela balas cepat (pesan masuk saat sedang di halaman lain) ---------- */
const qrCss=document.createElement("style");qrCss.textContent=`
#qrWin{position:fixed;right:max(16px,env(safe-area-inset-right));top:calc(14px + env(safe-area-inset-top));z-index:70;width:min(360px,calc(100vw - 24px));background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.22);padding:10px 12px 12px;animation:qrIn .22s ease-out}
@keyframes qrIn{from{opacity:0;transform:translateY(-10px) scale(.98)}to{opacity:1;transform:none}}
#qrWin.out{animation:qrOut .18s ease-in forwards}@keyframes qrOut{to{opacity:0;transform:translateY(-8px)}}
#qrWin .qh{display:flex;gap:10px;align-items:center;cursor:pointer}#qrWin .qh .tx{flex:1;min-width:0}#qrWin .qh b{display:block;font-size:14px}
#qrWin .qh span.m{display:block;font-size:13px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#qrWin .qx{all:unset;cursor:pointer;width:28px;height:28px;border-radius:99px;display:flex;align-items:center;justify-content:center;color:var(--mute)}#qrWin .qx:hover{background:var(--th)}
#qrWin form{display:flex;gap:6px;margin-top:10px}#qrWin input{flex:1;min-width:0;border-radius:99px;padding:9px 14px}
#qrWin button.sd{all:unset;cursor:pointer;width:38px;height:38px;border-radius:99px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center;flex:none}
#qrWin .ok{font-size:12.5px;color:var(--mute);margin-top:8px}
@media (max-width:860px){#qrWin{left:12px;right:12px;width:auto}}
@media (prefers-reduced-motion:reduce){#qrWin,#qrWin.out{animation:none}}`;document.head.appendChild(qrCss);
let qrT=0;
function qrClose(){const w=document.getElementById("qrWin");if(!w)return;clearTimeout(qrT);w.classList.add("out");setTimeout(()=>w.remove(),180)}
function qrShow(c,m){if(document.querySelector(".sheetBg")||document.getElementById("callUI")?.offsetParent)return;
  let w=document.getElementById("qrWin");const typing=w&&w.dataset.c===String(c.id)&&w.querySelector("input")?.value;
  if(!w){w=document.createElement("div");w.id="qrWin";w.setAttribute("role","dialog");document.body.appendChild(w)}
  const who=c.kind==="group"?title(c)+" · "+R.name(m.sender):R.name(m.sender);w.dataset.c=c.id;w.dataset.m=m.id;
  if(!typing){w.innerHTML=`<div class="qh">${c.kind==="group"?convAv(c,38):R.avatar(m.sender,38)}<div class="tx"><b></b><span class="m"></span></div><button class="qx" aria-label="${L("Tutup","Close")}">✕</button></div>
    <form><input placeholder="${L("Balas…","Reply…")}" maxlength="2000" aria-label="${L("Balas pesan","Reply to message")}"><button class="sd" aria-label="${L("Kirim","Send")}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 20 4l-6 16-3-7z"/></svg></button></form>`;
    w.querySelector("b").textContent=who;
    w.querySelector(".qx").onclick=e=>{e.stopPropagation();qrClose()};
    w.querySelector(".qh").onclick=()=>{qrClose();go("chat");window.RAVI_CHAT.open(c.id)};
    const inp=w.querySelector("input");inp.onfocus=()=>clearTimeout(qrT);inp.onblur=()=>{if(!inp.value)arm()};inp.onkeydown=e=>{if(e.key==="Escape")qrClose()};
    w.querySelector("form").onsubmit=async e=>{e.preventDefault();const t=inp.value.trim();if(!t)return;inp.value="";const cid=w.dataset.c;
      await sendBody(cid,{t});markRead(cid);w.querySelector("form").outerHTML=`<div class="ok">✓ ${L("Terkirim","Sent")}</div>`;clearTimeout(qrT);qrT=setTimeout(qrClose,1400)}}
  const sp=w.querySelector(".m"),fill=()=>{if(sp.isConnected)sp.textContent=snip(m)};fill();setTimeout(fill,600);
  const arm=()=>{clearTimeout(qrT);qrT=setTimeout(()=>{const i=w.querySelector("input");if(!i||(!i.value&&document.activeElement!==i))qrClose()},9000)};arm()}

/* ---------- mengetik… ---------- */
function typingChan(cid){if(CH.chans.has(cid)||CH.chans.size>25)return;
  const ch=sb.channel("ravi-c-"+cid,{config:{private:true,broadcast:{self:false}}});
  ch.on("broadcast",{event:"ty"},({payload})=>{if(!payload||payload.u===CH.me)return;if(payload.s)startTyping(cid,payload.u);else stopTyping(cid,payload.u)});
  ch.subscribe();CH.chans.set(cid,{ch,last:0})}
function startTyping(cid,u){const m=CH.typing.get(cid)||new Map();CH.typing.set(cid,m);clearTimeout(m.get(u));m.set(u,setTimeout(()=>stopTyping(cid,u),5000));paintTyping(cid)}
function stopTyping(cid,u){const m=CH.typing.get(cid);if(!m||!m.has(u))return;clearTimeout(m.get(u));m.delete(u);paintTyping(cid)}
const typers=cid=>[...((CH.typing.get(cid)||new Map()).keys())];
function sendTyping(cid,on){const x=CH.chans.get(cid);if(!x)return;const now=Date.now();if(on&&now-x.last<2500)return;x.last=on?now:0;
  try{x.ch.send({type:"broadcast",event:"ty",payload:{u:CH.me,s:on?1:0}})}catch(e){}}

/* ---------- isi pesan ---------- */
const callRe=/^\[call:(voice|video):(\d+):(\w+)\]$/;
function snip(m){if(!m)return "";const o=R.parse(R.pt(m.body));if(R.isStk(o.t))return "🧸 "+L("Stiker","Sticker");if(o.sg)return "🎵 "+(o.sg.t||L("Lagu","Song"));if(o.loc)return "📍 "+L("Lokasi","Location");
  const cm=callRe.exec(o.t||"");if(cm)return (cm[1]==="video"?"🎥 ":"📞 ")+(cm[3]==="done"?L("Panggilan","Call"):L("Panggilan tak terjawab","Missed call"));
  if(o.vo)return (o.vo===1?"①":"②")+" "+L("Foto ","Photo ")+(o.vo===1?L("sekali lihat","view once"):L("dua kali lihat","view twice"));
  if(o.f)return R.fIcon(o.f.m)+" "+o.f.n;if(m.img&&!o.t)return "📷 "+L("Foto","Photo");if(m.img)return "📷 "+o.t;return (o.t||"").replace(/\s+/g," ").slice(0,90)}
function tickState(m,c){if(m.id<0)return m.failed?"fail":"pend";const os=others(c);if(!os.length)return "sent";const t=Date.parse(m.created_at)-1500;
  if(m.read_at&&os.length===1)return "read";
  if(os.every(x=>x.rd&&Date.parse(x.rd)>=t))return "read";if(os.every(x=>x.d&&Date.parse(x.d)>=t))return "dlv";return "sent"}
const nameColor=u=>{let h=0;for(const ch of String(u))h=(h*31+ch.charCodeAt(0))%360;return `hsl(${h} 62% 42%)`};

/* ---------- gaya ---------- */
const css=document.createElement("style");css.textContent=`
#view .cx{--cxH:calc(100dvh - var(--hdrH,96px) - 36px)}
.cx{display:block}
.cx-inbox{display:flex;flex-direction:column;min-width:0}
.cx-room{display:none;min-width:0}
@media (min-width:861px){.cx{display:grid;grid-template-columns:minmax(290px,370px) 1fr;height:var(--cxH);min-height:460px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--card)}
 .cx-inbox{border-right:1px solid var(--line);overflow:hidden}.cx-inbox .cx-scroll{flex:1;overflow-y:auto}
 .cx-room{display:flex;flex-direction:column;position:relative;overflow:hidden}}
.cx-top{display:flex;align-items:center;gap:8px;padding:12px 14px 8px}
.cx-top h1{font-size:22px;margin:0;flex:1;display:flex;align-items:center;gap:8px}
.cx-ib{all:unset;cursor:pointer;width:40px;height:40px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;color:var(--ink);position:relative;flex:none}
.cx-ib:hover,.cx-ib:focus-visible{background:var(--th)}.cx-ib:focus-visible{outline:2px solid var(--acc)}
.cx-ib .bdg{position:absolute;top:3px;right:2px;min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:#ff4d6d;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center}
.ico{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}
.cx-search{margin:0 14px 8px;display:flex;align-items:center;gap:8px;background:var(--th);border-radius:99px;padding:0 14px;color:var(--mute)}
.cx-search input{all:unset;flex:1;min-width:0;height:40px;font-size:15px;color:var(--ink)}
.cx-chips{display:flex;gap:6px;padding:0 14px 8px;overflow-x:auto}.cx-chips button{all:unset;cursor:pointer;white-space:nowrap;padding:6px 12px;border-radius:99px;background:var(--th);font-size:13px;font-weight:700;color:var(--mute)}
.cx-chips button.on{background:var(--accS);color:var(--acc)}
.cx-notes{padding:0 10px}
.cx-it{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:12px;align-items:center;width:100%;padding:10px 14px;position:relative}
.cx-it:hover,.cx-it:focus-visible{background:var(--th)}.cx-it.on{background:var(--accS)}
.cx-it .avw{position:relative;flex:none;display:inline-flex}
.dot{position:absolute;right:0;bottom:1px;width:12px;height:12px;border-radius:99px;background:#25d366;border:2px solid var(--card);transform:scale(0);transition:transform .2s}.dot.on{transform:scale(1)}
.cx-mid{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:-10px}
.cx-r1,.cx-r2{display:flex;gap:8px;align-items:center;min-width:0}
.cx-r1 b{flex:1;min-width:0;font-size:15.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-r1 .tm{font-size:11.5px;color:var(--mute);flex:none}.cx-it.un .cx-r1 .tm{color:#25d366;font-weight:800}
.cx-r2 .sn{flex:1;min-width:0;font-size:13.5px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;gap:3px;align-items:center}
.cx-r2 .sn .tk{flex:none}.cx-r2 .sn.ty{color:#25d366;font-style:italic;font-weight:700}
.ub{flex:none;min-width:20px;height:20px;padding:0 6px;border-radius:99px;background:#25d366;color:#fff;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;animation:ubIn .25s}
@keyframes ubIn{from{transform:scale(.4)}to{transform:scale(1)}}
.cx-empty{padding:28px 18px;text-align:center;color:var(--mute);font-size:14px}
.cx-fab{position:fixed;right:max(18px,env(safe-area-inset-right,0px));bottom:calc(88px + env(safe-area-inset-bottom,0px));z-index:45;width:56px;height:56px;border-radius:18px;border:0;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px color-mix(in srgb,var(--acc) 45%,transparent);cursor:pointer}
@media (min-width:861px){.cx-fab{display:none}}
.cx-blank{margin:auto;text-align:center;color:var(--mute);max-width:34ch;padding:20px;font-size:14px;line-height:1.5}
/* ---- tampilan laptop ala WhatsApp Web: layar penuh + rel ikon ---- */
@media (min-width:861px){
 html.cx-desk body{overflow:hidden}
 html.cx-desk .cx{position:fixed;top:0;bottom:0;right:0;left:var(--railW,64px);z-index:40;height:auto;min-height:0;border:0;border-radius:0;grid-template-columns:minmax(320px,32%) 1fr;animation:sxIn .22s ease-out}
 html.cx-desk .cx-top h1{font-size:21px}
 html.cx-desk .cx-inbox{background:var(--card)}
 html.cx-desk .rm-h{min-height:60px;padding-left:14px} html.cx-desk #rmBack{display:none}
 html.cx-desk .rm-list{padding:8px 7% 10px}
 html.cx-desk #status:not(:empty){position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:60;max-width:min(560px,90vw)}
}
/* ---- ruang chat ---- */
.rm{display:flex;flex-direction:column;height:100%;min-height:0;position:relative;background:var(--bg);--bubMe:color-mix(in srgb,var(--acc) 26%,var(--card));--bubMeInk:var(--ink);--bubThem:var(--card)}
.rm-h{display:flex;align-items:center;gap:6px;padding:8px 8px 8px 4px;background:var(--card);border-bottom:1px solid var(--line);min-height:58px;z-index:3}
.rm-h .avw{position:relative;display:inline-flex;cursor:pointer}
.rm-t{flex:1;min-width:0;cursor:pointer;padding:2px 4px}.rm-t b{display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-s{display:block;font-size:12.5px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .2s}.rm-s.ty{color:#25d366;font-weight:700}
.rm-pin{display:flex;gap:8px;align-items:center;padding:7px 14px;background:var(--card);border-bottom:1px solid var(--line);font-size:13px;cursor:pointer;animation:fadeD .2s}
.rm-pin span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--mute)}
@keyframes fadeD{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.rm-note{display:flex;gap:8px;align-items:center;padding:7px 12px;font-size:12.5px;background:var(--ambS);border-bottom:1px solid var(--line);line-height:1.4}.rm-note b{display:block}.rm-note>div{flex:1}
.rm-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;position:relative;-webkit-overflow-scrolling:touch;background-color:var(--rmBg,var(--bg));background-size:var(--rmBs,auto);background-position:center;background-attachment:local}
.rm-dim{position:sticky;top:0;height:0}
.rm-list{display:flex;flex-direction:column;padding:8px 4% 10px;min-height:100%;justify-content:flex-end;box-sizing:border-box}
.rm-sys{align-self:center;max-width:min(92%,420px);text-align:center;font-size:12px;line-height:1.45;color:var(--ink);background:color-mix(in srgb,var(--card) 92%,transparent);border-radius:10px;padding:6px 12px;margin:6px 0 10px;cursor:pointer;box-shadow:0 1px 1px rgba(0,0,0,.06)}
.rm-sys.y{background:#ffeecd;color:#54442b}
.dy{align-self:center;position:sticky;top:6px;z-index:2;font-size:12px;font-weight:700;color:var(--ink);background:color-mix(in srgb,var(--card) 94%,transparent);border-radius:9px;padding:4px 12px;margin:8px 0;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.unr{align-self:stretch;text-align:center;font-size:12.5px;font-weight:800;color:var(--acc);background:color-mix(in srgb,var(--card) 80%,transparent);padding:4px;margin:6px -4%}
.mb{display:flex;flex-direction:column;max-width:80%;margin-top:6px;position:relative}
.mb.me{align-self:flex-end;align-items:flex-end}.mb.them{align-self:flex-start;align-items:flex-start}
.mb.cont{margin-top:2px}
.bb{position:relative;padding:6px 8px 6px 9px;border-radius:12px;font-size:15px;line-height:1.38;overflow-wrap:anywhere;white-space:pre-wrap;box-shadow:0 1px .5px rgba(0,0,0,.13);min-width:64px;user-select:text;-webkit-user-select:text;transition:filter .15s}
.mb.me .bb{background:var(--bubMe);color:var(--bubMeInk);border-top-right-radius:4px}.mb.them .bb{background:var(--bubThem);color:var(--ink);border-top-left-radius:4px}
.mb.cont .bb{border-radius:12px}
.mb.me:not(.cont) .bb::after,.mb.them:not(.cont) .bb::after{content:"";position:absolute;top:0;width:8px;height:12px}
.mb.me:not(.cont) .bb::after{right:-7px;background:var(--bubMe);clip-path:polygon(0 0,100% 0,0 100%)}
.mb.them:not(.cont) .bb::after{left:-7px;background:var(--bubThem);clip-path:polygon(0 0,100% 0,100% 100%)}
.bb .who{display:block;font-size:12.8px;font-weight:800;margin-bottom:1px}
.bb .tx{display:inline}
.bb .meta{float:right;display:inline-flex;align-items:center;gap:3px;margin:6px -2px -4px 10px;font-size:11px;line-height:1;opacity:.72;white-space:nowrap;position:relative;top:3px}
.mb.me .bb .meta{opacity:.85}.bb .meta .st{font-size:10px}
.tk{width:17px;height:11px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.tk .c1,.tk .c2,.tk .ck{transition:opacity .28s ease,transform .28s ease}
.tk .c2{transform:translateX(-3px)}.tk .ck{opacity:0}
.tk[data-s=pend] .c1,.tk[data-s=pend] .c2{opacity:0}.tk[data-s=pend] .ck{opacity:.9}
.tk[data-s=fail]{color:#e5484d}.tk[data-s=fail] .c1,.tk[data-s=fail] .c2{opacity:0}.tk[data-s=fail] .ck{opacity:1}
.tk[data-s=sent] .c2{opacity:0}
.tk[data-s=dlv] .c2,.tk[data-s=read] .c2{opacity:1;transform:none}
.tk[data-s=read]{color:#53bdeb;transition:color .35s ease}
.mb.me .tk{color:var(--mute)}.mb.me .tk[data-s=read]{color:#53bdeb}
.bb img.ph{display:block;max-width:100%;width:260px;max-height:340px;object-fit:cover;border-radius:9px;margin:-2px -4px 4px;cursor:zoom-in;background:color-mix(in srgb,var(--th) 70%,transparent);min-height:120px;transition:opacity .25s}
.bb img.ph:not([src]){opacity:.6}
.mb.only-img .bb .meta{position:absolute;right:10px;bottom:10px;margin:0;top:auto;background:rgba(0,0,0,.45);color:#fff;padding:3px 6px;border-radius:99px;opacity:1}
.mb.only-img .bb{padding:4px}.mb.only-img .bb img.ph{margin:0}
.mb.stk .bb{background:none!important;box-shadow:none;padding:0}.mb.stk .bb::after{display:none}
.mb.stk .bb .meta{float:none;display:flex;justify-content:flex-end;margin:0;top:0;background:color-mix(in srgb,var(--card) 85%,transparent);color:var(--ink);padding:3px 6px;border-radius:99px;width:max-content;margin-left:auto}
.mb.stk .tk{color:var(--mute)}.mb.stk .tk[data-s=read]{color:#53bdeb}
.q{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;border-left:4px solid var(--qc,var(--acc));background:rgba(0,0,0,.06);border-radius:7px;padding:5px 8px;margin:0 0 4px;font-size:13px;line-height:1.3}
.mb.me .q{background:rgba(0,0,0,.08)}.q b{display:block;font-size:12.5px;color:var(--qc,var(--acc))}.mb.me .q b{color:inherit;opacity:.95}
.q span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;opacity:.85;white-space:normal}
.fw{display:flex;gap:4px;align-items:center;font-size:12px;font-style:italic;opacity:.75;margin-bottom:2px}
.fl{display:flex;gap:10px;align-items:center;min-width:210px;background:rgba(0,0,0,.06);border-radius:9px;padding:9px;margin-bottom:3px}
.fl .fi{font-size:28px;line-height:1}.fl .fm{flex:1;min-width:0}.fl .fm b{display:block;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fl .fm span{font-size:11.5px;opacity:.75}
.fl button{all:unset;cursor:pointer;width:34px;height:34px;border-radius:99px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.08);font-size:15px}
.md video,.md img{display:block;width:260px;max-width:100%;border-radius:9px;margin:4px 0;background:#000}.md audio{width:240px;max-width:100%;margin:4px 0}
.rxp{display:inline-flex;gap:1px;align-items:center;margin-top:-6px;position:relative;z-index:1;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:1px 6px;font-size:14px;line-height:20px;box-shadow:0 1px 2px rgba(0,0,0,.12);cursor:pointer;animation:rxIn .25s cubic-bezier(.3,1.5,.5,1)}
.mb.me .rxp{margin-right:8px}.mb.them .rxp{margin-left:8px}.rxp small{font-size:11px;color:var(--mute);margin-left:2px}
@keyframes rxIn{from{transform:scale(0)}to{transform:scale(1)}}
.mb.ani{animation:mbIn .26s cubic-bezier(.2,.85,.25,1.15) both}
.mb.me.ani{transform-origin:100% 100%}.mb.them.ani{transform-origin:0 100%}
@keyframes mbIn{from{opacity:0;transform:translateY(14px) scale(.94)}to{opacity:1;transform:none}}
.mb.out{animation:mbOut .22s ease forwards}@keyframes mbOut{to{opacity:0;transform:scale(.9);height:0;margin:0}}
.mb.flash .bb{animation:flash 1.4s}@keyframes flash{0%,55%{filter:brightness(.82)}100%{filter:none}}
.mb.sel .bb{filter:brightness(.88)}
.mb .chev{position:absolute;top:2px;width:26px;height:26px;border-radius:99px;border:0;background:color-mix(in srgb,var(--card) 80%,transparent);color:var(--mute);display:none;align-items:center;justify-content:center;cursor:pointer;z-index:2}
.mb.me .chev{right:4px}.mb.them .chev{right:4px}
@media (hover:hover){.mb:hover .chev{display:flex}}
.mb .swp{position:absolute;left:-34px;top:50%;margin-top:-14px;width:28px;height:28px;border-radius:99px;background:var(--card);display:flex;align-items:center;justify-content:center;opacity:0;color:var(--mute)}
.cl-pill{align-self:center;display:flex;gap:8px;align-items:center;background:color-mix(in srgb,var(--card) 94%,transparent);border-radius:12px;padding:8px 12px;margin:8px 0;box-shadow:0 1px 1px rgba(0,0,0,.08);font-size:13px}
.cl-pill .i{width:34px;height:34px;border-radius:99px;display:flex;align-items:center;justify-content:center;background:var(--th)}.cl-pill.miss .i{color:#e5484d}
.cl-pill b{display:block;font-size:13.5px}.cl-pill span{font-size:11.5px;color:var(--mute)}.cl-pill button{all:unset;cursor:pointer;color:var(--acc);font-weight:800;padding:4px 6px}
.rm-typ{align-self:flex-start;margin-top:6px;background:var(--bubThem);border-radius:12px;border-top-left-radius:4px;padding:10px 12px;box-shadow:0 1px .5px rgba(0,0,0,.13);display:none;gap:4px;align-items:center}
.rm-typ.on{display:inline-flex;animation:mbIn .22s both}.rm-typ i{width:7px;height:7px;border-radius:99px;background:var(--mute);animation:tyb 1.2s infinite}
.rm-typ i:nth-child(2){animation-delay:.15s}.rm-typ i:nth-child(3){animation-delay:.3s}.rm-typ small{font-size:11.5px;color:var(--mute);margin-left:4px}
@keyframes tyb{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}
.rm-fab{position:absolute;right:14px;bottom:76px;z-index:4;width:42px;height:42px;border-radius:99px;border:0;background:var(--card);color:var(--mute);box-shadow:0 2px 8px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;cursor:pointer;transform:scale(0);transition:transform .2s}
.rm-fab.on{transform:scale(1)}.rm-fab .n{position:absolute;top:-6px;right:-4px;min-width:18px;height:18px;border-radius:99px;background:#25d366;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px}.rm-fab .n:empty{display:none}
.rm-foot{background:transparent;padding:6px 8px calc(8px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;z-index:3}
.rm-rp,.rm-tray{background:var(--card);border-radius:14px;box-shadow:0 1px 2px rgba(0,0,0,.12);animation:fadeU .18s}
@keyframes fadeU{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.rm-rp{display:flex;gap:8px;align-items:center;padding:6px 6px 6px 12px;border-left:4px solid var(--acc)}.rm-rp>div{flex:1;min-width:0;font-size:13px}.rm-rp b{display:block;color:var(--acc)}.rm-rp span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--mute)}
.rm-tray{display:flex;gap:8px;overflow-x:auto;padding:8px}
.ti{position:relative;flex:none;width:72px;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px}
.ti img,.ti .fi{width:72px;height:72px;object-fit:cover;border-radius:10px;background:var(--th);display:flex;align-items:center;justify-content:center;font-size:28px}
.ti .tn{width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;color:var(--mute)}
.ti button{all:unset;cursor:pointer;position:absolute;top:-5px;right:-5px;width:22px;height:22px;border-radius:99px;background:#e5484d;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center}
.rm-in{display:flex;gap:6px;align-items:flex-end}
.rm-box{flex:1;min-width:0;display:flex;align-items:flex-end;gap:2px;background:var(--card);border-radius:24px;padding:3px 4px;box-shadow:0 1px 2px rgba(0,0,0,.12)}
.rm-box textarea{flex:1;min-width:0;resize:none;border:0!important;outline:0;background:transparent!important;box-shadow:none!important;min-height:42px!important;height:42px;max-height:140px;padding:10px 4px;line-height:1.4;font:inherit;font-size:15.5px;color:var(--ink)}
@media (max-width:860px){.rm-box textarea{font-size:16px}}
.rm-box .cx-ib{width:40px;height:40px;color:var(--mute)}.rm-box .cx-ib.on{color:var(--acc)}
.rm-send{all:unset;cursor:pointer;flex:none;width:48px;height:48px;border-radius:99px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}
.rm-send:active{transform:scale(.9)}.rm-send:focus-visible{outline:3px solid var(--acc);outline-offset:2px}.rm-send[disabled]{opacity:.6}
.rm-att{position:absolute;left:10px;bottom:70px;z-index:6;background:var(--card);border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,.22);padding:8px;display:grid;grid-template-columns:repeat(2,84px);gap:6px;animation:popIn .16s ease-out;transform-origin:0 100%}
.rm-att button{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:12px;font-size:12.5px;font-weight:700}
.rm-att button span{width:46px;height:46px;border-radius:99px;display:flex;align-items:center;justify-content:center;color:#fff}.rm-att button:hover{background:var(--th)}
@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
.rm-stk{background:var(--card);border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,.12);overflow:hidden;animation:fadeU .18s}
.stk-tabs{display:flex;gap:4px;overflow-x:auto;padding:6px 8px 0}.stk-tabs button{all:unset;cursor:pointer;white-space:nowrap;font-size:12.5px;font-weight:800;padding:6px 10px;border-radius:99px;color:var(--mute)}.stk-tabs button.on{background:var(--accS);color:var(--acc)}
.stk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:4px;padding:8px;max-height:min(230px,32vh);overflow-y:auto}
.stk-grid button{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:12px;padding:2px;min-height:70px}.stk-grid button:hover,.stk-grid button:focus-visible{background:var(--th)}
.stk-grid .pipi{animation:none!important}.stk-grid.uni{grid-template-columns:repeat(auto-fill,minmax(44px,1fr))}.stk-grid.uni button{font-size:26px;min-height:44px}
.rm-drop{display:none;position:absolute;inset:0;z-index:8;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:var(--acc);background:color-mix(in srgb,var(--accS) 88%,transparent);border:3px dashed var(--acc);pointer-events:none}
.rm.dragging .rm-drop{display:flex}
/* ---- foto sekali / dua kali lihat ---- */
.vo{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:10px;align-items:center;min-width:190px;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.06);margin-bottom:3px}
.vo .vi{width:30px;height:30px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid currentColor;color:var(--acc);font-weight:900}
.vo .vl{font-weight:800;font-size:14px}.vo.done,.vo.mine{cursor:default;opacity:.7}.vo.done .vi{color:var(--mute);border-style:dashed}
.vo:not([disabled]):hover{background:rgba(0,0,0,.1)}
.vo-t{all:unset;cursor:pointer;flex:none;width:72px;height:72px;border-radius:10px;border:2px dashed var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:10.5px;color:var(--mute);text-align:center}
.vo-t b{font-size:24px;line-height:1}.vo-t.on{border:2px solid var(--acc);color:var(--acc);background:var(--accS)}
.vo-view{position:fixed;inset:0;z-index:950;background:#000;display:flex;flex-direction:column;animation:fade .15s;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.vo-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 12px;color:#fff;font-weight:700;font-size:14px}.vo-top span{flex:1}
.vo-top button{all:unset;cursor:pointer;width:40px;height:40px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(255,255,255,.15)}
.vo-img{flex:1;display:flex;align-items:center;justify-content:center;min-height:0;padding:0 0 calc(12px + env(safe-area-inset-bottom,0px))}.vo-img img{max-width:100%;max-height:100%;object-fit:contain;pointer-events:none}
/* ---- menu pesan (ala WA) ---- */
.cm-ov{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.18);animation:fade .15s}
@keyframes fade{from{opacity:0}to{opacity:1}}
.cm-rx{position:fixed;z-index:902;display:flex;gap:2px;align-items:center;background:var(--card);border-radius:99px;padding:5px 6px;box-shadow:0 6px 24px rgba(0,0,0,.22);animation:popIn .18s cubic-bezier(.3,1.4,.5,1)}
.cm-rx button{all:unset;cursor:pointer;width:40px;height:40px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:26px;transition:transform .12s}
.cm-rx button:hover,.cm-rx button:focus-visible{background:var(--th);transform:scale(1.15)}.cm-rx button.on{background:var(--accS)}
.cm-rx .pl{font-size:20px;color:var(--mute);background:var(--th)}
.cm-menu{position:fixed;z-index:902;min-width:210px;max-width:min(280px,calc(100vw - 24px));background:var(--card);border-radius:14px;padding:6px 0;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:popIn .16s ease-out}
.cm-menu button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:14px;align-items:center;width:100%;padding:10px 18px;font-size:14.5px;color:var(--ink)}
.cm-menu button:hover,.cm-menu button:focus-visible{background:var(--th)}.cm-menu .ico{color:var(--mute)}
.cm-menu hr{border:0;border-top:1px solid var(--line);margin:4px 0}.cm-menu .danger,.cm-menu .danger .ico{color:#e5484d}
/* ---- lembar (sheet) ---- */
.sh-list{display:flex;flex-direction:column;max-height:min(60vh,520px);overflow-y:auto;margin:0 -8px}
.sh-it{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:12px;align-items:center;padding:9px 10px;border-radius:12px;width:100%}
.sh-it:hover,.sh-it:focus-visible{background:var(--th)}.sh-it .tx{flex:1;min-width:0}.sh-it .tx b{display:block;font-size:15px}.sh-it .tx span{display:block;font-size:12.5px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-it .ck{width:22px;height:22px;border-radius:99px;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;flex:none;transition:all .15s}.sh-it.on .ck{background:#25d366;border-color:#25d366}
.sh-it .bi{width:44px;height:44px;border-radius:99px;display:flex;align-items:center;justify-content:center;background:var(--acc);color:#fff;flex:none}
.wp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:8px}
.wp-grid button{all:unset;cursor:pointer;aspect-ratio:3/4;border-radius:12px;border:2px solid var(--line);background-size:cover;background-position:center;position:relative;display:flex;align-items:flex-end;justify-content:center;font-size:11px;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);padding-bottom:4px;box-sizing:border-box}
.wp-grid button.on{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc)}
.mem-row{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}.mem-row .tx{flex:1;min-width:0}.mem-row .tx b{display:block}.mem-row .tx span{font-size:12px;color:var(--mute)}
/* ---- layar penuh di HP ---- */
@media (max-width:860px){
 html.cx-full,html.cx-full body{overflow:hidden;height:100%;overscroll-behavior:none}
 html.cx-full header,html.cx-full #tabbar,html.cx-full aside#nav,html.cx-full .cx-fab,html.cx-full #status{display:none!important}
 html.cx-full .cx-room{display:flex;position:fixed;left:0;right:0;top:var(--vvt,0px);height:var(--vvh,100dvh);z-index:70;background:var(--bg);animation:roomIn .24s cubic-bezier(.2,.8,.2,1)}
 html.cx-full .rm-h{padding-top:calc(6px + env(safe-area-inset-top,0px))}
 @keyframes roomIn{from{transform:translateX(18%);opacity:.4}to{transform:none;opacity:1}}
 .cx-inbox{margin:-6px -4px 0}
}
@media (prefers-reduced-motion:reduce){.mb.ani,.rxp,.cm-rx,.cm-menu,.rm-att,.rm-typ.on,html.cx-full .cx-room{animation:none!important}.rm-typ i{animation:none}.tk *{transition:none!important}}
`;document.head.appendChild(css);

/* ---------- wallpaper ---------- */
const DOOD=(c)=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160' fill='none' stroke='${c}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M24 30c-4-6 4-12 8-5 4-7 12-1 8 5l-8 8z'/><circle cx='120' cy='26' r='7'/><path d='M117 26h6M120 23v6'/><path d='M70 70l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z'/><path d='M20 110c6-8 14-8 20 0'/><circle cx='26' cy='104' r='1.5'/><circle cx='34' cy='104' r='1.5'/><rect x='108' y='92' width='26' height='18' rx='4'/><path d='M114 92v-4h14v4'/><path d='M60 136c4-4 10-4 14 0s10 4 14 0'/><path d='M140 140l6-10 6 10z'/><circle cx='90' cy='30' r='3'/><path d='M45 60l6 3-6 3'/><path d='M130 60c0 6-8 6-8 0s8-6 8 0z'/></svg>`)}")`;
const WPS=[
 ["def",L("Bawaan","Default"),()=>({bg:"var(--bg)",img:DOOD("rgba(128,128,128,.13)"),bs:"160px"})],
 ["wa",L("Krem","Cream"),()=>({bg:"#efeae2",img:DOOD("rgba(120,100,70,.12)"),bs:"160px"})],
 ["night",L("Malam","Night"),()=>({bg:"#0b141a",img:DOOD("rgba(255,255,255,.06)"),bs:"160px"})],
 ["pink",L("Pink","Pink"),()=>({bg:"#ffe3ec",img:DOOD("rgba(220,60,110,.14)"),bs:"160px"})],
 ["sunset",L("Senja","Sunset"),()=>({bg:"#ff8f8f",img:"linear-gradient(165deg,#ffb88c,#ff7aa2 55%,#a77bff)",bs:"cover"})],
 ["ocean",L("Laut","Ocean"),()=>({bg:"#2193b0",img:"linear-gradient(165deg,#56ccf2,#2f80ed)",bs:"cover"})],
 ["mint",L("Mint","Mint"),()=>({bg:"#c9f3e3",img:"linear-gradient(165deg,#d4fc79,#96e6a1)",bs:"cover"})],
 ["lav",L("Lavender","Lavender"),()=>({bg:"#cdb4ff",img:"linear-gradient(165deg,#e0c3fc,#8ec5fc)",bs:"cover"})],
 ["space",L("Bintang","Stars"),()=>({bg:"#141e30",img:"radial-gradient(1.5px 1.5px at 20% 30%,#fff8,transparent),radial-gradient(1px 1px at 70% 60%,#fff6,transparent),radial-gradient(1.5px 1.5px at 40% 80%,#fff7,transparent),radial-gradient(1px 1px at 85% 15%,#fff8,transparent),linear-gradient(165deg,#243b55,#141e30)",bs:"180px 180px,140px 140px,200px 200px,160px 160px,cover"})],
 ["black",L("Hitam","Black"),()=>({bg:"#000",img:"none",bs:"auto"})],
 ["white",L("Putih","White"),()=>({bg:"#fff",img:"none",bs:"auto"})]];
const wpKey=()=>"ravi_wp_"+CH.me;
function wpGet(cid){const w=lsGet(wpKey(),{all:{t:"def"},per:{}});return (cid&&w.per&&w.per[cid])||w.all||{t:"def"}}
function wpDB(){return new Promise((res,rej)=>{const r=indexedDB.open("ravi-wp",1);r.onupgradeneeded=()=>r.result.createObjectStore("img");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function wpImg(id,val){try{const db=await wpDB();return await new Promise(res=>{const tx=db.transaction("img",val===undefined?"readonly":"readwrite"),st=tx.objectStore("img");
  if(val===undefined){const g=st.get(id);g.onsuccess=()=>res(g.result||null);g.onerror=()=>res(null)}else{st.put(val,id);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)}})}catch(e){return null}}
const wpUrls={};
async function applyWp(body,cid){const w=wpGet(cid);if(!body)return;
  if(w.t==="photo"){let u=wpUrls[w.id];if(!u){const b=await wpImg(w.id);if(b){u=wpUrls[w.id]=URL.createObjectURL(b)}}
    const dim=Math.max(0,Math.min(.8,w.dim??.15));body.style.setProperty("--rmBg","#000");
    body.style.backgroundImage=u?`linear-gradient(rgba(0,0,0,${dim}),rgba(0,0,0,${dim})),url("${u}")`:"none";body.style.setProperty("--rmBs","cover");body.style.backgroundAttachment="scroll";return}
  const p=(WPS.find(x=>x[0]===w.t)||WPS[0])[2]();body.style.setProperty("--rmBg",p.bg);body.style.backgroundImage=p.img;body.style.setProperty("--rmBs",p.bs);body.style.backgroundAttachment=""}

/* =====================================================================
   TAMPILAN: daftar chat
   ===================================================================== */
let filt="all";
function viewChat(v){
  R.withInit(v,"💬 Chat",()=>{init().then(()=>drawShell(v)).catch(()=>R.setupCard(v,"💬 Chat"))})}
function drawShell(v){
  const unN=window.RAVI_NOTIF_COUNT?window.RAVI_NOTIF_COUNT():0;
  v.innerHTML=`<div class="cx" id="cx">
    <section class="cx-inbox" aria-label="${L("Daftar chat","Chat list")}">
     <div class="cx-top"><h1>💬 Chat</h1>
      <button class="cx-ib" id="cxCalls" aria-label="${L("Log panggilan","Call log")}" title="${L("Log panggilan","Call log")}">${ic("call")}</button>
      <button class="cx-ib" id="cxBell" aria-label="${L("Notifikasi","Notifications")}" title="${L("Notifikasi","Notifications")}">${ic("bell")}<span class="bdg" hidden></span></button>
      ${R.S.members[CH.me]?.role==="admin"?`<button class="cx-ib" id="cxAdd" aria-label="${L("Tambah anggota","Add member")}" title="${L("Undang orang ke Talk&Talk","Invite someone to Talk&Talk")}">${ic("user")}<span class="bdg" style="background:#25d366">+</span></button>`:""}
      <button class="cx-ib" id="cxNew" aria-label="${L("Chat baru","New chat")}" title="${L("Chat baru","New chat")}">${ic("plus")}</button></div>
     <label class="cx-search">${ic("search",18)}<input id="cxQ" type="search" placeholder="${L("Cari chat atau orang","Search chats or people")}" autocomplete="off" aria-label="${L("Cari","Search")}"></label>
     <div class="cx-chips" role="tablist"><button data-f="all" class="${filt==="all"?"on":""}">${L("Semua","All")}</button><button data-f="unread" class="${filt==="unread"?"on":""}">${L("Belum dibaca","Unread")}</button><button data-f="group" class="${filt==="group"?"on":""}">${L("Grup","Groups")}</button></div>
     <div class="cx-notes" id="cxNotes"></div>
     <div class="cx-scroll" id="cxList" role="list" data-noi18n></div></section>
   <section class="cx-room" id="cxRoom" aria-label="${L("Percakapan","Conversation")}"><div class="cx-blank">${window.pipi?R.pipiM("happy",110,"vnel"):""}<p><b>Talk&Talk Chat</b><br>${L("Pilih chat di kiri, atau ketuk ＋ untuk chat baru / buat grup. Pesan terenkripsi end-to-end.","Pick a chat on the left, or tap ＋ to start a chat or a group. Messages are end-to-end encrypted.")}</p></div></section></div>
   <button class="cx-fab" id="cxFab" aria-label="${L("Chat baru","New chat")}">${ic("plus",26)}</button>`;
  const q=$$("#cxQ",v);q.value=CH.q;q.oninput=()=>{CH.q=q.value;paintInbox()};
  v.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{filt=b.dataset.f;v.querySelectorAll("[data-f]").forEach(x=>x.classList.toggle("on",x===b));paintInbox()});
  $$("#cxNew",v).onclick=$$("#cxFab",v).onclick=newChatSheet;const ad=$$("#cxAdd",v);if(ad)ad.onclick=()=>window.RAVI_INVITE?window.RAVI_INVITE():addMemberSheet();
  document.documentElement.classList.add("cx-desk");
  $$("#cxBell",v).onclick=()=>go("notif");$$("#cxCalls",v).onclick=()=>{window.RAVI_NOTIF_TAB="calls";go("notif")};
  paintInbox();paintNotes();paintBell();
  if(CH.open&&CH.convs.has(CH.open))drawRoom(CH.open,true);
  else if(!mobile()){const first=[...CH.convs.values()].sort((a,b)=>Date.parse(b.at||0)-Date.parse(a.at||0))[0];if(first)openRoom(first.id,{noHist:true})}}
function paintBell(){const n=window.RAVI_NOTIF_COUNT?window.RAVI_NOTIF_COUNT():0;const r=document.getElementById("rlNf");if(r){r.hidden=!n;r.textContent=n>9?"9+":n}const b=$$("#cxBell .bdg");if(!b)return;b.hidden=!n;b.textContent=n>9?"9+":n}
document.addEventListener("ravi-notif",paintBell);
function paintNotes(){const box=$$("#cxNotes");if(!box)return;box.innerHTML="";
  const st=E2()?E2().state():"err";
  if(window.RAVI_PUSH_BANNER)window.RAVI_PUSH_BANNER(box)}
function convSorted(){return [...CH.convs.values()].sort((a,b)=>Date.parse(b.at||0)-Date.parse(a.at||0))}
function paintInbox(){const box=$$("#cxList");if(!box)return;const term=CH.q.trim().toLowerCase();
  let list=convSorted().filter(c=>filt==="all"||filt==="unread"&&c.unread||filt==="group"&&c.kind==="group");
  if(term)list=list.filter(c=>title(c).toLowerCase().includes(term));
  let html=list.map(c=>{const u=peer(c),ty=typers(c.id),on=u&&PR()&&PR().online(u),last=c.last,mine=last&&last.sender===CH.me;
    return `<button class="cx-it${CH.open===c.id&&!mobile()?" on":""}${c.unread?" un":""}" data-c="${c.id}" role="listitem"><span class="avw">${convAv(c,50)}${u?`<span class="dot${on?" on":""}"></span>`:""}</span>
      <span class="cx-mid"><span class="cx-r1"><b></b><span class="tm">${last?shortTime(last.created_at):""}</span></span>
      <span class="cx-r2"><span class="sn${ty.length?" ty":""}">${!ty.length&&mine?TICK:""}<span class="st"></span></span>${c.unread?`<span class="ub">${c.unread>99?"99+":c.unread}</span>`:""}</span></span></button>`}).join("");
  /* orang yang belum pernah di-chat (saat mencari) */
  if(term){const have=new Set([...CH.convs.values()].filter(c=>c.kind==="dm").map(peer));
    const ppl=Object.keys(R.S.members).filter(u=>u!==CH.me&&!have.has(u)&&R.name(u).toLowerCase().includes(term));
    if(ppl.length)html+=`<div class="crumb" style="padding:10px 16px 4px;font-weight:800">${L("Kontak","Contacts")}</div>`+ppl.map(u=>`<button class="cx-it" data-u="${u}"><span class="avw">${R.avatar(u,50)}</span><span class="cx-mid"><span class="cx-r1"><b>${esc(R.name(u))}</b></span><span class="cx-r2"><span class="sn">${L("Ketuk untuk mulai chat","Tap to start chatting")}</span></span></span></button>`).join("")}
  box.innerHTML=html||`<div class="cx-empty">${term?L("Tidak ada yang cocok.","No matches."):filt!=="all"?L("Tidak ada chat di sini.","No chats here."):L("Belum ada chat. Ketuk ＋ untuk mulai.","No chats yet. Tap ＋ to start.")}</div>`;
  box.querySelectorAll("[data-c]").forEach(b=>{const c=CH.convs.get(b.dataset.c);b.querySelector(".cx-r1 b").textContent=title(c);
    const ty=typers(c.id),sn=b.querySelector(".st");
    if(ty.length)sn.textContent=c.kind==="group"?R.name(ty[0])+L(" mengetik…"," is typing…"):L("mengetik…","typing…");
    else if(c.last){const pre=c.kind==="group"&&c.last.sender!==CH.me?R.name(c.last.sender)+": ":"";sn.textContent=pre+snip(c.last)}
    else sn.textContent=c.kind==="group"?L("Grup dibuat","Group created"):L("Belum ada pesan","No messages yet");
    const tk=b.querySelector(".tk");if(tk)tk.dataset.s=tickState(c.last,c);
    b.onclick=()=>openRoom(c.id)});
  box.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>openDM(b.dataset.u));
  const fab=$$("#cxFab");if(fab)fab.style.display=CH.open&&mobile()?"none":""}
document.addEventListener("ravi-presence",()=>{paintInbox();if(CH.open)paintHead()});
document.addEventListener("ravi-e2e",()=>{if(route!=="chat")return;paintInbox();paintNotes();if(CH.open){repaintPending();paintNote();const l=$$("#rmList");if(l)fillMedia(l)}});

/* =====================================================================
   TAMPILAN: ruang chat
   ===================================================================== */
async function openDM(u){try{const {data,error}=await sb.rpc("ravi_dm",{other:u});if(error)throw error;await loadInbox();openRoom(data)}catch(e){status(L("Gagal membuka chat: ","Couldn't open chat: ")+(e.message||e),"err")}}
function openRoom(cid,o={}){{const w=document.getElementById("qrWin");if(w&&w.dataset.c===String(cid))qrClose()}if(!CH.convs.has(cid))return;
  if(route!=="chat"){CH.open=cid;go("chat");return}
  if(CH.open&&CH.open!==cid){saveDraft();sendTyping(CH.open,false)}
  CH.open=cid;CH.reply=null;CH.stkOpen=false;CH.below=0;
  if(PR())PR().setConv(cid);
  if(mobile()){document.documentElement.classList.add("cx-full");vv();if(!o.noHist&&!(history.state&&history.state.cx))history.pushState({cx:cid},"")}
  drawRoom(cid,false);paintInbox()}
function closeRoom(fromPop){if(!CH.open)return;saveDraft();sendTyping(CH.open,false);CH.open=null;if(PR())PR().setConv(null);
  document.documentElement.classList.remove("cx-full");
  if(!fromPop&&history.state&&history.state.cx)history.back();
  const room=$$("#cxRoom");if(room&&mobile())room.innerHTML="";paintInbox()}
addEventListener("popstate",()=>{if(CH.open&&mobile())closeRoom(true)});
function vv(){const v=window.visualViewport,h=document.documentElement;if(!v){h.style.removeProperty("--vvh");return}
  h.style.setProperty("--vvh",v.height+"px");h.style.setProperty("--vvt",v.offsetTop+"px")}
if(window.visualViewport){const f=()=>{if(!document.documentElement.classList.contains("cx-full"))return;const wasBottom=CH.atBottom;vv();if(wasBottom)toBottom(false)};visualViewport.addEventListener("resize",f);visualViewport.addEventListener("scroll",f)}
function saveDraft(){const t=$$("#rmTxt");if(t&&CH.open)CH.drafts.set(CH.open,t.value)}

function drawRoom(cid,keep){const room=$$("#cxRoom");if(!room)return;const c=CH.convs.get(cid);
  room.innerHTML=`<div class="rm" id="rm">
   <div class="rm-h"><button class="cx-ib" id="rmBack" aria-label="${L("Kembali","Back")}">${ic("back")}</button><span class="avw" id="rmAv"></span>
    <div class="rm-t" id="rmT"><b></b><span class="rm-s"></span></div>
    ${c.kind==="dm"?`<button class="cx-ib" id="rmVid" aria-label="${L("Video call","Video call")}">${ic("video")}</button><button class="cx-ib" id="rmCall" aria-label="${L("Telepon","Voice call")}">${ic("phone")}</button>`:""}
    <button class="cx-ib" id="rmMore" aria-label="${L("Menu lainnya","More options")}">${ic("more")}</button></div>
   <div id="rmPin"></div><div id="rmNote"></div>
   <div class="rm-body" id="rmBody"><div class="rm-list" id="rmList" role="log" aria-live="polite" data-noi18n><div class="crumb" style="margin:auto">${L("Memuat…","Loading…")}</div></div></div>
   <button class="rm-fab" id="rmFab" aria-label="${L("Ke pesan terbaru","Jump to latest")}">${ic("down")}<span class="n"></span></button>
   <div class="rm-drop" aria-hidden="true">📥 ${L("Lepas untuk mengirim","Drop to send")}</div>
   <div class="rm-foot" id="rmFoot"><div id="rmRp"></div><div id="rmTray"></div>
    <div class="rm-in"><div class="rm-box"><button class="cx-ib" id="rmStk" aria-label="${L("Stiker & emoji","Stickers & emoji")}" aria-expanded="false">${ic("smile")}</button>
      <textarea id="rmTxt" rows="1" placeholder="${L("Ketik pesan","Message")}" aria-label="${L("Pesan","Message")}" enterkeyhint="send"></textarea>
      <button class="cx-ib" id="rmAtt" aria-label="${L("Lampirkan","Attach")}">${ic("clip")}</button></div>
     <button class="rm-send" id="rmSend" aria-label="${L("Kirim","Send")}">${ic("send")}</button></div><div id="rmStkP"></div></div>
   <input type="file" id="rmFile" accept="image/*,video/*" multiple hidden><input type="file" id="rmAny" multiple hidden></div>`;
  paintHead();paintPin();paintNote();applyWp($$("#rmBody"),cid);
  const st=CH.msgs.get(cid);
  if(st&&st.loaded)renderAll(cid,true);else loadMsgs(cid).then(()=>{if(CH.open===cid)renderAll(cid,true)}).catch(e=>{const l=$$("#rmList");if(l)l.innerHTML=`<div class="msg err" style="margin:auto">${esc(e.message||String(e))}</div>`});
  wireRoom(cid)}
function paintHead(){const c=CH.convs.get(CH.open);if(!c)return;const t=$$("#rmT");if(!t)return;
  t.querySelector("b").textContent=title(c);const s=t.querySelector(".rm-s"),ty=typers(c.id);const u=peer(c);
  const av=$$("#rmAv");if(av&&!av.dataset.k){av.innerHTML=convAv(c,40)+(u?`<span class="dot"></span>`:"");av.dataset.k="1"}
  const dot=av&&av.querySelector(".dot");if(dot)dot.classList.toggle("on",!!(u&&PR()&&PR().online(u)));
  s.classList.toggle("ty",!!ty.length);
  if(ty.length)s.textContent=c.kind==="group"?ty.map(R.name).join(", ")+L(" mengetik…"," typing…"):L("mengetik…","typing…");
  else if(c.kind==="group"){const ms=active(c);const on=ms.filter(x=>x.u!==CH.me&&PR()&&PR().online(x.u));s.textContent=ms.map(x=>x.u===CH.me?L("Kamu","You"):R.name(x.u)).join(", ")+(on.length?" · "+on.length+" online":"")}
  else s.textContent=PR()&&PR().online(u)?"online":lastSeenTxt(R.S.members[u]&&R.S.members[u].last_seen)}
function paintPin(){const box=$$("#rmPin");if(!box)return;const c=CH.convs.get(CH.open);box.innerHTML="";if(!c||!c.pinned_msg)return;
  const st=CH.msgs.get(c.id),m=st&&st.list.find(x=>x.id===c.pinned_msg);
  const d=document.createElement("div");d.className="rm-pin";d.innerHTML=`${ic("pin",16)}<span></span>`;d.querySelector("span").textContent=m?snip(m):L("Pesan disematkan","Pinned message");
  d.onclick=()=>jumpTo(c.pinned_msg);box.appendChild(d);
  if(!m)sb.from("couple_msgs").select("*").eq("id",c.pinned_msg).maybeSingle().then(({data})=>{if(data&&box.isConnected)d.querySelector("span").textContent=snip(data)},()=>{})}
/* enkripsi berjalan otomatis di belakang layar — tidak ada banner. Satu-satunya catatan: chat pribadi dengan orang yang belum berteman */
function paintNote(){const box=$$("#rmNote");if(!box)return;box.innerHTML="";const c=CH.convs.get(CH.open);if(!c||c.kind!=="dm"||!R.friendState)return;const u=peer(c);if(!u)return;const st=R.friendState(u);if(st==="friend")return;
  const d=document.createElement("div");d.className="rm-note";
  d.innerHTML=`<span>👋</span><div><b>${L("Kalian belum berteman","You're not friends")}</b>${st==="in"?L("Dia mengirim permintaan pertemanan.","They sent you a friend request."):st==="out"?L("Menunggu dia menerima permintaanmu.","Waiting for them to accept."):L("Pesan baru bisa dikirim setelah berteman.","You can message once you're friends.")}</div>${st==="in"?`<button class="sm pri" data-fa="accept">${L("Terima","Accept")}</button>`:st==="none"?`<button class="sm pri" data-fa="request">＋ ${L("Tambah teman","Add friend")}</button>`:""}`;
  box.appendChild(d);const b=d.querySelector("[data-fa]");if(b)b.onclick=async()=>{b.disabled=true;try{await R.friendAct(u,b.dataset.fa);paintNote()}catch(e){b.disabled=false;status(e.message||String(e),"err")}}}
document.addEventListener("ravi-friends",()=>{try{paintNote()}catch(e){}});
document.addEventListener("click",e=>{const m=e.target.closest&&e.target.closest(".mb");if(!m||!E2())return;const st=E2().state();
  if((st==="needpw"||st==="nokey")&&/🔒/.test(m.textContent||"")&&E2().autoUnlock)E2().autoUnlock({ask:true})});

/* ---------- gambar pesan ---------- */
const sysTop=c=>`<div class="rm-sys y" id="rmE2">🔐 ${L("Pesan, foto & panggilan dienkripsi. Isinya tidak bisa dibaca dari database tanpa akses akun Talk&Talk. Ketuk untuk kode keamanan.","Messages, photos and calls are encrypted. They can't be read from the database without Talk&Talk account access. Tap for the security code.")}</div>`;
function renderAll(cid,scroll){const list=$$("#rmList");if(!list)return;const st=CH.msgs.get(cid),c=CH.convs.get(cid);
  const voIds=st.list.filter(m=>m.img&&!CH.views.has(m.id)&&R.parse(R.pt(m.body)).vo).map(m=>m.id);if(voIds.length)loadViews(voIds).then(()=>{if(CH.open===cid)voIds.forEach(id=>{const m=st.list.find(x=>x.id===id);if(m)patchBubble(m)})}).catch(()=>{});
  const msgs=st.list.filter(m=>!CH.hidden.has(m.id));const fr=document.createDocumentFragment();
  const top=document.createElement("div");top.id="rmTop";top.innerHTML=st.more?`<div class="crumb" style="text-align:center;padding:8px">…</div>`:sysTop(c);fr.appendChild(top);
  const me=myMem(c),unreadFrom=c.unread>0?Date.parse(me.rd||0):null;let lastDay="",prev=null,unrPut=false;
  for(const m of msgs){const dk=dayKey(m.created_at);if(dk!==lastDay){fr.appendChild(dayEl(m.created_at));lastDay=dk;prev=null}
    if(unreadFrom!==null&&!unrPut&&m.sender!==CH.me&&Date.parse(m.created_at)>unreadFrom){const u=document.createElement("div");u.className="unr";u.id="rmUnr";u.textContent=c.unread+L(" pesan belum dibaca"," unread messages");fr.appendChild(u);unrPut=true}
    fr.appendChild(bubble(m,c,prev));prev=m}
  const ty=document.createElement("div");ty.className="rm-typ";ty.id="rmTyp";ty.innerHTML="<i></i><i></i><i></i><small></small>";fr.appendChild(ty);
  list.replaceChildren(fr);R.fillCaps(list);fillMedia(list);paintTyping(cid);
  const e2=$$("#rmE2");if(e2)e2.onclick=()=>{const u=peer(c);if(u)E2()&&E2().safetyDialog(u,R.name(u));else groupInfo(c)};
  if(scroll){const un=$$("#rmUnr");if(un){un.scrollIntoView({block:"center"});CH.atBottom=false}else toBottom(false)}
  markRead(cid)}
function dayEl(t){const d=document.createElement("div");d.className="dy";d.dataset.d=dayKey(t);d.textContent=dayLbl(t);return d}
const contOf=(m,prev)=>prev&&prev.sender===m.sender&&!callRe.test(R.parse(R.pt(prev.body)).t||"")&&Date.parse(m.created_at)-Date.parse(prev.created_at)<5*60e3;
function bubble(m,c,prev){const o=R.parse(R.pt(m.body)),cm=callRe.exec(o.t||"");
  if(cm)return callPill(m,cm);
  const el=document.createElement("div");el.id="m"+m.id;el.dataset.id=m.id;fillBubble(el,m,c,o,contOf(m,prev));wireBubble(el);return el}
function callPill(m,cm){const el=document.createElement("div");const mine=m.sender===CH.me,kind=cm[3],dur=+cm[2],video=cm[1]==="video";
  el.className="cl-pill"+(kind==="done"?"":" miss");el.id="m"+m.id;el.dataset.id=m.id;el.dataset.call="1";
  const t=kind==="done"?(video?L("Video call","Video call"):L("Panggilan suara","Voice call")):kind==="declined"?L("Panggilan ditolak","Call declined"):mine?L("Tidak dijawab","No answer"):L("Panggilan tak terjawab","Missed call");
  el.innerHTML=`<span class="i">${ic(video?"video":"phone",18)}</span><div><b></b><span>${kind==="done"?Math.floor(dur/60)+":"+String(dur%60).padStart(2,"0")+" · ":""}${hhmm(m.created_at)}</span></div>${peer(CH.convs.get(m.conv_id))?`<button>${L("Telepon","Call")}</button>`:""}`;
  el.querySelector("b").textContent=(mine?"↗ ":"↙ ")+t;const b=el.querySelector("button");if(b)b.onclick=()=>startCall(video);return el}
function sigOf(m,c,o){return [o.t,m.img||"",JSON.stringify(m.reacts||{}),CH.stars.has(m.id)?1:0,c.kind,o.vo?JSON.stringify(CH.views.get(m.id)||{}):""].join("\u0001")}
/* foto sekali/dua kali lihat */
const myViews=m=>((CH.views.get(m.id)||{})[CH.me])||0;
function voDone(m,c,o){if(m.sender===CH.me){const os=others(c);return os.length>0&&os.every(x=>((CH.views.get(m.id)||{})[x.u]||0)>=o.vo)}return myViews(m)>=o.vo}
function voHTML(m,c,o){const mine=m.sender===CH.me,done=voDone(m,c,o),left=Math.max(0,o.vo-myViews(m));
  const lbl=mine?(done?L("Dibuka","Opened"):L("Foto ","Photo ")+(o.vo===1?L("sekali lihat","view once"):L("dua kali lihat","view twice"))):done?L("Dibuka","Opened"):L("Foto","Photo")+(o.vo===2&&left===1?L(" · sisa 1×"," · 1 view left"):"");
  return `<button class="vo${done?" done":""}${mine?" mine":""}" data-vo${mine||done?" disabled":""}><span class="vi">${o.vo===1?"①":"②"}</span><span class="vl">${esc(lbl)}</span></button>`}
function cleanupVO(m){if(m.sender!==CH.me||!m.img)return;const c=CH.convs.get(m.conv_id),o=R.parse(R.pt(m.body));if(!o.vo||!c||!voDone(m,c,o))return;
  const k="ravi_vo_rm";const done=lsGet(k,[]);if(done.includes(m.id))return;done.push(m.id);lsSet(k,done.slice(-500));sb.storage.from("couple").remove([m.img]).catch(()=>{})}
async function loadViews(ids){ids=ids.filter(id=>id>0);if(!ids.length)return;const {data}=await sb.from("couple_msg_views").select("msg_id,user_id,views").in("msg_id",ids);
  (data||[]).forEach(v=>{const x=CH.views.get(v.msg_id)||{};x[v.user_id]=v.views;CH.views.set(v.msg_id,x)})}
async function openVO(m,el){const o=R.parse(R.pt(m.body));if(!o.vo||m.sender===CH.me||voDone(m,CH.convs.get(m.conv_id),o))return;
  let n;try{const {data,error}=await sb.rpc("ravi_view",{m:m.id});if(error)throw error;n=data}catch(e){status(e.message||String(e),"err");return}
  const x=CH.views.get(m.id)||{};x[CH.me]=n;CH.views.set(m.id,x);
  if(n>o.vo){patchBubble(m);status(L("Foto ini sudah dibuka.","This photo was already opened."),"warn");return}
  const ov=document.createElement("div");ov.className="vo-view";ov.innerHTML=`<div class="vo-top"><span>${o.vo===1?"①":"②"} ${esc(R.name(m.sender))} · ${o.vo===1?L("Foto sekali lihat","View-once photo"):n>=o.vo?L("Terakhir kali dilihat","Last view"):L("Masih bisa dilihat 1× lagi","1 more view left")}</span><button aria-label="${L("Tutup","Close")}">✕</button></div><div class="vo-img"><div class="crumb" style="color:#fff">${L("Membuka…","Opening…")}</div></div>`;
  document.body.appendChild(ov);let url=null;const close=()=>{ov.remove();if(url)URL.revokeObjectURL(url);patchBubble(m)};
  ov.querySelector(".vo-top button").onclick=close;ov.addEventListener("contextmenu",e=>e.preventDefault());addEventListener("keydown",function k(e){if(e.key==="Escape"){close();removeEventListener("keydown",k)}});
  try{const u=(await R.urlsFor([m.img]))(m.img);const r=await fetch(u);const buf=await r.arrayBuffer();const plain=/\.enc$/.test(m.img)?await window.RAVI_E2E_DEC(buf,o.ik):new Uint8Array(buf);
    url=URL.createObjectURL(new Blob([plain],{type:"image/jpeg"}));const im=document.createElement("img");im.src=url;im.draggable=false;im.alt="";ov.querySelector(".vo-img").replaceChildren(im)}
  catch(e){ov.querySelector(".vo-img").innerHTML=`<div class="crumb" style="color:#fff">${L("Gagal membuka foto.","Couldn't open photo.")}</div>`}}
function fillBubble(el,m,c,o,cont){const mine=m.sender===CH.me,stk=R.isStk(o.t)&&!o.r&&!o.f;
  const onlyImg=m.img&&!o.vo&&!o.t&&!o.r&&!o.f&&!o.fwd;
  el.className="mb "+(mine?"me":"them")+(cont?" cont":"")+(stk?" stk":"")+(onlyImg?" only-img":"");
  const rx=Object.entries(m.reacts||{});const grp=c.kind==="group"&&!mine&&!cont;
  el.innerHTML=`<div class="bb">${grp?`<b class="who" style="color:${nameColor(m.sender)}"></b>`:""}${o.fwd?`<span class="fw">${ic("fwd",14)} ${L("Diteruskan","Forwarded")}</span>`:""}${o.r?`<button class="q" data-jump="${+o.r.id||0}"><b></b><span></span></button>`:""}${m.img&&o.vo?voHTML(m,c,o):m.img?`<img class="ph" data-img="${esc(m.img)}" alt="${L("Foto","Photo")}">`:""}${o.f?`<div class="fl"><span class="fi">${R.fIcon(o.f.m)}</span><div class="fm"><b></b><span>${R.fmtSize(o.f.s||0)}</span></div><button data-open aria-label="${L("Buka","Open")}">${/^video\//.test(o.f.m)?"▶":/^image\//.test(o.f.m)?"👁":"⬇"}</button></div><div class="md"></div>`:""}${o.sg||o.loc?mediaCard(o):""}${stk?`<span class="stk-w" data-stk="${R.stkKey(o.t)}">${R.stkSVG(R.stkKey(o.t),132)}</span>`:o.t?`<span class="tx"></span>`:""}<span class="meta">${CH.stars.has(m.id)?`<span class="st">⭐</span>`:""}<span class="tm">${hhmm(m.created_at)}</span>${mine?TICK:""}</span></div>${rx.length?rxPill(rx):""}<button class="chev" tabindex="-1" aria-hidden="true">${ic("down",16)}</button>`;
  if(grp)el.querySelector(".who").textContent=R.name(m.sender);
  const tx=el.querySelector(".tx");if(tx)tx.textContent=o.t;if(o.sg||o.loc)wireMedia(el,o);
  const q=el.querySelector(".q");if(q&&o.r){q.querySelector("b").textContent=o.r.w||"";q.querySelector("span").textContent=o.r.s||"";if(o.r.u)q.style.setProperty("--qc",nameColor(o.r.u))}
  const fn=el.querySelector(".fl .fm b");if(fn)fn.textContent=o.f.n;
  const tk=el.querySelector(".tk");if(tk)tk.dataset.s=tickState(m,c);
  el.dataset.sig=sigOf(m,c,o)}
function rxPill(rx){const vals=rx.map(x=>x[1]);const uniq=[...new Set(vals)].slice(0,3);return `<span class="rxp" data-rx>${uniq.map(R.rxHTML).join("")}${vals.length>1?`<small>${vals.length}</small>`:""}</span>`}
function fillMedia(root){const ik={};const st=CH.msgs.get(CH.open);if(st)st.list.forEach(m=>{if(m.img)ik[m.img]=R.ikOf(m.img,m.body)});
  R.fillImgs(root,p=>ik[p]).then(()=>{root.querySelectorAll("img.ph").forEach(i=>{if(!i.dataset.w){i.dataset.w=1;i.addEventListener("load",()=>{if(CH.atBottom)toBottom(false)})}})})}
function appendBubble(m,ani){const list=$$("#rmList");if(!list)return;const c=CH.convs.get(m.conv_id),st=CH.msgs.get(m.conv_id);
  const idx=st.list.findIndex(x=>x.id===m.id),prev=st.list.slice(0,idx).reverse().find(x=>!CH.hidden.has(x.id));
  const ty=$$("#rmTyp");const lastDay=[...list.querySelectorAll(".dy")].pop();
  if(!lastDay||lastDay.dataset.d!==dayKey(m.created_at))list.insertBefore(dayEl(m.created_at),ty);
  const el=bubble(m,c,prev&&lastDay&&dayKey(prev.created_at)===dayKey(m.created_at)?prev:null);if(ani)el.classList.add("ani");
  el.addEventListener("animationend",()=>el.classList.remove("ani"),{once:true});
  list.insertBefore(el,ty);R.fillCaps(el);fillMedia(el);
  const mine=m.sender===CH.me;if(CH.atBottom||mine)toBottom(true);else{CH.below++;paintFab()}}
function patchBubble(m){const el=document.getElementById("m"+m.id);if(!el||el.dataset.call)return;const c=CH.convs.get(m.conv_id),o=R.parse(R.pt(m.body));
  const s=sigOf(m,c,o);if(el.dataset.sig===s){const tk=el.querySelector(".tk");if(tk)tk.dataset.s=tickState(m,c);return}
  const imgOld=el.querySelector("img.ph");const src=imgOld&&imgOld.getAttribute("src");
  fillBubble(el,m,c,o,el.classList.contains("cont"));const im=el.querySelector("img.ph");if(im&&src){im.src=src;im.dataset.done="1"}
  R.fillCaps(el);fillMedia(el)}
function removeBubble(id){const el=document.getElementById("m"+id);if(!el)return;el.classList.add("out");setTimeout(()=>el.remove(),230)}
function paintTicks(){const c=CH.convs.get(CH.open),st=c&&CH.msgs.get(c.id);if(!st)return;
  for(const m of st.list){if(m.sender!==CH.me)continue;const tk=document.querySelector("#m"+CSS.escape(String(m.id))+" .tk");if(tk){const s=tickState(m,c);if(tk.dataset.s!==s)tk.dataset.s=s}}}
function repaintPending(){const st=CH.msgs.get(CH.open);if(!st)return;for(const m of st.list){const el=document.getElementById("m"+m.id);if(!el)continue;
  if(el.dataset.call===undefined&&(el.dataset.sig||"").match(/^(…|🔒)/)){const o=R.parse(R.pt(m.body));if(callRe.test(o.t||"")){el.replaceWith(callPill(m,callRe.exec(o.t)))}else patchBubble(m)}}
  const pin=$$("#rmPin span");if(pin)paintPin()}
function paintTyping(cid){if(route==="chat")paintInbox();if(CH.open!==cid)return;paintHead();const t=$$("#rmTyp");if(!t)return;const ty=typers(cid);
  const was=t.classList.contains("on");t.classList.toggle("on",!!ty.length);const c=CH.convs.get(cid);t.querySelector("small").textContent=ty.length&&c.kind==="group"?R.name(ty[0]):"";
  if(ty.length&&!was&&CH.atBottom)toBottom(true)}
function paintFab(){const f=$$("#rmFab");if(!f)return;f.classList.toggle("on",!CH.atBottom);f.querySelector(".n").textContent=CH.below?String(CH.below):""}
function toBottom(smooth){const b=$$("#rmBody");if(!b)return;CH.atBottom=true;CH.below=0;paintFab();
  if(smooth&&!matchMedia("(prefers-reduced-motion:reduce)").matches)b.scrollTo({top:b.scrollHeight,behavior:"smooth"});else b.scrollTop=b.scrollHeight}
async function jumpTo(id,tries){const el=document.getElementById("m"+id);
  if(el){el.scrollIntoView({block:"center",behavior:"smooth"});el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1400);return}
  const st=CH.msgs.get(CH.open);if(!st||!st.more||(tries||0)>8){status(L("Pesan aslinya sudah tidak ada.","The original message is gone."),"warn");return}
  await older();setTimeout(()=>jumpTo(id,(tries||0)+1),60)}
async function older(){const cid=CH.open,st=CH.msgs.get(cid);if(!st||!st.more||st.loading)return;const first=st.list.find(m=>m.id>0);if(!first)return;
  const body=$$("#rmBody"),h0=body.scrollHeight,t0=body.scrollTop;const add=await loadMsgs(cid,first.id);if(CH.open!==cid||!add.length&&st.more)return;
  renderAll(cid,false);body.scrollTop=body.scrollHeight-h0+t0}

/* ---------- interaksi ruang ---------- */
function wireRoom(cid){const c=CH.convs.get(cid),body=$$("#rmBody"),t=$$("#rmTxt"),room=$$("#rm");
  $$("#rmBack").onclick=()=>{if(mobile())closeRoom();else{CH.open=null;drawShell($$("#view"))}};
  $$("#rmT").onclick=$$("#rmAv").onclick=()=>c.kind==="group"?groupInfo(c):contactInfo(peer(c));
  const v=$$("#rmVid"),p=$$("#rmCall");{const pu=peer(CH.convs.get(CH.open));if(v&&pu&&!(R.isPartner(CH.me)&&R.isPartner(pu)))v.remove();else if(v)v.onclick=()=>startCall(true)}if(p)p.onclick=()=>startCall(false);
  $$("#rmMore").onclick=e=>roomMenu(e.currentTarget,c);
  $$("#rmFab").onclick=()=>toBottom(true);
  let sT=0;body.addEventListener("scroll",()=>{const ab=body.scrollHeight-body.scrollTop-body.clientHeight<70;if(ab!==CH.atBottom){CH.atBottom=ab;if(ab)CH.below=0;paintFab()}
    if(body.scrollTop<120){clearTimeout(sT);sT=setTimeout(older,80)}},{passive:true});
  /* ketik */
  t.value=CH.drafts.get(cid)||"";const grow=()=>{t.style.height="auto";t.style.height=Math.min(140,t.scrollHeight)+"px"};grow();
  if(!mobile())setTimeout(()=>t.focus({preventScroll:true}),30);
  t.oninput=()=>{grow();sendTyping(cid,!!t.value.trim())};t.onblur=()=>sendTyping(cid,false);
  t.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey&&matchMedia("(hover:hover) and (pointer:fine)").matches){e.preventDefault();send()}if(e.key==="Escape"){if(CH.reply){CH.reply=null;paintReply()}else if(!mobile()){}}};
  t.addEventListener("focus",()=>{if(CH.stkOpen){CH.stkOpen=false;paintStk()}setTimeout(()=>{if(CH.atBottom)toBottom(false)},250)});
  t.addEventListener("paste",e=>{const fs=[...(e.clipboardData?.files||[])];if(!fs.length){fs.push(...[...(e.clipboardData?.items||[])].filter(x=>x.kind==="file").map(x=>x.getAsFile()).filter(Boolean))}if(fs.length){e.preventDefault();addTray(fs)}});
  let dz=0;room.addEventListener("dragenter",e=>{if([...(e.dataTransfer?.types||[])].includes("Files")){e.preventDefault();dz++;room.classList.add("dragging")}});
  room.addEventListener("dragover",e=>{if([...(e.dataTransfer?.types||[])].includes("Files"))e.preventDefault()});
  room.addEventListener("dragleave",()=>{dz=Math.max(0,dz-1);if(!dz)room.classList.remove("dragging")});
  room.addEventListener("drop",e=>{e.preventDefault();dz=0;room.classList.remove("dragging");const fs=[...(e.dataTransfer?.files||[])];if(fs.length)addTray(fs)});
  $$("#rmSend").onclick=send;
  $$("#rmStk").onclick=()=>{CH.stkOpen=!CH.stkOpen;paintStk();if(CH.stkOpen)t.blur()};
  $$("#rmAtt").onclick=e=>attMenu(e.currentTarget);
  $$("#rmFile").onchange=e=>{const fs=[...e.target.files];e.target.value="";if(fs.length)addTray(fs)};
  $$("#rmAny").onchange=e=>{const fs=[...e.target.files];e.target.value="";if(fs.length)addTray(fs)};
  paintReply();paintTray();paintStk();
  async function send(){const body=t.value.trim();if(!body&&!CH.tray.length)return;t.value="";grow();CH.drafts.delete(cid);sendTyping(cid,false);
    const r=CH.reply?{...CH.reply}:null;CH.reply=null;paintReply();
    if(CH.tray.length){const items=CH.tray.splice(0);items.forEach(it=>{if(R.isPhoto(it.file))it.vo=CH.vo});CH.vo=0;paintTray();let cap=CH.vo?"":body;for(const it of items){await sendFile(cid,it,it.vo?"":cap,r);if(!it.vo)cap=""}if(cap&&items.every(x=>x.vo))sendBody(cid,{t:cap});return}
    sendBody(cid,{t:body,r})}}
function attMenu(btn){const old=$$(".rm-att");if(old){old.remove();return}const rm=$$("#rm");const d=document.createElement("div");d.className="rm-att";
  d.innerHTML=`<button data-a="img"><span style="background:#7f66ff">${ic("img")}</span>${L("Foto & video","Photos & videos")}</button><button data-a="file"><span style="background:#5157ae">${ic("file")}</span>${L("Dokumen","Document")}</button><button data-a="song"><span style="background:#1db954;font-size:19px">🎵</span>${L("Lagu","Song")}</button><button data-a="loc"><span style="background:#1fa855;font-size:19px">📍</span>${L("Lokasi","Location")}</button>`;
  rm.appendChild(d);const close=e=>{if(!d.contains(e.target)&&e.target!==btn){d.remove();document.removeEventListener("pointerdown",close,true)}};setTimeout(()=>document.addEventListener("pointerdown",close,true),0);
  d.querySelector('[data-a="img"]').onclick=()=>{d.remove();$$("#rmFile").click()};d.querySelector('[data-a="file"]').onclick=()=>{d.remove();$$("#rmAny").click()};
  d.querySelector('[data-a="song"]').onclick=()=>{d.remove();songSheet(CH.open)};d.querySelector('[data-a="loc"]').onclick=()=>{d.remove();locSheet(CH.open)}}
/* ---------- bagikan lagu ---------- */
function songSheet(cid){if(!cid)return;const me=R.S.members[CH.me]||{},cur=me.song;
  const bg=modal("🎵 "+L("Bagikan lagu","Share a song"),`${cur&&cur.t?`<button class="sm" id="sgMine" style="width:100%;margin-bottom:10px">▶ ${L("Lagu yang lagi kudengar: ","What I'm listening to: ")}<b></b></button>`:""}
    <label>${L("Link Spotify atau YouTube","Spotify or YouTube link")}</label><input id="sgL" maxlength="300" placeholder="https://open.spotify.com/track/…">
    <div class="crumb" style="margin:4px 0 8px">${L("Di Spotify: ⋯ → Bagikan → Salin link lagu. Di YouTube: Bagikan → Salin link.","In Spotify: ⋯ → Share → Copy song link. In YouTube: Share → Copy link.")}</div>
    <div class="tl-row" style="gap:6px"><input id="sgT" maxlength="80" placeholder="${L("Judul lagu","Song title")}" style="flex:1"><input id="sgA" maxlength="60" placeholder="${L("Penyanyi","Artist")}" style="flex:1"></div>
    <label style="margin-top:8px">${L("Pesan (opsional)","Message (optional)")}</label><input id="sgM" maxlength="300" placeholder="${L("mis. Lagu ini kamu banget 🥺","e.g. This song is so you 🥺")}">
    <div class="msg err hide" id="sgE" style="margin-top:8px"></div>`,
    async g=>{const u=g.querySelector("#sgL").value.trim(),t=g.querySelector("#sgT").value.trim(),a=g.querySelector("#sgA").value.trim(),e=g.querySelector("#sgE");
      const fail=x=>{e.textContent=x;e.classList.remove("hide");return false};
      if(!u&&!t)return fail(L("Isi link atau judul lagunya.","Enter a link or the song title."));if(u&&!R.songOK(u))return fail(L("Link harus dari Spotify atau YouTube.","The link must be from Spotify or YouTube."));
      sendBody(cid,{t:g.querySelector("#sgM").value.trim(),sg:{u:u||undefined,t:t||undefined,a:a||undefined}})},L("Kirim","Send"));
  const mb=bg.querySelector("#sgMine");if(mb){mb.querySelector("b").textContent=cur.t+(cur.a?" — "+cur.a:"");mb.onclick=()=>{bg.querySelector("#sgL").value=cur.u||"";bg.querySelector("#sgT").value=cur.t||"";bg.querySelector("#sgA").value=cur.a||""}}
  setTimeout(()=>bg.querySelector("#sgL")?.focus(),50)}
/* ---------- bagikan lokasi ---------- */
function locSheet(cid){if(!cid)return;if(!navigator.geolocation){status(L("Perangkat ini tidak bisa membaca lokasi.","This device can't read location."),"warn");return}
  status(L("Mengambil lokasi…","Getting location…"),"");
  navigator.geolocation.getCurrentPosition(pos=>{status("");const c=pos.coords,loc={lat:+c.latitude.toFixed(6),lng:+c.longitude.toFixed(6),acc:Math.round(c.accuracy||0)};
    const bg=modal("📍 "+L("Kirim lokasi","Send location"),`<div class="loc-map"><iframe title="${L("Peta","Map")}" loading="lazy" referrerpolicy="no-referrer" src="${locFrame(loc)}"></iframe></div>
      <div class="crumb" style="margin-top:8px">${L("Akurasi sekitar ","Accurate to about ")}${loc.acc} m · ${L("Lokasi hanya terlihat oleh anggota chat ini (terenkripsi).","Only members of this chat can see it (encrypted).")}</div>
      <label style="margin-top:8px">${L("Keterangan (opsional)","Note (optional)")}</label><input id="lcN" maxlength="80" placeholder="${L("mis. Aku di sini 😊","e.g. I'm here 😊")}">`,
      ()=>{sendBody(cid,{t:bg.querySelector("#lcN").value.trim(),loc})},L("Kirim lokasi","Send location"))},
    err=>{status(err.code===1?L("Izin lokasi ditolak. Izinkan lokasi untuk Talk&Talk di pengaturan browser.","Location permission denied. Allow location for Talk&Talk in your browser settings."):L("Gagal mengambil lokasi: ","Couldn't get location: ")+err.message,"err")},
    {enableHighAccuracy:true,timeout:15000,maximumAge:30000})}
const locFrame=l=>{const d=.004;return "https://www.openstreetmap.org/export/embed.html?bbox="+[l.lng-d,l.lat-d,l.lng+d,l.lat+d].join("%2C")+"&layer=mapnik&marker="+l.lat+"%2C"+l.lng};
const locLink=l=>"https://www.google.com/maps?q="+l.lat+","+l.lng;
function mediaCard(o){if(o.sg){const e=R.songEmbed(o.sg.u),ti=o.sg.t||(e&&e.k==="youtube"?L("Video YouTube","YouTube video"):L("Lagu Spotify","Spotify song"));
    return `<div class="sg-card${e&&e.k==="youtube"?" yt":""}" data-sg><div class="sg-h"><span class="sg-ic">${e&&e.k==="youtube"?"▶":"🎵"}</span><div class="sg-tx"><b></b><span></span></div>${e&&e.src?`<button class="sg-play" aria-label="${L("Putar","Play")}">▶</button>`:""}</div><div class="sg-emb"></div>${o.sg.u?`<a class="sg-open" target="_blank" rel="noopener noreferrer">${L("Buka di ","Open in ")}${e&&e.k==="youtube"?"YouTube":"Spotify"} ↗</a>`:""}</div>`}
  if(o.loc)return `<div class="lc-card" data-lc><div class="lc-pin">📍</div><div class="lc-tx"><b>${L("Lokasi","Location")}</b><span>${o.loc.lat}, ${o.loc.lng}${o.loc.acc?" · ±"+o.loc.acc+" m":""}</span></div><div class="lc-emb"></div><div class="lc-act"><button class="sm" data-lcmap>🗺️ ${L("Lihat peta","View map")}</button><a class="sm" target="_blank" rel="noopener noreferrer" href="${locLink(o.loc)}">${L("Petunjuk arah","Directions")} ↗</a></div></div>`;return ""}
function wireMedia(el,o){const sc=el.querySelector("[data-sg]");if(sc&&o.sg){const e=R.songEmbed(o.sg.u);sc.querySelector(".sg-tx b").textContent=o.sg.t||(e&&e.k==="youtube"?L("Video YouTube","YouTube video"):L("Lagu Spotify","Spotify song"));sc.querySelector(".sg-tx span").textContent=o.sg.a||"";
    const a=sc.querySelector(".sg-open");if(a)a.href=o.sg.u;const pb=sc.querySelector(".sg-play");
    if(pb)pb.onclick=ev=>{ev.stopPropagation();const box=sc.querySelector(".sg-emb");if(box.firstChild){box.innerHTML="";pb.textContent="▶";return}
      box.innerHTML=`<iframe title="${L("Pemutar lagu","Song player")}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" style="height:${e.h||0}px"></iframe>`;box.querySelector("iframe").src=e.src+(e.k==="youtube"?"?autoplay=1":"");pb.textContent="■"}}
  const lc=el.querySelector("[data-lc]");if(lc&&o.loc){lc.querySelector("[data-lcmap]").onclick=ev=>{ev.stopPropagation();const box=lc.querySelector(".lc-emb");if(box.firstChild){box.innerHTML="";return}box.innerHTML=`<iframe title="${L("Peta","Map")}" loading="lazy" referrerpolicy="no-referrer"></iframe>`;box.querySelector("iframe").src=locFrame(o.loc)}}}
const mcCss=document.createElement("style");mcCss.textContent=`
.sg-card,.lc-card{min-width:min(260px,62vw);max-width:320px;border-radius:12px;background:color-mix(in srgb,var(--ink) 6%,transparent);padding:8px;margin-bottom:4px}
.sg-h{display:flex;gap:10px;align-items:center}.sg-ic{width:44px;height:44px;border-radius:10px;flex:none;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;background:linear-gradient(135deg,#1db954,#127a37)}
.sg-card.yt .sg-ic{background:linear-gradient(135deg,#ff3d3d,#c40000)}.sg-tx{flex:1;min-width:0}.sg-tx b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sg-tx span{display:block;font-size:12.5px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sg-play{all:unset;cursor:pointer;width:36px;height:36px;border-radius:99px;background:#1db954;color:#fff;display:flex;align-items:center;justify-content:center;flex:none;font-size:14px}.sg-card.yt .sg-play{background:#e00}
.sg-emb iframe{width:100%;border:0;border-radius:12px;margin-top:8px;display:block}.sg-card.yt .sg-emb iframe{aspect-ratio:16/9;height:auto!important}
.sg-open{display:inline-block;font-size:12px;margin-top:6px;color:inherit;opacity:.8}
.lc-card{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center}.lc-pin{font-size:30px}.lc-tx b{display:block}.lc-tx span{font-size:12px;opacity:.75}
.lc-emb{grid-column:1/-1}.lc-emb iframe,.loc-map iframe{width:100%;height:200px;border:0;border-radius:12px;display:block}.lc-act{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}.lc-act a{text-decoration:none}`;document.head.appendChild(mcCss);
function addTray(files){for(const f of files.slice(0,10)){if(f.size>R.MAXF){status(L("Terlalu besar (maks. 50 MB): ","Too large (max 50 MB): ")+f.name,"warn");continue}
    CH.tray.push({file:f,prev:/^image\//.test(f.type)?URL.createObjectURL(f):null})}paintTray();$$("#rmTxt")?.focus()}
function paintTray(){const box=$$("#rmTray");if(!box)return;const t0=$$("#rmTxt");if(!CH.tray.length){box.innerHTML="";CH.vo=0;if(t0)t0.placeholder=L("Ketik pesan","Message");return}
  const hasPhoto=CH.tray.some(x=>R.isPhoto(x.file));
  box.innerHTML=`<div class="rm-tray">${CH.tray.map((x,i)=>`<div class="ti">${x.prev?`<img src="${x.prev}" alt="">`:`<span class="fi">${R.fIcon(x.file.type||"")}</span>`}<span class="tn"></span><button data-trx="${i}" aria-label="${L("Hapus lampiran","Remove attachment")}">✕</button></div>`).join("")}
    ${hasPhoto?`<button class="vo-t${CH.vo?" on":""}" id="voT" aria-label="${L("Foto sekali/dua kali lihat","View once/twice")}"><b>${CH.vo===1?"①":CH.vo===2?"②":"∞"}</b><span>${CH.vo===1?L("Sekali lihat","View once"):CH.vo===2?L("Dua kali lihat","View twice"):L("Biasa","Normal")}</span></button>`:""}</div>`;
  const vt=box.querySelector("#voT");if(vt)vt.onclick=()=>{CH.vo=(CH.vo+1)%3;paintTray();status(CH.vo===1?L("① Foto hanya bisa dilihat sekali","① Photo can be viewed once"):CH.vo===2?L("② Foto hanya bisa dilihat dua kali","② Photo can be viewed twice"):L("Foto biasa","Normal photo"),"ok")};
  box.querySelectorAll(".tn").forEach((n,i)=>n.textContent=CH.tray[i].file.name||L("Tempelan","Pasted"));
  box.querySelectorAll("[data-trx]").forEach(b=>b.onclick=()=>{const x=CH.tray.splice(+b.dataset.trx,1)[0];if(x&&x.prev)URL.revokeObjectURL(x.prev);paintTray()});
  const t=$$("#rmTxt");if(t)t.placeholder=L("Tambah keterangan…","Add a caption…")}
function paintReply(){const box=$$("#rmRp");if(!box)return;if(!CH.reply){box.innerHTML="";return}
  box.innerHTML=`<div class="rm-rp"><div><b></b><span></span></div><button class="cx-ib" aria-label="${L("Batal balas","Cancel reply")}">✕</button></div>`;
  box.querySelector("b").textContent=CH.reply.w;box.querySelector("span").textContent=CH.reply.s;box.querySelector("button").onclick=()=>{CH.reply=null;paintReply()}}
function paintStk(){const box=$$("#rmStkP"),btn=$$("#rmStk");if(!box)return;if(btn){btn.classList.toggle("on",CH.stkOpen);btn.setAttribute("aria-expanded",CH.stkOpen)}
  if(!CH.stkOpen){box.innerHTML="";return}
  const tabs=[["fav","⭐ "+L("Favorit","Favourites"),R.EMOTES],...R.STABS()];const cur=tabs.find(x=>x[0]===CH.stkTab)||tabs[0];
  box.innerHTML=`<div class="rm-stk"><div class="stk-tabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" aria-selected="${k===cur[0]}" class="${k===cur[0]?"on":""}" data-st="${k}">${n}</button>`).join("")}</div>
    <div class="stk-grid${cur[0]==="emoji"?" uni":""}">${cur[0]==="emoji"?R.UNI.map(e=>`<button data-q="${e}" aria-label="${e}">${e}</button>`).join(""):cur[2].map(k=>`<button data-send="${k}" data-stk="${k}" aria-label="${L("Kirim stiker","Send sticker")}">${R.stkSVG(k,62)}</button>`).join("")}</div></div>`;
  R.fillCaps(box);
  box.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{CH.stkTab=b.dataset.st;paintStk()});
  box.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const t=$$("#rmTxt");t.value+=b.dataset.q;t.dispatchEvent(new Event("input"))});
  box.querySelectorAll("[data-send]").forEach(b=>b.onclick=()=>{const r=CH.reply?{...CH.reply}:null;CH.reply=null;paintReply();sendBody(CH.open,{t:"[stk:"+b.dataset.send+"]",r})});
  if(CH.atBottom)setTimeout(()=>toBottom(false),20)}

/* ---------- gestur pada gelembung ---------- */
function wireBubble(el){let hold=0,sx=0,sy=0,dx=0,swiped=false,moved=false;
  const msg=()=>{const st=CH.msgs.get(CH.open);return st&&st.list.find(x=>x.id==el.dataset.id)};
  el.addEventListener("touchstart",e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;dx=0;swiped=false;moved=false;
    hold=setTimeout(()=>{if(!moved){try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}openMenu(msg(),el)}},430)},{passive:true});
  el.addEventListener("touchmove",e=>{const p=e.touches[0];dx=p.clientX-sx;const dy=Math.abs(p.clientY-sy);if(dy>10||Math.abs(dx)>10){moved=true;clearTimeout(hold)}
    if(dx>0&&dy<30){const bb=el.querySelector(".bb");bb.style.transform=`translateX(${Math.min(dx,72)}px)`;bb.style.transition="none";swiped=dx>56}},{passive:true});
  el.addEventListener("touchend",()=>{clearTimeout(hold);const bb=el.querySelector(".bb");if(bb){bb.style.transition="transform .2s";bb.style.transform=""}if(swiped){const m=msg();if(m&&m.id>0)setReply(m)}});
  el.addEventListener("contextmenu",e=>{e.preventDefault();openMenu(msg(),el)});
  el.addEventListener("click",e=>{const m=msg();if(!m)return;
    if(e.target.closest(".chev")){openMenu(m,el);return}
    const q=e.target.closest("[data-jump]");if(q){jumpTo(+q.dataset.jump);return}
    if(e.target.closest("[data-rx]")){reactInfo(m);return}
    if(e.target.closest("[data-vo]")){openVO(m,el);return}
    if(e.target.closest("[data-open]")){openFile(m,el,e.target.closest("[data-open]"));return}
    if(e.target.matches("img.ph")&&e.target.src){const bg=modal(L("Foto","Photo"),`<img alt="" style="width:100%;border-radius:12px">`,()=>true,"OK");bg.querySelector("img").src=e.target.src;const cc=bg.querySelector(".c");if(cc)cc.style.display="none";return}
    if(e.detail===2&&m.id>0){setReact(m,(m.reacts||{})[CH.me]==="❤️"?null:"❤️")}})}
function setReply(m){const o=R.parse(R.pt(m.body));CH.reply={id:m.id,w:m.sender===CH.me?L("Kamu","You"):R.name(m.sender),u:m.sender,s:snip(m)};paintReply();const t=$$("#rmTxt");if(t)t.focus();void o}
async function openFile(m,el,b){const o=R.parse(R.pt(m.body));if(!o.f)return;const old=b.textContent;b.textContent="…";b.disabled=true;
  try{const url=await R.fileURL(o.f);const box=el.querySelector(".md");
    if(/^video\//.test(o.f.m)){box.innerHTML=`<video controls playsinline preload="metadata"></video>`;const vd=box.querySelector("video");vd.src=url;vd.play().catch(()=>{});b.textContent="⬇";b.disabled=false;b.onclick=ev=>{ev.stopPropagation();R.dl(url,o.f.n)}}
    else if(/^audio\//.test(o.f.m)){box.innerHTML=`<audio controls></audio>`;box.querySelector("audio").src=url;b.textContent="⬇";b.disabled=false;b.onclick=ev=>{ev.stopPropagation();R.dl(url,o.f.n)}}
    else if(/^image\//.test(o.f.m)){box.innerHTML=`<img alt="">`;box.querySelector("img").src=url;b.textContent="⬇";b.disabled=false;b.onclick=ev=>{ev.stopPropagation();R.dl(url,o.f.n)}}
    else{R.dl(url,o.f.n);b.textContent=old;b.disabled=false}}
  catch(err){b.textContent=old;b.disabled=false;status(L("Gagal membuka file: ","Couldn't open file: ")+(err.message||err),"err")}}

/* ---------- menu pesan ala WA ---------- */
function closeMenus(){document.querySelectorAll(".cm-ov,.cm-rx,.cm-menu").forEach(x=>x.remove());document.querySelectorAll(".mb.sel").forEach(x=>x.classList.remove("sel"))}
addEventListener("keydown",e=>{if(e.key==="Escape"&&document.querySelector(".cm-ov"))closeMenus()});
function openMenu(m,el){if(!m||m.id<0)return;closeMenus();const c=CH.convs.get(m.conv_id),o=R.parse(R.pt(m.body)),mine=m.sender===CH.me,my=(m.reacts||{})[CH.me];
  el.classList.add("sel");const ov=document.createElement("div");ov.className="cm-ov";ov.onclick=closeMenus;
  const rx=document.createElement("div");rx.className="cm-rx";rx.setAttribute("role","toolbar");
  rx.innerHTML=QUICK.map(e=>`<button data-e="${e}" class="${my===e?"on":""}" aria-label="${L("Reaksi ","React ")+e}">${e}</button>`).join("")+`<button class="pl" data-more aria-label="${L("Reaksi lain","More reactions")}">${ic("plus",20)}</button>`;
  const it=(a,i,t,cls)=>`<button data-a="${a}"${cls?` class="${cls}"`:""}>${ic(i,20)}<span>${t}</span></button>`;
  const pinned=c.pinned_msg===m.id,starred=CH.stars.has(m.id),vo=!!o.vo;
  const menu=document.createElement("div");menu.className="cm-menu";menu.setAttribute("role","menu");
  menu.innerHTML=it("reply","reply",L("Balas","Reply"))+(o.t&&!R.isStk(o.t)?it("copy","copy",L("Salin","Copy")):"")+it("react","react",L("Reaksi","React"))+(vo?"":it("fwd","fwd",L("Teruskan","Forward")))+
    it("pin","pin",pinned?L("Lepas sematan","Unpin"):L("Sematkan","Pin"))+it("star","star",starred?L("Hapus bintang","Unstar"):L("Bintangi","Star"))+
    (mine?it("info","info",L("Info pesan","Message info")):"")+`<hr>`+it("del","del",L("Hapus","Delete"),"danger");
  document.body.append(ov,rx,menu);
  /* posisi: bar reaksi di atas gelembung, menu di bawah (atau sebaliknya bila tidak muat) */
  const r=el.querySelector(".bb").getBoundingClientRect(),vw=innerWidth,vh=(window.visualViewport?visualViewport.height:innerHeight);
  const rw=rx.offsetWidth,rh=rx.offsetHeight,mw=menu.offsetWidth,mh=menu.offsetHeight,pad=8;
  const ax=mine?r.right:r.left;const clampX=(x,w)=>Math.max(pad,Math.min(vw-w-pad,x));
  let rxTop=r.top-rh-8,menuTop=r.bottom+8;
  if(rxTop<pad)rxTop=Math.min(vh-rh-pad,r.bottom+8),menuTop=rxTop+rh+8;
  if(menuTop+mh>vh-pad){menuTop=Math.max(pad,(rxTop<r.top?rxTop:r.top)-mh-8);if(menuTop<pad)menuTop=Math.max(pad,vh-mh-pad)}
  rx.style.left=clampX(mine?ax-rw:ax,rw)+"px";rx.style.top=rxTop+"px";menu.style.left=clampX(mine?ax-mw:ax,mw)+"px";menu.style.top=menuTop+"px";
  rx.querySelector("button")?.focus({preventScroll:true});
  rx.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{closeMenus();setReact(m,my===b.dataset.e?null:b.dataset.e)});
  rx.querySelector("[data-more]").onclick=()=>{closeMenus();reactPicker(m)};
  menu.querySelectorAll("[data-a]").forEach(b=>b.onclick=async()=>{const a=b.dataset.a;closeMenus();
    if(a==="reply")setReply(m);
    else if(a==="copy"){try{await navigator.clipboard.writeText(o.t);status(L("Disalin 📋","Copied 📋"),"ok")}catch(e){status(L("Browser menolak menyalin. Tahan teksnya untuk menyalin manual.","The browser blocked copying. Long-press the text to copy manually."),"warn")}}
    else if(a==="react")reactPicker(m);
    else if(a==="fwd")forward(m);
    else if(a==="pin"){const v=pinned?null:m.id;c.pinned_msg=v;paintPin();const {error}=await sb.from("couple_convs").update({pinned_msg:v}).eq("id",c.id);if(error)status(error.message,"err");else status(v?L("Pesan disematkan 📌","Message pinned 📌"):L("Sematan dilepas","Unpinned"),"ok")}
    else if(a==="star"){if(starred){CH.stars.delete(m.id);sb.from("couple_stars").delete().eq("msg_id",m.id).then(()=>{},()=>{})}else{CH.stars.add(m.id);sb.from("couple_stars").insert({msg_id:m.id}).then(()=>{},()=>{})}patchBubble(m)}
    else if(a==="info")msgInfo(m);
    else if(a==="del")delMsg(m)})}
async function setReact(m,val){const r={...(m.reacts||{})};if(val)r[CH.me]=val;else delete r[CH.me];m.reacts=r;patchBubble(m);
  const {error}=await sb.from("couple_msgs").update({reacts:r}).eq("id",m.id);if(error){status(error.message,"err");return}
  if(val&&m.sender!==CH.me)R.activity(m.sender,"react",m.id,{c:m.conv_id,e:String(val).startsWith("stk:")?"🧸":val});else if(!val)R.unActivity("react",m.id)}
function reactPicker(m){const opts=[...QUICK,...RX_STK,"🔥","🥰","😘","🤗","👏","💯"];
  const bg=modal(L("Beri reaksi","React"),`<div class="stk-grid" style="max-height:none">${opts.map((x,i)=>`<button data-rp="${i}" aria-label="${L("Reaksi","Reaction")}">${x.startsWith("stk:")?R.stkSVG(x.slice(4),46):`<span style="font-size:32px">${x}</span>`}</button>`).join("")}</div>${(m.reacts||{})[CH.me]?`<button class="sm" id="rpX" style="margin-top:10px">${L("Hapus reaksiku","Remove my reaction")}</button>`:""}`,()=>true,L("Tutup","Close"));
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  bg.querySelectorAll("[data-rp]").forEach(b=>b.onclick=()=>{bg.remove();setReact(m,opts[+b.dataset.rp])});const x=bg.querySelector("#rpX");if(x)x.onclick=()=>{bg.remove();setReact(m,null)}}
function reactInfo(m){const rx=Object.entries(m.reacts||{});if(!rx.length)return;
  const bg=modal(L("Reaksi","Reactions"),rx.map(([u,v])=>`<div class="mem-row">${R.avatar(u,36)}<div class="tx"><b></b><span>${u===CH.me?L("Ketuk untuk menghapus","Tap to remove"):""}</span></div><span style="font-size:24px"${u===CH.me?` data-unr style="cursor:pointer"`:""}>${R.rxHTML(v)}</span></div>`).join(""),()=>true,"OK");
  bg.querySelectorAll(".mem-row .tx b").forEach((b,i)=>b.textContent=rx[i][0]===CH.me?L("Kamu","You"):R.name(rx[i][0]));const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  bg.querySelectorAll("[data-unr]").forEach(x=>x.onclick=()=>{bg.remove();setReact(m,null)})}
function msgInfo(m){const c=CH.convs.get(m.conv_id),t=Date.parse(m.created_at)-1500;
  const rows=others(c).map(x=>{const rd=x.rd&&Date.parse(x.rd)>=t?x.rd:null,d=x.d&&Date.parse(x.d)>=t?x.d:null;return [x.u,rd,d]});
  const fmt=v=>v?new Date(v).toLocaleString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"—";
  const bg=modal(L("Info pesan","Message info"),`<div class="crumb" style="margin-bottom:6px">${L("Dikirim","Sent")} ${fmt(m.created_at)}</div>`+rows.map(([u,rd,d])=>`<div class="mem-row">${R.avatar(u,36)}<div class="tx"><b></b><span>✓✓ <span style="color:#53bdeb">${L("Dibaca","Read")}</span> ${fmt(rd)} · ✓✓ ${L("Terkirim","Delivered")} ${fmt(d)}</span></div></div>`).join(""),()=>true,"OK");
  bg.querySelectorAll(".mem-row .tx b").forEach((b,i)=>b.textContent=R.name(rows[i][0]));const cc=bg.querySelector(".c");if(cc)cc.style.display="none"}
function delMsg(m){const mine=m.sender===CH.me;
  const bg=modal(L("Hapus pesan?","Delete message?"),`<div class="act-list" style="display:flex;flex-direction:column;gap:6px">${mine?`<button class="sm" data-d="all" style="color:var(--red);justify-content:flex-start">🗑️ ${L("Hapus untuk semua orang","Delete for everyone")}</button>`:""}<button class="sm" data-d="me" style="justify-content:flex-start">🙈 ${L("Hapus untuk saya","Delete for me")}</button></div>`,()=>true,L("Batal","Cancel"));
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  bg.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{bg.remove();
    if(b.dataset.d==="me"){CH.hidden.add(m.id);lsSet("ravi_hid_"+CH.me,[...CH.hidden].slice(-3000));removeBubble(m.id);return}
    const {error}=await sb.from("couple_msgs").delete().eq("id",m.id);if(error){status(error.message,"err");return}
    const st=CH.msgs.get(m.conv_id);if(st)st.list=st.list.filter(x=>x.id!==m.id);removeBubble(m.id);
    const o=R.parse(R.pt(m.body));const files=[m.img,o.f&&o.f.p].filter(Boolean);if(files.length)sb.storage.from("couple").remove(files).catch(()=>{});scheduleInbox()})}
function forward(m){const o=R.parse(R.pt(m.body)),sel=new Set();
  const list=convSorted();
  const bg=modal(L("Teruskan ke…","Forward to…"),`<div class="crumb q1" style="margin-bottom:8px"></div><div class="sh-list">${list.map(c=>`<button class="sh-it" data-c="${c.id}"><span class="ck">✓</span>${convAv(c,40)}<span class="tx"><b></b></span></button>`).join("")}
     <button class="sh-it" data-x="note"><span class="bi" style="background:#f5b301">📝</span><span class="tx"><b>${L("Simpan ke Catatan","Save to Notes")}</b></span></button>${navigator.share?`<button class="sh-it" data-x="share"><span class="bi" style="background:#5157ae">📤</span><span class="tx"><b>${L("Bagikan ke aplikasi lain","Share to another app")}</b></span></button>`:""}</div>`,
    async()=>{if(!sel.size)return false;for(const cid of sel){const msg={t:o.t,f:o.f,fwd:true,ik:o.ik};if(m.img)await sendRaw(cid,msg,m.img);else await sendBody(cid,msg)}status(L("Diteruskan ke ","Forwarded to ")+sel.size+" chat ↪️","ok")},L("Kirim","Send"));
  bg.querySelector(".q1").textContent="“"+snip(m)+"”";
  bg.querySelectorAll("[data-c]").forEach((b,i)=>{b.querySelector(".tx b").textContent=title(list[i]);b.onclick=()=>{sel.has(b.dataset.c)?sel.delete(b.dataset.c):sel.add(b.dataset.c);b.classList.toggle("on")}});
  bg.querySelectorAll("[data-x]").forEach(b=>b.onclick=async()=>{bg.remove();try{
    if(b.dataset.x==="note"){if(typeof col==="undefined"||!col)throw new Error("offline");const body=(o.t||"")+(o.f?"\n📎 "+o.f.n:"")+(m.img&&!o.t?"📷 "+L("Foto dari chat","Photo from chat"):"");
      await col.doc("nt_"+Date.now()).set({kind:"note",title:L("Dari chat · ","From chat · ")+R.name(m.sender),body,color:"blue",pinned:false,tags:["chat"],items:[],created:Date.now(),updated:Date.now()});status(L("Disimpan ke Catatan 📝","Saved to Notes 📝"),"ok")}
    else{let files=[];if(o.f||m.img){try{const url=o.f?await R.fileURL(o.f):(document.querySelector(`#m${m.id} img.ph`)?.src||"");if(url){const blob=await (await fetch(url)).blob();files=[new File([blob],o.f?o.f.n:"foto.jpg",{type:o.f?o.f.m:"image/jpeg"})]}}catch(e){}}
      await navigator.share(files.length&&navigator.canShare&&navigator.canShare({files})?{files,text:o.t||undefined}:{text:o.t||snip(m)})}}
    catch(e){if(e&&e.name!=="AbortError")status(L("Gagal: ","Failed: ")+(e.message||e),"err")}})}

/* ---------- kirim ---------- */
const memberUids=cid=>active(CH.convs.get(cid)).map(x=>x.u);
async function seal(cid,plain){return R.sealFor(plain,memberUids(cid).filter(u=>u!==CH.me))}
function tmpMsg(cid,body,img){const m={id:-(++CH.tmp)-Date.now()%1e6,conv_id:cid,sender:CH.me,body,img:img||null,reacts:{},created_at:new Date().toISOString()};
  const st=CH.msgs.get(cid);if(st&&st.loaded){st.list.push(m);if(CH.open===cid)appendBubble(m,true)}return m}
function confirmTmp(tmp,real){CH.pend.delete(real.body);const st=CH.msgs.get(real.conv_id);if(!st)return;
  if(st.list.some(x=>x.id===real.id)){st.list=st.list.filter(x=>x!==tmp);document.getElementById("m"+tmp.id)?.remove();return}
  real.body_plain=tmp.body;const i=st.list.indexOf(tmp);if(i>=0)st.list[i]=real;else st.list.push(real);
  const el=document.getElementById("m"+tmp.id);if(el){el.id="m"+real.id;el.dataset.id=real.id;const tk=el.querySelector(".tk");if(tk)tk.dataset.s=tickState(real,CH.convs.get(real.conv_id));if(real.img)patchBubble(real)}
  const c=CH.convs.get(real.conv_id);if(c&&(!c.last||real.id>=c.last.id)){c.last=real;c.at=real.created_at;paintInbox()}}
async function sendBody(cid,o){const plain=R.pack(o);const tmp=tmpMsg(cid,plain);
  let sealed;try{sealed=await seal(cid,plain)}catch(e){const st=CH.msgs.get(cid);if(st)st.list=st.list.filter(x=>x!==tmp);document.getElementById("m"+tmp.id)?.remove();
    const inp=$$("#rmTxt");if(inp&&!inp.value&&o.t){inp.value=o.t;inp.dispatchEvent(new Event("input"))}status(e.message||String(e),"err");return}
  if(sealed!==plain&&window.RAVI_E2E)tmp.body=sealed;CH.pend.set(sealed,tmp);
  const {data,error}=await sb.from("couple_msgs").insert({conv_id:cid,body:sealed}).select().single();
  if(error){CH.pend.delete(sealed);tmp.failed=true;const tk=document.querySelector("#m"+CSS.escape(String(tmp.id))+" .tk");if(tk)tk.dataset.s="fail";
    const cv=CH.convs.get(cid),nf=cv&&cv.kind==="dm"&&R.friendState&&R.friendState(peer(cv))!=="friend";status(nf?L("Pesan tidak terkirim: kalian belum berteman.","Not sent: you're not friends."):L("Pesan gagal terkirim: ","Message not sent: ")+error.message,"err");return}
  if(CH.pend.has(sealed))confirmTmp(tmp,data);
  if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("msg",{conv:cid,to:memberUids(cid).filter(u=>u!==CH.me),title:CH.convs.get(cid).kind==="group"?title(CH.convs.get(cid)):meName(),body:R.isEnc(sealed)?"💬 "+L("Pesan baru","New message"):R.isStk(o.t)?"🧸 "+L("Stiker","Sticker"):(o.t||"📎").slice(0,120)})}
async function sendRaw(cid,o,img){const sealed=await seal(cid,R.pack(o));const {error}=await sb.from("couple_msgs").insert({conv_id:cid,body:sealed,img:img||null});if(error)throw error;
  if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("msg",{conv:cid,to:memberUids(cid).filter(u=>u!==CH.me),title:meName(),body:"📷 "+L("Foto","Photo")})}
async function sendFile(cid,it,cap,r){const tmp=tmpMsg(cid,R.pack({t:cap||(R.isPhoto(it.file)?(it.vo?"📷 "+(it.vo===1?L("Foto sekali lihat","View-once photo"):L("Foto dua kali lihat","View-twice photo")):""):"📎 "+it.file.name),r}),null);
  if(it.prev&&!it.vo){const el=document.getElementById("m"+tmp.id);if(el&&R.isPhoto(it.file)){const bb=el.querySelector(".bb");const im=document.createElement("img");im.className="ph";im.src=it.prev;bb.prepend(im);if(!cap)el.classList.add("only-img")}}
  try{let sealed;if(R.isPhoto(it.file)){const p=await R.upPhoto(it.file,1600);sealed=await seal(cid,R.pack({t:cap,r,ik:R.PK[p],vo:it.vo||undefined}));
      CH.pend.set(sealed,tmp);tmp.img=p;const {data,error}=await sb.from("couple_msgs").insert({conv_id:cid,body:sealed,img:p}).select().single();if(error)throw error;if(CH.pend.has(sealed))confirmTmp(tmp,data)}
    else{const fm=await R.uploadFile(it.file);sealed=await seal(cid,R.pack({t:cap,r,f:fm}));CH.pend.set(sealed,tmp);
      const {data,error}=await sb.from("couple_msgs").insert({conv_id:cid,body:sealed}).select().single();if(error)throw error;if(CH.pend.has(sealed))confirmTmp(tmp,data);
      const real=CH.msgs.get(cid)?.list.find(x=>x.id===data.id);if(real)patchBubble(real)}
    if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("msg",{conv:cid,to:memberUids(cid).filter(u=>u!==CH.me),title:meName(),body:R.isPhoto(it.file)?"📷 "+L("Foto","Photo"):"📎 "+L("File","File")})}
  catch(err){tmp.failed=true;const tk=document.querySelector("#m"+CSS.escape(String(tmp.id))+" .tk");if(tk)tk.dataset.s="fail";status(L("Gagal mengirim ","Couldn't send ")+(it.file.name||"")+": "+(err.message||err),"err")}
  finally{if(it.prev)setTimeout(()=>URL.revokeObjectURL(it.prev),60000)}}

/* ---------- telepon ---------- */
function startCall(video){const c=CH.convs.get(CH.open),u=peer(c);if(!u)return;if(!window.RAVI_CALL){status(L("Fitur telepon belum termuat.","Calls aren't loaded."),"warn");return}window.RAVI_CALL.start(u,video,c.id)}

/* ---------- lembar: chat baru, grup, anggota ---------- */
function newChatSheet(){const me=R.S.members[CH.me]||{},admin=me.role==="admin";
  if(R.loadEmails&&!newChatSheet._em){newChatSheet._em=1;R.loadEmails().then(()=>{const o=document.getElementById("ncQ");if(o){o.closest(".sheetBg")?.remove();newChatSheet()}}).finally(()=>setTimeout(()=>newChatSheet._em=0,30000))}
  const all=Object.keys(R.S.members).filter(u=>u!==CH.me).sort((a,b)=>R.name(a).localeCompare(R.name(b)));
  const fs=u=>R.friendState?R.friendState(u):"friend";
  const reqs=all.filter(u=>fs(u)==="in"),fr=all.filter(u=>fs(u)==="friend"),oth=all.filter(u=>fs(u)==="none"||fs(u)==="out");
  const row=(u,btn)=>`<div class="sh-it fr-row" data-u="${u}" data-n="${esc(R.name(u).toLowerCase())}" role="button" tabindex="0"><span class="avw" style="position:relative;display:inline-flex">${R.avatar(u,44)}<span class="dot${PR()&&PR().online(u)?" on":""}"></span></span><span class="tx"><b></b><span></span></span>${btn||""}</div>`;
  const bg=modal(L("Chat baru","New chat"),`<input id="ncQ" type="search" placeholder="${L("Cari nama…","Search name…")}" style="margin-bottom:8px"><div class="sh-list">
    <button class="sh-it" data-x="group"><span class="bi">${ic("group",22)}</span><span class="tx"><b>${L("Grup baru","New group")}</b><span>${L("Chat bareng beberapa teman","Chat with several friends")}</span></span></button>
    ${admin?`<button class="sh-it" data-x="add"><span class="bi" style="background:#25d366">${ic("plus",22)}</span><span class="tx"><b>${L("Undang orang ke Talk&Talk","Invite someone to Talk&Talk")}</b><span>${L("Kirim link lewat WhatsApp — dia daftar sendiri","Send a link via WhatsApp — they sign up themselves")}</span></span></button>`:""}
    ${reqs.length?`<div class="crumb fr-h">👋 ${L("Permintaan pertemanan","Friend requests")} (${reqs.length})</div>${reqs.map(u=>row(u,`<span class="fr-b"><button class="sm pri" data-fa="accept">${L("Terima","Accept")}</button><button class="sm" data-fa="decline">${L("Tolak","Decline")}</button></span>`)).join("")}`:""}
    <div class="crumb fr-h">${L("Teman","Friends")} (${fr.length})</div>
    ${fr.map(u=>row(u)).join("")||`<div class="crumb" style="padding:6px 10px">${L("Belum punya teman. Tambahkan dari daftar di bawah — chat bisa dimulai setelah dia menerima.","No friends yet. Add someone below — you can chat once they accept.")}</div>`}
    ${oth.length?`<div class="crumb fr-h">${L("Orang lain di Talk&Talk","Other people on Talk&Talk")}</div>${oth.map(u=>row(u,fs(u)==="out"?`<span class="fr-b"><button class="sm" data-fa="cancel" title="${L("Batalkan permintaan","Cancel request")}">⏳ ${L("Diminta","Requested")}</button></span>`:`<span class="fr-b"><button class="sm pri" data-fa="request">＋ ${L("Tambah teman","Add friend")}</button></span>`)).join("")}`:""}</div>`,()=>true,L("Tutup","Close"));
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  bg.querySelectorAll(".fr-row").forEach(b=>{const u=b.dataset.u,st=fs(u);b.querySelector(".tx b").textContent=R.name(u);
    b.querySelector(".tx span").textContent=st==="in"?L("Ingin berteman denganmu","Wants to be your friend"):st==="out"?L("Menunggu dia menerima","Waiting for them to accept"):st!=="friend"?L("Belum berteman","Not friends yet"):(R.S.emails&&R.S.emails[u]?"✉️ "+R.S.emails[u]+" · ":"")+(PR()&&PR().online(u)?"online":R.S.members[u]?.partner&&R.S.members[CH.me]?.partner?"💑 "+L("Pasangan","Partner"):lastSeenTxt(R.S.members[u]?.last_seen));
    b.querySelectorAll("[data-fa]").forEach(x=>x.onclick=async e=>{e.stopPropagation();x.disabled=true;try{const r=await R.friendAct(u,x.dataset.fa);
        status(r==="accepted"?L("Sekarang kalian berteman 🤝","You're now friends 🤝"):r==="pending"?L("Permintaan pertemanan terkirim","Friend request sent"):L("Selesai","Done"),"ok");bg.remove();newChatSheet()}catch(err){x.disabled=false;status(err.message||String(err),"err")}});
    const openIt=()=>{if(fs(u)!=="friend"){contactInfo(u);bg.remove();return}bg.remove();const c=[...CH.convs.values()].find(x=>x.kind==="dm"&&peer(x)===u);if(c)openRoom(c.id);else openDM(u)};
    b.onclick=openIt;b.onkeydown=e=>{if(e.key==="Enter")openIt()}});
  const q=bg.querySelector("#ncQ");q.oninput=()=>{const t=q.value.trim().toLowerCase();bg.querySelectorAll(".fr-row").forEach(b=>b.style.display=!t||b.dataset.n.includes(t)?"":"none")};
  bg.querySelector('[data-x="group"]').onclick=()=>{bg.remove();groupSheet()};
  const a=bg.querySelector('[data-x="add"]');if(a)a.onclick=()=>{bg.remove();window.RAVI_INVITE?window.RAVI_INVITE():addMemberSheet()}}
const frCss=document.createElement("style");frCss.textContent=`.fr-h{padding:10px 10px 2px;font-weight:800}.ci-bio{font-size:13.5px;text-align:center;max-width:300px;line-height:1.4}.ci-song{font-size:13px;font-weight:700;color:var(--acc);text-decoration:none}.ci-em{font-size:12.5px}.fr-row{cursor:pointer}.fr-b{display:flex;gap:6px;flex:none;margin-left:auto}.fr-b .sm{white-space:nowrap}`;document.head.appendChild(frCss);
window.RAVI_FRIENDS=()=>R.init().then(newChatSheet);
function groupSheet(){const ppl=Object.keys(R.S.members).filter(u=>u!==CH.me&&(!R.isFriend||R.isFriend(u))).sort((a,b)=>R.name(a).localeCompare(R.name(b))),sel=new Set();const EMO=["👥","💑","👨‍👩‍👧","🎉","🍜","✈️","🏠","💼","🎮","📚","⚽","🐄"];let emo=EMO[0];
  const bg=modal(L("Grup baru","New group"),`<label>${L("Nama grup","Group name")}</label><input id="gnN" maxlength="60" placeholder="${L("mis. Keluarga, Trip Bali","e.g. Family, Bali trip")}">
    <div class="tl-row" style="margin:8px 0;flex-wrap:wrap;gap:4px" id="gnE">${EMO.map(e=>`<button class="sm${e===emo?" pri":""}" data-e="${e}" style="font-size:18px;min-width:40px">${e}</button>`).join("")}</div>
    <div class="crumb" style="font-weight:800;margin:6px 0">${L("Pilih anggota","Choose members")}</div><div class="sh-list">${ppl.map(u=>`<button class="sh-it" data-u="${u}"><span class="ck">✓</span>${R.avatar(u,40)}<span class="tx"><b></b></span></button>`).join("")||`<div class="crumb">${L("Belum ada teman. Grup hanya bisa berisi teman — tambahkan teman dulu lewat ＋ → Chat baru.","No friends yet. Groups can only include friends — add friends first via ＋ → New chat.")}</div>`}</div>
    <div class="msg err hide" id="gnM" style="margin-top:8px"></div>`,
    async g=>{const n=g.querySelector("#gnN").value.trim(),m=g.querySelector("#gnM");const fail=t=>{m.textContent=t;m.classList.remove("hide");return false};
      if(!n)return fail(L("Isi nama grup dulu.","Enter a group name."));if(!sel.size)return fail(L("Pilih minimal 1 anggota.","Pick at least 1 member."));
      const {data,error}=await sb.rpc("ravi_group_create",{p_name:n,p_members:[...sel],p_emoji:emo});if(error)return fail(error.message);
      await loadInbox();openRoom(data);sendBody(data,{t:"👋 "+L("Grup dibuat oleh ","Group created by ")+meName()})},L("Buat grup","Create group"));
  bg.querySelectorAll("[data-u]").forEach(b=>{b.querySelector(".tx b").textContent=R.name(b.dataset.u);b.onclick=()=>{const u=b.dataset.u;sel.has(u)?sel.delete(u):sel.add(u);b.classList.toggle("on")}});
  bg.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{emo=b.dataset.e;bg.querySelectorAll("[data-e]").forEach(x=>x.classList.toggle("pri",x===b))});
  setTimeout(()=>bg.querySelector("#gnN")?.focus(),50)}
function addMemberSheet(){
  const bg=modal(L("Tambah anggota Talk&Talk","Add Talk&Talk member"),`<div class="crumb" style="line-height:1.5;margin-bottom:8px">${L("Akun baru bisa chat & telepon denganmu, ikut grup, dan punya buku keuangan sendiri. Feed & data pasangan tetap khusus kalian berdua.","The new account can chat and call, join groups, and has its own finance book. The couple feed and data stay private to the two of you.")}</div>
    <label>${L("Nama","Name")}</label><input id="amN" maxlength="40"><label style="margin-top:8px">Email</label><input id="amE" type="email" autocomplete="off">
    <label style="margin-top:8px">${L("Password sementara (min. 8)","Temporary password (min. 8)")}</label><input id="amP" type="text" autocomplete="new-password" value="${Math.random().toString(36).slice(2,8)+"-"+Math.random().toString(36).slice(2,8)}">
    <div class="crumb" style="margin-top:6px">${L("Berikan email & password ini ke orangnya secara langsung. Minta dia mengganti password di menu Keamanan.","Give this email & password to them in person. Ask them to change it under Security.")}</div><div class="msg err hide" id="amM" style="margin-top:8px"></div>`,
    async g=>{const n=g.querySelector("#amN").value.trim(),e=g.querySelector("#amE").value.trim(),p=g.querySelector("#amP").value,m=g.querySelector("#amM"),btn=g.querySelector(".ok");
      const fail=t=>{m.textContent=t;m.classList.remove("hide");btn.disabled=false;btn.textContent=L("Tambah","Add");return false};
      if(!n||!/^\S+@\S+\.\S+$/.test(e))return fail(L("Isi nama & email yang benar.","Enter a valid name & email."));if(p.length<8)return fail(L("Password minimal 8 karakter.","Password needs 8+ characters."));
      btn.disabled=true;btn.textContent="…";try{await window.RAVI_FN({action:"add_member",name:n,email:e,password:p});await R.loadMembers();status(L("Anggota ditambahkan: ","Member added: ")+n,"ok")}catch(err){return fail(err.message||String(err))}},L("Tambah","Add"))}
function contactInfo(u){if(!u)return;const mem=R.S.members[u]||{};
  const bg=modal(R.name(u),`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:10px">${R.avatar(u,96)}<div class="crumb">${PR()&&PR().online(u)?"🟢 online":esc(lastSeenTxt(mem.last_seen))}</div>${mem.partner&&R.S.members[CH.me]?.partner?`<div class="pill p-ok">💑 ${L("Pasangan","Partner")}</div>`:""}<div class="ci-em crumb"></div><div class="ci-bio"></div><a class="ci-song" target="_blank" rel="noopener noreferrer"></a></div>
    <div class="act-list" style="display:flex;flex-direction:column;gap:6px">${(()=>{const st=R.friendState?R.friendState(u):"friend";if(mem.partner&&R.S.members[CH.me]?.partner)return "";
      return st==="friend"?`<button class="sm pri" data-a="chat">💬 ${L("Kirim pesan","Message")}</button><button class="sm" data-fa="remove">${L("Hapus pertemanan","Unfriend")}</button>`:st==="in"?`<button class="sm pri" data-fa="accept">🤝 ${L("Terima pertemanan","Accept friend request")}</button><button class="sm" data-fa="decline">${L("Tolak","Decline")}</button>`:st==="out"?`<button class="sm" data-fa="cancel">⏳ ${L("Permintaan terkirim · batalkan","Request sent · cancel")}</button>`:`<button class="sm pri" data-fa="request">＋ ${L("Tambah teman","Add friend")}</button><div class="crumb" style="text-align:center">${L("Kalian bisa chat setelah dia menerima.","You can chat once they accept.")}</div>`})()}<button class="sm" data-a="sc">🔐 ${L("Kode keamanan enkripsi","Encryption security code")}</button><button class="sm" data-a="star">⭐ ${L("Pesan berbintang","Starred messages")}</button><button class="sm" data-a="wp">🖼️ Wallpaper</button>${R.S.members[CH.me]?.role==="admin"&&!mem.partner?`<button class="sm" data-a="kick" style="color:var(--red)">🚫 ${L("Keluarkan dari Talk&Talk","Remove from Talk&Talk")}</button>`:""}</div>`,()=>true,"OK");
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  {const bi=bg.querySelector(".ci-bio");bi.textContent=mem.bio||"";const sg=bg.querySelector(".ci-song");sg.textContent=R.songTxt?R.songTxt(mem.song):"";if(mem.song&&mem.song.u&&/^https:\/\//.test(mem.song.u))sg.href=mem.song.u;else sg.removeAttribute("href");
    const em=bg.querySelector(".ci-em");const fillEm=()=>{const e=R.S.emails&&R.S.emails[u];em.textContent=e?"✉️ "+e:""};fillEm();if(R.loadEmails)R.loadEmails().then(fillEm)}
  bg.querySelectorAll("[data-fa]").forEach(x=>x.onclick=async()=>{const act=x.dataset.fa;if(act==="remove"&&!confirm(L("Hapus pertemanan dengan ","Unfriend ")+R.name(u)+L("? Kalian tidak bisa saling kirim pesan pribadi lagi.","? You won't be able to message each other privately.")))return;
    x.disabled=true;try{const r=await R.friendAct(u,act);status(r==="accepted"?L("Sekarang kalian berteman 🤝","You're now friends 🤝"):r==="pending"?L("Permintaan pertemanan terkirim","Friend request sent"):L("Selesai","Done"),"ok");bg.remove();paintHead&&paintHead()}catch(err){x.disabled=false;status(err.message||String(err),"err")}});
  const ch=bg.querySelector('[data-a="chat"]');if(ch)ch.onclick=()=>{bg.remove();const c=[...CH.convs.values()].find(x=>x.kind==="dm"&&peer(x)===u);if(c)openRoom(c.id);else openDM(u)};
  const kk=bg.querySelector('[data-a="kick"]');if(kk)kk.onclick=()=>{bg.remove();window.RAVI_REMOVE_MEMBER&&window.RAVI_REMOVE_MEMBER(u,()=>{scheduleInbox()})};
  bg.querySelector('[data-a="sc"]').onclick=()=>{bg.remove();E2()&&E2().safetyDialog(u,R.name(u))};
  bg.querySelector('[data-a="star"]').onclick=()=>{bg.remove();starredSheet()};bg.querySelector('[data-a="wp"]').onclick=()=>{bg.remove();wallSheet()}}
function groupInfo(c){const ms=active(c),meAdmin=(ms.find(x=>x.u===CH.me)||{}).r==="admin";
  const bg=modal(title(c),`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:10px">${R.groupAvatar(c.emoji,84,c.id)}<div class="crumb">${L("Grup","Group")} · ${ms.length} ${L("anggota","members")}</div></div>
    ${meAdmin?`<div class="tl-row" style="margin-bottom:8px"><input id="giN" maxlength="60" style="flex:1"><button class="sm" id="giSave">${L("Ganti nama","Rename")}</button></div>`:""}
    <div class="crumb" style="font-weight:800">${L("Anggota","Members")}</div>${ms.map(x=>`<div class="mem-row" data-u="${x.u}">${R.avatar(x.u,38)}<div class="tx"><b></b><span>${x.r==="admin"?L("Admin grup","Group admin"):""}</span></div>${x.u!==CH.me?`<button class="sm" data-sc="${x.u}" title="${L("Kode keamanan","Security code")}">🔐</button>`:""}${meAdmin&&x.u!==CH.me?`<button class="sm" data-rm="${x.u}">${L("Keluarkan","Remove")}</button>`:""}</div>`).join("")}
    <div class="act-list" style="display:flex;flex-direction:column;gap:6px;margin-top:10px">${meAdmin?`<button class="sm" data-a="add">➕ ${L("Tambah anggota","Add members")}</button>`:""}<button class="sm" data-a="star">⭐ ${L("Pesan berbintang","Starred messages")}</button><button class="sm" data-a="wp">🖼️ Wallpaper</button><button class="sm" data-a="leave" style="color:var(--red)">🚪 ${L("Keluar dari grup","Leave group")}</button></div>`,()=>true,"OK");
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  bg.querySelectorAll(".mem-row").forEach(r=>r.querySelector(".tx b").textContent=r.dataset.u===CH.me?L("Kamu","You"):R.name(r.dataset.u));
  const n=bg.querySelector("#giN");if(n){n.value=c.name||"";bg.querySelector("#giSave").onclick=async()=>{const v=n.value.trim();if(!v)return;const {error}=await sb.from("couple_convs").update({name:v}).eq("id",c.id);if(error){alert(error.message);return}c.name=v;paintHead();paintInbox();status(L("Nama grup diganti","Group renamed"),"ok")}}
  bg.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>{bg.remove();E2()&&E2().safetyDialog(b.dataset.sc,R.name(b.dataset.sc))});
  bg.querySelectorAll("[data-rm]").forEach(b=>b.onclick=async()=>{if(!confirm(L("Keluarkan ","Remove ")+R.name(b.dataset.rm)+"?"))return;const {error}=await sb.rpc("ravi_group_remove",{c:c.id,u:b.dataset.rm});if(error){alert(error.message);return}bg.remove();await loadInbox();paintHead()});
  const add=bg.querySelector('[data-a="add"]');if(add)add.onclick=()=>{bg.remove();const have=new Set(ms.map(x=>x.u));const ppl=Object.keys(R.S.members).filter(u=>!have.has(u)&&(!R.isFriend||R.isFriend(u))),sel=new Set();
    const g2=modal(L("Tambah anggota","Add members"),`<div class="sh-list">${ppl.map(u=>`<button class="sh-it" data-u="${u}"><span class="ck">✓</span>${R.avatar(u,40)}<span class="tx"><b></b></span></button>`).join("")||`<div class="crumb">${L("Semua temanmu sudah ada di grup ini.","All your friends are already in this group.")}</div>`}</div>`,
      async()=>{if(!sel.size)return false;const {error}=await sb.rpc("ravi_group_add",{c:c.id,p_members:[...sel]});if(error){alert(error.message);return false}await loadInbox();paintHead();sendBody(c.id,{t:"➕ "+[...sel].map(R.name).join(", ")+L(" ditambahkan oleh "," added by ")+meName()})},L("Tambah","Add"));
    g2.querySelectorAll("[data-u]").forEach(b=>{b.querySelector(".tx b").textContent=R.name(b.dataset.u);b.onclick=()=>{const u=b.dataset.u;sel.has(u)?sel.delete(u):sel.add(u);b.classList.toggle("on")}})};
  bg.querySelector('[data-a="star"]').onclick=()=>{bg.remove();starredSheet()};bg.querySelector('[data-a="wp"]').onclick=()=>{bg.remove();wallSheet()};
  bg.querySelector('[data-a="leave"]').onclick=async()=>{if(!confirm(L("Keluar dari grup ini?","Leave this group?")))return;await sendBody(c.id,{t:"🚪 "+meName()+L(" keluar dari grup"," left the group")});const {error}=await sb.rpc("ravi_group_remove",{c:c.id,u:CH.me});if(error){alert(error.message);return}bg.remove();CH.convs.delete(c.id);closeRoom();if(!mobile())drawShell($$("#view"));paintInbox()}}
function roomMenu(btn,c){closeMenus();const r=btn.getBoundingClientRect();const ov=document.createElement("div");ov.className="cm-ov";ov.style.background="transparent";ov.onclick=closeMenus;
  const it=(a,i,t)=>`<button data-a="${a}">${ic(i,20)}<span>${t}</span></button>`;
  const menu=document.createElement("div");menu.className="cm-menu";menu.innerHTML=(c.kind==="group"?it("info","group",L("Info grup","Group info")):it("info","user",L("Info kontak","Contact info"))+it("sc","lock",L("Kode keamanan","Security code")))+it("star","star",L("Pesan berbintang","Starred messages"))+it("wp","wall","Wallpaper");
  document.body.append(ov,menu);menu.style.top=(r.bottom+4)+"px";menu.style.left=Math.max(8,r.right-menu.offsetWidth)+"px";
  menu.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const a=b.dataset.a;closeMenus();
    if(a==="info")c.kind==="group"?groupInfo(c):contactInfo(peer(c));else if(a==="sc")E2()&&E2().safetyDialog(peer(c),title(c));else if(a==="star")starredSheet();else if(a==="wp")wallSheet()})}
async function starredSheet(){const cid=CH.open;const ids=[...CH.stars];let rows=[];if(ids.length){const {data}=await sb.from("couple_msgs").select("*").in("id",ids.slice(-200)).eq("conv_id",cid);rows=(data||[]).sort((a,b)=>b.id-a.id)}
  const bg=modal("⭐ "+L("Pesan berbintang","Starred messages"),rows.length?`<div class="sh-list">${rows.map(m=>`<button class="sh-it" data-id="${m.id}">${R.avatar(m.sender,36)}<span class="tx"><b></b><span></span></span><span class="crumb">${shortTime(m.created_at)}</span></button>`).join("")}</div>`:`<div class="crumb">${L("Tekan lama pesan → ⭐ Bintangi untuk menyimpannya di sini.","Long-press a message → ⭐ Star to keep it here.")}</div>`,()=>true,"OK");
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  bg.querySelectorAll("[data-id]").forEach((b,i)=>{b.querySelector(".tx b").textContent=rows[i].sender===CH.me?L("Kamu","You"):R.name(rows[i].sender);b.querySelector(".tx span").textContent=snip(rows[i]);b.onclick=()=>{bg.remove();jumpTo(+b.dataset.id)}});
  document.addEventListener("ravi-e2e",function f(){if(!bg.isConnected){document.removeEventListener("ravi-e2e",f);return}bg.querySelectorAll("[data-id]").forEach((b,i)=>b.querySelector(".tx span").textContent=snip(rows[i]))})}
function wallSheet(){const cid=CH.open;const all=lsGet(wpKey(),{all:{t:"def"},per:{}});let cur=wpGet(cid),scope=all.per&&all.per[cid]?"one":"all";
  const prev=k=>{const p=(WPS.find(x=>x[0]===k)||WPS[0])[2]();return `background-color:${p.bg.startsWith("var")?"#ddd":p.bg};background-image:${p.img}`};
  const bg=modal("🖼️ Wallpaper",`<div class="tl-row" style="margin-bottom:10px"><button class="sm${scope==="one"?" pri":""}" data-s="one">${L("Chat ini saja","This chat only")}</button><button class="sm${scope==="all"?" pri":""}" data-s="all">${L("Semua chat","All chats")}</button></div>
    <div class="wp-grid">${WPS.map(([k,n])=>`<button data-w="${k}" class="${cur.t===k?"on":""}" style="${prev(k)}">${esc(n)}</button>`).join("")}<button data-w="photo" class="${cur.t==="photo"?"on":""}" style="background:var(--th);color:var(--ink);text-shadow:none;align-items:center;font-size:12px">📷<br>${L("Foto sendiri","My photo")}</button></div>
    <div id="wpDim" style="margin-top:12px;${cur.t==="photo"?"":"display:none"}"><label class="crumb">${L("Redupkan foto","Dim photo")}</label><input type="range" min="0" max="70" value="${Math.round((cur.dim??.15)*100)}" id="wpR" style="width:100%"></div>
    <input type="file" id="wpF" accept="image/*" hidden>`,()=>true,"OK");
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  const save=w=>{const a=lsGet(wpKey(),{all:{t:"def"},per:{}});a.per=a.per||{};if(scope==="one")a.per[cid]=w;else{a.all=w;delete a.per[cid]}lsSet(wpKey(),a);cur=w;applyWp($$("#rmBody"),cid);
    bg.querySelectorAll("[data-w]").forEach(b=>b.classList.toggle("on",b.dataset.w===w.t));bg.querySelector("#wpDim").style.display=w.t==="photo"?"":"none"};
  bg.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{scope=b.dataset.s;bg.querySelectorAll("[data-s]").forEach(x=>x.classList.toggle("pri",x===b));save(cur)});
  bg.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{if(b.dataset.w==="photo"){bg.querySelector("#wpF").click();return}save({t:b.dataset.w})});
  bg.querySelector("#wpF").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const img=await new Promise((y,n)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>y(i);i.onerror=n;i.src=u});
      const s=Math.min(1,1400/Math.max(img.naturalWidth,img.naturalHeight)),cv=document.createElement("canvas");cv.width=Math.round(img.naturalWidth*s);cv.height=Math.round(img.naturalHeight*s);cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
      const blob=await new Promise(r=>cv.toBlob(r,"image/jpeg",.82));const id="w"+Date.now().toString(36);await wpImg(id,blob);save({t:"photo",id,dim:.15})}catch(err){status(L("Foto tidak bisa dipakai.","Couldn't use that photo."),"warn")}};
  bg.querySelector("#wpR").oninput=e=>{if(cur.t==="photo")save({...cur,dim:+e.target.value/100})}}

/* =====================================================================
   PASANG
   ===================================================================== */
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{chat:v=>{try{viewChat(v)}catch(e){console.error(e);v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}}});
if(window.TOOL_ROUTES)window.TOOL_ROUTES.add("chat");
/* jangan render ulang halaman chat karena data keuangan berubah */
if(typeof render==="function"){const _r=render;render=function(){if(route==="chat"&&CH.ready&&document.getElementById("cx")&&!render._cx){renderNav();badge();return}return _r.apply(this,arguments)}}
const _go=go;go=function(r){if(r!=="chat")document.documentElement.classList.remove("cx-desk");if(r!=="chat"&&CH.open){closeRoom(true);if(history.state&&history.state.cx)history.replaceState(null,"")}
  if(r==="chat"&&route==="chat"&&document.getElementById("cx")){if(CH.open&&mobile())closeRoom();return}
  render._cx=true;try{return _go.apply(this,arguments)}finally{render._cx=false}};
addEventListener("resize",()=>{if(!CH.open)document.documentElement.classList.remove("cx-full");else if(mobile())document.documentElement.classList.add("cx-full");else document.documentElement.classList.remove("cx-full")});
/* sambungkan di latar belakang setelah login supaya pesan & badge tetap masuk */
addEventListener("load",()=>{const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);init().catch(()=>{})}},900);setTimeout(()=>clearInterval(t),60000)});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&CH.open&&route==="chat")markRead(CH.open)});
window.RAVI_CHAT={init,open:cid=>{if(CH.convs.has(cid))openRoom(cid);else init().then(()=>loadInbox()).then(()=>openRoom(cid)).catch(()=>{})},
  dmWith:async u=>{await init();const c=[...CH.convs.values()].find(x=>x.kind==="dm"&&peer(x)===u);if(c)return c.id;const {data,error}=await sb.rpc("ravi_dm",{other:u});if(error)throw error;await loadInbox();return data},
  addMember:()=>{R.init().then(()=>window.RAVI_INVITE?window.RAVI_INVITE():addMemberSheet())},addMemberManual:()=>{R.init().then(addMemberSheet)},convs:()=>CH.convs,title:cid=>title(CH.convs.get(cid)),snip,jump:(cid,mid)=>{openRoom(cid);setTimeout(()=>jumpTo(mid),400)},sendBody,state:CH};
})();
