/* =====================================================================
   HARIAN — kalender sendiri (tanpa Google) + Jurnal Harian.
   Acara & jurnal disimpan di Supabase (tabel docs, per akun).
   Pengingat keuangan dibuat otomatis dari anggaran.
   Notifikasi: browser (selama aplikasi terbuka) + karakter ngintip.
   ===================================================================== */
(function(){
const CATS=[
  {k:"kuliah",n:"Kuliah",hex:"#3f51b5"},{k:"kerja",n:"Kerja",hex:"#f4511e"},{k:"pribadi",n:"Pribadi",hex:"#33b679"},
  {k:"keuangan",n:"Keuangan",hex:"#f6bf26"},{k:"lain",n:"Lainnya",hex:"#8e8e8e"}];
const HARI=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const cat=k=>CATS.find(c=>c.k===k)||CATS[4];
const REMS=[["","Tanpa pengingat"],["0","Saat acara mulai"],["10","10 menit sebelum"],["30","30 menit sebelum"],["60","1 jam sebelum"],["1440","1 hari sebelum"]];
const MOODS=[{k:5,e:"😄",n:"Senang",c:"#2fbf71"},{k:4,e:"🙂",n:"Baik",c:"#8bc34a"},{k:3,e:"😐",n:"Biasa",c:"#f6bf26"},{k:2,e:"😟",n:"Sedih",c:"#ff8a65"},{k:1,e:"😫",n:"Capek",c:"#e5484d"}];
const TAGS=["Kuliah","Kerja","Belajar","Olahraga","Keluarga","Teman","Pacar","Ibadah","Hobi","Istirahat","Jalan-jalan","Sakit"];

/* ---------- tanggal ---------- */
function iso(x){return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")}
function addDays(d,n){const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return iso(x)}
function mondayOf(d){const x=new Date(d+"T00:00:00");x.setDate(x.getDate()-(x.getDay()+6)%7);return iso(x)}
const dow=d=>new Date(d+"T00:00:00").getDay();
const fmtDay=d=>{const x=new Date(d+"T00:00:00");return HARI[x.getDay()]+", "+x.getDate()+" "+MONTHS[x.getMonth()].slice(0,3)};
const fmtLong=d=>{const x=new Date(d+"T00:00:00");return HARI[x.getDay()]+", "+x.getDate()+" "+MONTHS[x.getMonth()]+" "+x.getFullYear()};
const lastDay=m=>+mEnd(m).slice(8);
const nowHM=()=>new Date(Date.now()+7*3600e3).toISOString().slice(11,16);
const addMin=(t,m)=>{const [h,mm]=t.split(":").map(Number),x=Math.min(h*60+mm+m,23*60+59);return String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0")};

/* ---------- data acara ---------- */
const evDocs=()=>window.EVDOCS||[];
function occurrences(from,to){
  const out=[];
  for(const e of evDocs()){
    const push=d=>{if(d>=from&&d<to&&!(e.exceptions||[]).includes(d))out.push({...e,id:e._id,date:d,rec:!!e.repeat})};
    if(!e.repeat){push(e.date);continue}
    const end=e.until&&e.until<to?addDays(e.until,1):to;
    let d=e.date>from?e.date:from;
    if(e.repeat==="WEEKLY"){while(dow(d)!==dow(e.date))d=addDays(d,1);for(;d<end;d=addDays(d,7))push(d)}
    else if(e.repeat==="DAILY"){for(;d<end;d=addDays(d,1))push(d)}
    else if(e.repeat==="MONTHLY"){const day=+e.date.slice(8);let m=d.slice(0,7);
      for(let i=0;i<40;i++){if(day<=lastDay(m)){const x=m+"-"+String(day).padStart(2,"0");if(x>=end)break;if(x>=d)push(x)}else if(m+"-01">=end)break;m=nextM(m)}}}
  const f=window.BILLS;
  if(f){const monthly=(day,time,title,notes,c,key,amt)=>{let m=from.slice(0,7);for(let i=0;i<14;i++){const dd=day===-1?lastDay(m):day;
      if(dd<=lastDay(m)){const x=m+"-"+String(dd).padStart(2,"0");if(x>=to)break;if(x>=from)out.push({id:"fin:"+key+":"+x,fin:true,bill:key!=="close",date:x,title,notes,cat:c,start:time,end:addMin(time,15),reminder:"1440",amt})}
      m=nextM(m)}};
    (f.items||[]).forEach((it,i)=>monthly(+it.day,it.time||"09:00","💸 Bayar "+it.n+(it.amt?" – "+rp(it.amt):""),"Setelah bayar, foto buktinya dan posting jurnal.","keuangan","b"+i,it.amt));
    if(f.payday)monthly(+f.payday,"09:00","💰 Gajian","Catat gaji (4101) dan sisihkan target tabungan.","pribadi","pay");
    if(f.close)monthly(-1,"20:00","📒 Tutup buku bulanan","Cocokkan saldo, cek laporan, tutup periode, ekspor backup.","keuangan","close");
    if(f.recon){let d=from;while(dow(d)!==+f.reconDay)d=addDays(d,1);for(;d<to;d=addDays(d,7))out.push({id:"fin:recon:"+d,fin:true,date:d,title:"🔎 Cek saldo real",notes:"Isi saldo real semua rekening di Rekonsiliasi.",cat:"lain",start:"19:00",end:"19:15",reminder:"0"})}}
  out.sort((a,b)=>a.date.localeCompare(b.date)||(a.allDay?-1:b.allDay?1:(a.start||"").localeCompare(b.start||"")));
  return out}
async function saveEv(id,data){await col.doc(id).set({kind:"ev",...data})}
async function delDoc(id){await col.doc(id).delete()}

/* ---------- state tampilan ---------- */
let calView="month",monthAnchor=today().slice(0,7),selDay=today(),weekStart=mondayOf(today()),diaryDay=today();
try{calView=localStorage.getItem("gc_view")||"month"}catch(e){}
const rangeStart=()=>calView==="month"?mondayOf(monthAnchor+"-01"):weekStart;
const rangeDays=()=>calView==="month"?42:7;

const sst=document.createElement("style");sst.textContent=`
.mgrid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
.mgrid .mh{font-size:11.5px;font-weight:700;color:var(--mute);text-align:center;padding:6px 0;border-bottom:1px solid var(--line);background:var(--th)}
.mgrid .mc{all:unset;box-sizing:border-box;cursor:pointer;min-height:96px;padding:4px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:2px;overflow:hidden;position:relative}
.mgrid .mc:nth-child(7n+7){border-right:0}
.mgrid .mc.out{opacity:.45}.mgrid .mc:hover{background:var(--sel)}
.mgrid .mc.sel{background:var(--accS);box-shadow:inset 0 0 0 2px var(--acc)}
.mgrid .dn{font-size:12.5px;font-weight:700;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border-radius:99px}
.mgrid .today .dn{background:var(--acc);color:#fff}
.mgrid .mood{position:absolute;top:3px;right:4px;font-size:13px}
.mgrid .chips{display:flex;flex-direction:column;gap:2px;min-width:0}
.mgrid .chip{font-size:11px;line-height:1.25;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--c) 18%,transparent);border-left:3px solid var(--c);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mgrid .more{font-size:10.5px;color:var(--mute);padding-left:4px}
.mgrid .dots{display:none;gap:3px;justify-content:center;flex-wrap:wrap}.mgrid .dots i{width:6px;height:6px;border-radius:99px;display:block}
@media (max-width:700px){.mgrid .mc{min-height:54px;align-items:center}.mgrid .chips{display:none}.mgrid .dots{display:flex}.mgrid .mood{font-size:10px;top:1px;right:2px}}
.cdot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px}
.seg{display:flex}.seg button{border-radius:0}.seg button:first-child{border-radius:10px 0 0 10px}.seg button:last-child{border-radius:0 10px 10px 0;margin-left:-1px}
.seg button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.agenda-now{border-left:4px solid var(--acc);background:var(--accS)}.agenda-past{opacity:.5}
.tday{font-size:22px;font-weight:800;margin:0 0 2px}
textarea{font:inherit;font-size:15px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px;width:100%;min-height:150px;resize:vertical;line-height:1.55}
@media (max-width:600px){textarea{font-size:16px}}
.moods{display:flex;gap:6px;flex-wrap:wrap}.moods button{flex-direction:column;gap:0;min-width:62px;padding:6px 8px;border-radius:14px;font-size:12px}
.moods button span{font-size:24px;line-height:1.2}.moods button.on{border-color:var(--acc);background:var(--accS);font-weight:700}
.tags{display:flex;gap:6px;flex-wrap:wrap}.tags button{border-radius:99px;min-height:32px;padding:4px 12px;font-size:13px}.tags button.on{background:var(--acc);border-color:var(--acc);color:#fff}
.mstrip{display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:4px}
.mstrip button{min-height:0;padding:4px 0;flex-direction:column;gap:0;font-size:10px;color:var(--mute);border-radius:8px}
.mstrip button b{font-size:17px;line-height:1.2}.mstrip button.sel{box-shadow:0 0 0 2px var(--acc)}
.djlist .it{padding:10px 12px;border-bottom:1px solid var(--line);cursor:pointer}.djlist .it:hover{background:var(--sel)}
.djlist .it .s{font-size:13px;color:var(--mute);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.qcard .rb{background:linear-gradient(135deg,var(--accS),transparent);border-radius:inherit;position:relative;padding:16px 18px}
.qmark{font-size:54px;line-height:.6;color:var(--acc);opacity:.35;font-family:Georgia,serif;height:22px}
.qtext{font-size:17px;font-weight:700;line-height:1.45}.qsrc{font-size:12.5px;color:var(--mute);margin-top:6px}
.ngrid{columns:2 220px;column-gap:10px}
.ncard{break-inside:avoid;margin-bottom:10px;background:var(--nb);border:1px solid var(--line);border-radius:14px;padding:12px;cursor:pointer;position:relative;color:#2d2340}
.ncard:hover{box-shadow:0 3px 12px rgba(0,0,0,.08)}
.ncard .nt{font-weight:800;font-size:15px;margin-bottom:4px;padding-right:18px}.ncard .nb{font-size:13.5px;white-space:pre-wrap;line-height:1.5}
.ncard .nq{font-size:34px;line-height:.5;color:#c99a00;font-family:Georgia,serif;height:14px}
.ncard .ni{font-size:13px;margin-top:6px}.ncard .ni .dn{text-decoration:line-through;opacity:.6}
.ncard .nf{display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-top:8px}.ncard .nf .crumb{margin-left:auto;color:#7a6f8f}
.ncard .npin{position:absolute;top:8px;right:10px}
.neditor .rb{background:var(--nb);border-radius:inherit;color:#2d2340}
.neditor textarea,.neditor input{background:transparent;border-color:rgba(0,0,0,.08);color:#2d2340}
.netitle{font-size:18px!important;font-weight:800;border:0!important;padding-left:0!important;margin-bottom:6px}
.nitem{display:flex;gap:6px;align-items:center;margin-top:6px}.nitem input[type=checkbox]{width:20px;height:20px;min-height:0;flex:none}.nitem .dn{text-decoration:line-through;opacity:.6}
.ncolors{display:flex;gap:8px;margin-top:4px}.ncolors button{width:34px;height:34px;min-height:0;padding:0;border-radius:99px;border:2px solid var(--line)}.ncolors button.on{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ncard,:root:not([data-theme="light"]) .neditor .rb{background:var(--nbd);color:#f1ecf7}
 :root:not([data-theme="light"]) .neditor textarea,:root:not([data-theme="light"]) .neditor input{color:#f1ecf7;border-color:rgba(255,255,255,.12)}}
.appsw{display:flex;background:rgba(255,255,255,.16);border-radius:12px;padding:3px;gap:2px;flex:none}
.appsw button{border:0;background:none;color:var(--hdrInk);min-height:32px;padding:4px 14px;border-radius:9px;font-weight:600;opacity:.8}
.appsw button.on{background:var(--card);color:var(--ink);opacity:1;box-shadow:0 1px 3px rgba(0,0,0,.15)}
@media (max-width:860px){header{height:auto!important;flex-wrap:wrap;padding-top:6px!important;padding-bottom:8px!important;row-gap:6px}
 .appsw{order:9;flex-basis:100%}.appsw button{flex:1;min-height:36px}aside{top:98px!important}}
@media (min-width:861px){.appsw{margin-left:18px}}`;
document.head.appendChild(sst);

/* ---------- baris acara ---------- */
const timeTxt=o=>o.allDay?"Seharian":(o.start||"")+"–"+(o.end||"");
const hasRem=o=>o.reminder!==undefined&&o.reminder!==""&&o.reminder!==null;
function evRows(list,isToday){
  if(!list.length)return '<div class="crumb" style="padding:10px 12px">Kosong</div>';
  const now=nowHM();
  return `<table>${list.map(o=>{const st=isToday&&!o.allDay?((o.end||"")<=now?"agenda-past":((o.start||"")<=now?"agenda-now":"")):"";
    return `<tr class="${st}"><td style="width:96px;white-space:nowrap;font-variant-numeric:tabular-nums">${timeTxt(o)}</td>
     <td><span class="cdot" style="background:${cat(o.cat).hex}"></span><b>${esc(o.title||"(tanpa judul)")}</b>${hasRem(o)?' <span title="Ada pengingat">🔔</span>':""}${o.rec?' <span class="pill p-mute">berulang</span>':""}${o.fin?' <span class="pill p-mute">otomatis</span>':""}${st==="agenda-now"?' <span class="pill p-ok">Sedang berlangsung</span>':""}${o.location?`<div class="crumb">${esc(o.location)}</div>`:""}</td>
     <td style="white-space:nowrap;text-align:right">${o.fin?`<button class="sm" data-fin="1">Atur</button>`:`<button class="sm" data-ed="${esc(o.id)}" data-d="${o.date}">Edit</button> <button class="sm" data-dl="${esc(o.id)}" data-d="${o.date}">Hapus</button>`}</td></tr>`}).join("")}</table>`}
function wireRows(v){
  v.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editFlow(b.dataset.ed,b.dataset.d));
  v.querySelectorAll("[data-dl]").forEach(b=>b.onclick=()=>delFlow(b.dataset.dl,b.dataset.d));
  v.querySelectorAll("[data-fin]").forEach(b=>b.onclick=finEditor);
  v.querySelectorAll("[data-addday]").forEach(b=>b.onclick=()=>eventForm(null,b.dataset.addday));
  v.querySelectorAll("[data-diary]").forEach(b=>b.onclick=()=>{diaryDay=b.dataset.diary;go("diary")})}
const moodOf=d=>{const j=(window.DIARY||{})[d];return j&&MOODS.find(m=>m.k===j.mood)};

/* ---------- KALENDER ---------- */
function vSched(v){
  const td=today(),start=rangeStart(),n=rangeDays(),days=[...Array(n)].map((_,i)=>addDays(start,i));
  const byDay={};days.forEach(d=>byDay[d]=[]);
  for(const o of occurrences(start,addDays(start,n)))byDay[o.date]&&byDay[o.date].push(o);
  const title=calView==="month"?MONTHS[+monthAnchor.slice(5)-1]+" "+monthAnchor.slice(0,4):fmtDay(days[0])+" – "+fmtDay(days[6]);
  let body="";
  if(calView==="month"){
    if(!byDay[selDay])selDay=days.find(d=>d.startsWith(monthAnchor))||days[0];
    const md=moodOf(selDay);
    body=`<div class="region"><div class="rb flush"><div class="mgrid">${["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(h=>`<div class="mh">${h}</div>`).join("")}
      ${days.map(d=>{const evs=byDay[d],m=moodOf(d);return `<button class="mc${!d.startsWith(monthAnchor)?" out":""}${d===td?" today":""}${d===selDay?" sel":""}" data-day="${d}"><span class="dn">${+d.slice(8)}</span>${m?`<span class="mood">${m.e}</span>`:""}
        <span class="chips">${evs.slice(0,3).map(o=>`<span class="chip" style="--c:${cat(o.cat).hex}">${o.allDay?"":o.start+" "}${esc(o.title||"")}</span>`).join("")}${evs.length>3?`<span class="more">+${evs.length-3} lagi</span>`:""}</span>
        <span class="dots">${evs.slice(0,4).map(o=>`<i style="background:${cat(o.cat).hex}"></i>`).join("")}</span></button>`}).join("")}</div></div></div>
     <div class="region"><div class="rh"><span>${fmtDay(selDay)}${selDay===td?' <span class="pill p-ok">Hari ini</span>':""}</span><span class="acts"><button class="sm" data-diary="${selDay}">${md?md.e+" Jurnal":"📔 Tulis jurnal"}</button><button class="sm pri" data-addday="${selDay}">+ Acara</button></span></div><div class="rb flush">${evRows(byDay[selDay],selDay===td)}</div></div>`}
  else body=days.map(d=>{const m=moodOf(d);return `<div class="region" style="${d===td?"border-color:var(--acc);border-width:2px":""}"><div class="rh"><span>${fmtDay(d)}${d===td?' <span class="pill p-ok">Hari ini</span>':""}</span><span class="acts"><button class="sm" data-diary="${d}">${m?m.e:"📔"}</button><button class="sm" data-addday="${d}">+</button></span></div><div class="rb flush">${evRows(byDay[d],d===td)}</div></div>`}).join("");
  v.innerHTML=page("Harian","Kalender",`<button class="pri" id="gcAdd">+ Acara</button><button id="gcWeekly">+ Jadwal mingguan</button>`)+notifBanner()+
   `<div class="filters">
     <div><label>Tampilan</label><div class="seg"><button class="sm${calView==="month"?" on":""}" data-view="month">Bulanan</button><button class="sm${calView==="week"?" on":""}" data-view="week">Mingguan</button></div></div>
     <div><label>&nbsp;</label><div style="display:flex;gap:4px;align-items:center"><button class="sm" id="gcPrev">‹</button><button class="sm" id="gcToday">Hari ini</button><button class="sm" id="gcNext">›</button></div></div></div>
   <div style="font-weight:700;font-size:17px;margin:-4px 0 10px">${title}</div>`+body+finRegion();
  const shift=k=>{if(calView==="month"){monthAnchor=k?(k>0?nextM(monthAnchor):prevM(monthAnchor)):today().slice(0,7);selDay=k?monthAnchor+"-01":today()}else weekStart=k?addDays(weekStart,7*k):mondayOf(today());render()};
  $("gcPrev").onclick=()=>shift(-1);$("gcNext").onclick=()=>shift(1);$("gcToday").onclick=()=>shift(0);
  v.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{calView=b.dataset.view;try{localStorage.setItem("gc_view",calView)}catch(x){}
    if(calView==="week")weekStart=mondayOf(selDay||today());else monthAnchor=(selDay||today()).slice(0,7);render()});
  v.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{selDay=b.dataset.day;if(!selDay.startsWith(monthAnchor))monthAnchor=selDay.slice(0,7);render()});
  $("gcAdd").onclick=()=>eventForm(null,calView==="month"?selDay:today());$("gcWeekly").onclick=weeklyBuilder;$("finSet").onclick=finEditor;
  wireNotif(v);wireRows(v)}

/* ---------- HARI INI ---------- */
function vToday(v){
  const td=today(),tm=addDays(td,1),occ=occurrences(td,addDays(td,8));
  let spentToday=0;try{for(const j of JE)if(j.date===td)for(const l of j.lines)if(typeOf(l.a)==="X")spentToday+=l.dr-l.cr}catch(e){}
  let budLeft=null;try{const m=td.slice(0,7),b=budgetFor(m);if(b){const B=balsAll(mEnd(m),m+"-01");let bx=0,ax=0;for(const [c,x] of Object.entries(b.lines))if(typeOf(c)==="X")bx+=num(x);for(const c in B)if(typeOf(c)==="X")ax+=nb(B,c);budLeft=bx-ax}}catch(e){}
  const daysLeft=lastDay(td.slice(0,7))-+td.slice(8)+1;
  const bills=occ.filter(o=>o.bill);const dj=(window.DIARY||{})[td],md=moodOf(td);
  v.innerHTML=page("Harian","Hari Ini",`<button id="tdCal">Buka kalender</button>`)+
   `<div class="tday">${fmtLong(td)}</div><div class="crumb" style="margin-bottom:12px">Agenda, tagihan, jurnal, dan uangmu hari ini</div>`+notifBanner()+quoteCard(td)+
   `<div class="tiles"><div class="tile"><div class="k">Pengeluaran hari ini</div><div class="v">${rp(spentToday)}</div><div class="s">dari jurnal keuangan</div></div>
     <div class="tile ${budLeft!==null&&budLeft<0?"bad":""}"><div class="k">Sisa anggaran bulan ini</div><div class="v">${budLeft===null?"—":rp(budLeft)}</div><div class="s">${budLeft===null?"belum ada anggaran":"≈ "+rp(Math.max(0,budLeft)/daysLeft)+" per hari"}</div></div></div>
   <div class="region"><div class="rh"><span>📅 Hari ini</span><button class="sm pri" data-addday="${td}">+ Acara</button></div><div class="rb flush">${evRows(occ.filter(o=>o.date===td),true)}</div></div>
   <div class="region"><div class="rh"><span>📔 Jurnal harian</span><button class="sm${dj?"":" pri"}" data-diary="${td}">${dj?"Buka":"Tulis sekarang"}</button></div><div class="rb">${dj?`<div style="font-size:15px"><b>${md?md.e+" "+md.n:""}</b></div><div class="crumb" style="white-space:pre-wrap;margin-top:4px">${esc((dj.text||"").slice(0,220))}${(dj.text||"").length>220?"…":""}</div>`:'<div class="crumb">Belum menulis jurnal hari ini. Cukup 2 menit: mood, kegiatan, dan satu hal baik hari ini.</div>'}</div></div>
   ${(()=>{const pins=noteDocs().filter(n=>n.pinned).slice(0,4);return `<div class="region"><div class="rh"><span>📝 Catatan disematkan</span><button class="sm" id="tdNotes">${pins.length?"Semua catatan":"+ Catatan"}</button></div><div class="rb flush">${pins.length?`<table>${pins.map(n=>{const it=n.items||[];return `<tr><td><b>${esc(n.title||(n.body||"").slice(0,40)||"Catatan")}</b>${it.length?` <span class="crumb">· ${it.filter(i=>i.d).length}/${it.length} selesai</span>`:""}</td></tr>`}).join("")}</table>`:'<div class="crumb" style="padding:10px 12px">Sematkan catatan penting (📌) supaya muncul di sini.</div>'}</div></div>`})()}
   <div class="region"><div class="rh"><span>Besok · ${fmtDay(tm)}</span><button class="sm" data-addday="${tm}">+</button></div><div class="rb flush">${evRows(occ.filter(o=>o.date===tm),false)}</div></div>
   <div class="region"><div class="rh"><span>💸 Tagihan 7 hari ke depan</span><button class="sm" id="tdFin">Atur</button></div><div class="rb flush">${bills.length?`<table>${bills.map(b=>`<tr${b.date===td?' class="agenda-now"':""}><td style="width:96px;white-space:nowrap">${b.date===td?"Hari ini":fmtDay(b.date)}</td><td><b>${esc(b.title)}</b></td></tr>`).join("")}</table>`:`<div class="crumb" style="padding:10px 12px">${window.BILLS?"Tidak ada tagihan 7 hari ke depan":"Belum ada pengingat keuangan. Klik Atur."}</div>`}</div></div>
   <div class="acts"><button class="pri" id="tdTx">💰 Catat pengeluaran</button><button id="tdDash">Buka Keuangan</button></div>`;
  wireQuote(v,td);
  $("tdNotes").onclick=()=>{noteView=null;go("notes")};
  $("tdCal").onclick=()=>go("sched");$("tdTx").onclick=()=>go("input");$("tdDash").onclick=()=>go("dash");$("tdFin").onclick=finEditor;
  wireNotif(v);wireRows(v)}

/* ---------- JURNAL HARIAN ---------- */
let djDraft=null;
function vDiary(v){
  const d=diaryDay,saved=(window.DIARY||{})[d]||{};
  if(!djDraft||djDraft.date!==d)djDraft={date:d,mood:saved.mood||0,text:saved.text||"",good:saved.good||"",quote:saved.quote||"",tags:[...(saved.tags||[])]};
  const dr=djDraft,evs=occurrences(d,addDays(d,1)).filter(o=>!o.fin);
  let spent=0,txs=[];try{for(const j of JE)if(j.date===d){let s=0;for(const l of j.lines)if(typeOf(l.a)==="X")s+=l.dr-l.cr;if(s){spent+=s;txs.push(j.desc||"")}}}catch(e){}
  const strip=[...Array(30)].map((_,i)=>addDays(today(),i-29)),D=window.DIARY||{};
  const recent=Object.keys(D).sort().reverse().slice(0,12);
  const dirty=JSON.stringify([dr.mood,dr.text,dr.good,dr.quote,dr.tags.slice().sort()])!==JSON.stringify([saved.mood||0,saved.text||"",saved.good||"",saved.quote||"",(saved.tags||[]).slice().sort()]);
  v.innerHTML=page("Harian","Jurnal Harian",`<button class="pri" id="djSave"${dirty?"":" disabled"}>${dirty?"Simpan jurnal":"Tersimpan ✓"}</button>`)+
   `<div class="filters"><div><label>Tanggal</label><div style="display:flex;gap:4px;align-items:center"><button class="sm" id="djPrev">‹</button><input type="date" id="djDate" value="${d}" style="min-width:150px"><button class="sm" id="djNext"${d>=today()?" disabled":""}>›</button><button class="sm" id="djToday">Hari ini</button></div></div></div>
   <div class="tday" style="font-size:19px">${fmtLong(d)}</div>
   <div class="region" style="margin-top:10px"><div class="rh">Bagaimana perasaanmu?</div><div class="rb"><div class="moods">${MOODS.map(m=>`<button data-mood="${m.k}" class="${dr.mood===m.k?"on":""}"><span>${m.e}</span>${m.n}</button>`).join("")}</div></div></div>
   <div class="region"><div class="rh">Apa saja yang kamu lakukan hari ini?</div><div class="rb"><textarea id="djText" placeholder="Pagi kuliah, siang kerja kelompok di perpus, malam futsal…">${esc(dr.text)}</textarea></div></div>
   <div class="region"><div class="rh">✨ Satu hal baik hari ini</div><div class="rb"><input id="djGood" value="${esc(dr.good)}" placeholder="mis. presentasi lancar, makan enak bareng teman"></div></div>
   <div class="region"><div class="rh">💬 Kata-kata hari ini</div><div class="rb"><input id="djQuote" value="${esc(dr.quote)}" placeholder="Kalimat yang ingin kamu ingat dari hari ini (opsional)"><div class="crumb" style="margin-top:6px">Kata-katamu ikut muncul di "Kata-kata hari ini" pada hari-hari berikutnya.</div></div></div>
   <div class="region"><div class="rh">Tag kegiatan</div><div class="rb"><div class="tags">${TAGS.map(t=>`<button data-tag="${t}" class="${dr.tags.includes(t)?"on":""}">${t}</button>`).join("")}</div></div></div>
   <div class="region"><div class="rh">Otomatis dari hari ini</div><div class="rb" style="font-size:13.5px">
     <div><b>📅 Acara:</b> ${evs.length?evs.map(o=>esc((o.allDay?"":o.start+" ")+o.title)).join(" · "):'<span class="crumb">tidak ada</span>'}</div>
     <div style="margin-top:6px"><b>💰 Pengeluaran:</b> ${spent?rp(spent)+' <span class="crumb">('+txs.slice(0,4).map(esc).join(", ")+(txs.length>4?"…":"")+")</span>":'<span class="crumb">tidak ada</span>'}</div>
     <div class="acts" style="margin-top:8px"><button class="sm" id="djAddEv">Tambahkan acara ke catatan</button></div></div></div>
   <div class="region"><div class="rh">Mood 30 hari terakhir</div><div class="rb"><div class="mstrip">${strip.map(x=>{const m=MOODS.find(mm=>mm.k===(D[x]||{}).mood);return `<button data-go="${x}" class="${x===d?"sel":""}" title="${x}"><b>${m?m.e:"·"}</b>${+x.slice(8)}</button>`}).join("")}</div></div></div>
   <div class="region"><div class="rh">Catatan terakhir</div><div class="rb flush djlist">${recent.length?recent.map(x=>{const j=D[x],m=MOODS.find(mm=>mm.k===j.mood);return `<div class="it" data-go="${x}"><b>${m?m.e+" ":""}${fmtDay(x)}</b>${(j.tags||[]).length?' <span class="crumb">· '+j.tags.map(esc).join(", ")+"</span>":""}<div class="s">${esc(j.text||j.good||"")}</div></div>`}).join(""):'<div class="crumb" style="padding:10px 12px">Belum ada catatan.</div>'}</div></div>
   ${saved.mood||saved.text?'<div class="acts"><button id="djDel">Hapus jurnal tanggal ini</button></div>':""}`;
  const upd=()=>{const b=$("djSave");const dirty2=JSON.stringify([dr.mood,dr.text,dr.good,dr.quote,dr.tags.slice().sort()])!==JSON.stringify([saved.mood||0,saved.text||"",saved.good||"",saved.quote||"",(saved.tags||[]).slice().sort()]);b.disabled=!dirty2;b.textContent=dirty2?"Simpan jurnal":"Tersimpan ✓"};
  const move=x=>{if(x>today())return;diaryDay=x;djDraft=null;render()};
  const leave=x=>{if(!$("djSave").disabled&&!confirm("Catatan belum disimpan. Pindah tanggal tanpa menyimpan?"))return;move(x)};
  $("djPrev").onclick=()=>leave(addDays(d,-1));$("djNext").onclick=()=>leave(addDays(d,1));$("djToday").onclick=()=>leave(today());
  $("djDate").onchange=e=>e.target.value&&leave(e.target.value);
  v.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>leave(b.dataset.go));
  v.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{dr.mood=+b.dataset.mood;v.querySelectorAll("[data-mood]").forEach(x=>x.classList.toggle("on",x===b));upd()});
  v.querySelectorAll("[data-tag]").forEach(b=>b.onclick=()=>{const t=b.dataset.tag,i=dr.tags.indexOf(t);i<0?dr.tags.push(t):dr.tags.splice(i,1);b.classList.toggle("on");upd()});
  $("djText").oninput=e=>{dr.text=e.target.value;upd()};$("djGood").oninput=e=>{dr.good=e.target.value;upd()};$("djQuote").oninput=e=>{dr.quote=e.target.value;upd()};
  $("djAddEv").onclick=()=>{if(!evs.length)return;const add=evs.map(o=>"• "+(o.allDay?"":o.start+" ")+o.title).join("\n");dr.text=(dr.text?dr.text.replace(/\s+$/,"")+"\n":"")+add;$("djText").value=dr.text;upd()};
  $("djSave").onclick=async()=>{if(!dr.mood&&!dr.text.trim()&&!dr.good.trim()&&!dr.quote.trim()){alert("Pilih mood atau tulis sesuatu dulu.");return}
    $("djSave").disabled=true;try{await col.doc("dj_"+d).set({kind:"dj",date:d,mood:dr.mood,text:dr.text,good:dr.good,quote:dr.quote,tags:dr.tags,updated:Date.now()});
      window.DIARY={...(window.DIARY||{}),[d]:{date:d,mood:dr.mood,text:dr.text,good:dr.good,quote:dr.quote,tags:[...dr.tags]}};djDraft=null;render()}
    catch(e){alert("Gagal simpan: "+e.message);$("djSave").disabled=false}};
  const del=$("djDel");if(del)del.onclick=async()=>{if(!confirm("Hapus jurnal "+fmtLong(d)+"?"))return;try{await col.doc("dj_"+d).delete();const D2={...(window.DIARY||{})};delete D2[d];window.DIARY=D2;djDraft=null;render()}catch(e){alert("Gagal menghapus: "+e.message)}};
  setTimeout(()=>{const t=$("djText");if(t&&!dr.text&&d===today())t.focus({preventScroll:true})},50)}

/* ---------- KATA-KATA HARI INI ---------- */
const QUOTES=[
 ["Uang kecil yang dicatat lebih berharga daripada uang besar yang dilupakan.","Catatan keuangan"],
 ["Pelan-pelan asal konsisten. Sehari satu langkah, sebulan sudah jauh.","Semangat harian"],
 ["Bukan soal berapa yang kamu dapat, tapi berapa yang kamu simpan.","Catatan keuangan"],
 ["Istirahat itu bagian dari rencana, bukan tanda menyerah.","Semangat harian"],
 ["Hari yang biasa-biasa saja tetap layak disyukuri.","Jurnal harian"],
 ["Tulis tujuanmu, lalu cicil sedikit demi sedikit — seperti menabung.","Semangat harian"],
 ["Hemat bukan pelit; hemat itu memilih yang paling penting.","Catatan keuangan"],
 ["Kalau hari ini berat, cukup selesaikan satu hal kecil.","Semangat harian"],
 ["Anggaran itu bukan penjara, tapi peta.","Catatan keuangan"],
 ["Jangan bandingkan bab satu hidupmu dengan bab sepuluh hidup orang lain.","Jurnal harian"],
 ["Sedikit demi sedikit, lama-lama menjadi bukit.","Peribahasa"],
 ["Hemat pangkal kaya, rajin pangkal pandai.","Peribahasa"],
 ["Berakit-rakit ke hulu, berenang-renang ke tepian; bersakit-sakit dahulu, bersenang-senang kemudian.","Peribahasa"],
 ["Di mana ada kemauan, di situ ada jalan.","Peribahasa"],
 ["Saldo yang cocok bikin tidur nyenyak.","Catatan keuangan"],
 ["Satu hal baik hari ini tetap satu hal baik.","Jurnal harian"],
 ["Gaji datang, tabungan dulu — baru jajan.","Catatan keuangan"],
 ["Progres kecil tetap progres.","Semangat harian"],
 ["Kamu tidak harus produktif setiap jam untuk jadi berharga.","Jurnal harian"],
 ["Ingat kenapa kamu mulai.","Semangat harian"],
 ["Pengeluaran kecil yang rutin bisa jadi lubang besar. Cek, catat, rem.","Catatan keuangan"],
 ["Hari ini adalah halaman baru. Isi dengan yang kamu mau.","Jurnal harian"],
 ["Air beriak tanda tak dalam.","Peribahasa"],
 ["Rencana tanpa catatan cuma angan-angan.","Catatan keuangan"],
 ["Tidak apa-apa pelan, asal tidak berhenti.","Semangat harian"],
 ["Terima kasih, diriku, sudah bertahan sampai hari ini.","Jurnal harian"],
 ["Jangan menunggu kaya untuk menabung; menabunglah supaya cukup.","Catatan keuangan"],
 ["Belajar sedikit tiap hari lebih kuat daripada banyak sekali-sekali.","Semangat harian"],
 ["Malu bertanya sesat di jalan.","Peribahasa"],
 ["Pilih bahagia yang sederhana hari ini.","Jurnal harian"]];
function dayIndex(d){const x=new Date(d+"T00:00:00");return Math.floor(x.getTime()/864e5)}
function quoteFor(d){
  const own=Object.values(window.DIARY||{}).filter(j=>j.quote&&j.quote.trim()&&j.date<d).map(j=>[j.quote.trim(),"Kata-katamu · "+fmtDay(j.date)]);
  const mine=(window.NOTES||[]).filter(n=>n.kind2==="quote"&&n.body&&n.body.trim()).map(n=>[n.body.trim(),n.title||"Koleksi kata-kata"]);
  const pool=[...QUOTES,...own,...mine],todayOwn=((window.DIARY||{})[d]||{}).quote;
  if(todayOwn&&todayOwn.trim())return [todayOwn.trim(),"Kata-katamu hari ini"];
  return pool[dayIndex(d)%pool.length]}
function quoteCard(d){const [q,src]=quoteFor(d);
  return `<div class="region qcard"><div class="rb"><div class="qmark">“</div><div class="qtext">${esc(q)}</div><div class="qsrc">— ${esc(src)}</div>
   <div class="acts" style="margin-top:8px"><button class="sm" id="qSave">📝 Simpan ke catatan</button><button class="sm" id="qOwn">✍️ Tulis kata-kataku</button></div></div></div>`}
function wireQuote(v,d){const s=v.querySelector("#qSave");if(!s)return;const [q,src]=quoteFor(d);
  s.onclick=async()=>{try{await col.doc("nt_"+Date.now()).set({kind:"note",kind2:"quote",title:src,body:q,color:"yellow",pinned:false,tags:["kata-kata"],items:[],created:Date.now(),updated:Date.now()});status("Disimpan ke Catatan.","");setTimeout(()=>status(""),2000)}catch(e){alert("Gagal simpan: "+e.message)}};
  v.querySelector("#qOwn").onclick=()=>{diaryDay=d;go("diary");setTimeout(()=>{const i=$("djQuote");i&&i.focus()},200)}}

/* ---------- CATATAN (notes) ---------- */
const NCOLORS={white:["#ffffff","#2a2533"],yellow:["#fff6cc","#3a3216"],pink:["#ffe3ee","#3c1f2a"],blue:["#e3f0ff","#1b2a3d"],green:["#e2f6e6","#173022"],purple:["#efe6ff","#2a2140"]};
let noteQ="",noteTag="",noteView=null;
const noteDocs=()=>(window.NOTES||[]);
function vNotes(v){
  if(noteView){vNoteEdit(v,noteView);return}
  const q=noteQ.toLowerCase(),all=noteDocs();
  const tags=[...new Set(all.flatMap(n=>n.tags||[]))].sort();
  let list=all.filter(n=>(!noteTag||(n.tags||[]).includes(noteTag))&&(!q||[n.title,n.body,...(n.items||[]).map(i=>i.t),...(n.tags||[])].join(" ").toLowerCase().includes(q)));
  list.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||(b.updated||0)-(a.updated||0));
  const card=n=>{const c=NCOLORS[n.color]||NCOLORS.white,items=n.items||[],done=items.filter(i=>i.d).length;
    return `<div class="ncard" data-open="${esc(n._id)}" style="--nb:${c[0]};--nbd:${c[1]}">${n.pinned?'<span class="npin">📌</span>':""}
     ${n.kind2==="quote"?'<div class="nq">“</div>':""}${n.title?`<div class="nt">${esc(n.title)}</div>`:""}
     ${n.body?`<div class="nb">${esc(n.body.slice(0,260))}${n.body.length>260?"…":""}</div>`:""}
     ${items.length?`<div class="ni">${items.slice(0,5).map(i=>`<div class="${i.d?"dn":""}">${i.d?"☑":"☐"} ${esc(i.t)}</div>`).join("")}${items.length>5?`<div class="crumb">+${items.length-5} lagi</div>`:""}<div class="crumb">${done}/${items.length} selesai</div></div>`:""}
     <div class="nf">${(n.tags||[]).map(t=>`<span class="pill p-mute">#${esc(t)}</span>`).join(" ")}<span class="crumb">${new Date(n.updated||n.created||0).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}</span></div></div>`};
  v.innerHTML=page("Harian","Catatan",`<button class="pri" id="nNew">+ Catatan</button><button id="nNewList">+ Checklist</button><button id="nNewQ">+ Kata-kata</button>`)+
   quoteCard(today())+
   `<div class="filters"><div style="flex:1;min-width:200px"><label>Cari</label><input id="nQ" value="${esc(noteQ)}" placeholder="Cari judul, isi, tag…"></div></div>
   ${tags.length?`<div class="tags" style="margin-bottom:12px"><button data-tg="" class="${noteTag?"":"on"}">Semua</button>${tags.map(t=>`<button data-tg="${esc(t)}" class="${noteTag===t?"on":""}">#${esc(t)}</button>`).join("")}</div>`:""}
   ${list.length?`<div class="ngrid">${list.map(card).join("")}</div>`:`<div class="region"><div class="rb crumb">${all.length?"Tidak ada catatan yang cocok.":"Belum ada catatan. Tulis ide, daftar belanja, rencana, atau kata-kata favoritmu di sini."}</div></div>`}`;
  const nw=(kind2,extra)=>{noteView={_new:true,kind2,title:"",body:"",color:kind2==="quote"?"yellow":"white",pinned:false,tags:kind2==="quote"?["kata-kata"]:[],items:extra||[]};render()};
  $("nNew").onclick=()=>nw("note");$("nNewList").onclick=()=>nw("list",[{t:"",d:false}]);$("nNewQ").onclick=()=>nw("quote");
  const qi=$("nQ");qi.oninput=()=>{noteQ=qi.value;const p=qi.selectionStart;render();const n=$("nQ");if(n){n.focus();n.setSelectionRange(p,p)}};
  v.querySelectorAll("[data-tg]").forEach(b=>b.onclick=()=>{noteTag=b.dataset.tg;render()});
  v.querySelectorAll("[data-open]").forEach(c=>c.onclick=()=>{const n=noteDocs().find(x=>x._id===c.dataset.open);if(n){noteView=JSON.parse(JSON.stringify(n));render()}});
  wireQuote(v,today())}
function vNoteEdit(v,n){
  const c=NCOLORS[n.color]||NCOLORS.white;
  v.innerHTML=page("Harian",n._new?"Catatan baru":"Edit catatan",`<button class="pri" id="neSave">Simpan</button><button id="neBack">Kembali</button>`)+
   `<div class="region neditor" style="--nb:${c[0]};--nbd:${c[1]}"><div class="rb">
     <input id="neT" class="netitle" value="${esc(n.title)}" placeholder="${n.kind2==="quote"?"Sumber / judul (opsional)":"Judul"}">
     <textarea id="neB" placeholder="${n.kind2==="quote"?"Tulis kata-kata yang ingin kamu ingat…":"Tulis catatanmu…"}">${esc(n.body)}</textarea>
     <div id="neItems"></div>
     <div class="acts" style="margin-top:8px"><button class="sm" id="neAddItem">+ Item checklist</button></div>
   </div></div>
   <div class="region"><div class="rb">
     <label>Warna</label><div class="ncolors">${Object.entries(NCOLORS).map(([k,v2])=>`<button data-col="${k}" class="${n.color===k?"on":""}" style="background:${v2[0]}" title="${k}"></button>`).join("")}</div>
     <label style="margin-top:12px">Tag (pisahkan dengan koma)</label><input id="neTags" value="${esc((n.tags||[]).join(", "))}" placeholder="mis. ide, belanja, kuliah">
     <label style="display:flex;gap:6px;align-items:center;color:var(--ink);margin-top:12px"><input type="checkbox" id="nePin" style="width:auto;min-height:0"${n.pinned?" checked":""}> 📌 Sematkan di atas</label>
     <label style="display:flex;gap:6px;align-items:center;color:var(--ink);margin-top:6px"><input type="checkbox" id="neQ" style="width:auto;min-height:0"${n.kind2==="quote"?" checked":""}> 💬 Masukkan ke rotasi "Kata-kata hari ini"</label>
   </div></div>
   ${n._new?"":'<div class="acts"><button id="neDel">Hapus catatan</button></div>'}`;
  const items=n.items||(n.items=[]);
  const drawItems=()=>{$("neItems").innerHTML=items.map((it,i)=>`<div class="nitem"><input type="checkbox" data-ck="${i}"${it.d?" checked":""}><input data-it="${i}" value="${esc(it.t)}" placeholder="Item…" class="${it.d?"dn":""}"><button class="sm" data-rmi="${i}">×</button></div>`).join("");
    $("neItems").querySelectorAll("[data-ck]").forEach(b=>b.onchange=()=>{items[b.dataset.ck].d=b.checked;drawItems()});
    $("neItems").querySelectorAll("[data-it]").forEach(b=>{b.oninput=()=>items[b.dataset.it].t=b.value;b.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();items.splice(+b.dataset.it+1,0,{t:"",d:false});drawItems();const nx=$("neItems").querySelector(`[data-it="${+b.dataset.it+1}"]`);nx&&nx.focus()}}});
    $("neItems").querySelectorAll("[data-rmi]").forEach(b=>b.onclick=()=>{items.splice(+b.dataset.rmi,1);drawItems()})};
  drawItems();
  $("neT").oninput=e=>n.title=e.target.value;$("neB").oninput=e=>n.body=e.target.value;
  $("neAddItem").onclick=()=>{items.push({t:"",d:false});drawItems();const l=$("neItems").querySelectorAll("[data-it]");l[l.length-1].focus()};
  v.querySelectorAll("[data-col]").forEach(b=>b.onclick=()=>{n.color=b.dataset.col;const c2=NCOLORS[n.color];const ed=v.querySelector(".neditor");ed.style.setProperty("--nb",c2[0]);ed.style.setProperty("--nbd",c2[1]);v.querySelectorAll("[data-col]").forEach(x=>x.classList.toggle("on",x===b))});
  $("neBack").onclick=()=>{noteView=null;render()};
  $("neSave").onclick=async()=>{n.tags=$("neTags").value.split(",").map(t=>t.trim().replace(/^#/,"")).filter(Boolean);n.pinned=$("nePin").checked;
    n.kind2=$("neQ").checked?"quote":(items.length?"list":"note");n.items=items.filter(i=>i.t.trim());
    if(!n.title.trim()&&!n.body.trim()&&!n.items.length){alert("Catatan masih kosong.");return}
    const id=n._id||("nt_"+Date.now()),{_id,_new,...data}=n;
    try{await col.doc(id).set({...data,kind:"note",created:n.created||Date.now(),updated:Date.now()});noteView=null;render()}catch(e){alert("Gagal simpan: "+e.message)}};
  const del=$("neDel");if(del)del.onclick=async()=>{if(!confirm("Hapus catatan ini?"))return;try{await col.doc(n._id).delete();noteView=null;render()}catch(e){alert("Gagal menghapus: "+e.message)}};
  if(n._new)setTimeout(()=>{const el=n.kind2==="list"?$("neItems")?.querySelector("[data-it]"):$("neB");el&&el.focus()},50)}

/* ---------- form acara ---------- */
function eventForm(ev,day,mode){
  const d=ev?(mode==="all"?ev.date:(day||ev.date)):day,isRecOne=mode==="one";
  const bg=modal(ev?"Edit acara":"Acara baru",`<div class="fg">
   <div class="full"><label>Judul</label><input id="ev_t" value="${esc(ev?.title||"")}" placeholder="mis. Kuliah Manajemen Keuangan"></div>
   <div><label>Kategori</label><select id="ev_c">${CATS.map(c=>`<option value="${c.k}"${c.k===(ev?.cat||"pribadi")?" selected":""}>${c.n}</option>`).join("")}</select></div>
   <div><label>Tanggal</label><input type="date" id="ev_d" value="${d}"></div>
   <div class="full"><label style="display:flex;gap:6px;align-items:center;color:var(--ink)"><input type="checkbox" id="ev_ad" style="width:auto;min-height:0"${ev?.allDay?" checked":""}> Seharian</label></div>
   <div class="tm"><label>Mulai</label><input type="time" id="ev_s" value="${ev?.start||"08:00"}"></div>
   <div class="tm"><label>Selesai</label><input type="time" id="ev_e" value="${ev?.end||"09:00"}"></div>
   <div class="full"><label>Lokasi</label><input id="ev_l" value="${esc(ev?.location||"")}"></div>
   ${isRecOne?`<div class="full msg" style="margin:0">Perubahan hanya berlaku untuk tanggal ini.</div>`:
   `<div><label>Ulangi</label><select id="ev_r">${[["","Tidak"],["DAILY","Setiap hari"],["WEEKLY","Setiap minggu"],["MONTHLY","Setiap bulan"]].map(([k,n])=>`<option value="${k}"${(ev?.repeat||"")===k?" selected":""}>${n}</option>`).join("")}</select></div>
   <div><label>Sampai tanggal</label><input type="date" id="ev_u" value="${ev?.until||""}"></div>`}
   <div><label>Pengingat</label><select id="ev_m">${REMS.map(([k,n])=>`<option value="${k}"${String(ev?.reminder??"30")===k?" selected":""}>${n}</option>`).join("")}</select></div>
   <div class="full"><label>Catatan</label><input id="ev_n" value="${esc(ev?.notes||"")}"></div></div>`,
   async bg=>{const q=s=>bg.querySelector(s);
     const t=q("#ev_t").value.trim();if(!t){alert("Judul wajib diisi.");return false}
     const ad=q("#ev_ad").checked,s=q("#ev_s").value,e=q("#ev_e").value;if(!ad&&e<=s){alert("Jam selesai harus setelah jam mulai.");return false}
     const data={title:t,cat:q("#ev_c").value,date:q("#ev_d").value,allDay:ad,start:ad?"":s,end:ad?"":e,location:q("#ev_l").value.trim(),notes:q("#ev_n").value.trim(),reminder:q("#ev_m").value};
     if(!isRecOne){data.repeat=q("#ev_r").value;data.until=data.repeat?q("#ev_u").value:""}else{data.repeat="";data.until=""}
     try{if(!ev)await saveEv("ev_"+Date.now(),{...data,created:Date.now()});
       else if(isRecOne){await saveEv(ev._id,{...strip(ev),exceptions:[...(ev.exceptions||[]),day]});await saveEv("ev_"+Date.now(),{...data,created:Date.now()})}
       else await saveEv(ev._id,{...strip(ev),...data,exceptions:data.repeat?(ev.exceptions||[]):[]})}
     catch(x){alert("Gagal simpan: "+x.message);return false}},"Simpan");
  const sync=()=>bg.querySelectorAll(".tm").forEach(el=>el.style.display=bg.querySelector("#ev_ad").checked?"none":"");
  bg.querySelector("#ev_ad").onchange=sync;sync()}
const strip=e=>{const {_id,id,rec,...r}=e;return r};
const findDoc=id=>evDocs().find(e=>e._id===id);
function askScope(title,onPick){modal(title,`<label style="display:flex;gap:8px;align-items:center;color:var(--ink)"><input type="radio" name="sc" value="one" checked style="width:auto;min-height:0"> Hanya tanggal ini</label>
   <label style="display:flex;gap:8px;align-items:center;margin-top:8px;color:var(--ink)"><input type="radio" name="sc" value="all" style="width:auto;min-height:0"> Semua kejadian (seluruh seri)</label>`,
   async bg=>{const v=bg.querySelector('input[name=sc]:checked').value;setTimeout(()=>onPick(v),0)},"Lanjut")}
function editFlow(id,date){const ev=findDoc(id);if(!ev)return;if(ev.repeat)askScope("Edit acara berulang",m=>eventForm(ev,date,m));else eventForm(ev,date)}
function delFlow(id,date){const ev=findDoc(id);if(!ev)return;
  if(ev.repeat)askScope("Hapus acara berulang",async m=>{try{if(m==="one")await saveEv(ev._id,{...strip(ev),exceptions:[...(ev.exceptions||[]),date]});else await delDoc(ev._id)}catch(x){alert("Gagal menghapus: "+x.message)}});
  else if(confirm(`Hapus "${ev.title||""}"?`))delDoc(ev._id).catch(x=>alert("Gagal menghapus: "+x.message))}

/* ---------- jadwal mingguan ---------- */
function weeklyBuilder(){
  let rows=[{d:1,s:"08:00",e:"09:40",t:"",l:"",c:"kuliah"}];
  const bg=modal("Jadwal mingguan (kuliah / shift kerja)",`<div class="crumb">Isi sekali per semester. Setiap baris jadi acara berulang mingguan sampai tanggal selesai.</div>
    <div class="fg" style="margin-top:10px"><div><label>Mulai berlaku</label><input type="date" id="wk_a" value="${today()}"></div><div><label>Sampai</label><input type="date" id="wk_b" value="${addDays(today(),16*7)}"></div>
    <div><label>Pengingat</label><select id="wk_m">${REMS.map(([k,n])=>`<option value="${k}"${k==="30"?" selected":""}>${n}</option>`).join("")}</select></div></div>
    <div id="wk_rows" style="margin-top:10px"></div><button class="sm" id="wk_add" style="margin-top:8px">+ Baris</button>`,
   async bg=>{const a=bg.querySelector("#wk_a").value,b=bg.querySelector("#wk_b").value,m=bg.querySelector("#wk_m").value;
     if(!a||!b||b<a){alert("Periksa tanggal mulai dan selesai.");return false}
     const ok=rows.filter(r=>r.t.trim());if(!ok.length){alert("Isi minimal satu judul.");return false}
     for(const r of ok)if(r.e<=r.s){alert(`"${r.t}": jam selesai harus setelah jam mulai.`);return false}
     try{let i=0;for(const r of ok){let d=a;while(dow(d)!==+r.d)d=addDays(d,1);if(d>b)continue;
        await saveEv("ev_"+(Date.now()+i++),{title:r.t.trim(),cat:r.c,date:d,allDay:false,start:r.s,end:r.e,location:r.l.trim(),notes:"",reminder:m,repeat:"WEEKLY",until:b,created:Date.now()})}}
     catch(x){alert("Gagal simpan: "+x.message);return false}
     monthAnchor=a.slice(0,7);selDay=a},"Simpan jadwal");
  const box=bg.querySelector("#wk_rows");
  const draw=()=>{box.innerHTML=rows.map((r,i)=>`<div style="border:1px solid var(--line);border-radius:10px;padding:8px;margin-bottom:8px">
     <div class="fg" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">
      <div><label>Hari</label><select data-i="${i}" data-f="d">${[1,2,3,4,5,6,0].map(k=>`<option value="${k}"${+r.d===k?" selected":""}>${HARI[k]}</option>`).join("")}</select></div>
      <div><label>Mulai</label><input type="time" data-i="${i}" data-f="s" value="${r.s}"></div>
      <div><label>Selesai</label><input type="time" data-i="${i}" data-f="e" value="${r.e}"></div>
      <div><label>Kategori</label><select data-i="${i}" data-f="c">${CATS.map(c=>`<option value="${c.k}"${c.k===r.c?" selected":""}>${c.n}</option>`).join("")}</select></div>
      <div class="full"><label>Judul</label><input data-i="${i}" data-f="t" value="${esc(r.t)}" placeholder="mis. Ekonometrika / Shift kerja"></div>
      <div class="full"><label>Lokasi / ruang</label><input data-i="${i}" data-f="l" value="${esc(r.l)}"></div></div>
     ${rows.length>1?`<button class="sm" data-rm="${i}" style="margin-top:6px">Hapus baris</button>`:""}</div>`).join("");
    box.querySelectorAll("[data-f]").forEach(el=>el.oninput=el.onchange=()=>{rows[el.dataset.i][el.dataset.f]=el.value});
    box.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.rm,1);draw()})};
  bg.querySelector("#wk_add").onclick=()=>{const l=rows[rows.length-1];rows.push({...l,d:(+l.d+1)%7,t:"",l:""});draw()};draw()}

/* ---------- pengingat keuangan otomatis ---------- */
const FIXED=["5101","5102","5103","5104","5105","5106","5107","5401","5402","5501","5602","2101","2102"];
function finDefaults(){const b=budgetFor(today().slice(0,7))||{lines:{}};
  const items=FIXED.filter(c=>num(b.lines[c])).map(c=>({n:acctName(c),amt:num(b.lines[c]),day:c==="5101"?1:10,time:"09:00"}));
  return {items:items.length?items:[{n:"Sewa Kost",amt:0,day:1,time:"09:00"}],payday:25,recon:true,reconDay:0,close:true}}
function finRegion(){const f=window.BILLS;
  return `<div class="region"><div class="rh"><span>💸 Pengingat keuangan otomatis</span><button class="sm pri" id="finSet">${f?"Ubah":"Atur sekarang"}</button></div>
   <div class="rb">${f?`<ul style="margin:0;padding-left:18px;font-size:13.5px">${(f.items||[]).map(i=>`<li>${esc(i.n)}${i.amt?" – "+rp(i.amt):""} · tiap tgl ${i.day===-1?"akhir bulan":i.day}</li>`).join("")}
     ${f.payday?`<li>Gajian · tiap tgl ${f.payday===-1?"akhir bulan":f.payday}</li>`:""}${f.recon?`<li>Cek saldo real · tiap ${HARI[f.reconDay]}</li>`:""}${f.close?"<li>Tutup periode & backup · akhir bulan</li>":""}</ul>`:
     `<div class="crumb">Tagihan rutin, tanggal gajian, cek saldo mingguan, dan tutup buku akhir bulan langsung muncul di kalender dengan pengingat. Diambil dari anggaranmu.</div>`}</div></div>`}
function finEditor(){
  const f=JSON.parse(JSON.stringify(window.BILLS||finDefaults()));
  const dayOpts=sel=>[...Array(28)].map((_,i)=>`<option value="${i+1}"${+sel===i+1?" selected":""}>${i+1}</option>`).join("")+`<option value="-1"${+sel===-1?" selected":""}>Akhir bulan</option>`;
  const bg=modal("Pengingat keuangan",`<div class="crumb">Muncul otomatis di kalender setiap bulan, dengan pengingat H-1.</div>
    <div id="fin_rows" style="margin-top:10px"></div><button class="sm" id="fin_add">+ Tagihan</button>
    <div class="fg" style="margin-top:12px">
     <div><label>Tanggal gajian</label><select id="fin_pay"><option value="0">Tidak usah</option>${dayOpts(f.payday)}</select></div>
     <div><label>Cek saldo real mingguan</label><select id="fin_rec"><option value="-1">Tidak usah</option>${HARI.map((h,i)=>`<option value="${i}"${f.recon&&+f.reconDay===i?" selected":""}>${h}</option>`).join("")}</select></div>
     <div class="full"><label style="display:flex;gap:6px;align-items:center;color:var(--ink)"><input type="checkbox" id="fin_cl" style="width:auto;min-height:0"${f.close?" checked":""}> Pengingat tutup periode & backup tiap akhir bulan</label></div></div>`,
   async bg=>{f.payday=+bg.querySelector("#fin_pay").value;const rd=+bg.querySelector("#fin_rec").value;f.recon=rd>=0;f.reconDay=Math.max(0,rd);f.close=bg.querySelector("#fin_cl").checked;
     f.items=f.items.filter(i=>i.n.trim());
     try{await col.doc("bills").set(f);window.BILLS=f}catch(e){alert("Gagal simpan: "+e.message);return false}},"Simpan");
  const box=bg.querySelector("#fin_rows");
  const draw=()=>{box.innerHTML=f.items.map((it,i)=>`<div style="border:1px solid var(--line);border-radius:10px;padding:8px;margin-bottom:8px"><div class="fg" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">
     <div class="full"><label>Nama tagihan</label><input data-i="${i}" data-f="n" value="${esc(it.n)}"></div>
     <div><label>Nominal</label><input data-i="${i}" data-f="amt" value="${fmtIn(it.amt)}"></div>
     <div><label>Jatuh tempo tgl</label><select data-i="${i}" data-f="day">${dayOpts(it.day)}</select></div>
     <div><label>Jam</label><input type="time" data-i="${i}" data-f="time" value="${it.time||"09:00"}"></div></div>
     <button class="sm" data-rm="${i}" style="margin-top:6px">Hapus</button></div>`).join("");
    box.querySelectorAll("[data-f]").forEach(el=>{if(el.dataset.f==="amt")numInput(el);el.oninput=el.onchange=()=>{const it=f.items[el.dataset.i];it[el.dataset.f]=el.dataset.f==="amt"?num(el.value):el.dataset.f==="day"?+el.value:el.value}});
    box.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{f.items.splice(+b.dataset.rm,1);draw()})};
  bg.querySelector("#fin_add").onclick=()=>{f.items.push({n:"",amt:0,day:10,time:"09:00"});draw()};draw()}

/* ---------- NOTIFIKASI ---------- */
const canNotify=()=>"Notification" in window;
function notifBanner(){if(!canNotify()||Notification.permission==="granted")return "";
  if(Notification.permission==="denied")return `<div class="msg warn">🔕 Notifikasi diblokir browser. Izinkan lewat ikon gembok di address bar → Notifikasi → Izinkan. Pengingat tetap muncul lewat karakter ngintip.</div>`;
  return `<div class="msg">🔔 Aktifkan notifikasi supaya pengingat acara muncul. <button class="lnk" id="nfOn">Aktifkan</button></div>`}
function wireNotif(v){const b=v.querySelector("#nfOn");if(b)b.onclick=async()=>{try{await Notification.requestPermission()}catch(e){}render()}}
let swReg=null;
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").then(r=>swReg=r).catch(()=>{});
function fire(o,whenTxt){
  const T=window.i18nT||(x=>x),title=T(o.title||"Acara")+(whenTxt?" · "+T(whenTxt):""),body=T((o.allDay?"Seharian":o.start+"–"+o.end)+(o.location?" · "+o.location:""));
  if(canNotify()&&Notification.permission==="granted"){const opt={body,icon:"icon.svg",badge:"icon.svg",tag:o.id+o.date};
    const plain=()=>{try{new Notification(title,opt)}catch(e){}};
    try{if(swReg)swReg.showNotification(title,opt).catch(plain);else plain()}catch(e){plain()}}
  if(window.doPeek)window.doPeek(true,{t:"🔔 "+title,d:body,r:"today",m:"think",w:9})}
function checkReminders(){
  if(typeof col==="undefined"||!col)return;
  const td=today(),now=Date.now();
  for(const o of occurrences(addDays(td,-1),addDays(td,2))){
    if(!hasRem(o))continue;
    const startMs=Date.parse(o.date+"T"+(o.allDay?"07:00":o.start)+":00+07:00"),fireAt=startMs-(+o.reminder)*60000;
    if(now<fireAt||now>startMs+15*60000)continue;
    const k="bbp_rem_"+o.id+"_"+o.date+"_"+o.reminder;try{if(localStorage.getItem(k))continue;localStorage.setItem(k,"1")}catch(e){continue}
    const mins=Math.round((startMs-now)/60000);
    fire(o,mins<=1?"sekarang":mins<60?mins+" menit lagi":mins<1440?Math.round(mins/60)+" jam lagi":"besok")}}
setInterval(checkReminders,30000);setTimeout(checkReminders,5000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkReminders()});

/* ---------- dua aplikasi: Keuangan & Harian ---------- */
const SCHED_ROUTES=new Set(["today","sched","diary","notes"]);
let appMode=(()=>{try{return localStorage.getItem("bbp_app")||"fin"}catch(e){return "fin"}})();
const SHARED=new Set(["guide","quest","album","look","games","tools","t_moment","t_split","t_wish","t_habit","t_wheel","t_calc"]);
const modeOf=r=>SCHED_ROUTES.has(r)?"sched":(SHARED.has(r)?appMode:"fin");
function drawSwitch(){const hdr=document.querySelector("header");if(!hdr)return;let sw=hdr.querySelector(".appsw");
  if(!sw){sw=document.createElement("div");sw.className="appsw";sw.innerHTML='<button data-app="fin">💰 Jurnal Keuangan</button><button data-app="sched">📔 Jurnal Harian</button>';
    hdr.querySelector(".app").after(sw);sw.querySelectorAll("button").forEach(b=>b.onclick=()=>{appMode=b.dataset.app;try{localStorage.setItem("bbp_app",appMode)}catch(e){}go(appMode==="sched"?"today":"dash")})}
  const m=modeOf(route);if(m!==appMode&&!SHARED.has(route)){appMode=m;try{localStorage.setItem("bbp_app",m)}catch(e){}}
  sw.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.app===modeOf(route)))}
const _renderNav=renderNav;
renderNav=function(){const all=NAV.slice(),sch=modeOf(route)==="sched";
  const keep=all.filter(([g,items])=>g==="Bantuan"||g==="Misi"||g==="Alat"||(sch?items.some(([k])=>SCHED_ROUTES.has(k)):!items.some(([k])=>SCHED_ROUTES.has(k))));
  NAV.length=0;NAV.push(...keep);try{_renderNav()}finally{NAV.length=0;NAV.push(...all)}drawSwitch()};

NAV.splice(1,0,["Harian",[["today","Hari Ini"],["sched","Kalender"],["diary","Jurnal Harian"],["notes","Catatan"]]]);
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{today:vToday,sched:vSched,diary:vDiary,notes:vNotes});
window.occurrences=occurrences;window.checkReminders=checkReminders;
window.addEventListener("load",()=>{if(SCHED_ROUTES.has(route))render();else renderNav()});
})();
