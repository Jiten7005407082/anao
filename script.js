// Google Sheets setup
const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
let conversationHistory = [];

// DOM elements
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const languageSelect = document.getElementById('language');

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

// Voice button click handler
voiceBtn.addEventListener('click', () => {
    const selectedLang = languageSelect.value;
    recognition.lang = selectedLang === 'mni' ? 'en-IN' : 'en-US'; // English for both as Manipuri may not be supported
    
    recognition.start();
    voiceBtn.textContent = "Listening...";
});

// Speech recognition result
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
    voiceBtn.textContent = "🎤 Speak";
};

// Send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    const selectedLang = languageSelect.value;
    const isManipuri = selectedLang === 'mni';
    
    // Display user message
    displayMessage(message, 'user');
    
    // Process response (simple example)
    let response;
    if (isManipuri) {
        response = getManipuriResponse(message);
    } else {
        response = getEnglishResponse(message);
    }
    
    // Display bot response after delay
    setTimeout(() => {
        displayMessage(response, 'bot');
        saveToGoogleSheets(message, response, selectedLang);
    }, 500);
    
    userInput.value = '';
}

// Simple response logic (you'll need to expand this)
function getEnglishResponse(message) {
    message = message.toLowerCase();
    if (message.includes('hello') || message.includes('hi')) {
        return "Hello! How can I help you today?";
    } else if (message.includes('how are you')) {
        return "I'm doing well, thank you!";
    } else {
        return "I understand you said: " + message;
    }
}

function getManipuriResponse(message) {
    // Add your Manipuri responses here
    // This is a simple example - you'll need proper translations
    message = message.toLowerCase();
    if (message.includes('hello') || message.includes('hi') || message.includes('khurumjari')) {
        return "Khurumjari! Einai thokning amukta tambiram? (Hello! How can I help you?)";
    } else if (message.includes('how are you') || message.includes('nang kaygi thouroi')) {
        return "Nungshi thouroi, yengbira! (I'm fine, thank you!)";
    } else {
        return "Einai khangdana: " + message;
    }
}

// Display message in chatbox
function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender);
    messageDiv.textContent = message;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Save to Google Sheets
function saveToGoogleSheets(userMessage, botResponse, language) {
    const timestamp = new Date().toISOString();
    conversationHistory.push({
        timestamp,
        language,
        userMessage,
        botResponse
    });
    
    // Send to Google Sheets via Apps Script
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(conversationHistory),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => console.log('Success:', response))
    .catch(error => console.error('Error:', error));
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
