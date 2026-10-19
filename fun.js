/* =====================================================================
   MODE LUCU + MASKOT "PIPI" + TUTORIAL INTERAKTIF + PANDUAN
   Karakter: Pipi, Moci, Kodi, Cimi, Mumu — semua original untuk aplikasi ini. + chibi Vina & El.
   ===================================================================== */
(function(){
/* ---------- tema ---------- */
const getTheme=()=>{try{return localStorage.getItem("bbp_theme")||"fun"}catch(e){return "fun"}};
function applyTheme(t){document.documentElement.classList.toggle("fun",t==="fun");try{localStorage.setItem("bbp_theme",t)}catch(e){}}
applyTheme(getTheme());
const font=document.createElement("link");font.rel="stylesheet";font.href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";document.head.appendChild(font);
const css=document.createElement("style");css.textContent=`
html.fun{--g1:#7c4dff;--g2:#ff6fa8;--accD:#d94f8a;--hdr:#7c4dff;--hdrInk:#fff;--bg:#fff7fb;--card:#fff;--ink:#2d2340;--mute:#7a6f8f;--line:#f0e2ef;--th:#fbeff7;--acc:#ff6fa8;--accS:#ffe6f1;--sel:#ffeef6;--grn:#1c9a5b;--grnS:#e0f7ea;--red:#e5484d;--redS:#ffe8e8;--amb:#b36b00;--ambS:#fff3d6}
@media (prefers-color-scheme:dark){html.fun:not([data-theme="light"]){--hdr:#5b34d6;--bg:#1b1524;--card:#251d31;--ink:#f3ecfb;--mute:#b4a6c9;--line:#3a2f49;--th:#2e2440;--acc:#ff86b6;--accS:#3b2234;--sel:#33263f;--grnS:#173525;--redS:#3d1b20;--ambS:#3b2e14}}
html.fun body{font-family:Nunito,system-ui,sans-serif}
html.fun[data-char=moci]{--g1:#ff7a2f;--g2:#ffc15e;--acc:#f47c2c;--accD:#c95d17;--accS:#ffe9d6;--sel:#fff0e0;--th:#fff1e3;--line:#f3e1cf;--bg:#fff8f0}
html.fun[data-char=kodi]{--g1:#23905a;--g2:#8fd16a;--acc:#2fa463;--accD:#1f7c49;--accS:#dff4e3;--sel:#e7f6e9;--th:#ecf7e8;--line:#dcefd6;--bg:#f4fbf2}
html.fun[data-char=cimi]{--g1:#ffb703;--g2:#ffe066;--hdrInk:#3b2a00;--acc:#e59a00;--accD:#b77a00;--accS:#fff2c2;--sel:#fff5d1;--th:#fff7d9;--line:#f5e9bf;--bg:#fffcf0}
html.fun[data-char=mumu]{--g1:#3e2723;--g2:#8d6e63;--acc:#6d4c41;--accD:#4e342e;--accS:#efe5dc;--sel:#f1e8df;--th:#f3ece4;--line:#e6dccf;--bg:#fbf8f4}
html.fun[data-char=bubu]{--g1:#a0621d;--g2:#e8b04b;--acc:#c27c1a;--accD:#8f5a10;--accS:#fbeedb;--sel:#fdf3e4;--th:#fbf1e2;--line:#efdfc6;--bg:#fffaf2}
html.fun[data-char=pandi]{--g1:#1f6f66;--g2:#6cc4a1;--acc:#2a9d8f;--accD:#1e7369;--accS:#dff3ef;--sel:#e8f6f3;--th:#ecf7f4;--line:#d4ebe5;--bg:#f6fbfa}
html.fun[data-char=kiki]{--g1:#3a7bd5;--g2:#8ec5fc;--acc:#3f85e0;--accD:#2a62ad;--accS:#e2eefc;--sel:#ebf3fd;--th:#eef4fd;--line:#d8e6f8;--bg:#f7fafe}
html.fun[data-char=popo]{--g1:#283593;--g2:#5c9ded;--acc:#3949ab;--accD:#283593;--accS:#e5e8f8;--sel:#eceefa;--th:#eff1fb;--line:#dde1f4;--bg:#f8f9fe}
html.fun[data-char=rubi]{--g1:#b23a48;--g2:#f28a3b;--acc:#d1495b;--accD:#9e3443;--accS:#fbe4e7;--sel:#fdecee;--th:#fdf0f1;--line:#f4d9dc;--bg:#fff8f8}
html.fun[data-char=vcap]{--g1:#2f3b52;--g2:#7189b8;--acc:#3d5a8a;--accD:#2a3f63;--accS:#e3e9f4;--sel:#e9eef7;--th:#edf1f8;--line:#dbe2ee;--bg:#f7f9fc}
html.fun[data-char=vkantor]{--g1:#6a5acd;--g2:#b9a7f0;--acc:#6f5bd3;--accD:#5241a8;--accS:#ece8fb;--sel:#f1eefc;--th:#f3f0fd;--line:#e2dcf7;--bg:#faf9ff}
html.fun[data-char=vorange]{--g1:#d93a0b;--g2:#ff8a3d;--acc:#e5531c;--accD:#b23f10;--accS:#ffe5d9;--sel:#fff0e8;--th:#fff1ea;--line:#f6dccf;--bg:#fff8f4}
html.fun[data-char=vsantai]{--g1:#25272d;--g2:#5c6170;--acc:#3f4450;--accD:#23262d;--accS:#e6e7ea;--sel:#eeeff2;--th:#f0f1f3;--line:#dfe1e5;--bg:#f7f8f9}
html.fun[data-char=vkrl]{--g1:#b8566f;--g2:#f2b8c6;--acc:#c25a78;--accD:#973f59;--accS:#fbe6ec;--sel:#fdeef2;--th:#fdf0f4;--line:#f3dbe3;--bg:#fff8fa}
html.fun[data-char=vnel]{--g1:#ff6fa8;--g2:#6b8cff;--acc:#e0559a;--accD:#b13b77;--accS:#fde6f1;--sel:#fdeef6;--th:#f7eefb;--line:#eedff0;--bg:#fdf8fd}
html.fun[data-char=erusa]{--g1:#1f1f24;--g2:#c9802f;--acc:#b8691f;--accD:#8f4f14;--accS:#f8ead9;--sel:#fbf1e5;--th:#f8efe4;--line:#eadfce;--bg:#fcf9f4}
html.fun[data-char=ebuku]{--g1:#1d3b2c;--g2:#8fae5d;--acc:#2f6b4a;--accD:#1f4e35;--accS:#e2efe5;--sel:#eaf4ec;--th:#eef5ef;--line:#d8e7dc;--bg:#f6faf5}
html.fun[data-char=erenang]{--g1:#1f7fb8;--g2:#6ec3e8;--acc:#1f8fc9;--accD:#176c99;--accS:#dff1fb;--sel:#e8f5fc;--th:#ecf6fc;--line:#d3e9f5;--bg:#f5fbfe}
html.fun[data-char=ekaget]{--g1:#e05a47;--g2:#ffb08a;--acc:#d9533f;--accD:#a83d2d;--accS:#fde6e1;--sel:#fdeee9;--th:#fdf1ee;--line:#f4dcd6;--bg:#fff9f7}
@media (prefers-color-scheme:dark){
 html.fun[data-char=bubu]:not([data-theme="light"]){--acc:#f0b25a;--accS:#3a2b16;--sel:#372a18;--bg:#1a150f;--card:#241d15;--th:#2d241a;--line:#44372a}
 html.fun[data-char=pandi]:not([data-theme="light"]){--acc:#5fd1c0;--accS:#16332f;--sel:#18332f;--bg:#111a19;--card:#172321;--th:#1e2d2a;--line:#2b423e}
 html.fun[data-char=kiki]:not([data-theme="light"]){--acc:#7fb4f5;--accS:#1a2a40;--sel:#1b2b3f;--bg:#11161d;--card:#171e28;--th:#1e2734;--line:#2d3a4c}
 html.fun[data-char=popo]:not([data-theme="light"]){--acc:#8c9eff;--accS:#1f2340;--sel:#20243e;--bg:#12131c;--card:#181a27;--th:#202333;--line:#30344b}
 html.fun[data-char=rubi]:not([data-theme="light"]){--acc:#ff8597;--accS:#3c1c22;--sel:#3a1d23;--bg:#1b1214;--card:#25191c;--th:#2e2024;--line:#473036}
 html.fun[data-char=vcap]:not([data-theme="light"]){--acc:#8fa9da;--accS:#1f2738;--sel:#212a3b;--bg:#13161d;--card:#1b2029;--th:#222836;--line:#323b4d}
 html.fun[data-char=vkantor]:not([data-theme="light"]){--acc:#a796f2;--accS:#272143;--sel:#29223f;--bg:#15131d;--card:#1d1a29;--th:#252135;--line:#373050}
 html.fun[data-char=vorange]:not([data-theme="light"]){--acc:#ff8a52;--accS:#3d2116;--sel:#3a2218;--bg:#1b1310;--card:#251a15;--th:#2e211b;--line:#45302a}
 html.fun[data-char=vsantai]:not([data-theme="light"]){--g1:#15161a;--g2:#40444f;--acc:#b9bfcc;--accS:#2a2d33;--sel:#2b2e35;--bg:#141518;--card:#1c1e22;--th:#24262b;--line:#363940}
 html.fun[data-char=vkrl]:not([data-theme="light"]){--acc:#f08aa6;--accS:#3b1f29;--sel:#3a2029;--bg:#1b1316;--card:#251a1e;--th:#2e2126;--line:#47313a}
 html.fun[data-char=vnel]:not([data-theme="light"]){--g1:#b8407a;--g2:#4258b8;--acc:#ff8cc0;--accS:#3b2034;--sel:#38203a;--bg:#18141f;--card:#221b2c;--th:#2b2236;--line:#40334f}
 html.fun[data-char=erusa]:not([data-theme="light"]){--acc:#e0a050;--accS:#3a2a16;--sel:#372818;--bg:#151412;--card:#1f1d1a;--th:#292621;--line:#3e3a32}
 html.fun[data-char=ebuku]:not([data-theme="light"]){--acc:#7fc79a;--accS:#173324;--sel:#193325;--bg:#111a15;--card:#17231c;--th:#1e2d24;--line:#2c4234}
 html.fun[data-char=erenang]:not([data-theme="light"]){--acc:#6ec3e8;--accS:#16303f;--sel:#17303d;--bg:#10171c;--card:#162129;--th:#1c2a34;--line:#2a3f4d}
 html.fun[data-char=ekaget]:not([data-theme="light"]){--acc:#ff8a75;--accS:#3d1f1a;--sel:#3a201b;--bg:#1b1413;--card:#251b19;--th:#2e2220;--line:#473430}
 html.fun[data-char=moci]:not([data-theme="light"]){--acc:#ff9a52;--accS:#3d2a1b;--sel:#3a2a1d;--bg:#1d1712;--card:#271f18;--th:#30261d;--line:#43362a}
 html.fun[data-char=kodi]:not([data-theme="light"]){--acc:#5fd28e;--accS:#183324;--sel:#1b3326;--bg:#121a15;--card:#18231c;--th:#1f2d24;--line:#2d4234}
 html.fun[data-char=cimi]:not([data-theme="light"]){--acc:#ffc93c;--accS:#3a3016;--sel:#383017;--bg:#1a1710;--card:#242016;--th:#2d281b;--line:#433b26}
 html.fun[data-char=mumu]:not([data-theme="light"]){--g1:#2a1d19;--g2:#6d4c41;--acc:#c8a28e;--accS:#33281f;--sel:#30251f;--bg:#161312;--card:#201b19;--th:#2a2320;--line:#3d332e}}
html.fun header{background:linear-gradient(90deg,var(--g1),var(--g2));color:var(--hdrInk)}
html.fun .region,html.fun .tile,html.fun .acc,html.fun .sheet,html.fun .login .box{border-radius:16px}
html.fun .region{box-shadow:0 2px 0 var(--line)}
html.fun .tile{border-top-width:0;border-left:5px solid var(--acc)}
html.fun .tile.bad{border-left-color:var(--red)}
html.fun button,html.fun .btn,html.fun input,html.fun select{border-radius:12px}
html.fun button.pri,html.fun .btn.pri{background:var(--acc)!important;border-color:var(--acc)!important;color:#fff!important;box-shadow:0 3px 0 var(--accD)}
html.fun button.pri:active{transform:translateY(2px);box-shadow:none}
html.fun aside a.on{border-left-color:var(--acc);border-radius:0 12px 12px 0}
html.fun th{background:var(--th)}
html.fun .pill{border-radius:99px}
html.fun .ph h1{font-weight:800}
.pipi-card{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-bottom:12px}
.pipi-card .bubble{flex:1;min-width:0}
.pipi-card .bubble b{display:block;font-size:15px}
.pipi-card .bubble div{font-size:13.5px;color:var(--mute);margin-top:2px}
.pipi-card.sad{border-color:var(--red);background:var(--redS)}
.pipi{flex:none;display:block}
header .app{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
@media (max-width:600px){header{gap:6px;padding:0 8px}header .app{font-size:14px}header .ent{display:none}header button.sm{padding:3px 8px;font-size:12px}
 .pipi-card{padding:10px}.pipi-card>.pipi{width:48px;height:48px}}
html.fun .pipi{animation:pipiBob 2.6s ease-in-out infinite}
@keyframes pipiBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){html.fun .pipi{animation:none}}
html:not(.fun) .pipi-card .pipi,html:not(.fun) .pipi-empty .pipi{display:none}
.chk{list-style:none;padding:0;margin:8px 0 0}
.chk li{display:flex;gap:8px;align-items:center;padding:4px 0;font-size:13.5px;color:var(--ink)}
.chk li .bx{width:20px;height:20px;border-radius:6px;border:2px solid var(--line);display:inline-flex;align-items:center;justify-content:center;font-size:12px;flex:none}
.chk li.done .bx{background:var(--grn);border-color:var(--grn);color:#fff}
.chk li.done span:not(.bx){text-decoration:line-through;color:var(--mute)}
.chk li button{margin-left:auto}
.pipi-empty{display:flex;gap:10px;align-items:center;padding:10px 12px}
.tour-dim{position:fixed;z-index:200;border-radius:14px;box-shadow:0 0 0 9999px rgba(20,10,30,.55);transition:all .25s;pointer-events:none;outline:3px solid var(--acc)}
.tour-dim.none{box-shadow:0 0 0 9999px rgba(20,10,30,.55);outline:none;width:0!important;height:0!important;left:50%!important;top:50%!important}
.tour-box{position:fixed;z-index:201;background:var(--card);color:var(--ink);border-radius:18px;padding:14px;width:min(360px,calc(100vw - 24px));box-shadow:0 10px 40px rgba(0,0,0,.3);display:flex;gap:10px}
.tour-box h4{margin:0 0 4px;font-size:15.5px}.tour-box p{margin:0;font-size:13.5px;line-height:1.5;color:var(--ink)}
.tour-box .nav{display:flex;gap:6px;margin-top:10px;align-items:center}
.tour-box .dots{font-size:11px;color:var(--mute);margin-right:auto}
.charpick{flex-direction:column;align-items:center;gap:2px;padding:10px 8px;min-height:0;white-space:normal;text-align:center;border-radius:16px;border-width:2px}
.charpick.on{border-color:var(--acc);background:var(--accS)}
.charpick b{font-size:14px}.charpick span{font-size:12px;color:var(--acc);font-weight:700}.charpick small{font-size:11.5px;color:var(--mute);line-height:1.35}
html:not(.fun) .charpick .pipi{display:block}
.guide h3{margin:16px 0 6px;font-size:15px}.guide p,.guide li{font-size:14px;line-height:1.55}
.guide .term{display:grid;grid-template-columns:120px 1fr;gap:4px 12px;font-size:13.5px}
.guide .term b{color:var(--acc)}
@media (max-width:600px){.guide .term{grid-template-columns:1fr}.guide .term b{margin-top:6px}}
`;document.head.appendChild(css);

/* ---------- perbaikan menu ☰ di HP: bisa di-scroll sampai item terakhir ----------
   Penyebab: aside di HP jadi position:fixed tapi masih membawa align-self:flex-start dari
   versi desktop. Di browser baru, itu membuat tinggi menu = tinggi isinya (bukan tinggi layar),
   jadi menu memanjang keluar layar dan tidak ada yang bisa di-scroll. Ditambah min-height
   100vh-52px padahal header di HP 2 baris. */
const navFix=document.createElement("style");navFix.id="navFix";navFix.textContent=`
@media (max-width:860px){
 aside#nav{align-self:stretch!important;top:var(--hdrH,98px)!important;bottom:0!important;height:auto!important;min-height:0!important;max-height:none!important;
  overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;
  padding-bottom:calc(24px + env(safe-area-inset-bottom))!important}
 html:has(aside#nav.open),html:has(aside#nav.open) body{overflow:hidden!important}}`;
document.head.appendChild(navFix);
function syncHdr(){const h=document.querySelector("header");if(h)document.documentElement.style.setProperty("--hdrH",Math.round(h.getBoundingClientRect().height)+"px")}
addEventListener("load",()=>{syncHdr();const h=document.querySelector("header");if(h&&window.ResizeObserver)new ResizeObserver(syncHdr).observe(h)});
addEventListener("resize",syncHdr);

/* ---------- karakter (semua original) ---------- */
const CHARS={
 pipi:{name:"Pipi",emoji:"🐷",kind:"celengan babi",desc:"Rajin nabung, gampang panik kalau saldo nggak cocok.",body:"#ffb3cf",cheek:"#ff8fb5",feet:"#f48fb1",
  back:'<path d="M30 34 L26 14 L46 26 Z" fill="#f48fb1"/><path d="M90 34 L94 14 L74 26 Z" fill="#f48fb1"/><path d="M31 30 L29 19 L40 26 Z" fill="#ff6f91"/><path d="M89 30 L91 19 L80 26 Z" fill="#ff6f91"/><circle cx="104" cy="66" r="3" fill="none" stroke="#f48fb1" stroke-width="3"/>',
  front:'<rect x="50" y="24" width="20" height="5" rx="2.5" fill="#d9658f"/><ellipse cx="60" cy="70" rx="13" ry="9" fill="#ff8fb5"/><ellipse cx="55" cy="70" rx="2.6" ry="3.4" fill="#c2507a"/><ellipse cx="65" cy="70" rx="2.6" ry="3.4" fill="#c2507a"/>'},
 moci:{name:"Moci",emoji:"🐱",kind:"kucing oranye",desc:"Santai tapi teliti, hafal semua tanggal jatuh tempo.",body:"#ffc98f",cheek:"#ff9f8a",feet:"#f0ad6c",
  back:'<path d="M24 46 L30 10 L54 30 Z" fill="#f0ad6c"/><path d="M96 46 L90 10 L66 30 Z" fill="#f0ad6c"/><path d="M31 36 L33 19 L46 30 Z" fill="#ffb3b3"/><path d="M89 36 L87 19 L74 30 Z" fill="#ffb3b3"/><path d="M100 80 q18 -4 12 -26" stroke="#f0ad6c" stroke-width="7" fill="none" stroke-linecap="round"/>',
  front:'<path d="M52 30 v8 M60 28 v10 M68 30 v8" stroke="#e08d4a" stroke-width="3" stroke-linecap="round"/><path d="M56 66 h8 l-4 5 z" fill="#ff7a8a"/><path d="M30 68 h14 M30 74 h14 M90 68 h-14 M90 74 h-14" stroke="#c98a55" stroke-width="2" stroke-linecap="round"/>'},
 kodi:{name:"Kodi",emoji:"🐸",kind:"katak hijau",desc:"Lompat dari satu anggaran ke anggaran lain, selalu hemat.",body:"#8fd16a",cheek:"#ff9fb0",feet:"#6fb84d",
  back:'<circle cx="42" cy="40" r="16" fill="#8fd16a"/><circle cx="78" cy="40" r="16" fill="#8fd16a"/><circle cx="43" cy="47" r="10" fill="#fff"/><circle cx="77" cy="47" r="10" fill="#fff"/>',
  front:'<ellipse cx="60" cy="86" rx="24" ry="14" fill="#c9eeae"/>'},
 cimi:{name:"Cimi",emoji:"🐥",kind:"anak ayam",desc:"Ceria, suka ngingetin jadwal kuliah pagi-pagi.",body:"#ffe066",cheek:"#ffb38a",feet:"#ff9f1c",
  back:'<path d="M56 26 q-6 -14 4 -16 M60 25 q2 -14 10 -12 M64 26 q8 -10 14 -4" stroke="#f5c400" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="17" cy="70" rx="9" ry="14" fill="#f5c400" transform="rotate(20 17 70)"/><ellipse cx="103" cy="70" rx="9" ry="14" fill="#f5c400" transform="rotate(-20 103 70)"/>',
  front:'<path d="M52 66 L60 60 L68 66 L60 74 Z" fill="#ff9f1c"/>'},
 mumu:{name:"Mumu",emoji:"🐮",kind:"sapi perah",desc:"Kalem, sabar, jago bikin laporan keuangan rapi.",body:"#fffaf2",cheek:"#ffb3c4",feet:"#8d6e63",outline:true,
  back:'<path d="M36 26 q-6 -14 4 -18 q-2 10 4 16z" fill="#e7cfa3"/><path d="M84 26 q6 -14 -4 -18 q2 10 -4 16z" fill="#e7cfa3"/><ellipse cx="16" cy="48" rx="12" ry="6" fill="#fffaf2" stroke="#e8dccb" stroke-width="2" transform="rotate(-20 16 48)"/><ellipse cx="104" cy="48" rx="12" ry="6" fill="#fffaf2" stroke="#e8dccb" stroke-width="2" transform="rotate(20 104 48)"/>',
  front:'<path d="M28 44 q10 -16 24 -8 q-2 14 -16 16 q-10 0 -8 -8z" fill="#8d6e63"/><ellipse cx="88" cy="96" rx="10" ry="6" fill="#8d6e63"/><ellipse cx="60" cy="80" rx="20" ry="13" fill="#ffc6d3"/><ellipse cx="53" cy="78" rx="3" ry="4" fill="#c2507a"/><ellipse cx="67" cy="78" rx="3" ry="4" fill="#c2507a"/>'},
 bubu:{name:"Bubu",emoji:"🐻",kind:"beruang madu",desc:"Suka ngemil, tapi selalu ingat sisa anggaran makan.",body:"#c98a55",cheek:"#ff9f8a",feet:"#a5683d",
  back:'<circle cx="28" cy="30" r="13" fill="#a5683d"/><circle cx="92" cy="30" r="13" fill="#a5683d"/><circle cx="28" cy="30" r="6.5" fill="#f2c79c"/><circle cx="92" cy="30" r="6.5" fill="#f2c79c"/>',
  front:'<ellipse cx="60" cy="76" rx="16" ry="12" fill="#f3d5b4"/><ellipse cx="60" cy="70" rx="5.5" ry="4" fill="#4a2e20"/>'},
 pandi:{name:"Pandi",emoji:"🐼",kind:"panda",desc:"Kalem kayak bambu, rajin cek saldo tiap Minggu.",body:"#ffffff",cheek:"#ffb3c4",feet:"#2b2b2b",outline:true,
  back:'<circle cx="28" cy="28" r="13" fill="#2b2b2b"/><circle cx="92" cy="28" r="13" fill="#2b2b2b"/>',
  front:'<ellipse cx="43" cy="54" rx="11" ry="13" fill="#2b2b2b" transform="rotate(25 43 54)"/><ellipse cx="77" cy="54" rx="11" ry="13" fill="#2b2b2b" transform="rotate(-25 77 54)"/><circle cx="44" cy="52" r="6.5" fill="#fff"/><circle cx="76" cy="52" r="6.5" fill="#fff"/><ellipse cx="60" cy="70" rx="5" ry="3.5" fill="#2b2b2b"/>'},
 kiki:{name:"Kiki",emoji:"🐰",kind:"kelinci putih",desc:"Lincah, hafal semua jadwal dan nggak pernah telat.",body:"#ffffff",cheek:"#ffa8bf",feet:"#f6d6e0",outline:true,
  back:'<ellipse cx="44" cy="22" rx="9" ry="20" fill="#fff" stroke="#e8dce2" stroke-width="2" transform="rotate(-10 44 22)"/><ellipse cx="76" cy="22" rx="9" ry="20" fill="#fff" stroke="#e8dce2" stroke-width="2" transform="rotate(10 76 22)"/><ellipse cx="44" cy="23" rx="4.5" ry="14" fill="#ffc1d3" transform="rotate(-10 44 23)"/><ellipse cx="76" cy="23" rx="4.5" ry="14" fill="#ffc1d3" transform="rotate(10 76 23)"/>',
  front:'<path d="M56 67 h8 l-4 4.5 z" fill="#ff8fab"/><rect x="57" y="78" width="6" height="5" rx="1.5" fill="#fff" stroke="#e8dce2"/>'},
 popo:{name:"Popo",emoji:"🐧",kind:"penguin",desc:"Tenang di cuaca apa pun, termasuk akhir bulan.",body:"#2f3e57",cheek:"#ff9fb2",feet:"#ff9f1c",
  back:'<ellipse cx="16" cy="72" rx="8" ry="16" fill="#26334a" transform="rotate(18 16 72)"/><ellipse cx="104" cy="72" rx="8" ry="16" fill="#26334a" transform="rotate(-18 104 72)"/>',
  front:'<ellipse cx="60" cy="70" rx="32" ry="31" fill="#ffffff"/><path d="M53 66 L60 61 L67 66 L60 71 Z" fill="#ff9f1c"/>'},
 rubi:{name:"Rubi",emoji:"🦊",kind:"rubah oranye",desc:"Cerdik cari promo, tapi tetap sesuai anggaran.",body:"#f28a3b",cheek:"#ff8f8f",feet:"#3b2a24",
  back:'<path d="M24 40 L22 8 L50 28 Z" fill="#e0742a"/><path d="M96 40 L98 8 L70 28 Z" fill="#e0742a"/><path d="M24 22 L22 8 L33 16 Z" fill="#3b2a24"/><path d="M96 22 L98 8 L87 16 Z" fill="#3b2a24"/><path d="M100 86 q22 -6 16 -32 q-6 10 -14 12z" fill="#e0742a"/><path d="M114 58 q2 -4 2 -4 q-6 10 -10 10z" fill="#fff"/>',
  front:'<path d="M26 66 Q40 90 60 92 Q80 90 94 66 Q80 76 60 76 Q40 76 26 66Z" fill="#fff4e8"/><ellipse cx="60" cy="72" rx="5" ry="3.6" fill="#3b2a24"/>'}};
/* ---------- karakter chibi (versi kartun, persetujuan pemilik wajah sudah diberikan) ---------- */
const HAIR="#2a1c18",SKIN="#f7d5bd",SKIN2="#ecc0a3";
const OUTFITS={
 vcap:{n:"Vina Kasual",e:"🧢",k:"topi denim & cardigan",d:"Siap jalan-jalan, tapi tetap ingat budget jajan.",cap:true,
  fill:"#f8f5ec",body:'<path d="M46 90 v28 M53 88 v30 M67 88 v30 M74 90 v28" stroke="#e5dfcf" stroke-width="2.2" stroke-dasharray="3 2"/><circle cx="60" cy="98" r="1.5" fill="#d8d0bc"/><circle cx="60" cy="106" r="1.5" fill="#d8d0bc"/><path d="M38 88 L74 118" stroke="#222226" stroke-width="5" stroke-linecap="round"/>'},
 vkantor:{n:"Vina Kantor",e:"👔",k:"kemeja garis-garis",d:"Rapi, teliti, laporan keuangan tutup tepat waktu.",
  fill:"#8f99ad",body:'<path d="M42 86 v32 M48 86 v32 M54 86 v32 M66 86 v32 M72 86 v32 M78 86 v32" stroke="#e3e8f2" stroke-width="2"/><path d="M50 87 L60 97 L70 87 Z" fill="#d6deee"/><path d="M53 89 q7 8 14 0" stroke="#e2bd62" stroke-width="1.1" fill="none"/><path d="M58 96 l2 -2 l2 2 l-2 2z" fill="#e8c76b"/>'},
 vorange:{n:"Vina Oranye",e:"🧡",k:"kaos oranye",d:"Semangat! Pengeluaran boros langsung ketahuan.",
  fill:"#f25a1c",body:'<circle cx="60" cy="104" r="7.5" fill="#c62828"/><circle cx="60" cy="104" r="4.6" fill="#fde5cc"/><path d="M56.5 104 q3.5 -4 7 0 q-3.5 3.5 -7 0z" fill="#c62828"/>'},
 vsantai:{n:"Vina Santai",e:"🖤",k:"kaos gelap",d:"Kalem di sofa, tapi saldo tetap dicek tiap minggu.",
  fill:"#363940",body:'<path d="M60 96 l2.6 5 l5.4 .8 l-4 3.6 l1 5.4 l-5 -2.6 l-5 2.6 l1 -5.4 l-4 -3.6 l5.4 -.8z" fill="#ffd23f"/>'},
 vkrl:{n:"Vina Komuter",e:"🚆",k:"kemeja putih, anak KRL",d:"Hafal jadwal kereta & jadwal kuliah, nggak pernah telat.",
  fill:"#fdfdf8",body:'<path d="M50 87 L60 97 L70 87 Z" fill="#ffffff" stroke="#e8e8df"/><path d="M70 102 q7 -5 9 3 M41 106 q5 -7 10 0" stroke="#2e7d4f" stroke-width="2.2" fill="none" stroke-linecap="round"/>'}};
let gUid=0;
function girlSVG(id,mood,size){const o=OUTFITS[id],u="g"+(++gUid);
  const H="#3f2a23",SK="#ffe0cc",SK2="#f7c9ad";
  const eye=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="5.6" ry="6.8" fill="#3a2430"/><ellipse cx="${x}" cy="${y+2.2}" rx="4.2" ry="3.8" fill="#7a4a58"/><circle cx="${x+1.8}" cy="${y-2.4}" r="2.1" fill="#fff"/><circle cx="${x-2}" cy="${y+2.6}" r="1" fill="#fff" opacity=".9"/>`;
  const lash=(x,y,d)=>`<path d="M${x+5*d} ${y-5} q${3*d} -2 ${4.5*d} -4.5 M${x+5.6*d} ${y-2} q${3*d} -1 ${4.5*d} -2.5" stroke="#3a2430" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const L=[46,66],R=[74,66];
  const eyes={happy:eye(...L)+eye(...R)+lash(...L,-1)+lash(...R,1),
    party:`<path d="M40 67 q6 -7 12 0 M68 67 q6 -7 12 0" stroke="#3a2430" stroke-width="3" fill="none" stroke-linecap="round"/>`+lash(46,69,-1)+lash(74,69,1),
    worried:eye(46,68)+eye(74,68)+`<path d="M39 56 l11 3 M81 56 l-11 3" stroke="${H}" stroke-width="2.2" stroke-linecap="round"/>`,
    think:eye(48,64)+eye(76,64)+lash(48,64,-1)+lash(76,64,1),
    sleep:`<path d="M40 67 q6 5 12 0 M68 67 q6 5 12 0" stroke="#3a2430" stroke-width="2.6" fill="none" stroke-linecap="round"/>`+lash(46,69,-1)+lash(74,69,1)}[mood];
  const mouth={happy:'<path d="M55 82 q2.5 3 5 0 q2.5 3 5 0" stroke="#c24d68" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    party:'<path d="M54 81 q6 5 12 0 z" fill="#c24d68"/><ellipse cx="62" cy="85" rx="3.4" ry="3" fill="#ff8aa3"/>',
    worried:'<path d="M55 85 q5 -4 10 0" stroke="#c24d68" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    think:'<ellipse cx="62" cy="83" rx="2.6" ry="2" fill="#d65f7b"/>',
    sleep:'<ellipse cx="60" cy="83" rx="2.2" ry="1.7" fill="#c24d68"/>'}[mood];
  const extra={worried:'<path d="M98 44 q4 8 0 12 q-4 -4 0 -12z" fill="#7cc7ff"/>',
    party:'<path d="M10 20 l4 8 l8 -2 l-6 6 l4 8 l-8 -4 l-6 6 l2 -8 l-8 -4 l8 -2z" fill="#ffd23f"/><path d="M104 18 l2 4 l4 1 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -1z" fill="#ff8fb5"/><circle cx="110" cy="40" r="3" fill="#33c38a"/>',
    think:'<circle cx="102" cy="26" r="4" fill="#d9c8f0"/><circle cx="110" cy="14" r="6" fill="#d9c8f0"/>',
    sleep:'<text x="96" y="30" font-size="15" font-weight="800" fill="#7c4dff" font-family="Nunito,sans-serif">z</text><text x="106" y="18" font-size="11" font-weight="800" fill="#7c4dff" font-family="Nunito,sans-serif">z</text>'}[mood]||"";
  const bangs=o.cap
   ?`<path d="M26 60 Q30 42 40 38 Q42 48 50 50 Q52 42 56 39 Q60 49 68 50 Q70 42 74 39 Q80 48 88 49 Q93 52 94 60 Q90 52 82 52 Q60 50 38 52 Q30 54 26 60Z" fill="${H}"/>`
   :`<path d="M24 62 Q20 22 60 20 Q100 22 96 62 Q92 50 85 45 Q82 53 74 55 Q75 46 70 40 Q64 52 54 53 Q57 44 52 39 Q45 51 35 53 Q30 55 24 62Z" fill="${H}"/><path d="M38 30 Q50 23 64 25" stroke="#fff" stroke-opacity=".4" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  const cap=o.cap?`<path d="M24 52 Q24 16 60 15 Q96 16 96 52 Q80 42 60 42 Q40 42 24 52Z" fill="#33405a" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"/><path d="M30 46 Q32 22 60 20 Q88 22 90 46" stroke="#d8c9a8" stroke-width="1.1" stroke-dasharray="2.4 2" fill="none"/><path d="M60 16 v26" stroke="#d8c9a8" stroke-width="1.1" stroke-dasharray="2.4 2"/><path d="M43 31 q17 -7 34 0" stroke="#f1ebdd" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="35" rx="6.5" ry="2.6" fill="#7d9bd3"/><path d="M28 50 Q62 39 102 51 Q104 57 96 58 Q64 48 32 55Z" fill="#28324a" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke"/>`:"";
  return `<svg class="pipi" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${o.n}">
   <defs><clipPath id="${u}"><ellipse cx="60" cy="102" rx="25" ry="15"/></clipPath>
   <linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#ffc2cf" stop-opacity="0"/><stop offset="1" stop-color="#ffb3c4" stop-opacity=".55"/></linearGradient></defs>
   <ellipse cx="60" cy="116" rx="30" ry="3.5" fill="rgba(0,0,0,.08)"/>
   <path d="M17 64 Q15 18 60 16 Q105 18 103 64 Q106 92 96 102 Q86 102 84 92 L36 92 Q34 102 24 102 Q14 92 17 64Z" fill="${H}" stroke="#fff" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke"/>
   <ellipse cx="60" cy="102" rx="25" ry="15" fill="none" stroke="#fff" stroke-width="3.2"/>
   <path d="M22 70 Q20 88 27 98 M98 70 Q100 88 93 98" stroke="#6b4a40" stroke-width="1.6" fill="none" stroke-linecap="round"/>
   <rect x="44" y="106" width="11" height="10" rx="5" fill="#5b4a46"/><rect x="65" y="106" width="11" height="10" rx="5" fill="#5b4a46"/>
   <g clip-path="url(#${u})"><rect x="30" y="86" width="60" height="32" fill="${o.fill}"/>${o.body}</g>
   <ellipse cx="60" cy="61" rx="37" ry="34" fill="${SK}"/>
   <path d="M30 34 Q18 52 20 74 Q21 90 29 98 Q35 99 35 93 Q30 80 32 66 Q33 54 42 44 Z" fill="${H}"/>
   <path d="M90 34 Q102 52 100 74 Q99 90 91 98 Q85 99 85 93 Q90 80 88 66 Q87 54 78 44 Z" fill="${H}"/>
   <path d="M27 60 Q24 76 28 90 M93 60 Q96 76 92 90" stroke="#6b4a40" stroke-width="1.4" fill="none" stroke-linecap="round"/>
   <circle cx="33" cy="86" r="2.3" fill="none" stroke="#e7b84c" stroke-width="1.6"/><circle cx="87" cy="86" r="2.3" fill="none" stroke="#e7b84c" stroke-width="1.6"/>
   ${bangs}${cap}
   <ellipse cx="37" cy="79" rx="7" ry="4.2" fill="#ff9fb2" opacity=".6"/><ellipse cx="83" cy="79" rx="7" ry="4.2" fill="#ff9fb2" opacity=".6"/>
   ${eyes}
   <circle cx="46" cy="67" r="12.5" fill="url(#${u}l)" stroke="#8b5a4a" stroke-width="1.9"/><circle cx="74" cy="67" r="12.5" fill="url(#${u}l)" stroke="#8b5a4a" stroke-width="1.9"/>
   <path d="M38 60 q3 -3 6 -3.5 M66 60 q3 -3 6 -3.5" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-linecap="round"/>
   <path d="M58.5 66 q1.5 -2 3 0" stroke="#8b5a4a" stroke-width="1.8" fill="none"/><path d="M33.5 65 L25 63 M86.5 65 L95 63" stroke="#8b5a4a" stroke-width="1.8"/>
   <circle cx="60" cy="76" r="1" fill="#e8a990"/>
   ${mouth}${extra}</svg>`}
for(const [k,o] of Object.entries(OUTFITS))CHARS[k]={name:o.n,emoji:o.e,kind:o.k,desc:o.d,girl:true};
/* ---------- karakter chibi "El" (versi kartun pemilik akun, dari fotonya sendiri) ----------
   Ciri yang dipertahankan: rambut hitam belah tengah agak panjang, kacamata kotak hitam
   dengan paku perak di ujung, pipi bulat, senyum tipis, gelang benang merah-putih. */
const BOYS={
 erusa:{n:"El Rusa",e:"🦌",k:"kaos hitam sablon rusa",d:"Jempol dulu, cek saldo kemudian. Calon juragan ternak.",
  fill:"#1f1f24",body:'<rect x="60" y="91" width="11" height="14" fill="#3d3a22"/><path d="M62 99 q3 -4 7 -2 q-1 4 -5 4z" fill="#d9822b"/><rect x="66" y="95" width="13" height="16" fill="#efe3c8"/><path d="M69 104 q2 -4 6 -3 l2 -3 l.6 3 q1 2 -1 4 q-3 2 -7 -1z" fill="#8a5a33"/>'},
 ebuku:{n:"El Valuasi",e:"📘",k:"kaos hijau tua & buku valuasi",d:"Nilai wajar dulu, baru belanja. DCF jalan terus.",
  fill:"#1d3b2c",body:'<path d="M42 92 h20 M44 97 h16" stroke="#e9c46a" stroke-width="2.4" stroke-linecap="round"/><circle cx="49" cy="106" r="5" fill="none" stroke="#e9c46a" stroke-width="2"/><path d="M53 104 l9 -4" stroke="#e9c46a" stroke-width="2" stroke-linecap="round"/>',
  over:'<g transform="rotate(-7 78 104)"><rect x="66" y="88" width="24" height="29" rx="2" fill="#d8bd8f" stroke="#7a5a35" stroke-width="1.6"/><rect x="66" y="88" width="4" height="29" fill="#b9975f"/><text x="79" y="100" font-size="6.5" font-weight="800" fill="#3b2a1a" text-anchor="middle" font-family="Nunito,sans-serif">DCF</text><path d="M73 104 h12 M73 108 h9" stroke="#7a5a35" stroke-width="1.3" stroke-linecap="round"/><rect x="72" y="111" width="14" height="3" rx="1.5" fill="#3f6b4f"/></g><circle cx="65" cy="104" r="4.2" fill="#e8b48c" stroke="#fff" stroke-width="1.4"/><circle cx="90" cy="99" r="4.2" fill="#e8b48c" stroke="#fff" stroke-width="1.4"/>'},
 erenang:{n:"El Renang",e:"🏊",k:"habis berenang, handuk di bahu",d:"Seger habis renang. Iuran kolam sudah masuk anggaran.",wet:true,
  fill:"#e8b48c",body:'<path d="M30 88 Q44 96 46 118 L36 118 Q34 100 26 94Z" fill="#6ec3e8"/><path d="M90 88 Q76 96 74 118 L84 118 Q86 100 94 94Z" fill="#6ec3e8"/><path d="M33 98 l8 -2 M35 106 l9 -2 M87 98 l-8 -2 M85 106 l-9 -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M52 98 q8 4 16 0" stroke="#d29a74" stroke-width="1.4" fill="none" stroke-linecap="round"/>'},
 ekaget:{n:"El Kaget",e:"😮",k:"kaos putih, lihat tagihan",d:"Kaget lihat tagihan PayLater. Untung sudah ada pengingat.",
  fill:"#f6f5f0",body:'<path d="M50 87 q10 9 20 0" stroke="#dcdad2" stroke-width="2.4" fill="none"/><path d="M36 96 q4 3 8 1 M84 96 q-4 3 -8 1" stroke="#dcdad2" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M58 104 q4 2 8 0" stroke="#e6e4dc" stroke-width="1.6" fill="none"/>'}};
let bUid=0;
function boySVG(id,mood,size){const o=BOYS[id],u="b"+(++bUid);
  const H="#1d1613",SK="#f3cba8",SK2="#e3b088",INK="#2a1d18";
  if(id==="ekaget"&&mood==="happy")mood="worried";
  const eye=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="4.4" ry="5.2" fill="${INK}"/><ellipse cx="${x}" cy="${y+1.8}" rx="3" ry="2.6" fill="#6b4632"/><circle cx="${x+1.5}" cy="${y-1.9}" r="1.7" fill="#fff"/><circle cx="${x-1.5}" cy="${y+2}" r=".8" fill="#fff" opacity=".9"/>`;
  const eyes={happy:eye(45,67)+eye(75,67),
    party:`<path d="M39 68 q6 -6 12 0 M69 68 q6 -6 12 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    worried:`<circle cx="45" cy="67" r="5.4" fill="#fff"/><circle cx="75" cy="67" r="5.4" fill="#fff"/><circle cx="45" cy="67" r="3" fill="${INK}"/><circle cx="75" cy="67" r="3" fill="${INK}"/><circle cx="46" cy="66" r="1" fill="#fff"/><circle cx="76" cy="66" r="1" fill="#fff"/>`,
    think:eye(47,65)+eye(77,65),
    sleep:`<path d="M39 68 q6 4 12 0 M69 68 q6 4 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`}[mood];
  const brow={happy:'<path d="M37 53 q8 -3 15 0 M68 53 q7 -3 15 0"',party:'<path d="M37 52 q8 -4 15 -1 M68 51 q7 -3 15 1"',
    worried:'<path d="M37 51 q8 -5 15 -3 M68 48 q7 -2 15 3"',think:'<path d="M38 52 q8 -2 15 1 M69 50 q7 -3 15 0"',sleep:'<path d="M37 54 q8 -2 15 0 M68 54 q7 -2 15 0"'}[mood]+` stroke="${H}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  const mouth={happy:'<path d="M53 84 q7 4.5 14 -1" stroke="#9c4b3c" stroke-width="2.3" fill="none" stroke-linecap="round"/>',
    party:'<path d="M50 81 q10 13 20 0 z" fill="#7a2f2a"/><path d="M51.5 81.6 h17 q-.4 3 -1.8 3.6 h-13.4 q-1.4 -.6 -1.8 -3.6z" fill="#fff"/><ellipse cx="60" cy="88" rx="4" ry="2.2" fill="#e87a7a"/>',
    worried:'<ellipse cx="60" cy="86" rx="4.2" ry="5" fill="#7a2f2a"/><ellipse cx="60" cy="88.5" rx="2.6" ry="1.8" fill="#e87a7a"/>',
    think:'<path d="M56 85 q5 -2 9 1" stroke="#9c4b3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    sleep:'<ellipse cx="60" cy="85" rx="2.2" ry="1.7" fill="#9c4b3c"/>'}[mood];
  const extra={worried:'<path d="M99 42 q4 8 0 12 q-4 -4 0 -12z" fill="#7cc7ff"/><path d="M14 30 v10 M14 45 v1" stroke="#ff8a3d" stroke-width="3.4" stroke-linecap="round"/>',
    party:'<path d="M10 20 l4 8 l8 -2 l-6 6 l4 8 l-8 -4 l-6 6 l2 -8 l-8 -4 l8 -2z" fill="#ffd23f"/><path d="M104 18 l2 4 l4 1 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -1z" fill="#7cc7ff"/><circle cx="110" cy="40" r="3" fill="#33c38a"/>',
    think:'<circle cx="102" cy="26" r="4" fill="#cfe3d6"/><circle cx="110" cy="14" r="6" fill="#cfe3d6"/>',
    sleep:'<text x="96" y="30" font-size="15" font-weight="800" fill="#3f6b4f" font-family="Nunito,sans-serif">z</text><text x="106" y="18" font-size="11" font-weight="800" fill="#3f6b4f" font-family="Nunito,sans-serif">z</text>'}[mood]||"";
  // jempol (pose khas di foto) di sisi kiri, plus gelang benang merah-putih
  const thumb=o.over?"":`<g><path d="M24 100 q-2 -12 4 -14 q3 -1 3 4 l-1 5 h6 q4 0 3 5 l-1 6 q-1 4 -6 4 h-6 q-3 0 -3 -4z" fill="${SK}" stroke="#fff" stroke-width="1.8" paint-order="stroke"/><path d="M23 112 q7 3 14 0" stroke="#e53935" stroke-width="2.4" fill="none"/><path d="M23 112 q7 3 14 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-dasharray="2.2 2.2"/></g>`;
  const wet=o.wet?'<path d="M30 40 q2 4 0 6 q-2 -2 0 -6z M92 44 q2 4 0 6 q-2 -2 0 -6z M60 14 q2 4 0 6 q-2 -2 0 -6z" fill="#7cc7ff"/>':"";
  const fringe=o.wet
   ?`<path d="M22 64 Q18 24 60 20 Q102 24 98 64 Q95 54 90 50 L88 58 Q84 48 78 44 L76 54 Q70 44 64 42 L62 52 Q56 42 50 44 L46 54 Q42 46 36 48 L32 58 Q28 54 22 64Z" fill="${H}"/>`
   :`<path d="M21 66 Q17 24 60 20 Q103 24 99 66 Q96 54 89 47 Q86 40 76 37 Q71 47 61 50 Q65 41 60 33 Q52 46 37 50 Q27 55 21 66Z" fill="${H}"/><path d="M60 26 q-8 12 -3 24" stroke="${H}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 30 Q52 23 66 25" stroke="#fff" stroke-opacity=".35" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  return `<svg class="pipi" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${o.n}">
   <defs><clipPath id="${u}"><ellipse cx="60" cy="103" rx="27" ry="15"/></clipPath>
   <linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="#cfe6ff" stop-opacity="0"/><stop offset="1" stop-color="#bcdcff" stop-opacity=".45"/></linearGradient></defs>
   <ellipse cx="60" cy="116" rx="31" ry="3.5" fill="rgba(0,0,0,.08)"/>
   <rect x="44" y="107" width="12" height="9" rx="4.5" fill="#3a3a44"/><rect x="64" y="107" width="12" height="9" rx="4.5" fill="#3a3a44"/>
   <ellipse cx="60" cy="103" rx="27" ry="15" fill="none" stroke="#fff" stroke-width="3.2"/>
   <g clip-path="url(#${u})"><rect x="30" y="86" width="60" height="34" fill="${o.fill}"/>${o.body}</g>
   <path d="M19 66 Q15 18 60 16 Q105 18 101 66 Q99 74 94 76 L26 76 Q21 74 19 66Z" fill="${H}" stroke="#fff" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke"/>
   <ellipse cx="22" cy="69" rx="6" ry="7.5" fill="${SK2}" stroke="#fff" stroke-width="2.4" paint-order="stroke"/><ellipse cx="98" cy="69" rx="6" ry="7.5" fill="${SK2}" stroke="#fff" stroke-width="2.4" paint-order="stroke"/>
   <ellipse cx="60" cy="63" rx="37" ry="33" fill="${SK}"/>
   <path d="M26 44 Q20 56 24 72 Q27 66 28 58 Q30 50 36 46Z" fill="${H}"/><path d="M94 44 Q100 56 96 72 Q93 66 92 58 Q90 50 84 46Z" fill="${H}"/>
   ${fringe}${wet}
   <ellipse cx="36" cy="80" rx="6.5" ry="3.6" fill="#f08f7a" opacity=".4"/><ellipse cx="84" cy="80" rx="6.5" ry="3.6" fill="#f08f7a" opacity=".4"/>
   ${brow}${eyes}
   <rect x="32" y="57" width="26" height="20" rx="4.5" fill="url(#${u}l)" stroke="#141414" stroke-width="3.2"/><rect x="62" y="57" width="26" height="20" rx="4.5" fill="url(#${u}l)" stroke="#141414" stroke-width="3.2"/>
   <path d="M58 63 q2 -2.4 4 0" stroke="#141414" stroke-width="2.8" fill="none"/><path d="M32 61 L23 59 M88 61 L97 59" stroke="#141414" stroke-width="3"/>
   <circle cx="35.5" cy="60" r="1.1" fill="#d9d9d9"/><circle cx="84.5" cy="60" r="1.1" fill="#d9d9d9"/>
   <path d="M36 61 q3 -2.6 6 -2.8 M66 61 q3 -2.6 6 -2.8" stroke="#fff" stroke-opacity=".75" stroke-width="1.6" fill="none" stroke-linecap="round"/>
   <path d="M57 78 q3 2.4 6 0" stroke="#c98a68" stroke-width="2" fill="none" stroke-linecap="round"/>
   ${mouth}${o.over||""}${thumb}${extra}</svg>`}
for(const [k,o] of Object.entries(BOYS))CHARS[k]={name:o.n,emoji:o.e,kind:o.k,desc:o.d,boy:true};
/* ---------- stiker couple Vina & El (tier Mitos, di atas Legendaris) ---------- */
const COUPLES={
 cpkencan:{n:"Kencan Hemat",e:"💞",v:["vcap","happy"],b:["erusa","happy"],bg:["#ffd6e7","#ffe9c7"],deco:"heart"},
 cpselfie:{n:"Selfie Kaget",e:"🤳",v:["vorange","think"],b:["ekaget","worried"],bg:["#1f2a44","#3b4a6b"],deco:"night"},
 cptutup:{n:"Tutup Buku Bareng",e:"📒",v:["vkantor","party"],b:["ebuku","party"],bg:["#e8e2ff","#dff3e6"],deco:"spark"},
 cpkrl:{n:"Pulang Bareng KRL",e:"🚆",v:["vkrl","sleep"],b:["erusa","sleep"],bg:["#fde2ea","#e3ecf9"],deco:"train"},
 cpcocok:{n:"Saldo Cocok!",e:"💖",v:["vsantai","party"],b:["erenang","party"],bg:["#ffe1f0","#e0f2ff"],deco:"coin"}};
let cUid=0;
function coupleSVG(id,size,mood){const c=id==="vnel"?{n:"Vina & El",v:["vcap",mood||"happy"],b:["erusa",mood||"happy"],nobg:true,deco:mood==="party"?"heart":""}:COUPLES[id],u="c"+(++cUid);
  const put=(svg,x,y,s)=>svg.replace(/<svg class="pipi" width="\d+" height="\d+"/,`<svg x="${x}" y="${y}" width="${s}" height="${s}"`);
  const heart=(x,y,s,col)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 4c-3-3-7-1-7 3c0 4 7 8 7 8s7-4 7-8c0-4-4-6-7-3z" fill="${col}" stroke="#fff" stroke-width="1.2"/>`;
  const deco={heart:heart(60,14,1.5,"#ff4d7e")+heart(20,22,.8,"#ff8fb5")+heart(100,20,.8,"#ff8fb5"),
   night:'<circle cx="98" cy="22" r="9" fill="#ffe9a8"/><circle cx="94" cy="19" r="8" fill="#2a3757"/><circle cx="22" cy="18" r="1.6" fill="#fff"/><circle cx="40" cy="10" r="1.2" fill="#fff"/><circle cx="70" cy="14" r="1.4" fill="#fff"/>'+heart(60,18,1.1,"#ff6f91"),
   spark:'<path d="M60 6 l3 7 l7 1 l-5 5 l1.5 7 l-6.5 -3.5 l-6.5 3.5 l1.5 -7 l-5 -5 l7 -1z" fill="#ffd23f" stroke="#fff" stroke-width="1"/>'+heart(24,20,.8,"#7c4dff")+heart(96,20,.8,"#2f6b4a"),
   train:'<rect x="14" y="10" width="92" height="22" rx="8" fill="#fff" opacity=".85"/><rect x="20" y="15" width="16" height="10" rx="2" fill="#bcd6f5"/><rect x="40" y="15" width="16" height="10" rx="2" fill="#bcd6f5"/><rect x="64" y="15" width="16" height="10" rx="2" fill="#bcd6f5"/><rect x="84" y="15" width="16" height="10" rx="2" fill="#bcd6f5"/><path d="M14 28 h92" stroke="#e5484d" stroke-width="2.4"/>',
   coin:'<circle cx="60" cy="18" r="10" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/><text x="60" y="22.5" font-size="11" font-weight="900" text-anchor="middle" fill="#a06d00" font-family="Nunito,sans-serif">Rp</text>'+heart(24,18,.9,"#ff4d7e")+heart(96,18,.9,"#ff4d7e")}[c.deco]||"";
  return `<svg class="pipi couple" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${c.n}">
   ${c.bg?`<defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg[0]}"/><stop offset="1" stop-color="${c.bg[1]}"/></linearGradient></defs>`:""}
   ${c.nobg?"":`<rect x="2" y="2" width="116" height="116" rx="26" fill="url(#${u})"/>`}
   ${deco}${put(boySVG(c.b[0],c.b[1],70),50,40,70)}${put(girlSVG(c.v[0],c.v[1],70),0,40,70)}</svg>`}
window.COUPLES=COUPLES;
CHARS.vnel={name:"Vina & El",emoji:"💑",kind:"tema couple",desc:"Berdua jagain keuangan bareng. Satu jajan, satu ngingetin anggaran.",couple:true};

const charKey=()=>"bbp_char_"+(document.getElementById("who")?.textContent||"").split(" ")[0];
/* karakter manusia (Vina, El, couple) khusus pasangan; anggota lain selalu dapat hewan */
const HUMAN=id=>/^(v[a-z]|e[a-z]|cp)/.test(id||"");
const npView=()=>document.documentElement.classList.contains("np");
function charId0(){const p=window.PREFS?.char;if(p&&CHARS[p])return p;try{const l=localStorage.getItem(charKey());if(l&&CHARS[l])return l}catch(e){}return "pipi"}
function charId(){const c=charId0();return npView()&&HUMAN(c)?"pipi":c}
const C=()=>CHARS[charId()];
async function setChar(id){try{localStorage.setItem(charKey(),id)}catch(e){}window.PREFS={...(window.PREFS||{}),char:id};
  document.documentElement.dataset.char=id;
  try{if(col)await col.doc("prefs").set(window.PREFS)}catch(e){}render()}
function pipi(mood="happy",size=64,id){const cid=id||charId();if(cid==="vnel")return coupleSVG("vnel",size,mood);if(COUPLES[cid])return coupleSVG(cid,size);if(OUTFITS[cid])return girlSVG(cid,mood,size);if(BOYS[cid])return boySVG(cid,mood,size);const c=CHARS[cid];
  const eyes={happy:'<circle cx="44" cy="52" r="5" fill="#2d2340"/><circle cx="76" cy="52" r="5" fill="#2d2340"/><circle cx="45.5" cy="50.5" r="1.6" fill="#fff"/><circle cx="77.5" cy="50.5" r="1.6" fill="#fff"/>',
    worried:'<circle cx="44" cy="54" r="5" fill="#2d2340"/><circle cx="76" cy="54" r="5" fill="#2d2340"/><path d="M36 42 l14 5 M84 42 l-14 5" stroke="#2d2340" stroke-width="3" stroke-linecap="round"/>',
    party:'<path d="M38 53 q6 -8 12 0 M70 53 q6 -8 12 0" stroke="#2d2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    think:'<circle cx="46" cy="50" r="5" fill="#2d2340"/><circle cx="78" cy="50" r="5" fill="#2d2340"/>',
    sleep:'<path d="M38 54 q6 4 12 0 M70 54 q6 4 12 0" stroke="#2d2340" stroke-width="3" fill="none" stroke-linecap="round"/>'}[mood];
  const my=id==="mumu"||(!id&&charId()==="mumu")?6:0;
  const mouth={happy:`<path d="M54 ${84+my} q6 6 12 0" stroke="#2d2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    worried:`<path d="M53 ${88+my} q7 -6 14 0" stroke="#2d2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    party:`<path d="M52 ${82+my} q8 12 16 0 z" fill="#2d2340"/>`,
    think:`<path d="M55 ${86+my} h10" stroke="#2d2340" stroke-width="3" stroke-linecap="round"/>`,
    sleep:`<ellipse cx="60" cy="${86+my}" rx="4" ry="3" fill="#2d2340"/>`}[mood];
  const extra={worried:'<path d="M98 34 q4 8 0 12 q-4 -4 0 -12z" fill="#7cc7ff"/>',
    party:'<path d="M10 22 l4 8 l8 -2 l-6 6 l4 8 l-8 -4 l-6 6 l2 -8 l-8 -4 l8 -2z" fill="#ffd23f"/><circle cx="104" cy="20" r="4" fill="#7c4dff"/><circle cx="110" cy="40" r="3" fill="#33c38a"/>',
    think:'<circle cx="100" cy="24" r="4" fill="#d9c8f0"/><circle cx="108" cy="12" r="6" fill="#d9c8f0"/>',
    sleep:'<text x="92" y="28" font-size="16" font-weight="800" fill="#7c4dff" font-family="Nunito,sans-serif">z</text><text x="104" y="16" font-size="12" font-weight="800" fill="#7c4dff" font-family="Nunito,sans-serif">z</text>'}[mood]||"";
  const outline=c.outline?' stroke="#e8dccb" stroke-width="2"':"";
  return `<svg class="pipi" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${c.name}">
   <ellipse cx="60" cy="112" rx="34" ry="5" fill="rgba(0,0,0,.08)"/>
   <rect x="34" y="96" width="12" height="14" rx="5" fill="${c.feet}"/><rect x="74" y="96" width="12" height="14" rx="5" fill="${c.feet}"/>
   ${c.back}<ellipse cx="60" cy="64" rx="44" ry="40" fill="${c.body}"${outline}/>${c===CHARS.kodi?'<circle cx="43" cy="47" r="10" fill="#fff"/><circle cx="77" cy="47" r="10" fill="#fff"/>':""}
   <ellipse cx="32" cy="72" rx="7" ry="4.5" fill="${c.cheek}" opacity=".8"/><ellipse cx="88" cy="72" rx="7" ry="4.5" fill="${c.cheek}" opacity=".8"/>
   ${c.front}${eyes}${mouth}${extra}</svg>`}
window.pipi=pipi;window.setChar=setChar;window.CHARS=CHARS;
function charPicker(){return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">${Object.entries(CHARS).map(([k,c])=>
  `<button class="charpick${k===charId()?" on":""}" data-char="${k}">${pipi(k===charId()?"party":"happy",72,k)}<b>${c.name} ${c.emoji}</b><span>${c.kind}</span><small>${c.desc}</small></button>`).join("")}</div>`}
function wirePicker(root){root.querySelectorAll("[data-char]").forEach(b=>b.onclick=()=>setChar(b.dataset.char))}


/* ---------- status pengguna ---------- */
function setupState(){
  const anyOpen=Object.values(accState).some(a=>num(a?.opening));
  const anyReal=Object.values(accState).some(a=>a&&a.real!=null);
  const m=today().slice(0,7),hasBud=!!budgetFor(m);
  const hasTx=JE.some(j=>j.date!==OPEN_DATE);
  return [
    {k:"open",t:"Isi saldo awal rekening",done:anyOpen,r:"recon"},
    {k:"real",t:"Cocokkan saldo real",done:anyReal,r:"recon"},
    {k:"bud",t:"Buat anggaran bulan ini",done:hasBud,r:"budget"},
    {k:"tx",t:"Catat transaksi pertama (coba foto struk!)",done:hasTx,r:"input"},
    {k:"cal",t:"Tulis jurnal harian pertama (opsional)",done:Object.keys(window.DIARY||{}).length>0,r:"diary"}]}
const greet=()=>{const h=new Date(Date.now()+7*3600e3).getUTCHours();return h<11?"Selamat pagi":h<15?"Selamat siang":h<18?"Selamat sore":"Selamat malam"};
function mood(){
  const bad=reconRows().filter(r=>r.bad);
  const m=today().slice(0,7),bud=budgetFor(m),B=balsAll(mEnd(m),m+"-01");
  const over=bud?Object.entries(bud.lines).filter(([c,b])=>typeOf(c)==="X"&&nb(B,c)>num(b)).map(([c])=>acctName(c)):[];
  if(bad.length)return {m:"worried",t:"Waduh, ada saldo yang nggak cocok!",d:`${bad.map(r=>r.n).join(", ")} beda dengan saldo real. Yuk cek transaksi yang kelewat atau biaya admin.`,sad:true,go:"recon",btn:"Cek sekarang"};
  if(over.length)return {m:"worried",t:"Ada anggaran yang jebol nih",d:`Lewat anggaran: ${over.slice(0,3).join(", ")}${over.length>3?"…":""}. Rem dikit ya!`,sad:true,go:"budget",btn:"Lihat anggaran"};
  const st=setupState();if(st.some(s=>!s.done&&s.k!=="cal"))return {m:"think",t:`${greet()}! Aku ${C().name} ${C().emoji}`,d:"Aku bantu jaga keuanganmu. Selesaikan langkah awal di bawah, atau ikuti tur singkat dulu.",tour:true};
  const allOk=reconRows().filter(r=>r.real!=null).length>0;
  return {m:allOk?"party":"happy",t:`${greet()}!`,d:allOk?"Semua saldo cocok dan anggaran aman. Mantap, pertahankan! 🎉":"Jangan lupa cocokkan saldo real minggu ini ya."}}

/* ---------- dekorasi tiap render ---------- */
const _render=render;
render=function(){_render();try{decorate()}catch(e){console.warn(e)}};
function decorate(){
  document.documentElement.dataset.char=charId();
  // tombol mode di header
  if(!document.getElementById("themeBtn")){const b=document.createElement("button");b.id="themeBtn";b.className="sm";
    b.style.cssText="background:none;color:var(--hdrInk);border-color:rgba(255,255,255,.35)";
    b.onclick=()=>{applyTheme(getTheme()==="fun"?"pro":"fun");render()};
    document.getElementById("logout")?.before(b)}
  document.getElementById("themeBtn").textContent=getTheme()==="fun"?"Pro":"Lucu";document.getElementById("themeBtn").title=getTheme()==="fun"?"Ganti ke mode profesional":"Ganti ke mode lucu";
  const v=document.getElementById("view");
  if(route==="dash"){
    const md=mood(),st=setupState(),left=st.filter(s=>!s.done);
    const card=document.createElement("div");card.className="pipi-card"+(md.sad?" sad":"");
    card.innerHTML=`${pipi(md.m,72)}<div class="bubble"><b>${esc(md.t)}</b><div>${esc(md.d)}</div>
      ${left.length?`<ul class="chk">${st.map(s=>`<li class="${s.done?"done":""}"><span class="bx">${s.done?"✓":""}</span><span>${esc(s.t)}</span>${s.done?"":`<button class="sm" data-gor="${s.r}">Buka</button>`}</li>`).join("")}</ul>`:""}
      <div class="acts" style="margin-top:8px">${md.btn?`<button class="sm pri" data-gor="${md.go}">${esc(md.btn)}</button>`:""}${md.tour||left.length?'<button class="sm" id="pipiTour">Tur singkat</button>':""}<button class="sm" id="pipiChange">Ganti teman</button></div></div>`;
    v.querySelector(".ph")?.after(card);
    card.querySelectorAll("[data-gor]").forEach(b=>b.onclick=()=>go(b.dataset.gor));
    card.querySelector("#pipiChange").onclick=()=>go("guide");
    card.querySelector("#pipiTour")&&(card.querySelector("#pipiTour").onclick=startTour);
    if(col&&!seenTour()&&!tourOn)setTimeout(()=>{if(route==="dash"&&!seenTour()&&!tourOn)startTour()},600)}
  // empty state lucu
  v.querySelectorAll(".rb .crumb, .rb.flush > .crumb").forEach(el=>{const t=el.textContent.trim();
    if(/^(Tidak ada|Belum ada|Kosong)/.test(t)&&!el.closest(".pipi-empty")){const w=document.createElement("div");w.className="pipi-empty";
      w.innerHTML=pipi("sleep",40);el.replaceWith(w);w.appendChild(el);el.style.padding="0"}});
}
/* login lucu */
const _showLogin=showLogin;
showLogin=function(msg){_showLogin(msg);const box=document.querySelector("#login .box > div:nth-child(2)");
  if(box&&!box.querySelector(".pipi"))box.insertAdjacentHTML("afterbegin",`<div style="display:flex;justify-content:center;margin-bottom:6px">${pipi(msg?"worried":"happy",80)}</div>`)};

/* ---------- TUR INTERAKTIF ---------- */
const STEPS=[
 {r:"dash",t:"Halo, aku {nama}! {emoji}",d:"Aku teman penjaga keuangan & jadwalmu. Pilih dulu siapa yang mau menemanimu — bisa diganti kapan saja di Bantuan.",m:"party",pick:true},
 {r:"dash",sel:".tiles",t:"Ringkasan keuangan",d:"Total kas & bank, kekayaan bersih, pendapatan, beban, dan surplus bulan ini. Kotak jadi merah kalau ada yang bahaya.",m:"happy"},
 {r:"recon",sel:".region",t:"Langkah pertama: saldo awal",d:"Isi Saldo awal tiap rekening sesuai aplikasi bank hari ini. Lalu rutin isi Saldo real tiap minggu. Kalau beda, barisnya MERAH — tanda ada transaksi yang kelewat.",m:"think"},
 {r:"input",sel:"#drop",t:"Catat pakai foto 📸",d:"Foto struk atau screenshot m-banking/OVO. Aku baca otomatis, kamu cek pratinjau jurnalnya, lalu Posting. Bisa juga isi manual.",m:"happy"},
 {r:"journal",sel:".msg",t:"Salah input? Tenang",d:"Jurnal nggak dihapus — pakai Reverse (batalkan lalu input ulang) atau Reklas (pindah akun). Semua ada jejaknya, seperti di perusahaan.",m:"think"},
 {r:"budget",sel:".tiles",t:"Anggaran bulanan",d:"Tekan Ubah anggaran, isi gaji dan rencana tiap pos (kost, listrik, makan…). Aku kasih peringatan kuning/merah kalau mulai jebol.",m:"happy"},
 {r:"fs",sel:".tabs",t:"Laporan keuangan",d:"Laba Rugi, Neraca, dan Arus Kas otomatis dari jurnalmu. Bisa dicetak / disimpan PDF.",m:"party"},
 {r:"today",sel:".tiles",t:"📔 Jurnal Harian & Kalender",d:"Tombol 📔 Jurnal Harian di atas membuka sisi harian: agenda Hari Ini, Kalender (isi jadwal kuliah/shift sekali per semester), dan jurnal mood & kegiatanmu.",m:"happy"},
 {r:"quest",sel:".tiles",t:"🎯 Misi & koleksi stiker",d:"Selesaikan misi harian, mingguan, dan achievement untuk dapat stiker karakter. Legendaris: stiker Vina & El. Paling langka: 5 stiker couple (Mitos)! Tombol 🎯 di atas menandai hadiah yang siap diklaim.",m:"party"},
 {r:"dash",sel:".pipi-card",t:"Siap mulai! 🎉",d:"Ikuti daftar langkah awal di kartu ini. Rutinitas emas: foto tiap transaksi, cek saldo real tiap minggu, tutup periode + backup tiap akhir bulan.",m:"party"}];
let tourOn=false,ti=0,dimEl,boxEl;
const seenKey=()=>"bbp_tour_"+(document.getElementById("who")?.textContent||"").split(" ")[0];
const seenTour=()=>{try{return localStorage.getItem(seenKey())==="1"}catch(e){return true}};
function startTour(){tourOn=true;ti=0;document.getElementById("nav")?.classList.remove("open");
  dimEl=document.createElement("div");dimEl.className="tour-dim none";boxEl=document.createElement("div");boxEl.className="tour-box";
  document.body.append(dimEl,boxEl);showStep()}
function endTour(){tourOn=false;dimEl?.remove();boxEl?.remove();try{localStorage.setItem(seenKey(),"1")}catch(e){}if(route!=="dash")go("dash");else render()}
function showStep(){const s=STEPS[ti];if(route!==s.r)go(s.r);
  setTimeout(()=>{const el=s.sel?document.querySelector("#view "+s.sel.split(",").join(", #view ")):null;
    if(el){el.scrollIntoView({block:"center",behavior:"instant"});}
    setTimeout(()=>place(el),60)},80);
  const tt=s.t.replace("{nama}",C().name).replace("{emoji}",C().emoji);
  boxEl.innerHTML=`${pipi(s.m,56)}<div style="flex:1;min-width:0"><h4>${tt}</h4><p>${s.d}</p>${s.pick?`<div class="tpick" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">${Object.entries(CHARS).map(([k,c])=>`<button class="sm${k===charId()?" pri":""}" data-tc="${k}">${c.emoji} ${c.name}</button>`).join("")}</div>`:""}<div class="nav"><span class="dots">${ti+1} / ${STEPS.length}</span>
    ${ti>0?'<button class="sm" id="tPrev">Kembali</button>':'<button class="sm" id="tSkip">Lewati</button>'}<button class="sm pri" id="tNext">${ti===STEPS.length-1?"Selesai":"Lanjut"}</button></div></div>`;
  boxEl.querySelectorAll("[data-tc]").forEach(b=>b.onclick=async()=>{await setChar(b.dataset.tc);showStep()});
  boxEl.querySelector("#tNext").onclick=()=>{if(ti===STEPS.length-1)endTour();else{ti++;showStep()}};
  boxEl.querySelector("#tPrev")&&(boxEl.querySelector("#tPrev").onclick=()=>{ti--;showStep()});
  boxEl.querySelector("#tSkip")&&(boxEl.querySelector("#tSkip").onclick=endTour)}
function place(el){if(!tourOn)return;const vw=innerWidth,vh=innerHeight,bw=boxEl.offsetWidth,bh=boxEl.offsetHeight;
  if(!el){dimEl.className="tour-dim none";boxEl.style.left=(vw-bw)/2+"px";boxEl.style.top=Math.max(12,(vh-bh)/2)+"px";return}
  const r=el.getBoundingClientRect(),p=6,h=Math.min(r.height,vh*0.45);
  dimEl.className="tour-dim";Object.assign(dimEl.style,{left:r.left-p+"px",top:r.top-p+"px",width:r.width+p*2+"px",height:h+p*2+"px"});
  let top=r.top+h+p+12;if(top+bh>vh-12)top=Math.max(12,r.top-p-bh-12);if(top<12||vw<600)top=vh-bh-12;
  boxEl.style.top=top+"px";boxEl.style.left=Math.min(Math.max(12,r.left),vw-bw-12)+"px"}
addEventListener("resize",()=>{if(tourOn)showStep()});
addEventListener("keydown",e=>{if(tourOn&&e.key==="Escape")endTour()});
window.startTour=startTour;

/* ---------- KARAKTER NGINTIP ---------- */
const peekCss=document.createElement("style");peekCss.textContent=`
.peek{position:fixed;z-index:150;pointer-events:none}
.peek .who{pointer-events:auto;cursor:pointer;transition:transform .6s cubic-bezier(.34,1.56,.64,1);display:block;position:relative}
.peek .hand{position:absolute;width:16px;height:12px;border-radius:8px;background:var(--hand,#ffe0cc);border:2px solid #fff;top:6px}
.peek .bub{pointer-events:auto;position:absolute;background:var(--card);color:var(--ink);border:2px solid var(--acc);border-radius:16px;padding:9px 12px;font-size:13px;line-height:1.4;width:max-content;max-width:min(240px,70vw);box-shadow:0 6px 20px rgba(0,0,0,.18);opacity:0;transform:scale(.8);transition:all .3s .5s;cursor:pointer}
.peek .bub b{display:block;font-size:13.5px;margin-bottom:2px}
.peek .bub small{display:block;color:var(--acc);font-weight:700;margin-top:4px}
.peek.show .bub{opacity:1;transform:none}
.peek.b{bottom:0}.peek.b .who{transform:translateY(100%)}.peek.b.show .who{transform:translateY(38%)}
.peek.b .bub{bottom:calc(62% + 10px)}
.peek.bl{left:18px}.peek.bl .bub{left:40px}.peek.br{right:18px}.peek.br .bub{right:40px}
.peek.r{right:0;top:42%}.peek.r .who{transform:translateX(100%) rotate(-90deg)}.peek.r.show .who{transform:translateX(36%) rotate(-90deg)}
.peek.r .bub{right:calc(64% + 6px);top:6px}
@media (prefers-reduced-motion:reduce){.peek .who,.peek .bub{transition:none}}
html:not(.fun) .peek{display:none}`;document.head.appendChild(peekCss);
const peekKey=()=>"bbp_peek_"+(document.getElementById("who")?.textContent||"").split(" ")[0];
function peekMin(){try{const v=localStorage.getItem(peekKey());return v===null?3:+v}catch(e){return 3}}
function peekTips(){
  const out=[],c=C();
  try{
    const bad=reconRows().filter(r=>r.bad);
    if(bad.length)out.push({t:"Psst… saldonya beda!",d:`${bad[0].n} nggak cocok sama saldo real. Yuk cek.`,r:"recon",m:"worried",w:5});
    const m=today().slice(0,7),bud=budgetFor(m),B=balsAll(mEnd(m),m+"-01");
    if(bud){for(const [k,b] of Object.entries(bud.lines)){if(typeOf(k)!=="X"||!num(b))continue;const a=nb(B,k),p=a/num(b);
      if(p>1)out.push({t:"Anggaran jebol 😱",d:`${acctName(k)} sudah ${Math.round(p*100)}% dari anggaran (lewat ${rp(a-num(b))}).`,r:"budget",m:"worried",w:4});
      else if(p===1)out.push({t:"Pos ini sudah habis",d:`Anggaran ${acctName(k)} terpakai penuh. Tahan dulu ya sampai bulan depan.`,r:"budget",m:"think",w:3});
      else if(p>=.8)out.push({t:"Hati-hati ya",d:`${acctName(k)} tinggal ${rp(num(b)-a)} lagi bulan ini.`,r:"budget",m:"think",w:3})}}
    else out.push({t:"Belum ada anggaran",d:"Bikin anggaran bulan ini yuk, biar aku bisa jagain.",r:"budget",m:"think",w:3});
    const td=today(),last=JE.filter(j=>j.date!==OPEN_DATE).slice(-1)[0];
    if(!JE.some(j=>j.date===td))out.push({t:"Udah jajan hari ini?",d:"Jangan lupa foto struknya biar langsung tercatat 📸",r:"input",m:"happy",w:2});
    if(last&&last.date<addD(td,-3))out.push({t:"Kangen dicatat 🥺",d:`Transaksi terakhir tanggal ${last.date}. Ada yang kelewat?`,r:"input",m:"worried",w:3});
    const f=window.BILLS;if(f&&f.items){const d=+td.slice(8);for(const it of f.items){const due=it.day===-1?+mEnd(m).slice(8):+it.day,left=due-d;
      if(left>=0&&left<=3)out.push({t:left?`H-${left} bayar ${it.n}`:`Hari ini bayar ${it.n}!`,d:it.amt?`Siapkan ${rp(it.amt)} ya.`:"Jangan sampai telat ya.",r:"sched",m:left?"think":"worried",w:5})}}
    if(new Date(Date.now()+7*3600e3).getUTCHours()>=19&&!(window.DIARY||{})[today()])out.push({t:"Udah nulis jurnal hari ini?",d:"Ceritain harimu: mood, kegiatan, satu hal baik. 2 menit aja ✍️",r:"diary",m:"happy",w:4});
    if(new Date(Date.now()+7*3600e3).getUTCDay()===0)out.push({t:"Hari Minggu = cek saldo",d:"Cocokkan saldo real semua rekening, 5 menit aja.",r:"recon",m:"happy",w:3});
    const endLeft=+mEnd(m).slice(8)-+td.slice(8);if(endLeft<=1&&!closed.includes(m))out.push({t:"Waktunya tutup buku 📒",d:"Cek laporan, tutup periode, lalu ekspor backup.",r:"period",m:"think",w:4});
  }catch(e){}
  if(!out.length)out.push(...[
    {t:"Semua aman ✨",d:"Saldo cocok, anggaran terkendali. Keren!",m:"party",w:1},
    {t:`Hai, aku ${c.name}!`,d:"Cuma mau nyapa. Semangat hari ini ya 💪",m:"happy",w:1},
    {t:"Tips hemat",d:"Bawa botol minum sendiri, hemat jajan minuman tiap hari.",m:"think",w:1},
    {t:"Minum air dulu",d:"Kerja & kuliah butuh tenaga. Istirahat sebentar yuk.",m:"sleep",w:1}]);
  let tot=out.reduce((s,x)=>s+x.w,0),r=Math.random()*tot;for(const x of out){r-=x.w;if(r<=0)return x}return out[0]}
function addD(d,n){const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")}
let peekTimer=null,peekEl=null,lastPeekTip="";
function doPeek(force,override){
  if(override&&peekEl){peekEl.remove();peekEl=null}
  if(getTheme()!=="fun"||!col||tourOn||document.hidden||(!override&&document.querySelector(".sheetBg"))||peekEl)return;
  let tip=override||peekTips();if(!override&&!force&&tip.t===lastPeekTip)tip=peekTips();lastPeekTip=tip.t;
  const pos=["bl","br","r"][Math.floor(Math.random()*3)],side=pos==="r"?"r":"b";
  peekEl=document.createElement("div");peekEl.className=`peek ${side} ${pos}`;
  const girl=!!OUTFITS[charId()],boy=!!BOYS[charId()];
  peekEl.innerHTML=`<div class="bub" role="status"><b>${esc(tip.t)}</b>${esc(tip.d)}${tip.r?"<small>Ketuk untuk buka →</small>":""}</div>
   <div class="who" style="--hand:${girl?"#ffe0cc":boy?"#f3cba8":(CHARS[charId()].feet||"#f48fb1")}">${pipi(tip.m,96)}<span class="hand" style="left:14px"></span><span class="hand" style="right:14px"></span></div>`;
  document.body.appendChild(peekEl);
  requestAnimationFrame(()=>requestAnimationFrame(()=>peekEl&&peekEl.classList.add("show")));
  const close=()=>{if(!peekEl)return;const el=peekEl;peekEl=null;el.classList.remove("show");setTimeout(()=>el.remove(),650)};
  peekEl.querySelector(".bub").onclick=()=>{close();if(tip.r)go(tip.r)};
  peekEl.querySelector(".who").onclick=()=>{close();if(tip.r)go(tip.r)};
  setTimeout(close,9000)}
function schedulePeek(){clearInterval(peekTimer);const m=peekMin();if(m>0)peekTimer=setInterval(()=>doPeek(),m*60000)}
window.doPeek=doPeek;
addEventListener("load",()=>setTimeout(()=>{schedulePeek();setTimeout(()=>doPeek(),20000)},1500));

/* ---------- HALAMAN PANDUAN ---------- */
function vGuide(v){
  v.innerHTML=page("Bantuan","Panduan",`<button class="pri" id="gTour">Mulai tur interaktif</button>`)+
  `<div class="pipi-card">${pipi("happy",64)}<div class="bubble"><b>Panduan dari ${C().name} ${C().emoji}</b><div>Baca sekali, praktikkan seminggu. Kalau bingung, ulangi tur interaktif.</div></div></div>
  <div class="region"><div class="rb guide">
   <h3>🐾 Pilih teman & tema</h3><p class="crumb" style="margin:0 0 8px">Setiap karakter punya warna tema sendiri.</p><div id="gPick">${charPicker()}</div>
   <h3>👀 Karakter ngintip</h3><p class="crumb" style="margin:0 0 8px">Temanmu muncul dari pinggir layar membawa pengingat (saldo beda, anggaran hampir habis, tagihan H-3, belum catat hari ini). Ketuk untuk langsung ke menunya.</p>
   <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">${[[0,"Mati"],[1,"1 menit"],[3,"3 menit"],[5,"5 menit"],[10,"10 menit"],[30,"30 menit"]].map(([v,n])=>`<button class="sm${peekMin()===v?" pri":""}" data-pk="${v}">${n}</button>`).join("")}<button class="sm" id="pkNow">Coba sekarang 👋</button></div>
   <h3>🚀 Mulai cepat (sekali di awal)</h3>
   <ol><li><b>Rekonsiliasi Kas & Bank</b> → isi <b>Saldo awal</b> semua rekening (lihat angka di aplikasi bank hari ini). Isi juga <b>Saldo real</b> dengan angka yang sama.</li>
   <li>Punya utang PayLater, piutang teman, atau deposit kost? Catat lewat <b>Jurnal Umum → Jurnal manual</b>.</li>
   <li><b>Anggaran → Ubah anggaran</b>: isi 4101 Gaji, lalu kost, listrik, internet, pulsa, makan, transport, dan target tabungan.</li>
   <li><b>Input Transaksi</b>: coba foto satu struk → cek → <b>Posting jurnal</b>.</li>
   <li>(Opsional) <b>📔 Jurnal Harian</b> → <b>Kalender</b> → <b>Jadwal mingguan</b> untuk kuliah/shift, lalu tulis jurnal harian tiap malam.</li></ol>
   <h3>🔁 Rutinitas</h3>
   <ul><li><b>Setiap transaksi</b>: foto struk/screenshot → posting. Transfer antar rekening sendiri pilih jenis <b>Transfer</b>, bukan pengeluaran.</li>
   <li><b>Setiap minggu</b>: isi Saldo real semua rekening. Merah = cari yang kelewat (biaya admin, bunga, cashback, transaksi lupa dicatat).</li>
   <li><b>Akhir bulan</b>: semua hijau → <b>Periode Akuntansi → Tutup periode</b> → <b>Ekspor backup (JSON)</b>.</li></ul>
   <h3>📖 Istilah singkat</h3>
   <div class="term">
    <b>Debit / Kredit</b><span>Setiap transaksi dicatat di dua sisi yang jumlahnya sama. Beli makan Rp20.000 pakai Jago: Debit 5201 Makan, Kredit 1113 Jago.</span>
    <b>Akun GL / COA</b><span>Daftar "laci" uang: 1xxx aset, 2xxx utang, 3xxx ekuitas, 4xxx pendapatan, 5xxx beban.</span>
    <b>Reverse</b><span>Membatalkan jurnal dengan jurnal kebalikannya. Dipakai kalau nominal/tanggal salah, lalu input ulang yang benar.</span>
    <b>Reklas</b><span>Memindahkan nominal ke akun yang benar tanpa membatalkan semuanya (mis. salah kategori, salah rekening).</span>
    <b>Rekonsiliasi</b><span>Mencocokkan saldo di buku dengan saldo asli di bank. Harus sama.</span>
    <b>Tutup periode</b><span>Mengunci bulan yang sudah beres supaya laporan bulan itu tidak berubah lagi.</span>
    <b>Surplus</b><span>Pendapatan dikurangi beban. Ini uang yang benar-benar bisa ditabung.</span></div>
   <h3>❓ Pertanyaan umum</h3>
   <ul><li><b>Kartu saldo merah?</b> Buku ≠ bank. Cek transaksi terakhir yang belum dicatat. Kalau sudah yakin tidak bisa dilacak, pakai <b>Jurnal penyesuaian</b> di halaman Rekonsiliasi.</li>
   <li><b>Foto salah baca?</b> Selalu cek pratinjau sebelum Posting. Struk toko tidak menunjukkan kartu yang dipakai — pilih rekeningnya sendiri.</li>
   <li><b>Top-up OVO</b> = Transfer (bank → OVO). Pengeluarannya baru tercatat saat bayar Grab pakai OVO.</li>
   <li><b>Bayar kost 3 bulan sekaligus?</b> Catat ke 1302 Sewa Dibayar di Muka, lalu tiap bulan jurnal manual Debit 5101 / Kredit 1302.</li></ul>
   <h3>🎨 Tampilan</h3>
   <p>Mode sekarang: <b>${getTheme()==="fun"?"Lucu":"Profesional"}</b>. <button class="sm" id="gTheme">Ganti ke ${getTheme()==="fun"?"Profesional":"Lucu"}</button></p><p><button class="sm pri" id="gLook">🎨 Buka opsi tampilan lengkap</button> <span class="crumb">pola latar, gelap/terang, bentuk, huruf, ukuran teks, hiasan</span></p>
  </div></div>`;
  document.getElementById("gTour").onclick=startTour;
  v.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{try{localStorage.setItem(peekKey(),b.dataset.pk)}catch(e){}schedulePeek();render()});
  document.getElementById("pkNow").onclick=()=>doPeek(true);wirePicker(document.getElementById("gPick"));
  document.getElementById("gLook")&&(document.getElementById("gLook").onclick=()=>go("look"));document.getElementById("gTheme").onclick=()=>{applyTheme(getTheme()==="fun"?"pro":"fun");render()}}
NAV.push(["Bantuan",[["guide","Panduan & Tutorial"]]]);
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{guide:vGuide});
addEventListener("load",()=>render());
})();
