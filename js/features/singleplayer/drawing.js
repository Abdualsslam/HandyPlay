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
    // eraseNearby has been removed. Eraser logic is handled via destination-out in renderDrawing.
}

function drawSmoothStroke(strokeObj, targetCtx) {
    var pts = strokeObj.points;
    if (!pts || pts.length < 2) return;
    targetCtx = targetCtx || ctx;
    targetCtx.strokeStyle = strokeObj.color;
    targetCtx.shadowColor = strokeObj.color;
    targetCtx.beginPath();
    targetCtx.moveTo(pts[0].x, pts[0].y);
    if (pts.length === 2) {
        targetCtx.lineTo(pts[1].x, pts[1].y);
    } else {
        for (var i = 1; i < pts.length - 1; i++) {
            var mx = (pts[i].x + pts[i + 1].x) / 2;
            var my = (pts[i].y + pts[i + 1].y) / 2;
            targetCtx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        var last = pts[pts.length - 1];
        targetCtx.lineTo(last.x, last.y);
    }
    targetCtx.stroke();
}

function renderDrawing(lmArr) {
    // Upgrading old formats implicitly
    if (drawStrokes.length > 0 && Array.isArray(drawStrokes[0])) {
        drawStrokes = [];
    }

    // Initialize offscreen canvas if needed
    if (!window.offscreenCanvas || window.offscreenCanvas.width !== c.width || window.offscreenCanvas.height !== c.height) {
        window.offscreenCanvas = document.createElement('canvas');
        window.offscreenCanvas.width = c.width;
        window.offscreenCanvas.height = c.height;
        window.offscreenCtx = window.offscreenCanvas.getContext('2d');
    }

    // Clear offscreen canvas
    window.offscreenCtx.clearRect(0, 0, window.offscreenCanvas.width, window.offscreenCanvas.height);

    // 1. Draw existing strokes to offscreen canvas
    window.offscreenCtx.save();
    window.offscreenCtx.lineCap = 'round';
    window.offscreenCtx.lineJoin = 'round';
    for (var i = 0; i < drawStrokes.length; i++) {
        var stroke = drawStrokes[i];
        if (stroke.isEraser) {
            window.offscreenCtx.globalCompositeOperation = 'destination-out';
            window.offscreenCtx.lineWidth = stroke.eraserRadius * 2;
            window.offscreenCtx.shadowBlur = 0;
            drawSmoothStroke(stroke, window.offscreenCtx);
        } else {
            window.offscreenCtx.globalCompositeOperation = 'source-over';
            window.offscreenCtx.lineWidth = 6;
            window.offscreenCtx.shadowBlur = 15;
            drawSmoothStroke(stroke, window.offscreenCtx);
        }
    }
    window.offscreenCtx.restore();

    // Draw offscreen canvas to main canvas
    ctx.save();
    ctx.drawImage(window.offscreenCanvas, 0, 0);
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

    // 2.5 Draw Eraser Controls UI
    ctx.save();
    var eraserUiY = 140; // below top tools
    var ctrlW = 40;
    var ctrlH = 40;

    // Align with Clear button ('draw_clear' is at startX - btnW - 35)
    var erasStartX = startX - btnW - 35;

    // Eraser Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Cairo';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var textEraserSize = typeof t === 'function' ? t('eraser_size') : 'Eraser Size';
    if (textEraserSize === 'eraser_size') textEraserSize = 'حجم الممحاة';

    // Draw Label text
    ctx.fillText(textEraserSize + ':', erasStartX, eraserUiY + ctrlH / 2);
    var labelWidth = ctx.measureText(textEraserSize + ':').width;

    // (-) Decrease Button
    var decX = erasStartX + labelWidth + 15;
    createBtn('eras_minus', decX, eraserUiY, ctrlW, ctrlH, '', '➖');
    if (updateBtn('eras_minus')) {
        sndSelect();
        if (typeof ERASER_RADIUS === 'undefined') window.ERASER_RADIUS = 30; // safety fallback
        window.ERASER_RADIUS = Math.max(10, window.ERASER_RADIUS - 5);
    }
    drawBtn('eras_minus', { fontSize: 20 });

    // Show current size visually
    var previewX = decX + ctrlW + 15;
    var currentRad = typeof ERASER_RADIUS !== 'undefined' ? ERASER_RADIUS : 30;
    ctx.beginPath();
    ctx.arc(previewX + 25, eraserUiY + ctrlH / 2, currentRad * 0.4, 0, Math.PI * 2); // scale down preview
    ctx.fillStyle = 'rgba(255,100,100,0.8)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // (+) Increase Button
    var incX = previewX + 50 + 15;
    createBtn('eras_plus', incX, eraserUiY, ctrlW, ctrlH, '', '➕');
    if (updateBtn('eras_plus')) {
        sndSelect();
        if (typeof ERASER_RADIUS === 'undefined') window.ERASER_RADIUS = 30;
        window.ERASER_RADIUS = Math.min(100, window.ERASER_RADIUS + 5);
    }
    drawBtn('eras_plus', { fontSize: 20 });

    ctx.restore();

    // 3. Process up to 2 hands for drawing/erasing
    for (var h = 0; h < numHands; h++) {
        var lm = lmArr[h];
        var cur = P[h];
        if (!lm) continue;

        var pointing = isPointing(lm);
        var closedFist = isClosedFist(lm);

        // Don't draw if interacting with UI buttons at top
        var inUiZone = cur.sy < 150;

        if (closedFist && !pointing && !inUiZone) {
            if (!cur.isDraw || !cur.drawCur || !cur.drawCur.isEraser) {
                cur.isDraw = true;
                cur.drawCur = { isEraser: true, color: '#000', points: [], eraserRadius: ERASER_RADIUS };
                drawStrokes.push(cur.drawCur);
            }
            cur.drawCur.points.push({ x: cur.sx, y: cur.sy });

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
                if (!cur.isDraw || (cur.drawCur && cur.drawCur.isEraser)) {
                    cur.isDraw = true;
                    cur.drawCur = { isEraser: false, color: drawColor, points: [] };
                    drawStrokes.push(cur.drawCur);
                }
                cur.drawCur.points.push({ x: cur.sx, y: cur.sy });
            } else {
                cur.isDraw = false;
            }
        }
    }
}
