/* La Pause: the four hubs and their activities. One registry, so new activities need no rebuild:
   add an entry here (and set built:true once its engine exists). Audio paths come from LP.audioPath(). */
window.LP_DATA = {
  name: { fr: "La Pause", en: "The Break", folder: "invitation", prefix: "invitation" },
  hubs: [
    {
      id: "shopping", folder: "shopping", fr: "Le Centre commercial", en: "The Shopping Mall",
      tone: { a: "#c0476b", b: "#7d2347" }, emblem: "bag",
      activities: [
        { id: "fashion", engine: "explore",     fr: "La Boutique de vêtements", en: "Fashion Boutique", emblem: "hanger" },
        { id: "supermarket", engine: "explore", fr: "Le Supermarché",           en: "Supermarket",      emblem: "cart" },
        { id: "salon", engine: "explore",       fr: "Le Salon de coiffure",     en: "Hair Salon",       emblem: "scissors" },
        { id: "beauty", engine: "explore",      fr: "Le Magasin de beauté",     en: "Beauty Store",     emblem: "lipstick" }
      ]
    },
    {
      id: "engineering", folder: "engineering", fr: "Le Centre d'ingénierie", en: "The Engineering Centre",
      tone: { a: "#d98a2b", b: "#8f4f10" }, emblem: "gear",
      activities: [
        { id: "car", engine: "build",          fr: "L'Atelier automobile",  en: "Car Assembly",      emblem: "car" },
        { id: "construction", engine: "build", fr: "La Construction",       en: "House Construction", emblem: "brick" },
        { id: "bridges", engine: "build",      fr: "Le Laboratoire des ponts", en: "Bridge Laboratory", emblem: "bridge" },
        { id: "robotics", engine: "build",     fr: "L'Atelier de robotique", en: "Robotics Workshop", emblem: "robot" },
        { id: "inventions", engine: "build",   fr: "Les Inventions",        en: "Creative Inventions", emblem: "bulb" }
      ]
    },
    {
      id: "home-garden", folder: "home-garden", fr: "La Maison et le Jardin", en: "Home & Garden",
      tone: { a: "#3f9a63", b: "#1f5d3a" }, emblem: "house",
      activities: [
        { id: "interior", engine: "build", fr: "La Décoration intérieure",  en: "Interior Design",  emblem: "sofa" },
        { id: "garden", engine: "build",   fr: "Le Jardinage",              en: "Gardening",        emblem: "flower" },
        { id: "house", engine: "explore",    fr: "L'Entretien de la maison",  en: "Housekeeping",     emblem: "broom" },
        { id: "outdoor", engine: "build",  fr: "L'Aménagement extérieur",   en: "Outdoor Design",   emblem: "bench" }
      ]
    },
    {
      id: "mind-games", folder: "mind-games", fr: "Le Centre des jeux d'esprit", en: "The Mind Games Centre",
      tone: { a: "#5a63c9", b: "#2f3586" }, emblem: "puzzle",
      activities: [
        { id: "puzzles", engine: "jigsaw", fr: "Les Puzzles",       en: "Jigsaw Puzzles", emblem: "puzzle" },
        { id: "memory", engine: "memory",  fr: "Jeux de mémoire",   en: "Memory Games",   emblem: "cards" },
        { id: "words", engine: "words",   fr: "Jeux de mots",      en: "Word Games",     emblem: "letters" },
        { id: "logic", engine: "pattern",   fr: "Jeux de logique",   en: "Logic Puzzles",  emblem: "grid" }
      ]
    }
  ]
};
