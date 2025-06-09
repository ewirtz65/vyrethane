// descriptionGenerator.js - Settlement description generation functions

const { cultureSummaryMap, cultureMap } = require('../data/cultures.js');
const { retryGenerateJSON } = require('../llmClient.js');
const { parseJSONResponse, generateJSONSafePrompt } = require('../jsonParser.js');
const { getBiomeDescription } = require('../biomeContext.js');

// Utility function
function formatNumber(num) {
  return Number(num).toLocaleString('en-US');
}

function getPortDescription(settlement) {
  const civicFeatures = ['Port', 'Citadel', 'Walls', 'Plaza', 'Temple', 'Shanty Town'];
  const featuresPresent = civicFeatures.filter(
    key => settlement[key] && typeof settlement[key] === 'string' && settlement[key].trim() !== ''
  );

  return featuresPresent.includes('Port') ? ' The city is a seaport.' : '';
}

async function generateBurgDescriptionJSON(settlement, geoClassification,townQuality, useApi = false) {
  const city = settlement.Burg;
  const normalizedCulture = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[normalizedCulture] || { type: "Unknown", namebase: "Generic Fantasy" };
  const cultureTone = cultureSummaryMap[normalizedCulture] || "a diverse cultural mix shaped by regional needs and ancient memory";

  // Use centralized biome description
  const biomeContext = getBiomeDescription(geoClassification);
  const portContext = getPortDescription(settlement);

const qualityNarrative = [
  townQuality.residents >= 4 ? "Residents are known for their warmth and helpfulness." :
  townQuality.residents <= 2 ? "Locals are often wary or unfriendly toward outsiders." : "The town has a mix of friendly and indifferent residents.",

  townQuality.services >= 4 ? "Most services and supplies are readily available." :
  townQuality.services <= 2 ? "Finding specialized services or goods is difficult here." : "Basic services exist, but advanced facilities are limited.",

  townQuality.comfort >= 4 ? "Visitors enjoy clean inns, good food, and a cozy atmosphere." :
  townQuality.comfort <= 2 ? "Travelers struggle to find decent food or shelter." : "Accommodations are functional, if modest."
].join(' ');
  const basePrompt = `
Generate a detailed description of ${city}.

Context:
- Naming Style: ${cultureData.namebase}
- Cultural Context: ${cultureTone}
- Geographic Setting: ${geoClassification.primaryGeography}
- Climate: ${geoClassification.primaryClimate}  
- Biome: ${geoClassification.primaryBiome}
- Population: ${formatNumber(settlement.Population)}
- Environmental Setting: ${biomeContext}
${portContext}
${qualityNarrative}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "description": {
    "text": "[Detailed immersive paragraph description of the settlement that reflects its ${geoClassification.primaryBiome} biome setting]"
  }
}
\`\`\`

Create an immersive paragraph using present tense. Describe how the settlement fits into and adapts to its ${geoClassification.primaryBiome} environment. Include sensory details appropriate to this biome (sounds, smells, visual elements). Do not offer to expand on the description.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateBurgDescriptionJSON");
    
    if (!parsedData.description?.text) {
      throw new Error('Invalid description JSON structure');
    }
    
    console.log('\x1b[36m%s\x1b[0m', `Generated ${geoClassification.primaryBiome} burg description`);
    return parsedData.description.text;
    
  } catch (err) {
    console.error("\x1b[31m", "Error generating burg description:", err.message, "\x1b[0m");
    return `${settlement.Burg} is a ${settlement.size.toLowerCase()} settlement in the ${geoClassification.primaryBiome} with a population of ${formatNumber(settlement.Population)} residents.`;
  }
}

async function generateCapitalDescriptionJSON(settlement, geoClassification, useApi = false) {
  const city = settlement.Burg;
  const normalizedCulture = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[normalizedCulture] || { type: "Unknown", namebase: "Generic Fantasy" };
  const cultureTone = cultureSummaryMap[normalizedCulture] || "a diverse cultural mix shaped by regional needs and ancient memory";

  // Use centralized biome description
  const biomeContext = getBiomeDescription(geoClassification);
  const portContext = getPortDescription(settlement);

  const basePrompt = `
Generate a detailed description of ${city}, capital city of ${settlement["State Full Name"]}.

Context:
- Naming Style: ${cultureData.namebase}
- Cultural Context: ${cultureTone}
- Geographic Setting: ${geoClassification.primaryGeography}
- Climate: ${geoClassification.primaryClimate}
- Biome: ${geoClassification.primaryBiome}
- Population: ${formatNumber(settlement.Population)}
- Environmental Setting: ${biomeContext}
${portContext}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "description": {
    "text": "[Detailed immersive paragraph description of the capital city that reflects its ${geoClassification.primaryBiome} biome setting and political importance]"
  }
}
\`\`\`

Create a grounded immersive paragraph using present tense. Describe how this capital city dominates and adapts to its ${geoClassification.primaryBiome} environment. Include architectural and urban elements that reflect both the biome and its status as a seat of power. Do not list languages or offer to expand on the description.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateCapitalDescriptionJSON");
    
    if (!parsedData.description?.text) {
      throw new Error('Invalid description JSON structure');
    }
    
    console.log('\x1b[36m%s\x1b[0m', `Generated ${geoClassification.primaryBiome} capital description`);
    return parsedData.description.text;
    
  } catch (err) {
    console.error("\x1b[31m", "Error generating capital description:", err.message, "\x1b[0m");
    return `${settlement.Burg} serves as the capital of ${settlement["State Full Name"]}, a ${settlement.size.toLowerCase()} in the ${geoClassification.primaryBiome} with ${formatNumber(settlement.Population)} inhabitants.`;
  }
}

module.exports = {
  generateBurgDescriptionJSON,
  generateCapitalDescriptionJSON
};