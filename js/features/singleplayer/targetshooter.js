// =============================================
// TARGET SHOOTER GAME
// =============================================
function tsReset() {
    tsTargets = [];
    tsParticles = [];
    tsScore = 0;
    tsLives = 5;
    tsGameOver = false;
    tsStarted = false;
    tsCountdownStart = Date.now();
    tsLastSpawn = 0;
    tsCombo = 0;
    tsBestCombo = 0;
    tsLevel = 1;
    tsTargetsHit = 0;
}

function tsSpawnTarget() {
    var margin = 120;
    var minR = 25, maxR = 50;
    // Smaller targets in higher levels
    var radiusRange = maxR - (tsLevel - 1) * 4;
    if (radiusRange < minR) radiusRange = minR;
    var radius = minR + Math.random() * (radiusRange - minR);

    // Avoid spawning in top bar area
    var x = margin + Math.random() * (c.width - margin * 2);
    var y = margin + 60 + Math.random() * (c.height - margin * 2 - 60);

    // Duration decreases with level
    var duration = 2500 - (tsLevel - 1) * 150;
    if (duration < 800) duration = 800;

    // Points inversely proportional to radius
    var points = Math.round(50 / radius * 10);

    // Determine type: normal, bonus, penalty
    var rng = Math.random();
    var type = 'normal';
    if (rng < 0.08) type = 'penalty'; // red skull — lose a life if shot
    else if (rng < 0.2) type = 'bonus'; // golden star — extra points

    tsTargets.push({
        x: x,
        y: y,
        radius: radius,
        spawnTime: Date.now(),
        duration: duration,
        points: points,
        type: type,
        hit: false,
        missed: false,
        hitTime: 0,
        // Animation
        scale: 0,
        opacity: 1
    });
}

function tsAddParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
        tsParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            r: Math.random() * 4 + 2,
            color: color,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03
        });
    }
}

function tsUpdate() {
    var now = Date.now();
    var elapsed = (now - tsStartTime) / 1000;

    // Level up every 15 seconds
    tsLevel = Math.floor(elapsed / 15) + 1;

    // Spawn targets
    var spawnInterval = 1200 - (tsLevel - 1) * 80;
    if (spawnInterval < 400) spawnInterval = 400;
    if (now - tsLastSpawn > spawnInterval) {
        tsSpawnTarget();
        if (tsLevel >= 3 && Math.random() < 0.3) tsSpawnTarget(); // Double spawn
        tsLastSpawn = now;
    }

    // Update targets
    for (var i = tsTargets.length - 1; i >= 0; i--) {
        var t = tsTargets[i];
        var age = (now - t.spawnTime) / t.duration;

        // Grow in
        if (age < 0.1) {
            t.scale = age / 0.1;
        } else if (age > 0.8) {
            // Shrink out
            t.scale = 1 - (age - 0.8) / 0.2;
            t.opacity = t.scale;
        } else {
            t.scale = 1;
        }

        // Missed targets
        if (age >= 1 && !t.hit) {
            t.missed = true;
            if (t.type !== 'penalty') {
                tsCombo = 0; // Reset combo on miss
            }
            tsTargets.splice(i, 1);
            continue;
        }

        // Remove hit targets after animation
        if (t.hit && now - t.hitTime > 300) {
            tsTargets.splice(i, 1);
        }
    }

    // Update particles
    for (var i = tsParticles.length - 1; i >= 0; i--) {
        var p = tsParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.15;
        p.life -= p.decay;
        if (p.life <= 0) tsParticles.splice(i, 1);
    }

    // Check game over
    if (tsLives <= 0 && !tsGameOver) {
        tsGameOver = true;
        sndLose();
    }
}

function tsCheckShot() {
    for (var h = 0; h < numHands; h++) {
        var cur = P[h];
        if (!cur.pinchJustPressed) continue;

        for (var i = tsTargets.length - 1; i >= 0; i--) {
            var t = tsTargets[i];
            if (t.hit) continue;

            if (dist(cur.sx, cur.sy, t.x, t.y) < t.radius * t.scale + 15) {
                t.hit = true;
                t.hitTime = Date.now();

                if (t.type === 'penalty') {
                    tsLives--;
                    tsCombo = 0;
                    tsAddParticles(t.x, t.y, '#FF4444', 15);
                    tsAddParticles(t.x, t.y, '#FF8800', 10);
                    sndBomb();
                } else {
                    var bonus = t.type === 'bonus' ? 3 : 1;
                    tsCombo++;
                    if (tsCombo > tsBestCombo) tsBestCombo = tsCombo;
                    var comboMult = 1 + Math.floor(tsCombo / 5) * 0.5;
                    var earned = Math.round(t.points * bonus * comboMult);
                    tsScore += earned;
                    tsTargetsHit++;

                    if (t.type === 'bonus') {
                        tsAddParticles(t.x, t.y, GOLD, 20);
                        tsAddParticles(t.x, t.y, '#FFFFFF', 10);
                    } else {
                        tsAddParticles(t.x, t.y, CYAN, 12);
                        tsAddParticles(t.x, t.y, '#FFFFFF', 8);
                    }
                    sndSlice();
                }
                break; // One shot per pinch per hand
            }
        }
    }
}

function tsDrawTarget(t) {
    if (t.hit) return; // Don't draw hit targets

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.scale, t.scale);
    ctx.globalAlpha = t.opacity;

    var r = t.radius;

    if (t.type === 'penalty') {
        // Red danger target
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,50,50,0.15)';
        ctx.shadowColor = '#FF3333';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.strokeStyle = '#FF3333';
        ctx.lineWidth = 3;
        ctx.stroke();
        // X mark
        var xr = r * 0.5;
        ctx.beginPath();
        ctx.moveTo(-xr, -xr); ctx.lineTo(xr, xr);
        ctx.moveTo(xr, -xr); ctx.lineTo(-xr, xr);
        ctx.strokeStyle = '#FF5555';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 0;
        ctx.stroke();
    } else if (t.type === 'bonus') {
        // Golden star target
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(245,208,97,0.15)';
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Star
        ctx.shadowBlur = 0;
        ctx.fillStyle = GOLD;
        ctx.font = (r * 0.9) + 'px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 2);
    } else {
        // Normal target — concentric rings
        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(97,212,245,0.08)';
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Middle ring
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(97,212,245,0.6)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.stroke();
        // Inner dot
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, 2 * Math.PI);
        ctx.fillStyle = CYAN;
        ctx.fill();
    }

    // Timer ring (remaining time)
    var now = Date.now();
    var remaining = 1 - (now - t.spawnTime) / t.duration;
    if (remaining > 0 && remaining < 1) {
        ctx.beginPath();
        ctx.arc(0, 0, r + 4, -Math.PI / 2, -Math.PI / 2 + remaining * 2 * Math.PI);
        ctx.strokeStyle = remaining > 0.3 ? 'rgba(255,255,255,0.3)' : 'rgba(255,80,80,0.6)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 0;
        ctx.stroke();
    }

    ctx.restore();
}

function renderTargetShooter() {
    var now = Date.now();

    // Countdown phase
    if (!tsStarted) {
        var elapsed = (now - tsCountdownStart) / 1000;
        var count = 3 - Math.floor(elapsed);
        if (count <= 0) {
            tsStarted = true;
            tsStartTime = now;
            tsLastSpawn = now;
        } else {
            ctx.save();
            ctx.fillStyle = CYAN;
            ctx.font = '700 120px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = CYAN;
            ctx.shadowBlur = 30;
            var scale = 1 + (elapsed % 1) * 0.15;
            ctx.setTransform(scale, 0, 0, scale, c.width / 2, c.height / 2);
            ctx.fillText(count, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = '600 28px Outfit';
            ctx.shadowBlur = 10;
            ctx.fillText(t('aim_pinch'), c.width / 2, c.height / 2 + 80);
            ctx.restore();
            return;
        }
    }

    if (!tsGameOver) {
        tsUpdate();
        tsCheckShot();
    }

    // Draw targets
    for (var i = 0; i < tsTargets.length; i++) {
        tsDrawTarget(tsTargets[i]);
    }

    // Draw particles
    for (var i = 0; i < tsParticles.length; i++) {
        var p = tsParticles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // HUD
    ctx.save();
    // Score
    ctx.fillStyle = CYAN;
    ctx.font = '700 36px Outfit';
    ctx.textAlign = 'left';
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 10;
    ctx.fillText('🎯 ' + tsScore, 25, 100);

    // Combo
    if (tsCombo >= 3) {
        ctx.fillStyle = GOLD;
        ctx.font = '600 22px Outfit';
        ctx.shadowColor = GOLD;
        ctx.fillText('🔥 x' + tsCombo, 25, 132);
    }

    // Level
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 18px Outfit';
    ctx.shadowBlur = 0;
    ctx.fillText(t('level') + tsLevel, 25, 160);

    // Lives
    ctx.textAlign = 'right';
    var hearts = '';
    for (var i = 0; i < 5; i++) hearts += (i < tsLives ? '❤️' : '🖤');
    ctx.font = '24px Outfit';
    ctx.fillText(hearts, c.width - 25, 100);
    ctx.restore();

    // Crosshair cursors
    for (var h = 0; h < numHands; h++) {
        var cur = P[h];
        if (cur.sx === null) continue;
        ctx.save();
        ctx.translate(cur.sx, cur.sy);
        // Crosshair lines
        var cr = 15;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-cr, 0); ctx.lineTo(-5, 0);
        ctx.moveTo(5, 0); ctx.lineTo(cr, 0);
        ctx.moveTo(0, -cr); ctx.lineTo(0, -5);
        ctx.moveTo(0, 5); ctx.lineTo(0, cr);
        ctx.stroke();
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, 2 * Math.PI);
        ctx.fillStyle = cur.isPinching ? GREEN_ACCENT : '#FFFFFF';
        ctx.fill();
        ctx.restore();
    }

    // Game Over overlay
    if (tsGameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = RED_ACCENT;
        ctx.font = '700 64px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = RED_ACCENT;
        ctx.shadowBlur = 20;
        ctx.fillText(t('game_over'), c.width / 2, c.height / 2 - 80);

        ctx.fillStyle = CYAN;
        ctx.font = '600 36px Outfit';
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 10;
        ctx.fillText(t('score') + tsScore, c.width / 2, c.height / 2 - 10);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '400 20px Outfit';
        ctx.shadowBlur = 0;
        ctx.fillText(t('targets_hit') + tsTargetsHit + '  |  ' + t('best_combo') + tsBestCombo + 'x  |  ' + t('level') + tsLevel, c.width / 2, c.height / 2 + 25);
        ctx.restore();

        // Play again
        createBtn('ts_again', c.width / 2 - 110, c.height / 2 + 55, 220, 55, t('play_again'), '🔄');
        if (updateBtn('ts_again')) { sndSelect(); tsReset(); }
        drawBtn('ts_again');
    }
}
