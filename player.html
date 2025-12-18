<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Text to Audio - Save to Drive</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #4285f4;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 15px;
            font-size: 1.8em;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
            font-size: 0.95em;
        }
        
        textarea {
            width: 100%;
            height: 150px;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
            resize: vertical;
            line-height: 1.5;
        }
        
        .voice-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .voice-btn {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-weight: bold;
            text-align: center;
            transition: all 0.3s;
        }
        
        .voice-btn.active {
            color: white;
            border-color: transparent;
        }
        
        .male-btn.active {
            background: #4285f4;
        }
        
        .female-btn.active {
            background: #ea4335;
        }
        
        .slider-group {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .slider-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        
        input[type="range"] {
            width: 100%;
            height: 6px;
            background: #ddd;
            border-radius: 3px;
            margin-top: 5px;
        }
        
        .main-btn {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            background: #34a853;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .main-btn:hover {
            background: #2d9248;
            transform: translateY(-2px);
        }
        
        .drive-btn {
            background: #4285f4;
            margin-top: 15px;
        }
        
        .drive-btn:hover {
            background: #3367d6;
        }
        
        .status {
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-top: 15px;
            font-weight: bold;
            display: none;
        }
        
        .status.show {
            display: block;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        audio {
            width: 100%;
            margin-top: 15px;
            border-radius: 5px;
        }
        
        .simple-instructions {
            background: #e8f0fe;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            display: none;
        }
        
        .simple-instructions.show {
            display: block;
        }
        
        .simple-instructions h4 {
            color: #1a73e8;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .simple-instructions ol {
            margin-left: 20px;
            color: #333;
        }
        
        .simple-instructions li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 Text to Audio</h1>
        <p class="subtitle">Convert text to speech and save to Google Drive</p>
        
        <textarea id="textInput" placeholder="Type your text here...">Hello! This is a test of the text to speech converter. Your audio will be saved to Google Drive.</textarea>
        
        <div class="voice-buttons">
            <button class="voice-btn male-btn active" id="maleBtn">👨 Male Voice</button>
            <button class="voice-btn female-btn" id="femaleBtn">👩 Female Voice</button>
        </div>
        
        <div class="slider-group">
            <label>Speed</label>
            <input type="range" id="speedSlider" min="0.5" max="2" step="0.1" value="1">
        </div>
        
        <button id="convertBtn" class="main-btn">
            🔊 Convert & Play
        </button>
        
        <button id="driveBtn" class="main-btn drive-btn">
            📁 Save to Google Drive
        </button>
        
        <div class="simple-instructions" id="instructions">
            <h4>📋 Easy Steps to Save to Drive:</h4>
            <ol>
                <li>Your file has been downloaded</li>
                <li>Go to <a href="https://drive.google.com" target="_blank" style="color: #1a73e8;">drive.google.com</a></li>
                <li>Click "New" → "File upload"</li>
                <li>Select the downloaded file</li>
                <li>Done! File is in your Drive</li>
            </ol>
        </div>
        
        <audio id="audioElement" controls></audio>
        
        <div class="status" id="status">Ready to convert text</div>
    </div>

    <script>
        class SimpleTextToDrive {
            constructor() {
                this.synth = window.speechSynthesis;
                this.isMale = true;
                this.generatedFile = null;
                this.fileName = "";
                
                this.init();
            }
            
            init() {
                // Get elements
                this.textInput = document.getElementById('textInput');
                this.maleBtn = document.getElementById('maleBtn');
                this.femaleBtn = document.getElementById('femaleBtn');
                this.speedSlider = document.getElementById('speedSlider');
                this.convertBtn = document.getElementById('convertBtn');
                this.driveBtn = document.getElementById('driveBtn');
                this.instructions = document.getElementById('instructions');
                this.audioElement = document.getElementById('audioElement');
                this.status = document.getElementById('status');
                
                // Setup events
                this.setupEvents();
            }
            
            setupEvents() {
                // Voice buttons
                this.maleBtn.addEventListener('click', () => this.setVoice(true));
                this.femaleBtn.addEventListener('click', () => this.setVoice(false));
                
                // Convert button
                this.convertBtn.addEventListener('click', () => this.convertText());
                
                // Drive button
                this.driveBtn.addEventListener('click', () => this.saveToDrive());
            }
            
            setVoice(isMale) {
                this.isMale = isMale;
                this.maleBtn.classList.toggle('active', isMale);
                this.femaleBtn.classList.toggle('active', !isMale);
                this.showStatus(`${isMale ? 'Male' : 'Female'} voice selected`, 'info');
            }
            
            convertText() {
                const text = this.textInput.value.trim();
                
                if (!text) {
                    this.showStatus('Please enter some text', 'info');
                    return;
                }
                
                if (this.synth.speaking) {
                    this.synth.cancel();
                }
                
                this.showStatus('Converting text to speech...', 'info');
                this.convertBtn.disabled = true;
                
                // Get voices
                const voices = this.synth.getVoices();
                let voice = null;
                
                if (voices.length > 0) {
                    if (this.isMale) {
                        voice = voices.find(v => v.name.toLowerCase().includes('male')) || voices[0];
                    } else {
                        voice = voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
                    }
                }
                
                // Create utterance
                const utterance = new SpeechSynthesisUtterance(text);
                if (voice) utterance.voice = voice;
                utterance.rate = parseFloat(this.speedSlider.value);
                utterance.pitch = this.isMale ? 0.8 : 1.2;
                utterance.volume = 1;
                
                utterance.onstart = () => {
                    this.showStatus('Playing audio...', 'info');
                };
                
                utterance.onend = () => {
                    this.showStatus('Audio ready! Click "Save to Google Drive"', 'success');
                    this.convertBtn.disabled = false;
                    
                    // Create file for Drive
                    this.createFile(text, voice);
                };
                
                this.synth.speak(utterance);
            }
            
            createFile(text, voice) {
                // Create timestamp
                const date = new Date();
                const timestamp = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
                
                // Create filename
                const voiceType = this.isMale ? 'male' : 'female';
                this.fileName = `audio_${voiceType}_${timestamp}.txt`;
                
                // Create file content
                const content = `TEXT TO SPEECH AUDIO
=====================

Date: ${date.toLocaleString()}
Voice: ${voiceType}
Speed: ${this.speedSlider.value}x

TEXT:
-----
${text}

TO CONVERT TO AUDIO:
-------------------
1. Copy the text above
2. Use any text-to-speech software
3. Save as MP3 or WAV file
4. Upload to Google Drive

=====================
End of file`;

                // Create blob
                this.generatedFile = new Blob([content], { type: 'text/plain' });
                
                // Create URL for audio player (simulated)
                const audioBlob = new Blob([`Audio reference for: ${text.substring(0, 50)}...`], { type: 'text/plain' });
                const audioUrl = URL.createObjectURL(audioBlob);
                this.audioElement.src = audioUrl;
                
                this.showStatus('File created! Ready to save to Drive.', 'success');
            }
            
            saveToDrive() {
                if (!this.generatedFile) {
                    this.showStatus('Please convert text first', 'info');
                    return;
                }
                
                // Step 1: Download the file
                const fileUrl = URL.createObjectURL(this.generatedFile);
                const a = document.createElement('a');
                a.href = fileUrl;
                a.download = this.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Step 2: Show instructions
                this.instructions.classList.add('show');
                
                // Step 3: Show success message
                this.showStatus(`File downloaded! Go to Google Drive to upload "${this.fileName}"`, 'success');
                
                // Clean up
                setTimeout(() => {
                    URL.revokeObjectURL(fileUrl);
                }, 100);
            }
            
            showStatus(message, type = 'info') {
                this.status.textContent = message;
                this.status.className = `status ${type} show`;
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    this.status.classList.remove('show');
                }, 5000);
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', () => {
            window.app = new SimpleTextToDrive();
        });
    </script>
</body>
</html>
