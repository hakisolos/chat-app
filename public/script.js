const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');

window.onload = loadChatHistory;

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  chatInput.value = '';

  const spinnerElement = startSpinner();

  try {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    const response = await axios.post('/api', {
      conversation: chatHistory, // Send full conversation history
      query: userMessage
    });

    stopSpinner(spinnerElement);

    let botResponse = response.data && response.data.response
      ? response.data.response
      : 'Sorry, I couldn’t process your request.';

    appendMessage('ai', botResponse);

    // Save updated conversation
    saveChatHistory(userMessage, botResponse);
  } catch (error) {
    console.error('Error:', error);
    stopSpinner(spinnerElement);
    appendMessage('ai', 'Connection failed. Please try again later.');
  }
});

// Append messages to chat window
function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Spinner animation
function startSpinner() {
  const spinnerElement = document.createElement('div');
  spinnerElement.className = 'message ai';
  spinnerElement.textContent = '⠋';
  chatWindow.appendChild(spinnerElement);
  
  let frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let index = 0;

  spinnerElement.spinnerInterval = setInterval(() => {
    spinnerElement.textContent = frames[index];
    index = (index + 1) % frames.length;
  }, 100);

  return spinnerElement;
}

// Remove spinner
function stopSpinner(spinnerElement) {
  clearInterval(spinnerElement.spinnerInterval);
  spinnerElement.remove();
}

// Load chat history from localStorage
function loadChatHistory() {
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistory.forEach(msg => appendMessage(msg.role, msg.text));
}

// Save chat history and send previous messages in API request
function saveChatHistory(userMessage, botMessage) {
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistory.push({ role: "user", text: userMessage });
  chatHistory.push({ role: "ai", text: botMessage });

  // Limit history size (optional: only keep last 10 messages)
  if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Clear chat history
function clearChatHistory() {
  localStorage.removeItem("chatHistory");
  chatWindow.innerHTML = "";
}
