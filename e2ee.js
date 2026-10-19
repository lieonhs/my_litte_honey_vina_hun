/* =====================================================================
   🔐 ENKRIPSI END-TO-END PER AKUN (v3) untuk Chat, Grup & Feed
   - Tiap AKUN punya pasangan kunci ECDH P-256. Kunci privat dibungkus AES-GCM dengan
     kunci turunan PBKDF2-SHA256 (600.000×) dari password login, lalu disimpan di
     couple_ukeys. Server hanya melihat bungkusannya — tanpa password tidak bisa dibuka.
   - Login di HP/laptop mana pun → password membuka kunci yang sama → pesan lama tetap terbaca.
   - Tiap pesan dikunci dengan kunci acak AES-256-GCM; kunci itu dibungkus untuk setiap
     anggota chat (ECDH → HKDF-SHA256 → AES-GCM). Foto & file: kunci acak per berkas.
   - Kode keamanan 60 digit per kontak (SHA-512 dari kedua kunci publik).
   - v1 (kata sandi bersama) & v2 (per perangkat) tetap bisa DIBACA bila pernah dipakai.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const te=new TextEncoder(),td=new TextDecoder();
const toB64=u=>{let s="";const b=u instanceof Uint8Array?u:new Uint8Array(u);for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)};
const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const secure=()=>!!(window.crypto&&crypto.subtle&&window.indexedDB);
const ITER=600000;
const E={uid:null,email:"",state:"init",err:null,priv:null,pub:null,keys:new Map(),loading:null,
  cache:new Map(),pending:new Set(),imgs:new Map(),wrap:new Map(),pubKeys:new Map(),
  v1row:null,v1key:null,dev:null,devices:null,listeners:new Set()};

/* ---------- IndexedDB ---------- */
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open("ravi-e2e",2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("keys"))r.result.createObjectStore("keys")};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbGet(k){try{const db=await idb();return await new Promise(res=>{const t=db.transaction("keys").objectStore("keys").get(k);t.onsuccess=()=>res(t.result||null);t.onerror=()=>res(null)})}catch(e){return null}}
async function idbPut(k,v){try{const db=await idb();return await new Promise(res=>{const t=db.transaction("keys","readwrite");t.objectStore("keys").put(v,k);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}catch(e){return false}}

/* ---------- primitif ---------- */
async function aesEnc(key,bytes){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,bytes));const o=new Uint8Array(12+ct.length);o.set(iv);o.set(ct,12);return o}
async function aesDec(key,buf){const u=new Uint8Array(buf);return new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:u.subarray(0,12)},key,u.subarray(12)))}
const newKey=()=>crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
const rawKey=async k=>new Uint8Array(await crypto.subtle.exportKey("raw",k));
const importAes=raw=>crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
const jwkPub=j=>({kty:"EC",crv:"P-256",x:j.x,y:j.y});
async function importPub(j){const id=j.x+"."+j.y;if(E.pubKeys.has(id))return E.pubKeys.get(id);const k=await crypto.subtle.importKey("jwk",jwkPub(j),{name:"ECDH",namedCurve:"P-256"},false,[]);E.pubKeys.set(id,k);return k}
async function kek(pw,salt,iter){const base=await crypto.subtle.importKey("raw",te.encode(String(pw).normalize("NFKC")),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:iter||ITER,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
const pfx=j=>j.x.slice(0,16);
/* kunci pembungkus antara akun ini dan akun lain */
async function wrapKey(otherUid,otherPub){const id=otherUid+":"+otherPub.x;if(E.wrap.has(id))return E.wrap.get(id);
  const k=await deriveWrap(E.priv,E.uid,E.pub,otherUid,otherPub);E.wrap.set(id,k);return k}
async function deriveWrap(myPriv,myUid,myPub,otherUid,otherPub){
  const bits=await crypto.subtle.deriveBits({name:"ECDH",public:await importPub(otherPub)},myPriv,256);
  const hk=await crypto.subtle.importKey("raw",bits,"HKDF",false,["deriveKey"]);
  const info=[myUid+":"+myPub.x,otherUid+":"+otherPub.x].sort().join("|");
  return crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:te.encode("ravi-e2e-v3"),info:te.encode(info)},hk,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}

/* ---------- kunci publik semua anggota (+ riwayat kunci lama supaya pesan lama tetap terbaca) ---------- */
const seenKey=()=>"ravi_e2e_seen3_"+E.uid;
function seen(){try{return JSON.parse(localStorage.getItem(seenKey())||"{}")}catch(e){return {}}}
function saveSeen(s){try{localStorage.setItem(seenKey(),JSON.stringify(s))}catch(e){}}
let keysAt=0,keysP=null;
async function loadKeys(force){if(!force&&Date.now()-keysAt<20000)return E.keys;if(keysP)return keysP;
  keysP=(async()=>{const {data,error}=await sb.from("couple_ukeys").select("user_id,pub,updated_at");if(error)throw error;keysAt=Date.now();
    const s=seen();let changed=false;const m=new Map();
    for(const r of data||[]){if(!r.pub||!r.pub.x)continue;m.set(r.user_id,r.pub);
      const h=s[r.user_id]||(s[r.user_id]={cur:null,old:[],warn:false});
      if(h.cur&&h.cur.x!==r.pub.x){h.old=[h.cur,...(h.old||[])].slice(0,5);if(r.user_id!==E.uid)h.warn=true;changed=true}
      if(!h.cur||h.cur.x!==r.pub.x){h.cur={x:r.pub.x,y:r.pub.y};changed=true}}
    E.keys=m;if(changed){saveSeen(s);bump()}return m})();
  try{return await keysP}finally{keysP=null}}
function pubFor(uid,prefix){const k=E.keys.get(uid);if(k&&(!prefix||pfx(k)===prefix))return k;const h=seen()[uid];if(!h)return k||null;
  for(const o of [h.cur,...(h.old||[])])if(o&&(!prefix||o.x.slice(0,16)===prefix))return o;return null}

/* ---------- membuka / membuat kunci akun ---------- */
const serverRow=async()=>(await sb.from("couple_ukeys").select("pub,wrapped,salt,iter,wrapped_sys").eq("user_id",E.uid).maybeSingle()).data||null;
/* kunci sistem per akun (dari Vault di server, hanya untuk anggota yang login): membuka kunci akun otomatis tanpa minta password */
let escK=null;async function escrowKey(){if(escK)return escK;try{const {data,error}=await sb.rpc("ravi_escrow_key");if(error||!data)return null;escK=await importAes(fromB64(data));return escK}catch(e){return null}}
async function saveEscrow(pk){const k=await escrowKey();if(!k)return;try{await sb.from("couple_ukeys").update({wrapped_sys:toB64(await aesEnc(k,pk))}).eq("user_id",E.uid)}catch(e){}}
async function fromEscrow(server){if(!server||!server.wrapped_sys)return false;const k=await escrowKey();if(!k)return false;
  try{const pk=await aesDec(k,fromB64(server.wrapped_sys));E.priv=await crypto.subtle.importKey("pkcs8",pk,{name:"ECDH",namedCurve:"P-256"},false,["deriveBits"]);pk.fill(0);E.pub=jwkPub(server.pub);
    await idbPut("acct:"+E.uid,{priv:E.priv,pub:E.pub});E.wrap.clear();E.state="ok";for(const [k2,v] of E.cache)if(typeof v==="string"&&v.startsWith("🔒"))E.cache.delete(k2);return true}catch(e){return false}}
/* akun belum punya kunci: buat diam-diam (tanpa password), disimpan lewat kunci sistem */
async function createSilent(){const k=await escrowKey();if(!k)return false;
  const kp=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
  const pj=await crypto.subtle.exportKey("jwk",kp.publicKey),pk=new Uint8Array(await crypto.subtle.exportKey("pkcs8",kp.privateKey));const pub=jwkPub(pj);
  const {error}=await sb.from("couple_ukeys").insert({pub,wrapped:"",salt:"",iter:0,wrapped_sys:toB64(await aesEnc(k,pk))});
  if(error){pk.fill(0);return false}
  E.priv=await crypto.subtle.importKey("pkcs8",pk,{name:"ECDH",namedCurve:"P-256"},false,["deriveBits"]);pk.fill(0);E.pub=pub;
  await idbPut("acct:"+E.uid,{priv:E.priv,pub:E.pub});E.state="ok";await loadKeys(true);return true}
async function load(force){if(E.state==="ok"&&!force)return true;if(E.loading)return E.loading;
  E.loading=(async()=>{try{
      if(!secure()){E.state="insecure";throw new Error(L("Enkripsi butuh koneksi aman (https).","Encryption needs a secure (https) connection."))}
      const {data:s}=await sb.auth.getSession();E.uid=s?.session?.user?.id||null;E.email=s?.session?.user?.email||"";if(!E.uid)throw new Error("login");
      await loadKeys(true);
      const server=E.keys.get(E.uid)?await serverRow():null;
      const local=await idbGet("acct:"+E.uid);
      if(server&&local&&local.priv&&local.pub&&local.pub.x===server.pub.x){E.priv=local.priv;E.pub=local.pub;E.state="ok";
        const pw=window.__ravi_pw;if(!server.wrapped_sys&&pw&&server.wrapped){try{await unlock(pw,{server})}catch(e){}}}
      else{
        if(await fromEscrow(server)){}                  /* otomatis, tanpa password */
        else{const pw=window.__ravi_pw;               /* password yang baru diketik di layar login (hanya di memori) */
          if(pw){try{await unlock(pw,{server,verified:true})}catch(e){}}
          if(E.state!=="ok"&&!server)await createSilent().catch(()=>{});
          if(E.state!=="ok")E.state=server?"needpw":"nokey"}}
      window.__ravi_pw=undefined;
      loadV1().catch(()=>{});loadDev().catch(()=>{});
      E.err=null;bump();return E.state==="ok"}
    catch(e){if(E.state==="init")E.state="err";E.err=e;bump();return false}finally{E.loading=null}})();
  return E.loading}
async function unlock(pw,o={}){const server=o.server!==undefined?o.server:await serverRow();
  if(server){if(!server.wrapped){if(await fromEscrow(server)){bump();return true}throw new Error(L("Kunci belum bisa dibuka. Coba lagi sebentar.","Key can't be opened yet. Try again shortly."))}
    const k=await kek(pw,fromB64(server.salt),server.iter);let pk;
    try{pk=await aesDec(k,fromB64(server.wrapped))}catch(e){throw new Error(L("Password salah. Pakai password yang kamu pakai untuk login RaVi.","Wrong password. Use the password you sign in to RaVi with."))}
    if(!server.wrapped_sys)await saveEscrow(pk);
    const priv=await crypto.subtle.importKey("pkcs8",pk,{name:"ECDH",namedCurve:"P-256"},false,["deriveBits"]);pk.fill(0);
    E.priv=priv;E.pub=jwkPub(server.pub)}
  else{ /* akun belum punya kunci: buat baru */
    if(!o.verified)await verifyPassword(pw);
    const kp=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
    const pj=await crypto.subtle.exportKey("jwk",kp.publicKey),pk=new Uint8Array(await crypto.subtle.exportKey("pkcs8",kp.privateKey));
    const salt=crypto.getRandomValues(new Uint8Array(16)),wrapped=await aesEnc(await kek(pw,salt,ITER),pk);
    const pub=jwkPub(pj);
    const ek=await escrowKey();const {error}=await sb.from("couple_ukeys").insert({pub,wrapped:toB64(wrapped),salt:toB64(salt),iter:ITER,...(ek?{wrapped_sys:toB64(await aesEnc(ek,pk))}:{})});
    if(error){pk.fill(0);if(/duplicate|unique|23505/i.test((error.message||"")+(error.code||"")))return unlock(pw,{});throw error}
    E.priv=await crypto.subtle.importKey("pkcs8",pk,{name:"ECDH",namedCurve:"P-256"},false,["deriveBits"]);pk.fill(0);E.pub=pub;await loadKeys(true)}
  await idbPut("acct:"+E.uid,{priv:E.priv,pub:E.pub});E.wrap.clear();E.state="ok";
  for(const [k,v] of E.cache)if(typeof v==="string"&&v.startsWith("🔒"))E.cache.delete(k);bump();return true}
/* memastikan password benar sebelum membuat kunci baru (supaya di HP lain password yang sama bisa membukanya) */
async function verifyPassword(pw){let aal=null;try{aal=(await sb.auth.mfa.getAuthenticatorAssuranceLevel()).data}catch(e){}
  if(aal&&(aal.currentLevel==="aal2"||aal.nextLevel==="aal2"))return; /* akun 2FA: login ulang akan menurunkan sesi; cukup konfirmasi ganda di dialog */
  const {error}=await sb.auth.signInWithPassword({email:E.email,password:pw});if(error)throw new Error(L("Password salah. Pakai password login RaVi.","Wrong password. Use your RaVi sign-in password."))}
/* ganti password login + bungkus ulang kunci akun (kunci & pesan lama tetap sama) */
async function rewrap(newPw,oldPw){const server=await serverRow();
  let pk=null;if(server&&server.wrapped){try{pk=await aesDec(await kek(oldPw,fromB64(server.salt),server.iter),fromB64(server.wrapped))}catch(e){throw new Error(L("Password lama salah.","Old password is wrong."))}}
  else await verifyPassword(oldPw);
  const {error}=await sb.auth.updateUser({password:newPw});if(error){if(pk)pk.fill(0);throw error}
  if(pk){const salt=crypto.getRandomValues(new Uint8Array(16)),wrapped=await aesEnc(await kek(newPw,salt,ITER),pk);await saveEscrow(pk);pk.fill(0);
    const {error:e2}=await sb.from("couple_ukeys").update({wrapped:toB64(wrapped),salt:toB64(salt),iter:ITER,updated_at:new Date().toISOString()}).eq("user_id",E.uid);if(e2)throw e2}
  return true}
/* lupa password / kunci rusak: buat kunci baru. Pesan terenkripsi lama tidak bisa dibuka lagi. */
async function resetKey(pw){await verifyPassword(pw);
  const kp=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
  const pj=await crypto.subtle.exportKey("jwk",kp.publicKey),pk=new Uint8Array(await crypto.subtle.exportKey("pkcs8",kp.privateKey));
  const salt=crypto.getRandomValues(new Uint8Array(16)),wrapped=await aesEnc(await kek(pw,salt,ITER),pk);
  const ek=await escrowKey(),ws=ek?toB64(await aesEnc(ek,pk)):null;
  const priv=await crypto.subtle.importKey("pkcs8",pk,{name:"ECDH",namedCurve:"P-256"},false,["deriveBits"]);pk.fill(0);
  const row={pub:jwkPub(pj),wrapped:toB64(wrapped),salt:toB64(salt),iter:ITER,wrapped_sys:ws,updated_at:new Date().toISOString()};
  const had=!!(await serverRow());const {error}=had?await sb.from("couple_ukeys").update(row).eq("user_id",E.uid):await sb.from("couple_ukeys").insert(row);if(error)throw error;
  E.priv=priv;E.pub=row.pub;await idbPut("acct:"+E.uid,{priv,pub:row.pub});E.wrap.clear();E.cache.clear();E.state="ok";await loadKeys(true);bump();return true}

/* ---------- v3: amplop pesan ---------- */
const missing=uids=>uids.filter(u=>!E.keys.get(u));
/* kalau ada anggota yang belum punya kunci, pesan dikirim tanpa E2E (tetap privat untuk anggota chat lewat RLS) */
async function sealFor(text,uids){if(E.state!=="ok")await load();
  /* kunci akun ada tapi belum dibuka di perangkat ini: jangan diam-diam kirim tanpa enkripsi */
  await loadKeys();let miss=missing(uids);if(miss.length){await loadKeys(true);miss=missing(uids)}if(miss.length)return text;
  if(E.state!=="ok"){ /* perangkat ini belum terbuka: tetap kunci pesannya dengan kunci sementara (tanpa minta password) */
    if(!E.uid)return text;const kp=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]),ep=jwkPub(await crypto.subtle.exportKey("jwk",kp.publicKey));
    const ck=await newKey(),raw=await rawKey(ck),ct=await aesEnc(ck,te.encode(text));const k=[];
    for(const u of new Set([...uids,E.uid])){const p=E.keys.get(u);if(!p)continue;k.push([u,pfx(p),toB64(await aesEnc(await deriveWrap(kp.privateKey,E.uid,ep,u,p),raw))])}
    const out="enc3:"+toB64(te.encode(JSON.stringify({s:E.uid,e:ep,c:toB64(ct),k})));E.cache.set(out,text);return out}
  const ck=await newKey(),raw=await rawKey(ck),ct=await aesEnc(ck,te.encode(text));const k=[];
  for(const u of new Set([...uids,E.uid])){const p=u===E.uid?E.pub:E.keys.get(u);if(!p)continue;k.push([u,pfx(p),toB64(await aesEnc(await wrapKey(u,p),raw))])}
  const out="enc3:"+toB64(te.encode(JSON.stringify({s:E.uid,sp:pfx(E.pub),c:toB64(ct),k})));E.cache.set(out,text);return out}
async function open3(t){const env=JSON.parse(td.decode(fromB64(t.slice(5))));
  const mine=(env.k||[]).find(x=>x[0]===E.uid);if(!mine)throw new Error("nokey");
  if(mine[1]!==pfx(E.pub))throw new Error("oldkey");
  let raw;if(env.e){raw=await aesDec(await deriveWrap(E.priv,E.uid,E.pub,env.s,env.e),fromB64(mine[2]))}
  else{let sp=pubFor(env.s,env.sp);if(!sp){await loadKeys(true);sp=pubFor(env.s,env.sp)}if(!sp)throw new Error("nosender");
  raw=await aesDec(await wrapKey(env.s,sp),fromB64(mine[2]))}return td.decode(await aesDec(await importAes(raw),fromB64(env.c)))}
const isEnc=t=>typeof t==="string"&&/^enc[123]:/.test(t);
function show(t){if(typeof t!=="string"||!isEnc(t))return t;
  if(E.cache.has(t))return E.cache.get(t);
  if(t.startsWith("enc1:"))return showV1(t);
  if(t.startsWith("enc2:"))return showV2(t);
  if(E.state!=="ok"){if(E.state==="init"&&!E.loading)load();return E.loading||E.state==="init"?"…":"🔒 "+L("Pesan lama · ketuk untuk membuka","Older message · tap to open")}
  if(!E.pending.has(t)){E.pending.add(t);
    open3(t).then(p=>E.cache.set(t,p)).catch(e=>E.cache.set(t,"🔒 "+({nokey:L("Pesan ini tidak dikunci untukmu","Not encrypted for you"),oldkey:L("Dikunci untuk kunci lamamu","Locked to your old key"),nosender:L("Kunci pengirim tidak dikenal","Unknown sender key")}[e&&e.message]||L("Tidak bisa dibuka","Can't be opened"))))
      .finally(()=>{E.pending.delete(t);bump()})}
  return "…"}
const ready=t=>typeof t!=="string"||!isEnc(t)||E.cache.has(t);
let bt=0;function bump(){clearTimeout(bt);bt=setTimeout(()=>{document.dispatchEvent(new CustomEvent("ravi-e2e"));E.listeners.forEach(f=>{try{f()}catch(e){}})},30)}

/* ---------- foto & file: SELALU dikunci dengan kunci acak per berkas (kuncinya disimpan di dalam pesan) ---------- */
async function encBlob(blob){if(!secure())return {blob,ext:".jpg",k:null};
  const fk=await newKey(),out=await aesEnc(fk,new Uint8Array(await blob.arrayBuffer()));return {blob:new Blob([out],{type:"application/octet-stream"}),ext:".enc",k:toB64(await rawKey(fk))}}
async function decFile(buf,k){if(k)return aesDec(await importAes(fromB64(k)),buf);if(E.v1key)return aesDec(E.v1key,buf);throw new Error(L("Kunci file tidak ada.","Missing file key."))}
function imgSrc(path,url,k){if(!path||!/\.enc$/.test(path))return url;if(E.imgs.has(path))return E.imgs.get(path);if(!url||(!k&&!E.v1key))return "";
  if(!E.pending.has(path)){E.pending.add(path);fetch(url).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(b=>decFile(b,k)).then(p=>E.imgs.set(path,URL.createObjectURL(new Blob([p],{type:"image/jpeg"})))).catch(()=>{}).finally(()=>{E.pending.delete(path);bump()})}
  return ""}

/* ---------- kode keamanan per kontak ---------- */
async function safety(uid){await loadKeys(true);const a=E.pub||E.keys.get(E.uid),b=E.keys.get(uid);if(!a||!b)return null;
  const list=[E.uid+":"+a.x+":"+a.y,uid+":"+b.x+":"+b.y].sort().join("\n");
  const h=new Uint8Array(await crypto.subtle.digest("SHA-512",te.encode("ravi-safety-v3\n"+list)));const g=[];
  for(let i=0;i<12;i++){let n=0;for(let j=0;j<5;j++)n=(n*256+h[i*5+j])%100000;g.push(String(n).padStart(5,"0"))}return g}
const keyChanged=uid=>!!(seen()[uid]||{}).warn;
function ackKey(uid){const s=seen();if(s[uid]){s[uid].warn=false;saveSeen(s);bump()}}
async function safetyDialog(uid,name){const g=await safety(uid);
  const bg=modal("🔐 "+L("Kode keamanan","Security code")+(name?" · "+name:""),g?`<div class="crumb" style="line-height:1.5">${L("Pesan, foto & file kalian terenkripsi. Untuk memastikan tidak ada yang menyadap, cocokkan 60 angka ini di HP kamu dan HP dia <b>secara langsung</b> (bukan lewat chat). Kalau sama persis, sambungan kalian aman.","Your messages, photos and files are end-to-end encrypted. To be sure nobody is intercepting, compare these 60 digits on both phones <b>in person</b> (not over chat). If they match exactly, you're secure.")}</div>
    <div class="sc-code">${g.map(x=>`<span>${x}</span>`).join("")}</div>${keyChanged(uid)?`<div class="msg warn" style="margin-top:8px">⚠️ ${L("Kode berubah karena dia membuat kunci baru (misalnya lupa password). Cocokkan ulang, lalu ketuk Sudah dicek.","The code changed because they created a new key (e.g. forgot their password). Compare again, then tap Verified.")}</div>`:""}`
    :`<div class="crumb">${E.state!=="ok"?L("Buka kunci enkripsimu dulu (masukkan password login).","Unlock your encryption first (enter your sign-in password)."):L("Dia belum membuka RaVi versi terbaru, jadi belum punya kunci enkripsi. Pesan untuknya sementara dikirim tanpa E2E (tetap privat untuk anggota chat).","They haven't opened the latest RaVi yet, so they have no encryption key. Messages to them are sent without E2E for now (still private to chat members).")}</div>`,
    ()=>{ackKey(uid)},keyChanged(uid)?L("Sudah dicek ✓","Verified ✓"):"OK");const c=bg.querySelector(".c");if(c)c.style.display="none"}

/* ---------- buka otomatis: pakai password yang tersimpan di browser (Chrome/Android), kalau tidak ada baru tanya ---------- */
let autoP=null;
function autoUnlock(o){if(E.state==="ok")return Promise.resolve(true);if(autoP)return autoP;
  autoP=(async()=>{try{if(E.state==="init"||E.loading)await load();if(E.state==="ok")return true;
      if(E.state==="needpw"&&window.PasswordCredential&&navigator.credentials){try{const c=await navigator.credentials.get({password:true,mediation:"optional"});
          if(c&&c.password){try{await unlock(c.password);return true}catch(e){}}}catch(e){}}
      if(o&&o.ask&&(E.state==="needpw"||E.state==="nokey"))return await unlockDialog();return false}
    finally{setTimeout(()=>{autoP=null},300)}})();return autoP}
/* ---------- dialog buka kunci ---------- */
function unlockDialog(){return new Promise(res=>{const create=E.state==="nokey";
  const bg=modal("🔐 "+(create?L("Aktifkan enkripsi chat","Turn on chat encryption"):L("Buka kunci enkripsi","Unlock encryption")),
    `<div class="crumb" style="line-height:1.5">${create?L("Masukkan password login RaVi-mu. Password ini mengunci kunci enkripsi akunmu, jadi chat bisa dibuka di HP atau laptop mana pun yang kamu pakai login.","Enter your RaVi sign-in password. It locks your account's encryption key, so chats open on any phone or laptop you sign in on.")
      :L("Masukkan password login RaVi sekali di perangkat ini untuk membuka pesan terenkripsi. Setelah itu tidak perlu lagi.","Enter your RaVi sign-in password once on this device to open encrypted messages. You won't need it again here.")}</div>
     <input type="email" autocomplete="username" value="${esc(E.email||"")}" readonly hidden aria-hidden="true">
     <label style="margin-top:10px">Password</label><input type="password" id="e3P" autocomplete="current-password">
     ${create?`<label style="margin-top:8px">${L("Ulangi password","Repeat password")}</label><input type="password" id="e3P2" autocomplete="current-password">`:""}
     <div class="msg err hide" id="e3M" style="margin-top:8px"></div>
     <div class="crumb" style="margin-top:8px">⚠️ ${L("Kalau suatu hari lupa password lalu reset lewat email, pesan terenkripsi lama tidak bisa dibuka lagi.","If you ever forget your password and reset it by email, old encrypted messages can't be opened anymore.")}</div>`,
    async g=>{const p=g.querySelector("#e3P").value,m=g.querySelector("#e3M"),btn=g.querySelector(".ok");
      const fail=t=>{m.textContent=t;m.classList.remove("hide");btn.disabled=false;btn.textContent=create?L("Aktifkan","Turn on"):L("Buka","Unlock");return false};
      if(!p)return fail(L("Password wajib diisi.","Password is required."));
      if(create&&g.querySelector("#e3P2").value!==p)return fail(L("Kedua password tidak sama.","Passwords don't match."));
      btn.disabled=true;btn.textContent=L("Memproses…","Working…");
      try{await unlock(p);res(true);try{if(window.PasswordCredential&&E.email)navigator.credentials.store(new PasswordCredential({id:E.email,password:p})).catch(()=>{})}catch(e){}}catch(e){return fail(e.message||String(e))}},create?L("Aktifkan","Turn on"):L("Buka","Unlock"));
  setTimeout(()=>bg.querySelector("#e3P")?.focus(),50);
  bg.querySelector(".c")?.addEventListener("click",()=>res(false))})}

/* ---------- v2 (per perangkat, lama) — hanya untuk MEMBACA ---------- */
async function loadDev(){const d=await idbGet("dev:"+E.uid);if(!d)return;E.dev=d;
  try{const {data}=await sb.from("couple_devices").select("id,user_id,pub");E.devices=(data||[]).filter(x=>x.pub&&x.pub.x)}catch(e){E.devices=[]}
  for(const [k,v] of E.cache)if(k.startsWith("enc2:"))E.cache.delete(k);bump()}
const devWrap=new Map();
async function devWrapKey(d){if(devWrap.has(d.id))return devWrap.get(d.id);
  const bits=await crypto.subtle.deriveBits({name:"ECDH",public:await importPub(d.pub)},E.dev.priv,256);
  const hk=await crypto.subtle.importKey("raw",bits,"HKDF",false,["deriveKey"]);
  const k=await crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:te.encode("ravi-e2e-v2"),info:te.encode([E.dev.id,d.id].sort().join("|"))},hk,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
  devWrap.set(d.id,k);return k}
function showV2(t){if(!E.dev)return "🔒 "+L("Pesan lama (dibuka di perangkat lain)","Old message (opened on another device)");
  if(!E.pending.has(t)){E.pending.add(t);(async()=>{const env=JSON.parse(td.decode(fromB64(t.slice(5))));const mine=(env.k||[]).find(x=>x[0]===E.dev.id);if(!mine)throw new Error("nokey");
      const sender=(E.devices||[]).find(d=>d.id===env.s);if(!sender)throw new Error("nosender");
      const raw=await aesDec(await devWrapKey(sender),fromB64(mine[1]));return td.decode(await aesDec(await importAes(raw),fromB64(env.c)))})()
    .then(p=>E.cache.set(t,p)).catch(()=>E.cache.set(t,"🔒 "+L("Pesan lama (dibuka di perangkat lain)","Old message (opened on another device)"))).finally(()=>{E.pending.delete(t);bump()})}
  return "…"}

/* ---------- v1 (kata sandi bersama, lama) — hanya untuk MEMBACA ---------- */
const CHECK="ravi-e2e-ok";
async function loadV1(){const {data}=await sb.from("couple_keys").select("salt,check_ct").eq("id",1).maybeSingle();E.v1row=data||null;
  if(E.v1row&&!E.v1key){const k=await idbGet("k:"+E.uid+":"+E.v1row.salt);if(k){try{if(td.decode(await aesDec(k,fromB64(E.v1row.check_ct)))===CHECK){E.v1key=k;bump()}}catch(e){}}}}
function showV1(t){if(!E.v1key)return "🔒 "+L("Pesan lama (perlu kata sandi chat)","Old message (needs chat password)");
  if(!E.pending.has(t)){E.pending.add(t);aesDec(E.v1key,fromB64(t.slice(5))).then(p=>E.cache.set(t,td.decode(p))).catch(()=>E.cache.set(t,"⚠️ "+L("Tidak bisa dibuka","Can't decrypt"))).finally(()=>{E.pending.delete(t);bump()})}return "…"}

const css=document.createElement("style");css.textContent=`.sc-code{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 10px;margin-top:12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(15px,4.6vw,19px);font-weight:700;letter-spacing:.06em;text-align:center;background:var(--th);border-radius:14px;padding:12px;font-variant-numeric:tabular-nums}`;document.head.appendChild(css);
addEventListener("load",()=>{const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);load().catch(()=>{})}},700);setTimeout(()=>clearInterval(t),60000)});
/* coba lagi diam-diam saat aplikasi dibuka kembali (mis. kunci sistem baru tersedia) */
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&E.uid&&(E.state==="needpw"||E.state==="nokey"))load(true).catch(()=>{})});

window.RAVI_E2E_DEC=async(buf,k)=>decFile(buf,k);
window.RAVI_E2E={load,autoUnlock,state:()=>E.state,ok:()=>E.state==="ok",uid:()=>E.uid,unlock,unlockDialog,sealFor,show,ready,isEnc,encBlob,imgSrc,decFile,
  hasKey:u=>!!E.keys.get(u),loadKeys,missing,safety,safetyDialog,keyChanged,ackKey,rewrap,resetKey,
  on:f=>{E.listeners.add(f);return()=>E.listeners.delete(f)}};
})();
