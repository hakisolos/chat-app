const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const path = require("path")

const API_KEY = "AIzaSyC7cxrPYpB5ktu7btqc2jOg3wkoTnK1zak"; // Replace with your actual key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const CHAT_HISTORY_FILE = "chat_history.json";
const FACTS_FILE = "facts.json";

app.use(express.json());
///app.use(express.static("public"));

// Load stored data or create empty if missing
const loadData = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : []);
const saveData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");

// Extract facts (e.g., "My name is Haki" → Store `{name: "Haki"}`)
const extractFacts = (message) => {
  const facts = loadData(FACTS_FILE);
  const nameMatch = message.match(/my name is (\w+)/i);
  if (nameMatch) {
    facts.name = nameMatch[1]; // Store name
    saveData(FACTS_FILE, facts);
  }
};
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
}) 
// API route for AI chat
app.post("/api", async (req, res) => {
  const userMessage = req.body.query;
  console.log("User message:", userMessage);

  try {
    let chatHistory = loadData(CHAT_HISTORY_FILE);
    chatHistory.push({ role: "user", text: userMessage });

    // Extract facts before API request
    extractFacts(userMessage);

    // Keep only the last 10 messages (to maintain context)
    chatHistory = chatHistory.slice(-10);

    // Load stored facts
    const facts = loadData(FACTS_FILE);
    const memoryText = facts.name ? `The user's name is ${facts.name}.` : "";

    // Prepare Gemini API request
    const requestContents = chatHistory.map(({ role, text }) => ({
      role: role === "user" ? "user" : "model",
      parts: [{ text }],
    }));

    // Add memory facts as system message
    if (memoryText) {
      requestContents.unshift({ role: "system", parts: [{ text: memoryText }] });
    }

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      { contents: requestContents },
      { headers: { "Content-Type": "application/json" } }
    );

    // Extract AI response
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const generatedText = response.data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: "assistant", text: generatedText });

      // Save updated chat history
      saveData(CHAT_HISTORY_FILE, chatHistory);

      // Send response back
      return res.json({ response: generatedText });
    } else {
      throw new Error("No valid response from Gemini API.");
    }
  } catch (error) {
    console.error("Error during API call:", error.response?.data || error.message);
    res.status(500).json({ response: "Connection failed. Please try again later." });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
