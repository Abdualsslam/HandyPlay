// =============================================
// AUDIO SYSTEM
// =============================================
var audioCtx = null;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playTone(freq, dur, type) {
    initAudio();
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
}
function sndSlice() { playTone(800, 0.1, 'sawtooth'); }
function sndBomb() { playTone(80, 0.4, 'square'); }
function sndSelect() { playTone(600, 0.12); setTimeout(function () { playTone(900, 0.12); }, 80); }
function sndPlace() { playTone(500, 0.15); }
function sndWin() { playTone(523, 0.15); setTimeout(function () { playTone(659, 0.15); }, 150); setTimeout(function () { playTone(784, 0.25); }, 300); }
function sndLose() { playTone(400, 0.2); setTimeout(function () { playTone(300, 0.3); }, 200); }

// =============================================
// UTILITY FUNCTIONS
// =============================================
function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function switchMode(newMode) {
    MODE = newMode;
    modeSwitchTime = Date.now();
    // Reset all button dwell states
    for (var k in buttons) {
        if (buttons[k]) { buttons[k].progress = 0; buttons[k].hoverStart = 0; buttons[k].activated = false; }
    }
}
