/* Moleculox V6.24.3 — professional story, UX and release polish */
const APP_VERSION="v8.5.54";
(()=>{'use strict';
function isIOSStandaloneMode(){
  try{
    const ua=navigator.userAgent||'';
    const isiOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(!isiOS)return false;
    return !!(window.navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches));
  }catch(e){return false;}
}
function syncStandaloneEinsteinMode(){
  try{
    if(!document.body)return;
    document.body.classList.toggle('iosStandalone',isIOSStandaloneMode());
  }catch(e){}
}
/* ================= DATA ================= */
const LEVELS=Array.isArray(window.MX_CAMPAIGN_LEVELS)?window.MX_CAMPAIGN_LEVELS:[];
const STORY_CHAPTERS_TR=Array.isArray(window.MX_STORY_CHAPTERS_TR)?window.MX_STORY_CHAPTERS_TR:[];
const STORY_CHAPTERS_EN=Array.isArray(window.MX_STORY_CHAPTERS_EN)?window.MX_STORY_CHAPTERS_EN:[];
const STORY_ARC_TR=(window.MX_STORY_ARC_TR&&typeof window.MX_STORY_ARC_TR==='object')?window.MX_STORY_ARC_TR:{};
const STORY_ARC_EN=(window.MX_STORY_ARC_EN&&typeof window.MX_STORY_ARC_EN==='object')?window.MX_STORY_ARC_EN:{};
const CAMPAIGN_TARGET_LEVELS=301;
const NOBEL_LEVEL_INDEX=300; // 301st level: Nobel Final (added when the full campaign is ready)
const FULL_CAMPAIGN_READY=LEVELS.length>=CAMPAIGN_TARGET_LEVELS;
const DAILY_CAMPAIGN_LEVEL_COUNT=NOBEL_LEVEL_INDEX;
const DAILY_LEVEL_POOL=Array.isArray(window.MX_DAILY_LEVELS)?window.MX_DAILY_LEVELS:[];
const DAILY_EPOCH_SERIAL=Math.floor(Date.UTC(2026,6,20)/86400000);
function cloneDailyLevel(level){return JSON.parse(JSON.stringify(level));}
function certifiedDailyChallenge(date){
  date=date||new Date();
  if(!DAILY_LEVEL_POOL.length){
    const fallback=Math.abs(Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000))%DAILY_CAMPAIGN_LEVEL_COUNT;
    return {dayId:utcDayId(date),level:cloneDailyLevel(LEVELS[fallback]),themeIndex:fallback,poolIndex:fallback,variant:'I'};
  }
  const serial=Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000);
  const offset=serial-DAILY_EPOCH_SERIAL;
  const poolIndex=((offset%DAILY_LEVEL_POOL.length)+DAILY_LEVEL_POOL.length)%DAILY_LEVEL_POOL.length;
  return {dayId:utcDayId(date),level:cloneDailyLevel(DAILY_LEVEL_POOL[poolIndex]),themeIndex:poolIndex%DAILY_CAMPAIGN_LEVEL_COUNT,poolIndex,variant:'CERTIFIED'};
}
const TRACKS=["assets/audio/1dr.mp3", "assets/audio/2dr.mp3", "assets/audio/3dr.mp3", "assets/audio/4dr.mp3", "assets/audio/5dr.mp3", "assets/audio/6dr.mp3", "assets/audio/7dr.mp3", "assets/audio/8dr.mp3", "assets/audio/9dr.mp3", "assets/audio/10dr.mp3", "assets/audio/11dr.mp3", "assets/audio/12dr.mp3", "assets/audio/13dr.mp3", "assets/audio/14dr.mp3", "assets/audio/15dr.mp3", "assets/audio/16dr.mp3", "assets/audio/17dr.mp3", "assets/audio/18dr.mp3", "assets/audio/19dr.mp3", "assets/audio/20dr.mp3", "assets/audio/21dr.mp3", "assets/audio/22dr.mp3", "assets/audio/23dr.mp3"];
const MENU_TRACK_INDEX=0;
const TRACK_NAMES=["Dr. E's Lab", 'Bouncing Lab', 'Lab of Laughs', 'Atom Steps', 'Bubble Beat', 'Happy Formula', 'Neon Flask', 'Molecule Hop', 'Tiny Reactions', 'Clever Sparks', 'Puzzle Potion', 'Curious Atoms', 'Lab Parade', 'Fizzy Science', 'Quantum Bounce', 'Atomic Smile', 'Flask Dance', 'Bright Bonds', 'Eureka!', 'Science Shuffle', 'Proton Party', 'Cosmic Lab', 'Final Formula'];
const MAX_PROFILES=5;
function trackName(i){return TRACK_NAMES[i]||('Track '+(i+1));}
const W=8,H=10;
const TUT_LEVEL_1={m:'H2',p:2,g:['11111111','10000001','10000001','10000001','11000001','10000001','10000001','10000001','10000001','11111111'],a:[[1,1,'H'],[4,3,'H']]};
const TUT_LEVEL_2={m:'H2',p:1,g:['11111111','10000001','10000001','10000001','10000001','10000001','10000001','10000001','10000001','11111111'],a:[[2,7,'H'],[6,7,'H']]};
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
function DIRN_(){return I18N[LANG].dirN;}
const DIRAR=['⬆️','➡️','⬇️','⬅️'];
const EL={
  H :{c:'#4fa8ff',hi:'#cfe6ff',t:'#ffffff'},
  O :{c:'#ff5257',hi:'#ffd0d1',t:'#ffffff'},
  C :{c:'#303c48',hi:'#93a7b8',t:'#eaf6ff'},
  N :{c:'#8b5cf6',hi:'#ddccff',t:'#ffffff'},
  Cl:{c:'#3ecf6e',hi:'#ccf6da',t:'#06371c'},
  Na:{c:'#e9eef4',hi:'#ffffff',t:'#37424d'},
  S :{c:'#ffd23f',hi:'#fff3bd',t:'#5c4a00'},
  F :{c:'#c6e84a',hi:'#eefdb0',t:'#2f4a00'},
  Xe:{c:'#3ecfc4',hi:'#c6f5ef',t:'#083b36'},
  B :{c:'#ff9e8a',hi:'#ffd9cf',t:'#5c1c0e'},
  P :{c:'#f0c05a',hi:'#ffe9bd',t:'#4a3200'},
  Si:{c:'#a8b5c2',hi:'#e2e8ee',t:'#1c2733'},
  Br:{c:'#a13b1c',hi:'#ff9e6e',t:'#ffffff'},
  I :{c:'#5e2a8c',hi:'#c9a0ff',t:'#ffffff'},
  K :{c:'#8f5fd1',hi:'#dcc8ff',t:'#2a1245'},
  Ca:{c:'#7fae7f',hi:'#d4ecd4',t:'#1c3320'},
  Al:{c:'#b8bec5',hi:'#eef1f4',t:'#22262b'},
  Li:{c:'#d17f9e',hi:'#ffd6e6',t:'#3a1220'},
  Mg:{c:'#6bc98a',hi:'#c8f5d6',t:'#0e2617'},
  Ge:{c:'#7a8fa6',hi:'#cfe0f0',t:'#141c26'},
  Ga:{c:'#c9a876',hi:'#f0e0c0',t:'#2a2010'},
  Sn:{c:'#9db3bd',hi:'#e0eaee',t:'#1a2226'},
  As:{c:'#c07ec9',hi:'#f0c8f5',t:'#2a132c'},
  Se:{c:'#e67e22',hi:'#ffd4a8',t:'#3d1c00'}
};
const ELINFO_EN={
  H :{n:'Hydrogen',z:1, fa:'The simplest, lightest element — and the most abundant in the universe!'},
  O :{n:'Oxygen',z:8, fa:"You need me to breathe — but I'm also what makes fire burn!"},
  C :{n:'Carbon',z:6, fa:"I'm the backbone of every living thing, including you!"},
  N :{n:'Nitrogen',z:7, fa:'78% of the air around you is me, yet you never notice!'},
  Cl:{n:'Chlorine',z:17,fa:'I keep pools clean — and I react fiercely with almost everything!'},
  Na:{n:'Sodium',z:11,fa:"Drop me in water and I'll practically explode!"},
  S :{n:'Sulfur',z:16,fa:'I smell like rotten eggs, but life needs me to function!'},
  F :{n:'Fluorine',z:9, fa:"I'm the single most reactive element on the whole table!"},
  Xe:{n:'Xenon',z:54,fa:"I'm a noble gas — I don't like bonding with anyone!"},
  B :{n:'Boron',z:5, fa:"Rare on Earth, but I'm essential in glass and ceramics!"},
  P :{n:'Phosphorus',z:15,fa:"My white form glows in the dark and can catch fire in air — that's where my name comes from!"},
  Si:{n:'Silicon',z:14,fa:"I am the heart of every computer chip — you are reading this thanks to me!"},
  Br:{n:'Bromine',z:35,fa:"I am one of only two elements that are liquid at room temperature!"},
  I :{n:'Iodine',z:53,fa:"Your thyroid gland needs me to work properly!"},
  K :{n:'Potassium',z:19,fa:"I help your heart beat and your muscles move!"},
  Ca:{n:'Calcium',z:20,fa:"I build your bones and teeth strong!"},
  Al:{n:'Aluminum',z:13,fa:"I am the most abundant metal in Earth's crust!"},
  Li:{n:'Lithium',z:3,fa:"I power the battery in your phone right now!"},
  Mg:{n:'Magnesium',z:12,fa:"I burn with a dazzling bright white light — used in fireworks!"},
  Ge:{n:'Germanium',z:32,fa:"I was crucial in building the very first transistors!"},
  Ga:{n:'Gallium',z:31,fa:"I can melt right in the palm of your hand — my melting point is close to body temperature!"},
  Sn:{n:'Tin',z:50,fa:"Ancient civilizations mixed me with copper to make bronze!"},
  As:{n:'Arsenic',z:33,fa:"Despite my toxic reputation, tiny traces of me are used in semiconductors!"},
  Se:{n:'Selenium',z:34,fa:'I help living cells in tiny amounts and can form deep red and gray solids!'}
};
const ELINFO_TR_TXT={
  H :{n:'Hidrojen', fa:'En basit, en hafif element — ve evrendeki en bol element!'},
  O :{n:'Oksijen', fa:'Nefes almak için bana ihtiyacın var — ama ateşi yakan da benim!'},
  C :{n:'Karbon', fa:'Senin de dahil olduğun her canlının omurgasıyım!'},
  N :{n:'Azot', fa:'Çevrendeki havanın %78\'i benim, ama hiç fark etmezsin!'},
  Cl:{n:'Klor', fa:'Havuzları temiz tutarım — ve neredeyse her şeyle şiddetle tepkimeye girerim!'},
  Na:{n:'Sodyum', fa:'Beni suya at, neredeyse patlarım!'},
  S :{n:'Kükürt', fa:'Çürük yumurta gibi kokarım ama yaşam benim varlığıma muhtaç!'},
  F :{n:'Flor', fa:'Tüm tablodaki en reaktif tek elementim!'},
  Xe:{n:'Ksenon', fa:'Soy bir gazım — kimseyle bağ kurmayı sevmem!'},
  B :{n:'Bor', fa:'Dünyada nadirim ama cam ve seramikte vazgeçilmezim!'},
  P :{n:'Fosfor', fa:'Beyaz halim karanlıkta parlar, havayla temas edince kendiliğinden tutuşabilirim — adım da buradan gelir!'},
  Si:{n:'Silisyum', fa:'Her bilgisayar çipinin kalbindeyim — bunu şu an benim sayemde okuyorsun!'},
  Br:{n:'Brom', fa:'Oda sıcaklığında sıvı halde bulunan sadece iki elementten biriyim!'},
  I :{n:'İyot', fa:'Tiroid bezinin düzgün çalışması için bana ihtiyacı var!'},
  K :{n:'Potasyum', fa:'Kalbinin atmasına ve kaslarının çalışmasına yardım ederim!'},
  Ca:{n:'Kalsiyum', fa:'Kemiklerini ve dişlerini güçlü yaparım!'},
  Al:{n:'Alüminyum', fa:'Yer kabuğundaki en bol metalim!'},
  Li:{n:'Lityum', fa:'Şu an telefonundaki pili ben çalıştırıyorum!'},
  Mg:{n:'Magnezyum', fa:'Göz kamaştırıcı parlak beyaz bir ışıkla yanarım — havai fişeklerde kullanılırım!'},
  Ge:{n:'Germanyum', fa:'İlk transistörlerin yapımında çok önemliydim!'},
  Ga:{n:'Galyum', fa:'Avucunda eriyebilirim — erime noktam vücut sıcaklığına çok yakın!'},
  Sn:{n:'Kalay', fa:'Antik uygarlıklar beni bakırla karıştırıp tunç yaptı!'},
  As:{n:'Arsenik', fa:'Zehirli ününe rağmen, çok küçük miktarlarım yarı iletkenlerde kullanılır!'},
  Se:{n:'Selenyum', fa:'Çok küçük miktarlarda canlı hücrelere yardım eder, koyu kırmızı ve gri katılar oluşturabilirim!'}
};
function mergeTxt(base,txt){const o={};for(const k in base)o[k]=Object.assign({},base[k],txt[k]||{});return o;}
const ELINFO_TR=mergeTxt(ELINFO_EN,ELINFO_TR_TXT);
const MOLS_EN={
  H2:{n:'HYDROGEN',f:'H₂',s:[['H',0,0],['H',1,0]],w:'POP!',fx:'pop',c:['#ffffff','#cfe4ff','#9ec9ff'],fa:'I am the lightest, most abundant element in the universe!'},
F2:{n:'FLUORINE GAS',f:'F₂',s:[['F',0,0],['F',1,0]],w:'ZAP!',fx:'spark',c:['#e2f27a','#c6e84a','#f4fab8'],fa:'I am the most reactive gas known — I even react with glass!'},
NaF:{n:'SODIUM FLUORIDE',f:'NaF',s:[['Na',0,0],['F',1,0]],w:'SPARKLE!',fx:'glit',c:['#e9eef4','#c6e84a'],fa:'You brush your teeth with me every day — I fight cavities!'},
CS2:{n:'CARBON DISULFIDE',f:'CS₂',s:[['S',0,0],['C',1,0],['S',2,0]],w:'FLASH!',fx:'flame',c:['#ffe17a','#303c48'],fa:'I am so flammable I can ignite just from a hot surface!'},
BCl3:{n:'BORON TRICHLORIDE',f:'BCl₃',s:[['B',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1]],w:'MISTY!',fx:'smoke',c:['#7ee8a0','#ff9e8a'],fa:'I fume in moist air, forming a ghostly white cloud!'},
PH3:{n:'PHOSPHINE',f:'PH₃',s:[['P',1,1],['H',1,0],['H',0,1],['H',2,1]],w:'GLOW!',fx:'bub',c:['#f0c05a','#4fa8ff'],fa:'I can spontaneously ignite in air — nicknamed will-o\'-the-wisp gas!'},
Cl2:{n:'CHLORINE GAS',f:'Cl₂',s:[['Cl',0,0],['Cl',1,0]],w:'POP!',fx:'pop',c:['#3ecf6e','#ccf6da'],fa:'I gave World War I its most feared weapon — but I also keep pools clean!'},
N2:{n:'NITROGEN GAS',f:'N₂',s:[['N',0,0],['N',1,0]],w:'POP!',fx:'pop',c:['#8b5cf6','#ddccff'],fa:'You are breathing me right now — I make up 78% of the air!'},
HCl:{n:'HYDROGEN CHLORIDE',f:'HCl',s:[['H',0,0],['Cl',1,0]],w:'FIZZ!',fx:'bub',c:['#4fa8ff','#3ecf6e'],fa:'Dissolved in water, I become stomach acid — I help you digest food!'},
ClF:{n:'CHLORINE MONOFLUORIDE',f:'ClF',s:[['Cl',0,0],['F',1,0]],w:'ZAP!',fx:'spark',c:['#3ecf6e','#c6e84a'],fa:'I am a powerful fluorinating agent used in rocket fuel research!'},
XeF2:{n:'XENON DIFLUORIDE',f:'XeF₂',s:[['F',0,0],['Xe',1,0],['F',2,0]],w:'GLOW!',fx:'glit',c:['#3ecfc4','#c6e84a'],fa:'I proved noble gases are not so noble — I actually react with things!'},
PF3:{n:'PHOSPHORUS TRIFLUORIDE',f:'PF₃',s:[['P',1,1],['F',1,0],['F',0,1],['F',2,1]],w:'ZAPP!',fx:'spark',c:['#f0c05a','#c6e84a'],fa:'I bind to blood the same way carbon monoxide does — quite toxic!'},
PCl3:{n:'PHOSPHORUS TRICHLORIDE',f:'PCl₃',s:[['P',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1]],w:'POOF!',fx:'squig',c:['#f0c05a','#3ecf6e'],fa:'I am a key ingredient in making pesticides and flame retardants!'},
SiH4:{n:'SILANE',f:'SiH₄',s:[['Si',1,1],['H',1,0],['H',0,1],['H',2,1],['H',1,2]],w:'FLAME!',fx:'flame',c:['#a8b5c2','#e2e8ee'],fa:'I catch fire the instant I touch air — no spark needed at all!'},
SiF4:{n:'SILICON TETRAFLUORIDE',f:'SiF₄',s:[['Si',1,1],['F',1,0],['F',0,1],['F',2,1],['F',1,2]],w:'STABLE!',fx:'spark',c:['#a8b5c2','#c6e84a'],fa:'I am released when hydrofluoric acid etches glass!'},
SiCl4:{n:'SILICON TETRACHLORIDE',f:'SiCl₄',s:[['Si',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1],['Cl',1,2]],w:'MISTY!',fx:'smoke',c:['#a8b5c2','#3ecf6e'],fa:'I am a key stepping stone to making the silicon in computer chips!'},
ClO2:{n:'CHLORINE DIOXIDE',f:'ClO₂',s:[['O',0,0],['Cl',1,0],['O',1,1]],w:'ZAPP!',fx:'spark',c:['#3ecf6e','#ff5257'],fa:'I am used to purify drinking water and bleach paper!'},
Br2:{n:'BROMINE',f:'Br₂',s:[['Br',0,0],['Br',1,0]],w:'POP!',fx:'smoke',c:['#a13b1c','#ff9e6e'],fa:'I am one of the rare elements that is liquid at room temperature!'},
HBr:{n:'HYDROGEN BROMIDE',f:'HBr',s:[['H',0,0],['Br',1,0]],w:'FIZZ!',fx:'bub',c:['#4fa8ff','#a13b1c'],fa:'Dissolved in water, I form a strong acid used in chemical manufacturing!'},
SBr2:{n:'SULFUR DIBROMIDE',f:'SBr₂',s:[['Br',0,0],['S',1,0],['Br',1,1]],w:'STINK!',fx:'smoke',c:['#fff59d','#a13b1c'],fa:'I am an unstable, foul-smelling cousin of sulfur dichloride!'},
CBr4:{n:'CARBON TETRABROMIDE',f:'CBr₄',s:[['C',1,1],['Br',1,0],['Br',0,1],['Br',2,1],['Br',1,2]],w:'MISTY!',fx:'smoke',c:['#303c48','#a13b1c'],fa:'I am a dense solid used as a heavy liquid substitute in labs!'},
PBr3:{n:'PHOSPHORUS TRIBROMIDE',f:'PBr₃',s:[['P',1,1],['Br',1,0],['Br',0,1],['Br',2,1]],w:'ZAPP!',fx:'spark',c:['#f0c05a','#a13b1c'],fa:'I am used to convert alcohols into useful alkyl bromides!'},
BBr3:{n:'BORON TRIBROMIDE',f:'BBr₃',s:[['B',1,1],['Br',1,0],['Br',0,1],['Br',2,1]],w:'MISTY!',fx:'smoke',c:['#7ee8a0','#a13b1c'],fa:'I fume violently in moist air, just like my chlorine cousin!'},
HI:{n:'HYDROGEN IODIDE',f:'HI',s:[['H',0,0],['I',1,0]],w:'FIZZ!',fx:'bub',c:['#4fa8ff','#5e2a8c'],fa:'I am one of the strongest acids known once dissolved in water!'},
I2:{n:'IODINE',f:'I₂',s:[['I',0,0],['I',1,0]],w:'POP!',fx:'pop',c:['#5e2a8c','#c9a0ff'],fa:'I turn a beautiful violet color when heated into a gas!'},
NaI:{n:'SODIUM IODIDE',f:'NaI',s:[['Na',0,0],['I',1,0]],w:'SPARKLE!',fx:'glit',c:['#e9eef4','#5e2a8c'],fa:'I am added to table salt worldwide to prevent iodine deficiency!'},
KCl:{n:'POTASSIUM CHLORIDE',f:'KCl',s:[['K',0,0],['Cl',1,0]],w:'SPARKLE!',fx:'glit',c:['#8f5fd1','#3ecf6e'],fa:'I am used as a salt substitute for people watching their sodium!'},
KF:{n:'POTASSIUM FLUORIDE',f:'KF',s:[['K',0,0],['F',1,0]],w:'SPARKLE!',fx:'glit',c:['#8f5fd1','#c6e84a'],fa:'I am used in trace amounts in some toothpastes!'},
KBr:{n:'POTASSIUM BROMIDE',f:'KBr',s:[['K',0,0],['Br',1,0]],w:'SPARKLE!',fx:'glit',c:['#8f5fd1','#a13b1c'],fa:'I was once a common sedative used in medicine over a century ago!'},
KI:{n:'POTASSIUM IODIDE',f:'KI',s:[['K',0,0],['I',1,0]],w:'SPARKLE!',fx:'glit',c:['#8f5fd1','#5e2a8c'],fa:'I am handed out near nuclear plants to protect the thyroid in emergencies!'},
LiCl:{n:'LITHIUM CHLORIDE',f:'LiCl',s:[['Li',0,0],['Cl',1,0]],w:'SPARKLE!',fx:'glit',c:['#d17f9e','#3ecf6e'],fa:'I am so good at absorbing moisture I am used in industrial dehumidifiers!'},
LiF:{n:'LITHIUM FLUORIDE',f:'LiF',s:[['Li',0,0],['F',1,0]],w:'SPARKLE!',fx:'glit',c:['#d17f9e','#c6e84a'],fa:'My crystals are used to make lenses for ultraviolet telescopes!'},
CaCl2:{n:'CALCIUM CHLORIDE',f:'CaCl₂',s:[['Cl',0,0],['Ca',1,0],['Cl',1,1]],w:'STINK!',fx:'smoke',c:['#7fae7f','#3ecf6e'],fa:'I am spread on icy roads in winter to melt the ice!'},
CaF2:{n:'CALCIUM FLUORIDE',f:'CaF₂',s:[['F',0,0],['Ca',1,0],['F',1,1]],w:'STINK!',fx:'smoke',c:['#7fae7f','#c6e84a'],fa:'I form the mineral fluorite, prized by crystal collectors!'},
CaBr2:{n:'CALCIUM BROMIDE',f:'CaBr₂',s:[['Br',0,0],['Ca',1,0],['Br',1,1]],w:'STINK!',fx:'smoke',c:['#7fae7f','#a13b1c'],fa:'I am used in drilling fluids for oil and gas wells!'},
AlCl3:{n:'ALUMINUM CHLORIDE',f:'AlCl₃',s:[['Al',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1]],w:'ZAPP!',fx:'spark',c:['#b8bec5','#3ecf6e'],fa:'I am a key catalyst in making everyday plastics and dyes!'},
AlF3:{n:'ALUMINUM FLUORIDE',f:'AlF₃',s:[['Al',1,1],['F',1,0],['F',0,1],['F',2,1]],w:'ZAPP!',fx:'spark',c:['#b8bec5','#c6e84a'],fa:'I help lower the melting point when smelting aluminum metal!'},
AlBr3:{n:'ALUMINUM BROMIDE',f:'AlBr₃',s:[['Al',1,1],['Br',1,0],['Br',0,1],['Br',2,1]],w:'ZAPP!',fx:'spark',c:['#b8bec5','#a13b1c'],fa:'I am a powerful catalyst used in organic chemistry labs!'},
MgCl2:{n:'MAGNESIUM CHLORIDE',f:'MgCl₂',s:[['Cl',0,0],['Mg',1,0],['Cl',1,1]],w:'STINK!',fx:'smoke',c:['#6bc98a','#3ecf6e'],fa:'I am extracted from seawater and used to de-ice winter roads!'},
MgF2:{n:'MAGNESIUM FLUORIDE',f:'MgF₂',s:[['F',0,0],['Mg',1,0],['F',1,1]],w:'STINK!',fx:'smoke',c:['#6bc98a','#c6e84a'],fa:'My crystals are transparent to UV light, used in camera lenses!'},
MgBr2:{n:'MAGNESIUM BROMIDE',f:'MgBr₂',s:[['Br',0,0],['Mg',1,0],['Br',1,1]],w:'STINK!',fx:'smoke',c:['#6bc98a','#a13b1c'],fa:'I am used in some flame-retardant materials!'},
GeH4:{n:'GERMANE',f:'GeH₄',s:[['Ge',1,1],['H',1,0],['H',0,1],['H',2,1],['H',1,2]],w:'FLAME!',fx:'flame',c:['#7a8fa6','#e2e8ee'],fa:'I am used to grow ultra-pure germanium crystals for electronics!'},
GeF4:{n:'GERMANIUM TETRAFLUORIDE',f:'GeF₄',s:[['Ge',1,1],['F',1,0],['F',0,1],['F',2,1],['F',1,2]],w:'STABLE!',fx:'spark',c:['#7a8fa6','#c6e84a'],fa:'I am a stepping stone in purifying germanium for fiber optics!'},
GeCl4:{n:'GERMANIUM TETRACHLORIDE',f:'GeCl₄',s:[['Ge',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1],['Cl',1,2]],w:'MISTY!',fx:'smoke',c:['#7a8fa6','#3ecf6e'],fa:'I am a key ingredient in manufacturing fiber-optic cables!'},
GaCl3:{n:'GALLIUM CHLORIDE',f:'GaCl₃',s:[['Ga',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1]],w:'ZAPP!',fx:'spark',c:['#c9a876','#3ecf6e'],fa:'I am used as a catalyst in specialized organic reactions!'},
GaF3:{n:'GALLIUM FLUORIDE',f:'GaF₃',s:[['Ga',1,1],['F',1,0],['F',0,1],['F',2,1]],w:'ZAPP!',fx:'spark',c:['#c9a876','#c6e84a'],fa:'I remain stable at extremely high temperatures!'},
GaBr3:{n:'GALLIUM BROMIDE',f:'GaBr₃',s:[['Ga',1,1],['Br',1,0],['Br',0,1],['Br',2,1]],w:'ZAPP!',fx:'spark',c:['#c9a876','#a13b1c'],fa:'I am used in research involving semiconductor crystal growth!'},
SnCl4:{n:'TIN TETRACHLORIDE',f:'SnCl₄',s:[['Sn',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1],['Cl',1,2]],w:'MISTY!',fx:'smoke',c:['#9db3bd','#3ecf6e'],fa:'I was historically used to coat glass bottles for extra strength!'},
SnBr4:{n:'TIN TETRABROMIDE',f:'SnBr₄',s:[['Sn',1,1],['Br',1,0],['Br',0,1],['Br',2,1],['Br',1,2]],w:'MISTY!',fx:'smoke',c:['#9db3bd','#a13b1c'],fa:'I form pale yellow crystals at room temperature!'},
S8:{n:'SULFUR RING',f:'S₈',s:[['S',0,0],['S',1,0],['S',2,0],['S',2,1],['S',2,2],['S',1,2],['S',0,2],['S',0,1]],w:'GLOW!',fx:'flame',c:['#fff59d','#ffd54f'],fa:'This crown-shaped ring is the most common natural form of sulfur!'},
AsH3:{n:'ARSINE',f:'AsH₃',s:[['As',1,1],['H',1,0],['H',0,1],['H',2,1]],w:'POOF!',fx:'squig',c:['#c07ec9','#4fa8ff'],fa:'I am colorless and dangerous, but essential for making semiconductor chips!'},
  O2:{n:'OXYGEN',f:'O₂',s:[['O',0,0],['O',1,0]],w:'FIZZZ!',fx:'bub',c:['#4fc3f7','#b3e5fc'],fa:'You are breathing me right now. You are welcome! 😌'},
  CO:{n:'CARBON MONOXIDE',f:'CO',s:[['C',0,0],['O',1,0]],w:'SMOKE!',fx:'smoke',c:['#cfd8dc','#90a4ae'],fa:'Sneaky and dangerous — get a detector! ⚠️'},
  NaCl:{n:'SALT',f:'NaCl',s:[['Na',0,0],['Cl',1,0]],w:'SALT!',fx:'crys',c:['#ffffff','#ffe082','#fff8e1'],fa:'I am the soulmate of french fries. 🍟'},
  H2O:{n:'WATER',f:'H₂O',s:[['H',0,0],['O',1,0],['H',1,1]],w:'SPLASH!',fx:'splash',c:['#4fc3f7','#b3e5fc','#81d4fa'],fa:'I am 60% of your body! 💧'},
  CO2:{n:'CARBON DIOXIDE',f:'CO₂',s:[['O',0,0],['C',1,0],['O',2,0]],w:'PUFF!',fx:'smoke',c:['#b0bec5','#eceff1'],fa:'The bubbles in your soda? My work. 🥤'},
  NO2:{n:'NITROGEN DIOXIDE',f:'NO₂',s:[['O',0,0],['N',1,0],['O',1,1]],w:'NOX!',fx:'smoke',c:['#ffab91','#ff8a65'],fa:'I give city smog its orange tint.'},
  H2S:{n:'HYDROGEN SULFIDE',f:'H₂S',s:[['H',0,0],['S',1,0],['H',1,1]],w:'EWWW! 🤢',fx:'squig',c:['#ffee58','#d4e157'],fa:'Rotten egg smell? Guilty as charged. 🥚'},
  O3:{n:'OZONE',f:'O₃',s:[['O',0,0],['O',1,0],['O',1,1]],w:'OZONE!',fx:'bub',c:['#b388ff','#e1bee7'],fa:'I am your shield against harmful sun rays! 🛡️'},
  SO2:{n:'SULFUR DIOXIDE',f:'SO₂',s:[['O',0,0],['S',1,0],['O',1,1]],w:'HISSS!',fx:'smoke',c:['#fff59d','#fff9c4'],fa:'When volcanoes erupt, I take the stage! 🌋'},
  OF2:{n:'OXYGEN DIFLUORIDE',f:'OF₂',s:[['F',0,0],['O',1,0],['F',1,1]],w:'ZAP!',fx:'spark',c:['#c6e84a','#eefdb0'],fa:"I'm the rare compound where oxygen isn't in charge! ⚡"},
  SCl2:{n:'SULFUR DICHLORIDE',f:'SCl₂',s:[['Cl',0,0],['S',1,0],['Cl',1,1]],w:'STINK!',fx:'smoke',c:['#fff59d','#c5e1a5'],fa:"I'm a cherry-red liquid that helps vulcanize your tires! 🚗"},
  NH3:{n:'AMMONIA',f:'NH₃',s:[['N',1,1],['H',1,0],['H',0,1],['H',2,1]],w:'POOF!',fx:'squig',c:['#aed581','#dce775'],fa:'I am the sharp-smelling star of cleaning products.'},
  H2O2:{n:'HYDROGEN PEROXIDE',f:'H₂O₂',s:[['H',0,0],['O',1,0],['O',1,1],['H',2,1]],w:'BUBBLES!',fx:'bub',c:['#ffffff','#e1f5fe'],fa:'I am that fizzing hero on your scraped knee! 🩹'},
  S2Cl2:{n:'DISULFUR DICHLORIDE',f:'S₂Cl₂',s:[['Cl',0,0],['S',1,0],['S',1,1],['Cl',2,1]],w:'STRETCH!',fx:'glit',c:['#aed581','#dce775'],fa:'I give rubber its stretchy bounce! 🎈'},
  CH2O:{n:'FORMALDEHYDE',f:'CH₂O',s:[['C',1,1],['O',2,1],['H',1,0],['H',1,2]],w:'SPARKLE!',fx:'glit',c:['#f8bbd0','#ffffff','#ce93d8'],fa:'I am the preserver of biology labs.'},
  BF3:{n:'BORON TRIFLUORIDE',f:'BF₃',s:[['B',1,1],['F',1,0],['F',0,1],['F',2,1]],w:'ZAPP!',fx:'spark',c:['#ff9e8a','#ffd9cf'],fa:"I'm so hungry for electrons, I'll steal them from anyone! 🤤"},
  XeF4:{n:'XENON TETRAFLUORIDE',f:'XeF₄',s:[['Xe',1,1],['F',1,0],['F',0,1],['F',2,1],['F',1,2]],w:'NOBLE!',fx:'crys',c:['#3ecfc4','#c6f5ef'],fa:'Xenon was called "too lazy to bond" — I proved them wrong! 😤'},
  CH4:{n:'METHANE',f:'CH₄',s:[['C',1,1],['H',1,0],['H',0,1],['H',2,1],['H',1,2]],w:'FLAME!',fx:'flame',c:['#69f0ae','#00e676','#b9f6ca'],fa:'I am the cows\' little embarrassment... 🐄💨'},
CCl4:{n:'CARBON TETRACHLORIDE',f:'CCl₄',s:[['C',1,1],['Cl',1,0],['Cl',0,1],['Cl',2,1],['Cl',1,2]],w:'CLEAR!',fx:'smoke',c:['#7ee8a0','#3ecf6e','#ccf6da'],fa:'Old fire extinguishers used me — now I\'m banned, I harm the ozone layer! ☁️'},
CF4:{n:'CARBON TETRAFLUORIDE',f:'CF₄',s:[['C',1,1],['F',1,0],['F',0,1],['F',2,1],['F',1,2]],w:'STABLE!',fx:'spark',c:['#e2f27a','#c6e84a','#f4fab8'],fa:'I\'m so stable that computer chip factories use me safely every day! 💻'},
S4:{n:'TETRASULFUR',f:'S₄',s:[['S',0,0],['S',1,0],['S',1,1],['S',0,1]],w:'RING!',fx:'crys',c:['#ffe17a','#ffd23f','#fff3bd'],fa:'I\'m a shy little ring — I fall apart faster than most molecules! 💛'},
P4:{n:'WHITE PHOSPHORUS',f:'P₄',s:[['P',0,0],['P',1,0],['P',1,1],['P',0,1]],w:'GLOW!',fx:'glit',c:['#ffe9bd','#f0c05a','#fff6df'],fa:'I glow softly in the dark — old matchsticks were made from me! ✨'},
  HF:{n:'HYDROGEN FLUORIDE',f:'HF',s:[['H',0,0],['F',1,0]],w:'BZZZT!',fx:'spark',c:['#c6e84a','#eefdb0','#9ccc65'],fa:'I can etch glass — do not mess with me! 😤'},
  NO:{n:'NITRIC OXIDE',f:'NO',s:[['N',0,0],['O',1,0]],w:'SIGNAL!',fx:'smoke',c:['#ffab91','#ffccbc'],fa:'I am the secret signal that widens your vessels! 🫀'},
  HCN:{n:'HYDROGEN CYANIDE',f:'HCN',s:[['H',0,0],['C',1,0],['N',2,0]],w:'DANGER!',fx:'squig',c:['#c5e1a5','#aed581'],fa:'I smell of bitter almonds... keep your distance! ☠️'},
  N2O:{n:'LAUGHING GAS',f:'N₂O',s:[['N',0,0],['N',1,0],['O',2,0]],w:'TEEHEE!',fx:'bub',c:['#f8bbd0','#fce4ec','#f48fb1'],fa:'I am the dentist\'s secret weapon — I make you giggle! 😆'},
  SO3:{n:'SULFUR TRIOXIDE',f:'SO₃',s:[['S',1,1],['O',1,0],['O',0,1],['O',2,1]],w:'SSSS!',fx:'smoke',c:['#fff176','#fff9c4'],fa:'If I sneak into clouds, I become acid rain! 🌧️'},
  C2H4:{n:'ETHYLENE',f:'C₂H₄',s:[['C',1,1],['C',2,1],['H',1,0],['H',2,0],['H',1,2],['H',2,2]],w:'FRUIT!',fx:'glit',c:['#a5d6a7','#c8e6c9','#81c784'],fa:'I am the one who ripens bananas! 🍌'},
  N2H4:{n:'HYDRAZINE',f:'N₂H₄',s:[['N',1,1],['N',2,1],['H',1,0],['H',2,0],['H',1,2],['H',2,2]],w:'ROCKET!',fx:'flame',c:['#ff8a3c','#ffb74d','#ffd180'],fa:'I am rocket fuel — I take you to space! 🚀'},
  CH3OH:{n:'METHANOL',f:'CH₃OH',s:[['C',1,1],['H',1,0],['H',0,1],['H',1,2],['O',2,1],['H',3,1]],w:'FUEL!',fx:'flame',c:['#4fc3f7','#81d4fa','#b3e5fc'],fa:'I fuel race cars. Never drink me! 🏎️'},
  C4RING:{n:'CYCLOBUTANE',f:'C₄H₈',s:[['C',0,0],['C',1,0],['C',1,1],['C',0,1]],w:'RING!',fx:'pop',c:['#90a4ae','#cfd8dc'],fa:'My ring is so tense, it wants to spring open! 🌀'},
  C8RING:{n:"DR. E's RING",f:'C₈',s:[['C',0,0],['C',1,0],['C',2,0],['C',2,1],['C',2,2],['C',1,2],['C',0,2],['C',0,1]],w:'GENIUS!',fx:'glit',c:['#b39ddb','#e1bee7','#fff59d'],fa:'My personal puzzle — only a true genius closes this loop! 🧠✨'}
};
const EXTRA_MOLS_EN={"NaBr":{"n":"SODIUM BROMIDE","f":"NaBr","s":[["Na",0,0],["Br",1,0]],"w":"CRYSTAL!","fx":"crys","c":["#e9eef4","#a13b1c"],"fa":"I am a crystalline salt used in chemical photography and medicine."},"LiBr":{"n":"LITHIUM BROMIDE","f":"LiBr","s":[["Li",0,0],["Br",1,0]],"w":"DRY!","fx":"crys","c":["#d17f9e","#a13b1c"],"fa":"I absorb moisture strongly and help industrial cooling systems."},"LiI":{"n":"LITHIUM IODIDE","f":"LiI","s":[["Li",0,0],["I",1,0]],"w":"GLOW!","fx":"crys","c":["#d17f9e","#5e2a8c"],"fa":"My crystals are used in radiation detectors."},"MgO":{"n":"MAGNESIUM OXIDE","f":"MgO","s":[["Mg",0,0],["O",1,0]],"w":"HEAT!","fx":"spark","c":["#6bc98a","#ff5257"],"fa":"I withstand very high temperatures and line industrial furnaces."},"CaO":{"n":"CALCIUM OXIDE","f":"CaO","s":[["Ca",0,0],["O",1,0]],"w":"HOT!","fx":"spark","c":["#7fae7f","#ff5257"],"fa":"I am quicklime, made by heating limestone."},"LiH":{"n":"LITHIUM HYDRIDE","f":"LiH","s":[["Li",0,0],["H",1,0]],"w":"HISS!","fx":"spark","c":["#d17f9e","#4fa8ff"],"fa":"I am a light solid that stores hydrogen densely."},"NaH":{"n":"SODIUM HYDRIDE","f":"NaH","s":[["Na",0,0],["H",1,0]],"w":"HISS!","fx":"spark","c":["#e9eef4","#4fa8ff"],"fa":"Chemists use me as a strong base in synthesis."},"KH":{"n":"POTASSIUM HYDRIDE","f":"KH","s":[["K",0,0],["H",1,0]],"w":"ZAP!","fx":"spark","c":["#8f5fd1","#4fa8ff"],"fa":"I am a highly reactive metal hydride used in chemistry."},"SiO":{"n":"SILICON MONOXIDE","f":"SiO","s":[["Si",0,0],["O",1,0]],"w":"VAPOR!","fx":"smoke","c":["#a8b5c2","#ff5257"],"fa":"I can form protective optical coatings in a vacuum."},"SO":{"n":"SULFUR MONOXIDE","f":"SO","s":[["S",0,0],["O",1,0]],"w":"FLASH!","fx":"spark","c":["#ffd23f","#ff5257"],"fa":"I am a short-lived molecule found in hot gases and space."},"ICl":{"n":"IODINE MONOCHLORIDE","f":"ICl","s":[["I",0,0],["Cl",1,0]],"w":"GLOW!","fx":"crys","c":["#5e2a8c","#3ecf6e"],"fa":"I am an interhalogen compound used in chemical analysis."},"IBr":{"n":"IODINE MONOBROMIDE","f":"IBr","s":[["I",0,0],["Br",1,0]],"w":"GLOW!","fx":"crys","c":["#5e2a8c","#a13b1c"],"fa":"I am a dark interhalogen solid made from iodine and bromine."},"BrCl":{"n":"BROMINE MONOCHLORIDE","f":"BrCl","s":[["Br",0,0],["Cl",1,0]],"w":"FIZZ!","fx":"spark","c":["#a13b1c","#3ecf6e"],"fa":"I am a reactive interhalogen molecule."},"HOCl":{"n":"HYPOCHLOROUS ACID","f":"HOCl","s":[["H",0,0],["O",1,0],["Cl",1,1]],"w":"CLEAN!","fx":"bub","c":["#4fa8ff","#ff5257","#3ecf6e"],"fa":"Your immune system can make me to help destroy microbes."},"HOBr":{"n":"HYPOBROMOUS ACID","f":"HOBr","s":[["H",0,0],["O",1,0],["Br",1,1]],"w":"CLEAN!","fx":"bub","c":["#4fa8ff","#ff5257","#a13b1c"],"fa":"I am a weak acid with strong disinfecting chemistry."},"HOF":{"n":"HYPOFLUOROUS ACID","f":"HOF","s":[["H",0,0],["O",1,0],["F",1,1]],"w":"ZAP!","fx":"spark","c":["#4fa8ff","#ff5257","#c6e84a"],"fa":"I am a rare and extremely reactive oxygen-fluorine compound."},"NOCl":{"n":"NITROSYL CHLORIDE","f":"NOCl","s":[["O",0,0],["N",1,0],["Cl",1,1]],"w":"MIST!","fx":"smoke","c":["#ff5257","#8b5cf6","#3ecf6e"],"fa":"I am a red-yellow gas used as a reagent in chemistry."},"NOBr":{"n":"NITROSYL BROMIDE","f":"NOBr","s":[["O",0,0],["N",1,0],["Br",1,1]],"w":"MIST!","fx":"smoke","c":["#ff5257","#8b5cf6","#a13b1c"],"fa":"I am a reactive nitrosyl halide studied in laboratories."},"COS":{"n":"CARBONYL SULFIDE","f":"COS","s":[["O",0,0],["C",1,0],["S",2,0]],"w":"PUFF!","fx":"smoke","c":["#ff5257","#303c48","#ffd23f"],"fa":"I am a naturally occurring sulfur gas found in the atmosphere."},"NF3":{"n":"NITROGEN TRIFLUORIDE","f":"NF₃","s":[["N",1,1],["F",1,0],["F",0,1],["F",2,1]],"w":"ZAP!","fx":"spark","c":["#8b5cf6","#c6e84a"],"fa":"The electronics industry uses me during chip manufacturing."},"NCl3":{"n":"NITROGEN TRICHLORIDE","f":"NCl₃","s":[["N",1,1],["Cl",1,0],["Cl",0,1],["Cl",2,1]],"w":"POP!","fx":"spark","c":["#8b5cf6","#3ecf6e"],"fa":"I am a sensitive yellow compound with a sharp smell."},"ClF3":{"n":"CHLORINE TRIFLUORIDE","f":"ClF₃","s":[["Cl",1,1],["F",1,0],["F",0,1],["F",2,1]],"w":"FIRE!","fx":"flame","c":["#3ecf6e","#c6e84a"],"fa":"I am an exceptionally reactive interhalogen compound."},"BrF3":{"n":"BROMINE TRIFLUORIDE","f":"BrF₃","s":[["Br",1,1],["F",1,0],["F",0,1],["F",2,1]],"w":"ZAP!","fx":"spark","c":["#a13b1c","#c6e84a"],"fa":"I am a strong fluorinating liquid with a T-shaped molecule."},"IF3":{"n":"IODINE TRIFLUORIDE","f":"IF₃","s":[["I",1,1],["F",1,0],["F",0,1],["F",2,1]],"w":"GLOW!","fx":"crys","c":["#5e2a8c","#c6e84a"],"fa":"I am a reactive iodine-fluorine compound."},"COF2":{"n":"CARBONYL FLUORIDE","f":"COF₂","s":[["C",1,1],["O",1,0],["F",0,1],["F",2,1]],"w":"HISS!","fx":"smoke","c":["#303c48","#ff5257","#c6e84a"],"fa":"I am a carbonyl compound used in specialized chemical processes."},"COCl2":{"n":"CARBONYL CHLORIDE","f":"COCl₂","s":[["C",1,1],["O",1,0],["Cl",0,1],["Cl",2,1]],"w":"MIST!","fx":"smoke","c":["#303c48","#ff5257","#3ecf6e"],"fa":"I am also known as phosgene and must be handled with extreme care."},"SOF2":{"n":"THIONYL FLUORIDE","f":"SOF₂","s":[["S",1,1],["O",1,0],["F",0,1],["F",2,1]],"w":"HISS!","fx":"smoke","c":["#ffd23f","#ff5257","#c6e84a"],"fa":"I contain sulfur, oxygen, and fluorine in one compact molecule."},"SOCl2":{"n":"THIONYL CHLORIDE","f":"SOCl₂","s":[["S",1,1],["O",1,0],["Cl",0,1],["Cl",2,1]],"w":"MIST!","fx":"smoke","c":["#ffd23f","#ff5257","#3ecf6e"],"fa":"Chemists use me to convert carboxylic acids into acid chlorides."},"XeO3":{"n":"XENON TRIOXIDE","f":"XeO₃","s":[["Xe",1,1],["O",1,0],["O",0,1],["O",2,1]],"w":"NOBLE!","fx":"spark","c":["#3ecfc4","#ff5257"],"fa":"I prove that even a noble gas can form oxygen compounds."},"N2H2":{"n":"DIAZENE","f":"N₂H₂","s":[["H",0,0],["N",1,0],["N",1,1],["H",2,1]],"w":"SWITCH!","fx":"glit","c":["#4fa8ff","#8b5cf6"],"fa":"I can exist in two geometric forms called cis and trans."},"H2S2":{"n":"DISULFANE","f":"H₂S₂","s":[["H",0,0],["S",1,0],["S",1,1],["H",2,1]],"w":"STINK!","fx":"squig","c":["#4fa8ff","#ffd23f"],"fa":"I am the sulfur analogue of hydrogen peroxide."},"S2F2":{"n":"DISULFUR DIFLUORIDE","f":"S₂F₂","s":[["F",0,0],["S",1,0],["S",1,1],["F",2,1]],"w":"ZAP!","fx":"spark","c":["#c6e84a","#ffd23f"],"fa":"I connect two sulfur atoms between two fluorine atoms."},"S2Br2":{"n":"DISULFUR DIBROMIDE","f":"S₂Br₂","s":[["Br",0,0],["S",1,0],["S",1,1],["Br",2,1]],"w":"MIST!","fx":"smoke","c":["#a13b1c","#ffd23f"],"fa":"I am a bromine-rich relative of disulfur dichloride."},"SiBr4":{"n":"SILICON TETRABROMIDE","f":"SiBr₄","s":[["Si",1,1],["Br",1,0],["Br",0,1],["Br",2,1],["Br",1,2]],"w":"MIST!","fx":"smoke","c":["#a8b5c2","#a13b1c"],"fa":"I am a silicon halide used in chemical research."},"GeBr4":{"n":"GERMANIUM TETRABROMIDE","f":"GeBr₄","s":[["Ge",1,1],["Br",1,0],["Br",0,1],["Br",2,1],["Br",1,2]],"w":"CRYSTAL!","fx":"crys","c":["#7a8fa6","#a13b1c"],"fa":"I form crystalline compounds used in germanium chemistry."},"SnF4":{"n":"TIN TETRAFLUORIDE","f":"SnF₄","s":[["Sn",1,1],["F",1,0],["F",0,1],["F",2,1],["F",1,2]],"w":"CRYSTAL!","fx":"crys","c":["#9db3bd","#c6e84a"],"fa":"I am a colorless tin fluoride solid."},"SnI4":{"n":"TIN TETRAIODIDE","f":"SnI₄","s":[["Sn",1,1],["I",1,0],["I",0,1],["I",2,1],["I",1,2]],"w":"GLOW!","fx":"crys","c":["#9db3bd","#5e2a8c"],"fa":"I form colorful crystals in tin and iodine chemistry."},"XeO4":{"n":"XENON TETROXIDE","f":"XeO₄","s":[["Xe",1,1],["O",1,0],["O",0,1],["O",2,1],["O",1,2]],"w":"NOBLE!","fx":"spark","c":["#3ecfc4","#ff5257"],"fa":"I am a rare molecule containing xenon and four oxygen atoms."},"Si2H4":{"n":"DISILENE","f":"Si₂H₄","s":[["H",0,0],["H",1,0],["Si",0,1],["Si",1,1],["H",0,2],["H",1,2]],"w":"SHINE!","fx":"glit","c":["#a8b5c2","#4fa8ff"],"fa":"I contain a silicon-silicon double bond."},"P2H4":{"n":"DIPHOSPHINE","f":"P₂H₄","s":[["H",0,0],["H",1,0],["P",0,1],["P",1,1],["H",0,2],["H",1,2]],"w":"GLOW!","fx":"glit","c":["#f0c05a","#4fa8ff"],"fa":"I link two phosphorus atoms with four hydrogens."},"C2F4":{"n":"TETRAFLUOROETHYLENE","f":"C₂F₄","s":[["F",0,0],["F",1,0],["C",0,1],["C",1,1],["F",0,2],["F",1,2]],"w":"SLIDE!","fx":"glit","c":["#303c48","#c6e84a"],"fa":"I am the building block used to make PTFE."},"C2Cl4":{"n":"TETRACHLOROETHYLENE","f":"C₂Cl₄","s":[["Cl",0,0],["Cl",1,0],["C",0,1],["C",1,1],["Cl",0,2],["Cl",1,2]],"w":"MIST!","fx":"smoke","c":["#303c48","#3ecf6e"],"fa":"I am a solvent also known as perchloroethylene."},"N2F4":{"n":"TETRAFLUOROHYDRAZINE","f":"N₂F₄","s":[["F",0,0],["F",1,0],["N",0,1],["N",1,1],["F",0,2],["F",1,2]],"w":"ZAP!","fx":"spark","c":["#8b5cf6","#c6e84a"],"fa":"I join two nitrogen atoms surrounded by four fluorines."},"CH3SH":{"n":"METHANETHIOL","f":"CH₃SH","s":[["C",1,1],["H",1,0],["H",0,1],["H",1,2],["S",2,1],["H",3,1]],"w":"STINK!","fx":"squig","c":["#303c48","#4fa8ff","#ffd23f"],"fa":"I am famous for an extremely strong cabbage-like smell."},"Se8":{"n":"SELENIUM RING","f":"Se₈","s":[["Se",0,0],["Se",1,0],["Se",2,0],["Se",2,1],["Se",2,2],["Se",1,2],["Se",0,2],["Se",0,1]],"w":"GLOW!","fx":"crys","c":["#e67e22","#ffd4a8"],"fa":"I am a ring-shaped form of elemental selenium."},"As4":{"n":"YELLOW ARSENIC","f":"As₄","s":[["As",0,0],["As",1,0],["As",1,1],["As",0,1]],"w":"GLOW!","fx":"crys","c":["#c07ec9","#f0c8f5"],"fa":"I am a rare molecular form of elemental arsenic."},"Se4":{"n":"TETRASELENIUM","f":"Se₄","s":[["Se",0,0],["Se",1,0],["Se",1,1],["Se",0,1]],"w":"GLOW!","fx":"crys","c":["#e67e22","#ffd4a8"],"fa":"I am a small selenium cluster found in hot selenium vapor."},"H2CS":{"n":"THIOFORMALDEHYDE","f":"CH₂S","s":[["H",0,0],["C",0,1],["H",0,2],["S",1,1]],"w":"STINK!","fx":"squig","c":["#4fa8ff","#303c48","#ffd23f"],"fa":"I am the sulfur cousin of formaldehyde."},"H2CSe":{"n":"SELENOFORMALDEHYDE","f":"CH₂Se","s":[["H",0,0],["C",0,1],["H",0,2],["Se",1,1]],"w":"GLOW!","fx":"glit","c":["#4fa8ff","#303c48","#e67e22"],"fa":"I am a selenium analogue of formaldehyde studied in spectroscopy."}};
Object.assign(MOLS_EN,EXTRA_MOLS_EN);

const MOLS_TR_TXT={
  H2:{n:'HİDROJEN',w:'POP!',fa:'Evrendeki en hafif, en bol elementim!'},
F2:{n:'FLOR GAZI',w:'ÇAK!',fa:'Bilinen en reaktif gazım — camla bile tepkimeye girerim!'},
NaF:{n:'SODYUM FLORÜR',w:'PARILTI!',fa:'Her gün beni dişlerinizi fırçalarken kullanırsınız — çürükle savaşırım!'},
CS2:{n:'KARBON DİSÜLFÜR',w:'ÇAKIM!',fa:'O kadar yanıcıyım ki sıcak bir yüzeyden bile alev alabilirim!'},
BCl3:{n:'BOR TRİKLORÜR',w:'PUSLU!',fa:'Nemli havada tütüp hayaletimsi beyaz bir bulut oluştururum!'},
PH3:{n:'FOSFİN',w:'PARILTI!',fa:'Havada kendiliğinden tutuşabilirim — bataklık ateşi diye anılırım!'},
Cl2:{n:'KLOR GAZI',w:'POP!',fa:'Birinci Dünya Savaşı\'nın en korkulan silahıydım — ama havuzları da temiz tutarım!'},
N2:{n:'AZOT GAZI',w:'POP!',fa:'Şu an beni soluyorsun — havanın %78\'ini ben oluştururum!'},
HCl:{n:'HİDROJEN KLORÜR',w:'FISS!',fa:'Suda çözününce mide asidi olurum — yemek sindirmene yardım ederim!'},
ClF:{n:'KLOR MONOFLORÜR',w:'ÇAK!',fa:'Roket yakıtı araştırmalarında kullanılan güçlü bir florlama ajanıyım!'},
XeF2:{n:'KSENON DİFLORÜR',w:'PARILTI!',fa:'Soy gazların pek de asil olmadığını kanıtladım — gerçekten tepkimeye girerim!'},
PF3:{n:'FOSFOR TRİFLORÜR',w:'ZAPP!',fa:'Kanla, karbon monoksit gibi bağlanırım — oldukça zehirliyimdir!'},
PCl3:{n:'FOSFOR TRİKLORÜR',w:'POOF!',fa:'Pestisit ve alev geciktirici üretiminde temel bir malzemeyim!'},
SiH4:{n:'SİLAN',w:'ALEV!',fa:'Havayla temas eder etmez tutuşurum — kıvılcıma bile gerek yok!'},
SiF4:{n:'SİLİKON TETRAFLORÜR',w:'KARARLI!',fa:'Hidroflorik asit camı aşındırırken açığa çıkarım!'},
SiCl4:{n:'SİLİKON TETRAKLORÜR',w:'PUSLU!',fa:'Bilgisayar çiplerindeki silikonun üretimine giden yoldaki kilit bir basamağım!'},
ClO2:{n:'KLOR DİOKSİT',w:'ZAPP!',fa:'İçme suyunu arıtmak ve kağıdı ağartmak için kullanılırım!'},
Br2:{n:'BROM',w:'POP!',fa:'Oda sıcaklığında sıvı halde bulunan nadir elementlerden biriyim!'},
HBr:{n:'HİDROJEN BROMÜR',w:'FISS!',fa:'Suda çözününce kimya üretiminde kullanılan güçlü bir asit olurum!'},
SBr2:{n:'KÜKÜRT DİBROMÜR',w:'KOKU!',fa:'Kükürt diklorürün kararsız, kötü kokulu bir kuzeniyim!'},
CBr4:{n:'KARBON TETRABROMÜR',w:'PUSLU!',fa:'Laboratuvarlarda ağır sıvı yerine kullanılan yoğun bir katıyım!'},
PBr3:{n:'FOSFOR TRİBROMÜR',w:'ZAPP!',fa:'Alkolleri kullanışlı alkil bromürlere dönüştürmek için kullanılırım!'},
BBr3:{n:'BOR TRİBROMÜR',w:'PUSLU!',fa:'Nemli havada, klor kuzenim gibi şiddetle tütarım!'},
HI:{n:'HİDROJEN İYODÜR',w:'FISS!',fa:'Suda çözününce bilinen en güçlü asitlerden biri olurum!'},
I2:{n:'İYOT',w:'POP!',fa:'Isıtılıp gaz haline gelince güzel bir mor renge dönerim!'},
NaI:{n:'SODYUM İYODÜR',w:'PARILTI!',fa:'İyot eksikliğini önlemek için dünya çapında sofra tuzuna eklenirim!'},
KCl:{n:'POTASYUM KLORÜR',w:'PARILTI!',fa:'Sodyumuna dikkat edenler için tuz yerine kullanılırım!'},
KF:{n:'POTASYUM FLORÜR',w:'PARILTI!',fa:'Bazı diş macunlarında iz miktarda kullanılırım!'},
KBr:{n:'POTASYUM BROMÜR',w:'PARILTI!',fa:'Bir asırdan fazla önce yaygın bir sakinleştirici olarak kullanılırdım!'},
KI:{n:'POTASYUM İYODÜR',w:'PARILTI!',fa:'Acil durumlarda tiroidi korumak için nükleer santraller yakınında dağıtılırım!'},
LiCl:{n:'LİTYUM KLORÜR',w:'PARILTI!',fa:'Nemi o kadar iyi emerim ki endüstriyel nem alıcılarda kullanılırım!'},
LiF:{n:'LİTYUM FLORÜR',w:'PARILTI!',fa:'Kristallerim mor ötesi teleskoplar için mercek yapımında kullanılır!'},
CaCl2:{n:'KALSİYUM KLORÜR',w:'KOKU!',fa:'Kışın buzlu yollara serpilip buzu eritmek için kullanılırım!'},
CaF2:{n:'KALSİYUM FLORÜR',w:'KOKU!',fa:'Kristal koleksiyoncularının değer verdiği florit mineralini oluştururum!'},
CaBr2:{n:'KALSİYUM BROMÜR',w:'KOKU!',fa:'Petrol ve gaz kuyularında sondaj sıvılarında kullanılırım!'},
AlCl3:{n:'ALÜMİNYUM KLORÜR',w:'ZAPP!',fa:'Günlük plastik ve boyaların üretiminde kilit bir katalizörüm!'},
AlF3:{n:'ALÜMİNYUM FLORÜR',w:'ZAPP!',fa:'Alüminyum metalini eritirken erime noktasını düşürmeye yardım ederim!'},
AlBr3:{n:'ALÜMİNYUM BROMÜR',w:'ZAPP!',fa:'Organik kimya laboratuvarlarında kullanılan güçlü bir katalizörüm!'},
MgCl2:{n:'MAGNEZYUM KLORÜR',w:'KOKU!',fa:'Deniz suyundan çıkarılıp kış yollarının buzunu çözmek için kullanılırım!'},
MgF2:{n:'MAGNEZYUM FLORÜR',w:'KOKU!',fa:'Kristallerim UV ışığına şeffaftır, kamera merceklerinde kullanılır!'},
MgBr2:{n:'MAGNEZYUM BROMÜR',w:'KOKU!',fa:'Bazı alev geciktirici malzemelerde kullanılırım!'},
GeH4:{n:'GERMAN',w:'ALEV!',fa:'Elektronik için ultra saf germanyum kristalleri büyütmede kullanılırım!'},
GeF4:{n:'GERMANYUM TETRAFLORÜR',w:'KARARLI!',fa:'Fiber optik için germanyumu arıtmada bir basamağım!'},
GeCl4:{n:'GERMANYUM TETRAKLORÜR',w:'PUSLU!',fa:'Fiber optik kabloların üretiminde kilit bir malzemeyim!'},
GaCl3:{n:'GALYUM KLORÜR',w:'ZAPP!',fa:'Özel organik reaksiyonlarda katalizör olarak kullanılırım!'},
GaF3:{n:'GALYUM FLORÜR',w:'ZAPP!',fa:'Çok yüksek sıcaklıklarda bile kararlı kalırım!'},
GaBr3:{n:'GALYUM BROMÜR',w:'ZAPP!',fa:'Yarı iletken kristal büyütme araştırmalarında kullanılırım!'},
SnCl4:{n:'KALAY TETRAKLORÜR',w:'PUSLU!',fa:'Tarihte cam şişeleri güçlendirmek için kaplamada kullanıldım!'},
SnBr4:{n:'KALAY TETRABROMÜR',w:'PUSLU!',fa:'Oda sıcaklığında soluk sarı kristaller oluştururum!'},
S8:{n:'KÜKÜRT HALKASI',w:'PARILTI!',fa:'Bu taç şeklindeki halka, kükürtün en yaygın doğal halidir!'},
AsH3:{n:'ARSİN',w:'POOF!',fa:'Renksiz ve tehlikeliyimdir, ama yarı iletken çip yapımı için gerekliyim!'},
  O2:{n:'OKSİJEN',w:'FIZZZ!',fa:'Şu an beni soluyorsun. Bir şey değil! 😌'},
  CO:{n:'KARBON MONOKSİT',w:'DUMAN!',fa:'Sinsi ve tehlikeliyim — bir dedektör edin! ⚠️'},
  NaCl:{n:'TUZ',w:'TUZ!',fa:'Patates kızartmasının can yoldaşıyım. 🍟'},
  H2O:{n:'SU',w:'ŞAP!',fa:'Vücudunun %60\'ıyım! 💧'},
  CO2:{n:'KARBONDİOKSİT',w:'PUF!',fa:'Gazoz baloncukları? Benim eserim. 🥤'},
  NO2:{n:'AZOT DİOKSİT',w:'NOX!',fa:'Şehir sisine turuncu tonunu ben veririm.'},
  H2S:{n:'HİDROJEN SÜLFÜR',w:'İĞRENÇ! 🤢',fa:'Çürük yumurta kokusu mu? Suçlu benim. 🥚'},
  O3:{n:'OZON',w:'OZON!',fa:'Zararlı güneş ışınlarına karşı kalkanınım! 🛡️'},
  SO2:{n:'KÜKÜRT DİOKSİT',w:'HIŞŞ!',fa:'Volkanlar patladığında sahneye ben çıkarım! 🌋'},
  OF2:{n:'OKSİJEN DİFLORÜR',w:'ZAP!',fa:'Oksijenin patron olmadığı nadir bileşiğim! ⚡'},
  SCl2:{n:'KÜKÜRT DİKLORÜR',w:'KOKU!',fa:'Lastiklerini vulkanize etmeye yardım eden kiraz kırmızısı bir sıvıyım! 🚗'},
  NH3:{n:'AMONYAK',w:'PUF!',fa:'Temizlik ürünlerinin keskin kokulu yıldızıyım.'},
  H2O2:{n:'HİDROJEN PEROKSİT',w:'KABARCIK!',fa:'Diz sıyrığındaki köpüren kahramanım! 🩹'},
  S2Cl2:{n:'DİSÜLFÜR DİKLORÜR',w:'ESNE!',fa:'Lastiğe o esnek zıplamayı ben veririm! 🎈'},
  CH2O:{n:'FORMALDEHİT',w:'PARILTI!',fa:'Biyoloji laboratuvarlarının koruyucusuyum.'},
  BF3:{n:'BOR TRİFLORÜR',w:'ZAP!',fa:'Elektrona o kadar açım ki herkesten çalarım! 🤤'},
  XeF4:{n:'KSENON TETRAFLORÜR',w:'SOYLU!',fa:'Ksenon\'a "bağ kurmaya tembel" dediler — onları yanılttım! 😤'},
  CH4:{n:'METAN',w:'ALEV!',fa:'İneklerin küçük utancıyım... 🐄💨'},
CCl4:{n:'KARBON TETRAKLORÜR',w:'TEMİZ!',fa:'Eski yangın söndürücülerde bendim — artık yasağım, ozon tabakasına zararlıyım! ☁️'},
CF4:{n:'KARBON TETRAFLORÜR',w:'KARARLI!',fa:'O kadar kararlıyım ki bilgisayar çipi fabrikaları beni güvenle kullanır! 💻'},
S4:{n:'TETRASÜLFÜR',w:'HALKA!',fa:'Ben ürkek bir halkayım — çoğu molekülden daha çabuk dağılırım! 💛'},
P4:{n:'BEYAZ FOSFOR',w:'PARILTI!',fa:'Karanlıkta hafifçe parlarım — eski kibritler benden yapılırdı! ✨'},
  HF:{n:'HİDROJEN FLORÜR',w:'BZZT!',fa:'Camı aşındırabilirim — benimle uğraşma! 😤'},
  NO:{n:'AZOT MONOKSİT',w:'SİNYAL!',fa:'Damarlarını genişleten gizli sinyalim! 🫀'},
  HCN:{n:'HİDROJEN SİYANÜR',w:'TEHLİKE!',fa:'Acı badem kokarım... uzak dur! ☠️'},
  N2O:{n:'GÜLME GAZI',w:'HIHI!',fa:'Dişçinin gizli silahıyım — seni kıkırdatırım! 😆'},
  SO3:{n:'KÜKÜRT TRİOKSİT',w:'SSS!',fa:'Bulutlara sızarsam asit yağmuru olurum! 🌧️'},
  C2H4:{n:'ETİLEN',w:'MEYVE!',fa:'Muzları olgunlaştıran benim! 🍌'},
  N2H4:{n:'HİDRAZİN',w:'ROKET!',fa:'Roket yakıtıyım — seni uzaya götürürüm! 🚀'},
  CH3OH:{n:'METANOL',w:'YAKIT!',fa:'Yarış arabalarını ben çalıştırırım. Beni asla içme! 🏎️'},
  C4RING:{n:'SİKLOBÜTAN',w:'HALKA!',fa:'Halkam o kadar gergin ki açılmak istiyor! 🌀'},
  C8RING:{n:"DR. E'NİN HALKASI",w:'DEHA!',fa:'Kişisel bulmacam — bu döngüyü sadece gerçek bir deha kapatabilir! 🧠✨'}
};
// precompute win-keys + bond signatures on the EN base FIRST, so the TR merge inherits them too
for(const id in MOLS_EN){
  const m=MOLS_EN[id];
  const mx=Math.min(...m.s.map(a=>a[1])),my=Math.min(...m.s.map(a=>a[2]));
  m.key=m.s.map(a=>a[0]+','+(a[1]-mx)+','+(a[2]-my)).sort().join('|');
  m.bs=new Set();
  for(let i=0;i<m.s.length;i++)for(let j=i+1;j<m.s.length;j++){
    const dx=m.s[j][1]-m.s[i][1],dy=m.s[j][2]-m.s[i][2];
    if(Math.abs(dx)+Math.abs(dy)===1){
      if(m.s[i][0]==='H'&&m.s[j][0]==='H')continue;
      m.bs.add(m.s[i][0]+','+m.s[j][0]+','+dx+','+dy);
      m.bs.add(m.s[j][0]+','+m.s[i][0]+','+(-dx)+','+(-dy));
    }
  }
}
const EXTRA_MOLS_TR={"NaBr":{"n":"SODYUM BROMÜR","w":"CRYSTAL!","fa":"Kristal bir tuzum; kimya ve bazı tıbbi uygulamalarda kullanılırım."},"LiBr":{"n":"LİTYUM BROMÜR","w":"DRY!","fa":"Nemi güçlü biçimde çeker ve endüstriyel soğutma sistemlerinde çalışırım."},"LiI":{"n":"LİTYUM İYODÜR","w":"GLOW!","fa":"Kristallerim radyasyon algılayıcılarında kullanılabilir."},"MgO":{"n":"MAGNEZYUM OKSİT","w":"HEAT!","fa":"Çok yüksek sıcaklıklara dayanır, endüstriyel fırınlarda görev yaparım."},"CaO":{"n":"KALSİYUM OKSİT","w":"HOT!","fa":"Kireç taşının ısıtılmasıyla oluşan sönmemiş kirecim."},"LiH":{"n":"LİTYUM HİDRÜR","w":"HISS!","fa":"Hidrojeni yoğun biçimde depolayan hafif bir katıyım."},"NaH":{"n":"SODYUM HİDRÜR","w":"HISS!","fa":"Organik sentezlerde güçlü bir baz olarak kullanılırım."},"KH":{"n":"POTASYUM HİDRÜR","w":"ZAP!","fa":"Kimyada kullanılan oldukça tepkili bir metal hidrürüm."},"SiO":{"n":"SİLİSYUM MONOKSİT","w":"VAPOR!","fa":"Vakum altında koruyucu optik kaplamalar oluşturabilirim."},"SO":{"n":"KÜKÜRT MONOKSİT","w":"FLASH!","fa":"Sıcak gazlarda ve uzayda görülebilen kısa ömürlü bir molekülüm."},"ICl":{"n":"İYOT MONOKLORÜR","w":"GLOW!","fa":"Kimyasal analizde kullanılan bir interhalojen bileşiğim."},"IBr":{"n":"İYOT MONOBROMÜR","w":"GLOW!","fa":"İyot ve bromdan oluşan koyu renkli bir interhalojen katıyım."},"BrCl":{"n":"BROM MONOKLORÜR","w":"FIZZ!","fa":"Brom ve kloru bir araya getiren tepkili bir molekülüm."},"HOCl":{"n":"HİPOKLORÖZ ASİT","w":"CLEAN!","fa":"Bağışıklık sistemin mikroplarla savaşmak için beni üretebilir."},"HOBr":{"n":"HİPOBROMÖZ ASİT","w":"CLEAN!","fa":"Dezenfeksiyon kimyasında etkili zayıf bir asidim."},"HOF":{"n":"HİPOFLORÖZ ASİT","w":"ZAP!","fa":"Çok nadir ve son derece tepkili bir oksijen-flor bileşiğim."},"NOCl":{"n":"NİTROZİL KLORÜR","w":"MIST!","fa":"Kimyada reaktif olarak kullanılan kırmızı-sarı bir gazım."},"NOBr":{"n":"NİTROZİL BROMÜR","w":"MIST!","fa":"Laboratuvarlarda incelenen tepkili bir nitrozil halojenürüm."},"COS":{"n":"KARBONİL SÜLFÜR","w":"PUFF!","fa":"Atmosferde doğal olarak bulunan kükürtlü bir gazım."},"NF3":{"n":"AZOT TRİFLORÜR","w":"ZAP!","fa":"Elektronik endüstrisinde çip üretim süreçlerinde kullanılırım."},"NCl3":{"n":"AZOT TRİKLORÜR","w":"POP!","fa":"Keskin kokulu ve hassas sarı bir bileşiğim."},"ClF3":{"n":"KLOR TRİFLORÜR","w":"FIRE!","fa":"Olağanüstü derecede tepkili bir interhalojen bileşiğim."},"BrF3":{"n":"BROM TRİFLORÜR","w":"ZAP!","fa":"T biçimli yapıya sahip güçlü bir florlama sıvısıyım."},"IF3":{"n":"İYOT TRİFLORÜR","w":"GLOW!","fa":"İyot ve florun tepkili bir bileşiğim."},"COF2":{"n":"KARBONİL FLORÜR","w":"HISS!","fa":"Özel kimyasal işlemlerde kullanılan bir karbonil bileşiğim."},"COCl2":{"n":"KARBONİL KLORÜR","w":"MIST!","fa":"Fosgen olarak da bilinirim ve son derece dikkatli kullanılmam gerekir."},"SOF2":{"n":"TİYONİL FLORÜR","w":"HISS!","fa":"Kükürt, oksijen ve floru tek yapıda birleştiririm."},"SOCl2":{"n":"TİYONİL KLORÜR","w":"MIST!","fa":"Kimyagerler beni bazı organik dönüşümlerde kullanır."},"XeO3":{"n":"KSENON TRİOKSİT","w":"NOBLE!","fa":"Soy gazların bile oksijenle bileşik oluşturabildiğini gösteririm."},"N2H2":{"n":"DİAZEN","w":"SWITCH!","fa":"Cis ve trans denilen iki geometrik biçimde bulunabilirim."},"H2S2":{"n":"DİSÜLFAN","w":"STINK!","fa":"Hidrojen peroksidin kükürtlü akrabasıyım."},"S2F2":{"n":"DİKÜKÜRT DİFLORÜR","w":"ZAP!","fa":"İki kükürt atomunu iki flor arasında birleştiririm."},"S2Br2":{"n":"DİKÜKÜRT DİBROMÜR","w":"MIST!","fa":"Dikükürt diklorürün bromlu akrabasıyım."},"SiBr4":{"n":"SİLİSYUM TETRABROMÜR","w":"MIST!","fa":"Silisyum ve brom kimyasında kullanılan bir halojenürüm."},"GeBr4":{"n":"GERMANYUM TETRABROMÜR","w":"CRYSTAL!","fa":"Germanyum kimyasında kristal bileşikler oluştururum."},"SnF4":{"n":"KALAY TETRAFLORÜR","w":"CRYSTAL!","fa":"Renksiz bir kalay florür katısıyım."},"SnI4":{"n":"KALAY TETRAİYODÜR","w":"GLOW!","fa":"Kalay ve iyot kimyasında renkli kristaller oluştururum."},"XeO4":{"n":"KSENON TETROKSİT","w":"NOBLE!","fa":"Ksenon ve dört oksijen içeren nadir bir molekülüm."},"Si2H4":{"n":"DİSİLEN","w":"SHINE!","fa":"Silisyum-silisyum çift bağı içeren bir molekülüm."},"P2H4":{"n":"DİFOSFİN","w":"GLOW!","fa":"İki fosfor atomunu dört hidrojenle birleştiririm."},"C2F4":{"n":"TETRAFLOROETİLEN","w":"SLIDE!","fa":"PTFE üretiminde kullanılan temel yapı taşlarından biriyim."},"C2Cl4":{"n":"TETRAKLOROETİLEN","w":"MIST!","fa":"Perkloroetilen adıyla da bilinen bir çözücüyüm."},"N2F4":{"n":"TETRAFLOROHİDRAZİN","w":"ZAP!","fa":"İki azot atomunu dört florla çevrelerim."},"CH3SH":{"n":"METANTİYOL","w":"STINK!","fa":"Çok güçlü, lahanayı andıran kokumla tanınırım."},"Se8":{"n":"SELENYUM HALKASI","w":"GLOW!","fa":"Elementel selenyumun halka biçimli bir yapısıyım."},"As4":{"n":"SARI ARSENİK","w":"GLOW!","fa":"Elementel arseniğin nadir moleküler biçimlerinden biriyim."},"Se4":{"n":"TETRASELENYUM","w":"GLOW!","fa":"Sıcak selenyum buharında görülebilen küçük bir kümeyim."},"H2CS":{"n":"TİYOFORMALDEHİT","w":"STINK!","fa":"Formaldehidin kükürtlü kuzeniyim."},"H2CSe":{"n":"SELENOFORMALDEHİT","w":"GLOW!","fa":"Spektroskopide incelenen formaldehidin selenyumlu akrabasıyım."}};
Object.assign(MOLS_TR_TXT,EXTRA_MOLS_TR);

const MOLS_TR=mergeTxt(MOLS_EN,MOLS_TR_TXT);
let LANG='en';
let MOLS=MOLS_EN, ELINFO=ELINFO_EN;
/*
 * Campaign laboratory progression:
 * 1–20 default lab, then a promotion and a visibly evolved lab every 20 levels.
 * Tiers 5–8 reuse the hand-painted lab art with controlled color/light overlays,
 * keeping the visual style consistent without adding heavy duplicate assets.
 */
const TIER_BG=[
  {uri:'assets/images/bg-default.webp',overlay:'',blend:'normal'},
  {uri:'assets/images/tier-bg-1.webp',overlay:'linear-gradient(rgba(70,125,225,.10),rgba(8,18,58,.16))',blend:'screen,normal'},
  {uri:'assets/images/tier-bg-2.webp',overlay:'linear-gradient(rgba(174,74,235,.10),rgba(28,8,58,.18))',blend:'screen,normal'},
  {uri:'assets/images/tier-bg-3.webp',overlay:'linear-gradient(rgba(55,205,220,.10),rgba(4,38,52,.18))',blend:'screen,normal'},
  {uri:'assets/images/tier-bg-4.webp',overlay:'linear-gradient(rgba(63,220,150,.17),rgba(6,48,38,.28))',blend:'screen,multiply'},
  {uri:'assets/images/tier-bg-1.webp',overlay:'radial-gradient(circle at 50% 24%,rgba(92,235,255,.24),rgba(19,38,108,.34))',blend:'screen,multiply'},
  {uri:'assets/images/tier-bg-2.webp',overlay:'radial-gradient(circle at 50% 25%,rgba(255,126,226,.24),rgba(52,10,82,.36))',blend:'screen,multiply'},
  {uri:'assets/images/tier-bg-3.webp',overlay:'radial-gradient(circle at 50% 23%,rgba(255,215,105,.24),rgba(10,43,82,.34))',blend:'screen,multiply'},
  {uri:'assets/images/tier-bg-4.webp',overlay:'radial-gradient(circle at 50% 25%,rgba(255,248,194,.32),rgba(91,48,0,.26))',blend:'screen,multiply'}
];
const TIER_ACCENT=['#8a94a0','#76a5ff','#c669ff','#56d6d8','#4ade9a','#56c8f2','#ef79dc','#ffc85a','#ffdf72'];
function mixHex(a,b,t){
  const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);
  const ar=(pa>>16)&255,ag=(pa>>8)&255,ab=pa&255;
  const br=(pb>>16)&255,bg=(pb>>8)&255,bb=pb&255;
  const r=Math.round(ar+(br-ar)*t),g=Math.round(ag+(bg-ag)*t),bl=Math.round(ab+(bb-ab)*t);
  return '#'+[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('');
}
const SPEEDRUN_LEVELS=[2,15,35,45,55,65];
const DIPLOMAS=[
  {icon:'🧪',c1:'#9aa5b1',c2:'#5c6570'},
  {icon:'🔬',c1:'#5ba3ec',c2:'#234f80'},
  {icon:'⚗️',c1:'#bd68ec',c2:'#5f2884'},
  {icon:'🥼',c1:'#45cbd0',c2:'#176b70'},
  {icon:'🎓',c1:'#4ade9a',c2:'#176a4a'},
  {icon:'📚',c1:'#56c8f2',c2:'#1d6381'},
  {icon:'🌟',c1:'#ef79dc',c2:'#7a2e70'},
  {icon:'🏅',c1:'#ffc85a',c2:'#966417'},
  {icon:'🏆',c1:'#ffdf72',c2:'#8a5c16'}
];
function trainingAchievementCount(s,prefix){
  const src=(s&&s.researchAchievements&&typeof s.researchAchievements==='object')?s.researchAchievements:{};
  return Object.keys(src).filter(k=>k.indexOf('__training_learned_'+prefix)===0&&src[k]).length;
}
function allTrainingAchievementsComplete(s){
  const src=(s&&s.researchAchievements&&typeof s.researchAchievements==='object')?s.researchAchievements:{};
  const has=(group,id)=>!!src['__training_learned_'+group+'_'+id];
  const supportIds=['hint','undo','restart','hammer','precision','lab'];
  const mechanicIds=['frozen','fire','lightning','sticky','zombie','oneWay','hammer','portal','movingWall','pressureDoor','fragile','linked','precision','classicCatalyst','classicChain','classicReactor'];
  const labIds=(typeof LAB_ITEMS!=='undefined'&&Array.isArray(LAB_ITEMS))?LAB_ITEMS.map(it=>it.id):[];
  return (has('basic','movement')||!!s.tutorialDone)&&supportIds.every(id=>has('support',id))&&mechanicIds.every(id=>has('mechanic',id))&&labIds.length>0&&labIds.every(id=>has('lab',id));
}
const ACHV=[
  {id:'a_stars10',icon:'🔬',name:'achvMicroName',desc:'achvMicroDesc',
    check:s=>Object.values(s.stars).filter(v=>v===3).length>=10},
  {id:'a_streak7',icon:'⚡',name:'achvTeslaName',desc:'achvTeslaDesc',
    check:s=>s.streak3>=7},
  {id:'a_disc15',icon:'💎',name:'achvCrystalName',desc:'achvCrystalDesc',
    check:s=>Object.keys(s.disc).length>=15},
  {id:'a_nobel',icon:'🧬',name:'achvDnaName',desc:'achvDnaDesc',
    check:s=>!!(s.stars&&Number(s.stars[NOBEL_LEVEL_INDEX])>0)},
  {id:'a_prof',icon:'🏅',name:'achvProfName',desc:'achvProfDesc',
    check:s=>tierOf(s.cur)>=5},
  {id:'a_daily',icon:'📅',name:'achvDailyName',desc:'achvDailyDesc',
    check:s=>!!s.dailyDate},
  {id:'a_hints20',icon:'🧭',name:'achvCompassName',desc:'achvCompassDesc',
    check:s=>s.totalHints>=20},
  {id:'a_allmol',icon:'🥽',name:'achvGogglesName',desc:'achvGogglesDesc',
    check:s=>Object.keys(s.disc).length>=Object.keys(MOLS_EN).length},
  {id:'a_stars25',icon:'⭐',name:'achvStarName',desc:'achvStarDesc',
    check:s=>Object.values(s.stars).filter(v=>v===3).length>=25},
  {id:'a_mechanics',icon:'🧊',name:'achvMechName',desc:'achvMechDesc',
    check:s=>[16,17,18,24,31,32,37,42,43,46,47,48,60,61].every(i=>s.stars[i]===3)},
  {id:'a_disc30',icon:'🧫',name:'achvPetriName',desc:'achvPetriDesc',
    check:s=>Object.keys(s.disc).length>=30},
  {id:'a_level50',icon:'🚀',name:'achvRocketName',desc:'achvRocketDesc',
    check:s=>s.cur>=49},
  {id:'a_firstlesson',icon:'🎓',name:'achvFirstLessonName',desc:'achvFirstLessonDesc',
    check:s=>!!s.tutorialDone||trainingAchievementCount(s,'basic_')>=1},
  {id:'a_toolstudent',icon:'🧰',name:'achvToolStudentName',desc:'achvToolStudentDesc',
    check:s=>trainingAchievementCount(s,'support_')>=3},
  {id:'a_mechexplorer',icon:'⚛️',name:'achvMechExplorerName',desc:'achvMechExplorerDesc',
    check:s=>trainingAchievementCount(s,'mechanic_')>=5},
  {id:'a_labstudent',icon:'🧪',name:'achvLabStudentName',desc:'achvLabStudentDesc',
    check:s=>trainingAchievementCount(s,'lab_')>=3},
  {id:'a_trainingmaster',icon:'📘',name:'achvTrainingMasterName',desc:'achvTrainingMasterDesc',
    check:s=>allTrainingAchievementsComplete(s)}
];
const ACHV_RP={
  a_stars10:150,a_streak7:200,a_disc15:100,a_nobel:1000,a_prof:300,a_daily:100,
  a_hints20:25,a_allmol:1000,a_stars25:300,a_mechanics:350,a_disc30:250,a_level50:300,
  a_firstlesson:25,a_toolstudent:50,a_mechexplorer:75,a_labstudent:75,a_trainingmaster:250
};
function checkAchievementsSilent(){
  let newly=null;
  ACHV.forEach(a=>{
    if(!save.achv[a.id]&&a.check(save)){
      save.achv[a.id]=1;
      const rp=Math.max(0,Math.floor(Number(ACHV_RP[a.id])||0));
      if(rp>0){
        save.researchAchievements=save.researchAchievements&&typeof save.researchAchievements==='object'?save.researchAchievements:{};
        if(!save.researchAchievements[a.id]){
          save.researchAchievements[a.id]=rp;
          addResearchPoints(rp);
        }
      }
      newly=a;
    }
  });
  return newly;
}
function checkAchievements(){
  const newly=checkAchievementsSilent();
  if(newly){
    persist();
    setTimeout(()=>say(t('achvUnlocked',t(newly.name))+'  +'+(ACHV_RP[newly.id]||0)+' RP','happy',3600),400);
  }
}
function tierOf(cur){
  cur=Math.max(0,Math.floor(Number(cur)||0));
  if(cur>=CAMPAIGN_TARGET_LEVELS)return 8; // Nobel winner after completing Level 301
  if(cur>=140)return 7;           // Nobel Candidate: Levels 141–150
  if(cur>=120)return 6;           // Master Professor: Levels 121–140
  if(cur>=100)return 5;           // Professor: Levels 101–120
  if(cur>=80)return 4;            // Doctor: Levels 81–100
  if(cur>=60)return 3;            // Senior Scientist: Levels 61–80
  if(cur>=40)return 2;            // Scientist: Levels 41–60
  if(cur>=20)return 1;            // Science Assistant: Levels 21–40
  return 0;                       // Lab Assistant: Levels 1–20
}
let curBgTier=0, bgActive='A';
function setBgForTier(tier,animate){
  tier=Math.max(0,Math.min(8,Math.floor(Number(tier)||0)));
  if(tier===curBgTier)return;
  curBgTier=tier;
  document.body.classList.remove('tier1','tier2','tier3','tier4','tier5','tier6','tier7','tier8');
  if(tier>0)document.body.classList.add('tier'+tier);
  const spec=TIER_BG[tier]||TIER_BG[0];
  const inactiveId=bgActive==='A'?'B':'A';
  const activeEl=$('#bg'+bgActive), inactiveEl=$('#bg'+inactiveId);
  inactiveEl.style.backgroundImage=(spec.overlay?spec.overlay+',':'')+'url("'+spec.uri+'")';
  inactiveEl.style.backgroundBlendMode=spec.blend||'normal';
  if(animate===false){
    activeEl.style.transition='none';inactiveEl.style.transition='none';
    activeEl.style.opacity=0;inactiveEl.style.opacity=1;
    bgActive=inactiveId;
    void activeEl.offsetHeight;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      activeEl.style.transition='';inactiveEl.style.transition='';
    }));
  }else{
    requestAnimationFrame(()=>{
      activeEl.style.opacity=0;inactiveEl.style.opacity=1;
      bgActive=inactiveId;
    });
  }
}
function tipOf(id){
  const n=MOLS[id].s.length;
  if(id==='O3'||id==='SO2')return t('tipL');
  if(id==='C2H4'||id==='N2H4')return t('tipMid');
  if(id==='NH3'||id==='CH4'||id==='CH2O'||id==='SO3'||id==='CH3OH')return t('tipCenter');
  if(n===2)return t('tip2');
  if(n===3)return t('tip3');
  return t('tipChain');
}
const LN_EN={
  greet:['Welcome to my lab! 🧪','E=mc² was easy... THIS is the real test! 😉','What molecule are we cooking today? 👨‍🔬','Atoms are ready — are you? ⚛️'],
  idle:['The atoms are getting bored! 😅','Thinking is nice, pushing is nicer! 👉','A little chemistry coffee break? ☕','Time is relative — this level is not! ⏳'],
  bump:['Wall: 1 — Atom: 0 😄','That stone will not move, trust me! 🪨','Walls are stubborn, just like my hair!','Hmm, no way through there... 🤔'],
  frozen:['This one is frozen solid — build around it! ❄️','Brr, that atom won\'t budge, it\'s locked in place! 🧊','Frozen atoms stay put — the others must come to it! ❄️'],
  slow:['The scenic route is still a route! 🌀','Fewer moves, more science! ✨','Easy now — Rome was not built in a day! 🏛️'],
  win:['Magnificent! The Nobel is coming! 🏆','Now THAT is science! 🎉','Your brain runs at light speed! ⚡','Bravo! The lab is proud of you! 🥼'],
  perfect:['PERFECT! Simply genius! 🌟','You beat the par! Even I am amazed! 😮','Flawless solution! You are a genius! 🧠✨'],
  last:'YOU BUILT EVERY MOLECULE! The Nobel Prize is yours — I mean it! 🏆🎓'
};
const LN_DE={
  greet:['Willkommen in meinem Labor! 🧪','E=mc² war einfach … DAS ist die echte Prüfung! 😉','Welches Molekül bauen wir heute? 👨‍🔬','Die Atome sind bereit — du auch? ⚛️'],
  idle:['Den Atomen wird langsam langweilig! 😅','Nachdenken ist gut, schieben ist besser! 👉','Zeit für eine kleine Chemie-Kaffeepause? ☕','Zeit ist relativ — dieses Level nicht! ⏳'],
  bump:['Wand: 1 — Atom: 0 😄','Dieser Stein bewegt sich nicht, glaub mir! 🪨','Wände sind stur, genau wie meine Haare!','Hmm, dort geht es nicht weiter … 🤔'],
  frozen:['Dieses Atom ist festgefroren — baue um es herum! ❄️','Brr, dieses Atom bewegt sich keinen Millimeter! 🧊','Gefrorene Atome bleiben stehen — die anderen müssen zu ihnen kommen! ❄️'],
  slow:['Auch der Umweg führt zum Ziel! 🌀','Weniger Züge, mehr Wissenschaft! ✨','Ganz ruhig — Rom wurde auch nicht an einem Tag erbaut! 🏛️'],
  win:['Großartig! Der Nobelpreis rückt näher! 🏆','DAS nenne ich Wissenschaft! 🎉','Dein Gehirn arbeitet mit Lichtgeschwindigkeit! ⚡','Bravo! Das Labor ist stolz auf dich! 🥼'],
  perfect:['PERFEKT! Einfach genial! 🌟','Du hast die Vorgabe geschlagen! Selbst ich bin beeindruckt! 😮','Makellose Lösung! Du bist ein Genie! 🧠✨'],
  last:'DU HAST ALLE MOLEKÜLE GEBAUT! Der Nobelpreis gehört dir — ernsthaft! 🏆🎓'
};
const LN_ES={
  greet:['¡Bienvenido a mi laboratorio! 🧪','E=mc² fue fácil… ¡esta es la prueba de verdad! 😉','¿Qué molécula construiremos hoy? 👨‍🔬','Los átomos están listos — ¿y tú? ⚛️'],
  idle:['¡Los átomos empiezan a aburrirse! 😅','Pensar está bien; empujar, mejor. 👉','¿Una pequeña pausa para café químico? ☕','El tiempo es relativo — este nivel no. ⏳'],
  bump:['Pared: 1 — Átomo: 0 😄','Esa roca no se moverá, créeme. 🪨','Las paredes son tercas, como mi pelo.','Hmm, por ahí no se puede… 🤔'],
  frozen:['Está completamente congelado — tendrás que construir a su alrededor. ❄️','Brr, ese átomo no se mueve. 🧊','Los átomos congelados se quedan quietos; los demás deben ir hacia ellos. ❄️'],
  slow:['¡Un camino largo también es un camino! 🌀','Pocos movimientos, mucha ciencia. ✨','Con calma — Roma no se construyó en un día. 🏛️'],
  win:['¡Magnífico! El Nobel está más cerca. 🏆','¡A esto lo llamo ciencia! 🎉','¡Tu cerebro trabaja a la velocidad de la luz! ⚡','¡Bravo! El laboratorio está orgulloso de ti. 🥼'],
  perfect:['¡PERFECTO! Pura genialidad. 🌟','¡Superaste el objetivo! Hasta yo estoy sorprendido. 😮','¡Solución impecable! Eres un genio. 🧠✨'],
  last:'¡HAS CONSTRUIDO TODAS LAS MOLÉCULAS! El Nobel es tuyo — en serio. 🏆🎓'
};
const LN_PT={
  greet:['Bem-vindo ao meu laboratório! 🧪','E=mc² foi fácil… este é o verdadeiro teste! 😉','Qual molécula vamos construir hoje? 👨‍🔬','Os átomos estão prontos — e você? ⚛️'],
  idle:['Os átomos estão ficando entediados! 😅','Pensar é bom; empurrar é melhor. 👉','Uma pequena pausa para café químico? ☕','O tempo é relativo — este nível não. ⏳'],
  bump:['Parede: 1 — Átomo: 0 😄','Essa pedra não vai se mover, confie em mim. 🪨','Paredes são teimosas, como meu cabelo.','Hmm, não dá para passar por aí… 🤔'],
  frozen:['Está totalmente congelado — construa ao redor dele. ❄️','Brr, esse átomo não se mexe. 🧊','Átomos congelados ficam parados; os outros precisam ir até eles. ❄️'],
  slow:['Um caminho longo ainda é um caminho! 🌀','Poucos movimentos, muita ciência. ✨','Com calma — Roma não foi construída em um dia. 🏛️'],
  win:['Magnífico! O Nobel está mais perto. 🏆','Isso sim é ciência! 🎉','Seu cérebro trabalha na velocidade da luz! ⚡','Bravo! O laboratório está orgulhoso de você. 🥼'],
  perfect:['PERFEITO! Pura genialidade. 🌟','Você superou o objetivo! Até eu fiquei surpreso. 😮','Solução impecável! Você é um gênio. 🧠✨'],
  last:'VOCÊ CONSTRUIU TODAS AS MOLÉCULAS! O Nobel é seu — sério. 🏆🎓'
};
const LN_JA={
  greet:['私の研究室へようこそ！🧪','E=mc²は簡単だった…本当の試験はここからだ！😉','今日はどの分子を作ろうか？👨‍🔬','原子は準備完了。君はどうかな？⚛️'],
  idle:['原子たちが退屈し始めたぞ！😅','考えるのもいいが、動かすのはもっといい！👉','化学コーヒー休憩にするかい？☕','時間は相対的だが、このレベルは違う！⏳'],
  bump:['壁 1 — 原子 0 😄','その岩は動かない。私を信じたまえ！🪨','壁は私の髪と同じくらい頑固だ！','ふむ、そこは通れないようだ…🤔'],
  frozen:['完全に凍っている。周りを組み立てよう！❄️','ブルッ、その原子は動かないぞ！🧊','凍った原子はその場に残る。他の原子を近づけよう！❄️'],
  slow:['遠回りも立派な道だ！🌀','少ない手数で、大きな科学を！✨','焦らずに。ローマは一日にして成らず！🏛️'],
  win:['素晴らしい！ノーベル賞が近づいたぞ！🏆','これぞ科学だ！🎉','君の頭脳は光速で動いている！⚡','見事！研究室も誇らしげだ！🥼'],
  perfect:['完璧！まさに天才だ！🌟','基準手数を超えた！私まで驚いたぞ！😮','非の打ち所がない解答だ！🧠✨'],
  last:'すべての分子を完成させた！ノーベル賞は君のものだ！🏆🎓'
};
const LN_TR={
  greet:['Laboratuvarıma hoş geldin! 🧪','E=mc² kolaydı... asıl sınav bu! 😉','Bugün hangi molekülü pişiriyoruz? 👨‍🔬','Atomlar hazır — sen hazır mısın? ⚛️'],
  idle:['Atomlar sıkılmaya başladı! 😅','Düşünmek güzel, itmek daha güzel! 👉','Kısa bir kimya kahve molası? ☕','Zaman görecelidir — bu seviye değil! ⏳'],
  bump:['Duvar: 1 — Atom: 0 😄','O taş kıpırdamaz, güven bana! 🪨','Duvarlar inatçıdır, tıpkı saçlarım gibi!','Hmm, oradan geçiş yok... 🤔'],
  frozen:['Bu tamamen donmuş — etrafını sen doldurmalısın! ❄️','Brr, o atom kıpırdamaz, yerine kilitlenmiş! 🧊','Donmuş atomlar yerinde kalır — diğerleri ona gelmeli! ❄️'],
  slow:['Uzun yol da yoldur! 🌀','Az hamle, çok bilim! ✨','Yavaş ol — Roma bir günde kurulmadı! 🏛️'],
  win:['Muhteşem! Nobel yolda! 🏆','İşte buna bilim denir! 🎉','Beynin ışık hızında çalışıyor! ⚡','Bravo! Laboratuvar seninle gurur duyuyor! 🥼'],
  perfect:['MÜKEMMEL! Tam bir deha! 🌟','Par\'ı geçtin! Ben bile şaşırdım! 😮','Kusursuz çözüm! Bir dahisin! 🧠✨'],
  last:'TÜM MOLEKÜLLERİ YAPTIN! Nobel Ödülü senin — ciddiyim! 🏆🎓'
};
let LN=LN_EN;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const SUPPORTED_LANGS=['en','tr','de','es','pt','ja'];
function normalizeLang(lang){return SUPPORTED_LANGS.includes(lang)?lang:'en';}
function contentLang(lang){return SUPPORTED_LANGS.includes(lang)?lang:'en';}
const I18N={
  en:{
    dirN:['up','right','down','left'],
    tipL:'This one bends like an L! Slide the middle (bend) atom into a corner first — it needs two walls to lock in place. 📐',
    tipMid:'Build the middle pair (the backbone) first, then attach the arms!',
    tipCenter:'Park the center atom in open space first, then attach the arms!',
    tip2:'Use walls as brakes — atoms only stop when they hit something! 🧱',
    tip3:'Place the middle atom first, bring the ends after!',
    tipChain:'Build the chain from the inside out; save the end atoms for last!',
    almostOneBond:'One more bond! Almost there! 🔥',
    sleeping:'Zzz... wake me with a move! 😴',
    dailyIntro:"Today's molecule — let's see what you've got! 🔬",
    nobelIntro:'My personal challenge! 🧠 Nobody has ever closed this ring — think you can?',
    firstDiscover:txt=>'',
    targetLine:(g,n,f)=>g+'Target: <b>'+n+'</b> ('+f+') '+rnd(['🧪','⚛️','🔬','✨']),
    firstSlide:'Nice! Atoms slide until they hit something! 🧊',
    hint15:"15 hints so far... I don't mind, that's what I'm here for! 😉",
    hint50:"50 hints?! We might be a little dependent on me now... I'm flattered! 😏",
    hintDir:(e,dir,ar)=>'✅ Guaranteed move: push the <b>'+e+'</b> atom (glowing circle) <b>'+dir+'</b> '+ar+' — this brings you one step closer!',
    hintRestartFirst:'Hit 🔄 RESTART first and I will show you the opening move! 😉',
    paidHintTitle:'💡 NEED MORE HELP?',
    paidHintMsg:c=>'You have '+c+' 🪙. Spend some to get unstuck!',
    paidHint50:'⚡ ONE MORE MOVE — 50 🪙',
    paidHint200:'🏆 SOLVE THE REST — 200 🪙',
    hintNoSolve:'Hmm, try 🔄 RESTART — I cannot find a path from here! 😅',
    hintTryUndo:'Hmm, I don\'t recognize this exact setup! Try tapping ↩ UNDO a few times to get back to a spot I know, then ask me again — no coins spent this time! 🔄',
    paidHintPlaying:'Watch closely — genius in motion! ✨',
    streak3:'Three perfect solves in a row! Are you sure YOU are not the genius here? 🤩',
    streak7:'Seven perfects straight?! I may need to make these harder... 😳',
    musicStatus:(st,err)=>'Music: '+st+(err?(' · bad track: '+err):''),
    tutTurn:"Now it's your turn! Swipe an atom, or tap it and use the D-Pad. 🔬",
    tutSlideMsg:'Great! Now push with the D-Pad ▶ or a swipe!',
    skipTutorial:'SKIP ›',howToPlay:'HOW TO PLAY',
    tut1:'Hi, I\u2019m Dr. E! This is the molecule we need to build.',
    tut2:'Tap the glowing atom to select it.',
    tut3:'Atoms keep sliding until a wall or another atom stops them. Swipe the way the arrow shows!',
    tut4:'Use walls and other atoms as stoppers. One more push!',
    tut5:'Perfect! You matched the exact shape shown in the Goal card.',
    tut6:'Fewer moves and faster solves earn more stars \u2014 up to 3!',
    tut7a:'Undo reverses your last move.',
    tut7b:'Reset restarts the experiment from scratch.',
    tut7c:'Use a Hint if you ever get stuck \u2014 it costs coins, we won\u2019t spend any now.',
    tut7d:'Earn MoleCoins by completing levels. Spend them on hints, the hammer, and special laboratory upgrades.',
    tut8:'Your turn, scientist. Complete the experiment!',
    tut8hint:'Tip: tap an atom, then swipe it toward the other one.',
    tut9:'Excellent! The laboratory is ready for you.',
    tutRewardToast:'Tutorial complete! +15 \ud83e\ude99',
    goodLuck:'Good luck! 🍀',
    tutBubble:'👋 <b>TAP</b> an atom, then <b>SWIPE</b> to push it! Bring two atoms together to bond them.',
    tutGoal:'Dr. E: First, look here — GOAL shows the molecule you must build.',
    nobelTitle:'YOU ARE A NOBEL CANDIDATE!',
    nobelSub:'The campaign is complete. The Nobel itself is won in the World Ranking. — Dr. E',
    goal:'GOAL',letsPlay:"LET'S PLAY! ▶",
    newGame:'✦ NEW GAME',continueBtn:'▶︎ CONTINUE',levels:'LEVELS',myMols:'🧪 MY MOLECULES',
    continueLevel:i=>'▶︎ CONTINUE · LEVEL '+i,
    newGameLabel:'NEW GAME',todaysExpLabel:"TODAY'S EXPERIMENT",myMolsLabel:'MY MOLECULES',
    hofLabel:'HALL OF FAME',hofCertTitle:'CERTIFICATE OF EXCELLENCE',hofNamePh:'Enter your name',
    welcomeTitle:'Welcome, Scientist!',welcomeMsg:'What should we call you in the Hall of Fame?',
    welcomeStart:'START EXPERIMENTING',welcomeDefaultName:'Anonymous Scientist',
    whosPlaying:"WHO'S PLAYING?",newPlayerBtn:'+ NEW PLAYER',switchPlayerTip:'Switch player',
    deleteProfileTitle:'Delete player?',deleteProfileMsg:n=>'This permanently deletes \"'+n+'\" from this device and the cloud. It cannot be undone.',deleteProfileTip:'Delete player',deleteProfileWorking:'Deleting…',deleteProfileDone:'Player deleted permanently.',deleteProfileFailed:'Could not delete this player from the cloud. Check your connection and try again.',profileLimit:'You can create up to 5 players.',managePlayers:'\u{1F465} MANAGE PLAYERS',
    hofStat3Stars:'3-STAR LEVELS',hofStatLevels:'LEVELS DONE',hofStatMols:'MOLECULES',hofStatAchv:'ACHIEVEMENTS',
    hofSpeedTitle:'⚡ SPEED RECORDS',hofNotYet:'Not yet',newRecord:'NEW RECORD',
    hofWorldTitle:'🏆 CAREER RANKING',worldLoading:'Loading rankings…',worldOffline:'Rankings could not be loaded right now. Please try again.',worldEmpty:'No verified rankings yet \u2014 be the first!',worldYou:'YOU',securePreparing:'🔒 Preparing verified score…',secureUnranked:'Secure verification is unavailable. This run will be saved locally but will not enter the ranking.',secureVerified:'✅ Score verified by the server!',
    spotWeek:'\u2B50 PLAYER OF THE WEEK',spotMonth:'\u{1F3C6} PLAYER OF THE MONTH',spotNone:'No record set yet \u2014 be the first!',
    hofMyRecordsTab:'\u{1F3C5} MY RECORDS',hofRankingsTab:'\u{1F30D} RANKINGS',
    tabWorld:'CAREER',tabWeek:'THIS WEEK',tabMonth:'THIS MONTH',tabChamps:'CHAMPIONS',
    rankingSoonTitle:'COMING SOON',rankingSoonText:'The seasonal champions archive will open in a future update.',
    periodWeek:w=>'Week '+w,periodMonth:m=>m,champWeekly:w=>'Weekly Champion \u2014 '+w,champMonthly:m=>'Monthly Champion \u2014 '+m,
    champEmpty:'No champions archived yet \u2014 check back after this week/month closes!',
    hofChampTitle:'🏆 YOUR RECORDS',hofStatScore:'RESEARCH POINTS',hofStatMaxCoins:'MOST COINS HELD',hofStatBestTime:'FASTEST SOLVE',
    diplomasHead:'🎓 DIPLOMAS',diplomaEarned:'Diploma earned!',diplomaLocked:'Reach this rank to earn',
    diplomaCertHead:'Certificate of Achievement',diplomaCertSub:'has successfully completed all requirements for the rank of',
    todaysExp:"🔬 TODAY'S EXPERIMENT",
    copyLine:'© 2026 Orhan Akyol - wHiTeWaY studio · '+APP_VERSION,
    myMolecules:'MY MOLECULES',periodicTable:'⚛️ PERIODIC TABLE',
    achievements:'🏆 ACHIEVEMENTS',achvShort:'AWARDS',achvLocked:'Keep playing to unlock this!',
    achvMicroName:'Microscope',achvMicroDesc:'Earn 3 stars on 10 levels',
    achvTeslaName:'Tesla Coil',achvTeslaDesc:'Reach a 7-level perfect streak',
    achvCrystalName:'Crystal',achvCrystalDesc:'Discover 15 molecules',
    achvDnaName:'DNA Helix',achvDnaDesc:'Complete the Nobel bonus level',
    achvProfName:'Medal',achvProfDesc:'Reach Professor rank',
    achvDailyName:'Calendar',achvDailyDesc:'Complete a Daily Challenge',
    achvCompassName:'Compass',achvCompassDesc:'Use hints 20 times total',
    achvGogglesName:'Goggles',achvGogglesDesc:'Discover every molecule',
    achvStarName:'Shooting Star',achvStarDesc:'Earn 3 stars on 25 levels',
    achvMechName:'Mechanic Master',achvMechDesc:'Get 3 stars on every frozen, fire, and sticky atom level',
    achvPetriName:'Petri Dish',achvPetriDesc:'Discover 30 different molecules',
    achvRocketName:'Blast Off',achvRocketDesc:'Reach level 50',
    achvFirstLessonName:'First Experiment',achvFirstLessonDesc:'Complete the basic movement tutorial',
    achvToolStudentName:'Support Apprentice',achvToolStudentDesc:'Learn 3 player-support lessons',
    achvMechExplorerName:'Mechanic Explorer',achvMechExplorerDesc:'Learn 5 special atom or mechanic lessons',
    achvLabStudentName:'Laboratory Student',achvLabStudentDesc:'Learn 3 laboratory equipment lessons',
    achvTrainingMasterName:'Moleculopedia Master',achvTrainingMasterDesc:'Complete every tutorial and laboratory lesson',
    achvUnlocked:n=>'New achievement: '+n+'! Check My Molecules! 🎉',
    frozenIntro:'❄️ Careful — a frozen atom appeared! It won\'t move no matter what. Slide the OTHER atoms around it to finish the molecule!',
    fireIntro:'🔥 See that glowing atom? It\'s red hot! Slide it next to the frozen one to melt it free!',
    stickyIntro:'🍯 Careful — that atom is covered in glue! Whatever touches it gets stuck there forever. Plan your moves!',
    stickMsg:'🍯 Stuck fast! That atom cannot move anymore.',
    zombieIntro:'🧟\u200d♂️ Uh oh — a goofy infected atom! Anything that touches it turns into a zombie too, up to 2 times. Fire can cure a zombie back to normal!',
    mechanicBriefingHeading:'New mechanic ahead!',mechanicBriefingSub:'Quick heads-up before you start:',mechanicBriefingGo:'Got it, let\'s go! \u25b6',
    frozenTitle:'❄️ Frozen atom',frozenDesc:'A frozen atom cannot move. Build around it, or bring a fire atom next to it to melt the ice.',
    fireTitle:'🔥 Fire atom',fireDesc:'A fire atom melts any frozen atom directly beside it. Move it into contact to open the route.',
    lightningTitle:'⚡ Electrically charged atom',lightningDesc:'The ⚡ symbol means this atom carries an electric charge. When it touches a connected atom group, the pulse travels through the chain and thaws every frozen atom it reaches.',
    stickyTitle:'🧲 Sticky atom',stickyDesc:'An atom that touches it becomes stuck at that contact point. Check where the slide will end before moving.',
    zombieTitle:'🧟‍♂️ Zombie atom',zombieDesc:'It infects touching atoms up to two times. A fire atom can cure infected atoms back to normal.',
    oneWayTitle:'↪️ One-way tile',oneWayDesc:'An atom sliding onto the arrow can only keep going that direction — it can never come back the way it came.',
    hammerTitle:'🧱 Breakable wall + 🔨 Hammer',hammerDesc:'This wall blocks the path until you smash it with the HAMMER tool at the bottom of the screen. You get a limited number per level, so use them wisely.',
    portalTitle:'🌀 Portal',portalDesc:'Slide an atom into one portal and it instantly comes out of its linked partner elsewhere on the board.',
    movingWallTitle:'🚧 Moving wall',movingWallDesc:'This wall shifts to a new position as you move. Watch its pattern and time your slide around it.',
    pressureDoorTitle:'🔘 Pressure door',pressureDoorDesc:'Land an atom on the glowing button to open its linked door somewhere else on the board.',
    fragileTitle:'💎 Fragile atom',fragileDesc:'Each hard stop adds a crack. On the third impact it shatters and the experiment restarts. If that third impact completes the molecule, the level is won first.',
    linkedTitle:'🔗 Linked atoms',linkedDesc:'The marked pair moves together in the same direction. Check that BOTH atoms have a clear route before sliding.',
    precisionTitle:'🎯 One-Square Move (optional)',precisionDesc:'This is an optional booster, not the main objective. Activate it, select an atom, then choose a direction to move exactly ONE tile.',classicCatalystTitle:'🧪 Catalyst Hunt objective',classicCatalystDesc:'First collect the Catalyst, Energy Cell, and Stabilizer shown at the top. After all three display a check mark, complete the target molecule.',classicChainTitle:'⚡ Chain Reaction objective',classicChainDesc:'This is different from the ⚡ charge shown on an atom. Follow the glowing correct move: the sequence continues automatically and builds Combo x2 / x3.',classicReactorTitle:'☢️ Reactor lasers',classicReactorDesc:'Move during the safe laser phase. Contact increases the Impact counter; in Reactor Escape it also adds a 3-second penalty.',
    zombieMsg:'🧟‍♂️ Infected! That atom is now a zombie too...',
    cureMsg:'🔥✨ Cured! The zombie is back to normal!',
    meltMsg:'🔥💧 Sizzle! The ice melted — that atom is free to move now!',
    undiscoveredFact:'Keep playing to discover this molecule!',
    undiscoveredName:'???',
    undo:'UNDO',hint:'HINT',restart:'RESTART',lab:'LAB',molecules:'MOLECULES',
    moves:(m,p)=>'MOVES '+m+' · PAR '+p,
    level:i=>'LEVEL '+i,
    allComplete:'🏆 ALL LEVELS COMPLETE! 🏆',
    levelDone:i=>'LEVEL '+i+' DONE!',
    bestClaimed:'Best already claimed',
    nextLevel:'NEXT LEVEL ▶︎',playAgain:'🔄 PLAY AGAIN',
    dailyTitle:"🔬 TODAY'S EXPERIMENT",
    dailyAlready:'Today’s coin reward is claimed — replay to improve your RP!',
    dailySolved:'Solved! Replay to improve today’s RP, or return tomorrow.',
    dailyPractice:'Practice run — no bonus',
    dailyOffline:'Offline — this was practice only, reconnect to claim today\u2019s reward.',
    dailyPracticeAgain:'🔄 PRACTICE AGAIN',
    mainMenu:'MAIN MENU',
    newGameTitle:'NEW GAME',
    newGameMsg:(cur,coins)=>'You have saved progress ('+cur+' levels unlocked, '+coins+' <span class="coinIcon"></span>).',
    playFrom1:'▶︎ PLAY FROM LEVEL 1',wipe:'🗑️ WIPE & START',cancel:'CANCEL',
    settingsTitle:'SETTINGS',showDpad:'🕹️ Show D-Pad',language:'🌐 Language',tutorialTipsLabel:'Tutorial Tips',tutorialTipsNote:'New mechanics are explained once on first encounter.',reduceMotionLabel:'Reduce Motion',reduceMotionNote:'Reduces zoom, shake and intensive effects.',duelEffectsLabel:'Duel Effects',duelEffectsNote:'Opponent alerts and screen effects.',duelMessagesLabel:'Duel Messages',duelMessagesNote:'Show or mute preset messages.',hapticsLabel:'Haptics',hapticsNote:'Short tactile feedback.',largeTextLabel:'Large Text',largeTextNote:'Enlarges menu and help text.',colorBlindLabel:'Color-Blind Support',colorBlindNote:'Uses stronger symbols and outlines alongside color.',highContrastLabel:'High Contrast',highContrastNote:'Strengthens text, card and button separation.',effectIntensityLabel:'Effect Intensity',effectLow:'Low',effectNormal:'Normal',effectHigh:'High',performanceModeLabel:'Performance Mode',performanceModeNote:'Automatic, low power, or high quality.',performanceAuto:'Automatic',performanceLow:'Low power',performanceHigh:'High quality',resetProgress:'⟲ Reset Progress',deleteCloudOnly:'☁ Delete Cloud Data Only',
    resetProgress:'RESET PROGRESS',close:'CLOSE',
    deleteCloudBtn:'DELETE CLOUD DATA',privacyLink:'Privacy Policy',termsLink:'Terms of Use',nameRulesLink:'Name Rules',
    deleteCloudTitle:'Delete cloud data?',
    deleteCloudWarn:'This permanently removes the cloud backup for this player profile. Your local progress on this device is not affected. This cannot be undone.',
    yesDeleteCloud:'Yes, delete my cloud data',deleting:'Deleting…',
    deleteCloudDone:'Cloud data deleted.',deleteCloudFailed:'Could not delete cloud data — check your connection and try again.',
    aboutTitle:'ℹ️ ABOUT',
    aboutBody:'© 2026 Orhan Akyol - wHiTeWaY studio<br><br>📧 Support: <a href="mailto:moleculoxsupport@gmail.com" style="color:#9d7bff">moleculoxsupport@gmail.com</a><br>✉️ Contact: <a href="mailto:oakyol82@hotmail.com" style="color:#9d7bff">oakyol82@hotmail.com</a><br>📸 Instagram: <a href="https://www.instagram.com/whitewayw/" target="_blank" rel="noopener noreferrer" style="color:#9d7bff">@wHiTeWaYw</a><br>🎮 Official Web Page: <a href="https://whitewayhan.itch.io/moleculox" target="_blank" rel="noopener noreferrer" style="color:#9d7bff">whitewayhan.itch.io/moleculox</a><br>🌐 Direct Web: <a href="https://moleculox.netlify.app" target="_blank" rel="noopener noreferrer" style="color:#9d7bff">moleculox.netlify.app</a>',
    rank0:'🧪 Lab Assistant',rank1:'🔬 Science Assistant',rank2:'⚗️ Scientist',rank3:'🥼 Senior Scientist',rank4:'🎓 Doctor',rank5:'📚 Professor',rank6:'🌟 Master Professor',rank7:'🚀 On the Nobel Path',rank8:'🏅 Nobel Candidate',
    rankUpTitle:'PROMOTED!',
    rankUpMsg:r=>'You have been promoted to '+r+'!',
    rankUpEinstein:['Your lab is growing along with you! 🔬','Look at this place — we have upgraded! 🎉','Every great scientist earns a bigger lab! 🧪'],
    rankUpContinue:'CONTINUE ▶︎',
    audioSettings:'AUDIO SETTINGS',master:'🔉 Master',music:'🎵 Music',sfx:'🔔 SFX',externalMusicLabel:'🎧 External Music Mode',externalMusicNote:'Keeps Spotify / YouTube Music playing. Game audio is muted.',
    musicListBtn:'🎵 SOUNDTRACK',musicListTitle:'🎵 SOUNDTRACK',trackLabel:i=>trackName(i-1),
    areYouSure:'ARE YOU SURE?',wipeWarn:'All stars, coins and molecules will be wiped!',
    yesWipe:'YES, WIPE',langEN:'English',langTR:'Türkçe',langDE:'Deutsch',langES:'Español',langPT:'Português',langJA:'日本語'
  },
  tr:{
    dirN:['yukarı','sağa','aşağı','sola'],
    tipL:'Bu molekül L gibi bükülüyor! Ortadaki (bükülme) atomunu önce bir köşeye kaydır — yerine oturması için iki duvara ihtiyacı var. 📐',
    tipMid:'Önce ortadaki çifti (omurgayı) kur, sonra kollarını ekle!',
    tipCenter:'Önce merkez atomu boş bir alana park et, sonra kollarını ekle!',
    tip2:'Duvarları fren gibi kullan — atomlar ancak bir şeye çarpınca durur! 🧱',
    tip3:'Önce orta atomu yerleştir, uçları sonra getir!',
    tipChain:'Zinciri içten dışa kur; uç atomları en sona bırak!',
    almostOneBond:'Bir bağ daha! Neredeyse tamam! 🔥',
    sleeping:'Zzz... beni bir hamleyle uyandır! 😴',
    dailyIntro:'Bugünün molekülü — bakalım elinden ne geliyor! 🔬',
    nobelIntro:'Kişisel meydan okumam! 🧠 Bu halkayı kimse kapatamadı — sence yapabilir misin?',
    firstDiscover:txt=>'',
    targetLine:(g,n,f)=>g+'Hedef: <b>'+n+'</b> ('+f+') '+rnd(['🧪','⚛️','🔬','✨']),
    firstSlide:'Güzel! Atomlar bir şeye çarpana kadar kayar! 🧊',
    hint15:'Şimdiye kadar 15 ipucu... sorun değil, ben zaten bunun için buradayım! 😉',
    hint50:'50 ipucu mu?! Artık bana biraz bağımlı olmuş olabiliriz... gurur duydum! 😏',
    hintDir:(e,dir,ar)=>'✅ Garantili hamle: <b>'+e+'</b> atomunu (parlayan daire) <b>'+dir+'</b> it '+ar+' — bu seni bir adım yaklaştırır!',
    hintRestartFirst:'Önce 🔄 RESTART\'a bas, sana ilk hamleyi göstereyim! 😉',
    paidHintTitle:'💡 DAHA FAZLA YARDIM İSTER MİSİN?',
    paidHintMsg:c=>c+' 🪙 jetonun var. Biraz harcayıp takıldığın yerden kurtulabilirsin!',
    paidHint50:'⚡ BİR HAMLE DAHA — 50 🪙',
    paidHint200:'🏆 KALANINI ÇÖZ — 200 🪙',
    hintNoSolve:'Hmm, 🔄 YENİDEN dene — buradan bir yol bulamıyorum! 😅',
    hintTryUndo:'Hmm, bu tam düzeni tanımıyorum! Birkaç kez ↩ GERİ AL\'a basıp tanıdığım bir noktaya dön, sonra tekrar sor — bu seferlik jeton harcanmadı! 🔄',
    paidHintPlaying:'Dikkatli izle — deha iş başında! ✨',
    streak3:'Art arda üç mükemmel çözüm! Asıl deha sen değil misin? 🤩',
    streak7:'Art arda yedi mükemmel mi?! Bunları biraz daha zorlaştırmam gerekebilir... 😳',
    musicStatus:(st,err)=>'Müzik: '+st+(err?(' · sorunlu parça: '+err):''),
    tutTurn:'Şimdi sıra sende! Bir atomu kaydır, ya da dokunup D-Pad kullan. 🔬',
    tutSlideMsg:'Harika! Şimdi D-Pad ▶ ile ya da kaydırarak it!',
    skipTutorial:'GEÇ ›',howToPlay:'NASIL OYNANIR',
    tut1:'Merhaba, ben Dr. E! Önce GOAL kartına bak: oluşturman gereken molekül burada gösterilir. Kartın ışığı hızlanıp sıcak renge dönerse yalnızca bir doğru bağ kalmıştır!',
    tut2:'Parlayan atoma dokunarak seç.',
    tut3:'Atomlar bir duvara ya da başka bir atoma çarpana kadar kayar. Okun gösterdiği yöne kaydır!',
    tut4:'Duvarları ve diğer atomları durdurucu olarak kullan. Bir itiş daha!',
    tut5:'Mükemmel! GOAL kartındaki şekli birebir oluşturdun.',
    tut6:'Daha az hamle ve daha hızlı çözüm daha çok yıldız kazandırır \u2014 3\u2019e kadar!',
    tut7a:'Undo son hamleni geri alır.',
    tut7b:'Reset deneyi baştan başlatır.',
    tut7c:'Takılırsan İpucu kullanabilirsin \u2014 jeton harcar, şimdi harcamayacağız.',
    tut7d:'MoleCoin’leri bölüm tamamlayarak kazanırsın. İpuçları, çekiç ve özel laboratuvar geliştirmelerinde kullanılır.',
    tut8:'Sıra sende bilim insanı. Deneyi tamamla!',
    tut8hint:'İpucu: bir atoma dokun, sonra diğerine doğru kaydır.',
    tut9:'Mükemmel! Laboratuvar senin için hazır.',
    tutRewardToast:'Tutorial tamamlandı! +15 \ud83e\ude99',
    goodLuck:'Bol şans! 🍀',
    tutBubble:'👋 Bir atoma <b>DOKUN</b>, sonra itmek için <b>KAYDIR</b>! İki atomu yan yana getirip bağla.',
    tutGoal:'Dr. E: Önce buraya bak! GOAL, oluşturman gereken molekülü gösterir.',
    nobelTitle:'NOBEL ADAYISIN!',
    nobelSub:'Kampanyayı tamamladın. Asıl Nobel, Dünya Sıralaması’nda kazanılır. — Dr. E',
    goal:'HEDEF',letsPlay:'HAYDİ BAŞLA! ▶',
    newGame:'✦ YENİ OYUN',continueBtn:'▶︎ DEVAM ET',levels:'BÖLÜMLER',myMols:'🧪 MOLEKÜLLERİM',
    continueLevel:i=>'▶︎ DEVAM ET · BÖLÜM '+i,
    newGameLabel:'YENİ OYUN',todaysExpLabel:'GÜNÜN DENEYİ',myMolsLabel:'MOLEKÜLLERİM',
    hofLabel:'ŞEREF LİSTESİ',hofCertTitle:'MÜKEMMELLİK SERTİFİKASI',hofNamePh:'Adını yaz',
    welcomeTitle:'Hoş geldin, Bilim İnsanı!',welcomeMsg:'Şeref Listesi\'nde sana ne diyelim?',
    welcomeStart:'DENEYE BAŞLA',welcomeDefaultName:'Anonim Bilim İnsanı',
    whosPlaying:'KİM OYNUYOR?',newPlayerBtn:'+ YENİ OYUNCU',switchPlayerTip:'Oyuncu değiştir',
    deleteProfileTitle:'Oyuncu silinsin mi?',deleteProfileMsg:n=>'\"'+n+'\" bu cihazdan ve buluttan kalıcı olarak silinecek. Bu işlem geri alınamaz.',deleteProfileTip:'Oyuncuyu sil',deleteProfileWorking:'Siliniyor…',deleteProfileDone:'Oyuncu kalıcı olarak silindi.',deleteProfileFailed:'Oyuncu buluttan silinemedi. Bağlantını kontrol edip tekrar dene.',profileLimit:'En fazla 5 oyuncu oluşturabilirsin.',managePlayers:'\u{1F465} OYUNCULARI YÖNET',
    hofStat3Stars:'3 YILDIZLI BÖLÜM',hofStatLevels:'BİTEN BÖLÜM',hofStatMols:'MOLEKÜL',hofStatAchv:'BAŞARI',
    hofSpeedTitle:'⚡ HIZ REKORLARI',hofNotYet:'Henüz yok',newRecord:'YENİ REKOR',
    hofWorldTitle:'🏆 KARİYER SIRALAMASI',worldLoading:'Sıralama yükleniyor…',worldOffline:'Sıralama şu an yüklenemedi. Lütfen tekrar dene.',worldEmpty:'Henüz doğrulanmış sıralama yok \u2014 ilk sen ol!',worldYou:'SEN',securePreparing:'🔒 Doğrulanmış skor hazırlanıyor…',secureUnranked:'Güvenli doğrulama şu an kullanılamıyor. Bu oyun yerel olarak kaydedilecek ancak sıralamaya girmeyecek.',secureVerified:'✅ Skor sunucu tarafından doğrulandı!',
    spotWeek:'\u2B50 HAFTANIN OYUNCUSU',spotMonth:'\u{1F3C6} AYIN OYUNCUSU',spotNone:'Henüz rekor yok \u2014 ilk sen ol!',
    hofMyRecordsTab:'\u{1F3C5} REKORLARIM',hofRankingsTab:'\u{1F30D} SIRALAMA',
    tabWorld:'KARİYER',tabWeek:'BU HAFTA',tabMonth:'BU AY',tabChamps:'ŞAMPİYONLAR',
    rankingSoonTitle:'YAKINDA',rankingSoonText:'Sezon şampiyonları arşivi gelecek bir güncellemede açılacak.',
    periodWeek:w=>w+'. Hafta',periodMonth:m=>m,champWeekly:w=>'Haftalık Şampiyon \u2014 '+w,champMonthly:m=>'Aylık Şampiyon \u2014 '+m,
    champEmpty:'Henüz arşivlenmiş şampiyon yok \u2014 bu hafta/ay kapandığında tekrar bak!',
    hofChampTitle:'🏆 REKORLARIN',hofStatScore:'ARAŞTIRMA PUANI',hofStatMaxCoins:'EN ÇOK JETON',hofStatBestTime:'EN HIZLI ÇÖZÜM',
    diplomasHead:'🎓 DİPLOMALAR',diplomaEarned:'Diploma kazanıldı!',diplomaLocked:'Kazanmak için bu rütbeye ulaş',
    diplomaCertHead:'Başarı Sertifikası',diplomaCertSub:'aşağıdaki rütbenin tüm gereksinimlerini başarıyla tamamlamıştır:',
    todaysExp:'🔬 GÜNÜN DENEYİ',
    copyLine:'© 2026 Orhan Akyol - wHiTeWaY studio · '+APP_VERSION,
    myMolecules:'MOLEKÜLLERİM',periodicTable:'⚛️ PERİYODİK TABLO',
    achievements:'🏆 BAŞARILAR',achvShort:'BAŞARI',achvLocked:'Açmak için oynamaya devam et!',
    achvMicroName:'Mikroskop',achvMicroDesc:'10 bölümde 3 yıldız kazan',
    achvTeslaName:'Tesla Bobini',achvTeslaDesc:'7 bölüm üst üste mükemmel çöz',
    achvCrystalName:'Kristal',achvCrystalDesc:'15 molekül keşfet',
    achvDnaName:'DNA Sarmalı',achvDnaDesc:'Nobel bonus bölümünü bitir',
    achvProfName:'Madalya',achvProfDesc:'Profesör rütbesine ulaş',
    achvDailyName:'Takvim',achvDailyDesc:'Bir Günün Deneyi\'ni tamamla',
    achvCompassName:'Pusula',achvCompassDesc:'Toplam 20 kez ipucu kullan',
    achvGogglesName:'Gözlük',achvGogglesDesc:'Tüm molekülleri keşfet',
    achvStarName:'Kayan Yıldız',achvStarDesc:'25 bölümde 3 yıldız kazan',
    achvMechName:'Mekanik Ustası',achvMechDesc:'Tüm donmuş, ateşli ve yapışkan atom bölümlerinde 3 yıldız kazan',
    achvPetriName:'Petri Kabı',achvPetriDesc:'30 farklı molekül keşfet',
    achvRocketName:'Fırlatma',achvRocketDesc:'50. bölüme ulaş',
    achvFirstLessonName:'İlk Deney',achvFirstLessonDesc:'Temel hareket eğitimini tamamla',
    achvToolStudentName:'Destek Çırağı',achvToolStudentDesc:'3 oyuncu desteği eğitimini öğren',
    achvMechExplorerName:'Mekanik Kaşifi',achvMechExplorerDesc:'5 özel atom veya mekanik eğitimini öğren',
    achvLabStudentName:'Laboratuvar Öğrencisi',achvLabStudentDesc:'3 laboratuvar cihazı eğitimini öğren',
    achvTrainingMasterName:'Moleculopedia Ustası',achvTrainingMasterDesc:'Tüm eğitimleri ve laboratuvar derslerini tamamla',
    achvUnlocked:n=>'Yeni başarı: '+n+'! Moleküllerim ekranına bak! 🎉',
    frozenIntro:'❄️ Dikkat — donmuş bir atom belirdi! Ne yaparsan yap kıpırdamaz. Molekülü tamamlamak için DİĞER atomları onun etrafına kaydır!',
    fireIntro:'🔥 Şu parlayan atomu gördün mü? Kor gibi sıcak! Donmuş olanın yanına kaydır, eritsin!',
    lightningIntro:'⚡ Şimşek atomu! Bağlı bir atom grubuna değdiğinde elektrik darbesi zincir boyunca ilerler ve ulaştığı tüm donmuş atomları çözer.',
    lightningMsg:'⚡ Zincir darbesi! Bağlı gruptaki donmuş atomlar serbest kaldı.',
    stickyIntro:'🍯 Dikkat — o atom yapışkanla kaplı! Ona değen her şey sonsuza dek yapışır. Hamlelerini iyi planla!',
    stickMsg:'🍯 Yapıştı! O atom artık hiç hareket edemez.',
    zombieIntro:'🧟\u200d♂️ Eyvah — komik ama bulaşıcı bir zombi atom! Ona değen her şey de zombiye dönüşür, en fazla 2 kez. Ateş bir zombiyi tedavi edip normale döndürebilir!',
    mechanicBriefingHeading:'Yeni mekanik geliyor!',mechanicBriefingSub:'Başlamadan önce hızlı bir bilgi:',mechanicBriefingGo:'Anladım, başlayalım! ▶',
    frozenTitle:'❄️ Donmuş atom',frozenDesc:'Donmuş atom hareket etmez. Molekülü çevresinde kur veya yanına ateş atomu getirerek buzu erit.',
    fireTitle:'🔥 Ateş atomu',fireDesc:'Ateş atomu hemen yanındaki donmuş atomu eritir. Yolu açmak için ikisini temas ettir.',
    lightningTitle:'⚡ Elektrik yüklü atom',lightningDesc:'⚡ işareti atomun elektrik yüklü olduğunu gösterir. Bağlı bir atom grubuna değdiğinde enerji zincir boyunca ilerler ve ulaştığı tüm donmuş atomları çözer.',
    stickyTitle:'🧲 Yapışkan atom',stickyDesc:'Ona temas eden atom temas noktasında yapışır. Hamle yapmadan önce kaymanın nerede biteceğini kontrol et.',
    zombieTitle:'🧟‍♂️ Zombi atom',zombieDesc:'Temas ettiği atomlara en fazla iki kez bulaşır. Ateş atomu enfekte atomları normale döndürür.',
    oneWayTitle:'↪️ Tek yönlü kare',oneWayDesc:'Oka doğru kayan bir atom sadece o yönde devam edebilir — geldiği yöne asla geri dönemez.',
    hammerTitle:'🧱 Kırılabilir duvar + 🔨 Çekiç',hammerDesc:'Bu duvar yolunu kapatır, ekranın altındaki ÇEKİÇ aracıyla kırana kadar. Her seviyede sınırlı sayıda çekiçin var, akıllıca kullan.',
    portalTitle:'🌀 Portal',portalDesc:'Bir atomu portala kaydır, anında tahtanın başka bir yerindeki eşleşen portaldan çıkar.',
    movingWallTitle:'🚧 Hareketli duvar',movingWallDesc:'Bu duvar hamlelerinle birlikte yeni bir konuma kayar. Desenini izle ve kaydırmanı ona göre zamanla.',
    pressureDoorTitle:'🔘 Basınç kapısı',pressureDoorDesc:'Parlayan düğmenin üzerine bir atom getir, tahtanın başka bir yerindeki bağlı kapı açılsın.',
    fragileTitle:'💎 Kırılgan atom',fragileDesc:'Her sert duruşta çatlar. Üçüncü darbede parçalanır ve deney yeniden başlar. Üçüncü darbe molekülü tamamlıyorsa önce bölüm kazanılır.',
    linkedTitle:'🔗 Bağlı atomlar',linkedDesc:'İşaretli iki atom aynı yönde birlikte hareket eder. Kaydırmadan önce İKİ atomun yolunun da açık olduğunu kontrol et.',
    precisionTitle:'🎯 1 Kare Taşı (isteğe bağlı)',precisionDesc:'Bu ana görev değil, isteğe bağlı bir güçlendiricidir. Etkinleştir, atomu seç ve yön ver; atom tam olarak BİR kare ilerler.',classicCatalystTitle:'🧪 Katalizör Avı görevi',classicCatalystDesc:'Önce üstte gösterilen Katalizör, Enerji Hücresi ve Stabilizatörü topla. Üçü de onay işareti alınca hedef molekülü tamamla.',classicChainTitle:'⚡ Zincir Reaksiyonu görevi',classicChainDesc:'Bu, atomun üzerindeki ⚡ elektrik yükünden farklıdır. Parlayan doğru hamleyi yap; seri otomatik ilerler ve Combo x2 / x3 oluşturur.',classicReactorTitle:'☢️ Reaktör lazerleri',classicReactorDesc:'Lazerin güvenli fazında hareket et. Temas edersen Darbe sayacı artar; Reaktör Kaçışında ayrıca +3 saniye ceza eklenir.',
    zombieMsg:'🧟‍♂️ Bulaştı! O atom artık zombi oldu...',
    cureMsg:'🔥✨ Tedavi oldu! Zombi normale döndü!',
    meltMsg:'🔥💧 Cızırt! Buz eridi — o atom artık serbest, hareket edebilir!',
    undiscoveredFact:'Bu molekülü keşfetmek için oynamaya devam et!',
    undiscoveredName:'???',
    undo:'GERİ AL',hint:'İPUCU',restart:'YENİDEN',lab:'LAB',molecules:'MOLEKÜLLER',
    moves:(m,p)=>'HAMLE '+m+' · PAR '+p,
    level:i=>'BÖLÜM '+i,
    allComplete:'🏆 TÜM BÖLÜMLER TAMAMLANDI! 🏆',
    levelDone:i=>'BÖLÜM '+i+' TAMAMLANDI!',
    bestClaimed:'En iyi skor zaten alındı',
    nextLevel:'SONRAKİ BÖLÜM ▶︎',playAgain:'🔄 TEKRAR OYNA',
    dailyTitle:'🔬 GÜNÜN DENEYİ',
    dailyAlready:'Bugünün jeton ödülü alındı — RP skorunu geliştirmek için tekrar oyna!',
    dailySolved:'Çözüldü! Bugünkü RP skorunu geliştirebilir veya yarın tekrar gelebilirsin.',
    dailyPractice:'Antrenman turu — bonus yok',
    dailyOffline:'Çevrimdışı — bu antrenmandı, bugünkü ödülü almak için bağlanınca tekrar dene.',
    dailyPracticeAgain:'🔄 TEKRAR DENE',
    mainMenu:'ANA MENÜ',
    newGameTitle:'YENİ OYUN',
    newGameMsg:(cur,coins)=>'Kayıtlı ilerlemen var ('+cur+' bölüm açık, '+coins+' <span class="coinIcon"></span>).',
    playFrom1:'▶︎ 1. BÖLÜMDEN BAŞLA',wipe:'🗑️ YENİDEN BAŞLA',cancel:'VAZGEÇ',
    settingsTitle:'AYARLAR',showDpad:'🕹️ D-Pad Göster',language:'🌐 Dil',tutorialTipsLabel:'Eğitim ipuçları',tutorialTipsNote:'Yeni mekanikler ilk karşılaşmada bir kez açıklanır.',reduceMotionLabel:'Hareketi azalt',reduceMotionNote:'Zoom, titreşim ve yoğun efektleri azaltır.',duelEffectsLabel:'Düello efektleri',duelEffectsNote:'Rakip uyarıları ve ekran efektleri.',duelMessagesLabel:'Düello mesajları',duelMessagesNote:'Hazır mesajları göster veya sustur.',hapticsLabel:'Titreşim',hapticsNote:'Kısa dokunsal geri bildirim.',largeTextLabel:'Büyük yazı',largeTextNote:'Menü ve açıklama yazılarını büyütür.',colorBlindLabel:'Renk körlüğü desteği',colorBlindNote:'Renklerin yanında daha güçlü simge ve kenarlar kullanır.',highContrastLabel:'Yüksek kontrast',highContrastNote:'Yazı, kart ve buton ayrımını güçlendirir.',effectIntensityLabel:'Efekt yoğunluğu',effectLow:'Düşük',effectNormal:'Normal',effectHigh:'Yüksek',performanceModeLabel:'Performans modu',performanceModeNote:'Otomatik, düşük güç veya yüksek kalite.',performanceAuto:'Otomatik',performanceLow:'Düşük güç',performanceHigh:'Yüksek kalite',resetProgress:'⟲ İlerlemeyi Sıfırla',deleteCloudOnly:'☁ Sadece Bulut Verisini Sil',
    resetProgress:'İLERLEMEYİ SIFIRLA',close:'KAPAT',
    deleteCloudBtn:'BULUT VERİMİ SİL',privacyLink:'Gizlilik Politikası',termsLink:'Kullanım Şartları',nameRulesLink:'İsim Kuralları',
    deleteCloudTitle:'Bulut verisi silinsin mi?',
    deleteCloudWarn:'Bu oyuncu profilinin bulut yedeğini kalıcı olarak siler. Bu cihazdaki yerel ilerlemen etkilenmez. Bu işlem geri alınamaz.',
    yesDeleteCloud:'Evet, bulut verimi sil',deleting:'Siliniyor…',
    deleteCloudDone:'Bulut verisi silindi.',deleteCloudFailed:'Bulut verisi silinemedi — bağlantını kontrol edip tekrar dene.',
    aboutTitle:'ℹ️ HAKKINDA',
    aboutBody:'© 2026 Orhan Akyol - wHiTeWaY studio<br><br>📧 Destek: <a href="mailto:moleculoxsupport@gmail.com" style="color:#9d7bff">moleculoxsupport@gmail.com</a><br>✉️ İletişim: <a href="mailto:oakyol82@hotmail.com" style="color:#9d7bff">oakyol82@hotmail.com</a><br>📸 Instagram: <a href="https://www.instagram.com/whitewayw/" target="_blank" rel="noopener noreferrer" style="color:#9d7bff">@wHiTeWaYw</a><br>🎮 Resmî Web Sayfası: <a href="https://whitewayhan.itch.io/moleculox" target="_blank" rel="noopener noreferrer" style="color:#9d7bff">whitewayhan.itch.io/moleculox</a><br>🌐 Doğrudan Web: <a href="https://moleculox.netlify.app" target="_blank" rel="noopener noreferrer" style="color:#9d7bff">moleculox.netlify.app</a>',
    rank0:'🧪 Laboratuvar Asistanı',rank1:'🔬 Bilim Asistanı',rank2:'⚗️ Bilim İnsanı',rank3:'🥼 Kıdemli Bilim İnsanı',rank4:'🎓 Doktor',rank5:'📚 Profesör',rank6:'🌟 Usta Profesör',rank7:'🚀 Nobel Yolunda',rank8:'🏅 Nobel Adayı',
    rankUpTitle:'TERFİ ETTİN!',
    rankUpMsg:r=>'Artık '+r+' oldun!',
    rankUpEinstein:['Laboratuvarın seninle birlikte büyüyor! 🔬','Şu hale bak — yükseldik! 🎉','Her büyük bilim insanı daha büyük bir laboratuvarı hak eder! 🧪'],
    rankUpContinue:'DEVAM ET ▶︎',
    audioSettings:'SES AYARLARI',master:'🔉 Genel',music:'🎵 Müzik',sfx:'🔔 Efekt',externalMusicLabel:'🎧 Harici Müzik Modu',externalMusicNote:'Spotify / YouTube Music çalmaya devam eder. Oyun sesi kapanır.',
    musicListBtn:'🎵 MÜZİKLER',musicListTitle:'🎵 MÜZİKLER',trackLabel:i=>trackName(i-1),
    areYouSure:'EMİN MİSİN?',wipeWarn:'Tüm yıldızlar, jetonlar ve moleküller silinecek!',
    yesWipe:'EVET, SİL',langEN:'English',langTR:'Türkçe',langDE:'Deutsch',langES:'Español',langPT:'Português',langJA:'日本語'
  }
};

I18N.de=Object.assign({},I18N.en,{
  dirN:['nach oben','nach rechts','nach unten','nach links'],
  tipL:'Dieses Molekül ist L-förmig! Schiebe zuerst das mittlere Knick-Atom in eine Ecke — es braucht zwei Wände, um dort zu stoppen. 📐',
  tipMid:'Baue zuerst das mittlere Paar als Rückgrat und setze danach die Seitenatome an!',
  tipCenter:'Platziere zuerst das Zentralatom im freien Raum und füge danach die Seitenatome an!',
  tip2:'Nutze Wände als Bremsen — Atome stoppen erst, wenn sie auf etwas treffen! 🧱',
  tip3:'Platziere zuerst das mittlere Atom und bringe danach die Enden heran!',
  tipChain:'Baue die Kette von innen nach außen; hebe dir die Endatome für zuletzt auf!',
  almostOneBond:'Nur noch eine Bindung! Fast geschafft! 🔥',sleeping:'Zzz … weck mich mit einem Zug! 😴',
  dailyIntro:'Das heutige Molekül — zeig, was du kannst! 🔬',
  nobelIntro:'Meine persönliche Herausforderung! 🧠 Noch niemand hat diesen Ring geschlossen — schaffst du es?',
  firstDiscover:txt=>'',
  targetLine:(g,n,f)=>g+'Ziel: <b>'+n+'</b> ('+f+') '+rnd(['🧪','⚛️','🔬','✨']),
  firstSlide:'Sehr gut! Atome gleiten, bis sie auf etwas treffen! 🧊',
  hint15:'Schon 15 Hinweise … kein Problem, dafür bin ich da! 😉',
  hint50:'50 Hinweise?! Wir sind vielleicht ein wenig von mir abhängig geworden … ich fühle mich geschmeichelt! 😏',
  hintDir:(e,dir,ar)=>'✅ Sicherer Zug: Schiebe das <b>'+e+'</b>-Atom im leuchtenden Kreis <b>'+dir+'</b> '+ar+' — das bringt dich der Lösung einen Schritt näher!',
  hintRestartFirst:'Tippe zuerst auf 🔄 NEUSTART, dann zeige ich dir den Eröffnungszug! 😉',
  paidHintTitle:'💡 BRAUCHST DU MEHR HILFE?',paidHintMsg:c=>'Du hast '+c+' 🪙. Gib einige aus, wenn du feststeckst!',
  paidHint50:'⚡ EIN WEITERER ZUG — 50 🪙',paidHint200:'🏆 REST LÖSEN — 200 🪙',
  hintNoSolve:'Hmm, versuche 🔄 NEUSTART — von hier aus finde ich keinen Weg! 😅',
  hintTryUndo:'Diese genaue Stellung kenne ich nicht. Tippe ein paarmal auf ↩ RÜCKGÄNGIG, bis du wieder an einer bekannten Stelle bist, und frag mich erneut — diesmal kostet es keine Münzen! 🔄',
  paidHintPlaying:'Pass gut auf — ein Genie bei der Arbeit! ✨',
  streak3:'Drei perfekte Lösungen in Folge! Bist vielleicht DU hier das Genie? 🤩',streak7:'Sieben perfekte Lösungen hintereinander?! Ich muss es wohl schwieriger machen … 😳',
  musicStatus:(st,err)=>'Musik: '+st+(err?(' · fehlerhafter Titel: '+err):''),
  tutTurn:'Jetzt bist du dran! Wische ein Atom oder tippe es an und nutze das Steuerkreuz. 🔬',
  tutSlideMsg:'Sehr gut! Schiebe jetzt mit dem Steuerkreuz ▶ oder durch Wischen!',skipTutorial:'ÜBERSPRINGEN ›',howToPlay:'SPIELANLEITUNG',
  tut1:'Hallo, ich bin Dr. E! Dieses Molekül müssen wir bauen.',tut2:'Tippe auf das leuchtende Atom, um es auszuwählen.',
  tut3:'Atome gleiten weiter, bis eine Wand oder ein anderes Atom sie stoppt. Wische in Pfeilrichtung!',
  tut4:'Nutze Wände und andere Atome als Stopper. Nur noch ein Schub!',tut5:'Perfekt! Du hast genau die Form auf der Zielkarte gebaut.',
  tut6:'Weniger Züge und schnellere Lösungen bringen mehr Sterne — bis zu 3!',tut7a:'Rückgängig nimmt deinen letzten Zug zurück.',
  tut7b:'Neustart beginnt das Experiment von vorn.',tut7c:'Nutze einen Hinweis, wenn du feststeckst — er kostet Münzen; jetzt geben wir keine aus.',
  tut7d:'Verdiene MoleCoins durch abgeschlossene Level. Nutze sie für Hinweise, den Hammer und besondere Laborverbesserungen.',
  tut8:'Jetzt bist du dran, Wissenschaftler. Schließe das Experiment ab!',tut8hint:'Tipp: Tippe ein Atom an und wische es dann zum anderen Atom.',
  tut9:'Ausgezeichnet! Das Labor ist bereit für dich.',tutRewardToast:'Tutorial abgeschlossen! +15 🪙',goodLuck:'Viel Erfolg! 🍀',
  tutBubble:'👋 Tippe ein Atom <b>AN</b> und <b>WISCHE</b>, um es zu schieben! Bringe zwei Atome zusammen, damit sie eine Bindung bilden.',
  tutGoal:'Baue das Molekül aus dem ZIEL nach!',nobelTitle:'DU BIST NOBELPREIS-KANDIDAT!',nobelSub:'Die Kampagne ist abgeschlossen. Der Nobelpreis selbst wird in der Weltrangliste gewonnen. — Dr. E',
  goal:'ZIEL',letsPlay:'LOS GEHT’S! ▶',newGame:'✦ NEUES SPIEL',continueBtn:'▶︎ FORTSETZEN',levels:'LEVEL',myMols:'🧪 MEINE MOLEKÜLE',
  continueLevel:i=>'▶︎ FORTSETZEN · LEVEL '+i,newGameLabel:'NEUES SPIEL',todaysExpLabel:'HEUTIGES EXPERIMENT',myMolsLabel:'MEINE MOLEKÜLE',
  hofLabel:'RUHMESHALLE',hofCertTitle:'AUSZEICHNUNGSURKUNDE',hofNamePh:'Namen eingeben',welcomeTitle:'Willkommen, Wissenschaftler!',
  welcomeMsg:'Wie sollen wir dich in der Ruhmeshalle nennen?',welcomeStart:'EXPERIMENT STARTEN',welcomeDefaultName:'Unbekannter Wissenschaftler',
  whosPlaying:'WER SPIELT?',newPlayerBtn:'+ NEUER SPIELER',switchPlayerTip:'Spieler wechseln',managePlayers:'👥 SPIELER VERWALTEN',
  deleteProfileTitle:'Spieler löschen?',deleteProfileMsg:n=>'„'+n+'“ wird dauerhaft von diesem Gerät und aus der Cloud gelöscht. Das kann nicht rückgängig gemacht werden.',
  deleteProfileTip:'Spieler löschen',deleteProfileWorking:'Wird gelöscht …',deleteProfileDone:'Spieler dauerhaft gelöscht.',deleteProfileFailed:'Dieser Spieler konnte nicht aus der Cloud gelöscht werden. Prüfe deine Verbindung und versuche es erneut.',profileLimit:'Du kannst bis zu 5 Spieler erstellen.',
  hofStat3Stars:'3-STERNE-LEVEL',hofStatLevels:'LEVEL GESCHAFFT',hofStatMols:'MOLEKÜLE',hofStatAchv:'ERFOLGE',hofSpeedTitle:'⚡ ZEITREKORDE',hofNotYet:'Noch nicht',newRecord:'NEUER REKORD',
  hofWorldTitle:'🏆 KARRIERE-RANGLISTE',worldLoading:'Rangliste wird geladen …',worldOffline:'Die Rangliste konnte gerade nicht geladen werden. Bitte versuche es erneut.',worldEmpty:'Noch keine bestätigten Einträge — sei der Erste!',worldYou:'DU',
  securePreparing:'🔒 Bestätigte Punktzahl wird vorbereitet …',secureUnranked:'Die sichere Prüfung ist nicht verfügbar. Dieser Lauf wird lokal gespeichert, aber nicht in die Rangliste eingetragen.',secureVerified:'✅ Punktzahl vom Server bestätigt!',
  todaysExp:'🔬 HEUTIGES EXPERIMENT',myMolecules:'MEINE MOLEKÜLE',periodicTable:'⚛️ PERIODENSYSTEM',achievements:'🏆 ERFOLGE',achvShort:'AUSZEICHNUNGEN',achvLocked:'Spiele weiter, um dies freizuschalten!',
  frozenIntro:'❄️ Vorsicht — ein gefrorenes Atom! Es lässt sich nicht bewegen. Schiebe die ANDEREN Atome darum herum, um das Molekül fertigzustellen!',
  fireIntro:'🔥 Siehst du das glühende Atom? Es ist glühend heiß! Schiebe es neben das gefrorene Atom, um das Eis zu schmelzen!',
  stickyIntro:'🍯 Vorsicht — dieses Atom ist mit Klebstoff bedeckt! Alles, was es berührt, bleibt dort für immer hängen. Plane deine Züge!',
  stickMsg:'🍯 Festgeklebt! Dieses Atom kann sich nicht mehr bewegen.',
  zombieIntro:'🧟‍♂️ Oh nein — ein infiziertes Atom! Alles, was es berührt, wird ebenfalls zum Zombie. Feuer kann die Infektion heilen!',
  oneWayTitle:'↪️ Einbahn-Feld',oneWayDesc:'Ein Atom, das in Pfeilrichtung darübergleitet, kann nur in dieser Richtung weitergehen — niemals zurück.',
  hammerTitle:'🧱 Zerbrechliche Wand + 🔨 Hammer',hammerDesc:'Diese Wand blockiert den Weg, bis du sie mit dem HAMMER unten auf dem Bildschirm zerstörst. Die Anzahl der Hammer ist pro Level begrenzt.',
  portalTitle:'🌀 Portal',portalDesc:'Schiebe ein Atom in ein Portal; es erscheint sofort am passenden Portal an einer anderen Stelle des Spielfelds.',
  movingWallTitle:'🚧 Bewegliche Wand',movingWallDesc:'Diese Wand wechselt mit deinen Zügen ihre Position. Beobachte das Muster und passe den Zeitpunkt deines Zuges an.',
  pressureDoorTitle:'🔘 Druckschalter-Tür',pressureDoorDesc:'Bringe ein Atom auf den leuchtenden Schalter, damit sich die verbundene Tür an anderer Stelle öffnet.',
  fragileTitle:'💎 Zerbrechliches Atom',fragileDesc:'Bei jedem harten Aufprall bekommt es einen Riss. Beim dritten zerbricht es und das Experiment startet neu. Wird mit dem dritten Aufprall das Molekül fertig, zählt zuerst der Sieg.',
  linkedTitle:'🔗 Verbundene Atome',linkedDesc:'Die beiden markierten Atome bewegen sich gemeinsam in dieselbe Richtung. Prüfe vor dem Schieben, ob BEIDE Wege frei sind.',
  precisionTitle:'🎯 1-Feld-Bewegung (optional)',precisionDesc:'Dies ist ein optionaler Verstärker. Aktiviere ihn, wähle ein Atom und eine Richtung; das Atom bewegt sich genau EIN Feld.',
  zombieMsg:'🧟‍♂️ Infiziert! Dieses Atom ist jetzt ein Zombie …',cureMsg:'🔥✨ Geheilt! Das Zombie-Atom ist wieder normal!',meltMsg:'🔥💧 Zisch! Das Eis ist geschmolzen — das Atom kann sich wieder bewegen!',
  undiscoveredFact:'Spiele weiter, um dieses Molekül zu entdecken!',undiscoveredName:'???',undo:'RÜCKGÄNGIG',hint:'HINWEIS',restart:'NEUSTART',lab:'LABOR',molecules:'MOLEKÜLE',
  moves:(m,p)=>'ZÜGE '+m+' · VORGABE '+p,level:i=>'LEVEL '+i,allComplete:'🏆 ALLE LEVEL ABGESCHLOSSEN! 🏆',levelDone:i=>'LEVEL '+i+' ABGESCHLOSSEN!',
  bestClaimed:'Bestwert bereits erreicht',nextLevel:'NÄCHSTES LEVEL ▶︎',playAgain:'🔄 NOCH EINMAL',dailyTitle:'🔬 HEUTIGES EXPERIMENT',
  dailyAlready:'Die heutige Münzbelohnung wurde bereits abgeholt — spiele erneut, um deine RP-Punktzahl zu verbessern!',dailySolved:'Gelöst! Verbessere deine heutige RP-Punktzahl oder komm morgen wieder.',
  dailyPractice:'Übungsrunde — kein Bonus',dailyOffline:'Offline — dies war eine Übung. Verbinde dich und versuche es erneut, um die heutige Belohnung zu erhalten.',dailyPracticeAgain:'🔄 NOCH EINMAL',mainMenu:'HAUPTMENÜ',
  newGameTitle:'NEUES SPIEL',newGameMsg:(cur,coins)=>'Du hast einen Spielstand ('+cur+' Level freigeschaltet, '+coins+' <span class="coinIcon"></span>).',
  playFrom1:'▶︎ BEI LEVEL 1 STARTEN',wipe:'🗑️ NEU BEGINNEN',cancel:'ABBRECHEN',
  settingsTitle:'EINSTELLUNGEN',showDpad:'🕹️ STEUERKREUZ ANZEIGEN',language:'🌐 SPRACHE',tutorialTipsLabel:'Tutorial-Hinweise',tutorialTipsNote:'Neue Mechaniken werden beim ersten Auftreten einmal erklärt.',
  reduceMotionLabel:'Bewegung reduzieren',reduceMotionNote:'Reduziert Zoom, Vibrationen und intensive Effekte.',duelEffectsLabel:'Duell-Effekte',duelEffectsNote:'Gegnerwarnungen und Bildschirmeffekte.',
  duelMessagesLabel:'Duell-Nachrichten',duelMessagesNote:'Vorgegebene Nachrichten anzeigen oder stummschalten.',hapticsLabel:'Haptik',hapticsNote:'Kurzes taktiles Feedback.',
  largeTextLabel:'Große Schrift',largeTextNote:'Vergrößert Menü- und Hilfetexte.',colorBlindLabel:'Farbenblind-Unterstützung',colorBlindNote:'Nutzt zusätzlich zu Farben stärkere Symbole und Konturen.',
  highContrastLabel:'Hoher Kontrast',highContrastNote:'Verstärkt die Trennung zwischen Text, Karten und Schaltflächen.',effectIntensityLabel:'Effektstärke',effectLow:'Niedrig',effectNormal:'Normal',effectHigh:'Hoch',
  performanceModeLabel:'Leistungsmodus',performanceModeNote:'Automatisch, stromsparend oder hohe Qualität.',performanceAuto:'Automatisch',performanceLow:'Stromsparend',performanceHigh:'Hohe Qualität',
  resetProgress:'FORTSCHRITT ZURÜCKSETZEN',deleteCloudOnly:'☁ NUR CLOUD-DATEN LÖSCHEN',close:'SCHLIESSEN',deleteCloudBtn:'MEINE CLOUD-DATEN LÖSCHEN',
  privacyLink:'DATENSCHUTZ',termsLink:'NUTZUNGSBEDINGUNGEN',nameRulesLink:'NAMENSREGELN',deleteCloudTitle:'Cloud-Daten löschen?',
  deleteCloudWarn:'Dadurch wird die Cloud-Sicherung dieses Spielerprofils dauerhaft gelöscht. Dein lokaler Fortschritt auf diesem Gerät bleibt erhalten. Dies kann nicht rückgängig gemacht werden.',
  yesDeleteCloud:'Ja, Cloud-Daten löschen',deleting:'Wird gelöscht …',deleteCloudDone:'Cloud-Daten gelöscht.',deleteCloudFailed:'Cloud-Daten konnten nicht gelöscht werden — prüfe deine Verbindung und versuche es erneut.',
  aboutTitle:'ℹ️ ÜBER DAS SPIEL',rank0:'🧪 Laborassistent',rank1:'🔬 Wissenschaftlicher Assistent',rank2:'⚗️ Wissenschaftler',rank3:'🥼 Leitender Wissenschaftler',rank4:'🎓 Doktor',rank5:'📚 Professor',rank6:'🌟 Meisterprofessor',rank7:'🚀 Auf dem Weg zum Nobelpreis',rank8:'🏅 Nobelpreis-Kandidat',
  rankUpTitle:'BEFÖRDERUNG!',rankUpMsg:r=>'Du bist jetzt '+r+'!',rankUpEinstein:['Dein Labor wächst mit dir! 🔬','Sieh uns an — wir steigen auf! 🎉','Jeder große Wissenschaftler verdient ein größeres Labor! 🧪'],rankUpContinue:'WEITER ▶︎',
  audioSettings:'TONEINSTELLUNGEN',master:'🔉 Gesamt',music:'🎵 Musik',sfx:'🔔 Effekte',externalMusicLabel:'🎧 Externer Musikmodus',externalMusicNote:'Spotify / YouTube Music läuft weiter. Der Spielton wird ausgeschaltet.',
  musicListBtn:'🎵 MUSIK',musicListTitle:'🎵 MUSIK',trackLabel:i=>trackName(i-1),areYouSure:'BIST DU SICHER?',wipeWarn:'Alle Sterne, Münzen und Moleküle werden gelöscht!',yesWipe:'JA, LÖSCHEN',
  langEN:'English',langTR:'Türkçe',langDE:'Deutsch',langES:'Español',langPT:'Português',langJA:'日本語'
});

I18N.es=Object.assign({},I18N.en,{
  dirN:['arriba','derecha','abajo','izquierda'],goal:'OBJETIVO',letsPlay:'¡JUGAR! ▶',newGame:'✦ NUEVA PARTIDA',continueBtn:'▶︎ CONTINUAR',levels:'NIVELES',myMols:'🧪 MIS MOLÉCULAS',
  continueLevel:i=>'▶︎ CONTINUAR · NIVEL '+i,newGameLabel:'NUEVA PARTIDA',todaysExpLabel:'EXPERIMENTO DE HOY',myMolsLabel:'MIS MOLÉCULAS',hofLabel:'SALÓN DE LA FAMA',
  welcomeTitle:'¡Bienvenido, científico!',welcomeMsg:'¿Cómo debemos llamarte en el Salón de la Fama?',welcomeStart:'EMPEZAR A EXPERIMENTAR',welcomeDefaultName:'Científico anónimo',
  whosPlaying:'¿QUIÉN JUEGA?',newPlayerBtn:'+ NUEVO JUGADOR',managePlayers:'👥 GESTIONAR JUGADORES',settingsTitle:'AJUSTES',showDpad:'🕹️ Mostrar cruceta',language:'🌐 Idioma',
  tutorialTipsLabel:'Consejos del tutorial',tutorialTipsNote:'Las nuevas mecánicas se explican una vez al encontrarlas.',reduceMotionLabel:'Reducir movimiento',reduceMotionNote:'Reduce zoom, vibración y efectos intensos.',
  duelEffectsLabel:'Efectos de duelo',duelEffectsNote:'Avisos del rival y efectos de pantalla.',duelMessagesLabel:'Mensajes de duelo',duelMessagesNote:'Muestra o silencia mensajes predefinidos.',
  hapticsLabel:'Respuesta háptica',hapticsNote:'Vibración táctil breve.',largeTextLabel:'Texto grande',largeTextNote:'Amplía textos de menú y ayuda.',colorBlindLabel:'Ayuda para daltonismo',
  colorBlindNote:'Usa símbolos y contornos más fuertes además del color.',highContrastLabel:'Alto contraste',highContrastNote:'Mejora la separación entre texto, tarjetas y botones.',
  effectIntensityLabel:'Intensidad de efectos',effectLow:'Baja',effectNormal:'Normal',effectHigh:'Alta',performanceModeLabel:'Modo de rendimiento',performanceModeNote:'Automático, ahorro de energía o alta calidad.',
  performanceAuto:'Automático',performanceLow:'Ahorro de energía',performanceHigh:'Alta calidad',close:'CERRAR',cancel:'CANCELAR',mainMenu:'MENÚ PRINCIPAL',undo:'DESHACER',hint:'PISTA',restart:'REINICIAR',lab:'LABORATORIO',molecules:'MOLÉCULAS',
  skipTutorial:'SALTAR ›',howToPlay:'CÓMO JUGAR',tut1:'¡Hola, soy el Dr. E! Esta es la molécula que debemos construir.',tut2:'Toca el átomo brillante para seleccionarlo.',
  tut3:'Los átomos se deslizan hasta que una pared u otro átomo los detiene. ¡Desliza en la dirección de la flecha!',tut4:'Usa paredes y otros átomos como frenos. ¡Un empujón más!',
  tut5:'¡Perfecto! Has igualado exactamente la forma de la tarjeta Objetivo.',tut6:'Menos movimientos y soluciones más rápidas dan más estrellas — hasta 3.',
  tut7a:'Deshacer revierte tu último movimiento.',tut7b:'Reiniciar comienza el experimento desde cero.',tut7c:'Usa una pista si te atascas; cuesta monedas.',
  tut7d:'Gana MoleCoins al completar niveles. Úsalas en pistas, el martillo y mejoras especiales del laboratorio.',tut8:'Tu turno, científico. ¡Completa el experimento!',
  tut8hint:'Consejo: toca un átomo y deslízalo hacia el otro.',tut9:'¡Excelente! El laboratorio está listo para ti.',tutRewardToast:'¡Tutorial completado! +15 🪙',goodLuck:'¡Buena suerte! 🍀',
  frozenTitle:'❄️ Átomo congelado',frozenDesc:'No puede moverse. Construye a su alrededor o acerca un átomo de fuego para derretir el hielo.',fireTitle:'🔥 Átomo de fuego',fireDesc:'Derrite cualquier átomo congelado que esté justo a su lado.',
  stickyTitle:'🧲 Átomo pegajoso',stickyDesc:'Un átomo que lo toque queda fijado en ese punto.',oneWayTitle:'↪️ Casilla de un solo sentido',oneWayDesc:'Al entrar siguiendo la flecha, el átomo solo puede continuar en esa dirección.',
  hammerTitle:'🧱 Pared rompible + 🔨 Martillo',hammerDesc:'La pared bloquea el paso hasta que la rompas con el martillo. Hay pocos por nivel.',portalTitle:'🌀 Portal',portalDesc:'Un átomo entra por un portal y sale de inmediato por su pareja conectada.',
  movingWallTitle:'🚧 Pared móvil',movingWallDesc:'Cambia de posición con tus movimientos. Observa el patrón.',pressureDoorTitle:'🔘 Puerta con presión',pressureDoorDesc:'Coloca un átomo sobre el interruptor para abrir la puerta conectada.',
  fragileTitle:'💎 Átomo frágil',fragileDesc:'Se agrieta con cada choque fuerte y se rompe al tercero.',linkedTitle:'🔗 Átomos enlazados',linkedDesc:'Los dos átomos marcados se mueven juntos en la misma dirección.',
  nextLevel:'SIGUIENTE NIVEL ▶︎',playAgain:'🔄 JUGAR DE NUEVO',dailyTitle:'🔬 EXPERIMENTO DE HOY',myMolecules:'MIS MOLÉCULAS',periodicTable:'⚛️ TABLA PERIÓDICA',achievements:'🏆 LOGROS',
  audioSettings:'AJUSTES DE AUDIO',master:'🔉 General',music:'🎵 Música',sfx:'🔔 Efectos',areYouSure:'¿ESTÁS SEGURO?',yesWipe:'SÍ, BORRAR',langEN:'English',langTR:'Türkçe',langDE:'Deutsch',langES:'Español',langPT:'Português',langJA:'日本語'
});
I18N.pt=Object.assign({},I18N.en,{
  dirN:['para cima','direita','para baixo','esquerda'],goal:'OBJETIVO',letsPlay:'VAMOS JOGAR! ▶',newGame:'✦ NOVO JOGO',continueBtn:'▶︎ CONTINUAR',levels:'NÍVEIS',myMols:'🧪 MINHAS MOLÉCULAS',
  continueLevel:i=>'▶︎ CONTINUAR · NÍVEL '+i,newGameLabel:'NOVO JOGO',todaysExpLabel:'EXPERIMENTO DE HOJE',myMolsLabel:'MINHAS MOLÉCULAS',hofLabel:'HALL DA FAMA',
  welcomeTitle:'Bem-vindo, cientista!',welcomeMsg:'Como devemos chamar você no Hall da Fama?',welcomeStart:'COMEÇAR A EXPERIMENTAR',welcomeDefaultName:'Cientista anônimo',
  whosPlaying:'QUEM ESTÁ JOGANDO?',newPlayerBtn:'+ NOVO JOGADOR',managePlayers:'👥 GERENCIAR JOGADORES',settingsTitle:'CONFIGURAÇÕES',showDpad:'🕹️ Mostrar direcional',language:'🌐 Idioma',
  tutorialTipsLabel:'Dicas do tutorial',tutorialTipsNote:'Novas mecânicas são explicadas uma vez no primeiro encontro.',reduceMotionLabel:'Reduzir movimento',reduceMotionNote:'Reduz zoom, vibração e efeitos intensos.',
  duelEffectsLabel:'Efeitos de duelo',duelEffectsNote:'Alertas do oponente e efeitos de tela.',duelMessagesLabel:'Mensagens de duelo',duelMessagesNote:'Mostra ou silencia mensagens prontas.',
  hapticsLabel:'Resposta tátil',hapticsNote:'Feedback tátil curto.',largeTextLabel:'Texto grande',largeTextNote:'Aumenta textos de menu e ajuda.',colorBlindLabel:'Suporte a daltonismo',colorBlindNote:'Usa símbolos e contornos fortes além das cores.',
  highContrastLabel:'Alto contraste',highContrastNote:'Aumenta a separação entre textos, cartões e botões.',effectIntensityLabel:'Intensidade dos efeitos',effectLow:'Baixa',effectNormal:'Normal',effectHigh:'Alta',
  performanceModeLabel:'Modo de desempenho',performanceModeNote:'Automático, economia de energia ou alta qualidade.',performanceAuto:'Automático',performanceLow:'Economia de energia',performanceHigh:'Alta qualidade',
  close:'FECHAR',cancel:'CANCELAR',mainMenu:'MENU PRINCIPAL',undo:'DESFAZER',hint:'DICA',restart:'REINICIAR',lab:'LABORATÓRIO',molecules:'MOLÉCULAS',skipTutorial:'PULAR ›',howToPlay:'COMO JOGAR',
  tut1:'Olá, sou o Dr. E! Esta é a molécula que precisamos construir.',tut2:'Toque no átomo brilhante para selecioná-lo.',tut3:'Os átomos deslizam até uma parede ou outro átomo pará-los. Deslize na direção da seta!',
  tut4:'Use paredes e outros átomos como freios. Só mais um empurrão!',tut5:'Perfeito! Você reproduziu exatamente a forma do cartão Objetivo.',tut6:'Menos movimentos e soluções rápidas rendem mais estrelas — até 3.',
  tut7a:'Desfazer reverte seu último movimento.',tut7b:'Reiniciar começa o experimento do zero.',tut7c:'Use uma dica se ficar preso; ela custa moedas.',tut7d:'Ganhe MoleCoins ao concluir níveis. Use-as em dicas, no martelo e em melhorias do laboratório.',
  tut8:'Sua vez, cientista. Conclua o experimento!',tut8hint:'Dica: toque em um átomo e deslize-o em direção ao outro.',tut9:'Excelente! O laboratório está pronto para você.',tutRewardToast:'Tutorial concluído! +15 🪙',goodLuck:'Boa sorte! 🍀',
  frozenTitle:'❄️ Átomo congelado',frozenDesc:'Não pode se mover. Construa ao redor dele ou aproxime um átomo de fogo para derreter o gelo.',fireTitle:'🔥 Átomo de fogo',fireDesc:'Derrete qualquer átomo congelado ao lado.',
  stickyTitle:'🧲 Átomo pegajoso',stickyDesc:'Um átomo que o toca fica preso naquele ponto.',oneWayTitle:'↪️ Piso de mão única',oneWayDesc:'Ao entrar seguindo a seta, o átomo só pode continuar nessa direção.',
  hammerTitle:'🧱 Parede quebrável + 🔨 Martelo',hammerDesc:'A parede bloqueia o caminho até ser quebrada com o martelo. A quantidade é limitada por nível.',portalTitle:'🌀 Portal',portalDesc:'Um átomo entra em um portal e sai imediatamente no portal conectado.',
  movingWallTitle:'🚧 Parede móvel',movingWallDesc:'Muda de posição conforme seus movimentos. Observe o padrão.',pressureDoorTitle:'🔘 Porta de pressão',pressureDoorDesc:'Coloque um átomo no interruptor para abrir a porta conectada.',
  fragileTitle:'💎 Átomo frágil',fragileDesc:'Racha a cada colisão forte e quebra na terceira.',linkedTitle:'🔗 Átomos ligados',linkedDesc:'Os dois átomos marcados se movem juntos na mesma direção.',
  nextLevel:'PRÓXIMO NÍVEL ▶︎',playAgain:'🔄 JOGAR DE NOVO',dailyTitle:'🔬 EXPERIMENTO DE HOJE',myMolecules:'MINHAS MOLÉCULAS',periodicTable:'⚛️ TABELA PERIÓDICA',achievements:'🏆 CONQUISTAS',
  audioSettings:'CONFIGURAÇÕES DE ÁUDIO',master:'🔉 Geral',music:'🎵 Música',sfx:'🔔 Efeitos',areYouSure:'TEM CERTEZA?',yesWipe:'SIM, APAGAR',langEN:'English',langTR:'Türkçe',langDE:'Deutsch',langES:'Español',langPT:'Português',langJA:'日本語'
});
I18N.ja=Object.assign({},I18N.en,{
  dirN:['上','右','下','左'],goal:'目標',letsPlay:'プレイ開始！▶',newGame:'✦ ニューゲーム',continueBtn:'▶︎ 続ける',levels:'レベル',myMols:'🧪 マイ分子',continueLevel:i=>'▶︎ 続ける・レベル '+i,
  newGameLabel:'ニューゲーム',todaysExpLabel:'今日の実験',myMolsLabel:'マイ分子',hofLabel:'殿堂',welcomeTitle:'ようこそ、科学者！',welcomeMsg:'殿堂では何とお呼びしましょう？',welcomeStart:'実験を始める',welcomeDefaultName:'匿名の科学者',
  whosPlaying:'プレイヤーを選択',newPlayerBtn:'+ 新しいプレイヤー',managePlayers:'👥 プレイヤー管理',settingsTitle:'設定',showDpad:'🕹️ 十字キーを表示',language:'🌐 言語',
  tutorialTipsLabel:'チュートリアルのヒント',tutorialTipsNote:'新しい仕組みは最初に一度だけ説明されます。',reduceMotionLabel:'動きを減らす',reduceMotionNote:'ズーム、振動、強い演出を減らします。',
  duelEffectsLabel:'デュエル演出',duelEffectsNote:'対戦相手の通知と画面演出。',duelMessagesLabel:'デュエルメッセージ',duelMessagesNote:'定型メッセージの表示を切り替えます。',
  hapticsLabel:'触覚フィードバック',hapticsNote:'短い振動を使用します。',largeTextLabel:'大きな文字',largeTextNote:'メニューとヘルプの文字を大きくします。',colorBlindLabel:'色覚サポート',colorBlindNote:'色に加えて記号と輪郭を強調します。',
  highContrastLabel:'高コントラスト',highContrastNote:'文字、カード、ボタンを見分けやすくします。',effectIntensityLabel:'エフェクト強度',effectLow:'低',effectNormal:'標準',effectHigh:'高',
  performanceModeLabel:'パフォーマンスモード',performanceModeNote:'自動、省電力、高画質から選べます。',performanceAuto:'自動',performanceLow:'省電力',performanceHigh:'高画質',close:'閉じる',cancel:'キャンセル',mainMenu:'メインメニュー',
  undo:'元に戻す',hint:'ヒント',restart:'やり直す',lab:'研究室',molecules:'分子',skipTutorial:'スキップ ›',howToPlay:'遊び方',tut1:'こんにちは、Dr. Eだ！この分子を作ろう。',tut2:'光っている原子をタップして選択しよう。',
  tut3:'原子は壁か別の原子に当たるまで滑り続ける。矢印の方向へスワイプしよう！',tut4:'壁や他の原子をストッパーとして使おう。あと一押し！',tut5:'完璧！目標カードと同じ形になった。',
  tut6:'少ない手数と速いクリアで、最大3つ星を獲得できる。',tut7a:'「元に戻す」で直前の手を取り消せる。',tut7b:'「やり直す」で実験を最初から始める。',tut7c:'困ったらヒントを使おう。コインが必要だ。',
  tut7d:'レベルをクリアしてMoleCoinを獲得し、ヒント、ハンマー、研究室の強化に使おう。',tut8:'君の番だ、科学者。実験を完成させよう！',tut8hint:'ヒント：原子をタップして、もう一方へスワイプしよう。',
  tut9:'素晴らしい！研究室の準備は整った。',tutRewardToast:'チュートリアル完了！+15 🪙',goodLuck:'幸運を！🍀',frozenTitle:'❄️ 凍結原子',frozenDesc:'凍結原子は動かない。周りに組み立てるか、炎原子を隣に置いて溶かそう。',
  fireTitle:'🔥 炎原子',fireDesc:'隣接する凍結原子を溶かす。',stickyTitle:'🧲 粘着原子',stickyDesc:'触れた原子はその接点に固定される。',oneWayTitle:'↪️ 一方通行マス',oneWayDesc:'矢印方向に入ると、その方向にしか進めない。',
  hammerTitle:'🧱 壊せる壁 + 🔨 ハンマー',hammerDesc:'ハンマーで壊すまで道を塞ぐ。各レベルで使用回数に限りがある。',portalTitle:'🌀 ポータル',portalDesc:'原子は片方のポータルに入り、対応するもう片方から出る。',
  movingWallTitle:'🚧 移動する壁',movingWallDesc:'手を動かすたびに位置が変わる。パターンを見極めよう。',pressureDoorTitle:'🔘 圧力スイッチ扉',pressureDoorDesc:'スイッチに原子を置くと、連動する扉が開く。',
  fragileTitle:'💎 壊れやすい原子',fragileDesc:'強く衝突するたびにひびが入り、3回目で壊れる。',linkedTitle:'🔗 連結原子',linkedDesc:'印の付いた2つの原子は同じ方向へ一緒に動く。',
  nextLevel:'次のレベル ▶︎',playAgain:'🔄 もう一度',dailyTitle:'🔬 今日の実験',myMolecules:'マイ分子',periodicTable:'⚛️ 周期表',achievements:'🏆 実績',audioSettings:'サウンド設定',master:'🔉 全体',music:'🎵 音楽',sfx:'🔔 効果音',
  areYouSure:'本当によろしいですか？',yesWipe:'はい、削除する',langEN:'English',langTR:'Türkçe',langDE:'Deutsch',langES:'Español',langPT:'Português',langJA:'日本語'
});

// V8.5.47 · complete special-mechanic localization. These keys used to
// fall back to English in some languages, which made first-use help feel
// inconsistent and caused the Reactor counter to display the wrong word.
Object.assign(I18N.de,{
  frozenTitle:'❄️ Gefrorenes Atom',frozenDesc:'Ein gefrorenes Atom kann sich nicht bewegen. Baue das Molekül darum herum oder bringe ein Feueratom daneben, um das Eis zu schmelzen.',
  fireTitle:'🔥 Feueratom',fireDesc:'Ein Feueratom schmilzt ein direkt benachbartes gefrorenes Atom und macht es wieder beweglich.',
  stickyTitle:'🧲 Klebriges Atom',stickyDesc:'Ein Atom, das es berührt, bleibt an diesem Kontaktpunkt fest und kann sich nicht wieder lösen.',
  lightningTitle:'⚡ Elektrisch geladenes Atom',lightningDesc:'Das ⚡-Zeichen zeigt elektrische Ladung. Berührt das Atom eine verbundene Atomgruppe, läuft der Impuls durch die Kette und taut erreichte gefrorene Atome auf.',
  zombieTitle:'🧟 Zombie-Atom',zombieDesc:'Steckt berührende Atome an. Ein Feueratom heilt die Infektion.',
  precisionTitle:'🎯 Ein-Feld-Zug (optional)',precisionDesc:'Ein optionaler Helfer: aktivieren, Atom wählen und eine Richtung angeben. Das Atom bewegt sich genau ein Feld.',
  classicCatalystTitle:'🧪 Katalysator-Mission',classicCatalystDesc:'Sammle zuerst Katalysator, Energiezelle und Stabilisator. Vervollständige danach das Zielmolekül.',
  classicChainTitle:'⚡ Kettenreaktion',classicChainDesc:'Dies ist etwas anderes als die ⚡-Ladung auf einem Atom. Führe den leuchtenden richtigen Zug aus; die Folge läuft automatisch weiter und bildet Combo x2 / x3.',
  classicReactorTitle:'☢️ Reaktor-Laser',classicReactorDesc:'Bewege dich in der sicheren Laserphase. Kontakt erhöht den Trefferzähler; in Reactor Escape kommen zusätzlich 3 Sekunden Strafe hinzu.'
});
Object.assign(I18N.es,{
  lightningTitle:'⚡ Átomo con carga eléctrica',lightningDesc:'El símbolo ⚡ indica carga eléctrica. Al tocar un grupo de átomos conectados, el pulso recorre la cadena y descongela los átomos congelados que alcanza.',
  zombieTitle:'🧟 Átomo zombi',zombieDesc:'Infecta a los átomos que toca. Un átomo de fuego cura la infección.',
  precisionTitle:'🎯 Movimiento de una casilla (opcional)',precisionDesc:'Ayuda opcional: actívala, selecciona un átomo y una dirección. El átomo avanza exactamente una casilla.',
  classicCatalystTitle:'🧪 Misión de catalizador',classicCatalystDesc:'Recoge primero el Catalizador, la Celda de Energía y el Estabilizador. Después completa la molécula objetivo.',
  classicChainTitle:'⚡ Reacción en cadena',classicChainDesc:'Esto es distinto de la carga ⚡ de un átomo. Haz el movimiento correcto que brilla; la secuencia continúa automáticamente y forma Combo x2 / x3.',
  classicReactorTitle:'☢️ Láseres del reactor',classicReactorDesc:'Muévete durante la fase segura. El contacto aumenta el contador de impactos; en Reactor Escape también añade 3 segundos de penalización.'
});
Object.assign(I18N.pt,{
  lightningTitle:'⚡ Átomo com carga elétrica',lightningDesc:'O símbolo ⚡ indica carga elétrica. Ao tocar um grupo de átomos ligados, o pulso percorre a cadeia e descongela os átomos alcançados.',
  zombieTitle:'🧟 Átomo zumbi',zombieDesc:'Infecta os átomos que toca. Um átomo de fogo cura a infecção.',
  precisionTitle:'🎯 Movimento de uma casa (opcional)',precisionDesc:'Ajuda opcional: ative, escolha um átomo e uma direção. O átomo avança exatamente uma casa.',
  classicCatalystTitle:'🧪 Missão do catalisador',classicCatalystDesc:'Colete primeiro o Catalisador, a Célula de Energia e o Estabilizador. Depois complete a molécula-alvo.',
  classicChainTitle:'⚡ Reação em cadeia',classicChainDesc:'Isto é diferente da carga ⚡ em um átomo. Faça o movimento correto brilhante; a sequência continua automaticamente e cria Combo x2 / x3.',
  classicReactorTitle:'☢️ Lasers do reator',classicReactorDesc:'Mova-se durante a fase segura. O contato aumenta o contador de impactos; no Reactor Escape também adiciona 3 segundos de penalidade.'
});
Object.assign(I18N.ja,{
  lightningTitle:'⚡ 帯電原子',lightningDesc:'⚡は電気を帯びた原子の印です。連結した原子群に触れると電気が鎖を伝わり、到達した凍結原子を解凍します。',
  zombieTitle:'🧟 ゾンビ原子',zombieDesc:'触れた原子に感染します。炎原子で治療できます。',
  precisionTitle:'🎯 1マス移動（任意）',precisionDesc:'任意の補助機能です。有効化して原子と方向を選ぶと、原子がちょうど1マス移動します。',
  classicCatalystTitle:'🧪 触媒ミッション',classicCatalystDesc:'最初に触媒、エネルギーセル、安定化装置を集め、その後で目標分子を完成させます。',
  classicChainTitle:'⚡ 連鎖反応',classicChainDesc:'これは原子上の⚡電荷とは別の仕組みです。光る正しい手を選ぶと連鎖が自動で続き、Combo x2 / x3になります。',
  classicReactorTitle:'☢️ リアクターレーザー',classicReactorDesc:'レーザーの安全な時間に移動します。接触すると衝突カウンターが増え、Reactor Escapeではさらに3秒のペナルティが加わります。'
});


// V8.5.52: clarified board symbols and objectives. These final overrides
// keep the exact same wording in first-use cards, Training Center and the
// current-level help panel.
Object.assign(I18N.en,{
  hammerDesc:'The cracked wall marked with a small hammer blocks the route. Select HAMMER, then tap that wall; real use consumes 1 hammer.',
  portalDesc:'Portals are marked A and B. Stop an atom on one portal to send it to the empty matching portal.',
  movingWallDesc:'The wall marked ↔ moves to the next rail position after each completed move. Plan for where it will be next.',
  pressureDoorDesc:'The round switch and its door share the same letter. The transparent striped square is an OPEN door; when the atom leaves the switch, it becomes a solid wall again.',
  fragileDesc:'The number beside the diamond shows remaining hard impacts. Each hard stop removes one; at zero it shatters and the experiment restarts.',
  linkedDesc:'Atoms joined by the animated dotted line move together in the same direction. BOTH routes must be clear.',
  classicCatalystDesc:'Collect the three board symbols — Catalyst, Energy Cell, and Stabilizer. Their counters at the top turn into check marks; then complete the molecule.',
  classicChainDesc:'This is not the ⚡ charge on an atom. Make the glowing move; the following moves run automatically and raise Combo x2 / x3.',
  classicReactorDesc:'Move while the laser is dim/off. Touching an active beam raises the Impact counter; Reactor Escape also adds 3 seconds.'
});
Object.assign(I18N.tr,{
  hammerDesc:'Üzerinde küçük çekiç işareti bulunan çatlak duvar yolu kapatır. ÇEKİÇ aracını seçip o duvara dokun; gerçek kullanımda 1 çekiç harcanır.',
  portalDesc:'Portallar A ve B harfiyle işaretlidir. Bir atomu portalın üzerinde durdurunca boş olan eş portala ışınlanır.',
  movingWallDesc:'Üzerinde ↔ işareti olan duvar, tamamlanan her hamleden sonra rayındaki sonraki konuma geçer. Bir sonraki yerini hesaba kat.',
  pressureDoorDesc:'Yuvarlak düğme ile kapı aynı harfi taşır. Şeffaf çizgili kare AÇIK kapıdır; atom düğmeden ayrılınca yeniden katı duvar olur.',
  fragileDesc:'Elmasın yanındaki sayı kalan sert darbe hakkını gösterir. Her sert duruşta bir azalır; sıfırda parçalanır ve deney yeniden başlar.',
  linkedDesc:'Hareketli noktalı çizgiyle bağlı atomlar aynı yönde birlikte gider. İKİ yolun da açık olması gerekir.',
  classicCatalystDesc:'Tahtadaki üç simgeyi — Katalizör, Enerji Hücresi ve Stabilizatör — topla. Üst sayaçlar onay işaretine dönünce hedef molekülü tamamla.',
  classicChainDesc:'Bu, atom üzerindeki ⚡ yük değildir. Parlayan hamleyi yap; sonraki hamleler otomatik ilerler ve Combo x2 / x3 yükselir.',
  classicReactorDesc:'Lazer soluk/kapalıyken hareket et. Aktif ışına temas Darbe sayacını artırır; Reaktör Kaçışında ayrıca 3 saniye ekler.'
});
Object.assign(I18N.de,{
  hammerDesc:'Die rissige Wand mit dem kleinen Hammerzeichen blockiert den Weg. Wähle HAMMER und tippe auf diese Wand; der echte Einsatz verbraucht 1 Hammer.',
  portalDesc:'Portale sind mit A und B markiert. Hält ein Atom auf einem Portal, gelangt es zum freien passenden Portal.',
  movingWallDesc:'Die mit ↔ markierte Wand wechselt nach jedem abgeschlossenen Zug zur nächsten Position ihrer Schiene.',
  pressureDoorDesc:'Schalter und Tür tragen denselben Buchstaben. Das transparente gestreifte Feld ist eine OFFENE Tür; verlässt das Atom den Schalter, wird es wieder zur festen Wand.',
  fragileDesc:'Die Zahl am Diamanten zeigt die verbleibenden harten Aufpralle. Bei null zerbricht das Atom und das Experiment startet neu.',
  linkedDesc:'Atome mit der bewegten gestrichelten Linie bewegen sich gemeinsam in dieselbe Richtung. BEIDE Wege müssen frei sein.',
  classicCatalystDesc:'Sammle die drei Symbole Katalysator, Energiezelle und Stabilisator. Wenn oben drei Häkchen stehen, vervollständige das Molekül.',
  classicChainDesc:'Das ist nicht die ⚡-Ladung eines Atoms. Führe den leuchtenden Zug aus; die Folge läuft automatisch und erhöht Combo x2 / x3.',
  classicReactorDesc:'Bewege dich, wenn der Laser dunkel/aus ist. Ein aktiver Strahl erhöht Treffer; in Reactor Escape kommen 3 Sekunden hinzu.'
});
Object.assign(I18N.es,{
  hammerDesc:'La pared agrietada con el pequeño martillo bloquea la ruta. Selecciona MARTILLO y tócala; el uso real consume 1 martillo.',
  portalDesc:'Los portales están marcados A y B. Detén un átomo en uno para enviarlo al portal correspondiente que esté libre.',
  movingWallDesc:'La pared marcada ↔ avanza a la siguiente posición del riel después de cada movimiento completado.',
  pressureDoorDesc:'El interruptor y la puerta llevan la misma letra. La casilla transparente con rayas es una puerta ABIERTA; al quitar el átomo, vuelve a ser una pared sólida.',
  fragileDesc:'El número junto al diamante indica los impactos fuertes restantes. Al llegar a cero se rompe y reinicia el experimento.',
  linkedDesc:'Los átomos unidos por la línea de puntos animada se mueven juntos en la misma dirección. AMBAS rutas deben estar libres.',
  classicCatalystDesc:'Recoge los tres símbolos: Catalizador, Celda de Energía y Estabilizador. Cuando los contadores superiores tengan ✓, completa la molécula.',
  classicChainDesc:'No es la carga ⚡ de un átomo. Haz el movimiento brillante; la secuencia continúa sola y aumenta Combo x2 / x3.',
  classicReactorDesc:'Muévete cuando el láser esté tenue/apagado. Tocar un rayo activo aumenta Impactos; Reactor Escape añade 3 segundos.'
});
Object.assign(I18N.pt,{
  hammerDesc:'A parede rachada com o pequeno martelo bloqueia a rota. Selecione MARTELO e toque nela; o uso real consome 1 martelo.',
  portalDesc:'Os portais são marcados A e B. Pare um átomo em um deles para enviá-lo ao portal correspondente que estiver livre.',
  movingWallDesc:'A parede marcada ↔ avança para a próxima posição do trilho após cada jogada concluída.',
  pressureDoorDesc:'O botão e a porta têm a mesma letra. A casa transparente listrada é uma porta ABERTA; ao tirar o átomo, ela volta a ser uma parede sólida.',
  fragileDesc:'O número ao lado do diamante mostra os impactos fortes restantes. Ao chegar a zero, ele quebra e reinicia o experimento.',
  linkedDesc:'Átomos unidos pela linha pontilhada animada se movem juntos na mesma direção. OS DOIS caminhos precisam estar livres.',
  classicCatalystDesc:'Colete os três símbolos: Catalisador, Célula de Energia e Estabilizador. Quando os contadores mostrarem ✓, complete a molécula.',
  classicChainDesc:'Não é a carga ⚡ de um átomo. Faça a jogada brilhante; a sequência continua sozinha e aumenta Combo x2 / x3.',
  classicReactorDesc:'Mova-se quando o laser estiver fraco/desligado. Tocar o feixe ativo aumenta Impactos; Reactor Escape acrescenta 3 segundos.'
});
Object.assign(I18N.ja,{
  hammerDesc:'小さなハンマー印のあるひび割れ壁が進路を塞ぎます。ハンマーを選んで壁をタップすると、実戦では1個消費します。',
  portalDesc:'ポータルにはAとBの印があります。原子を一方で止めると、空いている対応ポータルへ移動します。',
  movingWallDesc:'↔印の壁は、1手が終わるたびにレール上の次の位置へ移動します。',
  pressureDoorDesc:'スイッチと扉には同じ文字があります。透明な縞のマスは開いた扉で、原子がスイッチを離れると固い壁に戻ります。',
  fragileDesc:'ダイヤ横の数字は残りの強い衝突回数です。0になると壊れて実験が再開されます。',
  linkedDesc:'動く点線で結ばれた原子は同じ方向へ一緒に動きます。両方の進路が空いている必要があります。',
  classicCatalystDesc:'触媒・エネルギーセル・安定化装置の3つの記号を集めます。上部がすべて✓になったら分子を完成させます。',
  classicChainDesc:'原子の⚡電荷とは別です。光る手を選ぶと連鎖が自動で続き、Combo x2 / x3が上がります。',
  classicReactorDesc:'レーザーが暗い／消えている時に動きます。作動中の光線に触れると衝突回数が増え、Reactor Escapeでは3秒加算されます。'
});

function ml(tr,en,de,es,pt,ja){
  const values={tr:tr,en:en,de:de,es:es,pt:pt,ja:ja};
  return values[LANG]!==undefined&&values[LANG]!==null?values[LANG]:en;
}
function localeCode(){return ({tr:'tr-TR',en:'en-US',de:'de-DE',es:'es-ES',pt:'pt-BR',ja:'ja-JP'})[LANG]||'en-US';}
function t(key,...args){
  const pack=I18N[LANG]||I18N.en;
  const v=pack[key]!==undefined?pack[key]:I18N.en[key];
  return typeof v==='function'?v(...args):v;
}

/* ================= SAVE / PROFILES ================= */
const SKEY='moleculox_save_v3';
const PKEY='moleculox_profiles_v1';
function isIOSWebDevice(){
  try{
    const ua=navigator.userAgent||'';
    return /iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  }catch(e){return false;}
}
let externalMusicMode=false;
function defaultSave(){return {cur:0,stars:{},coins:0,disc:{},volM:1,volMu:0.8,volS:1,volV:1,muM:false,muMu:false,muS:false,muV:false,externalMusic:false,dpad:false,reduceMotion:false,duelMessages:true,duelEffects:true,haptics:true,effectLevel:'normal',largeText:false,colorBlind:false,highContrast:false,performanceMode:'auto',favoriteMolecules:{},collectionFilter:'all',storySeen:{},storySchema:0,dailyDate:'',totalHints:0,streak3:0,lang:'en',achv:{},seenFrozen:false,seenFire:false,seenLightning:false,seenSticky:false,seenZombie:false,seenOneWay:false,seenBreakableWall:false,seenPortal:false,seenMovingWall:false,seenPressureDoor:false,seenFragile:false,seenPrecision:false,playerName:'',speedRuns:{},bestMoves:{},maxCoins:0,profileId:'',tutorialDone:false,autoGuest:false,rpSchema:0,researchPoints:0,researchLevels:{},researchAchievements:{},researchBonuses:{},bonusClaims:{},dailyScores:{},dailyRPStreak:0,lastDailyRPDate:'',seasonId:'',seasonRP:0,weekId:'',weekRP:0,saveSchema:5,campaignContentSchema:0,labTheme:'basic',economySchema:0,quantumHintDay:'',duelRatedMatches:{},duelRewards:{},duelRewardClaims:{},activeDuelFrame:'frame_bronze',activeDuelTitle:'',duelRating:800,duelPeakRating:800,duelWins:0,duelLosses:0,duelDraws:0,duelStreak:0,duelBestStreak:0,duelWeekPoints:0,duelWeekWins:0,duelMonthPoints:0,duelMonthWins:0,accountMilestoneInviteSeen:false,accountMilestoneInviteLastLevel:0,nobelCertificateShared:false,seenHintSupport:false,seenUndoSupport:false,seenRestartSupport:false,seenLabSupport:false,seenSupportGuide:false,seenHammerSupport:false,seenPrecisionSupport:false,seenBarrierSupport:false,seenGoalGlowGuide:false,tutorialTips:true,seenFragileAtom:false,seenLinkedAtoms:false,seenHammerWall:false,pushDeclined:false};}
const COIN_EARN_KEY='__coinEarned',COIN_SPEND_KEY='__coinSpent';
const LAB_THEME_STAMP_KEY='__labThemeStamp',QUANTUM_DAY_KEY='__quantumDay';
const LAB_THEME_CODES={basic:0,collider:1,arctic:2,mars:3},LAB_THEME_NAMES=['basic','collider','arctic','mars'];
function utcEpochDay(dayId){
  const s=String(dayId||utcDayId()),p=s.split('-').map(Number);if(p.length!==3||p.some(n=>!Number.isFinite(n)))return 0;
  return Math.max(0,Math.floor((Date.UTC(p[0],p[1]-1,p[2])-Date.UTC(2020,0,1))/86400000));
}
function labThemeStamp(theme){
  const minute=Math.max(0,Math.floor((Date.now()-Date.UTC(2026,0,1))/60000));
  return Math.min(9999999,minute*10+(LAB_THEME_CODES[theme]||0));
}
function setSyncedLabTheme(theme){
  theme=LAB_THEME_CODES.hasOwnProperty(theme)?theme:'basic';
  save.researchAchievements=save.researchAchievements&&typeof save.researchAchievements==='object'?save.researchAchievements:{};
  save.researchAchievements[LAB_THEME_STAMP_KEY]=labThemeStamp(theme);save.labTheme=theme;
}
function syncedLabTheme(s){
  s=s||save;const stamp=Math.max(0,Math.floor(Number(s.researchAchievements&&s.researchAchievements[LAB_THEME_STAMP_KEY])||0));
  return stamp?LAB_THEME_NAMES[stamp%10]||'basic':(['basic','collider','arctic','mars'].includes(s.labTheme)?s.labTheme:'basic');
}
function researchMapSum(map){
  return Object.entries(map&&typeof map==='object'?map:{}).reduce((sum,[k,v])=>sum+(String(k).startsWith('__')?0:Math.max(0,Math.floor(Number(v)||0))),0);
}
function ensureCoinLedger(s){
  s=s||defaultSave();
  s.researchAchievements=s.researchAchievements&&typeof s.researchAchievements==='object'?s.researchAchievements:{};
  let earned=Math.max(0,Math.floor(Number(s.researchAchievements[COIN_EARN_KEY])||0));
  let spent=Math.max(0,Math.floor(Number(s.researchAchievements[COIN_SPEND_KEY])||0));
  if(!Number(s.economySchema)||earned===0){
    earned=Math.max(earned,Math.floor(Number(s.coins)||0),Math.floor(Number(s.maxCoins)||0));
    spent=Math.min(spent,earned);
    s.researchAchievements[COIN_EARN_KEY]=earned;
    s.researchAchievements[COIN_SPEND_KEY]=spent;
    s.economySchema=1;
  }
  if(spent>earned)spent=earned;
  s.researchAchievements[COIN_EARN_KEY]=earned;
  s.researchAchievements[COIN_SPEND_KEY]=spent;
  s.coins=Math.max(0,earned-spent);
  s.maxCoins=Math.max(Math.floor(Number(s.maxCoins)||0),s.coins);
  return s;
}
function coinBalance(){ensureCoinLedger(save);return Math.max(0,Math.floor(Number(save.coins)||0));}
function addCoins(amount){
  ensureCoinLedger(save);amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return 0;
  save.researchAchievements[COIN_EARN_KEY]=Math.max(0,Math.floor(Number(save.researchAchievements[COIN_EARN_KEY])||0))+amount;
  ensureCoinLedger(save);return amount;
}
function spendCoins(amount){
  ensureCoinLedger(save);amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount||save.coins<amount)return false;
  save.researchAchievements[COIN_SPEND_KEY]=Math.max(0,Math.floor(Number(save.researchAchievements[COIN_SPEND_KEY])||0))+amount;
  ensureCoinLedger(save);return true;
}
function genProfileId(){return 'p_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);}
function localDayId(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
const FAIR_COMPETITION_START_UTC='2026-07-20';
function utcDayId(d){d=d||new Date();return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');}
function utcMonthId(d){d=d||new Date();return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');}
function utcWeekId(d){
  d=d||new Date();const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
  const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);
  const ys=new Date(Date.UTC(x.getUTCFullYear(),0,1));
  const w=Math.ceil((((x-ys)/86400000)+1)/7);
  return x.getUTCFullYear()+'-W'+String(w).padStart(2,'0');
}
function previousUtcDayId(dayId){
  const p=String(dayId||'').split('-').map(Number);if(p.length!==3||p.some(n=>!Number.isFinite(n)))return '';
  const d=new Date(Date.UTC(p[0],p[1]-1,p[2]));d.setUTCDate(d.getUTCDate()-1);return utcDayId(d);
}

function previousUtcWeekId(){const d=new Date();d.setUTCDate(d.getUTCDate()-7);return utcWeekId(d);}
function previousUtcMonthId(){const d=new Date();d.setUTCMonth(d.getUTCMonth()-1);return utcMonthId(d);}
const DUEL_START_RATING=800;
const DUEL_LEAGUES=[
  {id:'bronze',min:0,icon:'🥉',tr:'Bronz',en:'Bronze'},
  {id:'silver',min:900,icon:'🥈',tr:'Gümüş',en:'Silver'},
  {id:'gold',min:1050,icon:'🥇',tr:'Altın',en:'Gold'},
  {id:'platinum',min:1200,icon:'⚙️',tr:'Platin',en:'Platinum'},
  {id:'diamond',min:1400,icon:'💎',tr:'Elmas',en:'Diamond'},
  {id:'professor',min:1650,icon:'🎓',tr:'Profesör',en:'Professor'},
  {id:'nobel',min:1900,icon:'🏆',tr:'Nobel Ligi',en:'Nobel League'}
];
const DUEL_FRAMES=[
  {id:'frame_bronze',icon:'🥉',css:'frame-bronze',tr:'Bronz Çerçeve',en:'Bronze Frame',descTr:'Düello yolculuğunun ilk çerçevesi.',descEn:'The first frame on your duel journey.'},
  {id:'frame_gold',icon:'🥇',css:'frame-gold',tr:'Altın Çerçeve',en:'Gold Frame',descTr:'Altın Lige ulaş.',descEn:'Reach the Gold League.'},
  {id:'frame_diamond',icon:'💎',css:'frame-diamond',tr:'Elmas Çerçeve',en:'Diamond Frame',descTr:'Elmas Lige ulaş.',descEn:'Reach the Diamond League.'},
  {id:'frame_nobel',icon:'🏆',css:'frame-nobel',tr:'Nobel Çerçevesi',en:'Nobel Frame',descTr:'Nobel Lige ulaş.',descEn:'Reach the Nobel League.'},
  {id:'frame_week',icon:'⚡',css:'frame-week',tr:'Haftalık Şampiyon',en:'Weekly Champion',descTr:'Kapanan haftayı 1. bitir.',descEn:'Finish a closed week at #1.'},
  {id:'frame_month',icon:'🌌',css:'frame-month',tr:'Aylık Şampiyon',en:'Monthly Champion',descTr:'Kapanan ayı 1. bitir.',descEn:'Finish a closed month at #1.'}
];
const DUEL_TITLES=[
  {id:'title_first_win',icon:'⚔️',tr:'İlk Zafer',en:'First Victory',descTr:'İlk Hızlı Eşleşmeni kazan.',descEn:'Win your first Quick Match.'},
  {id:'title_streak3',icon:'🔥',tr:'Alev Serisi',en:'Hot Streak',descTr:'3 maçlık galibiyet serisi yap.',descEn:'Build a 3-match winning streak.'},
  {id:'title_professor',icon:'🎓',tr:'Düello Profesörü',en:'Duel Professor',descTr:'Profesör Ligine ulaş.',descEn:'Reach the Professor League.'},
  {id:'title_nobel',icon:'🏆',tr:'Nobel Düellocusu',en:'Nobel Duelist',descTr:'Nobel Ligine ulaş.',descEn:'Reach the Nobel League.'}
];
function duelTitleRows(){
  return DUEL_TITLES.concat([
    {id:'title_week_champion',icon:'⚡',tr:'Haftanın Şampiyonu',en:'Weekly Champion',descTr:'Kapanan haftayı 1. bitir.',descEn:'Finish a closed week at #1.'},
    {id:'title_month_champion',icon:'🌌',tr:'Ayın Düello Şampiyonu',en:'Monthly Duel Champion',descTr:'Kapanan ayı 1. bitir.',descEn:'Finish a closed month at #1.'}
  ]);
}
function duelLeagueForRating(value){value=Math.max(0,Math.floor(Number(value)||0));let out=DUEL_LEAGUES[0];for(const row of DUEL_LEAGUES)if(value>=row.min)out=row;return out;}
function duelLeagueIndex(value){return DUEL_LEAGUES.indexOf(duelLeagueForRating(value));}
function duelLeagueName(row){row=row||DUEL_LEAGUES[0];return LANG==='tr'?row.tr:row.en;}
function duelReceiptOutcome(value){return Math.max(0,Math.floor(Number(value)||0))%10;}
function duelReceiptTime(value){return Math.floor(Math.max(0,Number(value)||0)/10)*1000;}
function duelStatsFromReceipts(map){
  const rows=Object.values(map&&typeof map==='object'?map:{}).map(Number).filter(v=>Number.isFinite(v)&&duelReceiptOutcome(v)>=1&&duelReceiptOutcome(v)<=3).sort((a,b)=>a-b);
  let rating=DUEL_START_RATING,peak=DUEL_START_RATING,wins=0,losses=0,draws=0,streak=0,best=0,weekPoints=0,weekWins=0,monthPoints=0,monthWins=0;
  const week=utcWeekId(),month=utcMonthId();
  for(const value of rows){
    const outcome=duelReceiptOutcome(value),d=new Date(duelReceiptTime(value)||Date.now()),w=utcWeekId(d),m=utcMonthId(d);
    if(outcome===1){wins++;streak++;best=Math.max(best,streak);rating+=25;if(w===week){weekPoints+=3;weekWins++;}if(m===month){monthPoints+=3;monthWins++;}}
    else if(outcome===2){losses++;streak=0;rating=Math.max(0,rating-10);}
    else {draws++;streak=0;rating+=3;if(w===week)weekPoints++;if(m===month)monthPoints++;}
    peak=Math.max(peak,rating);
  }
  return {rating,peak,wins,losses,draws,streak,best,weekPoints,weekWins,monthPoints,monthWins,total:rows.length};
}
function unlockDuelReward(s,id){s.duelRewards=s.duelRewards&&typeof s.duelRewards==='object'?s.duelRewards:{};if(s.duelRewards[id])return false;s.duelRewards[id]=1;return true;}
function ensureDuelRankState(s){
  s=s||defaultSave();s.duelRatedMatches=s.duelRatedMatches&&typeof s.duelRatedMatches==='object'?s.duelRatedMatches:{};
  s.duelRewards=s.duelRewards&&typeof s.duelRewards==='object'?s.duelRewards:{};s.duelRewardClaims=s.duelRewardClaims&&typeof s.duelRewardClaims==='object'?s.duelRewardClaims:{};
  const keys=Object.keys(s.duelRatedMatches);if(keys.length>1000){keys.sort((a,b)=>Number(s.duelRatedMatches[b]||0)-Number(s.duelRatedMatches[a]||0)).slice(1000).forEach(k=>delete s.duelRatedMatches[k]);}
  const stats=duelStatsFromReceipts(s.duelRatedMatches);s.duelRating=stats.rating;s.duelPeakRating=Math.max(stats.peak,Math.floor(Number(s.duelPeakRating)||DUEL_START_RATING));s.duelWins=stats.wins;s.duelLosses=stats.losses;s.duelDraws=stats.draws;s.duelStreak=stats.streak;s.duelBestStreak=Math.max(stats.best,Math.floor(Number(s.duelBestStreak)||0));s.duelWeekPoints=stats.weekPoints;s.duelWeekWins=stats.weekWins;s.duelMonthPoints=stats.monthPoints;s.duelMonthWins=stats.monthWins;
  const top=duelLeagueIndex(s.duelPeakRating);for(let i=0;i<=top;i++)unlockDuelReward(s,'league_'+DUEL_LEAGUES[i].id);unlockDuelReward(s,'frame_bronze');
  if(s.duelPeakRating>=1050)unlockDuelReward(s,'frame_gold');if(s.duelPeakRating>=1400)unlockDuelReward(s,'frame_diamond');if(s.duelPeakRating>=1900)unlockDuelReward(s,'frame_nobel');
  if(s.duelWins>=1)unlockDuelReward(s,'title_first_win');if(s.duelBestStreak>=3)unlockDuelReward(s,'title_streak3');if(s.duelPeakRating>=1650)unlockDuelReward(s,'title_professor');if(s.duelPeakRating>=1900)unlockDuelReward(s,'title_nobel');
  s.activeDuelFrame=String(s.activeDuelFrame||'frame_bronze');if(!s.duelRewards[s.activeDuelFrame])s.activeDuelFrame='frame_bronze';
  s.activeDuelTitle=String(s.activeDuelTitle||'');if(s.activeDuelTitle&&!s.duelRewards[s.activeDuelTitle])s.activeDuelTitle='';
  return s;
}
function activeDuelFrame(){return DUEL_FRAMES.find(x=>x.id===save.activeDuelFrame)||DUEL_FRAMES[0];}
function activeDuelTitle(){return duelTitleRows().find(x=>x.id===save.activeDuelTitle)||null;}
function duelPublicStyle(){const f=activeDuelFrame(),ttl=activeDuelTitle();return {frame:f.id,title:ttl?ttl.id:''};}
function syncResearchPeriods(s){
  const month=utcMonthId(),week=utcWeekId();
  if(s.seasonId!==month){s.seasonId=month;s.seasonRP=0;}
  if(s.weekId!==week){s.weekId=week;s.weekRP=0;}
}
/*
 * RP schema 2 separates permanent Career RP from fair weekly/monthly competition.
 * Career RP never resets. Competitive RP starts from zero for every V3.7.5 player
 * and receives only one equal-opportunity source in this release: Today's Experiment,
 * the same daily challenge for every player.
 */
function addResearchPoints(delta,competitiveDelta){
  delta=Math.max(0,Math.floor(Number(delta)||0));if(!delta)return 0;
  competitiveDelta=Math.max(0,Math.min(delta,Math.floor(Number(competitiveDelta)||0)));
  if(utcDayId()<FAIR_COMPETITION_START_UTC)competitiveDelta=0;
  syncResearchPeriods(save);
  save.researchPoints=Math.max(0,Math.floor(Number(save.researchPoints)||0))+delta;
  if(competitiveDelta){
    save.seasonRP=Math.max(0,Math.floor(Number(save.seasonRP)||0))+competitiveDelta;
    save.weekRP=Math.max(0,Math.floor(Number(save.weekRP)||0))+competitiveDelta;
  }
  return delta;
}
function legacyLevelRP(stars){
  stars=Math.max(0,Math.min(3,Math.floor(Number(stars)||0)));
  return stars>0?100+stars*25:0;
}
// Added 2026-07-26: self-service repair for accounts whose researchLevels
// fell behind actual campaign progress (e.g. missed the one-time rpSchema
// migration, or a merge edge case). Re-applies the same legacy formula the
// original migration used, but as an on-demand top-up: Math.max means it can
// only raise a level's credited RP to match its stars, never lower it.
function recalcResearchFromProgress(){
  ensureResearchState(save);
  let raised=0;
  Object.keys(save.stars||{}).forEach(k=>{
    const rp=legacyLevelRP(save.stars[k]);
    const before=Math.max(0,Math.floor(Number(save.researchLevels[k])||0));
    if(rp>before){save.researchLevels[k]=rp;raised+=rp-before;}
  });
  Object.keys(save.achv||{}).forEach(id=>{
    if(!save.achv[id]||!ACHV_RP[id])return;
    const before=Math.max(0,Math.floor(Number(save.researchAchievements[id])||0));
    if(ACHV_RP[id]>before){save.researchAchievements[id]=ACHV_RP[id];raised+=ACHV_RP[id]-before;}
  });
  if(raised>0){
    save.researchPoints=Math.min(5000000,researchMapSum(save.researchLevels)+researchMapSum(save.researchAchievements)+researchMapSum(save.researchBonuses)+researchMapSum(save.dailyScores));
    persist();
    try{const acc=window.MXCloud&&window.MXCloud.account;if(acc&&!acc.isAnonymous&&window.MXCloud.saveProgressNow)window.MXCloud.saveProgressNow(save,save.profileId);}catch(e){}
  }
  return raised;
}
function ensureResearchState(s){
  s=s||defaultSave();
  s.disc=s.disc&&typeof s.disc==='object'?s.disc:{};
  s.stars=s.stars&&typeof s.stars==='object'?s.stars:{};
  let campaignContentSchema=Math.max(0,Math.floor(Number(s.campaignContentSchema)||0));
  if(campaignContentSchema<1){
    for(let i=73;i<=89;i++)if(Number(s.cur)>i||Number(s.stars[i])>0)s.disc[LEVELS[i].m]=1;
    campaignContentSchema=1;
  }
  // V8.5.49: existing testers may already have the old one-line tips marked
  // as seen. Re-open only the mechanics whose meaning was clarified in the
  // smart tutorial update; do not reset every lesson and overwhelm players.
  if(campaignContentSchema<2){
    s.seenLightning=false;
    s.seenClassicCatalystTutorialV2=false;
    s.seenClassicChainTutorialV2=false;
    s.seenClassicReactorTutorialV2=false;
    s.seenBarrierSupport=false;
    campaignContentSchema=2;
  }
  // V8.5.52: re-open only the compact guides whose board symbols were
  // visually clarified. Existing progress, stars and other lessons remain.
  if(campaignContentSchema<3){
    s.seenOneWay=false;
    s.seenBreakableWall=false;s.seenHammerWall=false;
    s.seenPortal=false;
    s.seenMovingWall=false;
    s.seenPressureDoor=false;
    s.seenFragile=false;s.seenFragileAtom=false;
    s.seenLinked=false;s.seenLinkedAtoms=false;
    s.seenClassicCatalystTutorialV2=false;
    s.seenClassicChainTutorialV2=false;
    s.seenClassicReactorTutorialV2=false;
    campaignContentSchema=3;
  }
  s.campaignContentSchema=campaignContentSchema;
  s.researchLevels=s.researchLevels&&typeof s.researchLevels==='object'?s.researchLevels:{};
  s.researchAchievements=s.researchAchievements&&typeof s.researchAchievements==='object'?s.researchAchievements:{};
  s.researchBonuses=s.researchBonuses&&typeof s.researchBonuses==='object'?s.researchBonuses:{};
  s.bonusClaims=s.bonusClaims&&typeof s.bonusClaims==='object'?s.bonusClaims:{};
  s.dailyScores=s.dailyScores&&typeof s.dailyScores==='object'?s.dailyScores:{};
  s.bestMoves=s.bestMoves&&typeof s.bestMoves==='object'?s.bestMoves:{};
  let schema=Math.max(0,Math.floor(Number(s.rpSchema)||0));
  if(schema<1){
    let migrated=0;
    Object.keys(s.stars||{}).forEach(k=>{const rp=legacyLevelRP(s.stars[k]);if(rp){s.researchLevels[k]=Math.max(Number(s.researchLevels[k])||0,rp);}});
    Object.keys(s.achv||{}).forEach(id=>{if(s.achv[id]&&ACHV_RP[id])s.researchAchievements[id]=Math.max(Number(s.researchAchievements[id])||0,ACHV_RP[id]);});
    migrated=researchMapSum(s.researchLevels)+researchMapSum(s.researchAchievements)+researchMapSum(s.researchBonuses)+researchMapSum(s.dailyScores);
    s.researchPoints=Math.max(Math.floor(Number(s.researchPoints)||0),migrated);
    schema=1;
  }
  if(schema<2){
    // Fair migration: preserve every Career RP, but do not carry pre-V3.7.5
    // weekly/monthly points into the fresh competition tables.
    s.seasonId=utcMonthId();s.seasonRP=0;
    s.weekId=utcWeekId();s.weekRP=0;
    schema=2;
  }
  // Schema 3 changes only synchronization safety; it never resets points.
  if(schema<3)schema=3;
  s.rpSchema=schema;
  // BUILD V6.23.3-FIX: Firestore rules require saveSchema == 5 exactly
  // (strict equality, see firestore-rules-v5.0-final.txt). This used to only
  // guarantee "at least 4" (Math.max(4,...)), so any account whose local save
  // was already sitting at 4 from an earlier build never reached 5 and every
  // write was silently rejected with permission-denied, while reads (which
  // don't check this field) kept working — exactly the "saves but doesn't
  // save" symptom.
  s.saveSchema=5;
  s.labTheme=['basic','collider','arctic','mars'].includes(s.labTheme)?s.labTheme:'basic';
  s.economySchema=Math.max(0,Math.floor(Number(s.economySchema)||0));
  s.quantumHintDay=String(s.quantumHintDay||'').slice(0,10);
  ensureCoinLedger(s);
  s.labTheme=syncedLabTheme(s);
  const syncedQ=Math.max(0,Math.floor(Number(s.researchAchievements[QUANTUM_DAY_KEY])||0));
  if(syncedQ===utcEpochDay())s.quantumHintDay=utcDayId();
  const canonicalResearch=researchMapSum(s.researchLevels)+researchMapSum(s.researchAchievements)+researchMapSum(s.researchBonuses)+researchMapSum(s.dailyScores);
  s.researchPoints=Math.max(canonicalResearch,Math.max(0,Math.floor(Number(s.researchPoints)||0)));
  s.seasonRP=Math.max(0,Math.floor(Number(s.seasonRP)||0));
  s.weekRP=Math.max(0,Math.floor(Number(s.weekRP)||0));
  s.dailyRPStreak=Math.max(0,Math.floor(Number(s.dailyRPStreak)||0));
  syncResearchPeriods(s);
  ensureDuelRankState(s);
  return s;
}
function scoreMoveBonus(moveCount,par,minimum){
  moveCount=Math.max(0,Number(moveCount)||0);par=Math.max(1,Number(par)||1);
  minimum=Math.max(1,Math.min(par,Number(minimum)||par));
  // Preserve the V3.7.0–V3.7.2 RP table for existing leaderboard players.
  // A certified-minimum bonus exists only when the verified minimum is below PAR.
  if(minimum<par&&moveCount<=minimum)return 40;
  if(minimum<par&&moveCount<par)return 35;
  if(moveCount===par)return 25;
  // A score below PAR is impossible when minimum===PAR; never grant a premium bonus.
  if(moveCount<par)return 25;
  if(moveCount<=Math.ceil(par*1.25))return 15;
  if(moveCount<=Math.ceil(par*1.6))return 5;
  return 0;
}
function scoreTimeBonus(seconds,par){
  seconds=Math.max(0,Number(seconds)||0);par=Math.max(1,Number(par)||1);
  const target=Math.max(12,par*2.2);
  if(seconds<=target)return 30;
  if(seconds<=target*1.5)return 20;
  if(seconds<=target*2.2)return 10;
  return 0;
}
function campaignResearchScore(stars,moveCount,par,minimum,seconds,hints){
  return 100+Math.max(0,Math.min(3,Number(stars)||0))*25+scoreMoveBonus(moveCount,par,minimum)+scoreTimeBonus(seconds,par)+(hints===0?20:0);
}
function dailyResearchScore(moveCount,par,minimum,seconds,hints,streak){
  return 50+scoreMoveBonus(moveCount,par,minimum)+scoreTimeBonus(seconds,par)+(hints===0?20:0)+Math.min(30,Math.max(0,(Number(streak)||1)-1)*5);
}
function awardLevelResearch(levelId,score){
  ensureResearchState(save);const key=String(levelId);const old=Math.max(0,Math.floor(Number(save.researchLevels[key])||0));
  score=Math.max(0,Math.floor(Number(score)||0));if(score<=old)return 0;
  const delta=score-old;
  save.researchLevels[key]=score;
  // Campaign progress and move improvements belong to permanent Career RP.
  // Keeping them out of the period table prevents intentional low-score farming.
  return addResearchPoints(delta,0);
}
function awardDailyResearch(dayId,moveCount,par,minimum,seconds,hints){
  ensureResearchState(save);const old=Math.max(0,Math.floor(Number(save.dailyScores[dayId])||0));
  if(old===0){
    save.dailyRPStreak=save.lastDailyRPDate===previousUtcDayId(dayId)?Math.max(1,save.dailyRPStreak+1):1;
    save.lastDailyRPDate=dayId;
  }
  const score=dailyResearchScore(moveCount,par,minimum,seconds,hints,save.dailyRPStreak);
  if(score<=old)return {delta:0,score:old,streak:save.dailyRPStreak};
  save.dailyScores[dayId]=score;
  const days=Object.keys(save.dailyScores).sort();while(days.length>120){delete save.dailyScores[days.shift()];}
  const delta=score-old;
  return {delta:addResearchPoints(delta,delta),score,streak:save.dailyRPStreak};
}
let profiles={};
let lastProfile=null;
try{
  const pr=JSON.parse(localStorage.getItem(PKEY));
  if(pr&&typeof pr==='object'){
    if(pr.profiles&&typeof pr.profiles==='object'){profiles=pr.profiles;lastProfile=pr.last||null;}
    else{profiles=pr;}
  }
}catch(e){}
try{
  const legacy=JSON.parse(localStorage.getItem(SKEY));
  if(legacy&&typeof legacy==='object'&&!Object.keys(profiles).length){
    if(legacy.snd===false&&legacy.muMu===undefined){legacy.muMu=true;legacy.muS=true;}
    const nm=(legacy.playerName||'Oyuncu1').slice(0,18)||'Oyuncu1';
    profiles[nm]=Object.assign(defaultSave(),legacy);
    lastProfile=nm;
  }
}catch(e){}
try{
  const migrationKey='moleculox_external_music_optin_v359';
  if(!localStorage.getItem(migrationKey)){
    Object.keys(profiles).forEach(name=>{if(profiles[name])profiles[name].externalMusic=false;});
    localStorage.setItem(PKEY,JSON.stringify({profiles,last:lastProfile}));
    localStorage.setItem(migrationKey,'1');
  }
}catch(e){}
let curProfile=null;
let save=defaultSave();
function persistAll(){try{localStorage.setItem(PKEY,JSON.stringify({profiles,last:lastProfile}));}catch(e){}}
function persist(){
  if(!curProfile)return;
  profiles[curProfile]=save;lastProfile=curProfile;persistAll();
  try{
    if(window.MXCloud&&save.profileId){
      setSyncStatus(navigator.onLine===false?'offline':'syncing');
      const cloudWrite=window.MXCloud.saveProgress(save,save.profileId);
      if(cloudWrite&&typeof cloudWrite.then==='function')cloudWrite.then(result=>{
        if(result)setSyncStatus('saved');
        else setSyncStatus(navigator.onLine===false?'offline':'error');
      }).catch(err=>{console.warn('[sync] autosave failed:',err&&err.code||err);setSyncStatus(navigator.onLine===false?'offline':'error');});
      const account=window.MXCloud.account;
      if(account&&!account.isAnonymous&&window.MXCloud.syncLeaderboard)window.MXCloud.syncLeaderboard(save,save.profileId,false);
      if(account&&!account.isAnonymous&&window.MXCloud.syncDuelLeaderboard)window.MXCloud.syncDuelLeaderboard(save,save.profileId,false);
    }
  }catch(e){}
}


/* ================= AUDIO CORE ================= */
let AC=null,masterG=null,musicG=null,sfxG=null,voiceG=null,musicMediaSrc=null,startupMediaSrc=null,noiseB=null;
const STARTUP_AUDIO_URL='assets/audio/startup-lab.mp3';
const startupAudio=new Audio(STARTUP_AUDIO_URL);
startupAudio.preload='auto';
startupAudio.playsInline=true;
startupAudio.setAttribute('playsinline','');
startupAudio.setAttribute('webkit-playsinline','');

const musicAudio=new Audio();
musicAudio.preload='metadata';
musicAudio.playsInline=true;
musicAudio.setAttribute('playsinline','');
musicAudio.setAttribute('webkit-playsinline','');
musicAudio.disableRemotePlayback=true;
musicAudio.muted=false;
try{musicAudio.src=TRACKS[0];musicAudio.load();}catch(e){}
let musicDuck=1,musicFadeToken=0;
let startupAudioStarted=false,startupAudioFailed=false,startupCuePlayed=false;
let audioSessionConfigured=false;
function configureAudioSession(){
  if(audioSessionConfigured)return;
  audioSessionConfigured=true;
  try{
    if(navigator.audioSession)navigator.audioSession.type='ambient';
  }catch(e){}
}
function stopAllGameAudio(){
  try{musicAudio.pause();}catch(e){}
  try{startupAudio.pause();startupAudio.currentTime=0;}catch(e){}
  stopCharacterVoice();
  try{if(AC&&AC.state==='running')AC.suspend();}catch(e){}
  MP.started=false;MP.src=null;
}
function syncExternalMusicMode(){
  externalMusicMode=!!save.externalMusic;
  if(externalMusicMode)stopAllGameAudio();
}

let audioGestureSeen=false,audioPrimed=false,bootIntroStartedAt=0,bootPlayBusy=false;

function clampAudio(v){v=Number(v);return Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;}
function targetMusicVolume(){return (save.muM||save.muMu)?0:clampAudio(save.volM*save.volMu*musicDuck);}
function duckMusic(level=.58,duration=850){
  const token=++musicFadeToken;musicDuck=clampAudio(level);applyVol();
  setTimeout(()=>{if(token!==musicFadeToken)return;musicDuck=1;applyVol();},Math.max(120,Number(duration)||850));
}
function setGainNow(node,value){
  if(!node)return;
  value=clampAudio(value);
  try{
    const t=AC?AC.currentTime:0;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(value,t);
  }catch(e){node.gain.value=value;}
}
function applyVol(){
  syncExternalMusicMode();
  if(externalMusicMode){stopAllGameAudio();return;}
  const master=save.muM?0:clampAudio(save.volM);
  const music=save.muMu?0:clampAudio(save.volMu*musicDuck);
  const effects=save.muS?0:clampAudio(save.volS);
  const voices=save.muV?0:clampAudio(save.volV==null?1:save.volV);
  if(AC){
    setGainNow(masterG,master);
    setGainNow(musicG,music);
    setGainNow(sfxG,effects);
    setGainNow(voiceG,voices);
  }
  // iPhone Safari may ignore HTMLMediaElement.volume. When Web Audio routing
  // is available the elements stay at full volume and their GainNodes control
  // the real output. The direct-volume path remains as a browser fallback.
  try{musicAudio.volume=musicMediaSrc?1:clampAudio(master*music);}catch(e){}
  try{startupAudio.volume=startupMediaSrc?1:clampAudio(master*effects);}catch(e){}
}
function ac(){
  if(externalMusicMode)return null;
  configureAudioSession();
  if(!AC){
    try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}
    masterG=AC.createGain();masterG.connect(AC.destination);
    musicG=AC.createGain();musicG.connect(masterG);
    sfxG=AC.createGain();sfxG.connect(masterG);
    voiceG=AC.createGain();voiceG.connect(masterG);
    try{
      musicMediaSrc=AC.createMediaElementSource(musicAudio);
      musicMediaSrc.connect(musicG);
    }catch(e){musicMediaSrc=null;console.warn('[audio] music Web Audio routing unavailable',e&&e.name||e);}
    try{
      startupMediaSrc=AC.createMediaElementSource(startupAudio);
      startupMediaSrc.connect(sfxG);
    }catch(e){startupMediaSrc=null;console.warn('[audio] startup Web Audio routing unavailable',e&&e.name||e);}
    applyVol();
  }
  if(AC.state==='suspended'){
    try{const r=AC.resume();if(r&&r.catch)r.catch(()=>{});}catch(e){}
  }
  return AC;
}
// Fires before any element's own pointerdown handler (capture phase runs
// document -> target, ahead of the normal bubble-phase listeners on buttons
// like #btnBootPlay). Guarantees AC/sfxG already exist by the time that
// button's own handler tries to play a click sound -- otherwise the very
// first tap anywhere in the app (often PLAY, now that the intro screens no
// longer require an early tap) would silently produce no sound at all.
// Audio is unlocked by the single unlock() path registered near INIT.
const now=()=>AC?AC.currentTime:0;
function startStartupAudio(){
  if(externalMusicMode)return Promise.resolve(false);
  configureAudioSession();
  if(!audioGestureSeen)return Promise.resolve(false);
  startupAudioFailed=false;startupAudioStarted=false;
  try{startupAudio.pause();startupAudio.currentTime=0;}catch(e){}
  applyVol();
  try{
    const p=startupAudio.play();
    if(p&&p.then)return p.then(()=>{startupAudioStarted=true;startupCuePlayed=true;return true;}).catch((err)=>{
      startupAudioFailed=true;console.warn('[audio] startup MP3 unavailable',err&&err.name||err);return false;
    });
    startupAudioStarted=true;startupCuePlayed=true;return Promise.resolve(true);
  }catch(err){startupAudioFailed=true;console.warn('[audio] startup MP3 failed',err&&err.name||err);return Promise.resolve(false);}
}
function stopStartupAudio(){
  try{startupAudio.pause();startupAudio.currentTime=0;}catch(e){}
}
function env(g,t,vol,atk,dur){
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+atk);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
}
function osc(dest,f,t,dur,type,vol,opt){
  if(!AC)return;opt=opt||{};
  const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(Math.max(20,f),t);
  if(opt.f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,opt.f2),t+(opt.f2t||dur));
  let node=o;
  if(opt.lp){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(opt.lp,t);
    if(opt.lp2)fl.frequency.exponentialRampToValueAtTime(opt.lp2,t+dur);node.connect(fl);node=fl;}
  if(opt.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=opt.vib;lg.gain.value=opt.vibd||f*0.02;
    l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+0.06);}
  const g=AC.createGain();env(g,t,vol,opt.atk||0.012,dur);
  node.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+0.08);
}
function nz(dest,t,dur,vol,ftype,f1,f2,q){
  if(!AC)return;
  if(!noiseB){noiseB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);
    const d=noiseB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const s=AC.createBufferSource();s.buffer=noiseB;s.loop=true;
  const f=AC.createBiquadFilter();f.type=ftype||'lowpass';f.frequency.setValueAtTime(f1||800,t);
  if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+dur);
  f.Q.value=q||0.8;
  const g=AC.createGain();env(g,t,vol,0.008,dur);
  s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+0.04);
}
function tone(f,dur,type,vol,when,f2){osc(sfxG,f,now()+(when||0),dur,type||'sine',vol,{f2});}
const sfxGateTimes=Object.create(null);
function sfxAllowed(key,gap=70){const t=performance.now();if((sfxGateTimes[key]||0)+gap>t)return false;sfxGateTimes[key]=t;return true;}
const SFX={
  click(){if(!sfxAllowed('click',65))return;tone(720,0.045,'square',0.035);tone(1080,0.04,'sine',0.025,0.025)},
  back(){if(!sfxAllowed('back',90))return;tone(480,0.07,'sine',0.045,0,300)},
  play(){tone(540,0.055,'square',0.035);tone(900,0.07,'sine',0.045,0.045);tone(1350,0.08,'sine',0.028,0.09)},
  select(){if(!sfxAllowed('select',80))return;tone(880,0.06,'sine',0.06);tone(1320,0.07,'sine',0.045,0.05)},
  slide(d=0){
    if(!sfxAllowed('slide',48)||!ac())return;
    d=Number.isFinite(Number(d))?Math.max(1,Number(d)):1;
    const t=now()+.004,dur=Math.min(.22,.075+d*.018);
    // Short airy movement cue: no tiring continuous loop.
    nz(sfxG,t,dur,.028,'bandpass',920,1850,1.15);
    osc(sfxG,260+d*22,t,dur,'sine',.032,{atk:.006,f2:430+d*18,f2t:dur*.92,lp:1700});
  },
  atomLand(d=1,bonded=false){
    if(!sfxAllowed('atomLand',55)||!ac())return;
    d=Number.isFinite(Number(d))?Math.max(1,Number(d)):1;
    const t=now()+.003;
    // Soft physical stop; a newly formed bond adds a tiny glassy overtone.
    osc(sfxG,150+Math.min(d,8)*8,t,.075,'triangle',.052,{atk:.003,f2:92,f2t:.065,lp:900});
    nz(sfxG,t,.045,.018,'lowpass',520,210,.7);
    if(bonded)osc(sfxG,1180,t+.025,.105,'sine',.028,{atk:.004,f2:1420,f2t:.09});
  },
  thunk(){if(!sfxAllowed('thunk',110))return;tone(100,0.09,'square',0.09,0,55)},
  wallBreak(){
    if(!sfxAllowed('wallBreak',240)||!ac())return;
    const t=now()+.006;
    osc(sfxG,92,t,.16,'triangle',.14,{atk:.002,f2:42,f2t:.14,lp:520});
    nz(sfxG,t,.18,.12,'bandpass',1450,280,1.1);
    nz(sfxG,t+.035,.42,.075,'lowpass',760,120,.65);
    [0,.045,.09,.145,.22].forEach((d,i)=>{
      osc(sfxG,180-i*18,t+d,.045,'square',.038,{atk:.002,f2:95-i*7,f2t:.04,lp:900});
      nz(sfxG,t+d,.055,.025,'bandpass',900+i*130,260,2.2);
    });
  },
  undo(){if(!sfxAllowed('undo',110))return;tone(520,0.09,'sine',0.05,0,300)},
  hint(){if(!sfxAllowed('hint',180))return;tone(1100,0.1,'sine',0.06);tone(1470,0.12,'sine',0.05,0.09)},
  star(i=0){i=Number.isFinite(Number(i))?Number(i):0;tone(700+i*230,0.16,'sine',0.09)},
  coin(){if(!sfxAllowed('coin',85))return;tone(1560,0.08,'square',0.045);tone(2093,0.12,'square',0.04,0.07)},
  sparkle(){if(!sfxAllowed('sparkle',130))return;tone(1800,0.05,'sine',0.035);tone(2400,0.06,'sine',0.03,0.04);tone(3000,0.05,'sine',0.025,0.08)},
  moleculeComplete(){
    if(!sfxAllowed('moleculeComplete',700)||!ac())return;duckMusic(.52,1250);
    const t=now()+.02;[[523.25,0],[659.25,.09],[783.99,.18],[1046.5,.31]].forEach(([f,d],i)=>{
      osc(sfxG,f,t+d,.34,'triangle',.065-i*.006,{atk:.012,f2:f*1.015,f2t:.3});
      osc(sfxG,f/2,t+d,.38,'sine',.022,{atk:.02});
    });
    [0,.07,.14,.21].forEach((d,i)=>nz(sfxG,t+d,.08,.018,'highpass',2400+i*240,5600,1.5));
  },
  duelVictory(){
    if(!ac())return;
    const t=now()+0.025;
    [[523.25,0],[659.25,.12],[783.99,.24],[1046.5,.38]].forEach(([f,d],i)=>{
      osc(sfxG,f,t+d,.26,'triangle',.075-i*.006,{atk:.012,f2:f*1.01,f2t:.2});
      osc(sfxG,f/2,t+d,.3,'sine',.035,{atk:.02});
    });
    [0,.1,.2,.3,.4].forEach((d,i)=>nz(sfxG,t+d,.07,.025,'highpass',2600+i*180,5200,2));
    osc(sfxG,1318.5,t+.55,.48,'sine',.06,{atk:.02,f2:1568,f2t:.42});
  },
  duelDefeat(){
    if(!ac())return;
    const t=now()+.025;
    [[392,0],[349.23,.16],[293.66,.34],[261.63,.52]].forEach(([f,d],i)=>{
      osc(sfxG,f,t+d,.32,'triangle',.052-i*.004,{atk:.018,f2:f*.985,f2t:.28,lp:1800});
    });
    osc(sfxG,130.81,t+.5,.55,'sine',.028,{atk:.04,f2:110,f2t:.5,lp:500});
  },
  duelDraw(){
    if(!ac())return;
    const t=now()+.025;
    [[440,0],[523.25,.16],[440,.34]].forEach(([f,d])=>osc(sfxG,f,t+d,.28,'triangle',.05,{atk:.015}));
  },
  whoosh(){tone(200,0.35,'sine',0.055,0,900)},
  labIntro(){
    if(!ac())return;
    const t=now()+0.03;
    // Soft laboratory power hum, glass bubbling and instrument beeps.
    osc(sfxG,58,t,3.5,'sine',0.050,{atk:0.35,f2:72,f2t:3.2,lp:220});
    osc(sfxG,116,t+0.08,3.2,'triangle',0.025,{atk:0.45,f2:128,f2t:3.0,lp:350});
    [0.55,0.92,1.28,1.86,2.18,2.72,3.05].forEach((d,i)=>{
      nz(sfxG,t+d,0.07+(i%3)*0.02,0.050,'bandpass',720+(i%4)*170,null,4);
      osc(sfxG,520+(i%3)*95,t+d+0.01,0.09,'sine',0.035,{atk:0.008,f2:760+(i%3)*120,f2t:0.08});
    });
    [1.05,1.82,2.58].forEach((d,i)=>{
      osc(sfxG,980+i*160,t+d,0.08,'sine',0.050,{atk:0.006});
      osc(sfxG,1320+i*120,t+d+0.07,0.07,'sine',0.036,{atk:0.006});
    });
  },
  bulbOn(){
    if(!ac())return;
    const t=now();
    // Electrical charge/crackle followed by the lamp energising.
    nz(sfxG,t,0.5,0.105,'bandpass',2600,720,5);
    nz(sfxG,t+0.08,0.22,0.080,'highpass',3800,1600,3);
    osc(sfxG,95,t,0.72,'sawtooth',0.070,{atk:0.025,f2:880,f2t:0.62,lp:1600,lp2:5200});
    osc(sfxG,880,t+0.48,0.22,'sine',0.095,{atk:0.008,f2:1760,f2t:0.18});
    osc(sfxG,1760,t+0.62,0.28,'sine',0.075,{atk:0.01,f2:1240,f2t:0.25});
  }
};

/* ---------- character voice system (pre-recorded clips only; no robotic TTS) ---------- */
const VOICE_BASE='assets/audio/voices/';
const VOICE_BANK={}; // No prerecorded voice clips are bundled in this release.
const voiceCache=new Map();
let activeVoice=null,voiceToken=0,lastVoiceAt=0;
function voiceEnabled(){return !externalMusicMode&&!save.muM&&!save.muV&&clampAudio(save.volM)>0&&clampAudio(save.volV==null?1:save.volV)>0;}
function voiceUrl(name){return VOICE_BASE+name;}
function getVoiceAudio(name){
  if(voiceCache.has(name))return voiceCache.get(name);
  const a=new Audio(voiceUrl(name));a.preload='metadata';a.playsInline=true;a.setAttribute('playsinline','');a.disableRemotePlayback=true;
  voiceCache.set(name,a);return a;
}
function stopCharacterVoice(){
  voiceToken++;
  if(activeVoice){try{activeVoice.pause();activeVoice.currentTime=0;}catch(e){} activeVoice=null;}
  fadeMusicDuck(1,220);
}
function playCharacterVoice(character,event,opts={}){
  if(!voiceEnabled())return Promise.resolve(false);
  const files=VOICE_BANK[character]&&VOICE_BANK[character][event];
  if(!files||!files.length)return Promise.resolve(false);
  const nowMs=performance.now();
  if(!opts.force&&nowMs-lastVoiceAt<Math.max(900,Number(opts.cooldown)||1800))return Promise.resolve(false);
  const name=files[Math.floor(Math.random()*files.length)],a=getVoiceAudio(name),token=++voiceToken;
  if(activeVoice&&activeVoice!==a){try{activeVoice.pause();activeVoice.currentTime=0;}catch(e){}}
  activeVoice=a;lastVoiceAt=nowMs;
  try{a.currentTime=0;a.muted=false;a.volume=clampAudio((save.volM||0)*(save.volV==null?1:save.volV));}catch(e){}
  fadeMusicDuck(opts.duck==null?.32:opts.duck,160);
  const restore=()=>{if(token!==voiceToken)return;activeVoice=null;fadeMusicDuck(1,280);};
  a.onended=restore;a.onerror=()=>{restore();};
  try{
    const pr=a.play();
    if(pr&&pr.then)return pr.then(()=>true).catch(()=>{restore();return false;});
    return Promise.resolve(true);
  }catch(e){restore();return Promise.resolve(false);}
}
function maybeVoice(character,event,chance=.35,opts={}){if(Math.random()>chance)return;playCharacterVoice(character,event,opts);}

/* ---------- reliable HTML5 background music (iOS/Android/Web) ---------- */
const MUS={int:0};
let nearWinPulseTimer=0,nearWinPulseActive=false,nearWinPulseToken=0;
function playNearWinPulse(){
  if(!nearWinPulseActive||externalMusicMode||save.muM||save.muMu||!ac())return;
  const token=nearWinPulseToken,t=now()+.012;
  // A restrained laboratory-energy heartbeat layered under the music.
  // It does not alter playback speed or reveal the exact solution.
  osc(musicG,82,t,.24,'sine',.014,{atk:.035,f2:74,f2t:.20,lp:260});
  osc(musicG,164,t+.035,.18,'triangle',.006,{atk:.025,f2:148,f2t:.14,lp:520});
  setTimeout(()=>{
    if(!nearWinPulseActive||token!==nearWinPulseToken||externalMusicMode||save.muM||save.muMu||!ac())return;
    const t2=now()+.006;
    osc(musicG,92,t2,.18,'sine',.010,{atk:.025,f2:80,f2t:.15,lp:280});
  },265);
}
function startNearWinLayer(){
  if(nearWinPulseActive)return;
  nearWinPulseActive=true;nearWinPulseToken++;
  playNearWinPulse();
  clearInterval(nearWinPulseTimer);
  nearWinPulseTimer=setInterval(playNearWinPulse,1450);
}
function stopNearWinLayer(){
  if(!nearWinPulseActive&&!nearWinPulseTimer)return;
  nearWinPulseActive=false;nearWinPulseToken++;
  clearInterval(nearWinPulseTimer);nearWinPulseTimer=0;
}
function setIntensity(n){
  n=Math.max(0,Math.min(2,Number(n)||0));
  if(MUS.int===n)return;
  MUS.int=n;
  if(n===2)startNearWinLayer();else stopNearWinLayer();
}
const MP={mode:'menu',idx:0,started:false,src:null,err:0,blocked:false};
function randomTrackIdx(avoid){
  if(TRACKS.length<=1)return 0;
  let ni=Math.floor(Math.random()*TRACKS.length);
  if(ni===avoid)ni=(ni+1)%TRACKS.length;
  return ni;
}
function trackUrl(i){return TRACKS[Math.max(0,Math.min(TRACKS.length-1,Number(i)||0))];}
function isCurrentTrack(i){
  const wanted=trackUrl(i).split('/').pop();
  try{return !!musicAudio.src&&decodeURIComponent(new URL(musicAudio.src,location.href).pathname).endsWith('/'+wanted);}catch(e){return false;}
}
function setMusicTrack(i){
  i=Math.max(0,Math.min(TRACKS.length-1,Number(i)||0));
  MP.idx=i;
  if(!isCurrentTrack(i)){
    musicAudio.src=trackUrl(i);
    musicAudio.load();
  }
  musicAudio.loop=MP.mode==='menu';
}
function playTrack(i,restart,attempt){
  if(externalMusicMode){try{musicAudio.pause();}catch(e){} return Promise.resolve(false);}
  configureAudioSession();
  attempt=Number(attempt)||0;
  setMusicTrack(i);
  MP.started=true;
  musicAudio.muted=false;
  if(restart){try{musicAudio.currentTime=0;}catch(e){}}
  applyVol();
  if(!musicAudio.paused){MP.src=musicAudio;MP.blocked=false;return Promise.resolve(true);}
  try{
    const p=musicAudio.play();
    if(p&&p.then)return p.then(()=>{MP.src=musicAudio;MP.blocked=false;MP.err=0;return true;}).catch((err)=>{
      MP.src=null;MP.blocked=true;
      console.warn('[audio] music play blocked/failed',trackUrl(i),err&&err.name||err);
      if(attempt<1&&err&&err.name==='NotSupportedError')return playTrack((i+1)%TRACKS.length,true,attempt+1);
      return false;
    });
    MP.src=musicAudio;MP.blocked=false;MP.err=0;return Promise.resolve(true);
  }catch(err){
    MP.src=null;MP.blocked=true;console.warn('[audio] music play exception',err&&err.name||err);
    return Promise.resolve(false);
  }
}
musicAudio.addEventListener('playing',()=>{MP.src=musicAudio;MP.blocked=false;applyVol();});
musicAudio.addEventListener('pause',()=>{if(!musicAudio.ended)MP.src=null;});
musicAudio.addEventListener('error',()=>{
  MP.err=MP.idx+1;MP.src=null;
});
musicAudio.addEventListener('ended',()=>{
  MP.src=null;
  if(MP.mode==='game'&&bootDone){
    let ni=Math.floor(Math.random()*TRACKS.length);
    if(TRACKS.length>1&&ni===MP.idx)ni=(ni+1)%TRACKS.length;
    playTrack(ni,true);
  }
});
function setTheme(){
  const changed=MP.mode!=='game';
  MP.mode='game';musicAudio.loop=false;
  if(MP.started&&bootDone){
    let ni=changed?(TRACKS.length>1?randomTrackIdx(MENU_TRACK_INDEX):0):MP.idx;
    playTrack(ni,changed);
  }
}
let bootDone=false;
function musicStart(){
  if(MP.started)return;
  MP.started=true;
  if(!MP.mode)MP.mode='menu';
  if(MP.mode==='menu')MP.idx=MENU_TRACK_INDEX;
  if(bootDone)playTrack(MP.mode==='menu'?MENU_TRACK_INDEX:MP.idx,false);
}
function musKick(){
  if(!MP.started||!bootDone)return;
  applyVol();
  if(musicAudio.paused)playTrack(MP.idx,false);
}
function fadeMusicDuck(to,durationMs){
  to=clampAudio(to);durationMs=Math.max(0,Number(durationMs)||0);
  const token=++musicFadeToken,start=musicDuck,started=performance.now();
  if(!durationMs){musicDuck=to;applyVol();return;}
  function step(ts){
    if(token!==musicFadeToken)return;
    const p=Math.min(1,(ts-started)/durationMs);
    musicDuck=start+(to-start)*p;applyVol();
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function duck(v,when,ramp){
  setTimeout(()=>fadeMusicDuck(v,(ramp||0.15)*1000),Math.max(0,(when||0)*1000));
}
/* ---------- molecule completion sounds ---------- */
const MSND={
  splash(){nz(sfxG,now(),0.42,0.24,'lowpass',1500,240);[620,830,1080].forEach((f,i)=>tone(f,0.09,'sine',0.09,0.1+i*0.09));nz(sfxG,now()+0.05,0.25,0.09,'bandpass',900,null,2);},
  crys(){[1568,1976,2637,3136].forEach((f,i)=>osc(sfxG,f,now()+i*0.07,0.55,'sine',0.08,{atk:0.004}));for(let i=0;i<6;i++)tone(4000+Math.random()*1800,0.05,'sine',0.028,0.06*i);},
  smoke(){nz(sfxG,now(),0.55,0.2,'lowpass',600,180);nz(sfxG,now()+0.1,0.4,0.08,'bandpass',400,null,1.2);},
  bub(){for(let i=0;i<6;i++)tone(480+Math.random()*450,0.07,'sine',0.07,i*0.07,900);},
  pop(){for(let i=0;i<5;i++)tone(300,0.05,'square',0.08,i*0.07,85);},
  drip(){[900,760,980,700].forEach((f,i)=>tone(f,0.1,'sine',0.08,i*0.11,f*0.55));},
  squig(){osc(sfxG,400,now(),0.45,'triangle',0.12,{f2:170,vib:11,vibd:26});nz(sfxG,now()+0.1,0.3,0.06,'bandpass',700,300,1.5);},
  spark(){for(let i=0;i<6;i++)tone(1900+Math.random()*600,0.04,'square',0.06,i*0.05,380);},
  glit(){[1046.5,1318.5,1568,2093].forEach((f,i)=>tone(f,0.12,'sine',0.07,i*0.06));},
  flame(){nz(sfxG,now(),0.4,0.18,'bandpass',260,900,1.2);for(let i=0;i<8;i++)nz(sfxG,now()+0.05+Math.random()*0.35,0.03,0.07,'highpass',3000);}
};
/* ---------- victory jingle (original signature motif) ---------- */
function jingle(stars){
  const t=now();duck(0.14,0,0.12);
  [[523.25,0],[659.25,0.11],[783.99,0.22]].forEach(p=>{
    osc(sfxG,p[0],t+p[1],0.16,'sine',0.12,{lp:4200,atk:0.004});
    osc(sfxG,p[0]*3,t+p[1],0.08,'sine',0.03,{atk:0.004});
  });
  const tc=t+0.36;
  [523.25,659.25,783.99,1174.66].forEach(f=>osc(sfxG,f,tc,0.9,'sine',0.065,{atk:0.01}));
  osc(sfxG,120,tc,0.15,'sine',0.2,{f2:45});
  nz(sfxG,tc,0.5,0.05,'highpass',6000);
  for(let i=0;i<6;i++)osc(sfxG,900+i*260,t+0.42+i*0.05,0.09,'sine',0.05,{atk:0.004});
  let end=1.6;
  if(stars===3){
    const tf=t+1.05;
    [0,0.09,0.18,0.27].forEach(w=>{osc(sfxG,110,tf+w,0.1,'sine',0.2,{f2:50});nz(sfxG,tf+w,0.05,0.11,'highpass',5000);});
    [1046.5,1318.5,1568,2093].forEach((f,i)=>osc(sfxG,f,tf+0.36+i*0.07,0.5,'sine',0.08,{atk:0.006}));
    osc(sfxG,2093,tf+0.66,1.1,'sine',0.055,{vib:6,vibd:28,atk:0.01});
    end=2.7;
  }
  duck(1,end,0.8);
}

/* ================= V8.4.38 · MOLECULE COMPLETION CINEMATIC ================= */
function mxFxQuality(){
  const mem=Number(navigator.deviceMemory||4),cores=Number(navigator.hardwareConcurrency||4);
  return (mem<=2||cores<=2)?'low':(mem<=4||cores<=4)?'mid':'high';
}
function clearMoleculeCompletionFx(){
  const old=document.getElementById('mxMoleculeFinishFx');if(old)old.remove();
  document.body.classList.remove('mxMoleculeCompleting');
}
function showMoleculeCompletionFx(){
  clearMoleculeCompletionFx();
  const br=board.getBoundingClientRect();if(!br.width||!br.height)return;
  const reduced=motionReduced(),quality=mxFxQuality();
  const scale=Math.max(.72,Math.min(1.12,Math.min(br.width/620,innerHeight/900)));
  const pts=atoms.map(a=>({x:br.left+(a.x+.5)*(br.width/W),y:br.top+(a.y+.5)*(br.height/H),e:a.e}));
  const minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x));
  const minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  const rx=Math.max(54*scale,(maxX-minX)/2+34*scale),ry=Math.max(38*scale,(maxY-minY)/2+25*scale);
  const wrap=document.createElement('div');wrap.id='mxMoleculeFinishFx';wrap.style.setProperty('--mxfx-scale',String(scale));
  const atomHalos=pts.map((p,i)=>'<i class="mxAtomHalo" style="left:'+p.x+'px;top:'+p.y+'px;animation-delay:'+(i*.035)+'s"></i>').join('');
  const bondLights=[];
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const dx=atoms[j].x-atoms[i].x,dy=atoms[j].y-atoms[i].y;if(Math.abs(dx)+Math.abs(dy)!==1)continue;
    if(!curMol.bs.has(atoms[i].e+','+atoms[j].e+','+dx+','+dy))continue;
    const a=pts[i],b=pts[j],len=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x);
    bondLights.push('<i class="mxBondLight" style="left:'+a.x+'px;top:'+a.y+'px;width:'+len+'px;--mx-bond-angle:'+ang+'rad;animation-delay:'+(0.09+bondLights.length*.095)+'s"></i>');
  }
  const finalIndex=Math.max(0,Math.min(atoms.length-1,Number.isInteger(sel)?sel:atoms.length-1)),finalPt=pts[finalIndex],finalAtom=atoms[finalIndex]||atoms[atoms.length-1];
  const finalPop=finalPt?('<div class="mxFinalAtomPop" style="left:'+finalPt.x+'px;top:'+finalPt.y+'px"><b>'+String(finalAtom&&finalAtom.e||'⚛')+'</b><i></i></div>'):'';
  wrap.innerHTML='<div class="mxEnergyRing" style="left:'+cx+'px;top:'+cy+'px"></div>'+
    '<div class="mxOrbit mxOrbitA" style="left:'+cx+'px;top:'+cy+'px;width:'+(rx*2)+'px;height:'+(ry*2)+'px"><b></b><b></b></div>'+
    '<div class="mxOrbit mxOrbitB" style="left:'+cx+'px;top:'+cy+'px;width:'+(rx*1.72)+'px;height:'+(ry*2.32)+'px"><b></b></div>'+
    bondLights.join('')+atomHalos+finalPop; // Molecule-specific SPLASH / PUFF / ZAP remains in the synchronized banner.
  document.body.appendChild(wrap);document.body.classList.add('mxMoleculeCompleting');
  if(!reduced){void wrap.offsetWidth;wrap.classList.add('on');}
  if(effectsAllowed()){
    const count=quality==='low'?12:quality==='mid'?20:28;
    const cols=(curMol&&Array.isArray(curMol.c)&&curMol.c.length)?curMol.c:['#8fe9ff','#fff4a8','#ffffff'];
    for(let q=0;q<count;q++){
      const a=q/count*Math.PI*2+(Math.random()-.5)*.22,sp=(quality==='low'?1.2:1.5)+Math.random()*(quality==='high'?2.7:2.0);
      P({k:'glit',x:cx+(Math.random()-.5)*18,y:cy+(Math.random()-.5)*18,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-.45,r:1.3+Math.random()*2.3,c:rnd([...cols,'#ffffff']),life:.72+Math.random()*.36,d:q*.006});
    }
  }
  gameFeelImpact('medium'); // winSeq already sends the single success haptic.
  setTimeout(clearMoleculeCompletionFx,reduced?650:1500);
}
function installCompletionCinematicStyles(){
  if(document.getElementById('mxCompletionCinematicStyles'))return;
  const st=document.createElement('style');st.id='mxCompletionCinematicStyles';st.textContent=`
    #mxMoleculeFinishFx{position:fixed;inset:0;z-index:95;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .12s ease}
    #mxMoleculeFinishFx.on{opacity:1}
    #mxMoleculeFinishFx .mxAtomHalo{position:fixed;width:calc(58px * var(--mxfx-scale));height:calc(58px * var(--mxfx-scale));border-radius:50%;transform:translate(-50%,-50%) scale(.45);opacity:0;background:radial-gradient(circle,rgba(255,255,255,.92) 0,rgba(132,238,255,.34) 34%,rgba(156,113,255,.14) 58%,transparent 72%);filter:blur(.2px);animation:mxAtomFlash 1.05s cubic-bezier(.18,.84,.22,1) both}
    #mxMoleculeFinishFx .mxEnergyRing{position:fixed;width:calc(72px * var(--mxfx-scale));height:calc(72px * var(--mxfx-scale));border-radius:50%;transform:translate(-50%,-50%) scale(.25);border:calc(3px * var(--mxfx-scale)) solid rgba(182,244,255,.88);box-shadow:0 0 calc(25px * var(--mxfx-scale)) rgba(107,224,255,.7),inset 0 0 calc(18px * var(--mxfx-scale)) rgba(255,255,255,.5);animation:mxEnergyExpand 1.12s cubic-bezier(.14,.72,.18,1) both}
    #mxMoleculeFinishFx .mxOrbit{position:fixed;border:calc(1.7px * var(--mxfx-scale)) solid rgba(174,239,255,.62);border-radius:50%;transform:translate(-50%,-50%) rotate(-14deg) scale(.5);opacity:0;filter:drop-shadow(0 0 calc(5px * var(--mxfx-scale)) rgba(99,220,255,.8));animation:mxOrbitIn 1.18s ease-out both}
    #mxMoleculeFinishFx .mxOrbitB{transform:translate(-50%,-50%) rotate(63deg) scale(.5);animation-delay:.05s}
    #mxMoleculeFinishFx .mxOrbit b{position:absolute;width:calc(8px * var(--mxfx-scale));height:calc(8px * var(--mxfx-scale));border-radius:50%;background:#fff;box-shadow:0 0 calc(8px * var(--mxfx-scale)) #7ff0ff,0 0 calc(15px * var(--mxfx-scale)) #8f72ff;top:50%;left:-4px;animation:mxElectronPulse .42s ease-in-out infinite alternate}
    #mxMoleculeFinishFx .mxOrbit b:nth-child(2){left:auto;right:-4px;animation-delay:-.2s}
    #mxMoleculeFinishFx .mxBondLight{position:fixed;height:calc(8px * var(--mxfx-scale));border-radius:999px;transform-origin:0 50%;transform:translateY(-50%) rotate(var(--mx-bond-angle)) scaleX(0);opacity:0;background:linear-gradient(90deg,rgba(255,255,255,.2),#ffffff 34%,#74ecff 62%,rgba(155,111,255,.15));box-shadow:0 0 calc(8px * var(--mxfx-scale)) rgba(117,235,255,.95),0 0 calc(17px * var(--mxfx-scale)) rgba(132,102,255,.64);animation:mxBondIgnite 1.14s cubic-bezier(.18,.84,.22,1) both}
    #mxMoleculeFinishFx .mxFinalAtomPop{position:fixed;width:calc(62px * var(--mxfx-scale));height:calc(62px * var(--mxfx-scale));transform:translate(-50%,-50%) scale(.28);border-radius:50%;display:grid;place-items:center;opacity:0;background:radial-gradient(circle at 34% 28%,#fff 0 8%,#baf5ff 20%,rgba(91,216,255,.54) 48%,rgba(147,99,255,.1) 70%,transparent 74%);box-shadow:0 0 calc(18px * var(--mxfx-scale)) rgba(110,232,255,.95);animation:mxFinalAtomSnap .92s cubic-bezier(.16,1.22,.28,1) both}
    #mxMoleculeFinishFx .mxFinalAtomPop b{font:1000 calc(18px * var(--mxfx-scale))/1 system-ui,-apple-system,sans-serif;color:#10263c;text-shadow:0 1px rgba(255,255,255,.8)}
    #mxMoleculeFinishFx .mxFinalAtomPop i{position:absolute;inset:0;border-radius:50%;border:calc(2px * var(--mxfx-scale)) solid rgba(255,255,255,.92);animation:mxFinalAtomRing .8s ease-out both}
    #mxMoleculeFinishFx .mxChemWord{position:fixed;transform:translate(-50%,-50%) scale(.72);font:900 clamp(32px,calc(48px * var(--mxfx-scale)),58px)/1 system-ui,sans-serif;letter-spacing:.04em;color:#fff4be;text-shadow:0 3px 0 #a65b12,0 7px 16px rgba(0,0,0,.62),0 0 22px rgba(255,213,87,.65);opacity:0;white-space:nowrap;animation:mxChemWord 1.25s cubic-bezier(.18,.82,.18,1) both}
    body.mxMoleculeCompleting #gameBoard,body.mxMoleculeCompleting canvas#board{filter:brightness(1.08) saturate(1.06)}
    @keyframes mxAtomFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.35)}24%{opacity:1;transform:translate(-50%,-50%) scale(1.24)}68%{opacity:.72;transform:translate(-50%,-50%) scale(.98)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.34)}}
    @keyframes mxEnergyExpand{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}18%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(5.8)}}
    @keyframes mxOrbitIn{0%{opacity:0}18%{opacity:.9;transform:translate(-50%,-50%) rotate(-14deg) scale(.82)}55%{opacity:.8;transform:translate(-50%,-50%) rotate(155deg) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) rotate(335deg) scale(1.08)}}
    @keyframes mxElectronPulse{to{transform:scale(1.32);filter:brightness(1.4)}}
    @keyframes mxBondIgnite{0%{opacity:0;transform:translateY(-50%) rotate(var(--mx-bond-angle)) scaleX(0)}18%{opacity:1}52%{opacity:1;transform:translateY(-50%) rotate(var(--mx-bond-angle)) scaleX(1.06)}78%{opacity:.92;transform:translateY(-50%) rotate(var(--mx-bond-angle)) scaleX(1)}100%{opacity:0;transform:translateY(-50%) rotate(var(--mx-bond-angle)) scaleX(1)}}
    @keyframes mxFinalAtomSnap{0%{opacity:0;transform:translate(-50%,-50%) scale(.22)}38%{opacity:1;transform:translate(-50%,-50%) scale(1.22)}64%{transform:translate(-50%,-50%) scale(.94)}82%{opacity:1;transform:translate(-50%,-50%) scale(1.03)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.18)}}
    @keyframes mxFinalAtomRing{0%{opacity:1;transform:scale(.65)}100%{opacity:0;transform:scale(2.15)}}
    @keyframes mxChemWord{0%{opacity:0;transform:translate(-50%,-50%) scale(.45) rotate(-4deg)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.14) rotate(1deg)}48%{transform:translate(-50%,-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-64%) scale(.92)}}
    .screen{transition:opacity .32s cubic-bezier(.22,.7,.2,1),transform .32s cubic-bezier(.22,.7,.2,1)!important}
    .btn,.iconBtn,.dpad button{transition:transform .11s cubic-bezier(.2,.9,.25,1.35),filter .14s ease,box-shadow .14s ease!important}
    .btn:active,.iconBtn:active,.dpad button:active{filter:brightness(1.12) saturate(1.08)}
    @media(max-width:380px){#mxMoleculeFinishFx .mxChemWord{font-size:clamp(27px,10vw,39px)}}
    @media(min-width:700px){#mxMoleculeFinishFx{--mxfx-scale:1.08}}
    @media(prefers-reduced-motion:reduce){#mxMoleculeFinishFx .mxOrbit{display:none}#mxMoleculeFinishFx .mxAtomHalo,#mxMoleculeFinishFx .mxEnergyRing,#mxMoleculeFinishFx .mxChemWord{animation-duration:.55s!important}.screen{transition-duration:.15s!important}}
  `;document.head.appendChild(st);
}
setTimeout(installCompletionCinematicStyles,0);

/* ---------- dynamic intensity: reacts to how close the molecule is ---------- */
let lastBondLine=false,prevB=0;
function bondsMatched(){
  let n=0;
  for(let i=0;i<atoms.length;i++)for(let k=i+1;k<atoms.length;k++){
    const dx=atoms[k].x-atoms[i].x,dy=atoms[k].y-atoms[i].y;
    if(Math.abs(dx)+Math.abs(dy)!==1)continue;
    if(curMol.bs.has(atoms[i].e+','+atoms[k].e+','+dx+','+dy))n++;
  }
  return n;
}
let mxReactionStreak=0,mxReactionAt=0;
function showReactionCallout(kind,mult=1){
  if(motionReduced())return;
  let el=document.getElementById('mxReactionCallout');
  if(!el){el=document.createElement('div');el.id='mxReactionCallout';document.body.appendChild(el);}
  const tr=LANG==='tr';
  const copy=kind==='perfect'?(ml("MÜKEMMEL BAĞ","PERFECT BOND","PERFEKTE BINDUNG","ENLACE PERFECTO","LIGAÇÃO PERFEITA","完璧な結合")):
    kind==='chain'?((ml("ZİNCİR REAKSİYON","CHAIN REACTION","KETTENREAKTION","REACCIÓN EN CADENA","REAÇÃO EM CADEIA","連鎖反応"))+' ×'+Math.max(2,mult)):
    (ml("REAKSİYON","REACTION","REAKTION","REACCIÓN","REAÇÃO","反応"));
  el.className=kind;el.innerHTML='<b>'+copy+'</b><span>'+(kind==='perfect'?'⚛ ✦ ⚛':kind==='chain'?'⚡ ⚛ ⚡':'⚛ + ⚛')+'</span>';
  void el.offsetWidth;el.classList.add('on');
  if(kind==='perfect'){SFX.sparkle();mxHaptic('success');}
  else if(kind==='chain'){SFX.select();mxHaptic('medium');}
  setTimeout(()=>{if(el)el.classList.remove('on');},920);
}
function showFinalWow(perf,stars){
  if(!perf||motionReduced())return;
  const kind=(stars===3&&perf.key==='genius')?'nobel':(stars===3?'brilliant':null);if(!kind)return;
  let el=document.getElementById('mxFinalWow');if(!el){el=document.createElement('div');el.id='mxFinalWow';document.body.appendChild(el);}
  el.className=kind;el.textContent=kind==='nobel'?(ml("NOBEL HAMLESİ!","NOBEL MOVE!","NOBEL-ZUG!","¡JUGADA NOBEL!","JOGADA NOBEL!","ノーベルムーブ！")):(ml("MUHTEŞEM REAKSİYON!","BRILLIANT REACTION!","BRILLANTE REAKTION!","¡REACCIÓN BRILLANTE!","REAÇÃO BRILHANTE!","見事な反応！"));
  void el.offsetWidth;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),1500);
}
function wallBreakDustFx(gx,gy){
  const br=board.getBoundingClientRect(),cx=br.left+(gx+.5)*T,cy=br.top+(gy+.5)*T;
  SFX.wallBreak();gameFeelImpact('medium');
  if(!effectsAllowed())return;
  for(let q=0;q<14;q++)P({k:'smoke',x:cx+(Math.random()-.5)*T*.28,y:cy+(Math.random()-.5)*T*.22,vx:(Math.random()-.5)*1.3,vy:-.25-Math.random()*1.15,r:6+Math.random()*10,c:q%3?'#9b8873':'#cbb9a2',life:.75+Math.random()*.5,d:q*.008});
  for(let q=0;q<24;q++){const a=Math.random()*Math.PI*2,sp=1.1+Math.random()*4.1;P({k:'crys',x:cx+(Math.random()-.5)*8,y:cy+(Math.random()-.5)*8,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.5,w:3+Math.random()*7,rot:Math.random()*7,vr:(Math.random()-.5)*.55,c:q%3===0?'#d7c5ae':q%3===1?'#9c856e':'#6f5d4d',life:1.05+Math.random()*.45,d:q*.006});}
  for(let q=0;q<20;q++){const a=q/20*Math.PI*2,sp=2+Math.random()*3;P({k:'glit',x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,r:1+Math.random()*2,c:q%2?'#eadbc8':'#8c7762',life:.55,d:q*.004});}
  P({k:'ring',x:cx,y:cy,r:7,vr2:115,c:'#f3dfc4',life:.42});
}
function updateIntensity(){
  if(!curMol)return;
  const total=curMol.bs.size/2,m=bondsMatched();
  if(!won&&m>prevB){
    const delta=m-prevB,nowMs=performance.now();
    mxReactionStreak=(nowMs-mxReactionAt<1450)?mxReactionStreak+delta:delta;mxReactionAt=nowMs;
    setDrEPose('molecule',m>=total&&total>0?5000:4300,5);
    einMood('nod',560);
    if(m>=total&&total>0)showReactionCallout('perfect',mxReactionStreak);
    else if(delta>1||mxReactionStreak>=2)showReactionCallout('chain',mxReactionStreak);
    else showReactionCallout('reaction',1);
  }
  if(m<prevB){mxReactionStreak=0;mxReactionAt=0;}
  prevB=m;
  let n=0;
  if(total>=2&&m>=total-1&&m>0)n=2;else if(m>=1)n=1;
  setIntensity(won?1:n);
  const close=n===2&&!won;
  const goalCard=$('#goalCard');
  if(goalCard){
    goalCard.classList.toggle('mxGoalBreath',!won&&!close);
    goalCard.classList.toggle('mxGoalNear',close);
  }
  if(close&&!exc){
    setExcited(true);
    if(!lastBondLine){lastBondLine=true;prop('⚡',1250);say(t('almostOneBond'),'happy',2600);}
  }
  if(!close&&exc)setExcited(false);
}
/* ================= DOM / NAV ================= */
const $=s=>document.querySelector(s);
function bindTap(target,handler){
  const el=typeof target==='string'?$(target):target;if(!el)return null;
  let last=0,downX=0,downY=0,tracking=false;
  const activate=e=>{
    const now=performance.now();if(now-last<85)return;last=now;
    if(e&&e.preventDefault)e.preventDefault();
    handler(e||{currentTarget:el,target:el});
  };
  el.addEventListener('pointerdown',e=>{
    if(e.button!=null&&e.button!==0)return;
    downX=e.clientX;downY=e.clientY;tracking=true;
    try{el.setPointerCapture(e.pointerId);}catch(_){ }
  },{passive:true});
  el.addEventListener('pointerup',e=>{
    if(!tracking)return;tracking=false;
    if(Math.hypot(e.clientX-downX,e.clientY-downY)<=18)activate(e);
  },{passive:false});
  el.addEventListener('pointercancel',()=>{tracking=false;},{passive:true});
  el.addEventListener('click',e=>{if(e.detail===0)activate(e);},{passive:false});
  return el;
}
/* ================= PLAYER LAB / SHOP / NOBEL RACE ================= */
const LAB_ITEMS=[
  {id:'gold_scope',price:250,unlock:10,theme:'basic',icon:'🔬',name:{tr:'Altın Kaplama Mikroskop',en:'Gold-Plated Microscope',de:'Vergoldetes Mikroskop',es:'Microscopio dorado',pt:'Microscópio dourado',ja:'金メッキ顕微鏡'},desc:{tr:'Yeni keşiflerden +5 ek MoleCoin kazandırır.',en:'Earn +5 extra MoleCoins from new discoveries.'}},
  {id:'holo_table',price:400,unlock:20,theme:'basic',icon:'🧬',name:{tr:'Holografik Periyodik Tablo',en:'Holographic Periodic Table',de:'Holografisches Periodensystem',es:'Tabla periódica holográfica',pt:'Tabela periódica holográfica',ja:'ホログラム周期表'},desc:{tr:'Kesin ipuçlarının jeton bedelini %20 düşürür.',en:'Reduces exact-hint coin costs by 20%.'}},
  {id:'quantum_desk',price:650,unlock:40,theme:'basic',icon:'💻',name:{tr:'Kuantum Araştırma Masası',en:'Quantum Research Desk',de:'Quanten-Forschungstisch',es:'Mesa de investigación cuántica',pt:'Mesa de pesquisa quântica',ja:'量子研究デスク'},desc:{tr:'Her UTC gününde bir kesin hamle ipucunu ücretsiz verir.',en:'Grants one free exact-move hint per UTC day.'}},
  {id:'robot',price:850,unlock:60,theme:'basic',icon:'🤖',name:{tr:'Robot Laboratuvar Asistanı',en:'Robot Lab Assistant',de:'Roboter-Laborassistent',es:'Asistente robótico de laboratorio',pt:'Assistente robótico de laboratório',ja:'ロボット研究助手'},desc:{tr:'Günün Deneyi ilk ödülüne +5 MoleCoin ekler.',en:'Adds +5 MoleCoins to the first Daily Experiment reward.'}},
  {id:'collider',price:1100,unlock:80,theme:'collider',icon:'⚛️',name:{tr:'Parçacık Çarpıştırıcı Konsolu',en:'Particle Collider Console'},desc:{tr:'İlk bonus görevi ödüllerine +20 MoleCoin ekler.',en:'Adds +20 MoleCoins to first-clear bonus mission rewards.'}},
  {id:'arctic',price:1400,unlock:100,theme:'arctic',icon:'❄️',name:{tr:'Kutup Araştırma İstasyonu',en:'Polar Research Station'},desc:{tr:'Kutup laboratuvarı temasını ve özel araştırma görevini açar.',en:'Unlocks the polar-lab theme and a special research expedition.'}},
  {id:'mars',price:1800,unlock:120,theme:'mars',icon:'🚀',name:{tr:'Mars Numune Kapsülü',en:'Mars Sample Capsule'},desc:{tr:'Mars laboratuvarı temasını ve final araştırma görevini açar.',en:'Unlocks the Mars-lab theme and the final research expedition.'}}

];
function labTutorialKey(id){return '__lab_tutorial_'+id;}
function labTutorialSeen(id){ensureResearchState(save);return !!save.researchAchievements[labTutorialKey(id)];}
function markLabTutorialSeen(id){ensureResearchState(save);save.researchAchievements[labTutorialKey(id)]=1;save.researchAchievements[trainingLearnKey('lab',id)]=1;persist();}
function labEquipmentTutorial(id,onDone){
  const it=LAB_ITEMS.find(x=>x.id===id);if(!it){if(onDone)onDone();return;}
  const tr=LANG==='tr';
  const demos={
    gold_scope:{before:ml("Yeni keşif: normal ödül","New discovery: normal reward","Neue Entdeckung: normale Belohnung","Nuevo descubrimiento: recompensa normal","Nova descoberta: recompensa normal","新発見：通常報酬"),after:ml("Ödül +5 MoleCoin","Reward +5 MoleCoins","Belohnung +5 MoleCoins","Recompensa +5 MoleCoins","Recompensa +5 MoleCoins","報酬 +5 MoleCoin"),note:ml("Yeni bir molekülü ilk kez keşfettiğinde ödülüne otomatik +5 MoleCoin eklenir.","The first time you discover a molecule, +5 MoleCoins are added automatically.","Bei der ersten Entdeckung eines Moleküls werden automatisch 5 MoleCoins hinzugefügt.","La primera vez que descubres una molécula, se añaden automáticamente 5 MoleCoins.","Na primeira descoberta de uma molécula, 5 MoleCoins são adicionadas automaticamente.","分子を初めて発見すると、MoleCoinが自動で5枚追加されます。")},
    holo_table:{before:ml("Kesin hamle: 50 🪙","Exact move: 50 🪙","Exakter Zug: 50 🪙","Movimiento exacto: 50 🪙","Movimento exato: 50 🪙","正確な一手：50 🪙"),after:ml("Kesin hamle: 40 🪙","Exact move: 40 🪙","Exakter Zug: 40 🪙","Movimiento exacto: 40 🪙","Movimento exato: 40 🪙","正確な一手：40 🪙"),note:ml("Kesin ipucu fiyatları otomatik olarak %20 düşer.","Exact-hint prices are reduced automatically by 20%.","Die Preise für exakte Hinweise sinken automatisch um 20 %.","Los precios de las pistas exactas se reducen automáticamente un 20 %.","Os preços das dicas exatas são reduzidos automaticamente em 20%.","正確なヒントの価格が自動で20%下がります。")},
    quantum_desk:{before:ml("Ücretsiz kesin ipucu: 0","Free exact hint: 0","Kostenlose exakte Hinweise: 0","Pistas exactas gratis: 0","Dicas exatas grátis: 0","無料の正確なヒント：0"),after:ml("Her gün ücretsiz: 1","Daily free: 1","Täglich kostenlos: 1","Gratis al día: 1","Grátis por dia: 1","1日1回無料"),note:ml("Her UTC gününde ilk kesin hamle ipucun ücretsiz olur.","Your first exact-move hint each UTC day is free.","Der erste exakte Zughinweis jedes UTC-Tages ist kostenlos.","La primera pista de movimiento exacto de cada día UTC es gratis.","A primeira dica de movimento exato de cada dia UTC é grátis.","UTC日ごとの最初の正確な一手ヒントは無料です。")},
    robot:{before:ml("Günün Deneyi ödülü","Daily Experiment reward","Belohnung für das Tagesexperiment","Recompensa del Experimento Diario","Recompensa do Experimento Diário","今日の実験の報酬"),after:tr?'+5 MoleCoin bonus':'+5 MoleCoin bonus',note:tr?'Günün Deneyi’nin o günkü ilk ödülüne otomatik +5 MoleCoin eklenir.':'Adds +5 MoleCoins automatically to the first Daily Experiment reward of the day.'},
    collider:{before:ml("İlk bonus görevi","First bonus mission","Erste Bonusmission","Primera misión extra","Primeira missão bônus","最初のボーナスミッション"),after:tr?'+20 MoleCoin bonus':'+20 MoleCoin bonus',note:ml("İlk kez tamamlanan bonus görevlerinin ödülüne +20 MoleCoin eklenir.","Adds +20 MoleCoins to first-clear bonus mission rewards.","Fügt Belohnungen für erstmals abgeschlossene Bonusmissionen 20 MoleCoins hinzu.","Añade 20 MoleCoins a la recompensa de una misión extra completada por primera vez.","Adiciona 20 MoleCoins à recompensa da primeira conclusão de uma missão bônus.","ボーナスミッション初回クリア報酬にMoleCoinを20枚追加します。")},
    arctic:{before:ml("Standart laboratuvar","Standard laboratory","Standardlabor","Laboratorio estándar","Laboratório padrão","標準ラボ"),after:ml("Kutup teması + sefer","Polar theme + expedition","Polarthema + Expedition","Tema polar + expedición","Tema polar + expedição","極地テーマ＋遠征"),note:ml("Kutup laboratuvarı görünümünü ve Kutup Molekül Araştırması görevini açar.","Unlocks the polar laboratory theme and Polar Molecule Survey expedition.","Schaltet das Polarlabor-Design und die Expedition „Polare Molekülsuche“ frei.","Desbloquea el tema de laboratorio polar y la expedición Estudio de Moléculas Polares.","Desbloqueia o tema de laboratório polar e a expedição Pesquisa de Moléculas Polares.","極地ラボテーマと「極地分子調査」遠征を解放します。")},
    mars:{before:ml("Standart laboratuvar","Standard laboratory","Standardlabor","Laboratorio estándar","Laboratório padrão","標準ラボ"),after:ml("Mars teması + final seferi","Mars theme + final expedition","Marsthema + finale Expedition","Tema de Marte + expedición final","Tema de Marte + expedição final","火星テーマ＋最終遠征"),note:ml("Mars laboratuvarı görünümünü ve Mars Numune Görevi’ni açar.","Unlocks the Mars laboratory theme and Mars Sample Mission.","Schaltet das Marslabor-Design und die Marsproben-Mission frei.","Desbloquea el tema de laboratorio de Marte y la Misión de Muestras Marcianas.","Desbloqueia o tema de laboratório de Marte e a Missão de Amostras Marcianas.","火星ラボテーマと「火星サンプル任務」を解放します。")}
  };
  const d=demos[id]||{before:'—',after:'✓',note:lx(it.desc)};
  const labGuide=ml("Bu cihazın önceki ve sonraki etkisini karşılaştır. Sonra parlayan düğmeyle kaydet.","Compare the before-and-after effect, then use the glowing button to save the lesson.","Vergleiche die Wirkung vorher und nachher und speichere die Lektion dann mit der leuchtenden Taste.","Compara el efecto antes y después y usa el botón brillante para guardar la lección.","Compare o efeito antes e depois e use o botão brilhante para salvar a lição.","効果の前後を比べ、光るボタンでレッスンを保存してください。");
  openModal('<div style="font-size:.72rem;font-weight:900;letter-spacing:.12em;color:#78e7ff;margin-bottom:5px">'+(ml("LABORATUVAR EKİPMANI","LAB EQUIPMENT","LABORAUSRÜSTUNG","EQUIPO DE LABORATORIO","EQUIPAMENTO DE LABORATÓRIO","ラボ装置"))+'</div><h3>'+it.icon+' '+lx(it.name)+'</h3>'+drETrainingCard(labGuide,'1/1')+'<div class="labModalAsset item-'+it.id+'">'+labItemVisualHtml(it.id,false)+'</div><div class="msub">'+lx(it.desc)+'</div><div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:15px 0;flex-wrap:wrap"><span class="btn ghost" style="pointer-events:none">'+d.before+'</span><b>→</b><span class="btn green" style="pointer-events:none">'+d.after+'</span></div><div class="msub">'+d.note+'</div><div class="mrow"><button class="btn green mxGuidedTarget" id="mLabTutorialOk">✓ '+(ml("ANLADIM","GOT IT","VERSTANDEN","ENTENDIDO","ENTENDI","わかった"))+'</button></div>');
  bindTap('#mLabTutorialOk',()=>{const b=$('#mLabTutorialOk');if(b)b.classList.remove('mxGuidedTarget');markLabTutorialSeen(id);closeModal();SFX.star(1);prop('🎓 '+(ml("Laboratuvar desteği öğrenildi","Lab support learned","Laborunterstützung gelernt","Apoyo de laboratorio aprendido","Suporte de laboratório aprendido","ラボ支援を習得しました")),2000);if(onDone)onDone();});
}
function nextUnlockedLabTutorial(){return LAB_ITEMS.find(it=>save.cur>=it.unlock&&!labTutorialSeen(it.id));}
function maybeShowUnlockedLabTutorial(){const it=nextUnlockedLabTutorial();if(!it)return;/* Show only the next newly unlocked device, never an entire backlog at once. */setTimeout(()=>labEquipmentTutorial(it.id),260);}
function labEquipmentGuideModal(){
  const tr=LANG==='tr';
  const rows=LAB_ITEMS.map(it=>'<button class="btn ghost labGuideItem" data-lab-guide="'+it.id+'" style="width:100%;display:flex;align-items:center;gap:10px;text-align:left;justify-content:flex-start"><span style="font-size:1.4rem">'+it.icon+'</span><span><b>'+lx(it.name)+'</b><small style="display:block;opacity:.8">'+lx(it.desc)+'</small></span></button>').join('');
  openModal('<div class="labGuideHead"><h3>🧪 '+(ml("Laboratuvar Destekleri","Laboratory Supports","Laborunterstützungen","Apoyos de laboratorio","Suportes de laboratório","ラボ支援"))+'</h3></div><div class="settingsScroll labGuideScroll" style="display:grid;gap:8px">'+rows+'</div><div class="mrow modalFixedClose labGuideActions"><button class="btn ghost" id="mResetLabTutorials">'+(ml("Eğitimleri yeniden aç","Reset tutorials","Tutorials zurücksetzen","Reiniciar tutoriales","Reiniciar tutoriais","チュートリアルを再設定"))+'</button><button class="btn" id="mLabGuideClose">'+t('close')+'</button></div>');
  $('#modalBox').classList.add('mxTouchScrollModal','labGuideModal');
  document.querySelectorAll('[data-lab-guide]').forEach(b=>bindTap(b,()=>labEquipmentTutorial(b.dataset.labGuide,labEquipmentGuideModal)));
  bindTap('#mResetLabTutorials',()=>{ensureResearchState(save);LAB_ITEMS.forEach(it=>delete save.researchAchievements[labTutorialKey(it.id)]);persist();prop(ml("Laboratuvar eğitimleri yeniden etkinleştirildi.","Laboratory tutorials enabled again.","Labor-Tutorials wurden wieder aktiviert.","Los tutoriales de laboratorio se han reactivado.","Os tutoriais de laboratório foram reativados.","ラボチュートリアルを再び有効にしました。"),2200);});
  bindTap('#mLabGuideClose',()=>settingsModal());
}
const BOOSTER_ITEMS=[
  {id:'hammer',price:90,icon:'🔨',name:{tr:'Çekiç',en:'Hammer',de:'Hammer',es:'Martillo',pt:'Martelo',ja:'ハンマー'},desc:{tr:'Kırılabilir duvar bulunan uyumlu bölümlerde bir duvarı kırar.',en:'Breaks one breakable wall in compatible levels.'}},
  {id:'precision',price:120,icon:'↔️',name:{tr:'Tek Kare Hareket',en:'One-Square Move',de:'Ein-Feld-Zug',es:'Movimiento de una casilla',pt:'Movimento de uma casa',ja:'1マス移動'},desc:{tr:'Uyumlu bölümlerde seçilen atomu yalnızca bir kare taşır.',en:'Moves the selected atom exactly one square in compatible levels.'}},
  {id:'barrier',price:100,icon:'🧱',name:{tr:'Nano Bariyer',en:'Nano Barrier',de:'Nano-Barriere',es:'Barrera nano',pt:'Barreira nano',ja:'ナノバリア'},desc:{tr:'Bölüm başına bir kez boş kareye geçici blok koyar. İlk atom çarpışmasında kırılır.',en:'Places one temporary block per level on an empty tile. It breaks on the first atom collision.'}}
];
function boosterKey(id){return '__booster_'+id;}
function boosterCount(id){ensureResearchState(save);return Math.max(0,Math.floor(Number(save.researchAchievements[boosterKey(id)])||0));}
function addBooster(id,n=1){ensureResearchState(save);n=Math.max(0,Math.floor(Number(n)||0));save.researchAchievements[boosterKey(id)]=boosterCount(id)+n;return boosterCount(id);}
function spendBooster(id,n=1){ensureResearchState(save);n=Math.max(1,Math.floor(Number(n)||1));const have=boosterCount(id);if(have<n)return false;save.researchAchievements[boosterKey(id)]=have-n;persist();return true;}
function buyBooster(id,onBought){
  const it=BOOSTER_ITEMS.find(x=>x.id===id);if(!it)return;
  const enough=coinBalance()>=it.price;
  openModal('<h3>'+it.icon+' '+lx(it.name)+'</h3><div class="msub">'+lx(it.desc)+'</div><div class="mcoins">'+it.price+' <span class="coinIcon"></span></div><div class="msub">'+(ml("Mevcut: ","Owned: ","Besitz: ","En posesión: ","Possuído: ","所持："))+boosterCount(id)+'</div><div class="mrow"><button class="btn amber" id="mBoostBuy" '+(enough?'':'disabled')+'>'+(ml("SATIN AL","BUY","KAUFEN","COMPRAR","COMPRAR","購入"))+'</button><button class="btn ghost" id="mBoostCancel">'+t('cancel')+'</button></div>'+(enough?'':'<div class="msub" style="color:#ff9caa">'+(ml("Yeterli MoleCoin yok.","Not enough MoleCoins.","Nicht genug MoleCoins.","No hay suficientes MoleCoins.","MoleCoins insuficientes.","MoleCoinが足りません。"))+'</div>'));
  bindTap('#mBoostCancel',()=>closeModal());
  if(enough)bindTap('#mBoostBuy',()=>{if(!spendCoins(it.price))return;addBooster(id,1);persist();updateCoins(true);closeModal();SFX.coin();prop(it.icon+' +1',1800);if(typeof onBought==='function')onBought();else if(scr.lab&&scr.lab.classList.contains('on'))renderLabShop();});
}
const LAB_MISSIONS=[
  {id:'polar',item:'arctic',rewardCoins:200,rewardRP:150,title:{tr:'Kutup Molekül Araştırması',en:'Polar Molecule Survey'},desc:{tr:'Zor havuzdaki 8 bölümü 3 yıldızla tamamla.',en:'Complete 8 hard-pool levels with 3 stars.'},progress:()=>Object.entries(save.stars||{}).filter(([k,v])=>Number(k)>=100&&Number(v)===3).length,target:8},
  {id:'collider',item:'collider',rewardCoins:250,rewardRP:200,title:{tr:'Çarpıştırıcı Kalibrasyonu',en:'Collider Calibration'},desc:{tr:'6 Bonus Lab madalyası kazan.',en:'Earn 6 Bonus Lab medals.'},progress:()=>bonusMedalCount(),target:6},
  {id:'mars',item:'mars',rewardCoins:300,rewardRP:250,title:{tr:'Mars Numune Görevi',en:'Mars Sample Mission'},desc:{tr:'121–151 arasındaki 25 bölümü tamamla.',en:'Complete 25 levels from 121–151.'},progress:()=>Object.entries(save.stars||{}).filter(([k,v])=>Number(k)>=120&&Number(v)>0).length,target:25}
];
let labTabMode='overview';
let nobelIntel={world:null,week:null,month:null,champions:null,updated:0};
function lx(v){return v&&typeof v==='object'?(v[LANG]||v.en||v.tr||''):String(v||'');}
function ui6(tr,en,de,es,pt,ja){return ({tr,en,de,es,pt,ja}[LANG]||en||tr||'');}
function labKey(id){return 'lab_'+id;}
function labMissionKey(id){return 'labmission_'+id;}
function labOwned(id,s){s=s||save;return !!(s.achv&&s.achv[labKey(id)]);}
function labMissionClaimed(id,s){s=s||save;return !!(s.achv&&s.achv[labMissionKey(id)]);}
function ownedLabItems(){return LAB_ITEMS.filter(it=>labOwned(it.id));}
function currentLabTheme(){
  const allowed=['basic','collider','arctic','mars'];
  let th=syncedLabTheme(save);if(!allowed.includes(th))th='basic';
  if(th!=='basic'&&!LAB_ITEMS.some(it=>it.theme===th&&labOwned(it.id)))th='basic';
  return th;
}
function labHintCosts(){
  const discount=labOwned('holo_table')?.8:1;
  return {move:Math.max(20,Math.round(50*discount/5)*5),full:Math.max(100,Math.round(200*discount/10)*10)};
}
function quantumHintAvailable(){
  const used=Math.max(0,Math.floor(Number(save.researchAchievements&&save.researchAchievements[QUANTUM_DAY_KEY])||0));
  return labOwned('quantum_desk')&&used!==utcEpochDay();
}
function consumeQuantumHint(){
  if(!quantumHintAvailable())return false;
  save.researchAchievements[QUANTUM_DAY_KEY]=utcEpochDay();save.quantumHintDay=utcDayId();persist();return true;
}
function labItemVisualHtml(id,small){
  return '<span class="labAsset '+id+(small?' small':'')+'"><i></i><b></b><em></em></span>';
}
function buildLab(){
  ensureResearchState(save);ensureCoinLedger(save);applyBonusCosmetics();
  const coin=$('#labCoinChip span:last-child');if(coin)coin.textContent=coinBalance().toLocaleString();
  $('#labTitle').textContent=ui6('LABORATUVARIM','MY LABORATORY','MEIN LABOR','MI LABORATORIO','MEU LABORATÓRIO','マイラボ');
  document.querySelectorAll('.labTab').forEach((b,i)=>{const labels={tr:['LAB','MAĞAZA','NOBEL YARIŞI','ÖDÜLLER'],en:['LAB','SHOP','NOBEL RACE','REWARDS'],de:['LABOR','SHOP','NOBEL-RENNEN','BELOHNUNGEN'],es:['LAB','TIENDA','CARRERA NOBEL','RECOMPENSAS'],pt:['LAB','LOJA','CORRIDA NOBEL','RECOMPENSAS'],ja:['ラボ','ショップ','ノーベル競争','報酬']}[LANG]||['LAB','SHOP','NOBEL RACE','REWARDS'];const s=b.querySelector('span');if(s)s.textContent=labels[i];});
  renderLabOverview();renderLabShop();renderNobelPane();renderDuelRewards(false);setLabTab(labTabMode,true);
  maybeShowUnlockedLabTutorial();
}
function setLabTab(tab,silent){
  if(!['overview','shop','nobel','rewards'].includes(tab))tab='overview';labTabMode=tab;
  document.querySelectorAll('.labTab').forEach(b=>b.classList.toggle('on',b.dataset.labtab===tab));
  document.querySelectorAll('.labPane').forEach(p=>p.classList.toggle('on',p.id==='lab'+tab[0].toUpperCase()+tab.slice(1)+'Pane'));
  if(tab==='nobel')refreshNobelIntel(false);
  if(tab==='rewards'){renderDuelRewards(false);refreshClosedDuelRewards();}
  if(!silent){const sc=$('#labScrollArea');if(sc)sc.scrollTop=0;}
}
function renderLabOverview(){
  const tier=tierOf(save.cur),theme=currentLabTheme(),room=$('#labRoom');
  room.className='labRoom theme-'+theme;
  $('#labScientistIcon').textContent=DIPLOMAS[tier].icon;
  $('#labScientistTitle').textContent=t('rank'+tier).replace(/^\S+\s/,'').toUpperCase();
  $('#labScientistName').textContent=(save.playerName||curProfile||'PLAYER').slice(0,18);
  const placed=$('#labPlacedItems');
  placed.innerHTML=ownedLabItems().map((it,i)=>'<div class="labPlaced item-'+it.id+' slot'+i+'">'+labItemVisualHtml(it.id,false)+'</div>').join('')+
    ((currentMonthlyLaureate()&&isNobelMe(currentMonthlyLaureate()))?'<div class="labPlaced item-nobel_case nobelCase">'+labItemVisualHtml('nobel_case',false)+'</div>':'');
  const levelsDone=Object.values(save.stars||{}).filter(v=>Number(v)>0).length;
  const stars=Object.values(save.stars||{}).reduce((a,b)=>a+Math.max(0,Number(b)||0),0);
  const medals=bonusMedalCount();
  $('#labCareerStrip').innerHTML=[
    ['🏅',(save.researchPoints||0).toLocaleString(),'RP'],['⭐',stars,ui6('YILDIZ','STARS','STERNE','ESTRELLAS','ESTRELAS','スター')],['🧪',levelsDone+'/'+LEVELS.length,ui6('BÖLÜM','LEVELS','LEVEL','NIVELES','NÍVEIS','レベル')],['🎖️',medals,ui6('BONUS MADALYASI','BONUS MEDALS','BONUSMEDAILLEN','MEDALLAS EXTRA','MEDALHAS BÔNUS','ボーナスメダル')]
  ].map(x=>'<div class="labMetric"><span>'+x[0]+'</span><b>'+x[1]+'</b><small>'+x[2]+'</small></div>').join('');
  $('#labPurposeHead').textContent=ui6('🎯 NE İÇİN OYNUYORSUN?','🎯 WHY YOU PLAY','🎯 WARUM DU SPIELST','🎯 POR QUÉ JUEGAS','🎯 POR QUE VOCÊ JOGA','🎯 プレイする目的');
  const purposes=LANG==='tr'?
    [['🧩','Bölümler','Nobel adaylığına giden kariyer yolu.'],['⭐','Yıldızlar','Bir bulmacayı ne kadar ustaca çözdüğün.'],['🏅','RP','Dünya sıralamasındaki rekabet puanın.'],['🪙','MoleCoin','İpucu ve laboratuvar ekipmanı ekonomisi.'],['🎖️','Bonus Madalyası','Özel mekaniklerdeki başarın.'],['🏆','Nobel','300 ana bölümü tamamlayan adayın 301. Nobel Finalini geçmesiyle kazanılır.']]:
    [['🧩','Levels','Your career path toward Nobel candidacy.'],['⭐','Stars','How masterfully you solved a puzzle.'],['🏅','RP','Your competitive World Ranking score.'],['🪙','MoleCoins','The economy for hints and lab equipment.'],['🎖️','Bonus Medals','Your success in special mechanics.'],['🏆','Nobel','Won by completing the 301st Nobel Final after all 300 main levels.']];
  $('#labPurposeGrid').innerHTML=purposes.map(x=>'<div class="labPurpose"><span>'+x[0]+'</span><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div></div>').join('');
  $('#labMissionHead').textContent=ui6('🚀 ARAŞTIRMA SEFERLERİ','🚀 RESEARCH EXPEDITIONS','🚀 FORSCHUNGSEXPEDITIONEN','🚀 EXPEDICIONES DE INVESTIGACIÓN','🚀 EXPEDIÇÕES DE PESQUISA','🚀 研究遠征');
  $('#labMissionGrid').innerHTML=LAB_MISSIONS.map(m=>labMissionHtml(m)).join('');
  LAB_MISSIONS.forEach(m=>{const b=$('#claimMission_'+m.id);if(b)bindTap(b,()=>claimLabMission(m.id));});
}
function labMissionHtml(m){
  const unlocked=labOwned(m.item),claimed=labMissionClaimed(m.id),p=Math.min(m.target,Math.max(0,m.progress()));
  const ready=unlocked&&!claimed&&p>=m.target;
  const status=!unlocked?ui6('ÖNCE EKİPMANI SATIN AL','BUY THE EQUIPMENT FIRST','ZUERST AUSRÜSTUNG KAUFEN','COMPRA PRIMERO EL EQUIPO','COMPRE O EQUIPAMENTO PRIMEIRO','先に装備を購入'):claimed?ui6('TAMAMLANDI','COMPLETED','ABGESCHLOSSEN','COMPLETADO','CONCLUÍDO','完了'):(p+'/'+m.target);
  return '<div class="labMission '+(unlocked?'':'locked')+' '+(claimed?'claimed':'')+'"><div class="labMissionTop">'+labItemVisualHtml(m.item,true)+'<div><b>'+lx(m.title)+'</b><small>'+lx(m.desc)+'</small></div></div><div class="labProgress"><i style="width:'+(p/m.target*100)+'%"></i></div><div class="labMissionFoot"><span>'+status+'</span><span>+'+m.rewardCoins+' 🪙 · +'+m.rewardRP+' RP</span></div>'+(ready?'<button class="btn green missionClaim" id="claimMission_'+m.id+'">'+ui6('ÖDÜLÜ AL','CLAIM REWARD','BELOHNUNG HOLEN','RECLAMAR RECOMPENSA','RESGATAR RECOMPENSA','報酬を受け取る')+'</button>':'')+'</div>';
}
function claimLabMission(id){
  const m=LAB_MISSIONS.find(x=>x.id===id);if(!m||!labOwned(m.item)||labMissionClaimed(id)||m.progress()<m.target)return;
  save.achv[labMissionKey(id)]=1;
  const rpKey='labmission_'+id,old=Math.max(0,Number(save.researchAchievements[rpKey])||0);
  save.researchAchievements[rpKey]=Math.max(old,m.rewardRP);addResearchPoints(Math.max(0,m.rewardRP-old),0);addCoins(m.rewardCoins);
  persist();updateCoins(true);SFX.star(2);prop('🚀 +'+m.rewardCoins+' 🪙 · +'+m.rewardRP+' RP',3000);renderLabOverview();renderLabShop();
}
function renderLabShop(){
  $('#labShopTitle').textContent=ml("DR. E'NİN EKİPMAN MAĞAZASI","DR. E'S EQUIPMENT SHOP","DR. E’S AUSRÜSTUNGSLADEN","TIENDA DE EQUIPO DE DR. E","LOJA DE EQUIPAMENTOS DO DR. E","Dr. Eの装置ショップ");
  $('#labShopSub').textContent=ml("MoleCoin ile yararlı cihazlar ve laboratuvar görünümleri satın al.","Spend MoleCoins on useful equipment and laboratory upgrades.","Gib MoleCoins für nützliche Geräte und Laborverbesserungen aus.","Gasta MoleCoins en equipo útil y mejoras del laboratorio.","Use MoleCoins em equipamentos úteis e melhorias do laboratório.","MoleCoinで便利な装置やラボ強化を購入できます。");
  const g=$('#labShopGrid');
  const boosterHtml='<section class="boosterShop"><div class="boosterHead"><b>'+(ml("⚡ GÜÇLENDİRİCİLER","⚡ BOOSTERS","⚡ VERSTÄRKER","⚡ POTENCIADORES","⚡ REFORÇOS","⚡ ブースター"))+'</b><small>'+(LANG==='tr'?'Normal duvara dokunmada harcanmaz. Seçtiğin çatlak duvar yanlış seçim olsa bile kırılır ve güçlendirici geri verilmez.':'Never spent on a normal wall. A selected cracked wall breaks even if it is the wrong strategic choice, and the booster is not refunded.')+'</small></div><div class="boosterGrid">'+BOOSTER_ITEMS.map(it=>'<article class="boosterCard"><span class="boosterIcon">'+it.icon+'</span><div><b>'+lx(it.name)+'</b><small>'+lx(it.desc)+'</small><em>'+(ml("Envanter: ","Inventory: ","Inventar: ","Inventario: ","Inventário: ","所持数："))+boosterCount(it.id)+'</em></div><button class="btn amber" data-booster="'+it.id+'">'+it.price+' 🪙</button></article>').join('')+'</div></section>';
  g.innerHTML=boosterHtml+LAB_ITEMS.map(it=>{
    const owned=labOwned(it.id),locked=save.cur<it.unlock,active=currentLabTheme()===it.theme&&it.theme!=='basic';
    let action='';
    if(locked)action='<button class="btn ghost labBuy" disabled>'+(LANG==='tr'?'BÖLÜM '+it.unlock+' GEREKİR':'REQUIRES LEVEL '+it.unlock)+'</button>';
    else if(!owned)action='<button class="btn amber labBuy" data-buy="'+it.id+'">'+it.price+' 🪙 · '+(ml("SATIN AL","BUY","KAUFEN","COMPRAR","COMPRAR","購入"))+'</button>';
    else if(it.theme!=='basic')action='<button class="btn '+(active?'green':'blue')+' labEquip" data-equip="'+it.id+'">'+(active?(ml("KULLANILIYOR","ACTIVE","AKTIV","ACTIVO","ATIVO","使用中")):(ml("TEMAYI KULLAN","USE THEME","THEMA VERWENDEN","USAR TEMA","USAR TEMA","テーマを使用")))+'</button>';
    else action='<button class="btn ghost labBuy" disabled>✓ '+(ml("SAHİPSİN","OWNED","IM BESITZ","EN POSESIÓN","POSSUÍDO","所持済み"))+'</button>';
    return '<article class="labShopCard item-'+it.id+' '+(owned?'owned':'')+' '+(locked?'locked':'')+'"><div class="labShopVisual">'+labItemVisualHtml(it.id,false)+'</div><div class="labShopText"><b>'+it.icon+' '+lx(it.name)+'</b><small>'+lx(it.desc)+'</small></div>'+action+'</article>';
  }).join('');
  g.querySelectorAll('[data-booster]').forEach(b=>bindTap(b,()=>buyBooster(b.dataset.booster)));
  g.querySelectorAll('[data-buy]').forEach(b=>bindTap(b,()=>confirmLabPurchase(b.dataset.buy)));
  g.querySelectorAll('[data-equip]').forEach(b=>bindTap(b,()=>equipLabItem(b.dataset.equip)));
}
function confirmLabPurchase(id){
  const it=LAB_ITEMS.find(x=>x.id===id);if(!it||labOwned(id)||save.cur<it.unlock)return;
  const enough=coinBalance()>=it.price;
  openModal('<h3>'+it.icon+' '+lx(it.name)+'</h3><div class="labModalAsset item-'+it.id+'">'+labItemVisualHtml(it.id,false)+'</div><div class="msub">'+lx(it.desc)+'</div><div class="mcoins">'+it.price+' <span class="coinIcon"></span></div><div class="mrow"><button class="btn amber" id="mLabBuy" '+(enough?'':'disabled')+'>'+(ml("SATIN AL","BUY","KAUFEN","COMPRAR","COMPRAR","購入"))+'</button><button class="btn ghost" id="mLabCancel">'+t('cancel')+'</button></div>'+(enough?'':'<div class="msub" style="color:#ff9caa">'+(ml("Yeterli MoleCoin yok. Bölüm, Günün Deneyi ve bonusları oyna.","Not enough MoleCoins. Play levels, Daily Experiments, and bonuses.","Nicht genug MoleCoins. Spiele Level, Tagesexperimente und Bonusmissionen.","No hay suficientes MoleCoins. Juega niveles, Experimentos Diarios y extras.","MoleCoins insuficientes. Jogue fases, Experimentos Diários e bônus.","MoleCoinが足りません。レベル、今日の実験、ボーナスをプレイしてください。"))+'</div>'));
  bindTap('#mLabCancel',()=>closeModal());
  if(enough)bindTap('#mLabBuy',()=>{if(!spendCoins(it.price))return;save.achv[labKey(id)]=1;if(it.theme!=='basic')setSyncedLabTheme(it.theme);persist();markLabTutorialSeen(id);closeModal();SFX.star(2);prop('✨ '+lx(it.name),2600);buildLab();setTimeout(()=>labEquipmentTutorial(id),320);});
}
function equipLabItem(id){
  const it=LAB_ITEMS.find(x=>x.id===id);if(!it||!labOwned(id)||it.theme==='basic')return;
  setSyncedLabTheme(it.theme);persist();SFX.click();renderLabOverview();renderLabShop();
}

let duelRewardClaimBusy=false;
function duelPlacementReward(period,id,rank){
  if(!rank||rank>10)return false;const type=period==='week'?'week':'month',claim=type+':'+id;if(save.duelRewardClaims[claim])return false;
  save.duelRewardClaims[claim]=rank;const tier=rank===1?'champion':rank<=3?'podium':'top10';unlockDuelReward(save,'cup_'+type+'_'+tier+'_'+id);
  if(rank===1){unlockDuelReward(save,type==='week'?'frame_week':'frame_month');unlockDuelReward(save,type==='week'?'title_week_champion':'title_month_champion');}
  return true;
}
async function refreshClosedDuelRewards(){
  if(duelRewardClaimBusy||!window.MXCloud||!window.MXCloud.getDuelLeaderboard||!save.profileId)return;const acc=window.MXCloud.account;if(!acc||acc.isAnonymous)return;
  duelRewardClaimBusy=true;let changed=false;
  try{
    const pw=previousUtcWeekId(),pm=previousUtcMonthId();
    const [wk,mo]=await Promise.all([window.MXCloud.getDuelLeaderboard('closedWeek',100,true,pw),window.MXCloud.getDuelLeaderboard('closedMonth',100,true,pm)]);
    const rankIn=rows=>Array.isArray(rows)?rows.findIndex(r=>r.uid===window.MXCloud.uid&&r.profileId===save.profileId)+1:0;
    changed=duelPlacementReward('week',pw,rankIn(wk&&wk.rows))||changed;changed=duelPlacementReward('month',pm,rankIn(mo&&mo.rows))||changed;
    if(changed){ensureDuelRankState(save);persist();SFX.star(3);prop(ml("🏆 Yeni Düello ödülü Kupa Dolabına eklendi!","🏆 A new Duel reward was added to your Trophy Cabinet!","🏆 Eine neue Duellbelohnung wurde deinem Trophäenschrank hinzugefügt!","🏆 ¡Se añadió una nueva recompensa de Duelo a tu vitrina!","🏆 Uma nova recompensa de Duelo foi adicionada à sua vitrine!","🏆 新しいデュエル報酬がトロフィー棚に追加されました！"),3300);}
  }catch(e){console.warn('[Duel Rewards] closed-period check failed',e&&e.code||e);}finally{duelRewardClaimBusy=false;renderDuelRewards(false);}
}
function duelRewardOwned(id){return !!(save.duelRewards&&save.duelRewards[id]);}

function duelRewardRarityLabel(kind){
  if(kind==='legendary')return ml("EFSANEVİ","LEGENDARY","LEGENDÄR","LEGENDARIO","LENDÁRIO","レジェンド");
  if(kind==='epic')return ml("DESTANSI","EPIC","EPISCH","ÉPICO","ÉPICO","エピック");
  if(kind==='rare')return ml("NADİR","RARE","SELTEN","RARO","RARO","レア");
  return ml("STANDART","COMMON","GEWÖHNLICH","COMÚN","COMUM","コモン");
}
function duelFrameRequirement(id){
  const peak=Math.floor(Number(save.duelPeakRating)||DUEL_START_RATING);
  if(id==='frame_gold')return {text:(ml("Altın Lig · ","Gold League · ","Goldliga · ","Liga Oro · ","Liga Ouro · ","ゴールドリーグ · "))+peak+'/1050 DP'};
  if(id==='frame_diamond')return {text:(ml("Elmas Lig · ","Diamond League · ","Diamantliga · ","Liga Diamante · ","Liga Diamante · ","ダイヤモンドリーグ · "))+peak+'/1400 DP'};
  if(id==='frame_nobel')return {text:(ml("Nobel Lig · ","Nobel League · ","Nobelliga · ","Liga Nobel · ","Liga Nobel · ","ノーベルリーグ · "))+peak+'/1900 DP'};
  if(id==='frame_week')return {text:ml("Kapanan haftayı 1. bitir.","Finish a closed week at #1.","Beende eine abgeschlossene Woche auf Platz 1.","Termina una semana cerrada en el puesto 1.","Termine uma semana encerrada em 1º lugar.","締め切られた週を1位で終えてください。")};
  if(id==='frame_month')return {text:ml("Kapanan ayı 1. bitir.","Finish a closed month at #1.","Beende einen abgeschlossenen Monat auf Platz 1.","Termina un mes cerrado en el puesto 1.","Termine um mês encerrado em 1º lugar.","締め切られた月を1位で終えてください。")};
  return {text:ml("Başlangıç ödülü","Starter reward","Startbelohnung","Recompensa inicial","Recompensa inicial","初期報酬")};
}
function duelTitleRequirement(id){
  const peak=Math.floor(Number(save.duelPeakRating)||DUEL_START_RATING), wins=Math.floor(Number(save.duelWins)||0), streak=Math.floor(Number(save.duelBestStreak)||0);
  if(id==='title_first_win')return {text:(ml("İlk galibiyet · ","First win · ","Erster Sieg · ","Primera victoria · ","Primeira vitória · ","初勝利 · "))+wins+'/1'};
  if(id==='title_streak3')return {text:(ml("En iyi seri · ","Best streak · ","Beste Serie · ","Mejor racha · ","Melhor sequência · ","最高連勝 · "))+streak+'/3'};
  if(id==='title_professor')return {text:(ml("Profesör Lig · ","Professor League · ","Professorenliga · ","Liga Profesor · ","Liga Professor · ","プロフェッサーリーグ · "))+peak+'/1650 DP'};
  if(id==='title_nobel')return {text:(ml("Nobel Lig · ","Nobel League · ","Nobelliga · ","Liga Nobel · ","Liga Nobel · ","ノーベルリーグ · "))+peak+'/1900 DP'};
  if(id==='title_week_champion')return {text:ml("Kapanan haftayı 1. bitir.","Finish a closed week at #1.","Beende eine abgeschlossene Woche auf Platz 1.","Termina una semana cerrada en el puesto 1.","Termine uma semana encerrada em 1º lugar.","締め切られた週を1位で終えてください。")};
  if(id==='title_month_champion')return {text:ml("Kapanan ayı 1. bitir.","Finish a closed month at #1.","Beende einen abgeschlossenen Monat auf Platz 1.","Termina un mes cerrado en el puesto 1.","Termine um mês encerrado em 1º lugar.","締め切られた月を1位で終えてください。")};
  return {text:''};
}
function duelRoadmapData(){
  const peak=Math.floor(Number(save.duelPeakRating)||DUEL_START_RATING), wins=Math.floor(Number(save.duelWins)||0), streak=Math.floor(Number(save.duelBestStreak)||0);
  const frame=[
    {id:'frame_gold',icon:'🥇',labelTr:'Altın Çerçeve',labelEn:'Gold Frame',need:1050,have:peak,kind:'rating'},
    {id:'frame_diamond',icon:'💎',labelTr:'Elmas Çerçeve',labelEn:'Diamond Frame',need:1400,have:peak,kind:'rating'},
    {id:'frame_nobel',icon:'🏆',labelTr:'Nobel Çerçevesi',labelEn:'Nobel Frame',need:1900,have:peak,kind:'rating'}
  ].find(x=>!duelRewardOwned(x.id));
  const title=[
    {id:'title_first_win',icon:'⚔️',labelTr:'İlk Zafer',labelEn:'First Victory',need:1,have:wins,kind:'wins'},
    {id:'title_streak3',icon:'🔥',labelTr:'Alev Serisi',labelEn:'Hot Streak',need:3,have:streak,kind:'streak'},
    {id:'title_professor',icon:'🎓',labelTr:'Düello Profesörü',labelEn:'Duel Professor',need:1650,have:peak,kind:'rating'},
    {id:'title_nobel',icon:'🏆',labelTr:'Nobel Düellocusu',labelEn:'Nobel Duelist',need:1900,have:peak,kind:'rating'}
  ].find(x=>!duelRewardOwned(x.id));
  return {frame,title};
}

function duelFrameCard(f){
  const owned=duelRewardOwned(f.id),active=save.activeDuelFrame===f.id;
  const rarity=f.id.includes('month')||f.id.includes('nobel')?'legendary':f.id.includes('diamond')||f.id.includes('week')?'epic':f.id.includes('gold')?'rare':'common';
  const req=duelFrameRequirement(f.id);
  return '<article class="duelRewardCard '+(owned?'':'locked')+' '+(active?'active':'')+' rarity-'+rarity+'">'
    +'<div class="rewardCardTop"><span class="rewardRarity reward-'+rarity+'">'+duelRewardRarityLabel(rarity)+'</span><span class="rewardState">'+(owned?(active?(ml("AKTİF","ACTIVE","AKTIV","ACTIVO","ATIVO","使用中")):(ml("AÇILDI","UNLOCKED","FREIGESCHALTET","DESBLOQUEADO","DESBLOQUEADO","解放済み"))):(ml("KİLİTLİ","LOCKED","GESPERRT","BLOQUEADO","BLOQUEADO","未解放")))+'</span></div>'
    +'<span class="rewardFramePreview '+f.css+'"></span>'
    +'<b>'+(LANG==='tr'?f.tr:f.en)+'</b>'
    +'<small>'+(LANG==='tr'?f.descTr:f.descEn)+'</small>'
    +'<div class="rewardReq">'+(owned?(ml("Açıldı ve kullanıma hazır","Unlocked and ready to use","Freigeschaltet und einsatzbereit","Desbloqueado y listo para usar","Desbloqueado e pronto para usar","解放済み・使用可能")):req.text)+'</div>'
    +(owned?'<button class="btn '+(active?'green':'blue')+'" data-duelframe="'+f.id+'">'+(active?(ml("KULLANILIYOR","ACTIVE","AKTIV","ACTIVO","ATIVO","使用中")):(ml("KULLAN","USE","VERWENDEN","USAR","USAR","使用")))+'</button>':'<button class="btn ghost" disabled>🔒</button>')
    +'</article>';
}
function duelTitleCard(row){
  const owned=duelRewardOwned(row.id),active=save.activeDuelTitle===row.id;
  const rarity=row.id.includes('month')||row.id.includes('nobel')?'legendary':row.id.includes('week')||row.id.includes('professor')?'epic':row.id.includes('streak')?'rare':'common';
  const req=duelTitleRequirement(row.id);
  return '<article class="duelRewardCard '+(owned?'':'locked')+' '+(active?'active':'')+' rarity-'+rarity+'">'
    +'<div class="rewardCardTop"><span class="rewardRarity reward-'+rarity+'">'+duelRewardRarityLabel(rarity)+'</span><span class="rewardState">'+(owned?(active?(ml("AKTİF","ACTIVE","AKTIV","ACTIVO","ATIVO","使用中")):(ml("AÇILDI","UNLOCKED","FREIGESCHALTET","DESBLOQUEADO","DESBLOQUEADO","解放済み"))):(ml("KİLİTLİ","LOCKED","GESPERRT","BLOQUEADO","BLOQUEADO","未解放")))+'</span></div>'
    +'<span class="rewardIcon">'+row.icon+'</span>'
    +'<b>'+(LANG==='tr'?row.tr:row.en)+'</b>'
    +'<small>'+(LANG==='tr'?row.descTr:row.descEn)+'</small>'
    +'<div class="rewardReq">'+(owned?(ml("Açıldı ve kullanıma hazır","Unlocked and ready to use","Freigeschaltet und einsatzbereit","Desbloqueado y listo para usar","Desbloqueado e pronto para usar","解放済み・使用可能")):req.text)+'</div>'
    +(owned?'<button class="btn '+(active?'green':'blue')+'" data-dueltitle="'+row.id+'">'+(active?(ml("KULLANILIYOR","ACTIVE","AKTIV","ACTIVO","ATIVO","使用中")):(ml("KULLAN","USE","VERWENDEN","USAR","USAR","使用")))+'</button>':'<button class="btn ghost" disabled>🔒</button>')
    +'</article>';
}
function duelRewardSpotlightData(){
  const cups=Object.keys(save.duelRewards||{}).filter(k=>k.startsWith('cup_')).sort().reverse();
  if(save.activeDuelTitle && duelRewardOwned(save.activeDuelTitle)){
    const row=duelTitleRows().find(x=>x.id===save.activeDuelTitle);
    if(row)return {icon:row.icon,title:(LANG==='tr'?row.tr:row.en),tag:ml("SEÇİLİ UNVAN","SELECTED TITLE","AUSGEWÄHLTER TITEL","TÍTULO SELECCIONADO","TÍTULO SELECIONADO","選択中の称号"),desc:(LANG==='tr'?row.descTr:row.descEn),action:'title'};
  }
  if(cups.length){
    const k=cups[0],p=k.split('_'),isWeek=p[1]==='week',tier=p[2],id=p.slice(3).join('_');
    const icon=tier==='champion'?'🏆':tier==='podium'?'🥇':'🎖️';
    const title=(isWeek?(ml("Haftalık ","Weekly ","Wöchentlich ","Semanal ","Semanal ","週間 ")):(ml("Aylık ","Monthly ","Monatlich ","Mensual ","Mensal ","月間 ")))+(tier==='champion'?(ml("Şampiyon","Champion","Champion","Campeón","Campeão","チャンピオン")):tier==='podium'?(ml("İlk 3","Top 3","Top 3","Top 3","Top 3","トップ3")):(ml("İlk 10","Top 10","Top 10","Top 10","Top 10","トップ10")));
    return {icon,title,tag:ml("SON KUPA","LATEST CUP","NEUESTER POKAL","COPA MÁS RECIENTE","TROFÉU MAIS RECENTE","最新トロフィー"),desc:id,action:'cup'};
  }
  const next=DUEL_LEAGUES.find(l=>save.duelRating<l.min);
  if(next)return {icon:next.icon,title:duelLeagueName(next),tag:ml("SONRAKİ HEDEF","NEXT TARGET","NÄCHSTES ZIEL","SIGUIENTE OBJETIVO","PRÓXIMO OBJETIVO","次の目標"),desc:(LANG==='tr'?'Bu lige ulaşmak için ':'Reach this league in ')+(next.min-save.duelRating)+' DP',action:'goal'};
  return {icon:'🏆',title:(ml("Nobel Ligi","Nobel League","Nobelliga","Liga Nobel","Liga Nobel","ノーベルリーグ")),tag:ml("EN YÜKSEK LİG","TOP LEAGUE","HÖCHSTE LIGA","LIGA MÁXIMA","LIGA MÁXIMA","最高リーグ"),desc:(ml("Artık sezon kupaları topla ve zirveyi koru.","Collect season cups and defend the summit.","Sammle Saisonpokale und verteidige die Spitze.","Consigue copas de temporada y defiende la cima.","Colete troféus da temporada e defenda o topo.","シーズントロフィーを集め、首位を守りましょう。")),action:'goal'};
}

function renderDuelRewards(checkClosed){
  ensureDuelRankState(save);
  const league=duelLeagueForRating(save.duelRating), frame=activeDuelFrame(), ttl=activeDuelTitle();
  const hero=$('#duelRewardHero'); if(!hero) return;
  const next=DUEL_LEAGUES.find(l=>save.duelRating<l.min);
  const prev=league;
  const progressMax=next?Math.max(1,next.min-prev.min):Math.max(1,DUEL_LEAGUES[DUEL_LEAGUES.length-1].min-prev.min+300);
  const progressVal=next?Math.max(0,save.duelRating-prev.min):progressMax;
  const pct=Math.max(0,Math.min(100,Math.round(progressVal/progressMax*100)));
  const nm=esc((save.playerName||curProfile||'PLAYER').slice(0,18));
  const initials=(save.playerName||curProfile||'P').replace(/\s+/g,' ').trim().split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase()||'P';
  const spot=duelRewardSpotlightData();
  const completed=Math.max(0,save.duelWins+save.duelLosses+save.duelDraws);
  const total=Math.max(0,Object.keys(save.duelRatedMatches||{}).length);
  const winRate=completed?Math.round((save.duelWins/completed)*100):0;
  const roadmap=duelRoadmapData();
  hero.innerHTML=''
    +'<div class="duelRewardHeroCard">'
    +  '<div class="duelHeroAvatarWrap"><div class="duelRewardAvatar '+frame.css+'"><span>'+initials+'</span></div></div>'
    +  '<div class="duelHeroMain">'
    +    '<div class="duelHeroName">'
    +      '<b>'+nm+'</b>'
    +      '<small>'+(ttl?(LANG==='tr'?ttl.tr:ttl.en):(ml("İlk Zafer","First Victory","Erster Sieg","Primera victoria","Primeira vitória","初勝利")))+'</small>'
    +      '<span class="duelHeroActive">'+(ml("AKTİF ÖDÜL SETİ","ACTIVE REWARD SET","AKTIVES BELOHNUNGSSET","CONJUNTO ACTIVO","CONJUNTO ATIVO","使用中の報酬セット"))+'</span>'
    +    '</div>'
    +    '<div class="duelHeroLeague"><div class="duelLeagueMedal duel-'+league.id+'"><span>'+league.icon+'</span></div><div><strong>'+(duelLeagueName(league)).toUpperCase()+'</strong><small>'+save.duelRating+' / '+(next?next.min:(save.duelRating))+' DP</small><div class="duelProgress"><i style="width:'+pct+'%"></i></div><em>'+(next?(LANG==='tr'?(duelLeagueName(next))+' için '+Math.max(0,next.min-save.duelRating)+' DP kaldı':Math.max(0,next.min-save.duelRating)+' DP to '+duelLeagueName(next)):(ml("En yüksek ligdesin!","You are in the top league!","Du bist in der höchsten Liga!","¡Estás en la liga máxima!","Você está na liga máxima!","最高リーグに到達しています！")))+'</em></div></div>'
    +  '</div>'
    +'</div>';
  const statBox=$('#duelRewardStats');
  if(statBox) statBox.innerHTML=''
    +'<div class="duelStatCard"><span>⚔️</span><b>'+total+'</b><small>'+(ml("Dereceli Maç","Ranked Matches","Ranglistenmatches","Partidas clasificatorias","Partidas ranqueadas","ランク戦"))+'</small></div>'
    +'<div class="duelStatCard"><span>🏅</span><b>'+save.duelWins+'</b><small>'+(ml("Galibiyet","Wins","Siege","Victorias","Vitórias","勝利"))+'</small></div>'
    +'<div class="duelStatCard"><span>🔥</span><b>'+save.duelBestStreak+'</b><small>'+(ml("En İyi Seri","Best Streak","Beste Serie","Mejor racha","Melhor sequência","最高連勝"))+'</small></div>'
    +'<div class="duelStatCard"><span>📈</span><b>%'+winRate+'</b><small>'+(ml("Kazanma Oranı","Win Rate","Siegquote","Tasa de victorias","Taxa de vitórias","勝率"))+'</small></div>'
    +'<div class="duelStatCard"><span>⚡</span><b>'+save.duelWeekPoints+'</b><small>'+(ml("Haftalık Puan","Weekly Points","Wochenpunkte","Puntos semanales","Pontos semanais","週間ポイント"))+'</small></div>'
    +'<div class="duelStatCard"><span>🌙</span><b>'+save.duelMonthPoints+'</b><small>'+(ml("Aylık Puan","Monthly Points","Monatspunkte","Puntos mensuales","Pontos mensais","月間ポイント"))+'</small></div>';
  const roadBox=$('#duelRewardRoadmap');
  if(roadBox){
    const cards=[];
    if(roadmap.frame) cards.push('<div class="duelRoadCard"><span>'+roadmap.frame.icon+'</span><div><b>'+(ml("Sıradaki Çerçeve: ","Next Frame: ","Nächster Rahmen: ","Siguiente marco: ","Próxima moldura: ","次のフレーム："))+(LANG==='tr'?roadmap.frame.labelTr:roadmap.frame.labelEn)+'</b><small>'+roadmap.frame.have+'/'+roadmap.frame.need+' DP</small></div><i style="width:'+Math.max(6,Math.min(100,Math.round((roadmap.frame.have/roadmap.frame.need)*100)))+'%"></i></div>');
    if(roadmap.title) cards.push('<div class="duelRoadCard"><span>'+roadmap.title.icon+'</span><div><b>'+(ml("Sıradaki Unvan: ","Next Title: ","Nächster Titel: ","Siguiente título: ","Próximo título: ","次の称号："))+(LANG==='tr'?roadmap.title.labelTr:roadmap.title.labelEn)+'</b><small>'+(roadmap.title.kind==='rating'?(roadmap.title.have+'/'+roadmap.title.need+' DP'):(roadmap.title.kind==='wins'?(roadmap.title.have+'/'+roadmap.title.need+' '+(ml("galibiyet","wins","Siege","victorias","vitórias","勝"))):(roadmap.title.have+'/'+roadmap.title.need+' '+(ml("seri","streak","Serie","racha","sequência","連勝")))))+'</small></div><i style="width:'+Math.max(6,Math.min(100,Math.round((roadmap.title.have/roadmap.title.need)*100)))+'%"></i></div>');
    cards.push('<div class="duelRoadTip"><b>'+(ml("Dr. E Tavsiyesi","Dr. E Tip","Dr. E-Tipp","Consejo del Dr. E","Dica do Dr. E","Dr. Eのヒント"))+'</b><small>'+(ml("Dereceli ödüller sadece Hızlı Eşleşmede açılır. Haftalık ve aylık kupa için sezon kapanışını bekle.","Ranked rewards unlock only in Quick Match. Wait for season close to claim weekly and monthly cups.","Ranglistenbelohnungen gibt es nur im Schnellmatch. Warte auf das Saisonende, um Wochen- und Monatspokale zu erhalten.","Las recompensas clasificatorias solo se desbloquean en Partida Rápida. Espera al cierre de la temporada para recibir copas semanales y mensuales.","Recompensas ranqueadas só são liberadas na Partida Rápida. Aguarde o fim da temporada para receber troféus semanais e mensais.","ランク報酬はクイックマッチでのみ解放されます。週間・月間トロフィーはシーズン終了後に受け取れます。"))+'</small></div>');
    roadBox.innerHTML=cards.join('');
  }
  $('#duelFramesHead').textContent=ui6('🖼️ PROFİL ÇERÇEVELERİ','🖼️ PROFILE FRAMES','🖼️ PROFILRAHMEN','🖼️ MARCOS DE PERFIL','🖼️ MOLDURAS DE PERFIL','🖼️ プロフィールフレーム');
  $('#duelTitlesHead').textContent=ui6('🏷️ UNVANLAR','🏷️ TITLES','🏷️ TITEL','🏷️ TÍTULOS','🏷️ TÍTULOS','🏷️ 称号');
  $('#duelBadgesHead').textContent=ui6('🛡️ LİG ROZETLERİ','🛡️ LEAGUE BADGES','🛡️ LIGA-ABZEICHEN','🛡️ INSIGNIAS DE LIGA','🛡️ EMBLEMAS DA LIGA','🛡️ リーグバッジ');
  $('#duelCupsHead').textContent=ui6('🏆 KUPA DOLABI','🏆 TROPHY CABINET','🏆 POKALSCHRANK','🏆 VITRINA DE TROFEOS','🏆 ARMÁRIO DE TROFÉUS','🏆 トロフィー棚');
  $('#duelFramesGrid').innerHTML=DUEL_FRAMES.map(duelFrameCard).join('');
  $('#duelTitlesGrid').innerHTML=duelTitleRows().map(duelTitleCard).join('');
  $('#duelBadgesGrid').innerHTML=DUEL_LEAGUES.map(l=>'<div class="duelBadge '+(duelRewardOwned('league_'+l.id)?'':'locked')+' duel-'+l.id+'"><span>'+l.icon+'</span><b>'+duelLeagueName(l)+'</b><small>'+(duelRewardOwned('league_'+l.id)?(ml("AÇILDI","UNLOCKED","FREIGESCHALTET","DESBLOQUEADO","DESBLOQUEADO","解放済み")):(l.min+' DP'))+'</small></div>').join('');
  const cups=Object.keys(save.duelRewards||{}).filter(k=>k.startsWith('cup_')).sort().reverse();
  $('#duelCupsGrid').innerHTML=cups.length?cups.slice(0,6).map(k=>{const p=k.split('_'),isWeek=p[1]==='week',tier=p[2],id=p.slice(3).join('_');const icon=tier==='champion'?'🏆':tier==='podium'?'🥇':'🎖️';const nm=(isWeek?(ml("Haftanın Şampiyonu","Weekly Champion","Wochenchampion","Campeón semanal","Campeão semanal","週間チャンピオン")):(ml("Ayın Şampiyonu","Monthly Champion","Monatschampion","Campeón mensual","Campeão mensal","月間チャンピオン")));const sub=tier==='champion'?(ml("Şampiyon","Champion","Champion","Campeón","Campeão","チャンピオン")):tier==='podium'?(ml("İlk 3","Top 3","Top 3","Top 3","Top 3","トップ3")):(ml("İlk 10","Top 10","Top 10","Top 10","Top 10","トップ10"));return '<div class="duelCup '+tier+'"><span>'+icon+'</span><b>'+nm+'</b><small>'+sub+' · '+esc(id)+'</small></div>';}).join(''):'<div class="duelCup locked hero"><span>🏆</span><b>'+(ml("İlk kupan seni bekliyor","Your first cup is waiting","Dein erster Pokal wartet","Tu primera copa te espera","Seu primeiro troféu está esperando","最初のトロフィーが待っています"))+'</b><small>'+(ml("Hızlı Eşleşmede yüksel ve sezonu kapat.","Climb Quick Match and finish the season strong.","Steige im Schnellmatch auf und beende die Saison stark.","Asciende en Partida Rápida y termina bien la temporada.","Suba na Partida Rápida e termine a temporada com força.","クイックマッチで順位を上げ、好成績でシーズンを終えましょう。"))+'</small></div>';
  const spotlight=$('#duelRewardSpotlight');
  if(spotlight) spotlight.innerHTML='<div class="rewardSpotlightCard"><div class="rewardSpotDr">🧪</div><div class="rewardSpotSpeech">'+(LANG==='tr'?'Harika gidiyorsun '+nm+'!':'You are doing great, '+nm+'!')+'<br>'+(ml("Moleküller seninle gurur duyuyor!","The molecules are proud of you!","Die Moleküle sind stolz auf dich!","¡Las moléculas están orgullosas de ti!","As moléculas têm orgulho de você!","分子たちも誇らしげです！"))+'</div><div class="rewardSpotBody"><div class="rewardSpotTop"><span class="rewardSpotIcon">'+spot.icon+'</span><div><b>'+spot.title+'</b><small>'+spot.tag+'</small></div></div><p>'+spot.desc+'</p><button class="btn gold rewardSpotBtn" '+(spot.action==='goal'?'disabled':'')+'>'+(spot.action==='goal'?(ml("HEDEF","GOAL","ZIEL","OBJETIVO","OBJETIVO","目標")):(ml("KULLAN","USE","VERWENDEN","USAR","USAR","使用")))+'</button></div></div>';
  $('#duelRewardStatus').textContent=LANG==='tr'?'Hızlı Eşleşme derecelidir · Kodlu ve aynı telefon düelloları derecesizdir · Kapanan hafta/ay sonunda kupa ve özel unvanlar açılır.':'Quick Match is ranked · Code rooms and same-phone duels are unranked · Weekly and monthly cups unlock when the closed period is processed.';
  document.querySelectorAll('[data-duelframe]').forEach(b=>bindTap(b,()=>{save.activeDuelFrame=b.dataset.duelframe;persist();SFX.click();renderDuelRewards(false);}));
  document.querySelectorAll('[data-dueltitle]').forEach(b=>bindTap(b,()=>{save.activeDuelTitle=b.dataset.dueltitle;persist();SFX.click();renderDuelRewards(false);}));
  if(checkClosed)refreshClosedDuelRewards();
}
function isNobelMe(row){return !!(row&&window.MXCloud&&row.uid===window.MXCloud.uid&&row.profileId===save.profileId);}
function nobelRankIn(rows){if(!Array.isArray(rows))return 0;return rows.findIndex(isNobelMe)+1;}
function nobelCandidateRows(rows){return Array.isArray(rows)?rows.filter(r=>Math.max(0,Number(r&&r.completedLevels)||0)>=CAMPAIGN_TARGET_LEVELS):[];}
function currentMonthlyLaureate(){const rows=nobelCandidateRows(nobelIntel.month);return rows.length?rows[0]:null;}
function currentMonthlyCandidateRank(){return nobelRankIn(nobelCandidateRows(nobelIntel.month));}
function nobelLeaderCard(title,row,kind){
  if(!row)return '<div class="nobelLeader empty"><span>'+kind+'</span><b>'+title+'</b><small>'+(ml("Henüz geçerli puan yok.","No qualifying score yet.","Noch keine gültige Punktzahl.","Aún no hay una puntuación válida.","Ainda não há pontuação válida.","有効なスコアはまだありません。"))+'</small></div>';
  return '<div class="nobelLeader '+(isNobelMe(row)?'me':'')+'"><span>'+kind+'</span><b>'+title+'</b><strong>'+esc((row.playerName||'?').slice(0,18))+'</strong><small>'+rankScoreText(row)+'</small></div>';
}
async function refreshNobelIntel(force){
  if(!window.MXCloud)return renderNobelPane();
  if(!force&&Date.now()-nobelIntel.updated<45000&&nobelIntel.world)return renderNobelPane();
  const token=Date.now();nobelIntel.updated=token;
  try{
    const [world,wk,mo,ch]=await Promise.all([
      window.MXCloud.getLeaderboard(100),window.MXCloud.getWeeklyLeaderboard(100),window.MXCloud.getMonthlyLeaderboard(100),window.MXCloud.getChampions(30)
    ]);
    nobelIntel.world=world||[];nobelIntel.week=wk&&wk.rows||[];nobelIntel.month=mo&&mo.rows||[];nobelIntel.champions=ch||[];nobelIntel.updated=Date.now();
  }catch(e){console.warn('[Nobel Race] refresh failed',e);}
  renderNobelPane();renderLabOverview();
}
function renderNobelPane(){
  const hero=$('#nobelRaceHero');if(!hero)return;
  const candidate=save.cur>=300;
  const nobelWinner=save.cur>=CAMPAIGN_TARGET_LEVELS;
  const wRank=nobelRankIn(nobelIntel.world),mRank=currentMonthlyCandidateRank(),wkRank=nobelRankIn(nobelIntel.week);
  const liveLaureate=nobelWinner,worldLeader=wRank===1,monthlyLaureate=currentMonthlyLaureate();
  hero.innerHTML='<div class="nobelCup '+(liveLaureate?'won':'')+'">'+(liveLaureate?'🏆':'🏅')+'</div><div><b>'+(liveLaureate?(ml("NOBEL ÖDÜLLÜSÜ","NOBEL LAUREATE","NOBELPREISTRÄGER","PREMIO NOBEL","NOBELISTA","ノーベル賞受賞者")):candidate?(ml("NOBEL ADAYI","NOBEL CANDIDATE","NOBELKANDIDAT","CANDIDATO AL NOBEL","CANDIDATO AO NOBEL","ノーベル候補")):(ml("NOBEL YOLCULUĞU","NOBEL JOURNEY","NOBELREISE","CAMINO AL NOBEL","JORNADA NOBEL","ノーベルへの道")))+'</b><small>'+(liveLaureate?(ml("301. final deneyi tamamladın. Nobel Ödülü ve özel vitrin açıldı.","You completed the 301st final experiment. The Nobel Prize and its display are unlocked.","Du hast das 301. Finalexperiment abgeschlossen. Der Nobelpreis und die Vitrine sind freigeschaltet.","Completaste el experimento final 301. El Premio Nobel y su vitrina están desbloqueados.","Você concluiu o 301º experimento final. O Prêmio Nobel e sua vitrine foram liberados.","第301最終実験を完了しました。ノーベル賞と専用展示が解放されました。")):candidate?(ml("300 ana deneyi tamamladın. 301. Nobel Finali seni bekliyor.","You completed the 300 main experiments. The 301st Nobel Final awaits.","Du hast 300 Hauptexperimente abgeschlossen. Das 301. Nobelfinale wartet.","Completaste 300 experimentos principales. Te espera la Final Nobel 301.","Você concluiu 300 experimentos principais. A Final Nobel 301 espera por você.","300の主要実験を完了しました。第301ノーベルファイナルが待っています。")):(LANG==='tr'?(Math.min(save.cur,CAMPAIGN_TARGET_LEVELS)+'/'+CAMPAIGN_TARGET_LEVELS+' bölüm · Önce Nobel Adayı ol.'):(Math.min(save.cur,CAMPAIGN_TARGET_LEVELS)+'/'+CAMPAIGN_TARGET_LEVELS+' levels · Become a Nobel Candidate first.')))+'</small></div>';
  $('#nobelLeadersHead').textContent=ui6('🌍 CANLI NOBEL YARIŞI','🌍 LIVE NOBEL RACE','🌍 LIVE-NOBEL-RENNEN','🌍 CARRERA NOBEL EN VIVO','🌍 CORRIDA NOBEL AO VIVO','🌍 ライブ・ノーベル競争');
  $('#nobelLeaderGrid').innerHTML=nobelLeaderCard(ml("Dünya Nobel Lideri","World Nobel Leader","Nobel-Weltführender","Líder Nobel mundial","Líder Nobel mundial","世界ノーベルリーダー"),nobelIntel.world&&nobelIntel.world[0],'🌍')+nobelLeaderCard(ml("Haftanın Baş Araştırmacısı","Weekly Head Researcher","Wöchentlicher Spitzenforscher","Investigador principal semanal","Pesquisador-chefe semanal","週間主任研究者"),nobelIntel.week&&nobelIntel.week[0],'⚡')+nobelLeaderCard(ml("Ayın Nobel Ödüllüsü","Monthly Nobel Laureate","Monatlicher Nobelpreisträger","Premio Nobel mensual","Nobelista mensal","月間ノーベル賞受賞者"),monthlyLaureate,'🏆');
  $('#nobelPositionHead').textContent=ui6('📊 SENİN KONUMUN','📊 YOUR POSITION','📊 DEINE POSITION','📊 TU POSICIÓN','📊 SUA POSIÇÃO','📊 あなたの順位');
  let position='';
  if(!window.MXCloud||!window.MXCloud.uid)position=ml("Sıralamayı görmek için çevrimiçi ol.","Go online to view your ranking.","Gehe online, um deine Platzierung zu sehen.","Conéctate para ver tu clasificación.","Fique online para ver sua classificação.","ランキングを見るにはオンラインに接続してください。");
  else if(window.MXCloud.account&&window.MXCloud.account.isAnonymous)position=ml("Puanını yayımlamak için Google veya e-posta hesabını bağla.","Connect Google or email to publish your score.","Verbinde Google oder E-Mail, um deine Punktzahl zu veröffentlichen.","Conecta Google o correo electrónico para publicar tu puntuación.","Conecte Google ou e-mail para publicar sua pontuação.","スコアを公開するにはGoogleまたはメールを連携してください。");
  else position=(ml("Dünya: ","World: ","Welt: ","Mundo: ","Mundo: ","世界："))+(wRank?'#'+wRank:'—')+' · '+(ml("Hafta: ","Week: ","Woche: ","Semana: ","Semana: ","週間："))+(wkRank?'#'+wkRank:'—')+' · '+(ml("Ay: ","Month: ","Monat: ","Mes: ","Mês: ","月間："))+(mRank?'#'+mRank:'—');
  const leader=nobelIntel.world&&nobelIntel.world[0],gap=leader&&!worldLeader?Math.max(0,(Number(leader.researchPoints)||0)-(Number(save.researchPoints)||0)):0;
  $('#nobelPlayerCard').innerHTML='<div class="nobelPlayerTop"><span>'+(worldLeader?'👑':'🧑‍🔬')+'</span><div><b>'+esc((save.playerName||curProfile||'PLAYER').slice(0,18))+'</b><small>'+position+'</small></div></div><div class="nobelPlayerStats"><span>'+(save.researchPoints||0).toLocaleString()+' RP</span><span>'+(worldLeader?(ml("DÜNYA LİDERİ","WORLD LEADER","WELTFÜHRENDER","LÍDER MUNDIAL","LÍDER MUNDIAL","世界1位")):(gap?(LANG==='tr'?'Lidere '+gap.toLocaleString()+' RP':'Leader gap: '+gap.toLocaleString()+' RP'):(ml("Sıralama bekleniyor","Waiting for ranking","Warte auf Rangliste","Esperando clasificación","Aguardando classificação","ランキング待機中"))))+'</span></div>';
  $('#nobelArchiveHead').textContent=ui6('🏛️ NOBEL ŞEREF SALONU','🏛️ NOBEL HALL','🏛️ NOBEL-HALLE','🏛️ SALÓN NOBEL','🏛️ SALÃO NOBEL','🏛️ ノーベル殿堂');
  renderNobelArchive();
}
function renderNobelArchive(){
  const g=$('#nobelArchiveGrid');if(!g)return;
  const rows=Array.isArray(nobelIntel.champions)?nobelIntel.champions:[];
  if(rows.length){g.innerHTML=rows.slice(0,12).map((r,i)=>'<div class="nobelArchiveRow"><span>🏆</span><div><b>'+esc((r.playerName||r.name||'?').slice(0,18))+'</b><small>'+esc(String(r.title||r.periodLabel||r.monthId||r.weekId||'Nobel Champion'))+'</small></div></div>').join('');return;}
  const live=[],monthlyLaureate=currentMonthlyLaureate();if(monthlyLaureate)live.push({icon:'🏆',name:monthlyLaureate.playerName,label:ml("Canlı aylık Nobel ödüllüsü","Live monthly Nobel laureate","Live-Nobelpreisträger des Monats","Premio Nobel mensual en vivo","Nobelista mensal ao vivo","現在の月間ノーベル賞受賞者")});if(nobelIntel.week&&nobelIntel.week[0])live.push({icon:'⚡',name:nobelIntel.week[0].playerName,label:ml("Canlı haftalık lider","Live weekly leader","Live-Wochenführer","Líder semanal en vivo","Líder semanal ao vivo","現在の週間リーダー")});
  g.innerHTML=live.length?live.map(r=>'<div class="nobelArchiveRow live"><span>'+r.icon+'</span><div><b>'+esc((r.name||'?').slice(0,18))+'</b><small>'+r.label+'</small></div></div>').join(''):'<div class="nobelArchiveEmpty">'+(ml("Şampiyon arşivi henüz boş. İlk isim burada kalıcılaşacak.","The champion archive is empty. The first winner will be recorded here.","Das Champion-Archiv ist noch leer. Der erste Gewinner wird hier verewigt.","El archivo de campeones está vacío. El primer ganador quedará registrado aquí.","O arquivo de campeões está vazio. O primeiro vencedor será registrado aqui.","チャンピオン記録はまだ空です。最初の勝者がここに記録されます。"))+'</div>';
}
async function refreshChampionsTab(){
  const box=$('#hofChampionsGrid'),title=$('#hofSoonTitle'),txt=$('#hofSoonText');if(!box)return;
  if(title)title.textContent=ml("NOBEL ŞAMPİYONLARI","NOBEL CHAMPIONS","NOBEL-CHAMPIONS","CAMPEONES NOBEL","CAMPEÕES NOBEL","ノーベルチャンピオン");if(txt)txt.textContent=ml("Arşivlenen haftalık ve aylık kazananlar.","Archived weekly and monthly winners.","Archivierte Wochen- und Monatssieger.","Ganadores semanales y mensuales archivados.","Vencedores semanais e mensais arquivados.","記録された週間・月間の勝者。");
  box.innerHTML='<div id="hofWorldMsg">'+t('worldLoading')+'</div>';
  await refreshNobelIntel(true);
  const rows=nobelIntel.champions||[];
  if(rows.length)box.innerHTML=rows.slice(0,30).map((r,i)=>'<div class="hofChampRow" style="animation-delay:'+Math.min(i,12)*45+'ms"><div class="champTitle">'+esc(String(r.title||r.periodLabel||r.monthId||r.weekId||'NOBEL CHAMPION'))+'</div><div class="champBody"><span class="nm">🏆 '+esc((r.playerName||r.name||'?').slice(0,18))+'</span><span class="sc">'+clampDisplay(r.periodRP||r.researchPoints||0).toLocaleString()+' RP</span></div></div>').join('');
  else box.innerHTML='<div class="nobelArchiveEmpty">'+(ml("Kalıcı şampiyon arşivi henüz oluşturulmadı. Canlı haftalık ve aylık liderler yukarıda gösteriliyor.","The permanent champion archive has not been populated yet. Live weekly and monthly leaders are shown above.","Das permanente Champion-Archiv ist noch leer. Die aktuellen Wochen- und Monatsführer werden oben angezeigt.","El archivo permanente aún está vacío. Arriba se muestran los líderes semanales y mensuales actuales.","O arquivo permanente ainda está vazio. Os líderes semanais e mensais atuais aparecem acima.","常設チャンピオン記録はまだありません。現在の週間・月間リーダーは上に表示されます。"))+'</div>';
}

const scr={studio:$('#studioScr'),splash:$('#splash'),levels:$('#levelsScr'),collect:$('#collectScr'),lab:$('#labScr'),game:$('#gameScr'),hof:$('#hofScr'),profile:$('#profileScr'),boot:$('#bootScr')};
syncStandaloneEinsteinMode();
window.addEventListener('resize',syncStandaloneEinsteinMode,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(syncStandaloneEinsteinMode,120),{passive:true});
let scrPrev='splash';
let screenTransitionLock=false;
function show(k){
  if(screenTransitionLock||!scr[k])return;
  screenTransitionLock=true;
  const current=Object.keys(scr).find(s=>scr[s].classList.contains('on'))||scrPrev;
  if(current===k){screenTransitionLock=false;return;}
  const outgoing=scr[current],incoming=scr[k];
  document.body.classList.add('mxUiTransitioning');
  if(outgoing)outgoing.classList.add('mxLeaving');
  incoming.classList.add('mxEntering');
  setTimeout(()=>{
    screenTransitionLock=false;
    document.body.classList.remove('mxUiTransitioning');
    if(outgoing)outgoing.classList.remove('mxLeaving');
    incoming.classList.remove('mxEntering');
  },300);
  for(const s in scr)if(scr[s].classList.contains('on'))scrPrev=s;
  for(const s in scr)scr[s].classList.toggle('on',s===k);
  if(k!=='game')freshMenuTrack();
  if(k==='game')requestAnimationFrame(resize);
  if(k==='levels'){buildLevels();$('#lvCoins span:last-child').textContent=save.coins;}
  if(k==='collect')buildCollection();
  if(k==='lab')buildLab();
  if(k==='hof'){buildHof();refreshSpotlights();}
  if(k==='splash'){refreshSplash();startSplashConversation(true,260);}
  else stopSplashConversation();
}
function refreshSplash(){
  applyBonusCosmetics();
  const p=$('#btnPlay');
  if(save.cur>0){p.disabled=false;p.textContent=t('continueLevel',Math.min(save.cur,LEVELS.length-1)+1);}
  else{p.disabled=true;p.textContent=t('continueBtn');}
  const today=utcDayId();
  const dailyDot=$('#dailyDot');
  if(dailyDot)dailyDot.classList.toggle('on',save.dailyDate!==today);
  setBgForTier(tierOf(save.cur),true);
  if(window.MXCloud)refreshNobelIntel(false);
}
function buildProfileSelect(){
  const names=Object.keys(profiles);
  const list=$('#profileList');
  if(!names.length){
    list.innerHTML='<div class="profileEmpty">'+(ml("Oyuncu kalmadı. Ana menüden yeni oyuncu oluşturabilirsin.","No players remain. Create a new player from the main menu.","Keine Spieler mehr vorhanden. Erstelle im Hauptmenü einen neuen Spieler.","No quedan jugadores. Crea uno nuevo desde el menú principal.","Não há jogadores. Crie um novo jogador no menu principal.","プレイヤーがいません。メインメニューから新規作成してください。"))+'</div>';
    return;
  }
  list.innerHTML=names.map(n=>{
    const s=profiles[n]||{};
    const lvl=Math.min((s.cur||0)+1,LEVELS.length),medals=bonusMedalCount(s);
    const display=String(s.playerName||n).slice(0,18);
    const safeKey=n.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const safeDisplay=display.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const tier=bonusVisualTierForCount(medals);
    return '<div class="profileRow tier'+tier+'"><button class="btn ghost profileBtn" data-name="'+safeKey+'"><span class="profileFrameDecor"></span><span class="profileIdentity"><span class="profileAvatar">👤</span><span class="profileTexts"><strong>'+safeDisplay+'</strong><small>Bölüm '+lvl+' · '+Math.max(0,Number(s.researchPoints)||0).toLocaleString()+' RP · 🎖️ '+medals+'</small></span></span></button>'+
      '<button class="profileDel" data-name="'+safeKey+'" title="'+t('deleteProfileTip')+'">🗑</button></div>';
  }).join('');
  list.querySelectorAll('.profileBtn').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();selectProfile(b.dataset.name);},{passive:false});
  });
  list.querySelectorAll('.profileDel').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();SFX.click();confirmDeleteProfile(b.dataset.name);},{passive:false});
  });
}
function confirmDeleteProfile(name){
  const target=profiles[name];
  if(!target)return;
  const visibleName=target.playerName||name;
  openModal('<h3>🗑 '+t('deleteProfileTitle')+'</h3><div class="msub">'+t('deleteProfileMsg',visibleName)+'</div><div class="mrow"><button class="btn danger" id="mDelYes">'+t('wipe')+'</button><button class="btn" id="mDelNo">'+t('cancel')+'</button></div>');
  $('#mDelYes').addEventListener('pointerdown',async ev=>{
    ev.preventDefault();SFX.click();
    const btn=ev.currentTarget;
    setAuthBusy(btn,true,t('deleteProfileWorking'));
    try{
      const profileId=target.profileId;
      if(profileId){
        // Added 2026-07-26: a profile created and deleted within seconds may
        // never have reached Firestore yet (cloud saves are debounced), so
        // deleteCloudProfile() was trying to delete a document that doesn't
        // exist — which some security-rule shapes reject rather than no-op,
        // surfacing as a misleading "check your connection" error. If this
        // device never recorded a successful sync for this exact profile,
        // skip the blocking attempt and just remove it locally; still fire
        // a non-blocking best-effort cleanup in case a copy exists anyway
        // (e.g. synced from a different device).
        const everSynced=!!localStorage.getItem(cloudSyncStorageKey(profileId));
        if(everSynced){
          if(!window.MXCloud||!window.MXCloud.deleteCloudProfile)throw new Error('cloud-unavailable');
          const res=await window.MXCloud.deleteCloudProfile(profileId);
          if(!res||!res.ok)throw new Error((res&&res.reason)||'cloud-delete-failed');
        }else if(window.MXCloud&&window.MXCloud.deleteCloudProfile){
          window.MXCloud.deleteCloudProfile(profileId).catch(()=>{});
        }
      }
      delete profiles[name];
      if(lastProfile===name)lastProfile=null;
      if(curProfile===name){curProfile=null;save=defaultSave();}
      persistAll();
      closeModal();
      buildProfileSelect();
      setSyncStatus('saved');
      showSmallToast(t('deleteProfileDone'),2200);
    }catch(err){
      console.warn('[profile] permanent delete failed',err);
      setAuthBusy(btn,false);
      const sub=document.querySelector('#modalBox .msub');
      if(sub){sub.textContent=t('deleteProfileFailed');sub.style.color='var(--red)';}
      setSyncStatus('error');
    }
  },{passive:false});
  $('#mDelNo').addEventListener('pointerdown',ev=>{ev.preventDefault();SFX.click();closeModal();},{passive:false});
}
function selectProfile(name){
  if(!profiles[name])return;
  curProfile=name;
  save=ensureResearchState(Object.assign(defaultSave(),profiles[name]));
  if(!save.profileId){save.profileId=genProfileId();profiles[name]=save;}
  enterGame();
}
function createProfile(rawName){
  const name=(rawName||'').trim().slice(0,18);
  if(!name)return;
  if(!profiles[name]&&Object.keys(profiles).length>=MAX_PROFILES){prop(t('profileLimit'),2200);return;}
  if(!profiles[name])profiles[name]=Object.assign(defaultSave(),{playerName:name,profileId:genProfileId(),tutorialDone:false});
  selectProfile(name);
}
let splashIntroPlayed=false;
let syncStatus='idle'; // idle | syncing | saved | offline | error
let lastCloudStatusRefreshToken=0;
function cloudSyncStorageKey(profileId){
  const uid=(window.MXCloud&&window.MXCloud.uid)||'guest';
  const pid=profileId||(save&&save.profileId)||'profile';
  return 'moleculox_last_cloud_sync_v1_'+uid+'_'+pid;
}
function readLastCloudSync(){
  try{return Math.max(0,Number(localStorage.getItem(cloudSyncStorageKey()))||0);}catch(e){return 0;}
}
function recordLastCloudSync(){
  const at=Date.now();
  try{localStorage.setItem(cloudSyncStorageKey(),String(at));}catch(e){}
  return at;
}
function formatCloudDate(at){
  at=Math.max(0,Number(at)||0);if(!at)return '';
  try{return new Intl.DateTimeFormat(localeCode(),{dateStyle:'medium',timeStyle:'short'}).format(new Date(at));}catch(e){return new Date(at).toLocaleString();}
}
function providerDisplayList(){
  const ids=Array.isArray(accountState.providers)?accountState.providers:[];
  const map={'apple.com':'Apple','google.com':'Google','password':ml("E-posta","Email","E-Mail","Correo","E-mail","メール")};
  return ids.map(id=>map[id]||id).join(' · ')|| (accountState.isAnonymous?(ml("Misafir","Guest","Gast","Invitado","Convidado","ゲスト")):'—');
}
function setSyncStatus(s){
  syncStatus=s;
  if(s==='saved')recordLastCloudSync();
  const el=document.getElementById('syncDot');
  if(el){
    el.className='syncDot sync-'+s;
    const c=typeof accountCopy==='function'?accountCopy():null;
    el.title=c?(s==='saved'?c.syncSaved:s==='syncing'?c.syncWorking:s==='offline'?c.syncOffline:s==='error'?c.syncError:'Cloud sync status'):'Cloud sync status';
  }
  const live=document.getElementById('cloudLiveState');
  if(live&&typeof updateCloudStatusHeader==='function')updateCloudStatusHeader();
}
let leaderboardRepairPromise=null;
let leaderboardRepairTimer=null;
let leaderboardRepairLastAt=0;
function hasPermanentCloudAccount(){
  const a=window.MXCloud&&window.MXCloud.account;
  return !!(a&&a.signedIn&&!a.isAnonymous);
}

// V8.1.6: real silent checkpoint after every completed campaign level.
// The newest pending snapshot is persisted locally, coalesced, and retried after reconnect/reload.
const LEVEL_CHECKPOINT_STORAGE='mx_pending_level_checkpoint_v816';
let levelCloudCheckpointRunning=false;
let levelCloudCheckpointPending=null;
let levelCloudCheckpointRetryTimer=null;
function rememberLevelCloudCheckpoint(job){
  try{localStorage.setItem(LEVEL_CHECKPOINT_STORAGE,JSON.stringify(job));}catch(e){}
}
function forgetLevelCloudCheckpoint(){
  try{localStorage.removeItem(LEVEL_CHECKPOINT_STORAGE);}catch(e){}
}
function restoreLevelCloudCheckpoint(){
  if(levelCloudCheckpointPending)return;
  try{
    const raw=localStorage.getItem(LEVEL_CHECKPOINT_STORAGE);
    const job=raw&&JSON.parse(raw);
    if(job&&job.snapshot&&job.profileId)levelCloudCheckpointPending=job;
  }catch(e){forgetLevelCloudCheckpoint();}
}
function queueLevelCloudCheckpoint(reason){
  try{
    const account=window.MXCloud&&window.MXCloud.account;
    if(!window.MXCloud||!window.MXCloud.saveProgressNow||!save||!save.profileId||!account||!account.signedIn)return;
    levelCloudCheckpointPending={
      reason:String(reason||'level-complete'),
      profileId:save.profileId,
      queuedAt:Date.now(),
      snapshot:JSON.parse(JSON.stringify(save))
    };
    rememberLevelCloudCheckpoint(levelCloudCheckpointPending);
    runLevelCloudCheckpoint();
  }catch(e){console.warn('[sync] checkpoint queue failed',e);}
}
async function runLevelCloudCheckpoint(){
  restoreLevelCloudCheckpoint();
  if(levelCloudCheckpointRunning||!levelCloudCheckpointPending)return;
  if(!window.MXCloud||!window.MXCloud.saveProgressNow){
    clearTimeout(levelCloudCheckpointRetryTimer);
    levelCloudCheckpointRetryTimer=setTimeout(runLevelCloudCheckpoint,1500);
    return;
  }
  if(navigator.onLine===false){
    setSyncStatus('offline');
    clearTimeout(levelCloudCheckpointRetryTimer);
    levelCloudCheckpointRetryTimer=setTimeout(runLevelCloudCheckpoint,5000);
    return;
  }
  const job=levelCloudCheckpointPending;
  levelCloudCheckpointPending=null;
  levelCloudCheckpointRunning=true;
  setSyncStatus('syncing');
  try{
    const merged=await window.MXCloud.saveProgressNow(job.snapshot,job.profileId);
    if(!merged||typeof merged!=='object')throw new Error('cloud/save-empty-result');
    if(!levelCloudCheckpointPending)forgetLevelCloudCheckpoint();
    recordLastCloudSync();
    setSyncStatus('saved');
  }catch(e){
    console.warn('[sync] level checkpoint failed:',job.reason,e&&e.code||e);
    if(!levelCloudCheckpointPending)levelCloudCheckpointPending=job;
    rememberLevelCloudCheckpoint(levelCloudCheckpointPending);
    setSyncStatus(navigator.onLine===false?'offline':'error');
  }finally{
    levelCloudCheckpointRunning=false;
    if(levelCloudCheckpointPending){
      clearTimeout(levelCloudCheckpointRetryTimer);
      levelCloudCheckpointRetryTimer=setTimeout(runLevelCloudCheckpoint,navigator.onLine===false?5000:1400);
    }
  }
}
window.addEventListener('online',()=>runLevelCloudCheckpoint(),{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')runLevelCloudCheckpoint();},{passive:true});
setTimeout(()=>runLevelCloudCheckpoint(),1800);

function applyMergedCloudProfile(data){
  if(!data||typeof data!=="object")return;
  save=hasPermanentCloudAccount()?cloudAuthoritativeProfile(save,data):mergeCloudData(save,data);save.autoGuest=false;
  if(curProfile)profiles[curProfile]=save;
  persistAll();updateCoins();updateBadge();
  document.body.classList.toggle('nodpad',!save.dpad);
  if(scr.splash.classList.contains('on'))refreshSplash();
}
async function repairCurrentLeaderboard(reason,force){
  if(!window.MXCloud||!save.profileId)return {ok:false,reason:'cloud-unavailable'};
  if(leaderboardRepairPromise)return leaderboardRepairPromise;
  const now=Date.now();
  if(!force&&now-leaderboardRepairLastAt<12000)return {ok:true,throttled:true};
  leaderboardRepairLastAt=now;
  leaderboardRepairPromise=(async()=>{
    try{
      await window.MXCloud.ready;
      if(!hasPermanentCloudAccount())return {ok:false,reason:'account-required'};
      setSyncStatus('syncing');
      // First commit the complete locally merged profile. The transaction keeps
      // the highest stars/RP from either device, so an old device cannot lower it.
      if(window.MXCloud.saveProgressNow){
        const merged=await window.MXCloud.saveProgressNow(save,save.profileId);
        if(!merged||typeof merged!=='object')throw Object.assign(new Error('cloud/save-failed'),{code:'cloud/save-failed'});
        applyMergedCloudProfile(merged);
      }
      const fn=window.MXCloud.repairLeaderboard||window.MXCloud.syncLeaderboard;
      if(!fn)return {ok:false,reason:'leaderboard-unavailable'};
      const result=window.MXCloud.repairLeaderboard?
        await fn(save,save.profileId):await fn(save,save.profileId,true);
      if(result&&result.ok){setSyncStatus('saved');return result;}
      setSyncStatus(navigator.onLine===false?'offline':'error');
      return result||{ok:false,reason:'unknown'};
    }catch(e){
      console.warn('[sync] leaderboard repair failed:',reason,e&&e.code||e);
      setSyncStatus(navigator.onLine===false?'offline':'error');
      return {ok:false,reason:e&&e.code||'error'};
    }
  })();
  try{return await leaderboardRepairPromise;}finally{leaderboardRepairPromise=null;}
}
function scheduleLeaderboardRepair(reason,delay,force){
  clearTimeout(leaderboardRepairTimer);
  leaderboardRepairTimer=setTimeout(async()=>{
    const res=await repairCurrentLeaderboard(reason,!!force);
    if((!res||!res.ok)&&navigator.onLine!==false){
      // One bounded retry covers delayed Firebase auth/network restoration.
      leaderboardRepairTimer=setTimeout(()=>repairCurrentLeaderboard(reason+'-retry',true),6000);
    }
  },Math.max(0,Number(delay)||0));
}

async function syncFromCloud(){
  if(!window.MXCloud||!save.profileId)return;
  setSyncStatus('syncing');
  try{
    await window.MXCloud.ready;
    if(!window.MXCloud.uid){setSyncStatus('offline');return;}
    const cloud=await window.MXCloud.loadProfile(save.profileId);
    if(cloud)applyMergedCloudProfile(cloud);
    // A successful account restore must always push the merged local maximum
    // back to both the profile document and the public leaderboard.
    if(hasPermanentCloudAccount())await repairCurrentLeaderboard('startup-merge',true);
    else setSyncStatus(window.MXCloud.authFailed?'offline':'saved');
  }catch(e){
    console.warn('[sync] cloud restore failed:',e);
    setSyncStatus('error');
  }
}

let onlineCountTimer=null;
async function refreshOnlinePlayerCount(){
  const wrap=$('#onlinePlayerCount'),text=$('#onlinePlayerCountText');
  if(!wrap||!text)return;
  if(navigator.onLine===false){wrap.classList.add('offline');text.textContent=ml("ÇEVRİMDIŞI","OFFLINE","OFFLINE","SIN CONEXIÓN","OFFLINE","オフライン");return;}
  try{
    if(!window.MXCloud||!window.MXCloud.getOnlinePlayerCount){wrap.classList.add('offline');text.textContent='ONLINE: —';return;}
    await window.MXCloud.ready;
    if(window.MXCloud.startPresence)await window.MXCloud.startPresence();
    const count=await window.MXCloud.getOnlinePlayerCount();
    if(Number.isFinite(count)){wrap.classList.remove('offline');text.textContent=LANG==='tr'?count+' OYUNCU ONLINE':count+' PLAYERS ONLINE';}
    else{wrap.classList.add('offline');text.textContent='ONLINE: —';}
  }catch(e){wrap.classList.add('offline');text.textContent='ONLINE: —';}
}
function startOnlineCountLoop(){
  clearInterval(onlineCountTimer);
  refreshOnlinePlayerCount();
  onlineCountTimer=setInterval(()=>{if(!document.hidden&&scr.splash.classList.contains('on'))refreshOnlinePlayerCount();},30000);
}
window.addEventListener('online',refreshOnlinePlayerCount);
window.addEventListener('offline',refreshOnlinePlayerCount);

let tutorialLaunchArmed=false;
function enterGame(){
  save=ensureResearchState(save);
  applyVol(); // re-sync gain/volume to this profile's real saved settings (bootPlay played music before this profile was loaded)
  document.body.classList.toggle('nodpad',!save.dpad);
  setLang(normalizeLang(save.lang));
  setBgForTier(tierOf(save.cur),false);
  persist();
  if(checkAchievementsSilent())persist();
  updateCoins();updateBadge();
  // V8.5.35: the basic tutorial must never auto-open during boot/profile restore.
  // It begins only after the player explicitly chooses NEW GAME and submits a name.
  if(!save.tutorialDone&&tutorialLaunchArmed&&String(save.playerName||'').trim()){
    tutorialLaunchArmed=false;
    startTutorial();
    return;
  }
  tutorialLaunchArmed=false;
  show('splash');
  startOnlineCountLoop();
  maybePlaySplashIntro();
  setTimeout(showGuestAccountToast,900);
  // Cross-platform boot: an authenticated account must reconcile all cloud
  // profiles before the active profile performs its normal one-profile sync.
  // This fixes fresh itch.io/Android installs creating a different local
  // profileId and therefore appearing empty even though Netlify has progress.
  if(!accountState.isAnonymous){
    setTimeout(async()=>{await reconcileAccountProfiles();await syncFromCloud();},120);
  }else{
    syncFromCloud(); // guest saves are origin-local until an account is linked
  }
}
function maybePlaySplashIntro(){
  // The boot screen now owns the dark-start/bulb-reveal moment (per user
  // feedback: having a second one here felt repetitive right after it).
  // Left as a no-op hook in case a lighter splash-specific flourish is
  // wanted later, without needing to re-wire enterGame().
  return;
}
function forceMainMenuVisible(){
  // V6.17: independent, animation-free screen switch for iPhone/itch.
  // This prevents a failed profile/audio/tutorial step from leaving only the background visible.
  try{
    screenTransitionLock=false;
    document.body.classList.remove('mxUiTransitioning');
    for(const key in scr){
      if(!scr[key])continue;
      scr[key].classList.remove('mxLeaving','mxEntering');
      scr[key].classList.toggle('on',key==='splash');
    }
    refreshSplash();
    startOnlineCountLoop();
    startSplashConversation(true,260);
    requestAnimationFrame(()=>{applyStableViewport(true);syncStandaloneEinsteinMode();});
  }catch(err){
    console.error('forceMainMenuVisible failed',err);
    const splash=document.getElementById('splash');
    const boot=document.getElementById('bootScr');
    if(boot)boot.classList.remove('on');
    if(splash){splash.classList.add('on');splash.style.display='block';splash.style.visibility='visible';splash.style.opacity='1';}
  }
}
function bootPlay(){
  if(bootPlayBusy)return;
  bootPlayBusy=true;
  const firstBoot=!bootDone;
  bootDone=true;
  // Open the real menu first. Audio, profile and cloud work must never block the UI.
  forceMainMenuVisible();
  stopStartupAudio();
  unlock();
  MP.mode='menu';MP.idx=MENU_TRACK_INDEX;musicAudio.loop=true;
  playTrack(MENU_TRACK_INDEX,true);
  const continueBoot=()=>{
    try{
      const names=Object.keys(profiles||{});
      let target=(lastProfile&&profiles[lastProfile])?lastProfile:(names.length===1?names[0]:null);
      if(target){
        curProfile=target;
        save=ensureResearchState(Object.assign(defaultSave(),profiles[target]));
        if(!save.profileId){save.profileId=genProfileId();profiles[target]=save;}
        enterGame();
      }else if(names.length>1){
        buildProfileSelect();
        show('profile');
      }else{
        createAutoGuestProfile();
        enterGame();
      }
    }catch(err){
      console.error('bootPlay failed, falling back to auto guest profile',err);
      try{createAutoGuestProfile();}catch(_e){}
      enterGame();
    }finally{
      bootPlayBusy=false;
      // A destination screen must always exist after PLAY.
      setTimeout(()=>{
        const visible=Object.values(scr).some(el=>el&&el.classList.contains('on'));
        if(!visible||scr.boot.classList.contains('on'))forceMainMenuVisible();
      },180);
    }
  };
  if(firstBoot)setTimeout(continueBoot,80);else continueBoot();
}

function updateCoins(bump){
  ensureCoinLedger(save);
  if(!save.maxCoins||save.coins>save.maxCoins)save.maxCoins=save.coins;
  const mainCoin=$('#coinChip span:last-child');if(mainCoin)mainCoin.textContent=save.coins;
  const labCoin=$('#labCoinChip span:last-child');if(labCoin)labCoin.textContent=save.coins;
  if(bump){const c=$('#coinChip');if(c){c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');}SFX.coin();}
}
function updateBadge(){
  const n=Object.keys(save.disc).length,b=$('#molBadge');
  b.textContent=n;b.style.display=n?'flex':'none';
  const achievementIds=new Set(ACHV.map(a=>a.id));
  const an=Object.keys(save.achv||{}).filter(id=>achievementIds.has(id)&&save.achv[id]).length,ab=$('#achvBadge');
  ab.textContent=an;ab.style.display=an?'flex':'none';
}

/* ================= MOLECULE MINI-DRAW ================= */
function drawMol(cv,mol,gray,animT){
  const dpr=Math.min(window.devicePixelRatio||1,2.5);
  const cw=cv.clientWidth||parseInt(cv.style.width)||88,ch=cv.clientHeight||64;
  cv.width=cw*dpr;cv.height=ch*dpr;
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,cw,ch);
  const xs=mol.s.map(a=>a[1]),ys=mol.s.map(a=>a[2]);
  const sw=Math.max(...xs)+1,sh=Math.max(...ys)+1;
  const t=Math.min(cw/(sw+0.4),ch/(sh+0.4),30);
  const ox=(cw-sw*t)/2,oy=(ch-sh*t)/2;
  const glowPulse=animT?(0.75+0.25*Math.sin(animT/700)):1;
  const P=(a,i)=>{
    if(!animT)return [ox+(a[1]+0.5)*t,oy+(a[2]+0.5)*t];
    const wob=Math.sin(animT/850+(i!=null?i*1.8:0))*0.045;
    return [ox+(a[1]+0.5)*t,oy+(a[2]+0.5+wob)*t];
  };
  c.lineWidth=Math.max(3,t*0.18);c.lineCap='round';
  c.strokeStyle=gray?'rgba(160,160,180,.6)':'rgba(190,230,255,.95)';
  c.shadowColor=gray?'transparent':'rgba(79,216,255,.9)';c.shadowBlur=gray?0:6*glowPulse;
  for(let i=0;i<mol.s.length;i++)for(let j=i+1;j<mol.s.length;j++){
    const dx=mol.s[j][1]-mol.s[i][1],dy=mol.s[j][2]-mol.s[i][2];
    if(Math.abs(dx)+Math.abs(dy)===1){if(mol.s[i][0]==='H'&&mol.s[j][0]==='H')continue;const[a,b]=[P(mol.s[i],i),P(mol.s[j],j)];c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}
  }
  c.shadowBlur=0;
  for(let i=0;i<mol.s.length;i++){
    const at=mol.s[i];
    const[x,y]=P(at,i),r=t*0.42,e=EL[at[0]];
    if(animT&&!gray){c.save();c.globalAlpha=0.3*glowPulse;c.shadowColor=e.c;c.shadowBlur=r*1.1;c.beginPath();c.arc(x,y,r*0.92,0,7);c.fillStyle=e.c;c.fill();c.restore();}
    const g=c.createRadialGradient(x-r*0.35,y-r*0.4,r*0.15,x,y,r);
    if(gray){g.addColorStop(0,'#9aa');g.addColorStop(1,'#556');}
    else{g.addColorStop(0,e.hi);g.addColorStop(1,e.c);}
    c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
    c.fillStyle=gray?'#dde':e.t;c.font='900 '+Math.max(8,t*0.4)+'px -apple-system,system-ui,sans-serif';
    c.textAlign='center';c.textBaseline='middle';c.fillText(at[0],x,y+0.5);
  }
}

/* ================= LEVEL / COLLECTION SCREENS ================= */
function sparkleBurst(x,y,cols){
  cols=cols||['#ffd66e','#fff2c2','#ffc94d'];
  for(let i=0;i<9;i++)P({k:'glit',x:x+(Math.random()-0.5)*26,y:y+(Math.random()-0.5)*18,vx:(Math.random()-0.5)*1.4,vy:-0.8-Math.random()*1.3,c:rnd(cols),r:1.5+Math.random()*2.2,life:0.9});
}
function popStars(sp,stars){
  for(let i=0;i<3;i++){
    if(!sp[i])continue;
    if(i<stars){
      sp[i].classList.add('pop');
      setTimeout(()=>{
        SFX.star(i);
        const r=sp[i].getBoundingClientRect();
        sparkleBurst(r.left+r.width/2,r.top+r.height/2);
      },260+i*330);
    }else sp[i].classList.add('off');
  }
}
function starStr(n){let s='';for(let i=0;i<3;i++)s+=i<n?'<span>★</span>':'<span class="off">★</span>';return s;}
function campaignLevelStableKey(level,index){
  const exp=(level&&typeof level.exp==='string')?level.exp.trim():'';
  return exp||('campaign-'+(Number(index)+1)+'-'+String((level&&level.m)||'unknown'));
}
function resolveCampaignLevelIndex(index,expectedKey=''){
  const raw=Math.max(0,Math.min(LEVELS.length-1,Number(index)||0));
  // Prefer the exact identity captured by the level card. This keeps a tap
  // attached to the same experiment even if an older cached level array was
  // briefly mixed with a newer game.js during an update.
  if(expectedKey){
    const exact=LEVELS.findIndex((L,idx)=>campaignLevelStableKey(L,idx)===expectedKey);
    if(exact>=0)return exact;
  }
  const levelNumber=raw+1;
  // Grand Master cards also carry explicit gm-NNN ids. Resolve by number as
  // a second safety net for Continue/Next flows that only pass an index.
  if(levelNumber>=286&&levelNumber<=300){
    const key='gm-'+levelNumber+'-';
    const exact=LEVELS.findIndex(L=>String((L&&L.exp)||'').startsWith(key));
    if(exact>=0)return exact;
  }
  return raw;
}
function buildLevels(){
  updateBonusStatus();applyBonusCosmetics();
  const g=$('#lvGrid');g.innerHTML='';
  LEVELS.forEach((L,i)=>{
    const b=document.createElement('button');
    const locked=i>save.cur;
    b.className='lvBtn'+(locked?' lock':'')+(i===save.cur&&!locked?' cur':'')+(!locked&&L.b?' feature-'+L.b:'');
    const featureTag=(!locked&&L.b)?('<div class="campaignFeatureTag '+L.b+'" title="'+campaignFeatureName(L.b)+'">'+campaignFeatureIcon(L.b)+'</div>'):'';
    const molecule=MOLS[L.m];
    const formula=(!locked&&molecule)?'<div class="lvFormula">'+molecule.f+'</div>':'';
    b.setAttribute('aria-label',locked?(LANG==='tr'?'Kilitli bölüm '+(i+1):'Locked level '+(i+1)):((LANG==='tr'?'Bölüm ':'Level ')+(i+1)+' · '+(molecule?molecule.f:'')));
    b.innerHTML='<div class="lvNum'+(locked?' lockedNum':'')+'">'+(i+1)+'</div>'+formula+
      (locked?'<div class="lockIcon"><i></i></div>':'<div class="st">'+starStr(save.stars[i]||0)+'</div>'+(SPEEDRUN_LEVELS.includes(i)?'<div class="speedTag">⚡</div>':'')+featureTag);
    if(!locked){
      const stableKey=campaignLevelStableKey(L,i);
      b.dataset.levelNumber=String(i+1);
      b.dataset.levelKey=stableKey;
      let px=0,py=0;
      b.addEventListener('pointerdown',e=>{px=e.clientX;py=e.clientY;},{passive:true});
      b.addEventListener('pointerup',e=>{
        const dist=Math.max(Math.abs(e.clientX-px),Math.abs(e.clientY-py));
        if(dist<10){SFX.click();goToLevel(i,stableKey);}
      },{passive:true});
    }
    g.appendChild(b);
  });
  requestAnimationFrame(updateLvScrollThumb);
}
function updateLvScrollThumb(){
  const sa=$('#lvScrollArea'),thumb=$('#lvScrollThumb');
  if(!sa||!thumb)return;
  const ratio=sa.clientHeight/sa.scrollHeight;
  if(ratio>=1){thumb.style.opacity='0';return;}
  thumb.style.opacity='1';
  thumb.style.height=(ratio*100)+'%';
  thumb.style.top=((sa.scrollTop/sa.scrollHeight)*100)+'%';
}
function buildHof(){
  const inp=$('#hofNameInput');
  inp.value=save.playerName||'';
  inp.placeholder=t('hofNamePh');
  const tier=tierOf(save.cur);
  const monthlyRank=currentMonthlyCandidateRank();
  $('#hofRankLine').textContent=monthlyRank===1?(LANG==='tr'?'🏆 Ayın Nobel Ödüllüsü':'🏆 Monthly Nobel Laureate'):t('rank'+tier);

  ensureResearchState(save);
  const score=save.researchPoints||0;
  const maxCoins=save.maxCoins||0;
  const times=Object.values(save.speedRuns);
  const bestTime=times.length?Math.min(...times):null;

  $('#hofChampGrid').innerHTML=[
    [score,t('hofStatScore'),'🏅'],
    [maxCoins,t('hofStatMaxCoins'),'🪙'],
    [bestTime?bestTime.toFixed(1)+'s':'—',t('hofStatBestTime'),'⚡'],
  ].map(([v,l,ic])=>
    '<div class="hofChamp"><div class="ic">'+ic+'</div><div class="v">'+v+'</div><div class="l">'+l+'</div></div>'
  ).join('');

  const stars3=Object.values(save.stars).filter(v=>v===3).length;
  const levelsDone=Object.keys(save.stars).length;
  const molCount=Object.keys(save.disc).length;
  const achvCount=ACHV.filter(a=>save.achv&&save.achv[a.id]).length;

  const stats=[
    [stars3,t('hofStat3Stars')],
    [levelsDone,t('hofStatLevels')],
    [molCount,t('hofStatMols')],
    [achvCount+'/'+ACHV.length,t('hofStatAchv')],
  ];
  $('#hofStatsGrid').innerHTML=stats.map(([v,l])=>
    '<div class="hofStat"><div class="v">'+v+'</div><div class="l">'+l+'</div></div>'
  ).join('');

  const sg=$('#hofSpeedGrid');
  sg.innerHTML='';
  const setTimes=SPEEDRUN_LEVELS.map(idx=>save.speedRuns[idx]).filter(v=>typeof v==='number');
  const fastest=setTimes.length?Math.min(...setTimes):null;
  SPEEDRUN_LEVELS.forEach((idx,ri)=>{
    const lv=LEVELS[idx];
    if(!lv)return;
    const best=save.speedRuns[idx];
    const locked=idx>save.cur;
    const isBest=best!=null&&best===fastest;
    const row=document.createElement('div');
    row.className='hofSpeedRow'+(locked?' locked':'')+(isBest?' best':'');
    row.style.animationDelay=(ri*70)+'ms';
    const molName=locked?'???':(MOLS[lv.m]?MOLS[lv.m].n:lv.m);
    row.innerHTML='<span class="mol">'+(idx+1)+'. '+molName+'</span><span class="time">'+(isBest?'👑 ':'')+(best?best.toFixed(1)+'s':(locked?'🔒':t('hofNotYet')))+'</span>';
    sg.appendChild(row);
  });
  buildHofTabs();
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function careerScoreOf(r){
  const rp=clampDisplay(r&&r.researchPoints),completed=clampDisplay(r&&r.completedLevels),stars=clampDisplay(r&&r.totalStars);
  return rp+(completed*20)+(stars*5);
}
function rankScoreText(r){
  if(r.periodRP!=null)return clampDisplay(r.periodRP).toLocaleString()+' RP';
  return careerScoreOf(r).toLocaleString()+' CP';
}
function validatedRankTime(ms){
  ms=clampDisplay(ms);
  const missingLimit=6*3600000;
  if(!ms||ms>=missingLimit)return '—';
  const sec=Math.floor(ms/1000),min=Math.floor(sec/60),rest=sec%60;
  return min?min+'m '+String(rest).padStart(2,'0')+'s':rest+'s';
}
function rankDetailText(r){
  const completed=clampDisplay(r.completedLevels),perfect=clampDisplay(r.perfectLevels),stars=clampDisplay(r.totalStars);
  return '🧩 '+completed+'/'+LEVELS.length+' · ⭐ '+stars+' · 💎 '+perfect+' · ⏱ '+validatedRankTime(r.totalValidatedSolveTime);
}
function rowHtml(r,i,myUid,myProfileId){
  const rank=i+1;
  const isMe=r.uid===myUid&&r.profileId===myProfileId;
  const cls='hofWorldRow'+(isMe?' me':'')+(rank===1?' top1':rank===2?' top2':rank===3?' top3':'');
  const medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;
  const nm=esc((r.playerName||'?').slice(0,18));
  const dl=Math.min(i,14)*40;
  return '<div class="'+cls+'" style="animation-delay:'+dl+'ms"><span class="rk">'+medal+'</span><div class="hofRankIdentity"><span class="nm">'+(isMe?t('worldYou')+' · ':'')+nm+'</span><small>'+rankDetailText(r)+'</small></div><span class="sc">'+rankScoreText(r)+'</span></div>';
}
const ONLINE_RANKINGS_ENABLED=true;
let hofTopMode='records',hofSubMode='world',duelRankMode='world';
function buildHofTabs(){
  setHofTopMode(hofTopMode,true);
  if(hofTopMode==='rankings')setHofSubMode(hofSubMode);
  if(hofTopMode==='duel')setDuelRankMode(duelRankMode);
}
function initHofTabs(){
  const records=$('#hofTopRecords'),rankings=$('#hofTopRankings'),duel=$('#hofTopDuel');
  if(records)records.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();setHofTopMode('records');},{passive:false});
  if(rankings)rankings.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();setHofTopMode('rankings');},{passive:false});
  if(duel)duel.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();setHofTopMode('duel');},{passive:false});
  document.querySelectorAll('.duelRankTab').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();setDuelRankMode(b.dataset.dueltab);},{passive:false}));
  document.querySelectorAll('.hofSubTab').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();setHofSubMode(b.dataset.tab);},{passive:false});
  });
}
function setHofTopMode(mode,silent){
  if(mode==='rankings'&&!ONLINE_RANKINGS_ENABLED)mode='records';
  if(mode==='duel'&&!$('#hofDuelPane'))mode='records';
  hofTopMode=mode;
  const records=$('#hofTopRecords'),rankings=$('#hofTopRankings'),duel=$('#hofTopDuel');
  const recordsPane=$('#hofRecordsPane'),rankingsPane=$('#hofRankingsPane'),duelPane=$('#hofDuelPane');
  if(records)records.classList.toggle('on',mode==='records');
  if(rankings)rankings.classList.toggle('on',mode==='rankings');
  if(duel){duel.classList.toggle('on',mode==='duel');duel.textContent=LANG==='tr'?'⚔️ DÜELLO RANK':'⚔️ DUEL RANK';}
  if(recordsPane)recordsPane.style.display=mode==='records'?'':'none';
  if(rankingsPane)rankingsPane.style.display=mode==='rankings'?'':'none';
  if(duelPane)duelPane.style.display=mode==='duel'?'':'none';
  if(mode==='rankings'&&!silent)setHofSubMode(hofSubMode);
  if(mode==='duel')setDuelRankMode(duelRankMode);
}
function setHofSubMode(tab){
  if(!['world','week','month','champs'].includes(tab))tab='world';
  hofSubMode=tab;
  document.querySelectorAll('.hofSubTab').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  const grid=$('#hofWorldGrid'),soon=$('#hofComingSoon'),label=$('#hofPeriodLabel');
  if(tab==='champs'){
    if(grid)grid.style.display='none';if(soon)soon.style.display='flex';
    if(label)label.textContent=t('tabChamps');
    refreshChampionsTab();
    return;
  }
  if(grid)grid.style.display='';if(soon)soon.style.display='none';
  refreshHofWorldTabs(tab);
}
function rankingResetCountdownHtml(tab){
  if(tab!=='week'&&tab!=='month')return '';
  const now=new Date();
  let end;
  if(tab==='month')end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1,0,0,0));
  else{
    const day=now.getUTCDay()||7;
    end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+(8-day),0,0,0));
  }
  const ms=Math.max(0,end-now),days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),mins=Math.floor(ms%3600000/60000);
  const label=LANG==='tr'?(tab==='month'?'Aylık sıralama sıfırlanıyor':'Haftalık sıralama sıfırlanıyor'):(tab==='month'?'Monthly ranking resets in':'Weekly ranking resets in');
  const value=LANG==='tr'?(days+' gün '+hours+' saat '+mins+' dk'):(days+'d '+hours+'h '+mins+'m');
  return '<div class="hofResetCountdown">⏳ <b>'+label+':</b> '+value+' <small>(UTC)</small></div>';
}

async function refreshHofWorldTabs(tab){
  tab=tab||hofSubMode||'world';
  const grid=$('#hofWorldGrid');const label=$('#hofPeriodLabel');if(!grid)return;
  label.textContent=tab==='week'?t('tabWeek'):tab==='month'?t('tabMonth'):t('hofWorldTitle');
  const guest=!!(window.MXCloud&&window.MXCloud.account&&window.MXCloud.account.isAnonymous);
  const periodFair=tab==='week'||tab==='month';
  const memberInfo=periodFair?
    (LANG==='tr'?'Adil dönem puanı yalnızca herkesin aynı gün oynadığı Günün Deneyi’nden gelir. Herkes 20 Temmuz 2026’da 0’dan başlar.':'Fair period score comes only from Today’s Experiment, which is the same daily challenge for everyone. Everyone starts from 0 on July 20, 2026.'):
    (LANG==='tr'?'Kariyer Puanı = RP + (tamamlanan bölüm × 20) + (toplam yıldız × 5). Eski RP, bölüm ve yıldızların korunur.':'Career Score = RP + (completed levels × 20) + (total stars × 5). Your previous RP, levels and stars are preserved.');
  const localCompleted=Object.values(save.stars||{}).filter(v=>Number(v)>0).length;
  const localPerfect=Object.values(save.stars||{}).filter(v=>Number(v)===3).length;
  const localStars=Object.values(save.stars||{}).reduce((sum,v)=>sum+Math.max(0,Math.min(3,Number(v)||0)),0);
  const localCareer=clampDisplay(save.researchPoints)+(localCompleted*20)+(localStars*5);
  const localSummary='<div class="hofLocalSummary">'+(LANG==='tr'?'Bu profil':'This profile')+': <b>'+localCareer.toLocaleString()+' CP</b> · '+clampDisplay(save.researchPoints).toLocaleString()+' RP · 🧩 '+localCompleted+'/'+LEVELS.length+' · ⭐ '+localStars+' · 💎 '+localPerfect+'</div>';
  const refreshAction=guest?'':'<button type="button" id="hofForceRefresh" class="hofRefreshBtn">🔄 '+(LANG==='tr'?'SIRALAMAYI YENİLE':'REFRESH RANKING')+'</button>';
  const notice='<div class="hofWorldNotice '+(guest?'guest':'member')+'"><div>'+(
    guest?(LANG==='tr'?'Sıralamaları görebilirsin. Puanını yayımlamak için profil ikonundan Google veya e-posta hesabını bağla.':'You can view rankings. Connect an Google or email account from the profile icon to publish your score.'):
      memberInfo)+'</div>'+rankingResetCountdownHtml(tab)+localSummary+refreshAction+'</div>';
  const bindRankingRefresh=()=>{const btn=$('#hofForceRefresh');if(!btn)return;bindTap(btn,async()=>{btn.disabled=true;btn.textContent=LANG==='tr'?'⏳ YENİLENİYOR':'⏳ REFRESHING';try{await repairCurrentLeaderboard('manual-hall-refresh',true);if(window.MXCloud.clearLeaderboardCache)window.MXCloud.clearLeaderboardCache();}finally{await refreshHofWorldTabs(tab);}});};
  grid.innerHTML=notice+'<div id="hofWorldMsg">'+t('worldLoading')+'</div>';bindRankingRefresh();
  if(!window.MXCloud){grid.innerHTML=notice+'<div id="hofWorldMsg">'+t('worldOffline')+'</div>';bindRankingRefresh();return;}
  const myUid=window.MXCloud.uid,myProfileId=save.profileId;
  try{
    if(!guest&&save.profileId){try{if(window.MXCloud.cleanupOrphanRankingRows)await window.MXCloud.cleanupOrphanRankingRows();if(window.MXCloud.cleanupPlaceholderRankingRows)await window.MXCloud.cleanupPlaceholderRankingRows();await repairCurrentLeaderboard('hall-of-fame',true);}catch(syncErr){console.warn('[Moleculox] leaderboard repair skipped:',syncErr&&syncErr.code);}}
    let result=null,rows=null;
    if(tab==='week'){result=await window.MXCloud.getWeeklyLeaderboard(100,true);rows=result&&result.rows;}
    else if(tab==='month'){result=await window.MXCloud.getMonthlyLeaderboard(100,true);rows=result&&result.rows;}
    else rows=await window.MXCloud.getLeaderboard(100,true);
    if(!scr.hof.classList.contains('on'))return;
    if(!rows){grid.innerHTML=notice+'<div id="hofWorldMsg">'+t('worldOffline')+'</div>';bindRankingRefresh();return;}
    if(!rows.length){grid.innerHTML=notice+'<div id="hofWorldMsg">'+t('worldEmpty')+'</div>';bindRankingRefresh();return;}
    grid.innerHTML=notice+rows.map((r,i)=>rowHtml(r,i,myUid,myProfileId)).join('');bindRankingRefresh();
  }catch(e){if(scr.hof.classList.contains('on')){grid.innerHTML=notice+'<div id="hofWorldMsg">'+t('worldOffline')+'</div>';bindRankingRefresh();}}
}

function setDuelRankMode(mode){if(!['world','week','month'].includes(mode))mode='world';duelRankMode=mode;document.querySelectorAll('.duelRankTab').forEach(b=>b.classList.toggle('on',b.dataset.dueltab===mode));refreshDuelRankings(mode);}
function duelRankSummaryHtml(){ensureDuelRankState(save);const league=duelLeagueForRating(save.duelRating);return '<div class="duelRankHero"><div class="duelRankHeroTop"><b>'+league.icon+' '+duelLeagueName(league)+'</b><span>'+save.duelRating+' DP</span></div><div class="duelRankStats"><div><strong>'+save.duelWins+'</strong><small>'+(LANG==='tr'?'GALİBİYET':'WINS')+'</small></div><div><strong>'+save.duelLosses+'</strong><small>'+(LANG==='tr'?'MAĞLUBİYET':'LOSSES')+'</small></div><div><strong>'+save.duelBestStreak+'</strong><small>'+(LANG==='tr'?'EN İYİ SERİ':'BEST STREAK')+'</small></div><div><strong>'+save.duelPeakRating+'</strong><small>'+(LANG==='tr'?'ZİRVE DP':'PEAK DP')+'</small></div></div></div>';}
function duelRankTitleLabel(id){const row=duelTitleRows().find(x=>x.id===id);return row?(LANG==='tr'?row.tr:row.en):'';}
function duelRankRowHtml(r,i,myUid,myProfileId,mode){const rank=i+1,isMe=r.uid===myUid&&r.profileId===myProfileId,medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;const score=mode==='week'?r.periodPoints:mode==='month'?r.periodPoints:r.rating;const league=duelLeagueForRating(r.rating),title=duelRankTitleLabel(r.activeTitle);return '<div class="duelRankRow '+(isMe?'me ':'')+(rank===1?'top1':'')+'"><span class="rk">'+medal+'</span><div class="duelRankIdentity"><b>'+(isMe?(LANG==='tr'?'SEN · ':'YOU · '):'')+esc((r.playerName||'?').slice(0,18))+'</b><small>'+league.icon+' '+duelLeagueName(league)+' · '+Math.max(0,Number(r.wins)||0)+'W / '+Math.max(0,Number(r.losses)||0)+'L'+(title?' · '+esc(title):'')+'</small></div><div class="duelRankScore"><b>'+Math.max(0,Number(score)||0)+(mode==='world'?' DP':' P')+'</b><small>'+Math.max(0,Number(r.periodWins!=null?r.periodWins:r.bestStreak)||0)+' '+(mode==='world'?(LANG==='tr'?'SERİ':'STREAK'):(LANG==='tr'?'GALİBİYET':'WINS'))+'</small></div></div>'; }
async function refreshDuelRankings(mode){ensureDuelRankState(save);const summary=$('#duelRankSummary'),grid=$('#duelRankGrid'),label=$('#duelRankPeriodLabel');if(!summary||!grid)return;summary.innerHTML=duelRankSummaryHtml();document.querySelectorAll('.duelRankTab').forEach((b,i)=>b.textContent=LANG==='tr'?['GENEL','BU HAFTA','BU AY'][i]:['ALL-TIME','THIS WEEK','THIS MONTH'][i]);label.textContent=mode==='week'?utcWeekId():mode==='month'?utcMonthId():(LANG==='tr'?'TÜM ZAMANLAR':'ALL-TIME');grid.innerHTML='<div class="duelRankNotice">'+(ml("Düello sıralaması yükleniyor…","Loading Duel ranking…","Duellrangliste wird geladen …","Cargando clasificación de Duelo…","Carregando ranking de Duelo…","デュエルランキングを読み込み中…"))+'</div>';if(!window.MXCloud||!window.MXCloud.getDuelLeaderboard){grid.innerHTML='<div class="duelRankNotice">'+t('worldOffline')+'</div>';return;}try{if(hasPermanentCloudAccount()&&window.MXCloud.syncDuelLeaderboard)await window.MXCloud.syncDuelLeaderboard(save,save.profileId,true);const res=await window.MXCloud.getDuelLeaderboard(mode,100,true);const rows=res&&res.rows||[];if(!rows.length){grid.innerHTML='<div class="duelRankNotice">'+(ml("Henüz dereceli Hızlı Eşleşme sonucu yok.","No ranked Quick Match results yet.","Noch keine Ranglisten-Ergebnisse im Schnellmatch.","Aún no hay resultados clasificatorios de Partida Rápida.","Ainda não há resultados ranqueados de Partida Rápida.","クイックマッチのランク結果はまだありません。"))+'</div>';return;}grid.innerHTML=rows.map((r,i)=>duelRankRowHtml(r,i,window.MXCloud.uid,save.profileId,mode)).join('');}catch(e){grid.innerHTML='<div class="duelRankNotice">'+t('worldOffline')+'</div>';}}
async function refreshSpotlights(){
  if(!window.MXCloud){fillSpot('hofSpotWeek',null,true);fillSpot('hofSpotMonth',null,true);return;}
  try{
    const wk=await window.MXCloud.getWeeklyLeaderboard(1);
    fillSpot('hofSpotWeek',(wk&&wk.rows&&wk.rows[0])||null,!wk);
  }catch(e){fillSpot('hofSpotWeek',null,true);}
  try{
    const mo=await window.MXCloud.getMonthlyLeaderboard(1);
    fillSpot('hofSpotMonth',(mo&&mo.rows&&mo.rows[0])||null,!mo);
  }catch(e){fillSpot('hofSpotMonth',null,true);}
}
function fillSpot(id,r,offline){
  const el=document.querySelector('#'+id+' .spBody');
  if(!el)return;
  if(offline){el.className='spBody spNone';el.textContent=t('worldOffline');return;}
  if(!r){el.className='spBody spNone';el.textContent=t('spotNone');return;}
  el.className='spBody';
  el.innerHTML='<span class="spName">'+esc((r.playerName||'?').slice(0,18))+'</span><span class="spScore">'+rankScoreText(r)+'</span>';
}
function clampDisplay(v){v=Number(v);return Number.isFinite(v)?Math.max(0,Math.floor(v)):0;}
function buildCollection(){
  const g=$('#molGrid');g.innerHTML='';let n=0;
  if(!save.favoriteMolecules||typeof save.favoriteMolecules!=='object')save.favoriteMolecules={};
  if(!['all','open','locked','fav'].includes(save.collectionFilter))save.collectionFilter='all';
  let tools=$('#collectionTools');
  if(!tools){
    tools=document.createElement('div');tools.id='collectionTools';tools.className='collectionTools';
    g.parentNode.insertBefore(tools,g);
  }
  const labels=LANG==='tr'?{all:'TÜMÜ',open:'AÇIK',locked:'KİLİTLİ',fav:'FAVORİ'}:{all:'ALL',open:'OPEN',locked:'LOCKED',fav:'FAVORITES'};
  tools.innerHTML=['all','open','locked','fav'].map(k=>'<button class="collectionFilter '+(save.collectionFilter===k?'on':'')+'" data-filter="'+k+'">'+labels[k]+'</button>').join('');
  tools.querySelectorAll('.collectionFilter').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();save.collectionFilter=b.dataset.filter;persist();buildCollection();SFX.click();},{passive:false}));
  const firstLevel={};
  LEVELS.forEach((row,i)=>{if(firstLevel[row.m]===undefined)firstLevel[row.m]=i;});
  for(const id in MOLS){
    const m=MOLS[id],d=!!save.disc[id],fav=!!save.favoriteMolecules[id];if(d)n++;
    if(save.collectionFilter==='open'&&!d)continue;
    if(save.collectionFilter==='locked'&&d)continue;
    if(save.collectionFilter==='fav'&&!fav)continue;
    const li=firstLevel[id],stars=li===undefined?0:Math.max(0,Number(save.stars[li])||0),best=li===undefined?0:Math.max(0,Number(save.bestMoves&&save.bestMoves[li])||0),time=li===undefined?0:Math.max(0,Number(save.speedRuns&&save.speedRuns[li])||0);
    const card=document.createElement('div');
    card.className='molCard card'+(d?'':' un')+(fav?' favorite':'');card.dataset.molecule=id;
    const meta=d?('<div class="molMeta"><span>⭐ '+stars+'/3</span>'+(li!==undefined?'<span>🧪 '+(LANG==='tr'?'Bölüm ':'Level ')+(li+1)+'</span>':'')+(best?'<span>↔ '+best+' '+(LANG==='tr'?'hamle':'moves')+'</span>':'')+(time?'<span>⚡ '+time.toFixed(1)+'s</span>':'')+'</div>'):'<div class="molMeta lockedMeta">🔒 '+(LANG==='tr'?'Bölümü tamamlayarak keşfet':'Complete its level to discover')+'</div>';
    card.innerHTML='<button class="molFav" aria-label="favorite">'+(fav?'★':'☆')+'</button><canvas></canvas><div class="mn">'+(d?m.n:t('undiscoveredName'))+'</div><div class="mf">'+(d?m.f:t('undiscoveredName'))+'</div>'+meta+'<div class="mfact">'+(d?m.fa:t('undiscoveredFact'))+'</div>';
    g.appendChild(card);
    drawMol(card.querySelector('canvas'),m,!d);
    card.querySelector('.molFav').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();save.favoriteMolecules[id]=!save.favoriteMolecules[id];persist();buildCollection();SFX.click();},{passive:false});
  }
  $('#coCount').textContent=n+'/'+Object.keys(MOLS).length;
  const discEl=new Set();
  for(const id in save.disc)if(MOLS[id])MOLS[id].s.forEach(a=>discEl.add(a[0]));
  const eg=$('#elGrid');eg.innerHTML='';
  for(const sym in ELINFO){
    const info=ELINFO[sym],col=EL[sym],d=discEl.has(sym);
    const c=document.createElement('div');
    c.className='elCard card'+(d?'':' un');
    c.innerHTML='<div class="ez">'+info.z+'</div><div class="esym" style="background:'+(d?col.c:'#3a3564')+';color:'+(d?col.t:'#8a8fb8')+'">'+sym+'</div><div class="en">'+(d?info.n:t('undiscoveredName'))+'</div>';
    eg.appendChild(c);
  }
  const ag=$('#achvGrid');ag.innerHTML='';
  ACHV.forEach(a=>{
    const d=!!save.achv[a.id];
    const c=document.createElement('div');
    c.className='achvCard card'+(d?'':' un');
    c.innerHTML='<div class="aic">'+(d?a.icon:'❔')+'</div><div class="an">'+(d?t(a.name):'???')+'</div><div class="adesc">'+(d?t(a.desc):t('achvLocked'))+'</div>';
    ag.appendChild(c);
  });
  const dg=$('#diplomaGrid');dg.innerHTML='';
  const curTier=tierOf(save.cur);
  DIPLOMAS.forEach((dip,i)=>{
    const unlocked=curTier>=i;
    const c=document.createElement('div');
    c.className='diplomaCert'+(unlocked?'':' un');
    if(unlocked){c.style.setProperty('--dc1',dip.c1);c.style.setProperty('--dc2',dip.c2);}
    c.innerHTML=unlocked?(
      '<div class="dcSeal">'+dip.icon+'</div>'+
      '<div class="dcHead">'+t('diplomaCertHead')+'</div>'+
      '<div class="dcName">'+(save.playerName||t('welcomeDefaultName'))+'</div>'+
      '<div class="dcSub">'+t('diplomaCertSub')+'</div>'+
      '<div class="dcRank">'+t('rank'+i).replace(/^\S+\s/,'')+'</div>'+
      '<div class="dcRibbon">✓ '+t('diplomaEarned')+'</div>'
    ):(
      '<div class="dcSeal">🔒</div><div class="dcName" style="opacity:.5">???</div><div class="dcSub">'+t('diplomaLocked')+'</div>'
    );
    dg.appendChild(c);
  });
}

/* ================= EINSTEIN ================= */
const bub=$('#bubble');
const EIN={boxes:[],imgs:[],lids:[],wlids:[],tongues:[],props:[]};
['#einBoxG','#einBoxS','#tutEinBox'].forEach(sl=>{
  const b=$(sl);if(!b)return;
  EIN.boxes.push(b);
  EIN.imgs.push(b.querySelector('.einImg'));
  b.querySelectorAll('.lid').forEach(x=>EIN.lids.push(x));
  b.querySelectorAll('.eye2 .lid').forEach(x=>EIN.wlids.push(x));
  EIN.tongues.push(b.querySelector('.tongue'));
  EIN.props.push(b.querySelector('.prop'));
});

/* Responsive Dr. E face overlay geometry.
   Eye and tongue layers are normalized to the actually rendered Einstein image,
   not to the viewport or outer card. This prevents drift on small/large phones,
   browser bars, safe-area changes and orientation changes. */
const EIN_FACE_PARTS='.eye1,.eye2,.tongue';
const EIN_ANDROID_SAFE_STYLE_ID='mxEinsteinAndroidSafeStyle';
function installEinsteinResponsiveSafety(){
  if(document.getElementById(EIN_ANDROID_SAFE_STYLE_ID))return;
  const style=document.createElement('style');
  style.id=EIN_ANDROID_SAFE_STYLE_ID;
  style.textContent=`
    #einBoxG.mxEinResponsive,#einBoxS.mxEinResponsive,#tutEinBox.mxEinResponsive{
      position:relative!important;contain:layout style;overflow:visible;
      transform-origin:50% 100%;isolation:isolate;
    }
    #einBoxG.mxEinResponsive .einImg,#einBoxS.mxEinResponsive .einImg,#tutEinBox.mxEinResponsive .einImg{
      display:block!important;object-fit:contain!important;object-position:center center!important;
      max-width:100%!important;max-height:100%!important;width:auto;height:auto;
      aspect-ratio:auto!important;transform-origin:50% 50%;
    }
    #einBoxG.mxEinResponsive .eye1,#einBoxG.mxEinResponsive .eye2,#einBoxG.mxEinResponsive .tongue,
    #einBoxS.mxEinResponsive .eye1,#einBoxS.mxEinResponsive .eye2,#einBoxS.mxEinResponsive .tongue,
    #tutEinBox.mxEinResponsive .eye1,#tutEinBox.mxEinResponsive .eye2,#tutEinBox.mxEinResponsive .tongue{
      position:absolute!important;box-sizing:border-box;max-width:none!important;max-height:none!important;
      margin:0!important;right:auto!important;bottom:auto!important;
    }
    body.mxVerySmallScreen #einBoxG.mxEinResponsive{max-width:min(25vw,108px)!important;max-height:25vh!important;}
    body.mxVerySmallScreen #einBoxS.mxEinResponsive{max-width:min(46vw,190px)!important;max-height:38vh!important;}
    body.mxVerySmallScreen #tutEinBox.mxEinResponsive{max-width:min(42vw,170px)!important;max-height:32vh!important;}
    body.mxTallNarrowScreen #einBoxG.mxEinResponsive{max-width:min(28vw,126px)!important;}
    body.mxLowHeightScreen #einBoxS.mxEinResponsive,body.mxLowHeightScreen #tutEinBox.mxEinResponsive{max-height:31vh!important;}
  `;
  (document.head||document.documentElement).appendChild(style);
}
function updateEinsteinViewportProfile(){
  if(!document.body)return;
  const vv=window.visualViewport;
  const vw=Math.max(1,Math.round(vv&&vv.width||innerWidth||document.documentElement.clientWidth||360));
  const vh=Math.max(1,Math.round(vv&&vv.height||innerHeight||document.documentElement.clientHeight||640));
  const shortSide=Math.min(vw,vh),ratio=Math.max(vw,vh)/shortSide;
  document.body.classList.toggle('mxVerySmallScreen',shortSide<350);
  document.body.classList.toggle('mxTallNarrowScreen',ratio>2.05);
  document.body.classList.toggle('mxLowHeightScreen',vh<560);
  EIN.boxes.forEach(b=>b&&b.classList.add('mxEinResponsive'));
}
installEinsteinResponsiveSafety();
updateEinsteinViewportProfile();
function einRenderedImageRect(img){
  const r=img.getBoundingClientRect();
  let x=r.left,y=r.top,w=r.width,h=r.height;
  try{
    const nw=img.naturalWidth||0,nh=img.naturalHeight||0;
    const fit=getComputedStyle(img).objectFit;
    if(nw>0&&nh>0&&w>0&&h>0&&(fit==='contain'||fit==='scale-down')){
      const scale=Math.min(w/nw,h/nh);
      const cw=nw*scale,ch=nh*scale;
      x+=Math.max(0,(w-cw)/2);y+=Math.max(0,(h-ch)/2);w=cw;h=ch;
    }
  }catch(_){ }
  return {left:x,top:y,width:w,height:h};
}
function captureEinFaceRatios(box,img){
  if(!box||!img)return;
  const ir=einRenderedImageRect(img);
  if(ir.width<20||ir.height<20)return;
  box.querySelectorAll(EIN_FACE_PARTS).forEach(part=>{
    if(part.dataset.einFaceCaptured==='1')return;
    const pr=part.getBoundingClientRect();
    const vals=[
      (pr.left-ir.left)/ir.width,
      (pr.top-ir.top)/ir.height,
      pr.width/ir.width,
      pr.height/ir.height
    ];
    if(vals.every(Number.isFinite)&&vals[0]>-0.25&&vals[0]<1.25&&vals[1]>-0.25&&vals[1]<1.25&&vals[2]>0&&vals[2]<0.5&&vals[3]>0&&vals[3]<0.5){
      part.dataset.einFaceX=String(vals[0]);
      part.dataset.einFaceY=String(vals[1]);
      part.dataset.einFaceW=String(vals[2]);
      part.dataset.einFaceH=String(vals[3]);
      part.dataset.einFaceCaptured='1';
    }
  });
}
function syncEinsteinFaceGeometry(forceCapture){
  updateEinsteinViewportProfile();
  EIN.boxes.forEach((box,i)=>{
    const img=EIN.imgs[i];if(!box||!img)return;
    box.style.position=box.style.position||'relative';
    // Never stretch Dr. E: preserve the source image aspect ratio on every screen.
    img.style.objectFit='contain';
    img.style.objectPosition='center center';
    img.style.maxWidth='100%';
    img.style.height='auto';
    if(forceCapture)box.querySelectorAll(EIN_FACE_PARTS).forEach(p=>delete p.dataset.einFaceCaptured);
    captureEinFaceRatios(box,img);
    const ir=einRenderedImageRect(img),br=box.getBoundingClientRect();
    if(ir.width<20||ir.height<20)return;
    box.querySelectorAll(EIN_FACE_PARTS).forEach(part=>{
      if(part.dataset.einFaceCaptured!=='1')return;
      const x=Number(part.dataset.einFaceX),y=Number(part.dataset.einFaceY);
      const w=Number(part.dataset.einFaceW),h=Number(part.dataset.einFaceH);
      if(![x,y,w,h].every(Number.isFinite))return;
      part.style.left=(ir.left-br.left+x*ir.width)+'px';
      part.style.top=(ir.top-br.top+y*ir.height)+'px';
      part.style.width=Math.max(1,w*ir.width)+'px';
      part.style.height=Math.max(1,h*ir.height)+'px';
      part.style.transformOrigin='50% 50%';
    });
  });
}
let einFaceSyncRaf=0,einFaceSyncCapture=false;
function scheduleEinsteinFaceSync(forceCapture){
  einFaceSyncCapture=einFaceSyncCapture||!!forceCapture;
  if(einFaceSyncRaf)return;
  einFaceSyncRaf=requestAnimationFrame(()=>{
    einFaceSyncRaf=requestAnimationFrame(()=>{
      const capture=einFaceSyncCapture;
      einFaceSyncCapture=false;
      einFaceSyncRaf=0;
      try{syncEinsteinFaceGeometry(capture);}catch(err){console.warn('[Einstein face sync]',err);}
    });
  });
}
EIN.imgs.forEach(img=>{
  if(!img)return;
  if(img.complete)scheduleEinsteinFaceSync(false);
  else img.addEventListener('load',()=>scheduleEinsteinFaceSync(true),{once:true});
});
if(typeof ResizeObserver!=='undefined'){
  const einFaceRO=new ResizeObserver(entries=>{if(entries.some(e=>e.contentRect&&e.contentRect.width>20&&e.contentRect.height>20))scheduleEinsteinFaceSync(false);});
  EIN.boxes.forEach(b=>b&&einFaceRO.observe(b));
  EIN.imgs.forEach(i=>i&&einFaceRO.observe(i));
}
window.addEventListener('resize',()=>scheduleEinsteinFaceSync(false),{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(()=>scheduleEinsteinFaceSync(false),180),{passive:true});
if(window.visualViewport){
  visualViewport.addEventListener('resize',()=>scheduleEinsteinFaceSync(false),{passive:true});
}
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(()=>scheduleEinsteinFaceSync(false)).catch(()=>{});}
if(typeof MutationObserver!=='undefined'){
  const einVisibilityObserver=new MutationObserver(muts=>{
    if(muts.some(m=>m.type==='attributes'&&(m.attributeName==='class'||m.attributeName==='style')))scheduleEinsteinFaceSync(false);
  });
  EIN.boxes.forEach(b=>b&&einVisibilityObserver.observe(b,{attributes:true,attributeFilter:['class','style']}));
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleEinsteinFaceSync(false);},{passive:true});
window.addEventListener('pageshow',()=>scheduleEinsteinFaceSync(false),{passive:true});

const MOODS=[];
let exc=false,einMoodT=null;

/* V8.5.46 Dr. E flow correction
   - Main-menu Dr. E remains the approved original einstein.webp.
   - Alternate assets are restricted to the active game screen.
   - Every supplied PNG uses the approved 468x520 canvas and faces the board.
   - Priority/hold locks stop rapid pose changes during overlapping messages. */
const DR_E_POSES=Object.freeze({
  idle:'assets/images/einstein.webp',
  thinking:'assets/images/dr-e-poses/thinking.png',
  celebrate:'assets/images/dr-e-poses/celebrate.png',
  clap:'assets/images/dr-e-poses/clap.png',
  surprised:'assets/images/dr-e-poses/surprised.png',
  confused:'assets/images/dr-e-poses/confused.png',
  victory:'assets/images/dr-e-poses/victory.png',
  medal:'assets/images/dr-e-poses/medal.png',
  experiment:'assets/images/dr-e-poses/experiment.png',
  clipboard:'assets/images/dr-e-poses/clipboard.png',
  magnifier:'assets/images/dr-e-poses/magnifier.png',
  molecule:'assets/images/dr-e-poses/molecule.png'
});
const drEPreloads=new Map();
Object.entries(DR_E_POSES).forEach(([name,src])=>{
  const img=new Image();img.decoding='async';img.src=src;drEPreloads.set(name,img);
});
const drEGameBox=$('#einBoxG');
const drEGameImg=drEGameBox&&drEGameBox.querySelector('.einImg');
const DR_E_POSE_PRIORITY=Object.freeze({idle:0,clipboard:3,thinking:4,experiment:4,magnifier:4,molecule:5,surprised:5,confused:5,clap:6,celebrate:7,victory:8,medal:9});
let drEPoseTimer=0,drECurrentPose='idle',drEPoseSeq=0,drEPoseLockedUntil=0,drECurrentPriority=0;
function drEGameActive(){return !!(scr.game&&scr.game.classList.contains('on'));}
function resetDrEPose(){
  clearTimeout(drEPoseTimer);drEPoseTimer=0;drEPoseSeq++;
  drECurrentPose='idle';drECurrentPriority=0;drEPoseLockedUntil=0;
  if(drEGameBox&&drEGameImg){
    drEGameBox.classList.remove('mxPoseAsset');
    drEGameImg.classList.remove('mxPoseChanging');
    drEGameImg.setAttribute('src',DR_E_POSES.idle);
    drEGameImg.setAttribute('data-dr-e-pose','idle');
  }
}
function setDrEPose(name,duration,priority,force=false){
  const pose=DR_E_POSES[name]?name:'idle';
  if(pose!=='idle'&&!drEGameActive())return false;
  const now=Date.now();
  const nextPriority=Number.isFinite(Number(priority))?Number(priority):(DR_E_POSE_PRIORITY[pose]||0);
  if(!force&&pose!=='idle'&&drECurrentPose!=='idle'&&pose!==drECurrentPose&&now<drEPoseLockedUntil&&nextPriority<=drECurrentPriority)return false;
  clearTimeout(drEPoseTimer);
  const seq=++drEPoseSeq,src=DR_E_POSES[pose];
  const apply=()=>{
    if(seq!==drEPoseSeq||!drEGameImg||!drEGameBox)return;
    drEGameImg.setAttribute('src',src);
    drEGameImg.setAttribute('data-dr-e-pose',pose);
    drEGameBox.classList.toggle('mxPoseAsset',pose!=='idle');
    requestAnimationFrame(()=>drEGameImg.classList.remove('mxPoseChanging'));
  };
  drECurrentPose=pose;drECurrentPriority=nextPriority;
  if(drEGameImg&&drEGameBox){
    if(drEGameImg.getAttribute('src')!==src){
      drEGameImg.classList.add('mxPoseChanging');
      const preload=drEPreloads.get(pose);
      if(preload&&preload.complete)setTimeout(apply,150);
      else if(preload){preload.addEventListener('load',()=>setTimeout(apply,80),{once:true});setTimeout(apply,650);}
      else setTimeout(apply,150);
    }else{
      drEGameBox.classList.toggle('mxPoseAsset',pose!=='idle');
      drEGameImg.classList.remove('mxPoseChanging');
    }
  }
  if(pose==='idle'){drEPoseLockedUntil=0;return true;}
  const hold=Math.max(3600,Number(duration)||4600);
  drEPoseLockedUntil=now+Math.max(3000,hold-350);
  drEPoseTimer=setTimeout(()=>setDrEPose('idle',0,99,true),hold);
  return true;
}
function einBase(){EIN.boxes.forEach(b=>b&&b.classList.remove('talk','happy','sad','excited','shake','celebrate','dance','tiltL','tiltR','nod','hop','spinCel','enter','laugh','wag'));}
function einMood(mood,dur){
  einBase();
  if(!drEGameActive())return;
  const m=String(mood||'talk');
  if(m==='happy'||m==='laugh')setDrEPose('clap',Math.max(4400,Number(dur)||0),6);
  else if(m==='excited'||m==='celebrate')setDrEPose('celebrate',Math.max(5600,Number(dur)||0),7);
  else if(m==='sad')setDrEPose('surprised',Math.max(4800,Number(dur)||0),5);
  else if(m==='wag')setDrEPose('confused',Math.max(5000,Number(dur)||0),5);
  else if(m==='enter')setDrEPose('clipboard',Math.max(4600,Number(dur)||0),3);
  else if(m==='nod')setDrEPose('molecule',Math.max(4300,Number(dur)||0),5);
  else if(m==='hint'||m==='think')setDrEPose('thinking',Math.max(6000,Number(dur)||0),4);
  // Ordinary speech deliberately keeps the current artwork; no slideshow.
}
function blink(){
  if(sleeping)return;
  EIN.lids.forEach(l=>l.classList.add('on'));
  setTimeout(()=>EIN.lids.forEach(l=>l.classList.remove('on')),92);
}
function look(){ /* Static single-frame Einstein: no fake head/body movement. */ }
function lidHalf(v){EIN.lids.forEach(l=>l.classList.toggle('half',v));}
function wink(){if(sleeping)return;EIN.wlids.forEach(l=>l.classList.add('on'));setTimeout(()=>{if(!sleeping)EIN.wlids.forEach(l=>l.classList.remove('on'));},300);}
let tongueT=null;
function tongue(){
  clearTimeout(tongueT);
  EIN.tongues.forEach(t=>t&&t.classList.add('out'));
  tongueT=setTimeout(()=>EIN.tongues.forEach(t=>t&&t.classList.remove('out')),1100);
}
function showSmallToast(message,dur){
  let el=document.getElementById('mxSmallToast');
  if(!el){
    el=document.createElement('div');
    el.id='mxSmallToast';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    document.body.appendChild(el);
  }
  clearTimeout(showSmallToast._timer);
  el.textContent=String(message||'').trim();
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  showSmallToast._timer=setTimeout(()=>el.classList.remove('on'),dur||2200);
}
function mxPropIconSvg(value){
  const text=String(value||'');
  const paths={
    bulb:'<path d="M12 3a6 6 0 0 0-3.7 10.7c.8.7 1.2 1.5 1.3 2.3h4.8c.1-.8.5-1.6 1.3-2.3A6 6 0 0 0 12 3Z"/><path d="M9.7 19h4.6M10.4 22h3.2"/>',
    tube:'<path d="M9 3h6M10 3v7l-4.2 7.3A2.5 2.5 0 0 0 8 21h8a2.5 2.5 0 0 0 2.2-3.7L14 10V3"/><path d="M8.2 16h7.6"/>',
    atom:'<ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8"/>',
    flask:'<path d="M9 3h6M10 3v6l-5 8.2A2.5 2.5 0 0 0 7.2 21h9.6a2.5 2.5 0 0 0 2.2-3.8L14 9V3"/><path d="M7.4 16h9.2"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.4 15.4 5 5"/><path d="M8 10.5h5M10.5 8v5"/>',
    coffee:'<path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2M8 3c-1 1-.2 2 0 3M12 3c-1 1-.2 2 0 3"/>',
    alert:'<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17.5v.2"/>',
    sleep:'<path d="M5 7h6l-6 7h6M13 4h5l-5 6h5"/>',
    wave:'<path d="M8 12V5a1.4 1.4 0 0 1 2.8 0v5-7a1.4 1.4 0 0 1 2.8 0v7-5a1.4 1.4 0 0 1 2.8 0v6-3a1.4 1.4 0 0 1 2.8 0v5.5A7.5 7.5 0 0 1 11.7 21H10a6 6 0 0 1-4.5-2L2.8 16a1.5 1.5 0 0 1 2.1-2.1L8 16"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    facepalm:'<circle cx="12" cy="9" r="5"/><path d="M5 21c.8-4 3.2-6 7-6s6.2 2 7 6M4 9l5 3M3 6l3 1M5 3l2 2"/>',
    radiation:'<circle cx="12" cy="12" r="2"/><path d="M12 10V3a9 9 0 0 1 7.8 4.5l-6 3.5M10.3 13l-6 3.5A9 9 0 0 1 4.2 7.5l6 3.5M13.7 13l6 3.5A9 9 0 0 1 12 21v-7"/>',
    bolt:'<path d="m13 2-8 12h6l-1 8 9-13h-6V2Z"/>',
    graduate:'<path d="m2 8 10-5 10 5-10 5L2 8Z"/><path d="M6 10v5c3 2 9 2 12 0v-5M22 8v7"/>',
    sparkle:'<path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/>',
    rocket:'<path d="M14 4c3-2 5-2 6-2 0 1 0 3-2 6l-5 5-4-4 5-5Z"/><path d="m9 9-4 1-2 3 5 1M13 13l-1 4-3 2-1-5M6 18l-3 3"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16.5 9"/>'
  };
  let key='';
  if(text.includes('💡'))key='bulb'; else if(text.includes('🧪'))key='tube'; else if(text.includes('⚛'))key='atom'; else if(text.includes('⚗'))key='flask'; else if(text.includes('🔍'))key='search'; else if(text.includes('☕'))key='coffee'; else if(text.includes('❗'))key='alert'; else if(text.includes('💤'))key='sleep'; else if(text.includes('👋'))key='wave'; else if(text.includes('🏆'))key='trophy'; else if(text.includes('🔒'))key='lock'; else if(text.includes('🧭'))key='compass'; else if(text.includes('🤦'))key='facepalm'; else if(text.includes('☢'))key='radiation'; else if(text.includes('⚡'))key='bolt'; else if(text.includes('🎓'))key='graduate'; else if(text.includes('✨'))key='sparkle'; else if(text.includes('🚀'))key='rocket'; else if(text.includes('✅'))key='check';
  if(!key)return '';
  return '<span class="mxEinIcon mxEinIcon-'+key+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[key]+'</svg></span>';
}
function prop(e,dur){
  EIN.props.forEach(p=>{
    const gameProp=p.closest('#einBoxG');
    let shown=String(e||'').trim();
    p.classList.remove('mxBondProp','mxDiscoveryProp','mxPremiumProp');
    if(['🪙','🥈','🏅','🎖️'].some(symbol=>shown.includes(symbol))){
      p.textContent='';
      p.classList.add('mxDiscoveryProp');
    }else if(shown==='__mxBond__'){
      p.textContent='';
      p.classList.add('mxBondProp');
      p.innerHTML='<span class="mxMiniBond" aria-hidden="true"><i class="mxMiniAtom mxMiniAtomA"></i><i class="mxMiniAtom mxMiniAtomB"></i><i class="mxMiniCore"></i><i class="mxMiniOrbit"><b></b></i></span>';
    }else{
      const premiumIcon=mxPropIconSvg(shown);
      if(premiumIcon){
        p.textContent='';p.classList.add('mxPremiumProp');p.innerHTML=premiumIcon;
      }else{
        if(gameProp&&!/^[A-Za-z][A-Za-z0-9₀-₉+\-]{0,6}$/.test(shown))shown='';
        p.textContent=shown;
      }
    }
    p.classList.add('on');
  });
  clearTimeout(prop._timer);
  prop._timer=setTimeout(()=>EIN.props.forEach(p=>p.classList.remove('on','mxBondProp','mxDiscoveryProp','mxPremiumProp')),dur||1800);
}
function setExcited(on){exc=on;look(0,0);einBase();}
function einAuraPulse(cls,dur){
  EIN.boxes.forEach(box=>{if(box)box.classList.add(cls);});
  setTimeout(()=>EIN.boxes.forEach(box=>{if(box)box.classList.remove(cls);}),dur);
}
function einCelebrate(stars){
  const finale=(typeof NOBEL_LEVEL_INDEX!=='undefined'&&lv===NOBEL_LEVEL_INDEX);
  setDrEPose(finale?'medal':(Number(stars)>=3?'victory':'clap'),finale?8200:(Number(stars)>=3?7200:6000),finale?9:(Number(stars)>=3?8:6),true);
  blink();
  setTimeout(tongue,180);
  // Moleculox signature reaction: two tiny atoms bond while one electron
  // completes a fast orbit above Dr. E. It appears only on a solved molecule.
  setTimeout(()=>prop('__mxBond__',1550),90);
  const gl=$('#glow');if(gl){gl.classList.remove('on');void gl.offsetWidth;gl.classList.add('on');}
}

(function blinkLoop(){setTimeout(()=>{if(!document.hidden&&!sleeping){blink();if(Math.random()<0.18)setTimeout(blink,230);}blinkLoop();},2200+Math.random()*3200);})();
// Menu Dr. E: no fake head/body poses from a single image.
// Keep only true overlay reactions (blink, tongue and occasional thought icon).
(function menuEinsteinLoop(){
  setTimeout(()=>{
    const splash=$('#splash');
    if(!document.hidden&&!sleeping&&splash&&splash.classList.contains('active')){
      const r=Math.random();
      if(r<0.38)blink();
      else if(r<0.68)tongue();
      else prop(rnd(['💡','🧪','⚛️']),1100);
    }
    menuEinsteinLoop();
  },8000+Math.random()*6000);
})();
const splashEin=$('#einBoxS');
if(splashEin){
  let splashEinTapAt=0;
  const reactSplashEinstein=e=>{
    // The main-menu Einstein stays mounted while other screens are visible.
    // Never let its hidden tap handler react during gameplay.
    const splash=$('#splash');
    if(!splash||!splash.classList.contains('on'))return;
    const now=Date.now();
    if(now-splashEinTapAt<350)return;
    splashEinTapAt=now;
    if(e&&e.cancelable)e.preventDefault();
    SFX.click();
    // Main-menu Einstein: tap/click always shows tongue + blink.
    tongue();blink();
  };
  // Pointer events cover modern mobile browsers; click is a reliable fallback
  // for itch.io/iOS embedded pages where pointerdown may be swallowed.
  splashEin.addEventListener('pointerdown',reactSplashEinstein,{passive:false});
  splashEin.addEventListener('click',reactSplashEinstein,{passive:false});
  splashEin.setAttribute('role','button');
  splashEin.setAttribute('aria-label','Dr. E tongue reaction');
}
// 2026-07-28: removed the in-game Dr. E tap reaction entirely. Whatever the
// exact overlap with the board turns out to be, this listener was the thing
// stealing atom taps near it — the safest fix is to make sure nothing on
// #einBoxG can ever intercept a pointerdown during actual gameplay, rather
// than continuing to fine-tune sizing/position to try to dodge the board.
// The main-menu reaction (#einBoxS) is untouched — there's no board there.
const gameEin=$('#einBoxG');
if(gameEin){gameEin.style.pointerEvents='none';}
(function microLoop(){setTimeout(()=>{
  if(!document.hidden&&!$('#modal').classList.contains('on')&&!exc&&!sleeping){
    const r=Math.random();
    if(r<0.42)blink();
    else if(r<0.67)tongue();
    else if(r<0.84)wink();
    else prop(rnd(['☕','🧪','⚗️','🔍','⚛️']),1500);
  }
  microLoop();
},4500+Math.random()*5500);})();
let sayT=null;
function closeSayBubble(){
  clearTimeout(sayT);
  bub.classList.remove('on','shk','glow','long');
}
function sayDuration(txt,requested){
  const plain=String(txt||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const words=plain?plain.split(' ').length:0;
  // Comfortable mobile reading pace: about 175 words/minute plus reaction time.
  const calculated=2100+words*340+Math.max(0,plain.length-70)*18;
  return Math.max(Number(requested)||0,Math.min(10000,Math.max(3800,calculated)));
}
function say(txt,mood,dur,fx){
  const bubbleText=$('#bubbleText');
  if(bubbleText)bubbleText.innerHTML=txt;else bub.innerHTML=txt;
  const readMs=sayDuration(txt,dur);
  bub.classList.remove('on','shk','glow','long');
  if(fx)bub.classList.add(fx);
  if(String(txt||'').replace(/<[^>]*>/g,'').length>96)bub.classList.add('long');
  bub.style.setProperty('--bubble-duration',readMs+'ms');
  bub.setAttribute('aria-label',String(txt||'').replace(/<[^>]*>/g,' ')+(LANG==='tr'?' — kapatmak için dokun':' — tap to dismiss'));
  void bub.offsetWidth;bub.classList.add('on');
  einMood(mood||'talk',Math.min(readMs,2200));
  clearTimeout(sayT);
  sayT=setTimeout(closeSayBubble,readMs);
}
if(bub){
  const dismiss=e=>{if(!bub.classList.contains('on'))return;if(e&&e.cancelable)e.preventDefault();closeSayBubble();};
  bub.addEventListener('pointerdown',dismiss,{passive:false});
  bub.addEventListener('click',dismiss,{passive:false});
}

function showVictoryLabFx(mode){
  const wrap=$('#victoryLabFx'),particles=$('#victoryLabParticles');if(!wrap||!particles)return;
  clearTimeout(showVictoryLabFx.t);
  wrap.classList.remove('on','mini');particles.innerHTML='';
  const mini=mode==='mini';if(mini)wrap.classList.add('mini');
  const count=effectsAllowed()?(mini?16:34):0;
  const colors=['#4fd8ff','#9d7bff','#ffd76a','#ffffff','#58e6a9','#ff6f91'];
  for(let i=0;i<count;i++){
    const p=document.createElement('i');p.className='vlfParticle';
    const ang=(-160+Math.random()*140)*Math.PI/180,dist=(mini?70:130)+Math.random()*(mini?95:230);
    p.style.setProperty('--x',(Math.cos(ang)*dist)+'px');p.style.setProperty('--y',(Math.sin(ang)*dist+80+Math.random()*110)+'px');
    p.style.setProperty('--w',(3+Math.random()*5)+'px');p.style.setProperty('--h',(6+Math.random()*8)+'px');
    p.style.setProperty('--r',(Math.random()*180)+'deg');p.style.setProperty('--c',colors[i%colors.length]);
    p.style.setProperty('--d',(mini?1.35+Math.random()*.45:1.8+Math.random()*.7)+'s');p.style.setProperty('--delay',(Math.random()*.35)+'s');
    particles.appendChild(p);
  }
  void wrap.offsetWidth;wrap.classList.add('on');
  showVictoryLabFx.t=setTimeout(()=>{wrap.classList.remove('on','mini');particles.innerHTML='';},mini?1750:2350);
}

/* Main-menu Dr. E conversation. Text is inserted with textContent so player
   nicknames can never inject markup. The bubble sits below the menu controls. */
const splashBubble=$('#splashBubble'),splashBubbleText=$('#splashBubbleText');
let splashTalkTimer=0,splashTalkGapTimer=0,splashTalkIndex=0,splashTalkSignature='';
function splashPlayerName(){
  const member=typeof accountState!=='undefined'&&!accountState.isAnonymous;
  if(!member)return ml("Misafir","Guest","Gast","Invitado","Convidado","ゲスト");
  const emailName=accountState&&accountState.email?String(accountState.email).split('@')[0]:'';
  const raw=save&&save.playerName||curProfile||accountState&&accountState.displayName||emailName||'';
  const clean=String(raw||'').trim().replace(/\s+/g,' ').slice(0,18);
  return clean||(LANG==='tr'?'Profesör':'Professor');
}
function splashTalkMessages(){
  const tr=LANG==='tr',name=splashPlayerName(),dailyNew=save.dailyDate!==utcDayId();
  const pending=typeof nextBonusMission==='function'?nextBonusMission():null;
  const completed=Math.max(0,Math.min(LEVELS.length,Number(save.cur)||0));
  const member=typeof accountState!=='undefined'&&!accountState.isAnonymous;
  const rows=[];
  if(tr){
    rows.push(name+', hoş geldin! Bugün nereden başlamak istersin?');
    if(dailyNew)rows.push('Günün Deneyi yenilendi, '+name+'. Laboratuvar seni bekliyor!');
    if(pending)rows.push(name+', '+pending.milestone+'. bölüm bonus görevin hazır. Ödülü laboratuvarda bıraktım.');
    if(completed>=LEVELS.length)rows.push(name+', artık Nobel adayısın. 301. final deneyi tamamlayarak ödülü kazan!');
    else if(completed>=140)rows.push(name+', Nobel adaylığına çok yaklaştın. Son deneyler en zorları olacak.');
    else if(completed>0)rows.push('Sıradaki hedefimiz '+Math.min(LEVELS.length,completed+1)+'. bölüm. Hadi Profesör, başlayalım!');
    rows.push('Bugün çok işimiz var. Atomlar yine laboratuvarın her yerine dağılmış.');
    rows.push('Bir atomu yanlış yere kaydırmak hata değil; deneysel bir karardır.');
    rows.push('Kahve hazır. Moleküller için aynı şeyi söyleyemem.');
    const monthLaureate=currentMonthlyLaureate();if(monthLaureate)rows.push((monthLaureate.playerName||'Bir araştırmacı')+' bu ay Nobel adayları arasında lider. '+name+', onu yakalayabilir misin?');
    if(nobelIntel.week&&nobelIntel.week[0])rows.push((nobelIntel.week[0].playerName||'Bir araştırmacı')+' haftanın en hızlı yükselen bilim insanı. Zirve ısınıyor!');
    const myMonth=currentMonthlyCandidateRank(),myWorld=nobelRankIn(nobelIntel.world);
    if(myMonth>1&&myMonth<=10)rows.push(name+', bu ay Nobel sıralamasında '+myMonth+'. sıradasın. Birkaç kusursuz deney daha gerekli!');
    else if(myMonth===1)rows.push(name+', bu ay Nobel ödülü senin elinde. Diğer adaylar peşinde!');
    else if(myWorld>1&&myWorld<=10)rows.push(name+', dünya sıralamasında ilk 10’dasın. Lider dikkatli olmalı!');
    if(member)rows.push(name+', bulut kaydın bağlı. Dünya sıralamasını güncel tutuyorum.');
    else rows.push(name+', ilerlemeni korumak için profil ikonundan hesabını bağlamayı unutma.');
  }else{
    rows.push('Welcome, '+name+'! Where would you like to begin today?');
    if(dailyNew)rows.push('Today’s Experiment has been renewed, '+name+'. The lab is waiting!');
    if(pending)rows.push(name+', your Level '+pending.milestone+' bonus mission is ready. I left the reward in the lab.');
    if(completed>=LEVELS.length)rows.push(name+', you are now a Nobel Candidate. Complete the 301st final experiment to win the prize!');
    else if(completed>=140)rows.push(name+', Nobel candidacy is close. The final experiments will be the hardest.');
    else if(completed>0)rows.push('Our next target is Level '+Math.min(LEVELS.length,completed+1)+'. Let’s begin, Professor!');
    rows.push('We have a busy day. The atoms are scattered across the lab again.');
    rows.push('Moving an atom to the wrong place is not a mistake; it is an experimental decision.');
    rows.push('The coffee is ready. I cannot say the same for the molecules.');
    const monthLaureate=currentMonthlyLaureate();if(monthLaureate)rows.push((monthLaureate.playerName||'A researcher')+' leads this month among Nobel Candidates. '+name+', can you catch them?');
    if(nobelIntel.week&&nobelIntel.week[0])rows.push((nobelIntel.week[0].playerName||'A researcher')+' is this week’s fastest-rising scientist. The race is heating up!');
    const myMonth=currentMonthlyCandidateRank(),myWorld=nobelRankIn(nobelIntel.world);
    if(myMonth>1&&myMonth<=10)rows.push(name+', you are #'+myMonth+' in this month’s Nobel race. A few perfect experiments could change everything!');
    else if(myMonth===1)rows.push(name+', you currently hold this month’s Nobel prize. The other candidates are chasing you!');
    else if(myWorld>1&&myWorld<=10)rows.push(name+', you are in the World Top 10. The leader should be worried!');
    if(member)rows.push(name+', your cloud save is connected. I am keeping the World Ranking current.');
    else rows.push(name+', remember to connect an account from the profile icon to protect your progress.');
  }
  return rows.filter(Boolean);
}
function stopSplashConversation(){
  clearTimeout(splashTalkTimer);clearTimeout(splashTalkGapTimer);
  if(splashBubble)splashBubble.classList.remove('on');
}
function startSplashConversation(reset=false,delay=180){
  if(!splashBubble||!splashBubbleText)return;
  clearTimeout(splashTalkTimer);clearTimeout(splashTalkGapTimer);
  if(!scr.splash.classList.contains('on')){splashBubble.classList.remove('on');return;}
  const rows=splashTalkMessages();if(!rows.length)return;
  const sig=LANG+'|'+splashPlayerName()+'|'+save.dailyDate+'|'+(save.cur||0)+'|'+(accountState.isAnonymous?'g':'m')+'|'+(nextBonusMission()?nextBonusMission().milestone:0)+'|'+((currentMonthlyLaureate()&&currentMonthlyLaureate().playerName)||'');
  if(reset||sig!==splashTalkSignature){splashTalkIndex=0;splashTalkSignature=sig;}
  splashTalkGapTimer=setTimeout(()=>{
    if(!scr.splash.classList.contains('on'))return;
    splashBubbleText.textContent=rows[splashTalkIndex%rows.length];
    splashBubble.classList.add('on');
    einMood(splashTalkIndex%3===0?'happy':'talk',2100);
    splashTalkTimer=setTimeout(()=>{
      splashBubble.classList.remove('on');
      splashTalkIndex=(splashTalkIndex+1)%rows.length;
      splashTalkGapTimer=setTimeout(()=>startSplashConversation(false,0),1150);
    },5600);
  },Math.max(0,Number(delay)||0));
}
let idleT=null,idleN=0,sleeping=false,zzT=null,autoHintT=null;
function wake(){
  idleN=0;
  if(!sleeping)return;
  sleeping=false;clearInterval(zzT);
  EIN.lids.forEach(l=>l.classList.remove('on'));
  look(0,-0.4,600,0.6);prop('❗',700);
}
function goSleep(){
  sleeping=true;
  EIN.lids.forEach(l=>l.classList.add('on'));
  prop('💤',3000);
  zzT=setInterval(()=>{if(sleeping)prop('💤',2600);},4200);
  say(t('sleeping'),'sad',3600);
}
function schedIdle(){
  clearTimeout(idleT);
  idleT=setTimeout(()=>{
    if(scr.game.classList.contains('on')&&!won&&!$('#modal').classList.contains('on')){
      idleN++;
      if(idleN>=2){if(!sleeping)goSleep();}
      else{
        say(rnd(LN.idle),'talk',3500,Math.random()<0.5?'shk':null);
      }
      schedIdle();
    }
  },22000+Math.random()*9000);
}
function resetIdle(){wake();schedIdle();}

/* ================= GAME STATE ================= */
const board=$('#board'),bctx=board.getContext('2d');
let lv=-1,LV=null,mid='',curMol=null,grid=[],atoms=[],sel=0,selT0=0,moves=0,t2=0,hist=[],levelStartT=0;
let breakableWalls=new Map(),hammerMode=false,hammerPending=null,precisionMode=false,precisionPending=null,precisionExecuting=false,barrierMode=false,barrierUsed=false,assistanceUsed=false,temporaryBarriers=new Map(),portalPairs=new Map(),oneWayTiles=new Map(),movingWalls=[],pressureSystems=[];
let movingWallAnimating=false,fragileFailure=false,linkedPairs=[],linkedMate=new Map();
const HAMMER_LEVELS=new Set([14,29,74]);
// Fixed 2026-07-27 (second pass): index 44 (level 45) also removed here and
// from ONE_WAY_LEVELS below. Same root cause as level 60 — HAMMER_LEVELS and
// ONE_WAY_LEVELS both hardcode every multiple of 15 (30/45/60/75), so those
// four levels were always going to get a fallback breakable wall AND a
// fallback one-way tile stacked at once. 30 and 75 tolerate the combination
// fine; 45 and 60 do not. BFS-confirmed: with both fallback mechanics gone,
// level 45's original certified 8-move solution is already perfectly valid —
// the level and its par were never the problem, only this stacked mechanic.
// Fixed 2026-07-27: index 59 (level 60) removed above and from ONE_WAY_LEVELS below.
// It collided with level 60's own explicit sticky-atom design: level 60 was
// getting BOTH a fallback breakable wall AND a fallback one-way tile stacked
// on top of its sticky mechanic, which made it unsolvable (BFS-confirmed).
// Removing both fallback mechanics for this one index restores the level to
// its solvable, correctly-paced design (verified: exact par, 10 moves).
const PORTAL_LAYOUTS={
  24:[[1,1],[6,2]],39:[[3,1],[1,5]],54:[[1,1],[6,2]],84:[[1,1],[4,4]]
  // Fixed 2026-07-27: index 69 (level 70) removed. This level has no other
  // special mechanic; the fallback portal pair made an otherwise-solvable
  // BF3 board (verified solvable in exactly 10 moves without it) unsolvable,
  // because the certified route lands an atom on the portal tile mid-route
  // and gets redirected off the intended path. Level 70 was never designed
  // around a portal, so the fallback simply should not apply to it.
};
// Fixed 2026-07-29: index 74 (level 75) removed. Isolated via BFS: the fallback
// breakable wall alone is harmless here (never on the certified path), but the
// fallback one-way tile blocks the certified route outright. Level 75 was never
// designed around a one-way tile; HAMMER_LEVELS keeps 74 since that half is fine.
const ONE_WAY_LEVELS=new Set([29,89]);
// Fixed 2026-07-29: indices 34 and 64 (levels 35 and 65) removed. BFS-confirmed:
// both levels' certified solutions are already valid once the fallback moving
// wall is gone; neither level was designed around a moving wall. 49/79/94
// (levels 50/80/95) tolerate the fallback fine and are left untouched.
const MOVING_WALL_LEVELS=new Set([49,79,94]);
const PRESSURE_DOOR_LEVELS=new Set([38,53,68,83,98]);
const FRAGILE_ATOM_LEVELS=new Set([42,57,72,87,102]);
// Fixed 2026-07-29: emptied. Full-audit BFS replay showed EVERY one of this
// set's five levels (47, 62, 77, 92, 107) had a certified solution that only
// works with normal independent atom movement — the fallback linked-pair
// mechanic silently dragged a second atom along on every move, sending the
// board into a different (unsolvable-by-the-recorded-route) state. None of
// these five levels was ever designed around linked movement, so the fallback
// is disabled entirely rather than picking individual survivors. The five
// levels that DO use linked movement by design (167, 170, 176, 180, 298) are
// unaffected — they declare it explicitly via level.linked, not this fallback.
const LINKED_ATOM_LEVELS=new Set([]);

function deriveLinkedPairs(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  const raw=Array.isArray(level.linked)?level.linked:(LINKED_ATOM_LEVELS.has(index)?[[0,1]]:[]);
  const used=new Set(),out=[];
  for(const pair of raw){
    const a=Number(pair&&pair[0]),b=Number(pair&&pair[1]);
    if(!Number.isInteger(a)||!Number.isInteger(b)||a===b||a<0||b<0||a>=(level.a||[]).length||b>=(level.a||[]).length||used.has(a)||used.has(b))continue;
    const aa=level.a[a],bb=level.a[b];
    if(!aa||!bb||aa[3]||aa[4]||aa[5]||aa[6]||bb[3]||bb[4]||bb[5]||bb[6])continue;
    used.add(a);used.add(b);out.push([a,b]);
  }
  return out;
}
function applyLinkedAtoms(level,index,mode){
  linkedPairs=deriveLinkedPairs(level,index,mode);linkedMate=new Map();
  atoms.forEach(a=>{a.linked=false;a.linkId='';});
  linkedPairs.forEach((pair,n)=>{const[a,b]=pair;linkedMate.set(a,b);linkedMate.set(b,a);atoms[a].linked=atoms[b].linked=true;atoms[a].linkId=atoms[b].linkId='L'+n;});
}
function linkedMovePlan(i,d){
  const j=linkedMate.get(i);if(j===undefined)return null;
  const [dx,dy]=DIRS[d],base=atoms.map(a=>({x:a.x,y:a.y}));
  const p={i:{x:base[i].x,y:base[i].y},j:{x:base[j].x,y:base[j].y}};
  let ai=true,aj=true;
  for(let guard=0;guard<32&&(ai||aj);guard++){
    const ni={x:p.i.x+dx,y:p.i.y+dy},nj={x:p.j.x+dx,y:p.j.y+dy};
    const staticBlocked=(who,nx,ny)=>grid[ny]?.[nx]!==false||base.some((a,k)=>k!==i&&k!==j&&a.x===nx&&a.y===ny)||!oneWayAllows(who.x,who.y,nx,ny,d);
    let canI=ai&&!staticBlocked(p.i,ni.x,ni.y),canJ=aj&&!staticBlocked(p.j,nj.x,nj.y);
    if(canI&&canJ&&ni.x===nj.x&&ni.y===nj.y){canI=canJ=false;}
    if(canI&&ni.x===p.j.x&&ni.y===p.j.y&&!canJ)canI=false;
    if(canJ&&nj.x===p.i.x&&nj.y===p.i.y&&!canI)canJ=false;
    if(canI)p.i=ni;else ai=false;
    if(canJ)p.j=nj;else aj=false;
  }
  const movedI=p.i.x!==base[i].x||p.i.y!==base[i].y,movedJ=p.j.x!==base[j].x||p.j.y!==base[j].y;
  return(movedI||movedJ)?{j,main:p.i,mate:p.j}:null;
}
function deriveFragileAtomIndexes(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  if(Array.isArray(level.fragile))return level.fragile.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<(level.a||[]).length);
  if(!FRAGILE_ATOM_LEVELS.has(index))return [];
  const counts=new Map();for(const step of (level.fs||[])){const ai=+step[0];counts.set(ai,(counts.get(ai)||0)+1);}
  const candidates=(level.a||[]).map((a,i)=>({i,count:counts.get(i)||0,special:!!a[3]||!!a[4]||!!a[5]||!!a[6]})).filter(v=>!v.special&&v.count>0&&v.count<=2);
  candidates.sort((a,b)=>b.count-a.count||a.i-b.i);
  return candidates.length?[candidates[0].i]:[];
}
function applyFragileAtoms(level,index,mode){
  const ids=new Set(deriveFragileAtomIndexes(level,index,mode));
  atoms.forEach((a,i)=>{a.fragile=ids.has(i);a.fragileHits=0;a.fragileMax=3;a.fragileBroken=false;});
}
function breakableKey(x,y){return x+','+y;}
function pressureKey(x,y){return x+','+y;}
function derivePressureSystems(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  if(Array.isArray(level.pd)&&level.pd.length){
    return level.pd.map((v,n)=>({id:'P'+n,plate:{x:+v[0][0],y:+v[0][1]},door:{x:+v[1][0],y:+v[1][1]},open:false}));
  }
  if(!PRESSURE_DOOR_LEVELS.has(index))return [];
  const starts=(level.a||[]).map(a=>({x:+a[0],y:+a[1]}));
  const occupied=new Set(starts.map(a=>pressureKey(a.x,a.y)));
  const plate=starts.find(a=>a.x>0&&a.y>0&&a.y<level.g.length-1&&a.x<level.g[a.y].length-1);
  if(!plate)return [];
  const dirs=[[1,0],[0,1],[-1,0],[0,-1]];
  const candidates=[];
  for(let y=1;y<level.g.length-1;y++)for(let x=1;x<level.g[y].length-1;x++){
    if(level.g[y][x]!=='1'||occupied.has(pressureKey(x,y)))continue;
    let floorAdj=0;for(const [dx,dy] of dirs)if(level.g[y+dy]?.[x+dx]==='0')floorAdj++;
    if(floorAdj>=2)candidates.push({x,y,score:Math.abs(x-plate.x)+Math.abs(y-plate.y)});
  }
  candidates.sort((a,b)=>a.score-b.score);
  const door=candidates[0];if(!door)return [];
  return [{id:'P0',plate,door,open:false}];
}
function pressureOccupied(sys){return atoms.some(a=>a.x===sys.plate.x&&a.y===sys.plate.y);}
function pressureSystemLabel(sys){const n=Math.max(0,pressureSystems.indexOf(sys));return String.fromCharCode(65+(n%26));}
function updatePressureDoors(withFx=true){
  for(const sys of pressureSystems){
    const occupied=pressureOccupied(sys);
    const atomInDoor=atoms.some(a=>a.x===sys.door.x&&a.y===sys.door.y);
    const nextOpen=occupied||atomInDoor;
    if(sys.open!==nextOpen&&withFx){
      const r=board.getBoundingClientRect(),cx=r.left+(sys.door.x+.5)*T,cy=r.top+(sys.door.y+.5)*T;
      if(effectsAllowed())for(let q=0;q<10;q++)P({k:'glit',x:cx,y:cy,vx:(Math.random()-.5)*1.7,vy:(Math.random()-.5)*1.7,r:1.6+Math.random()*1.8,c:nextOpen?'#76ffb8':'#ffcf72',life:.55,d:q*.012});
      SFX.thunk&&SFX.thunk();mxHaptic('light');
    }
    sys.open=nextOpen;
    if(grid[sys.door.y])grid[sys.door.y][sys.door.x]=!nextOpen;
  }
}
function drawPressurePlate(sys,t){
  const x=(sys.plate.x+.5)*T,y=(sys.plate.y+.5)*T,on=pressureOccupied(sys),pulse=.65+.22*Math.sin(t/230+sys.plate.x);
  bctx.save();bctx.translate(x,y);bctx.globalAlpha=.9;
  bctx.fillStyle=on?'rgba(92,255,172,.34)':'rgba(255,205,96,.22)';bctx.shadowColor=on?'#68ffb2':'#ffd36e';bctx.shadowBlur=on?14:7+4*pulse;
  bctx.beginPath();bctx.arc(0,0,T*.3,0,Math.PI*2);bctx.fill();
  bctx.lineWidth=Math.max(2,T*.045);bctx.strokeStyle=on?'#d9ffea':'#ffe7a8';bctx.beginPath();bctx.arc(0,0,T*.22,0,Math.PI*2);bctx.stroke();
  bctx.fillStyle=on?'#eafff2':'#fff1bf';bctx.font='900 '+Math.round(T*.25)+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText(on?'✓':'●',0,1);
  bctx.font='900 '+Math.max(8,Math.round(T*.18))+'px system-ui';bctx.fillStyle=on?'#d9ffea':'#5a3b00';bctx.fillText(pressureSystemLabel(sys),T*.23,-T*.22);bctx.restore();
}
function drawPressureDoor(sys,t){
  const px=sys.door.x*T,py=sys.door.y*T,pulse=.65+.2*Math.sin(t/210+sys.door.y);
  bctx.save();
  if(sys.open){
    bctx.globalAlpha=.42;bctx.strokeStyle='#72ffb5';bctx.lineWidth=Math.max(2,T*.04);bctx.setLineDash([T*.12,T*.08]);rrect(bctx,px+T*.12,py+T*.12,T*.76,T*.76,Math.max(4,T*.1));bctx.stroke();bctx.setLineDash([]);
    bctx.globalAlpha=.9;bctx.fillStyle='#d9ffea';bctx.font='900 '+Math.max(10,Math.round(T*.25))+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText('↔',px+T*.5,py+T*.52);
  }else{
    bctx.shadowColor='#ffbf5c';bctx.shadowBlur=8+5*pulse;drawStone(px,py,sys.door.x,sys.door.y);
    bctx.globalAlpha=.92;bctx.strokeStyle='#ffe0a0';bctx.lineWidth=Math.max(2,T*.04);for(let k=1;k<=3;k++){bctx.beginPath();bctx.moveTo(px+T*(.22*k),py+T*.18);bctx.lineTo(px+T*(.22*k),py+T*.82);bctx.stroke();}
  }
  bctx.globalAlpha=.96;bctx.fillStyle=sys.open?'#d9ffea':'#4b2f00';bctx.font='900 '+Math.max(8,Math.round(T*.18))+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText(pressureSystemLabel(sys),px+T*.76,py+T*.24);
  bctx.restore();
}
function movingWallSnapshot(){return movingWalls.map(w=>({x:w.x,y:w.y,index:w.index}));}
function restoreMovingWalls(state){
  if(!Array.isArray(state))return;
  for(const w of movingWalls){if(grid[w.y])grid[w.y][w.x]=false;}
  state.forEach((st,i)=>{const w=movingWalls[i];if(!w)return;w.x=+st.x;w.y=+st.y;w.index=+st.index||0;w.anim=null;if(grid[w.y])grid[w.y][w.x]=true;});
  movingWallAnimating=false;
}
function deriveMovingWalls(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  if(Array.isArray(level.mw)&&level.mw.length){
    return level.mw.map(v=>({path:v.map(c=>({x:+c[0],y:+c[1]})),index:0})).filter(w=>w.path.length>1);
  }
  if(!MOVING_WALL_LEVELS.has(index))return [];
  const atomsSet=new Set((level.a||[]).map(a=>a[0]+','+a[1]));
  const portalSet=new Set((PORTAL_LAYOUTS[index]||[]).map(a=>a[0]+','+a[1]));
  const dirs=[[1,0],[0,1],[-1,0],[0,-1]];
  const candidates=[];
  for(let y=2;y<level.g.length-2;y++)for(let x=2;x<level.g[y].length-2;x++){
    if(level.g[y][x]!=='1')continue;
    for(const [dx,dy] of dirs){const tx=x+dx,ty=y+dy,k=tx+','+ty;if(level.g[ty]?.[tx]==='0'&&!atomsSet.has(k)&&!portalSet.has(k)){candidates.push({path:[{x,y},{x:tx,y:ty}],index:0,score:Math.abs(x-3.5)+Math.abs(y-4.5)});break;}}
  }
  candidates.sort((a,b)=>a.score-b.score);
  return candidates.slice(0,1);
}
function drawMovingWall(w,t){
  let x=w.x,y=w.y;
  if(w.anim){const q=Math.max(0,Math.min(1,(t-w.anim.t0)/w.anim.dur)),e=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;x=w.anim.fx+(w.anim.tx-w.anim.fx)*e;y=w.anim.fy+(w.anim.ty-w.anim.fy)*e;}
  const px=x*T,py=y*T,pulse=.65+.2*Math.sin(t/190+x+y);
  bctx.save();bctx.shadowColor='#ffcf67';bctx.shadowBlur=8+6*pulse;drawStone(px,py,Math.round(x),Math.round(y));
  bctx.globalAlpha=.85;bctx.strokeStyle='#ffd36e';bctx.lineWidth=Math.max(2,T*.045);bctx.setLineDash([T*.12,T*.08]);rrect(bctx,px+T*.12,py+T*.12,T*.76,T*.76,Math.max(4,T*.1));bctx.stroke();bctx.setLineDash([]);
  bctx.globalAlpha=.95;bctx.fillStyle='#fff2b5';bctx.font='900 '+Math.max(11,Math.round(T*.28))+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText('↔',px+T*.5,py+T*.52);bctx.restore();
}
function advanceMovingWalls(){
  if(!movingWalls.length||won||movingWallAnimating)return;
  const plans=[];
  for(const w of movingWalls){
    const ni=(w.index+1)%w.path.length,to=w.path[ni];
    if(!to||atoms.some(a=>a.x===to.x&&a.y===to.y))continue;
    if(grid[to.y]?.[to.x]&&!(to.x===w.x&&to.y===w.y))continue;
    plans.push({w,ni,to,from:{x:w.x,y:w.y}});
  }
  if(!plans.length)return;
  movingWallAnimating=true;
  for(const p of plans){grid[p.from.y][p.from.x]=false;grid[p.to.y][p.to.x]=true;p.w.anim={fx:p.from.x,fy:p.from.y,tx:p.to.x,ty:p.to.y,t0:performance.now(),dur:motionReduced()?120:360};}
  SFX.thunk&&SFX.thunk();mxHaptic('light');
  setTimeout(()=>{for(const p of plans){p.w.x=p.to.x;p.w.y=p.to.y;p.w.index=p.ni;p.w.anim=null;}movingWallAnimating=false;},motionReduced()?130:375);
}
function portalKey(x,y){return x+','+y;}
function oneWayKey(x,y){return x+','+y;}
function deriveOneWayTiles(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  if(Array.isArray(level.ow)&&level.ow.length)return level.ow.map(v=>({x:+v[0],y:+v[1],d:Math.max(0,Math.min(3,+v[2]||0))}));
  if(!ONE_WAY_LEVELS.has(index))return [];
  const atomCells=new Set((level.a||[]).map(a=>a[0]+','+a[1]));
  const candidates=[];
  for(let y=2;y<level.g.length-2;y++)for(let x=2;x<level.g[y].length-2;x++){
    if(level.g[y][x]!=='0'||atomCells.has(x+','+y))continue;
    for(let d=0;d<4;d++){const [dx,dy]=DIRS[d];if(level.g[y-dy]?.[x-dx]==='0'&&level.g[y+dy]?.[x+dx]==='0'){candidates.push({x,y,d});break;}}
  }
  candidates.sort((a,b)=>(Math.abs(a.x-3.5)+Math.abs(a.y-4.5))-(Math.abs(b.x-3.5)+Math.abs(b.y-4.5)));
  const out=[];for(const c of candidates){if(out.every(o=>Math.abs(o.x-c.x)+Math.abs(o.y-c.y)>=3))out.push(c);if(out.length>=2)break;}
  return out;
}
function oneWayAllows(fromX,fromY,toX,toY,d){
  const from=oneWayTiles.get(oneWayKey(fromX,fromY)),to=oneWayTiles.get(oneWayKey(toX,toY));
  if(from&&from.d!==d)return false;
  if(to&&to.d!==d)return false;
  return true;
}
function drawOneWayTile(o,t){
  const cx=(o.x+.5)*T,cy=(o.y+.5)*T,pulse=.72+.18*Math.sin(t/260+o.x+o.y);
  bctx.save();bctx.translate(cx,cy);bctx.rotate(o.d*Math.PI/2);
  bctx.globalAlpha=.3+.16*pulse;bctx.fillStyle='#58d8ff';bctx.shadowColor='#70eaff';bctx.shadowBlur=10;
  rrect(bctx,-T*.36,-T*.36,T*.72,T*.72,Math.max(5,T*.12));bctx.fill();
  bctx.globalAlpha=.9;bctx.fillStyle='#eaffff';bctx.beginPath();bctx.moveTo(0,-T*.25);bctx.lineTo(T*.2,T*.02);bctx.lineTo(T*.08,T*.02);bctx.lineTo(T*.08,T*.25);bctx.lineTo(-T*.08,T*.25);bctx.lineTo(-T*.08,T*.02);bctx.lineTo(-T*.2,T*.02);bctx.closePath();bctx.fill();
  bctx.restore();
}
function derivePortals(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  const raw=Array.isArray(level.pt)&&level.pt.length===2?level.pt:PORTAL_LAYOUTS[index];
  if(!raw||raw.length!==2)return [];
  const a={x:+raw[0][0],y:+raw[0][1],id:'A'},b={x:+raw[1][0],y:+raw[1][1],id:'B'};
  return [{...a,toX:b.x,toY:b.y},{...b,toX:a.x,toY:a.y}];
}
function portalDestination(x,y,movedIdx){
  const p=portalPairs.get(portalKey(x,y));if(!p)return null;
  if(grid[p.toY]&&grid[p.toY][p.toX])return null;
  if(atoms.some((a,k)=>k!==movedIdx&&a.x===p.toX&&a.y===p.toY))return null;
  return{x:p.toX,y:p.toY,id:p.id};
}
function drawPortalTile(p,t){
  const cx=(p.x+.5)*T,cy=(p.y+.5)*T,pulse=.88+.12*Math.sin(t/240+(p.id==='A'?0:Math.PI));
  bctx.save();bctx.translate(cx,cy);bctx.rotate(t/(p.id==='A'?950:-950));
  bctx.globalAlpha=.88;bctx.shadowColor=p.id==='A'?'#62e9ff':'#c58cff';bctx.shadowBlur=16;
  bctx.strokeStyle=p.id==='A'?'#7cf3ff':'#d6a4ff';bctx.lineWidth=Math.max(2,T*.07);
  bctx.setLineDash([T*.16,T*.1]);bctx.beginPath();bctx.ellipse(0,0,T*.31*pulse,T*.22*pulse,0,0,Math.PI*2);bctx.stroke();
  bctx.setLineDash([]);bctx.globalAlpha=.42;bctx.fillStyle=p.id==='A'?'#43d8ff':'#ae62ff';bctx.beginPath();bctx.ellipse(0,0,T*.22,T*.14,0,0,Math.PI*2);bctx.fill();
  bctx.rotate(-t/(p.id==='A'?950:-950));bctx.globalAlpha=.96;bctx.fillStyle='#f6fdff';bctx.font='900 '+Math.max(10,Math.round(T*.24))+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText(p.id,0,1);
  bctx.restore();
}
function portalBurst(x,y,id){
  if(!effectsAllowed())return;const br=board.getBoundingClientRect(),cx=br.left+(x+.5)*T,cy=br.top+(y+.5)*T,cols=id==='A'?['#eaffff','#55e4ff','#8cf4ff']:['#fff1ff','#c580ff','#e2b5ff'];
  for(let q=0;q<18;q++){const a=q/18*Math.PI*2,sp=.8+Math.random()*1.5;P({k:'glit',x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:1.5+Math.random()*2,c:rnd(cols),life:.65,d:q*.008});}
}

function deriveBreakableWalls(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return [];
  if(Array.isArray(level.bw)&&level.bw.length)return level.bw.map(v=>({x:+v[0],y:+v[1]}));
  if(!HAMMER_LEVELS.has(index))return [];
  const candidates=[];
  for(let y=1;y<level.g.length-1;y++)for(let x=1;x<level.g[y].length-1;x++)if(level.g[y][x]==='1')candidates.push({x,y,d:Math.abs(x-3.5)+Math.abs(y-4.5)});
  candidates.sort((a,b)=>a.d-b.d);
  if(!candidates.length)return [];
  // Several cracked walls create a real tactical choice. The game never marks
  // the correct wall: every cracked wall is breakable, including a bad choice.
  const picked=[];
  for(const c of candidates){
    if(!picked.length||picked.every(p=>Math.abs(p.x-c.x)+Math.abs(p.y-c.y)>=3))picked.push(c);
    if(picked.length>=3)break;
  }
  return picked.length>=2?picked:candidates.slice(0,Math.min(3,candidates.length));
}
function syncHammerUi(){
  const b=document.querySelector('#btnHammer');if(!b)return;
  const usable=breakableWalls.size>0&&!won&&!tutorialActive&&!duelMode&&!dailyMode&&!chainMode&&!reactorMode;
  b.hidden=!usable;b.classList.toggle('on',usable&&hammerMode);b.classList.toggle('empty',boosterCount('hammer')<1);
  const c=b.querySelector('.hammerCount');if(c)c.textContent=boosterCount('hammer');
  setTimeout(gameFeelToolState,0);
}
function cancelHammer(){hammerMode=false;hammerPending=null;syncHammerUi();}
function syncPrecisionUi(){
  const b=document.querySelector('#btnPrecision');if(!b)return;
  const usable=!won&&!tutorialActive&&!duelMode&&!dailyMode&&!chainMode&&!reactorMode;
  b.hidden=!usable;b.classList.toggle('on',usable&&precisionMode);b.classList.toggle('empty',boosterCount('precision')<1);
  const label=b.querySelector('small');if(label)label.textContent=LANG==='tr'?'1 KARE':'1 SQUARE';
  const c=b.querySelector('.precisionCount');if(c)c.textContent=boosterCount('precision');
  setTimeout(gameFeelToolState,0);
}
function cancelPrecision(){precisionMode=false;precisionPending=null;syncPrecisionUi();}
function barrierKey(x,y){return x+','+y;}
function syncBarrierUi(){
  const b=document.querySelector('#btnBarrier');if(!b)return;
  const usable=!won&&!tutorialActive&&!duelMode&&!dailyMode&&!chainMode&&!reactorMode&&!barrierUsed;
  b.hidden=!usable;b.classList.toggle('on',usable&&barrierMode);b.classList.toggle('empty',boosterCount('barrier')<1);
  const label=b.querySelector('small');if(label)label.textContent=LANG==='tr'?'BARİYER':'BARRIER';
  const c=b.querySelector('.barrierCount');if(c)c.textContent=boosterCount('barrier');
  setTimeout(gameFeelToolState,0);
}
function cancelBarrier(){barrierMode=false;syncBarrierUi();}
function barrierCellAvailable(x,y){
  return x>0&&y>0&&x<W-1&&y<H-1&&grid[y]&&!grid[y][x]&&!atoms.some(a=>a.x===x&&a.y===y)&&!portalPairs.has(portalKey(x,y))&&!oneWayTiles.has(oneWayKey(x,y))&&!temporaryBarriers.has(barrierKey(x,y));
}
function attemptBarrierAt(x,y){
  if(!barrierMode||won||barrierUsed)return;
  if(!barrierCellAvailable(x,y)){SFX.thunk();mxHaptic('error');say(LANG==='tr'?'Bariyer yalnızca boş ve normal bir kareye konabilir.':'The barrier can only be placed on an empty normal tile.','sad',2500,'shk');return;}
  if(boosterCount('barrier')<1){cancelBarrier();say(LANG==='tr'?'Nano Bariyer kalmadı. Laboratuvardan satın alabilirsin.':'No Nano Barriers left. Buy one in the Lab.','sad',2800,'shk');return;}
  openModal('<h3>🧱 '+(LANG==='tr'?'NANO BARİYER':'NANO BARRIER')+'</h3><div class="msub">'+(LANG==='tr'?'Bu kareye geçici blok yerleştirilsin mi? Bölümde yalnızca bir kez kullanılabilir ve ilk atom çarpışmasında kırılır.<br><b>Destek kullanımı:</b> Bölüm, yıldız ve ödüller korunur; bu deneme en iyi hamle ve süre rekoruna yazılmaz.':'Place a temporary block on this tile? It can be used once per level and breaks on the first atom collision.<br><b>Assisted run:</b> Level progress, stars, and rewards are kept; this attempt does not set a best-move or speed record.')+'</div><div class="mrow"><button class="btn amber" id="mBarrierYes">'+(LANG==='tr'?'YERLEŞTİR':'PLACE')+'</button><button class="btn ghost" id="mBarrierNo">'+t('cancel')+'</button></div>');
  bindTap('#mBarrierYes',()=>{
    if(!barrierCellAvailable(x,y)||!spendBooster('barrier',1)){closeModal();cancelBarrier();return;}
    temporaryBarriers.set(barrierKey(x,y),{x,y});barrierUsed=true;assistanceUsed=true;barrierMode=false;closeModal();syncBarrierUi();SFX.thunk();mxHaptic('medium');gameFeelBarrierConstruct(x,y);
    say(LANG==='tr'?'Nano Bariyer yerleştirildi. İlk çarpışmada kırılacak.':'Nano Barrier placed. It will break on the first collision.','happy',2800,'glow');
  });
  bindTap('#mBarrierNo',()=>{closeModal();cancelBarrier();});
}
function precisionDest(i,d){
  if(i<0||!atoms[i])return null;
  const [dx,dy]=DIRS[d],x=atoms[i].x+dx,y=atoms[i].y+dy;
  if(!grid[y]||grid[y][x]||atoms.some((a,k)=>k!==i&&a.x===x&&a.y===y)||!oneWayAllows(atoms[i].x,atoms[i].y,x,y,d))return null;
  return{x,y};
}
function attemptPrecisionMove(i,d){
  if(anim||won||i<0||secureAttemptPending)return;
  if(atoms[i].frozen){SFX.thunk();mxHaptic('error');say(rnd(LN.frozen),'sad',2600,'shk');return;}
  const dest=precisionDest(i,d);
  if(!dest){SFX.thunk();mxHaptic('error');say(LANG==='tr'?'O yöndeki ilk kare boş değil. Tek Kare Hareket harcanmadı.':'The first square in that direction is blocked. One-Square Move was not spent.','sad',2400,'shk');return;}
  if(boosterCount('precision')<1){cancelPrecision();say(LANG==='tr'?'Tek Kare Hareket kalmadı. Laboratuvardan satın alabilirsin.':'No One-Square Moves left. Buy one in the Lab.','sad',3000,'shk');return;}
  precisionPending={i,d,dest};
  openModal('<h3>↔️ '+(LANG==='tr'?'TEK KARE HAREKET':'ONE-SQUARE MOVE')+'</h3><div class="msub">'+(LANG==='tr'?'Seçili atom bu yönde yalnızca 1 kare taşınsın mı? 1 güçlendirici harcanır ve Geri Alma iade etmez.<br><b>Destek kullanımı:</b> Bölüm, yıldız ve ödüller korunur; bu deneme en iyi hamle ve süre rekoruna yazılmaz.':'Move the selected atom exactly 1 square in this direction? This spends 1 booster and Undo will not refund it.<br><b>Assisted run:</b> Level progress, stars, and rewards are kept; this attempt does not set a best-move or speed record.')+'</div><div class="mrow"><button class="btn amber" id="mPrecisionYes">'+(LANG==='tr'?'HAREKET ET':'MOVE')+'</button><button class="btn ghost" id="mPrecisionNo">'+t('cancel')+'</button></div>');
  bindTap('#mPrecisionYes',()=>{
    const q=precisionPending;if(!q||!precisionDest(q.i,q.d)){closeModal();cancelPrecision();return;}
    if(!spendBooster('precision',1)){closeModal();cancelPrecision();return;}
    assistanceUsed=true;
    closeModal();precisionMode=false;precisionPending=null;syncPrecisionUi();gameFeelPrecisionPulse(q.i);precisionExecuting=true;move(q.i,q.d);precisionExecuting=false;
    say(LANG==='tr'?'Atom yalnızca 1 kare taşındı.':'Atom moved exactly 1 square.','happy',2200,'glow');
  });
  bindTap('#mPrecisionNo',()=>{closeModal();cancelPrecision();});
}
function boardCellAt(clientX,clientY){const r=board.getBoundingClientRect();return{x:Math.floor((clientX-r.left)/(r.width/W)),y:Math.floor((clientY-r.top)/(r.height/H))};}
function attemptHammerAt(x,y){
  const w=breakableWalls.get(breakableKey(x,y));
  if(!w||w.broken){say(LANG==='tr'?'Yalnız çatlak duvarlar kırılabilir.':'Only cracked walls can be broken.','sad',2200,'shk');mxHaptic('light');return;}
  if(boosterCount('hammer')<1){cancelHammer();say(LANG==='tr'?'Çekiç kalmadı. Laboratuvardan satın alabilirsin.':'No hammers left. Buy one in the Lab.','sad',3000,'shk');return;}
  hammerPending=w;
  openModal('<h3>🔨 '+(LANG==='tr'?'ÇATLAK DUVAR':'CRACKED WALL')+'</h3><div class="msub">'+(LANG==='tr'?'Bu çatlak duvarı kırmak istediğine emin misin? Yanlış duvar bölümü zorlaştırabilir. 1 Çekiç harcanır ve geri verilmez.<br><b>Destek kullanımı:</b> Bölüm, yıldız ve ödüller korunur; bu deneme en iyi hamle ve süre rekoruna yazılmaz.':'Break this cracked wall? A wrong wall can make the level harder. This spends 1 Hammer and it will not be refunded.<br><b>Assisted run:</b> Level progress, stars, and rewards are kept; this attempt does not set a best-move or speed record.')+'</div><div class="mrow"><button class="btn amber" id="mHammerYes">'+(LANG==='tr'?'KIR':'BREAK')+'</button><button class="btn ghost" id="mHammerNo">'+t('cancel')+'</button></div>');
  bindTap('#mHammerYes',()=>{
    const target=hammerPending;if(!target||target.broken){closeModal();cancelHammer();return;}
    if(!spendBooster('hammer',1)){closeModal();cancelHammer();return;}
    assistanceUsed=true;
    target.broken=true;grid[target.y][target.x]=false;closeModal();cancelHammer();mxHaptic('heavy');shake=motionReduced()?0:Math.max(shake,.30);
    gameFeelToolFx('hammer',target.x,target.y);wallBreakDustFx(target.x,target.y);
    say(LANG==='tr'?'Duvar kırıldı. Seçimin artık bölümün bir parçası!':'Wall broken. Your choice is now part of the level!','happy',2600,'glow');
  });
  bindTap('#mHammerNo',()=>{closeModal();cancelHammer();});
}
let moveLog=[],currentAttemptId=null,secureAttemptPending=false,secureAttemptRequest=0,secureAttemptNoticeAt=0;
let tutorialActive=false,tutorialStep=-1,tutorialGuideDir=null,tutorialWaitTap=null;
let dailyMode=false;
let duelMode=false,duelState=null,duelTimerText='';
let onlineDuelMode=false,onlineDuelSession=null,quickMatchSearch=null;
let crystalMode=false,crystals=[],currentCrystalLayout=null,currentCrystalPool=null,crystalGoalWarned=false;
let chainMode=false,currentChainPool=null,currentChainPlan=null,chainPlan=[],chainPathKeys=[],chainCurrentStep=0,chainMaxCombo=1,chainReactions=0,chainAutoMoves=0,chainCurrentCombo=1,chainAutoActive=false,chainAutoExecuting=false,chainAutoQueue=[];
let reactorMode=false,currentReactorPool=null,currentReactorPlan=null,reactorGates=[],reactorHits=0,reactorPenalty=0,reactorLastHitAt=0;
function reactorImpactLabel(upper=false){
  const label=ml('Darbe','Impact','Treffer','Impacto','Impacto','衝突');
  return upper&&typeof label.toLocaleUpperCase==='function'?label.toLocaleUpperCase(contentLang(LANG)):label;
}
function reactorImpactResultLabel(){return ml('Lazer Darbesi','Laser Impacts','Lasertreffer','Impactos de láser','Impactos de laser','レーザー衝突');}

let campaignFeature='';
function crystalActive(){return crystalMode||campaignFeature==='crystal';}
function chainActive(){return chainMode||campaignFeature==='chain';}
function reactorActive(){return reactorMode||campaignFeature==='reactor';}
function campaignFeatureIcon(mode){return mode==='crystal'?'🧪':(mode==='chain'?'⚡':(mode==='reactor'?'☢️':''));}
function campaignFeatureName(mode){return mode?bonusModeName(mode):'';}
let bonusMission=null,bonusVisualTier=0;
const BONUS_MILESTONES=Array.from({length:15},(_,i)=>(i+1)*10);
const BONUS_REWARD_COINS=50, BONUS_REWARD_RP=100;
const DUEL_TIME_LIMIT=90;
const DUEL_MAX_ROUNDS=3;
const CRYSTAL_TIME_LIMIT=90;
const CHAIN_TIME_LIMIT=90;
const REACTOR_TIME_LIMIT=90;
const REACTOR_GATE_COUNT=3;
const CRYSTAL_COUNT=3;
const LAB_COMPONENTS=[
  {id:'catalyst',icon:'🧪',tr:'Katalizör',en:'Catalyst',colors:['#ffd07a','#ff8c42','#fff3c4']},
  {id:'energy',icon:'⚡',tr:'Enerji Hücresi',en:'Energy Cell',colors:['#8eeaff','#2a9cff','#e9fbff']},
  {id:'stabilizer',icon:'⚛️',tr:'Stabilizatör',en:'Stabilizer',colors:['#91f2b4','#32bd78','#e8fff0']}
];
function labComponentSpec(type,index=0){return LAB_COMPONENTS.find(x=>x.id===type)||LAB_COMPONENTS[index%LAB_COMPONENTS.length];}
function labComponentTrainingToken(type){const spec=labComponentSpec(type);return '<span class="mxTrainingToken '+spec.id+'" aria-label="'+(LANG==='tr'?spec.tr:spec.en)+'">'+(spec.id==='stabilizer'?'<i></i>':'')+'</span>'; }
function labComponentHud(items=crystals){
  const list=(items&&items.length)?items:LAB_COMPONENTS.map(x=>({type:x.id,collected:false}));
  return list.map((c,i)=>labComponentSpec(c.type,i).icon+(c.collected?'✓':'○')).join(' ');
}
let attemptHintCount=0;
let won=false,winT=0,hintStep=0,hintMark=null,bumpN=0,slowSaid=false,newSpeedRecord=null,lastPerformance=null,stuckAtomIdx=-1,stuckAtomCount=0,strugglingSaid=false;
let anim=null,bounce=null,nudge=null,shake=0;
let T=42,dpr=1,tut=0;

let currentDailyLevel=null,currentDailyId='';
function bonusModeName(mode){
  const tr=LANG==='tr';
  if(mode==='crystal')return tr?'Katalizör Avı':'Catalyst Hunt';
  if(mode==='chain')return tr?'Zincir Reaksiyon':'Chain Reaction';
  return tr?'Reaktör Kaçışı':'Reactor Escape';
}
function bonusModeIcon(mode){return mode==='crystal'?'🧪':(mode==='chain'?'⚡':'☢️');}
function bonusModeForMilestone(milestone){return ['crystal','chain','reactor'][Math.max(0,Math.floor(milestone/10)-1)%3];}
function bonusModeLabel(mode){return mode==='crystal'?(LANG==='tr'?'KATALİZÖR AVI':'CATALYST HUNT'):(mode==='chain'?(ml("ZİNCİR REAKSİYON","CHAIN REACTION","KETTENREAKTION","REACCIÓN EN CADENA","REAÇÃO EM CADEIA","連鎖反応")):(LANG==='tr'?'REAKTÖR KAÇIŞI':'REACTOR ESCAPE'));}
function bonusModeDesc(mode){return mode==='crystal'?(LANG==='tr'?'Katalizör, enerji hücresi ve stabilizatörü topla':'Collect the catalyst, energy cell, and stabilizer'):(mode==='chain'?(LANG==='tr'?'Yüklü hamlelerle Combo x2 / x3 başlat':'Trigger Combo x2 / x3 with charged moves'):(LANG==='tr'?'Lazerler kapanınca geç, darbelerden kaçın':'Move while lasers are open and avoid hits'));}
function bonusModeVisualHtml(mode,compact){
  if(mode==='crystal')return '<span class="labVisual '+(compact?'compact':'')+' catalyst"><span class="tube"></span><span class="spark energy"></span><span class="core stabilizer"></span></span>';
  if(mode==='chain')return '<span class="labVisual '+(compact?'compact':'')+' chain"><span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span><span class="beam b1"></span><span class="beam b2"></span></span>';
  return '<span class="labVisual '+(compact?'compact':'')+' reactor"><span class="gate g1"></span><span class="beam r1"></span><span class="beam r2"></span><span class="gate g2"></span><span class="warn"></span></span>';
}
function bonusModeCardHtml(mode,id,extraCls){return '<button class="bonusModeCard '+mode+' '+(extraCls||'')+'" id="'+id+'"><div class="bonusModeVisual">'+bonusModeVisualHtml(mode,false)+'</div><b>'+bonusModeIcon(mode)+' '+bonusModeLabel(mode)+'</b><small>'+bonusModeDesc(mode)+'</small></button>';}
function duelSelectedBadgeHtml(mode){
  const icon=mode==='classic'?'⚛️':(mode==='crystal'?'🧪':(mode==='chain'?'⚡':(mode==='reactor'?'☢️':'🎲')));
  const label=mode==='classic'?(LANG==='tr'?'KLASİK MOLECULOX':'CLASSIC MOLECULOX'):(mode==='mixed'?(LANG==='tr'?'KARIŞIK':'MIXED'):bonusModeLabel(mode));
  return '<span class="bonusModeBadge duelSelected '+mode+'"><span class="duelPreviewIcon">'+icon+'</span><em>'+label+'</em></span>';
}
function bonusMedalCount(data=save){return Object.keys((data&&data.bonusClaims)||{}).filter(k=>data.bonusClaims[k]).length;}
function bonusVisualTierForCount(n){return n>=15?5:(n>=12?4:(n>=9?3:(n>=6?2:(n>=3?1:0))));}
function bonusRewardName(tier){
  const tr=LANG==='tr';
  return [
    '',
    tr?'Bronz Bilim İnsanı Çerçevesi':'Bronze Scientist Frame',
    tr?'Gümüş Laboratuvar Işığı':'Silver Laboratory Aura',
    tr?'Neon Atom Parıltısı':'Neon Atom Glow',
    tr?'Altın Bonus Lab İkonu':'Golden Bonus Lab Icon',
    tr?'Bonus Ustası Unvanı':'Bonus Master Title'
  ][tier]||'';
}
function applyBonusCosmetics(){
  bonusVisualTier=bonusVisualTierForCount(bonusMedalCount());
  const body=document.body;if(!body)return;
  for(let i=1;i<=5;i++)body.classList.toggle('bonusTier'+i,i<=bonusVisualTier);
  const sub=$('#logoSub');if(sub){
    const base=LANG==='tr'?'Atomları it · Molekülleri kur · Bilimi kurtar!':'Push atoms · Build molecules · Save science!';
    sub.textContent=base+(bonusVisualTier>=5?' · 🏅 '+(LANG==='tr'?'BONUS USTASI':'BONUS MASTER'):'');
  }
}
function updateBonusStatus(){
  const btn=$('#btnCrystalHunt');if(!btn)return;
  const medals=bonusMedalCount(),pending=unclaimedUnlockedBonusMissions().length;
  const span=btn.querySelector('span');if(span)span.textContent=medals+'/15';
  btn.classList.toggle('hasPending',pending>0);
  btn.title=(LANG==='tr'?'Bonus Lab · Madalya ':'Bonus Lab · Medals ')+medals+'/15'+(pending?(' · '+pending+' '+(LANG==='tr'?'görev hazır':'missions ready')):'');
}
function bonusMissionEligibleLevel(mode,target){
  target=Math.max(40,Math.min(LEVELS.length-1,Math.floor(target)));
  const ok=i=>mode==='crystal'?true:(mode==='chain'?isChainLevelEligible(i):isReactorLevelEligible(i));
  for(let radius=0;radius<=110;radius++){
    const up=target+radius,down=target-radius;
    if(up<LEVELS.length&&ok(up))return up;
    if(down>=40&&ok(down))return down;
  }
  return 40;
}
function bonusMissionForMilestone(milestone){
  milestone=Math.floor(Number(milestone)||0);
  if(!BONUS_MILESTONES.includes(milestone))return null;
  const mode=bonusModeForMilestone(milestone);
  const target=40+Math.round(((milestone-10)/140)*110);
  return {milestone,mode,level:bonusMissionEligibleLevel(mode,target)};
}
function isBonusUnlocked(milestone){return Math.max(0,Number(save.cur)||0)>=milestone;}
function isBonusClaimed(milestone){return !!(save.bonusClaims&&save.bonusClaims[String(milestone)]);}
function unclaimedUnlockedBonusMissions(){return BONUS_MILESTONES.filter(m=>isBonusUnlocked(m)&&!isBonusClaimed(m)).map(bonusMissionForMilestone);}
function nextBonusMission(){return unclaimedUnlockedBonusMissions()[0]||null;}
function bonusUnlockNoticeForLevel(levelNumber){
  if(!BONUS_MILESTONES.includes(levelNumber)||isBonusClaimed(levelNumber))return '';
  const m=bonusMissionForMilestone(levelNumber),tr=LANG==='tr';
  return '<div class="bonusUnlockNotice"><div class="bonusUnlockHero">'+bonusModeVisualHtml(m.mode,false)+'</div><b>🎁 '+(tr?'BONUS BÖLÜM AÇILDI!':'BONUS CHAPTER UNLOCKED!')+'</b><span>'+bonusModeIcon(m.mode)+' '+bonusModeName(m.mode)+' · '+(tr?'Ödül: 1 Madalya + 50 Coin + 100 RP':'Reward: 1 Medal + 50 Coins + 100 RP')+'</span></div>';
}
function bonusRewardPreviewHtml(){
  const n=bonusMedalCount(),next=[3,6,9,12,15].find(x=>x>n),tr=LANG==='tr';
  return '<div class="bonusProgress"><div><b>🏅 '+n+'/15</b><span>'+(tr?'Bonus Madalyası':'Bonus Medals')+'</span></div>'+
    (next?'<div><b>'+next+'</b><span>'+bonusRewardName(bonusVisualTierForCount(next))+'</span></div>':'<div><b>✓</b><span>'+(tr?'Tüm ödüller açık':'All rewards unlocked')+'</span></div>')+'</div>';
}
function startBonusMission(mission){
  if(!mission)return;bonusMission={...mission};
  if(mission.mode==='crystal'){
    currentCrystalPool={min:mission.level,max:mission.level};currentCrystalLayout=null;startCrystalChallenge(mission.level,true);
  }else if(mission.mode==='chain'){
    currentChainPool={min:mission.level,max:mission.level};currentChainPlan=null;startChainChallenge(mission.level,true);
  }else{
    currentReactorPool={min:mission.level,max:mission.level};currentReactorPlan=null;startReactorChallenge(mission.level,true);
  }
}
function clearBonusMission(){bonusMission=null;}
function awardBonusMission(mission){
  if(!mission)return null;
  ensureResearchState(save);
  const key=String(mission.milestone),before=bonusMedalCount();
  if(save.bonusClaims[key])return {new:false,medals:before,coins:0,rp:0,tier:bonusVisualTierForCount(before),unlocked:''};
  save.bonusClaims[key]=1;
  const oldBonusRP=Math.max(0,Math.floor(Number(save.researchBonuses[key])||0));
  save.researchBonuses[key]=Math.max(BONUS_REWARD_RP,oldBonusRP);
  const rpAdded=addResearchPoints(Math.max(0,BONUS_REWARD_RP-oldBonusRP),0);
  const bonusCoins=BONUS_REWARD_COINS+(labOwned('collider')?20:0);
  addCoins(bonusCoins);
  const medals=bonusMedalCount(),oldTier=bonusVisualTierForCount(before),tier=bonusVisualTierForCount(medals);
  persist();updateCoins(true);updateBadge();updateBonusStatus();applyBonusCosmetics();
  try{if(window.MXCloud&&save.profileId&&window.MXCloud.syncLeaderboard)window.MXCloud.syncLeaderboard(save,save.profileId,true);}catch(e){}
  return {new:true,medals,coins:bonusCoins,rp:rpAdded,tier,unlocked:tier>oldTier?bonusRewardName(tier):''};
}
function bonusAwardHtml(reward){
  if(!reward||!reward.new)return '';
  const tr=LANG==='tr';
  const mode=bonusMission&&bonusMission.mode?bonusMission.mode:'crystal';
  return '<div class="bonusAward"><div class="bonusAwardHero">'+bonusModeVisualHtml(mode,false)+'</div><b>🏅 '+(tr?'BONUS MADALYASI KAZANDIN!':'BONUS MEDAL EARNED!')+'</b><div><span>+1 🏅</span><span>+'+reward.coins+' <i class="coinIcon"></i></span><span>+'+reward.rp+' RP</span></div>'+
    (reward.unlocked?'<em>🔓 '+reward.unlocked+' '+(tr?'açıldı!':'unlocked!')+'</em>':'')+'</div>';
}
function crystalCopy(){
  const tr=LANG==='tr';
  return tr?{
    title:'KATALİZÖR AVI',sub:'Katalizör, enerji hücresi ve stabilizatörü topla',difficulty:'ZORLUK HAVUZU',mixed:'KARIŞIK · BÖLÜM 41–'+LEVELS.length,medium:'ORTA · BÖLÜM 41–100',hard:'ZOR · BÖLÜM 121–'+LEVELS.length,
    rules:'Atomları kaydırarak Katalizör, Enerji Hücresi ve Stabilizatörün üzerinden geç. Üç reaksiyon bileşeni tamamlanmadan molekül bitmiş sayılmaz. Süre 90 saniyedir.',start:'BAŞLAT',cancel:'VAZGEÇ',complete:'REAKSİYON HAZIR!',timeUp:'SÜRE DOLDU',
    crystals:'Bileşenler',time:'Süre',moves:'Hamle',retry:'TEKRAR DENE',newGame:'YENİ HARİTA',menu:'ANA MENÜ',needAll:'Önce üç reaksiyon bileşenini de toplamalısın!',quitTitle:'KATALİZÖR AVI BİTİRİLSİN Mİ?',quit:'ÇIKIŞ',stay:'DEVAM ET'
  }:{
    title:'CATALYST HUNT',sub:'Collect the catalyst, energy cell, and stabilizer',difficulty:'DIFFICULTY POOL',mixed:'MIXED · LEVELS 41–'+LEVELS.length,medium:'MEDIUM · LEVELS 41–100',hard:'HARD · LEVELS 101–'+LEVELS.length,
    rules:'Slide atoms across the Catalyst, Energy Cell, and Stabilizer. The molecule does not count until all three reaction components are collected. The limit is 90 seconds.',start:'START',cancel:'CANCEL',complete:'REACTION READY!',timeUp:'TIME UP',
    crystals:'Components',time:'Time',moves:'Moves',retry:'TRY AGAIN',newGame:'NEW BOARD',menu:'MAIN MENU',needAll:'Collect all three reaction components first!',quitTitle:'END CATALYST HUNT?',quit:'QUIT',stay:'KEEP PLAYING'
  };
}
function crystalPoolFor(kind){return duelPoolFor(kind);}
function crystalSlideDest(state,g,i,d){
  const[dx,dy]=DIRS[d];let x=state[i].x,y=state[i].y;
  while(true){
    const nx=x+dx,ny=y+dy;
    if(!g[ny]||g[ny][nx]||state.some((a,k)=>k!==i&&a.x===nx&&a.y===ny))break;
    x=nx;y=ny;
  }
  return(x===state[i].x&&y===state[i].y)?null:{x,y};
}
function buildCrystalLayout(levelIndex){
  const L=LEVELS[levelIndex],g=L.g.map(r=>[...r].map(c=>c==='1'));
  const state=L.a.map(a=>({x:a[0],y:a[1],e:a[2]}));
  const initial=new Set(state.map(a=>a.x+','+a.y)),seen=new Set(),path=[];
  const add=(x,y)=>{const k=x+','+y;if(!g[y]||g[y][x]||initial.has(k)||seen.has(k))return;seen.add(k);path.push({x,y});};
  for(const step of (L.fs||[])){
    const i=step[0],d=step[1],dest=crystalSlideDest(state,g,i,d);if(!dest)continue;
    const[dx,dy]=DIRS[d];let x=state[i].x,y=state[i].y;
    while(x!==dest.x||y!==dest.y){x+=dx;y+=dy;add(x,y);}
    state[i]={...state[i],x:dest.x,y:dest.y};
  }
  if(path.length<CRYSTAL_COUNT){
    const fallback=[];
    for(let y=1;y<g.length-1;y++)for(let x=1;x<g[y].length-1;x++){
      const k=x+','+y;if(!g[y][x]&&!initial.has(k)&&!seen.has(k))fallback.push({x,y});
    }
    fallback.sort((a,b)=>((((a.x*73856093)^(a.y*19349663)^(levelIndex*83492791))>>>0)-(((b.x*73856093)^(b.y*19349663)^(levelIndex*83492791))>>>0)));
    for(const c of fallback){add(c.x,c.y);if(path.length>=CRYSTAL_COUNT)break;}
  }
  const picks=[],idxs=[0.18,0.5,0.82];
  for(const q of idxs){
    if(!path.length)break;
    let idx=Math.max(0,Math.min(path.length-1,Math.round((path.length-1)*q)));
    while(picks.some(c=>c.x===path[idx].x&&c.y===path[idx].y)&&idx<path.length-1)idx++;
    while(picks.some(c=>c.x===path[idx].x&&c.y===path[idx].y)&&idx>0)idx--;
    if(!picks.some(c=>c.x===path[idx].x&&c.y===path[idx].y))picks.push({...path[idx],collected:false});
  }
  for(const c of path){if(picks.length>=CRYSTAL_COUNT)break;if(!picks.some(p=>p.x===c.x&&p.y===c.y))picks.push({...c,collected:false});}
  return picks.slice(0,CRYSTAL_COUNT).map((c,i)=>({...c,type:LAB_COMPONENTS[i].id}));
}
function crystalCollectedCount(){return crystals.reduce((n,c)=>n+(c.collected?1:0),0);}
function crystalPathBetween(x0,y0,x1,y1){
  const cells=[],dx=Math.sign(x1-x0),dy=Math.sign(y1-y0);let x=x0,y=y0;
  while(x!==x1||y!==y1){x+=dx;y+=dy;cells.push({x,y});}
  return cells;
}
function collectCrystalsAlong(cells){
  if(!crystalActive()||!cells||!cells.length)return;
  let gained=0;
  for(let i=0;i<crystals.length;i++){
    const c=crystals[i];if(c.collected)continue;
    if(cells.some(p=>p.x===c.x&&p.y===c.y)){
      c.collected=true;gained++;const spec=labComponentSpec(c.type,i);
      const r=board.getBoundingClientRect(),cx=r.left+(c.x+0.5)*T,cy=r.top+(c.y+0.5)*T;
      sparkleBurst(cx,cy,spec.colors);
      for(let j=0;j<10;j++)P({k:'crys',x:cx,y:cy,vx:(Math.random()-0.5)*4,vy:-2-Math.random()*3,w:3+Math.random()*4,rot:Math.random()*7,vr:(Math.random()-0.5)*.3,c:rnd(spec.colors),life:1.1});
      prop(spec.icon+' '+(LANG==='tr'?spec.tr:spec.en)+' ✓',1550);
    }
  }
  if(gained){SFX.sparkle();updateHUD();}
}
function drawCrystalToken(x,y,t,type='catalyst'){
  const spec=labComponentSpec(type),pulse=1+Math.sin(t/230+x*.03+y*.02)*.07,s=T*.24*pulse;
  bctx.save();bctx.translate(x,y);bctx.rotate(Math.sin(t/760+x*.018)*.08);bctx.lineWidth=2;
  bctx.shadowColor=spec.colors[1];bctx.shadowBlur=15;
  if(spec.id==='catalyst'){
    bctx.fillStyle='#d9edf2';bctx.strokeStyle='#ffffff';rrect(bctx,-s*.52,-s*.9,s*1.04,s*1.55,s*.28);bctx.fill();bctx.stroke();
    bctx.fillStyle='#6f7985';rrect(bctx,-s*.34,-s*1.18,s*.68,s*.34,s*.1);bctx.fill();
    bctx.fillStyle='#ff9a43';rrect(bctx,-s*.42,-s*.08,s*.84,s*.60,s*.20);bctx.fill();
    bctx.fillStyle='rgba(255,255,255,.72)';rrect(bctx,-s*.28,-s*.65,s*.16,s*.68,s*.08);bctx.fill();
  }else if(spec.id==='energy'){
    bctx.fillStyle='#174e81';bctx.strokeStyle='#bdefff';rrect(bctx,-s*.62,-s*.88,s*1.24,s*1.65,s*.24);bctx.fill();bctx.stroke();
    bctx.fillStyle='#bdefff';rrect(bctx,-s*.25,-s*1.08,s*.5,s*.22,s*.07);bctx.fill();
    bctx.fillStyle='#35b9ff';rrect(bctx,-s*.48,-s*.66,s*.96,s*1.18,s*.16);bctx.fill();
    bctx.fillStyle='#fff7a5';bctx.beginPath();bctx.moveTo(s*.10,-s*.55);bctx.lineTo(-s*.25,s*.05);bctx.lineTo(s*.02,s*.05);bctx.lineTo(-s*.12,s*.55);bctx.lineTo(s*.35,-s*.10);bctx.lineTo(s*.08,-s*.10);bctx.closePath();bctx.fill();
  }else{
    bctx.strokeStyle='#d9ffe6';bctx.fillStyle='#238e62';bctx.beginPath();
    for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,px=Math.cos(a)*s*.9,py=Math.sin(a)*s*.9;i?bctx.lineTo(px,py):bctx.moveTo(px,py);}bctx.closePath();bctx.fill();bctx.stroke();
    bctx.strokeStyle='#9cffc2';bctx.lineWidth=1.5;
    for(let r=0;r<3;r++){bctx.save();bctx.rotate(r*Math.PI/3);bctx.beginPath();bctx.ellipse(0,0,s*.72,s*.25,0,0,Math.PI*2);bctx.stroke();bctx.restore();}
    bctx.fillStyle='#eaffef';bctx.beginPath();bctx.arc(0,0,s*.16,0,Math.PI*2);bctx.fill();
  }
  bctx.restore();
}
function randomLevelFromPool(pool){return pool.min+Math.floor(Math.random()*(Math.min(pool.max,LEVELS.length-1)-pool.min+1));}
function openCrystalSetup(){
  const c=crystalCopy(),opts='<option value="mixed">🎲 '+c.mixed+'</option><option value="medium">⚗️ '+c.medium+'</option><option value="hard">🔥 '+c.hard+'</option>';
  openModal('<h3>🧪 '+c.title+'</h3><div class="msub">'+c.sub+'</div><label class="duelLevelLabel">'+c.difficulty+'<select id="crystalLevelSelect">'+opts+'</select></label><div class="duelRules">🧪 + ⚡ + ⚛️ · ⏱️ 90 sn<br>'+c.rules+'</div><div class="mrow"><button class="btn green" id="mCrystalStart">'+c.start+'</button><button class="btn ghost" id="mCrystalCancel">'+c.cancel+'</button></div>');
  bindTap('#mCrystalStart',e=>{SFX.play();clearBonusMission();currentCrystalPool=crystalPoolFor($('#crystalLevelSelect').value);startCrystalChallenge(randomLevelFromPool(currentCrystalPool),true);});
  bindTap('#mCrystalCancel',e=>{SFX.back();openBonusLab();});
}
function startCrystalChallenge(levelIndex,newLayout){
  if(newLayout||!currentCrystalLayout)currentCrystalLayout=buildCrystalLayout(levelIndex);
  startLevel(levelIndex,'crystal');
}
function resetCrystalUi(){
  crystalMode=false;crystals=[];currentCrystalLayout=null;currentCrystalPool=null;crystalGoalWarned=false;duelTimerText='';
  const cc=$('#crystalCounter');if(cc){cc.classList.remove('on');cc.textContent=labComponentHud();}
  const dt=$('#duelTimer');if(dt){dt.classList.remove('on','urgent');dt.textContent='00:00.0';}
  if(scr.game)scr.game.classList.remove('crystalMode');
  ['#btnHint','#btnRestart','#btnGear','#btnLab','#btnMols','#btnAchv'].forEach(id=>{const el=$(id);if(el)el.disabled=false;});
}
function crystalResultHtml(elapsed){const c=crystalCopy();return '<div class="crystalResult"><div><b>'+crystalCollectedCount()+'/'+CRYSTAL_COUNT+'</b><span>'+c.crystals+'</span></div><div><b>'+duelFormatTime(elapsed)+'</b><span>'+c.time+'</span></div><div><b>'+moves+'</b><span>'+c.moves+'</span></div></div>';}
function showCrystalSuccess(elapsed,reward){
  const c=crystalCopy();setTimeout(()=>{
    if(!crystalMode||duelMode)return;
    openModal('<h3>🧪 '+c.complete+'</h3><div class="crystalModeTag">'+c.sub+'</div>'+crystalResultHtml(elapsed)+bonusAwardHtml(reward)+'<div class="mrow"><button class="btn green" id="mCrystalAgain">'+c.retry+'</button><button class="btn" id="mCrystalNew">'+c.newGame+'</button><button class="btn green" id="mCrystalMenu">'+(LANG==='tr'?'CLASSIC’E DEVAM':'CONTINUE CLASSIC')+'</button></div>');
    $('#mCrystalAgain').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startCrystalChallenge(lv,false);},{passive:false});
    $('#mCrystalNew').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();clearBonusMission();currentCrystalPool=crystalPoolFor('mixed');startCrystalChallenge(randomLevelFromPool(currentCrystalPool),true);},{passive:false});
    $('#mCrystalMenu').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();continueClassicAfterBonus(resetCrystalUi);},{passive:false});
  },2200);
}
function finishCrystalTimeout(){
  if(!crystalMode||duelMode||won)return;won=true;winT=performance.now();anim=null;bounce=null;nudge=null;updateHUD();
  const el=$('#duelTimer');if(el){el.textContent='00:00.0';el.classList.add('urgent');}
  SFX.thunk();say(crystalCopy().timeUp,'sad',2200,'shk');
  setTimeout(()=>{const c=crystalCopy();openModal('<h3>⏱️ '+c.timeUp+'</h3>'+crystalResultHtml(CRYSTAL_TIME_LIMIT)+'<div class="mrow"><button class="btn green" id="mCrystalRetry">'+c.retry+'</button><button class="btn" id="mCrystalNew2">'+c.newGame+'</button><button class="btn ghost" id="mCrystalMenu2">'+c.menu+'</button></div>');
    $('#mCrystalRetry').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startCrystalChallenge(lv,false);},{passive:false});
    $('#mCrystalNew2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();clearBonusMission();currentCrystalPool=crystalPoolFor('mixed');startCrystalChallenge(randomLevelFromPool(currentCrystalPool),true);},{passive:false});
    $('#mCrystalMenu2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();if(bonusMission)continueClassicAfterBonus(resetCrystalUi);else{resetCrystalUi();closeModal();openBonusLab();}},{passive:false});
  },700);
}
function confirmQuitCrystal(){
  const c=crystalCopy();openModal('<h3>'+c.quitTitle+'</h3><div class="mrow"><button class="btn danger" id="mCrystalQuit">'+c.quit+'</button><button class="btn" id="mCrystalStay">'+c.stay+'</button></div>');
  bindTap('#mCrystalQuit',e=>{SFX.back();clearBonusMission();resetCrystalUi();closeModal();show('levels');setTimeout(openBonusLab,80);});
  bindTap('#mCrystalStay',e=>{SFX.click();closeModal();});
}
function bonusMissionSlotHtml(milestone){
  const tr=LANG==='tr',mission=bonusMissionForMilestone(milestone),unlocked=isBonusUnlocked(milestone),claimed=isBonusClaimed(milestone);
  const cls=unlocked?(claimed?'claimed':'ready'):'locked';
  const state=claimed?(tr?'TAMAMLANDI · TEKRAR OYNANABİLİR':'COMPLETED · REPLAY AVAILABLE'):(unlocked?(tr?'HAZIR · İLK ÖDÜL BEKLİYOR':'READY · FIRST REWARD AVAILABLE'):(tr?'KİLİTLİ · '+milestone+'. BÖLÜMÜ TAMAMLA':'LOCKED · COMPLETE LEVEL '+milestone));
  return '<button class="bonusMissionCard bonusSlot '+cls+'" data-bonus-mile="'+milestone+'" '+(unlocked?'':'disabled aria-disabled="true"')+'><div class="bonusMissionVisual">'+bonusModeVisualHtml(mission.mode,false)+'</div><b>'+bonusModeIcon(mission.mode)+' '+bonusModeName(mission.mode)+'</b><span>'+(tr?'Bölüm ':'Level ')+milestone+'</span><em>'+state+'</em>'+(claimed?'<small>'+(tr?'Tekrarda ödül verilmez':'No reward on replay')+'</small>':'')+'</button>';
}
function openBonusLab(){
  const tr=LANG==='tr',pending=nextBonusMission();
  openModal('<h3>⚗️ BONUS LAB</h3><div class="msub">'+(tr?'Toplam 15 bonus görev vardır. Her 10 Classic bölümde yalnızca bir yenisi açılır.':'There are 15 bonus missions. One unlocks after every 10 Classic levels.')+'</div>'+bonusRewardPreviewHtml()+
    (pending?'<div class="bonusNextHint">🎁 '+(tr?'Sıradaki açık görev: Bölüm ':'Next unlocked mission: Level ')+pending.milestone+' · '+bonusModeIcon(pending.mode)+' '+bonusModeName(pending.mode)+'</div>':'')+
    '<div class="bonusMissionGrid">'+BONUS_MILESTONES.map(bonusMissionSlotHtml).join('')+'</div><div class="mrow"><button class="btn ghost" id="mBonusCancel">'+(tr?'KAPAT':'CLOSE')+'</button></div>');
  document.querySelectorAll('[data-bonus-mile]:not([disabled])').forEach(btn=>bindTap(btn,e=>{const m=Number(btn.dataset.bonusMile);SFX.play();startBonusMission(bonusMissionForMilestone(m));}));
  bindTap('#mBonusCancel',e=>{SFX.back();closeModal();});
}
function continueClassicAfterBonus(resetFn){
  const target=bonusMission?Math.min(LEVELS.length-1,Math.max(0,Number(bonusMission.milestone)||0)):Math.min(LEVELS.length-1,Math.max(0,Number(save.cur)||0));
  clearBonusMission();if(typeof resetFn==='function')resetFn();closeModal();goToLevelWithStory(target);
}
function chainCopy(){
  const tr=LANG==='tr';
  return tr?{
    title:'ZİNCİR REAKSİYON',sub:'Yüklü hamleyi yap, atomları art arda tetikle',difficulty:'ZORLUK HAVUZU',mixed:'KARIŞIK · BÖLÜM 41–'+LEVELS.length,medium:'ORTA · BÖLÜM 41–100',hard:'ZOR · BÖLÜM 121–'+LEVELS.length,
    rules:'Parlayan atom doğru yönde kaydırıldığında sonraki 1–2 çözüm hamlesi otomatik gerçekleşir. Molekülü 90 saniyede tamamla ve en büyük comboyu oluştur.',start:'BAŞLAT',cancel:'VAZGEÇ',complete:'REAKSİYON TAMAMLANDI!',timeUp:'SÜRE DOLDU',
    combo:'En Büyük Combo',reactions:'Reaksiyon',time:'Süre',moves:'Hamle',retry:'TEKRAR DENE',newGame:'YENİ HARİTA',menu:'BONUS LAB',quitTitle:'ZİNCİR REAKSİYON BİTİRİLSİN Mİ?',quit:'ÇIKIŞ',stay:'DEVAM ET',noHint:'Zincir Reaksiyonda ipucu kapalı.'
  }:{
    title:'CHAIN REACTION',sub:'Make the charged move and trigger atoms in sequence',difficulty:'DIFFICULTY POOL',mixed:'MIXED · LEVELS 41–'+LEVELS.length,medium:'MEDIUM · LEVELS 41–100',hard:'HARD · LEVELS 101–'+LEVELS.length,
    rules:'Slide the glowing atom in the correct direction to automate the next 1–2 solution moves. Complete the molecule within 90 seconds and build the biggest combo.',start:'START',cancel:'CANCEL',complete:'REACTION COMPLETE!',timeUp:'TIME UP',
    combo:'Best Combo',reactions:'Reactions',time:'Time',moves:'Moves',retry:'TRY AGAIN',newGame:'NEW BOARD',menu:'BONUS LAB',quitTitle:'END CHAIN REACTION?',quit:'QUIT',stay:'KEEP PLAYING',noHint:'Hints are disabled in Chain Reaction.'
  };
}
function isChainLevelEligible(levelIndex){
  const L=LEVELS[levelIndex];if(!L||!(L.fs||[]).length||L.fs.length<4)return false;
  return L.a.every(a=>!a.slice(3).some(Boolean));
}
function chainEligibleLevels(pool,exclude=[]){
  const blocked=new Set(exclude||[]),out=[];
  for(let i=pool.min;i<=Math.min(pool.max,LEVELS.length-1);i++)if(!blocked.has(i)&&isChainLevelEligible(i))out.push(i);
  return out;
}
function randomChainLevelFromPool(pool,exclude=[]){
  const list=chainEligibleLevels(pool,exclude);if(!list.length)return randomLevelFromPool(pool);
  return list[Math.floor(Math.random()*list.length)];
}
function buildChainPlan(levelIndex){
  const n=(LEVELS[levelIndex].fs||[]).length;if(n<4)return [];
  const spec=n>=9?[[.08,1],[.42,2],[.74,1]]:(n>=6?[[.08,1],[.52,2]]:[[0,1],[.56,1]]);
  const plan=[];let lastEnd=-1;
  for(const [q,want] of spec){
    let trigger=Math.floor((n-1)*q);if(trigger<=lastEnd)trigger=lastEnd+1;
    if(trigger>=n-1)continue;
    const autoCount=Math.min(want,n-trigger-1);if(autoCount<1)continue;
    plan.push({trigger,autoCount});lastEnd=trigger+autoCount;
  }
  if(!plan.length&&n>=2)plan.push({trigger:0,autoCount:1});
  return plan;
}
function chainRefreshStep(){
  if(!chainActive()||!chainPathKeys.length){chainCurrentStep=-1;return chainCurrentStep;}
  const k=stateKey(atoms.map(a=>({x:a.x,y:a.y,e:a.e})));
  chainCurrentStep=chainPathKeys.indexOf(k);return chainCurrentStep;
}
function chainTriggerForMove(i,d){
  if(!chainActive()||chainAutoExecuting||chainAutoActive||chainCurrentStep<0)return null;
  const expected=LV.fs&&LV.fs[chainCurrentStep],cfg=chainPlan.find(x=>x.trigger===chainCurrentStep);
  if(!expected||!cfg||expected[0]!==i||expected[1]!==d)return null;
  return {step:chainCurrentStep,autoCount:cfg.autoCount};
}
function chainChargedAtomIndex(){
  if(!chainActive()||chainAutoActive||chainCurrentStep<0)return -1;
  const cfg=chainPlan.find(x=>x.trigger===chainCurrentStep),step=LV.fs&&LV.fs[chainCurrentStep];
  return cfg&&step?step[0]:-1;
}
function chainCounterText(){
  const total=Math.max(1,chainPlan.length),combo=chainAutoActive?chainCurrentCombo:chainMaxCombo;
  return '⚡ COMBO x'+Math.max(1,combo)+' · '+chainReactions+'/'+total;
}
function chainBurstFx(combo){
  const r=board.getBoundingClientRect(),cx=r.left+atoms.reduce((n,a)=>n+a.x+.5,0)/atoms.length*T,cy=r.top+atoms.reduce((n,a)=>n+a.y+.5,0)/atoms.length*T;
  sparkleBurst(cx,cy,['#fff4a0','#ffb43f','#ff6846']);
  for(let i=0;i<16;i++)P({k:'glit',x:cx,y:cy,vx:(Math.random()-.5)*4.5,vy:(Math.random()-.5)*4.5,r:2+Math.random()*3,c:rnd(['#fff4a0','#ffb43f','#ff6846']),life:1.0,d:Math.random()*.18});
  prop('⚡ COMBO x'+combo,1700);SFX.sparkle();
}
function runNextChainAuto(){
  if(!chainActive()||won){chainAutoQueue=[];chainAutoActive=false;updateHUD();return;}
  if(!chainAutoQueue.length){chainAutoActive=false;chainCurrentCombo=1;chainRefreshStep();updateHUD();return;}
  const [i,d]=chainAutoQueue.shift();
  // Fixed 2026-07-30: check linkedMovePlan first (same precedence as move()) —
  // a linked pair can still make a legal move even when the primary atom
  // alone cannot (e.g. atom i is boxed in but its linked mate can slide),
  // so checking only slideDest(i,d) here could wrongly cancel a valid
  // Chain Reaction auto-queue on levels that combine linked atoms with the
  // Chain bonus mode (170, 176).
  const legal=linkedMovePlan(i,d)||slideDest(i,d);
  if(!legal){chainAutoQueue=[];chainAutoActive=false;chainCurrentCombo=1;chainRefreshStep();updateHUD();return;}
  chainAutoExecuting=true;move(i,d);chainAutoExecuting=false;
}
function beginChainReaction(trigger){
  if(!chainActive()||!trigger||won)return;
  const combo=1+trigger.autoCount;chainCurrentCombo=combo;chainMaxCombo=Math.max(chainMaxCombo,combo);chainReactions++;chainAutoMoves+=trigger.autoCount;
  chainAutoQueue=(LV.fs||[]).slice(trigger.step+1,trigger.step+1+trigger.autoCount).map(x=>[x[0],x[1]]);chainAutoActive=true;
  chainBurstFx(combo);updateHUD();setTimeout(runNextChainAuto,110);
}
function openChainSetup(){
  const c=chainCopy(),opts='<option value="mixed">🎲 '+c.mixed+'</option><option value="medium">⚗️ '+c.medium+'</option><option value="hard">🔥 '+c.hard+'</option>';
  openModal('<h3>⚡ '+c.title+'</h3><div class="msub">'+c.sub+'</div><label class="duelLevelLabel">'+c.difficulty+'<select id="chainLevelSelect">'+opts+'</select></label><div class="duelRules">⚡ Combo x2 / x3 · ⏱️ 90 sn<br>'+c.rules+'</div><div class="mrow"><button class="btn green" id="mChainStart">'+c.start+'</button><button class="btn ghost" id="mChainCancel">'+c.cancel+'</button></div>');
  bindTap('#mChainStart',e=>{SFX.play();clearBonusMission();currentChainPool=duelPoolFor($('#chainLevelSelect').value);startChainChallenge(randomChainLevelFromPool(currentChainPool),true);});
  bindTap('#mChainCancel',e=>{SFX.back();openBonusLab();});
}
function startChainChallenge(levelIndex,newPlan){
  if(newPlan||!currentChainPlan)currentChainPlan=buildChainPlan(levelIndex);
  startLevel(levelIndex,'chain');
}
function resetChainUi(){
  chainMode=false;currentChainPool=null;currentChainPlan=null;chainPlan=[];chainPathKeys=[];chainCurrentStep=0;chainMaxCombo=1;chainReactions=0;chainAutoMoves=0;chainCurrentCombo=1;chainAutoActive=false;chainAutoExecuting=false;chainAutoQueue=[];duelTimerText='';
  const cc=$('#chainCounter');if(cc){cc.classList.remove('on','hot');cc.textContent='⚡ COMBO x1';}
  const dt=$('#duelTimer');if(dt){dt.classList.remove('on','urgent');dt.textContent='00:00.0';}
  if(scr.game)scr.game.classList.remove('chainMode');
  ['#btnHint','#btnRestart','#btnGear','#btnLab','#btnMols','#btnAchv'].forEach(id=>{const el=$(id);if(el)el.disabled=false;});
}
function chainResultHtml(elapsed){const c=chainCopy();return '<div class="chainResult"><div><b>x'+chainMaxCombo+'</b><span>'+c.combo+'</span></div><div><b>'+chainReactions+'</b><span>'+c.reactions+'</span></div><div><b>'+duelFormatTime(elapsed)+'</b><span>'+c.time+'</span></div><div><b>'+moves+'</b><span>'+c.moves+'</span></div></div>';}
function showChainSuccess(elapsed,reward){
  const c=chainCopy();setTimeout(()=>{
    if(!chainMode||duelMode)return;
    openModal('<h3>⚡ '+c.complete+'</h3><div class="chainModeTag">'+c.sub+'</div>'+chainResultHtml(elapsed)+bonusAwardHtml(reward)+'<div class="mrow"><button class="btn green" id="mChainAgain">'+c.retry+'</button><button class="btn" id="mChainNew">'+c.newGame+'</button><button class="btn green" id="mChainMenu">'+(LANG==='tr'?'CLASSIC’E DEVAM':'CONTINUE CLASSIC')+'</button></div>');
    $('#mChainAgain').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startChainChallenge(lv,false);},{passive:false});
    $('#mChainNew').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();clearBonusMission();currentChainPool=duelPoolFor('mixed');startChainChallenge(randomChainLevelFromPool(currentChainPool),true);},{passive:false});
    $('#mChainMenu').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();continueClassicAfterBonus(resetChainUi);},{passive:false});
  },2200);
}
function finishChainTimeout(){
  if(!chainMode||duelMode||won)return;won=true;winT=performance.now();anim=null;bounce=null;nudge=null;chainAutoQueue=[];chainAutoActive=false;updateHUD();
  const el=$('#duelTimer');if(el){el.textContent='00:00.0';el.classList.add('urgent');}
  SFX.thunk();say(chainCopy().timeUp,'sad',2200,'shk');
  setTimeout(()=>{const c=chainCopy();openModal('<h3>⏱️ '+c.timeUp+'</h3>'+chainResultHtml(CHAIN_TIME_LIMIT)+'<div class="mrow"><button class="btn green" id="mChainRetry">'+c.retry+'</button><button class="btn" id="mChainNew2">'+c.newGame+'</button><button class="btn ghost" id="mChainMenu2">'+c.menu+'</button></div>');
    $('#mChainRetry').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startChainChallenge(lv,false);},{passive:false});
    $('#mChainNew2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();clearBonusMission();currentChainPool=duelPoolFor('mixed');startChainChallenge(randomChainLevelFromPool(currentChainPool),true);},{passive:false});
    $('#mChainMenu2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();if(bonusMission)continueClassicAfterBonus(resetChainUi);else{resetChainUi();closeModal();openBonusLab();}},{passive:false});
  },700);
}
function confirmQuitChain(){
  const c=chainCopy();openModal('<h3>'+c.quitTitle+'</h3><div class="mrow"><button class="btn danger" id="mChainQuit">'+c.quit+'</button><button class="btn" id="mChainStay">'+c.stay+'</button></div>');
  bindTap('#mChainQuit',e=>{SFX.back();clearBonusMission();resetChainUi();closeModal();show('levels');setTimeout(openBonusLab,80);});
  bindTap('#mChainStay',e=>{SFX.click();closeModal();});
}

function reactorCopy(){
  const tr=LANG==='tr';
  return tr?{
    title:'REAKTÖR KAÇIŞI',sub:'Lazerler kapanınca geç ve molekülü tamamla',difficulty:'ZORLUK HAVUZU',mixed:'KARIŞIK · BÖLÜM 41–'+LEVELS.length,medium:'ORTA · BÖLÜM 41–100',hard:'ZOR · BÖLÜM 121–'+LEVELS.length,
    rules:'Aktif lazer geçici duvar gibi davranır. Atom lazerin bir kare önüne kadar kayar; oradan yön değiştirip etrafından dolaşabilirsin. Yalnızca lazere bitişikken ışına hamle yapmak 3 saniye ceza ekler. Süre 90 saniyedir.',start:'BAŞLAT',cancel:'VAZGEÇ',complete:'REAKTÖRDEN KAÇTIN!',timeUp:'SÜRE DOLDU',
    hits:reactorImpactResultLabel(),penalty:'Ceza',time:'Süre',moves:'Hamle',retry:'TEKRAR DENE',newGame:'YENİ HARİTA',menu:'BONUS LAB',quitTitle:'REAKTÖR KAÇIŞI BİTİRİLSİN Mİ?',quit:'ÇIKIŞ',stay:'DEVAM ET',noHint:'Reaktör Kaçışında ipucu kapalı.',blocked:'Lazere temas ettin! +3 saniye.'
  }:{
    title:'REACTOR ESCAPE',sub:'Move while lasers are open and complete the molecule',difficulty:'DIFFICULTY POOL',mixed:'MIXED · LEVELS 41–'+LEVELS.length,medium:'MEDIUM · LEVELS 41–100',hard:'HARD · LEVELS 101–'+LEVELS.length,
    rules:'An active laser behaves like a temporary wall. The atom slides to the square immediately before it, allowing a route around the beam. Only pushing into the beam from an adjacent square adds a 3-second penalty. The limit is 90 seconds.',start:'START',cancel:'CANCEL',complete:'REACTOR ESCAPED!',timeUp:'TIME UP',
    hits:reactorImpactResultLabel(),penalty:'Penalty',time:'Time',moves:'Moves',retry:'TRY AGAIN',newGame:'NEW BOARD',menu:'BONUS LAB',quitTitle:'END REACTOR ESCAPE?',quit:'QUIT',stay:'KEEP PLAYING',noHint:'Hints are disabled in Reactor Escape.',blocked:'Laser contact! +3 seconds.'
  };
}
function buildReactorPlan(levelIndex){
  const L=LEVELS[levelIndex],g=L.g.map(r=>[...r].map(c=>c==='1'));
  const state=L.a.map(a=>({x:a[0],y:a[1],e:a[2]}));
  const initial=new Set(state.map(a=>a.x+','+a.y)),candidates=[],seen=new Set();
  for(let si=0;si<(L.fs||[]).length;si++){
    const step=L.fs[si],i=step[0],d=step[1],dest=crystalSlideDest(state,g,i,d);if(!dest)continue;
    const cells=crystalPathBetween(state[i].x,state[i].y,dest.x,dest.y);
    for(const c of cells){const k=c.x+','+c.y;if(!initial.has(k)&&!seen.has(k)){seen.add(k);candidates.push({x:c.x,y:c.y,axis:(d===1||d===3)?'v':'h',step:si});}}
    state[i]={...state[i],x:dest.x,y:dest.y};
  }
  const finalSet=new Set(state.map(a=>a.x+','+a.y));
  let usable=candidates.filter(c=>!finalSet.has(c.x+','+c.y));if(usable.length<REACTOR_GATE_COUNT)usable=candidates;
  if(!usable.length)return [];
  const picks=[],qs=[.22,.5,.78];
  for(let qi=0;qi<qs.length;qi++){
    let idx=Math.max(0,Math.min(usable.length-1,Math.round((usable.length-1)*qs[qi]))),c=usable[idx];
    while(picks.some(p=>p.x===c.x&&p.y===c.y)&&idx<usable.length-1)c=usable[++idx];
    while(picks.some(p=>p.x===c.x&&p.y===c.y)&&idx>0)c=usable[--idx];
    if(!picks.some(p=>p.x===c.x&&p.y===c.y))picks.push(c);
  }
  for(const c of usable){if(picks.length>=REACTOR_GATE_COUNT)break;if(!picks.some(p=>p.x===c.x&&p.y===c.y))picks.push(c);}
  return picks.slice(0,REACTOR_GATE_COUNT).map((c,i)=>({x:c.x,y:c.y,axis:c.axis,step:c.step,period:1800,safeMs:820,phase:(i*520+((levelIndex+1)*137)%390)%1800}));
}
function isReactorLevelEligible(levelIndex){return buildReactorPlan(levelIndex).length>=REACTOR_GATE_COUNT;}
function reactorEligibleLevels(pool,exclude=[]){const list=[];for(let i=pool.min;i<=Math.min(pool.max,LEVELS.length-1);i++)if(!exclude.includes(i)&&isReactorLevelEligible(i))list.push(i);return list;}
function randomReactorLevelFromPool(pool,exclude=[]){const list=reactorEligibleLevels(pool,exclude);if(!list.length)return randomLevelFromPool(pool);return list[Math.floor(Math.random()*list.length)];}
function reactorGateActive(g,t=performance.now()){const e=Math.max(0,t-levelStartT);return ((e+g.phase)%g.period)>=g.safeMs;}
function reactorElapsedSeconds(t=performance.now()){return Math.max(0,(t-levelStartT)/1000)+reactorPenalty;}
function reactorFirstActiveGate(cells,t=performance.now()){
  if(!reactorActive()||!cells||!cells.length)return null;
  for(let index=0;index<cells.length;index++){
    const c=cells[index],gate=reactorGates.find(g=>g.x===c.x&&g.y===c.y&&reactorGateActive(g,t));
    if(gate)return {gate,index};
  }
  return null;
}
function reactorCounterText(){const label=reactorImpactLabel(true);return campaignFeature==='reactor'?('☢️ '+label+' '+reactorHits):('☢️ '+label+' '+reactorHits+' · +'+reactorPenalty+' sn');}
function drawReactorGate(g,t){
  const cx=(g.x+.5)*T,cy=(g.y+.5)*T,elapsed=Math.max(0,t-levelStartT),cycle=(elapsed+g.phase)%g.period;
  const active=cycle>=g.safeMs,warning=!active&&cycle>=Math.max(0,g.safeMs-260),pulse=.72+.28*Math.sin(t/90+g.phase);
  const beam=active?'#ff2947':(warning?'#ffc342':'#57e8c2');
  bctx.save();bctx.translate(cx,cy);bctx.lineCap='round';
  // Soft floor reflection makes the occupied gate cell easy to read.
  bctx.globalAlpha=active?.18:(warning?.13:.07);bctx.fillStyle=beam;
  if(g.axis==='v')bctx.fillRect(-T*.12,-T*.45,T*.24,T*.9);else bctx.fillRect(-T*.45,-T*.12,T*.9,T*.24);
  bctx.globalAlpha=1;
  // Outer glow and bright laser core.
  bctx.shadowColor=beam;bctx.shadowBlur=active?20:(warning?14:7);
  bctx.lineWidth=Math.max(3,T*.10);bctx.strokeStyle=active?'rgba(255,35,65,'+(.42+.18*pulse)+')':(warning?'rgba(255,190,55,.46)':'rgba(75,225,190,.20)');
  bctx.beginPath();if(g.axis==='v'){bctx.moveTo(0,-T*.36);bctx.lineTo(0,T*.36);}else{bctx.moveTo(-T*.36,0);bctx.lineTo(T*.36,0);}bctx.stroke();
  bctx.lineWidth=Math.max(1.5,T*.035);bctx.strokeStyle=active?'rgba(255,245,247,'+(.82+.18*pulse)+')':(warning?'rgba(255,247,196,'+(.65+.25*pulse)+')':'rgba(165,255,232,.38)');
  bctx.beginPath();if(g.axis==='v'){bctx.moveTo(0,-T*.36);bctx.lineTo(0,T*.36);}else{bctx.moveTo(-T*.36,0);bctx.lineTo(T*.36,0);}bctx.stroke();
  // Metallic emitters at both ends of the beam.
  bctx.shadowBlur=5;
  for(const q of [-1,1]){
    const ex=g.axis==='v'?0:q*T*.41,ey=g.axis==='v'?q*T*.41:0;
    bctx.fillStyle='#18233d';bctx.strokeStyle='rgba(210,225,255,.75)';bctx.lineWidth=Math.max(1,T*.022);
    bctx.beginPath();bctx.arc(ex,ey,T*.13,0,Math.PI*2);bctx.fill();bctx.stroke();
    bctx.fillStyle=beam;bctx.beginPath();bctx.arc(ex,ey,T*(active?.065:.05),0,Math.PI*2);bctx.fill();
  }
  // Amber pre-flash warns that a safe gate is about to turn red.
  if(warning){bctx.globalAlpha=.45+.4*pulse;bctx.strokeStyle='#ffe58b';bctx.lineWidth=Math.max(1,T*.025);for(const q of [-1,1]){bctx.beginPath();if(g.axis==='v'){bctx.moveTo(q*T*.12,-T*.12);bctx.lineTo(q*T*.20,0);bctx.lineTo(q*T*.12,T*.12);}else{bctx.moveTo(-T*.12,q*T*.12);bctx.lineTo(0,q*T*.20);bctx.lineTo(T*.12,q*T*.12);}bctx.stroke();}}
  bctx.restore();
}
function reactorHit(g,d){
  reactorHits++;if(campaignFeature!=='reactor')reactorPenalty+=3;reactorLastHitAt=performance.now();shake=Math.max(shake,.8);nudge={i:sel,d,t0:performance.now()};SFX.thunk();
  const rc=$('#reactorCounter');if(rc){rc.classList.remove('hit');void rc.offsetWidth;rc.classList.add('hit');}
  if(campaignFeature==='reactor'){
    prop(LANG==='tr'?'☢️ LAZER AKTİF':'☢️ LASER ACTIVE',1500);
    say(LANG==='tr'?'Lazer aktifken geçemezsin. Güvenli anı bekle!':'The active laser blocks the path. Wait for the safe phase!','sad',1900,'shk');
  }else{prop('☢️ +3 sn',1500);say(reactorCopy().blocked,'sad',1700,'shk');}
  updateHUD();
}
function openReactorSetup(){
  const c=reactorCopy(),opts='<option value="mixed">🎲 '+c.mixed+'</option><option value="medium">⚗️ '+c.medium+'</option><option value="hard">🔥 '+c.hard+'</option>';
  openModal('<h3>☢️ '+c.title+'</h3><div class="msub">'+c.sub+'</div><label class="duelLevelLabel">'+c.difficulty+'<select id="reactorLevelSelect">'+opts+'</select></label><div class="duelRules">☢️ 3 lazer · temas: +3 sn · ⏱️ 90 sn<br>'+c.rules+'</div><div class="mrow"><button class="btn green" id="mReactorStart">'+c.start+'</button><button class="btn ghost" id="mReactorCancel">'+c.cancel+'</button></div>');
  bindTap('#mReactorStart',e=>{SFX.play();clearBonusMission();currentReactorPool=duelPoolFor($('#reactorLevelSelect').value);startReactorChallenge(randomReactorLevelFromPool(currentReactorPool),true);});
  bindTap('#mReactorCancel',e=>{SFX.back();openBonusLab();});
}
function startReactorChallenge(levelIndex,newPlan){if(newPlan||!currentReactorPlan)currentReactorPlan=buildReactorPlan(levelIndex);startLevel(levelIndex,'reactor');}
function resetReactorUi(){
  reactorMode=false;currentReactorPool=null;currentReactorPlan=null;reactorGates=[];reactorHits=0;reactorPenalty=0;reactorLastHitAt=0;duelTimerText='';
  const rc=$('#reactorCounter');if(rc){rc.classList.remove('on','hit');rc.textContent='☢️ '+reactorImpactLabel(true)+' 0';}
  const dt=$('#duelTimer');if(dt){dt.classList.remove('on','urgent');dt.textContent='00:00.0';}
  if(scr.game)scr.game.classList.remove('reactorMode');
  ['#btnHint','#btnRestart','#btnGear','#btnLab','#btnMols','#btnAchv'].forEach(id=>{const el=$(id);if(el)el.disabled=false;});
}
function reactorResultHtml(elapsed){const c=reactorCopy();return '<div class="reactorResult"><div><b>'+reactorHits+'</b><span>'+c.hits+'</span></div><div><b>+'+reactorPenalty+' sn</b><span>'+c.penalty+'</span></div><div><b>'+duelFormatTime(elapsed)+'</b><span>'+c.time+'</span></div><div><b>'+moves+'</b><span>'+c.moves+'</span></div></div>';}
function showReactorSuccess(elapsed,reward){
  const c=reactorCopy();setTimeout(()=>{if(!reactorMode||duelMode)return;openModal('<h3>☢️ '+c.complete+'</h3><div class="reactorModeTag">'+c.sub+'</div>'+reactorResultHtml(elapsed)+bonusAwardHtml(reward)+'<div class="mrow"><button class="btn green" id="mReactorAgain">'+c.retry+'</button><button class="btn" id="mReactorNew">'+c.newGame+'</button><button class="btn green" id="mReactorMenu">'+(LANG==='tr'?'CLASSIC’E DEVAM':'CONTINUE CLASSIC')+'</button></div>');
    $('#mReactorAgain').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startReactorChallenge(lv,false);},{passive:false});
    $('#mReactorNew').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();clearBonusMission();currentReactorPool=duelPoolFor('mixed');startReactorChallenge(randomReactorLevelFromPool(currentReactorPool),true);},{passive:false});
    $('#mReactorMenu').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();continueClassicAfterBonus(resetReactorUi);},{passive:false});
  },2200);
}
function finishReactorTimeout(){
  if(!reactorMode||duelMode||won)return;won=true;winT=performance.now();anim=null;bounce=null;nudge=null;updateHUD();const el=$('#duelTimer');if(el){el.textContent='00:00.0';el.classList.add('urgent');}SFX.thunk();say(reactorCopy().timeUp,'sad',2200,'shk');
  setTimeout(()=>{const c=reactorCopy();openModal('<h3>⏱️ '+c.timeUp+'</h3>'+reactorResultHtml(REACTOR_TIME_LIMIT)+'<div class="mrow"><button class="btn green" id="mReactorRetry">'+c.retry+'</button><button class="btn" id="mReactorNew2">'+c.newGame+'</button><button class="btn ghost" id="mReactorMenu2">'+c.menu+'</button></div>');
    $('#mReactorRetry').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startReactorChallenge(lv,false);},{passive:false});
    $('#mReactorNew2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();clearBonusMission();currentReactorPool=duelPoolFor('mixed');startReactorChallenge(randomReactorLevelFromPool(currentReactorPool),true);},{passive:false});
    $('#mReactorMenu2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();if(bonusMission)continueClassicAfterBonus(resetReactorUi);else{resetReactorUi();closeModal();openBonusLab();}},{passive:false});
  },700);
}
function confirmQuitReactor(){
  const c=reactorCopy();openModal('<h3>'+c.quitTitle+'</h3><div class="mrow"><button class="btn danger" id="mReactorQuit">'+c.quit+'</button><button class="btn" id="mReactorStay">'+c.stay+'</button></div>');
  bindTap('#mReactorQuit',e=>{SFX.back();clearBonusMission();resetReactorUi();closeModal();show('levels');setTimeout(openBonusLab,80);});
  bindTap('#mReactorStay',e=>{SFX.click();closeModal();});
}
function duelCopy(){
  const tr=LANG==='tr';
  return tr?{
    title:'ATOM DÜELLOSU',sub:'Tek telefon · 3 raund · İlk 2 galibiyet',p1:'OYUNCU 1',p2:'OYUNCU 2',level:'ZORLUK HAVUZU',mixed:'KARIŞIK · BÖLÜM 41–'+LEVELS.length,medium:'ORTA · BÖLÜM 41–100',hard:'ZOR · BÖLÜM 121–'+LEVELS.length,game:'OYUN TÜRÜ',classic:'KLASİK MOLECULOX',crystal:'KATALİZÖR AVI',chain:'ZİNCİR REAKSİYON',reactor:'REAKTÖR KAÇIŞI',gameMixed:'KARIŞIK · 4 OYUNDAN 3’Ü',
    rules:'Her raundda farklı bir bölüm oynanır. Katalizör Avında üç reaksiyon bileşeni gerekir; Zincir Reaksiyonda büyük combo, Reaktör Kaçışında az lazer darbesi önceliklidir. Her oyuncunun 90 saniyesi vardır. İpucu ve yeniden başlatma kapalıdır.',
    start:'DÜELLOYU BAŞLAT',cancel:'VAZGEÇ',turnDone:'TUR TAMAMLANDI',timeUp:'SÜRE DOLDU',time:'Süre',moves:'Hamle',pass:'Telefonu diğer oyuncuya ver.',ready:'HAZIRIM',
    round:'RAUND',roundWinner:'RAUNDU KAZANDI',roundDraw:'RAUND BERABERE',nextRound:'SONRAKİ RAUND',winner:'DÜELLOYU KAZANDI!',draw:'DÜELLO BERABERE!',rematch:'RÖVANŞ',change:'ZORLUK DEĞİŞTİR',menu:'ANA MENÜ',
    quitTitle:'DÜELLODAN ÇIKILSIN MI?',quit:'DÜELLOYU BİTİR',stay:'DEVAM ET',completed:'Tamamlandı',failed:'Süre doldu',score:'SKOR',
    noHint:'Düelloda ipucu kapalı.',noRestart:'Düelloda yeniden başlatma kapalı.'
  }:{
    title:'ATOM DUEL',sub:'One phone · Best of 3 · First to 2',p1:'PLAYER 1',p2:'PLAYER 2',level:'DIFFICULTY POOL',mixed:'MIXED · LEVELS 41–'+LEVELS.length,medium:'MEDIUM · LEVELS 41–100',hard:'HARD · LEVELS 101–'+LEVELS.length,game:'GAME TYPE',classic:'CLASSIC MOLECULOX',crystal:'CATALYST HUNT',chain:'CHAIN REACTION',reactor:'REACTOR ESCAPE',gameMixed:'MIXED · 3 OF 4 GAMES',
    rules:'Each round uses a different level. Catalyst Hunt requires all reaction components; Chain Reaction rewards the biggest combo; Reactor Escape rewards fewer laser hits. Each player has 90 seconds. Hints and restart are disabled.',
    start:'START DUEL',cancel:'CANCEL',turnDone:'TURN COMPLETE',timeUp:'TIME UP',time:'Time',moves:'Moves',pass:'Pass the phone to the other player.',ready:'READY',
    round:'ROUND',roundWinner:'WON THE ROUND',roundDraw:'ROUND DRAW',nextRound:'NEXT ROUND',winner:'WINS THE DUEL!',draw:'DUEL DRAW!',rematch:'REMATCH',change:'CHANGE DIFFICULTY',menu:'MAIN MENU',
    quitTitle:'QUIT THE DUEL?',quit:'END DUEL',stay:'KEEP PLAYING',completed:'Completed',failed:'Time up',score:'SCORE',
    noHint:'Hints are disabled in Duel.',noRestart:'Restart is disabled in Duel.'
  };
}
function duelFormatTime(sec){
  sec=Math.max(0,Number(sec)||0);const m=Math.floor(sec/60),r=sec-m*60;
  return String(m).padStart(2,'0')+':'+r.toFixed(1).padStart(4,'0');
}
function duelEsc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function duelPoolFor(kind){
  if(kind==='medium')return {kind,min:40,max:99};
  if(kind==='hard')return {kind,min:120,max:LEVELS.length-1};
  return {kind:'mixed',min:40,max:LEVELS.length-1};
}
function duelBuildLevels(pool){
  const all=[];for(let i=pool.min;i<=Math.min(pool.max,LEVELS.length-1);i++)all.push(i);
  for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}
  return all.slice(0,DUEL_MAX_ROUNDS);
}
function duelBuildGameTypes(kind){
  if(kind==='classic')return ['classic','classic','classic'];
  if(kind==='crystal')return ['crystal','crystal','crystal'];
  if(kind==='chain')return ['chain','chain','chain'];
  if(kind==='reactor')return ['reactor','reactor','reactor'];
  const types=['classic','crystal','chain','reactor'];
  for(let i=types.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
  return types.slice(0,DUEL_MAX_ROUNDS);
}
function duelMakeRounds(levels,gameKind,pool){
  const types=duelBuildGameTypes(gameKind),used=[];
  return levels.map((candidate,i)=>{
    let level=candidate;
    if(types[i]==='chain'&&!isChainLevelEligible(level))level=randomChainLevelFromPool(pool||duelPoolFor('mixed'),used);
    if(types[i]==='reactor'&&!isReactorLevelEligible(level))level=randomReactorLevelFromPool(pool||duelPoolFor('mixed'),used);
    if(used.includes(level))level=types[i]==='chain'?randomChainLevelFromPool(pool||duelPoolFor('mixed'),used):(types[i]==='reactor'?randomReactorLevelFromPool(pool||duelPoolFor('mixed'),used):candidate);
    used.push(level);
    return {level,gameType:types[i],crystals:types[i]==='crystal'?buildCrystalLayout(level):null,chainPlan:types[i]==='chain'?buildChainPlan(level):null,reactorPlan:types[i]==='reactor'?buildReactorPlan(level):null,results:[null,null],winner:null};
  });
}
function duelCurrentRound(){return duelState&&duelState.rounds?duelState.rounds[duelState.round]:null;}
function duelStyleTitle(index){const st=duelState&&duelState.playerStyles&&duelState.playerStyles[index];if(!st||!st.title)return '';const row=duelTitleRows().find(x=>x.id===st.title);return row?' <small>· '+duelEsc(LANG==='tr'?row.tr:row.en)+'</small>':'';}
function duelStyleFrameClass(index){const st=duelState&&duelState.playerStyles&&duelState.playerStyles[index],f=st&&DUEL_FRAMES.find(x=>x.id===st.frame);return f?f.css:'frame-bronze';}
function duelScoreHtml(){
  if(!duelState)return '';
  return '<div class="duelMatchScore"><span class="red duelPlayerStyle '+duelStyleFrameClass(0)+'">🔴 '+duelEsc(duelState.players[0])+duelStyleTitle(0)+'</span><b>'+duelState.wins[0]+' — '+duelState.wins[1]+'</b><span class="blue duelPlayerStyle '+duelStyleFrameClass(1)+'">'+duelEsc(duelState.players[1])+duelStyleTitle(1)+' 🔵</span></div>';
}
function duelResultText(res,c,gameType){
  if(!res)return '—';
  const combo=gameType==='chain'?'<br>Combo: x'+(res.maxCombo||1)+' · ⚡ '+(res.reactions||0):'';
  const reactor=gameType==='reactor'?'<br>☢️ '+(res.hits||0)+' · +'+(res.penalty||0)+' sn':'';
  return (res.completed?c.completed:c.failed)+combo+reactor+'<br>'+c.time+': '+duelFormatTime(res.time)+'<br>'+c.moves+': '+res.moves;
}
function resetDuelUi(){
  stopQuickMatchLocal();quickMatchSearch=null;stopOnlineDuelListener();onlineDuelMode=false;onlineDuelSession=null;
  duelMode=false;duelState=null;duelTimerText='';
  const dt=$('#duelTimer');if(dt){dt.classList.remove('on','urgent');dt.textContent='01:30.0';}
  if(scr.game)scr.game.classList.remove('duelP1','duelP2','crystalMode','chainMode','reactorMode');
  crystalMode=false;crystals=[];crystalGoalWarned=false;const cc=$('#crystalCounter');if(cc){cc.classList.remove('on');cc.textContent=labComponentHud();}
  chainMode=false;chainPlan=[];chainPathKeys=[];chainCurrentStep=0;chainMaxCombo=1;chainReactions=0;chainAutoMoves=0;chainCurrentCombo=1;chainAutoActive=false;chainAutoExecuting=false;chainAutoQueue=[];const ch=$('#chainCounter');if(ch){ch.classList.remove('on','hot');ch.textContent='⚡ COMBO x1';}
  reactorMode=false;reactorGates=[];reactorHits=0;reactorPenalty=0;reactorLastHitAt=0;const rc=$('#reactorCounter');if(rc){rc.classList.remove('on','hit');rc.textContent='☢️ '+reactorImpactLabel(true)+' 0';}
  ['#btnHint','#btnRestart','#btnGear','#btnLab','#btnMols','#btnAchv'].forEach(id=>{const el=$(id);if(el)el.disabled=false;});
}
function onlineDuelCopy(){
  const tr=LANG==='tr';
  return tr?{
    hubSub:'Nasıl oynamak istiyorsun?',local:'AYNI TELEFON',localSub:'Telefonu sırayla birbirinize verin.',online:'ARKADAŞLA ONLINE',onlineSub:'Oda kur, 6 haneli kodu arkadaşına gönder.',quick:'HIZLI EŞLEŞME',quickSub:'Çevrim içi bir rakip bul ve otomatik başla.',quickTitle:'HIZLI EŞLEŞME',quickStart:'RAKİP BUL',quickSearching:'RAKİP ARANIYOR',quickSearchingSub:'Moleculox oynayan çevrim içi bir oyuncu aranıyor…',quickRules:'Karışık oyun · Karışık zorluk · 3 raund · İlk 2 galibiyet',quickCancel:'ARAMAYI İPTAL ET',quickFound:'Rakip bulundu! Düello hazırlanıyor…',quickExpired:'Eşleşme araması sona erdi. Tekrar deneyebilirsin.',title:'ONLINE ATOM DÜELLOSU',name:'OYUNCU ADIN',create:'ODA KUR',join:'ODAYA KATIL',code:'ODA KODU',hostSettings:'ODA AYARLARI',waiting:'RAKİP BEKLENİYOR',share:'Bu 6 haneli kodu diğer oyuncuya gönder.',copy:'KODU KOPYALA',copied:'Kod kopyalandı!',opponentPlaying:'RAKİBİN OYNUYOR',yourTurn:'SIRA SENDE',syncing:'Sonuç iki telefona gönderiliyor…',roundReady:'RAUND SONUCU',next:'SONRAKİ RAUND',leave:'ODADAN ÇIK',closed:'Oda kapatıldı.',abandoned:'Diğer oyuncu düellodan ayrıldı.',hostRematch:'RÖVANŞI BAŞLAT',guestRematch:'Oda sahibi rövanş başlatırsa maç otomatik açılacak.',offline:'Online düello için internet bağlantısı gerekiyor.',cloudMissing:'Firebase bağlantısı hazır değil. Birkaç saniye sonra tekrar dene.',notFound:'Bu kodla açık bir oda bulunamadı.',full:'Oda dolu veya maç başlamış.',expired:'Odanın süresi dolmuş.',invalidCode:'6 haneli oda kodunu yaz.',error:'Odaya bağlanılamadı. İnternet bağlantını kontrol et.',retry:'TEKRAR DENE',room:'ODA',friendTurn:'Rakibinin hamlesini tam ekran seyir modunda izliyorsun.',liveTitle:'RAKİBİN CANLI OYUNU',liveWaiting:'Canlı oyun hazırlanıyor…',factTitle:'DR. E’DEN HAP BİLGİ',messages:'HAZIR MESAJLAR',messageSent:'Mesaj gönderildi',opponentDisconnected:'Rakibin bağlantısı kesildi',reconnectWait:'Geri dönmesi için bekleniyor',yourConnectionLost:'İnternet bağlantın kesildi',reconnecting:'Oyuna yeniden bağlanılıyor…',connectionRestored:'Bağlantı yeniden kuruldu.',forfeitWin:'Rakibin geri dönmedi. Hükmen kazandın!',forfeitLoss:'Bağlantı süresi doldu. Maçı hükmen kaybettin.',bothDisconnected:'İki oyuncunun da bağlantısı kesildiği için maç iptal edildi.',forfeitLabel:'HÜKMEN GALİBİYET',seconds:'saniye',unranked:'Dostluk maçı · Kampanya ve dünya sıralamasını etkilemez.',ranked:'Dereceli maç · Düello Puanını ve ligini etkiler.'
  }:{
    hubSub:'How do you want to play?',local:'SAME PHONE',localSub:'Pass one phone between players.',online:'PLAY A FRIEND',onlineSub:'Create a room and send the 6-digit code.',quick:'QUICK MATCH',quickSub:'Find an online opponent and start automatically.',quickTitle:'QUICK MATCH',quickStart:'FIND OPPONENT',quickSearching:'SEARCHING FOR OPPONENT',quickSearchingSub:'Looking for another Moleculox player online…',quickRules:'Mixed game · Mixed difficulty · 3 rounds · First to 2 wins',quickCancel:'CANCEL SEARCH',quickFound:'Opponent found! Preparing the duel…',quickExpired:'Match search ended. You can try again.',title:'ONLINE ATOM DUEL',name:'YOUR PLAYER NAME',create:'CREATE ROOM',join:'JOIN ROOM',code:'ROOM CODE',hostSettings:'ROOM SETTINGS',waiting:'WAITING FOR OPPONENT',share:'Send this 6-digit code to the other player.',copy:'COPY CODE',copied:'Code copied!',opponentPlaying:'OPPONENT IS PLAYING',yourTurn:'YOUR TURN',syncing:'Sending the result to both phones…',roundReady:'ROUND RESULT',next:'NEXT ROUND',leave:'LEAVE ROOM',closed:'The room was closed.',abandoned:'The other player left the duel.',hostRematch:'START REMATCH',guestRematch:'The match will open automatically if the host starts a rematch.',offline:'An internet connection is required for online duel.',cloudMissing:'Firebase is not ready. Try again in a few seconds.',notFound:'No open room was found with this code.',full:'The room is full or the match has already started.',expired:'This room has expired.',invalidCode:'Enter the 6-digit room code.',error:'Could not connect to the room. Check your internet connection.',retry:'TRY AGAIN',room:'ROOM',friendTurn:'You are watching your opponent in full-screen spectator mode.',liveTitle:'LIVE OPPONENT GAME',liveWaiting:'Preparing the live game…',factTitle:'A QUICK FACT FROM DR. E',messages:'PRESET MESSAGES',messageSent:'Message sent',opponentDisconnected:'Opponent disconnected',reconnectWait:'Waiting for them to return',yourConnectionLost:'Your internet connection was lost',reconnecting:'Reconnecting to the match…',connectionRestored:'Connection restored.',forfeitWin:'Your opponent did not return. You win by forfeit!',forfeitLoss:'The reconnect timer expired. You lose by forfeit.',bothDisconnected:'The match was cancelled because both players disconnected.',forfeitLabel:'WIN BY FORFEIT',seconds:'seconds',unranked:'Friendly match · Does not affect campaign or world ranking.',ranked:'Ranked match · Affects your Duel Points and league.'
  };
}
function onlineDuelErrorText(reason){
  const c=onlineDuelCopy(),r=String(reason||'');
  if(r.includes('not-found'))return c.notFound;
  if(r.includes('full'))return c.full;
  if(r.includes('expired'))return c.expired;
  if(r.includes('invalid-code'))return c.invalidCode;
  if(r.includes('offline')||r.includes('unavailable'))return c.offline;
  return c.error;
}
function preferredDuelName(){
  return String(save.playerName||accountState.displayName||curProfile||'').replace(/[<>]/g,'').trim().slice(0,14)||(LANG==='tr'?'OYUNCU':'PLAYER');
}
function openDuelSetup(){
  const c=duelCopy(),o=onlineDuelCopy();
  openModal('<h3>⚛️ '+c.title+'</h3><div class="msub">'+o.hubSub+'</div><div class="duelModeChoice">'+
    '<button class="duelChoice local" id="mDuelLocal"><span>📱</span><b>'+o.local+'</b><small>'+o.localSub+'</small></button>'+
    '<button class="duelChoice online" id="mDuelOnline"><span>🔐 📱</span><b>'+o.online+'</b><small>'+o.onlineSub+'</small></button>'+
    '<button class="duelChoice quick" id="mDuelQuick"><span>🌐 ⚡</span><b>'+o.quick+'</b><small>'+o.quickSub+'</small></button></div>'+
    '<div class="mrow"><button class="btn ghost" id="mDuelHubCancel">'+c.cancel+'</button></div>');
  bindTap('#mDuelLocal',()=>{SFX.play();openLocalDuelSetup();});
  bindTap('#mDuelOnline',()=>{SFX.play();openOnlineDuelMenu();});
  bindTap('#mDuelQuick',()=>{SFX.play();openQuickMatchSetup();});
  bindTap('#mDuelHubCancel',()=>{SFX.back();closeModal();});
}
function openOnlineDuelMenu(){
  const c=duelCopy(),o=onlineDuelCopy(),name=duelEsc(preferredDuelName());
  if(!navigator.onLine){openModal('<h3>📡 '+o.title+'</h3><div class="onlineDuelNotice error">'+o.offline+'</div><div class="mrow"><button class="btn" id="mOnlineBack">'+c.cancel+'</button></div>');bindTap('#mOnlineBack',()=>openDuelSetup());return;}
  if(!window.MXCloud||!window.MXCloud.createDuelRoom){openModal('<h3>📡 '+o.title+'</h3><div class="onlineDuelNotice error">'+o.cloudMissing+'</div><div class="mrow"><button class="btn" id="mOnlineBack">'+c.cancel+'</button></div>');bindTap('#mOnlineBack',()=>openDuelSetup());return;}
  const opts='<option value="mixed">🎲 '+c.mixed+'</option><option value="medium">⚗️ '+c.medium+'</option><option value="hard">🔥 '+c.hard+'</option>';
  const gameOpts='<option value="classic">⚛️ '+c.classic+'</option><option value="crystal">🧪 '+c.crystal+'</option><option value="chain">⚡ '+c.chain+'</option><option value="reactor">☢️ '+c.reactor+'</option><option value="mixed">🎲 '+c.gameMixed+'</option>';
  openModal('<h3>📡 '+o.title+'</h3><div class="msub">'+o.unranked+'</div>'+
    '<label class="duelLevelLabel">'+o.name+'<input class="onlineDuelInput" id="onlineDuelName" maxlength="14" value="'+name+'"></label>'+
    '<div class="onlineDuelSection"><b>1 · '+o.create+'</b><label class="duelLevelLabel">'+c.game+'<select id="onlineDuelGame">'+gameOpts+'</select></label><label class="duelLevelLabel">'+c.level+'<select id="onlineDuelLevel">'+opts+'</select></label><button class="btn green" id="mOnlineCreate">＋ '+o.create+'</button></div>'+
    '<div class="onlineDuelOr">'+(LANG==='tr'?'VEYA':'OR')+'</div>'+
    '<div class="onlineDuelSection"><b>2 · '+o.join+'</b><label class="duelLevelLabel">'+o.code+'<input class="onlineDuelInput code" id="onlineDuelCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000"></label><button class="btn" id="mOnlineJoin">→ '+o.join+'</button></div>'+
    '<div id="onlineDuelError" class="onlineDuelNotice"></div><div class="mrow"><button class="btn ghost" id="mOnlineCancel">'+c.cancel+'</button></div>');
  const modalBox=$('#modalBox');if(modalBox)modalBox.classList.add('onlineDuelModal');
  const showErr=msg=>{const el=$('#onlineDuelError');if(el){el.textContent=msg||'';el.classList.toggle('error',!!msg);}};
  const working=(btn,on)=>{if(btn){btn.disabled=!!on;btn.classList.toggle('working',!!on);}};
  $('#onlineDuelCode').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,6);});
  $('#mOnlineCreate').addEventListener('pointerdown',async e=>{e.preventDefault();SFX.play();showErr('');const btn=e.currentTarget;working(btn,true);
    const hostName=($('#onlineDuelName').value||preferredDuelName()).trim().slice(0,14)||preferredDuelName();
    const pool=duelPoolFor($('#onlineDuelLevel').value),gameKind=$('#onlineDuelGame').value;
    const rounds=duelMakeRounds(duelBuildLevels(pool),gameKind,pool);
    const res=await window.MXCloud.createDuelRoom({hostName,pool,gameKind,rounds,playerStyle:duelPublicStyle()});working(btn,false);
    if(!res||!res.ok){showErr(onlineDuelErrorText(res&&res.reason));return;}save.playerName=hostName;persist();beginOnlineDuelSession(res.code,res.playerIndex,res.room);
  },{passive:false});
  $('#mOnlineJoin').addEventListener('pointerdown',async e=>{e.preventDefault();SFX.play();showErr('');const btn=e.currentTarget;const code=$('#onlineDuelCode').value.replace(/\D/g,'');if(code.length!==6){showErr(o.invalidCode);return;}working(btn,true);
    const guestName=($('#onlineDuelName').value||preferredDuelName()).trim().slice(0,14)||preferredDuelName();
    const res=await window.MXCloud.joinDuelRoom(code,guestName,duelPublicStyle());working(btn,false);
    if(!res||!res.ok){showErr(onlineDuelErrorText(res&&res.reason));return;}save.playerName=guestName;persist();beginOnlineDuelSession(res.code,res.playerIndex,res.room);
  },{passive:false});
  bindTap('#mOnlineCancel',()=>{SFX.back();openDuelSetup();});
}
function stopQuickMatchLocal(){
  if(!quickMatchSearch)return;
  if(typeof quickMatchSearch.unsubscribe==='function'){try{quickMatchSearch.unsubscribe();}catch(e){}}
  if(quickMatchSearch.timer)clearInterval(quickMatchSearch.timer);
  quickMatchSearch.unsubscribe=null;quickMatchSearch.timer=null;
}
function finishQuickMatchFound(code,playerIndex,ticketId){
  if(!quickMatchSearch||quickMatchSearch.matched)return;
  quickMatchSearch.matched=true;stopQuickMatchLocal();
  const o=onlineDuelCopy();openModal('<h3>🌐 '+o.quickTitle+'</h3><div class="onlineSyncSpinner"></div><div class="msub">'+o.quickFound+'</div>');
  if(window.MXCloud&&window.MXCloud.removeQuickMatchTicket)window.MXCloud.removeQuickMatchTicket(ticketId).catch(()=>{});
  setTimeout(()=>beginOnlineDuelSession(code,playerIndex,null),450);
}
async function attemptQuickMatch(){
  const q=quickMatchSearch;if(!q||q.matched||q.busy)return;q.busy=true;
  try{
    const res=await window.MXCloud.tryQuickMatch(q.ticketId,q.rounds);
    if(!quickMatchSearch||quickMatchSearch!==q)return;
    if(res&&res.ok&&res.status==='matched'&&res.code){finishQuickMatchFound(res.code,res.playerIndex,q.ticketId);return;}
    if(!res||!res.ok){const reason=String(res&&res.reason||'');if(reason.includes('expired')||reason.includes('missing')){stopQuickMatchLocal();if(window.MXCloud&&window.MXCloud.removeQuickMatchTicket)window.MXCloud.removeQuickMatchTicket(q.ticketId).catch(()=>{});quickMatchSearch=null;const o=onlineDuelCopy();openModal('<h3>🌐 '+o.quickTitle+'</h3><div class="onlineDuelNotice error">'+o.quickExpired+'</div><div class="mrow"><button class="btn" id="mQuickAgain">'+o.quickStart+'</button><button class="btn ghost" id="mQuickBack">'+duelCopy().cancel+'</button></div>');bindTap('#mQuickAgain',()=>openQuickMatchSetup());bindTap('#mQuickBack',()=>openDuelSetup());}}
  }finally{if(quickMatchSearch===q)q.busy=false;}
}
function showQuickMatchWaiting(){
  const o=onlineDuelCopy();openModal('<h3>🌐 '+o.quickSearching+'</h3><div class="onlineSyncSpinner"></div><div class="onlineStatusPulse"><i></i><span>'+o.quickSearchingSub+'</span></div><div class="quickMatchRules">'+o.quickRules+'</div><div class="msub">'+o.ranked+'</div><div class="mrow"><button class="btn ghost" id="mQuickCancel">'+o.quickCancel+'</button></div>');
  const modalBox=$('#modalBox');if(modalBox)modalBox.classList.add('onlineDuelModal');
  const b=$('#mQuickCancel');if(b)b.addEventListener('pointerdown',async e=>{e.preventDefault();SFX.back();e.currentTarget.disabled=true;const q=quickMatchSearch;if(!q){openDuelSetup();return;}stopQuickMatchLocal();const res=await window.MXCloud.cancelQuickMatch(q.ticketId);if(res&&res.matched&&res.code){quickMatchSearch=q;finishQuickMatchFound(res.code,res.playerIndex,q.ticketId);return;}quickMatchSearch=null;openDuelSetup();},{passive:false});
}
function beginQuickMatchSearch(ticketId,rounds){
  stopQuickMatchLocal();quickMatchSearch={ticketId,rounds,unsubscribe:null,timer:null,busy:false,matched:false};showQuickMatchWaiting();
  const q=quickMatchSearch;
  q.unsubscribe=window.MXCloud.subscribeQuickMatchTicket(ticketId,data=>{if(!quickMatchSearch||quickMatchSearch!==q||q.matched)return;if(data&&data.status==='matched'&&data.roomCode)finishQuickMatchFound(data.roomCode,data.playerIndex,ticketId);},()=>{});
  q.timer=setInterval(attemptQuickMatch,2400);attemptQuickMatch();
}
function openQuickMatchSetup(){
  const c=duelCopy(),o=onlineDuelCopy(),name=duelEsc(preferredDuelName());
  if(!navigator.onLine){openModal('<h3>🌐 '+o.quickTitle+'</h3><div class="onlineDuelNotice error">'+o.offline+'</div><div class="mrow"><button class="btn" id="mQuickBack">'+c.cancel+'</button></div>');bindTap('#mQuickBack',()=>openDuelSetup());return;}
  if(!window.MXCloud||!window.MXCloud.createQuickMatchTicket){openModal('<h3>🌐 '+o.quickTitle+'</h3><div class="onlineDuelNotice error">'+o.cloudMissing+'</div><div class="mrow"><button class="btn" id="mQuickBack">'+c.cancel+'</button></div>');bindTap('#mQuickBack',()=>openDuelSetup());return;}
  openModal('<h3>🌐 '+o.quickTitle+'</h3><div class="msub">'+o.quickSub+'</div><label class="duelLevelLabel">'+o.name+'<input class="onlineDuelInput" id="quickDuelName" maxlength="14" value="'+name+'"></label><div class="quickMatchRules">'+o.quickRules+'</div><div class="msub">'+o.ranked+'</div><div id="quickMatchError" class="onlineDuelNotice"></div><div class="mrow"><button class="btn green" id="mQuickStart">⚡ '+o.quickStart+'</button><button class="btn ghost" id="mQuickBack">'+c.cancel+'</button></div>');
  const modalBox=$('#modalBox');if(modalBox)modalBox.classList.add('onlineDuelModal');
  const showErr=msg=>{const el=$('#quickMatchError');if(el){el.textContent=msg||'';el.classList.toggle('error',!!msg);}};
  $('#mQuickStart').addEventListener('pointerdown',async e=>{e.preventDefault();SFX.play();showErr('');const btn=e.currentTarget;btn.disabled=true;const playerName=($('#quickDuelName').value||preferredDuelName()).trim().slice(0,14)||preferredDuelName();const pool=duelPoolFor('mixed'),rounds=duelMakeRounds(duelBuildLevels(pool),'mixed',pool);const res=await window.MXCloud.createQuickMatchTicket(playerName,duelPublicStyle());if(!res||!res.ok){btn.disabled=false;showErr(onlineDuelErrorText(res&&res.reason));return;}save.playerName=playerName;persist();beginQuickMatchSearch(res.ticketId,rounds);},{passive:false});
  bindTap('#mQuickBack',()=>{SFX.back();openDuelSetup();});
}


const ONLINE_QUICK_MESSAGES=[
  {key:'hello',tr:'Merhaba! 👋',en:'Hello! 👋'},
  {key:'good_luck',tr:'Bol şans! 🍀',en:'Good luck! 🍀'},
  {key:'nice_move',tr:'Güzel hamle! 👏',en:'Nice move! 👏'},
  {key:'great_reaction',tr:'Harika reaksiyon! ⚛️',en:'Great reaction! ⚛️'},
  {key:'almost_there',tr:'Çok yaklaştın! 🔬',en:'Almost there! 🔬'},
  {key:'brilliant',tr:'Mükemmel! ✨',en:'Brilliant! ✨'},
  {key:'oops',tr:'Eyvah! 😅',en:'Oops! 😅'},
  {key:'well_played',tr:'İyi oynadın! 🏆',en:'Well played! 🏆'},
  {key:'good_game',tr:'İyi oyundu! 🤝',en:'Good game! 🤝'},
  {key:'rematch',tr:'Rövanş? 🔁',en:'Rematch? 🔁'},
  {key:'thanks',tr:'Teşekkürler! 🙌',en:'Thanks! 🙌'}
];
const ONLINE_SCIENCE_FACTS=[
  {catTr:'MOLEKÜL',catEn:'MOLECULE',tr:'Su molekülü iki hidrojen ve bir oksijen atomundan oluşur: H₂O.',en:'A water molecule contains two hydrogen atoms and one oxygen atom: H₂O.'},
  {catTr:'UZAY',catEn:'SPACE',tr:'Güneş’in ışığı Dünya’ya yaklaşık 8 dakika 20 saniyede ulaşır.',en:'Sunlight reaches Earth in about 8 minutes and 20 seconds.'},
  {catTr:'HAYVANLAR',catEn:'ANIMALS',tr:'Ahtapotların üç kalbi vardır.',en:'Octopuses have three hearts.'},
  {catTr:'BİLİM',catEn:'SCIENCE',tr:'Ses boşlukta yayılamaz; ilerlemek için bir maddeye ihtiyaç duyar.',en:'Sound cannot travel through a vacuum; it needs matter to move through.'},
  {catTr:'OYUN İPUCU',catEn:'GAME TIP',tr:'Bir atomu oynatmadan önce duracağı son kareyi düşün.',en:'Before moving an atom, picture the final square where it will stop.'},
  {catTr:'MOLEKÜL',catEn:'MOLECULE',tr:'Karbondioksitin formülü CO₂’dir: bir karbon, iki oksijen.',en:'Carbon dioxide is CO₂: one carbon atom and two oxygen atoms.'},
  {catTr:'UZAY',catEn:'SPACE',tr:'Ay’da atmosfer çok ince olduğu için gökyüzü gündüz bile karanlık görünür.',en:'The Moon’s sky looks dark even in daylight because its atmosphere is extremely thin.'},
  {catTr:'HAYVANLAR',catEn:'ANIMALS',tr:'Arılar dans ederek diğer arılara yiyeceğin yönünü anlatabilir.',en:'Honeybees can use a dance to show other bees the direction of food.'},
  {catTr:'BİLİM',catEn:'SCIENCE',tr:'Bir yıldırımın içindeki hava, Güneş yüzeyinden daha sıcak olabilir.',en:'Air inside a lightning channel can become hotter than the Sun’s surface.'},
  {catTr:'OYUN İPUCU',catEn:'GAME TIP',tr:'Önce kenarlardaki atomları yerleştirmek merkezde alan açabilir.',en:'Positioning edge atoms first can create useful space near the center.'},
  {catTr:'MOLEKÜL',catEn:'MOLECULE',tr:'Oksijen gazı doğada çoğunlukla iki atomlu O₂ molekülü hâlindedir.',en:'Oxygen gas commonly exists as two-atom O₂ molecules.'},
  {catTr:'UZAY',catEn:'SPACE',tr:'Mars’taki bir gün, Dünya gününden yaklaşık 39 dakika daha uzundur.',en:'A day on Mars is about 39 minutes longer than a day on Earth.'},
  {catTr:'HAYVANLAR',catEn:'ANIMALS',tr:'Yunuslar birbirlerini ayırt etmek için imza ıslıklarına benzer sesler kullanır.',en:'Dolphins use distinctive signature-like whistles to identify one another.'},
  {catTr:'BİLİM',catEn:'SCIENCE',tr:'Atomun büyük bölümü boşluktur; kütlenin çoğu küçücük çekirdektedir.',en:'Most of an atom is empty space, while most of its mass is in the tiny nucleus.'},
  {catTr:'OYUN İPUCU',catEn:'GAME TIP',tr:'Sıkıştıysan hedefi değil, bir sonraki iki hamleyi planla.',en:'When stuck, plan the next two moves instead of staring only at the goal.'},
  {catTr:'MOLEKÜL',catEn:'MOLECULE',tr:'Sofra tuzu, sodyum ve klor iyonlarının oluşturduğu NaCl kristalleridir.',en:'Table salt is made of NaCl crystals formed by sodium and chloride ions.'},
  {catTr:'UZAY',catEn:'SPACE',tr:'Jüpiter, Güneş Sistemi’ndeki en büyük gezegendir.',en:'Jupiter is the largest planet in the Solar System.'},
  {catTr:'HAYVANLAR',catEn:'ANIMALS',tr:'Kutup ayılarının derisi koyu renklidir; tüyleri ise ışığı saçan saydam yapılardır.',en:'Polar bears have dark skin; their hairs are translucent structures that scatter light.'},
  {catTr:'BİLİM',catEn:'SCIENCE',tr:'Elmas ve grafit aynı elementten, karbondan oluşur; atom dizilimleri farklıdır.',en:'Diamond and graphite are both carbon, but their atoms are arranged differently.'},
  {catTr:'OYUN İPUCU',catEn:'GAME TIP',tr:'Rakibin çözümünü izlemek yeni bir rota fikri verebilir.',en:'Watching your opponent can reveal a new route through the puzzle.'},
  {catTr:'MOLEKÜL',catEn:'MOLECULE',tr:'Metan CH₄, bir karbon atomuna bağlı dört hidrojen atomu içerir.',en:'Methane, CH₄, contains four hydrogen atoms bonded to one carbon atom.'},
  {catTr:'UZAY',catEn:'SPACE',tr:'Satürn’ün ortalama yoğunluğu sudan düşüktür.',en:'Saturn’s average density is lower than water’s.'},
  {catTr:'HAYVANLAR',catEn:'ANIMALS',tr:'Denizatı türlerinde yavruları taşıyan birey erkektir.',en:'In seahorses, the male carries the developing young.'},
  {catTr:'BİLİM',catEn:'SCIENCE',tr:'Buzun sıvı su üzerinde yüzmesinin nedeni katı hâlinin daha düşük yoğunlukta olmasıdır.',en:'Ice floats because solid water is less dense than liquid water.'},
  {catTr:'OYUN İPUCU',catEn:'GAME TIP',tr:'Her hamleden sonra boşalan koridorları yeniden kontrol et.',en:'After every move, check which corridors have newly opened.'},
  {catTr:'UZAY',catEn:'SPACE',tr:'Venüs kendi ekseni etrafında çoğu gezegenin ters yönünde döner.',en:'Venus rotates in the opposite direction from most planets.'},
  {catTr:'HAYVANLAR',catEn:'ANIMALS',tr:'Kargalar bazı problemleri çözmek için basit araçlar kullanabilir.',en:'Crows can use simple tools to solve some problems.'},
  {catTr:'BİLİM',catEn:'SCIENCE',tr:'Periyodik tabloda elementler atom numaralarına göre sıralanır.',en:'Elements in the periodic table are ordered by atomic number.'},
  {catTr:'MOLEKÜL',catEn:'MOLECULE',tr:'Amonyak NH₃, bir azot ve üç hidrojen atomu içerir.',en:'Ammonia, NH₃, contains one nitrogen atom and three hydrogen atoms.'},
  {catTr:'OYUN İPUCU',catEn:'GAME TIP',tr:'En kısa çözüm her zaman ilk görünen yol değildir.',en:'The shortest solution is not always the first route you notice.'}
];
function onlineQuickMessageText(key){const row=ONLINE_QUICK_MESSAGES.find(x=>x.key===key);return row?(LANG==='tr'?row.tr:row.en):'';}
function onlineQuickMessageButtonsHtml(){const o=onlineDuelCopy();return '<div class="onlineQuickMessages"><b>💬 '+o.messages+'</b><div>'+ONLINE_QUICK_MESSAGES.map(x=>'<button type="button" class="onlineQuickMsgBtn" data-msg="'+x.key+'">'+duelEsc(LANG==='tr'?x.tr:x.en)+'</button>').join('')+'</div></div>';}
function showOnlineMessageToast(text,own=false){if(save.duelMessages===false&&!own)return;let el=$('#onlineMessageToast');if(!el){el=document.createElement('div');el.id='onlineMessageToast';document.body.appendChild(el);}el.textContent=(own?'✓ ':'💬 ')+text;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2400);}
async function sendOnlineQuickMessage(key){if(save.duelMessages===false)return;if(!onlineDuelSession||!window.MXCloud||!window.MXCloud.sendDuelQuickMessage)return;const now=Date.now();if(now-(onlineDuelSession.lastMessageSentAt||0)<1800)return;if(onlineDuelSession.lastMessageKey===key&&now-(onlineDuelSession.lastSameMessageAt||0)<6500)return;onlineDuelSession.lastMessageSentAt=now;onlineDuelSession.lastMessageKey=key;onlineDuelSession.lastSameMessageAt=now;const text=onlineQuickMessageText(key);const res=await window.MXCloud.sendDuelQuickMessage(onlineDuelSession.code,key);if(res&&res.ok)showOnlineMessageToast(text,true);}
function bindOnlineQuickMessageButtons(root=document){root.querySelectorAll('.onlineQuickMsgBtn').forEach(btn=>{if(btn.dataset.bound)return;btn.dataset.bound='1';btn.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();sendOnlineQuickMessage(btn.dataset.msg);},{passive:false});});}
function stopOnlineFactRotation(){if(onlineDuelSession&&onlineDuelSession.factTimer){clearInterval(onlineDuelSession.factTimer);onlineDuelSession.factTimer=null;}}
function updateOnlineFact(){const box=$('#onlineFactText'),cat=$('#onlineFactCat');if(!box||!cat||!onlineDuelSession)return;onlineDuelSession.factIndex=((onlineDuelSession.factIndex||0)+1)%ONLINE_SCIENCE_FACTS.length;const f=ONLINE_SCIENCE_FACTS[onlineDuelSession.factIndex];cat.textContent=LANG==='tr'?f.catTr:f.catEn;box.textContent=LANG==='tr'?f.tr:f.en;}
function startOnlineFactRotation(seed){if(!onlineDuelSession)return;stopOnlineFactRotation();onlineDuelSession.factIndex=Math.abs(Number(seed)||Math.floor(Math.random()*ONLINE_SCIENCE_FACTS.length))%ONLINE_SCIENCE_FACTS.length-1;updateOnlineFact();onlineDuelSession.factTimer=setInterval(updateOnlineFact,6200);}
function onlineFactCardHtml(){const o=onlineDuelCopy();return '<div class="onlineFactCard"><img id="storyHeroArt" src="assets/images/story/chapter-scene-1.webp" alt="Dr. E story scene"><div><b>'+o.factTitle+' · <span id="onlineFactCat"></span></b><p id="onlineFactText"></p></div></div>';}
function onlineLiveBoardHtml(){const o=onlineDuelCopy();return '<div class="onlineSpectatorStage"><div class="onlineLiveHead"><b>⚛️ '+o.liveTitle+'</b><span id="onlineLiveMoves">'+o.liveWaiting+'</span></div><div class="onlineSpectatorCanvasWrap"><canvas id="onlineLiveBoard" width="360" height="450" aria-label="'+o.liveTitle+'"></canvas><div id="onlineMoveDirection" class="onlineMoveDirection"></div></div></div>';}
function onlineLiveAtomColor(symbol){const row=EL&&EL[symbol];return row&&row.c?row.c:'#64d8ff';}
function onlineSpectatorLevel(room){const rounds=Array.isArray(room&&room.rounds)?room.rounds:[],round=rounds[Number(room&&room.round)||0]||{},levelIndex=Math.max(0,Math.min(LEVELS.length-1,Number(round.level)||0));return {round,levelIndex,level:LEVELS[levelIndex]};}
function onlineSpectatorBaseAtoms(room){const info=onlineSpectatorLevel(room),live=room&&room.liveState&&Number(room.liveState.round)===Number(room.round)&&Number(room.liveState.turn)===Number(room.turn)?room.liveState:null;return live&&Array.isArray(live.atoms)&&live.atoms.length?live.atoms.map(a=>({...a})):info.level.a.map(a=>({x:a[0],y:a[1],e:a[2],frozen:!!a[3],fire:!!a[4],sticky:!!a[5],zombie:!!a[6],lightning:!!a[7]}));}
function stopOnlineSpectatorAnimation(){const s=onlineDuelSession;if(s&&s.spectatorRaf){cancelAnimationFrame(s.spectatorRaf);s.spectatorRaf=0;}if(s){s.spectatorAnim=null;s.spectatorRoom=null;s.spectatorAtoms=null;s.spectatorSelected=-1;}}
function onlineSpectatorEase(p){return 1-Math.pow(1-Math.max(0,Math.min(1,p)),3);}
function drawOnlineSpectatorArrow(ctx,cx,cy,scale,d,pulse){const dirs=[[0,-1],[1,0],[0,1],[-1,0]],v=dirs[Math.max(0,Math.min(3,Number(d)||0))],len=scale*(.66+.08*Math.sin(pulse/120));ctx.save();ctx.translate(cx+v[0]*len,cy+v[1]*len);ctx.rotate(Math.atan2(v[1],v[0]));ctx.fillStyle='#ffd23f';ctx.shadowColor='#ffd23f';ctx.shadowBlur=13;ctx.beginPath();ctx.moveTo(scale*.24,0);ctx.lineTo(-scale*.11,-scale*.16);ctx.lineTo(-scale*.11,scale*.16);ctx.closePath();ctx.fill();ctx.restore();}
function drawOnlineSpectatorFrame(now){const s=onlineDuelSession,cv=$('#onlineLiveBoard');if(!s||!cv||!s.spectatorRoom)return;const room=s.spectatorRoom,ctx=cv.getContext('2d'),info=onlineSpectatorLevel(room),level=info.level;if(!level)return;let atomRows=(s.spectatorAtoms&&s.spectatorAtoms.length?s.spectatorAtoms:onlineSpectatorBaseAtoms(room)).map(a=>({...a}));const live=room.liveState&&Number(room.liveState.round)===Number(room.round)&&Number(room.liveState.turn)===Number(room.turn)?room.liveState:null;let selected=s.spectatorSelected|0,anim=s.spectatorAnim,moving=-1,progress=1;if(anim){progress=Math.max(0,Math.min(1,(now-anim.startedAt)/anim.duration));moving=anim.atomIndex;selected=moving;if(atomRows[moving]){const e=onlineSpectatorEase(progress);atomRows[moving].x=anim.fromX+(anim.toX-anim.fromX)*e;atomRows[moving].y=anim.fromY+(anim.toY-anim.fromY)*e;}if(progress>=1){if(s.spectatorAtoms&&s.spectatorAtoms[moving]){s.spectatorAtoms[moving].x=anim.toX;s.spectatorAtoms[moving].y=anim.toY;}s.spectatorAnim=null;anim=null;if(live&&Array.isArray(live.atoms)&&live.atoms.length)s.spectatorAtoms=live.atoms.map(a=>({...a}));setTimeout(()=>{if(onlineDuelSession===s&&!s.spectatorAnim)s.spectatorSelected=-1;},260);}}
  const scale=Math.min(cv.width/W,cv.height/H),ox=(cv.width-W*scale)/2,oy=(cv.height-H*scale)/2;ctx.clearRect(0,0,cv.width,cv.height);const bg=ctx.createLinearGradient(0,0,0,cv.height);bg.addColorStop(0,'#07142b');bg.addColorStop(1,'#030914');ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wall=level.g[y]&&level.g[y][x]==='1';ctx.fillStyle=wall?'rgba(130,145,180,.72)':((x+y)%2?'rgba(255,255,255,.060)':'rgba(255,255,255,.028)');ctx.fillRect(ox+x*scale+1.5,oy+y*scale+1.5,scale-3,scale-3);if(wall){ctx.strokeStyle='rgba(255,255,255,.27)';ctx.lineWidth=1.5;ctx.strokeRect(ox+x*scale+2.5,oy+y*scale+2.5,scale-5,scale-5);}}
  const crystalRows=live&&Array.isArray(live.crystals)?live.crystals:[];crystalRows.filter(c=>!c.collected).forEach(c=>{const cx=ox+(Number(c.x)+.5)*scale,cy=oy+(Number(c.y)+.5)*scale;ctx.save();ctx.fillStyle='rgba(255,220,92,.92)';ctx.shadowColor='#ffd85c';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(cx,cy-scale*.18);ctx.lineTo(cx+scale*.15,cy);ctx.lineTo(cx,cy+scale*.18);ctx.lineTo(cx-scale*.15,cy);ctx.closePath();ctx.fill();ctx.restore();});
  atomRows.forEach((a,i)=>{const cx=ox+(Number(a.x)+.5)*scale,cy=oy+(Number(a.y)+.5)*scale,r=scale*.34,col=onlineLiveAtomColor(a.e);if(i===selected){ctx.save();ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ctx.shadowColor='#ffd23f';ctx.shadowBlur=15;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(cx,cy,r+scale*.11+Math.sin(now/130)*2,0,Math.PI*2);ctx.stroke();ctx.restore();if(anim&&i===moving)drawOnlineSpectatorArrow(ctx,cx,cy,scale,anim.direction,now);}ctx.save();ctx.shadowColor=col;ctx.shadowBlur=i===moving?18:10;ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.restore();ctx.strokeStyle=a.frozen?'#c9f5ff':(a.fire?'#ffb257':(a.lightning?'#8fefff':(a.zombie?'#8cff66':'rgba(255,255,255,.62)')));ctx.lineWidth=a.frozen||a.fire||a.lightning||a.zombie?3:1.6;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 '+Math.max(14,Math.floor(scale*.36))+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(a.e||''),cx,cy+1);});
  const mv=$('#onlineLiveMoves');if(mv){const moveCount=live?Number(live.moves||0):(room.liveMove?Number(room.liveMove.moves||0):0);mv.textContent=(LANG==='tr'?'Hamle ':'Move ')+moveCount+(live&&live.gameType==='chain'?' · x'+Number(live.maxCombo||1):'')+(live&&live.gameType==='reactor'?' · '+reactorImpactLabel(false)+' '+Number(live.hits||0):'');}
  const dir=$('#onlineMoveDirection');if(dir){if(anim){const names=LANG==='tr'?['YUKARI','SAĞ','AŞAĞI','SOL']:['UP','RIGHT','DOWN','LEFT'];dir.textContent='⚡ '+String(atomRows[moving]&&atomRows[moving].e||'')+' · '+names[anim.direction];dir.classList.add('on');}else dir.classList.remove('on');}
  if(s.spectatorAnim){s.spectatorRaf=requestAnimationFrame(drawOnlineSpectatorFrame);}else{s.spectatorRaf=0;}}
function renderOnlineLiveBoard(room){const cv=$('#onlineLiveBoard'),s=onlineDuelSession;if(!cv||!room||!s)return;s.spectatorRoom=room;if(!s.spectatorAtoms||!s.spectatorAtoms.length)s.spectatorAtoms=onlineSpectatorBaseAtoms(room);const move=room.liveMove&&Number(room.liveMove.round)===Number(room.round)&&Number(room.liveMove.turn)===Number(room.turn)?room.liveMove:null;const seq=Math.max(0,Number(move&&move.seq)||0);if(move&&seq>(s.lastMoveSeq||0)){s.lastMoveSeq=seq;const atomIndex=Math.max(0,Math.min((s.spectatorAtoms.length||1)-1,Number(move.atomIndex)||0));if(s.spectatorAtoms[atomIndex]){s.spectatorAtoms[atomIndex].x=Number(move.fromX);s.spectatorAtoms[atomIndex].y=Number(move.fromY);}s.spectatorSelected=atomIndex;s.spectatorAnim={atomIndex,fromX:Number(move.fromX),fromY:Number(move.fromY),toX:Number(move.toX),toY:Number(move.toY),direction:Math.max(0,Math.min(3,Number(move.direction)||0)),duration:Math.max(120,Math.min(1200,Number(move.duration)||320)),startedAt:performance.now()};if(s.spectatorRaf)cancelAnimationFrame(s.spectatorRaf);s.spectatorRaf=requestAnimationFrame(drawOnlineSpectatorFrame);return;}if(!s.spectatorAnim){const incoming=onlineSpectatorBaseAtoms(room);s.spectatorAtoms=incoming.map(a=>({...a}));if(s.spectatorRaf)cancelAnimationFrame(s.spectatorRaf);s.spectatorRaf=requestAnimationFrame(drawOnlineSpectatorFrame);}}
function onlineLivePayload(){if(!duelState||!onlineDuelSession)return null;const round=duelCurrentRound();return {seq:(onlineDuelSession.liveSeq||0)+1,moves,level:lv,gameType:round&&round.gameType||'classic',atoms:atoms.map(a=>({x:a.x,y:a.y,e:a.e,frozen:!!a.frozen,fire:!!a.fire,sticky:!!a.sticky,zombie:!!a.zombie,lightning:!!a.lightning})),crystals:crystalActive()?crystals.map(c=>({x:c.x,y:c.y,type:c.type||'catalyst',collected:!!c.collected})):[],maxCombo:chainActive()?chainMaxCombo:1,reactions:chainActive()?chainReactions:0,hits:reactorActive()?reactorHits:0};}
async function publishOnlineMoveEvent(i,d,from,dest,duration){const s=onlineDuelSession;if(!onlineDuelMode||!s||!duelState||duelState.turn!==s.playerIndex||!window.MXCloud||!window.MXCloud.publishDuelMoveEvent)return;s.moveSeq=(s.moveSeq||0)+1;window.MXCloud.publishDuelMoveEvent(s.code,duelState.round,s.playerIndex,{seq:s.moveSeq,atomIndex:i,fromX:from.x,fromY:from.y,toX:dest.x,toY:dest.y,direction:d,duration:Math.round(duration),moves:moves}).catch(()=>{});}
async function flushOnlineLiveState(){const s=onlineDuelSession;if(!s||s.liveWriteBusy||!s.liveQueued||!window.MXCloud||!window.MXCloud.publishDuelLiveState)return;s.liveWriteBusy=true;const payload=s.liveQueued;s.liveQueued=null;s.liveSeq=payload.seq;try{await window.MXCloud.publishDuelLiveState(s.code,duelState.round,s.playerIndex,payload);}finally{if(onlineDuelSession===s){s.liveWriteBusy=false;if(s.liveQueued)queueOnlineLiveState(true);}}}
function queueOnlineLiveState(force=false){const s=onlineDuelSession;if(!onlineDuelMode||!s||!duelState||duelState.turn!==s.playerIndex||!scr.game.classList.contains('on'))return;const payload=onlineLivePayload();if(!payload)return;const sig=JSON.stringify([payload.moves,payload.atoms.map(a=>[a.x,a.y,a.frozen,a.zombie]),payload.crystals.map(c=>c.collected),payload.maxCombo,payload.hits]);if(!force&&sig===s.lastLiveSignature)return;s.lastLiveSignature=sig;s.liveQueued=payload;const wait=Math.max(0,340-(Date.now()-(s.lastLiveWriteAt||0)));if(wait>0){if(!s.liveFlushTimer)s.liveFlushTimer=setTimeout(()=>{if(onlineDuelSession===s){s.liveFlushTimer=null;s.lastLiveWriteAt=Date.now();flushOnlineLiveState();}},wait);return;}s.lastLiveWriteAt=Date.now();flushOnlineLiveState();}
function ensureOnlineQuickChatButton(){let btn=$('#onlineQuickChatBtn');if(!btn){btn=document.createElement('button');btn.type='button';btn.id='onlineQuickChatBtn';btn.textContent='💬';btn.setAttribute('aria-label',LANG==='tr'?'Hazır mesajlar':'Preset messages');scr.game.appendChild(btn);btn.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();toggleOnlineQuickTray();},{passive:false});}btn.classList.toggle('on',!!(onlineDuelMode&&scr.game.classList.contains('on')));}
function toggleOnlineQuickTray(){let tray=$('#onlineQuickTray');if(tray){tray.remove();return;}tray=document.createElement('div');tray.id='onlineQuickTray';tray.innerHTML='<button type="button" class="onlineQuickTrayClose">×</button>'+onlineQuickMessageButtonsHtml();scr.game.appendChild(tray);tray.querySelector('.onlineQuickTrayClose').addEventListener('pointerdown',e=>{e.preventDefault();tray.remove();},{passive:false});bindOnlineQuickMessageButtons(tray);}
function removeOnlineQuickChat(){const b=$('#onlineQuickChatBtn'),t=$('#onlineQuickTray');if(b)b.classList.remove('on');if(t)t.remove();}


const ONLINE_PRESENCE_STALE_MS=10000;
function onlineTimestampMs(value){if(value&&typeof value.toMillis==='function')return value.toMillis();if(value&&Number.isFinite(Number(value.seconds)))return Number(value.seconds)*1000+Math.floor(Number(value.nanoseconds||0)/1000000);if(value instanceof Date)return value.getTime();return Number(value)||0;}
function onlinePresenceMs(room,index){return onlineTimestampMs(index===0?room&&room.hostPresenceAt:room&&room.guestPresenceAt);}
function onlineDuelConnectionPaused(){return !!(onlineDuelMode&&onlineDuelSession&&onlineDuelSession.connectionBlocked);}
function pauseOnlineDuelClock(){const s=onlineDuelSession;if(!s||s.clockPauseStarted||!scr.game.classList.contains('on'))return;s.clockPauseStarted=performance.now();}
function resumeOnlineDuelClock(){const s=onlineDuelSession;if(!s||!s.clockPauseStarted)return;levelStartT+=Math.max(0,performance.now()-s.clockPauseStarted);s.clockPauseStarted=0;}
function removeOnlineDisconnectOverlay(){const el=$('#onlineDisconnectOverlay');if(el)el.remove();const s=onlineDuelSession;if(s&&s.disconnectUiTimer){clearInterval(s.disconnectUiTimer);s.disconnectUiTimer=null;}}
function updateOnlineDisconnectCountdown(){const s=onlineDuelSession,el=$('#onlineDisconnectCountdown');if(!s||!el||!s.disconnectDeadline)return;const remaining=Math.max(0,Math.ceil((s.disconnectDeadline-Date.now())/1000));el.textContent=String(remaining);if(remaining<=0&&!s.resolvingDisconnect&&window.MXCloud&&window.MXCloud.resolveDuelDisconnect){s.resolvingDisconnect=true;window.MXCloud.resolveDuelDisconnect(s.code).finally(()=>{if(onlineDuelSession===s)s.resolvingDisconnect=false;});}}
function showOnlineDisconnectOverlay(kind,deadlineAt,pauseClock=true){const s=onlineDuelSession;if(!s)return;const o=onlineDuelCopy(),rankNote=s.room&&s.room.matchType==='quick'?o.ranked:o.unranked;s.connectionBlocked=true;if(pauseClock)pauseOnlineDuelClock();const deadline=onlineTimestampMs(deadlineAt);s.disconnectDeadline=deadline||0;let el=$('#onlineDisconnectOverlay');if(!el){el=document.createElement('div');el.id='onlineDisconnectOverlay';document.body.appendChild(el);}if(kind==='opponent'){el.innerHTML='<div class="onlineDisconnectCard"><div class="onlineDisconnectIcon">📡</div><h3>'+o.opponentDisconnected+'</h3><p>'+o.reconnectWait+'</p><div class="onlineDisconnectClock"><b id="onlineDisconnectCountdown">30</b><span>'+o.seconds+'</span></div><small>'+rankNote+'</small></div>';updateOnlineDisconnectCountdown();if(!s.disconnectUiTimer)s.disconnectUiTimer=setInterval(updateOnlineDisconnectCountdown,250);}else{el.innerHTML='<div class="onlineDisconnectCard"><div class="onlineDisconnectIcon">📶</div><h3>'+o.yourConnectionLost+'</h3><p>'+o.reconnecting+'</p><div class="onlineReconnectDots"><i></i><i></i><i></i></div></div>';if(s.disconnectUiTimer){clearInterval(s.disconnectUiTimer);s.disconnectUiTimer=null;}}el.classList.add('on');}
function clearOnlineDisconnectBlock(showToast=false){const s=onlineDuelSession;if(!s)return;const was=s.connectionBlocked;s.connectionBlocked=false;s.disconnectDeadline=0;s.localOffline=false;removeOnlineDisconnectOverlay();resumeOnlineDuelClock();if(showToast&&was)showOnlineMessageToast(onlineDuelCopy().connectionRestored,true);}
async function sendOnlineHeartbeat(){const s=onlineDuelSession;if(!s||s.heartbeatBusy||!navigator.onLine||!window.MXCloud||!window.MXCloud.heartbeatDuelRoom)return;s.heartbeatBusy=true;try{await window.MXCloud.heartbeatDuelRoom(s.code);}finally{if(onlineDuelSession===s)s.heartbeatBusy=false;}}
function stopOnlinePresenceLoop(){const s=onlineDuelSession;if(!s)return;if(s.heartbeatTimer){clearInterval(s.heartbeatTimer);s.heartbeatTimer=null;}if(s.onlineHandler)window.removeEventListener('online',s.onlineHandler);if(s.offlineHandler)window.removeEventListener('offline',s.offlineHandler);if(s.visibilityHandler)document.removeEventListener('visibilitychange',s.visibilityHandler);s.onlineHandler=s.offlineHandler=s.visibilityHandler=null;removeOnlineDisconnectOverlay();resumeOnlineDuelClock();}
function startOnlinePresenceLoop(){const s=onlineDuelSession;if(!s||s.presenceStarted)return;s.presenceStarted=true;s.onlineHandler=()=>{if(onlineDuelSession!==s)return;s.localOffline=false;const check=window.MXCloud&&window.MXCloud.resolveDuelDisconnect?window.MXCloud.resolveDuelDisconnect(s.code):Promise.resolve();Promise.resolve(check).finally(()=>{if(onlineDuelSession===s)sendOnlineHeartbeat();});};s.offlineHandler=()=>{if(onlineDuelSession!==s)return;s.localOffline=true;showOnlineDisconnectOverlay('self',null,false);};s.visibilityHandler=()=>{if(onlineDuelSession!==s)return;if(document.visibilityState==='visible'&&navigator.onLine)sendOnlineHeartbeat();};window.addEventListener('online',s.onlineHandler);window.addEventListener('offline',s.offlineHandler);document.addEventListener('visibilitychange',s.visibilityHandler);sendOnlineHeartbeat();s.heartbeatTimer=setInterval(sendOnlineHeartbeat,4500);if(!navigator.onLine)s.offlineHandler();}
function bootOnlinePresence(room){const s=onlineDuelSession;if(!s||s.presenceStarted||s.presenceBooting)return;s.presenceBooting=true;const deadline=onlineTimestampMs(room&&room.disconnectState&&room.disconnectState.deadlineAt);const shouldResolve=window.MXCloud&&window.MXCloud.resolveDuelDisconnect;const task=shouldResolve?window.MXCloud.resolveDuelDisconnect(s.code):Promise.resolve();Promise.resolve(task).finally(()=>{if(onlineDuelSession===s){s.presenceBooting=false;startOnlinePresenceLoop();}});}
function applyOnlineRemotePause(disconnectState){const s=onlineDuelSession;if(!s||!disconnectState)return;const key=String(onlineTimestampMs(disconnectState.startedAt))+'-'+String(disconnectState.playerIndex);if(s.remotePauseKey===key)return;s.remotePauseKey=key;const started=onlineTimestampMs(disconnectState.startedAt);if(started&&scr.game.classList.contains('on'))levelStartT+=Math.max(0,Date.now()-started);}
function handleOnlineDisconnectState(room){const s=onlineDuelSession;if(!s)return false;if(s.localOffline||!navigator.onLine){showOnlineDisconnectOverlay('self');return true;}if(!['playing','round_result'].includes(room.status)){clearOnlineDisconnectBlock(false);return false;}const idx=s.playerIndex,opp=1-idx,ds=room.disconnectState||null;if(ds){const target=Number(ds.playerIndex)===1?1:0;if(target===idx){applyOnlineRemotePause(ds);showOnlineDisconnectOverlay('self');if(!s.presenceBooting)sendOnlineHeartbeat();return true;}showOnlineDisconnectOverlay('opponent',ds.deadlineAt);return true;}clearOnlineDisconnectBlock(false);const opponentSeen=onlinePresenceMs(room,opp),ownSeen=onlinePresenceMs(room,idx),now=Date.now();const opponentStale=!opponentSeen||now-opponentSeen>=ONLINE_PRESENCE_STALE_MS;const ownFresh=!!ownSeen&&now-ownSeen<ONLINE_PRESENCE_STALE_MS*2;if(opponentStale&&ownFresh&&!s.requestingDisconnect&&window.MXCloud&&window.MXCloud.startDuelDisconnectCountdown){s.requestingDisconnect=true;window.MXCloud.startDuelDisconnectCountdown(s.code,opp).finally(()=>{if(onlineDuelSession===s)s.requestingDisconnect=false;});}return false;}

function onlineRoomToDuelState(room){
  return {players:Array.isArray(room.playerNames)?room.playerNames.slice(0,2):['Player 1','Player 2'],playerStyles:Array.isArray(room.playerStyles)?room.playerStyles.slice(0,2):[null,null],pool:room.pool||duelPoolFor('mixed'),gameKind:room.gameKind||'classic',round:Number(room.round)||0,turn:Number(room.turn)||0,wins:Array.isArray(room.wins)?room.wins.slice(0,2):[0,0],turnFinished:false,rounds:JSON.parse(JSON.stringify(room.rounds||[]))};
}
function stopOnlineDuelListener(){
  stopOnlinePresenceLoop();stopOnlineFactRotation();stopOnlineSpectatorAnimation();removeOnlineQuickChat();if(onlineDuelSession&&onlineDuelSession.liveFlushTimer){clearTimeout(onlineDuelSession.liveFlushTimer);onlineDuelSession.liveFlushTimer=null;}
  if(onlineDuelSession&&typeof onlineDuelSession.unsubscribe==='function'){try{onlineDuelSession.unsubscribe();}catch(e){}}
  if(onlineDuelSession)onlineDuelSession.unsubscribe=null;
}
function beginOnlineDuelSession(code,playerIndex,initialRoom){
  stopQuickMatchLocal();quickMatchSearch=null;stopOnlineDuelListener();onlineDuelMode=true;duelMode=false;
  onlineDuelSession={code:String(code),playerIndex:Number(playerIndex)||0,room:null,unsubscribe:null,lastUiKey:'',activeTurnKey:'',pendingResult:false,pendingPayload:null,factTimer:null,factIndex:0,lastSeenMessageSeq:0,lastMessageSentAt:0,liveSeq:0,moveSeq:0,lastMoveSeq:0,liveWriteBusy:false,liveQueued:null,liveFlushTimer:null,lastLiveWriteAt:0,lastLiveSignature:'',spectatorRoom:null,spectatorAtoms:null,spectatorAnim:null,spectatorRaf:0,spectatorSelected:-1,presenceStarted:false,presenceBooting:false,heartbeatTimer:null,heartbeatBusy:false,requestingDisconnect:false,resolvingDisconnect:false,connectionBlocked:false,localOffline:false,disconnectDeadline:0,disconnectUiTimer:null,clockPauseStarted:0,onlineHandler:null,offlineHandler:null,visibilityHandler:null,remotePauseKey:''};
  onlineDuelSession.unsubscribe=window.MXCloud.subscribeDuelRoom(code,syncOnlineDuelRoom,()=>showOnlineDuelConnectionError());
  if(initialRoom)syncOnlineDuelRoom(Object.assign({id:String(code)},initialRoom));
}
function onlineRoomCodeHtml(code){return '<div class="onlineRoomCode" aria-label="Room code">'+String(code||'').split('').map(x=>'<span>'+x+'</span>').join('')+'</div>';}
function bindOnlineLeaveButton(id,notify=true){const b=$(id);if(b)b.addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();exitOnlineDuel(notify);},{passive:false});}
function showOnlineWaitingRoom(room){
  if(!onlineDuelSession)return;const o=onlineDuelCopy(),key='waiting-'+room.code;if(onlineDuelSession.lastUiKey===key)return;onlineDuelSession.lastUiKey=key;
  openModal('<h3>📡 '+o.waiting+'</h3><div class="onlineStatusPulse"><i></i><span>'+o.share+'</span></div>'+onlineRoomCodeHtml(room.code)+
    '<div class="msub">'+o.unranked+'</div>'+onlineQuickMessageButtonsHtml()+'<div class="mrow"><button class="btn green" id="mCopyRoomCode">📋 '+o.copy+'</button><button class="btn ghost" id="mOnlineLeave">'+o.leave+'</button></div>');
  bindTap('#mCopyRoomCode',async()=>{SFX.click();try{await navigator.clipboard.writeText(String(room.code));const b=$('#mCopyRoomCode');if(b)b.textContent='✓ '+o.copied;}catch(e){}});
  bindOnlineQuickMessageButtons($('#modalBox'));bindOnlineLeaveButton('#mOnlineLeave',true);
}
function showOnlineOpponentTurn(room){
  if(!onlineDuelSession)return;const o=onlineDuelCopy(),idx=onlineDuelSession.playerIndex,opp=1-idx,key='opp-'+room.round+'-'+room.turn+'-'+room.status;
  if(onlineDuelSession.lastUiKey!==key){onlineDuelSession.lastUiKey=key;stopOnlineSpectatorAnimation();onlineDuelSession.lastMoveSeq=Math.max(0,Number(room.liveMove&&room.liveMove.seq)||0)-1;removeOnlineQuickChat();openModal('<div class="onlineSpectatorTop"><div><b>⏳ '+o.opponentPlaying+'</b><span>'+duelCopy().round+' '+(Number(room.round)+1)+' / '+DUEL_MAX_ROUNDS+' · '+o.room+' '+room.code+'</span></div><div class="onlineOpponentBadge">'+(opp===0?'🔴 ':'🔵 ')+duelEsc(room.playerNames[opp])+'</div></div>'+duelScoreHtml()+onlineLiveBoardHtml()+'<div class="onlineStatusPulse compact"><i></i><span>'+o.friendTurn+'</span></div><div class="onlineSpectatorBottom">'+onlineFactCardHtml()+onlineQuickMessageButtonsHtml()+'<button class="btn ghost onlineSpectatorLeave" id="mOnlineLeave">'+o.leave+'</button></div>');const modalBox=$('#modalBox');if(modalBox)modalBox.classList.add('onlineDuelModal','onlineSpectatorModal');bindOnlineQuickMessageButtons(modalBox);bindOnlineLeaveButton('#mOnlineLeave',true);startOnlineFactRotation(Number(room.round)*7+opp);}
  renderOnlineLiveBoard(room);
}
function showOnlineRoundResult(room){
  if(!onlineDuelSession)return;const key='round-result-'+room.round+'-'+(Array.isArray(room.wins)?room.wins.join('-'):'0-0');if(onlineDuelSession.lastUiKey===key)return;onlineDuelSession.lastUiKey=key;
  const c=duelCopy(),o=onlineDuelCopy(),round=duelCurrentRound(),a=round&&round.results[0],b=round&&round.results[1],winner=round?round.winner:-1;
  const headline=winner<0?c.roundDraw:'🏆 '+duelEsc(duelState.players[winner])+' '+c.roundWinner;
  openModal('<h3>'+o.roundReady+' · '+c.round+' '+(duelState.round+1)+'</h3><div class="duelWinner">'+headline+'</div>'+duelScoreHtml()+
    '<div class="duelStats"><div class="duelStat red"><b>🔴 '+duelEsc(duelState.players[0])+'</b><span>'+duelResultText(a,c,round.gameType)+'</span></div><div class="duelStat blue"><b>🔵 '+duelEsc(duelState.players[1])+'</b><span>'+duelResultText(b,c,round.gameType)+'</span></div></div>'+ 
    onlineQuickMessageButtonsHtml()+'<div class="mrow"><button class="btn green" id="mOnlineNext">'+o.next+'</button><button class="btn ghost" id="mOnlineLeave">'+o.leave+'</button></div>');
  $('#mOnlineNext').addEventListener('pointerdown',async e=>{e.preventDefault();SFX.play();e.currentTarget.disabled=true;const res=await window.MXCloud.advanceDuelRound(onlineDuelSession.code,duelState.round);if(!res||!res.ok)e.currentTarget.disabled=false;},{passive:false});
  bindOnlineQuickMessageButtons($('#modalBox'));bindOnlineLeaveButton('#mOnlineLeave',true);
}
function duelFinalConfettiHtml(){
  const colors=['#ffd54f','#48d9ff','#ff5ea8','#7df56d','#b778ff','#ff8a3d'];
  let html='<div class="duelFinalConfetti" aria-hidden="true">';
  for(let i=0;i<42;i++){
    const left=(i*37+11)%100,delay=((i*13)%23)/10,dur=2.4+((i*17)%14)/10,rot=(i*71)%360,size=5+((i*7)%7),drift=((i*29)%81)-40;
    html+='<i style="--cf-x:'+left+'%;--cf-delay:'+delay+'s;--cf-dur:'+dur+'s;--cf-rot:'+rot+'deg;--cf-size:'+size+'px;--cf-drift:'+drift+'px;--cf-color:'+colors[i%colors.length]+'"></i>';
  }
  return html+'</div>';
}
function duelFinalPresentationCopy(kind,winnerName){
  const tr=LANG==='tr';
  if(kind==='win')return {title:tr?'KAZANDIN!':'YOU WON!',message:tr?'Harika iş! Molekül ustası sensin!':'Great job! You are a molecule master!',badge:tr?'ZAFER':'VICTORY'};
  if(kind==='loss')return {title:tr?'KAYBETTİN':'YOU LOST',message:tr?'Çok yakındın! Rövanş ister misin?':'So close! Want a rematch?',badge:tr?'YENİDEN DENE':'TRY AGAIN'};
  if(kind==='draw')return {title:tr?'BERABERE!':'DRAW!',message:tr?'Harika mücadele! Rövanşa ne dersin?':'Great match! How about a rematch?',badge:tr?'BERABERLİK':'DRAW'};
  return {title:(winnerName||'')+' '+(tr?'KAZANDI!':'WINS!'),message:tr?'Muhteşem düello! Bir rövanş daha?':'Brilliant duel! One more rematch?',badge:tr?'KAZANAN':'WINNER'};
}
function duelFinalResultScreenHtml(winner,viewerIndex,opts={}){
  const isDraw=winner<0;
  const kind=isDraw?'draw':(viewerIndex==null?'local':(viewerIndex===winner?'win':'loss'));
  const winnerName=!isDraw&&duelState&&duelState.players?duelState.players[winner]:'';
  const cp=duelFinalPresentationCopy(kind,winnerName);
  const emblem=kind==='loss'?'<div class="duelDefeatCoin"><span>⚛</span><i></i></div>':(kind==='draw'?'<div class="duelDrawEmblem"><span>⚛</span><b>＝</b></div>':'<div class="duelVictoryCup"><span>🏆</span><b>⚛</b></div>');
  const confetti=(kind==='win'||kind==='local')?duelFinalConfettiHtml():'';
  const scientistClass=(kind==='loss'?'support':(kind==='draw'?'draw':'cheer'));
  const scoreLabel=LANG==='tr'?'MAÇ SKORU · SONUÇ':'MATCH SCORE · RESULT';
  const forfeitBadge=opts.forfeit?'<div class="duelForfeitBadge">'+duelEsc(onlineDuelCopy().forfeitLabel)+'</div>':'';
  return '<div class="duelFinalScene '+kind+'">'+confetti+
    '<div class="duelFinalBrand"><span>⚛</span> MOLECULOX</div>'+forfeitBadge+
    '<div class="duelFinalHeadline">'+duelEsc(cp.title)+'</div>'+emblem+
    '<div class="duelFinalScoreCard"><div class="duelFinalScoreLabel">'+scoreLabel+'</div>'+duelScoreHtml()+duelRoundHistoryHtml()+'</div>'+ 
    '<div class="duelFinalScientist '+scientistClass+'"><img src="assets/images/einstein.webp" alt="Dr. E"><div class="duelFinalBubble"><b>'+duelEsc(cp.message)+'</b><span>'+duelEsc(cp.badge)+'</span></div></div>'+ 
    (opts.subtext?'<div class="duelFinalSubtext">'+duelEsc(opts.subtext)+'</div>':'')+
  '</div>';
}
function activateDuelFinalPresentation(kind){
  const box=$('#modalBox');if(!box)return;
  box.classList.add('duelFinalModal','duelFinal-'+kind);
  requestAnimationFrame(()=>box.classList.add('duelFinalReady'));
  setTimeout(()=>{if(kind==='win'||kind==='local')SFX.duelVictory();else if(kind==='loss')SFX.duelDefeat();else SFX.duelDraw();},120);
}

function duelRoomEpochSeconds(room){const raw=room&&(room.createdAt||room.updatedAt);if(raw&&typeof raw.toMillis==='function')return Math.floor(raw.toMillis()/1000);if(raw&&typeof raw.seconds==='number')return Math.floor(raw.seconds);const d=raw instanceof Date?raw:new Date(raw||Date.now());const ms=d.getTime();return Number.isFinite(ms)?Math.floor(ms/1000):Math.floor(Date.now()/1000);}
function processOnlineDuelRank(room,winner){
  if(!room||room.matchType!=='quick'||!onlineDuelSession)return null;ensureDuelRankState(save);const matchNo=Math.max(1,Math.floor(Number(room.matchNo)||1)),roomEpoch=duelRoomEpochSeconds(room),key=String(room.code||onlineDuelSession.code)+'_'+roomEpoch+'_'+matchNo;if(save.duelRatedMatches[key])return onlineDuelSession.lastRankResult&&onlineDuelSession.lastRankResult.key===key?onlineDuelSession.lastRankResult:null;
  const me=onlineDuelSession.playerIndex,outcome=winner<0?3:(winner===me?1:2),old=save.duelRating,oldRewards=new Set(Object.keys(save.duelRewards||{}));save.duelRatedMatches[key]=roomEpoch*10+outcome;ensureDuelRankState(save);const result={key,outcome,old,rating:save.duelRating,delta:save.duelRating-old,league:duelLeagueForRating(save.duelRating),newRewards:Object.keys(save.duelRewards||{}).filter(k=>!oldRewards.has(k))};onlineDuelSession.lastRankResult=result;persist();try{const acc=window.MXCloud&&window.MXCloud.account;if(acc&&!acc.isAnonymous&&window.MXCloud.syncDuelLeaderboard)window.MXCloud.syncDuelLeaderboard(save,save.profileId,true);}catch(e){}return result;
}
function duelRankResultHtml(r){if(!r)return '';const sign=r.delta>0?'+':'',cls=r.delta<0?'loss':'gain';return '<div class="duelRatedResult"><div><b>⚔️ '+(LANG==='tr'?'DERECELİ DÜELLO':'RANKED DUEL')+'</b><small>'+r.league.icon+' '+duelLeagueName(r.league)+(r.newRewards&&r.newRewards.length?' · 🎁 '+(LANG==='tr'?'Yeni ödül':'New reward'):'')+'</small></div><strong class="'+cls+'">'+sign+r.delta+' · '+r.rating+' DP</strong></div>';}
function showOnlineFinalResult(room){
  if(!onlineDuelSession)return;const key='finished-'+(Array.isArray(room.wins)?room.wins.join('-'):'0-0')+'-'+String(room.finishReason||'normal');if(onlineDuelSession.lastUiKey===key)return;onlineDuelSession.lastUiKey=key;
  const c=duelCopy(),o=onlineDuelCopy();let winner=-1;if(duelState.wins[0]>duelState.wins[1])winner=0;else if(duelState.wins[1]>duelState.wins[0])winner=1;
  const forfeit=room.finishReason==='disconnect'&&Number.isInteger(Number(room.forfeitWinner));if(forfeit)winner=Number(room.forfeitWinner);const host=onlineDuelSession.playerIndex===0;
  const kind=winner<0?'draw':(onlineDuelSession.playerIndex===winner?'win':'loss');
  const rankResult=processOnlineDuelRank(room,winner);
  const subtext=forfeit?(onlineDuelSession.playerIndex===winner?o.forfeitWin:o.forfeitLoss):(room.matchType==='quick'?(LANG==='tr'?'Dereceli Hızlı Eşleşme tamamlandı.':'Ranked Quick Match completed.'):(host?o.unranked:o.guestRematch));
  const actionHtml='<div class="mrow duelFinalActions '+(host?'':'guest')+'">'+
    (host?'<button class="btn blue" id="mOnlineRematch">↻ '+o.hostRematch+'</button>':'<button class="btn blue" id="mOnlineRematchRequest">💬 '+c.rematch+'</button>')+
    '<button class="btn green" id="mOnlineMenu">⌂ '+c.menu+'</button></div>';
  openModal(duelFinalResultScreenHtml(winner,onlineDuelSession.playerIndex,{forfeit,subtext})+duelRankResultHtml(rankResult)+onlineQuickMessageButtonsHtml()+actionHtml);
  activateDuelFinalPresentation(kind);
  const rematch=$('#mOnlineRematch');if(rematch)rematch.addEventListener('pointerdown',async e=>{e.preventDefault();SFX.play();e.currentTarget.disabled=true;const pool=duelState.pool||duelPoolFor('mixed'),rounds=duelMakeRounds(duelBuildLevels(pool),duelState.gameKind||'classic',pool);const res=await window.MXCloud.rematchDuelRoom(onlineDuelSession.code,rounds);if(!res||!res.ok)e.currentTarget.disabled=false;},{passive:false});
  const request=$('#mOnlineRematchRequest');if(request)request.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();sendOnlineQuickMessage('rematch');e.currentTarget.disabled=true;setTimeout(()=>{if(e.currentTarget)e.currentTarget.disabled=false;},1800);},{passive:false});
  bindOnlineQuickMessageButtons($('#modalBox'));bindTap('#mOnlineMenu',()=>{SFX.click();exitOnlineDuel(false);});
}
function showOnlineDuelConnectionError(){
  if(!onlineDuelSession)return;const o=onlineDuelCopy();openModal('<h3>📡 '+o.title+'</h3><div class="onlineDuelNotice error">'+o.error+'</div><div class="mrow"><button class="btn ghost" id="mOnlineLeave">'+o.leave+'</button></div>');bindOnlineLeaveButton('#mOnlineLeave',false);
}
function syncOnlineDuelRoom(room){
  if(!onlineDuelMode||!onlineDuelSession)return;
  if(!room){const o=onlineDuelCopy();stopOnlineDuelListener();onlineDuelMode=false;onlineDuelSession=null;resetDuelUi();openModal('<h3>📡 '+o.closed+'</h3><div class="mrow"><button class="btn" id="mClosedOk">OK</button></div>');bindTap('#mClosedOk',()=>{closeModal();show('splash');});return;}
  const incoming=room.lastQuickMessage||null,seq=Math.max(0,Number(incoming&&incoming.seq)||0);if(!onlineDuelSession.room){onlineDuelSession.lastSeenMessageSeq=seq;}else if(seq>onlineDuelSession.lastSeenMessageSeq){onlineDuelSession.lastSeenMessageSeq=seq;if(incoming&&Number(incoming.playerIndex)!==onlineDuelSession.playerIndex){const txt=onlineQuickMessageText(incoming.key);if(txt)showOnlineMessageToast((room.playerNames&&room.playerNames[incoming.playerIndex]?room.playerNames[incoming.playerIndex]+': ':'')+txt,false);}}
  onlineDuelSession.room=room;duelState=onlineRoomToDuelState(room);onlineDuelMode=true;bootOnlinePresence(room);
  if(room.status==='waiting'){show('splash');showOnlineWaitingRoom(room);return;}
  if(room.status==='cancelled'){const o=onlineDuelCopy();stopOnlineDuelListener();onlineDuelMode=false;onlineDuelSession=null;resetDuelUi();openModal('<h3>📡 '+o.bothDisconnected+'</h3><div class="mrow"><button class="btn" id="mCancelledOk">OK</button></div>');bindTap('#mCancelledOk',()=>{closeModal();show('splash');});return;}
  if(room.status==='abandoned'){const o=onlineDuelCopy();stopOnlineDuelListener();onlineDuelMode=false;onlineDuelSession=null;resetDuelUi();openModal('<h3>📡 '+o.abandoned+'</h3><div class="mrow"><button class="btn" id="mAbandonedOk">OK</button></div>');bindTap('#mAbandonedOk',()=>{closeModal();show('splash');});return;}
  if(handleOnlineDisconnectState(room))return;
  if(room.status==='round_result'){stopOnlineFactRotation();removeOnlineQuickChat();showOnlineRoundResult(room);return;}
  if(room.status==='finished'){stopOnlineFactRotation();removeOnlineQuickChat();showOnlineFinalResult(room);return;}
  if(room.status==='playing'){
    const idx=onlineDuelSession.playerIndex,turn=Number(room.turn)||0,key='turn-'+room.round+'-'+turn;
    if(turn===idx){if(onlineDuelSession.activeTurnKey===key&&scr.game.classList.contains('on')){ensureOnlineQuickChatButton();return;}stopOnlineFactRotation();onlineDuelSession.activeTurnKey=key;onlineDuelSession.lastUiKey='';onlineDuelSession.pendingResult=false;onlineDuelSession.liveSeq=Math.max(0,Number(room.liveState&&room.liveState.seq)||0);onlineDuelSession.moveSeq=Math.max(0,Number(room.liveMove&&room.liveMove.seq)||0);onlineDuelSession.lastLiveSignature='';stopOnlineSpectatorAnimation();closeModal();startDuelTurn(idx);ensureOnlineQuickChatButton();setTimeout(()=>queueOnlineLiveState(true),120);}
    else{onlineDuelSession.activeTurnKey='';removeOnlineQuickChat();showOnlineOpponentTurn(room);}return;
  }
}
async function exitOnlineDuel(notify){
  const session=onlineDuelSession;stopOnlineDuelListener();onlineDuelMode=false;onlineDuelSession=null;
  if(notify&&session&&window.MXCloud&&window.MXCloud.leaveDuelRoom)window.MXCloud.leaveDuelRoom(session.code).catch(()=>{});
  resetDuelUi();closeModal();show('splash');
}
function finishOnlineDuelTurn(elapsedSeconds,completed){
  if(!onlineDuelSession||onlineDuelSession.pendingResult||!duelState)return;
  onlineDuelSession.pendingResult=true;duelState.turnFinished=true;
  const o=onlineDuelCopy(),c=duelCopy(),turn=onlineDuelSession.playerIndex,safeTime=completed?Math.min(DUEL_TIME_LIMIT,Math.max(0,elapsedSeconds)):DUEL_TIME_LIMIT;
  const payload={time:safeTime,moves,completed:!!completed,maxCombo:chainMode?chainMaxCombo:1,reactions:chainMode?chainReactions:0,autoMoves:chainMode?chainAutoMoves:0,hits:reactorMode?reactorHits:0,penalty:reactorMode?reactorPenalty:0};onlineDuelSession.pendingPayload=payload;
  const delay=completed?1800:500;
  setTimeout(async()=>{if(!onlineDuelSession)return;openModal('<h3>'+(completed?c.turnDone:c.timeUp)+'</h3><div class="onlineSyncSpinner"></div><div class="msub">'+o.syncing+'</div>');
    const res=await window.MXCloud.submitDuelTurn(onlineDuelSession.code,duelState.round,turn,payload);
    if(!onlineDuelSession)return;if(!res||!res.ok){onlineDuelSession.pendingResult=false;openModal('<h3>📡 '+o.title+'</h3><div class="onlineDuelNotice error">'+onlineDuelErrorText(res&&res.reason)+'</div><div class="mrow"><button class="btn green" id="mOnlineRetry">'+o.retry+'</button><button class="btn ghost" id="mOnlineLeave">'+o.leave+'</button></div>');
      $('#mOnlineRetry').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();onlineDuelSession.pendingResult=false;finishOnlineDuelTurn(payload.time,payload.completed);},{passive:false});bindOnlineLeaveButton('#mOnlineLeave',true);}
  },delay);
}
function openLocalDuelSetup(){
  const c=duelCopy();
  const opts='<option value="mixed">🎲 '+c.mixed+'</option><option value="medium">⚗️ '+c.medium+'</option><option value="hard">🔥 '+c.hard+'</option>';
  const gameOpts='<option value="classic">⚛️ '+c.classic+'</option><option value="crystal">🧪 '+c.crystal+'</option><option value="chain">⚡ '+c.chain+'</option><option value="reactor">☢️ '+c.reactor+'</option><option value="mixed">🎲 '+c.gameMixed+'</option>';
  openModal('<h3>⚛️ '+c.title+'</h3><div class="msub">'+c.sub+'</div>'+ 
    '<div class="duelTypePreview" id="duelTypePreview">'+duelSelectedBadgeHtml('classic')+'</div>'+ 
    '<div class="duelSetupGrid"><label>'+c.p1+'<input id="duelName1" maxlength="14" value="'+c.p1+'"></label><label>'+c.p2+'<input id="duelName2" maxlength="14" value="'+c.p2+'"></label></div>'+ 
    '<label class="duelLevelLabel">'+c.game+'<select id="duelGameSelect">'+gameOpts+'</select></label>'+ 
    '<label class="duelLevelLabel">'+c.level+'<select id="duelLevelSelect">'+opts+'</select></label>'+ 
    '<div class="duelRules">⏱️ 90 sn · 🏁 3 raund · 🏆 İlk 2 galibiyet<br>'+c.rules+'</div><div class="mrow"><button class="btn green" id="mDuelStart">'+c.start+'</button><button class="btn ghost" id="mDuelCancel">'+c.cancel+'</button></div>');
  const duelGameSelect=$('#duelGameSelect');
  const duelTypePreview=$('#duelTypePreview');
  const refreshDuelPreview=()=>{ if(duelTypePreview&&duelGameSelect)duelTypePreview.innerHTML=duelSelectedBadgeHtml(duelGameSelect.value); };
  if(duelGameSelect){ duelGameSelect.addEventListener('change',refreshDuelPreview); refreshDuelPreview(); }
  $('#mDuelStart').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();
    const n1=($('#duelName1').value||c.p1).trim().slice(0,14)||c.p1;
    const n2=($('#duelName2').value||c.p2).trim().slice(0,14)||c.p2;
    const pool=duelPoolFor($('#duelLevelSelect').value),gameKind=$('#duelGameSelect').value;
    const levels=duelBuildLevels(pool);
    duelState={players:[n1,n2],pool,gameKind,round:0,turn:0,wins:[0,0],turnFinished:false,rounds:duelMakeRounds(levels,gameKind,pool)};
    startDuelTurn(0);
  },{passive:false});
  bindTap('#mDuelCancel',e=>{SFX.back();closeModal();});
}
function startDuelTurn(turn){
  const round=duelCurrentRound();if(!duelState||!round)return;
  if(onlineDuelMode&&onlineDuelSession&&turn!==onlineDuelSession.playerIndex)return;
  duelState.turn=turn;duelState.turnFinished=false;duelMode=true;startLevel(round.level,'duel');
}
function finishDuelTurn(elapsedSeconds,completed=true){
  if(onlineDuelMode){finishOnlineDuelTurn(elapsedSeconds,completed);return;}
  if(!duelState||duelState.turnFinished)return;
  duelState.turnFinished=true;
  const c=duelCopy(),turn=duelState.turn,round=duelCurrentRound();
  const safeTime=completed?Math.min(DUEL_TIME_LIMIT,Math.max(0,elapsedSeconds)):DUEL_TIME_LIMIT;
  round.results[turn]={time:safeTime,moves,completed:!!completed,maxCombo:chainMode?chainMaxCombo:1,reactions:chainMode?chainReactions:0,autoMoves:chainMode?chainAutoMoves:0,hits:reactorMode?reactorHits:0,penalty:reactorMode?reactorPenalty:0};
  const player=duelEsc(duelState.players[turn]),res=round.results[turn];
  const delay=completed?2450:650;
  setTimeout(()=>{
    if(!duelState)return;
    if(turn===0){
      openModal('<h3>'+(completed?c.turnDone:c.timeUp)+'</h3><div class="duelRoundLabel">'+c.round+' '+(duelState.round+1)+' / '+DUEL_MAX_ROUNDS+'</div><div class="duelTurnBadge">🔴 '+player+'</div>'+ 
        '<div class="duelStats"><div class="duelStat red"><b>'+c.time+'</b><span>'+duelFormatTime(res.time)+'</span></div><div class="duelStat red"><b>'+c.moves+'</b><span>'+res.moves+'</span></div></div>'+ 
        duelScoreHtml()+'<div class="msub">'+c.pass+'</div><div class="mrow"><button class="btn green" id="mDuelP2">🔵 '+duelEsc(duelState.players[1])+' · '+c.ready+'</button></div>');
      $('#mDuelP2').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();startDuelTurn(1);},{passive:false});
      return;
    }
    finishDuelRound();
  },delay);
}
function duelRoundWinner(a,b,gameType){
  if(a.completed&&!b.completed)return 0;if(b.completed&&!a.completed)return 1;
  if(gameType==='chain'){
    if((a.maxCombo||1)>(b.maxCombo||1))return 0;if((b.maxCombo||1)>(a.maxCombo||1))return 1;
    if((a.reactions||0)>(b.reactions||0))return 0;if((b.reactions||0)>(a.reactions||0))return 1;
  }
  if(gameType==='reactor'){if((a.hits||0)<(b.hits||0))return 0;if((b.hits||0)<(a.hits||0))return 1;}
  if(!a.completed&&!b.completed){if(a.moves<b.moves)return 0;if(b.moves<a.moves)return 1;return -1;}
  const at=Math.round(a.time*10),bt=Math.round(b.time*10);
  if(at<bt)return 0;if(bt<at)return 1;if(a.moves<b.moves)return 0;if(b.moves<a.moves)return 1;return -1;
}
function finishDuelRound(){
  if(!duelState)return;const round=duelCurrentRound(),c=duelCopy(),a=round.results[0],b=round.results[1];
  const winner=duelRoundWinner(a,b,round.gameType);round.winner=winner;if(winner>=0)duelState.wins[winner]++;
  const matchOver=duelState.wins[0]>=2||duelState.wins[1]>=2||duelState.round>=DUEL_MAX_ROUNDS-1;
  if(matchOver){showDuelFinalResult();return;}
  const headline=winner<0?c.roundDraw:'🏆 '+duelEsc(duelState.players[winner])+' '+c.roundWinner;
  openModal('<h3>'+c.round+' '+(duelState.round+1)+' / '+DUEL_MAX_ROUNDS+'</h3><div class="duelWinner">'+headline+'</div>'+duelScoreHtml()+
    '<div class="duelStats"><div class="duelStat red"><b>🔴 '+duelEsc(duelState.players[0])+'</b><span>'+duelResultText(a,c,round.gameType)+'</span></div>'+ 
    '<div class="duelStat blue"><b>🔵 '+duelEsc(duelState.players[1])+'</b><span>'+duelResultText(b,c,round.gameType)+'</span></div></div>'+ 
    '<div class="mrow"><button class="btn green" id="mDuelNext">'+c.nextRound+'</button></div>');
  $('#mDuelNext').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();duelState.round++;startDuelTurn(0);},{passive:false});
}
function duelRoundHistoryHtml(){
  if(!duelState)return '';
  return '<div class="duelRoundHistory">'+duelState.rounds.map((r,i)=>{
    if(!r.results[1])return '';
    const mark=r.winner<0?'➖':(r.winner===0?'🔴':'🔵');
    const icon=r.gameType==='crystal'?'🧪':(r.gameType==='chain'?'⚡':(r.gameType==='reactor'?'☢️':'⚛️'));return '<span>'+mark+' '+icon+' R'+(i+1)+' · B'+(r.level+1)+'</span>';
  }).join('')+'</div>';
}
function showDuelFinalResult(){
  if(!duelState)return;const c=duelCopy();let winner=-1;
  if(duelState.wins[0]>duelState.wins[1])winner=0;else if(duelState.wins[1]>duelState.wins[0])winner=1;
  openModal(duelFinalResultScreenHtml(winner,null,{subtext:LANG==='tr'?'Aynı telefonda oynanan dostluk maçı.':'Pass-the-phone friendly match.'})+
    '<div class="mrow duelFinalActions three"><button class="btn blue" id="mDuelAgain">↻ '+c.rematch+'</button><button class="btn" id="mDuelChange">⚙ '+c.change+'</button><button class="btn green" id="mDuelMenu">⌂ '+c.menu+'</button></div>');
  activateDuelFinalPresentation(winner<0?'draw':'local');
  $('#mDuelAgain').addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();
    const levels=duelBuildLevels(duelState.pool);duelState.round=0;duelState.turn=0;duelState.wins=[0,0];duelState.turnFinished=false;duelState.rounds=duelMakeRounds(levels,duelState.gameKind||'classic',duelState.pool);startDuelTurn(0);
  },{passive:false});
  $('#mDuelChange').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();resetDuelUi();closeModal();show('splash');setTimeout(openLocalDuelSetup,80);},{passive:false});
  $('#mDuelMenu').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();resetDuelUi();closeModal();show('splash');},{passive:false});
}
function finishDuelTimeout(){
  if(!duelMode||!duelState||duelState.turnFinished||won)return;
  won=true;winT=performance.now();anim=null;bounce=null;nudge=null;updateHUD();
  const el=$('#duelTimer');if(el){el.textContent='00:00.0';el.classList.add('urgent');}
  SFX.thunk();say(duelCopy().timeUp,'sad',2200,'shk');finishDuelTurn(DUEL_TIME_LIMIT,false);
}
function confirmQuitDuel(){
  if(onlineDuelMode){const c=duelCopy(),o=onlineDuelCopy();openModal('<h3>'+c.quitTitle+'</h3><div class="msub">'+o.unranked+'</div><div class="mrow"><button class="btn danger" id="mDuelQuit">'+c.quit+'</button><button class="btn" id="mDuelStay">'+c.stay+'</button></div>');bindTap('#mDuelQuit',()=>{SFX.back();exitOnlineDuel(true);});bindTap('#mDuelStay',()=>{SFX.click();closeModal();});return;}
  const c=duelCopy();openModal('<h3>'+c.quitTitle+'</h3><div class="mrow"><button class="btn danger" id="mDuelQuit">'+c.quit+'</button><button class="btn" id="mDuelStay">'+c.stay+'</button></div>');
  bindTap('#mDuelQuit',e=>{SFX.back();resetDuelUi();closeModal();show('splash');});
  bindTap('#mDuelStay',e=>{SFX.click();closeModal();});
}
function todaysLevelIndex(){return certifiedDailyChallenge().themeIndex;}
function startDaily(){
  const challenge=certifiedDailyChallenge();
  currentDailyLevel=challenge.level;currentDailyId=challenge.dayId;
  startLevel(challenge.themeIndex,'daily');
  $('#lvPill').textContent=t('todaysExpLabel');
  say(t('dailyIntro'),'happy',3500);
}
function goToLevel(i,expectedKey=''){
  i=resolveCampaignLevelIndex(i,expectedKey);
  const tr=$('#levelTransition');
  tr.classList.add('on');
  setTimeout(()=>{
    startLevel(i,'campaign',expectedKey);
    setTimeout(()=>tr.classList.remove('on'),30);
  },190);
}

function storyChapterIndex(index){return Math.min(20,Math.floor(index/15));}
function storyChapterArt(chapterNumber){
  const n=Math.max(1,Math.min(21,Number(chapterNumber)||1));
  // V6.9.2: Chapters 1-20 use language-neutral monochrome artwork.
  // Chapter 21 is the only full-color Nobel finale artwork.
  return 'assets/images/story/chapter-scene-'+n+'.webp';
}
function withStoryArt(pages,chapterNumber){
  const img=storyChapterArt(chapterNumber);
  return (pages||[]).map(page=>Object.assign({},page,{img}));
}
const BUILTIN_STORY_TR=[{"title":"BÖLÜM 1 · LABORATUVAR UYANIYOR","text":"Dr. E’nin laboratuvarı yeniden çalışıyor. İlk molekülleri kur ve kayıp araştırma dosyasının izini sür.","caption":"Her büyük keşif tek bir atomla başlar.","who":"drE","bang":"⚡"},{"title":"BÖLÜM 2 · İLK BAĞLAR","text":"Temel bağları öğrendin. Şimdi daha büyük moleküller ve daha dar laboratuvar yolları seni bekliyor.","caption":"Doğru sıra, doğru bağ.","who":"drE","bang":"⚛"},{"title":"BÖLÜM 3 · SOĞUK DENEYLER","text":"Laboratuvarın sıcaklığı düşüyor. Donmuş atomları çözmeden Nobel dosyasına ulaşamazsın.","caption":"Bazen ilerlemek için önce buzu eritmek gerekir.","who":"drE","bang":"❄️"},{"title":"BÖLÜM 4 · ENERJİ ARTIYOR","text":"Ateş ve elektrik deneylere karıştı. Her hamle artık atomların durumunu da değiştiriyor.","caption":"Kontrol edilmeyen enerji keşfi kaosa dönüştürür.","who":"drE","bang":"🔥"},{"title":"BÖLÜM 5 · GİZLİ GEÇİTLER","text":"Profesör Null laboratuvara portallar yerleştirdi. Dr. E bunun yardım mı tuzak mı olduğundan emin değil.","caption":"Bir kapı kapanırsa başka bir portal açılır.","who":"both","bang":"🌀"},{"title":"BÖLÜM 6 · HAREKETLİ DUVARLAR","text":"Null’un hareketli duvarları her hamlede düzeni değiştiriyor. Bir sonraki tahtayı da düşün.","caption":"Laboratuvar artık sana karşı hamle yapıyor.","who":"null","bang":"⚙️"},{"title":"BÖLÜM 7 · BASINÇ ALTINDA","text":"Basınç düğmeleri ve kapılar devrede. Bazı atomlar yolu açık tutmak zorunda.","caption":"Küçük bir baskı büyük bir kapıyı açar.","who":"drE","bang":"🔘"},{"title":"BÖLÜM 8 · KIRILGAN KANITLAR","text":"Nobel dosyasının parçaları kırılgan atomların içinde saklı. Sert çarpışmalar kanıtları yok edebilir.","caption":"Güç değil, hassasiyet.","who":"both","bang":"💎"},{"title":"BÖLÜM 9 · ZİNCİRLİ ATOMLAR","text":"Bağlı atomlar birlikte hareket ediyor. Tek bir hamle iki yolu aynı anda değiştirebilir.","caption":"Bir atomu oynat, bütün plan değişsin.","who":"drE","bang":"🔗"},{"title":"BÖLÜM 10 · KATALİZÖR AVI","text":"Katalizör, Enerji Hücresi ve Stabilizatör parçalarını toplamaya başla.","caption":"Molekülü kurmadan önce deneyi hazırla.","who":"drE","bang":"🧪"},{"title":"BÖLÜM 11 · ZİNCİR REAKSİYONU","text":"Doğru hamleler birbirini tetikliyor. Null zinciri bozmak, Dr. E büyütmek istiyor.","caption":"Bir doğru hamle, bir sonrakini uyandırır.","who":"both","bang":"⚡"},{"title":"BÖLÜM 12 · REAKTÖR KAÇIŞI","text":"Lazer kapıları aktif. Güvenli fazları izleyip atomları ışınların arasından geçir.","caption":"Zamanlama artık çözümün bir parçası.","who":"drE","bang":"☢️"},{"title":"BÖLÜM 13 · KAYIP NOBEL DOSYASI","text":"Dr. E’nin Nobel başvurusundaki kanıtlar kayboldu. İzler Profesör Null’un deneylerine çıkıyor.","caption":"Dosya kayıp; bilim devam ediyor.","who":"null","bang":"📁"},{"title":"BÖLÜM 14 · KANITLARI TOPLA","text":"Her molekül Nobel dosyasındaki yeni bir kanıtı geri getiriyor. Null’un planı ortaya çıkıyor.","caption":"301 deney, tek bir büyük kanıt.","who":"both","bang":"🔬"},{"title":"BÖLÜM 15 · UZMAN LABORATUVARI","text":"Artık laboratuvar uzmanısın. Mekanikler birleşiyor ve kısa yollar azalıyor.","caption":"Bilgi, baskı altında ustalığa dönüşür.","who":"drE","bang":"🎓"},{"title":"BÖLÜM 16 · NULL’UN DÜZENEĞİ","text":"Profesör Null portalları, kapıları ve enerji sistemlerini tek düzende birleştirdi.","caption":"Her sistemin bir zayıf noktası vardır.","who":"null","bang":"🧠"},{"title":"BÖLÜM 17 · NOBEL ADAYI","text":"Komite seni Nobel adayı olarak kaydetti. Artık kusursuz çözüm de önemli.","caption":"İyi deney tamamlanır; büyük deney kanıtlanır.","who":"drE","bang":"🏅"},{"title":"BÖLÜM 18 · KOMİTE SINAVLARI","text":"Nobel Komitesi laboratuvarı gözlemliyor. Her doğru bağ dosyanı güçlendiriyor.","caption":"Sahne hazır, deney senin.","who":"both","bang":"📋"},{"title":"BÖLÜM 19 · MASTER LAB","text":"Mekanikler artık tek tek değil, aynı çözüm içinde birlikte çalışıyor.","caption":"Planla, uygula, kanıtla.","who":"drE","bang":"🌟"},{"title":"BÖLÜM 20 · GRAND MASTER","text":"Son on beş sınav kaldı. Dr. E ve Profesör Null ilk kez aynı hedef için çalışıyor.","caption":"Rakipler bazen en iyi ortaklardır.","who":"both","bang":"🏆"},{"title":"BÖLÜM 21 · NOBEL FİNALİ","text":"301. deney hazır. Kayıp dosya tamamlandı; son molekül Nobel kararını belirleyecek.","caption":"Son bağ, bütün hikâyeyi tamamlayacak.","who":"both","bang":"NOBEL!"}];
const BUILTIN_STORY_EN=[{"title":"CHAPTER 1 · THE LAB AWAKENS","text":"Dr. E’s laboratory is running again. Build the first molecules and follow the missing research file.","caption":"Every great discovery begins with one atom.","who":"drE","bang":"⚡"},{"title":"CHAPTER 2 · FIRST BONDS","text":"You mastered basic bonds. Larger molecules and tighter routes now await.","caption":"Right order, right bond.","who":"drE","bang":"⚛"},{"title":"CHAPTER 3 · COLD EXPERIMENTS","text":"The laboratory temperature is falling. Free the frozen atoms to reach the Nobel file.","caption":"Sometimes progress begins by melting the ice.","who":"drE","bang":"❄️"},{"title":"CHAPTER 4 · RISING ENERGY","text":"Fire and electricity enter the experiments. Moves now change atomic states too.","caption":"Uncontrolled energy turns discovery into chaos.","who":"drE","bang":"🔥"},{"title":"CHAPTER 5 · HIDDEN PASSAGES","text":"Professor Null installed portals. Dr. E cannot decide whether they are help or a trap.","caption":"When one door closes, another portal opens.","who":"both","bang":"🌀"},{"title":"CHAPTER 6 · MOVING WALLS","text":"Null’s moving walls reshape the board after every move. Plan the next board too.","caption":"The laboratory now moves against you.","who":"null","bang":"⚙️"},{"title":"CHAPTER 7 · UNDER PRESSURE","text":"Pressure switches and doors are active. Some atoms must hold paths open.","caption":"A little pressure can open a large door.","who":"drE","bang":"🔘"},{"title":"CHAPTER 8 · FRAGILE EVIDENCE","text":"Pieces of the Nobel file are hidden inside fragile atoms. Hard impacts may destroy them.","caption":"Precision over force.","who":"both","bang":"💎"},{"title":"CHAPTER 9 · LINKED ATOMS","text":"Linked atoms move together. One command can alter two routes at once.","caption":"Move one atom and the whole plan changes.","who":"drE","bang":"🔗"},{"title":"CHAPTER 10 · CATALYST HUNT","text":"Begin collecting the Catalyst, Energy Cell, and Stabilizer.","caption":"Prepare the experiment before building the molecule.","who":"drE","bang":"🧪"},{"title":"CHAPTER 11 · CHAIN REACTION","text":"Correct moves trigger one another. Null wants to break the chain; Dr. E wants to extend it.","caption":"One correct move awakens the next.","who":"both","bang":"⚡"},{"title":"CHAPTER 12 · REACTOR ESCAPE","text":"Laser gates are active. Read the safe phases and route atoms between the beams.","caption":"Timing is now part of the solution.","who":"drE","bang":"☢️"},{"title":"CHAPTER 13 · THE MISSING NOBEL FILE","text":"Evidence from Dr. E’s Nobel application has vanished. The trail leads to Professor Null.","caption":"The file is missing; science continues.","who":"null","bang":"📁"},{"title":"CHAPTER 14 · RECOVER THE EVIDENCE","text":"Each molecule restores another piece of the Nobel file. Null’s plan becomes clear.","caption":"301 experiments, one decisive proof.","who":"both","bang":"🔬"},{"title":"CHAPTER 15 · EXPERT LABORATORY","text":"You are now a laboratory expert. Mechanics combine and shortcuts disappear.","caption":"Knowledge becomes mastery under pressure.","who":"drE","bang":"🎓"},{"title":"CHAPTER 16 · NULL’S MACHINE","text":"Professor Null combined portals, doors, and energy systems into one apparatus.","caption":"Every system has a weakness.","who":"null","bang":"🧠"},{"title":"CHAPTER 17 · NOBEL CANDIDATE","text":"The committee registered you as a Nobel candidate. Precision now matters too.","caption":"A good experiment finishes; a great one proves.","who":"drE","bang":"🏅"},{"title":"CHAPTER 18 · COMMITTEE TRIALS","text":"The Nobel Committee is watching. Every correct bond strengthens your file.","caption":"The stage is ready. The experiment is yours.","who":"both","bang":"📋"},{"title":"CHAPTER 19 · MASTER LAB","text":"Mechanics no longer appear alone; they work together inside each solution.","caption":"Plan, execute, prove.","who":"drE","bang":"🌟"},{"title":"CHAPTER 20 · GRAND MASTER","text":"Only fifteen trials remain. Dr. E and Professor Null finally share the same goal.","caption":"Rivals can become the best partners.","who":"both","bang":"🏆"},{"title":"CHAPTER 21 · NOBEL FINALE","text":"Experiment 301 is ready. The missing file is complete; the final molecule decides the Nobel result.","caption":"The last bond completes the story.","who":"both","bang":"NOBEL!"}];
function storyPagesFor(level,index){
  const tr=LANG==='tr',chapter=storyChapterIndex(index);
  const external=(tr?STORY_ARC_TR:STORY_ARC_EN)[chapter];
  if(external&&external.length)return withStoryArt(external,chapter+1);
  const base=(tr?BUILTIN_STORY_TR:BUILTIN_STORY_EN)[chapter]||{title:'MOLECULOX',who:'drE',bang:'⚛',text:tr?'Deneyler devam ediyor.':'The experiments continue.',caption:''};
  const pages=[base],detail=level&&level.story&&(tr?level.story.tr:level.story.en);
  if(detail&&detail!==base.text)pages.push({title:base.title,who:chapter>=12?'both':'drE',bang:level&&level.nobelFinal?'🏆':'⚛',text:detail,caption:tr?'Bir sonraki deney seni finale yaklaştırıyor.':'The next experiment moves you closer to the finale.'});
  return withStoryArt(pages,chapter+1);
}
let storyContinueAction=null,storyPageIndex=0,storyPageList=[];
function ensureStoryPanel(){
  let panel=document.getElementById('levelStoryPanel');if(panel)return panel;
  panel=document.createElement('section');panel.id='levelStoryPanel';panel.setAttribute('aria-live','polite');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  panel.innerHTML='<button id="storySkip" type="button" aria-label="Skip story">×</button><div class="storyPageHead"><div id="storyChapter"></div><div id="storyPageCounter"></div></div><div class="comicStrip"><div class="comicPanel comicHero"><div class="comicBang" id="storyBang"></div><div class="storyScene"><img id="storyHeroArt" src="assets/images/einstein.webp" alt="Dr. E"><img id="nullStoryArt" src="assets/images/professor-null.webp" alt="Professor Null"></div><div class="speechBubble" id="storyText"></div></div><div class="comicPanel comicReaction"><div class="reactionMolecule" id="storyMolecule">⚛</div><div class="reactionText" id="storyReaction"></div></div></div><div class="storyNav"><button id="storyBack" class="btn" type="button">◀</button><button id="storyContinue" class="btn green" type="button"></button></div><button id="storySkipText" class="storySkipText" type="button"></button>';
  document.body.appendChild(panel);
  const finish=()=>{panel.classList.remove('on');clearTimeout(showLevelStory.timer);const cb=storyContinueAction;storyContinueAction=null;storyPageList=[];storyPageIndex=0;if(cb)setTimeout(cb,180);};
  panel.querySelector('#storySkip').addEventListener('pointerdown',e=>{e.preventDefault();finish();},{passive:false});
  panel.querySelector('#storySkipText').addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();finish();},{passive:false});
  panel.querySelector('#storyBack').addEventListener('pointerdown',e=>{e.preventDefault();if(storyPageIndex>0){storyPageIndex--;SFX.back();renderStoryPage(panel);}},{passive:false});
  panel.querySelector('#storyContinue').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();if(storyPageIndex<storyPageList.length-1){storyPageIndex++;renderStoryPage(panel);}else finish();},{passive:false});
  return panel;
}
function renderStoryPage(panel){
  const page=storyPageList[storyPageIndex]||{};
  panel.querySelector('#storyChapter').textContent=page.title||'MOLECULOX';
  panel.querySelector('#storyPageCounter').textContent=(storyPageIndex+1)+' / '+storyPageList.length;
  panel.querySelector('#storyText').textContent=page.text||'';
  panel.querySelector('#storyReaction').textContent=page.caption||'';
  panel.querySelector('#storyMolecule').textContent=page.bang||'⚛';
  panel.querySelector('#storyBang').textContent=page.bang||'!';
  panel.classList.toggle('showNull',page.who==='null'||page.who==='both');
  panel.classList.toggle('showEinstein',page.who!=='null');
  panel.classList.toggle('bothCharacters',page.who==='both');
  panel.classList.toggle('storyAltPose',storyPageIndex%2===1);
  panel.querySelector('#storyBack').disabled=storyPageIndex===0;
  panel.querySelector('#storyContinue').textContent=storyPageIndex===storyPageList.length-1?(LANG==='tr'?'DENEYE DEVAM ▶':'CONTINUE EXPERIMENT ▶'):(LANG==='tr'?'SONRAKİ SAYFA ▶':'NEXT PAGE ▶');
  // BUILD V6.23.3: optional per-page custom illustration. Drop a generated
  // image at assets/images/story/... and add {img:'assets/images/story/...'}
  // to that page's object (see GORSEL-PROMPTLARI-21-BOLUM-TR.txt) — no other
  // code change needed. Falls back to the existing gradient when absent.
  const hero=panel.querySelector('.comicHero');
  if(hero){
    let sceneImg=hero.querySelector('.sceneArtImg');
    if(page.img){
      if(!sceneImg){sceneImg=document.createElement('img');sceneImg.className='sceneArtImg';sceneImg.alt='';hero.insertBefore(sceneImg,hero.firstChild);}
      sceneImg.src=page.img;
      hero.style.backgroundImage='';
      panel.classList.add('hasSceneArt');
    }else{
      if(sceneImg)sceneImg.remove();
      hero.style.backgroundImage='';
      panel.classList.remove('hasSceneArt');
    }
  }
}
function showLevelStory(level,index,onContinue=null){
  const panel=ensureStoryPanel();storyPageList=storyPagesFor(level,index);storyPageIndex=0;storyContinueAction=onContinue;
  panel.querySelector('#storySkipText').textContent=LANG==='tr'?'HİKÂYEYİ ATLA':'SKIP STORY';
  panel.classList.toggle('nobelFinalStory',index===300);renderStoryPage(panel);panel.classList.add('on');
  clearTimeout(showLevelStory.timer);
}
function markStorySeen(index){
  save.storySeen=save.storySeen&&typeof save.storySeen==='object'?save.storySeen:{};
  if(Number(save.storySchema||0)<4){save.storySeen={};save.storySchema=4;persist();}
  save.storySeen[String(index+1)]=1;persist();
}
function queueLevelStory(level,index,playMode){
  // Level 1 story runs before its tutorial so two blocking panels never overlap.
  if(index!==0||playMode!=='campaign'||!level)return;
  save.storySeen=save.storySeen&&typeof save.storySeen==='object'?save.storySeen:{};
  if(save.storySeen['1'])return;
  setTimeout(()=>{if(lv!==index||won)return;showLevelStory(level,index,()=>{markStorySeen(0);if(lv===index&&!won&&level.onboard&&!onboardingSeen(index))runWhenModalFree(()=>showFoundationBriefing(level,index));});},420);
}
function goToLevelWithStory(index){
  const target=LEVELS[index];
  // Chapters appear at Level 1, every 15 levels, and at the Level 301 finale.
  if(index>0&&index<300&&index%15!==0){goToLevel(index);return;}
  if(!target){goToLevel(index);return;}
  save.storySeen=save.storySeen&&typeof save.storySeen==='object'?save.storySeen:{};
  if(save.storySeen[String(index+1)]){goToLevel(index);return;}
  closeModal();
  setTimeout(()=>showLevelStory(target,index,()=>{markStorySeen(index);goToLevel(index);}),220);
}

function onboardingKey(index){return '__onboarding_level_'+index;}
function onboardingSeen(index){ensureResearchState(save);return !!save.researchAchievements[onboardingKey(index)];}
function markOnboardingSeen(index){ensureResearchState(save);save.researchAchievements[onboardingKey(index)]=1;persist();}
function showFoundationBriefing(level,index){
  if(!level||!level.onboard||onboardingSeen(index))return;
  if($('#modal')&&$('#modal').classList.contains('on')){runWhenModalFree(()=>showFoundationBriefing(level,index));return;}
  const tr=LANG==='tr',copy=tr?level.onboard.tr:level.onboard.en;
  const group=level.onboardGroup||'movement';
  const icon=group==='movement'?'↔️':(group==='alignment'?'🎯':(group==='planning'?'🧠':'🏅'));
  const title=tr?('Başlangıç Deneyi '+(index+1)):('Foundation Experiment '+(index+1));
  openModal('<h3>'+icon+' '+title+'</h3><div class="msub" style="line-height:1.55">'+copy+'</div><div class="mrow"><button class="btn" id="mFoundationGo">'+(tr?'DENEYE BAŞLA':'START EXPERIMENT')+'</button></div>');
  // Bind on the next frame so the tap that opened the briefing can never close it.
  requestAnimationFrame(()=>bindTap('#mFoundationGo',()=>{markOnboardingSeen(index);closeModal();}));
}

function startLevel(i,mode='campaign',expectedKey=''){
  if(mode==='campaign')i=resolveCampaignLevelIndex(i,expectedKey);
  mxTrack('level_started',{level:Number(i)+1,mode:String(mode||'campaign')});
  dailyMode=mode==='daily';duelMode=mode==='duel';
  const activeDuelRound=duelMode?duelCurrentRound():null;
  crystalMode=mode==='crystal'||!!(duelMode&&activeDuelRound&&activeDuelRound.gameType==='crystal');
  chainMode=mode==='chain'||!!(duelMode&&activeDuelRound&&activeDuelRound.gameType==='chain');
  reactorMode=mode==='reactor'||!!(duelMode&&activeDuelRound&&activeDuelRound.gameType==='reactor');
  lv=i;LV=(dailyMode&&currentDailyLevel)?currentDailyLevel:LEVELS[i];
  if(!LV||!LV.m||!MOLS[LV.m]){
    console.error('[Moleculox] Invalid campaign level selection',{index:i,expectedKey,level:LV});
    const tr=$('#levelTransition');if(tr)tr.classList.remove('on');
    show('levels');prop(LANG==='tr'?'Bölüm verisi yenileniyor…':'Refreshing level data…',2200);
    return;
  }
  campaignFeature=(mode==='campaign'&&!dailyMode&&!duelMode&&LV.b)?LV.b:'';mid=LV.m;curMol=MOLS[mid];
  document.body.classList.toggle('mxAdvancedLab',mode==='campaign'&&!dailyMode&&i>=181);
  document.body.classList.toggle('mxMasterLab',mode==='campaign'&&!dailyMode&&i>=201);
  levelStartT=performance.now();
  moveLog=[];currentAttemptId=null;secureAttemptPending=false;
  const attemptRequest=++secureAttemptRequest;
  const cloudAccount=window.MXCloud&&window.MXCloud.account;
  const secureRankedRun=mode==='campaign'&&window.MXCloud&&window.MXCloud.security&&
    window.MXCloud.security.secureBackendEnabled&&cloudAccount&&!cloudAccount.isAnonymous&&save.profileId;
  if(secureRankedRun){
    secureAttemptPending=true;
    const requestAttempt=window.MXCloud.startLevelAttempt(save.profileId,i,'campaign');
    const attemptTimeout=new Promise(resolve=>setTimeout(()=>resolve(null),4500));
    Promise.race([requestAttempt,attemptTimeout]).then(res=>{
      if(attemptRequest!==secureAttemptRequest||lv!==i||dailyMode)return;
      if(res&&res.attemptId)currentAttemptId=res.attemptId;
      else setTimeout(()=>say(t('secureUnranked'),'sad',4800,'shk'),150);
    }).catch(()=>{
      if(attemptRequest===secureAttemptRequest&&lv===i)setTimeout(()=>say(t('secureUnranked'),'sad',4800,'shk'),150);
    }).finally(()=>{
      if(attemptRequest===secureAttemptRequest&&lv===i)secureAttemptPending=false;
    });
  }
  setBgForTier(tierOf((duelMode||crystalMode||chainMode||reactorMode)?i:save.cur),false);
  grid=LV.g.map(r=>[...r].map(c=>c==='1'));
  breakableWalls=new Map(deriveBreakableWalls(LV,i,mode).map(w=>[breakableKey(w.x,w.y),{x:w.x,y:w.y,broken:false}]));portalPairs=new Map(derivePortals(LV,i,mode).map(p=>[portalKey(p.x,p.y),p]));oneWayTiles=new Map(deriveOneWayTiles(LV,i,mode).map(o=>[oneWayKey(o.x,o.y),o]));movingWalls=deriveMovingWalls(LV,i,mode).map(w=>{const c=w.path[w.index||0];return {...w,x:c.x,y:c.y,anim:null};});movingWallAnimating=false;hammerMode=false;hammerPending=null;precisionMode=false;barrierMode=false;barrierUsed=false;assistanceUsed=false;temporaryBarriers=new Map();precisionPending=null;precisionExecuting=false;
  pressureSystems=derivePressureSystems(LV,i,mode);
  atoms=LV.a.map(a=>({x:a[0],y:a[1],e:a[2],ph:Math.random()*6.28,frozen:!!a[3],fire:!!a[4],sticky:!!a[5],zombie:!!a[6],lightning:!!a[7],zombieGen:0}));
  applyLightningAtoms(LV,i,mode);
  applyFragileAtoms(LV,i,mode);applyLinkedAtoms(LV,i,mode);fragileFailure=false;
  updatePressureDoors(false);
  const crystalOn=crystalActive(),chainOn=chainActive(),reactorOn=reactorActive();
  const crystalLayout=crystalMode?(duelMode&&activeDuelRound?activeDuelRound.crystals:currentCrystalLayout):null;
  crystals=crystalOn?((crystalMode&&crystalLayout)?crystalLayout:buildCrystalLayout(i)).map((c,j)=>({x:c.x,y:c.y,type:c.type||LAB_COMPONENTS[j%LAB_COMPONENTS.length].id,collected:false})):[];
  if(crystalMode&&!duelMode&&!currentCrystalLayout)currentCrystalLayout=crystals.map(c=>({x:c.x,y:c.y,type:c.type,collected:false}));
  chainPlan=chainOn?(chainMode?(duelMode&&activeDuelRound?(activeDuelRound.chainPlan||buildChainPlan(i)):(currentChainPlan||buildChainPlan(i))):buildChainPlan(i)):[];
  if(chainMode&&!duelMode&&!currentChainPlan)currentChainPlan=chainPlan.map(x=>({...x}));
  chainPathKeys=chainOn?pathStates(LV.fs||[]).map(stateKey):[];chainCurrentStep=chainOn?0:-1;chainMaxCombo=1;chainReactions=0;chainAutoMoves=0;chainCurrentCombo=1;chainAutoActive=false;chainAutoExecuting=false;chainAutoQueue=[];
  const reactorPlan=reactorOn?(reactorMode?(duelMode&&activeDuelRound?(activeDuelRound.reactorPlan||buildReactorPlan(i)):(currentReactorPlan||buildReactorPlan(i))):buildReactorPlan(i)):[];
  reactorGates=reactorOn?reactorPlan.map(g=>({...g})):[];reactorHits=0;reactorPenalty=0;reactorLastHitAt=0;if(reactorMode&&!duelMode&&!currentReactorPlan)currentReactorPlan=reactorGates.map(g=>({...g}));
  let unifiedBriefingQueued=false;
  // Unified first-use onboarding: every special atom, board mechanic and
  // campaign objective is explained in the same compact briefing before play.
  // Direct Bonus Lab modes now use the same system instead of only a short
  // speech bubble, while Duel remains uninterrupted.
  if(!duelMode&&save.tutorialTips!==false){
    // Tutorials are unlocked progressively. Nothing is marked as seen until
    // the player explicitly continues from the quick guide or completes the lesson.
    const newMechanics=[];
    if(crystalMode&&!save.seenClassicCatalystTutorialV2)newMechanics.push('classicCatalyst');
    else if(chainMode&&!save.seenClassicChainTutorialV2)newMechanics.push('classicChain');
    else if(reactorMode&&!save.seenClassicReactorTutorialV2)newMechanics.push('classicReactor');
    else if(mode==='campaign'){
    if(atoms.some(a=>a.frozen)&&!save.seenFrozen)newMechanics.push('frozen');
    if(atoms.some(a=>a.fire)&&!save.seenFire)newMechanics.push('fire');
    if(atoms.some(a=>a.lightning)&&!save.seenLightning)newMechanics.push('lightning');
    if(atoms.some(a=>a.sticky)&&!save.seenSticky)newMechanics.push('sticky');
    if(atoms.some(a=>a.zombie)&&!save.seenZombie)newMechanics.push('zombie');
    if(oneWayTiles.size>0&&!save.seenOneWay)newMechanics.push('oneWay');
    if(breakableWalls.size>0&&!save.seenBreakableWall)newMechanics.push('hammer');
    if(portalPairs.size>0&&!save.seenPortal)newMechanics.push('portal');
    if(movingWalls.length>0&&!save.seenMovingWall)newMechanics.push('movingWall');
    if(pressureSystems.length>0&&!save.seenPressureDoor)newMechanics.push('pressureDoor');
    if(atoms.some(a=>a.fragile)&&!save.seenFragile)newMechanics.push('fragile');
    if(linkedPairs.length>0&&!save.seenLinked)newMechanics.push('linked');
    if(i>=153&&!save.seenPrecisionTutorialV2)newMechanics.push('precision');
    if(campaignFeature==='crystal'&&!save.seenClassicCatalystTutorialV2)newMechanics.push('classicCatalyst');
    if(campaignFeature==='chain'&&!save.seenClassicChainTutorialV2)newMechanics.push('classicChain');
      if(campaignFeature==='reactor'&&!save.seenClassicReactorTutorialV2)newMechanics.push('classicReactor');
    }
    if(newMechanics.length){unifiedBriefingQueued=true;setTimeout(()=>showMechanicFirstUse(newMechanics,{automatic:true,level:i,mode}),350);}
  }
  for(const f of atoms){
    if(!f.fire)continue;
    for(const fr of atoms){
      if(fr.frozen&&Math.abs(f.x-fr.x)+Math.abs(f.y-fr.y)===1)fr.frozen=false;
    }
  }
  sel=0;moves=0;hist=[];won=false;winT=0;hintStep=0;attemptHintCount=0;hintMark=null;bumpN=0;stuckAtomIdx=-1;stuckAtomCount=0;strugglingSaid=false;slowSaid=false;crystalGoalWarned=false;clearTimeout(autoHintT);
  anim=null;bounce=null;nudge=null;tut=(duelMode||crystalMode||chainMode||reactorMode)?9:((i===0&&!save.stars[0]&&!save.tutorialDone)?0:9);
  t2=Math.ceil(LV.p*1.7);
  setTheme(Math.floor(i/20));lastBondLine=false;prevB=0;mxReactionStreak=0;mxReactionAt=0;setExcited(false);updateIntensity();einMood('enter',650);if(Math.random()<0.6)prop('👋',1300);
  if(mode==='campaign'&&!duelMode&&!dailyMode)maybeVoice('drE','ready',i===0?1:.18,{cooldown:3500,duck:.38});if(mid==='N2O')setTimeout(()=>{einMood('laugh',1200);},1500);
  if(lv===NOBEL_LEVEL_INDEX)setTimeout(()=>{einMood('excited',900);prop('🏆',3000);say(t('nobelIntro'),'talk',5500,'glow');playCharacterVoice('drE','nobel',{force:true,duck:.24});},900);
  const duelTypeTag=crystalMode?'🧪':(chainMode?'⚡':(reactorMode?'☢️':'⚛️'));
  const campaignPill=campaignFeature?(t('level',i+1)+' · '+campaignFeatureIcon(campaignFeature)+' '+campaignFeatureName(campaignFeature)):t('level',i+1);
  $('#lvPill').textContent=duelMode?('VS '+duelTypeTag+' · R'+(duelState.round+1)+'/'+DUEL_MAX_ROUNDS+' · '+duelState.players[duelState.turn]):(crystalMode?'🧪 '+crystalCopy().title+' · B'+(i+1):(chainMode?'⚡ '+chainCopy().title+' · B'+(i+1):(reactorMode?'☢️ '+reactorCopy().title+' · B'+(i+1):campaignPill)));
  queueLevelStory(LV,i,mode);
  if(mode==='campaign'&&!dailyMode&&!duelMode&&i>0&&i<20&&LV.onboard&&!onboardingSeen(i))setTimeout(()=>showFoundationBriefing(LV,i),520);
  const timedMode=duelMode||crystalMode||chainMode||reactorMode;
  const duelTimer=$('#duelTimer');if(duelTimer){duelTimer.classList.toggle('on',timedMode);duelTimer.classList.remove('urgent');duelTimer.textContent=timedMode?duelFormatTime(duelMode?DUEL_TIME_LIMIT:(crystalMode?CRYSTAL_TIME_LIMIT:(chainMode?CHAIN_TIME_LIMIT:REACTOR_TIME_LIMIT))):'00:00.0';duelTimerText='';}
  scr.game.classList.toggle('duelP1',duelMode&&duelState&&duelState.turn===0);
  scr.game.classList.toggle('duelP2',duelMode&&duelState&&duelState.turn===1);
  scr.game.classList.toggle('crystalMode',crystalActive());
  scr.game.classList.toggle('chainMode',chainActive());
  scr.game.classList.toggle('reactorMode',reactorActive());
  $('#goalName').textContent=curMol.n;
  $('#goalFor').textContent=curMol.f;
  const _gc=$('#goalCard');_gc.classList.remove('goalPop');void _gc.offsetWidth;_gc.classList.add('goalPop');
  const _bf=$('#boardFrame'),_tn=mixHex(curMol.c[0],TIER_ACCENT[tierOf(i)],0.4);
  _bf.style.borderColor=_tn+'99';
  _bf.style.boxShadow='0 0 0 1px rgba(0,0,0,.5),0 18px 40px rgba(0,0,0,.55),0 0 36px '+_tn+'66,inset 0 0 22px rgba(0,0,0,.55)';
  updateCoins();updateBadge();updateHUD();
  closeModal();show('game');resetDrEPose();{const startPose=(crystalMode||chainMode||reactorMode||campaignFeature)?'experiment':'clipboard';setDrEPose(startPose,5000,startPose==='experiment'?7:3,true);}syncHammerUi();syncPrecisionUi();syncBarrierUi();
  if(mode==='campaign'&&!duelMode&&!dailyMode&&!save.seenGoalGlowGuide&&tut!==0){
    save.seenGoalGlowGuide=true;persist();
    setTimeout(()=>say(ml('💡 GOAL kartındaki yavaş mavi ışık hedefi hatırlatır. Işık hızlanıp turuncuya dönerse molekül tamamlanmaya çok yakındır — yalnızca bir doğru bağ kalmıştır!','💡 The slow blue GOAL glow reminds you of the target. If it speeds up and turns warm orange, the molecule is nearly complete — only one correct bond remains!','💡 Das langsame blaue Leuchten der ZIEL-Karte erinnert dich an das Ziel. Wird es schneller und warmorange, fehlt nur noch eine richtige Bindung!','💡 El brillo azul lento de la tarjeta OBJETIVO recuerda la meta. Si acelera y se vuelve naranja, solo falta un enlace correcto.','💡 O brilho azul lento do cartão OBJETIVO lembra a meta. Se acelerar e ficar laranja, falta apenas uma ligação correta.','💡 GOALカードのゆっくりした青い光は目標を示します。光が速くなりオレンジ色になったら、正しい結合はあと1つです。'),'talk',6200,'glow'),4200);
  }
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&breakableWalls.size&&!save.seenHammerWall){save.seenHammerWall=true;persist();setTimeout(()=>say('🔨 '+t('hammerDesc'),'talk',6200,'glow'),900);}
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&portalPairs.size&&!save.seenPortal){save.seenPortal=true;persist();setTimeout(()=>say('🌀 '+t('portalDesc'),'talk',6200,'glow'),breakableWalls.size?6200:900);}
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&oneWayTiles.size&&!save.seenOneWay){save.seenOneWay=true;persist();setTimeout(()=>say('➡️ '+t('oneWayDesc'),'talk',6200,'glow'),portalPairs.size?6900:1100);}
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&movingWalls.length&&!save.seenMovingWall){save.seenMovingWall=true;persist();setTimeout(()=>say('⚙️ '+t('movingWallDesc'),'talk',6200,'glow'),oneWayTiles.size?7600:1200);}
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&pressureSystems.length&&!save.seenPressureDoor){save.seenPressureDoor=true;persist();setTimeout(()=>say('🔘 '+t('pressureDoorDesc'),'talk',7000,'glow'),movingWalls.length?8300:1300);}
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&atoms.some(a=>a.fragile)&&!save.seenFragileAtom){save.seenFragileAtom=true;persist();setTimeout(()=>say('💎 '+t('fragileDesc'),'talk',6800,'glow'),pressureSystems.length?9200:1500);}
  if(!unifiedBriefingQueued&&save.tutorialTips!==false&&linkedPairs.length&&!save.seenLinkedAtoms){save.seenLinkedAtoms=true;persist();setTimeout(()=>say('🔗 '+t('linkedDesc'),'talk',6800,'glow'),atoms.some(a=>a.fragile)?10000:1600);}
  requestAnimationFrame(()=>drawMol($('#goalCv'),curMol,false));
  const dp=$('#dpad');dp.classList.remove('pulse');
  if(duelMode){
    $('#tutOverlay').classList.remove('on');
    const dc=duelCopy();say((duelState.turn===0?'🔴 ':'🔵 ')+duelState.players[duelState.turn]+' · '+(crystalMode?'🧪 '+dc.crystal:(chainMode?'⚡ '+dc.chain:(reactorMode?'☢️ '+dc.reactor:'⚛️ '+dc.classic)))+' · '+dc.round+' '+(duelState.round+1)+'/'+DUEL_MAX_ROUNDS,'happy',3900,'glow');
  }
  else if(crystalMode){$('#tutOverlay').classList.remove('on');if(!unifiedBriefingQueued)say('🧪 '+crystalCopy().sub,'happy',4200,'glow');}
  else if(chainMode){$('#tutOverlay').classList.remove('on');if(!unifiedBriefingQueued)say('⚡ '+chainCopy().sub,'happy',4200,'glow');}
  else if(reactorMode){$('#tutOverlay').classList.remove('on');if(!unifiedBriefingQueued)say('☢️ '+reactorCopy().sub,'happy',4200,'glow');}
  else if(campaignFeature==='crystal'){say('🧪 '+t('classicCatalystDesc'),'happy',6500,'glow');}
  else if(campaignFeature==='chain'){say('⚡ '+t('classicChainDesc'),'happy',6500,'glow');}
  else if(campaignFeature==='reactor'){say('☢️ '+t('classicReactorDesc'),'happy',6500,'glow');}
  else if(tut===0){$('#tutOverlay').classList.add('on');}
  else if(!save.disc[mid]){
    say('<b>'+curMol.n+'</b> ('+curMol.f+')<br>'+curMol.fa,'talk',7000,'glow');
  }
  else if(Math.random()<0.3){
    say('<b>'+curMol.n+'</b><br>'+curMol.fa,'talk',6000,'glow');
  }
  else{
    say((lv<2?rnd(LN.greet)+'<br>':'')+t('targetLine','',curMol.n,curMol.f),'talk',4200);
  }
  resetIdle();
}
/* ================= INTERACTIVE TUTORIAL ================= */
function tutorialSay(txt){
  const b=$('#tutorialBubble');
  b.innerHTML=txt;
  b.classList.add('on');
}
function tutorialCellRect(x,y){
  const r=board.getBoundingClientRect();
  return {x:r.left+x*T,y:r.top+y*T,cx:r.left+(x+0.5)*T,cy:r.top+(y+0.5)*T};
}
function tutorialSpotRect(px,py,pw,ph){
  const s=$('#tutorialSpot');
  s.style.left=px+'px';s.style.top=py+'px';s.style.width=pw+'px';s.style.height=ph+'px';
  s.classList.add('on');
}
function tutorialSpotEl(el){
  if(!el)return;
  const r=el.getBoundingClientRect();
  tutorialSpotRect(r.left-6,r.top-6,r.width+12,r.height+12);
}
function tutorialSpotOff(){$('#tutorialSpot').classList.remove('on');}
function tutorialArrowAt(x,y,dir){
  const a=$('#tutorialArrowHint');
  const rot={0:-90,1:0,2:90,3:180}[dir]||0;
  a.style.left=(x-25)+'px';a.style.top=(y-25)+'px';a.style.setProperty('--tut-rot',rot+'deg');
  a.innerHTML='<span class="tutGameArrow" aria-hidden="true"><svg viewBox="0 0 72 72" fill="none"><defs><linearGradient id="tutArrowMetal" x1="12" y1="10" x2="60" y2="62"><stop stop-color="#F4FFFF"/><stop offset=".38" stop-color="#79EBFF"/><stop offset=".72" stop-color="#A987FF"/><stop offset="1" stop-color="#5D3ED6"/></linearGradient><radialGradient id="tutArrowCore" cx="0" cy="0" r="1" gradientTransform="translate(32 34) rotate(90) scale(25)"><stop stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".35" stop-color="#7DEEFF" stop-opacity=".55"/><stop offset="1" stop-color="#5B3EE5" stop-opacity="0"/></radialGradient></defs><circle cx="36" cy="36" r="29" fill="#0A1734" fill-opacity=".92" stroke="url(#tutArrowMetal)" stroke-width="3"/><circle cx="36" cy="36" r="24" fill="url(#tutArrowCore)" stroke="#BDF8FF" stroke-opacity=".55"/><path d="M20 31h23l-7-7 6-6 17 18-17 18-6-6 7-7H20V31Z" fill="url(#tutArrowMetal)" stroke="#F5FFFF" stroke-width="2" stroke-linejoin="round"/><path d="M24 34h19" stroke="#FFF6A3" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="36" r="2.5" fill="#FFF6A3"/></svg></span>';
  a.classList.add('on');
}
function tutorialArrowOff(){$('#tutorialArrowHint').classList.remove('on');}
function tutorialArrowToEl(el,side='right'){
  if(!el)return;const r=el.getBoundingClientRect();
  if(side==='right')tutorialArrowAt(r.right+34,r.top+r.height/2,3);
  else if(side==='left')tutorialArrowAt(r.left-34,r.top+r.height/2,1);
  else if(side==='bottom')tutorialArrowAt(r.left+r.width/2,r.bottom+34,0);
  else tutorialArrowAt(r.left+r.width/2,r.top-34,2);
}
const TUT_ARROW={0:0,1:1,2:2,3:3};

function loadTutorialPuzzle(tl){
  lv=-1;LV=tl;mid=tl.m;curMol=MOLS[mid];
  levelStartT=performance.now();
  grid=tl.g.map(r=>[...r].map(c=>c==='1'));
  atoms=tl.a.map(a=>({x:a[0],y:a[1],e:a[2],ph:Math.random()*6.28,frozen:false,fire:false,sticky:false,zombie:false,zombieGen:0}));
  sel=0;moves=0;hist=[];won=false;winT=0;hintStep=0;attemptHintCount=0;hintMark=null;bumpN=0;stuckAtomIdx=-1;stuckAtomCount=0;strugglingSaid=false;slowSaid=false;clearTimeout(autoHintT);
  anim=null;bounce=null;nudge=null;tut=9;
  t2=Math.ceil(tl.p*1.7);
  $('#lvPill').textContent=t('howToPlay');
  $('#goalName').textContent=curMol.n;
  $('#goalFor').textContent=curMol.f;
  const _gc=$('#goalCard');_gc.classList.remove('goalPop');void _gc.offsetWidth;_gc.classList.add('goalPop');
  updateCoins();updateBadge();updateHUD();
  closeModal();show('game');resetDrEPose();
  requestAnimationFrame(()=>drawMol($('#goalCv'),curMol,false));
  $('#dpad').classList.remove('pulse');
}

function mxTrack(name,params){try{if(window.MXCloud&&typeof window.MXCloud.track==='function')window.MXCloud.track(name,params||{});}catch(e){}}

function startTutorial(){
  mxTrack('tutorial_started',{tutorial:'basic_movement'});
  tutorialActive=true;tutorialStep=0;
  document.body.classList.add('tutorialMode');
  $('#tutorialOverlay').classList.add('on');
  loadTutorialPuzzle(TUT_LEVEL_1);
  tutorialGoStep(1);
}
function tutorialGoStep(n){
  tutorialStep=n;tutorialGuideDir=null;tutorialWaitTap=null;
  tutorialArrowOff();
  if(n===1){
    tutorialSpotEl($('#goalCard'));
    requestAnimationFrame(()=>tutorialArrowToEl($('#goalCard'),'right'));
    tutorialSay(t('tut1'));
    setTimeout(()=>{if(tutorialActive&&tutorialStep===1)tutorialGoStep(2);},3600);
  }else if(n===2){
    const p=tutorialCellRect(atoms[0].x,atoms[0].y);
    tutorialSpotRect(p.cx-T*0.55,p.cy-T*0.55,T*1.1,T*1.1);
    tutorialWaitTap=0; // waiting for a tap on atom index 0
    tutorialSay(t('tut2'));
  }else if(n===3){
    tutorialSpotOff();
    tutorialGuideDir=2; // must swipe DOWN to slide into the wall-stop
    const p=tutorialCellRect(atoms[0].x,atoms[0].y);
    tutorialArrowAt(p.cx,p.cy-T*0.9,TUT_ARROW[2]);
    tutorialSay(t('tut3'));
  }else if(n===4){
    tutorialArrowOff();
    tutorialGuideDir=1; // must swipe RIGHT toward the second atom
    const p=tutorialCellRect(atoms[0].x,atoms[0].y);
    tutorialArrowAt(p.cx+T*0.9,p.cy,TUT_ARROW[1]);
    tutorialSay(t('tut4'));
  }else if(n===6){
    tutorialArrowOff();tutorialSpotOff();
    tutorialSay(t('tut6'));
    setTimeout(()=>{if(tutorialActive&&tutorialStep===6)tutorialGoStep(7);},3900);
  }else if(n===7){
    tutorialSpotEl($('#btnUndo'));
    tutorialSay(t('tut7a'));
    setTimeout(()=>{if(tutorialActive&&tutorialStep===7){
      tutorialSpotEl($('#btnRestart'));
      tutorialSay(t('tut7b'));
      setTimeout(()=>{if(tutorialActive&&tutorialStep===7){
        tutorialSpotEl($('#btnHint'));
        tutorialSay(t('tut7c'));
        setTimeout(()=>{if(tutorialActive&&tutorialStep===7){
          tutorialSpotEl($('#coinChip'));
          tutorialSay(t('tut7d'));
          setTimeout(()=>{if(tutorialActive&&tutorialStep===7)tutorialGoStep(8);},4200);
        }},3400);
      }},3200);
    }},3200);
  }else if(n===8){
    tutorialSpotOff();
    loadTutorialPuzzle(TUT_LEVEL_2);
    tutorialSay(t('tut8'));
    clearTimeout(tutorialHintT);
    tutorialHintT=setTimeout(()=>{
      if(tutorialActive&&tutorialStep===8)tutorialSay(t('tut8hint'));
    },9000);
  }else if(n===9){
    tutorialArrowOff();tutorialSpotOff();clearTimeout(tutorialHintT);
    tutorialSay(t('tut9'));
    setTimeout(()=>endTutorial(true),2600);
  }
}
let tutorialHintT=null;
function endTutorial(completed){
  tutorialActive=false;tutorialStep=-1;tutorialGuideDir=null;tutorialWaitTap=null;
  clearTimeout(tutorialHintT);
  document.body.classList.remove('tutorialMode');
  $('#tutorialOverlay').classList.remove('on');
  $('#tutorialBubble').classList.remove('on');
  tutorialSpotOff();tutorialArrowOff();
  const alreadyDone=save.tutorialDone;
  mxTrack('tutorial_completed',{tutorial:'basic_movement'});
  save.tutorialDone=true;markTrainingLearned('basic','movement',LANG==='tr'?'Temel Hareket':'Basic Movement',true);
  if(completed&&!alreadyDone){
    addCoins(15);persist();updateCoins(true);
    setTimeout(()=>prop(t('tutRewardToast'),2200),300);
  }else persist();
  if(save.cur===0&&!Object.keys(save.stars).length){startLevel(0);}
  else show('splash');
}

function updateHUD(){
  $('#movePill').textContent=t('moves',moves,LV.p);
  const sp=$('#starRow').children;
  sp[0].classList.toggle('off',false);
  sp[1].classList.toggle('off',moves>t2);
  sp[2].classList.toggle('off',moves>LV.p);
  const goalCard=$('#goalCard');
  if(goalCard){
    goalCard.classList.toggle('mxGoalBreath',!won);
    if(won)goalCard.classList.remove('mxGoalNear');
  }
  const crystalOn=crystalActive(),chainOn=chainActive(),reactorOn=reactorActive();
  const cc=$('#crystalCounter');if(cc){cc.classList.toggle('on',crystalOn);cc.textContent=labComponentHud();}
  const ch=$('#chainCounter');if(ch){ch.classList.toggle('on',chainOn);ch.classList.toggle('hot',chainOn&&chainAutoActive);ch.textContent=chainOn?chainCounterText():'⚡ COMBO x1';}
  const rc=$('#reactorCounter');if(rc){rc.classList.toggle('on',reactorOn);rc.textContent=reactorOn?reactorCounterText():('☢️ '+reactorImpactLabel(true)+' 0');}
  $('#btnUndo').disabled=!hist.length||won||chainAutoActive;
  const special=duelMode||chainMode||reactorMode;
  $('#btnHint').disabled=special;$('#btnRestart').disabled=duelMode;$('#btnGear').disabled=special;
  $('#btnLab').disabled=special;$('#btnMols').disabled=special;$('#btnAchv').disabled=special;
}

/* ================= V8 STEP 11 · VISUAL GAME FEEL POLISH ================= */
function installGameFeelPolish(){
  if(document.getElementById('mxGameFeelPolish'))return;
  const st=document.createElement('style');st.id='mxGameFeelPolish';st.textContent=`
    #goalCard.mxGoalBreath{animation:mxGoalBreath 2.8s ease-in-out infinite;transform-origin:center}
    #goalCard.mxGoalSuccess{animation:mxGoalSuccess .72s cubic-bezier(.2,.8,.2,1)}
    #goalCard.mxGoalNear{animation:mxGoalNear .72s ease-in-out infinite;transform-origin:center}
    #btnHammer.mxToolReady,#btnPrecision.mxToolReady,#btnHint.mxToolReady{animation:mxToolReady 1.55s ease-in-out infinite}
    .mxBadgeFlash{animation:mxBadgeFlash .9s cubic-bezier(.2,.8,.2,1)}
    #mxToolFx{position:fixed;z-index:9999;pointer-events:none;transform:translate(-50%,-50%);font-size:46px;filter:drop-shadow(0 5px 8px rgba(0,0,0,.45))}
    #mxToolFx.hammer{animation:mxHammerStrike .48s cubic-bezier(.2,.85,.2,1) both}
    #mxToolFx.precision{font-size:34px;animation:mxPrecisionPulse .58s ease-out both}
    #mxToolFx.barrier{font-size:38px;animation:mxBarrierBuild .62s ease-out both}
    .mxCoinCountFlow{display:inline-block;min-width:1.2em}
    .mxCoinRewardLine{position:relative;overflow:visible}
    .mxFlyingCoin{position:fixed;z-index:2147483002;pointer-events:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;
      color:#6b3d00;font:1000 10px/1 system-ui,-apple-system,sans-serif;
      background:radial-gradient(circle at 31% 24%,#fff 0 6%,transparent 7%),radial-gradient(circle at 35% 30%,#fff8c9 0 12%,#ffe36b 30%,#f6b72d 62%,#b96a08 100%);
      border:1px solid #fff0a6;box-shadow:0 0 0 1px rgba(111,55,0,.8),inset 0 -2px 3px rgba(91,42,0,.62),0 0 16px rgba(255,202,55,.95),0 0 28px rgba(90,224,255,.34);filter:drop-shadow(0 4px 4px rgba(0,0,0,.46));will-change:transform,opacity}
    .mxFlyingCoin::before{content:'M';position:relative;z-index:2;transform:scaleX(.88)}
    .mxFlyingCoin::after{content:'';position:absolute;width:17px;height:8px;border:1px solid #55e5ff;border-radius:50%;transform:rotate(-24deg);box-shadow:0 0 6px rgba(79,216,255,.98)}
    .mxCoinCounterPortal{position:fixed!important;z-index:2147483004!important;pointer-events:none!important;margin:0!important;opacity:1!important;visibility:visible!important;display:flex!important;transform:none;isolation:isolate;box-shadow:0 0 0 2px rgba(255,230,120,.38),0 0 22px rgba(255,201,65,.72),0 10px 28px rgba(0,0,0,.42)!important}
    .mxCoinCounterPortal::after{content:'';position:absolute;inset:-14px;border-radius:22px;background:radial-gradient(circle,rgba(255,232,111,.42),transparent 68%);opacity:0;pointer-events:none}
    .mxCoinCounterPortal.mxCoinArrive::after{animation:mxCoinVaultFlash .46s ease-out}
    .mxCoinGainFloat{position:absolute;right:0;top:calc(100% + 4px);padding:4px 8px;border-radius:999px;background:rgba(28,18,3,.88);border:1px solid rgba(255,221,99,.62);color:#fff1a8;font:1000 11px/1 system-ui,-apple-system,sans-serif;white-space:nowrap;opacity:0;transform:translateY(4px);text-shadow:0 1px 4px #000}
    .mxCoinCounterPortal.mxCoinDone .mxCoinGainFloat{animation:mxCoinGainFloat .8s cubic-bezier(.2,.82,.2,1) both}
    .mxCoinArrive{animation:mxCoinArrive .46s cubic-bezier(.2,1.12,.25,1)}
    @keyframes mxCoinArrive{0%{transform:scale(1)}36%{transform:scale(1.27) translateY(-2px);filter:brightness(1.48)}72%{transform:scale(.96) translateY(1px)}100%{transform:scale(1);filter:brightness(1)}}
    @keyframes mxCoinVaultFlash{0%{opacity:0;transform:scale(.45)}28%{opacity:1}100%{opacity:0;transform:scale(1.45)}}
    @keyframes mxCoinGainFloat{0%{opacity:0;transform:translateY(5px) scale(.9)}24%{opacity:1;transform:translateY(0) scale(1.05)}72%{opacity:1}100%{opacity:0;transform:translateY(-12px) scale(.98)}}
    body.mxImpact #gameBoard,body.mxImpact canvas#board{animation:mxBoardImpact .18s ease-out}
    @keyframes mxGoalBreath{0%,100%{filter:drop-shadow(0 0 0 rgba(105,235,255,0));transform:scale(1)}50%{filter:drop-shadow(0 0 11px rgba(105,235,255,.42));transform:scale(1.012)}}
    @keyframes mxGoalSuccess{0%{transform:scale(1);filter:brightness(1)}45%{transform:scale(1.07);filter:brightness(1.45) drop-shadow(0 0 18px rgba(255,224,100,.75))}100%{transform:scale(1);filter:brightness(1)}}
    @keyframes mxGoalNear{0%,100%{filter:drop-shadow(0 0 4px rgba(255,183,77,.25));transform:scale(1.006)}50%{filter:brightness(1.12) drop-shadow(0 0 16px rgba(255,183,77,.78));transform:scale(1.03)}}
    @keyframes mxToolReady{0%,100%{box-shadow:0 0 0 0 rgba(255,213,80,0)}50%{box-shadow:0 0 0 5px rgba(255,213,80,.16),0 0 16px rgba(255,213,80,.35)}}
    @keyframes mxBadgeFlash{0%{transform:scale(.82);opacity:.2}55%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
    @keyframes mxHammerStrike{0%{opacity:0;transform:translate(-15%,-150%) rotate(-36deg) scale(.75)}35%{opacity:1}72%{transform:translate(-50%,-50%) rotate(8deg) scale(1.15)}100%{opacity:0;transform:translate(-50%,-42%) rotate(2deg) scale(.92)}}
    @keyframes mxPrecisionPulse{0%{opacity:0;transform:translate(-50%,-50%) scale(.35)}40%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)}}
    @keyframes mxBarrierBuild{0%{opacity:0;transform:translate(-50%,-20%) scaleY(.12) scaleX(.72)}55%{opacity:1;transform:translate(-50%,-50%) scaleY(1.16) scaleX(1.04)}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}
    @keyframes mxBoardImpact{0%{transform:translate3d(0,0,0)}35%{transform:translate3d(1.5px,-1px,0)}70%{transform:translate3d(-1px,.5px,0)}100%{transform:translate3d(0,0,0)}}
    @media (prefers-reduced-motion:reduce){#goalCard.mxGoalBreath,#goalCard.mxGoalSuccess,#goalCard.mxGoalNear,#btnHammer.mxToolReady,#btnPrecision.mxToolReady,#btnBarrier.mxToolReady,#btnHint.mxToolReady,.mxBadgeFlash,#mxToolFx,body.mxImpact #gameBoard,body.mxImpact canvas#board{animation:none!important}}
  `;document.head.appendChild(st);
  const goal=$('#goalCard');if(goal)goal.classList.add('mxGoalBreath'); // Slow blue glow reminds the player of the target; near-completion switches to a faster warm glow.
}
function gameFeelImpact(strength='light'){
  if(motionReduced())return;
  document.body.classList.remove('mxImpact');void document.body.offsetWidth;document.body.classList.add('mxImpact');
  setTimeout(()=>document.body.classList.remove('mxImpact'),220);
  if(strength==='medium')shake=Math.max(shake,.12);
}
function gameFeelAtomTrail(atom,dist){
  if(!effectsAllowed()||!atom)return;
  const br=board.getBoundingClientRect(),cx=br.left+(atom.x+.5)*T,cy=br.top+(atom.y+.5)*T;
  let cols=['#8fe9ff','#eaffff'];
  if(atom.fire)cols=['#ff7a32','#ffd36a','#fff0b0'];
  else if(atom.lightning)cols=['#8ff4ff','#fff59a','#ffffff'];
  else if(atom.frozen)cols=['#bff7ff','#eaffff','#79d9ff'];
  else if(atom.sticky)cols=['#ffd54f','#fff0a0','#ffb300'];
  else if(atom.zombie)cols=['#91ff68','#d0ff9d','#5aa832'];
  const count=Math.min(12,3+Math.floor(dist*1.4));
  for(let q=0;q<count;q++)P({k:'glit',x:cx+(Math.random()-.5)*T*.18,y:cy+(Math.random()-.5)*T*.18,vx:(Math.random()-.5)*1.25,vy:(Math.random()-.5)*1.25,r:1.2+Math.random()*2,c:rnd(cols),life:.42+Math.random()*.28,d:q*.012});
}
let mxTrailStamp=0;
function gameFeelMovingTrail(atom,screenX,screenY,t){
  if(!effectsAllowed()||motionReduced()||!atom||t-mxTrailStamp<38)return;
  mxTrailStamp=t;
  const ec=EL[atom.e]||{c:'#8fe9ff',hi:'#ffffff'};
  let cols=[ec.c,ec.hi,'#ffffff'];
  if(atom.fire)cols=['#ff7a32','#ffd36a','#fff0b0'];
  else if(atom.lightning)cols=['#8ff4ff','#fff59a','#ffffff'];
  else if(atom.frozen)cols=['#bff7ff','#eaffff','#79d9ff'];
  for(let q=0;q<2;q++)P({k:'glit',x:screenX+(Math.random()-.5)*8,y:screenY+(Math.random()-.5)*8,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,r:1.2+Math.random()*1.7,c:rnd(cols),life:.32+Math.random()*.18,d:q*.012});
}
function gameFeelToolFx(kind,gx,gy){
  if(motionReduced())return;
  const r=board.getBoundingClientRect(),x=r.left+(gx+.5)*(r.width/W),y=r.top+(gy+.5)*(r.height/H);
  const old=document.getElementById('mxToolFx');if(old)old.remove();
  const el=document.createElement('div');el.id='mxToolFx';el.className=kind;
  if(kind==='hammer')el.innerHTML='<svg class="mxStrikeHammer" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="mxStrikeMetal" x1="18" y1="14" x2="72" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#F3FDFF"/><stop offset=".42" stop-color="#79D9EF"/><stop offset="1" stop-color="#214F6B"/></linearGradient><radialGradient id="mxStrikeCore"><stop stop-color="#FFFDE0"/><stop offset=".45" stop-color="#FFD258"/><stop offset="1" stop-color="#FF8B27"/></radialGradient></defs><path d="M18 18 36 8l38 13 4 23-18 12-38-13-4-25Z" fill="url(#mxStrikeMetal)" stroke="#DFF9FF" stroke-width="3"/><path d="m31 26 31 10" stroke="#153B50" stroke-width="5" stroke-linecap="round" opacity=".72"/><rect x="39" y="40" width="15" height="48" rx="6" transform="rotate(-18 39 40)" fill="#142F40" stroke="#8CEBFF" stroke-width="3"/><circle cx="48" cy="32" r="10" fill="url(#mxStrikeCore)" stroke="#FFFAD2" stroke-width="2.5"/><path d="m44 27 8 5-8 5" stroke="#754000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  else if(kind==='barrier')el.innerHTML='<svg class="mxBuildBarrier" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 10h50l5 10v40L60 70H20L10 60V20l5-10Z" fill="#082D42" stroke="#8EF3FF" stroke-width="4"/><path d="M20 18h40l3 6v31l-8 8H25l-8-8V24l3-6Z" fill="#31DDF4" fill-opacity=".25" stroke="#D7FCFF" stroke-width="2"/><path d="M23 29h34M23 40h34M23 51h34M29 23v34M40 23v34M51 23v34" stroke="#C9FAFF" stroke-width="1.5" opacity=".55"/><path d="m40 25 10 15-10 15-10-15 10-15Z" fill="#66EEFF" fill-opacity=".55" stroke="#F0FFFF" stroke-width="2"/><circle cx="40" cy="40" r="4" fill="#FFF59A"/></svg>';
  else el.textContent='◎';el.style.left=x+'px';el.style.top=y+'px';document.body.appendChild(el);
  setTimeout(()=>el.remove(),720);
}
function gameFeelBarrierConstruct(gx,gy){
  gameFeelToolFx('barrier',gx,gy);
  if(!effectsAllowed())return;
  const r=board.getBoundingClientRect(),cx=r.left+(gx+.5)*(r.width/W),cy=r.top+(gy+.5)*(r.height/H);
  for(let q=0;q<24;q++){const side=q%4,off=(Math.random()-.5)*T*.62;let x=cx,y=cy,vx=0,vy=0;if(side===0){x+=off;y+=T*.32;vy=-1.2}else if(side===1){x+=T*.32;y+=off;vx=-1.2}else if(side===2){x+=off;y-=T*.32;vy=1.2}else{x-=T*.32;y+=off;vx=1.2}P({k:'glit',x,y,vx:vx+(Math.random()-.5)*.35,vy:vy+(Math.random()-.5)*.35,r:1.4+Math.random()*2,c:q%3?'#72e8ff':'#ffffff',life:.6,d:q*.012});}
}
function gameFeelPrecisionPulse(i){
  const a=atoms[i];if(!a)return;gameFeelToolFx('precision',a.x,a.y);
  if(!effectsAllowed())return;
  const r=board.getBoundingClientRect(),cx=r.left+(a.x+.5)*(r.width/W),cy=r.top+(a.y+.5)*(r.height/H);
  for(let q=0;q<18;q++){const ang=q/18*Math.PI*2;P({k:'ring',x:cx,y:cy,vx:Math.cos(ang)*.15,vy:Math.sin(ang)*.15,r:5+q*.25,vr2:35+q*2,c:q%2?'#8fe9ff':'#ffffff',life:.48,d:q*.006});}
}
function animateResultCoins(amount){
  const el=document.querySelector('#modalBox .mxCoinCountFlow');if(!el||amount<=0)return;
  const rewardLine=el.closest('.mcoins');if(rewardLine)rewardLine.classList.add('mxCoinRewardLine');
  const start=performance.now(),dur=760;function step(now){const p=Math.min(1,(now-start)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(amount*e);if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);
  setTimeout(()=>flyMoleCoinsToCounter(amount,rewardLine||el),260);
}
function flyMoleCoinsToCounter(amount,source){
  if(amount<=0)return;
  const realTarget=$('#coinChip')||$('#labCoinChip');if(!realTarget||!source)return;
  const sr=source.getBoundingClientRect(),baseRect=realTarget.getBoundingClientRect();
  if(!sr.width||!baseRect.width)return;
  const startBalance=Math.max(0,coinBalance()-amount);
  const mainNum=$('#coinChip span:last-child'),labNum=$('#labCoinChip span:last-child');
  if(mainNum)mainNum.textContent=startBalance.toLocaleString();if(labNum)labNum.textContent=startBalance.toLocaleString();
  const portal=realTarget.cloneNode(true);portal.removeAttribute('id');portal.setAttribute('aria-hidden','true');portal.classList.add('mxCoinCounterPortal');
  portal.style.left=baseRect.left+'px';portal.style.top=baseRect.top+'px';portal.style.width=baseRect.width+'px';portal.style.height=baseRect.height+'px';
  const portalNum=portal.querySelector('span:last-child');if(portalNum)portalNum.textContent=startBalance.toLocaleString();
  const gain=document.createElement('span');gain.className='mxCoinGainFloat';gain.textContent='+'+amount.toLocaleString();portal.appendChild(gain);document.body.appendChild(portal);
  const tr=portal.getBoundingClientRect(),count=motionReduced()?1:Math.max(6,Math.min(16,Math.round(amount/16)+6));
  const finish=()=>{if(mainNum)mainNum.textContent=coinBalance().toLocaleString();if(labNum)labNum.textContent=coinBalance().toLocaleString();if(portalNum)portalNum.textContent=coinBalance().toLocaleString();portal.classList.add('mxCoinDone');setTimeout(()=>portal.remove(),880);};
  if(motionReduced()){portal.classList.add('mxCoinArrive');SFX.coin();finish();return;}
  for(let i=0;i<count;i++){
    const c=document.createElement('i');c.className='mxFlyingCoin';document.body.appendChild(c);
    const sx=sr.left+sr.width*.72+(Math.random()-.5)*34,sy=sr.top+sr.height*.55+(Math.random()-.5)*18;
    const tx=tr.left+tr.width*.32,ty=tr.top+tr.height*.5;
    c.style.left=(sx-12)+'px';c.style.top=(sy-12)+'px';c.style.opacity='0';
    const delay=i*68,dur=720+Math.random()*170,arc=72+Math.random()*58;
    c.animate([
      {transform:'translate3d(0,14px,0) scale(.5) rotate(0deg)',opacity:0},
      {transform:'translate3d(0,0,0) scale(1.16) rotate(90deg)',opacity:1,offset:.14},
      {transform:`translate3d(${(tx-sx)*.50}px,${(ty-sy)-arc}px,0) scale(1.02) rotate(410deg)`,opacity:1,offset:.57},
      {transform:`translate3d(${tx-sx}px,${ty-sy}px,0) scale(.34) rotate(820deg)`,opacity:.08}
    ],{duration:dur,delay,easing:'cubic-bezier(.18,.72,.15,1)',fill:'forwards'}).onfinish=()=>{
      c.remove();const arrived=i+1,next=Math.round(startBalance+amount*(arrived/count));
      if(mainNum)mainNum.textContent=next.toLocaleString();if(labNum)labNum.textContent=next.toLocaleString();if(portalNum)portalNum.textContent=next.toLocaleString();
      portal.classList.remove('mxCoinArrive');void portal.offsetWidth;portal.classList.add('mxCoinArrive');
      if(i===0||i===count-1||i%3===0)SFX.coin();if(i===count-1)finish();
    };
  }
}
function gameFeelToolState(){
  const h=$('#btnHammer'),p=$('#btnPrecision'),br=$('#btnBarrier'),hi=$('#btnHint');
  if(h)h.classList.toggle('mxToolReady',!h.hidden&&!h.disabled&&boosterCount('hammer')>0);
  if(p)p.classList.toggle('mxToolReady',!p.hidden&&!p.disabled&&boosterCount('precision')>0);
  if(br)br.classList.toggle('mxToolReady',!br.hidden&&!br.disabled&&boosterCount('barrier')>0);
  if(hi)hi.classList.toggle('mxToolReady',!hi.disabled&&!won);
}
function gameFeelWinBurst(){
  installGameFeelPolish();
  const goal=$('#goalCard');if(goal){goal.classList.remove('mxGoalBreath','mxGoalNear','mxGoalSuccess');void goal.offsetWidth;goal.classList.add('mxGoalSuccess');}
  if(!effectsAllowed())return;
  const r=board.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const cols=['#fff4a8','#ffd23f','#8fe9ff','#ffffff','#c88cff'];
  for(let q=0;q<42;q++){const a=Math.random()*Math.PI*2,sp=1.2+Math.random()*3.5;P({k:'glit',x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.1,r:1.6+Math.random()*3,c:rnd(cols),life:.9+Math.random()*.45,d:q*.008});}
  gameFeelImpact('medium');
}
setTimeout(()=>{installGameFeelPolish();gameFeelToolState();},0);

function slidePlan(i,d){
  const[dx,dy]=DIRS[d];let x=atoms[i].x,y=atoms[i].y,barrierHit=null;
  while(true){
    const nx=x+dx,ny=y+dy;
    if(temporaryBarriers.has(barrierKey(nx,ny))){barrierHit=barrierKey(nx,ny);break;}
    if(grid[ny][nx]||atoms.some((a,k)=>k!==i&&a.x===nx&&a.y===ny)||!oneWayAllows(x,y,nx,ny,d))break;
    x=nx;y=ny;
  }
  return{dest:(x===atoms[i].x&&y===atoms[i].y)?null:{x,y},barrierHit};
}
function slideDest(i,d){return slidePlan(i,d).dest;}
function isFullyBoxed(i){
  if(i<0||!atoms[i]||atoms[i].frozen)return false;
  for(let d=0;d<4;d++){if(slidePlan(i,d).dest)return false;}
  return true;
}
function breakTemporaryBarrier(key){
  const b=temporaryBarriers.get(key);if(!b)return;temporaryBarriers.delete(key);
  const br=board.getBoundingClientRect(),cx=br.left+(b.x+.5)*T,cy=br.top+(b.y+.5)*T;
  SFX.thunk();mxHaptic('medium');shake=motionReduced()?0:.14;
  let crack=null;
  if(!motionReduced()){
    crack=document.createElement('div');crack.className='mxBarrierCrack';crack.style.left=cx+'px';crack.style.top=cy+'px';
    crack.innerHTML='<i></i><i></i><i></i><i></i><i></i>';document.body.appendChild(crack);
    requestAnimationFrame(()=>crack.classList.add('on'));
  }
  setTimeout(()=>{
    if(crack)crack.classList.add('break');
    if(effectsAllowed()){
      for(let q=0;q<26;q++){const a=Math.random()*Math.PI*2,sp=.8+Math.random()*3.2;P({k:'crys',x:cx+(Math.random()-.5)*8,y:cy+(Math.random()-.5)*8,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.1,w:2+Math.random()*6,rot:Math.random()*7,vr:(Math.random()-.5)*.6,c:q%4===0?'#ffffff':q%2?'#7fe8ff':'#4fb9ff',life:.75+Math.random()*.45,d:q*.006});}
      for(let q=0;q<16;q++){const a=q/16*Math.PI*2;P({k:'glit',x:cx,y:cy,vx:Math.cos(a)*(1.2+Math.random()*2),vy:Math.sin(a)*(1.2+Math.random()*2),r:1.3+Math.random()*2.2,c:q%2?'#bff8ff':'#ffffff',life:.52,d:q*.006});}
      P({k:'ring',x:cx,y:cy,r:7,vr2:105,c:'#8fefff',life:.42});
    }
    setTimeout(()=>{if(crack)crack.remove();},380);
  },motionReduced()?0:145);
  say(LANG==='tr'?'Nano Bariyer çatladı ve ilk çarpışmada dağıldı.':'The Nano Barrier cracked and shattered on first collision.','talk',2200,'glow');
}
function move(i,d){
  if(precisionMode&&!precisionExecuting){attemptPrecisionMove(i,d);return;}
  if(onlineDuelConnectionPaused())return;
  if(anim||movingWallAnimating||fragileFailure||won||i<0||(chainAutoActive&&!chainAutoExecuting))return;
  if(secureAttemptPending){
    const now=Date.now();
    if(now-secureAttemptNoticeAt>1800){secureAttemptNoticeAt=now;prop('🔒',1200);say(t('securePreparing'),'talk',1800,'glow');}
    return;
  }
  if(atoms[i].frozen){SFX.thunk();mxHaptic('error');nudge={i,d,t0:performance.now()};say(rnd(LN.frozen),'sad',2600,'shk');return;}
  const chainOn=chainActive(),crystalOn=crystalActive(),reactorOn=reactorActive();
  const chainTrigger=chainOn&&!chainAutoExecuting?chainTriggerForMove(i,d):null;
  const linkedPlan=!precisionExecuting?linkedMovePlan(i,d):null;
  const normalPlan=(!linkedPlan&&!precisionExecuting)?slidePlan(i,d):null;
  let dest=linkedPlan?linkedPlan.main:(precisionExecuting?precisionDest(i,d):normalPlan.dest);
  const barrierHit=normalPlan&&normalPlan.barrierHit;
  if(!dest&&barrierHit){
    hist.push({fullAtoms:atoms.map(a=>({...a})),movesBefore:moves,moveLogLen:moveLog.length,barrierState:[...temporaryBarriers.values()].map(b=>({...b})),movingWallState:movingWallSnapshot()});
    moves++;moveLog.push({i,d,barrier:true});breakTemporaryBarrier(barrierHit);updateHUD();gameFeelToolState();resetIdle();return;
  }
  if(!dest){
    SFX.thunk();mxHaptic('error');nudge={i,d,t0:performance.now()};gameFeelImpact('light');bumpN++;
    stuckAtomCount=(stuckAtomIdx===i)?stuckAtomCount+1:1;stuckAtomIdx=i;
    if(stuckAtomCount>=3&&isFullyBoxed(i)){
      stuckAtomCount=0;
      say(LANG==='tr'?'Bu atom her yönden kapalı, buradan hareket edemez. GERİ AL ile önceki hamlelerini geri al, ya da YENİDEN ile bölümü baştan başlat.':'This atom is boxed in on every side — it cannot move from here. Use UNDO to back out of recent moves, or RESTART to start the level fresh.','sad',5200,'shk');
      prop('🧭',2200);
    }else if(bumpN%4===3){say(rnd(LN.bump),'sad',2600,'shk');prop('🤦',1200);}
    return;
  }
  const reactorPath=reactorOn?crystalPathBetween(atoms[i].x,atoms[i].y,dest.x,dest.y):null;
  const laserBlock=reactorOn?reactorFirstActiveGate(reactorPath):null;
  if(laserBlock){
    // Active lasers are temporary walls. From a distance the atom reaches the
    // square immediately before the beam, so the player can turn and route
    // around it. A penalty is applied only when pushing into an adjacent beam.
    if(laserBlock.index===0){sel=i;reactorHit(laserBlock.gate,d);return;}
    const stop=reactorPath[laserBlock.index-1];
    dest={x:stop.x,y:stop.y};
  }
  if(!chainAutoExecuting){
    const needsFullSnapshot=chainOn||atoms.some(a=>a.fragile)||linkedPairs.length>0;
    hist.push(needsFullSnapshot?{fullAtoms:atoms.map(a=>({...a})),movesBefore:moves,moveLogLen:moveLog.length,chainState:chainOn?{currentStep:chainCurrentStep,maxCombo:chainMaxCombo,reactions:chainReactions,autoMoves:chainAutoMoves}:null,crystalState:crystalOn?crystals.map(c=>!!c.collected):null,movingWallState:movingWallSnapshot()}:{i,x:atoms[i].x,y:atoms[i].y,crystalState:crystalOn?crystals.map(c=>!!c.collected):null,movingWallState:movingWallSnapshot()});
    moves++;moveLog.push({i,d,precision:!!precisionExecuting});
  }else if(campaignFeature==='chain'){
    moves++;moveLog.push({i,d});
  }
  hintMark=null;sel=i;clearTimeout(autoHintT);
  if(barrierHit)breakTemporaryBarrier(barrierHit);
  const dist=Math.abs(dest.x-atoms[i].x)+Math.abs(dest.y-atoms[i].y);
  const crystalPath=crystalOn?crystalPathBetween(atoms[i].x,atoms[i].y,dest.x,dest.y):null;
  const moveFrom={x:atoms[i].x,y:atoms[i].y};
  anim={i,fx:atoms[i].x,fy:atoms[i].y,tx:dest.x,ty:dest.y,t0:performance.now(),dur:80+dist*55,crystalPath,chainTrigger,chainAutoStep:!!chainAutoExecuting,prevBonds:bondsMatched(),partner:linkedPlan?{i:linkedPlan.j,fx:atoms[linkedPlan.j].x,fy:atoms[linkedPlan.j].y,tx:linkedPlan.mate.x,ty:linkedPlan.mate.y}:null};
  if(onlineDuelMode)publishOnlineMoveEvent(i,d,moveFrom,dest,anim.dur);
  SFX.slide(dist);mxHaptic('light');gameFeelAtomTrail(atoms[i],dist);updateHUD();gameFeelToolState();resetIdle();
  look(-0.7,-0.6,620,dist>=5?0.55:null);
  if(lv===0&&tut<2){tut=2;$('#dpad').classList.remove('pulse');say(t('firstSlide'),'happy',4500);}
  else if(!strugglingSaid&&!dailyMode&&!duelMode&&!crystalMode&&!chainMode&&!reactorMode&&LV&&moves>=Math.max(Math.round((LV.p||6)*2.5),(LV.mn||LV.p||6)+6)){
    strugglingSaid=true;
    setTimeout(()=>{if(!won)say(LANG==='tr'?'Bu bölüm biraz uzadı. Sıkışırsan İPUCU dene, ya da GERİ AL / YENİDEN ile temiz bir başlangıç yap — hepsi ilerlemeni koruyor.':'This one is running long. If you feel stuck, try HINT, or use UNDO / RESTART for a clean start — none of them cost your progress.','talk',5600,'glow');},900);
  }
}
function applyLightningAtoms(level,index,mode){
  if(mode!=='campaign'||dailyMode||duelMode||crystalMode||chainMode||reactorMode)return;
  // Existing certified boards are preserved. These campaign chapters only
  // decorate a movable atom; the pulse can make the puzzle easier, never block it.
  const plans={110:0,111:0,131:0,144:0,145:0};
  const pick=plans[index];
  if(pick===undefined||!atoms[pick]||atoms[pick].frozen)return;
  atoms[pick].lightning=true;
}
function lightningConnectedGroup(startIdx){
  const seen=new Set([startIdx]),queue=[startIdx];
  while(queue.length){
    const i=queue.shift(),a=atoms[i];
    for(let j=0;j<atoms.length;j++){
      if(seen.has(j))continue;
      const b=atoms[j];
      if(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1){seen.add(j);queue.push(j);}
    }
  }
  return [...seen];
}
function lightningBurst(indices){
  if(!indices.length)return;
  const r=board.getBoundingClientRect();
  for(const idx of indices){
    const a=atoms[idx],cx=r.left+(a.x+.5)*T,cy=r.top+(a.y+.5)*T;
    if(effectsAllowed())for(let q=0;q<10;q++){const ang=Math.random()*Math.PI*2;P({k:'glit',x:cx,y:cy,vx:Math.cos(ang)*(1+Math.random()*1.7),vy:Math.sin(ang)*(1+Math.random()*1.7),r:1.6+Math.random()*2.2,c:rnd(['#fff9a6','#9ff4ff','#ffffff','#71c8ff']),life:.72,d:q*.012});}
  }
  SFX.sparkle&&SFX.sparkle();mxHaptic('medium');
}
function checkLightning(movedIdx){
  const source=atoms[movedIdx];
  if(!source||!source.lightning)return false;
  const group=lightningConnectedGroup(movedIdx);
  if(group.length<2)return false;
  const thawed=[];
  for(const idx of group){
    const a=atoms[idx];
    if(idx!==movedIdx&&a.frozen){a.frozen=false;if(a.zombie){a.zombie=false;a.zombieGen=0;}thawed.push(idx);}
  }
  if(!thawed.length)return false;
  lightningBurst([movedIdx,...thawed]);
  say(t('lightningMsg'),'happy',3600,'glow');
  return true;
}
function checkZombie(movedIdx){
  const m=atoms[movedIdx];
  if(!m||m.frozen||m.zombie)return false;
  for(const z of atoms){
    if(!z.zombie||z===m)continue;
    const gen=z.zombieGen||0;
    if(gen>=2)continue;
    if(Math.abs(m.x-z.x)+Math.abs(m.y-z.y)===1){
      m.frozen=true;m.zombie=true;m.zombieGen=gen+1;
      const r=board.getBoundingClientRect();
      const cx=r.left+(m.x+0.5)*T,cy=r.top+(m.y+0.5)*T;
      for(let i=0;i<12;i++)P({k:'glit',x:cx,y:cy,vx:(Math.random()-0.5)*1.8,vy:(Math.random()-0.5)*1.8,r:2+Math.random()*2.5,c:rnd(['#7ee85a','#a8ff6e','#3a5c1e']),life:1.0,d:Math.random()*0.2});
      SFX.thunk();
      say(t('zombieMsg'),'sad',3000,'shk');
      return true;
    }
  }
  return false;
}
function checkStick(movedIdx){
  const m=atoms[movedIdx];
  if(!m||m.frozen)return false;
  for(const s of atoms){
    if(!s.sticky||s===m)continue;
    if(Math.abs(m.x-s.x)+Math.abs(m.y-s.y)===1){
      m.frozen=true;
      const r=board.getBoundingClientRect();
      const cx=r.left+(m.x+0.5)*T,cy=r.top+(m.y+0.5)*T;
      for(let i=0;i<10;i++)P({k:'glit',x:cx,y:cy,vx:(Math.random()-0.5)*1.6,vy:(Math.random()-0.5)*1.6,r:2+Math.random()*2,c:rnd(['#ffd54f','#ffb300','#fff']),life:0.9,d:Math.random()*0.2});
      SFX.thunk();
      say(t('stickMsg'),'sad',3000,'shk');
      return true;
    }
  }
  return false;
}
function checkMelt(){
  let melted=null,cured=false;
  for(const f of atoms){
    if(!f.fire)continue;
    for(const fr of atoms){
      if(!fr.frozen)continue;
      if(Math.abs(f.x-fr.x)+Math.abs(f.y-fr.y)===1){
        if(fr.zombie){fr.zombie=false;fr.zombieGen=0;cured=true;}
        fr.frozen=false;melted=fr;
      }
    }
  }
  if(melted){
    const r=board.getBoundingClientRect();
    const cx=r.left+(melted.x+0.5)*T,cy=r.top+(melted.y+0.5)*T;
    for(let i=0;i<14;i++)P({k:'glit',x:cx,y:cy,vx:(Math.random()-0.5)*2.5,vy:-0.5-Math.random()*1.8,r:2+Math.random()*2.5,c:rnd(cured?['#7ee85a','#cfe9ff','#fff']:['#cfe9ff','#9fd6ff','#fff']),life:1.1,d:Math.random()*0.3});
    SFX.hint();
    say(t(cured?'cureMsg':'meltMsg'),'happy',3200,'glow');
  }
}

function checkFragileImpact(movedIdx){
  const a=atoms[movedIdx];
  if(!a||!a.fragile||a.fragileBroken)return false;
  a.fragileHits=(a.fragileHits||0)+1;
  const r=board.getBoundingClientRect(),cx=r.left+(a.x+.5)*T,cy=r.top+(a.y+.5)*T;
  if(a.fragileHits<a.fragileMax){
    if(effectsAllowed())for(let q=0;q<8+3*a.fragileHits;q++){const ang=Math.random()*Math.PI*2;P({k:'glit',x:cx,y:cy,vx:Math.cos(ang)*(0.7+Math.random()),vy:Math.sin(ang)*(0.7+Math.random()),r:1.4+Math.random()*1.7,c:rnd(['#ffffff','#bcecff','#8bd5ff']),life:.55,d:q*.012});}
    SFX.thunk&&SFX.thunk();mxHaptic(a.fragileHits===2?'medium':'light');
    say(LANG==='tr'?('Kırılgan atom çatladı: '+a.fragileHits+'/'+a.fragileMax+' darbe.'):(`Fragile atom cracked: ${a.fragileHits}/${a.fragileMax} impacts.`),'talk',2300,'shk');
    return false;
  }
  a.fragileBroken=true;fragileFailure=true;
  if(effectsAllowed())for(let q=0;q<28;q++){const ang=Math.random()*Math.PI*2,sp=1.1+Math.random()*2.8;P({k:'glit',x:cx,y:cy,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-0.5,r:1.8+Math.random()*2.8,c:rnd(['#ffffff','#bcecff','#72c9ff','#d9f7ff']),life:.9,d:q*.008});}
  SFX.thunk&&SFX.thunk();mxHaptic('error');if(!motionReduced())shake=Math.max(shake,.32);
  say(LANG==='tr'?'💥 Kırılgan atom parçalandı! Deney yeniden başlıyor.':'💥 The fragile atom shattered! Restarting the experiment.','sad',2600,'shk');
  setTimeout(()=>{if(fragileFailure&&!duelMode)startLevel(lv);},1300);
  return true;
}

function afterMove(movedIdx){
  if(movedIdx!==undefined)checkLightning(movedIdx);
  checkMelt();

  // IMPORTANT: validate the completed molecule before applying fragile-atom
  // damage. A fragile atom is allowed to make the final required stop, even
  // when that stop is its third impact. Previously the atom shattered first,
  // so a correctly completed level could restart instead of showing victory.
  const moleculeReady=curMol.key===atoms.map(a=>a.e+','+(a.x-Math.min(...atoms.map(b=>b.x)))+','+(a.y-Math.min(...atoms.map(b=>b.y)))).sort().join('|');
  const objectiveReady=!crystalActive()||crystalCollectedCount()>=CRYSTAL_COUNT;
  if(moleculeReady&&objectiveReady){
    winSeq();
    return;
  }
  if(moleculeReady&&crystalActive()&&!objectiveReady&&!crystalGoalWarned){
    crystalGoalWarned=true;say(crystalCopy().needAll,'talk',3400,'glow');prop(labComponentHud(),1800);
  }

  if(movedIdx!==undefined&&checkFragileImpact(movedIdx))return;
  if(movedIdx!==undefined){checkStick(movedIdx);checkZombie(movedIdx);}
  updatePressureDoors(true);
  advanceMovingWalls();
  updateIntensity();
  if(onlineDuelMode)queueOnlineLiveState();
  if(demoMode)return;
  if(tutorialActive&&tutorialStep===3&&movedIdx===0){tutorialGoStep(4);}
  if(!slowSaid&&moves>t2&&!won&&!tutorialActive){slowSaid=true;say(rnd(LN.slow),'talk',3200,'shk');einMood('wag',800);}
}
function undo(){
  if(anim||won||!hist.length||chainAutoActive)return;
  const h=hist.pop();
  if(h.fullAtoms){atoms=h.fullAtoms.map(a=>({...a}));fragileFailure=false;if(h.chainState){chainCurrentStep=h.chainState.currentStep;chainMaxCombo=h.chainState.maxCombo;chainReactions=h.chainState.reactions;chainAutoMoves=h.chainState.autoMoves;}chainAutoActive=false;chainAutoQueue=[];chainCurrentCombo=1;}else{atoms[h.i].x=h.x;atoms[h.i].y=h.y;}
  if(crystalActive()&&h.crystalState)crystals.forEach((c,i)=>{c.collected=!!h.crystalState[i];});
  if(h.movingWallState)restoreMovingWalls(h.movingWallState);
  setDrEPose('clipboard',3900,3);
  updatePressureDoors(false);
  if(h.movesBefore!==undefined){moves=h.movesBefore;moveLog.length=Math.max(0,h.moveLogLen||0);}else{moveLog.pop();moves=Math.max(0,moves-1);}
  sel=h.i!==undefined?h.i:0;crystalGoalWarned=false;if(chainActive())chainRefreshStep();SFX.undo();updateHUD();updateIntensity();if(onlineDuelMode)queueOnlineLiveState(true);resetIdle();
}
function showSpecificHint(){
  if(moves!==0)return false;
  const raw=Array.isArray(LV.h)?LV.h:null;
  let i=raw?atoms.findIndex(a=>a.x===raw[0]&&a.y===raw[1]):-1;
  let d=raw&&Number.isInteger(raw[2])?raw[2]:-1;
  if((i<0||d<0||d>3)&&Array.isArray(LV.fs)&&LV.fs.length){
    const first=LV.fs[0];
    if(Array.isArray(first)&&atoms[first[0]]&&Number.isInteger(first[1])&&first[1]>=0&&first[1]<=3){i=first[0];d=first[1];}
  }
  if(i<0||!atoms[i]||d<0||d>3)return false;
  sel=i;hintMark={i,d};wink();prop('💡',2600);
  setDrEPose('magnifier',6200,4,true);
  say(t('hintDir',atoms[i].e,DIRN_()[d],DIRAR[d]),'talk',5200,'glow');
  return true;
}
function scheduleAutoHint2(){clearTimeout(autoHintT);}
function showGeneralHint(){
  closeModal();
  setDrEPose('thinking',6400,4,true);
  hintStep=1;attemptHintCount++;SFX.hint();
  einAuraPulse('einAuraBlue',1100);
  save.totalHints=(save.totalHints||0)+1;persist();
  if(save.totalHints===15){setTimeout(()=>say(t('hint15'),'happy',4500),1400);}
  else if(save.totalHints===50){setTimeout(()=>say(t('hint50'),'happy',4800),1400);}
  say('💡 '+tipOf(mid),'talk',5200,'glow');prop('💡',2600);lidHalf(true);setTimeout(()=>lidHalf(false),900);
}
function hint(){
  if(won)return;
  resetIdle();clearTimeout(autoHintT);
  setDrEPose('thinking',6400,4,true);
  offerPaidHint();
}
function offerPaidHint(){
  ensureCoinLedger(save);
  const costs=labHintCosts(),free=quantumHintAvailable();
  openModal('<h3>'+t('paidHintTitle')+'</h3><div class="msub">'+(free?(LANG==='tr'?'Kuantum masan bugünün kesin hamlesini ücretsiz hazırladı.':'Your quantum desk prepared today’s exact move for free.'):t('paidHintMsg',coinBalance()))+'</div><div class="mrow" style="flex-direction:column;gap:10px">'+
    '<button class="btn green" id="mHintGeneral">💡 '+(LANG==='tr'?'ÜCRETSİZ GENEL TAVSİYE':'FREE GENERAL CLUE')+'</button>'+ 
    '<button class="btn blue" id="mHint50" '+(!free&&coinBalance()<costs.move?'disabled style="opacity:.45"':'')+'>'+(LANG==='tr'?'⚡ SONRAKİ KESİN HAMLE':'⚡ NEXT EXACT MOVE')+' — '+(free?(LANG==='tr'?'ÜCRETSİZ':'FREE'):costs.move+' 🪙')+'</button>'+
    '<button class="btn amber" id="mHint200" '+(coinBalance()<costs.full?'disabled style="opacity:.45"':'')+'>'+(LANG==='tr'?'🏆 KALAN ÇÖZÜMÜ GÖSTER':'🏆 SHOW THE REST')+' — '+costs.full+' 🪙</button>'+
    '<button class="btn ghost" id="mHintShop">🛒 '+(LANG==='tr'?'LABORATUVAR MAĞAZASI':'LABORATORY SHOP')+'</button>'+
    '<button class="btn ghost" id="mHintCancel">'+t('cancel')+'</button></div>');
  bindTap('#mHintGeneral',()=>showGeneralHint());
  bindTap('#mHint50',()=>{if(free){buyHint(0,false,true);}else if(coinBalance()>=costs.move)buyHint(costs.move,false);});
  bindTap('#mHint200',()=>{if(coinBalance()>=costs.full)buyHint(costs.full,true);});
  bindTap('#mHintShop',()=>{closeModal();show('lab');setLabTab('shop');});
  bindTap('#mHintCancel',()=>closeModal());
}
function pathStates(sol){
  // Fixed 2026-07-30: this replay previously only ever moved the single
  // triggering atom (via slideDest), never its linked mate. On levels with
  // a linked pair (167, 170, 176, 180) the REAL move() function always moves
  // both atoms together via linkedMovePlan(), so after the player's first
  // linked move, this function's simulated states permanently diverged from
  // the actual achievable board — matchCurrentToPath() could then never find
  // a match again. Symptom: tapping the paid hint after that point always
  // fell through to hintTryUndo (and for the free daily hint, consumeQuantumHint()
  // still burned the freebie first since that call did not depend on the
  // match succeeding), so the hint felt "bought" but did nothing and the
  // player had no way to keep getting guided help. Levels 167/170/176/180
  // were never actually unsolvable — UNDO, manual play, and "SHOW THE REST"
  // (which restarts and replays via the real move()) always worked — but the
  // single-move hint silently stopped working. Mirroring linkedMovePlan()
  // here (the same function the real move() uses) keeps this replay in sync.
  const states=[LV.a.map(a=>({x:a[0],y:a[1],e:a[2]}))];
  const savedAtoms=atoms;
  let cur=states[0].map(a=>({...a}));
  for(const[i,d]of sol){
    atoms=cur;
    const linkedPlan=linkedMovePlan(i,d);
    if(linkedPlan){
      cur=cur.map((a,idx)=>idx===i?{...a,x:linkedPlan.main.x,y:linkedPlan.main.y}:(idx===linkedPlan.j?{...a,x:linkedPlan.mate.x,y:linkedPlan.mate.y}:a));
    }else{
      const dest=slideDest(i,d);
      cur=cur.map((a,idx)=>idx===i?{...a,x:dest.x,y:dest.y}:a);
    }
    states.push(cur.map(a=>({...a})));
  }
  atoms=savedAtoms;
  return states;
}
function stateKey(s){
  const byE={};
  for(const a of s)(byE[a.e]=byE[a.e]||[]).push(a.x*32+a.y);
  return Object.keys(byE).sort().map(e=>e+':'+byE[e].sort((x,y)=>x-y).join(',')).join('|');
}
function matchCurrentToPath(sol){
  const states=pathStates(sol);
  const curKey=stateKey(atoms.map(a=>({x:a.x,y:a.y,e:a.e})));
  for(let k=0;k<states.length-1;k++){
    if(stateKey(states[k])===curKey)return sol[k];
  }
  return null;
}
function hintPlayMode(){
  return crystalMode?'crystal':(dailyMode?'daily':'campaign');
}
function refundHintCoins(amount){
  ensureCoinLedger(save);amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return;
  const spent=Math.max(0,Math.floor(Number(save.researchAchievements[COIN_SPEND_KEY])||0));
  save.researchAchievements[COIN_SPEND_KEY]=Math.max(0,spent-amount);
  ensureCoinLedger(save);persist();updateCoins(true);
}
function displayExactMove(nextMove,cost,useQuantum,resetToRoute){
  if(!nextMove)return false;
  if(useQuantum){if(!consumeQuantumHint())return false;}
  else if(cost>0&&!spendCoins(cost))return false;
  persist();updateCoins(false);
  const[i,d]=nextMove;
  if(!atoms[i]){
    if(cost>0)refundHintCoins(cost);
    return false;
  }
  sel=i;hintMark={i,d};wink();prop('💡 '+DIRAR[d],3200);
  const prefix=resetToRoute?(LANG==='tr'?'Çözüm rotasına dönüldü. ':'Solution route restored. '):'';
  say(prefix+t('hintDir',atoms[i].e,DIRN_()[d],DIRAR[d]),'talk',6200,'glow');
  SFX.hint();
  return true;
}
function buyHint(cost,full,useQuantum){
  attemptHintCount++;
  const sol=LV.fs;
  if(!sol||!sol.length){closeModal();say(t('hintNoSolve'),'sad',3200,'shk');return;}
  if(!full){
    let nextMove=matchCurrentToPath(sol);
    closeModal();
    if(nextMove){
      displayExactMove(nextMove,cost,useQuantum,false);
      return;
    }
    // The player has left the certified route. Ask before resetting so the
    // player's current board is never erased unexpectedly. Currency is charged
    // only after the restarted level visibly highlights the certified move.
    openModal('<h3>'+(LANG==='tr'?'ÇÖZÜM ROTASINA DÖN':'RETURN TO SOLUTION ROUTE')+'</h3><div class="msub">'+(LANG==='tr'?'Kesin hamleyi göstermek için bölüm başlangıç düzenine dönecek. Mevcut hamlelerin silinecek; henüz MoleCoin alınmadı. Devam edilsin mi?':'To show the exact move, the level must return to its starting layout. Your current moves will be cleared; no MoleCoins have been charged yet. Continue?')+'</div><div class="mrow"><button class="btn amber" id="mHintRestartYes">'+(LANG==='tr'?'EVET, BAŞTAN BAŞLAT':'YES, RESTART')+'</button><button class="btn ghost" id="mHintRestartNo">'+t('cancel')+'</button></div>');
    bindTap('#mHintRestartNo',()=>closeModal());
    bindTap('#mHintRestartYes',()=>{
      const mode=hintPlayMode(),seenFrozen=save.seenFrozen;
      closeModal();startLevel(lv,mode);save.seenFrozen=seenFrozen;
      setTimeout(()=>{
        nextMove=matchCurrentToPath(sol)||sol[0];
        if(!displayExactMove(nextMove,cost,useQuantum,true)){
          say(LANG==='tr'?'İpucu gösterilemedi; MoleCoin alınmadı.':'The hint could not be shown; no MoleCoins were charged.','sad',4200,'shk');
        }
      },220);
    });
    return;
  }
  // Validate that the certified solution has a playable first move before any
  // currency is deducted. Full solution uses the real move engine and refunds
  // automatically if playback cannot begin or stalls unexpectedly.
  const mode=hintPlayMode(),seenFrozen=save.seenFrozen;
  closeModal();
  startLevel(lv,mode);
  save.seenFrozen=seenFrozen;
  const first=sol[0];
  const firstPlayable=first&&atoms[first[0]]&&(linkedMovePlan(first[0],first[1])||slideDest(first[0],first[1]));
  if(!firstPlayable){
    say(LANG==='tr'?'Çözüm başlatılamadı; MoleCoin alınmadı.':'The solution could not start; no MoleCoins were charged.','sad',4200,'shk');
    return;
  }
  if(cost>0&&!spendCoins(cost))return;
  persist();updateCoins(false);
  assistanceUsed=true;
  attemptHintCount=1;
  say(t('paidHintPlaying'),'excited',3400,'glow');
  setTimeout(()=>playAutoSolve(sol,0,{cost,retries:0,lastMoves:moves}),700);
}
function playAutoSolve(sol,idx,ctx){
  ctx=ctx||{cost:0,retries:0,lastMoves:moves};
  if(won)return;
  if(idx>=sol.length){
    if(!won){
      if(ctx.cost)refundHintCoins(ctx.cost);
      say(LANG==='tr'?'Çözüm tamamlanamadı; MoleCoin iade edildi.':'The solution could not finish; your MoleCoins were refunded.','sad',4600,'shk');
    }
    return;
  }
  if(anim||chainAutoActive){setTimeout(()=>playAutoSolve(sol,idx,ctx),120);return;}
  const[i,d]=sol[idx];
  const before=moves;
  move(i,d);
  setTimeout(()=>{
    if(won)return;
    if(moves<=before){
      ctx.retries=(ctx.retries||0)+1;
      if(ctx.retries<=4){setTimeout(()=>playAutoSolve(sol,idx,ctx),180);return;}
      if(ctx.cost)refundHintCoins(ctx.cost);
      say(LANG==='tr'?'Çözüm oynatılamadı; MoleCoin iade edildi.':'The solution could not be played; your MoleCoins were refunded.','sad',4600,'shk');
      return;
    }
    ctx.retries=0;ctx.lastMoves=moves;
    setTimeout(()=>playAutoSolve(sol,idx+1,ctx),120);
  },160);
}

/* ================= WIN ================= */
function performanceCopy(){
  const tr=LANG==='tr';
  return {
    complete:{label:'COMPLETE!',quotes:tr?['Tepkime tamamlandı — şimdi daha kısa yolu bulalım!','Başardın! Bir sonraki deneyde daha az hamle deneyelim.']:['Reaction complete — now let’s find the shorter route!','You did it! Let’s trim a few moves next time.']},
    nice:{label:'NICE!',quotes:tr?['Sağlam bir reaksiyon!','Formül çalışıyor, bilim insanı!','Laboratuvar bu çözümü onayladı!']:['A solid reaction!','Your formula is working!','The lab approves this solution!']},
    perfect:{label:'PERFECT!',quotes:tr?['Bilimin öngördüğü gibi!','Tek bir hamle bile boşa gitmedi!','Profesöre yakışan bir hassasiyet!']:['Exactly as science predicted!','Not one move wasted!','Precision worthy of a professor!']},
    insane:{label:'INSANE!',quotes:tr?['Formülü az önce bozdun!','Hesaplamalarım titriyor!','Laboratuvarı zekânla alt ettin!']:['You just broke the formula!','My calculations are trembling!','You outsmarted the laboratory!']},
    genius:{label:'GENIUS!',quotes:tr?['Bu çözümü ben bile göremedim!','Nobel’e layık bir çözüm!','Moleküler bilimi yeniden yazdın!']:['Even I did not see that coming!','A solution worthy of a Nobel Prize!','You rewrote molecular science!']}
  };
}
function getPerformance(moveCount,par,minimum,isNewBest){
  moveCount=Math.max(0,Math.floor(Number(moveCount)||0));
  par=Math.max(1,Math.floor(Number(par)||1));
  minimum=Math.max(1,Math.min(par,Math.floor(Number(minimum)||par)));
  let key='complete';
  if(minimum<par&&moveCount<=minimum)key='genius';
  else if(moveCount<par)key='insane';
  else if(moveCount===par)key='perfect';
  else if(moveCount<=Math.ceil(par*1.25))key='nice';
  const cfg=performanceCopy()[key];
  return {key,label:cfg.label,quotes:cfg.quotes,moves:moveCount,par,minimum,isNewBest:!!isNewBest};
}
function showPerformanceGrade(perf){
  const wrap=$('#performanceWrap');if(!wrap||!perf)return;
  wrap.className='grade-'+perf.key;
  $('#performanceGrade').textContent=perf.label;
  $('#performanceMeta').textContent=(LANG==='tr'?'PAR '+perf.par+' · SEN '+perf.moves:'PAR '+perf.par+' · YOU '+perf.moves);
  const best=$('#performanceBest');
  best.textContent=perf.isNewBest?(LANG==='tr'?'YENİ REKOR!':'NEW BEST!'):'';
  wrap.classList.remove('on');void wrap.offsetWidth;wrap.classList.add('on');
  setTimeout(()=>wrap.classList.remove('on'),1320);
  setTimeout(()=>say(rnd(perf.quotes),perf.key==='complete'?'happy':'celebrate',2900,perf.key==='insane'||perf.key==='genius'?'glow':null),120);
}
function performanceResultHtml(perf){
  if(!perf)return '';
  return '<div class="performanceResult grade-'+perf.key+'"><b>'+perf.label+'</b><span>'+(LANG==='tr'?'PAR '+perf.par+' · SEN '+perf.moves:'PAR '+perf.par+' · YOU '+perf.moves)+'</span>'+(perf.isNewBest?'<em>'+(LANG==='tr'?'YENİ REKOR':'NEW BEST')+'</em>':'')+(perf.assisted?'<em class="assistedRun">'+(LANG==='tr'?'DESTEKLİ GEÇİŞ · REKOR DIŞI':'ASSISTED CLEAR · UNRANKED')+'</em>':'')+'</div>';
}


/* V8.5.42 — distinct completion choreography for every campaign level.
   Each of the 301 campaign levels owns an explicit deterministic recipe.
   The molecule's chemistry family remains the base layer; the level recipe
   controls bond order, particle trajectory, camera motion, banner entrance,
   and a quiet three-note laboratory signature. */
function mxLevelFxRecipe(levelIndex){
  const list=window.MX_LEVEL_FX_RECIPES;
  if(Array.isArray(list)&&list[levelIndex])return list[levelIndex];
  const seed=((Math.max(0,Number(levelIndex)||0)+1)*2654435761)>>>0;
  return {level:Math.max(0,Number(levelIndex)||0)+1,molecule:curMol&&curMol.f||'',seed,motif:'radial',shape:'spark',boardMotion:'pulse',bannerMotion:'pop',tone:'rise',direction:'radial',count:22,spread:120,speed:1,twist:1.2,gravity:.28,waves:3,rings:2,bondStep:65,pulse:1,delay:0};
}
function mxFxRng(seed){
  let a=(Number(seed)||1)>>>0;
  return function(){
    a|=0;a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function mxFxDirectionAngle(direction){
  return direction==='up'?-Math.PI/2:direction==='down'?Math.PI/2:direction==='left'?Math.PI:
    direction==='right'?0:direction==='diag-ne'?-Math.PI/4:direction==='diag-nw'?-Math.PI*3/4:0;
}
function mxShuffleSeeded(arr,rng){
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr;
}
function mxLevelBondFx(recipe,boardRect,cols){
  if(!effectsAllowed()||!boardRect||!atoms||atoms.length<2)return;
  const rng=mxFxRng((recipe.seed^0xB0AD5EED)>>>0),bonds=[];
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    if(Math.abs(atoms[i].x-atoms[j].x)+Math.abs(atoms[i].y-atoms[j].y)!==1)continue;
    bonds.push([i,j]);
  }
  mxShuffleSeeded(bonds,rng);
  bonds.forEach((pair,order)=>{
    const a=atoms[pair[0]],b=atoms[pair[1]];
    const x1=boardRect.left+(a.x+.5)*T,y1=boardRect.top+(a.y+.5)*T;
    const x2=boardRect.left+(b.x+.5)*T,y2=boardRect.top+(b.y+.5)*T;
    const delay=(order*(recipe.bondStep||60))/1000;
    P({k:'bond',x1,y1,x2,y2,c:cols[order%cols.length]||'#ffffff',c2:cols[(order+1)%cols.length]||'#7ee8ff',
      life:.62+delay,d:delay,w:3+rng()*2.4,pulse:recipe.pulse||1});
  });
}
function mxLevelSignatureTone(recipe){
  if(!ac()||save.muS||save.effects===false)return;
  const seed=recipe.seed>>>0,root=196+(seed%9)*18.35;
  const patterns={
    rise:[0,4,7],fall:[7,4,0],arc:[0,7,3],pulse:[0,0,7],triple:[0,5,10],
    open:[0,7,12],minor:[0,3,7],major:[0,4,7]
  };
  const ints=patterns[recipe.tone]||patterns.rise,t=now()+.035;
  ints.forEach((semi,i)=>{
    const f=root*Math.pow(2,semi/12);
    osc(sfxG,f,t+i*.075,.18,'sine',.017,{atk:.008,f2:f*(1.006+(i*.002)),f2t:.15,lp:2600});
  });
}
function mxApplyLevelWinMotion(recipe){
  if(!board||motionReduced())return;
  board.dataset.winMotion=recipe.boardMotion||'pulse';
  board.style.setProperty('--mx-level-spin',((recipe.twist||0)*7).toFixed(1)+'deg');
  board.style.setProperty('--mx-level-spin-back',((recipe.twist||0)*-1.9).toFixed(1)+'deg');
  board.style.setProperty('--mx-level-pulse',String(Math.max(.7,Math.min(2.4,recipe.pulse||1))));
  board.classList.remove('mxLevelWin');void board.offsetWidth;board.classList.add('mxLevelWin');
  setTimeout(()=>{board.classList.remove('mxLevelWin');delete board.dataset.winMotion;board.style.removeProperty('--mx-level-spin');board.style.removeProperty('--mx-level-spin-back');board.style.removeProperty('--mx-level-pulse');},1280);
}
function mxSpawnRecipeParticles(recipe,x,y,cols){
  if(!effectsAllowed())return;
  const rng=mxFxRng(recipe.seed),reduced=motionReduced()||performanceLow();
  const count=Math.max(8,Math.round((recipe.count||22)*(reduced ? .48 : 1)));
  const baseAngle=mxFxDirectionAngle(recipe.direction);
  const palette=(Array.isArray(cols)&&cols.length?cols:['#ffffff','#7ee8ff','#ffd76a']).slice();
  for(let i=0;i<count;i++){
    const u1=rng(),u2=rng(),u3=rng(),u4=rng();
    const a=(recipe.direction==='radial'?Math.PI*2*u1:baseAngle+(u1-.5)*(Math.PI*.95))+i*.013*(recipe.twist||1);
    const life=(.88+u2*.65)/Math.max(.72,recipe.speed||1);
    P({k:'sig',cx:x,cy:y,x,y,mode:recipe.motif,shape:recipe.shape,a,
      spread:(recipe.spread||120)*(.58+u3*.58),twist:recipe.twist||0,gravity:recipe.gravity||.28,
      waves:recipe.waves||3,phase:u4*Math.PI*2,index:i,total:count,u1,u2,u3,u4,
      c:palette[Math.floor(rng()*palette.length)]||'#fff',c2:palette[Math.floor(rng()*palette.length)]||'#7ee8ff',
      r:2.2+rng()*3.8,life:life+(recipe.delay||0),d:recipe.delay||0});
  }
  const ringCount=reduced?1:Math.max(1,recipe.rings||1);
  for(let i=0;i<ringCount;i++)P({k:'ring',x,y,r:8+i*4,vr2:86+i*31+(recipe.seed%23),life:.62+i*.08,c:palette[i%palette.length]||'#fff',d:i*.035});
}
function spawnLevelSignatureFx(levelIndex,mol,x,y,cols,boardRect){
  const recipe=mxLevelFxRecipe(levelIndex);
  const palette=(Array.isArray(cols)&&cols.length?cols:['#ffffff','#7ee8ff','#ffd76a']);
  // Chemistry remains recognizable.
  spawnWinFx(mol&&mol.fx||'glit',x,y,palette);
  // The level identity makes repeated molecules and all 301 campaign clears distinct.
  mxLevelBondFx(recipe,boardRect,palette);
  mxSpawnRecipeParticles(recipe,x,y,palette);
  mxApplyLevelWinMotion(recipe);
  mxLevelSignatureTone(recipe);
  recipe.victoryDelay=540+(recipe.seed%241);
  return recipe;
}
function mxSigPoint(p,q){
  const e=1-Math.pow(1-Math.max(0,Math.min(1,q)),3),two=Math.PI*2;
  const sp=p.spread||120,tw=p.twist||0,a=p.a||0,ph=p.phase||0,w=p.waves||3;
  let x=p.cx,y=p.cy;
  switch(p.mode){
    case 'spiral':{const rr=sp*e,ang=a+tw*two*e;x+=Math.cos(ang)*rr;y+=Math.sin(ang)*rr;break;}
    case 'orbit':{const rr=sp*(.35+.2*Math.sin(e*Math.PI));const ang=a+(1.6+Math.abs(tw))*two*e;x+=Math.cos(ang)*rr;y+=Math.sin(ang)*rr*(.55+p.u2*.35);break;}
    case 'fountain':{const vx=Math.cos(a)*sp*.72,vy=-sp*(.72+p.u1*.45);x+=vx*e;y+=vy*e+(p.gravity||.28)*sp*2.8*e*e;break;}
    case 'fan':{const rr=sp*e;x+=Math.cos(a)*rr;y+=Math.sin(a)*rr*.7;break;}
    case 'helix':{x+=Math.sin(ph+e*two*w)*sp*.32;y-=sp*e;x+=Math.cos(a)*sp*.18;break;}
    case 'wave':{x+=Math.cos(a)*sp*e;y+=Math.sin(a)*sp*e+Math.sin(ph+e*two*w)*sp*.24;break;}
    case 'lattice':{const cols=Math.max(3,Math.round(Math.sqrt(p.total||20))),ix=(p.index%cols)-(cols-1)/2,iy=Math.floor(p.index/cols)-(Math.ceil((p.total||20)/cols)-1)/2;x+=ix*(sp/cols)*e;y+=iy*(sp/cols)*e;break;}
    case 'vortex':{const rr=sp*(1-e)*(.55+p.u2*.45),ang=a+(2.2+Math.abs(tw))*two*e;x+=Math.cos(ang)*rr;y+=Math.sin(ang)*rr;break;}
    case 'cascade':{x+=(p.u1-.5)*sp*.9+Math.sin(ph+e*two*w)*14;y+=-sp*.58+sp*1.25*e;break;}
    case 'crown':{const sx=(p.u1-.5)*sp*1.1;x+=sx*e;y-=Math.sin(e*Math.PI)*sp*(.42+p.u2*.35)+Math.abs(sx)*.15*e;break;}
    case 'ribbon':{const rr=sp*e;x+=Math.cos(a+tw*e*3)*rr;y+=Math.sin(a+tw*e*3)*rr*.42+Math.sin(ph+e*two*w)*18;break;}
    case 'prism':{const side=p.index%3,ang=a+side*two/3+tw*e;x+=Math.cos(ang)*sp*e;y+=Math.sin(ang)*sp*e;break;}
    case 'cross':{const arm=p.index%4,ang=arm*Math.PI/2+a;x+=Math.cos(ang)*sp*e;y+=Math.sin(ang)*sp*e;break;}
    case 'comet':{const rr=sp*e,curve=Math.sin(e*Math.PI)*sp*.2;x+=Math.cos(a)*rr+Math.cos(a+Math.PI/2)*curve;y+=Math.sin(a)*rr+Math.sin(a+Math.PI/2)*curve;break;}
    case 'bloom':{const ang=a+two*e,rr=sp*e*(.5+.48*Math.abs(Math.sin((w+1)*ang)));x+=Math.cos(ang)*rr;y+=Math.sin(ang)*rr;break;}
    case 'zigzag':{const rr=sp*e,off=((Math.floor(e*w*4)%2)?1:-1)*sp*.12*(1-e);x+=Math.cos(a)*rr+Math.cos(a+Math.PI/2)*off;y+=Math.sin(a)*rr+Math.sin(a+Math.PI/2)*off;break;}
    case 'arc-reactor':{const rr=sp*(.28+.72*e),ang=a+two*e*(1.6+Math.abs(tw));x+=Math.cos(ang)*rr;y+=Math.sin(ang)*rr*.62+Math.sin(e*Math.PI)*-28;break;}
    case 'nobel-crown':{const sector=(p.index%8)/8*two,rr=sp*(.3+.7*e);x+=Math.cos(sector+tw*e)*rr;y+=Math.sin(sector+tw*e)*rr*.52-Math.sin(e*Math.PI)*sp*.28;break;}
    default:{const rr=sp*e,ang=a+tw*e;x+=Math.cos(ang)*rr;y+=Math.sin(ang)*rr;}
  }
  return [x,y];
}
function mxDrawSigShape(ctx,p,x,y,q){
  const r=Math.max(1.2,(p.r||3)*(1-q*.45)),rot=(p.a||0)+q*5+(p.twist||0);
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=p.c;ctx.strokeStyle=p.c;ctx.lineWidth=Math.max(1,2*(1-q));
  switch(p.shape){
    case 'diamond':ctx.fillRect(-r,-r,r*2,r*2);break;
    case 'shard':ctx.beginPath();ctx.moveTo(0,-r*1.7);ctx.lineTo(r, r);ctx.lineTo(-r*.75,r*.55);ctx.closePath();ctx.fill();break;
    case 'bubble':ctx.globalAlpha*=.76;ctx.beginPath();ctx.arc(0,0,r*1.25,0,7);ctx.stroke();break;
    case 'spark':ctx.fillRect(-r*1.8,-.8,r*3.6,1.6);ctx.fillRect(-.8,-r*1.8,1.6,r*3.6);break;
    case 'hex':ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*r*1.3,y=Math.sin(a)*r*1.3;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();break;
    case 'star':ctx.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,rr=i%2?r*.55:r*1.7;i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();break;
    case 'ring':ctx.beginPath();ctx.arc(0,0,r*1.45,0,7);ctx.stroke();break;
    case 'capsule':ctx.beginPath();ctx.roundRect(-r*1.6,-r*.55,r*3.2,r*1.1,r*.55);ctx.fill();break;
    default:ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
  }
  ctx.restore();
}

const MOLECULE_INFO_HOLD_MS=3000,MOLECULE_INFO_FADE_MS=340,RESULT_MODAL_DELAY_MS=3650;
let completionResultTimer=null;
function winSeq(){
  mxTrack('level_completed',{level:Number(lv)+1,mode:duelMode?'duel':dailyMode?'daily':'campaign',moves:Number(moves)||0});
  if(onlineDuelConnectionPaused())return;
  const duelWinNow=performance.now();
  if(duelMode&&Math.max(0,(duelWinNow-levelStartT)/1000)>=DUEL_TIME_LIMIT){finishDuelTimeout();return;}
  if(crystalMode&&!duelMode&&Math.max(0,(duelWinNow-levelStartT)/1000)>=CRYSTAL_TIME_LIMIT){finishCrystalTimeout();return;}
  if(chainMode&&!duelMode&&Math.max(0,(duelWinNow-levelStartT)/1000)>=CHAIN_TIME_LIMIT){finishChainTimeout();return;}
  if(reactorMode&&!duelMode&&reactorElapsedSeconds(duelWinNow)>=REACTOR_TIME_LIMIT){finishReactorTimeout();return;}
  won=true;winT=duelWinNow;shake=(motionReduced()||save.duelEffects===false)?0:.28;mxHaptic('success');hintMark=null;
  gameFeelWinBurst();
  const elapsedSeconds=Math.max(0,(winT-levelStartT)/1000);
  const zeroStarLimit=Math.ceil(LV.p*2.3);
  const stars=moves<=LV.p?3:(moves<=t2?2:(moves<=zeroStarLimit?1:0));
  if(stars>0&&!assistanceUsed&&!duelMode&&!crystalMode&&!chainMode&&!reactorMode&&SPEEDRUN_LEVELS.includes(lv)){
    const elapsed=elapsedSeconds;
    const prevBest=save.speedRuns[lv];
    if(!prevBest||elapsed<prevBest){save.speedRuns[lv]=elapsed;persist();newSpeedRecord=elapsed;}
    else newSpeedRecord=null;
  }else newSpeedRecord=null;
  updateHUD();
  const bf=$('#boardFrame');bf.classList.remove('winzoom','moleculeComplete');void bf.offsetWidth;if(!motionReduced())bf.classList.add('winzoom');bf.classList.add('moleculeComplete');setTimeout(()=>bf.classList.remove('moleculeComplete'),1500);
  // centroid -> screen coords
  const r=board.getBoundingClientRect();
  const cx=r.left+atoms.reduce((s,a)=>s+a.x+0.5,0)/atoms.length*T;
  const cy=r.top+atoms.reduce((s,a)=>s+a.y+0.5,0)/atoms.length*T;
  // Molecule signature first: let the chemistry-specific SPLASH / PUFF / FLAME / CRYSTAL
  // read clearly before the generic celebration layers arrive.
  const levelFxRecipe=spawnLevelSignatureFx(lv,curMol,cx,cy,curMol.c,r);
  const firstDiscoveryNow=!dailyMode&&!duelMode&&!crystalMode&&!chainMode&&!reactorMode&&!save.disc[mid];
  const premiumClear=stars===3||firstDiscoveryNow||lv===NOBEL_LEVEL_INDEX;
  if(premiumClear)setTimeout(()=>spawnConf(cx,cy),420);
  atoms.forEach(a=>{
    const ax=r.left+(a.x+0.5)*T,ay=r.top+(a.y+0.5)*T;
    const ec=EL[a.e];
    setTimeout(()=>sparkleBurst(ax,ay,ec?[ec.c,ec.hi,'#ffffff']:undefined),80+Math.random()*140);
  });
  const lr=$('#lightRays');lr.classList.remove('on');
  setTimeout(()=>{void lr.offsetWidth;lr.classList.add('on');},170);
  setTimeout(()=>lr.classList.remove('on'),1470);
  // Keep the molecule's own sound readable, then bring in the broad victory sweep.
  setTimeout(()=>{SFX.whoosh();SFX.moleculeComplete();},390);
  if(!duelMode&&!dailyMode){
    const evt=(lv===NOBEL_LEVEL_INDEX)?'nobel':((save.stars&&save.stars[lv])?'success':'discovery');
    setTimeout(()=>playCharacterVoice('drE',evt,{force:lv===NOBEL_LEVEL_INDEX,duck:.28,cooldown:2200}),520);
  }
  const completionVerb=(curMol.fx==='crys')
    ?(LANG==='tr'?'KRİSTALLEŞTİ':'CRYSTALLIZED')
    :(LANG==='tr'?'SENTEZLENDİ':'SYNTHESIZED');
  $('#banner').textContent=curMol.n+' '+completionVerb+'!';
  $('#bannerSub').textContent=curMol.f||curMol.n;
  const bannerFact=$('#bannerFact');
  if(bannerFact)bannerFact.textContent=curMol.fa||'';
  const bw=$('#bannerWrap');
  bw.dataset.fx=curMol.fx||'glit';
  bw.dataset.motion=levelFxRecipe.bannerMotion||'pop';
  bw.dataset.levelFx=String(levelFxRecipe.level||Number(lv)+1);
  bw.classList.remove('leaving');bw.classList.toggle('longName',String(curMol.n||'').length>18);
  const bannerDiscover=$('#bannerDiscover');if(bannerDiscover){bannerDiscover.hidden=true;bannerDiscover.textContent=LANG==='tr'?'📘 DAHA FAZLASI → MOLECULOPEDIA':'📘 DISCOVER MORE → MOLECULOPEDIA';bannerDiscover.onpointerdown=null;}
  bw.classList.add('on');
  showMoleculeCompletionFx();
  // The existing laboratory victory animation is preserved, but sequenced after
  // the molecule-specific reaction so the screen no longer fires everything at once.
  setTimeout(()=>showVictoryLabFx('full'),levelFxRecipe.victoryDelay||760);
  setTimeout(()=>bw.classList.add('leaving'),MOLECULE_INFO_HOLD_MS);
  setTimeout(()=>{bw.classList.remove('on','longName','leaving');delete bw.dataset.fx;delete bw.dataset.motion;delete bw.dataset.levelFx;},MOLECULE_INFO_HOLD_MS+MOLECULE_INFO_FADE_MS);
  let previousBestMove=0,isNewMoveBest=false;
  if(!tutorialActive&&!duelMode&&!crystalMode&&!chainMode&&!reactorMode){
    previousBestMove=(!dailyMode&&save.bestMoves)?Math.max(0,Math.floor(Number(save.bestMoves[lv])||0)):0;
    isNewMoveBest=stars>0&&!assistanceUsed&&!dailyMode&&(!previousBestMove||moves<previousBestMove);
    if(isNewMoveBest)save.bestMoves[lv]=moves;
    lastPerformance=getPerformance(moves,LV.p,LV.mn||LV.p,isNewMoveBest);
    if(assistanceUsed)lastPerformance.assisted=true;
    setTimeout(()=>{showPerformanceGrade(lastPerformance);showFinalWow(lastPerformance,stars);},MOLECULE_INFO_HOLD_MS+180);
  }else lastPerformance=null;
  if(!assistanceUsed&&!dailyMode&&currentAttemptId&&window.MXCloud&&window.MXCloud.submitLevelResult){
    const verifiedAttemptId=currentAttemptId;
    const verifiedMoves=moveLog.map(m=>({i:m.i,d:m.d}));
    currentAttemptId=null;
    window.MXCloud.submitLevelResult({
      profileId:save.profileId,attemptId:verifiedAttemptId,levelId:lv,
      moveLog:verifiedMoves,playerName:save.playerName,hints:attemptHintCount
    }).then(res=>{
      if(res&&res.ok){
        prop('🔒✅',1800);
        if(scr.hof.classList.contains('on'))refreshHofWorldTabs();
      }else{
        setTimeout(()=>say(t('secureUnranked'),'sad',4200,'shk'),250);
      }
    }).catch(()=>setTimeout(()=>say(t('secureUnranked'),'sad',4200,'shk'),250));
  }
  setExcited(false);setIntensity(0);
  setTimeout(()=>{if(MSND[curMol.fx])MSND[curMol.fx]();},70);
  setTimeout(()=>jingle(stars),920);
  einCelebrate(stars);
  if(tutorialActive){
    setTimeout(()=>{
      if(tutorialStep===4)tutorialGoStep(6);
      else if(tutorialStep===8)tutorialGoStep(9);
    },1900);
    return;
  }
  if(duelMode){
    say((duelState.turn===0?'🔴 ':'🔵 ')+duelState.players[duelState.turn]+' ✓','celebrate',3000,'glow');
    finishDuelTurn(reactorMode?reactorElapsedSeconds(duelWinNow):elapsedSeconds);
    return;
  }
  if(crystalMode){
    say('🧪 '+crystalCopy().complete,'celebrate',3200,'glow');
    showCrystalSuccess(elapsedSeconds,bonusMission?awardBonusMission(bonusMission):null);
    return;
  }
  if(chainMode){
    chainAutoActive=false;chainAutoQueue=[];say('⚡ '+chainCopy().complete,'celebrate',3200,'glow');
    showChainSuccess(elapsedSeconds,bonusMission?awardBonusMission(bonusMission):null);
    return;
  }
  if(reactorMode){
    const reactorElapsed=reactorElapsedSeconds(duelWinNow);say('☢️ '+reactorCopy().complete,'celebrate',3200,'glow');showReactorSuccess(reactorElapsed,bonusMission?awardBonusMission(bonusMission):null);return;
  }
  if(!dailyMode){
    save.streak3=stars===3?(save.streak3||0)+1:0;
    // FIX 2026-07-28: say() also calls einMood() internally, and it was firing
    // synchronously right after einCelebrate(stars) above — instantly wiping
    // the 'celebrate' bounce with 'happy' before it had a chance to render even
    // one frame. This is why the jump/dance/spin reactions looked like they
    // "didn't exist": the first ~1.5s of every celebration was invisible,
    // replaced by the idle happy-bob until the later scheduled dance/laugh
    // mood kicked in. A short delay here lets einCelebrate's own animation
    // play first; the text bubble showing ~0.4s later is not noticeable.
    if(save.streak3===3)setTimeout(()=>say(t('streak3'),'happy',5000),1900);
    else if(save.streak3===7)setTimeout(()=>say(t('streak7'),'happy',5000),1900);
    else setTimeout(()=>say(stars===3?rnd(LN.perfect):rnd(LN.win),'happy',5200),430);
  }else setTimeout(()=>say(stars===3?rnd(LN.perfect):rnd(LN.win),'happy',5200),430);
  const prev=save.stars[lv]||0;
  let gained=0;
  let rpGained=0;
  let isNewDiscovery=false;
  if(!dailyMode){
    gained=stars>prev?(stars-prev)*10:0;
    const campaignScore=stars>0?campaignResearchScore(stars,moves,LV.p,LV.mn||LV.p,elapsedSeconds,attemptHintCount):0;
    // Campaign and move-performance bonuses grow Career RP only. The fair
    // weekly/monthly tables use the same daily challenge for every player.
    rpGained=awardLevelResearch(lv,campaignScore);
    isNewDiscovery=!save.disc[mid];
    if(isNewDiscovery){save.disc[mid]=1;gained+=5+(labOwned('gold_scope')?5:0);}
    if(isNewDiscovery){
      const bEl=$('#banner');bEl.classList.remove('newDiscovery');void bEl.offsetWidth;bEl.classList.add('newDiscovery');
      setTimeout(()=>SFX.sparkle(),150);
      setTimeout(()=>bEl.classList.remove('newDiscovery'),2200);
    }
  }
  if(dailyMode){
    const localDay=currentDailyId||utcDayId();
    const dailyRP=awardDailyResearch(localDay,moves,LV.p,LV.mn||LV.p,elapsedSeconds,attemptHintCount);
    const claimPromise=(window.MXCloud&&save.profileId)?window.MXCloud.claimDailyExperiment(save.profileId):Promise.resolve({offline:true});
    const timeoutFallback=new Promise(res=>setTimeout(()=>res({offline:true}),4000));
    Promise.race([claimPromise,timeoutFallback]).then(res=>{
      let already=false,practiceOnly=false,dailyGained=0;
      if(res&&res.offline&&res.disabled){
        if(save.dailyDate===localDay)already=true;
        else{dailyGained=25;save.dailyDate=localDay;}
      }else if(res&&res.offline){practiceOnly=true;
      }else if(res&&res.alreadyClaimed){already=true;if(res.day)save.dailyDate=res.day;
      }else if(res&&res.reward){dailyGained=res.reward;if(res.day)save.dailyDate=res.day;
      }else practiceOnly=true;
      if(dailyGained>0&&labOwned('robot'))dailyGained+=5;
      addCoins(dailyGained);
      checkAchievementsSilent();persist();updateBadge();
      try{if(window.MXCloud&&save.profileId&&window.MXCloud.syncLeaderboard)window.MXCloud.syncLeaderboard(save,save.profileId,true);}catch(e){}
      setTimeout(()=>{updateCoins(dailyGained>0);dailyModal(stars,dailyGained,already,practiceOnly,dailyRP.delta,dailyRP.streak);},RESULT_MODAL_DELAY_MS);
    });
    return;
  }
  save.stars[lv]=Math.max(prev,stars);
  const oldCur=save.cur;
  save.cur=Math.max(save.cur,Math.min(lv+1,LEVELS.length));
  addCoins(gained);persist();
  // Save the completed level to Firebase silently in the background.
  // The result animation and next-level flow never wait for this network write.
  queueLevelCloudCheckpoint('campaign-level-'+String(lv+1));
  try{
    if(window.MXCloud&&save.profileId&&window.MXCloud.syncLeaderboard){
      window.MXCloud.syncLeaderboard(save,save.profileId,true).then(res=>{
        if(res&&res.ok&&scr.hof.classList.contains('on'))refreshHofWorldTabs();
      });
    }
  }catch(e){}
  updateBadge();
  const oldTier=tierOf(oldCur), newTier=tierOf(save.cur);
  checkAchievements();
  const normalCompletion=lv!==NOBEL_LEVEL_INDEX&&newTier<=oldTier;
  const resultDiscover=$('#bannerDiscover');
  if(resultDiscover&&normalCompletion){
    resultDiscover.hidden=false;
    resultDiscover.onpointerdown=e=>{e.preventDefault();SFX.select();if(completionResultTimer){clearTimeout(completionResultTimer);completionResultTimer=null;}updateCoins(gained>0);openMoleculeInCollection(mid);};
  }
  if(completionResultTimer)clearTimeout(completionResultTimer);
  completionResultTimer=setTimeout(()=>{
    completionResultTimer=null;updateCoins(gained>0);
    if(lv===NOBEL_LEVEL_INDEX){
      nobelCelebration();
      setTimeout(()=>showNobelEpilogue(()=>winModal(stars,gained,rpGained)),4200);
    }else if(newTier>oldTier){
      addCoins(200);gained+=200;persist();queueLevelCloudCheckpoint('rank-up-'+String(newTier));updateCoins(true);
      rankUpCelebration(newTier);
      setTimeout(()=>winModal(stars,gained,rpGained),3700);
    }else winModal(stars,gained,rpGained);
  },RESULT_MODAL_DELAY_MS);
}
function dailyModal(stars,gained,already,practiceOnly,rpGained,streak){
  openModal(
  '<h3>'+t('dailyTitle')+'</h3>'+
    '<div class="msub">'+(practiceOnly?t('dailyOffline'):already?t('dailyAlready'):t('dailySolved'))+'</div>'+
    performanceResultHtml(lastPerformance)+
    '<div class="mstars"><span>⭐</span><span>⭐</span><span>⭐</span></div>'+
    (rpGained>0?'<div class="mcoins" style="color:#78e7ff">+'+rpGained+' RP · 🔥 '+streak+'</div>':'<div class="mcoins" style="opacity:.55">'+(LANG==='tr'?'Bugünün en iyi RP skoru alındı':'Today’s best RP score claimed')+'</div>')+
    (gained>0?'<div class="mcoins">+<span class="mxCoinCountFlow">0</span> <span class="coinIcon"></span></div>':'')+
    '<div class="mrow"><button class="btn" id="mRetry">'+t('dailyPracticeAgain')+'</button>'+
    '<button class="btn ghost" id="mLab">'+t('mainMenu')+'</button></div>'
  );
  const sp=Array.from($('#modalBox .mstars').children);
  popStars(sp,stars);
  if(gained>0)setTimeout(()=>animateResultCoins(gained),260);
  $('#mRetry').addEventListener('pointerdown',e=>{e.preventDefault();SFX.undo();startDaily();},{passive:false});
  $('#mLab').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();dailyMode=false;closeModal();show('splash');},{passive:false});
}
function rankUpCelebration(tier){
  const w=$('#rankUpWrap');
  const icon=$('#rankUpIcon');
  icon.classList.remove('rb0','rb1','rb2','rb3','rb4','rb5','rb6','rb7','rb8');
  icon.classList.add('rb'+tier);
  $('#rankUpTitle2').textContent=t('rankUpTitle');
  $('#rankUpName').textContent=t('rank'+tier);
  $('#rankUpQuote').textContent=rnd(t('rankUpEinstein'));
  w.classList.add('on');
  setTimeout(()=>showVictoryLabFx('mini'),120);
  for(let k=0;k<2;k++)setTimeout(()=>jingle(2),k*450);
  const cx=innerWidth/2,cy=innerHeight*0.4;
  for(let i=0;i<20;i++)P({k:'glit',x:cx+(Math.random()-0.5)*innerWidth*0.6,y:cy-30,
    vx:(Math.random()-0.5)*2,vy:-1-Math.random()*2,r:2+Math.random()*3,
    c:rnd(['#9d7bff','#4fd8ff','#b39ddb','#fff']),life:2,d:Math.random()*1});
  setTimeout(()=>{
    setBgForTier(tier,true);
  },1600);
  setTimeout(()=>{
    w.classList.remove('on');
  },2400);
}
function nobelCelebration(){
  const w=$('#nobelWrap');w.classList.add('on');
  say(LN.last,'happy',4000);
  for(let k=0;k<3;k++)setTimeout(()=>jingle(3),k*550);
  const cx=innerWidth/2,cy=innerHeight*0.38;
  for(let i=0;i<40;i++)P({k:'glit',x:cx+(Math.random()-0.5)*innerWidth*0.7,y:cy-40,
    vx:(Math.random()-0.5)*2,vy:-1-Math.random()*2.5,r:2.5+Math.random()*3,
    c:rnd(['#ffd876','#ffe9a8','#ffc94d','#fff']),life:2.4,d:Math.random()*1.5});
  for(let i=0;i<26;i++)P({k:'conf',x:cx+(Math.random()-0.5)*innerWidth*0.6,y:-20,
    vx:(Math.random()-0.5)*4,vy:1+Math.random()*2,c:rnd(['#ff5c69','#ffc94d','#4fd8ff','#9d7bff','#4ade80']),
    w:5+Math.random()*5,rot:Math.random()*7,vr:(Math.random()-0.5)*0.4,life:3.4,d:Math.random()*1.2});
  setTimeout(()=>setBgForTier(8,true),1600);
  setTimeout(()=>w.classList.remove('on'),4000);
}

function showNobelEpilogue(onContinue){
  const level=LEVELS[NOBEL_LEVEL_INDEX],panel=ensureStoryPanel();
  panel.querySelector('#storyChapter').textContent=LANG==='tr'?'NOBEL FİNALİ · SON':'NOBEL FINALE · END';
  panel.querySelector('#storyText').textContent=LANG==='tr'
    ?'Dr. E Nobel Ödülü’nü kazandı. “Bu başarı bilim, sabır ve düğmelere rastgele basmamak sayesinde!” dedi.'
    :'Dr. E won the Nobel Prize. “This success belongs to science, patience, and not pressing random buttons!”';
  panel.querySelector('#storyReaction').textContent=LANG==='tr'
    ?'Profesör Null’un bozuk konfeti makinesi töreni son anda kurtardı. Null üzülmedi; kendine “Onursal Laboratuvar Güvenliği Asistanı” madalyası taktı. Dr. E kupayı onunla birlikte kaldırdı.'
    :'Professor Null’s broken confetti machine saved the ceremony at the last second. Null was not sad; he awarded himself an “Honorary Laboratory Safety Assistant” medal. Dr. E raised the trophy with him.';
  panel.querySelector('#storyMolecule').textContent='🏆';
  panel.classList.add('nullAppears','nobelFinalStory');
  panel.querySelector('#storyBang').textContent=LANG==='tr'?'DOSTLUK!':'FRIENDS!';
  panel.querySelector('#storyContinue').textContent=LANG==='tr'?'FİNALİ TAMAMLA 🎉':'FINISH THE FINALE 🎉';
  storyContinueAction=onContinue;
  panel.classList.add('on');
}


function accountMilestoneInviteEligible(){
  if(!accountState||accountState.isAnonymous===false)return false;
  const completedNow=Math.max(0,Number(lv)+1);
  const milestone=completedNow===1||(completedNow>=5&&completedNow%5===0);
  const lastShown=Math.max(0,Math.floor(Number(save.accountMilestoneInviteLastLevel)||0));
  return milestone&&lastShown!==completedNow;
}
function accountMilestoneInviteHtml(){
  if(!accountMilestoneInviteEligible())return '';
  const completedNow=Math.max(1,Number(lv)+1);
  save.accountMilestoneInviteLastLevel=completedNow;
  save.accountMilestoneInviteSeen=true; // legacy cloud compatibility
  persist();
  const tr=LANG==='tr';
  const reason=completedNow===1
    ?(tr?'İlk deneyi tamamladın. İlerlemeni güvenle saklamak için hesabını bağla.':'You completed your first experiment. Link an account to keep your progress safe.')
    :(tr?completedNow+'. bölümü tamamladın. İlerlemeni kaybetmemek için hesabını bağla.':'You completed Level '+completedNow+'. Link an account so you do not lose your progress.');
  return '<div class="accountMilestoneInvite"><div class="accountMilestoneIcon">☁️</div><div><b>'+(tr?'İLERLEMENİ KORU':'PROTECT YOUR PROGRESS')+'</b><span>'+reason+'</span></div><button class="btn blue" id="mLinkAccount">'+(tr?'HESABI BAĞLA':'LINK ACCOUNT')+'</button></div>';
}
function nobelCertificateName(){
  const raw=String((save&&save.playerName)||(accountState&&accountState.displayName)||(LANG==='tr'?'Moleculox Bilim İnsanı':'Moleculox Scientist')).trim();
  return raw||((LANG==='tr')?'Moleculox Bilim İnsanı':'Moleculox Scientist');
}
function nobelCertificateHtml(){
  const tr=LANG==='tr',name=esc(nobelCertificateName());
  return '<section class="nobelCertificatePreview" aria-label="'+(tr?'Nobel başarı sertifikası':'Nobel achievement certificate')+'"><div class="nobelCertSeal">🏆</div><small>MOLECULOX · wHiTeWaY studio</small><h4>'+(tr?'NOBEL LABORATUVAR ÖDÜLÜ':'NOBEL LABORATORY AWARD')+'</h4><strong>'+name+'</strong><p>'+(tr?'301 bilimsel deneyi tamamlayarak Moleculox Nobel Finali’ni kazandı.':'completed 301 scientific experiments and conquered the Moleculox Nobel Final.')+'</p><div class="nobelCertFormula">⚛️ 300 + 1 · E = MC²</div></section><div class="nobelShareActions"><button class="btn amber" id="mShareCertificate">'+(tr?'📤 SERTİFİKAYI PAYLAŞ':'📤 SHARE CERTIFICATE')+'</button><button class="btn ghost" id="mSaveCertificate">'+(tr?'🖼️ GÖRSELİ KAYDET':'🖼️ SAVE IMAGE')+'</button></div><div class="authTiny" id="certificateShareStatus"></div>';
}
function roundedRectPath(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function buildNobelCertificateCanvas(){
  const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
  const tr=LANG==='tr',name=nobelCertificateName();
  const bg=x.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#071b31');bg.addColorStop(.52,'#10264b');bg.addColorStop(1,'#24143f');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);
  x.globalAlpha=.16;x.strokeStyle='#8eeeff';x.lineWidth=3;for(let i=0;i<28;i++){const px=(i*173)%1080,py=(i*311)%1350;x.beginPath();x.arc(px,py,18+(i%4)*9,0,Math.PI*2);x.stroke();}x.globalAlpha=1;
  roundedRectPath(x,70,70,940,1210,42);x.fillStyle='rgba(3,12,28,.78)';x.fill();x.strokeStyle='#f5ce6a';x.lineWidth=8;x.stroke();
  roundedRectPath(x,98,98,884,1154,30);x.strokeStyle='rgba(126,229,255,.55)';x.lineWidth=2;x.stroke();
  x.textAlign='center';x.fillStyle='#f7d777';x.font='700 42px system-ui,-apple-system,sans-serif';x.fillText('MOLECULOX',540,180);
  x.fillStyle='#9feaff';x.font='600 24px system-ui,-apple-system,sans-serif';x.fillText('wHiTeWaY studio · 300 + 1',540,225);
  x.font='116px serif';x.fillText('🏆',540,365);
  x.fillStyle='#fff4c9';x.font='800 56px system-ui,-apple-system,sans-serif';x.fillText(tr?'NOBEL LABORATUVAR ÖDÜLÜ':'NOBEL LABORATORY AWARD',540,470);
  x.fillStyle='#d5e9ff';x.font='500 29px system-ui,-apple-system,sans-serif';x.fillText(tr?'Bu sertifika gururla sunulur:':'This certificate is proudly presented to:',540,545);
  x.fillStyle='#ffffff';let fs=64;x.font='800 '+fs+'px system-ui,-apple-system,sans-serif';while(x.measureText(name).width>820&&fs>34){fs-=2;x.font='800 '+fs+'px system-ui,-apple-system,sans-serif';}x.fillText(name,540,650);
  x.strokeStyle='#f5ce6a';x.lineWidth=3;x.beginPath();x.moveTo(230,690);x.lineTo(850,690);x.stroke();
  x.fillStyle='#dcecff';x.font='500 31px system-ui,-apple-system,sans-serif';
  const lines=tr?['301 bilimsel deneyi tamamladı,','Moleculox Nobel Finali’ni kazandı','ve Dr. E’nin laboratuvar tarihine geçti.']:['completed 301 scientific experiments,','conquered the Moleculox Nobel Final,','and entered Dr. E’s laboratory history.'];
  lines.forEach((v,i)=>x.fillText(v,540,770+i*52));
  roundedRectPath(x,250,945,580,100,28);x.fillStyle='rgba(91,218,255,.11)';x.fill();x.strokeStyle='#6ee5ff';x.lineWidth=2;x.stroke();x.fillStyle='#bff6ff';x.font='700 35px system-ui,-apple-system,sans-serif';x.fillText('⚛  E = MC²  ·  300 + 1',540,1008);
  x.fillStyle='#f8d875';x.font='700 28px system-ui,-apple-system,sans-serif';x.fillText(tr?'BİLİM · SABIR · KEŞİF':'SCIENCE · PATIENCE · DISCOVERY',540,1125);
  x.fillStyle='#91a9c9';x.font='500 22px system-ui,-apple-system,sans-serif';x.fillText('moleculox.netlify.app',540,1190);
  return c;
}
function certificateBlob(){return new Promise(resolve=>buildNobelCertificateCanvas().toBlob(resolve,'image/png',.94));}
async function saveNobelCertificateImage(){
  const blob=await certificateBlob();if(!blob)return false;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Moleculox-Nobel-Certificate.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);save.nobelCertificateShared=true;persist();return true;
}
async function shareNobelCertificate(){
  const tr=LANG==='tr',status=$('#certificateShareStatus');try{
    const blob=await certificateBlob();if(!blob)throw new Error('blob');const file=new File([blob],'Moleculox-Nobel-Certificate.png',{type:'image/png'});
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Moleculox Nobel',text:tr?'301 bölümü tamamladım ve Moleculox Nobel Ödülü’nü kazandım!':'I completed all 301 levels and won the Moleculox Nobel Award!',files:[file]});save.nobelCertificateShared=true;persist();if(status)status.textContent=tr?'Sertifika paylaşıma hazırlandı.':'Certificate shared.';return;}
    await saveNobelCertificateImage();if(status)status.textContent=tr?'Paylaşım desteklenmedi; sertifika görseli kaydedildi.':'Sharing is unavailable; the certificate image was saved.';
  }catch(e){if(e&&e.name==='AbortError')return;try{await saveNobelCertificateImage();if(status)status.textContent=tr?'Sertifika görseli kaydedildi.':'Certificate image saved.';}catch(_){if(status)status.textContent=tr?'Sertifika oluşturulamadı.':'Could not create certificate.';}}
}
function openMoleculeInCollection(moleculeId){
  const bw=$('#bannerWrap');if(bw){bw.classList.add('leaving');setTimeout(()=>bw.classList.remove('on','longName','leaving'),340);}
  closeModal();show('collect');setCollectionTab('molecules');save.collectionFilter='all';persist();buildCollection();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const safe=window.CSS&&CSS.escape?CSS.escape(String(moleculeId)):String(moleculeId).replace(/["\\]/g,'\\$&');const card=document.querySelector('.molCard[data-molecule="'+safe+'"]');if(!card)return;card.classList.add('mxCompletionFocus');card.scrollIntoView({behavior:motionReduced()?'auto':'smooth',block:'center'});setTimeout(()=>card.classList.remove('mxCompletionFocus'),2800);}));
}
function winModal(stars,gained,rpGained){
  const last=FULL_CAMPAIGN_READY&&lv===NOBEL_LEVEL_INDEX;
  const speedLine=newSpeedRecord?'<div class="mcoins" style="color:#4fd8ff">⚡ '+t('newRecord')+': '+newSpeedRecord.toFixed(1)+'s</div>':'';
  openModal(
    '<h3>'+curMol.n+' '+curMol.f+'</h3>'+
    '<div class="msub">'+(last?t('allComplete'):t('levelDone',lv+1))+'</div>'+
    '<div class="mxResultMolecule" aria-hidden="true"><div class="mxResultOrbit"><span>⚛</span></div><b>'+curMol.f+'</b><small>'+curMol.n+'</small></div>'+
    performanceResultHtml(lastPerformance)+
    (last?nobelCertificateHtml():'')+
    accountMilestoneInviteHtml(stars)+
    bonusUnlockNoticeForLevel(lv+1)+
    speedLine+
    (rpGained>0?'<div class="mcoins" style="color:#78e7ff">+'+rpGained+' RP</div>':'')+
    '<div class="mstars"><span>⭐</span><span>⭐</span><span>⭐</span></div>'+
    (gained>0?'<div class="mcoins">+<span class="mxCoinCountFlow">0</span> <span class="coinIcon"></span></div>':'<div class="mcoins" style="opacity:.4">'+t('bestClaimed')+'</div>')+
    '<button class="btn blue" id="mDiscoverMolecule">📘 '+(LANG==='tr'?'MOLECULOPEDIA’DA İNCELE':'DISCOVER IN MOLECULOPEDIA')+'</button>'+
    '<div class="mrow">'+
    (BONUS_MILESTONES.includes(lv+1)&&!isBonusClaimed(lv+1)?'<button class="btn amber" id="mBonusNow">🎁 '+(LANG==='tr'?'BONUSU OYNA':'PLAY BONUS')+'</button>':'')+
    (last?'':'<button class="btn green" id="mNext">'+t('nextLevel')+'</button>')+
    '<button class="btn" id="mRetry">'+t('playAgain')+'</button>'+
    '<button class="btn ghost" id="mLab">'+t('levels')+'</button></div>'
  );
  const sp=Array.from($('#modalBox .mstars').children);
  popStars(sp,stars);
  if(gained>0)setTimeout(()=>animateResultCoins(gained),260);
  const linkAccount=$('#mLinkAccount');if(linkAccount)bindTap(linkAccount,e=>{SFX.click();openAccountModal();});
  const shareCert=$('#mShareCertificate');if(shareCert)bindTap(shareCert,e=>{SFX.click();shareNobelCertificate();});
  const saveCert=$('#mSaveCertificate');if(saveCert)bindTap(saveCert,e=>{SFX.click();saveNobelCertificateImage().then(()=>{const st=$('#certificateShareStatus');if(st)st.textContent=LANG==='tr'?'Sertifika görseli kaydedildi.':'Certificate image saved.';});});
  const bn=$('#mBonusNow');if(bn)bindTap(bn,e=>{SFX.play();startBonusMission(bonusMissionForMilestone(lv+1));});
  const discover=$('#mDiscoverMolecule');if(discover)bindTap(discover,e=>{SFX.select();openMoleculeInCollection(mid);});
  const nx=$('#mNext');
  if(nx)nx.addEventListener('pointerdown',e=>{e.preventDefault();SFX.play();goToLevelWithStory(lv+1);},{passive:false});
  $('#mRetry').addEventListener('pointerdown',e=>{e.preventDefault();SFX.undo();startLevel(lv);},{passive:false});
  $('#mLab').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();closeModal();show('levels');},{passive:false});
}

/* ================= MODAL ================= */
function installModalScrollIndicator(){
  const box=$('#modalBox');if(!box)return;
  box.querySelectorAll(':scope > .mxModalScrollRail,:scope > .mxUniversalFixedNav').forEach(n=>n.remove());
  box.classList.remove('mxHasFixedNav','mxTouchScrollModal');

  // Use one native touch-scroll body. No artificial Home or Scroll Up/Down
  // controls are injected; each modal keeps its original Close/action buttons.
  let target=box.querySelector(':scope > .settingsScroll,:scope > .guideScroll,:scope > .modalScroll,:scope > .scrollArea,:scope > .mxUniversalBody');
  if(!target&&!box.classList.contains('settingsModal')){
    target=document.createElement('div');
    target.className='mxUniversalBody';
    const nodes=Array.from(box.childNodes);
    nodes.forEach(n=>target.appendChild(n));
    box.appendChild(target);
  }
  if(!target)target=box;
  if(!box.classList.contains('settingsModal'))box.classList.add('mxTouchScrollModal');

  const rail=document.createElement('div');rail.className='mxModalScrollRail';rail.innerHTML='<span></span>';box.appendChild(rail);
  const thumb=rail.firstElementChild;
  const updateRail=()=>{
    const max=Math.max(0,target.scrollHeight-target.clientHeight);
    if(max<8){rail.classList.remove('on');return;}
    rail.classList.add('on');
    const track=Math.max(1,rail.clientHeight),h=Math.max(28,track*(target.clientHeight/target.scrollHeight));
    const y=(track-h)*(target.scrollTop/max);
    thumb.style.height=h+'px';thumb.style.transform='translateY('+Math.max(0,y)+'px)';
  };
  target.addEventListener('scroll',updateRail,{passive:true});
  requestAnimationFrame(()=>requestAnimationFrame(updateRail));
}

const modalActionQueue=[];
let modalCloseTimer=null;
function openModal(html){
  clearTimeout(modalCloseTimer);
  const box=$('#modalBox');
  box.className='card mxUniversalScroll';
  box.innerHTML=html;
  box.scrollTop=0;
  $('#modal').classList.add('on');
  requestAnimationFrame(()=>requestAnimationFrame(installModalScrollIndicator));
}
function runWhenModalFree(fn){
  if(typeof fn!=='function')return;
  const modal=$('#modal');
  if(!modal||!modal.classList.contains('on')){fn();return;}
  modalActionQueue.push(fn);
}
function runNextModalAction(){
  if($('#modal').classList.contains('on')||!modalActionQueue.length)return;
  const fn=modalActionQueue.shift();
  setTimeout(()=>{try{fn();}catch(e){console.warn('[modal] queued action failed',e);runNextModalAction();}},140);
}
function closeModal(){
  $('#modal').classList.remove('on');
  clearTimeout(modalCloseTimer);
  modalCloseTimer=setTimeout(()=>{
    $('#modalBox').className='card';
    resetViewportZoomIOS();
    runNextModalAction();
  },220);
}
/* ================= ACCOUNT / FIREBASE AUTH ================= */
let accountState={signedIn:false,isAnonymous:true,email:'',displayName:'',photoURL:'',providers:[]};
let accountAuthBound=false;
let accountToastTimer=0;
let accountReconcilePromise=null;
function accountCopy(){
  const tr=LANG==='tr';
  return tr?{
    title:'HESAP VE OYUNCULAR',guestTitle:'Misafir olarak oynuyorsun',guestSub:'Oyun otomatik olarak misafir hesabıyla başladı.',guestWarn:'Hesabını bağlamadan oyunu silersen bu cihazdaki ilerleme kaybolabilir.',memberSub:'Firebase hesabına bağlı · itch.io, Netlify, Android ve iOS ilerlemesi aynı oyuncuda birleşir.',apple:'Apple ile devam et',linkApple:'Apple hesabını bağla',appleConsentTitle:'Apple hesabını bağla',appleConsent:'Apple hesabını mevcut Moleculox ilerlemenle ilişkilendirmeyi onaylıyorsun. Böylece Google veya e-posta ile aynı oyuncu kaydına ulaşabilirsin.',appleConsentGo:'ONAYLA VE BAĞLA',google:'Google ile devam et',emailLogin:'E-posta ile giriş yap',emailCreate:'Yeni hesap oluştur',manage:'👥 OYUNCULARI YÖNET',close:'KAPAT',logout:'ÇIKIŞ YAP',reset:'ŞİFREMİ UNUTTUM',linkEmail:'E-posta ve şifre ekle',email:'E-posta',password:'Şifre',passwordAgain:'Şifre tekrar',nickname:'Oyuncu adı / Nickname',login:'GİRİŞ YAP',create:'HESAP OLUŞTUR',back:'GERİ',sendReset:'SIFIRLAMA E-POSTASI GÖNDER',resetSent:'Şifre sıfırlama e-postası gönderildi.',connected:'Hesap bağlandı. Platformlardaki oyuncu ilerlemeleri güvenle birleştirildi.',signedOut:'Çıkış yapıldı. Misafir moduna geçildi.',verify:'Doğrulama e-postası gönderildi.',guestToast:'Misafir modundasın. İlerlemeni korumak için bu profil ikonundan Google veya e-posta hesabını bağlayabilirsin.',cloudGood:'Bulut hesabı bağlı',cloudPanel:'☁ BULUT VE SIRALAMA DURUMU',cloudTitle:'BULUT VE HESAP DURUMU',syncNow:'ŞİMDİ SENKRONİZE ET',syncSuccess:'Bütün ilerleme ve sıralamalar senkronize edildi.',syncSavedRankPending:'Bulut ilerlemesi kaydedildi. Sıralama yayını bekliyor ve daha sonra yeniden denenecek.',connectedSyncPending:'Hesap bağlandı. Bulut ilerlemesi şu anda yüklenemedi; Şimdi Senkronize Et ile yeniden dene.',syncGuest:'Kalıcı sıralama ve cihazlar arası güvenli yedekleme için Google veya e-posta hesabını bağla.',syncSaved:'Senkronize',syncWorking:'Kaydediliyor',syncOffline:'Çevrimdışı',syncError:'Senkronizasyon hatası',lastSync:'Son başarılı senkronizasyon',neverSynced:'Henüz başarılı senkronizasyon yok',providersLabel:'Bağlı giriş yöntemleri',playerLabel:'Oyuncu',classicRankLabel:'Classic Dünya Sıralaması',duelRankLabel:'Online Düello Sıralaması',rankLoading:'Sıralama kontrol ediliyor…',rankUnpublished:'Henüz sıralamaya yayımlanmadı',rankGuest:'Hesap bağlanınca yayımlanır',backAccount:'HESABA DÖN',localProfiles:'Bu cihazdaki oyuncu profilleri burada kalır.',deleteAccount:'HESABI VE TÜM VERİLERİ SİL',deleteAccountTitle:'Hesap tamamen silinsin mi?',deleteAccountWarn:'Firebase giriş hesabın, tüm bulut profillerin ve bu cihazdaki bütün Moleculox ilerlemen kalıcı olarak silinir. Bu işlem geri alınamaz.',deleteAccountConfirm:'EVET, HESABIMI SİL',deleteAccountDone:'Hesap ve veriler silindi. Yeni misafir hesabı açıldı.',or:'VEYA',required:'Tüm alanları doldur.',passMismatch:'Şifreler aynı değil.',passShort:'Şifre en az 6 karakter olmalı.',working:'İşleniyor…'
  }:{
    title:'ACCOUNT & PLAYERS',guestTitle:'You are playing as a guest',guestSub:'The game started automatically with a guest account.',guestWarn:'If you delete the game before linking an account, progress stored on this device may be lost.',memberSub:'Connected to Firebase · itch.io, Netlify, Android and iOS progress merges into the same player.',apple:'Continue with Apple',linkApple:'Link Apple account',appleConsentTitle:'Link Apple account',appleConsent:'You consent to associate your Apple account with your existing Moleculox progress. Google or email can then open the same player record.',appleConsentGo:'CONFIRM AND LINK',google:'Continue with Google',emailLogin:'Sign in with email',emailCreate:'Create new account',manage:'👥 MANAGE PLAYERS',close:'CLOSE',logout:'SIGN OUT',reset:'FORGOT PASSWORD',linkEmail:'Add email & password',email:'Email',password:'Password',passwordAgain:'Repeat password',nickname:'Player name / Nickname',login:'SIGN IN',create:'CREATE ACCOUNT',back:'BACK',sendReset:'SEND RESET EMAIL',resetSent:'Password reset email sent.',connected:'Account connected. Player progress from all platforms was merged safely.',signedOut:'Signed out. Guest mode is active.',verify:'Verification email sent.',guestToast:'You are in guest mode. Link Google or email from this profile icon to protect your progress.',cloudGood:'Cloud account connected',cloudPanel:'☁ CLOUD & RANKING STATUS',cloudTitle:'CLOUD & ACCOUNT STATUS',syncNow:'SYNC NOW',syncSuccess:'All progress and rankings were synchronized.',syncSavedRankPending:'Cloud progress was saved. Ranking publication is pending and will be retried.',connectedSyncPending:'Account connected. Cloud progress could not be loaded yet; use Sync Now to retry.',syncGuest:'Link Google or email for permanent rankings and safe cross-device backup.',syncSaved:'Synchronized',syncWorking:'Saving',syncOffline:'Offline',syncError:'Sync error',lastSync:'Last successful sync',neverSynced:'No successful sync yet',providersLabel:'Linked sign-in methods',playerLabel:'Player',classicRankLabel:'Classic World Ranking',duelRankLabel:'Online Duel Ranking',rankLoading:'Checking rankings…',rankUnpublished:'Not published to ranking yet',rankGuest:'Published after account linking',backAccount:'BACK TO ACCOUNT',localProfiles:'Player profiles on this device remain available.',deleteAccount:'DELETE ACCOUNT & ALL DATA',deleteAccountTitle:'Delete the account permanently?',deleteAccountWarn:'Your Firebase sign-in account, every cloud profile, and all Moleculox progress stored on this device will be permanently deleted. This cannot be undone.',deleteAccountConfirm:'YES, DELETE MY ACCOUNT',deleteAccountDone:'Account and data deleted. A new guest account is active.',or:'OR',required:'Fill in all fields.',passMismatch:'Passwords do not match.',passShort:'Password must be at least 6 characters.',working:'Working…'
  };
}
function escAttr(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mxFirebaseAuthPlugin(){
  try{
    const cap=window.Capacitor;
    if(!cap)return null;
    if(cap.Plugins&&cap.Plugins.FirebaseAuthentication)return cap.Plugins.FirebaseAuthentication;
    if(typeof cap.registerPlugin==='function'){
      if(!window.__MXFirebaseAuthenticationPlugin)window.__MXFirebaseAuthenticationPlugin=cap.registerPlugin('FirebaseAuthentication');
      return window.__MXFirebaseAuthenticationPlugin;
    }
  }catch(e){console.warn('[auth] native Firebase plugin lookup failed',e&&e.message||e);}
  return null;
}
function withAuthTimeout(promise,ms,code){
  ms=ms||20000;code=code||'auth/timeout';
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error(code),{code})),ms);});
  return Promise.race([Promise.resolve(promise),timeout]).finally(()=>clearTimeout(timer));
}
function appleLogoHtml(){return '<svg class="appleLogoSvg" viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M279.55 258.94c-.2-36.7 16.6-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.6-19.7C44.1 131.1 4 159.1 4 216.1c0 16.8 3.1 34.1 9.2 51.8 8.2 23.7 37.7 81.8 68.5 80.8 16.1-.4 27.5-11.4 48.5-11.4 20.4 0 31 11.4 48.9 11.4 31 0 57.7-52.7 65.5-76.5-41.6-19.6-39.4-56.6-39.4-57.8zM255.75 95.74c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.6-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>'; }
function authErrorText(err){
  const code=String(err&&err.code||err&&err.message||'');
  const tr=LANG==='tr';
  const host=(location&&(location.origin||location.hostname))||'';
  if(code==='auth/unauthorized-domain')return MX_NATIVE?(tr?'Firebase giriş yetkisi doğrulanamadı. Uygulamayı kapatıp yeniden aç ve tekrar dene.':'Firebase sign-in authorization could not be verified. Close and reopen the app, then try again.'):(tr?('Bu alan Firebase girişleri için yetkili değil: '+host+'. Firebase Console > Authentication > Settings > Authorized domains bölümüne eklenmeli.'):('This domain is not authorized for Firebase sign-in: '+host+'. Add it in Firebase Console > Authentication > Settings > Authorized domains.'));
  if(code==='auth/not-ready')return tr?'Hesap bağlantısı henüz hazırlanıyor. Bir saniye sonra tekrar dokun.':'Account sign-in is still preparing. Tap again in a moment.';
  if(code==='auth/operation-not-supported-in-this-environment'||code==='auth/web-storage-unsupported')return tr?'Bu tarayıcı penceresi hesap girişini desteklemiyor. Oyunu Safari’de tam ekran açıp tekrar dene.':'This browser window cannot complete account sign-in. Open the game full-screen in Safari and try again.';
  const lowerCode=code.toLowerCase();
  if(lowerCode.includes('no credentials available'))return tr?'Google hesabı bilgisi alınamadı. Cihazda bir Google hesabının açık olduğunu kontrol edip yeniden dene.':'Google account credentials were not available. Make sure a Google account is signed in on the device and try again.';
  if(code==='sync/incomplete')return tr?'Bulut ilerlemesi kaydedildi ancak sıralama yayını henüz tamamlanmadı. Daha sonra Şimdi Senkronize Et ile tekrar dene.':'Cloud progress was saved, but ranking publication is still pending. Try Sync Now again later.';
  const map=tr?{
    'auth/invalid-email':'E-posta adresi geçersiz.','auth/invalid-credential':'E-posta veya şifre yanlış.','auth/wrong-password':'E-posta veya şifre yanlış.','auth/user-not-found':'Bu e-posta ile kayıtlı hesap bulunamadı.','auth/email-already-in-use':'Bu e-posta zaten başka bir hesapta kullanılıyor. Giriş yapmayı dene.','auth/credential-already-in-use':'Bu giriş hesabı zaten kayıtlı. Mevcut hesaba geçildi.','auth/weak-password':'Şifre en az 6 karakter olmalı.','auth/popup-closed-by-user':'Giriş penceresi tamamlanmadan kapatıldı.','auth/popup-blocked':'Giriş penceresi engellendi. Oyunu tam ekran aç ve Safari açılır pencerelerine izin ver.','auth/cancelled-popup-request':'Önceki giriş penceresi kapanmadan yeniden denendi.','auth/network-request-failed':'İnternet bağlantısı kurulamadı.','auth/too-many-requests':'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.','auth/requires-recent-login':'Bu işlem için hesabına tekrar giriş yapmalısın.','auth/provider-already-linked':'Bu e-posta giriş yöntemi zaten hesabına bağlı.','auth/no-current-user':'Kayıt için geçici kullanıcı oturumu oluşturulamadı. İnternet bağlantını kontrol edip tekrar dene.','auth/operation-not-allowed':'Bu giriş yöntemi Firebase üzerinde etkin değil.','auth/missing-or-invalid-nonce':'Apple giriş güvenlik kodu doğrulanamadı. Girişi yeniden başlat.','auth/provider-account-conflict':'Bu Apple veya Google kimliği başka bir Moleculox hesabına bağlı. Mevcut ilerlemeni korumak için hesap değiştirilmedi.','auth/google-native-timeout':'Google giriş ekranı zaman aşımına uğradı. İnternet bağlantını kontrol edip yeniden dene.','auth/firebase-credential-timeout':'Google hesabı açıldı ancak Firebase bağlantısı zamanında tamamlanamadı. Yeniden dene.','auth/email-timeout':'E-posta giriş işlemi zaman aşımına uğradı. İnternet bağlantını kontrol edip yeniden dene.','cloud/reconcile-failed':'Giriş yapıldı ancak bulut ilerlemesi doğrulanamadı. Bağlantını kontrol edip yeniden dene.','cloud/save-failed':'Bulut ilerlemesi kaydedilemedi. İnternet bağlantını kontrol edip yeniden dene.','auth/unavailable':'Hesap sistemi şu anda hazırlanamadı. Uygulamayı kapatıp yeniden aç ve tekrar dene.'
  }:{
    'auth/invalid-email':'The email address is invalid.','auth/invalid-credential':'Incorrect email or password.','auth/wrong-password':'Incorrect email or password.','auth/user-not-found':'No account was found for this email.','auth/email-already-in-use':'This email is already used by another account. Try signing in.','auth/credential-already-in-use':'This sign-in account already exists. The existing account was opened.','auth/weak-password':'Password must be at least 6 characters.','auth/popup-closed-by-user':'The sign-in window was closed before completion.','auth/popup-blocked':'The sign-in window was blocked. Open the game full-screen and allow Safari pop-ups.','auth/cancelled-popup-request':'A second sign-in was started before the first one finished.','auth/network-request-failed':'Could not connect to the internet.','auth/too-many-requests':'Too many attempts. Try again later.','auth/requires-recent-login':'Sign in again before doing this.','auth/provider-already-linked':'This email sign-in method is already connected.','auth/no-current-user':'A temporary user session could not be created. Check your connection and try again.','auth/operation-not-allowed':'This sign-in method is not enabled in Firebase.','auth/missing-or-invalid-nonce':'The Apple sign-in security nonce could not be verified. Start sign-in again.','auth/provider-account-conflict':'This Apple or Google identity belongs to another Moleculox account. The current account was kept to protect your progress.','auth/google-native-timeout':'Google sign-in timed out. Check your connection and try again.','auth/firebase-credential-timeout':'Google opened, but Firebase did not finish connecting in time. Try again.','auth/email-timeout':'Email sign-in timed out. Check your connection and try again.','cloud/reconcile-failed':'Sign-in completed, but cloud progress could not be verified. Check your connection and try again.','cloud/save-failed':'Cloud progress could not be saved. Check your connection and try again.','auth/unavailable':'The account system is not ready. Close and reopen the app, then try again.'
  };
  // Never expose WKWebView origins, raw Firebase messages, or internal SDK details to players.
  console.warn('[auth] sign-in failed:',code);
  return map[code]||(tr?'Giriş işlemi tamamlanamadı. Bağlantını kontrol edip yeniden dene.':'Sign-in could not be completed. Check your connection and try again.');
}
function setAccountState(next){
  accountState=Object.assign({signedIn:false,isAnonymous:true,email:'',displayName:'',photoURL:'',providers:[]},next||{});
  const dot=$('#accountDot');
  if(dot)dot.className='accountDot '+(!window.MXCloud||window.MXCloud.authFailed?'offline':accountState.isAnonymous?'guest':'member');
  const b=$('#btnSwitchProfile');
  if(b)b.title=accountState.isAnonymous?(LANG==='tr'?'Misafir hesap · Hesap ve oyuncular':'Guest account · Account & players'):(accountState.email||accountState.displayName||'Account');
  if(scr.splash.classList.contains('on'))startSplashConversation(true,420);
  if(accountState.signedIn&&typeof runLevelCloudCheckpoint==='function')setTimeout(runLevelCloudCheckpoint,120);
}
function showGuestAccountToast(){
  // V3.13.5: the old full-width account toast was visually intrusive. Guest
  // guidance now appears naturally in Dr. E's contextual menu conversation.
  if(scr.splash.classList.contains('on'))startSplashConversation(false,900);
}
function findProfileById(profileId){
  return Object.keys(profiles).find(n=>profiles[n]&&profiles[n].profileId===profileId)||null;
}
function uniqueProfileName(base){
  let name=(base||'Player').trim().slice(0,18)||'Player';
  if(!profiles[name])return name;
  let i=2;while(profiles[(name.slice(0,15)+' '+i).slice(0,18)])i++;
  return (name.slice(0,15)+' '+i).slice(0,18);
}
function profileHasMeaningfulProgress(p){
  p=p||{};
  return Number(p.cur)>0||Number(p.coins)>0||Number(p.maxCoins)>0||Number(p.totalHints)>0||
    Object.keys(p.stars||{}).length>0||Object.keys(p.disc||{}).length>0||
    Object.keys(p.achv||{}).length>0||Object.keys(p.speedRuns||{}).length>0||
    Object.keys(p.bestMoves||{}).length>0||Object.keys(p.researchLevels||{}).length>0||
    Object.keys(p.bonusClaims||{}).length>0||Object.keys(p.researchBonuses||{}).length>0||
    Object.keys(p.dailyScores||{}).length>0||Object.keys(p.duelRatedMatches||{}).length>0||Number(p.researchPoints)>0;
}
function autoGuestName(){return LANG==='tr'?'Oyuncu 1':'Player 1';}
function createAutoGuestProfile(preserveSettings){
  const old=preserveSettings&&save?save:{};
  const visible=autoGuestName();
  const key=uniqueProfileName(visible);
  const next=Object.assign(defaultSave(),{
    playerName:visible,profileId:genProfileId(),tutorialDone:true,autoGuest:true,
    lang:old.lang||LANG,volM:Number.isFinite(old.volM)?old.volM:1,
    volMu:Number.isFinite(old.volMu)?old.volMu:.8,volS:Number.isFinite(old.volS)?old.volS:1,volV:Number.isFinite(old.volV)?old.volV:1,
    muM:!!old.muM,muMu:!!old.muMu,muS:!!old.muS,muV:!!old.muV,externalMusic:typeof old.externalMusic==='boolean'?old.externalMusic:false,dpad:!!old.dpad
  });
  profiles[key]=next;curProfile=key;lastProfile=key;save=next;persistAll();
  return key;
}
function setCurrentProfileNickname(rawName){
  const name=String(rawName||'').trim().slice(0,18);
  if(!name)return '';
  if(!curProfile||!profiles[curProfile]){
    const key=uniqueProfileName(name);
    save=Object.assign(defaultSave(),save||{},{playerName:name,profileId:(save&&save.profileId)||genProfileId(),autoGuest:false});
    curProfile=key;lastProfile=key;profiles[key]=save;
  }else{
    save.playerName=name;save.autoGuest=false;profiles[curProfile]=save;lastProfile=curProfile;
  }
  persistAll();
  return name;
}
function resetLocalAccountData(){
  const previous=save||defaultSave();
  profiles={};lastProfile=null;curProfile=null;
  try{localStorage.removeItem(PKEY);}catch(e){}
  createAutoGuestProfile(previous);
  document.body.classList.toggle('nodpad',!save.dpad);
  setLang(normalizeLang(save.lang));
  updateCoins();updateBadge();refreshSplash();buildProfileSelect();
}
function mergeCloudData(target,cloud){
  target=ensureResearchState(Object.assign(defaultSave(),target||{}));cloud=cloud||{};
  const core=window.MXSyncCore;
  if(core&&typeof core.mergeProfiles==='function'){
    const merged=core.mergeProfiles(target,cloud,{settings:'right',identity:'right',now:new Date()});
    merged.autoGuest=false;
    return ensureResearchState(Object.assign(defaultSave(),merged));
  }
  // Safe compatibility fallback; V3.8.3 normally uses the shared merge core.
  const cloudStars=cloud.stars&&typeof cloud.stars==='object'?cloud.stars:{};
  for(const k in cloudStars)target.stars[k]=Math.max(Number(target.stars[k])||0,Number(cloudStars[k])||0);
  if(cloud.bestMoves)for(const k in cloud.bestMoves){const cv=Number(cloud.bestMoves[k]),lv=Number(target.bestMoves[k]);if(cv>0&&(!lv||cv<lv))target.bestMoves[k]=cv;}
  target.cur=Math.max(Number(target.cur)||0,Number(cloud.cur)||0);
  if(cloud.disc)for(const k in cloud.disc)if(cloud.disc[k])target.disc[k]=1;
  if(cloud.achv)for(const k in cloud.achv)if(cloud.achv[k])target.achv[k]=1;
  if(cloud.speedRuns)for(const k in cloud.speedRuns){const cv=Number(cloud.speedRuns[k]),lv=Number(target.speedRuns[k]);if(cv>0&&(!lv||cv<lv))target.speedRuns[k]=cv;}
  target.coins=Math.max(Number(target.coins)||0,Number(cloud.coins)||0,Number(cloud.verifiedCoins)||0);
  target.maxCoins=Math.max(Number(target.maxCoins)||0,Number(cloud.maxCoins)||0,target.coins);
  if(cloud.researchLevels)for(const k in cloud.researchLevels)target.researchLevels[k]=Math.max(Number(target.researchLevels[k])||0,Number(cloud.researchLevels[k])||0);
  if(cloud.researchAchievements)for(const k in cloud.researchAchievements)target.researchAchievements[k]=Math.max(Number(target.researchAchievements[k])||0,Number(cloud.researchAchievements[k])||0);
  if(cloud.researchBonuses)for(const k in cloud.researchBonuses)target.researchBonuses[k]=Math.max(Number(target.researchBonuses[k])||0,Number(cloud.researchBonuses[k])||0);
  if(cloud.bonusClaims)for(const k in cloud.bonusClaims)if(cloud.bonusClaims[k])target.bonusClaims[k]=1;
  if(cloud.dailyScores)for(const k in cloud.dailyScores)target.dailyScores[k]=Math.max(Number(target.dailyScores[k])||0,Number(cloud.dailyScores[k])||0);
  target.duelRatedMatches=target.duelRatedMatches&&typeof target.duelRatedMatches==='object'?target.duelRatedMatches:{};if(cloud.duelRatedMatches)for(const k in cloud.duelRatedMatches)target.duelRatedMatches[k]=Math.max(Number(target.duelRatedMatches[k])||0,Number(cloud.duelRatedMatches[k])||0);
  target.duelRewards=target.duelRewards&&typeof target.duelRewards==='object'?target.duelRewards:{};if(cloud.duelRewards)for(const k in cloud.duelRewards)if(cloud.duelRewards[k])target.duelRewards[k]=1;
  target.duelRewardClaims=target.duelRewardClaims&&typeof target.duelRewardClaims==='object'?target.duelRewardClaims:{};if(cloud.duelRewardClaims)for(const k in cloud.duelRewardClaims)target.duelRewardClaims[k]=Math.max(Number(target.duelRewardClaims[k])||0,Number(cloud.duelRewardClaims[k])||0);
  if(cloud.activeDuelFrame)target.activeDuelFrame=String(cloud.activeDuelFrame).slice(0,40);if(cloud.activeDuelTitle!=null)target.activeDuelTitle=String(cloud.activeDuelTitle).slice(0,40);
  target.duelPeakRating=Math.max(Number(target.duelPeakRating)||800,Number(cloud.duelPeakRating)||800);target.duelBestStreak=Math.max(Number(target.duelBestStreak)||0,Number(cloud.duelBestStreak)||0);
  const calculated=researchMapSum(target.researchLevels)+researchMapSum(target.researchAchievements)+researchMapSum(target.researchBonuses)+researchMapSum(target.dailyScores);
  target.researchPoints=Math.max(calculated,Number(target.researchPoints)||0,Number(cloud.researchPoints)||0);
  if(cloud.playerName)target.playerName=String(cloud.playerName).slice(0,18);
  if(cloud.profileId)target.profileId=cloud.profileId;
  target.autoGuest=false;target.saveSchema=5;
  return ensureResearchState(target);
}

function cloudAuthoritativeProfile(local,cloud){
  // Signed-in Web accounts use Firestore as the only progress authority.
  // Device storage may keep presentation preferences, but it must never raise
  // campaign, coins, RP, achievements, records or competitive values.
  local=local&&typeof local==='object'?local:{};
  cloud=cloud&&typeof cloud==='object'?cloud:{};
  const result=ensureResearchState(Object.assign(defaultSave(),cloud));
  ['lang','volM','volMu','volS','muM','muMu','muS','externalMusic','dpad'].forEach(k=>{
    if(Object.prototype.hasOwnProperty.call(local,k))result[k]=local[k];
  });
  result.autoGuest=false;
  result.saveSchema=5;
  return result;
}

function normalizedPlayerName(value){
  const core=window.MXSyncCore;
  return core&&core.normalizeName?core.normalizeName(value):String(value||'').trim().toLowerCase().replace(/\s+/g,' ');
}

async function reconcileAccountProfiles(){
  if(!window.MXCloud||accountState.isAnonymous)return false;
  if(accountReconcilePromise)return accountReconcilePromise;
  accountReconcilePromise=(async()=>{
    setSyncStatus('syncing');
    try{
      const listed=await window.MXCloud.listProfiles();
      if(!Array.isArray(listed))throw Object.assign(new Error('cloud/profile-list-unavailable'),{code:'cloud/profile-list-unavailable'});
      const rows=listed.filter(r=>r&&r.profileId);

      if(rows.length){
        // Firebase already contains this account. Rebuild the local profile list
        // from Firestore and discard unmatched phone progress. Only harmless UI
        // preferences are carried from a same-ID local copy.
        const oldProfiles=profiles||{};
        const rebuilt={};
        for(const cloud of rows){
          let local=null;
          for(const key of Object.keys(oldProfiles)){
            if((oldProfiles[key]||{}).profileId===cloud.profileId){local=oldProfiles[key];break;}
          }
          const profile=cloudAuthoritativeProfile(local,cloud);
          // uniqueProfileName reads the global map, so use a deterministic fallback.
          let finalKey=String(profile.playerName||'Player').slice(0,18)||'Player',n=2;
          while(rebuilt[finalKey])finalKey=(String(profile.playerName||'Player').slice(0,14)||'Player')+' '+(n++);
          rebuilt[finalKey]=profile;
        }
        profiles=rebuilt;
      }else{
        // One-time migration only: a genuinely empty Firebase account may adopt
        // existing phone profiles. After the first successful write, Firestore is
        // authoritative on every device and origin.
        const candidates=Object.keys(profiles).filter(name=>profileHasMeaningfulProgress(profiles[name]||{}));
        if(!candidates.length&&curProfile&&profiles[curProfile])candidates.push(curProfile);
        for(const name of candidates){
          let p=ensureResearchState(profiles[name]);
          if(!p.profileId)p.profileId=genProfileId();
          if(!p.playerName)p.playerName=name;
          p.saveSchema=5;
          const written=await window.MXCloud.saveProgressNow(p,p.profileId);
          if(written&&typeof written==='object')profiles[name]=cloudAuthoritativeProfile(p,written);
        }
      }

      const names=Object.keys(profiles);
      let target=null;
      if(save&&save.profileId)target=findProfileById(save.profileId);
      if(!target&&lastProfile&&profiles[lastProfile])target=lastProfile;
      if(!target&&names.length){
        target=names.slice().sort((a,b)=>{
          const score=p=>(Math.max(0,Number(p.cur)||0)*1000000)+(Object.keys(p.stars||{}).length*10000)+(Math.max(0,Number(p.researchPoints)||0)*10)+Math.max(0,Number(p.coins)||0);
          return score(profiles[b]||{})-score(profiles[a]||{});
        })[0];
      }
      if(target){
        curProfile=target;lastProfile=target;
        save=ensureResearchState(Object.assign(defaultSave(),profiles[target]));
        document.body.classList.toggle('nodpad',!save.dpad);
        setLang(normalizeLang(save.lang));
      }
      persistAll();updateCoins();updateBadge();refreshSplash();buildProfileSelect();
      if(target)await repairCurrentLeaderboard('firebase-authoritative-reconcile',true);
      if(!target&&names.length>1){closeModal();show('profile');}
      setSyncStatus('saved');return true;
    }catch(e){console.warn('[account] Firebase-authoritative reconcile failed',e);setSyncStatus('error');return false;}
  })();
  try{return await accountReconcilePromise;}finally{accountReconcilePromise=null;}
}

// Apply the final transaction result to the active device immediately. This
// makes three open platforms converge without requiring a page reload.
window.addEventListener('mx-cloud-profile-merged',ev=>{
  try{
    const detail=ev&&ev.detail||{};if(!detail.profileId||!detail.data)return;
    const name=findProfileById(detail.profileId);if(!name)return;
    profiles[name]=hasPermanentCloudAccount()?cloudAuthoritativeProfile(profiles[name],detail.data):mergeCloudData(profiles[name],detail.data);
    if(curProfile===name){save=Object.assign(defaultSave(),profiles[name]);updateCoins();updateBadge();refreshSplash();}
    persistAll();
  }catch(e){console.warn('[account] live cloud merge failed',e);}
});

function setAuthBusy(btn,on,label){
  if(!btn)return;if(on){btn.dataset.old=btn.textContent;btn.textContent=label||accountCopy().working;btn.classList.add('authBusy');btn.disabled=true;}
  else{btn.textContent=btn.dataset.old||btn.textContent;btn.classList.remove('authBusy');btn.disabled=false;}
}
async function finishAppleConnection(button){
  const c=accountCopy();
  try{
    if(!window.MXCloud||!window.MXCloud.connectApple)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});
    const loginPromise=window.MXCloud.connectApple();
    SFX.click();setAuthBusy(button,true,c.working);
    const connected=await loginPromise;
    if(save.autoGuest&&!profileHasMeaningfulProgress(save)&&connected&&connected.displayName)setCurrentProfileNickname(connected.displayName);
    await reconcileAccountProfiles();
    openAccountModal(c.connected,true);
  }catch(err){openAccountModal(authErrorText(err),false);}
}
function confirmAppleConnection(){
  const c=accountCopy();
  openModal('<h3 class="appleConsentTitle">'+appleLogoHtml()+' '+c.appleConsentTitle+'</h3><div class="msub appleConsentText">'+c.appleConsent+'</div><div class="mrow"><button class="btn apple" id="accAppleConfirm">'+c.appleConsentGo+'</button><button class="btn" id="accAppleCancel">'+t('cancel')+'</button></div>');
  $('#modalBox').classList.add('accountModal');
  const go=$('#accAppleConfirm');if(go)go.addEventListener('click',e=>{e.preventDefault();finishAppleConnection(go);},{passive:false});
  bindTap('#accAppleCancel',()=>openAccountModal());
}
// Native iOS path (Capacitor). R3 generates the raw nonce in this web layer,
// passes it into the patched native Apple request, and then gives the same raw nonce
// plus Apple's ID token to Firebase JS. One nonce now travels end-to-end, avoiding
// auth/missing-or-invalid-nonce. The native OS sheet remains the consent screen.
async function finishAccountLoginUI(connected,c,successMessage){
  if(connected)setAccountState(connected);
  if(save.autoGuest&&!profileHasMeaningfulProgress(save)&&connected&&connected.displayName)setCurrentProfileNickname(connected.displayName);
  let ok=await reconcileAccountProfiles();
  if(!ok){
    await new Promise(resolve=>setTimeout(resolve,900));
    ok=await reconcileAccountProfiles();
  }
  if(!ok){
    setSyncStatus('error');
    openAccountModal(c.connectedSyncPending,true);
    return false;
  }
  openAccountModal(successMessage||c.connected,true);
  return true;
}
async function nativeGoogleSignIn(button){
  const c=accountCopy();
  try{
    const plugin=mxFirebaseAuthPlugin();
    if(!plugin||typeof plugin.signInWithGoogle!=='function'||!window.MXCloud||!window.MXCloud.connectGoogleIdToken)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});
    setAuthBusy(button,true,c.working);
    const result=await withAuthTimeout(plugin.signInWithGoogle({skipNativeAuth:true,useCredentialManager:false}),45000,'auth/google-native-timeout');
    const idToken=result&&((result.credential&&result.credential.idToken)||result.idToken||result.identityToken);
    if(!idToken)throw Object.assign(new Error('auth/invalid-credential'),{code:'auth/invalid-credential'});
    const connected=await withAuthTimeout(window.MXCloud.connectGoogleIdToken(idToken),45000,'auth/firebase-credential-timeout');
    await finishAccountLoginUI(connected,c);
  }catch(err){openAccountModal(authErrorText(err),false);}
}
function createAppleRawNonce(length){
  const size=Math.max(16,Math.min(64,Number(length)||32));
  const alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const cryptoApi=window.crypto||window.msCrypto;
  if(!cryptoApi||typeof cryptoApi.getRandomValues!=='function')throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});
  const out=[];
  // Rejection sampling avoids modulo bias while keeping the nonce URL-safe.
  const limit=Math.floor(256/alphabet.length)*alphabet.length;
  const bytes=new Uint8Array(size*2);
  while(out.length<size){
    cryptoApi.getRandomValues(bytes);
    for(let i=0;i<bytes.length&&out.length<size;i++)if(bytes[i]<limit)out.push(alphabet[bytes[i]%alphabet.length]);
  }
  return out.join('');
}
function decodeAppleIdTokenPayload(idToken){
  try{
    const part=String(idToken||'').split('.')[1]||'';
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');
    return JSON.parse(decodeURIComponent(Array.from(atob(normalized),ch=>'%'+ch.charCodeAt(0).toString(16).padStart(2,'0')).join('')));
  }catch(e){return null;}
}
async function sha256HexText(value){
  const subtle=window.crypto&&window.crypto.subtle;
  if(!subtle||typeof subtle.digest!=='function')return '';
  const data=new TextEncoder().encode(String(value||''));
  const digest=await subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
async function resolveAppleRawNonce(result,idToken,requestedNonce){
  const credential=result&&result.credential||{};
  const candidates=[credential.nonce,credential.rawNonce,result&&result.nonce,requestedNonce]
    .map(v=>String(v||'').trim()).filter((v,i,a)=>v&&a.indexOf(v)===i);
  if(!candidates.length)throw Object.assign(new Error('auth/missing-or-invalid-nonce'),{code:'auth/missing-or-invalid-nonce'});
  const payload=decodeAppleIdTokenPayload(idToken);
  const claim=String(payload&&payload.nonce||'').trim().toLowerCase();
  // The plugin's returned credential nonce is the source of truth when native
  // iOS generated its own value. When a patched build accepted our supplied
  // nonce, both candidates are identical. Verify against Apple's signed token
  // before sending anything to Firebase JS.
  if(claim){
    for(const candidate of candidates){
      const hashed=(await sha256HexText(candidate)).toLowerCase();
      if(hashed&&hashed===claim)return candidate;
      if(candidate.toLowerCase()===claim)return candidate;
    }
    throw Object.assign(new Error('auth/missing-or-invalid-nonce'),{code:'auth/missing-or-invalid-nonce'});
  }
  return candidates[0];
}
async function nativeAppleSignIn(button){
  const c=accountCopy();
  try{
    const plugin=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.FirebaseAuthentication;
    if(!plugin||!window.MXCloud||!window.MXCloud.connectAppleIdToken)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});
    setAuthBusy(button,true,c.working);
    const requestedNonce=createAppleRawNonce(32);
    const result=await withAuthTimeout(plugin.signInWithApple({skipNativeAuth:true,rawNonce:requestedNonce}),45000,'auth/firebase-credential-timeout');
    const idToken=String(result&&((result.credential&&result.credential.idToken)||result.idToken||result.identityToken)||'').trim();
    if(!idToken)throw Object.assign(new Error('auth/invalid-credential'),{code:'auth/invalid-credential'});
    const verifiedRawNonce=await resolveAppleRawNonce(result,idToken,requestedNonce);
    const givenName=(result.user&&(result.user.givenName||result.user.displayName))||'';
    const connected=await withAuthTimeout(window.MXCloud.connectAppleIdToken(idToken,verifiedRawNonce,givenName),45000,'auth/firebase-credential-timeout');
    await finishAccountLoginUI(connected,c);
  }catch(err){openAccountModal(authErrorText(err),false);}
}
function cloudStatusLabel(){
  const c=accountCopy();
  if(accountState.isAnonymous)return {key:'guest',icon:'👤',label:c.syncGuest};
  if(navigator.onLine===false||syncStatus==='offline')return {key:'offline',icon:'📴',label:c.syncOffline};
  if(syncStatus==='syncing')return {key:'syncing',icon:'⏳',label:c.syncWorking};
  if(syncStatus==='error')return {key:'error',icon:'⚠️',label:c.syncError};
  return {key:'saved',icon:'✅',label:c.syncSaved};
}
function updateCloudStatusHeader(){
  const c=accountCopy(),state=cloudStatusLabel(),live=$('#cloudLiveState'),last=$('#cloudLastSync');
  if(live){live.className='cloudState cloud-'+state.key;live.innerHTML='<span>'+state.icon+'</span><div><b>'+state.label+'</b><small>'+(accountState.isAnonymous?c.syncGuest:c.cloudGood)+'</small></div>';}
  if(last){const at=readLastCloudSync();last.textContent=at?formatCloudDate(at):c.neverSynced;}
}
async function refreshCloudRankStatus(force){
  const c=accountCopy(),classic=$('#cloudClassicRank'),duel=$('#cloudDuelRank');
  if(!classic||!duel)return;
  if(accountState.isAnonymous){classic.innerHTML='<b>—</b><small>'+c.rankGuest+'</small>';duel.innerHTML='<b>—</b><small>'+c.rankGuest+'</small>';return;}
  classic.innerHTML='<b>…</b><small>'+c.rankLoading+'</small>';duel.innerHTML='<b>…</b><small>'+c.rankLoading+'</small>';
  const token=++lastCloudStatusRefreshToken;
  try{
    if(force&&window.MXCloud&&window.MXCloud.clearLeaderboardCache)window.MXCloud.clearLeaderboardCache();
    const result=window.MXCloud&&window.MXCloud.getMyRankingStatus?await window.MXCloud.getMyRankingStatus(save.profileId):null;
    if(token!==lastCloudStatusRefreshToken||!$('#cloudClassicRank'))return;
    if(!result||!result.ok)throw Object.assign(new Error(result&&result.reason||'ranking/error'),{code:result&&result.reason||'ranking/error'});
    const cr=result.classic,dr=result.duel;
    classic.innerHTML=cr&&cr.rank?'<b>#'+cr.rank+'</b><small>'+Math.max(0,Number(cr.row&&cr.row.researchPoints)||0).toLocaleString()+' RP · '+cr.total+' '+(LANG==='tr'?'oyuncu':'players')+'</small>':'<b>—</b><small>'+c.rankUnpublished+'</small>';
    duel.innerHTML=dr&&dr.rank?'<b>#'+dr.rank+'</b><small>'+Math.max(0,Number(dr.row&&dr.row.rating)||800)+' DP · '+dr.total+' '+(LANG==='tr'?'oyuncu':'players')+'</small>':'<b>—</b><small>'+c.rankUnpublished+'</small>';
  }catch(e){
    if(token!==lastCloudStatusRefreshToken||!$('#cloudClassicRank'))return;
    const msg=navigator.onLine===false?c.syncOffline:c.syncError;
    classic.innerHTML='<b>!</b><small>'+msg+'</small>';duel.innerHTML='<b>!</b><small>'+msg+'</small>';
  }
}
async function runManualCloudSync(btn){
  const c=accountCopy();
  if(accountState.isAnonymous){openCloudStatusModal(c.syncGuest,false);return;}
  if(navigator.onLine===false){setSyncStatus('offline');openCloudStatusModal(c.syncOffline,false);return;}
  setAuthBusy(btn,true,c.syncWorking);setSyncStatus('syncing');
  try{
    if(!window.MXCloud||!save.profileId)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});
    await window.MXCloud.ready;
    await reconcileAccountProfiles();
    const merged=await window.MXCloud.saveProgressNow(save,save.profileId);
    if(!merged||typeof merged!=='object')throw Object.assign(new Error('cloud/save-failed'),{code:'cloud/save-failed'});
    applyMergedCloudProfile(merged);
    let rankingPending=false;
    try{if(window.MXCloud.cleanupOrphanRankingRows)await window.MXCloud.cleanupOrphanRankingRows();}catch(cleanErr){rankingPending=true;console.warn('[Moleculox] ranking cleanup pending:',cleanErr&&cleanErr.code||cleanErr);}
    try{const classic=await repairCurrentLeaderboard('manual-cloud-panel',true);if(!classic||!classic.ok)rankingPending=true;}catch(classicErr){rankingPending=true;console.warn('[Moleculox] classic ranking remains unpublished:',classicErr&&classicErr.code||classicErr);}
    try{const duel=window.MXCloud.syncDuelLeaderboard?await window.MXCloud.syncDuelLeaderboard(save,save.profileId,true):{ok:false,reason:'unavailable'};if(!duel||!duel.ok){rankingPending=true;console.warn('[Moleculox] duel ranking remains unpublished:',duel&&duel.reason);}}catch(duelErr){rankingPending=true;console.warn('[Moleculox] duel ranking remains unpublished:',duelErr&&duelErr.code||duelErr);}
    setSyncStatus('saved');
    openCloudStatusModal(rankingPending?c.syncSavedRankPending:c.syncSuccess,true);
  }catch(e){setSyncStatus(navigator.onLine===false?'offline':'error');openCloudStatusModal(authErrorText(e),false);}
}
function openCloudStatusModal(message,good){
  const c=accountCopy(),state=cloudStatusLabel();
  const player=esc((save.playerName||curProfile||'PLAYER').slice(0,18));
  openModal('<button type="button" class="accountCloseX" id="cloudCloseTop" aria-label="'+c.close+'">×</button><h3>☁ '+c.cloudTitle+'</h3>'+
    (message?'<div class="accountNotice '+(good?'good':'')+'">'+esc(message)+'</div>':'')+
    '<div id="cloudLiveState" class="cloudState cloud-'+state.key+'"><span>'+state.icon+'</span><div><b>'+state.label+'</b><small>'+(accountState.isAnonymous?c.syncGuest:c.cloudGood)+'</small></div></div>'+
    '<div class="cloudInfoGrid"><div><span>'+c.playerLabel+'</span><b>'+player+'</b></div><div><span>'+c.providersLabel+'</span><b>'+esc(providerDisplayList())+'</b></div><div class="cloudWide"><span>'+c.lastSync+'</span><b id="cloudLastSync">'+(readLastCloudSync()?formatCloudDate(readLastCloudSync()):c.neverSynced)+'</b></div></div>'+
    '<div class="cloudRankGrid"><div class="cloudRankCard"><span>🌍 '+c.classicRankLabel+'</span><div id="cloudClassicRank"><b>…</b><small>'+c.rankLoading+'</small></div></div><div class="cloudRankCard"><span>⚔️ '+c.duelRankLabel+'</span><div id="cloudDuelRank"><b>…</b><small>'+c.rankLoading+'</small></div></div></div>'+
    '<div class="accountActions">'+(!accountState.isAnonymous?'<button class="btn green" id="cloudSyncNow">↻ '+c.syncNow+'</button>':'')+'<button class="btn blue" id="cloudBackAccount">'+c.backAccount+'</button><button class="btn" id="cloudClose">'+c.close+'</button></div>');
  $('#modalBox').classList.add('accountModal','cloudStatusModal');
  const sync=$('#cloudSyncNow');if(sync)sync.addEventListener('pointerdown',e=>{e.preventDefault();runManualCloudSync(e.currentTarget);},{passive:false});
  bindTap('#cloudBackAccount',()=>openAccountModal());bindTap('#cloudCloseTop',()=>closeModal());bindTap('#cloudClose',()=>closeModal());
  updateCloudStatusHeader();refreshCloudRankStatus(false);
}

// Added 2026-07-26: iOS Safari can get stuck zoomed-in after the account
// sign-in flow (a known WebKit quirk — maximum-scale/user-scalable aren't
// always fully honored on focus/blur transitions). This forces a reset by
// briefly touching the viewport meta tag's content, which makes Safari
// recompute the zoom level, then restores the original content string.
function resetViewportZoomIOS(){
  try{
    const vp=document.querySelector('meta[name="viewport"]');
    if(!vp)return;
    const original=vp.getAttribute('content');
    if(!original)return;
    vp.setAttribute('content',original+', maximum-scale=1.0');
    setTimeout(()=>{vp.setAttribute('content',original);},50);
  }catch(e){}
}
function openAccountModal(message,good){
  if(good)setTimeout(resetViewportZoomIOS,120);
  const c=accountCopy();const member=!accountState.isAnonymous;const cloudReady=!!(window.MXCloud&&window.MXCloud.connectGoogle);
  if(!cloudReady&&!message)message=LANG==='tr'?'Firebase bağlantısı hazırlanıyor…':'Preparing Firebase connection…';
  const avatar=accountState.photoURL?'<img src="'+escAttr(accountState.photoURL)+'" alt="">':'👤';
  const identity=member?(accountState.displayName||accountState.email||c.cloudGood):c.guestTitle;
  const sub=member?((accountState.email?esc(accountState.email)+'<br>':'')+c.memberSub):c.guestSub;
  openModal('<button type="button" class="accountCloseX" id="accCloseTop" aria-label="'+c.close+'">×</button><h3>👤 '+c.title+'</h3><div class="accountHero"><div class="accountAvatar">'+avatar+'</div><div><strong>'+esc(identity)+'</strong><small>'+sub+'</small></div></div>'+
    (message?'<div class="accountNotice '+(good?'good':'')+'">'+esc(message)+'</div>':'')+
    '<div class="accountNotice '+(member?'good':'')+'">'+(member?'✓ '+c.cloudGood:'⚠ '+c.guestWarn)+'</div><div class="accountActions">'+
    (!member?(MX_SHOW_APPLE_BTN?'<button class="btn apple" id="accApple">'+appleLogoHtml()+'<span>'+c.apple+'</span></button>':'')+'<button class="btn google" id="accGoogle">'+c.google+'</button>'+'<div class="accountDivider">'+c.or+'</div><button class="btn blue" id="accEmailLogin">✉ '+c.emailLogin+'</button><button class="btn ghost" id="accEmailCreate">＋ '+c.emailCreate+'</button>':'')+
    (member&&MX_SHOW_APPLE_BTN&&!accountState.providers.includes('apple.com')?'<button class="btn apple" id="accApple">'+appleLogoHtml()+'<span>'+c.linkApple+'</span></button>':'')+
    (member?(accountState.providers.includes('google.com')?'<button class="btn google googleLinked" id="accGoogleLinked" disabled>✓ '+(LANG==='tr'?'Google hesabı bağlı':'Google account linked')+'</button>':'<button class="btn google" id="accGoogle">'+(LANG==='tr'?'Google hesabını bağla':'Link Google account')+'</button>'):'')+
    (member&&!accountState.providers.includes('password')?'<button class="btn ghost" id="accEmailCreate">✉ '+c.linkEmail+'</button>':'')+
    '<div class="accountUtilityRow"><button class="btn blue accountCloudBtn" id="accCloudStatus">'+c.cloudPanel+'</button><button class="btn ghost" id="accManage">'+c.manage+'</button></div>'+
    (member&&accountState.providers.includes('password')?'<button class="btn ghost" id="accReset">🔑 '+c.reset+'</button>':'')+
    (member?'<button class="btn danger" id="accLogout">↪ '+c.logout+'</button><button class="btn danger" id="accDeleteAccount">🗑 '+c.deleteAccount+'</button>':'')+
    '<button class="btn" id="accClose">'+c.close+'</button></div><div class="authTiny">'+c.localProfiles+'</div>');
  $('#modalBox').classList.add('accountModal');
  const apple=$('#accApple');if(apple)apple.addEventListener('click',e=>{e.preventDefault();SFX.click();if(MX_IOS_NATIVE)nativeAppleSignIn(apple);else confirmAppleConnection();},{passive:false});
  const google=$('#accGoogle');if(google)google.addEventListener('click',async e=>{e.preventDefault();
    if(MX_IOS_NATIVE||MX_ANDROID_NATIVE)return nativeGoogleSignIn(google);
    const before={profiles:JSON.parse(JSON.stringify(profiles||{})),curProfile,lastProfile,save:JSON.parse(JSON.stringify(save||{}))};
    try{
      if(!window.MXCloud)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});
      if(save&&save.profileId&&window.MXCloud.saveProgressNow&&!accountState.isAnonymous){
        try{const pre=await window.MXCloud.saveProgressNow(save,save.profileId);if(pre)applyMergedCloudProfile(pre);}catch(preErr){console.warn('[account] pre-link save failed',preErr);}
      }
      SFX.click();setAuthBusy(google,true,c.working);
      const connected=await window.MXCloud.connectGoogle();
      // On iPhone/iPad web, Google uses a full-page redirect. The browser will
      // leave this page and finish reconciliation automatically after returning.
      if(connected&&connected.redirectStarted)return;
      // Do not wait for Firebase's asynchronous auth listener before merging.
      // Safari may deliver it after this handler continues.
      if(connected)setAccountState(connected);
      if(save.autoGuest&&!profileHasMeaningfulProgress(save)&&connected&&connected.displayName)setCurrentProfileNickname(connected.displayName);
      const ok=await reconcileAccountProfiles();
      if(!ok)throw Object.assign(new Error('cloud/reconcile-failed'),{code:'cloud/reconcile-failed'});
      openAccountModal(c.connected,true);
    }catch(err){
      profiles=before.profiles;curProfile=before.curProfile;lastProfile=before.lastProfile;save=ensureResearchState(Object.assign(defaultSave(),before.save));persistAll();updateCoins();updateBadge();refreshSplash();
      openAccountModal(authErrorText(err),false);
    }
  },{passive:false});
  const login=$('#accEmailLogin');if(login)login.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();openEmailLogin();},{passive:false});
  const create=$('#accEmailCreate');if(create)create.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();openEmailCreate();},{passive:false});
  const cloudStatusBtn=$('#accCloudStatus');if(cloudStatusBtn)cloudStatusBtn.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();openCloudStatusModal();},{passive:false});
  const manage=$('#accManage');if(manage)manage.addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();closeModal();buildProfileSelect();show('profile');},{passive:false});
  const reset=$('#accReset');if(reset)reset.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();openPasswordReset(accountState.email);},{passive:false});
  const logout=$('#accLogout');if(logout)logout.addEventListener('pointerdown',async e=>{e.preventDefault();SFX.back();setAuthBusy(logout,true,c.working);try{await window.MXCloud.signOutToGuest();openAccountModal(c.signedOut,true);}catch(err){openAccountModal(authErrorText(err),false);}},{passive:false});
  const del=$('#accDeleteAccount');if(del)del.addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();openModal('<h3>🗑 '+c.deleteAccountTitle+'</h3><div class="msub">'+c.deleteAccountWarn+'</div><div class="mrow"><button class="btn danger" id="accDeleteYes">'+c.deleteAccountConfirm+'</button><button class="btn" id="accDeleteNo">'+t('cancel')+'</button></div>');$('#modalBox').classList.add('accountModal');$('#accDeleteYes').addEventListener('pointerdown',async ev=>{ev.preventDefault();const btn=ev.currentTarget;setAuthBusy(btn,true,c.working);try{if(!window.MXCloud)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});await window.MXCloud.deleteAccountAndData();resetLocalAccountData();openAccountModal(c.deleteAccountDone,true);}catch(err){openAccountModal(authErrorText(err),false);}},{passive:false});$('#accDeleteNo').addEventListener('pointerdown',ev=>{ev.preventDefault();openAccountModal();},{passive:false});},{passive:false});
  bindTap('#accCloseTop',e=>{SFX.back();closeModal();});
  bindTap('#accClose',e=>{SFX.back();closeModal();});
}
function authFormShell(title,body){openModal('<h3>'+title+'</h3>'+body);$('#modalBox').classList.add('accountModal');}
function openEmailLogin(prefill){
  const c=accountCopy();
  const accountSwitchNote=LANG==='tr'?'Bu ekran kayıtlı e-posta hesabına geçer. E-posta ayrı bir Firebase hesabına aitse farklı oyuncu açılır. Mevcut oyuncuya e-posta eklemek için hesabına dönüp “E-posta ve şifre ekle” seçeneğini kullan.':'This screen switches to the saved email account. If that email belongs to a separate Firebase account, a different player will open. To add email to the current player, return to the account and choose “Add email & password”.';
  authFormShell('✉ '+c.emailLogin,'<label class="authField"><span>'+c.email+'</span><input class="authInput" id="authEmail" type="email" inputmode="email" autocomplete="email" value="'+escAttr(prefill||'')+'"></label><label class="authField"><span>'+c.password+'</span><input class="authInput" id="authPass" type="password" autocomplete="current-password"></label><div class="authMessage" id="authMsg"></div><div class="authTiny accountSwitchWarning">'+accountSwitchNote+'</div><div class="accountActions"><button class="btn blue" id="authLoginGo">'+c.login+'</button><button class="btn ghost" id="authForgot">'+c.reset+'</button><button class="btn" id="authBack">'+c.back+'</button></div>');
  $('#authLoginGo').addEventListener('pointerdown',async e=>{e.preventDefault();const btn=e.currentTarget,msg=$('#authMsg');const email=$('#authEmail').value,pass=$('#authPass').value;if(!email||!pass){msg.textContent=c.required;return;}setAuthBusy(btn,true,c.working);msg.textContent='';try{if(!window.MXCloud)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});const connected=await withAuthTimeout(window.MXCloud.signInEmail(email,pass),45000,'auth/email-timeout');await finishAccountLoginUI(connected,c);}catch(err){msg.textContent=authErrorText(err);setAuthBusy(btn,false);}},{passive:false});
  $('#authForgot').addEventListener('pointerdown',e=>{e.preventDefault();openPasswordReset($('#authEmail').value);},{passive:false});
  bindTap('#authBack',e=>{openAccountModal();});
  setTimeout(()=>$('#authEmail').focus(),80);
}
function openEmailCreate(){
  const c=accountCopy();const nm=(save.playerName||curProfile||accountState.displayName||'').slice(0,18);const linkingEmail=!accountState.isAnonymous;
  const formTitle=linkingEmail?c.linkEmail:c.emailCreate;
  const formAction=linkingEmail?(LANG==='tr'?'E-POSTAYI BAĞLA':'LINK EMAIL'):c.create;
  const keepPlayerNote=linkingEmail?(LANG==='tr'?'Bu işlem mevcut oyuncuyu ve bütün ilerlemeyi korur; yalnızca yeni bir giriş yöntemi ekler.':'This keeps the current player and all progress; it only adds another sign-in method.'):(LANG==='tr'?'Nickname yalnızca oyun içinde görünür. Hesaba e-posta ve şifreyle girilir.':'Nickname is only shown in the game. Sign in with email and password.');
  authFormShell('＋ '+formTitle,'<label class="authField"><span>'+c.nickname+'</span><input class="authInput" id="authName" maxlength="18" autocomplete="nickname" value="'+escAttr(nm)+'"></label><label class="authField"><span>'+c.email+'</span><input class="authInput" id="authEmail" type="email" inputmode="email" autocomplete="email"></label><label class="authField"><span>'+c.password+'</span><input class="authInput" id="authPass" type="password" autocomplete="new-password"></label><label class="authField"><span>'+c.passwordAgain+'</span><input class="authInput" id="authPass2" type="password" autocomplete="new-password"></label><div class="authMessage" id="authMsg"></div><div class="authTiny">'+keepPlayerNote+'</div><div class="accountActions"><button class="btn green" id="authCreateGo">'+formAction+'</button><button class="btn" id="authBack">'+c.back+'</button></div>');
  $('#authCreateGo').addEventListener('pointerdown',async e=>{e.preventDefault();const btn=e.currentTarget,msg=$('#authMsg');const name=$('#authName').value.trim(),email=$('#authEmail').value.trim(),p1=$('#authPass').value,p2=$('#authPass2').value;if(!name||!email||!p1||!p2){msg.textContent=c.required;return;}if(p1.length<6){msg.textContent=c.passShort;return;}if(p1!==p2){msg.textContent=c.passMismatch;return;}setAuthBusy(btn,true,c.working);msg.textContent='';try{if(!window.MXCloud)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});setCurrentProfileNickname(name);const connected=await withAuthTimeout(window.MXCloud.registerEmail(email,p1,name),45000,'auth/email-timeout');await finishAccountLoginUI(connected,c,c.connected+' '+c.verify);}catch(err){const code=String(err&&err.code||err&&err.message||'');const collision=linkingEmail&&['auth/email-already-in-use','auth/credential-already-in-use','auth/account-exists-with-different-credential'].includes(code);msg.textContent=collision?(LANG==='tr'?'Bu e-posta başka bir Moleculox hesabına bağlı. wHiTeWaY hesabın ve ilerlemen korunarak hiçbir hesap değiştirilmedi. Önce eski e-posta hesabını ayrı olarak doğrulayıp kontrollü taşıma yapmak gerekir.':'This email belongs to another Moleculox account. Your current player and progress were kept; no account was switched. The old email account must be verified separately before a controlled transfer.'):authErrorText(err);setAuthBusy(btn,false);}},{passive:false});
  bindTap('#authBack',e=>{openAccountModal();});
  setTimeout(()=>$('#authName').focus(),80);
}
function openPasswordReset(prefill){
  const c=accountCopy();
  authFormShell('🔑 '+c.reset,'<label class="authField"><span>'+c.email+'</span><input class="authInput" id="resetEmail" type="email" inputmode="email" autocomplete="email" value="'+escAttr(prefill||'')+'"></label><div class="authMessage" id="authMsg"></div><div class="accountActions"><button class="btn blue" id="resetGo">'+c.sendReset+'</button><button class="btn" id="authBack">'+c.back+'</button></div>');
  $('#resetGo').addEventListener('pointerdown',async e=>{e.preventDefault();const btn=e.currentTarget,msg=$('#authMsg'),email=$('#resetEmail').value.trim();if(!email){msg.textContent=c.required;return;}setAuthBusy(btn,true,c.working);try{if(!window.MXCloud)throw Object.assign(new Error('auth/unavailable'),{code:'auth/unavailable'});await window.MXCloud.resetPassword(email,LANG);msg.className='authMessage ok';msg.textContent=c.resetSent;setAuthBusy(btn,false);}catch(err){msg.textContent=authErrorText(err);setAuthBusy(btn,false);}},{passive:false});
  bindTap('#authBack',e=>{openAccountModal();});
}
function bindAccountAuth(){
  if(accountAuthBound||!window.MXCloud||!window.MXCloud.subscribeAuth)return false;
  accountAuthBound=true;
  window.MXCloud.subscribeAuth(state=>{
    const wasGuest=accountState.isAnonymous;setAccountState(state);
    if(!state.isAnonymous&&curProfile){
      // Always reconcile after account restoration, not only on the first
      // guest→member transition. Embedded hosts can restore auth before this
      // listener binds, which previously skipped profile import on itch.io.
      reconcileAccountProfiles().then(ok=>{
        if(ok)scheduleLeaderboardRepair(wasGuest?'account-connected':'auth-restored',250,true);
      });
    }
  });
  return true;
}
(function waitForAccountAuth(){if(!bindAccountAuth())setTimeout(waitForAccountAuth,120);})();

function freshMenuTrack(){
  const ni=MENU_TRACK_INDEX;
  const changed=MP.mode!=='menu'||MP.idx!==ni;
  MP.mode='menu';MP.idx=ni;musicAudio.loop=true;
  if(!MP.started||!bootDone)return;
  playTrack(ni,changed);
}
function musicListModal(){
  const rows=TRACKS.map((_,i)=>{
    const playing=(MP.idx===i&&!musicAudio.paused&&MP.mode==='menu');
    return '<div class="mtrow'+(playing?' playing':'')+'" data-row="'+i+'"><button class="mtplay'+(playing?' playing':'')+'" data-idx="'+i+'" aria-pressed="'+(playing?'true':'false')+'" aria-label="'+esc(trackName(i))+'"><span class="mticon">'+(playing?'❚❚':'▶')+'</span></button><span class="mtname">'+esc(trackName(i))+'</span><span class="mtno">'+String(i+1).padStart(2,'0')+'</span></div>';
  }).join('');
  openModal('<h3>'+t('musicListTitle')+'</h3><div class="mtlist">'+rows+'</div><button class="btn mtclose" id="mtClose">'+t('close')+'</button>');
  $('#modalBox').classList.add('musicModal');
  document.querySelectorAll('.mtplay').forEach(btn=>{
    btn.addEventListener('pointerdown',e=>{
      e.preventDefault();
      const i=+btn.dataset.idx;
      ac();
      const alreadyPlayingThis=(MP.idx===i&&!musicAudio.paused&&MP.mode==='menu');
      if(alreadyPlayingThis){
        musicAudio.pause();
      }else{
        MP.mode='menu';musicAudio.loop=true;
        playTrack(i,true);
      }
      document.querySelectorAll('.mtplay').forEach(b=>{
        const active=!alreadyPlayingThis&&+b.dataset.idx===i;
        const icon=b.querySelector('.mticon');if(icon)icon.textContent=active?'❚❚':'▶';
        b.classList.toggle('playing',active);
        b.setAttribute('aria-pressed',active?'true':'false');
        const row=b.closest('.mtrow');if(row)row.classList.toggle('playing',active);
      });
    },{passive:false});
  });
  bindTap('#mtClose',e=>{SFX.click();settingsModal();});
}
function motionReduced(){return !!save.reduceMotion||!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
function effectsAllowed(){return !motionReduced()&&save.effectLevel!=='low'&&!document.body.classList.contains('mxPerfLow');}
function performanceLow(){return save.performanceMode==='low'||document.body.classList.contains('mxPerfLow');}
function effectiveDpr(){const raw=window.devicePixelRatio||1;if(save.performanceMode==='low')return Math.min(raw,1.5);if(save.performanceMode==='high')return Math.min(raw,2.5);const mobile=Math.min(innerWidth||9999,innerHeight||9999)<760;return Math.min(raw,mobile?2:2.25);}
function mxHaptic(kind='light'){
  if(save.haptics===false||motionReduced()||!navigator.vibrate)return;
  const pattern=kind==='success'?[18,28,24]:(kind==='error'?[22,20,12]:(kind==='heavy'?[26,18,34]:(kind==='medium'?[14]:[7])));
  try{navigator.vibrate(pattern);}catch(e){}
}
function applyMotionPrefs(){
  document.body.classList.toggle('mxReduceMotion',motionReduced());
  document.body.classList.toggle('mxLowEffects',save.effectLevel==='low');
  document.body.classList.toggle('mxHighEffects',save.effectLevel==='high');
  document.body.classList.toggle('mxPerfLow',save.performanceMode==='low');
  document.body.classList.toggle('mxPerfHigh',save.performanceMode==='high');
  document.body.classList.toggle('mxDuelEffectsOff',save.duelEffects===false);
  document.body.classList.toggle('mxLargeText',!!save.largeText);
  document.body.classList.toggle('mxColorBlind',!!save.colorBlind);
  document.body.classList.toggle('mxHighContrast',!!save.highContrast);
}

// Added 2026-07-26: the actual pre-level briefing modal. Shares its row
// content with mechanicsGuideModal() below via MECHANIC_INFO so the two
// never drift out of sync with each other.


function trainingLearnKey(group,id){return '__training_learned_'+group+'_'+id;}
function trainingLearned(group,id){ensureResearchState(save);return !!save.researchAchievements[trainingLearnKey(group,id)];}
function markTrainingLearned(group,id,label,silent){
  ensureResearchState(save);
  const key=trainingLearnKey(group,id),fresh=!save.researchAchievements[key];
  save.researchAchievements[key]=1;persist();
  if(fresh&&!silent){
    SFX.star(1);mxHaptic('success');
    prop('🎓 '+(LANG==='tr'?'Öğrenildi: ':'Learned: ')+(label||id),2400);
  }
  if(fresh)setTimeout(()=>checkAchievements(),320);
  return fresh;
}
function trainingMechanicCatalog(){
  const tr=LANG==='tr';
  return [
    ['frozen','seenFrozen',tr?'Donmuş atom':'Frozen atom'],['fire','seenFire',tr?'Ateş atomu':'Fire atom'],['lightning','seenLightning',tr?'Şimşek atomu':'Lightning atom'],
    ['sticky','seenSticky',tr?'Yapışkan atom':'Sticky atom'],['zombie','seenZombie',tr?'Zombi atom':'Zombie atom'],['oneWay','seenOneWay',tr?'Tek yönlü zemin':'One-way floor'],
    ['hammer','seenBreakableWall',tr?'Kırılabilir duvar':'Breakable wall'],['portal','seenPortal',tr?'Portal':'Portal'],['movingWall','seenMovingWall',tr?'Hareketli duvar':'Moving wall'],
    ['pressureDoor','seenPressureDoor',tr?'Düğme ve kapı':'Button and door'],['fragile','seenFragile',tr?'Kırılgan atom':'Fragile atom'],['linked','seenLinked',tr?'Bağlı atomlar':'Linked atoms'],
    ['precision','seenPrecision',tr?'Tek Kare Hareket':'One-Square Move'],['classicCatalyst','seenClassicCatalystTutorialV2',tr?'Katalizör görevi':'Catalyst mission'],
    ['classicChain','seenClassicChainTutorialV2',tr?'Zincir reaksiyonu':'Chain reaction'],['classicReactor','seenClassicReactorTutorialV2',tr?'Reaktör lazerleri':'Reactor lasers']
  ];
}
function trainingProgress(){
  const supports=['hint','undo','restart','hammer','precision','barrier','lab'];
  const supportSeen={hint:'seenHintSupport',undo:'seenUndoSupport',restart:'seenRestartSupport',hammer:'seenHammerSupport',precision:'seenPrecisionSupport',barrier:'seenBarrierSupport',lab:'seenLabSupport'};
  const mechanics=trainingMechanicCatalog().filter(x=>!!save[x[1]]);
  const labs=LAB_ITEMS.filter(it=>save.cur>=it.unlock);
  let total=1+supports.length+mechanics.length+labs.length,done=0;
  if(trainingLearned('basic','movement')||save.tutorialDone)done++;
  supports.forEach(id=>{if(trainingLearned('support',id)||save[supportSeen[id]])done++;});
  mechanics.forEach(x=>{if(trainingLearned('mechanic',x[0]))done++;});
  labs.forEach(it=>{if(trainingLearned('lab',it.id)||labTutorialSeen(it.id))done++;});
  return {total,done,pct:total?Math.round(done*100/total):0};
}
const SUPPORT_INFO={
  hint:{icon:'💡',title:['İpucu','Hint','Hinweis','Pista','Dica','ヒント'],desc:['Tek dokunuşla ipucu menüsü açılır. Ücretsiz genel tavsiye, sonraki kesin hamle veya kalan çözüm arasından seçim yaparsın.','One tap opens the hint menu. Choose a free general clue, the next exact move, or the remaining solution.','Ein Tippen öffnet das Hinweismenü. Wähle einen kostenlosen allgemeinen Tipp, den nächsten exakten Zug oder die restliche Lösung.','Un toque abre el menú de pistas. Elige una orientación general gratis, el siguiente movimiento exacto o la solución restante.','Um toque abre o menu de dicas. Escolha uma orientação geral grátis, o próximo movimento exato ou a solução restante.','1回タップするとヒントメニューが開きます。無料の一般ヒント、次の正確な手、残りの解答から選べます。']},
  undo:{icon:'↩️',title:['Geri Al','Undo','Rückgängig','Deshacer','Desfazer','元に戻す'],desc:['Son normal hamleyi geri çevirir. Kullanılmış Çekiç, Tek Kare Hareket ve Nano Bariyer envantere geri dönmez.','Reverses the last normal move. Used Hammer, One-Square Move, and Nano Barrier items are not restored.','Macht den letzten normalen Zug rückgängig. Benutzter Hammer, Ein-Feld-Zug und Nano-Barriere werden nicht zurückgegeben.','Revierte el último movimiento normal. Martillo, Movimiento de una casilla y Barrera nano usados no se devuelven.','Desfaz o último movimento normal. Martelo, Movimento de uma casa e Barreira nano usados não são devolvidos.','直前の通常手を戻します。使用済みのハンマー、1マス移動、ナノバリアは戻りません。']},
  restart:{icon:'🔄',title:['Yeniden Başlat','Restart','Neu starten','Reiniciar','Reiniciar','やり直す'],desc:['Bölümü başlangıç düzenine döndürür. Harcanan destekler geri verilmez.','Returns the level to its starting layout. Consumed support items are not restored.','Setzt das Level auf die Startanordnung zurück. Verbrauchte Hilfen werden nicht erstattet.','Devuelve el nivel a su disposición inicial. Las ayudas gastadas no se recuperan.','Retorna a fase à configuração inicial. Os suportes gastos não são devolvidos.','レベルを開始時の配置に戻します。消費したサポートは戻りません。']},
  hammer:{icon:'🔨',title:['Çekiç','Hammer','Hammer','Martillo','Martelo','ハンマー'],desc:['Çekici seç, ardından çatlak duvara dokun. Eğitim örneği ücretsizdir; gerçek kullanımda 1 çekiç harcanır.','Select the hammer, then tap a cracked wall. The training example is free; real use consumes 1 hammer.','Wähle den Hammer und tippe dann auf eine rissige Wand. Das Trainingsbeispiel ist kostenlos; im echten Level wird 1 Hammer verbraucht.','Selecciona el martillo y toca una pared agrietada. El ejemplo de práctica es gratis; el uso real consume 1 martillo.','Selecione o martelo e toque em uma parede rachada. O exemplo de treino é grátis; o uso real consome 1 martelo.','ハンマーを選び、ひび割れた壁をタップします。練習は無料ですが、実際の使用ではハンマーを1個消費します。']},
  precision:{icon:'↔️',title:['Tek Kare Hareket','One-Square Move','Ein-Feld-Zug','Movimiento de una casilla','Movimento de uma casa','1マス移動'],desc:['Aracı seç, atomu seç ve yön ver. Atom yalnızca 1 kare ilerler. Eğitim örneği ücretsizdir.','Select the tool, choose an atom and a direction. The atom moves exactly one square. The training example is free.','Wähle das Werkzeug, ein Atom und eine Richtung. Das Atom bewegt sich genau ein Feld. Das Trainingsbeispiel ist kostenlos.','Selecciona la herramienta, un átomo y una dirección. El átomo avanza exactamente una casilla. El ejemplo es gratis.','Selecione a ferramenta, um átomo e uma direção. O átomo avança exatamente uma casa. O exemplo é grátis.','ツール、原子、方向を選ぶと、原子がちょうど1マス移動します。練習は無料です。']},
  barrier:{icon:'🧱',title:['Nano Bariyer','Nano Barrier','Nano-Barriere','Barrera nano','Barreira nano','ナノバリア'],desc:['Aracı seçip boş ve normal bir kareye dokun. Geçici blok ilk atom çarpışmasında kırılır ve bölüm başına yalnızca bir kez kullanılabilir.','Select the tool and tap an empty normal tile. The temporary block breaks on the first atom collision and can be used only once per level.','Wähle das Werkzeug und tippe auf ein leeres normales Feld. Der temporäre Block zerbricht beim ersten Atomaufprall und kann nur einmal pro Level benutzt werden.','Selecciona la herramienta y toca una casilla normal vacía. El bloque temporal se rompe con el primer choque de un átomo y solo puede usarse una vez por nivel.','Selecione a ferramenta e toque em uma casa normal vazia. O bloco temporário quebra na primeira colisão de um átomo e só pode ser usado uma vez por fase.','ツールを選び、空いている通常マスをタップします。一時ブロックは最初の原子衝突で壊れ、1レベルにつき1回だけ使えます。']},
  lab:{icon:'🧪',title:['Laboratuvar ve Destekler','Laboratory and Supports','Labor und Hilfen','Laboratorio y ayudas','Laboratório e suportes','ラボとサポート'],desc:['Çekiç, Tek Kare Hareket ve Nano Bariyer burada alınır. Kalıcı cihazlar ipucu fiyatını düşürür veya ödülleri artırır. Satın almadan önce kartın etkisini kontrol et.','Hammer, One-Square Move, and Nano Barrier are bought here. Permanent equipment reduces hint costs or increases rewards. Check each card before buying.','Hammer, Ein-Feld-Zug und Nano-Barriere werden hier gekauft. Dauerhafte Geräte senken Hinweiskosten oder erhöhen Belohnungen. Prüfe vor dem Kauf jede Karte.','Aquí se compran Martillo, Movimiento de una casilla y Barrera nano. Los equipos permanentes reducen el coste de pistas o aumentan recompensas. Revisa cada tarjeta antes de comprar.','Martelo, Movimento de uma casa e Barreira nano são comprados aqui. Equipamentos permanentes reduzem o custo de dicas ou aumentam recompensas. Confira cada cartão antes de comprar.','ハンマー、1マス移動、ナノバリアを購入できます。常設装置はヒント費用を下げたり報酬を増やしたりします。購入前に効果を確認してください。']}
};
function supportInfoText(id){const x=SUPPORT_INFO[id];return x?{icon:x.icon,title:ml(...x.title),desc:ml(...x.desc)}:null;}
function drETrainingCard(text,step){
  return '<div id="drETrainingCard" style="display:flex;gap:10px;align-items:center;margin:10px 0 14px;padding:11px 12px;border-radius:16px;background:linear-gradient(135deg,rgba(120,231,255,.13),rgba(255,211,110,.09));border:1px solid rgba(120,231,255,.34);box-shadow:0 0 0 0 rgba(120,231,255,.28);animation:mxDrEGuidePulse 1.8s ease-in-out infinite"><div style="width:42px;height:42px;flex:0 0 42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(5,18,35,.8);border:2px solid rgba(255,211,110,.65);font-size:1.35rem">🧑‍🔬</div><div style="min-width:0;flex:1"><b style="display:block;color:#ffd36e;font-size:.78rem;letter-spacing:.08em">DR. E · '+(step||'1/2')+'</b><span id="drETrainingText" style="display:block;margin-top:3px;line-height:1.35">'+text+'</span></div><div id="drETrainingArrow" style="font-size:1.25rem;animation:mxDrEArrow .8s ease-in-out infinite alternate">👇</div></div>';
}
function setDrETraining(text,step,arrow){
  const c=$('#drETrainingCard'),t=$('#drETrainingText'),a=$('#drETrainingArrow');
  if(t)t.textContent=text;if(c){const b=c.querySelector('b');if(b)b.textContent='DR. E · '+(step||'2/2');}
  if(a)a.textContent=arrow||'👉';
}
(function addDrETrainingStyles(){
  if(document.getElementById('mxDrETrainingStyles'))return;
  const st=document.createElement('style');st.id='mxDrETrainingStyles';st.textContent='@keyframes mxDrEGuidePulse{0%,100%{box-shadow:0 0 0 0 rgba(120,231,255,.22)}50%{box-shadow:0 0 22px 2px rgba(120,231,255,.22)}}@keyframes mxDrEArrow{from{transform:translateY(-2px) scale(.95)}to{transform:translateY(3px) scale(1.08)}}.mxGuidedTarget{outline:3px solid rgba(255,211,110,.95)!important;box-shadow:0 0 20px rgba(255,211,110,.55)!important;transform:scale(1.02)}';document.head.appendChild(st);
})();
function showSupportTutorial(id,onDone){
  const x=supportInfoText(id);if(!x){if(onDone)onDone();return;}
  const demos={
    hint:['💡','→','✨⚛️','↔️'],undo:['❌','→','↩️','→','✅'],restart:['🌀','→','🔄','→','1️⃣'],hammer:['🔨','→','🧱','→','✅'],precision:['↔️','→','⚛️','→','1 □'],barrier:['🧱','→','□','→','💥'],lab:['🪙','→','🧪','→','🧰']
  };
  const cells=(demos[id]||['⚛️','→','✅']).map(v=>'<span style="min-width:44px;height:42px;padding:0 8px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.14);font-weight:900">'+v+'</span>').join('');
  const guide1=ml('Aşağıdaki parlayan düğmeye dokun. Bu kısa örnek envanterinden hiçbir şey harcamaz.','Tap the glowing button below. This short example consumes nothing from your inventory.','Tippe auf die leuchtende Schaltfläche. Dieses kurze Beispiel verbraucht nichts aus deinem Inventar.','Toca el botón brillante. Este ejemplo breve no consume nada de tu inventario.','Toque no botão brilhante. Este exemplo curto não consome nada do seu inventário.','下の光るボタンをタップしてください。この短い例では所持品を消費しません。');
  const heading=ml('OYUNCU DESTEĞİ','PLAYER SUPPORT','SPIELERHILFE','AYUDA DEL JUGADOR','SUPORTE DO JOGADOR','プレイヤーサポート');
  const run=ml('ÜCRETSİZ ÖRNEĞİ ÇALIŞTIR','RUN FREE EXAMPLE','KOSTENLOSES BEISPIEL STARTEN','EJECUTAR EJEMPLO GRATIS','EXECUTAR EXEMPLO GRÁTIS','無料の例を実行');
  openModal('<div class="modalScroll supportTutorialScroll"><div style="font-size:.72rem;font-weight:900;letter-spacing:.12em;color:#78e7ff;margin-bottom:5px">'+heading+'</div><h3>'+x.icon+' '+x.title+'</h3><div class="msub">'+x.desc+'</div>'+drETrainingCard(guide1,'1/2')+'<div style="margin:15px 0;padding:14px 8px;border-radius:18px;background:linear-gradient(145deg,rgba(20,49,76,.9),rgba(34,20,63,.92));border:1px solid rgba(120,231,255,.28);display:flex;gap:7px;align-items:center;justify-content:center;flex-wrap:wrap">'+cells+'</div><div class="mrow"><button class="btn green mxGuidedTarget" id="mSupportTry">▶ '+run+'</button></div></div><div class="mrow modalFixedClose"><button class="btn" id="mSupportClose">'+t('close')+'</button></div>');
  bindTap('#mSupportClose',()=>{SFX.click();closeModal();});
  bindTap('#mSupportTry',()=>{
    SFX.select();mxHaptic('success');
    setDrETraining(ml('Harika! Etkiyi gördün. Gerçek bölümde normal envanter kuralı uygulanır.','Great! You saw the effect. Normal inventory rules apply in a real level.','Sehr gut! Du hast den Effekt gesehen. Im echten Level gelten die normalen Inventarregeln.','¡Muy bien! Ya viste el efecto. En un nivel real se aplican las reglas normales del inventario.','Muito bem! Você viu o efeito. Em uma fase real valem as regras normais do inventário.','効果を確認できました。実際のレベルでは通常の所持品ルールが適用されます。'),'2/2','✅');
    markTrainingLearned('support',id,x.title,true);
    const b=$('#mSupportTry');if(b){b.classList.remove('mxGuidedTarget');b.disabled=true;b.textContent='✓ '+ml('ÖĞRENİLDİ','LEARNED','GELERNT','APRENDIDO','APRENDIDO','習得済み');}
    setTimeout(()=>{closeModal();prop('🎓 '+ml('Öğrenildi: ','Learned: ','Gelernt: ','Aprendido: ','Aprendido: ','習得：')+x.title,1800);if(onDone)onDone();},800);
  });
}
function showAllSupportGuide(){
  const ids=['hint','undo','restart','hammer','precision','barrier','lab'];let page=0;
  const next=()=>{if(page>=ids.length){save.seenSupportGuide=true;persist();closeModal();return;}showSupportTutorial(ids[page++],next);};next();
}

const MECHANIC_FIRST_USE_POSE=Object.freeze({
  frozen:'magnifier',fire:'experiment',lightning:'surprised',sticky:'magnifier',zombie:'surprised',oneWay:'clipboard',hammer:'experiment',portal:'surprised',movingWall:'thinking',pressureDoor:'clipboard',fragile:'magnifier',linked:'molecule',precision:'clipboard',classicCatalyst:'experiment',classicChain:'experiment',classicReactor:'surprised'
});
function showMechanicFirstUse(ids,opts){
  ids=[...new Set((ids||[]).filter(id=>MECHANIC_INFO[id]))];
  if(!ids.length)return;
  const pose=MECHANIC_FIRST_USE_POSE[ids[0]]||'clipboard',src=DR_E_POSES[pose]||DR_E_POSES.clipboard;
  setDrEPose(pose,9000,6,true);
  const rows=ids.map(id=>{const info=MECHANIC_INFO[id];return '<div class="mxFirstUseRow"><span class="mxFirstUseIcon">'+info.icon+'</span><div><b>'+t(info.titleKey)+'</b><small>'+t(info.descKey)+'</small></div></div>';}).join('');
  const title=ml('Yeni kural · kısa bilgi','New rule · quick guide','Neue Regel · Kurzhilfe','Nueva regla · guía rápida','Nova regra · guia rápido','新ルール・クイックガイド');
  const sub=ml('Sadece ilk karşılaşmada gösterilir. Uzun eğitim zorunlu değildir.','Shown only on first encounter. The long lesson is optional.','Wird nur beim ersten Auftreten gezeigt. Die lange Lektion ist optional.','Solo aparece la primera vez. La lección larga es opcional.','Aparece apenas no primeiro encontro. A lição longa é opcional.','最初の遭遇時にだけ表示されます。詳しい練習は任意です。');
  const detail=ml('DETAYLI EĞİTİM','DETAILED TRAINING','DETAILTRAINING','ENTRENAMIENTO DETALLADO','TREINO DETALHADO','詳しい練習');
  const go=ml('ANLADIM · DEVAM ▶','GOT IT · CONTINUE ▶','VERSTANDEN · WEITER ▶','ENTENDIDO · CONTINUAR ▶','ENTENDI · CONTINUAR ▶','理解した・続ける ▶');
  openModal('<div class="mxFirstUseHead"><img src="'+src+'" alt="Dr. E"><div><span>DR. E</span><h3>'+title+'</h3><p>'+sub+'</p></div></div><div class="mxFirstUseList">'+rows+'</div><div class="mrow"><button class="btn ghost" id="mMechanicDetails">🔬 '+detail+'</button><button class="btn green mxGuidedTarget" id="mMechanicQuickGo">'+go+'</button></div>');
  bindTap('#mMechanicDetails',()=>{SFX.select();showMechanicBriefing(ids,opts);});
  bindTap('#mMechanicQuickGo',()=>{
    ids.forEach(id=>{const info=MECHANIC_INFO[id];markMechanicTutorialSeen(id);markTrainingLearned('mechanic',id,t(info.titleKey),true);});
    SFX.play();mxHaptic('light');closeModal();
    const frame=$('#boardFrame');if(frame){frame.classList.add('mxTutorialBoardPulse');setTimeout(()=>frame.classList.remove('mxTutorialBoardPulse'),3600);}
    prop('✓ '+ml('Kural hazır','Rule ready','Regel bereit','Regla lista','Regra pronta','ルール確認完了'),1200);
  });
}

const MECHANIC_INFO={
  frozen:{icon:'❄️',titleKey:'frozenTitle',descKey:'frozenDesc'},
  fire:{icon:'🔥',titleKey:'fireTitle',descKey:'fireDesc'},
  lightning:{icon:'⚡',titleKey:'lightningTitle',descKey:'lightningDesc'},
  sticky:{icon:'🧲',titleKey:'stickyTitle',descKey:'stickyDesc'},
  zombie:{icon:'🧟‍♂️',titleKey:'zombieTitle',descKey:'zombieDesc'},
  oneWay:{icon:'↪️',titleKey:'oneWayTitle',descKey:'oneWayDesc'},
  hammer:{icon:'🧱',titleKey:'hammerTitle',descKey:'hammerDesc'},
  portal:{icon:'🌀',titleKey:'portalTitle',descKey:'portalDesc'},
  movingWall:{icon:'🚧',titleKey:'movingWallTitle',descKey:'movingWallDesc'},
  pressureDoor:{icon:'🔘',titleKey:'pressureDoorTitle',descKey:'pressureDoorDesc'},
  fragile:{icon:'💎',titleKey:'fragileTitle',descKey:'fragileDesc'},
  linked:{icon:'🔗',titleKey:'linkedTitle',descKey:'linkedDesc'},
  precision:{icon:'🎯',titleKey:'precisionTitle',descKey:'precisionDesc'},
  classicCatalyst:{icon:'🧪',titleKey:'classicCatalystTitle',descKey:'classicCatalystDesc'},
  classicChain:{icon:'⚡',titleKey:'classicChainTitle',descKey:'classicChainDesc'},
  classicReactor:{icon:'☢️',titleKey:'classicReactorTitle',descKey:'classicReactorDesc'}
};

function currentLevelMechanicIds(){
  if(!LV||lv<0||!scr.game||!scr.game.classList.contains('on'))return [];
  const ids=[];
  if(atoms.some(a=>a.frozen))ids.push('frozen');
  if(atoms.some(a=>a.fire))ids.push('fire');
  if(atoms.some(a=>a.lightning))ids.push('lightning');
  if(atoms.some(a=>a.sticky))ids.push('sticky');
  if(atoms.some(a=>a.zombie))ids.push('zombie');
  if(oneWayTiles&&oneWayTiles.size)ids.push('oneWay');
  if(breakableWalls&&[...breakableWalls.values()].some(w=>!w.broken))ids.push('hammer');
  if(portalPairs&&portalPairs.size)ids.push('portal');
  if(movingWalls&&movingWalls.length)ids.push('movingWall');
  if(pressureSystems&&pressureSystems.length)ids.push('pressureDoor');
  if(atoms.some(a=>a.fragile))ids.push('fragile');
  if(linkedPairs&&linkedPairs.length)ids.push('linked');
  if(typeof crystalActive==='function'&&crystalActive())ids.push('classicCatalyst');
  if(typeof chainActive==='function'&&chainActive())ids.push('classicChain');
  if(typeof reactorActive==='function'&&reactorActive())ids.push('classicReactor');
  return [...new Set(ids)];
}
function mechanicVisualCue(id){
  const cues={
    frozen:()=>ml('Görünüş: atomun üzerinde ❄️ buz işareti.','Look: ❄️ ice symbol on the atom.','Aussehen: ❄️-Symbol auf dem Atom.','Aspecto: símbolo ❄️ sobre el átomo.','Visual: símbolo ❄️ no átomo.','見た目：原子上の❄️印。'),
    fire:()=>ml('Görünüş: atomun üzerinde 🔥 alev.','Look: 🔥 flame on the atom.','Aussehen: 🔥 auf dem Atom.','Aspecto: 🔥 sobre el átomo.','Visual: 🔥 no átomo.','見た目：原子上の🔥。'),
    lightning:()=>ml('Görünüş: atomun üzerinde ⚡ yük simgesi.','Look: ⚡ charge symbol on the atom.','Aussehen: ⚡-Ladungssymbol.','Aspecto: símbolo ⚡ de carga.','Visual: símbolo ⚡ de carga.','見た目：原子上の⚡印。'),
    sticky:()=>ml('Görünüş: atomun çevresinde yapışkan/mıknatıs işareti.','Look: sticky/magnet mark around the atom.','Aussehen: Klebe-/Magnetzeichen am Atom.','Aspecto: marca adhesiva/imán.','Visual: marca adesiva/ímã.','見た目：粘着／磁石の印。'),
    zombie:()=>ml('Görünüş: atomun üzerinde zombi işareti.','Look: zombie mark on the atom.','Aussehen: Zombiezeichen am Atom.','Aspecto: marca de zombi.','Visual: marca de zumbi.','見た目：ゾンビ印。'),
    oneWay:()=>ml('Görünüş: zemindeki büyük ok; yalnız ok yönünde geçilir.','Look: large floor arrow; pass only with it.','Aussehen: großer Bodenpfeil; nur in Pfeilrichtung.','Aspecto: flecha grande en el suelo.','Visual: seta grande no chão.','見た目：床の大きな矢印。'),
    hammer:()=>ml('Görünüş: çatlak duvarın köşesinde küçük 🔨 işareti.','Look: cracked wall with a small 🔨 mark.','Aussehen: rissige Wand mit kleinem 🔨.','Aspecto: pared agrietada con 🔨.','Visual: parede rachada com 🔨.','見た目：ひび割れ壁と小さな🔨。'),
    portal:()=>ml('Görünüş: dönen A ve B portalları birbirinin eşidir.','Look: spinning A and B portals are paired.','Aussehen: drehende Portale A und B gehören zusammen.','Aspecto: los portales A y B están emparejados.','Visual: portais A e B são um par.','見た目：回転するA/Bポータル。'),
    movingWall:()=>ml('Görünüş: üzerinde ↔ bulunan çizgili duvar.','Look: striped wall marked ↔.','Aussehen: gestreifte Wand mit ↔.','Aspecto: pared rayada con ↔.','Visual: parede listrada com ↔.','見た目：↔印の縞壁。'),
    pressureDoor:()=>ml('Görünüş: aynı harfli yuvarlak düğme + çizgili kapı. Çizgili/şeffafsa açıktır.','Look: round switch + striped door with the same letter. Striped/transparent means open.','Aussehen: runder Schalter und gestreifte Tür mit gleichem Buchstaben. Transparent = offen.','Aspecto: interruptor redondo y puerta rayada con la misma letra. Transparente = abierta.','Visual: botão redondo e porta listrada com a mesma letra. Transparente = aberta.','見た目：同じ文字の丸スイッチと縞扉。透明なら開いています。'),
    fragile:()=>ml('Görünüş: elmas çerçeve ve kalan darbe sayısı.','Look: diamond outline plus remaining-impact number.','Aussehen: Diamantrahmen plus Resttrefferzahl.','Aspecto: marco de diamante y número restante.','Visual: moldura de diamante e número restante.','見た目：ダイヤ枠と残り回数。'),
    linked:()=>ml('Görünüş: iki atom arasında hareketli noktalı bağ.','Look: animated dotted link between two atoms.','Aussehen: bewegte gestrichelte Verbindung.','Aspecto: línea de puntos animada.','Visual: linha pontilhada animada.','見た目：2原子間の動く点線。'),
    classicCatalyst:()=>ml('Görünüş: üç farklı laboratuvar simgesi ve üstte üç sayaç.','Look: three lab symbols and three counters at the top.','Aussehen: drei Laborsymbole und drei Zähler oben.','Aspecto: tres símbolos y tres contadores arriba.','Visual: três símbolos e três contadores no topo.','見た目：3つのラボ記号と上部カウンター。'),
    classicChain:()=>ml('Görünüş: parlayan doğru hamle ve COMBO sayacı.','Look: glowing correct move and COMBO counter.','Aussehen: leuchtender richtiger Zug und COMBO-Zähler.','Aspecto: movimiento brillante y contador COMBO.','Visual: jogada brilhante e contador COMBO.','見た目：光る正解手とCOMBO表示。'),
    classicReactor:()=>ml('Görünüş: yanıp sönen lazer ve Darbe/Impact sayacı.','Look: pulsing laser and Impact counter.','Aussehen: pulsierender Laser und Trefferzähler.','Aspecto: láser pulsante y contador de impactos.','Visual: laser pulsante e contador de impactos.','見た目：点滅レーザーと衝突カウンター。')
  };
  return cues[id]?cues[id]():'';
}
function currentLevelMechanicsGuideHtml(){
  const ids=currentLevelMechanicIds();if(!ids.length)return '';
  const cards=ids.map(id=>{const info=MECHANIC_INFO[id];if(!info)return '';const cue=mechanicVisualCue(id);return '<article class="currentMechanicCard"><b>'+info.icon+' '+t(info.titleKey)+'</b><span>'+t(info.descKey)+'</span>'+(cue?'<em>'+cue+'</em>':'')+'</article>';}).join('');
  return '<section class="guideSection currentLevelMechanics"><h4>🧭 '+ml('BU BÖLÜMDEKİ ÖZEL İŞARETLER','SPECIAL SYMBOLS IN THIS LEVEL','SONDERZEICHEN IN DIESEM LEVEL','SÍMBOLOS ESPECIALES DE ESTE NIVEL','SÍMBOLOS ESPECIAIS DESTA FASE','このレベルの特別な記号')+'</h4><p>'+ml('Tahtada anlamı belirsiz bir şekil görürsen burada yalnızca bu bölümde kullanılan kuralları bulursun.','If a board symbol is unclear, this section lists only the rules used in the current level.','Wenn ein Symbol unklar ist, stehen hier nur die Regeln des aktuellen Levels.','Si un símbolo no está claro, aquí aparecen solo las reglas del nivel actual.','Se um símbolo não estiver claro, aqui aparecem só as regras da fase atual.','記号が分からない時、このレベルで使うルールだけを確認できます。')+'</p><div class="currentMechanicGrid">'+cards+'</div></section>';
}

function mechanicTutorialDemo(id){
  const tr=LANG==='tr';
  const demos={
    frozen:{cells:['H','→','❄️ H'],action:tr?'DİĞER ATOMU KAYDIR':'SLIDE THE OTHER ATOM',result:tr?'Donmuş atom yerinde kalır; molekül onun çevresinde kurulur.':'The frozen atom stays put; build the molecule around it.'},
    fire:{cells:['🔥 H','→','❄️ H'],action:tr?'ATEŞİ BUZA YAKLAŞTIR':'MOVE FIRE TO THE ICE',result:tr?'Ateş temas edince buz erir ve atom serbest kalır.':'Contact with fire melts the ice and frees the atom.'},
    lightning:{cells:['⚡ atom','→','H—❄️ H'],action:tr?'ZİNCİRE TEMAS ET':'TOUCH THE CHAIN',result:tr?'⚡ işareti elektrik yükünü gösterir. Enerji bağlı grup boyunca ilerleyip buzu çözer.':'The ⚡ symbol marks electric charge. Energy travels through the connected group and thaws the ice.'},
    sticky:{cells:['H','→','🧲 H'],action:tr?'TEMASI DENE':'TRY THE CONTACT',result:tr?'Temas eden atom o noktada yapışır; geri ayrılamaz.':'The touching atom sticks at that point and cannot separate.'},
    zombie:{cells:['H','→','🧟 H'],action:tr?'TEMASI DENE':'TRY THE CONTACT',result:tr?'Temas bulaştırır. Ateş atomu enfeksiyonu temizler.':'Contact spreads infection. A fire atom cures it.'},
    oneWay:{cells:['H','→','↪️','→'],action:tr?'OK YÖNÜNDE GEÇ':'FOLLOW THE ARROW',result:tr?'Ok yönünde geçebilirsin; ters yönden geri dönemezsin.':'You may pass with the arrow, but cannot return against it.'},
    hammer:{cells:['H','🧱','H'],action:tr?'ÇEKİCİ KULLAN':'USE THE HAMMER',result:tr?'Alt araç çubuğundaki çekici seç, sonra çatlak duvara dokun.':'Select the hammer in the bottom toolbar, then tap the cracked wall.'},
    portal:{cells:['H','→','🌀 A','…','🌀 B'],action:tr?'PORTALA GİR':'ENTER THE PORTAL',result:tr?'Atom A portalından girip eşleşen B portalından çıkar.':'The atom enters portal A and exits its linked portal B.'},
    movingWall:{cells:['H','→','🚧','⇄'],action:tr?'BİR HAMLE YAP':'MAKE A MOVE',result:tr?'Duvar her hamlede desenindeki sonraki konuma geçer.':'The wall advances to its next patterned position after a move.'},
    pressureDoor:{cells:['H','→','🔘 A','⇢','▥ A'],action:tr?'DÜĞMEYE BAS':'PRESS THE BUTTON',result:tr?'Aynı harfli çizgili kutu açık kapıdır. Atom A düğmesinden ayrılınca yeniden katı duvar olur.':'The striped square with the same letter is the open door. It becomes a solid wall when the atom leaves switch A.'},
    fragile:{cells:['💎 H','→','H'],action:tr?'DİKKATLİ KAYDIR':'SLIDE CAREFULLY',result:tr?'Kırılgan atom fazla darbe alırsa parçalanır; kısa ve temiz rota kur.':'Too many impacts shatter it; use a short, clean route.'},
    linked:{cells:['🔗 H','+','🔗 H','→'],action:tr?'İKİSİNİ BİRLİKTE KAYDIR':'SLIDE BOTH TOGETHER',result:tr?'Birini hareket ettirince eşi de aynı yönde gider. İkisinin yolu açık olmalı.':'Moving either one sends its mate in the same direction. Both paths must be clear.'},
    precision:{cells:['H','🎯','→','1 □'],action:tr?'1 KARE TAŞI':'MOVE 1 SQUARE',result:tr?'Bu isteğe bağlı araç atomu yalnızca bir kare ilerletir ve envanter harcar.':'This optional tool moves an atom exactly one tile and consumes inventory.'},
    classicCatalyst:{cells:[labComponentTrainingToken('catalyst'),labComponentTrainingToken('energy'),labComponentTrainingToken('stabilizer'),'→','⚛️'],action:tr?'ÜÇÜNÜ TOPLA':'COLLECT ALL THREE',result:tr?'Önce üç laboratuvar bileşenini topla, sonra molekülü tamamla.':'Collect all three lab components first, then complete the molecule.'},
    classicChain:{cells:['✨','→','⚡','→','⚡'],action:tr?'PARLAYAN HAMLEYİ YAP':'MAKE THE GLOWING MOVE',result:tr?'Doğru hamle otomatik zincir reaksiyonunu başlatır.':'The correct move starts the automatic chain reaction.'},
    classicReactor:{cells:['H','☢️','▥','→'],action:tr?'GÜVENLİ ANI BEKLE':'WAIT FOR THE SAFE PHASE',result:tr?'Lazer aktifken temas Darbe sayacını artırır. Reaktör Kaçışında ayrıca +3 saniye ceza verir.':'Contact while the laser is active increases the Impact counter. Reactor Escape also adds a 3-second penalty.'}
  };
  const demo=demos[id]||{cells:['⚛️','→','✅'],action:tr?'DENE':'TRY IT',result:tr?'Mekaniği gözlemle ve ardından gerçek bölüme geç.':'Observe the mechanic, then continue to the real level.'};
  // The bespoke mini-animation remains the same, but non-TR/EN players now
  // receive localized action/result text instead of an English fallback.
  if(LANG!=='tr'&&LANG!=='en'){
    demo.action=ml('ÖRNEĞİ DENE','TRY THE EXAMPLE','BEISPIEL TESTEN','PROBAR EJEMPLO','TESTAR EXEMPLO','例を試す');
    demo.result=MECHANIC_INFO[id]?t(MECHANIC_INFO[id].descKey):ml('Mekaniği gözlemle ve gerçek bölüme geç.','Observe the mechanic, then continue to the real level.','Beobachte die Mechanik und fahre mit dem echten Level fort.','Observa la mecánica y continúa al nivel real.','Observe a mecânica e continue para a fase real.','仕組みを確認して実際のレベルへ進みます。');
  }
  return demo;
}
function markMechanicTutorialSeen(id){
  const flags={frozen:'seenFrozen',fire:'seenFire',lightning:'seenLightning',sticky:'seenSticky',zombie:'seenZombie',oneWay:'seenOneWay',hammer:'seenBreakableWall',portal:'seenPortal',movingWall:'seenMovingWall',pressureDoor:'seenPressureDoor',fragile:'seenFragile',linked:'seenLinked',precision:'seenPrecisionTutorialV2',classicCatalyst:'seenClassicCatalystTutorialV2',classicChain:'seenClassicChainTutorialV2',classicReactor:'seenClassicReactorTutorialV2'};
  const flag=flags[id];if(flag)save[flag]=true;
  if(id==='precision')save.seenPrecision=true;
  if(id==='fragile'){save.seenFragileAtom=true;}
  if(id==='linked'){save.seenLinkedAtoms=true;}
  if(id==='hammer'){save.seenHammerWall=true;}
  persist();
}
function showMechanicBriefing(ids,opts){

  ids=(ids||[]).filter(id=>MECHANIC_INFO[id]);
  if(!ids.length)return;
  let page=0,demonstrated=false;
  function render(){
    const id=ids[page],info=MECHANIC_INFO[id],demo=mechanicTutorialDemo(id),last=page===ids.length-1;
    const cells=demo.cells.map((v,n)=>'<span class="'+(String(v).includes('mxTrainingToken')?'mxTrainingCell':'')+'" style="min-width:42px;height:42px;padding:0 8px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.14);font-weight:900;transition:.28s;" data-tutorial-cell="'+n+'">'+v+'</span>').join('');
    const drGuide=ml('Parlayan deney düğmesine dokun. Hareketi adım adım göstereceğim.','Tap the glowing experiment button. I will show the action step by step.','Tippe auf die leuchtende Experiment-Schaltfläche. Ich zeige den Ablauf Schritt für Schritt.','Toca el botón brillante del experimento. Te mostraré la acción paso a paso.','Toque no botão brilhante do experimento. Vou mostrar a ação passo a passo.','光る実験ボタンをタップしてください。手順を順番に示します。');
    openModal('<div style="font-size:.72rem;font-weight:900;letter-spacing:.12em;color:#78e7ff;margin-bottom:5px">'+ml('EĞİTİM DENEYİ','TRAINING EXPERIMENT','TRAININGSEXPERIMENT','EXPERIMENTO DE PRÁCTICA','EXPERIMENTO DE TREINO','練習実験')+' · '+(page+1)+'/'+ids.length+'</div><h3>'+info.icon+' '+t(info.titleKey)+'</h3><div class="msub">'+t(info.descKey)+'</div>'+drETrainingCard(drGuide,'1/2')+'<div id="mechanicMiniLab" style="margin:15px 0 10px;padding:15px 10px;border-radius:18px;background:linear-gradient(145deg,rgba(20,49,76,.9),rgba(34,20,63,.92));border:1px solid rgba(120,231,255,.28);"><div style="display:flex;gap:7px;align-items:center;justify-content:center;flex-wrap:wrap">'+cells+'</div><div id="mechanicDemoResult" style="min-height:42px;margin-top:12px;font-size:.82rem;line-height:1.35;color:#dcecff">'+ml('Aşağıdaki düğmeye bas ve örneği çalıştır.','Press the button below to run the example.','Drücke die Schaltfläche unten, um das Beispiel auszuführen.','Pulsa el botón de abajo para ejecutar el ejemplo.','Pressione o botão abaixo para executar o exemplo.','下のボタンを押して例を実行してください。')+'</div></div><div class="mrow"><button class="btn amber mxGuidedTarget" id="mMechanicTry">▶ '+demo.action+'</button><button class="btn green" id="mMechanicNext" disabled>'+(last?ml('GERÇEK BÖLÜME GEÇ ▶','START REAL LEVEL ▶','ECHTES LEVEL STARTEN ▶','INICIAR NIVEL REAL ▶','INICIAR FASE REAL ▶','実際のレベルへ ▶'):ml('SONRAKİ EĞİTİM ▶','NEXT TRAINING ▶','NÄCHSTES TRAINING ▶','SIGUIENTE PRÁCTICA ▶','PRÓXIMO TREINO ▶','次の練習 ▶'))+'</button></div>');
    bindTap('#mMechanicTry',()=>{
      if(demonstrated)return;demonstrated=true;SFX.select();mxHaptic('light');
      const lab=$('#mechanicMiniLab'),result=$('#mechanicDemoResult'),tryBtn=$('#mMechanicTry'),next=$('#mMechanicNext');
      if(lab){lab.style.boxShadow='0 0 26px rgba(120,231,255,.24)';const cs=lab.querySelectorAll('[data-tutorial-cell]');cs.forEach((c,n)=>setTimeout(()=>{c.style.transform='translateY(-5px) scale(1.06)';c.style.borderColor='rgba(255,211,110,.8)';setTimeout(()=>{c.style.transform='';},320);},n*180));}
      setTimeout(()=>{if(result)result.innerHTML='✅ '+demo.result;if(tryBtn){tryBtn.classList.remove('mxGuidedTarget');tryBtn.disabled=true;tryBtn.textContent='✓ '+ml('DENEY TAMAM','EXPERIMENT COMPLETE','EXPERIMENT ABGESCHLOSSEN','EXPERIMENTO COMPLETADO','EXPERIMENTO CONCLUÍDO','実験完了');}if(next){next.disabled=false;next.classList.add('mxGuidedTarget');}setDrETraining(ml('Mükemmel. Sonucu gördün; devam etmek için parlayan düğmeye dokun.','Excellent. You saw the result; tap the glowing button to continue.','Ausgezeichnet. Du hast das Ergebnis gesehen; tippe zum Fortfahren auf die leuchtende Schaltfläche.','Excelente. Ya viste el resultado; toca el botón brillante para continuar.','Excelente. Você viu o resultado; toque no botão brilhante para continuar.','結果を確認できました。光るボタンをタップして続けてください。'),'2/2','👉');SFX.thunk();mxHaptic('success');},Math.max(650,demo.cells.length*180+220));
    });
    bindTap('#mMechanicNext',()=>{if(!demonstrated)return;const learnedId=ids[page],learnedInfo=MECHANIC_INFO[learnedId];markMechanicTutorialSeen(learnedId);markTrainingLearned('mechanic',learnedId,t(learnedInfo.titleKey),true);SFX.play();if(page<ids.length-1){page++;demonstrated=false;render();return;}
      const finish=()=>{closeModal();prop('🎓 '+ml('Mekanik öğrenildi','Mechanic learned','Mechanik gelernt','Mecánica aprendida','Mecânica aprendida','仕組みを習得'),2200);const frame=$('#boardFrame');if(frame){frame.classList.add('mxTutorialBoardPulse');setTimeout(()=>frame.classList.remove('mxTutorialBoardPulse'),5000);}if(ids.includes('hammer')){save.seenHammerSupport=true;const b=$('#btnHammer');if(b){b.classList.add('mxTutorialPulse');setTimeout(()=>b.classList.remove('mxTutorialPulse'),7000);}}if(ids.includes('precision')){save.seenPrecisionSupport=true;const b=$('#btnPrecision');if(b){b.classList.add('mxTutorialPulse');setTimeout(()=>b.classList.remove('mxTutorialPulse'),7000);}}persist();setTimeout(()=>say(ml('Eğitim tamamlandı. Şimdi aynı kuralı gerçek bölümde kullan!','Training complete. Now use the same rule in the real level!','Training abgeschlossen. Nutze dieselbe Regel jetzt im echten Level!','Práctica completada. ¡Usa ahora la misma regla en el nivel real!','Treino concluído. Agora use a mesma regra na fase real!','練習完了。同じルールを実際のレベルで使ってみましょう！'),'happy',4200,'glow'),220);};
      openModal('<h3>✅ '+ml('Mekanik öğrenildi!','Mechanic learned!','Mechanik gelernt!','¡Mecánica aprendida!','Mecânica aprendida!','仕組みを習得しました！')+'</h3><div class="msub">'+ml('Bu eğitim artık otomatik olarak tekrar gösterilmeyecek. Eğitim Merkezi veya Moleculopedia’dan yeniden açabilirsin.','This lesson will not appear automatically again. You can replay it from the Training Center or Moleculopedia.','Diese Lektion wird nicht erneut automatisch angezeigt. Du kannst sie im Trainingszentrum oder in der Moleculopedia wiederholen.','Esta lección no volverá a aparecer automáticamente. Puedes repetirla desde el Centro de práctica o Moleculopedia.','Esta lição não aparecerá novamente de forma automática. Você pode repeti-la no Centro de Treino ou na Moleculopedia.','このレッスンは自動では再表示されません。トレーニングセンターまたはMoleculopediaから再実行できます。')+'</div><div class="mrow"><button class="btn ghost" id="mMechanicRepeat">↻ '+ml('TEKRAR DENE','TRY AGAIN','NOCH EINMAL','REPETIR','TENTAR NOVAMENTE','もう一度')+'</button><button class="btn green mxGuidedTarget" id="mMechanicContinue">'+ml('GERÇEK BÖLÜME GEÇ ▶','START REAL LEVEL ▶','ECHTES LEVEL STARTEN ▶','INICIAR NIVEL REAL ▶','INICIAR FASE REAL ▶','実際のレベルへ ▶')+'</button></div>');
      bindTap('#mMechanicRepeat',()=>showMechanicBriefing(ids,opts));
      bindTap('#mMechanicContinue',finish);
    });
  }
  render();
}
function mechanicsGuideModal(){
  const tr=LANG==='tr';
  const rows=trainingMechanicCatalog().map(row=>{
    const id=row[0],flag=row[1],info=MECHANIC_INFO[id];
    if(!info||!save[flag])return null;
    const fullTitle=t(info.titleKey),title=String(fullTitle).replace(/^\S+\s/,'').trim()||fullTitle;
    return [id,info.icon,title,t(info.descKey),flag];
  }).filter(Boolean);
  const html=rows.length?rows.map(r=>'<button class="mechanicGuideRow" data-mechanic-replay="'+r[0]+'" style="width:100%;text-align:left;cursor:pointer"><div class="mechanicGuideIcon">'+r[1]+'</div><div style="flex:1"><b>'+r[2]+'</b><small>'+r[3]+'</small><small style="color:#78e7ff;margin-top:4px">▶ '+ml('Eğitimi yeniden çalıştır','Replay training','Training wiederholen','Repetir práctica','Repetir treino','練習を再実行')+'</small></div></button>').join(''):'<div class="mechanicGuideRow"><small>'+ml('Henüz açılan bir mekanik yok — ilerledikçe burada birikecek.','Nothing unlocked yet — this fills in as you progress.','Noch keine Mechanik freigeschaltet – die Liste wächst mit deinem Fortschritt.','Aún no hay mecánicas desbloqueadas; aparecerán al avanzar.','Ainda não há mecânicas desbloqueadas; elas aparecerão com o progresso.','まだ仕組みは解放されていません。進行すると追加されます。')+'</small></div>';
  openModal('<h3>🎓 '+ml('Eğitim Merkezi · Mekanikler','Training Center · Mechanics','Trainingszentrum · Mechaniken','Centro de práctica · Mecánicas','Centro de treino · Mecânicas','トレーニングセンター・仕組み')+'</h3><div class="msub">'+ml('Yalnızca keşfettiğin kurallar burada görünür. Bir karta dokunarak kısa deneyi yeniden açabilirsin.','Only discovered rules appear here. Tap a card to replay its short experiment.','Hier erscheinen nur entdeckte Regeln. Tippe auf eine Karte, um das kurze Experiment zu wiederholen.','Aquí solo aparecen reglas descubiertas. Toca una tarjeta para repetir su experimento breve.','Aqui aparecem apenas regras descobertas. Toque em um cartão para repetir o experimento curto.','発見済みのルールだけが表示されます。カードをタップすると短い実験を再生できます。')+'</div><div class="settingsScroll mechanicGuideList">'+html+'</div><div class="mrow"><button class="btn green" id="mReplayAllMechanics"'+(rows.length?'':' disabled')+'>▶ '+ml('Tüm açılmış eğitimleri sırayla çalıştır','Replay all unlocked trainings','Alle freigeschalteten Trainings abspielen','Repetir todas las prácticas desbloqueadas','Repetir todos os treinos desbloqueados','解放済みの練習を順番に再生')+'</button></div><div class="mrow"><button class="btn ghost" id="mResetMechanicTips">'+ml('İlk kullanım açıklamalarını yeniden aç','Show first-use tips again','Ersthinweise erneut anzeigen','Mostrar de nuevo las explicaciones iniciales','Mostrar novamente as explicações iniciais','初回説明を再表示')+'</button><button class="btn" id="mGuideClose">'+t('close')+'</button></div>');
  document.querySelectorAll('[data-mechanic-replay]').forEach(b=>bindTap(b,()=>showMechanicBriefing([b.dataset.mechanicReplay])));
  bindTap('#mReplayAllMechanics',()=>showMechanicBriefing(rows.map(r=>r[0])));
  bindTap('#mGuideClose',()=>settingsModal());
  bindTap('#mResetMechanicTips',()=>{save.seenFrozen=false;save.seenFire=false;save.seenLightning=false;save.seenSticky=false;save.seenZombie=false;save.seenOneWay=false;save.seenBreakableWall=false;save.seenPortal=false;save.seenMovingWall=false;save.seenPressureDoor=false;save.seenFragile=false;save.seenFragileAtom=false;save.seenLinked=false;save.seenLinkedAtoms=false;save.seenHammerWall=false;save.tutorialTips=true;save.seenPrecision=false;save.seenPrecisionTutorialV2=false;save.seenClassicCatalystTutorialV2=false;save.seenClassicChainTutorialV2=false;save.seenClassicReactorTutorialV2=false;save.seenBarrierSupport=false;persist();SFX.click();prop(ml('İlk kullanım açıklamaları yeniden etkinleştirildi.','First-use explanations enabled again.','Ersthinweise wurden erneut aktiviert.','Las explicaciones iniciales se activaron de nuevo.','As explicações iniciais foram ativadas novamente.','初回説明を再び有効にしました。'),1800);});
}

function moleculopediaCatalog(){
  const tr=LANG==='tr';
  const mechanics=trainingMechanicCatalog().map(row=>{
    const id=row[0],flag=row[1],info=MECHANIC_INFO[id],unlocked=!!save[flag];
    return {group:'mechanic',id,icon:info?info.icon:'⚛️',title:info?t(info.titleKey):row[2],desc:info?t(info.descKey):'',unlocked};
  });
  const supports=['hint','undo','restart','hammer','precision','barrier','lab'].map(id=>{
    const x=supportInfoText(id);return {group:'support',id,icon:x.icon,title:x.title,desc:x.desc,unlocked:id==='hint'||id==='undo'||id==='restart'||id==='lab'||!!save['seen'+id.charAt(0).toUpperCase()+id.slice(1)+'Support']};
  });
  const labs=LAB_ITEMS.map(it=>({group:'lab',id:it.id,icon:it.icon,title:lx(it.name),desc:lx(it.desc),unlocked:save.cur>=it.unlock,unlock:it.unlock,owned:labOwned(it.id)}));
  return {mechanics,supports,labs};
}
function moleculopediaModal(tab){
  tab=tab||'mechanics';
  const cat=moleculopediaCatalog();
  const tabs=[
    ['mechanics','⚛️',ml('Atomlar ve Mekanikler','Atoms & Mechanics','Atome & Mechaniken','Átomos y mecánicas','Átomos e mecânicas','原子と仕組み')],
    ['supports','🧰',ml('Destekler','Supports','Hilfen','Ayudas','Suportes','サポート')],
    ['labs','🧪',ml('Laboratuvar','Laboratory','Labor','Laboratorio','Laboratório','ラボ')]
  ];
  const list=cat[tab]||cat.mechanics;
  const cards=list.map(it=>{
    const locked=!it.unlocked;
    const lockedAt=it.unlock?ml('Bölüm '+it.unlock+'’de açılır','Unlocks at level '+it.unlock,'Freischaltung bei Level '+it.unlock,'Se desbloquea en el nivel '+it.unlock,'Desbloqueia no nível '+it.unlock,'レベル'+it.unlock+'で解放'):ml('Henüz keşfedilmedi','Not discovered yet','Noch nicht entdeckt','Aún no descubierto','Ainda não descoberto','未発見');
    const status=locked?lockedAt:(it.group==='lab'?(it.owned?ml('Sahipsin','Owned','Im Besitz','Obtenido','Adquirido','所有済み'):ml('Açıldı','Unlocked','Freigeschaltet','Desbloqueado','Desbloqueado','解放済み')):(trainingLearned(it.group,it.id)?ml('Öğrenildi','Learned','Gelernt','Aprendido','Aprendido','習得済み'):ml('Açıldı','Unlocked','Freigeschaltet','Desbloqueado','Desbloqueado','解放済み')));
    const action=locked?'':('<small style="display:block;color:#78e7ff;margin-top:5px">▶ '+ml('Aç ve tekrar dene','Open and replay','Öffnen und wiederholen','Abrir y repetir','Abrir e repetir','開いて再実行')+'</small>');
    return '<button class="mechanicGuideRow moleculoCard '+(locked?'locked':'')+'" data-moleculo-group="'+it.group+'" data-moleculo-id="'+it.id+'" '+(locked?'disabled':'')+' style="width:100%;text-align:left;'+(locked?'opacity:.48;filter:grayscale(.35);':'cursor:pointer;')+'"><div class="mechanicGuideIcon">'+(locked?'🔒':it.icon)+'</div><div style="flex:1"><b>'+it.title+'</b><small>'+it.desc+'</small><small style="display:block;margin-top:4px;color:'+(locked?'#aab2c0':'#ffd36e')+'">'+status+'</small>'+action+'</div></button>';
  }).join('')||'<div class="mechanicGuideRow"><small>'+ml('Henüz içerik yok.','No entries yet.','Noch keine Einträge.','Aún no hay contenido.','Ainda não há conteúdo.','まだ項目はありません。')+'</small></div>';
  const tabHtml=tabs.map(x=>'<button class="btn '+(tab===x[0]?'green':'ghost')+' moleculoTab" data-moleculo-tab="'+x[0]+'">'+x[1]+' '+x[2]+'</button>').join('');
  openModal('<div class="moleculopediaHead"><h3>📘 Moleculopedia</h3><div class="msub">'+ml('Keşfettiğin mekanikleri, oyuncu desteklerini ve laboratuvar cihazlarını burada incele. Yalnızca gerekli kısa bilgiler gösterilir.','Review discovered mechanics, player supports, and laboratory equipment here. Only essential short explanations are shown.','Sieh dir entdeckte Mechaniken, Spielerhilfen und Laborgeräte an. Es werden nur kurze, notwendige Erklärungen gezeigt.','Consulta aquí las mecánicas, ayudas y equipos de laboratorio descubiertos. Solo se muestran explicaciones breves y necesarias.','Consulte aqui mecânicas, suportes e equipamentos descobertos. Apenas explicações curtas e necessárias são mostradas.','発見した仕組み、サポート、ラボ装置を確認できます。必要な短い説明だけを表示します。')+'</div><div class="mrow" style="flex-wrap:wrap">'+tabHtml+'</div></div><div class="settingsScroll mechanicGuideList" style="margin-top:10px">'+cards+'</div><div class="mrow modalFixedClose"><button class="btn" id="mMoleculoClose">'+t('close')+'</button></div>');
  $('#modalBox').classList.add('mxTouchScrollModal','moleculopediaModal');
  document.querySelectorAll('[data-moleculo-tab]').forEach(b=>bindTap(b,()=>moleculopediaModal(b.dataset.moleculoTab)));
  document.querySelectorAll('[data-moleculo-group]').forEach(b=>bindTap(b,()=>{
    const g=b.dataset.moleculoGroup,id=b.dataset.moleculoId;
    if(g==='mechanic')showMechanicBriefing([id]);
    else if(g==='support')showSupportTutorial(id,()=>moleculopediaModal('supports'));
    else if(g==='lab')labEquipmentTutorial(id,()=>moleculopediaModal('labs'));
  }));
  bindTap('#mMoleculoClose',()=>{SFX.click();closeModal();});
}

function trainingCenterModal(){
  const pr=trainingProgress();
  openModal('<h3>🎓 '+ml('Eğitim Merkezi','Training Center','Trainingszentrum','Centro de práctica','Centro de treino','トレーニングセンター')+'</h3><div class="msub">'+ml('İstediğin eğitimi yeniden aç. Eğitim denemelerinde MoleCoin veya envanter harcanmaz.','Replay any lesson. Training examples never consume MoleCoins or inventory.','Wiederhole jede Lektion. Trainingsbeispiele verbrauchen weder MoleCoins noch Inventar.','Repite cualquier lección. Los ejemplos no consumen MoleCoins ni inventario.','Repita qualquer lição. Os exemplos não consomem MoleCoins nem inventário.','好きなレッスンを再実行できます。練習ではMoleCoinや所持品を消費しません。')+'</div><div style="margin:12px 0;padding:12px;border-radius:16px;background:rgba(120,231,255,.08);border:1px solid rgba(120,231,255,.25)"><div style="display:flex;justify-content:space-between;gap:10px;font-weight:900"><span>🏅 '+ml('Eğitim İlerlemesi','Training Progress','Trainingsfortschritt','Progreso de práctica','Progresso do treino','練習の進行')+'</span><span>'+pr.done+'/'+pr.total+' · %'+pr.pct+'</span></div><div style="height:8px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:9px"><i style="display:block;height:100%;width:'+pr.pct+'%;background:linear-gradient(90deg,#78e7ff,#ffd36e);border-radius:99px"></i></div></div><div class="settingsScroll" style="display:grid;gap:9px;margin-top:12px"><button class="btn ghost" id="tcBasic">🧭 '+ml('Temel hareket eğitimi','Basic movement tutorial','Grundbewegungen','Movimientos básicos','Movimentos básicos','基本操作')+'</button><button class="btn ghost" id="tcMechanics">⚡ '+ml('Özel atomlar ve mekanikler','Special atoms and mechanics','Spezialatome und Mechaniken','Átomos y mecánicas especiales','Átomos e mecânicas especiais','特殊原子と仕組み')+'</button><button class="btn ghost" id="tcSupports">🧰 '+ml('Oyuncu destekleri','Player supports','Spielerhilfen','Ayudas del jugador','Suportes do jogador','プレイヤーサポート')+'</button><button class="btn ghost" id="tcLab">🧪 '+ml('Laboratuvar cihazları','Laboratory equipment','Laborgeräte','Equipos de laboratorio','Equipamentos de laboratório','ラボ装置')+'</button></div><div class="mrow"><button class="btn" id="tcClose">'+t('close')+'</button></div>');
  bindTap('#tcBasic',()=>{closeModal();startTutorial();});
  bindTap('#tcMechanics',mechanicsGuideModal);
  bindTap('#tcSupports',showAllSupportGuide);
  bindTap('#tcLab',labEquipmentGuideModal);
  bindTap('#tcClose',()=>{SFX.click();closeModal();});
}

function languagePickerModal(){
  const langs=[
    ['en','English'],['tr','Türkçe'],['de','Deutsch'],
    ['es','Español'],['pt','Português'],['ja','日本語']
  ];
  const title=ml('Dil Seç','Choose Language','Sprache wählen','Elegir idioma','Escolher idioma','言語を選択');
  const rows=langs.map(([code,name])=>'<button class="languageSheetChoice'+(LANG===code?' on':'')+'" data-language-choice="'+code+'"><span class="languageSheetGlobe">🌐</span><span>'+name+'</span><b>'+(LANG===code?'✓':'')+'</b></button>').join('');
  openModal('<div class="languageSheetHandle"></div><div class="languagePickerHead"><h3>🌐 '+title+'</h3><div class="msub">'+ml('Oyunda kullanmak istediğin dili seç.','Select the language used throughout the game.','Wähle die Sprache für das gesamte Spiel.','Selecciona el idioma del juego.','Selecione o idioma usado no jogo.','ゲーム全体で使う言語を選んでください。')+'</div></div><div class="languageSheetList">'+rows+'</div><button class="languageSheetCancel" id="mLanguageBack">'+t('cancel')+'</button>');
  $('#modalBox').classList.add('languagePickerModal','languageBottomSheet');
  document.querySelectorAll('[data-language-choice]').forEach(b=>bindTap(b,()=>{
    const code=b.dataset.languageChoice;
    if(code!==LANG){SFX.click();setLang(code);}
    settingsModal();
  }));
  bindTap('#mLanguageBack',settingsModal);
}

function settingChoiceSheet(title,note,options,current,onChoose){
  const rows=options.map(([value,label,icon])=>'<button class="languageSheetChoice'+(current===value?' on':'')+'" data-setting-choice="'+value+'"><span class="languageSheetGlobe">'+(icon||'•')+'</span><span>'+label+'</span><b>'+(current===value?'✓':'')+'</b></button>').join('');
  openModal('<div class="languageSheetHandle"></div><div class="languagePickerHead"><h3>'+title+'</h3><div class="msub">'+note+'</div></div><div class="languageSheetList">'+rows+'</div><button class="languageSheetCancel" id="mSettingBack">'+t('cancel')+'</button>');
  $('#modalBox').classList.add('languagePickerModal','languageBottomSheet','settingsChoiceBottomSheet');
  document.querySelectorAll('[data-setting-choice]').forEach(b=>bindTap(b,()=>{const value=b.dataset.settingChoice;if(value!==current){SFX.click();onChoose(value);}settingsModal();}));
  bindTap('#mSettingBack',settingsModal);
}
function effectIntensityPickerModal(){
  settingChoiceSheet('✨ '+t('effectIntensityLabel'),ml('Parçacık, parlama ve başarı efektlerinin yoğunluğunu seç.','Choose the intensity of particles, glow and completion effects.','Wähle die Stärke von Partikeln, Leuchten und Erfolgs­effekten.','Elige la intensidad de partículas, brillo y efectos de éxito.','Escolha a intensidade de partículas, brilho e efeitos de conclusão.','パーティクル、発光、成功エフェクトの強さを選択します。'),[['low',t('effectLow'),'◔'],['normal',t('effectNormal'),'◑'],['high',t('effectHigh'),'●']],save.effectLevel||'normal',value=>{save.effectLevel=value;persist();applyMotionPrefs();});
}
function performanceModePickerModal(){
  settingChoiceSheet('⚡ '+t('performanceModeLabel'),t('performanceModeNote'),[['auto',t('performanceAuto'),'⚙️'],['low',t('performanceLow'),'🔋'],['high',t('performanceHigh'),'✨']],save.performanceMode||'auto',value=>{save.performanceMode=value;persist();applyMotionPrefs();fxResize();if(scr.game.classList.contains('on'))resize();});
}

function cleanUiLabel(value){return String(value||'').replace(/^[\s\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]+/u,'').trim();}
function mxUiIcon(name,extra){
  const cls='mxCodeIcon'+(extra?' '+extra:'');
  const icons={
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    speaker:'<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    music:'<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    bell:'<path d="M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4L6 16z"/><path d="M10 19h4"/>',
    headphones:'<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5zM20 13h-3v6h2a1 1 0 0 0 1-1v-5z"/>',
    dpad:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/><path d="m12 5-2 2h4l-2-2zM19 12l-2-2v4l2-2zM12 19l2-2h-4l2 2zM5 12l2 2v-4l-2 2z"/>',
    bulb:'<path d="M9 21h6M10 18h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.5 1.2 2.2h4.8c.1-.7.5-1.6 1.2-2.2A6 6 0 0 0 12 3z"/>',
    flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
    book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5zM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5z"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4M12 13v3M9 20h6M10 16h4l1 4H9l1-4z"/>',
    play:'<path d="m9 7 8 5-8 5V7z"/>',
    mute:'<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="m17 9 4 4M21 9l-4 4"/>'
  };
  return '<svg class="'+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.bulb)+'</svg>';
}
function mxAudioIcon(muted){return mxUiIcon(muted?'mute':'speaker','mxAudioSvg');}

let mxSettingsHostScreen='';
function restoreSettingsHostScreen(){
  const host=mxSettingsHostScreen;
  if(!host||!scr[host])return;
  for(const key in scr)scr[key].classList.toggle('on',key===host);
  scrPrev=host;
  if(host==='game')requestAnimationFrame(resize);
}
function settingsModal(){
  const activeScreen=Object.keys(scr).find(key=>scr[key]&&scr[key].classList.contains('on'))||scrPrev||'splash';
  mxSettingsHostScreen=activeScreen;
  document.body.dataset.mxSettingsHost=activeScreen;
  // Do not change screen or music mode while Settings is opened over a level.
  if(activeScreen!=='game')freshMenuTrack();
  openModal(
    '<h3>'+t('settingsTitle')+'</h3>'+ 
    '<div class="settingsScroll">'+
 
    '<button type="button" class="languageSettingRow" id="mLanguageOpen"><span class="languageSettingLabel"><b>'+t('language')+'</b><small>'+ml('Oyun dili','Game language','Spielsprache','Idioma del juego','Idioma do jogo','ゲーム言語')+'</small></span><span class="languageSettingValue"><strong>'+({en:'English',tr:'Türkçe',de:'Deutsch',es:'Español',pt:'Português',ja:'日本語'}[LANG]||'English')+'</strong><i>›</i></span></button>'+ 
    '<div class="vrow audioRow"><span class="vl">'+mxUiIcon('speaker','mxLabelIcon')+'<span>'+cleanUiLabel(t('master'))+'</span></span><input type="range" id="vM" min="0" max="100" value="'+Math.round(save.volM*100)+'"><button class="btn ghost mt'+((save.muM||save.externalMusic)?' off':'')+(save.externalMusic?' extDisabled':'')+'" id="mM" aria-label="Master sound on or off"'+(save.externalMusic?' disabled':'')+'>'+mxAudioIcon(save.muM||save.externalMusic)+'</button></div>'+ 
    '<div class="vrow audioRow"><span class="vl">'+mxUiIcon('music','mxLabelIcon')+'<span>'+cleanUiLabel(t('music'))+'</span></span><input type="range" id="vMu" min="0" max="100" value="'+Math.round(save.volMu*100)+'"><button class="btn ghost mt'+(save.muMu?' off':'')+'" id="mMu" aria-label="Music sound on or off">'+mxAudioIcon(save.muMu)+'</button></div>'+ 
    '<div class="vrow audioRow"><span class="vl">'+mxUiIcon('bell','mxLabelIcon')+'<span>'+cleanUiLabel(t('sfx'))+'</span></span><input type="range" id="vS" min="0" max="100" value="'+Math.round(save.volS*100)+'"><button class="btn ghost mt'+(save.muS?' off':'')+'" id="mS" aria-label="Effects sound on or off">'+mxAudioIcon(save.muS)+'</button></div>'+ 
    '<div class="togRow externalMusicRow"><span><b>'+mxUiIcon('headphones','mxRowIcon')+cleanUiLabel(t('externalMusicLabel'))+'</b><small>'+t('externalMusicNote')+'</small></span><button class="tog'+(save.externalMusic?' on':'')+'" id="togExternalMusic"></button></div>'+ 
    '<div class="togRow"><span><b>'+mxUiIcon('dpad','mxRowIcon')+cleanUiLabel(t('showDpad'))+'</b></span><button class="tog'+(save.dpad?' on':'')+'" id="togDpad"></button></div>'+ 
    '<div class="togRow"><span><b>'+mxUiIcon('bulb','mxRowIcon')+t('tutorialTipsLabel')+'</b><small>'+t('tutorialTipsNote')+'</small></span><button class="tog'+(save.tutorialTips!==false?' on':'')+'" id="togTutorialTips"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('reduceMotionLabel')+'</b><small>'+t('reduceMotionNote')+'</small></span><button class="tog'+(save.reduceMotion?' on':'')+'" id="togReduceMotion"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('duelEffectsLabel')+'</b><small>'+t('duelEffectsNote')+'</small></span><button class="tog'+(save.duelEffects!==false?' on':'')+'" id="togDuelEffects"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('duelMessagesLabel')+'</b><small>'+t('duelMessagesNote')+'</small></span><button class="tog'+(save.duelMessages!==false?' on':'')+'" id="togDuelMessages"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('hapticsLabel')+'</b><small>'+t('hapticsNote')+'</small></span><button class="tog'+(save.haptics!==false?' on':'')+'" id="togHaptics"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('largeTextLabel')+'</b><small>'+t('largeTextNote')+'</small></span><button class="tog'+(save.largeText?' on':'')+'" id="togLargeText"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('colorBlindLabel')+'</b><small>'+t('colorBlindNote')+'</small></span><button class="tog'+(save.colorBlind?' on':'')+'" id="togColorBlind"></button></div>'+ 
    '<div class="togRow"><span><b>'+t('highContrastLabel')+'</b><small>'+t('highContrastNote')+'</small></span><button class="tog'+(save.highContrast?' on':'')+'" id="togHighContrast"></button></div>'+ 
    '<button type="button" class="settingsPickerRow" id="mEffectOpen"><span class="settingsPickerLabel"><b>'+t('effectIntensityLabel')+'</b><small>'+ml('Parçacık ve parlama yoğunluğu','Particle and glow intensity','Partikel- und Leuchtintensität','Intensidad de partículas y brillo','Intensidade de partículas e brilho','パーティクルと発光の強さ')+'</small></span><span class="settingsPickerValue"><strong>'+({low:t('effectLow'),normal:t('effectNormal'),high:t('effectHigh')}[save.effectLevel||'normal'])+'</strong><i>›</i></span></button>'+ 
    '<button type="button" class="settingsPickerRow" id="mPerformanceOpen"><span class="settingsPickerLabel"><b>'+t('performanceModeLabel')+'</b><small>'+t('performanceModeNote')+'</small></span><span class="settingsPickerValue"><strong>'+({auto:t('performanceAuto'),low:t('performanceLow'),high:t('performanceHigh')}[save.performanceMode||'auto'])+'</strong><i>›</i></span></button>'+ 
    '<div class="mrow settingsActions">'+
    '<button class="btn ghost" id="mMusicList">'+t('musicListBtn')+'</button>'+ 
    '<div class="legalLinks"><a href="privacy-policy.html" target="_blank">'+t('privacyLink')+'</a> · '+
    '<a href="terms-of-use.html" target="_blank">'+t('termsLink')+'</a> · '+
    '<a href="player-name-rules.html" target="_blank">'+t('nameRulesLink')+'</a></div>'+ 
    '</div>'+
    '<div class="mrow settingsDangerZone" style="flex-direction:column;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)">'+
      '<button class="btn ghost" id="mReset" style="color:var(--red)">'+t('resetProgress')+'</button>'+
      (accountState&&!accountState.isAnonymous?'<button class="btn ghost" id="mDeleteCloud" style="color:var(--red)">'+t('deleteCloudOnly')+'</button>':'')+
    '</div></div>'+ 
    '<div class="settingsFixedNav">'+
      '<button class="btn settingsClose" id="mClose">'+t('close')+'</button>'+ 
    '</div>'
  );
  $('#modalBox').classList.add('settingsModal');
  requestAnimationFrame(()=>{
    if(!$('#modal').classList.contains('on'))return;
    // Defensive iOS guard: opening Settings must never activate splash/intro.
    restoreSettingsHostScreen();
    setTimeout(()=>{if($('#modal').classList.contains('on'))restoreSettingsHostScreen();},180);
  });
  bindTap('#mLanguageOpen',languagePickerModal);
  bindTap('#mEffectOpen',effectIntensityPickerModal);
  bindTap('#mPerformanceOpen',performanceModePickerModal);
  $('#mMusicList').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();musicListModal();},{passive:false});
  const bindV=(id,k,preview)=>{
    const el=$(id);
    let persistTimer=0;
    const update=()=>{
      unlock();
      save[k]=clampAudio(Number(el.value)/100);
      applyVol();
      clearTimeout(persistTimer);
      persistTimer=setTimeout(persist,180);
    };
    // Stop the app-wide swipe blocker from swallowing native iPhone range input.
    ['touchstart','touchmove','pointerdown','pointermove'].forEach(type=>{
      el.addEventListener(type,e=>e.stopPropagation(),{passive:type==='touchstart'||type==='pointerdown'});
    });
    el.addEventListener('input',update,{passive:true});
    el.addEventListener('change',()=>{update();persist();if(preview&&!save.muS&&save.volM>0&&save.volS>0)SFX.click();},{passive:true});
  };
  bindV('#vM','volM',true);bindV('#vMu','volMu',false);bindV('#vS','volS',true);
  const bindM=(id,k)=>{$(id).addEventListener('pointerdown',e=>{e.preventDefault();
    save[k]=!save[k];persist();applyVol();
    e.currentTarget.innerHTML=mxAudioIcon(save[k]);
    e.currentTarget.classList.toggle('off',save[k]);
    SFX.click();
  },{passive:false});};
  $('#mM').addEventListener('pointerdown',e=>{
    e.preventDefault();
    if(save.externalMusic)return;
    save.muM=!save.muM;persist();applyVol();
    e.currentTarget.textContent=save.muM?'🔇':'🔊';
    e.currentTarget.classList.toggle('off',save.muM);
    if(!save.muM)SFX.click();
  },{passive:false});
  bindM('#mMu','muMu');bindM('#mS','muS');
  $('#togExternalMusic').addEventListener('pointerdown',e=>{
    e.preventDefault();
    save.externalMusic=!save.externalMusic;
    externalMusicMode=!!save.externalMusic;
    persist();
    e.currentTarget.classList.toggle('on',save.externalMusic);
    if(externalMusicMode){
      stopAllGameAudio();
    }else{
      configureAudioSession();
      unlock();
      applyVol();
      if(bootDone){
        MP.mode=scr.game.classList.contains('on')?'game':'menu';
        if(MP.mode==='menu'){MP.idx=MENU_TRACK_INDEX;musicAudio.loop=true;}
        playTrack(MP.idx||MENU_TRACK_INDEX,false);
      }
      SFX.click();
    }
    settingsModal();
  },{passive:false});
  $('#togDpad').addEventListener('pointerdown',e=>{e.preventDefault();
    save.dpad=!save.dpad;persist();
    document.body.classList.toggle('nodpad',!save.dpad);
    e.currentTarget.classList.toggle('on',save.dpad);
    SFX.click();
    setTimeout(resize,260);
  },{passive:false});
  $('#togTutorialTips').addEventListener('pointerdown',e=>{e.preventDefault();
    save.tutorialTips=save.tutorialTips===false;persist();
    e.currentTarget.classList.toggle('on',save.tutorialTips!==false);
    SFX.click();
    prop(save.tutorialTips!==false?(LANG==='tr'?'Eğitim ipuçları açıldı.':'Tutorial tips enabled.'):(LANG==='tr'?'Eğitim ipuçları kapatıldı. Moleculopedia her zaman açık.':'Tutorial tips disabled. Moleculopedia remains available.'),2200);
  },{passive:false});
  const bindSettingToggle=(id,key)=>{$(id).addEventListener('pointerdown',e=>{e.preventDefault();save[key]=!save[key];persist();applyMotionPrefs();e.currentTarget.classList.toggle('on',!!save[key]);SFX.click();},{passive:false});};
  bindSettingToggle('#togReduceMotion','reduceMotion');
  bindSettingToggle('#togDuelEffects','duelEffects');
  bindSettingToggle('#togDuelMessages','duelMessages');
  bindSettingToggle('#togHaptics','haptics');
  bindSettingToggle('#togLargeText','largeText');
  bindSettingToggle('#togColorBlind','colorBlind');
  bindSettingToggle('#togHighContrast','highContrast');

  $('#mReset')?.addEventListener('pointerdown',e=>{e.preventDefault();
    openModal('<h3>'+t('areYouSure')+'</h3><div class="msub">'+t('wipeWarn')+'</div><div class="mrow"><button class="btn ghost" id="mYes" style="color:var(--red)">'+t('yesWipe')+'</button><button class="btn" id="mNo">'+t('cancel')+'</button></div>');
    $('#mYes').addEventListener('pointerdown',ev=>{ev.preventDefault();
      const keepName=save.playerName||curProfile;
      save=Object.assign(defaultSave(),{playerName:keepName,volM:save.volM,volMu:save.volMu,volS:save.volS,volV:save.volV,muM:save.muM,muMu:save.muMu,muS:save.muS,muV:save.muV,externalMusic:save.externalMusic,dpad:save.dpad,lang:save.lang,profileId:save.profileId||genProfileId(),tutorialDone:false});
      persist();updateCoins();updateBadge();closeModal();show('splash');
    },{passive:false});
    $('#mNo').addEventListener('pointerdown',ev=>{ev.preventDefault();settingsModal();},{passive:false});
  },{passive:false});
  $('#mDeleteCloud')?.addEventListener('pointerdown',e=>{e.preventDefault();
    openModal('<h3>'+t('deleteCloudTitle')+'</h3><div class="msub">'+t('deleteCloudWarn')+'</div><div class="mrow"><button class="btn ghost" id="mDelYesCloud" style="color:var(--red)">'+t('yesDeleteCloud')+'</button><button class="btn" id="mDelNoCloud">'+t('cancel')+'</button></div>');
    $('#mDelYesCloud').addEventListener('pointerdown',async ev=>{ev.preventDefault();
      if(!window.MXCloud||!save.profileId){closeModal();return;}
      const btn=$('#mDelYesCloud');btn.disabled=true;btn.textContent=t('deleting');
      const res=await window.MXCloud.deleteCloudProfile(save.profileId);
      if(res&&res.ok){
        prop(t('deleteCloudDone'),2400);
      }else{
        say(t('deleteCloudFailed'),'sad',3200);
      }
      closeModal();
    },{passive:false});
    $('#mDelNoCloud').addEventListener('pointerdown',ev=>{ev.preventDefault();settingsModal();},{passive:false});
  },{passive:false});
  bindTap('#mClose',e=>{SFX.click();restoreSettingsHostScreen();closeModal();setTimeout(restoreSettingsHostScreen,260);});
}
function applyLang(){
  document.documentElement.lang=LANG;
  document.title=LANG==='tr'?"Moleculox — Dr. E'nin Laboratuvarı":"Moleculox — Dr. E's Lab";
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const val=t(el.dataset.i18n);
    if(val!==undefined)el.innerHTML=val;
  });
  refreshSplash();
  if(scr.levels.classList.contains('on'))buildLevels();
  if(scr.collect.classList.contains('on'))buildCollection();
  if(scr.game.classList.contains('on')&&LV){
    $('#goalName').textContent=curMol.n;
    $('#goalFor').textContent=curMol.f;
    $('#lvPill').textContent=dailyMode?t('todaysExpLabel'):t('level',lv+1);
    updateHUD();
  }
}
function setLang(lang){
  lang=normalizeLang(lang);
  LANG=lang;
  const dataLang=contentLang(lang);
  MOLS=dataLang==='tr'?MOLS_TR:MOLS_EN;
  ELINFO=dataLang==='tr'?ELINFO_TR:ELINFO_EN;
  LN=dataLang==='tr'?LN_TR:dataLang==='de'?LN_DE:dataLang==='es'?LN_ES:dataLang==='pt'?LN_PT:dataLang==='ja'?LN_JA:LN_EN;
  if(mid&&MOLS[mid])curMol=MOLS[mid];
  save.lang=lang;persist();
  applyLang();
  if(MX_NATIVE&&window.MXCloud&&window.MXCloud.updatePushLang)window.MXCloud.updatePushLang(lang);
}

/* ================= BOARD RENDER ================= */
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2.5);
  const wrap=$('#boardWrap');
  const nodpad=document.body.classList.contains('nodpad');
  const bw=wrap.clientWidth-(nodpad?22:34),bh=wrap.clientHeight-30;
  T=Math.max(22,Math.min(58,Math.floor(Math.min(bw/W,bh/H))));
  board.style.width=T*W+'px';board.style.height=T*H+'px';
  board.width=T*W*dpr;board.height=T*H*dpr;
  bctx.setTransform(dpr,0,0,dpr,0,0);
}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const ease=p=>1-Math.pow(1-p,3);
const TIER_STONE=[
  ['#b5b5b5','#8f8f8f','#686868'],
  ['#5ba3ec','#3d76c0','#234f80'],
  ['#bd68ec','#8f42c0','#5f2884'],
  ['#45cbd0','#29959b','#176b70'],
  ['#4ade9a','#279767','#176a4a'],
  ['#56c8f2','#318fb6','#1d6381'],
  ['#ef79dc','#b64ca7','#7a2e70'],
  ['#ffc85a','#d99a2d','#966417'],
  ['#ffdf72','#d8a936','#8a5c16']
];
function stoneDoodle(cx,cy,r,seed){
  bctx.strokeStyle='rgba(255,255,255,.24)';bctx.lineWidth=1.4;
  const kind=seed%3;
  if(kind===0){
    bctx.beginPath();bctx.arc(cx,cy,r*0.16,0,6.3);bctx.stroke();
    for(let k=0;k<3;k++){
      bctx.save();bctx.translate(cx,cy);bctx.rotate(k*1.05);
      bctx.beginPath();bctx.ellipse(0,0,r*0.62,r*0.24,0,0,6.3);bctx.stroke();
      bctx.restore();
    }
  }else if(kind===1){
    bctx.beginPath();
    bctx.moveTo(cx-r*0.14,cy-r*0.5);bctx.lineTo(cx-r*0.14,cy-r*0.05);
    bctx.lineTo(cx-r*0.46,cy+r*0.5);bctx.lineTo(cx+r*0.46,cy+r*0.5);
    bctx.lineTo(cx+r*0.14,cy-r*0.05);bctx.lineTo(cx+r*0.14,cy-r*0.5);
    bctx.stroke();
    bctx.beginPath();bctx.moveTo(cx-r*0.2,cy-r*0.5);bctx.lineTo(cx+r*0.2,cy-r*0.5);bctx.stroke();
  }else{
    bctx.beginPath();bctx.arc(cx-r*0.3,cy-r*0.2,r*0.13,0,6.3);bctx.stroke();
    bctx.beginPath();bctx.arc(cx+r*0.28,cy+r*0.22,r*0.13,0,6.3);bctx.stroke();
    bctx.beginPath();bctx.moveTo(cx-r*0.2,cy-r*0.1);bctx.lineTo(cx+r*0.18,cy+r*0.12);bctx.stroke();
  }
}
function drawStone(x,y,gx,gy){
  const p=2,s=T-4;
  const cs=TIER_STONE[tierOf(lv)]||TIER_STONE[0];
  const g=bctx.createLinearGradient(x,y,x,y+T);
  g.addColorStop(0,cs[0]);g.addColorStop(0.5,cs[1]);g.addColorStop(1,cs[2]);
  bctx.fillStyle=g;rrect(bctx,x+p,y+p,s,s,5);bctx.fill();
  if(gx!==undefined){
    const seed=(gx*7+gy*13)%6;
    if(seed===0)stoneDoodle(x+T/2,y+T/2,T*0.42,(gx*3+gy*5)>>0);
  }
  bctx.strokeStyle='rgba(255,255,255,.35)';bctx.lineWidth=1.5;
  bctx.beginPath();bctx.moveTo(x+p+3,y+p+s-3);bctx.lineTo(x+p+3,y+p+3);bctx.lineTo(x+p+s-3,y+p+3);bctx.stroke();
  bctx.strokeStyle='rgba(0,0,0,.4)';
  bctx.beginPath();bctx.moveTo(x+p+3,y+p+s-2);bctx.lineTo(x+p+s-2,y+p+s-2);bctx.lineTo(x+p+s-2,y+p+3);bctx.stroke();
}
function drawNanoBarrier(gx,gy,t){
  const x=gx*T,y=gy*T,p=.5+.5*Math.sin(t/210);bctx.save();
  const g=bctx.createLinearGradient(x,y,x+T,y+T);g.addColorStop(0,'rgba(126,235,255,.92)');g.addColorStop(1,'rgba(76,112,255,.82)');
  bctx.fillStyle=g;bctx.shadowColor='#72e8ff';bctx.shadowBlur=8+5*p;bctx.fillRect(x+T*.16,y+T*.16,T*.68,T*.68);
  bctx.strokeStyle='rgba(255,255,255,.9)';bctx.lineWidth=Math.max(1.5,T*.04);bctx.strokeRect(x+T*.2,y+T*.2,T*.6,T*.6);
  bctx.strokeStyle='rgba(255,255,255,.55)';bctx.beginPath();bctx.moveTo(x+T*.28,y+T*.5);bctx.lineTo(x+T*.72,y+T*.5);bctx.moveTo(x+T*.5,y+T*.28);bctx.lineTo(x+T*.5,y+T*.72);bctx.stroke();bctx.restore();
}
function drawBreakableStone(x,y,gx,gy,t){
  drawStone(x,y,gx,gy);
  const pulse=.55+.25*Math.sin(t/420+gx+gy);
  bctx.save();bctx.strokeStyle='rgba(255,214,153,'+pulse+')';bctx.lineWidth=Math.max(2,T*.045);bctx.shadowColor='#ffb45e';bctx.shadowBlur=7;
  bctx.beginPath();bctx.moveTo(x+T*.28,y+T*.16);bctx.lineTo(x+T*.45,y+T*.38);bctx.lineTo(x+T*.34,y+T*.55);bctx.lineTo(x+T*.53,y+T*.72);bctx.lineTo(x+T*.46,y+T*.88);bctx.stroke();
  bctx.beginPath();bctx.moveTo(x+T*.45,y+T*.38);bctx.lineTo(x+T*.68,y+T*.27);bctx.moveTo(x+T*.34,y+T*.55);bctx.lineTo(x+T*.18,y+T*.66);bctx.moveTo(x+T*.53,y+T*.72);bctx.lineTo(x+T*.76,y+T*.62);bctx.stroke();
  bctx.shadowBlur=3;bctx.fillStyle='#fff1bd';bctx.font='900 '+Math.max(9,Math.round(T*.2))+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText('🔨',x+T*.74,y+T*.24);bctx.restore();
}
function drawAtom(x,y,e,r,selRing,t,ctx){
  ctx=ctx||bctx;
  const col=EL[e];
  ctx.fillStyle='rgba(0,0,0,.3)';
  ctx.beginPath();ctx.ellipse(x,y+r*0.82,r*0.85,r*0.32,0,0,7);ctx.fill();
  const winBoost=(won&&t-winT<950)?Math.max(0,1-(t-winT)/950):0;
  const gp=0.6+0.4*Math.sin(t/1500+x*0.011+y*0.014)+winBoost*1.6;
  const medalGlow=bonusVisualTier>=3?0.22:0;
  ctx.save();ctx.globalAlpha=Math.min(1,(0.2+medalGlow)*gp);ctx.shadowColor=col.c;ctx.shadowBlur=r*(0.8+(bonusVisualTier>=3?0.75:0)+winBoost*0.7);
  ctx.beginPath();ctx.arc(x,y,r*(0.92+winBoost*0.25),0,7);ctx.fillStyle=col.c;ctx.fill();ctx.restore();
  if(selRing){
    ctx.save();ctx.translate(x,y);ctx.rotate(t/600);
    ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=2.5;ctx.setLineDash([7,6]);
    ctx.shadowColor='#4fd8ff';ctx.shadowBlur=12;
    ctx.beginPath();ctx.arc(0,0,r+5+Math.sin(t/220)*1.5,0,7);ctx.stroke();
    ctx.restore();ctx.setLineDash([]);
  }
  const g=ctx.createRadialGradient(x-r*0.35,y-r*0.42,r*0.12,x,y,r);
  g.addColorStop(0,col.hi);g.addColorStop(0.55,col.c);g.addColorStop(1,shade(col.c,-30));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)';
  ctx.beginPath();ctx.ellipse(x-r*0.3,y-r*0.45,r*0.32,r*0.18,-0.6,0,7);ctx.fill();
  ctx.fillStyle=col.t;
  ctx.font='900 '+Math.round(r*0.85)+'px -apple-system,system-ui,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(e,x,y+r*0.05);
}

function drawFragileAtomOverlay(x,y,r,a,t,ctx){
  if(!a||!a.fragile)return;ctx=ctx||bctx;
  const hits=Math.max(0,a.fragileHits||0),pulse=.72+.18*Math.sin(t/180+a.ph);
  ctx.save();ctx.strokeStyle='rgba(196,239,255,'+pulse+')';ctx.lineWidth=Math.max(2,r*.09);ctx.shadowColor='#88d9ff';ctx.shadowBlur=9;
  ctx.setLineDash([Math.max(3,r*.22),Math.max(2,r*.15)]);ctx.beginPath();ctx.arc(x,y,r+5,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  if(hits>=1){ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=Math.max(1.5,r*.07);ctx.beginPath();ctx.moveTo(x-r*.15,y-r*.72);ctx.lineTo(x+r*.05,y-r*.22);ctx.lineTo(x-r*.16,y+r*.08);ctx.stroke();}
  if(hits>=2){ctx.beginPath();ctx.moveTo(x+r*.05,y-r*.22);ctx.lineTo(x+r*.48,y-r*.02);ctx.moveTo(x-r*.16,y+r*.08);ctx.lineTo(x+r*.16,y+r*.58);ctx.stroke();}
  ctx.font='900 '+Math.round(r*.55)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#eaf9ff';ctx.fillText(String(Math.max(0,(a.fragileMax||3)-hits)),x+r*.72,y-r*.68);ctx.restore();
}

function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);
  const r=Math.max(0,Math.min(255,(n>>16)+amt)),g=Math.max(0,Math.min(255,((n>>8)&255)+amt)),b=Math.max(0,Math.min(255,(n&255)+amt));
  return 'rgb('+r+','+g+','+b+')';
}
function renderBoard(t){
  bctx.clearRect(0,0,T*W,T*H);
  bctx.save();
  if(shake>0){bctx.translate((Math.random()-0.5)*shake*9,(Math.random()-0.5)*shake*9);shake=Math.max(0,shake-0.045);}
  // tiles
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(grid[y][x]){const mw=movingWalls.find(w=>w.x===x&&w.y===y),pd=pressureSystems.find(s=>s.door.x===x&&s.door.y===y);if(mw||pd){}else{const bw=breakableWalls.get(breakableKey(x,y));if(bw&&!bw.broken)drawBreakableStone(x*T,y*T,x,y,t);else drawStone(x*T,y*T,x,y);}}
    else{
      bctx.fillStyle=(x+y)%2?'rgba(255,255,255,.05)':'rgba(255,255,255,.028)';
      rrect(bctx,x*T+2,y*T+2,T-4,T-4,4);bctx.fill();
    }
  }
  if(movingWalls.length){for(const w of movingWalls)drawMovingWall(w,t);}
  if(pressureSystems.length){for(const p of pressureSystems){drawPressurePlate(p,t);drawPressureDoor(p,t);}}
  // Special floor components sit above floor tiles and below atoms.
  if(oneWayTiles.size){for(const o of oneWayTiles.values())drawOneWayTile(o,t);}
  if(portalPairs.size){for(const p of portalPairs.values())drawPortalTile(p,t);}
  if(temporaryBarriers.size){for(const b of temporaryBarriers.values())drawNanoBarrier(b.x,b.y,t);}
  if(reactorActive()){for(const g of reactorGates)drawReactorGate(g,t);}
  if(crystalActive()){for(const c of crystals){if(!c.collected)drawCrystalToken((c.x+0.5)*T,(c.y+0.5)*T,t,c.type);}}
  const chainCharged=chainActive()?chainChargedAtomIndex():-1;
  // render positions
  const pos=atoms.map((a,i)=>{
    let rx=a.x,ry=a.y;
    if(anim&&anim.partner&&anim.partner.i===i&&anim.i!==i){
      const p=Math.min(1,(t-anim.t0)/anim.dur),e2=ease(p);rx=anim.partner.fx+(anim.partner.tx-anim.partner.fx)*e2;ry=anim.partner.fy+(anim.partner.ty-anim.partner.fy)*e2;
    }
    if(anim&&anim.i===i){
      let p=(t-anim.t0)/anim.dur;
      if(p>=1){
        const finishedAnim=anim,landDist=Math.abs(finishedAnim.tx-finishedAnim.fx)+Math.abs(finishedAnim.ty-finishedAnim.fy);
        a.x=finishedAnim.tx;a.y=finishedAnim.ty;if(finishedAnim.partner){const pa=atoms[finishedAnim.partner.i];pa.x=finishedAnim.partner.tx;pa.y=finishedAnim.partner.ty;}bounce={i,t0:t,dx:Math.sign(finishedAnim.tx-finishedAnim.fx),dy:Math.sign(finishedAnim.ty-finishedAnim.fy)};anim=null;rx=a.x;ry=a.y;
        if(crystalActive())collectCrystalsAlong(finishedAnim.crystalPath);
        if(chainActive())chainRefreshStep();
        const portal=(!finishedAnim.portalTransit)?portalDestination(a.x,a.y,i):null;
        if(portal){
          portalBurst(a.x,a.y,portal.id);SFX.sparkle&&SFX.sparkle();mxHaptic('medium');
          anim={i,fx:a.x,fy:a.y,tx:portal.x,ty:portal.y,t0:performance.now(),dur:motionReduced()?120:300,crystalPath:null,chainTrigger:null,chainAutoStep:finishedAnim.chainAutoStep,prevBonds:finishedAnim.prevBonds,portalTransit:true};
          say(LANG==='tr'?'Portal aktif!':'Portal activated!','happy',1500,'glow');
          return[(a.x+.5)*T,(a.y+.5)*T];
        }
        if(finishedAnim.portalTransit)portalBurst(a.x,a.y,portalPairs.get(portalKey(a.x,a.y))?.id||'B');
        const beforeLandingBonds=Number(finishedAnim.prevBonds)||0;
        afterMove(i);
        const afterLandingBonds=bondsMatched();
        SFX.atomLand&&SFX.atomLand(landDist,afterLandingBonds>beforeLandingBonds);
        if(effectsAllowed()){
          const br=board.getBoundingClientRect(),cx=br.left+(a.x+.5)*T,cy=br.top+(a.y+.5)*T;
          const bonded=afterLandingBonds>beforeLandingBonds;
          const count=bonded?14:6,cols=bonded?['#ffffff','#72f4ff','#b68cff']:['#d9f7ff','#7fdcff'];
          for(let q=0;q<count;q++){const ang=q/count*Math.PI*2;P({k:'glit',x:cx,y:cy,vx:Math.cos(ang)*(bonded?1.5:.75),vy:Math.sin(ang)*(bonded?1.5:.75),r:bonded?2.2:1.4,c:rnd(cols),life:bonded?.72:.34,d:q*.008});}
          if(bonded){mxHaptic('medium');SFX.link&&SFX.link();}
        }
        if(chainActive()&&!won){if(finishedAnim.chainTrigger)beginChainReaction(finishedAnim.chainTrigger);else if(finishedAnim.chainAutoStep)setTimeout(runNextChainAuto,75);}
        if(!won&&!motionReduced())shake=Math.max(shake,Math.min(0.16,0.035+landDist*0.018));
      }
      else{const e2=ease(p);rx=anim.fx+(anim.tx-anim.fx)*e2;ry=anim.fy+(anim.ty-anim.fy)*e2;}
    }
    if(nudge&&nudge.i===i){
      const q=(t-nudge.t0)/130;
      if(q>=1)nudge=null;
      else{const[dx,dy]=DIRS[nudge.d];const k=Math.sin(q*Math.PI)*0.14;rx+=dx*k;ry+=dy*k;}
    }
    const bob=(anim&&anim.i===i)?0:Math.sin(t/520+a.ph)*0.035;
    if(anim&&anim.i===i){const br=board.getBoundingClientRect();gameFeelMovingTrail(a,br.left+(rx+.5)*(br.width/W),br.top+(ry+.5)*(br.height/H),t);}
    return[(rx+0.5)*T,(ry+0.5+bob)*T];
  });
  // linked atom cable
  if(linkedPairs.length){bctx.save();bctx.lineCap='round';for(const [a,b] of linkedPairs){const pa=pos[a],pb=pos[b];if(!pa||!pb)continue;const pulse=.58+.22*Math.sin(t/210+a);bctx.strokeStyle='rgba(119,232,255,'+pulse+')';bctx.lineWidth=Math.max(3,T*.055);bctx.setLineDash([Math.max(5,T*.12),Math.max(4,T*.08)]);bctx.lineDashOffset=motionReduced()?0:-t/35;bctx.beginPath();bctx.moveTo(pa[0],pa[1]);bctx.lineTo(pb[0],pb[1]);bctx.stroke();}bctx.restore();}
  // bonds
  const movingI=anim?anim.i:-1;
  bctx.lineCap='round';
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    if(i===movingI||j===movingI)continue;
    const dx=atoms[j].x-atoms[i].x,dy=atoms[j].y-atoms[i].y;
    if(Math.abs(dx)+Math.abs(dy)!==1)continue;
    if(!curMol.bs.has(atoms[i].e+','+atoms[j].e+','+dx+','+dy))continue;
    const pul=won?(0.6+0.4*Math.sin((t-winT)/110)):1;
    bctx.strokeStyle='rgba(195,235,255,'+(0.95*pul)+')';
    bctx.lineWidth=T*0.16*(won?pul+0.35:1);
    bctx.shadowColor='#4fd8ff';bctx.shadowBlur=won?18:9;
    bctx.beginPath();bctx.moveTo(pos[i][0],pos[i][1]);bctx.lineTo(pos[j][0],pos[j][1]);bctx.stroke();
    bctx.shadowBlur=0;
  }
  // hint arrow
  if(hintMark){
    const a=atoms[hintMark.i],[dx,dy]=DIRS[hintMark.d];
    const hx=(a.x+0.5)*T,hy=(a.y+0.5)*T;
    const off=T*(0.75+0.18*Math.sin(t/180));
    bctx.save();bctx.translate(hx+dx*off,hy+dy*off);bctx.rotate(Math.atan2(dy,dx));
    bctx.fillStyle='#ffd23f';bctx.shadowColor='#ffd23f';bctx.shadowBlur=14;
    bctx.beginPath();bctx.moveTo(T*0.3,0);bctx.lineTo(-T*0.12,-T*0.22);bctx.lineTo(-T*0.12,T*0.22);bctx.closePath();bctx.fill();
    bctx.restore();
    bctx.strokeStyle='rgba(255,210,63,.9)';bctx.lineWidth=3;bctx.shadowColor='#ffd23f';bctx.shadowBlur=10;
    bctx.beginPath();bctx.arc(hx,hy,T*0.52,0,7);bctx.stroke();bctx.shadowBlur=0;
  }
  // motion trail for long slides
  if(anim){
    const dist=Math.abs(anim.tx-anim.fx)+Math.abs(anim.ty-anim.fy);
    if(dist>=3){
      const p0=(t-anim.t0)/anim.dur;
      const atomEl=atoms[anim.i].e,col=EL[atomEl];
      for(let g=1;g<=4;g++){
        const pg=p0-g*0.05-g*g*0.012;
        if(pg<=0||pg>=1)continue;
        const eg=ease(pg);
        const gx=(anim.fx+(anim.tx-anim.fx)*eg+0.5)*T,gy=(anim.fy+(anim.ty-anim.fy)*eg+0.5)*T;
        bctx.globalAlpha=0.34*(1-g/5);
        bctx.beginPath();bctx.arc(gx,gy,T*0.4*(0.8-g*0.08),0,6.3);
        bctx.fillStyle=col?col.c:'#fff';bctx.fill();
        bctx.globalAlpha=1;
      }
    }
  }
  function specialAtomType(a){
    if(a.zombie)return 'zombie';
    if(a.lightning)return 'lightning';
    if(a.fire)return 'fire';
    if(a.frozen)return 'frozen';
    if(a.sticky)return 'sticky';
    return '';
  }
  function specialAtomMeta(type){
    const tr=LANG==='tr';
    return type==='zombie'?{icon:'🧟‍♂️',label:tr?'ZOMBİ':'ZOMBIE',stroke:'#8af06a'}:
      type==='lightning'?{icon:'⚡',label:tr?'ŞİMŞEK':'LIGHTNING',stroke:'#83efff'}:
      type==='fire'?{icon:'🔥',label:tr?'ATEŞ':'FIRE',stroke:'#ff9b3d'}:
      type==='frozen'?{icon:'❄️',label:tr?'DONUK':'FROZEN',stroke:'#c8f4ff'}:
      type==='sticky'?{icon:'🍯',label:tr?'YAPIŞKAN':'STICKY',stroke:'#ffd25c'}:null;
  }
  function drawSpecialAtomBadge(x,y,r,type,t){
    const m=specialAtomMeta(type);if(!m)return;
    const reduce=motionReduced();
    bctx.save();
    bctx.textAlign='center';bctx.textBaseline='middle';
    // Distinct non-color shapes for accessibility.
    bctx.strokeStyle=m.stroke;bctx.lineWidth=Math.max(2,T*.035);bctx.shadowColor=m.stroke;bctx.shadowBlur=reduce?0:9;
    if(type==='frozen'){
      bctx.setLineDash([7,4]);bctx.beginPath();bctx.arc(x,y,r+6,0,Math.PI*2);bctx.stroke();bctx.setLineDash([]);
      bctx.globalAlpha=.72;bctx.beginPath();bctx.moveTo(x-r*.55,y-r*.18);bctx.lineTo(x-r*.12,y+r*.05);bctx.lineTo(x-r*.38,y+r*.48);bctx.moveTo(x+r*.05,y-r*.55);bctx.lineTo(x-r*.02,y-r*.12);bctx.lineTo(x+r*.42,y+r*.18);bctx.stroke();bctx.globalAlpha=1;
    }else if(type==='fire'){
      const pulse=reduce?1:1+Math.sin(t/180)*.06;bctx.beginPath();
      for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5;const rr=(k%2? r+3:r+9)*pulse;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;k?bctx.lineTo(px,py):bctx.moveTo(px,py);}bctx.closePath();bctx.stroke();
      if(!reduce)for(let k=0;k<3;k++){const a=t/420+k*2.1;const px=x+Math.cos(a)*r*.72,py=y-r*.9-Math.abs(Math.sin(a))*7;bctx.globalAlpha=.45+.2*Math.sin(a);bctx.fillStyle='#ffd169';bctx.beginPath();bctx.arc(px,py,Math.max(1.8,T*.025),0,7);bctx.fill();}bctx.globalAlpha=1;
    }else if(type==='lightning'){
      bctx.setLineDash([3,4]);bctx.lineDashOffset=reduce?0:-t/24;bctx.beginPath();bctx.arc(x,y,r+7,0,7);bctx.stroke();bctx.setLineDash([]);
      if(!reduce){for(let k=0;k<3;k++){const a=t/220+k*2.1;const x1=x+Math.cos(a)*(r+4),y1=y+Math.sin(a)*(r+4),x2=x+Math.cos(a+.28)*(r+13),y2=y+Math.sin(a+.28)*(r+13);bctx.globalAlpha=.7;bctx.beginPath();bctx.moveTo(x1,y1);bctx.lineTo((x1+x2)/2+Math.sin(t/70+k)*3,(y1+y2)/2);bctx.lineTo(x2,y2);bctx.stroke();}bctx.globalAlpha=1;}
    }else if(type==='zombie'){
      bctx.setLineDash([2,5]);bctx.lineDashOffset=reduce?0:t/38;bctx.beginPath();bctx.arc(x,y,r+7,0,7);bctx.stroke();bctx.setLineDash([]);
      // Funny infected face marks and green mist.
      bctx.fillStyle='rgba(92,210,88,.5)';if(!reduce)for(let k=0;k<4;k++){const a=t/530+k*1.55;bctx.globalAlpha=.22+.18*Math.sin(a);bctx.beginPath();bctx.arc(x+Math.cos(a)*(r+11),y+Math.sin(a*.8)*(r+7),Math.max(2,T*.035),0,7);bctx.fill();}bctx.globalAlpha=1;
      bctx.strokeStyle='#285a31';bctx.lineWidth=Math.max(2,T*.028);bctx.beginPath();bctx.moveTo(x-r*.33,y-r*.12);bctx.lineTo(x-r*.12,y-r*.2);bctx.moveTo(x+r*.08,y-r*.2);bctx.lineTo(x+r*.32,y-r*.08);bctx.moveTo(x-r*.18,y+r*.25);bctx.quadraticCurveTo(x,y+r*.38,x+r*.2,y+r*.22);bctx.stroke();
    }else if(type==='sticky'){
      bctx.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,rr=k%2?r+4:r+8;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;k?bctx.lineTo(px,py):bctx.moveTo(px,py);}bctx.closePath();bctx.stroke();
      bctx.fillStyle='rgba(255,196,45,.7)';bctx.beginPath();bctx.ellipse(x-r*.2,y+r*.36,r*.28,r*.14,0,0,7);bctx.fill();
    }
    bctx.shadowBlur=0;
    bctx.font='900 '+Math.round(r*.56)+'px system-ui';bctx.lineWidth=3;bctx.strokeStyle='rgba(8,18,30,.9)';bctx.strokeText(m.icon,x+r*.78,y-r*.78);bctx.fillText(m.icon,x+r*.78,y-r*.78);
    // Small always-readable text tag under the atom.
    const fs=Math.max(8,Math.min(12,Math.round(T*.105)));bctx.font='900 '+fs+'px system-ui';
    const w=Math.max(T*.54,bctx.measureText(m.label).width+10),h=fs+7,yy=y+r+8;
    bctx.fillStyle='rgba(5,14,25,.88)';bctx.strokeStyle=m.stroke;bctx.lineWidth=1.5;
    const rr=5;bctx.beginPath();bctx.roundRect(x-w/2,yy,w,h,rr);bctx.fill();bctx.stroke();
    bctx.fillStyle='#fff';bctx.fillText(m.label,x,yy+h/2+.5);
    bctx.restore();
  }
  // atoms
  for(let i=0;i<atoms.length;i++){
    let sc=1;
    if(bounce&&bounce.i===i){
      const q=(t-bounce.t0)/170;
      if(q>=1)bounce=null;else sc=1+0.16*Math.sin(q*Math.PI);
    }else if(i===sel&&!won){
      const sq=Math.min(1,(t-selT0)/120);
      sc=1+0.06*ease(sq);
    }
    const impactBounce=bounce&&bounce.i===i?bounce:null;
    if(impactBounce&&!motionReduced()){
      const q=Math.min(1,(t-impactBounce.t0)/190),wave=Math.sin(q*Math.PI);
      const sx=impactBounce.dx?1-wave*.18:1+wave*.10,sy=impactBounce.dy?1-wave*.18:1+wave*.10;
      bctx.save();bctx.translate(pos[i][0],pos[i][1]);bctx.scale(sx,sy);bctx.translate(-pos[i][0],-pos[i][1]);
      drawAtom(pos[i][0],pos[i][1],atoms[i].e,T*0.4*sc,i===sel&&!won,t);
      drawFragileAtomOverlay(pos[i][0],pos[i][1],T*0.4*sc,atoms[i],t);
      bctx.restore();
    }else{
      drawAtom(pos[i][0],pos[i][1],atoms[i].e,T*0.4*sc,i===sel&&!won,t);
      drawFragileAtomOverlay(pos[i][0],pos[i][1],T*0.4*sc,atoms[i],t);
    }
    if(atoms[i].linked){bctx.save();bctx.font='900 '+Math.round(T*.20)+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillStyle='#e8fbff';bctx.strokeStyle='#123a52';bctx.lineWidth=3;bctx.strokeText('🔗',pos[i][0]+T*.27,pos[i][1]-T*.28);bctx.fillText('🔗',pos[i][0]+T*.27,pos[i][1]-T*.28);bctx.restore();}
    if(i===chainCharged&&!won){const pulse=1+Math.sin(t/130)*.08;bctx.save();bctx.strokeStyle='#ffd45a';bctx.lineWidth=3;bctx.shadowColor='#ff8f22';bctx.shadowBlur=17;bctx.setLineDash([6,4]);bctx.beginPath();bctx.arc(pos[i][0],pos[i][1],T*.49*pulse,0,7);bctx.stroke();bctx.setLineDash([]);bctx.font='900 '+Math.round(T*.28)+'px sans-serif';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillStyle='#fff4a4';bctx.fillText('⚡',pos[i][0]+T*.34,pos[i][1]-T*.34);bctx.restore();}
    const specialType=specialAtomType(atoms[i]);
    if(specialType)drawSpecialAtomBadge(pos[i][0],pos[i][1],T*0.4*sc,specialType,t);
  }
  bctx.restore();
}

/* ================= FX CANVAS (particles) ================= */
const fxc=$('#fx'),fctx=fxc.getContext('2d');
let PARTS=[],DUST=[],lastEmit=0;
function fxResize(){
  dpr=effectiveDpr();
  fxc.width=Math.max(1,Math.round(innerWidth*dpr));fxc.height=innerHeight*dpr;
  fxc.style.width=innerWidth+'px';fxc.style.height=innerHeight+'px';
  fctx.setTransform(dpr,0,0,dpr,0,0);
}
for(let i=0;i<24;i++)DUST.push({x:Math.random(),y:Math.random(),s:0.6+Math.random()*1.6,v:0.06+Math.random()*0.14,ph:Math.random()*7});
function P(o){const cap=performanceLow()?120:((motionReduced()||save.effects===false)?140:(save.effectLevel==='low'?220:(save.effectLevel==='high'?520:380)));if(PARTS.length<cap)PARTS.push(Object.assign({t:0,a:1},o));}
function spawnConf(x,y){
  const cols=['#ff5c69','#ffc94d','#4fd8ff','#9d7bff','#4ade80','#ff8ad0'];
  for(let i=0;i<26;i++)P({k:'conf',x,y,vx:(Math.random()-0.5)*7,vy:-4-Math.random()*5,c:rnd(cols),w:4+Math.random()*5,rot:Math.random()*7,vr:(Math.random()-0.5)*0.4,life:1.6});
}
function spawnWinFx(fx,x,y,cols){
  const n=(k,c,f)=>{for(let i=0;i<c;i++)P(Object.assign({k,x,y,c:rnd(cols),life:1.3},f(i)))};
  if(fx==='splash'){
    n('drop',26,i=>({vx:(Math.random()-0.5)*6.5,vy:-5-Math.random()*4.5,r:2.5+Math.random()*3.5,life:1.5}));
    n('ring',3,i=>({r:8,vr2:130+i*60,life:0.8}));
    n('bub',10,i=>({vx:(Math.random()-0.5)*1.4,vy:-1.5-Math.random(),r:3+Math.random()*4,life:1.8}));
  }else if(fx==='crys'){
    n('crys',24,i=>({vx:(Math.random()-0.5)*5,vy:-4-Math.random()*4,w:4+Math.random()*5,rot:Math.random()*7,vr:(Math.random()-0.5)*0.35,life:1.7}));
    n('glit',10,i=>({vx:(Math.random()-0.5)*2,vy:-1-Math.random()*2,r:2+Math.random()*2,life:1.4}));
  }else if(fx==='smoke'){
    n('smoke',16,i=>({vx:(Math.random()-0.5)*1.6,vy:-1.4-Math.random()*1.4,r:8+Math.random()*10,life:2}));
  }else if(fx==='bub'){
    n('bub',22,i=>({vx:(Math.random()-0.5)*2.2,vy:-1.8-Math.random()*2,r:3+Math.random()*6,life:2}));
  }else if(fx==='pop'){
    n('pop',14,i=>({x:x+(Math.random()-0.5)*90,y:y+(Math.random()-0.5)*90,r:3,life:0.55,d:i*0.05}));
    n('ring',2,i=>({r:6,vr2:110,life:0.7}));
  }else if(fx==='drip'){
    n('drop',20,i=>({vx:(Math.random()-0.5)*4.5,vy:-3.5-Math.random()*3.5,r:2.5+Math.random()*3,life:1.5}));
    n('smoke',5,i=>({vx:(Math.random()-0.5),vy:-1.2,r:7+Math.random()*6,life:1.6}));
  }else if(fx==='squig'){
    n('squig',13,i=>({vx:(Math.random()<0.5?-1:1)*(0.9+Math.random()*1.3),vy:-1.1-Math.random()*1.2,r:2.5+Math.random()*2,ph:Math.random()*7,life:2.1}));
    n('smoke',4,i=>({vx:0,vy:-1,r:9,life:1.7}));
  }else if(fx==='spark'){
    n('spark',26,i=>({vx:(Math.random()-0.5)*9,vy:-5-Math.random()*5,life:1}));
  }else if(fx==='glit'){
    n('glit',26,i=>({x:x+(Math.random()-0.5)*110,y:y+(Math.random()-0.5)*110,vx:0,vy:-0.6-Math.random(),r:2+Math.random()*2.5,life:1.6}));
  }else if(fx==='flame'){
    n('flame',26,i=>({x:x+(Math.random()-0.5)*70,vx:(Math.random()-0.5)*1.2,vy:-2.4-Math.random()*2.4,r:5+Math.random()*6,life:1.2}));
    n('smoke',6,i=>({vx:(Math.random()-0.5),vy:-1.5,r:8,life:1.6,c:'#9aa'}));
  }
}
function renderFx(t,dt){
  fctx.clearRect(0,0,innerWidth,innerHeight);
  // ambient dust
  if(!document.hidden&&!motionReduced()&&save.effects!==false)for(const d of DUST){
    d.y-=d.v*dt*0.06;if(d.y<-0.02)d.y=1.02;
    const a=0.08+0.07*Math.sin(t/900+d.ph);
    fctx.fillStyle='rgba(190,180,255,'+a+')';
    fctx.beginPath();fctx.arc(d.x*innerWidth+Math.sin(t/1400+d.ph)*8,d.y*innerHeight,d.s,0,7);fctx.fill();
  }
  // lab flask bubble emitters
  if(!document.hidden&&!motionReduced()&&save.effects!==false&&t-lastEmit>640){lastEmit=t;
    P({k:'bub',x:innerWidth*0.085,y:innerHeight*0.8,vx:(Math.random()-0.5)*0.4,vy:-0.9,r:1.5+Math.random()*2.5,c:'#a5f06a',life:2.4,amb:1});
    P({k:'bub',x:innerWidth*0.92,y:innerHeight*0.3,vx:(Math.random()-0.5)*0.4,vy:-0.8,r:1.5+Math.random()*2,c:'#7ef0c0',life:2.4,amb:1});
  }
  for(let i=PARTS.length-1;i>=0;i--){
    const p=PARTS[i];p.t+=dt/1000;
    if(p.d&&p.t<p.d)continue;
    const q=p.t/(p.life||1);
    if(q>=1){PARTS.splice(i,1);continue;}
    const dts=dt/16.7;
    fctx.globalAlpha=Math.max(0,(p.amb?0.7:1)*(1-q));
    switch(p.k){
      case 'drop':p.vy+=0.28*dts;p.x+=p.vx*dts;p.y+=p.vy*dts;
        fctx.fillStyle=p.c;fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,7);fctx.fill();break;
      case 'ring':{const r=p.r+p.vr2*p.t;fctx.strokeStyle=p.c;fctx.lineWidth=3.5*(1-q);
        fctx.beginPath();fctx.arc(p.x,p.y,r,0,7);fctx.stroke();break;}
      case 'crys':p.vy+=0.2*dts;p.x+=p.vx*dts;p.y+=p.vy*dts;p.rot+=p.vr*dts;
        fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.rot);fctx.fillStyle=p.c;
        fctx.fillRect(-p.w/2,-p.w/2,p.w,p.w);fctx.restore();break;
      case 'smoke':p.x+=p.vx*dts;p.y+=p.vy*dts;p.r+=0.22*dts;
        fctx.fillStyle=p.c;fctx.globalAlpha*=0.55;
        fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,7);fctx.fill();break;
      case 'bub':p.x+=(p.vx+Math.sin(p.t*6)*0.5)*dts;p.y+=p.vy*dts;
        fctx.strokeStyle=p.c;fctx.lineWidth=1.6;
        fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,7);fctx.stroke();
        fctx.fillStyle=p.c;fctx.globalAlpha*=0.35;fctx.fill();break;
      case 'pop':{const r=p.r+26*p.t/(p.life);fctx.strokeStyle=p.c;fctx.lineWidth=2.5*(1-q);
        fctx.beginPath();fctx.arc(p.x,p.y,r,0,7);fctx.stroke();break;}
      case 'flame':{p.x+=(p.vx+(Math.random()-0.5)*0.8)*dts;p.y+=p.vy*dts;const r=p.r*(1-q*0.7);
        fctx.fillStyle=p.c;fctx.beginPath();
        fctx.moveTo(p.x,p.y-r*1.7);fctx.quadraticCurveTo(p.x+r,p.y,p.x,p.y+r*0.6);fctx.quadraticCurveTo(p.x-r,p.y,p.x,p.y-r*1.7);fctx.fill();break;}
      case 'squig':p.x+=p.vx*dts;p.y+=(p.vy+Math.sin(p.t*9+p.ph)*1.1)*dts;
        fctx.fillStyle=p.c;fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,7);fctx.fill();break;
      case 'spark':{const ox=p.x,oy=p.y;p.vy+=0.3*dts;p.x+=p.vx*dts;p.y+=p.vy*dts;
        fctx.strokeStyle=p.c;fctx.lineWidth=2;
        fctx.beginPath();fctx.moveTo(ox,oy);fctx.lineTo(p.x,p.y);fctx.stroke();break;}
      case 'bond':{
        const local=Math.max(0,Math.min(1,(p.t-(p.d||0))/Math.max(.05,(p.life||1)-(p.d||0))));
        const e=1-Math.pow(1-local,3),xe=p.x1+(p.x2-p.x1)*e,ye=p.y1+(p.y2-p.y1)*e;
        fctx.save();fctx.globalAlpha=Math.sin(local*Math.PI)*.92;
        fctx.strokeStyle=p.c2||'#fff';fctx.lineWidth=(p.w||4)+5;fctx.shadowColor=p.c||'#7ee8ff';fctx.shadowBlur=16*(p.pulse||1);
        fctx.beginPath();fctx.moveTo(p.x1,p.y1);fctx.lineTo(xe,ye);fctx.stroke();
        fctx.shadowBlur=0;fctx.strokeStyle='#fff';fctx.lineWidth=Math.max(1,(p.w||4)*.42);
        fctx.beginPath();fctx.moveTo(p.x1,p.y1);fctx.lineTo(xe,ye);fctx.stroke();fctx.restore();break;}
      case 'sig':{
        const local=Math.max(0,Math.min(1,(p.t-(p.d||0))/Math.max(.05,(p.life||1)-(p.d||0))));
        const pt=mxSigPoint(p,local),prev=mxSigPoint(p,Math.max(0,local-.045));
        fctx.save();fctx.globalAlpha*=Math.sin(Math.min(1,local)*Math.PI);
        fctx.strokeStyle=p.c2||p.c;fctx.lineWidth=Math.max(.7,(p.r||3)*.45*(1-local));
        fctx.beginPath();fctx.moveTo(prev[0],prev[1]);fctx.lineTo(pt[0],pt[1]);fctx.stroke();
        mxDrawSigShape(fctx,p,pt[0],pt[1],local);fctx.restore();break;}
      case 'conf':p.vy+=0.16*dts;p.x+=(p.vx+Math.sin(p.t*5)*0.7)*dts;p.y+=p.vy*dts;p.rot+=p.vr*dts;
        fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.rot);fctx.fillStyle=p.c;
        fctx.fillRect(-p.w/2,-p.w/4,p.w,p.w/2);fctx.restore();break;
      case 'glit':{p.x+=p.vx*dts;p.y+=p.vy*dts;const a2=0.4+0.6*Math.abs(Math.sin(p.t*10));
        fctx.globalAlpha*=a2;fctx.fillStyle=p.c;
        fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.t*3);
        fctx.fillRect(-p.r,-0.9,p.r*2,1.8);fctx.fillRect(-0.9,-p.r,1.8,p.r*2);fctx.restore();break;}
    }
    fctx.globalAlpha=1;
  }
}

/* ================= TUTORIAL DEMO (plays out the FULL solve on the REAL board) ================= */
let demoMode=false;
function tutHandTo(gx,gy,show){
  const hand=$('.tutHand');if(!hand)return;
  const r=board.getBoundingClientRect();
  hand.style.left=(r.left+(gx+0.5)*T-19)+'px';
  hand.style.top=(r.top+(gy+0.5)*T-40)+'px';
  hand.style.opacity=show?1:0;
}
function tutSlideDestIn(state,i,d){
  const[dx,dy]=DIRS[d];let x=state[i].x,y=state[i].y;
  while(true){
    const nx=x+dx,ny=y+dy;
    if(grid[ny][nx]||state.some((a,k)=>k!==i&&a.x===nx&&a.y===ny))break;
    x=nx;y=ny;
  }
  return(x===state[i].x&&y===state[i].y)?null:{x,y};
}
function tutIsGoal(state){
  const mnx=Math.min(...state.map(a=>a.x)),mny=Math.min(...state.map(a=>a.y));
  return curMol.key===state.map(a=>a.e+','+(a.x-mnx)+','+(a.y-mny)).sort().join('|');
}
function solveFull(maxDepth){
  const start=atoms.map(a=>({x:a.x,y:a.y,e:a.e}));
  if(tutIsGoal(start))return[];
  let frontier=[{state:start,path:[]}];
  const seen=new Set([start.map(a=>a.x+','+a.y).join('|')]);
  for(let depth=0;depth<maxDepth;depth++){
    const next=[];
    for(const{state,path}of frontier){
      for(let i=0;i<state.length;i++){
        for(let d=0;d<4;d++){
          const dest=tutSlideDestIn(state,i,d);
          if(!dest)continue;
          const ns=state.map((a,k)=>k===i?{x:dest.x,y:dest.y,e:a.e}:a);
          const key=ns.map(a=>a.x+','+a.y).join('|');
          if(seen.has(key))continue;
          seen.add(key);
          const np=[...path,{i,d}];
          if(tutIsGoal(ns))return np;
          next.push({state:ns,path:np});
          if(seen.size>20000)return null;
        }
      }
    }
    frontier=next;
  }
  return null;
}
function runTutorialDemo(){
  if(!(lv===0&&tut===0))return;
  const path=solveFull(LV.p+2);
  if(!path||!path.length)return;
  const savedTut=tut;tut=2;demoMode=true;
  const origAtoms=atoms.map(a=>({x:a.x,y:a.y,e:a.e,ph:a.ph}));
  const origMoves=moves;
  let step=0;
  function playStep(){
    if(step>=path.length){
      setTimeout(()=>{
        tutHandTo(0,0,false);
        setTimeout(()=>{
          atoms.forEach((a,k)=>{a.x=origAtoms[k].x;a.y=origAtoms[k].y;});
          moves=origMoves;hist=[];demoMode=false;tut=0;shake=0;
          updateHUD();
          say(t('tutTurn'),'happy',5000);
        },1000);
      },1000);
      return;
    }
    const{i,d}=path[step];
    const fromX=atoms[i].x,fromY=atoms[i].y;
    tutHandTo(fromX,fromY,true);
    setTimeout(()=>{
      const dest=slideDest(i,d);
      move(i,d);
      const dist=dest?Math.abs(dest.x-fromX)+Math.abs(dest.y-fromY):0;
      if(dest)tutHandTo(dest.x,dest.y,true);
      step++;
      setTimeout(playStep,260+dist*55+180);
    },750);
  }
  playStep();
}

/* ================= MAIN LOOP ================= */
let lastT=performance.now(),perfWindowStart=lastT,perfFrames=0,perfSlowWindows=0;
function updatePerformanceGovernor(t){
  if(save.performanceMode!=='auto')return;
  perfFrames++;
  const span=t-perfWindowStart;
  if(span<3000)return;
  const fps=perfFrames*1000/Math.max(1,span);
  if(fps<47)perfSlowWindows++;else if(fps>55)perfSlowWindows=Math.max(0,perfSlowWindows-1);
  const shouldLow=perfSlowWindows>=2;
  if(document.body.classList.contains('mxPerfLow')!==shouldLow){
    document.body.classList.toggle('mxPerfLow',shouldLow);
    fxResize();if(scr.game.classList.contains('on'))resize();
  }
  perfFrames=0;perfWindowStart=t;
}
function loop(t){
  if(document.hidden){lastT=t;requestAnimationFrame(loop);return;}
  const dt=Math.min(50,t-lastT);lastT=t;updatePerformanceGovernor(t);
  if(scr.game.classList.contains('on')){
    renderBoard(t);
    if(curMol)drawMol($('#goalCv'),curMol,false,t);
    if((duelMode||crystalMode||chainMode||reactorMode)&&!won&&(!duelMode||!duelState.turnFinished)&&!onlineDuelConnectionPaused()){
      const limit=duelMode?DUEL_TIME_LIMIT:(crystalMode?CRYSTAL_TIME_LIMIT:(chainMode?CHAIN_TIME_LIMIT:REACTOR_TIME_LIMIT));
      const elapsedForTimer=reactorMode?reactorElapsedSeconds(t):(t-levelStartT)/1000;
      const remaining=Math.max(0,limit-elapsedForTimer);
      const txt=duelFormatTime(remaining);
      if(txt!==duelTimerText){
        duelTimerText=txt;const el=$('#duelTimer');
        if(el){el.textContent=txt;el.classList.toggle('urgent',remaining<=10);}
      }
      if(remaining<=0){if(duelMode)finishDuelTimeout();else if(crystalMode)finishCrystalTimeout();else if(chainMode)finishChainTimeout();else finishReactorTimeout();}
    }
  }
  renderFx(t,dt);
  requestAnimationFrame(loop);
}

/* ================= INPUT ================= */
let pd=null;
function nearestTouchableAtom(clientX,clientY){
  const r=board.getBoundingClientRect();
  let best=-1,bestD=T*.76;
  for(let i=0;i<atoms.length;i++){
    const dx=clientX-(r.left+(atoms[i].x+.5)*T),dy=clientY-(r.top+(atoms[i].y+.5)*T);
    const d=Math.hypot(dx,dy);if(d<bestD){bestD=d;best=i;}
  }
  return best;
}
board.addEventListener('pointerdown',e=>{
  e.preventDefault();
  try{board.setPointerCapture(e.pointerId);}catch(_){}
  pd={x:e.clientX,y:e.clientY,ai:nearestTouchableAtom(e.clientX,e.clientY),id:e.pointerId};
},{passive:false});
board.addEventListener('pointerup',e=>{
  if(!pd)return;
  const dx=e.clientX-pd.x,dy=e.clientY-pd.y;
  const dist=Math.max(Math.abs(dx),Math.abs(dy));
  if(dist<18){
    if(hammerMode&&!won){const cell=boardCellAt(e.clientX,e.clientY);attemptHammerAt(cell.x,cell.y);pd=null;return;}
    if(barrierMode&&!won){const cell=boardCellAt(e.clientX,e.clientY);attemptBarrierAt(cell.x,cell.y);pd=null;return;}
    if(pd.ai>=0&&!won){
      if(tutorialActive&&tutorialWaitTap!=null&&pd.ai!==tutorialWaitTap){pd=null;return;}
      sel=pd.ai;selT0=performance.now();SFX.select();mxHaptic('light');if(effectsAllowed()){const br=board.getBoundingClientRect(),a=atoms[sel];for(let q=0;q<7;q++)P({k:'glit',x:br.left+(a.x+.5)*T,y:br.top+(a.y+.5)*T,vx:Math.cos(q/7*Math.PI*2)*.65,vy:Math.sin(q/7*Math.PI*2)*.65,r:1.6,c:'#ffffff',life:.42,d:q*.018});}resetIdle();
      if(tut===0){tut=1;say(t('tutSlideMsg'),'happy',4200);}
      if(tutorialActive&&tutorialWaitTap!=null&&pd.ai===tutorialWaitTap){tutorialGoStep(3);}
    }
  }else if(dist>=18){
    const d=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
    // During the explanation/highlight phases the board must not move. A swipe on
    // the highlighted atom counts as selecting it, then the player repeats the
    // shown move. This prevents an early swipe from skipping the next tutorial step.
    if(tutorialActive&&tutorialWaitTap!=null){
      if(pd.ai===tutorialWaitTap){sel=pd.ai;selT0=performance.now();SFX.select();tutorialGoStep(3);}
      pd=null;return;
    }
    if(tutorialActive&&[1,2,6,7,9].includes(tutorialStep)){pd=null;return;}
    if(tutorialActive&&tutorialGuideDir!=null&&d!==tutorialGuideDir){pd=null;return;}
    if(pd.ai>=0)sel=pd.ai;
    move(sel,d);
  }
  pd=null;
},{passive:false});
board.addEventListener('pointercancel',()=>{pd=null;},{passive:true});
[['#dU',0],['#dR',1],['#dD',2],['#dL',3]].forEach(([id,d])=>{
  $(id).addEventListener('pointerdown',e=>{e.preventDefault();
    if(tutorialActive&&tutorialWaitTap!=null)return;
    if(tutorialActive&&[1,2,6,7,9].includes(tutorialStep))return;
    if(tutorialActive&&tutorialGuideDir!=null&&d!==tutorialGuideDir)return;
    move(sel,d);
  },{passive:false});
});
$('#btnUndo').addEventListener('pointerdown',e=>{e.preventDefault();if(tutorialActive)return;if(!save.seenUndoSupport){save.seenUndoSupport=true;persist();showSupportTutorial('undo',undo);return;}undo();},{passive:false});
$('#btnRestart').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();
  if(tutorialActive){const phase=tutorialStep>=8?8:2;loadTutorialPuzzle(phase===8?TUT_LEVEL_2:TUT_LEVEL_1);tutorialGoStep(phase);return;}
  if(duelMode){say(duelCopy().noRestart,'sad',2200,'shk');return;}
  const doRestart=()=>startLevel(lv,crystalMode?'crystal':(chainMode?'chain':(reactorMode?'reactor':(dailyMode?'daily':'campaign'))));
  const confirmRestart=()=>{openModal('<h3>🔄 '+(LANG==='tr'?'BÖLÜMÜ YENİDEN BAŞLAT?':'RESTART LEVEL?')+'</h3><div class="msub">'+(LANG==='tr'?'Bölüm başlangıç düzenine döner. Kullanılmış Çekiç ve Tek Kare Hareket geri verilmez.':'The level returns to its starting layout. Used Hammer and One-Square Move items are not restored.')+'</div><div class="mrow"><button class="btn amber" id="mRestartYes">'+(LANG==='tr'?'YENİDEN BAŞLAT':'RESTART')+'</button><button class="btn ghost" id="mRestartNo">'+t('cancel')+'</button></div>');bindTap('#mRestartYes',()=>{closeModal();doRestart();});bindTap('#mRestartNo',()=>closeModal());};
  if(!save.seenRestartSupport){save.seenRestartSupport=true;persist();showSupportTutorial('restart',confirmRestart);return;}
  confirmRestart();
},{passive:false});
$('#btnHint').addEventListener('pointerdown',e=>{e.preventDefault();if(tutorialActive)return;if(duelMode){say(duelCopy().noHint,'sad',2200,'shk');return;}if(chainMode){say(chainCopy().noHint,'sad',2200,'shk');return;}if(reactorMode){say(reactorCopy().noHint,'sad',2200,'shk');return;}if(!save.seenHintSupport){save.seenHintSupport=true;persist();showSupportTutorial('hint',hint);return;}hint();},{passive:false});
$('#btnHammer').addEventListener('pointerdown',e=>{e.preventDefault();if(e.currentTarget.hidden||won||tutorialActive)return;if(!save.seenHammerSupport){save.seenHammerSupport=true;persist();showSupportTutorial('hammer',()=>$('#btnHammer').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));return;}if(boosterCount('hammer')<1){buyBooster('hammer',()=>{syncHammerUi();say(LANG==='tr'?'Çekiç satın alındı. Şimdi çatlak duvara dokun.':'Hammer purchased. Now tap a cracked wall.','happy',3000,'glow');});return;}if(precisionMode)cancelPrecision();if(barrierMode)cancelBarrier();hammerMode=!hammerMode;SFX.select();mxHaptic('light');syncHammerUi();if(hammerMode)say(LANG==='tr'?'Kırmak için çatlak duvara dokun.':'Tap the cracked wall to break it.','talk',2600,'glow');},{passive:false});
$('#btnPrecision').addEventListener('pointerdown',e=>{e.preventDefault();if(e.currentTarget.hidden||won||tutorialActive)return;if(!save.seenPrecisionSupport){save.seenPrecisionSupport=true;persist();showSupportTutorial('precision',()=>$('#btnPrecision').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));return;}if(boosterCount('precision')<1){buyBooster('precision',()=>{syncPrecisionUi();say(LANG==='tr'?'Tek Kare Hareket satın alındı. Atomu seçip yön ver.':'One-Square Move purchased. Select an atom and choose a direction.','happy',3200,'glow');});return;}if(hammerMode)cancelHammer();if(barrierMode)cancelBarrier();precisionMode=!precisionMode;SFX.select();mxHaptic('light');syncPrecisionUi();if(precisionMode)say(LANG==='tr'?'Atomu seç, sonra yön ver. Atom yalnızca 1 kare ilerler.':'Select an atom, then choose a direction. It will move exactly 1 square.','talk',3000,'glow');},{passive:false});
$('#btnBarrier').addEventListener('pointerdown',e=>{e.preventDefault();if(e.currentTarget.hidden||won||tutorialActive||barrierUsed)return;if(!save.seenBarrierSupport){save.seenBarrierSupport=true;persist();showSupportTutorial('barrier',()=>$('#btnBarrier').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));return;}if(boosterCount('barrier')<1){buyBooster('barrier',()=>{syncBarrierUi();say(LANG==='tr'?'Nano Bariyer satın alındı. Boş bir kareye dokun.':'Nano Barrier purchased. Tap an empty tile.','happy',3000,'glow');});return;}if(hammerMode)cancelHammer();if(precisionMode)cancelPrecision();barrierMode=!barrierMode;SFX.select();mxHaptic('light');syncBarrierUi();if(barrierMode)say(LANG==='tr'?'Geçici blok koymak için boş bir kareye dokun.':'Tap an empty tile to place the temporary block.','talk',2800,'glow');},{passive:false});
$('#btnGear').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();SFX.click();if(tutorialActive)return;settingsModal();},{passive:false});
bindTap('#btnHome',e=>{SFX.click();if(tutorialActive){endTutorial(false);return;}if(duelMode){confirmQuitDuel();return;}if(crystalMode){confirmQuitCrystal();return;}if(chainMode){confirmQuitChain();return;}if(reactorMode){confirmQuitReactor();return;}show('splash');});
$('#lvHome').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('splash');},{passive:false});
$('#coHome').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('splash');},{passive:false});
$('#tutorialSkip').addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();endTutorial(false);},{passive:false});
$('#tutGo').addEventListener('pointerdown',e=>{e.preventDefault();
  $('#tutOverlay').classList.remove('on');
  SFX.click();
  $('#dpad').classList.add('pulse');
  say(t('goodLuck'),'happy',2500);
},{passive:false});
$('#splashGear').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();settingsModal();},{passive:false});
function whatsNewContent(){
  const tr=LANG==='tr';
  return tr?{
    title:'YENİLİKLER',back:'HAKKINDA GERİ DÖN',button:'YENİLİKLER NELER?',about:'HAKKINDA',version:'Sürüm',
    webButton:'OYUNUN WEB SAYFASI',accountButton:accountState.isAnonymous?'KAYIT OL / GİRİŞ YAP':'HESABIM',
    rankNote:'Dünya sıralamasındaki Kariyer RP puanın korunur. Bu Hafta ve Bu Ay sıralamalarında bütün oyuncular aynı UTC Günün Deneyi ile yarışır. Puanını yayımlamak için Google veya e-posta hesabıyla giriş yap.',
    html:'<section class="release latest"><h4>V8.5.54 — iOS TestFlight Fix</h4><ul><li>Firebase account bootstrap no longer blocks Google, Apple, or email sign-in while the guest session is still restoring.</li><li>The in-game Settings panel preserves the current level and uses a lighter native modal to prevent WebView reloads.</li><li>Dr. E and the speech bubble are repositioned above the iPhone safe area and bottom navigation.</li></ul></section><section class="release"><h4>V8.5.53</h4><ul><li>Geçersiz kalan kampanya başlangıç ipucu koordinatları sertifikalı çözümün ilk hamlesiyle yeniden eşleştirildi.</li><li>İpucu verisi bulunamazsa oyun artık güvenli biçimde sertifikalı ilk hamleye döner; boş veya hatalı atom seçmez.</li><li>Web önbelleği hafifletildi: oyun kodu ve temel görseller güvenli biçimde kurulur, büyük ses ve hikâye dosyaları kullanıldıkça önbelleğe alınır.</li><li>itch.io, Netlify ve Android paketleri aynı 8.5.53 kaynak setinden üretildi.</li></ul></section><section class="release"><h4>V8.5.52</h4><ul><li>Basınç kapısındaki şeffaf çizgili karenin açık kapı olduğu, düğmeden ayrılınca yeniden duvara dönüştüğü açıkça gösterilir.</li><li>Basınç düğmesi ve kapısı aynı harfle eşleştirildi; hareketli duvara ↔, portallara A/B ve kırılabilir duvara küçük çekiç işareti eklendi.</li><li>Oyun içindeki ? yardım ekranı artık yalnızca açık bölümde kullanılan özel mekanikleri ve görsel işaretlerini en üstte gösterir.</li><li>Eski oyunculara yalnızca görseli belirsiz mekaniklerin kısa ilk kullanım kartları bir kez yeniden gösterilir; ilerleme ve diğer eğitimler korunur.</li></ul></section><section class="release"><h4>V8.5.51</h4><ul><li>E-posta ile giriş başarısı bulut sıralama yayınından ayrıldı; hesap bağlandıktan sonra sıralama gecikmesi artık giriş hatası olarak gösterilmez.</li><li>Şimdi Senkronize Et, profil kaydı başarılıysa Classic veya Düello sıralaması beklemede olsa bile bulut kaydını başarılı kabul eder.</li><li>Android Google girişinde Credential Manager yerine daha uyumlu Google giriş yolu kullanılır; cihazda hesap yoksa anlaşılır uyarı gösterilir.</li><li>İlk bulut uzlaştırması gecikirse bir kez otomatik yeniden denenir ve hesap oturumu korunur.</li></ul></section><section class="release"><h4>V8.5.50</h4><ul><li>Google ve e-posta giriş akışları V8.5.49 ile aynı bırakıldı; Android paket kimliği com.whitewaystudio.moleculox olarak korundu.</li><li>Yıldırım yükü ile Zincir Reaksiyonu arasındaki fark ve Combo x2/x3 kuralı açıkça ayrıldı.</li><li>Keşfedilen bütün özel mekanikler Eğitim Merkezi’nde aynı altı dilde, tek kaynaktan ve kısa açıklamalarla gösterilir.</li><li>Nano Bariyer ve diğer destek eğitimleri altı dilde tamamlandı; otomatik karttan sonra tekrarlanan Einstein balonu kaldırıldı.</li><li>Çekiç için çağrılan güçlü titreşimin yanlışlıkla hafif çalışması düzeltildi.</li><li>Görünen stüdyo adı Google Play Console ile aynı biçimde wHiTeWaY studio olarak sabitlendi.</li></ul></section><section class="release"><h4>V5.0</h4><ul><li>Bulut ve Hesap Durumu paneli eklendi; bağlı giriş yöntemleri, son başarılı senkronizasyon, Classic Dünya Sırası ve Online Düello Sırası tek ekranda gösterilir.</li><li>Şimdi Senkronize Et düğmesi profil, Classic sıralaması ve Düello sıralamasını birlikte yeniler; misafir oyuncuya hesap bağlama durumu açıkça gösterilir.</li><li>Final sürümde Classic ilerleme, MoleCoin ekonomisi, laboratuvar teması, günlük kuantum ipucu, Dünya Sıralaması ve Düello Rank bulut alanları tek şemada eşitlendi.</li><li>Firestore kurallarındaki laboratuvar teması, ekonomi şeması ve kuantum ipucu alan eksikliği giderildi; tam profil senkronizasyonunun reddedilmesi önlendi.</li><li>Netlify, itch.io, Android ve iOS aynı Firebase projesinde ortak odaları, Hızlı Eşleşme kuyruğunu ve sıralamaları kullanacak şekilde son kontrolden geçirildi.</li><li>Apple, Google, e-posta ve misafir hesap ekranı küçük iPhone boyutları için korunurken bütün dosya, önbellek ve sürüm kayıtları V5.0 olarak eşitlendi.</li></ul></section><section class="release"><h4>V4.8.8</h4><ul><li>Apple, Google, e-posta ve oyuncu yönetimi bulunan hesap ekranı kısa ve dar iPhone ekranları için yeniden düzenlendi.</li><li>375×667 ekranda bütün giriş düğmeleri aynı anda görünür hale getirildi; 320×568 ekranda güvenli dikey kaydırma ve her zaman erişilebilir üst kapatma düğmesi eklendi.</li><li>Hesap kartı, uyarı metni, düğme aralıkları ve yazı boyutları ekran yüksekliğine göre otomatik küçülür.</li></ul></section><section class="release"><h4>V4.8.7</h4><ul><li>Apple ile Giriş; misafir, Google ve e-posta hesaplarıyla aynı Firebase oyuncu kaydını koruyacak şekilde eklendi.</li><li>Mevcut hesaba Apple bağlanmadan önce açık kullanıcı onayı gösterilir; bağlanan sağlayıcılar aynı Firebase UID ve aynı ilerlemeyi kullanır.</li><li>Web için Firebase Apple OAuth akışı ve native iOS için ID token + raw nonce giriş köprüsü eklendi.</li><li>Giriş ekranı Apple, Google, e-posta ve misafir akışlarını birlikte destekleyecek şekilde yenilendi.</li></ul></section><section class="release"><h4>V4.8.6</h4><ul><li>Netlify, itch.io, Android ve iOS sürümlerinin aynı Firebase projesi üzerinden ortak oda, Hızlı Eşleşme ve sıralama kullanması için platformlar arası yapı güçlendirildi.</li><li>Aynı kalıcı hesap iki cihazda açıkken dereceli Hızlı Eşleşmede kendi kendisiyle eşleşmesi engellendi; kodlu dostluk odaları bundan etkilenmez.</li><li>Android/iOS native Google girişinden alınan kimlik tokenını aynı Firebase hesabına bağlamak için güvenli giriş köprüsü eklendi.</li><li>Classic ilerleme, MoleCoin defteri, Düello Rank, ödüller, çerçeve ve unvanların aynı hesapta birleşme denetimleri yenilendi.</li></ul></section><section class="release"><h4>V4.8.5</h4><ul><li>Ödüller ekranı premium Düello Kariyer Merkezi olarak yenilendi; lig rozeti, aktif çerçeve, unvan ve bir sonraki lige ilerleme tek alanda gösterilir.</li><li>Dereceli maç, galibiyet, en iyi seri, kazanma oranı, haftalık ve aylık puan istatistikleri eklendi.</li><li>Sıradaki çerçeve ve unvan için ilerleme yol haritası, kilit şartları ve nadirlik seviyeleri eklendi.</li><li>Kupa Dolabı, lig rozetleri ve seçili ödül vitrini yeni parıltı, shimmer ve hareket efektleriyle geliştirildi.</li><li>Oyun içi sürüm, JavaScript/CSS sorguları ve servis worker önbelleği V4.8.5 olarak eşitlendi.</li></ul></section><section class="release"><h4>V4.8.0</h4><ul><li>Hızlı Eşleşme; Düello Puanı, yedi lig, galibiyet/mağlubiyet/beraberlik ve seri istatistikleriyle dereceli online moda dönüştürüldü.</li><li>Hall of Fame’e genel, haftalık ve aylık ayrı Düello Rank sıralaması eklendi.</li><li>Laboratuvara lig rozetleri, seçilebilir profil çerçeveleri, unvanlar ve kalıcı Kupa Dolabı içeren Ödüller sekmesi eklendi.</li><li>Kapanan hafta ve ayın ilk 10, ilk 3 ve şampiyon oyuncuları MoleCoin harcamadan ve ücretli Cloud Functions kullanmadan kozmetik kupa kazanır.</li><li>Kodlu arkadaş odaları ve aynı telefon düelloları dostluk maçı olarak kalır ve rank puanı vermez.</li></ul></section><section class="release"><h4>V4.7.0</h4><ul><li>Tüm menüler, düğmeler, animasyonlar, sesler, kampanya bölümleri, günlük deneyler ve düello sonuç akışları son sürüm denetiminden geçirildi.</li><li>Çevrim dışı açılışta sürüm sorgulu CSS ve JavaScript dosyalarının önbellekten bulunamamasına yol açabilen servis worker eşleşme hatası düzeltildi.</li><li>Hesap ve bulut verisi silme işlemi, herhangi bir bulut silme adımı başarısızsa hesabı yarım silinmiş durumda bırakmayacak şekilde güçlendirildi.</li><li>Gizlilik, kullanım şartları ve veri silme açıklamaları iki telefonlu online düello, hazır mesajlar, bağlantı durumu ve geçici oda verileriyle güncellendi.</li><li>İlk açılış dil verileri ile sayfa dil/başlık metadatası seçilen İngilizce veya Türkçe dile göre eşitlendi.</li><li>320 px genişlikte Laboratuvar başlığı ve geniş telefonlarda oyun içi sağ eylem düğmeleri taşmayacak şekilde hizalandı.</li><li>Kaydırma ve yıldız sesleri eksik parametreyle çağrılsa bile güvenli varsayılan kullanacak şekilde sağlamlaştırıldı.</li></ul></section><section class="release"><h4>V4.6.0</h4><ul><li>Atom Düellosu final ekranları tamamen yenilendi; kazanan ve kaybeden için ayrı görsel atmosferler eklendi.</li><li>Kazanan ekranda konfeti, parlayan kupa, Dr. E kutlaması ve kısa zafer müziği görür; kaybeden ekranda destekleyici Dr. E mesajı, gümüş atom rozeti ve kısa yeniden deneme müziği gösterilir.</li><li>Gerçek oyuncu adları, skor, raund geçmişi, rövanş ve ana menü işlemleri yeni tasarım içinde dinamik olarak korunur.</li></ul></section><details class="release"><summary>V4.5.0 — Bağlantı Koruması</summary><ul><li>Online düelloda iki telefonun bağlantısı yaklaşık 4,5 saniyede bir canlı olarak kontrol edilir.</li><li>Rakibin bağlantısı kesilirse oyun ve 90 saniyelik raund süresi durur; ekranda 30 saniyelik geri dönüş sayacı görünür.</li><li>Rakip zamanında dönerse aynı raund kaldığı yerden devam eder; dönmezse bağlı kalan oyuncu hükmen kazanır. İki oyuncu da koparsa maç sonuçsuz iptal edilir.</li></ul></details><details class="release"><summary>V4.4.0 — Tam Ekran Canlı Seyir</summary><ul><li>Rakibin oyunu telefon ekranını dolduran seyir modunda gösterilir.</li><li>Seçilen atom, hareket yönü ve kayma süresi karşı telefona aktarılır; atom aynı yönde animasyonla kayar.</li><li>Dr. E hap bilgileri ve hazır mesajlar canlı oyun ekranının altında korunur.</li></ul></details><details class="release"><summary>V4.3.0 — Canlı Düello ve Hazır Mesajlar</summary><ul><li>Online Atom Düellosunda rakibin atom hamlelerini küçük canlı tahta üzerinden izleme eklendi.</li><li>Bekleme sırasında Dr. E; moleküller, uzay, hayvanlar, bilim ve oyun taktikleri hakkında kısa hap bilgiler anlatır.</li><li>Oyuncular serbest yazı yerine güvenli hazır mesajlar gönderebilir: Merhaba, Bol şans, Güzel hamle, İyi oyundu, Rövanş ve Teşekkürler.</li></ul></details><details class="release"><summary>V4.2.0 — Hızlı Eşleşme</summary><ul><li>Atom Düellosuna üçüncü seçenek olarak Hızlı Eşleşme eklendi.</li><li>İki çevrim içi oyuncu bekleme kuyruğunda otomatik eşleşir ve oyun arka planda özel oda oluşturur.</li><li>Hızlı maçlar karışık oyun türü ve karışık zorlukla 3 raund oynanır; kampanya ve dünya sıralamasını etkilemez.</li></ul></details><details class="release"><summary>V4.1.0 — İki Telefonlu Online Düello</summary><ul><li>Atom Düellosuna iki farklı telefondan oynanan online oda sistemi eklendi.</li><li>Oda sahibi 6 haneli kod üretir; ikinci oyuncu kodla katılır ve sıra otomatik cihazlar arasında geçer.</li><li>Raund ve final skorları iki telefonda aynı anda görünür.</li></ul></details><details class="release"><summary>V4.0.3 — LAB ve Sıralama Ayrıntıları</summary><ul><li>LAB düğmesi ana menü butonlarından çıkarılıp sol tarafta VS düğmesinin tam üstündeki bağımsız kolona taşındı.</li><li>Dünya sıralaması satırlarında RP, tamamlanan bölüm, toplam yıldız, kusursuz bölüm ve doğrulanmış süre görünür hale getirildi.</li><li>Hall of Fame’e elle sıralama yenileme düğmesi eklendi ve Firebase liste önbellekleri zorunlu yenilemede temizleniyor.</li></ul></details><details class="release"><summary>V4.0.2 — Lab Butonu ve Premium Lab</summary><ul><li>Ana menüye animasyonlu tek bir LAB butonu eklendi.</li><li>Oyuncu laboratuvarındaki yerleştirilmiş ekipmanlar premium vitrin tabanları, glow efektleri ve yumuşak animasyonlarla güçlendirildi.</li></ul></details><details class="release"><summary>V4.0.1 — Shop Görsel Yükseltme</summary><ul><li>MoleCoin mağazasındaki ürün kartları yeni premium obje görselleriyle yenilendi.</li><li>Her mağaza ekipmanına kendine özel renk kimliği, glow efekti ve daha detaylı laboratuvar çizimi verildi.</li><li>Satın alma, laboratuvar yerleşimi ve oyun ekonomisi değiştirilmeden yalnızca görsel kalite yükseltildi.</li></ul></details><details class="release"><summary>V4.0.0 — Laboratuvar, Mağaza ve Nobel Yarışı</summary><ul><li>Oyuncunun laboratuvarı, MoleCoin mağazası ve Nobel Yarışı tek bir ilerleme merkezinde birleştirildi.</li><li>7 satın alınabilir laboratuvar ekipmanı, 3 araştırma seferi ve farklı laboratuvar temaları eklendi.</li><li>RP Dünya Sıralaması için korunurken MoleCoin harcama defteri bulut senkronizasyonuna karşı güvenli hale getirildi.</li><li>151. bölümü tamamlayan oyuncu Nobel Adayı olur; aylık sıralamanın 1 numarası Ayın Nobel Ödüllüsü olarak gösterilir.</li><li>Einstein haftalık ve aylık liderleri oyuncu adıyla duyurur; Hall of Fame canlı liderleri ve şampiyon arşivini gösterir.</li><li>İpucu ekonomisi, laboratuvar faydaları ve bölüm kartlarının görünümü yenilendi.</li></ul></details><details class="release"><summary>V3.14.3 — Bonus, Çıkış ve Tam Kontrol</summary><ul><li>Bonus Lab, bonus oyun başlangıçları ve Çıkış/Devam düğmeleri iPhone dokunmalarında güvenilir çalışacak şekilde yenilendi.</li><li>Kampanya, Günün Deneyi, Düello ve üç bonus türünün çıkış akışları yeniden doğrulandı.</li><li>135. bölümde kayıtlı çözümü durduran zombi-donma çakışması düzeltildi.</li><li>Yeni Oyun ad ekranına güvenli Vazgeç düğmesi eklendi.</li></ul></details><details class="release"><summary>V3.14.2 — Atom Düellosu Kompakt Arayüz</summary><ul><li>Atom Düellosu kurulum ekranı kompakt eski haline geri alındı.</li><li>Üstteki ikonlar ve açılır menü ikonları tekrar ilk boyutlarına döndürüldü.</li><li>V3.14.1’de fazla büyüyen ikon düzeni kaldırıldı; oyun mantığı değiştirilmedi.</li></ul></details><details class="release"><summary>V3.14.0 — Gelişen Classic Kampanya</summary><ul><li>151 bölüm, hedef geometrisi art arda tekrarlanmayacak şekilde yeniden sıralandı.</li><li>105 farklı molekül kullanıldı; tekrar eden moleküller arasında en az 36 bölüm bırakıldı.</li><li>İlk Katalizör, Zincir Reaksiyon ve Reaktör bonusları açıldıktan sonra bu mekanikler seçili Classic bölümlerde görünür.</li><li>Haritalar, başlangıç konumları ve kayıtlı çözümler korunurken atom renkleri ve molekül kimlikleri çeşitlendirildi.</li></ul></details><details class="release"><summary>V3.13.12 — Farklı Molekül Kombinasyonları</summary><ul><li>74–90 arasındaki tekrarlanan hedef geometrileri değiştirilmişti.</li></ul></details><details class="release"><summary>V3.13.11 — Zor ve Benzersiz Bölümler</summary><ul><li>Tekrar eden 50 kampanya bölümü, tamamen yeni ve daha zor haritalarla değiştirildi.</li><li>Yeni bölümlerin minimum çözüm ortalaması 6,5 hamleden 8,9 hamleye yükseltildi.</li><li>İki atomlu bölümler 7, üç atomlu bölümler 9, dört atomlu bölümler 9–10 ve beş atomlu bölümler 10–12 hamlelik çözümlerle yeniden tasarlandı.</li></ul></details><details class="release"><summary>V3.13.10 — Son Arayüz Kontrolü</summary><ul><li>Günün Deneyi, başarı kartları ve oyuncu profillerindeki alakasız bonus nesneleri kaldırıldı.</li><li>Düello üst önizlemesi artık yalnızca seçilen oyun türünü gösterir ve seçim değişince anında eşleşir.</li><li>Tüm dosya, önbellek ve oyun içi sürüm numaraları 3.13.10 olarak eşitlendi.</li></ul></details><details class="release"><summary>V3.13.7 — Bonus Lab Görsel Paketi</summary><ul><li>Bonus Lab kartları, ödül ekranları, Düello tipi ikonları, Günün Deneyi kartı, başarı rozetleri ve oyuncu çerçeveleri yeni laboratuvar nesne stiline uyarlandı.</li></ul></details><details class="release"><summary>V3.13.6 — Reaktör Lazer Düzeltmesi</summary><ul><li>Reaktör Kaçışında aktif lazer artık uzaktaki atomu başlangıç noktasında kilitlemez.</li><li>Atom lazerin bir kare önüne kadar kayar; oyuncu oradan yön değiştirip ışının etrafından dolaşabilir.</li><li>3 saniyelik ceza yalnızca atom lazere bitişikken doğrudan ışına hamle yapılırsa uygulanır.</li><li>Lazer yayıcıları, zemin yansıması ve açılmadan önce sarı uyarı efekti eklendi.</li></ul></details><details class="release"><summary>V3.13.5 — Dr. E Oyuncu Adı</summary><ul><li>Dr. E misafir hesaplara “Misafir”, bağlı hesaplara gerçek kullanıcı adıyla hitap eder.</li></ul></details><details class="release"><summary>V3.13.3 — Dünya Sıralaması Onarımı</summary><ul><li>Eski Android sürümlerinde geride kalabilen Dünya Sıralaması kaydı için otomatik onarım eklendi.</li><li>Yerel ve bulut ilerleme birleştirilip sıralama zorunlu olarak yenilenir.</li></ul></details><details class="release"><summary>V3.13.2 — Katalizör Avı</summary><ul><li>Kristal Avı, laboratuvar temasına uygun Katalizör Avı olarak yenilendi.</li><li>Katalizör, Enerji Hücresi ve Stabilizatör adlı üç farklı reaksiyon bileşeni eklendi.</li></ul></details><details class="release"><summary>V3.13.1 — Bölüm Numaraları</summary><ul><li>Bölüm seçim ekranındaki açık ve kilitli 151 bölümün tamamına görünür bölüm numarası eklendi.</li><li>Kilit simgesi korunurken bölüm numarası kartın üst kısmında okunabilir şekilde gösterilir.</li></ul></details><details class="release"><summary>V3.13.0 — Bonus Bölümleri ve Madalyalar</summary><ul><li>Her 10 kampanya bölümünde Katalizör Avı, Zincir Reaksiyon veya Reaktör Kaçışı bonus görevi açılır.</li><li>İlk tamamlamada 1 Bonus Madalyası, 50 MoleCoin ve 100 Kariyer RP verilir; tekrarlar ödül vermez.</li><li>3/6/9/12/15 madalyada kalıcı görsel ödüller açılır.</li></ul></details><details class="release"><summary>V3.12.0 — Reaktör Kaçışı</summary><ul><li>Üç zamanlı lazer kapılı Reaktör Kaçışı tek oyuncu ve düelloya eklendi.</li></ul></details><details class="release"><summary>V3.11.0 — Zincir Reaksiyon</summary><ul><li>Parlayan doğru hamleyle Combo x2 / x3 oluşturan Zincir Reaksiyon Bonus Lab ve Düello modu eklendi.</li></ul></details><details class="release"><summary>V3.10.0 — Katalizör Avı altyapısı</summary><ul><li>Üç reaksiyon bileşenini toplayıp hedef molekülü oluşturduğun Bonus Lab altyapısı eklendi.</li><li>Bu toplama modu tek oyuncuya ve Atom Düellosuna bağlandı.</li></ul></details><details class="release"><summary>V3.9.2 — VS düğmesi</summary><ul><li>VS düğmesi yukarı alındı ve kupa simgesiyle aynı yumuşak animasyona kavuştu.</li></ul></details><details class="release"><summary>V3.9.0 — Atom Düellosu</summary><ul><li>Tek telefonda sırayla oynanan iki oyunculu Atom Düellosu eklendi.</li><li>Düello sonuçları kampanya, coin ve dünya sıralamasını etkilemez.</li></ul></details><details class="release"><summary>V3.8.4 — Kalıcı Firebase oturumu</summary><ul><li>Firebase oturumu itch.io dahil desteklenen tarayıcılarda kalıcı olarak geri yüklenir.</li><li>Kaydedilmiş Google veya e-posta oturumu kontrol edilmeden yeni misafir hesap oluşturulmaz.</li></ul></details><details class="release"><summary>V3.8.3 — Çapraz platform güvenli senkronizasyon</summary><ul><li>Aynı Google veya e-posta hesabı kullanıldığında itch.io, Netlify ve Android ilerlemeleri tek oyuncu profilinde birleşir.</li><li>Bölüm yıldızları, moleküller, başarımlar, en iyi süreler ve en iyi hamleler artık alan alan güvenle senkronize edilir.</li><li>Araştırma Puanı, birleşen bölüm/başarım/günlük kayıtlarından yeniden hesaplanır; aynı puan farklı platformlardan iki kez eklenmez.</li><li>Eski veya çevrimdışı kalan bir cihaz, daha yeni bulut ilerlemesini geriye düşüremez.</li></ul></details><details class="release"><summary>V3.8.2 — Benzersiz bölümler ve Günün Deneyi</summary><ul><li>151 kampanya bölümü benzersiz hale getirildi.</li><li>832 gün tekrar etmeyen, çözücü onaylı otomatik Günün Deneyi eklendi.</li></ul></details><details class="release"><summary>V3.8.1 — Kariyer ve laboratuvar ilerlemesi</summary><ul><li>Her 20 bölümde terfi ve laboratuvar gelişimi geri getirildi.</li><li>Nobel Adayı ve Nobel Ödüllü kariyer aşamaları eklendi.</li></ul></details><details class="release"><summary>Önceki sürümler</summary><ul><li>150 + 1 Nobel kampanyası, adil sıralama, hamle dereceleri, otomatik çözücü ve Araştırma Puanı eklendi.</li></ul></details>'
  }:{
    title:"WHAT'S NEW",back:'BACK TO ABOUT',button:"WHAT'S NEW?",about:'ABOUT',version:'Version',
    webButton:'GAME WEB PAGE',accountButton:accountState.isAnonymous?'SIGN UP / SIGN IN':'MY ACCOUNT',
    rankNote:'Your Career RP in the World Ranking is preserved. This Week and This Month use the same UTC Daily Experiment for every player. Sign in with Google or email to publish your score.',
    html:'<section class="release latest"><h4>V8.5.53</h4><ul><li>Twenty stale campaign starting-hint coordinates were re-linked to the first move of their existing certified solutions.</li><li>If a stored hint is unavailable, the game now safely falls back to the certified first move instead of selecting an empty or invalid tile.</li><li>Web caching is lighter and more reliable: core code and essential visuals install first, while large audio and story assets are cached as they are used.</li><li>itch.io, Netlify, and Android packages are generated from the same 8.5.53 source set.</li></ul></section><section class="release"><h4>V8.5.52</h4><ul><li>The striped transparent pressure-door tile is now clearly explained as an open door that becomes a wall again when its switch is released.</li><li>Pressure switches and doors share matching letters; moving walls show ↔, portals show A/B, and breakable walls carry a small hammer marker.</li><li>The in-level help screen now puts only the mechanics used by the current puzzle at the top.</li><li>Existing players see one short refresher only for visually ambiguous mechanics; progression and other tutorials remain untouched.</li></ul></section><section class="release"><h4>V8.5.51</h4><ul><li>Email sign-in success is separated from delayed ranking publication, so a connected account is no longer shown as a failed login.</li><li>Sync Now accepts a successful profile save even when Classic or Duel ranking publication is still pending.</li><li>Android Google sign-in uses the more compatible Google flow and shows a clear message when no device credential is available.</li><li>The first cloud reconciliation is retried once when delayed, while the signed-in account is preserved.</li></ul></section><section class="release"><h4>V8.5.49</h4><ul><li>Smart first-use cards now also appear when Catalyst Hunt, Chain Reaction, or Reactor Escape is opened directly.</li><li>Existing test saves reopen only the clarified Lightning, Impact/Reactor, Chain, and Nano Barrier lessons once; other tutorials are not reset.</li><li>Detailed mechanic training now displays text in all six game languages.</li><li>The studio name now matches Google Play Console exactly: wHiTeWaY studio.</li></ul></section><section class="release"><h4>V5.0</h4><ul><li>The final build synchronizes Classic progress, MoleCoin economy, laboratory theme, daily quantum hint state, World Ranking and Duel Rank through one cross-platform cloud schema.</li><li>Firestore rules now explicitly allow and validate the laboratory theme, economy schema and quantum hint fields, preventing complete profile merges from being rejected.</li><li>Netlify, itch.io, Android and iOS were re-audited to share the same Firebase project, online rooms, Quick Match queue and ranking collections.</li><li>Apple, Google, email and guest account flows retain the compact iPhone layout, while active files, cache names and version labels are synchronized to V5.0.</li></ul></section><section class="release"><h4>V4.8.6</h4><ul><li>Cross-platform support was hardened so Netlify, itch.io, Android and iOS builds share the same Firebase rooms, Quick Match queue and rankings.</li><li>Two devices using the same permanent account can no longer match each other in ranked Quick Match; friendly code rooms are unchanged.</li><li>A secure Firebase credential bridge was added for native Android/iOS Google ID tokens.</li><li>Classic progress, MoleCoin ledger, Duel Rank, rewards, frames and titles were rechecked for same-account merging.</li></ul></section><section class="release"><h4>V4.8.5</h4><ul><li>The Rewards screen was rebuilt as a premium Duel Career Center with league badge, active frame, title and next-league progress in one place.</li><li>Ranked matches, wins, best streak, win rate, weekly points and monthly points statistics were added.</li><li>A next-frame and next-title roadmap, unlock requirements and rarity tiers were added.</li><li>The Trophy Cabinet, league badges and featured reward display gained new glow, shimmer and motion effects.</li><li>The in-game version, JavaScript/CSS queries and service-worker cache were synchronized to V4.8.5.</li></ul></section><section class="release"><h4>V4.8.0</h4><ul><li>Quick Match is now a ranked online mode with Duel Points, seven leagues, win/loss/draw records, and streak statistics.</li><li>Hall of Fame gained a separate Duel Rank table for all-time, weekly, and monthly competition.</li><li>The Laboratory gained a Rewards tab with league badges, selectable profile frames, titles, and a permanent Trophy Cabinet.</li><li>Closed weekly and monthly placements award cosmetic Top 10, podium, and champion trophies without spending MoleCoins or requiring paid Cloud Functions.</li><li>Code rooms and same-phone duels remain friendly and unranked.</li></ul></section><section class="release"><h4>V4.7.0</h4><ul><li>All menus, buttons, animations, audio cues, campaign levels, daily experiments and Duel result flows received a final release audit.</li><li>Fixed a service-worker cache matching issue that could prevent versioned CSS and JavaScript files from loading while offline.</li><li>Strengthened complete account deletion so the sign-in account is not removed when any required cloud-data deletion fails.</li><li>Updated privacy, terms and deletion disclosures for two-phone online Duels, preset messages, connection status and temporary room data.</li><li>Aligned initial language data and page language/title metadata with the selected English or Turkish language.</li><li>Adjusted the Laboratory header at 320 px and the in-game right action column on wider phones so controls remain inside the viewport.</li><li>Hardened slide and star audio cues with safe defaults if called without a parameter.</li></ul></section><section class="release"><h4>V4.6.0</h4><ul><li>Atom Duel final screens were completely redesigned with separate visual moods for winners and losers.</li><li>Winners see confetti, a glowing trophy, Dr. E celebrating, and a short victory jingle; losing players see a supportive Dr. E message, a silver atom badge, and a short retry cue.</li><li>Real player names, score, round history, rematch, and main-menu actions remain dynamic inside the new design.</li></ul></section><details class="release"><summary>V4.5.0 — Connection Protection</summary><ul><li>Online duel checks both devices with a live heartbeat approximately every 4.5 seconds.</li><li>If an opponent disconnects, the match and the 90-second round clock pause while a 30-second reconnect countdown is shown.</li><li>The same round resumes if the opponent returns in time; otherwise the connected player wins by forfeit. If both players disconnect, the match is cancelled without a result.</li></ul></details><details class="release"><summary>V4.4.0 — Full-Screen Live Spectator</summary><ul><li>The opponent’s game is shown in a phone-filling spectator view.</li><li>The selected atom, direction, and slide duration are sent to the other phone and replayed as an animation.</li><li>Dr. E facts and preset messages remain available below the live board.</li></ul></details><details class="release"><summary>V4.3.0 — Live Duel and Preset Messages</summary><ul><li>Online Atom Duel now shows the opponent’s atom positions on a compact live spectator board.</li><li>While waiting, Dr. E rotates short facts about molecules, space, animals, science, and game tactics.</li><li>Players can send safe preset messages instead of free text: Hello, Good luck, Nice move, Good game, Rematch, and Thanks.</li></ul></details><details class="release"><summary>V4.2.0 — Quick Match</summary><ul><li>Quick Match was added as the third Atom Duel option.</li><li>Two online players are matched automatically and the game creates a private room in the background.</li><li>Quick matches use mixed games and mixed difficulty across three rounds without affecting campaign progress or rankings.</li></ul></details><details class="release"><summary>V4.1.0 — Two-Phone Online Duel</summary><ul><li>Atom Duel gained online rooms played from two different phones.</li><li>The host creates a 6-digit code and the second player joins with it.</li><li>Turns and results synchronize automatically between both devices.</li></ul></details><details class="release"><summary>V4.0.3 — LAB and Ranking Details</summary><ul><li>The LAB button was removed from the main button stack and docked in the left-side column directly above VS.</li><li>World Ranking rows now show RP, completed levels, total stars, perfect levels, and validated solve time.</li><li>A manual ranking refresh button was added to Hall of Fame, and Firebase ranking caches are cleared during forced refresh.</li></ul></details><details class="release"><summary>V4.0.2 — Lab Button and Premium Lab</summary><ul><li>A single animated LAB button was added to the main menu.</li><li>Placed equipment inside the player laboratory received premium display bases, glow effects, and gentle ambient animation.</li></ul></details><details class="release"><summary>V4.0.1 — Shop Visual Upgrade</summary><ul><li>The MoleCoin shop product cards were refreshed with more premium-looking object art.</li><li>Each shop item now has its own color identity, glow treatment, and more detailed laboratory illustration.</li><li>Only the visual quality changed; purchasing flow, lab placement, and the game economy remain intact.</li></ul></details><details class="release"><summary>V4.0.0 — Laboratory, Shop and Nobel Race</summary><ul><li>The Player Laboratory, MoleCoin shop, and Nobel Race now form one clear progression hub.</li><li>Seven purchasable lab upgrades, three research expeditions, and multiple laboratory themes were added.</li><li>RP remains the World Ranking score while the MoleCoin spending ledger is protected across cloud merges.</li><li>Completing level 151 makes the player a Nobel Candidate; the monthly #1 is displayed as the Monthly Nobel Laureate.</li><li>Einstein announces weekly and monthly leaders by player name, while Hall of Fame shows live leaders and champion records.</li><li>The hint economy, lab benefits, and campaign level cards were refreshed.</li></ul></details><details class="release"><summary>V3.14.3 — Bonus, Exit and Full Audit</summary><ul><li>Bonus Lab, bonus starts, and Quit/Continue controls were made reliable for iPhone taps.</li><li>Exit flows for Campaign, Daily Experiment, Duel, and all three bonus modes were revalidated.</li><li>A zombie-freeze conflict that blocked the certified solution of level 135 was fixed.</li><li>A safe Cancel button was added to the New Game name screen.</li></ul></details><details class="release"><summary>V3.14.2 — Compact Atom Duel UI</summary><ul><li>The Atom Duel setup screen was rolled back to the original compact layout.</li><li>The top-row icons and dropdown icons were restored to their first, smaller size.</li><li>The oversized V3.14.1 icon treatment was removed; game logic was not changed.</li></ul></details><details class="release"><summary>V3.14.0 — Evolving Classic Campaign</summary><ul><li>All 151 chapters were reordered so the same target geometry never appears consecutively.</li><li>The campaign now uses 105 molecule identities, with at least 36 chapters between repeats.</li><li>After the first Catalyst, Chain Reaction, and Reactor bonuses unlock, those mechanics appear in selected Classic chapters.</li><li>Unique boards, starting positions, and certified solutions remain intact while atom colors and molecule identities gain much more variety.</li></ul></details><details class="release"><summary>V3.13.12 — Varied Molecular Topologies</summary><ul><li>Repeated target geometries across chapters 74–90 were replaced.</li></ul></details><details class="release"><summary>V3.13.11 — Harder Unique Chapters</summary><ul><li>50 repeated campaign chapters were replaced with completely new, harder boards.</li><li>The average minimum solution length of the replaced chapters increased from 6.5 to 8.9 moves.</li><li>New certified puzzles use 7 moves for two atoms, 9 for three atoms, 9–10 for four atoms, and 10–12 for five atoms.</li></ul></details><details class="release"><summary>V3.13.10 — Final Interface Check</summary><ul><li>Unrelated bonus objects were removed from the Daily Experiment, achievement cards, and player profiles.</li><li>The Duel preview now shows only the selected game type and updates immediately when the selection changes.</li><li>All file, cache, and in-game version numbers were synchronized to 3.13.10.</li></ul></details><details class="release"><summary>V3.13.7 — Bonus Lab Visual Pack</summary><ul><li>Bonus Lab cards, reward screens, duel-type icons, the Daily Experiment card, achievement badges, and player frames received the laboratory object style.</li></ul></details><details class="release"><summary>V3.13.6 — Reactor Laser Fix</summary><ul><li>Active lasers in Reactor Escape no longer freeze a distant atom at its starting square.</li><li>The atom slides to the square immediately before the beam, allowing the player to turn and route around it.</li><li>The 3-second penalty applies only when pushing directly into a beam from an adjacent square.</li><li>Laser emitters, floor reflection, and a short amber pre-activation warning were added.</li></ul></details><details class="release"><summary>V3.13.5 — Dr. E Player Name</summary><ul><li>Dr. E addresses guests as Guest and connected players by their actual username.</li></ul></details><details class="release"><summary>V3.13.3 — World Ranking Repair</summary><ul><li>Automatic repair was added for stale World Ranking rows from older Android releases.</li><li>Local and cloud progress is merged before the ranking is forcibly refreshed.</li></ul></details><details class="release"><summary>V3.13.2 — Catalyst Hunt</summary><ul><li>Crystal Hunt was redesigned as Catalyst Hunt with Catalyst, Energy Cell, and Stabilizer components.</li></ul></details><details class="release"><summary>V3.13.1 — Level Numbers</summary><ul><li>Visible chapter numbers were added to all 151 unlocked and locked cards on the Levels screen.</li><li>Locked cards keep their lock icon while showing the chapter number clearly above it.</li></ul></details><details class="release"><summary>V3.13.0 — Bonus Chapters and Medals</summary><ul><li>A Catalyst Hunt, Chain Reaction, or Reactor Escape bonus mission unlocks after every 10 campaign levels.</li><li>First completion awards 1 Bonus Medal, 50 MoleCoins, and 100 permanent Career RP; replays do not farm rewards.</li><li>Permanent visual rewards unlock at 3/6/9/12/15 medals.</li></ul></details><details class="release"><summary>V3.12.0 — Reactor Escape</summary><ul><li>Reactor Escape with three timed laser gates was added to solo and duel play.</li></ul></details><details class="release"><summary>V3.11.0 — Chain Reaction</summary><ul><li>Chain Reaction added charged moves that trigger Combo x2 / x3 in Bonus Lab and Atom Duel.</li></ul></details><details class="release"><summary>V3.10.0 — Catalyst Hunt foundation</summary><ul><li>Bonus Lab gained the collection-mode foundation used by Catalyst Hunt.</li><li>The collection mode was connected to solo play and Atom Duel.</li></ul></details><details class="release"><summary>V3.9.2 — VS button</summary><ul><li>The VS button was moved higher and matched to the trophy button animation.</li></ul></details><details class="release"><summary>V3.9.0 — Atom Duel</summary><ul><li>Two-player pass-the-phone Atom Duel was added.</li><li>Duel results never affect campaign progress, coins, or world rankings.</li></ul></details><details class="release"><summary>V3.8.4 — Persistent Firebase session</summary><ul><li>Firebase sessions are restored persistently in supported browsers, including itch.io embeds.</li><li>No new guest account is created before the saved Google or email session check has completed.</li></ul></details><details class="release"><summary>V3.8.3 — Safe cross-platform synchronization</summary><ul><li>When the same Google or email account is used, itch.io, Netlify and Android progress converges into one player profile.</li><li>Level stars, molecules, achievements, best times and best moves now merge safely field by field.</li><li>Research Points are rebuilt from merged level, achievement and daily records, preventing the same score from being counted twice across platforms.</li><li>An older or previously offline device can no longer overwrite newer cloud progress.</li></ul></details><details class="release"><summary>V3.8.2 — Unique levels and Daily Experiments</summary><ul><li>All 151 campaign levels became unique.</li><li>832 non-repeating, solver-certified automatic Daily Experiments were added.</li></ul></details><details class="release"><summary>V3.8.1 — Career and laboratory progression</summary><ul><li>Promotions and evolving laboratories return every 20 levels.</li><li>Nobel Candidate and Nobel Laureate career stages were added.</li></ul></details><details class="release"><summary>Earlier releases</summary><ul><li>The 150 + 1 Nobel campaign, fair rankings, move grades, the exact solver and Research Points were added.</li></ul></details>'
  };
}
function guideContent(){
  const tr=LANG==='tr';
  return tr?{
    title:'MOLECULOX NASIL OYNANIR?', close:'KAPAT',
    html:'<div class="guideIntro"><b>⚛️ Atomları it, molekülü oluştur, bilimi kurtar!</b><span>Bir atoma dokun ve yön ver. Atom bir duvara, başka bir atoma veya engelle karşılaşana kadar kayar.</span></div>'+ 
    '<section class="guideSection"><h4>🎯 TEMEL AMAÇ</h4><ul><li>GOAL kartındaki molekülün şeklinin aynısını oluştur.</li><li>GOAL kartının yavaş mavi parlaması hedefi hatırlatır; ışık hızlanıp turuncuya dönerse yalnızca bir doğru bağ kalmıştır.</li><li>Atomların doğru sırada ve doğru yönde birleşmesi gerekir.</li><li>PAR değerinde veya altında bitirirsen 3 yıldız kazanırsın.</li></ul></section>'+ 
    '<section class="guideSection"><h4>🧩 OYUNDA NELER VAR?</h4><div class="guideGrid"><article><b>301 Classic Bölüm</b><span>Giderek zorlaşan, farklı moleküller ve benzersiz tahtalar.</span></article><article><b>Özel Mekanikler</b><span>Donmuş, ateşli, yapışkan ve kırılgan atomlar; portallar, tek yönlü zeminler, hareketli duvarlar ve kapılar.</span></article><article><b>Bonus Lab</b><span>Katalizör Avı, Zincir Reaksiyonu ve Reaktörden Kaçış.</span></article><article><b>Atom Düellosu</b><span>Aynı telefonda, kodla iki telefonda veya dereceli hızlı eşleşmede yarış.</span></article></div></section>'+ 
    '<section class="guideSection"><h4>🪙 MOLECOIN VE YARDIMCILAR</h4><ul><li>Bölüm, görev ve ödüllerden MoleCoin kazan.</li><li>MoleCoin ile İpucu, Çekiç, Tek Kare Hareket ve Nano Bariyer al.</li><li>Nano Bariyer bölüm başına yalnızca 1 kez boş kareye konur ve ilk atom çarpışmasında kırılır.</li></ul></section>'+ 
    '<section class="guideSection fairPlay"><h4>🏆 ADİL REKABET KURALI</h4><p>Yardımcı kullanarak bölümü geçebilirsin; yıldızını, ödülünü ve ilerlemeni alırsın. Ancak Çekiç, Tek Kare Hareket veya Nano Bariyer kullanılan çözüm <b>en iyi hamle ve hız rekoru olarak kaydedilmez.</b> Kariyer ilerlemen ve genel puanın oynamaya devam ettiğin için korunur.</p><p>Rekor kırmak için bölümü yardımcısız tamamla.</p></section>'+ 
    '<section class="guideSection guideFx"><h4>✨ REAKSİYON VE WOW EFEKTLERİ</h4><ul><li>Doğru yeni bağda <b>REACTION</b>, art arda bağlarda <b>CHAIN REACTION</b>, son bağda <b>PERFECT BOND</b> görünür.</li><li>Kusursuz çözümler <b>BRILLIANT REACTION</b> veya <b>NOBEL MOVE</b> kutlaması açabilir.</li><li>Atomlar duvara çarptığında esner; Çekiç duvarı ses, toz ve taş parçalarıyla kırar; Nano Bariyer önce çatlar sonra enerji parçalarına ayrılır.</li><li>Sonuç ekranında tamamlanan molekül yükselip döner. Bu efektler oynanışı değiştirmez; başarılı hamlelerini daha güçlü hissettirir.</li></ul></section>'+ '<section class="guideSection"><h4>🔬 İLERLEME</h4><ul><li>Molekülleri keşfet, laboratuvarını geliştir ve Kariyer RP kazan.</li><li>Dünya sıralaması kalıcıdır; haftalık ve aylık yarışmalar ayrıca yenilenir.</li><li>Hesabını bağladığında Firebase ilerlemeni bütün cihazlarda korur.</li></ul></section>'
  }:{
    title:'HOW TO PLAY MOLECULOX', close:'CLOSE',
    html:'<div class="guideIntro"><b>⚛️ Push atoms, build molecules, save science!</b><span>Tap an atom and choose a direction. It slides until it meets a wall, another atom, or an obstacle.</span></div>'+ 
    '<section class="guideSection"><h4>🎯 MAIN GOAL</h4><ul><li>Build the exact molecule shape shown in the GOAL card.</li><li>A slow blue GOAL glow reminds you of the target; a faster warm-orange glow means only one correct bond remains.</li><li>Atoms must bond in the correct order and direction.</li><li>Finish at or below PAR to earn 3 stars. Extremely long clears earn 0 stars and 0 Career RP, but still unlock the next level.</li></ul></section>'+ 
    '<section class="guideSection"><h4>🧩 WHAT IS IN THE GAME?</h4><div class="guideGrid"><article><b>301 Classic Levels</b><span>Increasing difficulty, varied molecules, and unique boards.</span></article><article><b>Special Mechanics</b><span>Frozen, fire, sticky and fragile atoms; portals, one-way floors, moving walls and doors.</span></article><article><b>Bonus Lab</b><span>Catalyst Hunt, Chain Reaction, and Reactor Escape.</span></article><article><b>Atom Duel</b><span>Play on one phone, online with a code, or in ranked Quick Match.</span></article></div></section>'+ 
    '<section class="guideSection"><h4>🪙 MOLECOINS AND HELPERS</h4><ul><li>Earn MoleCoins from levels, missions, and rewards.</li><li>Spend them on Hints, Hammer, One-Square Move, and Nano Barrier.</li><li>Nano Barrier can be placed once per level on an empty tile and breaks on first atom collision.</li></ul></section>'+ 
    '<section class="guideSection fairPlay"><h4>🏆 FAIR COMPETITION RULE</h4><p>You may clear a level with a helper and still receive stars, rewards, and progression. However, a solution using Hammer, One-Square Move, or Nano Barrier is <b>not saved as a best-move or speed record.</b> Career progress and general score are still kept as you continue playing.</p><p>Complete the level without helpers to set a record.</p></section>'+ 
    '<section class="guideSection guideFx"><h4>✨ REACTION AND WOW EFFECTS</h4><ul><li>A correct new bond shows <b>REACTION</b>, consecutive bonds build <b>CHAIN REACTION</b>, and the final bond triggers <b>PERFECT BOND</b>.</li><li>Flawless clears may unlock <b>BRILLIANT REACTION</b> or <b>NOBEL MOVE</b>.</li><li>Atoms squash on impact; the Hammer breaks walls with sound, dust, and debris; Nano Barrier cracks before shattering into energy fragments.</li><li>The completed molecule rises and rotates on the result screen. These effects do not change puzzle rules; they make successful moves feel more powerful.</li></ul></section>'+ '<section class="guideSection"><h4>🔬 PROGRESSION</h4><ul><li>Discover molecules, improve your laboratory, and earn Career RP.</li><li>World Ranking is permanent; weekly and monthly competitions refresh separately.</li><li>Connect an account to keep Firebase progress across devices.</li></ul></section>'
  };
}
function openGuideModal(){
  const c=guideContent();
  openModal('<h3>📘 '+c.title+'</h3><div class="guideScroll">'+currentLevelMechanicsGuideHtml()+c.html+'</div><div class="mrow"><button class="btn green" id="mGuideClose">'+c.close+'</button></div>');
  $('#modalBox').classList.add('guideModal');
  $('#modalBox').classList.add('guideModal');
  bindTap('#mGuideClose',()=>closeModal());
}
function openAboutModal(){
  const c=whatsNewContent();
  openModal('<h3>ℹ️ '+c.about+'</h3><div class="aboutVersion">'+c.version+' <b>'+APP_VERSION+'</b></div><div class="msub aboutBody">'+t('aboutBody')+'</div><div class="aboutRankNote"><span>🏆</span><div>'+c.rankNote+'</div></div><div class="aboutActions"><a class="btn blue aboutWebLink" href="https://whitewayhan.itch.io/moleculox" target="_blank" rel="noopener noreferrer">🎮 '+c.webButton+'</a><button class="btn ghost aboutAccount" id="mAboutAccount">👤 '+c.accountButton+'</button></div><div class="mrow"><button class="btn blue aboutWhatsNew" id="mWhatsNew">✨ '+c.button+'</button><button class="btn" id="mAboutClose">'+t('close')+'</button></div>');
  $('#modalBox').classList.add('aboutModal');
  $('#mAboutAccount').addEventListener('pointerdown',ev=>{ev.preventDefault();SFX.select();openAccountModal();},{passive:false});
  $('#mWhatsNew').addEventListener('pointerdown',ev=>{ev.preventDefault();SFX.select();openWhatsNewModal();},{passive:false});
  bindTap('#mAboutClose',ev=>{closeModal();});
}
function openWhatsNewModal(){
  const c=whatsNewContent();
  openModal('<h3>✨ '+c.title+'</h3><div class="releaseScroll">'+c.html+'</div><div class="mrow"><button class="btn" id="mWhatsBack">‹ '+c.back+'</button><button class="btn ghost" id="mWhatsClose">'+t('close')+'</button></div>');
  $('#modalBox').classList.add('whatsNewModal');
  bindTap('#mWhatsBack',ev=>{SFX.back();openAboutModal();});
  bindTap('#mWhatsClose',ev=>{closeModal();});
}
$('#btnAbout').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();openAboutModal();},{passive:false});
$('#btnGuide').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();openGuideModal();},{passive:false});
const trainingDock=$('#btnTrainingDock');if(trainingDock)trainingDock.addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();trainingCenterModal();},{passive:false});
const moleculopediaDock=$('#btnMoleculopediaDock');if(moleculopediaDock)moleculopediaDock.addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();moleculopediaModal('mechanics');},{passive:false});
$('#btnLab').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();const go=()=>show('lab');if(!save.seenLabSupport){save.seenLabSupport=true;persist();showSupportTutorial('lab',go);return;}go();},{passive:false});
function setCollectionTab(tab){
  tab=tab||'molecules';
  document.querySelectorAll('[data-collection-tab]').forEach(b=>b.classList.toggle('on',b.dataset.collectionTab===tab));
  document.querySelectorAll('[data-collection-panel]').forEach(p=>p.classList.toggle('on',p.dataset.collectionPanel===tab));
  const sc=document.querySelector('#collectScr .collectionScroll');if(sc)sc.scrollTop=0;
}
document.querySelectorAll('[data-collection-tab]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();setCollectionTab(b.dataset.collectionTab);},{passive:false}));
$('#btnMols').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('collect');setCollectionTab('molecules');},{passive:false});
$('#btnAchv').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('collect');setCollectionTab('achievements');},{passive:false});
let __playGuard=false;
$('#btnPlay').addEventListener('pointerdown',e=>{e.preventDefault();if(__playGuard)return;__playGuard=true;setTimeout(()=>{__playGuard=false;},800);SFX.play();startLevel(Math.min(save.cur,LEVELS.length-1));},{passive:false});
$('#btnDaily').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();startDaily();},{passive:false});
$('#btnNew').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();
  openModal('<h3>👋 '+t('welcomeTitle')+'</h3><div class="msub">'+t('welcomeMsg')+'</div>'+
    '<input id="newNameInput" maxlength="18" placeholder="'+t('hofNamePh')+'" style="width:100%;margin:14px 0;padding:12px;border-radius:12px;border:1.5px solid var(--line);background:rgba(0,0,0,.3);color:#fff;font-size:16px;text-align:center;font-weight:800;font-family:inherit">'+
    '<div class="mrow"><button class="btn green" id="newNameGo">'+t('welcomeStart')+'</button><button class="btn ghost" id="newNameCancel">'+t('cancel')+'</button></div>');
  $('#newNameInput').focus();
  const go=async ()=>{
    const name=($('#newNameInput').value||'').trim().slice(0,18);
    if(!name)return;
    const goBtn=$('#newNameGo');
    // This wait-for-real-auth-state guard was present in the previous build
    // (added 2026-07-27) but is missing from this one — re-adding it. Without
    // it, reopening the app before Firebase finishes restoring the signed-in
    // session creates a brand-new blank profileId instead of finding the
    // account's existing cloud progress, which is exactly the "started from
    // scratch" bug reported on itch.io. The new per-level checkpoint system
    // (V8.1.6) reliably WRITES progress, but doesn't fix which profileId a
    // reopened session resolves to — the two need to work together.
    if(window.MXCloud&&goBtn){
      goBtn.disabled=true;goBtn.dataset.old=goBtn.textContent;
      goBtn.textContent=LANG==='tr'?'Hesap kontrol ediliyor…':'Checking account…';
      try{await Promise.race([window.MXCloud.ready,new Promise(r=>setTimeout(r,4000))]);}catch(e){}
      if(accountState&&!accountState.isAnonymous){try{await reconcileAccountProfiles();}catch(e){}}
      goBtn.disabled=false;goBtn.textContent=goBtn.dataset.old||goBtn.textContent;
    }
    closeModal();
    if(name===curProfile&&(save.cur>0||Object.keys(save.stars).length)){
      openModal('<h3>'+t('newGameTitle')+'</h3><div class="msub">'+t('newGameMsg',save.cur,save.coins)+'</div><div class="mrow"><button class="btn ghost" id="mWipe" style="color:var(--red)">'+t('wipe')+'</button><button class="btn" id="mCancel">'+t('cancel')+'</button></div>');
      $('#mWipe').addEventListener('pointerdown',ev=>{ev.preventDefault();
        save=Object.assign(defaultSave(),{playerName:name,volM:save.volM,volMu:save.volMu,volS:save.volS,volV:save.volV,muM:save.muM,muMu:save.muMu,muS:save.muS,muV:save.muV,externalMusic:save.externalMusic,dpad:save.dpad,lang:save.lang,profileId:save.profileId||genProfileId(),tutorialDone:false});
        persist();updateCoins();updateBadge();closeModal();tutorialLaunchArmed=true;enterGame();
      },{passive:false});
      $('#mCancel').addEventListener('pointerdown',ev=>{ev.preventDefault();SFX.click();closeModal();},{passive:false});
      return;
    }
    if(!profiles[name]&&Object.keys(profiles).length>=MAX_PROFILES){openModal('<h3>👥 '+t('profileLimit')+'</h3><div class="mrow"><button class="btn" id="mLimitClose">'+t('close')+'</button></div>');$('#mLimitClose').addEventListener('pointerdown',e=>{e.preventDefault();closeModal();},{passive:false});return;}
    if(!profiles[name])profiles[name]=Object.assign(defaultSave(),{playerName:name,profileId:genProfileId(),tutorialDone:false});
    curProfile=name;save=Object.assign(defaultSave(),profiles[name]);
    if(!save.profileId){save.profileId=genProfileId();}
    tutorialLaunchArmed=!save.tutorialDone&&!!String(save.playerName||'').trim();
    enterGame();
  };
  bindTap('#newNameGo',ev=>{go();});
  bindTap('#newNameCancel',ev=>{SFX.back();closeModal();});
  $('#newNameInput').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();go();}});
},{passive:false});
$('#btnLevels').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('levels');},{passive:false});
bindTap('#btnCrystalHunt',e=>{SFX.select();openBonusLab();});
$('#lvScrollArea').addEventListener('scroll',updateLvScrollThumb,{passive:true});
$('#btnCollect').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('collect');setCollectionTab('molecules');},{passive:false});
bindTap('#btnLabMenu',()=>{SFX.click();const go=()=>show('lab');if(!save.seenLabSupport){save.seenLabSupport=true;persist();showSupportTutorial('lab',go);return;}go();});
bindTap('#labBack',()=>{SFX.back();show(scrPrev==='game'?'game':'splash');});
bindTap('#labHome',()=>{SFX.click();show('splash');});
bindTap('#labCoinChip',()=>{SFX.click();setLabTab('shop');});
document.querySelectorAll('.labTab').forEach(b=>bindTap(b,()=>{SFX.click();setLabTab(b.dataset.labtab);}));
$('#btnDuel').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();openDuelSetup();},{passive:false});
$('#btnHof').addEventListener('pointerdown',e=>{e.preventDefault();SFX.select();show('hof');},{passive:false});
$('#hofNameInput').addEventListener('change',e=>{save.playerName=e.target.value.slice(0,18);persist();});
$('#hofNameInput').addEventListener('blur',e=>{save.playerName=e.target.value.slice(0,18);persist();});
$('#hofNameEdit').addEventListener('pointerdown',e=>{e.preventDefault();$('#hofNameInput').focus();});
$('#hofBack').addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();show(scrPrev==='game'?'game':'splash');},{passive:false});
$('#hofHome').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();show('splash');},{passive:false});
$('#lvBack').addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();show(scrPrev==='game'?'game':'splash');},{passive:false});
$('#coBack').addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();show(scrPrev==='game'?'game':'splash');},{passive:false});
document.addEventListener('keydown',e=>{
  if(!scr.game.classList.contains('on'))return;
  const k=e.key.toLowerCase();
  if(k==='arrowup'||k==='w')move(sel,0);
  else if(k==='arrowright'||k==='d')move(sel,1);
  else if(k==='arrowdown'||k==='s')move(sel,2);
  else if(k==='arrowleft'||k==='a')move(sel,3);
  else if(k==='tab'||k===' '){e.preventDefault();sel=(sel+1)%atoms.length;SFX.select();}
  else if(k==='u')undo();
  else if(k==='r'){if(duelMode)say(duelCopy().noRestart,'sad',2200,'shk');else startLevel(lv,crystalMode?'crystal':(chainMode?'chain':(reactorMode?'reactor':(dailyMode?'daily':'campaign'))));}
  else if(k==='h'){if(duelMode)say(duelCopy().noHint,'sad',2200,'shk');else if(chainMode)say(chainCopy().noHint,'sad',2200,'shk');else if(reactorMode)say(reactorCopy().noHint,'sad',2200,'shk');else hint();}
  else if(k==='escape')closeModal();
});
function unlock(){
  audioGestureSeen=true;
  if(externalMusicMode)return null;
  configureAudioSession();
  const ctx=ac();
  try{if(ctx&&ctx.state!=='running'){const r=ctx.resume();if(r&&r.catch)r.catch(()=>{});}}catch(e){}
  // A near-silent oscillator primes WebAudio on iPhone/WKWebView. It is
  // idempotent and does not create an audible click.
  if(ctx&&!audioPrimed){
    audioPrimed=true;
    try{
      const o=ctx.createOscillator(),g=ctx.createGain();
      g.gain.value=0.00001;o.connect(g);g.connect(ctx.destination);
      o.start();o.stop(ctx.currentTime+0.025);
    }catch(e){}
  }
  if(bootDone)musKick();
  return ctx;
}
// One idempotent unlock route prevents the same iPhone tap from rebuilding
// or racing the audio system through touchstart + pointerdown + touchend.
document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
document.addEventListener('touchstart',unlock,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    try{musicAudio.pause();}catch(e){}
    if(AC&&AC.state==='running')try{AC.suspend();}catch(e){}
    document.body.classList.add('mxAppPaused');
  }else setTimeout(()=>{
    document.body.classList.remove('mxAppPaused');
    lastT=performance.now();perfWindowStart=lastT;perfFrames=0;
    try{if(AC&&AC.state==='suspended')AC.resume();}catch(e){}
    applyVol();if(bootDone)musKick();
    scheduleLeaderboardRepair('app-resume',900,false);
    if(navigator.onLine!==false)setTimeout(()=>runConnectivityCloudSync('app-resume'),650);
  },100);
});
let connectivityCloudSyncPromise=null;
async function runConnectivityCloudSync(reason){
  if(connectivityCloudSyncPromise)return connectivityCloudSyncPromise;
  connectivityCloudSyncPromise=(async()=>{
    try{
      if(!window.MXCloud||!window.MXCloud.account||window.MXCloud.account.isAnonymous||navigator.onLine===false)return false;
      setSyncStatus('syncing');
      await window.MXCloud.ready;
      // Merge every local/cloud player first, then force the active profile write.
      await reconcileAccountProfiles();
      if(save&&save.profileId&&window.MXCloud.saveProgressNow){
        const merged=await window.MXCloud.saveProgressNow(save,save.profileId);
        if(merged)applyMergedCloudProfile(merged);
      }
      await syncFromCloud();
      markCloudSyncSuccess();
      setSyncStatus('saved');
      return true;
    }catch(e){
      console.warn('[sync] connectivity reconciliation failed:',reason,e&&e.code||e);
      setSyncStatus(navigator.onLine===false?'offline':'error');
      return false;
    }finally{connectivityCloudSyncPromise=null;}
  })();
  return connectivityCloudSyncPromise;
}
window.addEventListener('online',()=>{
  scheduleLeaderboardRepair('network-restored',500,true);
  setTimeout(()=>runConnectivityCloudSync('network-restored'),250);
},{passive:true});
window.addEventListener('offline',()=>setSyncStatus('offline'),{passive:true});
window.addEventListener('pageshow',()=>{if(navigator.onLine!==false)setTimeout(()=>runConnectivityCloudSync('pageshow'),500);},{passive:true});
document.addEventListener('touchmove',e=>{if(!e.target.closest('.scrollArea,.settingsScroll,.guideScroll,.modalScroll,.mxUniversalBody,.mtlist,input[type=\"range\"],textarea,select'))e.preventDefault();},{passive:false});
const MX_NATIVE=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
// Added 2026-07-26: iOS-specific flag (not just "any native platform"), so we
// can hide sign-in options that would otherwise force App Store Review
// Guideline 4.8 (Sign in with Apple parity) without touching Android/web.
const MX_IOS_NATIVE=!!(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='ios');
// Added 2026-07-26: Android has no native "Sign in with Apple" concept, and
// there's no Google Play equivalent of Apple's Guideline 4.8, so we simply
// don't offer Apple there. And on iOS specifically, only show Apple once the
// native plugin is actually installed — this way an App Store build shipped
// before the Capacitor/Firebase-Console setup is finished never shows a
// button that would just error when tapped; it silently falls back to
// Email-only until the native piece is wired up, then reappears on its own.
const MX_ANDROID_NATIVE=!!(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='android');
const MX_APPLE_NATIVE_READY=!!(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.FirebaseAuthentication&&typeof window.Capacitor.Plugins.FirebaseAuthentication.signInWithApple==='function');
const MX_SHOW_APPLE_BTN=!MX_ANDROID_NATIVE&&(!MX_IOS_NATIVE||MX_APPLE_NATIVE_READY);
// Added 2026-07-26: on the plain web build (not the iOS app itself), only
// show the Apple button to visitors actually on Apple hardware — checks
// both navigator.platform and userAgent since platform is being frozen/
// genericized in some browsers now, so either signal matching is enough.
// Inside the iOS app MX_IOS_NATIVE already guarantees Apple hardware, so
// this check is skipped there (redundant, and in-app WebView UA strings
// can be less reliable to sniff).
const MX_APPLE_DEVICE=MX_IOS_NATIVE||/Mac|iPhone|iPad|iPod/.test(String(navigator.platform||''))||/Mac|iPhone|iPad|iPod/.test(String(navigator.userAgent||''));
const MX_SHOW_APPLE_BTN_WEB=false; // Web edition: Google + email only
// Added 2026-07-30: push-notification registration for streak/return reminders.
// Follows the exact same defensive pattern as MX_APPLE_NATIVE_READY above: this
// checks for the @capacitor/push-notifications plugin at runtime and is a total
// no-op (no error, nothing shown) until that plugin is actually installed in the
// native iOS/Android project and `npx cap sync` has run. Safe to ship before
// that native-side step is done — see RELEASE notes for the exact remaining
// checklist (native plugin install, Firebase Console APNs key, Cloud Function
// deploy) since none of those can be done from this web-code repo alone.
const MX_PUSH_PLUGIN=()=>window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.PushNotifications;
async function mxInitPush(){
  if(!MX_NATIVE||!MX_PUSH_PLUGIN())return; // web build, or native plugin not installed yet
  if(save.pushDeclined)return; // user said no once on this device; do not re-nag every launch
  try{
    const Push=MX_PUSH_PLUGIN();
    const perm=await Push.checkPermissions();
    if(perm.receive==='prompt'){
      const req=await Push.requestPermissions();
      if(req.receive!=='granted'){save.pushDeclined=true;persist();return;}
    }else if(perm.receive!=='granted'){
      return; // previously denied at the OS level; do not prompt again ourselves
    }
    await Push.register();
    Push.addListener('registration',async token=>{
      try{
        if(window.MXCloud&&window.MXCloud.savePushToken){
          await window.MXCloud.savePushToken(token.value,MX_IOS_NATIVE?'ios':(MX_ANDROID_NATIVE?'android':'web'),LANG);
        }
      }catch(e){console.warn('[MXPush] token save failed:',e&&e.message);}
    });
    Push.addListener('registrationError',err=>console.warn('[MXPush] registration error:',err));
    // Foreground notification: keep it quiet (no system banner while playing),
    // matching how most puzzle games handle in-app foreground pushes.
    Push.addListener('pushNotificationReceived',()=>{});
  }catch(e){console.warn('[MXPush] init failed (non-fatal):',e&&e.message);}
}
// Ask once the player has actually reached the main menu (not on cold boot before
// they have even seen the game), matching the account-linking prompts' timing style.
window.addEventListener('load',()=>setTimeout(()=>{if(!MX_NATIVE)return;mxInitPush();},4000),{passive:true});
if(!MX_NATIVE)document.addEventListener('gesturestart',e=>e.preventDefault());
document.body.classList.toggle('mxNative',MX_NATIVE);document.body.classList.toggle('mxWeb',!MX_NATIVE);
const viewportRoot=document.documentElement;
let stableViewportWidth=window.innerWidth,stableViewportHeight=window.innerHeight;
function isTextEditing(){const a=document.activeElement;return !!(a&&a.matches&&a.matches('input,textarea,[contenteditable="true"]'));}
function applyStableViewport(force){
  if(isTextEditing()&&!force)return;
  const w=window.innerWidth||stableViewportWidth;
  const h=window.innerHeight||stableViewportHeight;
  stableViewportWidth=w;stableViewportHeight=h;
  viewportRoot.style.setProperty('--app-h',h+'px');
  viewportRoot.style.setProperty('--app-w',w+'px');
  window.scrollTo(0,0);
  fxResize();if(scr.game.classList.contains('on'))resize();
}
applyStableViewport(true);
window.addEventListener('resize',()=>applyStableViewport(false),{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(()=>applyStableViewport(true),320),{passive:true});
if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{if(!isTextEditing())applyStableViewport(false);},{passive:true});
document.addEventListener('focusout',e=>{if(e.target&&e.target.matches&&e.target.matches('input,textarea'))setTimeout(()=>applyStableViewport(true),320);},true);


/* V5.4 — unified touch feedback and accidental double-action protection */
(function installUnifiedPressFeedback(){
  const selector='button,.btn,[role="button"],.levelCard,.molCard';
  const clear=el=>{if(el&&el.classList)el.classList.remove('mxPressed');};
  document.addEventListener('pointerdown',e=>{
    const el=e.target.closest&&e.target.closest(selector);
    if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return;
    el.classList.add('mxPressed');
  },{passive:true});
  document.addEventListener('pointerup',e=>clear(e.target.closest&&e.target.closest(selector)),{passive:true});
  document.addEventListener('pointercancel',e=>clear(e.target.closest&&e.target.closest(selector)),{passive:true});
  document.addEventListener('pointerleave',e=>clear(e.target.closest&&e.target.closest(selector)),{capture:true,passive:true});
})();

/* itch.io on iPhone runs the game inside a third-party iframe. Safari may keep
   localStorage / IndexedDB unavailable until Storage Access is granted from a
   real user gesture. Ask once on the studio tap, then reload so profiles and
   Firebase auth are restored from persistent storage before the game starts. */
async function ensureItchPersistentStorage(){
  try{
    if(window.top===window.self || typeof document.requestStorageAccess!=="function") return true;
    if(typeof document.hasStorageAccess==="function" && await document.hasStorageAccess()) return true;
    await document.requestStorageAccess();
    const u=new URL(location.href);
    if(u.searchParams.get('mxStorageReady')!=='1'){
      u.searchParams.set('mxStorageReady','1');
      location.replace(u.toString());
      return false;
    }
    if(window.MXCloud&&typeof window.MXCloud.refreshPersistence==='function'){
      try{await window.MXCloud.refreshPersistence();}catch(e){}
    }
    return true;
  }catch(e){
    console.warn('[Moleculox] Embedded persistent storage unavailable:',e&&e.name);
    return true; // Never block the game if the player declines the permission.
  }
}

/* ================= INIT ================= */
applyMotionPrefs();
fxResize();
// Audio starts only after the player taps the studio logo (required by iPhone/Safari).
initHofTabs();
requestAnimationFrame(loop);
(function studioThenBootSequence(){
  const studio=$('#studioScr'),boot=$('#bootScr'),logo=$('#studioLogo'),tap=$('#studioTap');
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let studioStarted=false,logoReady=false,startRequested=false;

  function beginBootIntro(){
    studio.classList.remove('on');
    boot.classList.add('on','bootSequence');
    bootIntroStartedAt=performance.now();
    const scrim=$('#bootDarkScrim'),bulb=$('#bootBulbGlow'),playBtn=$('#btnBootPlay');
    let done=false,playShown=false;
    function finishVisuals(){if(done)return;done=true;scrim.classList.add('reveal');bulb.classList.add('on');boot.classList.add('bootFinished');showPlay();}
    function playLabCue(){
      if(startupCuePlayed||!audioGestureSeen)return;
      startStartupAudio().then(ok=>{if(!ok&&AC&&AC.state==='running'&&!startupCuePlayed){startupCuePlayed=true;SFX.labIntro();}});
    }
    function showPlay(){if(playShown)return;playShown=true;playBtn.classList.add('on','breathe');if(AC&&AC.state==='running')SFX.select();}
    if(audioGestureSeen)playLabCue();
    if(reduced){finishVisuals();}
    else{
      setTimeout(()=>{bulb.classList.add('on');if(AC&&AC.state==='running')SFX.bulbOn();},720);
      setTimeout(()=>{if(AC&&AC.state==='running')SFX.select();},1540);
      setTimeout(finishVisuals,3050);
    }
    let bootScrTapAt=0;
    const enterFromBoot=()=>{
      if(!playShown)return;
      try{SFX.play();}catch(_e){}
      bootPlay();
    };
    // 2026-07-28: removed SKIP entirely (button, function, and its global) along
    // with the PLAY button's own click listener. Neither ever needed to exist as
    // a separate control: tapping the screen while the animation is running
    // already finished the reveal on its own (that's the line below), and once
    // PLAY is showing, tapping anywhere enters the game. One tap target, no
    // per-element hit-testing history to fight.
    boot.addEventListener('click',e=>{
      const now=Date.now();
      if(now-bootScrTapAt<350)return;
      bootScrTapAt=now;
      unlock();playLabCue();
      if(!done){finishVisuals();return;}
      enterFromBoot();
    });
  }

  function tryUnlockAudio(){
    const first=!audioGestureSeen;
    const ctx=unlock();
    if(first&&ctx&&ctx.state==='running')SFX.click();
  }
  function startStudio(){
    startRequested=true;
    if(studioStarted||!logoReady)return;
    studioStarted=true;
    studio.classList.remove('ready');
    studio.classList.add('started');
    if(tap)tap.setAttribute('aria-hidden','true');
    setTimeout(()=>studio.classList.add('fadeOut'),4400);
    setTimeout(beginBootIntro,5000);
  }
  function markLogoReady(){
    if(logoReady)return;
    logoReady=true;studio.classList.add('ready');
    if(startRequested)startStudio();
  }

  if(logo&&logo.complete&&logo.naturalWidth>0)markLogoReady();
  else if(logo){logo.addEventListener('load',markLogoReady,{once:true});logo.addEventListener('error',markLogoReady,{once:true});setTimeout(markLogoReady,1500);}
  else markLogoReady();

  studio.addEventListener('pointerdown',async e=>{
    e.preventDefault();tryUnlockAudio();
    let storageOk=true;
    try{
      storageOk=await Promise.race([
        ensureItchPersistentStorage(),
        new Promise(res=>setTimeout(()=>res(true),2500))
      ]);
    }catch(err){storageOk=true;}
    if(!storageOk)return;
    startStudio();
  },{passive:false});
  studio.addEventListener('keydown',async e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();tryUnlockAudio();
      let storageOk=true;
      try{
        storageOk=await Promise.race([
          ensureItchPersistentStorage(),
          new Promise(res=>setTimeout(()=>res(true),2500))
        ]);
      }catch(err){storageOk=true;}
      if(!storageOk)return;
      startStudio();
    }
  });
})();
// V8.4.3: #btnBootPlay is a real green button with its own click listener.
// Once visible, the button and the remaining boot-screen area both enter the game.
$('#profileBack').addEventListener('pointerdown',e=>{e.preventDefault();SFX.back();bootPlay();},{passive:false});
$('#btnSwitchProfile').addEventListener('pointerdown',e=>{e.preventDefault();SFX.click();openAccountModal();},{passive:false});
// Fast repeated taps remain available. CSS touch-action: manipulation prevents
// browser double-tap zoom without swallowing legitimate game input.
})();
