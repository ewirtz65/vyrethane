// GenerateJSON.js - Main JSON generation orchestrator (refactored with consistent function usage)

const {
  cultureSpeciesMap,
  cultureSummaryMap,
  cultureMap,
  religions
} = require('./data/cultures.js');
const { currentYear } = require('./config.js');

// Import our modules
const { retryGenerateJSON } = require('./llmClient.js');
const { 
  parseJSONResponse, 
  generateJSONSafePrompt  // Use the correct function name consistently
} = require('./jsonParser.js');
const {
  createFallbackTavern,
  createFallbackShop,
  createFallbackLandmark,
  createFallbackLeader,
  createFallbackEvents,
  generateCulturalName
} = require('./generators/fallbackGenerators.js');

async function generateTavernsBatchJSON(settlement, tavernTypes = [], useApi = false) {
  const city = settlement.Burg;
  console.log("Generating", tavernTypes.length, "taverns for:", city, "Types:", tavernTypes.join(', '));
  
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[cultureKey] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[cultureKey] || "a diverse cultural mix shaped by regional needs and ancient memory";

  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  const prompt = `
Create ${tavernTypes.length} different taverns/inns in the town of ${city}, located in the province of ${settlement["Province Full Name"]}.
Each tavern must have a distinct name, innkeeper, and description that fits the cultural and demographic tone.
NO DUPLICATE NAMES - each tavern must be completely unique.

Naming Style: ${cultureData.namebase}
Cultural Summary: ${cultureTone}
Species Demographics:
${speciesBlock}

CRITICAL: Respond with ONLY valid JSON in this exact format:
\`\`\`json
{
  "taverns": [
    {
      "type": "${tavernTypes[0] || 'tavern'}",
      "name": "[Unique tavern name]",
      "innkeeper": "[Innkeeper name]",
      "signature": "[Signature drink or tradition]",
      "description": "[Atmospheric description in present tense]"
    }
  ]
}
\`\`\`

Tavern types to generate: ${tavernTypes.join(', ')}

Generate exactly ${tavernTypes.length} taverns. Avoid generic names like "The Prancing Pony" or "Red Dragon Inn." 
Create unique, culturally appropriate names. Use present tense. Each tavern should feel distinct in atmosphere and clientele.
No additional text outside the JSON code block.

Entropy Key: ${Math.random().toString(36).slice(2, 7)}
`.trim();

  const safePrompt = generateJSONSafePrompt(prompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateTavernsBatchJSON");
    
    if (!parsedData.taverns || !Array.isArray(parsedData.taverns)) {
      throw new Error('Invalid taverns JSON structure');
    }
    
    return parsedData.taverns;

  } catch (err) {
    console.error("\x1b[31m", "Error in batch tavern generation:", err.message);
    
    // Fallback to individual generation with name tracking
    const results = [];
    const usedNames = new Set();
    
    for (const type of tavernTypes) {
      try {
        const tavern = await generateSingleTavern(settlement, type, usedNames);
        if (tavern && !usedNames.has(tavern.name)) {
          usedNames.add(tavern.name);
          results.push(tavern);
        }
      } catch (fallbackErr) {
        console.error("\x1b[31m", `Fallback tavern generation failed for ${type}:`, fallbackErr.message);
        results.push(createFallbackTavern(settlement, type));
      }
    }
    
    return results;
  }
}

async function generateSingleTavern(settlement, style, usedNames = new Set()) {
  const cultureData = cultureMap[settlement.Culture] || { type: "Unknown", namebase: "Generic Fantasy" };
  const city = settlement.Burg;
  
  const avoidNames = Array.from(usedNames).length > 0 
    ? `Avoid these already used names: ${Array.from(usedNames).join(', ')}.`
    : '';

  const prompt = `
Create a tavern in the city of ${city}.
Style: ${style} (e.g. noble, seedy dive, adventurer hub, dock-side).
Naming Style: ${cultureData.namebase}
${avoidNames}

Format as a single-spaced markdown list:
- **Tavern name:** [Unique tavern name]
- **Innkeeper name:** [Innkeeper name]
- **Signature drink or tradition:** [Signature drink or tradition]

[2-3 sentence atmospheric description using present tense. No royal references.]

Make it immersive and unique.
`.trim();

  try {
    const responseText = await retryGenerateJSON(prompt);
    
    // Parse the markdown response to extract components
    const lines = responseText.split('\n').map(line => line.trim()).filter(line => line);
    
    let name = "Unknown";
    let innkeeper = "Unknown"; 
    let signature = "Unknown";
    let description = "A tavern of uncertain character.";
    
    for (const line of lines) {
      if (line.includes('**Tavern name:**')) {
        name = line.replace(/.*\*\*Tavern name:\*\*\s*/, '').trim();
      } else if (line.includes('**Innkeeper name:**')) {
        innkeeper = line.replace(/.*\*\*Innkeeper name:\*\*\s*/, '').trim();
      } else if (line.includes('**Signature drink or tradition:**')) {
        signature = line.replace(/.*\*\*Signature drink or tradition:\*\*\s*/, '').trim();
      } else if (!line.includes('**') && line.length > 20) {
        // This is likely the description
        description = line;
      }
    }
    
    return { name, innkeeper, signature, description };
    
  } catch (err) {
    console.error("\x1b[31m", "Single tavern generation failed:", err.message);
    return createFallbackTavern(settlement, style);
  }
}

// Main JSON generation functions
async function generateTavernJSON(settlement, style = 'adventurer-hub') {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[cultureKey] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[cultureKey] || "a diverse cultural mix shaped by regional needs and ancient memory";
  
  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  const basePrompt = `
Create a tavern for ${settlement.Burg} with style: ${style}

Cultural Context:
Naming Style: ${cultureData.namebase}
Cultural Summary: ${cultureTone}
Species Demographics:
${speciesBlock}
Settlement: ${settlement.Burg}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "tavern": {
    "name": "[name of tavern or inn]",
    "innkeeper": "[Generated Name]",
    "signature": "[Description of dish or drink]",
    "description": "[Detailed immersive narrative description without quotes or special characters]"
  }
}
\`\`\`

Use ${cultureData.namebase} owner naming convention. Keep all text simple and avoid quotation marks in descriptions. No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateTavernJSON");
    
    if (!parsedData.tavern) {
      throw new Error('Invalid tavern JSON structure');
    }
    
    const tavern = parsedData.tavern;
    return `- **Tavern name:** ${tavern.name}
- **Innkeeper name:** ${tavern.innkeeper}
- **Signature drink or tradition:** ${tavern.signature}

${tavern.description}`;
    
  } catch (err) {
    console.error("\x1b[31m", "Tavern JSON generation failed:", err.message, "\x1b[0m");
    console.warn("\x1b[33m", "Using fallback tavern generation...", "\x1b[0m");
    return createFallbackTavern(settlement, style);
  }
}

async function generateShopsBatchJSON(settlement, shopTypes = []) {
  const city = settlement.Burg;
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[cultureKey] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[cultureKey] || "a diverse cultural mix shaped by regional needs and ancient memory";
  const temp = parseInt(settlement.Temperature, 10);
  
  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  const basePrompt = `
Create ${shopTypes.length} shops for the town of ${city} in ${settlement["Province Full Name"]}.

Cultural Context:
- Naming Style: ${cultureData.namebase}
- Cultural Summary: ${cultureTone}
- Species Demographics:
${speciesBlock}
location context:
- Elevation: ${settlement.Elevation || 'N/A'}
- Average Temperature: ${temp}°F
Shop types to generate: ${shopTypes.join(', ')}

CRITICAL: Respond with ONLY valid JSON in this exact format:
\`\`\`json
{
  "shops": [
    {
      "type": "[shop type]",
      "name": "[distinctive shop name]",
      "owner": "[Owner Name]",
      "description": "[Detailed paragraph immersive narrative description of the shop, its atmosphere, and what makes it unique]"
    }
  ]
}
\`\`\`

Generate exactly ${shopTypes.length} shops. Use ${cultureData.namebase} heritage for owner naming. Do not reuse names.
No additional text outside the JSON code block. not every shop name should include the owner name
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
    
    return results;
    
  } catch (err) {
    console.error("\x1b[31m", "JSON shop generation failed:", err.message, "\x1b[0m");
    console.warn("\x1b[33m", "Using fallback shop generation...", "\x1b[0m");
    
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

async function generateLandmarkJSON(settlement, hint = '', previousNames = []) {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };

  const excludeText = previousNames.length > 0 
    ? `Avoid these already used names: ${previousNames.join(', ')}`
    : '';

  const basePrompt = `
Create a minor landmark for ${settlement.Burg}.

Cultural Context:
- Culture Heritage: ${cultureData.namebase}
- Settlement: ${settlement.Burg}
${hint ? `- Historical Context: ${hint}` : ''}
${excludeText}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "landmark": {
    "name": "[English name of landmark]",
    "description": "[Detailed immersive description of the landmark, its appearance, history, and significance]"
  }
}
\`\`\`

Focus on grounded landmarks like wells, stones, gates, trees, or monuments.
Immersive details about the landmark's appearance, history, and significance. English only.
No additional text. Do not ask about additional details (e.g. Would you like me to:).
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateLandmarkJSON");
    
    if (!parsedData.landmark?.name || !parsedData.landmark?.description) {
      throw new Error('Invalid landmark JSON structure');
    }
    
    // Return the actual JSON object, not markdown!
    return parsedData.landmark;
    
  } catch (err) {
    console.error("\x1b[31m", "Landmark JSON generation failed:", err.message, "\x1b[0m");
    console.warn("\x1b[33m", "Using fallback landmark generation...", "\x1b[0m");
    return createFallbackLandmark(settlement);
  }
}

async function generateEventsJSON(settlement, count = 8, foundingYear) {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };

  const basePrompt = `
Generate ${count} historical events for ${settlement.Burg}.

Context:
- Settlement: ${settlement.Burg}
- Province: ${settlement["Province Full Name"]}
- Founded: ${foundingYear} MR
- Current Year: ${currentYear} MR
- Cultural Style: ${cultureData.namebase}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "events": [
    {
      "year": ${foundingYear},
      "description": "${settlement.Burg} was founded by ${settlement.Culture} settlers seeking fertile farmland along the river."
    },
    {
      "year": ${foundingYear + 50},
      "description": "The Great Bridge was completed, connecting the eastern and western districts."
    }
  ]
}
\`\`\`

Generate ${count} events spread between ${foundingYear} and ${currentYear} MR.
Include founding as first event. Focus on civic/cultural events.
Use ${cultureData.namebase} cultural context. 

IMPORTANT: Year values must be numbers only, do NOT include "MR" in the JSON.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateEventsJSON");
    
    if (!parsedData.events || !Array.isArray(parsedData.events)) {
      throw new Error('Invalid events JSON structure');
    }
    
    // Convert to your existing format
    return parsedData.events.map(event => ({
      eventYear: `${event.year} MR`,
      refined: event.description
    }));
    
  } catch (err) {
    console.error("\x1b[31m", "Events JSON generation failed:", err.message, "\x1b[0m");
    console.warn("\x1b[33m", "Using fallback events generation...", "\x1b[0m");
    return createFallbackEvents(settlement, count, foundingYear);
  }
}

async function generateLeaderJSON(settlement, citysize, cityage, isCapital = false, useApi = false) {
  const city = settlement.Burg;
  const normalizedCulture = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[normalizedCulture] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[normalizedCulture] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[normalizedCulture] || "a diverse cultural mix shaped by regional needs and ancient memory";

  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  console.log("Generating leader JSON for:", city, "Culture:", normalizedCulture);

  const basePrompt = `
Generate the current leader for the ${cityage} ${citysize} settlement of ${city}.

Naming Style: ${cultureData.namebase}
Cultural Context: ${cultureTone}
Species Demographics:
${speciesBlock}

The leader should have a name and title appropriate to their species and the naming style.
Avoid royal or noble tropes. Choose a civic title like mayor, councilor, reeve, steward, or captain.

Respond with ONLY a JSON object in this exact format:
{
  "name": "Full Name Here",
  "title": "Title Here",
  "description": "Short paragraph describing their leadership style and one memorable policy, scandal, or accomplishment. Make it immersive and guidebook-like."
}

Do not include any other text, explanations, or formatting. Just the JSON object.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    
    // Clean up the response to extract just the JSON
    let cleanResponse = response.trim();
    
    // Remove any markdown formatting
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find the JSON object in the response
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    // Parse the JSON
    const leaderData = JSON.parse(cleanResponse);
    
    // Validate the structure
    if (!leaderData.name || !leaderData.title || !leaderData.description) {
      throw new Error('Invalid leader JSON structure');
    }
    
    // Store the data in the settlement object
    settlement.leaderName = leaderData.name;
    settlement.leaderTitle = leaderData.title;
    
    console.log("Generated leader JSON:", leaderData.name, "Title:", leaderData.title);
    
    return leaderData;
    
  } catch (err) {
    console.error("\x1b[31m", "Error generating leader JSON:", err.message, "\x1b[0m");
    console.warn("\x1b[33m", "Using fallback leader generation...", "\x1b[0m");
    
    // Fallback to a basic leader object
    const fallbackLeader = createFallbackLeader(settlement, cultureData);
    
    settlement.leaderName = fallbackLeader.name;
    settlement.leaderTitle = fallbackLeader.title;
    
    return fallbackLeader;
  }
}

// Helper function to convert JSON leader data to markdown format
function formatLeaderJSON(leaderData) {
  return `- **${leaderData.name}**
- **${leaderData.title}**

${leaderData.description}`;
}

// Export all functions explicitly
// === DESCRIPTION GENERATORS (moved from utils.js) ===

async function generateBurgDescriptionJSON(settlement, stuff = '', useApi = false) {
  const city = settlement.Burg;
  const normalizedCulture = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[normalizedCulture] || { type: "Unknown", namebase: "Generic Fantasy" };
  const cultureTone = cultureSummaryMap[normalizedCulture] || "a diverse cultural mix shaped by regional needs and ancient memory";
  const temp = parseInt(settlement.Temperature, 10);

  const basePrompt = `
Generate a detailed description of ${city}.

Context:
- Naming Style: ${cultureData.namebase}
- Cultural Context: ${cultureTone}
- Average temperature: ${temp}°F
- Elevation (ft): ${formatNumber(settlement["Elevation (ft)"])}
- Population: ${formatNumber(settlement.Population)}
${getPortDescription(settlement)}
${stuff}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "description": {
    "text": "[Detailed immersive paragraph description of the settlement]"
  }
}
\`\`\`

Make it an immersive paragraph. Use present tense. Do not offer to expand on the description. 
Do not mention the temperature directly, only its effects. Elevation (4000+) indicates mountains.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateBurgDescriptionJSON");
    
    if (!parsedData.description?.text) {
      throw new Error('Invalid description JSON structure');
    }
    
    console.log('\x1b[36m%s\x1b[0m', "Generated burg description");
    return parsedData.description.text;
    
  } catch (err) {
    console.error("\x1b[31m", "Error generating burg description:", err.message, "\x1b[0m");
    return `${settlement.Burg} is a ${settlement.size.toLowerCase()} settlement with a population of ${formatNumber(settlement.Population)} residents.`;
  }
}

async function generateCapitalDescriptionJSON(settlement, stuff = '', useApi = false) {
  const city = settlement.Burg;
  const normalizedCulture = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[normalizedCulture] || { type: "Unknown", namebase: "Generic Fantasy" };
  const cultureTone = cultureSummaryMap[normalizedCulture] || "a diverse cultural mix shaped by regional needs and ancient memory";
  const temp = parseInt(settlement.Temperature, 10);

  const basePrompt = `
Generate a detailed description of ${city}, capital city of ${settlement["State Full Name"]}.

Context:
- Naming Style: ${cultureData.namebase}
- Cultural Context: ${cultureTone}
- Average temperature: ${temp}°F
- Elevation (ft): ${formatNumber(settlement["Elevation (ft)"])}
- Population: ${formatNumber(settlement.Population)}
${getPortDescription(settlement)}
${stuff}

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "description": {
    "text": "[Detailed immersive paragraph description of the capital city]"
  }
}
\`\`\`

Make it a grounded immersive paragraph. Use present tense. Do not list languages. 
Do not offer to expand on the description. Do not mention the temperature directly, only its effects. 
Elevation (4000+) indicates mountains.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateCapitalDescriptionJSON");
    
    if (!parsedData.description?.text) {
      throw new Error('Invalid description JSON structure');
    }
    
    return parsedData.description.text;
    
  } catch (err) {
    console.error("\x1b[31m", "Error generating capital description:", err.message, "\x1b[0m");
    return `${settlement.Burg} serves as the capital of ${settlement["State Full Name"]}, a ${settlement.size.toLowerCase()} with ${formatNumber(settlement.Population)} inhabitants.`;
  }
}

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

function getPortDescription(settlement) {
  const civicFeatures = ['Port', 'Citadel', 'Walls', 'Plaza', 'Temple', 'Shanty Town'];
  const featuresPresent = civicFeatures.filter(
    key => settlement[key] && typeof settlement[key] === 'string' && settlement[key].trim() !== ''
  );

  return featuresPresent.includes('Port') ? ' The city is a seaport.' : '';
}

function formatNumber(num) {
  return Number(num).toLocaleString('en-US');
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
  generateShopsBatchJSON,
  generateTavernJSON,
  generateTavernsBatchJSON,
  generateLandmarkJSON,
  generateEventsJSON,
  generateLeaderJSON,
  formatLeaderJSON,
  generateSingleTavern,
  // New JSON description generators
  generateBurgDescriptionJSON,
  generateCapitalDescriptionJSON,
  generateFeatureJSON,
  generateFeatureDescriptionsJSON
};