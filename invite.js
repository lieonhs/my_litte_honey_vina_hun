/* =====================================================================
   ✉️ UNDANG ORANG KE RaVi (link sekali pakai, berlaku 7 hari)
   Admin: Chat → 👤+ → "Buat link undangan" → kirim lewat WhatsApp.
   Yang diundang: buka link → isi nama, email, password → langsung masuk
   (enkripsi chat otomatis aktif, chat dengan pengundang langsung tersedia).
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const params=new URLSearchParams(location.search);
const INV=(params.get("invite")||"").replace(/[^A-Za-z0-9]/g,"");
const linkOf=c=>location.origin+location.pathname+"?invite="+c;
function newCode(){const a="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",r=crypto.getRandomValues(new Uint8Array(16));return [...r].map(x=>a[x%a.length]).join("")}
async function joinFn(body){const {data,error}=await sb.functions.invoke("ravi-join",{body});
  if(error){let msg=error.message;try{const j=await error.context.json();if(j&&j.error)msg=j.error}catch(e){}throw new Error(msg)}if(data&&data.error)throw new Error(data.error);return data}

/* ---------- admin: buat & bagikan link ---------- */
const css=document.createElement("style");css.textContent=`
.iv-link{display:flex;gap:6px;align-items:center;background:var(--th);border-radius:12px;padding:10px 12px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;word-break:break-all;margin:8px 0}
.iv-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px}.iv-btns .wa{background:#25d366;border-color:#25d366;color:#fff}
.iv-row{display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px}.iv-row .tx{flex:1;min-width:0}.iv-row .tx b{display:block}
.jn-box{max-width:420px}.jn-hero{display:flex;gap:12px;align-items:center;margin-bottom:12px}`;document.head.appendChild(css);
async function inviteSheet(){
  const bg=modal("✉️ "+L("Undang ke RaVi","Invite to RaVi"),`<div class="crumb" style="line-height:1.5">${L("Buat link, kirim ke orangnya (WhatsApp/IG). Dia buka link → isi nama, email & password sendiri → <b>menunggu persetujuanmu</b> di Panel Admin. Link hanya bisa dipakai <b>1 orang</b> dan berlaku <b>7 hari</b>.","Create a link and send it (WhatsApp/IG). They open it → enter their own name, email & password → <b>wait for your approval</b> in the Admin Panel. Each link works for <b>1 person</b> for <b>7 days</b>.")}</div>
    <label style="margin-top:10px">${L("Untuk siapa? (opsional)","Who is it for? (optional)")}</label><input id="ivNote" maxlength="40" placeholder="${L("mis. Dina, Mama","e.g. Dina, Mom")}">
    <button class="pri" id="ivMake" style="width:100%;margin-top:10px;min-height:44px">🔗 ${L("Buat link undangan","Create invite link")}</button>
    <div id="ivOut"></div><div id="ivList" style="margin-top:12px"></div>
    <button class="lnk" id="ivManual" style="margin-top:10px;font-size:12.5px">${L("Atau buatkan akunnya langsung (manual)","Or create the account yourself (manual)")}</button>`,()=>true,L("Selesai","Done"));
  const cc=bg.querySelector(".c");if(cc)cc.style.display="none";
  const out=bg.querySelector("#ivOut");
  bg.querySelector("#ivManual").onclick=()=>{bg.remove();window.RAVI_CHAT&&window.RAVI_CHAT.addMemberManual()};
  bg.querySelector("#ivMake").onclick=async e=>{const b=e.currentTarget;b.disabled=true;b.textContent="…";
    try{const code=newCode(),note=bg.querySelector("#ivNote").value.trim()||null;const {error}=await sb.from("ravi_invites").insert({code,note});if(error)throw error;
      const url=linkOf(code),msg=L("Hai! Aku mengundangmu ke RaVi 💬 Buka link ini, isi nama, email & password. Setelah aku setujui, kita bisa chat:\n","Hi! I'm inviting you to RaVi 💬 Open this link and enter your name, email & password. Once I approve, we can chat:\n")+url;
      out.innerHTML=`<div class="iv-link"><span style="flex:1"></span></div><div class="iv-btns"><a class="sm wa" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:12px;text-decoration:none;font-weight:800">🟢 WhatsApp</a><button class="sm" data-cp>📋 ${L("Salin link","Copy link")}</button>${navigator.share?`<button class="sm" data-sh style="grid-column:span 2">📤 ${L("Bagikan ke aplikasi lain","Share to another app")}</button>`:""}</div>`;
      out.querySelector(".iv-link span").textContent=url;out.querySelector("a.wa").href="https://wa.me/?text="+encodeURIComponent(msg);
      out.querySelector("[data-cp]").onclick=async()=>{try{await navigator.clipboard.writeText(msg);status(L("Link disalin 📋","Link copied 📋"),"ok")}catch(err){status(L("Tahan link di atas untuk menyalin.","Long-press the link above to copy it."),"warn")}};
      const sh=out.querySelector("[data-sh]");if(sh)sh.onclick=()=>navigator.share({title:"RaVi",text:msg}).catch(()=>{});
      b.textContent="🔗 "+L("Buat link lain","Create another link");b.disabled=false;list()}
    catch(err){b.disabled=false;b.textContent="🔗 "+L("Buat link undangan","Create invite link");status(L("Gagal membuat link: ","Couldn't create link: ")+(err.message||err),"err")}};
  async function list(){const box=bg.querySelector("#ivList");const {data}=await sb.from("ravi_invites").select("*").order("created_at",{ascending:false}).limit(10);if(!data||!data.length){box.innerHTML="";return}
    box.innerHTML=`<div class="crumb" style="font-weight:800">${L("Link terakhir","Recent links")}</div>`+data.map(x=>{const used=!!x.used_by,exp=new Date(x.expires_at)<new Date();
      return `<div class="iv-row"><span>${used?"✅":exp?"⌛":"🔗"}</span><div class="tx"><b></b><span class="crumb">${used?L("Sudah dipakai: ","Used by: ")+esc(window.RS?RS.name(x.used_by):""):exp?L("Kedaluwarsa","Expired"):L("Aktif sampai ","Active until ")+new Date(x.expires_at).toLocaleDateString(EN()?"en-GB":"id-ID",{day:"numeric",month:"short"})}</span></div>${!used&&!exp?`<button class="sm" data-off="${x.code}">${L("Batalkan","Revoke")}</button>`:""}</div>`}).join("");
    box.querySelectorAll(".iv-row .tx b").forEach((b,i)=>b.textContent=data[i].note||L("Undangan","Invite"));
    box.querySelectorAll("[data-off]").forEach(b=>b.onclick=async()=>{await sb.from("ravi_invites").update({expires_at:new Date().toISOString()}).eq("code",b.dataset.off);list()})}
  list()}
window.RAVI_INVITE=inviteSheet;

/* ---------- yang diundang: layar daftar ---------- */
async function showJoin(){let el=document.getElementById("login");if(!el){el=document.createElement("div");el.id="login";el.className="login";document.body.appendChild(el)}
  el.innerHTML=`<div class="box jn-box"><div style="background:var(--hdr);color:var(--hdrInk);padding:14px 16px;font-weight:600">RaVi</div><div style="padding:16px" id="jnB"><div class="crumb">${L("Memeriksa undangan…","Checking invite…")}</div></div></div>`;
  const B=document.getElementById("jnB");let host="RaVi";
  try{const r=await joinFn({action:"check",code:INV});host=r.host||host}
  catch(e){B.innerHTML=`<div class="msg err" style="margin:0 0 12px"></div><button class="pri" id="jnLogin" style="width:100%">${L("Sudah punya akun? Masuk","Have an account? Sign in")}</button>`;B.querySelector(".msg").textContent=e.message||String(e);
    document.getElementById("jnLogin").onclick=()=>{history.replaceState(null,"",location.pathname);_show()};return}
  B.innerHTML=`<div class="jn-hero">${window.pipi?window.pipi("party",64,"vnel"):"🎉"}<div><b style="font-size:17px"></b><div class="crumb">${L("Buat akunmu, lalu tunggu persetujuan admin.","Create your account, then wait for the admin's approval.")}</div></div></div>
    <label>${L("Nama panggilan","Your name")}</label><input id="jnN" maxlength="40" autocomplete="nickname"><div style="height:8px"></div>
    <label>Email</label><input id="jnE" type="email" autocomplete="email"><div style="height:8px"></div>
    <label>${L("Password (min. 8 karakter)","Password (min. 8 characters)")}</label><input id="jnP" type="password" autocomplete="new-password"><div style="height:8px"></div>
    <label>${L("Ulangi password","Repeat password")}</label><input id="jnP2" type="password" autocomplete="new-password">
    <div class="crumb" style="margin-top:8px">🔐 ${L("Password ini juga mengunci enkripsi chat-mu. Simpan baik-baik.","This password also locks your chat encryption. Keep it safe.")}</div>
    <div id="jnM" class="msg err hide" style="margin:12px 0 0"></div>
    <button class="pri" id="jnGo" style="width:100%;margin-top:14px;min-height:44px">${L("Daftar & masuk","Sign up & enter")}</button>
    <button class="lnk" id="jnLogin" style="margin-top:10px;font-size:12.5px">${L("Sudah punya akun? Masuk","Have an account? Sign in")}</button>`;
  B.querySelector(".jn-hero b").textContent=L("Kamu diundang oleh ","You're invited by ")+host+" 💌";
  const m=document.getElementById("jnM"),fail=t=>{m.textContent=t;m.classList.remove("hide");const g=document.getElementById("jnGo");g.disabled=false;g.textContent=L("Daftar & masuk","Sign up & enter")};
  document.getElementById("jnLogin").onclick=()=>{history.replaceState(null,"",location.pathname);_show()};
  document.getElementById("jnGo").onclick=async()=>{const n=$("jnN").value.trim(),e=$("jnE").value.trim(),p=$("jnP").value;
    if(!n)return fail(L("Isi namamu dulu.","Enter your name."));if(!/^\S+@\S+\.\S+$/.test(e))return fail(L("Email tidak valid.","Invalid email."));
    if(p.length<8)return fail(L("Password minimal 8 karakter.","Password needs 8+ characters."));if(p!==$("jnP2").value)return fail(L("Kedua password tidak sama.","Passwords don't match."));
    const g=$("jnGo");g.disabled=true;g.textContent=L("Membuat akun…","Creating account…");
    try{await joinFn({code:INV,email:e,password:p,name:n});window.__ravi_pw=p;
      window.__ravi_land="chat";const {error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)throw error;history.replaceState(null,"",location.pathname)}
    catch(err){window.__ravi_pw=undefined;fail(err.message||String(err))}}}
const _show=typeof showLogin==="function"?showLogin:null;
if(_show&&INV){showLogin=function(msg){if(new URLSearchParams(location.search).get("invite"))return showJoin();return _show(msg)}}
/* layar login mungkin sudah tampil sebelum file ini dimuat */
if(INV){const swap=()=>{if(document.getElementById("lg_b")&&new URLSearchParams(location.search).get("invite"))showJoin()};swap();addEventListener("DOMContentLoaded",swap);setTimeout(swap,300)}
/* sudah login tapi membuka link undangan: buang parameternya */
addEventListener("load",()=>{if(INV)setTimeout(async()=>{try{const {data}=await sb.auth.getSession();if(data&&data.session)history.replaceState(null,"",location.pathname)}catch(e){}},1500)});
})();
