/* Moleculox R38 Story Final — schema 8. Narration/dialogue separated; user-approved canon characters and supplied story art. */
(function(root){
  'use strict';
  const universe={
  "schema": 9,
  "moxyUnlockAfter": 50,
  "languages": [
    "tr",
    "en",
    "de",
    "es",
    "pt",
    "ja"
  ],
  "characters": {
    "drE": {
      "id": "drE",
      "name": "DR. E",
      "asset": "assets/images/einstein.webp"
    },
    "null": {
      "id": "null",
      "name": "DR. NULL",
      "asset": "assets/images/characters/dr-null-canon-r40.webp"
    },
    "cat": {
      "id": "cat",
      "name": {
        "tr": "DR. NULL’UN KEDİSİ",
        "en": "DR. NULL’S CAT",
        "de": "DR. NULLS KATZE",
        "es": "EL GATO DE DR. NULL",
        "pt": "O GATO DO DR. NULL",
        "ja": "DR. NULLのネコ"
      },
      "asset": "assets/images/characters/null-cat-canon-r40.webp"
    },
    "moxy": {
      "id": "moxy",
      "name": "MOXY",
      "asset": "assets/images/characters/moxy-canon-r40.webp"
    }
  },
  "worlds": [
    {
      "id": "quantum-lab",
      "order": 1,
      "startLevel": 1,
      "endLevel": 75,
      "icon": "⚗",
      "name": {
        "tr": "KUANTUM LABORATUVARI",
        "en": "QUANTUM LABORATORY",
        "de": "QUANTENLABOR",
        "es": "LABORATORIO CUÁNTICO",
        "pt": "LABORATÓRIO QUÂNTICO",
        "ja": "量子研究所"
      },
      "tagline": {
        "tr": "X-Bağı ilk kez burada titreşti.",
        "en": "The X-Bond first pulsed here.",
        "de": "Hier pulsierte die X-Bindung zum ersten Mal.",
        "es": "Aquí pulsó por primera vez el Enlace X.",
        "pt": "A Ligação X pulsou aqui pela primeira vez.",
        "ja": "X結合が初めて脈動した場所。"
      },
      "art": "assets/images/worlds/world-quantum-lab-r40.webp",
      "colors": {
        "primary": "#56e6ff",
        "secondary": "#8b6cff",
        "accent": "#ffd166",
        "deep": "#071426"
      }
    },
    {
      "id": "element-island",
      "order": 2,
      "startLevel": 76,
      "endLevel": 150,
      "icon": "◈",
      "name": {
        "tr": "ELEMENT ADASI",
        "en": "ELEMENT ISLAND",
        "de": "ELEMENTINSEL",
        "es": "ISLA ELEMENTO",
        "pt": "ILHA DOS ELEMENTOS",
        "ja": "元素島"
      },
      "tagline": {
        "tr": "Doğa, atomların dilini saklıyor.",
        "en": "Nature is hiding the language of atoms.",
        "de": "Die Natur verbirgt die Sprache der Atome.",
        "es": "La naturaleza esconde el lenguaje de los átomos.",
        "pt": "A natureza esconde a linguagem dos átomos.",
        "ja": "自然は原子の言葉を隠している。"
      },
      "art": "assets/images/worlds/world-element-island-r40.webp",
      "colors": {
        "primary": "#72f5b4",
        "secondary": "#38bdf8",
        "accent": "#ffe071",
        "deep": "#071f25"
      }
    },
    {
      "id": "crystal-cave",
      "order": 3,
      "startLevel": 151,
      "endLevel": 225,
      "icon": "◆",
      "name": {
        "tr": "KRİSTAL MAĞARA",
        "en": "CRYSTAL CAVE",
        "de": "KRISTALLHÖHLE",
        "es": "CUEVA DE CRISTAL",
        "pt": "CAVERNA DE CRISTAL",
        "ja": "クリスタル洞窟"
      },
      "tagline": {
        "tr": "Kırılan her kristal bir anıyı uyandırıyor.",
        "en": "Every crystal shard awakens a memory.",
        "de": "Jeder Kristallsplitter weckt eine Erinnerung.",
        "es": "Cada fragmento de cristal despierta un recuerdo.",
        "pt": "Cada fragmento de cristal desperta uma memória.",
        "ja": "砕けたクリスタルの一片一片が記憶を呼び覚ます。"
      },
      "art": "assets/images/worlds/world-crystal-cave-r40.webp",
      "colors": {
        "primary": "#b794ff",
        "secondary": "#43d9ff",
        "accent": "#ff8fe5",
        "deep": "#100b2d"
      }
    },
    {
      "id": "orbital-station",
      "order": 4,
      "startLevel": 226,
      "endLevel": 301,
      "icon": "◎",
      "name": {
        "tr": "YÖRÜNGE İSTASYONU",
        "en": "ORBITAL STATION",
        "de": "ORBITALSTATION",
        "es": "ESTACIÓN ORBITAL",
        "pt": "ESTAÇÃO ORBITAL",
        "ja": "軌道ステーション"
      },
      "tagline": {
        "tr": "Son bağ Dünya’nın üzerinde kurulacak.",
        "en": "The final bond will form above Earth.",
        "de": "Die letzte Bindung wird über der Erde entstehen.",
        "es": "El enlace final se formará sobre la Tierra.",
        "pt": "A ligação final será formada acima da Terra.",
        "ja": "最後の結合は地球の上空で形成される。"
      },
      "art": "assets/images/worlds/world-orbital-station-r40.webp",
      "colors": {
        "primary": "#69d5ff",
        "secondary": "#7c7cff",
        "accent": "#ffcc63",
        "deep": "#050b1e"
      }
    }
  ],
  "episodes": [
    {
      "id": "missing-formula",
      "chapter": 1,
      "startLevel": 1,
      "unlockAfter": 0,
      "world": "quantum-lab",
      "bang": "",
      "title": {
        "tr": "KAYIP FORMÜL",
        "en": "THE MISSING FORMULA",
        "de": "DIE FEHLENDE FORMEL",
        "es": "LA FÓRMULA PERDIDA",
        "pt": "A FÓRMULA DESAPARECIDA",
        "ja": "消えた数式"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "",
          "text": {
            "tr": "Gece yarısı laboratuvara mühürlü bir Nobel daveti geldi. Fakat Dr. E’nin son formül sayfası dosyadan sökülmüştü.",
            "en": "At midnight, a sealed Nobel invitation reached the lab. But the final page of Dr. E’s formula had been torn from the file.",
            "de": "Um Mitternacht erreichte eine versiegelte Nobel-Einladung das Labor. Doch die letzte Seite von Dr. Es Formel war aus der Akte gerissen worden.",
            "es": "A medianoche llegó al laboratorio una invitación sellada del Nobel. Pero la última página de la fórmula de Dr. E había sido arrancada del expediente.",
            "pt": "À meia-noite, um convite selado do Nobel chegou ao laboratório. Mas a última página da fórmula do Dr. E tinha sido arrancada do arquivo.",
            "ja": "真夜中、封印されたノーベル賞の招待状が研究所に届いた。だがDr. Eの数式の最後のページはファイルから引き抜かれていた。"
          },
          "caption": {
            "tr": "Bir ödül çağrısı, kayıp bir kanıt ve 301 deney.",
            "en": "An award summons, missing proof, and 301 experiments.",
            "de": "Eine Einladung zur Auszeichnung, ein fehlender Beweis und 301 Experimente.",
            "es": "Una convocatoria a un premio, una prueba perdida y 301 experimentos.",
            "pt": "Uma convocação para um prêmio, uma prova desaparecida e 301 experimentos.",
            "ja": "賞への招集、消えた証拠、そして301の実験。"
          },
          "cast": [
            "drE"
          ],
          "shot": "close",
          "img": "assets/images/story-user/01-dr-e-nobel-clue.webp",
          "narration": {
            "tr": "Gece yarısı laboratuvara mühürlü bir Nobel daveti geldi. Fakat Dr. E’nin son formül sayfası dosyadan sökülmüştü.",
            "en": "At midnight, a sealed Nobel invitation reached the lab. But the final page of Dr. E’s formula had been torn from the file.",
            "de": "Um Mitternacht erreichte eine versiegelte Nobel-Einladung das Labor. Doch die letzte Seite von Dr. Es Formel war aus der Akte gerissen worden.",
            "es": "A medianoche llegó al laboratorio una invitación sellada del Nobel. Pero la última página de la fórmula de Dr. E había sido arrancada del expediente.",
            "pt": "À meia-noite, um convite selado do Nobel chegou ao laboratório. Mas a última página da fórmula do Dr. E tinha sido arrancada do arquivo.",
            "ja": "真夜中、封印されたノーベル賞の招待状が研究所に届いた。だがDr. Eの数式の最後のページはファイルから引き抜かれていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "drE",
          "bang": "",
          "text": {
            "tr": "Tarayıcı, sayfada Dr. E’nin yıllardır görmediği tanıdık bir rezonans izi buldu: eski X-Bağı imzası. Aynı imza ilk deney tahtasından yeniden sinyal veriyordu.",
            "en": "The scanner found a resonance trace Dr. E had not seen in years: the old X-Bond signature. The same signature was transmitting again from the first experiment board.",
            "de": "Der Scanner fand eine Resonanzspur, die Dr. E seit Jahren nicht mehr gesehen hatte: die alte X-Bindungs-Signatur. Dieselbe Signatur sendete wieder vom ersten Experimentierfeld.",
            "es": "El escáner encontró una huella de resonancia que Dr. E no veía desde hacía años: la antigua firma del Enlace X. La misma firma volvía a emitir desde el primer tablero experimental.",
            "pt": "O scanner encontrou um rastro de ressonância que o Dr. E não via havia anos: a antiga assinatura da Ligação X. A mesma assinatura voltava a emitir a partir do primeiro quadro experimental.",
            "ja": "スキャナーは、Dr. Eが何年も見ていなかった共鳴痕跡を検出した。かつてのX結合のシグネチャだ。同じ反応が最初の実験ボードから再び発信されていた。"
          },
          "caption": {
            "tr": "Unutulmuş bir deney yeniden uyanıyor.",
            "en": "A forgotten experiment is waking again.",
            "de": "Ein vergessenes Experiment erwacht erneut.",
            "es": "Un experimento olvidado vuelve a despertar.",
            "pt": "Um experimento esquecido está despertando outra vez.",
            "ja": "忘れられた実験が、再び目を覚ます。"
          },
          "cast": [
            "drE"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Tarayıcı, sayfada Dr. E’nin yıllardır görmediği tanıdık bir rezonans izi buldu: eski X-Bağı imzası. Aynı imza ilk deney tahtasından yeniden sinyal veriyordu.",
            "en": "The scanner found a resonance trace Dr. E had not seen in years: the old X-Bond signature. The same signature was transmitting again from the first experiment board.",
            "de": "Der Scanner fand eine Resonanzspur, die Dr. E seit Jahren nicht mehr gesehen hatte: die alte X-Bindungs-Signatur. Dieselbe Signatur sendete wieder vom ersten Experimentierfeld.",
            "es": "El escáner encontró una huella de resonancia que Dr. E no veía desde hacía años: la antigua firma del Enlace X. La misma firma volvía a emitir desde el primer tablero experimental.",
            "pt": "O scanner encontrou um rastro de ressonância que o Dr. E não via havia anos: a antiga assinatura da Ligação X. A mesma assinatura voltava a emitir a partir do primeiro quadro experimental.",
            "ja": "スキャナーは、Dr. Eが何年も見ていなかった共鳴痕跡を検出した。かつてのX結合のシグネチャだ。同じ反応が最初の実験ボードから再び発信されていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "TAK!",
          "text": {
            "tr": "Dr. Null kapıda belirdi. “Ben almadım, E. Kenarda normal bir yırtık izi yok; X-Bağı sayfayı dosyadan çekmiş gibi. Nereye götürdüğünü bulmalıyız.”",
            "en": "Dr. Null appeared at the door. “I did not take it, E. There is no normal tear along the edge; the X-Bond seems to have pulled the page out. We need to find where it went.”",
            "de": "Dr. Null erschien an der Tür. “Ich habe sie nicht genommen, E. Am Rand gibt es keinen normalen Riss; die X-Bindung scheint die Seite herausgezogen zu haben. Wir müssen herausfinden, wohin sie gelangt ist.”",
            "es": "Dr. Null apareció en la puerta. “Yo no la tomé, E. No hay un desgarro normal en el borde; parece que el Enlace X arrancó la página. Tenemos que averiguar adónde fue.”",
            "pt": "Dr. Null apareceu à porta. “Eu não peguei a página, E. Não há um rasgo normal na borda; parece que a Ligação X puxou a página para fora. Precisamos descobrir para onde ela foi.”",
            "ja": "Dr. Nullが入口に現れた。 “私が取ったんじゃない、E。端に普通の破れ方がない。X結合がページを引き抜いたようだ。どこへ行ったのか突き止めよう。”"
          },
          "caption": {
            "tr": "Dr. E ve Dr. Null bu izi ilk kez görmüyor.",
            "en": "Dr. E and Dr. Null have seen this signature before.",
            "de": "Dr. E und Dr. Null kennen diese Signatur bereits.",
            "es": "Dr. E y Dr. Null ya han visto esta firma antes.",
            "pt": "Dr. E e Dr. Null já viram essa assinatura antes.",
            "ja": "Dr. EとDr. Nullは、このシグネチャを以前にも見ている。"
          },
          "cast": [
            "drE",
            "null"
          ],
          "shot": "wide",
          "img": "assets/images/story-user/01-dr-null-arrives.webp",
          "narration": {
            "tr": "Dr. Null kapıda belirdi.",
            "en": "Dr. Null appeared at the door.",
            "de": "Dr. Null erschien an der Tür.",
            "es": "Dr. Null apareció en la puerta.",
            "pt": "Dr. Null apareceu à porta.",
            "ja": "Dr. Nullが入口に現れた。"
          },
          "dialogue": {
            "tr": "Ben almadım, E. Bu iz yıllar önce kapattığımız X çalışmasına ait. Sayfayı normal bir şey yırtmamış; rezonans onu çekip götürmüş. Nereye gittiğini bulmalıyız.",
            "en": "I did not take it, E. This trace belongs to the X work we shut down years ago. Nothing ordinary tore that page out; resonance pulled it away. We need to find where it went.",
            "de": "Ich habe sie nicht genommen, E. Diese Spur gehört zu der X-Arbeit, die wir vor Jahren eingestellt haben. Nichts Gewöhnliches hat die Seite herausgerissen; die Resonanz hat sie fortgezogen. Wir müssen herausfinden, wohin.",
            "es": "Yo no la tomé, E. Esta huella pertenece al trabajo X que cerramos hace años. Nada normal arrancó esa página; la resonancia se la llevó. Tenemos que averiguar adónde.",
            "pt": "Eu não peguei a página, E. Esse rastro pertence ao trabalho X que encerramos anos atrás. Nada comum arrancou a página; a ressonância a puxou para longe. Precisamos descobrir para onde.",
            "ja": "私が取ったんじゃない、E。この痕跡は、何年も前に封印したX研究のものだ。普通の力で破られたんじゃない。共鳴がページを引き抜いた。行き先を突き止めよう。"
          }
        }
      ]
    },
    {
      "id": "x-signal",
      "chapter": 2,
      "startLevel": 16,
      "unlockAfter": 15,
      "world": "quantum-lab",
      "bang": "VZZZT!",
      "title": {
        "tr": "X SİNYALİ",
        "en": "THE X SIGNAL",
        "de": "DAS X-SIGNAL",
        "es": "LA SEÑAL X",
        "pt": "O SINAL X",
        "ja": "Xシグナル"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "VZZZT!",
          "text": {
            "tr": "On beş molekül tamamlandığında laboratuvar duvarlarında mavi bir titreşim dolaştı. X Sinyali güçleniyordu.",
            "en": "When fifteen molecules were complete, a blue pulse ran through the lab walls. The X Signal was growing stronger.",
            "de": "Als fünfzehn Moleküle fertig waren, lief ein blauer Impuls durch die Laborwände. Das X-Signal wurde stärker.",
            "es": "Cuando se completaron quince moléculas, un pulso azul recorrió las paredes del laboratorio. La Señal X se estaba haciendo más fuerte.",
            "pt": "Quando quinze moléculas foram concluídas, um pulso azul percorreu as paredes do laboratório. O Sinal X estava ficando mais forte.",
            "ja": "15個の分子が完成すると、青い脈動が研究所の壁を走った。Xシグナルはさらに強くなっていた。"
          },
          "caption": {
            "tr": "Sinyal, kurulmuş bağlardan enerji topluyor.",
            "en": "The signal is drawing energy from completed bonds.",
            "de": "Das Signal zieht Energie aus bereits gebildeten Bindungen.",
            "es": "La señal está extrayendo energía de los enlaces ya formados.",
            "pt": "O sinal está retirando energia das ligações concluídas.",
            "ja": "信号は完成した結合からエネルギーを吸い上げている。"
          },
          "cast": [
            "drE"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "On beş molekül tamamlandığında laboratuvar duvarlarında mavi bir titreşim dolaştı. X Sinyali güçleniyordu.",
            "en": "When fifteen molecules were complete, a blue pulse ran through the lab walls. The X Signal was growing stronger.",
            "de": "Als fünfzehn Moleküle fertig waren, lief ein blauer Impuls durch die Laborwände. Das X-Signal wurde stärker.",
            "es": "Cuando se completaron quince moléculas, un pulso azul recorrió las paredes del laboratorio. La Señal X se estaba haciendo más fuerte.",
            "pt": "Quando quinze moléculas foram concluídas, um pulso azul percorreu as paredes do laboratório. O Sinal X estava ficando mais forte.",
            "ja": "15個の分子が完成すると、青い脈動が研究所の壁を走った。Xシグナルはさらに強くなっていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "",
          "text": {
            "tr": "Dr. Null ölçümleri karşılaştırdı. “Bu sabotaj değil. Sinyal formüldeki X-Bağına tutunmuş; sayfayı bir yere taşımış ve şimdi bağ kurmayı öğreniyor.”",
            "en": "Dr. Null compared the readings. “This is not sabotage. The signal latched onto the X-Bond in the formula, carried the page somewhere, and is now learning how bonds form.”",
            "de": "Dr. Null verglich die Messwerte. “Das ist keine Sabotage. Das Signal hat sich an die X-Bindung in der Formel geheftet, die Seite irgendwohin getragen und lernt nun, wie Bindungen entstehen.”",
            "es": "Dr. Null comparó las lecturas. “Esto no es sabotaje. La señal se aferró al Enlace X de la fórmula, llevó la página a algún lugar y ahora está aprendiendo cómo se forman los enlaces.”",
            "pt": "Dr. Null comparou as leituras. “Isto não é sabotagem. O sinal se prendeu à Ligação X da fórmula, levou a página para algum lugar e agora está aprendendo como as ligações se formam.”",
            "ja": "Dr. Nullは測定値を比較した。 “これは妨害ではない。信号は数式のX結合に取りつき、ページをどこかへ運び、今は結合がどう作られるか学んでいる。”"
          },
          "caption": {
            "tr": "Null’un kuru sesi ilk kez endişeliydi.",
            "en": "For once, Null’s dry voice carried concern.",
            "de": "Zum ersten Mal klang Nulls trockene Stimme besorgt.",
            "es": "Por primera vez, la voz seca de Null sonaba preocupada.",
            "pt": "Pela primeira vez, a voz seca de Null demonstrou preocupação.",
            "ja": "いつも冷静なNullの声に、初めて不安が混じった。"
          },
          "cast": [
            "null"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Dr. Null ölçümleri karşılaştırdı.",
            "en": "Dr. Null compared the readings.",
            "de": "Dr. Null verglich die Messwerte.",
            "es": "Dr. Null comparó las lecturas.",
            "pt": "Dr. Null comparou as leituras.",
            "ja": "Dr. Nullは測定値を比較した。"
          },
          "dialogue": {
            "tr": "Bu sabotaj değil. Sinyal formüldeki X-Bağına tutunmuş; sayfayı bir yere taşımış ve şimdi bağ kurmayı öğreniyor.",
            "en": "This is not sabotage. The signal latched onto the X-Bond in the formula, carried the page somewhere, and is now learning how bonds form.",
            "de": "Das ist keine Sabotage. Das Signal hat sich an die X-Bindung in der Formel geheftet, die Seite irgendwohin getragen und lernt nun, wie Bindungen entstehen.",
            "es": "Esto no es sabotaje. La señal se aferró al Enlace X de la fórmula, llevó la página a algún lugar y ahora está aprendiendo cómo se forman los enlaces.",
            "pt": "Isto não é sabotagem. O sinal se prendeu à Ligação X da fórmula, levou a página para algum lugar e agora está aprendendo como as ligações se formam.",
            "ja": "これは妨害ではない。信号は数式のX結合に取りつき、ページをどこかへ運び、今は結合がどう作られるか学んでいる。"
          }
        },
        {
          "speaker": "cat",
          "bang": "MRRRP?",
          "text": {
            "tr": "Null’un gri-beyaz kedisi atom kolyesini patisiyle tuttu. Dr. Null, yıllar önce kapatılan X deneyinden kalan küçük bir rezonans kristalini bu kolyenin içine güvenli bir algılayıcı olarak yerleştirmişti. Kristal şimdi X Sinyaliyle aynı ritimde parlıyordu.",
            "en": "Null’s gray-and-white cat held its atom pendant with one paw. Years ago, Dr. Null had sealed a tiny resonance crystal left from the discontinued X experiment inside the pendant as a safe detector. Now it was glowing in the exact rhythm of the X Signal.",
            "de": "Nulls grau-weiße Katze hielt ihren Atom-Anhänger mit einer Pfote fest. Vor Jahren hatte Dr. Null einen kleinen Resonanzkristall aus dem eingestellten X-Experiment als sicheren Sensor in den Anhänger eingesetzt. Nun leuchtete er genau im Rhythmus des X-Signals.",
            "es": "El gato gris y blanco de Null sujetó su colgante atómico con una pata. Años atrás, Dr. Null había sellado en el colgante un pequeño cristal de resonancia del experimento X cancelado para usarlo como detector seguro. Ahora brillaba exactamente al ritmo de la Señal X.",
            "pt": "O gato cinza e branco de Null segurou o pingente de átomo com a pata. Anos atrás, o Dr. Null havia selado no pingente um pequeno cristal de ressonância restante do experimento X encerrado, usando-o como detector seguro. Agora ele brilhava exatamente no ritmo do Sinal X.",
            "ja": "Nullの灰白色のネコは、前足で原子ペンダントを押さえた。数年前、Dr. Nullは中止されたX実験に残った小さな共鳴結晶を、安全な検出器としてこのペンダントに封じていた。その結晶が今、Xシグナルとまったく同じリズムで光っている。"
          },
          "caption": {
            "tr": "Kolye bir süs değil; eski X rezonansını algılayan küçük bir sensör.",
            "en": "The pendant is not decoration; it is a tiny sensor for the old X resonance.",
            "de": "Der Anhänger ist kein Schmuck, sondern ein kleiner Sensor für die alte X-Resonanz.",
            "es": "El colgante no es un adorno: es un pequeño sensor de la antigua resonancia X.",
            "pt": "O pingente não é enfeite: é um pequeno sensor da antiga ressonância X.",
            "ja": "このペンダントは飾りではない。かつてのX共鳴を検出する小型センサーだ。"
          },
          "cast": [
            "null",
            "cat"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Null’un gri-beyaz kedisi atom kolyesini patisiyle tuttu. Dr. Null, yıllar önce kapatılan X deneyinden kalan küçük bir rezonans kristalini bu kolyenin içine güvenli bir algılayıcı olarak yerleştirmişti. Kristal şimdi X Sinyaliyle aynı ritimde parlıyordu.",
            "en": "Null’s gray-and-white cat held its atom pendant with one paw. Years ago, Dr. Null had sealed a tiny resonance crystal left from the discontinued X experiment inside the pendant as a safe detector. Now it was glowing in the exact rhythm of the X Signal.",
            "de": "Nulls grau-weiße Katze hielt ihren Atom-Anhänger mit einer Pfote fest. Vor Jahren hatte Dr. Null einen kleinen Resonanzkristall aus dem eingestellten X-Experiment als sicheren Sensor in den Anhänger eingesetzt. Nun leuchtete er genau im Rhythmus des X-Signals.",
            "es": "El gato gris y blanco de Null sujetó su colgante atómico con una pata. Años atrás, Dr. Null había sellado en el colgante un pequeño cristal de resonancia del experimento X cancelado para usarlo como detector seguro. Ahora brillaba exactamente al ritmo de la Señal X.",
            "pt": "O gato cinza e branco de Null segurou o pingente de átomo com a pata. Anos atrás, o Dr. Null havia selado no pingente um pequeno cristal de ressonância restante do experimento X encerrado, usando-o como detector seguro. Agora ele brilhava exatamente no ritmo do Sinal X.",
            "ja": "Nullの灰白色のネコは、前足で原子ペンダントを押さえた。数年前、Dr. Nullは中止されたX実験に残った小さな共鳴結晶を、安全な検出器としてこのペンダントに封じていた。その結晶が今、Xシグナルとまったく同じリズムで光っている。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    },
    {
      "id": "cold-protocol",
      "chapter": 3,
      "startLevel": 31,
      "unlockAfter": 30,
      "world": "quantum-lab",
      "bang": "ÇAT!",
      "title": {
        "tr": "SOĞUK PROTOKOL",
        "en": "COLD PROTOCOL",
        "de": "KÄLTEPROTOKOLL",
        "es": "PROTOCOLO DE FRÍO",
        "pt": "PROTOCOLO FRIO",
        "ja": "冷却プロトコル"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "FŞŞŞ!",
          "text": {
            "tr": "X Sinyali soğutma sistemini tersine çevirdi. Donmuş atomlar koridorları kilitledi.",
            "en": "The X Signal reversed the cooling system. Frozen atoms locked the corridors.",
            "de": "Das X-Signal kehrte das Kühlsystem um. Gefrorene Atome blockierten die Korridore.",
            "es": "La Señal X invirtió el sistema de refrigeración. Los átomos congelados bloquearon los pasillos.",
            "pt": "O Sinal X inverteu o sistema de resfriamento. Átomos congelados bloquearam os corredores.",
            "ja": "Xシグナルが冷却装置を逆転させた。凍った原子が通路を塞いだ。"
          },
          "caption": {
            "tr": "Buz çözülmeden kanıta ulaşılamaz.",
            "en": "The evidence cannot be reached until the ice melts.",
            "de": "Der Beweis ist erst erreichbar, wenn das Eis schmilzt.",
            "es": "No se puede llegar a la prueba hasta que el hielo se derrita.",
            "pt": "Não é possível alcançar a prova até que o gelo derreta.",
            "ja": "氷が溶けるまで証拠にはたどり着けない。"
          },
          "cast": [
            "drE"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "X Sinyali soğutma sistemini tersine çevirdi. Donmuş atomlar koridorları kilitledi.",
            "en": "The X Signal reversed the cooling system. Frozen atoms locked the corridors.",
            "de": "Das X-Signal kehrte das Kühlsystem um. Gefrorene Atome blockierten die Korridore.",
            "es": "La Señal X invirtió el sistema de refrigeración. Los átomos congelados bloquearon los pasillos.",
            "pt": "O Sinal X inverteu o sistema de resfriamento. Átomos congelados bloquearam os corredores.",
            "ja": "Xシグナルが冷却装置を逆転させた。凍った原子が通路を塞いだ。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "ÇAT!",
          "text": {
            "tr": "Dr. Null kontrollü ısı darbeleri tasarladı. “Güç kullanma. Doğru atomu doğru anda ısıt.”",
            "en": "Dr. Null designed controlled heat pulses. “Do not use force. Heat the right atom at the right moment.”",
            "de": "Dr. Null entwickelte kontrollierte Wärmeimpulse. “Keine Gewalt. Erhitze das richtige Atom im richtigen Moment.”",
            "es": "Dr. Null diseñó pulsos de calor controlados. “No uses la fuerza. Calienta el átomo correcto en el momento correcto.”",
            "pt": "Dr. Null projetou pulsos de calor controlados. “Não use força. Aqueça o átomo certo no momento certo.”",
            "ja": "Dr. Nullは制御された熱パルスを設計した。 “力任せにするな。正しい原子を、正しい瞬間に温めるんだ。”"
          },
          "caption": {
            "tr": "Hassasiyet, ham güçten daha değerlidir.",
            "en": "Precision is worth more than brute force.",
            "de": "Präzision ist mehr wert als rohe Kraft.",
            "es": "La precisión vale más que la fuerza bruta.",
            "pt": "Precisão vale mais do que força bruta.",
            "ja": "力より精密さがものを言う。"
          },
          "cast": [
            "null"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Dr. Null kontrollü ısı darbeleri tasarladı.",
            "en": "Dr. Null designed controlled heat pulses.",
            "de": "Dr. Null entwickelte kontrollierte Wärmeimpulse.",
            "es": "Dr. Null diseñó pulsos de calor controlados.",
            "pt": "Dr. Null projetou pulsos de calor controlados.",
            "ja": "Dr. Nullは制御された熱パルスを設計した。"
          },
          "dialogue": {
            "tr": "Güç kullanma. Doğru atomu doğru anda ısıt.",
            "en": "Do not use force. Heat the right atom at the right moment.",
            "de": "Keine Gewalt. Erhitze das richtige Atom im richtigen Moment.",
            "es": "No uses la fuerza. Calienta el átomo correcto en el momento correcto.",
            "pt": "Não use força. Aqueça o átomo certo no momento certo.",
            "ja": "力任せにするな。正しい原子を、正しい瞬間に温めるんだ。"
          }
        },
        {
          "speaker": "cat",
          "bang": "MİYAV!",
          "text": {
            "tr": "Kedi, buzun altında saklanan X işaretini buldu. İşaret 50. deneyi gösteriyordu.",
            "en": "The cat found an X mark hidden beneath the ice. It pointed to Experiment 50.",
            "de": "Die Katze fand ein unter dem Eis verborgenes X-Zeichen. Es wies auf Experiment 50.",
            "es": "El gato encontró una marca X oculta bajo el hielo. Apuntaba al Experimento 50.",
            "pt": "O gato encontrou uma marca X escondida sob o gelo. Ela apontava para o Experimento 50.",
            "ja": "ネコは氷の下に隠れたX印を見つけた。それは実験50を示していた。"
          },
          "caption": {
            "tr": "Bir sonraki ipucu bir sayı olarak yazılmıştı.",
            "en": "The next clue was written as a number.",
            "de": "Der nächste Hinweis war als Zahl geschrieben.",
            "es": "La siguiente pista estaba escrita como un número.",
            "pt": "A próxima pista estava escrita como um número.",
            "ja": "次の手がかりは数字で記されていた。"
          },
          "cast": [
            "drE",
            "null",
            "cat"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Kedi, buzun altında saklanan X işaretini buldu. İşaret 50. deneyi gösteriyordu.",
            "en": "The cat found an X mark hidden beneath the ice. It pointed to Experiment 50.",
            "de": "Die Katze fand ein unter dem Eis verborgenes X-Zeichen. Es wies auf Experiment 50.",
            "es": "El gato encontró una marca X oculta bajo el hielo. Apuntaba al Experimento 50.",
            "pt": "O gato encontrou uma marca X escondida sob o gelo. Ela apontava para o Experimento 50.",
            "ja": "ネコは氷の下に隠れたX印を見つけた。それは実験50を示していた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    },
    {
      "id": "experiment-fifty",
      "chapter": 4,
      "startLevel": 46,
      "unlockAfter": 45,
      "world": "quantum-lab",
      "bang": "UYARI!",
      "title": {
        "tr": "ELLİNCİ DENEY",
        "en": "EXPERIMENT FIFTY",
        "de": "EXPERIMENT FÜNFZIG",
        "es": "EXPERIMENTO CINCUENTA",
        "pt": "EXPERIMENTO CINQUENTA",
        "ja": "実験50"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "UYARI!",
          "text": {
            "tr": "Dr. E, X-Bağını güvenli bir molekülde gözlemlemek için 50. deneyi hazırladı.",
            "en": "Dr. E prepared Experiment 50 to observe the X-Bond inside a stable molecule.",
            "de": "Dr. E bereitete Experiment 50 vor, um die X-Bindung in einem stabilen Molekül zu beobachten.",
            "es": "Dr. E preparó el Experimento 50 para observar el Enlace X dentro de una molécula estable.",
            "pt": "Dr. E preparou o Experimento 50 para observar a Ligação X dentro de uma molécula estável.",
            "ja": "Dr. Eは、安定した分子の中でX結合を観測するため実験50を準備した。"
          },
          "caption": {
            "tr": "Katalizör, enerji hücresi ve stabilizatör hazır.",
            "en": "Catalyst, energy cell, and stabilizer are ready.",
            "de": "Katalysator, Energiezelle und Stabilisator sind bereit.",
            "es": "Catalizador, célula de energía y estabilizador listos.",
            "pt": "Catalisador, célula de energia e estabilizador estão prontos.",
            "ja": "触媒、エネルギーセル、安定化装置――準備完了。"
          },
          "cast": [
            "drE"
          ],
          "shot": "wide",
          "img": "assets/images/story-user/04-experiment-fifty.webp",
          "narration": {
            "tr": "Dr. E, X-Bağını güvenli bir molekülde gözlemlemek için 50. deneyi hazırladı.",
            "en": "Dr. E prepared Experiment 50 to observe the X-Bond inside a stable molecule.",
            "de": "Dr. E bereitete Experiment 50 vor, um die X-Bindung in einem stabilen Molekül zu beobachten.",
            "es": "Dr. E preparó el Experimento 50 para observar el Enlace X dentro de una molécula estable.",
            "pt": "Dr. E preparou o Experimento 50 para observar a Ligação X dentro de uma molécula estável.",
            "ja": "Dr. Eは、安定した分子の中でX結合を観測するため実験50を準備した。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "",
          "text": {
            "tr": "Dr. Null ekranı işaret etti. Rezonans güvenli sınırı aşıyordu; Dr. E ise konsoldan ayrılmadı. “Rezonans yükseliyor. Bu deneyi durdurabiliriz.”",
            "en": "Dr. Null pointed at the display. Resonance was crossing the safe limit, but Dr. E stayed at the console. “Resonance is rising. We can stop this experiment.”",
            "de": "Dr. Null zeigte auf die Anzeige. Die Resonanz überschritt die Sicherheitsgrenze, doch Dr. E blieb am Bedienpult. “Die Resonanz steigt. Wir können dieses Experiment stoppen.”",
            "es": "Dr. Null señaló la pantalla. La resonancia estaba superando el límite seguro, pero Dr. E permaneció en la consola. “La resonancia está subiendo. Podemos detener este experimento.”",
            "pt": "Dr. Null apontou para o visor. A ressonância ultrapassava o limite seguro, mas Dr. E permaneceu no console. “A ressonância está aumentando. Podemos interromper este experimento.”",
            "ja": "Dr. Nullが表示を指さした。共鳴は安全限界を越えつつあったが、Dr. Eはコンソールを離れなかった。 “共鳴が上がっている。この実験は止められる。”"
          },
          "caption": {
            "tr": "Dr. E deneyi durdurmadı; gerçeği görmek istiyordu.",
            "en": "Dr. E did not stop the experiment; he wanted to see the truth.",
            "de": "Dr. E stoppte das Experiment nicht; er wollte die Wahrheit sehen.",
            "es": "Dr. E no detuvo el experimento; quería conocer la verdad.",
            "pt": "Dr. E não interrompeu o experimento; queria descobrir a verdade.",
            "ja": "Dr. Eは実験を止めなかった。真実を見届けようとしていた。"
          },
          "cast": [
            "drE",
            "null"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Dr. Null ekranı işaret etti. Rezonans güvenli sınırı aşıyordu; Dr. E ise konsoldan ayrılmadı.",
            "en": "Dr. Null pointed at the display. Resonance was crossing the safe limit, but Dr. E stayed at the console.",
            "de": "Dr. Null zeigte auf die Anzeige. Die Resonanz überschritt die Sicherheitsgrenze, doch Dr. E blieb am Bedienpult.",
            "es": "Dr. Null señaló la pantalla. La resonancia estaba superando el límite seguro, pero Dr. E permaneció en la consola.",
            "pt": "Dr. Null apontou para o visor. A ressonância ultrapassava o limite seguro, mas Dr. E permaneceu no console.",
            "ja": "Dr. Nullが表示を指さした。共鳴は安全限界を越えつつあったが、Dr. Eはコンソールを離れなかった。"
          },
          "dialogue": {
            "tr": "Rezonans yükseliyor. Bu deneyi durdurabiliriz.",
            "en": "Resonance is rising. We can stop this experiment.",
            "de": "Die Resonanz steigt. Wir können dieses Experiment stoppen.",
            "es": "La resonancia está subiendo. Podemos detener este experimento.",
            "pt": "A ressonância está aumentando. Podemos interromper este experimento.",
            "ja": "共鳴が上がっている。この実験は止められる。"
          }
        },
        {
          "speaker": "drE",
          "bang": "HSSS!",
          "text": {
            "tr": "Dr. E başını sallayıp 50. deneyi başlattı. Aynı anda kedinin tüyleri kabardı ve atom kolyesi reaktörle birlikte parladı. “Ya da gerçeği öğreniriz.”",
            "en": "Dr. E shook his head and started Experiment 50. At the same moment, the cat’s fur stood on end and its atom pendant flashed with the reactor. “Or we learn the truth.”",
            "de": "Dr. E schüttelte den Kopf und startete Experiment 50. Im selben Moment sträubte sich das Fell der Katze und ihr Atom-Anhänger blinkte im Takt des Reaktors. “Oder wir erfahren die Wahrheit.”",
            "es": "Dr. E negó con la cabeza y puso en marcha el Experimento 50. Al mismo tiempo, el pelo del gato se erizó y su colgante atómico parpadeó al ritmo del reactor. “O descubrimos la verdad.”",
            "pt": "Dr. E balançou a cabeça e iniciou o Experimento 50. No mesmo instante, o pelo do gato se arrepiou e seu pingente de átomo piscou junto com o reator. “Ou descobrimos a verdade.”",
            "ja": "Dr. Eは首を振り、実験50を開始した。同時にネコの毛が逆立ち、原子のペンダントがリアクターと同時に光った。 “それとも、真実を知るかだ。”"
          },
          "caption": {
            "tr": "Geri sayım başladı. Beş deney sonra hiçbir şey aynı olmayacak.",
            "en": "The countdown began. In five experiments, nothing would be the same.",
            "de": "Der Countdown begann. In fünf Experimenten würde nichts mehr so sein wie zuvor.",
            "es": "Comenzó la cuenta atrás. En cinco experimentos nada volvería a ser igual.",
            "pt": "A contagem regressiva começou. Em cinco experimentos, nada seria igual.",
            "ja": "カウントダウンが始まった。あと5つの実験で、すべてが変わる。"
          },
          "cast": [
            "cat",
            "drE",
            "null"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Dr. E başını sallayıp 50. deneyi başlattı. Aynı anda kedinin tüyleri kabardı ve atom kolyesi reaktörle birlikte parladı.",
            "en": "Dr. E shook his head and started Experiment 50. At the same moment, the cat’s fur stood on end and its atom pendant flashed with the reactor.",
            "de": "Dr. E schüttelte den Kopf und startete Experiment 50. Im selben Moment sträubte sich das Fell der Katze und ihr Atom-Anhänger blinkte im Takt des Reaktors.",
            "es": "Dr. E negó con la cabeza y puso en marcha el Experimento 50. Al mismo tiempo, el pelo del gato se erizó y su colgante atómico parpadeó al ritmo del reactor.",
            "pt": "Dr. E balançou a cabeça e iniciou o Experimento 50. No mesmo instante, o pelo do gato se arrepiou e seu pingente de átomo piscou junto com o reator.",
            "ja": "Dr. Eは首を振り、実験50を開始した。同時にネコの毛が逆立ち、原子のペンダントがリアクターと同時に光った。"
          },
          "dialogue": {
            "tr": "Ya da gerçeği öğreniriz.",
            "en": "Or we learn the truth.",
            "de": "Oder wir erfahren die Wahrheit.",
            "es": "O descubrimos la verdad.",
            "pt": "Ou descobrimos a verdade.",
            "ja": "それとも、真実を知るかだ。"
          }
        }
      ]
    },
    {
      "id": "moxy-awakens",
      "chapter": 5,
      "startLevel": 51,
      "unlockAfter": 50,
      "world": "quantum-lab",
      "bang": "KABOOM!",
      "moxyUnlock": true,
      "title": {
        "tr": "MOXY UYANIYOR",
        "en": "MOXY AWAKENS",
        "de": "MOXY ERWACHT",
        "es": "MOXY DESPIERTA",
        "pt": "MOXY DESPERTA",
        "ja": "MOXY、目覚める"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "",
          "text": {
            "tr": "50. deney tamamlandı. X-Bağı, Dr. E’nin kurduğu molekülün merkezinde kararlı görünüyordu.",
            "en": "Experiment 50 was complete. The X-Bond looked stable at the heart of Dr. E’s molecule.",
            "de": "Experiment 50 war abgeschlossen. Die X-Bindung wirkte im Kern von Dr. Es Molekül stabil.",
            "es": "El Experimento 50 había terminado. El Enlace X parecía estable en el corazón de la molécula de Dr. E.",
            "pt": "O Experimento 50 foi concluído. A Ligação X parecia estável no centro da molécula do Dr. E.",
            "ja": "実験50が完了した。X結合はDr. Eの分子の中心で安定しているように見えた。"
          },
          "caption": {
            "tr": "Bir saniyeliğine her şey kusursuzdu.",
            "en": "For one second, everything was perfect.",
            "de": "Für eine Sekunde war alles perfekt.",
            "es": "Durante un segundo, todo fue perfecto.",
            "pt": "Por um segundo, tudo estava perfeito.",
            "ja": "ほんの一秒、すべてが完璧だった。"
          },
          "cast": [
            "drE",
            "null"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "50. deney tamamlandı. X-Bağı, Dr. E’nin kurduğu molekülün merkezinde kararlı görünüyordu.",
            "en": "Experiment 50 was complete. The X-Bond looked stable at the heart of Dr. E’s molecule.",
            "de": "Experiment 50 war abgeschlossen. Die X-Bindung wirkte im Kern von Dr. Es Molekül stabil.",
            "es": "El Experimento 50 había terminado. El Enlace X parecía estable en el corazón de la molécula de Dr. E.",
            "pt": "O Experimento 50 foi concluído. A Ligação X parecia estável no centro da molécula do Dr. E.",
            "ja": "実験50が完了した。X結合はDr. Eの分子の中心で安定しているように見えた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "VZZZZT!",
          "text": {
            "tr": "Enerji aniden ters aktı. Null ana şalteri indirdi ama X Sinyali kendi devresini kurdu.",
            "en": "Energy suddenly reversed. Null pulled the master switch, but the X Signal built its own circuit.",
            "de": "Plötzlich kehrte sich der Energiefluss um. Null legte den Hauptschalter um, doch das X-Signal baute seinen eigenen Stromkreis.",
            "es": "La energía se invirtió de repente. Null bajó el interruptor principal, pero la Señal X construyó su propio circuito.",
            "pt": "A energia de repente inverteu o fluxo. Null puxou a chave geral, mas o Sinal X criou seu próprio circuito.",
            "ja": "突然エネルギーが逆流した。Nullが主電源を落としたが、Xシグナルは自分自身の回路を作り始めた。"
          },
          "caption": {
            "tr": "Laboratuvar artık deneyi değil, deney laboratuvarı yönetiyordu.",
            "en": "The experiment was now running the laboratory.",
            "de": "Nun steuerte das Experiment das Labor.",
            "es": "Ahora el experimento controlaba el laboratorio.",
            "pt": "Agora era o experimento que controlava o laboratório.",
            "ja": "もはや研究所が実験を動かしているのではない。実験が研究所を動かしていた。"
          },
          "cast": [
            "null",
            "drE"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Enerji aniden ters aktı. Null ana şalteri indirdi ama X Sinyali kendi devresini kurdu.",
            "en": "Energy suddenly reversed. Null pulled the master switch, but the X Signal built its own circuit.",
            "de": "Plötzlich kehrte sich der Energiefluss um. Null legte den Hauptschalter um, doch das X-Signal baute seinen eigenen Stromkreis.",
            "es": "La energía se invirtió de repente. Null bajó el interruptor principal, pero la Señal X construyó su propio circuito.",
            "pt": "A energia de repente inverteu o fluxo. Null puxou a chave geral, mas o Sinal X criou seu próprio circuito.",
            "ja": "突然エネルギーが逆流した。Nullが主電源を落としたが、Xシグナルは自分自身の回路を作り始めた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "cat",
          "bang": "HSSS!",
          "text": {
            "tr": "Kedi konsoldan sıçradı. Reaktör beyaz bir ışıkla doldu.",
            "en": "The cat leapt from the console. The reactor filled with white light.",
            "de": "Die Katze sprang vom Bedienpult. Der Reaktor füllte sich mit weißem Licht.",
            "es": "El gato saltó de la consola. El reactor se llenó de luz blanca.",
            "pt": "O gato saltou do console. O reator se encheu de luz branca.",
            "ja": "ネコがコンソールから飛び降りた。リアクターは白い光で満たされた。"
          },
          "caption": {
            "tr": "Bir nefeslik sessizlik…",
            "en": "One breath of silence…",
            "de": "Ein Atemzug Stille …",
            "es": "Un instante de silencio…",
            "pt": "Um instante de silêncio…",
            "ja": "一呼吸ぶんの静寂…"
          },
          "cast": [
            "cat"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Kedi konsoldan sıçradı. Reaktör beyaz bir ışıkla doldu.",
            "en": "The cat leapt from the console. The reactor filled with white light.",
            "de": "Die Katze sprang vom Bedienpult. Der Reaktor füllte sich mit weißem Licht.",
            "es": "El gato saltó de la consola. El reactor se llenó de luz blanca.",
            "pt": "O gato saltou do console. O reator se encheu de luz branca.",
            "ja": "ネコがコンソールから飛び降りた。リアクターは白い光で満たされた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "drE",
          "bang": "KABOOM!",
          "text": {
            "tr": "Patlama laboratuvarı sarı ve mavi parçacıklarla kapladı. Dumanın içinde iki büyük göz açıldı. “Bu… bir molekül mü?”",
            "en": "The blast filled the lab with yellow and blue particles. Two enormous eyes opened inside the smoke. “Is that… a molecule?”",
            "de": "Die Explosion füllte das Labor mit gelben und blauen Partikeln. Im Rauch öffneten sich zwei riesige Augen. “Ist das … ein Molekül?”",
            "es": "La explosión llenó el laboratorio de partículas amarillas y azules. Dos enormes ojos se abrieron entre el humo. “¿Eso es… una molécula?”",
            "pt": "A explosão encheu o laboratório de partículas amarelas e azuis. Dois olhos enormes se abriram dentro da fumaça. “Isso é… uma molécula?”",
            "ja": "爆発で研究所は黄色と青の粒子に包まれた。煙の中で二つの大きな目が開いた。 “あれは…分子なのか？”"
          },
          "caption": {
            "tr": "X-Bağı, ilk kez canlı ve kararlı bir forma dönüşmüştü.",
            "en": "For the first time, the X-Bond had become a living, stable form.",
            "de": "Zum ersten Mal war die X-Bindung zu einer lebenden, stabilen Form geworden.",
            "es": "Por primera vez, el Enlace X se había convertido en una forma viva y estable.",
            "pt": "Pela primeira vez, a Ligação X havia se tornado uma forma viva e estável.",
            "ja": "X結合は初めて、生きた安定形態になった。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "action",
          "img": "assets/images/story-user/05-moxy-smoke.webp",
          "narration": {
            "tr": "Patlama laboratuvarı sarı ve mavi parçacıklarla kapladı. Dumanın içinde iki büyük göz açıldı.",
            "en": "The blast filled the lab with yellow and blue particles. Two enormous eyes opened inside the smoke.",
            "de": "Die Explosion füllte das Labor mit gelben und blauen Partikeln. Im Rauch öffneten sich zwei riesige Augen.",
            "es": "La explosión llenó el laboratorio de partículas amarillas y azules. Dos enormes ojos se abrieron entre el humo.",
            "pt": "A explosão encheu o laboratório de partículas amarelas e azuis. Dois olhos enormes se abriram dentro da fumaça.",
            "ja": "爆発で研究所は黄色と青の粒子に包まれた。煙の中で二つの大きな目が開いた。"
          },
          "dialogue": {
            "tr": "Bu… bir molekül mü?",
            "en": "Is that… a molecule?",
            "de": "Ist das … ein Molekül?",
            "es": "¿Eso es… una molécula?",
            "pt": "Isso é… uma molécula?",
            "ja": "あれは…分子なのか？"
          }
        },
        {
          "speaker": "moxy",
          "bang": "BWOOP!",
          "text": {
            "tr": "Moxy havada iki küçük tur attı. Dr. E gülümsedi; Dr. Null şaşkınlıktan not defterini düşürdü. “Bwoop-bwoop!”",
            "en": "Moxy spun two little circles in the air. Dr. E smiled; Dr. Null dropped his notebook in surprise. “Bwoop-bwoop!”",
            "de": "Moxy drehte zwei kleine Kreise in der Luft. Dr. E lächelte; Dr. Null ließ vor Überraschung sein Notizbuch fallen. “Bwoop-bwoop!”",
            "es": "Moxy dio dos pequeñas vueltas en el aire. Dr. E sonrió; Dr. Null dejó caer su libreta de la sorpresa. “¡Bwoop-bwoop!”",
            "pt": "Moxy deu duas pequenas voltas no ar. Dr. E sorriu; Dr. Null deixou o caderno cair de surpresa. “Bwoop-bwoop!”",
            "ja": "Moxyは空中で小さく二回転した。Dr. Eは笑顔になり、Dr. Nullは驚いてノートを落とした。 “Bwoop-bwoop!”"
          },
          "caption": {
            "tr": "Moxy artık ekibin sözsüz ama çok canlı yeni üyesiydi.",
            "en": "Moxy was now the team’s lively, wordless new member.",
            "de": "Moxy war nun das lebhafte, wortlose neue Mitglied des Teams.",
            "es": "Moxy era ahora el nuevo miembro vivaz y sin palabras del equipo.",
            "pt": "Moxy agora era o novo integrante animado e sem palavras da equipe.",
            "ja": "Moxyは、元気いっぱいで言葉を話さない新しい仲間になった。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "hero",
          "img": "assets/images/story-user/05-moxy-reveal.webp",
          "narration": {
            "tr": "Moxy havada iki küçük tur attı. Dr. E gülümsedi; Dr. Null şaşkınlıktan not defterini düşürdü.",
            "en": "Moxy spun two little circles in the air. Dr. E smiled; Dr. Null dropped his notebook in surprise.",
            "de": "Moxy drehte zwei kleine Kreise in der Luft. Dr. E lächelte; Dr. Null ließ vor Überraschung sein Notizbuch fallen.",
            "es": "Moxy dio dos pequeñas vueltas en el aire. Dr. E sonrió; Dr. Null dejó caer su libreta de la sorpresa.",
            "pt": "Moxy deu duas pequenas voltas no ar. Dr. E sorriu; Dr. Null deixou o caderno cair de surpresa.",
            "ja": "Moxyは空中で小さく二回転した。Dr. Eは笑顔になり、Dr. Nullは驚いてノートを落とした。"
          },
          "dialogue": {
            "tr": "Bwoop-bwoop!",
            "en": "Bwoop-bwoop!",
            "de": "Bwoop-bwoop!",
            "es": "¡Bwoop-bwoop!",
            "pt": "Bwoop-bwoop!",
            "ja": "Bwoop-bwoop!"
          }
        }
      ]
    },
    {
      "id": "element-island",
      "chapter": 6,
      "startLevel": 76,
      "unlockAfter": 75,
      "world": "element-island",
      "bang": "VUUUŞ!",
      "title": {
        "tr": "ELEMENT ADASI",
        "en": "ELEMENT ISLAND",
        "de": "ELEMENTINSEL",
        "es": "ISLA DE LOS ELEMENTOS",
        "pt": "ILHA DOS ELEMENTOS",
        "ja": "元素島"
      },
      "pages": [
        {
          "speaker": "moxy",
          "bang": "VUUUŞ!",
          "text": {
            "tr": "Moxy, X Sinyalinin laboratuvarın dışına uzandığını hissetti. İz, okyanustaki Element Adası’na gidiyordu.",
            "en": "Moxy felt the X Signal stretching beyond the laboratory. The trail led to Element Island in the ocean.",
            "de": "Moxy spürte, dass sich das X-Signal über das Labor hinaus erstreckte. Die Spur führte zur Elementinsel im Ozean.",
            "es": "Moxy sintió que la Señal X se extendía más allá del laboratorio. El rastro conducía a la Isla Elemento, en medio del océano.",
            "pt": "Moxy sentiu o Sinal X se estender para além do laboratório. O rastro levava à Ilha dos Elementos, no oceano.",
            "ja": "MoxyはXシグナルが研究所の外へ伸びているのを感じ取った。その痕跡は海に浮かぶ元素島へ続いていた。"
          },
          "caption": {
            "tr": "İlk dünya tamamlandı; keşif dışarı taşındı.",
            "en": "The first world is complete; the expedition moves outside.",
            "de": "Die erste Welt ist abgeschlossen; die Expedition geht nach draußen.",
            "es": "El primer mundo está completo; la expedición sale al exterior.",
            "pt": "O primeiro mundo está concluído; a expedição segue para fora do laboratório.",
            "ja": "最初の世界は完了。探索は研究所の外へ進む。"
          },
          "cast": [
            "drE",
            "moxy"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "Moxy, X Sinyalinin laboratuvarın dışına uzandığını hissetti. İz, okyanustaki Element Adası’na gidiyordu.",
            "en": "Moxy felt the X Signal stretching beyond the laboratory. The trail led to Element Island in the ocean.",
            "de": "Moxy spürte, dass sich das X-Signal über das Labor hinaus erstreckte. Die Spur führte zur Elementinsel im Ozean.",
            "es": "Moxy sintió que la Señal X se extendía más allá del laboratorio. El rastro conducía a la Isla Elemento, en medio del océano.",
            "pt": "Moxy sentiu o Sinal X se estender para além do laboratório. O rastro levava à Ilha dos Elementos, no oceano.",
            "ja": "MoxyはXシグナルが研究所の外へ伸びているのを感じ取った。その痕跡は海に浮かぶ元素島へ続いていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "ÇIT!",
          "text": {
            "tr": "Null’un taşınabilir portalı ekibi sahile bıraktı. “Tam olarak hedeflediğim yer… sayılır.”",
            "en": "Null’s portable portal dropped the team on the shore. “More or less exactly where I aimed.”",
            "de": "Nulls tragbares Portal setzte das Team an der Küste ab. “Mehr oder weniger genau dort, wo ich hinwollte.”",
            "es": "El portal portátil de Null dejó al equipo en la costa. “Más o menos exactamente donde apuntaba.”",
            "pt": "O portal portátil de Null deixou a equipe na praia. “Mais ou menos exatamente onde eu mirei.”",
            "ja": "Nullの携帯ポータルは一行を海岸へ放り出した。 “だいたい、狙った場所そのものだ。”"
          },
          "caption": {
            "tr": "Manyetik kum, her adımı başka yöne çekiyor.",
            "en": "Magnetic sand pulls every step in a new direction.",
            "de": "Magnetischer Sand zieht jeden Schritt in eine neue Richtung.",
            "es": "La arena magnética tira de cada paso en una dirección distinta.",
            "pt": "A areia magnética puxa cada passo para uma direção diferente.",
            "ja": "磁気を帯びた砂が、一歩ごとに違う方向へ引っ張る。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Null’un taşınabilir portalı ekibi sahile bıraktı.",
            "en": "Null’s portable portal dropped the team on the shore.",
            "de": "Nulls tragbares Portal setzte das Team an der Küste ab.",
            "es": "El portal portátil de Null dejó al equipo en la costa.",
            "pt": "O portal portátil de Null deixou a equipe na praia.",
            "ja": "Nullの携帯ポータルは一行を海岸へ放り出した。"
          },
          "dialogue": {
            "tr": "Tam olarak hedeflediğim yer… sayılır.",
            "en": "More or less exactly where I aimed.",
            "de": "Mehr oder weniger genau dort, wo ich hinwollte.",
            "es": "Más o menos exactamente donde apuntaba.",
            "pt": "Mais ou menos exatamente onde eu mirei.",
            "ja": "だいたい、狙った場所そのものだ。"
          }
        },
        {
          "speaker": "cat",
          "bang": "MRRAV!",
          "text": {
            "tr": "Kedi ormandaki parlayan atom izine koştu. Moxy havadan yolu işaretledi.",
            "en": "The cat chased a glowing atomic trail into the jungle. Moxy marked the route from above.",
            "de": "Die Katze jagte einer leuchtenden Atomspur in den Dschungel nach. Moxy markierte den Weg aus der Luft.",
            "es": "El gato persiguió un rastro atómico brillante hasta la selva. Moxy marcó la ruta desde el aire.",
            "pt": "O gato perseguiu um rastro atômico brilhante até a selva. Moxy marcou o caminho do alto.",
            "ja": "ネコは光る原子の痕跡を追ってジャングルへ走った。Moxyは上空から道を示した。"
          },
          "caption": {
            "tr": "Doğa, laboratuvardan daha büyük bir bulmaca.",
            "en": "Nature is a larger puzzle than any laboratory.",
            "de": "Die Natur ist ein größeres Rätsel als jedes Labor.",
            "es": "La naturaleza es un rompecabezas más grande que cualquier laboratorio.",
            "pt": "A natureza é um quebra-cabeça maior do que qualquer laboratório.",
            "ja": "自然はどんな研究所よりも大きなパズルだ。"
          },
          "cast": [
            "cat",
            "moxy"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "Kedi ormandaki parlayan atom izine koştu. Moxy havadan yolu işaretledi.",
            "en": "The cat chased a glowing atomic trail into the jungle. Moxy marked the route from above.",
            "de": "Die Katze jagte einer leuchtenden Atomspur in den Dschungel nach. Moxy markierte den Weg aus der Luft.",
            "es": "El gato persiguió un rastro atómico brillante hasta la selva. Moxy marcó la ruta desde el aire.",
            "pt": "O gato perseguiu um rastro atômico brilhante até a selva. Moxy marcou o caminho do alto.",
            "ja": "ネコは光る原子の痕跡を追ってジャングルへ走った。Moxyは上空から道を示した。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    },
    {
      "id": "magnetic-shore",
      "chapter": 7,
      "startLevel": 91,
      "unlockAfter": 90,
      "world": "element-island",
      "bang": "ÇINNN!",
      "title": {
        "tr": "MANYETİK KIYI",
        "en": "MAGNETIC SHORE",
        "de": "MAGNETISCHE KÜSTE",
        "es": "COSTA MAGNÉTICA",
        "pt": "COSTA MAGNÉTICA",
        "ja": "磁気の海岸"
      },
      "pages": [
        {
          "speaker": "moxy",
          "bang": "ÇINNN!",
          "text": {
            "tr": "Moxy’nin yüzen elleri, görünmeyen manyetik çizgileri hissedebiliyordu.",
            "en": "Moxy’s floating hands could feel invisible magnetic lines.",
            "de": "Moxys schwebende Hände konnten unsichtbare Magnetfeldlinien spüren.",
            "es": "Las manos flotantes de Moxy podían sentir líneas magnéticas invisibles.",
            "pt": "As mãos flutuantes de Moxy conseguiam sentir linhas magnéticas invisíveis.",
            "ja": "Moxyの浮かぶ手は、目に見えない磁力線を感じ取れた。"
          },
          "caption": {
            "tr": "Moxy ilk kez yalnızca rehber değil, çözümün parçası.",
            "en": "For the first time, Moxy is part of the solution, not just a guide.",
            "de": "Zum ersten Mal ist Moxy Teil der Lösung und nicht nur ein Wegweiser.",
            "es": "Por primera vez, Moxy forma parte de la solución y no es solo un guía.",
            "pt": "Pela primeira vez, Moxy faz parte da solução, não é apenas um guia.",
            "ja": "Moxyは初めて、案内役ではなく解決そのものの一部になる。"
          },
          "cast": [
            "moxy"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Moxy’nin yüzen elleri, görünmeyen manyetik çizgileri hissedebiliyordu.",
            "en": "Moxy’s floating hands could feel invisible magnetic lines.",
            "de": "Moxys schwebende Hände konnten unsichtbare Magnetfeldlinien spüren.",
            "es": "Las manos flotantes de Moxy podían sentir líneas magnéticas invisibles.",
            "pt": "As mãos flutuantes de Moxy conseguiam sentir linhas magnéticas invisíveis.",
            "ja": "Moxyの浮かぶ手は、目に見えない磁力線を感じ取れた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "drE",
          "bang": "TAK!",
          "text": {
            "tr": "Dr. E atomları çizgilere göre hizaladı. Her doğru bağ, adanın merkezindeki kapıyı biraz daha açtı.",
            "en": "Dr. E aligned atoms along the field lines. Every correct bond opened the island’s central gate a little farther.",
            "de": "Dr. E richtete die Atome entlang der Feldlinien aus. Jede richtige Bindung öffnete das zentrale Tor der Insel ein Stück weiter.",
            "es": "Dr. E alineó los átomos siguiendo las líneas de campo. Cada enlace correcto abría un poco más la puerta central de la isla.",
            "pt": "Dr. E alinhou os átomos ao longo das linhas de campo. Cada ligação correta abria um pouco mais o portão central da ilha.",
            "ja": "Dr. Eは磁力線に沿って原子を並べた。正しい結合ができるたび、島の中央ゲートが少しずつ開いた。"
          },
          "caption": {
            "tr": "Manyetizma yeni bir yol dili oluşturuyor.",
            "en": "Magnetism creates a new language of routes.",
            "de": "Magnetismus schafft eine neue Sprache der Wege.",
            "es": "El magnetismo crea un nuevo lenguaje de rutas.",
            "pt": "O magnetismo cria uma nova linguagem de caminhos.",
            "ja": "磁力が新しい道の言語を作り出す。"
          },
          "cast": [
            "drE",
            "moxy"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Dr. E atomları çizgilere göre hizaladı. Her doğru bağ, adanın merkezindeki kapıyı biraz daha açtı.",
            "en": "Dr. E aligned atoms along the field lines. Every correct bond opened the island’s central gate a little farther.",
            "de": "Dr. E richtete die Atome entlang der Feldlinien aus. Jede richtige Bindung öffnete das zentrale Tor der Insel ein Stück weiter.",
            "es": "Dr. E alineó los átomos siguiendo las líneas de campo. Cada enlace correcto abría un poco más la puerta central de la isla.",
            "pt": "Dr. E alinhou os átomos ao longo das linhas de campo. Cada ligação correta abria um pouco mais o portão central da ilha.",
            "ja": "Dr. Eは磁力線に沿って原子を並べた。正しい結合ができるたび、島の中央ゲートが少しずつ開いた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "HMM.",
          "text": {
            "tr": "Null taşlardaki X sembollerini okudu. “Bunlar yeni değil. Birisi bu sinyali yıllar önce de görmüş.”",
            "en": "Null read the X symbols carved into the stones. “These are not new. Someone saw this signal years ago.”",
            "de": "Null las die in die Steine geritzten X-Symbole. “Diese Zeichen sind nicht neu. Jemand hat dieses Signal schon vor Jahren gesehen.”",
            "es": "Null leyó los símbolos X grabados en las piedras. “Esto no es nuevo. Alguien vio esta señal hace años.”",
            "pt": "Null leu os símbolos X gravados nas pedras. “Isto não é novo. Alguém viu este sinal anos atrás.”",
            "ja": "Nullは石に刻まれたXの記号を読み取った。 “これは新しいものじゃない。何年も前に誰かがこの信号を見ている。”"
          },
          "caption": {
            "tr": "Gizem laboratuvardan daha eski.",
            "en": "The mystery is older than the laboratory.",
            "de": "Das Rätsel ist älter als das Labor.",
            "es": "El misterio es más antiguo que el laboratorio.",
            "pt": "O mistério é mais antigo do que o laboratório.",
            "ja": "謎は研究所よりも古い。"
          },
          "cast": [
            "null",
            "cat"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Null taşlardaki X sembollerini okudu.",
            "en": "Null read the X symbols carved into the stones.",
            "de": "Null las die in die Steine geritzten X-Symbole.",
            "es": "Null leyó los símbolos X grabados en las piedras.",
            "pt": "Null leu os símbolos X gravados nas pedras.",
            "ja": "Nullは石に刻まれたXの記号を読み取った。"
          },
          "dialogue": {
            "tr": "Bunlar yeni değil. Birisi bu sinyali yıllar önce de görmüş.",
            "en": "These are not new. Someone saw this signal years ago.",
            "de": "Diese Zeichen sind nicht neu. Jemand hat dieses Signal schon vor Jahren gesehen.",
            "es": "Esto no es nuevo. Alguien vio esta señal hace años.",
            "pt": "Isto não é novo. Alguém viu este sinal anos atrás.",
            "ja": "これは新しいものじゃない。何年も前に誰かがこの信号を見ている。"
          }
        }
      ]
    },
    {
      "id": "fragile-grove",
      "chapter": 8,
      "startLevel": 106,
      "unlockAfter": 105,
      "world": "element-island",
      "bang": "TINK!",
      "title": {
        "tr": "KIRILGAN KORU",
        "en": "THE FRAGILE GROVE",
        "de": "DER ZERBRECHLICHE HAIN",
        "es": "LA ARBOLEDA FRÁGIL",
        "pt": "O BOSQUE FRÁGIL",
        "ja": "壊れやすい森"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "TINK!",
          "text": {
            "tr": "Cam gibi ince element kabukları, Nobel dosyasının ilk kanıt parçasını koruyordu.",
            "en": "Glass-thin elemental shells protected the first piece of the Nobel evidence.",
            "de": "Hauchdünne Elementhüllen schützten das erste Stück des Nobel-Beweises.",
            "es": "Capas elementales finas como el vidrio protegían la primera pieza de la prueba del Nobel.",
            "pt": "Cascas elementares finas como vidro protegiam a primeira parte da prova do Nobel.",
            "ja": "ガラスのように薄い元素の殻が、ノーベル証拠の最初の断片を守っていた。"
          },
          "caption": {
            "tr": "Bir sert çarpışma bütün izi yok edebilir.",
            "en": "One hard collision could erase the entire trail.",
            "de": "Ein harter Zusammenstoß könnte die gesamte Spur auslöschen.",
            "es": "Un choque fuerte podría borrar todo el rastro.",
            "pt": "Uma colisão forte poderia apagar todo o rastro.",
            "ja": "一度の激しい衝突で、痕跡すべてが消えるかもしれない。"
          },
          "cast": [
            "drE"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Cam gibi ince element kabukları, Nobel dosyasının ilk kanıt parçasını koruyordu.",
            "en": "Glass-thin elemental shells protected the first piece of the Nobel evidence.",
            "de": "Hauchdünne Elementhüllen schützten das erste Stück des Nobel-Beweises.",
            "es": "Capas elementales finas como el vidrio protegían la primera pieza de la prueba del Nobel.",
            "pt": "Cascas elementares finas como vidro protegiam a primeira parte da prova do Nobel.",
            "ja": "ガラスのように薄い元素の殻が、ノーベル証拠の最初の断片を守っていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "moxy",
          "bang": "PLOP!",
          "text": {
            "tr": "Moxy bağ enerjisini yumuşattı, atomları güvenli rotaya yönlendirdi ve rahatlatıcı küçük bir ses çıkardı. “plop”",
            "en": "Moxy softened the bond energy, guided the atoms onto a safe route, and gave a reassuring little chirp. “plop.”",
            "de": "Moxy dämpfte die Bindungsenergie, führte die Atome auf eine sichere Route und gab einen beruhigenden kleinen Laut von sich. “plop.”",
            "es": "Moxy suavizó la energía del enlace, guio los átomos por una ruta segura y emitió un pequeño sonido tranquilizador. “plop.”",
            "pt": "Moxy suavizou a energia das ligações, guiou os átomos por uma rota segura e soltou um pequeno som tranquilizador. “plop.”",
            "ja": "Moxyは結合エネルギーを和らげ、原子を安全な経路へ導き、安心させるような小さな音を出した。 “plop.”"
          },
          "caption": {
            "tr": "Moxy’nin kısa ipuçları oyuna giriyor.",
            "en": "Moxy’s quick hints join the gameplay.",
            "de": "Moxys kurze Hinweise kommen ins Spiel.",
            "es": "Las pistas rápidas de Moxy entran en el juego.",
            "pt": "As rápidas dicas de Moxy passam a fazer parte do jogo.",
            "ja": "Moxyの短いヒントがゲームに加わる。"
          },
          "cast": [
            "moxy",
            "drE"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Moxy bağ enerjisini yumuşattı, atomları güvenli rotaya yönlendirdi ve rahatlatıcı küçük bir ses çıkardı.",
            "en": "Moxy softened the bond energy, guided the atoms onto a safe route, and gave a reassuring little chirp.",
            "de": "Moxy dämpfte die Bindungsenergie, führte die Atome auf eine sichere Route und gab einen beruhigenden kleinen Laut von sich.",
            "es": "Moxy suavizó la energía del enlace, guio los átomos por una ruta segura y emitió un pequeño sonido tranquilizador.",
            "pt": "Moxy suavizou a energia das ligações, guiou os átomos por uma rota segura e soltou um pequeno som tranquilizador.",
            "ja": "Moxyは結合エネルギーを和らげ、原子を安全な経路へ導き、安心させるような小さな音を出した。"
          },
          "dialogue": {
            "tr": "plop",
            "en": "plop.",
            "de": "plop.",
            "es": "plop.",
            "pt": "plop.",
            "ja": "plop."
          }
        },
        {
          "speaker": "cat",
          "bang": "PURRR",
          "text": {
            "tr": "Kedi kanıt parçasının üzerine kıvrıldı. Atom kolyesinde Büyük Ayrışma tarihinin yarısı belirdi.",
            "en": "The cat curled around the evidence fragment. Half the date of the Great Unbonding appeared on its atom pendant.",
            "de": "Die Katze rollte sich um das Beweisfragment. Auf ihrem Atom-Anhänger erschien die Hälfte des Datums der Großen Entkopplung.",
            "es": "El gato se acurrucó alrededor del fragmento de prueba. En su colgante atómico apareció la mitad de la fecha de la Gran Desvinculación.",
            "pt": "O gato se enrolou ao redor do fragmento da prova. Metade da data da Grande Separação apareceu em seu pingente de átomo.",
            "ja": "ネコは証拠の断片を抱くように丸くなった。原子のペンダントに「大解離」が起きた日付の半分が浮かんだ。"
          },
          "caption": {
            "tr": "Dosya yalnızca Nobel için değil.",
            "en": "The file is about more than a Nobel Prize.",
            "de": "In der Akte geht es um mehr als nur einen Nobelpreis.",
            "es": "El expediente trata de algo más que de un Premio Nobel.",
            "pt": "O arquivo trata de algo maior do que um Prêmio Nobel.",
            "ja": "このファイルが示すものは、ノーベル賞だけではない。"
          },
          "cast": [
            "cat",
            "null"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Kedi kanıt parçasının üzerine kıvrıldı. Atom kolyesinde Büyük Ayrışma tarihinin yarısı belirdi.",
            "en": "The cat curled around the evidence fragment. Half the date of the Great Unbonding appeared on its atom pendant.",
            "de": "Die Katze rollte sich um das Beweisfragment. Auf ihrem Atom-Anhänger erschien die Hälfte des Datums der Großen Entkopplung.",
            "es": "El gato se acurrucó alrededor del fragmento de prueba. En su colgante atómico apareció la mitad de la fecha de la Gran Desvinculación.",
            "pt": "O gato se enrolou ao redor do fragmento da prova. Metade da data da Grande Separação apareceu em seu pingente de átomo.",
            "ja": "ネコは証拠の断片を抱くように丸くなった。原子のペンダントに「大解離」が起きた日付の半分が浮かんだ。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    },
    {
      "id": "cats-trail",
      "chapter": 9,
      "startLevel": 121,
      "unlockAfter": 120,
      "world": "element-island",
      "bang": "MİYAV!",
      "title": {
        "tr": "KEDİNİN İZİ",
        "en": "THE CAT’S TRAIL",
        "de": "DIE SPUR DER KATZE",
        "es": "EL RASTRO DEL GATO",
        "pt": "O RASTRO DO GATO",
        "ja": "ネコの痕跡"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "MİYAV!",
          "text": {
            "tr": "X izi, adanın eski portal laboratuvarına ulaştı. Aynı enerji bazı atomları kristal gibi dondururken bazılarını hızla birbirine itiyordu. “Bu sinyal bağları ayırıp yeniden yönlendiriyor.”",
            "en": "The X trail reached the island’s old portal laboratory. The same energy froze some atoms like crystal while driving others rapidly together. “The signal is separating bonds and redirecting them.”",
            "de": "Die X-Spur erreichte das alte Portallabor der Insel. Dieselbe Energie fror einige Atome wie Kristall ein und trieb andere schnell aufeinander zu. “Das Signal trennt Bindungen und leitet sie neu um.”",
            "es": "El rastro X llegó al antiguo laboratorio de portales de la isla. La misma energía congelaba algunos átomos como cristal y empujaba a otros rápidamente unos contra otros. “La señal está separando enlaces y redirigiéndolos.”",
            "pt": "O rastro X chegou ao antigo laboratório de portais da ilha. A mesma energia congelava alguns átomos como cristal enquanto empurrava outros rapidamente uns contra os outros. “O sinal está separando as ligações e redirecionando-as.”",
            "ja": "Xの痕跡は島の古いポータル研究所へ続いた。同じエネルギーが一部の原子を結晶のように凍らせ、別の原子を激しく衝突させていた。 “この信号は結合を切り離し、別の方向へつなぎ直している。”"
          },
          "caption": {
            "tr": "İzin devamı portal düzeneğinin içinde.",
            "en": "The trail continues inside the portal system.",
            "de": "Die Spur setzt sich im Portalsystem fort.",
            "es": "El rastro continúa dentro del sistema de portales.",
            "pt": "O rastro continua dentro do sistema do portal.",
            "ja": "痕跡はポータル装置の内部へ続いている。"
          },
          "cast": [
            "cat"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "X izi, adanın eski portal laboratuvarına ulaştı. Aynı enerji bazı atomları kristal gibi dondururken bazılarını hızla birbirine itiyordu.",
            "en": "The X trail reached the island’s old portal laboratory. The same energy froze some atoms like crystal while driving others rapidly together.",
            "de": "Die X-Spur erreichte das alte Portallabor der Insel. Dieselbe Energie fror einige Atome wie Kristall ein und trieb andere schnell aufeinander zu.",
            "es": "El rastro X llegó al antiguo laboratorio de portales de la isla. La misma energía congelaba algunos átomos como cristal y empujaba a otros rápidamente unos contra otros.",
            "pt": "O rastro X chegou ao antigo laboratório de portais da ilha. A mesma energia congelava alguns átomos como cristal enquanto empurrava outros rapidamente uns contra os outros.",
            "ja": "Xの痕跡は島の古いポータル研究所へ続いた。同じエネルギーが一部の原子を結晶のように凍らせ、別の原子を激しく衝突させていた。"
          },
          "dialogue": {
            "tr": "Bu sinyal bağları ayırıp yeniden yönlendiriyor.",
            "en": "The signal is separating bonds and redirecting them.",
            "de": "Das Signal trennt Bindungen und leitet sie neu um.",
            "es": "La señal está separando enlaces y redirigiéndolos.",
            "pt": "O sinal está separando as ligações e redirecionando-as.",
            "ja": "この信号は結合を切り離し、別の方向へつなぎ直している。"
          }
        },
        {
          "speaker": "null",
          "bang": "OLAMAZ.",
          "text": {
            "tr": "Dr. Null portal fazını X Sinyaline kilitledi. Çıkış yolu yalnızca doğru anda açılacaktı. “Kırmızı kontrolü ben söylemeden sakın etkinleştirme.”",
            "en": "Dr. Null locked the portal phase onto the X Signal. The exit would open only at the correct moment. “Do not activate the red control until I say so.”",
            "de": "Dr. Null koppelte die Portalphase an das X-Signal. Der Ausgang würde sich nur im richtigen Moment öffnen. “Aktiviere die rote Steuerung erst, wenn ich es sage.”",
            "es": "Dr. Null fijó la fase del portal a la Señal X. La salida solo se abriría en el momento correcto. “No actives el control rojo hasta que yo lo diga.”",
            "pt": "Dr. Null travou a fase do portal no Sinal X. A saída só abriria no momento correto. “Não ative o controle vermelho até eu mandar.”",
            "ja": "Dr. Nullはポータルの位相をXシグナルに固定した。出口が開くのは正しい瞬間だけだ。 “私が言うまで赤い操作部には触るな。”"
          },
          "caption": {
            "tr": "Kedi, doğal olarak, düğmeye bakıyordu.",
            "en": "The cat was, naturally, staring at the button.",
            "de": "Die Katze starrte natürlich auf den Knopf.",
            "es": "El gato, naturalmente, estaba mirando el botón.",
            "pt": "O gato estava, naturalmente, olhando fixamente para o botão.",
            "ja": "もちろん、ネコはそのボタンをじっと見ていた。"
          },
          "cast": [
            "null",
            "moxy"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Dr. Null portal fazını X Sinyaline kilitledi. Çıkış yolu yalnızca doğru anda açılacaktı.",
            "en": "Dr. Null locked the portal phase onto the X Signal. The exit would open only at the correct moment.",
            "de": "Dr. Null koppelte die Portalphase an das X-Signal. Der Ausgang würde sich nur im richtigen Moment öffnen.",
            "es": "Dr. Null fijó la fase del portal a la Señal X. La salida solo se abriría en el momento correcto.",
            "pt": "Dr. Null travou a fase do portal no Sinal X. A saída só abriria no momento correto.",
            "ja": "Dr. Nullはポータルの位相をXシグナルに固定した。出口が開くのは正しい瞬間だけだ。"
          },
          "dialogue": {
            "tr": "Kırmızı kontrolü ben söylemeden sakın etkinleştirme.",
            "en": "Do not activate the red control until I say so.",
            "de": "Aktiviere die rote Steuerung erst, wenn ich es sage.",
            "es": "No actives el control rojo hasta que yo lo diga.",
            "pt": "Não ative o controle vermelho até eu mandar.",
            "ja": "私が言うまで赤い操作部には触るな。"
          }
        },
        {
          "speaker": "moxy",
          "bang": "BWOOP!",
          "text": {
            "tr": "Kedi kırmızı kontrolü patisiyle etkinleştirdi. Portal açıldı; Moxy kolyedeki titreşimi izleyip gizli çıkış yönünü buldu. “Bwoop!”",
            "en": "The cat activated the red control with one paw. The portal opened; Moxy followed the pendant’s pulse and found the hidden exit route. “Bwoop!”",
            "de": "Die Katze aktivierte die rote Steuerung mit einer Pfote. Das Portal öffnete sich; Moxy folgte dem Puls des Anhängers und fand den verborgenen Ausgang. “Bwoop!”",
            "es": "El gato activó el control rojo con una pata. El portal se abrió; Moxy siguió el pulso del colgante y encontró la salida oculta. “¡Bwoop!”",
            "pt": "O gato ativou o controle vermelho com uma pata. O portal se abriu; Moxy seguiu o pulso do pingente e encontrou a rota de saída escondida. “Bwoop!”",
            "ja": "ネコが前足で赤い操作部を作動させた。ポータルが開き、Moxyはペンダントの脈動を追って隠された出口を見つけた。 “Bwoop!”"
          },
          "caption": {
            "tr": "Kedi ve Moxy ilk ortak keşiflerini yaptı.",
            "en": "The cat and Moxy made their first discovery together.",
            "de": "Die Katze und Moxy machten gemeinsam ihre erste Entdeckung.",
            "es": "El gato y Moxy hicieron juntos su primer descubrimiento.",
            "pt": "O gato e Moxy fizeram sua primeira descoberta juntos.",
            "ja": "ネコとMoxyは初めて一緒に発見を成し遂げた。"
          },
          "cast": [
            "cat",
            "moxy",
            "drE",
            "null"
          ],
          "shot": "wide",
          "img": "assets/images/story-user/09-cat-portal-trail.webp",
          "narration": {
            "tr": "Kedi kırmızı kontrolü patisiyle etkinleştirdi. Portal açıldı; Moxy kolyedeki titreşimi izleyip gizli çıkış yönünü buldu.",
            "en": "The cat activated the red control with one paw. The portal opened; Moxy followed the pendant’s pulse and found the hidden exit route.",
            "de": "Die Katze aktivierte die rote Steuerung mit einer Pfote. Das Portal öffnete sich; Moxy folgte dem Puls des Anhängers und fand den verborgenen Ausgang.",
            "es": "El gato activó el control rojo con una pata. El portal se abrió; Moxy siguió el pulso del colgante y encontró la salida oculta.",
            "pt": "O gato ativou o controle vermelho com uma pata. O portal se abriu; Moxy seguiu o pulso do pingente e encontrou a rota de saída escondida.",
            "ja": "ネコが前足で赤い操作部を作動させた。ポータルが開き、Moxyはペンダントの脈動を追って隠された出口を見つけた。"
          },
          "dialogue": {
            "tr": "Bwoop!",
            "en": "Bwoop!",
            "de": "Bwoop!",
            "es": "¡Bwoop!",
            "pt": "Bwoop!",
            "ja": "Bwoop!"
          }
        }
      ]
    },
    {
      "id": "island-core",
      "chapter": 10,
      "startLevel": 136,
      "unlockAfter": 135,
      "world": "element-island",
      "bang": "GÜMMM!",
      "title": {
        "tr": "ADANIN ÇEKİRDEĞİ",
        "en": "THE ISLAND CORE",
        "de": "DER INSELKERN",
        "es": "EL NÚCLEO DE LA ISLA",
        "pt": "O NÚCLEO DA ILHA",
        "ja": "島のコア"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "GÜMMM!",
          "text": {
            "tr": "Adanın altında dev bir doğal reaktör atıyordu. X Sinyali onu parçalamaya çalışıyordu.",
            "en": "A vast natural reactor pulsed beneath the island. The X Signal was trying to pull it apart.",
            "de": "Unter der Insel pulsierte ein gewaltiger natürlicher Reaktor. Das X-Signal versuchte, ihn auseinanderzureißen.",
            "es": "Un enorme reactor natural latía bajo la isla. La Señal X intentaba desarmarlo.",
            "pt": "Um enorme reator natural pulsava sob a ilha. O Sinal X tentava separá-lo.",
            "ja": "島の地下で巨大な天然リアクターが脈動していた。Xシグナルはそれを引き裂こうとしていた。"
          },
          "caption": {
            "tr": "Büyük Ayrışma yeniden başlamak üzere.",
            "en": "The Great Unbonding is about to begin again.",
            "de": "Die Große Entkopplung droht erneut zu beginnen.",
            "es": "La Gran Desvinculación está a punto de comenzar de nuevo.",
            "pt": "A Grande Separação está prestes a começar novamente.",
            "ja": "大解離が再び始まろうとしている。"
          },
          "cast": [
            "drE",
            "moxy"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "Adanın altında dev bir doğal reaktör atıyordu. X Sinyali onu parçalamaya çalışıyordu.",
            "en": "A vast natural reactor pulsed beneath the island. The X Signal was trying to pull it apart.",
            "de": "Unter der Insel pulsierte ein gewaltiger natürlicher Reaktor. Das X-Signal versuchte, ihn auseinanderzureißen.",
            "es": "Un enorme reactor natural latía bajo la isla. La Señal X intentaba desarmarlo.",
            "pt": "Um enorme reator natural pulsava sob a ilha. O Sinal X tentava separá-lo.",
            "ja": "島の地下で巨大な天然リアクターが脈動していた。Xシグナルはそれを引き裂こうとしていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "KİLİT!",
          "text": {
            "tr": "Null kendi cihazını çekirdeğe bağladı. “Bu düzeneği çalmak için değil, sinyali hapsetmek için yaptım.”",
            "en": "Null connected his own machine to the core. “I built this rig to contain the signal, not steal it.”",
            "de": "Null verband seine eigene Maschine mit dem Kern. “Ich habe diese Anlage gebaut, um das Signal einzudämmen, nicht um es zu stehlen.”",
            "es": "Null conectó su propia máquina al núcleo. “Construí este equipo para contener la señal, no para robarla.”",
            "pt": "Null conectou sua própria máquina ao núcleo. “Eu construí este equipamento para conter o sinal, não para roubá-lo.”",
            "ja": "Nullは自分の装置をコアへ接続した。 “この装置は信号を封じ込めるために作った。奪うためじゃない。”"
          },
          "caption": {
            "tr": "Şüphe yerini zor bir güvene bırakıyor.",
            "en": "Suspicion gives way to difficult trust.",
            "de": "Misstrauen weicht mühsamem Vertrauen.",
            "es": "La sospecha da paso a una confianza difícil.",
            "pt": "A suspeita dá lugar a uma confiança difícil.",
            "ja": "疑いは、苦しい信頼へと変わっていく。"
          },
          "cast": [
            "null",
            "drE"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Null kendi cihazını çekirdeğe bağladı.",
            "en": "Null connected his own machine to the core.",
            "de": "Null verband seine eigene Maschine mit dem Kern.",
            "es": "Null conectó su propia máquina al núcleo.",
            "pt": "Null conectou sua própria máquina ao núcleo.",
            "ja": "Nullは自分の装置をコアへ接続した。"
          },
          "dialogue": {
            "tr": "Bu düzeneği çalmak için değil, sinyali hapsetmek için yaptım.",
            "en": "I built this rig to contain the signal, not steal it.",
            "de": "Ich habe diese Anlage gebaut, um das Signal einzudämmen, nicht um es zu stehlen.",
            "es": "Construí este equipo para contener la señal, no para robarla.",
            "pt": "Eu construí este equipamento para conter o sinal, não para roubá-lo.",
            "ja": "この装置は信号を封じ込めるために作った。奪うためじゃない。"
          }
        },
        {
          "speaker": "moxy",
          "bang": "VUM!",
          "text": {
            "tr": "Moxy bağ enerjisini dengeledi. Çekirdek sakinleşti ve gökyüzüne mor bir ışın gönderdi.",
            "en": "Moxy balanced the bond energy. The core calmed and sent a violet beam into the sky.",
            "de": "Moxy stabilisierte die Bindungsenergie. Der Kern beruhigte sich und schickte einen violetten Strahl in den Himmel.",
            "es": "Moxy equilibró la energía de los enlaces. El núcleo se calmó y lanzó un rayo violeta hacia el cielo.",
            "pt": "Moxy equilibrou a energia das ligações. O núcleo se acalmou e lançou um feixe violeta para o céu.",
            "ja": "Moxyが結合エネルギーを整えると、コアは静まり、紫色の光線を空へ放った。"
          },
          "caption": {
            "tr": "Işın, Kristal Mağara’nın koordinatlarını gösteriyor.",
            "en": "The beam reveals the coordinates of Crystal Cave.",
            "de": "Der Strahl enthüllt die Koordinaten der Kristallhöhle.",
            "es": "El rayo revela las coordenadas de la Cueva de Cristal.",
            "pt": "O feixe revela as coordenadas da Caverna de Cristal.",
            "ja": "光線がクリスタル洞窟の座標を示す。"
          },
          "cast": [
            "moxy",
            "cat"
          ],
          "shot": "hero",
          "img": "",
          "narration": {
            "tr": "Moxy bağ enerjisini dengeledi. Çekirdek sakinleşti ve gökyüzüne mor bir ışın gönderdi.",
            "en": "Moxy balanced the bond energy. The core calmed and sent a violet beam into the sky.",
            "de": "Moxy stabilisierte die Bindungsenergie. Der Kern beruhigte sich und schickte einen violetten Strahl in den Himmel.",
            "es": "Moxy equilibró la energía de los enlaces. El núcleo se calmó y lanzó un rayo violeta hacia el cielo.",
            "pt": "Moxy equilibrou a energia das ligações. O núcleo se acalmou e lançou um feixe violeta para o céu.",
            "ja": "Moxyが結合エネルギーを整えると、コアは静まり、紫色の光線を空へ放った。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    },
    {
      "id": "crystal-threshold",
      "chapter": 11,
      "startLevel": 151,
      "unlockAfter": 150,
      "world": "crystal-cave",
      "bang": "KRİNG!",
      "title": {
        "tr": "KRİSTAL EŞİK",
        "en": "THE CRYSTAL THRESHOLD",
        "de": "DIE KRISTALLSCHWELLE",
        "es": "EL UMBRAL DE CRISTAL",
        "pt": "O LIMIAR DE CRISTAL",
        "ja": "クリスタルの境界"
      },
      "pages": [
        {
          "speaker": "moxy",
          "bang": "KRİNG!",
          "text": {
            "tr": "Kristal Mağara, Moxy yaklaşınca renk değiştirdi. Duvarlar onun doğuşundaki enerjiyle aynı frekansta çınlıyordu.",
            "en": "Crystal Cave changed color as Moxy approached. Its walls rang at the same frequency as his birth.",
            "de": "Die Kristallhöhle wechselte die Farbe, als Moxy sich näherte. Ihre Wände klangen mit derselben Frequenz wie bei seiner Geburt.",
            "es": "La Cueva de Cristal cambió de color cuando Moxy se acercó. Sus paredes resonaron con la misma frecuencia de su nacimiento.",
            "pt": "A Caverna de Cristal mudou de cor quando Moxy se aproximou. As paredes ressoavam na mesma frequência de seu nascimento.",
            "ja": "Moxyが近づくとクリスタル洞窟は色を変えた。壁は彼が生まれた時と同じ周波数で鳴っていた。"
          },
          "caption": {
            "tr": "Moxy’nin geçmişi taşların içinde saklı.",
            "en": "Moxy’s past is hidden in the stone.",
            "de": "Moxys Vergangenheit ist im Stein verborgen.",
            "es": "El pasado de Moxy está oculto en la piedra.",
            "pt": "O passado de Moxy está escondido na pedra.",
            "ja": "Moxyの過去は石の中に隠されている。"
          },
          "cast": [
            "moxy",
            "drE"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "Kristal Mağara, Moxy yaklaşınca renk değiştirdi. Duvarlar onun doğuşundaki enerjiyle aynı frekansta çınlıyordu.",
            "en": "Crystal Cave changed color as Moxy approached. Its walls rang at the same frequency as his birth.",
            "de": "Die Kristallhöhle wechselte die Farbe, als Moxy sich näherte. Ihre Wände klangen mit derselben Frequenz wie bei seiner Geburt.",
            "es": "La Cueva de Cristal cambió de color cuando Moxy se acercó. Sus paredes resonaron con la misma frecuencia de su nacimiento.",
            "pt": "A Caverna de Cristal mudou de cor quando Moxy se aproximou. As paredes ressoavam na mesma frequência de seu nascimento.",
            "ja": "Moxyが近づくとクリスタル洞窟は色を変えた。壁は彼が生まれた時と同じ周波数で鳴っていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "drE",
          "bang": "FENER!",
          "text": {
            "tr": "Dr. E kristalleri taradı. İçlerinde donmuş molekül anıları vardı.",
            "en": "Dr. E scanned the crystals. Frozen molecular memories were trapped inside.",
            "de": "Dr. E scannte die Kristalle. Darin waren eingefrorene molekulare Erinnerungen eingeschlossen.",
            "es": "Dr. E escaneó los cristales. Dentro había recuerdos moleculares congelados.",
            "pt": "Dr. E escaneou os cristais. Memórias moleculares congeladas estavam presas lá dentro.",
            "ja": "Dr. Eがクリスタルをスキャンした。内部には凍結した分子の記憶が閉じ込められていた。"
          },
          "caption": {
            "tr": "Her bulmaca aynı zamanda bir kayıt.",
            "en": "Every puzzle is also a record.",
            "de": "Jedes Rätsel ist zugleich eine Aufzeichnung.",
            "es": "Cada rompecabezas es también un registro.",
            "pt": "Cada quebra-cabeça também é um registro.",
            "ja": "すべてのパズルは記録でもある。"
          },
          "cast": [
            "drE"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Dr. E kristalleri taradı. İçlerinde donmuş molekül anıları vardı.",
            "en": "Dr. E scanned the crystals. Frozen molecular memories were trapped inside.",
            "de": "Dr. E scannte die Kristalle. Darin waren eingefrorene molekulare Erinnerungen eingeschlossen.",
            "es": "Dr. E escaneó los cristales. Dentro había recuerdos moleculares congelados.",
            "pt": "Dr. E escaneou os cristais. Memórias moleculares congeladas estavam presas lá dentro.",
            "ja": "Dr. Eがクリスタルをスキャンした。内部には凍結した分子の記憶が閉じ込められていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "DİKKAT.",
          "text": {
            "tr": "Null çatlakları gösterdi. “Yanlış bağ, bütün arşivi kırar.”",
            "en": "Null pointed to the fractures. “One wrong bond will shatter the entire archive.”",
            "de": "Null zeigte auf die Risse. “Eine falsche Bindung wird das gesamte Archiv zerschmettern.”",
            "es": "Null señaló las grietas. “Un enlace equivocado hará añicos todo el archivo.”",
            "pt": "Null apontou para as rachaduras. “Uma ligação errada vai destruir todo o arquivo.”",
            "ja": "Nullは亀裂を指さした。 “一つでも結合を間違えれば、アーカイブ全体が砕ける。”"
          },
          "caption": {
            "tr": "Mağara güçten çok sabır istiyor.",
            "en": "The cave demands patience more than force.",
            "de": "Die Höhle verlangt mehr Geduld als Kraft.",
            "es": "La cueva exige más paciencia que fuerza.",
            "pt": "A caverna exige mais paciência do que força.",
            "ja": "この洞窟が求めるのは力より忍耐だ。"
          },
          "cast": [
            "null",
            "cat",
            "moxy"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Null çatlakları gösterdi.",
            "en": "Null pointed to the fractures.",
            "de": "Null zeigte auf die Risse.",
            "es": "Null señaló las grietas.",
            "pt": "Null apontou para as rachaduras.",
            "ja": "Nullは亀裂を指さした。"
          },
          "dialogue": {
            "tr": "Yanlış bağ, bütün arşivi kırar.",
            "en": "One wrong bond will shatter the entire archive.",
            "de": "Eine falsche Bindung wird das gesamte Archiv zerschmettern.",
            "es": "Un enlace equivocado hará añicos todo el archivo.",
            "pt": "Uma ligação errada vai destruir todo o arquivo.",
            "ja": "一つでも結合を間違えれば、アーカイブ全体が砕ける。"
          }
        }
      ]
    },
    {
      "id": "broken-archive",
      "chapter": 12,
      "startLevel": 166,
      "unlockAfter": 165,
      "world": "crystal-cave",
      "bang": "ÇATIR!",
      "title": {
        "tr": "KIRIK ARŞİV",
        "en": "THE BROKEN ARCHIVE",
        "de": "DAS ZERBROCHENE ARCHIV",
        "es": "EL ARCHIVO ROTO",
        "pt": "O ARQUIVO QUEBRADO",
        "ja": "壊れたアーカイブ"
      },
      "pages": [
        {
          "speaker": "cat",
          "bang": "ÇATIR!",
          "text": {
            "tr": "Kedi gevşek bir kristale dokundu. Duvar, Büyük Ayrışma’nın ilk görüntüsünü yansıttı.",
            "en": "The cat touched a loose crystal. The wall projected the first image of the Great Unbonding.",
            "de": "Die Katze berührte einen losen Kristall. Die Wand projizierte das erste Bild der Großen Entkopplung.",
            "es": "El gato tocó un cristal suelto. La pared proyectó la primera imagen de la Gran Desvinculación.",
            "pt": "O gato tocou um cristal solto. A parede projetou a primeira imagem da Grande Separação.",
            "ja": "ネコがゆるんだクリスタルに触れた。壁に大解離の最初の映像が映し出された。"
          },
          "caption": {
            "tr": "Yıllar önce binlerce bağ aynı anda kopmuştu.",
            "en": "Years ago, thousands of bonds broke at once.",
            "de": "Vor Jahren brachen Tausende Bindungen gleichzeitig.",
            "es": "Años atrás, miles de enlaces se rompieron al mismo tiempo.",
            "pt": "Anos atrás, milhares de ligações se romperam ao mesmo tempo.",
            "ja": "何年も前、何千もの結合が一斉に切れた。"
          },
          "cast": [
            "cat",
            "null"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Kedi gevşek bir kristale dokundu. Duvar, Büyük Ayrışma’nın ilk görüntüsünü yansıttı.",
            "en": "The cat touched a loose crystal. The wall projected the first image of the Great Unbonding.",
            "de": "Die Katze berührte einen losen Kristall. Die Wand projizierte das erste Bild der Großen Entkopplung.",
            "es": "El gato tocó un cristal suelto. La pared proyectó la primera imagen de la Gran Desvinculación.",
            "pt": "O gato tocou um cristal solto. A parede projetou a primeira imagem da Grande Separação.",
            "ja": "ネコがゆるんだクリスタルに触れた。壁に大解離の最初の映像が映し出された。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "drE",
          "bang": "OH…",
          "text": {
            "tr": "Genç Dr. E ve Dr. Null’un başarısız deneyi kayıtta görünüyordu. İkisi de gerçeği yıllarca saklamıştı.",
            "en": "A failed experiment by the younger Dr. E and Dr. Null appeared in the record. Both had hidden the truth for years.",
            "de": "Die Aufzeichnung zeigte ein fehlgeschlagenes Experiment des jüngeren Dr. E und Dr. Null. Beide hatten die Wahrheit jahrelang verborgen.",
            "es": "El registro mostró un experimento fallido del joven Dr. E y Dr. Null. Ambos habían ocultado la verdad durante años.",
            "pt": "O registro mostrou um experimento fracassado dos jovens Dr. E e Dr. Null. Os dois esconderam a verdade por anos.",
            "ja": "若きDr. EとDr. Nullの失敗した実験が記録に現れた。二人は何年も真実を隠していた。"
          },
          "caption": {
            "tr": "Rakipliğin altında ortak bir hata yatıyor.",
            "en": "A shared mistake lies beneath their rivalry.",
            "de": "Unter ihrer Rivalität liegt ein gemeinsamer Fehler.",
            "es": "Bajo su rivalidad hay un error compartido.",
            "pt": "Por trás da rivalidade existe um erro compartilhado.",
            "ja": "二人の対立の奥には、共有された過ちがあった。"
          },
          "cast": [
            "drE",
            "null"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Genç Dr. E ve Dr. Null’un başarısız deneyi kayıtta görünüyordu. İkisi de gerçeği yıllarca saklamıştı.",
            "en": "A failed experiment by the younger Dr. E and Dr. Null appeared in the record. Both had hidden the truth for years.",
            "de": "Die Aufzeichnung zeigte ein fehlgeschlagenes Experiment des jüngeren Dr. E und Dr. Null. Beide hatten die Wahrheit jahrelang verborgen.",
            "es": "El registro mostró un experimento fallido del joven Dr. E y Dr. Null. Ambos habían ocultado la verdad durante años.",
            "pt": "O registro mostrou um experimento fracassado dos jovens Dr. E e Dr. Null. Os dois esconderam a verdade por anos.",
            "ja": "若きDr. EとDr. Nullの失敗した実験が記録に現れた。二人は何年も真実を隠していた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "moxy",
          "bang": "VUM…",
          "text": {
            "tr": "Moxy görüntüye dokununca X-Bağı kalp gibi attı. Gözleri büyüdü; gövdesinden derin, şaşkın bir ses çıktı. “vum…”",
            "en": "When Moxy touched the image, the X-Bond pulsed like a heart. His eyes widened, and a deep, startled sound came from his body. “vum…”",
            "de": "Als Moxy das Bild berührte, pulsierte die X-Bindung wie ein Herz. Seine Augen wurden groß, und aus seinem Körper kam ein tiefer, erschrockener Laut. “vum…”",
            "es": "Cuando Moxy tocó la imagen, el Enlace X palpitó como un corazón. Abrió mucho los ojos y de su cuerpo salió un sonido profundo y sorprendido. “vum…”",
            "pt": "Quando Moxy tocou a imagem, a Ligação X pulsou como um coração. Seus olhos se arregalaram, e um som profundo de surpresa saiu de seu corpo. “vum…”",
            "ja": "Moxyが映像に触れると、X結合は心臓のように脈打った。目を大きく見開き、体から深く驚いた音が漏れた。 “vum…”"
          },
          "caption": {
            "tr": "Moxy tesadüfen doğmadı.",
            "en": "Moxy was not born by accident.",
            "de": "Moxy wurde nicht zufällig geboren.",
            "es": "Moxy no nació por accidente.",
            "pt": "Moxy não nasceu por acaso.",
            "ja": "Moxyは偶然生まれたのではない。"
          },
          "cast": [
            "moxy"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Moxy görüntüye dokununca X-Bağı kalp gibi attı. Gözleri büyüdü; gövdesinden derin, şaşkın bir ses çıktı.",
            "en": "When Moxy touched the image, the X-Bond pulsed like a heart. His eyes widened, and a deep, startled sound came from his body.",
            "de": "Als Moxy das Bild berührte, pulsierte die X-Bindung wie ein Herz. Seine Augen wurden groß, und aus seinem Körper kam ein tiefer, erschrockener Laut.",
            "es": "Cuando Moxy tocó la imagen, el Enlace X palpitó como un corazón. Abrió mucho los ojos y de su cuerpo salió un sonido profundo y sorprendido.",
            "pt": "Quando Moxy tocou a imagem, a Ligação X pulsou como um coração. Seus olhos se arregalaram, e um som profundo de surpresa saiu de seu corpo.",
            "ja": "Moxyが映像に触れると、X結合は心臓のように脈打った。目を大きく見開き、体から深く驚いた音が漏れた。"
          },
          "dialogue": {
            "tr": "vum…",
            "en": "vum…",
            "de": "vum…",
            "es": "vum…",
            "pt": "vum…",
            "ja": "vum…"
          }
        }
      ]
    },
    {
      "id": "great-unbonding",
      "chapter": 13,
      "startLevel": 181,
      "unlockAfter": 180,
      "world": "crystal-cave",
      "bang": "KOP!",
      "title": {
        "tr": "BÜYÜK AYRIŞMA",
        "en": "THE GREAT UNBONDING",
        "de": "DIE GROSSE ENTKOPPLUNG",
        "es": "LA GRAN DESVINCULACIÓN",
        "pt": "A GRANDE SEPARAÇÃO",
        "ja": "大解離"
      },
      "pages": [
        {
          "speaker": "null",
          "bang": "KOP!",
          "text": {
            "tr": "Kristal arşiv, Büyük Ayrışma anını canlı bir simülasyon olarak yeniden kurdu. Ana kol çekildiği anda enerji kontrolden çıkmış ve laboratuvarı bağ koparan bir dalga sarmıştı. “X-Bağı atomları sonsuza dek kararlı tutacaktı. Onun yerine bütün bağları koparan bir dalga ürettik.”",
            "en": "The crystal archive rebuilt the Great Unbonding as a living simulation. The moment the main lever was pulled, the energy escaped control and a bond-breaking wave swept through the laboratory. “The X-Bond was meant to keep atoms stable forever. Instead, we created a wave that broke every bond.”",
            "de": "Das Kristallarchiv rekonstruierte die Große Entkopplung als lebende Simulation. Als der Haupthebel gezogen wurde, geriet die Energie außer Kontrolle und eine bindungsbrechende Welle raste durch das Labor. “Die X-Bindung sollte Atome für immer stabil halten. Stattdessen erzeugten wir eine Welle, die jede Bindung brach.”",
            "es": "El archivo de cristal reconstruyó la Gran Desvinculación como una simulación viva. En cuanto se bajó la palanca principal, la energía escapó de control y una onda que rompía enlaces recorrió el laboratorio. “El Enlace X debía mantener los átomos estables para siempre. En cambio, creamos una onda que rompió todos los enlaces.”",
            "pt": "O arquivo de cristal reconstruiu a Grande Separação como uma simulação viva. No instante em que a alavanca principal foi puxada, a energia saiu do controle e uma onda que rompia ligações atravessou o laboratório. “A Ligação X deveria manter os átomos estáveis para sempre. Em vez disso, criamos uma onda que rompeu todas as ligações.”",
            "ja": "クリスタル・アーカイブは大解離を生きたシミュレーションとして再現した。主レバーが引かれた瞬間、エネルギーは制御を失い、結合を断ち切る波が研究所を駆け抜けた。 “X結合は原子を永遠に安定させるはずだった。だが私たちは、すべての結合を切る波を生み出してしまった。”"
          },
          "caption": {
            "tr": "Dr. E ve Dr. Null yıllardır sakladıkları hatayla yeniden yüzleşti.",
            "en": "Dr. E and Dr. Null faced the mistake they had hidden for years.",
            "de": "Dr. E und Dr. Null stellten sich dem Fehler, den sie jahrelang verborgen hatten.",
            "es": "Dr. E y Dr. Null se enfrentaron al error que habían ocultado durante años.",
            "pt": "Dr. E e Dr. Null encararam o erro que haviam escondido por anos.",
            "ja": "Dr. EとDr. Nullは、何年も隠してきた過ちと向き合った。"
          },
          "cast": [
            "null",
            "drE"
          ],
          "shot": "wide",
          "img": "assets/images/story-user/13-great-unbonding.webp",
          "narration": {
            "tr": "Kristal arşiv, Büyük Ayrışma anını canlı bir simülasyon olarak yeniden kurdu. Ana kol çekildiği anda enerji kontrolden çıkmış ve laboratuvarı bağ koparan bir dalga sarmıştı.",
            "en": "The crystal archive rebuilt the Great Unbonding as a living simulation. The moment the main lever was pulled, the energy escaped control and a bond-breaking wave swept through the laboratory.",
            "de": "Das Kristallarchiv rekonstruierte die Große Entkopplung als lebende Simulation. Als der Haupthebel gezogen wurde, geriet die Energie außer Kontrolle und eine bindungsbrechende Welle raste durch das Labor.",
            "es": "El archivo de cristal reconstruyó la Gran Desvinculación como una simulación viva. En cuanto se bajó la palanca principal, la energía escapó de control y una onda que rompía enlaces recorrió el laboratorio.",
            "pt": "O arquivo de cristal reconstruiu a Grande Separação como uma simulação viva. No instante em que a alavanca principal foi puxada, a energia saiu do controle e uma onda que rompia ligações atravessou o laboratório.",
            "ja": "クリスタル・アーカイブは大解離を生きたシミュレーションとして再現した。主レバーが引かれた瞬間、エネルギーは制御を失い、結合を断ち切る波が研究所を駆け抜けた。"
          },
          "dialogue": {
            "tr": "X-Bağı atomları sonsuza dek kararlı tutacaktı. Onun yerine bütün bağları koparan bir dalga ürettik.",
            "en": "The X-Bond was meant to keep atoms stable forever. Instead, we created a wave that broke every bond.",
            "de": "Die X-Bindung sollte Atome für immer stabil halten. Stattdessen erzeugten wir eine Welle, die jede Bindung brach.",
            "es": "El Enlace X debía mantener los átomos estables para siempre. En cambio, creamos una onda que rompió todos los enlaces.",
            "pt": "A Ligação X deveria manter os átomos estáveis para sempre. Em vez disso, criamos uma onda que rompeu todas as ligações.",
            "ja": "X結合は原子を永遠に安定させるはずだった。だが私たちは、すべての結合を切る波を生み出してしまった。"
          }
        },
        {
          "speaker": "drE",
          "bang": "…",
          "text": {
            "tr": "Dr. E, Nobel dosyasını ödül kazanmak için değil, yıllar önce Dr. Null ile birlikte yaptıkları hatayı açıkça belgeleyip düzeltmek için hazırladığını kabul etti. Dr. Null da sorumluluğun ikisine ait olduğunu söyledi.",
            "en": "Dr. E admitted that he had prepared the Nobel file not to win a prize, but to document and repair the mistake he and Dr. Null had made together years ago. Dr. Null agreed that the responsibility belonged to both of them.",
            "de": "Dr. E gab zu, dass er die Nobel-Akte nicht vorbereitet hatte, um einen Preis zu gewinnen, sondern um den Fehler, den er und Dr. Null vor Jahren gemeinsam gemacht hatten, offen zu dokumentieren und zu beheben. Dr. Null bestätigte, dass beide die Verantwortung trugen.",
            "es": "Dr. E admitió que había preparado el expediente del Nobel no para ganar un premio, sino para documentar con transparencia y reparar el error que él y Dr. Null cometieron juntos años atrás. Dr. Null confirmó que la responsabilidad era de ambos.",
            "pt": "Dr. E admitiu que preparou o arquivo do Nobel não para ganhar um prêmio, mas para documentar abertamente e corrigir o erro que ele e Dr. Null cometeram juntos anos atrás. Dr. Null confirmou que a responsabilidade era dos dois.",
            "ja": "Dr. Eは、ノーベル賞の資料を賞のためではなく、何年も前にDr. Nullと二人で起こした過ちを公に記録し、修復するために準備したのだと認めた。Dr. Nullも責任は二人にあると認めた。"
          },
          "caption": {
            "tr": "Rakiplik bitti; ikisi de aynı hatayı birlikte düzeltmeye karar verdi.",
            "en": "The rivalry ends; both choose to repair the same mistake together.",
            "de": "Die Rivalität endet; beide beschließen, denselben Fehler gemeinsam zu beheben.",
            "es": "La rivalidad termina; ambos deciden reparar juntos el mismo error.",
            "pt": "A rivalidade termina; os dois decidem corrigir juntos o mesmo erro.",
            "ja": "ライバル関係は終わる。二人は同じ過ちを共に修復すると決めた。"
          },
          "cast": [
            "drE"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Dr. E, Nobel dosyasını ödül kazanmak için değil, yıllar önce Dr. Null ile birlikte yaptıkları hatayı açıkça belgeleyip düzeltmek için hazırladığını kabul etti. Dr. Null da sorumluluğun ikisine ait olduğunu söyledi.",
            "en": "Dr. E admitted that he had prepared the Nobel file not to win a prize, but to document and repair the mistake he and Dr. Null had made together years ago. Dr. Null agreed that the responsibility belonged to both of them.",
            "de": "Dr. E gab zu, dass er die Nobel-Akte nicht vorbereitet hatte, um einen Preis zu gewinnen, sondern um den Fehler, den er und Dr. Null vor Jahren gemeinsam gemacht hatten, offen zu dokumentieren und zu beheben. Dr. Null bestätigte, dass beide die Verantwortung trugen.",
            "es": "Dr. E admitió que había preparado el expediente del Nobel no para ganar un premio, sino para documentar con transparencia y reparar el error que él y Dr. Null cometieron juntos años atrás. Dr. Null confirmó que la responsabilidad era de ambos.",
            "pt": "Dr. E admitiu que preparou o arquivo do Nobel não para ganhar um prêmio, mas para documentar abertamente e corrigir o erro que ele e Dr. Null cometeram juntos anos atrás. Dr. Null confirmou que a responsabilidade era dos dois.",
            "ja": "Dr. Eは、ノーベル賞の資料を賞のためではなく、何年も前にDr. Nullと二人で起こした過ちを公に記録し、修復するために準備したのだと認めた。Dr. Nullも責任は二人にあると認めた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "moxy",
          "bang": "BWOOP!",
          "text": {
            "tr": "Moxy iki bilim insanının arasına süzüldü, kopmuş iki enerji çizgisini yuvarlak elleriyle yeniden birleştirdi ve yumuşak bir ses çıkardı. “bwoop”",
            "en": "Moxy floated between the two scientists, joined two broken energy lines with his round floating hands, and made a soft sound. “bwoop.”",
            "de": "Moxy schwebte zwischen den beiden Wissenschaftlern, verband mit seinen runden schwebenden Händen zwei unterbrochene Energielinien und gab einen leisen Laut von sich. “bwoop.”",
            "es": "Moxy flotó entre los dos científicos, unió dos líneas de energía rotas con sus manos redondas flotantes y emitió un sonido suave. “bwoop.”",
            "pt": "Moxy flutuou entre os dois cientistas, uniu duas linhas de energia rompidas com suas mãos redondas e flutuantes e soltou um som suave. “bwoop.”",
            "ja": "Moxyは二人の科学者の間に浮かび、丸い浮遊する手で切れた二本のエネルギー線をつなぎ、柔らかな音を出した。 “bwoop.”"
          },
          "caption": {
            "tr": "Ekibin gerçek bağı ilk kez kuruluyor.",
            "en": "The team forms its first true bond.",
            "de": "Das Team bildet seine erste echte Bindung.",
            "es": "El equipo forma su primer enlace verdadero.",
            "pt": "A equipe forma sua primeira ligação verdadeira.",
            "ja": "チームに初めて本当の結合が生まれる。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "hero",
          "img": "",
          "narration": {
            "tr": "Moxy iki bilim insanının arasına süzüldü, kopmuş iki enerji çizgisini yuvarlak elleriyle yeniden birleştirdi ve yumuşak bir ses çıkardı.",
            "en": "Moxy floated between the two scientists, joined two broken energy lines with his round floating hands, and made a soft sound.",
            "de": "Moxy schwebte zwischen den beiden Wissenschaftlern, verband mit seinen runden schwebenden Händen zwei unterbrochene Energielinien und gab einen leisen Laut von sich.",
            "es": "Moxy flotó entre los dos científicos, unió dos líneas de energía rotas con sus manos redondas flotantes y emitió un sonido suave.",
            "pt": "Moxy flutuou entre os dois cientistas, uniu duas linhas de energia rompidas com suas mãos redondas e flutuantes e soltou um som suave.",
            "ja": "Moxyは二人の科学者の間に浮かび、丸い浮遊する手で切れた二本のエネルギー線をつなぎ、柔らかな音を出した。"
          },
          "dialogue": {
            "tr": "bwoop",
            "en": "bwoop.",
            "de": "bwoop.",
            "es": "bwoop.",
            "pt": "bwoop.",
            "ja": "bwoop."
          }
        }
      ]
    },
    {
      "id": "moxys-memory",
      "chapter": 14,
      "startLevel": 196,
      "unlockAfter": 195,
      "world": "crystal-cave",
      "bang": "PARLA!",
      "title": {
        "tr": "MOXY’NİN HAFIZASI",
        "en": "MOXY’S MEMORY",
        "de": "MOXYS ERINNERUNG",
        "es": "EL RECUERDO DE MOXY",
        "pt": "A MEMÓRIA DE MOXY",
        "ja": "MOXYの記憶"
      },
      "pages": [
        {
          "speaker": "moxy",
          "bang": "VUM-VUM!",
          "text": {
            "tr": "Kristaller Moxy’nin doğmadan önceki anısını gösterdi: X Sinyali, yıllardır güvenli bir bağ kurabilecek canlı bir denge arıyordu. Moxy’nin ışığı iki kez titreşti. “vum-vum”",
            "en": "The crystals showed Moxy a memory from before his birth: the X Signal had searched for years for a living balance capable of making a safe bond. Moxy’s glow pulsed twice. “vum-vum.”",
            "de": "Die Kristalle zeigten Moxy eine Erinnerung aus der Zeit vor seiner Geburt: Das X-Signal hatte jahrelang nach einem lebenden Gleichgewicht gesucht, das eine sichere Bindung bilden konnte. Moxys Leuchten pulsierte zweimal. “vum-vum.”",
            "es": "Los cristales mostraron a Moxy un recuerdo de antes de su nacimiento: la Señal X había buscado durante años un equilibrio vivo capaz de crear un enlace seguro. El brillo de Moxy pulsó dos veces. “vum-vum.”",
            "pt": "Os cristais mostraram a Moxy uma memória anterior ao seu nascimento: por anos, o Sinal X procurou um equilíbrio vivo capaz de formar uma ligação segura. O brilho de Moxy pulsou duas vezes. “vum-vum.”",
            "ja": "クリスタルはMoxyに、生まれる前の記憶を見せた。Xシグナルは何年もの間、安全な結合を作れる「生きた均衡」を探していた。Moxyの光が二度脈打った。 “vum-vum.”"
          },
          "caption": {
            "tr": "Moxy tehdidin parçası değil; olası çözümü.",
            "en": "Moxy is not part of the threat; he may be the solution.",
            "de": "Moxy ist nicht Teil der Bedrohung; vielleicht ist er die Lösung.",
            "es": "Moxy no forma parte de la amenaza; quizá sea la solución.",
            "pt": "Moxy não faz parte da ameaça; talvez seja a solução.",
            "ja": "Moxyは脅威の一部ではない。解決策なのかもしれない。"
          },
          "cast": [
            "moxy"
          ],
          "shot": "detail",
          "img": "assets/images/story-user/14-moxy-memory.webp",
          "narration": {
            "tr": "Kristaller Moxy’nin doğmadan önceki anısını gösterdi: X Sinyali, yıllardır güvenli bir bağ kurabilecek canlı bir denge arıyordu. Moxy’nin ışığı iki kez titreşti.",
            "en": "The crystals showed Moxy a memory from before his birth: the X Signal had searched for years for a living balance capable of making a safe bond. Moxy’s glow pulsed twice.",
            "de": "Die Kristalle zeigten Moxy eine Erinnerung aus der Zeit vor seiner Geburt: Das X-Signal hatte jahrelang nach einem lebenden Gleichgewicht gesucht, das eine sichere Bindung bilden konnte. Moxys Leuchten pulsierte zweimal.",
            "es": "Los cristales mostraron a Moxy un recuerdo de antes de su nacimiento: la Señal X había buscado durante años un equilibrio vivo capaz de crear un enlace seguro. El brillo de Moxy pulsó dos veces.",
            "pt": "Os cristais mostraram a Moxy uma memória anterior ao seu nascimento: por anos, o Sinal X procurou um equilíbrio vivo capaz de formar uma ligação segura. O brilho de Moxy pulsou duas vezes.",
            "ja": "クリスタルはMoxyに、生まれる前の記憶を見せた。Xシグナルは何年もの間、安全な結合を作れる「生きた均衡」を探していた。Moxyの光が二度脈打った。"
          },
          "dialogue": {
            "tr": "vum-vum",
            "en": "vum-vum.",
            "de": "vum-vum.",
            "es": "vum-vum.",
            "pt": "vum-vum.",
            "ja": "vum-vum."
          }
        },
        {
          "speaker": "null",
          "bang": "HESAPLA.",
          "text": {
            "tr": "Null, Moxy’nin frekansını stabilizatöre çevirdi. “Seni bir araç yapmayacağım. Kararı sen vereceksin.”",
            "en": "Null converted Moxy’s frequency into a stabilizer. “I will not turn you into a tool. The choice is yours.”",
            "de": "Null wandelte Moxys Frequenz in einen Stabilisator um. “Ich werde dich nicht zu einem Werkzeug machen. Du entscheidest.”",
            "es": "Null convirtió la frecuencia de Moxy en un estabilizador. “No voy a convertirte en una herramienta. La decisión es tuya.”",
            "pt": "Null converteu a frequência de Moxy em um estabilizador. “Eu não vou transformar você em uma ferramenta. A escolha é sua.”",
            "ja": "NullはMoxyの周波数を安定化装置へ変換した。 “君を道具にはしない。選ぶのは君だ。”"
          },
          "caption": {
            "tr": "Null’un amacı kontrol değil, sorumluluk.",
            "en": "Null chooses responsibility over control.",
            "de": "Null entscheidet sich für Verantwortung statt Kontrolle.",
            "es": "Null elige la responsabilidad en lugar del control.",
            "pt": "Null escolhe responsabilidade em vez de controle.",
            "ja": "Nullは支配ではなく責任を選ぶ。"
          },
          "cast": [
            "null",
            "moxy"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Null, Moxy’nin frekansını stabilizatöre çevirdi.",
            "en": "Null converted Moxy’s frequency into a stabilizer.",
            "de": "Null wandelte Moxys Frequenz in einen Stabilisator um.",
            "es": "Null convirtió la frecuencia de Moxy en un estabilizador.",
            "pt": "Null converteu a frequência de Moxy em um estabilizador.",
            "ja": "NullはMoxyの周波数を安定化装置へ変換した。"
          },
          "dialogue": {
            "tr": "Seni bir araç yapmayacağım. Kararı sen vereceksin.",
            "en": "I will not turn you into a tool. The choice is yours.",
            "de": "Ich werde dich nicht zu einem Werkzeug machen. Du entscheidest.",
            "es": "No voy a convertirte en una herramienta. La decisión es tuya.",
            "pt": "Eu não vou transformar você em uma ferramenta. A escolha é sua.",
            "ja": "君を道具にはしない。選ぶのは君だ。"
          }
        },
        {
          "speaker": "moxy",
          "bang": "",
          "text": {
            "tr": "Moxy gülümsedi, havada iki kez zıpladı ve ekibin yanına sokuldu. Kararı sözsüzce belliydi: birlikte devam. “pip-pip!”",
            "en": "Moxy smiled, bounced twice in the air, and tucked in beside the team. His wordless decision was clear: continue together. “pip-pip!”",
            "de": "Moxy lächelte, hüpfte zweimal in der Luft und rückte an die Seite des Teams. Seine wortlose Entscheidung war klar: Gemeinsam weitermachen. “pip-pip!”",
            "es": "Moxy sonrió, rebotó dos veces en el aire y se acercó al equipo. Su decisión sin palabras estaba clara: seguir juntos. “¡pip-pip!”",
            "pt": "Moxy sorriu, saltou duas vezes no ar e se acomodou ao lado da equipe. Sua decisão sem palavras era clara: continuar juntos. “pip-pip!”",
            "ja": "Moxyは笑顔を見せ、空中で二度跳ね、チームのそばに寄り添った。言葉はなくても決意は明らかだった――一緒に進む。 “pip-pip!”"
          },
          "caption": {
            "tr": "Korku yerini karara bırakıyor.",
            "en": "Fear gives way to resolve.",
            "de": "Angst weicht Entschlossenheit.",
            "es": "El miedo da paso a la determinación.",
            "pt": "O medo dá lugar à determinação.",
            "ja": "恐れは決意へ変わる。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "hero",
          "img": "",
          "narration": {
            "tr": "Moxy gülümsedi, havada iki kez zıpladı ve ekibin yanına sokuldu. Kararı sözsüzce belliydi: birlikte devam.",
            "en": "Moxy smiled, bounced twice in the air, and tucked in beside the team. His wordless decision was clear: continue together.",
            "de": "Moxy lächelte, hüpfte zweimal in der Luft und rückte an die Seite des Teams. Seine wortlose Entscheidung war klar: Gemeinsam weitermachen.",
            "es": "Moxy sonrió, rebotó dos veces en el aire y se acercó al equipo. Su decisión sin palabras estaba clara: seguir juntos.",
            "pt": "Moxy sorriu, saltou duas vezes no ar e se acomodou ao lado da equipe. Sua decisão sem palavras era clara: continuar juntos.",
            "ja": "Moxyは笑顔を見せ、空中で二度跳ね、チームのそばに寄り添った。言葉はなくても決意は明らかだった――一緒に進む。"
          },
          "dialogue": {
            "tr": "pip-pip!",
            "en": "pip-pip!",
            "de": "pip-pip!",
            "es": "¡pip-pip!",
            "pt": "pip-pip!",
            "ja": "pip-pip!"
          }
        }
      ]
    },
    {
      "id": "truth-in-crystal",
      "chapter": 15,
      "startLevel": 211,
      "unlockAfter": 210,
      "world": "crystal-cave",
      "bang": "AÇIL!",
      "title": {
        "tr": "KRİSTALDEKİ GERÇEK",
        "en": "TRUTH IN CRYSTAL",
        "de": "DIE WAHRHEIT IM KRISTALL",
        "es": "LA VERDAD EN EL CRISTAL",
        "pt": "A VERDADE NO CRISTAL",
        "ja": "クリスタルの真実"
      },
      "pages": [
        {
          "speaker": "moxy",
          "bang": "AÇIL!",
          "text": {
            "tr": "Son kristal, X Sinyalini mavi ve altın iki enerji kutbuna ayırdı. Moxy aradaki kristal anahtarı yerine yerleştirince gizli arşiv mekanizması açıldı. “Vum!”",
            "en": "The final crystal split the X Signal into blue and gold energy poles. When Moxy placed the crystal key between them, the hidden archive mechanism opened. “Vum!”",
            "de": "Der letzte Kristall teilte das X-Signal in einen blauen und einen goldenen Energiepol. Als Moxy den Kristallschlüssel dazwischen setzte, öffnete sich der verborgene Archivmechanismus. “Vum!”",
            "es": "El cristal final dividió la Señal X en polos de energía azul y dorado. Cuando Moxy colocó la llave de cristal entre ellos, se abrió el mecanismo oculto del archivo. “¡Vum!”",
            "pt": "O último cristal dividiu o Sinal X em polos de energia azul e dourado. Quando Moxy colocou a chave de cristal entre eles, o mecanismo secreto do arquivo se abriu. “Vum!”",
            "ja": "最後のクリスタルがXシグナルを青と金の二つのエネルギー極に分けた。Moxyがその間にクリスタル・キーを置くと、隠されたアーカイブ機構が開いた。 “Vum!”"
          },
          "caption": {
            "tr": "Kayıp sayfanın saklandığı bölme sonunda açılıyor.",
            "en": "The compartment hiding the missing page is finally opening.",
            "de": "Das Fach mit der fehlenden Seite öffnet sich endlich.",
            "es": "El compartimento que oculta la página perdida por fin se está abriendo.",
            "pt": "O compartimento que esconde a página desaparecida finalmente está se abrindo.",
            "ja": "消えたページを隠している区画が、ついに開き始める。"
          },
          "cast": [
            "drE",
            "moxy"
          ],
          "shot": "action",
          "img": "assets/images/story-user/15-crystal-truth.webp",
          "narration": {
            "tr": "Son kristal, X Sinyalini mavi ve altın iki enerji kutbuna ayırdı. Moxy aradaki kristal anahtarı yerine yerleştirince gizli arşiv mekanizması açıldı.",
            "en": "The final crystal split the X Signal into blue and gold energy poles. When Moxy placed the crystal key between them, the hidden archive mechanism opened.",
            "de": "Der letzte Kristall teilte das X-Signal in einen blauen und einen goldenen Energiepol. Als Moxy den Kristallschlüssel dazwischen setzte, öffnete sich der verborgene Archivmechanismus.",
            "es": "El cristal final dividió la Señal X en polos de energía azul y dorado. Cuando Moxy colocó la llave de cristal entre ellos, se abrió el mecanismo oculto del archivo.",
            "pt": "O último cristal dividiu o Sinal X em polos de energia azul e dourado. Quando Moxy colocou a chave de cristal entre eles, o mecanismo secreto do arquivo se abriu.",
            "ja": "最後のクリスタルがXシグナルを青と金の二つのエネルギー極に分けた。Moxyがその間にクリスタル・キーを置くと、隠されたアーカイブ機構が開いた。"
          },
          "dialogue": {
            "tr": "Vum!",
            "en": "Vum!",
            "de": "Vum!",
            "es": "¡Vum!",
            "pt": "Vum!",
            "ja": "Vum!"
          }
        },
        {
          "speaker": "cat",
          "bang": "MIRR!",
          "text": {
            "tr": "Kedi atom kolyesini arşiv yuvasına dokundurdu. İçindeki eski X rezonans kristali, arşivin güvenlik kilidiyle eşleşti ve gizli bölmeyi açtı. Kayıp Nobel sayfası dışarı kaydı; son satır Dünya yörüngesindeki İstasyon Sıfır koordinatlarını taşıyordu.",
            "en": "The cat touched its atom pendant to the archive socket. The old X resonance crystal inside matched the archive security lock and opened a hidden compartment. The missing Nobel page slid out; its final line carried the coordinates of Station Zero in Earth orbit.",
            "de": "Die Katze berührte mit ihrem Atom-Anhänger die Buchse des Archivs. Der alte X-Resonanzkristall darin passte zum Sicherheitsschloss des Archivs und öffnete ein verborgenes Fach. Die fehlende Nobel-Seite glitt heraus; ihre letzte Zeile enthielt die Koordinaten von Station Null in der Erdumlaufbahn.",
            "es": "El gato tocó el receptáculo del archivo con su colgante atómico. El antiguo cristal de resonancia X del interior coincidió con el cierre de seguridad del archivo y abrió un compartimento oculto. La página perdida del Nobel salió de él; la última línea contenía las coordenadas de la Estación Cero en la órbita terrestre.",
            "pt": "O gato encostou o pingente de átomo no encaixe do arquivo. O antigo cristal de ressonância X dentro dele correspondeu à trava de segurança do arquivo e abriu um compartimento oculto. A página desaparecida do Nobel deslizou para fora; a última linha trazia as coordenadas da Estação Zero, na órbita da Terra.",
            "ja": "ネコが原子ペンダントをアーカイブのソケットに触れさせた。内部の古いX共鳴結晶がアーカイブのセキュリティロックと一致し、隠し区画が開いた。失われたノーベル資料のページが滑り出し、最後の行には地球軌道上のステーション・ゼロの座標が記されていた。"
          },
          "caption": {
            "tr": "Yıllar önce saklanan sensör, bugün kayıp sayfanın anahtarı oldu.",
            "en": "A sensor preserved years ago has become the key to the missing page.",
            "de": "Ein vor Jahren bewahrter Sensor ist nun der Schlüssel zur fehlenden Seite.",
            "es": "Un sensor conservado durante años se ha convertido en la llave de la página perdida.",
            "pt": "Um sensor preservado por anos tornou-se a chave para a página desaparecida.",
            "ja": "何年も前に残されたセンサーが、失われたページを開く鍵になった。"
          },
          "cast": [
            "cat",
            "null"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Kedi atom kolyesini arşiv yuvasına dokundurdu. İçindeki eski X rezonans kristali, arşivin güvenlik kilidiyle eşleşti ve gizli bölmeyi açtı. Kayıp Nobel sayfası dışarı kaydı; son satır Dünya yörüngesindeki İstasyon Sıfır koordinatlarını taşıyordu.",
            "en": "The cat touched its atom pendant to the archive socket. The old X resonance crystal inside matched the archive security lock and opened a hidden compartment. The missing Nobel page slid out; its final line carried the coordinates of Station Zero in Earth orbit.",
            "de": "Die Katze berührte mit ihrem Atom-Anhänger die Buchse des Archivs. Der alte X-Resonanzkristall darin passte zum Sicherheitsschloss des Archivs und öffnete ein verborgenes Fach. Die fehlende Nobel-Seite glitt heraus; ihre letzte Zeile enthielt die Koordinaten von Station Null in der Erdumlaufbahn.",
            "es": "El gato tocó el receptáculo del archivo con su colgante atómico. El antiguo cristal de resonancia X del interior coincidió con el cierre de seguridad del archivo y abrió un compartimento oculto. La página perdida del Nobel salió de él; la última línea contenía las coordenadas de la Estación Cero en la órbita terrestre.",
            "pt": "O gato encostou o pingente de átomo no encaixe do arquivo. O antigo cristal de ressonância X dentro dele correspondeu à trava de segurança do arquivo e abriu um compartimento oculto. A página desaparecida do Nobel deslizou para fora; a última linha trazia as coordenadas da Estação Zero, na órbita da Terra.",
            "ja": "ネコが原子ペンダントをアーカイブのソケットに触れさせた。内部の古いX共鳴結晶がアーカイブのセキュリティロックと一致し、隠し区画が開いた。失われたノーベル資料のページが滑り出し、最後の行には地球軌道上のステーション・ゼロの座標が記されていた。"
          },
          "dialogue": {
            "tr": "Mrrp!",
            "en": "Mrrp!",
            "de": "Mrrp!",
            "es": "¡Mrrp!",
            "pt": "Mrrp!",
            "ja": "Mrrp!"
          }
        },
        {
          "speaker": "null",
          "bang": "ROTA HAZIR.",
          "text": {
            "tr": "Dr. Null portal motorunu yörünge sıçraması yapabilecek bir sisteme dönüştürdü. “Bu kez hedefi yüzde yüz biliyorum. Yaklaşık.”",
            "en": "Dr. Null rebuilt the portal engine into a system capable of an orbital jump. “This time I know the target one hundred percent. Approximately.”",
            "de": "Dr. Null baute den Portalmotor zu einem System um, das einen Sprung in die Umlaufbahn erlaubte. “Diesmal kenne ich das Ziel zu hundert Prozent. Ungefähr.”",
            "es": "Dr. Null reconstruyó el motor del portal para convertirlo en un sistema capaz de realizar un salto orbital. “Esta vez conozco el objetivo al cien por cien. Aproximadamente.”",
            "pt": "Dr. Null reconstruiu o motor do portal e o transformou em um sistema capaz de realizar um salto orbital. “Desta vez eu sei o alvo com cem por cento de certeza. Aproximadamente.”",
            "ja": "Dr. Nullはポータルエンジンを、軌道ジャンプが可能なシステムへ作り直した。 “今度こそ目標地点は100パーセント分かっている。だいたい。”"
          },
          "caption": {
            "tr": "Kristal Mağara tamamlandı; sıra İstasyon Sıfır’da.",
            "en": "The Crystal Cave is complete; Station Zero is next.",
            "de": "Die Kristallhöhle ist abgeschlossen; als Nächstes kommt Station Null.",
            "es": "La Cueva de Cristal está completa; la siguiente parada es la Estación Cero.",
            "pt": "A Caverna de Cristal está concluída; a próxima parada é a Estação Zero.",
            "ja": "クリスタル洞窟は完了。次はステーション・ゼロだ。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "Dr. Null portal motorunu yörünge sıçraması yapabilecek bir sisteme dönüştürdü.",
            "en": "Dr. Null rebuilt the portal engine into a system capable of an orbital jump.",
            "de": "Dr. Null baute den Portalmotor zu einem System um, das einen Sprung in die Umlaufbahn erlaubte.",
            "es": "Dr. Null reconstruyó el motor del portal para convertirlo en un sistema capaz de realizar un salto orbital.",
            "pt": "Dr. Null reconstruiu o motor do portal e o transformou em um sistema capaz de realizar um salto orbital.",
            "ja": "Dr. Nullはポータルエンジンを、軌道ジャンプが可能なシステムへ作り直した。"
          },
          "dialogue": {
            "tr": "Bu kez hedefi yüzde yüz biliyorum. Yaklaşık.",
            "en": "This time I know the target one hundred percent. Approximately.",
            "de": "Diesmal kenne ich das Ziel zu hundert Prozent. Ungefähr.",
            "es": "Esta vez conozco el objetivo al cien por cien. Aproximadamente.",
            "pt": "Desta vez eu sei o alvo com cem por cento de certeza. Aproximadamente.",
            "ja": "今度こそ目標地点は100パーセント分かっている。だいたい。"
          }
        }
      ]
    },
    {
      "id": "launch-to-orbit",
      "chapter": 16,
      "startLevel": 226,
      "unlockAfter": 225,
      "world": "orbital-station",
      "bang": "FIRLAT!",
      "title": {
        "tr": "YÖRÜNGEYE FIRLAT",
        "en": "LAUNCH TO ORBIT",
        "de": "START IN DIE UMLAUFBAHN",
        "es": "LANZAMIENTO A ÓRBITA",
        "pt": "LANÇAMENTO PARA A ÓRBITA",
        "ja": "軌道へ"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "FIRLAT!",
          "text": {
            "tr": "Yörünge sıçramasından önce ekip son kontroller için laboratuvarda toplandı. X işareti ekranda sabitlenince yıldız geçidi açılmaya başladı. “Çay bittiğine göre uzaya gidebiliriz.”",
            "en": "Before the orbital jump, the team gathered in the laboratory for final checks. When the X mark stabilized on the display, the star gate began to open. “Now that the tea is finished, we can go to space.”",
            "de": "Vor dem Sprung in die Umlaufbahn versammelte sich das Team für die letzten Kontrollen im Labor. Als sich das X-Zeichen auf der Anzeige stabilisierte, begann sich das Sternentor zu öffnen. “Jetzt, wo der Tee ausgetrunken ist, können wir ins All.”",
            "es": "Antes del salto orbital, el equipo se reunió en el laboratorio para las últimas comprobaciones. Cuando la marca X se estabilizó en la pantalla, la puerta estelar comenzó a abrirse. “Ahora que se acabó el té, podemos ir al espacio.”",
            "pt": "Antes do salto orbital, a equipe se reuniu no laboratório para as verificações finais. Quando a marca X se estabilizou no visor, o portal estelar começou a se abrir. “Agora que o chá acabou, podemos ir para o espaço.”",
            "ja": "軌道ジャンプの前に、チームは最終確認のため研究所に集まった。表示上のX印が安定すると、スターゲートが開き始めた。 “お茶も飲み終わったし、宇宙へ行けるな。”"
          },
          "caption": {
            "tr": "İstasyon Sıfır’a giden kapı açıldı.",
            "en": "The gate to Station Zero is open.",
            "de": "Das Tor zu Station Null ist offen.",
            "es": "La puerta a la Estación Cero está abierta.",
            "pt": "O portal para a Estação Zero está aberto.",
            "ja": "ステーション・ゼロへのゲートが開いた。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "wide",
          "img": "assets/images/story-user/16-orbit-launch.webp",
          "narration": {
            "tr": "Yörünge sıçramasından önce ekip son kontroller için laboratuvarda toplandı. X işareti ekranda sabitlenince yıldız geçidi açılmaya başladı.",
            "en": "Before the orbital jump, the team gathered in the laboratory for final checks. When the X mark stabilized on the display, the star gate began to open.",
            "de": "Vor dem Sprung in die Umlaufbahn versammelte sich das Team für die letzten Kontrollen im Labor. Als sich das X-Zeichen auf der Anzeige stabilisierte, begann sich das Sternentor zu öffnen.",
            "es": "Antes del salto orbital, el equipo se reunió en el laboratorio para las últimas comprobaciones. Cuando la marca X se estabilizó en la pantalla, la puerta estelar comenzó a abrirse.",
            "pt": "Antes do salto orbital, a equipe se reuniu no laboratório para as verificações finais. Quando a marca X se estabilizou no visor, o portal estelar começou a se abrir.",
            "ja": "軌道ジャンプの前に、チームは最終確認のため研究所に集まった。表示上のX印が安定すると、スターゲートが開き始めた。"
          },
          "dialogue": {
            "tr": "Çay bittiğine göre uzaya gidebiliriz.",
            "en": "Now that the tea is finished, we can go to space.",
            "de": "Jetzt, wo der Tee ausgetrunken ist, können wir ins All.",
            "es": "Ahora que se acabó el té, podemos ir al espacio.",
            "pt": "Agora que o chá acabou, podemos ir para o espaço.",
            "ja": "お茶も飲み終わったし、宇宙へ行けるな。"
          }
        },
        {
          "speaker": "moxy",
          "bang": "VİUUU!",
          "text": {
            "tr": "Moxy yerçekimsiz ortamda art arda taklalar attı. Her dönüşte neşeyle bir ses çıkardı ve kedi onu yakalamaya çalıştı. “viiuuu!”",
            "en": "Moxy spun through zero gravity in a chain of somersaults. Each turn made him chirp with delight, and the cat tried to catch him. “viiuuu!”",
            "de": "Moxy schlug in der Schwerelosigkeit einen Salto nach dem anderen. Bei jeder Drehung zwitscherte er vor Freude, und die Katze versuchte, ihn zu fangen. “viiuuu!”",
            "es": "Moxy dio una serie de volteretas en gravedad cero. En cada giro soltaba un chirrido de alegría y el gato intentaba atraparlo. “¡viiuuu!”",
            "pt": "Moxy girou em gravidade zero numa sequência de cambalhotas. A cada volta, soltava um som de alegria, e o gato tentava pegá-lo. “viiuuu!”",
            "ja": "Moxyは無重力の中で連続宙返りをした。回るたび楽しそうな声を上げ、ネコは彼を捕まえようとした。 “viiuuu!”"
          },
          "caption": {
            "tr": "Kısa bir gülüş, büyük finalden önce nefes.",
            "en": "A quick laugh before the great finale.",
            "de": "Ein kurzes Lachen vor dem großen Finale.",
            "es": "Una risa rápida antes del gran final.",
            "pt": "Uma risada rápida antes do grande final.",
            "ja": "大きなフィナーレの前に、ひと笑い。"
          },
          "cast": [
            "moxy",
            "cat"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "Moxy yerçekimsiz ortamda art arda taklalar attı. Her dönüşte neşeyle bir ses çıkardı ve kedi onu yakalamaya çalıştı.",
            "en": "Moxy spun through zero gravity in a chain of somersaults. Each turn made him chirp with delight, and the cat tried to catch him.",
            "de": "Moxy schlug in der Schwerelosigkeit einen Salto nach dem anderen. Bei jeder Drehung zwitscherte er vor Freude, und die Katze versuchte, ihn zu fangen.",
            "es": "Moxy dio una serie de volteretas en gravedad cero. En cada giro soltaba un chirrido de alegría y el gato intentaba atraparlo.",
            "pt": "Moxy girou em gravidade zero numa sequência de cambalhotas. A cada volta, soltava um som de alegria, e o gato tentava pegá-lo.",
            "ja": "Moxyは無重力の中で連続宙返りをした。回るたび楽しそうな声を上げ、ネコは彼を捕まえようとした。"
          },
          "dialogue": {
            "tr": "viiuuu!",
            "en": "viiuuu!",
            "de": "viiuuu!",
            "es": "¡viiuuu!",
            "pt": "viiuuu!",
            "ja": "viiuuu!"
          }
        },
        {
          "speaker": "null",
          "bang": "TEMAS.",
          "text": {
            "tr": "İstasyondan cevap gelmedi. Kapılar kilitliydi ve X Sinyali bütün gücü çekiyordu.",
            "en": "The station did not respond. Its doors were locked, and the X Signal was draining all power.",
            "de": "Die Station antwortete nicht. Ihre Türen waren verriegelt, und das X-Signal zog die gesamte Energie ab.",
            "es": "La estación no respondió. Sus puertas estaban bloqueadas y la Señal X estaba drenando toda la energía.",
            "pt": "A estação não respondeu. As portas estavam trancadas e o Sinal X drenava toda a energia.",
            "ja": "ステーションから応答はなかった。扉はロックされ、Xシグナルが全電力を吸い取っていた。"
          },
          "caption": {
            "tr": "İstasyon terk edilmiş değil; bekliyor.",
            "en": "The station is not abandoned. It is waiting.",
            "de": "Die Station ist nicht verlassen. Sie wartet.",
            "es": "La estación no está abandonada. Está esperando.",
            "pt": "A estação não está abandonada. Ela está esperando.",
            "ja": "ステーションは放棄されたのではない。待っている。"
          },
          "cast": [
            "null",
            "drE"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "İstasyondan cevap gelmedi. Kapılar kilitliydi ve X Sinyali bütün gücü çekiyordu.",
            "en": "The station did not respond. Its doors were locked, and the X Signal was draining all power.",
            "de": "Die Station antwortete nicht. Ihre Türen waren verriegelt, und das X-Signal zog die gesamte Energie ab.",
            "es": "La estación no respondió. Sus puertas estaban bloqueadas y la Señal X estaba drenando toda la energía.",
            "pt": "A estação não respondeu. As portas estavam trancadas e o Sinal X drenava toda a energia.",
            "ja": "ステーションから応答はなかった。扉はロックされ、Xシグナルが全電力を吸い取っていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    },
    {
      "id": "station-zero",
      "chapter": 17,
      "startLevel": 241,
      "unlockAfter": 240,
      "world": "orbital-station",
      "bang": "ALARM!",
      "title": {
        "tr": "İSTASYON SIFIR",
        "en": "STATION ZERO",
        "de": "STATION NULL",
        "es": "ESTACIÓN CERO",
        "pt": "ESTAÇÃO ZERO",
        "ja": "ステーション・ゼロ"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "ALARM!",
          "text": {
            "tr": "İstasyona adım attıklarında merkez kubbede dev X Sinyali yandı. Aynı anda koridorlar hareketli duvarlar ve enerji kapılarıyla yeniden şekillendi.",
            "en": "As they entered the station, a giant X Signal ignited in the central dome. At the same moment, the corridors reshaped themselves with moving walls and energy gates.",
            "de": "Als sie die Station betraten, entzündete sich in der zentralen Kuppel ein riesiges X-Signal. Gleichzeitig formten sich die Korridore mit beweglichen Wänden und Energietoren neu.",
            "es": "Al entrar en la estación, una gigantesca Señal X se encendió en la cúpula central. Al mismo tiempo, los pasillos se reconfiguraron con paredes móviles y puertas de energía.",
            "pt": "Ao entrarem na estação, um enorme Sinal X se acendeu na cúpula central. Ao mesmo tempo, os corredores se reorganizaram com paredes móveis e portões de energia.",
            "ja": "ステーションへ入ると、中央ドームに巨大なXシグナルが点灯した。同時に通路は動く壁とエネルギーゲートで形を変え始めた。"
          },
          "caption": {
            "tr": "Bütün mekanikler tek sistemde birleşiyor.",
            "en": "Every mechanic is merging into one system.",
            "de": "Alle Mechaniken verschmelzen zu einem System.",
            "es": "Todas las mecánicas se están fusionando en un solo sistema.",
            "pt": "Todas as mecânicas estão se fundindo em um único sistema.",
            "ja": "すべての仕組みが一つのシステムへ統合されていく。"
          },
          "cast": [
            "drE",
            "moxy"
          ],
          "shot": "action",
          "img": "assets/images/story-user/17-station-x-signal.webp",
          "narration": {
            "tr": "İstasyona adım attıklarında merkez kubbede dev X Sinyali yandı. Aynı anda koridorlar hareketli duvarlar ve enerji kapılarıyla yeniden şekillendi.",
            "en": "As they entered the station, a giant X Signal ignited in the central dome. At the same moment, the corridors reshaped themselves with moving walls and energy gates.",
            "de": "Als sie die Station betraten, entzündete sich in der zentralen Kuppel ein riesiges X-Signal. Gleichzeitig formten sich die Korridore mit beweglichen Wänden und Energietoren neu.",
            "es": "Al entrar en la estación, una gigantesca Señal X se encendió en la cúpula central. Al mismo tiempo, los pasillos se reconfiguraron con paredes móviles y puertas de energía.",
            "pt": "Ao entrarem na estação, um enorme Sinal X se acendeu na cúpula central. Ao mesmo tempo, os corredores se reorganizaram com paredes móveis e portões de energia.",
            "ja": "ステーションへ入ると、中央ドームに巨大なXシグナルが点灯した。同時に通路は動く壁とエネルギーゲートで形を変え始めた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "BULDUM.",
          "text": {
            "tr": "Null merkez bilgisayarı açtı. Nobel Komitesi, X-Bağı deneyini uzaktan izliyordu.",
            "en": "Null opened the central computer. The Nobel Committee was monitoring the X-Bond experiment remotely.",
            "de": "Null öffnete den Zentralcomputer. Das Nobelkomitee überwachte das X-Bindungs-Experiment aus der Ferne.",
            "es": "Null abrió el ordenador central. El Comité Nobel estaba supervisando a distancia el experimento del Enlace X.",
            "pt": "Null abriu o computador central. O Comitê Nobel acompanhava remotamente o experimento da Ligação X.",
            "ja": "Nullが中央コンピューターを開いた。ノーベル委員会はX結合の実験を遠隔で監視していた。"
          },
          "caption": {
            "tr": "Final yalnızca kazanılmayacak; kanıtlanacak.",
            "en": "The finale must be proven, not merely won.",
            "de": "Das Finale muss bewiesen und nicht nur gewonnen werden.",
            "es": "El final debe demostrarse, no solo ganarse.",
            "pt": "O final precisa ser provado, não apenas vencido.",
            "ja": "フィナーレは勝つだけでは足りない。証明しなければならない。"
          },
          "cast": [
            "null"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "Null merkez bilgisayarı açtı. Nobel Komitesi, X-Bağı deneyini uzaktan izliyordu.",
            "en": "Null opened the central computer. The Nobel Committee was monitoring the X-Bond experiment remotely.",
            "de": "Null öffnete den Zentralcomputer. Das Nobelkomitee überwachte das X-Bindungs-Experiment aus der Ferne.",
            "es": "Null abrió el ordenador central. El Comité Nobel estaba supervisando a distancia el experimento del Enlace X.",
            "pt": "Null abriu o computador central. O Comitê Nobel acompanhava remotamente o experimento da Ligação X.",
            "ja": "Nullが中央コンピューターを開いた。ノーベル委員会はX結合の実験を遠隔で監視していた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "moxy",
          "bang": "BWOOP!",
          "text": {
            "tr": "Moxy istasyonun kalbine baktı. Bağ enerjisini hissedince gövdesi parladı; doğru yönü ışıkla işaret etti. “bwoop!”",
            "en": "Moxy looked toward the heart of the station. Feeling the bond energy, his body lit up; he pointed the right direction with light. “bwoop!”",
            "de": "Moxy blickte zum Herzen der Station. Als er die Bindungsenergie spürte, leuchtete sein Körper auf; mit Licht zeigte er die richtige Richtung. “bwoop!”",
            "es": "Moxy miró hacia el corazón de la estación. Al sentir la energía de los enlaces, su cuerpo se iluminó y señaló la dirección correcta con luz. “¡bwoop!”",
            "pt": "Moxy olhou para o coração da estação. Ao sentir a energia das ligações, seu corpo se iluminou; ele apontou a direção correta com a luz. “bwoop!”",
            "ja": "Moxyはステーションの中心を見つめた。結合エネルギーを感じると体が光り、光で正しい方向を示した。 “bwoop!”"
          },
          "caption": {
            "tr": "Oyuncu ve Moxy aynı göreve bağlanıyor.",
            "en": "The player and Moxy join the same mission.",
            "de": "Der Spieler und Moxy verbinden sich in derselben Mission.",
            "es": "El jugador y Moxy se unen en la misma misión.",
            "pt": "O jogador e Moxy entram na mesma missão.",
            "ja": "プレイヤーとMoxyが同じ任務でつながる。"
          },
          "cast": [
            "moxy",
            "drE",
            "null",
            "cat"
          ],
          "shot": "hero",
          "img": "",
          "narration": {
            "tr": "Moxy istasyonun kalbine baktı. Bağ enerjisini hissedince gövdesi parladı; doğru yönü ışıkla işaret etti.",
            "en": "Moxy looked toward the heart of the station. Feeling the bond energy, his body lit up; he pointed the right direction with light.",
            "de": "Moxy blickte zum Herzen der Station. Als er die Bindungsenergie spürte, leuchtete sein Körper auf; mit Licht zeigte er die richtige Richtung.",
            "es": "Moxy miró hacia el corazón de la estación. Al sentir la energía de los enlaces, su cuerpo se iluminó y señaló la dirección correcta con luz.",
            "pt": "Moxy olhou para o coração da estação. Ao sentir a energia das ligações, seu corpo se iluminou; ele apontou a direção correta com a luz.",
            "ja": "Moxyはステーションの中心を見つめた。結合エネルギーを感じると体が光り、光で正しい方向を示した。"
          },
          "dialogue": {
            "tr": "bwoop!",
            "en": "bwoop!",
            "de": "bwoop!",
            "es": "¡bwoop!",
            "pt": "bwoop!",
            "ja": "bwoop!"
          }
        }
      ]
    },
    {
      "id": "committee-trial",
      "chapter": 18,
      "startLevel": 256,
      "unlockAfter": 255,
      "world": "orbital-station",
      "bang": "KAYIT!",
      "title": {
        "tr": "KOMİTE SINAVI",
        "en": "THE COMMITTEE TRIAL",
        "de": "DIE PRÜFUNG DES KOMITEES",
        "es": "LA PRUEBA DEL COMITÉ",
        "pt": "O JULGAMENTO DO COMITÊ",
        "ja": "委員会の試練"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "KAYIT!",
          "text": {
            "tr": "Nobel Komitesi yayına bağlandı. Dr. E eski hatayı saklamadan anlattı.",
            "en": "The Nobel Committee joined the transmission. Dr. E described the old failure without hiding it.",
            "de": "Das Nobelkomitee schaltete sich in die Übertragung ein. Dr. E schilderte den alten Fehlschlag, ohne etwas zu verbergen.",
            "es": "El Comité Nobel se conectó a la transmisión. Dr. E describió el antiguo fracaso sin ocultarlo.",
            "pt": "O Comitê Nobel entrou na transmissão. Dr. E descreveu o antigo fracasso sem escondê-lo.",
            "ja": "ノーベル委員会が通信に参加した。Dr. Eは昔の失敗を隠さず説明した。"
          },
          "caption": {
            "tr": "Gerçek bilim, hatayı da kanıtın parçası yapar.",
            "en": "Real science makes failure part of the evidence.",
            "de": "Echte Wissenschaft macht auch Fehler zu einem Teil der Beweise.",
            "es": "La ciencia de verdad convierte el fracaso en parte de la evidencia.",
            "pt": "A verdadeira ciência transforma o fracasso em parte da evidência.",
            "ja": "本当の科学は、失敗も証拠の一部にする。"
          },
          "cast": [
            "drE"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Nobel Komitesi yayına bağlandı. Dr. E eski hatayı saklamadan anlattı.",
            "en": "The Nobel Committee joined the transmission. Dr. E described the old failure without hiding it.",
            "de": "Das Nobelkomitee schaltete sich in die Übertragung ein. Dr. E schilderte den alten Fehlschlag, ohne etwas zu verbergen.",
            "es": "El Comité Nobel se conectó a la transmisión. Dr. E describió el antiguo fracaso sin ocultarlo.",
            "pt": "O Comitê Nobel entrou na transmissão. Dr. E descreveu o antigo fracasso sem escondê-lo.",
            "ja": "ノーベル委員会が通信に参加した。Dr. Eは昔の失敗を隠さず説明した。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "null",
          "bang": "ONAY.",
          "text": {
            "tr": "Null bütün sorumluluğu paylaşarak kayıtları açtı. “Rakibim olabilir. Suç ortağım değil; bilim ortağım.”",
            "en": "Null opened the records and shared responsibility. “He may be my rival. He is not my accomplice; he is my partner in science.”",
            "de": "Null öffnete die Aufzeichnungen und übernahm seinen Teil der Verantwortung. “Er mag mein Rivale sein. Er ist nicht mein Komplize; er ist mein Partner in der Wissenschaft.”",
            "es": "Null abrió los registros y asumió su parte de la responsabilidad. “Puede ser mi rival. No es mi cómplice; es mi compañero en la ciencia.”",
            "pt": "Null abriu os registros e assumiu sua parte da responsabilidade. “Ele pode ser meu rival. Não é meu cúmplice; é meu parceiro na ciência.”",
            "ja": "Nullは記録を公開し、自分の責任も引き受けた。 “彼は私のライバルかもしれない。共犯者ではない。科学のパートナーだ。”"
          },
          "caption": {
            "tr": "Rekabet işbirliğine dönüşüyor.",
            "en": "Rivalry turns into collaboration.",
            "de": "Rivalität wird zu Zusammenarbeit.",
            "es": "La rivalidad se convierte en colaboración.",
            "pt": "A rivalidade se transforma em colaboração.",
            "ja": "対立が協力へ変わる。"
          },
          "cast": [
            "null",
            "drE"
          ],
          "shot": "wide",
          "img": "",
          "narration": {
            "tr": "Null bütün sorumluluğu paylaşarak kayıtları açtı.",
            "en": "Null opened the records and shared responsibility.",
            "de": "Null öffnete die Aufzeichnungen und übernahm seinen Teil der Verantwortung.",
            "es": "Null abrió los registros y asumió su parte de la responsabilidad.",
            "pt": "Null abriu os registros e assumiu sua parte da responsabilidade.",
            "ja": "Nullは記録を公開し、自分の責任も引き受けた。"
          },
          "dialogue": {
            "tr": "Rakibim olabilir. Suç ortağım değil; bilim ortağım.",
            "en": "He may be my rival. He is not my accomplice; he is my partner in science.",
            "de": "Er mag mein Rivale sein. Er ist nicht mein Komplize; er ist mein Partner in der Wissenschaft.",
            "es": "Puede ser mi rival. No es mi cómplice; es mi compañero en la ciencia.",
            "pt": "Ele pode ser meu rival. Não é meu cúmplice; é meu parceiro na ciência.",
            "ja": "彼は私のライバルかもしれない。共犯者ではない。科学のパートナーだ。"
          }
        },
        {
          "speaker": "moxy",
          "bang": "BLUP!",
          "text": {
            "tr": "Moxy kameraya fazla yaklaştı, merceği tamamen kapladı ve komik bir ses çıkardı. Komite ilk kez güldü, sonra deneye devam kararı verdi. “blup!”",
            "en": "Moxy floated far too close to the camera, filled the whole lens, and made a comic sound. The committee laughed for the first time, then approved continuing the experiment. “blup!”",
            "de": "Moxy schwebte viel zu nah an die Kamera und füllte das gesamte Bild. Dann gab er einen komischen Laut von sich. Das Komitee lachte zum ersten Mal und genehmigte anschließend die Fortsetzung des Experiments. “blup!”",
            "es": "Moxy flotó demasiado cerca de la cámara y llenó toda la imagen. Después emitió un sonido cómico. El comité se rio por primera vez y aprobó continuar con el experimento. “¡blup!”",
            "pt": "Moxy flutuou perto demais da câmera, ocupou toda a lente e soltou um som engraçado. O comitê riu pela primeira vez e então aprovou a continuação do experimento. “blup!”",
            "ja": "Moxyはカメラに近づきすぎてレンズいっぱいに映り、コミカルな音を出した。委員会は初めて笑い、その後、実験の続行を承認した。 “blup!”"
          },
          "caption": {
            "tr": "Komite oybirliğiyle deneye devam dedi.",
            "en": "The committee unanimously approved continuing the experiment.",
            "de": "Das Komitee genehmigte einstimmig die Fortsetzung des Experiments.",
            "es": "El comité aprobó por unanimidad continuar con el experimento.",
            "pt": "O comitê aprovou por unanimidade a continuação do experimento.",
            "ja": "委員会は全会一致で実験続行を承認した。"
          },
          "cast": [
            "moxy",
            "cat"
          ],
          "shot": "hero",
          "img": "",
          "narration": {
            "tr": "Moxy kameraya fazla yaklaştı, merceği tamamen kapladı ve komik bir ses çıkardı. Komite ilk kez güldü, sonra deneye devam kararı verdi.",
            "en": "Moxy floated far too close to the camera, filled the whole lens, and made a comic sound. The committee laughed for the first time, then approved continuing the experiment.",
            "de": "Moxy schwebte viel zu nah an die Kamera und füllte das gesamte Bild. Dann gab er einen komischen Laut von sich. Das Komitee lachte zum ersten Mal und genehmigte anschließend die Fortsetzung des Experiments.",
            "es": "Moxy flotó demasiado cerca de la cámara y llenó toda la imagen. Después emitió un sonido cómico. El comité se rio por primera vez y aprobó continuar con el experimento.",
            "pt": "Moxy flutuou perto demais da câmera, ocupou toda a lente e soltou um som engraçado. O comitê riu pela primeira vez e então aprovou a continuação do experimento.",
            "ja": "Moxyはカメラに近づきすぎてレンズいっぱいに映り、コミカルな音を出した。委員会は初めて笑い、その後、実験の続行を承認した。"
          },
          "dialogue": {
            "tr": "blup!",
            "en": "blup!",
            "de": "blup!",
            "es": "¡blup!",
            "pt": "blup!",
            "ja": "blup!"
          }
        }
      ]
    },
    {
      "id": "cat-saves-station",
      "chapter": 19,
      "startLevel": 271,
      "unlockAfter": 270,
      "world": "orbital-station",
      "bang": "PAT!",
      "title": {
        "tr": "KEDİNİN HAMLESİ",
        "en": "THE CAT’S MOVE",
        "de": "DER ZUG DER KATZE",
        "es": "LA JUGADA DEL GATO",
        "pt": "A JOGADA DO GATO",
        "ja": "ネコの一手"
      },
      "pages": [
        {
          "speaker": "cat",
          "bang": "PAT!",
          "text": {
            "tr": "Bir enerji darbesi istasyonun stabilizatörünü kilitledi. Acil denge düğmesi büyüyen alanın öteki tarafında kaldı; konsola ulaşabilecek tek kişi kediydi. “Miyav!”",
            "en": "An energy surge locked the station stabilizer. The emergency balance button was stranded beyond the growing field; the cat was the only one small enough to reach the console. “Meow!”",
            "de": "Ein Energiestoß verriegelte den Stabilisator der Station. Der Notfall-Ausgleichsknopf lag jenseits des wachsenden Feldes; nur die Katze war klein genug, um das Bedienpult zu erreichen. “Miau!”",
            "es": "Una descarga de energía bloqueó el estabilizador de la estación. El botón de equilibrio de emergencia quedó al otro lado del campo creciente; el gato era el único lo bastante pequeño para llegar a la consola. “¡Miau!”",
            "pt": "Um surto de energia travou o estabilizador da estação. O botão de equilíbrio de emergência ficou além do campo crescente; o gato era o único pequeno o bastante para alcançar o console. “Miau!”",
            "ja": "エネルギーの急上昇でステーションの安定化装置がロックされた。緊急バランスボタンは広がるフィールドの向こう側。コンソールへ届くほど小さいのはネコだけだった。 “ニャー！”"
          },
          "caption": {
            "tr": "Final deney artık dört patiyle devam ediyor.",
            "en": "The final experiment now depends on four paws.",
            "de": "Das Finalexperiment hängt jetzt von vier Pfoten ab.",
            "es": "El experimento final ahora depende de cuatro patas.",
            "pt": "O experimento final agora depende de quatro patas.",
            "ja": "最後の実験は、四本の足に託された。"
          },
          "cast": [
            "cat"
          ],
          "shot": "action",
          "img": "assets/images/story-user/19-cat-saves-station.webp",
          "narration": {
            "tr": "Bir enerji darbesi istasyonun stabilizatörünü kilitledi. Acil denge düğmesi büyüyen alanın öteki tarafında kaldı; konsola ulaşabilecek tek kişi kediydi.",
            "en": "An energy surge locked the station stabilizer. The emergency balance button was stranded beyond the growing field; the cat was the only one small enough to reach the console.",
            "de": "Ein Energiestoß verriegelte den Stabilisator der Station. Der Notfall-Ausgleichsknopf lag jenseits des wachsenden Feldes; nur die Katze war klein genug, um das Bedienpult zu erreichen.",
            "es": "Una descarga de energía bloqueó el estabilizador de la estación. El botón de equilibrio de emergencia quedó al otro lado del campo creciente; el gato era el único lo bastante pequeño para llegar a la consola.",
            "pt": "Um surto de energia travou o estabilizador da estação. O botão de equilíbrio de emergência ficou além do campo crescente; o gato era o único pequeno o bastante para alcançar o console.",
            "ja": "エネルギーの急上昇でステーションの安定化装置がロックされた。緊急バランスボタンは広がるフィールドの向こう側。コンソールへ届くほど小さいのはネコだけだった。"
          },
          "dialogue": {
            "tr": "Miyav!",
            "en": "Meow!",
            "de": "Miau!",
            "es": "¡Miau!",
            "pt": "Miau!",
            "ja": "ニャー！"
          }
        },
        {
          "speaker": "null",
          "bang": "LÜTFEN.",
          "text": {
            "tr": "Dr. Null, kediye giden güvenli hattı ekranda tutarken Dr. E enerjiyi birkaç saniye daha dengede tuttu. “Kırmızı düğme. Hadi, küçük ortak.”",
            "en": "Dr. Null kept the safe route visible for the cat while Dr. E held the energy steady for a few more seconds. “The red button. Come on, little partner.”",
            "de": "Dr. Null hielt den sicheren Weg für die Katze sichtbar, während Dr. E die Energie noch einige Sekunden stabil hielt. “Der rote Knopf. Los, kleiner Partner.”",
            "es": "Dr. Null mantuvo visible la ruta segura para el gato mientras Dr. E estabilizaba la energía durante unos segundos más. “El botón rojo. Vamos, pequeño compañero.”",
            "pt": "Dr. Null manteve a rota segura visível para o gato enquanto Dr. E segurava a energia estável por mais alguns segundos. “O botão vermelho. Vamos, pequeno parceiro.”",
            "ja": "Dr. Nullがネコの安全な経路を表示し続ける間、Dr. Eはあと数秒だけエネルギーを安定させた。 “赤いボタンだ。頼むぞ、小さな相棒。”"
          },
          "caption": {
            "tr": "Bir saniye daha gecikirse istasyon yeniden kapanacak.",
            "en": "One more second and the station will shut down again.",
            "de": "Noch eine Sekunde, und die Station fährt wieder herunter.",
            "es": "Un segundo más y la estación volverá a apagarse.",
            "pt": "Mais um segundo e a estação vai desligar novamente.",
            "ja": "あと一秒遅れれば、ステーションは再び停止する。"
          },
          "cast": [
            "null",
            "cat"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Dr. Null, kediye giden güvenli hattı ekranda tutarken Dr. E enerjiyi birkaç saniye daha dengede tuttu.",
            "en": "Dr. Null kept the safe route visible for the cat while Dr. E held the energy steady for a few more seconds.",
            "de": "Dr. Null hielt den sicheren Weg für die Katze sichtbar, während Dr. E die Energie noch einige Sekunden stabil hielt.",
            "es": "Dr. Null mantuvo visible la ruta segura para el gato mientras Dr. E estabilizaba la energía durante unos segundos más.",
            "pt": "Dr. Null manteve a rota segura visível para o gato enquanto Dr. E segurava a energia estável por mais alguns segundos.",
            "ja": "Dr. Nullがネコの安全な経路を表示し続ける間、Dr. Eはあと数秒だけエネルギーを安定させた。"
          },
          "dialogue": {
            "tr": "Kırmızı düğme. Hadi, küçük ortak.",
            "en": "The red button. Come on, little partner.",
            "de": "Der rote Knopf. Los, kleiner Partner.",
            "es": "El botón rojo. Vamos, pequeño compañero.",
            "pt": "O botão vermelho. Vamos, pequeno parceiro.",
            "ja": "赤いボタンだ。頼むぞ、小さな相棒。"
          }
        },
        {
          "speaker": "cat",
          "bang": "MİYAV!",
          "text": {
            "tr": "Kedi kırmızı denge düğmesine bastı. Stabilizatör yeniden devreye girdi; mor enerji çöktü ve Moxy’nin ışığı bütün istasyona geri döndü. “Mrrrp!”",
            "en": "The cat pressed the red balance button. The stabilizer came back online; the purple energy collapsed and Moxy’s light returned throughout the station. “Mrrrp!”",
            "de": "Die Katze drückte den roten Ausgleichsknopf. Der Stabilisator ging wieder online; die violette Energie brach zusammen und Moxys Licht kehrte in die ganze Station zurück. “Mrrrp!”",
            "es": "El gato pulsó el botón rojo de equilibrio. El estabilizador volvió a funcionar; la energía violeta colapsó y la luz de Moxy regresó por toda la estación. “¡Mrrrp!”",
            "pt": "O gato pressionou o botão vermelho de equilíbrio. O estabilizador voltou a funcionar; a energia roxa colapsou e a luz de Moxy retornou por toda a estação. “Mrrrp!”",
            "ja": "ネコが赤いバランスボタンを押した。安定化装置が復旧し、紫のエネルギーは消え、Moxyの光がステーション全体に戻った。 “Mrrrp!”"
          },
          "caption": {
            "tr": "En küçük hamle bütün sistemi kurtardı.",
            "en": "The smallest move saved the entire system.",
            "de": "Der kleinste Zug rettete das gesamte System.",
            "es": "La jugada más pequeña salvó todo el sistema.",
            "pt": "O menor movimento salvou todo o sistema.",
            "ja": "最も小さな一手が、システム全体を救った。"
          },
          "cast": [
            "cat",
            "moxy",
            "null"
          ],
          "shot": "hero",
          "img": "",
          "narration": {
            "tr": "Kedi kırmızı denge düğmesine bastı. Stabilizatör yeniden devreye girdi; mor enerji çöktü ve Moxy’nin ışığı bütün istasyona geri döndü.",
            "en": "The cat pressed the red balance button. The stabilizer came back online; the purple energy collapsed and Moxy’s light returned throughout the station.",
            "de": "Die Katze drückte den roten Ausgleichsknopf. Der Stabilisator ging wieder online; die violette Energie brach zusammen und Moxys Licht kehrte in die ganze Station zurück.",
            "es": "El gato pulsó el botón rojo de equilibrio. El estabilizador volvió a funcionar; la energía violeta colapsó y la luz de Moxy regresó por toda la estación.",
            "pt": "O gato pressionou o botão vermelho de equilíbrio. O estabilizador voltou a funcionar; a energia roxa colapsou e a luz de Moxy retornou por toda a estação.",
            "ja": "ネコが赤いバランスボタンを押した。安定化装置が復旧し、紫のエネルギーは消え、Moxyの光がステーション全体に戻った。"
          },
          "dialogue": {
            "tr": "Mrrrp!",
            "en": "Mrrrp!",
            "de": "Mrrrp!",
            "es": "¡Mrrrp!",
            "pt": "Mrrrp!",
            "ja": "Mrrrp!"
          }
        }
      ]
    },
    {
      "id": "final-bond",
      "chapter": 20,
      "startLevel": 286,
      "unlockAfter": 285,
      "world": "orbital-station",
      "bang": "BİRLİKTE!",
      "title": {
        "tr": "SON BAĞ",
        "en": "THE FINAL BOND",
        "de": "DIE LETZTE BINDUNG",
        "es": "EL ENLACE FINAL",
        "pt": "A LIGAÇÃO FINAL",
        "ja": "最後の結合"
      },
      "pages": [
        {
          "speaker": "drE",
          "bang": "BİRLİKTE!",
          "text": {
            "tr": "Son on beş deney için Dr. E rotayı, Null enerji fazlarını, Moxy bağ dengesini yönetti.",
            "en": "For the final fifteen experiments, Dr. E guided the route, Null controlled the energy phases, and Moxy balanced the bonds.",
            "de": "Für die letzten fünfzehn Experimente führte Dr. E die Route, Null kontrollierte die Energiephasen und Moxy stabilisierte die Bindungen.",
            "es": "Durante los últimos quince experimentos, Dr. E guio la ruta, Null controló las fases de energía y Moxy equilibró los enlaces.",
            "pt": "Nos quinze experimentos finais, Dr. E guiou a rota, Null controlou as fases de energia e Moxy equilibrou as ligações.",
            "ja": "最後の15実験では、Dr. Eが経路を導き、Nullがエネルギー位相を制御し、Moxyが結合の均衡を取った。"
          },
          "caption": {
            "tr": "Üç bilim insanı, bir kedi ve sen.",
            "en": "Three scientists, one cat, and you.",
            "de": "Drei Wissenschaftler, eine Katze und du.",
            "es": "Tres científicos, un gato y tú.",
            "pt": "Três cientistas, um gato e você.",
            "ja": "三人の科学者、一匹のネコ、そして君。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "wide",
          "img": "assets/images/story-user/20-final-bond.webp",
          "narration": {
            "tr": "Son on beş deney için Dr. E rotayı, Null enerji fazlarını, Moxy bağ dengesini yönetti.",
            "en": "For the final fifteen experiments, Dr. E guided the route, Null controlled the energy phases, and Moxy balanced the bonds.",
            "de": "Für die letzten fünfzehn Experimente führte Dr. E die Route, Null kontrollierte die Energiephasen und Moxy stabilisierte die Bindungen.",
            "es": "Durante los últimos quince experimentos, Dr. E guio la ruta, Null controló las fases de energía y Moxy equilibró los enlaces.",
            "pt": "Nos quinze experimentos finais, Dr. E guiou a rota, Null controlou as fases de energia e Moxy equilibrou as ligações.",
            "ja": "最後の15実験では、Dr. Eが経路を導き、Nullがエネルギー位相を制御し、Moxyが結合の均衡を取った。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        },
        {
          "speaker": "moxy",
          "bang": "VUM!",
          "text": {
            "tr": "X Sinyali artık bir tehdit gibi değil, tamamlanmamış bir molekül gibi görünüyordu. Moxy sinyalin çevresinde dönüp tek bir titreşimle eksik bağı işaretledi. “vum!”",
            "en": "The X Signal no longer looked like a threat, but like an unfinished molecule. Moxy circled it and marked the missing bond with a single pulse. “vum!”",
            "de": "Das X-Signal wirkte nicht mehr wie eine Bedrohung, sondern wie ein unfertiges Molekül. Moxy kreiste darum und markierte die fehlende Bindung mit einem einzelnen Impuls. “vum!”",
            "es": "La Señal X ya no parecía una amenaza, sino una molécula sin terminar. Moxy giró a su alrededor y marcó el enlace que faltaba con un solo pulso. “¡vum!”",
            "pt": "O Sinal X já não parecia uma ameaça, mas uma molécula incompleta. Moxy circulou ao redor dele e marcou a ligação que faltava com um único pulso. “vum!”",
            "ja": "Xシグナルはもう脅威ではなく、未完成の分子のように見えた。Moxyはその周囲を回り、一度の脈動で欠けた結合を示した。 “vum!”"
          },
          "caption": {
            "tr": "Onu yok etmek değil, doğru bağlamak gerekiyor.",
            "en": "It must be bonded correctly, not destroyed.",
            "de": "Es muss richtig gebunden, nicht zerstört werden.",
            "es": "Hay que enlazarla correctamente, no destruirla.",
            "pt": "Ele precisa ser ligado corretamente, não destruído.",
            "ja": "壊すのではなく、正しく結合しなければならない。"
          },
          "cast": [
            "moxy"
          ],
          "shot": "detail",
          "img": "",
          "narration": {
            "tr": "X Sinyali artık bir tehdit gibi değil, tamamlanmamış bir molekül gibi görünüyordu. Moxy sinyalin çevresinde dönüp tek bir titreşimle eksik bağı işaretledi.",
            "en": "The X Signal no longer looked like a threat, but like an unfinished molecule. Moxy circled it and marked the missing bond with a single pulse.",
            "de": "Das X-Signal wirkte nicht mehr wie eine Bedrohung, sondern wie ein unfertiges Molekül. Moxy kreiste darum und markierte die fehlende Bindung mit einem einzelnen Impuls.",
            "es": "La Señal X ya no parecía una amenaza, sino una molécula sin terminar. Moxy giró a su alrededor y marcó el enlace que faltaba con un solo pulso.",
            "pt": "O Sinal X já não parecia uma ameaça, mas uma molécula incompleta. Moxy circulou ao redor dele e marcou a ligação que faltava com um único pulso.",
            "ja": "Xシグナルはもう脅威ではなく、未完成の分子のように見えた。Moxyはその周囲を回り、一度の脈動で欠けた結合を示した。"
          },
          "dialogue": {
            "tr": "vum!",
            "en": "vum!",
            "de": "vum!",
            "es": "¡vum!",
            "pt": "vum!",
            "ja": "vum!"
          }
        },
        {
          "speaker": "drE",
          "bang": "301.",
          "text": {
            "tr": "Dr. Null son deney numarasını ekrana yazdı. Dr. E elini konsola koyup oyuncuya döndü. “Son bağı sen kuracaksın.”",
            "en": "Dr. Null entered the final experiment number. Dr. E placed his hand on the console and turned to the player. “You will form the final bond.”",
            "de": "Dr. Null gab die Nummer des letzten Experiments ein. Dr. E legte die Hand auf das Bedienpult und wandte sich dem Spieler zu. “Du wirst die letzte Bindung bilden.”",
            "es": "Dr. Null introdujo el número del experimento final. Dr. E puso la mano sobre la consola y se volvió hacia el jugador. “Tú formarás el enlace final.”",
            "pt": "Dr. Null digitou o número do último experimento. Dr. E colocou a mão no console e se virou para o jogador. “Você vai formar a ligação final.”",
            "ja": "Dr. Nullが最後の実験番号を入力した。Dr. Eはコンソールに手を置き、プレイヤーを振り返った。 “最後の結合を作るのは君だ。”"
          },
          "caption": {
            "tr": "Nobel Finali hazır.",
            "en": "The Nobel Finale is ready.",
            "de": "Das Nobel-Finale ist bereit.",
            "es": "El Final Nobel está listo.",
            "pt": "O Final Nobel está pronto.",
            "ja": "ノーベル・フィナーレの準備が整った。"
          },
          "cast": [
            "drE",
            "null",
            "cat",
            "moxy"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Dr. Null son deney numarasını ekrana yazdı. Dr. E elini konsola koyup oyuncuya döndü.",
            "en": "Dr. Null entered the final experiment number. Dr. E placed his hand on the console and turned to the player.",
            "de": "Dr. Null gab die Nummer des letzten Experiments ein. Dr. E legte die Hand auf das Bedienpult und wandte sich dem Spieler zu.",
            "es": "Dr. Null introdujo el número del experimento final. Dr. E puso la mano sobre la consola y se volvió hacia el jugador.",
            "pt": "Dr. Null digitou o número do último experimento. Dr. E colocou a mão no console e se virou para o jogador.",
            "ja": "Dr. Nullが最後の実験番号を入力した。Dr. Eはコンソールに手を置き、プレイヤーを振り返った。"
          },
          "dialogue": {
            "tr": "Son bağı sen kuracaksın.",
            "en": "You will form the final bond.",
            "de": "Du wirst die letzte Bindung bilden.",
            "es": "Tú formarás el enlace final.",
            "pt": "Você vai formar a ligação final.",
            "ja": "最後の結合を作るのは君だ。"
          }
        }
      ]
    },
    {
      "id": "nobel-finale",
      "chapter": 21,
      "startLevel": 301,
      "unlockAfter": 301,
      "world": "orbital-station",
      "bang": "NOBEL!",
      "finale": true,
      "title": {
        "tr": "NOBEL FİNALİ",
        "en": "THE NOBEL FINALE",
        "de": "DAS NOBEL-FINALE",
        "es": "EL FINAL NOBEL",
        "pt": "O FINAL NOBEL",
        "ja": "ノーベル・フィナーレ"
      },
      "pages": [
        {
          "speaker": "moxy",
          "bang": "VUUUM!",
          "text": {
            "tr": "301. molekül tamamlanınca Moxy X Sinyalinin merkezine girdi. Kopan çizgiler tek tek yeniden bağlanırken gövdesinden yükselen titreşim bütün istasyonu doldurdu. “vuuum”",
            "en": "When Molecule 301 was complete, Moxy entered the heart of the X Signal. As broken lines reconnected one by one, a rising vibration from his body filled the station. “vuuum”",
            "de": "Als Molekül 301 fertig war, trat Moxy in das Herz des X-Signals. Während sich die unterbrochenen Linien nacheinander wieder verbanden, erfüllte eine ansteigende Schwingung aus seinem Körper die Station. “vuuum”",
            "es": "Cuando se completó la Molécula 301, Moxy entró en el corazón de la Señal X. Mientras las líneas rotas se reconectaban una a una, una vibración creciente de su cuerpo llenó la estación. “vuuum”",
            "pt": "Quando a Molécula 301 foi concluída, Moxy entrou no coração do Sinal X. Enquanto as linhas rompidas se reconectavam uma a uma, uma vibração crescente de seu corpo encheu a estação. “vuuum”",
            "ja": "分子301が完成すると、MoxyはXシグナルの中心へ入った。切れた線が一本ずつ再接続されるにつれ、彼の体から高まる振動がステーションを満たした。 “vuuum”"
          },
          "caption": {
            "tr": "Büyük Ayrışma durdu.",
            "en": "The Great Unbonding was stopped.",
            "de": "Die Große Entkopplung wurde gestoppt.",
            "es": "La Gran Desvinculación fue detenida.",
            "pt": "A Grande Separação foi interrompida.",
            "ja": "大解離は止められた。"
          },
          "cast": [
            "moxy",
            "drE",
            "null",
            "cat"
          ],
          "shot": "action",
          "img": "",
          "narration": {
            "tr": "301. molekül tamamlanınca Moxy X Sinyalinin merkezine girdi. Kopan çizgiler tek tek yeniden bağlanırken gövdesinden yükselen titreşim bütün istasyonu doldurdu.",
            "en": "When Molecule 301 was complete, Moxy entered the heart of the X Signal. As broken lines reconnected one by one, a rising vibration from his body filled the station.",
            "de": "Als Molekül 301 fertig war, trat Moxy in das Herz des X-Signals. Während sich die unterbrochenen Linien nacheinander wieder verbanden, erfüllte eine ansteigende Schwingung aus seinem Körper die Station.",
            "es": "Cuando se completó la Molécula 301, Moxy entró en el corazón de la Señal X. Mientras las líneas rotas se reconectaban una a una, una vibración creciente de su cuerpo llenó la estación.",
            "pt": "Quando a Molécula 301 foi concluída, Moxy entrou no coração do Sinal X. Enquanto as linhas rompidas se reconectavam uma a uma, uma vibração crescente de seu corpo encheu a estação.",
            "ja": "分子301が完成すると、MoxyはXシグナルの中心へ入った。切れた線が一本ずつ再接続されるにつれ、彼の体から高まる振動がステーションを満たした。"
          },
          "dialogue": {
            "tr": "vuuum",
            "en": "vuuum",
            "de": "vuuum",
            "es": "vuuum",
            "pt": "vuuum",
            "ja": "vuuum"
          }
        },
        {
          "speaker": "drE",
          "bang": "NOBEL!",
          "text": {
            "tr": "Nobel Komitesi Moleculox ekibinin çalışmasını ödüllendirdi. Dr. E madalyayı teslim alırken Dr. Null, Moxy ve kedi yanında durdu; sonuç oyuncunun kurduğu son bağla tamamlanmıştı. “Bu ödül tek bir dehanın değil; doğru bağı kuran herkesin.”",
            "en": "The Nobel Committee honored the Moleculox team’s work. Dr. E accepted the medal with Dr. Null, Moxy, and the cat beside him; the result had been completed by the player’s final bond. “This award does not belong to one genius; it belongs to everyone who formed the right bond.”",
            "de": "Das Nobelkomitee ehrte die Arbeit des Moleculox-Teams. Dr. E nahm die Medaille entgegen, während Dr. Null, Moxy und die Katze neben ihm standen; das Ergebnis war durch die letzte Bindung des Spielers vollendet worden. “Diese Auszeichnung gehört nicht einem einzigen Genie; sie gehört allen, die die richtige Bindung gebildet haben.”",
            "es": "El Comité Nobel reconoció el trabajo del equipo Moleculox. Dr. E recibió la medalla con Dr. Null, Moxy y el gato a su lado; el resultado se había completado gracias al enlace final del jugador. “Este premio no pertenece a un solo genio; pertenece a todos los que formaron el enlace correcto.”",
            "pt": "O Comitê Nobel homenageou o trabalho da equipe Moleculox. Dr. E recebeu a medalha com Dr. Null, Moxy e o gato ao seu lado; o resultado havia sido concluído pela ligação final do jogador. “Este prêmio não pertence a um único gênio; pertence a todos que formaram a ligação correta.”",
            "ja": "ノーベル委員会はMoleculoxチームの研究を称えた。Dr. EはDr. Null、Moxy、ネコと並んでメダルを受け取り、その成果はプレイヤーが作った最後の結合によって完成した。 “この賞は一人の天才のものではない。正しい結合を作ったすべての人のものだ。”"
          },
          "caption": {
            "tr": "Zafer bir kişiye değil, birlikte kurulan bağlara ait.",
            "en": "The victory belongs not to one person, but to the bonds formed together.",
            "de": "Der Sieg gehört nicht einer Person, sondern den Bindungen, die gemeinsam entstanden sind.",
            "es": "La victoria no pertenece a una sola persona, sino a los enlaces formados juntos.",
            "pt": "A vitória não pertence a uma única pessoa, mas às ligações formadas em conjunto.",
            "ja": "勝利は一人のものではない。共に作った結合のものだ。"
          },
          "cast": [
            "drE",
            "null",
            "moxy",
            "cat"
          ],
          "shot": "hero",
          "img": "assets/images/story-user/21-nobel-award.webp",
          "narration": {
            "tr": "Nobel Komitesi Moleculox ekibinin çalışmasını ödüllendirdi. Dr. E madalyayı teslim alırken Dr. Null, Moxy ve kedi yanında durdu; sonuç oyuncunun kurduğu son bağla tamamlanmıştı.",
            "en": "The Nobel Committee honored the Moleculox team’s work. Dr. E accepted the medal with Dr. Null, Moxy, and the cat beside him; the result had been completed by the player’s final bond.",
            "de": "Das Nobelkomitee ehrte die Arbeit des Moleculox-Teams. Dr. E nahm die Medaille entgegen, während Dr. Null, Moxy und die Katze neben ihm standen; das Ergebnis war durch die letzte Bindung des Spielers vollendet worden.",
            "es": "El Comité Nobel reconoció el trabajo del equipo Moleculox. Dr. E recibió la medalla con Dr. Null, Moxy y el gato a su lado; el resultado se había completado gracias al enlace final del jugador.",
            "pt": "O Comitê Nobel homenageou o trabalho da equipe Moleculox. Dr. E recebeu a medalha com Dr. Null, Moxy e o gato ao seu lado; o resultado havia sido concluído pela ligação final do jogador.",
            "ja": "ノーベル委員会はMoleculoxチームの研究を称えた。Dr. EはDr. Null、Moxy、ネコと並んでメダルを受け取り、その成果はプレイヤーが作った最後の結合によって完成した。"
          },
          "dialogue": {
            "tr": "Bu ödül tek bir dehanın değil; doğru bağı kuran herkesin.",
            "en": "This award does not belong to one genius; it belongs to everyone who formed the right bond.",
            "de": "Diese Auszeichnung gehört nicht einem einzigen Genie; sie gehört allen, die die richtige Bindung gebildet haben.",
            "es": "Este premio no pertenece a un solo genio; pertenece a todos los que formaron el enlace correcto.",
            "pt": "Este prêmio não pertence a um único gênio; pertence a todos que formaram a ligação correta.",
            "ja": "この賞は一人の天才のものではない。正しい結合を作ったすべての人のものだ。"
          }
        },
        {
          "speaker": "cat",
          "bang": "MIRR?",
          "text": {
            "tr": "Nobel’den sonra Dr. E ve Dr. Null laboratuvarı bu kez birlikte yürütmeye karar verdi. Moxy resmen ekibin saha yardımcısı oldu; kedi ise X rezonans sensörünün gönüllü bekçisi olarak kaldı. Kutlama biterken kolye yeniden parladı: çok daha uzaktan yeni bir X Sinyali geliyordu.",
            "en": "After the Nobel, Dr. E and Dr. Null decided to run the laboratory together this time. Moxy officially became the team’s field companion, while the cat remained the willing guardian of the X-resonance sensor. As the celebration ended, the pendant lit again: a new X Signal was arriving from much farther away.",
            "de": "Nach dem Nobel beschlossen Dr. E und Dr. Null, das Labor diesmal gemeinsam zu führen. Moxy wurde offiziell zum Feldbegleiter des Teams, während die Katze freiwillige Hüterin des X-Resonanzsensors blieb. Als die Feier endete, leuchtete der Anhänger erneut: Ein neues X-Signal kam aus viel größerer Entfernung.",
            "es": "Después del Nobel, Dr. E y Dr. Null decidieron dirigir juntos el laboratorio esta vez. Moxy se convirtió oficialmente en el compañero de campo del equipo, mientras el gato siguió siendo el guardián voluntario del sensor de resonancia X. Cuando terminó la celebración, el colgante volvió a brillar: llegaba una nueva Señal X desde mucho más lejos.",
            "pt": "Depois do Nobel, Dr. E e Dr. Null decidiram administrar o laboratório juntos desta vez. Moxy tornou-se oficialmente o companheiro de campo da equipe, enquanto o gato continuou como guardião voluntário do sensor de ressonância X. Quando a celebração terminou, o pingente voltou a brilhar: um novo Sinal X vinha de muito mais longe.",
            "ja": "ノーベル賞の後、Dr. EとDr. Nullは今度こそ研究所を二人で運営することを決めた。Moxyは正式にチームのフィールド・コンパニオンとなり、ネコはX共鳴センサーの自称守護役として残った。祝賀が終わるころ、ペンダントが再び光る。はるか遠くから、新たなXシグナルが届いていた。"
          },
          "caption": {
            "tr": "Bir hikâye tamamlandı. Yeni sinyal, bir sonraki keşfi çağırıyor.",
            "en": "One story is complete. A new signal calls the next discovery.",
            "de": "Eine Geschichte ist abgeschlossen. Ein neues Signal ruft zur nächsten Entdeckung.",
            "es": "Una historia ha terminado. Una nueva señal llama al próximo descubrimiento.",
            "pt": "Uma história terminou. Um novo sinal chama a próxima descoberta.",
            "ja": "ひとつの物語が完結した。新しいシグナルが、次の発見を呼んでいる。"
          },
          "cast": [
            "cat",
            "moxy"
          ],
          "shot": "close",
          "img": "",
          "narration": {
            "tr": "Nobel’den sonra Dr. E ve Dr. Null laboratuvarı bu kez birlikte yürütmeye karar verdi. Moxy resmen ekibin saha yardımcısı oldu; kedi ise X rezonans sensörünün gönüllü bekçisi olarak kaldı. Kutlama biterken kolye yeniden parladı: çok daha uzaktan yeni bir X Sinyali geliyordu.",
            "en": "After the Nobel, Dr. E and Dr. Null decided to run the laboratory together this time. Moxy officially became the team’s field companion, while the cat remained the willing guardian of the X-resonance sensor. As the celebration ended, the pendant lit again: a new X Signal was arriving from much farther away.",
            "de": "Nach dem Nobel beschlossen Dr. E und Dr. Null, das Labor diesmal gemeinsam zu führen. Moxy wurde offiziell zum Feldbegleiter des Teams, während die Katze freiwillige Hüterin des X-Resonanzsensors blieb. Als die Feier endete, leuchtete der Anhänger erneut: Ein neues X-Signal kam aus viel größerer Entfernung.",
            "es": "Después del Nobel, Dr. E y Dr. Null decidieron dirigir juntos el laboratorio esta vez. Moxy se convirtió oficialmente en el compañero de campo del equipo, mientras el gato siguió siendo el guardián voluntario del sensor de resonancia X. Cuando terminó la celebración, el colgante volvió a brillar: llegaba una nueva Señal X desde mucho más lejos.",
            "pt": "Depois do Nobel, Dr. E e Dr. Null decidiram administrar o laboratório juntos desta vez. Moxy tornou-se oficialmente o companheiro de campo da equipe, enquanto o gato continuou como guardião voluntário do sensor de ressonância X. Quando a celebração terminou, o pingente voltou a brilhar: um novo Sinal X vinha de muito mais longe.",
            "ja": "ノーベル賞の後、Dr. EとDr. Nullは今度こそ研究所を二人で運営することを決めた。Moxyは正式にチームのフィールド・コンパニオンとなり、ネコはX共鳴センサーの自称守護役として残った。祝賀が終わるころ、ペンダントが再び光る。はるか遠くから、新たなXシグナルが届いていた。"
          },
          "dialogue": {
            "tr": "",
            "en": "",
            "de": "",
            "es": "",
            "pt": "",
            "ja": ""
          }
        }
      ]
    }
  ]
};
  root.MX_STORY_UNIVERSE=universe;
  root.MX_STORY_WORLDS=universe.worlds;
  root.MX_STORY_EPISODES=universe.episodes;
})(typeof window!=='undefined'?window:globalThis);
