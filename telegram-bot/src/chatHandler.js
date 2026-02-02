const fetchActiveCatalog = require("./catalogFetcher");
const buildSystemPrompt = require("./systemPrompt");

async function chatHandler(conversationHistory) {
    try {
        // Fetch fresh catalog data
        const catalogData = await fetchActiveCatalog();

        // Build system prompt with current catalog
        const systemPrompt = buildSystemPrompt(catalogData);

        // Construct messages array for API
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
        ];

        // Call OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "arcee-ai/trinity-mini:free",
                messages: messages,
                max_tokens: 300,
                temperature: 0.7,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter API Error:", data.error || data);
            throw new Error(`API returned status ${response.status}`);
        }

        if (data.choices && data.choices.length > 0) {
            const content = data.choices[0].message.content;
            if (!content || content.trim() === "") {
                console.error("AI returned empty content:", data);
                throw new Error("AI returned empty response");
            }
            return content;
        } else {
            console.error("No choices returned from OpenRouter:", data);
            throw new Error("Invalid API response format");
        }
    } catch (error) {
        console.error("Error in chatHandler:", error);
        return "Sorry, I am having a little trouble right now. Please try again in a moment!";
    }
}

module.exports = chatHandler;
