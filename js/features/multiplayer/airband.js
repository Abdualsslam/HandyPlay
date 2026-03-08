// =============================================
// AIR BAND — Virtual instruments with hand gestures
// =============================================

// Instrument pad definitions
var AB_INSTRUMENTS = {
    drums: {
        name: 'Drums',
        icon: '🥁',
        pads: [
            { label: 'Kick', freq: 60, dur: 0.3, type: 'sine', color: '#FF4444', lightColor: '#FF8888' },
            { label: 'Snare', freq: 200, dur: 0.15, type: 'triangle', color: '#44AAFF', lightColor: '#88CCFF' },
            { label: 'Hi-Hat', freq: 800, dur: 0.05, type: 'square', color: '#FFDD00', lightColor: '#FFEE66' },
            { label: 'Tom 1', freq: 120, dur: 0.2, type: 'sine', color: '#FF8800', lightColor: '#FFBB44' },
            { label: 'Tom 2', freq: 90, dur: 0.25, type: 'sine', color: '#CC44FF', lightColor: '#DD88FF' },
            { label: 'Crash', freq: 600, dur: 0.3, type: 'sawtooth', color: '#44FF88', lightColor: '#88FFAA' }
        ]
    },
    piano: {
        name: 'Piano',
        icon: '🎹',
        pads: [
            { label: 'C', freq: 261.63, dur: 0.5, type: 'sine', color: '#FF4444', lightColor: '#FF8888' },
            { label: 'D', freq: 293.66, dur: 0.5, type: 'sine', color: '#FF8800', lightColor: '#FFBB44' },
            { label: 'E', freq: 329.63, dur: 0.5, type: 'sine', color: '#FFDD00', lightColor: '#FFEE66' },
            { label: 'F', freq: 349.23, dur: 0.5, type: 'sine', color: '#44BB44', lightColor: '#77DD77' },
            { label: 'G', freq: 392.00, dur: 0.5, type: 'sine', color: '#44AAFF', lightColor: '#88CCFF' },
            { label: 'A', freq: 440.00, dur: 0.5, type: 'sine', color: '#9944CC', lightColor: '#CC77FF' },
            { label: 'B', freq: 493.88, dur: 0.5, type: 'sine', color: '#FF6688', lightColor: '#FF99AA' },
            { label: 'C+', freq: 523.25, dur: 0.5, type: 'sine', color: '#FF4444', lightColor: '#FF8888' }
        ]
    },
    synth: {
        name: 'Synth',
        icon: '🎛️',
        pads: [
            { label: 'Bass', freq: 80, dur: 0.4, type: 'sawtooth', color: '#FF4444', lightColor: '#FF8888' },
            { label: 'Lead', freq: 440, dur: 0.3, type: 'square', color: '#44AAFF', lightColor: '#88CCFF' },
            { label: 'Pad', freq: 330, dur: 0.6, type: 'sine', color: '#44FF88', lightColor: '#88FFAA' },
            { label: 'FX 1', freq: 150, dur: 0.2, type: 'sawtooth', color: '#FFDD00', lightColor: '#FFEE66' },
            { label: 'FX 2', freq: 550, dur: 0.15, type: 'triangle', color: '#CC44FF', lightColor: '#DD88FF' },
            { label: 'Blip', freq: 900, dur: 0.08, type: 'square', color: '#FF8800', lightColor: '#FFBB44' }
        ]
    }
};

function abReset() {
    abInstrument = 'drums';
    abPadHits = []; // {padIndex, time, handIndex}
    abRipples = []; // visual ripple effects
    abPhase = 'PLAYING'; // PLAYING, SELECT
}

function abPlayNote(padIndex) {
    var inst = AB_INSTRUMENTS[abInstrument];
    if (!inst || !inst.pads[padIndex]) return;
    var pad = inst.pads[padIndex];
    playTone(pad.freq, pad.dur, pad.type);

    // Visual ripple
    abRipples.push({
        padIndex: padIndex,
        time: Date.now(),
        color: pad.lightColor
    });
}

function renderAirBand() {
    var now = Date.now();
    var inst = AB_INSTRUMENTS[abInstrument];
    var pads = inst.pads;
    var numPads = pads.length;

    // Layout: pads in a grid
    var padSize, cols, rows, padGap, gridW, gridH, gridX, gridY;

    if (numPads <= 6) {
        cols = 3; rows = 2;
    } else {
        cols = 4; rows = 2;
    }

    padGap = 20;
    padSize = Math.min(
        (c.width - 100) / cols - padGap,
        (c.height - 200) / rows - padGap,
        160
    );
    gridW = cols * (padSize + padGap) - padGap;
    gridH = rows * (padSize + padGap) - padGap;
    gridX = (c.width - gridW) / 2;
    gridY = (c.height - gridH) / 2 + 20;

    // Draw pads
    for (var i = 0; i < numPads; i++) {
        var pad = pads[i];
        var col = i % cols;
        var row = Math.floor(i / cols);
        var px = gridX + col * (padSize + padGap);
        var py = gridY + row * (padSize + padGap);

        // Check if any hand is hovering
        var isHovered = false;
        var justHit = false;
        for (var h = 0; h < numHands; h++) {
            var cur = P[h];
            if (cur.sx >= px && cur.sx <= px + padSize && cur.sy >= py && cur.sy <= py + padSize) {
                isHovered = true;
                if (cur.pinchJustPressed) {
                    justHit = true;
                    abPadHits.push({ padIndex: i, time: now, handIndex: h });
                    abPlayNote(i);
                }
            }
        }

        // Check recent hit for glow
        var recentHit = false;
        var hitAge = 1;
        for (var j = abPadHits.length - 1; j >= 0; j--) {
            if (abPadHits[j].padIndex === i) {
                hitAge = (now - abPadHits[j].time) / 400;
                if (hitAge < 1) { recentHit = true; break; }
            }
        }

        ctx.save();

        // Pad background
        if (recentHit) {
            ctx.shadowColor = pad.color;
            ctx.shadowBlur = 25 * (1 - hitAge);
            ctx.fillStyle = pad.color + (Math.round((1 - hitAge) * 80).toString(16).padStart(2, '0'));
        } else if (isHovered) {
            ctx.shadowColor = pad.color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
        }

        roundRect(px, py, padSize, padSize, 16);
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered || recentHit ? pad.color : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = isHovered || recentHit ? 3 : 1;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = isHovered || recentHit ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
        ctx.font = '600 ' + Math.round(padSize * 0.18) + 'px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pad.label, px + padSize / 2, py + padSize / 2);

        // Color indicator dot
        ctx.beginPath();
        ctx.arc(px + padSize / 2, py + padSize * 0.78, 5, 0, 2 * Math.PI);
        ctx.fillStyle = pad.color;
        ctx.fill();

        ctx.restore();
    }

    // Draw ripples
    for (var i = abRipples.length - 1; i >= 0; i--) {
        var r = abRipples[i];
        var age = (now - r.time) / 500;
        if (age > 1) { abRipples.splice(i, 1); continue; }
        var pi = r.padIndex;
        var col = pi % cols;
        var row = Math.floor(pi / cols);
        var rpx = gridX + col * (padSize + padGap) + padSize / 2;
        var rpy = gridY + row * (padSize + padGap) + padSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(rpx, rpy, padSize * 0.4 + age * padSize * 0.5, 0, 2 * Math.PI);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = 1 - age;
        ctx.lineWidth = 3 * (1 - age);
        ctx.stroke();
        ctx.restore();
    }

    // Clean old hits (keep last 50)
    if (abPadHits.length > 50) abPadHits = abPadHits.slice(-50);

    // HUD: instrument name
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.font = '700 28px Outfit';
    ctx.textAlign = 'center';
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 10;
    ctx.fillText(inst.icon + '  ' + inst.name, c.width / 2, 95);
    ctx.restore();

    // Instrument switcher buttons
    var switchY = c.height - 65;
    var instKeys = Object.keys(AB_INSTRUMENTS);
    var switchW = 130;
    var switchGap = 15;
    var switchTotalW = instKeys.length * switchW + (instKeys.length - 1) * switchGap;
    var switchStartX = (c.width - switchTotalW) / 2;

    for (var i = 0; i < instKeys.length; i++) {
        var key = instKeys[i];
        var iInst = AB_INSTRUMENTS[key];
        var sx = switchStartX + i * (switchW + switchGap);
        var btnId = 'ab_inst_' + key;
        createBtn(btnId, sx, switchY, switchW, 45, iInst.name, iInst.icon);
        if (updateBtn(btnId)) {
            sndSelect();
            abInstrument = key;
            abRipples = [];
        }
        var isActive = abInstrument === key;
        drawBtn(btnId, {
            fontSize: 14,
            bg: isActive ? 'rgba(245,208,97,0.15)' : 'rgba(255,255,255,0.05)',
            bgHover: 'rgba(245,208,97,0.25)'
        });
    }

    // Cursors
    for (var h = 0; h < numHands; h++) {
        var cur = P[h];
        if (cur.sx === null) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cur.sx, cur.sy, cur.isPinching ? 10 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = cur.isPinching ? GREEN_ACCENT : GOLD;
        ctx.shadowColor = cur.isPinching ? GREEN_ACCENT : GOLD;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }
}
