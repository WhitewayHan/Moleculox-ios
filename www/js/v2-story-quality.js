/* Moleculox V2 — curated French / Simplified Chinese story terminology and canon scenes. */
(function(root){
'use strict';
const universe=root.MX_STORY_UNIVERSE;
const campaign=root.MX_CAMPAIGN_LEVELS;
if(!universe)return;

function polishChinesePunctuation(value){
  return String(value)
    .replace(/,/g,'，').replace(/;/g,'；').replace(/\?/g,'？').replace(/!/g,'！')
    .replace(/([\u3400-\u9fff”’])\.(?=\s|$)/g,'$1。')
    .replace(/\s+([，。；：！？])/g,'$1').replace(/([，。；：！？])\s+/g,'$1');
}
function polishLocalizedRow(row){
  if(!row||typeof row!=='object'||typeof row.en!=='string')return;
  const source=row.en;
  const isCanonSound=row.fr===source&&row.zh===source&&/^[A-Za-z…!.,-]+$/.test(source);
  if(isCanonSound)return;
  let fr=String(row.fr==null?source:row.fr),zh=String(row.zh==null?source:row.zh);
  if(/\bNull\b/.test(source)){
    fr=fr.replace(/\bNul\b/g,'Null');
    zh=zh
      .replace(/(?:努尔|诺尔|纳尔|纽尔)教授/g,'Null教授')
      .replace(/(?:努尔|诺尔|纳尔|纽尔)博士/g,'Dr. Null')
      .replace(/零(?=[\s，。；：！？]|$)/g,'Null');
  }
  if(/\bMoxy\b/i.test(source))zh=zh.replace(/莫克西/g,'Moxy');
  if(/\bplayer\b/i.test(source))zh=zh.replace(/播放器/g,'玩家');
  if(/\bProfessor Null\b/i.test(source)){
    fr=fr.replace(/\bProfessor Null\b/gi,'professeur Null');
    zh=zh.replace(/Professor Null/gi,'Null教授');
  }
  if(/\bX-Bond\b/i.test(source)){
    fr=fr.replace(/\bX-Bond\b/gi,'liaison X');
    zh=zh.replace(/[“”"']?X-Bond[“”"']?/gi,'X键');
  }
  if(/\bbonds?\b/i.test(source)){
    fr=fr.replace(/\bliens?\b/gi,match=>/^L/.test(match)?'Liaison':'liaison').replace(/\bbon lien\b/gi,'bonne liaison');
    zh=zh.replace(/债券|纽带|联系|结合/g,'化学键').replace(/化学键能量/g,'键能');
  }
  if(/\bstation\b/i.test(source))zh=zh.replace(/电站|车站/g,'空间站');
  if(/\bportals?\b/i.test(source))zh=zh.replace(/门户网站|门户|门口(?=(?:实验室|系统|引擎|发动机))/g,'传送门');
  if(/\bchains?\b/i.test(source))zh=zh.replace(/链接|链路/g,'原子链');
  if(/\bfrozen\b/i.test(source))zh=zh.replace(/结的原子/g,'冻结原子').replace(/结了一些/g,'冻结了一些');
  if(/\bstabilizer\b/i.test(source))zh=zh.replace(/站稳剂/g,'稳定器');
  if(/\bresonance\b/i.test(source))zh=zh.replace(/响应/g,'共振');
  if(/\bfractures?\b/i.test(source))zh=zh.replace(/骨折/g,'裂缝');
  if(/\bGreat Unbonding\b/i.test(source)){
    fr=fr.replace(/Grande Déconnexion/gi,'Grande Déliaison');
    zh=zh.replace(/伟大的解约/g,'大断键事件');
  }
  if(/\bbutton\b/i.test(source))zh=zh
    .replace(/错误的按/g,'错误的按钮').replace(/庆祝按/g,'庆祝按钮')
    .replace(/红色的按/g,'红色按钮').replace(/平衡按/g,'平衡按钮')
    .replace(/那个按/g,'那个按钮').replace(/紧急平衡按/g,'紧急平衡按钮');
  if(/\bpendant\b/i.test(source))zh=zh.replace(/悬挂|吊(?!坠)/g,'吊坠');
  if(/\bring\b/i.test(source))zh=zh.replace(/戒指/g,'环');
  fr=fr.replace(/Moxys\b/g,'de Moxy').replace(/Dr\. Es\b/g,'de Dr. E').replace(/molécule Dr\. E\b/g,'molécule de Dr. E');
  row.fr=fr;row.zh=polishChinesePunctuation(zh);
}
function polishTree(value,seen){
  if(!value||typeof value!=='object')return;seen=seen||new Set();if(seen.has(value))return;seen.add(value);
  polishLocalizedRow(value);Object.values(value).forEach(child=>polishTree(child,seen));
}
polishTree(campaign);polishTree(universe);

if(universe.characters&&universe.characters.cat&&universe.characters.cat.name){
  universe.characters.cat.name.fr='LE CHAT DE DR. NULL';
  universe.characters.cat.name.zh='DR. NULL的猫';
}

const CAMPAIGN_STORY_OVERRIDES={
  178:{zh:'如果闪电传到正确的原子链上，另一份证据就会出现。'},
  179:{zh:'传送门打开了。Dr. E希望它通往斯德哥尔摩。'},
  191:{zh:'三重系统成功运转。没人看到Dr. E按错了按钮。'},
  194:{zh:'传送门抵达了正确地点。这次可不是扫帚间。'},
  203:{zh:'传送门、原子链和墙壁协同运作。这个奇迹被称为“协议”。'},
  210:{zh:'传送门测试开始。Dr. E把出口点标为“大约在这里”。'},
  221:{zh:'锤子的选择变得至关重要。Dr. E说每面墙看起来都很可疑。'},
  228:{fr:'Le professeur Null accrocha un panneau « FERMÉ » à la porte du laboratoire. Dr. E ouvrit la porte et le lut depuis l’intérieur.',zh:'Null教授在实验室门上挂了一块“关闭”标牌。Dr. E打开门，从里面读了这块牌子。'},
  229:{zh:'新的传送门测试开始了。Dr. E先传送了咖啡；回来时糖却不见了。'},
  234:{zh:'易碎原子再次出现裂纹。Dr. E给它作了一番鼓励演说；它却无动于衷。'},
  238:{zh:'传送门和移动墙同时启动。实验室的猫拒绝参与。'},
  241:{fr:'Le professeur Null cacha les marteaux. Dr. E trouva le marteau de secours sous son discours du Nobel.',zh:'Null教授把锤子藏了起来。Dr. E在自己的诺贝尔演讲稿下面找到了备用锤子。'},
  248:{zh:'Null教授把实验室地图倒挂起来。Dr. E误以为那是一种新的对称理论。'},
  251:{zh:'传送门移动了正确的原子，但Dr. E的钢笔又不见了。那支笔早已熟悉诺贝尔演讲稿。'},
  276:{fr:'Le portail déplaça le bon atome — et, par erreur, le chapeau du professeur Null.',zh:'传送门移动了正确的原子——还误传送了Null教授的帽子。'},
  278:{zh:'压力板打开了门。Dr. E对着按钮发表了感谢演说。'},
  280:{zh:'闪电击中时，锤子亮了起来。Dr. E立刻想在上面签名。'},
  281:{fr:'L’atome de feu réchauffa la chaîne. Le professeur Null apporta des marshmallows et fut exclu de l’expérience.',zh:'火焰原子加热了原子链。Null教授带来了棉花糖，随后被请出了实验现场。'},
  282:{zh:'冻结原子在传送门另一侧融化了。Dr. E称之为一次科学度假。'},
  284:{zh:'移动墙困住了原子链。锤子解决了问题；桌子却没能幸免。'},
  285:{zh:'传送门开启，火焰穿过，门锁随之打开。Dr. E鼓掌三次；委员会只鼓了一次。'},
  288:{zh:'SnBr4装置组装完成。Null教授按下了警报按钮，而不是庆祝按钮。'},
  293:{zh:'S2F2反应堆正常运行。Null把安全帽戴反了，反而让所有人更有安全感。'},
  294:{zh:'NH3完成了。Dr. E把气味归咎于科学；Null则怪自己的袜子。'},
  298:{zh:'SnF4能量线稳定下来。Null以为自己拔掉了插头，其实只是关掉了烤面包机。'},
  300:{fr:'La répétition finale de HOF réussit. Devant la porte du niveau 301, Dr. E et Null dirent ensemble : « Je suis prêt. »',zh:'HOF最终演练成功了。在第301关门前，Dr. E和Null同时说道：“我准备好了。”'},
  301:{zh:'最终分子完成了。诺贝尔委员会全体起立；这一次Dr. E没有挂断电话。诺贝尔奖属于你！'}
};
for(const [level,copy] of Object.entries(CAMPAIGN_STORY_OVERRIDES)){
  const row=campaign&&campaign[Number(level)-1];if(row&&row.story)Object.assign(row.story,copy);
}

const WORLD_COPY={
  'quantum-lab':{fr:'LABORATOIRE QUANTIQUE',zh:'量子实验室',tagFr:'C’est ici que la liaison X a émis sa première pulsation.',tagZh:'X键第一次在这里脉动。'},
  'element-island':{fr:'ÎLE DES ÉLÉMENTS',zh:'元素岛',tagFr:'La nature dissimule le langage des atomes.',tagZh:'大自然隐藏着原子的语言。'},
  'crystal-cave':{fr:'GROTTE DE CRISTAL',zh:'晶体洞窟',tagFr:'Chaque fragment de cristal réveille un souvenir.',tagZh:'每一块晶体碎片都会唤醒一段记忆。'},
  'orbital-station':{fr:'STATION ORBITALE',zh:'轨道空间站',tagFr:'La liaison finale se formera au-dessus de la Terre.',tagZh:'最终的化学键将在地球上空形成。'}
};
for(const world of universe.worlds||[]){
  const copy=WORLD_COPY[world.id];if(!copy)continue;
  world.name.fr=copy.fr;world.name.zh=copy.zh;world.tagline.fr=copy.tagFr;world.tagline.zh=copy.tagZh;
}

const EPISODE_TITLES={
  'missing-formula':['LA FORMULE MANQUANTE','缺失的公式'],'x-signal':['LE SIGNAL X','X信号'],'cold-protocol':['PROTOCOLE DU FROID','冷冻协议'],'experiment-fifty':['EXPÉRIENCE 50','第50号实验'],'moxy-awakens':['L’ÉVEIL DE MOXY','Moxy苏醒'],'element-island':['L’ÎLE DES ÉLÉMENTS','元素岛'],'magnetic-shore':['LA CÔTE MAGNÉTIQUE','磁力海岸'],'fragile-grove':['LE BOSQUET FRAGILE','易碎树林'],'cats-trail':['LA PISTE DU CHAT','猫的踪迹'],'island-core':['LE CŒUR DE L’ÎLE','岛屿核心'],'crystal-threshold':['LE SEUIL DE CRISTAL','晶体门槛'],'broken-archive':['LES ARCHIVES BRISÉES','破碎的档案'],'great-unbonding':['LA GRANDE DÉLIAISON','大断键'],'moxys-memory':['LA MÉMOIRE DE MOXY','Moxy的记忆'],'truth-in-crystal':['LA VÉRITÉ DANS LE CRISTAL','晶体中的真相'],'launch-to-orbit':['DÉPART POUR L’ORBITE','进入轨道'],'station-zero':['STATION ZÉRO','零号空间站'],'committee-trial':['L’ÉPREUVE DU COMITÉ','委员会考验'],'cat-saves-station':['LE COUP DU CHAT','猫的一步'],'final-bond':['LA LIAISON FINALE','最终化学键'],'nobel-finale':['LE FINAL DU NOBEL','诺贝尔终章']
};
for(const episode of universe.episodes||[]){
  const title=EPISODE_TITLES[episode.id];if(title){episode.title.fr=title[0];episode.title.zh=title[1];}
}

const CANON_PAGES={
  'moxy-awakens':[
    {fr:'L’expérience 50 était terminée. La liaison X semblait stable au cœur de la molécule de Dr. E.',zh:'第50号实验完成了。X键在Dr. E的分子核心中看起来很稳定。'},
    {fr:'L’énergie s’inversa soudainement. Null tira l’interrupteur principal, mais le Signal X créa son propre circuit.',zh:'能量突然反转。Null拉下了主开关，但X信号自行构成了一条回路。'},
    {fr:'Le chat bondit de la console. Le réacteur se remplit de lumière blanche.',zh:'猫从控制台上一跃而起。反应堆里充满了白光。'},
    {fr:'L’explosion emplit le laboratoire de particules jaunes et bleues. Deux yeux immenses s’ouvrirent dans la fumée.',zh:'爆炸让实验室充满了黄蓝两色的粒子。烟雾中睁开了两只巨大的眼睛。',dialogueFr:'C’est… une molécule ?',dialogueZh:'那是……一个分子吗？'},
    {fr:'Moxy décrivit deux petits cercles dans les airs. Dr. E sourit ; Dr. Null laissa tomber son carnet de surprise.',zh:'Moxy在空中转了两个小圈。Dr. E笑了；Dr. Null惊讶得掉下了笔记本。'}
  ],
  'moxys-memory':[
    {fr:'Les cristaux montrèrent à Moxy un souvenir d’avant sa naissance : le Signal X avait cherché pendant des années un équilibre vivant capable de créer une liaison sûre. La lueur de Moxy pulsa deux fois.',zh:'晶体向Moxy展示了他诞生前的一段记忆：X信号多年来一直在寻找一种能够形成安全化学键的生命平衡体。Moxy的光芒脉动了两次。'},
    {fr:'Null transforma la fréquence de Moxy en stabilisateur.',zh:'Null把Moxy的频率转换成了稳定器。',dialogueFr:'Je ne ferai pas de toi un outil. Le choix t’appartient.',dialogueZh:'我不会把你变成工具。选择权在你。'},
    {fr:'Moxy sourit, rebondit deux fois dans les airs et se blottit près de l’équipe. Sa décision silencieuse était claire : continuer ensemble.',zh:'Moxy笑了，在空中弹跳两下，然后依偎到队伍旁边。他无声的决定很明确：继续并肩前进。'}
  ],
  'final-bond':[
    {fr:'Durant les quinze dernières expériences, Dr. E guida l’itinéraire, Null contrôla les phases d’énergie et Moxy équilibra les liaisons.',zh:'在最后十五次实验中，Dr. E负责引导路线，Null控制能量相位，Moxy平衡化学键。'},
    {fr:'Le Signal X ne ressemblait plus à une menace, mais à une molécule inachevée. Moxy en fit le tour et signala la liaison manquante d’une seule impulsion.',zh:'X信号不再像是威胁，而像一个尚未完成的分子。Moxy绕着它转了一圈，用一次脉冲标出了缺失的化学键。'},
    {fr:'Dr. Null saisit le numéro de la dernière expérience. Dr. E posa la main sur la console et se tourna vers le joueur.',zh:'Dr. Null输入了最终实验的编号。Dr. E把手放在控制台上，转向玩家。',dialogueFr:'C’est vous qui formerez la liaison finale.',dialogueZh:'最终的化学键将由你来形成。'}
  ],
  'nobel-finale':[
    {fr:'Lorsque la molécule 301 fut achevée, Moxy entra au cœur du Signal X. Tandis que les lignes brisées se reconnectaient une à une, une vibration croissante émanant de son corps emplit la station.',zh:'第301号分子完成后，Moxy进入了X信号的核心。断裂的线路逐一重新连接时，他身体中不断增强的震动充满了空间站。'},
    {fr:'Le Comité Nobel honora le travail de l’équipe Moleculox. Dr. E accepta la médaille aux côtés de Dr. Null, de Moxy et du chat ; le résultat avait été rendu possible par la liaison finale du joueur.',zh:'诺贝尔委员会表彰了Moleculox团队的成果。Dr. E与Dr. Null、Moxy和猫一起接受了奖章；最终成果由玩家形成的最后一条化学键完成。',dialogueFr:'Cette récompense n’appartient pas à un seul génie ; elle appartient à tous ceux qui ont formé la bonne liaison.',dialogueZh:'这项荣誉不属于某一个天才；它属于每一个形成了正确化学键的人。'},
    {fr:'Après le Nobel, Dr. E et Dr. Null décidèrent cette fois de diriger ensemble le laboratoire. Moxy devint officiellement le compagnon de terrain de l’équipe, tandis que le chat resta le gardien volontaire du capteur de résonance X. À la fin des célébrations, le pendentif s’illumina de nouveau : un nouveau Signal X arrivait de bien plus loin.',zh:'诺贝尔奖颁发后，Dr. E和Dr. Null决定这一次共同经营实验室。Moxy正式成为团队的外勤伙伴，猫则继续自愿守护X共振传感器。庆祝结束时，吊坠再次亮起：一个新的X信号正从更加遥远的地方传来。'}
  ]
};
for(const episode of universe.episodes||[]){
  const pages=CANON_PAGES[episode.id];if(!pages)continue;
  pages.forEach((copy,index)=>{
    const page=episode.pages[index];if(!page||!page.narration)return;
    page.narration.fr=copy.fr;page.narration.zh=copy.zh;
    if(copy.dialogueFr!==undefined){page.dialogue.fr=copy.dialogueFr;page.dialogue.zh=copy.dialogueZh;}
  });
}

const STORY_FIELD_OVERRIDES={
  'fragile-grove':{
    1:{n:['Moxy atténua l’énergie de la liaison, guida les atomes vers un passage sûr et poussa un petit gazouillis rassurant.','Moxy减弱了键能，引导原子进入安全路线，并发出一声让人安心的轻鸣。'],c:['Les signaux brefs de Moxy guident l’équipe.','Moxy的简短信号为团队指引方向。']}
  },
  'cats-trail':{
    0:{n:['La piste X atteignit l’ancien laboratoire de portails de l’île. La même énergie figea certains atomes comme du cristal tout en en propulsant rapidement d’autres les uns vers les autres.','X的踪迹延伸到了岛上的旧传送门实验室。同一种能量把一些原子冻结得如同晶体，同时又让另一些原子迅速靠拢。'],d:['Le signal sépare les liaisons et les redirige.','信号正在拆分化学键，并重新引导它们。'],c:['La piste se poursuit à l’intérieur du système de portails.','踪迹延伸到了传送门系统内部。']},
    1:{n:['Dr. Null verrouilla la phase du portail sur le Signal X. La sortie ne s’ouvrirait qu’au moment exact.','Dr. Null把传送门相位锁定在X信号上。出口只会在正确的时刻开启。'],d:['N’activez pas la commande rouge avant mon signal.','在我开口之前，不要启动红色控制器。'],c:['Le chat fixait naturellement le bouton.','猫自然正盯着那个按钮。']},
    2:{n:['Le chat activa la commande rouge d’une patte. Le portail s’ouvrit ; Moxy suivit les pulsations du pendentif et trouva la sortie cachée.','猫用一只爪子启动了红色控制器。传送门开启；Moxy循着吊坠的脉冲找到了隐藏出口。'],c:['Le chat et Moxy firent leur première découverte ensemble.','猫和Moxy第一次共同完成了发现。']}
  },
  'island-core':{
    0:{n:['Un immense réacteur naturel pulsait sous l’île. Le Signal X tentait de le désassembler.','一座巨大的天然反应堆在岛屿下方脉动。X信号正试图把它拆散。'],c:['La Grande Déliaison est sur le point de recommencer.','大断键事件即将再次发生。']},
    1:{n:['Null connecta sa propre machine au cœur.','Null把自己的装置连接到核心。'],d:['J’ai construit cet appareil pour contenir le signal, pas pour le voler.','我制造这台装置是为了控制信号，不是为了窃取它。'],c:['La méfiance cède la place à une confiance difficile.','猜疑逐渐让位于来之不易的信任。']},
    2:{n:['Moxy équilibra l’énergie des liaisons. Le cœur s’apaisa et projeta un rayon violet dans le ciel.','Moxy平衡了键能。核心恢复平静，并向天空射出一道紫色光束。'],c:['Le rayon révèle les coordonnées de la Grotte de Cristal.','光束显现出了晶体洞窟的坐标。']}
  },
  'great-unbonding':{
    0:{n:['Les archives de cristal reconstituèrent la Grande Déliaison sous forme de simulation vivante. Dès que le levier principal fut abaissé, l’énergie échappa à tout contrôle et une onde de rupture des liaisons balaya le laboratoire.','晶体档案把“大断键事件”重现为一场活体模拟。主控制杆被拉下的瞬间，能量失去控制，一道断键冲击波横扫了整个实验室。'],d:['La liaison X devait maintenir les atomes stables pour toujours. Au lieu de cela, nous avons créé une onde qui a rompu toutes les liaisons.','X键原本应该让原子永远保持稳定。可我们却制造出了一道会破坏所有化学键的冲击波。'],c:['Dr. E et Dr. Null affrontent l’erreur qu’ils ont cachée pendant des années.','Dr. E和Dr. Null直面了他们隐瞒多年的错误。']},
    1:{n:['Dr. E avoua qu’il avait préparé le dossier du Nobel non pour remporter un prix, mais pour documenter et réparer l’erreur que Dr. Null et lui avaient commise ensemble des années plus tôt. Dr. Null reconnut que la responsabilité leur appartenait à tous les deux.','Dr. E承认，他准备诺贝尔档案并不是为了获奖，而是为了记录并修复多年前他与Dr. Null共同犯下的错误。Dr. Null也承认，他们两人都负有责任。'],c:['La rivalité prend fin ; tous deux choisissent de réparer ensemble la même erreur.','竞争就此结束；两人选择共同弥补同一个错误。']},
    2:{n:['Moxy flotta entre les deux scientifiques, relia de ses petites mains rondes deux lignes d’énergie brisées et émit un son léger.','Moxy漂浮在两位科学家之间，用圆圆的小手连接起两条断裂的能量线，并发出一声轻响。'],c:['L’équipe forme sa première véritable liaison.','团队第一次形成了真正的联结。']}
  },
  'launch-to-orbit':{
    0:{n:['Avant le saut orbital, l’équipe se réunit au laboratoire pour les dernières vérifications. Lorsque le repère X se stabilisa sur l’écran, la porte des étoiles commença à s’ouvrir.','轨道跃迁前，团队在实验室集合，进行最后检查。当显示屏上的X标记稳定下来时，星门开始开启。'],d:['Maintenant que le thé est terminé, nous pouvons partir dans l’espace.','茶喝完了，现在我们可以去太空了。'],c:['La porte vers Station Zéro est ouverte.','通往零号空间站的大门已经开启。']},
    1:{n:['Moxy enchaîna les culbutes en apesanteur. Il poussait un cri joyeux à chaque tour, tandis que le chat essayait de l’attraper.','Moxy在失重环境中连续翻滚。每转一圈，他都会开心地轻鸣一声，猫则试着抓住他。'],c:['Un rire rapide avant le grand final.','大结局前的一阵轻松笑声。']},
    2:{n:['La station ne répondit pas. Ses portes étaient verrouillées et le Signal X absorbait toute son énergie.','空间站没有回应。所有舱门都已锁死，X信号正在抽走全部能源。'],c:['La station n’est pas abandonnée. Elle attend.','空间站并未被遗弃。它正在等待。']}
  },
  'committee-trial':{
    0:{n:['Le Comité Nobel rejoignit la transmission. Dr. E décrivit l’ancien échec sans rien dissimuler.','诺贝尔委员会接入了传输。Dr. E毫不隐瞒地讲述了过去的失败。'],c:['La vraie science intègre l’échec aux preuves.','真正的科学会把失败也纳入证据。']},
    1:{n:['Null ouvrit les dossiers et assuma sa part de responsabilité.','Null打开记录，并承担了自己的责任。'],d:['C’est peut-être mon rival. Ce n’est pas mon complice ; c’est mon partenaire scientifique.','他也许是我的对手，但不是我的同谋；他是我的科学伙伴。'],c:['La rivalité devient collaboration.','竞争转变成了合作。']},
    2:{n:['Moxy flotta beaucoup trop près de la caméra, remplit tout l’objectif et produisit un son comique. Le comité rit pour la première fois, puis autorisa la poursuite de l’expérience.','Moxy漂得离镜头太近，整个画面都被他占满，还发出一声滑稽的轻响。委员会第一次笑了，随后批准继续实验。'],c:['Le comité autorise à l’unanimité la poursuite de l’expérience.','委员会一致批准继续实验。']}
  },
  'cat-saves-station':{
    0:{n:['Une surtension verrouilla le stabilisateur de la station. Le bouton d’équilibrage d’urgence se retrouva au-delà du champ grandissant ; seul le chat était assez petit pour atteindre la console.','能量激增锁死了空间站稳定器。紧急平衡按钮被隔在不断扩张的能量场另一侧；只有猫足够小，能够抵达控制台。'],c:['L’expérience finale dépend maintenant de quatre petites pattes.','最终实验现在取决于四只小爪子。']},
    1:{n:['Dr. Null maintint la voie sûre visible pour le chat, tandis que Dr. E stabilisait l’énergie quelques secondes de plus.','Dr. Null为猫保持安全路线可见，Dr. E则又将能量稳定了几秒。'],d:['Le bouton rouge. Allez, petit partenaire.','红色按钮。加油，小伙伴。'],c:['Encore une seconde et la station s’arrêtera de nouveau.','再过一秒，空间站就会再次关闭。']},
    2:{n:['Le chat appuya sur le bouton d’équilibrage rouge. Le stabilisateur revint en ligne ; l’énergie violette se dissipa et la lumière de Moxy se répandit de nouveau dans toute la station.','猫按下红色平衡按钮。稳定器重新上线；紫色能量随之消散，Moxy的光芒再次照亮整座空间站。'],c:['Le plus petit geste a sauvé tout le système.','最小的一步拯救了整个系统。']}
  }
};
for(const episode of universe.episodes||[]){
  const pages=STORY_FIELD_OVERRIDES[episode.id];if(!pages)continue;
  for(const [index,fields] of Object.entries(pages)){
    const page=episode.pages[Number(index)];if(!page)continue;
    if(fields.n&&page.narration){page.narration.fr=fields.n[0];page.narration.zh=fields.n[1];}
    if(fields.d&&page.dialogue){page.dialogue.fr=fields.d[0];page.dialogue.zh=fields.d[1];}
    if(fields.c&&page.caption){page.caption.fr=fields.c[0];page.caption.zh=fields.c[1];}
  }
}

/* Keep the legacy combined-text fallback aligned with the separated canon fields. */
for(const episode of universe.episodes||[]){
  for(const page of episode.pages||[]){
    if(!page.text||!page.narration)continue;
    const frNarration=String(page.narration.fr||'').trim();
    const zhNarration=String(page.narration.zh||'').trim();
    const frDialogue=String(page.dialogue&&page.dialogue.fr||'').trim();
    const zhDialogue=String(page.dialogue&&page.dialogue.zh||'').trim();
    page.text.fr=frDialogue?[frNarration,`« ${frDialogue} »`].filter(Boolean).join(' '):frNarration;
    page.text.zh=zhDialogue?`${zhNarration}“${zhDialogue}”`:zhNarration;
  }
}
})(window);
