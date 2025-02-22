const express = require("express");
const axios = require("axios");

const app = express();
const API_KEY = "AIzaSyC7cxrPYpB5ktu7btqc2jOg3wkoTnK1zak";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// Store chat history & facts in memory (Resets on each deployment)
let chatHistory = [];
let facts = {};

app.use(express.json());
app.use(express.static("public"));

// Extract facts (e.g., "My name is Haki")
const extractFacts = (message) => {
  const nameMatch = message.match(/my name is (\w+)/i);
  if (nameMatch) {
    facts.name = nameMatch[1]; // Store name
  }
};

app.post("/api", async (req, res) => {
  const userMessage = req.body.query;
  console.log("User message:", userMessage);

  try {
    chatHistory.push({ role: "user", text: userMessage });
    extractFacts(userMessage);

    // Keep only the last 5 messages
    chatHistory = chatHistory.slice(-5);

    const memoryText = facts.name ? `The user's name is ${facts.name}.` : "";

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: "incase they ask, your name is nikka ai by H4KI XER"},{ text: memoryText }, { text: userMessage }],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data?.candidates?.length > 0) {
      const generatedText = response.data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: "assistant", text: generatedText });

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
