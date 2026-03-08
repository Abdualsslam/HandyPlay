// =============================================
// PONG GAME — Two-Player Hand-Controlled
// =============================================
function pongReset() {
    pongScore1 = 0;
    pongScore2 = 0;
    pongGameOver = false;
    pongWinner = 0;
    pongStarted = false;
    pongCountdownStart = 0;
    pongParticles = [];
    pongBallTrail = [];
    pongLastTime = Date.now();
    pongServeDir = 1;
    pongPaddle1Y = c.height / 2;
    pongPaddle2Y = c.height / 2;
    pongServeBall(1);
}

function pongServeBall(dir) {
    pongBallX = c.width / 2;
    pongBallY = c.height / 2;
    var angle = (Math.random() * 0.8 - 0.4); // -0.4 to 0.4 radians
    pongBallVX = PONG_BALL_SPEED * dir * Math.cos(angle);
    pongBallVY = PONG_BALL_SPEED * Math.sin(angle);
    pongServeDir = dir;
    pongRallyStart = Date.now();
}

function pongSpawnParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 2 + Math.random() * 4;
        pongParticles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: color,
            size: 2 + Math.random() * 4
        });
    }
}

function renderPong() {
    var now = Date.now();
    var dt = Math.min(3, (now - pongLastTime) / 16); // normalize to ~60fps
    pongLastTime = now;

    var paddleH = c.height * PONG_PADDLE_HEIGHT_RATIO;
    var halfW = c.width / 2;

    // ---- Draw split background ----
    ctx.save();
    // Left half - Cyan tint
    ctx.fillStyle = 'rgba(97, 212, 245, 0.06)';
    ctx.fillRect(0, 0, halfW, c.height);
    // Right half - Gold tint
    ctx.fillStyle = 'rgba(245, 208, 97, 0.06)';
    ctx.fillRect(halfW, 0, halfW, c.height);
    ctx.restore();

    // ---- Center divider line (dashed) ----
    ctx.save();
    ctx.setLineDash([12, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, c.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ---- Track paddles with hands ----
    // Determine which hand controls which paddle based on X position
    for (var h = 0; h < numHands; h++) {
        var cur = P[h];
        if (cur.sx === null) continue;

        if (cur.sx < halfW) {
            // Left side → Paddle 1
            pongPaddle1Y += (cur.sy - pongPaddle1Y) * 0.3;
        } else {
            // Right side → Paddle 2
            pongPaddle2Y += (cur.sy - pongPaddle2Y) * 0.3;
        }
    }

    // Clamp paddles to screen
    var halfPaddle = paddleH / 2;
    pongPaddle1Y = Math.max(halfPaddle + 60, Math.min(c.height - halfPaddle - 10, pongPaddle1Y));
    pongPaddle2Y = Math.max(halfPaddle + 60, Math.min(c.height - halfPaddle - 10, pongPaddle2Y));

    // ---- Draw paddles ----
    var p1x = PONG_PADDLE_MARGIN;
    var p2x = c.width - PONG_PADDLE_MARGIN - PONG_PADDLE_WIDTH;

    // Left paddle (Cyan)
    ctx.save();
    ctx.shadowColor = PONG_COLOR_LEFT;
    ctx.shadowBlur = 18;
    ctx.fillStyle = PONG_COLOR_LEFT;
    roundRect(p1x, pongPaddle1Y - halfPaddle, PONG_PADDLE_WIDTH, paddleH, 7);
    ctx.fill();
    ctx.restore();

    // Right paddle (Gold)
    ctx.save();
    ctx.shadowColor = PONG_COLOR_RIGHT;
    ctx.shadowBlur = 18;
    ctx.fillStyle = PONG_COLOR_RIGHT;
    roundRect(p2x, pongPaddle2Y - halfPaddle, PONG_PADDLE_WIDTH, paddleH, 7);
    ctx.fill();
    ctx.restore();

    // ---- Scores ----
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = getFont('700', 64);

    // Left score
    ctx.fillStyle = 'rgba(97, 212, 245, 0.25)';
    ctx.shadowColor = PONG_COLOR_LEFT;
    ctx.shadowBlur = 10;
    ctx.fillText(pongScore1, halfW / 2, 90);

    // Right score
    ctx.fillStyle = 'rgba(245, 208, 97, 0.25)';
    ctx.shadowColor = PONG_COLOR_RIGHT;
    ctx.shadowBlur = 10;
    ctx.fillText(pongScore2, halfW + halfW / 2, 90);
    ctx.restore();

    // ---- Game logic ----
    if (!pongStarted && !pongGameOver) {
        // Waiting for two hands
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = getFont('600', 24);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(t('pong_two_hands'), c.width / 2, c.height / 2);
        ctx.restore();

        if (numHands >= 2) {
            pongStarted = true;
            pongCountdownStart = now;
            pongServeBall(1);
        }

        // Draw ball stationary at center
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(c.width / 2, c.height / 2 - 40, PONG_BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

    } else if (pongStarted && !pongGameOver) {
        // Countdown phase
        var elapsed = now - pongCountdownStart;
        if (elapsed < 1500) {
            // Show "Ready!" during countdown
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = getFont('700', 48);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 20;
            var countScale = 1 + Math.sin(elapsed * 0.008) * 0.1;
            ctx.translate(c.width / 2, c.height / 2);
            ctx.scale(countScale, countScale);
            ctx.fillText(t('pong_serve'), 0, 0);
            ctx.restore();

            // Draw ball stationary
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(pongBallX, pongBallY, PONG_BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // ---- Ball physics ----
            pongBallX += pongBallVX * dt;
            pongBallY += pongBallVY * dt;

            // Bounce off top/bottom walls
            if (pongBallY - PONG_BALL_RADIUS <= 60) {
                pongBallY = 60 + PONG_BALL_RADIUS;
                pongBallVY = Math.abs(pongBallVY);
                pongSpawnParticles(pongBallX, pongBallY, 'rgba(255,255,255,0.6)', 5);
            }
            if (pongBallY + PONG_BALL_RADIUS >= c.height) {
                pongBallY = c.height - PONG_BALL_RADIUS;
                pongBallVY = -Math.abs(pongBallVY);
                pongSpawnParticles(pongBallX, pongBallY, 'rgba(255,255,255,0.6)', 5);
            }

            // Paddle 1 collision (left)
            if (pongBallVX < 0 &&
                pongBallX - PONG_BALL_RADIUS <= p1x + PONG_PADDLE_WIDTH &&
                pongBallX + PONG_BALL_RADIUS >= p1x &&
                pongBallY >= pongPaddle1Y - halfPaddle &&
                pongBallY <= pongPaddle1Y + halfPaddle) {

                pongBallX = p1x + PONG_PADDLE_WIDTH + PONG_BALL_RADIUS;
                // Change angle based on where the ball hit the paddle
                var relHit = (pongBallY - pongPaddle1Y) / halfPaddle; // -1 to 1
                var angle = relHit * (Math.PI / 4); // max 45 degrees
                var speed = Math.sqrt(pongBallVX * pongBallVX + pongBallVY * pongBallVY);
                var rallyAge = (now - pongRallyStart) / 1000;
                var boost = rallyAge < 5 ? 1.15 : 1.05; // faster ramp-up in first 5s
                speed = Math.min(speed * boost, PONG_BALL_SPEED * 2.5);
                pongBallVX = speed * Math.cos(angle);
                pongBallVY = speed * Math.sin(angle);
                pongSpawnParticles(pongBallX, pongBallY, PONG_COLOR_LEFT, 10);
                playTone(600, 0.08);
            }

            // Paddle 2 collision (right)
            if (pongBallVX > 0 &&
                pongBallX + PONG_BALL_RADIUS >= p2x &&
                pongBallX - PONG_BALL_RADIUS <= p2x + PONG_PADDLE_WIDTH &&
                pongBallY >= pongPaddle2Y - halfPaddle &&
                pongBallY <= pongPaddle2Y + halfPaddle) {

                pongBallX = p2x - PONG_BALL_RADIUS;
                var relHit = (pongBallY - pongPaddle2Y) / halfPaddle;
                var angle = relHit * (Math.PI / 4);
                var speed = Math.sqrt(pongBallVX * pongBallVX + pongBallVY * pongBallVY);
                var rallyAge = (now - pongRallyStart) / 1000;
                var boost = rallyAge < 5 ? 1.15 : 1.05;
                speed = Math.min(speed * boost, PONG_BALL_SPEED * 2.5);
                pongBallVX = -speed * Math.cos(angle);
                pongBallVY = speed * Math.sin(angle);
                pongSpawnParticles(pongBallX, pongBallY, PONG_COLOR_RIGHT, 10);
                playTone(600, 0.08);
            }

            // Score — ball past left edge
            if (pongBallX < -PONG_BALL_RADIUS * 2) {
                pongScore2++;
                pongSpawnParticles(0, pongBallY, PONG_COLOR_RIGHT, 25);
                sndLose();
                if (pongScore2 >= PONG_WIN_SCORE) {
                    pongGameOver = true;
                    pongWinner = 2;
                    sndWin();
                } else {
                    pongCountdownStart = now;
                    pongServeBall(-1);
                }
            }

            // Score — ball past right edge
            if (pongBallX > c.width + PONG_BALL_RADIUS * 2) {
                pongScore1++;
                pongSpawnParticles(c.width, pongBallY, PONG_COLOR_LEFT, 25);
                sndLose();
                if (pongScore1 >= PONG_WIN_SCORE) {
                    pongGameOver = true;
                    pongWinner = 1;
                    sndWin();
                } else {
                    pongCountdownStart = now;
                    pongServeBall(1);
                }
            }

            // ---- Ball trail ----
            pongBallTrail.push({ x: pongBallX, y: pongBallY, t: now });
            // Remove old trail points
            while (pongBallTrail.length > 0 && now - pongBallTrail[0].t > 150) {
                pongBallTrail.shift();
            }

            // Draw trail
            if (pongBallTrail.length > 1) {
                ctx.save();
                for (var i = 0; i < pongBallTrail.length - 1; i++) {
                    var alpha = (i / pongBallTrail.length) * 0.4;
                    var size = PONG_BALL_RADIUS * (i / pongBallTrail.length) * 0.8;
                    ctx.beginPath();
                    ctx.arc(pongBallTrail[i].x, pongBallTrail[i].y, size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
                    ctx.fill();
                }
                ctx.restore();
            }

            // Draw ball
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(pongBallX, pongBallY, PONG_BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ---- Particles ----
    ctx.save();
    for (var i = pongParticles.length - 1; i >= 0; i--) {
        var p = pongParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.025 * dt;
        if (p.life <= 0) { pongParticles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ---- Game Over screen ----
    if (pongGameOver) {
        // Dim overlay
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.restore();

        var winColor = pongWinner === 1 ? PONG_COLOR_LEFT : PONG_COLOR_RIGHT;

        // Winner text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = getFont('700', 42);
        ctx.fillStyle = winColor;
        ctx.shadowColor = winColor;
        ctx.shadowBlur = 25;
        var winText = t('pong_player') + pongWinner + t('pong_wins');
        ctx.fillText(winText, c.width / 2, c.height / 2 - 40);
        ctx.restore();

        // Final score
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = getFont('600', 28);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(pongScore1 + t('pong_score_separator') + pongScore2, c.width / 2, c.height / 2 + 10);
        ctx.restore();

        // Play again button
        createBtn('pong_again', c.width / 2 - 110, c.height / 2 + 40, 220, 55, t('play_again'), '🔄');
        if (updateBtn('pong_again')) { sndSelect(); pongReset(); }
        drawBtn('pong_again');
    }

    // ---- Hand cursors ----
    for (var h = 0; h < numHands; h++) {
        var cur = P[h];
        if (cur.sx === null) continue;
        var curColor = cur.sx < halfW ? PONG_COLOR_LEFT : PONG_COLOR_RIGHT;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cur.sx, cur.sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = curColor;
        ctx.shadowColor = curColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }
}
