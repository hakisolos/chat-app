const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://your-deployed-api-url.com/api';

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage); // Display user message
  chatInput.value = '';

  // Show typing animation
  appendMessage('ai', 'NIKKA-AI is typing...');

  try {
    const response = await axios.post(apiUrl, {
      query: userMessage,
    });

    // Remove typing message
    removeTyping();

    if (response.data && response.data.response) {
      appendMessage('ai', response.data.response); // Append AI response
    } else {
      appendMessage('ai', 'Sorry, I couldn’t process your request.');
    }
  } catch (error) {
    console.error('Error:', error);
    removeTyping();
    appendMessage('ai', 'Connection failed. Please try again later.');
  }
});
