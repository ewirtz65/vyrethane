// jsonParser.js - Enhanced version with corrected exports
const originalConsoleLog = console.log;
console.log = function (...args) {
 const error = new Error();
  const stackLines = error.stack.split('\n');
  const callerLine = stackLines[2].trim();
  const timestamp = new Date().toISOString();
  
  // Extract filename and line number
  const match = callerLine.match(/([^/\\]+):(\d+):\d+/);
  const fileAndLine = match ? `${match[1]}:${match[2]}` : 'unknown';
  
  originalConsoleLog.apply(console, [`${fileAndLine}:`, ...args]);
};
console.debug = () => {};

// Aggressive control character removal - this should be the FIRST method tried
function removeControlCharacters(jsonStr) {
  // First escape any literal newlines in strings, then remove other control chars
  const withEscapedNewlines = fixJSONNewlines(jsonStr);
  
  return withEscapedNewlines
    // Remove control characters EXCEPT newlines, tabs, and carriage returns
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Don't double-escape - if it's already \\n, leave it alone
    // Only convert bare newlines that aren't already escaped
    .replace(/(?<!\\)(\n)/g, '\\n')
    .replace(/(?<!\\)(\r)/g, '\\r')  
    .replace(/(?<!\\)(\t)/g, '\\t');
}

// Even more aggressive - remove ANY non-printable characters
function removeAllNonPrintable(jsonStr) {
  return jsonStr
    // Keep only printable ASCII + basic whitespace + common extended chars
    .replace(/[^\x20-\x7E\x09\x0A\x0D]/g, '')
    // Clean up any resulting malformed escape sequences
    .replace(/\\+/g, '\\');
}

// Conservative cleaning approach
function conservativeCleanJSON(jsonStr) {s
  // First fix newlines in strings properly
  const fixed = fixJSONNewlines(jsonStr);
  
  // Then remove other control characters
  return fixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, (match) => {
    // If we encounter newlines here, they're outside strings, so remove them
    if (match === '\n' || match === '\r' || match === '\t') {
      return '';
    }
    return '';
  });
}

// Original sanitize function (keep for compatibility)
function sanitizeJSONString(jsonStr) {
  return jsonStr
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":')
    .replace(/:\s*"([^"]*)"([^"]*)"([^"]*)",/g, ': "$1\\"$2\\"$3",')
    .replace(/:\s*"([^"]*)"([^"]*)"([^"]*)"$/g, ': "$1\\"$2\\"$3"')
    .replace(/"description":\s*"([^"]*)"([^"]*)"([^"]*)"([^}]*)/g, (match, p1, p2, p3, p4) => {
      const cleanDesc = `${p1}\\"${p2}\\"${p3}${p4}`.replace(/"/g, '\\"');
      return `"description": "${cleanDesc}"`;
    })
    .replace(/[""]/g, '\\"')
    .replace(/['']/g, "\\'");
}
function fixMissingCommas(jsonStr) {
  return jsonStr
    // Fix missing commas between objects in arrays: } { -> }, {
    .replace(/}\s*\n\s*{/g, '},\n    {')
    // Fix missing commas between objects on same line: }{ -> },{
    .replace(/}\s*{/g, '}, {')
    // Fix missing commas before closing array with newlines: }\n] -> }\n  ]
    .replace(/}\s*\n\s*]/g, '}\n  ]')
    // Fix missing commas at end of objects in arrays: "\n    } -> ",\n    }
    .replace(/"\s*\n\s*}\s*\n\s*{/g, '"\n    },\n    {');
}

// Fix unescaped quotes within JSON string values
function fixUnescapedQuotes(jsonStr) {
  // Simple approach: replace unescaped quotes in descriptions
  return jsonStr
    // Fix the specific pattern: "text "quoted text" more text"
    .replace(/"([^"]*)"([^"]*)"([^"]*)"(?=\s*[,}])/g, '"$1\\"$2\\"$3"')
    // Fix single unescaped quote in middle of string
    .replace(/"([^"]*[^\\])"([^"]*)"(?=\s*[,}])/g, '"$1\\"$2"');
}

// Replace the existing fixJSONNewlines function with this simpler version:

function fixJSONNewlines(jsonStr) {
  // Much simpler approach: find strings that contain literal newlines and escape them
  let result = jsonStr;
  let inString = false;
  let escaped = false;
  let currentStringStart = -1;
  
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    
    if (char === '"' && !escaped) {
      if (!inString) {
        // Starting a string
        inString = true;
        currentStringStart = i;
      } else {
        // Ending a string - check if it contained literal newlines
        const stringContent = result.substring(currentStringStart + 1, i);
        if (stringContent.includes('\n') || stringContent.includes('\r') || stringContent.includes('\t')) {
          // Replace the string content with escaped version
          const escapedContent = stringContent
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/\n/g, '\\n')   // Escape newlines
            .replace(/\r/g, '\\r')   // Escape carriage returns
            .replace(/\t/g, '\\t');  // Escape tabs
          
          // Replace the entire string in the result
          const before = result.substring(0, currentStringStart + 1);
          const after = result.substring(i);
          result = before + escapedContent + after;
          
          // Adjust our position since the string length changed
          i = currentStringStart + escapedContent.length + 1;
        }
        inString = false;
      }
    }
    
    // Track if we're in an escaped sequence
    escaped = (char === '\\' && !escaped);
  }
  
  return result;
}

// Even simpler regex-based approach as backup:
function fixJSONNewlinesSimple(jsonStr) {
  // Find all strings (content between quotes) and escape newlines within them
  return jsonStr.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, content) => {
    // Only escape if this contains literal newlines/tabs/carriage returns
    if (content.includes('\n') || content.includes('\r') || content.includes('\t')) {
      const escaped = content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${escaped}"`;
    }
    return match;
  });
}

// Fix unescaped quotes within JSON string values
function fixUnescapedQuotes(jsonStr) {
  // This is tricky - we need to find quotes that are inside string values but not escaped
  // Strategy: Find string values and fix quotes within them
  return jsonStr.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match, content) => {
    // Skip if this is just a property name (followed by colon)
    const afterMatch = jsonStr.substring(jsonStr.indexOf(match) + match.length).trim();
    if (afterMatch.startsWith(':')) {
      return match; // This is a property name, don't modify
    }
    
    // This is a string value, fix any unescaped quotes within it
    const fixedContent = content
      // Fix unescaped quotes that aren't already escaped
      .replace(/(?<!\\)"/g, '\\"')
      // Clean up any double-escaping that might result
      .replace(/\\\\"/g, '\\"');
    
    return `"${fixedContent}"`;
  });
}

// Smart character replacement for common LLM output issues
function fixCommonLLMIssues(jsonStr) {
  return jsonStr
    // Fix smart quotes and apostrophes
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    // Fix em-dashes and en-dashes
    .replace(/[–—]/g, "-")
    // Fix ellipsis
    .replace(/…/g, "...")
    // Fix any other common Unicode issues
    .replace(/[\u2000-\u206F]/g, " ") // Various Unicode spaces
    .replace(/[\u2010-\u2015]/g, "-") // Various Unicode dashes
    .replace(/[\u2018-\u201F]/g, "'") // Various Unicode quotes
    .replace(/[\u0080-\u009F]/g, ""); // Windows-1252 control characters
}

// Enhanced parseJSONResponse with better debugging and structure validation
function parseJSONResponse(response, functionName = "unknown") {
  console.log(`Parsing JSON for ${functionName}...`);
  
  // More comprehensive patterns to catch different response formats
  const patterns = [
    /```json\s*(\{[\s\S]*?\})\s*```/i,      // Standard json code block
    /```\s*(\{[\s\S]*?\})\s*```/,           // Code block without json tag
    /(\{[\s\S]*\})/,                        // Just the JSON object
    /```json\s*(\[[\s\S]*?\])\s*```/i,      // JSON array in code block
    /```\s*(\[[\s\S]*?\])\s*```/,           // Array without json tag
    /(\[[\s\S]*\])/                         // Just the JSON array
  ];
  
  let jsonStr = null;
  let patternUsed = -1;
  
  // Try to extract JSON using patterns
  for (let i = 0; i < patterns.length; i++) {
    const match = response.match(patterns[i]);
    if (match && match[1]) {
      jsonStr = match[1].trim();
      patternUsed = i;
      console.debug(`Pattern ${i} matched for ${functionName}`);
      break;
    }
  }
  
  if (!jsonStr) {
    console.warn(`No JSON pattern matched for ${functionName}`);
    // Try to find any JSON-like structure
    const fallbackMatch = response.match(/[\{\[][\s\S]*[\}\]]/);
    if (fallbackMatch) {
      jsonStr = fallbackMatch[0];
      console.warn("Using fallback pattern");
    } else {
      console.error("No JSON structure found at all");
      throw new Error(`No JSON structure found in response for ${functionName}`);
    }
  }
  
  // Debug the extracted JSON structure
  console.debug(`Extracted JSON length: ${jsonStr.length}`);
  console.debug(`First 50 chars: ${JSON.stringify(jsonStr.substring(0, 50))}`);

  
  // Check basic structure before attempting to parse
  const trimmed = jsonStr.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    console.error(`JSON doesn't start with { or [, starts with: "${trimmed.charAt(0)}" (code: ${trimmed.charCodeAt(0)})`);
  }
  if (!trimmed.endsWith('}') && !trimmed.endsWith(']')) {
    console.error(`JSON doesn't end with } or ], ends with: "${trimmed.charAt(trimmed.length-1)}"`);
  }
  
  // Try parsing methods in order of likelihood to succeed
  const attempts = [
    { name: "original", process: (str) => str },
    { name: "fix-unescaped-quotes", process: fixUnescapedQuotes },  // Try quote fix first
    { name: "fix-missing-commas", process: fixMissingCommas },
    { name: "fix-json-newlines", process: fixJSONNewlines },
    { name: "fix-common-issues", process: fixCommonLLMIssues },
    { name: "remove-control-chars", process: removeControlCharacters },
    { name: "conservative-clean", process: conservativeCleanJSON },
    { name: "remove-non-printable", process: removeAllNonPrintable }
  ];
  
  for (const attempt of attempts) {
    try {
      const processed = attempt.process(jsonStr);
      
      // Extra debugging for position 4 errors
      if (processed.length > 10) {
        console.debug(`${attempt.name} - chars 0-10:`, JSON.stringify(processed.substring(0, 10)));
      }
      
      // Extra logging for missing comma attempts
      if (attempt.name === "fix-missing-commas") {
        console.debug(`🔧 Attempting missing comma fix for ${functionName}`);
        if (processed !== jsonStr) {
          console.debug(`✅ Missing comma fix applied changes`);
        } else {
          console.debug(`ℹ️ No missing comma patterns found to fix`);
        }
      }
      
      const parsed = JSON.parse(processed);
      
      // Validate that we got something useful
      if (parsed && (typeof parsed === 'object')) {
        if (attempt.name !== "original") {
          console.debug(`✅ Successfully parsed with ${attempt.name} method for ${functionName}`);
        } else {
          console.debug(`✅ Successfully parsed without cleaning for ${functionName}`);
        }
        return parsed;
      }
      
    } catch (e) {
      const fullError = e.message;
      //IF FULL ERROR DEFINED

      if (fullError) {
      console.warn(`❌ ${attempt.name} parsing failed for ${functionName}: ${fullError}`);
      } else {
      console.warn(`❌ ${attempt.name} parsing failed for ${functionName}:`, e);
      }
      
      // Enhanced error logging for position errors
      if (e.message.includes("position")) {
        const position = e.message.match(/position (\d+)/);
        if (position) {
          const pos = parseInt(position[1]);
          const processed = attempt.process(jsonStr);
          
          // Show more context around the error
          const start = Math.max(0, pos - 10);
          const end = Math.min(processed.length, pos + 10);
          const problemArea = processed.substring(start, end);
          
          console.warn(`${attempt.name} - Problem area around position ${pos}:`, JSON.stringify(problemArea));
          
          // Show specific character at error position
          if (pos < processed.length) {
            const problemChar = processed.charAt(pos);
            const charCode = problemChar.charCodeAt(0);
            console.warn(`${attempt.name} - Problem character at pos ${pos}: "${problemChar}" (code: ${charCode})`);
            
            // Show the previous few characters too
            const prevChars = processed.substring(Math.max(0, pos - 5), pos);
            console.warn(`${attempt.name} - Previous 5 chars:`, JSON.stringify(prevChars));
          }
        }
      }
    }
  }
  
  // Final fallback to emergency extraction
  console.log("🚨 All parsing methods failed, trying emergency extraction...");
  const emergencyResult = emergencyJSONExtraction(response, functionName);
  if (emergencyResult) {
    console.debug("✅ Emergency extraction successful for", functionName);
    return emergencyResult;
  }
  
  // Last resort: log the full response for debugging
  console.error(`❌ COMPLETE FAILURE for ${functionName}`);
  console.error("Raw response length:", response.length);
  console.error("First 200 chars of raw response:", JSON.stringify(response.substring(0, 200)));
  console.error("Extracted JSON:", JSON.stringify(jsonStr.substring(0, 100)));
  
  throw new Error(`All JSON parsing methods failed for ${functionName}`);
}

// Enhanced emergency extraction (keep existing)
function emergencyJSONExtraction(response, functionName) {
  console.log("🚨 Attempting emergency JSON extraction for", functionName);
  
  try {
    // For events - ADD THIS NEW CASE
    if (functionName.includes("Events") || functionName.includes("events")) {
      const eventMatches = [...response.matchAll(/"year":\s*(-?\d+),?\s*"description":\s*"([^"]*(?:[^"\\]|\\.)*)"/g)];
      
      if (eventMatches.length > 0) {
        const events = eventMatches.map(match => ({
          year: parseInt(match[1]),
          description: match[2].replace(/\\"/g, '"').replace(/"/g, "'")
        }));
        
        return { events };
      }
    }
    
    // For batch taverns
    if (functionName.includes("TavernsBatch")) {
      const tavernMatches = [...response.matchAll(/"type":\s*"([^"]*)"[\s\S]*?"name":\s*"([^"]*)"[\s\S]*?"innkeeper":\s*"([^"]*)"[\s\S]*?"signature":\s*"([^"]*)"[\s\S]*?"description":\s*"([^"]*(?:[^"\\]|\\.)*)"/g)];
      
      if (tavernMatches.length > 0) {
        const taverns = tavernMatches.map(match => ({
          type: match[1],
          name: match[2],
          innkeeper: match[3],
          signature: match[4],
          description: match[5].replace(/\\"/g, '"').replace(/"/g, "'")
        }));
        
        return { taverns };
      }
    }
    
    // For individual taverns
    if (functionName.includes("tavern") || functionName.includes("Tavern")) {
      const nameMatch = response.match(/"name":\s*"([^"]*(?:\\.[^"]*)*)/);
      const innkeeperMatch = response.match(/"innkeeper":\s*"([^"]*(?:\\.[^"]*)*)/);
      const signatureMatch = response.match(/"signature":\s*"([^"]*(?:\\.[^"]*)*)/);
      const descMatch = response.match(/"description":\s*"([^"]*(?:[^"\\]|\\.)*)(?:"|$)/);
      
      if (nameMatch) {
        const name = nameMatch[1] || "The Local Tavern";
        const innkeeper = innkeeperMatch ? innkeeperMatch[1] : "The Keeper";
        const signature = signatureMatch ? signatureMatch[1] : "Local ale and hearty meals";
        
        let description = "A welcoming establishment where locals gather.";
        if (descMatch) {
          description = descMatch[1]
            .replace(/\\"/g, '"')
            .replace(/"/g, "'")
            .trim();
        }
        
        return {
          tavern: {
            name: name,
            innkeeper: innkeeper,
            signature: signature,
            description: description
          }
        };
      }
    }
    
    // For landmarks
    if (functionName.includes("landmark") || functionName.includes("Landmark")) {
      const nameMatch = response.match(/"name":\s*"([^"]*(?:\\.[^"]*)*)/);
      const descMatch = response.match(/"description":\s*"([^"]*(?:[^"\\]|\\.)*)(?:"|$)/);
      
      if (nameMatch) {
        let description = "A notable landmark in the area.";
        if (descMatch) {
          description = descMatch[1]
            .replace(/\\"/g, '"')
            .replace(/"/g, "'")
            .trim();
        }
        
        return {
          landmark: {
            name: nameMatch[1] || "Ancient Landmark",
            description: description
          }
        };
      }
    }
    
    // For leaders
    if (functionName.includes("leader") || functionName.includes("Leader")) {
      const nameMatch = response.match(/"name":\s*"([^"]*(?:\\.[^"]*)*)/);
      const titleMatch = response.match(/"title":\s*"([^"]*(?:\\.[^"]*)*)/);
      const descMatch = response.match(/"description":\s*"([^"]*(?:[^"\\]|\\.)*)(?:"|$)/);
      
      if (nameMatch) {
        let description = "A respected leader in the community.";
        if (descMatch) {
          description = descMatch[1]
            .replace(/\\"/g, '"')
            .replace(/"/g, "'")
            .trim();
        }
        
        return {
          leader: {
            name: nameMatch[1] || "Leader",
            title: titleMatch ? titleMatch[1] : "Leader",
            description: description
          }
        };
      }
    }
    
    // For shops
    if (functionName.includes("shop") || functionName.includes("Shop")) {
      const shopMatches = [...response.matchAll(/"type":\s*"([^"]*)"[\s\S]*?"name":\s*"([^"]*)"[\s\S]*?"owner":\s*"([^"]*)"[\s\S]*?"description":\s*"([^"]*(?:[^"\\]|\\.)*)"/g)];
      
      if (shopMatches.length > 0) {
        const shops = shopMatches.map(match => ({
          type: match[1],
          name: match[2],
          owner: match[3],
          description: match[4].replace(/\\"/g, '"').replace(/"/g, "'")
        }));
        
        return { shops };
      }
    }
    
    throw new Error("Could not extract any usable fields");
    
  } catch (e) {
    console.error("Emergency extraction failed:", e.message);
    return null;
  }
}

// Enhanced prompt generation that explicitly avoids control characters
function generateJSONSafePrompt(basePrompt) {
  return basePrompt + `

CRITICAL FORMATTING RULES:
- Use only standard ASCII characters in JSON output
- Use straight quotes (") only, never smart quotes (" ")
- In descriptions, use apostrophes (') instead of quotes for dialogue
- Avoid special characters, unicode, or control characters
- Keep descriptions simple with basic punctuation only
- No quotation marks within string values
- No line breaks within string values - use spaces instead
- Example: "description": "A tavern where locals say its the best in town"

OUTPUT ONLY VALID JSON WITH NO ADDITIONAL TEXT OR COMMENTARY.
`;
}

// FIXED: Add the missing generateSafePrompt function for non-JSON prompts
function generateSafePrompt(basePrompt) {
  return basePrompt + `

FORMATTING GUIDELINES:
- Use clear, descriptive language
- Keep responses focused and immersive
- Use present tense for descriptions
- Avoid overly complex or flowery language
- Make descriptions practical and grounded
`;
}

module.exports = {
  removeControlCharacters,
  removeAllNonPrintable,
  sanitizeJSONString,
  conservativeCleanJSON,
  fixMissingCommas,          // ✅ NOW PROPERLY EXPORTED
  emergencyJSONExtraction,
  parseJSONResponse,
  generateSafePrompt,        // For non-JSON text generation
  generateJSONSafePrompt     // For JSON generation only
};