'use strict';
// ===================== STUBS (headless, no DOM/canvas) =====================
let LANG='en';
const T=42;
const board={getBoundingClientRect:()=>({left:0,top:0,width:336,height:420})};
const P=()=>{};
const SFX=new Proxy({},{get:()=>()=>{}});
const mxHaptic=()=>{};
const say=()=>{};
const prop=()=>{};
const rnd=(arr)=>Array.isArray(arr)?arr[0]:arr;
const LN=new Proxy({},{get:()=>[]});
const t=()=>'';
const ml=()=>'';
const effectsAllowed=()=>false;
const motionReduced=()=>true;
let shake=0;
global.setTimeout=()=>{}; // neutralize delayed FX/restart callbacks; this harness is fully synchronous

// ===================== BOARD SIZE & DIRECTIONS (verbatim, game.js:47,50) =====================
const W=8,H=10;
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];

// ===================== MOLS_EN (verbatim extract, game.js:133-320) =====================
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

let MOLS=MOLS_EN;

// ===================== MUTABLE GAME STATE =====================
let lv=-1, LV=null, mid='', curMol=null, grid=[], atoms=[];
let moves=0;
let won=false;
let dailyMode=false, duelMode=false, crystalMode=false, chainMode=false, reactorMode=false;
let onlineDuelMode=false;
let fragileFailure=false;
let movingWallAnimating=false;
let breakableWalls=new Map(), portalPairs=new Map(), oneWayTiles=new Map(), movingWalls=[], pressureSystems=[];
let temporaryBarriers=new Map();
let linkedPairs=[], linkedMate=new Map();

// ===================== LEVEL-INDEX TABLES + PORTAL LAYOUTS (verbatim extract, game.js:3598-3639) =====================
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
// is disabled entirely rather than picking individual survivors. The four
// levels that DO use linked movement by design (167, 170, 176, 180) are
// unaffected — they declare it explicitly via level.linked, not this fallback.
const LINKED_ATOM_LEVELS=new Set([]);

// ===================== MECHANICS: derive*/apply*/portal/oneway/pressure/movingwall/breakablewall (verbatim extract, game.js:3641-3866) =====================
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
  bctx.fillStyle=on?'#eafff2':'#fff1bf';bctx.font='900 '+Math.round(T*.25)+'px system-ui';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText(on?'✓':'●',0,1);bctx.restore();
}
function drawPressureDoor(sys,t){
  const px=sys.door.x*T,py=sys.door.y*T,pulse=.65+.2*Math.sin(t/210+sys.door.y);
  bctx.save();
  if(sys.open){
    bctx.globalAlpha=.3;bctx.strokeStyle='#72ffb5';bctx.lineWidth=Math.max(2,T*.04);bctx.setLineDash([T*.12,T*.08]);rrect(bctx,px+T*.12,py+T*.12,T*.76,T*.76,Math.max(4,T*.1));bctx.stroke();bctx.setLineDash([]);
  }else{
    bctx.shadowColor='#ffbf5c';bctx.shadowBlur=8+5*pulse;drawStone(px,py,sys.door.x,sys.door.y);
    bctx.globalAlpha=.92;bctx.strokeStyle='#ffe0a0';bctx.lineWidth=Math.max(2,T*.04);for(let k=1;k<=3;k++){bctx.beginPath();bctx.moveTo(px+T*(.22*k),py+T*.18);bctx.lineTo(px+T*(.22*k),py+T*.82);bctx.stroke();}
  }
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
  bctx.globalAlpha=.85;bctx.strokeStyle='#ffd36e';bctx.lineWidth=Math.max(2,T*.045);bctx.setLineDash([T*.12,T*.08]);rrect(bctx,px+T*.12,py+T*.12,T*.76,T*.76,Math.max(4,T*.1));bctx.stroke();bctx.setLineDash([]);bctx.restore();
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

function barrierKey(x,y){return x+','+y;} // verbatim, game.js:3884

// ===================== slidePlan / slideDest (verbatim extract, game.js:5549-5559) =====================
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

function lightningBurst(){} // override: FX-only in original, no-op here

// ===================== CHECKS: lightning/zombie/stick/melt/fragile + original afterMove (verbatim extract, game.js:5648-5796; afterMove left defined but unused/dead) =====================
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

// ===================== HEADLESS DRIVER (my own code, built on the verbatim primitives above) =====================
function headlessMove(i,d){
  if(!atoms[i]) return {ok:false, reason:'no-such-atom'};
  if(atoms[i].frozen) return {ok:false, reason:'frozen-atom-cannot-move'};
  const linkedPlan = linkedMovePlan(i,d);
  let dest;
  if(linkedPlan){
    dest=linkedPlan.main;
  } else {
    const plan=slidePlan(i,d);
    dest=plan.dest;
    // barrierHit intentionally ignored: no booster ever places a barrier during a certified replay
  }
  if(!dest) return {ok:false, reason:'blocked-no-movement'};
  atoms[i].x=dest.x; atoms[i].y=dest.y;
  if(linkedPlan){ atoms[linkedPlan.j].x=linkedPlan.mate.x; atoms[linkedPlan.j].y=linkedPlan.mate.y; }
  const portal=portalDestination(atoms[i].x,atoms[i].y,i);
  if(portal){ atoms[i].x=portal.x; atoms[i].y=portal.y; }
  moves++;
  return {ok:true};
}

function advanceMovingWallsHeadless(){
  if(!movingWalls.length||won)return;
  const plans=[];
  for(const w of movingWalls){
    const ni=(w.index+1)%w.path.length,to=w.path[ni];
    if(!to||atoms.some(a=>a.x===to.x&&a.y===to.y))continue;
    if(grid[to.y]?.[to.x]&&!(to.x===w.x&&to.y===w.y))continue;
    plans.push({w,ni,to,from:{x:w.x,y:w.y}});
  }
  if(!plans.length)return;
  for(const p of plans){
    grid[p.from.y][p.from.x]=false;
    grid[p.to.y][p.to.x]=true;
    p.w.x=p.to.x; p.w.y=p.to.y; p.w.index=p.ni;
  }
}

function headlessAfterMove(movedIdx){
  if(movedIdx!==undefined) checkLightning(movedIdx);
  checkMelt();
  const moleculeReady = curMol.key === atoms.map(a=>a.e+','+(a.x-Math.min(...atoms.map(b=>b.x)))+','+(a.y-Math.min(...atoms.map(b=>b.y)))).sort().join('|');
  if(moleculeReady){ won=true; return {won:true}; }
  if(movedIdx!==undefined && checkFragileImpact(movedIdx)) return {won:false, fragileBroke:true};
  if(movedIdx!==undefined){ checkStick(movedIdx); checkZombie(movedIdx); }
  updatePressureDoors(false);
  advanceMovingWallsHeadless();
  return {won:false};
}

function initLevel(levelData, index, mode){
  lv=index; LV=levelData; mid=LV.m; curMol=MOLS[mid];
  dailyMode = (mode==='daily'); duelMode=false; crystalMode=false; chainMode=false; reactorMode=false;
  if(!curMol) throw new Error('unknown molecule id: '+mid);
  grid = LV.g.map(r=>[...r].map(c=>c==='1'));
  portalPairs = new Map(derivePortals(LV,index,mode).map(p=>[portalKey(p.x,p.y),p]));
  oneWayTiles = new Map(deriveOneWayTiles(LV,index,mode).map(o=>[oneWayKey(o.x,o.y),o]));
  movingWalls = deriveMovingWalls(LV,index,mode).map(w=>{const c=w.path[w.index||0];return {...w,x:c.x,y:c.y,anim:null};});
  pressureSystems = derivePressureSystems(LV,index,mode);
  breakableWalls = new Map(deriveBreakableWalls(LV,index,mode).map(w=>[breakableKey(w.x,w.y),{x:w.x,y:w.y,broken:false}]));
  temporaryBarriers = new Map();
  atoms = LV.a.map(a=>({x:a[0],y:a[1],e:a[2],frozen:!!a[3],fire:!!a[4],sticky:!!a[5],zombie:!!a[6],lightning:!!a[7],zombieGen:0}));
  applyLightningAtoms(LV,index,mode);
  applyFragileAtoms(LV,index,mode);
  applyLinkedAtoms(LV,index,mode);
  fragileFailure=false; movingWallAnimating=false; won=false; moves=0;
  updatePressureDoors(false);
  for(const f of atoms){ if(!f.fire)continue; for(const fr of atoms){ if(fr.frozen&&Math.abs(f.x-fr.x)+Math.abs(f.y-fr.y)===1)fr.frozen=false; } }
}

function verifyLevel(levelData, index, mode){
  try{
    initLevel(levelData, index, mode);
    const sol = levelData.fs;
    if(!Array.isArray(sol) || !sol.length){
      return {index, ok:false, reason:'no-recorded-solution'};
    }
    for(let k=0;k<sol.length;k++){
      const step = sol[k];
      const i=step[0], d=step[1];
      const r = headlessMove(i,d);
      if(!r.ok){
        return {index, ok:false, reason:'illegal-move-at-step-'+k, detail:r.reason, movesPlayed:k, mid:levelData.m};
      }
      const am = headlessAfterMove(i);
      if(am.fragileBroke){
        return {index, ok:false, reason:'fragile-atom-shattered-at-step-'+k, movesPlayed:k+1, mid:levelData.m};
      }
      if(am.won){
        return {index, ok:true, movesUsed:k+1, solutionLength:sol.length, par:levelData.p, minimum:levelData.mn, trailingUnusedMoves: sol.length-(k+1), mid:levelData.m};
      }
    }
    return {index, ok:false, reason:'solution-exhausted-without-win', movesPlayed:sol.length, mid:levelData.m};
  } catch(e){
    return {index, ok:false, reason:'exception', detail:String((e&&e.stack)||e), mid:levelData&&levelData.m};
  }
}

module.exports = { verifyLevel, MOLS_EN, W, H };

// ===================== RUNNER =====================
// Kullanım: bu dosyayı proje kökünde (js/campaign-levels.js ve js/daily-levels.js
// dosyalarının yanına) koy ve çalıştır:  node moleculox-bagimsiz-cozum-dogrulayici.js
if (require.main === module) {
  const fsN = require('fs');
  const pathN = require('path');
  global.window = global.window || {};
  let GAME_DIR = null;
  for (const c of [pathN.join(__dirname,'js'), __dirname]) {
    if (fsN.existsSync(pathN.join(c,'campaign-levels.js')) && fsN.existsSync(pathN.join(c,'daily-levels.js'))) { GAME_DIR = c; break; }
  }
  if (!GAME_DIR) {
    console.error('campaign-levels.js / daily-levels.js bulunamadi. Bu dosyayi proje kokune veya js/ klasorunun yanina koy.');
    process.exit(1);
  }
  eval(fsN.readFileSync(pathN.join(GAME_DIR, 'campaign-levels.js'), 'utf8'));
  eval(fsN.readFileSync(pathN.join(GAME_DIR, 'daily-levels.js'), 'utf8'));
  const CAMPAIGN = window.MX_CAMPAIGN_LEVELS || [];
  const DAILY = window.MX_DAILY_LEVELS || [];
  console.log('Kampanya bolumu:', CAMPAIGN.length, ' | Gunluk deney:', DAILY.length);

  function runSet(levels, mode, label){
    const results = levels.map((lvData, idx) => verifyLevel(lvData, idx, mode));
    const failures = results.filter(r => !r.ok);
    console.log('=== ' + label + ' ===  PASS:', results.length-failures.length, ' FAIL:', failures.length);
    for (const f of failures) console.log('  HATA ->', JSON.stringify(f));
    return failures.length;
  }
  const fail1 = runSet(CAMPAIGN, 'campaign', 'KAMPANYA (' + CAMPAIGN.length + ')');
  const fail2 = runSet(DAILY, 'daily', 'GUNLUK (' + DAILY.length + ')');
  const totalFail = fail1 + fail2;
  console.log('');
  console.log(totalFail === 0
    ? 'SONUC: ' + (CAMPAIGN.length+DAILY.length) + '/' + (CAMPAIGN.length+DAILY.length) + ' bolum bagimsiz motorla dogrulandi, sorun yok.'
    : 'SONUC: ' + totalFail + ' bolumde sorun tespit edildi, yukarodaki HATA satirlarina bak.');
  process.exit(totalFail === 0 ? 0 : 1);
}
