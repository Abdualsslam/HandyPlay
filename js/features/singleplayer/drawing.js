// =============================================
// DRAWING MODE
// =============================================
var DRAW_COLORS = [
    '#F5D061', // GOLD
    '#20E2D7', // CYAN
    '#FF6B6B', // RED_ACCENT
    '#4ade80', // Green
    '#FFFFFF', // White
    '#c084fc', // Purple
    '#fb923c'  // Orange
];

function eraseNearby(x, y) {
    var newArr = [];
    for (var i = 0; i < drawStrokes.length; i++) {
        var strokeObj = drawStrokes[i];
        var segment = [];
        for (var j = 0; j < strokeObj.points.length; j++) {
            if (dist(strokeObj.points[j].x, strokeObj.points[j].y, x, y) <= ERASER_RADIUS) {
                if (segment.length >= 2) newArr.push({ color: strokeObj.color, points: segment });
                segment = [];
            } else {
                segment.push(strokeObj.points[j]);
            }
        }
        if (segment.length >= 2) newArr.push({ color: strokeObj.color, points: segment });
    }
    drawStrokes = newArr;
    for (var h = 0; h < numHands; h++) {
        if (P[h] && P[h].isDraw) {
            var found = false;
            for (var k = 0; k < drawStrokes.length; k++) {
                if (drawStrokes[k] === P[h].drawCur) found = true;
            }
            if (!found) P[h].isDraw = false;
        }
    }
}

function drawSmoothStroke(strokeObj) {
    var pts = strokeObj.points;
    if (!pts || pts.length < 2) return;
    ctx.strokeStyle = strokeObj.color;
    ctx.shadowColor = strokeObj.color;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length === 2) {
        ctx.lineTo(pts[1].x, pts[1].y);
    } else {
        for (var i = 1; i < pts.length - 1; i++) {
            var mx = (pts[i].x + pts[i + 1].x) / 2;
            var my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        var last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
    }
    ctx.stroke();
}

function renderDrawing(lmArr) {
    // Upgrading old formats implicitly
    if (drawStrokes.length > 0 && Array.isArray(drawStrokes[0])) {
        drawStrokes = [];
    }

    // 1. Draw existing strokes
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var i = 0; i < drawStrokes.length; i++) {
        drawSmoothStroke(drawStrokes[i]);
    }
    ctx.restore();

    // 2. Draw Top UI (Tools)
    ctx.save();
    var topUiY = 85;

    // Color Palette
    var colorBtnW = 40;
    var colorBtnGap = 16;
    var totalColorsW = DRAW_COLORS.length * colorBtnW + (DRAW_COLORS.length - 1) * colorBtnGap;
    var startX = c.width / 2 - totalColorsW / 2;

    for (var i = 0; i < DRAW_COLORS.length; i++) {
        var col = DRAW_COLORS[i];
        var btnId = 'draw_color_' + i;
        var cx = startX + i * (colorBtnW + colorBtnGap);

        createBtn(btnId, cx, topUiY, colorBtnW, colorBtnW, '', '');
        if (updateBtn(btnId)) {
            sndSelect();
            drawColor = col;
        }

        var isSelected = (drawColor === col);
        var b = buttons[btnId];
        var isHov = b && b.hovered;

        ctx.beginPath();
        ctx.arc(cx + colorBtnW / 2, topUiY + colorBtnW / 2, isHov ? 23 : 20, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = isSelected ? 18 : (isHov ? 10 : 0);
        ctx.fill();

        if (isSelected) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
    }

    // Action Buttons (Clear, Undo)
    var btnW = 100;
    var btnH = 40;

    // Clear Button (Left Side)
    var clearX = startX - btnW - 35;
    var clearText = typeof t === 'function' ? t('clear') : 'Clear';
    createBtn('draw_clear', clearX, topUiY, btnW, btnH, clearText, '🗑');
    if (updateBtn('draw_clear')) {
        sndSelect();
        drawStrokes = [];
    }
    drawBtn('draw_clear', { fontSize: 15 });

    // Undo Button (Right Side)
    var undoX = startX + totalColorsW + 35;
    // We don't have t('undo') set by user, but let's try or fallback 
    var undoText = typeof t === 'function' ? t('undo') : 'Undo';
    if (undoText === 'undo') undoText = 'تراجع'; // manual fallback for Arabic if missing
    createBtn('draw_undo', undoX, topUiY, btnW, btnH, undoText, '↩');
    if (updateBtn('draw_undo')) {
        sndSelect();
        if (drawStrokes.length > 0) drawStrokes.pop();
    }
    drawBtn('draw_undo', { fontSize: 15 });

    ctx.restore();

    // 3. Process up to 2 hands for drawing/erasing
    for (var h = 0; h < numHands; h++) {
        var lm = lmArr[h];
        var cur = P[h];
        if (!lm) continue;

        var pointing = isPointing(lm);
        var openHand = isOpenHand(lm);

        // Don't draw if interacting with UI buttons at top
        var inUiZone = cur.sy < 150;

        if (openHand && !pointing && !inUiZone) {
            cur.isDraw = false;
            eraseNearby(cur.sx, cur.sy);

            // Eraser circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(cur.sx, cur.sy, ERASER_RADIUS, 0, 2 * Math.PI);
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
            ctx.save();
            ctx.beginPath();
            ctx.arc(cur.sx, cur.sy, 6, 0, 2 * Math.PI);
            ctx.fillStyle = pointing ? drawColor : 'rgba(255,255,255,0.4)';
            ctx.shadowColor = pointing ? drawColor : 'transparent';
            ctx.shadowBlur = pointing ? 10 : 0;
            ctx.fill();
            ctx.restore();

            if (pointing && !inUiZone) {
                if (!cur.isDraw) {
                    cur.isDraw = true;
                    cur.drawCur = { color: drawColor, points: [] };
                    drawStrokes.push(cur.drawCur);
                }
                cur.drawCur.points.push({ x: cur.sx, y: cur.sy });
            } else {
                cur.isDraw = false;
            }
        }
    }
}
