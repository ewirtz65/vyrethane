// tavernGenerator.js - Tavern generation functions

const {
  cultureSpeciesMap,
  cultureSummaryMap,
  cultureMap
} = require('../data/cultures.js');

const { retryGenerateJSON } = require('../llmClient.js');
const { parseJSONResponse, generateJSONSafePrompt } = require('../jsonParser.js');
const { createFallbackTavern } = require('./fallbackGenerators.js');

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

// Legacy single tavern function (will be removed when refactoring is complete)
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
    console.log("\x1b[33m", "Using fallback tavern generation...", "\x1b[0m");
    return createFallbackTavern(settlement, style);
  }
}

module.exports = {
  generateTavernsBatchJSON,
  generateSingleTavern,
  generateTavernJSON // Will be removed when refactoring is complete
};