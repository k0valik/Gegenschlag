/**
 * @file PerplexityClient.js
 * @description A client for interacting with the Perplexity AI API.
 * This is used for intelligent cheat probability assessment based on aggregated player data.
 */

export class PerplexityClient {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Perplexity API key is required.');
        }
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.perplexity.ai';
    }

    /**
     * Analyzes player data to assess cheat probability.
     * @param {Object} playerData - An object containing aggregated data for a player.
     * @returns {Promise<Object>} A promise that resolves with the AI's analysis.
     */
    async analyzePlayerData(playerData) {
        const model = 'sonar-pro'; // As specified in the roadmap

        // Construct a detailed prompt for the AI
        const prompt = `
            Analyze the following CS2 player data and provide a cheat probability score from 0 to 100.
            The output must be in JSON format with two keys: "cheat_probability" (integer) and "reasoning" (string).

            Player Data:
            - VAC Bans: ${playerData.vac_bans}
            - Account Age (days): ${playerData.account_age_days}
            - Headshot Percentage: ${playerData.headshot_percentage}%
            - Faceit ELO: ${playerData.faceit_elo}
            - Leetify Rating: ${playerData.leetify_rating}

            Consider high headshot percentages, multiple VAC bans, and very young accounts as suspicious.
            Provide a brief reasoning for your score.
        `;

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    // The roadmap mentions structured output, which Perplexity supports.
                    // This is a simplified example; a real implementation might use a more complex tool/function schema.
                })
            });

            if (!response.ok) {
                throw new Error(`Perplexity API request failed with status: ${response.status}`);
            }

            const result = await response.json();
            // Assuming the AI follows instructions, the response will contain the structured JSON.
            // In a real app, you'd need to parse result.choices[0].message.content to get the JSON.
            return result;

        } catch (error) {
            console.error('Error analyzing player data with Perplexity:', error);
            throw error;
        }
    }
}
