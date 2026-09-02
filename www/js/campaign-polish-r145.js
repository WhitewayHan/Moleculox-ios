/* Moleculox v8.7.42 — R145 content-integrity polish.
   Offline campaign text only. No Firebase/sync/progression mutations. */
(function(root){
  'use strict';
  function L(n){return Array.isArray(root.MX_CAMPAIGN_LEVELS)?root.MX_CAMPAIGN_LEVELS[n-1]:null;}
  function setStory(n,lesson,story,tag){
    const l=L(n); if(!l)return;
    l.lesson=lesson;
    l.story=Object.assign({},l.story||{},story);
    const parts=String(l.uniqueDesign||'').split('+').filter(Boolean);
    if(!parts.includes(tag))parts.push(tag);l.uniqueDesign=parts.join('+');
  }
  const WALL_DIVERSITY_GRIDS={
  "47": [
    "11111111",
    "11101101",
    "10100001",
    "10000011",
    "10100101",
    "10000001",
    "10000101",
    "10000111",
    "10000111",
    "11111111"
  ],
  "75": [
    "11111111",
    "11101001",
    "10100001",
    "10000011",
    "10100101",
    "10000011",
    "10000111",
    "10000101",
    "10000111",
    "11111111"
  ],
  "107": [
    "11111111",
    "10000011",
    "10011001",
    "10000001",
    "11001011",
    "10000001",
    "10100101",
    "10100101",
    "11000011",
    "11111111"
  ],
  "131": [
    "11111111",
    "10000001",
    "10000001",
    "10100101",
    "10011001",
    "10110101",
    "10000001",
    "11011001",
    "10011001",
    "11111111"
  ],
  "158": [
    "11111111",
    "10001101",
    "10001011",
    "11011111",
    "11011011",
    "10000001",
    "10000101",
    "10000101",
    "10000011",
    "11111111"
  ],
  "160": [
    "11111111",
    "11010011",
    "11010011",
    "11100111",
    "10000001",
    "10001011",
    "10000101",
    "11100001",
    "10000001",
    "11111111"
  ],
  "181": [
    "11111111",
    "11111111",
    "10000011",
    "10000001",
    "10111101",
    "10000001",
    "10111011",
    "11011011",
    "11010111",
    "11111111"
  ],
  "183": [
    "11111111",
    "11010111",
    "11100101",
    "10100001",
    "11111001",
    "10010001",
    "10010001",
    "10010001",
    "10010001",
    "11111111"
  ],
  "186": [
    "11111111",
    "10100111",
    "11011001",
    "11100011",
    "11000101",
    "11101011",
    "11000111",
    "11000001",
    "10100111",
    "11111111"
  ],
  "190": [
    "11111111",
    "10011011",
    "10100001",
    "10010111",
    "10100111",
    "10000001",
    "11001011",
    "11010011",
    "10010001",
    "11111111"
  ],
  "192": [
    "11111111",
    "10000001",
    "10000001",
    "10100101",
    "11011001",
    "11100101",
    "10000001",
    "10011001",
    "10011001",
    "11111111"
  ],
  "193": [
    "11111111",
    "11000001",
    "11100111",
    "11000011",
    "11100111",
    "10000001",
    "10011001",
    "11000011",
    "11011001",
    "11111111"
  ],
  "196": [
    "11111111",
    "11010111",
    "10100001",
    "10000001",
    "10001001",
    "11001101",
    "10001001",
    "10101001",
    "10000101",
    "11111111"
  ],
  "200": [
    "11111111",
    "10011001",
    "11000111",
    "10000001",
    "10000111",
    "10011011",
    "10000011",
    "10010001",
    "10100101",
    "11111111"
  ],
  "203": [
    "11111111",
    "10000101",
    "10000001",
    "10000101",
    "10000001",
    "10100001",
    "10000001",
    "11010011",
    "10001001",
    "11111111"
  ],
  "205": [
    "11111111",
    "10111001",
    "11000001",
    "10010011",
    "11010011",
    "11100001",
    "11110101",
    "10100001",
    "10001111",
    "11111111"
  ],
  "210": [
    "11111111",
    "11011111",
    "11001011",
    "11011011",
    "10011001",
    "10000001",
    "10000001",
    "10000001",
    "10111111",
    "11111111"
  ],
  "211": [
    "11111111",
    "11000011",
    "10011101",
    "11000001",
    "11100101",
    "11100001",
    "11100001",
    "10101001",
    "11000111",
    "11111111"
  ],
  "214": [
    "11111111",
    "11011011",
    "11111001",
    "10110001",
    "10100011",
    "11000001",
    "10000001",
    "10000011",
    "11010111",
    "11111111"
  ],
  "223": [
    "11111111",
    "10111001",
    "10001101",
    "11000011",
    "11111011",
    "11110011",
    "10010011",
    "11100001",
    "10111001",
    "11111111"
  ],
  "225": [
    "11111111",
    "10100011",
    "11000001",
    "11001101",
    "10000011",
    "10000001",
    "10001001",
    "10000001",
    "11100101",
    "11111111"
  ],
  "227": [
    "11111111",
    "11100111",
    "10110011",
    "11100101",
    "10010011",
    "10000011",
    "10000001",
    "10010001",
    "10000111",
    "11111111"
  ],
  "230": [
    "11111111",
    "11011011",
    "11000011",
    "11100011",
    "10000001",
    "10100101",
    "10010001",
    "10000001",
    "10100101",
    "11111111"
  ],
  "233": [
    "11111111",
    "10001011",
    "10000001",
    "11010001",
    "10010011",
    "10111011",
    "10001011",
    "11000001",
    "10111111",
    "11111111"
  ],
  "235": [
    "11111111",
    "11111101",
    "10111101",
    "10001001",
    "10011001",
    "11011011",
    "11000011",
    "10000001",
    "10000001",
    "11111111"
  ],
  "236": [
    "11111111",
    "10001101",
    "10010011",
    "10010111",
    "11001011",
    "10000101",
    "10000001",
    "10000101",
    "10010001",
    "11111111"
  ],
  "239": [
    "11111111",
    "11100101",
    "10100001",
    "10110101",
    "10000001",
    "11110011",
    "11000001",
    "10011001",
    "11111011",
    "11111111"
  ],
  "241": [
    "11111111",
    "10000001",
    "10001001",
    "10100101",
    "10011001",
    "10100101",
    "10000001",
    "10011001",
    "11011001",
    "11111111"
  ],
  "242": [
    "11111111",
    "11010101",
    "10011001",
    "10110011",
    "10100001",
    "10101101",
    "10001001",
    "10000111",
    "10010011",
    "11111111"
  ],
  "250": [
    "11111111",
    "10001001",
    "10000001",
    "11110001",
    "11010101",
    "10000101",
    "10000001",
    "11001101",
    "10000001",
    "11111111"
  ],
  "253": [
    "11111111",
    "10101001",
    "10110101",
    "11001001",
    "10101001",
    "10000001",
    "11000111",
    "10001011",
    "10100001",
    "11111111"
  ],
  "256": [
    "11111111",
    "10101011",
    "10001011",
    "11100111",
    "10100001",
    "11010001",
    "10100001",
    "10000111",
    "10000001",
    "11111111"
  ],
  "259": [
    "11111111",
    "10110011",
    "10110101",
    "10100101",
    "11000101",
    "11000001",
    "10000011",
    "10100011",
    "10000001",
    "11111111"
  ],
  "262": [
    "11111111",
    "10100111",
    "10101111",
    "10000111",
    "10100011",
    "11111011",
    "11011001",
    "10010001",
    "11000011",
    "11111111"
  ],
  "265": [
    "11111111",
    "10100001",
    "10110011",
    "11000011",
    "10000101",
    "10010101",
    "11011001",
    "10001011",
    "11011101",
    "11111111"
  ],
  "273": [
    "11111111",
    "11000111",
    "10100011",
    "10000111",
    "11000001",
    "10110001",
    "11100101",
    "10101011",
    "11110101",
    "11111111"
  ],
  "277": [
    "11111111",
    "11011111",
    "11011011",
    "11011011",
    "11011001",
    "10010001",
    "10000001",
    "10000001",
    "10111101",
    "11111111"
  ],
  "294": [
    "11111111",
    "10110011",
    "10110101",
    "10100101",
    "11000101",
    "11000001",
    "10000011",
    "10010011",
    "10000001",
    "11111111"
  ],
  "298": [
    "11111111",
    "11000011",
    "10001011",
    "10010101",
    "10000101",
    "10110111",
    "11000011",
    "10110101",
    "11111011",
    "11111111"
  ],
  "301": [
    "11111111",
    "11000001",
    "10000001",
    "11111011",
    "10011001",
    "10000001",
    "10000001",
    "10011001",
    "10111101",
    "11111111"
  ],
  "414": [
    "11111111",
    "11011111",
    "11011011",
    "11001011",
    "11111001",
    "10000001",
    "10000001",
    "10011111",
    "11010111",
    "11111111"
  ],
  "431": [
    "11111111",
    "10000011",
    "11100101",
    "10000011",
    "10010011",
    "11000001",
    "10011111",
    "11000111",
    "11101011",
    "11111111"
  ],
  "432": [
    "11111111",
    "11111111",
    "10011111",
    "10110001",
    "10100111",
    "10000001",
    "11101001",
    "10110011",
    "11100111",
    "11111111"
  ],
  "434": [
    "11111111",
    "10101111",
    "10101011",
    "10110111",
    "10100111",
    "10000001",
    "11101101",
    "11010001",
    "11100101",
    "11111111"
  ],
  "436": [
    "11111111",
    "11001111",
    "10110011",
    "10011001",
    "11000011",
    "11001111",
    "11001111",
    "10011101",
    "10000111",
    "11111111"
  ],
  "437": [
    "11111111",
    "11010111",
    "11110011",
    "11111001",
    "11000011",
    "11001101",
    "10001011",
    "10011111",
    "10000111",
    "11111111"
  ],
  "438": [
    "11111111",
    "11100111",
    "11110011",
    "10101001",
    "11000011",
    "11001111",
    "10000111",
    "10011101",
    "10000111",
    "11111111"
  ],
  "439": [
    "11111111",
    "10111111",
    "10111011",
    "10111001",
    "11000011",
    "11001111",
    "10000011",
    "10011111",
    "10000111",
    "11111111"
  ],
  "441": [
    "11111111",
    "10110111",
    "10110011",
    "10101011",
    "11000011",
    "11001101",
    "10000011",
    "10011111",
    "10000111",
    "11111111"
  ],
  "442": [
    "11111111",
    "11101111",
    "11110011",
    "10011001",
    "11000011",
    "11001101",
    "10000111",
    "10011101",
    "10000111",
    "11111111"
  ]
};
  function applyWallDiversity(){
    for(const [rawN,grid] of Object.entries(WALL_DIVERSITY_GRIDS)){
      const n=+rawN,l=L(n); if(!l||!Array.isArray(grid))continue;
      l.g=grid.slice();
      const parts=String(l.uniqueDesign||'').split('+').filter(Boolean);
      if(!parts.includes('r145-global-wall-diversity'))parts.push('r145-global-wall-diversity');
      l.uniqueDesign=parts.join('+');
    }
  }
  function apply(){
    if(!Array.isArray(root.MX_CAMPAIGN_LEVELS)||root.MX_CAMPAIGN_LEVELS.length<501)return false;
    applyWallDiversity();
  setStory(307,
    'Molecular Fusion: build compatible sulfur/chlorine and sulfur/oxygen fragments, then assemble the complete Cl₂S₂O target by any legal route.',
    {
      tr:'İlk Moleküler Birleşim kararlı kalınca Rezonans Kasası iki yeni parçayı kükürt hattına yönlendirdi. Cl₂S₂O hedefi, farklı koridorlardan aynı yapıya ulaşılabildiğini gösteriyordu; kasa ezberlenmiş rotayı değil, doğru birleşimi ölçüyordu.',
      en:'Once the first Molecular Fusion stayed stable, the Resonance Vault routed new fragments into the sulfur line. The Cl₂S₂O target showed that different corridors could reach the same structure; the vault was measuring a correct fusion, not a memorized route.',
      de:'Nachdem die erste molekulare Fusion stabil blieb, leitete der Resonanz-Tresor neue Fragmente in die Schwefellinie. Das Ziel Cl₂S₂O zeigte, dass verschiedene Korridore zur gleichen Struktur führen können; gemessen wurde die korrekte Fusion, nicht eine auswendig gelernte Route.',
      es:'Cuando la primera Fusión Molecular se mantuvo estable, la Bóveda de Resonancia dirigió nuevos fragmentos hacia la línea de azufre. El objetivo Cl₂S₂O demostró que distintos corredores podían llegar a la misma estructura; la bóveda medía una fusión correcta, no una ruta memorizada.',
      pt:'Quando a primeira Fusão Molecular permaneceu estável, a Câmara de Ressonância enviou novos fragmentos para a linha de enxofre. O alvo Cl₂S₂O mostrou que corredores diferentes podiam chegar à mesma estrutura; a câmara media a fusão correta, não uma rota decorada.',
      ja:'最初の分子フュージョンが安定すると、共鳴保管庫は新しい断片を硫黄ラインへ送った。Cl₂S₂Oの目標は、異なる経路から同じ構造へ到達できることを示していた。測られているのは暗記したルートではなく、正しい融合そのものだ。',
      fr:'Lorsque la première Fusion moléculaire resta stable, la Chambre de Résonance dirigea de nouveaux fragments vers la ligne du soufre. La cible Cl₂S₂O montrait que plusieurs couloirs pouvaient mener à la même structure ; la chambre mesurait une fusion correcte, pas un trajet mémorisé.',
      zh:'第一次分子融合稳定后，共振库把新的片段送入硫线路。Cl₂S₂O目标表明，不同通道也能到达同一结构；共振库衡量的是正确的融合，而不是背下来的路线。',
      it:'Quando la prima Fusione Molecolare rimase stabile, la Camera di Risonanza inviò nuovi frammenti nella linea dello zolfo. Il bersaglio Cl₂S₂O mostrava che corridoi diversi potevano portare alla stessa struttura: la camera misurava una fusione corretta, non un percorso memorizzato.'
    },'r145-content-integrity-307');
  setStory(320,
    'Fusion + Portal: assemble the O–C–O backbone, then route sulfur through the distant portal pair to complete the CO₂S target.',
    {
      tr:'X Sinyali ince bir atmosferik ize dönüştü ve iki uzak portal düğümü arasında kayboldu. CO₂S hedefi aynı kaybolup geri gelme desenini tekrarladı; kasa yapıyı ölçtüğü kadar taşınmayı da ölçüyordu.',
      en:'The X Signal collapsed into a thin atmospheric trace and vanished between two distant portal nodes. The CO₂S target reproduced the same disappearance-and-return pattern; the vault was measuring transport as carefully as structure.',
      de:'Das X-Signal schrumpfte zu einer dünnen atmosphärischen Spur und verschwand zwischen zwei entfernten Portalknoten. Das CO₂S-Ziel wiederholte dieses Muster aus Verschwinden und Rückkehr; der Tresor maß den Transport ebenso genau wie die Struktur.',
      es:'La Señal X se redujo a una fina traza atmosférica y desapareció entre dos nodos de portal distantes. El objetivo CO₂S reprodujo el mismo patrón de desaparición y regreso; la bóveda medía el transporte con tanta precisión como la estructura.',
      pt:'O Sinal X se reduziu a um fino rastro atmosférico e desapareceu entre dois nós de portal distantes. O alvo CO₂S repetiu o mesmo padrão de sumir e retornar; a câmara media o transporte com tanto cuidado quanto a estrutura.',
      ja:'Xシグナルは細い大気の痕跡へ縮み、離れた二つのポータルノードの間で消えた。CO₂Sの目標も同じ消失と再出現を示し、保管庫が構造だけでなく輸送も精密に測っていることを示した。',
      fr:'Le Signal X se réduisit à une fine trace atmosphérique et disparut entre deux nœuds de portail éloignés. La cible CO₂S reproduisit le même schéma de disparition et de retour ; la chambre mesurait le transport aussi précisément que la structure.',
      zh:'X信号收缩成一条细微的大气痕迹，并在两个相距很远的传送门节点之间消失。CO₂S目标重复了同样的消失与回归模式；共振库对运输过程的测量与对结构同样精细。',
      it:'Il Segnale X si ridusse a una sottile traccia atmosferica e scomparve tra due nodi di portale lontani. Il bersaglio CO₂S riprodusse lo stesso schema di scomparsa e ritorno; la camera misurava il trasporto con la stessa precisione della struttura.'
    },'r145-content-integrity-320');
  setStory(325,
    'Navigation Mastery: combine Fusion, a long portal jump, and three independent direction arrows to assemble the five-atom SO₄ target signature by any legal route.',
    {
      tr:'SO₄ hedef imzası, bir portal ve birbirinden bağımsız üç faz okuyla navigasyon serisini kapattı. Yapı tamamlandığında kasa zemini çeyrek tur döndü, sonra yeni deney başlamadan durdu. Ekranda yeni bir uyarı belirdi: DÖNÜŞ KALİBRASYONU.',
      en:'The SO₄ target signature closed the navigation series with a portal and three independent phase arrows. When the structure formed, the chamber floor rotated by a quarter turn, then stopped before the next experiment began. A new notice appeared: ROTATION CALIBRATION.',
      de:'Die SO₄-Zielsignatur schloss die Navigationsserie mit einem Portal und drei unabhängigen Phasenpfeilen ab. Als die Struktur fertig war, drehte sich der Kammerboden um eine Vierteldrehung und stoppte vor dem nächsten Versuch. Ein neuer Hinweis erschien: ROTATIONSKALIBRIERUNG.',
      es:'La firma objetivo SO₄ cerró la serie de navegación con un portal y tres flechas de fase independientes. Cuando se completó la estructura, el suelo de la cámara giró un cuarto de vuelta y se detuvo antes del siguiente experimento. Apareció un nuevo aviso: CALIBRACIÓN DE ROTACIÓN.',
      pt:'A assinatura-alvo SO₄ encerrou a série de navegação com um portal e três setas de fase independentes. Quando a estrutura ficou pronta, o piso da câmara girou um quarto de volta e parou antes do próximo experimento. Surgiu um novo aviso: CALIBRAÇÃO DE ROTAÇÃO.',
      ja:'SO₄の目標シグネチャは、ポータルと独立した三つの位相矢印でナビゲーション系列を締めくくった。構造が完成すると床が90度回転し、次の実験が始まる前に停止した。新しい表示が現れた――「回転キャリブレーション」。',
      fr:'La signature cible SO₄ acheva la série de navigation avec un portail et trois flèches de phase indépendantes. Une fois la structure terminée, le sol pivota d’un quart de tour puis s’arrêta avant l’expérience suivante. Un nouvel avis apparut : CALIBRAGE DE ROTATION.',
      zh:'SO₄目标特征用一个传送门和三个彼此独立的相位箭头结束了这一组导航试验。结构完成时，舱室地板旋转了四分之一圈，并在下一项实验开始前停下。屏幕出现新提示：旋转校准。',
      it:'La firma obiettivo SO₄ chiuse la serie di navigazione con un portale e tre frecce di fase indipendenti. Quando la struttura fu completa, il pavimento della camera ruotò di un quarto di giro e si fermò prima dell’esperimento successivo. Comparve un nuovo avviso: CALIBRAZIONE DELLA ROTAZIONE.'
    },'r145-content-integrity-325');
    root.MX_R145_CAMPAIGN_POLISH={build:'R145-CONTENT-INTEGRITY+GLOBAL-WALL-DIVERSITY',levels:[307,320,325],wallDiversityLevels:[47,75,107,131,158,160,181,183,186,190,192,193,196,200,203,205,210,211,214,223,225,227,230,233,235,236,239,241,242,250,253,256,259,262,265,273,277,294,298,301,414,431,432,434,436,437,438,439,441,442],globalWallSimilarityCeiling:0.9,onlineTouched:false};
    return true;
  }
  root.MXApplyR145CampaignPolish=apply;apply();
})(window);
