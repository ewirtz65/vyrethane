// config.js - Centralized configuration
const currentYear = 2950;

// OLLAMA Configuration
const OLLAMA_CONFIG = {
  baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
  model: process.env.OLLAMA_MODEL || 'gemma3',
  timeout: parseInt(process.env.OLLAMA_TIMEOUT) || 30000,
  maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES) || 6
};


module.exports = {
  currentYear,
  OLLAMA_CONFIG
};