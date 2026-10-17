/* =====================================================================
   MISI, ACHIEVEMENT & KOLEKSI STIKER
   Selesaikan misi → klaim → dapat stiker karakter (Biasa / Langka / Legendaris).
   Stiker Vina = Legendaris (paling langka). Disimpan di doc "quest" per akun.
   ===================================================================== */
(function(){
const RAR={C:{n:"Biasa",c:"#8e8e8e",bg:"#f1f0ee"},R:{n:"Langka",c:"#3f85e0",bg:"#e3efff"},L:{n:"Legendaris",c:"#c99a00",bg:"#fff4cc"}};
const GROUP={C:["pipi","moci","kodi","cimi","mumu"],R:["bubu","pandi","kiki","popo","rubi"],L:["vcap","vkantor","vorange","vsantai","vkrl"]};
const POSES=[["happy","Senang"],["party","Hore"],["sleep","Bobo"]];
const STICKERS=[];for(const r of ["C","R","L"])for(const ch of GROUP[r])for(const [m,mn] of POSES)STICKERS.push({id:ch+"_"+m,ch,mood:m,mn,r});
const stById=id=>STICKERS.find(s=>s.id===id);
const stName=s=>(window.CHARS?.[s.ch]?.name||s.ch)+" "+s.mn;
/* peluang per jenis hadiah: [Biasa, Langka, Legendaris] */
const ODDS={daily:[72,24,4],weekly:[45,43,12],ach:[30,55,15],big:[0,40,60],trade:[60,32,8]};

/* ---------- tanggal ---------- */
const iso=x=>x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");
const addD=(d,n)=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return iso(x)};
const monday=d=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()-(x.getDay()+6)%7);return iso(x)};

/* ---------- data pembantu ---------- */
const Q=()=>window.QUEST||{claimed:{},owned:{},log:[]};
const jes=()=>(typeof JE!=="undefined"?JE:[]).filter(j=>j.date!==OPEN_DATE);
const diary=()=>window.DIARY||{};
const notes=()=>window.NOTES||[];
const evs=()=>window.EVDOCS||[];
function diaryStreak(){const D=diary();let d=today();if(!D[d])d=addD(d,-1);let n=0;while(D[d]){n++;d=addD(d,-1)}return n}
function dayStrOf(ts){return ts?iso(new Date(ts)):""}

/* ---------- definisi misi ---------- */
function missions(){
  const td=today(),wk=monday(td),wkEnd=addD(wk,7),J=jes(),D=diary();
  const inWeek=d=>d>=wk&&d<wkEnd;
  const txToday=J.filter(j=>j.date===td||dayStrOf(j.created)===td).length;
  const noteToday=notes().filter(n=>dayStrOf(n.updated)===td).length;
  const realWeek=Object.values(typeof accState!=="undefined"?accState:{}).filter(a=>a&&a.realDate&&inWeek(a.realDate)).length;
  const diaryWeek=Object.keys(D).filter(inWeek).length;
  const txWeek=J.filter(j=>inWeek(j.date)).length;
  const daily=[
    {k:"d:"+td+":tx",e:"🧾",t:"Catat 1 transaksi hari ini",p:Math.min(txToday,1),n:1,rw:"daily",go:"input"},
    {k:"d:"+td+":dj",e:"📔",t:"Tulis jurnal harian hari ini",p:D[td]?1:0,n:1,rw:"daily",go:"diary"},
    {k:"d:"+td+":nt",e:"📝",t:"Tulis atau ubah 1 catatan",p:Math.min(noteToday,1),n:1,rw:"daily",go:"notes"}];
  const allDaily=daily.every(m=>m.p>=m.n);
  daily.push({k:"d:"+td+":all",e:"⭐",t:"Selesaikan semua misi harian",p:daily.filter(m=>m.p>=m.n).length,n:3,rw:"weekly",go:null});
  const weekly=[
    {k:"w:"+wk+":real",e:"🔎",t:"Cek saldo real minimal 1 rekening minggu ini",p:Math.min(realWeek,1),n:1,rw:"weekly",go:"recon"},
    {k:"w:"+wk+":dj5",e:"🗓️",t:"Tulis jurnal 5 hari minggu ini",p:Math.min(diaryWeek,5),n:5,rw:"weekly",go:"diary"},
    {k:"w:"+wk+":tx10",e:"💰",t:"Catat 10 transaksi minggu ini",p:Math.min(txWeek,10),n:10,rw:"weekly",go:"input"}];
  const opens=(typeof CASH!=="undefined"?CASH:[]).filter(a=>num(accState[a.id]?.opening)).length;
  let rr=[];try{rr=reconRows()}catch(e){}
  const checked=rr.filter(r=>r.real!=null),allMatch=checked.length>=3&&checked.every(r=>!r.bad);
  const streak=diaryStreak(),owned=Q().owned||{},ownedIds=Object.keys(owned).filter(k=>owned[k]>0);
  const hasR=r=>STICKERS.filter(s=>s.r===r).every(s=>owned[s.id]>0);
  const anyV=STICKERS.some(s=>s.r==="L"&&owned[s.id]>0);
  const ach=[
    {k:"a:firsttx",e:"🌱",t:"Transaksi pertama",d:"Catat transaksi pertamamu",p:Math.min(J.length,1),n:1,rw:"ach",go:"input"},
    {k:"a:open",e:"🏦",t:"Semua rekening siap",d:"Isi saldo awal 7 rekening",p:opens,n:7,rw:"ach",go:"recon"},
    {k:"a:budget",e:"📊",t:"Perencana",d:"Buat anggaran pertama",p:Object.keys(typeof budgets!=="undefined"?budgets:{}).length?1:0,n:1,rw:"ach",go:"budget"},
    {k:"a:match",e:"✅",t:"Buku = Bank",d:"Minimal 3 rekening dicek & semuanya cocok",p:allMatch?1:0,n:1,rw:"ach",go:"recon"},
    {k:"a:tx50",e:"📚",t:"Pencatat rajin",d:"Catat 50 transaksi",p:Math.min(J.length,50),n:50,rw:"ach",go:"input"},
    {k:"a:tx200",e:"🏆",t:"Akuntan sejati",d:"Catat 200 transaksi",p:Math.min(J.length,200),n:200,rw:"big",go:"input"},
    {k:"a:close",e:"🔒",t:"Tutup buku",d:"Tutup satu periode akuntansi",p:(typeof closed!=="undefined"&&closed.length)?1:0,n:1,rw:"big",go:"period"},
    {k:"a:fix",e:"🛠️",t:"Auditor kecil",d:"Pakai Reverse atau Reklas sekali",p:J.some(j=>j.type==="rev"||j.type==="reclass")?1:0,n:1,rw:"ach",go:"journal"},
    {k:"a:weekly",e:"🎓",t:"Jadwal semester",d:"Buat jadwal mingguan (acara berulang)",p:evs().some(e=>e.repeat==="WEEKLY")?1:0,n:1,rw:"ach",go:"sched"},
    {k:"a:dj7",e:"🔥",t:"Seminggu penuh",d:"Jurnal harian 7 hari berturut-turut",p:Math.min(streak,7),n:7,rw:"ach",go:"diary"},
    {k:"a:dj30",e:"💎",t:"Sebulan konsisten",d:"Jurnal harian 30 hari berturut-turut",p:Math.min(streak,30),n:30,rw:"big",go:"diary"},
    {k:"a:notes10",e:"🗂️",t:"Kolektor catatan",d:"Punya 10 catatan",p:Math.min(notes().length,10),n:10,rw:"ach",go:"notes"},
    {k:"a:bills",e:"⏰",t:"Anti telat bayar",d:"Atur pengingat keuangan otomatis",p:window.BILLS?1:0,n:1,rw:"ach",go:"sched"},
    {k:"a:col10",e:"🎒",t:"Mulai mengoleksi",d:"Kumpulkan 10 stiker berbeda",p:Math.min(ownedIds.length,10),n:10,rw:"ach",go:"album"},
    {k:"a:allC",e:"🐾",t:"Sahabat hewan",d:"Lengkapi semua stiker Biasa",p:STICKERS.filter(s=>s.r==="C"&&owned[s.id]>0).length,n:15,rw:"big",go:"album"},
    {k:"a:allR",e:"🌟",t:"Pemburu langka",d:"Lengkapi semua stiker Langka",p:STICKERS.filter(s=>s.r==="R"&&owned[s.id]>0).length,n:15,rw:"big",go:"album"},
    {k:"a:vina1",e:"👑",t:"Ketemu Vina!",d:"Dapatkan stiker Legendaris pertama",p:anyV?1:0,n:1,rw:"ach",go:"album"},
    {k:"a:allL",e:"💖",t:"Album sempurna",d:"Lengkapi semua 15 stiker Vina",p:STICKERS.filter(s=>s.r==="L"&&owned[s.id]>0).length,n:15,rw:"big",go:"album"}];
  const st=m=>({...m,done:m.p>=m.n,claimed:!!Q().claimed[m.k]});
  return {daily:daily.map(st),weekly:weekly.map(st),ach:ach.map(st)}}
function claimable(){const M=missions();return [...M.daily,...M.weekly,...M.ach].filter(m=>m.done&&!m.claimed)}

/* ---------- undian stiker ---------- */
function rnd(){try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/2**32}catch(e){return Math.random()}}
function draw(kind){const o=ODDS[kind]||ODDS.daily,x=rnd()*100;const r=x<o[0]?"C":x<o[0]+o[1]?"R":"L";
  const pool=STICKERS.filter(s=>s.r===r);return pool[Math.floor(rnd()*pool.length)]}
function packFor(kind){if(kind==="ach")return [draw("ach"),draw("daily")];if(kind==="big")return [draw("big"),draw("ach"),draw("daily")];return [draw(kind)]}
async function saveQ(q){window.QUEST=q;await col.doc("quest").set(q)}
async function claim(m){
  if(!col)return;const q=JSON.parse(JSON.stringify(Q()));q.claimed=q.claimed||{};q.owned=q.owned||{};q.log=q.log||[];
  if(q.claimed[m.k])return;const got=packFor(m.rw);
  q.claimed[m.k]=Date.now();got.forEach(s=>q.owned[s.id]=(q.owned[s.id]||0)+1);
  q.log=[{t:Date.now(),k:m.k,got:got.map(s=>s.id)},...q.log].slice(0,40);
  try{await saveQ(q)}catch(e){alert("Gagal klaim: "+e.message);return}
  reveal(got,m.t)}
async function trade(){
  const q=JSON.parse(JSON.stringify(Q()));const dup=Object.entries(q.owned||{}).filter(([,n])=>n>1);
  let total=dup.reduce((s,[,n])=>s+n-1,0);if(total<5){alert("Butuh 5 stiker duplikat untuk ditukar.");return}
  let need=5;dup.sort((a,b)=>rarIdx(a[0])-rarIdx(b[0])||b[1]-a[1]);
  for(const [id] of dup){while(need&&q.owned[id]>1){q.owned[id]--;need--}if(!need)break}
  const s=draw("trade");q.owned[s.id]=(q.owned[s.id]||0)+1;q.log=[{t:Date.now(),k:"trade",got:[s.id]},...(q.log||[])].slice(0,40);
  try{await saveQ(q)}catch(e){alert("Gagal tukar: "+e.message);return}reveal([s],"Tukar 5 duplikat")}
const rarIdx=id=>({C:0,R:1,L:2})[stById(id)?.r]??0;

/* ---------- tampilan ---------- */
const css=document.createElement("style");css.textContent=`
.qbar{height:8px;background:var(--th);border-radius:99px;overflow:hidden;margin-top:6px}.qbar i{display:block;height:100%;background:var(--acc);border-radius:99px}
.qrow{display:flex;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line)}.qrow:last-child{border-bottom:0}
.qrow .qe{font-size:22px;flex:none;width:30px;text-align:center}.qrow .qm{flex:1;min-width:0}.qrow .qm b{font-size:14px}.qrow .qm .crumb{font-size:12px}
.qrow.done .qm b{color:var(--grn)}.qrow.claimed{opacity:.55}
.rar{display:inline-block;font-size:10.5px;font-weight:800;padding:1px 7px;border-radius:99px;letter-spacing:.02em}
.stgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.stc{border:2px solid var(--line);border-radius:16px;padding:6px 4px 8px;text-align:center;background:var(--card);position:relative}
.stc .nm{font-size:11.5px;font-weight:700;line-height:1.2;margin-top:2px}.stc .ct{position:absolute;top:4px;right:6px;font-size:11px;font-weight:800;color:var(--mute)}
.stc.lock{opacity:.45;filter:grayscale(1)}.stc.lock .pipi{filter:brightness(0) opacity(.35)}
.stc.L:not(.lock){border-color:#e8c14a;background:linear-gradient(160deg,#fff8dc,#fff 60%);box-shadow:0 0 0 2px #fff3c4 inset,0 4px 14px rgba(201,154,0,.25)}
.stc.R:not(.lock){border-color:#8fbaf0;background:linear-gradient(160deg,#eaf3ff,#fff 60%)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .stc.L:not(.lock){background:linear-gradient(160deg,#3a3014,var(--card) 60%)}:root:not([data-theme="light"]) .stc.R:not(.lock){background:linear-gradient(160deg,#1a2a40,var(--card) 60%)}}
.shine{position:relative;overflow:hidden}.shine:after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.75) 50%,transparent 60%);animation:sh 2.4s infinite}
@keyframes sh{from{transform:translateX(-60%)}to{transform:translateX(60%)}}
.rv{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.rvc{width:128px;height:168px;perspective:800px;cursor:pointer}
.rvi{width:100%;height:100%;position:relative;transition:transform .7s cubic-bezier(.3,1.4,.5,1);transform-style:preserve-3d}
.rvc.open .rvi{transform:rotateY(180deg)}
.rvf,.rvb{position:absolute;inset:0;border-radius:18px;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid var(--line)}
.rvf{background:linear-gradient(135deg,var(--g1,#7c4dff),var(--g2,#ff6fa8));color:#fff;font-size:42px;font-weight:800}
.rvb{transform:rotateY(180deg);background:var(--card)}
.rvb.L{border-color:#e8c14a;background:linear-gradient(160deg,#fff4c2,#fff)}.rvb.R{border-color:#8fbaf0;background:linear-gradient(160deg,#e3efff,#fff)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .rvb.L{background:linear-gradient(160deg,#4a3c12,var(--card))}:root:not([data-theme="light"]) .rvb.R{background:linear-gradient(160deg,#1a2a40,var(--card))}}
.qbadge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:99px;background:#ff4d6d;color:#fff;font-size:11px;font-weight:800;margin-left:6px}
#questBtn{background:none;color:var(--hdrInk);border-color:rgba(255,255,255,.35);position:relative}
#questBtn .qbadge{position:absolute;top:-6px;right:-6px;margin:0}
.ph-deco{display:inline-flex;gap:2px;vertical-align:middle;margin-left:8px}.ph-deco .pipi{animation:none!important}
html:not(.fun) .ph-deco{display:none}
.confetti{position:fixed;inset:0;pointer-events:none;z-index:300;overflow:hidden}.confetti i{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;animation:cf 1.8s ease-in forwards}
@keyframes cf{to{transform:translateY(105vh) rotate(720deg);opacity:.8}}
@media (prefers-reduced-motion:reduce){.shine:after,.confetti i{animation:none}.rvi{transition:none}}`;
document.head.appendChild(css);
const rarPill=r=>`<span class="rar" style="background:${RAR[r].bg};color:${RAR[r].c}">${RAR[r].n}</span>`;
function confetti(){const c=document.createElement("div");c.className="confetti";const cols=["#ff6fa8","#7c4dff","#ffd23f","#33c38a","#3f85e0"];
  for(let i=0;i<60;i++){const s=document.createElement("i");s.style.left=Math.random()*100+"%";s.style.background=cols[i%5];s.style.animationDelay=Math.random()*.6+"s";s.style.animationDuration=1.4+Math.random()*1.2+"s";c.appendChild(s)}
  document.body.appendChild(c);setTimeout(()=>c.remove(),3200)}
function reveal(got,title){
  const best=got.reduce((b,s)=>rarIdx(s.id)>rarIdx(b.id)?s:b,got[0]);
  const bg=modal("🎁 "+title,`<div class="crumb" style="text-align:center;margin-bottom:10px">Ketuk kartu untuk membuka</div>
   <div class="rv">${got.map((s,i)=>`<div class="rvc" data-i="${i}"><div class="rvi"><div class="rvf">?</div><div class="rvb ${s.r}${s.r!=="C"?" shine":""}">${pipi(s.mood,92,s.ch)}<div style="font-weight:800;font-size:13px">${esc(stName(s))}</div>${rarPill(s.r)}${(Q().owned[s.id]||0)===1?'<div class="crumb" style="font-size:11px;margin-top:2px">✨ Baru!</div>':""}</div></div></div>`).join("")}</div>`,async()=>{render()},"Simpan ke album");
  const cx=bg.querySelector(".c");if(cx)cx.style.display="none";
  const cards=[...bg.querySelectorAll(".rvc")];let opened=0;
  cards.forEach(c=>c.onclick=()=>{if(c.classList.contains("open"))return;c.classList.add("open");opened++;if(got[+c.dataset.i].r==="L")confetti()});
  setTimeout(()=>cards.forEach((c,i)=>setTimeout(()=>c.click(),i*450)),900)}

function mRow(m){const pct=Math.round(Math.min(1,m.p/m.n)*100);
  return `<div class="qrow ${m.done?"done":""} ${m.claimed?"claimed":""}"><div class="qe">${m.e}</div><div class="qm"><b>${esc(m.t)}</b>${m.d?`<div class="crumb">${esc(m.d)}</div>`:""}
   <div class="qbar"><i style="width:${pct}%"></i></div><div class="crumb">${Math.min(m.p,m.n)}/${m.n} · hadiah: ${({daily:"1 stiker",weekly:"1 stiker (peluang Langka ↑)",ach:"2 stiker",big:"3 stiker (peluang Legendaris tinggi)"})[m.rw]}</div></div>
   <div>${m.claimed?'<span class="pill p-ok">✓ Diklaim</span>':m.done?`<button class="sm pri" data-claim="${esc(m.k)}">🎁 Klaim</button>`:m.go?`<button class="sm" data-gom="${m.go}">Kerjakan</button>`:""}</div></div>`}
function vQuest(v){
  const M=missions(),q=Q(),owned=q.owned||{},have=STICKERS.filter(s=>owned[s.id]>0).length,cl=claimable().length;
  const dup=Object.values(owned).reduce((s,n)=>s+Math.max(0,n-1),0);
  v.innerHTML=page("Misi","Misi & Achievement",`<button class="pri" id="qAlbum">📒 Album stiker (${have}/${STICKERS.length})</button>`)+
   `<div class="tiles"><div class="tile"><div class="k">Siap diklaim</div><div class="v">${cl} 🎁</div><div class="s">${cl?"klaim untuk dapat stiker":"selesaikan misi di bawah"}</div></div>
    <div class="tile"><div class="k">Koleksi</div><div class="v">${have}/${STICKERS.length}</div><div class="s">${STICKERS.filter(s=>s.r==="L"&&owned[s.id]>0).length}/15 Legendaris (Vina)</div></div>
    <div class="tile"><div class="k">Duplikat</div><div class="v">${dup}</div><div class="s">${dup>=5?'<button class="lnk" id="qTrade">Tukar 5 → 1 tarikan</button>':"5 duplikat = 1 tarikan"}</div></div></div>
   <div class="region"><div class="rh"><span>☀️ Misi harian</span><span class="crumb">reset setiap hari</span></div><div class="rb flush">${M.daily.map(mRow).join("")}</div></div>
   <div class="region"><div class="rh"><span>📅 Misi mingguan</span><span class="crumb">reset setiap Senin</span></div><div class="rb flush">${M.weekly.map(mRow).join("")}</div></div>
   <div class="region"><div class="rh"><span>🏅 Achievement</span><span class="crumb">${M.ach.filter(m=>m.claimed).length}/${M.ach.length}</span></div><div class="rb flush">${M.ach.sort((a,b)=>(b.done&&!b.claimed)-(a.done&&!a.claimed)||a.claimed-b.claimed).map(mRow).join("")}</div></div>
   <div class="region"><div class="rh">🎲 Peluang stiker</div><div class="rb"><table><tr><th>Hadiah</th><th class="n">${rarPill("C")}</th><th class="n">${rarPill("R")}</th><th class="n">${rarPill("L")}</th></tr>
    ${[["Misi harian","daily"],["Misi mingguan","weekly"],["Achievement","ach"],["Achievement besar","big"],["Tukar duplikat","trade"]].map(([n,k])=>`<tr><td>${n}</td>${ODDS[k].map(x=>`<td class="n">${x}%</td>`).join("")}</tr>`).join("")}</table>
    <div class="crumb" style="margin-top:6px">Biasa: Pipi, Moci, Kodi, Cimi, Mumu · Langka: Bubu, Pandi, Kiki, Popo, Rubi · <b>Legendaris: 5 Vina</b>. Tiap karakter punya 3 pose.</div></div></div>`;
  v.querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>{const m=[...M.daily,...M.weekly,...M.ach].find(x=>x.k===b.dataset.claim);if(m){b.disabled=true;claim(m)}});
  v.querySelectorAll("[data-gom]").forEach(b=>b.onclick=()=>go(b.dataset.gom));
  $("qAlbum").onclick=()=>go("album");const t=$("qTrade");if(t)t.onclick=trade}
let albumF="all";
function vAlbum(v){
  const owned=Q().owned||{},have=STICKERS.filter(s=>owned[s.id]>0).length;
  const sec=r=>{const xs=STICKERS.filter(s=>s.r===r),h=xs.filter(s=>owned[s.id]>0).length;
    return `<div class="region"><div class="rh"><span>${rarPill(r)} ${({C:"Hewan sahabat",R:"Hewan langka",L:"Vina"})[r]}</span><span class="crumb">${h}/${xs.length}</span></div><div class="rb"><div class="stgrid">
     ${xs.map(s=>{const n=owned[s.id]||0;return `<div class="stc ${s.r} ${n?"":"lock"}${n&&s.r==="L"?" shine":""}">${n>1?`<span class="ct">×${n}</span>`:""}${pipi(s.mood,72,s.ch)}<div class="nm">${n?esc(stName(s)):"???"}</div></div>`}).join("")}</div></div></div>`};
  v.innerHTML=page("Misi","Album Stiker",`<button class="pri" id="aMis">🎯 Misi</button>`)+
   `<div class="tiles"><div class="tile"><div class="k">Terkumpul</div><div class="v">${have}/${STICKERS.length}</div><div class="qbar"><i style="width:${have/STICKERS.length*100}%"></i></div></div></div>`+
   sec("L")+sec("R")+sec("C")+
   ((Q().log||[]).length?`<div class="region"><div class="rh">Riwayat terakhir</div><div class="rb flush"><table>${Q().log.slice(0,8).map(l=>`<tr><td style="white-space:nowrap">${new Date(l.t).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}</td><td>${l.got.map(id=>{const s=stById(id);return s?esc(stName(s))+" "+rarPill(s.r):""}).join(" · ")}</td></tr>`).join("")}</table></div></div>`:"");
  $("aMis").onclick=()=>go("quest")}

/* ---------- tombol 🎯 di header + hiasan kecil di tiap halaman ---------- */
let lastClaimable=-1;
function deco(){
  const hdr=document.querySelector("header .acts-r")||document.querySelector("header");if(!hdr)return;
  let b=document.getElementById("questBtn");
  if(!b){b=document.createElement("button");b.id="questBtn";b.className="sm";b.title="Misi & stiker";b.onclick=()=>go("quest");const lang=document.getElementById("langBtn");lang?lang.before(b):hdr.appendChild(b)}
  const n=col?claimable().length:0;b.innerHTML="🎯"+(n?`<span class="qbadge">${n}</span>`:"");
  if(col&&lastClaimable>=0&&n>lastClaimable&&window.doPeek)window.doPeek(true,{t:"Misi selesai! 🎉",d:"Ada hadiah stiker yang bisa diklaim. Ketuk untuk buka.",r:"quest",m:"party",w:9});
  if(col)lastClaimable=n;
  // stiker kecil di judul halaman
  const h1=document.querySelector("#view .ph h1");
  if(h1&&!h1.querySelector(".ph-deco")){const owned=Q().owned||{},mine=STICKERS.filter(s=>owned[s.id]>0);
    if(mine.length){const seed=[...(route||"")].reduce((a,c)=>a+c.charCodeAt(0),0)+new Date().getDate();
      const pick=[0,1].map(i=>mine[(seed*7+i*13)%mine.length]).filter((s,i,a)=>a.indexOf(s)===i);
      const sp=document.createElement("span");sp.className="ph-deco";sp.innerHTML=pick.map(s=>pipi(s.mood,26,s.ch)).join("");h1.appendChild(sp)}}}
if(typeof render==="function"){const _r=render;render=function(){_r();try{deco()}catch(e){}}}

/* ---------- daftar menu ---------- */
NAV.push(["Misi",[["quest","Misi & Achievement"],["album","Album Stiker"]]]);
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{quest:vQuest,album:vAlbum});
window.QUEST_STICKERS=STICKERS;
addEventListener("load",()=>{try{deco()}catch(e){}});
})();
