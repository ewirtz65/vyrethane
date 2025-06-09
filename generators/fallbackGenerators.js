// fallbackGenerators.js - Fallback content generation when LLM fails

const { cultureMap } = require('../data/cultures.js');

// Cultural name generation function
function generateCulturalName(namebase) {
  const namePatterns = {
    "German": {
      prefixes: ["Ada", "Bern", "Ger", "Hil", "Kar", "Ott", "Ric", "Wil"],
      suffixes: ["bert", "hard", "mund", "wig", "helm", "fried", "mar", "win"]
    },
    "Hetallian": {
      prefixes: ["Anto", "Bene", "Cla", "Domi", "Este", "Fabr", "Giu", "Luc"],
      suffixes: ["io", "ano", "etto", "ino", "ardo", "enzo", "aldo", "esco"]
    },
    "Dwarven": {
      prefixes: ["Bard", "Dur", "Grim", "Kor", "Mor", "Nor", "Ors", "Thar"],
      suffixes: ["in", "ek", "ok", "un", "ar", "or", "an", "en"]
    },
    "Sindarin": {
      prefixes: ["Ael", "Ara", "Bel", "Cel", "Del", "Esh", "Fal", "Gal"],
      suffixes: ["andra", "enth", "iel", "ith", "wyn", "eth", "ael", "orn"]
    },
    "Black Speech": {
      prefixes: ["Grak", "Urk", "Shar", "Goth", "Morg", "Bul", "Ghor", "Tusk"],
      suffixes: ["ash", "ugh", "arg", "ork", "ush", "ang", "oth", "urg"]
    },
    "Gothic-Fantasy": {
      prefixes: ["Ala", "Blas", "Cas", "Dra", "Eva", "Flo", "Grim", "Hec"],
      suffixes: ["ric", "ius", "ana", "oth", "eon", "iel", "wyn", "ash"]
    },
    "Castillian": {
      prefixes: ["Ale", "Car", "Die", "Fer", "Gon", "Her", "Isa", "Jua"],
      suffixes: ["andro", "ez", "igo", "ando", "ero", "ano", "ito", "oso"]
    },
    "Mongolian": {
      prefixes: ["Bat", "Bol", "Gan", "Jav", "Khu", "Mon", "Nor", "Och"],
      suffixes: ["bold", "batu", "khan", "gol", "mur", "chin", "gan", "jun"]
    },
    "Dark Elven": {
      prefixes: ["Dri", "Jal", "Mal", "Nal", "Pha", "Qil", "Riz", "Sab"],
      suffixes: ["ice", "ace", "rae", "ine", "ara", "ess", "oth", "ira"]
    },
    "French": {
      prefixes: ["Ale", "Ber", "Cha", "Dav", "Eth", "Fra", "Gui", "Hen"],
      suffixes: ["ard", "ert", "ois", "ain", "eau", "ien", "ard", "ier"]
    },
    "Goblin": {
      prefixes: ["Bix", "Gob", "Kri", "Nix", "Pok", "Rix", "Sni", "Tik"],
      suffixes: ["nik", "gob", "kik", "zat", "bit", "git", "nok", "zik"]
    },
    "Nordic": {
      prefixes: ["Bjor", "Erik", "Gud", "Har", "Ing", "Olaf", "Rag", "Tor"],
      suffixes: ["sen", "sson", "dottir", "ulf", "heim", "gar", "mund", "stein"]
    },
    "Celtic": {
      prefixes: ["Aed", "Bri", "Cad", "Dar", "Eas", "Fin", "Gar", "Mor"],
      suffixes: ["an", "eth", "wyn", "gal", "ric", "dun", "ael", "orn"]
    },
    "Uruk": {
      prefixes: ["Gash", "Snag", "Grok", "Thrak", "Urk", "Brog", "Skar", "Morg"],
      suffixes: ["ash", "ugh", "gul", "rak", "nazg", "burz", "goth", "hai"]
    }
  };
  
  const pattern = namePatterns[namebase] || namePatterns["Sindarin"];
  const prefix = pattern.prefixes[Math.floor(Math.random() * pattern.prefixes.length)];
  const suffix = pattern.suffixes[Math.floor(Math.random() * pattern.suffixes.length)];
  
  return prefix + suffix;
}

// Better fallback tavern creation
function createFallbackTavern(settlement, style) {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Sindarin" };
  
  const styleNames = {
    'noble': ['Golden Crown', 'Royal Rest', 'Noble House', 'Gilded Chalice', 'Merchant Lodge'],
    'seedy': ['Broken Mug', 'Dark Corner', 'Rusty Nail', 'Cutthroat Inn', 'Shadow Den'],
    'dock-side': ['Anchor Inn', 'Sailors Rest', 'Harbor Light', 'Shipwright Tavern', 'Tide Pool'],
    'adventurer-hub': ['Crossed Swords', 'Travelers Rest', 'Quest Inn', 'Wayfarers Stop', 'Hero Hall']
  };
  
  const names = styleNames[style] || styleNames['adventurer-hub'];
  const name = names[Math.floor(Math.random() * names.length)];
  const keeper = generateCulturalName(cultureData.namebase);
  
  const styleDescriptions = {
    'noble': 'An upscale establishment catering to merchants and officials',
    'seedy': 'A rough tavern where questionable deals are made in shadowy corners',
    'dock-side': 'A bustling waterfront tavern filled with sailors and dock workers',
    'adventurer-hub': 'A popular gathering place for travelers and adventurers'
  };
  
  const styleSignatures = {
    'noble': 'Fine wines and delicate pastries',
    'seedy': 'Cheap ale and suspicious stew',
    'dock-side': 'Rum and fresh-caught fish',
    'adventurer-hub': 'Hearty ales and travelers tales'
  };
  
  const description = styleDescriptions[style] + `, serving as a central meeting point in ${settlement.Burg}.`;
  const signature = styleSignatures[style] || 'Local specialty brews';
  
  return `- **Tavern name:** ${name}
- **Innkeeper name:** ${keeper}
- **Signature drink or tradition:** ${signature}

${description}`;
}

function createFallbackShop(type, settlement) {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Sindarin" };
  
  const shopAdjectives = ["Fine", "Quality", "Reliable", "Trusted", "Master", "Skilled"];
  const shopNouns = ["Craft", "Works", "Shop", "Emporium", "House", "Guild"];
  
  const adj = shopAdjectives[Math.floor(Math.random() * shopAdjectives.length)];
  const noun = shopNouns[Math.floor(Math.random() * shopNouns.length)];
  
  const name = `${adj} ${type} ${noun}`;
  const owner = generateCulturalName(cultureData.namebase);
  
  const shopDescriptions = {
    'Alchemist': 'brewing potions and selling reagents to local spellcasters',
    'General Store': 'stocking everyday necessities and traveling supplies',
    'Apothecary': 'providing herbs and healing remedies to the community',
    'Tailor': 'crafting clothing and mending garments with skill',
    'Armorer': 'forging and repairing armor for guards and adventurers',
    'Weaponsmith': 'creating and maintaining weapons of all kinds',
    'Tanner': 'working with leather and hides to create durable goods',
    'Carpenter': 'building furniture and structures from local timber',
    'Baker': 'providing fresh bread and baked goods daily',
    'Butcher': 'preparing and selling quality meats',
    'Grocer': 'offering fresh produce and preserved foods',
    'Fletcher': 'crafting arrows and bows for hunters and guards',
    'Bowyer': 'specializing in the creation of quality bows',
    'Stable': 'caring for horses and providing traveling services',
    'Blacksmith': 'forging tools and horseshoes for the community'
  };
  
  const description = shopDescriptions[type] || `providing ${type.toLowerCase()} services`;
  
  return {
    type,
    name,
    owner,
    description: `A reputable establishment in ${settlement.Burg}, ${description} with quality craftsmanship and fair dealings.`
  };
}

function createFallbackLandmark(settlement) {
  const landmarkTypes = ["Well", "Square", "Stone", "Tree", "Gate", "Bridge", "Monument", "Garden"];
  const landmarkAdjectives = ["Ancient", "Old", "Great", "Memorial", "Sacred", "Historic", "Central"];
  
  const type = landmarkTypes[Math.floor(Math.random() * landmarkTypes.length)];
  const adj = landmarkAdjectives[Math.floor(Math.random() * landmarkAdjectives.length)];
  
  const name = `The ${adj} ${type}`;
  
  const landmarkDescriptions = {
    'Well': 'A stone-lined well that has provided fresh water to the community for generations',
    'Square': 'A central gathering place where locals meet for markets and celebrations',
    'Stone': 'A weathered standing stone marking an important boundary or memorial',
    'Tree': 'A massive old tree that serves as a natural landmark and meeting point',
    'Gate': 'An impressive gateway that marks the entrance to an important district',
    'Bridge': 'A sturdy bridge that connects two parts of the settlement',
    'Monument': 'A carved stone monument commemorating an important local event',
    'Garden': 'A peaceful garden tended by locals and visitors alike'
  };
  
  const description = landmarkDescriptions[type] || `A significant landmark in ${settlement.Burg} that holds importance for the local community and serves as a gathering point or place of remembrance.`;
  
  return { name, description };
}

function createFallbackLeader(settlement, cultureData) {
  const titles = [
    'Mayor', 'Reeve', 'Steward', 'Administrator', 'Councilor', 
    'Captain', 'Warden', 'Elder', 'Magistrate', 'Overseer'
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  const name = generateCulturalName(cultureData.namebase);
  
  const leaderStyles = [
    'pragmatic and focused on infrastructure improvements',
    'diplomatic and skilled at resolving local disputes', 
    'industrious and dedicated to expanding trade opportunities',
    'protective and committed to maintaining public safety',
    'progressive and interested in modernizing the settlement'
  ];
  
  const style = leaderStyles[Math.floor(Math.random() * leaderStyles.length)];
  
  return {
    name: name,
    title: title,
    description: `A ${style} leader who has earned respect through consistent service to ${settlement.Burg} and its citizens.`
  };
}

function createFallbackEvents(settlement, count, foundingYear) {
  const events = [];
  const currentYear = require('../config.js').currentYear;
  
  // Add founding event
  events.push({
    eventYear: `${foundingYear} MR`,
    refined: `${settlement.Burg} was founded by early settlers seeking opportunity in the region.`
  });
  
  // Generate basic events
  const eventTypes = [
    'A new bridge was constructed across the local river',
    'The settlement expanded with new residential districts',
    'A market charter was granted by regional authorities',
    'Local craftsmen formed a guild to regulate trade',
    'The community weathered a particularly harsh winter',
    'A festival tradition was established to celebrate the harvest',
    'New trade routes brought increased prosperity'
  ];
  
  for (let i = 1; i < count && i < eventTypes.length; i++) {
    const eventYear = Math.floor(foundingYear + (currentYear - foundingYear) * Math.random());
    events.push({
      eventYear: `${eventYear} MR`,
      refined: eventTypes[i]
    });
  }
  
  return events;
}

module.exports = {
  generateCulturalName,
  createFallbackTavern,
  createFallbackShop,
  createFallbackLandmark,
  createFallbackLeader,
  createFallbackEvents
};