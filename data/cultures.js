// cultures.js - Fixed to use CommonJS exports
const cultureSpeciesMap = {
  "Thaumavori": { Human: 90, Other: 10 },
  "Hetallian": { Human: 85, Other: 15 },
  "Dwarves": { Dwarf: 80, Human: 15, Other: 5 },
  "Eldar": { Elf: 85, Human: 10, Other: 5 },
  "Uruk": { Orc: 60, Goblin: 25, Other: 15 },
  "Soultorn": { Undead: 60, Human: 30, Other: 10 },
  "Skiptondo": { Human: 85, Other: 15 },
  "Sunstalker": { Human: 60, "Half-Orc": 20, Other: 20 },
  "Shadow Elves": { "Shadar-Kai": 80, Drow: 10, Other: 10 },
  "Gines": { Human: 80, Other: 20 },
  "Kleard": { Goblin: 85, Other: 15 },
  "Yotunn": { Giant: 70, Dwarf: 20, Other: 10 },
  "Wildlands": { Human: 80, Halfling: 10, Other: 10 },
  "Rakhnid": { Rakhnid: 90, Other: 10 },
  "Drake": { Dragon: 10, Dragonborn: 60, Human: 20, Other: 10 },
  "Aj'Snaga": { "Yuan-ti": 90, Other: 10 },
  "Halfling": { Halfling: 95, Other: 5 },
  "Harengone": { Harengon: 80, Human: 15, Other: 5 },
  "Berberan": { Human: 85, Other: 15 },
  "Nortumbic": { Human: 90, Other: 10 }
};

const cultureSummaryMap = {
  "Thaumavori": "arcane-governed societies ranging from magocratic city-states to feudal kingdoms; shaped by guild law, magical hierarchy, and courtly traditions",
  "Hetallian": "independent coastal and inland city-states scattered across storm-swept forests and open wilds, shaped by ancestor cults, frontier pragmatism, and weatherworn stone traditions",
  "Dwarves": "mountain-forged society valuing craftsmanship, kin, and stoic tradition",
  "Eldar": "elegant elven society governed by ancient wisdom and arcane mastery",
  "Uruk": "brutal and honor-driven clans ruled by strength and fear",
  "Soultorn": "grim, introspective society shaped by lost faiths and arcane ruins, lich-ruled or haunted by restless spirits",
  "Skiptondo": "naval merchant republics with strong traditions of loyalty and exploration, pirate havens",
  "Sunstalker": "nomadic hunter-warrior culture surviving through adaptability and ferocity",
  "Shadow Elves": "secretive, hierarchical society with deep reverence for shadow and magic",
  "Gines": "cosmopolitan and cultured with an emphasis on refinement and artistry, france inspired",
  "Kleard": "scrappy, resourceful goblin societies thriving in marginal lands and ruins",
  "Jotunn": "clan-driven land of the giants — isolated strongholds of elemental crafters and raiders, hardened by cold, stone, and ancestral oaths passed through booming oral traditions",
  "Wildlands": "tribal and druidic communities steeped in song, stone, and seasonal rites",
  "Rakhnid": "ritual-bound, matriarchal web-cults that guard secrets in shadowed places",
  "Drake": "reverent of ancient wyrms and strength, with social castes tied to lineage",
  "Aj'Snaga": "scheming, serpentine cults driven by prophecy, purity, and psionics",
  "Halfling": "pastoral halfling shires rooted in tradition, comfort, and superstition",
  "Harengone": "plains-running harengon societies that prize freedom, wit, and folklore",
  "Berberan": "desert-dwelling traders and scouts shaped by wind, memory, and oaths",
  "Nortumbic": "village-based kin-networks that value personal honor, farming, and relics"
};

const cultureMap = {
  "Thaumavori": { type: "Generic", namebase: "German" },
  "Hetallian": { type: "Generic", namebase: "Hetallian" },
  "Dwarves": { type: "Highland", namebase: "Dwarven" },
  "Eldar": { type: "Generic", namebase: "Sindarin" },
  "Uruk": { type: "Highland", namebase: "Black Speech" },
  "Soultorn": { type: "Generic", namebase: "Gothic-Fantasy" },
  "Skiptondo": { type: "Naval", namebase: "Castillian" },
  "Sunstalker": { type: "Hunting", namebase: "Mongolian" },
  "Shadow Elves": { type: "Hunting", namebase: "Dark Elven" },
  "Gines": { type: "Generic", namebase: "French" },
  "Kleard": { type: "Highland", namebase: "Goblin" },
  "Jotunn": { type: "Generic", namebase: "Nordic" },
  "Wildlands": { type: "", namebase: "Celtic" },
  "Rakhnid": { type: "Hunting", namebase: "Arachnid" },
  "Drake": { type: "Hunting", namebase: "Draconic" },
  "Aj'Snaga": { type: "Generic", namebase: "Serpents" },
  "Halfling": { type: "Generic", namebase: "Old English" },
  "Harengone": { type: "Generic", namebase: "Hungarian" },
  "Berberan": { type: "Hunting", namebase: "Berber" },
  "Nortumbic": { type: "River", namebase: "Saxon" }
};

const religions = {
  "Uruk Spirits": [
    { name: "Gruumsh", domain: "War", tone: "Demonic and brutal" },
    { name: "Ilneval", domain: "War", tone: "Strategic" },
    { name: "Bahgtru", domain: "Strength and Endurance", tone: "brutal and feral" },
    { name: "Luthic", domain: "Caves and Fertility", tone: "mysterious and nurturing" },
    { name: "Shargaas", domain: "Stealth and Darkness", tone: "sly and cunning" },
    { name: "Huln", domain: "Honor and Loyalty", tone: "noble and steadfast" },
    { name: "Yurtrus", domain: "Death and Disease", tone: "grim and unsettling" }
  ],
  "Sylthera": [
    { name: "Dendar", domain: "Nightmares and Darkness", tone: "ominous and unsettling" },
    { name: "Merrshaulk", domain: "Serpents and Poison", tone: "venomous and cunning" },
    { name: "Sseth", domain: "Deception and Betrayal", tone: "sly and manipulative" },
    { name: "Zehir", domain: "Venom and Shadows", tone: "dark and insidious" },
    { name: "Sshar", domain: "Wisdom and Prophecy", tone: "mysterious and insightful" },
    { name: "Zephyra", domain: "Wind and Freedom", tone: "free-spirited and airy" }
  ],
  "Jotun": [
    { name: "Annam", domain: "Giants and Strength", tone: "colossal and powerful" },
    { name: "Thrym", domain: "Frost and Storms", tone: "cold and tempestuous" },
    { name: "Skadi", domain: "Hunting and Winter", tone: "fierce and resilient" },
    { name: "Grolantor", domain: "Earth and Mountains", tone: "solid and enduring" },
    { name: "Hiatea", domain: "Nature and Fertility", tone: "nurturing and bountiful" }
  ],
  "Forgotton Ones": [
    { name: "Aurelith", domain: "Nature (Twisted), Trickery", tone: "Goddess of strangling growth, obsessive devotion, and fey-warped fertility" },
    { name: "Dovaros", domain: "Entropy, Light (Corrupted)", tone: "A primordial force of creation-through-destruction, fire that consumes both end and beginning" },
    { name: "Varrek", domain: "Knowledge, Madness, Time", tone: "An ancient deity who dwells in buried echoes of stone and thought. Said to listen longer than the world has lived" }
  ],
  "Skiptondo Religion": [
    { name: "The Sea Mother", domain: "Ocean and Storms", tone: "vast and unpredictable" },
    { name: "The Storm Lord", domain: "Tempests and Thunder", tone: "fierce and commanding" },
    { name: "The Navigator", domain: "Guidance and Exploration", tone: "wise and adventurous" }
  ],
  "Drake Ancestors": [
    { name: "Tiamat", domain: "Greed and Destruction", tone: "arrogant, greedy, hateful, spiteful and vain" },
    { name: "Bahamut", domain: "Justice and Protection", tone: "noble and protective" },
    { name: "Aasterinian", domain: "Discovery and Innovation", tone: "curious and inventive" },
    { name: "Chronepsis", domain: "Fate and Prophecy", tone: "mysterious and foreboding" }
  ],
  "Shadowfell Beliefs": [
    { name: "Raven Queen", domain: "Death and Fate", tone: "mysterious and somber" },
    { name: "Shar", domain: "Darkness and Loss", tone: "shadowy and manipulative" },
    { name: "Bethilda", domain: "Dreams and Nightmares", tone: "haunting and elusive" },
  ],
  "Dwarf domain": [
    { name: "Moradin", domain: "Creation and Craftsmanship", tone: "stoic and industrious" },
    { name: "Berronar Truesilver", domain: "Family and Community", tone: "nurturing and protective" },
    { name: "Clangeddin Silverbeard", domain: "War and Honor", tone: "fierce and valiant" },
    { name: "Dumathoin", domain: "Secrets and Mining", tone: "silent and watchful" },
    { name: "Thard Harr", domain: "Nature and Sea", tone: "wild and untamed" }
  ],
  "Elladan Spirits": [
    { name: "Sylavien", domain: "Mist and Memory", tone: "whispering and melancholic" },
    { name: "Elaruith", domain: "Starlight and Cycles", tone: "serene and contemplative" },
    { name: "Tharathil", domain: "Roots and Secrets", tone: "ancient and introspective" },
    { name: "Nimaenya", domain: "Frost and Silence", tone: "distant and watchful" },
    { name: "Velessae", domain: "Bloom and Decay", tone: "gentle and inevitable" }
  ],
  "Hetallian Beliefs": [
    { name: "Gran Kòk", domain: "Storms and Defiance", tone: "boisterous and unyielding" },
    { name: "Maman Zèb", domain: "Fertility and Wild Growth", tone: "earthy and vibrant" },
    { name: "Ti Flanm", domain: "Fire and Ancestral Rage", tone: "fierce and righteous" },
    { name: "Papa Limyè", domain: "Guidance and Thresholds", tone: "mysterious and illuminating" },
    { name: "Sirèn Nwa", domain: "Depths and Temptation", tone: "seductive and dangerous" }
  ],
  "Rakhnid Ancestors": [
    { name: "Szezsad", domain: "Inheritance and Secrets", tone: "The Supernatural Protector" },
    { name: "Zyzzix", domain: "Webs and Fate", tone: "weaving and intricate" },
    { name: "Klythra", domain: "Hunting and Survival", tone: "predatory and cunning" },
    { name: "Arachne", domain: "Craftsmanship and Artistry", tone: "creative and meticulous" }
  ],
  "Seldarine": [
    { name: "Corellon Larethian", domain: "Magic and Art", tone: "elegant and creative" },
    { name: "Sehanine Moonbow", domain: "Dreams and Illusions", tone: "mysterious and ethereal" },
    { name: "Lolth", domain: "Spiders and Deception", tone: "dark and manipulative" },
    { name: "Eilistraee", domain: "Light and Freedom", tone: "hopeful and liberating" },
    { name: "Vhaeraun", domain: "Shadow and Intrigue", tone: "cunning and elusive" }
  ],
  "Westen Druidism": [
    { name: "Wester", domain: "Growth and Mist", tone: "calm and sprawling" },
    { name: "Eldara", domain: "Stars and Memory", tone: "haunting and distant" },
    { name: "Thalor", domain: "Roots and Secrets", tone: "ancient and introspective" },
    { name: "Nimue", domain: "Frost and Silence", tone: "distant and watchful" },
    { name: "Velessae", domain: "Bloom and Decay", tone: "gentle and inevitable" }
  ],
  "Wild Spirits": [
    { name: "The Wild Hunt", domain: "Nature and Beasts", tone: "untamed and primal" },
    { name: "The Great Stag", domain: "Forests and Fertility", tone: "majestic and nurturing" },
    { name: "The Storm Crow", domain: "Sky and Change", tone: "swift and unpredictable" },
    { name: "The Earth Mother", domain: "Mountains and Stability", tone: "solid and enduring" }
  ],
  "Wlasadian Church": [
    { name: "Wlasar", domain: "Order and Revelation", tone: "orthodox and solemn" },
    { name: "The Divine Light", domain: "Purity and Justice", tone: "radiant and unwavering" },
    { name: "The Sacred Flame", domain: "Fire and Renewal", tone: "cleansing and transformative" },
    { name: "The Eternal Watcher", domain: "Time and Fate", tone: "patient and omniscient" }
  ],
  "The Divine Triad": [
    { name: "Solenné", domain: "Light, Order, War", tone: "radiant goddess of justice, sacred order, and righteous warfare" },
    { name: "Solenné", domain: "Nature, Life", tone: "gentle, Warm, Patient" },
    { name: "Véridien", domain: "Arcana, Knowledge", tone: "Wise, curiosity tempered by responsibility" }
  ],
  "No religion": [
    { name: "No deity", domain: "None", tone: "secular and civic" }
  ]
};

function getCulturalSummary(settlement) {
  const culture = (settlement.Culture || settlement.culture || '').trim();
  return cultureSummaryMap[culture] || "a diverse cultural mix with localized traditions";
}

function getSpeciesBreakdown(settlement) {
  const culture = (settlement.Culture || settlement.culture || '').trim();
  return cultureSpeciesMap[culture] || { Human: 70, Other: 30 }; // fallback
}

function getCulturalFlavor(settlement) {
  const culture = (settlement.Culture || settlement.culture || '').trim();
  return {
    species: cultureSpeciesMap[culture] || { Human: 70, Other: 30 },
    summary: cultureSummaryMap[culture] || "a diverse cultural mix shaped by regional needs and ancient memory"
  };
}

// CHANGED: Use CommonJS exports instead of ES6 exports
module.exports = {
  cultureSpeciesMap,
  cultureSummaryMap,
  cultureMap,
  religions,
  getCulturalSummary,
  getSpeciesBreakdown,
  getCulturalFlavor
};