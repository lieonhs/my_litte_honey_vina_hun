/* =====================================================================
   📞 TELEPON & 🎥 VIDEO CALL (WebRTC, ala WhatsApp/GMeet) untuk Rafi & Vina
   Suara/video langsung antar-HP (terenkripsi DTLS-SRTP). Supabase Realtime
   (broadcast) hanya dipakai untuk sinyal panggilan. Tidak ada tabel baru.
   Butuh: couple-social.sql sudah dijalankan (untuk tahu siapa pasanganmu).
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const ICE=[{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]},{urls:"stun:stun.cloudflare.com:3478"}].concat((window.APP_CONFIG&&window.APP_CONFIG.TURN)||[]);
const C={me:null,other:null,names:{},ch:null,ready:null,pc:null,local:null,remote:null,state:"idle",video:false,peerVideo:null,muted:false,camOff:false,facing:"user",share:null,
  t0:0,timer:0,ringT:0,pendingIce:[],role:null,id:null,ui:null,tone:null};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const oName=()=>cap(C.names[C.other])||L("Pasangan","Partner");
const avatarId=u=>/^vina/i.test(C.names[u]||"")?"vcap":/^(rafi|el)/i.test(C.names[u]||"")?"erusa":"vnel";

/* ---------- sinyal ---------- */
async function ready(){if(C.ready)return C.ready;
  C.ready=(async()=>{if(typeof sb==="undefined"||!sb)throw new Error("offline");
    const {data:s}=await sb.auth.getSession();C.me=s?.session?.user?.id;if(!C.me)throw new Error("login");
    const {data,error}=await sb.from("couple_members").select("user_id,name");if(error)throw error;
    (data||[]).forEach(m=>C.names[m.user_id]=m.name);C.other=(data||[]).map(m=>m.user_id).find(u=>u!==C.me)||null;
    if(!C.other)throw new Error("nopartner");
    const key=[C.me,C.other].sort().join("-").replace(/-/g,"").slice(0,40);
    loadIce();
    const join=priv=>{const ch=sb.channel("ravi-call-"+key,{config:{private:priv,broadcast:{self:false}}});ch.on("broadcast",{event:"sig"},({payload})=>onSig(payload));return ch};
    C.ch=join(true);C.priv=true;
    C.ch.subscribe(st=>{if((st==="CHANNEL_ERROR"||st==="TIMED_OUT")&&C.priv){/* kebijakan channel privat belum dipasang (setup-ravi.sql) → pakai channel biasa */
      try{sb.removeChannel(C.ch)}catch(e){}C.priv=false;C.ch=join(false);C.ch.subscribe();window.RAVI_CALL_PUBLIC=true}});return true})();
  C.ready.catch(()=>{C.ready=null});return C.ready}
const send=p=>{try{C.ch&&C.ch.send({type:"broadcast",event:"sig",payload:{...p,from:C.me,id:p.id||C.id}})}catch(e){}};

/* ---------- nada dering (WebAudio, tanpa file) ---------- */
function tone(kind){stopTone();try{const ac=new (window.AudioContext||window.webkitAudioContext)();const g=ac.createGain();g.gain.value=0;g.connect(ac.destination);
  const o1=ac.createOscillator(),o2=ac.createOscillator();o1.frequency.value=kind==="in"?660:440;o2.frequency.value=kind==="in"?880:480;o1.connect(g);o2.connect(g);o1.start();o2.start();
  let on=true;const step=()=>{g.gain.setTargetAtTime(on?(kind==="in"?.12:.05):0,ac.currentTime,.02);on=!on};step();const iv=setInterval(step,kind==="in"?600:1500);
  C.tone={stop:()=>{clearInterval(iv);try{o1.stop();o2.stop();ac.close()}catch(e){}}}}catch(e){}
  if(kind==="in")try{navigator.vibrate&&navigator.vibrate([400,200,400,200,400])}catch(e){}}
function stopTone(){if(C.tone){C.tone.stop();C.tone=null}try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}}

/* ---------- media ---------- */
async function getMedia(video){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error(L("Browser ini tidak mendukung panggilan. Pakai Chrome atau Safari terbaru.","This browser doesn't support calls. Use the latest Chrome or Safari."));
  try{return await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:video?{facingMode:C.facing,width:{ideal:1280},height:{ideal:720}}:false})}
  catch(e){throw new Error(e.name==="NotAllowedError"?L("Izin mikrofon/kamera ditolak. Izinkan lewat ikon gembok di address bar.","Microphone/camera permission denied. Allow it via the lock icon in the address bar."):e.name==="NotFoundError"?L("Mikrofon/kamera tidak ditemukan.","No microphone/camera found."):e.message)}}
let iceP=null,iceAt=0;
function loadIce(force){if(!window.RAVI_FN)return Promise.resolve(null);if(!iceP||force||Date.now()-iceAt>6*3600e3){iceAt=Date.now();iceP=window.RAVI_FN({action:"ice"}).then(r=>r&&r.iceServers&&r.iceServers.length?r.iceServers:null).catch(()=>null)}return iceP}
async function iceList(){const r=await Promise.race([loadIce(),new Promise(x=>setTimeout(()=>x(null),2500))]);return r||ICE}
function newPC(list){const pc=new RTCPeerConnection({iceServers:list||ICE});C.remote=new MediaStream();
  C.cand={host:0,srflx:0,relay:0,remote:0};
  pc.onicecandidate=e=>{if(e.candidate){const ty=(/ typ (\w+)/.exec(e.candidate.candidate)||[])[1];if(ty in C.cand)C.cand[ty]++;send({t:"ice",c:e.candidate})}};
  pc.ontrack=e=>{e.streams[0]?e.streams[0].getTracks().forEach(t=>{if(!C.remote.getTracks().includes(t))C.remote.addTrack(t)}):C.remote.addTrack(e.track);draw()};
  pc.onconnectionstatechange=()=>{const s=pc.connectionState;if(s==="connected"){if(C.state!=="live"){C.state="live";C.t0=Date.now();stopTone();clearInterval(C.timer);C.timer=setInterval(tick,1000)}draw()}
    else if(s==="failed"){end(L("Koneksi gagal. Jaringan salah satu dari kalian mungkin memblokir panggilan langsung.","Connection failed. One of your networks may block direct calls."),true)}
    else if(s==="disconnected"){C.note=L("Sinyal lemah, menyambung ulang…","Weak signal, reconnecting…");draw()}};
  clearTimeout(C.wd1);clearTimeout(C.wd2);
  C.wd1=setTimeout(async()=>{if(C.pc!==pc||pc.connectionState==="connected")return;C.note=L("Mencoba jalur lain…","Trying another route…");draw();
    try{if(C.role==="caller"){const o=await pc.createOffer({iceRestart:true});await pc.setLocalDescription(o);send({t:"offer",sdp:pc.localDescription})}}catch(e){}},12000);
  C.wd2=setTimeout(()=>{if(C.pc!==pc||pc.connectionState==="connected")return;
    const why=!C.cand.relay?L("Jaringan salah satu dari kalian memblokir sambungan langsung, dan server relay (TURN) belum aktif. Aktifkan TURN Cloudflare (langkah 3 di README), atau coba lagi saat kalian berdua di Wi-Fi.","One of your networks blocks direct connections and the relay (TURN) server isn't on yet. Turn on Cloudflare TURN (step 3 in the README), or try again while both of you are on Wi-Fi."):L("Sambungan tidak berhasil walau lewat relay. Coba lagi sebentar lagi.","Couldn't connect even through the relay. Try again shortly.");
    send({t:"hangup"});end(why,true)},30000);
  C.local.getTracks().forEach(t=>pc.addTrack(t,C.local));return pc}
async function flushIce(){const l=C.pendingIce;C.pendingIce=[];for(const c of l)try{await C.pc.addIceCandidate(c)}catch(e){}}

/* ---------- alur panggilan ---------- */
async function start(video){
  try{await ready()}catch(e){status(e.message==="nopartner"||/couple_members/.test(e.message||"")?L("Panggilan butuh setup Chat berdua dulu (couple-social.sql).","Calls need the couple Chat setup first (couple-social.sql)."):L("Belum bisa menelepon: ","Can't call yet: ")+(e.message||e),"warn");return}
  if(C.state!=="idle")return;
  C.video=video;C.role="caller";C.id=Date.now().toString(36);C.state="calling";C.note="";draw();
  try{C.local=await getMedia(video)}catch(e){C.state="idle";draw();alert(e.message);return}
  draw();tone("out");send({t:"ring",video});C.ringIv=setInterval(()=>{if(C.state==="calling")send({t:"ring",video})},3000);
  if(window.RAVI_NOTIFY)window.RAVI_NOTIFY("call",{body:video?L("🎥 Video call masuk","🎥 Incoming video call"):L("📞 Panggilan suara masuk","📞 Incoming voice call")});
  C.ringT=setTimeout(()=>{if(C.state==="calling"){send({t:"cancel"});end(L("Tidak dijawab","No answer"),true,"missed")}},45000)}
async function accept(){stopTone();C.state="connecting";draw();
  try{C.local=await getMedia(C.video)}catch(e){send({t:"decline"});end(e.message,true);return}
  C.pc=newPC(await iceList());send({t:"accept"});draw()}
function decline(){send({t:"decline"});stopTone();reset()}
async function onSig(p){if(!p||p.from===C.me)return;
  if(p.t==="ring"){if(p.id&&p.id===C.id)return;if(C.state!=="idle"){send({t:"busy",id:p.id});return}
    C.id=p.id;C.role="callee";C.video=!!p.video;C.state="ringing";C.note="";draw();tone("in");
    try{if(document.hidden&&window.Notification&&Notification.permission==="granted")new Notification(oName()+L(" menelepon"," is calling"),{body:p.video?L("Video call masuk","Incoming video call"):L("Panggilan suara masuk","Incoming voice call"),icon:"icon-192.png",tag:"call",requireInteraction:true})}catch(e){}
    C.ringT=setTimeout(()=>{if(C.state==="ringing"){stopTone();reset()}},45000);return}
  if(p.id&&C.id&&p.id!==C.id)return;
  if(p.t==="cancel"&&C.state==="ringing"){stopTone();reset();status(L("Panggilan tak terjawab dari ","Missed call from ")+oName(),"warn");return}
  if(p.t==="busy"&&C.state==="calling"){end(L("Sedang dalam panggilan lain","On another call"),true);return}
  if(p.t==="decline"&&C.state==="calling"){end(L("Panggilan ditolak","Call declined"),true,"declined");return}
  if(p.t==="accept"&&C.state==="calling"){clearTimeout(C.ringT);clearInterval(C.ringIv);C.state="connecting";stopTone();draw();
    C.pc=newPC(await iceList());const off=await C.pc.createOffer();await C.pc.setLocalDescription(off);send({t:"offer",sdp:C.pc.localDescription});return}
  if(p.t==="offer"&&C.pc){await C.pc.setRemoteDescription(p.sdp);await flushIce();const ans=await C.pc.createAnswer();await C.pc.setLocalDescription(ans);send({t:"answer",sdp:C.pc.localDescription});return}
  if(p.t==="answer"&&C.pc){await C.pc.setRemoteDescription(p.sdp);await flushIce();return}
  if(p.t==="ice"){if(C.cand)C.cand.remote++;if(C.pc&&C.pc.remoteDescription)try{await C.pc.addIceCandidate(p.c)}catch(e){}else C.pendingIce.push(p.c);return}
  if(p.t==="cam"){C.peerVideo=!!p.on;draw();return}
  if(p.t==="hangup"&&C.state!=="idle"){end(L("Panggilan selesai","Call ended"),false);return}}
function hangup(){send({t:C.state==="calling"?"cancel":"hangup"});end(L("Panggilan selesai","Call ended"),false,C.state==="calling"?"cancelled":null)}
async function end(msg,isErr,kind){const dur=C.t0?Math.round((Date.now()-C.t0)/1000):0,wasCaller=C.role==="caller",video=C.video;
  stopTone();reset();if(msg)status(msg+(dur?" · "+fmt(dur):""),isErr?"warn":"ok");
  if(wasCaller)try{await sb.from("couple_msgs").insert({body:"[call:"+(video?"video":"voice")+":"+(dur||0)+":"+(kind||(dur?"done":"missed"))+"]"})}catch(e){}}
function reset(){clearTimeout(C.wd1);clearTimeout(C.wd2);clearTimeout(C.ringT);clearInterval(C.ringIv);clearInterval(C.timer);try{C.pc&&C.pc.close()}catch(e){}
  [C.local,C.share].forEach(s=>s&&s.getTracks().forEach(t=>t.stop()));
  Object.assign(C,{pc:null,local:null,remote:null,share:null,state:"idle",muted:false,camOff:false,t0:0,pendingIce:[],role:null,id:null,note:"",peerVideo:null});draw()}
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function tick(){const el=C.ui&&C.ui.querySelector(".cl-time");if(el&&C.t0)el.textContent=fmt(Math.round((Date.now()-C.t0)/1000))}

/* ---------- kontrol ---------- */
function toggleMute(){C.muted=!C.muted;C.local&&C.local.getAudioTracks().forEach(t=>t.enabled=!C.muted);draw()}
async function toggleCam(){if(!C.local)return;let vt=C.local.getVideoTracks()[0];
  if(!vt){try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:C.facing}});vt=s.getVideoTracks()[0];C.local.addTrack(vt);
      const sender=C.pc&&C.pc.getSenders().find(x=>x.track&&x.track.kind==="video");if(sender)await sender.replaceTrack(vt);else if(C.pc){C.pc.addTrack(vt,C.local);const o=await C.pc.createOffer();await C.pc.setLocalDescription(o);send({t:"offer",sdp:C.pc.localDescription})}
      C.video=true;C.camOff=false;send({t:"cam",on:true});draw()}catch(e){alert(e.message)}return}
  C.camOff=!C.camOff;vt.enabled=!C.camOff;send({t:"cam",on:!C.camOff});draw()}
async function flip(){if(!C.local||!C.local.getVideoTracks()[0])return;C.facing=C.facing==="user"?"environment":"user";
  try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:C.facing}}});const nt=s.getVideoTracks()[0],old=C.local.getVideoTracks()[0];
    const sender=C.pc&&C.pc.getSenders().find(x=>x.track&&x.track.kind==="video");if(sender)await sender.replaceTrack(nt);C.local.removeTrack(old);old.stop();C.local.addTrack(nt);draw()}
  catch(e){C.facing=C.facing==="user"?"environment":"user";status(L("Kamera lain tidak tersedia.","No other camera available."),"warn")}}
async function shareScreen(){if(!C.pc)return;const sender=C.pc.getSenders().find(x=>x.track&&x.track.kind==="video");
  if(C.share){const cam=C.local.getVideoTracks()[0];if(sender&&cam)await sender.replaceTrack(cam);C.share.getTracks().forEach(t=>t.stop());C.share=null;draw();return}
  if(!sender){status(L("Nyalakan kamera dulu, lalu share layar.","Turn on the camera first, then share the screen."),"warn");return}
  try{C.share=await navigator.mediaDevices.getDisplayMedia({video:true});const st=C.share.getVideoTracks()[0];await sender.replaceTrack(st);st.onended=()=>{if(C.share)shareScreen()};send({t:"cam",on:true});draw()}catch(e){C.share=null}}
const canShare=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia)&&!/Android|iPhone|iPad/i.test(navigator.userAgent);

/* ---------- tampilan ---------- */
const css=document.createElement("style");css.textContent=`
#callUI{position:fixed;inset:0;z-index:400;background:radial-gradient(120% 90% at 50% 0%,#5b34d6,#1b1524 70%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;
 padding:calc(16px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));font-family:Nunito,system-ui,sans-serif}
#callUI .cl-rv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}
#callUI .cl-lv{position:absolute;right:max(14px,env(safe-area-inset-right,0px));top:calc(14px + env(safe-area-inset-top,0px));width:min(30vw,170px);aspect-ratio:3/4;object-fit:cover;border-radius:16px;border:2px solid rgba(255,255,255,.6);background:#222;z-index:2;transform:scaleX(-1)}
#callUI .cl-lv.back{transform:none}
#callUI .cl-who{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
#callUI .cl-who .pipi{filter:drop-shadow(0 6px 18px rgba(0,0,0,.35))}
#callUI .cl-name{font-size:24px;font-weight:800}#callUI .cl-st{font-size:14px;opacity:.85}#callUI .cl-time{font-variant-numeric:tabular-nums}
#callUI.vid .cl-who{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));align-items:flex-start;text-shadow:0 1px 4px rgba(0,0,0,.6)}#callUI.vid .cl-who .pipi{display:none}
#callUI .cl-bar{position:absolute;left:0;right:0;bottom:calc(22px + env(safe-area-inset-bottom,0px));display:flex;gap:14px;justify-content:center;flex-wrap:wrap;z-index:3;padding:0 16px}
#callUI .cl-b{all:unset;cursor:pointer;width:60px;height:60px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:24px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);position:relative}
#callUI .cl-b.off{background:#fff;color:#1b1524}#callUI .cl-b.red{background:#e5484d}#callUI .cl-b.green{background:#2fa463}
#callUI .cl-b:focus-visible{outline:3px solid #fff;outline-offset:3px}
#callUI .cl-b small{position:absolute;top:100%;margin-top:4px;font-size:11px;font-weight:700;white-space:nowrap;left:50%;transform:translateX(-50%);opacity:.9}
#callUI .cl-pulse{position:absolute;width:200px;height:200px;border-radius:99px;border:3px solid rgba(255,255,255,.35);animation:clp 1.6s ease-out infinite;z-index:1}
@keyframes clp{from{transform:scale(.6);opacity:1}to{transform:scale(1.4);opacity:0}}
@media (prefers-reduced-motion:reduce){#callUI .cl-pulse{animation:none;display:none}}
.cl-head-btns{display:flex;gap:6px;margin-left:auto}.cl-head-btns button{all:unset;cursor:pointer;width:38px;height:38px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:18px;background:var(--accS)}
.cl-head-btns button:focus-visible{outline:3px solid var(--acc)}
.ch-call{align-self:center;font-size:12.5px;font-weight:700;color:var(--mute);background:var(--card);border:1px solid var(--line);border-radius:99px;padding:5px 12px;margin:6px 0;display:flex;gap:6px;align-items:center}
.ch-call button{all:unset;cursor:pointer;color:var(--acc);font-weight:800}`;document.head.appendChild(css);
function draw(){
  if(C.state==="idle"){if(C.ui){C.ui.remove();C.ui=null}return}
  if(!C.ui){C.ui=document.createElement("div");C.ui.id="callUI";C.ui.setAttribute("role","dialog");C.ui.setAttribute("aria-label",L("Panggilan","Call"));document.body.appendChild(C.ui)}
  const hasRemoteVid=C.remote&&C.remote.getVideoTracks().length&&(C.peerVideo===null?C.video:C.peerVideo),showVid=C.state==="live"&&hasRemoteVid,localVid=C.local&&C.local.getVideoTracks().length&&!C.camOff;
  const st={calling:L("Memanggil…","Calling…"),ringing:C.video?L("Video call masuk","Incoming video call"):L("Panggilan suara masuk","Incoming voice call"),connecting:L("Menyambungkan…","Connecting…"),live:""}[C.state];
  C.ui.className=showVid?"vid":"";
  C.ui.innerHTML=`${showVid?`<video class="cl-rv" autoplay playsinline></video>`:`<audio class="cl-ra" autoplay></audio>`}
   ${localVid?`<video class="cl-lv${C.facing==="environment"||C.share?" back":""}" autoplay playsinline muted></video>`:""}
   ${C.state==="ringing"||C.state==="calling"?`<span class="cl-pulse"></span>`:""}
   <div class="cl-who">${window.pipi?window.pipi(C.state==="live"?"happy":"party",120,avatarId(C.other)):""}<div class="cl-name"></div><div class="cl-st">${C.state==="live"?`<span class="cl-time">0:00</span>${C.video||C.peerVideo?" · 🎥":" · 📞"}${C.note?" · "+C.note:""}`:st}</div></div>
   <div class="cl-bar">${C.state==="ringing"?`<button class="cl-b red" id="clNo" aria-label="${L("Tolak","Decline")}">📵<small>${L("Tolak","Decline")}</small></button><button class="cl-b green" id="clYes" aria-label="${L("Angkat","Answer")}">${C.video?"🎥":"📞"}<small>${L("Angkat","Answer")}</small></button>`
    :`<button class="cl-b${C.muted?" off":""}" id="clMute" aria-pressed="${C.muted}" aria-label="${L("Bisukan","Mute")}">${C.muted?"🔇":"🎙️"}<small>${C.muted?L("Bisu","Muted"):L("Mik","Mic")}</small></button>
     <button class="cl-b${localVid?"":" off"}" id="clCam" aria-label="${L("Kamera","Camera")}">${localVid?"📷":"🚫"}<small>${L("Kamera","Camera")}</small></button>
     ${localVid&&!C.share?`<button class="cl-b" id="clFlip" aria-label="${L("Putar kamera","Flip camera")}">🔄<small>${L("Putar","Flip")}</small></button>`:""}
     ${canShare()&&C.state==="live"?`<button class="cl-b${C.share?" off":""}" id="clShare" aria-label="${L("Bagikan layar","Share screen")}">🖥️<small>${C.share?L("Stop share","Stop"):L("Share","Share")}</small></button>`:""}
     <button class="cl-b red" id="clEnd" aria-label="${L("Tutup","Hang up")}">📞<small>${L("Tutup","End")}</small></button>`}</div>`;
  C.ui.querySelector(".cl-name").textContent=oName();
  const rv=C.ui.querySelector(".cl-rv,.cl-ra");if(rv&&C.remote){rv.srcObject=C.remote;rv.play&&rv.play().catch(()=>{})}
  const lv=C.ui.querySelector(".cl-lv");if(lv){lv.srcObject=C.share||C.local;lv.play&&lv.play().catch(()=>{})}
  const on=(id,f)=>{const b=C.ui.querySelector("#"+id);if(b)b.onclick=f};
  on("clYes",accept);on("clNo",decline);on("clEnd",hangup);on("clMute",toggleMute);on("clCam",toggleCam);on("clFlip",flip);on("clShare",shareScreen);tick()}

/* ---------- tombol di Chat + catatan panggilan ---------- */
function decorateChat(){if(route!=="chat")return;const v=document.getElementById("view");if(!v)return;
  const head=v.querySelector(".ch-head");if(head&&!head.querySelector(".cl-head-btns")){const d=document.createElement("div");d.className="cl-head-btns";
    d.innerHTML=`<button id="clVoice" aria-label="${L("Telepon","Voice call")}" title="${L("Telepon","Voice call")}">📞</button><button id="clVideo" aria-label="${L("Video call","Video call")}" title="${L("Video call","Video call")}">🎥</button>`;
    head.appendChild(d);d.querySelector("#clVoice").onclick=()=>start(false);d.querySelector("#clVideo").onclick=()=>start(true)}
  v.querySelectorAll(".ch-b .bd").forEach(bd=>{const m=/^\[call:(voice|video):(\d+):(\w+)\]$/.exec(bd.textContent||"");if(!m)return;const b=bd.closest(".ch-b"),mine=b.classList.contains("me");
    const ic=m[1]==="video"?"🎥":"📞",dur=+m[2],kind=m[3];
    const txt=kind==="done"?(m[1]==="video"?L("Video call","Video call"):L("Panggilan suara","Voice call"))+" · "+fmt(dur):kind==="declined"?L("Panggilan ditolak","Call declined"):mine?L("Tidak dijawab","No answer"):L("Panggilan tak terjawab","Missed call");
    const pill=document.createElement("div");pill.className="ch-call";pill.innerHTML=`<span>${kind==="done"?ic:"↩️ "+ic}</span><span class="tx"></span><span>· ${b.querySelector(".t")?.textContent.replace(/✓/g,"").trim()||""}</span><button>${L("Telepon balik","Call back")}</button>`;
    pill.querySelector(".tx").textContent=txt;pill.querySelector("button").onclick=()=>start(m[1]==="video");b.replaceWith(pill)})}
if(typeof render==="function"){const _r=render;render=function(){const o=_r.apply(this,arguments);try{decorateChat()}catch(e){}return o}}
new MutationObserver(()=>{try{decorateChat()}catch(e){}}).observe(document.getElementById("view")||document.body,{childList:true});
window.RAVI_CALL={start,state:()=>C.state};
/* siap menerima panggilan setelah login */
addEventListener("load",()=>{const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);ready().catch(()=>{})}},2000);setTimeout(()=>clearInterval(t),60000)});
addEventListener("beforeunload",()=>{if(C.state!=="idle")send({t:C.state==="calling"?"cancel":"hangup"})});
})();
