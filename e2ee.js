/* =====================================================================
   🔐 ENKRIPSI END-TO-END untuk Chat & Feed (Rafi & Vina)
   - Kata sandi chat bersama → PBKDF2-SHA256 (310.000 putaran) → kunci AES-256-GCM
   - Kunci disimpan di perangkat (IndexedDB, tidak bisa diekspor). Server hanya
     menyimpan garam + nilai pemeriksa di tabel couple_keys.
   - Teks: "enc1:" + base64(iv 12 byte + ciphertext). Foto: berkas *.enc berisi iv + ciphertext.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const E={row:null,key:null,loaded:false,loading:null,cache:new Map(),pending:new Set(),imgs:new Map(),uid:null};
const enc=new TextEncoder(),dec=new TextDecoder();
const toB64=u=>{let s="";const b=new Uint8Array(u);for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)};
const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const CHECK="ravi-e2e-ok";

/* ---------- penyimpanan kunci di perangkat ---------- */
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open("ravi-e2e",1);r.onupgradeneeded=()=>r.result.createObjectStore("keys");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbGet(k){const db=await idb();return new Promise(res=>{const t=db.transaction("keys").objectStore("keys").get(k);t.onsuccess=()=>res(t.result||null);t.onerror=()=>res(null)})}
async function idbPut(k,v){const db=await idb();return new Promise(res=>{const t=db.transaction("keys","readwrite");t.objectStore("keys").put(v,k);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}
async function idbDel(k){const db=await idb();return new Promise(res=>{const t=db.transaction("keys","readwrite");t.objectStore("keys").delete(k);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}
const slot=()=>"k:"+(E.uid||"")+":"+(E.row?E.row.salt:"");

async function derive(pass,saltB64){const base=await crypto.subtle.importKey("raw",enc.encode(pass.normalize("NFKC")),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:fromB64(saltB64),iterations:310000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
async function encBytes(key,bytes){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,bytes));const out=new Uint8Array(12+ct.length);out.set(iv);out.set(ct,12);return out}
async function decBytes(key,buf){const u=new Uint8Array(buf);return new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:u.subarray(0,12)},key,u.subarray(12)))}

/* ---------- status ---------- */
async function load(force){if(E.loaded&&!force)return E.row;if(E.loading&&!force)return E.loading;
  E.loading=(async()=>{try{const {data:s}=await sb.auth.getSession();E.uid=s?.session?.user?.id||null;
    const {data,error}=await sb.from("couple_keys").select("salt,check_ct").eq("id",1).maybeSingle();if(error)throw error;E.row=data||null;
    if(E.row&&!E.key){const k=await idbGet(slot());if(k){try{const p=await decBytes(k,fromB64(E.row.check_ct));if(dec.decode(p)===CHECK)E.key=k}catch(e){}}}
    E.loaded=true;return E.row}catch(e){E.loaded=true;E.row=null;E.err=e;return null}finally{E.loading=null}})();return E.loading}
const enabled=()=>!!E.row,unlocked=()=>!!E.key;
/* kalau pasangan baru saja mengaktifkan enkripsi, perbarui status (maks. sekali per 8 detik) */
let lastRefresh=0;function refreshSoon(){if(E.row||Date.now()-lastRefresh<8000)return;lastRefresh=Date.now();load(true).then(()=>{if(E.row)bump()})}

/* ---------- API untuk chat/feed ---------- */
async function encText(t){if(!E.row)return t;if(!E.key)throw new Error(L("Buka kunci chat dulu (masukkan kata sandi chat).","Unlock the chat first (enter the chat password)."));
  const out="enc1:"+toB64(await encBytes(E.key,enc.encode(t)));E.cache.set(out,t);return out}
function show(t){if(typeof t!=="string"||!t.startsWith("enc1:"))return t;if(E.cache.has(t))return E.cache.get(t);if(!E.row)refreshSoon();
  if(!E.key)return "🔒 "+L("Pesan terenkripsi","Encrypted message");
  if(!E.pending.has(t)){E.pending.add(t);decBytes(E.key,fromB64(t.slice(5))).then(p=>E.cache.set(t,dec.decode(p))).catch(()=>E.cache.set(t,"⚠️ "+L("Tidak bisa dibuka (kata sandi berbeda)","Can't decrypt (different password)"))).finally(()=>{E.pending.delete(t);bump()})}
  return "…"}
let bt=0;function bump(){clearTimeout(bt);bt=setTimeout(()=>document.dispatchEvent(new CustomEvent("ravi-e2e")),40)}
async function encBlob(blob){if(!E.row)return {blob,ext:".jpg"};if(!E.key)throw new Error(L("Buka kunci chat dulu.","Unlock the chat first."));
  const out=await encBytes(E.key,new Uint8Array(await blob.arrayBuffer()));return {blob:new Blob([out],{type:"image/jpeg"}),ext:".enc"}}
/* src untuk <img>: foto biasa langsung, foto *.enc diunduh lalu didekripsi */
function imgSrc(path,url){if(!path||!/\.enc$/.test(path))return url;if(E.imgs.has(path))return E.imgs.get(path);if(!E.key||!url)return "";
  if(!E.pending.has(path)){E.pending.add(path);fetch(url).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(b=>decBytes(E.key,b)).then(p=>E.imgs.set(path,URL.createObjectURL(new Blob([p],{type:"image/jpeg"}))))
    .catch(()=>{}).finally(()=>{E.pending.delete(path);bump()})}
  return ""}

/* ---------- membuat / membuka kunci ---------- */
const needSecure=()=>{if(!window.crypto||!crypto.subtle)throw new Error(L("Enkripsi butuh koneksi aman. Buka RaVi lewat alamat https://.","Encryption needs a secure connection. Open RaVi via its https:// address."))};
async function setup(pass){needSecure();if(pass.length<8)throw new Error(L("Minimal 8 karakter.","At least 8 characters."));
  await load(true);if(E.row)return unlock(pass);
  const salt=toB64(crypto.getRandomValues(new Uint8Array(16)));const key=await derive(pass,salt);
  const check_ct=toB64(await encBytes(key,enc.encode(CHECK)));
  const {error}=await sb.from("couple_keys").insert({salt,check_ct});
  if(error){await load(true);if(E.row)return unlock(pass);throw error}
  E.row={salt,check_ct};E.key=key;await idbPut(slot(),key);bump();return true}
async function unlock(pass){needSecure();await load();if(!E.row)return setup(pass);const key=await derive(pass,E.row.salt);
  try{const p=await decBytes(key,fromB64(E.row.check_ct));if(dec.decode(p)!==CHECK)throw 0}catch(e){throw new Error(L("Kata sandi chat salah.","Wrong chat password."))}
  E.key=key;await idbPut(slot(),key);E.cache.clear();bump();return true}
async function forget(){await idbDel(slot());E.key=null;E.cache.clear();E.imgs.forEach(u=>URL.revokeObjectURL(u));E.imgs.clear();bump()}

/* ---------- dialog ---------- */
function dialog(){const first=!E.row;
  const bg=modal(first?L("🔐 Aktifkan enkripsi chat","🔐 Turn on chat encryption"):L("🔐 Buka kunci chat","🔐 Unlock chat"),
   `<div class="crumb" style="line-height:1.5">${first?L("Buat <b>kata sandi chat</b> bersama Vina. Semua pesan, stiker, foto, caption & komentar baru dienkripsi di HP sebelum dikirim. Server tidak bisa membacanya.<br><br>⚠️ Kata sandi ini <b>tidak bisa dipulihkan</b>. Kalau lupa, pesan terenkripsi tidak bisa dibuka lagi. Simpan di tempat aman dan beri tahu Vina secara langsung (jangan lewat chat ini).","Create a shared <b>chat password</b> with Vina. All new messages, stickers, photos, captions and comments are encrypted on the phone before sending. The server can't read them.<br><br>⚠️ This password <b>can't be recovered</b>. If it's lost, encrypted messages can't be opened again. Keep it safe and tell Vina in person (not through this chat)."):L("Masukkan kata sandi chat yang sama dengan yang dibuat bersama pasanganmu. Cukup sekali di perangkat ini.","Enter the same chat password you created with your partner. Only once on this device.")}</div>
    <label style="margin-top:10px;display:block">${L("Kata sandi chat","Chat password")}</label><input type="password" id="e2P" autocomplete="new-password" minlength="8">
    ${first?`<label style="margin-top:8px;display:block">${L("Ulangi","Repeat")}</label><input type="password" id="e2P2" autocomplete="new-password">`:""}
    <div class="msg err hide" id="e2M" style="margin-top:8px"></div>`,
   async g=>{const p=g.querySelector("#e2P").value,m=g.querySelector("#e2M"),btn=g.querySelector(".ok");
     if(first&&p!==g.querySelector("#e2P2").value){m.textContent=L("Kata sandi tidak sama.","Passwords don't match.");m.classList.remove("hide");return false}
     btn.disabled=true;btn.textContent=L("Memproses…","Working…");
     try{first?await setup(p):await unlock(p);status(first?L("Enkripsi end-to-end aktif 🔐","End-to-end encryption is on 🔐"):L("Chat terbuka di perangkat ini 🔓","Chat unlocked on this device 🔓"),"ok")}
     catch(e){btn.disabled=false;btn.textContent=first?L("Aktifkan","Turn on"):L("Buka","Unlock");m.textContent=e.message||String(e);m.classList.remove("hide");return false}},
   first?L("Aktifkan","Turn on"):L("Buka","Unlock"));
  setTimeout(()=>bg.querySelector("#e2P").focus(),50)}

/* ---------- banner di Chat & Feed ---------- */
const css=document.createElement("style");css.textContent=`.e2-bar{display:flex;gap:8px;align-items:center;padding:7px 12px;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.4;background:var(--grnS)}
.e2-bar.off{background:var(--accS)}.e2-bar.lock{background:var(--ambS)}.e2-bar b{display:block}.e2-bar>div{flex:1;min-width:0}`;document.head.appendChild(css);
async function decorate(){if(typeof route==="undefined"||(route!=="chat"&&route!=="feed"))return;await load();if(!E.row)refreshSoon();
  const v=document.getElementById("view");if(!v)return;const host=route==="chat"?v.querySelector(".ch-wrap .ch-head"):v.querySelector(".ph");if(!host||v.querySelector(".e2-bar"))return;
  const bar=document.createElement("div");
  if(!enabled()){bar.className="e2-bar off";bar.innerHTML=`<span>🔓</span><div><b>${L("Enkripsi end-to-end belum aktif","End-to-end encryption is off")}</b>${L("Aktifkan supaya isi chat & feed tidak bisa dibaca server.","Turn it on so the server can't read chat and feed content.")}</div><button class="sm pri">${L("Aktifkan","Turn on")}</button>`}
  else if(!unlocked()){bar.className="e2-bar lock";bar.innerHTML=`<span>🔒</span><div><b>${L("Chat terkunci di perangkat ini","Chat is locked on this device")}</b>${L("Masukkan kata sandi chat untuk membaca & mengirim.","Enter the chat password to read and send.")}</div><button class="sm pri">${L("Buka","Unlock")}</button>`}
  else{bar.className="e2-bar";bar.innerHTML=`<span>🔐</span><div>${L("Terenkripsi end-to-end. Hanya kamu dan pasanganmu yang bisa membaca.","End-to-end encrypted. Only you and your partner can read this.")}</div>`}
  const b=bar.querySelector("button");if(b)b.onclick=dialog;host.after(bar)}
new MutationObserver(()=>{decorate().catch(()=>{})}).observe(document.getElementById("view")||document.body,{childList:true});
document.addEventListener("ravi-e2e",()=>{if(typeof route==="undefined"||(route!=="chat"&&route!=="feed"))return;document.querySelectorAll("#view .e2-bar").forEach(b=>b.remove());if(window.RAVI_SOCIAL_REFRESH)window.RAVI_SOCIAL_REFRESH();decorate().catch(()=>{})});

window.RAVI_E2E={load,enabled,unlocked,encText,show,encBlob,imgSrc,dialog,forget};
})();
