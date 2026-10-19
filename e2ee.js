/* =====================================================================
   🔐 ENKRIPSI END-TO-END OTOMATIS (ala WhatsApp) untuk Chat & Feed
   v2 (default, tanpa kata sandi):
   - Tiap perangkat membuat pasangan kunci ECDH P-256 sendiri. Kunci privat disimpan
     di perangkat (IndexedDB, tidak bisa diekspor); kunci publik didaftarkan di tabel
     couple_devices.
   - Tiap pesan/foto/file dikunci dengan kunci acak AES-256-GCM baru. Kunci itu
     dibungkus untuk SETIAP perangkat penerima (pasangan + perangkatmu yang lain)
     memakai ECDH → HKDF-SHA256 → AES-GCM.
   - Kode keamanan 60 digit (SHA-512 dari semua kunci publik) untuk dicocokkan langsung.
   v1 (lama, kata sandi bersama): tetap bisa DIBACA bila pernah dipakai.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const te=new TextEncoder(),td=new TextDecoder();
const toB64=u=>{let s="";const b=u instanceof Uint8Array?u:new Uint8Array(u);for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)};
const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const secure=()=>!!(window.crypto&&crypto.subtle);
const E={uid:null,dev:null,devices:[],devAt:0,ok:false,err:null,loading:null,
  cache:new Map(),pending:new Set(),imgs:new Map(),wrapKeys:new Map(),pubKeys:new Map(),
  v1row:null,v1key:null,changed:false,partner:null};

/* ---------- IndexedDB ---------- */
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open("ravi-e2e",2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("keys"))r.result.createObjectStore("keys")};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbGet(k){const db=await idb();return new Promise(res=>{const t=db.transaction("keys").objectStore("keys").get(k);t.onsuccess=()=>res(t.result||null);t.onerror=()=>res(null)})}
async function idbPut(k,v){const db=await idb();return new Promise(res=>{const t=db.transaction("keys","readwrite");t.objectStore("keys").put(v,k);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}
async function idbDel(k){const db=await idb();return new Promise(res=>{const t=db.transaction("keys","readwrite");t.objectStore("keys").delete(k);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}

/* ---------- primitif ---------- */
async function aesEnc(key,bytes){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,bytes));const o=new Uint8Array(12+ct.length);o.set(iv);o.set(ct,12);return o}
async function aesDec(key,buf){const u=new Uint8Array(buf);return new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:u.subarray(0,12)},key,u.subarray(12)))}
const newKey=()=>crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
const rawKey=async k=>new Uint8Array(await crypto.subtle.exportKey("raw",k));
const importAes=raw=>crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
async function pubKeyOf(d){if(E.pubKeys.has(d.id))return E.pubKeys.get(d.id);const k=await crypto.subtle.importKey("jwk",d.pub,{name:"ECDH",namedCurve:"P-256"},false,[]);E.pubKeys.set(d.id,k);return k}
/* kunci pembungkus antara perangkat ini dan perangkat lain (ECDH → HKDF) */
async function wrapKeyFor(d){if(E.wrapKeys.has(d.id))return E.wrapKeys.get(d.id);
  const bits=await crypto.subtle.deriveBits({name:"ECDH",public:await pubKeyOf(d)},E.dev.priv,256);
  const hk=await crypto.subtle.importKey("raw",bits,"HKDF",false,["deriveKey"]);
  const ids=[E.dev.id,d.id].sort().join("|");
  const k=await crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:te.encode("ravi-e2e-v2"),info:te.encode(ids)},hk,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
  E.wrapKeys.set(d.id,k);return k}

/* ---------- perangkat ---------- */
async function myDevice(){const slot="dev:"+E.uid;let d=await idbGet(slot);
  if(!d){const kp=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},false,["deriveBits"]);
    const pub=await crypto.subtle.exportKey("jwk",kp.publicKey);d={id:crypto.randomUUID(),priv:kp.privateKey,pub:{kty:pub.kty,crv:pub.crv,x:pub.x,y:pub.y}};await idbPut(slot,d)}
  return d}
const ua=()=>{const u=navigator.userAgent;return (/iPhone|iPad/.test(u)?"iPhone/iPad":/Android/.test(u)?"Android":/Mac/.test(u)?"Mac":/Windows/.test(u)?"Windows":"Perangkat")+" · "+(/Edg\//.test(u)?"Edge":/Chrome\//.test(u)?"Chrome":/Safari\//.test(u)?"Safari":/Firefox\//.test(u)?"Firefox":"Browser")};
async function loadDevices(force){if(!force&&Date.now()-E.devAt<15000)return E.devices;
  const {data,error}=await sb.from("couple_devices").select("id,user_id,pub,label,created_at");if(error)throw error;
  E.devices=(data||[]).filter(d=>d.pub&&d.pub.x&&d.pub.y);E.devAt=Date.now();checkChanged();return E.devices}
function checkChanged(){const others=E.devices.filter(d=>d.user_id!==E.uid).map(d=>d.id).sort().join(",");const k="bbp_e2e_seen_"+E.uid;
  try{const prev=localStorage.getItem(k);if(prev===null){localStorage.setItem(k,others);return}if(prev!==others){E.changed=true;localStorage.setItem(k+"_pending",others)}}catch(e){}}
function ackChanged(){try{const k="bbp_e2e_seen_"+E.uid,p=localStorage.getItem(k+"_pending");if(p!==null)localStorage.setItem(k,p);localStorage.removeItem(k+"_pending")}catch(e){}E.changed=false;bump()}

async function load(force){if(E.ok&&!force)return true;if(E.loading&&!force)return E.loading;
  E.loading=(async()=>{try{if(!secure())throw new Error(L("Enkripsi butuh koneksi aman (https).","Encryption needs a secure (https) connection."));
      const {data:s}=await sb.auth.getSession();E.uid=s?.session?.user?.id||null;if(!E.uid)throw new Error("login");
      E.dev=await myDevice();
      const {error:upErr}=await sb.from("couple_devices").upsert({id:E.dev.id,pub:E.dev.pub,label:ua(),last_seen:new Date().toISOString()});
      if(upErr)throw upErr;
      await loadDevices(true);if(!E.devices.some(d=>d.id===E.dev.id))throw new Error("device not registered");
      E.ok=true;E.err=null;
      loadV1().catch(()=>{});
      return true}catch(e){E.ok=false;E.err=e;return false}finally{E.loading=null}})();return E.loading}
const enabled=()=>E.ok,unlocked=()=>E.ok;

/* ---------- v2: amplop pesan ---------- */
async function seal(bytes){await loadDevices();const ck=await newKey(),raw=await rawKey(ck),ct=await aesEnc(ck,bytes);
  const k=[];for(const d of E.devices){try{const w=await aesEnc(await wrapKeyFor(d),raw);k.push([d.id,toB64(w)])}catch(e){}}
  return {s:E.dev.id,c:toB64(ct),k}}
async function open(env){const mine=(env.k||[]).find(x=>x[0]===E.dev.id);if(!mine)throw new Error("nokey");
  let sender=E.devices.find(d=>d.id===env.s);if(!sender){await loadDevices(true);sender=E.devices.find(d=>d.id===env.s)}if(!sender)throw new Error("nosender");
  const raw=await aesDec(await wrapKeyFor(sender),fromB64(mine[1]));return aesDec(await importAes(raw),fromB64(env.c))}
/* pasangan belum pernah membuka versi ini → belum ada kunci tujuan. Kirim biasa (dan tampilkan peringatan)
   supaya pesan tetap terbaca, bukan terkunci selamanya. */
async function partnerReady(){await loadDevices();if(!E.devices.some(d=>d.user_id!==E.uid))await loadDevices(Date.now()-E.devAt>5000);
  const r=E.devices.some(d=>d.user_id!==E.uid);if(r!==E.partner){E.partner=r;bump()}return r}
async function encText(t){if(!E.ok)await load();if(!E.ok){if(E.v1key)return encTextV1(t);return t}
  if(!(await partnerReady()))return t;
  const env=await seal(te.encode(t));const out="enc2:"+toB64(te.encode(JSON.stringify(env)));E.cache.set(out,t);return out}
function show(t){if(typeof t!=="string")return t;
  if(t.startsWith("enc1:"))return showV1(t);
  if(!t.startsWith("enc2:"))return t;
  if(E.cache.has(t))return E.cache.get(t);
  if(!E.ok){if(!E.loading)load().then(ok=>{if(ok)bump()});return "🔒 "+L("Pesan terenkripsi","Encrypted message")}
  if(!E.pending.has(t)){E.pending.add(t);
    (async()=>{const env=JSON.parse(td.decode(fromB64(t.slice(5))));return td.decode(await open(env))})()
     .then(p=>E.cache.set(t,p)).catch(e=>E.cache.set(t,"🔒 "+(e&&e.message==="nokey"?L("Dikirim sebelum perangkat ini terdaftar","Sent before this device was added"):L("Tidak bisa dibuka di perangkat ini","Can't be opened on this device"))))
     .finally(()=>{E.pending.delete(t);bump()})}
  return "…"}
let bt=0;function bump(){clearTimeout(bt);bt=setTimeout(()=>document.dispatchEvent(new CustomEvent("ravi-e2e")),40)}

/* ---------- foto & file: kunci acak per berkas, disimpan DI DALAM pesan terenkripsi ---------- */
async function encBlob(blob){if(!E.ok)await load();
  if(E.ok&&!(await partnerReady()))return {blob,ext:".jpg",k:null};
  if(!E.ok){if(E.v1key){const out=await aesEnc(E.v1key,new Uint8Array(await blob.arrayBuffer()));return {blob:new Blob([out],{type:"application/octet-stream"}),ext:".enc",k:null}}return {blob,ext:".jpg",k:null}}
  const fk=await newKey(),out=await aesEnc(fk,new Uint8Array(await blob.arrayBuffer()));return {blob:new Blob([out],{type:"application/octet-stream"}),ext:".enc",k:toB64(await rawKey(fk))}}
async function decFile(buf,k){if(k)return aesDec(await importAes(fromB64(k)),buf);if(E.v1key)return aesDec(E.v1key,buf);throw new Error(L("Kunci file tidak ada.","Missing file key."))}
function imgSrc(path,url,k){if(!path||!/\.enc$/.test(path))return url;if(E.imgs.has(path))return E.imgs.get(path);if(!url||(!k&&!E.v1key))return "";
  if(!E.pending.has(path)){E.pending.add(path);fetch(url).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(b=>decFile(b,k)).then(p=>E.imgs.set(path,URL.createObjectURL(new Blob([p],{type:"image/jpeg"})))).catch(()=>{}).finally(()=>{E.pending.delete(path);bump()})}
  return ""}

/* ---------- kode keamanan ---------- */
async function safetyCode(){await loadDevices(true);const list=E.devices.map(d=>d.user_id+":"+d.pub.x+":"+d.pub.y).sort().join("\n");
  const h=new Uint8Array(await crypto.subtle.digest("SHA-512",te.encode("ravi-safety-v1\n"+list)));const g=[];
  for(let i=0;i<12;i++){let n=0;for(let j=0;j<5;j++)n=(n*256+h[i*5+j])%100000;g.push(String(n).padStart(5,"0"))}return g}
async function safetyDialog(){const g=await safetyCode();const mine=E.devices.filter(d=>d.user_id===E.uid),other=E.devices.filter(d=>d.user_id!==E.uid);
  const bg=modal(L("🔐 Kode keamanan","🔐 Security code"),`<div class="crumb" style="line-height:1.5">${L("Pesan, foto & file kalian terenkripsi end-to-end. Untuk memastikan tidak ada yang menyadap, cocokkan 60 angka ini di HP kamu dan HP pasangan <b>secara langsung</b> (bukan lewat chat). Kalau sama persis, sambungan kalian aman.","Your messages, photos and files are end-to-end encrypted. To be sure nobody is intercepting, compare these 60 digits on both phones <b>in person</b> (not over chat). If they match exactly, you're secure.")}</div>
    <div class="sc-code">${g.map(x=>`<span>${x}</span>`).join("")}</div>
    <div class="crumb" style="margin-top:8px">${L("Perangkatmu","Your devices")}: ${mine.length} · ${L("Perangkat pasangan","Partner's devices")}: ${other.length}${E.changed?`<div class="msg warn" style="margin-top:8px">⚠️ ${L("Kode berubah karena pasanganmu menambah/mengganti perangkat. Cocokkan ulang, lalu ketuk Sudah dicek.","The code changed because your partner added or replaced a device. Compare again, then tap Verified.")}</div>`:""}</div>`,
    ()=>{ackChanged()},E.changed?L("Sudah dicek ✓","Verified ✓"):"OK");const c=bg.querySelector(".c");if(c)c.style.display="none"}

/* ---------- v1 (lama, kata sandi bersama) — hanya untuk MEMBACA pesan lama ---------- */
const CHECK="ravi-e2e-ok";
async function loadV1(){const {data}=await sb.from("couple_keys").select("salt,check_ct").eq("id",1).maybeSingle();E.v1row=data||null;
  if(E.v1row&&!E.v1key){const k=await idbGet("k:"+E.uid+":"+E.v1row.salt);if(k){try{if(td.decode(await aesDec(k,fromB64(E.v1row.check_ct)))===CHECK){E.v1key=k;bump()}}catch(e){}}}}
async function unlockV1(pass){if(!E.v1row)await loadV1();if(!E.v1row)throw new Error(L("Tidak ada pesan lama berkata sandi.","No old password-protected messages."));
  const base=await crypto.subtle.importKey("raw",te.encode(pass.normalize("NFKC")),"PBKDF2",false,["deriveKey"]);
  const key=await crypto.subtle.deriveKey({name:"PBKDF2",salt:fromB64(E.v1row.salt),iterations:310000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
  try{if(td.decode(await aesDec(key,fromB64(E.v1row.check_ct)))!==CHECK)throw 0}catch(e){throw new Error(L("Kata sandi chat salah.","Wrong chat password."))}
  E.v1key=key;await idbPut("k:"+E.uid+":"+E.v1row.salt,key);E.cache.clear();bump()}
async function encTextV1(t){const out="enc1:"+toB64(await aesEnc(E.v1key,te.encode(t)));E.cache.set(out,t);return out}
function showV1(t){if(E.cache.has(t))return E.cache.get(t);if(!E.v1key)return "🔒 "+L("Pesan lama (perlu kata sandi chat)","Old message (needs chat password)");
  if(!E.pending.has(t)){E.pending.add(t);aesDec(E.v1key,fromB64(t.slice(5))).then(p=>E.cache.set(t,td.decode(p))).catch(()=>E.cache.set(t,"⚠️ "+L("Tidak bisa dibuka","Can't decrypt"))).finally(()=>{E.pending.delete(t);bump()})}return "…"}
function v1Dialog(){modal(L("🔐 Buka pesan lama","🔐 Open old messages"),`<div class="crumb">${L("Pesan lama dikunci dengan kata sandi chat. Masukkan sekali untuk membacanya. Pesan baru tidak butuh kata sandi lagi.","Old messages were locked with a chat password. Enter it once to read them. New messages don't need a password.")}</div><input type="password" id="e2P" style="margin-top:8px"><div class="msg err hide" id="e2M" style="margin-top:8px"></div>`,
  async g=>{try{await unlockV1(g.querySelector("#e2P").value)}catch(e){const m=g.querySelector("#e2M");m.textContent=e.message;m.classList.remove("hide");return false}},L("Buka","Unlock"))}
function dialog(){if(E.v1row&&!E.v1key)v1Dialog();else safetyDialog()}

/* ---------- tampilan di Chat & Feed ---------- */
const css=document.createElement("style");css.textContent=`.e2-bar{display:flex;gap:8px;align-items:center;padding:7px 12px;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.4;background:var(--ambS)}
.e2-bar b{display:block}.e2-bar>div{flex:1;min-width:0}
.e2-pill{all:unset;cursor:pointer;font-weight:800;color:var(--grn)}.e2-pill.warn{color:var(--amb)}.e2-pill:focus-visible{outline:2px solid var(--acc);border-radius:6px}
.sc-code{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 10px;margin-top:12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(15px,4.6vw,19px);font-weight:700;letter-spacing:.06em;text-align:center;background:var(--th);border-radius:14px;padding:12px;font-variant-numeric:tabular-nums}`;document.head.appendChild(css);
async function decorate(){if(typeof route==="undefined"||(route!=="chat"&&route!=="feed"))return;await load();
  const v=document.getElementById("view");if(!v)return;
  if(!E.ok){const host=route==="chat"?v.querySelector(".ch-wrap .ch-head"):v.querySelector(".ph");if(!host||v.querySelector(".e2-bar"))return;
    const bar=document.createElement("div");bar.className="e2-bar";
    bar.innerHTML=`<span>⚠️</span><div><b>${L("Enkripsi otomatis belum siap","Automatic encryption isn't ready")}</b><span class="em"></span></div>`;
    bar.querySelector(".em").textContent=/couple_devices|relation|schema cache/i.test(String(E.err&&E.err.message||E.err||""))?L("Jalankan supabase/setup-ravi.sql sekali di Supabase. Sampai itu, pesan baru dikirim tanpa enkripsi.","Run supabase/setup-ravi.sql once in Supabase. Until then, new messages are sent unencrypted."):String(E.err&&E.err.message||E.err||"");
    host.after(bar);return}
  if(!E.devices.some(d=>d.user_id!==E.uid)){E.partner=false;const host=route==="chat"?v.querySelector(".ch-wrap .ch-head"):v.querySelector(".ph");
    if(host&&!v.querySelector(".e2-bar.np")){const bar=document.createElement("div");bar.className="e2-bar np";
      bar.innerHTML=`<span>⏳</span><div><b>${L("Enkripsi aktif setelah pasanganmu membuka RaVi","Encryption turns on once your partner opens RaVi")}</b>${L("HP pasanganmu belum terdaftar, jadi pesan sementara dikirim biasa (tetap privat untuk kalian berdua). Begitu dia membuka chat sekali, pesan berikutnya otomatis terenkripsi.","Your partner's phone isn't registered yet, so messages are sent normally for now (still private to you two). Once they open the chat, new messages are encrypted automatically.")}</div>`;host.after(bar)}
    return}
  v.querySelectorAll(".e2-bar.np").forEach(b=>b.remove());
  const cr=route==="chat"?v.querySelector(".ch-head .crumb"):v.querySelector(".ph h1");
  if(cr&&!cr.querySelector(".e2-pill")){const p=document.createElement("button");p.className="e2-pill"+(E.changed?" warn":"");
    p.textContent=E.changed?" · ⚠️ "+L("Kode keamanan berubah","Security code changed"):" · 🔐 E2E";p.title=L("Lihat kode keamanan","View security code");p.onclick=e=>{e.stopPropagation();safetyDialog()};cr.appendChild(p)}
  if(E.v1row&&!E.v1key&&route==="chat"&&!v.querySelector(".e2-bar")){const host=v.querySelector(".ch-wrap .ch-head");if(host&&[...v.querySelectorAll(".bd")].some(b=>/^🔒/.test(b.textContent))){
    const bar=document.createElement("div");bar.className="e2-bar";bar.innerHTML=`<span>🔒</span><div><b>${L("Ada pesan lama berkata sandi","There are old password-locked messages")}</b>${L("Pesan baru sudah otomatis terenkripsi.","New messages are encrypted automatically.")}</div><button class="sm pri">${L("Buka","Open")}</button>`;
    bar.querySelector("button").onclick=v1Dialog;host.after(bar)}}}
new MutationObserver(()=>{decorate().catch(()=>{})}).observe(document.getElementById("view")||document.body,{childList:true});
document.addEventListener("ravi-e2e",()=>{if(typeof route==="undefined"||(route!=="chat"&&route!=="feed"))return;if(window.RAVI_SOCIAL_REFRESH)window.RAVI_SOCIAL_REFRESH();decorate().catch(()=>{})});
addEventListener("load",()=>{const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);load().catch(()=>{})}},1500);setTimeout(()=>clearInterval(t),60000)});

/* ---------- daftar perangkat (untuk halaman Keamanan) ---------- */
async function devices(){await load();if(!E.ok)return {ok:false,err:E.err,list:[]};await loadDevices(true);return {ok:true,me:E.dev&&E.dev.id,uid:E.uid,list:E.devices}}
async function removeDevice(id){const {error}=await sb.from("couple_devices").delete().eq("id",id);if(error)throw error;
  if(E.dev&&id===E.dev.id){await idbDel("dev:"+E.uid);E.ok=false;E.dev=null;E.wrapKeys.clear()}await loadDevices(true);bump()}

window.RAVI_E2E_DEC=async(buf,k)=>decFile(buf,k);
window.RAVI_E2E={load,enabled,unlocked,encText,show,encBlob,imgSrc,dialog,safetyDialog,devices,removeDevice,auto:true};
})();
