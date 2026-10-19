/* =====================================================================
   ALAT SERBA GUNA
   Momen Kita · Patungan · Celengan Impian · Kebiasaan · Roda Pilihan · Kalkulator
   Data disimpan di satu dokumen "tools" pada tabel docs yang sudah ada.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const rpx=n=>"Rp"+Math.round(n||0).toLocaleString("id-ID");
const N=v=>{const x=parseFloat(String(v??"").replace(/\./g,"").replace(",","."));return isFinite(x)?x:0};
const N2=v=>{const x=parseFloat(String(v??"").replace(",","."));return isFinite(x)?x:0};
const tday=()=>typeof today==="function"?today():new Date().toISOString().slice(0,10);
const D=s=>new Date(s+"T00:00:00");
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dDiff=(a,b)=>Math.round((D(b)-D(a))/864e5);
const addDays=(s,n)=>{const d=D(s);d.setDate(d.getDate()+n);return iso(d)};
const fmtD=s=>D(s).toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short",year:"numeric"});
const T=()=>window.TOOLS||{};
async function saveT(patch){if(!col){alert(L("Belum tersambung ke database.","Not connected to the database yet."));return false}
  const t={...JSON.parse(JSON.stringify(T())),...patch};window.TOOLS=t;
  try{await col.doc("tools").set(t);return true}catch(e){alert(L("Gagal menyimpan: ","Save failed: ")+e.message);return false}}
const uid=()=>Math.random().toString(36).slice(2,9);
const back=`<button class="sm" data-tgo="tools">← ${L("Semua alat","All tools")}</button>`;
function wireBack(v){v.querySelectorAll("[data-tgo]").forEach(b=>b.onclick=()=>go(b.dataset.tgo))}
function money(el){el.setAttribute("inputmode","numeric");el.addEventListener("input",()=>{const p=el.selectionStart,l=el.value.length;const n=String(el.value).replace(/[^\d]/g,"");el.value=n?(+n).toLocaleString("id-ID"):"";try{const q=p+(el.value.length-l);el.setSelectionRange(q,q)}catch(e){}})}

const css=document.createElement("style");css.textContent=`
.tl-hub{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.tl-card{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:12px;align-items:flex-start;padding:14px;border:2px solid var(--line);border-radius:18px;background:var(--card);transition:transform .15s,border-color .15s}
.tl-card:hover,.tl-card:focus-visible{border-color:var(--acc);transform:translateY(-2px)}
.tl-card .ic{font-size:30px;line-height:1;flex:none}.tl-card b{display:block;font-size:15px;margin-bottom:2px}.tl-card .crumb{font-size:12.5px;line-height:1.4}
.tl-card .peek{display:block;margin-top:6px;font-size:12px;font-weight:800;color:var(--acc)}
.tl-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.tl-row>*{min-width:0}
.tl-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.tl-big{font-size:34px;font-weight:800;color:var(--acc);line-height:1.1;font-variant-numeric:tabular-nums}
.tl-list{display:flex;flex-direction:column}.tl-item{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}.tl-item:last-child{border-bottom:0}
.tl-item .grow{flex:1;min-width:0}.tl-item .grow b{display:block;overflow-wrap:anywhere}
.tl-cd{font-weight:800;font-variant-numeric:tabular-nums;color:var(--acc);white-space:nowrap}
.tl-bar{height:10px;background:var(--th);border-radius:99px;overflow:hidden;margin-top:6px}.tl-bar i{display:block;height:100%;background:var(--acc);border-radius:99px}
.tl-week{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:6px}
.tl-day{all:unset;box-sizing:border-box;cursor:pointer;aspect-ratio:1;max-width:38px;border-radius:10px;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--mute)}
.tl-day.on{background:var(--acc);border-color:var(--acc);color:#fff}.tl-day.td{outline:2px solid var(--acc);outline-offset:1px}
.tl-wheel{display:flex;flex-direction:column;align-items:center;gap:12px}
.tl-wheel .wrap{position:relative;width:min(320px,100%);aspect-ratio:1}.tl-wheel canvas{width:100%;height:100%;display:block}
.tl-wheel .pin{position:absolute;top:-6px;left:50%;transform:translateX(-50%);font-size:28px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))}
.tl-res{font-size:22px;font-weight:800;text-align:center;min-height:30px}
.tl-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.tl-out{background:var(--th);border-radius:14px;padding:12px 14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.tl-out .k{font-size:12px;color:var(--mute)}.tl-out .v{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}
.tl-pre{white-space:pre-wrap;background:var(--th);border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.5}
.tl-hearts{font-size:13px;color:var(--mute)}
`;document.head.appendChild(css);

/* =====================================================================
   1) MOMEN KITA
   ===================================================================== */
function nextYearly(md,from){const y=+from.slice(0,4);let c=y+"-"+md;if(c<from)c=(y+1)+"-"+md;return c}
function nextMonthly(start,from){const day=+start.slice(8,10);let d=D(from);
  for(let i=0;i<14;i++){const y=d.getFullYear(),m=d.getMonth();const last=new Date(y,m+1,0).getDate();const c=iso(new Date(y,m,Math.min(day,last)));if(c>=from&&c>start)return c;d=new Date(y,m+1,1)}return from}
function vMoment(v){
  const m=T().moment||{},td=tday();
  const head=page(L("Alat","Tools"),"💑 "+L("Momen Kita","Our Moments"),back);
  if(!m.start){v.innerHTML=head+`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0 0 12px">${window.pipi?window.pipi("happy",64,"vnel"):""}<div class="bubble"><b>${L("Kapan kalian jadian?","When did you two get together?")}</b><div>${L("Isi sekali. Aplikasi akan menghitung hari bersama, hitung mundur anniversary, dan momen spesial.","Fill it in once. The app counts your days together, anniversary countdowns and milestones.")}</div></div></div>
    <div class="tl-row"><input type="date" id="mStart" max="${td}" style="max-width:220px"><button class="pri" id="mSave">${L("Simpan","Save")}</button></div></div></div>`;
    wireBack(v);$("mSave").onclick=async()=>{const s=$("mStart").value;if(!s)return;await saveT({moment:{start:s,dates:[]}});render()};return}
  const days=dDiff(m.start,td),nm=nextMonthly(m.start,td),ny=nextYearly(m.start.slice(5),addDays(td,0)===m.start?addDays(td,1):td);
  const years=Math.floor(days/365.25),months=Math.floor((days%365.25)/30.44);
  const miles=[100,200,365,500,730,1000,1500,2000,3000].map(n=>({n,d:addDays(m.start,n)})).filter(x=>x.d>=td).slice(0,3);
  const ev=[...(m.dates||[]).map(x=>({...x,next:x.yearly?nextYearly(x.d.slice(5),td):x.d})).filter(x=>x.next>=td),
    {id:"_y",n:L("Anniversary tahunan","Yearly anniversary"),next:ny,e:"💍",sys:1},{id:"_m",n:L("Monthsary","Monthsary"),next:nm,e:"🌙",sys:1},
    ...miles.map(x=>({id:"_"+x.n,n:x.n+" "+L("hari bersama","days together"),next:x.d,e:"✨",sys:1}))].sort((a,b)=>a.next.localeCompare(b.next));
  v.innerHTML=head+`<div class="region"><div class="rb" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    ${window.pipi?window.pipi(days%100===0?"party":"happy",96,"vnel"):""}
    <div style="flex:1;min-width:180px"><div class="crumb">${L("Sudah bersama","Together for")}</div><div class="tl-big">${days.toLocaleString("id-ID")} ${L("hari","days")}</div>
    <div class="crumb">${years?years+" "+L("tahun","yr")+" ":""}${months} ${L("bulan","mo")} · ${L("sejak","since")} ${fmtD(m.start)}</div><div class="tl-hearts">${"💗".repeat(Math.min(10,1+Math.floor(days/100)))}</div></div></div></div>
   <div class="region"><div class="rh"><span>⏳ ${L("Hitung mundur","Countdown")}</span><button class="sm" id="mAdd">+ ${L("Tanggal penting","Important date")}</button></div><div class="rb"><div class="tl-list">
    ${ev.map(x=>{const n=dDiff(td,x.next);return `<div class="tl-item"><span style="font-size:22px">${x.e||"📌"}</span><div class="grow"><b></b><span class="crumb">${fmtD(x.next)}${x.yearly?" · "+L("tiap tahun","every year"):""}</span></div><span class="tl-cd">${n===0?L("Hari ini! 🎉","Today! 🎉"):n+" "+L("hari","days")}</span>${x.sys?"":`<button class="sm" data-del="${x.id}" aria-label="${L("Hapus","Delete")}">✕</button>`}</div>`}).join("")}
   </div></div></div>
   <div class="crumb" style="margin-top:6px">${L("Tanggal jadian","Start date")}: ${fmtD(m.start)} · <button class="lnk" id="mReset">${L("ubah","change")}</button></div>`;
  ev.forEach((x,i)=>{v.querySelectorAll(".tl-item b")[i].textContent=x.n});
  wireBack(v);
  $("mReset").onclick=async()=>{await saveT({moment:{...m,start:null}});render()};
  v.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{await saveT({moment:{...m,dates:(m.dates||[]).filter(x=>x.id!==b.dataset.del)}});render()});
  $("mAdd").onclick=()=>modal(L("Tanggal penting","Important date"),`<div class="fg"><div class="full"><label>${L("Nama","Name")}</label><input id="mdN" placeholder="${L("mis. Ulang tahun Vina","e.g. Vina's birthday")}"></div>
    <div><label>${L("Tanggal","Date")}</label><input type="date" id="mdD"></div><div><label>${L("Ikon","Icon")}</label><select id="mdE">${["🎂","🎁","✈️","🎓","💼","🏠","📌","❤️"].map(e=>`<option>${e}</option>`).join("")}</select></div>
    <div class="full"><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="mdY" checked style="width:auto"> ${L("Berulang tiap tahun","Repeats every year")}</label></div></div>`,
    async bg=>{const n=bg.querySelector("#mdN").value.trim(),d=bg.querySelector("#mdD").value;if(!n||!d){alert(L("Isi nama dan tanggal.","Fill in name and date."));return false}
      await saveT({moment:{...m,dates:[...(m.dates||[]),{id:uid(),n,d,e:bg.querySelector("#mdE").value,yearly:bg.querySelector("#mdY").checked}]}});render()},L("Simpan","Save"))}

/* =====================================================================
   2) PATUNGAN (split bill)
   ===================================================================== */
let splitDraft=null;
function vSplit(v){
  const t=T(),hist=t.splits||[];
  const s=splitDraft||(splitDraft={title:"",people:["Rafi","Vina"],items:[{n:"",a:"",who:"all"}],tax:"",svc:"",paid:"Rafi"});
  const calc=()=>{const sub=s.items.reduce((x,i)=>x+N(i.a),0),fee=sub*(N2(s.tax)+N2(s.svc))/100,share={};s.people.forEach(p=>share[p]=0);
    for(const i of s.items){const a=N(i.a);if(!a)continue;const who=i.who==="all"?s.people:[i.who].filter(w=>s.people.includes(w));const k=who.length||1;who.forEach(w=>share[w]+=a/k)}
    if(sub)for(const p of s.people)share[p]+=fee*(share[p]/sub);return {sub,fee,total:sub+fee,share}};
  const draw=()=>{const r=calc();
    v.innerHTML=page(L("Alat","Tools"),"🧮 "+L("Patungan","Split Bill"),back)+
    `<div class="region"><div class="rb"><div class="fg">
      <div class="full"><label>${L("Untuk apa?","What for?")}</label><input id="sTitle" placeholder="${L("mis. Nongkrong di kafe","e.g. Café hangout")}"></div>
      <div class="full"><label>${L("Siapa saja (pisahkan koma)","Who's in (comma-separated)")}</label><input id="sPeople"></div>
      <div><label>${L("Pajak %","Tax %")}</label><input id="sTax" inputmode="decimal" placeholder="10"></div><div><label>${L("Service %","Service %")}</label><input id="sSvc" inputmode="decimal" placeholder="5"></div>
      <div class="full"><label>${L("Yang bayar dulu","Who paid")}</label><select id="sPaid">${s.people.map(p=>`<option${p===s.paid?" selected":""}></option>`).join("")}</select></div></div>
     <h3 style="margin:14px 0 6px;font-size:14px">${L("Item","Items")}</h3><div id="sItems" class="tl-list">${s.items.map((i,k)=>`<div class="tl-item"><input data-k="${k}" data-f="n" placeholder="${L("Menu / barang","Item")}" style="flex:2;min-width:0"><input data-k="${k}" data-f="a" placeholder="Rp" style="flex:1;min-width:80px"><select data-k="${k}" data-f="who" style="flex:1;min-width:90px"><option value="all">${L("Semua","Everyone")}</option>${s.people.map(p=>`<option></option>`).join("")}</select><button class="sm" data-rm="${k}" aria-label="${L("Hapus","Delete")}">✕</button></div>`).join("")}</div>
     <button class="sm" id="sAddI" style="margin-top:6px">+ ${L("Tambah item","Add item")}</button></div></div>
    <div class="region" id="sRes"><div class="rh">💸 ${L("Hasil","Result")}</div><div class="rb"><div class="tl-out"><div><div class="k">Subtotal</div><div class="v">${rpx(r.sub)}</div></div><div><div class="k">${L("Pajak + service","Tax + service")}</div><div class="v">${rpx(r.fee)}</div></div><div><div class="k">Total</div><div class="v">${rpx(r.total)}</div></div></div>
     <div class="tl-list" style="margin-top:8px">${s.people.map(p=>`<div class="tl-item"><div class="grow"><b></b><span class="crumb">${p===s.paid?L("sudah bayar duluan","paid upfront"):L("transfer ke ","pay ")+esc(s.paid)}</span></div><span class="tl-cd">${rpx(r.share[p])}</span></div>`).join("")}</div>
     <div class="tl-row" style="margin-top:10px"><button class="pri" id="sCopy">📋 ${L("Salin ringkasan","Copy summary")}</button><button class="sm" id="sSave">💾 ${L("Simpan ke riwayat","Save to history")}</button><button class="sm" id="sNew">${L("Mulai baru","Start over")}</button></div></div></div>
    ${hist.length?`<div class="region"><div class="rh">🗂️ ${L("Riwayat","History")}</div><div class="rb"><div class="tl-list">${hist.slice(0,10).map((h,k)=>`<div class="tl-item"><div class="grow"><b></b><span class="crumb">${fmtD(h.date)} · ${L("dibayar","paid by")} ${esc(h.paid)}</span></div><span class="tl-cd">${rpx(h.total)}</span><button class="sm" data-hdel="${k}" aria-label="${L("Hapus","Delete")}">✕</button></div>`).join("")}</div></div></div>`:""}`;
    // nilai teks lewat .value supaya aman
    $("sTitle").value=s.title;$("sPeople").value=s.people.join(", ");$("sTax").value=s.tax;$("sSvc").value=s.svc;
    [...$("sPaid").options].forEach((o,k)=>o.textContent=s.people[k]);
    v.querySelectorAll("#sItems .tl-item").forEach((row,k)=>{const i=s.items[k];row.querySelector('[data-f="n"]').value=i.n;const a=row.querySelector('[data-f="a"]');a.value=i.a;money(a);
      const sel=row.querySelector("select");[...sel.options].slice(1).forEach((o,j)=>{o.textContent=s.people[j];o.value=s.people[j]});sel.value=s.people.includes(i.who)?i.who:"all"});
    v.querySelectorAll("#sRes .tl-list .tl-item b").forEach((b,k)=>b.textContent=s.people[k]);
    hist.slice(0,10).forEach((h,k)=>{const b=v.querySelectorAll("[data-hdel]")[k]?.closest(".tl-item").querySelector("b");if(b)b.textContent=h.title||L("Patungan","Split")});
    wireBack(v);
    const live=()=>{const r=calc();const vs=v.querySelectorAll(".tl-out .v");vs[0].textContent=rpx(r.sub);vs[1].textContent=rpx(r.fee);vs[2].textContent=rpx(r.total);
      v.querySelectorAll("#sRes .tl-list .tl-cd").forEach((c,k)=>c.textContent=rpx(r.share[s.people[k]]))};
    $("sTitle").oninput=e=>s.title=e.target.value;
    $("sPeople").onchange=e=>{const ps=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);s.people=ps.length?[...new Set(ps)]:["Rafi"];if(!s.people.includes(s.paid))s.paid=s.people[0];draw()};
    $("sTax").oninput=e=>{s.tax=e.target.value;live()};$("sSvc").oninput=e=>{s.svc=e.target.value;live()};$("sPaid").onchange=e=>{s.paid=s.people[e.target.selectedIndex];draw()};
    v.querySelectorAll("#sItems [data-f]").forEach(el=>{const k=+el.dataset.k,f=el.dataset.f;el.addEventListener(el.tagName==="SELECT"?"change":"input",()=>{s.items[k][f]=el.value;live()})});
    v.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{s.items.splice(+b.dataset.rm,1);if(!s.items.length)s.items.push({n:"",a:"",who:"all"});draw()});
    $("sAddI").onclick=()=>{s.items.push({n:"",a:"",who:"all"});draw();const ins=v.querySelectorAll('#sItems [data-f="n"]');ins[ins.length-1]?.focus()};
    $("sNew").onclick=()=>{splitDraft=null;draw2()};
    const summary=()=>{const r=calc();return `🧮 ${s.title||L("Patungan","Split bill")}\n`+s.items.filter(i=>N(i.a)).map(i=>`• ${i.n||"-"} ${rpx(N(i.a))}${i.who!=="all"?" ("+i.who+")":""}`).join("\n")+
      `\n${L("Pajak+service","Tax+service")}: ${rpx(r.fee)}\nTotal: ${rpx(r.total)}\n\n`+s.people.filter(p=>p!==s.paid).map(p=>`${p} → ${s.paid}: ${rpx(r.share[p])}`).join("\n")};
    $("sCopy").onclick=async()=>{const txt=summary();try{await navigator.clipboard.writeText(txt);status(L("Ringkasan disalin. Tempel di WhatsApp.","Summary copied. Paste it into WhatsApp."),"ok")}catch(e){modal(L("Salin ringkasan","Copy summary"),`<div class="tl-pre"></div>`,()=>true,"OK").querySelector(".tl-pre").textContent=txt}};
    $("sSave").onclick=async()=>{const r=calc();if(!r.total){alert(L("Isi minimal 1 item.","Add at least 1 item."));return}
      if(await saveT({splits:[{title:s.title,date:tday(),paid:s.paid,total:r.total,share:r.share},...hist].slice(0,30)}))status(L("Tersimpan di riwayat.","Saved to history."),"ok");splitDraft=null;render()};
    v.querySelectorAll("[data-hdel]").forEach(b=>b.onclick=async()=>{const h=hist.slice();h.splice(+b.dataset.hdel,1);await saveT({splits:h});render()})};
  const draw2=()=>{vSplit(v)};
  draw()}

/* =====================================================================
   3) CELENGAN IMPIAN (+ kalkulator jam kerja)
   ===================================================================== */
function vWish(v){
  const t=T(),w=t.wishes||[],wage=t.wage||{salary:0,hours:173},td=tday();
  const hourly=wage.salary&&wage.hours?wage.salary/wage.hours:0;
  const jam=p=>hourly?(p/hourly):0;
  const jamTxt=p=>{const h=jam(p);if(!h)return "";return h<1?Math.round(h*60)+" "+L("menit kerja","min of work"):h<8*2?h.toFixed(1).replace(".",",")+" "+L("jam kerja","hrs of work"):(h/8).toFixed(1).replace(".",",")+" "+L("hari kerja","workdays")};
  v.innerHTML=page(L("Alat","Tools"),"🐷 "+L("Celengan Impian","Dream Savings"),back+` <button class="pri sm" id="wAdd">+ ${L("Impian","Goal")}</button>`)+
   `<div class="region"><div class="rh"><span>⏱️ ${L("Harga dalam jam kerja","Price in work hours")}</span><button class="sm" id="wWage">${hourly?L("Ubah","Edit"):L("Atur gaji","Set salary")}</button></div><div class="rb">
    ${hourly?`<div class="crumb">${L("1 jam kerjamu ≈ ","1 hour of your work ≈ ")}<b>${rpx(hourly)}</b>. ${L("Coba hitung sebelum checkout:","Check before you check out:")}</div>
    <div class="tl-row" style="margin-top:8px"><input id="wTry" placeholder="${L("Harga barang, mis. 350.000","Price, e.g. 350,000")}" style="max-width:220px"><span class="tl-cd" id="wTryOut"></span></div>`
    :`<div class="crumb">${L("Isi gaji bulanan sekali, lalu setiap harga bisa dilihat sebagai \"berapa jam kerja\". Ampuh buat rem belanja impulsif.","Enter your monthly salary once and every price shows as \"how many hours of work\". Great for curbing impulse buys.")}</div>`}</div></div>
   ${w.length?w.map(x=>{const pct=Math.min(100,x.price?x.saved/x.price*100:0),left=Math.max(0,x.price-x.saved),mo=x.deadline?Math.max(1,Math.ceil(dDiff(td,x.deadline)/30.44)):0;
     return `<div class="region"><div class="rb"><div class="tl-item" style="padding:0;border:0"><span style="font-size:28px">${x.e||"🎯"}</span><div class="grow"><b data-wn="${x.id}"></b><span class="crumb">${rpx(x.saved)} / ${rpx(x.price)}${hourly?" · "+jamTxt(x.price):""}</span></div><span class="tl-cd">${Math.round(pct)}%</span></div>
      <div class="tl-bar"><i style="width:${pct}%"></i></div>
      <div class="crumb" style="margin-top:6px">${pct>=100?"🎉 "+L("Tercapai! Waktunya beli (atau tahan sebulan lagi 😄).","Reached! Time to buy (or hold off a month 😄)."):x.deadline?L("Kurang ","Left ")+rpx(left)+" · "+L("perlu ","need ")+rpx(left/mo)+L("/bulan sampai ","/month until ")+fmtD(x.deadline):L("Kurang ","Left ")+rpx(left)}</div>
      <div class="tl-row" style="margin-top:8px"><button class="sm pri" data-dep="${x.id}">+ ${L("Tabung","Save")}</button><button class="sm" data-wdel="${x.id}">${L("Hapus","Delete")}</button></div></div></div>`}).join("")
   :`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0">${window.pipi?window.pipi("think",64):""}<div class="bubble"><b>${L("Belum ada impian","No goals yet")}</b><div>${L("Tambahkan barang atau rencana (HP baru, liburan berdua, dana darurat) lalu catat setiap kali menabung.","Add something to save for (new phone, a trip together, emergency fund) and log each deposit.")}</div></div></div></div></div>`}
   <p class="crumb">${L("Catatan: celengan ini hanya pelacak target. Uangnya tetap dicatat di Jurnal (mis. transfer ke SeaBank) supaya buku besar tetap benar.","Note: this only tracks goals. Still record the money in the Journal (e.g. transfer to SeaBank) so the ledger stays correct.")}</p>`;
  w.forEach(x=>{const b=v.querySelector(`[data-wn="${x.id}"]`);if(b)b.textContent=x.n});
  wireBack(v);
  const tr=$("wTry");if(tr){money(tr);tr.oninput=()=>{$("wTryOut").textContent=N(tr.value)?"= "+jamTxt(N(tr.value)):""}}
  $("wWage").onclick=()=>{const bg=modal(L("Gaji & jam kerja","Salary & hours"),`<div class="fg"><div class="full"><label>${L("Gaji bersih per bulan","Monthly take-home pay")}</label><input id="wgS"></div><div class="full"><label>${L("Jam kerja per bulan","Work hours per month")}</label><input id="wgH" inputmode="numeric"><div class="crumb">${L("Standar 40 jam/minggu ≈ 173 jam/bulan.","Standard 40 h/week ≈ 173 h/month.")}</div></div></div>`,
    async b=>{await saveT({wage:{salary:N(b.querySelector("#wgS").value),hours:N(b.querySelector("#wgH").value)||173}});render()},L("Simpan","Save"));
    const s=bg.querySelector("#wgS");s.value=wage.salary?wage.salary.toLocaleString("id-ID"):"";money(s);bg.querySelector("#wgH").value=wage.hours||173};
  $("wAdd").onclick=()=>{const bg=modal(L("Impian baru","New goal"),`<div class="fg"><div class="full"><label>${L("Nama","Name")}</label><input id="wN" placeholder="${L("mis. Liburan ke Bali berdua","e.g. Bali trip together")}"></div>
    <div><label>${L("Target","Target")}</label><input id="wP"></div><div><label>${L("Sudah terkumpul","Already saved")}</label><input id="wS" value="0"></div>
    <div><label>${L("Target tanggal (opsional)","Target date (optional)")}</label><input type="date" id="wD" min="${td}"></div><div><label>${L("Ikon","Icon")}</label><select id="wE">${["🎯","📱","💻","✈️","🏍️","🏠","🐄","💍","🎓","🛟"].map(e=>`<option>${e}</option>`).join("")}</select></div></div>`,
    async b=>{const n=b.querySelector("#wN").value.trim(),p=N(b.querySelector("#wP").value);if(!n||!p){alert(L("Isi nama dan target.","Fill in name and target."));return false}
      await saveT({wishes:[...w,{id:uid(),n,price:p,saved:N(b.querySelector("#wS").value),deadline:b.querySelector("#wD").value||null,e:b.querySelector("#wE").value}]});render()},L("Simpan","Save"));
    money(bg.querySelector("#wP"));money(bg.querySelector("#wS"))};
  v.querySelectorAll("[data-dep]").forEach(b=>b.onclick=()=>{const x=w.find(i=>i.id===b.dataset.dep);const bg=modal(L("Tabung untuk ","Save for ")+x.n,`<label>${L("Jumlah (minus untuk ambil)","Amount (negative to withdraw)")}</label><input id="dA" placeholder="100.000">`,
    async g=>{const raw=g.querySelector("#dA").value.trim(),neg=raw.startsWith("-"),a=N(raw.replace("-",""))*(neg?-1:1);if(!a)return false;
      const prev=x.saved;await saveT({wishes:w.map(i=>i.id===x.id?{...i,saved:Math.max(0,i.saved+a)}:i)});
      if(prev<x.price&&prev+a>=x.price&&window.doPeek)window.doPeek(true,{t:"🎉 "+L("Impian tercapai!","Goal reached!"),d:x.n,m:"party",w:6});render()},L("Simpan","Save"))});
  v.querySelectorAll("[data-wdel]").forEach(b=>b.onclick=async()=>{const x=w.find(i=>i.id===b.dataset.wdel);if(!confirmInline(b))return;await saveT({wishes:w.filter(i=>i.id!==x.id)});render()})}
function confirmInline(b){if(b.dataset.sure)return true;b.dataset.sure="1";const o=b.textContent;b.textContent=L("Yakin? Ketuk lagi","Sure? Tap again");setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent=o}},2500);return false}

/* =====================================================================
   4) KEBIASAAN (habit tracker)
   ===================================================================== */
function vHabit(v){
  const t=T(),hs=t.habits||[],log=t.hlog||{},td=tday();
  const week=[...Array(7)].map((_,i)=>addDays(td,i-6));
  const dn=s=>D(s).toLocaleDateString(EN()?"en-GB":"id-ID",{weekday:"narrow"});
  const streak=id=>{let n=0,d=td;if(!(log[d]||[]).includes(id))d=addDays(d,-1);while((log[d]||[]).includes(id)){n++;d=addDays(d,-1)}return n};
  const doneToday=hs.filter(h=>(log[td]||[]).includes(h.id)).length;
  v.innerHTML=page(L("Alat","Tools"),"✅ "+L("Kebiasaan","Habits"),back+` <button class="pri sm" id="hAdd">+ ${L("Kebiasaan","Habit")}</button>`)+
   (hs.length?`<div class="tiles"><div class="tile"><div class="k">${L("Hari ini","Today")}</div><div class="v">${doneToday}/${hs.length}</div><div class="s">${doneToday===hs.length?L("Semua beres! 🎉","All done! 🎉"):L("ketuk kotak hari ini","tap today's box")}</div></div></div>`+
   hs.map(h=>`<div class="region"><div class="rb"><div class="tl-item" style="padding:0;border:0"><span style="font-size:24px">${h.e||"✅"}</span><div class="grow"><b data-hn="${h.id}"></b><span class="crumb">🔥 ${streak(h.id)} ${L("hari beruntun","day streak")}</span></div><button class="sm" data-hdel="${h.id}">${L("Hapus","Delete")}</button></div>
    <div class="tl-week">${week.map(d=>`<button class="tl-day${(log[d]||[]).includes(h.id)?" on":""}${d===td?" td":""}" data-h="${h.id}" data-d="${d}" aria-label="${fmtD(d)}" aria-pressed="${(log[d]||[]).includes(h.id)}">${dn(d)}</button>`).join("")}</div></div></div>`).join("")
   :`<div class="region"><div class="rb"><div class="pipi-card" style="margin:0">${window.pipi?window.pipi("happy",64):""}<div class="bubble"><b>${L("Mulai kebiasaan kecil","Start a small habit")}</b><div>${L("Contoh: minum 8 gelas, olahraga 20 menit, baca 10 halaman, tidak jajan kopi.","For example: drink 8 glasses, exercise 20 min, read 10 pages, skip the coffee run.")}</div><div class="tl-row" style="margin-top:8px">${[["💧",L("Minum 8 gelas","Drink 8 glasses")],["🏃",L("Olahraga 20 menit","Exercise 20 min")],["📖",L("Baca 10 halaman","Read 10 pages")],["☕",L("Tidak jajan kopi","No coffee run")]].map(([e,n])=>`<button class="sm" data-qh="${e}|${n}">${e} ${n}</button>`).join("")}</div></div></div></div></div>`);
  hs.forEach(h=>{const b=v.querySelector(`[data-hn="${h.id}"]`);if(b)b.textContent=h.n});
  wireBack(v);
  const addH=async(e,n)=>{await saveT({habits:[...hs,{id:uid(),n,e}]});render()};
  v.querySelectorAll("[data-qh]").forEach(b=>b.onclick=()=>{const [e,n]=b.dataset.qh.split("|");addH(e,n)});
  $("hAdd").onclick=()=>modal(L("Kebiasaan baru","New habit"),`<div class="fg"><div class="full"><label>${L("Nama","Name")}</label><input id="hN"></div><div><label>${L("Ikon","Icon")}</label><select id="hE">${["✅","💧","🏃","📖","🧘","🛏️","🥗","☕","🙏","💪"].map(e=>`<option>${e}</option>`).join("")}</select></div></div>`,
    async b=>{const n=b.querySelector("#hN").value.trim();if(!n)return false;await addH(b.querySelector("#hE").value,n)},L("Simpan","Save"));
  v.querySelectorAll("[data-h]").forEach(b=>b.onclick=async()=>{const d=b.dataset.d,id=b.dataset.h,cur=new Set(log[d]||[]);cur.has(id)?cur.delete(id):cur.add(id);
    const nl={...log,[d]:[...cur]};Object.keys(nl).sort().slice(0,-60).forEach(k=>delete nl[k]);b.classList.toggle("on");await saveT({hlog:nl});render()});
  v.querySelectorAll("[data-hdel]").forEach(b=>b.onclick=async()=>{if(!confirmInline(b))return;await saveT({habits:hs.filter(h=>h.id!==b.dataset.hdel)});render()})}

/* =====================================================================
   5) RODA PILIHAN
   ===================================================================== */
const PRESETS=()=>[{n:L("Makan di mana?","Where to eat?"),o:["Nasi Padang","Bakso","Sushi","Ayam geprek","Mie ayam","Masak sendiri"]},
 {n:L("Siapa yang traktir?","Who's treating?"),o:["Rafi","Vina",L("Patungan","Split it")]},
 {n:L("Weekend ngapain?","Weekend plan?"),o:[L("Nonton","Movie"),L("Jalan ke mal","Mall"),L("Rebahan","Stay in"),L("Renang","Swim"),L("Kulineran","Food trip"),L("Main game","Games")]}];
let wheelSel=0,wheelRot=0;
function vWheel(v){
  const t=T(),custom=t.wheels||[],all=[...PRESETS(),...custom];if(wheelSel>=all.length)wheelSel=0;const cur=all[wheelSel];
  v.innerHTML=page(L("Alat","Tools"),"🎡 "+L("Roda Pilihan","Decision Wheel"),back)+
   `<div class="region"><div class="rb"><div class="tl-tabs">${all.map((w,i)=>`<button class="sm${i===wheelSel?" pri":""}" data-ws="${i}"></button>`).join("")}<button class="sm" id="wNew">+ ${L("Roda baru","New wheel")}</button></div>
    <div class="tl-wheel"><div class="wrap"><canvas id="wCv" width="640" height="640" aria-label="${L("Roda pilihan","Decision wheel")}"></canvas><span class="pin">🔻</span></div>
    <div class="tl-res" id="wRes" aria-live="polite"></div><button class="pri" id="wSpin" style="min-width:160px;min-height:44px">🎲 ${L("Putar!","Spin!")}</button>
    ${wheelSel>=PRESETS().length?`<button class="sm" id="wDel">${L("Hapus roda ini","Delete this wheel")}</button>`:""}</div></div></div>`;
  v.querySelectorAll("[data-ws]").forEach((b,i)=>{b.textContent=all[i].n;b.onclick=()=>{wheelSel=i;wheelRot=0;vWheel(v)}});
  wireBack(v);
  const cv=$("wCv"),ctx=cv.getContext("2d"),opts=cur.o,n=opts.length,R=300,cx=320,cy=320;
  const cols=["#ff6fa8","#7c4dff","#ffb703","#2fa463","#3f85e0","#f47c2c","#c25a78","#2a9d8f"];
  const drawW=rot=>{ctx.clearRect(0,0,640,640);for(let i=0;i<n;i++){const a0=rot+i*2*Math.PI/n,a1=a0+2*Math.PI/n;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a0,a1);ctx.closePath();ctx.fillStyle=cols[i%cols.length];ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=4;ctx.stroke();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a0+Math.PI/n);ctx.textAlign="right";ctx.textBaseline="middle";ctx.fillStyle="#fff";ctx.font="800 30px Nunito,system-ui,sans-serif";const s=opts[i].length>14?opts[i].slice(0,13)+"…":opts[i];ctx.fillText(s,R-22,0);ctx.restore()}
    ctx.beginPath();ctx.arc(cx,cy,40,0,2*Math.PI);ctx.fillStyle="#fff";ctx.fill();ctx.font="34px system-ui";ctx.textAlign="center";ctx.fillText("💑",cx,cy+2)};
  drawW(wheelRot);
  $("wSpin").onclick=()=>{const btn=$("wSpin");btn.disabled=true;$("wRes").textContent="";
    const pick=Math.floor(Math.random()*n),slice=2*Math.PI/n,target=-Math.PI/2-(pick+.5)*slice;
    let end=target;while(end<wheelRot+8*Math.PI)end+=2*Math.PI;const start=wheelRot,t0=performance.now(),dur=matchMedia("(prefers-reduced-motion:reduce)").matches?10:3200;
    const step=now=>{if(!cv.isConnected)return;const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,4);wheelRot=start+(end-start)*e;drawW(wheelRot);
      if(k<1)requestAnimationFrame(step);else{wheelRot%=2*Math.PI;$("wRes").textContent="👉 "+opts[pick];btn.disabled=false}};requestAnimationFrame(step)};
  $("wNew").onclick=()=>modal(L("Roda baru","New wheel"),`<label>${L("Pertanyaan","Question")}</label><input id="wnN" placeholder="${L("mis. Nonton film apa?","e.g. Which movie?")}"><div style="height:8px"></div><label>${L("Pilihan (satu per baris)","Options (one per line)")}</label><textarea id="wnO" rows="6"></textarea>`,
    async b=>{const nm=b.querySelector("#wnN").value.trim(),o=b.querySelector("#wnO").value.split("\n").map(x=>x.trim()).filter(Boolean);if(!nm||o.length<2){alert(L("Isi pertanyaan dan minimal 2 pilihan.","Add a question and at least 2 options."));return false}
      await saveT({wheels:[...custom,{n:nm,o:o.slice(0,12)}]});wheelSel=PRESETS().length+custom.length;render()},L("Simpan","Save"));
  const del=$("wDel");if(del)del.onclick=async()=>{if(!confirmInline(del))return;const c=custom.slice();c.splice(wheelSel-PRESETS().length,1);wheelSel=0;await saveT({wheels:c});render()}}

/* =====================================================================
   6) KALKULATOR (cicilan · bunga majemuk · diskon)
   ===================================================================== */
let calcTab="loan";
function vCalc(v){
  const tabs=[["loan","🏦 "+L("Cicilan","Loan")],["grow","📈 "+L("Investasi","Investing")],["disc","🏷️ "+L("Diskon","Discount")]];
  const F={loan:[["P",L("Pinjaman / harga","Loan / price"),"5.000.000",1],["r",L("Bunga % per tahun","Interest % per year"),"12"],["n",L("Tenor (bulan)","Term (months)"),"12"],["m",L("Jenis bunga","Interest type"),"flat"]],
    grow:[["P",L("Modal awal","Starting amount"),"1.000.000",1],["c",L("Setoran per bulan","Monthly deposit"),"500.000",1],["r",L("Imbal hasil % per tahun","Return % per year"),"6"],["y",L("Lama (tahun)","Years"),"5"]],
    disc:[["P",L("Harga awal","Original price"),"250.000",1],["d1",L("Diskon %","Discount %"),"50"],["d2",L("Diskon tambahan %","Extra discount %"),"20"],["x",L("Potongan Rp (voucher)","Voucher Rp"),"0",1]]}[calcTab];
  v.innerHTML=page(L("Alat","Tools"),"🧮 "+L("Kalkulator","Calculator"),back)+
   `<div class="region"><div class="rb"><div class="tl-tabs">${tabs.map(([k,n])=>`<button class="sm${k===calcTab?" pri":""}" data-ct="${k}">${n}</button>`).join("")}</div>
    <div class="fg">${F.map(([k,lab,ph,isMoney])=>k==="m"?`<div><label>${lab}</label><select id="c_${k}"><option value="flat">Flat (PayLater, leasing)</option><option value="eff">${L("Efektif / anuitas (KPR, KTA)","Effective / annuity (mortgage)")}</option></select></div>`:`<div><label>${lab}</label><input id="c_${k}" placeholder="${ph}" ${isMoney?"":'inputmode="decimal"'}></div>`).join("")}</div>
    <div class="tl-out" id="cOut" style="margin-top:12px"></div><p class="crumb" id="cNote" style="margin:8px 0 0"></p></div></div>`;
  wireBack(v);
  v.querySelectorAll("[data-ct]").forEach(b=>b.onclick=()=>{calcTab=b.dataset.ct;vCalc(v)});
  F.forEach(([k,,ph,isMoney])=>{const el=$("c_"+k);if(el.tagName==="INPUT"){el.value=ph;if(isMoney)money(el)}el.addEventListener("input",calc);el.addEventListener("change",calc)});
  function out(rows,note){$("cOut").innerHTML=rows.map(([k,v])=>`<div><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");$("cNote").textContent=note||""}
  function calc(){const g=k=>{const fd=F.find(x=>x[0]===k),val=$("c_"+k)?.value;return fd&&fd[3]?N(val):N2(val)};
    if(calcTab==="loan"){const P=g("P"),r=g("r")/100,n=Math.max(1,Math.round(g("n"))),flat=$("c_m").value==="flat";let pay,tot;
      if(flat){tot=P+P*r*n/12;pay=tot/n}else{const i=r/12;pay=i?P*i/(1-Math.pow(1+i,-n)):P/n;tot=pay*n}
      const effEq=flat&&r?(()=>{let lo=0,hi=2;for(let k=0;k<60;k++){const mid=(lo+hi)/2,i=mid/12,p=P*i/(1-Math.pow(1+i,-n));p>pay?hi=mid:lo=mid}return lo})():null;
      out([[L("Cicilan / bulan","Monthly payment"),rpx(pay)],[L("Total bayar","Total paid"),rpx(tot)],[L("Total bunga","Total interest"),rpx(tot-P)]],
        flat&&effEq?L(`Bunga flat ${(r*100).toLocaleString("id-ID")}% setara bunga efektif ±${(effEq*100).toFixed(1).replace(".",",")}% per tahun. Flat terlihat kecil, padahal lebih mahal.`,`A ${(r*100)}% flat rate equals about ${(effEq*100).toFixed(1)}% effective per year. Flat looks cheaper than it is.`):"")}
    else if(calcTab==="grow"){const P=g("P"),c=g("c"),i=g("r")/100/12,n=Math.round(g("y")*12);let bal=P;for(let k=0;k<n;k++)bal=bal*(1+i)+c;const put=P+c*n;
      out([[L("Nilai akhir","Final value"),rpx(bal)],[L("Total setoran","Total deposited"),rpx(put)],[L("Hasil investasi","Investment gain"),rpx(bal-put)]],L("Asumsi imbal hasil tetap dan dibunga-majemukkan bulanan. Hasil nyata bisa naik turun.","Assumes a fixed return compounded monthly. Real returns fluctuate."))}
    else{const P=g("P"),a=P*(1-g("d1")/100),b=a*(1-g("d2")/100),fin=Math.max(0,b-g("x"));
      out([[L("Harga akhir","Final price"),rpx(fin)],[L("Hemat","You save"),rpx(P-fin)],[L("Diskon sebenarnya","Real discount"),(P?((P-fin)/P*100):0).toFixed(1).replace(".",",")+"%"]],
        g("d2")?L(`Diskon ${g("d1")}% + ${g("d2")}% bukan ${g("d1")+g("d2")}%, karena diskon kedua dihitung dari harga yang sudah dipotong.`,`${g("d1")}% + ${g("d2")}% off is not ${g("d1")+g("d2")}%, because the second discount applies to the reduced price.`):"")}}
  calc()}

/* =====================================================================
   HUB + MENU
   ===================================================================== */
const TOOLS=[["t_moment","💑",()=>L("Momen Kita","Our Moments"),()=>L("Hari bersama, anniversary, ulang tahun.","Days together, anniversaries, birthdays."),()=>{const m=T().moment;return m&&m.start?dDiff(m.start,tday()).toLocaleString("id-ID")+" "+L("hari bersama","days together"):""}],
 ["t_split","🧮",()=>L("Patungan","Split Bill"),()=>L("Bagi tagihan nongkrong, salin ringkasan ke WhatsApp.","Split the bill and copy the summary to WhatsApp."),()=>""],
 ["t_wish","🐷",()=>L("Celengan Impian","Dream Savings"),()=>L("Target tabungan + harga dalam jam kerja.","Savings goals + prices in work hours."),()=>{const w=T().wishes||[];return w.length?w.length+" "+L("impian","goals"):""}],
 ["t_habit","✅",()=>L("Kebiasaan","Habits"),()=>L("Centang kebiasaan harian, jaga streak.","Tick daily habits, keep the streak."),()=>{const h=T().habits||[],l=(T().hlog||{})[tday()]||[];return h.length?h.filter(x=>l.includes(x.id)).length+"/"+h.length+" "+L("hari ini","today"):""}],
 ["t_wheel","🎡",()=>L("Roda Pilihan","Decision Wheel"),()=>L("Bingung makan di mana? Putar saja.","Can't decide where to eat? Spin it."),()=>""],
 ["t_calc","🏦",()=>L("Kalkulator","Calculator"),()=>L("Cicilan flat vs efektif, investasi, diskon bertingkat.","Flat vs effective loans, investing, stacked discounts."),()=>""]];
function vTools(v){
  v.innerHTML=page(L("Alat","Tools"),"🧰 "+L("Alat Serba Guna","All-in-one Tools"))+
   `<div class="tl-hub">${TOOLS.map(([r,e,n,d,pk])=>`<button class="tl-card" data-r2="${r}"><span class="ic">${e}</span><span><b>${n()}</b><span class="crumb">${d()}</span>${pk()?`<span class="peek">${pk()}</span>`:""}</span></button>`).join("")}</div>`;
  v.querySelectorAll("[data-r2]").forEach(b=>b.onclick=()=>go(b.dataset.r2))}

const VIEWS={tools:vTools,t_moment:vMoment,t_split:vSplit,t_wish:vWish,t_habit:vHabit,t_wheel:vWheel,t_calc:vCalc};
const safe=f=>v=>{try{f(v)}catch(e){console.error(e);v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}};
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},Object.fromEntries(Object.entries(VIEWS).map(([k,f])=>[k,safe(f)])));
NAV.push(["Alat",[["tools","Semua Alat"],["t_moment","Momen Kita"],["t_split","Patungan"],["t_wish","Celengan Impian"],["t_habit","Kebiasaan"],["t_wheel","Roda Pilihan"],["t_calc","Kalkulator"]]]);
window.TOOL_ROUTES=new Set(Object.keys(VIEWS));

/* jangan render ulang saat sedang mengetik di form alat (data baru akan tampil setelah selesai) */
if(typeof render==="function"){const _r=render;render=function(){const a=document.activeElement;
  if(window.TOOL_ROUTES.has(route)&&a&&a.matches&&a.matches("input,textarea,select")&&document.getElementById("view")?.contains(a)&&!render._force)return;return _r.apply(this,arguments)}}
const _go=go;go=function(r){try{if(typeof status==="function")status("")}catch(e){}const a=document.activeElement;if(a&&a.blur)a.blur();return _go(r)};
})();
