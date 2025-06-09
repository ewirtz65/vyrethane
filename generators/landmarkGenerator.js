// landmarkGenerator.js - Landmark generation functions

const { cultureMap } = require('../data/cultures.js');
const { retryGenerateJSON } = require('../llmClient.js');
const { parseJSONResponse, generateJSONSafePrompt } = require('../jsonParser.js');
const { createFallbackLandmark } = require('./fallbackGenerators.js');

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
    console.log("\x1b[33m", "Using fallback landmark generation...", "\x1b[0m");
    return createFallbackLandmark(settlement);
  }
}

module.exports = {
  generateLandmarkJSON
};