/* Talkletics curriculum - single source of truth for the journey hub, the game player and the curriculum document.
   Every media item is a PLACEHOLDER until a real file named by its `key` exists in Talkletics assets:
     audio  = transcript only        (the voice will say this)
     video  = icon + transcript      (a video where this is said; scene in `description`)
     image  = icon + description     (an image to generate; this is what it shows)
   Real files are looked up by `key` in /api/assets (asset name === key). */
(function (root) {
  var TK = { levels: [], version: 1 };

  var KINDS = {
    echo:     ["Répétez", "Repeat after me"],
    see:      ["Dites ce que vous voyez", "Say what you see"],
    answer:   ["Répondez", "Answer the question"],
    role:     ["Jeu de rôle", "Role-play"],
    describe: ["Décrivez", "Describe"],
    opinion:  ["Donnez votre avis", "Give your opinion"],
    story:    ["Racontez", "Tell a story"],
    debate:   ["Débattez", "Debate"],
    summary:  ["Résumez", "Summarise"],
    present:  ["Présentez", "Present"],
    mediate:  ["Négociez", "Negotiate"]
  };
  TK.kinds = KINDS;

  // ---- item builders ------------------------------------------------------
  // ref items: graded by pronunciation assessment against the expected text
  function E(fr, en, key) {                       // echo: hear it, say it
    return { mode: "ref", expected: fr, en: en, showText: true, key: key || null,
             media: { type: "audio", transcript: fr } };
  }
  function S(icon, desc, fr, en, key) {           // see: say what the picture shows
    return { mode: "ref", expected: fr, en: en, showText: false, key: key || null,
             voice: "Qu'est-ce que c'est ?",
             media: { type: "image", icon: icon, description: desc } };
  }
  // free items: graded on transcript (content + language) + fluency + clarity
  function free(media, voice, en, task, must, sample, min, max, key) {
    return { mode: "free", voice: voice, en: en, task: task, must: must, sample: sample,
             min: min || null, max: max || null, key: key || null, media: media, showText: false };
  }
  function A(say, en, task, must, sample, min, max) {        // audio question
    return free({ type: "audio", transcript: say }, say, en, task, must, sample, min, max);
  }
  function V(scene, say, en, task, must, sample, min, max) { // video line
    return free({ type: "video", icon: "🎬", transcript: say, description: scene }, say, en, task, must, sample, min, max);
  }
  function I(icon, desc, voice, en, task, must, sample, min, max) { // image + guide question
    return free({ type: "image", icon: icon, description: desc }, voice, en, task, must, sample, min, max);
  }
  root.TK_BUILD = { E: E, S: S, A: A, V: V, I: I };

  // ---- level registration -------------------------------------------------
  function LEVEL(d) {
    d.order = TK.levels.length + 1;
    var n = 0;
    function prep(g, gid, isGrad) {
      g.id = gid; g.level = d.id; g.isGraduation = !!isGrad;
      g.kindLabel = KINDS[g.kind] || KINDS.answer;
      g.items.forEach(function (it, i) {
        it.id = gid + "-" + (i + 1);
        it.key = it.key || it.id;
        it.media.key = it.key;
        if (it.mode === "free") {
          it.min = it.min || d.defMin;
          it.max = Math.min(it.max || d.defMax, 55);   // Azure short-audio limit is 60 s
        }
      });
      g.passMark = isGrad ? d.gradPass : d.pass;
    }
    d.games.forEach(function (g, i) { prep(g, d.id.toLowerCase() + "g" + (i + 1), false); g.index = i + 1; });
    prep(d.graduation, d.id.toLowerCase() + "grad", true);
    d.graduation.index = d.games.length + 1;
    TK.levels.push(d);
  }
  root.TK_LEVEL = LEVEL;

  // ---- lookups ------------------------------------------------------------
  TK.allGames = function () {
    var out = [];
    TK.levels.forEach(function (l) { l.games.forEach(function (g) { out.push(g); }); out.push(l.graduation); });
    return out;
  };
  TK.game = function (id) { return TK.allGames().filter(function (g) { return g.id === id; })[0] || null; };
  TK.level = function (id) { return TK.levels.filter(function (l) { return l.id === id; })[0] || null; };
  root.TK_CURRICULUM = TK;
})(typeof window !== "undefined" ? window : globalThis);
(function(){ var B = TK_BUILD, E = B.E, S = B.S, A = B.A, V = B.V, I = B.I;
TK_LEVEL({
  id: "A0", cefr: "Pre-A1 (A0)", place: "Ma Maison", placeEn: "My House",
  tagline: "Premiers mots - First words",
  sceneImage: { icon: "🏠", description: "A warm, welcoming French family home seen from the front garden, door open, late-afternoon light" },
  summary: "The learner uses isolated words, familiar names and very short set phrases, with lots of repetition and visual support.",
  canDo: [
    "Greet people and say goodbye politely",
    "Say their name and ask someone's name",
    "Name everyday objects and rooms in the home",
    "Name close family members and answer a yes/no question about them"
  ],
  focus: "Greetings, name, how are you, home vocabulary, family (ma/mon), oui/non, j'ai / je m'appelle",
  pass: 55, leniency: 12, gradPass: 60, defMin: 1, defMax: 8,
  graduationMeans: "You can greet a neighbour, say who you are, say where you live and whether you have children, and say goodbye, using short phrases, even if you need slow speech and repetition.",
  games: [
    { title: "Salutations", titleEn: "Greetings", kind: "echo", focus: "Greetings and thanks, set phrases", items: [
      E("Bonjour", "Hello", "mission1-item1"),
      E("Salut", "Hi", "mission1-item2"),
      E("Merci", "Thanks", "mission1-item3"),
      E("Bonsoir", "Good evening", "mission1-item4"),
      E("Pardon", "Excuse me", "mission1-item5"),
      E("Comment ça va ?", "How are you?", "mission1-item6"),
      E("Très bien, merci", "Very well, thanks", "mission1-item7"),
      E("À bientôt", "See you soon", "mission1-item8")
    ]},
    { title: "Je me présente", titleEn: "Introducing myself", kind: "echo", focus: "Name, first answers to questions", items: [
      E("Enchanté", "Nice to meet you", "mission1-item9"),
      E("Je m'appelle Marie", "My name is Marie", "mission1-item10"),
      E("Comment vous appelez-vous ?", "What is your name?", "mission1-item11"),
      E("Bonjour, comment allez-vous aujourd'hui ?", "Hello, how are you today?", "mission1-item12"),
      A("Comment vous appelez-vous ?", "What is your name?", "Say your name in a short sentence.",
        ["je m'appelle + a first name", "or: moi, c'est + a first name"], "Je m'appelle Marie.", 1, 8),
      A("Comment allez-vous ?", "How are you?", "Say how you are.",
        ["ça va / très bien / pas mal / comme ci, comme ça"], "Très bien, merci.", 1, 8)
    ]},
    { title: "Dans la maison", titleEn: "In the house", kind: "see", focus: "Rooms and furniture with le / la", items: [
      S("🪑", "A wooden kitchen chair against a white wall", "la chaise", "the chair"),
      S("🛏️", "A neatly made bed with a blue blanket", "le lit", "the bed"),
      S("🚪", "A front door painted green", "la porte", "the door"),
      S("🪟", "A bright window with white curtains", "la fenêtre", "the window"),
      S("🛋️", "A grey sofa in a living room", "le canapé", "the sofa"),
      S("🍳", "A small kitchen with a frying pan on the stove", "la cuisine", "the kitchen"),
      S("🚿", "A bathroom with a shower", "la salle de bains", "the bathroom")
    ]},
    { title: "Ma famille", titleEn: "My family", kind: "see", focus: "Family words with ma / mon, yes/no answers", items: [
      S("👩", "A smiling mother holding a cup of tea", "ma mère", "my mother"),
      S("👨", "A father in a kitchen apron", "mon père", "my father"),
      S("👦", "A ten-year-old boy holding a football", "mon frère", "my brother"),
      S("👧", "A seven-year-old girl drawing at a table", "ma sœur", "my sister"),
      S("👵", "A grandmother knitting in an armchair", "ma grand-mère", "my grandmother"),
      A("Vous avez des frères et sœurs ?", "Do you have brothers and sisters?", "Answer yes or no, and say how many if yes.",
        ["oui / non", "j'ai un frère / une sœur / deux ... or je n'ai pas de ..."], "Oui, j'ai un frère et une sœur.", 1, 10),
      A("Comment s'appelle votre mère ?", "What is your mother's name?", "Say your mother's first name in a full sentence.",
        ["ma mère s'appelle + first name"], "Ma mère s'appelle Claire.", 1, 8)
    ]}
  ],
  graduation: { title: "Bienvenue chez moi", titleEn: "Welcome to my home", kind: "role",
    focus: "A first real conversation with a neighbour", items: [
      V("Claire, a friendly neighbour, stands at your open front door holding a small plant", "Bonjour ! Je suis votre voisine. Je m'appelle Claire. Et vous ?",
        "Hello! I'm your neighbour. My name is Claire. And you?", "Greet her and say your name.",
        ["bonjour", "je m'appelle / moi, c'est + first name"], "Bonjour Claire ! Je m'appelle Marie.", 2, 8),
      V("Claire smiles and shakes your hand", "Enchantée ! Vous habitez ici ?", "Nice to meet you! Do you live here?",
        "Say that you live here.", ["oui", "j'habite ici"], "Oui, j'habite ici.", 1, 8),
      V("Claire points to a small girl beside her", "Voici ma fille. Vous avez des enfants ?", "This is my daughter. Do you have children?",
        "Say whether you have children and how many.", ["oui / non", "j'ai un / deux ... or je n'ai pas d'enfants"], "Oui, j'ai deux enfants.", 1, 10),
      V("Claire holds out the plant", "Voulez-vous un café ?", "Would you like a coffee?",
        "Accept or refuse politely.", ["oui, merci / non, merci", "s'il vous plaît / merci"], "Oui, merci. Avec plaisir !", 1, 8),
      V("Claire waves from the doorway", "Bon, au revoir et à bientôt !", "Well, goodbye and see you soon!",
        "Say goodbye politely.", ["au revoir", "à bientôt / merci"], "Au revoir, Claire. À bientôt !", 1, 8)
    ]}
});
})();
(function(){ var B = TK_BUILD, E = B.E, S = B.S, A = B.A, V = B.V, I = B.I;
function price(n, fr) { return S("🏷️", "A price tag in a shop window showing " + n, fr, n); }
TK_LEVEL({
  id: "A1", cefr: "A1", place: "La Pêche d'Or", placeEn: "The Golden Peach (café and grocery)",
  tagline: "Commander, compter, parler de soi - Order, count, talk about yourself",
  sceneImage: { icon: "🍑", description: "A sunny corner café-grocery with a peach-coloured awning, tables outside, a chalkboard menu" },
  summary: "The learner interacts in a simple way with slow, clear speech, using familiar everyday expressions and basic sentences about needs, likes and daily routine.",
  canDo: [
    "Count and say prices",
    "Name common food and drinks",
    "Order something politely and pay",
    "Say what they like and don't like",
    "Describe a simple daily routine with times"
  ],
  focus: "Numbers and prices, food and drink, je voudrais / je prends, j'aime / je n'aime pas, present tense of everyday verbs, telling the time",
  pass: 60, leniency: 8, gradPass: 65, defMin: 2, defMax: 12,
  graduationMeans: "You can walk into a café, get a table, order food and drink, say what you like, and pay, using simple sentences. The other person may need to speak slowly.",
  games: [
    { title: "Les nombres et les prix", titleEn: "Numbers and prices", kind: "see", focus: "Numbers 3 to 50, euros", items: [
      price("5 €", "cinq euros"), price("12 €", "douze euros"), price("15 €", "quinze euros"),
      price("20 €", "vingt euros"), price("30 €", "trente euros"), price("3,50 €", "trois euros cinquante"),
      price("50 €", "cinquante euros")
    ]},
    { title: "Boissons et gourmandises", titleEn: "Drinks and treats", kind: "see", focus: "Food and drink with un / une / de l'", items: [
      S("☕", "A steaming cup of coffee on a saucer", "un café", "a coffee"),
      S("🍵", "A glass cup of mint tea", "un thé", "a tea"),
      S("💧", "A glass bottle of water", "de l'eau", "some water"),
      S("🧃", "A glass of orange juice with ice", "un jus d'orange", "an orange juice"),
      S("🥐", "A golden croissant on a plate", "un croissant", "a croissant"),
      S("🥪", "A baguette sandwich with ham and cheese", "un sandwich", "a sandwich"),
      S("🍰", "A slice of apple tart", "une tarte aux pommes", "an apple tart")
    ]},
    { title: "Je voudrais...", titleEn: "I would like...", kind: "role", focus: "Ordering politely, paying", items: [
      E("Je voudrais un café, s'il vous plaît.", "I would like a coffee, please."),
      E("Un croissant et un jus d'orange, s'il vous plaît.", "A croissant and an orange juice, please."),
      E("C'est combien ?", "How much is it?"),
      A("Bonjour ! Qu'est-ce que vous désirez ?", "Hello! What would you like?", "Order a drink or something to eat, politely.",
        ["je voudrais / je prends", "a drink or food item", "s'il vous plaît"], "Je voudrais un café, s'il vous plaît.", 2, 10),
      A("Et avec ça ?", "Anything with that?", "Add something, or say that is all.",
        ["a food item, or c'est tout / ce sera tout"], "Un croissant, s'il vous plaît.", 2, 10),
      A("Sur place ou à emporter ?", "Eat in or take away?", "Say which you prefer.",
        ["sur place / à emporter"], "À emporter, s'il vous plaît.", 1, 8),
      A("Ça fait six euros cinquante.", "That's six euros fifty.", "Hand over the money and thank the waiter.",
        ["voilà", "merci"], "Voilà. Merci beaucoup !", 2, 8)
    ]},
    { title: "J'aime, je n'aime pas", titleEn: "Likes and dislikes", kind: "answer", focus: "j'aime / je n'aime pas / je préfère", items: [
      A("Vous aimez le café ?", "Do you like coffee?", "Say whether you like coffee.", ["j'aime / je n'aime pas", "le café"], "Oui, j'aime le café.", 2, 10),
      A("Qu'est-ce que vous mangez le matin ?", "What do you eat in the morning?", "Say what you eat in the morning.", ["je mange / je prends", "a food"], "Le matin, je mange du pain.", 2, 10),
      A("Quelle est votre boisson préférée ?", "What is your favourite drink?", "Say your favourite drink.", ["ma boisson préférée, c'est ... or j'aime ..."], "Ma boisson préférée, c'est le thé.", 2, 10),
      A("Vous aimez le chocolat ?", "Do you like chocolate?", "Say whether you like chocolate.", ["j'aime / j'adore / je n'aime pas", "le chocolat"], "Oui, j'adore le chocolat !", 2, 10),
      A("Quel fruit aimez-vous ?", "Which fruit do you like?", "Name a fruit you like.", ["j'aime + fruit (plural: les mangues)"], "J'aime les mangues.", 2, 10),
      A("Vous aimez la musique ?", "Do you like music?", "Say whether you like music.", ["j'aime / j'adore / je n'aime pas", "la musique"], "Oui, j'aime beaucoup la musique.", 2, 10),
      A("Quelle est votre couleur préférée ?", "What is your favourite colour?", "Say your favourite colour.", ["ma couleur préférée, c'est ... + a colour"], "Ma couleur préférée, c'est le bleu.", 2, 10)
    ]},
    { title: "Ma journée", titleEn: "My day", kind: "describe", focus: "Daily routine, present tense, times", items: [
      I("⏰", "A man sitting up in bed as an alarm clock shows 7:00", "Que fait Paul à sept heures ?", "What does Paul do at seven o'clock?",
        "Say what Paul does at 7:00.", ["il se lève / il se réveille", "sept heures"], "Il se lève à sept heures.", 2, 10),
      I("🥣", "A man eating breakfast at a kitchen table, clock showing 7:30", "Et à sept heures et demie ?", "And at half past seven?",
        "Say what Paul does at 7:30.", ["il mange / il prend le petit-déjeuner"], "Il prend le petit-déjeuner.", 2, 10),
      I("🚌", "A man waiting at a bus stop, clock showing 8:15", "Que fait-il à huit heures et quart ?", "What does he do at a quarter past eight?",
        "Say what Paul does at 8:15.", ["il prend le bus / il attend le bus"], "Il prend le bus.", 2, 10),
      I("💼", "A man typing at an office desk, clock showing 9:00", "Et à neuf heures ?", "And at nine?",
        "Say what Paul does at 9:00.", ["il travaille"], "Il travaille au bureau.", 2, 10),
      I("🍽️", "A man eating lunch in a canteen, clock showing 12:30", "Que fait-il à midi et demi ?", "What does he do at half past twelve?",
        "Say what Paul does at 12:30.", ["il mange / il déjeune"], "Il déjeune à midi et demi.", 2, 10),
      I("🌙", "A man asleep in bed, a moon at the window, clock showing 22:00", "Et à dix heures du soir ?", "And at ten in the evening?",
        "Say what Paul does at 22:00.", ["il dort"], "Il dort.", 2, 10)
    ]}
  ],
  graduation: { title: "Le client du jour", titleEn: "Customer of the day", kind: "role",
    focus: "A full café visit from arrival to payment", items: [
      A("Bonjour, bienvenue à La Pêche d'Or ! Une table pour combien de personnes ?", "Hello, welcome to La Pêche d'Or! A table for how many people?",
        "Say how many people the table is for.", ["pour + number + personnes", "s'il vous plaît"], "Pour deux personnes, s'il vous plaît.", 2, 10),
      A("Voici la carte. Qu'est-ce que vous prenez comme boisson ?", "Here is the menu. What will you have to drink?",
        "Order a drink.", ["je voudrais / je prends", "a drink"], "Je voudrais un jus d'orange, s'il vous plaît.", 2, 10),
      A("Et pour manger ?", "And to eat?", "Order something to eat.", ["je voudrais / je prends", "a food item"], "Je prends un sandwich, s'il vous plaît.", 2, 10),
      A("Vous aimez les fruits ? Nous avons une tarte aux pêches.", "Do you like fruit? We have a peach tart.",
        "Say whether you like fruit and whether you want the tart.", ["j'aime / je n'aime pas", "oui / non, merci"], "Oui, j'aime les fruits. Je prends la tarte.", 3, 12),
      A("Très bien. Vous voulez autre chose ?", "Very good. Would you like anything else?", "Say no thank you, or ask for something else.",
        ["non, merci / c'est tout / a request"], "Non, merci, c'est tout.", 2, 8),
      A("Ça fait douze euros. Bonne journée !", "That's twelve euros. Have a good day!", "Pay, thank them and say goodbye.",
        ["voilà", "merci", "au revoir / bonne journée"], "Voilà. Merci, bonne journée !", 2, 10)
    ]}
});
})();
(function(){ var B = TK_BUILD, E = B.E, S = B.S, A = B.A, V = B.V, I = B.I;
TK_LEVEL({
  id: "A2", cefr: "A2", place: "Le Restaurant", placeEn: "The Restaurant",
  tagline: "Réserver, commander, raconter hier - Book, order, talk about last night",
  sceneImage: { icon: "🍽️", description: "A cosy French bistro in the evening: warm lamps, checked tablecloths, a waiter carrying plates" },
  summary: "The learner handles simple, routine exchanges and describes things and past events in a series of short sentences.",
  canDo: [
    "Book a table by phone and give the details",
    "Order a full meal and react to what the waiter asks",
    "Say what they prefer and why, using parce que",
    "Say what happened yesterday in the passé composé",
    "Politely report a problem and ask for a fix"
  ],
  focus: "Booking, ordering, preferences with parce que, passé composé (avoir / être), polite requests (pourriez-vous...)",
  pass: 63, leniency: 5, gradPass: 68, defMin: 4, defMax: 20,
  graduationMeans: "You can book, order, solve a small problem and pay in a restaurant, and tell someone what you ate last night, using short connected sentences with only occasional hesitation.",
  games: [
    { title: "Réserver une table", titleEn: "Booking a table", kind: "role", focus: "Phone booking: number, day, time, name", items: [
      A("Restaurant Le Lys, bonjour !", "Le Lys restaurant, hello!", "Greet them and say you want to book a table.",
        ["bonjour", "je voudrais réserver une table"], "Bonjour, je voudrais réserver une table, s'il vous plaît.", 3, 10),
      A("Pour combien de personnes ?", "For how many people?", "Say how many people.", ["pour + number + personnes"], "Pour quatre personnes.", 2, 8),
      A("Pour quel jour ?", "For which day?", "Say the day.", ["a day (samedi / demain / vendredi soir)"], "Pour samedi soir, s'il vous plaît.", 2, 8),
      A("À quelle heure ?", "At what time?", "Say the time.", ["à + time (vingt heures / huit heures)"], "À vingt heures, s'il vous plaît.", 2, 8),
      A("À quel nom, s'il vous plaît ?", "Under what name, please?", "Give a name for the booking.", ["au nom de / c'est + name"], "Au nom de Marie Dupont.", 2, 8),
      A("C'est noté. Vous avez une allergie ou une demande spéciale ?", "Noted. Do you have an allergy or a special request?",
        "Answer: no, or mention one allergy or request.", ["non / oui", "allergie / végétarien / chaise haute ..."], "Non, merci. Mais je suis végétarienne.", 3, 12)
    ]},
    { title: "Lire la carte", titleEn: "Reading the menu", kind: "see", focus: "Dishes with du / de la / des, longer noun phrases", items: [
      S("🍗", "Roast chicken with golden fries on a white plate", "du poulet rôti avec des frites", "roast chicken with fries"),
      S("🍲", "A bowl of steaming vegetable soup", "une soupe de légumes", "a vegetable soup"),
      S("🥩", "A grilled steak with green beans", "un steak avec des haricots verts", "a steak with green beans"),
      S("🥗", "A colourful mixed salad with tomatoes and cucumber", "une salade composée", "a mixed salad"),
      S("🐟", "A grilled fish with lemon and rice", "du poisson grillé avec du riz", "grilled fish with rice"),
      S("🥧", "A golden apple tart with a scoop of ice cream", "une tarte aux pommes avec une boule de glace", "an apple tart with a scoop of ice cream")
    ]},
    { title: "Passer commande", titleEn: "Placing your order", kind: "role", focus: "Choosing, reacting to the waiter, paying", items: [
      A("Vous avez choisi ?", "Have you decided?", "Order a starter and a main course.",
        ["comme entrée / comme plat", "je prends / je voudrais"], "Oui, comme entrée je prends la soupe et comme plat, le poulet.", 4, 14),
      A("Qu'est-ce que vous voulez boire ?", "What would you like to drink?", "Order a drink.", ["je voudrais / je prends", "a drink"], "De l'eau, s'il vous plaît.", 2, 8),
      A("Comment voulez-vous votre steak : saignant, à point ou bien cuit ?", "How would you like your steak: rare, medium or well done?",
        "Say how you want the steak.", ["saignant / à point / bien cuit"], "À point, s'il vous plaît.", 2, 8),
      A("Désolé, il n'y a plus de poisson. Vous prenez autre chose ?", "Sorry, there's no more fish. Would you like something else?",
        "Choose another dish.", ["je vais prendre / alors / a dish"], "Pas de problème, alors je prends le steak.", 3, 12),
      A("Vous prenez un dessert ?", "Would you like a dessert?", "Order a dessert, or politely say no.", ["oui, ... / non, merci"], "Oui, une glace à la vanille, s'il vous plaît.", 2, 10),
      A("Voilà l'addition. Vous payez par carte ou en espèces ?", "Here is the bill. Will you pay by card or cash?",
        "Say how you will pay.", ["par carte / en espèces"], "Par carte, s'il vous plaît.", 2, 8)
    ]},
    { title: "Goûts et préférences", titleEn: "Tastes and preferences", kind: "opinion", focus: "Preferring and giving a reason with parce que", items: [
      A("Vous préférez la viande ou le poisson ? Pourquoi ?", "Do you prefer meat or fish? Why?", "Choose one and give a reason.",
        ["je préfère ...", "parce que + reason"], "Je préfère le poisson parce que c'est léger.", 5, 15),
      A("Quel est votre plat préféré ? Décrivez-le.", "What is your favourite dish? Describe it.", "Name the dish and say what is in it.",
        ["le plat s'appelle / c'est ...", "ingredients with du / de la / des"], "Mon plat préféré, c'est le riz au poulet. Il y a du riz, du poulet et des légumes.", 6, 18),
      A("Qu'est-ce que vous n'aimez pas manger ? Pourquoi ?", "What don't you like eating? Why?", "Name a food you dislike and why.",
        ["je n'aime pas ...", "parce que + reason"], "Je n'aime pas le poisson parce que l'odeur est trop forte.", 5, 15),
      A("Vous mangez souvent au restaurant ?", "Do you often eat at a restaurant?", "Say how often you eat out.",
        ["souvent / rarement / une fois par mois ..."], "Non, j'y vais rarement, une fois par mois.", 4, 12),
      A("Vous cuisinez ? Qu'est-ce que vous préparez le plus souvent ?", "Do you cook? What do you make most often?",
        "Say what you cook most often.", ["je cuisine / je prépare ...", "a dish"], "Oui, je cuisine tous les jours. Je prépare souvent du riz.", 5, 18),
      A("Quel repas est le plus important pour vous : le petit-déjeuner, le déjeuner ou le dîner ?", "Which meal matters most to you?",
        "Choose a meal and say why.", ["a meal", "parce que + reason"], "Pour moi, c'est le petit-déjeuner, parce que j'ai besoin d'énergie.", 6, 18)
    ]},
    { title: "Hier soir", titleEn: "Last night", kind: "describe", focus: "Passé composé with avoir and être", items: [
      I("🍽️", "Marie sitting at a restaurant table with a pizza in front of her", "Qu'est-ce que Marie a fait hier soir ?", "What did Marie do last night?",
        "Say what Marie ate, in the past.", ["elle a mangé", "une pizza"], "Elle a mangé une pizza.", 3, 12),
      I("📞", "Marie on the phone with a notebook open", "Et avant, qu'est-ce qu'elle a fait ?", "And before that, what did she do?",
        "Say that she booked a table.", ["elle a réservé", "une table"], "Elle a réservé une table.", 3, 12),
      I("🥂", "Two friends clinking glasses of orange juice", "Qu'est-ce que Marie et son ami ont bu ?", "What did Marie and her friend drink?",
        "Say what they drank, in the past.", ["ils ont bu / elle a bu", "du jus"], "Ils ont bu du jus d'orange.", 3, 12),
      I("🧾", "Marie paying the bill with a card", "Et à la fin du repas ?", "And at the end of the meal?",
        "Say that she paid.", ["elle a payé", "l'addition"], "Elle a payé l'addition.", 3, 12),
      I("🚕", "Marie getting into a taxi at night", "Comment est-elle rentrée ?", "How did she get home?",
        "Say that she went home by taxi.", ["elle est rentrée / elle a pris", "en taxi / un taxi"], "Elle est rentrée en taxi.", 3, 12),
      I("😴", "Marie asleep in bed, smiling", "Et ensuite ?", "And then?",
        "Say what happened last, using the past.", ["elle s'est couchée / elle est allée au lit / elle a dormi"], "Elle s'est couchée très tard.", 3, 12)
    ]},
    { title: "Un petit problème", titleEn: "A small problem", kind: "role", focus: "Polite complaints and requests", items: [
      V("Your vegetable soup arrives cold; the waiter walks past", "Tout se passe bien ?", "Is everything all right?",
        "Politely say the soup is cold.", ["excusez-moi", "la soupe est froide"], "Excusez-moi, la soupe est froide.", 4, 12),
      V("The waiter puts a fish dish in front of you, but you ordered chicken", "Voilà votre plat !", "Here is your dish!",
        "Say that this is not what you ordered.", ["ce n'est pas ce que j'ai commandé", "j'ai commandé le poulet"], "Pardon, ce n'est pas ce que j'ai commandé. J'ai commandé le poulet.", 5, 15),
      V("There is no fork on your table", "Il vous manque quelque chose ?", "Is anything missing?",
        "Ask for a fork politely.", ["pourriez-vous / pouvez-vous", "une fourchette", "s'il vous plaît"], "Pourriez-vous m'apporter une fourchette, s'il vous plaît ?", 4, 12),
      V("The music is very loud and you cannot talk", "Tout est bon pour vous ?", "Is everything good for you?",
        "Ask politely for quieter music.", ["pourriez-vous / est-ce possible", "baisser la musique"], "Excusez-moi, est-ce que vous pourriez baisser la musique, s'il vous plaît ?", 5, 15),
      V("The bill shows a dessert you did not have", "Voici l'addition.", "Here is the bill.",
        "Point out the mistake.", ["il y a une erreur", "je n'ai pas pris de dessert"], "Il y a une erreur : je n'ai pas pris de dessert.", 5, 15),
      V("The manager comes to your table, smiling", "Je suis désolé pour le désagrément. Je vous offre un café.", "I'm sorry for the trouble. A coffee is on us.",
        "Accept and thank them.", ["merci", "c'est gentil / avec plaisir"], "C'est très gentil, merci beaucoup !", 3, 10)
    ]}
  ],
  graduation: { title: "Soirée au Restaurant", titleEn: "An evening at the restaurant", kind: "role",
    focus: "Book, order, solve a problem, pay", items: [
      V("You arrive at Le Lys; the host holds the reservation book", "Bonsoir ! Vous avez réservé ?", "Good evening! Do you have a booking?",
        "Say you booked, for how many, under which name.", ["oui, j'ai réservé", "pour + number", "au nom de + name"], "Oui, j'ai réservé une table pour deux personnes au nom de Marie Dupont.", 5, 15),
      V("The waiter hands you the menu", "Voici la carte. Vous avez choisi ?", "Here is the menu. Have you decided?",
        "Order a starter and a main course.", ["comme entrée", "comme plat"], "Oui, comme entrée je voudrais la soupe et comme plat, le poulet avec des frites.", 5, 18),
      V("The waiter writes down your order", "Excellent choix. Et comme boisson ?", "Excellent choice. And to drink?",
        "Order a drink and ask for something extra (bread or water).", ["je voudrais", "a drink", "un extra"], "De l'eau, s'il vous plaît, et un peu de pain.", 4, 12),
      V("Your plate arrives; the food is lukewarm", "Je vois que vous ne mangez pas. Il y a un problème ?", "I see you're not eating. Is there a problem?",
        "Politely explain the problem.", ["excusez-moi / pardon", "le plat est froid / pas assez chaud"], "Excusez-moi, le plat est un peu froid.", 5, 15),
      V("The waiter apologises and brings a new plate", "Votre repas était comment ?", "How was your meal?",
        "Give an opinion with a reason.", ["c'était + adjective", "parce que + reason"], "C'était très bon parce que le poulet était bien cuit.", 6, 18),
      V("The waiter places the bill on the table", "Voici l'addition. À bientôt peut-être ?", "Here is the bill. See you soon, perhaps?",
        "Pay, and say whether you will come back and why.", ["je paie par carte / voilà", "je reviendrai / je vais revenir", "parce que"], "Par carte, s'il vous plaît. Oui, je vais revenir parce que le service est très gentil.", 6, 18)
    ]}
});
})();
(function(){ var B = TK_BUILD, E = B.E, S = B.S, A = B.A, V = B.V, I = B.I;
function route(desc, voice, en, sample, must) { return I("🗺️", desc, voice, en, "Give clear directions.", must, sample, 12, 35); }
TK_LEVEL({
  id: "B1", cefr: "B1", place: "La Gare et l'Hôtel", placeEn: "The Station and the Hotel",
  tagline: "Voyager, raconter, donner son avis - Travel, narrate, give opinions",
  sceneImage: { icon: "🚉", description: "A grand French railway station at golden hour, travellers with suitcases, the hotel sign visible across the square" },
  summary: "The learner copes with most travel situations, enters conversations on familiar topics without preparation, and links sentences to describe experiences, plans and opinions.",
  canDo: [
    "Buy tickets and handle changes or delays",
    "Give and follow directions",
    "Check in at a hotel and solve problems",
    "Narrate a past trip (passé composé and imparfait)",
    "Talk about plans, hopes and dreams (futur, conditionnel)",
    "Give an opinion and support it with two reasons"
  ],
  focus: "Past narration, future and conditional, directions, connectors (d'abord, ensuite, mais, parce que, donc), polite requests and complaints",
  pass: 66, leniency: 3, gradPass: 71, defMin: 15, defMax: 40,
  graduationMeans: "You can deal with a travel disaster in French: explain what happened, propose and justify a solution, tell a related story and give advice, speaking for 30 to 40 seconds at a time with some hesitation but clear organisation.",
  games: [
    { title: "Acheter un billet", titleEn: "Buying a ticket", kind: "role", focus: "Ticket desk exchanges", items: [
      A("Bonjour, je peux vous aider ?", "Hello, can I help you?", "Ask for a ticket to Lyon for tomorrow.",
        ["je voudrais un billet", "pour Lyon", "demain"], "Bonjour, je voudrais un billet pour Lyon pour demain, s'il vous plaît.", 5, 15),
      A("Aller simple ou aller-retour ?", "One way or return?", "Choose, and say when you want to come back if return.",
        ["aller simple / aller-retour", "a date or time"], "Un aller-retour, s'il vous plaît. Je reviens dimanche soir.", 5, 15),
      A("Vous voulez partir le matin ou plus tard dans la journée ?", "Do you want to leave in the morning or later?", "Say when you prefer to leave and why.",
        ["le matin / l'après-midi", "parce que / car + reason"], "Plutôt le matin, parce que j'ai un rendez-vous à midi.", 6, 18),
      A("Le train de neuf heures quarante est complet. Il y a un autre à onze heures. Ça vous convient ?", "The 9:40 train is full. There is another at 11. Does that suit you?",
        "React, and ask the price and the platform.", ["ça me convient / d'accord", "c'est combien", "quel quai"], "D'accord, ça me convient. C'est combien, et de quel quai part-il ?", 6, 20),
      A("Ça fait quarante-deux euros. Vous avez une carte de réduction ?", "That's forty-two euros. Do you have a discount card?", "Answer about the card and pay.",
        ["oui / non, je n'ai pas de carte", "je paie par carte / voilà"], "Non, je n'ai pas de carte de réduction. Je paie par carte.", 5, 15),
      A("Attention, le train a trente minutes de retard.", "Attention, the train is thirty minutes late.", "React and say what you will do, given you have a connection.",
        ["c'est dommage / zut", "je vais / je dois + action", "correspondance"], "Oh non, j'ai une correspondance à Lyon. Je vais demander au contrôleur si je peux prendre le train suivant.", 8, 25)
    ]},
    { title: "Itinéraires", titleEn: "Giving directions", kind: "describe", focus: "Directions and place prepositions", items: [
      route("A simple street map: the station at the bottom, a straight road north, the Hôtel du Parc on the right just after a pharmacy",
        "Un touriste vous demande : « Pardon, pour aller à l'Hôtel du Parc ? ». Expliquez-lui le chemin.", "A tourist asks how to get to the Hôtel du Parc. Explain the way.",
        "Sortez de la gare et allez tout droit. Après la pharmacie, tournez à droite : l'hôtel est juste là.", ["tout droit / continuez", "à droite / à gauche", "la pharmacie"]),
      route("A map: from the hotel, cross the bridge over the river, then take the second street on the left; the post office is on the corner",
        "Comment aller à la poste, s'il vous plaît ?", "How do I get to the post office, please?",
        "Traversez le pont, puis prenez la deuxième rue à gauche. La poste est au coin.", ["traversez le pont", "deuxième rue", "à gauche"]),
      route("A map: a roundabout, take the third exit, the museum is in front of a green park",
        "Je cherche le musée. C'est loin ?", "I'm looking for the museum. Is it far?",
        "Allez jusqu'au rond-point et prenez la troisième sortie. Le musée est en face du parc, c'est à dix minutes à pied.", ["rond-point", "troisième sortie", "en face du parc"]),
      route("A map: from the hotel turn left to the traffic lights, turn right, the pharmacy is next to the bakery",
        "Il y a une pharmacie près d'ici ?", "Is there a pharmacy near here?",
        "Oui, tournez à gauche jusqu'aux feux, puis à droite. La pharmacie est à côté de la boulangerie.", ["à gauche", "aux feux", "à côté de la boulangerie"]),
      route("A tram line map: take line 2 for four stops, get off at Place Bellecour, walk 200 metres to the market",
        "Comment aller au marché en transports ?", "How do I get to the market by public transport?",
        "Prenez le tram numéro 2 pendant quatre arrêts, descendez à Place Bellecour, puis marchez deux cents mètres.", ["tram 2", "quatre arrêts", "descendez à"]),
      I("📍", "A phone map with a blue dot far from any landmark; the caller is lost", "Un ami perdu vous appelle : « Je ne vois plus la gare, je suis perdu ! ». Aidez-le.",
        "A lost friend calls: 'I can't see the station any more!' Help him.", "Ask where he is, then guide him back.",
        ["où êtes-vous / qu'est-ce que vous voyez", "reprenez / retournez", "tout droit / à gauche"],
        "Qu'est-ce que vous voyez autour de vous ? Bon, retournez sur vos pas, puis prenez la première rue à gauche, et vous verrez la gare.", 12, 35)
    ]},
    { title: "À l'hôtel", titleEn: "At the hotel", kind: "role", focus: "Check-in, requests, problems", items: [
      V("A hotel receptionist behind a wooden desk smiles", "Bonsoir, bienvenue à l'Hôtel du Parc. Vous avez une réservation ?", "Good evening, welcome. Do you have a reservation?",
        "Confirm the booking, give your name and the length of stay.", ["j'ai réservé", "au nom de", "pour + number of nights"], "Oui, j'ai réservé une chambre au nom de Marie Dupont, pour trois nuits.", 6, 18),
      V("The receptionist checks the screen", "Nous avons une chambre avec vue sur la rue ou sur la cour. Qu'est-ce que vous préférez ?", "We have a room facing the street or the courtyard. Which do you prefer?",
        "Choose and give a reason.", ["je préfère", "parce que"], "Je préfère la cour, parce que j'aimerais dormir au calme.", 6, 18),
      V("The receptionist hands you the key", "Voici votre clé. Le petit-déjeuner est servi de sept à dix heures. Vous avez des questions ?", "Here is your key. Breakfast is served from seven to ten. Any questions?",
        "Ask two questions (wifi, lift, luggage...).", ["est-ce que / où", "two questions"], "Oui, est-ce qu'il y a du wifi dans la chambre ? Et où est l'ascenseur ?", 8, 22),
      V("You call reception from your room", "Réception, bonsoir. Que puis-je faire pour vous ?", "Reception, good evening. What can I do for you?",
        "Explain that there is no hot water and ask for a solution.", ["il n'y a pas d'eau chaude", "pourriez-vous / pouvez-vous", "chambre numéro"], "Bonsoir, il n'y a pas d'eau chaude dans la chambre 12. Pourriez-vous envoyer quelqu'un, s'il vous plaît ?", 8, 22),
      V("It is the next morning; the receptionist looks up", "Bonjour ! Vous avez bien dormi ?", "Good morning! Did you sleep well?",
        "Answer honestly and give details (noise, bed, temperature).", ["j'ai dormi / je n'ai pas bien dormi", "a detail"], "Oui, très bien, merci. Le lit était confortable et il n'y avait pas de bruit.", 8, 22),
      V("You stand at the desk with your suitcase", "Vous partez aujourd'hui ? À quelle heure est votre train ?", "Are you leaving today? What time is your train?",
        "Say your train time and ask to leave your luggage until then.", ["mon train part à", "pourrais-je laisser mes bagages"], "Mon train part à dix-sept heures. Est-ce que je pourrais laisser mes bagages ici jusqu'à l'heure du départ ?", 8, 22)
    ]},
    { title: "Mes voyages", titleEn: "My travels", kind: "story", focus: "Narration: passé composé and imparfait", items: [
      A("Racontez votre dernier voyage : où êtes-vous allé(e), avec qui, et qu'est-ce que vous avez fait ?", "Tell me about your last trip: where, with whom, what you did.",
        "Narrate a past trip in order, with at least three events.", ["où / avec qui", "passé composé (je suis allé, nous avons visité)", "d'abord / ensuite / enfin"],
        "Le mois dernier, je suis allée à Marseille avec ma sœur. D'abord, nous avons visité le Vieux-Port, ensuite nous avons mangé une bouillabaisse, et enfin nous sommes rentrées en train.", 20, 45),
      A("Décrivez un plat que vous avez goûté en voyage et que vous n'avez jamais oublié.", "Describe a dish you tasted while travelling that you never forgot.",
        "Describe the dish and your reaction.", ["c'était + adjective", "ingredients", "j'ai trouvé que"], "Un soir à Dakar, j'ai goûté un thieboudienne. C'était délicieux : le poisson était tendre et le riz était parfumé.", 15, 40),
      A("Parlez d'un souvenir de vacances de votre enfance.", "Talk about a childhood holiday memory.", "Describe the memory using the imparfait.",
        ["quand j'étais petit(e)", "imparfait (on allait, il faisait)", "a feeling"], "Quand j'étais petite, on allait chez ma grand-mère au village. Il faisait chaud et on jouait dehors toute la journée.", 15, 40),
      A("Quel est le plus bel endroit que vous avez visité ? Pourquoi ?", "What is the most beautiful place you have visited? Why?", "Name the place and give two reasons.",
        ["le plus bel endroit", "parce que + two reasons"], "Le plus bel endroit, c'est une petite plage en Bretagne, parce que l'eau est très claire et parce que les gens sont accueillants.", 15, 40),
      A("Racontez un problème que vous avez eu pendant un voyage.", "Tell me about a problem you had during a trip.", "Narrate the problem and how it was solved.",
        ["a problem in the past", "what you did", "the result"], "Une fois, j'ai raté mon bus. J'ai attendu deux heures, puis j'ai pris un taxi collectif et je suis arrivée à temps.", 20, 45),
      A("Décrivez votre ville ou votre village à un touriste.", "Describe your town or village to a tourist.", "Describe it and recommend two things to do.",
        ["c'est + adjective", "il y a", "vous pouvez / je vous conseille"], "Ma ville est animée et colorée. Il y a un grand marché et un parc. Je vous conseille de visiter le marché le matin.", 15, 40)
    ]},
    { title: "Projets de voyage", titleEn: "Travel plans", kind: "opinion", focus: "Future and conditional", items: [
      A("Où voulez-vous voyager l'année prochaine ? Pourquoi ?", "Where do you want to travel next year? Why?", "Say where and give two reasons.",
        ["je voudrais / j'aimerais / je vais", "parce que"], "L'année prochaine, j'aimerais aller au Canada parce que j'ai des amis là-bas et parce que je voudrais voir la neige.", 15, 40),
      A("Comment allez-vous organiser ce voyage ?", "How will you organise this trip?", "Describe the steps in the future.",
        ["futur proche / futur simple", "d'abord / ensuite"], "D'abord, je vais économiser de l'argent. Ensuite, je réserverai mon billet d'avion et je chercherai un logement.", 15, 40),
      A("Qu'est-ce que vous allez visiter ?", "What are you going to visit?", "Name three places or activities.",
        ["je vais visiter", "three items"], "Je vais visiter Montréal, les chutes du Niagara et un petit village québécois.", 12, 35),
      A("Avec qui voulez-vous partir, et pourquoi ?", "Who do you want to travel with, and why?", "Name a travel companion and explain.",
        ["avec + person", "parce que"], "Je veux partir avec ma meilleure amie, parce que nous aimons les mêmes activités et parce qu'elle est toujours de bonne humeur.", 12, 35),
      A("Décrivez votre voyage idéal.", "Describe your ideal trip.", "Describe it using the conditional.",
        ["conditionnel (je partirais, je visiterais)", "a place and an activity"], "Mon voyage idéal serait un mois en Italie. Je visiterais Rome, je mangerais des pâtes tous les jours et je me reposerais près de la mer.", 20, 45),
      A("Si vous aviez un mois de vacances et beaucoup d'argent, que feriez-vous ?", "If you had a month of holiday and lots of money, what would you do?",
        "Answer with si + imparfait, conditional.", ["si j'avais ...", "je ferais / je partirais ..."], "Si j'avais un mois et beaucoup d'argent, je ferais le tour du monde et j'offrirais un voyage à ma famille.", 18, 40)
    ]},
    { title: "Donner son avis", titleEn: "Giving your opinion", kind: "opinion", focus: "Opinion + two reasons + connectors", items: [
      A("Voyager seul ou en groupe : qu'est-ce que vous préférez ?", "Travelling alone or in a group: which do you prefer?", "Give your preference and two reasons.",
        ["je préfère", "d'une part / d'autre part / parce que"], "Je préfère voyager en groupe, parce que c'est plus sûr et parce qu'on partage les frais.", 15, 40),
      A("La mer ou la montagne : où passer les vacances ?", "The sea or the mountains: where to spend holidays?", "Give a clear opinion and a counter-argument.",
        ["à mon avis", "mais / cependant"], "À mon avis, la mer est meilleure pour se détendre. Cependant, la montagne est plus calme.", 15, 40),
      A("Le train ou l'avion : quel est le meilleur moyen de transport ?", "Train or plane: which is the best means of transport?", "Compare and conclude.",
        ["plus ... que / moins ... que", "donc / en conclusion"], "Le train est moins rapide que l'avion, mais il est plus confortable et moins polluant. Donc je choisis le train.", 15, 40),
      A("Pensez-vous que le tourisme est bon pour une ville ?", "Do you think tourism is good for a city?", "Give advantages and a disadvantage.",
        ["avantages", "inconvénient", "mais"], "Le tourisme crée des emplois, mais il peut rendre la vie plus chère pour les habitants.", 18, 42),
      A("Faut-il apprendre la langue du pays avant de voyager ?", "Should you learn the country's language before travelling?", "Give your opinion with two reasons.",
        ["il faut / il n'est pas nécessaire", "parce que"], "Oui, il faut apprendre quelques phrases, parce que les gens apprécient l'effort et parce que c'est plus facile pour se déplacer.", 15, 40),
      A("Est-ce que les réseaux sociaux changent notre façon de voyager ?", "Do social networks change the way we travel?", "Say yes or no and justify with an example.",
        ["oui / non", "par exemple"], "Oui, parce qu'on choisit souvent un endroit après l'avoir vu en photo. Par exemple, beaucoup de gens vont dans les mêmes cafés.", 18, 42)
    ]},
    { title: "Imprévus", titleEn: "When things go wrong", kind: "role", focus: "Explaining a problem and negotiating a solution", items: [
      V("An airport lost-luggage desk; the agent looks up", "Bonjour. Vous avez un problème ?", "Hello. Do you have a problem?",
        "Explain that your suitcase did not arrive and describe it.", ["ma valise n'est pas arrivée", "description (couleur, taille)", "vol de"], "Ma valise n'est pas arrivée. Elle est grande, bleue, avec un ruban rouge. Je viens du vol de Paris.", 10, 28),
      V("A station platform; your train has just left", "Vous cherchez quelque chose ?", "Are you looking for something?",
        "Explain that you missed your train and ask for the next one.", ["j'ai raté mon train", "le prochain train", "à quelle heure"], "J'ai raté mon train de dix heures. Est-ce qu'il y a un autre train pour Lyon ? À quelle heure part-il ?", 10, 28),
      V("A hotel lobby at midnight; a guest in pyjamas", "Excusez-moi de vous déranger. Mais il y a un problème ?", "Sorry to disturb you. Is there a problem?",
        "Complain about noise from the next room and ask for action.", ["il y a du bruit", "depuis + time", "pouvez-vous"], "Oui, il y a beaucoup de bruit dans la chambre d'à côté depuis une heure. Pouvez-vous leur parler, s'il vous plaît ?", 10, 28),
      V("A police station counter, an officer takes notes", "Qu'est-ce qui s'est passé ?", "What happened?",
        "Report a lost wallet: when, where, content.", ["j'ai perdu mon portefeuille", "hier / ce matin", "il y avait"], "J'ai perdu mon portefeuille ce matin dans le métro. Il y avait ma carte bancaire et mon passeport.", 12, 30),
      V("A tourist office; the agent checks a booking list", "Votre réservation n'apparaît pas dans notre système.", "Your booking doesn't appear in our system.",
        "Insist politely, offer proof, ask what to do.", ["j'ai une confirmation", "pourriez-vous vérifier", "qu'est-ce que je dois faire"], "C'est étrange, j'ai une confirmation par e-mail. Pourriez-vous vérifier encore une fois ? Sinon, qu'est-ce que je dois faire ?", 12, 30),
      V("A pharmacy; the pharmacist leans forward", "Qu'est-ce qui ne va pas ?", "What's wrong?",
        "Explain you have a headache and a fever since yesterday and ask for advice.", ["j'ai mal à la tête", "depuis hier", "qu'est-ce que vous me conseillez"], "J'ai mal à la tête et un peu de fièvre depuis hier. Qu'est-ce que vous me conseillez ?", 12, 30)
    ]}
  ],
  graduation: { title: "Voyage raté", titleEn: "A trip gone wrong", kind: "role",
    focus: "Explain, propose, narrate, advise", items: [
      V("A station information desk; an agent looks at you kindly", "Bonjour. Vous avez l'air stressé. Que s'est-il passé ?", "Hello. You look stressed. What happened?",
        "Explain how you missed your train: what happened, step by step.", ["passé composé / imparfait", "d'abord / puis / alors", "a cause"], "J'ai raté mon train parce que mon bus était en retard. Quand je suis arrivée à la gare, le train partait déjà.", 15, 40),
      V("The agent types on the computer", "Je vois. Quelles solutions voyez-vous ?", "I see. What solutions do you see?",
        "Propose two solutions politely.", ["je pourrais / on pourrait", "ou", "conditionnel"], "Je pourrais prendre le prochain train, ou on pourrait changer mon billet pour demain matin.", 12, 35),
      V("The agent looks at the screen, then at you", "Malheureusement, il n'y a plus de train ce soir. Il y a un hôtel à côté. Qu'est-ce que vous décidez ?", "Sadly, there is no train tonight. There's a hotel next door. What do you decide?",
        "Decide and justify your choice.", ["je décide de / je vais", "parce que / car", "a plan for tomorrow"], "Je vais prendre une chambre à l'hôtel, parce que je suis très fatiguée, et je prendrai le premier train demain matin.", 15, 40),
      V("The agent smiles and leans back", "Ça vous arrive souvent de voyager comme ça ? Racontez-moi un autre voyage compliqué.", "Does this often happen to you? Tell me about another difficult trip.",
        "Tell a short story of a past travel problem.", ["passé composé + imparfait", "sequence", "feelings"], "Une fois, j'ai perdu mon billet d'avion juste avant l'embarquement. J'étais paniquée, mais une employée m'a aidée à le réimprimer.", 20, 45),
      V("The agent puts away the notes", "Pour finir : selon vous, comment éviter ce genre de problème en voyage ?", "Finally: how can you avoid this kind of problem?",
        "Give advice using il faut / on devrait, with two tips.", ["il faut / on devrait", "two tips", "parce que"], "Il faut arriver en avance à la gare et on devrait toujours vérifier les horaires la veille.", 20, 45)
    ]}
});
})();
(function(){ var B = TK_BUILD, E = B.E, S = B.S, A = B.A, V = B.V, I = B.I;
function chart(icon, desc, voice, en, must, sample) {
  return I(icon, desc, voice, en, "Describe the data: overall trend, key figures, one comparison.", must, sample, 25, 50);
}
TK_LEVEL({
  id: "B2", cefr: "B2", place: "Le Bureau", placeEn: "The Office",
  tagline: "Argumenter, négocier, présenter - Argue, negotiate, present",
  sceneImage: { icon: "🏢", description: "A bright modern open-plan office with glass meeting rooms, a whiteboard full of notes, city view at dusk" },
  summary: "The learner interacts with fluency and spontaneity, gives clear detailed descriptions, and argues a viewpoint by weighing advantages and disadvantages.",
  canDo: [
    "Present themselves and their experience in an interview",
    "Take part in a meeting: agree, disagree and propose, with nuance",
    "Negotiate a request and agree a compromise",
    "Describe charts and trends with precise vocabulary",
    "Build a structured argument with concession and conclusion",
    "Summarise a spoken text in their own words"
  ],
  focus: "Argument structure, concession, hypothesis (si + conditionnel), passive and nominalisation, trend vocabulary, professional register (vous), diplomatic phrasing",
  pass: 70, leniency: 2, gradPass: 75, defMin: 20, defMax: 55,
  graduationMeans: "You can present a topic from a short document, defend your viewpoint against objections and conclude convincingly, speaking fluently for up to a minute at a time with good organisation and few errors that do not block meaning.",
  games: [
    { title: "Entretien d'embauche", titleEn: "Job interview", kind: "role", focus: "Presenting yourself and your achievements", items: [
      A("Bonjour, et merci d'être venu. Pour commencer, pouvez-vous vous présenter en une minute ?", "Hello, and thank you for coming. To start, can you introduce yourself in one minute?",
        "Introduce your background, experience and qualities.", ["formation", "expérience", "qualités / objectifs"],
        "Je m'appelle Marie Dupont. J'ai une licence en gestion et trois ans d'expérience en ressources humaines. Je suis organisée, à l'écoute, et j'aime travailler en équipe. Aujourd'hui, je cherche un poste où je pourrai évoluer.", 25, 55),
      A("Pourquoi voulez-vous travailler dans notre entreprise ?", "Why do you want to work for our company?", "Give two or three specific reasons.",
        ["vos valeurs / vos produits", "mes compétences correspondent", "je souhaite"], "Votre entreprise est connue pour son innovation et pour la qualité de son management. Mes compétences correspondent au poste, et je souhaite contribuer à vos projets de développement.", 22, 50),
      A("Quelle est votre plus grande réussite professionnelle ?", "What is your greatest professional achievement?", "Describe one achievement: context, action, result.",
        ["contexte", "ce que j'ai fait", "résultat chiffré ou concret"], "L'an dernier, j'ai dirigé la réorganisation de notre service. J'ai mis en place un nouveau planning et, en six mois, nous avons réduit les retards de trente pour cent.", 25, 55),
      A("Parlez-moi d'une difficulté que vous avez surmontée.", "Tell me about a difficulty you overcame.", "Narrate the problem, how you handled it, what you learned.",
        ["situation difficile", "action", "leçon retenue"], "Un jour, un client important a annulé son contrat. J'ai analysé les causes, j'ai proposé une nouvelle offre et le client est revenu. J'ai appris à écouter avant de réagir.", 25, 55),
      A("Où vous voyez-vous dans cinq ans ?", "Where do you see yourself in five years?", "Describe realistic goals and how this job fits.",
        ["objectifs", "futur / conditionnel", "lien avec le poste"], "Dans cinq ans, j'aimerais avoir pris davantage de responsabilités, peut-être en dirigeant une petite équipe. Ce poste me permettrait de développer ces compétences.", 22, 50)
    ]},
    { title: "Mon métier", titleEn: "My job", kind: "describe", focus: "Describing work and giving advice", items: [
      A("Décrivez une journée type dans votre métier, ou dans le métier que vous aimeriez faire.", "Describe a typical day in your job, or the job you would like.", "Describe the day in order, with details.",
        ["le matin / l'après-midi", "tâches", "difficultés ou plaisirs"], "Le matin, je réponds aux messages et je prépare mes dossiers. Vers midi, j'ai une réunion d'équipe. L'après-midi est plus calme : je rédige des rapports.", 25, 55),
      A("Qu'est-ce que vous aimez le plus et le moins dans ce métier ?", "What do you like most and least about this job?", "Explain one strong and one weak point, with reasons.",
        ["ce que j'aime le plus", "ce que j'aime le moins", "parce que"], "Ce que j'aime le plus, c'est la variété des projets. Ce que j'apprécie moins, c'est la pression des délais, car elle limite le temps de réflexion.", 22, 50),
      A("Quelles qualités sont indispensables pour réussir dans ce métier ?", "Which qualities are essential to succeed in this job?", "Name three qualities and illustrate one.",
        ["trois qualités", "exemple"], "Il faut de la rigueur, de l'écoute et de l'adaptabilité. Par exemple, quand un client change d'avis au dernier moment, il faut savoir réagir calmement.", 22, 50),
      A("Comment la technologie change-t-elle votre secteur ?", "How is technology changing your field?", "Describe two changes and say whether they are positive.",
        ["changements", "avantages / risques", "à mon avis"], "L'intelligence artificielle automatise des tâches répétitives, ce qui fait gagner du temps. En revanche, certains emplois risquent de changer profondément. À mon avis, il faut se former en continu.", 25, 55),
      A("Quel conseil donneriez-vous à quelqu'un qui débute dans ce métier ?", "What advice would you give someone starting in this job?", "Give two pieces of advice using the conditional.",
        ["je lui conseillerais", "parce que", "exemple"], "Je lui conseillerais de poser beaucoup de questions et de ne pas avoir peur de se tromper, parce que les erreurs sont la meilleure façon d'apprendre.", 22, 50)
    ]},
    { title: "En réunion", titleEn: "In a meeting", kind: "role", focus: "Agreeing, disagreeing, proposing with nuance", items: [
      V("A meeting room; a manager stands at a whiteboard", "Je propose qu'on reporte le lancement d'un mois. Qu'en pensez-vous ?", "I propose we postpone the launch by a month. What do you think?",
        "Respond with nuance: agree or disagree, justify, propose an alternative.", ["je suis plutôt / pas tout à fait d'accord", "parce que / en effet", "proposition"],
        "Je comprends l'idée, mais un mois de retard risque de coûter cher. Je propose plutôt de lancer une version simplifiée à la date prévue.", 20, 45),
      V("The manager shows a slide with a red budget figure", "Notre budget a été réduit de vingt pour cent. Comment s'adapte-t-on ?", "Our budget has been cut by twenty percent. How do we adapt?",
        "Propose two concrete measures and justify them.", ["priorités", "réduire / reporter", "en contrepartie"], "Nous pourrions concentrer l'effort sur les deux projets les plus rentables et reporter le reste. En contrepartie, il faudrait renégocier avec les fournisseurs.", 22, 50),
      V("A colleague frowns while reading an email", "Le client est mécontent des délais. Qui peut s'en occuper ?", "The client is unhappy about the delays. Who can handle it?",
        "Volunteer or decline, with conditions and reasons.", ["je peux / je ne peux pas", "à condition que", "parce que"], "Je peux m'en charger, à condition d'avoir accès au dossier complet et à l'équipe technique cette semaine.", 20, 45),
      V("A team member folds their arms", "Je ne suis pas sûr que cette stratégie fonctionne. Vous avez des chiffres ?", "I'm not sure this strategy works. Do you have figures?",
        "Defend a strategy with evidence (invent plausible data).", ["des chiffres", "d'après / selon", "conclusion"], "D'après notre dernière étude, quarante pour cent des clients préfèrent cette offre. Les résultats du test sont donc encourageants.", 22, 50),
      V("The manager closes the laptop", "Pour conclure, quelles décisions prenons-nous aujourd'hui ?", "To conclude, what decisions are we taking today?",
        "Summarise three decisions and who does what, by when.", ["nous avons décidé", "responsable", "d'ici + date"], "Nous avons décidé de lancer le test lundi. Paul prépare le rapport d'ici jeudi, et Sarah contacte les clients avant vendredi.", 22, 50)
    ]},
    { title: "Négocier", titleEn: "Negotiating", kind: "mediate", focus: "Requests, counter-offers, compromise", items: [
      A("Vous avez demandé un rendez-vous. De quoi souhaitez-vous parler ?", "You asked for a meeting. What would you like to discuss?", "Ask for a raise and give your arguments.",
        ["je souhaiterais", "arguments (résultats, responsabilités)", "politesse"], "Je souhaiterais parler de mon salaire. Depuis un an, j'ai pris en charge deux nouveaux projets, et les résultats de mon équipe ont progressé. Je pense qu'une augmentation serait justifiée.", 22, 50),
      A("C'est difficile en ce moment. Nous ne pouvons pas accorder dix pour cent.", "That's difficult at the moment. We can't grant ten percent.", "Propose a compromise using the conditional.",
        ["je comprends", "je serais prêt(e) à", "compromis"], "Je comprends la situation. Je serais prêt à accepter cinq pour cent maintenant, avec une nouvelle discussion dans six mois.", 20, 45),
      A("Le projet doit être terminé vendredi. Est-ce possible ?", "The project has to be finished by Friday. Is that possible?", "Explain constraints and negotiate a new deadline.",
        ["difficile / contraintes", "je pourrais le livrer", "à condition que"], "Vendredi sera difficile, car il manque encore des données. Je pourrais livrer lundi midi, à condition que l'équipe technique me réponde demain.", 20, 45),
      A("J'aimerais aussi que vous preniez le dossier Durand.", "I'd also like you to take on the Durand file.", "Decline politely or accept under conditions.",
        ["je suis honoré(e) mais", "charge de travail", "alternative"], "Je suis honoré de votre confiance, mais ma charge de travail est déjà élevée. Je pourrais le faire si Paul reprenait un de mes dossiers.", 20, 45),
      A("Très bien. Pouvez-vous reformuler ce que nous avons décidé ?", "Very good. Can you restate what we agreed?", "Summarise the agreement clearly.",
        ["nous sommes d'accord pour", "conditions", "prochaine étape"], "Nous sommes d'accord pour une augmentation de cinq pour cent dès le mois prochain, avec un nouveau point dans six mois.", 18, 45)
    ]},
    { title: "Décrire un graphique", titleEn: "Describing a chart", kind: "describe", focus: "Trend vocabulary and comparison", items: [
      chart("📈", "A line chart of yearly sales: 100 in 2020, 120 in 2021, 150 in 2022, 140 in 2023, 180 in 2024",
        "Décrivez l'évolution des ventes entre 2020 et 2024.", "Describe the evolution of sales between 2020 and 2024.",
        ["augmentation", "légère baisse en 2023", "180 en 2024"], "Les ventes ont augmenté de façon régulière, de cent à cent cinquante entre 2020 et 2022. On observe une légère baisse en 2023, puis une forte reprise : elles atteignent cent quatre-vingts en 2024."),
      chart("📊", "A bar chart of how residents travel: car 45%, train 30%, bicycle 15%, walking 10%",
        "Comment les habitants de cette ville se déplacent-ils ?", "How do residents of this city get around?",
        ["45 % en voiture", "train 30 %", "vélo et marche : minorité"], "La voiture reste le moyen de transport principal, avec quarante-cinq pour cent. Le train arrive en deuxième position avec trente pour cent, tandis que le vélo et la marche ne représentent que vingt-cinq pour cent à eux deux."),
      chart("🥧", "A pie chart of a household budget: housing 40%, food 25%, transport 15%, leisure 10%, savings 10%",
        "Décrivez la répartition de ce budget.", "Describe the breakdown of this budget.",
        ["logement : 40 %", "alimentation 25 %", "loisirs et épargne"], "Le logement représente la plus grande part du budget, soit quarante pour cent. L'alimentation vient ensuite avec vingt-cinq pour cent. Les loisirs et l'épargne sont les postes les plus faibles, avec dix pour cent chacun."),
      chart("📉", "A line chart of unemployment: 12% five years ago, steadily falling to 8%, then flat for the last year",
        "Que pouvez-vous dire sur l'évolution du chômage ?", "What can you say about unemployment trends?",
        ["baisse / diminution", "de 12 % à 8 %", "se stabilise"], "Le chômage a nettement diminué en cinq ans, passant de douze à huit pour cent. Depuis un an, il se stabilise, ce qui suggère que la baisse arrive à ses limites."),
      chart("🌡️", "A line chart comparing monthly temperatures in two cities across the year: Lyon rises from 3 to 24 degrees, Dakar stays between 24 and 30",
        "Comparez les températures de ces deux villes.", "Compare the temperatures of these two cities.",
        ["alors que / tandis que", "Lyon varie beaucoup", "Dakar reste stable"], "À Lyon, les températures varient fortement, de trois degrés en hiver à vingt-quatre en été. À Dakar, en revanche, elles restent stables, entre vingt-quatre et trente degrés toute l'année.")
    ]},
    { title: "Argumenter", titleEn: "Arguing a case", kind: "debate", focus: "Thesis, arguments, concession, conclusion", items: [
      A("Le télétravail devrait-il être un droit pour tous les salariés ? Donnez votre point de vue.", "Should remote work be a right for all employees? Give your view.",
        "Take a position, give two arguments with examples, concede one point, conclude.", ["thèse", "d'abord / ensuite", "certes ... mais", "en conclusion"],
        "À mon avis, le télétravail devrait être un droit lorsque le poste le permet. D'abord, il réduit le temps de transport. Ensuite, il améliore l'équilibre de vie. Certes, il peut isoler, mais des journées de présence suffisent à compenser. En conclusion, la flexibilité profite à tous.", 35, 55),
      A("Faut-il passer à la semaine de quatre jours ?", "Should we move to a four-day working week?", "Take a position, two arguments, one concession, a conclusion.",
        ["thèse", "arguments", "certes ... mais", "conclusion"], "Je pense que oui, car des salariés reposés sont plus productifs. Certes, certains secteurs ne peuvent pas s'y adapter, mais on peut proposer des solutions flexibles. Donc, c'est un projet à tester.", 35, 55),
      A("Les réunions sont-elles une perte de temps ?", "Are meetings a waste of time?", "Take a nuanced position and propose improvements.",
        ["thèse nuancée", "exemples", "propositions"], "Cela dépend. Une réunion sans objectif est inutile, mais une réunion bien préparée permet de décider vite. Il faudrait fixer un ordre du jour et limiter la durée.", 30, 55),
      A("L'intelligence artificielle va-t-elle supprimer plus d'emplois qu'elle n'en crée ?", "Will AI destroy more jobs than it creates?", "Argue with examples and a concession.",
        ["thèse", "exemple concret", "cependant", "conclusion"], "Je crois que l'IA va surtout transformer les emplois. Par exemple, les métiers répétitifs diminuent, mais d'autres apparaissent. Cependant, la transition sera difficile sans formation.", 35, 55),
      A("Les open spaces favorisent-ils vraiment la collaboration ?", "Do open-plan offices really encourage collaboration?", "Give a reasoned position with one advantage and one drawback.",
        ["thèse", "avantage", "inconvénient", "conclusion"], "Les open spaces facilitent les échanges rapides, mais le bruit nuit à la concentration. Je pense qu'un équilibre est nécessaire, avec des espaces calmes.", 30, 55)
    ]},
    { title: "Gérer un conflit", titleEn: "Handling conflict", kind: "role", focus: "De-escalation and diplomatic phrasing", items: [
      V("A colleague stands by your desk, clearly annoyed", "Tu as encore oublié d'envoyer le rapport. C'est la troisième fois !", "You forgot to send the report again. That's the third time!",
        "Apologise, explain without excuses, and say how you will fix it.", ["je m'excuse", "explication", "je vais + solution"], "Tu as raison, je suis désolé. J'ai eu une semaine chargée, mais ce n'est pas une excuse. Je te l'envoie dans une heure et j'ajoute un rappel à mon agenda.", 18, 45),
      V("Your manager sits at the head of a table", "Je suis déçu de votre présentation d'hier. Elle manquait de clarté.", "I was disappointed by your presentation yesterday. It lacked clarity.",
        "Respond professionally: accept feedback, ask for specifics, propose improvement.", ["je comprends", "pourriez-vous préciser", "je vais améliorer"], "Je comprends votre remarque. Pourriez-vous préciser quelles parties étaient confuses ? Je vais retravailler le plan et vous proposer une nouvelle version.", 20, 45),
      V("A customer on a video call holds up a broken product", "Je suis furieux, mon produit est arrivé cassé !", "I'm furious, my product arrived broken!",
        "De-escalate and propose a solution.", ["je comprends votre colère", "je vous propose", "délai"], "Je comprends tout à fait votre colère, et je m'en excuse. Je vous propose de vous envoyer un nouveau produit dès demain, sans frais.", 18, 45),
      V("Two teammates argue in the corridor", "Moi, je pense que c'est de ta faute, pas de la mienne !", "I think it's your fault, not mine!",
        "Calm both people, restate facts neutrally and suggest a next step.", ["restons calmes", "reformulation des faits", "prochaine étape"], "Restons calmes, s'il vous plaît. Si j'ai bien compris, le fichier a été modifié deux fois. Regardons l'historique ensemble avant de chercher un responsable.", 20, 45),
      V("Your manager sighs and relaxes slightly", "D'accord. Mais je veux que cela ne se reproduise plus.", "All right. But I don't want this to happen again.",
        "Commit to concrete preventive measures.", ["je m'engage à", "mesures concrètes", "suivi"], "Je m'engage à vérifier chaque rapport avant l'envoi et à vous informer dès qu'un retard est possible.", 18, 45)
    ]},
    { title: "Résumer", titleEn: "Summarising", kind: "summary", focus: "Reformulating what you heard", items: [
      A("Depuis la crise sanitaire, de nombreuses entreprises proposent deux jours de télétravail par semaine. Les salariés disent gagner du temps et mieux équilibrer vie privée et vie professionnelle. Mais certains managers regrettent une baisse de la cohésion d'équipe. Plusieurs sociétés testent donc des journées de présence obligatoire.",
        "Since the pandemic, many companies offer two remote days per week...", "Summarise the text in your own words.",
        ["deux jours de télétravail", "avantages pour les salariés", "problème de cohésion", "journées de présence"],
        "Le texte explique que beaucoup d'entreprises permettent deux jours de télétravail. Les salariés y gagnent en temps et en équilibre, mais les managers constatent moins de cohésion, donc certaines imposent des jours de présence.", 22, 50),
      V("A TV news report on a city street", "La ville de Nantes limite la vitesse à trente kilomètres par heure dans le centre. Les autorités disent que cela réduit les accidents et le bruit. Les commerçants craignent que les clients viennent moins en voiture. Un bilan sera présenté dans six mois.",
        "The city of Nantes is limiting speed to 30 km/h in the centre...", "Summarise the report and say who is for and against.",
        ["vitesse limitée à 30", "accidents et bruit", "commerçants inquiets", "bilan dans six mois"],
        "Nantes limite la vitesse à trente kilomètres par heure en centre-ville pour réduire accidents et bruit. Les commerçants s'inquiètent pour la clientèle, et un bilan aura lieu dans six mois.", 22, 50),
      A("Les spécialistes du sommeil recommandent de dormir entre sept et neuf heures par nuit. Pourtant, un adulte sur trois dort moins de six heures. Les écrans le soir, le café tardif et le stress sont les principales causes. Se coucher à heure fixe peut améliorer la situation.",
        "Sleep specialists recommend seven to nine hours a night...", "Summarise the main points.",
        ["sept à neuf heures", "un adulte sur trois", "causes", "se coucher à heure fixe"],
        "Les spécialistes conseillent sept à neuf heures de sommeil, mais un adulte sur trois dort moins de six heures à cause des écrans, du café et du stress. Une heure de coucher régulière aide.", 22, 50),
      V("An interview in a bright school office", "Marie Lenoir, directrice d'une école de langues, explique que la réussite d'un apprenant dépend avant tout de sa régularité. Selon elle, vingt minutes par jour valent mieux que trois heures le dimanche. Elle conseille aussi de parler dès le début, même avec des erreurs.",
        "Marie Lenoir, director of a language school, explains that success depends on regularity...", "Summarise her advice.",
        ["régularité", "vingt minutes par jour", "parler dès le début"],
        "La directrice affirme que la régularité est la clé : vingt minutes par jour sont plus efficaces que trois heures le dimanche. Elle recommande aussi de parler tout de suite, même en faisant des erreurs.", 22, 50),
      A("Un nouveau musée interactif ouvrira en mars. Il propose des expositions numériques où les visiteurs peuvent toucher et modifier les œuvres. Le directeur espère attirer un public plus jeune. Les critiques se demandent si la technologie ne détournera pas l'attention des œuvres elles-mêmes.",
        "A new interactive museum will open in March...", "Summarise the news and the debate it raises.",
        ["ouverture en mars", "expositions numériques", "public plus jeune", "critique : la technologie distrait"],
        "Un musée interactif ouvre en mars avec des expositions numériques pour attirer les jeunes. Certains critiques craignent que la technologie fasse oublier les œuvres.", 22, 50)
    ]}
  ],
  graduation: { title: "Présentation défendue", titleEn: "Presentation and defence", kind: "present",
    focus: "Present a document, defend a view, conclude", items: [
      A("Plusieurs entreprises testent la semaine de quatre jours, sans baisse de salaire. Les premiers résultats montrent moins d'absentéisme et davantage de motivation. Mais certains secteurs, comme la santé ou la restauration, ont du mal à s'organiser. Les syndicats demandent une loi, tandis que le patronat préfère des accords au cas par cas.",
        "Several companies are trialling a four-day week with no pay cut...", "Present the document, then give your own point of view.",
        ["présentation du sujet", "points clés", "point de vue personnel avec arguments"],
        "Ce texte parle de la semaine de quatre jours testée par plusieurs entreprises. Les résultats sont positifs, mais certains secteurs peinent à s'adapter. À mon avis, c'est une bonne idée, car elle améliore la motivation, mais il faut des solutions adaptées à chaque métier.", 35, 55),
      V("An examiner in a plain office, pen in hand", "Mais ne pensez-vous pas que cette mesure serait impossible dans certains métiers, comme la santé ?", "But don't you think this would be impossible in some jobs, like healthcare?",
        "Respond: concede, then refute or nuance with an argument.", ["certes", "mais", "exemple ou solution"], "Certes, dans la santé, c'est plus compliqué. Mais on peut organiser des équipes par roulement et recruter davantage. Plusieurs hôpitaux testent déjà cette solution.", 25, 50),
      V("The examiner leans forward", "Et pour les entreprises ? Elles risquent d'y perdre en productivité, non ?", "And for companies? They risk losing productivity, don't they?",
        "Answer with evidence or reasoning.", ["pas forcément", "d'après les études / exemples", "conclusion partielle"], "Pas forcément. Les premières expériences montrent que la productivité reste stable, parce que les salariés sont plus concentrés.", 22, 50),
      V("The examiner closes the file", "Pour terminer, pouvez-vous conclure en résumant votre position ?", "To finish, can you conclude by summarising your position?",
        "Conclude clearly: restate your position, the main reason, a final nuance.", ["en conclusion", "ma position", "nuance finale"], "En conclusion, je suis favorable à la semaine de quatre jours, parce qu'elle améliore le bien-être sans nuire à la productivité. Il faut toutefois l'adapter à chaque secteur.", 22, 50)
    ]}
});
})();
(function(){ var B = TK_BUILD, A = B.A, V = B.V, I = B.I;
function T(q,en,task,must,sample,min,max){ return A(q,en,task,must,sample,min||30,max||55); }
TK_LEVEL({
  id: "C1", cefr: "C1", place: "La Conférence", placeEn: "The Conference",
  tagline: "Structurer, convaincre, nuancer - Structure, convince, nuance",
  sceneImage: { icon: "🎤", description: "A large conference hall with a stage, podium, projector screen and an attentive audience" },
  summary: "The learner expresses ideas fluently and spontaneously, structures long discourse on complex subjects and adapts register to the audience.",
  canDo: [
    "Open and structure a talk with clear signposting",
    "Present and interpret data with nuance",
    "Argue for and against a position, refuting objections",
    "Explain a complex idea simply",
    "Handle difficult questions from an audience",
    "Adapt register and tell a story with impact"
  ],
  focus: "Discourse markers, subjunctive, nominal style, concession and opposition, register control, rhetorical devices, summary and synthesis",
  pass: 73, leniency: 0, gradPass: 78, defMin: 30, defMax: 55,
  graduationMeans: "You can deliver a structured talk in several parts and answer unexpected questions, with a wide vocabulary, flexible grammar and a clear organising thread.",
  games: [
    { title: "Ouvrir et structurer", titleEn: "Opening and structuring", kind: "present", focus: "Hook, announce plan, signpost", items: [
      T("Vous ouvrez une conférence sur la transition écologique. Faites une introduction accrocheuse et annoncez votre plan.","You open a talk on the ecological transition. Give a hooking introduction and announce your plan.","Hook, topic, problem, plan in three parts.",["accroche","problématique","dans un premier temps / puis / enfin"],"Mesdames et messieurs, chaque année, nous jetons des tonnes de vêtements. Comment concilier consommation et planète ? Dans un premier temps, nous verrons les causes du problème, puis ses conséquences, et enfin des solutions concrètes."),
      T("Vous présentez une étude sur le sommeil des adolescents. Présentez son objectif et sa méthode.","You present a study on teenage sleep. Present its aim and method.","Aim, sample, method, in a formal register.",["cette étude vise à","échantillon","méthode"],"Cette étude vise à mesurer l'impact des écrans sur le sommeil. Elle repose sur un échantillon de mille élèves, interrogés par questionnaire puis suivis pendant six mois."),
      T("Faites la transition entre votre deuxième et troisième partie, en rappelant brièvement ce qui précède.","Make the transition between parts two and three, recalling what came before.","Recap and announce the next part.",["nous avons vu que","à présent","il convient d'examiner"],"Nous avons vu que les causes sont multiples et que les conséquences touchent chacun d'entre nous. À présent, il convient d'examiner les solutions possibles."),
      T("Concluez votre exposé en rappelant l'essentiel et en ouvrant une perspective.","Conclude your talk with the essentials and a perspective.","Summary plus opening.",["en résumé","l'essentiel","perspective"],"En résumé, le problème est réel mais surmontable. L'essentiel est d'agir collectivement. Reste à savoir si nous aurons le courage de le faire à temps."),
    ]},
    { title: "Présenter des données", titleEn: "Presenting data", kind: "describe", focus: "Interpreting and qualifying figures", items: [
      I("📈","A graph showing online sales rising from 20% to 45% of retail in ten years, with a sharp jump during the last two years","Interprétez cette évolution et proposez deux explications.","Interpret this evolution and offer two explanations.","Describe, interpret, hypothesise.",["progression","pourrait s'expliquer par","toutefois"],"Les ventes en ligne ont plus que doublé en dix ans, avec une accélération récente. Cela pourrait s'expliquer par l'essor de la livraison rapide et par le changement d'habitudes. Toutefois, ces chiffres ne disent rien de la rentabilité.",30,55),
      I("🗺️","A map of France shaded by unemployment rate, higher in the north and the Mediterranean coast","Que montre cette carte ? Nuancez votre analyse.","What does this map show? Nuance your analysis.","Describe, compare regions, add caveats.",["contrastes régionaux","il faut toutefois nuancer","facteurs"],"La carte révèle de forts contrastes régionaux, avec un chômage plus élevé dans le nord et sur le littoral méditerranéen. Il faut toutefois nuancer : la structure économique de chaque région explique en grande partie ces écarts.",30,55),
      I("📊","Two bars: women earn 16% less than men on average; the gap shrinks to 5% when comparing the same job and hours","Expliquez la différence entre les deux chiffres.","Explain the difference between the two figures.","Interpret a statistic and warn against misreading.",["écart brut","à poste égal","ne signifie pas"],"L'écart brut est de seize pour cent, mais à poste et durée égaux il tombe à cinq. Cela ne signifie pas que le problème disparaît : il se déplace vers l'accès aux postes les mieux payés.",30,55),
      I("📉","A line chart of a company's profits falling for three years, then a small rebound the last quarter","Faut-il s'inquiéter ou se réjouir ? Argumentez.","Should we worry or celebrate? Argue.","Weigh the evidence and conclude with a hedge.",["tendance","un seul trimestre","prudence"],"Une seule hausse trimestrielle ne suffit pas à inverser une tendance de trois ans. Il faut rester prudent, tout en surveillant si le rebond se confirme.",30,55),
    ]},
    { title: "Débat : pour", titleEn: "Debate: for", kind: "debate", focus: "Defending a thesis", items: [
      T("Défendez l'idée que l'école devrait enseigner la gestion des émotions.","Defend the idea that school should teach emotional management.","Thesis, three arguments, example, conclusion.",["thèse","premièrement / deuxièmement / enfin","exemple"],"Je soutiens que l'école doit enseigner la gestion des émotions. Premièrement, elle améliore le climat de classe. Deuxièmement, elle prévient le décrochage. Enfin, elle prépare à la vie adulte. Des pays l'ont déjà fait avec succès."),
      T("Défendez l'idée que les transports en commun devraient être gratuits.","Defend the idea that public transport should be free.","Argue with social and environmental points.",["thèse","argument social","argument écologique"],"Rendre les transports gratuits favoriserait l'égalité d'accès et réduirait la circulation. La ville de Dunkerque en est un exemple, avec une hausse nette de la fréquentation."),
      T("Défendez la limitation du temps d'écran chez les enfants.","Defend limiting children's screen time.","Argue with evidence and anticipate an objection.",["thèse","preuve","on pourrait objecter que"],"Limiter les écrans protège le sommeil et la concentration. On pourrait objecter que les écrans éduquent aussi, mais il s'agit d'encadrer l'usage, non de l'interdire."),
      T("Défendez l'obligation d'apprendre une troisième langue au lycée.","Defend compulsory learning of a third language in high school.","Give a structured defence.",["thèse","avantages","conclusion"],"Apprendre une troisième langue ouvre l'esprit et facilite l'accès à l'emploi. C'est un investissement à long terme que nous devons à nos élèves."),
    ]},
    { title: "Débat : contre", titleEn: "Debate: against", kind: "debate", focus: "Refuting and countering", items: [
      T("On vous dit : « Les devoirs à la maison sont indispensables. » Réfutez cet argument.","You hear: 'Homework is essential.' Refute it.","Acknowledge, refute, counter-propose.",["je comprends l'argument","or","en réalité"],"Je comprends l'argument, mais les études montrent peu de bénéfices avant le collège. En réalité, les devoirs creusent les inégalités entre familles."),
      T("On vous dit : « Le nucléaire est la seule solution écologique. » Nuancez et contredisez.","You hear: 'Nuclear is the only ecological solution.' Nuance and contradict.","Partial concession then objection.",["certes","néanmoins","d'autres solutions"],"Certes, le nucléaire émet peu de carbone. Néanmoins, la gestion des déchets pose problème, et d'autres solutions, comme le solaire, se développent vite."),
      T("On vous dit : « Les réseaux sociaux rapprochent les gens. » Montrez les limites de cette idée.","You hear: 'Social networks bring people together.' Show its limits.","Show limits with examples.",["en apparence","en réalité","exemple"],"En apparence, ils rapprochent. En réalité, ils enferment souvent chacun dans sa bulle, comme le montrent les débats polarisés en ligne."),
      T("On vous dit : « Il faut interdire les voitures en centre-ville. » Argumentez contre.","You hear: 'Cars must be banned from city centres.' Argue against.","Argue against with an alternative.",["inconvénients","alternative","conclusion"],"Une interdiction totale pénaliserait les commerçants et les personnes à mobilité réduite. Une zone à faibles émissions serait plus équilibrée."),
    ]},
    { title: "Expliquer simplement", titleEn: "Explaining simply", kind: "describe", focus: "Clarity, analogy, reformulation", items: [
      T("Expliquez à un enfant de dix ans ce qu'est l'inflation.","Explain to a ten-year-old what inflation is.","Use a simple analogy and a concrete example.",["c'est comme","par exemple","en résumé"],"L'inflation, c'est quand les prix montent. Par exemple, un bonbon qui coûtait un euro en coûte un euro cinquante : avec la même pièce, on en achète moins."),
      T("Expliquez à un grand-parent comment fonctionne une visioconférence.","Explain to a grandparent how a video call works.","Step by step, simple words.",["d'abord","ensuite","il suffit de"],"D'abord, vous cliquez sur le lien reçu. Ensuite, vous autorisez la caméra et le micro. Il suffit alors d'attendre : vous verrez et entendrez l'autre personne en direct."),
      T("Expliquez en termes simples ce qu'est un algorithme.","Explain in simple terms what an algorithm is.","Use an analogy.",["c'est comme une recette","étapes","résultat"],"Un algorithme, c'est comme une recette de cuisine : une suite d'étapes précises qui mène à un résultat. L'ordinateur suit chaque étape sans jamais improviser."),
      T("Expliquez pourquoi il est important de voter, à quelqu'un qui n'y croit pas.","Explain why voting matters to someone who doesn't believe in it.","Persuasive but simple.",["votre voix","conséquence","exemple"],"Votre voix compte, car les décisions qui concernent votre quotidien dépendent des élus. Beaucoup d'élections se jouent à quelques centaines de voix."),
    ]},
    { title: "Questions difficiles", titleEn: "Hard questions", kind: "role", focus: "Handling challenge, uncertainty, hedging", items: [
      V("An audience member stands up with a microphone","Vos chiffres datent de 2015. Pourquoi devrions-nous encore vous croire ?","Your figures date from 2015. Why should we still believe you?","Concede honestly and defend your conclusion.",["vous avez raison","cependant","données récentes"],"Vous avez raison de le souligner. Cependant, des données plus récentes confirment la même tendance, et je suis prêt à les partager.",25,55),
      V("A journalist at the front row raises a pen","Ne pensez-vous pas que vous minimisez le coût de cette réforme ?","Don't you think you're downplaying the cost of this reform?","Respond without being defensive.",["je comprends la question","ce que je dis","coût réel"],"Je comprends la question. Ce que je dis, c'est que le coût est réel mais étalé sur dix ans, et qu'il est compensé par les économies attendues.",25,55),
      V("A sceptical professor in the third row","Votre exemple est anecdotique. Avez-vous une preuve plus solide ?","Your example is anecdotal. Do you have stronger evidence?","Acknowledge the limit and cite broader evidence or admit uncertainty.",["effectivement","étude plus large","je ne peux pas affirmer"],"Effectivement, c'est un cas isolé. Une étude plus large va dans le même sens, mais je ne peux pas affirmer qu'elle soit définitive.",25,55),
      V("The moderator checks the clock","Il nous reste une minute. Quel est votre message principal ?","We have one minute left. What is your main message?","Deliver a crisp final message.",["message principal","raison","appel à l'action"],"Mon message est simple : agir maintenant coûte moins cher qu'attendre. Je vous invite à soutenir ce projet dès cette année.",20,55),
    ]},
    { title: "Adapter son registre", titleEn: "Adapting register", kind: "role", focus: "Formal vs informal, same content", items: [
      T("Annoncez à votre équipe, de façon décontractée, que le projet est reporté.","Tell your team informally that the project is postponed.","Informal, warm, clear.",["bon, les amis","reporté","on va"],"Bon, les amis, petite nouvelle : le projet est reporté d'un mois. Ça nous laisse du temps pour bien faire les choses, donc on va s'organiser tranquillement.",20,55),
      T("Annoncez la même nouvelle aux clients, dans un registre formel.","Announce the same news to clients in a formal register.","Formal, polite, structured.",["nous vous informons","nous vous prions de bien vouloir nous excuser","nouvelle date"],"Nous vous informons que le lancement est reporté au mois prochain. Nous vous prions de bien vouloir nous excuser pour ce désagrément et vous communiquerons la nouvelle date dans les meilleurs délais.",25,55),
      T("Présentez-vous à un jury de concours, puis à un nouvel ami lors d'une fête. Faites les deux.","Introduce yourself to a competition jury, then to a new friend at a party. Do both.","Show clear register contrast.",["au jury : formel","à l'ami : familier"],"Devant le jury : Je me présente, je suis ingénieur et je candidate au poste de chef de projet. À l'ami : Salut, moi c'est Marie, je bosse dans l'informatique, et toi ?",30,55),
      T("Refusez poliment une invitation de votre patron, puis la même d'un ami.","Politely refuse an invitation from your boss, then from a friend.","Two registers.",["patron : je vous remercie","ami : désolé"],"Au patron : Je vous remercie de l'invitation, mais je ne pourrai malheureusement pas me joindre à vous. À l'ami : Désolé, je ne peux pas venir ce soir, mais on se rattrape vite !",25,55),
    ]},
    { title: "Raconter avec impact", titleEn: "Storytelling", kind: "story", focus: "Narration with rhythm and effect", items: [
      T("Racontez un moment où tout a basculé dans votre vie.","Tell about a moment when everything changed in your life.","Tell with suspense, tenses and emotion.",["imparfait pour le décor","passé composé / passé simple pour l'événement","émotion"],"C'était un matin ordinaire. Je préparais mon café quand le téléphone a sonné. Au bout du fil, une voix m'a annoncé que j'avais obtenu la bourse. Je suis resté muet, incapable de réagir.",40,55),
      T("Racontez une rencontre inattendue qui vous a marqué.","Tell about an unexpected encounter that stayed with you.","Set the scene and the effect.",["cadre","rencontre","conséquence"],"Un jour, dans un train, une femme âgée m'a raconté sa vie. Elle parlait avec tant de douceur que j'ai oublié l'heure. Depuis, j'écoute les inconnus autrement.",40,55),
      T("Racontez l'histoire d'un échec dont vous êtes finalement fier.","Tell the story of a failure you are ultimately proud of.","Narrate and reflect.",["l'échec","ce que j'ai compris","aujourd'hui"],"J'ai raté mon premier examen important. Sur le moment, j'étais dévasté. Mais j'ai compris que je n'avais pas appris à bien m'organiser. Aujourd'hui, j'en suis presque reconnaissant.",40,55),
      T("Racontez un souvenir de voyage de façon à faire rire votre public.","Tell a travel memory in a way that makes the audience laugh.","Use timing and a punchline.",["mise en place","retournement","chute"],"À Lisbonne, j'ai suivi un panneau pendant une heure, fier de mon sens de l'orientation. J'ai fini devant mon hôtel... que j'avais quitté le matin.",35,55),
    ]},
    { title: "Synthèse orale", titleEn: "Oral synthesis", kind: "summary", focus: "Combining two sources", items: [
      T("Source un : Les cafés de quartier ferment peu à peu, remplacés par des chaînes. Source deux : Les habitants disent regretter ces lieux de rencontre, mais fréquentent surtout les chaînes. Faites une synthèse des deux sources.","Source one: neighbourhood cafés are gradually closing... Source two: residents say they miss them but mostly go to chains. Synthesise.","Combine both and conclude.",["la première source","la seconde","contradiction apparente"],"La première source constate la disparition des cafés de quartier au profit des chaînes. La seconde montre une contradiction apparente : les habitants regrettent ces cafés mais fréquentent surtout les chaînes. Cela suggère un écart entre valeurs affichées et comportements.",30,55),
      T("Source un : Les ventes de vélos électriques ont doublé en cinq ans. Source deux : Les accidents impliquant des vélos électriques augmentent aussi. Faites une synthèse.","Source one: e-bike sales doubled... Source two: accidents are also rising. Synthesise.","Link cause and effect with caution.",["d'une part","d'autre part","en conséquence"],"D'une part, le vélo électrique connaît un grand succès. D'autre part, les accidents augmentent, ce qui est probablement lié au nombre croissant d'utilisateurs. Des aménagements de sécurité semblent donc nécessaires.",30,55),
      T("Source un : Un rapport recommande de réduire la viande. Source deux : Des éleveurs expliquent que leur métier est menacé. Faites une synthèse équilibrée.","Source one: a report recommends cutting meat. Source two: farmers say their livelihoods are threatened. Balanced synthesis.","Present both fairly, then suggest a way forward.",["selon le rapport","selon les éleveurs","piste de compromis"],"Selon le rapport, réduire la viande est bon pour le climat. Selon les éleveurs, cette évolution menace leur métier. Une piste de compromis serait d'accompagner la transition par des aides.",30,55),
      T("Source un : Les jeunes lisent moins de livres. Source deux : Ils consomment plus d'audio et de podcasts. Faites une synthèse.","Source one: young people read fewer books. Source two: they consume more audio. Synthesise.","Nuance the claim.",["contrairement à ce qu'on pense","déplacement des usages","conclusion"],"La lecture de livres recule chez les jeunes, mais l'audio progresse fortement. On assiste plutôt à un déplacement des usages qu'à un désintérêt pour la culture.",30,55),
    ]}
  ],
  graduation: { title: "La conférence en trois temps", titleEn: "The talk in three parts", kind: "present", focus: "Introduction, development, conclusion, Q&A", items: [
    T("Partie 1 : Vous donnez une conférence sur « L'avenir du travail ». Faites l'introduction : accroche, problématique, plan.","Part 1: You give a talk on 'The future of work'. Introduce it: hook, question, plan.","Strong introduction.",["accroche","problématique","plan en trois parties"],"Imaginez un bureau sans murs, sans horaires fixes. Cette idée, autrefois utopique, est devenue réalité pour beaucoup. Comment le travail va-t-il évoluer ? Nous verrons d'abord les changements en cours, puis leurs risques, enfin les opportunités.",40,55),
    T("Partie 2 : Développez votre argument principal avec un exemple précis et une donnée chiffrée.","Part 2: Develop your main argument with a precise example and a figure.","Argument, example, figure.",["argument principal","exemple précis","chiffre"],"Le premier changement majeur est le télétravail. En France, près d'un salarié sur trois y recourt au moins un jour par semaine. Ce chiffre montre que le phénomène n'est plus marginal.",40,55),
    T("Partie 3 : Concluez en nuançant votre propos et en ouvrant une perspective.","Part 3: Conclude, nuancing and opening a perspective.","Conclusion with nuance.",["en résumé","nuance","perspective"],"En résumé, le travail change, sans doute durablement. Il faut toutefois rester vigilant face aux inégalités que cela peut créer. La vraie question sera de savoir qui profitera de ces nouveautés.",35,55),
    V("A member of the audience raises a hand","Vous parlez de liberté, mais n'est-ce pas aussi une pression supplémentaire pour les salariés ?","You talk about freedom, but isn't it extra pressure for employees?","Answer the objection with nuance.",["vous avez raison","cependant","condition"],"Vous avez raison, la disponibilité permanente est un risque réel. Cependant, avec des règles claires sur la déconnexion, la liberté peut rester un avantage.",30,55),
  ]}
});
})();
(function(){ var B = TK_BUILD, A = B.A, V = B.V, I = B.I;
function T(q,en,task,must,sample,min,max){ return A(q,en,task,must,sample,min||35,max||55); }
TK_LEVEL({
  id: "C2", cefr: "C2", place: "Le Grand Salon", placeEn: "The Grand Salon",
  tagline: "Nuancer, persuader, improviser - Nuance, persuade, improvise",
  sceneImage: { icon: "🏛️", description: "An elegant Parisian salon with chandeliers, tall windows, velvet chairs and guests in conversation" },
  summary: "The learner expresses themselves spontaneously, very fluently and precisely, differentiating fine shades of meaning, even in the most complex situations.",
  canDo: [
    "Grasp and play with implicit meaning, irony and humour",
    "Use idioms and figurative language accurately",
    "Persuade, mediate and speak in public with rhetorical skill",
    "Switch register and perspective effortlessly",
    "Improvise on any topic with structure and wit",
    "Converse with experts at a high conceptual level"
  ],
  focus: "Rhetoric, irony, idioms, fine lexical nuance, complex syntax, register mastery, spontaneity",
  pass: 76, leniency: 0, gradPass: 81, defMin: 35, defMax: 55,
  graduationMeans: "You can take part in a high-level debate: argue, rebut, mediate and conclude with elegance, precision and natural flow.",
  games: [
    { title: "Sous-entendus", titleEn: "Implicit meaning", kind: "describe", focus: "Reading between the lines", items: [
      V("A dinner scene; a guest looks at their watch","« Ce dîner était... original. » Que veut dire cette personne, et comment répondre ?","'This dinner was... original.' What does this person mean, and how do you answer?","Interpret the implicit meaning and reply with tact.",["sous-entend","ton","réponse diplomatique"],"Cette personne sous-entend que le dîner ne lui a pas plu, malgré le mot poli. Je répondrais avec humour : « Je prends cela comme un compliment, et je ferai mieux la prochaine fois. »"),
      V("A manager smiles tightly","« Je ne dis pas que c'est mal, mais j'aurais fait autrement. » Qu'entendez-vous là ?","'I'm not saying it's wrong, but I'd have done it differently.' What do you hear?","Decode and respond.",["critique voilée","reformulation","demande de précision"],"C'est une critique voilée : il juge probablement mon travail insuffisant. Je lui demanderais poliment de préciser ce qu'il aurait changé."),
      T("Quelqu'un vous dit : « Tu es bien courageux de porter ça. » Analysez le message.","Someone says 'You're brave to wear that.' Analyse the message.","Unpack the irony.",["ironie","double sens","réaction"],"Sous couvert d'un compliment, la remarque exprime un doute sur ma tenue. Je réagirais avec légèreté pour ne pas envenimer l'échange."),
      T("« Il fait un temps magnifique », dit-on en pleine tempête. Que se passe-t-il dans cette phrase ?","'Lovely weather,' someone says in a storm. What is going on in that sentence?","Explain antiphrasis.",["antiphrase","ironie","effet"],"C'est une antiphrase : on dit le contraire de ce qu'on pense, pour créer de l'humour ou de la complicité."),
    ]},
    { title: "Expressions imagées", titleEn: "Idioms", kind: "describe", focus: "Using idioms precisely", items: [
      T("Utilisez l'expression « avoir le cafard » dans une courte histoire.","Use 'avoir le cafard' in a short story.","Use naturally and explain implicitly.",["avoir le cafard","contexte","dénouement"],"Lundi dernier, j'avais le cafard : la pluie, le travail, tout me pesait. Heureusement, un ami m'a appelé et m'a redonné le sourire."),
      T("Expliquez et utilisez l'expression « mettre les pieds dans le plat ».","Explain and use 'mettre les pieds dans le plat'.","Explain and give an example.",["définition","exemple","nuance"],"Mettre les pieds dans le plat, c'est aborder sans précaution un sujet délicat. Hier, j'ai demandé son salaire à ma voisine : j'ai vraiment mis les pieds dans le plat."),
      T("Racontez une journée stressante en utilisant trois expressions imagées.","Tell about a stressful day using three idioms.","Use three idioms correctly.",["trois expressions","cohérence","fluidité"],"Ce matin, j'avais le trac avant ma réunion. En arrivant, j'ai dû faire face à un client qui voulait tout, tout de suite : j'étais sur les nerfs. Heureusement, j'ai gardé mon sang-froid."),
      T("Défendez ou critiquez le proverbe « Mieux vaut tard que jamais ».","Defend or criticise 'Better late than never'.","Argue using the proverb.",["position","exemples","nuance"],"Ce proverbe est juste dans l'ensemble : mieux vaut se lancer tard que renoncer. Mais il ne doit pas servir d'excuse à la procrastination."),
    ]},
    { title: "Persuader", titleEn: "Persuading", kind: "opinion", focus: "Rhetoric and emotional appeal", items: [
      T("Convainquez un ami hésitant de s'inscrire à un marathon.","Convince a hesitant friend to sign up for a marathon.","Use appeal, emotion and counter-objections.",["objection anticipée","émotion","appel"],"Je sais que tu doutes de tes capacités. Mais pense à la fierté de franchir la ligne ! Je m'entraînerai avec toi, et je te promets que tu en sortiras plus fort."),
      T("Convainquez un conseil municipal de financer une bibliothèque de quartier.","Convince a city council to fund a neighbourhood library.","Formal rhetoric.",["mesdames et messieurs","arguments","engagement"],"Mesdames et messieurs les conseillers, une bibliothèque n'est pas une dépense, c'est un investissement dans notre avenir commun. Elle offre à chacun un accès égal au savoir."),
      T("Convainquez un investisseur sceptique de soutenir votre projet.","Convince a sceptical investor to back your project.","Pitch with confidence.",["problème","solution","bénéfice"],"Chaque année, des millions de personnes perdent du temps dans des démarches inutiles. Notre solution simplifie tout, en trois clics. Vous investiriez dans un marché en pleine expansion."),
      T("Persuadez un public de changer une habitude du quotidien.","Persuade an audience to change a daily habit.","Inspiring call to action.",["image forte","argument","appel à l'action"],"Imaginez gagner une heure chaque jour. Il suffit de poser votre téléphone une heure avant de dormir. Essayez une semaine : vous verrez la différence."),
    ]},
    { title: "Médiation", titleEn: "Mediation", kind: "mediate", focus: "Reconciling positions", items: [
      V("Two neighbours argue about noise","Il fait trop de bruit ! — Elle exagère, je joue à peine une heure !","'He makes too much noise!' - 'She's exaggerating, I barely play an hour!'","Mediate: restate both sides and propose a compromise.",["reformulation","empathie","compromis"],"Si je comprends bien, l'un souffre du bruit et l'autre a besoin de pratiquer. Que diriez-vous de fixer des horaires précis, en dehors du repos de chacun ?"),
      V("Two colleagues disagree on a deadline","Il faut finir vendredi. — Impossible, il manque des données.","'We must finish Friday.' - 'Impossible, data is missing.'","Mediate between urgency and quality.",["reconnaître","clarifier","proposition"],"Vous avez tous deux raison sur le fond : l'un défend le calendrier, l'autre la qualité. Je propose de livrer vendredi une version provisoire, puis la version finale lundi."),
      T("Deux amis se disputent pour une histoire d'argent prêté. Intervenez.","Two friends argue about a loan. Step in.","Calm, neutral, constructive.",["calme","faits","solution"],"Prenons un instant. Rappelons les faits : la somme, la date, ce qui était convenu. Puis voyons un plan de remboursement qui convienne aux deux."),
      T("Expliquez à un parent et à son adolescent pourquoi chacun a raison à sa façon.","Explain to a parent and teen why each is right in their own way.","Empathy for both.",["point de vue du parent","point de vue de l'ado","terrain d'entente"],"Le parent veut protéger, l'adolescent veut gagner en autonomie. Ces deux besoins sont légitimes. Un terrain d'entente serait de définir ensemble des règles évolutives."),
    ]},
    { title: "Humour et ironie", titleEn: "Humour and irony", kind: "story", focus: "Wit and understatement", items: [
      T("Racontez une mésaventure du quotidien avec autodérision.","Tell an everyday mishap with self-mockery.","Humour, timing, understatement.",["autodérision","rythme","chute"],"Hier, j'ai passé vingt minutes à chercher mes lunettes... qui étaient sur mon nez. Mon sens de l'observation est légendaire."),
      T("Faites un éloge ironique du lundi matin.","Give an ironic praise of Monday morning.","Irony sustained.",["éloge exagéré","ironie","chute"],"Le lundi matin est le moment le plus doux de la semaine : le réveil chante, le café refroidit et les emails se multiplient comme par magie."),
      T("Décrivez un embouteillage comme un grand spectacle.","Describe a traffic jam like a grand show.","Comic exaggeration.",["métaphore","exagération","chute"],"Devant moi, un ballet de voitures immobiles. Les klaxons jouent la symphonie du matin, et chaque conducteur improvise son rôle de héros du bitume."),
      T("Répondez avec humour à : « Tu as encore oublié mon anniversaire ? »","Reply with humour to 'Did you forget my birthday again?'","Light touch, charm.",["humour","excuse drôle","réparation"],"Moi ? Jamais ! J'ai simplement décidé d'en faire une surprise, avec un léger retard... d'un an."),
    ]},
    { title: "Discours", titleEn: "Speeches", kind: "present", focus: "Formal occasions", items: [
      T("Prononcez un discours d'hommage à un collègue qui part à la retraite.","Give a tribute speech to a retiring colleague.","Warm, structured, emotional.",["souvenirs","qualités","souhaits"],"Cher Paul, pendant trente ans, tu as été le cœur de cette équipe. Nous garderons le souvenir de ta générosité et de ton humour. Nous te souhaitons une retraite à la hauteur de ton talent."),
      T("Prononcez un discours de remerciement pour un prix.","Give an acceptance speech for an award.","Gratitude with grace.",["remerciements","modestie","dédicace"],"Je suis profondément touché par cette distinction. Je la dois à mon équipe, à mes proches, et à tous ceux qui ont cru en moi. Merci du fond du cœur."),
      T("Prononcez un discours de bienvenue pour l'ouverture d'un festival.","Give a welcome speech to open a festival.","Energy, welcome, programme.",["bienvenue","programme","ouverture"],"Bienvenue à toutes et à tous ! Pendant trois jours, la musique, le cinéma et les rencontres vont animer notre ville. Que la fête commence !"),
      T("Prononcez un toast pour le mariage de deux amis.","Give a wedding toast for two friends.","Affectionate and witty.",["anecdote","vœux","toast"],"Je me souviens du jour où vous vous êtes rencontrés : vous ne vous supportiez pas. Aujourd'hui, vous voilà unis ! Levons nos verres à votre bonheur."),
    ]},
    { title: "Avocat du diable", titleEn: "Devil's advocate", kind: "debate", focus: "Defending a view you don't hold", items: [
      T("Défendez la thèse : « Il faudrait supprimer les notes à l'école. »","Defend: 'Marks should be abolished at school.'","Argue convincingly, even if you disagree.",["thèse","arguments","conclusion"],"Les notes réduisent l'apprentissage à une compétition. Supprimons-les et nous verrons les élèves apprendre pour comprendre, non pour obtenir un chiffre."),
      T("Défendez la thèse : « Le silence vaut mieux que la parole. »","Defend: 'Silence is better than speech.'","Philosophical and persuasive.",["thèse","exemples","nuance"],"La parole peut blesser, tromper, encombrer. Le silence, lui, laisse place à l'écoute et à la réflexion. Il faut parfois savoir se taire pour être entendu."),
      T("Défendez la thèse : « Il est préférable de ne pas avoir trop de choix. »","Defend: 'It is better not to have too many choices.'","Argue paradox.",["paradoxe","exemples","conclusion"],"Trop de choix paralyse. Devant cent produits, on hésite et on regrette. Limiter les options, c'est se libérer."),
      T("Défendez la thèse : « La lenteur est une qualité. »","Defend: 'Slowness is a virtue.'","Elegant argument.",["thèse","images","conclusion"],"Dans un monde pressé, la lenteur est un acte de résistance. Elle permet de goûter, de comprendre, de créer avec soin."),
    ]},
    { title: "Changer de registre", titleEn: "Register shifts", kind: "role", focus: "Instant adaptation", items: [
      T("Expliquez la même panne d'ordinateur : à votre grand-mère, à un technicien, puis à votre patron.","Explain the same computer failure: to your grandmother, a technician, then your boss.","Three registers, same content.",["grand-mère : simple","technicien : technique","patron : formel"],"À ma grand-mère : l'ordinateur ne veut plus s'allumer. Au technicien : l'alimentation semble défaillante. À mon patron : je vous informe d'une panne, résolue d'ici demain.",40,55),
      T("Dites « je ne suis pas d'accord » de cinq façons différentes, du familier au solennel.","Say 'I disagree' in five different ways, from casual to solemn.","Five registers.",["familier","courant","soutenu","solennel","variété"],"Pas d'accord, là. Je ne suis pas de cet avis. Permettez-moi de différer. Je me permets de ne pas partager votre point de vue. Je m'inscris en faux contre cette thèse.",30,55),
      T("Décrivez un repas délicieux comme un critique gastronomique, puis comme un enfant.","Describe a delicious meal as a food critic, then as a child.","Two voices.",["critique : vocabulaire riche","enfant : simple"],"Le critique : une sauce veloutée, d'une belle onctuosité. L'enfant : c'est trop bon, j'en veux encore !",30,55),
      T("Présentez une mauvaise nouvelle de façon douce, puis brutale.","Present bad news softly, then bluntly.","Two registers of delivery.",["douceur","franchise"],"Doucement : Je dois vous annoncer quelque chose de difficile. Brutalement : Le projet est annulé.",25,55),
    ]},
    { title: "Improviser", titleEn: "Impromptu", kind: "opinion", focus: "Speaking with no preparation", items: [
      T("Parlez pendant une minute sur le thème : « La mémoire ».","Speak for one minute on: 'Memory'.","Structured improvisation.",["accroche","développement","chute"],"La mémoire, c'est ce qui fait de nous des êtres cohérents. Sans elle, pas d'histoire, pas d'identité. Pourtant, elle trahit souvent : nous recréons nos souvenirs à chaque fois que nous les évoquons.",40,55),
      T("Improvisez sur : « Le courage au quotidien ».","Improvise on: 'Everyday courage'.","Concrete and elevated.",["exemple","réflexion","conclusion"],"Le courage au quotidien, ce n'est pas toujours spectaculaire. C'est dire non, demander de l'aide, recommencer après un échec.",40,55),
      T("Improvisez sur : « Une ville sans voitures ».","Improvise on: 'A city without cars'.","Imaginative.",["vision","avantages","limites"],"Imaginez le silence, les enfants qui jouent dans la rue, l'air plus pur. Bien sûr, il faudrait repenser les livraisons, mais la vie y gagnerait.",40,55),
      T("Improvisez sur : « Le dernier objet que j'emporterais sur une île déserte ».","Improvise on: 'The last object I'd take to a desert island'.","Creative reasoning.",["choix","raisons","image"],"J'emporterais un carnet. Pour écrire, pour compter les jours, pour garder une trace de ma pensée quand tout le reste aurait disparu.",40,55),
    ]},
    { title: "Dialogue d'experts", titleEn: "Expert dialogue", kind: "role", focus: "Abstract, specialised discussion", items: [
      V("A panel of two economists","Selon vous, la croissance est-elle compatible avec la sobriété écologique ?","In your view, is growth compatible with ecological restraint?","Take a nuanced stand with concepts.",["distinguer","découplage","position nuancée"],"Il convient de distinguer croissance et prospérité. Le découplage entre production et émissions est possible, mais incomplet pour l'instant. Je reste donc prudemment optimiste.",40,55),
      V("A philosopher on a stage","La liberté individuelle justifie-t-elle de nuire à la collectivité ?","Does individual freedom justify harming the community?","Argue philosophically.",["thèse","distinction","exemple"],"La liberté de chacun s'arrête là où commence celle des autres. Toute liberté suppose donc des limites partagées.",40,55),
      V("A scientist at a podium","La science peut-elle trancher les questions morales ?","Can science settle moral questions?","Careful, conceptual reply.",["fait / valeur","limites","conclusion"],"La science éclaire les faits, mais ne dit pas ce que nous devons faire. Elle informe la morale sans la remplacer.",40,55),
      V("A journalist concluding an interview","Si vous deviez résumer votre pensée en une phrase ?","If you had to sum up your thinking in one sentence?","Deliver a crisp, quotable line.",["formule","élégance","sens"],"Comprendre avant de juger, et agir avant qu'il ne soit trop tard.",20,55),
    ]}
  ],
  graduation: { title: "Le Grand Débat", titleEn: "The Great Debate", kind: "debate", focus: "Argue, rebut, mediate, conclude", items: [
    T("Ouverture : Vous débattez de la question « Faut-il limiter l'intelligence artificielle ? ». Présentez votre position avec élégance.","Opening: You debate 'Should AI be limited?'. Present your position elegantly.","Strong opening.",["thèse","image forte","annonce"],"Mesdames et messieurs, l'intelligence artificielle est un feu : elle éclaire et elle brûle. Je soutiens qu'il faut l'encadrer, non par peur, mais par lucidité.",40,55),
    V("Your opponent smiles","Vous avez peur du progrès. Chaque révolution technique a suscité les mêmes craintes.","You fear progress. Every technical revolution raised the same fears.","Rebut with wit and precision.",["concession","contre-exemple","retournement"],"Certes, les craintes se répètent, mais l'histoire montre aussi que sans règles, le progrès profite à quelques-uns. Encadrer, ce n'est pas freiner : c'est partager.",35,55),
    V("The moderator intervenes","Pouvez-vous reformuler le point de vue de votre adversaire de façon équitable ?","Can you restate your opponent's view fairly?","Mediate: restate fairly, find common ground.",["reformulation fidèle","point commun","dépassement"],"Mon adversaire estime que l'innovation doit rester libre pour bénéficier à tous. Nous partageons l'objectif de progrès. Reste à débattre des moyens.",35,55),
    T("Conclusion : Concluez le débat avec une phrase d'ouverture et une formule marquante.","Conclusion: Conclude the debate with an opening line and a memorable closing phrase.","Elegant, memorable.",["synthèse","ouverture","formule"],"En somme, la vraie question n'est pas de savoir si la machine peut penser, mais si nous saurons rester maîtres de nos choix. À nous d'y veiller.",30,55),
  ]}
});
})();
