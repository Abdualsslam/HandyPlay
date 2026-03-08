// =============================================
// AI DRAW & GUESS GAME — Custom Controls
// =============================================
var AI_SHAPES = [
    { name: 'Circle', icon: '⭕' },
    { name: 'Square', icon: '⬜' },
    { name: 'Triangle', icon: '🔺' },
    { name: 'Line', icon: '➖' },
    { name: 'Arrow', icon: '➡️' },
    { name: 'Heart', icon: '❤️' },
    { name: 'Star', icon: '⭐' },
    { name: 'Zigzag', icon: '⚡' },
    { name: 'Checkmark', icon: '✅' },
    { name: 'Spiral', icon: '🌀' }
];

var AI_ERASER_RADIUS = 18;

function aiReset() {
    aiStrokes = [];
    aiCurStroke = [];
    aiGuess = '';
    aiGuessIcon = '';
    aiConfidence = 0;
    aiGuesses = [];
    aiScore = 0;
    aiRound = 0;
    aiMaxRounds = 10;
    aiPhase = 'READY';
    aiTarget = '';
    aiTargetIcon = '';
    aiRoundStart = 0;
    aiDrawTime = 15;
    aiCorrectCount = 0;
    aiUsedTargets = [];
}

function aiNextRound() {
    aiStrokes = [];
    aiCurStroke = [];
    aiGuess = '';
    aiGuessIcon = '';
    aiConfidence = 0;
    aiGuesses = [];
    aiRound++;
    aiPhase = 'DRAWING';
    aiRoundStart = Date.now();

    var available = AI_SHAPES.filter(function (s) { return aiUsedTargets.indexOf(s.name) === -1; });
    if (available.length === 0) { aiUsedTargets = []; available = AI_SHAPES; }
    var pick = available[Math.floor(Math.random() * available.length)];
    aiTarget = pick.name;
    aiTargetIcon = pick.icon;
    aiUsedTargets.push(aiTarget);
}

// Eraser: splits strokes properly (same logic as drawing mode)
function aiEraseNearby(x, y) {
    var newArr = [];
    for (var i = 0; i < aiStrokes.length; i++) {
        var segment = [];
        for (var j = 0; j < aiStrokes[i].length; j++) {
            if (dist(aiStrokes[i][j].x, aiStrokes[i][j].y, x, y) <= AI_ERASER_RADIUS) {
                if (segment.length >= 2) newArr.push(segment);
                segment = [];
            } else {
                segment.push(aiStrokes[i][j]);
            }
        }
        if (segment.length >= 2) newArr.push(segment);
    }
    aiStrokes = newArr;
    // Reset per-hand drawCur if its stroke was erased
    for (var h = 0; h < 2; h++) {
        if (P[h] && P[h].isDraw && aiStrokes.indexOf(P[h].drawCur) === -1) {
            P[h].isDraw = false;
        }
    }
}

// Get canvas zone dimensions
function aiGetCanvas() {
    var topOffset = 145;
    var bottomOffset = 80;
    var sidePanel = 180;
    var maxSize = Math.min(c.width - 60 - sidePanel, c.height - topOffset - bottomOffset - 30);
    var size = Math.max(300, maxSize);
    var cx = (c.width - sidePanel) / 2;
    var cy = topOffset + (c.height - topOffset - bottomOffset) / 2;
    return { x: cx - size / 2, y: cy - size / 2, w: size, h: size, cx: cx, cy: cy };
}

// ---- Shape Analysis ----
function aiAnalyzeStrokes() {
    if (aiStrokes.length === 0) return;
    var pts = [];
    for (var i = 0; i < aiStrokes.length; i++)
        for (var j = 0; j < aiStrokes[i].length; j++) pts.push(aiStrokes[i][j]);
    if (pts.length < 5) return;

    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
        if (pts[i].x < minX) minX = pts[i].x;
        if (pts[i].x > maxX) maxX = pts[i].x;
        if (pts[i].y < minY) minY = pts[i].y;
        if (pts[i].y > maxY) maxY = pts[i].y;
    }
    var w = maxX - minX || 1, h = maxY - minY || 1, aspect = w / h;
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    var first = pts[0], last = pts[pts.length - 1];
    var closeDist = dist(first.x, first.y, last.x, last.y);
    var closeness = 1 - Math.min(1, closeDist / Math.max(w, h));

    var angles = [];
    for (var i = 2; i < pts.length; i++) {
        var dx1 = pts[i - 1].x - pts[i - 2].x, dy1 = pts[i - 1].y - pts[i - 2].y;
        var dx2 = pts[i].x - pts[i - 1].x, dy2 = pts[i].y - pts[i - 1].y;
        var angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        angles.push(angle);
    }
    var corners = 0;
    for (var i = 0; i < angles.length; i++) { if (Math.abs(angles[i]) > 0.6) corners++; }
    var dirChanges = 0;
    for (var i = 1; i < angles.length; i++) { if (angles[i] * angles[i - 1] < 0) dirChanges++; }

    var avgDist = 0;
    for (var i = 0; i < pts.length; i++) avgDist += dist(pts[i].x, pts[i].y, cx, cy);
    avgDist /= pts.length;
    var distVariance = 0;
    for (var i = 0; i < pts.length; i++) { var d = dist(pts[i].x, pts[i].y, cx, cy) - avgDist; distVariance += d * d; }
    distVariance /= pts.length;
    var circularity = 1 - Math.min(1, Math.sqrt(distVariance) / (avgDist || 1));

    var totalCurve = 0;
    for (var i = 0; i < angles.length; i++) totalCurve += angles[i];
    var numStrokes = aiStrokes.length;
    var endDy = last.y - pts[Math.max(0, pts.length - 10)].y;

    var scores = {};
    scores['Circle'] = circularity * 0.4 + closeness * 0.35 + (1 - Math.abs(aspect - 1) / 2) * 0.25;
    var sqC = 1 - Math.abs(corners / pts.length * 10 - 0.3);
    scores['Square'] = closeness * 0.3 + (1 - Math.abs(aspect - 1) / 2) * 0.25 + Math.min(1, sqC) * 0.25 + (1 - circularity) * 0.2;
    scores['Triangle'] = closeness * 0.35 + (corners > 2 && corners < 20 ? 0.4 : 0.1) + (1 - circularity) * 0.25;
    var la = Math.max(aspect, 1 / aspect);
    scores['Line'] = (1 - closeness) * 0.3 + (la > 2 ? 0.4 : la * 0.15) + (corners < 5 ? 0.3 : 0.05);
    scores['Arrow'] = (1 - closeness) * 0.2 + (la > 1.5 ? 0.3 : 0.1) + (numStrokes <= 3 ? 0.25 : 0.05) + (corners > 2 && corners < 15 ? 0.25 : 0.05);
    var topH = pts.filter(function (p) { return p.y < cy; });
    scores['Heart'] = closeness * 0.35 + (topH.length > pts.length * 0.3 ? 0.3 : 0.1) + (1 - Math.abs(aspect - 0.9)) * 0.2 + (1 - circularity) * 0.15;
    scores['Star'] = closeness * 0.2 + (corners > 8 ? 0.5 : corners * 0.04) + (1 - circularity) * 0.2 + (Math.abs(aspect - 1) < 0.5 ? 0.1 : 0);
    scores['Zigzag'] = (1 - closeness) * 0.2 + (dirChanges > 4 ? 0.5 : dirChanges * 0.08) + (la > 1.3 ? 0.2 : 0.05) + (1 - circularity) * 0.1;
    scores['Checkmark'] = (numStrokes <= 2 ? 0.2 : 0.05) + (corners > 0 && corners < 8 ? 0.35 : 0.05) + (endDy < 0 ? 0.25 : 0.05) + (1 - closeness) * 0.15;
    scores['Spiral'] = circularity * 0.2 + (1 - closeness) * 0.2 + (Math.abs(totalCurve) > Math.PI * 2 ? 0.4 : Math.abs(totalCurve) / (Math.PI * 2) * 0.3) + (numStrokes === 1 ? 0.2 : 0.05);

    var sorted = [];
    for (var name in scores) sorted.push({ name: name, score: Math.min(1, Math.max(0, scores[name])) });
    sorted.sort(function (a, b) { return b.score - a.score; });
    aiGuesses = sorted.slice(0, 4);
    aiGuess = sorted[0].name;
    aiConfidence = Math.round(sorted[0].score * 100);
    for (var i = 0; i < AI_SHAPES.length; i++) {
        if (AI_SHAPES[i].name === aiGuess) { aiGuessIcon = AI_SHAPES[i].icon; break; }
    }
}

// Draw smooth Bézier stroke
function aiDrawSmoothStroke(stroke) {
    if (stroke.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    if (stroke.length === 2) {
        ctx.lineTo(stroke[1].x, stroke[1].y);
    } else {
        for (var i = 1; i < stroke.length - 1; i++) {
            var mx = (stroke[i].x + stroke[i + 1].x) / 2;
            var my = (stroke[i].y + stroke[i + 1].y) / 2;
            ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, mx, my);
        }
        ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
    }
    ctx.stroke();
}

// Draw the canvas zone
function aiDrawCanvasZone(zone, isActive) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    roundRect(zone.x, zone.y, zone.w, zone.h, 20);
    ctx.fill();
    ctx.strokeStyle = isActive ? 'rgba(245,208,97,0.4)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.setLineDash(isActive ? [] : [8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (aiStrokes.length === 0 && isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '400 22px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(t('point_to_draw'), zone.cx, zone.cy);
    }
    ctx.restore();
}

// ============ MAIN RENDER ============
function renderAIDraw(lmArr) {
    var now = Date.now();
    var zone = aiGetCanvas();

    // Per-hand tracking for AI draw
    var aiIsDrawing = [false, false];

    // ---- PHASE: READY ----
    if (aiPhase === 'READY') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = GOLD;
        ctx.font = '700 48px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 15;
        ctx.fillText(t('ai_title'), c.width / 2, c.height * 0.22);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '400 22px Outfit';
        ctx.shadowBlur = 0;
        ctx.fillText(t('ai_subtitle'), c.width / 2, c.height * 0.35);

        ctx.font = '400 18px Outfit';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        var iy = c.height * 0.44;
        ctx.fillText(t('ai_instr_draw'), c.width / 2, iy);
        ctx.fillText(t('ai_instr_erase'), c.width / 2, iy + 30);
        ctx.fillText(t('ai_instr_clear'), c.width / 2, iy + 60);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '400 16px Outfit';
        ctx.fillText(aiMaxRounds + t('ai_rounds_info') + aiDrawTime + t('ai_seconds_each'), c.width / 2, iy + 100);
        ctx.restore();

        createBtn('ai_start', c.width / 2 - 120, c.height * 0.72, 240, 60, t('start_game'), '🎬');
        if (updateBtn('ai_start')) { sndSelect(); aiNextRound(); }
        drawBtn('ai_start', { fontSize: 22 });
        return;
    }

    // ---- PHASE: DRAWING ----
    if (aiPhase === 'DRAWING') {
        var elapsed = (now - aiRoundStart) / 1000;
        var timeLeft = Math.max(0, aiDrawTime - elapsed);

        // Auto-analyze
        if (aiStrokes.length > 0 && pts_count(aiStrokes) > 8) aiAnalyzeStrokes();

        // Time's up
        if (timeLeft <= 0) {
            aiAnalyzeStrokes();
            aiPhase = 'GUESSED';
            if (aiGuess === aiTarget) { aiCorrectCount++; aiScore += aiConfidence; sndWin(); }
            else { sndLose(); }
        }

        // Draw canvas zone
        aiDrawCanvasZone(zone, true);

        // Clip strokes to canvas
        ctx.save();
        ctx.beginPath();
        roundRect(zone.x, zone.y, zone.w, zone.h, 20);
        ctx.clip();

        // Draw strokes with smooth curves
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (var i = 0; i < aiStrokes.length; i++) aiDrawSmoothStroke(aiStrokes[i]);
        ctx.restore();

        // ---- INPUT: Exact same logic as Drawing mode ----
        for (var h = 0; h < numHands; h++) {
            var lm = lmArr[h];
            var cur = P[h];
            if (!lm) continue;

            var pointing = isPointing(lm);
            var openHand = isOpenHand(lm);

            if (openHand && !pointing) {
                cur.isDraw = false;
                aiEraseNearby(cur.sx, cur.sy);
                // Eraser circle
                ctx.save();
                ctx.beginPath();
                ctx.arc(cur.sx, cur.sy, AI_ERASER_RADIUS, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(255,100,100,0.8)';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#FF5050';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cur.sx, cur.sy, 4, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255,100,100,0.6)';
                ctx.fill();
                ctx.restore();
            } else {
                // Cursor dot
                ctx.beginPath();
                ctx.arc(cur.sx, cur.sy, 6, 0, 2 * Math.PI);
                ctx.fillStyle = pointing ? '#FFFFFF' : 'rgba(245,208,97,0.4)';
                ctx.fill();

                if (pointing) {
                    if (!cur.isDraw) { cur.isDraw = true; cur.drawCur = []; aiStrokes.push(cur.drawCur); }
                    cur.drawCur.push({ x: cur.sx, y: cur.sy });
                } else {
                    cur.isDraw = false;
                }
            }
        }

        // ============ HUD ============
        ctx.save();
        ctx.fillStyle = GOLD;
        ctx.font = '700 28px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 10;
        ctx.fillText(t('draw_prompt') + aiTargetIcon + ' ' + t(aiTarget), c.width / 2, 80);

        // Timer bar
        var barW = c.width * 0.25;
        var barH = 6;
        var barX = (c.width - barW) / 2;
        var barY = 95;
        var prog = timeLeft / aiDrawTime;
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        roundRect(barX, barY, barW, barH, 3); ctx.fill();
        ctx.fillStyle = prog > 0.3 ? GOLD : RED_ACCENT;
        roundRect(barX, barY, barW * prog, barH, 3); ctx.fill();

        ctx.fillStyle = prog > 0.3 ? 'rgba(255,255,255,0.5)' : RED_ACCENT;
        ctx.font = '600 16px Outfit';
        ctx.fillText(Math.ceil(timeLeft) + 's  ·  ' + t('round') + aiRound + '/' + aiMaxRounds, c.width / 2, 120);

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '400 15px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText('🏆 ' + aiScore + t('pts') + '  (' + aiCorrectCount + t('correct_mark') + ')', 25, 80);
        ctx.restore();

        // AI guesses panel (right side)
        var panelX = zone.x + zone.w + 20;
        var panelY = zone.y;
        var panelW = c.width - panelX - 15;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        roundRect(panelX, panelY, panelW, 200, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '600 14px Outfit';
        ctx.fillText(t('ai_thinking'), panelX + panelW / 2, panelY + 25);

        if (aiGuesses.length > 0) {
            for (var i = 0; i < Math.min(4, aiGuesses.length); i++) {
                var g = aiGuesses[i];
                var gIcon = '';
                for (var k = 0; k < AI_SHAPES.length; k++) {
                    if (AI_SHAPES[k].name === g.name) gIcon = AI_SHAPES[k].icon;
                }
                var gy = panelY + 52 + i * 36;
                var pct = Math.round(g.score * 100);

                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                roundRect(panelX + 10, gy - 4, panelW - 20, 28, 6);
                ctx.fill();

                var barColor = i === 0 ? (g.name === aiTarget ? GREEN_ACCENT : CYAN) : 'rgba(255,255,255,0.15)';
                ctx.fillStyle = barColor;
                ctx.globalAlpha = i === 0 ? 0.3 : 0.2;
                roundRect(panelX + 10, gy - 4, (panelW - 20) * g.score, 28, 6);
                ctx.fill();
                ctx.globalAlpha = 1;

                ctx.fillStyle = i === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
                ctx.font = i === 0 ? '600 15px Outfit' : '400 13px Outfit';
                ctx.textAlign = 'left';
                ctx.fillText(gIcon + ' ' + t(g.name), panelX + 18, gy + 14);
                ctx.textAlign = 'right';
                ctx.fillText(pct + '%', panelX + panelW - 18, gy + 14);
            }
        }
        ctx.restore();

        // Control hint
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '400 13px Outfit';
        ctx.fillText(t('ai_draw_hint'), zone.cx, zone.y + zone.h + 20);
        ctx.restore();

        // Buttons at bottom
        var btnY = c.height - 65;
        createBtn('ai_clear', zone.x, btnY, 110, 45, t('clear'), '🗑');
        if (updateBtn('ai_clear')) { aiStrokes = []; sndSelect(); }
        drawBtn('ai_clear', { fontSize: 14 });

        createBtn('ai_submit', zone.x + zone.w - 130, btnY, 130, 45, t('submit'), '✅');
        if (updateBtn('ai_submit')) {
            aiAnalyzeStrokes();
            aiPhase = 'GUESSED';
            if (aiGuess === aiTarget) { aiCorrectCount++; aiScore += aiConfidence; sndWin(); }
            else { sndLose(); }
        }
        drawBtn('ai_submit', { fontSize: 15 });
    }

    // ---- PHASE: GUESSED ----
    if (aiPhase === 'GUESSED') {
        aiDrawCanvasZone(zone, false);
        ctx.save();
        ctx.beginPath();
        roundRect(zone.x, zone.y, zone.w, zone.h, 20);
        ctx.clip();
        ctx.shadowColor = GOLD; ctx.shadowBlur = 8;
        ctx.strokeStyle = GOLD; ctx.lineWidth = 6;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (var i = 0; i < aiStrokes.length; i++) aiDrawSmoothStroke(aiStrokes[i]);
        ctx.restore();

        var correct = aiGuess === aiTarget;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.textAlign = 'center';
        if (correct) {
            ctx.fillStyle = GREEN_ACCENT;
            ctx.font = '700 52px Outfit';
            ctx.shadowColor = GREEN_ACCENT; ctx.shadowBlur = 20;
            ctx.fillText(t('ai_got_it'), c.width / 2, c.height / 2 - 50);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '600 24px Outfit'; ctx.shadowBlur = 0;
            ctx.fillText(aiTargetIcon + ' ' + t(aiTarget) + '  —  +' + aiConfidence + t('pts'), c.width / 2, c.height / 2 - 5);
        } else {
            ctx.fillStyle = RED_ACCENT;
            ctx.font = '700 44px Outfit';
            ctx.shadowColor = RED_ACCENT; ctx.shadowBlur = 15;
            ctx.fillText(t('ai_guessed') + aiGuessIcon + ' ' + t(aiGuess), c.width / 2, c.height / 2 - 60);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '400 22px Outfit'; ctx.shadowBlur = 0;
            ctx.fillText(t('you_drew') + aiTargetIcon + ' ' + t(aiTarget), c.width / 2, c.height / 2 - 15);
        }

        ctx.fillStyle = GOLD; ctx.font = '600 22px Outfit';
        ctx.shadowColor = GOLD; ctx.shadowBlur = 6;
        ctx.fillText(t('score') + aiScore + '  |  ' + aiCorrectCount + '/' + aiRound + ' ' + t('correct_mark'), c.width / 2, c.height / 2 + 30);
        ctx.restore();

        if (aiRound < aiMaxRounds) {
            createBtn('ai_next', c.width / 2 - 100, c.height / 2 + 60, 200, 50, t('next_round'), '➡️');
            if (updateBtn('ai_next')) { sndSelect(); aiNextRound(); }
            drawBtn('ai_next', { fontSize: 18 });
        } else {
            aiPhase = 'RESULTS';
        }
    }

    // ---- PHASE: RESULTS ----
    if (aiPhase === 'RESULTS') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = GOLD; ctx.font = '700 52px Outfit';
        ctx.textAlign = 'center'; ctx.shadowColor = GOLD; ctx.shadowBlur = 20;
        ctx.fillText('🏆 ' + t('game_over'), c.width / 2, c.height / 2 - 80);

        ctx.fillStyle = '#FFFFFF'; ctx.font = '600 32px Outfit';
        ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 10;
        ctx.fillText(t('final_score') + aiScore, c.width / 2, c.height / 2 - 20);

        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '400 22px Outfit';
        ctx.shadowBlur = 0;
        ctx.fillText(t('ai_correct_count') + aiCorrectCount + t('ai_out_of') + aiMaxRounds + t('ai_rounds_word'), c.width / 2, c.height / 2 + 20);
        ctx.restore();

        createBtn('ai_replay', c.width / 2 - 100, c.height / 2 + 55, 200, 50, t('play_again'), '🔄');
        if (updateBtn('ai_replay')) { sndSelect(); aiReset(); }
        drawBtn('ai_replay', { fontSize: 18 });
    }
}

function pts_count(strokes) {
    var n = 0;
    for (var i = 0; i < strokes.length; i++) n += strokes[i].length;
    return n;
}
