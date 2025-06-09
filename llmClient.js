// llmClient.js - Handles communication with the LLM service

const axios = require('axios');
const { OLLAMA_CONFIG } = require('./config.js');

// Enhanced retry function with better timeout handling (FOR JSON)
async function retryGenerateJSON(prompt, retries = OLLAMA_CONFIG.maxRetries, delay = 1000) {
  console.debug(`\x1b[36mGenerating JSON with model: ${OLLAMA_CONFIG.model}\x1b[0m`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const requestConfig = {
        method: 'post',
        url: `${OLLAMA_CONFIG.baseUrl}/api/generate`,
        data: {
          model: OLLAMA_CONFIG.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            num_predict: 2048,
            repeat_penalty: 1.1,
            top_k: 40
          }
        },
        timeout: OLLAMA_CONFIG.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (i > 1) {
        console.log(`Attempt ${i + 1}/${retries} - Connecting to: ${OLLAMA_CONFIG.baseUrl}`);
      }
      const res = await axios(requestConfig);
      
      if (!res.data || !res.data.response) {
        throw new Error('Invalid response structure from Ollama');
      }
      
      const response = res.data.response.trim();
      if (response.length === 0) {
        throw new Error('Empty response from Ollama');
      }
      
      console.debug(`\x1b[32m✓ Successfully generated response (${response.length} chars)\x1b[0m`);
      return response;
      
    } catch (err) {
      const isLastAttempt = i === retries - 1;
      
      if (err.code === 'ECONNREFUSED') {
        console.warn(`\x1b[33m⚠ Connection refused to ${OLLAMA_CONFIG.baseUrl} (attempt ${i + 1}/${retries})\x1b[0m`);
        console.warn(`\x1b[33m  Make sure Ollama is running and accessible at this URL\x1b[0m`);
        
        if (!isLastAttempt) {
          console.warn(`\x1b[33m  Retrying in ${delay}ms...\x1b[0m`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 1.5;
          continue;
        }
      } else if (err.response?.status === 404) {
        console.warn(`\x1b[33m⚠ Model '${OLLAMA_CONFIG.model}' not found (attempt ${i + 1}/${retries})\x1b[0m`);
        console.warn(`\x1b[33m  Try running: ollama pull ${OLLAMA_CONFIG.model}\x1b[0m`);
        
        if (!isLastAttempt) {
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
      } else if (err.code === 'ENOTFOUND') {
        console.error(`\x1b[31m✗ DNS resolution failed for ${OLLAMA_CONFIG.baseUrl}\x1b[0m`);
        console.error(`\x1b[31m  Check if the hostname is correct\x1b[0m`);
      } else if (err.code === 'ETIMEDOUT') {
        console.warn(`\x1b[33m⚠ Request timeout (attempt ${i + 1}/${retries})\x1b[0m`);
        
        if (!isLastAttempt) {
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
      }
      
      if (isLastAttempt) {
        console.error(`\x1b[31m✗ All ${retries} attempts failed\x1b[0m`);
        console.error(`\x1b[31m  Error: ${err.message}\x1b[0m`);
        console.error(`\x1b[31m  Code: ${err.code}\x1b[0m`);
        console.error(`\x1b[31m  URL: ${OLLAMA_CONFIG.baseUrl}\x1b[0m`);
        console.error(`\x1b[31m  Model: ${OLLAMA_CONFIG.model}\x1b[0m`);
        
        throw new Error(`Ollama connection failed after ${retries} attempts: ${err.message}. ` +
                       `Check that Ollama is running at ${OLLAMA_CONFIG.baseUrl} and model '${OLLAMA_CONFIG.model}' is available.`);
      }
    }
  }
}

// General retry function for non-JSON responses (FOR BACKWARD COMPATIBILITY)
async function retryGenerate(prompt, retries = 3, delay = 1000) {
  console.log(`\x1b[36mGenerating text with model: ${OLLAMA_CONFIG.model}\x1b[0m`);
  
  for (let i = 0; i < retries; i++) {
    if (i > 0) {
      console.log(`\x1b[33mRetry ${i + 1}: ${prompt.slice(0, 60)}...\x1b[0m`);
    }
    
    try {
      const requestConfig = {
        method: 'post',
        url: `${OLLAMA_CONFIG.baseUrl}/api/generate`,
        data: {
          model: OLLAMA_CONFIG.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 1024
          }
        },
        timeout: OLLAMA_CONFIG.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios(requestConfig);
      
      if (!res.data || !res.data.response) {
        throw new Error('Invalid response structure from Ollama');
      }
      
      const response = res.data.response.trim();
      console.log(`\x1b[32m✓ Generated text response (${response.length} chars)\x1b[0m`);
      return response;
      
    } catch (err) {
      const isLastAttempt = i === retries - 1;
      
      if (err.code === 'ECONNREFUSED' && !isLastAttempt) {
        console.warn(`\x1b[33m⚠ Connection refused, retrying in ${delay}ms...\x1b[0m`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      } else if (err.response?.status === 404 && !isLastAttempt) {
        console.warn(`\x1b[33m⚠ Model not ready, retrying in ${delay}ms...\x1b[0m`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      
      if (isLastAttempt) {
        console.error(`\x1b[31m✗ Text generation failed: ${err.message}\x1b[0m`);
        throw err;
      }
    }
  }
}

// Health check function to test Ollama connection
async function checkOllamaHealth() {
  try {
    console.log(`\x1b[36mChecking Ollama health at: ${OLLAMA_CONFIG.baseUrl}\x1b[0m`);
    
    const res = await axios.get(`${OLLAMA_CONFIG.baseUrl}/api/version`, {
      timeout: 5000
    });
    
    console.log(`\x1b[32m✓ Ollama is running (version: ${res.data?.version || 'unknown'})\x1b[0m`);
    
    // Check if model is available
    const modelsRes = await axios.get(`${OLLAMA_CONFIG.baseUrl}/api/tags`, {
      timeout: 5000
    });
    
    const availableModels = modelsRes.data?.models?.map(m => m.name) || [];
    const modelExists = availableModels.some(name => name.includes(OLLAMA_CONFIG.model));
    
    if (modelExists) {
      console.log(`\x1b[32m✓ Model '${OLLAMA_CONFIG.model}' is available\x1b[0m`);
    } else {
      console.warn(`\x1b[33m⚠ Model '${OLLAMA_CONFIG.model}' not found\x1b[0m`);
      console.warn(`\x1b[33m  Available models: ${availableModels.join(', ')}\x1b[0m`);
      console.warn(`\x1b[33m  Run: ollama pull ${OLLAMA_CONFIG.model}\x1b[0m`);
    }
    
    return true;
  } catch (err) {
    console.error(`\x1b[31m✗ Ollama health check failed: ${err.message}\x1b[0m`);
    console.error(`\x1b[31m  Make sure Ollama is running at: ${OLLAMA_CONFIG.baseUrl}\x1b[0m`);
    return false;
  }
}

// CRITICAL: Make sure both functions are exported
module.exports = {
  retryGenerateJSON,  // FOR JSON GENERATION
  retryGenerate,      // FOR BACKWARD COMPATIBILITY  
  checkOllamaHealth
};

// Debug: Log what we're exporting
console.log("llmClient.js exports:", Object.keys(module.exports));