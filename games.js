/* =====================================================================
   GAME CENTER: Tangkap Koin, Kuis Debit-Kredit, Memori Stiker
   Skor disimpan di dokumen "quest" yang sudah ada (field "games"),
   jadi tabel Supabase & config.js tidak berubah.
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const rpx=n=>"Rp"+Math.round(n||0).toLocaleString("id-ID");
const tday=()=>typeof today==="function"?today():new Date().toISOString().slice(0,10);
const G=()=>(window.QUEST&&window.QUEST.games)||{best:{},days:{},plays:0};

/* ---------- simpan hasil ---------- */
async function saveResult(game,score,better){
  if(!col)return false;
  const q=JSON.parse(JSON.stringify(window.QUEST||{claimed:{},owned:{},log:[]}));
  const g=q.games||{best:{},days:{},plays:0};g.best=g.best||{};g.days=g.days||{};
  const old=g.best[game];const isBest=old==null||better(score,old);
  if(isBest)g.best[game]=score;
  const d=tday();g.days[d]=(g.days[d]||0)+1;
  const keys=Object.keys(g.days).sort();while(keys.length>14)delete g.days[keys.shift()];
  g.plays=(g.plays||0)+1;q.games=g;
  try{await col.doc("quest").set(q);window.QUEST=q}catch(e){return {err:e.message}}
  return {isBest,old}}

/* ---------- pengaman: selama main, jangan biarkan reload data menghapus game ---------- */
let guard=null;
function lock(){document.querySelectorAll(".peek").forEach(e=>e.remove());if(!guard){guard=document.createElement("div");guard.className="sheetBg";guard.hidden=true;guard.style.cssText="display:none!important";guard.dataset.gameLock="1";document.body.appendChild(guard)}}
function unlock(){if(guard){guard.remove();guard=null}}

/* ---------- gaya ---------- */
const css=document.createElement("style");css.textContent=`
.gm-hub{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.gm-card{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:6px;padding:14px;border:2px solid var(--line);border-radius:18px;background:var(--card);transition:transform .15s,border-color .15s}
.gm-card:hover,.gm-card:focus-visible{border-color:var(--acc);transform:translateY(-2px)}
.gm-card .ic{font-size:34px;line-height:1}.gm-card b{font-size:16px}.gm-card .crumb{font-size:12.5px;line-height:1.4}
.gm-card .best{margin-top:auto;font-size:12px;font-weight:800;color:var(--acc)}
.gm-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.gm-top .sp{flex:1}.gm-pill{background:var(--accS);color:var(--acc);font-weight:800;border-radius:99px;padding:4px 12px;font-size:13px;font-variant-numeric:tabular-nums}
.gm-stage{max-width:480px;margin:0 auto;position:relative;border-radius:18px;overflow:hidden;border:2px solid var(--line);background:linear-gradient(180deg,var(--sel),var(--card));touch-action:none;user-select:none;-webkit-user-select:none}
.gm-stage canvas{display:block;width:100%}
.gm-over{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:16px;background:color-mix(in srgb,var(--card) 82%,transparent)}
.gm-over h3{margin:0;font-size:20px}.gm-over p{margin:0;max-width:34ch;color:var(--mute);font-size:13.5px}
.gm-q{font-size:16px;font-weight:700;line-height:1.45;margin:4px 0 12px}
.gm-opts{display:flex;flex-direction:column;gap:8px}
.gm-opt{all:unset;box-sizing:border-box;cursor:pointer;border:2px solid var(--line);border-radius:14px;padding:10px 12px;background:var(--card);font-size:13.5px;line-height:1.5}
.gm-opt:hover,.gm-opt:focus-visible{border-color:var(--acc)}
.gm-opt .ln{display:flex;gap:8px}.gm-opt .dk{font-weight:800;width:16px;flex:none;color:var(--mute)}
.gm-opt.ok{border-color:var(--grn);background:var(--grnS)}.gm-opt.no{border-color:var(--red);background:var(--redS)}
.gm-why{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--th);font-size:13px;line-height:1.5}
.gm-prog{height:6px;background:var(--th);border-radius:99px;overflow:hidden;margin-bottom:12px}.gm-prog i{display:block;height:100%;background:var(--acc);transition:width .3s}
.gm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:440px;margin:0 auto}
.gm-mc{all:unset;cursor:pointer;aspect-ratio:1;perspective:600px}
.gm-mc .in{position:relative;width:100%;height:100%;transition:transform .35s;transform-style:preserve-3d}
.gm-mc.open .in,.gm-mc.done .in{transform:rotateY(180deg)}
.gm-mc .f,.gm-mc .b{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;border:2px solid var(--line)}
.gm-mc .f{background:linear-gradient(135deg,var(--g1,#7c4dff),var(--g2,#ff6fa8));color:#fff;font-size:26px;font-weight:800}
.gm-mc .b{transform:rotateY(180deg);background:var(--card)}.gm-mc .b .pipi{width:82%;height:82%;animation:none!important}
.gm-mc.done .b{border-color:var(--grn);background:var(--grnS)}
.gm-mc:focus-visible .f{outline:3px solid var(--acc);outline-offset:2px}
.wd-board{display:flex;flex-direction:column;gap:5px;align-items:center;margin:6px 0 10px}.wd-row{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;width:min(300px,100%)}
.wd-c{aspect-ratio:1;border:2px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:clamp(18px,6vw,26px);font-weight:800;background:var(--card);text-transform:uppercase}
.wd-c.f{border-color:var(--mute)}.wd-c.g{background:#2fa463;border-color:#2fa463;color:#fff}.wd-c.y{background:#e3a008;border-color:#e3a008;color:#fff}.wd-c.x{background:var(--mute);border-color:var(--mute);color:var(--card)}
.wd-msg{text-align:center;min-height:22px;font-size:14px;margin-bottom:8px}.wd-kb{display:flex;flex-direction:column;gap:5px;max-width:480px;margin:0 auto}.wd-kr{display:flex;gap:4px;justify-content:center}
.wd-k{all:unset;box-sizing:border-box;cursor:pointer;flex:1;max-width:42px;height:46px;border-radius:8px;background:var(--th);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;user-select:none}.wd-k.wide{max-width:64px;flex:1.5}
.wd-k.g{background:#2fa463;color:#fff}.wd-k.y{background:#e3a008;color:#fff}.wd-k.x{background:var(--mute);color:var(--card)}.wd-k:focus-visible{outline:3px solid var(--acc)}
.gm-res{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.gm-res .big{font-size:28px;font-weight:800;color:var(--acc);font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion:reduce){.gm-mc .in,.gm-card{transition:none}}`;
document.head.appendChild(css);

/* ---------- hasil (overlay memakai .sheetBg supaya tidak tertimpa reload) ---------- */
function showResult(title,bigText,lines,again){
  const bg=document.createElement("div");bg.className="sheetBg";
  bg.innerHTML=`<div class="sheet" style="max-width:380px"><div class="sh"></div><div class="sb"><div class="gm-res">
   ${window.pipi?window.pipi("party",84):""}<div class="big"></div><div class="crumb lines"></div></div></div>
   <div class="sf"><button class="c">${L("Kembali ke Game","Back to Games")}</button><button class="pri ok">${L("Main lagi","Play again")}</button></div></div>`;
  bg.querySelector(".sh").textContent=title;bg.querySelector(".big").textContent=bigText;
  bg.querySelector(".lines").innerHTML=lines.map(l=>`<div>${l}</div>`).join("");
  const close=()=>{bg.remove()};
  bg.querySelector(".c").onclick=()=>{close();cur=null;render()};
  bg.querySelector(".ok").onclick=()=>{close();again()};
  document.body.appendChild(bg)}
function bestLine(r,fmtOld){if(!r)return "";if(r.err)return "⚠️ "+L("Skor gagal disimpan: ","Score not saved: ")+r.err;
  return r.isBest?(r.old==null?L("🎉 Skor pertamamu tersimpan!","🎉 Your first score is saved!"):L("🏆 Rekor baru! Sebelumnya ","🏆 New record! Previous ")+fmtOld(r.old)):L("Rekor kamu: ","Your record: ")+fmtOld(r.old)}

/* =====================================================================
   1) TANGKAP KOIN
   ===================================================================== */
const ITEMS=[{e:"🪙",v:1000,w:60},{e:"💵",v:5000,w:20},{e:"💎",v:20000,w:4},{e:"🧾",v:-1,w:22},{e:"💸",v:-1,w:10}];
function svgImg(svg){const i=new Image();i.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" '));return i}
function gameCoin(v){
  v.innerHTML=page(L("Game","Games"),"🪙 "+L("Tangkap Koin","Coin Catch"),`<button class="sm" id="gmBack">← ${L("Semua game","All games")}</button>`)+
   `<div class="gm-top"><span class="gm-pill" id="cScore">Rp0</span><span class="gm-pill" id="cLives">❤️❤️❤️</span><span class="sp"></span><span class="crumb">${L("Rekor","Record")}: ${G().best.coin!=null?rpx(G().best.coin):"–"}</span></div>
   <div class="gm-stage" id="cStage"><canvas id="cCv" aria-label="${L("Area game Tangkap Koin","Coin Catch game area")}"></canvas>
    <div class="gm-over" id="cOver"><h3>${L("Tangkap uangnya, hindari tagihannya!","Catch the money, dodge the bills!")}</h3>
     <p>${L("Geser jari (atau tombol ← →) untuk menggerakkan temanmu. 🪙 Rp1.000 · 💵 Rp5.000 · 💎 Rp20.000. Kena 🧾 atau 💸 = nyawa berkurang.","Drag (or use ← →) to move your buddy. 🪙 Rp1,000 · 💵 Rp5,000 · 💎 Rp20,000. Touching 🧾 or 💸 costs a life.")}</p>
     <button class="pri" id="cStart">${L("Mulai","Start")}</button></div></div>`;
  $("gmBack").onclick=()=>{cur=null;render()};
  const stage=$("cStage"),cv=$("cCv"),ctx=cv.getContext("2d");
  let W=0,H=0,dpr=1;
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=stage.clientWidth;H=Math.min(460,Math.max(320,Math.round(W*1.1)));cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();
  const buddy=svgImg(window.pipi?window.pipi("happy",96):"<svg width='96' height='96'></svg>");
  const buddyHit=svgImg(window.pipi?window.pipi("worried",96):"<svg width='96' height='96'></svg>");
  let st=null,raf=0,keys={};
  const reset=()=>({x:W/2,score:0,lives:3,items:[],t:0,spawn:0,hit:0,pops:[],run:true,last:performance.now()});
  function pick(){const tot=ITEMS.reduce((s,i)=>s+i.w,0);let r=Math.random()*tot;for(const i of ITEMS){if((r-=i.w)<0)return i}return ITEMS[0]}
  function hud(){$("cScore").textContent=rpx(st.score);$("cLives").textContent="❤️".repeat(st.lives)+"🤍".repeat(3-st.lives)}
  function frame(now){
    if(!cv.isConnected){stop();return}
    const dt=Math.min(.05,(now-st.last)/1000);st.last=now;st.t+=dt;
    const speed=150+st.t*6,every=Math.max(.32,.9-st.t*.012),bw=Math.min(84,W*.2);
    if(keys.ArrowLeft)st.x-=420*dt;if(keys.ArrowRight)st.x+=420*dt;st.x=Math.max(bw/2,Math.min(W-bw/2,st.x));
    st.spawn-=dt;if(st.spawn<=0){st.spawn=every;const it=pick();st.items.push({...it,x:20+Math.random()*(W-40),y:-24,vy:speed*(.85+Math.random()*.35)})}
    const by=H-bw*.55;
    for(const it of st.items){it.y+=it.vy*dt;
      if(!it.gone&&it.y>by-bw*.45&&it.y<by+bw*.3&&Math.abs(it.x-st.x)<bw*.5){it.gone=true;
        if(it.v<0){st.lives--;st.hit=.5;st.pops.push({x:it.x,y:it.y,t:0,txt:"−❤️"});if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){}}
        else{st.score+=it.v;st.pops.push({x:it.x,y:it.y,t:0,txt:"+"+rpx(it.v)})}hud()}}
    st.items=st.items.filter(i=>!i.gone&&i.y<H+30);
    st.hit=Math.max(0,st.hit-dt);
    // gambar
    ctx.clearRect(0,0,W,H);
    ctx.font="26px system-ui,'Apple Color Emoji','Segoe UI Emoji',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
    for(const it of st.items)ctx.fillText(it.e,it.x,it.y);
    const img=st.hit>0?buddyHit:buddy;if(img.complete)ctx.drawImage(img,st.x-bw/2,by-bw*.6,bw,bw);
    ctx.font="800 14px Nunito,system-ui,sans-serif";
    const ink=getComputedStyle(document.documentElement).getPropertyValue("--acc")||"#d94f8a";
    for(const p of st.pops){p.t+=dt;ctx.globalAlpha=Math.max(0,1-p.t*1.4);ctx.fillStyle=p.txt.startsWith("−")?"#e5484d":ink;ctx.fillText(p.txt,p.x,p.y-p.t*50)}
    ctx.globalAlpha=1;st.pops=st.pops.filter(p=>p.t<.8);
    if(st.lives<=0){end();return}
    raf=requestAnimationFrame(frame)}
  function stop(){cancelAnimationFrame(raf);removeEventListener("keydown",kd);removeEventListener("keyup",ku);removeEventListener("resize",size);document.removeEventListener("visibilitychange",vis);unlock()}
  async function end(){const sc=st.score;stop();lock();
    const r=await saveResult("coin",sc,(a,b)=>a>b);unlock();
    showResult(L("Permainan selesai","Game over"),rpx(sc),[bestLine(r,rpx),L("Tip: 💎 jarang muncul, tapi nilainya 20× koin biasa.","Tip: 💎 is rare but worth 20× a coin.")],()=>gameCoin($("view")))}
  const kd=e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){keys[e.key]=true;e.preventDefault()}},ku=e=>{keys[e.key]=false};
  const vis=()=>{if(document.hidden&&st&&st.run){cancelAnimationFrame(raf)}else if(st&&st.run&&st.lives>0){st.last=performance.now();raf=requestAnimationFrame(frame)}};
  const move=e=>{if(!st)return;const r=cv.getBoundingClientRect();st.x=(e.clientX-r.left);e.preventDefault()};
  cv.addEventListener("pointerdown",e=>{cv.setPointerCapture?.(e.pointerId);move(e)});cv.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")move(e)});
  $("cStart").onclick=()=>{$("cOver").remove();size();st=reset();hud();lock();
    addEventListener("keydown",kd);addEventListener("keyup",ku);addEventListener("resize",size);document.addEventListener("visibilitychange",vis);
    raf=requestAnimationFrame(frame)}}

/* =====================================================================
   2) KUIS DEBIT-KREDIT (pakai akun COA aplikasi ini)
   ===================================================================== */
const QB=[
 ["Beli makan siang Rp25.000 pakai Bank Jago.","Bought lunch for Rp25,000 with Bank Jago.","5201","1113","Beban makan bertambah (debit), saldo Jago berkurang (kredit).","Meal expense goes up (debit), Jago balance goes down (credit)."],
 ["Gaji bulan ini masuk ke OCBC rekening gaji.","This month's salary lands in the OCBC salary account.","1111","4101","Kas di bank bertambah (debit), pendapatan gaji diakui (kredit).","Bank cash goes up (debit), salary income is recognised (credit)."],
 ["Top-up OVO Rp100.000 dari Bank Jago.","Top up OVO Rp100,000 from Bank Jago.","1121","1113","Ini transfer antar rekening sendiri, bukan beban. OVO naik, Jago turun.","This is a transfer between your own accounts, not an expense. OVO up, Jago down."],
 ["Bayar Grab ke kantor pakai saldo OVO.","Pay for a Grab ride to the office with OVO.","5301","1121","Beban transportasi online (debit), saldo OVO berkurang (kredit).","Ride-hailing expense (debit), OVO balance goes down (credit)."],
 ["Bayar kost bulan ini lewat BCA.","Pay this month's rent through BCA.","5101","1115","Sewa untuk bulan berjalan langsung jadi beban.","Rent for the current month is an expense right away."],
 ["Beli token listrik PLN lewat SeaBank.","Buy a PLN electricity token through SeaBank.","5102","1114","Beban listrik (debit), SeaBank berkurang (kredit).","Electricity expense (debit), SeaBank goes down (credit)."],
 ["Bayar kost 3 bulan sekaligus di muka dari OCBC rekening gaji.","Pay 3 months of rent upfront from the OCBC salary account.","1302","1111","Bulan yang belum dijalani adalah aset (sewa dibayar di muka), bukan beban sekarang.","Months not yet used are an asset (prepaid rent), not an expense yet."],
 ["Akhir bulan: akui sewa 1 bulan dari kost yang sudah dibayar di muka.","Month end: recognise one month of the prepaid rent.","5101","1302","Aset dibayar di muka dipindahkan ke beban sebulan demi sebulan.","The prepaid asset moves into expense one month at a time."],
 ["Belanja bahan makanan pakai PayLater.","Buy groceries with PayLater.","5202","2101","Belum keluar uang, tapi muncul utang PayLater (kredit).","No cash leaves yet, but a PayLater liability appears (credit)."],
 ["Lunasi tagihan PayLater dari Bank Jago.","Pay off the PayLater bill from Bank Jago.","2101","1113","Utang berkurang (debit), saldo Jago berkurang (kredit). Bukan beban lagi.","The liability goes down (debit), Jago goes down (credit). Not an expense again."],
 ["Teman pinjam uang tunai Rp50.000.","A friend borrows Rp50,000 in cash.","1201","1101","Uangnya masih milikmu dalam bentuk piutang.","The money is still yours, now as a receivable."],
 ["Teman mengembalikan pinjamannya lewat transfer ke Jago.","Your friend repays the loan by transfer to Jago.","1113","1201","Jago bertambah, piutang teman lunas.","Jago goes up, the receivable is cleared."],
 ["Dapat cashback Rp5.000 di OVO.","Get a Rp5,000 cashback in OVO.","1121","4202","Saldo OVO naik dan diakui sebagai pendapatan cashback.","OVO goes up and is recognised as cashback income."],
 ["Bunga bank bulanan masuk ke SeaBank.","Monthly bank interest arrives in SeaBank.","1114","4201","Bunga adalah pendapatan (kredit), SeaBank bertambah (debit).","Interest is income (credit), SeaBank goes up (debit)."],
 ["OCBC memotong biaya admin bulanan dari rekening gaji.","OCBC deducts its monthly admin fee from the salary account.","5901","1111","Biaya admin adalah beban. Sering lupa dicatat, jadi saldo jadi selisih.","Admin fees are an expense. Often forgotten, which causes balance gaps."],
 ["Tarik tunai Rp200.000 dari ATM BCA.","Withdraw Rp200,000 cash from a BCA ATM.","1101","1115","Pindah dari bank ke kas tunai. Total uangmu tidak berubah.","Moves from bank to cash. Your total money doesn't change."],
 ["Beli buku kuliah pakai Bank Jago.","Buy a course textbook with Bank Jago.","5502","1113","Masuk beban Buku & ATK.","Goes to the Books & Stationery expense."],
 ["Bayar taksi untuk urusan kantor pakai Jago, nanti diganti kantor.","Pay a taxi for office business with Jago; the company will reimburse.","1202","1113","Karena akan diganti, ini piutang reimburse, bukan beban pribadi.","Because it will be repaid, it is a reimbursement receivable, not a personal expense."],
 ["Reimburse dari kantor cair ke OCBC rekening gaji.","The office reimbursement is paid into the OCBC salary account.","1111","1202","Bank bertambah, piutang reimburse lunas.","Bank goes up, the reimbursement receivable is cleared."],
 ["Bayar WiFi bulanan lewat BCA.","Pay the monthly WiFi bill through BCA.","5104","1115","Beban internet (debit), BCA berkurang (kredit).","Internet expense (debit), BCA goes down (credit)."],
 ["Kirim uang untuk keluarga dari OCBC rekening gaji.","Send money to family from the OCBC salary account.","5803","1111","Dicatat sebagai beban kiriman untuk keluarga.","Recorded as a family remittance expense."],
 ["Naik KRL, bayar tunai di loket.","Ride the KRL commuter train, paying cash at the counter.","5304","1101","Beban transportasi umum, kas tunai berkurang.","Public transport expense, cash goes down."]];
const NOISE=["5203","5204","5999","4299","1113","1121","1111","2102","5402","1201","3101"];
function nm(c){try{return acctName(c)}catch(e){return c}}
function quizSet(n){const pool=QB.map((q,i)=>i).sort(()=>Math.random()-.5).slice(0,n);
  return pool.map(i=>{const [qi,qe,d,k,wi,we]=QB[i];
    const opts=[{d,k,ok:true},{d:k,k:d}];
    for(let t=0;t<20&&opts.length<3;t++){const alt=NOISE[Math.floor(Math.random()*NOISE.length)];
      const o=Math.random()<.5?{d:alt,k}:{d,k:alt};if(o.d!==o.k&&!opts.some(x=>x.d===o.d&&x.k===o.k))opts.push(o)}
    return {q:L(qi,qe),why:L(wi,we),opts:opts.sort(()=>Math.random()-.5)}})}
function gameQuiz(v){
  const N=10,set=quizSet(N);let i=0,score=0;
  const draw=()=>{const s=set[i];
    v.innerHTML=page(L("Game","Games"),"🧾 "+L("Kuis Debit-Kredit","Debit-Credit Quiz"),`<button class="sm" id="gmBack">← ${L("Semua game","All games")}</button>`)+
     `<div class="region"><div class="rb"><div class="gm-top"><span class="gm-pill">${L("Soal","Question")} ${i+1}/${N}</span><span class="gm-pill">✅ ${score}</span><span class="sp"></span><span class="crumb">${L("Rekor","Record")}: ${G().best.quiz!=null?G().best.quiz+"/"+N:"–"}</span></div>
      <div class="gm-prog"><i style="width:${i/N*100}%"></i></div>
      <div class="gm-q"></div><div class="crumb" style="margin:-6px 0 10px">${L("Pilih jurnal yang benar:","Pick the correct entry:")}</div>
      <div class="gm-opts">${s.opts.map((o,j)=>`<button class="gm-opt" data-j="${j}"><div class="ln"><span class="dk">D</span><span><span class="code">${o.d}</span> ${esc(nm(o.d))}</span></div><div class="ln"><span class="dk">K</span><span><span class="code">${o.k}</span> ${esc(nm(o.k))}</span></div></button>`).join("")}</div>
      <div id="gmWhy"></div></div></div>`;
    v.querySelector(".gm-q").textContent=s.q;
    $("gmBack").onclick=()=>{unlock();cur=null;render()};
    v.querySelectorAll(".gm-opt").forEach(b=>b.onclick=()=>{if(v.querySelector(".gm-opt.ok,.gm-opt.no"))return;
      const o=s.opts[+b.dataset.j];if(o.ok)score++;
      v.querySelectorAll(".gm-opt").forEach((x,j)=>{if(s.opts[j].ok)x.classList.add("ok");else if(x===b)x.classList.add("no");x.disabled=true});
      $("gmWhy").innerHTML=`<div class="gm-why"><b>${o.ok?L("Benar! ","Correct! "):L("Belum tepat. ","Not quite. ")}</b><span></span></div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="pri" id="gmNext">${i+1<N?L("Lanjut →","Next →"):L("Lihat hasil","See result")}</button></div>`;
      $("gmWhy").querySelector("span").textContent=s.why;
      $("gmNext").onclick=async()=>{i++;if(i<N){draw();return}
        const r=await saveResult("quiz",score,(a,b)=>a>b);unlock();
        showResult(L("Kuis selesai","Quiz finished"),score+"/"+N,[bestLine(r,x=>x+"/"+N),score===N?L("Sempurna! Kamu siap tutup buku sendiri. 📒","Perfect! You're ready to close the books yourself. 📒"):L("Ulangi untuk mengasah: soalnya diacak tiap main.","Play again to practise: questions are shuffled each time.")],()=>gameQuiz($("view")))};
      $("gmNext").focus()})};
  lock();draw()}

/* =====================================================================
   3) MEMORI STIKER
   ===================================================================== */
function gameMem(v){
  const ids=Object.keys(window.CHARS||{}).filter(k=>!window.CHARS[k].couple).sort(()=>Math.random()-.5).slice(0,8);
  const deck=[...ids,...ids].sort(()=>Math.random()-.5).map((id,n)=>({id,n}));
  let open=[],moves=0,done=0,t0=0,timer=0,busy=false;
  v.innerHTML=page(L("Game","Games"),"🧠 "+L("Memori Stiker","Sticker Memory"),`<button class="sm" id="gmBack">← ${L("Semua game","All games")}</button>`)+
   `<div class="gm-top"><span class="gm-pill" id="mMoves">${L("Langkah","Moves")}: 0</span><span class="gm-pill" id="mTime">0:00</span><span class="sp"></span><span class="crumb">${L("Rekor","Record")}: ${G().best.mem!=null?G().best.mem+" "+L("langkah","moves"):"–"}</span></div>
   <div class="gm-grid">${deck.map(c=>`<button class="gm-mc" data-n="${c.n}" aria-label="${L("Kartu tertutup","Hidden card")}"><div class="in"><div class="f">?</div><div class="b">${window.pipi?window.pipi("happy",64,c.id):""}</div></div></button>`).join("")}</div>
   <p class="crumb" style="text-align:center;margin-top:10px">${L("Buka 2 kartu, cari pasangan karakter yang sama. Makin sedikit langkah, makin bagus.","Flip 2 cards to find matching buddies. Fewer moves is better.")}</p>`;
  $("gmBack").onclick=()=>{clearInterval(timer);unlock();cur=null;render()};
  const tick=()=>{if(!$("mTime")){clearInterval(timer);unlock();return}const s=Math.floor((Date.now()-t0)/1000);$("mTime").textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
  v.querySelectorAll(".gm-mc").forEach(b=>b.onclick=async()=>{
    if(busy||b.classList.contains("open")||b.classList.contains("done"))return;
    if(!t0){t0=Date.now();timer=setInterval(tick,500);lock()}
    b.classList.add("open");b.setAttribute("aria-label",window.CHARS[deck[+b.dataset.n].id]?.name||"");open.push(b);
    if(open.length<2)return;
    moves++;$("mMoves").textContent=L("Langkah","Moves")+": "+moves;
    const [a,c]=open;open=[];
    if(deck[+a.dataset.n].id===deck[+c.dataset.n].id){a.classList.replace("open","done");c.classList.replace("open","done");done++;
      if(done===8){clearInterval(timer);tick();const secs=Math.floor((Date.now()-t0)/1000);
        const r=await saveResult("mem",moves,(x,y)=>x<y);
        setTimeout(()=>{unlock();showResult(L("Semua pasangan ketemu!","All pairs found!"),moves+" "+L("langkah","moves"),[bestLine(r,x=>x+" "+L("langkah","moves")),L("Waktu: ","Time: ")+Math.floor(secs/60)+":"+String(secs%60).padStart(2,"0"),L("Paling sedikit bisa 8 langkah kalau hoki. 😄","The minimum is 8 moves if you're lucky. 😄")],()=>gameMem($("view")))},450)}}
    else{busy=true;setTimeout(()=>{a.classList.remove("open");c.classList.remove("open");a.setAttribute("aria-label",L("Kartu tertutup","Hidden card"));c.setAttribute("aria-label",L("Kartu tertutup","Hidden card"));busy=false},750)}})}


/* =====================================================================
   4) TEBAK KATA (5 huruf, 6 kesempatan). Kata harian sama untuk semua akun.
   ===================================================================== */
const KATA="RUMAH MAKAN MINUM TIDUR KERJA DUNIA CINTA RINDU SENJA MALAM SIANG HUJAN PANAS ANGIN BULAN BEBEK TELUR GARAM JERUK NANAS SALAK DUREN BAKSO GULAI BUBUR TEMPE SAYUR BAYAM BERAS MERAH PUTIH HITAM HIJAU PERAK HARGA MURAH MAHAL HEMAT UTANG BAYAR PASAR KASIR STRUK SALDO BUNGA MODAL PAJAK DEBIT RAPAT TUGAS KELAS DOSEN KURSI PINTU LAMPU KAMAR DAPUR TAMAN JALAN MOTOR MOBIL BECAK KAPAL TIKET LIBUR SEDIH MARAH TAKUT MANIS PAHIT GURIH SEHAT SAKIT BADAN MULUT JAKET SABUN KASUR KUNCI GAJAH SINGA SEMUT LEBAH POHON PASIR TANAH DANAU HUTAN SAWAH KEBUN PAKAN PANEN BENIH PUPUK SEGAR KOTOR CEPAT DEKAT BESAR KECIL TEMAN PACAR KASIH PELUK JANJI SETIA MIMPI HARAP SABAR JUJUR CERIA MUSIK PESTA ACARA SABTU JUMAT KAMIS SENIN TAHUN WAKTU DETIK MENIT".split(" ");
const kataHari=()=>{const n=Math.floor(new Date(tday()+"T00:00:00Z").getTime()/864e5);return KATA[(n*37+11)%KATA.length]};
let wd=null;
function gameWord(v,mode){
  const daily=mode!=="free",td=tday(),g=G();
  if(!wd||wd.daily!==daily||(daily&&wd.day!==td)){const done=daily&&g.wordDay===td;wd={daily,day:td,ans:daily?kataHari():KATA[Math.floor(Math.random()*KATA.length)],rows:done?(g.wordRows||[]):[],cur:"",over:done,saved:done}}
  const score=(guess,ans)=>{const r=Array(5).fill("x"),a=ans.split("");guess.split("").forEach((c,i)=>{if(c===a[i]){r[i]="g";a[i]=null}});
    guess.split("").forEach((c,i)=>{if(r[i]==="g")return;const j=a.indexOf(c);if(j>=0){r[i]="y";a[j]=null}});return r};
  const keyState={};wd.rows.forEach(w=>score(w,wd.ans).forEach((s,i)=>{const c=w[i],o=keyState[c];if(s==="g"||(s==="y"&&o!=="g")||(!o))keyState[c]=s}));
  const won=wd.rows.includes(wd.ans),lost=!won&&wd.rows.length>=6;wd.over=won||lost;
  v.innerHTML=page(L("Game","Games"),"🔤 "+L("Tebak Kata","Word Guess"),`<button class="sm" id="gmBack">← ${L("Semua game","All games")}</button>`)+
   `<div class="gm-top"><button class="sm${daily?" pri":""}" id="wdDaily">📅 ${L("Kata hari ini","Today's word")}</button><button class="sm${daily?"":" pri"}" id="wdFree">🔁 ${L("Latihan","Practice")}</button><span class="sp"></span><span class="crumb">${L("Menang","Wins")}: ${g.best?.wordWins||0} · 🔥 ${g.best?.wordStreak||0}</span></div>
   <div class="wd-board">${[...Array(6)].map((_,r)=>{const w=wd.rows[r]||(r===wd.rows.length&&!wd.over?wd.cur.padEnd(5," "):"     "),s=wd.rows[r]?score(wd.rows[r],wd.ans):null;
     return `<div class="wd-row">${[...Array(5)].map((_,i)=>`<div class="wd-c ${s?s[i]:(w[i]&&w[i]!==" "?"f":"")}">${w[i]&&w[i]!==" "?w[i]:""}</div>`).join("")}</div>`}).join("")}</div>
   <div class="wd-msg" aria-live="polite">${won?"🎉 "+L("Benar! ","Correct! ")+wd.rows.length+"/6":lost?L("Jawabannya: ","The answer: ")+"<b>"+wd.ans+"</b>":daily?L("Kata hari ini sama untuk kamu dan Vina. Bandingkan skornya!","Today's word is the same for you and Vina. Compare scores!"):L("Mode latihan: kata acak, tidak masuk rekor.","Practice: random word, not counted.")}</div>
   <div class="wd-kb">${["QWERTYUIOP","ASDFGHJKL","⏎ZXCVBNM⌫"].map(r=>`<div class="wd-kr">${[...r].map(k=>`<button class="wd-k ${keyState[k]||""}${k==="⏎"||k==="⌫"?" wide":""}" data-k="${k}" aria-label="${k==="⏎"?"Enter":k==="⌫"?"Backspace":k}">${k}</button>`).join("")}</div>`).join("")}</div>
   ${wd.over?`<div class="tl-row" style="justify-content:center;margin-top:10px">${daily?`<button class="sm pri" id="wdShare">📋 ${L("Salin hasil","Copy result")}</button>`:""}<button class="sm" id="wdAgain">🔁 ${L("Main latihan","Play practice")}</button></div>`:""}
   <p class="crumb" style="text-align:center">🟩 ${L("huruf & posisi benar","right letter, right spot")} · 🟨 ${L("huruf ada, posisi salah","in the word, wrong spot")} · ⬜ ${L("tidak ada","not in the word")}</p>`;
  $("gmBack").onclick=()=>{removeEventListener("keydown",kd);unlock();wd=null;cur=null;render()};
  $("wdDaily").onclick=()=>{wd=null;gameWord(v,"daily")};$("wdFree").onclick=()=>{wd=null;gameWord(v,"free")};
  const ag=$("wdAgain");if(ag)ag.onclick=()=>{wd=null;gameWord(v,"free")};
  const sh=$("wdShare");if(sh)sh.onclick=async()=>{const txt="🔤 Tebak Kata "+td+" "+(won?wd.rows.length:"X")+"/6\n"+wd.rows.map(w=>score(w,wd.ans).map(s=>({g:"🟩",y:"🟨",x:"⬜"})[s]).join("")).join("\n");
    try{await navigator.clipboard.writeText(txt);status(L("Hasil disalin, kirim ke Vina!","Result copied, send it to Vina!"),"ok")}catch(e){alert(txt)}};
  const press=async k=>{if(wd.over)return;
    if(k==="⌫"){wd.cur=wd.cur.slice(0,-1)}else if(k==="⏎"){if(wd.cur.length<5){status(L("Kurang huruf: harus 5.","Not enough letters: needs 5."),"warn");return}
      wd.rows.push(wd.cur);wd.cur="";status("");const w2=wd.rows.includes(wd.ans),l2=!w2&&wd.rows.length>=6;
      if((w2||l2)&&!wd.saved){wd.saved=true;lock();
        if(daily){const q=JSON.parse(JSON.stringify(window.QUEST||{claimed:{},owned:{},log:[]})),gg=q.games||{best:{},days:{},plays:0};gg.best=gg.best||{};gg.days=gg.days||{};
          gg.wordDay=td;gg.wordRows=wd.rows.slice();gg.best.wordWins=(gg.best.wordWins||0)+(w2?1:0);gg.best.wordStreak=w2?(gg.best.wordStreak||0)+1:0;
          gg.days[td]=(gg.days[td]||0)+1;gg.plays=(gg.plays||0)+1;q.games=gg;try{await col.doc("quest").set(q);window.QUEST=q}catch(e){}}
        else await saveResult("wordfree",wd.rows.length,(a,b)=>a<b);
        unlock()}}
    else if(/^[A-Z]$/.test(k)&&wd.cur.length<5)wd.cur+=k;
    gameWord(v,daily?"daily":"free")};
  v.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>press(b.dataset.k));
  removeEventListener("keydown",kd);kd=e=>{if(route!=="games"||cur!=="word"){removeEventListener("keydown",kd);return}if(e.target.matches&&e.target.matches("input,textarea"))return;
    const k=e.key==="Enter"?"⏎":e.key==="Backspace"?"⌫":e.key.length===1?e.key.toUpperCase():"";if(k){e.preventDefault();press(k)}};addEventListener("keydown",kd)}
let kd=()=>{};
/* =====================================================================
   HUB
   ===================================================================== */
let cur=null;
const GAMES={coin:gameCoin,quiz:gameQuiz,mem:gameMem,word:v=>gameWord(v,"daily")};
function vGames(v){
  if(cur&&GAMES[cur]){GAMES[cur](v);return}
  unlock();
  const g=G(),td=g.days?.[tday()]||0;
  v.innerHTML=page(L("Misi","Quests"),"🎮 Game Center",`<button class="sm" id="gmQuest">🎯 ${L("Misi","Quests")}</button>`)+
   `<div class="pipi-card">${window.pipi?window.pipi(td?"party":"happy",64):""}<div class="bubble"><b>${td?L("Sudah main ","Played ")+td+L("× hari ini 🎉","× today 🎉"):L("Main sebentar yuk! 🎮","Fancy a quick game? 🎮")}</b><div>${L("Main 1 game tiap hari = 1 misi harian. Rekor tertentu membuka achievement berhadiah stiker.","Playing 1 game a day completes a daily quest. Some records unlock achievements with sticker rewards.")}</div></div></div>
   <div class="gm-hub">
    <button class="gm-card" data-g="coin"><span class="ic">🪙</span><b>${L("Tangkap Koin","Coin Catch")}</b><span class="crumb">${L("Gerakkan temanmu untuk menangkap uang dan menghindari tagihan. Makin lama makin cepat.","Move your buddy to catch money and dodge bills. It speeds up over time.")}</span><span class="best">${L("Rekor","Record")}: ${g.best?.coin!=null?rpx(g.best.coin):"–"}</span></button>
    <button class="gm-card" data-g="quiz"><span class="ic">🧾</span><b>${L("Kuis Debit-Kredit","Debit-Credit Quiz")}</b><span class="crumb">${L("10 transaksi sehari-hari pakai rekening & akun di aplikasimu. Pilih jurnal yang benar.","10 everyday transactions using your own accounts. Pick the correct journal entry.")}</span><span class="best">${L("Rekor","Record")}: ${g.best?.quiz!=null?g.best.quiz+"/10":"–"}</span></button>
    <button class="gm-card" data-g="word"><span class="ic">🔤</span><b>${L("Tebak Kata","Word Guess")}</b><span class="crumb">${L("Tebak kata 5 huruf dalam 6 kali. Kata harian sama untuk kamu dan Vina.","Guess the 5-letter word in 6 tries. The daily word is the same for you and Vina.")}</span><span class="best">${g.wordDay===tday()?L("Hari ini sudah ✓","Done today ✓"):L("Kata baru tersedia!","New word available!")}</span></button>
    <button class="gm-card" data-g="mem"><span class="ic">🧠</span><b>${L("Memori Stiker","Sticker Memory")}</b><span class="crumb">${L("Cari 8 pasang karakter, termasuk Vina dan El. Makin sedikit langkah makin bagus.","Find 8 pairs of characters, including Vina and El. Fewer moves wins.")}</span><span class="best">${L("Rekor","Record")}: ${g.best?.mem!=null?g.best.mem+" "+L("langkah","moves"):"–"}</span></button>
   </div>
   <div class="tiles" style="margin-top:12px"><div class="tile"><div class="k">${L("Total main","Total plays")}</div><div class="v">${g.plays||0}</div><div class="s">${L("30× = achievement Gamer rajin","30× = Dedicated gamer achievement")}</div></div></div>`;
  v.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{cur=b.dataset.g;render()});
  $("gmQuest").onclick=()=>go("quest")}

/* ---------- menu: masuk grup "Misi" supaya muncul di kedua mode ---------- */
const grp=NAV.find(([g])=>g==="Misi");if(grp)grp[1].unshift(["games","Game Center"]);else NAV.push(["Misi",[["games","Game Center"]]]);
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{games:v=>{try{vGames(v)}catch(e){v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}}});
const _go=go;go=function(r){if(r!=="games")cur=null;unlock();return _go(r)};
window.GAMES_STATE=G;
if(window.doPeek){const _pk=window.doPeek;window.doPeek=function(){if(guard)return;return _pk.apply(this,arguments)}}
})();
