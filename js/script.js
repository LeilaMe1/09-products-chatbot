// Main function to initialize the chat interface
function initChat() {
  // Get all required DOM elements
  const chatToggle = document.getElementById('chatToggle');
  const chatBox = document.getElementById('chatBox');
  const userInput = document.getElementById('userInput');
  const chatMessages = document.getElementById('chatMessages');
  const openIcon = document.querySelector('.open-icon');
  const closeIcon = document.querySelector('.close-icon');

  const conversation = [];

  // Toggle chat visibility and swap icons
  chatToggle.addEventListener('click', function () {
    chatBox.classList.toggle('active');
    openIcon.style.display = chatBox.classList.contains('active') ? 'none' : 'block';
    closeIcon.style.display = chatBox.classList.contains('active') ? 'block' : 'none';
  });

  // Handle user input and process messages
  function handleUserInput(e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message) {
      userInput.value = '';

      // Display the user's message
      const userMessage = document.createElement('div');
      userMessage.classList.add('message', 'user');
      userMessage.textContent = message;
      chatMessages.appendChild(userMessage);

      // Simulate bot response
      conversation.push({
        role: 'user',
        content: message
      });
      getBotResponse();
    }
  }

  async function getBotResponse() {
    const botMessage = document.createElement('div');
    botMessage.classList.add('message', 'bot');
    botMessage.textContent = "Typing...";
    chatMessages.appendChild(botMessage);

    try {
      const rentalsResponse = await fetch('./rentals.json');
      const rentals = await rentalsResponse.json();


      if (conversation.length < 3) {
        let nextQuestion = "";
        if (conversation.length === 1) {
          nextQuestion = "What type of experience are you looking for? For example, relaxing, adventurous, or unique.";
        } else if (conversation.length === 2) {
          nextQuestion = "Do you have a preferred location or region in mind?";
        }

        botMessage.textContent = nextQuestion;
        conversation.push({ role: 'assistant', content: nextQuestion });
      } else {
        const userPreferences = conversation.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
        const matchingRentals = rentals.rentals.filter(rental => {
          return userPreferences.some(pref =>
            rental.description.toLowerCase().includes(pref) ||
            rental.location.toLowerCase().includes(pref)
          );
        })
        if (matchingRentals.length > 0) {
          const recommendations = matchingRentals
            .slice(0, 3)
            .map(rental => `${rental.name} in ${rental.location}: ${rental.description}`)
            .join('\n\n');
          botMessage.textContent = `Based on your preferences, here are some recommendations:\n\n${recommendations}`;
          conversation.push({ role: 'assistant', content: botMessage.textContent });
        }
        else {
          botMessage.textContent = "Sorry, I couldn't find any rentals matching your preferences. Could you provide more details?";
          conversation.push({ role: 'assistant', content: botMessage.textContent });
        }
      }
      ///
      //const response = await fetch('https://api.openai.com/v1/chat/completions', {
      //  method: 'POST',
      //  headers: {
      //    'Content-Type': 'application/json',
      //    'Authorization': `Bearer ${apiKey}`
      //  },
      //  body: JSON.stringify({
      //    model: 'gpt-4o',
      //    messages: [
      //      ...conversation, {
      //        role: 'system', content:
      //          `Here is the vacation rental data: ${JSON.stringify(rentals.rentals)}`
      //      }]
      //  })
      //});

      //const data = await response.json();
      //botMessage.textContent = data.choices[0].message.content;
      //conversation.push({
      //  role: 'assistant', content: data.choices[0].message.content
      //});
      ///

      // Scroll to the latest message
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    catch (error) {
      botMessage.textContent = "Sorry, something went wrong. Please try again.";
      console.error('Error fetching bot response:', error);
    }

  }


  // Listen for form submission
  document.getElementById('chatForm').addEventListener('submit', handleUserInput);
}

// Initialize the chat interface
initChat();
