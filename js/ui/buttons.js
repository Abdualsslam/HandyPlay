// =============================================
// BUTTON SYSTEM (pinch-to-click)
// =============================================
function createBtn(id, x, y, w, h, text, icon) {
    if (!buttons[id] || buttons[id].x !== x || buttons[id].y !== y)
        buttons[id] = { x: x, y: y, w: w, h: h, text: text, icon: icon, hovered: false, clickAnim: 0 };
    else { buttons[id].w = w; buttons[id].h = h; buttons[id].text = text; buttons[id].icon = icon; }
}

function updateBtn(id) {
    var b = buttons[id];
    if (!b) return false;
    if (Date.now() - modeSwitchTime < MODE_SWITCH_COOLDOWN) { b.hovered = false; return false; }

    var hov = false, clk = false;
    for (var h = 0; h < numHands; h++) {
        var cur = P[h];
        if (cur.sx >= b.x && cur.sx <= b.x + b.w && cur.sy >= b.y && cur.sy <= b.y + b.h) {
            hov = true;
            if (cur.pinchJustPressed) clk = true;
        }
    }

    b.hovered = hov;
    if (hov && clk) {
        b.clickAnim = Date.now();
        return true;
    }
    return false;
}

function drawBtn(id, style) {
    var b = buttons[id];
    if (!b) return;
    style = style || {};
    var bgColor = style.bg || 'rgba(255,255,255,0.08)';
    var bgHover = style.bgHover || 'rgba(255,255,255,0.18)';
    var textColor = style.color || '#FFFFFF';
    var isHov = b.hovered;

    // Click flash animation
    var clickAge = b.clickAnim ? (Date.now() - b.clickAnim) / 300 : 2;
    var isFlashing = clickAge < 1;

    ctx.save();
    // Shadow
    ctx.shadowColor = (isHov || isFlashing) ? GOLD : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = (isHov || isFlashing) ? 15 : 5;

    // Background
    ctx.fillStyle = isFlashing ? 'rgba(245,208,97,0.25)' : (isHov ? bgHover : bgColor);
    roundRect(b.x, b.y, b.w, b.h, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = (isHov || isFlashing) ? GOLD : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = (isHov || isFlashing) ? 2 : 1;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Icon + Text
    ctx.fillStyle = textColor;
    ctx.font = '600 ' + (style.fontSize || 18) + 'px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var label = b.icon ? b.icon + '  ' + b.text : b.text;
    ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2);

    ctx.restore();
}
