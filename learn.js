/* =====================================================================
   BELAJAR BAHASA (Inggris · Spanyol · Jepang) + KATA-KATA HARIAN + FOKUS
   Data di dokumen "tools" yang sama (field learn, me, focus).
   ===================================================================== */
(function(){
const EN=()=>{try{return localStorage.getItem("bbp_lang")==="en"}catch(e){return false}};
const L=(id,en)=>EN()?en:id;
const tday=()=>typeof today==="function"?today():new Date().toISOString().slice(0,10);
const dayNo=s=>Math.floor(new Date(s+"T00:00:00Z").getTime()/864e5);
const T=()=>window.TOOLS||{};
const prevDay=s=>{const d=new Date(s+"T00:00:00");d.setDate(d.getDate()-1);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
async function saveT(patch){if(!col)return false;const t={...JSON.parse(JSON.stringify(T())),...patch};window.TOOLS=t;
  try{await col.doc("tools").set(t);return true}catch(e){alert(L("Gagal menyimpan: ","Save failed: ")+e.message);return false}}
const back=`<button class="sm" data-tgo="tools">← ${L("Semua alat","All tools")}</button>`;
const wire=v=>v.querySelectorAll("[data-tgo]").forEach(b=>b.onclick=()=>go(b.dataset.tgo));

/* ---------- kosakata: [kata, cara baca, arti, contoh, cara baca contoh (JP) / arti contoh] ---------- */
const LANGS={
 en:{n:"English",id:"Inggris",ex:"English",f:"🇬🇧",voice:"en-US",w:[
  ["hello","hə-LOU","halo","Hello, how are you?","Halo, apa kabar?"],["thank you","THENGK yu","terima kasih","Thank you for dinner.","Terima kasih untuk makan malamnya."],
  ["please","pliiz","tolong / silakan","Please wait a moment.","Tolong tunggu sebentar."],["sorry","SO-ri","maaf","Sorry, I'm late.","Maaf, aku telat."],
  ["budget","BAJ-it","anggaran","We need a budget for the trip.","Kita perlu anggaran untuk liburan."],["savings","SEI-vings","tabungan","My savings are growing.","Tabunganku bertambah."],
  ["expense","ik-SPENS","pengeluaran","Rent is my biggest expense.","Sewa adalah pengeluaran terbesarku."],["income","IN-kam","pendapatan","Her income increased this year.","Pendapatannya naik tahun ini."],
  ["invoice","IN-vois","faktur / tagihan","Please send the invoice by email.","Tolong kirim fakturnya lewat email."],["receipt","ri-SIIT","struk","Keep the receipt.","Simpan struknya."],
  ["cheap","ciip","murah","This shirt is cheap.","Kemeja ini murah."],["expensive","ik-SPEN-siv","mahal","Coffee here is expensive.","Kopi di sini mahal."],
  ["discount","DIS-kaunt","diskon","Is there a student discount?","Ada diskon pelajar?"],["deadline","DED-lain","tenggat waktu","The deadline is Friday.","Tenggatnya hari Jumat."],
  ["meeting","MII-ting","rapat","The meeting starts at nine.","Rapatnya mulai jam sembilan."],["schedule","SKE-jul","jadwal","What's your schedule today?","Jadwalmu hari ini apa?"],
  ["tired","TAI-erd","capek","I'm tired after work.","Aku capek habis kerja."],["happy","HE-pi","senang","I'm happy today.","Aku senang hari ini."],
  ["hungry","HANG-gri","lapar","Are you hungry? Let's eat.","Kamu lapar? Ayo makan."],["delicious","di-LI-shes","enak sekali","This soup is delicious.","Sup ini enak sekali."],
  ["weekend","WIIK-end","akhir pekan","See you this weekend.","Sampai ketemu akhir pekan ini."],["tomorrow","tu-MO-rou","besok","Call me tomorrow.","Telepon aku besok."],
  ["yesterday","YES-ter-dei","kemarin","I paid it yesterday.","Aku sudah bayar kemarin."],["always","OL-weiz","selalu","I always check my balance.","Aku selalu cek saldoku."],
  ["sometimes","SAM-taimz","kadang-kadang","Sometimes I cook at home.","Kadang-kadang aku masak di rumah."],["together","tu-GE-dher","bersama","Let's go together.","Ayo pergi bersama."],
  ["miss","mis","rindu","I miss you.","Aku rindu kamu."],["proud","praud","bangga","I'm proud of you.","Aku bangga padamu."],
  ["improve","im-PRUUV","meningkatkan","I want to improve my English.","Aku mau meningkatkan bahasa Inggrisku."],["borrow","BO-rou","meminjam","Can I borrow your pen?","Boleh aku pinjam pulpenmu?"],
  ["lend","lend","meminjamkan","I can lend you some money.","Aku bisa meminjamkanmu uang."],["owe","ou","berutang","You owe me twenty thousand.","Kamu utang dua puluh ribu ke aku."],
  ["afford","e-FORD","mampu membeli","We can't afford it yet.","Kita belum mampu membelinya."],["worth","werth","sepadan","It's worth the price.","Sepadan dengan harganya."],
  ["traffic","TRE-fik","lalu lintas / macet","The traffic is terrible today.","Macetnya parah hari ini."],["commute","ke-MYUUT","perjalanan pergi-pulang kerja","My commute takes an hour.","Perjalanan kerjaku makan waktu sejam."],
  ["weather","WE-dher","cuaca","The weather is nice today.","Cuacanya bagus hari ini."],["grateful","GREIT-ful","bersyukur","I'm grateful for you.","Aku bersyukur ada kamu."],
  ["patient","PEI-shent","sabar","Be patient, it takes time.","Sabar, butuh waktu."],["goal","goul","tujuan / target","My goal is to save ten million.","Targetku menabung sepuluh juta."]]},
 es:{n:"Español",id:"Spanyol",ex:"Spanish",f:"🇪🇸",voice:"es-ES",w:[
  ["hola","O-la","halo","¡Hola! ¿Cómo estás?","Halo! Apa kabar?"],["gracias","GRA-sias","terima kasih","Muchas gracias.","Terima kasih banyak."],
  ["por favor","por fa-BOR","tolong","Un café, por favor.","Satu kopi, tolong."],["lo siento","lo SIEN-to","maaf","Lo siento, llego tarde.","Maaf, aku terlambat."],
  ["buenos días","BUE-nos DI-as","selamat pagi","Buenos días, amor.","Selamat pagi, sayang."],["buenas noches","BUE-nas NO-ches","selamat malam","Buenas noches, hasta mañana.","Selamat malam, sampai besok."],
  ["te quiero","te KIE-ro","aku sayang kamu","Te quiero mucho.","Aku sayang banget sama kamu."],["amor","a-MOR","cinta / sayang","Hola, amor.","Halo, sayang."],
  ["dinero","di-NE-ro","uang","No tengo dinero.","Aku tidak punya uang."],["ahorrar","a-o-RRAR","menabung","Quiero ahorrar más.","Aku mau menabung lebih banyak."],
  ["gastar","gas-TAR","membelanjakan","Gasté mucho hoy.","Hari ini aku belanja banyak."],["caro","KA-ro","mahal","Es muy caro.","Ini mahal sekali."],
  ["barato","ba-RA-to","murah","Este mercado es barato.","Pasar ini murah."],["la cuenta","la KUEN-ta","bon / tagihan","La cuenta, por favor.","Minta bonnya, tolong."],
  ["precio","PRE-sio","harga","¿Cuál es el precio?","Berapa harganya?"],["trabajo","tra-BA-ho","pekerjaan","Voy al trabajo.","Aku berangkat kerja."],
  ["comida","ko-MI-da","makanan","La comida está rica.","Makanannya enak."],["agua","A-gua","air","Un vaso de agua, por favor.","Segelas air, tolong."],
  ["casa","KA-sa","rumah","Estoy en casa.","Aku di rumah."],["hoy","oi","hari ini","Hoy estoy feliz.","Hari ini aku bahagia."],
  ["mañana","ma-NYA-na","besok","Nos vemos mañana.","Sampai jumpa besok."],["ayer","a-YER","kemarin","Ayer llovió.","Kemarin hujan."],
  ["siempre","SIEM-pre","selalu","Siempre juntos.","Selalu bersama."],["juntos","HUN-tos","bersama","Vamos juntos.","Ayo pergi bersama."],
  ["feliz","fe-LIS","bahagia","Estoy feliz contigo.","Aku bahagia bersamamu."],["cansado","kan-SA-do","capek (laki-laki; perempuan: cansada)","Estoy cansado.","Aku capek."],
  ["tengo hambre","TEN-go AM-bre","aku lapar","Tengo hambre, ¿comemos?","Aku lapar, kita makan?"],["bonito","bo-NI-to","bagus / cantik","¡Qué bonito!","Bagus banget!"],
  ["¿cuánto?","KUAN-to","berapa?","¿Cuánto cuesta?","Berapa harganya?"],["¿dónde?","DON-de","di mana?","¿Dónde está el baño?","Kamar mandinya di mana?"],
  ["tienda","TIEN-da","toko","La tienda está cerrada.","Tokonya tutup."],["mercado","mer-KA-do","pasar","Vamos al mercado.","Ayo ke pasar."],
  ["vaca","BA-ka","sapi","La vaca come hierba.","Sapi makan rumput."],["granja","GRAN-ha","peternakan","Quiero una granja.","Aku mau punya peternakan."],
  ["viaje","BIA-he","perjalanan","¡Buen viaje!","Selamat jalan!"],["fin de semana","fin de se-MA-na","akhir pekan","¿Qué haces el fin de semana?","Akhir pekan kamu ngapain?"],
  ["estudiar","es-tu-DIAR","belajar","Tengo que estudiar.","Aku harus belajar."],["amigo","a-MI-go","teman (laki-laki; perempuan: amiga)","Es mi amigo.","Dia temanku."],
  ["cumpleaños","kum-ple-A-nyos","ulang tahun","¡Feliz cumpleaños!","Selamat ulang tahun!"],["de nada","de NA-da","sama-sama","—Gracias. —De nada.","—Terima kasih. —Sama-sama."]]},
 ja:{n:"日本語",id:"Jepang",ex:"Japanese",f:"🇯🇵",voice:"ja-JP",w:[
  ["こんにちは","konnichiwa","halo / selamat siang","こんにちは、げんきですか。","Konnichiwa, genki desu ka. · Halo, apa kabar?"],["ありがとう","arigatou","terima kasih","ありがとうございます。","Arigatou gozaimasu. · Terima kasih (sopan)."],
  ["すみません","sumimasen","permisi / maaf","すみません、えきはどこですか。","Sumimasen, eki wa doko desu ka. · Permisi, stasiunnya di mana?"],["おはよう","ohayou","selamat pagi","おはようございます。","Ohayou gozaimasu. · Selamat pagi (sopan)."],
  ["おやすみ","oyasumi","selamat tidur","おやすみなさい。","Oyasuminasai. · Selamat tidur (sopan)."],["だいすき","daisuki","suka sekali / sayang","だいすきだよ。","Daisuki da yo. · Aku sayang banget sama kamu."],
  ["おかね","okane","uang","おかねがない。","Okane ga nai. · Nggak ada uang."],["たかい","takai","mahal / tinggi","これはたかいです。","Kore wa takai desu. · Ini mahal."],
  ["やすい","yasui","murah","このみせはやすい。","Kono mise wa yasui. · Toko ini murah."],["いくら","ikura","berapa (harga)","これはいくらですか。","Kore wa ikura desu ka. · Ini berapa?"],
  ["みせ","mise","toko","みせはどこ？","Mise wa doko? · Tokonya di mana?"],["しごと","shigoto","pekerjaan","しごとにいきます。","Shigoto ni ikimasu. · Aku berangkat kerja."],
  ["だいがく","daigaku","universitas","だいがくでべんきょうします。","Daigaku de benkyou shimasu. · Aku belajar di universitas."],["べんきょう","benkyou","belajar","にほんごをべんきょうしています。","Nihongo o benkyou shite imasu. · Aku sedang belajar bahasa Jepang."],
  ["たべる","taberu","makan","いっしょにたべよう。","Issho ni tabeyou. · Ayo makan bareng."],["のむ","nomu","minum","みずをのむ。","Mizu o nomu. · Minum air."],
  ["みず","mizu","air","みずをください。","Mizu o kudasai. · Minta air, tolong."],["ごはん","gohan","nasi / makan","ごはんをたべましたか。","Gohan o tabemashita ka. · Sudah makan?"],
  ["おいしい","oishii","enak","とてもおいしい！","Totemo oishii! · Enak banget!"],["いっしょに","issho ni","bersama","いっしょにいこう。","Issho ni ikou. · Ayo pergi bareng."],
  ["きょう","kyou","hari ini","きょうはいいてんきです。","Kyou wa ii tenki desu. · Hari ini cuacanya bagus."],["あした","ashita","besok","またあした。","Mata ashita. · Sampai besok."],
  ["きのう","kinou","kemarin","きのうはあめでした。","Kinou wa ame deshita. · Kemarin hujan."],["いま","ima","sekarang","いまどこ？","Ima doko? · Sekarang di mana?"],
  ["うれしい","ureshii","senang","あえてうれしい。","Aete ureshii. · Senang bisa ketemu."],["つかれた","tsukareta","capek","きょうはつかれた。","Kyou wa tsukareta. · Hari ini capek."],
  ["おなかがすいた","onaka ga suita","lapar","おなかがすいた！","Onaka ga suita! · Aku lapar!"],["がんばって","ganbatte","semangat!","しけん、がんばって！","Shiken, ganbatte! · Semangat ujiannya!"],
  ["だいじょうぶ","daijoubu","tidak apa-apa","だいじょうぶですか。","Daijoubu desu ka. · Kamu nggak apa-apa?"],["ともだち","tomodachi","teman","かれはともだちです。","Kare wa tomodachi desu. · Dia temanku."],
  ["いえ","ie","rumah","いえにかえる。","Ie ni kaeru. · Pulang ke rumah."],["でんしゃ","densha","kereta","でんしゃでかえります。","Densha de kaerimasu. · Aku pulang naik kereta."],
  ["うし","ushi","sapi","うしがすきです。","Ushi ga suki desu. · Aku suka sapi."],["あめ","ame","hujan","あめがふっている。","Ame ga futte iru. · Sedang hujan."],
  ["たんじょうび","tanjoubi","ulang tahun","たんじょうびおめでとう！","Tanjoubi omedetou! · Selamat ulang tahun!"],["ちょきん","chokin","tabungan","まいつきちょきんします。","Maitsuki chokin shimasu. · Aku menabung tiap bulan."],
  ["かわいい","kawaii","lucu / imut","このねこ、かわいい！","Kono neko, kawaii! · Kucing ini lucu!"],["はい","hai","ya","はい、わかりました。","Hai, wakarimashita. · Ya, saya mengerti."],
  ["いいえ","iie","tidak / bukan","いいえ、ちがいます。","Iie, chigaimasu. · Bukan, salah."],["またね","mata ne","sampai jumpa","じゃあ、またね！","Jaa, mata ne! · Oke, sampai jumpa!"]]}};

/* ---------- suara (Web Speech, kalau HP mendukung) ---------- */
function say(text,lang){try{if(!("speechSynthesis" in window))return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.85;
  const vs=speechSynthesis.getVoices();const v=vs.find(x=>x.lang&&x.lang.replace("_","-").toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));if(v)u.voice=v;speechSynthesis.speak(u);return true}catch(e){return false}}

const css=document.createElement("style");css.textContent=`
.ln-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.ln-tabs button{font-size:14px}
.ln-word{display:flex;flex-direction:column;gap:6px;padding:14px;border:2px solid var(--line);border-radius:18px;background:var(--card)}
.ln-word.known{border-color:var(--grn)}
.ln-word .top{display:flex;gap:10px;align-items:flex-start}.ln-word .w{font-size:24px;font-weight:800;line-height:1.2;overflow-wrap:anywhere}.ln-word .p{font-size:13px;color:var(--mute)}
.ln-word .m{font-size:15px;font-weight:700;color:var(--acc)}.ln-word .ex{font-size:13.5px;line-height:1.5;background:var(--th);border-radius:12px;padding:8px 10px}
.ln-word .ex i{display:block;color:var(--mute);font-style:normal;font-size:12.5px}
.ln-say{all:unset;cursor:pointer;flex:none;width:40px;height:40px;border-radius:12px;background:var(--accS);display:flex;align-items:center;justify-content:center;font-size:18px;margin-left:auto}
.ln-say:focus-visible{outline:3px solid var(--acc)}
.ln-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}
.qt-card{display:flex;gap:12px;align-items:center;padding:14px 16px;border-radius:18px;margin-bottom:12px;border:2px solid var(--line);background:linear-gradient(135deg,var(--accS),var(--card) 70%)}
.qt-card .t{font-size:15.5px;font-weight:700;line-height:1.45}.qt-card .s{font-size:12px;color:var(--mute);margin-top:4px}
.qt-card .pipi{flex:none}
.fc-ring{position:relative;width:min(240px,70vw);aspect-ratio:1;margin:0 auto}
.fc-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.fc-ring .c{position:absolute;inset:0;pointer-events:none;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.fc-ring .c .pipi{width:46px;height:46px}.fc-ring .tm{font-size:40px;line-height:1.1;font-weight:800;font-variant-numeric:tabular-nums}.fc-ring .lb{font-size:13px;color:var(--mute)}
`;document.head.appendChild(css);

/* =====================================================================
   BELAJAR BAHASA
   ===================================================================== */
function lstate(){const l=T().learn||{};return {lang:l.lang&&LANGS[l.lang]?l.lang:"en",...l}}
function todays(code,known){const ws=LANGS[code].w,idx=ws.map((_,i)=>i),unk=idx.filter(i=>!known.includes(i)),pool=unk.length>=5?unk:idx;
  const st=(dayNo(tday())*5)%pool.length;return [...Array(5)].map((_,k)=>pool[(st+k)%pool.length])}
let quiz=null;
function vLearn(v){
  const ls=lstate(),code=ls.lang,Lg=LANGS[code],me=ls[code]||{known:[],days:[]},known=me.known||[],days=me.days||[];
  const td=tday(),studied=days.includes(td);
  let streak=0,d=td;const has=x=>days.includes(x);if(!has(d))d=prevDay(d);
  while(has(d)){streak++;d=prevDay(d)}
  const put=async(patch)=>{const all={...(T().learn||{}),lang:code,[code]:{known,days,...patch}};await saveT({learn:all})};
  const markDay=()=>days.includes(td)?days:[...days,td].slice(-120);
  if(quiz&&quiz.code===code){drawQuiz(v,Lg,code,put,markDay,known);return}
  const ids=todays(code,known);
  v.innerHTML=page(L("Alat","Tools"),"🌏 "+L("Belajar Bahasa","Learn Languages"),back)+
   `<div class="ln-tabs">${Object.entries(LANGS).map(([k,x])=>`<button class="sm${k===code?" pri":""}" data-lg="${k}">${x.f} ${x.n}</button>`).join("")}</div>
   <div class="tiles"><div class="tile"><div class="k">${L("Kata dikuasai","Words learned")}</div><div class="v">${known.length}/${Lg.w.length}</div><div class="qbar"><i style="width:${known.length/Lg.w.length*100}%"></i></div></div>
    <div class="tile"><div class="k">${L("Streak belajar","Study streak")}</div><div class="v">🔥 ${streak}</div><div class="s">${studied?L("hari ini sudah ✓","done today ✓"):L("belum belajar hari ini","not studied today")}</div></div></div>
   <div class="region"><div class="rh"><span>📅 ${L("5 kata hari ini","Today's 5 words")}</span><button class="pri sm" id="lnQuiz">🎯 ${L("Kuis 5 soal","5-question quiz")}</button></div><div class="rb"><div class="ln-list">
    ${ids.map(i=>{const [w,p,m,ex,exm]=Lg.w[i],k=known.includes(i);return `<div class="ln-word${k?" known":""}"><div class="top"><div><div class="w"></div><div class="p"></div></div><button class="ln-say" data-say="${i}" aria-label="${L("Dengarkan","Listen")}">🔊</button></div>
     <div class="m"></div><div class="ex"><span class="exa"></span><i></i></div><button class="sm${k?"":" pri"}" data-kn="${i}">${k?"✓ "+L("Sudah hafal","Learned"):L("Tandai hafal","Mark as learned")}</button></div>`}).join("")}
   </div><p class="crumb" style="margin:10px 0 0">${L("Kata yang sudah hafal tidak muncul lagi di daftar harian sampai semua kata selesai.","Learned words leave the daily list until you've learned them all.")} ${code==="ja"?L("Huruf Jepang ditulis dalam hiragana supaya mudah dibaca pemula.","Japanese is written in hiragana so beginners can read it."):""}</p></div></div>
   <details class="region"><summary class="rh" style="cursor:pointer">📚 ${L("Semua kata","All words")} (${Lg.w.length})</summary><div class="rb"><div class="tl-list" id="lnAll"></div></div></details>`;
  const cards=v.querySelectorAll(".ln-word");ids.forEach((i,k)=>{const [w,p,m,ex,exm]=Lg.w[i],c=cards[k];c.querySelector(".w").textContent=w;c.querySelector(".p").textContent="/"+p+"/";c.querySelector(".m").textContent=m;c.querySelector(".exa").textContent=ex;c.querySelector(".ex i").textContent=exm});
  $("lnAll").innerHTML=Lg.w.map((x,i)=>`<div class="tl-item"><span style="width:22px">${known.includes(i)?"✅":"▫️"}</span><div class="grow"><b></b><span class="crumb"></span></div><button class="ln-say" data-say="${i}" aria-label="${L("Dengarkan","Listen")}">🔊</button></div>`).join("");
  $("lnAll").querySelectorAll(".tl-item").forEach((r,i)=>{r.querySelector("b").textContent=Lg.w[i][0]+"  ·  "+Lg.w[i][2];r.querySelector(".crumb").textContent="/"+Lg.w[i][1]+"/"});
  wire(v);
  v.querySelectorAll("[data-lg]").forEach(b=>b.onclick=async()=>{quiz=null;await saveT({learn:{...(T().learn||{}),lang:b.dataset.lg}});render()});
  v.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>{const w=Lg.w[+b.dataset.say];if(!say(w[0],Lg.voice))status(L("HP/browser ini belum punya suara untuk bahasa ini.","This device has no voice for this language."),"warn")});
  v.querySelectorAll("[data-kn]").forEach(b=>b.onclick=async()=>{const i=+b.dataset.kn,nk=known.includes(i)?known.filter(x=>x!==i):[...known,i];await put({known:nk,days:markDay()});render()});
  $("lnQuiz").onclick=()=>{const pool=[...new Set([...ids,...known])],qs=pool.sort(()=>Math.random()-.5).slice(0,5).map(i=>{
      const wrong=Lg.w.map((_,j)=>j).filter(j=>j!==i&&Lg.w[j][2]!==Lg.w[i][2]).sort(()=>Math.random()-.5).slice(0,3);
      const dir=Math.random()<.5;return {i,dir,opts:[i,...wrong].sort(()=>Math.random()-.5)}});
    quiz={code,qs,k:0,score:0,ans:null};render()}}
function drawQuiz(v,Lg,code,put,markDay,known){
  const q=quiz.qs[quiz.k],W=Lg.w,show=q.dir?W[q.i][0]:W[q.i][2];
  v.innerHTML=page(L("Alat","Tools"),"🎯 "+L("Kuis","Quiz")+" "+Lg.f,`<button class="sm" id="qzX">✕ ${L("Keluar","Exit")}</button>`)+
   `<div class="region"><div class="rb"><div class="gm-top"><span class="gm-pill">${quiz.k+1}/5</span><span class="gm-pill">✅ ${quiz.score}</span></div>
    <div class="crumb">${q.dir?L("Apa artinya?","What does it mean?"):L("Bahasa "+Lg.id+"-nya apa?","How do you say it in "+Lg.ex+"?")}</div>
    <div class="tl-row" style="margin:6px 0 12px"><div class="tl-big" id="qzW" style="font-size:28px"></div>${q.dir?`<button class="ln-say" id="qzSay" aria-label="${L("Dengarkan","Listen")}">🔊</button>`:""}</div>
    <div class="gm-opts">${q.opts.map(j=>`<button class="gm-opt" data-o="${j}"></button>`).join("")}</div><div id="qzNext"></div></div></div>`;
  $("qzW").textContent=show;
  v.querySelectorAll("[data-o]").forEach(b=>{const j=+b.dataset.o;b.textContent=q.dir?W[j][2]:W[j][0]+"  /"+W[j][1]+"/";
    b.onclick=()=>{if(quiz.ans!=null)return;quiz.ans=j;const ok=j===q.i;if(ok)quiz.score++;
      v.querySelectorAll("[data-o]").forEach(x=>{const jj=+x.dataset.o;if(jj===q.i)x.classList.add("ok");else if(x===b)x.classList.add("no");x.disabled=true});
      say(W[q.i][0],Lg.voice);
      $("qzNext").innerHTML=`<div class="gm-why"><b>${ok?L("Benar! ","Correct! "):L("Jawabannya: ","Answer: ")}</b><span></span></div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="pri" id="qzGo">${quiz.k<4?L("Lanjut →","Next →"):L("Selesai","Finish")}</button></div>`;
      $("qzNext").querySelector("span").textContent=W[q.i][0]+" = "+W[q.i][2]+" · "+W[q.i][3];
      $("qzGo").onclick=async()=>{quiz.ans=null;if(quiz.k<4){quiz.k++;drawQuiz(v,Lg,code,put,markDay,known);return}
        const sc=quiz.score;quiz=null;await put({known,days:markDay()});
        const bg=modal(L("Kuis selesai","Quiz done"),`<div class="gm-res">${window.pipi?window.pipi(sc>=4?"party":"happy",84):""}<div class="big">${sc}/5</div><div class="crumb">${sc===5?L("Sempurna! ","Perfect! ")+({en:"Excellent!",es:"¡Excelente!",ja:"すごい！ (sugoi!)"})[code]:L("Streak belajar hari ini tercatat. Ulangi besok untuk kata baru.","Today's study streak is saved. Come back tomorrow for new words.")}</div></div>`,()=>{render()},"OK");
        const c=bg.querySelector(".c");if(c)c.style.display="none"}}});
  const sb=$("qzSay");if(sb)sb.onclick=()=>say(W[q.i][0],Lg.voice);
  $("qzX").onclick=()=>{quiz=null;render()}}

/* =====================================================================
   KATA-KATA HARIAN (beda untuk Rafi dan Vina)
   ===================================================================== */
const QUOTES={
 rafi:["Satu transaksi yang dicatat hari ini lebih berharga dari sepuluh rencana untuk besok.","Peternakan impian dimulai dari celengan kecil yang rutin diisi.",
  "Kerja keras itu penting, tapi istirahat juga bagian dari strategi.","Saldo yang cocok di akhir bulan itu rasa tenang yang nggak bisa dibeli.",
  "Hari ini cukup jadi 1% lebih baik dari kemarin.","FP&A bukan cuma soal angka, tapi cerita di balik angka. Kamu jago bercerita.",
  "Jangan bandingkan bab satu hidupmu dengan bab dua puluh orang lain.","Disiplin kecil yang konsisten mengalahkan semangat besar yang sebentar.",
  "Tagihan yang dibayar tepat waktu adalah hadiah untuk dirimu bulan depan.","Ada orang yang bangga sama kamu, bahkan di hari kamu merasa biasa saja. Namanya Vina.",
  "Rekonsiliasi terbaik: antara rencana dan tindakan.","Gagal satu kali itu data, bukan vonis.",
  "Tabung dulu, belanja kemudian. Jangan dibalik.","Kamu nggak harus tahu semuanya hari ini. Cukup tahu langkah berikutnya.",
  "Investasi paling aman: ilmu, kesehatan, dan orang yang tepat di sampingmu.","Lelahmu hari ini sedang menabung untuk mimpimu nanti.",
  "Jurnal yang rapi, pikiran yang lapang.","Setiap \"tidak\" untuk jajan impulsif adalah \"ya\" untuk tujuan besar.",
  "Minum air, tarik napas, lanjutkan.","Bos peternakan masa depan juga pernah mulai dari Excel.",
  "Bersyukur dulu, baru menghitung.","Yang penting bukan seberapa cepat, tapi kamu tidak berhenti.",
  "Kecil-kecil asal rutin, lama-lama jadi neraca yang sehat.","Jangan lupa makan. Akuntan juga manusia.",
  "Pekerjaan hari ini selesai? Bagus. Belum? Besok kita tutup bukunya.","Uang bisa dicari, waktu bersama orang tersayang tidak bisa diulang.",
  "Percaya proses, tapi tetap cek angkanya.","Kamu sudah sejauh ini. Itu bukan kebetulan.",
  "Tidur cukup adalah produktivitas yang sering diremehkan.","Hari ini, jadilah alasan seseorang tersenyum. Mulai dari Vina.",
  "Skripsi selesai, paper dipresentasikan. Kamu bukti bahwa pelan-pelan juga sampai."],
 vina:["Selamat pagi, kamu. Hari ini pasti bisa dilewati, aku di pihakmu.","Senyummu itu aset paling berharga di neraca hidupku.",
  "Capek boleh, menyerah jangan. Nanti kita jajan berdua.","Kamu nggak harus sempurna untuk disayangi.",
  "Pelan-pelan saja. Yang penting kamu baik-baik.","Ingat minum air dan makan siang, ya.",
  "Hari ini kamu cantik. Kemarin juga. Besok juga.","Apa pun hasil hari ini, kamu tetap hebat.",
  "Kalau dunia ribut, pulang ke aku ya.","Terima kasih sudah jadi teman, pacar, dan partner nabung terbaik.",
  "Satu langkah kecil hari ini tetap langkah maju.","Kamu lebih kuat dari yang kamu kira.",
  "Jangan lupa istirahat. Dunia bisa menunggu sebentar.","Kamu itu alasan aku semangat kerja.",
  "Kereta boleh telat, sayangku nggak pernah.","Hari berat? Ceritakan ke aku nanti, aku dengerin.",
  "Kebahagiaan kecil hari ini: kopi, lagu favorit, dan kabar darimu.","Kamu pantas mendapatkan hal-hal baik.",
  "Mimpimu penting. Kejar, aku temani.","Kalau ragu, ingat sudah sejauh apa kamu berjalan.",
  "Aku bangga sama kamu, hari ini dan setiap hari.","Tarik napas. Kamu sedang melakukan yang terbaik.",
  "Hidup lebih seru sejak ada kamu.","Jangan bandingkan dirimu dengan orang lain. Kamu versi terbaik dirimu.",
  "Ada aku yang selalu nunggu kabarmu.","Semoga harimu semanis senyummu.",
  "Kerja kerasmu hari ini akan terbayar, percaya deh.","Kamu nggak sendirian. Kita tim.",
  "Rencana liburan berdua masih jalan. Semangat nabungnya!","Kalau sedih, boleh nangis. Habis itu kita makan enak.",
  "Hari ini, sayangi dirimu sebanyak aku sayang kamu."]};
const SIGN=w=>w==="vina"?L("dari Rafi, untuk Vina 💗","from Rafi, to Vina 💗"):L("untuk Rafi 💪","for Rafi 💪");
function who(){const m=T().me;if(m==="rafi"||m==="vina")return m;try{const l=localStorage.getItem("bbp_me_"+((document.getElementById("who")?.textContent||"").split(" ")[0]));if(l==="rafi"||l==="vina")return l}catch(e){}return null}
async function setWho(x){try{localStorage.setItem("bbp_me_"+((document.getElementById("who")?.textContent||"").split(" ")[0]),x)}catch(e){}await saveT({me:x})}
function quoteOf(w,off=0){const q=QUOTES[w];return q[(dayNo(tday())+off+(w==="vina"?7:0))%q.length]}
function quoteCard(){const w=who();
  if(!w)return `<div class="qt-card">${window.pipi?window.pipi("think",56,"vnel"):""}<div style="flex:1;min-width:0"><div class="t">${L("Ini akun siapa?","Whose account is this?")}</div><div class="s">${L("Supaya kata-kata hariannya pas untukmu.","So your daily words fit you.")}</div><div class="tl-row" style="margin-top:8px"><button class="sm pri" data-me="rafi">Rafi</button><button class="sm pri" data-me="vina">Vina</button></div></div></div>`;
  return `<div class="qt-card">${window.pipi?window.pipi("happy",56,w==="vina"?"vcap":"erusa"):""}<div style="flex:1;min-width:0"><div class="crumb" style="font-weight:800;color:var(--acc)">💬 ${L("Kata hari ini","Today's words")}</div><div class="t qtT"></div><div class="s">${SIGN(w)}</div></div></div>`}
function wireQuote(root){root.querySelectorAll("[data-me]").forEach(b=>b.onclick=async()=>{await setWho(b.dataset.me);render()});const t=root.querySelector(".qtT");if(t)t.textContent="“"+quoteOf(who())+"”"}
function vQuote(v){const w=who();
  v.innerHTML=page(L("Alat","Tools"),"💬 "+L("Kata-kata Harian","Daily Words"),back)+`<div id="qtTop">${quoteCard()}</div>`+
   (w?`<div class="region"><div class="rh">📜 ${L("7 hari terakhir","Last 7 days")}</div><div class="rb"><div class="tl-list" id="qtHist"></div></div></div>
   <p class="crumb">${L("Akun ini: ","This account: ")}<b>${w==="vina"?"Vina":"Rafi"}</b> · <button class="lnk" id="qtSwap">${L("ganti","change")}</button> · ${L("Kata baru setiap tengah malam.","New words every midnight.")}</p>`:"");
  wire(v);wireQuote(v);
  if(w){$("qtHist").innerHTML=[1,2,3,4,5,6,7].map(()=>`<div class="tl-item"><div class="grow"><b></b><span class="crumb"></span></div></div>`).join("");
    [...$("qtHist").children].forEach((r,k)=>{const off=-(k+1);r.querySelector("b").textContent="“"+quoteOf(w,off)+"”";const d=new Date(tday()+"T00:00:00");d.setDate(d.getDate()+off);r.querySelector(".crumb").textContent=d.toLocaleDateString(EN()?"en-GB":"id-ID",{weekday:"long",day:"numeric",month:"short"})});
    $("qtSwap").onclick=async()=>{await setWho(w==="vina"?"rafi":"vina");render()}}}

/* =====================================================================
   FOKUS (pomodoro)
   ===================================================================== */
const FS={mode:"focus",end:0,left:25*60,run:false,timer:0};
const DUR={focus:25*60,short:5*60,long:15*60};
function fmtT(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function vFocus(v){
  const t=T().focus||{},td=tday(),doneToday=(t.days||{})[td]||0,total=t.total||0;
  const remaining=()=>FS.run?(FS.end-Date.now())/1000:FS.left;
  v.innerHTML=page(L("Alat","Tools"),"⏱️ "+L("Fokus","Focus"),back)+
   `<div class="region"><div class="rb"><div class="ln-tabs" style="justify-content:center">${[["focus",L("Fokus 25","Focus 25")],["short",L("Rehat 5","Break 5")],["long",L("Rehat 15","Break 15")]].map(([k,n])=>`<button class="sm${FS.mode===k?" pri":""}" data-fm="${k}">${n}</button>`).join("")}</div>
    <div class="fc-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--th)" stroke-width="10"/><circle id="fcArc" cx="60" cy="60" r="52" fill="none" stroke="var(--acc)" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg>
     <div class="c">${window.pipi?window.pipi(FS.run?(FS.mode==="focus"?"think":"sleep"):"happy",60):""}<div class="tm" id="fcT">${fmtT(remaining())}</div><div class="lb">${FS.mode==="focus"?L("waktunya fokus","focus time"):L("waktunya rehat","break time")}</div></div></div>
    <div class="tl-row" style="justify-content:center;margin-top:14px"><button class="pri" id="fcGo" style="min-width:130px;min-height:44px">${FS.run?"⏸ "+L("Jeda","Pause"):"▶ "+L("Mulai","Start")}</button><button class="sm" id="fcReset">↺ Reset</button></div>
    <p class="crumb" style="text-align:center;margin:10px 0 0">${L("Hari ini","Today")}: 🍅 ${doneToday} · ${L("Total","Total")}: ${total} ${L("sesi fokus","focus sessions")}</p></div></div>
   <p class="crumb">${L("Biarkan halaman ini terbuka. Timer tetap jalan kalau kamu pindah menu, tapi berhenti kalau aplikasi ditutup.","Keep the app open. The timer keeps going if you switch pages, but stops if the app is closed.")}</p>`;
  wire(v);
  const arc=$("fcArc"),tick=()=>{const el=$("fcT");const r=remaining();if(el){el.textContent=fmtT(r);arc&&arc.setAttribute("stroke-dashoffset",String(326.7*(1-r/DUR[FS.mode])))}
    if(FS.run&&r<=0)finish()};
  tick();
  v.querySelectorAll("[data-fm]").forEach(b=>b.onclick=()=>{if(FS.run)return;FS.mode=b.dataset.fm;FS.left=DUR[FS.mode];render()});
  $("fcGo").onclick=()=>{if(FS.run){FS.left=remaining();FS.run=false;clearInterval(FS.timer)}else{FS.end=Date.now()+FS.left*1000;FS.run=true;clearInterval(FS.timer);FS.timer=setInterval(()=>{if(route==="t_focus")tickExt();else if(FS.run&&(FS.end-Date.now())<=0)finish()},500)}render()};
  $("fcReset").onclick=()=>{FS.run=false;clearInterval(FS.timer);FS.left=DUR[FS.mode];render()};
  tickExt=tick}
let tickExt=()=>{};
async function finish(){if(!FS.run)return;FS.run=false;clearInterval(FS.timer);const was=FS.mode;FS.mode=was==="focus"?"short":"focus";FS.left=DUR[FS.mode];
  try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}
  const msg=was==="focus"?L("Sesi fokus selesai! Rehat 5 menit dulu ☕","Focus session done! Take a 5-minute break ☕"):L("Rehat selesai. Lanjut fokus? 💪","Break's over. Back to focus? 💪");
  try{if(window.Notification&&Notification.permission==="granted")new Notification("Fokus",{body:msg,icon:"icon-192.png"})}catch(e){}
  if(window.doPeek)window.doPeek(true,{t:"⏱️ "+L("Waktu habis","Time's up"),d:msg,r:"t_focus",m:"party",w:8});
  if(was==="focus"){const f=T().focus||{},td=tday(),days={...(f.days||{})};days[td]=(days[td]||0)+1;Object.keys(days).sort().slice(0,-30).forEach(k=>delete days[k]);await saveT({focus:{days,total:(f.total||0)+1}})}
  if(route==="t_focus")render()}

/* =====================================================================
   PASANG: menu, kartu hub, kartu kata di Dashboard & Hari Ini
   ===================================================================== */
const VIEWS={t_learn:vLearn,t_quote:vQuote,t_focus:vFocus};
const safe=f=>v=>{try{f(v)}catch(e){console.error(e);v.innerHTML='<div class="msg err">'+esc(e.message)+'</div>'}};
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},Object.fromEntries(Object.entries(VIEWS).map(([k,f])=>[k,safe(f)])));
if(window.TOOL_ROUTES)Object.keys(VIEWS).forEach(k=>window.TOOL_ROUTES.add(k));
const grp=NAV.find(([g])=>g==="Alat");const items=[["t_learn","Belajar Bahasa"],["t_quote","Kata-kata Harian"],["t_focus","Fokus"]];
if(grp)grp[1].splice(1,0,...items);else NAV.push(["Alat",items]);
window.EXTRA_TOOL_CARDS=[...(window.EXTRA_TOOL_CARDS||[]),
 ["t_learn","🌏",()=>L("Belajar Bahasa","Learn Languages"),()=>L("Inggris, Spanyol, Jepang: 5 kata sehari + suara + kuis.","English, Spanish, Japanese: 5 words a day + audio + quiz."),()=>{const l=T().learn;if(!l)return "";const c=l.lang||"en",k=(l[c]&&l[c].known||[]).length;return LANGS[c].f+" "+k+"/"+LANGS[c].w.length}],
 ["t_quote","💬",()=>L("Kata-kata Harian","Daily Words"),()=>L("Satu kalimat baru tiap hari, beda untuk Rafi dan Vina.","A new line every day, different for Rafi and Vina."),()=>""],
 ["t_focus","⏱️",()=>L("Fokus","Focus"),()=>L("Timer pomodoro 25/5 untuk kerja & belajar.","25/5 pomodoro timer for work and study."),()=>{const f=T().focus;const n=f&&f.days&&f.days[tday()];return n?"🍅 "+n+" "+L("hari ini","today"):""}]];
if(typeof render==="function"){const _r=render;render=function(){const out=_r.apply(this,arguments);
  try{if(route==="dash"||route==="today"){const v=document.getElementById("view"),ph=v&&v.querySelector(".ph");if(ph&&!v.querySelector(".qt-card")){const d=document.createElement("div");d.innerHTML=quoteCard();const c=d.firstElementChild;ph.after(c);wireQuote(c)}}}catch(e){}
  return out}}
})();
