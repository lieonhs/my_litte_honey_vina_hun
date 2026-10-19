/* =====================================================================
   🔒 KEAMANAN
   - Kunci PIN aplikasi (per perangkat) + kunci otomatis saat ditinggal
   - 2FA / verifikasi 2 langkah (TOTP, Google Authenticator) — ditegakkan juga di database
   - Keluar dari semua perangkat, matikan notifikasi perangkat ini
   - Sembunyikan isi layar di daftar aplikasi terbaru
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const who=()=>(document.getElementById("who")?.textContent||"").split(" ")[0]||"";
const LK=()=>"bbp_lock_"+who();
const getLock=()=>{try{return JSON.parse(localStorage.getItem(LK())||"null")}catch(e){return null}};
const setLock=v=>{try{v?localStorage.setItem(LK(),JSON.stringify(v)):localStorage.removeItem(LK())}catch(e){}};
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const unhex=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
async function hashPin(pin,saltHex){const salt=saltHex?unhex(saltHex):crypto.getRandomValues(new Uint8Array(16));
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},k,256);return {salt:hex(salt),hash:hex(bits)}}
const eq=(a,b)=>{if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0};

const css=document.createElement("style");css.textContent=`
#raviLock{position:fixed;inset:0;z-index:500;background:radial-gradient(120% 90% at 50% 0%,var(--g1,#7c4dff),#1b1524 75%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
 padding:calc(20px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));font-family:Nunito,system-ui,sans-serif;text-align:center}
#raviLock h2{margin:0;font-size:20px}#raviLock .sub{font-size:13px;opacity:.85;min-height:18px}
#raviLock .dots{display:flex;gap:12px}#raviLock .dots i{width:14px;height:14px;border-radius:99px;border:2px solid #fff;display:block}#raviLock .dots i.on{background:#fff}
#raviLock .pad{display:grid;grid-template-columns:repeat(3,72px);gap:12px}
#raviLock .pad button{all:unset;cursor:pointer;width:72px;height:72px;border-radius:99px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800}
#raviLock .pad button:active{background:rgba(255,255,255,.3)}#raviLock .pad button:focus-visible{outline:3px solid #fff}
#raviLock .lnk2{all:unset;cursor:pointer;font-size:12.5px;text-decoration:underline;opacity:.85}
#raviLock.shake .dots{animation:sk .35s}@keyframes sk{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
html.ravi-hidden #view,html.ravi-hidden aside{filter:blur(18px)}
.sec-row{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line)}.sec-row:last-child{border-bottom:0}
.sec-row .ic{font-size:24px;flex:none;width:30px;text-align:center}.sec-row .tx{flex:1;min-width:0}.sec-row .tx b{display:block}.sec-row .tx .crumb{font-size:12.5px;line-height:1.45}
.sec-ok{color:var(--grn);font-weight:800}.sec-no{color:var(--amb);font-weight:800}
.sec-qr{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:10px}.sec-qr img{width:170px;height:170px;background:#fff;border-radius:12px;padding:6px}
.sec-qr code{font-size:12px;word-break:break-all;background:var(--th);padding:6px 8px;border-radius:8px;display:block}
@media (prefers-reduced-motion:reduce){#raviLock.shake .dots{animation:none}}`;document.head.appendChild(css);

/* ---------- layar kunci ---------- */
let locked=false,hiddenAt=0,fails=0;
function showLock(){const lk=getLock();if(!lk||locked||document.getElementById("raviLock"))return;locked=true;let pin="";
  const el=document.createElement("div");el.id="raviLock";el.setAttribute("role","dialog");el.setAttribute("aria-label",L("RaVi terkunci","RaVi is locked"));
  el.innerHTML=`<img src="icon.svg" alt="" width="72" height="72" style="border-radius:20px"><h2>${L("RaVi terkunci","RaVi is locked")}</h2><div class="sub" id="lkSub">${L("Masukkan PIN","Enter your PIN")}</div>
   <div class="dots">${"<i></i>".repeat(lk.len||4)}</div>
   <div class="pad">${[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(k=>k===""?"<span></span>":`<button data-k="${k}" aria-label="${k==="⌫"?L("Hapus","Delete"):k}">${k}</button>`).join("")}</div>
   <button class="lnk2" id="lkForgot">${L("Lupa PIN? Keluar & login ulang","Forgot PIN? Sign out and sign in again")}</button>`;
  document.body.appendChild(el);const dots=[...el.querySelectorAll(".dots i")];
  const paint=()=>dots.forEach((d,i)=>d.classList.toggle("on",i<pin.length));
  const tryPin=async()=>{const h=await hashPin(pin,lk.salt);if(eq(h.hash,lk.hash)){fails=0;locked=false;el.remove();return}
    fails++;pin="";paint();el.classList.add("shake");setTimeout(()=>el.classList.remove("shake"),400);
    const left=5-fails;el.querySelector("#lkSub").textContent=left>0?L("PIN salah. Sisa ","Wrong PIN. ")+left+L(" percobaan."," tries left."):L("Terlalu banyak salah. Keluar…","Too many attempts. Signing out…");
    if(left<=0){setLock(null);try{await sb.auth.signOut()}catch(e){}location.reload()}};
  const press=k=>{if(k==="⌫")pin=pin.slice(0,-1);else if(pin.length<(lk.len||4))pin+=k;paint();if(pin.length===(lk.len||4))tryPin()};
  el.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>press(b.dataset.k));
  const kd=e=>{if(!document.getElementById("raviLock")){removeEventListener("keydown",kd);return}if(/^\d$/.test(e.key))press(e.key);else if(e.key==="Backspace")press("⌫")};addEventListener("keydown",kd);
  el.querySelector("#lkForgot").onclick=async()=>{setLock(null);try{await sb.auth.signOut()}catch(e){}location.reload()}}
document.addEventListener("visibilitychange",()=>{const lk=getLock();
  if(document.hidden){hiddenAt=Date.now();if(!lk||lk.blur!==false)document.documentElement.classList.add("ravi-hidden")}
  else{document.documentElement.classList.remove("ravi-hidden");if(lk&&hiddenAt&&Date.now()-hiddenAt>=(lk.mins??5)*60e3)showLock()}});
/* kunci saat aplikasi dibuka (setelah tahu akun siapa) */
addEventListener("load",()=>{const t=setInterval(()=>{if(who().includes("@")){clearInterval(t);if(getLock())showLock()}},300);setTimeout(()=>clearInterval(t),20000)});

/* ---------- pengaturan PIN ---------- */
function pinDialog(title,len){return new Promise(res=>{let step=1,first="";
  const bg=modal(title,`<div class="crumb" id="pdT">${L("Masukkan PIN baru ("+len+" angka)","Enter a new PIN ("+len+" digits)")}</div><input id="pdI" type="password" inputmode="numeric" maxlength="${len}" autocomplete="new-password" style="font-size:24px;letter-spacing:.4em;text-align:center;margin-top:8px"><div class="msg err hide" id="pdM" style="margin-top:8px"></div>`,
    async g=>{const v=g.querySelector("#pdI").value.replace(/\D/g,"");const m=g.querySelector("#pdM");
      if(v.length!==len){m.textContent=L("PIN harus "+len+" angka.","PIN must be "+len+" digits.");m.classList.remove("hide");return false}
      if(/^(\d)\1+$/.test(v)||"0123456789".includes(v)||"9876543210".includes(v)){m.textContent=L("Terlalu mudah ditebak. Pakai angka yang tidak berurutan.","Too easy to guess. Avoid repeated or sequential digits.");m.classList.remove("hide");return false}
      if(step===1){first=v;step=2;g.querySelector("#pdT").textContent=L("Ulangi PIN","Repeat the PIN");g.querySelector("#pdI").value="";m.classList.add("hide");return false}
      if(v!==first){m.textContent=L("PIN tidak sama. Ulangi dari awal.","PINs don't match. Start again.");m.classList.remove("hide");step=1;first="";g.querySelector("#pdT").textContent=L("Masukkan PIN baru","Enter a new PIN");g.querySelector("#pdI").value="";return false}
      res(v)},L("Lanjut","Next"));
  setTimeout(()=>bg.querySelector("#pdI").focus(),50);bg.querySelector(".c").addEventListener("click",()=>res(null))})}

/* ---------- halaman keamanan ---------- */
async function vSecurity(v){
  const lk=getLock();
  v.innerHTML=page(L("Bantuan","Help"),"🔒 "+L("Keamanan","Security"))+`<div class="region"><div class="rb crumb">${L("Memuat…","Loading…")}</div></div>`;
  let aal=null,factors=[],pushOn=false;
  try{aal=(await sb.auth.mfa.getAuthenticatorAssuranceLevel()).data;factors=((await sb.auth.mfa.listFactors()).data||{}).totp||[]}catch(e){}
  try{const r=await navigator.serviceWorker?.getRegistration();pushOn=!!(r&&await r.pushManager.getSubscription())}catch(e){}
  if(route!=="security")return;
  const mfaOn=factors.length>0;
  v.innerHTML=page(L("Bantuan","Help"),"🔒 "+L("Keamanan","Security"))+
   `<div class="region"><div class="rh">🛡️ ${L("Perlindungan akun","Account protection")}</div><div class="rb">
    <div class="sec-row"><span class="ic">🔐</span><div class="tx"><b>${L("Verifikasi 2 langkah (2FA)","Two-step verification (2FA)")} · ${mfaOn?`<span class="sec-ok">${L("Aktif","On")}</span>`:`<span class="sec-no">${L("Belum aktif","Off")}</span>`}</b>
     <div class="crumb">${L("Login butuh password + 6 angka dari Google Authenticator. Kalau password bocor, akun tetap aman. Database ikut menolak akses tanpa kode ini.","Sign-in needs your password + 6 digits from Google Authenticator. If your password leaks, the account stays safe. The database also refuses access without the code.")}</div><div id="mfaBox"></div></div>
     <button class="sm${mfaOn?"":" pri"}" id="mfaBtn">${mfaOn?L("Matikan","Turn off"):L("Aktifkan","Turn on")}</button></div>
    <div class="sec-row"><span class="ic">🚪</span><div class="tx"><b>${L("Keluar dari semua perangkat","Sign out everywhere")}</b><div class="crumb">${L("Pakai kalau HP hilang atau kamu pernah login di perangkat orang lain.","Use this if a phone is lost or you signed in on someone else's device.")}</div></div><button class="sm" id="outAll">${L("Keluar semua","Sign out all")}</button></div>
   </div></div>
   <div class="region"><div class="rh"><span>🔐 ${L("Enkripsi chat (per akun)","Chat encryption (per account)")}</span></div><div class="rb" id="devBox"><div class="crumb">${L("Memuat…","Loading…")}</div></div></div>
   <div class="region"><div class="rh">📱 ${L("Perangkat ini","This device")}</div><div class="rb">
    <div class="sec-row"><span class="ic">🔢</span><div class="tx"><b>${L("Kunci PIN aplikasi","App PIN lock")} · ${lk?`<span class="sec-ok">${L("Aktif","On")}</span>`:`<span class="sec-no">${L("Belum aktif","Off")}</span>`}</b><div class="crumb">${L("RaVi minta PIN setiap dibuka dan setelah ditinggal. Berguna kalau HP dipinjam orang. Salah 5× = otomatis keluar.","RaVi asks for a PIN on open and after you leave it. Useful if someone borrows your phone. 5 wrong tries = signed out.")}</div>
     ${lk?`<div class="tl-row" style="margin-top:8px"><label class="crumb" for="lkMins">${L("Kunci otomatis setelah","Auto-lock after")}</label><select id="lkMins" style="width:auto">${[[0,L("langsung","immediately")],[1,"1 "+L("menit","min")],[5,"5 "+L("menit","min")],[15,"15 "+L("menit","min")],[60,"1 "+L("jam","hour")]].map(([m,n])=>`<option value="${m}"${(lk.mins??5)===m?" selected":""}>${n}</option>`).join("")}</select></div>`:""}</div>
     <div style="display:flex;flex-direction:column;gap:6px">${lk?`<button class="sm" id="lkNow">${L("Kunci sekarang","Lock now")}</button><button class="sm" id="lkOff">${L("Matikan PIN","Remove PIN")}</button>`:`<button class="sm pri" id="lkOn4">PIN 4</button><button class="sm" id="lkOn6">PIN 6</button>`}</div></div>
    <div class="sec-row"><span class="ic">🙈</span><div class="tx"><b>${L("Sembunyikan isi saat berpindah aplikasi","Hide content in the app switcher")}</b><div class="crumb">${L("Isi RaVi diburamkan saat kamu keluar ke aplikasi lain.","RaVi's content is blurred when you switch to another app.")}</div></div><input type="checkbox" id="blurT" ${!lk||lk.blur!==false?"checked":""} style="width:auto;margin-top:4px" aria-label="${L("Buramkan","Blur")}"></div>
    <div class="sec-row"><span class="ic">🔔</span><div class="tx"><b>${L("Notifikasi perangkat ini","This device's notifications")} · ${pushOn?`<span class="sec-ok">${L("Aktif","On")}</span>`:`<span class="sec-no">${L("Mati","Off")}</span>`}</b><div class="crumb">${L("Isi pesan tampil di layar kunci HP. Matikan kalau HP sering dipinjam orang.","Message text shows on the lock screen. Turn off if others often use this phone.")}</div></div><button class="sm" id="pushT">${pushOn?L("Matikan","Turn off"):L("Aktifkan","Turn on")}</button></div>
   </div></div>
   ${window.RAVI_CALL_PUBLIC?`<div class="msg warn">⚠️ ${L("Channel telepon belum privat karena setup-ravi.sql belum dijalankan. Jalankan supaya orang luar tidak bisa menguping sinyal panggilan.","Call channels aren't private yet because setup-ravi.sql hasn't been run. Run it so outsiders can't listen in on call signalling.")}</div>`:""}
   <div class="region"><div class="rh">✅ ${L("Sudah terpasang otomatis","Built in automatically")}</div><div class="rb"><div class="tl-list">
    ${[[L("Data tiap akun terkunci di database (Row Level Security). Akun lain tidak bisa membaca bukumu.","Each account's data is locked in the database (Row Level Security). Other accounts can't read your books.")],
       [L("Chat & grup hanya terbaca anggotanya; feed & data pasangan khusus kalian berdua.","Chats and groups are readable only by their members; the couple feed and data are just for the two of you.")],
       [L("Sinyal telepon lewat channel privat; suara & video terenkripsi langsung antar-HP.","Call signalling uses private channels; audio and video are encrypted device-to-device.")],
       [L("Aplikasi hanya menjalankan kodenya sendiri (Content Security Policy), library disimpan di repo dengan versi terkunci.","The app only runs its own code (Content Security Policy); libraries are stored in the repo at pinned versions.")],
       [L("Foto disimpan di bucket privat; tautan foto kedaluwarsa dalam 1 jam.","Photos live in private buckets; photo links expire within 1 hour.")],
       [L("API key Gemini & kunci notifikasi hanya ada di server Supabase, tidak pernah di browser.","The Gemini key and notification keys only live on the Supabase server, never in the browser.")]].map(([t])=>`<div class="tl-item"><span>✅</span><div class="grow crumb" style="font-size:13px"></div></div>`).join("")}
   </div></div></div>
   <div class="region"><div class="rh">📋 ${L("Cek di dashboard Supabase (sekali)","Check in the Supabase dashboard (once)")}</div><div class="rb"><ol style="margin:0;padding-left:1.2em;line-height:1.7;font-size:13.5px">
    <li>${L("Authentication → Sign In / Providers → <b>Allow new users to sign up: OFF</b>.","Authentication → Sign In / Providers → <b>Allow new users to sign up: OFF</b>.")}</li>
    <li>${L("Authentication → Users: hanya akun yang kamu kenal (anggota ditambah lewat Chat → ＋ → Tambah anggota).","Authentication → Users: only accounts you know (add members via Chat → ＋ → Add member).")}</li>
    <li>${L("Pakai password panjang (min. 12 karakter) yang tidak dipakai di situs lain.","Use a long password (12+ characters) not used anywhere else.")}</li>
    <li>${L("GitHub → Settings → Pages → <b>Enforce HTTPS</b> dicentang.","GitHub → Settings → Pages → <b>Enforce HTTPS</b> checked.")}</li>
    <li>${L("Jangan pernah menaruh service_role key atau secret apa pun di config.js / GitHub.","Never put the service_role key or any secret in config.js / GitHub.")}</li></ol></div></div>`;
  const items=[L("Data tiap akun terkunci di database (Row Level Security). Akun lain tidak bisa membaca bukumu.","Each account's data is locked in the database (Row Level Security). Other accounts can't read your books."),L("Chat & grup hanya terbaca anggotanya; feed & data pasangan khusus kalian berdua.","Chats and groups are readable only by their members; the couple feed and data are just for the two of you."),L("Sinyal telepon lewat channel privat; suara & video terenkripsi langsung antar-HP.","Call signalling uses private channels; audio and video are encrypted device-to-device."),L("Aplikasi hanya menjalankan kodenya sendiri (Content Security Policy), library disimpan di repo dengan versi terkunci.","The app only runs its own code (Content Security Policy); libraries are stored in the repo at pinned versions."),L("Foto disimpan di bucket privat; tautan foto kedaluwarsa dalam 1 jam.","Photos live in private buckets; photo links expire within 1 hour."),L("API key Gemini & kunci notifikasi hanya ada di server Supabase, tidak pernah di browser.","The Gemini key and notification keys only live on the Supabase server, never in the browser.")];
  v.querySelectorAll(".tl-list .grow").forEach((g,i)=>g.textContent=items[i]);
  const on=(id,f)=>{const b=document.getElementById(id);if(b)b.onclick=f};
  (async()=>{const box=document.getElementById("devBox"),E=window.RAVI_E2E;if(!box||!E)return;await E.load().catch(()=>{});if(window.RS)await RS.init().catch(()=>{});if(!document.getElementById("devBox"))return;const st=E.state();
    const ok=st==="ok";
    box.innerHTML=`<div class="sec-row"><span class="ic">${ok?"🔐":"🔒"}</span><div class="tx"><b>${ok?L("Aktif di perangkat ini","Active on this device"):st==="nokey"?L("Belum dibuat","Not created yet"):st==="needpw"?L("Terkunci di perangkat ini","Locked on this device"):L("Tidak tersedia","Unavailable")}</b>
      <div class="crumb">${L("Kunci enkripsi milik akunmu, dikunci dengan password login. Login di HP/laptop mana pun → masukkan password sekali → semua chat terbaca. Server hanya menyimpan versi terkunci.","Your account's encryption key, locked with your sign-in password. Sign in on any phone/laptop → enter the password once → every chat opens. The server only stores the locked version.")}</div></div>
      ${ok?"":`<button class="sm pri" id="e3Open">${st==="nokey"?L("Aktifkan","Turn on"):L("Buka","Unlock")}</button>`}</div>
     ${window.RS&&RS.S.members[RS.S.me]?.role==="admin"?`<div class="sec-row"><span class="ic">👥</span><div class="tx"><b>${L("Anggota RaVi","RaVi members")} (${Object.keys(RS.S.members).length})</b><div class="crumb">${Object.values(RS.S.members).map(m=>esc(m.name||"?")+(m.role==="admin"?" (admin)":"")).join(", ")}</div></div><button class="sm pri" id="addMem">＋ ${L("Tambah anggota","Add member")}</button></div>`:""}
     <div class="sec-row"><span class="ic">🔑</span><div class="tx"><b>${L("Ganti password login","Change sign-in password")}</b><div class="crumb">${L("Kunci enkripsi ikut dikunci ulang dengan password baru, jadi pesan lama tetap terbaca. Jangan ganti lewat email reset kecuali lupa.","The encryption key is re-locked with the new password, so old messages stay readable. Don't use the email reset unless you forgot it.")}</div></div><button class="sm" id="pwChange">${L("Ganti","Change")}</button></div>
     <div class="sec-row"><span class="ic">♻️</span><div class="tx"><b>${L("Buat kunci baru (lupa password)","New key (forgot password)")}</b><div class="crumb">${L("Pakai hanya kalau password sudah direset lewat email. Pesan terenkripsi lama tidak bisa dibuka lagi; kontakmu akan melihat “kode keamanan berubah”.","Only if your password was reset by email. Old encrypted messages can't be opened anymore; your contacts will see “security code changed”.")}</div></div><button class="sm" id="keyReset">${L("Buat ulang","Reset")}</button></div>`;
    const am=document.getElementById("addMem");if(am)am.onclick=()=>window.RAVI_CHAT&&window.RAVI_CHAT.addMember();
    const o=document.getElementById("e3Open");if(o)o.onclick=async()=>{if(await E.unlockDialog())vSecurity(v)};
    document.getElementById("pwChange").onclick=()=>modal(L("Ganti password","Change password"),`<label>${L("Password sekarang","Current password")}</label><input type="password" id="pwO" autocomplete="current-password"><label style="margin-top:8px">${L("Password baru (min. 12)","New password (min. 12)")}</label><input type="password" id="pwN" autocomplete="new-password"><label style="margin-top:8px">${L("Ulangi password baru","Repeat new password")}</label><input type="password" id="pwN2" autocomplete="new-password"><div class="msg err hide" id="pwM" style="margin-top:8px"></div>`,
      async g=>{const O=g.querySelector("#pwO").value,N=g.querySelector("#pwN").value,m=g.querySelector("#pwM");const fail=t=>{m.textContent=t;m.classList.remove("hide");return false};
        if(N.length<12)return fail(L("Password baru minimal 12 karakter.","New password needs 12+ characters."));if(N!==g.querySelector("#pwN2").value)return fail(L("Password baru tidak sama.","New passwords don't match."));
        try{await E.rewrap(N,O);status(L("Password diganti. Kunci enkripsi ikut diperbarui 🔐","Password changed. Encryption key updated 🔐"),"ok")}catch(e){return fail(e.message||String(e))}},L("Ganti","Change"));
    document.getElementById("keyReset").onclick=()=>modal(L("Buat kunci enkripsi baru?","Create a new encryption key?"),`<div class="msg warn" style="margin:0 0 8px">${L("Pesan terenkripsi lama TIDAK bisa dibuka lagi di akun ini.","Old encrypted messages can NOT be opened on this account anymore.")}</div><label>${L("Password login sekarang","Current sign-in password")}</label><input type="password" id="rkP" autocomplete="current-password"><div class="msg err hide" id="rkM" style="margin-top:8px"></div>`,
      async g=>{try{await E.resetKey(g.querySelector("#rkP").value);status(L("Kunci baru dibuat.","New key created."),"ok");vSecurity(v)}catch(e){const m=g.querySelector("#rkM");m.textContent=e.message||String(e);m.classList.remove("hide");return false}},L("Buat ulang","Reset"))})();
  on("lkOn4",async()=>{const p=await pinDialog(L("Buat PIN","Create PIN"),4);if(!p)return;setLock({...(await hashPin(p)),len:4,mins:5,blur:true});status(L("Kunci PIN aktif di perangkat ini.","PIN lock is on for this device."),"ok");vSecurity(v)});
  on("lkOn6",async()=>{const p=await pinDialog(L("Buat PIN","Create PIN"),6);if(!p)return;setLock({...(await hashPin(p)),len:6,mins:5,blur:true});status(L("Kunci PIN aktif di perangkat ini.","PIN lock is on for this device."),"ok");vSecurity(v)});
  on("lkOff",()=>{modal(L("Matikan PIN?","Remove PIN?"),`<div class="crumb">${L("RaVi tidak akan meminta PIN lagi di perangkat ini.","RaVi will stop asking for a PIN on this device.")}</div>`,()=>{setLock(null);vSecurity(v)},L("Matikan","Remove"))});
  on("lkNow",()=>showLock());
  const ms=document.getElementById("lkMins");if(ms)ms.onchange=()=>{const l=getLock();l.mins=+ms.value;setLock(l);status(L("Tersimpan.","Saved."),"ok")};
  const bt=document.getElementById("blurT");bt.onchange=()=>{const l=getLock();if(l){l.blur=bt.checked;setLock(l)}else if(!bt.checked){status(L("Buat PIN dulu untuk mengubah pengaturan ini.","Create a PIN first to change this."),"warn");bt.checked=true}};
  on("outAll",()=>modal(L("Keluar dari semua perangkat?","Sign out everywhere?"),`<div class="crumb">${L("Semua HP & laptop yang login dengan akun ini akan keluar, termasuk perangkat ini.","Every phone and laptop signed in with this account will be signed out, including this one.")}</div>`,async()=>{try{await sb.auth.signOut({scope:"global"})}catch(e){}location.reload()},L("Keluar semua","Sign out all")));
  on("pushT",async()=>{try{const r=await navigator.serviceWorker?.getRegistration(),s=r&&await r.pushManager.getSubscription();
    if(s){await sb.from("push_subs").delete().eq("endpoint",s.endpoint);await s.unsubscribe();try{localStorage.removeItem("bbp_push_ok")}catch(e){}status(L("Notifikasi dimatikan di perangkat ini.","Notifications turned off on this device."),"ok")}
    else if(window.RAVI_PUSH_SUBSCRIBE){await window.RAVI_PUSH_SUBSCRIBE();status(L("Notifikasi aktif 🔔","Notifications on 🔔"),"ok")}}catch(e){status(e.message||String(e),"warn")}vSecurity(v)});
  on("mfaBtn",async()=>{const box=document.getElementById("mfaBox");
    if(mfaOn){modal(L("Matikan 2FA?","Turn off 2FA?"),`<div class="crumb">${L("Login cukup dengan password lagi. Tidak disarankan.","Sign-in will only need the password again. Not recommended.")}</div>`,async()=>{
        if(!aal||aal.currentLevel!=="aal2"){alert(L("Login ulang dengan kode 2FA dulu, lalu matikan.","Sign in again with your 2FA code first, then turn it off."));return}
        for(const f of factors){const {error}=await sb.auth.mfa.unenroll({factorId:f.id});if(error){alert(error.message);return false}}await sb.auth.refreshSession().catch(()=>{});vSecurity(v)},L("Matikan","Turn off"));return}
    // bersihkan pendaftaran lama yang belum selesai
    try{const all=((await sb.auth.mfa.listFactors()).data||{}).all||[];for(const f of all)if(f.status!=="verified")await sb.auth.mfa.unenroll({factorId:f.id})}catch(e){}
    const {data,error}=await sb.auth.mfa.enroll({factorType:"totp",friendlyName:"RaVi "+new Date().toISOString().slice(0,10)});
    if(error){box.innerHTML=`<div class="msg err" style="margin-top:8px"></div>`;box.firstChild.textContent=error.message+(/disabled|not enabled/i.test(error.message)?L(" — aktifkan TOTP di Supabase: Authentication → Multi-Factor."," — enable TOTP in Supabase: Authentication → Multi-Factor."):"");return}
    box.innerHTML=`<ol style="margin:8px 0 0;padding-left:1.2em;font-size:13px;line-height:1.6"><li>${L("Install <b>Google Authenticator</b> (atau Microsoft Authenticator).","Install <b>Google Authenticator</b> (or Microsoft Authenticator).")}</li><li>${L("Ketuk + → Pindai kode QR. Kalau di HP yang sama, pilih Masukkan kunci lalu salin kode di bawah.","Tap + → Scan a QR code. On the same phone, choose Enter a setup key and copy the code below.")}</li><li>${L("Masukkan 6 angka yang muncul.","Enter the 6 digits shown.")}</li></ol>
     <div class="sec-qr"><img alt="QR 2FA"><div style="flex:1;min-width:180px"><code></code><div class="tl-row" style="margin-top:8px"><input id="mfaCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="123456" style="max-width:130px;letter-spacing:.2em"><button class="sm pri" id="mfaVerify">${L("Verifikasi","Verify")}</button></div></div></div>`;
    box.querySelector("img").src=data.totp.qr_code;box.querySelector("code").textContent=data.totp.secret;
    box.querySelector("#mfaVerify").onclick=async()=>{const code=box.querySelector("#mfaCode").value.replace(/\D/g,"");if(code.length!==6)return;
      const {error:e2}=await sb.auth.mfa.challengeAndVerify({factorId:data.id,code});if(e2){status(L("Kode salah. Pakai kode terbaru dari aplikasi.","Wrong code. Use the latest code from the app."),"warn");return}
      status(L("2FA aktif ✅ Simpan HP authenticator-mu baik-baik.","2FA is on ✅ Keep your authenticator phone safe."),"ok");vSecurity(v)}})}

window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{security:v=>{vSecurity(v).catch(e=>{v.innerHTML='<div class="msg err">'+esc(e.message||String(e))+'</div>'})}});
const bantu=NAV.find(([g])=>g==="Bantuan");if(bantu)bantu[1].push(["security","Keamanan"]);else NAV.push(["Bantuan",[["security","Keamanan"]]]);
})();
