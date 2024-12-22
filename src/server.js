const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));

// API route to handle user input and make external API requests
app.post('/api', async (req, res) => {
  const userMessage = req.body.query;

  try {
    console.log('User message:', userMessage);  // Log incoming message

    // Make the API call to the external API
    const response = await axios.get(`https://api.nexoracle.com/ai/chatgpt-3?apikey=elDrYH7GsuIeBkyw1&prompt=${encodeURIComponent(userMessage)}`);
    
    // Log the response data
    console.log('API response:', response.data);

    // Send the response back to the frontend
    res.json({ response: response.data.result });
  } catch (error) {
    // Log error
    console.error('Error during API call:', error.message);
    res.status(500).json({ response: 'Connection failed. Please try again later.' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
