// biomeContext.js - Centralized biome context and descriptions

// General biome descriptions for settlement descriptions
const biomeDescriptions = {
  'alpine': 'The settlement sits among towering peaks where snow persists year-round and the air is thin and crisp.',
  'highland': 'Rolling hills and rocky outcrops define the landscape, with cooler temperatures and mountain breezes.',
  'upland': 'Elevated terrain provides commanding views while moderate slopes offer good drainage and building sites.',
  'valley': 'Nestled in a sheltered valley with fertile soil and protection from harsh weather.',
  'lowland': 'Situated on flat, fertile plains with easy access to water and transportation routes.',
  'maritime': 'Salt air and the sound of waves create a coastal atmosphere with maritime influences throughout.',
  'cold_coast': 'Icy winds blow off frigid waters, creating a harsh coastal environment with ice-crusted shores.',
  'temperate_coast': 'Moderate sea breezes and temperate waters create a pleasant coastal climate.',
  'warm_coast': 'Warm ocean breezes and tropical coastal conditions define the seaside atmosphere.',
  'continental_interior': 'Far from any major water body, the climate shows extreme seasonal variations and wide temperature swings.',
  'grasslands': 'Vast open plains stretch to the horizon with rolling grasslands and big skies.',
  'cold_plains': 'Harsh winds sweep across frozen or near-frozen plains with sparse vegetation.',
  'hot_plains': 'Heat shimmers rise from sun-baked flatlands where the horizon wavers in the distance.',
  'boreal': 'Dense coniferous forests dominate the landscape with cool, moist conditions year-round.',
  'tundra': 'Permafrost underlies the treeless landscape where only the hardiest vegetation survives.',
  'desert': 'Arid conditions and sparse vegetation create a harsh environment of sand, rock, and scattered oases.',
  'temperate': 'Four distinct seasons and moderate conditions create a balanced, habitable environment.',
  'subtropical': 'Warm, humid conditions support lush vegetation and abundant rainfall.',
  'tropical': 'Year-round warmth and abundant moisture create a verdant, jungle-like environment.',
  'mixed': 'The landscape shows characteristics of multiple biomes, creating a diverse natural environment.',
  'clifftop': 'Perched on dramatic cliffs with sweeping views and constant exposure to wind and weather.',
  'permafrost': 'The permanently frozen ground shapes all aspects of life and construction.',
  'desert_valley': 'A sheltered basin in arid lands, possibly with hidden water sources or ancient lake beds.',
  'extreme_mountain': 'At extreme altitude where the air is dangerously thin, only the hardiest races can survive the brutal conditions and perpetual cold.',
  'peak_summit': 'Perched at legendary heights where few dare to dwell, the settlement exists in a realm of constant wind, ice, and breathtaking isolation.',
  'death_zone': 'At altitudes where most mortals cannot survive, this settlement exists in the realm of legends and the most resilient of races.',
  'frozen_peaks': 'Locked in eternal winter at crushing altitude, where ice never melts and the air barely sustains life.'
};

// Shop-specific environmental contexts
const biomeShopContext = {
  'alpine': 'Shops must withstand extreme cold, heavy snow loads, and thin air. Stone construction is common, with thick walls and small windows. Goods must be stored to prevent freezing.',
  'highland': 'Mountain shops often built into hillsides or use local stone. Cool temperatures help preserve goods but require heating. Wind is a constant concern.',
  'upland': 'Elevated shops benefit from good drainage but face exposure to weather. Stone and timber construction adapted to slopes and rocky ground.',
  'valley': 'Shops in fertile valleys enjoy moderate conditions but may face seasonal flooding or mist. Good access to agricultural products.',
  'lowland': 'Flat terrain allows flexible construction but drainage can be challenging. Easy access for trade and transportation.',
  'maritime': 'Coastal shops deal with salt air corrosion, humidity, and storms. Many use weather-resistant materials and have good ventilation to prevent mold.',
  'cold_coast': 'Shops face freezing spray, ice formation, and harsh winter storms. Buildings are heavily insulated with protected entrances.',
  'temperate_coast': 'Moderate coastal conditions allow varied construction but require protection from storms and salt air.',
  'warm_coast': 'Tropical coastal shops emphasize ventilation, hurricane resistance, and protection from intense sun and salt air.',
  'continental_interior': 'Shops must handle extreme temperature swings between seasons. Good insulation and heating/cooling are essential.',
  'grasslands': 'Open plains shops often serve as waypoints for travelers. Built to withstand strong winds and weather extremes.',
  'cold_plains': 'Harsh winter conditions require substantial heating and wind protection. Summer brings relief but also storms.',
  'hot_plains': 'Shops emphasize cooling, shade, and protection from dust storms. Water conservation is often important.',
  'boreal': 'Forest shops often use local timber construction. Damp conditions require good ventilation and waterproofing.',
  'tundra': 'Permafrost affects foundations. Shops are heavily insulated and may be partially underground for warmth.',
  'desert': 'Thick walls provide insulation from heat. Shops often have courtyards, water features, and emphasize shade.',
  'temperate': 'Moderate conditions allow flexible construction. Shops adapt to four distinct seasons.',
  'subtropical': 'High humidity requires good ventilation. Protection from heat and heavy rains is important.',
  'tropical': 'Emphasis on airflow, protection from heavy rains, and resistance to heat and humidity.',
  'mixed': 'Shops must adapt to varied environmental conditions throughout the year.',
  'clifftop': 'Clifftop shops require strong foundations and wind-resistant construction. Spectacular views but challenging access.',
  'permafrost': 'Special foundations needed for permafrost. All construction must account for ground that never thaws.',
  'desert_valley': 'Valley shops benefit from shelter but face temperature extremes. Water access is crucial for business.',
  'extreme_mountain': 'Shops must be carved into living rock or built with massive stone blocks. Multiple heating systems are essential, and goods require specialized storage to prevent freezing solid. Air is so thin that even simple tasks are exhausting.',
  'peak_summit': 'Only the most essential shops can exist at this altitude, often built completely underground or into cliff faces. Requires magical or extraordinary engineering to maintain breathable air and prevent everything from freezing. Access is treacherous and seasonal.',
  'death_zone': 'Shops at this altitude are marvels of engineering or magic, requiring extraordinary measures to sustain life. Everything must be imported as nothing can grow naturally. Only the hardiest races with special adaptations can work here.',
  'frozen_peaks': 'Perpetually frozen conditions require constant heating and specialized construction. Shops are often multi-level underground complexes carved from ice and stone, with elaborate ventilation systems to prevent suffocation.'
};

// Event-specific environmental contexts  
const biomeEventContext = {
  'alpine': {
    natural: ['avalanche', 'blizzard', 'rockslide', 'ice storm', 'altitude sickness outbreak'],
    economic: ['mining discovery', 'pass closure', 'trade route blockage', 'mountaineering expedition'],
    seasonal: ['winter isolation', 'spring melt flooding', 'peak climbing season', 'harsh winter'],
    resources: ['ore vein discovered', 'gemstone find', 'stone quarry opened', 'ice harvest']
  },
  'extreme_mountain': {
    natural: ['massive avalanche', 'whiteout blizzard', 'rock fall catastrophe', 'altitude death', 'ice bridge collapse'],
    economic: ['legendary ore discovery', 'impossible pass opened', 'extreme altitude mining', 'high-altitude expedition base'],
    seasonal: ['complete winter isolation', 'brief summer access', 'extreme weather season', 'supply drop season'],
    resources: ['rare crystal formation found', 'ancient ore vein', 'ice-locked treasure', 'high-altitude gemstone deposit']
  },
  'peak_summit': {
    natural: ['summit storm', 'ice shelf collapse', 'extreme altitude exposure', 'legendary creature sighting', 'mystical phenomena'],
    economic: ['summit shrine establishment', 'impossible trade route', 'legendary artifact discovery', 'extreme pilgrimage site'],
    seasonal: ['eternal winter', 'brief climbing window', 'storm-locked season', 'legendary visibility'],
    resources: ['mythical ore discovery', 'dragon nest treasure', 'ancient summit artifacts', 'legendary crystal formation']
  },
  'death_zone': {
    natural: ['unsurvivable storm', 'oxygen depletion crisis', 'extreme cold snap', 'altitude death wave', 'impossible conditions'],
    economic: ['miraculous survival story', 'impossible construction project', 'legendary resource discovery', 'mythical trade opportunity'],
    seasonal: ['death season', 'impossible survival period', 'legendary endurance test', 'mythical accessibility'],
    resources: ['impossible mineral discovery', 'legendary artifact cache', 'mythical ore vein', 'ancient treasure vault']
  },
  'frozen_peaks': {
    natural: ['eternal blizzard', 'ice avalanche', 'permafrost shift', 'frozen wasteland expansion', 'ice age conditions'],
    economic: ['ice mining operation', 'frozen trade route', 'survival equipment manufacturing', 'cold-weather research'],
    seasonal: ['perpetual winter', 'ice-locked isolation', 'frozen solid period', 'survival season'],
    resources: ['ancient ice discoveries', 'frozen mammoth finds', 'ice-locked artifacts', 'permafrost treasures']
  },
  'maritime': {
    natural: ['storm surge', 'shipwreck', 'tidal wave', 'sea monster sighting', 'coastal erosion'],
    economic: ['fishing boom', 'trading fleet arrival', 'port expansion', 'lighthouse construction'],
    seasonal: ['storm season', 'calm seas period', 'migration season', 'harbor freeze'],
    resources: ['pearl discovery', 'whale beaching', 'new fishing grounds', 'salvage operation']
  },
  'desert': {
    natural: ['sandstorm', 'flash flood', 'oasis discovery', 'mirage sighting', 'drought'],
    economic: ['caravan route established', 'water rights dispute', 'salt mine opened', 'nomad trade'],
    seasonal: ['scorching summer', 'brief rainy season', 'migration period', 'cool season'],
    resources: ['underground spring found', 'salt deposit discovered', 'rare mineral find', 'date palm grove']
  },
  'tundra': {
    natural: ['ice break-up', 'permafrost shift', 'aurora display', 'extreme cold snap', 'brief summer'],
    economic: ['fur trade boom', 'ice road opening', 'survival supply shortage', 'hunting expedition'],
    seasonal: ['endless daylight period', 'polar night', 'brief thaw', 'migration season'],
    resources: ['mammoth ivory find', 'rare fur discovery', 'ice fishing grounds', 'preserved artifacts']
  },
  'boreal': {
    natural: ['forest fire', 'deep snow', 'river freeze', 'wildlife migration', 'tree disease'],
    economic: ['logging boom', 'fur trapping season', 'lumber export', 'maple syrup harvest'],
    seasonal: ['spring breakup', 'autumn colors', 'winter logging', 'summer growing season'],
    resources: ['rare wood discovery', 'medicinal plants found', 'new hunting grounds', 'river route opened']
  },
  'grasslands': {
    natural: ['prairie fire', 'tornado', 'drought', 'locust swarm', 'severe thunderstorm'],
    economic: ['cattle drive', 'grain harvest', 'trading post established', 'railroad survey'],
    seasonal: ['growing season', 'harvest time', 'winter storms', 'spring flooding'],
    resources: ['fertile soil discovery', 'water well struck', 'grazing rights dispute', 'wild horse capture']
  },
  'tropical': {
    natural: ['hurricane', 'volcanic eruption', 'monsoon flooding', 'earthquake', 'disease outbreak'],
    economic: ['spice trade boom', 'plantation establishment', 'exotic goods discovery', 'shipping route'],
    seasonal: ['dry season', 'wet season', 'harvest festivals', 'storm season'],
    resources: ['rare spice discovery', 'precious wood find', 'medicinal plant discovery', 'fertile valley found']
  }
};

// Construction material preferences by biome
const biomeMaterials = {
  'alpine': ['stone', 'thick timber', 'slate roofing', 'heavy insulation'],
  'highland': ['local stone', 'timber framing', 'tile roofing', 'wind barriers'],
  'maritime': ['treated timber', 'weathered stone', 'slate or metal roofing', 'salt-resistant materials'],
  'desert': ['adobe', 'thick stone walls', 'flat roofing', 'cooling courtyards'],
  'tundra': ['heavy timber', 'sod construction', 'underground elements', 'extreme insulation'],
  'boreal': ['local timber', 'log construction', 'steep roofing', 'moisture barriers'],
  'grasslands': ['timber framing', 'sod or thatch', 'storm cellars', 'wind-resistant design'],
  'tropical': ['raised construction', 'ventilated design', 'storm shutters', 'water management'],
  'extreme_mountain': ['massive stone blocks', 'reinforced underground construction', 'multiple heating systems', 'specialized air circulation'],
  'peak_summit': ['carved rock chambers', 'magical construction materials', 'extraordinary insulation', 'pressurized environments'],
  'death_zone': ['legendary construction techniques', 'magical environmental control', 'impossible materials', 'life-sustaining architecture'],
  'frozen_peaks': ['ice-reinforced stone', 'multi-level underground complexes', 'perpetual heating systems', 'frozen-resistant materials']
};

// Get general biome description for settlement descriptions
function getBiomeDescription(geoClassification) {
  const biome = geoClassification.primaryBiome;
  return biomeDescriptions[biome] || `The ${biome} environment shapes the character of the settlement.`;
}

// Get shop-specific biome context
function getBiomeShopContext(geoClassification) {
  const biome = geoClassification.primaryBiome;
  return biomeShopContext[biome] || `Shops adapt to the local ${biome} environment.`;
}

// Get event-specific biome context for historical events
function getBiomeEventContext(geoClassification, eventType = 'natural') {
  const biome = geoClassification.primaryBiome;
  const biomeEvents = biomeEventContext[biome];
  
  if (!biomeEvents) {
    return ['environmental challenge', 'seasonal change', 'natural occurrence'];
  }
  
  return biomeEvents[eventType] || biomeEvents.natural || ['environmental challenge'];
}

// Get construction materials typical for this biome
function getBiomeMaterials(geoClassification) {
  const biome = geoClassification.primaryBiome;
  return biomeMaterials[biome] || ['local materials', 'adapted construction'];
}

// Get seasonal considerations for the biome
function getBiomeSeasons(geoClassification) {
  const seasonalPatterns = {
    'alpine': 'Long harsh winters with brief cool summers. Snow persists most of the year.',
    'maritime': 'Moderate seasons moderated by ocean proximity. Storms are seasonal.',
    'desert': 'Extreme heat in summer, cool winters. Brief rainy seasons bring life.',
    'tundra': 'Extremely long winters with brief, intense summers. Permafrost year-round.',
    'boreal': 'Cold winters and warm summers. Spring breakup and autumn freeze are dramatic.',
    'grasslands': 'Hot summers and cold winters with dramatic seasonal storms.',
    'tropical': 'Wet and dry seasons rather than temperature-based seasons.',
    'extreme_mountain': 'Perpetual winter conditions with brief periods of slightly less deadly weather. Survival depends on constant vigilance.',
    'peak_summit': 'No true seasons - only variations of lethally cold conditions. Weather patterns are legendary and unpredictable.',
    'death_zone': 'Conditions beyond normal seasonal patterns. Only the most extraordinary events mark time passage.',
    'frozen_peaks': 'Eternal winter locked in ice. Time measured in survival milestones rather than seasons.'
  };
  
  const biome = geoClassification.primaryBiome;
  return seasonalPatterns[biome] || 'Four distinct seasons with typical temperature and weather patterns.';
}

module.exports = {
  getBiomeDescription,
  getBiomeShopContext,
  getBiomeEventContext,
  getBiomeMaterials,  
  getBiomeSeasons,
  biomeDescriptions,
  biomeShopContext,
  biomeEventContext,
  biomeMaterials
};