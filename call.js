/* =====================================================================
   📞 TELEPON & 🎥 VIDEO CALL (WebRTC, ala WhatsApp/GMeet) ke kontak mana pun
   Suara/video langsung antar-HP (terenkripsi DTLS-SRTP). Sinyal panggilan lewat
   "kotak masuk" Realtime privat tiap akun (ravi-u-<id>): hanya pemiliknya yang bisa
   mendengar. Kalau jaringan memblokir, lewat relay TURN (Cloudflare) dari Edge Function.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const ICE=[{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]},{urls:"stun:stun.cloudflare.com:3478"}].concat((window.APP_CONFIG&&window.APP_CONFIG.TURN)||[]);
const C={me:null,other:null,names:{},ch:null,ready:null,pc:null,local:null,remote:null,state:"idle",video:false,peerVideo:null,muted:false,camOff:false,facing:"user",share:null,
  t0:0,timer:0,ringT:0,pendingIce:[],role:null,id:null,ui:null,tone:null};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const oName=()=>nm(C.other);
const avatarId=u=>(window.RS&&RS.charOf(u))||"vnel";

/* ---------- sinyal ---------- */
const nm=u=>window.RS?RS.name(u):(C.names[u]||L("Kontak","Contact"));
async function ready(){if(C.ready)return C.ready;
  C.ready=(async()=>{if(typeof sb==="undefined"||!sb)throw new Error("offline");
    const {data:s}=await sb.auth.getSession();C.me=s?.session?.user?.id;if(!C.me)throw new Error("login");
    if(window.RS)await RS.init().catch(()=>{});
    loadIce();
    C.ch=sb.channel("ravi-u-"+C.me,{config:{private:true,broadcast:{self:false}}});C.ch.on("broadcast",{event:"sig"},({payload})=>onSig(payload));
    C.ch.subscribe(st=>{if(st==="CHANNEL_ERROR"||st==="TIMED_OUT")C.ready=null});return true})();
  C.ready.catch(()=>{C.ready=null});return C.ready}
const outs={};
function send(p){const to=C.other;if(!to)return;const ch=outs[to]||(outs[to]=sb.channel("ravi-u-"+to,{config:{private:true}}));
  const payload={...p,from:C.me,id:p.id||C.id};
  try{(ch.httpSend?ch.httpSend("sig",payload):ch.send({type:"broadcast",event:"sig",payload})).catch(()=>{})}catch(e){}}
/* ---------- nada dering (WebAudio, tanpa file) ----------
   Browser memblokir suara sampai halaman pernah disentuh/diklik, jadi satu AudioContext
   dibuka saat sentuhan pertama dan dipakai ulang untuk dering berikutnya. */
let AC=null;
function audio(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume().catch(()=>{})}catch(e){}return AC}
const unlockAudio=()=>{const a=audio();if(!a)return;try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0)}catch(e){}};
["pointerdown","touchstart","keydown"].forEach(ev=>addEventListener(ev,unlockAudio,{passive:true,capture:true}));
function tone(kind){stopTone();const inc=kind==="in";let vibIv=0;
  try{const ac=audio();if(ac){const g=ac.createGain();g.gain.value=0;g.connect(ac.destination);
    const o1=ac.createOscillator(),o2=ac.createOscillator();o1.type=o2.type="sine";o1.frequency.value=inc?523.25:440;o2.frequency.value=inc?659.25:480;o1.connect(g);o2.connect(g);o1.start();o2.start();
    /* masuk: "tring-tring … tring-tring" (keras); keluar: nada tunggu pelan */
    const pat=inc?[[.32,.35],[0,.15],[.32,.35],[0,1.4]]:[[.07,1],[0,2]];let i=0,tm=0;
    const step=()=>{const [v,d]=pat[i++%pat.length];g.gain.setTargetAtTime(v,ac.currentTime,.015);tm=setTimeout(step,d*1000)};step();
    C.tone={stop:()=>{clearTimeout(tm);clearInterval(vibIv);try{g.gain.setTargetAtTime(0,ac.currentTime,.01);setTimeout(()=>{try{o1.stop();o2.stop();g.disconnect()}catch(e){}},80)}catch(e){}}}}}catch(e){}
  if(inc){const vib=()=>{try{navigator.vibrate&&navigator.vibrate([500,250,500])}catch(e){}};vib();vibIv=setInterval(vib,2300);if(!C.tone)C.tone={stop:()=>clearInterval(vibIv)}}}
function stopTone(){if(C.tone){C.tone.stop();C.tone=null}try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}}

/* ---------- media ---------- */
async function getMedia(video){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error(L("Browser ini tidak mendukung panggilan. Pakai Chrome atau Safari terbaru.","This browser doesn't support calls. Use the latest Chrome or Safari."));
  try{return await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:video?{facingMode:C.facing,width:{ideal:1280},height:{ideal:720}}:false})}
  catch(e){throw new Error(e.name==="NotAllowedError"?L("Izin mikrofon/kamera ditolak. Izinkan lewat ikon gembok di address bar.","Microphone/camera permission denied. Allow it via the lock icon in the address bar."):e.name==="NotFoundError"?L("Mikrofon/kamera tidak ditemukan.","No microphone/camera found."):e.message)}}
let iceP=null,iceAt=0;
function loadIce(force){if(!window.RAVI_FN)return Promise.resolve(null);if(!iceP||force||Date.now()-iceAt>6*3600e3){iceAt=Date.now();iceP=window.RAVI_FN({action:"ice"}).then(r=>{C.quota=r||null;return r&&r.iceServers&&r.iceServers.length?r.iceServers:null}).catch(()=>null)}return iceP}
/* ---------- batas kuota Cloudflare Realtime ---------- */
const gb=b=>(b/1e9).toFixed(b>=1e11?0:1);
async function quotaBlocked(){await Promise.race([loadIce(true),new Promise(x=>setTimeout(x,3000))]);const q=C.quota;if(!q||!q.blocked)return null;
  const u=q.usage||{};return q.blocked==="all"?L("Kuota Cloudflare bulan ini sudah ","This month's Cloudflare quota is at ")+gb(u.bytes||0)+" GB (≥ 899 GB). "+L("Telepon & video call dimatikan sampai bulan depan. Chat tetap bisa.","Calls & video are off until next month. Chat still works.")
    :L("Kuota telepon bulan ini sudah ","This month's call quota is at ")+gb(u.bytes||0)+" GB (≥ 700 GB). "+L("Telepon & video call dimatikan sampai bulan depan. Chat tetap bisa.","Voice & video calls are off until next month. Chat still works.")}
/* video call & berbagi layar khusus pasangan */
const vidOK=u=>!window.RS||!RS.S.me||(RS.isPartner(RS.S.me)&&RS.isPartner(u));
const VID_NO=()=>L("Video call & berbagi layar khusus pasangan pemilik RaVi. Panggilan suara tetap bisa.","Video calls & screen sharing are only for the RaVi couple. Voice calls still work.");
/* ---------- hitung pemakaian relay TURN (yang memakai kuota) ---------- */
async function meter(){if(!C.pc||C.state!=="live")return;try{const st=await C.pc.getStats();let pair=null;const map=new Map();st.forEach(r=>map.set(r.id,r));
    st.forEach(r=>{if(r.type==="transport"&&r.selectedCandidatePairId)pair=map.get(r.selectedCandidatePairId)});
    if(!pair)st.forEach(r=>{if(r.type==="candidate-pair"&&(r.selected||r.nominated)&&r.state==="succeeded")pair=r});
    if(!pair)return;const lc=map.get(pair.localCandidateId),rc=map.get(pair.remoteCandidateId),relay=(lc&&lc.candidateType==="relay")||(rc&&rc.candidateType==="relay");
    const tot=(pair.bytesSent||0)+(pair.bytesReceived||0);if(C.mLast==null)C.mLast=tot;const d=Math.max(0,tot-C.mLast);C.mLast=tot;if(relay)C.mBytes=(C.mBytes||0)+d;
    if(C.mBytes>=50e6)flushMeter()}catch(e){}}
function flushMeter(){const b=Math.round(C.mBytes||0);C.mBytes=0;if(b>0&&typeof sb!=="undefined"&&sb)sb.rpc("ravi_usage_add",{p_bytes:b}).then(()=>{},()=>{})}
async function iceList(){const r=await Promise.race([loadIce(),new Promise(x=>setTimeout(()=>x(null),2500))]);return r||ICE}
function newPC(list){const pc=new RTCPeerConnection({iceServers:list||ICE});C.remote=new MediaStream();
  C.cand={host:0,srflx:0,relay:0,remote:0};
  pc.onicecandidate=e=>{if(e.candidate){const ty=(/ typ (\w+)/.exec(e.candidate.candidate)||[])[1];if(ty in C.cand)C.cand[ty]++;send({t:"ice",c:e.candidate})}};
  pc.ontrack=e=>{e.streams[0]?e.streams[0].getTracks().forEach(t=>{if(!C.remote.getTracks().includes(t))C.remote.addTrack(t)}):C.remote.addTrack(e.track);draw()};
  pc.onconnectionstatechange=()=>{const s=pc.connectionState;if(s==="connected"){if(C.state!=="live"){C.state="live";C.t0=Date.now();clearInterval(C.mIv);C.mIv=setInterval(meter,10000);setTimeout(meter,1500);stopTone();clearInterval(C.timer);C.timer=setInterval(tick,1000)}draw()}
    else if(s==="failed"){if(!C.restarted&&C.role==="caller"){C.restarted=true;pc.createOffer({iceRestart:true}).then(o=>pc.setLocalDescription(o)).then(()=>send({t:"offer",sdp:pc.localDescription})).catch(()=>{});return}
      end(L("Koneksi gagal. Jaringan salah satu dari kalian mungkin memblokir panggilan langsung.","Connection failed. One of your networks may block direct calls."),true)}
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
async function start(peer,video,conv){
  if(typeof peer==="boolean"){conv=video;video=peer;peer=null}
  try{await ready()}catch(e){status(L("Belum bisa menelepon: ","Can't call yet: ")+(e.message||e),"warn");return}
  if(C.state!=="idle")return;
  if(!peer&&window.RS){peer=RS.partners().find(u=>u!==C.me)||null}
  if(!peer){status(L("Pilih kontak yang mau ditelepon dari Chat.","Pick a contact to call from Chat."),"warn");return}
  if(video&&!vidOK(peer)){status(VID_NO(),"warn");video=false}
  {const qb=await quotaBlocked();if(qb){status(qb,"err");return}}
  if(C.state!=="idle")return;
  C.other=peer;C.conv=conv||null;C.video=video;C.role="caller";C.id=Date.now().toString(36);C.state="calling";C.note="";draw();
  try{C.local=await getMedia(video)}catch(e){C.state="idle";draw();alert(e.message);return}
  draw();tone("out");send({t:"ring",video});C.ringIv=setInterval(()=>{if(C.state==="calling")send({t:"ring",video})},3000);
  /* notifikasi HP diulang tiap 6 detik supaya terus berdering & bergetar seperti telepon (sampai diangkat/ditolak/45 detik) */
  const callPush=()=>{if(C.state==="calling"&&window.RAVI_NOTIFY)window.RAVI_NOTIFY("call",{to:[C.other],title:nm(C.me),body:video?L("🎥 Video call masuk","🎥 Incoming video call"):L("📞 Panggilan suara masuk","📞 Incoming voice call"),url:"./?go=chat&call=1"})};
  callPush();clearInterval(C.pushIv);C.pushIv=setInterval(callPush,6000);
  C.ringT=setTimeout(()=>{if(C.state==="calling"){send({t:"cancel"});end(L("Tidak dijawab","No answer"),true,"missed")}},45000)}
async function accept(){stopTone();
  {const qb=await quotaBlocked();if(qb){status(qb,"err");decline();return}}
  if(C.video&&!vidOK(C.other))C.video=false;
  C.state="connecting";draw();
  try{C.local=await getMedia(C.video)}catch(e){send({t:"decline"});end(e.message,true);return}
  C.pc=newPC(await iceList());send({t:"accept"});draw()}
function decline(){send({t:"decline"});stopTone();reset()}
async function onSig(p){if(!p||p.from===C.me)return;
  if(p.t==="ring"){if(p.id&&p.id===C.id)return;
    /* saling menelepon di saat bersamaan: satu pihak (urutan id akun) mengalah dan otomatis mengangkat panggilan yang lain */
    if(C.state==="calling"&&p.from===C.other){if(String(C.me)<String(p.from)){clearTimeout(C.ringT);clearInterval(C.ringIv);clearInterval(C.pushIv);stopTone();
        if(C.local){C.local.getTracks().forEach(t=>t.stop());C.local=null}
        C.id=p.id;C.role="callee";C.video=!!p.video&&vidOK(p.from);C.state="ringing";C.note="";draw();accept()}
      return}
    if(C.state!=="idle"){const keep=C.other;C.other=p.from;send({t:"busy",id:p.id});C.other=keep;return}
    if(window.RS&&!RS.S.members[p.from])return;
    C.other=p.from;C.id=p.id;C.role="callee";C.video=!!p.video&&vidOK(p.from);C.state="ringing";C.note="";draw();
    if(C.auto&&Date.now()-C.auto<45000){C.auto=0;accept();return}   /* diangkat dari tombol "Angkat" di notifikasi */
    tone("in");
    try{if(document.hidden&&window.Notification&&Notification.permission==="granted")new Notification(oName()+L(" menelepon"," is calling"),{body:p.video?L("Video call masuk","Incoming video call"):L("Panggilan suara masuk","Incoming voice call"),icon:"icon-192.png",tag:"call",requireInteraction:true})}catch(e){}
    C.ringT=setTimeout(()=>{if(C.state==="ringing"){stopTone();reset()}},45000);return}
  if(p.from!==C.other)return;if(p.id&&C.id&&p.id!==C.id)return;
  if(p.t==="cancel"&&C.state==="ringing"){stopTone();reset();status(L("Panggilan tak terjawab dari ","Missed call from ")+oName(),"warn");return}
  if(p.t==="busy"&&C.state==="calling"){end(L("Sedang dalam panggilan lain","On another call"),true);return}
  if(p.t==="decline"&&C.state==="calling"){end(L("Panggilan ditolak","Call declined"),true,"declined");return}
  if(p.t==="accept"&&C.state==="calling"){clearTimeout(C.ringT);clearInterval(C.ringIv);clearInterval(C.pushIv);C.state="connecting";stopTone();draw();
    C.pc=newPC(await iceList());const off=await C.pc.createOffer();await C.pc.setLocalDescription(off);send({t:"offer",sdp:C.pc.localDescription});return}
  if(p.t==="offer"&&C.pc){await C.pc.setRemoteDescription(p.sdp);await flushIce();const ans=await C.pc.createAnswer();await C.pc.setLocalDescription(ans);send({t:"answer",sdp:C.pc.localDescription});return}
  if(p.t==="answer"&&C.pc){await C.pc.setRemoteDescription(p.sdp);await flushIce();return}
  if(p.t==="ice"){if(C.cand)C.cand.remote++;if(C.pc&&C.pc.remoteDescription)try{await C.pc.addIceCandidate(p.c)}catch(e){}else C.pendingIce.push(p.c);return}
  if(p.t==="cam"){C.peerVideo=!!p.on;draw();return}
  if(p.t==="hangup"&&C.state!=="idle"){end(L("Panggilan selesai","Call ended"),false);return}}
function hangup(){send({t:C.state==="calling"?"cancel":"hangup"});end(L("Panggilan selesai","Call ended"),false,C.state==="calling"?"cancelled":null)}
async function end(msg,isErr,kind){try{await meter()}catch(e){}const dur=C.t0?Math.round((Date.now()-C.t0)/1000):0,wasCaller=C.role==="caller",video=C.video;C.lastOther=C.other;clearInterval(C.pushIv);
  /* ganti notifikasi "panggilan masuk" di HP dia menjadi "tak terjawab" supaya berhenti berdering */
  if(wasCaller&&(kind==="missed"||kind==="cancelled")&&window.RAVI_NOTIFY)window.RAVI_NOTIFY("missed",{to:[C.other],title:nm(C.me),body:(video?"🎥 ":"📞 ")+L("Panggilan tak terjawab","Missed call"),url:"./?go=notif",tag:"call"});
  stopTone();reset();if(msg)status(msg+(dur?" · "+fmt(dur):""),isErr?"warn":"ok");
  const other=C.lastOther,res=kind||(dur?"done":"missed");
  if(wasCaller&&other){try{if(window.RS)RS.activity(other,"call",null,{v:video?1:0,d:dur||0,r:res});
    if(window.RAVI_CHAT){const cid=await window.RAVI_CHAT.dmWith(other);await window.RAVI_CHAT.sendBody(cid,{t:"[call:"+(video?"video":"voice")+":"+(dur||0)+":"+res+"]"})}}catch(e){}}}
function reset(){clearInterval(C.mIv);flushMeter();C.mLast=null;C.min=false;clearInterval(C.pushIv);clearTimeout(C.wd1);clearTimeout(C.wd2);clearTimeout(C.ringT);clearInterval(C.ringIv);clearInterval(C.timer);try{C.pc&&C.pc.close()}catch(e){}
  [C.local,C.share].forEach(s=>s&&s.getTracks().forEach(t=>t.stop()));
  Object.assign(C,{pc:null,local:null,remote:null,share:null,state:"idle",muted:false,camOff:false,t0:0,pendingIce:[],role:null,id:null,note:"",peerVideo:null,restarted:false});draw()}
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function tick(){const el=C.ui&&C.ui.querySelector(".cl-time");if(el&&C.t0)el.textContent=fmt(Math.round((Date.now()-C.t0)/1000))}

/* ---------- kontrol ---------- */
function toggleMute(){C.muted=!C.muted;C.local&&C.local.getAudioTracks().forEach(t=>t.enabled=!C.muted);draw()}
async function toggleCam(){if(!C.local)return;if(!vidOK(C.other)){status(VID_NO(),"warn");return}let vt=C.local.getVideoTracks()[0];
  if(!vt){try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:C.facing}});vt=s.getVideoTracks()[0];C.local.addTrack(vt);
      const sender=C.pc&&C.pc.getSenders().find(x=>x.track&&x.track.kind==="video");if(sender)await sender.replaceTrack(vt);else if(C.pc){C.pc.addTrack(vt,C.local);const o=await C.pc.createOffer();await C.pc.setLocalDescription(o);send({t:"offer",sdp:C.pc.localDescription})}
      C.video=true;C.camOff=false;send({t:"cam",on:true});draw()}catch(e){alert(e.message)}return}
  C.camOff=!C.camOff;vt.enabled=!C.camOff;send({t:"cam",on:!C.camOff});draw()}
async function flip(){if(!C.local||!C.local.getVideoTracks()[0])return;C.facing=C.facing==="user"?"environment":"user";
  try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:C.facing}}});const nt=s.getVideoTracks()[0],old=C.local.getVideoTracks()[0];
    const sender=C.pc&&C.pc.getSenders().find(x=>x.track&&x.track.kind==="video");if(sender)await sender.replaceTrack(nt);C.local.removeTrack(old);old.stop();C.local.addTrack(nt);draw()}
  catch(e){C.facing=C.facing==="user"?"environment":"user";status(L("Kamera lain tidak tersedia.","No other camera available."),"warn")}}
async function shareScreen(){if(!C.pc)return;if(!vidOK(C.other)){status(VID_NO(),"warn");return}const sender=C.pc.getSenders().find(x=>x.track&&x.track.kind==="video");
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
.ch-call button{all:unset;cursor:pointer;color:var(--acc);font-weight:800}
/* tombol kecilkan + mode mengambang (tetap bisa chat saat menelepon) */
#callUI .cl-minb{all:unset;cursor:pointer;position:absolute;left:max(12px,env(safe-area-inset-left,0px));top:calc(12px + env(safe-area-inset-top,0px));z-index:4;width:42px;height:42px;border-radius:99px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.18);font-size:20px}
#callUI.vid .cl-who{left:max(64px,env(safe-area-inset-left,0px))}
#callUI.min{inset:auto;right:max(12px,env(safe-area-inset-right,0px));top:calc(12px + env(safe-area-inset-top,0px));width:auto;min-width:230px;height:auto;border-radius:20px;padding:8px 8px 8px 12px;flex-direction:row;gap:8px;box-shadow:0 12px 30px rgba(0,0,0,.35);cursor:pointer;animation:clMin .2s ease-out;z-index:450}
@keyframes clMin{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
#callUI.min .cl-pulse,#callUI.min .cl-lv,#callUI.min .cl-minb,#callUI.min .cl-who .pipi{display:none}
#callUI.min .cl-who{position:static;flex-direction:column;align-items:flex-start;gap:0;text-align:left;flex:1;min-width:0}
#callUI.min .cl-name{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}#callUI.min .cl-st{font-size:12px}
#callUI.min .cl-bar{position:static;padding:0;gap:6px;flex-wrap:nowrap}#callUI.min .cl-b{width:40px;height:40px;font-size:17px}#callUI.min .cl-b small{display:none}
#callUI.min #clCam,#callUI.min #clFlip,#callUI.min #clShare{display:none}
#callUI.min.vid{width:180px;min-width:0;height:240px;padding:0;flex-direction:column;justify-content:flex-end;overflow:hidden}
#callUI.min.vid .cl-rv{position:absolute;inset:0}#callUI.min.vid .cl-who{display:none}#callUI.min.vid .cl-bar{position:relative;justify-content:center;padding:8px}
@media (max-width:860px){#callUI.min{left:12px;right:12px;top:auto;bottom:calc(84px + env(safe-area-inset-bottom,0px))}#callUI.min.vid{left:auto}}
html.cx-full #callUI.min{bottom:calc(76px + env(safe-area-inset-bottom,0px))}`;document.head.appendChild(css);
function draw(){
  if(C.state==="idle"){if(C.ui){C.ui.remove();C.ui=null}return}
  if(!C.ui){C.ui=document.createElement("div");C.ui.id="callUI";C.ui.setAttribute("role","dialog");C.ui.setAttribute("aria-label",L("Panggilan","Call"));document.body.appendChild(C.ui)}
  const hasRemoteVid=C.remote&&C.remote.getVideoTracks().length&&(C.peerVideo===null?C.video:C.peerVideo),showVid=C.state==="live"&&hasRemoteVid,localVid=C.local&&C.local.getVideoTracks().length&&!C.camOff;
  const st={calling:L("Memanggil…","Calling…"),ringing:C.video?L("Video call masuk","Incoming video call"):L("Panggilan suara masuk","Incoming voice call"),connecting:L("Menyambungkan…","Connecting…"),live:""}[C.state];
  const canMin=C.state!=="ringing";if(!canMin)C.min=false;
  C.ui.className=(showVid?"vid":"")+(C.min?" min":"");
  C.ui.innerHTML=`${showVid?`<video class="cl-rv" autoplay playsinline></video>`:`<audio class="cl-ra" autoplay></audio>`}
   ${localVid?`<video class="cl-lv${C.facing==="environment"||C.share?" back":""}" autoplay playsinline muted></video>`:""}
   ${C.state==="ringing"||C.state==="calling"?`<span class="cl-pulse"></span>`:""}
   ${canMin?`<button class="cl-minb" id="clMin" aria-label="${L("Kecilkan — buka chat sambil menelepon","Minimize — use chat during the call")}" title="${L("Kecilkan","Minimize")}">⌄</button>`:""}
   <div class="cl-who">${window.pipi?window.pipi(C.state==="live"?"happy":"party",120,avatarId(C.other)):""}<div class="cl-name"></div><div class="cl-st">${C.state==="live"?`<span class="cl-time">0:00</span>${C.video||C.peerVideo?" · 🎥":" · 📞"}${C.note?" · "+C.note:""}`:st}</div></div>
   <div class="cl-bar">${C.state==="ringing"?`<button class="cl-b red" id="clNo" aria-label="${L("Tolak","Decline")}">📵<small>${L("Tolak","Decline")}</small></button><button class="cl-b green" id="clYes" aria-label="${L("Angkat","Answer")}">${C.video?"🎥":"📞"}<small>${L("Angkat","Answer")}</small></button>`
    :`<button class="cl-b${C.muted?" off":""}" id="clMute" aria-pressed="${C.muted}" aria-label="${L("Bisukan","Mute")}">${C.muted?"🔇":"🎙️"}<small>${C.muted?L("Bisu","Muted"):L("Mik","Mic")}</small></button>
     <button class="cl-b${localVid?"":" off"}" id="clCam" aria-label="${L("Kamera","Camera")}">${localVid?"📷":"🚫"}<small>${L("Kamera","Camera")}</small></button>
     ${localVid&&!C.share?`<button class="cl-b" id="clFlip" aria-label="${L("Putar kamera","Flip camera")}">🔄<small>${L("Putar","Flip")}</small></button>`:""}
     ${canShare()&&C.state==="live"?`<button class="cl-b${C.share?" off":""}" id="clShare" aria-label="${L("Bagikan layar","Share screen")}">🖥️<small>${C.share?L("Stop share","Stop"):L("Share","Share")}</small></button>`:""}
     <button class="cl-b red" id="clEnd" aria-label="${L("Tutup","Hang up")}">📞<small>${L("Tutup","End")}</small></button>`}</div>`;
  C.ui.querySelector(".cl-name").textContent=oName();if(!vidOK(C.other))C.ui.querySelectorAll("#clCam,#clFlip,#clShare").forEach(x=>x.remove());
  const rv=C.ui.querySelector(".cl-rv,.cl-ra");if(rv&&C.remote){rv.srcObject=C.remote;rv.play&&rv.play().catch(()=>{})}
  const lv=C.ui.querySelector(".cl-lv");if(lv){lv.srcObject=C.share||C.local;lv.play&&lv.play().catch(()=>{})}
  const on=(id,f)=>{const b=C.ui.querySelector("#"+id);if(b)b.onclick=f};
  on("clMin",e=>{e&&e.stopPropagation();C.min=true;draw();if(window.RAVI_CHAT&&typeof go==="function"){const o=C.other;(C.conv?Promise.resolve(C.conv):window.RAVI_CHAT.dmWith(o)).then(c=>{go("chat");window.RAVI_CHAT.open(c)}).catch(()=>go("chat"))}});
  C.ui.onclick=e=>{if(C.min&&!e.target.closest(".cl-b")){C.min=false;draw()}};
  C.ui.querySelectorAll(".cl-b").forEach(b=>b.addEventListener("click",e=>e.stopPropagation()));
  on("clYes",accept);on("clNo",decline);on("clEnd",hangup);on("clMute",toggleMute);on("clCam",toggleCam);on("clFlip",flip);on("clShare",shareScreen);tick()}

window.RAVI_CALL={start,state:()=>C.state,peer:()=>C.other,
  autoAnswer:()=>{if(C.state==="ringing"){accept();return}C.auto=Date.now();ready().catch(()=>{})},
  decline:()=>{if(C.state==="ringing")decline()}};
/* siap menerima panggilan setelah login */
addEventListener("load",()=>{const t=setInterval(()=>{if(typeof col!=="undefined"&&col){clearInterval(t);ready().catch(()=>{})}},2000);setTimeout(()=>clearInterval(t),60000)});
addEventListener("beforeunload",()=>{if(C.state!=="idle")send({t:C.state==="calling"?"cancel":"hangup"})});
})();
