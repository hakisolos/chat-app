const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage); // Display user message
  chatInput.value = '';

  // Show typing animation
  appendMessage('ai', 'NIKKA-AI is typing...');

  try {
    const response = await axios.post('http://localhost:3000/api', {
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

// Function to append messages to the chat window
function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
}

// Function to remove typing message
function removeTyping() {
  const typingMessage = document.querySelector('.message.ai:last-child');
  if (typingMessage && typingMessage.textContent === 'NIKKA-AI is typing...') {
    typingMessage.remove();
  }
}
