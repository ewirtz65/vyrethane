// Geographic and climatic classifications
function classifySettlement(settlement) {
  const elevation = parseInt(settlement["Elevation (ft)"], 10) || 0;
  const temp = parseInt(settlement.Temperature, 10) || 50;
  const isPort = !!settlement.Port;
  const longitude = parseFloat(settlement.Longitude) || 0; // Assuming this exists in your data
  
  let geographic = [];
  let climatic = [];
  let biome = [];
  
  // === ENHANCED ELEVATION-BASED GEOGRAPHY ===
  if (elevation > 15000) {
    geographic.push('peak_summit');
    biome.push('peak_summit');
  } else if (elevation > 10000) {
    geographic.push('extreme_mountain');
    biome.push('extreme_mountain');
  } else if (elevation > 6000) {
    geographic.push('high_mountain');
    biome.push('alpine');
  } else if (elevation > 3000) {
    geographic.push('mountain');
    biome.push('highland');
  } else if (elevation > 1500) {
    geographic.push('hills');
    biome.push('upland');
  } else if (elevation < 500 && !isPort) {
    geographic.push('lowland');
    biome.push('valley');
  }
  
  // === PORT AND COASTAL CLASSIFICATION ===
  if (isPort) {
    geographic.push('coastal');
    biome.push('maritime');
    
    // Further classify coastal types by temperature
    if (temp < 45) {
      biome.push('cold_coast');
    } else if (temp > 70) {
      biome.push('warm_coast');
    } else {
      biome.push('temperate_coast');
    }
  }
  
  // === LONGITUDE-BASED CONTINENTAL POSITION ===
  // Assuming longitude affects climate patterns (continental vs oceanic influence)
  const absLongitude = Math.abs(longitude);
  if (absLongitude < 30) {
    biome.push('continental_interior'); // Far from major water bodies
  } else if (absLongitude > 120) {
    biome.push('oceanic_influence'); // Near major water bodies
  } else {
    biome.push('moderate_continental');
  }
  
  // === TEMPERATURE-BASED CLIMATE ===
  if (temp < 35) {
    climatic.push('arctic');
    biome.push('tundra');
  } else if (temp < 45) {
    climatic.push('cold');
    biome.push('boreal');
  } else if (temp < 55) {
    climatic.push('cool_temperate');
    biome.push('temperate');
  } else if (temp < 65) {
    climatic.push('temperate');
    biome.push('temperate');
  } else if (temp < 75) {
    climatic.push('warm_temperate');
    biome.push('subtropical');
  } else if (temp < 85) {
    climatic.push('hot');
    biome.push('tropical');
  } else {
    climatic.push('very_hot');
    biome.push('desert');
  }
  
  // === COMBINED BIOME CLASSIFICATION ===
  // Cross-reference elevation + temperature for specific biomes
  if (elevation > 15000) {
    biome.push('death_zone'); // Extreme altitude where few can survive
  } else if (elevation > 10000 && temp < 30) {
    biome.push('frozen_peaks');
  } else if (elevation > 6000 && temp < 40) {
    biome.push('snow_peaks');
  } else if (elevation > 3000 && temp < 50) {
    biome.push('alpine_forest');
  } else if (elevation > 2000 && temp > 70) {
    biome.push('high_desert');
  }
  
  // Continental climate modifiers
  if (biome.includes('continental_interior')) {
    if (temp < 50) {
      biome.push('cold_plains');
    } else if (temp > 70) {
      biome.push('hot_plains');
    } else {
      biome.push('grasslands');
    }
  }
  
  // === SPECIAL GEOGRAPHIC FEATURES ===
  // Infer additional features from combinations
  if (elevation < 1000 && temp > 75 && !isPort) {
    geographic.push('inland_basin');
    biome.push('desert_valley');
  }
  
  if (elevation > 2000 && isPort) {
    geographic.push('coastal_cliffs');
    biome.push('clifftop');
  }
  
  if (temp < 40 && elevation < 1000) {
    geographic.push('frozen_lowlands');
    biome.push('permafrost');
  }
  
  // === DEFAULT CLASSIFICATIONS ===
  if (geographic.length === 0) geographic.push('common');
  if (climatic.length === 0) climatic.push('temperate');
  if (biome.length === 0) biome.push('mixed');
  
  return { 
    geographic, 
    climatic, 
    biome,
    // Summary classification for easy reference
    primaryGeography: geographic[0],
    primaryClimate: climatic[0],
    primaryBiome: biome[0]
  };
}// enhancedTrade.js - Culture and geography-aware trade system

// enhancedTrade.js - Culture and geography-aware trade system
// Based on existing commodities.js categories but with specific items

// Enhanced versions of your existing commodity categories
const specificCommodities = {
  // Raw Materials
  "Metal Ore": {
    common: ['Iron Ore', 'Copper Ore', 'Tin Ore', 'Lead Ore'],
    Dwarves: ['Mithral Ore', 'Adamantine Ore', 'Refined Iron Ore', 'Coal'],
    mountain: ['Silver Ore', 'Gold Ore', 'Platinum Ore', 'Granite Ore'],
    coastal: ['Bog Iron', 'Salt-Crusted Copper'],
    Eldar: ['Moonstone Ore', 'Silver Ore']
  },

  "Precious Metals": {
    common: ['Gold', 'Silver', 'Copper', 'Platinum'],
    Dwarves: ['Mithral', 'Adamantine', 'Refined Gold', 'Forged Silver'],
    Eldar: ['Silver Alloy', 'White Gold'],
    luxury: ['Fine Gold', 'Refined Platinum', 'Pure Silver']
  },

  "Gemstones": {
    common: ['Quartz', 'Amethyst', 'Garnet', 'Jade'],
    mountain: ['Ruby', 'Sapphire', 'Emerald', 'Diamond'],
    coastal: ['Pearl', 'Coral', 'Aquamarine'],
    luxury: ['Flawless Diamond', 'Polished Ruby', 'Blue Sapphire']
  },

  "Grains": {
    common: ['Wheat', 'Barley', 'Oats', 'Rye', 'Corn','Flour'],
    mountain: ['Barley', 'Oats', 'Rice'],
    coastal: ['Wheat', 'Oats','Rice'],
    cold: ['Winter Wheat', 'Frost Barley'],
    luxury: ['Polished Grain', 'Enriched Flour']
  },

  "Dried Fruits": {
    common: ['Dried Apples', 'Raisins', 'Pears', 'Figs'],
    tropical: ['Dried Mango', 'Banana Chips', 'Coconut Flakes'],
    mountain: ['Berries', 'Dried Apples'],
    luxury: ['Candied Fruit', 'Preserved Figs']
  },

  "Dried Meat": {
    common: ['Beef Jerky', 'Pork Strips', 'Lamb Jerky', 'Venison'],
    mountain: ['Goat Jerky', 'Deer Jerky', 'Elk Jerky'],
    coastal: ['Dried Fish', 'Salted Meat'],
    exotic: ['Spiced Jerky', 'Unusual Game Meat']
  },

  "Fabric": {
    common: ['Wool', 'Linen', 'Cotton', 'Hemp'],
    luxury: ['Silk', 'Velvet', 'Brocade'],
    coastal: ['Canvas', 'Netting', 'Sailcloth'],
    cold: ['Fur', 'Heavy Wool'],
    mountain: ['Wool', 'Natural Fiber']
  },

  "Hides/Furs": {
    common: ['Cow Hide', 'Sheep Skin', 'Goat Hide', 'Pig Leather'],
    mountain: ['Goat Hide', 'Bear Fur', 'Wolf Pelt'],
    cold: ['Fox Fur', 'Bear Hide', 'Reindeer Hide'],
    coastal: ['Seal Skin', 'Otter Fur'],
    exotic: ['Scaled Hide', 'Unusual Fur']
  },

  "Fish": {
    common: ['Trout', 'Bass', 'Carp', 'Salmon'],
    coastal: ['Tuna', 'Cod', 'Mackerel', 'Snapper'],
    mountain: ['Char', 'Lake Trout', 'Highland Salmon'],
    preserved: ['Salted Fish', 'Smoked Fish', 'Pickled Fish']
  },

  "Livestock": {
    common: ['Cattle', 'Sheep', 'Goats', 'Pigs', 'Chickens'],
    mountain: ['Goats', 'Sheep', 'Highland Cattle'],
    cold: ['Reindeer', 'Yaks', 'Draft Horses'],
    exotic: ['Pack Beasts', 'War Mounts']
  },

  "Lumber": {
    common: ['Pine', 'Oak', 'Birch', 'Maple'],
    mountain: ['Fir', 'Cedar'],
    coastal: ['Coastal Pine', 'Driftwood'],
    forest: ['Oak', 'Spruce', 'Maple']
  },

  "Marble": {
    common: ['White Marble', 'Gray Marble', 'Veined Marble'],
    mountain: ['Alpine Marble', 'Slate Marble'],
    luxury: ['Polished Marble', 'Carved Marble'],
    colored: ['Black Marble', 'Red Marble', 'Green Marble']
  },

  "Stone": {
    common: ['Limestone', 'Slate', 'Sandstone', 'River Rock'],
    mountain: ['Granite', 'Basalt'],
    Dwarves: ['Chiseled Stone', 'Carved Granite'],
    coastal: ['Coral Rock', 'Salt Stone']
  },

  "Salt": {
    common: ['Rock Salt', 'Sea Salt'],
    coastal: ['Evaporated Salt', 'Brine Crystals'],
    mountain: ['Salt Blocks', 'Mineral Salt']
  },

  "Spices": {
    common: ['Black Pepper', 'Salt', 'Bay Leaves'],
    tropical: ['Cardamom', 'Cinnamon', 'Nutmeg', 'Ginger'],
    mountain: ['Thyme', 'Sage', 'Rosemary', 'Saffron'],
    coastal: ['Kelp', 'Sea Salt'],
    cold: ['Juniper Berries', 'Horseradish'],
    luxury: ['Saffron', 'Long Pepper']
  },

  "Spirits": {
    common: ['Ale', 'Mead', 'Cider'],
    mountain: ['Barley Whiskey', 'Berry Brandy'],
    coastal: ['Rum', 'Sea Ale'],
    luxury: ['Aged Wine', 'Dwarven Spirits', 'Elven Elixirs']
  },

  "Oils": {
    common: ['Vegetable Oil', 'Lard', 'Lanolin'],
    coastal: ['Fish Oil', 'Whale Oil'],
    tropical: ['Coconut Oil', 'Palm Oil'],
    luxury: ['Perfumed Oil', 'Anointing Oil']
  },

  "Paints/Dyes": {
    common: ['Charcoal Ink', 'Earth Pigments'],
    coastal: ['Indigo', 'Sea Green Dye'],
    tropical: ['Turmeric Yellow', 'Cochineal Red'],
    mountain: ['Iron Oxide', 'Berry Dye'],
    luxury: ['Gold Leaf Ink', 'Permanent Pigments']
  },

  "Paper": {
    common: ['Pulp Paper', 'Reed Paper'],
    luxury: ['Fine Parchment', 'Vellum'],
    Eldar: ['Elven Paper', 'Treebark Sheets']
  },

  "Alchemical Reagents": {
    common: ['Sulfur', 'Saltpeter', 'Charcoal'],
    exotic: ['Mandrake Root', 'Tincture of Mercury'],
    coastal: ['Coral Dust', 'Brine Crystal'],
    mountain: ['Volcanic Ash', 'Cave Moss']
  },

  "Alchemical Products": {
    common: ['Alchemist’s Fire', 'Smoke Powder'],
    luxury: ['Tonic of Clarity', 'Elixir of Health'],
    dwarves: ['Blast Gel', 'Miner’s Oil']
  },

  "Spellcasting Components": {
    common: ['Bat Guano', 'Feathers', 'Incense'],
    exotic: ['Phoenix Ash', 'Unicorn Hair'],
    Eldar: ['Moon Dust', 'Star Flower']
  },

  "Arms/Armor": {
    common: ['Steel Sword', 'Leather Armor', 'Iron Shield'],
    dwarves: ['Warhammer', 'Plate Armor', 'Reinforced Helm'],
    eldar: ['Runed Blade', 'Elven Chainmail'],
    coastal: ['Boarding Axe', 'Fishscale Armor']
  },

  "Artwork": {
    common: ['Woodcarving', 'Woven Tapestry', 'Clay Figurines'],
    luxury: ['Marble Statue', 'Gilded Icon', 'Gem-Inlaid Box'],
    Eldar: ['Crystal Sculpture', 'Painted Scroll']
  },

  "Candles": {
    common: ['Tallow Candle', 'Beeswax Candle'],
    luxury: ['Scented Candle', 'Oil Lamp']
  },

  "Ceramics": {
    common: ['Clay Pot', 'Jug', 'Earthenware'],
    luxury: ['Glazed Pottery', 'Painted Vase']
  },

  "Cloth Goods": {
    common: ['Tunics', 'Cloaks', 'Sacks'],
    luxury: ['Embroidered Robes', 'Lined Coats']
  },

  "Cosmetics": {
    common: ['Face Powder', 'Lip Color'],
    luxury: ['Perfumed Balm', 'Elven Rouge']
  },

  "Furniture": {
    common: ['Wooden Stool', 'Simple Bed', 'Table'],
    luxury: ['Carved Throne', 'Inlaid Desk']
  },

  "Glasswork": {
    common: ['Glass Cup', 'Flask'],
    luxury: ['Stained Glass', 'Crystal Goblet']
  },

  "Jewelry": {
    common: ['Copper Ring', 'Beaded Necklace'],
    luxury: ['Gold Bracelet', 'Gem-Encrusted Brooch'],
    Eldar: ['Silver Circlet', 'Leaf-Motif Earring']
  },

  "Leatherwork": {
    common: ['Boots', 'Belts', 'Satchels'],
    luxury: ['Studded Gloves', 'Tooled Armor']
  },

  "Machinery": {
    common: ['Water Wheel', 'Mill Gear'],
    dwarves: ['Mining Rig', 'Crank Lift']
  },

  "Magical Items": {
    minor: ['Scroll', 'Charm', 'Potion'],
    major: ['Wand', 'Ring', 'Enchanted Weapon']
  },

  "Medicine/Drugs": {
    common: ['Healing Salve', 'Poultice', 'Herbal Tea'],
    exotic: ['Dreamroot', 'Painbane', 'Euphoria Dust']
  },

  "Metalwork": {
    common: ['Nails', 'Tools', 'Cauldron'],
    luxury: ['Engraved Chalice', 'Ornamental Filigree']
  },

  "Perfume": {
    common: ['Floral Oil', 'Herbal Essence'],
    luxury: ['Musk Perfume', 'Spiced Cologne']
  },

  "Stonework": {
    common: ['Cobblestone', 'Mortar Brick'],
    dwarves: ['Engraved Block', 'Tunnel Arch']
  },

  "Texts": {
    common: ['Religious Tract', 'Farm Ledger', 'Scroll'],
    luxury: ['Bound Chronicle', 'Illuminated Codex']
  },

  "Woodwork": {
    common: ['Crate', 'Chair', 'Tool Handle'],
    luxury: ['Carved Chest', 'Gilded Frame']
  }
};

// Shop categories that match your existing shops
const shopCategories = {
  'Alchemist': ['Alchemical Reagents', 'Spellcasting Components', 'Alchemical Products', 'Medicine/Drugs'],
  'General Store': ['Candles', 'Paper', 'Wax', 'Texts', 'Machinery'],
  'Apothecary': ['Spices', 'Medicine/Drugs', 'Oils', 'Perfume', 'Cosmetics'],
  'Tailor': ['Fabric', 'Cloth Goods', 'Cosmetics'],
  'Armorer': ['Arms/Armor', 'Metalwork'],
  'Weaponsmith': ['Arms/Armor', 'Metal Ore', 'Precious Metals', 'Metalwork'],
  'Tanner': ['Hides/Furs', 'Leatherwork'],
  'Carpenter': ['Lumber', 'Woodwork', 'Furniture'],
  'Baker': ['Grains'],
  'Butcher': ['Dried Meat', 'Fish', 'Livestock'],
  'Grocer': ['Dried Fruits', 'Spices', 'Spirits', 'Salt'],
  'Fletcher': ['Lumber', 'Woodwork'],
  'Bowyer': ['Lumber', 'Woodwork'],
  'Stable': ['Livestock'],
  'Jeweler': ['Precious Metals', 'Gemstones', 'Jewelry'],
  'Mason': ['Stone', 'Marble', 'Stonework'],
  'Glassblower': ['Glasswork'],
  'Potter': ['Clay', 'Ceramics'],
  'Artist': ['Artwork', 'Paints/Dyes']
};

// Geographic and climatic classifications
function classifySettlement(settlement) {
  const elevation = parseInt(settlement["Elevation (ft)"], 10) || 0;
  const temp = parseInt(settlement.Temperature, 10) || 50;
  const isPort = !!settlement.Port;
  const longitude = parseFloat(settlement.Longitude) || 0; // Assuming this exists in your data
  
  let geographic = [];
  let climatic = [];
  let biome = [];
  
  // === ELEVATION-BASED GEOGRAPHY ===
  if (elevation > 6000) {
    geographic.push('high_mountain');
    biome.push('alpine');
  } else if (elevation > 3000) {
    geographic.push('mountain');
    biome.push('highland');
  } else if (elevation > 1500) {
    geographic.push('hills');
    biome.push('upland');
  } else if (elevation < 500 && !isPort) {
    geographic.push('lowland');
    biome.push('valley');
  }
  
  // === PORT AND COASTAL CLASSIFICATION ===
  if (isPort) {
    geographic.push('coastal');
    biome.push('maritime');
    
    // Further classify coastal types by temperature
    if (temp < 45) {
      biome.push('cold_coast');
    } else if (temp > 70) {
      biome.push('warm_coast');
    } else {
      biome.push('temperate_coast');
    }
  }
  
  // === LONGITUDE-BASED CONTINENTAL POSITION ===
  // Assuming longitude affects climate patterns (continental vs oceanic influence)
  const absLongitude = Math.abs(longitude);
  if (absLongitude < 30) {
    biome.push('continental_interior'); // Far from major water bodies
  } else if (absLongitude > 120) {
    biome.push('oceanic_influence'); // Near major water bodies
  } else {
    biome.push('moderate_continental');
  }
  
  // === TEMPERATURE-BASED CLIMATE ===
  if (temp < 35) {
    climatic.push('arctic');
    biome.push('tundra');
  } else if (temp < 45) {
    climatic.push('cold');
    biome.push('boreal');
  } else if (temp < 55) {
    climatic.push('cool_temperate');
    biome.push('temperate');
  } else if (temp < 65) {
    climatic.push('temperate');
    biome.push('temperate');
  } else if (temp < 75) {
    climatic.push('warm_temperate');
    biome.push('subtropical');
  } else if (temp < 85) {
    climatic.push('hot');
    biome.push('tropical');
  } else {
    climatic.push('very_hot');
    biome.push('desert');
  }
  
  // === COMBINED BIOME CLASSIFICATION ===
  // Cross-reference elevation + temperature for specific biomes
  if (elevation > 4000 && temp < 40) {
    biome.push('snow_peaks');
  } else if (elevation > 3000 && temp < 50) {
    biome.push('alpine_forest');
  } else if (elevation > 2000 && temp > 70) {
    biome.push('high_desert');
  }
  
  // Continental climate modifiers
  if (biome.includes('continental_interior')) {
    if (temp < 50) {
      biome.push('cold_plains');
    } else if (temp > 70) {
      biome.push('hot_plains');
    } else {
      biome.push('grasslands');
    }
  }
  
  // === SPECIAL GEOGRAPHIC FEATURES ===
  // Infer additional features from combinations
  if (elevation < 1000 && temp > 75 && !isPort) {
    geographic.push('inland_basin');
    biome.push('desert_valley');
  }
  
  if (elevation > 2000 && isPort) {
    geographic.push('coastal_cliffs');
    biome.push('clifftop');
  }
  
  if (temp < 40 && elevation < 1000) {
    geographic.push('frozen_lowlands');
    biome.push('permafrost');
  }
  
  // === DEFAULT CLASSIFICATIONS ===
  if (geographic.length === 0) geographic.push('common');
  if (climatic.length === 0) climatic.push('temperate');
  if (biome.length === 0) biome.push('mixed');
  
  return { 
    geographic, 
    climatic, 
    biome,
    // Summary classification for easy reference
    primaryGeography: geographic[0],
    primaryClimate: climatic[0],
    primaryBiome: biome[0]
  };
}

// Enhanced terrain-specific resources
const terrainResources = {
  // Mountain resources by elevation
  'high_mountain': {
    'Precious Metals': ['Platinum', 'Gold', 'Silver', 'Copper'],
    'Metal Ore': ['Iron Ore', 'Copper Ore', 'Gold Ore', 'Silver Ore'], 
    'Gemstones': ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Garnet', 'Topaz','Obsidian'],
    'Stone': ['Granite', 'Marble', 'Limestone', 'Slate']
  },

  'mountain': {
    'Precious Metals': ['Gold', 'Silver', 'Copper'],
    'Metal Ore': ['Iron Ore', 'Copper Ore', 'Tin Ore', 'Lead Ore'],
    'Gemstones': ['Ruby', 'Emerald', 'Sapphire', 'Garnet'],
    'Stone': ['Granite', 'Marble', 'Limestone', 'Slate'],
    'Spices': ['Thyme', 'Sage', 'Rosemary', 'Saffron']
  },

  'hills': {
    'Metal Ore': ['Iron Ore', 'Copper Ore', 'Tin Ore', 'Lead Ore'],
    'Stone': ['Granite', 'Limestone', 'Sandstone', 'Chalk'],
    'Lumber': ['Oak', 'Pine', 'Cedar', 'Birch'],
    'Herbs': ['Chamomile', 'Mint', 'Yarrow', 'Elderflower']
  },

  // Coastal resources by climate
  'cold_coast': {
    'Fish': ['Cod', 'Salmon', 'Trout', 'Bass'],
    'Hides/Furs': ['Seal Skin', 'Whale Hide', 'Fox Fur', 'Bear Fur'],
    'Spices': ['Sea Salt', 'Kelp', 'Horseradish', 'Juniper Berries', 'Mustard Seeds']
  },

  'temperate_coast': {
    'Fish': ['Cod', 'Bass', 'Salmon', 'Trout'],
    'Hides/Furs': ['Otter Fur', 'Seal Skin', 'Deer Hide'],
    'Spices': ['Sea Salt', 'Bay Laurel', 'Kelp', 'Garlic', 'Thyme', 'Oregano', 'Parsley']
  },

  'warm_coast': {
    'Fish': ['Tuna', 'Snapper', 'Grouper', 'Sardine'],
    'Spices': ['Salt', 'Black Pepper', 'Cardamom', 'Cinnamon', 'Cloves', 'Nutmeg', 'Ginger', 'Vanilla'],
    'Gemstones': ['Pearl', 'Amber', 'Shell Stone', 'Coral']
  },

  // Continental interior
  'continental_interior': {
    'Grains': ['Wheat', 'Barley', 'Oats', 'Rye'],
    'Livestock': ['Cattle', 'Horses', 'Sheep', 'Goats'],
    'Hides/Furs': ['Bison Hide', 'Wolf Fur', 'Bear Hide', 'Deer Hide']
  },

  'cold_plains': {
    'Livestock': ['Cattle', 'Horses', 'Sheep', 'Goats'],
    'Hides/Furs': ['Wolf Fur', 'Bear Fur', 'Fox Fur', 'Deer Hide'],
    'Grains': ['Wheat', 'Barley', 'Oats', 'Rye']
  },

  'hot_plains': {
    'Livestock': ['Horses', 'Cattle', 'Goats', 'Sheep'],
    'Grains': ['Sorghum', 'Millet', 'Wheat', 'Barley'],
    'Spices': ['Salt', 'Onion', 'Chili Pepper', 'Garlic', 'Cumin', 'Paprika', 'Coriander']
  },

  // Special biomes
  'tundra': {
    'Hides/Furs': ['Wolf Fur', 'Fox Fur', 'Elk Hide', 'Caribou Hide'],
    'Fish': ['Char', 'Grayling', 'Trout']
  },

  'boreal': {
    'Lumber': ['Pine', 'Spruce', 'Fir', 'Cedar'],
    'Hides/Furs': ['Wolf Fur', 'Bear Fur', 'Marten Fur', 'Fox Fur'],
    'Herbs': ['Pine Resin', 'Lingonberry', 'Cloudberry', 'Spruce Tips']
  },

  'desert': {
    'Gemstones': ['Quartz', 'Topaz', 'Jasper', 'Opal','Turquoise'],
    'Spices': ['Sage', 'Cumin', 'Fenugreek', 'Sesame Seeds'],
    'Salt': ['Rock Salt', 'Salt Crystals']
  }
};


// Get culture-specific items
function getCultureSpecificItems(culture, category) {
  const normalizedCulture = culture.replace(/\s+/g, '_');
  const categoryData = specificCommodities[category];
  
  if (!categoryData) return [];
  
  // Return culture-specific items if available, otherwise common items
  return categoryData[normalizedCulture] || categoryData.common || [];
}

// Get geography/climate specific items
function getLocationSpecificItems(geographic, climatic, category) {
  const categoryData = specificCommodities[category];
  if (!categoryData) return [];
  
  let items = [];
  
  // Add geographic items
  geographic.forEach(geo => {
    if (categoryData[geo]) {
      items = items.concat(categoryData[geo]);
    }
  });
  
  // Add climatic items
  climatic.forEach(climate => {
    if (categoryData[climate]) {
      items = items.concat(categoryData[climate]);
    }
  });
  
  // Add common items if no specific items found
  if (items.length === 0) {
    items = categoryData.common || [];
  }
  
  return items;
}

// Biome export weightings - what each biome is most likely to produce
const biomeExportWeights = {
  'alpine': {
    'Metal Ore': 0.4,        // High - mountain mining
    'Gemstones': 0.3,        // High - mountain gems  
    'Stone': 0.4,            // High - mountain stone
    'Precious Metals': 0.3,   // High - mountain metals
    'Hides/Furs': 0.3,      // Medium - mountain animals
    'Lumber': 0.1,           // Low - treeline issues
    'Grains': 0.0,           // None - too cold/high
    'Dried Fruits': 0.0,     // None - can't grow
    'Spices': 0.1,           // Low - limited herbs
    'Fish': 0.1              // Low - high altitude lakes only
  },
  
  'extreme_mountain': {
    'Metal Ore': 0.5,        // Very High - deep mining
    'Gemstones': 0.4,        // Very High - rare gems
    'Precious Metals': 0.4,   // Very High - rare metals
    'Stone': 0.3,            // High - quality stone
    'Hides/Furs': 0.2,      // Low - few animals survive
    'Lumber': 0.0,           // None - above treeline
    'Grains': 0.0,           // None - impossible conditions
    'Dried Fruits': 0.0,     // None - impossible conditions
    'Spices': 0.0,           // None - no vegetation
    'Fish': 0.0              // None - frozen solid
  },
  
  'maritime': {
    'Fish': 0.5,             // Very High - coastal fishing
    'Hides/Furs': 0.3,      // Medium - sea mammals
    'Spices': 0.2,           // Medium - sea salt, kelp
    'Grains': 0.2,           // Medium - coastal farming
    'Dried Fruits': 0.2,     // Medium - temperate fruits
    'Metal Ore': 0.1,        // Low - not mining focused
    'Gemstones': 0.1,        // Low - some pearls
    'Stone': 0.2,            // Medium - coastal stone
    'Lumber': 0.2,           // Medium - coastal forests
    'Precious Metals': 0.1   // Low - not mining focused
  },
  
  'tropical': {
    'Spices': 0.5,           // Very High - tropical spices
    'Dried Fruits': 0.4,     // High - abundant fruits
    'Lumber': 0.4,           // High - tropical hardwoods
    'Grains': 0.3,           // Medium - rice, tropical grains
    'Fish': 0.3,             // Medium - if coastal
    'Hides/Furs': 0.2,      // Low - tropical animals
    'Metal Ore': 0.1,        // Low - jungle mining difficult
    'Gemstones': 0.2,        // Medium - some tropical gems
    'Stone': 0.1,            // Low - jungle quarrying hard
    'Precious Metals': 0.1   // Low - jungle mining difficult
  },
  
  'desert': {
    'Spices': 0.3,           // High - desert herbs, salt
    'Gemstones': 0.3,        // High - desert crystals
    'Metal Ore': 0.2,        // Medium - desert mining
    'Stone': 0.3,            // High - desert stone
    'Hides/Furs': 0.2,      // Medium - desert animals
    'Dried Fruits': 0.2,     // Medium - oasis fruits
    'Grains': 0.1,           // Low - water scarce
    'Fish': 0.0,             // None - no water
    'Lumber': 0.0,           // None - no trees
    'Precious Metals': 0.2   // Medium - desert deposits
  },
  
  'grasslands': {
    'Grains': 0.5,           // Very High - prairie farming
    'Livestock': 0.4,        // High - grazing animals
    'Hides/Furs': 0.3,      // High - prairie furs
    'Dried Meat': 0.3,       // High - livestock processing
    'Dried Fruits': 0.2,     // Medium - prairie fruits
    'Metal Ore': 0.1,        // Low - not mining focused
    'Stone': 0.1,            // Low - mostly flat plains
    'Fish': 0.1,             // Low - rivers only
    'Lumber': 0.1,           // Low - few trees
    'Spices': 0.2            // Medium - prairie herbs
  },
  
  'boreal': {
    'Lumber': 0.5,           // Very High - forest timber
    'Hides/Furs': 0.4,      // High - forest animals
    'Fish': 0.3,             // High - forest lakes/rivers
    'Metal Ore': 0.2,        // Medium - some mining
    'Grains': 0.1,           // Low - short growing season
    'Dried Fruits': 0.2,     // Medium - forest berries
    'Spices': 0.2,           // Medium - forest herbs
    'Stone': 0.2,            // Medium - forest quarries
    'Gemstones': 0.1,        // Low - limited deposits
    'Precious Metals': 0.1   // Low - not mining focused
  },
  
  'tundra': {
    'Hides/Furs': 0.5,      // Very High - arctic furs
    'Fish': 0.3,             // High - arctic fishing
    'Dried Meat': 0.3,       // High - preserved meat
    'Metal Ore': 0.1,        // Low - permafrost issues
    'Lumber': 0.0,           // None - no trees
    'Grains': 0.0,           // None - too cold
    'Dried Fruits': 0.0,     // None - no fruits
    'Spices': 0.1,           // Low - arctic herbs only
    'Stone': 0.1,            // Low - permafrost issues
    'Gemstones': 0.1         // Low - few accessible deposits
  }
};

// Get weighted exports based on biome likelihood
function getWeightedBiomeExports(geoClassification, count = 5) {
  const biome = geoClassification.primaryBiome;
  const weights = biomeExportWeights[biome] || {};
  
  // Create weighted list of possible exports
  const weightedExports = [];
  
  Object.keys(specificCommodities).forEach(category => {
    const weight = weights[category] || 0.1; // Default low weight
    const items = getLocationSpecificItems([geoClassification.primaryGeography], [geoClassification.primaryClimate], category);
    
    // Add items multiple times based on weight (higher weight = more likely to be selected)
    const copies = Math.floor(weight * 10); // Convert 0.0-1.0 to 0-10 copies
    for (let i = 0; i < copies; i++) {
      weightedExports.push(...items);
    }
  });
  
  // Remove duplicates and randomly select
  const uniqueExports = [...new Set(weightedExports)];
  return getRandomItems(uniqueExports, count);
}

// Enhanced export generation with biome weighting
function generateExports(settlement, count = 5) {
  const culture = settlement.Culture || settlement.culture || '';
  const classification = classifySettlement(settlement);
  const exports = [];
  
  console.debug(`Generating exports for ${settlement.Burg}:`, {
    geography: classification.primaryGeography,
    climate: classification.primaryClimate, 
    biome: classification.primaryBiome,
    elevation: settlement["Elevation (ft)"],
    temp: settlement.Temperature
  });
  
  // Culture-specific exports (override biome for some items)
  if (culture === 'Dwarves') {
    exports.push(...getCultureSpecificItems(culture, 'Precious Metals').slice(0, 2));
    exports.push(...getCultureSpecificItems(culture, 'Metal Ore').slice(0, 1));
    exports.push(...getCultureSpecificItems(culture, 'Gemstones').slice(0, 1));
  } else if (culture === 'Eldar') {
    exports.push(...getCultureSpecificItems(culture, 'Fabric').slice(0, 2));
    exports.push(...getCultureSpecificItems(culture, 'Lumber').slice(0, 1));
  } else {
    // Use biome-weighted exports for non-specific cultures
    const biomeExports = getWeightedBiomeExports(classification, count);
    exports.push(...biomeExports);
  }
  
  // Fill remaining slots if needed
  while (exports.length < count) {
    const fallbackExports = getWeightedBiomeExports(classification, count - exports.length);
    const newExports = fallbackExports.filter(item => !exports.includes(item));
    exports.push(...newExports.slice(0, count - exports.length));
    
    // Prevent infinite loop
    if (newExports.length === 0) break;
  }
  
  return exports.slice(0, count);
}

// Generate imports based on what the settlement lacks (opposite of biome strengths)
function generateImports(settlement, exports, count = 5) {
  const culture = settlement.Culture || settlement.culture || '';
  const classification = classifySettlement(settlement);
  const imports = [];
  
  // What this geography typically needs (opposite of what they produce well)
  if (classification.geographic.includes('mountain') || classification.geographic.includes('high_mountain') || classification.geographic.includes('extreme_mountain')) {
    // Mountain settlements need coastal and lowland goods
    imports.push(...getRandomItems(getLocationSpecificItems(['coastal'], ['temperate'], 'Fish'), 2));
    imports.push(...getRandomItems(getLocationSpecificItems(['common'], ['temperate'], 'Grains'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['tropical'], ['hot'], 'Spices'), 1));
  } 
  else if (classification.geographic.includes('coastal')) {
    // Coastal settlements need mountain resources
    imports.push(...getRandomItems(getLocationSpecificItems(['mountain'], classification.climatic, 'Stone'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['mountain'], classification.climatic, 'Metal Ore'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['mountain'], classification.climatic, 'Gemstones'), 1));
  }
  else if (classification.biome.includes('continental_interior') || classification.biome.includes('grasslands')) {
    // Interior settlements need coastal specialties and luxury goods
    imports.push(...getRandomItems(getLocationSpecificItems(['coastal'], ['temperate'], 'Fish'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['tropical'], ['hot'], 'Spices'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['mountain'], ['cold'], 'Gemstones'), 1));
  }
  else if (classification.biome.includes('desert')) {
    // Desert settlements need water-dependent goods
    imports.push(...getRandomItems(getLocationSpecificItems(['coastal'], ['temperate'], 'Fish'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['common'], ['temperate'], 'Grains'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['boreal'], ['cold'], 'Lumber'), 1));
  }
  else if (classification.biome.includes('tundra') || classification.biome.includes('frozen_peaks')) {
    // Arctic settlements need everything from warmer climates
    imports.push(...getRandomItems(getLocationSpecificItems(['common'], ['temperate'], 'Grains'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['tropical'], ['hot'], 'Dried Fruits'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['temperate'], ['warm'], 'Fabric'), 1));
  }
  
  // Culture-specific needs
  if (culture === 'Dwarves') {
    // Dwarves need surface goods
    imports.push(...getRandomItems(getLocationSpecificItems(['common'], ['temperate'], 'Grains'), 1));
    imports.push(...getRandomItems(getLocationSpecificItems(['common'], ['temperate'], 'Dried Fruits'), 1));
  }
  
  // Fill remaining with luxury/exotic items they don't produce locally
  const luxuryCategories = ['Precious Metals', 'Gemstones', 'Spices'];
  while (imports.length < count) {
    const randomCategory = luxuryCategories[Math.floor(Math.random() * luxuryCategories.length)];
    const luxuryItems = specificCommodities[randomCategory].luxury || specificCommodities[randomCategory].common || [];
    const randomItem = luxuryItems[Math.floor(Math.random() * luxuryItems.length)];
    
    if (randomItem && !exports.includes(randomItem) && !imports.includes(randomItem)) {
      imports.push(randomItem);
    }
  }
  
  return imports.slice(0, count);
}

// Utility function to get random items from an array
function getRandomItems(array, count) {
  if (!array || array.length === 0) return [];
  
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// Main function to generate trade goods for a settlement
function generateTradeGoods(settlement) {
  const exportCount = Math.floor(Math.random() * 3) + 3; // 3-5 exports
  const importCount = Math.floor(Math.random() * 3) + 3; // 3-5 imports
  
  const exports = generateExports(settlement, exportCount);
  const imports = generateImports(settlement, exports, importCount);
  
  return {
    exports: exports,
    imports: imports,
    exportsFormatted: exports.map(item => `- ${item}`).join('\n'),
    importsFormatted: imports.map(item => `- ${item}`).join('\n')
  };
}

module.exports = {
  generateTradeGoods,
  generateExports,
  generateImports,
  specificCommodities,
  classifySettlement
};