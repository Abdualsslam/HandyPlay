// =============================================
// PICTIONARY GAME
// =============================================
var PIC_WORDS = [
    // Animals
    'Cat', 'Dog', 'Fish', 'Bird', 'Snake', 'Elephant', 'Rabbit', 'Butterfly',
    // Objects
    'House', 'Car', 'Phone', 'Book', 'Clock', 'Key', 'Cup', 'Chair',
    'Umbrella', 'Guitar', 'Camera', 'Glasses', 'Hat', 'Shoe', 'Pizza',
    // Nature
    'Sun', 'Moon', 'Star', 'Tree', 'Flower', 'Mountain', 'Cloud', 'Rain',
    // Actions / Concepts
    'Heart', 'Fire', 'Arrow', 'Crown', 'Diamond', 'Rocket', 'Robot', 'Ghost'
];

function picReset() {
    picStrokes = [];
    picCurStroke = [];
    picWord = '';
    picWordRevealed = false;
    picPhase = 'LOBBY'; // LOBBY, REVEAL, DRAWING, GUESSING, DONE
    picTimer = 0;
    picTimerStart = 0;
    picRoundTime = 60; // seconds
    picCorrect = false;
    picDrawerHand = 0;
}

function picNewRound() {
    picStrokes = [];
    picCurStroke = [];
    picWord = PIC_WORDS[Math.floor(Math.random() * PIC_WORDS.length)];
    picWordRevealed = false;
    picPhase = 'REVEAL';
    picTimer = 0;
    picTimerStart = Date.now();
    picCorrect = false;
}

function renderPictionary(lmArr) {
    var now = Date.now();

    // ---- PHASE: LOBBY ----
    if (picPhase === 'LOBBY') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = GOLD;
        ctx.font = '700 48px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 15;
        ctx.fillText(t('pic_title'), c.width / 2, c.height * 0.25);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '400 22px Outfit';
        ctx.shadowBlur = 0;
        ctx.fillText(t('pic_subtitle_1'), c.width / 2, c.height * 0.35);
        ctx.fillText(t('pic_subtitle_2'), c.width / 2, c.height * 0.35 + 32);
        ctx.fillText(t('pic_subtitle_3'), c.width / 2, c.height * 0.35 + 64);
        ctx.restore();

        // Start button
        createBtn('pic_start', c.width / 2 - 120, c.height * 0.55, 240, 60, t('start_round'), '🎬');
        if (updateBtn('pic_start')) {
            sndSelect();
            picNewRound();
        }
        drawBtn('pic_start', { fontSize: 22 });
        return;
    }

    // ---- PHASE: REVEAL (show word to drawer for 3 seconds) ----
    if (picPhase === 'REVEAL') {
        var revealElapsed = (now - picTimerStart) / 1000;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = GOLD;
        ctx.font = '700 28px Outfit';
        ctx.textAlign = 'center';
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 10;
        ctx.fillText(t('memorize_word'), c.width / 2, c.height / 2 - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 72px Outfit';
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 25;
        ctx.fillText(t(picWord), c.width / 2, c.height / 2 + 20);

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '400 20px Outfit';
        ctx.shadowBlur = 0;
        var remaining = Math.max(0, 4 - Math.floor(revealElapsed));
        ctx.fillText(t('starting_in') + remaining + '...', c.width / 2, c.height / 2 + 70);
        ctx.restore();

        if (revealElapsed >= 4) {
            picPhase = 'DRAWING';
            picTimerStart = now;
        }
        return;
    }

    // ---- PHASE: DRAWING ----
    if (picPhase === 'DRAWING' || picPhase === 'DONE') {
        var elapsed = (now - picTimerStart) / 1000;
        var timeLeft = Math.max(0, picRoundTime - elapsed);

        // Auto-end when time runs out
        if (timeLeft <= 0 && picPhase === 'DRAWING') {
            picPhase = 'DONE';
            sndLose();
        }

        // Draw all strokes
        ctx.save();
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (var i = 0; i < picStrokes.length; i++) {
            if (picStrokes[i].length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(picStrokes[i][0].x, picStrokes[i][0].y);
            for (var j = 1; j < picStrokes[i].length; j++) {
                ctx.lineTo(picStrokes[i][j].x, picStrokes[i][j].y);
            }
            ctx.stroke();
        }
        ctx.restore();

        // Drawing input
        if (picPhase === 'DRAWING') {
            for (var h = 0; h < numHands; h++) {
                var lm = lmArr[h];
                var cur = P[h];
                if (!lm) continue;

                var pointing = isPointing(lm);
                var openHand = isOpenHand(lm);

                if (pointing) {
                    if (!cur.isDraw) {
                        cur.isDraw = true;
                        picCurStroke = [];
                        picStrokes.push(picCurStroke);
                    }
                    picCurStroke.push({ x: cur.sx, y: cur.sy });

                    // Drawing cursor
                    ctx.beginPath();
                    ctx.arc(cur.sx, cur.sy, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fill();
                } else if (openHand) {
                    cur.isDraw = false;
                    // Eraser in pictionary
                    for (var s = picStrokes.length - 1; s >= 0; s--) {
                        var newSeg = [];
                        for (var p = 0; p < picStrokes[s].length; p++) {
                            if (dist(picStrokes[s][p].x, picStrokes[s][p].y, cur.sx, cur.sy) > 15) {
                                newSeg.push(picStrokes[s][p]);
                            }
                        }
                        if (newSeg.length < 2) picStrokes.splice(s, 1);
                        else picStrokes[s] = newSeg;
                    }
                    // Eraser indicator
                    ctx.beginPath();
                    ctx.arc(cur.sx, cur.sy, 15, 0, 2 * Math.PI);
                    ctx.strokeStyle = 'rgba(255,100,100,0.6)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    cur.isDraw = false;
                }
            }
        }

        // HUD - Timer bar
        ctx.save();
        var barW = c.width * 0.5;
        var barH = 8;
        var barX = (c.width - barW) / 2;
        var barY = 70;
        var progress = timeLeft / picRoundTime;

        // Bar background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        roundRect(barX, barY, barW, barH, 4);
        ctx.fill();

        // Bar fill
        ctx.fillStyle = progress > 0.3 ? CYAN : RED_ACCENT;
        roundRect(barX, barY, barW * progress, barH, 4);
        ctx.fill();

        // Timer text
        ctx.fillStyle = progress > 0.3 ? 'rgba(255,255,255,0.6)' : RED_ACCENT;
        ctx.font = '600 18px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(timeLeft) + 's', c.width / 2, barY + 28);
        ctx.restore();

        // Word hint (for drawer only — shown at top)
        ctx.save();
        ctx.textAlign = 'center';
        if (picPhase === 'DRAWING') {
            // Show word with toggle button
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '400 16px Outfit';
            ctx.fillText(t('word_label'), c.width / 2 - 60, 100);

            if (picWordRevealed) {
                ctx.fillStyle = GOLD;
                ctx.font = '700 20px Outfit';
                ctx.shadowColor = GOLD;
                ctx.shadowBlur = 8;
                ctx.fillText(t(picWord), c.width / 2 + 20, 100);
            } else {
                // Show dashes
                var dashes = '';
                for (var i = 0; i < picWord.length; i++) dashes += '_ ';
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '700 20px Outfit';
                ctx.fillText(dashes.trim(), c.width / 2 + 20, 100);
            }

            // Toggle reveal button
            createBtn('pic_reveal', c.width / 2 + 80, 85, 80, 28, picWordRevealed ? t('hide') : t('show'), '👁');
            if (updateBtn('pic_reveal')) {
                picWordRevealed = !picWordRevealed;
            }
            drawBtn('pic_reveal', { fontSize: 12 });
        }
        ctx.restore();

        // Correct / Clear / New Round buttons
        if (picPhase === 'DRAWING') {
            // "Correct!" button — guessers got it
            createBtn('pic_correct', c.width - 180, c.height - 70, 160, 50, t('correct_btn'), '✅');
            if (updateBtn('pic_correct')) {
                sndWin();
                picPhase = 'DONE';
                picCorrect = true;
            }
            drawBtn('pic_correct', { fontSize: 16 });

            // Clear canvas
            createBtn('pic_clear', 20, c.height - 70, 120, 50, t('clear'), '🗑');
            if (updateBtn('pic_clear')) {
                picStrokes = [];
                sndSelect();
            }
            drawBtn('pic_clear', { fontSize: 16 });
        }

        // ---- PHASE: DONE ----
        if (picPhase === 'DONE') {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, c.width, c.height);

            // Re-draw strokes on top of overlay
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (var i = 0; i < picStrokes.length; i++) {
                if (picStrokes[i].length < 2) continue;
                ctx.beginPath();
                ctx.moveTo(picStrokes[i][0].x, picStrokes[i][0].y);
                for (var j = 1; j < picStrokes[i].length; j++) ctx.lineTo(picStrokes[i][j].x, picStrokes[i][j].y);
                ctx.stroke();
            }

            if (picCorrect) {
                ctx.fillStyle = GREEN_ACCENT;
                ctx.font = '700 52px Outfit';
                ctx.textAlign = 'center';
                ctx.shadowColor = GREEN_ACCENT;
                ctx.shadowBlur = 20;
                ctx.fillText(t('correct_result'), c.width / 2, c.height / 2 - 40);
            } else {
                ctx.fillStyle = RED_ACCENT;
                ctx.font = '700 52px Outfit';
                ctx.textAlign = 'center';
                ctx.shadowColor = RED_ACCENT;
                ctx.shadowBlur = 20;
                ctx.fillText(t('times_up'), c.width / 2, c.height / 2 - 40);
            }

            // Show the word
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '600 32px Outfit';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 10;
            ctx.fillText(t('word_was') + t(picWord), c.width / 2, c.height / 2 + 15);
            ctx.restore();

            // New Round + Back buttons
            createBtn('pic_newround', c.width / 2 - 130, c.height / 2 + 50, 120, 50, t('new_round'), '🔄');
            if (updateBtn('pic_newround')) {
                sndSelect();
                picNewRound();
            }
            drawBtn('pic_newround', { fontSize: 16 });

            createBtn('pic_backmenu', c.width / 2 + 10, c.height / 2 + 50, 120, 50, t('menu'), '◀');
            if (updateBtn('pic_backmenu')) {
                sndSelect();
                switchMode('MENU');
            }
            drawBtn('pic_backmenu', { fontSize: 16 });
        }
    }
}
