/* ==========================================================================
   LÓGICA DO CONTROLE REMOTO KIDS - JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const remoteDevice = document.getElementById('remoteDevice');
    const screenDisplay = document.getElementById('screenDisplay');
    const displayDefault = document.getElementById('displayDefault');
    const displayActive = document.getElementById('displayActive');
    const displayArrowIcon = document.getElementById('displayArrowIcon');
    const displayTextLarge = document.getElementById('displayTextLarge');
    const powerBtn = document.getElementById('powerBtn');
    const ledIndicator = document.getElementById('ledIndicator');
    const speakBtn = document.getElementById('speakBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const volumeSlider = document.getElementById('volumeSlider');
    const audioWaves = document.getElementById('audioWaves');
    const rippleBg = document.getElementById('rippleBg');
    const starsContainer = document.getElementById('starsContainer');

    // Direction Buttons
    const buttons = {
        cima: document.getElementById('btnUp'),
        baixo: document.getElementById('btnDown'),
        esquerda: document.getElementById('btnLeft'),
        direita: document.getElementById('btnRight')
    };

    // Keyboard keys to direction mapping
    const keyMap = {
        'ArrowUp': 'cima',
        'w': 'cima',
        'W': 'cima',
        'ArrowDown': 'baixo',
        's': 'baixo',
        'S': 'baixo',
        'ArrowLeft': 'esquerda',
        'a': 'esquerda',
        'A': 'esquerda',
        'ArrowRight': 'direita',
        'd': 'direita',
        'D': 'direita'
    };

    // Styling configuration per direction
    const directionConfig = {
        cima: {
            text: 'CIMA',
            emoji: '⬆️',
            color: 'var(--color-up)',
            glow: 'rgba(255, 71, 87, 0.6)'
        },
        baixo: {
            text: 'BAIXO',
            emoji: '⬇️',
            color: 'var(--color-down)',
            glow: 'rgba(255, 165, 2, 0.6)'
        },
        esquerda: {
            text: 'ESQUERDA',
            emoji: '⬅️',
            color: 'var(--color-left)',
            glow: 'rgba(46, 213, 115, 0.6)'
        },
        direita: {
            text: 'DIREITA',
            emoji: '➡️',
            color: 'var(--color-right)',
            glow: 'rgba(30, 144, 255, 0.6)'
        }
    };

    // App State
    let isSoundOn = true;
    let lastDirection = '';
    let screenTimeout = null;
    let voices = [];
    let ptVoice = null;

    // 1. DYNAMIC STAR GENERATION FOR BACKGROUND AESTHETICS
    function createStars() {
        const starCount = 35;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = star.style.height = `${Math.random() * 4 + 2}px`;
            star.style.backgroundColor = '#ffffff';
            star.style.borderRadius = '50%';
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.opacity = Math.random() * 0.7 + 0.3;
            
            // Random animation delay and duration
            const duration = Math.random() * 3 + 2;
            star.style.animation = `twinkle ${duration}s ease-in-out infinite alternate`;
            starsContainer.appendChild(star);
        }
    }

    // Add keyframe styling inline for twinkling stars
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes twinkle {
            0% { opacity: 0.2; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(styleSheet);
    createStars();

    // 2. WEB SPEECH API INITIALIZATION
    function initSpeech() {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                voices = window.speechSynthesis.getVoices();
                // Prioritize Portuguese (Brazil), fallback to Portuguese (any), fallback to first voice
                ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR') ||
                          voices.find(v => v.lang.startsWith('pt')) ||
                          voices[0];
            };
            
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        } else {
            console.error('Speech Synthesis não é suportado pelo seu navegador.');
            voiceStatus.textContent = 'VOZ: INDISPONÍVEL';
            voiceStatus.classList.add('muted');
        }
    }
    initSpeech();

    // 3. MAIN ACTION HANDLER (SPEAK & VISUAL FEEDBACK)
    function triggerAction(direction) {
        if (!directionConfig[direction]) return;
        
        lastDirection = direction;
        const config = directionConfig[direction];

        // Highlight screen with corresponding direction color
        updateScreen(config);

        // Transmit effect
        triggerIRTransmission();

        // Speak the direction out loud
        speak(config.text);
    }

    // Speak Function using SpeechSynthesis
    function speak(text) {
        if (!isSoundOn || !('speechSynthesis' in window)) return;

        // Cancel previous speech immediately
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Settings for speaking "BEM ALTO" (loudly)
        utterance.volume = parseFloat(volumeSlider.value);
        utterance.rate = 1.1; // Slightly faster for a playful response
        utterance.pitch = 1.25; // Slightly high-pitched/friendly kids voice
        
        if (ptVoice) {
            utterance.voice = ptVoice;
        }
        utterance.lang = 'pt-BR';

        // CSS animation triggers
        audioWaves.classList.add('active');
        rippleBg.classList.add('pulsing');

        utterance.onend = () => {
            audioWaves.classList.remove('active');
            rippleBg.classList.remove('pulsing');
        };

        utterance.onerror = () => {
            audioWaves.classList.remove('active');
            rippleBg.classList.remove('pulsing');
        };

        window.speechSynthesis.speak(utterance);
    }

    // Update screen display and visual glows
    function updateScreen(config) {
        // Clear previous timeout
        if (screenTimeout) clearTimeout(screenTimeout);

        // Toggle active screen content
        displayDefault.style.display = 'none';
        displayActive.style.display = 'flex';

        // Update elements
        displayArrowIcon.textContent = config.emoji;
        displayTextLarge.textContent = config.text;
        
        // Colors & Shadows
        displayTextLarge.style.color = config.color;
        displayArrowIcon.style.color = config.color;
        
        // Add screen border glow
        const screenGlass = document.querySelector('.screen-glass');
        screenGlass.style.borderColor = config.color;
        screenGlass.style.boxShadow = `inset 0 0 15px ${config.glow}, 0 0 10px ${config.glow}`;

        // Reset screen after 3.5 seconds of inactivity
        screenTimeout = setTimeout(() => {
            displayActive.style.display = 'none';
            displayDefault.style.display = 'flex';
            screenGlass.style.borderColor = '#1f253d';
            screenGlass.style.boxShadow = 'none';
        }, 3500);
    }

    // Flash the IR Blaster LED to simulate signal transmission
    function triggerIRTransmission() {
        remoteDevice.classList.add('transmitting');
        setTimeout(() => {
            remoteDevice.classList.remove('transmitting');
        }, 300);
    }

    // 4. BIND EVENT LISTENERS

    // Click on D-PAD buttons
    Object.keys(buttons).forEach(dir => {
        const btn = buttons[dir];
        if (btn) {
            btn.addEventListener('click', () => {
                triggerAction(dir);
            });
        }
    });

    // Keyboard Key Down / Key Up Listeners
    window.addEventListener('keydown', (e) => {
        // Prevent default browser scrolling with Arrow Keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        const direction = keyMap[e.key];
        if (direction) {
            const btn = buttons[direction];
            if (btn && !btn.classList.contains('active')) {
                btn.classList.add('active');
                triggerAction(direction);
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const direction = keyMap[e.key];
        if (direction) {
            const btn = buttons[direction];
            if (btn) {
                btn.classList.remove('active');
            }
        }
    });

    // Power (Mute/Unmute Toggle) Button
    powerBtn.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        if (isSoundOn) {
            powerBtn.classList.add('active');
            ledIndicator.classList.remove('muted');
            ledIndicator.classList.add('active');
            voiceStatus.textContent = 'VOZ: LIGADA';
            voiceStatus.classList.remove('muted');
            
            // Speak confirmation
            speak("Controle Ligado!");
        } else {
            // Cancel current speech
            window.speechSynthesis.cancel();
            
            powerBtn.classList.remove('active');
            ledIndicator.classList.remove('active');
            ledIndicator.classList.add('muted');
            voiceStatus.textContent = 'VOZ: SILENCIADO';
            voiceStatus.classList.add('muted');
            
            // Stop animations
            audioWaves.classList.remove('active');
            rippleBg.classList.remove('pulsing');
        }
    });

    // Repeat Speak Button (Question Mark Button)
    speakBtn.addEventListener('click', () => {
        if (lastDirection) {
            triggerAction(lastDirection);
        } else {
            speak("Aperte uma seta primeiro!");
        }
    });

    // Volume Slider change
    volumeSlider.addEventListener('input', () => {
        // Double-check if voice is on, and play a short test sound or visual update
        if (isSoundOn && lastDirection) {
            // Wait slightly before speaking to avoid firing on every slider tick
            clearTimeout(window.volTimer);
            window.volTimer = setTimeout(() => {
                speak(directionConfig[lastDirection].text);
            }, 300);
        }
    });
});
