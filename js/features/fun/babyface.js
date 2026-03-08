// =============================================
// BABY FACE FILTER — Fun Section
// =============================================

function bfReset() {
    bfFaceLandmarks = null;
}

function bfInitFaceMesh() {
    if (bfInitialized || bfLoading) return;
    bfLoading = true;

    bfFaceMesh = new FaceMesh({
        locateFile: function (file) {
            return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/' + file;
        }
    });

    bfFaceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    bfFaceMesh.onResults(function (results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            bfFaceLandmarks = results.multiFaceLandmarks[0];
        } else {
            bfFaceLandmarks = null;
        }
    });

    // Start sending frames
    bfFaceMesh.initialize().then(function () {
        bfInitialized = true;
        bfLoading = false;
    });
}

// Send current video frame to FaceMesh (called from render loop)
function bfSendFrame() {
    if (bfInitialized && bfFaceMesh && vid.readyState >= 2) {
        bfFaceMesh.send({ image: vid });
    }
}

// =============================================
// RENDER BABY FACE FILTER
// =============================================
function renderBabyFace() {
    // Send frame to face mesh for detection
    bfSendFrame();

    // Show loading message
    if (bfLoading && !bfInitialized) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = getFont('600', 28);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t('bf_loading'), c.width / 2, c.height / 2);
        ctx.restore();
        return;
    }

    // No face detected message
    if (!bfFaceLandmarks) {
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = getFont('600', 24);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.6 + 0.3 * Math.sin(Date.now() / 500);
        ctx.fillText(t('bf_no_face'), c.width / 2, c.height - 80);
        ctx.globalAlpha = 1;
        ctx.restore();
        return;
    }

    var lm = bfFaceLandmarks;

    // Helper: get pixel coords from landmark (mirrored)
    function lp(idx) {
        return {
            x: (1 - lm[idx].x) * c.width,
            y: lm[idx].y * c.height
        };
    }

    // ---- BIG CUTE EYES ----
    // Left eye center (landmarks 159 top, 145 bottom, 33 inner, 133 outer)
    var leftEyeTop = lp(159);
    var leftEyeBot = lp(145);
    var leftEyeInner = lp(133);
    var leftEyeOuter = lp(33);

    // Right eye center (landmarks 386 top, 374 bottom, 362 inner, 263 outer)
    var rightEyeTop = lp(386);
    var rightEyeBot = lp(374);
    var rightEyeInner = lp(362);
    var rightEyeOuter = lp(263);

    var leftEyeCx = (leftEyeInner.x + leftEyeOuter.x) / 2;
    var leftEyeCy = (leftEyeTop.y + leftEyeBot.y) / 2;
    var rightEyeCx = (rightEyeInner.x + rightEyeOuter.x) / 2;
    var rightEyeCy = (rightEyeTop.y + rightEyeBot.y) / 2;

    // Eye size based on face width
    var faceWidth = dist(lp(234).x, lp(234).y, lp(454).x, lp(454).y);
    var eyeRadius = faceWidth * 0.14;
    var pupilRadius = eyeRadius * 0.5;
    var irisRadius = eyeRadius * 0.7;
    var shineRadius = eyeRadius * 0.18;

    // Draw big cartoon eye
    function drawBabyEye(cx, cy) {
        ctx.save();

        // White of eye (sclera) with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx, cy, eyeRadius, eyeRadius * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Iris (big, dark with gradient)
        var irisGrad = ctx.createRadialGradient(cx, cy, pupilRadius * 0.3, cx, cy, irisRadius);
        irisGrad.addColorStop(0, '#1a1a2e');
        irisGrad.addColorStop(0.5, '#3d2c5e');
        irisGrad.addColorStop(0.8, '#5c3d7a');
        irisGrad.addColorStop(1, '#2d1b4e');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, irisRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Shine/highlight (top-right)
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(cx + eyeRadius * 0.25, cy - eyeRadius * 0.3, shineRadius, 0, Math.PI * 2);
        ctx.fill();

        // Second smaller shine (bottom-left)
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(cx - eyeRadius * 0.15, cy + eyeRadius * 0.25, shineRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyelashes (cute curved lines on top)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = Math.max(2, eyeRadius * 0.08);
        ctx.lineCap = 'round';

        // Top eyelid line
        ctx.beginPath();
        ctx.arc(cx, cy, eyeRadius * 1.02, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Two small lashes
        for (var li = 0; li < 3; li++) {
            var angle = Math.PI * 1.25 + li * (Math.PI * 0.25);
            var lx = cx + Math.cos(angle) * eyeRadius * 1.05;
            var ly = cy + Math.sin(angle) * eyeRadius * 1.05;
            var llx = cx + Math.cos(angle - 0.15) * eyeRadius * 1.25;
            var lly = cy + Math.sin(angle - 0.15) * eyeRadius * 1.25;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(llx, lly);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawBabyEye(leftEyeCx, leftEyeCy);
    drawBabyEye(rightEyeCx, rightEyeCy);

    // ---- ROSY CHEEKS ----
    // Left cheek (landmark 50 area)
    var leftCheek = lp(50);
    var rightCheek = lp(280);
    var cheekRadius = faceWidth * 0.1;

    function drawCheek(cx, cy) {
        ctx.save();
        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cheekRadius);
        grad.addColorStop(0, 'rgba(255, 130, 150, 0.55)');
        grad.addColorStop(0.5, 'rgba(255, 150, 170, 0.35)');
        grad.addColorStop(1, 'rgba(255, 180, 190, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, cheekRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawCheek(leftCheek.x, leftCheek.y + cheekRadius * 0.3);
    drawCheek(rightCheek.x, rightCheek.y + cheekRadius * 0.3);

    // ---- SMALL CUTE NOSE ----
    var noseTip = lp(1);   // Nose tip
    var noseRadius = faceWidth * 0.03;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 170, 160, 0.7)';
    ctx.beginPath();
    ctx.arc(noseTip.x, noseTip.y, noseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Small nostrils
    ctx.fillStyle = 'rgba(200, 120, 120, 0.5)';
    ctx.beginPath();
    ctx.arc(noseTip.x - noseRadius * 1.2, noseTip.y + noseRadius * 0.5, noseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(noseTip.x + noseRadius * 1.2, noseTip.y + noseRadius * 0.5, noseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---- CUTE SPARKLES ----
    var sparkleTime = Date.now() / 800;
    function drawSparkle(cx, cy, size) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 220, ' + (0.5 + 0.5 * Math.sin(sparkleTime * 3 + cx)) + ')';
        ctx.translate(cx, cy);
        ctx.rotate(sparkleTime + cx);
        // 4-point star
        ctx.beginPath();
        for (var si = 0; si < 8; si++) {
            var r = si % 2 === 0 ? size : size * 0.3;
            ctx.lineTo(Math.cos(si * Math.PI / 4) * r, Math.sin(si * Math.PI / 4) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Sparkles near eyes
    var sparkSize = faceWidth * 0.025;
    drawSparkle(leftEyeCx - eyeRadius * 1.3, leftEyeCy - eyeRadius * 0.6, sparkSize);
    drawSparkle(rightEyeCx + eyeRadius * 1.3, rightEyeCy - eyeRadius * 0.6, sparkSize);
    drawSparkle(leftEyeCx + eyeRadius * 0.5, leftEyeCy - eyeRadius * 1.4, sparkSize * 0.7);
    drawSparkle(rightEyeCx - eyeRadius * 0.5, rightEyeCy - eyeRadius * 1.4, sparkSize * 0.7);

    // ---- FACE BORDER GLOW (subtle) ----
    // Forehead (landmark 10)
    var forehead = lp(10);
    var chin = lp(152);
    var faceCx = (forehead.x + chin.x) / 2;
    var faceCy = (forehead.y + chin.y) / 2;
    var faceH = dist(forehead.x, forehead.y, chin.x, chin.y);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 200, 230, ' + (0.15 + 0.1 * Math.sin(Date.now() / 1000)) + ')';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 150, 200, 0.3)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(faceCx, faceCy, faceWidth * 0.52, faceH * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
