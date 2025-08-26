// utils.js - Core utility functions (refactored for JSON-only)

const eventsList = require('./data/events');
const { generateTradeGoods } = require('./enhancedTrade.js');
const cultures = require('./data/cultures.js');
const { 
  cultureSpeciesMap, 
  cultureSummaryMap, 
  cultureMap, 
  religions,
  getCulturalSummary,
  getSpeciesBreakdown,
  getCulturalFlavor
} = cultures;

// Import our JSON generation functions from the generators module
const {
  generateShopsBatchJSON,
  generateTavernJSON,
  generateTavernsBatchJSON,
  generateLandmarkJSON,
  generateLeaderJSON,
  formatLeaderJSON,
  generateBurgDescriptionJSON,
  generateCapitalDescriptionJSON,
  generateFeatureDescriptionsJSON
} = require('./generators.js');

// Import event generation functions
const { generateEventsJSON } = require('./generators.js');

// Import LLM client (JSON version)
const { retryGenerateJSON } = require('./llmClient.js');

const { currentYear } = require('./config.js');

// === SETTLEMENT CLASSIFICATION AND AGE ===
// const { cultureSummaryMap, religions } = require('./data/cultures');
function rateTownQuality(settlement) {
  let residents = 3;
  let services = 3;
  let comfort = 3;

  const pop = parseInt(settlement.Population, 10) || 0;
  const elevation = parseInt(settlement["Elevation (ft)"], 10) || 0;
  const temp = parseInt(settlement.Temperature, 10) || 60;
  const culture = (settlement.Culture || '').trim();
  const religion = (settlement.Religion || '').trim();

  // === RESIDENTS (Friendliness) ===
  if (pop < 300) residents++;
  if (pop > 1500) residents--;
  const cultureSummary = cultureSummaryMap[culture]?.toLowerCase() || "";
  if (cultureSummary.includes("tribal") || cultureSummary.includes("communal") || cultureSummary.includes("pastoral")) residents++;
  if (cultureSummary.includes("brutal") || cultureSummary.includes("fanatical") || cultureSummary.includes("honor-driven")) residents--;

  const religionEntries = religions[religion] || [];
  for (const deity of religionEntries) {
    const tone = deity.tone.toLowerCase();
    if (tone.includes("nurturing") || tone.includes("protective") || tone.includes("gentle")) residents++;
    if (tone.includes("brutal") || tone.includes("ominous") || tone.includes("zealot") || tone.includes("fanatic")) residents--;
  }

  // === SERVICES (Availability)
  if (pop > 3000) services++;
  if (pop < 500) services--;
  if ((settlement.exportsFormatted || "").length > 60) services++;
  if ((settlement.importsFormatted || "").includes("Grain") || (settlement.importsFormatted || "").includes("Salt")) services--;

  // === COMFORT (Hospitality & Environment)
  if (temp < 30 || temp > 85 || elevation > 8000) comfort--;
  if (temp >= 50 && temp <= 75 && elevation < 2000) comfort++;
  if (cultureSummary.includes("refinement") || cultureSummary.includes("comfort")) comfort++;
  if (cultureSummary.includes("harsh") || cultureSummary.includes("stoic")) comfort--;

  return {
    residents: Math.max(1, Math.min(5, residents)),
    services: Math.max(1, Math.min(5, services)),
    comfort: Math.max(1, Math.min(5, comfort)),
    stars: {
      residents: '★'.repeat(residents) + '☆'.repeat(5 - residents),
      services: '★'.repeat(services) + '☆'.repeat(5 - services),
      comfort: '★'.repeat(comfort) + '☆'.repeat(5 - comfort),
    }
  };
}

function classifySettlement(settlement) {
  const pop = parseInt(settlement.Population, 10);
  let size = '', popModifier = 0;

  if (pop <= 80) size = 'Thorp';
  else if (pop <= 400) size = 'Hamlet';
  else if (pop <= 900) {
    size = 'Village';
    popModifier = 1;
  }
  else if (pop <= 2000) {
    size = 'Small Town';
    popModifier = 2;
  }
  else if (pop <= 5000) {
    size = 'Large Town';
    popModifier = 3;
  }
  else if (pop <= 12000) {
    size = 'Small City';
    popModifier = 4;
  } else if (pop <= 25000) {
    size = 'Large City';
    popModifier = 8;
  } else {
    size = 'Metropolis';
    popModifier = 10;
  }
  
  settlement.size = size;
  settlement.popModifier = popModifier;
  return { settlement };
}

function calculateAge(settlement) {
  var maxAgeRoll = 15;
  if (settlement.Culture === 'Dwarves'  ) {
    maxAgeRoll = 20; // Dwarves have longer lifespans
  } else  if (settlement.Culture === 'Eldar') {
    maxAgeRoll = 20; // Elves also have longer lifespans
  } else if (settlement.Culture === 'Shadow Elves') {
    maxAgeRoll = 15; // Shadow Elves have similar lifespans to Elves
  } else if (settlement.Culture === 'Yotunn') {
    maxAgeRoll = 20; // Yotunn (Giants) have very long lifespans
  } else if (settlement.Culture === 'Kleard') {
    maxAgeRoll = 7; // Kleard (Goblins) have shorter lifespans
  } else if (settlement.Culture === 'Drake') {
    maxAgeRoll = 20; //Dragons have very long lifespans
  } else if (settlement.Culture === 'Rakhnid') {
    maxAgeRoll = 7; // Rakhnid (Spiders) have shorter lifespans
  } else if (settlement.Culture === 'Sunstalker') {
    maxAgeRoll = 7; // Orcs have shorter lifespans
  }
  const baseRoll = Math.ceil(Math.random() * 20);
  const totalRoll = Math.min(maxAgeRoll, baseRoll + settlement.popModifier);
  let age = '', ageModifier = 0, yearsAgo = 0;

  if (totalRoll === 1) {
    age = 'New'; ageModifier = 0; yearsAgo = randRange(1, 10);
  } else if (totalRoll <= 4) {
    age = 'Very Young'; ageModifier = 1; yearsAgo = randRange(11, 50);
  } else if (totalRoll <= 7) {
    age = 'Young'; ageModifier = 3; yearsAgo = randRange(51, 100);
  } else if (totalRoll <= 12) {
    age = 'Mature'; ageModifier = 5; yearsAgo = randRange(101, 400);
  } else if (totalRoll <= 15) {
    age = 'Old'; ageModifier = 10; yearsAgo = randRange(401, 1000);
  } else if (totalRoll <= 17) {
    age = 'Very Old'; ageModifier = 15; yearsAgo = randRange(1001, 5000);
  } else if (totalRoll <= 19) {
    age = 'Ancient'; ageModifier = 25; yearsAgo = randRange(5001, 10000);
  } else {
    age = 'Primeval'; ageModifier = 30; yearsAgo = randRange(10001, 15000);
  }
  
  const founded = currentYear - yearsAgo;
  console.log(`Settlement age: ${age} (Modifier: ${ageModifier}, Years Ago: ${yearsAgo})`);
  
  return {
    age,
    ageModifier,
    founded: founded,
    popModifier: settlement.popModifier
  };
}

// === SHOP AND TRADE LOGIC ===

function pickShops(settlement, exportItems = [], importItems = []) {
  const totalShops = Math.floor(Math.random() * 3) + 1 + settlement.popModifier;

  const baseShops = [
    'Alchemist', 'General Store', 'Apothecary', 'Tailor', 'Armorer', 'Weaponsmith',
    'Tanner', 'Carpenter', 'Baker', 'Butcher', 'Grocer', 'Fletcher',
    'Bowyer', 'Stable', 'Jeweler', 'Mason', 'Glassblower', 'Potter','Flour Mill', 'Shipwright'
  ];

  // Enhanced mapping based on specific items to appropriate shops
  const itemToShop = {
    // Precious Metals & Gemstones
    'Gold Coins': 'Jeweler', 'Silver Ingots': 'Jeweler', 'Mithral Bars': 'Weaponsmith',
    'Moonsilver': 'Jeweler', 'Dragon Gold': 'Jeweler', 'Deep Ruby': 'Jeweler',
    'Mountain Ruby': 'Jeweler', 'Sea Pearl': 'Jeweler', 'Starlight Gem': 'Jeweler',
    
    // Metal Ore
    'Iron Ore': 'Weaponsmith', 'Mithral Ore': 'Weaponsmith', 'Copper Ore': 'Weaponsmith',
    'Silver Ore': 'Jeweler', 'Gold Ore': 'Jeweler',
    
    // Spices  
    'Black Pepper': 'Apothecary', 'Cardamom': 'Apothecary', 'Alpine Thyme': 'Apothecary',
    'Sea Salt': 'Grocer', 'Elvish Seasoning': 'Apothecary', 'Mountain Sage': 'Apothecary',
    
    // Fabrics
    'Silk': 'Tailor', 'Elvish Silk': 'Tailor', 'Wool': 'Tailor',
    'Sailcloth': 'Tailor', 'Moonweave': 'Tailor', 'Velvet': 'Tailor',
    
    // Hides/Furs
    'Cow Hide': 'Tanner', 'Mountain Goat Hide': 'Tanner', 'Ice Bear Fur': 'Tanner',
    'Dragon Scale': 'Tanner', 'Royal Ermine': 'Tanner',
    
    // Food Items
    'Beef Jerky': 'Butcher', 'Ocean Tuna': 'Butcher', 'Mountain Goat Jerky': 'Butcher',
    'River Trout': 'Butcher', 'Royal Venison': 'Butcher',
    'Wheat': 'Baker', 'Mountain Wheat': 'Baker', 'Ancient Grain': 'Flour Mill',
    'Dried Apples': 'Grocer', 'Tropical Mango': 'Grocer', 'Mountain Berries': 'Grocer',
    
    // Livestock
    'Cattle': 'Stable', 'Mountain Goats': 'Stable', 'War Horses': 'Stable',
    'Royal Steeds': 'Stable', 'Reindeer': 'Stable',
    
    // Lumber & Wood
    'Pine': 'Carpenter', 'Ancient Oak': 'Carpenter', 'Elvish Oak': 'Carpenter',
    'Driftwood': 'Carpenter', 'Royal Oak': 'Carpenter',
    
    // Stone & Marble
    'Granite': 'Mason', 'Peak Marble': 'Mason', 'Deep Stone': 'Mason',
    'Sea Stone': 'Mason', 'Royal Marble': 'Mason',
    'White Marble': 'Mason', 'Black Marble': 'Mason'
  };

  // Get weighted shop preferences based on trade goods
  const weighted = [...exportItems, ...importItems]
    .map(item => itemToShop[item])
    .filter(Boolean); // Remove undefined values

  // Add extra shops based on settlement features
  if (settlement.Port) weighted.push('Carpenter'); // For ship repairs
  if (settlement.Port) weighted.push('Shipwright'); // Burgs often have blacksmiths
  if (settlement.Population > 5000) weighted.push('Jeweler', 'Mason'); // Luxury shops for large cities
  if (settlement.Capital) weighted.push('Jeweler', 'Mason', 'Glassblower'); // Capital luxuries

  const combinedSet = new Set([...weighted, ...baseShops]);
  const shuffled = Array.from(combinedSet).sort(() => Math.random() - 0.5);

  return shuffled.slice(0, totalShops);
}

function getRandomItems(settlement, list, count) {
  const result = [];
  const copy = [...list];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function formatShopEntries(batchShopData) {
  return Object.entries(batchShopData)
    .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
    .map(([type, entries]) => {
      // Handle array of strings (current format)
      if (Array.isArray(entries)) {
        const block = entries.join('\n\n--- \n\n');
        return `### ${type}\n${block}`;
      }
      
      // Handle array of objects (if JSON format is returned)
      if (Array.isArray(entries) && entries[0] && typeof entries[0] === 'object') {
        const formattedEntries = entries.map(shop => 
          `- **Shop name:** ${shop.name}\n- **Owner name:** ${shop.owner}\n\n${shop.description}`
        );
        const block = formattedEntries.join('\n\n--- \n\n');
        return `### ${type}\n${block}`;
      }
      
      // Fallback for unexpected format
      return `### ${type}\n${entries}`;
    });
}

// === UTILITY FUNCTIONS ===

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  return Number(num).toLocaleString('en-US');
}

// === MAIN MARKDOWN FORMATTER ===

async function formatMarkdown(settlement, ageInfo, events) {
  const useApi = false;
  
  // Get enhanced geography classification 
  const geoClassification = require('./enhancedTrade.js').classifySettlement(settlement);
  
  // Generate enhanced trade goods based on culture and geography
  const tradeData = generateTradeGoods(settlement);
  settlement.exportsFormatted = tradeData.exportsFormatted;
  settlement.importsFormatted = tradeData.importsFormatted;
  
  // Generate shops based on enhanced trade
  const smartShops = pickShops(settlement, tradeData.exports, tradeData.imports);
  smartShops.push('Blacksmith');
  if (settlement.Population > 2000) {
    smartShops.push('Blacksmith'); // Add second blacksmith for larger cities
  }
  
  const batchShopData = await generateShopsBatchJSON(settlement, smartShops, false);
  const shopEntries = formatShopEntries(batchShopData);

  // Validate and format events - events parameter is now JSON format from generateEventsJSON
  if (!Array.isArray(events)) {
    console.error("\x1b[31m", "Expected events to be an array but got:", typeof events, events);
    events = [];
  }

  // Format events for display - now handles JSON format with eventYear and description properties
  const eventsList = events
    .filter(e => e.eventYear && e.description)
    .sort((a, b) => {
      const yearA = parseInt(a.eventYear.match(/-?\d+/)?.[0] || '0');
      const yearB = parseInt(b.eventYear.match(/-?\d+/)?.[0] || '0');
      return yearA - yearB;
    })
    .map(e => `- **${e.eventYear}** ${e.description}`)
    .join('\n');

  // Generate all content using JSON functions with biome information
  const isCapital = !!settlement.Capital;
  const isPort = !!settlement.Port;
  
  // Define tavern types based on settlement characteristics
  const tavernTypes = ['noble'];
  if (isPort) {
    tavernTypes.push('dock-side dive');
  } else {
    tavernTypes.push('seedy');
  }
  tavernTypes.push('adventurer-hub');
  
  const [taverns, leaderData, landmarkDetails, burgDescription] = await Promise.all([
    generateTavernsBatchJSON(settlement, tavernTypes, false),
    generateLeaderJSON(settlement, settlement.size, ageInfo.age, isCapital, useApi),
    generateFeatureDescriptionsJSON(settlement, false, events),
    isCapital 
      ? generateCapitalDescriptionJSON(settlement, geoClassification, useApi)
      : generateBurgDescriptionJSON(settlement, geoClassification,townQuality, useApi)
  ]);
const townQuality = rateTownQuality(settlement);

  const leaderInfo = formatLeaderJSON(leaderData);
  
  // Format taverns for display
  const tavernEntries = taverns.map(tavern => 
    `- **Tavern name:** ${tavern.name}\n- **Innkeeper name:** ${tavern.innkeeper}\n- **Signature drink or tradition:** ${tavern.signature}\n\n${tavern.description}`
  ).join('\n\n');

  return `**State**: [[${settlement["State"]}|${settlement["State Full Name"]}]]
**Province**: ${settlement["Province Full Name"]}
**Settlement Size**: ${settlement.size}
**Population**: ${formatNumber(settlement.Population)}
**Founded**: ${ageInfo.founded} MR (${ageInfo.age})
**Elevation (ft)**: ${formatNumber(settlement["Elevation (ft)"])}
**Average Temp**: ${settlement.Temperature}°F
**Biome**: ${geoClassification.primaryBiome} (${geoClassification.primaryGeography})
**Residents**: ${townQuality.stars.residents}
**Services**: ${townQuality.stars.services}
**Comfort**: ${townQuality.stars.comfort}


${burgDescription}

## Leadership
${leaderInfo}

## Landmarks
${landmarkDetails || "None recorded."}

## Taverns and Inns
${tavernEntries}

## Trade
### Exports:
${settlement.exportsFormatted}

### Imports:
${settlement.importsFormatted}

## Notable Shops
${shopEntries.join('\n\n')}

## Events
${eventsList}

---

[City Generator Link](${settlement["City Generator Link"]})
`;
}

// === EXPORTS ===

module.exports = {
  // Export culture data for compatibility
  cultureSpeciesMap,
  cultureSummaryMap,
  cultureMap,
  religions,
  currentYear,
  
  // Export culture functions
  getCulturalSummary,
  getSpeciesBreakdown, 
  getCulturalFlavor,
  
  // Core settlement functions
  classifySettlement,
  calculateAge,
  formatMarkdown,
  rateTownQuality,
  
  // JSON generation functions (aliased for compatibility)
  generateShopsBatch: generateShopsBatchJSON,
  generateTavern: generateTavernJSON,
  generateTavernsBatch: generateTavernsBatchJSON,
  generateLandmark: generateLandmarkJSON,
  
  // Trade and utility functions
  pickShops,
  getRandomItems,
  formatNumber,
  randRange
};