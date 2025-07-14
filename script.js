// Google Sheets setup
const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
let conversationHistory = [];
let isSpeaking = false;

// DOM elements
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const languageSelect = document.getElementById('language');
const userAvatar = document.getElementById('userAvatar');
const botAvatar = document.getElementById('botAvatar');

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

// Initialize avatars
function initAvatars() {
    userAvatar.style.display = 'none';
    botAvatar.style.display = 'none';
}

// Voice button click handler
voiceBtn.addEventListener('click', () => {
    if (isSpeaking) {
        stopSpeaking();
        return;
    }
    
    const selectedLang = languageSelect.value;
    recognition.lang = selectedLang === 'mni' ? 'en-IN' : 'en-US';
    
    recognition.start();
    voiceBtn.textContent = "Listening...";
    userAvatar.style.display = 'block';
    botAvatar.style.display = 'none';
});

// Stop speaking function
function stopSpeaking() {
    synth.cancel();
    isSpeaking = false;
    voiceBtn.textContent = "🎤 Speak";
    botAvatar.classList.remove('talking');
}

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
    
    // Display user message and avatar
    displayMessage(message, 'user');
    showAvatar('user');
    
    // Process response
    let response;
    if (isManipuri) {
        response = getManipuriResponse(message);
    } else {
        response = getEnglishResponse(message);
    }
    
    // Display bot response after delay
    setTimeout(() => {
        displayMessage(response, 'bot');
        speakResponse(response, selectedLang);
        saveToGoogleSheets(message, response, selectedLang);
    }, 500);
    
    userInput.value = '';
}

// Show appropriate avatar
function showAvatar(who) {
    if (who === 'user') {
        userAvatar.style.display = 'block';
        botAvatar.style.display = 'none';
    } else {
        userAvatar.style.display = 'none';
        botAvatar.style.display = 'block';
    }
}

// Simple response logic
function getEnglishResponse(message) {
    message = message.toLowerCase();
    if (message.includes('hello') || message.includes('hi')) {
        return "Hello! How can I help you today?";
    } else if (message.includes('how are you')) {
        return "I'm doing well, thank you!";
    } else if (message.includes('avatar') || message.includes('picture')) {
        return "That's my avatar Ton! Do you like it?";
    } else {
        return "I understand you said: " + message;
    }
}

function getManipuriResponse(message) {
    message = message.toLowerCase();
    if (message.includes('hello') || message.includes('hi') || message.includes('khurumjari')) {
        return "Khurumjari! Einai thokning amukta tambiram? (Hello! How can I help you?)";
    } else if (message.includes('how are you') || message.includes('nang kaygi thouroi')) {
        return "Nungshi thouroi, yengbira! (I'm fine, thank you!)";
    } else if (message.includes('avatar') || message.includes('chabi')) {
        return "Adudi eigi avatar Ton oiraba! Nangga pijaraga? (This is my avatar Ton! Do you like it?)";
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

// Speak the response
function speakResponse(text, lang) {
    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'mni' ? 'en-IN' : 'en-US';
    
    // Avatar talking animation
    botAvatar.classList.add('talking');
    isSpeaking = true;
    voiceBtn.textContent = "Stop";
    
    utterance.onend = function() {
        botAvatar.classList.remove('talking');
        isSpeaking = false;
        voiceBtn.textContent = "🎤 Speak";
    };
    
    synth.speak(utterance);
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

// Initialize
initAvatars();

// Add this for avatar click interaction
botAvatar.addEventListener('click', () => {
    const greetings = languageSelect.value === 'mni' ? 
        ["Khurumjari!", "Nang kaygi thouroi?", "Einai thokning amukta tambiram?"] : 
        ["Hello there!", "How can I help?", "Nice to see you!"];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    displayMessage(randomGreeting, 'bot');
    speakResponse(randomGreeting, languageSelect.value);
});

// Add blinking animation for avatars
setInterval(() => {
    if (!botAvatar.classList.contains('talking')) {
        botAvatar.querySelector('img').style.transform = 'scaleY(0.8)';
        setTimeout(() => {
            if (botAvatar.querySelector('img')) {
                botAvatar.querySelector('img').style.transform = 'scaleY(1)';
            }
        }, 200);
    }
}, 3000);
