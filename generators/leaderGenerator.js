// leaderGenerator.js - Leader generation functions

const {
  cultureSpeciesMap,
  cultureSummaryMap,
  cultureMap
} = require('../data/cultures.js');

const { retryGenerateJSON } = require('../llmClient.js');
const { parseJSONResponse, generateJSONSafePrompt } = require('../jsonParser.js');
const { createFallbackLeader } = require('./fallbackGenerators.js');

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
    console.log("\x1b[33m", "Using fallback leader generation...", "\x1b[0m");
    
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

module.exports = {
  generateLeaderJSON,
  formatLeaderJSON
};