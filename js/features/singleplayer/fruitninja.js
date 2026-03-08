// =============================================
// FRUIT NINJA GAME
// =============================================
function fnReset() {
    fnFruits = []; fnParticles = []; fnSlashTrail = [];
    fnScore = 0; fnLives = 3; fnMissCount = 0;
    fnLevel = 1; fnScoreToNext = 10;
    fnGameOver = false; fnLastSpawn = 0;
    fnSpawnInterval = FN_INITIAL_SPAWN_INTERVAL;
    fnStarted = false;
    fnCountdown = 3;
    fnCountdownStart = Date.now();
}

function fnSpawnFruit() {
    var isBomb = Math.random() < 0.12 + (Date.now() - fnStartTime) / 300000 * 0.08;
    var ft = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    var radius = c.height * 0.035 + Math.random() * 10;
    fnFruits.push({
        type: isBomb ? 'bomb' : 'fruit',
        x: c.width * 0.15 + Math.random() * c.width * 0.7,
        y: c.height + radius + 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -(c.height * 0.018 + Math.random() * c.height * 0.008) * (1 + (fnLevel - 1) * 0.05),
        radius: radius,
        color: ft.color, light: ft.light,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        sliced: false, missed: false
    });
}

function fnAddParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
        fnParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            r: Math.random() * 5 + 2,
            color: color,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.025
        });
    }
}

function fnUpdate() {
    var now = Date.now();
    var elapsed = (now - fnStartTime) / 1000;

    // Increase difficulty
    fnSpawnInterval = Math.max(FN_MIN_SPAWN_INTERVAL, FN_INITIAL_SPAWN_INTERVAL - (fnLevel - 1) * 200 - elapsed * 8);

    // Update level
    if (fnScore >= fnScoreToNext) {
        fnLevel++;
        fnScoreToNext += 10 + fnLevel * 5;
        sndWin(); // Level up sound
        fnAddParticles(c.width / 2, c.height / 2, GOLD, 50); // Celebration particles
    }

    // Spawn
    if (now - fnLastSpawn > fnSpawnInterval) {
        fnSpawnFruit();
        // Sometimes spawn 2-3 at once
        if (elapsed > 15 && Math.random() < 0.3) fnSpawnFruit();
        if (elapsed > 30 && Math.random() < 0.2) fnSpawnFruit();
        fnLastSpawn = now;
    }

    // Update fruits
    for (var i = fnFruits.length - 1; i >= 0; i--) {
        var f = fnFruits[i];
        if (f.sliced) { fnFruits.splice(i, 1); continue; }
        f.vy += 0.35 + (fnLevel - 1) * 0.02; // gravity
        f.x += f.vx;
        f.y += f.vy;
        f.rotation += f.rotSpeed;

        if (f.y > c.height + f.radius + 50 && !f.missed) {
            f.missed = true;
            if (f.type === 'fruit') {
                fnMissCount++;
                if (fnMissCount >= FN_MISS_LIMIT) { fnMissCount = 0; fnLives--; }
            }
            fnFruits.splice(i, 1);
            continue;
        }
        if (f.y > c.height + 200) { fnFruits.splice(i, 1); }
    }

    // Update particles
    for (var i = fnParticles.length - 1; i >= 0; i--) {
        var p = fnParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.2;
        p.life -= p.decay;
        if (p.life <= 0) fnParticles.splice(i, 1);
    }

    // Clean slash trail
    fnSlashTrail = fnSlashTrail.filter(function (pt) { return now - pt.t < SLASH_TRAIL_DURATION; });

    // Check game over
    if (fnLives <= 0 && !fnGameOver) {
        fnGameOver = true;
        sndLose();
    }
}

function fnCheckSlice() {
    if (fnSlashTrail.length < 2) return;
    var now = Date.now();
    for (var i = fnFruits.length - 1; i >= 0; i--) {
        if (fnFruits[i].sliced) continue;
        for (var j = fnSlashTrail.length - 1; j >= 0; j--) {
            if (now - fnSlashTrail[j].t > 100) continue;
            if (dist(fnFruits[i].x, fnFruits[i].y, fnSlashTrail[j].x, fnSlashTrail[j].y) < fnFruits[i].radius + 18) {
                fnFruits[i].sliced = true;
                if (fnFruits[i].type === 'bomb') {
                    fnLives--;
                    fnAddParticles(fnFruits[i].x, fnFruits[i].y, '#FF4444', 20);
                    fnAddParticles(fnFruits[i].x, fnFruits[i].y, '#FF8800', 15);
                    sndBomb();
                } else {
                    fnScore++;
                    fnAddParticles(fnFruits[i].x, fnFruits[i].y, fnFruits[i].color, 15);
                    fnAddParticles(fnFruits[i].x, fnFruits[i].y, fnFruits[i].light, 10);
                    sndSlice();
                }
                break;
            }
        }
    }
}

function fnDrawFruit(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);

    if (f.type === 'bomb') {
        // Bomb body
        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#2A2A2A';
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Fuse
        ctx.beginPath();
        ctx.moveTo(f.radius * 0.2, -f.radius * 0.7);
        ctx.quadraticCurveTo(f.radius * 0.6, -f.radius * 1.3, f.radius * 0.3, -f.radius * 1.4);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 0;
        ctx.stroke();
        // Spark
        ctx.beginPath();
        ctx.arc(f.radius * 0.3, -f.radius * 1.4, 4 + Math.random() * 3, 0, 2 * Math.PI);
        ctx.fillStyle = Math.random() > 0.5 ? '#FFFF00' : '#FF8800';
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 10;
        ctx.fill();
        // Skull icon
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FF4444';
        ctx.font = (f.radius * 0.9) + 'px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', 0, 2);
    } else {
        // Fruit gradient
        var g = ctx.createRadialGradient(-f.radius * 0.15, -f.radius * 0.15, f.radius * 0.1, 0, 0, f.radius);
        g.addColorStop(0, f.light);
        g.addColorStop(1, f.color);
        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, 2 * Math.PI);
        ctx.fillStyle = g;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        // Shine highlight
        ctx.beginPath();
        ctx.arc(-f.radius * 0.25, -f.radius * 0.25, f.radius * 0.3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.shadowBlur = 0;
        ctx.fill();
        // Leaf
        ctx.beginPath();
        ctx.ellipse(4, -f.radius + 2, 7, 4, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        // Stem
        ctx.beginPath();
        ctx.moveTo(0, -f.radius + 3);
        ctx.lineTo(-2, -f.radius - 5);
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
}

function renderFruitNinja(lm) {
    var now = Date.now();

    // Countdown phase
    if (!fnStarted) {
        var elapsed = (now - fnCountdownStart) / 1000;
        var count = 3 - Math.floor(elapsed);
        if (count <= 0) {
            fnStarted = true;
            fnStartTime = now;
            fnLastSpawn = now;
        } else {
            ctx.save();
            ctx.fillStyle = GOLD;
            ctx.font = '700 120px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = GOLD;
            ctx.shadowBlur = 30;
            var scale = 1 + (elapsed % 1) * 0.15;
            ctx.setTransform(scale, 0, 0, scale, c.width / 2, c.height / 2);
            ctx.fillText(count, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = '600 28px Outfit';
            ctx.shadowBlur = 10;
            ctx.fillText(t('get_ready'), c.width / 2, c.height / 2 + 80);
            ctx.restore();
            return;
        }
    }

    if (!fnGameOver) fnUpdate();
    if (!fnGameOver && lm) fnCheckSlice();

    // Draw slash trail
    ctx.save();
    for (var i = 1; i < fnSlashTrail.length; i++) {
        var age = (now - fnSlashTrail[i].t) / SLASH_TRAIL_DURATION;
        var alpha = 1 - age;
        ctx.beginPath();
        ctx.moveTo(fnSlashTrail[i - 1].x, fnSlashTrail[i - 1].y);
        ctx.lineTo(fnSlashTrail[i].x, fnSlashTrail[i].y);
        ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.9) + ')';
        ctx.lineWidth = 4 * alpha + 1;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10 * alpha;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();

    // Draw fruits
    for (var i = 0; i < fnFruits.length; i++) {
        if (!fnFruits[i].sliced) fnDrawFruit(fnFruits[i]);
    }

    // Draw particles
    for (var i = 0; i < fnParticles.length; i++) {
        var p = fnParticles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // HUD - Score
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.font = '700 36px Outfit';
    ctx.textAlign = 'left';
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 10;
    ctx.fillText('🍎 ' + fnScore, 25, 100);

    // Level & Progress
    ctx.font = '600 24px Outfit';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.fillText('Level ' + fnLevel, 25, 140);

    var progress = fnScore / fnScoreToNext;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(25, 155, 150, 10);
    ctx.fillStyle = GREEN_ACCENT;
    ctx.shadowColor = GREEN_ACCENT;
    ctx.shadowBlur = 8;
    ctx.fillRect(25, 155, 150 * progress, 10);
    ctx.shadowBlur = 0;

    // HUD - Lives
    ctx.textAlign = 'right';
    var hearts = '';
    for (var i = 0; i < 3; i++) hearts += (i < fnLives ? '❤️' : '🖤');
    ctx.font = '30px Outfit';
    ctx.fillText(hearts, c.width - 25, 100);
    ctx.restore();

    // Hand cursor in game
    if (lm && numHands > 0) {
        if (isPointing(lm[0])) {
            ctx.beginPath();
            ctx.arc(P[0].sx, P[0].sy, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        }
    }

    // Game over overlay
    if (fnGameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = RED_ACCENT;
        ctx.font = '700 64px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = RED_ACCENT;
        ctx.shadowBlur = 20;
        ctx.fillText(t('game_over'), c.width / 2, c.height / 2 - 60);

        ctx.fillStyle = GOLD;
        ctx.font = '600 40px Outfit';
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 10;
        ctx.fillText(t('score') + fnScore, c.width / 2, c.height / 2 + 10);
        ctx.restore();

        // Play again button
        createBtn('fn_again', c.width / 2 - 110, c.height / 2 + 50, 220, 55, t('play_again'), '🔄');
        if (updateBtn('fn_again')) { sndSelect(); fnReset(); }
        drawBtn('fn_again');
    }
}
