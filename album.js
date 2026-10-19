/* =====================================================================
   ALBUM KITA (di dalam "Momen Kita")
   Foto dikompres di HP lalu disimpan di Supabase Storage (bucket privat "album").
   Daftar foto + keterangan disimpan di dokumen "tools" (field album).
   Setup sekali: jalankan supabase/album-storage.sql di SQL Editor Supabase.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const tday=()=>typeof today==="function"?today():new Date().toISOString().slice(0,10);
const D=s=>new Date(s+"T00:00:00");
const fmtD=s=>D(s).toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"long",year:"numeric"});
const T=()=>window.TOOLS||{};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
async function saveT(patch){if(!col)return false;const t={...JSON.parse(JSON.stringify(T())),...patch};window.TOOLS=t;
  try{await col.doc("tools").set(t);return true}catch(e){alert(L("Gagal menyimpan: ","Save failed: ")+e.message);return false}}
const BUCKET="album";
const store=()=>(typeof sb!=="undefined"&&sb&&sb.storage)?sb.storage.from(BUCKET):null;
let me=null;async function myId(){if(me)return me;try{const {data}=await sb.auth.getSession();me=data.session.user.id}catch(e){}return me}

/* ---------- URL foto (signed, dicache 50 menit) ---------- */
const urls={};
async function urlsFor(paths){const need=paths.filter(p=>!urls[p]||urls[p].exp<Date.now());
  if(need.length&&store()){const {data,error}=await store().createSignedUrls(need,3600);
    if(!error&&data)data.forEach(d=>{if(d.signedUrl)urls[d.path]={u:d.signedUrl,exp:Date.now()+50*60e3}})}
  return Object.fromEntries(paths.map(p=>[p,urls[p]?.u||""]))}

/* ---------- kompres foto ---------- */
function loadImg(file){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{ok(i);setTimeout(()=>URL.revokeObjectURL(u),1000)};i.onerror=()=>no(new Error(L("Format foto tidak didukung.","Unsupported photo format.")));i.src=u})}
async function compress(file,max=1600){const img=await loadImg(file);const s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
  const w=Math.round(img.naturalWidth*s),h=Math.round(img.naturalHeight*s),c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
  const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.82));return {blob,w,h}}

const css=document.createElement("style");css.textContent=`
.al-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:6px}
.al-ph{all:unset;cursor:pointer;position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:var(--th)}
.al-ph img{width:100%;height:100%;object-fit:cover;display:block}.al-ph:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.al-ph .cap{position:absolute;left:0;right:0;bottom:0;padding:14px 6px 4px;font-size:10.5px;font-weight:700;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.55));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.al-add{all:unset;cursor:pointer;aspect-ratio:1;border-radius:12px;border:2px dashed var(--acc);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:var(--acc);font-weight:800;font-size:12px}
.al-add span{font-size:26px}.al-add:focus-visible{outline:3px solid var(--acc)}
.al-view img{width:100%;max-height:60vh;object-fit:contain;border-radius:12px;background:var(--th);display:block}
.al-prog{height:6px;background:var(--th);border-radius:99px;overflow:hidden;margin-top:8px}.al-prog i{display:block;height:100%;background:var(--acc);transition:width .2s}
#albumPrint{display:none}
@media print{
 body.al-printing>*:not(#albumPrint){display:none!important}
 body.al-printing #albumPrint{display:block!important}
 @page{size:A4;margin:14mm}
 #albumPrint{font-family:Nunito,system-ui,sans-serif;color:#2d2340}
 #albumPrint .pg{page-break-after:always;break-after:page;display:flex;flex-direction:column;gap:10mm}
 #albumPrint .pg:last-child{page-break-after:auto;break-after:auto}
 #albumPrint .cover{height:250mm;align-items:center;justify-content:center;text-align:center}
 #albumPrint .cover img{width:70mm;height:70mm;border-radius:16mm}
 #albumPrint .cover h1{font-size:30pt;margin:6mm 0 2mm}#albumPrint .cover p{font-size:13pt;margin:0;color:#6d5f86}
 #albumPrint figure{margin:0;flex:1;display:flex;flex-direction:column;gap:3mm;break-inside:avoid}
 #albumPrint figure img{width:100%;height:105mm;object-fit:contain;background:#f6f0f6;border-radius:4mm}
 #albumPrint figcaption{font-size:12pt}#albumPrint figcaption b{display:block}#albumPrint figcaption span{color:#6d5f86;font-size:10pt}
}`;document.head.appendChild(css);

/* ---------- petunjuk setup bila bucket belum dibuat ---------- */
const SQL_HINT=()=>L("Album foto butuh setup sekali di Supabase: buka SQL Editor, tempel isi file supabase/album-storage.sql dari GitHub, lalu Run. Setelah itu coba upload lagi.","The photo album needs a one-time Supabase setup: open the SQL Editor, paste supabase/album-storage.sql from GitHub, then Run. Then try uploading again.");
function isSetupErr(e){const m=String(e&&(e.message||e.error||e.statusCode)||"");return /bucket not found|not found|404|row-level security|policy|unauthorized|403/i.test(m)}

/* ---------- upload ---------- */
async function upload(files,onProg){const id=await myId();if(!id||!store())throw new Error(L("Belum login.","Not signed in."));
  const added=[];let k=0;
  for(const f of files){k++;onProg(k,files.length);
    const {blob,w,h}=await compress(f);const pid=uid(),path=id+"/"+pid+".jpg";
    const {error}=await store().upload(path,blob,{contentType:"image/jpeg",upsert:false});if(error)throw error;
    const dt=f.lastModified?new Date(f.lastModified):new Date();const ds=dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
    added.push({id:pid,path,cap:"",date:ds>tday()?tday():ds,w,h,added:tday()})}
  await saveT({album:[...(T().album||[]),...added]});return added.length}

/* ---------- tampilan di halaman Momen Kita ---------- */
async function drawAlbum(v){
  const box=document.createElement("div");box.className="region";box.id="alBox";
  const al=(T().album||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  box.innerHTML=`<div class="rh"><span>📸 ${L("Album Kita","Our Album")} <span class="crumb">(${al.length})</span></span><span class="tl-row"><button class="sm" id="alPdf"${al.length?"":" disabled"}>📄 ${L("Simpan PDF","Save PDF")}</button></span></div>
   <div class="rb"><div class="al-grid"><button class="al-add" id="alAdd"><span>＋</span>${L("Tambah foto","Add photos")}</button>${al.map(p=>`<button class="al-ph" data-p="${p.id}" aria-label="${L("Buka foto","Open photo")}"><img alt="" loading="lazy"><span class="cap"></span></button>`).join("")}</div>
   <input type="file" id="alFile" accept="image/*" multiple hidden>
   <div id="alMsg"></div>
   <p class="crumb" style="margin:8px 0 0">${L("Foto dikecilkan otomatis (maks. 1600 px) supaya hemat kuota. Hanya akun ini yang bisa melihatnya.","Photos are resized automatically (max 1600 px) to save space. Only this account can see them.")}</p></div>`;
  const regions=v.querySelectorAll(".region");(regions[1]||regions[0])?regions[0].after(box):v.appendChild(box);
  al.forEach(p=>{const b=box.querySelector(`[data-p="${p.id}"]`);b.querySelector(".cap").textContent=p.cap||fmtD(p.date)});
  const msg=(h,cls)=>{box.querySelector("#alMsg").innerHTML=h?`<div class="msg ${cls||""}" style="margin:10px 0 0">${h}</div>`:""};
  const fi=box.querySelector("#alFile");
  box.querySelector("#alAdd").onclick=()=>fi.click();
  fi.onchange=async()=>{const files=[...fi.files].slice(0,20);fi.value="";if(!files.length)return;
    msg(`${L("Mengunggah","Uploading")} <b id="alN">0/${files.length}</b>…<div class="al-prog"><i id="alBar" style="width:0"></i></div>`);
    try{const n=await upload(files,(k,t)=>{const a=document.getElementById("alN"),b=document.getElementById("alBar");if(a)a.textContent=k+"/"+t;if(b)b.style.width=(k/t*100)+"%"});
      status(n+" "+L("foto ditambahkan ke album 📸","photo(s) added to the album 📸"),"ok");render()}
    catch(e){console.error(e);msg(isSetupErr(e)?"⚙️ "+SQL_HINT():"⚠️ "+esc(e.message||String(e)),"warn")}};
  box.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>viewer(b.dataset.p));
  box.querySelector("#alPdf").onclick=()=>exportPdf();
  if(al.length){const u=await urlsFor(al.map(p=>p.path));al.forEach(p=>{const im=box.querySelector(`[data-p="${p.id}"] img`);if(im&&u[p.path])im.src=u[p.path]})}}

async function viewer(id){const al=T().album||[],p=al.find(x=>x.id===id);if(!p)return;const u=(await urlsFor([p.path]))[p.path];
  const bg=modal(L("Foto","Photo"),`<div class="al-view"><img alt=""></div><div class="fg" style="margin-top:10px"><div class="full"><label>${L("Keterangan","Caption")}</label><input id="alC" maxlength="120" placeholder="${L("mis. Kencan pertama di kafe","e.g. First date at the café")}"></div><div><label>${L("Tanggal","Date")}</label><input type="date" id="alD" max="${tday()}"></div><div style="display:flex;align-items:flex-end"><button class="sm" id="alDel" type="button" style="color:var(--red)">🗑 ${L("Hapus foto","Delete photo")}</button></div></div>`,
    async g=>{const cap=g.querySelector("#alC").value.trim(),date=g.querySelector("#alD").value||p.date;await saveT({album:(T().album||[]).map(x=>x.id===id?{...x,cap,date}:x)});render()},L("Simpan","Save"));
  const im=bg.querySelector(".al-view img");im.src=u;im.alt=p.cap||"";bg.querySelector("#alC").value=p.cap||"";bg.querySelector("#alD").value=p.date;
  const del=bg.querySelector("#alDel");del.onclick=async()=>{if(!del.dataset.sure){del.dataset.sure="1";del.textContent=L("Yakin? Ketuk lagi","Sure? Tap again");return}
    try{if(store())await store().remove([p.path])}catch(e){}await saveT({album:(T().album||[]).filter(x=>x.id!==id)});bg.remove();render()}}

/* ---------- PDF: halaman cetak khusus → "Simpan sebagai PDF" ---------- */
async function exportPdf(){const al=(T().album||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));if(!al.length)return;
  status(L("Menyiapkan album… tunggu foto selesai dimuat.","Preparing the album… waiting for photos to load."),"");
  const u=await urlsFor(al.map(p=>p.path)),m=T().moment||{},days=m.start?Math.round((D(tday())-D(m.start))/864e5):null;
  let el=document.getElementById("albumPrint");if(!el){el=document.createElement("div");el.id="albumPrint";document.body.appendChild(el)}
  const pages=[];for(let i=0;i<al.length;i+=2)pages.push(al.slice(i,i+2));
  el.innerHTML=`<section class="pg cover"><img src="icon.svg" alt=""><h1>${L("Album Kita","Our Album")}</h1><p>Rafi &amp; Vina</p>${m.start?`<p>${L("Bersama sejak ","Together since ")}${fmtD(m.start)} · ${days.toLocaleString("id-ID")} ${L("hari","days")}</p>`:""}<p>${al.length} ${L("foto","photos")} · ${fmtD(al[0].date)} – ${fmtD(al[al.length-1].date)}</p></section>`+
   pages.map(pg=>`<section class="pg">${pg.map(p=>`<figure><img alt=""><figcaption><b></b><span>${fmtD(p.date)}</span></figcaption></figure>`).join("")}</section>`).join("");
  const figs=el.querySelectorAll("figure");al.forEach((p,i)=>{figs[i].querySelector("img").src=u[p.path];figs[i].querySelector("b").textContent=p.cap||""});
  await Promise.all([...el.querySelectorAll("img")].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,15000)})));
  status("");document.body.classList.add("al-printing");
  const done=()=>{document.body.classList.remove("al-printing");removeEventListener("afterprint",done)};addEventListener("afterprint",done);
  setTimeout(()=>{try{window.print()}catch(e){done();alert(L("Browser ini tidak bisa mencetak. Coba buka di Chrome.","This browser can't print. Try Chrome."))}setTimeout(done,60000)},200)}

/* ---------- pasang ke halaman Momen Kita ---------- */
const orig=window.EXTRA_VIEWS&&window.EXTRA_VIEWS.t_moment;
if(orig)window.EXTRA_VIEWS.t_moment=v=>{orig(v);if((T().moment||{}).start)drawAlbum(v).catch(e=>console.error(e))};
})();
