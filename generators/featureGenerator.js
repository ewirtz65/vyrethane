// featureGenerator.js - Feature and landmark generation functions

const { cultureMap, religions } = require('../data/cultures.js');
const { retryGenerateJSON } = require('../llmClient.js');
const { parseJSONResponse, generateJSONSafePrompt } = require('../jsonParser.js');
const { generateLandmarkJSON } = require('./landmarkGenerator.js');

async function generateFeatureJSON(settlement, feature, religion = '', useApi = false) {
  const city = settlement.Burg;
  console.log("Generating feature JSON for:", city, feature, religion);
  const cultureData = cultureMap[settlement.culture] || { type: "Unknown", namebase: "Generic Fantasy" };
  
  let basePrompt;

  if (feature.toLowerCase() === 'temple') {
    const deityList = religions[religion];
    const deity = deityList
      ? deityList[Math.floor(Math.random() * deityList.length)]
      : { name: religion, domain: 'mystery and the unknown', tone: 'cryptic and esoteric' };

    basePrompt = `
Describe a temple in the settlement of ${city}, dedicated to ${deity.name}, deity of ${deity.domain}.

Context:
- Naming Style: ${cultureData.namebase}
- Deity: ${deity.name}
- Domain: ${deity.domain}
- Tone: ${deity.tone}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "feature": {
    "name": "[Temple Name]",
    "description": "[Description of the temple, its architecture, rituals, cultural role]"
  }
}
\`\`\`

The description should reflect the ${deity.tone} tone of the worship. 
Avoid describing royalty or hero-worship. Clearly mention the deity's name in the description.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;
  } else {
    basePrompt = `
Describe and create a name for the ${feature.toLowerCase()} in the town of ${city}.

Context:
- Settlement: ${city}
- Feature Type: ${feature}
- Naming Style: ${cultureData.namebase}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "feature": {
    "name": "[Feature Name]",
    "description": "[2-3 immersive sentences about the feature]"
  }
}
\`\`\`

Keep the tone grounded and non-epic. Do not include the feature type in the response.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;
  }

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateFeatureJSON");
    
    if (!parsedData.feature?.name || !parsedData.feature?.description) {
      throw new Error('Invalid feature JSON structure');
    }
    
    return `### ${parsedData.feature.name}\n${parsedData.feature.description}`;
    
  } catch (err) {
    console.error("\x1b[31m", "Failed to generate feature:", err.message);
    return `### A forgotten ${feature}\nA ${feature.toLowerCase()} of uncertain origin.`;
  }
}

async function generateCivicFeatureJSON(settlement, key, keyDescription, useApi = false) {
  const basePrompt = `
Create a grounded civic feature related to the ${keyDescription}. 

Context:
- Settlement: ${settlement.Burg}
- Feature Type: ${key}
- Description Context: ${keyDescription}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "feature": {
    "name": "[Feature name, e.g. Castle ${settlement.Burg} or named for a famous family, adjective Port or wharf]",
    "description": "[One paragraph describing the location, sounds, smells, or unique cultural quirks associated with it]"
  }
}
\`\`\`

Do not refer to nobles or kings. Include immersive details. Avoid generic medieval descriptions. 
Do not add shops or taverns, just the feature itself. 
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateCivicFeatureJSON");
    
    if (!parsedData.feature?.name || !parsedData.feature?.description) {
      throw new Error('Invalid civic feature JSON structure');
    }
    
    return `### ${parsedData.feature.name}\n${parsedData.feature.description}`;
    
  } catch (err) {
    console.error("\x1b[31m", "Failed to generate civic feature:", err.message);
    return `### ${key} of ${settlement.Burg}\nA notable ${key.toLowerCase()} in the settlement.`;
  }
}

async function generateFeatureDescriptionsJSON(settlement, useApi = false, eventHints = []) {
  const civicFeatures = ['Port', 'Citadel', 'Walls', 'Plaza', 'Temple', 'Shanty Town'];
  const isCapital = !!settlement.Capital;
  
  const featuresPresent = civicFeatures.filter(
    key => settlement[key] && typeof settlement[key] === 'string' && settlement[key].trim() !== ''
  );
  
  const features = [];
  console.log("Features present:", featuresPresent);
  
  // Handle civic features (these return markdown)
  for (const key of featuresPresent) {
    let result = '';

    if (key.toLowerCase() === 'temple') {
      result = await generateFeatureJSON(settlement, 'Temple', settlement.Religion, useApi);
    } else {
      let keyDescription = getCivicFeatureDescription(key, settlement, isCapital);
      result = await generateCivicFeatureJSON(settlement, key, keyDescription, useApi);
    }

    features.push(`${result}`.trim());
  }
  
  // Bonus Landmark Ideas (these return JSON objects now)
  const bonusCount = Math.floor(Math.random() * settlement.popModifier) + 1;
  let previousLandmarkNames = [];
  console.log("\x1b[35m", " Generating", bonusCount, "bonus landmarks for:", settlement.Burg, "\x1b[0m");
  
  for (let i = 0; i < bonusCount; i++) {
    const hint = eventHints.length > 0
      ? eventHints[Math.floor(Math.random() * eventHints.length)].refined
      : '';
    
    // Generate landmark (returns JSON object)
    const landmarkObj = await generateLandmarkJSON(settlement, hint, previousLandmarkNames, useApi);

    // Extract and store the name to prevent duplicates
    const landmarkName = extractLandmarkName(landmarkObj);
    if (landmarkName) {
      previousLandmarkNames.push(landmarkName);
    }

    // Convert JSON object to markdown for display
    let landmarkMarkdown = `### ${landmarkObj.name}\n${landmarkObj.description}`;
    // Clean landmark description of any JSON artifacts
    landmarkMarkdown = landmarkMarkdown
      .replace(/[{}]/g, '')  // Remove any stray braces
      .replace(/"\s*$/, '')  // Remove trailing quotes
      .trim();

    features.push(landmarkMarkdown);
  }

  return features.join('\n\n');
}

function getCivicFeatureDescription(key, settlement, isCapital) {
  switch (key.toLowerCase()) {
    case 'citadel':
      if (isCapital) {
        return `grand citadel of ${settlement.Burg}, a fortified palace or administrative center serving as the seat of power for the ${settlement["State Full Name"]} and its ${settlement.leaderTitle} ${settlement.leaderName}`;
      } else {
        return `castle of ${settlement.Burg}, a fortified stronghold or keep used by guards and the ${settlement.leaderTitle} ${settlement.leaderName} lives and works`;
      }
    case 'walls':
      return `walls surrounding ${settlement.Burg}, such as stone ramparts or wooden palisades used for defense or identity`;
    case 'port':
      return `seaport district of ${settlement.Burg}, including docks, piers, and ship traffic along the waterfront`;
    case 'shanty town':
      return `shanty-town on the outskirts of ${settlement.Burg}, composed of improvised shelters and working-class dwellings`;
    case 'plaza':
      return `market plaza or central square of ${settlement.Burg}, used for festivals, markets, or public gatherings, the city imports ${settlement.importsFormatted} and exports ${settlement.exportsFormatted}`;
    default:
      return `${key.toLowerCase()} of ${settlement.Burg}`;
  }
}

function extractLandmarkName(landmarkData) {
  try {
    // If it's already an object, just get the name
    if (typeof landmarkData === 'object' && landmarkData.name) {
      return landmarkData.name;
    }
    
    // If it's a JSON string, parse it
    if (typeof landmarkData === 'string' && landmarkData.startsWith('{')) {
      const parsed = JSON.parse(landmarkData);
      return parsed.name;
    }
    
    // Fallback for markdown format (existing landmarks)
    if (typeof landmarkData === 'string' && landmarkData.includes('###')) {
      const lines = landmarkData.split('\n').map(line => line.trim());
      const nameLine = lines.find(l => l.startsWith('### '));
      
      if (nameLine) {
        const name = nameLine.replace('### ', '').trim();
        return name;
      }
    }
    
    console.warn("Could not extract landmark name from:", landmarkData);
    return null;
    
  } catch (error) {
    console.error("\x1b[31m", "Error extracting landmark name:", error);
    return null;
  }
}

module.exports = {
  generateFeatureJSON,
  generateCivicFeatureJSON,
  generateFeatureDescriptionsJSON
};