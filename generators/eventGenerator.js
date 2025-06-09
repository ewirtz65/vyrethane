// eventGenerator.js - Handles all event generation using JSON calls only

const { cultureMap, cultureSummaryMap, cultureSpeciesMap } = require('../data/cultures.js');
const { currentYear } = require('../config.js');
const { retryGenerateJSON } = require('../llmClient.js');
const { generateJSONSafePrompt, parseJSONResponse } = require('../jsonParser.js');
const { createFallbackEvents } = require('./fallbackGenerators.js');

// Generate multiple events for a settlement (batch JSON generation)
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
- Population: ${settlement.Population}

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
Include founding as first event. Focus on civic/cultural events like:
- Construction projects (bridges, walls, buildings)
- Economic developments (markets, trade routes)
- Cultural celebrations or traditions established
- Natural events affecting the settlement
- Notable leadership changes
- Population growth milestones

Use ${cultureData.namebase} cultural context. Make events specific to the settlement.
The events should be mundane, civic, or cultural — no prophecy, world-ending disasters, or legendary heroes.

IMPORTANT: Year values must be numbers only, do NOT include "MR" in the JSON.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    console.log(`Generating ${count} events for ${settlement.Burg}: Founded ${foundingYear} MR, Age: ${currentYear - foundingYear} years`);
    
    const response = await retryGenerateJSON(safePrompt);
    const parsedData = parseJSONResponse(response, "generateEventsJSON");
    
    if (!parsedData.events || !Array.isArray(parsedData.events)) {
      throw new Error('Invalid events JSON structure');
    }
    
    // Convert to your existing format with refined property
    return parsedData.events.map(event => ({
      eventYear: `${event.year} MR`,
      description: event.description,
      refined: event.description
    }));
    
  } catch (err) {
    console.error("\x1b[31m", "Events JSON generation failed:", err.message, "\x1b[0m");
    console.log("\x1b[33m", "Using fallback events generation...", "\x1b[0m");
    return createFallbackEvents(settlement, count, foundingYear);
  }
}

// Generate a single random event (JSON version)
async function getRandomEventJSON(settlement) {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[cultureKey] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[cultureKey] || "a diverse cultural mix shaped by regional needs and ancient memory";

  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  const basePrompt = `
Create a short historical event that occurred in the settlement of ${settlement.Burg}, located in the province of ${settlement["Province Full Name"]}.

Naming Style: ${cultureData.namebase}
Cultural Summary: ${cultureTone}
Species Demographics:
${speciesBlock}

The event should be mundane, civic, or cultural — no prophecy, world-ending disasters, or legendary heroes.
Examples: a festival founding, a natural disaster, a dispute, a guild scandal, a building collapse, a settlement change, etc.

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "event": {
    "description": "A one-sentence description of the event. Do NOT include a date.",
    "type": "cultural|civic|economic|natural|social|conflict", 
    "impact": "minor|moderate|significant",
    "involves_people": false,
    "involves_building": false,
    "involves_trade": false
  }
}
\`\`\`

No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsed = parseJSONResponse(response, "getRandomEventJSON");
    
    // Validate and return the full event object
    if (parsed.event && parsed.event.description) {
      return {
        description: parsed.event.description,
        type: parsed.event.type || "cultural",
        impact: parsed.event.impact || "minor",
        involves_people: parsed.event.involves_people || false,
        involves_building: parsed.event.involves_building || false,
        involves_trade: parsed.event.involves_trade || false
      };
    } else {
      throw new Error("Invalid event JSON structure");
    }
  } catch (err) {
    console.error("\x1b[31m", "Failed to generate random event JSON:", err.message);
    return {
      description: "A forgotten event occurred, but no records survive.",
      type: "cultural",
      impact: "minor",
      involves_people: false,
      involves_building: false,
      involves_trade: false
    };
  }
}

// Generate founding event (JSON version)
async function getFoundingEventJSON(settlement) {
  const cultureKey = (settlement.Culture || settlement.culture || '').trim();
  const cultureData = cultureMap[cultureKey] || { type: "Unknown", namebase: "Generic Fantasy" };
  const species = cultureSpeciesMap[cultureKey] || { Human: 70, Other: 30 };
  const cultureTone = cultureSummaryMap[cultureKey] || "a diverse cultural mix shaped by regional needs and ancient memory";

  const speciesBlock = Object.entries(species)
    .map(([race, pct]) => `- ${race}: ${pct}%`)
    .join('\n');

  const basePrompt = `
Create a founding event for the settlement of ${settlement.Burg}, located in the province of ${settlement["Province Full Name"]}.

Naming Style: ${cultureData.namebase}
Cultural Summary: ${cultureTone}
Species Demographics:
${speciesBlock}

The founding should be appropriate to the settlement's culture and location. Consider reasons like:
- Strategic location (crossroads, river ford, mountain pass)
- Resource discovery (mines, fertile land, fresh water)
- Refuge or safety (fleeing conflict, natural disaster)
- Trade opportunity (port, caravan route)
- Religious significance (shrine, pilgrimage site)

CRITICAL: Respond with ONLY valid JSON:
\`\`\`json
{
  "founding": {
    "description": "A one-sentence description of the founding. Do NOT include a date.",
    "reason": "strategic|resource|refuge|trade|religious|other",
    "founders": "Description of who founded it"
  }
}
\`\`\`

Keep it grounded and realistic - avoid legendary heroes or epic prophecies.
No additional text. English only.
Entropy Key: ${Math.random().toString(36).slice(2, 7)}`;

  const safePrompt = generateJSONSafePrompt(basePrompt);

  try {
    const response = await retryGenerateJSON(safePrompt);
    const parsed = parseJSONResponse(response, "getFoundingEventJSON");
    
    if (parsed.founding && parsed.founding.description) {
      return {
        description: parsed.founding.description,
        reason: parsed.founding.reason || "other",
        founders: parsed.founding.founders || "early settlers"
      };
    } else {
      throw new Error("Invalid founding JSON structure");
    }
  } catch (err) {
    console.error("\x1b[31m", "Failed to generate founding event JSON:", err.message);
    return {
      description: `${settlement.Burg} was founded by early settlers seeking opportunity in the region.`,
      reason: "other",
      founders: "early settlers"
    };
  }
}

module.exports = {
  generateEventsJSON,
  getRandomEventJSON,
  getFoundingEventJSON
};