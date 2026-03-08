// =============================================
// GESTURE DETECTION
// =============================================
function isPointing(lm) {
    return lm[8].y < lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
}

function isOpenHand(lm) {
    return lm[8].y < lm[6].y && lm[12].y < lm[10].y && lm[16].y < lm[14].y && lm[20].y < lm[18].y;
}

// 🤏 Pinch: Thumb tip touches index tip (more natural click)
function isPinchGesture(lm) {
    // Use original landmarks for distance (not mirrored)
    var dx = lm[4].x - lm[8].x;
    var dy = lm[4].y - lm[8].y;
    return Math.sqrt(dx * dx + dy * dy) < 0.055; // Slightly larger tolerance for thumb
}
