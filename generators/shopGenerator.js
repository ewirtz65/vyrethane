// shopGenerator.js - Shop generation functions

const {
  cultureSpeciesMap,
  cultureSummaryMap,
  cultureMap
} = require('../data/cultures.js');

const { retryGenerateJSON } = require('../llmClient.js');
const { parseJSONResponse, generateJSONSafePrompt } = require('../jsonParser.js');
const { createFallbackShop } = require('./fallbackGenerators.js');

async function generateShopsBatchJSON(settlement, shopTypes = []) {
  const city = settlement.Burg;
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[cultureKey] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[cultureKey] || "a diverse cultural mix shaped by regional needs and ancient memory";
  
  // Get biome classification for environmental context
  const { classifySettlement } = require('../enhancedTrade.js');
  const geoClassification = classifySettlement(settlement);
  
  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  // Create biome-specific context for shops
  const biomeContext = getBiomeShopContext(geoClassification);

  const basePrompt = `
Create ${shopTypes.length} shops for the town of ${city} in ${settlement["Province Full Name"]}.

Cultural Context:
- Naming Style: ${cultureData.namebase}
- Cultural Summary: ${cultureTone}
- Species Demographics:
${speciesBlock}

Environmental Context:
- Geographic Setting: ${geoClassification.primaryGeography}
- Biome: ${geoClassification.primaryBiome}
- Environmental Notes: ${biomeContext}

Shop types to generate: ${shopTypes.join(', ')}

CRITICAL: Respond with ONLY valid JSON in this exact format:
\`\`\`json
{
  "shops": [
    {
      "type": "[shop type]",
      "name": "[distinctive shop name]",
      "owner": "[Owner Name]",
      "description": "[Detailed paragraph describing the shop, its atmosphere, and how it adapts to the ${geoClassification.primaryBiome} environment. Include sensory details and environmental adaptations.]"
    }
  ]
}
\`\`\`

Generate exactly ${shopTypes.length} shops. Use ${cultureData.namebase} heritage for owner naming. Each shop description should reflect how the business adapts to and utilizes the ${geoClassification.primaryBiome} environment. Include details about construction materials, storage methods, seasonal adaptations, or environmental challenges specific to this biome.

No additional text outside the JSON code block. Shop names should NOT include the owner name.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateShopsBatchJSON");
    
    if (!parsedData.shops || !Array.isArray(parsedData.shops)) {
      throw new Error('Invalid JSON structure - missing shops array');
    }
    
    // Convert to your existing format for compatibility
    const results = {};
    parsedData.shops.forEach((shop) => {
      if (!shop.type || !shop.name || !shop.owner || !shop.description) {
        console.warn('Incomplete shop data:', shop);
        return;
      }
      
      if (!results[shop.type]) {
        results[shop.type] = [];
      }
      
      results[shop.type].push(
        `- **Shop name:** ${shop.name}\n- **Owner name:** ${shop.owner}\n\n${shop.description}`
      );
    });
    
    console.log('\x1b[36m%s\x1b[0m', `Generated ${shopTypes.length} shops for ${geoClassification.primaryBiome} environment`);
    return results;
    
  } catch (err) {
    console.error("\x1b[31m", "JSON shop generation failed:", err.message, "\x1b[0m");
    console.log("\x1b[33m", "Using fallback shop generation...", "\x1b[0m");
    
    // Create fallback shops
    const results = {};
    shopTypes.forEach(type => {
      const fallbackShop = createFallbackShop(type, settlement);
      if (!results[fallbackShop.type]) {
        results[fallbackShop.type] = [];
      }
      results[fallbackShop.type].push(
        `- **Shop name:** ${fallbackShop.name}\n- **Owner name:** ${fallbackShop.owner}\n\n${fallbackShop.description}`
      );
    });
    
    return results;
  }
}

// Helper function to create biome-specific shop context
function getBiomeShopContext(geoClassification) {
  const biomeShopContext = {
    'alpine': 'Shops must withstand extreme cold, heavy snow loads, and thin air. Stone construction is common, with thick walls and small windows. Goods must be stored to prevent freezing.',
    'highland': 'Mountain shops often built into hillsides or use local stone. Cool temperatures help preserve goods but require heating. Wind is a constant concern.',
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
    'mixed': 'Shops must adapt to varied environmental conditions throughout the year.'
  };

  const biome = geoClassification.primaryBiome;
  return biomeShopContext[biome] || `Shops adapt to the local ${biome} environment.`;
}

module.exports = {
  generateShopsBatchJSON
};