import Anthropic from '@anthropic-ai/sdk';

// Note: Our server now supports multiple AI providers (Anthropic and Perplexity)
// with fallback capabilities, but the client API interface remains the same.
// The server automatically selects and manages providers behind the scenes.
// Renamed to aiService to reflect our multi-provider approach
const aiService = {
  analyze: async (prompt: string): Promise<any> => {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error;
    }
  },
  
  searchProperties: async (voiceCommand: string): Promise<any> => {
    try {
      const response = await fetch('/api/ai/search-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceCommand }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error processing voice search:', error);
      throw error;
    }
  }
};

export default aiService;