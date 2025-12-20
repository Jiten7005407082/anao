// DOM Elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const clearBtn = document.getElementById('clearBtn');
const voiceSelect = document.getElementById('voiceSelect');
const rateSlider = document.getElementById('rate');
const pitchSlider = document.getElementById('pitch');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');
const progressBar = document.getElementById('progressBar');
const exampleText = document.querySelector('.example');

// Speech Synthesis
let synth = window.speechSynthesis;
let voices = [];
let isPaused = false;
let currentUtterance = null;
let audioChunks = [];

// Initialize
function init() {
    loadVoices();
    setupEventListeners();
    updateCharCount();
    
    // If voices aren't loaded yet, wait for them
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

// Load available voices
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    
    // Filter English voices for better selection
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
    
    englishVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    
    // Select default voice
    if (englishVoices.length > 0) {
        const defaultVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Microsoft'));
        if (defaultVoice) {
            voiceSelect.value = defaultVoice.name;
        }
    }
    
    updateStatus(`${voices.length} voices loaded`);
}

// Event Listeners
function setupEventListeners() {
    textInput.addEventListener('input', updateCharCount);
    
    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        updateCharCount();
        textInput.focus();
    });
    
    exampleText.addEventListener('click', () => {
        textInput.value = exampleText.textContent;
        updateCharCount();
    });
    
    rateSlider.addEventListener('input', () => {
        rateValue.textContent = rateSlider.value;
    });
    
    pitchSlider.addEventListener('input', () => {
        pitchValue.textContent = pitchSlider.value;
    });
    
    speakBtn.addEventListener('click', speakText);
    pauseBtn.addEventListener('click', pauseSpeech);
    resumeBtn.addEventListener('click', resumeSpeech);
    stopBtn.addEventListener('click', stopSpeech);
    downloadBtn.addEventListener('click', downloadAudio);
    
    // Handle speech events
    synth.addEventListener('start', () => {
        updateStatus('Speaking...');
        speakBtn.disabled = true;
    });
    
    synth.addEventListener('end', () => {
        updateStatus('Finished speaking');
        speakBtn.disabled = false;
        progressBar.style.width = '0%';
    });
    
    synth.addEventListener('error', (event) => {
        updateStatus('Error: ' + event.error, 'error');
        speakBtn.disabled = false;
    });
}

// Update character count
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;
    
    if (count > 5000) {
        charCount.style.color = '#e74c3c';
        updateStatus('Text exceeds 5000 characters', 'warning');
    } else {
        charCount.style.color = '#6a11cb';
    }
}

// Update status message
function updateStatus(message, type = 'info') {
    status.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    
    // Reset color
    status.style.background = '#e8f4fc';
    status.style.color = '#2980b9';
    
    if (type === 'error') {
        status.style.background = '#fde8e8';
        status.style.color = '#e74c3c';
    } else if (type === 'warning') {
        status.style.background = '#fff3cd';
        status.style.color = '#856404';
    } else if (type === 'success') {
        status.style.background = '#d4edda';
        status.style.color = '#155724';
    }
}

// Speak the text
function speakText() {
    const text = textInput.value.trim();
    
    if (!text) {
        updateStatus('Please enter some text', 'warning');
        textInput.focus();
        return;
    }
    
    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    const selectedVoice = voices.find(v => v.name === voiceSelect.value);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    // Set rate and pitch
    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);
    
    // Progress tracking
    utterance.addEventListener('boundary', (event) => {
        const progress = (event.charIndex / text.length) * 100;
        progressBar.style.width = `${progress}%`;
    });
    
    currentUtterance = utterance;
    synth.speak(utterance);
    updateStatus('Starting speech...', 'success');
}

// Control functions
function pauseSpeech() {
    if (synth.speaking && !isPaused) {
        synth.pause();
        isPaused = true;
        updateStatus('Speech paused');
    }
}

function resumeSpeech() {
    if (synth.speaking && isPaused) {
        synth.resume();
        isPaused = false;
        updateStatus('Resuming speech...');
    }
}

function stopSpeech() {
    synth.cancel();
    isPaused = false;
    updateStatus('Speech stopped');
    progressBar.style.width = '0%';
    speakBtn.disabled = false;
}

// Download audio as WAV (simulated - actual download requires more complex setup)
function downloadAudio() {
    const text = textInput.value.trim();
    
    if (!text) {
        updateStatus('Please enter text to download', 'warning');
        return;
    }
    
    if (text.length > 5000) {
        updateStatus('Text too long for download. Please use shorter text.', 'warning');
        return;
    }
    
    updateStatus('Download feature simulated. For actual WAV download, you would need a server-side component or more complex client-side implementation.', 'info');
    
    // In a real implementation, you would:
    // 1. Use Web Audio API to generate audio
    // 2. Convert to WAV format
    // 3. Create download link
    // This is simplified for GitHub Pages compatibility
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);

// Update status on page load
updateStatus('Ready to convert text to speech');
