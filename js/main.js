// =============================================
// MAIN RENDER LOOP
// =============================================
window.onkeydown = function (e) {
    if (e.code === 'Space' && MODE === 'DRAWING') drawStrokes = [];
};

function run(res) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    // Draw mirrored camera feed
    ctx.save();
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(res.image, 0, 0, c.width, c.height);
    ctx.restore();

    // Dark overlay (except in Baby Face mode where we want a clear view)
    if (MODE !== 'BABY_FACE') {
        ctx.fillStyle = 'rgba(10, 6, 2, 0.85)';
        ctx.fillRect(0, 0, c.width, c.height);
    }

    var lmArr = res.multiHandLandmarks || [];
    numHands = Math.min(2, lmArr.length);
    handDetected = numHands > 0;

    if (numHands === 0) {
        for (var i = 0; i < 2; i++) { P[i].sx = null; P[i].sy = null; P[i].isDraw = false; }
    }

    for (var h = 0; h < numHands; h++) {
        var lm = lmArr[h];
        var cur = P[h];

        // Mirror landmarks for drawing
        var mirroredLm = lm.map(function (p) { return { x: 1 - p.x, y: p.y, z: p.z }; });

        // Draw hand skeleton (subtle in games)
        var handAlpha = (MODE === 'DRAWING' || MODE === 'MENU') ? 0.4 : 0.2;
        ctx.globalAlpha = handAlpha;
        drawConnectors(ctx, mirroredLm, HAND_CONNECTIONS, { color: 'rgba(245,208,97,0.3)', lineWidth: 2 });
        drawLandmarks(ctx, mirroredLm, { color: '#FFFFFF', lineWidth: 1, radius: 2 });
        ctx.globalAlpha = 1;

        // Smooth cursor (mirrored coordinates) - track index finger
        var ind = lm[8]; // Index tip
        var thumb = lm[4]; // Thumb tip

        // Mirrored X for drawing/UI
        var rx = (1 - ind.x) * c.width;
        var ry = ind.y * c.height;

        var tx = (1 - thumb.x) * c.width;
        var ty = thumb.y * c.height;

        if (cur.sx === null) { cur.sx = rx; cur.sy = ry; }
        else { cur.sx += (rx - cur.sx) * SMOOTHING; cur.sy += (ry - cur.sy) * SMOOTHING; }

        // Pinch detection (thumb + index tips touch)
        cur.wasPinching = cur.isPinching;
        cur.isPinching = isPinchGesture(lm);
        cur.pinchJustPressed = cur.isPinching && !cur.wasPinching;

        // Visual Pinch Indicators (in Menu or Tic-Tac-Toe, or Baby Face for going back)
        if (MODE === 'MENU' || MODE === 'TIC_TAC_TOE' || MODE === 'TARGET_SHOOTER' || MODE === 'PICTIONARY' || MODE === 'AIR_BAND' || MODE === 'PONG' || MODE === 'BABY_FACE') {
            ctx.save();

            // Connecting line
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = cur.isPinching ? GREEN_ACCENT : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = cur.isPinching ? 4 : 2;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Thumb and Index circles
            var circleSize = cur.isPinching ? 12 : 8;
            ctx.fillStyle = cur.isPinching ? GREEN_ACCENT : GOLD;

            ctx.beginPath(); ctx.arc(rx, ry, circleSize, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(tx, ty, circleSize, 0, 2 * Math.PI); ctx.fill();

            if (cur.isPinching) {
                ctx.shadowColor = GREEN_ACCENT;
                ctx.shadowBlur = 15;
                ctx.beginPath(); ctx.arc((rx + tx) / 2, (ry + ty) / 2, 8, 0, 2 * Math.PI); ctx.fill();
            }
            ctx.restore();
        }

        // Fruit Ninja slash trail
        if (MODE === 'FRUIT_NINJA' && !fnGameOver && h === 0 && isPointing(lm)) {
            fnSlashTrail.push({ x: cur.sx, y: cur.sy, t: Date.now() });
        }
    }

    // Mode-specific rendering
    switch (MODE) {
        case 'DRAWING':
            renderDrawing(lmArr);
            break;
        case 'MENU':
            // Keep drawing strokes visible behind menu
            ctx.save();
            ctx.shadowColor = GOLD;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = GOLD;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.3;
            for (var i = 0; i < drawStrokes.length; i++) {
                if (drawStrokes[i].isEraser) continue;
                var pts = drawStrokes[i].points || drawStrokes[i];
                if (!pts || pts.length < 2) continue;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            renderMenu();
            break;
        case 'FRUIT_NINJA':
            renderFruitNinja(lmArr);
            break;
        case 'TIC_TAC_TOE':
            renderTicTacToe();
            break;
        case 'TARGET_SHOOTER':
            renderTargetShooter();
            break;
        case 'PICTIONARY':
            renderPictionary(lmArr);
            break;
        case 'AI_DRAW':
            renderAIDraw(lmArr);
            break;
        case 'AIR_BAND':
            renderAirBand();
            break;
        case 'PONG':
            renderPong();
            break;
        case 'BABY_FACE':
            renderBabyFace();
            break;
    }

    // Always render top bar on top
    renderTopBar();
}

// =============================================
// MEDIAPIPE SETUP
// =============================================
var h = new Hands({
    locateFile: function (file) {
        return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + file;
    }
});

h.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

h.onResults(run);

var cam = new Camera(vid, {
    onFrame: async function () { await h.send({ image: vid }); },
    width: 1280,
    height: 720
});

cam.start();
