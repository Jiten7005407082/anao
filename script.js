const chatBox = document.getElementById("chatBox");
const micBtn = document.getElementById("micBtn");

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// On mic button click
micBtn.addEventListener("click", () => {
  recognition.start();
  appendMessage("Bot", "Listening...");
});

// Handle speech result
recognition.onresult = function (event) {
  const userText = event.results[0][0].transcript;
  appendMessage("You", userText);
  botReply(userText);
};

// Generate bot reply (simple example or integrate GPT)
function botReply(text) {
  let reply = "Sorry, I didn't understand.";
  text = text.toLowerCase();

  if (text.includes("hello")) reply = "Hi there!";
  else if (text.includes("your name")) reply = "I'm your voice assistant.";
  else if (text.includes("how are you")) reply = "I'm just code, but I'm working well!";
  else if (text.includes("bye")) reply = "Goodbye! Have a great day!";

  appendMessage("Bot", reply);
  speak(reply);
}

// Append messages to chat
function appendMessage(sender, message) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Speech Synthesis
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
