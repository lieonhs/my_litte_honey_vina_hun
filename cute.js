/* =====================================================================
   OPSI TAMPILAN + "LUCU PENUH" UNTUK SEMUA HALAMAN
   Hanya file tampilan (GitHub). Pilihan disimpan di dokumen "prefs" yang
   sudah ada (tabel docs yang sama) + localStorage, jadi Supabase tidak berubah.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const DEF={lvl:"full",dark:"auto",bg:"dots",shape:"round",font:"nunito",size:"m",buddy:1,icons:1,floaty:1,anim:1,yay:1};
const lkKey=()=>"bbp_look_"+((document.getElementById("who")?.textContent||"").split(" ")[0]||"x");
let LOOK=(()=>{try{return {...DEF,...JSON.parse(localStorage.getItem("bbp_look")||"{}")}}catch(e){return {...DEF}}})();
const isFun=()=>document.documentElement.classList.contains("fun");
const full=()=>isFun()&&LOOK.lvl==="full";

/* ---------- pola latar (mask SVG, warnanya ikut tema) ---------- */
const svg=s=>`url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' "+s+"</svg>")}")`;
const PAT={
 dots:svg("width='26' height='26'><circle cx='5' cy='5' r='2.2'/><circle cx='18' cy='18' r='1.4'/>"),
 hearts:svg("width='44' height='44'><path d='M12 20c-4-3-7-5-7-8.5A3.5 3.5 0 0 1 12 9a3.5 3.5 0 0 1 7 2.5c0 3.5-3 5.5-7 8.5z'/><path d='M33 40c-2.5-2-4.5-3.2-4.5-5.4a2.2 2.2 0 0 1 4.5-1.4a2.2 2.2 0 0 1 4.5 1.4c0 2.2-2 3.4-4.5 5.4z'/>"),
 stars:svg("width='48' height='48'><path d='M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z'/><path d='M36 30l1.4 3 3.2.3-2.4 2.2.7 3.2L36 37l-2.9 1.7.7-3.2-2.4-2.2 3.2-.3z'/>"),
 clouds:svg("width='90' height='70'><path d='M18 30a8 8 0 0 1 15-4a6 6 0 0 1 9 5a5 5 0 0 1-1 10H19a6 6 0 0 1-1-11z'/><path d='M62 58a5 5 0 0 1 9-2.5a4 4 0 0 1 6 3.4a3 3 0 0 1-.6 6H63a4 4 0 0 1-1-6.9z'/>"),
 grid:svg("width='28' height='28'><path d='M0 0h28v1.2H0zM0 0h1.2v28H0z'/>")};

const FONTS={nunito:["Nunito","Nunito:wght@400;600;700;800"],fredoka:["Fredoka","Fredoka:wght@400;500;600;700"],baloo:["'Baloo 2'","Baloo+2:wght@400;500;600;700;800"],system:["system-ui",null]};
const loadedFonts=new Set(["nunito"]);
function loadFont(k){const f=FONTS[k];if(!f||!f[1]||loadedFonts.has(k))return;loadedFonts.add(k);
  const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+f[1]+"&display=swap";document.head.appendChild(l)}

/* ---------- ikon menu ---------- */
const ICON={dash:"🏠",input:"📸",journal:"📒",gl:"🔍",tb:"⚖️",recon:"🏦",budget:"🎯",fs:"📊",coa:"🗂️",period:"🔒",
 today:"☀️",sched:"📅",diary:"✍️",notes:"📝",guide:"📖",look:"🎨",quest:"🏆",album:"🌟"};

const css=document.createElement("style");css.id="cuteCss";css.textContent=`
/* --- dasar yang berlaku di mode lucu, terserah tingkatnya --- */
html.fun[data-shape=square] .region,html.fun[data-shape=square] .tile,html.fun[data-shape=square] .sheet,html.fun[data-shape=square] .pipi-card{border-radius:6px}
html.fun[data-shape=square] button,html.fun[data-shape=square] .btn,html.fun[data-shape=square] input,html.fun[data-shape=square] select{border-radius:6px}
html.fun[data-shape=bubble] .region,html.fun[data-shape=bubble] .tile,html.fun[data-shape=bubble] .sheet,html.fun[data-shape=bubble] .pipi-card,html.fun[data-shape=bubble] .login .box{border-radius:26px}
html.fun[data-shape=bubble] button,html.fun[data-shape=bubble] .btn{border-radius:99px}
html.fun[data-shape=bubble] input,html.fun[data-shape=bubble] select{border-radius:16px}
html.fun[data-shape=bubble] .region>.rh{padding:11px 16px}html.fun[data-shape=bubble] .region>.rb{padding:14px 16px}
html.fun[data-font=fredoka] body{font-family:Fredoka,Nunito,system-ui,sans-serif}
html.fun[data-font=baloo] body{font-family:'Baloo 2',Nunito,system-ui,sans-serif}
html.fun[data-font=system] body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
html[data-size=s] .layout{zoom:.92}html[data-size=l] .layout{zoom:1.12}html[data-size=xl] .layout{zoom:1.24}
html.fun[data-anim="0"] *{animation:none!important;transition:none!important}

/* --- pola latar --- */
html.fun:not([data-bg=none]) body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:var(--acc);opacity:.09;-webkit-mask-repeat:repeat;mask-repeat:repeat}
${Object.entries(PAT).map(([k,u])=>`html.fun[data-bg=${k}] body::before{-webkit-mask-image:${u};mask-image:${u}}`).join("\n")}

/* --- LUCU PENUH: semua halaman --- */
html.cute-full.fun[data-icons="1"] aside a[data-r]::before{display:inline-block;width:22px;margin-right:6px;text-align:center}
${Object.entries(ICON).map(([k,e])=>`html.cute-full.fun[data-icons="1"] aside a[data-r=${k}]::before{content:"${e}"}`).join("\n")}
html.cute-full.fun aside .grp{color:var(--acc);font-weight:800}
html.cute-full.fun aside a{border-radius:0 14px 14px 0;margin-right:8px;transition:background .15s,transform .15s}
html.cute-full.fun aside a:hover{background:var(--accS);transform:translateX(2px)}
html.cute-full.fun .region>.rh{background:linear-gradient(90deg,var(--accS),transparent);border-radius:inherit;border-bottom-left-radius:0;border-bottom-right-radius:0}
html.cute-full.fun .region>.rh{position:relative;padding-left:30px}
html.cute-full.fun .region>.rh::before{content:"✿";color:var(--acc);position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px}
html.cute-full.fun th{color:var(--accD);font-weight:800}
html.cute-full.fun tbody tr:nth-child(even):not(.grp):not(.sub):not(.tot):not(.bad) td{background:color-mix(in srgb,var(--accS) 40%,transparent)}
html.cute-full.fun tr.click:hover td{background:var(--accS)}
html.cute-full.fun tr.bad td{background:var(--redS)!important}
html.cute-full.fun tr.tot td{color:var(--accD)}
html.cute-full.fun .pill.p-ok::before{content:"✓ "}html.cute-full.fun .pill.p-bad::before{content:"! "}html.cute-full.fun .pill.p-warn::before{content:"⚠ "}
html.cute-full.fun .tile{position:relative;overflow:hidden;transition:transform .2s}
html.cute-full.fun .tile:hover{transform:translateY(-2px)}
html.cute-full.fun .tile .t-ic{position:absolute;right:8px;top:6px;font-size:22px;opacity:.9;filter:drop-shadow(0 2px 0 rgba(0,0,0,.08))}
html.cute-full.fun .tile .k{padding-right:30px;font-weight:700}
html.cute-full.fun .tile::after{content:"";position:absolute;right:-18px;bottom:-18px;width:60px;height:60px;border-radius:50%;background:var(--accS);opacity:.7;z-index:0}
html.cute-full.fun .tile>*{position:relative;z-index:1}
html.cute-full.fun .bar{height:10px;border-radius:99px}
html.cute-full.fun .bar i{border-radius:99px;background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.35) 0 6px,transparent 6px 12px);background-size:17px 17px;animation:cuteBar 1.2s linear infinite}
@keyframes cuteBar{to{background-position:17px 0}}
html.cute-full.fun .tabs{border-bottom:0;gap:6px;padding:4px;background:var(--accS);border-radius:99px;width:max-content;max-width:100%}
html.cute-full.fun .tabs button{border:0;border-radius:99px;padding:7px 14px;color:var(--accD)}
html.cute-full.fun .tabs button.on{background:var(--card);color:var(--ink);box-shadow:0 2px 0 var(--line)}
html.cute-full.fun .msg{border-left:0;border-radius:14px;border:2px solid var(--acc)}
html.cute-full.fun .msg::before{content:"💬 "}
html.cute-full.fun .msg.err::before{content:"😵 "}html.cute-full.fun .msg.warn::before{content:"⚠️ "}
html.cute-full.fun .msg.err{border-color:var(--red)}html.cute-full.fun .msg.warn{border-color:var(--amb)}
html.cute-full.fun button:not(.ham):not(.lnk):hover{transform:translateY(-1px)}
html.cute-full.fun button{transition:transform .12s,box-shadow .12s}
html.cute-full.fun .drop{border-radius:22px;border:3px dashed var(--acc);background:var(--accS);padding:16px}
html.cute-full.fun .drop .drop-buddy{display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:8px}
html.cute-full.fun .drop .drop-buddy .say{background:var(--card);border-radius:16px;padding:8px 12px;font-weight:700;font-size:13px;position:relative;text-align:left;max-width:240px}
html.cute-full.fun .drop .drop-buddy .say::before{content:"";position:absolute;left:-7px;top:50%;margin-top:-7px;border:7px solid transparent;border-left:0;border-right-color:var(--card)}
html.cute-full.fun .sheet .sh{display:flex;align-items:center;gap:8px;background:linear-gradient(90deg,var(--accS),var(--th))}
html.cute-full.fun .sheet .sh .pipi{animation:none}
html.cute-full.fun .sheet{box-shadow:0 12px 40px rgba(0,0,0,.25);border:2px solid var(--acc)}
html.cute-full.fun .ph{border-bottom:2px dashed var(--line)}
html.cute-full.fun input:focus,html.cute-full.fun select:focus{outline:3px solid var(--accS);border-color:var(--acc)}
.buddy{display:none}
html.cute-full.fun[data-buddy="1"] .buddy{display:flex;gap:10px;align-items:center;background:var(--card);border:2px solid var(--line);border-radius:18px;padding:8px 12px;margin:0 0 12px}
html.cute-full.fun .buddy.sad{border-color:var(--red);background:var(--redS)}
html.cute-full.fun .buddy.yay{border-color:var(--grn)}
html.cute-full.fun .buddy .bb{flex:1;min-width:0;font-size:13px;color:var(--mute)}
html.cute-full.fun .buddy .bb b{display:block;color:var(--ink);font-size:14px}
html.cute-full.fun .buddy button{flex:none}
/* hiasan melayang */
.floaty{display:none}
html.cute-full.fun[data-floaty="1"] .floaty{display:block;position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.floaty span{position:absolute;font-size:22px;opacity:.28;animation:floaty 14s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-26px) rotate(8deg)}}
/* rayakan saat posting */
.yay-pop{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(140%);z-index:180;display:flex;align-items:center;gap:8px;background:var(--card);border:2px solid var(--acc);border-radius:22px;padding:6px 14px 6px 8px;box-shadow:0 10px 30px rgba(0,0,0,.2);transition:transform .45s cubic-bezier(.34,1.56,.64,1);pointer-events:none;font-weight:800}
.yay-pop.show{transform:translateX(-50%) translateY(0)}
.yay-pop small{display:block;font-weight:600;color:var(--mute)}
.cf{position:fixed;z-index:181;width:9px;height:12px;border-radius:2px;pointer-events:none;animation:cf 1.6s ease-out forwards}
@keyframes cf{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--x),var(--y)) rotate(540deg);opacity:0}}
@media (prefers-reduced-motion:reduce){.floaty span,.cf,html.cute-full.fun .bar i{animation:none}}
/* tombol 🎨 */
#lookBtn{background:none;color:var(--hdrInk);border-color:rgba(255,255,255,.35)}
@media (max-width:600px){#themeBtn{display:none}}
/* halaman tampilan */
.lk-row{display:grid;grid-template-columns:150px 1fr;gap:6px 14px;align-items:start;padding:10px 0;border-bottom:1px dashed var(--line)}
.lk-row:last-child{border-bottom:0}
.lk-row>b{font-size:13.5px;padding-top:4px}.lk-row>b small{display:block;font-weight:400;color:var(--mute);font-size:12px}
.lk-opts{display:flex;gap:6px;flex-wrap:wrap}
.lk-opts .sw{display:inline-block;width:22px;height:16px;border-radius:5px;border:1px solid var(--line);background:var(--card);position:relative;overflow:hidden}
.lk-opts .sw::after{content:"";position:absolute;inset:0;background:var(--acc);opacity:.45;-webkit-mask-repeat:repeat;mask-repeat:repeat;-webkit-mask-size:12px;mask-size:12px}
${Object.entries(PAT).map(([k,u])=>`.lk-opts .sw.p-${k}::after{-webkit-mask-image:${u};mask-image:${u}}`).join("\n")}
.lk-opts .sw.p-none::after{display:none}
.lk-prev{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.lk-prev .tiles{flex:1;min-width:220px;margin:0}
.lk-chars{display:flex;gap:4px;flex-wrap:wrap}
@media (max-width:600px){.lk-row{grid-template-columns:1fr}}
`;document.head.appendChild(css);

/* ---------- mode gelap paksa: salin aturan gelap otomatis jadi [data-theme=dark] ---------- */
let darkCloned=false;
function cloneDark(){if(darkCloned)return;darkCloned=true;const out=[];
  for(const sh of [...document.styleSheets]){let rules;try{rules=sh.cssRules}catch(e){continue}if(!rules||sh.ownerNode?.id==="cuteDark")continue;
    for(const r of rules){if(r.type!==4||!/prefers-color-scheme:\s*dark/.test(r.conditionText||r.media?.mediaText||""))continue;
      for(const c of r.cssRules){if(!c.selectorText||!c.cssText.includes(':not([data-theme="light"])'))continue;
        out.push(c.cssText.split(':not([data-theme="light"])').join('[data-theme="dark"]'))}}}
  const s=document.createElement("style");s.id="cuteDark";s.textContent=out.join("\n");document.head.appendChild(s)}

/* ---------- terapkan ---------- */
function apply(){const h=document.documentElement;
  h.classList.toggle("cute-full",LOOK.lvl==="full");
  if(LOOK.dark==="auto")h.removeAttribute("data-theme");else h.dataset.theme=LOOK.dark;
  if(LOOK.dark==="dark")cloneDark();
  Object.assign(h.dataset,{bg:LOOK.bg,shape:LOOK.shape,font:LOOK.font,size:LOOK.size,buddy:String(+LOOK.buddy),icons:String(+LOOK.icons),floaty:String(+LOOK.floaty),anim:String(+LOOK.anim)});
  loadFont(LOOK.font);floaty()}
async function save(patch){LOOK={...LOOK,...patch};try{localStorage.setItem("bbp_look",JSON.stringify(LOOK))}catch(e){}
  window.PREFS={...(window.PREFS||{}),look:LOOK};apply();try{render()}catch(e){}
  try{if(typeof col!=="undefined"&&col)await col.doc("prefs").set(window.PREFS)}catch(e){}}
function setMode(m){try{localStorage.setItem("bbp_theme",m)}catch(e){}document.documentElement.classList.toggle("fun",m==="fun");try{render()}catch(e){}}

let floatyEl=null;
function floaty(){if(floatyEl)return;floatyEl=document.createElement("div");floatyEl.className="floaty";floatyEl.setAttribute("aria-hidden","true");
  const E=["✨","💖","⭐","🌸","☁️","💫","🍀","🎀"],P=[[6,14],[88,10],[14,62],[92,48],[48,86],[70,26],[30,36],[80,78]];
  floatyEl.innerHTML=P.map(([x,y],i)=>`<span style="left:${x}%;top:${y}%;animation-delay:-${i*1.7}s">${E[i]}</span>`).join("");
  document.body.appendChild(floatyEl)}

/* ---------- kalimat teman per halaman ---------- */
function line(r){const c=(window.CHARS||{})[document.documentElement.dataset.char]||{name:"Pipi",emoji:"🐷"};
  const s=(m,t,d,extra)=>({m,t,d,...extra});
  try{switch(r){
   case "input":return s("happy",L(`Kirim struknya ke aku, nanti ${c.name} bacain! 📸`,`Send me the receipt, ${c.name} will read it! 📸`),L("Nggak ada struk? Pakai Isi manual. Transfer antar rekening sendiri pilih jenis Transfer ya.","No receipt? Use manual entry. Moving money between your own accounts = Transfer."));
   case "journal":return s("think",L("Semua catatan uangmu ada di sini 📒","All your money records live here 📒"),L("Salah input? Jangan dihapus — pakai Reverse atau Reklas, biar jejaknya rapi.","Made a mistake? Don't delete — use Reverse or Reclass so the trail stays clean."));
   case "gl":return s("think",L("Mau intip satu akun? 🔍","Peek into one account? 🔍"),L("Pilih akun & periode, aku tunjukin semua mutasinya.","Pick an account & period, I'll show every movement."));
   case "tb":return s("happy",L("Debit dan kredit harus seimbang ⚖️","Debits and credits must balance ⚖️"),L("Kalau totalnya sama, bukumu sehat.","Equal totals = healthy books."));
   case "recon":{const rows=reconRows(),bad=rows.filter(x=>x.bad),real=rows.filter(x=>x.real!=null);
     if(bad.length)return s("worried",L(`Ada ${bad.length} rekening yang belum cocok 😟`,`${bad.length} account(s) don't match 😟`),L(`${bad.map(x=>x.n).join(", ")} — cek biaya admin, bunga, atau transaksi yang kelewat.`,`${bad.map(x=>x.n).join(", ")} — check admin fees, interest, or missed entries.`),{sad:1});
     if(real.length)return s("party",L("Semua rekening cocok! 🎉","All accounts match! 🎉"),L("Buku = bank. Pertahankan, cek lagi minggu depan.","Books = bank. Check again next week."),{ok:1});
     return s("think",L("Isi saldo real biar aku bisa ngecek 🏦","Enter real balances so I can check 🏦"),L("Lihat angka di aplikasi bank, ketik di kolom Saldo real.","Copy the number from your bank app into Real balance."))}
   case "budget":{const m=per||today().slice(0,7),bud=budgetFor(m);if(!bud)return s("think",L("Belum ada anggaran bulan ini 🎯","No budget for this month yet 🎯"),L("Tekan Ubah anggaran: isi gaji, kost, listrik, makan, transport, tabungan.","Tap Edit budget: salary, rent, power, food, transport, savings."));
     const B=balsAll(mEnd(m),m+"-01"),over=Object.entries(bud.lines).filter(([k,b])=>typeOf(k)==="X"&&num(b)&&nb(B,k)>num(b));
     if(over.length)return s("worried",L(`${over.length} pos anggaran jebol 😱`,`${over.length} budget line(s) over 😱`),L("Rem dikit ya, atau pindahkan dari pos lain.","Slow down a bit, or move money from another line."),{sad:1});
     return s("happy",L("Anggaran masih aman 👛","Budget is on track 👛"),L("Garis belang bergerak = pemakaian. Kuning mulai hati-hati, merah = jebol.","Striped bars show usage. Yellow = careful, red = over."),{ok:1})}
   case "fs":return s("party",L("Laporan keuanganmu, rapi kayak perusahaan 📊","Your statements, company-grade 📊"),L("Laba Rugi, Neraca, Arus Kas. Bisa dicetak / simpan PDF.","P&L, Balance Sheet, Cash Flow. Print or save as PDF."));
   case "coa":return s("think",L("Ini laci-laci uangmu 🗂️","These are your money drawers 🗂️"),L("1 aset · 2 utang · 3 ekuitas · 4 pendapatan · 5 beban.","1 assets · 2 liabilities · 3 equity · 4 income · 5 expenses."));
   case "period":return s("sleep",L("Akhir bulan? Tutup buku & backup 🔒","Month end? Close & back up 🔒"),L("Pastikan rekonsiliasi hijau dulu, baru tutup periode.","Make sure reconciliation is green first."));
   case "today":return s("happy",L(`Hai! Ini harimu bareng ${c.name} ☀️`,`Hi! Your day with ${c.name} ☀️`),L("Agenda, tagihan, dan uang hari ini, semua di sini.","Agenda, bills and today's money, all here."));
   case "sched":return s("think",L("Jadwalmu, biar nggak ada yang kelewat 📅","Your schedule, nothing missed 📅"),L("Ketuk tanggal untuk tambah acara. Aktifkan notifikasi biar aku ingetin.","Tap a date to add an event. Turn on notifications so I can remind you."));
   case "diary":return s("happy",L("Gimana harimu? Ceritain ke aku ✍️","How was your day? Tell me ✍️"),L("Mood, kegiatan, satu hal baik. 2 menit aja.","Mood, activities, one good thing. Just 2 minutes."));
   case "notes":return s("think",L("Tempat semua ide & daftar 📝","Home for ideas & lists 📝"),L("Pin yang penting, kasih warna biar gampang dicari. Jangan simpan password di sini ya.","Pin important ones, color-code them. Don't keep passwords here."));
   case "quest":return s("party",L("Kumpulkan semua stikernya! 🏆","Collect all the stickers! 🏆"),L("Yang paling langka: 5 stiker couple Vina & El (Mitos) 💑","Rarest: the 5 Vina & El couple stickers (Mythic) 💑"));
   case "album":return s("party",L("Album stikermu 🌟","Your sticker album 🌟"),L("5 duplikat bisa ditukar jadi 1 tarikan.","Trade 5 duplicates for 1 draw."));
  }}catch(e){}return null}

/* ---------- ikon kartu angka ---------- */
const TILE=[[/anggaran pendapatan|budgeted income/i,"💵"],[/anggaran beban|budgeted expense/i,"📋"],[/belum dialokasikan|unallocated/i,"🧩"],[/sisa anggaran|budget left/i,"👛"],
 [/pengeluaran hari ini|spent today/i,"🛍️"],[/kas|cash/i,"💰"],[/kekayaan|net worth/i,"💎"],[/pendapatan|income/i,"📈"],[/beban|expense/i,"🧾"],[/surplus/i,"🐷"],
 [/rasio tabungan|saving/i,"🏦"],[/tempat tinggal|housing/i,"🏠"],[/klaim|claim/i,"🎁"],[/koleksi|collection|terkumpul|collected/i,"📚"],[/duplikat|duplicate/i,"🔁"],
 [/acara|event|agenda/i,"📅"],[/tagihan|bill/i,"💡"],[/jurnal|journal|streak/i,"✍️"],[/mood/i,"😊"],[/catatan|note/i,"📝"]];
const SPARE=["✨","🌸","⭐","💫","🍀"];

/* ---------- hiasan setiap render ---------- */
function decorate(){
  if(window.PREFS?.look&&JSON.stringify({...DEF,...window.PREFS.look})!==JSON.stringify(LOOK)){LOOK={...DEF,...window.PREFS.look};try{localStorage.setItem("bbp_look",JSON.stringify(LOOK))}catch(e){}}
  apply();
  // tombol 🎨 di header
  if(!document.getElementById("lookBtn")){const b=document.createElement("button");b.id="lookBtn";b.className="sm";b.textContent="🎨";b.onclick=()=>go("look");
    const th=document.getElementById("themeBtn"),lg=document.getElementById("langBtn");(lg||th)?(lg||th).before(b):document.querySelector("header")?.appendChild(b)}
  document.getElementById("lookBtn").title=L("Opsi tampilan","Display options");
  if(!full())return;
  const v=document.getElementById("view");if(!v)return;
  // teman di tiap halaman
  if(LOOK.buddy&&route!=="dash"&&route!=="guide"&&typeof window.pipi==="function"){const ln=line(route),ph=v.querySelector(".ph");
    if(ln&&ph&&!v.querySelector(".buddy")){const d=document.createElement("div");d.className="buddy"+(ln.sad?" sad":ln.ok?" yay":"");
      d.innerHTML=`${window.pipi(ln.m,44)}<div class="bb"><b></b><span></span></div>`;d.querySelector("b").textContent=ln.t;d.querySelector("span").textContent=ln.d;
      const after=v.querySelector(".pipi-card")||ph;after.after(d)}}
  // ikon kartu
  let i=0;v.querySelectorAll(".tile").forEach(t=>{if(t.querySelector(".t-ic"))return;const k=t.querySelector(".k")?.textContent||"";
    const hit=TILE.find(([re])=>re.test(k));const s=document.createElement("span");s.className="t-ic";s.textContent=hit?hit[1]:SPARE[i++%SPARE.length];t.prepend(s)});
  // zona foto struk
  const drop=v.querySelector("#drop");if(drop&&!drop.querySelector(".drop-buddy")){const d=document.createElement("div");d.className="drop-buddy";
    d.innerHTML=`${window.pipi("happy",64)}<div class="say"></div>`;d.querySelector(".say").textContent=L("Taruh struknya di sini, aku yang baca! 🧾","Drop the receipt here, I'll read it! 🧾");drop.prepend(d)}
}
if(typeof render==="function"){const _r=render;render=function(){_r();try{decorate()}catch(e){console.warn(e)}}}

/* ---------- teman di jendela pop-up ---------- */
new MutationObserver(ms=>{if(!full())return;for(const m of ms)for(const n of m.addedNodes){if(!(n instanceof HTMLElement)||!n.classList.contains("sheetBg"))continue;
  const sh=n.querySelector(".sh");if(sh&&!sh.querySelector(".pipi")&&window.pipi)sh.insertAdjacentHTML("afterbegin",window.pipi("think",30))}}).observe(document.body,{childList:true});

/* ---------- rayakan saat jurnal diposting / tersimpan ---------- */
let lastYay=0;
function yay(text){if(!full()||!LOOK.yay||Date.now()-lastYay<1500)return;lastYay=Date.now();
  const p=document.createElement("div");p.className="yay-pop";p.innerHTML=`${window.pipi?window.pipi("party",48):""}<div><span></span><small></small></div>`;
  p.querySelector("span").textContent=L("Yay, tercatat! 🎉","Yay, recorded! 🎉");p.querySelector("small").textContent=text;document.body.appendChild(p);
  requestAnimationFrame(()=>requestAnimationFrame(()=>p.classList.add("show")));
  if(LOOK.anim&&!matchMedia("(prefers-reduced-motion: reduce)").matches){const cs=getComputedStyle(document.documentElement),cols=[cs.getPropertyValue("--acc"),cs.getPropertyValue("--g1"),cs.getPropertyValue("--g2"),"#ffd166","#06d6a0"];
    for(let k=0;k<22;k++){const c=document.createElement("i");c.className="cf";const a=Math.random()*Math.PI-Math.PI,d=120+Math.random()*160;
      c.style.cssText=`left:50%;bottom:60px;background:${cols[k%cols.length]};--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${Math.random()*.15}s`;document.body.appendChild(c);setTimeout(()=>c.remove(),1900)}}
  setTimeout(()=>{p.classList.remove("show");setTimeout(()=>p.remove(),500)},2600)}
const st=document.getElementById("status");
if(st)new MutationObserver(()=>{const t=st.textContent||"";if(st.classList.contains("hide")||/err|warn/.test(st.className))return;
  if(/diposting|posted|tersimpan|disimpan|saved/i.test(t))yay(t)}).observe(st,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["class"]});

/* ---------- halaman Tampilan ---------- */
function opt(key,val,label,extra=""){return `<button class="sm${String(LOOK[key])===String(val)?" pri":""}" data-lk="${key}" data-lv="${val}">${extra}${label}</button>`}
function tog(key,label){return `<button class="sm${LOOK[key]?" pri":""}" data-lt="${key}">${LOOK[key]?"✓ ":""}${label}</button>`}
function vLook(v){const fun=isFun(),cur=document.documentElement.dataset.char;
  v.innerHTML=page(L("Bantuan","Help"),L("Tampilan 🎨","Display 🎨"),`<button class="sm" id="lkReset">${L("Kembalikan default","Reset to default")}</button>`)+
  `<div class="region"><div class="rh">${L("Pratinjau","Preview")}</div><div class="rb"><div class="lk-prev">${window.pipi?window.pipi("party",72):""}
    <div class="tiles"><div class="tile"><div class="k">${L("Total kas & bank","Total cash & bank")}</div><div class="v">Rp1.250.000</div><div class="s">${L("contoh","sample")}</div></div>
    <div class="tile"><div class="k">${L("Sisa anggaran bulan ini","Budget left this month")}</div><div class="v">Rp430.000</div><div class="s"><div class="bar w" style="margin-top:6px"><i style="width:72%"></i></div></div></div></div></div>
    <div class="acts" style="margin-top:10px"><button class="pri sm">${L("Tombol utama","Main button")}</button><button class="sm">${L("Tombol biasa","Button")}</button><span class="pill p-ok">${L("Cocok","Match")}</span><span class="pill p-warn">80%</span><span class="pill p-bad">${L("Beda","Differs")}</span></div></div></div>
  <div class="region"><div class="rh">${L("Gaya","Style")}</div><div class="rb">
   <div class="lk-row"><b>${L("Mode","Mode")}<small>${L("Lucu = karakter & warna, Pro = gaya ERP polos","Cute = characters & colour, Pro = plain ERP")}</small></b><div class="lk-opts">
     <button class="sm${fun?" pri":""}" data-mode="fun">🧸 ${L("Lucu","Cute")}</button><button class="sm${fun?"":" pri"}" data-mode="pro">💼 Pro</button></div></div>
   <div class="lk-row"><b>${L("Tingkat lucu","Cuteness")}<small>${L("Penuh = semua halaman, termasuk transaksi, buku besar, laporan","Full = every page, incl. transactions, ledger, reports")}</small></b><div class="lk-opts">
     ${opt("lvl","full","🌈 "+L("Lucu penuh","Full cute"))}${opt("lvl","light","🌱 "+L("Lucu ringan","Light cute"))}</div></div>
   <div class="lk-row"><b>${L("Terang / gelap","Light / dark")}</b><div class="lk-opts">${opt("dark","auto","🌗 "+L("Ikut HP","Follow device"))}${opt("dark","light","☀️ "+L("Terang","Light"))}${opt("dark","dark","🌙 "+L("Gelap","Dark"))}</div></div>
   <div class="lk-row"><b>${L("Pola latar","Background")}</b><div class="lk-opts">${[["none",L("Polos","Plain")],["dots",L("Titik","Dots")],["hearts",L("Hati","Hearts")],["stars",L("Bintang","Stars")],["clouds",L("Awan","Clouds")],["grid",L("Kotak","Grid")]].map(([k,n])=>opt("bg",k,n,`<span class="sw p-${k}"></span>`)).join("")}</div></div>
   <div class="lk-row"><b>${L("Bentuk","Shape")}</b><div class="lk-opts">${opt("shape","square","▢ "+L("Kotak","Square"))}${opt("shape","round","◯ "+L("Bulat","Round"))}${opt("shape","bubble","🫧 "+L("Ekstra bulat","Bubbly"))}</div></div>
   <div class="lk-row"><b>${L("Huruf","Font")}</b><div class="lk-opts">${[["nunito","Nunito","Nunito"],["fredoka","Fredoka","Fredoka"],["baloo","Baloo","'Baloo 2'"],["system",L("Sistem","System"),"system-ui"]].map(([k,n,f])=>{loadFont(k);return opt("font",k,`<span style="font-family:${f}">${n}</span>`)}).join("")}</div></div>
   <div class="lk-row"><b>${L("Ukuran teks","Text size")}</b><div class="lk-opts">${opt("size","s",L("Kecil","Small"))}${opt("size","m","Normal")}${opt("size","l",L("Besar","Large"))}${opt("size","xl",L("Ekstra besar","Extra large"))}</div></div>
   <div class="lk-row"><b>${L("Hiasan","Decorations")}<small>${L("Berlaku di Lucu penuh","Apply in Full cute")}</small></b><div class="lk-opts">
     ${tog("buddy",L("Teman di tiap halaman","Buddy on every page"))}${tog("icons",L("Ikon menu","Menu icons"))}${tog("floaty",L("Hiasan melayang","Floating decor"))}${tog("anim",L("Animasi","Animation"))}${tog("yay",L("Rayakan saat posting","Celebrate on post"))}</div></div>
  </div></div>
  <div class="region"><div class="rh">${L("Teman & warna tema","Buddy & colour theme")}</div><div class="rb">
   <div class="lk-chars">${Object.entries(window.CHARS||{}).map(([k,c])=>`<button class="sm${k===cur?" pri":""}" data-ch="${k}">${c.emoji} ${esc(c.name)}</button>`).join("")}</div>
   <p class="crumb" style="margin:10px 0 0">${L("Setiap teman punya warna sendiri. Atur seberapa sering teman ngintip di","Each buddy has its own colours. Set how often your buddy peeks in")} <button class="lnk" id="lkGuide">${L("Panduan","Guide")}</button>.</p></div></div>`;
  v.querySelectorAll("[data-lk]").forEach(b=>b.onclick=()=>save({[b.dataset.lk]:b.dataset.lv}));
  v.querySelectorAll("[data-lt]").forEach(b=>b.onclick=()=>save({[b.dataset.lt]:LOOK[b.dataset.lt]?0:1}));
  v.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
  v.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>window.setChar&&window.setChar(b.dataset.ch));
  document.getElementById("lkGuide").onclick=()=>go("guide");
  document.getElementById("lkReset").onclick=()=>{if(confirm(L("Kembalikan semua opsi tampilan ke default?","Reset all display options?"))){setMode("fun");save({...DEF})}}}

const g=NAV.find(x=>x[0]==="Bantuan");if(g)g[1].push(["look","Opsi Tampilan"]);else NAV.push(["Bantuan",[["look","Opsi Tampilan"]]]);
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{look:vLook});
apply();
addEventListener("load",()=>{try{render()}catch(e){}});
})();
