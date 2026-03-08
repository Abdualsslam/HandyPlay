// =============================================
// TIC-TAC-TOE GAME
// =============================================
function tttReset() {
    tttBoard = [null, null, null, null, null, null, null, null, null];
    tttPlayer = 'X';
    tttWinner = null;
    tttWinPattern = null;
    tttDraw = false;
    tttGameOver = false;
    tttHoveredCell = -1;
    var tttHoverStart = 0;
    var tttHoverProgress = 0;
    tttLastPlaceTime = 0;
    tttPlaceAnim = [];
}

function tttCheckWin(player) {
    for (var i = 0; i < TTT_WIN_PATTERNS.length; i++) {
        var p = TTT_WIN_PATTERNS[i];
        if (tttBoard[p[0]] === player && tttBoard[p[1]] === player && tttBoard[p[2]] === player) return p;
    }
    return null;
}

function tttCheckDraw() {
    for (var i = 0; i < 9; i++) { if (tttBoard[i] === null) return false; }
    return true;
}

function renderTicTacToe() {
    var now = Date.now();
    var gridSize = Math.min(c.width, c.height) * 0.45;
    var cellSize = gridSize / 3;
    var gridX = (c.width - gridSize) / 2;
    var gridY = (c.height - gridSize) / 2 + 20;

    // Draw grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(245,208,97,0.5)';
    ctx.lineWidth = 3;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    for (var i = 1; i < 3; i++) {
        // Vertical
        ctx.beginPath();
        ctx.moveTo(gridX + i * cellSize, gridY);
        ctx.lineTo(gridX + i * cellSize, gridY + gridSize);
        ctx.stroke();
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(gridX, gridY + i * cellSize);
        ctx.lineTo(gridX + gridSize, gridY + i * cellSize);
        ctx.stroke();
    }
    ctx.restore();

    // Draw marks
    for (var i = 0; i < 9; i++) {
        if (tttBoard[i] === null) continue;
        var row = Math.floor(i / 3);
        var col = i % 3;
        var cx = gridX + col * cellSize + cellSize / 2;
        var cy = gridY + row * cellSize + cellSize / 2;
        var markSize = cellSize * 0.3;

        // Check for animation
        var animScale = 1;
        for (var a = 0; a < tttPlaceAnim.length; a++) {
            if (tttPlaceAnim[a].cell === i) {
                var animAge = (now - tttPlaceAnim[a].time) / 300;
                if (animAge < 1) {
                    animScale = 0.5 + animAge * 0.5;
                    // Add bounce
                    if (animAge > 0.7) animScale = 1 + (1 - animAge) * 0.3;
                }
            }
        }

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(animScale, animScale);

        if (tttBoard[i] === 'X') {
            ctx.strokeStyle = GOLD;
            ctx.lineWidth = 5;
            ctx.shadowColor = GOLD;
            ctx.shadowBlur = 12;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-markSize, -markSize);
            ctx.lineTo(markSize, markSize);
            ctx.moveTo(markSize, -markSize);
            ctx.lineTo(-markSize, markSize);
            ctx.stroke();
        } else {
            ctx.strokeStyle = CYAN;
            ctx.lineWidth = 5;
            ctx.shadowColor = CYAN;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, markSize, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Win line
    if (tttWinPattern) {
        var r0 = Math.floor(tttWinPattern[0] / 3), c0 = tttWinPattern[0] % 3;
        var r2 = Math.floor(tttWinPattern[2] / 3), c2 = tttWinPattern[2] % 3;
        var x1 = gridX + c0 * cellSize + cellSize / 2;
        var y1 = gridY + r0 * cellSize + cellSize / 2;
        var x2 = gridX + c2 * cellSize + cellSize / 2;
        var y2 = gridY + r2 * cellSize + cellSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = tttWinner === 'X' ? GOLD : CYAN;
        ctx.lineWidth = 6;
        ctx.shadowColor = tttWinner === 'X' ? GOLD : CYAN;
        ctx.shadowBlur = 20;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
    }

    // Turn / result indicator
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 28px Outfit';
    ctx.shadowBlur = 10;
    if (tttGameOver) {
        if (tttWinner) {
            ctx.fillStyle = tttWinner === 'X' ? GOLD : CYAN;
            ctx.shadowColor = tttWinner === 'X' ? GOLD : CYAN;
            ctx.fillText(t('player_wins').replace('PLAYER', tttWinner), c.width / 2, gridY - 30);
        } else {
            ctx.fillStyle = '#AAAAAA';
            ctx.shadowColor = '#AAAAAA';
            ctx.fillText(t('its_a_draw'), c.width / 2, gridY - 30);
        }
    } else {
        ctx.fillStyle = tttPlayer === 'X' ? GOLD : CYAN;
        ctx.shadowColor = tttPlayer === 'X' ? GOLD : CYAN;
        ctx.fillText(t('player_turn').replace('PLAYER', tttPlayer), c.width / 2, gridY - 30);
    }
    ctx.restore();

    // Hover & selection logic
    if (!tttGameOver) {
        tttHoveredCell = -1;
        var clickedCell = -1;

        for (var h = 0; h < numHands; h++) {
            var cur = P[h];
            for (var i = 0; i < 9; i++) {
                var row = Math.floor(i / 3);
                var col = i % 3;
                var cx = gridX + col * cellSize;
                var cy = gridY + row * cellSize;
                if (cur.sx >= cx && cur.sx <= cx + cellSize && cur.sy >= cy && cur.sy <= cy + cellSize) {
                    if (tttBoard[i] === null) {
                        tttHoveredCell = i;
                        if (cur.pinchJustPressed) clickedCell = i;
                    }
                    break;
                }
            }
        }

        if (tttHoveredCell >= 0 && now - tttLastPlaceTime > 800) {
            // Highlight cell
            var hRow = Math.floor(tttHoveredCell / 3);
            var hCol = tttHoveredCell % 3;
            var hx = gridX + hCol * cellSize;
            var hy = gridY + hRow * cellSize;

            ctx.save();
            ctx.fillStyle = tttPlayer === 'X' ? 'rgba(245,208,97,0.15)' : 'rgba(97,212,245,0.15)';
            ctx.fillRect(hx + 2, hy + 2, cellSize - 4, cellSize - 4);
            ctx.restore();

            // Place mark on pinch
            if (clickedCell >= 0) {
                tttBoard[clickedCell] = tttPlayer;
                tttPlaceAnim.push({ cell: clickedCell, time: now });
                sndPlace();
                tttLastPlaceTime = now;
                tttHoveredCell = -1;

                // Check win
                var win = tttCheckWin(tttPlayer);
                if (win) {
                    tttWinner = tttPlayer;
                    tttWinPattern = win;
                    tttGameOver = true;
                    sndWin();
                } else if (tttCheckDraw()) {
                    tttDraw = true;
                    tttGameOver = true;
                } else {
                    tttPlayer = tttPlayer === 'X' ? 'O' : 'X';
                }
            }
        }

        // Cursors
        for (var h = 0; h < numHands; h++) {
            ctx.beginPath();
            ctx.arc(P[h].sx, P[h].sy, 6, 0, 2 * Math.PI);
            ctx.fillStyle = tttPlayer === 'X' ? GOLD : CYAN;
            ctx.fill();
        }
    } else {
        tttHoveredCell = -1;
    }

    // Game over - play again button
    if (tttGameOver) {
        createBtn('ttt_again', c.width / 2 - 110, gridY + gridSize + 30, 220, 55, t('play_again'), '🔄');
        if (updateBtn('ttt_again')) { sndSelect(); tttReset(); }
        drawBtn('ttt_again');
    }
}
