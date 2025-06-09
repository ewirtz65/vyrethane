// generators.js - Central import point for all JSON generators

// Import all generator modules from the generators folder
const { generateTavernsBatchJSON, generateSingleTavern, generateTavernJSON } = require('./generators/tavernGenerator.js');
const { generateShopsBatchJSON } = require('./generators/shopGenerator.js');
const { generateLandmarkJSON } = require('./generators/landmarkGenerator.js');
const { generateLeaderJSON, formatLeaderJSON } = require('./generators/leaderGenerator.js');
const { generateBurgDescriptionJSON, generateCapitalDescriptionJSON } = require('./generators/descriptionGenerator.js');
const { generateFeatureJSON, generateCivicFeatureJSON, generateFeatureDescriptionsJSON } = require('./generators/featureGenerator.js');
const { generateEventsJSON } = require('./generators/eventGenerator.js');

// Re-export all functions for easy importing
module.exports = {
  // Tavern generation
  generateTavernsBatchJSON,
  generateSingleTavern,
  generateTavernJSON, // Will be removed when refactoring is complete
  
  // Shop generation
  generateShopsBatchJSON,
  
  // Landmark generation
  generateLandmarkJSON,
  
  // Leader generation
  generateLeaderJSON,
  formatLeaderJSON,
  
  // Description generation
  generateBurgDescriptionJSON,
  generateCapitalDescriptionJSON,
  
  // Feature generation
  generateFeatureJSON,
  generateCivicFeatureJSON,
  generateFeatureDescriptionsJSON,
  
  // Event generation
  generateEventsJSON
};