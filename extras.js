/* =====================================================================
   ALAT TAMBAHAN: Mood Harian · Kapsul Waktu · Bucket List · Kartu Obrolan · Kurs
   Data di dokumen "tools" yang sama (field mood, capsule, bucket, fx).
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const tday=()=>typeof today==="function"?today():new Date().toISOString().slice(0,10);
const D=s=>new Date(s+"T00:00:00");
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dDiff=(a,b)=>Math.round((D(b)-D(a))/864e5);
const fmtD=s=>D(s).toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short",year:"numeric"});
const T=()=>window.TOOLS||{};
async function saveT(patch){if(!col){alert(L("Belum tersambung ke database.","Not connected to the database yet."));return false}
  const t={...JSON.parse(JSON.stringify(T())),...patch};window.TOOLS=t;
  try{await col.doc("tools").set(t);return true}catch(e){alert(L("Gagal menyimpan: ","Save failed: ")+e.message);return false}}
const uid=()=>Math.random().toString(36).slice(2,9);
const back=`<button class="sm" data-tgo="tools">← ${L("Semua alat","All tools")}</button>`;
const wire=v=>v.querySelectorAll("[data-tgo]").forEach(b=>b.onclick=()=>go(b.dataset.tgo));
function sure(b){if(b.dataset.sure)return true;b.dataset.sure="1";const o=b.textContent;b.textContent=L("Yakin? Ketuk lagi","Sure? Tap again");setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent=o}},2500);return false}

const css=document.createElement("style");css.textContent=`
.mo-pick{display:flex;gap:6px;flex-wrap:wrap}
.mo-btn{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;min-width:64px;border:2px solid var(--line);border-radius:14px;background:var(--card);font-size:11.5px;font-weight:700;color:var(--mute)}
.mo-btn span{font-size:26px;line-height:1}.mo-btn.on{border-color:var(--acc);background:var(--accS);color:var(--ink)}.mo-btn:focus-visible{outline:3px solid var(--acc)}
.mo-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.mo-cal .h{font-size:11px;font-weight:800;color:var(--mute);text-align:center}
.mo-cal .d{aspect-ratio:1;border-radius:10px;background:var(--th);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;color:var(--mute);min-width:0}
.mo-cal .d b{font-size:clamp(14px,4.5vw,22px);line-height:1}.mo-cal .d.td{outline:2px solid var(--acc)}.mo-cal .d.x{background:none}
.mo-bars{display:flex;flex-direction:column;gap:6px}.mo-bars .r{display:grid;grid-template-columns:28px 1fr 34px;gap:8px;align-items:center;font-size:12px}
.mo-bars .r i{display:block;height:10px;border-radius:99px;background:var(--acc)}
.cp-lock{display:flex;gap:12px;align-items:center}.cp-lock .ic{font-size:30px}
.cp-body{white-space:pre-wrap;line-height:1.6;background:var(--th);border-radius:12px;padding:12px 14px;margin-top:8px}
.ob-card{min-height:200px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:10px;padding:24px 18px;border-radius:22px;border:2px solid var(--line);background:linear-gradient(150deg,var(--accS),var(--card) 65%);transition:transform .35s}
.ob-card.flip{transform:rotateY(8deg) scale(.98)}
.ob-card .q{font-size:clamp(17px,4.6vw,21px);font-weight:800;line-height:1.4;max-width:30ch;text-wrap:balance}.ob-card .n{font-size:12px;color:var(--mute)}
.fx-row{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}.fx-row:last-child{border-bottom:0}
.fx-row .c{font-weight:800}.fx-row .v{font-variant-numeric:tabular-nums;font-weight:700;text-align:right}
@media (prefers-reduced-motion:reduce){.ob-card{transition:none}}
`;document.head.appendChild(css);

/* =====================================================================
   1) MOOD HARIAN
   ===================================================================== */
const MOODS=()=>[["love","🥰",L("Disayang","Loved")],["happy","😄",L("Senang","Happy")],["ok","🙂",L("Biasa","Okay")],["tired","😴",L("Capek","Tired")],["anx","😰",L("Cemas","Anxious")],["sad","😢",L("Sedih","Sad")],["mad","😠",L("Kesal","Annoyed")]];
let moMonth=null;
function vMood(v){
  const mo=T().mood||{},td=tday(),cur=mo[td]||{};const M=MOODS(),em=k=>(M.find(x=>x[0]===k)||[])[1]||"";
  if(!moMonth)moMonth=td.slice(0,7);
  const [y,m]=moMonth.split("-").map(Number),first=new Date(y,m-1,1),days=new Date(y,m,0).getDate(),lead=(first.getDay()+6)%7;
  const inMonth=Object.entries(mo).filter(([d])=>d.startsWith(moMonth));
  const counts=M.map(([k,e,n])=>[e,n,inMonth.filter(([,x])=>x.m===k).length]).filter(x=>x[2]);
  const max=Math.max(1,...counts.map(x=>x[2]));
  const wd=EN()?["M","T","W","T","F","S","S"]:["S","S","R","K","J","S","M"];
  v.innerHTML=page(L("Alat","Tools"),"😊 "+L("Mood Harian","Daily Mood"),back)+
   `<div class="region"><div class="rh">${L("Gimana perasaanmu hari ini?","How are you feeling today?")}</div><div class="rb">
    <div class="mo-pick">${M.map(([k,e,n])=>`<button class="mo-btn${cur.m===k?" on":""}" data-mo="${k}" aria-pressed="${cur.m===k}"><span>${e}</span>${n}</button>`).join("")}</div>
    <div class="tl-row" style="margin-top:10px"><input id="moNote" placeholder="${L("Satu kalimat kenapa (opsional)","One line why (optional)")}" style="flex:1;min-width:0"><button class="sm pri" id="moSave">${L("Simpan","Save")}</button></div></div></div>
   <div class="region"><div class="rh"><button class="sm" id="moPrev" aria-label="${L("Bulan sebelumnya","Previous month")}">‹</button><span>${first.toLocaleDateString(EN()?"en-GB":"id-ID",{month:"long",year:"numeric"})}</span><button class="sm" id="moNext" aria-label="${L("Bulan berikutnya","Next month")}">›</button></div><div class="rb">
    <div class="mo-cal">${wd.map(x=>`<div class="h">${x}</div>`).join("")}${"<div class='d x'></div>".repeat(lead)}${[...Array(days)].map((_,i)=>{const ds=moMonth+"-"+String(i+1).padStart(2,"0"),x=mo[ds];return `<div class="d${ds===td?" td":""}" title="${x&&x.n?esc(x.n):""}">${x?`<b>${em(x.m)}</b>`:""}${i+1}</div>`}).join("")}</div>
    ${counts.length?`<div class="mo-bars" style="margin-top:12px">${counts.map(([e,n,c])=>`<div class="r"><span>${e}</span><i style="width:${c/max*100}%" aria-label="${n}: ${c}"></i><span>${c}×</span></div>`).join("")}</div>`:`<p class="crumb" style="margin:10px 0 0">${L("Belum ada catatan mood bulan ini.","No moods logged this month yet.")}</p>`}</div></div>
   <p class="crumb">${L("Mood hanya terlihat di akunmu sendiri. Kalau beberapa hari berturut-turut terasa berat, cerita ke orang terdekat ya.","Moods are only visible in your own account. If several days in a row feel heavy, talk to someone close to you.")}</p>`;
  $("moNote").value=cur.n||"";
  wire(v);
  let pick=cur.m||null;
  v.querySelectorAll("[data-mo]").forEach(b=>b.onclick=()=>{pick=b.dataset.mo;v.querySelectorAll("[data-mo]").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",x===b)})});
  $("moSave").onclick=async()=>{if(!pick){status(L("Pilih salah satu emoji dulu.","Pick an emoji first."),"warn");return}
    const nm={...mo,[td]:{m:pick,n:$("moNote").value.trim().slice(0,140)}};Object.keys(nm).sort().slice(0,-400).forEach(k=>delete nm[k]);
    if(await saveT({mood:nm})){status(L("Mood hari ini tersimpan.","Today's mood saved."),"ok");$("moNote").blur();render()}};
  const shift=n=>{const d=new Date(y,m-1+n,1);moMonth=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");vMood(v)};
  $("moPrev").onclick=()=>shift(-1);$("moNext").onclick=()=>shift(1)}

/* =====================================================================
   2) KAPSUL WAKTU (surat untuk masa depan)
   ===================================================================== */
let cpOpen=null;
function vCapsule(v){
  const cs=(T().capsule||[]).slice().sort((a,b)=>a.open.localeCompare(b.open)),td=tday();
  v.innerHTML=page(L("Alat","Tools"),"💌 "+L("Kapsul Waktu","Time Capsule"),back+` <button class="pri sm" id="cpNew">+ ${L("Tulis surat","Write a letter")}</button>`)+
   (cs.length?cs.map(c=>{const ready=c.open<=td,n=dDiff(td,c.open);return `<div class="region"><div class="rb"><div class="cp-lock"><span class="ic">${ready?"💌":"🔒"}</span><div style="flex:1;min-width:0"><b data-ct="${c.id}"></b><div class="crumb">${L("Ditulis","Written")} ${fmtD(c.created)} · ${ready?L("bisa dibuka sejak ","openable since ")+fmtD(c.open):L("terbuka ","opens ")+fmtD(c.open)+" ("+n+" "+L("hari lagi","days left")+")"}</div></div>
     ${ready?`<button class="sm pri" data-cpo="${c.id}">${cpOpen===c.id?L("Tutup","Close"):L("Buka","Open")}</button>`:""}<button class="sm" data-cpd="${c.id}" aria-label="${L("Hapus","Delete")}">✕</button></div>
     ${ready&&cpOpen===c.id?`<div class="cp-body" data-cb="${c.id}"></div>`:""}</div></div>`}).join("")
   :`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0">${window.pipi?window.pipi("think",64,"vnel"):""}<div class="bubble"><b>${L("Tulis surat untuk dirimu di masa depan","Write to your future self")}</b><div>${L("Contoh: untukmu di anniversary berikutnya, setelah lulus, atau saat tabungan rumah tercapai. Surat terkunci sampai tanggalnya tiba.","For example: to you on the next anniversary, after graduating, or when the house fund is reached. It stays locked until the date.")}</div></div></div></div></div>`)+
   `<p class="crumb">${L("Kunci ini untuk kejutan, bukan pengaman: isinya tersimpan di akunmu seperti catatan lain.","The lock is for the surprise, not security: the text is stored in your account like other notes.")}</p>`;
  cs.forEach(c=>{const t=v.querySelector(`[data-ct="${c.id}"]`);if(t)t.textContent=c.title;const b=v.querySelector(`[data-cb="${c.id}"]`);if(b)b.textContent=c.body});
  wire(v);
  v.querySelectorAll("[data-cpo]").forEach(b=>b.onclick=()=>{cpOpen=cpOpen===b.dataset.cpo?null:b.dataset.cpo;vCapsule(v)});
  v.querySelectorAll("[data-cpd]").forEach(b=>b.onclick=async()=>{if(!sure(b))return;await saveT({capsule:(T().capsule||[]).filter(c=>c.id!==b.dataset.cpd)});render()});
  $("cpNew").onclick=()=>{const nx=new Date();nx.setFullYear(nx.getFullYear()+1);
    const bg=modal(L("Surat untuk masa depan","Letter to the future"),`<div class="fg"><div class="full"><label>${L("Judul","Title")}</label><input id="cpT" placeholder="${L("mis. Untuk kita di anniv tahun depan","e.g. To us on next year's anniversary")}"></div>
     <div class="full"><label>${L("Isi surat","Letter")}</label><textarea id="cpB" rows="8" placeholder="${L("Hai, aku dari masa lalu…","Hi, it's me from the past…")}"></textarea></div>
     <div class="full"><label>${L("Boleh dibuka tanggal","Can be opened on")}</label><input type="date" id="cpD" min="${tday()}"></div>
     <div class="full tl-row">${[["+1 "+L("bulan","month"),1],["+6 "+L("bulan","months"),6],["+1 "+L("tahun","year"),12],[L("Anniv 26 Sep","Anniv 26 Sep"),"anniv"]].map(([n,k])=>`<button class="sm" type="button" data-qd="${k}">${n}</button>`).join("")}</div></div>`,
     async g=>{const t=g.querySelector("#cpT").value.trim(),b=g.querySelector("#cpB").value.trim(),d=g.querySelector("#cpD").value;
       if(!t||!b||!d){alert(L("Isi judul, surat, dan tanggal.","Fill in title, letter and date."));return false}
       if(d<=tday()){alert(L("Pilih tanggal setelah hari ini.","Pick a date after today."));return false}
       await saveT({capsule:[...(T().capsule||[]),{id:uid(),title:t.slice(0,80),body:b.slice(0,5000),open:d,created:tday()}]});render()},L("Kunci surat 🔒","Lock letter 🔒"));
    bg.querySelector("#cpD").value=iso(nx);
    bg.querySelectorAll("[data-qd]").forEach(x=>x.onclick=()=>{const k=x.dataset.qd,d=new Date();if(k==="anniv"){let a=new Date(d.getFullYear(),8,26);if(iso(a)<=tday())a=new Date(d.getFullYear()+1,8,26);bg.querySelector("#cpD").value=iso(a)}else{d.setMonth(d.getMonth()+(+k));bg.querySelector("#cpD").value=iso(d)}})}}
function capsuleReady(){const td=tday();return (T().capsule||[]).filter(c=>c.open===td).length}

/* =====================================================================
   3) BUCKET LIST BERDUA
   ===================================================================== */
const BCATS=()=>[["trip","✈️",L("Jalan-jalan","Travel")],["food","🍜",L("Kuliner","Food")],["exp","🎢",L("Pengalaman","Experiences")],["learn","📚",L("Belajar","Learning")],["big","🏡",L("Impian besar","Big dreams")]];
const BSEED=()=>[["trip",L("Lihat sunrise di Bromo","Watch the sunrise at Bromo")],["trip",L("Liburan ke Jepang","Trip to Japan")],["food",L("Makan nasi padang di Padang langsung","Eat nasi padang in Padang itself")],["exp",L("Nonton konser bareng","Go to a concert together")],["learn",L("Bisa ngobrol sederhana pakai bahasa Jepang","Hold a simple chat in Japanese")],["big",L("Punya peternakan sapi kecil","Own a small cattle farm")]];
let bFilter="all";
function vBucket(v){
  const bs=T().bucket||[],cats=BCATS(),ci=k=>cats.find(c=>c[0]===k)||cats[0],done=bs.filter(b=>b.done).length;
  const list=bs.filter(b=>bFilter==="all"||(bFilter==="done"?b.done:!b.done&&(bFilter==="todo"||b.cat===bFilter)));
  v.innerHTML=page(L("Alat","Tools"),"🪣 "+L("Bucket List Berdua","Our Bucket List"),back+` <button class="pri sm" id="bAdd">+ ${L("Impian","Item")}</button>`)+
   `<div class="tiles"><div class="tile"><div class="k">${L("Tercapai","Done")}</div><div class="v">${done}/${bs.length}</div><div class="qbar"><i style="width:${bs.length?done/bs.length*100:0}%"></i></div></div></div>
   <div class="tl-tabs">${[["all",L("Semua","All")],["todo",L("Belum","To do")],["done",L("Sudah ✓","Done ✓")],...cats.map(c=>[c[0],c[1]+" "+c[2]])].map(([k,n])=>`<button class="sm${bFilter===k?" pri":""}" data-bf="${k}">${n}</button>`).join("")}</div>
   <div class="region"><div class="rb">${list.length?`<div class="tl-list">${list.map(b=>`<div class="tl-item"><button class="tl-day${b.done?" on":""}" style="width:34px;max-width:34px;flex:none" data-bt="${b.id}" aria-pressed="${!!b.done}" aria-label="${L("Tandai tercapai","Mark done")}">${b.done?"✓":""}</button><div class="grow"><b data-bn="${b.id}" style="${b.done?"text-decoration:line-through;opacity:.7":""}"></b><span class="crumb">${ci(b.cat)[1]} ${ci(b.cat)[2]}${b.done?" · "+L("tercapai ","done ")+fmtD(b.done):""}</span></div><button class="sm" data-bd="${b.id}" aria-label="${L("Hapus","Delete")}">✕</button></div>`).join("")}</div>`
    :bs.length?`<p class="crumb" style="margin:0">${L("Tidak ada item di filter ini.","Nothing in this filter.")}</p>`:`<div class="pipi-card" style="margin:0">${window.pipi?window.pipi("happy",64,"vnel"):""}<div class="bubble"><b>${L("Mau ngapain aja berdua?","What do you two want to do?")}</b><div>${L("Mulai dari contoh ini, nanti bisa dihapus atau ditambah.","Start from these examples; edit or add your own.")}</div><button class="sm pri" id="bSeed" style="margin-top:8px">${L("Pakai 6 contoh","Use 6 examples")}</button></div></div>`}</div></div>`;
  bs.forEach(b=>{const t=v.querySelector(`[data-bn="${b.id}"]`);if(t)t.textContent=b.n});
  wire(v);
  v.querySelectorAll("[data-bf]").forEach(b=>b.onclick=()=>{bFilter=b.dataset.bf;vBucket(v)});
  const sd=$("bSeed");if(sd)sd.onclick=async()=>{await saveT({bucket:BSEED().map(([cat,n])=>({id:uid(),n,cat,done:null}))});render()};
  v.querySelectorAll("[data-bt]").forEach(b=>b.onclick=async()=>{const nb=bs.map(x=>x.id===b.dataset.bt?{...x,done:x.done?null:tday()}:x);const now=nb.find(x=>x.id===b.dataset.bt);
    await saveT({bucket:nb});if(now.done&&window.doPeek)window.doPeek(true,{t:"🎉 "+L("Satu impian tercapai!","One dream done!"),d:now.n,m:"party",w:6});render()});
  v.querySelectorAll("[data-bd]").forEach(b=>b.onclick=async()=>{if(!sure(b))return;await saveT({bucket:bs.filter(x=>x.id!==b.dataset.bd)});render()});
  $("bAdd").onclick=()=>modal(L("Tambah ke bucket list","Add to bucket list"),`<div class="fg"><div class="full"><label>${L("Impian","Item")}</label><input id="bN" placeholder="${L("mis. Naik kereta ke Jogja","e.g. Train trip to Jogja")}"></div><div class="full"><label>${L("Kategori","Category")}</label><select id="bC">${cats.map(c=>`<option value="${c[0]}">${c[1]} ${c[2]}</option>`).join("")}</select></div></div>`,
    async g=>{const n=g.querySelector("#bN").value.trim();if(!n)return false;await saveT({bucket:[...bs,{id:uid(),n:n.slice(0,120),cat:g.querySelector("#bC").value,done:null}]});render()},L("Simpan","Save"))}

/* =====================================================================
   4) KARTU OBROLAN
   ===================================================================== */
const DECKS={
 deep:{e:"🌙",n:()=>L("Deep talk","Deep talk"),q:["Apa satu hal kecil dariku yang bikin kamu merasa disayang?","Momen apa yang bikin kamu yakin sama hubungan ini?","Apa ketakutan terbesarmu soal masa depan?","Kalau bisa mengulang satu hari bersama, hari yang mana?","Apa yang paling kamu syukuri tahun ini?","Kebiasaanku yang mana yang diam-diam kamu suka?","Apa yang kamu butuhkan dariku saat sedang sedih?","Pelajaran hidup apa yang paling berharga buatmu sejauh ini?","Mimpi masa kecil apa yang masih kamu ingat?","Kapan terakhir kali kamu merasa benar-benar bangga pada dirimu?","Apa arti \"rumah\" buatmu?","Hal apa yang ingin kamu ubah dari dirimu, dan kenapa?","Apa cara terbaik untuk minta maaf kepadamu?","Kalau kita bertengkar, apa yang paling membantu supaya cepat baikan?","Siapa orang yang paling memengaruhi hidupmu?","Apa yang membuatmu merasa tenang?","Hal apa dari hubungan orang tuamu yang ingin kamu tiru, atau kamu hindari?","Bagaimana kamu ingin diingat orang?","Apa yang ingin kamu dengar dariku lebih sering?","Apa satu hal yang belum sempat kamu bilang ke aku?"]},
 fun:{e:"🎈",n:()=>L("Seru-seruan","Just for fun"),q:["Kalau kita jadi karakter kartun, kita jadi apa?","Makanan apa yang sanggup kamu makan setiap hari selama setahun?","Lagu apa yang paling cocok jadi soundtrack hubungan kita?","Kalau dapat uang 100 juta besok, apa yang pertama kamu beli?","Superpower apa yang kamu pilih, dan kenapa?","Kebiasaan aneh apa yang kamu punya?","Siapa di antara kita yang lebih mungkin nyasar pakai Google Maps?","Kalau kita buka usaha bareng, usaha apa?","Hewan peliharaan impianmu apa, dan namanya siapa?","Film apa yang bisa kamu tonton berulang-ulang?","Kalau bisa tukar badan sehari denganku, mau ngapain?","Siapa yang lebih boros di antara kita? Jujur!","Jajanan masa kecil favoritmu apa?","Kalau hidup kita jadi sinetron, judulnya apa?","Tempat paling random yang ingin kamu kunjungi?","Emoji apa yang paling menggambarkan aku?","Kalau bisa makan malam dengan satu tokoh terkenal, siapa?","Hal paling lucu yang pernah terjadi waktu kita pergi berdua?","Kalau kita punya nama tim, namanya apa?","Satu kata untuk menggambarkan aku waktu lapar?"]},
 future:{e:"🔭",n:()=>L("Masa depan","The future"),q:["Lima tahun lagi, kamu ingin kita tinggal di mana?","Rumah impianmu seperti apa?","Berapa dana darurat yang menurutmu ideal untuk kita?","Lebih suka liburan besar setahun sekali atau liburan kecil tiap tiga bulan?","Pekerjaan impianmu sepuluh tahun lagi?","Pembagian keuangan seperti apa yang adil menurutmu kalau nanti sudah berumah tangga?","Tradisi apa yang ingin kita buat setiap tahun?","Negara pertama yang ingin kita datangi berdua?","Kalau punya peternakan, mau pelihara hewan apa saja?","Skill apa yang ingin kamu kuasai tahun depan?","Bagaimana kamu membayangkan hari tua kita?","Kebiasaan finansial apa yang ingin kita mulai sekarang?","Hal apa yang tidak boleh berubah dari kita, apa pun yang terjadi?","Apa satu target bersama untuk tahun ini?","Kalau semua rencana berjalan lancar, hidup kita lima tahun lagi seperti apa?"]},
 date:{e:"💡",n:()=>L("Ide kencan hemat","Budget date ideas"),q:["Piknik di taman, bawa bekal masak sendiri.","Masak resep baru berdua, ikuti video dari internet.","Maraton film di rumah dengan popcorn bikin sendiri.","Jalan sore keliling kompleks sambil foto-foto pakai HP.","Naik KRL ke stasiun yang belum pernah didatangi, lalu kulineran di sana.","Kencan perpustakaan: masing-masing pilihkan satu buku untuk yang lain.","Main Memori Stiker di aplikasi ini. Yang kalah traktir es teh.","Bikin playlist untuk satu sama lain, lalu dengarkan bersama.","Nonton matahari terbenam dari tempat yang tinggi.","Belajar 5 kata bahasa Jepang bareng di menu Belajar Bahasa.","Olahraga bareng: lari pagi atau renang.","Tukar surat tulisan tangan.","Window shopping tanpa beli apa pun. Tantangan!","Masak mi instan versi \"mewah\" dengan topping kreatif.","Ke pasar tradisional pagi-pagi, cari sarapan khas.","Video call sambil makan kalau sedang berjauhan.","Rencanakan liburan impian bareng di Celengan Impian.","Main kartu Deep talk ini sambil ngopi.","Foto booth buatan sendiri di rumah pakai timer HP.","Tulis surat Kapsul Waktu untuk dibuka di anniversary berikutnya."]}};
let obDeck="deep",obIdx=null;
function vCards(v){
  const dk=DECKS[obDeck];if(obIdx==null||obIdx>=dk.q.length)obIdx=Math.floor(Math.random()*dk.q.length);
  v.innerHTML=page(L("Alat","Tools"),"🃏 "+L("Kartu Obrolan","Talk Cards"),back)+
   `<div class="tl-tabs">${Object.entries(DECKS).map(([k,d])=>`<button class="sm${k===obDeck?" pri":""}" data-dk="${k}">${d.e} ${d.n()}</button>`).join("")}</div>
   <div class="ob-card" id="obC" aria-live="polite">${window.pipi?window.pipi(obDeck==="fun"?"party":obDeck==="deep"?"think":"happy",56,"vnel"):""}<div class="q"></div><div class="n">${dk.e} ${dk.n()} · ${obIdx+1}/${dk.q.length}</div></div>
   <div class="tl-row" style="justify-content:center;margin-top:12px"><button class="pri" id="obNext" style="min-width:160px;min-height:44px">🔀 ${L("Kartu berikutnya","Next card")}</button></div>
   <p class="crumb" style="text-align:center">${obDeck==="date"?L("Pilih satu, lalu simpan ke Bucket List kalau mau dicoba.","Pick one and save it to the Bucket List if you want to try it."):L("Bergantian menjawab. Boleh skip kalau belum siap.","Take turns answering. Skipping is fine.")}</p>
   ${obDeck==="date"?`<div class="tl-row" style="justify-content:center"><button class="sm" id="obSave">🪣 ${L("Simpan ke Bucket List","Save to Bucket List")}</button></div>`:""}`;
  v.querySelector(".ob-card .q").textContent=dk.q[obIdx];
  wire(v);
  v.querySelectorAll("[data-dk]").forEach(b=>b.onclick=()=>{obDeck=b.dataset.dk;obIdx=null;vCards(v)});
  $("obNext").onclick=()=>{let n;do{n=Math.floor(Math.random()*dk.q.length)}while(dk.q.length>1&&n===obIdx);obIdx=n;const c=$("obC");c.classList.add("flip");setTimeout(()=>vCards(v),180)};
  const sv=$("obSave");if(sv)sv.onclick=async()=>{const bs=T().bucket||[];if(bs.some(b=>b.n===dk.q[obIdx])){status(L("Sudah ada di Bucket List.","Already in the Bucket List."),"warn");return}
    if(await saveT({bucket:[...bs,{id:uid(),n:dk.q[obIdx],cat:"exp",done:null}]}))status(L("Tersimpan di Bucket List 🪣","Saved to the Bucket List 🪣"),"ok")}}

/* =====================================================================
   5) KURS MATA UANG (data langsung, ada cadangan manual)
   ===================================================================== */
const CUR=[["USD","🇺🇸"],["SGD","🇸🇬"],["JPY","🇯🇵"],["EUR","🇪🇺"],["MYR","🇲🇾"],["THB","🇹🇭"],["CNY","🇨🇳"],["KRW","🇰🇷"],["AUD","🇦🇺"],["GBP","🇬🇧"],["SAR","🇸🇦"]];
let fx=null,fxErr="",fxBusy=false;
function fxLoad(force){
  try{const c=JSON.parse(localStorage.getItem("bbp_fx")||"null");if(c&&!force&&Date.now()-c.t<6*3600e3){fx=c;return Promise.resolve()}if(c)fx=c}catch(e){}
  if(fxBusy)return Promise.resolve();fxBusy=true;fxErr="";
  return fetch("https://open.er-api.com/v6/latest/IDR").then(r=>r.json()).then(j=>{if(j.result!=="success"||!j.rates)throw new Error("data");
    fx={t:Date.now(),upd:j.time_last_update_utc||"",r:j.rates};try{localStorage.setItem("bbp_fx",JSON.stringify(fx))}catch(e){}})
   .catch(()=>{fxErr=L("Kurs langsung tidak bisa dimuat. Cek internet, atau isi kurs sendiri di bawah.","Live rates couldn't load. Check your connection, or enter a rate yourself below.")}).finally(()=>{fxBusy=false})}
const perIDR=c=>{const man=(T().fx||{})[c];if(man)return man;return fx&&fx.r&&fx.r[c]?1/fx.r[c]:0};
let fxFrom="USD",fxAmt="100",fxDir="toIDR";
function vFx(v){
  const fmt=(n,c)=>c==="IDR"?"Rp"+Math.round(n).toLocaleString("id-ID"):n.toLocaleString(EN()?"en-US":"id-ID",{maximumFractionDigits:c==="JPY"||c==="KRW"?0:2})+" "+c;
  const rate=perIDR(fxFrom),amt=parseFloat(String(fxAmt).replace(/\./g,"").replace(",","."))||0,res=fxDir==="toIDR"?amt*rate:(rate?amt/rate:0);
  v.innerHTML=page(L("Alat","Tools"),"💱 "+L("Kurs Mata Uang","Currency Rates"),back+` <button class="sm" id="fxRe">↻ ${L("Muat ulang","Refresh")}</button>`)+
   `<div class="region"><div class="rh">🔁 ${L("Konversi","Convert")}</div><div class="rb"><div class="fg">
     <div><label>${L("Jumlah","Amount")}</label><input id="fxA" inputmode="decimal"></div>
     <div><label>${L("Mata uang","Currency")}</label><select id="fxC">${CUR.map(([c,f])=>`<option value="${c}"${c===fxFrom?" selected":""}>${f} ${c}</option>`).join("")}</select></div>
     <div class="full"><label>${L("Arah","Direction")}</label><select id="fxD"><option value="toIDR"${fxDir==="toIDR"?" selected":""}>${fxFrom} → IDR</option><option value="fromIDR"${fxDir==="fromIDR"?" selected":""}>IDR → ${fxFrom}</option></select></div></div>
     <div class="tl-out" style="margin-top:12px"><div><div class="k">${L("Hasil","Result")}</div><div class="v" id="fxR">${rate?fmt(res,fxDir==="toIDR"?"IDR":fxFrom):"–"}</div></div><div><div class="k">1 ${fxFrom}</div><div class="v">${rate?fmt(rate,"IDR"):"–"}</div></div></div></div></div>
   <div class="region"><div class="rh"><span>📋 ${L("Kurs hari ini","Today's rates")}</span><span class="crumb">${fxBusy?L("memuat…","loading…"):fx&&fx.upd?L("diperbarui ","updated ")+new Date(fx.upd).toLocaleString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""}</span></div><div class="rb">
    ${fxErr?`<div class="msg warn" style="margin:0 0 8px">${fxErr}</div>`:""}
    ${CUR.map(([c,f])=>{const p=perIDR(c),man=(T().fx||{})[c];return `<div class="fx-row"><span>${f}</span><span class="c">1 ${c}${man?` <span class="pill">${L("manual","manual")}</span>`:""}</span><span class="v">${p?fmt(p,"IDR"):"–"}</span></div>`}).join("")}
    <p class="crumb" style="margin:10px 0 0">${L("Sumber: open.er-api.com, kurs tengah harian. Kurs bank & money changer bisa beda 1–3%. Untuk jurnal kantor, tetap pakai kurs resmi perusahaan.","Source: open.er-api.com, daily mid-market rates. Bank and money-changer rates can differ by 1–3%. For company journals, use the official company rate.")}</p>
    <button class="sm" id="fxMan" style="margin-top:8px">✏️ ${L("Isi kurs manual","Set a manual rate")}</button></div></div>`;
  $("fxA").value=fxAmt;wire(v);
  const upd=()=>{fxAmt=$("fxA").value;const r=perIDR(fxFrom),a=parseFloat(String(fxAmt).replace(/\./g,"").replace(",","."))||0;$("fxR").textContent=r?fmt(fxDir==="toIDR"?a*r:a/r,fxDir==="toIDR"?"IDR":fxFrom):"–"};
  $("fxA").oninput=upd;$("fxC").onchange=e=>{fxFrom=e.target.value;vFx(v)};$("fxD").onchange=e=>{fxDir=e.target.value;vFx(v)};
  $("fxRe").onclick=()=>{fxLoad(true).then(()=>{if(route==="t_fx")vFx($("view"))});vFx(v)};
  $("fxMan").onclick=()=>{const bg=modal(L("Kurs manual","Manual rate"),`<div class="fg"><div><label>${L("Mata uang","Currency")}</label><select id="fmC">${CUR.map(([c,f])=>`<option value="${c}">${f} ${c}</option>`).join("")}</select></div><div><label>${L("1 unit = Rp","1 unit = Rp")}</label><input id="fmV" inputmode="decimal" placeholder="16.250"></div><div class="full crumb">${L("Kosongkan untuk kembali ke kurs langsung.","Leave empty to go back to the live rate.")}</div></div>`,
    async g=>{const c=g.querySelector("#fmC").value,val=parseFloat(g.querySelector("#fmV").value.replace(/\./g,"").replace(",","."));const f={...(T().fx||{})};if(val>0)f[c]=val;else delete f[c];await saveT({fx:f});render()},L("Simpan","Save"));
    bg.querySelector("#fmC").value=fxFrom}}

/* =====================================================================
   PASANG
   ===================================================================== */
const VIEWS={t_mood:vMood,t_capsule:vCapsule,t_bucket:vBucket,t_cards:vCards,t_fx:v=>{if(!fx||Date.now()-(fx.t||0)>6*3600e3)fxLoad().then(()=>{if(route==="t_fx")vFx($("view"))});vFx(v)}};
const safe=f=>v=>{try{f(v)}catch(e){console.error(e);v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}};
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},Object.fromEntries(Object.entries(VIEWS).map(([k,f])=>[k,safe(f)])));
if(window.TOOL_ROUTES)Object.keys(VIEWS).forEach(k=>window.TOOL_ROUTES.add(k));
const grp=NAV.find(([g])=>g==="Alat");const items=[["t_mood","Mood Harian"],["t_capsule","Kapsul Waktu"],["t_bucket","Bucket List"],["t_cards","Kartu Obrolan"],["t_fx","Kurs Mata Uang"]];
if(grp)grp[1].push(...items);else NAV.push(["Alat",items]);
window.EXTRA_TOOL_CARDS=[...(window.EXTRA_TOOL_CARDS||[]),
 ["t_mood","😊",()=>L("Mood Harian","Daily Mood"),()=>L("Catat perasaan tiap hari, lihat polanya sebulan.","Log how you feel daily and see the month's pattern."),()=>{const m=(T().mood||{})[tday()];return m?((MOODS().find(x=>x[0]===m.m)||[])[1]||"")+" "+L("hari ini","today"):""}],
 ["t_capsule","💌",()=>L("Kapsul Waktu","Time Capsule"),()=>L("Surat untuk masa depan, terkunci sampai tanggalnya.","Letters to the future, locked until their date."),()=>{const n=capsuleReady();return n?"📬 "+n+" "+L("surat bisa dibuka hari ini","letter(s) ready today"):""}],
 ["t_bucket","🪣",()=>L("Bucket List Berdua","Our Bucket List"),()=>L("Daftar hal yang ingin kalian lakukan bersama.","Things you want to do together."),()=>{const b=T().bucket||[];return b.length?b.filter(x=>x.done).length+"/"+b.length+" "+L("tercapai","done"):""}],
 ["t_cards","🃏",()=>L("Kartu Obrolan","Talk Cards"),()=>L("Deep talk, seru-seruan, masa depan, ide kencan hemat.","Deep talk, fun, future, budget date ideas."),()=>""],
 ["t_fx","💱",()=>L("Kurs Mata Uang","Currency Rates"),()=>L("USD, SGD, JPY, dan lainnya ke Rupiah.","USD, SGD, JPY and more to Rupiah."),()=>""]];
/* kabari kalau ada kapsul waktu yang terbuka hari ini (sekali per hari) */
addEventListener("load",()=>setTimeout(()=>{try{const n=capsuleReady(),k="bbp_cap_"+tday();if(n&&!localStorage.getItem(k)&&window.doPeek){localStorage.setItem(k,"1");window.doPeek(true,{t:"💌 "+L("Kapsul waktu terbuka!","A time capsule opened!"),d:L("Ada surat dari masa lalu yang bisa dibaca hari ini.","A letter from the past is ready today."),r:"t_capsule",m:"party",w:10})}}catch(e){}},25000));
})();
