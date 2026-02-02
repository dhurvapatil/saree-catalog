require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const chatHandler = require("./chatHandler");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store conversation histories per chat
const conversationHistories = new Map();

bot.on("text", async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userMessage = msg.text;

        // Initialize history for new chats
        if (!conversationHistories.has(chatId)) {
            conversationHistories.set(chatId, []);
        }

        const history = conversationHistories.get(chatId);

        // Add user message to history
        history.push({ role: "user", content: userMessage });

        // Get AI response
        const reply = await chatHandler(history);

        // Add assistant response to history
        history.push({ role: "assistant", content: reply });

        // Trim history to last 20 messages
        if (history.length > 20) {
            conversationHistories.set(chatId, history.slice(-20));
        }

        // Send reply
        await bot.sendMessage(chatId, reply);
    } catch (error) {
        console.error("Error handling message:", error);
        await bot.sendMessage(
            msg.chat.id,
            "Sorry, something went wrong. Please try again in a moment!"
        );
    }
});

console.log("Saree Bot is running and listening for messages...");
