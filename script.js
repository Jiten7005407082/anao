function displayMessage(message, sender) {
    // Show the appropriate avatar
    if (sender === 'user') {
        document.getElementById('userAvatar').style.display = 'block';
        document.getElementById('botAvatar').style.display = 'none';
    } else {
        document.getElementById('botAvatar').style.display = 'block';
        document.getElementById('userAvatar').style.display = 'none';
        
        // Make avatar "talk" (animate) while speaking
        const botAvatar = document.getElementById('botAvatar');
        botAvatar.classList.add('talking');
        
        // Stop talking animation after delay
        setTimeout(() => {
            botAvatar.classList.remove('talking');
        }, 2000);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender);
    messageDiv.textContent = message;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}
