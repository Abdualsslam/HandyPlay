// =============================================
// MENU SYSTEM — Redesigned with i18n & Descriptions
// =============================================
function getFont(weight, size) {
    return weight + ' ' + size + 'px ' + (LANG === 'ar' ? "'Noto Kufi Arabic', " : '') + 'Outfit';
}

function renderMenu() {
    // Overlay background
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();

    // ---- Language Toggle Button (top-right) ----
    createBtn('lang_toggle', c.width - 130, 12, 115, 36, t('lang_toggle'), '');
    if (updateBtn('lang_toggle')) { sndSelect(); toggleLang(); }
    drawBtn('lang_toggle', { fontSize: 14 });

    // ---- Title ----
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.font = getFont('700', 36);
    ctx.textAlign = 'center';
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 15;
    ctx.fillText(t('choose_mode'), c.width / 2, c.height * 0.09);
    ctx.restore();

    // ---- Layout Calculations ----
    var marginX = 40;
    var marginTop = c.height * 0.12;
    var sectionGap = 14;
    var labelH = 22;
    var instrH = 50;
    var availW = c.width - marginX * 2;
    var availH = c.height - marginTop - instrH - 20;

    // Row 1: 4 singleplayer cards, Row 2: 3 multiplayer cards
    var row1Cols = 4;
    var row2Cols = 3;
    var gap = 16;

    // Calculate card sizes to fill the available space
    var cardW = Math.min(220, (availW - gap * (row1Cols - 1)) / row1Cols);
    var rowH = (availH - labelH * 2 - sectionGap * 2) / 2;
    var cardH = Math.min(150, rowH - gap);

    // ---- Singleplayer Section ----
    var row1W = cardW * row1Cols + gap * (row1Cols - 1);
    var row1X = (c.width - row1W) / 2;
    var row1LabelY = marginTop;
    var row1Y = row1LabelY + labelH + 6;

    // Section label
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = getFont('600', 14);
    ctx.textAlign = 'center';
    ctx.fillText(t('singleplayer'), c.width / 2, row1LabelY);
    ctx.restore();

    // Singleplayer game cards
    var spGames = [
        { id: 'menu_fn', name: t('fruit_ninja'), icon: '🍎', desc: t('desc_fruit_ninja'), action: function () { sndSelect(); fnReset(); switchMode('FRUIT_NINJA'); } },
        { id: 'menu_ts', name: t('target_shooter'), icon: '🎯', desc: t('desc_target_shooter'), action: function () { sndSelect(); tsReset(); switchMode('TARGET_SHOOTER'); } },
        { id: 'menu_draw', name: t('drawing'), icon: '✏️', desc: t('desc_drawing'), action: function () { sndSelect(); switchMode('DRAWING'); } },
        { id: 'menu_ai', name: t('ai_guess'), icon: '🧠', desc: t('desc_ai_guess'), action: function () { sndSelect(); aiReset(); switchMode('AI_DRAW'); } }
    ];

    for (var i = 0; i < spGames.length; i++) {
        var g = spGames[i];
        var gx = row1X + i * (cardW + gap);
        createBtn(g.id, gx, row1Y, cardW, cardH, g.name, g.icon);
        if (updateBtn(g.id)) g.action();
        drawGameCard(g.id, g.desc, g.icon, g.name, gx, row1Y, cardW, cardH);
    }

    // ---- Multiplayer Section ----
    var row2LabelY = row1Y + cardH + sectionGap + 8;
    var row2Y = row2LabelY + labelH + 6;

    // Section label
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = getFont('600', 14);
    ctx.textAlign = 'center';
    ctx.fillText(t('multiplayer'), c.width / 2, row2LabelY);
    ctx.restore();

    var row2W = cardW * row2Cols + gap * (row2Cols - 1);
    var row2X = (c.width - row2W) / 2;

    var mpGames = [
        { id: 'menu_ttt', name: t('tic_tac_toe'), icon: '⚔️', desc: t('desc_tic_tac_toe'), action: function () { sndSelect(); tttReset(); switchMode('TIC_TAC_TOE'); } },
        { id: 'menu_pic', name: t('pictionary'), icon: '🎨', desc: t('desc_pictionary'), action: function () { sndSelect(); picReset(); switchMode('PICTIONARY'); } },
        { id: 'menu_ab', name: t('air_band'), icon: '🎵', desc: t('desc_air_band'), action: function () { sndSelect(); abReset(); switchMode('AIR_BAND'); } }
    ];

    for (var i = 0; i < mpGames.length; i++) {
        var g = mpGames[i];
        var gx = row2X + i * (cardW + gap);
        createBtn(g.id, gx, row2Y, cardW, cardH, g.name, g.icon);
        if (updateBtn(g.id)) g.action();
        drawGameCard(g.id, g.desc, g.icon, g.name, gx, row2Y, cardW, cardH);
    }

    // ---- Usage Instructions ----
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = getFont('400', 14);
    ctx.fillStyle = 'rgba(255,255,255,0.40)';
    var instrY = row2Y + cardH + 24;
    ctx.fillText(t('instructions_cursor'), c.width / 2, instrY);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = getFont('400', 12);
    ctx.fillText(t('instructions_detail'), c.width / 2, instrY + 22);
    ctx.restore();
}

// =============================================
// GAME CARD RENDERER — Icon, Name & Description
// =============================================
function drawGameCard(id, desc, icon, name, x, y, w, h) {
    var b = buttons[id];
    if (!b) return;
    var isHov = b.hovered;

    // Click flash animation
    var clickAge = b.clickAnim ? (Date.now() - b.clickAnim) / 300 : 2;
    var isFlashing = clickAge < 1;

    ctx.save();

    // Shadow & glow
    ctx.shadowColor = (isHov || isFlashing) ? GOLD : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = (isHov || isFlashing) ? 18 : 5;

    // Background with gradient
    var bg;
    if (isFlashing) {
        bg = 'rgba(245,208,97,0.25)';
    } else if (isHov) {
        bg = 'rgba(255,255,255,0.14)';
    } else {
        bg = 'rgba(255,255,255,0.06)';
    }
    ctx.fillStyle = bg;
    roundRect(x, y, w, h, 14);
    ctx.fill();

    // Border
    ctx.strokeStyle = (isHov || isFlashing) ? GOLD : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = (isHov || isFlashing) ? 2 : 1;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Icon (large, centered top area)
    var iconSize = Math.min(32, h * 0.28);
    ctx.font = iconSize + 'px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x + w / 2, y + h * 0.28);

    // Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = getFont('600', Math.min(16, w * 0.09));
    ctx.fillText(name, x + w / 2, y + h * 0.52);

    // Description (smaller, in a muted color)
    ctx.fillStyle = 'rgba(255,255,255,0.40)';
    ctx.font = getFont('400', Math.min(12, w * 0.065));

    // Word-wrap description into the card width
    var maxTextW = w - 20;
    var words = desc.split(' ');
    var lines = [];
    var currentLine = '';
    for (var i = 0; i < words.length; i++) {
        var testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        if (ctx.measureText(testLine).width > maxTextW && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);

    var lineH = Math.min(14, w * 0.075);
    var descStartY = y + h * 0.68;
    for (var i = 0; i < Math.min(2, lines.length); i++) {
        ctx.fillText(lines[i], x + w / 2, descStartY + i * lineH);
    }

    ctx.restore();
}

// =============================================
// TOP BAR
// =============================================
function renderTopBar() {
    ctx.save();
    var barH = 55;
    var gradient = ctx.createLinearGradient(0, 0, 0, barH);
    gradient.addColorStop(0, 'rgba(10,6,2,0.8)');
    gradient.addColorStop(1, 'rgba(10,6,2,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, c.width, barH);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = getFont('600', 16);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var labels = {
        'DRAWING': t('topbar_drawing'),
        'MENU': t('topbar_menu'),
        'FRUIT_NINJA': t('topbar_fruit_ninja'),
        'TIC_TAC_TOE': t('topbar_tic_tac_toe'),
        'TARGET_SHOOTER': t('topbar_target_shooter'),
        'PICTIONARY': t('topbar_pictionary'),
        'AI_DRAW': t('topbar_ai_draw'),
        'AIR_BAND': t('topbar_air_band')
    };
    ctx.fillText(labels[MODE] || MODE, c.width / 2, barH / 2);
    ctx.restore();

    // Navigation button
    if (MODE === 'DRAWING') {
        createBtn('topbar_btn', c.width - 155, 8, 140, 38, t('menu'), '🎮');
        if (updateBtn('topbar_btn')) { sndSelect(); switchMode('MENU'); }
        drawBtn('topbar_btn', { fontSize: 15 });
    } else if (MODE !== 'MENU') {
        createBtn('topbar_btn', 15, 8, 120, 38, t('menu'), '◀');
        if (updateBtn('topbar_btn')) { sndSelect(); switchMode('MENU'); }
        drawBtn('topbar_btn', { fontSize: 15 });
    }
}
