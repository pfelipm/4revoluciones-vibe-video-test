document.getElementById('start-btn').addEventListener('click', startExperience);

const scenes = [
    { id: 'scene-intro', duration: 4000, type: 'intro' },
    { id: 'scene-rev1', duration: 6000, type: 'rev1' },
    { id: 'scene-rev2', duration: 6000, type: 'rev2' },
    { id: 'scene-rev3', duration: 6000, type: 'rev3' },
    { id: 'scene-rev4', duration: 6000, type: 'rev4' },
    { id: 'scene-outro', duration: 5000, type: 'outro' }
];

let audioCtx;
let bassOsc;
let bassGain;
let arpeggiatorOsc;
let arpeggiatorGain;
let lfo;
let isPlaying = false;

function startExperience() {
    if (isPlaying) return;
    isPlaying = true;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    
    initAudio();
    runTimeline();
}

// Generative industrial soundtrack
function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    audioCtx = new AudioContext();
    
    // 1. Bass Drone
    bassOsc = audioCtx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A
    
    bassGain = audioCtx.createGain();
    bassGain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    // LFO for Bass to create a throbbing effect
    lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2, audioCtx.currentTime); // 2Hz
    
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(20, audioCtx.currentTime); // Depth of throb
    
    lfo.connect(lfoGain);
    lfoGain.connect(bassOsc.frequency);
    
    bassOsc.connect(bassGain);
    bassGain.connect(audioCtx.destination);
    
    // 2. Arpeggiator / High freq for later stages
    arpeggiatorOsc = audioCtx.createOscillator();
    arpeggiatorOsc.type = 'square';
    arpeggiatorOsc.frequency.setValueAtTime(440, audioCtx.currentTime);
    
    arpeggiatorGain = audioCtx.createGain();
    arpeggiatorGain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    arpeggiatorOsc.connect(arpeggiatorGain);
    arpeggiatorGain.connect(audioCtx.destination);
    
    // Start nodes
    bassOsc.start();
    lfo.start();
    arpeggiatorOsc.start();
}

function updateAudio(sceneType) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    switch(sceneType) {
        case 'intro':
            bassGain.gain.linearRampToValueAtTime(0.3, now + 1);
            lfo.frequency.setValueAtTime(1, now);
            break;
        case 'rev1': // Mechanization
            bassGain.gain.linearRampToValueAtTime(0.4, now + 1);
            lfo.frequency.linearRampToValueAtTime(4, now + 2);
            bassOsc.type = 'square';
            break;
        case 'rev2': // Electricity
            bassGain.gain.linearRampToValueAtTime(0.5, now + 1);
            lfo.frequency.linearRampToValueAtTime(8, now + 2);
            bassOsc.frequency.linearRampToValueAtTime(110, now + 2);
            arpeggiatorGain.gain.linearRampToValueAtTime(0.05, now + 1); // Introduce high spark
            break;
        case 'rev3': // Computers
            lfo.frequency.linearRampToValueAtTime(12, now + 2);
            bassOsc.frequency.setValueAtTime(55, now);
            bassOsc.type = 'sawtooth';
            arpeggiatorOsc.type = 'sawtooth';
            arpeggiatorGain.gain.linearRampToValueAtTime(0.1, now + 1);
            arpeggiatorOsc.frequency.setValueCurveAtTime([440, 880, 220, 880], now, 0.5); // Beeps
            setInterval(() => { if(isPlaying && audioCtx.state === 'running') arpeggiatorOsc.frequency.setValueCurveAtTime([440, 880, 220, 660], audioCtx.currentTime, 0.5); }, 500);
            break;
        case 'rev4': // AI / Network
            lfo.frequency.linearRampToValueAtTime(24, now + 2); // Fast processing
            bassGain.gain.linearRampToValueAtTime(0.6, now + 1);
            arpeggiatorOsc.type = 'sine';
            arpeggiatorGain.gain.linearRampToValueAtTime(0.2, now + 1);
            break;
        case 'outro':
            bassGain.gain.linearRampToValueAtTime(0, now + 4);
            arpeggiatorGain.gain.linearRampToValueAtTime(0, now + 4);
            setTimeout(() => { 
                if (audioCtx.state !== 'closed') {
                    audioCtx.close(); 
                }
                isPlaying = false;
            }, 4500);
            break;
    }
}

function runTimeline() {
    let currentScene = 0;
    
    function showScene(index) {
        document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
        
        if (index >= scenes.length) return;

        const sceneConfig = scenes[index];
        const el = document.getElementById(sceneConfig.id);
        if (el) el.classList.add('active');

        updateAudio(sceneConfig.type);

        setTimeout(() => {
            showScene(index + 1);
        }, sceneConfig.duration);
    }

    showScene(0);
}
