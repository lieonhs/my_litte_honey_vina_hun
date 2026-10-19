/* =====================================================================
   🛡️ PANEL ADMIN (khusus akun admin, mis. Rafi)
   - Setujui / tolak orang yang mendaftar lewat link undangan
   - Undang orang, lihat & keluarkan anggota, riwayat keputusan
   Akun yang belum disetujui dikunci di database (tidak bisa membaca data apa pun).
   ===================================================================== */
(function(){
const R=window.RS;if(!R)return;
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const A={list:[],sub:false,ready:null};
const isAdmin=()=>R.S.me&&R.S.members[R.S.me]?.role==="admin";
const pending=()=>A.list.filter(x=>x.status==="pending");
window.RAVI_ADMIN_PENDING=()=>isAdmin()?pending().length:0;
async function load(){const {data,error}=await sb.from("ravi_join_requests").select("*").order("created_at",{ascending:false}).limit(60);if(error)throw error;A.list=data||[];emit()}
function emit(){document.dispatchEvent(new CustomEvent("ravi-admin"));document.dispatchEvent(new CustomEvent("ravi-notif"))}
async function init(){if(A.ready)return A.ready;A.ready=(async()=>{await R.init();if(!isAdmin())return false;await load();
    if(!A.sub){A.sub=true;sb.channel("ravi-admin-jr").on("postgres_changes",{event:"*",schema:"public",table:"ravi_join_requests"},()=>{load().then(()=>{if(route==="admin")draw($("view"))}).catch(()=>{})}).subscribe()}
    return true})();A.ready.catch(()=>{A.ready=null});return A.ready}
const css=document.createElement("style");css.textContent=`
.ad-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.ad-stat{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px;text-align:center}.ad-stat b{display:block;font-size:24px}.ad-stat span{font-size:12px;color:var(--mute)}
.ad-stat.hot{border-color:var(--acc);background:var(--accS)}
.ad-row{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}.ad-row:last-child{border-bottom:0}
.ad-row .tx{flex:1;min-width:0}.ad-row .tx b{display:block}.ad-row .tx>span{display:block;font-size:12.5px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ad-row .tx b span{display:inline}
.ad-row .act{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.ad-row.new{animation:adIn .3s ease-out}@keyframes adIn{from{background:var(--accS)}to{background:transparent}}
.ad-ok{background:#25d366!important;border-color:#25d366!important;color:#fff!important}
.ad-tag{font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--th);margin-left:6px}
.ad-empty{color:var(--mute);font-size:13.5px;padding:6px 0}
.ad-qb{position:relative;height:12px;border-radius:99px;background:var(--th);overflow:hidden;margin-bottom:8px}.ad-qb span{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:#22c55e;transition:width .4s}
.ad-qb span.warn{background:#f59e0b}.ad-qb span.calls{background:#f97316}.ad-qb span.all{background:#ef4444}.ad-qb i{position:absolute;top:0;bottom:0;width:2px;background:var(--ink);opacity:.35}.ad-ql{margin-bottom:4px}`;document.head.appendChild(css);
const ago=t=>R.ago(t);
function draw(v){if(!v)return;
  if(!isAdmin()){v.innerHTML=page(L("Akun","Account"),"🛡️ "+L("Panel Admin","Admin Panel"))+`<div class="region"><div class="rb crumb">${L("Halaman ini khusus admin Talk&Talk.","This page is for the Talk&Talk admin only.")}</div></div>`;return}
  const pend=pending(),hist=A.list.filter(x=>x.status!=="pending").slice(0,15),mem=Object.values(R.S.members);
  v.innerHTML=page(L("Akun","Account"),"🛡️ "+L("Panel Admin","Admin Panel"))+
   `<div class="ad-stats"><div class="ad-stat${pend.length?" hot":""}"><b>${pend.length}</b><span>${L("Menunggu persetujuan","Waiting for approval")}</span></div><div class="ad-stat"><b>${mem.length}</b><span>${L("Anggota","Members")}</span></div><div class="ad-stat"><b id="adInv">–</b><span>${L("Link aktif","Active links")}</span></div></div>
    <div class="region"><div class="rh">📞 ${L("Kuota telepon Cloudflare (bulan ini)","Cloudflare call quota (this month)")}</div><div class="rb" id="adQuota"><div class="crumb">…</div></div></div>
    <div class="region"><div class="rh"><span>⏳ ${L("Permintaan bergabung","Join requests")}</span></div><div class="rb" id="adPend">${pend.length?pend.map(x=>`<div class="ad-row" data-u="${x.user_id}"><span class="rv-av txt" style="width:44px;height:44px;font-size:18px;background:hsl(${[...x.user_id].reduce((h,c)=>(h*31+c.charCodeAt(0))%360,0)} 60% 55%)">${esc((x.name||"?").charAt(0).toUpperCase())}</span>
       <div class="tx"><b></b><span class="em"></span><span>${L("Mendaftar ","Signed up ")}${ago(x.created_at)}${L(" lalu"," ago")}</span></div><div class="act"><button class="sm ad-ok" data-ok="${x.user_id}">✓ ${L("Setujui","Approve")}</button><button class="sm" data-no="${x.user_id}" style="color:var(--red)">✕ ${L("Tolak","Decline")}</button></div></div>`).join("")
      :`<div class="ad-empty">${L("Tidak ada permintaan. Orang yang daftar lewat link undangan akan muncul di sini dan belum bisa masuk sampai kamu setujui.","No requests. People who sign up through an invite link appear here and can't get in until you approve them.")}</div>`}</div></div>
    <div class="region"><div class="rh"><span>✉️ ${L("Undang","Invite")}</span><button class="sm pri" id="adInvite">🔗 ${L("Buat link undangan","Create invite link")}</button></div><div class="rb"><div class="crumb" style="line-height:1.5">${L("Kirim link lewat WhatsApp. Orangnya daftar sendiri, lalu <b>menunggu persetujuanmu</b> di atas. Link sekali pakai, berlaku 7 hari.","Send the link on WhatsApp. They sign up themselves, then <b>wait for your approval</b> above. Single-use, valid for 7 days.")}</div></div></div>
    <div class="region"><div class="rh">👥 ${L("Anggota","Members")} (${mem.length})</div><div class="rb">${mem.map(m=>`<div class="ad-row" data-m="${m.user_id}">${R.avatar(m.user_id,40)}<div class="tx"><b><span class="nm"></span>${m.role==="admin"?`<span class="ad-tag">👑 admin</span>`:""}${m.partner?`<span class="ad-tag">💑</span>`:""}</b><span>${window.RAVI_PRESENCE&&RAVI_PRESENCE.online(m.user_id)?"🟢 online":m.last_seen?L("Terakhir aktif ","Last active ")+ago(m.last_seen):""}</span></div>${!m.partner&&m.user_id!==R.S.me?`<div class="act"><button class="sm" data-kick="${m.user_id}" style="color:var(--red)">${L("Keluarkan","Remove")}</button></div>`:""}</div>`).join("")}</div></div>
    ${hist.length?`<div class="region"><div class="rh">📜 ${L("Riwayat","History")}</div><div class="rb">${hist.map(x=>`<div class="ad-row"><span style="font-size:20px">${x.status==="approved"?"✅":"⛔"}</span><div class="tx"><b></b><span>${x.status==="approved"?L("Disetujui","Approved"):L("Ditolak","Declined")} · ${x.decided_at?ago(x.decided_at):""}</span></div></div>`).join("")}</div></div>`:""}
    <div class="crumb" style="margin:6px 2px 20px;line-height:1.5">🔒 ${L("Akun yang belum disetujui sudah dikunci di database: tidak bisa membaca chat, feed, maupun data keuangan apa pun.","Accounts that aren't approved are locked in the database: they can't read any chat, feed or finance data.")}</div>`;
  v.querySelectorAll("#adPend .ad-row").forEach((r,i)=>{r.querySelector(".tx b").textContent=pend[i].name||"?";r.querySelector(".em").textContent=pend[i].email||""});
  v.querySelectorAll("[data-m]").forEach(r=>r.querySelector(".nm").textContent=R.name(r.dataset.m));
  const hrows=v.querySelectorAll(".region:nth-last-of-type(1) .ad-row .tx b");void hrows;
  [...v.querySelectorAll(".ad-row")].filter(r=>!r.dataset.u&&!r.dataset.m).forEach((r,i)=>{const x=hist[i];if(x)r.querySelector(".tx b").textContent=(x.name||"?")+(x.email?" · "+x.email:"")});
  $("adInvite").onclick=()=>window.RAVI_INVITE&&window.RAVI_INVITE();
  v.querySelectorAll("[data-ok]").forEach(b=>b.onclick=()=>decide(b.dataset.ok,true,b));
  v.querySelectorAll("[data-no]").forEach(b=>b.onclick=()=>{const x=A.list.find(y=>y.user_id===b.dataset.no);modal(L("Tolak ","Decline ")+(x?.name||"")+"?",`<div class="crumb">${L("Akunnya diblokir dan tidak bisa masuk. Kamu bisa mengundangnya lagi nanti lewat Undang → manual.","Their account is blocked and can't sign in. You can invite them again later via Invite → manual.")}</div>`,()=>{decide(b.dataset.no,false,b)},L("Tolak","Decline"))});
  v.querySelectorAll("[data-kick]").forEach(b=>b.onclick=()=>window.RAVI_REMOVE_MEMBER&&window.RAVI_REMOVE_MEMBER(b.dataset.kick,()=>draw($("view"))));
  sb.rpc("ravi_usage_month").then(({data})=>{const box=document.getElementById("adQuota");if(!box)return;const b=+data||0,gb=b/1e9,pc=Math.min(100,gb/1000*100);
    const lvl=gb>=899?"all":gb>=700?"calls":gb>=600?"warn":"ok";
    box.innerHTML=`<div class="ad-q"><div class="ad-qb"><span style="width:${pc.toFixed(2)}%" class="${lvl}"></span><i style="left:70%"></i><i style="left:89.9%"></i></div>
      <div class="ad-ql"><b>${gb<10?gb.toFixed(2):gb.toFixed(0)} GB</b> ${L("dari 1.000 GB gratis","of the free 1,000 GB")}</div>
      <div class="crumb" style="line-height:1.5">${lvl==="all"?"⛔ "+L("≥ 899 GB: akses ke Cloudflare diputus total (telepon, video call & berbagi layar). Chat, feed & lainnya tetap jalan — tidak memakai Cloudflare.","≥ 899 GB: Cloudflare access fully cut (calls, video & screen share). Chat, feed etc. keep working — they don't use Cloudflare."):lvl==="calls"?"🚫 "+L("≥ 700 GB: telepon & video call dimatikan sampai bulan depan.","≥ 700 GB: voice & video calls are off until next month."):lvl==="warn"?"⚠️ "+L("Mendekati batas 700 GB — telepon akan dimatikan otomatis.","Close to the 700 GB limit — calls will switch off automatically."):"✅ "+L("Aman. Hanya telepon & video call yang memakai Cloudflare — mati otomatis di 700 GB. Chat & feed tidak memakai kuota ini.","Fine. Only calls & video use Cloudflare — they switch off at 700 GB. Chat & feed don't use this quota.")}<br>${L("Dihitung dari aplikasi (hanya panggilan lewat relay). Angka pasti ada di dash.cloudflare.com → Realtime → TURN.","Counted by the app (relayed calls only). Exact numbers: dash.cloudflare.com → Realtime → TURN.")}</div></div>`},()=>{});
  sb.from("ravi_invites").select("code,expires_at,used_by").then(({data})=>{const n=(data||[]).filter(x=>!x.used_by&&new Date(x.expires_at)>new Date()).length;const e=document.getElementById("adInv");if(e)e.textContent=n},()=>{})}
async function decide(uid,ok,btn){if(btn){btn.disabled=true;btn.textContent="…"}
  try{await window.RAVI_FN({action:ok?"approve_join":"reject_join",user_id:uid});const x=A.list.find(y=>y.user_id===uid);if(x)x.status=ok?"approved":"rejected";
    if(ok)await R.loadMembers();status(ok?L("Disetujui ✓ — dia sekarang bisa masuk dan chat denganmu.","Approved ✓ — they can now sign in and chat with you."):L("Permintaan ditolak.","Request declined."),"ok");
    emit();if(ok&&window.RAVI_CHAT)window.RAVI_CHAT.init().catch(()=>{});draw($("view"))}
  catch(e){if(btn){btn.disabled=false}status(e.message||String(e),"err");draw($("view"))}}

window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{admin:v=>{R.withInit(v,"🛡️ "+L("Panel Admin","Admin Panel"),x=>{init().then(()=>draw(x)).catch(e=>{x.innerHTML='<div class="msg err">'+esc(e.message||String(e))+'</div>'})})}});
if(window.TOOL_ROUTES)window.TOOL_ROUTES.add("admin");
const grp=NAV.find(([g])=>g==="Berdua");if(grp)grp[1].push(["admin","🛡️ Panel Admin"]);
if(window.RAVI_ICON)window.RAVI_ICON.admin="🛡️";
/* sembunyikan menu admin dari non-admin */
const hide=document.createElement("style");hide.id="adHide";document.head.appendChild(hide);
function syncMenu(){hide.textContent=isAdmin()?"":'aside a[data-r="admin"],#menuSheet [data-go="admin"]{display:none!important}'}
document.addEventListener("ravi-admin",syncMenu);
addEventListener("load",()=>{syncMenu();const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);init().then(syncMenu).catch(()=>{})}},1200);setTimeout(()=>clearInterval(t),60000)});
window.RAVI_ADMIN={init,isAdmin};
})();
